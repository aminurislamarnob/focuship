"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { actions } from "@/lib/store";

/**
 * Google's own "Sign in with Google" button (Google Identity Services). Google talks to
 * this origin directly and hands back an ID token, which the API verifies — so Google's
 * consent names focuship.app, not whatever domain the redirect flow would show.
 *
 * Google draws its button in an iframe we can't style, so the caller's `children` (a face
 * matching the other provider buttons) is shown, and Google's real button is laid over it
 * nearly invisible to receive the click. Hover and keyboard focus reach the wrapper because
 * the iframe is a child element of it.
 *
 * If Google's script can't load (offline, blocked), `onUnavailable` lets the caller fall
 * back to the redirect flow.
 */

const GIS_SRC = "https://accounts.google.com/gsi/client";
const LOAD_TIMEOUT_MS = 8000;
/** Google renders its button at a fixed pixel width, capped at 400. */
const MAX_WIDTH = 400;

interface GoogleId {
  initialize(config: {
    client_id: string;
    callback(response: { credential: string }): void;
    nonce: string;
    ux_mode: "popup";
    auto_select: boolean;
    itp_support: boolean;
    use_fedcm_for_button: boolean;
  }): void;
  renderButton(
    parent: HTMLElement,
    options: {
      type: "standard";
      theme: string;
      size: string;
      text: string;
      shape: string;
      width: number;
      logo_alignment: string;
      locale: string;
    },
  ): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

let loading: Promise<GoogleId> | null = null;

/** Loads Google's script once per page; rejects if it fails or stalls. */
function loadGoogle(): Promise<GoogleId> {
  if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);
  loading ??= new Promise<GoogleId>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    const timer = setTimeout(() => reject(new Error("timeout")), LOAD_TIMEOUT_MS);
    script.onload = () => {
      clearTimeout(timer);
      if (window.google?.accounts?.id) resolve(window.google.accounts.id);
      else reject(new Error("missing"));
    };
    script.onerror = () => {
      clearTimeout(timer);
      reject(new Error("blocked"));
    };
    document.head.appendChild(script);
  }).catch((e) => {
    loading = null; // let a later mount retry
    throw e;
  });
  return loading;
}

/** A raw nonce for the API and its SHA-256 (hex) for Google, which embeds it in the ID token. */
async function makeNonce(): Promise<{ raw: string; hashed: string }> {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const raw = btoa(String.fromCharCode(...bytes));
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const hashed = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return { raw, hashed };
}

interface GoogleButtonProps {
  clientId: string;
  onUnavailable(): void;
  /** The visible face; receives `ready` so it can show a loading state. */
  children(ready: boolean): ReactNode;
}

export function GoogleButton({ clientId, onUnavailable, children }: GoogleButtonProps) {
  const slot = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const unavailable = useRef(onUnavailable);

  useEffect(() => {
    unavailable.current = onUnavailable;
  }, [onUnavailable]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadGoogle(), makeNonce()])
      .then(([google, nonce]) => {
        const el = slot.current;
        if (cancelled || !el) return;
        google.initialize({
          client_id: clientId,
          nonce: nonce.hashed,
          callback: ({ credential }) => actions.signInWithGoogleToken(credential, nonce.raw),
          ux_mode: "popup",
          auto_select: false,
          itp_support: true,
          use_fedcm_for_button: true,
        });
        google.renderButton(el, {
          type: "standard",
          theme: "filled_black",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width: Math.min(MAX_WIDTH, Math.round(el.getBoundingClientRect().width) || MAX_WIDTH),
          logo_alignment: "center",
          // The site is English-only; Google would otherwise follow the browser's language.
          locale: "en",
        });
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) unavailable.current();
      });
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  return (
    <div className="group relative">
      <div aria-hidden>{children(ready)}</div>
      {/* Google's button (an iframe, 40px tall at size "large") in a 40px slot centred on the
          52px face, stretched 1.3x so it covers the face exactly and nothing beyond it.
          Fully transparent: opacity does not affect hit-testing, so it still gets the click. */}
      <div
        ref={slot}
        className="absolute inset-x-0 top-1.5 flex h-10 scale-y-[1.3] items-center justify-center overflow-hidden opacity-0 [color-scheme:light]"
      />
    </div>
  );
}
