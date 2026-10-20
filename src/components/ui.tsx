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
  PawPrint,
  Plane,
  PlaneTakeoff,
  Radar,
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
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { CategoryId, Sound } from "@/lib/catalog";

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
  theta: Moon,
  alpha: Headphones,
  beta: Zap,
  gamma: Sparkles,
};

export function SoundIcon({ sound, className }: { sound: Sound; className?: string }) {
  const Icon = SOUND_ICONS[sound.id] ?? CATEGORY_ICONS[sound.category];
  return <Icon aria-hidden strokeWidth={1.25} className={cx("pointer-events-none shrink-0", className)} />;
}

export function PresetIcon({ id, className, strokeWidth = 1.5 }: { id: string; className?: string; strokeWidth?: number }) {
  const Icon = PRESET_ICONS[id] ?? AudioWaveform;
  return <Icon aria-hidden strokeWidth={strokeWidth} className={cx("pointer-events-none shrink-0", className)} />;
}

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Eq({ playing, className }: { playing: boolean; className?: string }) {
  return (
    <span aria-hidden className={cx("inline-flex h-3 items-end gap-[2px]", className)}>
      {[0, -0.35, -0.6, -0.2].map((delay, i) => (
        <span
          key={i}
          className={cx("h-full w-[3px] origin-bottom rounded-[1px] bg-brand", playing ? "animate-eq" : "scale-y-30")}
          style={{ animationDelay: `${delay}s` }}
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

export function StatusDot({ tone = "brand", pulse }: { tone?: "brand" | "ok" | "idle"; pulse?: boolean }) {
  const color = tone === "ok" ? "bg-ok" : tone === "idle" ? "bg-faint" : "bg-brand";
  return <span aria-hidden className={cx("inline-block size-1.5 rounded-full", color, pulse && "animate-pulse-dot")} />;
}

interface SliderProps {
  value: number;
  onChange(value: number): void;
  label: string;
  /** Inactive styling: a neutral fill instead of the brand colour. */
  quiet?: boolean;
  size?: "sm" | "md";
  className?: string;
}

/** Horizontal travel before a touch counts as a drag rather than a scroll. */
const DRAG_SLOP = 6;
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
 * A filled bar slider. Mouse drags start immediately; touch drags start once
 * the finger moves sideways, so vertical swipes still scroll the page, and a
 * tap jumps to that point.
 */
export function Slider({ value, onChange, label, quiet, size = "md", className }: SliderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const latest = useRef(value);
  const gesture = useRef<{ id: number; x: number; y: number; dragging: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);

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

  const at = (clientX: number) => {
    const rect = ref.current!.getBoundingClientRect();
    return (clientX - rect.left) / rect.width;
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
          commit(at(e.clientX));
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
        commit(at(e.clientX));
      }}
      onPointerUp={(e) => {
        const g = gesture.current;
        if (g && !g.dragging && g.id === e.pointerId) commit(at(e.clientX));
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
        "relative isolate cursor-pointer touch-pan-y overflow-hidden rounded-[6px] bg-white/[0.06] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)] transition-colors select-none hover:bg-white/[0.08]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-light",
        size === "sm" ? "h-7" : "h-9",
        className,
      )}
    >
      <div
        aria-hidden
        className={cx(
          "absolute inset-y-0 left-0 rounded-[6px]",
          !dragging && "transition-[width] duration-150 ease-out",
          quiet
            ? "bg-white/[0.11]"
            : "bg-linear-to-r from-brand-dark to-brand shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_0_18px_-4px_var(--brand)]",
        )}
        style={{ width: `max(${pct}%, 0.875rem)` }}
      >
        <span
          className={cx(
            "absolute inset-y-[22%] right-[5px] w-[3px] rounded-full transition-transform duration-150",
            quiet ? "bg-white/35" : "bg-white/90",
            dragging && "scale-y-125",
          )}
        />
      </div>
      <span
        aria-hidden
        className={cx(
          "pointer-events-none absolute inset-y-0 right-2.5 flex items-center font-mono text-[0.6875rem] tabular-nums transition-colors",
          dragging ? "text-white" : quiet ? "text-faint" : "text-white/65",
        )}
      >
        {pct}
      </span>
    </div>
  );
}

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: "sm" | "md" | "lg";
  variant?: "outline" | "ghost" | "solid";
}

export function IconButton({ label, size = "md", variant = "outline", className, children, ...rest }: IconButtonProps) {
  const sizes = { sm: "size-9", md: "size-11", lg: "size-14" };
  const variants = {
    outline: "border border-line-strong bg-raised/60 text-fg hover:bg-surface-2 active:bg-surface-2",
    ghost: "text-muted hover:text-fg active:text-fg",
    solid: "bg-fg text-bg hover:bg-white active:bg-neutral-300",
  };
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        "inline-grid shrink-0 cursor-pointer place-items-center rounded-[4px] transition-colors disabled:opacity-40",
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

interface SheetProps {
  open: boolean;
  onClose(): void;
  title: string;
  children: ReactNode;
}

/** A bottom sheet on phones that becomes a centred panel on wider screens. */
export function Sheet({ open, onClose, title, children }: SheetProps) {
  const panel = useRef<HTMLDivElement>(null);

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

  return (
    <>
      <div hidden={!open} className="fade fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
      <div
        hidden={!open}
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="sheet fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] w-full max-w-lg flex-col rounded-t-[10px] border border-b-0 border-line-strong bg-surface outline-none md:bottom-auto md:top-[12dvh] md:max-h-[76dvh] md:rounded-[8px] md:border-b"
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-line-strong md:hidden" aria-hidden />
        <div className="flex items-center justify-between px-4 pt-2 pb-1 md:pt-3">
          <h2 className="label-mono">{title}</h2>
          <IconButton label="Close" variant="ghost" size="sm" onClick={onClose}>
            <X className="size-4" />
          </IconButton>
        </div>
        <div className="no-scrollbar overflow-y-auto overscroll-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </>
  );
}

const GLYPHS = "·.:+-=*%#01/\\<>{}";

/**
 * A field of faint monospace glyphs that flicker slowly, washed with the
 * mix's colour. It draws a handful of cells per frame and idles when hidden.
 */
export function Ambient({ hue, active, className }: { hue: number; active: boolean; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cell = 18;
    let cols = 0;
    let rows = 0;
    let cells: { ch: string; a: number }[] = [];
    let frame = 0;
    let last = 0;

    const draw = (i: number) => {
      const x = (i % cols) * cell;
      const y = Math.floor(i / cols) * cell;
      const c = cells[i];
      ctx.clearRect(x, y, cell, cell);
      if (c.a <= 0) return;
      ctx.fillStyle = `rgba(255,255,255,${c.a})`;
      ctx.fillText(c.ch, x + cell / 2, y + cell / 2);
    };

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const { width, height } = el.getBoundingClientRect();
      el.width = Math.round(width * dpr);
      el.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `11px ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      cols = Math.ceil(width / cell);
      rows = Math.ceil(height / cell);
      cells = Array.from({ length: cols * rows }, () => ({
        ch: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        a: Math.random() < 0.12 ? Math.random() * 0.12 : 0,
      }));
      ctx.clearRect(0, 0, width, height);
      cells.forEach((_, i) => draw(i));
    };

    const step = (t: number) => {
      frame = requestAnimationFrame(step);
      if (document.hidden || t - last < 80) return;
      last = t;
      const changes = Math.max(2, Math.floor(cells.length * (activeRef.current ? 0.012 : 0.004)));
      for (let n = 0; n < changes; n++) {
        const i = Math.floor(Math.random() * cells.length);
        cells[i] =
          Math.random() < 0.55
            ? { ch: GLYPHS[Math.floor(Math.random() * GLYPHS.length)], a: 0.04 + Math.random() * 0.16 }
            : { ch: " ", a: 0 };
        draw(i);
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    if (!reduced) frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <div aria-hidden className={cx("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div
        className="absolute inset-0 transition-[background] duration-[1500ms]"
        style={{
          background: `radial-gradient(90% 70% at 50% 110%, hsl(${hue} 70% 38% / ${active ? 0.38 : 0.2}), transparent 70%), radial-gradient(60% 50% at 85% 0%, hsl(${(hue + 30) % 360} 60% 30% / 0.14), transparent 70%)`,
        }}
      />
      <canvas ref={canvas} className="absolute inset-0 size-full" />
    </div>
  );
}
