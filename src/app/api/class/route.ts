/**
 * /api/class — cross-device classrooms over the durable tables.
 *
 *   POST {op:"create", name}            → teacher-only; returns {classId, joinCode}
 *   POST {op:"join", code, learnerId}   → touch-rights required; idempotent;
 *                                         rate-limited per IP so codes can't be guessed
 *   GET  ?classId=…                     → the owning teacher's roster (joiners only)
 *   GET                                 → the teacher's classes with member counts
 *
 * One "invalid" shape for unknown codes and forbidden learners alike; role
 * and ownership derive from rows via the session cookie, never the body.
 */
import { NextRequest, NextResponse } from "next/server";
import { tryGetDb } from "@/server/db";
import { rateLimit, sessionFor } from "@/server/authService";
import { classRoster, createClass, joinClass, myClasses } from "@/server/classService";
import { clientIp, SESSION_COOKIE, readJson } from "@/server/http";

/** 503, not 500: the deployment has no durable database, which is a host capability gap rather
 *  than a fault in the request. The teach client treats this as "stay device-local" and carries
 *  on, so the classroom still works — it just doesn't follow the teacher to another device. */
const NO_DB = () =>
  NextResponse.json({ error: "unavailable", reason: "no durable database on this deployment" }, { status: 503 });

export async function POST(req: NextRequest) {
  const db = tryGetDb();
  if (!db) return NO_DB();
  const session = sessionFor(db, req.cookies.get(SESSION_COOKIE)?.value ?? null);
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const body = await readJson<{ op: "create" | "join"; name?: string; code?: string; learnerId?: string }>(req);
  if (!body) return NextResponse.json({ error: "invalid" }, { status: 400 });

  if (body.op === "create") {
    if (!rateLimit(db, `class-create:${session.user.id}`, 30, 3600)) {
      return NextResponse.json({ error: "rate-limited" }, { status: 429 });
    }
    const name = body.name?.trim();
    if (!name || name.length > 100) return NextResponse.json({ error: "valid name required" }, { status: 400 });
    const r = createClass(db, session, name);
    if ("error" in r) return NextResponse.json(r, { status: 403 });
    return NextResponse.json(r);
  }
  if (body.op === "join") {
    if (!rateLimit(db, `classjoin:${clientIp(req)}`, 20, 300)) {
      return NextResponse.json({ error: "rate-limited" }, { status: 429 });
    }
    const code = body.code?.trim().toUpperCase();
    if (!code || !/^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/.test(code) || !body.learnerId || body.learnerId.length > 200) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    if (!rateLimit(db, `classjoin-code:${code}`, 120, 3600)) {
      return NextResponse.json({ error: "rate-limited" }, { status: 429 });
    }
    const r = joinClass(db, session, code, body.learnerId);
    if ("error" in r) return NextResponse.json(r, { status: 400 });
    return NextResponse.json(r);
  }
  return NextResponse.json({ error: "unknown op" }, { status: 400 });
}

export async function GET(req: NextRequest) {
  const db = tryGetDb();
  if (!db) return NO_DB();
  const session = sessionFor(db, req.cookies.get(SESSION_COOKIE)?.value ?? null);
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const classId = req.nextUrl.searchParams.get("classId");
  if (classId && classId.length > 200) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const r = classId ? classRoster(db, session, classId) : myClasses(db, session);
  if ("error" in r) return NextResponse.json(r, { status: 403 });
  return NextResponse.json(r);
}
