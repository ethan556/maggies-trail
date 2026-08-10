/**
 * /api/messages — cross-role threads between families, staff and learners.
 *
 *   GET                       → the caller's threads (participant rows only)
 *   GET ?threadId=…           → one thread's messages; marks it read
 *   GET ?op=reach             → who the caller may open a conversation with
 *   POST {op:"create", …}     → new thread; every recipient reach-checked
 *   POST {op:"post", …}       → reply; reach re-checked
 *
 * There is no role branch anywhere in this file. Authorisation is entirely the
 * service's, computed from rows, so the route cannot accidentally widen it —
 * and a `not-found` from a non-participant is returned as 404 so thread
 * existence never leaks through a status code.
 */
import { NextRequest, NextResponse } from "next/server";
import { tryGetDb } from "@/server/db";
import { rateLimit, sessionFor } from "@/server/authService";
import { createThread, listThreads, postMessage, readThread, reachableFrom, sessionPrincipal, type Principal } from "@/server/messagingService";
import { SESSION_COOKIE, readJson } from "@/server/http";

const NO_DB = () =>
  NextResponse.json({ error: "unavailable", reason: "no durable database on this deployment" }, { status: 503 });

const STATUS = { forbidden: 403, "not-found": 404, invalid: 400 } as const;

/** Recipients arrive as untrusted JSON; accept only the exact principal shape. */
function parseRecipients(raw: unknown): Principal[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 20) return null;
  const out: Principal[] = [];
  for (const r of raw) {
    if (!r || typeof r !== "object") return null;
    const { type, id } = r as { type?: unknown; id?: unknown };
    if ((type !== "user" && type !== "learner") || typeof id !== "string" || !id || id.length > 200) return null;
    out.push({ type, id });
  }
  return out;
}

export async function GET(req: NextRequest) {
  const db = tryGetDb();
  if (!db) return NO_DB();
  const session = sessionFor(db, req.cookies.get(SESSION_COOKIE)?.value ?? null);
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  if (req.nextUrl.searchParams.get("op") === "reach") {
    return NextResponse.json({ reach: reachableFrom(db, sessionPrincipal(session)) });
  }
  const threadId = req.nextUrl.searchParams.get("threadId");
  if (threadId) {
    if (threadId.length > 200) return NextResponse.json({ error: "invalid" }, { status: 400 });
    const r = readThread(db, session, threadId);
    if ("error" in r) return NextResponse.json(r, { status: STATUS[r.error] });
    return NextResponse.json(r);
  }
  return NextResponse.json({ threads: listThreads(db, session) });
}

export async function POST(req: NextRequest) {
  const db = tryGetDb();
  if (!db) return NO_DB();
  const session = sessionFor(db, req.cookies.get(SESSION_COOKIE)?.value ?? null);
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const body = await readJson<{ op?: string; subject?: string; to?: unknown; body?: string; threadId?: string }>(req);
  if (!body) return NextResponse.json({ error: "invalid" }, { status: 400 });

  // Per-principal, not per-IP: a shared family device must not rate-limit a
  // sibling out of asking their teacher a question.
  const principal = sessionPrincipal(session);
  if (!rateLimit(db, `msg:${principal.type}:${principal.id}`, 60, 3600)) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }

  if (body.op === "create") {
    const to = parseRecipients(body.to);
    if (!to || typeof body.subject !== "string" || typeof body.body !== "string") {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    const r = createThread(db, session, { subject: body.subject, to, body: body.body });
    if ("error" in r) return NextResponse.json(r, { status: STATUS[r.error] });
    return NextResponse.json(r);
  }
  if (body.op === "post") {
    if (typeof body.threadId !== "string" || body.threadId.length > 200 || typeof body.body !== "string") {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    const r = postMessage(db, session, body.threadId, body.body);
    if ("error" in r) return NextResponse.json(r, { status: STATUS[r.error] });
    return NextResponse.json(r);
  }
  return NextResponse.json({ error: "unknown op" }, { status: 400 });
}
