-- 003_scoped_idempotency.sql — prevent one account from replaying another
-- account's cached sync response when callers reuse the same idempotency key.
ALTER TABLE idempotency_keys RENAME TO idempotency_keys_legacy;

CREATE TABLE idempotency_keys (
  scope TEXT NOT NULL,
  key TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (scope, key)
);

-- Existing rows are transient retry caches; preserve them in an unreachable
-- legacy scope until the normal seven-day retention purge removes them.
INSERT INTO idempotency_keys (scope, key, response, created_at)
SELECT 'legacy', key, response, created_at FROM idempotency_keys_legacy;
DROP TABLE idempotency_keys_legacy;
