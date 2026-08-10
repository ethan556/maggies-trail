# S205 — Priority 6 audit: admin / district / parent / teacher surfaces, isolation, bug-report, messaging

An implementation-readiness audit, written from the source rather than from memory. Verdict up
front: **most of Priority 6 already exists and is tested**; the two genuinely missing pieces —
cross-role messaging and a universal bug-report affordance — are **server-backed features whose
test layer cannot run in this sandbox** (`better-sqlite3` bindings are absent, which is why all 17
DB-layer test files fail here as a documented baseline). Shipping untested auth-adjacent messaging
would violate the project's own QA floor, so this session delivers the audit, the schema, and the
build plan — not unverifiable code.

---

## 1. What already exists (verified in source, with its tests named)

| requirement | status | where |
|---|---|---|
| **Role model** | ✅ built | `users.role` CHECK set: `parent \| teacher \| school-admin \| platform-admin` (`db/migrations/001_foundation.sql`, extended in `005_institutional.sql`); district admin is institutional membership, not a new role (`src/server/institutionService.ts:9-18`) |
| **Student isolation** | ✅ built, tested | Learners are NOT email accounts. PIN unlock issues a **learner-scoped session** that cannot delete the account or read other learners (`src/server/authService.ts`; pinned by `authService.s43.test.ts` "learners: children are not email accounts", `authz.s46.test.ts` "a learner-scoped session cannot delete the account", `syncClient.test.ts` "one child's progress never leaks into another") |
| **Admin sees everyone** | ✅ built, tested | `platform-admin` walks district → school → staff; outsiders refused (`institutionService.ts`; `institution.s113.test.ts` "walks district → school → staff and refuses outsiders") |
| **District pages** | ✅ built | `/api/institution/*`, insight roll-ups (`insight.s113.test.ts`), roster sync (`rosterService.ts`) |
| **Teacher pages** | ✅ built | `(shell)/teach`, class management (`classService.s44.test.ts`), assignments with ownership authz + late detection (`assignment.s113.test.ts`), LTI launch for both roles (`lti.s113.test.ts`) |
| **Parent pages** | ✅ built | `(shell)/family` (roster, per-learner progress), account/export/delete flows (`authz.s46.test.ts` "the owner exports their learner") |
| **Admin page** | ✅ built | `(shell)/admin` |

The isolation requirement in the prompt — "student infrastructure should not mix with other
logins" — is not merely met, it is the **design centre** of the auth layer: children have no
credentials at all, only PINs that mint scoped sessions, and every server test that matters pins a
cross-learner leak to zero.

## 2. Genuinely missing: messaging

No message table, service, route, or UI exists (`grep -rln message src/server src/app/api` returns
only incidental hits in class/LTI services). Build plan, sized honestly at **one full session**
with the DB test layer available:

**Migration `006_messaging.sql`** — one thread table, one message table, and a participant table
keyed by `(thread_id, principal_type, principal_id)` where `principal_type ∈ {user, learner}`.
That split is the whole design: learners are not users, so a message principal cannot be a naked
`user_id` without re-merging the two systems the isolation tests keep apart.

**Authorization rules (write them as failing tests first, in the s46 style):**
1. A learner-scoped session can message only participants of threads it is already in, and can
   open a thread only to its own teachers and its own guardians — never to another learner.
2. A parent reaches only their own learners' teachers; a teacher only their rostered learners and
   those learners' guardians; `school-admin` reaches staff and families within the school;
   `platform-admin` can read all threads (the "admin sees everyone" rule) but writes as a named
   participant, never invisibly.
3. Every read is scoped by participant row, not by role arithmetic — the same pattern
   `assignment.s113` uses for ownership.
4. Content: plain text only at v1, length-capped by the existing `badJson` body-bound machinery;
   no attachments (attachments re-open the export/deletion story).
5. Deletion cascades follow the account-deletion audit pattern (`authService.s43` "deletion
   cascades; the audit row survives").

**Why not built now:** every one of those five rules is a server behavior whose only honest proof
is the sqlite-backed test suite, which cannot execute in this container. A messaging layer between
children and adults with untested authorization is the single worst place in this product to ship
on faith.

## 3. Genuinely missing: universal bug-report affordance

No report-bug control exists in the shell. Smallest honest design:

- One client component (`ReportIssue`) rendered in `(shell)/layout.tsx` — every user-facing screen
  inherits it, satisfying "always have a report bug icon" with one mount point instead of N.
- Labelled icon-button (44 px target, visible focus, `aria-label`), per the controls contract; no
  icon-only ambiguity.
- Submits `{ route, viewportClass, appVersion, description }` to a new `/api/feedback` route using
  the existing bounded-JSON + session-optional pattern (`badJson.s46` covers the parser paths).
  **No screenshot capture and no DOM serialization** — a learner's screen contains their work and
  their mistakes; the report must not exfiltrate either. Description is the learner's own words.
- Trail-voice and instructional-colour gates apply: the component uses semantic palette tokens and
  registered stage labels or it fails `verify:trail-voice` / `verify:instructional-colors`.

Client half is buildable anywhere; the route needs the DB layer for storage and the s46-style
tests. Ship them together — a report button that posts into a 404 is worse than none.

## 4. Order of work for the session that has a working DB layer

1. `006_messaging.sql` + `messagingService.ts` + failing-first authz tests (the five rules above).
2. `/api/feedback` + `ReportIssue` in the shell layout + gate re-runs.
3. Message UI: one thread list + one thread view per role surface (family / teach / admin), reusing
   the class-insights table idioms; learner surface gets the same view scoped by rule 1.
4. Playwright: one spec per role proving the isolation rules at the UI layer (learner cannot see
   the compose-to picker beyond its own adults).
