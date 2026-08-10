-- 001_foundation.sql — the durable data model (SQLite, WAL).
--
-- Design stance:
--   · IDENTITY & RELATIONSHIPS are fully normalized rows: users, sessions,
--     tokens, learners, classrooms, memberships, schools, subscriptions —
--     everything permissions and queries hang off.
--   · THE LEARNING RECORD syncs as a versioned semantic document per learner
--     (profiles.data): the client is local-first and the server's job is the
--     SEMANTIC MERGE, so the document is the unit of conflict resolution.
--     Optimistic concurrency lives on profiles.version.
--   · PROJECTIONS (lesson_completions, skill_evidence) are normalized,
--     indexed tables the server maintains transactionally from each accepted
--     merge — teacher/school queries never parse JSON.
--   · Every sensitive action lands in audit_log; idempotency_keys makes
--     retried writes safe; rate_limits backs the limiter durably.

PRAGMA foreign_keys = ON;

-- ── Identity ────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  email_verified_at TEXT,
  pw_hash TEXT,                       -- NULL until a password is set (passwordless-only accounts)
  role TEXT NOT NULL DEFAULT 'parent' -- parent | teacher | school-admin | platform-admin
    CHECK (role IN ('parent','teacher','school-admin','platform-admin')),
  created_at TEXT NOT NULL,
  deleted_at TEXT                     -- soft-delete marker; hard purge via retention script
);

CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,        -- sha256 of the opaque cookie token; raw token never stored
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  learner_id TEXT,                    -- set on learner-scoped sessions (PIN unlock)
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT
);
CREATE INDEX idx_sessions_user ON sessions(user_id);

CREATE TABLE tokens (                  -- one table, three single-use purposes
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL CHECK (purpose IN ('verify-email','magic-link','password-reset')),
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT
);
CREATE INDEX idx_tokens_user ON tokens(user_id, purpose);

-- ── Family / learners ───────────────────────────────────────────────────────
CREATE TABLE learners (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- family membership
  name TEXT NOT NULL,
  grade INTEGER,
  pin_hash TEXT,                      -- child unlock; NULL = open profile selection
  created_at TEXT NOT NULL
);
CREATE INDEX idx_learners_account ON learners(account_id);

-- ── Classrooms / schools ────────────────────────────────────────────────────
CREATE TABLE classrooms (
  id TEXT PRIMARY KEY,
  teacher_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  join_code TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_classrooms_teacher ON classrooms(teacher_user_id);

CREATE TABLE classroom_members (
  classroom_id TEXT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  joined_at TEXT NOT NULL,
  PRIMARY KEY (classroom_id, learner_id)
);

CREATE TABLE schools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE school_teachers (
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (school_id, user_id)
);
CREATE TABLE school_admins (
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (school_id, user_id)
);

-- ── Entitlement (server-authoritative) ──────────────────────────────────────
CREATE TABLE subscriptions (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,                 -- monthly | annual | family
  status TEXT NOT NULL,               -- active | past_due | canceled
  current_period_end TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- ── The learning record ─────────────────────────────────────────────────────
CREATE TABLE profiles (
  learner_id TEXT PRIMARY KEY REFERENCES learners(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 0, -- optimistic concurrency; bumped per accepted merge
  data TEXT NOT NULL,                 -- the semantic Profile document (JSON)
  updated_at TEXT NOT NULL            -- server receipt time; client clocks never set this
);

-- Projections: maintained transactionally from each accepted merge.
CREATE TABLE lesson_completions (
  learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  completed_at TEXT,                  -- the learner's local FIRST-completion date
  best_xp INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (learner_id, lesson_id)
);
CREATE INDEX idx_completions_lesson ON lesson_completions(lesson_id);

CREATE TABLE skill_evidence (
  learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  mastery REAL NOT NULL,
  attempts INTEGER NOT NULL,
  last_seen TEXT,
  contexts INTEGER NOT NULL DEFAULT 0,   -- distinct unaided lesson contexts
  signals TEXT NOT NULL DEFAULT '{}',    -- misconception ledger (JSON, small)
  PRIMARY KEY (learner_id, tag)
);
CREATE INDEX idx_skill_tag ON skill_evidence(tag);

-- ── Operational ─────────────────────────────────────────────────────────────
CREATE TABLE idempotency_keys (
  key TEXT PRIMARY KEY,
  response TEXT NOT NULL,             -- the exact response body served the first time
  created_at TEXT NOT NULL
);

CREATE TABLE rate_limits (
  bucket TEXT NOT NULL,               -- e.g. "login:1.2.3.4" or "signup:email@x"
  window_start TEXT NOT NULL,
  count INTEGER NOT NULL,
  PRIMARY KEY (bucket, window_start)
);

CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at TEXT NOT NULL,
  user_id TEXT,
  action TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT ''
);
CREATE INDEX idx_audit_user ON audit_log(user_id, at);

CREATE TABLE content_versions (
  version TEXT PRIMARY KEY,           -- the manifest contentVersion hash
  applied_at TEXT NOT NULL
);
