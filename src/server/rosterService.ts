/**
 * ROSTER SERVICE — the impure half of OneRoster rostering.
 *
 * src/lib/institution/oneroster.ts owns everything that can be pure: parsing,
 * validation, referential checks, and the ImportPlan. This module owns what
 * cannot be: reading which sourcedIds already exist, writing rows, and the
 * roster_imports audit trail. The dry run and the apply call THE SAME pure
 * planner, so the preview a registrar approves is computed by exactly the
 * code the apply executes — they cannot drift.
 *
 * Namespacing: external_source is `oneroster:<districtOrgId>` on every row an
 * import writes. The 005 UNIQUE(external_source, external_id) index therefore
 * gives each district its own sourcedId namespace — two districts can both
 * ship a student "12345" without colliding, which real SIS exports do.
 *
 * Apply semantics, stated plainly:
 *   · SCOPED — caller must administer the target org, which must be a
 *     district. The bundle's single district org row binds (or must match)
 *     the target's external id. Nothing an import contains can write outside
 *     the target's subtree.
 *   · IDEMPOTENT — every entity upserts by (source, sourcedId). Re-importing
 *     the same bundle converges; the second plan says update, not create.
 *   · TRANSACTIONAL — the apply is one transaction; a thrown error rolls
 *     everything back and the roster_imports row records 'failed'.
 *   · REFUSES BAD BUNDLES — planImport.applicable false (any error-severity
 *     diagnostic) means the apply is rejected before a single write.
 *   · DUAL-WRITE MEMBERSHIP — enrollments is the richer lifecycle table;
 *     classroom_members stays the operational one every existing surface
 *     reads. Student enrollments write both; drops mark the enrollment
 *     'dropped' AND remove the member row. One import, both views correct.
 *   · OWNERSHIP IS HONEST — classrooms.teacher_user_id is NOT NULL by
 *     design, so a class with no teacher enrollment is a diagnostic, not a
 *     silently ownerless class.
 *
 * Deletion semantics: OneRoster 'tobedeleted' retires the mirrored row and
 * removes memberships. Nothing in an import file hard-deletes learner work;
 * hard deletion stays an explicit account action (s44).
 */

import { randomBytes } from "node:crypto";
import type { DB } from "@/server/db";
import { audit, type SessionInfo } from "@/server/authService";
import { canAdminOrg, provisionAccount, rosterHolderAccount } from "@/server/institutionService";
import {
  parseBundle,
  planImport,
  withParseDiagnostics,
  exportBundle,
  emptyBundle,
  type Diagnostic,
  type ExistingKeys,
  type ImportPlan,
  type OneRosterBundle,
  type OneRosterFile,
  type OrUser
} from "@/lib/institution/oneroster";

const nowIso = () => new Date().toISOString();
const newId = (p: string) => `${p}_${randomBytes(9).toString("base64url")}`;
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
function newJoinCode(): string {
  const bytes = randomBytes(6);
  let code = "";
  for (let i = 0; i < 6; i++) code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return code;
}

/** OneRoster grades → learners.grade ("KG"/"K"/"PK" → 0, "03" → 3). Unmappable
 * values stay null rather than guessing. */
export function gradeToInt(grades: readonly string[]): number | null {
  const first = (grades[0] ?? "").trim().toUpperCase();
  if (!first) return null;
  if (first === "K" || first === "KG" || first === "PK" || first === "PREKINDERGARTEN") return 0;
  const n = Number.parseInt(first, 10);
  return Number.isFinite(n) && n >= 0 && n <= 13 ? n : null;
}

const sourceFor = (districtOrgId: string) => `oneroster:${districtOrgId}`;

/** What already exists under this district's namespace, as the pure planner
 * wants it: one set of external ids per entity kind. */
function existingKeys(db: DB, source: string): ExistingKeys {
  const ids = (sql: string): ReadonlySet<string> =>
    new Set(
      (db.prepare(sql).all(source) as Array<{ external_id: string }>).map((r) => r.external_id)
    );
  return {
    orgs: ids("SELECT external_id FROM orgs WHERE external_source = ? AND external_id IS NOT NULL"),
    classes: ids("SELECT external_id FROM classrooms WHERE external_source = ? AND external_id IS NOT NULL"),
    users: new Set([
      ...ids("SELECT external_id FROM learners WHERE external_source = ? AND external_id IS NOT NULL"),
      ...(
        db
          .prepare(
            "SELECT s.external_id FROM org_staff s JOIN orgs o ON o.id = s.org_id WHERE o.external_source = ? AND s.external_id IS NOT NULL"
          )
          .all(source) as Array<{ external_id: string }>
      ).map((r) => r.external_id)
    ]),
    enrollments: ids("SELECT external_id FROM enrollments WHERE external_source = ? AND external_id IS NOT NULL")
  };
}

export interface ImportResult {
  importId: string;
  plan: ImportPlan;
  applied: boolean;
  dryRun: boolean;
}

const MAX_STORED_DIAGNOSTICS = 100;

function persistImportRow(
  db: DB,
  id: string,
  orgId: string,
  actor: string,
  dryRun: boolean,
  outcome: "pending" | "applied" | "rejected" | "failed",
  plan: ImportPlan
): void {
  const { diagnostics, ...counts } = plan;
  const stored: Diagnostic[] = [...diagnostics]
    .sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "error" ? -1 : 1))
    .slice(0, MAX_STORED_DIAGNOSTICS);
  db.prepare(
    `INSERT INTO roster_imports (id, org_id, actor_user_id, source, dry_run, started_at, finished_at, outcome, plan, diagnostics)
     VALUES (?,?,?,?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET finished_at = excluded.finished_at, outcome = excluded.outcome,
       plan = excluded.plan, diagnostics = excluded.diagnostics`
  ).run(id, orgId, actor, "oneroster-csv", dryRun ? 1 : 0, nowIso(), nowIso(), outcome, JSON.stringify(counts), JSON.stringify(stored));
}

/**
 * Import a OneRoster CSV bundle into one district org. `dryRun: true` plans
 * and records, writes nothing else. Apply refuses non-applicable plans.
 */
export function importBundle(
  db: DB,
  session: SessionInfo,
  districtOrgId: string,
  files: Partial<Record<OneRosterFile, string>>,
  opts: { dryRun: boolean }
): ImportResult | { error: "forbidden" | "not-a-district" } {
  if (!canAdminOrg(db, session, districtOrgId)) return { error: "forbidden" };
  const target = db.prepare("SELECT id, type, external_id, external_source FROM orgs WHERE id = ?").get(districtOrgId) as
    | { id: string; type: string; external_id: string | null; external_source: string | null }
    | undefined;
  if (!target || target.type !== "district") return { error: "not-a-district" };

  const source = sourceFor(districtOrgId);
  const { bundle, diagnostics: parseDiagnostics } = parseBundle(files);

  // Target binding: at most one district org row, and it must match the
  // target's already-bound external id (first import binds it).
  const bundleDistricts = bundle.orgs.filter((o) => o.type === "district");
  const bindDiagnostics: Diagnostic[] = [];
  if (bundleDistricts.length > 1) {
    bindDiagnostics.push({
      severity: "error",
      file: "orgs",
      line: 0,
      sourcedId: bundleDistricts[1].sourcedId,
      code: "multiple-districts",
      message: `orgs.csv contains ${bundleDistricts.length} district rows; an import targets exactly one district.`
    });
  }
  const dOrg = bundleDistricts[0];
  if (dOrg && target.external_id && target.external_source === source && target.external_id !== dOrg.sourcedId) {
    bindDiagnostics.push({
      severity: "error",
      file: "orgs",
      line: 0,
      sourcedId: dOrg.sourcedId,
      code: "district-mismatch",
      message: `District sourcedId "${dOrg.sourcedId}" does not match this district's bound id "${target.external_id}".`
    });
  }

  const plan = withParseDiagnostics(planImport(bundle, existingKeys(db, source)), [
    ...parseDiagnostics,
    ...bindDiagnostics
  ]);

  const importId = newId("ri");
  if (opts.dryRun) {
    persistImportRow(db, importId, districtOrgId, session.user.id, true, "pending", plan);
    audit(db, session.user.id, "roster-dry-run", districtOrgId);
    return { importId, plan, applied: false, dryRun: true };
  }
  if (!plan.applicable) {
    persistImportRow(db, importId, districtOrgId, session.user.id, false, "rejected", plan);
    audit(db, session.user.id, "roster-rejected", districtOrgId);
    return { importId, plan, applied: false, dryRun: false };
  }

  try {
    db.transaction(() => applyBundle(db, session, districtOrgId, source, bundle))();
    persistImportRow(db, importId, districtOrgId, session.user.id, false, "applied", plan);
    audit(db, session.user.id, "roster-applied", districtOrgId);
    return { importId, plan, applied: true, dryRun: false };
  } catch (e) {
    persistImportRow(db, importId, districtOrgId, session.user.id, false, "failed", {
      ...plan,
      diagnostics: [
        ...plan.diagnostics,
        {
          severity: "error",
          file: "orgs",
          line: 0,
          sourcedId: "",
          code: "apply-failed",
          message: e instanceof Error ? e.message : "apply failed"
        }
      ]
    });
    throw e;
  }
}

/** The transactional apply. Order matters: each stage resolves ids the next
 * one references. Runs only on an applicable plan. */
function applyBundle(db: DB, session: SessionInfo, districtOrgId: string, source: string, bundle: OneRosterBundle): void {
  const at = nowIso();

  // ── District binding + schools ────────────────────────────────────────────
  const dOrg = bundle.orgs.find((o) => o.type === "district");
  if (dOrg) {
    db.prepare(
      "UPDATE orgs SET external_id = ?, external_source = ?, name = COALESCE(NULLIF(?, ''), name), updated_at = ? WHERE id = ?"
    ).run(dOrg.sourcedId, source, dOrg.name, at, districtOrgId);
  }
  const orgIdBySourced = new Map<string, string>();
  if (dOrg) orgIdBySourced.set(dOrg.sourcedId, districtOrgId);
  for (const r of db
    .prepare("SELECT id, external_id FROM orgs WHERE external_source = ? AND external_id IS NOT NULL")
    .all(source) as Array<{ id: string; external_id: string }>) {
    orgIdBySourced.set(r.external_id, r.id);
  }
  for (const o of bundle.orgs) {
    if (o.type === "district") continue;
    const status = o.status === "tobedeleted" ? "retired" : "active";
    const known = orgIdBySourced.get(o.sourcedId);
    if (known) {
      db.prepare("UPDATE orgs SET name = ?, status = ?, updated_at = ? WHERE id = ?").run(o.name, status, at, known);
    } else {
      const id = newId("org");
      db.prepare(
        "INSERT INTO orgs (id, parent_org_id, type, name, external_id, external_source, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)"
      ).run(id, districtOrgId, "school", o.name, o.sourcedId, source, status, at, at);
      orgIdBySourced.set(o.sourcedId, id);
    }
  }

  // ── Academic sessions → terms (attached to the district org) ─────────────
  const termIdBySourced = new Map<string, string>();
  for (const r of db
    .prepare("SELECT id, external_id FROM academic_terms WHERE org_id = ? AND external_id IS NOT NULL")
    .all(districtOrgId) as Array<{ id: string; external_id: string }>) {
    termIdBySourced.set(r.external_id, r.id);
  }
  for (const s of bundle.academicSessions) {
    const status = s.status === "tobedeleted" ? "retired" : "active";
    const known = termIdBySourced.get(s.sourcedId);
    if (known) {
      db.prepare("UPDATE academic_terms SET title = ?, type = ?, start_date = ?, end_date = ?, school_year = ?, status = ? WHERE id = ?").run(
        s.title, s.type, s.startDate, s.endDate, s.schoolYear || null, status, known
      );
    } else {
      const id = newId("term");
      db.prepare(
        "INSERT INTO academic_terms (id, org_id, title, type, start_date, end_date, school_year, external_id, status, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)"
      ).run(id, districtOrgId, s.title, s.type, s.startDate, s.endDate, s.schoolYear || null, s.sourcedId, status, at);
      termIdBySourced.set(s.sourcedId, id);
    }
  }

  // ── Users: staff → accounts + org_staff; students → learners ─────────────
  const staffIdBySourced = new Map<string, string>();
  const learnerIdBySourced = new Map<string, string>();
  for (const r of db
    .prepare(
      "SELECT DISTINCT s.external_id, s.user_id FROM org_staff s JOIN orgs o ON o.id = s.org_id WHERE o.external_source = ? AND s.external_id IS NOT NULL"
    )
    .all(source) as Array<{ external_id: string; user_id: string }>) {
    staffIdBySourced.set(r.external_id, r.user_id);
  }
  for (const r of db
    .prepare("SELECT id, external_id FROM learners WHERE external_source = ? AND external_id IS NOT NULL")
    .all(source) as Array<{ id: string; external_id: string }>) {
    learnerIdBySourced.set(r.external_id, r.id);
  }

  const isStaff = (u: OrUser) => u.role === "teacher" || u.role === "administrator" || u.role === "aide";
  for (const u of bundle.users) {
    const schoolOrgIds = u.orgSourcedIds
      .map((sid) => orgIdBySourced.get(sid))
      .filter((x): x is string => !!x && x !== districtOrgId);
    if (isStaff(u)) {
      const email = u.email || u.username;
      if (!email || !email.includes("@")) continue; // planImport already diagnosed this
      const { userId } = provisionAccount(db, session.user.id, email, "teacher");
      staffIdBySourced.set(u.sourcedId, userId);
      const staffRole = u.role === "administrator" ? "administrator" : u.role === "aide" ? "aide" : "teacher";
      const status = u.status === "tobedeleted" ? "retired" : "active";
      const attachTo = schoolOrgIds.length > 0 ? schoolOrgIds : [districtOrgId];
      for (const orgId of attachTo) {
        db.prepare(
          `INSERT INTO org_staff (org_id, user_id, role, external_id, status, created_at) VALUES (?,?,?,?,?,?)
           ON CONFLICT(org_id, user_id, role) DO UPDATE SET status = excluded.status, external_id = COALESCE(excluded.external_id, external_id)`
        ).run(orgId, userId, staffRole, u.sourcedId, status, at);
      }
    } else if (u.role === "student") {
      const name = [u.givenName, u.familyName].filter(Boolean).join(" ").trim() || u.username || u.sourcedId;
      const grade = gradeToInt(u.grades);
      const known = learnerIdBySourced.get(u.sourcedId);
      if (known) {
        db.prepare("UPDATE learners SET name = ?, grade = COALESCE(?, grade) WHERE id = ?").run(name, grade, known);
        if (u.status === "tobedeleted") {
          db.prepare("DELETE FROM classroom_members WHERE learner_id = ?").run(known);
          db.prepare("UPDATE enrollments SET status = 'dropped', end_date = ?, updated_at = ? WHERE learner_id = ? AND status = 'active'").run(
            at.slice(0, 10), at, known
          );
        }
      } else {
        if (u.status === "tobedeleted") continue; // never create a row just to retire it
        const holderSchool = schoolOrgIds[0];
        if (!holderSchool) continue; // diagnosed by checkReferences
        const id = newId("l");
        db.prepare(
          "INSERT INTO learners (id, account_id, name, grade, created_at, external_id, external_source) VALUES (?,?,?,?,?,?,?)"
        ).run(id, rosterHolderAccount(db, holderSchool), name, grade, at, u.sourcedId, source);
        learnerIdBySourced.set(u.sourcedId, id);
      }
    }
    // guardian/parent/relative/proctor rows are out of rostering scope
  }

  // ── Classes ───────────────────────────────────────────────────────────────
  // Ownership first: group teacher enrollments per class so a new class can be
  // created WITH its owner (teacher_user_id is NOT NULL by design).
  const teacherEnrollments = new Map<string, Array<{ user: string; primary: boolean }>>();
  for (const e of bundle.enrollments) {
    if (e.role !== "teacher") continue;
    const list = teacherEnrollments.get(e.classSourcedId) ?? [];
    list.push({ user: e.userSourcedId, primary: e.primary });
    teacherEnrollments.set(e.classSourcedId, list);
  }

  const classIdBySourced = new Map<string, string>();
  for (const r of db
    .prepare("SELECT id, external_id FROM classrooms WHERE external_source = ? AND external_id IS NOT NULL")
    .all(source) as Array<{ id: string; external_id: string }>) {
    classIdBySourced.set(r.external_id, r.id);
  }
  for (const c of bundle.classes) {
    const schoolOrgId = orgIdBySourced.get(c.schoolSourcedId);
    if (!schoolOrgId) continue; // checkReferences diagnosed it
    const termId = c.termSourcedIds.map((t) => termIdBySourced.get(t)).find((x) => !!x) ?? null;
    const tlist = (teacherEnrollments.get(c.sourcedId) ?? []).sort((a, b) =>
      a.primary === b.primary ? a.user.localeCompare(b.user) : a.primary ? -1 : 1
    );
    const ownerId = tlist.map((t) => staffIdBySourced.get(t.user)).find((x) => !!x) ?? null;
    const status = c.status === "tobedeleted" ? "retired" : "active";
    const known = classIdBySourced.get(c.sourcedId);
    if (known) {
      db.prepare(
        `UPDATE classrooms SET name = ?, org_id = ?, term_id = ?, subject = ?, period = ?, grade = ?, status = ?,
           teacher_user_id = COALESCE(?, teacher_user_id) WHERE id = ?`
      ).run(
        c.title, schoolOrgId, termId, c.subjects.join(",") || null, c.periods.join(",") || null,
        c.grades.join(",") || null, status, ownerId, known
      );
      if (status === "retired") db.prepare("DELETE FROM classroom_members WHERE classroom_id = ?").run(known);
    } else {
      if (!ownerId) {
        // planImport cannot know account resolution; enforce here loudly.
        throw new Error(`class "${c.sourcedId}" has no resolvable teacher enrollment — refusing an ownerless class`);
      }
      const id = newId("c");
      let inserted = false;
      for (let attempt = 0; attempt < 5 && !inserted; attempt++) {
        try {
          db.prepare(
            `INSERT INTO classrooms (id, teacher_user_id, name, join_code, created_at, org_id, term_id, external_id, external_source, subject, period, grade, status)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
          ).run(
            id, ownerId, c.title, newJoinCode(), at, schoolOrgId, termId, c.sourcedId, source,
            c.subjects.join(",") || null, c.periods.join(",") || null, c.grades.join(",") || null, status
          );
          inserted = true;
        } catch (e) {
          if (!(e instanceof Error) || !/UNIQUE.*join_code/.test(e.message)) throw e;
        }
      }
      if (!inserted) throw new Error("join-code space exhausted");
      classIdBySourced.set(c.sourcedId, id);
    }
  }

  // ── Enrollments (lifecycle rows + operational membership) ────────────────
  const enrollIdBySourced = new Map<string, string>();
  for (const r of db
    .prepare("SELECT id, external_id FROM enrollments WHERE external_source = ? AND external_id IS NOT NULL")
    .all(source) as Array<{ id: string; external_id: string }>) {
    enrollIdBySourced.set(r.external_id, r.id);
  }
  const addMember = db.prepare(
    "INSERT OR IGNORE INTO classroom_members (classroom_id, learner_id, joined_at) VALUES (?,?,?)"
  );
  for (const e of bundle.enrollments) {
    const classroomId = classIdBySourced.get(e.classSourcedId);
    if (!classroomId) continue;
    const dropped = e.status === "tobedeleted";
    if (e.role === "student") {
      const learnerId = learnerIdBySourced.get(e.userSourcedId);
      if (!learnerId) continue;
      const known = enrollIdBySourced.get(e.sourcedId);
      if (known) {
        db.prepare("UPDATE enrollments SET status = ?, end_date = ?, updated_at = ? WHERE id = ?").run(
          dropped ? "dropped" : "active", dropped ? (e.endDate || at.slice(0, 10)) : e.endDate || null, at, known
        );
      } else if (!dropped) {
        db.prepare(
          `INSERT INTO enrollments (id, classroom_id, learner_id, user_id, role, status, is_primary, begin_date, end_date, external_id, external_source, created_at, updated_at)
           VALUES (?,?,?,NULL,'student','active',0,?,?,?,?,?,?)
           ON CONFLICT(classroom_id, learner_id, role) WHERE learner_id IS NOT NULL DO UPDATE SET
             status = 'active', external_id = excluded.external_id, external_source = excluded.external_source, updated_at = excluded.updated_at`
        ).run(newId("e"), classroomId, learnerId, e.beginDate || null, e.endDate || null, e.sourcedId, source, at, at);
      }
      if (dropped) {
        db.prepare("DELETE FROM classroom_members WHERE classroom_id = ? AND learner_id = ?").run(classroomId, learnerId);
      } else {
        addMember.run(classroomId, learnerId, at);
      }
    } else {
      const userId = staffIdBySourced.get(e.userSourcedId);
      if (!userId) continue;
      const known = enrollIdBySourced.get(e.sourcedId);
      if (known) {
        db.prepare("UPDATE enrollments SET status = ?, is_primary = ?, updated_at = ? WHERE id = ?").run(
          dropped ? "dropped" : "active", e.primary ? 1 : 0, at, known
        );
      } else if (!dropped) {
        db.prepare(
          `INSERT INTO enrollments (id, classroom_id, learner_id, user_id, role, status, is_primary, begin_date, end_date, external_id, external_source, created_at, updated_at)
           VALUES (?,?,NULL,?,'teacher','active',?,?,?,?,?,?,?)
           ON CONFLICT(classroom_id, user_id, role) WHERE user_id IS NOT NULL DO UPDATE SET
             status = 'active', is_primary = excluded.is_primary, external_id = excluded.external_id, external_source = excluded.external_source, updated_at = excluded.updated_at`
        ).run(newId("e"), classroomId, userId, e.primary ? 1 : 0, e.beginDate || null, e.endDate || null, e.sourcedId, source, at, at);
      }
      if (!dropped && e.primary) {
        db.prepare("UPDATE classrooms SET teacher_user_id = ? WHERE id = ?").run(userId, classroomId);
      }
    }
  }
}

// ── Export ──────────────────────────────────────────────────────────────────

/** Rows created natively (no SIS identity) export under a stable synthetic
 * "mt:<localId>" sourcedId so a district's own data round-trips too. */
const sid = (external: string | null, localId: string) => external ?? `mt:${localId}`;

export function exportOneRoster(
  db: DB,
  session: SessionInfo,
  districtOrgId: string
): Partial<Record<OneRosterFile, string>> | { error: "forbidden" | "not-a-district" } {
  if (!canAdminOrg(db, session, districtOrgId)) return { error: "forbidden" };
  const district = db.prepare("SELECT id, type, name, external_id FROM orgs WHERE id = ?").get(districtOrgId) as
    | { id: string; type: string; name: string; external_id: string | null }
    | undefined;
  if (!district || district.type !== "district") return { error: "not-a-district" };

  const bundle: OneRosterBundle = emptyBundle();
  const dSid = sid(district.external_id, district.id);
  bundle.orgs.push({ sourcedId: dSid, status: "active", name: district.name, type: "district", identifier: "", parentSourcedId: "" });

  const schools = db
    .prepare("SELECT id, name, external_id, status FROM orgs WHERE parent_org_id = ? ORDER BY name, id")
    .all(districtOrgId) as Array<{ id: string; name: string; external_id: string | null; status: string }>;
  const schoolSidById = new Map<string, string>();
  for (const s of schools) {
    const sSid = sid(s.external_id, s.id);
    schoolSidById.set(s.id, sSid);
    bundle.orgs.push({
      sourcedId: sSid, status: s.status === "retired" ? "tobedeleted" : "active",
      name: s.name, type: "school", identifier: "", parentSourcedId: dSid
    });
  }

  const terms = db
    .prepare("SELECT id, title, type, start_date, end_date, school_year, external_id, status FROM academic_terms WHERE org_id = ? ORDER BY start_date, id")
    .all(districtOrgId) as Array<{ id: string; title: string; type: string; start_date: string; end_date: string; school_year: string | null; external_id: string | null; status: string }>;
  const termSidById = new Map<string, string>();
  for (const t of terms) {
    const tSid = sid(t.external_id, t.id);
    termSidById.set(t.id, tSid);
    bundle.academicSessions.push({
      sourcedId: tSid, status: t.status === "retired" ? "tobedeleted" : "active", title: t.title,
      type: (t.type === "gradingPeriod" || t.type === "semester" || t.type === "schoolYear" ? t.type : "term"),
      startDate: t.start_date, endDate: t.end_date, schoolYear: t.school_year ?? "", parentSourcedId: ""
    });
  }

  const schoolIds = schools.filter((s) => s.status !== "retired").map((s) => s.id);
  const classes = schoolIds.length
    ? (db
        .prepare(
          `SELECT id, name, external_id, status, grade, subject, period, org_id, term_id, teacher_user_id
           FROM classrooms WHERE org_id IN (${schoolIds.map(() => "?").join(",")}) ORDER BY name, id`
        )
        .all(...schoolIds) as Array<{
        id: string; name: string; external_id: string | null; status: string; grade: string | null;
        subject: string | null; period: string | null; org_id: string; term_id: string | null; teacher_user_id: string;
      }>)
    : [];

  const seenUser = new Set<string>();
  const pushStaff = (userId: string, schoolSid: string): string => {
    const u = db.prepare("SELECT id, email FROM users WHERE id = ?").get(userId) as { id: string; email: string };
    const ext = db
      .prepare("SELECT external_id FROM org_staff WHERE user_id = ? AND external_id IS NOT NULL LIMIT 1")
      .get(userId) as { external_id: string } | undefined;
    const uSid = sid(ext?.external_id ?? null, u.id);
    if (!seenUser.has(uSid)) {
      seenUser.add(uSid);
      // The only name we hold for an account is its email; the local part goes
      // out as givenName so the bundle passes OneRoster's own name requirement.
      bundle.users.push({
        sourcedId: uSid, status: "active", enabledUser: true, role: "teacher", username: u.email,
        givenName: u.email.split("@")[0], familyName: "", email: u.email, identifier: "", grades: [],
        orgSourcedIds: [schoolSid]
      });
    }
    return uSid;
  };

  for (const c of classes) {
    const classSid = sid(c.external_id, c.id);
    const schoolSid = schoolSidById.get(c.org_id) ?? "";
    bundle.classes.push({
      sourcedId: classSid, status: c.status === "retired" ? "tobedeleted" : "active", title: c.name,
      classCode: "", classType: "scheduled", location: "", courseSourcedId: "", schoolSourcedId: schoolSid,
      termSourcedIds: c.term_id ? [termSidById.get(c.term_id) ?? ""] .filter(Boolean) : [],
      grades: c.grade ? c.grade.split(",") : [], subjects: c.subject ? c.subject.split(",") : [],
      periods: c.period ? c.period.split(",") : []
    });
    const tSid = pushStaff(c.teacher_user_id, schoolSid);
    bundle.enrollments.push({
      sourcedId: `mt:e:${c.id}:t`, status: "active", classSourcedId: classSid, schoolSourcedId: schoolSid,
      userSourcedId: tSid, role: "teacher", primary: true, beginDate: "", endDate: ""
    });
    const members = db
      .prepare(
        `SELECT l.id, l.name, l.grade, l.external_id FROM classroom_members m
         JOIN learners l ON l.id = m.learner_id WHERE m.classroom_id = ? ORDER BY l.name, l.id`
      )
      .all(c.id) as Array<{ id: string; name: string; grade: number | null; external_id: string | null }>;
    for (const m of members) {
      const mSid = sid(m.external_id, m.id);
      if (!seenUser.has(mSid)) {
        seenUser.add(mSid);
        const parts = m.name.trim().split(/\s+/);
        bundle.users.push({
          sourcedId: mSid, status: "active", enabledUser: true, role: "student", username: m.name,
          givenName: parts.slice(0, -1).join(" ") || m.name, familyName: parts.length > 1 ? parts[parts.length - 1] : "",
          email: "", identifier: "",
          grades: m.grade === null ? [] : [m.grade === 0 ? "KG" : String(m.grade).padStart(2, "0")],
          orgSourcedIds: [schoolSid]
        });
      }
      bundle.enrollments.push({
        sourcedId: `mt:e:${c.id}:${m.id}`, status: "active", classSourcedId: classSid, schoolSourcedId: schoolSid,
        userSourcedId: mSid, role: "student", primary: false, beginDate: "", endDate: ""
      });
    }
  }

  audit(db, session.user.id, "roster-exported", districtOrgId);
  return exportBundle(bundle, nowIso().slice(0, 10));
}
