import type { Layers } from "@/lib/catalog";
import {
  CloudError,
  PRESET_LIMIT,
  type Cloud,
  type CloudSettings,
  type ConnectedApp,
  type CloudUser,
  type CustomPreset,
  type Provider,
} from "@/lib/cloud";

/**
 * The cloud gateway's Laravel driver: the one place the site talks to the Focuship
 * API (ADR 0001). It implements the same `Cloud` interface the app already uses, so
 * the store and views are unchanged.
 *
 * Auth is a Sanctum cookie session on `.focuship.app` (ADR 0003): every request is
 * credentialed, the session cookie is httpOnly, and unsafe methods carry the CSRF
 * token Laravel put in the `XSRF-TOKEN` cookie. `fetch`, the cookie jar and the
 * redirecting browser are injected, so the gateway is testable without a browser.
 */

export interface ApiCloudOptions {
  /** Origin of the API, e.g. https://api.focuship.app. */
  baseUrl: string;
  fetch?: typeof globalThis.fetch;
  /** Reads document.cookie; injected so tests can drive the CSRF handshake. */
  readCookie?: (name: string) => string | null;
  /** Sends the browser somewhere (social sign-in redirects). */
  navigate?: (url: string) => void;
}

interface ApiError {
  message?: string;
  errors?: Record<string, string[]>;
}

const DEFAULT_MESSAGE = "Something went wrong. Check your connection and try again.";

const browserCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
};

/** The first message the API gave, which is the one worth showing. */
function messageFrom(body: ApiError | null, fallback: string): string {
  const firstField = Object.values(body?.errors ?? {})[0]?.[0];
  return firstField ?? body?.message ?? fallback;
}

export function createApiCloud(options: ApiCloudOptions): Cloud {
  const base = options.baseUrl.replace(/\/$/, "");
  const doFetch = options.fetch ?? globalThis.fetch.bind(globalThis);
  const readCookie = options.readCookie ?? browserCookie;
  const navigate = options.navigate ?? ((url: string) => void (location.href = url));

  const listeners = new Set<(user: CloudUser | null) => void>();
  let current: CloudUser | null = null;
  let gotCsrf = false;

  const announce = (user: CloudUser | null) => {
    current = user;
    for (const listener of listeners) listener(user);
  };

  /** Laravel's CSRF cookie, fetched once per session before the first unsafe request. */
  async function ensureCsrf(): Promise<void> {
    if (gotCsrf || readCookie("XSRF-TOKEN")) {
      gotCsrf = true;
      return;
    }
    await doFetch(`${base}/sanctum/csrf-cookie`, { credentials: "include" });
    gotCsrf = true;
  }

  async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    fallback = DEFAULT_MESSAGE,
  ): Promise<T> {
    const unsafe = method !== "GET";
    if (unsafe) await ensureCsrf();

    const token = readCookie("XSRF-TOKEN");
    let response: Response;
    try {
      response = await doFetch(`${base}${path}`, {
        method,
        credentials: "include",
        headers: {
          Accept: "application/json",
          ...(body === undefined ? {} : { "Content-Type": "application/json" }),
          ...(unsafe && token ? { "X-XSRF-TOKEN": token } : {}),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
    } catch {
      throw new CloudError("Focuship can’t reach your account right now. Check your connection.");
    }

    if (response.status === 204) return undefined as T;

    const payload = (await response.json().catch(() => null)) as (T & ApiError) | null;

    if (!response.ok) {
      if (response.status === 429) {
        throw new CloudError("Too many tries. Wait a minute, then try again.");
      }
      throw new CloudError(messageFrom(payload, fallback));
    }

    return payload as T;
  }

  const toPreset = (row: {
    id: string;
    label: string;
    layers: Layers;
    isPublic: boolean;
  }): CustomPreset => ({
    id: row.id,
    label: row.label,
    layers: row.layers ?? {},
    isPublic: Boolean(row.isPublic),
  });

  return {
    onAuthChange(callback) {
      listeners.add(callback);

      // Fires with the current session: the API is
      // the authority, and the app shows its cached copy until this answers.
      request<{ user: CloudUser | null }>("GET", "/auth/me")
        .then(({ user }) => announce(user))
        .catch(() => callback(current));

      return () => listeners.delete(callback);
    },

    async signIn(provider: Provider, redirectTo: string) {
      await ensureCsrf();
      navigate(`${base}/auth/${provider}/redirect?redirect=${encodeURIComponent(redirectTo)}`);
    },

    async signInWithGoogleToken(token, nonce) {
      const { user } = await request<{ user: CloudUser }>(
        "POST",
        "/auth/google/token",
        { token, nonce },
        "Couldn’t sign in with Google. Try again.",
      );
      announce(user);
    },

    async sendEmailCode(email, captchaToken) {
      await request(
        "POST",
        "/auth/email/code",
        { email, turnstile: captchaToken },
        "Couldn’t send the code. Check your connection and try again.",
      );
    },

    async verifyEmailCode(email, code) {
      const { user } = await request<{ user: CloudUser }>(
        "POST",
        "/auth/email/verify",
        { email, code: code.replace(/\s+/g, "") },
        "That code is wrong or has expired.",
      );
      announce(user);
    },

    async signOut() {
      await request("POST", "/auth/sign-out", undefined, "Couldn’t sign out. Try again.");
      announce(null);
    },

    async deleteAccount() {
      await request("DELETE", "/account", undefined, "Couldn’t delete your account. Try again.");
      announce(null);
    },

    async listFavorites() {
      const { favorites } = await request<{ favorites: string[] }>(
        "GET",
        "/account/favorites",
        undefined,
        "Couldn’t load your favorites.",
      );
      return favorites;
    },

    async addFavorite(_userId, ref) {
      await request("POST", "/account/favorites", { ref }, "Couldn’t save that favorite.");
    },

    async removeFavorite(_userId, ref) {
      await request(
        "DELETE",
        `/account/favorites/${encodeURIComponent(ref)}`,
        undefined,
        "Couldn’t remove that favorite.",
      );
    },

    async listPresets() {
      const { presets } = await request<{ presets: Parameters<typeof toPreset>[0][] }>(
        "GET",
        "/account/presets",
        undefined,
        "Couldn’t load your presets.",
      );
      return presets.map(toPreset);
    },

    async createPreset(_userId, preset) {
      await request(
        "POST",
        "/account/presets",
        { id: preset.id, label: preset.label, layers: preset.layers },
        `You've reached ${PRESET_LIMIT} saved presets. Delete one to save another.`,
      );
    },

    async renamePreset(id, label) {
      await request(
        "PATCH",
        `/account/presets/${encodeURIComponent(id)}`,
        { label },
        "Couldn’t rename that preset.",
      );
    },

    async setPresetPublic(id, isPublic) {
      await request(
        "PATCH",
        `/account/presets/${encodeURIComponent(id)}`,
        { isPublic },
        isPublic ? "Couldn’t share that preset." : "Couldn’t stop sharing that preset.",
      );
    },

    async deletePreset(_userId, id) {
      await request(
        "DELETE",
        `/account/presets/${encodeURIComponent(id)}`,
        undefined,
        "Couldn’t delete that preset.",
      );
    },

    async fetchSharedPreset(id) {
      try {
        const { preset } = await request<{
          preset: { id: string; label: string; layers: Layers } | null;
        }>("GET", `/presets/${encodeURIComponent(id)}`, undefined, "Couldn’t load that shared preset.");
        return preset;
      } catch (error) {
        // A link to a preset that was deleted or made private is "gone", not a failure.
        if (error instanceof CloudError && error.message === NOT_FOUND) return null;
        throw error;
      }
    },

    async getSettings() {
      const { settings } = await request<{ settings: CloudSettings | null }>(
        "GET",
        "/account/settings",
        undefined,
        "Couldn’t load your settings.",
      );
      return settings;
    },

    async pushSettings(_userId, settings) {
      await request("PUT", "/account/settings", settings, "Couldn’t sync your settings.");
    },

    async listConnectedApps() {
      const { apps } = await request<{ apps: ConnectedApp[] }>(
        "GET",
        "/account/connected-apps",
        undefined,
        "Couldn’t load your connected apps.",
      );
      return apps;
    },

    async revokeConnectedApp(id) {
      await request(
        "DELETE",
        `/account/connected-apps/${encodeURIComponent(id)}`,
        undefined,
        "Couldn’t disconnect that app.",
      );
    },
  };
}

/** The API's wording for a share link that no longer resolves. */
const NOT_FOUND = "That shared preset is no longer available.";
