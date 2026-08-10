import type { Metadata } from "next";
import { getCatalog } from "@/lib/content.server";
import FamilyClient from "./FamilyClient";
import type { SkillLabel } from "@/components/ParentReport";
import type { ManifestCourse } from "@/lib/family";
import manifest from "../../../../content/curriculum-manifest.json";

export const metadata: Metadata = { title: "Family — Maggie's Trail" };

/** Names for the skills, derived from the content itself: `skillFirstLesson` already knows which
 * lesson first teaches each conceptTag, so the label is a REAL lesson title and cannot drift from
 * what the child was actually taught. */
async function skillLabels(): Promise<Record<string, SkillLabel>> {
  const cat = await getCatalog();
  const out: Record<string, SkillLabel> = {};
  for (const [tag, lessonId] of Object.entries(cat.skillFirstLesson)) {
    const l = cat.lessonIndex[lessonId];
    if (!l) continue;
    out[tag] = { label: l.title, lessonId, courseTitle: l.courseTitle };
  }
  return out;
}

export default async function FamilyPage() {
  const skills = await skillLabels();
  // Slim manifest slice for the dashboard: id/title/grade/category + lesson
  // ids/minutes — everything the family metrics need, nothing more.
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
    <div className="mx-auto max-w-2xl">
      <FamilyClient skills={skills} courses={courses} tagGrades={tagGrades} />
    </div>
  );
}
