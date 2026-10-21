"use client";

import { ChevronRight, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CATEGORIES, SOUNDS, type CategoryId, type Sound } from "@/lib/catalog";
import { actions, useFocus } from "@/lib/store";
import { CATEGORY_ICONS, cx } from "./ui";

/** A landing page for one sound, listed under the library. */
export interface SoundGuide {
  href: string;
  label: string;
  description: string;
}

const COUNTS = new Map(CATEGORIES.map((c) => [c.id, SOUNDS.filter((s) => s.category === c.id).length]));
/** Every sound's place in the library, 01 to 64, so the numbering stays put while filtering. */
const NUMBERS = new Map(
  CATEGORIES.flatMap((c) => SOUNDS.filter((s) => s.category === c.id)).map((s, i) => [s.id, String(i + 1).padStart(2, "0")]),
);
const RECORDINGS = SOUNDS.filter((s) => s.source.type === "file").length;

const matches = (sound: Sound, query: string) => {
  const haystack = `${sound.label} ${sound.note ?? ""} ${sound.category}`.toLowerCase();
  return query.split(/\s+/).every((word) => haystack.includes(word));
};

export function SoundsView({ guides }: { guides: SoundGuide[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CategoryId | "all">("all");
  const q = query.trim().toLowerCase();
  const groups = useMemo(
    () =>
      CATEGORIES.filter((category) => filter === "all" || filter === category.id)
        .map((category) => ({
          category,
          sounds: SOUNDS.filter((s) => s.category === category.id && (!q || matches(s, q))),
        }))
        .filter((g) => g.sounds.length > 0),
    [q, filter],
  );

  const chips: { id: CategoryId | "all"; label: string; count: number }[] = [
    { id: "all", label: "All", count: SOUNDS.length },
    ...CATEGORIES.map((c) => ({ id: c.id, label: c.label, count: COUNTS.get(c.id) ?? 0 })),
  ];

  return (
    <div className="flex flex-col pb-8">
      <p className="mt-2 text-sm text-muted">
        {RECORDINGS} recordings, {SOUNDS.length - RECORDINGS} generated on your device.
      </p>

      <label className="mt-4 flex h-12 items-center gap-2.5 rounded-[14px] border border-edge bg-surface px-3.5 md:max-w-md">
        <Search className="size-[18px] shrink-0 text-muted" strokeWidth={1.75} aria-hidden />
        <span className="sr-only">Search sounds</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${SOUNDS.length} sounds`}
          autoComplete="off"
          enterKeyHint="search"
          className="h-11 min-w-0 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-faint md:text-[0.9375rem] [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="-mr-1.5 grid size-8 cursor-pointer place-items-center text-muted">
            <X className="size-4" />
          </button>
        )}
      </label>

      <div role="group" aria-label="Categories" className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
        {chips.map((chip) => {
          const on = filter === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              aria-pressed={on}
              onClick={() => setFilter(chip.id)}
              className={cx(
                "inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-[550] whitespace-nowrap transition-colors",
                on ? "border-accent bg-accent text-accent-ink" : "border-edge bg-surface text-soft hover:text-fg",
              )}
            >
              {chip.label}
              <span className="font-mono text-[0.6875rem] opacity-75">{chip.count}</span>
            </button>
          );
        })}
      </div>

      {groups.length === 0 && <p className="mt-7 text-sm text-muted">No sounds match “{query.trim()}”.</p>}

      {groups.map(({ category, sounds }) => {
        const Icon = CATEGORY_ICONS[category.id];
        return (
          <section key={category.id} className="mt-7 flex flex-col gap-3" aria-labelledby={`h-${category.id}`}>
            <div className="flex h-6 items-center gap-2.5">
              <Icon className="size-5 text-soft" strokeWidth={1.6} aria-hidden />
              <h2 id={`h-${category.id}`} className="flex-1 text-[0.9375rem] font-semibold tracking-[-0.01em]">
                {category.label}
              </h2>
              <span className="label-mono">{sounds.length}</span>
            </div>
            {category.id === "generated" && (
              <p className="-mt-1 text-[0.78rem] text-muted">
                Generated on-device, nothing to download. Binaural tones need headphones.
              </p>
            )}
            <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 lg:grid-cols-8">
              {sounds.map((sound) => (
                <SoundPad key={sound.id} sound={sound} />
              ))}
            </div>
          </section>
        );
      })}

      {guides.length > 0 && (
        <section aria-labelledby="sound-guides" className="mt-10 flex flex-col md:max-w-xl">
          <h2 id="sound-guides" className="text-[0.9375rem] font-semibold tracking-[-0.01em]">
            Sound guides
          </h2>
          <p className="mt-1.5 mb-3 text-[0.8125rem] text-muted">What each sound is, and how to use it to focus.</p>
          {guides.map((guide) => (
            <Link key={guide.href} href={guide.href} className="flex min-h-16 items-center gap-3 border-t border-line">
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[0.9375rem] font-[550]">{guide.label}</span>
                <span className="truncate text-[0.78rem] text-faint">{guide.description}</span>
              </span>
              <ChevronRight className="size-[18px] shrink-0 text-faint" strokeWidth={1.75} aria-hidden />
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}

/** One sound: tap to add or remove it. The fill rising from the bottom is its volume in the mix. */
function SoundPad({ sound }: { sound: Sound }) {
  const volume = useFocus((s) => s.layers[sound.id]);
  const loading = useFocus((s) => s.loading.includes(sound.id));
  const on = volume !== undefined;
  const level = on ? Math.round(volume * 100) : 0;
  const generated = sound.source.type !== "file";
  const headphones = sound.source.type === "binaural";
  const tag = on ? (loading ? "…" : String(level)) : headphones ? "GEN·HP" : generated ? "GEN" : "";

  return (
    <button
      type="button"
      aria-pressed={on}
      data-sound={sound.id}
      aria-label={`${sound.label}, ${generated ? "generated" : "recording"}${headphones ? ", headphones" : ""}${on ? `, in mix at ${level}` : ""}`}
      onClick={() => actions.toggleSound(sound.id)}
      className={cx(
        "relative flex h-20 cursor-pointer flex-col justify-between overflow-hidden rounded-[14px] border p-2 pb-[9px] text-left transition-[background-color,border-color,scale] duration-200 active:scale-[0.96]",
        on ? "border-[#3a3a3a] bg-[#1a1a1a]" : "border-line bg-raised hover:border-edge",
      )}
    >
      <span aria-hidden className="absolute inset-x-0 bottom-0 bg-accent/[0.14] transition-[height] duration-300" style={{ height: `${level}%` }} />
      <span
        aria-hidden
        className={cx("absolute inset-x-0 h-0.5 bg-accent transition-[bottom,opacity] duration-300", !on && "opacity-0")}
        style={{ bottom: `${level}%` }}
      />
      <span aria-hidden className={cx("relative flex items-center justify-between font-mono text-[0.625rem] leading-none", on ? "text-accent" : "text-faint")}>
        <span>{NUMBERS.get(sound.id)}</span>
        <span>{tag}</span>
      </span>
      <span className={cx("relative text-xs leading-[1.2] font-[550]", on ? "text-fg" : "text-soft")}>{sound.label}</span>
    </button>
  );
}
