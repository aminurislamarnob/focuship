"use client";

import { Check, Expand, Pause, Play, Share2, Shuffle, Trash2, X } from "lucide-react";
import { PRESETS, SOUND_BY_ID } from "@/lib/catalog";
import { actions, matchPreset, mixHue, mixName, useFocus } from "@/lib/store";
import {
  Ambient,
  CATEGORY_ICONS,
  Eq,
  IconButton,
  PresetIcon,
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
  const [copied, flagCopied] = useCopied();
  const layers = useFocus((s) => s.layers);
  const playing = useFocus((s) => s.playing);
  const loading = useFocus((s) => s.loading);
  const ids = Object.keys(layers);
  const active = matchPreset(layers);
  const name = ids.length ? mixName(layers) : "Pick a soundscape";
  const state = playing ? "Now playing" : ids.length ? "Paused" : "Ready";

  return (
    <div className="flex flex-col gap-8 pb-6">
      <section className="relative isolate -mx-4 overflow-hidden border-b border-line px-4 pt-8 pb-6 md:mx-0 md:rounded-[8px] md:border">
        <Ambient hue={mixHue(layers)} active={playing} className="-z-10" />
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
          <IconButton label="Open focus mode" size="lg" onClick={onOpenFocus}>
            <Expand className="size-5" />
          </IconButton>
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

      <section aria-labelledby="presets">
        <h2 id="presets" className="label-mono mb-3">
          Presets
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {PRESETS.map((preset) => {
            const on = active?.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={on}
                onClick={() => (on ? actions.toggle() : actions.applyPreset(preset.layers))}
                className={cx(
                  "group relative isolate flex min-h-28 cursor-pointer flex-col overflow-hidden rounded-[6px] border p-3 text-left transition-all duration-200 active:scale-[0.98]",
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
                <span className="flex items-center justify-between">
                  <span className="label-mono text-faint">{Object.keys(preset.layers).length} sounds</span>
                  {on && <Eq playing={playing} />}
                </span>
                <span className="mt-auto pt-3 text-[0.9375rem] font-semibold tracking-tight">{preset.label}</span>
                <span className="mt-0.5 line-clamp-2 text-xs text-muted">{preset.blurb}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
