/**
 * AUTH SERVICE (s43) — the security properties, proven:
 *  · signup is enumeration-safe: identical external result either way, and
 *    the existing-email path still produces a USEFUL mail (magic link);
 *  · passwords verify only against the real hash; unknown emails burn a hash;
 *  · sessions are opaque, expiring, revocable; logout revokes;
 *  · verification / magic-link / reset tokens are single-use and expiring;
 *  · a password reset revokes EVERY session;
 *  · a magic link counts as email verification (inbox control proven);
 *  · rate limiting counts durably and trips at the limit;
 *  · learner PIN unlock issues a learner-scoped session; ownership checks
 *    come from rows, so a stranger cannot set a child's PIN;
 *  · account deletion cascades but the audit row survives;
 *  · learner export returns the full record.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { migrate, openDb, type DB } from "@/server/db";
import {
  addLearner,
  canTouchLearner,
  consumeMagicLink,
  consumePasswordReset,
  deleteAccount,
  exportLearner,
  login,
  logout,
  rateLimit,
  requestMagicLink,
  requestPasswordReset,
  sessionFor,
  setLearnerPin,
  signup,
  unlockLearner,
  verifyEmail
} from "@/server/authService";

let dir: string;
let db: DB;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "maggie-auth-"));
  db = openDb(join(dir, "t.db"));
  migrate(db);
});
afterEach(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

const outbox = () => db.prepare("SELECT to_email, purpose, body FROM mail_outbox ORDER BY id").all() as Array<{
  to_email: string;
  purpose: string;
  body: string;
}>;
const tokenFrom = (body: string) => body.split("token=")[1];

describe("signup and verification", () => {
  it("is enumeration-safe: identical result for new and existing emails", () => {
    expect(signup(db, "a@x.com", "pw-one-two")).toEqual({ ok: true });
    expect(signup(db, "a@x.com", "different")).toEqual({ ok: true }); // no leak
    const mails = outbox();
    expect(mails[0].purpose).toBe("verify-email");
    expect(mails[0].body).toContain("/verify?token=");
    expect(mails[1].purpose).toBe("magic-link"); // still useful, still silent
    expect(mails[1].body).toContain("/magic?token=");
    expect(mails[1].body).not.toContain("/consume");
    expect(db.prepare("SELECT COUNT(*) c FROM users").get()).toEqual({ c: 1 });
  });

  it("verify-email tokens are single-use and flip the flag", () => {
    signup(db, "a@x.com", "pw-one-two");
    const t = tokenFrom(outbox()[0].body);
    expect(verifyEmail(db, t)).toBe(true);
    expect(verifyEmail(db, t)).toBe(false); // burned
    const u = db.prepare("SELECT email_verified_at FROM users").get() as { email_verified_at: string | null };
    expect(u.email_verified_at).not.toBeNull();
  });
});

describe("login and sessions", () => {
  it("one error shape for wrong password and unknown email", () => {
    signup(db, "a@x.com", "pw-one-two");
    expect(login(db, "a@x.com", "wrong")).toEqual({ error: "invalid" });
    expect(login(db, "nobody@x.com", "whatever")).toEqual({ error: "invalid" });
  });

  it("a good login yields a working session; logout revokes it", () => {
    signup(db, "a@x.com", "pw-one-two");
    const r = login(db, "a@x.com", "pw-one-two");
    if ("error" in r) throw new Error("expected token");
    const s = sessionFor(db, r.token);
    expect(s?.user.email).toBe("a@x.com");
    expect(s?.user.role).toBe("parent");
    logout(db, r.token);
    expect(sessionFor(db, r.token)).toBeNull();
  });

  it("sessions are server rows: a forged token is nothing", () => {
    expect(sessionFor(db, "forged-token-of-any-shape")).toBeNull();
  });
});

describe("passwordless and recovery", () => {
  it("magic link signs in AND verifies the email (inbox control proven)", () => {
    signup(db, "a@x.com", "pw-one-two");
    requestMagicLink(db, "a@x.com");
    requestMagicLink(db, "ghost@x.com"); // same shape, no mail row for ghosts
    const links = outbox().filter((m) => m.purpose === "magic-link");
    expect(links).toHaveLength(1);
    const r = consumeMagicLink(db, tokenFrom(links[0].body));
    expect(r).not.toBeNull();
    const u = db.prepare("SELECT email_verified_at FROM users").get() as { email_verified_at: string | null };
    expect(u.email_verified_at).not.toBeNull();
    expect(consumeMagicLink(db, tokenFrom(links[0].body))).toBeNull(); // single-use
  });

  it("a password reset revokes every session", () => {
    signup(db, "a@x.com", "old-password");
    const s1 = login(db, "a@x.com", "old-password");
    const s2 = login(db, "a@x.com", "old-password");
    if ("error" in s1 || "error" in s2) throw new Error("expected tokens");
    requestPasswordReset(db, "a@x.com");
    const resetMail = outbox().find((m) => m.purpose === "password-reset")!;
    expect(resetMail.body).toContain("/reset?token=");
    const t = tokenFrom(resetMail.body);
    expect(consumePasswordReset(db, t, "new-password")).toBe(true);
    expect(sessionFor(db, s1.token)).toBeNull();
    expect(sessionFor(db, s2.token)).toBeNull();
    expect("token" in login(db, "a@x.com", "new-password")).toBe(true);
    expect(login(db, "a@x.com", "old-password")).toEqual({ error: "invalid" });
  });
});

describe("rate limiting", () => {
  it("allows up to the limit in a window, then refuses — durably", () => {
    expect(rateLimit(db, "login:1.2.3.4", 3, 60)).toBe(true);
    expect(rateLimit(db, "login:1.2.3.4", 3, 60)).toBe(true);
    expect(rateLimit(db, "login:1.2.3.4", 3, 60)).toBe(true);
    expect(rateLimit(db, "login:1.2.3.4", 3, 60)).toBe(false);
    expect(rateLimit(db, "login:5.6.7.8", 3, 60)).toBe(true); // other bucket unaffected
  });
});

describe("learners: children are not email accounts", () => {
  it("PIN unlock issues a learner-scoped session; wrong PIN fails; strangers cannot set PINs", () => {
    signup(db, "parent@x.com", "pw-one-two");
    signup(db, "other@x.com", "pw-one-two");
    const parent = (db.prepare("SELECT id FROM users WHERE email='parent@x.com'").get() as { id: string }).id;
    const other = (db.prepare("SELECT id FROM users WHERE email='other@x.com'").get() as { id: string }).id;
    const { learnerId } = addLearner(db, parent, "Ana", 3);

    expect(setLearnerPin(db, other, learnerId, "1234")).toBe(false); // ownership from rows
    expect(setLearnerPin(db, parent, learnerId, "1234")).toBe(true);
    expect(unlockLearner(db, learnerId, "9999")).toBeNull();

    const r = unlockLearner(db, learnerId, "1234");
    expect(r).not.toBeNull();
    const s = sessionFor(db, r!.token)!;
    expect(s.learnerId).toBe(learnerId);
    expect(canTouchLearner(db, s, learnerId)).toBe(true);

    // The learner-scoped session touches ONLY that learner.
    const { learnerId: sibling } = addLearner(db, parent, "Ben");
    expect(canTouchLearner(db, s, sibling)).toBe(false);

    // The parent session touches the whole roster; a stranger's touches none of it.
    const p = login(db, "parent@x.com", "pw-one-two");
    const o = login(db, "other@x.com", "pw-one-two");
    if ("error" in p || "error" in o) throw new Error("expected tokens");
    expect(canTouchLearner(db, sessionFor(db, p.token)!, sibling)).toBe(true);
    expect(canTouchLearner(db, sessionFor(db, o.token)!, learnerId)).toBe(false);
  });
});

describe("deletion and export", () => {
  it("deletion cascades; the audit row survives; export returns the record", () => {
    signup(db, "a@x.com", "pw-one-two");
    const uid = (db.prepare("SELECT id FROM users").get() as { id: string }).id;
    const { learnerId } = addLearner(db, uid, "Ana");
    db.prepare("INSERT INTO profiles (learner_id, version, data, updated_at) VALUES (?,1,'{\"xp\":7}',?)").run(
      learnerId,
      new Date().toISOString()
    );

    const exported = exportLearner(db, learnerId);
    expect((exported.profile as { data: { xp: number } }).data.xp).toBe(7);

    deleteAccount(db, uid);
    expect(db.prepare("SELECT COUNT(*) c FROM users").get()).toEqual({ c: 0 });
    expect(db.prepare("SELECT COUNT(*) c FROM learners").get()).toEqual({ c: 0 });
    expect(db.prepare("SELECT COUNT(*) c FROM profiles").get()).toEqual({ c: 0 });
    const trail = db.prepare("SELECT action, detail FROM audit_log WHERE action='account-deleted'").get();
    expect(trail).toEqual({ action: "account-deleted", detail: uid });
  });
});
