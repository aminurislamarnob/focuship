"use client";

import { LogOut, Star, Trash2, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Provider } from "@/lib/cloud";
import { actions, useFocus } from "@/lib/store";
import { CLOUD_ENABLED, FACEBOOK_ENABLED } from "@/lib/supabase";
import { PresetIcon, StatusDot, cx } from "./ui";

const PROVIDERS: { id: Provider; label: string; enabled: boolean }[] = [
  { id: "google", label: "Continue with Google", enabled: true },
  { id: "github", label: "Continue with GitHub", enabled: true },
  { id: "facebook", label: "Continue with Facebook", enabled: FACEBOOK_ENABLED },
];

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
          <StatusDot tone={account.user ? "ok" : "idle"} />
          Account
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {account.user ? account.user.name : "Sign in to Focuship"}
        </h1>
        <p className="mt-2 max-w-md text-[0.9375rem] text-muted">
          {account.user
            ? "Your favorites, presets and focus settings now follow you to every device."
            : "Everything works without an account. Signing in adds favorites, your own presets, share links and settings sync."}
        </p>
      </header>

      {notice && (
        <p role="status" className="rounded-[6px] border border-line-strong bg-surface-2 px-3 py-2.5 text-sm">
          {notice}
        </p>
      )}

      {!CLOUD_ENABLED ? <SetupNote /> : account.user ? <SignedIn /> : <SignedOut reason={reason} />}
    </div>
  );
}

function SetupNote() {
  return (
    <section className="rounded-[6px] border border-line bg-raised p-4">
      <h2 className="label-mono">Accounts are off in this build</h2>
      <p className="mt-2 text-sm text-muted">
        This deployment has no Supabase project configured, so sign-in, favorites and preset sync are switched off. The
        app itself works fully without them.
      </p>
    </section>
  );
}

function SignedOut({ reason }: { reason: string | null }) {
  const ready = useFocus((s) => s.account.ready);
  return (
    <section className="flex flex-col gap-4">
      {reason && (
        <p className="rounded-[6px] border border-brand/40 bg-brand/10 px-3 py-2.5 text-sm text-brand-light">{reason}</p>
      )}
      <div className="flex flex-col gap-2">
        {PROVIDERS.filter((p) => p.enabled).map((provider) => (
          <button
            key={provider.id}
            type="button"
            disabled={!ready}
            onClick={() => actions.signIn(provider.id)}
            className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-[4px] border border-line-strong bg-raised/60 text-sm font-medium transition-colors hover:bg-surface-2 disabled:opacity-40"
          >
            {provider.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-faint">
        One account per email: sign in with Google today and GitHub tomorrow and you land in the same account. No
        passwords, nothing posted on your behalf. See the{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-fg">
          privacy policy
        </Link>
        .
      </p>
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
      <section className="flex items-center gap-4 rounded-[6px] border border-line bg-raised p-4">
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
          <p className="truncate text-sm text-muted">{user.email}</p>
          <p className="label-mono mt-1 text-faint">via {user.provider}</p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2">
        <div className="rounded-[6px] border border-line bg-raised p-4">
          <p className="flex items-center gap-2 text-2xl font-semibold tabular-nums">
            <Star className="size-4 text-brand" aria-hidden />
            {account.favorites.length}
          </p>
          <p className="label-mono mt-1">Favorites</p>
        </div>
        <div className="rounded-[6px] border border-line bg-raised p-4">
          <p className="flex items-center gap-2 text-2xl font-semibold tabular-nums">
            <PresetIcon id="custom" className="size-4 text-brand" />
            {account.presets.length}
          </p>
          <p className="label-mono mt-1">Your presets</p>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => actions.signOut()}
          className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[4px] border border-line-strong text-sm transition-colors hover:bg-surface-2"
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
            "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[4px] border text-sm transition-colors disabled:opacity-40",
            confirming ? "border-red-500/60 bg-red-500/10 text-red-400" : "border-line-strong text-muted hover:text-fg",
          )}
        >
          <Trash2 className="size-4" aria-hidden />
          {busy ? "Deleting…" : confirming ? "Really delete the account and all its data?" : "Delete account"}
        </button>
        {confirming && !busy && (
          <button type="button" onClick={() => setConfirming(false)} className="label-mono cursor-pointer py-1 hover:text-fg">
            Keep my account
          </button>
        )}
        <p className="text-xs text-faint">
          Deleting removes your account, favorites, presets and synced settings for good. Mixes saved on this device stay
          on this device.
        </p>
      </section>
    </div>
  );
}
