// The Laravel driver (src/lib/api-cloud.ts) at the cloud gateway's seam: what the
// site asks of the API over HTTP, and what it hands back to the app. The fake is
// `fetch` itself — nothing inside the driver is reached into.
import assert from "node:assert/strict";
import { test } from "vitest";
import { createApiCloud } from "../../src/lib/api-cloud.ts";
import { CloudError } from "../../src/lib/cloud.ts";

const BASE = "https://api.focuship.app";
const ADA = { id: "1", email: "ada@example.com", name: "Ada", avatarUrl: null };

/** Answers requests from `routes` ("METHOD /path" -> response) and records every call. */
function fakeApi(routes = {}) {
  const calls = [];
  const cookies = new Map();

  const fetch = async (url, init = {}) => {
    const method = init.method ?? "GET";
    const path = url.slice(BASE.length);
    calls.push({
      method,
      path,
      credentials: init.credentials,
      headers: init.headers ?? {},
      body: init.body ? JSON.parse(init.body) : undefined,
    });

    if (path === "/sanctum/csrf-cookie") {
      cookies.set("XSRF-TOKEN", "csrf-token");
      return { ok: true, status: 204, json: async () => null };
    }

    const answer = routes[`${method} ${path}`];
    if (answer === undefined) return { ok: true, status: 204, json: async () => null };
    if (typeof answer === "function") return answer();

    const { status = 200, body = null } = answer;
    return { ok: status < 400, status, json: async () => body };
  };

  return { fetch, calls, readCookie: (name) => cookies.get(name) ?? null };
}

const cloudFor = (routes) => {
  const api = fakeApi(routes);
  return { api, cloud: createApiCloud({ baseUrl: BASE, ...api, navigate: (url) => api.calls.push({ navigate: url }) }) };
};

test("reports the signed-in listener to whoever is watching", async () => {
  const { cloud } = cloudFor({ "GET /auth/me": { body: { user: ADA } } });
  const seen = [];

  cloud.onAuthChange((user) => seen.push(user));
  await new Promise((r) => setTimeout(r, 0));

  assert.deepEqual(seen, [ADA]);
});

test("reports a guest as nobody signed in", async () => {
  const { cloud } = cloudFor({ "GET /auth/me": { body: { user: null } } });
  const seen = [];

  cloud.onAuthChange((user) => seen.push(user));
  await new Promise((r) => setTimeout(r, 0));

  assert.deepEqual(seen, [null]);
});

test("stops reporting once the app unsubscribes", async () => {
  const { cloud } = cloudFor({ "GET /auth/me": { body: { user: null } } });
  const seen = [];

  const off = cloud.onAuthChange((user) => seen.push(user));
  off();
  await cloud.verifyEmailCode("ada@example.com", "123456").catch(() => {});

  assert.deepEqual(seen, []);
});

test("sends a sign-in code with the security token", async () => {
  const { api, cloud } = cloudFor({});

  await cloud.sendEmailCode("Ada@Example.com", "turnstile-token");

  const sent = api.calls.find((c) => c.path === "/auth/email/code");
  assert.deepEqual(sent.body, { email: "Ada@Example.com", turnstile: "turnstile-token" });
  assert.equal(sent.credentials, "include");
});

test("fetches the CSRF cookie once, then carries the token on writes", async () => {
  const { api, cloud } = cloudFor({});

  await cloud.sendEmailCode("ada@example.com", "t");
  await cloud.sendEmailCode("ada@example.com", "t");

  const handshakes = api.calls.filter((c) => c.path === "/sanctum/csrf-cookie");
  assert.equal(handshakes.length, 1);
  assert.equal(api.calls.at(-1).headers["X-XSRF-TOKEN"], "csrf-token");
});

test("signs in with the emailed code and announces the listener", async () => {
  const { api, cloud } = cloudFor({ "POST /auth/email/verify": { body: { user: ADA } } });
  const seen = [];

  cloud.onAuthChange((user) => seen.push(user));
  await new Promise((r) => setTimeout(r, 0));
  await cloud.verifyEmailCode("ada@example.com", "123 456");

  assert.deepEqual(api.calls.find((c) => c.path === "/auth/email/verify").body, {
    email: "ada@example.com",
    code: "123456",
  });
  assert.deepEqual(seen.at(-1), ADA);
});

test("explains a wrong code in the API's own words", async () => {
  const { cloud } = cloudFor({
    "POST /auth/email/verify": {
      status: 422,
      body: { message: "Unprocessable", errors: { code: ["That code is wrong or has expired."] } },
    },
  });

  await assert.rejects(cloud.verifyEmailCode("ada@example.com", "000000"), (error) => {
    assert.ok(error instanceof CloudError);
    assert.equal(error.message, "That code is wrong or has expired.");
    return true;
  });
});

test("asks the listener to wait when the API is rate limiting", async () => {
  const { cloud } = cloudFor({ "POST /auth/email/code": { status: 429, body: { message: "Too Many Attempts." } } });

  await assert.rejects(cloud.sendEmailCode("ada@example.com", "t"), {
    message: "Too many tries. Wait a minute, then try again.",
  });
});

test("says so plainly when the API cannot be reached", async () => {
  const cloud = createApiCloud({
    baseUrl: BASE,
    fetch: async () => {
      throw new TypeError("Failed to fetch");
    },
    readCookie: () => "csrf-token",
  });

  await assert.rejects(cloud.sendEmailCode("ada@example.com", "t"), {
    message: "Focuship can’t reach your account right now. Check your connection.",
  });
});

test("sends the listener to the provider, with somewhere to come back to", async () => {
  const { api, cloud } = cloudFor({});

  await cloud.signIn("github", "https://focuship.app/account");

  assert.equal(
    api.calls.at(-1).navigate,
    `${BASE}/auth/github/redirect?redirect=${encodeURIComponent("https://focuship.app/account")}`,
  );
});

test("signs in with a Google ID token and announces the listener", async () => {
  const { api, cloud } = cloudFor({ "POST /auth/google/token": { body: { user: ADA } } });
  const seen = [];

  cloud.onAuthChange((user) => seen.push(user));
  await new Promise((r) => setTimeout(r, 0));
  await cloud.signInWithGoogleToken("id-token", "nonce");

  assert.deepEqual(api.calls.find((c) => c.path === "/auth/google/token").body, {
    token: "id-token",
    nonce: "nonce",
  });
  assert.deepEqual(seen.at(-1), ADA);
});

test("signing out leaves nobody signed in", async () => {
  const { cloud } = cloudFor({ "GET /auth/me": { body: { user: ADA } } });
  const seen = [];

  cloud.onAuthChange((user) => seen.push(user));
  await new Promise((r) => setTimeout(r, 0));
  await cloud.signOut();

  assert.deepEqual(seen, [ADA, null]);
});

test("lists the AI assistants the listener connected", async () => {
  const app = { id: "c-1", name: "Claude", connectedAt: "2026-10-20T10:00:00+00:00", lastUsedAt: "2026-10-22T08:00:00+00:00" };
  const { cloud } = cloudFor({ "GET /account/connected-apps": { body: { apps: [app] } } });

  assert.deepEqual(await cloud.listConnectedApps(), [app]);
});

test("disconnects an AI assistant", async () => {
  const { api, cloud } = cloudFor({});

  await cloud.revokeConnectedApp("c-1");

  assert.deepEqual(
    api.calls.filter((c) => c.path === "/account/connected-apps/c-1").map((c) => c.method),
    ["DELETE"],
  );
});
