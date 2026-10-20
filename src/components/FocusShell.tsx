"use client";

import { Check, Disc3, Download, Expand, Info, LibraryBig, Menu, Pause, Play, Share2, Timer, Trash2, Volume2, VolumeX } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { SOUND_BY_ID } from "@/lib/catalog";
import type { PageIntent } from "@/lib/pages";
import { startPwa, useInstallPrompt } from "@/lib/pwa";
import { actions, matchPreset, mixName, shareUrl, useFocus, type Tab } from "@/lib/store";
import { AboutSheet } from "./AboutSheet";
import { FocusMode } from "./FocusMode";
import { Logo } from "./Logo";
import { MixView } from "./MixView";
import { SoundsView } from "./SoundsView";
import { TimerView, formatClock, useTimerClock } from "./TimerView";
import {
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

const TABS: { id: Tab; label: string; icon: typeof Disc3 }[] = [
  { id: "mix", label: "Mix", icon: Disc3 },
  { id: "sounds", label: "Sounds", icon: LibraryBig },
  { id: "timer", label: "Timer", icon: Timer },
];

interface FocusShellProps {
  /** The page's H1 and one-line intro, shown above the player. */
  heading: string;
  intro: string;
  /** What a landing page loads on arrival (mix, tab, timer lengths). */
  intent?: PageIntent;
  /** Site links, shown in the sidebar and in the mobile menu. */
  nav?: ReactNode;
  /** Page copy rendered below the active view, inside the scroll area. */
  children?: ReactNode;
}

export function FocusShell({ heading, intro, intent, nav, children }: FocusShellProps) {
  const tab = useFocus((s) => s.tab);
  const [focusOpen, setFocusOpen] = useState(false);
  const [fullscreenRequest, setFullscreenRequest] = useState(0);
  const [mixerOpen, setMixerOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    // A menu link was followed: close the menu on the new page.
    setMenuPath(pathname);
    setMenuOpen(false);
  }
  const main = useRef<HTMLElement>(null);
  const notice = useFocus((s) => s.notice);
  const hasMix = useFocus((s) => Object.keys(s.layers).length > 0);
  const { canPrompt } = useInstallPrompt();

  useEffect(() => {
    actions.hydrate(intent);
    startPwa();
  }, [intent]);

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(actions.dismissNotice, 4000);
    return () => clearTimeout(id);
  }, [notice]);

  const go = useCallback((next: Tab) => {
    actions.setTab(next);
    main.current?.scrollTo({ top: 0 });
  }, []);

  const share = useCallback(async (): Promise<ShareResult> => {
    const url = shareUrl();
    try {
      if (navigator.share && matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title: "A focus mix", text: "Listen to my focus mix", url });
        return "shared";
      }
      await navigator.clipboard.writeText(url);
      return "copied";
    } catch (e) {
      if ((e as Error).name === "AbortError") return "cancelled";
      actions.showNotice("Couldn’t share this mix.");
      return "failed";
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable]")) return;
      if (e.key === " " && !target.closest("button, a, [role=tab]")) {
        e.preventDefault();
        actions.toggle();
      } else if (e.key === "v" || e.key === "V") {
        setFocusOpen((open) => !open);
      } else if (e.key === "f" || e.key === "F") {
        if (focusOpen && document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          // Focus mode must be visible before it can go fullscreen; it handles the request once shown.
          setFocusOpen(true);
          setFullscreenRequest((n) => n + 1);
        }
      } else if (e.key === "m" || e.key === "M") {
        actions.toggleMute();
      } else if (e.key === "Escape") {
        setFocusOpen(false);
      } else if (["1", "2", "3"].includes(e.key) && !focusOpen) {
        go(TABS[Number(e.key) - 1].id);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [focusOpen, go]);

  return (
    <div className="flex h-dvh overflow-hidden">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-raised md:flex">
        <div className="flex h-16 items-center px-5">
          <Logo />
        </div>
        <nav aria-label="Main" className="flex flex-col gap-1 px-3 pt-2">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-current={tab === id ? "page" : undefined}
              onClick={() => go(id)}
              className={cx(
                "flex h-10 cursor-pointer items-center gap-3 rounded-[4px] px-3 text-sm transition-colors",
                tab === id ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface hover:text-fg",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {label}
              {tab === id && <span className="ml-auto h-4 w-0.5 bg-brand" aria-hidden />}
            </button>
          ))}
        </nav>
        {nav && (
          <div className="no-scrollbar mx-3 mt-3 min-h-0 flex-1 overflow-y-auto border-t border-line pt-3 pb-4">{nav}</div>
        )}
        <div className="mt-auto flex flex-col gap-1 border-t border-line p-3">
          <button
            type="button"
            onClick={() => setFocusOpen(true)}
            className="flex h-10 cursor-pointer items-center gap-3 rounded-[4px] px-3 text-sm text-muted hover:bg-surface hover:text-fg"
          >
            <Expand className="size-4" aria-hidden /> Focus mode
            <kbd className="ml-auto font-mono text-[0.6875rem] text-faint">V</kbd>
          </button>
          <button
            type="button"
            onClick={() => setAboutOpen(true)}
            className="flex h-10 cursor-pointer items-center gap-3 rounded-[4px] px-3 text-sm text-muted hover:bg-surface hover:text-fg"
          >
            <Info className="size-4" aria-hidden /> About & offline
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="pt-safe shrink-0 border-b border-line bg-bg md:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <Logo />
            <div className="flex items-center gap-1">
              {canPrompt && (
                <IconButton label="Install app" variant="ghost" size="sm" onClick={() => setAboutOpen(true)}>
                  <Download className="size-4" />
                </IconButton>
              )}
              <IconButton label="About and offline" variant="ghost" size="sm" onClick={() => setAboutOpen(true)}>
                <Info className="size-4" />
              </IconButton>
              {nav && (
                <IconButton label="Menu" variant="ghost" size="sm" onClick={() => setMenuOpen(true)}>
                  <Menu className="size-4" />
                </IconButton>
              )}
            </div>
          </div>
        </header>

        <main ref={main} className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto w-full max-w-5xl px-4 md:px-8 md:pt-6">
            <header className="pt-4 pb-3 md:pt-0">
              <h1 className="text-sm font-medium text-fg">{heading}</h1>
              <p className="mt-0.5 text-sm text-muted">{intro}</p>
            </header>
            <div hidden={tab !== "mix"}>
              <MixView onOpenFocus={() => setFocusOpen(true)} onShare={share} onBrowse={() => go("sounds")} />
            </div>
            <div hidden={tab !== "sounds"}>
              <SoundsView />
            </div>
            <div hidden={tab !== "timer"}>
              <TimerView />
            </div>
            {children}
          </div>
        </main>

        <div className="relative shrink-0">
          {notice && (
            <div
              role="status"
              className="absolute inset-x-4 bottom-full mb-3 rounded-[6px] border border-line-strong bg-surface-2 px-3 py-2.5 text-sm shadow-lg md:mx-auto md:max-w-md"
            >
              {notice}
            </div>
          )}
          {hasMix && <PlayerBar onOpenMixer={() => setMixerOpen(true)} onOpenFocus={() => setFocusOpen(true)} />}
          <nav aria-label="Tabs" className="pb-safe border-t border-line bg-raised md:hidden">
            <div className="grid grid-cols-3">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-current={tab === id ? "page" : undefined}
                  onClick={() => go(id)}
                  className={cx(
                    "relative flex h-14 cursor-pointer flex-col items-center justify-center gap-1 transition-colors",
                    tab === id ? "text-fg" : "text-faint",
                  )}
                >
                  {tab === id && <span className="absolute top-0 h-0.5 w-8 bg-brand" aria-hidden />}
                  <Icon className="size-5" aria-hidden />
                  <span className="font-mono text-[0.625rem] tracking-wider uppercase">{label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>

      <MixerSheet open={mixerOpen} onClose={() => setMixerOpen(false)} onShare={share} />
      <AboutSheet open={aboutOpen} onClose={() => setAboutOpen(false)} />
      {nav && (
        <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu">
          <div className="-mx-3 pt-2 pb-2">{nav}</div>
        </Sheet>
      )}
      <FocusMode open={focusOpen} onClose={() => setFocusOpen(false)} fullscreenRequest={fullscreenRequest} />
    </div>
  );
}

function PlayerBar({ onOpenMixer, onOpenFocus }: { onOpenMixer(): void; onOpenFocus(): void }) {
  const layers = useFocus((s) => s.layers);
  const playing = useFocus((s) => s.playing);
  const timer = useFocus((s) => s.timer);
  const count = Object.keys(layers).length;
  const showTimer = timer.status !== "idle";
  const preset = matchPreset(layers);

  return (
    <div className="border-t border-line bg-bg/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-3 py-2 md:px-8">
        <button
          type="button"
          onClick={onOpenMixer}
          aria-label="Open the mixer"
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-[4px] py-1 text-left"
        >
          <span className="relative grid size-10 shrink-0 place-items-center rounded-[4px] border border-line bg-surface">
            {preset ? (
              <>
                <PresetIcon key={preset.id} id={preset.id} className="size-5 animate-pop-in text-muted" />
                <Eq playing={playing} className="absolute -right-1 -bottom-1 rounded-[2px] bg-bg px-[3px] py-[2px]" />
              </>
            ) : (
              <Eq playing={playing} />
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">
              <SwapText text={mixName(layers)} className="max-w-full truncate align-bottom" />
            </span>
            <span className="label-mono flex items-center gap-1.5 truncate text-faint">
              <StatusDot tone={playing ? "brand" : "idle"} pulse={playing} />
              {count} sound{count === 1 ? "" : "s"}
              {showTimer && <TimerChip />}
            </span>
          </span>
        </button>
        <IconButton label="Focus mode" variant="ghost" onClick={onOpenFocus}>
          <Expand className="size-5" />
        </IconButton>
        <IconButton label={playing ? "Pause" : "Play"} variant="solid" onClick={actions.toggle}>
          {playing ? <Pause className="size-5" fill="currentColor" /> : <Play className="size-5" fill="currentColor" />}
        </IconButton>
      </div>
    </div>
  );
}

function TimerChip() {
  const timer = useFocus((s) => s.timer);
  const { remaining } = useTimerClock(timer);
  return (
    <span className="text-brand-light">
      · {timer.mode === "focus" ? "focus" : "break"} {formatClock(remaining)}
    </span>
  );
}

function MixerSheet({
  open,
  onClose,
  onShare,
}: {
  open: boolean;
  onClose(): void;
  onShare(): Promise<ShareResult>;
}) {
  const [copied, flagCopied] = useCopied();
  const layers = useFocus((s) => s.layers);
  const volume = useFocus((s) => s.volume);
  const loading = useFocus((s) => s.loading);
  const ids = Object.keys(layers);

  useEffect(() => {
    if (open && ids.length === 0) onClose();
  }, [open, ids.length, onClose]);

  return (
    <Sheet open={open} onClose={onClose} title="Mixer">
      <div className="flex flex-col gap-4 pt-2 pb-2">
        <div className="flex items-center gap-3 rounded-[6px] border border-line bg-raised px-3 py-2">
          <IconButton label={volume > 0 ? "Mute" : "Unmute"} variant="ghost" size="sm" onClick={actions.toggleMute}>
            {volume > 0 ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </IconButton>
          <Slider label="Master volume" value={volume} onChange={actions.setVolume} className="flex-1" />
        </div>

        <ul className="flex flex-col gap-1">
          {ids.map((id) => {
            const sound = SOUND_BY_ID.get(id);
            if (!sound) return null;
            const Icon = CATEGORY_ICONS[sound.category];
            return (
              <li key={id} className="flex items-center gap-3 py-1">
                <Icon className="size-4 shrink-0 text-muted" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate text-sm">
                    {sound.label}
                    {loading.includes(id) && <span className="label-mono text-faint">loading…</span>}
                  </p>
                  <Slider
                    label={`${sound.label} volume`}
                    value={layers[id]}
                    size="sm"
                    className="mt-1.5"
                    onChange={(v) => actions.setLayerVolume(id, v)}
                  />
                </div>
                <IconButton label={`Remove ${sound.label}`} variant="ghost" size="sm" onClick={() => actions.toggleSound(id)}>
                  <Trash2 className="size-4" />
                </IconButton>
              </li>
            );
          })}
        </ul>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onShare().then((result) => result === "copied" && flagCopied())}
            className={cx(
              "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[4px] border font-mono text-xs transition-colors",
              copied ? "border-ok/60 bg-ok/10 text-ok" : "border-line-strong",
            )}
          >
            {copied ? <Check className="size-4 animate-pop-in" /> : <Share2 className="size-4" />}
            {copied ? "Link copied" : "Share mix"}
          </button>
          <span role="status" className="sr-only">
            {copied ? "Link copied" : ""}
          </span>
          <button
            type="button"
            onClick={() => {
              actions.clear();
              onClose();
            }}
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[4px] border border-line-strong font-mono text-xs text-muted"
          >
            <Trash2 className="size-4" /> Clear all
          </button>
        </div>
      </div>
    </Sheet>
  );
}
