"use client";

import {
  Activity,
  Anchor,
  AppWindow,
  AudioLines,
  AudioWaveform,
  BellRing,
  Bird,
  BookOpen,
  Brain,
  Briefcase,
  Bug,
  Building2,
  Car,
  CarFront,
  Cat,
  Clock,
  CloudDrizzle,
  CloudLightning,
  CloudRain,
  CloudRainWind,
  Coffee,
  CookingPot,
  Disc3,
  Droplets,
  Fan,
  Feather,
  FileText,
  Fish,
  FlaskConical,
  Flame,
  Headphones,
  Hexagon,
  House,
  Keyboard,
  Landmark,
  Laptop,
  Leaf,
  LibraryBig,
  Moon,
  Mountain,
  Orbit,
  PawPrint,
  Plane,
  PlaneTakeoff,
  Radar,
  Rocket,
  Route,
  Sailboat,
  Shell,
  Ship,
  Snowflake,
  Soup,
  Sparkles,
  Sunrise,
  Tent,
  TrafficCone,
  TrainFront,
  TrainTrack,
  TramFront,
  TreePalm,
  TreePine,
  Trees,
  Type,
  Umbrella,
  Users,
  UtensilsCrossed,
  WashingMachine,
  Waves,
  Wind,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { CATEGORY_BY_ID, type CategoryId, type Sound } from "@/lib/catalog";

export const CATEGORY_ICONS: Record<CategoryId, LucideIcon> = {
  rain: CloudRain,
  nature: Trees,
  animals: Bird,
  places: Coffee,
  transport: TrainFront,
  things: Keyboard,
  urban: Building2,
  generated: AudioWaveform,
};

const PRESET_ICONS: Record<string, LucideIcon> = {
  "deep-work": Brain,
  "rainy-desk": Laptop,
  "corner-cafe": Coffee,
  "storm-watch": CloudLightning,
  coastline: Waves,
  "night-camp": Tent,
  "reading-room": BookOpen,
  "sleeper-car": TrainFront,
  "morning-trail": Sunrise,
  "deep-dive": Fish,
  "deep-space": Rocket,
};

const SOUND_ICONS: Record<string, LucideIcon> = {
  "light-rain": CloudDrizzle,
  "heavy-rain": CloudRainWind,
  thunder: CloudLightning,
  "rain-on-window": AppWindow,
  "rain-on-car-roof": Car,
  "rain-on-umbrella": Umbrella,
  "rain-on-tent": Tent,
  "rain-on-leaves": Leaf,
  river: Waves,
  waves: Shell,
  waterfall: Mountain,
  droplets: Droplets,
  campfire: Flame,
  wind: Wind,
  "wind-in-trees": TreePine,
  jungle: TreePalm,
  "walk-in-snow": Snowflake,
  birds: Bird,
  crickets: Bug,
  frog: PawPrint,
  owl: Moon,
  seagulls: Feather,
  whale: Fish,
  "cat-purring": Cat,
  beehive: Hexagon,
  cafe: Coffee,
  library: LibraryBig,
  office: Briefcase,
  restaurant: UtensilsCrossed,
  "night-village": House,
  underwater: Anchor,
  laboratory: FlaskConical,
  airport: PlaneTakeoff,
  "subway-station": TramFront,
  temple: Landmark,
  train: TrainTrack,
  "inside-a-train": TrainFront,
  airplane: Plane,
  sailboat: Sailboat,
  "rowing-boat": Ship,
  submarine: Radar,
  keyboard: Keyboard,
  typewriter: Type,
  paper: FileText,
  clock: Clock,
  "ceiling-fan": Fan,
  "wind-chimes": BellRing,
  "boiling-water": CookingPot,
  "vinyl-effect": Disc3,
  "singing-bowl": Soup,
  "washing-machine": WashingMachine,
  "busy-street": Building2,
  traffic: TrafficCone,
  highway: Route,
  road: CarFront,
  crowd: Users,
  "brown-noise": AudioWaveform,
  "pink-noise": AudioLines,
  "white-noise": Activity,
  "starship-hum": Orbit,
  theta: Moon,
  alpha: Headphones,
  beta: Zap,
  gamma: Sparkles,
};

export function SoundIcon({ sound, className, strokeWidth = 1.6 }: { sound: Sound; className?: string; strokeWidth?: number }) {
  const Icon = SOUND_ICONS[sound.id] ?? CATEGORY_ICONS[sound.category];
  return <Icon aria-hidden strokeWidth={strokeWidth} className={cx("pointer-events-none shrink-0", className)} />;
}

export function PresetIcon({ id, className, strokeWidth = 1.5 }: { id: string; className?: string; strokeWidth?: number }) {
  const Icon = PRESET_ICONS[id] ?? AudioWaveform;
  return <Icon aria-hidden strokeWidth={strokeWidth} className={cx("pointer-events-none shrink-0", className)} />;
}

/** "Recording · Rain", "Generated" or "Generated · headphones": what a layer is, in one line. */
export function soundKind(sound: Sound) {
  if (sound.source.type === "file") return `Recording · ${CATEGORY_BY_ID.get(sound.category)?.label ?? ""}`;
  return sound.source.type === "binaural" ? "Generated · headphones" : "Generated";
}

export type ShareResult = "shared" | "copied" | "cancelled" | "failed";

const COPIED_MS = 2000;

/** A flag that turns itself off after a moment, for "Copied" feedback. */
export function useCopied(): [boolean, () => void] {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const flag = () => {
    clearTimeout(timer.current);
    setCopied(true);
    navigator.vibrate?.(10);
    timer.current = setTimeout(() => setCopied(false), COPIED_MS);
  };
  return [copied, flag];
}

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** Three small level bars that sway while the mix plays. */
export function Eq({ playing, className }: { playing: boolean; className?: string }) {
  return (
    <span aria-hidden className={cx("inline-flex h-4 items-end gap-[2px]", className)}>
      {[16, 11, 14].map((h, i) => (
        <span
          key={i}
          className={cx("w-[3px] origin-bottom rounded-[1px] bg-accent", playing ? "animate-eq-fast" : "scale-y-50")}
          style={{ height: h, animationDelay: `${i * 0.3}s` }}
        />
      ))}
    </span>
  );
}

const SWAP_OUT_MS = 150;
const SWAP_IN_MS = 300;

/**
 * Text that animates when it changes: the old words blur and lift away, the
 * new ones rise into place. React renders the first value; later values are
 * written by the animation so the swap happens while the text is invisible.
 */
export function SwapText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [first] = useState(text);
  const wanted = useRef(text);
  const busy = useRef(false);

  useEffect(() => {
    const el = ref.current;
    wanted.current = text;
    if (!el || busy.current || el.textContent === text) return;

    if (document.hidden || !el.getClientRects().length || typeof el.animate !== "function") {
      el.textContent = text;
      return;
    }

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hidden = (dy: string): Keyframe =>
      reduced ? { opacity: 0 } : { opacity: 0, filter: "blur(6px)", transform: `translateY(${dy})` };
    const visible: Keyframe = reduced ? { opacity: 1 } : { opacity: 1, filter: "blur(0)", transform: "none" };

    const run = () => {
      busy.current = true;
      const out = el.animate([visible, hidden("-0.3em")], {
        duration: SWAP_OUT_MS,
        easing: "cubic-bezier(0.4, 0, 1, 1)",
        fill: "forwards",
      });
      out.finished
        .then(() => {
          el.textContent = wanted.current;
          out.cancel();
          return el.animate([hidden("0.3em"), visible], {
            duration: SWAP_IN_MS,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          }).finished;
        })
        .catch(() => {
          el.textContent = wanted.current;
        })
        .finally(() => {
          busy.current = false;
          // The text changed again mid-animation: play one more swap.
          if (el.isConnected && el.textContent !== wanted.current) run();
        });
    };
    run();
  }, [text]);

  return (
    <span ref={ref} className={cx("inline-block", className)}>
      {first}
    </span>
  );
}

export function StatusDot({ active, className }: { active: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cx("inline-block size-[7px] shrink-0 rounded-full", active ? "animate-pulse-dot bg-accent" : "bg-[#5c5c5c]", className)}
    />
  );
}

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cx(
        "inline-flex h-7 min-w-7 items-center justify-center rounded-[7px] border border-b-2 border-line-strong bg-[#161616] px-2 font-mono text-xs text-fg",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

interface SliderProps {
  value: number;
  onChange(value: number): void;
  label: string;
  size?: "sm" | "md";
  className?: string;
}

/** Horizontal travel before a touch counts as a drag rather than a scroll. */
const DRAG_SLOP = 6;
/** The thumb's diameter; its centre travels between half of it and the far end less half. */
const THUMB = 18;
const KEY_STEPS: Record<string, (v: number) => number> = {
  ArrowRight: (v) => v + 0.05,
  ArrowUp: (v) => v + 0.05,
  ArrowLeft: (v) => v - 0.05,
  ArrowDown: (v) => v - 0.05,
  PageUp: (v) => v + 0.1,
  PageDown: (v) => v - 0.1,
  Home: () => 0,
  End: () => 1,
};

/**
 * A thin track with a round thumb. Mouse drags start immediately; touch drags start once
 * the finger moves sideways, so vertical swipes still scroll the page, and a tap jumps to
 * that point. The thumb's ring takes the colour of `--slider-ring` (the surface behind it).
 */
export function Slider({ value, onChange, label, size = "md", className }: SliderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const latest = useRef(value);
  const gesture = useRef<{ id: number; x: number; y: number; dragging: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  const at = `calc(${THUMB / 2}px + (100% - ${THUMB}px) * ${pct / 100})`;

  useEffect(() => {
    latest.current = value;
  }, [value]);

  const commit = (next: number) => {
    const v = Math.round(Math.min(1, Math.max(0, next)) * 100) / 100;
    if (v === latest.current) return;
    if (v === 0 || v === 1) navigator.vibrate?.(4);
    latest.current = v;
    onChange(v);
  };

  const valueAt = (clientX: number) => {
    const rect = ref.current!.getBoundingClientRect();
    return (clientX - rect.left - THUMB / 2) / (rect.width - THUMB);
  };

  const startDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    gesture.current!.dragging = true;
    setDragging(true);
  };

  const end = () => {
    gesture.current = null;
    setDragging(false);
  };

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-valuetext={`${pct}%`}
      data-dragging={dragging || undefined}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        gesture.current = { id: e.pointerId, x: e.clientX, y: e.clientY, dragging: false };
        if (e.pointerType === "mouse") {
          e.preventDefault();
          ref.current?.focus({ preventScroll: true });
          startDrag(e);
          commit(valueAt(e.clientX));
        }
      }}
      onPointerMove={(e) => {
        const g = gesture.current;
        if (!g || g.id !== e.pointerId) return;
        if (!g.dragging) {
          const dx = Math.abs(e.clientX - g.x);
          if (dx < DRAG_SLOP || dx < Math.abs(e.clientY - g.y)) return;
          startDrag(e);
        }
        commit(valueAt(e.clientX));
      }}
      onPointerUp={(e) => {
        const g = gesture.current;
        if (g && !g.dragging && g.id === e.pointerId) commit(valueAt(e.clientX));
        end();
      }}
      onPointerCancel={end}
      onKeyDown={(e) => {
        const step = KEY_STEPS[e.key];
        if (!step) return;
        e.preventDefault();
        commit(step(latest.current));
      }}
      className={cx(
        "group relative w-full cursor-pointer touch-pan-y rounded-full select-none",
        size === "sm" ? "h-7" : "h-8",
        className,
      )}
    >
      <span aria-hidden className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-[#2e2e2e]">
        <span
          className={cx("absolute inset-y-0 left-0 bg-accent", !dragging && "transition-[width] duration-150 ease-out")}
          style={{ width: at }}
        />
      </span>
      <span
        aria-hidden
        className={cx(
          "absolute top-1/2 size-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg shadow-[0_0_0_4px_var(--slider-ring,var(--bg))] transition-transform duration-150",
          !dragging && "[transition-property:left,scale]",
          dragging && "scale-110",
        )}
        style={{ left: at }}
      />
    </div>
  );
}

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: "sm" | "md" | "lg";
  variant?: "outline" | "ghost" | "solid";
  round?: boolean;
}

export function IconButton({ label, size = "md", variant = "ghost", round, className, children, ...rest }: IconButtonProps) {
  const sizes = { sm: "size-9", md: "size-11", lg: "size-[52px]" };
  const variants = {
    outline: "border border-edge bg-surface text-fg hover:bg-surface-2",
    ghost: "text-fg hover:bg-white/[0.04]",
    solid: "bg-accent text-accent-ink hover:brightness-105",
  };
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        "inline-grid shrink-0 cursor-pointer place-items-center transition-[background-color,filter,scale] active:scale-95 disabled:cursor-default disabled:opacity-40",
        round ? "rounded-full" : "rounded-[12px]",
        sizes[size],
        variants[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/** An on/off switch with a visible label and an optional hint line. */
export function Switch({ checked, onChange, label, hint }: { checked: boolean; onChange(on: boolean): void; label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-3.5">
      <span className="flex flex-col gap-1">
        <span className="text-[0.9375rem]">{label}</span>
        {hint && <span className="text-[0.78rem] leading-[1.45] text-faint">{hint}</span>}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.currentTarget.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className={cx(
          "mt-1.5 flex h-8 w-[52px] shrink-0 items-center rounded-full border p-[3px] transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-fg",
          checked ? "justify-end border-accent bg-accent" : "justify-start border-line-strong bg-line",
        )}
      >
        <span className={cx("size-6 rounded-full transition-colors", checked ? "bg-accent-ink" : "bg-faint")} />
      </span>
    </label>
  );
}

interface SheetProps {
  open: boolean;
  onClose(): void;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
}

/** A bottom sheet on phones (swipe its header down to dismiss) that becomes a centred panel on wider screens. */
export function Sheet({ open, onClose, title, subtitle, children }: SheetProps) {
  const panel = useRef<HTMLDivElement>(null);
  const [dragY, setDragY] = useState(0);
  const drag = useRef<{ y: number; t: number } | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  // Native-style swipe-to-dismiss: the sheet follows the finger from the header,
  // closes past a distance or on a quick flick, and springs back otherwise.
  const dragStart = (e: React.PointerEvent) => {
    if (!matchMedia("(max-width: 767px)").matches) return;
    if ((e.target as HTMLElement).closest("button")) return;
    drag.current = { y: e.clientY, t: e.timeStamp };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const dragMove = (e: React.PointerEvent) => {
    if (drag.current) setDragY(Math.max(0, e.clientY - drag.current.y));
  };
  const dragEnd = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dy = Math.max(0, e.clientY - drag.current.y);
    const flick = dy / Math.max(1, e.timeStamp - drag.current.t) > 0.5;
    drag.current = null;
    setDragY(0);
    if (dy > 120 || (dy > 24 && flick)) onClose();
  };

  return (
    <>
      <div hidden={!open} className="fade fixed inset-0 z-40 bg-black/60" onClick={onClose} />
      <div
        hidden={!open}
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={dragY > 0 ? { translate: `0 ${dragY}px`, transition: "none" } : undefined}
        className="sheet fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] w-full max-w-lg flex-col rounded-t-[28px] border-t border-[#2a2a2a] bg-surface outline-none [--slider-ring:var(--surface)] md:bottom-auto md:top-[12dvh] md:max-h-[76dvh] md:rounded-[24px] md:border"
      >
        <div
          className="touch-none px-5"
          onPointerDown={dragStart}
          onPointerMove={dragMove}
          onPointerUp={dragEnd}
          onPointerCancel={() => {
            drag.current = null;
            setDragY(0);
          }}
        >
          <div className="mx-auto mt-2.5 h-[5px] w-9 rounded-full bg-[#3a3a3a] md:hidden" aria-hidden />
          <div className="mt-3.5 flex items-start justify-between gap-3 md:mt-5">
            <div className="flex min-w-0 flex-col gap-1">
              <h2 id={titleId} className="text-[1.375rem] font-semibold tracking-[-0.03em]">
                {title}
              </h2>
              {subtitle && <p className="text-[0.8125rem] text-muted">{subtitle}</p>}
            </div>
            <IconButton label="Close" onClick={onClose} className="-mt-1.5 -mr-2.5 text-muted">
              <X className="size-5" strokeWidth={1.75} />
            </IconButton>
          </div>
        </div>
        <div className="no-scrollbar overflow-y-auto overscroll-contain px-5 pt-3 pb-[max(2rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </>
  );
}

/** A stable pseudo-random number in [0, 1) for a seed, so prerendered and hydrated markup agree. */
const hash = (seed: number) => {
  const v = Math.sin(seed) * 43758.5453;
  return v - Math.floor(v);
};

/** The mix's level bars: a still silhouette that sways while it plays, flat when the mix is empty. Size it with a height class. */
export function Waveform({ playing, empty, bars = 46, className }: {
  playing: boolean;
  empty: boolean;
  bars?: number;
  className?: string;
}) {
  return (
    <div aria-hidden className={cx("flex items-center gap-[3px]", className)}>
      {Array.from({ length: bars }, (_, i) => {
        const a = Math.abs(Math.sin(i * 0.42 + 0.3));
        const b = Math.abs(Math.sin(i * 1.37));
        const env = 0.55 + 0.45 * Math.sin(i * 0.11 + 0.6);
        const level = 0.125 + 0.86 * (0.55 * a + 0.45 * b) * env;
        return (
          <span
            key={i}
            className={cx("min-w-0 flex-1 rounded-[2px] bg-accent transition-[height,opacity] duration-700 ease-out-strong", playing && !empty && "animate-eq")}
            style={{
              height: empty ? 3 : `${(level * 100).toFixed(1)}%`,
              opacity: empty ? 0.3 : 0.28 + 0.72 * level,
              animationDelay: `${((i * 137) % 900) / 1000}s`,
            }}
          />
        );
      })}
    </div>
  );
}

/** A warm ember glow and a faint field of letters spelled from the mix, behind the player card. */
export function EmberBackdrop({ text, playing, glyphs = 40 }: { text: string; playing: boolean; glyphs?: number }) {
  const letters = text.toLowerCase().replace(/[^a-z]/g, "") || "onethingatatime";
  return (
    <>
      <div
        aria-hidden
        className={cx("absolute inset-0 -z-10 transition-opacity duration-1000", playing && "animate-glow")}
        style={{
          opacity: playing ? 1 : 0.45,
          background:
            "radial-gradient(120% 75% at 80% 14%, rgb(234 88 12 / 0.24) 0%, rgb(154 52 18 / 0.12) 40%, rgb(14 12 11 / 0) 72%), radial-gradient(90% 55% at 8% 100%, rgb(194 65 12 / 0.1) 0%, rgb(14 12 11 / 0) 70%)",
        }}
      />
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden font-mono text-xs leading-none">
        {Array.from({ length: glyphs }, (_, i) => {
          const x = Math.round(hash(i * 1.7 + 1) * 94 + 2);
          const y = Math.round(hash(i * 3.1 + 7) * 92 + 2);
          const warm = x > 40 && y < 62 && hash(i * 5.3 + 3) > 0.35;
          return (
            <span
              key={i}
              className="absolute"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                color: warm ? "#f08a4b" : "var(--fg)",
                opacity: 0.05 + hash(i * 7.7 + 2) * (warm ? 0.16 : 0.08),
              }}
            >
              <span
                className={cx("inline-block", playing && "animate-twinkle")}
                style={{ animationDelay: `${(hash(i * 9.1 + 4) * 5).toFixed(2)}s` }}
              >
                {letters[i % letters.length]}
              </span>
            </span>
          );
        })}
      </div>
    </>
  );
}

/** Line art for each built-in preset, drawn into a 170×84 frame and cropped to fill. */
export function PresetArt({ id, className }: { id: string; className?: string }) {
  // Pattern ids must be unique per instance; useId's punctuation isn't safe inside url(#…).
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const p = (name: string) => `${uid}-${name}`;
  const fill = (name: string) => `url(#${p(name)})`;
  const art: Record<string, ReactNode> = {
    "deep-work": (
      <>
        <path d="M0 46C28 26 56 66 85 46S142 26 170 46" strokeWidth="1.4" strokeOpacity="0.9" />
        <path d="M0 56C28 38 56 74 85 56S142 38 170 56" strokeOpacity="0.45" />
        <path d="M0 66C28 50 56 82 85 66S142 50 170 66" strokeOpacity="0.2" />
        <circle cx="134" cy="24" r="4" strokeOpacity="0.9" />
        <circle cx="134" cy="24" r="10" strokeOpacity="0.4" />
        <circle cx="134" cy="24" r="16" strokeOpacity="0.16" />
      </>
    ),
    "rainy-desk": (
      <>
        <defs>
          <pattern id={p("rain")} width="9" height="13" patternUnits="userSpaceOnUse" patternTransform="rotate(14)">
            <path d="M4 0v6" strokeOpacity="0.55" />
          </pattern>
          <pattern id={p("keys")} width="13" height="11" patternUnits="userSpaceOnUse">
            <rect x="1.5" y="1.5" width="9.5" height="7.5" rx="1.5" strokeOpacity="0.5" />
          </pattern>
        </defs>
        <rect width="170" height="56" fill={fill("rain")} stroke="none" />
        <path d="M0 58.5h170" strokeOpacity="0.35" />
        <rect x="6" y="63" width="158" height="22" fill={fill("keys")} stroke="none" />
      </>
    ),
    "corner-cafe": (
      <>
        <path d="M84 12l-2 6M102 8l-2 6M120 14l-2 6M138 8l-2 6M156 12l-2 6" strokeOpacity="0.35" />
        <circle cx="32" cy="58" r="10" strokeOpacity="0.8" />
        <circle cx="32" cy="58" r="4.5" strokeOpacity="0.35" />
        <circle cx="72" cy="44" r="6" strokeOpacity="0.5" />
        <circle cx="108" cy="60" r="12" strokeOpacity="0.8" />
        <circle cx="108" cy="60" r="5.5" strokeOpacity="0.35" />
        <circle cx="146" cy="40" r="5" strokeOpacity="0.45" />
        <circle cx="152" cy="70" r="3" strokeOpacity="0.4" />
        <circle cx="62" cy="72" r="2.5" strokeOpacity="0.4" />
      </>
    ),
    "storm-watch": (
      <>
        <defs>
          <pattern id={p("storm")} width="6" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
            <path d="M3 0v10" strokeOpacity="0.42" />
          </pattern>
        </defs>
        <rect width="170" height="84" fill={fill("storm")} stroke="none" />
        <path d="M114 4 100 38h12L96 80" stroke="var(--art-bg)" strokeWidth="7" strokeLinejoin="round" />
        <path d="M114 4 100 38h12L96 80" strokeWidth="2" strokeLinejoin="round" />
      </>
    ),
    coastline: (
      <>
        <path d="M0 36q10.625-6 21.25 0t21.25 0 21.25 0 21.25 0 21.25 0 21.25 0 21.25 0 21.25 0" strokeOpacity="0.28" />
        <path d="M0 50q14.17-8 28.33 0t28.33 0 28.33 0 28.33 0 28.33 0 28.33 0" strokeOpacity="0.5" />
        <path d="M0 64q21.25-10 42.5 0t42.5 0 42.5 0 42.5 0" strokeWidth="1.4" strokeOpacity="0.85" />
        <path d="M0 77q10.625-5 21.25 0t21.25 0 21.25 0 21.25 0 21.25 0 21.25 0 21.25 0 21.25 0" strokeOpacity="0.35" />
        <path d="M112 16q5-5 10 0 5-5 10 0M140 24q3.5-3.5 7 0 3.5-3.5 7 0" strokeOpacity="0.8" strokeLinecap="round" />
      </>
    ),
    "night-camp": (
      <>
        <g fill="var(--fg)" stroke="none">
          {[
            [100, 12, 1],
            [124, 22, 0.8],
            [148, 10, 1.2],
            [158, 34, 0.8],
            [138, 42, 0.7],
            [30, 44, 0.8],
            [18, 62, 1],
            [46, 58, 0.7],
            [150, 62, 0.9],
            [128, 66, 0.6],
            [112, 36, 0.7],
          ].map(([cx, cy, r]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
          ))}
        </g>
        <path d="M85 78C72 70 76 56 85 42c9 14 13 28 0 36z" strokeOpacity="0.9" />
        <path d="M85 78c-6-5-4-14 0-22 4 8 6 17 0 22z" strokeOpacity="0.5" />
        <path d="M64 84l42-9M64 75l42 9" strokeOpacity="0.45" strokeLinecap="round" />
      </>
    ),
    "reading-room": (
      <>
        <defs>
          <pattern id={p("lines")} width="8" height="7" patternUnits="userSpaceOnUse">
            <path d="M0 3.5h8" strokeOpacity="0.4" />
          </pattern>
        </defs>
        <rect x="18" y="36" width="60" height="40" fill={fill("lines")} stroke="none" />
        <rect x="92" y="14" width="60" height="62" fill={fill("lines")} stroke="none" />
        <path d="M85 10v70" strokeOpacity="0.3" />
        <path d="M152 76c-8 0-12 2-14 6" strokeOpacity="0.6" />
      </>
    ),
    "sleeper-car": (
      <>
        <defs>
          <pattern id={p("ties")} width="10" height="20" patternUnits="userSpaceOnUse">
            <path d="M5 0v20" strokeOpacity="0.4" />
          </pattern>
          <pattern id={p("drizzle")} width="14" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(14)">
            <path d="M7 0v5" strokeOpacity="0.42" />
          </pattern>
        </defs>
        <rect width="170" height="50" fill={fill("drizzle")} stroke="none" />
        <rect y="60" width="170" height="16" fill={fill("ties")} stroke="none" />
        <path d="M0 62h170M0 74h170" strokeOpacity="0.85" />
      </>
    ),
    "morning-trail": (
      <>
        <path d="M20 84c20-24 50-18 66-34s42-10 64-32" strokeOpacity="0.8" />
        <path d="M40 84c18-18 44-12 60-28s38-10 60-30" strokeOpacity="0.32" />
        <path d="M104 16q4-4 8 0 4-4 8 0M128 9q3-3 6 0 3-3 6 0M84 24q3-3 6 0 3-3 6 0" strokeOpacity="0.75" strokeLinecap="round" />
        <path d="M0 74q7-3 14 0t14 0 14 0 14 0" strokeOpacity="0.4" />
      </>
    ),
    "deep-dive": (
      <>
        <path d="M0 10q10.625-4 21.25 0t21.25 0 21.25 0 21.25 0 21.25 0 21.25 0 21.25 0 21.25 0" strokeOpacity="0.45" />
        <circle cx="48" cy="66" r="7" strokeOpacity="0.8" />
        <circle cx="62" cy="48" r="4" strokeOpacity="0.6" />
        <circle cx="54" cy="34" r="2.5" strokeOpacity="0.5" />
        <circle cx="118" cy="68" r="10" strokeOpacity="0.8" />
        <circle cx="132" cy="46" r="5" strokeOpacity="0.6" />
        <circle cx="124" cy="30" r="3" strokeOpacity="0.45" />
        <circle cx="94" cy="58" r="2" strokeOpacity="0.4" />
        <circle cx="152" cy="62" r="2.5" strokeOpacity="0.4" />
      </>
    ),
    "deep-space": (
      <>
        <g fill="var(--fg)" stroke="none">
          {[
            [24, 52, 1],
            [44, 70, 0.8],
            [60, 44, 0.7],
            [82, 18, 1],
            [150, 14, 0.9],
            [162, 72, 1.1],
            [142, 78, 0.6],
            [86, 76, 0.8],
            [68, 62, 0.6],
            [164, 40, 0.7],
            [102, 8, 0.6],
            [14, 76, 0.7],
          ].map(([cx, cy, r]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
          ))}
        </g>
        <ellipse cx="114" cy="48" rx="46" ry="13" transform="rotate(-12 114 48)" strokeOpacity="0.5" />
        <circle cx="114" cy="48" r="13" fill="var(--art-bg)" strokeOpacity="0.9" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 170 84"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      stroke="var(--fg)"
      aria-hidden
      className={cx("block [--art-bg:#0e0e0e]", className)}
    >
      {art[id] ?? (
        // Your own presets: a quiet stack of level bars.
        <g strokeOpacity="0.55" strokeLinecap="round">
          {[30, 46, 22, 58, 38, 50, 26, 44, 34, 54, 24, 40].map((h, i) => (
            <path key={i} d={`M${22 + i * 11.5} ${42 + h / 2}V${42 - h / 2}`} strokeWidth="2" />
          ))}
        </g>
      )}
    </svg>
  );
}
