"use client";

import { ChevronRight, Minus, Pause, Play, Plus, RotateCcw, SkipForward } from "lucide-react";
import { useEffect, useState } from "react";
import { actions, mixName, timerRemaining, useFocus, type TimerMode, type TimerSettings, type TimerState } from "@/lib/store";
import { IconButton, Switch, SwapText, cx } from "./ui";

const MODES: { id: TimerMode; label: string; short: string }[] = [
  { id: "focus", label: "Focus", short: "Focus" },
  { id: "short", label: "Short break", short: "Short" },
  { id: "long", label: "Long break", short: "Long" },
];

/** Work/break pairs offered as one-tap starting points. */
const CYCLES = [
  { focus: 25, short: 5, name: "Pomodoro" },
  { focus: 50, short: 10 },
  { focus: 52, short: 17 },
  { focus: 90, short: 20 },
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

/** Which session of the cycle is current, counting from 1. */
export const sessionInCycle = (timer: TimerState) =>
  Math.max(1, (timer.rounds % timer.settings.longEvery) + (timer.mode === "focus" ? 1 : 0));

export function TimerModes({ timer, compact, className }: { timer: TimerState; compact?: boolean; className?: string }) {
  return (
    <div
      role="group"
      aria-label="Timer mode"
      className={cx(
        "grid w-full grid-cols-3 gap-1 border p-1",
        compact ? "rounded-[14px] border-[#222] bg-[#0e0e0e]" : "rounded-[16px] border-[#232323] bg-surface",
        className,
      )}
    >
      {MODES.map((mode) => {
        const on = timer.mode === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            aria-pressed={on}
            onClick={() => actions.setTimerMode(mode.id)}
            className={cx(
              "cursor-pointer font-[550] transition-colors",
              compact ? "h-9 rounded-[10px] text-[0.8125rem]" : "h-11 rounded-[12px] text-sm",
              on ? "bg-accent text-accent-ink" : "text-soft hover:text-fg",
            )}
          >
            {compact ? mode.short : mode.label}
          </button>
        );
      })}
    </div>
  );
}

/** Sixty ticks around the clock; the lit ones are the time left. */
export function TimerDial({ timer, remaining, compact }: { timer: TimerState; remaining: number; compact?: boolean }) {
  const total = timer.settings[timer.mode] * 60_000;
  const lit = Math.round(60 * (total ? remaining / total : 0));
  const mode = MODES.find((m) => m.id === timer.mode)!;
  const clock = formatClock(remaining);
  const [mm, ss] = clock.split(":");
  return (
    <div
      role="timer"
      aria-label={`${mode.label}, ${Number(mm)} minutes ${Number(ss)} seconds left`}
      className={cx("relative aspect-square w-full", compact ? "max-w-[220px]" : "max-w-[300px] md:max-w-[360px]")}
    >
      <svg viewBox="0 0 300 300" className="absolute inset-0" aria-hidden>
        {Array.from({ length: 60 }, (_, i) => {
          const major = i % 5 === 0;
          const h = compact ? (major ? 16 : 10) : major ? 16 : 9;
          return (
            <rect
              key={i}
              x={149}
              y={0}
              width={2}
              height={h}
              rx={1}
              transform={`rotate(${i * 6} 150 150)`}
              fill={i < lit ? (major ? "var(--accent)" : "var(--body)") : "#2a2a2a"}
              className="transition-[fill] duration-500"
            />
          );
        })}
        {!compact && <circle cx="150" cy="150" r="113.5" fill="none" stroke="#1f1f1f" />}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
        {!compact && (
          <span className="text-[0.8125rem] font-medium text-muted md:text-sm">
            <SwapText text={mode.label} />
          </span>
        )}
        <span
          aria-hidden
          className={cx(
            "font-mono leading-none font-[250] tracking-[-0.04em] tabular-nums",
            compact ? "text-[clamp(2.5rem,15cqw,3.125rem)]" : "text-[clamp(3.25rem,18vw,4.125rem)] md:text-[5rem] md:tracking-[-0.045em]",
          )}
        >
          {clock}
        </span>
        <span className={cx("text-faint", compact ? "text-xs" : "text-[0.8125rem] md:text-sm")}>
          {timer.status === "paused" ? "Paused" : `Session ${sessionInCycle(timer)} of ${timer.settings.longEvery}`}
        </span>
      </div>
    </div>
  );
}

export function TimerView({ onMix }: { onMix(): void }) {
  const timer = useFocus((s) => s.timer);
  const layers = useFocus((s) => s.layers);
  const { remaining } = useTimerClock(timer);
  const running = timer.status === "running";
  const session = sessionInCycle(timer);
  const hasMix = Object.keys(layers).length > 0;

  return (
    <div className="flex flex-col pb-8 md:mt-7 md:flex-row md:flex-wrap md:items-stretch md:gap-5">
      {/* On wide screens the dial sits in a lit card, with settings and lengths beside it. */}
      <section
        aria-label="Timer"
        className="relative isolate flex flex-col md:flex-[3_1_440px] md:items-center md:overflow-hidden md:rounded-[28px] md:border md:border-[#2a1f17] md:bg-[#0e0c0b] md:p-7"
      >
        <div
          aria-hidden
          className={cx(
            "absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_42%,rgba(234,88,12,0.14)_0%,rgba(154,52,18,0.06)_45%,transparent_75%)] transition-opacity duration-700 max-md:hidden",
            running ? "opacity-100" : "opacity-55",
          )}
        />
        <div className="mt-5 md:mt-0 md:w-[min(100%,400px)]">
          <TimerModes timer={timer} />
        </div>

        <div className="mt-7 flex justify-center md:mt-8 md:w-full">
          <TimerDial timer={timer} remaining={remaining} />
        </div>

        <div aria-hidden className="mt-5 flex justify-center gap-1.5">
          {Array.from({ length: timer.settings.longEvery }, (_, i) => (
            <span
              key={i}
              className={cx(
                "h-2 rounded-full transition-all duration-300",
                i + 1 === session ? "w-6 bg-accent" : "w-2",
                i + 1 < session ? "bg-faint" : i + 1 > session && "bg-[#2e2e2e]",
              )}
            />
          ))}
        </div>

        <div className="mt-7 flex items-center justify-center gap-5 md:mt-6 md:gap-4">
          <IconButton label="Reset timer" variant="outline" size="lg" round onClick={actions.resetTimer}>
            <RotateCcw className="size-5" strokeWidth={1.75} />
          </IconButton>
          <button
            type="button"
            onClick={running ? actions.pauseTimer : actions.startTimer}
            className="inline-flex h-[60px] w-[168px] cursor-pointer items-center justify-center gap-2.5 rounded-full bg-accent text-[1.0625rem] font-semibold text-accent-ink transition-[filter,scale] hover:brightness-105 active:scale-[0.97] md:h-[58px] md:w-[180px]"
          >
            {running ? (
              <Pause className="size-[18px]" fill="currentColor" strokeWidth={0} aria-hidden />
            ) : (
              <Play className="size-[18px]" fill="currentColor" strokeWidth={0} aria-hidden />
            )}
            {running ? "Pause" : timer.status === "paused" ? "Resume" : "Start"}
          </button>
          <IconButton label="Skip to next session" variant="outline" size="lg" round onClick={actions.skipTimer}>
            <SkipForward className="size-5" strokeWidth={1.75} />
          </IconButton>
        </div>

        <div className="mt-8 grid grid-cols-2 overflow-hidden rounded-[18px] border border-[#222] bg-raised md:hidden">
          <div className="flex flex-col gap-1 border-r border-[#222] px-4 py-3.5">
            <span className="text-xs text-faint">Today</span>
            <span className="text-[0.9375rem] font-semibold">
              <span className="font-mono">{timer.rounds}</span> session{timer.rounds === 1 ? "" : "s"}
            </span>
          </div>
          <button type="button" onClick={onMix} className="flex min-w-0 cursor-pointer flex-col gap-1 px-4 py-3.5 text-left">
            <span className="text-xs text-faint">Sound</span>
            <span className="flex items-center justify-between gap-2 text-[0.9375rem] font-semibold">
              <span className="truncate">{hasMix ? mixName(layers) : "Pick a mix"}</span>
              <ChevronRight className="size-4 shrink-0 text-faint" strokeWidth={1.75} aria-hidden />
            </span>
          </button>
        </div>
        <div className="mt-5 flex items-center gap-5 text-[0.8125rem] text-muted max-md:hidden">
          <span>
            Today <span className="font-mono text-fg">{timer.rounds}</span> session{timer.rounds === 1 ? "" : "s"}
          </span>
          <button type="button" onClick={onMix} className="min-h-9 cursor-pointer text-soft underline underline-offset-4 hover:text-fg">
            Sound: {hasMix ? mixName(layers) : "pick a mix"}
          </button>
        </div>
      </section>

      <div className="flex min-w-0 flex-col md:flex-[2_1_320px] md:gap-4">
        <TimerSettingsPanel settings={timer.settings} />

        <section aria-labelledby="timer-lengths" className="mt-9 flex flex-col md:mt-0">
          <h2 id="timer-lengths" className="text-[0.9375rem] font-semibold tracking-[-0.01em]">
            Choose a length
          </h2>
          <p className="mt-1.5 mb-3.5 text-[0.8125rem] leading-[1.45] text-muted md:mt-1 md:mb-3">
            Start with the Pomodoro timer, then try 50/10 or 90/20.
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {CYCLES.map((cycle) => {
              const on = timer.settings.focus === cycle.focus && timer.settings.short === cycle.short;
              return (
                <button
                  key={cycle.focus}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    actions.updateTimerSettings({ focus: cycle.focus, short: cycle.short });
                    if (timer.status === "idle" && timer.mode !== "focus") actions.setTimerMode("focus");
                  }}
                  className={cx(
                    "flex cursor-pointer flex-col gap-2.5 rounded-[18px] border border-[#222] bg-raised p-3.5 text-left transition-shadow md:border-[#232120] md:bg-[#121110]",
                    on && "shadow-[0_0_0_2px_var(--accent)]",
                  )}
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-mono text-xl tracking-[-0.02em]">
                      {cycle.focus}/{cycle.short}
                    </span>
                    {cycle.name && <span className="text-[0.72rem] text-faint">{cycle.name}</span>}
                  </span>
                  <span aria-hidden className="flex h-1.5 gap-[3px]">
                    <span className="rounded-full bg-accent" style={{ flex: `${cycle.focus} 1 0` }} />
                    <span className="rounded-full bg-[#3a3a3a]" style={{ flex: `${cycle.short} 1 0` }} />
                  </span>
                  <span className="text-xs text-muted md:hidden">
                    {cycle.focus} min focus · {cycle.short} min break
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function TimerSettingsPanel({ settings }: { settings: TimerSettings }) {
  const stepper = (key: "focus" | "short" | "long", label: string, min: number, max: number, step: number) => (
    <div className="flex min-h-[60px] items-center justify-between border-t border-line md:min-h-14">
      <span className="text-[0.9375rem]">{label}</span>
      <div className="flex items-center gap-1">
        <IconButton
          label={`Shorter ${label.toLowerCase()}`}
          variant="outline"
          disabled={settings[key] <= min}
          onClick={() => actions.updateTimerSettings({ [key]: Math.max(min, settings[key] - step) })}
        >
          <Minus className="size-4" strokeWidth={2} />
        </IconButton>
        <span className="w-16 text-center font-mono text-sm tabular-nums">{settings[key]} min</span>
        <IconButton
          label={`Longer ${label.toLowerCase()}`}
          variant="outline"
          disabled={settings[key] >= max}
          onClick={() => actions.updateTimerSettings({ [key]: Math.min(max, settings[key] + step) })}
        >
          <Plus className="size-4" strokeWidth={2} />
        </IconButton>
      </div>
    </div>
  );

  return (
    <section
      aria-labelledby="timer-settings"
      className="mt-9 flex flex-col md:mt-0 md:rounded-[24px] md:border md:border-[#232120] md:bg-[#121110] md:px-5 md:pt-5 md:pb-2"
    >
      <h2 id="timer-settings" className="mb-2 text-[0.9375rem] font-semibold tracking-[-0.01em] md:mb-1.5">
        Settings
      </h2>
      {stepper("focus", "Focus", 5, 120, 5)}
      {stepper("short", "Short break", 1, 30, 1)}
      {stepper("long", "Long break", 5, 60, 5)}
      <div className="border-t border-line">
        <Switch
          label="Auto-start next session"
          hint="Moves into breaks and back on its own."
          checked={settings.autoStart}
          onChange={(on) => actions.updateTimerSettings({ autoStart: on })}
        />
      </div>
      <div className="border-t border-line">
        <Switch
          label="Notify when a session ends"
          hint="A chime always plays. On iPhone, notifications need the app on your Home Screen."
          checked={settings.notify}
          onChange={(on) => {
            if (on && "Notification" in window && Notification.permission === "default") Notification.requestPermission();
            actions.updateTimerSettings({ notify: on });
          }}
        />
      </div>
    </section>
  );
}

/** The timer in a card, beside the mixer on wide screens. */
export function TimerCard({ onOpen }: { onOpen(): void }) {
  const timer = useFocus((s) => s.timer);
  const { remaining } = useTimerClock(timer);
  const running = timer.status === "running";
  const { focus, short, long, autoStart } = timer.settings;
  return (
    <section aria-labelledby="timer-card" className="flex flex-col items-center rounded-[24px] border border-[#222] bg-raised p-5">
      <div className="flex items-center justify-between self-stretch">
        <h2 id="timer-card" className="text-[0.9375rem] font-semibold">
          Focus timer
        </h2>
        <span className="text-xs text-faint">
          Today <span className="font-mono text-soft">{timer.rounds}</span>
        </span>
      </div>
      <div className="mt-3.5 self-stretch">
        <TimerModes timer={timer} compact />
      </div>
      <div className="mt-5 flex w-full justify-center [container-type:inline-size]">
        <TimerDial timer={timer} remaining={remaining} compact />
      </div>
      <button
        type="button"
        onClick={running ? actions.pauseTimer : actions.startTimer}
        className="mt-5 inline-flex h-12 cursor-pointer items-center justify-center gap-2 self-stretch rounded-[14px] bg-accent text-[0.9375rem] font-semibold text-accent-ink transition-[filter] hover:brightness-105"
      >
        {running ? (
          <Pause className="size-4" fill="currentColor" strokeWidth={0} aria-hidden />
        ) : (
          <Play className="size-4" fill="currentColor" strokeWidth={0} aria-hidden />
        )}
        {running ? "Pause" : timer.status === "paused" ? "Resume" : "Start"}
      </button>
      <button type="button" onClick={onOpen} className="mt-2 min-h-9 cursor-pointer text-[0.78rem] text-muted hover:text-fg">
        {focus} · {short} · {long} min, auto-start {autoStart ? "on" : "off"}
      </button>
    </section>
  );
}
