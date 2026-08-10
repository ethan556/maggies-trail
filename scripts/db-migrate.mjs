// Apply pending migrations to the live database (MAGGIE_DB_PATH or data/app.db).
// Standalone on purpose: no TS import chain, just better-sqlite3 + the SQL files.
import Database from "better-sqlite3";
import { readdirSync, readFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const path = process.env.MAGGIE_DB_PATH ?? join(process.cwd(), "data", "app.db");
mkdirSync(dirname(path), { recursive: true });
const db = new Database(path);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec("CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)");
const done = new Set(db.prepare("SELECT name FROM schema_migrations").all().map((r) => r.name));
const dir = join(process.cwd(), "db", "migrations");
let applied = 0;
for (const f of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
  if (done.has(f)) continue;
  const run = db.transaction(() => {
    db.exec(readFileSync(join(dir, f), "utf8"));
    db.prepare("INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)").run(f, new Date().toISOString());
  });
  run();
  console.log("applied:", f);
  applied++;
}
console.log(applied ? `migrate: ${applied} applied → ${path}` : `migrate: up to date → ${path}`);
