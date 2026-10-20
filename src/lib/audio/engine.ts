import { SOUND_BY_ID, type Layers, type Sound } from "@/lib/catalog";
import { getNoiseBuffer } from "./noise";
import { loadSoundUrl, silentUrl } from "./sources";

const FADE_IN = 1.5;
const FADE_OUT = 1;
const PAUSE_FADE = 0.4;
const LOOP_CROSSFADE = 2.5;

type AudioSessionType = "auto" | "playback" | "transient" | "transient-solo" | "ambient" | "play-and-record";

/**
 * Safari's Audio Session API (16.4+): a "playback" session behaves like a
 * music app, so audio keeps going in the background and ignores the iPhone's
 * silent switch. Other browsers don't expose it, and this does nothing there.
 */
function claimPlaybackSession() {
  const session = (navigator as Navigator & { audioSession?: { type: AudioSessionType } }).audioSession;
  if (!session || session.type === "playback") return;
  try {
    session.type = "playback";
  } catch {}
}

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

/**
 * An original engine-room hum: detuned low tones breathing through a slowly
 * swept low-pass filter, over band-passed rumble and a faint vent hiss. Every
 * node runs continuously (the noise buffer loops seamlessly), so it never repeats.
 */
function createDroneVoice(ctx: AudioContext, output: GainNode): Voice {
  const sources: AudioScheduledSourceNode[] = [];
  const start = <T extends AudioScheduledSourceNode>(node: T) => {
    node.start();
    sources.push(node);
    return node;
  };
  const lfo = (hz: number, depth: number, target: AudioParam) => {
    const osc = ctx.createOscillator();
    osc.frequency.value = hz;
    const amount = ctx.createGain();
    amount.gain.value = depth;
    osc.connect(amount).connect(target);
    start(osc);
  };

  const body = ctx.createGain();
  body.connect(output);
  lfo(0.11, 0.12, body.gain);

  const tones = ctx.createBiquadFilter();
  tones.type = "lowpass";
  tones.frequency.value = 300;
  tones.Q.value = 0.8;
  tones.connect(body);
  lfo(0.045, 140, tones.frequency);

  const tone = (hz: number, type: OscillatorType, level: number, pan: number) => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = hz;
    const gain = ctx.createGain();
    gain.gain.value = level;
    const panner = ctx.createStereoPanner();
    panner.pan.value = pan;
    osc.connect(gain).connect(panner).connect(tones);
    start(osc);
  };
  tone(27.5, "sine", 0.22, 0);
  tone(55, "sawtooth", 0.1, -0.45);
  tone(55.37, "sawtooth", 0.1, 0.45);
  tone(82.6, "triangle", 0.07, -0.2);
  tone(110.3, "triangle", 0.035, 0.25);

  const noise = (type: BiquadFilterType, hz: number, q: number, level: number) => {
    const source = ctx.createBufferSource();
    source.buffer = getNoiseBuffer(ctx, "brown");
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = hz;
    filter.Q.value = q;
    const gain = ctx.createGain();
    gain.gain.value = level;
    source.connect(filter).connect(gain).connect(body);
    start(source);
  };
  noise("bandpass", 90, 0.9, 1.1);
  noise("highpass", 2200, 0.5, 0.35);

  return {
    output,
    pause() {},
    resume() {},
    dispose() {
      sources.forEach((source) => source.stop());
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
      const { source } = sound;
      entry.voice =
        source.type === "noise"
          ? createNoiseVoice(ctx, source.color, output)
          : source.type === "binaural"
            ? createBinauralVoice(ctx, source.carrier, source.beat, output)
            : createDroneVoice(ctx, output);
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
      claimPlaybackSession();
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
