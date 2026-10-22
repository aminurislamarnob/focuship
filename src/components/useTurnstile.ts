"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Cloudflare Turnstile, run on demand. The API requires a fresh Turnstile token for every
 * email-code send, so the widget renders once in "execute" mode and `getToken()` runs a new
 * challenge each call. It stays invisible unless Cloudflare needs the visitor to interact,
 * in which case it appears inside the returned `slot` element.
 */

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const TOKEN_TIMEOUT_MS = 30_000;

interface TurnstileApi {
  render(
    el: HTMLElement,
    options: {
      sitekey: string;
      execution: "execute";
      appearance: "interaction-only";
      theme: "dark";
      size: "flexible";
      callback(token: string): void;
      "error-callback"(): void;
      "expired-callback"(): void;
    },
  ): string;
  execute(widgetId: string): void;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let loading: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("missing")));
    script.onerror = () => reject(new Error("blocked"));
    document.head.appendChild(script);
  }).catch((e) => {
    loading = null;
    throw e;
  });
  return loading;
}

interface Pending {
  resolve(token: string): void;
  reject(error: Error): void;
}

export function useTurnstile(siteKey: string) {
  const slot = useRef<HTMLDivElement>(null);
  const widget = useRef<{ api: TurnstileApi; id: string } | null>(null);
  const pending = useRef<Pending | null>(null);

  const settle = (fn: (p: Pending) => void) => {
    const p = pending.current;
    pending.current = null;
    if (p) fn(p);
  };

  /** Renders the widget the first time it's needed (so the script loads only on use). */
  const ensureWidget = useCallback(async () => {
    if (widget.current) return widget.current;
    const api = await loadTurnstile();
    const el = slot.current;
    if (!el) throw new Error("unmounted");
    const id = api.render(el, {
      sitekey: siteKey,
      execution: "execute",
      appearance: "interaction-only",
      theme: "dark",
      size: "flexible",
      callback: (token) => settle((p) => p.resolve(token)),
      "error-callback": () => settle((p) => p.reject(new Error("challenge failed"))),
      "expired-callback": () => settle((p) => p.reject(new Error("challenge expired"))),
    });
    widget.current = { api, id };
    return widget.current;
  }, [siteKey]);

  /** A fresh single-use token. Rejects if the script is blocked or the challenge fails. */
  const getToken = useCallback(async (): Promise<string> => {
    const { api, id } = await ensureWidget();
    settle((p) => p.reject(new Error("superseded")));
    return new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => settle((p) => p.reject(new Error("timeout"))), TOKEN_TIMEOUT_MS);
      pending.current = {
        resolve: (token) => (clearTimeout(timer), resolve(token)),
        reject: (error) => (clearTimeout(timer), reject(error)),
      };
      api.reset(id); // tokens are single-use: start a new challenge every time
      api.execute(id);
    });
  }, [ensureWidget]);

  useEffect(
    () => () => {
      const w = widget.current;
      widget.current = null;
      if (w) w.api.remove(w.id);
    },
    [],
  );

  return { slot, getToken };
}
