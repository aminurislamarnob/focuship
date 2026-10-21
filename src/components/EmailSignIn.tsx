"use client";

import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { actions } from "@/lib/store";
import { useTurnstile } from "./useTurnstile";
import { cx } from "./ui";

/**
 * "Continue with email": send a 6-digit code, then type it in. One flow for sign-up and
 * sign-in — a new address creates the account. Every send (and resend) runs a fresh,
 * usually invisible Turnstile check, which Supabase verifies server-side.
 */

const CODE_LENGTH = 6;
/** Matches Supabase's minimum interval between emails to one address. */
const RESEND_AFTER_S = 60;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const field =
  "h-[52px] w-full rounded-[14px] border border-[#2e2e2e] bg-[#0e0e0e] px-3.5 text-[0.9375rem] text-fg outline-none placeholder:text-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg disabled:opacity-60";
const primary =
  "inline-flex h-[52px] w-full cursor-pointer items-center justify-center rounded-[14px] bg-accent text-[0.9375rem] font-semibold text-accent-ink transition-[filter,background-color,color] hover:brightness-105 disabled:cursor-default disabled:bg-edge disabled:text-muted";

export function EmailSignIn({ siteKey }: { siteKey: string }) {
  const { slot, getToken } = useTurnstile(siteKey);
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const codeInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [resendIn > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Runs the bot check and sends a code; returns whether it went out. */
  const send = async (): Promise<boolean> => {
    setBusy(true);
    setError(null);
    let token: string;
    try {
      token = await getToken();
    } catch {
      setBusy(false);
      setError(
        "The security check couldn’t run. Check your connection, or try another sign-in option.",
      );
      return false;
    }
    const failure = await actions.sendEmailCode(email, token);
    setBusy(false);
    if (failure) {
      setError(failure);
      return false;
    }
    setResendIn(RESEND_AFTER_S);
    return true;
  };

  const verify = async (value: string) => {
    setBusy(true);
    setError(null);
    const failure = await actions.verifyEmailCode(email, value);
    setBusy(false);
    if (failure) {
      setError(failure);
      setCode("");
      codeInput.current?.focus();
    }
    // On success the account page swaps to the signed-in view by itself.
  };

  const body =
    step === "code" ? (
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-[0.9375rem] font-medium">Check your email</p>
          <p className="mt-1 text-sm text-muted">
            We sent a {CODE_LENGTH}-digit code to{" "}
            <span className="text-fg">{email.trim()}</span>. It expires in 10
            minutes.
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (code.length === CODE_LENGTH) verify(code);
          }}
          className="flex flex-col gap-3"
        >
          <label htmlFor="email-code" className="sr-only">
            Sign-in code
          </label>
          <input
            ref={codeInput}
            id="email-code"
            value={code}
            onChange={(e) => {
              const digits = e.target.value
                .replace(/\D/g, "")
                .slice(0, CODE_LENGTH);
              setCode(digits);
              if (digits.length === CODE_LENGTH && !busy) verify(digits);
            }}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={CODE_LENGTH}
            placeholder="000000"
            autoFocus
            disabled={busy}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "email-error" : undefined}
            className={cx(
              field,
              "text-center font-mono text-xl tracking-[0.5em] placeholder:tracking-[0.5em]",
            )}
          />
          <button
            type="submit"
            disabled={busy || code.length < CODE_LENGTH}
            className={primary}
          >
            {busy ? "Checking…" : "Sign in"}
          </button>
        </form>
        {error && (
          <p id="email-error" role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
            }}
            className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 text-[0.8125rem] text-muted hover:text-fg"
          >
            <ArrowLeft className="size-3.5" aria-hidden /> Use a different email
          </button>
          <button
            type="button"
            disabled={busy || resendIn > 0}
            onClick={send}
            className="min-h-11 cursor-pointer text-[0.8125rem] text-muted hover:text-fg disabled:cursor-default disabled:text-faint"
          >
            {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
          </button>
        </div>
      </div>
    ) : (
      <form
        noValidate
        onSubmit={async (e) => {
          e.preventDefault();
          if (!EMAIL_PATTERN.test(email.trim())) {
            setError("Enter a valid email address.");
            return;
          }
          if (await send()) {
            setStep("code");
            setCode("");
          }
        }}
        className="flex flex-col gap-3"
      >
        <label htmlFor="email-address" className="-mb-1 text-[0.8125rem] font-medium text-soft">
          Email address
        </label>
        <input
          id="email-address"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          placeholder="you@example.com"
          autoComplete="email"
          inputMode="email"
          disabled={busy}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "email-error" : undefined}
          className={field}
        />
        <button type="submit" disabled={busy} className={primary}>
          {busy ? "Sending code…" : "Continue with email"}
        </button>
        {error && (
          <p id="email-error" role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
      </form>
    );

  return (
    <div className="flex flex-col gap-3">
      {body}
      {/* One stable home for the Turnstile widget across both steps; it only shows when
          Cloudflare needs an interaction. */}
      <div ref={slot} className="empty:hidden" />
    </div>
  );
}
