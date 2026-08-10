/**
 * /api/institution/report — aggregate proficiency for an org subtree.
 *
 *   GET ?orgId=…&dimension=school|class|grade[&format=csv][&minCohort=n]
 *
 * Small cohorts are suppressed inside insightService (privacy floor), and the
 * CSV surfaces the word "suppressed" rather than the hidden numbers. Only an
 * admin of the org may read it.
 */
import { NextRequest, NextResponse } from "next/server";
import { tryGetDb } from "@/server/db";
import { sessionFor } from "@/server/authService";
import { SESSION_COOKIE } from "@/server/http";
import { orgReport, orgReportCsv } from "@/server/insightService";

const NO_DB = () =>
  NextResponse.json({ error: "unavailable", reason: "no durable database on this deployment" }, { status: 503 });

const DIMENSIONS = new Set(["school", "class", "grade"]);

export async function GET(req: NextRequest) {
  const db = tryGetDb();
  if (!db) return NO_DB();
  const session = sessionFor(db, req.cookies.get(SESSION_COOKIE)?.value ?? null);
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const p = req.nextUrl.searchParams;
  const orgId = p.get("orgId");
  const dimension = p.get("dimension") ?? "school";
  if (!orgId || orgId.length > 200 || !DIMENSIONS.has(dimension)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const minCohortRaw = p.get("minCohort");
  const minCohort = minCohortRaw ? Math.max(1, Math.min(1000, Number(minCohortRaw) || 10)) : 10;
  const dim = dimension as "school" | "class" | "grade";

  if (p.get("format") === "csv") {
    const csv = orgReportCsv(db, session, orgId, dim, minCohort);
    if (typeof csv !== "string") return NextResponse.json(csv, { status: 403 });
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="report-${dim}.csv"`
      }
    });
  }
  const report = orgReport(db, session, orgId, dim, minCohort);
  if ("error" in report) return NextResponse.json(report, { status: 403 });
  return NextResponse.json(report);
}
