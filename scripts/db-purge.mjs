// Retention pass: expired sessions/tokens, stale idempotency keys and rate
// windows, audit rows past 400 days. Learning data is structurally out of reach.
import Database from "better-sqlite3";
import { join } from "node:path";

const path = process.env.MAGGIE_DB_PATH ?? join(process.cwd(), "data", "app.db");
const db = new Database(path);
const nowIso = new Date().toISOString();
const day = 86400000;
const cutoff = (d) => new Date(Date.parse(nowIso) - d * day).toISOString();
const counts = {
  sessions: db.prepare("DELETE FROM sessions WHERE expires_at < ? OR revoked_at IS NOT NULL").run(nowIso).changes,
  tokens: db.prepare("DELETE FROM tokens WHERE expires_at < ? OR used_at IS NOT NULL").run(nowIso).changes,
  idempotency: db.prepare("DELETE FROM idempotency_keys WHERE created_at < ?").run(cutoff(7)).changes,
  rateLimits: db.prepare("DELETE FROM rate_limits WHERE window_start < ?").run(cutoff(1)).changes,
  audit: db.prepare("DELETE FROM audit_log WHERE at < ?").run(cutoff(400)).changes
};
console.log("purge:", JSON.stringify(counts), "→", path);
