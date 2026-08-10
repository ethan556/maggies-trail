/**
 * INSTITUTIONS (s113) — the org scope chain and the CSV substrate, proven the
 * s42 way: denials are the enforcement.
 *
 *  · lib/institution/csv survives the real SIS failure modes (quoted commas,
 *    doubled quotes, BOM, CRLF, embedded newlines, ragged rows) and
 *    round-trips through toCsv;
 *  · only a platform-admin creates districts; an org administrator's reach is
 *    their org's SUBTREE and nothing beside it; a school administrator cannot
 *    touch the district; a parent gets nothing;
 *  · provisioning is passwordless (pw_hash NULL) with a magic-link invite in
 *    the outbox, and provisioning an existing email reuses the account with
 *    its password untouched.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { migrate, openDb, type DB } from "@/server/db";
import { login, sessionFor, signup, type SessionInfo } from "@/server/authService";
import { parseCsv, toCsv } from "@/lib/institution/csv";
import {
  addStaff,
  canAdminOrg,
  createDistrict,
  createSchool,
  orgsFor,
  orgSubtree,
  provisionAccount,
  rosterHolderAccount,
  staffOf
} from "@/server/institutionService";

let dir: string;
let db: DB;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "maggie-inst-"));
  db = openDb(join(dir, "t.db"));
  migrate(db);
});
afterEach(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

function account(email: string, role: "parent" | "teacher" = "parent"): SessionInfo {
  signup(db, email, "pw-one-two", role);
  return fresh(email);
}

function fresh(email: string): SessionInfo {
  const r = login(db, email, "pw-one-two");
  if ("error" in r) throw new Error("login failed");
  const s = sessionFor(db, r.token);
  if (!s) throw new Error("no session");
  return s;
}

/** Platform-admin cannot be created through public signup (by design); tests
 * promote a row directly, standing in for the operator's provisioning. */
function platformAdmin(email: string): SessionInfo {
  const s = account(email);
  db.prepare("UPDATE users SET role = 'platform-admin' WHERE id = ?").run(s.user.id);
  return fresh(email);
}

/** A provisioned (passwordless) account acts through a magic-link session; the
 * service layer only reads SessionInfo, so tests construct it from the row. */
function sessionOf(userId: string): SessionInfo {
  const u = db.prepare("SELECT id, email, role FROM users WHERE id = ?").get(userId) as {
    id: string;
    email: string;
    role: "parent" | "teacher" | "school-admin" | "platform-admin";
  };
  return { user: { id: u.id, email: u.email, role: u.role, emailVerifiedAt: null }, learnerId: null };
}

describe("institution csv (s113)", () => {
  it("parses quoted commas, doubled quotes, BOM, CRLF and embedded newlines", () => {
    const text = '\uFEFFsourcedId,name,notes\r\nu1,"Rivera, Maria","says ""hi""\nsecond line"\r\nu2,Plain,\r\n';
    const t = parseCsv(text);
    expect(t.headers).toEqual(["sourcedId", "name", "notes"]);
    expect(t.rows[0].values.name).toBe("Rivera, Maria");
    expect(t.rows[0].values.notes).toBe('says "hi"\nsecond line');
    expect(t.rows[1].values).toEqual({ sourcedId: "u2", name: "Plain", notes: "" });
  });

  it("round-trips through toCsv and reports ragged rows without dropping data", () => {
    const headers = ["name", "notes"];
    const rows = [{ name: 'comma, quote"', notes: "line\nbreak" }];
    const back = parseCsv(toCsv(headers, rows));
    expect(back.headers).toEqual(headers);
    expect(back.rows.map((r) => r.values)).toEqual(rows);
    const ragged = parseCsv("h1,h2\nx,y,SURPLUS\nonly\n");
    expect(ragged.rows[0].extra).toEqual(["SURPLUS"]);
    expect(ragged.rows[1].values).toEqual({ h1: "only", h2: "" });
  });
});

describe("institution scope chain (s113)", () => {
  it("platform-admin creates districts; administration is the subtree, nothing beside it", () => {
    const op = platformAdmin("op@example.com");
    const parent = account("parent@example.com");
    expect(createDistrict(db, parent, "Nope USD")).toEqual({ error: "forbidden" });

    const d = createDistrict(db, op, "Tally Peak USD");
    if ("error" in d) throw new Error("create failed");

    // District administrator: provisioned passwordless, invited by magic link.
    const supt = addStaff(db, op, d.orgId, "supt@tallypeak.org", "administrator");
    if ("error" in supt) throw new Error("add failed");
    const row = db.prepare("SELECT pw_hash, role FROM users WHERE id = ?").get(supt.userId) as {
      pw_hash: string | null;
      role: string;
    };
    expect(row.pw_hash).toBeNull();
    expect(row.role).toBe("school-admin");
    const mail = db.prepare("SELECT purpose FROM mail_outbox WHERE to_email = ?").get("supt@tallypeak.org") as {
      purpose: string;
    };
    expect(mail.purpose).toBe("magic-link");

    // The district admin reaches the district and every school under it…
    const suptSession = sessionOf(supt.userId);
    expect(canAdminOrg(db, suptSession, d.orgId)).toBe(true);
    const school = createSchool(db, suptSession, d.orgId, "Summit Elementary");
    if ("error" in school) throw new Error("school failed");
    expect(canAdminOrg(db, suptSession, school.orgId)).toBe(true);
    expect(orgSubtree(db, d.orgId).sort()).toEqual([d.orgId, school.orgId].sort());

    // …but a second district is out of reach, and a school is not a district.
    const d2 = createDistrict(db, op, "Elsewhere USD");
    if ("error" in d2) throw new Error("create failed");
    expect(canAdminOrg(db, suptSession, d2.orgId)).toBe(false);
    expect(createSchool(db, suptSession, d2.orgId, "Nope Elementary")).toEqual({ error: "forbidden" });
    expect(createSchool(db, suptSession, school.orgId, "Schools cannot parent schools")).toEqual({
      error: "not-a-district"
    });

    // A school administrator holds exactly the school, never the district.
    const principal = addStaff(db, suptSession, school.orgId, "principal@tallypeak.org", "administrator");
    if ("error" in principal) throw new Error("principal failed");
    const prSession = sessionOf(principal.userId);
    expect(canAdminOrg(db, prSession, school.orgId)).toBe(true);
    expect(canAdminOrg(db, prSession, d.orgId)).toBe(false);

    // Listings mirror the chain; staff listing is itself scope-checked.
    expect(orgsFor(db, prSession).map((o) => o.id)).toEqual([school.orgId]);
    expect(orgsFor(db, suptSession).map((o) => o.id).sort()).toEqual([d.orgId, school.orgId].sort());
    const staff = staffOf(db, prSession, school.orgId);
    if ("error" in staff) throw new Error("staff read failed");
    expect(staff.map((s) => s.email)).toContain("principal@tallypeak.org");
    expect(staffOf(db, prSession, d.orgId)).toEqual({ error: "forbidden" });
  });

  it("provisioning an existing email reuses the account untouched; the roster holder cannot sign in", () => {
    const op = platformAdmin("op2@example.com");
    const d = createDistrict(db, op, "Reuse USD");
    if ("error" in d) throw new Error("create failed");
    const school = createSchool(db, op, d.orgId, "Summit");
    if ("error" in school) throw new Error("school failed");

    const teacher = account("ms.rivera@example.com", "teacher");
    const r = addStaff(db, fresh("op2@example.com"), school.orgId, "MS.Rivera@Example.com", "teacher");
    if ("error" in r) throw new Error("add failed");
    expect(r.userId).toBe(teacher.user.id); // normalized email matched — no new row
    const pw = db.prepare("SELECT pw_hash FROM users WHERE id = ?").get(teacher.user.id) as { pw_hash: string | null };
    expect(pw.pw_hash).not.toBeNull(); // password untouched

    // provisionAccount is idempotent too (used directly by the roster apply).
    const again = provisionAccount(db, op.user.id, "ms.rivera@example.com", "teacher");
    expect(again).toEqual({ userId: teacher.user.id, created: false });

    // Managed-learner holder: one per school, passwordless, login refused.
    const holder = rosterHolderAccount(db, school.orgId);
    expect(rosterHolderAccount(db, school.orgId)).toBe(holder);
    const holderRow = db.prepare("SELECT email, pw_hash FROM users WHERE id = ?").get(holder) as {
      email: string;
      pw_hash: string | null;
    };
    expect(holderRow.pw_hash).toBeNull();
    expect(login(db, holderRow.email, "anything-at-all")).toEqual({ error: "invalid" });
  });
});
