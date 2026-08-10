/**
 * /api/assignments — teacher authoring + learner assignment lists.
 *
 *   GET  ?classroomId=…   → teacher's assignments with per-status counts
 *   GET  ?learnerId=…     → that learner's published assignments (+ completion)
 *   POST {op:"create", classroomId, kind, refId, …}   → create (draft unless publish)
 *   POST {op:"publish", assignmentId}                 → publish
 *   POST {op:"archive", assignmentId}                 → archive
 *
 * Every service call re-derives management rights from the classroom's owner or
 * org admin chain; the body never asserts authority. Listing recomputes the
 * cached per-learner status first, so a synced completion shows without any
 * assignment-side write.
 */
import { NextRequest, NextResponse } from "next/server";
import { tryGetDb } from "@/server/db";
import { rateLimit, sessionFor } from "@/server/authService";
import { SESSION_COOKIE, readJson } from "@/server/http";
import {
  archiveAssignment,
  createAssignment,
  learnerAssignments,
  listClassAssignments,
  publishAssignment,
  type AssignmentKind
} from "@/server/assignmentService";

const NO_DB = () =>
  NextResponse.json({ error: "unavailable", reason: "no durable database on this deployment" }, { status: 503 });

type Body =
  | {
      op: "create";
      classroomId?: string;
      kind?: AssignmentKind;
      refId?: string;
      title?: string;
      instructions?: string;
      dueDate?: string | null;
      points?: number | null;
      publish?: boolean;
    }
  | { op: "publish"; assignmentId?: string }
  | { op: "archive"; assignmentId?: string };

const status = (e: string) => (e === "forbidden" ? 403 : e === "not-found" ? 404 : 400);

export async function GET(req: NextRequest) {
  const db = tryGetDb();
  if (!db) return NO_DB();
  const session = sessionFor(db, req.cookies.get(SESSION_COOKIE)?.value ?? null);
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const p = req.nextUrl.searchParams;
  const learnerId = p.get("learnerId");
  const classroomId = p.get("classroomId");
  if (learnerId) {
    if (learnerId.length > 200) return NextResponse.json({ error: "invalid" }, { status: 400 });
    const r = learnerAssignments(db, session, learnerId);
    if ("error" in r) return NextResponse.json(r, { status: 403 });
    return NextResponse.json({ assignments: r });
  }
  if (classroomId) {
    if (classroomId.length > 200) return NextResponse.json({ error: "invalid" }, { status: 400 });
    const r = listClassAssignments(db, session, classroomId);
    if ("error" in r) return NextResponse.json(r, { status: 403 });
    return NextResponse.json({ assignments: r });
  }
  return NextResponse.json({ error: "classroomId or learnerId required" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const db = tryGetDb();
  if (!db) return NO_DB();
  const session = sessionFor(db, req.cookies.get(SESSION_COOKIE)?.value ?? null);
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (!rateLimit(db, `assignments:${session.user.id}`, 200, 3600)) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }
  const body = await readJson<Body>(req);
  if (!body) return NextResponse.json({ error: "invalid" }, { status: 400 });

  if (body.op === "create") {
    if (!body.classroomId || (body.kind !== "lesson" && body.kind !== "course") || !body.refId) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    const r = createAssignment(db, session, body.classroomId, {
      kind: body.kind,
      refId: body.refId,
      title: body.title,
      instructions: body.instructions,
      dueDate: body.dueDate ?? null,
      points: body.points ?? null,
      publish: body.publish === true
    });
    if ("error" in r) return NextResponse.json(r, { status: status(r.error) });
    return NextResponse.json(r);
  }
  if (body.op === "publish") {
    if (!body.assignmentId) return NextResponse.json({ error: "invalid" }, { status: 400 });
    const r = publishAssignment(db, session, body.assignmentId);
    if ("error" in r) return NextResponse.json(r, { status: status(r.error) });
    return NextResponse.json(r);
  }
  if (body.op === "archive") {
    if (!body.assignmentId) return NextResponse.json({ error: "invalid" }, { status: 400 });
    const r = archiveAssignment(db, session, body.assignmentId);
    if ("error" in r) return NextResponse.json(r, { status: status(r.error) });
    return NextResponse.json(r);
  }
  return NextResponse.json({ error: "unknown op" }, { status: 400 });
}
