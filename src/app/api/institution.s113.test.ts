/**
 * INSTITUTIONAL ROUTES (s113) — the wiring, not the algorithms.
 *
 * The services are unit-proven elsewhere; this pins that the ROUTE handlers
 * consult the session cookie, pass the body through, and map service error
 * shapes to the right status. It walks a realistic path: platform-admin makes
 * a district → school → staff, a teacher authors an assignment, and an
 * outsider is refused at the door.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { migrate, openDb, _setDbForTests, type DB } from "@/server/db";
import { login, signup } from "@/server/authService";
import { SESSION_COOKIE } from "@/server/http";
import { createClass } from "@/server/classService";
import { sessionFor } from "@/server/authService";
import { GET as instGet, POST as instPost } from "@/app/api/institution/route";
import { POST as assignPost, GET as assignGet } from "@/app/api/assignments/route";
import { POST as ivPost, GET as ivGet } from "@/app/api/interventions/route";

let dir: string;
let db: DB;

const asToken = (r: unknown): string => {
  if (r && typeof r === "object" && "token" in r) return (r as { token: string }).token;
  throw new Error(`expected token, got ${JSON.stringify(r)}`);
};

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "maggie-instroute-"));
  db = openDb(join(dir, "t.db"));
  migrate(db);
  _setDbForTests(db);
});
afterEach(() => {
  _setDbForTests(null);
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

function cookieFor(email: string): string {
  return `${SESSION_COOKIE}=${asToken(login(db, email, "pw-one-two"))}`;
}
function platformAdminCookie(email: string): string {
  signup(db, email, "pw-one-two", "parent");
  const id = (db.prepare("SELECT id FROM users WHERE email = ?").get(email) as { id: string }).id;
  db.prepare("UPDATE users SET role = 'platform-admin' WHERE id = ?").run(id);
  return cookieFor(email);
}

const jsonReq = (url: string, cookie: string, body: unknown, method = "POST") =>
  new NextRequest(url, { method, headers: { cookie, "content-type": "application/json" }, body: JSON.stringify(body) });
const getReq = (url: string, cookie: string) => new NextRequest(url, { method: "GET", headers: { cookie } });

describe("institution routes (s113)", () => {
  it("walks district → school → staff and refuses outsiders", async () => {
    const op = platformAdminCookie("op@example.com");
    signup(db, "rando@example.com", "pw-one-two", "parent");
    const outsider = cookieFor("rando@example.com");

    // Unauthenticated → 401.
    const anon = await instGet(new NextRequest("http://t/api/institution"));
    expect(anon.status).toBe(401);

    // Create district (platform-admin) → 200.
    const dRes = await instPost(jsonReq("http://t/api/institution", op, { op: "create-district", name: "Tally Peak USD" }));
    expect(dRes.status).toBe(200);
    const { orgId: districtId } = (await dRes.json()) as { orgId: string };
    expect(districtId).toMatch(/^org_/);

    // Outsider cannot create a district → 403.
    const denied = await instPost(jsonReq("http://t/api/institution", outsider, { op: "create-district", name: "Nope" }));
    expect(denied.status).toBe(403);

    // School under the district.
    const sRes = await instPost(
      jsonReq("http://t/api/institution", op, { op: "create-school", districtOrgId: districtId, name: "Summit Elementary" })
    );
    expect(sRes.status).toBe(200);
    const { orgId: schoolId } = (await sRes.json()) as { orgId: string };

    // A school cannot parent a school → 400 (not-a-district).
    const badSchool = await instPost(
      jsonReq("http://t/api/institution", op, { op: "create-school", districtOrgId: schoolId, name: "Nested" })
    );
    expect(badSchool.status).toBe(400);
    expect((await badSchool.json()).error).toBe("not-a-district");

    // Add a teacher to the school.
    const staffRes = await instPost(
      jsonReq("http://t/api/institution", op, { op: "add-staff", orgId: schoolId, email: "teach@tallypeak.org", role: "teacher" })
    );
    expect(staffRes.status).toBe(200);

    // Bad email → 400 before the service is touched.
    const badEmail = await instPost(
      jsonReq("http://t/api/institution", op, { op: "add-staff", orgId: schoolId, email: "not-an-email", role: "teacher" })
    );
    expect(badEmail.status).toBe(400);

    // The org list reflects both orgs for the admin.
    const listRes = await instGet(getReq("http://t/api/institution", op));
    const { orgs } = (await listRes.json()) as { orgs: Array<{ id: string }> };
    expect(orgs.map((o) => o.id).sort()).toEqual([districtId, schoolId].sort());

    // Staff roster for the school (admin only).
    const staffList = await instGet(getReq(`http://t/api/institution?orgId=${schoolId}&staff=1`, op));
    const { staff } = (await staffList.json()) as { staff: Array<{ email: string }> };
    expect(staff.some((s) => s.email === "teach@tallypeak.org")).toBe(true);
    const staffDenied = await instGet(getReq(`http://t/api/institution?orgId=${schoolId}&staff=1`, outsider));
    expect(staffDenied.status).toBe(403);
  });
});

describe("assignment + intervention routes (s113)", () => {
  it("authors, lists, and guards assignments and cases through the handlers", async () => {
    signup(db, "teacher@example.com", "pw-one-two", "teacher");
    const teacher = cookieFor("teacher@example.com");
    const session = sessionFor(db, asToken(login(db, "teacher@example.com", "pw-one-two")))!;
    const cls = createClass(db, session, "Room 14");
    if ("error" in cls) throw new Error("class create failed");

    // A learner joins so interventions have an enrolled target.
    signup(db, "parent@example.com", "pw-one-two", "parent");
    const parentSession = sessionFor(db, asToken(login(db, "parent@example.com", "pw-one-two")))!;
    const learnerId = (
      db.prepare("SELECT id FROM learners WHERE account_id = ? LIMIT 1").get(parentSession.user.id) as
        | { id: string }
        | undefined
    )?.id;

    // Create a published lesson assignment.
    const createRes = await assignPost(
      jsonReq("http://t/api/assignments", teacher, {
        op: "create",
        classroomId: cls.classId,
        kind: "lesson",
        refId: "kc-01-01",
        publish: true
      })
    );
    expect(createRes.status).toBe(200);
    const { assignmentId } = (await createRes.json()) as { assignmentId: string };
    expect(assignmentId).toMatch(/^a_/);

    // Unknown ref → 400 (unknown-ref).
    const badRef = await assignPost(
      jsonReq("http://t/api/assignments", teacher, { op: "create", classroomId: cls.classId, kind: "lesson", refId: "zz-99-99" })
    );
    expect(badRef.status).toBe(400);
    expect((await badRef.json()).error).toBe("unknown-ref");

    // Teacher lists the class assignments.
    const listRes = await assignGet(getReq(`http://t/api/assignments?classroomId=${cls.classId}`, teacher));
    const { assignments } = (await listRes.json()) as { assignments: unknown[] };
    expect(assignments.length).toBe(1);

    // GET with neither param → 400.
    const noParam = await assignGet(getReq("http://t/api/assignments", teacher));
    expect(noParam.status).toBe(400);

    if (learnerId) {
      // Open an intervention for the enrolled learner.
      // (Enrollment happens on class create for the teacher; the learner must
      //  join to be a student — so this asserts the not-enrolled guard instead.)
      const ivRes = await ivPost(
        jsonReq("http://t/api/interventions", teacher, {
          op: "open",
          learnerId,
          classroomId: cls.classId,
          reason: "Persistent regrouping error",
          conceptTags: ["place-value"],
          tier: 2
        })
      );
      // learner never joined this class → not-enrolled → 400
      expect(ivRes.status).toBe(400);
      expect((await ivRes.json()).error).toBe("not-enrolled");
    }

    // Listing cases for the class is allowed (empty list).
    const ivList = await ivGet(getReq(`http://t/api/interventions?classroomId=${cls.classId}`, teacher));
    expect(ivList.status).toBe(200);
    const { interventions } = (await ivList.json()) as { interventions: unknown[] };
    expect(Array.isArray(interventions)).toBe(true);
  });
});
