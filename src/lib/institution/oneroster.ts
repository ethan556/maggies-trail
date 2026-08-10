/**
 * ONEROSTER v1.1 (CSV) — the rostering contract districts actually speak.
 *
 * Every SIS worth integrating (PowerSchool, Infinite Campus, Skyward, Clever,
 * ClassLink) can emit a OneRoster CSV bundle, so that bundle — not a bespoke
 * "upload your students" spreadsheet — is the front door for institutional
 * rostering. This module is the PURE half: parse a bundle, validate it, and
 * resolve it into a plan. It touches no database and no clock, which is what
 * makes a dry run trustworthy: the plan you preview is computed by exactly the
 * same code that the apply step later executes against.
 *
 * Two decisions worth stating plainly.
 *
 * ONE — WE VALIDATE THE WHOLE BUNDLE, NOT THE FIRST ERROR. A district import
 * that fails on row 3 of 40,000 and says nothing about rows 4..40,000 is
 * useless to the registrar who has to fix it. Every diagnostic carries file,
 * line, sourcedId, and a human sentence, and they come back sorted, so the
 * report is stable enough to diff between two runs of the same export.
 *
 * TWO — REFERENTIAL INTEGRITY IS CHECKED HERE, NOT AT THE DATABASE. Foreign
 * keys would reject a bad row with a constraint error at apply time, halfway
 * through a transaction. Checking membership against the parsed bundle lets a
 * DRY RUN tell the truth before anything is written, which is the difference
 * between "your import will fail" and "your import failed".
 *
 * Scope honesty: v1.1 CSV rostering (orgs, academicSessions, courses, classes,
 * users, enrollments). The REST/OAuth2 OneRoster profile and Gradebook
 * (results/lineItems) are NOT implemented here — see `institution/README` notes
 * in KNOWN_ISSUES rather than assuming a green field.
 */

import { parseCsv, toCsv, type CsvRow } from "@/lib/institution/csv";

// ── Vocabulary ──────────────────────────────────────────────────────────────

export const ONEROSTER_FILES = [
  "orgs",
  "academicSessions",
  "courses",
  "classes",
  "users",
  "enrollments"
] as const;
export type OneRosterFile = (typeof ONEROSTER_FILES)[number];

/** v1.1 status enum. `tobedeleted` is a soft-delete instruction, not a filter. */
export type OrStatus = "active" | "tobedeleted";

export type OrgType = "district" | "school" | "local" | "state" | "national";
export type SessionType = "gradingPeriod" | "semester" | "schoolYear" | "term";
export type EnrollmentRole = "student" | "teacher";
/** v1.1 user roles. We map administrator/aide onto staff privileges, not learners. */
export type UserRole = "student" | "teacher" | "administrator" | "aide" | "guardian" | "parent" | "relative" | "proctor";

export interface OrOrg {
  sourcedId: string;
  status: OrStatus;
  name: string;
  type: OrgType;
  identifier: string;
  parentSourcedId: string;
}
export interface OrSession {
  sourcedId: string;
  status: OrStatus;
  title: string;
  type: SessionType;
  startDate: string;
  endDate: string;
  schoolYear: string;
  parentSourcedId: string;
}
export interface OrCourse {
  sourcedId: string;
  status: OrStatus;
  title: string;
  courseCode: string;
  orgSourcedId: string;
  grades: string[];
  subjects: string[];
}
export interface OrClass {
  sourcedId: string;
  status: OrStatus;
  title: string;
  classCode: string;
  classType: string;
  location: string;
  courseSourcedId: string;
  schoolSourcedId: string;
  termSourcedIds: string[];
  grades: string[];
  subjects: string[];
  periods: string[];
}
export interface OrUser {
  sourcedId: string;
  status: OrStatus;
  enabledUser: boolean;
  role: UserRole;
  username: string;
  givenName: string;
  familyName: string;
  email: string;
  identifier: string;
  orgSourcedIds: string[];
  grades: string[];
}
export interface OrEnrollment {
  sourcedId: string;
  status: OrStatus;
  classSourcedId: string;
  schoolSourcedId: string;
  userSourcedId: string;
  role: EnrollmentRole;
  primary: boolean;
  beginDate: string;
  endDate: string;
}

export interface OneRosterBundle {
  orgs: OrOrg[];
  academicSessions: OrSession[];
  courses: OrCourse[];
  classes: OrClass[];
  users: OrUser[];
  enrollments: OrEnrollment[];
}

export function emptyBundle(): OneRosterBundle {
  return { orgs: [], academicSessions: [], courses: [], classes: [], users: [], enrollments: [] };
}

// ── Diagnostics ─────────────────────────────────────────────────────────────

export type DiagnosticSeverity = "error" | "warning";

export interface Diagnostic {
  severity: DiagnosticSeverity;
  file: OneRosterFile | "manifest";
  line: number;
  sourcedId: string;
  /** A stable machine code so tests and dashboards can group without string-matching prose. */
  code: string;
  message: string;
}

const diag = (
  severity: DiagnosticSeverity,
  file: Diagnostic["file"],
  line: number,
  sourcedId: string,
  code: string,
  message: string
): Diagnostic => ({ severity, file, line, sourcedId, code, message });

/** Deterministic order: file, then line, then code. Two runs of one export diff cleanly. */
export function sortDiagnostics(list: Diagnostic[]): Diagnostic[] {
  const fileRank = (f: Diagnostic["file"]) => (f === "manifest" ? -1 : ONEROSTER_FILES.indexOf(f));
  return [...list].sort(
    (a, b) => fileRank(a.file) - fileRank(b.file) || a.line - b.line || a.code.localeCompare(b.code)
  );
}

// ── Field helpers ───────────────────────────────────────────────────────────

/** v1.1 multi-values are comma-separated inside one quoted field. */
function splitList(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function readStatus(raw: string): OrStatus {
  return raw.trim().toLowerCase() === "tobedeleted" ? "tobedeleted" : "active";
}

function readBool(raw: string, fallback: boolean): boolean {
  const v = raw.trim().toLowerCase();
  if (v === "true" || v === "1" || v === "yes") return true;
  if (v === "false" || v === "0" || v === "no") return false;
  return fallback;
}

/** ISO-8601 calendar date. We accept a full timestamp and keep the date part. */
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export function normalizeDate(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  const head = s.slice(0, 10);
  return DATE_RE.test(head) ? head : "";
}

// ── Parsing ─────────────────────────────────────────────────────────────────

/** Header aliases: real exports vary in case and in a few well-known spellings. */
function pick(row: CsvRow, ...names: string[]): string {
  for (const n of names) {
    const direct = row.values[n];
    if (direct !== undefined) return direct;
  }
  const lowered = Object.keys(row.values).reduce<Record<string, string>>((acc, k) => {
    acc[k.toLowerCase()] = row.values[k];
    return acc;
  }, {});
  for (const n of names) {
    const v = lowered[n.toLowerCase()];
    if (v !== undefined) return v;
  }
  return "";
}

export interface ParsedBundle {
  bundle: OneRosterBundle;
  diagnostics: Diagnostic[];
}

/**
 * Parse a bundle from raw file text keyed by OneRoster file name. Missing
 * files are allowed — a district may send only `users` + `enrollments` for a
 * delta — and are reported as warnings, not errors.
 */
export function parseBundle(files: Partial<Record<OneRosterFile, string>>): ParsedBundle {
  const bundle = emptyBundle();
  const diagnostics: Diagnostic[] = [];
  const seen = new Map<OneRosterFile, Set<string>>();

  const dedupe = (file: OneRosterFile, id: string, line: number): boolean => {
    const set = seen.get(file) ?? new Set<string>();
    seen.set(file, set);
    if (set.has(id)) {
      diagnostics.push(
        diag("error", file, line, id, "duplicate-sourced-id", `sourcedId "${id}" appears more than once in ${file}.csv.`)
      );
      return false;
    }
    set.add(id);
    return true;
  };

  const rowsOf = (file: OneRosterFile): CsvRow[] => {
    const text = files[file];
    if (text === undefined) return [];
    const table = parseCsv(text);
    if (table.headers.length === 0) {
      diagnostics.push(diag("warning", file, 1, "", "empty-file", `${file}.csv is empty.`));
      return [];
    }
    for (const row of table.rows) {
      if (row.extra.length > 0) {
        diagnostics.push(
          diag(
            "warning",
            file,
            row.line,
            pick(row, "sourcedId"),
            "extra-columns",
            `Row has ${row.extra.length} field(s) beyond the header; the surplus was ignored.`
          )
        );
      }
    }
    return table.rows;
  };

  const requireId = (file: OneRosterFile, row: CsvRow): string | null => {
    const id = pick(row, "sourcedId").trim();
    if (!id) {
      diagnostics.push(diag("error", file, row.line, "", "missing-sourced-id", "sourcedId is required."));
      return null;
    }
    return id;
  };

  // orgs
  for (const row of rowsOf("orgs")) {
    const id = requireId("orgs", row);
    if (!id || !dedupe("orgs", id, row.line)) continue;
    const rawType = pick(row, "type").trim().toLowerCase();
    const type: OrgType =
      rawType === "district" || rawType === "school" || rawType === "local" || rawType === "state" || rawType === "national"
        ? (rawType as OrgType)
        : "school";
    if (rawType && type !== rawType) {
      diagnostics.push(
        diag("warning", "orgs", row.line, id, "unknown-org-type", `Unrecognised org type "${rawType}"; treated as school.`)
      );
    }
    const name = pick(row, "name").trim();
    if (!name) diagnostics.push(diag("error", "orgs", row.line, id, "missing-name", "Org name is required."));
    bundle.orgs.push({
      sourcedId: id,
      status: readStatus(pick(row, "status")),
      name,
      type,
      identifier: pick(row, "identifier").trim(),
      parentSourcedId: pick(row, "parentSourcedId").trim()
    });
  }

  // academicSessions
  for (const row of rowsOf("academicSessions")) {
    const id = requireId("academicSessions", row);
    if (!id || !dedupe("academicSessions", id, row.line)) continue;
    const rawType = pick(row, "type").trim();
    const type: SessionType =
      rawType === "gradingPeriod" || rawType === "semester" || rawType === "schoolYear" || rawType === "term"
        ? rawType
        : "term";
    const startDate = normalizeDate(pick(row, "startDate"));
    const endDate = normalizeDate(pick(row, "endDate"));
    if (pick(row, "startDate").trim() && !startDate) {
      diagnostics.push(
        diag("error", "academicSessions", row.line, id, "bad-date", "startDate is not an ISO-8601 date (YYYY-MM-DD).")
      );
    }
    if (pick(row, "endDate").trim() && !endDate) {
      diagnostics.push(
        diag("error", "academicSessions", row.line, id, "bad-date", "endDate is not an ISO-8601 date (YYYY-MM-DD).")
      );
    }
    if (startDate && endDate && endDate < startDate) {
      diagnostics.push(
        diag("error", "academicSessions", row.line, id, "term-inverted", "endDate falls before startDate.")
      );
    }
    bundle.academicSessions.push({
      sourcedId: id,
      status: readStatus(pick(row, "status")),
      title: pick(row, "title").trim(),
      type,
      startDate,
      endDate,
      schoolYear: pick(row, "schoolYear").trim(),
      parentSourcedId: pick(row, "parentSourcedId").trim()
    });
  }

  // courses
  for (const row of rowsOf("courses")) {
    const id = requireId("courses", row);
    if (!id || !dedupe("courses", id, row.line)) continue;
    bundle.courses.push({
      sourcedId: id,
      status: readStatus(pick(row, "status")),
      title: pick(row, "title").trim(),
      courseCode: pick(row, "courseCode").trim(),
      orgSourcedId: pick(row, "orgSourcedId", "schoolSourcedId").trim(),
      grades: splitList(pick(row, "grades")),
      subjects: splitList(pick(row, "subjects"))
    });
  }

  // classes
  for (const row of rowsOf("classes")) {
    const id = requireId("classes", row);
    if (!id || !dedupe("classes", id, row.line)) continue;
    const title = pick(row, "title").trim();
    if (!title) diagnostics.push(diag("error", "classes", row.line, id, "missing-title", "Class title is required."));
    const school = pick(row, "schoolSourcedId").trim();
    if (!school) {
      diagnostics.push(diag("error", "classes", row.line, id, "missing-school", "schoolSourcedId is required on a class."));
    }
    bundle.classes.push({
      sourcedId: id,
      status: readStatus(pick(row, "status")),
      title,
      classCode: pick(row, "classCode").trim(),
      classType: pick(row, "classType").trim() || "scheduled",
      location: pick(row, "location").trim(),
      courseSourcedId: pick(row, "courseSourcedId").trim(),
      schoolSourcedId: school,
      termSourcedIds: splitList(pick(row, "termSourcedIds", "termSourcedId")),
      grades: splitList(pick(row, "grades")),
      subjects: splitList(pick(row, "subjects")),
      periods: splitList(pick(row, "periods"))
    });
  }

  // users
  for (const row of rowsOf("users")) {
    const id = requireId("users", row);
    if (!id || !dedupe("users", id, row.line)) continue;
    const rawRole = pick(row, "role").trim().toLowerCase();
    const ROLES: UserRole[] = ["student", "teacher", "administrator", "aide", "guardian", "parent", "relative", "proctor"];
    const role = (ROLES as string[]).includes(rawRole) ? (rawRole as UserRole) : "student";
    if (rawRole && role !== rawRole) {
      diagnostics.push(
        diag("warning", "users", row.line, id, "unknown-role", `Unrecognised user role "${rawRole}"; treated as student.`)
      );
    }
    const given = pick(row, "givenName").trim();
    const family = pick(row, "familyName").trim();
    if (!given && !family) {
      diagnostics.push(diag("error", "users", row.line, id, "missing-name", "A user needs givenName or familyName."));
    }
    const email = pick(row, "email").trim();
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      diagnostics.push(diag("warning", "users", row.line, id, "bad-email", `"${email}" is not a valid email address.`));
    }
    bundle.users.push({
      sourcedId: id,
      status: readStatus(pick(row, "status")),
      enabledUser: readBool(pick(row, "enabledUser"), true),
      role,
      username: pick(row, "username").trim(),
      givenName: given,
      familyName: family,
      email,
      identifier: pick(row, "identifier").trim(),
      orgSourcedIds: splitList(pick(row, "orgSourcedIds", "orgSourcedId")),
      grades: splitList(pick(row, "grades"))
    });
  }

  // enrollments
  for (const row of rowsOf("enrollments")) {
    const id = requireId("enrollments", row);
    if (!id || !dedupe("enrollments", id, row.line)) continue;
    const rawRole = pick(row, "role").trim().toLowerCase();
    const role: EnrollmentRole = rawRole === "teacher" ? "teacher" : "student";
    if (rawRole && rawRole !== "teacher" && rawRole !== "student") {
      diagnostics.push(
        diag(
          "warning",
          "enrollments",
          row.line,
          id,
          "unknown-enrollment-role",
          `Unrecognised enrollment role "${rawRole}"; treated as student.`
        )
      );
    }
    const cls = pick(row, "classSourcedId").trim();
    const user = pick(row, "userSourcedId").trim();
    if (!cls) {
      diagnostics.push(diag("error", "enrollments", row.line, id, "missing-class", "classSourcedId is required."));
    }
    if (!user) {
      diagnostics.push(diag("error", "enrollments", row.line, id, "missing-user", "userSourcedId is required."));
    }
    bundle.enrollments.push({
      sourcedId: id,
      status: readStatus(pick(row, "status")),
      classSourcedId: cls,
      schoolSourcedId: pick(row, "schoolSourcedId").trim(),
      userSourcedId: user,
      role,
      primary: readBool(pick(row, "primary"), false),
      beginDate: normalizeDate(pick(row, "beginDate")),
      endDate: normalizeDate(pick(row, "endDate"))
    });
  }

  for (const f of ONEROSTER_FILES) {
    if (files[f] === undefined) {
      diagnostics.push(diag("warning", f, 0, "", "file-absent", `${f}.csv was not supplied; nothing from it will change.`));
    }
  }

  return { bundle, diagnostics: sortDiagnostics(diagnostics) };
}

// ── Referential integrity ───────────────────────────────────────────────────

/**
 * Cross-file checks that a per-row parse cannot see. Only rows that would
 * actually be APPLIED are checked: a `tobedeleted` enrollment pointing at a
 * class that is also being deleted is not an error, it is a tidy export.
 */
export function checkReferences(bundle: OneRosterBundle): Diagnostic[] {
  const out: Diagnostic[] = [];
  const liveOrgs = new Set(bundle.orgs.filter((o) => o.status === "active").map((o) => o.sourcedId));
  const liveSessions = new Set(bundle.academicSessions.filter((s) => s.status === "active").map((s) => s.sourcedId));
  const liveCourses = new Set(bundle.courses.filter((c) => c.status === "active").map((c) => c.sourcedId));
  const liveClasses = new Set(bundle.classes.filter((c) => c.status === "active").map((c) => c.sourcedId));
  const liveUsers = new Set(bundle.users.filter((u) => u.status === "active").map((u) => u.sourcedId));

  // Orgs: parent must exist, and the hierarchy must not contain a cycle.
  const parentOf = new Map(bundle.orgs.map((o) => [o.sourcedId, o.parentSourcedId]));
  for (const org of bundle.orgs) {
    if (org.status !== "active") continue;
    if (org.parentSourcedId && !liveOrgs.has(org.parentSourcedId)) {
      out.push(
        diag("error", "orgs", 0, org.sourcedId, "dangling-parent", `parentSourcedId "${org.parentSourcedId}" is not an active org.`)
      );
      continue;
    }
    const walked = new Set<string>([org.sourcedId]);
    let cursor = org.parentSourcedId;
    while (cursor) {
      if (walked.has(cursor)) {
        out.push(diag("error", "orgs", 0, org.sourcedId, "org-cycle", "Org hierarchy contains a cycle."));
        break;
      }
      walked.add(cursor);
      cursor = parentOf.get(cursor) ?? "";
    }
  }

  for (const c of bundle.courses) {
    if (c.status !== "active") continue;
    if (c.orgSourcedId && !liveOrgs.has(c.orgSourcedId)) {
      out.push(diag("error", "courses", 0, c.sourcedId, "dangling-org", `orgSourcedId "${c.orgSourcedId}" is not an active org.`));
    }
  }

  for (const c of bundle.classes) {
    if (c.status !== "active") continue;
    if (c.schoolSourcedId && !liveOrgs.has(c.schoolSourcedId)) {
      out.push(
        diag("error", "classes", 0, c.sourcedId, "dangling-school", `schoolSourcedId "${c.schoolSourcedId}" is not an active org.`)
      );
    }
    if (c.courseSourcedId && !liveCourses.has(c.courseSourcedId)) {
      out.push(
        diag("warning", "classes", 0, c.sourcedId, "dangling-course", `courseSourcedId "${c.courseSourcedId}" is not an active course.`)
      );
    }
    for (const t of c.termSourcedIds) {
      if (!liveSessions.has(t)) {
        out.push(
          diag("warning", "classes", 0, c.sourcedId, "dangling-term", `termSourcedId "${t}" is not an active academic session.`)
        );
      }
    }
  }

  for (const u of bundle.users) {
    if (u.status !== "active") continue;
    for (const o of u.orgSourcedIds) {
      if (!liveOrgs.has(o)) {
        out.push(diag("warning", "users", 0, u.sourcedId, "dangling-org", `orgSourcedId "${o}" is not an active org.`));
      }
    }
  }

  const pairSeen = new Set<string>();
  for (const e of bundle.enrollments) {
    if (e.status !== "active") continue;
    if (e.classSourcedId && !liveClasses.has(e.classSourcedId)) {
      out.push(
        diag("error", "enrollments", 0, e.sourcedId, "dangling-class", `classSourcedId "${e.classSourcedId}" is not an active class.`)
      );
    }
    if (e.userSourcedId && !liveUsers.has(e.userSourcedId)) {
      out.push(
        diag("error", "enrollments", 0, e.sourcedId, "dangling-user", `userSourcedId "${e.userSourcedId}" is not an active user.`)
      );
    }
    const key = `${e.classSourcedId}\u0000${e.userSourcedId}\u0000${e.role}`;
    if (pairSeen.has(key)) {
      out.push(
        diag(
          "warning",
          "enrollments",
          0,
          e.sourcedId,
          "duplicate-enrollment",
          `${e.userSourcedId} is enrolled in ${e.classSourcedId} as ${e.role} more than once; the later row wins.`
        )
      );
    }
    pairSeen.add(key);
  }

  // A class with no active teacher is legal OneRoster but a real operational
  // problem: nobody can see that roster in the product. Warn, never block.
  const teacherOf = new Set(
    bundle.enrollments.filter((e) => e.status === "active" && e.role === "teacher").map((e) => e.classSourcedId)
  );
  for (const c of bundle.classes) {
    if (c.status === "active" && !teacherOf.has(c.sourcedId)) {
      out.push(
        diag("warning", "classes", 0, c.sourcedId, "class-without-teacher", `"${c.title}" has no active teacher enrollment.`)
      );
    }
  }

  return sortDiagnostics(out);
}

// ── Import plan ─────────────────────────────────────────────────────────────

export interface ImportPlan {
  orgs: { create: number; update: number; retire: number };
  classes: { create: number; update: number; retire: number };
  learners: { create: number; update: number; retire: number };
  staff: { create: number; update: number; retire: number };
  enrollments: { create: number; update: number; retire: number };
  diagnostics: Diagnostic[];
  /** True when nothing blocks an apply — warnings are fine, errors are not. */
  applicable: boolean;
}

export interface ExistingKeys {
  orgs: ReadonlySet<string>;
  classes: ReadonlySet<string>;
  users: ReadonlySet<string>;
  enrollments: ReadonlySet<string>;
}

export function emptyExisting(): ExistingKeys {
  return { orgs: new Set(), classes: new Set(), users: new Set(), enrollments: new Set() };
}

/** Learners and staff are counted separately: a district cares about both numbers. */
const isLearner = (u: OrUser) => u.role === "student";

/**
 * What an apply WOULD do, given what already exists. Pure, so the dry run and
 * the real run cannot drift apart: the apply step calls this first and refuses
 * when `applicable` is false.
 */
export function planImport(bundle: OneRosterBundle, existing: ExistingKeys = emptyExisting()): ImportPlan {
  const tally = () => ({ create: 0, update: 0, retire: 0 });
  const plan: ImportPlan = {
    orgs: tally(),
    classes: tally(),
    learners: tally(),
    staff: tally(),
    enrollments: tally(),
    diagnostics: [],
    applicable: false
  };

  const count = (
    bucket: { create: number; update: number; retire: number },
    id: string,
    status: OrStatus,
    known: ReadonlySet<string>
  ) => {
    if (status === "tobedeleted") bucket.retire += known.has(id) ? 1 : 0;
    else if (known.has(id)) bucket.update += 1;
    else bucket.create += 1;
  };

  for (const o of bundle.orgs) count(plan.orgs, o.sourcedId, o.status, existing.orgs);
  for (const c of bundle.classes) count(plan.classes, c.sourcedId, c.status, existing.classes);
  for (const u of bundle.users) count(isLearner(u) ? plan.learners : plan.staff, u.sourcedId, u.status, existing.users);
  for (const e of bundle.enrollments) count(plan.enrollments, e.sourcedId, e.status, existing.enrollments);

  plan.diagnostics = checkReferences(bundle);
  plan.applicable = !plan.diagnostics.some((d) => d.severity === "error");
  return plan;
}

/** Merge parse diagnostics into a plan (the route reports one combined list). */
export function withParseDiagnostics(plan: ImportPlan, parseDiagnostics: Diagnostic[]): ImportPlan {
  const diagnostics = sortDiagnostics([...parseDiagnostics, ...plan.diagnostics]);
  return { ...plan, diagnostics, applicable: !diagnostics.some((d) => d.severity === "error") };
}

// ── Export ──────────────────────────────────────────────────────────────────

const ORG_HEADERS = ["sourcedId", "status", "dateLastModified", "name", "type", "identifier", "parentSourcedId"] as const;
const CLASS_HEADERS = [
  "sourcedId",
  "status",
  "dateLastModified",
  "title",
  "grades",
  "courseSourcedId",
  "classCode",
  "classType",
  "location",
  "schoolSourcedId",
  "termSourcedIds",
  "subjects",
  "periods"
] as const;
const USER_HEADERS = [
  "sourcedId",
  "status",
  "dateLastModified",
  "enabledUser",
  "orgSourcedIds",
  "role",
  "username",
  "givenName",
  "familyName",
  "identifier",
  "email",
  "grades"
] as const;
const ENROLLMENT_HEADERS = [
  "sourcedId",
  "status",
  "dateLastModified",
  "classSourcedId",
  "schoolSourcedId",
  "userSourcedId",
  "role",
  "primary",
  "beginDate",
  "endDate"
] as const;

/**
 * Emit a bundle back out as v1.1 CSV. Round-tripping matters for two real
 * workflows: handing a district a copy of what we believe their roster is, and
 * regression-testing the parser against its own output.
 */
export function exportBundle(bundle: OneRosterBundle, dateLastModified: string): Partial<Record<OneRosterFile, string>> {
  const list = (v: string[]) => v.join(",");
  return {
    orgs: toCsv(
      ORG_HEADERS,
      bundle.orgs.map((o) => ({ ...o, dateLastModified }))
    ),
    classes: toCsv(
      CLASS_HEADERS,
      bundle.classes.map((c) => ({
        ...c,
        dateLastModified,
        grades: list(c.grades),
        subjects: list(c.subjects),
        periods: list(c.periods),
        termSourcedIds: list(c.termSourcedIds)
      }))
    ),
    users: toCsv(
      USER_HEADERS,
      bundle.users.map((u) => ({
        ...u,
        dateLastModified,
        enabledUser: u.enabledUser ? "true" : "false",
        orgSourcedIds: list(u.orgSourcedIds),
        grades: list(u.grades)
      }))
    ),
    enrollments: toCsv(
      ENROLLMENT_HEADERS,
      bundle.enrollments.map((e) => ({ ...e, dateLastModified, primary: e.primary ? "true" : "false" }))
    )
  };
}
