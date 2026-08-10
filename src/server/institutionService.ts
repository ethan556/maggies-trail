/**
 * INSTITUTION SERVICE — the org tree, staff membership, and the scope chain.
 *
 * The data model is 005's: `orgs` is a self-referencing tree (district →
 * school), `org_staff` is who works where with what privilege. Authorization
 * extends the s42/s44 stance without changing it — authority derives from
 * MEMBERSHIP ROWS read against the session, never from request bodies:
 *
 *   platform-admin   users.role — operates the product; creates districts.
 *   administrator    org_staff row — administers that org AND everything
 *                    beneath it (a district administrator reaches every
 *                    school; a school administrator reaches one school).
 *   teacher          classrooms.teacher_user_id — owns classes; org_staff
 *                    'teacher' rows record employment, not extra reach.
 *
 * `users.role` stays exactly the 001 CHECK set — "district admin" is
 * deliberately a MEMBERSHIP, not a new role value, so the constraint and
 * every existing role check stay valid. Institutional admin accounts carry
 * role 'school-admin' (the admin account class); their real scope is rows.
 *
 * PROVISIONING is passwordless: an invited teacher/admin gets a users row
 * with pw_hash NULL plus a magic-link mail in the outbox. The account cannot
 * be entered by password until its owner sets one through the existing reset
 * flow. No invented credentials, no defaults. Provisioning an email that
 * already has an account reuses it untouched.
 */

import { randomBytes } from "node:crypto";
import type { DB } from "@/server/db";
import { audit, requestMagicLink, type SessionInfo } from "@/server/authService";

const nowIso = () => new Date().toISOString();
const newId = (p: string) => `${p}_${randomBytes(9).toString("base64url")}`;
const normalizeEmail = (email: string) => email.trim().toLowerCase();

export interface OrgRow {
  id: string;
  parentOrgId: string | null;
  type: "district" | "school";
  name: string;
  externalId: string | null;
  status: "active" | "retired";
}

// ── Scope predicates ────────────────────────────────────────────────────────

export function isPlatformAdmin(session: SessionInfo): boolean {
  return !session.learnerId && session.user.role === "platform-admin";
}

/** The org ids this session administers DIRECTLY (its own org_staff rows). */
function directlyAdministered(db: DB, userId: string): string[] {
  return (
    db
      .prepare("SELECT org_id FROM org_staff WHERE user_id = ? AND role = 'administrator' AND status = 'active'")
      .all(userId) as Array<{ org_id: string }>
  ).map((r) => r.org_id);
}

/** Administration is inherited DOWN the tree: holding an org grants its whole
 * subtree. Implemented as an ancestor walk from the target — bounded by tree
 * depth (two levels today, but written for any depth). */
export function canAdminOrg(db: DB, session: SessionInfo, orgId: string): boolean {
  if (session.learnerId) return false;
  if (isPlatformAdmin(session)) return true;
  const held = new Set(directlyAdministered(db, session.user.id));
  if (held.size === 0) return false;
  let cursor: string | null = orgId;
  for (let depth = 0; cursor && depth < 16; depth++) {
    if (held.has(cursor)) return true;
    const row = db.prepare("SELECT parent_org_id FROM orgs WHERE id = ?").get(cursor) as
      | { parent_org_id: string | null }
      | undefined;
    cursor = row?.parent_org_id ?? null;
  }
  return false;
}

/** The full subtree under one org, root included — the reporting scope. */
export function orgSubtree(db: DB, orgId: string): string[] {
  return (
    db
      .prepare(
        `WITH RECURSIVE sub(id) AS (
           SELECT id FROM orgs WHERE id = ?
           UNION ALL
           SELECT o.id FROM orgs o JOIN sub ON o.parent_org_id = sub.id
         ) SELECT id FROM sub`
      )
      .all(orgId) as Array<{ id: string }>
  ).map((r) => r.id);
}

/** Every org this session can administer, as rows, subtree-expanded and
 * de-duplicated — the /admin console's world view. */
export function orgsFor(db: DB, session: SessionInfo): OrgRow[] {
  if (session.learnerId) return [];
  const select =
    "SELECT id, parent_org_id AS parentOrgId, type, name, external_id AS externalId, status FROM orgs";
  if (isPlatformAdmin(session)) {
    return db.prepare(`${select} ORDER BY type DESC, name, id`).all() as OrgRow[];
  }
  const roots = directlyAdministered(db, session.user.id);
  const ids = new Set<string>();
  for (const root of roots) for (const id of orgSubtree(db, root)) ids.add(id);
  if (ids.size === 0) return [];
  const placeholders = [...ids].map(() => "?").join(",");
  return db
    .prepare(`${select} WHERE id IN (${placeholders}) ORDER BY type DESC, name, id`)
    .all(...ids) as OrgRow[];
}

// ── Org administration ──────────────────────────────────────────────────────

export function createDistrict(
  db: DB,
  session: SessionInfo,
  name: string
): { orgId: string } | { error: "forbidden" } {
  if (!isPlatformAdmin(session)) return { error: "forbidden" };
  const id = newId("org");
  const at = nowIso();
  db.prepare(
    "INSERT INTO orgs (id, parent_org_id, type, name, external_id, external_source, status, created_at, updated_at) VALUES (?,NULL,'district',?,NULL,'manual','active',?,?)"
  ).run(id, name, at, at);
  audit(db, session.user.id, "district-created", id);
  return { orgId: id };
}

export function createSchool(
  db: DB,
  session: SessionInfo,
  districtOrgId: string,
  name: string
): { orgId: string } | { error: "forbidden" | "not-a-district" } {
  if (!canAdminOrg(db, session, districtOrgId)) return { error: "forbidden" };
  const parent = db.prepare("SELECT type FROM orgs WHERE id = ?").get(districtOrgId) as { type: string } | undefined;
  if (parent?.type !== "district") return { error: "not-a-district" };
  const id = newId("org");
  const at = nowIso();
  db.prepare(
    "INSERT INTO orgs (id, parent_org_id, type, name, external_id, external_source, status, created_at, updated_at) VALUES (?,?,'school',?,NULL,'manual','active',?,?)"
  ).run(id, districtOrgId, name, at, at);
  audit(db, session.user.id, "school-created", id);
  return { orgId: id };
}

/** Find-or-provision an account by email. New accounts are passwordless with
 * a magic-link invite in the outbox; existing accounts are reused untouched. */
export function provisionAccount(
  db: DB,
  actorUserId: string,
  email: string,
  role: "teacher" | "school-admin"
): { userId: string; created: boolean } {
  email = normalizeEmail(email);
  const existing = db.prepare("SELECT id FROM users WHERE email = ? AND deleted_at IS NULL").get(email) as
    | { id: string }
    | undefined;
  if (existing) return { userId: existing.id, created: false };
  const id = newId("u");
  db.prepare("INSERT INTO users (id, email, pw_hash, role, created_at) VALUES (?,?,NULL,?,?)").run(
    id,
    email,
    role,
    nowIso()
  );
  requestMagicLink(db, email); // the invite: a sign-in link lands in mail_outbox
  audit(db, actorUserId, "account-provisioned", `${role}:${id}`);
  return { userId: id, created: true };
}

/** Idempotent staff membership; returns the user id it now points at. */
export function addStaff(
  db: DB,
  session: SessionInfo,
  orgId: string,
  email: string,
  role: "teacher" | "administrator",
  externalId: string | null = null
): { userId: string } | { error: "forbidden" } {
  if (!canAdminOrg(db, session, orgId)) return { error: "forbidden" };
  const { userId } = provisionAccount(db, session.user.id, email, role === "administrator" ? "school-admin" : "teacher");
  db.prepare(
    `INSERT INTO org_staff (org_id, user_id, role, external_id, status, created_at) VALUES (?,?,?,?,'active',?)
     ON CONFLICT(org_id, user_id, role) DO UPDATE SET status = 'active', external_id = COALESCE(excluded.external_id, external_id)`
  ).run(orgId, userId, role, externalId, nowIso());
  audit(db, session.user.id, "staff-added", `${orgId}:${role}:${userId}`);
  return { userId };
}

export interface StaffRow {
  userId: string;
  email: string;
  role: "teacher" | "administrator" | "aide";
  status: string;
}

export function staffOf(db: DB, session: SessionInfo, orgId: string): StaffRow[] | { error: "forbidden" } {
  if (!canAdminOrg(db, session, orgId)) return { error: "forbidden" };
  return db
    .prepare(
      `SELECT s.user_id AS userId, u.email, s.role, s.status
       FROM org_staff s JOIN users u ON u.id = s.user_id
       WHERE s.org_id = ? ORDER BY s.role, u.email`
    )
    .all(orgId) as StaffRow[];
}

// ── Managed learners (SIS students) ─────────────────────────────────────────

/** Imported students are LEARNERS (children are not email accounts — the 001
 * stance), attached to a per-school ROSTER-HOLDER account so the learners FK
 * and family semantics stay intact. The holder is passwordless and cannot be
 * signed into; it exists only so managed learners have a valid account_id.
 * Families link their own device identity through the ordinary class join —
 * the two rows coexist on a roster (INSTITUTIONS.md states this plainly). */
export function rosterHolderAccount(db: DB, schoolOrgId: string): string {
  const email = `roster+${schoolOrgId.toLowerCase()}@managed.invalid`;
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as { id: string } | undefined;
  if (existing) return existing.id;
  const id = newId("u");
  db.prepare("INSERT INTO users (id, email, pw_hash, role, created_at) VALUES (?,?,NULL,'parent',?)").run(
    id,
    email,
    nowIso()
  );
  return id;
}
