"use client";

import {
  Bookmark,
  Check,
  Globe2,
  Link2,
  Lock,
  Pencil,
  Plus,
  Shuffle,
  Star,
  Timer,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type CSSProperties } from "react";
import { PRESETS, SOUND_BY_ID, SOUNDS, type Preset } from "@/lib/catalog";
import type { CustomPreset } from "@/lib/cloud";
import { actions, matchPreset, mixName, presetByRef, presetShareUrl, useFocus } from "@/lib/store";
import { CLOUD_ENABLED } from "@/lib/supabase";
import { formatClock, TimerCard, useTimerClock } from "./TimerView";
import {
  EmberBackdrop,
  IconButton,
  Kbd,
  PauseIcon,
  PlayIcon,
  PresetArt,
  Sheet,
  Slider,
  SoundIcon,
  StatusDot,
  SwapText,
  Waveform,
  cx,
  soundKind,
  useCopied,
} from "./ui";

interface MixViewProps {
  onOpenSheet(): void;
  onBrowse(): void;
  onTimer(): void;
  onAbout(): void;
}

export function MixView({ onOpenSheet, onBrowse, onTimer, onAbout }: MixViewProps) {
  const router = useRouter();
  const [manageId, setManageId] = useState<string | null>(null);
  const account = useFocus((s) => s.account);
  const shared = useFocus((s) => s.shared);
  const playing = useFocus((s) => s.playing);
  const active = matchPreset(useFocus((s) => s.layers));

  const goAccount = (reason: "favorites" | "save") => router.push(`/account?reason=${reason}`);
  const managed = manageId ? account.presets.find((p) => p.id === manageId) : undefined;

  return (
    <div className="pb-8 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-8">
      <div className="flex min-w-0 flex-col gap-10">
        <Player onOpenSheet={onOpenSheet} onTimer={onTimer} />

        {shared && (
          <section aria-label="Shared preset" className="-mt-4 flex items-center gap-3 rounded-[18px] border border-line-strong bg-raised py-2 pr-2 pl-4">
            <p className="min-w-0 flex-1 text-sm">
              <span className="font-semibold">{shared.label}</span>
              <span className="text-muted"> — a preset someone shared with you.</span>
            </p>
            <button
              type="button"
              onClick={() => {
                if (!actions.saveSharedCopy()) goAccount("save");
              }}
              className="h-9 shrink-0 cursor-pointer rounded-[10px] border border-line-strong bg-surface-2 px-3 text-[0.8125rem] font-[550]"
            >
              Save a copy
            </button>
            <IconButton label="Dismiss" size="sm" className="text-muted" onClick={actions.dismissShared}>
              <X className="size-4" />
            </IconButton>
          </section>
        )}

        <div className="lg:hidden">
          <Layers onBrowse={onBrowse} />
        </div>

        <Recents activeId={active?.id} />
        <PresetGroups
          activeId={active?.id}
          playing={playing}
          onManage={setManageId}
          onNeedAccount={() => goAccount("favorites")}
          onOpenSheet={onOpenSheet}
        />

        <p className="border-t border-line pt-4 text-[0.8125rem] leading-normal text-faint">
          Free, private and offline. No account, no tracking cookies.{" "}
          <button type="button" onClick={onAbout} className="cursor-pointer text-soft underline underline-offset-2">
            About &amp; offline
          </button>
        </p>
      </div>

      <aside aria-label="Timer and mix" className="sticky top-0 hidden flex-col gap-4 lg:flex">
        <section className="rounded-[24px] border border-[#222] bg-raised p-5 [--slider-ring:var(--bg-raised)]">
          <Layers onBrowse={onBrowse} compact />
        </section>
        <TimerCard onOpen={onTimer} />
        <section aria-labelledby="offline-card" className="flex flex-col gap-2.5 rounded-[24px] border border-[#222] p-5">
          <h2 id="offline-card" className="text-[0.9375rem] font-semibold">
            Offline sounds
          </h2>
          <p className="text-[0.8125rem] leading-normal text-muted">
            Recordings save as you play. Noise and tones are generated on-device.
          </p>
          <button
            type="button"
            onClick={onAbout}
            className="h-11 cursor-pointer rounded-[12px] border border-line-strong bg-surface-2 text-sm font-[550] transition-colors hover:bg-[#222]"
          >
            Save all sounds · about 80 MB
          </button>
        </section>
      </aside>

      {managed && <ManagePresetSheet key={managed.id} preset={managed} onClose={() => setManageId(null)} />}
    </div>
  );
}

/** The big card: what's playing, its level bars, and the one button that matters. */
function Player({ onOpenSheet, onTimer }: { onOpenSheet(): void; onTimer(): void }) {
  const layers = useFocus((s) => s.layers);
  const playing = useFocus((s) => s.playing);
  const timer = useFocus((s) => s.timer);
  const { remaining } = useTimerClock(timer);
  const ids = Object.keys(layers);
  const active = matchPreset(layers);
  const empty = ids.length === 0;
  const name = empty ? "Pick a soundscape" : mixName(layers);
  const blurb =
    active?.blurb ?? (empty ? "Tap play for Deep work, or start from a preset." : "Your own mix. Fine-tune each layer below.");
  const count = `${ids.length} sound${ids.length === 1 ? "" : "s"}`;
  const playLabel = playing ? "Pause" : "Play";
  const playIcon = (size: string) =>
    playing ? (
      <PauseIcon className={size} />
    ) : (
      <PlayIcon className={size} />
    );
  const chip =
    "inline-flex h-[52px] w-[100px] cursor-pointer items-center justify-center gap-2 rounded-[16px] border border-[#232323] bg-surface text-sm font-medium transition-colors hover:bg-surface-2 disabled:cursor-default disabled:opacity-40";

  return (
    <section
      aria-labelledby="mix-title"
      className="relative isolate flex flex-col overflow-hidden rounded-[28px] border border-[#2a1f17] bg-[#0e0c0b] p-5 md:flex-row md:flex-wrap md:items-center md:gap-7 md:p-7"
    >
      <EmberBackdrop text={`${name} ${blurb}`} playing={playing} glyphs={52} />
      <div className="flex min-w-0 flex-col [container-type:inline-size] md:flex-[1_1_280px]">
        <div className="flex items-center justify-between" aria-live="polite">
          <span className="inline-flex h-[26px] items-center gap-2 rounded-full border border-[#2e2e2e] pr-2.5 pl-[9px] text-xs font-medium text-soft">
            <StatusDot active={playing} />
            <SwapText text={playing ? "Playing" : empty ? "Ready" : "Paused"} />
          </span>
          <span className="label-mono md:hidden">{count}</span>
        </div>
        {/*
          One line in a fixed-height box, whatever the name: the size shrinks to fit the card
          (Geist runs about 0.45-0.53em per character here; 0.56 leaves room), so swapping
          "Pick a soundscape" for "Brown noise" never changes the card's height.
        */}
        <h2
          id="mix-title"
          style={{ "--chars": name.length } as CSSProperties}
          className="mt-2.5 flex h-[3.02rem] items-center text-[min(2.625rem,calc(100cqi/(var(--chars)*0.56)))] leading-[1.15] font-semibold tracking-[-0.04em] whitespace-nowrap md:mt-3 md:h-[4.025rem] md:text-[min(3.5rem,calc(100cqi/(var(--chars)*0.56)))] md:tracking-[-0.045em]"
        >
          <SwapText text={name} className="max-w-full truncate" />
        </h2>
        {/* Always two lines tall, for the same reason. */}
        <p className="mt-2 line-clamp-2 min-h-[2.8em] text-base leading-[1.4] text-muted">
          <SwapText text={blurb} />
          {!empty && <span className="whitespace-nowrap max-md:hidden"> · {count}</span>}
        </p>
        <div className="mt-6 flex items-center gap-3 max-md:hidden">
          <IconButton label={playLabel} variant="solid" round className="size-16" onClick={actions.toggle}>
            {playIcon("size-[26px]")}
          </IconButton>
          <button
            type="button"
            disabled={empty}
            onClick={onOpenSheet}
            className="inline-flex h-12 shrink-0 cursor-pointer items-center gap-2 rounded-[14px] border border-[#2a2a2a] bg-[#181818] px-4 text-sm font-medium whitespace-nowrap transition-colors hover:bg-surface-2 disabled:cursor-default disabled:opacity-40"
          >
            <Bookmark className="size-4" strokeWidth={1.75} aria-hidden /> Save preset
          </button>
          <span className="ml-auto flex items-center gap-1.5 text-xs whitespace-nowrap text-faint max-xl:hidden">
            <Kbd className="h-6 min-w-0 border-b px-1.5">Space</Kbd> play / pause
          </span>
        </div>
      </div>

      <Waveform playing={playing} empty={empty} className="mt-6 h-28 md:mt-0 md:h-[150px] md:flex-[1_1_280px]" bars={52} />

      <div className="mt-[26px] flex items-center justify-between md:hidden">
        <button type="button" onClick={onTimer} className={chip} aria-label={`Timer, ${formatClock(remaining)}`}>
          <Timer className="size-[18px]" strokeWidth={1.75} aria-hidden />
          <span className="font-mono text-sm">{formatClock(remaining)}</span>
        </button>
        <IconButton label={playLabel} variant="solid" round className="size-[76px]" onClick={actions.toggle}>
          {playIcon("size-[30px]")}
        </IconButton>
        <button type="button" onClick={onOpenSheet} disabled={empty} className={chip}>
          <Bookmark className="size-[18px]" strokeWidth={1.75} aria-hidden /> Save
        </button>
      </div>
    </section>
  );
}

/** The layers in the mix with their volumes, then the master volume. `compact` is the sidebar card. */
function Layers({ onBrowse, compact }: { onBrowse(): void; compact?: boolean }) {
  const layers = useFocus((s) => s.layers);
  const loading = useFocus((s) => s.loading);
  const volume = useFocus((s) => s.volume);
  const ids = Object.keys(layers);
  const muted = volume === 0;

  return (
    <section aria-labelledby={compact ? "layers-card" : "layers"} className="flex flex-col">
      <div className={cx("flex items-center justify-between", compact ? "h-8" : "h-11")}>
        <h2 id={compact ? "layers-card" : "layers"} className="text-[0.9375rem] font-semibold tracking-[-0.01em]">
          In this mix
        </h2>
        <div className="flex items-center gap-4 text-[0.8125rem] text-muted">
          <button type="button" onClick={actions.shuffle} className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 hover:text-fg">
            <Shuffle className="size-3.5" strokeWidth={1.75} aria-hidden /> Shuffle
          </button>
          {ids.length > 0 && (
            <button type="button" onClick={actions.clear} className="min-h-8 cursor-pointer hover:text-fg">
              Clear all
            </button>
          )}
        </div>
      </div>

      {ids.length === 0 && (
        <p className="mt-2 border-t border-line py-5 text-sm leading-normal text-muted">
          Nothing in the mix yet. Pick a preset below or add sounds from the library.
        </p>
      )}

      <ul className={cx("flex flex-col", compact && "mt-2")}>
        {ids.map((id) => {
          const sound = SOUND_BY_ID.get(id);
          if (!sound) return null;
          const vol = Math.round(layers[id] * 100);
          const isLoading = loading.includes(id);
          if (compact) {
            return (
              <li key={id} className="flex flex-col border-t border-line pt-2.5 pb-1">
                <div className="flex justify-between text-[0.84rem]">
                  <span className="truncate font-[550]">{sound.label}</span>
                  <span className="font-mono text-xs text-muted">{isLoading ? "…" : vol}</span>
                </div>
                <Slider label={`${sound.label} volume`} value={layers[id]} size="sm" onChange={(v) => actions.setLayerVolume(id, v)} />
              </li>
            );
          }
          return (
            <li key={id} className="flex items-center gap-3 border-t border-line py-3">
              <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-[12px] border border-[#232323] bg-surface text-soft">
                <SoundIcon sound={sound} className="size-[22px]" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[0.9375rem] font-[550]">{sound.label}</span>
                  <span className="font-mono text-xs text-muted">{vol}</span>
                </div>
                <span className="mt-0.5 text-xs text-faint">{isLoading ? "Loading…" : soundKind(sound)}</span>
                <Slider label={`${sound.label} volume`} value={layers[id]} onChange={(v) => actions.setLayerVolume(id, v)} />
              </div>
              <IconButton label={`Remove ${sound.label}`} className="h-11 w-9 text-faint" onClick={() => actions.toggleSound(id)}>
                <X className="size-[18px]" strokeWidth={1.75} />
              </IconButton>
            </li>
          );
        })}
      </ul>

      {!compact && (
        <button type="button" onClick={onBrowse} className="flex cursor-pointer items-center gap-3 border-t border-line py-3 text-left">
          <span aria-hidden className="grid size-11 place-items-center rounded-[12px] border border-[#2e2e2e]">
            <Plus className="size-5" strokeWidth={1.75} />
          </span>
          <span className="flex-1 text-[0.9375rem] font-medium">Add a sound</span>
          <span className="text-[0.8125rem] text-faint">{SOUNDS.length} in the library</span>
        </button>
      )}

      <div className={cx("flex items-center border-t border-line", compact ? "pt-2.5" : "gap-3 pt-2.5")}>
        {!compact && (
          <IconButton label={muted ? "Unmute" : "Mute"} className="text-muted" onClick={actions.toggleMute}>
            {muted ? <VolumeX className="size-5" strokeWidth={1.75} /> : <Volume2 className="size-5" strokeWidth={1.75} />}
          </IconButton>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex justify-between text-[0.8125rem] text-muted">
            <span>Master volume</span>
            <span className="font-mono text-xs">{Math.round(volume * 100)}</span>
          </div>
          <Slider label="Master volume" value={volume} size={compact ? "sm" : "md"} onChange={actions.setVolume} />
        </div>
        {!compact && <span className="w-9 shrink-0" />}
      </div>
    </section>
  );
}

/** Recently applied presets, newest first. Local-only; works signed out. */
function Recents({ activeId }: { activeId?: string }) {
  const recents = useFocus((s) => s.recents);
  const presets = useFocus((s) => s.account.presets);
  const resolved = recents
    .map((ref) => presetByRef(ref, presets))
    .filter((preset): preset is Preset => Boolean(preset));
  if (!resolved.length) return null;
  return (
    <section aria-labelledby="recents">
      <h2 id="recents" className="mb-3 text-[0.9375rem] font-semibold tracking-[-0.01em]">
        Recent
      </h2>
      <div className="flex flex-wrap gap-1.5">
        {resolved.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => actions.applyPreset(preset.layers, preset.id)}
            className={cx(
              "inline-flex h-8 cursor-pointer items-center rounded-full px-3 text-[0.8125rem] transition-colors",
              activeId === preset.id ? "bg-accent text-accent-ink" : "bg-surface-2 text-soft hover:text-fg",
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </section>
  );
}

interface GroupsProps {
  activeId?: string;
  playing: boolean;
  onManage(id: string): void;
  onNeedAccount(): void;
  onOpenSheet(): void;
}

/** The preset grid, grouped: favorites first, then the catalog, then your own. */
function PresetGroups({ activeId, playing, onManage, onNeedAccount, onOpenSheet }: GroupsProps) {
  const account = useFocus((s) => s.account);
  const hasMix = useFocus((s) => Object.keys(s.layers).length > 0);
  const favoriteRefs = new Set(account.favorites);
  const favorites = account.favorites
    .map((ref) => presetByRef(ref, account.presets))
    .filter((preset): preset is Preset => Boolean(preset));
  const builtIns = PRESETS.filter((preset) => !favoriteRefs.has(preset.id));
  const custom = account.presets.filter((preset) => !favoriteRefs.has(preset.id));
  const customIds = new Set(account.presets.map((preset) => preset.id));

  const group = (title: string, presets: Preset[], intro?: string, extra?: React.ReactNode) =>
    (presets.length > 0 || extra) && (
      <section key={title} aria-label={title}>
        <div className="flex items-baseline justify-between">
          <h2 className="text-[0.9375rem] font-semibold tracking-[-0.01em]">{title}</h2>
          <span className="label-mono">{presets.length}</span>
        </div>
        {intro && <p className="mt-1.5 text-[0.8125rem] text-muted">{intro}</p>}
        <div className="mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] md:gap-3">
          {presets.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              on={activeId === preset.id}
              playing={playing}
              favorite={favoriteRefs.has(preset.id)}
              custom={customIds.has(preset.id)}
              onManage={onManage}
              onNeedAccount={onNeedAccount}
            />
          ))}
          {extra}
        </div>
      </section>
    );

  const saveCard = hasMix && (
    <button
      type="button"
      onClick={onOpenSheet}
      className="flex cursor-pointer flex-col overflow-hidden rounded-[18px] border border-dashed border-line-strong text-left transition-colors hover:bg-white/[0.02]"
    >
      <span className="grid h-[84px] place-items-center">
        <span aria-hidden className="grid size-10 place-items-center rounded-full border border-[#3a3a3a]">
          <Plus className="size-[18px]" strokeWidth={1.75} />
        </span>
      </span>
      <span className="flex flex-col gap-1 px-3 pt-3 pb-3.5">
        <span className="text-[0.9375rem] font-semibold tracking-[-0.01em]">Save this mix</span>
        <span className="text-[0.78rem] leading-[1.35] text-muted">Keep your layers as a preset</span>
      </span>
    </button>
  );

  return (
    <>
      {group("Favorites", favorites)}
      {group("Presets", builtIns, "Start from a scene, then make it yours.", saveCard)}
      {group(
        "Your presets",
        custom.map((preset) => ({ id: preset.id, label: preset.label, blurb: "Your preset", layers: preset.layers })),
      )}
    </>
  );
}

interface CardProps {
  preset: Preset;
  on: boolean;
  playing: boolean;
  favorite: boolean;
  custom: boolean;
  onManage(id: string): void;
  onNeedAccount(): void;
}

function PresetCard({ preset, on, playing, favorite, custom, onManage, onNeedAccount }: CardProps) {
  const count = Object.keys(preset.layers).length;
  return (
    <div className="relative">
      <button
        type="button"
        aria-pressed={on}
        onClick={() => (on ? actions.toggle() : actions.applyPreset(preset.layers, preset.id))}
        className={cx(
          "flex size-full cursor-pointer flex-col overflow-hidden rounded-[18px] border border-[#222] bg-raised text-left transition-[box-shadow,scale] duration-200 active:scale-[0.98]",
          on && "shadow-[0_0_0_2px_var(--accent)]",
        )}
      >
        <span className="relative block h-[84px] border-b border-[#1c1c1c] bg-[#0e0e0e]">
          <PresetArt id={preset.id} className="size-full" />
          <span className="absolute top-[9px] left-[9px] rounded-full bg-bg px-[7px] py-[3px] font-mono text-[0.6875rem] text-soft">
            {on && playing ? "Playing" : `${count} sound${count === 1 ? "" : "s"}`}
          </span>
        </span>
        <span className="flex flex-col gap-1 px-3 pt-3 pb-3.5">
          <span className={cx("text-[0.9375rem] font-semibold tracking-[-0.01em]", CLOUD_ENABLED && "pr-6")}>{preset.label}</span>
          <span className="line-clamp-2 text-[0.78rem] leading-[1.35] text-muted">{preset.blurb}</span>
        </span>
      </button>
      {CLOUD_ENABLED && (
        <span className="absolute top-1 right-1 flex gap-0.5">
          {custom && (
            <IconButton label={`Edit ${preset.label}`} size="sm" className="bg-bg/70 text-soft" onClick={() => onManage(preset.id)}>
              <Pencil className="size-4" strokeWidth={1.75} />
            </IconButton>
          )}
          <IconButton
            label={favorite ? `Remove ${preset.label} from favorites` : `Add ${preset.label} to favorites`}
            size="sm"
            onClick={() => {
              if (!actions.toggleFavorite(preset.id)) onNeedAccount();
            }}
            className={cx("bg-bg/70", favorite ? "text-fg" : "text-faint")}
          >
            <Star className={cx("size-4", favorite && "animate-pop-in fill-current")} strokeWidth={1.75} />
          </IconButton>
        </span>
      )}
    </div>
  );
}

export const inputClass =
  "h-[52px] w-full min-w-0 rounded-[14px] border border-[#2e2e2e] bg-[#0e0e0e] px-3.5 text-[0.9375rem] text-fg outline-none placeholder:text-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg disabled:opacity-60";

const secondaryButton =
  "inline-flex h-[52px] cursor-pointer items-center justify-center gap-2 rounded-[14px] border border-line-strong bg-surface-2 text-[0.9375rem] font-[550] transition-colors hover:bg-[#222] disabled:cursor-default disabled:opacity-40";

/** Rename, share and delete one of your presets. */
function ManagePresetSheet({ preset, onClose }: { preset: CustomPreset; onClose(): void }) {
  const [label, setLabel] = useState(preset.label);
  const [copied, flagCopied] = useCopied();

  return (
    <Sheet open onClose={onClose} title="Your preset" subtitle={preset.label}>
      <div className="flex flex-col gap-6">
        <form
          className="flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            actions.renamePreset(preset.id, label);
          }}
        >
          <label className="text-[0.8125rem] font-medium text-soft" htmlFor="preset-rename">
            Name
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="preset-rename"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={60}
              autoComplete="off"
              className={inputClass}
            />
            <button type="submit" disabled={!label.trim() || label.trim() === preset.label} className={cx(secondaryButton, "shrink-0 px-[18px]")}>
              Rename
            </button>
          </div>
        </form>

        <div className="flex flex-col gap-2 border-t border-edge pt-5">
          <h3 className="text-[0.9375rem] font-semibold">Sharing</h3>
          <button
            type="button"
            onClick={() => actions.setPresetShared(preset.id, !preset.isPublic)}
            className="flex cursor-pointer items-center gap-3 rounded-[14px] border border-line-strong bg-surface-2 px-3.5 py-3 text-left"
          >
            {preset.isPublic ? (
              <Globe2 className="size-[18px] shrink-0 text-fg" strokeWidth={1.75} aria-hidden />
            ) : (
              <Lock className="size-[18px] shrink-0 text-muted" strokeWidth={1.75} aria-hidden />
            )}
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{preset.isPublic ? "Shared with a link" : "Private"}</span>
              <span className="block text-xs text-muted">
                {preset.isPublic
                  ? "Anyone with the link can load and copy this preset."
                  : "Only you can see this preset. Turn on sharing to get a link."}
              </span>
            </span>
            <span className="label-mono shrink-0">{preset.isPublic ? "On" : "Off"}</span>
          </button>
          {preset.isPublic && (
            <button
              type="button"
              onClick={() =>
                navigator.clipboard
                  .writeText(presetShareUrl(preset.id))
                  .then(flagCopied)
                  .catch(() => actions.showNotice("Couldn’t copy the link."))
              }
              className={secondaryButton}
            >
              {copied ? <Check className="size-[18px] animate-pop-in" aria-hidden /> : <Link2 className="size-[18px]" strokeWidth={1.75} aria-hidden />}
              {copied ? "Link copied" : "Copy share link"}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            actions.deletePreset(preset.id);
            onClose();
          }}
          className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-[14px] text-[0.9375rem] font-[550] text-danger"
        >
          <Trash2 className="size-[18px]" strokeWidth={1.75} aria-hidden /> Delete preset
        </button>
      </div>
    </Sheet>
  );
}
