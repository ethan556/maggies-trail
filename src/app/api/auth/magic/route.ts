import { NextRequest, NextResponse } from "next/server";
import { tryGetDb } from "@/server/db";
import { consumeMagicLink, rateLimit, requestMagicLink } from "@/server/authService";
import { clientIp, withSessionCookie, readJson } from "@/server/http";

/** 503, not 500: no durable database on this host is a capability gap, not a request fault. */
const NO_DB = () =>
  NextResponse.json({ error: "unavailable", reason: "no durable database on this deployment" }, { status: 503 });

/** POST {email} requests a link. The link lands on /magic and requires an
 * explicit button press; mail scanners can safely preview it without consuming
 * the single-use token. PUT {token} performs the actual sign-in. */
export async function POST(req: NextRequest) {
  const db = tryGetDb();
  if (!db) return NO_DB();
  if (!rateLimit(db, `magic:${clientIp(req)}`, 10, 3600)) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }
  const { email } = (await readJson<{ email?: string }>(req)) ?? {};
  const normalized = email?.trim().toLowerCase();
  if (!normalized || normalized.length > 320) return NextResponse.json({ error: "email required" }, { status: 400 });
  if (!rateLimit(db, `magic-email:${normalized}`, 5, 3600)) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }
  return NextResponse.json(requestMagicLink(db, normalized));
}

export async function PUT(req: NextRequest) {
  const db = tryGetDb();
  if (!db) return NO_DB();
  if (!rateLimit(db, `magic-consume:${clientIp(req)}`, 30, 3600)) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }
  const { token } = (await readJson<{ token?: string }>(req)) ?? {};
  const result = token && token.length <= 200 ? consumeMagicLink(db, token) : null;
  if (!result) return NextResponse.json({ error: "invalid" }, { status: 400 });
  return withSessionCookie(NextResponse.json({ ok: true }), result.token);
}

/** Backward compatibility for links issued by earlier builds: redirect to the
 * confirmation UI without touching the token. */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const target = new URL("/magic", req.url);
  if (token.length <= 200) target.searchParams.set("token", token);
  return NextResponse.redirect(target);
}
