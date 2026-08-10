/**
 * ADVERSARIAL s46 (RT-2): horizontal escalation at the ROUTE layer.
 *
 * canTouchLearner is unit-proven; this pins that the export and deletion
 * ROUTES actually consult it with real cookies — a rival account's session
 * substituting someone else's learnerId gets 403 and zero data, and a
 * learner-scoped session cannot delete the whole account.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { migrate, openDb, _setDbForTests, type DB } from "@/server/db";
import { addLearner, login, setLearnerPin, signup, unlockLearner } from "@/server/authService";
import { SESSION_COOKIE } from "@/server/http";
import { GET as learnerGet } from "@/app/api/learner/route";
import { DELETE as accountDelete } from "@/app/api/account/route";

let dir: string;
let db: DB;
let victimLearner = "";
let ownerCookie = "";
let rivalCookie = "";
let learnerCookie = "";

const asToken = (r: unknown): string => {
  if (r && typeof r === "object" && "token" in r) return (r as { token: string }).token;
  throw new Error(`expected a session token, got ${JSON.stringify(r)}`);
};

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "maggie-authz-"));
  db = openDb(join(dir, "t.db"));
  migrate(db);
  _setDbForTests(db);

  signup(db, "owner@example.com", "longenough1", "parent");
  ownerCookie = `${SESSION_COOKIE}=${asToken(login(db, "owner@example.com", "longenough1"))}`;
  victimLearner = addLearner(db, ownerAccountId(), "Vic").learnerId;

  signup(db, "rival@example.com", "longenough1", "parent");
  rivalCookie = `${SESSION_COOKIE}=${asToken(login(db, "rival@example.com", "longenough1"))}`;

  // a learner-scoped session on the owner's account (PIN unlock)
  expect(setLearnerPin(db, ownerAccountId(), victimLearner, "1234")).toBe(true);
  learnerCookie = `${SESSION_COOKIE}=${asToken(unlockLearner(db, victimLearner, "1234"))}`;
});
afterEach(() => {
  _setDbForTests(null);
  rmSync(dir, { recursive: true, force: true });
});

function ownerAccountId(): string {
  return (db.prepare("SELECT id FROM users WHERE email = ?").get("owner@example.com") as { id: string }).id;
}

const req = (url: string, cookie: string, method = "GET") =>
  new NextRequest(url, { method, headers: { cookie } });

describe("export route (GET /api/learner)", () => {
  it("the owner exports their learner", async () => {
    const res = await learnerGet(req(`http://t/api/learner?learnerId=${victimLearner}`, ownerCookie));
    expect(res.status).toBe(200);
  });

  it("a rival substituting the victim's learnerId gets 403 and no data", async () => {
    const res = await learnerGet(req(`http://t/api/learner?learnerId=${victimLearner}`, rivalCookie));
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "forbidden" });
  });

  it("no cookie gets 401", async () => {
    const res = await learnerGet(req(`http://t/api/learner?learnerId=${victimLearner}`, ""));
    expect(res.status).toBe(401);
  });
});

describe("account deletion (DELETE /api/account)", () => {
  it("a learner-scoped session cannot delete the account", async () => {
    const res = await accountDelete(req("http://t/api/account", learnerCookie, "DELETE"));
    expect(res.status).toBe(403);
    // the account and its learner must still exist
    expect(db.prepare("SELECT COUNT(*) c FROM users WHERE email = ?").get("owner@example.com")).toEqual({ c: 1 });
    expect(db.prepare("SELECT COUNT(*) c FROM learners WHERE id = ?").get(victimLearner)).toEqual({ c: 1 });
  });
});
