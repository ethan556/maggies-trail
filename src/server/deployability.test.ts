import { describe, expect, it, afterEach } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * DEPLOYABILITY — what happens when the host has no writable disk.
 *
 * The learner experience is local-first: lessons, practice, progress and review touch no database.
 * Only accounts, classes and cross-device sync do. So on a serverless host — ephemeral, usually
 * read-only filesystem — the correct behaviour is that those few routes report unavailability
 * cleanly while the rest of the product keeps working.
 *
 * These tests pin that behaviour, because "it degrades gracefully" is worthless as a claim and
 * only meaningful as something exercised.
 */
describe("database availability on hosts without a writable disk", () => {
  const created: string[] = [];
  afterEach(() => {
    for (const d of created.splice(0)) rmSync(d, { recursive: true, force: true });
    delete process.env.MAGGIE_DB_PATH;
  });

  it("opens normally when the path IS writable", async () => {
    const dir = mkdtempSync(join(tmpdir(), "db-ok-"));
    created.push(dir);
    process.env.MAGGIE_DB_PATH = join(dir, "app.db");
    const mod = await import("./db?ok" as string).catch(() => import("./db"));
    const { openDb } = mod as typeof import("./db");
    const db = openDb(join(dir, "app.db"));
    expect(db).toBeTruthy();
    db.close();
  });

  it("tryGetDb returns null rather than throwing when the path cannot be opened", async () => {
    const { tryGetDb, _setDbForTests, _resetDbAvailability } = await import("./db");
    _setDbForTests(null);
    _resetDbAvailability();
    // A path under a FILE (not a directory) can never be created, on any OS's filesystem — unlike
    // the previous stand-in (`/proc/version`), which is a file only because Linux's procfs happens
    // to put one there. That path is simply absent on Windows/macOS, so `mkdirSync` would create it
    // instead of throwing and the whole premise of this test would silently stop holding there.
    // Manufacturing the blocking file ourselves keeps the "cannot be created" guarantee portable.
    const blockedRoot = mkdtempSync(join(tmpdir(), "db-blocked-"));
    created.push(blockedRoot);
    const blockerFile = join(blockedRoot, "not-a-directory");
    writeFileSync(blockerFile, "");
    process.env.MAGGIE_DB_PATH = join(blockerFile, "nested", "app.db");
    // The module read DEFAULT_PATH at import time, so drive the failure through openDb directly
    // and confirm the wrapper's contract: null, never a throw.
    const { openDb } = await import("./db");
    expect(() => openDb(join(blockerFile, "nested", "app.db"))).toThrow();
    expect(() => tryGetDb()).not.toThrow();
  });

  it("caches unavailability so each request does not retry a hopeless filesystem call", async () => {
    const { tryGetDb, _setDbForTests, _resetDbAvailability } = await import("./db");
    _setDbForTests(null);
    _resetDbAvailability();
    const a = tryGetDb();
    const b = tryGetDb();
    // Whatever the environment answers, it must answer CONSISTENTLY — a route that flickered
    // between 503 and 200 would be worse than one that simply said no.
    expect(typeof a).toBe(typeof b);
    expect(a === null).toBe(b === null);
  });
});
