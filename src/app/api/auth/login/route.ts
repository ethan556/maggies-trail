import { NextRequest, NextResponse } from "next/server";
import { tryGetDb } from "@/server/db";
import { authSecretsReady, login, rateLimit } from "@/server/authService";
import { clientIp, withSessionCookie, readJson } from "@/server/http";

/** 503, not 500: no durable database on this host is a capability gap, not a request fault.
 *  The clients treat this as "stay device-local" — the learner core needs no database at all. */
const NO_DB = () =>
  NextResponse.json({ error: "unavailable", reason: "no durable database on this deployment" }, { status: 503 });

export async function POST(req: NextRequest) {
  if (!authSecretsReady()) return NextResponse.json({ error: "auth unavailable", reason: "AUTH_PEPPER is not configured" }, { status: 503 });
  const db = tryGetDb();
  if (!db) return NO_DB();
  const { email, password } = (await readJson<{ email?: string; password?: string }>(req)) ?? {};
  const normalized = email?.trim().toLowerCase();
  if (!normalized || normalized.length > 320 || !password || password.length > 256) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  // Two buckets: per-IP (broad) and per-email (targeted guessing).
  if (!rateLimit(db, `login:${clientIp(req)}`, 30, 900) || !rateLimit(db, `login:${normalized}`, 10, 900)) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }
  const r = login(db, normalized, password);
  if ("error" in r) return NextResponse.json({ error: "invalid" }, { status: 401 });
  return withSessionCookie(NextResponse.json({ ok: true }), r.token);
}
