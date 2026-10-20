import { useSyncExternalStore } from "react";
import { AudioEngine } from "@/lib/audio/engine";
import {
  CATEGORY_BY_ID,
  DEFAULT_PRESET,
  PRESETS,
  SOUNDS,
  SOUND_BY_ID,
  type Layers,
  type Preset,
} from "@/lib/catalog";
import type { PageIntent } from "@/lib/pages";

export type TimerMode = "focus" | "short" | "long";

export interface TimerSettings {
  focus: number;
  short: number;
  long: number;
  longEvery: number;
  autoStart: boolean;
  notify: boolean;
}

export interface TimerState {
  mode: TimerMode;
  status: "idle" | "running" | "paused";
  /** Epoch ms when a running session ends. */
  endsAt: number | null;
  /** Milliseconds left while idle or paused. */
  remaining: number;
  /** Completed focus sessions today. */
  rounds: number;
  day: string;
  settings: TimerSettings;
}

export interface FocusState {
  layers: Layers;
  playing: boolean;
  volume: number;
  /** Volume to return to when unmuting. */
  lastVolume: number;
  loading: string[];
  notice: string | null;
  timer: TimerState;
  hydrated: boolean;
  tab: Tab;
}

export type Tab = "mix" | "sounds" | "timer";

const STORAGE_KEY = "focuship:v1";
export const NEW_LAYER_VOLUME = 0.5;
const MAX_SHUFFLE_LAYERS = 3;

const DEFAULT_TIMER: TimerSettings = {
  focus: 25,
  short: 5,
  long: 15,
  longEvery: 4,
  autoStart: false,
  notify: false,
};

const today = () => new Date().toISOString().slice(0, 10);
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const minutes = (settings: TimerSettings, mode: TimerMode) => settings[mode] * 60_000;

const initialState: FocusState = {
  layers: {},
  playing: false,
  volume: 0.8,
  lastVolume: 0.8,
  loading: [],
  notice: null,
  hydrated: false,
  tab: "mix",
  timer: {
    mode: "focus",
    status: "idle",
    endsAt: null,
    remaining: minutes(DEFAULT_TIMER, "focus"),
    rounds: 0,
    day: "",
    settings: DEFAULT_TIMER,
  },
};

let state = initialState;
const listeners = new Set<() => void>();

const engine = new AudioEngine({
  onLoading(id, loading) {
    const rest = state.loading.filter((x) => x !== id);
    set({ loading: loading ? [...rest, id] : rest }, false);
  },
  onFailed(id) {
    const label = SOUND_BY_ID.get(id)?.label ?? "A sound";
    const layers = { ...state.layers };
    delete layers[id];
    set({ layers, notice: `${label} couldn’t load. Check your connection.` });
  },
});

function set(patch: Partial<FocusState>, syncAudio = true) {
  state = { ...state, ...patch };
  if (syncAudio) engine.sync(state.layers, state.playing, state.volume);
  persist();
  updateMediaSession();
  listeners.forEach((listener) => listener());
}

function persist() {
  if (!state.hydrated) return;
  try {
    const { layers, volume, lastVolume, timer } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ layers, volume, lastVolume, timer }));
  } catch {}
}

// Selectors ------------------------------------------------------------------

const sameKeys = (a: Layers, b: Layers) => {
  const ak = Object.keys(a).sort().join();
  return ak !== "" && ak === Object.keys(b).sort().join();
};

export const matchPreset = (layers: Layers): Preset | undefined =>
  PRESETS.find((preset) => sameKeys(preset.layers, layers));

export function mixName(layers: Layers): string {
  const preset = matchPreset(layers);
  if (preset) return preset.label;
  const labels = Object.keys(layers).map((id) => SOUND_BY_ID.get(id)?.label ?? id);
  if (labels.length <= 2) return labels.join(" + ");
  return `${labels.slice(0, 2).join(" + ")} +${labels.length - 2}`;
}

/** What the ambient backdrop should look like for a mix. */
export interface MixMood {
  /** Hue of the loudest layer's category. */
  hue: number;
  /** Category id of the loudest layer; picks the glyph weather. */
  category: string;
  /** How full the mix sounds (0..1), from layer count and volumes. */
  energy: number;
}

export function mixMood(layers: Layers): MixMood {
  let best: [string, number] | undefined;
  let loudness = 0;
  for (const entry of Object.entries(layers)) {
    loudness += entry[1];
    if (!best || entry[1] > best[1]) best = entry;
  }
  const sound = best && SOUND_BY_ID.get(best[0]);
  return {
    hue: sound ? (CATEGORY_BY_ID.get(sound.category)?.hue ?? 22) : 22,
    category: sound?.category ?? "generated",
    energy: Math.min(1, loudness / 2),
  };
}

// Sharing --------------------------------------------------------------------

export const encodeMix = (layers: Layers) =>
  Object.entries(layers)
    .map(([id, v]) => `${id}:${Math.round(v * 100)}`)
    .join(",");

export function decodeMix(value: string): Layers {
  const layers: Layers = {};
  for (const part of value.split(",")) {
    const [id, raw] = part.split(":");
    if (!SOUND_BY_ID.has(id)) continue;
    const n = Number(raw);
    layers[id] = Number.isFinite(n) && raw !== "" ? clamp(n / 100) : NEW_LAYER_VOLUME;
  }
  return layers;
}

export function shareUrl(): string {
  const url = new URL("/", location.origin);
  url.searchParams.set("mix", encodeMix(state.layers));
  return url.href;
}

// Media session --------------------------------------------------------------

let mediaHandlers = false;

function updateMediaSession() {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
  const session = navigator.mediaSession;
  const hasMix = Object.keys(state.layers).length > 0;
  if (!mediaHandlers && hasMix) {
    mediaHandlers = true;
    session.setActionHandler("play", () => actions.play());
    session.setActionHandler("pause", () => actions.pause());
    session.setActionHandler("stop", () => actions.pause());
  }
  if (!mediaHandlers) return;
  session.metadata = hasMix
    ? new MediaMetadata({
        title: mixName(state.layers),
        artist: "Focuship",
        album: "Ambient mix",
        artwork: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      })
    : null;
  session.playbackState = state.playing ? "playing" : hasMix ? "paused" : "none";
}

// Timer ----------------------------------------------------------------------

let tick: ReturnType<typeof setInterval> | undefined;

function watchTimer() {
  clearInterval(tick);
  if (state.timer.status !== "running") return;
  tick = setInterval(() => {
    const { endsAt } = state.timer;
    if (endsAt && Date.now() >= endsAt) finishSession();
  }, 500);
}

function nextMode(timer: TimerState, rounds: number): TimerMode {
  if (timer.mode !== "focus") return "focus";
  return rounds % timer.settings.longEvery === 0 ? "long" : "short";
}

function finishSession() {
  const { timer } = state;
  const rounds = timer.mode === "focus" ? timer.rounds + 1 : timer.rounds;
  const mode = nextMode(timer, rounds);
  const duration = minutes(timer.settings, mode);
  const auto = timer.settings.autoStart;

  engine.chime();
  navigator.vibrate?.([180, 90, 180]);
  notify(
    timer.mode === "focus" ? "Focus session done" : "Break is over",
    timer.mode === "focus"
      ? `Nice work. Take ${timer.settings[mode]} minutes.`
      : "Ready for the next session?",
  );

  set(
    {
      timer: {
        ...timer,
        mode,
        rounds,
        status: auto ? "running" : "idle",
        endsAt: auto ? Date.now() + duration : null,
        remaining: duration,
      },
    },
    false,
  );
  watchTimer();
}

function notify(title: string, body: string) {
  if (!state.timer.settings.notify || !document.hidden) return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  navigator.serviceWorker?.getRegistration().then((reg) => {
    const options = { body, icon: "/icons/icon-192.png", badge: "/icons/badge-96.png", tag: "timer" };
    if (reg) reg.showNotification(title, options);
    else new Notification(title, options);
  });
}

function setTimer(patch: Partial<TimerState>) {
  set({ timer: { ...state.timer, ...patch } }, false);
  watchTimer();
}

/** Milliseconds left on the timer at a given moment. */
export const timerRemaining = (timer: TimerState, now: number) =>
  timer.status === "running" && timer.endsAt ? Math.max(0, timer.endsAt - now) : timer.remaining;

function readyNotice(label: string | undefined, layers: Layers, timerOnly = false) {
  if (!label) return null;
  if (timerOnly) return `${label} is set. Press start when you’re ready.`;
  return Object.keys(layers).length ? `${label} is ready. Tap play to listen.` : null;
}

// Actions --------------------------------------------------------------------

const haptic = () => navigator.vibrate?.(8);

export const actions = {
  /** Restores saved state. URL params win, then the landing page's intent, then saved state. */
  hydrate(intent?: PageIntent) {
    if (state.hydrated) return;
    let saved: Partial<FocusState> = {};
    let firstVisit = false;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      firstVisit = raw === null;
      saved = JSON.parse(raw ?? "{}");
    } catch {}

    const url = new URL(location.href);
    const shared = url.searchParams.get("mix");
    const preset = PRESETS.find((p) => p.id === url.searchParams.get("preset"));
    const wantedTab = url.searchParams.get("tab");
    const tab: Tab = wantedTab === "sounds" || wantedTab === "timer" ? wantedTab : (intent?.tab ?? "mix");
    let layers: Layers = saved.layers ?? {};
    if (shared) layers = decodeMix(shared);
    else if (preset) layers = { ...preset.layers };
    else if (intent?.layers) layers = { ...intent.layers };
    // A first-time visitor on a page with nothing to load gets a random preset, not a blank mixer.
    else if (firstVisit && !intent) layers = { ...PRESETS[Math.floor(Math.random() * PRESETS.length)].layers };
    if (url.search) {
      ["mix", "preset", "tab", "source"].forEach((key) => url.searchParams.delete(key));
      history.replaceState(history.state, "", url);
    }
    layers = Object.fromEntries(Object.entries(layers).filter(([id]) => SOUND_BY_ID.has(id)));

    let timer: TimerState = { ...initialState.timer, ...saved.timer };
    timer.settings = { ...DEFAULT_TIMER, ...timer.settings };
    if (timer.day !== today()) timer = { ...timer, rounds: 0, day: today() };
    if (timer.status === "running" && timer.endsAt && timer.endsAt <= Date.now()) {
      timer = { ...timer, status: "idle", endsAt: null, remaining: minutes(timer.settings, timer.mode) };
    }
    // A timer page sets its lengths, but never interrupts a session that's already running.
    if (intent?.timer && timer.status !== "running") {
      const settings = { ...timer.settings, ...intent.timer };
      timer = { ...timer, settings, mode: "focus", status: "idle", endsAt: null, remaining: minutes(settings, "focus") };
    }

    state = {
      ...state,
      layers,
      volume: typeof saved.volume === "number" ? clamp(saved.volume) : state.volume,
      lastVolume: typeof saved.lastVolume === "number" ? clamp(saved.lastVolume) || 0.8 : 0.8,
      timer,
      hydrated: true,
      tab,
      notice:
        shared || preset
          ? readyNotice(shared ? "Shared mix" : preset!.label, layers)
          : readyNotice(intent?.label, layers, Boolean(intent?.timer && !intent.layers)),
    };
    set({}, false);
    watchTimer();
  },

  /** Applies a page's intent on client-side navigation; falls back to hydrate on the first visit. */
  visit(intent?: PageIntent) {
    if (!state.hydrated) return actions.hydrate(intent);
    const tab: Tab = intent?.tab ?? "mix";
    if (tab !== state.tab) actions.setTab(tab);
    if (intent?.layers) {
      const layers = Object.fromEntries(Object.entries(intent.layers).filter(([id]) => SOUND_BY_ID.has(id)));
      set({ layers, notice: readyNotice(intent.label, layers) });
    }
    if (intent?.timer && state.timer.status !== "running") {
      const settings = { ...state.timer.settings, ...intent.timer };
      set({
        timer: { ...state.timer, settings, mode: "focus", status: "idle", endsAt: null, remaining: minutes(settings, "focus") },
        ...(intent.layers ? {} : { notice: readyNotice(intent.label, state.layers, true) }),
      });
    }
  },

  play() {
    if (!Object.keys(state.layers).length) state = { ...state, layers: { ...DEFAULT_PRESET.layers } };
    set({ playing: true });
  },

  pause() {
    set({ playing: false });
  },

  toggle() {
    haptic();
    if (state.playing) actions.pause();
    else actions.play();
  },

  toggleSound(id: string) {
    haptic();
    const layers = { ...state.layers };
    if (id in layers) {
      delete layers[id];
      set({ layers, playing: state.playing && Object.keys(layers).length > 0 });
    } else if (SOUND_BY_ID.has(id)) {
      layers[id] = NEW_LAYER_VOLUME;
      set({ layers, playing: true });
    }
  },

  setLayerVolume(id: string, volume: number) {
    if (!(id in state.layers)) {
      if (!SOUND_BY_ID.has(id)) return;
      haptic();
      set({ layers: { ...state.layers, [id]: clamp(volume) }, playing: true });
      return;
    }
    set({ layers: { ...state.layers, [id]: clamp(volume) } });
  },

  applyPreset(layers: Layers) {
    haptic();
    set({ layers: { ...layers }, playing: true });
  },

  shuffle() {
    haptic();
    const pool = SOUNDS.filter((s) => s.source.type === "file");
    const picked = new Set<string>();
    while (picked.size < MAX_SHUFFLE_LAYERS) picked.add(pool[Math.floor(Math.random() * pool.length)].id);
    const layers = Object.fromEntries(
      [...picked].map((id) => [id, Math.round((0.3 + Math.random() * 0.4) * 100) / 100]),
    );
    set({ layers, playing: true });
  },

  clear() {
    haptic();
    set({ layers: {}, playing: false });
  },

  setVolume(volume: number) {
    const v = clamp(volume);
    set({ volume: v, lastVolume: v > 0 ? v : state.lastVolume });
  },

  toggleMute() {
    haptic();
    actions.setVolume(state.volume > 0 ? 0 : state.lastVolume || 0.8);
  },

  setTab(tab: Tab) {
    if (tab !== state.tab) haptic();
    set({ tab }, false);
  },

  dismissNotice() {
    set({ notice: null }, false);
  },

  showNotice(notice: string) {
    set({ notice }, false);
  },

  startTimer() {
    haptic();
    const { timer } = state;
    if (timer.settings.notify && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    setTimer({ status: "running", endsAt: Date.now() + timer.remaining });
  },

  pauseTimer() {
    haptic();
    setTimer({ status: "paused", remaining: timerRemaining(state.timer, Date.now()), endsAt: null });
  },

  resetTimer() {
    haptic();
    setTimer({ status: "idle", endsAt: null, remaining: minutes(state.timer.settings, state.timer.mode) });
  },

  skipTimer() {
    haptic();
    const mode = nextMode(state.timer, state.timer.rounds);
    setTimer({ mode, status: "idle", endsAt: null, remaining: minutes(state.timer.settings, mode) });
  },

  setTimerMode(mode: TimerMode) {
    haptic();
    setTimer({ mode, status: "idle", endsAt: null, remaining: minutes(state.timer.settings, mode) });
  },

  updateTimerSettings(patch: Partial<TimerSettings>) {
    const settings = { ...state.timer.settings, ...patch };
    const idle = state.timer.status === "idle";
    setTimer({ settings, remaining: idle ? minutes(settings, state.timer.mode) : state.timer.remaining });
  },
};

// React binding --------------------------------------------------------------

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useFocus<T>(select: (s: FocusState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => select(state),
    () => select(initialState),
  );
}
