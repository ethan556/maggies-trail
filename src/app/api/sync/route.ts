/**
 * /api/sync — durable, authenticated, idempotent.
 *
 * The protocol is the one the client always spoke (pull → merge → push →
 * adopt); the backend is now the real database and the AUTHORITY is the
 * session cookie: the learner id comes from the URL, but the RIGHT to touch
 * it comes from rows (`canTouchLearner`). The request body's accountId — the
 * old demo's trust hole — is gone.
 *
 * CSRF stance: HttpOnly SameSite=Lax cookie + JSON-only POST bodies, no
 * cross-origin API surface. Idempotency: the `x-idempotency-key` header
 * replays byte-identically. Rate limit: per-session bucket, generous — sync
 * is chatty by design, abuse is not.
 */
import { NextRequest, NextResponse } from "next/server";
import { tryGetDb } from "@/server/db";
import { rateLimit, sessionFor } from "@/server/authService";
import { pullProfile, pushProfile } from "@/server/syncService";
import { isSyncedProfile, type SyncedProfile } from "@/lib/sync";
import { SESSION_COOKIE, readJson } from "@/server/http";

/** 503, not 500: no durable database on this host is a capability gap, not a request fault.
 *  The clients treat this as "stay device-local" — the learner core needs no database at all. */
const NO_DB = () =>
  NextResponse.json({ error: "unavailable", reason: "no durable database on this deployment" }, { status: 503 });

export async function GET(req: NextRequest) {
  const db = tryGetDb();
  if (!db) return NO_DB();
  const session = sessionFor(db, req.cookies.get(SESSION_COOKIE)?.value ?? null);
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const learnerId = req.nextUrl.searchParams.get("learnerId") ?? req.nextUrl.searchParams.get("childId");
  if (!learnerId || learnerId.length > 200) return NextResponse.json({ error: "valid learnerId required" }, { status: 400 });
  const r = pullProfile(db, session, learnerId);
  if ("error" in r) return NextResponse.json(r, { status: r.error === "forbidden" ? 403 : 500 });
  return NextResponse.json({ profile: r.profile ?? null, rev: r.version });
}

export async function POST(req: NextRequest) {
  const declaredSize = Number(req.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredSize) && declaredSize > 2_000_000) {
    return NextResponse.json({ error: "profile too large" }, { status: 413 });
  }
  const db = tryGetDb();
  if (!db) return NO_DB();
  const session = sessionFor(db, req.cookies.get(SESSION_COOKIE)?.value ?? null);
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (!rateLimit(db, `sync:${session.user.id}`, 240, 60)) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }
  const body = await readJson<{ learnerId?: string; childId?: string; profile: SyncedProfile }>(req, 2_000_000);
  if (!body) return NextResponse.json({ error: "learnerId and profile required" }, { status: 400 });
  const learnerId = body.learnerId ?? body.childId;
  if (!learnerId || !body.profile) return NextResponse.json({ error: "learnerId and profile required" }, { status: 400 });
  if (learnerId.length > 200 || !isSyncedProfile(body.profile)) {
    return NextResponse.json({ error: "invalid profile" }, { status: 422 });
  }
  const r = pushProfile(db, session, learnerId, body.profile, req.headers.get("x-idempotency-key") ?? undefined);
  if ("error" in r) {
    return NextResponse.json(r, { status: r.error === "forbidden" ? 403 : 409 });
  }
  return NextResponse.json({ profile: r.profile, rev: r.version });
}
