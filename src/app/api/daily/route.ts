import { NextResponse } from "next/server";
import { getDailyFiles } from "@/lib/content.server";
import { dailyIndexFor, isLocalDateString } from "@/lib/engine";

/**
 * GET /api/daily?date=YYYY-MM-DD&grade=3|4 — the day's problems for the requested grade band.
 * The client supplies its date so midnight boundaries follow the learner's clock,
 * not the server's (spec: midnight-boundary correct). `grade` defaults to 3, preserving
 * existing behavior for anyone not yet using the P9.5 grade toggle.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date") ?? "";
  if (!isLocalDateString(date)) {
    return NextResponse.json({ error: "date must be a valid YYYY-MM-DD calendar date" }, { status: 400 });
  }
  const gradeParam = url.searchParams.get("grade");
  if (gradeParam !== null && gradeParam !== "3" && gradeParam !== "4") {
    return NextResponse.json({ error: "grade must be 3 or 4" }, { status: 400 });
  }
  const grade = gradeParam === "4" ? 4 : 3;

  const day = dailyIndexFor(date);
  const files = await getDailyFiles();
  const forGrade = files.filter((f) => f.gradeLevel === grade);

  const categories = forGrade.map((file) => {
    const problem = file.problems.find((p) => p.day === day) ?? null;
    return { category: file.category, problem };
  });

  return NextResponse.json({ date, day, grade, categories });
}

