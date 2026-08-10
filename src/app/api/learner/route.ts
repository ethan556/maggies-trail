/**
 * /api/learner — the child-access endpoints. Children are never email
 * accounts: a parent adds learners; a PIN (set by the parent) unlocks a
 * LEARNER-SCOPED session; export hands back the whole record. Ownership is
 * checked against rows on every call.
 */
import { NextRequest, NextResponse } from "next/server";
import { tryGetDb } from "@/server/db";
import {
  addLearner,
  authSecretsReady,
  canTouchLearner,
  exportLearner,
  rateLimit,
  sessionFor,
  setLearnerPin,
  unlockLearner
} from "@/server/authService";
import { clientIp, SESSION_COOKIE, withSessionCookie, readJson } from "@/server/http";

/** 503, not 500: no durable database on this host is a capability gap, not a request fault.
 *  The clients treat this as "stay device-local" — the learner core needs no database at all. */
const NO_DB = () =>
  NextResponse.json({ error: "unavailable", reason: "no durable database on this deployment" }, { status: 503 });

export async function POST(req: NextRequest) {
  const db = tryGetDb();
  if (!db) return NO_DB();
  const body = await readJson<{
    op: "add" | "set-pin" | "unlock";
    learnerId?: string;
    name?: string;
    grade?: number;
    pin?: string;
  }>(req);
  if (!body) return NextResponse.json({ error: "invalid" }, { status: 400 });

  if (body.op === "unlock") {
    if (!body.learnerId || body.learnerId.length > 200 || !body.pin || !/^\d{4,8}$/.test(body.pin)) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    if (!authSecretsReady()) return NextResponse.json({ error: "auth unavailable", reason: "AUTH_PEPPER is not configured" }, { status: 503 });
    // PIN unlock needs no adult session — it IS the child's sign-in.
    if (
      !rateLimit(db, `unlock-ip:${clientIp(req)}`, 20, 300) ||
      !rateLimit(db, `unlock-learner:${body.learnerId}`, 20, 3600)
    ) {
      return NextResponse.json({ error: "rate-limited" }, { status: 429 });
    }
    const r = unlockLearner(db, body.learnerId, body.pin);
    if (!r) return NextResponse.json({ error: "invalid" }, { status: 401 });
    return withSessionCookie(NextResponse.json({ ok: true, learnerId: body.learnerId }), r.token);
  }

  const session = sessionFor(db, req.cookies.get(SESSION_COOKIE)?.value ?? null);
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (session.learnerId) return NextResponse.json({ error: "forbidden" }, { status: 403 }); // child sessions manage nothing

  if (body.op === "add") {
    if (!rateLimit(db, `learner-add:${session.user.id}`, 30, 3600)) {
      return NextResponse.json({ error: "rate-limited" }, { status: 429 });
    }
    const name = body.name?.trim();
    const grade = body.grade;
    if (!name || name.length > 80 || (grade !== undefined && (!Number.isInteger(grade) || grade < 0 || grade > 13))) {
      return NextResponse.json({ error: "valid name and grade required" }, { status: 400 });
    }
    return NextResponse.json(addLearner(db, session.user.id, name, grade));
  }
  if (body.op === "set-pin") {
    if (!authSecretsReady()) return NextResponse.json({ error: "auth unavailable", reason: "AUTH_PEPPER is not configured" }, { status: 503 });
    if (!body.learnerId || body.learnerId.length > 200 || !body.pin || !/^\d{4,8}$/.test(body.pin)) {
      return NextResponse.json({ error: "learnerId and a 4–8 digit pin required" }, { status: 400 });
    }
    const ok = setLearnerPin(db, session.user.id, body.learnerId, body.pin);
    return NextResponse.json({ ok }, { status: ok ? 200 : 403 });
  }
  return NextResponse.json({ error: "unknown op" }, { status: 400 });
}

/** GET ?learnerId= → the learner-data export (parent or that learner's own session). */
export async function GET(req: NextRequest) {
  const db = tryGetDb();
  if (!db) return NO_DB();
  const session = sessionFor(db, req.cookies.get(SESSION_COOKIE)?.value ?? null);
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const learnerId = req.nextUrl.searchParams.get("learnerId");
  if (!learnerId || learnerId.length > 200) return NextResponse.json({ error: "valid learnerId required" }, { status: 400 });
  if (!canTouchLearner(db, session, learnerId)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return NextResponse.json(exportLearner(db, learnerId));
}
