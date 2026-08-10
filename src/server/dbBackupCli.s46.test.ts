/**
 * REGRESSION s46 (D6): `db:backup` must survive a second run on the same day.
 *
 * Found by the CLI smoke: the default destination was date-granular and
 * VACUUM INTO refuses to overwrite, so every second backup of a day crashed
 * with a raw SqliteError stack. The fix gives the default a time-stamped name
 * and refuses an EXPLICIT existing destination with a clear one-line error —
 * a named backup is never silently replaced, and nothing crashes.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Database from "better-sqlite3";

const SCRIPT = join(process.cwd(), "scripts", "db-backup.mjs");
let dir: string;

const run = (args: string[], cwd = dir) =>
  spawnSync(process.execPath, [SCRIPT, ...args], {
    cwd,
    env: { ...process.env, MAGGIE_DB_PATH: join(dir, "app.db") },
    encoding: "utf8"
  });

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "maggie-backup-"));
  new Database(join(dir, "app.db")).close(); // a real (empty) sqlite file
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

describe("db-backup CLI", () => {
  it("an explicit destination backs up once, then refuses cleanly — no crash", () => {
    const dest = join(dir, "named.db");
    const first = run([dest]);
    expect(first.status).toBe(0);
    expect(first.stdout).toContain("backup:");
    expect(existsSync(dest)).toBe(true);

    const second = run([dest]);
    expect(second.status).toBe(1); // refused, not crashed
    expect(second.stderr).toContain("refusing to overwrite");
    expect(second.stderr).not.toContain("SqliteError"); // the old failure mode
  });

  it("the default destination is time-stamped, so a same-day rerun gets a fresh name", () => {
    const first = run([]);
    expect(first.status).toBe(0);
    const names = readdirSync(join(dir, "data"));
    expect(names).toHaveLength(1);
    // date-only names collide within a day; the stamp must carry the time
    expect(names[0]).toMatch(/^backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.db$/);
  });
});
