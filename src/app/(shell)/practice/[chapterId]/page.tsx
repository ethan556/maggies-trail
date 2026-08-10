import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCatalog, loadLessonById } from "@/lib/content.server";
import PracticeClient, { type PracticeItem } from "./PracticeClient";

export const metadata: Metadata = { title: "Practice — Maggie's Trail" };

export default async function PracticePage({
  params,
  searchParams
}: {
  params: Promise<{ chapterId: string }>;
  searchParams: Promise<{ testout?: string }>;
}) {
  const { chapterId } = await params;
  const { testout } = await searchParams;
  const cat = await getCatalog();

  let chapterTitle = "";
  let courseSlug = "";
  let lessonIds: string[] = [];
  for (const c of cat.courses) {
    const ch = c.course.chapters.find((x) => x.id === chapterId);
    if (ch) {
      chapterTitle = ch.title;
      courseSlug = c.course.slug;
      lessonIds = ch.lessonIds;
      break;
    }
  }
  if (!chapterTitle) notFound();

  const pool: PracticeItem[] = [];
  for (const id of lessonIds) {
    const lesson = await loadLessonById(id);
    if (!lesson) continue;
    for (const s of lesson.steps) {
      if ((s.kind === "check" || s.kind === "challenge") && s.widget && s.conceptTag) {
        pool.push({
          key: `${lesson.id}:${s.id}`,
          body: s.body || undefined,
          widget: s.widget,
          explanationVariants: s.explanationVariants,
          hints: s.hints,
          context: lesson.title,
          conceptTag: s.conceptTag,
          lessonId: lesson.id,
          stepId: s.id
        });
      }
    }
  }
  if (pool.length === 0) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-xs font-extrabold uppercase tracking-wide text-sky-ink">
        {testout === "1" ? "Chapter test-out" : "Practice"}
      </p>
      <h1 className="mt-1 text-2xl font-extrabold">{chapterTitle}</h1>
      <div className="mt-5">
        <PracticeClient
          pool={pool}
          chapterTitle={chapterTitle}
          courseSlug={courseSlug}
          chapterId={chapterId}
          chapterLessonIds={lessonIds}
          mode={testout === "1" ? "testout" : "practice"}
        />
      </div>
    </div>
  );
}
