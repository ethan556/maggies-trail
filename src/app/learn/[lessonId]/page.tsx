import { notFound } from "next/navigation";
import LessonPlayer, { type LessonTrailContext, type NextLesson } from "@/components/LessonPlayer";
import { getCatalog, loadLessonById } from "@/lib/content.server";
import { primaryConceptTag } from "@/lib/masteryMission.server";

/** Route context for the lesson-player trailhead. Computed server-side so the
 * learner always knows the course, chapter, and position without another
 * client request or a layout shift after hydration. */
async function trailData(
  lessonId: string
): Promise<{ next: NextLesson | null; context: LessonTrailContext | null }> {
  const cat = await getCatalog();
  for (const c of cat.courses) {
    const idx = c.lessons.findIndex((l) => l.id === lessonId);
    if (idx === -1) continue;
    const lesson = c.lessons[idx];
    const chapterIndex = c.course.chapters.findIndex((chapter) => chapter.id === lesson.chapterId);
    const chapter = chapterIndex >= 0 ? c.course.chapters[chapterIndex] : null;
    const n = c.lessons[idx + 1];
    return {
      next: n ? { id: n.id, title: n.title } : null,
      context: {
        gradeBand: c.course.gradeLevel <= 2 ? "early" : c.course.gradeLevel <= 8 ? "middle" : "upper",
        courseTitle: c.course.title,
        chapterTitle: chapter?.title ?? "Current chapter",
        chapterNumber: chapterIndex >= 0 ? chapterIndex + 1 : 1,
        chapterCount: c.course.chapters.length,
        lessonNumber: idx + 1,
        lessonCount: c.lessons.length
      }
    };
  }
  return { next: null, context: null };
}

export default async function LearnPage({
  params
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const lesson = await loadLessonById(lessonId);
  if (!lesson) notFound();
  const [{ next, context }, masteryTag] = await Promise.all([
    trailData(lessonId),
    primaryConceptTag(lesson)
  ]);
  return <LessonPlayer lesson={lesson} next={next} trailContext={context} masteryTag={masteryTag} />;
}
