/**
 * /api/feedback — the sink for the universal "report a problem" control.
 *
 * Two decisions worth stating:
 *
 *   · ANONYMOUS REPORTS ARE ACCEPTED. Someone who cannot sign in is exactly
 *     the person most in need of the button, so there is no 401 here. The
 *     rate limit is per IP because there is no principal to key on.
 *
 *   · THE PAYLOAD IS THE REPORTER'S OWN WORDS PLUS THE ROUTE. No screenshot,
 *     no DOM serialisation, no console capture. A learner's screen holds
 *     their work and their mistakes; a bug report must not exfiltrate either.
 *     The route string is what makes a report actionable, and it is
 *     length-capped like any other untrusted field.
 *
 * With no durable database the control still works: the report is dropped
 * with a 503 the client shows honestly, rather than a success the user would
 * wrongly trust.
 */
import { NextRequest, NextResponse } from "next/server";
import { tryGetDb } from "@/server/db";
import { rateLimit, sessionFor } from "@/server/authService";
import { fileIssueReport } from "@/server/messagingService";
import { clientIp, SESSION_COOKIE, readJson } from "@/server/http";

export async function POST(req: NextRequest) {
  const db = tryGetDb();
  if (!db) {
    return NextResponse.json(
      { error: "unavailable", reason: "no durable database on this deployment" },
      { status: 503 }
    );
  }
  if (!rateLimit(db, `feedback:${clientIp(req)}`, 20, 3600)) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }
  const body = await readJson<{ route?: string; description?: string; viewport?: string; appVersion?: string }>(req);
  if (!body || typeof body.route !== "string" || typeof body.description !== "string") {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  // A session is optional by design — see the header note.
  const session = sessionFor(db, req.cookies.get(SESSION_COOKIE)?.value ?? null);
  const r = fileIssueReport(db, session, {
    route: body.route,
    description: body.description,
    viewport: typeof body.viewport === "string" ? body.viewport.slice(0, 32) : undefined,
    appVersion: typeof body.appVersion === "string" ? body.appVersion.slice(0, 64) : undefined,
  });
  if ("error" in r) return NextResponse.json(r, { status: 400 });
  return NextResponse.json(r);
}
