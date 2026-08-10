import { NextRequest, NextResponse } from "next/server";
import { tryGetDb } from "@/server/db";
import { authSecretsReady, rateLimit, signup } from "@/server/authService";
import { clientIp, readJson } from "@/server/http";

/** 503, not 500: no durable database on this host is a capability gap, not a request fault.
 *  The clients treat this as "stay device-local" — the learner core needs no database at all. */
const NO_DB = () =>
  NextResponse.json({ error: "unavailable", reason: "no durable database on this deployment" }, { status: 503 });

export async function POST(req: NextRequest) {
  if (!authSecretsReady()) return NextResponse.json({ error: "auth unavailable", reason: "AUTH_PEPPER is not configured" }, { status: 503 });
  const db = tryGetDb();
  if (!db) return NO_DB();
  if (!rateLimit(db, `signup:${clientIp(req)}`, 10, 3600)) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }
  const { email, password, role } = (await readJson<{ email?: string; password?: string; role?: string }>(req)) ?? {};
  const normalized = email?.trim().toLowerCase();
  if (!normalized || normalized.length > 320 || !/.+@.+\..+/.test(normalized) || !password || password.length < 8 || password.length > 256) {
    return NextResponse.json({ error: "email and a password of 8+ characters required" }, { status: 400 });
  }
  if (!rateLimit(db, `signup-email:${normalized}`, 5, 3600)) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }
  // Same 200 whether the email is new or known — see authService.signup.
  return NextResponse.json(signup(db, normalized, password, role === "teacher" ? "teacher" : "parent"));
}
