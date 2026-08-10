// Consistent online snapshot: node scripts/db-backup.mjs [dest.db]
import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const src = process.env.MAGGIE_DB_PATH ?? join(process.cwd(), "data", "app.db");
// Default name carries the TIME, not just the date: VACUUM INTO refuses to
// overwrite, and a date-only default made every second backup of the day
// crash with a raw SqliteError (found by the s46 CLI smoke). An explicit dest
// that already exists is refused with a clear message — a named backup must
// never be silently replaced.
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const dest = process.argv[2] ?? join(process.cwd(), "data", `backup-${stamp}.db`);
if (existsSync(dest)) {
  console.error(`backup: refusing to overwrite existing ${dest} — choose a new destination`);
  process.exit(1);
}
mkdirSync(dirname(dest), { recursive: true });
const db = new Database(src, { readonly: false });
db.prepare("VACUUM INTO ?").run(dest);
console.log(`backup: ${src} → ${dest}`);
