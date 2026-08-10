import { NextRequest, NextResponse } from "next/server";
import { tryGetDb } from "@/server/db";
import { authSecretsReady, consumePasswordReset, rateLimit, requestPasswordReset } from "@/server/authService";
import { clientIp, readJson } from "@/server/http";

/** 503, not 500: no durable database on this host is a capability gap, not a request fault.
 *  The clients treat this as "stay device-local" — the learner core needs no database at all. */
const NO_DB = () =>
  NextResponse.json({ error: "unavailable", reason: "no durable database on this deployment" }, { status: 503 });

/** POST {email} requests; PUT {token, password} consumes (and revokes all sessions). */
export async function POST(req: NextRequest) {
  const db = tryGetDb();
  if (!db) return NO_DB();
  if (!rateLimit(db, `reset:${clientIp(req)}`, 10, 3600)) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }
  const { email } = (await readJson<{ email?: string }>(req)) ?? {};
  const normalized = email?.trim().toLowerCase();
  if (!normalized || normalized.length > 320) return NextResponse.json({ error: "email required" }, { status: 400 });
  if (!rateLimit(db, `reset-email:${normalized}`, 5, 3600)) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }
  return NextResponse.json(requestPasswordReset(db, normalized));
}

export async function PUT(req: NextRequest) {
  if (!authSecretsReady()) return NextResponse.json({ error: "auth unavailable", reason: "AUTH_PEPPER is not configured" }, { status: 503 });
  const db = tryGetDb();
  if (!db) return NO_DB();
  const { token, password } = (await readJson<{ token?: string; password?: string }>(req)) ?? {};
  if (!token || token.length > 200 || !password || password.length < 8 || password.length > 256) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const ok = consumePasswordReset(db, token, password);
  return NextResponse.json({ ok }, { status: ok ? 200 : 400 });
}
