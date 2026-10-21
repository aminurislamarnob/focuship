"use client";

import { Maximize2, Minimize2, Pause, Play, Sun, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { actions, mixName, useFocus } from "@/lib/store";
import { formatClock, sessionInCycle, useTimerClock } from "./TimerView";
import { IconButton, SwapText, cx } from "./ui";

const IDLE_MS = 3000;
const LINE_MS = 120_000;
const FULLSCREEN_FADE_MS = 400;

const LINES = [
  "One thing at a time.",
  "Start with the smallest next step.",
  "Notifications can wait.",
  "Slow is smooth. Smooth is fast.",
  "Stay with the problem a little longer.",
  "Write it down, then let it go.",
  "Good work is quiet work.",
  "Breathe out. Keep going.",
];

const MODE_LABELS = { focus: "Focus", short: "Short break", long: "Long break" } as const;

function useWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | undefined;
    let cancelled = false;
    const acquire = () => {
      if (document.visibilityState !== "visible") return;
      navigator.wakeLock
        .request("screen")
        .then((sentinel) => {
          if (cancelled) sentinel.release().catch(() => {});
          else lock = sentinel;
        })
        .catch(() => {});
    };
    acquire();
    document.addEventListener("visibilitychange", acquire);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", acquire);
      lock?.release().catch(() => {});
    };
  }, [enabled]);
}

/** The current time, refreshed every ten seconds; null until mounted (the page is prerendered). */
export function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const id = setInterval(update, 10_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/** Hours and minutes in the visitor's own 12- or 24-hour style, without the AM/PM. */
function clockParts(now: Date | null) {
  if (!now) return ["--", "--"];
  const parts = new Intl.DateTimeFormat([], { hour: "2-digit", minute: "2-digit" }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "--";
  return [get("hour").padStart(2, "0"), get("minute")];
}

interface FocusModeProps {
  open: boolean;
  onClose(): void;
  /** Bumped by the F shortcut; each new value asks for fullscreen once visible. */
  fullscreenRequest: number;
}

export function FocusMode({ open, onClose, fullscreenRequest }: FocusModeProps) {
  const root = useRef<HTMLDivElement>(null);
  const handledRequest = useRef(fullscreenRequest);
  const layers = useFocus((s) => s.layers);
  const playing = useFocus((s) => s.playing);
  const timer = useFocus((s) => s.timer);
  const { remaining, progress } = useTimerClock(timer);
  const now = useClock();
  const [idle, setIdle] = useState(false);
  const [full, setFull] = useState(false);
  const [choice, setChoice] = useState<"timer" | "clock" | null>(null);
  // A new line every couple of minutes, without extra timers.
  const line = now ? Math.floor(now.getTime() / LINE_MS) % LINES.length : 0;
  const canFullscreen = useFocus((s) => s.hydrated) && typeof document !== "undefined" && document.fullscreenEnabled;
  const hasTimer = timer.status !== "idle";
  const hasMix = Object.keys(layers).length > 0;
  const view = choice ?? (hasTimer ? "timer" : "clock");
  const running = timer.status === "running";
  const minutesLeft = Math.ceil(remaining / 60_000);

  useWakeLock(open);

  const wake = useCallback(() => setIdle(false), []);

  useEffect(() => {
    if (!open || idle) return;
    const id = setTimeout(() => setIdle(true), IDLE_MS);
    return () => clearTimeout(id);
  }, [open, idle]);

  useEffect(() => {
    if (!open) return;
    const onFull = () => {
      setFull(document.fullscreenElement === root.current);
      // The resize is abrupt; fade the contents back in so the switch feels smooth.
      if (!root.current || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      for (const child of root.current.children) {
        child.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FULLSCREEN_FADE_MS, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
      }
    };
    document.addEventListener("fullscreenchange", onFull);
    return () => document.removeEventListener("fullscreenchange", onFull);
  }, [open]);

  useEffect(() => {
    if (!open && document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!open || fullscreenRequest === handledRequest.current) return;
    handledRequest.current = fullscreenRequest;
    // Still inside the key press's user activation window, so the browser allows it.
    if (!document.fullscreenElement) root.current?.requestFullscreen?.({ navigationUI: "hide" }).catch(() => {});
  }, [open, fullscreenRequest]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else root.current?.requestFullscreen?.({ navigationUI: "hide" }).catch(() => {});
  };

  const [top, bottom] = view === "timer" ? formatClock(remaining).split(":") : clockParts(now);
  const caption =
    view === "timer"
      ? `${MODE_LABELS[timer.mode]} · Session ${sessionInCycle(timer)} of ${timer.settings.longEvery}`
      : "Local time";
  const sub =
    view === "timer"
      ? !hasTimer
        ? "Ready when you are"
        : timer.status === "paused"
          ? "Paused"
          : timer.mode === "focus"
            ? `Break in ${minutesLeft} min`
            : `Focus in ${minutesLeft} min`
      : hasTimer
        ? `${timer.mode === "focus" ? "Focus ends" : "Break ends"} in ${minutesLeft} min`
        : "";
  const chrome = cx("transition-opacity duration-700", idle && "pointer-events-none opacity-0");

  return (
    <div
      ref={root}
      hidden={!open}
      role="dialog"
      aria-modal="true"
      aria-label="Focus mode"
      onPointerMove={wake}
      onPointerDown={wake}
      onKeyDown={wake}
      className={cx("fade fixed inset-0 z-[60] overflow-hidden bg-bg text-fg", idle && "cursor-none")}
    >
      <div className="pt-safe pb-safe mx-auto flex h-full w-full max-w-4xl flex-col px-5 md:px-10">
        <div className={cx("flex items-center justify-between pt-4 md:pt-8", chrome)}>
          <IconButton label="Exit focus mode" className="-ml-2" onClick={onClose}>
            <X className="size-[22px]" strokeWidth={1.75} />
          </IconButton>
          <div className="flex items-center gap-2">
            {canFullscreen && (
              <IconButton label={full ? "Exit full screen" : "Full screen"} className="text-muted max-md:hidden" onClick={toggleFullscreen}>
                {full ? <Minimize2 className="size-5" strokeWidth={1.75} /> : <Maximize2 className="size-5" strokeWidth={1.75} />}
              </IconButton>
            )}
            <div role="group" aria-label="Show" className="flex gap-0.5 rounded-full border border-edge p-[3px]">
              {(["timer", "clock"] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={view === id}
                  onClick={() => setChoice(id)}
                  className={cx(
                    "h-[38px] cursor-pointer rounded-full px-4 text-[0.8125rem] font-[550] capitalize transition-colors",
                    view === id ? "bg-accent text-accent-ink" : "text-soft hover:text-fg",
                  )}
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-[22px]">
          <span className="inline-flex items-center gap-2 text-[0.8125rem] text-muted">
            <span aria-hidden className={cx("size-1.5 rounded-full bg-accent", (playing || running) && "animate-breathe")} />
            <SwapText text={caption} />
          </span>
          <div
            role="timer"
            aria-label={view === "timer" ? `${Number(top)} minutes ${Number(bottom)} seconds left` : `Time ${top}:${bottom}`}
            className="-ml-1.5 flex flex-col font-mono text-[clamp(7rem,43vw,10.5rem)] leading-[0.86] font-[150] tracking-[-0.07em] tabular-nums md:flex-row md:gap-[0.18em] md:text-[clamp(10rem,19vw,15rem)]"
          >
            <span>{top}</span>
            <span className="text-muted">{bottom}</span>
          </div>
          <div aria-hidden className="h-0.5 w-full overflow-hidden rounded-full bg-line">
            <div className="h-full bg-accent transition-[width] duration-500" style={{ width: `${hasTimer ? progress * 100 : 0}%` }} />
          </div>
          <div className="flex min-h-6 items-center justify-between gap-4 text-[0.8125rem] text-faint">
            <span>{sub}</span>
            {view === "timer" && (
              <button
                type="button"
                onClick={running ? actions.pauseTimer : actions.startTimer}
                className={cx("min-h-11 cursor-pointer text-soft underline underline-offset-4 hover:text-fg", chrome)}
              >
                {running ? "Pause timer" : timer.status === "paused" ? "Resume timer" : "Start timer"}
              </button>
            )}
          </div>
        </div>

        <p className="mb-[18px] text-[0.9375rem] tracking-[-0.01em] text-faint">
          <SwapText text={LINES[line]} />
        </p>

        <div className={cx("flex items-center gap-3 border-t border-line pt-4 pb-8", chrome)}>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-sm font-semibold">
              <SwapText text={hasMix ? mixName(layers) : "No sounds yet"} className="max-w-full truncate align-bottom" />
            </span>
            <span className="flex items-center gap-1.5 text-xs text-faint">
              <Sun className="size-3.5" strokeWidth={1.75} aria-hidden /> Screen stays awake
            </span>
          </div>
          <IconButton
            label={playing ? "Pause sounds" : "Play sounds"}
            round
            className="size-[52px] border border-line-strong"
            onClick={actions.toggle}
          >
            {playing ? (
              <Pause className="size-[18px]" fill="currentColor" strokeWidth={0} />
            ) : (
              <Play className="size-[18px] translate-x-px" fill="currentColor" strokeWidth={0} />
            )}
          </IconButton>
        </div>
      </div>
    </div>
  );
}
