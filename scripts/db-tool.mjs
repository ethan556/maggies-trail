#!/usr/bin/env node
/**
 * Operator CLI for the durable database.
 *   node scripts/db-tool.mjs migrate            apply pending db/migrations/*.sql
 *   node scripts/db-tool.mjs backup <dest.db>   consistent online snapshot (VACUUM INTO)
 *   node scripts/db-tool.mjs purge              retention pass (expired sessions/tokens/etc)
 * Mirrors src/server/db.ts (the tested implementation); kept dependency-light
 * so it runs before the app ever boots.
 */
import Database from "better-sqlite3";
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const DB_PATH = process.env.MAGGIE_DB_PATH ?? join(process.cwd(), "data", "app.db");
const MIG_DIR = join(process.cwd(), "db", "migrations");
const [cmd, arg] = process.argv.slice(2);

mkdirSync(dirname(DB_PATH), { recursive: true });
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

if (cmd === "migrate") {
  db.exec("CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)");
  const done = new Set(db.prepare("SELECT name FROM schema_migrations").all().map((r) => r.name));
  const files = existsSync(MIG_DIR) ? readdirSync(MIG_DIR).filter((f) => f.endsWith(".sql")).sort() : [];
  let n = 0;
  for (const f of files) {
    if (done.has(f)) continue;
    db.transaction(() => {
      db.exec(readFileSync(join(MIG_DIR, f), "utf8"));
      db.prepare("INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)").run(f, new Date().toISOString());
    })();
    console.log("applied", f);
    n++;
  }
  console.log(n === 0 ? "db up to date" : `db: ${n} migration(s) applied`);
} else if (cmd === "backup") {
  if (!arg) { console.error("usage: db-tool.mjs backup <dest.db>"); process.exit(1); }
  mkdirSync(dirname(arg), { recursive: true });
  db.prepare("VACUUM INTO ?").run(arg);
  console.log("backup written:", arg);
} else if (cmd === "purge") {
  const now = new Date().toISOString();
  const day = 86400000;
  const cut = (d) => new Date(Date.now() - d * day).toISOString();
  console.log("sessions:", db.prepare("DELETE FROM sessions WHERE expires_at < ? OR revoked_at IS NOT NULL").run(now).changes);
  console.log("tokens:", db.prepare("DELETE FROM tokens WHERE expires_at < ? OR used_at IS NOT NULL").run(now).changes);
  console.log("idempotency:", db.prepare("DELETE FROM idempotency_keys WHERE created_at < ?").run(cut(7)).changes);
  console.log("rate windows:", db.prepare("DELETE FROM rate_limits WHERE window_start < ?").run(cut(1)).changes);
} else {
  console.error("usage: db-tool.mjs migrate | backup <dest.db> | purge");
  process.exit(1);
}
db.close();
