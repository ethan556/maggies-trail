/**
 * DATABASE FOUNDATION (s43) — proven, not claimed:
 *  · migrations apply once, in order, and reruns are no-ops;
 *  · foreign keys actually cascade (delete a user → learners → profiles go);
 *  · unique constraints hold (duplicate email rejected);
 *  · BACKUP → WIPE → RESTORE brings every row back (the recovery test);
 *  · retention purges the operational tables and never touches learning data.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { backupTo, migrate, openDb, purgeExpired, restoreFrom, type DB } from "@/server/db";

let dir: string;
let db: DB;
const NOW = "2026-07-17T12:00:00.000Z";

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "maggie-db-"));
  db = openDb(join(dir, "test.db"));
  migrate(db);
});
afterEach(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

const addUser = (id: string, email: string) =>
  db.prepare("INSERT INTO users (id, email, created_at) VALUES (?, ?, ?)").run(id, email, NOW);

describe("migrations", () => {
  it("apply once and are idempotent on rerun", () => {
    expect(migrate(db)).toEqual([]); // beforeEach already applied everything
    const names = db.prepare("SELECT name FROM schema_migrations ORDER BY name").all() as Array<{ name: string }>;
    expect(names.map((n) => n.name)).toEqual(["001_foundation.sql", "002_outbox.sql", "003_scoped_idempotency.sql", "004_diagnostic_calibration.sql", "005_institutional.sql", "006_messaging.sql"]);
  });
});

describe("integrity", () => {
  it("cascades: deleting a user removes their learners, profiles, and sessions", () => {
    addUser("u1", "a@x.com");
    db.prepare("INSERT INTO learners (id, account_id, name, created_at) VALUES ('k1','u1','Ana',?)").run(NOW);
    db.prepare("INSERT INTO profiles (learner_id, version, data, updated_at) VALUES ('k1',1,'{}',?)").run(NOW);
    db.prepare("INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES ('t','u1',?,?)").run(NOW, NOW);
    db.prepare("DELETE FROM users WHERE id='u1'").run();
    expect(db.prepare("SELECT COUNT(*) c FROM learners").get()).toEqual({ c: 0 });
    expect(db.prepare("SELECT COUNT(*) c FROM profiles").get()).toEqual({ c: 0 });
    expect(db.prepare("SELECT COUNT(*) c FROM sessions").get()).toEqual({ c: 0 });
  });

  it("rejects duplicate emails at the schema, not just the application", () => {
    addUser("u1", "a@x.com");
    expect(() => addUser("u2", "a@x.com")).toThrow(/UNIQUE/);
  });
});

describe("backup and recovery", () => {
  it("backup → wipe → restore brings every row back", () => {
    addUser("u1", "a@x.com");
    db.prepare("INSERT INTO learners (id, account_id, name, created_at) VALUES ('k1','u1','Ana',?)").run(NOW);
    db.prepare("INSERT INTO profiles (learner_id, version, data, updated_at) VALUES ('k1',3,'{\"xp\":42}',?)").run(NOW);

    const snap = join(dir, "backup.db");
    backupTo(db, snap);

    // Disaster: everything wiped after the backup.
    db.prepare("DELETE FROM profiles").run();
    db.prepare("DELETE FROM learners").run();
    db.prepare("DELETE FROM users").run();
    expect(db.prepare("SELECT COUNT(*) c FROM users").get()).toEqual({ c: 0 });
    db.close();

    const restored = restoreFrom(snap, join(dir, "test.db"));
    expect(restored.prepare("SELECT email FROM users WHERE id='u1'").get()).toEqual({ email: "a@x.com" });
    expect(restored.prepare("SELECT version, data FROM profiles WHERE learner_id='k1'").get()).toEqual({
      version: 3,
      data: '{"xp":42}'
    });
    restored.close();
    db = openDb(join(dir, "test.db")); // hand afterEach a live handle
  });
});

describe("retention", () => {
  it("purges expired operational rows and never touches learning data", () => {
    addUser("u1", "a@x.com");
    db.prepare("INSERT INTO learners (id, account_id, name, created_at) VALUES ('k1','u1','Ana',?)").run(NOW);
    db.prepare("INSERT INTO profiles (learner_id, version, data, updated_at) VALUES ('k1',1,'{}',?)").run(NOW);
    db.prepare("INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES ('old','u1',?, '2026-01-01T00:00:00.000Z')").run(NOW);
    db.prepare("INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES ('live','u1',?, '2027-01-01T00:00:00.000Z')").run(NOW);
    db.prepare("INSERT INTO tokens (token_hash, user_id, purpose, created_at, expires_at, used_at) VALUES ('used','u1','verify-email',?,?,?)").run(NOW, "2027-01-01T00:00:00.000Z", NOW);
    db.prepare("INSERT INTO idempotency_keys (scope, key, response, created_at) VALUES ('test','stale','{}','2026-07-01T00:00:00.000Z')").run();

    const counts = purgeExpired(db, NOW);
    expect(counts.sessions).toBe(1);
    expect(counts.tokens).toBe(1);
    expect(counts.idempotency).toBe(1);
    expect(db.prepare("SELECT COUNT(*) c FROM sessions").get()).toEqual({ c: 1 });
    // The learning record is untouchable by retention.
    expect(db.prepare("SELECT COUNT(*) c FROM profiles").get()).toEqual({ c: 1 });
  });
});
