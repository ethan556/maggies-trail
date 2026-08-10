/**
 * /api/interventions — the human case layer over the pure tier computation.
 *
 *   GET  ?classroomId=…   → cases (open→monitoring→resolved) with notes
 *   POST {op:"open", learnerId, classroomId, reason, conceptTags, tier}
 *   POST {op:"note", interventionId, text}
 *   POST {op:"status", interventionId, status}
 *
 * Management rights ride the classroom predicate; a learner must be actively
 * enrolled to open a case ("not-enrolled"). Tiers themselves are recomputed
 * from evidence elsewhere — this is the record of what a teacher decided to do.
 */
import { NextRequest, NextResponse } from "next/server";
import { tryGetDb } from "@/server/db";
import { rateLimit, sessionFor } from "@/server/authService";
import { SESSION_COOKIE, readJson } from "@/server/http";
import {
  addInterventionNote,
  listInterventions,
  openIntervention,
  setInterventionStatus
} from "@/server/insightService";

const NO_DB = () =>
  NextResponse.json({ error: "unavailable", reason: "no durable database on this deployment" }, { status: 503 });

type Body =
  | { op: "open"; learnerId?: string; classroomId?: string; reason?: string; conceptTags?: unknown; tier?: number }
  | { op: "note"; interventionId?: string; text?: string }
  | { op: "status"; interventionId?: string; status?: "open" | "monitoring" | "resolved" };

const status = (e: string) => (e === "forbidden" ? 403 : 400);

export async function GET(req: NextRequest) {
  const db = tryGetDb();
  if (!db) return NO_DB();
  const session = sessionFor(db, req.cookies.get(SESSION_COOKIE)?.value ?? null);
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const classroomId = req.nextUrl.searchParams.get("classroomId");
  if (!classroomId || classroomId.length > 200) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const r = listInterventions(db, session, classroomId);
  if ("error" in r) return NextResponse.json(r, { status: 403 });
  return NextResponse.json({ interventions: r });
}

export async function POST(req: NextRequest) {
  const db = tryGetDb();
  if (!db) return NO_DB();
  const session = sessionFor(db, req.cookies.get(SESSION_COOKIE)?.value ?? null);
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (!rateLimit(db, `interventions:${session.user.id}`, 200, 3600)) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }
  const body = await readJson<Body>(req);
  if (!body) return NextResponse.json({ error: "invalid" }, { status: 400 });

  if (body.op === "open") {
    const reason = body.reason?.trim();
    const tier = body.tier;
    if (!body.learnerId || !body.classroomId || !reason || (tier !== 1 && tier !== 2 && tier !== 3)) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    const conceptTags = Array.isArray(body.conceptTags)
      ? body.conceptTags.filter((t): t is string => typeof t === "string").slice(0, 8)
      : [];
    const r = openIntervention(db, session, {
      learnerId: body.learnerId,
      classroomId: body.classroomId,
      reason,
      conceptTags,
      tier
    });
    if ("error" in r) return NextResponse.json(r, { status: status(r.error) });
    return NextResponse.json(r);
  }
  if (body.op === "note") {
    const text = body.text?.trim();
    if (!body.interventionId || !text || text.length > 4000) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    const r = addInterventionNote(db, session, body.interventionId, text);
    if ("error" in r) return NextResponse.json(r, { status: 403 });
    return NextResponse.json(r);
  }
  if (body.op === "status") {
    if (!body.interventionId || !["open", "monitoring", "resolved"].includes(body.status ?? "")) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    const r = setInterventionStatus(db, session, body.interventionId, body.status!);
    if ("error" in r) return NextResponse.json(r, { status: 403 });
    return NextResponse.json(r);
  }
  return NextResponse.json({ error: "unknown op" }, { status: 400 });
}
