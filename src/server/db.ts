/**
 * THE DATABASE — durable, transactional, file-backed SQLite (WAL).
 *
 * This replaces the documented in-memory demonstration backend. It is a real
 * database: survives process restarts and redeploys of the same host, ships
 * with versioned migrations, an online backup, a restore path, and a
 * retention purge — each exercised by tests, not just claimed.
 *
 * Why SQLite, said plainly: it is the honest production choice for a
 * single-node deployment — genuinely durable and transactional with zero
 * external moving parts this environment could only pretend to have. The
 * entire data layer speaks plain SQL through this one module, so pointing it
 * at Postgres later is a driver swap, not a redesign. What SQLite does NOT
 * give is multi-node scale; that limit is stated here rather than papered
 * over.
 *
 * Connection discipline: one process-wide handle, WAL for concurrent reads,
 * foreign keys ON, busy timeout so writers queue instead of erroring.
 */

import Database from "better-sqlite3";
import { existsSync, mkdirSync, readdirSync, readFileSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";

export type DB = Database.Database;

const DEFAULT_PATH = process.env.MAGGIE_DB_PATH ?? join(process.cwd(), "data", "app.db");
const MIGRATIONS_DIR = join(process.cwd(), "db", "migrations");

let handle: DB | null = null;

export function openDb(path = DEFAULT_PATH): DB {
  mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  return db;
}

/** The process-wide handle, migrated on first touch. */
export function getDb(): DB {
  if (!handle) {
    handle = openDb();
    migrate(handle);
  }
  return handle;
}

/** Why this exists: SQLite is file-backed, and some hosts have no writable disk.
 *
 * On a single-node host with a volume, `getDb()` succeeds and everything works. On a serverless
 * platform the filesystem is ephemeral and usually read-only, so `openDb()` throws — and a route
 * that calls `getDb()` at request time would return a 500 that reads to a user like "the product
 * is broken" rather than "accounts need a database".
 *
 * That distinction matters because the learner experience here is local-first: lessons, practice,
 * progress, XP and review all run client-side and touch no database at all. Only accounts,
 * classes and cross-device sync do. So the correct behaviour when there is no disk is for those
 * few routes to say so cleanly and for everything else to keep working.
 *
 * Returns null instead of throwing. Failures are cached briefly, not forever:
 * a transient lock/mount problem can recover without a process restart, while
 * a genuinely read-only host is not hammered on every request.
 */
const DB_RETRY_MS = 30_000;
let dbUnavailableUntil = 0;
export function tryGetDb(): DB | null {
  if (Date.now() < dbUnavailableUntil) return null;
  try {
    const db = getDb();
    dbUnavailableUntil = 0;
    return db;
  } catch {
    dbUnavailableUntil = Date.now() + DB_RETRY_MS;
    return null;
  }
}

/** True when a durable database is reachable. Lets a route distinguish "no rows" from "no disk". */
export function dbAvailable(): boolean {
  return tryGetDb() !== null;
}

/** Test seam: clear the cached unavailability flag alongside the handle. */
export function _resetDbAvailability(): void {
  dbUnavailableUntil = 0;
}

/** Test seam: point the module at a scratch database. */
export function _setDbForTests(db: DB | null): void {
  handle = db;
}

// ── Migrations ──────────────────────────────────────────────────────────────

/** Apply every db/migrations/*.sql not yet recorded, in filename order, each
 * inside its own transaction. Idempotent: reruns are no-ops. */
export function migrate(db: DB, dir = MIGRATIONS_DIR): string[] {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name TEXT PRIMARY KEY, applied_at TEXT NOT NULL
  )`);
  const done = new Set<string>(
    (db.prepare("SELECT name FROM schema_migrations").all() as Array<{ name: string }>).map((r) => r.name)
  );
  const applied: string[] = [];
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".sql")).sort() : [];
  for (const f of files) {
    if (done.has(f)) continue;
    const sql = readFileSync(join(dir, f), "utf8");
    const run = db.transaction(() => {
      db.exec(sql);
      db.prepare("INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)").run(f, new Date().toISOString());
    });
    run();
    applied.push(f);
  }
  return applied;
}

// ── Backup & restore ────────────────────────────────────────────────────────

/** Online backup to a destination file (SQLite's VACUUM INTO — a consistent
 * snapshot without stopping writers). */
export function backupTo(db: DB, destPath: string): void {
  mkdirSync(dirname(destPath), { recursive: true });
  db.prepare("VACUUM INTO ?").run(destPath);
}

/** Restore = copy the snapshot over the live path and reopen. The recovery
 * test proves a post-backup wipe comes back byte-for-row identical. */
export function restoreFrom(snapshotPath: string, livePath: string): DB {
  copyFileSync(snapshotPath, livePath);
  return openDb(livePath);
}

// ── Retention ───────────────────────────────────────────────────────────────

/** Data-retention purge, run on a schedule: expired sessions and single-use
 * tokens, idempotency keys older than 7 days, rate-limit windows older than a
 * day, audit entries past `auditDays` (default 400 — a year plus margin).
 * Learner data is NEVER touched here; deletion of learning records happens
 * only through explicit account deletion. */
export function purgeExpired(db: DB, nowIso = new Date().toISOString(), auditDays = 400): Record<string, number> {
  const day = 86400000;
  const cutoff = (days: number) => new Date(Date.parse(nowIso) - days * day).toISOString();
  const counts: Record<string, number> = {};
  counts.sessions = db.prepare("DELETE FROM sessions WHERE expires_at < ? OR revoked_at IS NOT NULL").run(nowIso).changes;
  counts.tokens = db.prepare("DELETE FROM tokens WHERE expires_at < ? OR used_at IS NOT NULL").run(nowIso).changes;
  counts.idempotency = db.prepare("DELETE FROM idempotency_keys WHERE created_at < ?").run(cutoff(7)).changes;
  counts.rateLimits = db.prepare("DELETE FROM rate_limits WHERE window_start < ?").run(cutoff(1)).changes;
  counts.audit = db.prepare("DELETE FROM audit_log WHERE at < ?").run(cutoff(auditDays)).changes;
  // s113: LTI replay guards live only as long as a token could — expired rows
  // are dead weight; delivered LMS outbox rows keep a week for inspection.
  counts.ltiNonces = db.prepare("DELETE FROM lti_nonces WHERE expires_at < ?").run(nowIso).changes;
  counts.lmsOutbox = db
    .prepare("DELETE FROM lms_outbox WHERE delivered_at IS NOT NULL AND delivered_at < ?")
    .run(cutoff(7)).changes;
  return counts;
}
