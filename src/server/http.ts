/**
 * HTTP helpers — the cookie discipline, in one place.
 *
 * The session cookie is the ONLY client-side artifact of authentication:
 * HttpOnly (scripts can never read it), SameSite=Lax (cross-site POSTs don't
 * carry it — the CSRF baseline for a same-origin JSON API), Secure outside
 * dev, path=/ so every API route sees it. The raw token appears nowhere else;
 * the database stores its SHA-256.
 *
 * The DISPLAY MIRROR (who's signed in, for rendering "Hi, ms.rivera") is a
 * plain localStorage entry the client owns — deliberately NOT this cookie and
 * carrying no authority: every API call re-derives identity from the HttpOnly
 * cookie against session rows.
 */
import { NextResponse } from "next/server";

export const SESSION_COOKIE = "mt_session";

export function withSessionCookie(res: NextResponse, token: string): NextResponse {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 86400
  });
  return res;
}

export function clearSessionCookie(res: NextResponse): NextResponse {
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
  return res;
}

/** Body parsing that cannot 500: malformed JSON is a CLIENT error, so it must
 * come back as one. Returns null on any parse failure; callers either answer
 * 400 directly or destructure `?? {}` and let their own field guards fire. */
export async function readJson<T>(req: Request, maxBytes = 256_000): Promise<T | null> {
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (Number.isFinite(declared) && declared > maxBytes) return null;
  try {
    const text = await req.text();
    if (new TextEncoder().encode(text).byteLength > maxBytes) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export function clientIp(req: { headers: Headers }): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}
