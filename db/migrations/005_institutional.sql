-- 005_institutional.sql — rostering, assignments, and institutional reporting.
--
-- Design notes, so the next reader does not have to infer intent:
--
--   · ADDITIVE ONLY. `classrooms` and `classroom_members` keep working exactly
--     as they did; the join-code classroom loop is untouched. `enrollments` is
--     the richer table institutional rostering needs (role, status, dates,
--     SIS identity) and is backfilled from `classroom_members` below, so a
--     deployment that has been running the teacher flow does not start empty.
--
--   · SIS IDENTITY IS A SEPARATE COLUMN, NEVER THE PRIMARY KEY. A district can
--     re-key its export (they do) without orphaning our rows, and two districts
--     can both use sourcedId "12345" without colliding, because external ids
--     are unique per (org, entity), not globally.
--
--   · ASSIGNMENTS LIVE ON THE SERVER NOW. The device-local teach store stays as
--     the offline path, but an assignment a district can report on has to
--     survive the teacher's laptop being replaced.
--
--   · `assignment_status` IS A CACHE, NOT A SOURCE OF TRUTH. It is recomputed
--     from lesson_completions; it exists so a 40-class report is one indexed
--     scan rather than 40,000 JSON parses. Anything that writes it must be
--     able to rebuild it from scratch.

PRAGMA foreign_keys = ON;

-- ── Organisational hierarchy ────────────────────────────────────────────────
-- Districts and schools are the same shape at different depths, so one table
-- with a self-reference beats two tables and a union view.
CREATE TABLE orgs (
  id TEXT PRIMARY KEY,
  parent_org_id TEXT REFERENCES orgs(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('district','school')),
  name TEXT NOT NULL,
  external_id TEXT,                   -- OneRoster sourcedId
  external_source TEXT,               -- 'oneroster' | 'manual' | vendor name
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','retired')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_orgs_parent ON orgs(parent_org_id);
CREATE UNIQUE INDEX idx_orgs_external ON orgs(external_source, external_id)
  WHERE external_id IS NOT NULL;

-- Staff membership in an org, with the privilege it carries. Distinct from
-- `school_teachers`/`school_admins`, which remain for the existing school
-- aggregate path; this table is what institutional rostering writes.
CREATE TABLE org_staff (
  org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('teacher','administrator','aide')),
  external_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','retired')),
  created_at TEXT NOT NULL,
  PRIMARY KEY (org_id, user_id, role)
);
CREATE INDEX idx_org_staff_user ON org_staff(user_id);

-- ── Academic sessions ───────────────────────────────────────────────────────
CREATE TABLE academic_terms (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'term' CHECK (type IN ('gradingPeriod','semester','schoolYear','term')),
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  school_year TEXT,
  external_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','retired')),
  created_at TEXT NOT NULL
);
CREATE INDEX idx_terms_org ON academic_terms(org_id, start_date);

-- ── Classrooms gain institutional context ───────────────────────────────────
-- ALTER ... ADD COLUMN is the safe SQLite change: existing rows keep working
-- with NULLs, which read as "device-local classroom, not district-rostered".
ALTER TABLE classrooms ADD COLUMN org_id TEXT REFERENCES orgs(id) ON DELETE SET NULL;
ALTER TABLE classrooms ADD COLUMN term_id TEXT REFERENCES academic_terms(id) ON DELETE SET NULL;
ALTER TABLE classrooms ADD COLUMN external_id TEXT;
ALTER TABLE classrooms ADD COLUMN external_source TEXT;
ALTER TABLE classrooms ADD COLUMN subject TEXT;
ALTER TABLE classrooms ADD COLUMN period TEXT;
ALTER TABLE classrooms ADD COLUMN grade TEXT;
ALTER TABLE classrooms ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
CREATE INDEX idx_classrooms_org ON classrooms(org_id);
CREATE UNIQUE INDEX idx_classrooms_external ON classrooms(external_source, external_id)
  WHERE external_id IS NOT NULL;

-- Learners gain SIS identity too, so a re-import matches instead of duplicating.
ALTER TABLE learners ADD COLUMN external_id TEXT;
ALTER TABLE learners ADD COLUMN external_source TEXT;
CREATE UNIQUE INDEX idx_learners_external ON learners(external_source, external_id)
  WHERE external_id IS NOT NULL;

-- ── Enrollment lifecycle ────────────────────────────────────────────────────
-- The thing `classroom_members` cannot express: a learner who DROPPED. Their
-- prior work must stay attributable to the class for reporting, so exits are
-- recorded, never deleted.
CREATE TABLE enrollments (
  id TEXT PRIMARY KEY,
  classroom_id TEXT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  learner_id TEXT REFERENCES learners(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('student','teacher')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','dropped')),
  is_primary INTEGER NOT NULL DEFAULT 0,
  begin_date TEXT,
  end_date TEXT,
  external_id TEXT,
  external_source TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  -- Exactly one subject: a student enrollment names a learner, a teacher
  -- enrollment names a user. Enforced here rather than in application code.
  CHECK ((role = 'student' AND learner_id IS NOT NULL AND user_id IS NULL)
      OR (role = 'teacher' AND user_id IS NOT NULL AND learner_id IS NULL))
);
CREATE UNIQUE INDEX idx_enrollments_student ON enrollments(classroom_id, learner_id, role)
  WHERE learner_id IS NOT NULL;
CREATE UNIQUE INDEX idx_enrollments_teacher ON enrollments(classroom_id, user_id, role)
  WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX idx_enrollments_external ON enrollments(external_source, external_id)
  WHERE external_id IS NOT NULL;
CREATE INDEX idx_enrollments_class ON enrollments(classroom_id, status);
CREATE INDEX idx_enrollments_learner ON enrollments(learner_id);

-- Backfill: every existing join-code membership becomes an active student
-- enrollment, so institutional views are correct on day one of this migration.
INSERT INTO enrollments (id, classroom_id, learner_id, user_id, role, status, is_primary,
                         begin_date, end_date, external_id, external_source, created_at, updated_at)
SELECT
  'e_bf_' || substr(hex(randomblob(6)), 1, 12),
  m.classroom_id, m.learner_id, NULL, 'student', 'active', 0,
  substr(m.joined_at, 1, 10), NULL, NULL, NULL, m.joined_at, m.joined_at
FROM classroom_members m;

-- ...and every class owner becomes its teacher enrollment.
INSERT INTO enrollments (id, classroom_id, learner_id, user_id, role, status, is_primary,
                         begin_date, end_date, external_id, external_source, created_at, updated_at)
SELECT
  'e_bt_' || substr(hex(randomblob(6)), 1, 12),
  c.id, NULL, c.teacher_user_id, 'teacher', 'active', 1,
  substr(c.created_at, 1, 10), NULL, NULL, NULL, c.created_at, c.created_at
FROM classrooms c;

-- ── Assignments ─────────────────────────────────────────────────────────────
CREATE TABLE assignments (
  id TEXT PRIMARY KEY,
  classroom_id TEXT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('lesson','course','domain','review','diagnostic','challenge')),
  ref_id TEXT NOT NULL,               -- lesson id, course id, "grade:category", or a queue ref
  title TEXT NOT NULL,
  instructions TEXT NOT NULL DEFAULT '',
  due_date TEXT,                      -- local calendar date; NULL = no deadline
  points INTEGER,                     -- for LMS grade passback; NULL = ungraded
  -- Draft until published: a teacher building next week's work should not
  -- appear on a learner's screen or in a district completion figure.
  published_at TEXT,
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  archived_at TEXT,
  external_id TEXT,                   -- LTI resource_link_id when launched from an LMS
  external_source TEXT
);
CREATE INDEX idx_assignments_class ON assignments(classroom_id, due_date);
CREATE UNIQUE INDEX idx_assignments_external ON assignments(external_source, external_id)
  WHERE external_id IS NOT NULL;

-- Cache of per-learner assignment state. Rebuildable from lesson_completions.
CREATE TABLE assignment_status (
  assignment_id TEXT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('not-started','in-progress','on-time','late')),
  completed_lessons INTEGER NOT NULL DEFAULT 0,
  total_lessons INTEGER NOT NULL DEFAULT 0,
  finished_at TEXT,
  score REAL,
  computed_at TEXT NOT NULL,
  PRIMARY KEY (assignment_id, learner_id)
);
CREATE INDEX idx_assignment_status_learner ON assignment_status(learner_id);

-- ── Roster import audit ─────────────────────────────────────────────────────
-- Every import, dry run included, leaves a row. When a registrar asks "what
-- happened to Room 14 last Tuesday", this is the answer.
CREATE TABLE roster_imports (
  id TEXT PRIMARY KEY,
  org_id TEXT REFERENCES orgs(id) ON DELETE SET NULL,
  actor_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  source TEXT NOT NULL,               -- 'oneroster-csv' | 'manual-csv'
  dry_run INTEGER NOT NULL DEFAULT 1,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  outcome TEXT NOT NULL DEFAULT 'pending' CHECK (outcome IN ('pending','applied','rejected','failed')),
  plan TEXT NOT NULL DEFAULT '{}',    -- the ImportPlan counts (JSON)
  diagnostics TEXT NOT NULL DEFAULT '[]' -- bounded, worst-first (JSON)
);
CREATE INDEX idx_roster_imports_org ON roster_imports(org_id, started_at);

-- ── LMS interoperability ────────────────────────────────────────────────────
-- Registered LTI 1.3 platforms. Keys are stored as a static JWKS document
-- because this deployment does not make outbound calls; see KNOWN_ISSUES.
CREATE TABLE lti_platforms (
  id TEXT PRIMARY KEY,
  org_id TEXT REFERENCES orgs(id) ON DELETE CASCADE,
  issuer TEXT NOT NULL,
  client_id TEXT NOT NULL,
  deployment_id TEXT NOT NULL,
  -- The platform's OIDC authorization endpoint: third-party-initiated login
  -- must redirect the browser THERE, so a registration without it can accept
  -- launches but never initiate one.
  auth_login_url TEXT NOT NULL DEFAULT '',
  jwks TEXT NOT NULL DEFAULT '{"keys":[]}',
  audience TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (issuer, client_id, deployment_id)
);

-- Replay defence: an id_token's jti may be presented exactly once.
CREATE TABLE lti_nonces (
  jti TEXT PRIMARY KEY,
  issuer TEXT NOT NULL,
  seen_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE INDEX idx_lti_nonces_expiry ON lti_nonces(expires_at);

-- Outbound integration work (grade passback, roster acknowledgements) queued
-- for a delivery worker. Mirrors the existing mail_outbox pattern — including
-- its honesty: nothing drains this yet.
CREATE TABLE lms_outbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,                 -- 'ags-score' | 'roster-ack'
  target TEXT NOT NULL,               -- line item URL or platform id
  payload TEXT NOT NULL,              -- JSON body
  created_at TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  delivered_at TEXT,
  last_error TEXT
);
CREATE INDEX idx_lms_outbox_pending ON lms_outbox(delivered_at, created_at);

-- ── Intervention cases ──────────────────────────────────────────────────────
-- The tier computation (src/lib/institution/intervention.ts) is pure and
-- recomputed from evidence; a CASE is the human decision layered on top —
-- "we saw this, we are doing something about it" — and that must persist,
-- carry its author, and survive the evidence changing under it.
CREATE TABLE interventions (
  id TEXT PRIMARY KEY,
  learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  classroom_id TEXT REFERENCES classrooms(id) ON DELETE SET NULL,
  opened_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  -- The focus skills at opening time (JSON array of conceptTags): a snapshot,
  -- deliberately — the case records what was seen, not a live query.
  concept_tags TEXT NOT NULL DEFAULT '[]',
  tier INTEGER NOT NULL DEFAULT 2 CHECK (tier IN (1,2,3)),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','monitoring','resolved')),
  opened_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  resolved_at TEXT
);
CREATE INDEX idx_interventions_learner ON interventions(learner_id, status);
CREATE INDEX idx_interventions_class ON interventions(classroom_id, status);

CREATE TABLE intervention_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  intervention_id TEXT NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
  at TEXT NOT NULL,
  author_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL
);
CREATE INDEX idx_intervention_notes ON intervention_notes(intervention_id, at);
