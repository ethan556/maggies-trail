import type { Metadata } from "next";
import CatalogClient from "@/components/CatalogClient";
import { TrailAtmosphere } from "@/components/playerChrome";
import { getCatalog, getUpcoming } from "@/lib/content.server";

export const metadata: Metadata = { title: "Courses — Maggie's Trail" };

export default async function CoursesPage() {
  const cat = await getCatalog();
  const upcoming = await getUpcoming();
  const courses = cat.courses.map((c) => ({
    slug: c.course.slug,
    gradeLevel: c.course.gradeLevel,
    title: c.course.title,
    tagline: c.course.tagline,
    lessonCount: c.lessonCount,
    totalMinutes: c.totalMinutes,
    chapterCount: c.course.chapters.length,
    lessons: c.lessons.map((l) => ({ id: l.id, title: l.title }))
  }));
  return (
    <div className="relative overflow-x-clip">
      <TrailAtmosphere />
      <div className="relative z-[1]">
      <h1 className="text-3xl font-extrabold tracking-tight">Courses</h1>
      <p className="mt-1 text-body-lg text-content-2">Every trail on the map — walk them in any order.</p>
      <div className="mt-5">
        <CatalogClient courses={courses} upcoming={upcoming} />
      </div>
      </div>
    </div>
  );
}
