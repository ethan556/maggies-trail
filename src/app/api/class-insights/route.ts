/**
 * /api/class-insights — the tier dashboard for one classroom.
 *
 *   GET ?classroomId=…  → {tiers, groups, counts, generatedFor}
 *
 * Tiers are recomputed from evidence by the pure intervention module; this
 * route is a read over that projection, gated by the same manage-classroom
 * predicate the assignment and intervention routes use.
 */
import { NextRequest, NextResponse } from "next/server";
import { tryGetDb } from "@/server/db";
import { sessionFor } from "@/server/authService";
import { SESSION_COOKIE } from "@/server/http";
import { classInsights } from "@/server/insightService";

const NO_DB = () =>
  NextResponse.json({ error: "unavailable", reason: "no durable database on this deployment" }, { status: 503 });

export async function GET(req: NextRequest) {
  const db = tryGetDb();
  if (!db) return NO_DB();
  const session = sessionFor(db, req.cookies.get(SESSION_COOKIE)?.value ?? null);
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const classroomId = req.nextUrl.searchParams.get("classroomId");
  if (!classroomId || classroomId.length > 200) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const r = classInsights(db, session, classroomId);
  if ("error" in r) return NextResponse.json(r, { status: 403 });
  return NextResponse.json(r);
}
