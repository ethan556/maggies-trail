// @vitest-environment jsdom
/**
 * Roster fan-out: a parent's device holds several learners. Syncing must cover ALL of them, keep
 * them isolated, and adopt the server's copy without forging a local edit timestamp.
 *
 * The /api/sync route handlers are used directly as the backend (no HTTP server), with `fetch`
 * shimmed onto them — so this exercises the real protocol, not a mock of it.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/sync/route";
import { syncAll } from "./syncClient";
import { authProvider, MockAuthProvider, _setAuthProviderForTests } from "./auth";
_setAuthProviderForTests(new MockAuthProvider()); // jsdom has no API routes
import { addChild, getRoster, readChildProfile, writeChildProfile } from "./roster";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getDb, migrate, openDb, _setDbForTests } from "@/server/db";
import { login, signup } from "@/server/authService";
import { SESSION_COOKIE } from "@/server/http";
import { emptyProfile } from "./progress";
import type { SyncedProfile } from "./sync";

/** The routes now authenticate for real, so the shim carries a REAL session
 * cookie issued by the auth service against a scratch database — this file is
 * a full-stack test (syncClient → route handler → auth → SQLite), not a mock
 * of the protocol. */
let cookie = "";
function wireFetch() {
  vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
    const headers = { cookie };
    if (!init || init.method !== "POST") {
      return GET(new NextRequest(`http://t${url}`, { headers }));
    }
    return POST(new NextRequest("http://t/api/sync", { method: "POST", body: init.body as string, headers }));
  });
}

let seq = 0;
let dbDir = "";
/** Fresh account per test: signup + login on the server (the cookie is the
 * authority) AND the Mock mirror for the client's synchronous display path. */
async function signInFresh() {
  seq++;
  const email = `parent${seq}@example.com`;
  signup(getDb(), email, "pw-one-two-three");
  const r = login(getDb(), email, "pw-one-two-three");
  if ("error" in r) throw new Error("login failed");
  cookie = `${SESSION_COOKIE}=${r.token}`;
  return authProvider.signIn(email);
}

beforeEach(() => {
  localStorage.clear();
  dbDir = mkdtempSync(join(tmpdir(), "maggie-syncclient-"));
  const db = openDb(join(dbDir, "t.db"));
  migrate(db);
  _setDbForTests(db);
  wireFetch();
});
afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
  getDb().close();
  _setDbForTests(null);
  rmSync(dbDir, { recursive: true, force: true });
});

function seed(childId: string, over: Partial<SyncedProfile>) {
  writeChildProfile(childId, {
    ...emptyProfile(),
    updatedAt: "2026-06-01T00:00:00.000Z",
    deviceId: "seed",
    ...over
  } as SyncedProfile);
}

describe("syncAll — roster fan-out", () => {
  it("is a no-op when signed out, and says so", async () => {
    const res = await syncAll();
    expect(res.state).toBe("signed-out");
  });

  it("syncs EVERY learner on the roster, not just the active one", async () => {
    await signInFresh();
    const first = getRoster().activeId;
    const second = addChild("Mia").children[1].id;
    const third = addChild("Sam").children[2].id; // Sam is now active

    seed(first, { xp: 100 });
    seed(second, { xp: 250 });
    seed(third, { xp: 30 });

    const res = await syncAll();
    expect(res.state).toBe("ok");
    expect(res.synced).toBe(3); // all three, not just the active child

    // Each learner's work reached the server independently.
    const acct = authProvider.currentSession()!.accountId;
    const pull = async (id: string) => {
      const r = await GET(new NextRequest(`http://t/api/sync?accountId=${acct}&childId=${id}`, { headers: { cookie } }));
      return (await r.json()) as { profile: SyncedProfile | null };
    };
    expect((await pull(first)).profile?.xp).toBe(100);
    expect((await pull(second)).profile?.xp).toBe(250);
    expect((await pull(third)).profile?.xp).toBe(30);
  });

  it("keeps learners isolated — one child's progress never leaks into another", async () => {
    await signInFresh();
    const a = getRoster().activeId;
    const b = addChild("Mia").children[1].id;

    seed(a, { xp: 500, badges: ["streak-7"], lessons: { l1: { completed: true, bestXp: 500 } } });
    seed(b, { xp: 10, badges: [] });

    await syncAll();

    expect(readChildProfile(a).xp).toBe(500);
    expect(readChildProfile(b).xp).toBe(10);
    expect(readChildProfile(b).badges).toEqual([]);
    expect(readChildProfile(b).lessons).toEqual({});
  });

  it("adopting the server copy does NOT forge a local edit timestamp", async () => {
    await signInFresh();
    const id = getRoster().activeId;
    seed(id, { xp: 40, updatedAt: "2026-06-01T00:00:00.000Z", deviceId: "seed" });

    await syncAll();

    // The merge decided this timestamp; adoption must preserve it rather than stamp "now".
    const after = readChildProfile(id) as SyncedProfile;
    expect(after.updatedAt).toBe("2026-06-01T00:00:00.000Z");
    expect(after.rev).toBe(1); // server revision was adopted
  });

  it("pulls a second device's work down onto this one", async () => {
    await signInFresh();
    const acct = authProvider.currentSession()!.accountId;
    const id = getRoster().activeId;

    // Another device already pushed richer progress for this learner.
    await POST(
      new NextRequest("http://t/api/sync", {
        method: "POST",
        headers: { cookie },
        body: JSON.stringify({
          accountId: acct,
          childId: id,
          profile: {
            ...emptyProfile(),
            updatedAt: "2026-06-02T00:00:00.000Z",
            deviceId: "other",
            xp: 900,
            lessons: { l9: { completed: true, bestXp: 900 } }
          }
        })
      })
    );

    seed(id, { xp: 10 }); // this device is behind
    const res = await syncAll();
    expect(res.state).toBe("ok");

    expect(readChildProfile(id).xp).toBe(900); // pulled down, not overwritten by our stale 10
    expect(readChildProfile(id).lessons.l9?.completed).toBe(true);
  });

  it("reports offline honestly and counts how many learners got through", async () => {
    await signInFresh();
    addChild("Mia");
    vi.stubGlobal("fetch", async () => {
      throw new TypeError("Failed to fetch");
    });
    const res = await syncAll();
    expect(res.state).toBe("offline");
    expect(res.synced).toBe(0);
    expect(res.detail).toMatch(/saved on this device/);
  });
});
