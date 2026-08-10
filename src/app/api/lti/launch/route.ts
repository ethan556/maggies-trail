/**
 * /api/lti/launch — the LTI 1.3 ResourceLinkRequest lands here (form_post).
 *
 * Steps: confirm the state cookie matches the returned state (CSRF over the
 * OIDC round-trip), validate the id_token end to end (signature, temporal
 * claims, single-use nonce, jti replay, deployment, message type), then:
 *   · teacher → provision passwordless + mint a session cookie → /teach
 *   · student → no account ever; redirect to the target lesson (local-first)
 *
 * A validation failure returns the reason code with 400 — a district debugging
 * an integration needs "nonce-replayed" not a generic 401.
 */
import { NextRequest, NextResponse } from "next/server";
import { tryGetDb } from "@/server/db";
import { createLoginSession } from "@/server/authService";
import { withSessionCookie } from "@/server/http";
import { teacherLaunchUser, validateLaunch } from "@/server/ltiService";

const LTI_STATE_COOKIE = "mt_lti_state";

const NO_DB = () =>
  NextResponse.json({ error: "unavailable", reason: "no durable database on this deployment" }, { status: 503 });

function safeRedirect(target: string | null, origin: string): string {
  // Only allow same-origin app targets; anything else falls back to home.
  if (!target) return "/";
  try {
    const u = new URL(target, origin);
    if (u.origin === origin) return u.pathname + u.search;
  } catch {
    /* fall through */
  }
  return "/";
}

export async function POST(req: NextRequest) {
  const db = tryGetDb();
  if (!db) return NO_DB();

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "malformed-token" }, { status: 400 });
  const idToken = form.get("id_token");
  const state = form.get("state");
  if (typeof idToken !== "string" || typeof state !== "string") {
    return NextResponse.json({ error: "malformed-token" }, { status: 400 });
  }

  // State must match what we set on the login leg (CSRF defense).
  const cookieState = req.cookies.get(LTI_STATE_COOKIE)?.value ?? null;
  if (!cookieState || cookieState !== state) {
    return NextResponse.json({ error: "bad-state" }, { status: 400 });
  }

  const launch = validateLaunch(db, idToken);
  if ("error" in launch) return NextResponse.json(launch, { status: 400 });

  const origin = req.nextUrl.origin;

  if (launch.role === "teacher") {
    const minted = teacherLaunchUser(db, launch);
    if ("error" in minted) {
      // A teacher launch with no email cannot become a session; send them to
      // the content rather than dead-ending.
      const res = NextResponse.redirect(new URL(safeRedirect(launch.targetLink, origin), origin), 303);
      res.cookies.delete(LTI_STATE_COOKIE);
      return res;
    }
    const sess = createLoginSession(db, minted.userId, "lti");
    if ("error" in sess) return NextResponse.json({ error: "no-user" }, { status: 400 });
    const res = NextResponse.redirect(new URL("/teach", origin), 303);
    withSessionCookie(res, sess.token);
    res.cookies.delete(LTI_STATE_COOKIE);
    return res;
  }

  // Student: never an account. Straight to the lesson; the engine is local-first.
  const res = NextResponse.redirect(new URL(safeRedirect(launch.targetLink, origin), origin), 303);
  res.cookies.delete(LTI_STATE_COOKIE);
  return res;
}
