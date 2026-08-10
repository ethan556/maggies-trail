/**
 * /api/sync route integration — the handlers exercised directly, now against
 * the REAL backend: an authenticated session and a durable SQLite file.
 *
 * The centerpiece scenarios are unchanged from the demo era (two offline
 * devices converge; learners stay separate; revisions bump), because the
 * protocol never changed — but the final test is inverted. The old suite
 * honestly asserted `durable: false`; this one PROVES durability by closing
 * the database file and reopening it: the pushed work must still be there.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/sync/route";
import { emptyProfile } from "@/lib/progress";
import type { SyncedProfile } from "@/lib/sync";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getDb, migrate, openDb, _setDbForTests } from "@/server/db";
import { login, signup } from "@/server/authService";
import { SESSION_COOKIE } from "@/server/http";

let dir = "";
let dbPath = "";
let cookie = "";

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "maggie-route-"));
  dbPath = join(dir, "t.db");
  const db = openDb(dbPath);
  migrate(db);
  _setDbForTests(db);
  signup(db, "p@x.com", "pw-one-two-three");
  const r = login(db, "p@x.com", "pw-one-two-three");
  if ("error" in r) throw new Error("login failed");
  cookie = `${SESSION_COOKIE}=${r.token}`;
});
afterEach(() => {
  getDb().close();
  _setDbForTests(null);
  rmSync(dir, { recursive: true, force: true });
});

function profile(over: Partial<SyncedProfile>): SyncedProfile {
  return { ...emptyProfile(), updatedAt: "2026-04-01T00:00:00.000Z", deviceId: "d", ...over };
}

async function pull(childId: string) {
  const req = new NextRequest(`http://t/api/sync?childId=${childId}`, { headers: { cookie } });
  return (await (await GET(req)).json()) as { profile: SyncedProfile | null; rev: number };
}

async function push(childId: string, p: SyncedProfile) {
  const req = new NextRequest("http://t/api/sync", {
    method: "POST",
    headers: { cookie },
    body: JSON.stringify({ childId, profile: p })
  });
  return (await (await POST(req)).json()) as { profile: SyncedProfile; rev: number };
}

describe("/api/sync", () => {
  it("returns rev 0 and no profile for a learner the server has never seen", async () => {
    const res = await pull("unknown-child");
    expect(res.rev).toBe(0);
    expect(res.profile).toBeNull();
  });

  it("401 without a session; 400 with a session but missing ids", async () => {
    const anon = new NextRequest("http://t/api/sync", { method: "POST", body: JSON.stringify({}) });
    expect((await POST(anon)).status).toBe(401);
    const authed = new NextRequest("http://t/api/sync", {
      method: "POST",
      headers: { cookie },
      body: JSON.stringify({})
    });
    expect((await POST(authed)).status).toBe(400);
  });

  it("bumps the revision on each accepted push, and stamps it into the document", async () => {
    const c = "child-rev";
    const first = await push(c, profile({ xp: 10 }));
    expect(first.rev).toBe(1);
    expect(first.profile.rev).toBe(1); // row and document can never disagree
    expect((await push(c, profile({ xp: 20 }))).rev).toBe(2);
    expect((await pull(c)).rev).toBe(2);
  });

  it("TWO DEVICES OFFLINE: both devices' work survives, and they converge", async () => {
    const c = "child-conflict";
    const base = profile({ xp: 100, lessons: { l1: { completed: true, bestXp: 100 } } });
    await push(c, base);

    const tablet = profile({
      deviceId: "tablet",
      updatedAt: "2026-04-02T09:00:00.000Z",
      xp: 160,
      lessons: { l1: { completed: true, bestXp: 100 }, l2: { completed: true, bestXp: 60 } },
      badges: ["streak-7"]
    });
    const phone = profile({
      deviceId: "phone",
      updatedAt: "2026-04-02T09:30:00.000Z",
      xp: 140,
      lessons: { l1: { completed: true, bestXp: 100 }, l3: { completed: true, bestXp: 40 } },
      badges: ["night-owl"]
    });

    await push(c, tablet);
    const after = await push(c, phone);

    expect(after.profile.lessons.l2?.completed).toBe(true);
    expect(after.profile.lessons.l3?.completed).toBe(true);
    expect(after.profile.xp).toBe(160);
    expect(after.profile.badges).toEqual(["night-owl", "streak-7"]);

    const seen = await pull(c);
    expect(seen.profile?.lessons.l2?.completed).toBe(true);
    expect(seen.profile?.lessons.l3?.completed).toBe(true);
  });

  it("keeps learners on the same account separate", async () => {
    await push("kid-a", profile({ xp: 500 }));
    await push("kid-b", profile({ xp: 10 }));
    expect((await pull("kid-a")).profile?.xp).toBe(500);
    expect((await pull("kid-b")).profile?.xp).toBe(10);
  });

  it("IS durable now: the data survives closing and reopening the database file", async () => {
    await push("kid-durable", profile({ xp: 777, lessons: { l1: { completed: true, bestXp: 777 } } }));
    // Simulate a process restart: close the handle, reopen the same file.
    getDb().close();
    _setDbForTests(openDb(dbPath));
    const seen = await pull("kid-durable");
    expect(seen.profile?.xp).toBe(777);
    expect(seen.profile?.lessons.l1?.completed).toBe(true);
    expect(seen.rev).toBe(1);
  });
});
