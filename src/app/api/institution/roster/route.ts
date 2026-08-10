/**
 * /api/institution/roster — OneRoster CSV import and export for a district.
 *
 *   POST {districtOrgId, files:{orgs,users,…}, dryRun?}  → import plan / apply
 *   GET  ?districtOrgId=…                                → export CSV bundle
 *
 * The import is transactional and idempotent inside rosterService; dryRun writes
 * nothing but an audit row and returns the same diagnostics an apply would. The
 * CSV payloads ride in the JSON body (bounded), keeping the route dependency-free
 * — no multipart parser, no upload store.
 */
import { NextRequest, NextResponse } from "next/server";
import { tryGetDb } from "@/server/db";
import { rateLimit, sessionFor } from "@/server/authService";
import { SESSION_COOKIE, readJson } from "@/server/http";
import { exportOneRoster, importBundle } from "@/server/rosterService";
import { ONEROSTER_FILES, type OneRosterFile } from "@/lib/institution/oneroster";

const NO_DB = () =>
  NextResponse.json({ error: "unavailable", reason: "no durable database on this deployment" }, { status: 503 });

interface Body {
  districtOrgId?: string;
  files?: Partial<Record<OneRosterFile, string>>;
  dryRun?: boolean;
}

export async function POST(req: NextRequest) {
  const db = tryGetDb();
  if (!db) return NO_DB();
  const session = sessionFor(db, req.cookies.get(SESSION_COOKIE)?.value ?? null);
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  // Roster payloads are large; the readJson cap is generous but bounded.
  const body = await readJson<Body>(req, 4_000_000);
  if (!body || !body.districtOrgId || typeof body.files !== "object" || body.files === null) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  if (!rateLimit(db, `roster:${session.user.id}`, 30, 3600)) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }
  // Keep only recognized files, each a string.
  const files: Partial<Record<OneRosterFile, string>> = {};
  for (const name of ONEROSTER_FILES) {
    const v = body.files[name];
    if (typeof v === "string") files[name] = v;
  }
  const r = importBundle(db, session, body.districtOrgId, files, { dryRun: body.dryRun === true });
  if ("error" in r) return NextResponse.json(r, { status: r.error === "forbidden" ? 403 : 400 });
  return NextResponse.json(r);
}

export async function GET(req: NextRequest) {
  const db = tryGetDb();
  if (!db) return NO_DB();
  const session = sessionFor(db, req.cookies.get(SESSION_COOKIE)?.value ?? null);
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const districtOrgId = req.nextUrl.searchParams.get("districtOrgId");
  if (!districtOrgId || districtOrgId.length > 200) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const r = exportOneRoster(db, session, districtOrgId);
  if ("error" in r) return NextResponse.json(r, { status: r.error === "forbidden" ? 403 : 400 });
  return NextResponse.json({ files: r });
}
