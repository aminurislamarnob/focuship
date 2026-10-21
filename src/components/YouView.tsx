"use client";

import { Bookmark, ChevronLeft, ChevronRight, Download, Heart, Link2, RefreshCw, Share, SquarePlus, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { SOUND_BY_ID, SOUNDS } from "@/lib/catalog";
import { countCached, downloadSounds, isIos, isStandalone, useInstallPrompt } from "@/lib/pwa";
import type { CloudUser } from "@/lib/cloud";
import { actions, matchPreset, presetByRef, useFocus } from "@/lib/store";
import { REPO_URL } from "@/lib/site";
import { CLOUD_ENABLED } from "@/lib/supabase";
import { IconButton, Kbd, PauseIcon, PlayIcon, cx } from "./ui";

const noSubscribe = () => () => {};
const FILE_PATHS = SOUNDS.flatMap((s) => (s.source.type === "file" ? [s.source.path] : []));
const SHORTCUTS: [string, string[]][] = [
  ["Play or pause", ["Space"]],
  ["Focus mode", ["V"]],
  ["Full screen", ["F"]],
  ["Mute", ["M"]],
  ["Search sounds", ["/"]],
  ["Switch tabs", ["1", "2", "3", "4"]],
];
const PERKS = [
  { icon: Heart, label: "Favorites" },
  { icon: Bookmark, label: "Your presets" },
  { icon: Link2, label: "Share links" },
  { icon: RefreshCw, label: "Settings sync" },
];

const sectionTitle = "text-[0.9375rem] font-semibold tracking-[-0.01em] md:text-base";
const card = "mt-2.5 flex flex-col rounded-[18px] border border-[#222] bg-raised p-4";
/** On wide screens each section becomes a card in a grid; a card nested inside it flattens. */
const wideCard = "md:rounded-[24px] md:border md:border-[#232120] md:p-6";
const wideFilled = `${wideCard} md:bg-[#121110]`;
const flatten = "md:mt-3.5 md:rounded-none md:border-0 md:bg-transparent md:p-0";

/**
 * Signed in: your profile, presets, favorites and a link to the rest. Signed out (or from that link):
 * account perks, offline sounds, installing, privacy, shortcuts and credits.
 */
export function YouView({ nav }: { nav?: ReactNode }) {
  const visible = useFocus((s) => s.tab === "you");
  const user = useFocus((s) => s.account.user);
  const [details, setDetails] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const signedIn = CLOUD_ENABLED && user !== null;

  const show = (next: boolean) => {
    setDetails(next);
    root.current?.closest("main")?.scrollTo({ top: 0 });
  };

  if (signedIn && !details) {
    return (
      <div ref={root}>
        <Profile user={user} visible={visible} onMore={() => show(true)} />
      </div>
    );
  }

  return (
    <div ref={root} className="flex flex-col gap-8 pb-8 md:gap-7">
      <div className="flex flex-col">
        {signedIn && (
          <button type="button" onClick={() => show(false)} className="-ml-2.5 flex h-11 cursor-pointer items-center gap-0.5 self-start pr-2.5 text-[0.9375rem]">
            <ChevronLeft className="size-[22px]" strokeWidth={1.75} aria-hidden /> You
          </button>
        )}
        <h2 className="mt-2 text-[2.125rem] leading-[1.1] font-semibold tracking-[-0.04em] md:mt-0 md:text-[2.25rem] md:leading-[1.08]">
          About &amp; offline
        </h2>
        <p className="mt-2 max-w-[620px] text-[0.9375rem] text-muted max-md:hidden">
          Focuship layers up to {SOUNDS.length} sounds with their own volume, runs a Pomodoro-style timer with breaks and a chime,
          and has a Focus mode that keeps the screen awake.
        </p>
      </div>
      {/* Masonry on wide screens: columns of at least 340px, each card stacked under the last. */}
      <div className="flex flex-col gap-8 md:block md:columns-[340px] md:gap-4 md:[&>*]:mb-4 md:[&>*]:break-inside-avoid">
        {CLOUD_ENABLED && !user && <AccountCard />}
        {CLOUD_ENABLED && !user && <NoPresets />}
        <OfflineSounds visible={visible} />
        <Install />
        <section aria-labelledby="you-privacy" className={cx("flex flex-col", wideCard)}>
          <h3 id="you-privacy" className={sectionTitle}>
            Free, private and offline
          </h3>
          <p className="mt-2 text-sm leading-[1.55] text-muted">
            No account is needed for the mixer or the timer, and there are no tracking cookies. Mixes can be shared as links.
          </p>
          <Link href="/privacy" className="mt-1 inline-flex min-h-11 items-center self-start text-sm underline underline-offset-4">
            Privacy policy
          </Link>
        </section>
        <section aria-labelledby="you-keys" className={cx("flex flex-col", wideCard)}>
          <div className="flex items-baseline justify-between">
            <h3 id="you-keys" className={sectionTitle}>
              Keyboard shortcuts
            </h3>
            <span className="text-xs text-faint">With a keyboard</span>
          </div>
          <dl className="mt-2.5 flex flex-col border-b border-line md:grid md:grid-cols-2 md:gap-x-6 md:border-b-0">
            {SHORTCUTS.map(([action, keys]) => (
              <div
                key={action}
                className={cx(
                  "flex min-h-12 items-center justify-between gap-3 border-t border-line md:min-h-11",
                  // Four keys don't fit half a card: that row takes the full width.
                  keys.length > 2 && "md:col-span-2",
                )}
              >
                <dt className="text-sm whitespace-nowrap">{action}</dt>
                <dd className="flex gap-1">
                  {keys.map((key) => (
                    <Kbd key={key} className={key === "Space" ? "min-w-16" : undefined}>
                      {key}
                    </Kbd>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </section>
        {nav && (
          <section aria-label="Explore" className="md:hidden">
            {nav}
          </section>
        )}
        <section aria-labelledby="you-maker" className={cx("flex flex-col", wideCard)}>
          <h3 id="you-maker" className={sectionTitle}>
            Made by
          </h3>
          <div className="mt-3 flex items-center gap-3">
            {/* Plain <img>: the static export has no image loader. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/aminur-islam-arnob.webp"
              alt=""
              width={44}
              height={44}
              loading="lazy"
              className="size-11 shrink-0 rounded-full border border-line object-cover"
            />
            <span className="flex min-w-0 flex-col">
              <span className="text-[0.9375rem] font-semibold">Aminur Islam Arnob</span>
              <span className="text-[0.8125rem] text-muted">Sr. Software Engineer, Dhaka</span>
            </span>
          </div>
          <p className="mt-3 text-sm leading-[1.55] text-muted">
            Six years of building websites, WordPress themes, plugins and WooCommerce solutions, plus small apps for focus
            and planning. Focuship is one of them.
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4">
            {[
              ["aminurislam.me", "https://aminurislam.me/"],
              ["GitHub", "https://github.com/aminurislamarnob"],
              ["LinkedIn", "https://www.linkedin.com/in/aminur-islam-arnob"],
            ].map(([label, href]) => (
              <a key={href} href={href} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center text-sm underline underline-offset-4">
                {label}
              </a>
            ))}
          </div>
        </section>
        <section aria-labelledby="you-credits" className={cx("flex flex-col", wideCard)}>
          <h3 id="you-credits" className={cx(sectionTitle, "max-md:sr-only")}>
            Credits &amp; stack
          </h3>
          <p className="text-[0.78rem] leading-[1.55] text-faint md:mt-2.5 md:text-sm md:text-muted">
            Recordings from{" "}
            <a className="text-soft underline underline-offset-2" href="https://github.com/remvze/moodist" target="_blank" rel="noopener">
              Moodist
            </a>{" "}
            by remvze (MIT). Sounds under the Pixabay Content License or CC0.
          </p>
          <p className="mt-2 text-[0.78rem] leading-[1.55] text-faint md:text-sm md:text-muted">
            Hosted on Cloudflare.{CLOUD_ENABLED && " Accounts and sync by Supabase."}{" "}
            <a className="text-soft underline underline-offset-2" href={REPO_URL} target="_blank" rel="noopener">
              Source on GitHub
            </a>{" "}
            (MIT).
          </p>
        </section>
      </div>
    </div>
  );
}

/** Up to two initials from a display name; an email-only name gives its first letter. */
function initials(name: string) {
  if (name.includes("@")) return name[0].toUpperCase();
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

/** The account's picture, or its initials on a warm disc. */
export function Avatar({ user, className }: { user: CloudUser; className?: string }) {
  if (user.avatarUrl) {
    // Plain <img>: the static export has no image loader, and avatar hosts need no-referrer.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" className={cx("shrink-0 rounded-full object-cover", className)} />;
  }
  return (
    <span aria-hidden className={cx("grid shrink-0 place-items-center rounded-full bg-[#2a1f17] font-semibold text-[#f0b48a]", className)}>
      {initials(user.name)}
    </span>
  );
}

const row = "flex min-h-[52px] items-center justify-between border-t border-line text-[0.9375rem]";

function Profile({ user, visible, onMore }: { user: CloudUser; visible: boolean; onMore(): void }) {
  const offline = useOfflineSounds(visible);
  return (
    <div className="flex flex-col pb-8 md:max-w-xl">
      <section aria-label="Profile" className="mt-3 flex items-center gap-4">
        <Avatar user={user} className="size-16 text-[1.375rem] tracking-[-0.02em] shadow-[0_0_0_2px_var(--bg),0_0_0_3px_#3a2a1e]" />
        <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
          <h2 className="truncate text-2xl leading-[1.15] font-semibold tracking-[-0.03em]">{user.name}</h2>
          {user.email && user.email !== user.name && <span className="truncate text-[0.84rem] text-muted">{user.email}</span>}
        </span>
      </section>

      <Link href="/account" className="mt-5 flex min-h-[52px] items-center gap-3 rounded-[16px] border border-[#232120] bg-[#121110] px-4">
        <UserRound className="size-[18px] text-soft" strokeWidth={1.75} aria-hidden />
        <span className="flex-1 text-[0.9375rem]">Manage account</span>
        <span className="text-[0.78rem] text-faint">Settings sync on</span>
        <ChevronRight className="size-4 text-faint" strokeWidth={1.75} aria-hidden />
      </Link>

      <ProfilePresets />
      <Favorites />

      <section aria-labelledby="you-offline-short" className="mt-7 flex flex-col">
        <h3 id="you-offline-short" className={sectionTitle}>
          Offline sounds
        </h3>
        <button
          type="button"
          onClick={offline.download}
          disabled={offline.all || offline.progress !== null}
          className="mt-2.5 flex min-h-14 cursor-pointer items-center gap-3 rounded-[16px] border border-[#232120] bg-[#121110] px-4 text-left disabled:cursor-default"
        >
          <span className="flex-1 text-sm">
            {offline.saved} of {FILE_PATHS.length} recordings saved
          </span>
          <span className="text-[0.8125rem] text-muted">
            {offline.all ? "All saved" : offline.progress !== null ? `Saving ${offline.progress} / ${FILE_PATHS.length}` : "Save all · 80 MB"}
          </span>
        </button>
        {offline.error && <p className="mt-2 text-xs text-danger">{offline.error}</p>}
      </section>

      <section aria-label="More" className="mt-7 flex flex-col border-b border-line">
        <button type="button" onClick={onMore} className={cx(row, "cursor-pointer text-left")}>
          Install, shortcuts &amp; credits
          <ChevronRight className="size-4 text-faint" strokeWidth={1.75} aria-hidden />
        </button>
        <Link href="/privacy" className={row}>
          Privacy policy
          <ChevronRight className="size-4 text-faint" strokeWidth={1.75} aria-hidden />
        </Link>
        <button type="button" onClick={() => actions.signOut()} className={cx(row, "cursor-pointer text-danger")}>
          Sign out
        </button>
      </section>
    </div>
  );
}

/** Your saved mixes, each with its own play button. */
function ProfilePresets() {
  const presets = useFocus((s) => s.account.presets);
  const layers = useFocus((s) => s.layers);
  const playing = useFocus((s) => s.playing);
  const current = matchPreset(layers)?.id;

  return (
    <section aria-labelledby="you-presets" className="mt-8 flex flex-col">
      <div className="flex items-baseline justify-between">
        <h3 id="you-presets" className={sectionTitle}>
          Your presets
        </h3>
        {presets.length > 0 && <span className="label-mono">{presets.length}</span>}
      </div>
      {presets.length === 0 ? (
        <EmptyPresets />
      ) : (
        <ul className="mt-2.5 flex flex-col">
          {presets.map((preset) => {
            const ids = Object.keys(preset.layers);
            const live = current === preset.id && playing;
            return (
              <li key={preset.id} className="flex min-h-16 items-center gap-3 border-t border-line">
                <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-[12px] border border-[#232120] bg-[#121110] font-mono text-xs text-muted">
                  {ids.length}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-[0.9375rem] font-[550]">{preset.label}</span>
                  <span className="truncate text-[0.78rem] text-faint">{ids.map((id) => SOUND_BY_ID.get(id)?.label ?? id).join(", ")}</span>
                </span>
                <IconButton
                  label={live ? `Pause ${preset.label}` : `Play ${preset.label}`}
                  round
                  className="border border-line-strong"
                  onClick={() => (live ? actions.pause() : actions.applyPreset(preset.layers, preset.id))}
                >
                  {live ? (
                    <PauseIcon className="size-4" />
                  ) : (
                    <PlayIcon className="size-4" />
                  )}
                </IconButton>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/** Favorited presets as chips; tapping one plays it. */
function Favorites() {
  const favorites = useFocus((s) => s.account.favorites);
  const presets = useFocus((s) => s.account.presets);
  const items = favorites.flatMap((ref) => {
    const preset = presetByRef(ref, presets);
    return preset ? [preset] : [];
  });
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="you-favorites" className="mt-7 flex flex-col">
      <h3 id="you-favorites" className={sectionTitle}>
        Favorites
      </h3>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {items.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => actions.applyPreset(preset.layers, preset.id)}
            className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-edge bg-[#161616] px-3.5 text-[0.84rem] transition-colors hover:border-line-strong"
          >
            <Heart className="size-3.5 text-[#f08a4b]" fill="currentColor" strokeWidth={0} aria-hidden />
            {preset.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function AccountCard() {
  return (
    <section aria-labelledby="you-account" className={cx("flex flex-col rounded-[22px] border border-[#222] bg-raised p-5", wideFilled)}>
      <h3 id="you-account" className="text-lg leading-[1.3] font-semibold tracking-[-0.02em]">
        Everything works without an account.
      </h3>
      <p className="mt-2 text-sm leading-normal text-muted md:hidden">Signing in adds a few things that follow you between devices.</p>
      <p className="mt-2 text-sm leading-normal text-muted max-md:hidden">
        Signing in adds favorites, your own presets, share links and settings sync across devices.
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-2 md:hidden">
        {PERKS.map(({ icon: Icon, label }) => (
          <li key={label} className="flex h-11 items-center gap-2.5 rounded-[12px] bg-[#181818] px-3 text-[0.84rem]">
            <Icon className="size-[18px] text-soft" strokeWidth={1.75} aria-hidden />
            {label}
          </li>
        ))}
      </ul>
      <Link
        href="/account"
        className="mt-4 flex h-12 items-center justify-center rounded-[14px] bg-accent text-[0.9375rem] font-semibold text-accent-ink transition-[filter] hover:brightness-105 md:mt-[18px] md:h-11 md:self-start md:rounded-[12px] md:px-[22px] md:text-[0.9063rem]"
      >
        Sign in
      </Link>
    </section>
  );
}

function NoPresets() {
  return (
    <section aria-labelledby="you-presets" className="flex flex-col md:hidden">
      <h3 id="you-presets" className={sectionTitle}>
        Your presets
      </h3>
      <EmptyPresets />
    </section>
  );
}

function EmptyPresets() {
  return (
    <div className="mt-2.5 flex items-center gap-3.5 rounded-[18px] border border-dashed border-line-strong px-4 py-[18px]">
      <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-surface">
        <Bookmark className="size-[18px] text-muted" strokeWidth={1.75} />
      </span>
      <span className="text-[0.84rem] leading-[1.45] text-muted">Saved mixes show up here and sync across your signed-in devices.</span>
    </div>
  );
}

/** How many recordings are in the offline cache, and a way to save the rest. */
function useOfflineSounds(visible: boolean) {
  const [cached, setCached] = useState<number | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible) countCached(FILE_PATHS).then(setCached);
  }, [visible]);

  const download = async () => {
    setError("");
    setProgress(0);
    try {
      await downloadSounds(FILE_PATHS, setProgress);
      setCached(FILE_PATHS.length);
    } catch {
      setError("Some sounds didn’t download. Check your connection and try again.");
      countCached(FILE_PATHS).then(setCached);
    } finally {
      setProgress(null);
    }
  };

  const saved = progress ?? cached ?? 0;
  const all = cached === FILE_PATHS.length;
  return { saved, all, progress, error, download };
}

function OfflineSounds({ visible }: { visible: boolean }) {
  const { saved, all, progress, error, download } = useOfflineSounds(visible);
  return (
    <section aria-labelledby="you-offline" className={cx("flex flex-col", wideFilled)}>
      <h3 id="you-offline" className={sectionTitle}>
        Offline sounds
      </h3>
      <div className={cx(card, flatten)}>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-[550]">
            {saved} of {FILE_PATHS.length} recordings saved
          </span>
          <span className="label-mono">{all ? "~80 MB" : `${Math.round((saved / FILE_PATHS.length) * 100)}%`}</span>
        </div>
        <div aria-hidden className="mt-3 grid grid-cols-14 gap-1">
          {FILE_PATHS.map((path, i) => (
            <span key={path} className={cx("h-3.5 rounded-[3px] transition-colors", i < saved ? "bg-accent" : "bg-[#242424]")} />
          ))}
        </div>
        <p className="mt-3 text-[0.8125rem] leading-[1.45] text-muted">
          Recordings save as you play them. Noise and tones are generated on your device, so there is nothing to download.
        </p>
        <button
          type="button"
          onClick={download}
          disabled={all || progress !== null}
          className="mt-3.5 inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-[14px] border border-line-strong bg-surface-2 text-[0.9375rem] font-[550] transition-colors hover:bg-[#222] disabled:cursor-default disabled:hover:bg-surface-2 md:h-11 md:self-start md:rounded-[12px] md:px-[18px] md:text-sm"
        >
          <Download className="size-[18px]" strokeWidth={1.75} aria-hidden />
          {all ? "All sounds saved" : progress !== null ? `Saving ${progress} / ${FILE_PATHS.length}` : "Save all sounds · about 80 MB"}
        </button>
        {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      </div>
    </section>
  );
}

function Install() {
  const { canPrompt, install } = useInstallPrompt();
  const standalone = useSyncExternalStore(noSubscribe, isStandalone, () => false);
  const ios = useSyncExternalStore(noSubscribe, isIos, () => false);
  if (standalone) return null;

  const step = (n: number, body: ReactNode) => (
    <li className="flex items-center gap-3 text-sm">
      <span className="grid size-7 shrink-0 place-items-center rounded-full border border-[#3a3a3a] font-mono text-xs">{n}</span>
      <span className="flex flex-wrap items-center gap-1.5">{body}</span>
    </li>
  );

  return (
    <section aria-labelledby="you-install" className={cx("flex flex-col", wideCard)}>
      <h3 id="you-install" className={sectionTitle}>
        Install the app
      </h3>
      <div className={cx(card, "gap-3.5", flatten)}>
        {canPrompt ? (
          <button
            type="button"
            onClick={install}
            className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-accent text-[0.9375rem] font-semibold text-accent-ink"
          >
            <Download className="size-[18px]" strokeWidth={1.75} aria-hidden /> Add to Home Screen
          </button>
        ) : (
          <ol className="flex flex-col gap-2.5">
            {ios ? (
              <>
                {step(1, <>Tap <Share className="size-4" strokeWidth={1.75} aria-label="Share" /> in Safari’s toolbar</>)}
                {step(2, <>Choose <SquarePlus className="size-4" strokeWidth={1.75} aria-hidden /> Add to Home Screen</>)}
              </>
            ) : (
              <>
                {step(1, "Open your browser menu")}
                {step(2, "Choose “Install app” or “Add to Home Screen”")}
              </>
            )}
          </ol>
        )}
        <div className="flex flex-wrap gap-1.5 border-t border-[#222] pt-3.5">
          {["Plays offline", "Lock-screen controls", "Session alerts on iPhone"].map((perk) => (
            <span key={perk} className="inline-flex h-[30px] items-center rounded-full bg-[#1a1a1a] px-3 text-[0.78rem] text-soft">
              {perk}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
