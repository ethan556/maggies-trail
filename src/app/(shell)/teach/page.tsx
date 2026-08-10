import type { Metadata } from "next";
import TeachClient from "./TeachClient";
import type { ManifestCourse } from "@/lib/family";
import manifest from "../../../../content/curriculum-manifest.json";

export const metadata: Metadata = { title: "Teach — Maggie's Trail" };

export default function TeachPage() {
  const courses: ManifestCourse[] = (manifest.courses as ManifestCourse[]).map((c) => ({
    id: c.id,
    title: c.title,
    gradeLevel: c.gradeLevel,
    category: c.category,
    lessonCount: c.lessonCount,
    lessons: c.lessons.map((l) => ({ id: l.id, title: l.title, minutes: l.minutes }))
  }));
  const tagGrades = (manifest as { tagGrades?: Record<string, number> }).tagGrades ?? {};
  return (
    <div className="mx-auto max-w-3xl">
      <TeachClient courses={courses} tagGrades={tagGrades} />
    </div>
  );
}
