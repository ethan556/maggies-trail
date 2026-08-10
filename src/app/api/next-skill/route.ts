import { NextResponse } from "next/server";
import { readJson } from "@/server/http";
import { getCatalog, getSkillGraph } from "@/lib/content.server";
import { nextCurriculumSkill } from "@/lib/mastery";

/**
 * POST { proficient: string[] } — the learner's proficient conceptTags (mastery ≥ threshold).
 * Returns the single curriculum-next skill they're ready for, resolved to a lesson/course.
 * Heavy data (skill order + prereq map) stays server-side; the client sends only its short list.
 */
export async function POST(req: Request) {
  const body = await readJson<{ proficient?: unknown }>(req);
  if (!body) return NextResponse.json({ skill: null }, { status: 400 });
  let proficient = Array.isArray(body.proficient)
    ? body.proficient.filter((t): t is string => typeof t === "string" && t.length <= 300)
    : [];
  proficient = proficient.slice(0, 5000); // sanity cap

  const [cat, graph] = await Promise.all([getCatalog(), getSkillGraph()]);
  const tag = nextCurriculumSkill(graph.order, graph.prereqs, new Set(proficient));
  if (!tag) return NextResponse.json({ skill: null });

  const lessonId = cat.skillFirstLesson[tag] ?? null;
  const summary = lessonId ? cat.lessonIndex[lessonId] : undefined;
  return NextResponse.json({
    skill: {
      tag,
      lessonId,
      courseSlug: summary?.courseSlug ?? null,
      courseTitle: summary?.courseTitle ?? null
    }
  });
}
