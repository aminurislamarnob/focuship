import { SOUND_BY_ID, type Layers, type Sound } from "@/lib/catalog";
import { getNoiseBuffer } from "./noise";
import { loadSoundUrl, silentUrl } from "./sources";

const FADE_IN = 1.5;
const FADE_OUT = 1;
const PAUSE_FADE = 0.4;
const LOOP_CROSSFADE = 2.5;

/** Perceptual volume curve: sliders feel linear to the ear. */
export const perceived = (v: number) => v * v;

interface Voice {
  output: GainNode;
  pause(): void;
  resume(): void;
  dispose(): void;
}

interface EngineCallbacks {
  onLoading(id: string, loading: boolean): void;
  onFailed(id: string): void;
}

function ramp(param: AudioParam, ctx: AudioContext, to: number, seconds: number) {
  const now = ctx.currentTime;
  param.cancelScheduledValues(now);
  param.setValueAtTime(param.value, now);
  param.linearRampToValueAtTime(to, now + seconds);
}

const equalPowerIn = Float32Array.from({ length: 48 }, (_, i) =>
  Math.sin((i / 47) * (Math.PI / 2)),
);
const equalPowerOut = Float32Array.from(equalPowerIn).reverse();

/**
 * Two media elements play the same file and crossfade near the end, which
 * hides the gap most mp3 loops have. Elements are started inside the user
 * gesture on a silent clip so mobile browsers allow later playback.
 */
function createFileVoice(
  ctx: AudioContext,
  url: string,
  output: GainNode,
  events: { ready(): void; failed(): void },
): Voice {
  const decks = [0, 1].map((i) => {
    const el = new Audio(silentUrl());
    el.preload = "auto";
    const gain = ctx.createGain();
    gain.gain.value = i === 0 ? 1 : 0;
    ctx.createMediaElementSource(el).connect(gain).connect(output);
    return { el, gain };
  });
  let active = 0;
  let fadeTimer: ReturnType<typeof setTimeout> | undefined;
  let fading = false;
  let loaded = false;
  let paused = false;
  let disposed = false;

  const crossfade = () => {
    if (fading || paused || disposed) return;
    const from = decks[active];
    const to = decks[1 - active];
    const left = from.el.duration - from.el.currentTime;
    const length = Math.max(0.05, Math.min(LOOP_CROSSFADE, left || 0));
    fading = true;
    to.el.currentTime = 0;
    to.el.play().catch(() => {});
    const now = ctx.currentTime;
    from.gain.gain.cancelScheduledValues(now);
    to.gain.gain.cancelScheduledValues(now);
    to.gain.gain.setValueCurveAtTime(equalPowerIn, now, length);
    from.gain.gain.setValueCurveAtTime(equalPowerOut, now, length);
    fadeTimer = setTimeout(() => {
      from.el.pause();
      active = 1 - active;
      fading = false;
    }, length * 1000 + 50);
  };

  const settle = () => {
    clearTimeout(fadeTimer);
    if (fading) {
      decks[active].el.pause();
      active = 1 - active;
      fading = false;
    }
    const now = ctx.currentTime;
    decks.forEach((deck, i) => {
      deck.gain.gain.cancelScheduledValues(now);
      deck.gain.gain.setValueAtTime(i === active ? 1 : 0, now);
    });
  };

  decks.forEach((deck, i) => {
    deck.el.addEventListener("timeupdate", () => {
      if (loaded && i === active && deck.el.duration - deck.el.currentTime <= LOOP_CROSSFADE) {
        crossfade();
      }
    });
    deck.el.addEventListener("ended", () => {
      if (loaded && i === active) crossfade();
    });
    deck.el.play().catch(() => {});
  });

  loadSoundUrl(url).then(
    (src) => {
      if (disposed) return;
      const first = decks[0].el;
      first.addEventListener("canplaythrough", () => events.ready(), { once: true });
      first.addEventListener("error", () => events.failed(), { once: true });
      decks.forEach((deck) => (deck.el.src = src));
      loaded = true;
      if (!paused) first.play().catch(() => {});
    },
    () => !disposed && events.failed(),
  );

  return {
    output,
    pause() {
      paused = true;
      settle();
      decks.forEach((deck) => deck.el.pause());
    },
    resume() {
      paused = false;
      if (loaded) decks[active].el.play().catch(() => {});
    },
    dispose() {
      disposed = true;
      clearTimeout(fadeTimer);
      decks.forEach((deck) => {
        deck.el.pause();
        deck.el.removeAttribute("src");
        deck.el.load();
      });
      output.disconnect();
    },
  };
}

function createNoiseVoice(ctx: AudioContext, color: "white" | "pink" | "brown", output: GainNode): Voice {
  const source = ctx.createBufferSource();
  source.buffer = getNoiseBuffer(ctx, color);
  source.loop = true;
  source.connect(output);
  source.start();
  return {
    output,
    pause() {},
    resume() {},
    dispose() {
      source.stop();
      output.disconnect();
    },
  };
}

function createBinauralVoice(ctx: AudioContext, carrier: number, beat: number, output: GainNode): Voice {
  const oscillators = [-1, 1].map((side) => {
    const osc = ctx.createOscillator();
    osc.frequency.value = carrier + (side * beat) / 2;
    const pan = ctx.createStereoPanner();
    pan.pan.value = side;
    osc.connect(pan).connect(output);
    osc.start();
    return osc;
  });
  return {
    output,
    pause() {},
    resume() {},
    dispose() {
      oscillators.forEach((osc) => osc.stop());
      output.disconnect();
    },
  };
}

export class AudioEngine {
  private ctx?: AudioContext;
  private master?: GainNode;
  private voices = new Map<string, { voice: Voice; loading: boolean; level: number }>();
  private keepAlive?: HTMLAudioElement;
  private suspendTimer?: ReturnType<typeof setTimeout>;
  private playing = false;

  constructor(private callbacks: EngineCallbacks) {}

  private ensure() {
    if (!this.ctx) {
      const ctx = new AudioContext({ latencyHint: "playback" });
      const master = ctx.createGain();
      master.gain.value = 0;
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -12;
      limiter.ratio.value = 4;
      master.connect(limiter).connect(ctx.destination);
      this.ctx = ctx;
      this.master = master;
    }
    return { ctx: this.ctx, master: this.master! };
  }

  /** The gain a layer should sit at, including the sound's loudness trim. */
  private layerGain(sound: Sound, volume: number) {
    return perceived(volume) * sound.gain;
  }

  private startVoice(id: string, sound: Sound, volume: number) {
    const { ctx, master } = this.ensure();
    const output = ctx.createGain();
    output.gain.value = 0;
    output.connect(master);
    const target = this.layerGain(sound, volume);
    const entry = { voice: undefined as unknown as Voice, loading: false, level: target };

    if (sound.source.type === "file") {
      entry.loading = true;
      this.callbacks.onLoading(id, true);
      entry.voice = createFileVoice(ctx, sound.source.path, output, {
        ready: () => {
          if (this.voices.get(id) !== entry) return;
          entry.loading = false;
          this.callbacks.onLoading(id, false);
          ramp(output.gain, ctx, entry.level, FADE_IN);
        },
        failed: () => {
          if (this.voices.get(id) !== entry) return;
          entry.loading = false;
          this.callbacks.onLoading(id, false);
          this.stopVoice(id);
          this.callbacks.onFailed(id);
        },
      });
    } else {
      entry.voice =
        sound.source.type === "noise"
          ? createNoiseVoice(ctx, sound.source.color, output)
          : createBinauralVoice(ctx, sound.source.carrier, sound.source.beat, output);
      ramp(output.gain, ctx, target, FADE_IN);
    }
    this.voices.set(id, entry);
  }

  private stopVoice(id: string) {
    const entry = this.voices.get(id);
    if (!entry || !this.ctx) return;
    this.voices.delete(id);
    const fade = this.playing ? FADE_OUT : 0.02;
    ramp(entry.voice.output.gain, this.ctx, 0, fade);
    setTimeout(() => entry.voice.dispose(), fade * 1000 + 80);
  }

  /**
   * Bring the running voices in line with the requested mix. Call it from the
   * user's tap handler: mobile browsers only start audio inside a gesture.
   */
  sync(layers: Layers, playing: boolean, masterVolume: number) {
    if (!playing && !this.ctx) return;
    const { ctx, master } = this.ensure();

    for (const id of [...this.voices.keys()]) {
      if (!(id in layers)) this.stopVoice(id);
    }

    if (playing) {
      clearTimeout(this.suspendTimer);
      ctx.resume().catch(() => {});
      this.startKeepAlive();
    }

    for (const [id, volume] of Object.entries(layers)) {
      const sound = SOUND_BY_ID.get(id);
      if (!sound) continue;
      const entry = this.voices.get(id);
      if (!entry) {
        if (playing) this.startVoice(id, sound, volume);
        continue;
      }
      entry.level = this.layerGain(sound, volume);
      if (!entry.loading) ramp(entry.voice.output.gain, ctx, entry.level, 0.08);
      if (playing && !this.playing) entry.voice.resume();
    }

    if (playing) {
      ramp(master.gain, ctx, perceived(masterVolume), this.playing ? 0.08 : 0.6);
    } else if (this.playing) {
      ramp(master.gain, ctx, 0, PAUSE_FADE);
      this.suspendTimer = setTimeout(() => {
        this.voices.forEach((entry) => entry.voice.pause());
        this.keepAlive?.pause();
        ctx.suspend().catch(() => {});
      }, PAUSE_FADE * 1000 + 60);
    }
    this.playing = playing;
  }

  /**
   * A looping silent element keeps the page's media session alive, so
   * playback continues with the screen locked and shows up in OS controls.
   */
  private startKeepAlive() {
    if (!this.keepAlive) {
      this.keepAlive = new Audio(silentUrl());
      this.keepAlive.loop = true;
    }
    this.keepAlive.play().catch(() => {});
  }

  /** A soft two-note bell, used when a timer session ends. */
  chime() {
    const { ctx } = this.ensure();
    ctx.resume().catch(() => {});
    const out = ctx.createGain();
    out.gain.value = 0.5;
    out.connect(ctx.destination);
    [659.25, 987.77].forEach((freq, i) => {
      const at = ctx.currentTime + i * 0.28;
      for (const [ratio, level, decay] of [
        [1, 0.3, 2.4],
        [2.76, 0.08, 1.1],
        [5.4, 0.03, 0.6],
      ]) {
        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        osc.frequency.value = freq * ratio;
        env.gain.setValueAtTime(0.0001, at);
        env.gain.exponentialRampToValueAtTime(level, at + 0.01);
        env.gain.exponentialRampToValueAtTime(0.0001, at + decay);
        osc.connect(env).connect(out);
        osc.start(at);
        osc.stop(at + decay + 0.05);
      }
    });
    setTimeout(() => out.disconnect(), 3500);
  }
}
