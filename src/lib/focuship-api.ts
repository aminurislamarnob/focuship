import { createApiCloud } from "@/lib/api-cloud";
import type { Cloud } from "@/lib/cloud";

/**
 * The composition root for the cloud gateway: builds the Laravel driver pointed at
 * the Focuship API (ADR 0001) and hands it to the app.
 *
 * These are public build-time constants (the site is a static export). Security
 * rests on the API: a Sanctum cookie session the page's scripts cannot read, and
 * every row scoped to its owner. While the API URL is unset, accounts are simply
 * off and the app stays local-only.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/** Accounts exist in this build. Gates every cloud-facing control. */
export const CLOUD_ENABLED = Boolean(API_URL);

/**
 * The Google OAuth web client ID. When set, Google sign-in uses Google's own button
 * (consent names this site's domain); when unset it falls back to the redirect flow.
 */
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

/**
 * Cloudflare Turnstile site key (public). The API requires a Turnstile token to send an
 * email sign-in code; without a key the email option is hidden.
 */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

/** Facebook ships code-complete but hidden until the Meta app review clears. */
export const FACEBOOK_ENABLED = process.env.NEXT_PUBLIC_AUTH_FACEBOOK === "1";

/** Where the API lives, for links the app builds (sign-in redirects). */
export const API_ORIGIN = (API_URL ?? "").replace(/\/$/, "");

let cloud: Cloud | null | undefined;

/** The app-wide gateway instance, or null while the API isn't configured. */
export function getCloud(): Cloud | null {
  if (cloud === undefined) {
    cloud = CLOUD_ENABLED ? createApiCloud({ baseUrl: API_ORIGIN }) : null;
  }
  return cloud;
}
