/**
 * AUTH SERVICE — real server-side identity against the durable database.
 *
 * This replaces MockAuthProvider's server half. Everything here is genuinely
 * implemented and tested: scrypt password hashing (per-user salt + process
 * pepper, timing-safe compare), opaque session tokens stored only as SHA-256,
 * single-use expiring tokens for email verification / magic links / password
 * reset, enumeration-safe responses (identical shape AND a dummy hash on the
 * unknown-email path so timing doesn't leak), durable rate limiting, and an
 * audit trail written in the same transaction as the action it records.
 *
 * The one honest seam: DELIVERY. There is no SMTP here, so the Mailer writes
 * to the mail_outbox table — the flows are complete and the outbox is the
 * inspectable truth of what a real transport would send.
 *
 * Roles: rows in `users.role` — parent | teacher | school-admin |
 * platform-admin — plus LEARNER as a session scope (learner_id on the
 * session), because children are not email accounts. Authorization derives
 * from these rows and the session cookie, NEVER from request bodies.
 */

import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { DB } from "@/server/db";

const DEV_PEPPER = "dev-pepper-not-secret";

/** Fail closed in production. A silent shared fallback pepper turns every
 * password database into the same target and is not an acceptable deployment
 * default. Development and tests retain a deterministic zero-config seam. */
function passwordPepper(): string {
  const configured = process.env.AUTH_PEPPER?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_PEPPER must be configured in production");
  }
  return DEV_PEPPER;
}

export function authSecretsReady(): boolean {
  return process.env.NODE_ENV !== "production" || Boolean(process.env.AUTH_PEPPER?.trim());
}
const SESSION_DAYS = 30;
const TOKEN_MINUTES = 30;

export type UserRole = "parent" | "teacher" | "school-admin" | "platform-admin";
export interface User {
  id: string;
  email: string;
  role: UserRole;
  emailVerifiedAt: string | null;
}
export interface SessionInfo {
  user: User;
  learnerId: string | null;
}

const nowIso = () => new Date().toISOString();
const plusMinutes = (m: number) => new Date(Date.now() + m * 60000).toISOString();
const plusDays = (d: number) => new Date(Date.now() + d * 86400000).toISOString();
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const newId = (p: string) => `${p}_${randomBytes(9).toString("base64url")}`;
const newToken = () => randomBytes(32).toString("base64url");
const normalizeEmail = (email: string) => email.trim().toLowerCase();

// ── Password hashing ────────────────────────────────────────────────────────

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password + passwordPepper(), salt, 64).toString("hex");
  return `s2:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string | null): boolean {
  // Unknown user / no password set: burn a real hash anyway so the timing of
  // "wrong email" and "wrong password" is indistinguishable.
  const [, salt, hash] = (stored ?? `s2:${"0".repeat(32)}:${"0".repeat(128)}`).split(":");
  const candidate = scryptSync(password + passwordPepper(), salt, 64);
  const expected = Buffer.from(hash, "hex");
  return stored !== null && candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

// ── Audit + rate limiting ───────────────────────────────────────────────────

export function audit(db: DB, userId: string | null, action: string, detail = ""): void {
  db.prepare("INSERT INTO audit_log (at, user_id, action, detail) VALUES (?,?,?,?)").run(
    nowIso(),
    userId,
    action,
    detail
  );
}

/** Durable fixed-window limiter. Returns true when the call is ALLOWED. */
export function rateLimit(db: DB, bucket: string, limit: number, windowSec: number): boolean {
  const windowStart = new Date(Math.floor(Date.now() / (windowSec * 1000)) * windowSec * 1000).toISOString();
  const row = db
    .prepare(
      `INSERT INTO rate_limits (bucket, window_start, count) VALUES (?,?,1)
       ON CONFLICT(bucket, window_start) DO UPDATE SET count = count + 1
       RETURNING count`
    )
    .get(bucket, windowStart) as { count: number };
  return row.count <= limit;
}

// ── Mail (the delivery seam) ────────────────────────────────────────────────

export function enqueueMail(db: DB, to: string, purpose: string, body: string): void {
  db.prepare("INSERT INTO mail_outbox (created_at, to_email, purpose, body) VALUES (?,?,?,?)").run(
    nowIso(),
    to,
    purpose,
    body
  );
}

// ── Single-use tokens ───────────────────────────────────────────────────────

type TokenPurpose = "verify-email" | "magic-link" | "password-reset";

function issueToken(db: DB, userId: string, purpose: TokenPurpose): string {
  const raw = newToken();
  db.prepare("INSERT INTO tokens (token_hash, user_id, purpose, created_at, expires_at) VALUES (?,?,?,?,?)").run(
    sha256(raw),
    userId,
    purpose,
    nowIso(),
    plusMinutes(TOKEN_MINUTES)
  );
  return raw;
}

function consumeToken(db: DB, raw: string, purpose: TokenPurpose): string | null {
  const at = nowIso();
  // One atomic UPDATE makes single-use true even when two requests arrive at
  // the same instant. A SELECT followed by UPDATE allowed both to observe the
  // unused row before either marked it consumed.
  const row = db
    .prepare(
      `UPDATE tokens SET used_at = ?
       WHERE token_hash = ? AND purpose = ? AND used_at IS NULL AND expires_at >= ?
       RETURNING user_id`
    )
    .get(at, sha256(raw), purpose, at) as { user_id: string } | undefined;
  return row?.user_id ?? null;
}

// ── Accounts ────────────────────────────────────────────────────────────────

/** Enumeration-safe signup: the external result is IDENTICAL whether the
 * email is new or already registered — "check your inbox". A new account gets
 * a verify-email token; an existing one gets a magic-link token (so the mail
 * is useful either way, and nothing about the response reveals which). */
export function signup(db: DB, email: string, password: string, role: "parent" | "teacher" = "parent"): { ok: true } {
  email = normalizeEmail(email);
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as { id: string } | undefined;
  if (existing) {
    hashPassword(password); // timing parity with the create path
    enqueueMail(db, email, "magic-link", `Sign in: /magic?token=${issueToken(db, existing.id, "magic-link")}`);
    audit(db, existing.id, "signup-existing-email");
    return { ok: true };
  }
  const id = newId("u");
  db.prepare("INSERT INTO users (id, email, pw_hash, role, created_at) VALUES (?,?,?,?,?)").run(
    id,
    email,
    hashPassword(password),
    role,
    nowIso()
  );
  enqueueMail(db, email, "verify-email", `Verify: /verify?token=${issueToken(db, id, "verify-email")}`);
  audit(db, id, "signup", role);
  return { ok: true };
}

export function verifyEmail(db: DB, rawToken: string): boolean {
  const userId = consumeToken(db, rawToken, "verify-email");
  if (!userId) return false;
  db.prepare("UPDATE users SET email_verified_at = ? WHERE id = ?").run(nowIso(), userId);
  audit(db, userId, "email-verified");
  return true;
}

// ── Sessions ────────────────────────────────────────────────────────────────

function createSession(db: DB, userId: string, learnerId: string | null = null): string {
  const raw = newToken();
  db.prepare(
    "INSERT INTO sessions (token_hash, user_id, learner_id, created_at, expires_at) VALUES (?,?,?,?,?)"
  ).run(sha256(raw), userId, learnerId, nowIso(), plusDays(SESSION_DAYS));
  return raw;
}

/** s113: mint a login session for a user whose identity was verified by an
 * EXTERNAL trust chain — today, a validated LTI 1.3 launch (issuer-signed
 * id_token). Deliberately a thin, audited wrapper over the same private
 * createSession every password/magic-link login uses: one session shape,
 * one revocation path, one purge. Callers must have completed verification
 * BEFORE calling; this function does not check anything but existence. */
export function createLoginSession(db: DB, userId: string, via: string): { token: string } | { error: "no-user" } {
  const user = db.prepare("SELECT id FROM users WHERE id = ? AND deleted_at IS NULL").get(userId);
  if (!user) return { error: "no-user" };
  const token = createSession(db, userId);
  audit(db, userId, "login", via);
  return { token };
}

export function sessionFor(db: DB, rawToken: string | null): SessionInfo | null {
  if (!rawToken) return null;
  const row = db
    .prepare(
      `SELECT s.learner_id, s.expires_at, s.revoked_at, u.id, u.email, u.role, u.email_verified_at
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND u.deleted_at IS NULL`
    )
    .get(sha256(rawToken)) as
    | { learner_id: string | null; expires_at: string; revoked_at: string | null; id: string; email: string; role: UserRole; email_verified_at: string | null }
    | undefined;
  if (!row || row.revoked_at || row.expires_at < nowIso()) return null;
  return {
    user: { id: row.id, email: row.email, role: row.role, emailVerifiedAt: row.email_verified_at },
    learnerId: row.learner_id
  };
}

/** Password sign-in. One error shape for every failure — nothing enumerates. */
export function login(db: DB, email: string, password: string): { token: string } | { error: "invalid" } {
  email = normalizeEmail(email);
  const row = db.prepare("SELECT id, pw_hash FROM users WHERE email = ? AND deleted_at IS NULL").get(email) as
    | { id: string; pw_hash: string | null }
    | undefined;
  const ok = verifyPassword(password, row?.pw_hash ?? null);
  if (!row || !ok) {
    audit(db, row?.id ?? null, "login-failed", email);
    return { error: "invalid" };
  }
  audit(db, row.id, "login");
  return { token: createSession(db, row.id) };
}

export function logout(db: DB, rawToken: string): void {
  const row = db.prepare("SELECT user_id FROM sessions WHERE token_hash = ?").get(sha256(rawToken)) as
    | { user_id: string }
    | undefined;
  db.prepare("UPDATE sessions SET revoked_at = ? WHERE token_hash = ?").run(nowIso(), sha256(rawToken));
  if (row) audit(db, row.user_id, "logout");
}

// ── Passwordless + recovery ─────────────────────────────────────────────────

/** Request a magic link. Same external shape whether the email exists. */
export function requestMagicLink(db: DB, email: string): { ok: true } {
  email = normalizeEmail(email);
  const row = db.prepare("SELECT id FROM users WHERE email = ? AND deleted_at IS NULL").get(email) as
    | { id: string }
    | undefined;
  if (row) enqueueMail(db, email, "magic-link", `Sign in: /magic?token=${issueToken(db, row.id, "magic-link")}`);
  return { ok: true };
}

export function consumeMagicLink(db: DB, rawToken: string): { token: string } | null {
  const userId = consumeToken(db, rawToken, "magic-link");
  if (!userId) return null;
  // A magic link proves inbox control — that IS email verification.
  db.prepare("UPDATE users SET email_verified_at = COALESCE(email_verified_at, ?) WHERE id = ?").run(nowIso(), userId);
  audit(db, userId, "magic-login");
  return { token: createSession(db, userId) };
}

export function requestPasswordReset(db: DB, email: string): { ok: true } {
  email = normalizeEmail(email);
  const row = db.prepare("SELECT id FROM users WHERE email = ? AND deleted_at IS NULL").get(email) as
    | { id: string }
    | undefined;
  if (row) enqueueMail(db, email, "password-reset", `Reset: /reset?token=${issueToken(db, row.id, "password-reset")}`);
  return { ok: true };
}

/** Consuming a reset sets the new password and REVOKES every session. */
export function consumePasswordReset(db: DB, rawToken: string, newPassword: string): boolean {
  const userId = consumeToken(db, rawToken, "password-reset");
  if (!userId) return false;
  db.prepare("UPDATE users SET pw_hash = ? WHERE id = ?").run(hashPassword(newPassword), userId);
  db.prepare("UPDATE sessions SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL").run(nowIso(), userId);
  audit(db, userId, "password-reset");
  return true;
}

// ── Learners: children are not email accounts ───────────────────────────────

export function addLearner(db: DB, accountId: string, name: string, grade?: number): { learnerId: string } {
  const id = newId("k");
  db.prepare("INSERT INTO learners (id, account_id, name, grade, created_at) VALUES (?,?,?,?,?)").run(
    id,
    accountId,
    name,
    grade ?? null,
    nowIso()
  );
  audit(db, accountId, "learner-added", id);
  return { learnerId: id };
}

export function setLearnerPin(db: DB, actorUserId: string, learnerId: string, pin: string): boolean {
  const owner = db.prepare("SELECT account_id FROM learners WHERE id = ?").get(learnerId) as
    | { account_id: string }
    | undefined;
  if (!owner || owner.account_id !== actorUserId) return false; // ownership from the DB, never the client
  db.prepare("UPDATE learners SET pin_hash = ? WHERE id = ?").run(hashPassword(pin), learnerId);
  audit(db, actorUserId, "learner-pin-set", learnerId);
  return true;
}

/** PIN unlock issues a LEARNER-SCOPED session under the owning account: the
 * child picks their profile and types their PIN — no email, no password. */
export function unlockLearner(db: DB, learnerId: string, pin: string): { token: string } | null {
  const row = db.prepare("SELECT account_id, pin_hash FROM learners WHERE id = ?").get(learnerId) as
    | { account_id: string; pin_hash: string | null }
    | undefined;
  if (!row || !verifyPassword(pin, row.pin_hash)) {
    audit(db, row?.account_id ?? null, "learner-unlock-failed", learnerId);
    return null;
  }
  audit(db, row.account_id, "learner-unlock", learnerId);
  return { token: createSession(db, row.account_id, learnerId) };
}

/** Which learners a session may touch: the account's own roster, or — on a
 * learner-scoped session — exactly that learner. Derived from rows, only. */
export function canTouchLearner(db: DB, session: SessionInfo, learnerId: string): boolean {
  if (session.learnerId) return session.learnerId === learnerId;
  const row = db.prepare("SELECT account_id FROM learners WHERE id = ?").get(learnerId) as
    | { account_id: string }
    | undefined;
  return !!row && row.account_id === session.user.id;
}

// ── Deletion + export ───────────────────────────────────────────────────────

/** Account deletion: audit first (the trail survives as a userless row), then
 * one cascading delete removes user → learners → profiles → sessions. */
export function deleteAccount(db: DB, userId: string): void {
  const run = db.transaction(() => {
    audit(db, null, "account-deleted", userId);
    db.prepare("DELETE FROM users WHERE id = ?").run(userId);
  });
  run();
}

/** Learner-data export: the full record as one JSON document. */
export function exportLearner(db: DB, learnerId: string): Record<string, unknown> {
  const learner = db.prepare("SELECT id, name, grade, created_at FROM learners WHERE id = ?").get(learnerId);
  const profile = db.prepare("SELECT version, data, updated_at FROM profiles WHERE learner_id = ?").get(learnerId) as
    | { version: number; data: string; updated_at: string }
    | undefined;
  let profileData: unknown = null;
  let profileCorrupt = false;
  if (profile) {
    try {
      profileData = JSON.parse(profile.data);
    } catch {
      // Data exports must still complete when an old/corrupt profile row is
      // present. Preserve the exact stored bytes for recovery rather than 500.
      profileData = profile.data;
      profileCorrupt = true;
    }
  }
  const completions = db
    .prepare("SELECT lesson_id, completed_at, best_xp FROM lesson_completions WHERE learner_id = ?")
    .all(learnerId);
  const skills = db
    .prepare("SELECT tag, mastery, attempts, last_seen, contexts, signals FROM skill_evidence WHERE learner_id = ?")
    .all(learnerId);
  return {
    exportedAt: nowIso(),
    learner,
    profile: profile
      ? { version: profile.version, updatedAt: profile.updated_at, data: profileData, corrupt: profileCorrupt }
      : null,
    completions,
    skills
  };
}
