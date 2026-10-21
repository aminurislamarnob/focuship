"use client";

import { Expand, LayoutGrid, Pause, Play, Share, SlidersVertical, Timer, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { SOUND_BY_ID } from "@/lib/catalog";
import type { PageIntent } from "@/lib/pages";
import { startPwa } from "@/lib/pwa";
import { actions, matchPreset, mixName, useFocus, type Tab } from "@/lib/store";
import { CLOUD_ENABLED } from "@/lib/supabase";
import { FocusMode, useClock } from "./FocusMode";
import { Logo } from "./Logo";
import { MixSheet } from "./MixSheet";
import { MixView } from "./MixView";
import { SoundsView, type SoundGuide } from "./SoundsView";
import { TimerView } from "./TimerView";
import { Eq, IconButton, PresetArt, SwapText, cx } from "./ui";
import { Avatar, YouView } from "./YouView";

const TABS: { id: Tab; label: string; title: string; icon: typeof Timer; href?: string }[] = [
  { id: "mix", label: "Mix", title: "Focuship", icon: SlidersVertical, href: "/" },
  { id: "sounds", label: "Sounds", title: "Sounds", icon: LayoutGrid, href: "/sounds" },
  { id: "timer", label: "Timer", title: "Timer", icon: Timer, href: "/timer" },
  // "You" has no page of its own: it opens in place, over whatever page you are on.
  { id: "you", label: "You", title: "You", icon: UserRound },
];

interface FocusShellProps {
  /** The page's H1 and one-line intro. */
  heading: string;
  intro: string;
  /** What a landing page loads on arrival (mix, tab, timer lengths). */
  intent?: PageIntent;
  /** Site links, shown in the sidebar and in the You tab on phones. */
  nav?: ReactNode;
  /** Landing pages for single sounds, listed under the sound library. */
  guides?: SoundGuide[];
  /** Page copy rendered below the active view, inside the scroll area. */
  children?: ReactNode;
}

export function FocusShell({ heading, intro, intent, nav, guides = [], children }: FocusShellProps) {
  const tab = useFocus((s) => s.tab);
  const [focusOpen, setFocusOpen] = useState(false);
  const [fullscreenRequest, setFullscreenRequest] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const notice = useFocus((s) => s.notice);

  useEffect(() => {
    actions.visit(intent);
    startPwa();
  }, [intent]);

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(actions.dismissNotice, 4000);
    return () => clearTimeout(id);
  }, [notice]);

  const router = useRouter();
  /** Shows a tab now; tabs with a page of their own also move there. */
  const go = useCallback(
    (next: Tab) => {
      actions.setTab(next);
      const href = TABS.find((t) => t.id === next)?.href;
      if (href) router.push(href);
    },
    [router],
  );
  const openFocus = useCallback(() => setFocusOpen(true), []);
  const openSheet = useCallback(() => setSheetOpen(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
      const target = e.target as HTMLElement;
      if (target.closest?.("input, textarea, select, [contenteditable]")) return;
      if (e.key === " " && !target.closest("button, a, [role=tab], summary")) {
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
      } else if (["1", "2", "3", "4"].includes(e.key) && !focusOpen) {
        go(TABS[Number(e.key) - 1].id);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [focusOpen, go]);

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar tab={tab} nav={nav} onGo={go} onOpenFocus={openFocus} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="pt-safe shrink-0 md:hidden">
          <div className="flex h-11 items-center justify-between pr-3 pl-5">
            {tab === "mix" ? (
              <Link href="/" aria-label="Focuship home" className="flex h-11 items-center">
                <Logo />
              </Link>
            ) : (
              <span className="text-[0.9375rem] font-semibold">{TABS.find((t) => t.id === tab)?.title}</span>
            )}
            <div className="flex gap-1">
              <IconButton label="Focus mode" onClick={openFocus}>
                <Expand className="size-[22px]" strokeWidth={1.75} />
              </IconButton>
              {tab === "mix" && (
                <IconButton label="Save or share this mix" onClick={openSheet}>
                  <Share className="size-[22px]" strokeWidth={1.75} />
                </IconButton>
              )}
            </div>
          </div>
        </header>

        <main className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto w-full max-w-[1180px] px-5 pt-4 md:px-8 md:pt-7">
            <PageHeading tab={tab} heading={heading} intro={intro} onOpenFocus={openFocus} onOpenSheet={openSheet} />
            <div hidden={tab !== "mix"} className="view-in">
              <MixView
                onOpenSheet={openSheet}
                onBrowse={() => go("sounds")}
                onTimer={() => go("timer")}
                onAbout={() => go("you")}
              />
            </div>
            <div hidden={tab !== "sounds"} className="view-in">
              <SoundsView guides={guides} />
            </div>
            <div hidden={tab !== "timer"} className="view-in">
              <TimerView onMix={() => actions.setTab("mix")} />
            </div>
            <div hidden={tab !== "you"} className="view-in">
              <YouView nav={nav} />
            </div>
            {children}
          </div>
        </main>

        <div className={cx("pb-safe relative shrink-0 px-3 pt-2 md:px-8 md:pb-4", tab === "mix" && "md:p-0")}>
          {notice && (
            <div
              role="status"
              className="absolute inset-x-4 bottom-full mb-3 rounded-[14px] border border-line-strong bg-surface-2 px-4 py-3 text-sm shadow-lg md:mx-auto md:max-w-md"
            >
              {notice}
            </div>
          )}
          {tab !== "mix" && <MiniPlayer onOpen={() => actions.setTab("mix")} />}
          <TabBar tab={tab} onGo={go} />
        </div>
      </div>

      <MixSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
      <FocusMode open={focusOpen} onClose={() => setFocusOpen(false)} fullscreenRequest={fullscreenRequest} />
    </div>
  );
}

/**
 * The page's one H1. On the mixer it is a quiet caption above the player; on the
 * library and the timer it is the view's title; the You tab brings its own title.
 */
function PageHeading({ tab, heading, intro, onOpenFocus, onOpenSheet }: {
  tab: Tab;
  heading: string;
  intro: string;
  onOpenFocus(): void;
  onOpenSheet(): void;
}) {
  if (tab === "mix") {
    return (
      <header className="flex min-h-11 flex-wrap items-center justify-between gap-3 md:mb-7">
        <h1 className="text-[0.8125rem] font-medium text-faint md:text-sm">{heading}</h1>
        <p className="sr-only">{intro}</p>
        <div className="flex gap-2 max-md:hidden">
          <button type="button" onClick={onOpenFocus} className={outlineButton}>
            <Expand className="size-4" strokeWidth={1.75} aria-hidden /> Focus mode
          </button>
          <button type="button" onClick={onOpenSheet} className={outlineButton}>
            <Share className="size-4" strokeWidth={1.75} aria-hidden /> Share mix
          </button>
        </div>
      </header>
    );
  }
  return (
    <header className={cx("flex flex-col gap-2 pt-2 md:pt-0", tab === "you" && "sr-only")}>
      <h1 className="text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.035em] text-balance md:text-[2rem]">{heading}</h1>
      <p className="max-w-xl text-sm leading-[1.45] text-muted">{intro}</p>
    </header>
  );
}

const outlineButton =
  "inline-flex h-10 cursor-pointer items-center gap-2 rounded-[12px] border border-edge px-3.5 text-[0.84rem] transition-colors hover:bg-white/[0.04]";

function Sidebar({ tab, nav, onGo, onOpenFocus }: { tab: Tab; nav?: ReactNode; onGo(tab: Tab): void; onOpenFocus(): void }) {
  const user = useFocus((s) => s.account.user);
  const now = useClock();
  const link = "flex min-h-9 w-full cursor-pointer items-center rounded-[10px] px-2.5 text-[0.84rem] text-body transition-colors hover:bg-white/[0.03] hover:text-fg";
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-[#1a1a1a] md:flex">
      <div className="px-7 pt-7 pb-6">
        <Link href="/" aria-label="Focuship home" onClick={() => actions.setTab("mix")} className="inline-flex">
          <Logo size={26} className="gap-2.5 text-[1.1875rem]" />
        </Link>
      </div>
      <nav aria-label="Main" className="flex flex-col gap-0.5 px-[18px]">
        {TABS.filter((t) => t.href).map(({ id, label, icon: Icon, href }, i) => (
          <Link
            key={id}
            href={href!}
            onClick={() => actions.setTab(id)}
            aria-current={tab === id ? "page" : undefined}
            className={cx(
              "flex h-10 items-center gap-2.5 rounded-[10px] px-2.5 text-sm transition-colors",
              tab === id ? "bg-[#161616] font-[550] text-fg" : "text-muted hover:bg-white/[0.03] hover:text-fg",
            )}
          >
            <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden />
            {label}
            <kbd className="label-mono ml-auto text-[0.6875rem]">{i + 1}</kbd>
          </Link>
        ))}
      </nav>
      <div className="no-scrollbar mt-7 flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-[18px] pb-6">
        {nav}
        <div className="flex flex-col">
          <button type="button" onClick={onOpenFocus} className={link}>
            Focus mode <kbd className="label-mono ml-auto text-[0.6875rem]">V</kbd>
          </button>
          <button type="button" onClick={() => onGo("you")} aria-current={tab === "you" ? "page" : undefined} className={cx(link, tab === "you" && "bg-[#161616] text-fg")}>
            {CLOUD_ENABLED && user ? "You" : <>About &amp; offline</>} <kbd className="label-mono ml-auto text-[0.6875rem]">4</kbd>
          </button>
          {CLOUD_ENABLED && (
            <Link href="/account" className={link}>
              <span className="truncate">{user ? user.name : "Sign in"}</span>
              {user && <span className="ml-auto size-1.5 shrink-0 rounded-full bg-ok" aria-hidden />}
            </Link>
          )}
        </div>
      </div>
      <div className="mx-[18px] flex flex-col gap-1 border-t border-[#1a1a1a] px-2.5 pt-4 pb-7">
        <span className="h-7 font-mono text-[1.375rem] font-light tracking-[-0.03em]">
          {now?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) ?? ""}
        </span>
        <span className="text-[0.78rem] text-faint">One thing at a time.</span>
      </div>
    </aside>
  );
}

/** The floating bottom tab bar on phones. */
function TabBar({ tab, onGo }: { tab: Tab; onGo(tab: Tab): void }) {
  const user = useFocus((s) => s.account.user);
  return (
    <nav aria-label="Tabs" className="mt-2 mb-[max(0px,calc(26px-env(safe-area-inset-bottom)))] md:hidden">
      <div className="grid grid-cols-4 rounded-[26px] border border-[#232323] bg-surface p-1.5">
        {TABS.map(({ id, label, icon: Icon, href }) => {
          const active = tab === id;
          // Signed in, the You tab shows your avatar, ringed when it is the current tab.
          const avatar = id === "you" && CLOUD_ENABLED && user;
          const inner = (
            <>
              <span
                className={cx(
                  "grid h-7 w-[52px] place-items-center rounded-full transition-[background-color,scale] duration-200 group-active:scale-90",
                  avatar ? "" : active ? "bg-accent text-accent-ink" : "text-faint",
                )}
              >
                {avatar ? (
                  <Avatar
                    user={user}
                    className={cx(
                      "size-6 text-[0.59rem] font-[650]",
                      active ? "shadow-[0_0_0_2px_var(--surface),0_0_0_3.5px_var(--accent)]" : "opacity-80",
                    )}
                  />
                ) : (
                  <Icon className="size-5" strokeWidth={active ? 1.9 : 1.75} aria-hidden />
                )}
              </span>
              <span className={cx("text-[0.6875rem]", active ? "font-semibold text-fg" : "font-medium text-faint")}>{label}</span>
            </>
          );
          const className = "group flex min-h-[54px] cursor-pointer flex-col items-center justify-center gap-1";
          return href ? (
            <Link key={id} href={href} onClick={() => actions.setTab(id)} aria-current={active ? "page" : undefined} className={className}>
              {inner}
            </Link>
          ) : (
            <button key={id} type="button" onClick={() => onGo(id)} aria-current={active ? "page" : undefined} className={className}>
              {inner}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/** The current mix in one row, with play/pause; shown on every tab but the mixer. */
function MiniPlayer({ onOpen }: { onOpen(): void }) {
  const layers = useFocus((s) => s.layers);
  const playing = useFocus((s) => s.playing);
  const ids = Object.keys(layers);
  const preset = matchPreset(layers);
  const detail = ids.length ? ids.map((id) => SOUND_BY_ID.get(id)?.label ?? id).join(", ") : "No sounds yet";

  return (
    <div className="flex h-16 items-center gap-1 rounded-[20px] border border-edge bg-[#161616] px-2 md:mx-auto md:max-w-lg">
      <button type="button" onClick={onOpen} aria-label="Open the mixer" className="flex h-14 min-w-0 flex-1 cursor-pointer items-center gap-3 text-left">
        <span className="size-[46px] shrink-0 overflow-hidden rounded-[12px] border border-[#232323] bg-[#0e0e0e]">
          <PresetArt id={preset?.id ?? "custom"} className="size-full" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold">
            <SwapText text={ids.length ? mixName(layers) : "Pick a soundscape"} className="max-w-full truncate align-bottom" />
          </span>
          <span className="truncate text-xs text-muted">
            {detail}
          </span>
        </span>
        {ids.length > 0 && <Eq playing={playing} className="mr-1.5" />}
      </button>
      <IconButton label={playing ? "Pause" : "Play"} variant="solid" round onClick={actions.toggle}>
        {playing ? <Pause className="size-[18px]" fill="currentColor" strokeWidth={0} /> : <Play className="size-[18px] translate-x-px" fill="currentColor" strokeWidth={0} />}
      </IconButton>
    </div>
  );
}
