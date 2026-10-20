import type { Layers } from "@/lib/catalog";

/**
 * The cloud gateway: the one seam between Focuship and Supabase. Everything
 * account-shaped — auth, favorites, custom presets, sharing, settings sync,
 * account deletion — goes through here, and nothing else talks to Supabase.
 *
 * The Supabase client is injected as a narrow `CloudDriver`, so tests run the
 * gateway against a fake driver, and this module needs no runtime imports
 * (the composition root that builds the real client lives in supabase.ts).
 */

export type Provider = "google" | "github" | "facebook";

export interface CloudUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  provider: string;
}

/** A user-saved preset. Shaped like a catalog `Preset` so the mixer treats both alike. */
export interface CustomPreset {
  id: string;
  label: string;
  layers: Layers;
  isPublic: boolean;
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

// The driver: the minimal structural slice of supabase-js the gateway uses ----

type Row = Record<string, unknown>;

export interface DriverError {
  message: string;
  code?: string;
}

export interface DriverQuery extends PromiseLike<{ data: Row[] | null; error: DriverError | null }> {
  select(columns?: string): DriverQuery;
  insert(values: Row): DriverQuery;
  update(values: Row): DriverQuery;
  upsert(values: Row): DriverQuery;
  delete(): DriverQuery;
  eq(column: string, value: unknown): DriverQuery;
  order(column: string, options?: { ascending: boolean }): DriverQuery;
  maybeSingle(): PromiseLike<{ data: Row | null; error: DriverError | null }>;
}

export interface DriverSession {
  user: {
    id: string;
    email?: string;
    user_metadata?: Row;
    app_metadata?: Row;
  };
}

export interface CloudDriver {
  auth: {
    onAuthStateChange(callback: (event: string, session: DriverSession | null) => void): {
      data: { subscription: { unsubscribe(): void } };
    };
    signInWithOAuth(options: { provider: string; options: { redirectTo: string } }): Promise<{ error: DriverError | null }>;
    signInWithIdToken(credentials: { provider: string; token: string; nonce: string }): Promise<{ error: DriverError | null }>;
    signInWithOtp(credentials: {
      email: string;
      options: { shouldCreateUser: boolean; captchaToken: string };
    }): Promise<{ error: DriverError | null }>;
    verifyOtp(params: { email: string; token: string; type: "email" }): Promise<{ error: DriverError | null }>;
    signOut(): Promise<{ error: DriverError | null }>;
  };
  from(table: string): DriverQuery;
  rpc(fn: string, args?: Row): PromiseLike<{ error: DriverError | null }>;
}

// Errors ----------------------------------------------------------------------

/** A cloud failure with a message fit for the app's notice banner. */
export class CloudError extends Error {}

/** Postgres unique_violation: adding a favorite twice is not an error. */
const DUPLICATE = "23505";
/** Postgres invalid uuid text: a mangled share link is "not found", not a failure. */
const BAD_UUID = "22P02";
/** The `raise exception` message of the preset-cap trigger. */
const CAP_MESSAGE = "preset-limit";

function check(error: DriverError | null, friendly: string): void {
  if (!error) return;
  if (error.message.includes(CAP_MESSAGE)) {
    throw new CloudError(`You've reached ${PRESET_LIMIT} saved presets. Delete one to save another.`);
  }
  throw new CloudError(friendly);
}

// The gateway -----------------------------------------------------------------

export interface Cloud {
  /** Subscribes to auth changes; fires immediately with the current session. Returns unsubscribe. */
  onAuthChange(callback: (user: CloudUser | null) => void): () => void;
  signIn(provider: Provider, redirectTo: string): Promise<void>;
  /**
   * Signs in with an ID token from Google's own sign-in button, so Google's consent shows
   * the site's domain rather than Supabase's. `nonce` is the raw value whose SHA-256 was
   * given to Google.
   */
  signInWithGoogleToken(token: string, nonce: string): Promise<void>;
  /**
   * Emails a 6-digit sign-in code (creating the account on first use). `captchaToken` is a
   * fresh Turnstile token: Supabase requires one for every send.
   */
  sendEmailCode(email: string, captchaToken: string): Promise<void>;
  /** Exchanges the emailed code for a session; onAuthChange then fires. */
  verifyEmailCode(email: string, code: string): Promise<void>;
  signOut(): Promise<void>;
  /** Removes the auth user and, by cascade, every row they own. */
  deleteAccount(): Promise<void>;

  listFavorites(): Promise<string[]>;
  addFavorite(userId: string, ref: string): Promise<void>;
  removeFavorite(userId: string, ref: string): Promise<void>;

  listPresets(): Promise<CustomPreset[]>;
  createPreset(userId: string, preset: { id: string; label: string; layers: Layers }): Promise<void>;
  renamePreset(id: string, label: string): Promise<void>;
  setPresetPublic(id: string, isPublic: boolean): Promise<void>;
  /** Deletes the preset and the owner's favorite pointing at it. */
  deletePreset(userId: string, id: string): Promise<void>;
  /** A preset by share link: only rows the owner made public; null when private or missing. */
  fetchSharedPreset(id: string): Promise<{ id: string; label: string; layers: Layers } | null>;

  getSettings(userId: string): Promise<CloudSettings | null>;
  pushSettings(userId: string, settings: CloudSettings): Promise<void>;
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

/** Supabase error codes from sending a sign-in code, in words people can act on. */
const SEND_ERRORS: Record<string, string> = {
  over_email_send_rate_limit: "Too many codes requested. Wait a minute, then try again.",
  over_request_rate_limit: "Too many codes requested. Wait a minute, then try again.",
  email_address_invalid: "Enter a valid email address.",
  validation_failed: "Enter a valid email address.",
  captcha_failed: "The security check didn’t pass. Try again.",
  email_provider_disabled: "Email sign-in isn’t available right now. Use Google or GitHub instead.",
};

function toUser(session: DriverSession | null): CloudUser | null {
  const user = session?.user;
  if (!user) return null;
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email ?? "",
    name: String(meta.full_name ?? meta.name ?? meta.user_name ?? user.email ?? "You"),
    avatarUrl: typeof meta.avatar_url === "string" ? meta.avatar_url : typeof meta.picture === "string" ? meta.picture : null,
    provider: String(user.app_metadata?.provider ?? "unknown"),
  };
}

const toPreset = (row: Row): CustomPreset => ({
  id: String(row.id),
  label: String(row.label),
  layers: (row.layers ?? {}) as Layers,
  isPublic: Boolean(row.is_public),
});

export function createCloud(driver: CloudDriver): Cloud {
  return {
    onAuthChange(callback) {
      const { data } = driver.auth.onAuthStateChange((_event, session) => callback(toUser(session)));
      return () => data.subscription.unsubscribe();
    },

    async signIn(provider, redirectTo) {
      const { error } = await driver.auth.signInWithOAuth({ provider, options: { redirectTo } });
      check(error, "Couldn’t start sign-in. Check your connection.");
    },

    async signInWithGoogleToken(token, nonce) {
      const { error } = await driver.auth.signInWithIdToken({ provider: "google", token, nonce });
      check(error, "Couldn’t sign in with Google. Try again.");
    },

    async sendEmailCode(email, captchaToken) {
      const { error } = await driver.auth.signInWithOtp({
        email: normalizeEmail(email),
        options: { shouldCreateUser: true, captchaToken },
      });
      if (!error) return;
      throw new CloudError(SEND_ERRORS[error.code ?? ""] ?? "Couldn’t send the code. Check your connection and try again.");
    },

    async verifyEmailCode(email, code) {
      const { error } = await driver.auth.verifyOtp({
        email: normalizeEmail(email),
        token: code.replace(/\s+/g, ""),
        type: "email",
      });
      if (!error) return;
      throw new CloudError(
        error.code === "otp_expired" || error.code === "otp_disabled"
          ? "That code is wrong or has expired."
          : error.code === "over_request_rate_limit"
            ? "Too many attempts. Wait a minute and try again."
            : "Couldn’t check the code. Try again.",
      );
    },

    async signOut() {
      const { error } = await driver.auth.signOut();
      check(error, "Couldn’t sign out. Try again.");
    },

    async deleteAccount() {
      const { error } = await driver.rpc("delete_account");
      check(error, "Couldn’t delete your account. Try again.");
      // The user is gone; the server call may 4xx but the local session must still be cleared.
      await driver.auth.signOut().catch(() => {});
    },

    async listFavorites() {
      const { data, error } = await driver.from("favorites").select("preset_ref").order("created_at", { ascending: true });
      check(error, "Couldn’t load your favorites.");
      return (data ?? []).map((row) => String(row.preset_ref));
    },

    async addFavorite(userId, ref) {
      const { error } = await driver.from("favorites").insert({ user_id: userId, preset_ref: ref });
      if (error?.code === DUPLICATE) return;
      check(error, "Couldn’t save that favorite.");
    },

    async removeFavorite(userId, ref) {
      const { error } = await driver.from("favorites").delete().eq("user_id", userId).eq("preset_ref", ref);
      check(error, "Couldn’t remove that favorite.");
    },

    async listPresets() {
      const { data, error } = await driver
        .from("user_presets")
        .select("id,label,layers,is_public")
        .order("created_at", { ascending: false });
      check(error, "Couldn’t load your presets.");
      return (data ?? []).map(toPreset);
    },

    async createPreset(userId, preset) {
      const { error } = await driver
        .from("user_presets")
        .insert({ id: preset.id, user_id: userId, label: preset.label, layers: preset.layers });
      check(error, "Couldn’t save your preset.");
    },

    async renamePreset(id, label) {
      const { error } = await driver.from("user_presets").update({ label }).eq("id", id);
      check(error, "Couldn’t rename that preset.");
    },

    async setPresetPublic(id, isPublic) {
      const { error } = await driver.from("user_presets").update({ is_public: isPublic }).eq("id", id);
      check(error, isPublic ? "Couldn’t share that preset." : "Couldn’t stop sharing that preset.");
    },

    async deletePreset(userId, id) {
      await driver.from("favorites").delete().eq("user_id", userId).eq("preset_ref", id);
      const { error } = await driver.from("user_presets").delete().eq("id", id);
      check(error, "Couldn’t delete that preset.");
    },

    async fetchSharedPreset(id) {
      const { data, error } = await driver
        .from("user_presets")
        .select("id,label,layers")
        .eq("id", id)
        .eq("is_public", true)
        .maybeSingle();
      if (error?.code === BAD_UUID) return null;
      check(error, "Couldn’t load that shared preset.");
      return data ? { id: String(data.id), label: String(data.label), layers: (data.layers ?? {}) as Layers } : null;
    },

    async getSettings(userId) {
      const { data, error } = await driver
        .from("user_settings")
        .select("timer,volume,updated_at")
        .eq("user_id", userId)
        .maybeSingle();
      check(error, "Couldn’t load your settings.");
      if (!data) return null;
      return { timer: data.timer, volume: Number(data.volume), updatedAt: Date.parse(String(data.updated_at)) };
    },

    async pushSettings(userId, settings) {
      const { error } = await driver.from("user_settings").upsert({
        user_id: userId,
        timer: settings.timer,
        volume: settings.volume,
        updated_at: new Date(settings.updatedAt).toISOString(),
      });
      check(error, "Couldn’t sync your settings.");
    },
  };
}
