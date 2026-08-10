import { NextResponse } from "next/server";
import { readJson } from "@/server/http";
import { getCatalog, loadLessonById } from "@/lib/content.server";
import { buildMasteryMission } from "@/lib/masteryMission.server";
import type { TStep } from "@/lib/schema";

/**
 * POST { keys: string[] } where key = `${lessonId}:${stepId}`.
 * Returns servable step specs for the review queue. Searches lesson steps
 * AND remedial checks (both can seed review items).
 */
export async function POST(req: Request) {
  const body = await readJson<{ keys?: unknown }>(req);
  if (!body) return NextResponse.json({ items: [] }, { status: 400 });
  let keys = Array.isArray(body.keys)
    ? body.keys.filter((k): k is string => typeof k === "string" && k.length <= 600)
    : [];
  keys = keys.slice(0, 100); // sanity cap

  const cat = await getCatalog();
  const byLesson = new Map<string, string[]>();
  for (const key of keys) {
    const [lessonId, stepId] = key.split(":");
    if (!lessonId || !stepId) continue;
    const arr = byLesson.get(lessonId) ?? [];
    arr.push(stepId);
    byLesson.set(lessonId, arr);
  }

  const items: Array<{
    key: string;
    body?: string;
    widget: unknown;
    explanationVariants?: string[];
    hints?: string[];
    context: string;
  }> = [];

  for (const [lessonId, stepIds] of byLesson) {
    let lesson = await loadLessonById(lessonId);
    // Mastery Studio missions are deterministic virtual lessons rather than duplicated JSON files.
    // Rebuild the same round here so missed mission items remain fully reviewable days later.
    if (!lesson && lessonId.startsWith("mastery-")) {
      const match = /^mastery-(.+)-(\d+)$/.exec(lessonId);
      if (match) lesson = await buildMasteryMission(match[1], Number(match[2]));
    }
    if (!lesson) continue;
    const title = cat.lessonIndex[lessonId]?.title ?? lesson.title;
    const findStep = (id: string): TStep | undefined =>
      lesson.steps.find((s) => s.id === id) ??
      lesson.remedials.map((r) => r.check).find((s) => s.id === id);
    for (const stepId of stepIds) {
      const step = findStep(stepId);
      if (!step?.widget) continue;
      items.push({
        key: `${lessonId}:${stepId}`,
        body: step.body || undefined,
        widget: step.widget,
        explanationVariants: step.explanationVariants,
        hints: step.hints,
        context: title
      });
    }
  }

  return NextResponse.json({ items });
}
