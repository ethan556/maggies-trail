import { NextRequest, NextResponse } from "next/server";
import { tryGetDb } from "@/server/db";
import { rateLimit, verifyEmail } from "@/server/authService";
import { clientIp, readJson } from "@/server/http";

const NO_DB = () =>
  NextResponse.json({ error: "unavailable", reason: "no durable database on this deployment" }, { status: 503 });

/** Explicit confirmation prevents inbox security scanners from consuming an
 * email-verification token merely by previewing its GET link. */
export async function PUT(req: NextRequest) {
  const db = tryGetDb();
  if (!db) return NO_DB();
  if (!rateLimit(db, `verify:${clientIp(req)}`, 30, 3600)) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }
  const { token } = (await readJson<{ token?: string }>(req)) ?? {};
  const ok = Boolean(token && token.length <= 200 && verifyEmail(db, token));
  return NextResponse.json({ ok }, { status: ok ? 200 : 400 });
}

/** Backward compatibility for links issued by earlier builds. */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const target = new URL("/verify", req.url);
  if (token.length <= 200) target.searchParams.set("token", token);
  return NextResponse.redirect(target);
}
