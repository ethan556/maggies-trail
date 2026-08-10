# Institutions (districts, schools, rostering, assignments, interventions, LTI)

Session 113 added a durable, server-side institutional layer on top of the
local-first learner engine. It is **additive**: with no durable database the app
is exactly what it was — a local-first learner and a device-local teacher
surface. Every institutional capability degrades to a calm empty state, never an
error wall.

Nothing here calls a generative model, introduces a new runtime dependency, or
weakens determinism. LTI signature verification uses `node:crypto` only.

---

## 1. Data model (migration `005_institutional.sql`)

- **`orgs`** — a self-referential tree. `type` is `district` or `school`; a
  school's `parent_org_id` is its district. `UNIQUE(external_source, external_id)`
  (partial) namespaces imported rows so two districts can share a OneRoster
  sourcedId without collision.
- **`org_staff`** — `(org_id, user_id, role)` where role is
  `teacher | administrator | aide`. An `administrator` row also lifts the user's
  account role to `school-admin`.
- **`academic_terms`**, **`classrooms`/`learners` ALTERs**, **`enrollments`**
  (student XOR teacher, `status active|dropped`, lifecycle-managed).
- **`assignments`** (+ `assignment_status` cache), **`roster_imports`** (audit
  of every dry-run/apply with plan + diagnostics), **`interventions`** +
  **`intervention_notes`**.
- **`lti_platforms`**, **`lti_nonces`** (single-use nonce + jti replay guard),
  **`lms_outbox`** (AGS score queue — see §6).

## 2. RBAC

Authority is **always** re-derived from rows against the session — never taken
from a request body.

| Actor | Can |
| --- | --- |
| platform-admin | create districts; administer the whole tree |
| district admin (`school-admin` on a district) | create schools under it; roster-import; register LTI; report; manage any class in the subtree |
| school admin (`school-admin` on a school) | manage that school's staff, classes, reports |
| teacher | own classes: assign, view tiers, open interventions |
| parent / learner | nothing institutional |

`canAdminOrg` walks the ancestor chain, so administering a district implies
administering every school and class beneath it. `canManageClassroom` is
"owning teacher **or** org-admin of the class's org".

## 3. OneRoster (v1.1 CSV) — subset

Implemented files: `orgs, academicSessions, courses, classes, users,
enrollments`. Import is a **dry-run → apply** flow: a dry run writes nothing but
an audit row and returns the exact plan (`create/update/retire` per entity) plus
diagnostics; an apply refuses unless `plan.applicable` (errors block, warnings do
not). Applies are **transactional and idempotent** — re-importing the same
bundle produces updates, never duplicates. Retirement (`status=tobedeleted`)
drops the enrollment and removes the member but never deletes a learner.

Namespacing: imported external ids live under `oneroster:<districtOrgId>`, so
`existingKeys` and every upsert are scoped to the importing district.

**Students never become email accounts.** OneRoster student rows attach to a
per-school passwordless "roster holder" account; the child is institutional
roster data, not a login. Export round-trips native rows under synthetic
`mt:<localId>` sourcedIds.

## 4. Assignments

Kinds: `lesson` and `course` (validated against the curriculum manifest —
unknown refs are rejected). Draft unless published; archive hides. Per-learner
status (`not-started | in-progress | on-time | late`) is a **cache rebuilt from
real completion dates** on every teacher list call, so a synced completion flips
status with **zero assignment-side writes**. `late` = most-recent completion date
> due date.

## 5. Interventions & tiers

Tiers are **pure and recomputed from evidence** (`lib/institution/intervention.ts`):
Tier 3 below `tier3ProficientShare` (0.40), Tier 2 below `tier2` (0.65) or with a
persistent misconception signal, else Tier 1. **Insufficient evidence stays
Tier 1 by design** — the module's stance is that absence of evidence is not
evidence of need. Intervention *cases* are the human decision layered on top: a
teacher opens a case (learner must be actively enrolled), adds notes, and moves
status open → monitoring → resolved.

## 6. Reporting

`orgReport(orgId, dimension)` aggregates proficiency over the org subtree by
`school | class | grade`. **Small cohorts are suppressed** (default floor 10;
complementary suppression too, so a single revealed cell can't be back-solved).
The CSV surfaces the word `suppressed`, never the hidden numbers.

## 7. LTI 1.3

Implemented: third-party-initiated OIDC login, `ResourceLinkRequest` validation
(RS256 via `node:crypto`, full claim checks, single-use nonce, jti replay
refusal, deployment + message-type checks, multi-audience `azp` rule), teacher
session minting (passwordless provisioning), student content redirect (**no
account, ever**), and AGS score **queueing** into `lms_outbox`.

Every rejection returns a **reason code** (`invalid-signature`, `nonce-replayed`,
`jti-replayed`, `bad-deployment`, …), not a boolean — a 7:58am district
integration failure needs to be a five-minute fix, not a day.

Routes: `/api/lti/login` (sets a short-lived `mt_lti_state` cookie),
`/api/lti/launch` (verifies state, validates the token, mints or redirects),
`/api/lti/platforms` (admin register + list).

## 8. Owed seams (honest scope)

These are deliberately **not** implemented; the architecture leaves a clean seam
for each:

- **AGS delivery worker.** Scores are *queued* in `lms_outbox`; this deployment
  makes no outbound HTTP. A drain worker is the seam.
- **Deep linking**, **dynamic registration**, **`jwks_uri` refresh** (keys are
  pasted at registration; rotation = re-paste).
- **OneRoster REST** serving (only CSV bundle import/export today).
- **Growth-over-time series.** `growthSeries` refuses to fabricate history; it
  needs a periodic snapshot table that does not yet exist.
- **`activeDays14` caveat.** Counts distinct *first-completion* dates in the
  trailing 14 days (the durable signal available), so a pure-review day without a
  first completion is not counted. Documented, not hidden.
- **Device-linking for managed learners.** Roster-holder learners have no login;
  associating a shared classroom device with a rostered child is future work.
- **Assignment card offline nuance.** The dashboard card reads
  `/api/assignments?learnerId=` with the roster child id — the *same* id the
  sync layer claims on first push, so no separate mapping exists. Before the
  first authenticated sync (or signed out) the card silently renders nothing;
  it never blocks the local-first dashboard.

## 9. Surfaces

- **`/admin`** — org tree, roster import (dry-run→apply), staff, reports
  (with CSV), LTI registration. Gated server-side; non-admins see an empty state.
- **`/teach/class/[classId]`** — the durable, cross-device class surface:
  assignments picked from the curriculum manifest (course→lesson, or a whole
  course), the tier trail bar + per-learner board (leaf/tangerine/berry carry
  the same semantics as the lesson player), shared-need small groups, and
  intervention cases. Distinct from the device-local `/teach` store.
- **Learner dashboard "From your teacher" card** — published assignments with
  per-lesson completion and a continue link; renders nothing when signed out,
  DB-less, or unassigned, so solo learners never see an institutional hole.
