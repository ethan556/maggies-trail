/**
 * /api/lti/login — OIDC third-party-initiated login (LTI 1.3).
 *
 * The platform sends {iss, login_hint, target_link_uri, client_id?,
 * lti_message_hint?} by GET or POST form. We answer with a 302 to the
 * platform's own authorization endpoint carrying our state+nonce, and stash
 * the state in a short-lived HttpOnly cookie so the matching launch can prove
 * the round-trip. buildLoginRedirect is pure over the db (it persists the
 * nonce); the cookie is this route's only side effect.
 */
import { NextRequest, NextResponse } from "next/server";
import { tryGetDb } from "@/server/db";
import { buildLoginRedirect } from "@/server/ltiService";

const LTI_STATE_COOKIE = "mt_lti_state";

const NO_DB = () =>
  NextResponse.json({ error: "unavailable", reason: "no durable database on this deployment" }, { status: 503 });

async function params(req: NextRequest): Promise<Record<string, string>> {
  if (req.method === "POST") {
    const form = await req.formData().catch(() => null);
    const out: Record<string, string> = {};
    if (form) for (const [k, v] of form.entries()) if (typeof v === "string") out[k] = v;
    return out;
  }
  const out: Record<string, string> = {};
  req.nextUrl.searchParams.forEach((v, k) => (out[k] = v));
  return out;
}

async function handle(req: NextRequest) {
  const db = tryGetDb();
  if (!db) return NO_DB();
  const p = await params(req);
  const iss = p.iss;
  const loginHint = p.login_hint;
  const targetLinkUri = p.target_link_uri;
  if (!iss || !loginHint || !targetLinkUri) {
    return NextResponse.json({ error: "missing OIDC login parameters" }, { status: 400 });
  }
  const r = buildLoginRedirect(db, {
    iss,
    clientId: p.client_id || undefined,
    loginHint,
    targetLinkUri,
    ltiMessageHint: p.lti_message_hint || undefined
  });
  if ("error" in r) return NextResponse.json(r, { status: 400 });

  const res = NextResponse.redirect(r.redirectUrl, 302);
  res.cookies.set(LTI_STATE_COOKIE, r.state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none", // cross-site: the LMS drives the top-level navigation
    path: "/api/lti",
    maxAge: 600
  });
  return res;
}

export const GET = handle;
export const POST = handle;
