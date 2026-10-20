"use client";

import {
  BookmarkPlus,
  Check,
  Expand,
  Globe2,
  Link2,
  Lock,
  Pause,
  Pencil,
  Play,
  Share2,
  Shuffle,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PRESETS, SOUND_BY_ID, type Preset } from "@/lib/catalog";
import type { CustomPreset } from "@/lib/cloud";
import { actions, matchPreset, mixMood, mixName, presetByRef, presetShareUrl, useFocus } from "@/lib/store";
import { CLOUD_ENABLED } from "@/lib/supabase";
import {
  Ambient,
  CATEGORY_ICONS,
  Eq,
  IconButton,
  PresetIcon,
  Sheet,
  Slider,
  StatusDot,
  SwapText,
  cx,
  useCopied,
  type ShareResult,
} from "./ui";

interface MixViewProps {
  onOpenFocus(): void;
  onShare(): Promise<ShareResult>;
  onBrowse(): void;
}

export function MixView({ onOpenFocus, onShare, onBrowse }: MixViewProps) {
  const router = useRouter();
  const [copied, flagCopied] = useCopied();
  const [saveOpen, setSaveOpen] = useState(false);
  const [manageId, setManageId] = useState<string | null>(null);
  const layers = useFocus((s) => s.layers);
  const playing = useFocus((s) => s.playing);
  const loading = useFocus((s) => s.loading);
  const account = useFocus((s) => s.account);
  const shared = useFocus((s) => s.shared);
  const ids = Object.keys(layers);
  const active = matchPreset(layers);
  const name = ids.length ? mixName(layers) : "Pick a soundscape";
  const state = playing ? "Now playing" : ids.length ? "Paused" : "Ready";

  const goAccount = (reason: "favorites" | "save") => router.push(`/account?reason=${reason}`);
  const managed = manageId ? account.presets.find((p) => p.id === manageId) : undefined;

  return (
    <div className="flex flex-col gap-8 pb-6">
      <section className="relative isolate -mx-4 overflow-hidden border-b border-line px-4 pt-8 pb-6 md:mx-0 md:rounded-[8px] md:border">
        <Ambient mood={mixMood(layers)} layers={layers} active={playing} className="-z-10" />
        {active && (
          <div key={active.id} className="absolute top-5 right-4 animate-pop-in md:top-6 md:right-6" aria-hidden>
            <PresetIcon
              id={active.id}
              strokeWidth={1}
              className={cx("size-16 text-white/[0.12] sm:size-[4.5rem]", playing && "animate-float")}
            />
          </div>
        )}
        <p className="label-mono flex items-center gap-2" aria-live="polite">
          <StatusDot tone={playing ? "brand" : "idle"} pulse={playing} />
          <SwapText text={state} />
          {ids.length > 0 && (
            <SwapText className="text-faint" text={`· ${ids.length} sound${ids.length === 1 ? "" : "s"}`} />
          )}
        </p>
        <h2
          className={cx(
            "mt-3 text-[2.5rem] leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl",
            active && "pr-20 sm:pr-24",
          )}
        >
          <SwapText text={name} />
        </h2>
        <p className="mt-3 max-w-md text-[0.9375rem] text-muted">
          <SwapText
            text={
              active?.blurb ??
              (ids.length ? "Your own mix. Fine-tune each layer below." : "Tap play for Deep work, or start from a preset.")
            }
          />
        </p>

        <div className="mt-7 flex items-center gap-3">
          <button
            type="button"
            onClick={actions.toggle}
            aria-label={playing ? "Pause" : "Play"}
            className="inline-flex h-14 cursor-pointer items-center gap-2.5 rounded-[4px] bg-fg px-6 text-[0.9375rem] font-medium text-bg transition-colors hover:bg-white active:bg-neutral-300"
          >
            {playing ? <Pause className="size-5" fill="currentColor" /> : <Play className="size-5" fill="currentColor" />}
            {playing ? "Pause" : "Play"}
          </button>
          <IconButton label="Shuffle a surprise mix" size="lg" onClick={actions.shuffle}>
            <Shuffle className="size-5" />
          </IconButton>
          <IconButton label="Open focus mode" size="lg" onClick={onOpenFocus} className="max-[400px]:hidden">
            <Expand className="size-5" />
          </IconButton>
          {ids.length > 0 && CLOUD_ENABLED && (
            <IconButton
              label="Save as preset"
              size="lg"
              onClick={() => (account.user ? setSaveOpen(true) : goAccount("save"))}
            >
              <BookmarkPlus className="size-5" />
            </IconButton>
          )}
          {ids.length > 0 && (
            <IconButton
              label={copied ? "Link copied" : "Share this mix"}
              size="lg"
              onClick={() => onShare().then((result) => result === "copied" && flagCopied())}
              className={cx("max-[360px]:hidden", copied && "border-ok/60 bg-ok/10 text-ok hover:bg-ok/10")}
            >
              {copied ? <Check className="size-5 animate-pop-in" /> : <Share2 className="size-5" />}
            </IconButton>
          )}
          <span role="status" className={cx("label-mono text-ok", copied ? "animate-pop-in max-sm:sr-only" : "sr-only")}>
            {copied ? "Copied" : ""}
          </span>
        </div>
      </section>

      {shared && (
        <section
          aria-label="Shared preset"
          className="flex items-center gap-3 rounded-[6px] border border-brand/40 bg-brand/10 px-3 py-2.5"
        >
          <PresetIcon id={shared.id} className="size-5 shrink-0 text-brand-light" />
          <p className="min-w-0 flex-1 text-sm">
            <span className="font-medium">{shared.label}</span>
            <span className="text-muted"> — a preset someone shared with you.</span>
          </p>
          <button
            type="button"
            onClick={() => {
              if (!actions.saveSharedCopy()) goAccount("save");
            }}
            className="label-mono shrink-0 cursor-pointer rounded-[4px] border border-brand/50 px-2.5 py-1.5 text-brand-light transition-colors hover:bg-brand/15"
          >
            Save a copy
          </button>
          <IconButton label="Dismiss" variant="ghost" size="sm" onClick={actions.dismissShared}>
            <X className="size-4" />
          </IconButton>
        </section>
      )}

      {ids.length > 0 && (
        <section aria-labelledby="in-mix">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="in-mix" className="label-mono">
              In this mix
            </h2>
            <button
              type="button"
              onClick={actions.clear}
              className="label-mono inline-flex cursor-pointer items-center gap-1.5 hover:text-fg"
            >
              <Trash2 className="size-3.5" /> Clear
            </button>
          </div>
          <ul className="divide-y divide-line overflow-hidden rounded-[6px] border border-line bg-raised">
            {ids.map((id) => {
              const sound = SOUND_BY_ID.get(id);
              if (!sound) return null;
              const Icon = CATEGORY_ICONS[sound.category];
              const isLoading = loading.includes(id);
              return (
                <li key={id} className="flex items-center gap-3 px-3 py-2.5">
                  <Icon className="size-4 shrink-0 text-muted" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{sound.label}</span>
                      {isLoading ? (
                        <span className="label-mono text-faint">loading…</span>
                      ) : (
                        <Eq playing={playing} />
                      )}
                    </div>
                    <Slider
                      label={`${sound.label} volume`}
                      value={layers[id]}
                      size="sm"
                      className="mt-1.5"
                      onChange={(v) => actions.setLayerVolume(id, v)}
                    />
                  </div>
                  <IconButton label={`Remove ${sound.label}`} variant="ghost" size="sm" onClick={() => actions.toggleSound(id)}>
                    <X className="size-4" />
                  </IconButton>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={onBrowse}
            className="mt-3 w-full cursor-pointer rounded-[6px] border border-dashed border-line-strong py-3 text-sm text-muted transition-colors hover:text-fg"
          >
            Add more sounds
          </button>
        </section>
      )}

      <Recents activeId={active?.id} />
      <PresetGroups
        activeId={active?.id}
        playing={playing}
        onManage={setManageId}
        onNeedAccount={() => goAccount("favorites")}
      />

      <SavePresetSheet open={saveOpen} onClose={() => setSaveOpen(false)} suggested={ids.length ? mixName(layers) : ""} />
      {managed && <ManagePresetSheet key={managed.id} preset={managed} onClose={() => setManageId(null)} />}
    </div>
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
      <h2 id="recents" className="label-mono mb-3">
        Recent
      </h2>
      <div className="flex flex-wrap gap-2">
        {resolved.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => actions.applyPreset(preset.layers, preset.id)}
            className={cx(
              "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
              activeId === preset.id
                ? "border-brand bg-brand/10 text-fg"
                : "border-line bg-raised text-muted hover:border-line-strong hover:text-fg",
            )}
          >
            <PresetIcon id={preset.id} className="size-4" />
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
}

/** The preset grid, grouped: favorites first, then the catalog, then your own. */
function PresetGroups({ activeId, playing, onManage, onNeedAccount }: GroupsProps) {
  const account = useFocus((s) => s.account);
  const favoriteRefs = new Set(account.favorites);
  const favorites = account.favorites
    .map((ref) => presetByRef(ref, account.presets))
    .filter((preset): preset is Preset => Boolean(preset));
  const builtIns = PRESETS.filter((preset) => !favoriteRefs.has(preset.id));
  const custom = account.presets.filter((preset) => !favoriteRefs.has(preset.id));
  const customIds = new Set(account.presets.map((preset) => preset.id));

  const group = (title: string, presets: Preset[]) =>
    presets.length > 0 && (
      <section key={title} aria-label={title}>
        <h2 className="label-mono mb-3">{title}</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
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
        </div>
      </section>
    );

  return (
    <>
      {group("Favorites", favorites)}
      {group("Presets", builtIns)}
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
  return (
    <div className="relative">
      <button
        type="button"
        aria-pressed={on}
        onClick={() => (on ? actions.toggle() : actions.applyPreset(preset.layers, preset.id))}
        className={cx(
          "group relative isolate flex min-h-28 w-full cursor-pointer flex-col overflow-hidden rounded-[6px] border p-3 text-left transition-all duration-200 active:scale-[0.98]",
          on ? "border-brand bg-brand/10" : "border-line bg-raised hover:border-line-strong hover:bg-surface",
        )}
      >
        {/* The icon sits behind the text in the bottom-right corner. */}
        <PresetIcon
          id={preset.id}
          strokeWidth={1.25}
          className={cx(
            "absolute right-2 bottom-2 -z-10 size-11 transition-[color,scale,rotate] duration-300 ease-out-strong",
            "group-hover:-rotate-6 group-hover:scale-105 group-active:scale-95",
            on ? "text-brand/25" : "text-white/[0.07] group-hover:text-white/[0.12]",
            on && playing && "animate-float",
          )}
        />
        <span className="flex items-center gap-2">
          <span className="label-mono text-faint">{Object.keys(preset.layers).length} sounds</span>
          {on && <Eq playing={playing} />}
        </span>
        <span className={cx("mt-auto pt-3 text-[0.9375rem] font-semibold tracking-tight", CLOUD_ENABLED && "pr-7")}>
          {preset.label}
        </span>
        <span className="mt-0.5 line-clamp-2 text-xs text-muted">{preset.blurb}</span>
      </button>
      {CLOUD_ENABLED && (
        <span className="absolute right-1 bottom-1 flex flex-col gap-0.5">
          {custom && (
            <IconButton label={`Edit ${preset.label}`} variant="ghost" size="sm" onClick={() => onManage(preset.id)}>
              <Pencil className="size-4" />
            </IconButton>
          )}
          <IconButton
            label={favorite ? `Remove ${preset.label} from favorites` : `Add ${preset.label} to favorites`}
            variant="ghost"
            size="sm"
            onClick={() => {
              if (!actions.toggleFavorite(preset.id)) onNeedAccount();
            }}
            className={cx(favorite && "text-brand hover:text-brand-light")}
          >
            <Star className={cx("size-4", favorite && "animate-pop-in fill-current")} />
          </IconButton>
        </span>
      )}
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-[4px] border border-line-strong bg-raised px-3 text-sm outline-none placeholder:text-faint focus-visible:border-brand";

/** Names and saves the current mix as a custom preset. */
function SavePresetSheet({ open, onClose, suggested }: { open: boolean; onClose(): void; suggested: string }) {
  const [label, setLabel] = useState("");
  const value = label || suggested;

  const save = () => {
    if (!value.trim()) return;
    if (actions.saveCurrentPreset(value)) {
      setLabel("");
      onClose();
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Save this mix">
      <form
        className="flex flex-col gap-3 pt-2 pb-2"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <label className="label-mono" htmlFor="preset-name">
          Preset name
        </label>
        <input
          id="preset-name"
          value={value}
          onChange={(e) => setLabel(e.target.value)}
          maxLength={60}
          autoComplete="off"
          className={inputClass}
        />
        <button
          type="submit"
          className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[4px] bg-fg text-sm font-medium text-bg transition-colors hover:bg-white"
        >
          <BookmarkPlus className="size-4" /> Save preset
        </button>
        <p className="text-xs text-faint">Saved presets live in your account and show up on every device you sign in on.</p>
      </form>
    </Sheet>
  );
}

/** Rename, share and delete one of your presets. */
function ManagePresetSheet({ preset, onClose }: { preset: CustomPreset; onClose(): void }) {
  const [label, setLabel] = useState(preset.label);
  const [copied, flagCopied] = useCopied();

  return (
    <Sheet open onClose={onClose} title="Your preset">
      <div className="flex flex-col gap-5 pt-2 pb-2">
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            actions.renamePreset(preset.id, label);
          }}
        >
          <label className="label-mono" htmlFor="preset-rename">
            Name
          </label>
          <div className="flex gap-2">
            <input
              id="preset-rename"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={60}
              autoComplete="off"
              className={inputClass}
            />
            <button
              type="submit"
              disabled={!label.trim() || label.trim() === preset.label}
              className="label-mono shrink-0 cursor-pointer rounded-[4px] border border-line-strong px-3 transition-colors hover:bg-surface-2 disabled:opacity-40"
            >
              Rename
            </button>
          </div>
        </form>

        <div className="flex flex-col gap-2">
          <p className="label-mono">Sharing</p>
          <button
            type="button"
            onClick={() => actions.setPresetShared(preset.id, !preset.isPublic)}
            className="flex cursor-pointer items-center gap-3 rounded-[6px] border border-line bg-raised px-3 py-2.5 text-left transition-colors hover:border-line-strong"
          >
            {preset.isPublic ? (
              <Globe2 className="size-4 shrink-0 text-ok" aria-hidden />
            ) : (
              <Lock className="size-4 shrink-0 text-muted" aria-hidden />
            )}
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{preset.isPublic ? "Shared with a link" : "Private"}</span>
              <span className="block text-xs text-muted">
                {preset.isPublic
                  ? "Anyone with the link can load and copy this preset."
                  : "Only you can see this preset. Turn on sharing to get a link."}
              </span>
            </span>
            <span className="label-mono shrink-0 text-faint">{preset.isPublic ? "On" : "Off"}</span>
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
              className={cx(
                "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[4px] border font-mono text-xs transition-colors",
                copied ? "border-ok/60 bg-ok/10 text-ok" : "border-line-strong hover:bg-surface-2",
              )}
            >
              {copied ? <Check className="size-4 animate-pop-in" /> : <Link2 className="size-4" />}
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
          className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[4px] border border-line-strong font-mono text-xs text-muted transition-colors hover:text-fg"
        >
          <Trash2 className="size-4" /> Delete preset
        </button>
      </div>
    </Sheet>
  );
}
