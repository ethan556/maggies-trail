/**
 * /api/institution — org tree, staff, and provisioning for admins.
 *
 *   GET                              → orgs the caller administers (+ nothing for learners)
 *   GET  ?orgId=…&staff=1            → staff roster for one org (admin of it only)
 *   POST {op:"create-district", name}                  → platform-admin only
 *   POST {op:"create-school", districtOrgId, name}     → district admins
 *   POST {op:"add-staff", orgId, email, role}          → admins of that org
 *
 * Authorization is never taken from the body: every service call re-derives it
 * from the session against the org rows. One "forbidden" shape for every denial.
 */
import { NextRequest, NextResponse } from "next/server";
import { tryGetDb } from "@/server/db";
import { rateLimit, sessionFor } from "@/server/authService";
import { SESSION_COOKIE, readJson } from "@/server/http";
import { addStaff, createDistrict, createSchool, orgsFor, staffOf } from "@/server/institutionService";

const NO_DB = () =>
  NextResponse.json({ error: "unavailable", reason: "no durable database on this deployment" }, { status: 503 });

type Body =
  | { op: "create-district"; name?: string }
  | { op: "create-school"; districtOrgId?: string; name?: string }
  | { op: "add-staff"; orgId?: string; email?: string; role?: "teacher" | "administrator" };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(req: NextRequest) {
  const db = tryGetDb();
  if (!db) return NO_DB();
  const session = sessionFor(db, req.cookies.get(SESSION_COOKIE)?.value ?? null);
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const orgId = req.nextUrl.searchParams.get("orgId");
  if (orgId && req.nextUrl.searchParams.get("staff")) {
    if (orgId.length > 200) return NextResponse.json({ error: "invalid" }, { status: 400 });
    const staff = staffOf(db, session, orgId);
    if ("error" in staff) return NextResponse.json(staff, { status: 403 });
    return NextResponse.json({ staff });
  }
  return NextResponse.json({ orgs: orgsFor(db, session) });
}

export async function POST(req: NextRequest) {
  const db = tryGetDb();
  if (!db) return NO_DB();
  const session = sessionFor(db, req.cookies.get(SESSION_COOKIE)?.value ?? null);
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (!rateLimit(db, `institution:${session.user.id}`, 120, 3600)) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }
  const body = await readJson<Body>(req);
  if (!body) return NextResponse.json({ error: "invalid" }, { status: 400 });

  if (body.op === "create-district") {
    const name = body.name?.trim();
    if (!name || name.length > 200) return NextResponse.json({ error: "valid name required" }, { status: 400 });
    const r = createDistrict(db, session, name);
    if ("error" in r) return NextResponse.json(r, { status: 403 });
    return NextResponse.json(r);
  }
  if (body.op === "create-school") {
    const name = body.name?.trim();
    if (!body.districtOrgId || !name || name.length > 200) {
      return NextResponse.json({ error: "valid name required" }, { status: 400 });
    }
    const r = createSchool(db, session, body.districtOrgId, name);
    if ("error" in r) return NextResponse.json(r, { status: r.error === "forbidden" ? 403 : 400 });
    return NextResponse.json(r);
  }
  if (body.op === "add-staff") {
    const email = body.email?.trim().toLowerCase();
    if (!body.orgId || !email || !EMAIL.test(email) || email.length > 254) {
      return NextResponse.json({ error: "valid email required" }, { status: 400 });
    }
    if (body.role !== "teacher" && body.role !== "administrator") {
      return NextResponse.json({ error: "invalid role" }, { status: 400 });
    }
    const r = addStaff(db, session, body.orgId, email, body.role);
    if ("error" in r) return NextResponse.json(r, { status: 403 });
    return NextResponse.json(r);
  }
  return NextResponse.json({ error: "unknown op" }, { status: 400 });
}
