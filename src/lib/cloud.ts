import type { Layers } from "@/lib/catalog";

/**
 * The cloud gateway: the one seam between Focuship and its account backend.
 * Everything account-shaped — auth, favorites, custom presets, sharing, settings
 * sync, account deletion — goes through here.
 *
 * This file is the contract only; the Laravel driver that fulfils it lives in
 * api-cloud.ts, and the composition root that builds it in focuship-api.ts. Keeping
 * the contract free of runtime imports is what lets the app be tested without one.
 */

export type Provider = "google" | "github" | "facebook";

export interface CloudUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

/** A user-saved preset. Shaped like a catalog `Preset` so the mixer treats both alike. */
export interface CustomPreset {
  id: string;
  label: string;
  layers: Layers;
  isPublic: boolean;
}

/** An AI assistant the listener connected to their account (ADR 0004). */
export interface ConnectedApp {
  id: string;
  name: string;
  connectedAt: string | null;
  lastUsedAt: string | null;
}

/** The synced slice of settings: timer preferences and master volume, last write wins. */
export interface CloudSettings<T = unknown> {
  timer: T;
  volume: number;
  /** Epoch ms of the last change, the LWW clock. */
  updatedAt: number;
}

export const PRESET_LIMIT = 50;

/** Which side of a settings sync wins: the newer write. */
export const newerSettings = (local: CloudSettings | null, cloud: CloudSettings | null): "local" | "cloud" =>
  cloud && (!local || cloud.updatedAt > local.updatedAt) ? "cloud" : "local";

// Errors ----------------------------------------------------------------------

/** A cloud failure with a message fit for the app's notice banner. */
export class CloudError extends Error {}

// The gateway -----------------------------------------------------------------

export interface Cloud {
  /** Subscribes to auth changes; fires immediately with the current session. Returns unsubscribe. */
  onAuthChange(callback: (user: CloudUser | null) => void): () => void;
  signIn(provider: Provider, redirectTo: string): Promise<void>;
  /**
   * Signs in with an ID token from Google's own sign-in button, so Google's consent
   * names focuship.app. `nonce` is the raw value whose SHA-256 was given to Google.
   */
  signInWithGoogleToken(token: string, nonce: string): Promise<void>;
  /**
   * Emails a 6-digit sign-in code (creating the account on first use). `captchaToken` is a
   * fresh Turnstile token: the API requires one for every send.
   */
  sendEmailCode(email: string, captchaToken: string): Promise<void>;
  /** Exchanges the emailed code for a session; onAuthChange then fires. */
  verifyEmailCode(email: string, code: string): Promise<void>;
  signOut(): Promise<void>;
  /** Removes the listener and, by cascade, every row they own. */
  deleteAccount(): Promise<void>;

  listFavorites(): Promise<string[]>;
  addFavorite(ref: string): Promise<void>;
  removeFavorite(ref: string): Promise<void>;

  listPresets(): Promise<CustomPreset[]>;
  createPreset(preset: { id: string; label: string; layers: Layers }): Promise<void>;
  renamePreset(id: string, label: string): Promise<void>;
  setPresetPublic(id: string, isPublic: boolean): Promise<void>;
  /** Deletes the preset and the owner's favorite pointing at it. */
  deletePreset(id: string): Promise<void>;
  /** A preset by share link: only rows the owner made public; null when private or missing. */
  fetchSharedPreset(id: string): Promise<{ id: string; label: string; layers: Layers } | null>;

  getSettings(): Promise<CloudSettings | null>;
  pushSettings(settings: CloudSettings): Promise<void>;

  /** The AI assistants this listener has connected, most recently used first. */
  listConnectedApps(): Promise<ConnectedApp[]>;
  /** Cuts an assistant off at once; its tokens stop working. */
  revokeConnectedApp(id: string): Promise<void>;
}
