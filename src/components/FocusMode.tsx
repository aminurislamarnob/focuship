"use client";

import { Maximize2, Minimize2, Pause, Play, Timer, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { actions, matchPreset, mixHue, mixName, useFocus } from "@/lib/store";
import { formatClock, useTimerClock } from "./TimerView";
import { Ambient, IconButton, PresetIcon, Slider, StatusDot, SwapText, cx } from "./ui";

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

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const id = setInterval(update, 10_000);
    return () => clearInterval(id);
  }, []);
  return now;
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
  const volume = useFocus((s) => s.volume);
  const timer = useFocus((s) => s.timer);
  const { remaining } = useTimerClock(timer);
  const now = useClock();
  const [idle, setIdle] = useState(false);
  const [full, setFull] = useState(false);
  // A new line every couple of minutes, without extra timers.
  const line = now ? Math.floor(now.getTime() / LINE_MS) % LINES.length : 0;
  const canFullscreen = useFocus((s) => s.hydrated) && typeof document !== "undefined" && document.fullscreenEnabled;
  const hasTimer = timer.status !== "idle";
  const hasMix = Object.keys(layers).length > 0;
  const preset = matchPreset(layers);

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

  const clock = now?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) ?? "";

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
      className={cx("fade fixed inset-0 z-[60] isolate overflow-hidden bg-bg text-fg", idle && "cursor-none")}
    >
      {open && <Ambient hue={mixHue(layers)} active={playing} className="-z-10" />}

      <div className="pt-safe absolute inset-x-0 top-0">
        <div
          className={cx(
            "flex items-center justify-between px-4 py-3 transition-opacity duration-700",
            idle && "pointer-events-none opacity-0",
          )}
        >
          <p className="label-mono flex items-center gap-2">
            <StatusDot tone={playing ? "brand" : "idle"} pulse={playing} /> Focus mode
          </p>
          <div className="flex gap-2">
            {canFullscreen && (
              <IconButton label={full ? "Exit full screen" : "Full screen"} onClick={toggleFullscreen}>
                {full ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
              </IconButton>
            )}
            <IconButton label="Close focus mode" onClick={onClose}>
              <X className="size-4" />
            </IconButton>
          </div>
        </div>
      </div>

      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="label-mono">
          <SwapText text={hasTimer ? (timer.mode === "focus" ? "Focus" : "Break") : "Local time"} />
        </p>
        <p className="mt-2 font-mono text-[clamp(4.5rem,22vw,11rem)] leading-none font-medium tracking-tighter tabular-nums">
          {hasTimer ? formatClock(remaining) : clock}
        </p>
        <p className="mt-6 max-w-sm text-lg text-balance text-muted sm:text-xl">
          <SwapText text={LINES[line]} />
        </p>
      </div>

      <div className="pb-safe absolute inset-x-0 bottom-0">
        <div
          className={cx(
            "mx-auto flex max-w-lg flex-col gap-3 px-4 pb-5 transition-opacity duration-700",
            idle && "pointer-events-none opacity-0",
          )}
        >
          <p className="flex items-center justify-center gap-2 truncate text-center text-sm text-muted">
            {preset && <PresetIcon key={preset.id} id={preset.id} className="size-4 animate-pop-in text-faint" />}
            <SwapText text={hasMix ? mixName(layers) : "No sounds yet"} />
            {hasMix && <SwapText className="ml-1 text-faint" text={`· ${playing ? "playing" : "paused"}`} />}
          </p>
          <div className="flex items-center gap-3">
            <IconButton label={playing ? "Pause sounds" : "Play sounds"} size="lg" variant="solid" onClick={actions.toggle}>
              {playing ? <Pause className="size-5" fill="currentColor" /> : <Play className="size-5" fill="currentColor" />}
            </IconButton>
            <Slider label="Volume" value={volume} onChange={actions.setVolume} className="flex-1" />
            <IconButton
              label={timer.status === "running" ? "Pause timer" : "Start timer"}
              size="lg"
              onClick={timer.status === "running" ? actions.pauseTimer : actions.startTimer}
              className={cx(timer.status === "running" && "border-brand text-brand-light")}
            >
              <Timer className="size-5" />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}
