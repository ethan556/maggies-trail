-- 006_messaging.sql — cross-role messaging between families, staff and learners.
--
-- Design notes, so the next reader does not have to infer intent:
--
--   · A PARTICIPANT IS NOT A USER. Learners are deliberately not rows in
--     `users` — they have no email and no password, only a PIN that mints a
--     scoped session (001_foundation). Every other table in this schema
--     respects that split, and messaging must too, or the first cross-role
--     feature quietly re-merges the two identity systems that authz.s46 and
--     syncClient spend their tests keeping apart. Hence
--     (principal_type, principal_id): 'user' rows point at users(id),
--     'learner' rows at learners(id). Two nullable FK columns give the
--     database real referential integrity on both, and a CHECK makes the
--     "exactly one subject" rule structural rather than conventional — the
--     same shape `enrollments` already uses for learner_id/user_id.
--
--   · VISIBILITY IS A ROW, NOT A ROLE COMPUTATION. You can read a thread iff
--     you have a participant row in it. No query anywhere says "…or the user
--     is an admin". A platform-admin who needs to see a conversation is
--     ADDED to it as a named participant, which means the family can see that
--     they are there. Silent invisible oversight of children's messages is a
--     capability this product declines to build; it is also why there is no
--     `is_hidden` column for anyone to set later.
--
--   · WHO MAY OPEN A THREAD WITH WHOM is not expressible in SQL — it depends
--     on rosters, guardianship and org staffing. It lives in
--     messagingService.ts and is enforced at thread creation, where it can be
--     tested directly. The schema's job is to make an unauthorised READ
--     impossible once that decision is made correctly.
--
--   · TEXT ONLY, NO ATTACHMENTS. An attachment would need its own retention,
--     export and deletion story on top of a child-safety surface. Bodies are
--     plain text bounded by the route's existing byte cap.
--
--   · DELETION follows the account rules: a deleted account's threads go with
--     it (CASCADE), while `audit` rows survive userless, exactly as
--     authService.s43 pins for account deletion.

PRAGMA foreign_keys = ON;

-- ── Threads ─────────────────────────────────────────────────────────────────
-- A thread is a subject line plus a participant set. `context_*` is optional
-- provenance ("this started from Ana's class") used for grouping in the UI; it
-- is NOT an authorisation input — losing a classroom must never widen access.
CREATE TABLE message_threads (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  context_classroom_id TEXT REFERENCES classrooms(id) ON DELETE SET NULL,
  context_learner_id TEXT REFERENCES learners(id) ON DELETE SET NULL,
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_by_learner_id TEXT REFERENCES learners(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  last_message_at TEXT NOT NULL
);
CREATE INDEX idx_threads_recent ON message_threads(last_message_at DESC);

-- ── Participants ────────────────────────────────────────────────────────────
-- The whole access-control surface. One row per principal per thread.
CREATE TABLE message_participants (
  thread_id TEXT NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  principal_type TEXT NOT NULL CHECK (principal_type IN ('user','learner')),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  learner_id TEXT REFERENCES learners(id) ON DELETE CASCADE,
  -- Why they are here, for the UI and for later audit. Not an authz input.
  participant_role TEXT NOT NULL
    CHECK (participant_role IN ('parent','teacher','school-admin','platform-admin','learner')),
  added_at TEXT NOT NULL,
  last_read_at TEXT,
  -- Exactly one subject, mirroring `enrollments`.
  CHECK (
    (principal_type = 'user'    AND user_id IS NOT NULL AND learner_id IS NULL) OR
    (principal_type = 'learner' AND learner_id IS NOT NULL AND user_id IS NULL)
  ),
  PRIMARY KEY (thread_id, principal_type, user_id, learner_id)
);
CREATE INDEX idx_participants_user ON message_participants(user_id);
CREATE INDEX idx_participants_learner ON message_participants(learner_id);

-- ── Messages ────────────────────────────────────────────────────────────────
-- The author columns repeat the participant shape rather than pointing at a
-- participant row, so a message keeps its true author even if that person is
-- later removed from the thread. Removing someone must not rewrite history.
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  author_type TEXT NOT NULL CHECK (author_type IN ('user','learner')),
  author_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  author_learner_id TEXT REFERENCES learners(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL,
  CHECK (
    (author_type = 'user'    AND author_user_id IS NOT NULL AND author_learner_id IS NULL) OR
    (author_type = 'learner' AND author_learner_id IS NOT NULL AND author_user_id IS NULL)
  )
);
CREATE INDEX idx_messages_thread ON messages(thread_id, created_at);

-- ── Issue reports ───────────────────────────────────────────────────────────
-- Backs the universal "report a problem" control. Deliberately minimal: the
-- route, a viewport class, the app version and the reporter's OWN words. No
-- screenshot and no DOM capture — a learner's screen holds their work and
-- their mistakes, and a bug report must not exfiltrate either.
-- Anonymous reports are allowed (both id columns NULL): a learner who cannot
-- sign in is exactly the person most in need of the button.
CREATE TABLE issue_reports (
  id TEXT PRIMARY KEY,
  reporter_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  reporter_learner_id TEXT REFERENCES learners(id) ON DELETE SET NULL,
  route TEXT NOT NULL,
  viewport TEXT,
  app_version TEXT,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','triaged','closed')),
  created_at TEXT NOT NULL
);
CREATE INDEX idx_issue_reports_status ON issue_reports(status, created_at DESC);
