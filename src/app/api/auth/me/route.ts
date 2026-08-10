import { NextRequest, NextResponse } from "next/server";
import { tryGetDb } from "@/server/db";
import { sessionFor } from "@/server/authService";
import { SESSION_COOKIE } from "@/server/http";

/** 503, not 500: no durable database on this host is a capability gap, not a request fault.
 *  The clients treat this as "stay device-local" — the learner core needs no database at all. */
const NO_DB = () =>
  NextResponse.json({ error: "unavailable", reason: "no durable database on this deployment" }, { status: 503 });

export async function GET(req: NextRequest) {
  const db = tryGetDb();
  if (!db) return NO_DB();
  const s = sessionFor(db, req.cookies.get(SESSION_COOKIE)?.value ?? null);
  if (!s) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({
    user: { email: s.user.email, role: s.user.role, verified: !!s.user.emailVerifiedAt },
    learnerId: s.learnerId
  });
}
