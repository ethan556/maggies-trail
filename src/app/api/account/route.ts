/** DELETE /api/account — the whole account, cascading: user → learners →
 * profiles → sessions. The audit row survives as the record that it happened.
 * Requires a full (non-learner) session; the cookie is cleared in the same
 * response so the deleted session cannot linger client-side. */
import { NextRequest, NextResponse } from "next/server";
import { tryGetDb } from "@/server/db";
import { deleteAccount, sessionFor } from "@/server/authService";
import { clearSessionCookie, SESSION_COOKIE } from "@/server/http";

/** 503, not 500: no durable database on this host is a capability gap, not a request fault.
 *  The clients treat this as "stay device-local" — the learner core needs no database at all. */
const NO_DB = () =>
  NextResponse.json({ error: "unavailable", reason: "no durable database on this deployment" }, { status: 503 });

export async function DELETE(req: NextRequest) {
  const db = tryGetDb();
  if (!db) return NO_DB();
  const session = sessionFor(db, req.cookies.get(SESSION_COOKIE)?.value ?? null);
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (session.learnerId) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  deleteAccount(db, session.user.id);
  return clearSessionCookie(NextResponse.json({ ok: true }));
}
