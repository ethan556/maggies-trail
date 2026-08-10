/**
 * REGRESSION s46 (RT-1): a non-JSON body must be a 400, never a 500.
 *
 * Found live: `curl -d 'not-json' /api/auth/login` returned HTTP 500 with a
 * SyntaxError in the server log — every POST route inline-awaited req.json()
 * unguarded. Malformed JSON is a CLIENT error; the fix is the shared
 * readJson() helper in @/server/http, and this suite pins every route that
 * was reachable in the broken state:
 *  - the auth routes and /api/learner parse BEFORE any session check, so an
 *    anonymous caller could 500 them;
 *  - /api/sync and /api/class check the session first, so the 500 needed an
 *    authenticated caller — the harness signs one up for real.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { migrate, openDb, _setDbForTests } from "@/server/db";
import { login, signup } from "@/server/authService";
import { SESSION_COOKIE } from "@/server/http";
import { POST as loginPost } from "@/app/api/auth/login/route";
import { POST as signupPost } from "@/app/api/auth/signup/route";
import { POST as magicPost, PUT as magicPut } from "@/app/api/auth/magic/route";
import { POST as resetPost, PUT as resetPut } from "@/app/api/auth/reset/route";
import { PUT as verifyPut } from "@/app/api/auth/verify/route";
import { readJson } from "@/server/http";
import { POST as learnerPost } from "@/app/api/learner/route";
import { POST as syncPost } from "@/app/api/sync/route";
import { POST as classPost } from "@/app/api/class/route";

let dir: string;
let cookie = "";

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "maggie-badjson-"));
  const db = openDb(join(dir, "t.db"));
  migrate(db);
  _setDbForTests(db);
  signup(db, "t@example.com", "longenough1", "teacher");
  const r = login(db, "t@example.com", "longenough1");
  if ("token" in r) cookie = `${SESSION_COOKIE}=${r.token}`;
});
afterEach(() => {
  _setDbForTests(null);
  rmSync(dir, { recursive: true, force: true });
});

const bad = (url: string, withCookie = false, method = "POST") =>
  new NextRequest(url, {
    method,
    body: "not-json",
    headers: withCookie ? { cookie, "content-type": "application/json" } : { "content-type": "application/json" }
  });

describe("malformed JSON bodies are client errors (never 500)", () => {
  it("anonymous-reachable routes answer 400", async () => {
    expect((await loginPost(bad("http://t/api/auth/login"))).status).toBe(400);
    expect((await signupPost(bad("http://t/api/auth/signup"))).status).toBe(400);
    expect((await magicPost(bad("http://t/api/auth/magic"))).status).toBe(400);
    expect((await magicPut(bad("http://t/api/auth/magic", false, "PUT"))).status).toBe(400);
    expect((await verifyPut(bad("http://t/api/auth/verify", false, "PUT"))).status).toBe(400);
    expect((await resetPost(bad("http://t/api/auth/reset"))).status).toBe(400);
    expect((await resetPut(bad("http://t/api/auth/reset", false, "PUT"))).status).toBe(400);
    expect((await learnerPost(bad("http://t/api/learner"))).status).toBe(400);
  });

  it("authenticated routes answer 400 once past the session gate", async () => {
    expect(cookie).not.toBe(""); // the harness really signed in
    expect((await syncPost(bad("http://t/api/sync", true))).status).toBe(400);
    expect((await classPost(bad("http://t/api/class", true))).status).toBe(400);
  });
});


describe("bounded JSON bodies", () => {
  it("rejects actual UTF-8 bodies over the limit even without content-length", async () => {
    const req = new Request("http://t/limited", {
      method: "POST",
      body: JSON.stringify({ value: "é".repeat(20) }),
      headers: { "content-type": "application/json" }
    });
    expect(await readJson(req, 20)).toBeNull();
  });

  it("rejects an oversized declared body before reading it", async () => {
    const req = new Request("http://t/limited", {
      method: "POST",
      body: "{}",
      headers: { "content-type": "application/json", "content-length": "1000" }
    });
    expect(await readJson(req, 20)).toBeNull();
  });
});
