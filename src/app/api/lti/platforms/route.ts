/**
 * /api/lti/platforms — admin registration + listing of LTI 1.3 platforms.
 *
 *   GET  ?orgId=…                       → registered platforms for the org
 *   POST {orgId, issuer, clientId, deploymentId, authLoginUrl, jwks}
 *
 * Distinct from the OIDC /api/lti/login and /api/lti/launch endpoints: those
 * are the runtime the LMS talks to; this is the console an org admin uses to
 * paste the platform's keys. Authorization is the org admin chain.
 */
import { NextRequest, NextResponse } from "next/server";
import { tryGetDb } from "@/server/db";
import { rateLimit, sessionFor } from "@/server/authService";
import { SESSION_COOKIE, readJson } from "@/server/http";
import { platformsFor, registerPlatform } from "@/server/ltiService";

const NO_DB = () =>
  NextResponse.json({ error: "unavailable", reason: "no durable database on this deployment" }, { status: 503 });

interface Body {
  orgId?: string;
  issuer?: string;
  clientId?: string;
  deploymentId?: string;
  authLoginUrl?: string;
  jwks?: string;
}

export async function GET(req: NextRequest) {
  const db = tryGetDb();
  if (!db) return NO_DB();
  const session = sessionFor(db, req.cookies.get(SESSION_COOKIE)?.value ?? null);
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const orgId = req.nextUrl.searchParams.get("orgId");
  if (!orgId || orgId.length > 200) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const r = platformsFor(db, session, orgId);
  if ("error" in r) return NextResponse.json(r, { status: 403 });
  return NextResponse.json({ platforms: r });
}

export async function POST(req: NextRequest) {
  const db = tryGetDb();
  if (!db) return NO_DB();
  const session = sessionFor(db, req.cookies.get(SESSION_COOKIE)?.value ?? null);
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (!rateLimit(db, `lti-register:${session.user.id}`, 60, 3600)) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }
  const body = await readJson<Body>(req, 512_000);
  if (
    !body ||
    !body.orgId ||
    !body.issuer ||
    !body.clientId ||
    !body.deploymentId ||
    !body.authLoginUrl ||
    typeof body.jwks !== "string"
  ) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const r = registerPlatform(db, session, body.orgId, {
    issuer: body.issuer.trim(),
    clientId: body.clientId.trim(),
    deploymentId: body.deploymentId.trim(),
    authLoginUrl: body.authLoginUrl.trim(),
    jwks: body.jwks
  });
  if ("error" in r) return NextResponse.json(r, { status: r.error === "forbidden" ? 403 : 400 });
  return NextResponse.json(r);
}
