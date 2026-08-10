import type { Metadata } from "next";
import DashboardClient, { type DashCourse } from "@/components/DashboardClient";
import { getCatalog, getUpcoming, PATH_EDGES } from "@/lib/content.server";

export const metadata: Metadata = { title: "Dashboard — Maggie's Trail" };

export default async function DashboardPage() {
  const cat = await getCatalog();
  const upcoming = await getUpcoming();
  const titleBySlug = new Map<string, string>();
  for (const c of cat.courses) titleBySlug.set(c.course.slug, c.course.title);
  for (const u of upcoming) titleBySlug.set(u.slug, u.title);

  const afterFor = (slug: string): string[] =>
    PATH_EDGES.filter((e) => e.to === slug)
      .map((e) => titleBySlug.get(e.from))
      .filter((t): t is string => Boolean(t));

  const live: DashCourse[] = cat.courses.map((c) => ({
    courseId: c.course.id,
    slug: c.course.slug,
    title: c.course.title,
    tagline: c.course.tagline,
    comingSoon: false,
    gradeLevel: c.course.gradeLevel,
    chapters: c.course.chapters.map((ch) => ch.lessonIds),
    lessonIds: c.lessons.map((l) => l.id),
    firstLessonId: c.lessons[0]?.id ?? null,
    after: afterFor(c.course.slug),
    conceptTags: c.conceptTags
  }));
  const soon: DashCourse[] = upcoming.map((u) => ({
    courseId: u.slug,
    slug: u.slug,
    title: u.title,
    tagline: u.tagline,
    comingSoon: true,
    gradeLevel: u.gradeLevel,
    chapters: [],
    lessonIds: [],
    firstLessonId: null,
    after: afterFor(u.slug),
    conceptTags: []
  }));

  return <DashboardClient courses={[...live, ...soon]} />;
}
