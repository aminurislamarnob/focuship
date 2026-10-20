"use client";

import { Bell, Minus, Pause, Play, Plus, RotateCcw, SkipForward } from "lucide-react";
import { useEffect, useState } from "react";
import { actions, timerRemaining, useFocus, type TimerMode, type TimerSettings, type TimerState } from "@/lib/store";
import { IconButton, SwapText, cx } from "./ui";

const MODES: { id: TimerMode; label: string }[] = [
  { id: "focus", label: "Focus" },
  { id: "short", label: "Short break" },
  { id: "long", label: "Long break" },
];

export const formatClock = (ms: number) => {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

/** Re-renders every quarter second while the timer runs. */
export function useTimerClock(timer: TimerState) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (timer.status !== "running") return;
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 250);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [timer.status]);
  const total = timer.settings[timer.mode] * 60_000;
  const remaining = Math.min(total, timerRemaining(timer, now));
  return { remaining, progress: total ? Math.min(1, Math.max(0, 1 - remaining / total)) : 0 };
}

export function TimerView() {
  const timer = useFocus((s) => s.timer);
  const { remaining, progress } = useTimerClock(timer);
  const running = timer.status === "running";
  const r = 46;
  const circumference = 2 * Math.PI * r;
  const roundInCycle = (timer.rounds % timer.settings.longEvery) + (timer.mode === "focus" ? 1 : 0);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-8 pt-4 pb-6">
      <div role="tablist" aria-label="Timer mode" className="grid w-full grid-cols-3 rounded-[6px] border border-line bg-raised p-1">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={timer.mode === mode.id}
            onClick={() => actions.setTimerMode(mode.id)}
            className={cx(
              "h-9 cursor-pointer rounded-[4px] font-mono text-xs transition-colors",
              timer.mode === mode.id ? "bg-fg text-bg" : "text-muted hover:text-fg",
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div className="relative grid aspect-square w-full max-w-[18rem] place-items-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden>
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--line)" strokeWidth="2" />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={timer.mode === "focus" ? "var(--brand)" : "var(--ok)"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            className="transition-[stroke-dashoffset] duration-300 ease-linear"
          />
        </svg>
        <div className="text-center">
          <p className="label-mono">
            <SwapText text={MODES.find((m) => m.id === timer.mode)?.label ?? ""} />
          </p>
          <p className="mt-1 font-mono text-6xl font-medium tracking-tight tabular-nums" role="timer" aria-live="off">
            {formatClock(remaining)}
          </p>
          <p className="label-mono mt-2 text-faint">
            {timer.status === "paused" ? "Paused" : `Session ${Math.max(1, roundInCycle)} of ${timer.settings.longEvery}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <IconButton label="Reset" size="lg" onClick={actions.resetTimer}>
          <RotateCcw className="size-5" />
        </IconButton>
        <button
          type="button"
          onClick={running ? actions.pauseTimer : actions.startTimer}
          className="inline-flex h-14 min-w-36 cursor-pointer items-center justify-center gap-2.5 rounded-[4px] bg-fg px-6 font-medium text-bg hover:bg-white active:bg-neutral-300"
        >
          {running ? <Pause className="size-5" fill="currentColor" /> : <Play className="size-5" fill="currentColor" />}
          {running ? "Pause" : timer.status === "paused" ? "Resume" : "Start"}
        </button>
        <IconButton label="Skip to next session" size="lg" onClick={actions.skipTimer}>
          <SkipForward className="size-5" />
        </IconButton>
      </div>

      <p className="label-mono flex items-center gap-2">
        Today
        <span className="flex gap-1" aria-label={`${timer.rounds} focus sessions completed today`}>
          {Array.from({ length: Math.max(timer.settings.longEvery, timer.rounds) }, (_, i) => (
            <span key={i} className={cx("size-2 rounded-[1px]", i < timer.rounds ? "bg-brand" : "bg-line-strong")} />
          ))}
        </span>
        <span className="text-fg">{timer.rounds}</span>
      </p>

      <TimerSettingsPanel settings={timer.settings} />
    </div>
  );
}

function TimerSettingsPanel({ settings }: { settings: TimerSettings }) {
  const stepper = (key: "focus" | "short" | "long", label: string, min: number, max: number, step: number) => (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <IconButton
          label={`Less ${label.toLowerCase()} time`}
          size="sm"
          disabled={settings[key] <= min}
          onClick={() => actions.updateTimerSettings({ [key]: Math.max(min, settings[key] - step) })}
        >
          <Minus className="size-4" />
        </IconButton>
        <span className="w-14 text-center font-mono text-sm tabular-nums">{settings[key]} min</span>
        <IconButton
          label={`More ${label.toLowerCase()} time`}
          size="sm"
          disabled={settings[key] >= max}
          onClick={() => actions.updateTimerSettings({ [key]: Math.min(max, settings[key] + step) })}
        >
          <Plus className="size-4" />
        </IconButton>
      </div>
    </div>
  );

  const toggle = (key: "autoStart" | "notify", label: string, hint: string) => (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-3">
      <span>
        <span className="block text-sm">{label}</span>
        <span className="block text-xs text-muted">{hint}</span>
      </span>
      <input
        type="checkbox"
        checked={settings[key]}
        onChange={(e) => {
          const on = e.currentTarget.checked;
          if (key === "notify" && on && "Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
          }
          actions.updateTimerSettings({ [key]: on });
        }}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="relative h-6 w-10 shrink-0 rounded-[4px] border border-line-strong bg-raised transition-colors peer-checked:border-brand peer-checked:bg-brand peer-focus-visible:outline-2 peer-focus-visible:outline-brand-light after:absolute after:top-0.5 after:left-0.5 after:size-[1.125rem] after:rounded-[2px] after:bg-fg after:transition-transform peer-checked:after:translate-x-4"
      />
    </label>
  );

  return (
    <section aria-labelledby="timer-settings" className="w-full">
      <h2 id="timer-settings" className="label-mono mb-2">
        Settings
      </h2>
      <div className="divide-y divide-line rounded-[6px] border border-line bg-raised px-3">
        {stepper("focus", "Focus", 5, 120, 5)}
        {stepper("short", "Short break", 1, 30, 1)}
        {stepper("long", "Long break", 5, 60, 5)}
        {toggle("autoStart", "Auto-start next session", "Roll straight into the break and back.")}
        {toggle("notify", "Notify when a session ends", "A chime always plays; this adds a notification.")}
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-faint">
        <Bell className="size-3" aria-hidden /> On iPhone, notifications need the app on your Home Screen.
      </p>
    </section>
  );
}
