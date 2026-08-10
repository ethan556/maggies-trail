import { NextRequest, NextResponse } from "next/server";
import { tryGetDb } from "@/server/db";
import { logout } from "@/server/authService";
import { clearSessionCookie, SESSION_COOKIE } from "@/server/http";

/**
 * Logout is intentionally retryable. When the durable DB is unavailable we do
 * not erase the only copy of the opaque HttpOnly token before its server row
 * can be revoked. The client hides the session behind a local logout tombstone
 * and SessionBootstrap retries; once the DB is reachable this route revokes the
 * row and clears the cookie in the same response.
 */
export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return clearSessionCookie(NextResponse.json({ ok: true, serverRevoked: true }));

  const db = tryGetDb();
  if (!db) {
    return NextResponse.json(
      { error: "unavailable", reason: "logout will retry when the account database is reachable" },
      { status: 503 }
    );
  }

  logout(db, token);
  return clearSessionCookie(NextResponse.json({ ok: true, serverRevoked: true }));
}
