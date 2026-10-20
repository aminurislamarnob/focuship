"use client";

import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { CATEGORIES, SOUNDS, type Sound } from "@/lib/catalog";
import { NEW_LAYER_VOLUME as DEFAULT_VOLUME, actions, useFocus } from "@/lib/store";
import { CATEGORY_ICONS, Eq, Slider, SoundIcon, cx } from "./ui";

const COUNTS = new Map(CATEGORIES.map((c) => [c.id, SOUNDS.filter((s) => s.category === c.id).length]));

const matches = (sound: Sound, query: string) => {
  const haystack = `${sound.label} ${sound.note ?? ""} ${sound.category}`.toLowerCase();
  return query.split(/\s+/).every((word) => haystack.includes(word));
};

export function SoundsView() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const groups = useMemo(
    () =>
      CATEGORIES.map((category) => ({
        category,
        sounds: SOUNDS.filter((s) => s.category === category.id && (!q || matches(s, q))),
      })).filter((g) => g.sounds.length > 0),
    [q],
  );

  const jump = (id: string) =>
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="pb-6">
      <div className="sticky top-0 z-10 -mx-4 border-b border-line bg-bg/90 px-4 pt-1 pb-3 backdrop-blur-md">
        <label className="relative block">
          <span className="sr-only">Search sounds</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${SOUNDS.length} sounds`}
            autoComplete="off"
            enterKeyHint="search"
            className="h-11 w-full rounded-[4px] border border-line-strong bg-raised pr-10 pl-9 text-base outline-none placeholder:text-faint focus:border-brand md:text-sm"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 cursor-pointer place-items-center text-muted"
            >
              <X className="size-4" />
            </button>
          )}
        </label>
        {!q && (
          <nav aria-label="Categories" className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
            {CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICONS[c.id];
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => jump(c.id)}
                  className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-[4px] border border-line bg-raised px-2.5 font-mono text-xs text-muted hover:text-fg"
                >
                  <Icon className="size-3.5" aria-hidden />
                  {c.label}
                  <span className="text-faint">{COUNTS.get(c.id)}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {groups.length === 0 && (
        <p className="py-16 text-center text-sm text-muted">
          Nothing called “{query.trim()}”. Try rain, café or noise.
        </p>
      )}

      {groups.map(({ category, sounds }) => {
        const Icon = CATEGORY_ICONS[category.id];
        return (
          <section key={category.id} id={`cat-${category.id}`} className="scroll-mt-32 pt-6" aria-labelledby={`h-${category.id}`}>
            <h2 id={`h-${category.id}`} className="label-mono mb-3 flex items-center gap-2">
              <Icon className="size-3.5" aria-hidden />
              {category.label}
              <span className="text-faint">{sounds.length}</span>
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {sounds.map((sound) => (
                <SoundTile key={sound.id} sound={sound} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function SoundTile({ sound }: { sound: Sound }) {
  const volume = useFocus((s) => s.layers[sound.id]);
  const playing = useFocus((s) => s.playing);
  const loading = useFocus((s) => s.loading.includes(sound.id));
  const on = volume !== undefined;

  return (
    <div
      className={cx(
        "group relative isolate flex flex-col overflow-hidden rounded-[6px] border transition-colors",
        on ? "border-brand/70 bg-brand/[0.07]" : "border-line bg-raised",
      )}
    >
      {/* The icon sits behind the content in the top-right corner. */}
      <SoundIcon
        sound={sound}
        className={cx(
          "absolute top-2 right-2 -z-10 size-9 transition-[color,scale,rotate] duration-300 ease-out-strong",
          "group-hover:-rotate-6 group-hover:scale-105",
          on ? "text-brand/25" : "text-white/[0.07] group-hover:text-white/[0.12]",
        )}
      />
      <button
        type="button"
        aria-pressed={on}
        data-sound={sound.id}
        onClick={() => actions.toggleSound(sound.id)}
        className="flex min-h-[4.25rem] cursor-pointer flex-col items-start pt-3 pr-11 pb-2 pl-3 text-left"
      >
        <span className="flex w-full min-w-0 items-center gap-2">
          <span className="truncate text-sm font-medium">{sound.label}</span>
          {on &&
            (loading ? (
              <span
                className="size-3 shrink-0 animate-spin rounded-full border-2 border-brand border-t-transparent"
                aria-label="Loading"
              />
            ) : (
              <Eq playing={playing} className="shrink-0" />
            ))}
        </span>
        <span className="mt-0.5 truncate font-mono text-[0.6875rem] text-faint">
          {sound.note ?? (sound.source.type === "file" ? "Recording" : "Generated")}
        </span>
      </button>
      <div className="px-2.5 pb-2.5">
        {/* Dragging an inactive tile's slider adds the sound at that volume. */}
        <Slider
          label={`${sound.label} volume`}
          value={volume ?? DEFAULT_VOLUME}
          quiet={!on}
          size="sm"
          onChange={(v) => actions.setLayerVolume(sound.id, v)}
        />
      </div>
    </div>
  );
}
