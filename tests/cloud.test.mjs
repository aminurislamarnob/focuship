// The cloud gateway (src/lib/cloud.ts), run against a fake driver: these tests
// observe behavior at the seam — what the gateway asks of Supabase and what it
// hands back to the app — never supabase-js internals. The module is imported
// directly; Node strips its types (it has no runtime imports by design).
import assert from "node:assert/strict";
import { test } from "node:test";
import { CloudError, createCloud, newerSettings, PRESET_LIMIT } from "../src/lib/cloud.ts";

/**
 * A fake CloudDriver: records every operation and answers from `handlers`
 * (table name -> (op) -> { data, error }). Query builders chain and are
 * thenable, like the real PostgREST builders.
 */
function fakeDriver(handlers = {}) {
  const ops = [];
  const from = (table) => {
    const op = { table, action: "select", values: null, filters: [], single: false };
    const answer = () => (handlers[table] ?? (() => ({ data: [], error: null })))(op);
    const write = (action) => (values) => {
      op.action = action;
      op.values = values;
      return q;
    };
    const q = {
      select: () => q,
      insert: write("insert"),
      update: write("update"),
      upsert: write("upsert"),
      delete: write("delete"),
      eq(column, value) {
        op.filters.push([column, value]);
        return q;
      },
      order: () => q,
      maybeSingle() {
        op.single = true;
        return q;
      },
      then(resolve, reject) {
        ops.push(op);
        return Promise.resolve(answer()).then(resolve, reject);
      },
    };
    return q;
  };
  let authCallback;
  const auth = {
    onAuthStateChange: (callback) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: () => (authCallback = undefined) } } };
    },
    signInWithOAuth: async (options) => (ops.push({ oauth: options }), { error: handlers.oauthError ?? null }),
    signOut: async () => (ops.push({ signOut: true }), { error: null }),
  };
  return {
    ops,
    fireAuth: (session) => authCallback?.("TEST", session),
    driver: {
      auth,
      from,
      rpc: (fn, args) => (ops.push({ rpc: fn, args }), Promise.resolve({ error: handlers.rpcError ?? null })),
    },
  };
}

// Auth -----------------------------------------------------------------------

test("onAuthChange maps a session to a CloudUser and null to null", () => {
  const { driver, fireAuth } = fakeDriver();
  const seen = [];
  createCloud(driver).onAuthChange((user) => seen.push(user));
  fireAuth({
    user: {
      id: "u1",
      email: "a@b.c",
      user_metadata: { full_name: "Ada", avatar_url: "https://img/a.png" },
      app_metadata: { provider: "github" },
    },
  });
  fireAuth(null);
  assert.deepEqual(seen, [
    { id: "u1", email: "a@b.c", name: "Ada", avatarUrl: "https://img/a.png", provider: "github" },
    null,
  ]);
});

test("onAuthChange falls back to email for the name and unsubscribes cleanly", () => {
  const { driver, fireAuth } = fakeDriver();
  const seen = [];
  const off = createCloud(driver).onAuthChange((user) => seen.push(user));
  fireAuth({ user: { id: "u2", email: "x@y.z" } });
  off();
  fireAuth({ user: { id: "u3" } });
  assert.equal(seen.length, 1);
  assert.equal(seen[0].name, "x@y.z");
  assert.equal(seen[0].avatarUrl, null);
  assert.equal(seen[0].provider, "unknown");
});

test("signIn passes provider and redirect through; a failure throws a friendly CloudError", async () => {
  const ok = fakeDriver();
  await createCloud(ok.driver).signIn("google", "https://focuship.app/");
  assert.deepEqual(ok.ops[0], { oauth: { provider: "google", options: { redirectTo: "https://focuship.app/" } } });

  const bad = fakeDriver({ oauthError: { message: "boom" } });
  await assert.rejects(createCloud(bad.driver).signIn("github", "https://focuship.app/"), CloudError);
});

test("deleteAccount calls the RPC, then clears the local session even if sign-out fails", async () => {
  const { driver, ops } = fakeDriver();
  driver.auth.signOut = async () => {
    ops.push({ signOut: true });
    throw new Error("session already gone");
  };
  await createCloud(driver).deleteAccount();
  assert.deepEqual(ops[0], { rpc: "delete_account", args: undefined });
  assert.deepEqual(ops[1], { signOut: true });
});

// Favorites --------------------------------------------------------------------

test("favorites round-trip: list maps refs, add inserts, remove filters by owner and ref", async () => {
  const { driver, ops } = fakeDriver({
    favorites: (op) => ({ data: op.action === "select" ? [{ preset_ref: "deep-work" }, { preset_ref: "abc-123" }] : [], error: null }),
  });
  const cloud = createCloud(driver);
  assert.deepEqual(await cloud.listFavorites(), ["deep-work", "abc-123"]);
  await cloud.addFavorite("u1", "coastline");
  await cloud.removeFavorite("u1", "coastline");
  assert.deepEqual(ops[1].values, { user_id: "u1", preset_ref: "coastline" });
  assert.equal(ops[2].action, "delete");
  assert.deepEqual(ops[2].filters, [["user_id", "u1"], ["preset_ref", "coastline"]]);
});

test("adding a favorite twice is not an error; other failures surface friendly messages", async () => {
  const dup = fakeDriver({ favorites: () => ({ data: null, error: { message: "dup", code: "23505" } }) });
  await createCloud(dup.driver).addFavorite("u1", "deep-work");

  const down = fakeDriver({ favorites: () => ({ data: null, error: { message: "network" } }) });
  await assert.rejects(createCloud(down.driver).addFavorite("u1", "deep-work"), (e) => {
    assert.ok(e instanceof CloudError);
    assert.match(e.message, /favorite/);
    return true;
  });
});

// Custom presets ----------------------------------------------------------------

test("createPreset writes the app's id, label and layers under the owner", async () => {
  const { driver, ops } = fakeDriver();
  await createCloud(driver).createPreset("u1", { id: "p-1", label: "Night rain", layers: { "light-rain": 0.6 } });
  assert.equal(ops[0].table, "user_presets");
  assert.deepEqual(ops[0].values, { id: "p-1", user_id: "u1", label: "Night rain", layers: { "light-rain": 0.6 } });
});

test("the database cap trigger surfaces as the friendly preset-limit message", async () => {
  const capped = fakeDriver({ user_presets: () => ({ data: null, error: { message: "preset-limit", code: "P0001" } }) });
  await assert.rejects(createCloud(capped.driver).createPreset("u1", { id: "p", label: "x", layers: {} }), (e) => {
    assert.match(e.message, new RegExp(String(PRESET_LIMIT)));
    return true;
  });
});

test("listPresets maps rows to CustomPreset, including the share flag", async () => {
  const { driver } = fakeDriver({
    user_presets: () => ({
      data: [{ id: "p-1", label: "Night rain", layers: { cafe: 0.5 }, is_public: true }],
      error: null,
    }),
  });
  assert.deepEqual(await createCloud(driver).listPresets(), [
    { id: "p-1", label: "Night rain", layers: { cafe: 0.5 }, isPublic: true },
  ]);
});

test("deletePreset removes the owner's favorite for it before the preset itself", async () => {
  const { driver, ops } = fakeDriver();
  await createCloud(driver).deletePreset("u1", "p-1");
  assert.equal(ops[0].table, "favorites");
  assert.equal(ops[0].action, "delete");
  assert.deepEqual(ops[0].filters, [["user_id", "u1"], ["preset_ref", "p-1"]]);
  assert.equal(ops[1].table, "user_presets");
  assert.equal(ops[1].action, "delete");
  assert.deepEqual(ops[1].filters, [["id", "p-1"]]);
});

test("setPresetPublic flips only the share flag", async () => {
  const { driver, ops } = fakeDriver();
  await createCloud(driver).setPresetPublic("p-1", true);
  assert.deepEqual(ops[0].values, { is_public: true });
  assert.deepEqual(ops[0].filters, [["id", "p-1"]]);
});

// Share links --------------------------------------------------------------------

test("fetchSharedPreset only asks for public rows and returns null when there is none", async () => {
  const found = fakeDriver({
    user_presets: (op) => ({ data: op.single ? { id: "p-1", label: "Night rain", layers: { cafe: 0.5 } } : [], error: null }),
  });
  const preset = await createCloud(found.driver).fetchSharedPreset("p-1");
  assert.deepEqual(preset, { id: "p-1", label: "Night rain", layers: { cafe: 0.5 } });
  assert.deepEqual(found.ops[0].filters, [["id", "p-1"], ["is_public", true]]);

  const missing = fakeDriver({ user_presets: () => ({ data: null, error: null }) });
  assert.equal(await createCloud(missing.driver).fetchSharedPreset("p-9"), null);
});

test("a mangled share link (invalid uuid) reads as not-found, not a failure", async () => {
  const { driver } = fakeDriver({
    user_presets: () => ({ data: null, error: { message: "invalid input syntax for type uuid", code: "22P02" } }),
  });
  assert.equal(await createCloud(driver).fetchSharedPreset("not-a-uuid"), null);
});

// Settings sync -------------------------------------------------------------------

test("newerSettings: the newer write wins, local wins ties, missing sides defer", () => {
  const at = (updatedAt) => ({ timer: {}, volume: 0.8, updatedAt });
  assert.equal(newerSettings(at(100), at(200)), "cloud");
  assert.equal(newerSettings(at(200), at(100)), "local");
  assert.equal(newerSettings(at(100), at(100)), "local");
  assert.equal(newerSettings(at(100), null), "local");
  assert.equal(newerSettings(null, at(100)), "cloud");
  assert.equal(newerSettings(null, null), "local");
});

test("settings round-trip: getSettings parses the clock, pushSettings writes it back as ISO", async () => {
  const { driver, ops } = fakeDriver({
    user_settings: (op) =>
      op.action === "select"
        ? { data: { timer: { focus: 50 }, volume: 0.5, updated_at: "2026-10-21T10:00:00.000Z" }, error: null }
        : { data: [], error: null },
  });
  const cloud = createCloud(driver);
  const settings = await cloud.getSettings("u1");
  assert.deepEqual(settings, { timer: { focus: 50 }, volume: 0.5, updatedAt: Date.parse("2026-10-21T10:00:00.000Z") });

  await cloud.pushSettings("u1", { timer: { focus: 30 }, volume: 0.7, updatedAt: Date.parse("2026-10-21T11:00:00.000Z") });
  assert.equal(ops[1].action, "upsert");
  assert.deepEqual(ops[1].values, {
    user_id: "u1",
    timer: { focus: 30 },
    volume: 0.7,
    updated_at: "2026-10-21T11:00:00.000Z",
  });

  const empty = fakeDriver({ user_settings: () => ({ data: null, error: null }) });
  assert.equal(await createCloud(empty.driver).getSettings("u1"), null);
});
