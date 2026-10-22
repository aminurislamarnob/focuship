"use client";

import { Bookmark, LogOut, Star, Trash2, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Provider } from "@/lib/cloud";
import { actions, useFocus } from "@/lib/store";
import { CLOUD_ENABLED, FACEBOOK_ENABLED, GOOGLE_CLIENT_ID, TURNSTILE_SITE_KEY } from "@/lib/focuship-api";
import { FacebookIcon, GitHubIcon, GoogleIcon } from "./BrandIcons";
import { EmailSignIn } from "./EmailSignIn";
import { GoogleButton } from "./GoogleButton";
import { cx } from "./ui";

const PROVIDERS: { id: Provider; label: string; icon: typeof GoogleIcon; enabled: boolean }[] = [
  { id: "google", label: "Continue with Google", icon: GoogleIcon, enabled: true },
  { id: "github", label: "Continue with GitHub", icon: GitHubIcon, enabled: true },
  { id: "facebook", label: "Continue with Facebook", icon: FacebookIcon, enabled: FACEBOOK_ENABLED },
];

/**
 * One look for every provider button. `group-hover`/`group-focus-within` let Google's
 * face react when the invisible Google iframe laid over it is hovered or focused.
 */
const providerFace = cx(
  "inline-flex h-[52px] w-full cursor-pointer items-center justify-center gap-3 rounded-[14px] border border-[#2e2e2e] bg-surface text-[0.9375rem] font-[550] transition-colors",
  "hover:bg-surface-2 group-hover:bg-surface-2 disabled:cursor-default disabled:opacity-40",
  "group-focus-within:outline-2 group-focus-within:outline-offset-2 group-focus-within:outline-fg",
);

/** Why the app sent someone here; shown above the sign-in buttons. */
const REASONS: Record<string, string> = {
  favorites: "Sign in to keep favorites — they follow you to every device.",
  save: "Sign in to save this mix as your own preset.",
};

/** The ?reason= hint, read on the client only (the page is prerendered without one). */
const useReason = () =>
  useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(location.search).get("reason"),
    () => null,
  );

export function AccountView() {
  const account = useFocus((s) => s.account);
  const notice = useFocus((s) => s.notice);
  const wanted = useReason();
  const reason = (wanted && REASONS[wanted]) || null;

  useEffect(() => {
    // The page lives outside the app shell, so it hydrates the store itself
    // (which also connects the cloud and resolves the session).
    actions.hydrate();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(actions.dismissNotice, 4000);
    return () => clearTimeout(id);
  }, [notice]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="label-mono flex items-center gap-2">
          {account.user && <span aria-hidden className="size-1.5 rounded-full bg-ok" />}
          Account
        </p>
        <h1 className="mt-2 text-[2.125rem] leading-[1.05] font-semibold tracking-[-0.045em] text-balance">
          {account.user ? account.user.name : "Sign in to Focuship"}
        </h1>
        <p className="mt-3 max-w-md text-[0.9375rem] leading-[1.55] text-muted">
          {account.user
            ? "Your favorites, presets and focus settings now follow you to every device."
            : "Everything works without an account. Signing in adds favorites, your own presets, share links and settings sync."}
        </p>
      </header>

      {notice && (
        <p role="status" className="rounded-[14px] border border-line-strong bg-surface-2 px-4 py-3 text-sm">
          {notice}
        </p>
      )}

      {!CLOUD_ENABLED ? <SetupNote /> : account.user ? <SignedIn /> : <SignedOut reason={reason} />}
    </div>
  );
}

function SetupNote() {
  return (
    <section className="rounded-[18px] border border-[#222] bg-raised p-4">
      <h2 className="text-[0.9375rem] font-semibold">Accounts are off in this build</h2>
      <p className="mt-2 text-sm text-muted">
        This deployment has no Focuship API configured, so sign-in, favorites and preset sync are switched off. The
        app itself works fully without them.
      </p>
    </section>
  );
}

function SignedOut({ reason }: { reason: string | null }) {
  const ready = useFocus((s) => s.account.ready);
  // Google's own button when configured; the redirect flow if its script can't load.
  const [googleFallback, setGoogleFallback] = useState(!GOOGLE_CLIENT_ID);
  return (
    <section className="flex flex-col gap-4">
      {reason && (
        <p className="rounded-[14px] border border-line-strong bg-surface-2 px-4 py-3 text-sm">{reason}</p>
      )}
      {/* Capped at 400px: the widest Google renders its own button, so the others match it. */}
      <div className="flex w-full max-w-[400px] flex-col gap-2.5">
        {PROVIDERS.filter((p) => p.enabled).map(({ id, label, icon: Icon }) =>
          id === "google" && !googleFallback ? (
            <GoogleButton key={id} clientId={GOOGLE_CLIENT_ID} onUnavailable={() => setGoogleFallback(true)}>
              {(loaded) => (
                <span className={cx(providerFace, !(loaded && ready) && "animate-pulse opacity-60")}>
                  <Icon className="size-5" />
                  {label}
                </span>
              )}
            </GoogleButton>
          ) : (
            <button
              key={id}
              type="button"
              disabled={!ready}
              onClick={() => actions.signIn(id)}
              className={providerFace}
            >
              <Icon className="size-5" />
              {label}
            </button>
          ),
        )}
        {TURNSTILE_SITE_KEY && (
          <>
            <p className="my-3 flex items-center gap-3 text-xs text-faint" aria-hidden>
              <span className="h-px flex-1 bg-edge" />
              or
              <span className="h-px flex-1 bg-edge" />
            </p>
            <EmailSignIn siteKey={TURNSTILE_SITE_KEY} />
          </>
        )}
        <p className="mt-3 text-[0.78rem] leading-[1.55] text-faint">
          By continuing, you acknowledge Focuship&rsquo;s{" "}
          <Link href="/privacy" className="text-soft underline underline-offset-4 hover:text-fg">
            Privacy Policy
          </Link>
          . One account per email, whichever way you sign in.
        </p>
      </div>
    </section>
  );
}

function SignedIn() {
  const account = useFocus((s) => s.account);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const user = account.user!;

  return (
    <div className="flex flex-col gap-4">
      <section className="flex items-center gap-4 rounded-[22px] border border-[#222] bg-raised p-5">
        {user.avatarUrl ? (
          // Plain <img>: the static export has no image loader, and avatar hosts need no-referrer.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="size-12 shrink-0 rounded-full border border-line"
          />
        ) : (
          <span className="grid size-12 shrink-0 place-items-center rounded-full border border-line bg-surface">
            <UserRound className="size-6 text-muted" aria-hidden />
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{user.name}</p>
          {/* Email-code accounts have no name, so the name already is the address. */}
          {user.email !== user.name && <p className="truncate text-sm text-muted">{user.email}</p>}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2">
        <div className="rounded-[18px] border border-[#222] bg-raised p-4">
          <p className="flex items-center gap-2 font-mono text-2xl tabular-nums">
            <Star className="size-4 text-soft" strokeWidth={1.75} aria-hidden />
            {account.favorites.length}
          </p>
          <p className="mt-1 text-xs text-faint">Favorites</p>
        </div>
        <div className="rounded-[18px] border border-[#222] bg-raised p-4">
          <p className="flex items-center gap-2 font-mono text-2xl tabular-nums">
            <Bookmark className="size-4 text-soft" strokeWidth={1.75} aria-hidden />
            {account.presets.length}
          </p>
          <p className="mt-1 text-xs text-faint">Your presets</p>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => actions.signOut()}
          className="inline-flex h-[52px] cursor-pointer items-center justify-center gap-2 rounded-[14px] border border-line-strong bg-surface-2 text-[0.9375rem] font-[550] transition-colors hover:bg-[#222]"
        >
          <LogOut className="size-4" aria-hidden /> Sign out
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            if (!confirming) {
              setConfirming(true);
              return;
            }
            setBusy(true);
            await actions.deleteAccount();
            setBusy(false);
            setConfirming(false);
          }}
          className={cx(
            "inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-[14px] text-[0.9375rem] font-[550] transition-colors disabled:opacity-40",
            confirming ? "border border-danger/50 bg-danger/10 text-danger" : "text-danger",
          )}
        >
          <Trash2 className="size-4" aria-hidden />
          {busy ? "Deleting…" : confirming ? "Really delete the account and all its data?" : "Delete account"}
        </button>
        {confirming && !busy && (
          <button type="button" onClick={() => setConfirming(false)} className="min-h-11 cursor-pointer text-sm text-muted hover:text-fg">
            Keep my account
          </button>
        )}
        <p className="text-[0.78rem] leading-normal text-faint">
          Deleting removes your account, favorites, presets and synced settings for good. Mixes saved on this device stay
          on this device.
        </p>
      </section>
    </div>
  );
}
