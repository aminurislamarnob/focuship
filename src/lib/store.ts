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
import {
  newerSettings,
  PRESET_LIMIT,
  type CloudSettings,
  type CloudUser,
  type CustomPreset,
  type Provider,
} from "@/lib/cloud";
import type { PageIntent } from "@/lib/pages";
import { getCloud } from "@/lib/supabase";

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

/** The signed-in slice: who you are plus your cloud-backed favorites and presets. */
export interface AccountState {
  user: CloudUser | null;
  /** Auth has resolved at least once this session (cached data shows before then). */
  ready: boolean;
  /** Favorite refs: a built-in preset id or a custom preset uuid. */
  favorites: string[];
  presets: CustomPreset[];
}

/** A preset opened from a `?p=<uuid>` share link, offered for copying. */
export interface SharedPreset {
  id: string;
  label: string;
  layers: Layers;
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
  account: AccountState;
  /** Recently applied preset refs, newest first. Local-only, works signed out. */
  recents: string[];
  shared: SharedPreset | null;
  /** Epoch ms of the last local settings change: the LWW clock for settings sync. */
  settingsUpdatedAt: number;
}

export type Tab = "mix" | "sounds" | "timer";

const STORAGE_KEY = "focuship:v1";
export const NEW_LAYER_VOLUME = 0.5;
const MAX_SHUFFLE_LAYERS = 3;
const MAX_RECENTS = 8;
/** How long settings changes settle before one write goes to the cloud. */
const SETTINGS_PUSH_MS = 1200;

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
  account: { user: null, ready: false, favorites: [], presets: [] },
  recents: [],
  shared: null,
  settingsUpdatedAt: 0,
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
    const { layers, volume, lastVolume, timer, recents, settingsUpdatedAt, account } = state;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        layers,
        volume,
        lastVolume,
        timer,
        recents,
        settingsUpdatedAt,
        // Cached so favorites and custom presets still render offline; auth re-verifies on load.
        account: { user: account.user, favorites: account.favorites, presets: account.presets },
      }),
    );
  } catch {}
}

// Selectors ------------------------------------------------------------------

const sameKeys = (a: Layers, b: Layers) => {
  const ak = Object.keys(a).sort().join();
  return ak !== "" && ak === Object.keys(b).sort().join();
};

const asPreset = (preset: CustomPreset): Preset => ({
  id: preset.id,
  label: preset.label,
  blurb: "Your preset",
  layers: preset.layers,
});

export const matchPreset = (layers: Layers): Preset | undefined =>
  PRESETS.find((preset) => sameKeys(preset.layers, layers)) ??
  state.account.presets.filter((preset) => sameKeys(preset.layers, layers)).map(asPreset)[0];

/** A preset by ref — catalog id or custom uuid — for favorites and recents. */
export const presetByRef = (ref: string, presets: CustomPreset[]): Preset | undefined => {
  const builtIn = PRESETS.find((preset) => preset.id === ref);
  if (builtIn) return builtIn;
  const custom = presets.find((preset) => preset.id === ref);
  return custom && asPreset(custom);
};

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

// Cloud ------------------------------------------------------------------------
// All Supabase traffic goes through the gateway (lib/cloud via lib/supabase).
// Local state updates first; cloud writes follow and roll back on failure.

let watchingAuth = false;
let settingsPush: ReturnType<typeof setTimeout> | undefined;

const errorNotice = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);

const setAccount = (patch: Partial<AccountState>) => set({ account: { ...state.account, ...patch } }, false);

function connectCloud() {
  if (watchingAuth) return;
  watchingAuth = true;
  const cloud = getCloud();
  if (!cloud) {
    setAccount({ ready: true });
    return;
  }
  cloud.onAuthChange((user) => {
    if (!user) {
      // No session (signed out, expired, or deleted): drop the cloud slices.
      setAccount({ user: null, ready: true, favorites: [], presets: [] });
      return;
    }
    setAccount({ user, ready: true });
    refreshCloud(user.id);
  });
}

/** Pulls favorites, presets and settings after sign-in; keeps the cache when offline. */
async function refreshCloud(userId: string) {
  const cloud = getCloud();
  if (!cloud) return;
  try {
    const [favorites, presets, cloudSettings] = await Promise.all([
      cloud.listFavorites(),
      cloud.listPresets(),
      cloud.getSettings(userId),
    ]);
    if (state.account.user?.id !== userId) return;
    setAccount({ favorites, presets });
    applySettingsSync(cloudSettings);
  } catch {
    // Offline or flaky network: the cached copy stays on screen.
  }
}

/** Last write wins across devices: the newer of (local, cloud) settings applies everywhere. */
function applySettingsSync(cloudSettings: CloudSettings | null) {
  const local: CloudSettings = { timer: state.timer.settings, volume: state.volume, updatedAt: state.settingsUpdatedAt };
  if (newerSettings(local, cloudSettings) === "cloud" && cloudSettings) {
    const settings = { ...DEFAULT_TIMER, ...(cloudSettings.timer as Partial<TimerSettings>) };
    const volume = clamp(cloudSettings.volume);
    const idle = state.timer.status === "idle";
    set({
      volume,
      lastVolume: volume > 0 ? volume : state.lastVolume,
      settingsUpdatedAt: cloudSettings.updatedAt,
      timer: {
        ...state.timer,
        settings,
        remaining: idle ? minutes(settings, state.timer.mode) : state.timer.remaining,
      },
    });
  } else if (local.updatedAt > (cloudSettings?.updatedAt ?? 0)) {
    pushSettingsSoon();
  }
}

/** Debounced upsert so slider drags cost one write, not hundreds. */
function pushSettingsSoon() {
  const cloud = getCloud();
  if (!cloud || !state.account.user) return;
  clearTimeout(settingsPush);
  settingsPush = setTimeout(() => {
    const user = state.account.user;
    if (!user) return;
    cloud
      .pushSettings(user.id, { timer: state.timer.settings, volume: state.volume, updatedAt: state.settingsUpdatedAt })
      .catch(() => {});
  }, SETTINGS_PUSH_MS);
}

/** Applies a `?p=<uuid>` share link once hydration has stripped it from the URL. */
async function loadShared(id: string) {
  const cloud = getCloud();
  if (!cloud) return;
  try {
    const preset = await cloud.fetchSharedPreset(id);
    if (!preset) {
      set({ notice: "That shared preset is no longer available." }, false);
      return;
    }
    const layers = Object.fromEntries(Object.entries(preset.layers).filter(([sid]) => SOUND_BY_ID.has(sid)));
    set({ layers, shared: { ...preset, layers }, notice: readyNotice(preset.label, layers) });
  } catch {
    set({ notice: "Couldn’t load that shared preset." }, false);
  }
}

/** Optimistically saves a preset; rolls back and explains if the cloud write fails. */
function savePreset(label: string, layers: Layers): boolean {
  const cloud = getCloud();
  const user = state.account.user;
  if (!cloud || !user) return false;
  const trimmed = label.trim();
  if (!trimmed || !Object.keys(layers).length) return true;
  if (state.account.presets.length >= PRESET_LIMIT) {
    actions.showNotice(`You've reached ${PRESET_LIMIT} saved presets. Delete one to save another.`);
    return true;
  }
  const preset: CustomPreset = { id: crypto.randomUUID(), label: trimmed, layers: { ...layers }, isPublic: false };
  setAccount({ presets: [preset, ...state.account.presets] });
  set({ notice: "Saved to your presets." }, false);
  cloud.createPreset(user.id, preset).catch((e) => {
    setAccount({ presets: state.account.presets.filter((p) => p.id !== preset.id) });
    actions.showNotice(errorNotice(e, "Couldn’t save your preset."));
  });
  return true;
}

const bumpRecents = (ref: string) => [ref, ...state.recents.filter((r) => r !== ref)].slice(0, MAX_RECENTS);

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
    const sharedPresetId = url.searchParams.get("p");
    const wantedTab = url.searchParams.get("tab");
    const tab: Tab = wantedTab === "sounds" || wantedTab === "timer" ? wantedTab : (intent?.tab ?? "mix");
    let layers: Layers = saved.layers ?? {};
    if (shared) layers = decodeMix(shared);
    else if (preset) layers = { ...preset.layers };
    else if (intent?.layers) layers = { ...intent.layers };
    // A first-time visitor on a page with nothing to load gets a random preset, not a blank mixer.
    else if (firstVisit && !intent && !sharedPresetId) layers = { ...PRESETS[Math.floor(Math.random() * PRESETS.length)].layers };
    if (url.search) {
      ["mix", "preset", "tab", "source", "p"].forEach((key) => url.searchParams.delete(key));
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

    const cached = (saved as { account?: Partial<AccountState> }).account;
    const recents = Array.isArray(saved.recents) ? saved.recents.filter((r): r is string => typeof r === "string") : [];

    state = {
      ...state,
      layers,
      volume: typeof saved.volume === "number" ? clamp(saved.volume) : state.volume,
      lastVolume: typeof saved.lastVolume === "number" ? clamp(saved.lastVolume) || 0.8 : 0.8,
      timer,
      hydrated: true,
      tab,
      recents: recents.slice(0, MAX_RECENTS),
      settingsUpdatedAt: typeof saved.settingsUpdatedAt === "number" ? saved.settingsUpdatedAt : 0,
      account: {
        user: cached?.user ?? null,
        ready: false,
        favorites: Array.isArray(cached?.favorites) ? cached.favorites : [],
        presets: Array.isArray(cached?.presets) ? cached.presets : [],
      },
      notice:
        shared || preset
          ? readyNotice(shared ? "Shared mix" : preset!.label, layers)
          : readyNotice(intent?.label, layers, Boolean(intent?.timer && !intent.layers)),
    };
    set({}, false);
    watchTimer();
    connectCloud();
    if (sharedPresetId) loadShared(sharedPresetId);
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

  applyPreset(layers: Layers, ref?: string) {
    haptic();
    set({ layers: { ...layers }, playing: true, ...(ref ? { recents: bumpRecents(ref) } : {}) });
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
    set({ volume: v, lastVolume: v > 0 ? v : state.lastVolume, settingsUpdatedAt: Date.now() });
    pushSettingsSoon();
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
    set({ settingsUpdatedAt: Date.now() }, false);
    setTimer({ settings, remaining: idle ? minutes(settings, state.timer.mode) : state.timer.remaining });
    pushSettingsSoon();
  },

  // Account ------------------------------------------------------------------

  async signIn(provider: Provider) {
    const cloud = getCloud();
    if (!cloud) return;
    try {
      await cloud.signIn(provider, `${location.origin}/`);
    } catch (e) {
      actions.showNotice(errorNotice(e, "Couldn’t start sign-in."));
    }
  },

  /** Completes sign-in with an ID token from Google's own button; onAuthChange takes it from there. */
  async signInWithGoogleToken(token: string, nonce: string) {
    const cloud = getCloud();
    if (!cloud) return;
    try {
      await cloud.signInWithGoogleToken(token, nonce);
    } catch (e) {
      actions.showNotice(errorNotice(e, "Couldn’t sign in with Google."));
    }
  },

  /** Emails a sign-in code. Resolves to an error message for the form, or null when sent. */
  async sendEmailCode(email: string, captchaToken: string): Promise<string | null> {
    const cloud = getCloud();
    if (!cloud) return "Accounts are off in this build.";
    try {
      await cloud.sendEmailCode(email, captchaToken);
      return null;
    } catch (e) {
      return errorNotice(e, "Couldn’t send the code.");
    }
  },

  /** Signs in with the emailed code. Resolves to an error message, or null on success. */
  async verifyEmailCode(email: string, code: string): Promise<string | null> {
    const cloud = getCloud();
    if (!cloud) return "Accounts are off in this build.";
    try {
      await cloud.verifyEmailCode(email, code); // onAuthChange fills in the account.
      return null;
    } catch (e) {
      return errorNotice(e, "Couldn’t check the code.");
    }
  },

  async signOut() {
    const cloud = getCloud();
    if (!cloud) return;
    try {
      await cloud.signOut(); // onAuthChange clears the account slices.
    } catch (e) {
      actions.showNotice(errorNotice(e, "Couldn’t sign out."));
    }
  },

  /** Deletes the auth user and all their rows (presets, favorites, settings). */
  async deleteAccount(): Promise<boolean> {
    const cloud = getCloud();
    if (!cloud || !state.account.user) return false;
    try {
      await cloud.deleteAccount();
      setAccount({ user: null, favorites: [], presets: [] });
      actions.showNotice("Your account and its data are deleted.");
      return true;
    } catch (e) {
      actions.showNotice(errorNotice(e, "Couldn’t delete your account."));
      return false;
    }
  },

  /** Returns false while signed out so the caller can route to /account instead. */
  toggleFavorite(ref: string): boolean {
    const cloud = getCloud();
    const user = state.account.user;
    if (!cloud || !user) return false;
    haptic();
    const had = state.account.favorites.includes(ref);
    setAccount({ favorites: had ? state.account.favorites.filter((r) => r !== ref) : [...state.account.favorites, ref] });
    (had ? cloud.removeFavorite(user.id, ref) : cloud.addFavorite(user.id, ref)).catch((e) => {
      setAccount({
        favorites: had ? [...state.account.favorites, ref] : state.account.favorites.filter((r) => r !== ref),
      });
      actions.showNotice(errorNotice(e, "Couldn’t update that favorite."));
    });
    return true;
  },

  /** Saves the current mix under a name. Returns false while signed out. */
  saveCurrentPreset(label: string): boolean {
    return savePreset(label, state.layers);
  },

  /** Keeps a copy of the shared preset currently loaded from a `?p=` link. */
  saveSharedCopy(): boolean {
    const shared = state.shared;
    if (!shared) return true;
    const saved = savePreset(shared.label, shared.layers);
    if (saved) set({ shared: null }, false);
    return saved;
  },

  dismissShared() {
    set({ shared: null }, false);
  },

  renamePreset(id: string, label: string) {
    const cloud = getCloud();
    const trimmed = label.trim();
    const before = state.account.presets.find((p) => p.id === id);
    if (!cloud || !before || !trimmed || before.label === trimmed) return;
    setAccount({ presets: state.account.presets.map((p) => (p.id === id ? { ...p, label: trimmed } : p)) });
    cloud.renamePreset(id, trimmed).catch((e) => {
      setAccount({ presets: state.account.presets.map((p) => (p.id === id ? { ...p, label: before.label } : p)) });
      actions.showNotice(errorNotice(e, "Couldn’t rename that preset."));
    });
  },

  deletePreset(id: string) {
    const cloud = getCloud();
    const user = state.account.user;
    const before = state.account.presets.find((p) => p.id === id);
    if (!cloud || !user || !before) return;
    haptic();
    setAccount({
      presets: state.account.presets.filter((p) => p.id !== id),
      favorites: state.account.favorites.filter((r) => r !== id),
    });
    set({ recents: state.recents.filter((r) => r !== id) }, false);
    cloud.deletePreset(user.id, id).catch((e) => {
      setAccount({ presets: [before, ...state.account.presets] });
      actions.showNotice(errorNotice(e, "Couldn’t delete that preset."));
    });
  },

  /** Flips a preset's share state. Shared presets are readable by anyone with the link. */
  setPresetShared(id: string, isPublic: boolean) {
    const cloud = getCloud();
    const before = state.account.presets.find((p) => p.id === id);
    if (!cloud || !before || before.isPublic === isPublic) return;
    setAccount({ presets: state.account.presets.map((p) => (p.id === id ? { ...p, isPublic } : p)) });
    cloud.setPresetPublic(id, isPublic).catch((e) => {
      setAccount({ presets: state.account.presets.map((p) => (p.id === id ? { ...p, isPublic: before.isPublic } : p)) });
      actions.showNotice(errorNotice(e, "Couldn’t change sharing for that preset."));
    });
  },
};

/** The share link for a public custom preset. */
export const presetShareUrl = (id: string) => `${location.origin}/?p=${id}`;

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
