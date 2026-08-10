import type { Metadata } from "next";
import ClassClient from "./ClassClient";
import manifest from "../../../../../../content/curriculum-manifest.json";

export const metadata: Metadata = { title: "Class — Maggie's Trail" };

export interface PickerCourse {
  id: string;
  title: string;
  gradeLevel: number;
  lessons: Array<{ id: string; title: string }>;
}

export default async function TeachClassPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const courses: PickerCourse[] = (
    manifest.courses as Array<{
      id: string;
      title: string;
      gradeLevel: number;
      lessons: Array<{ id: string; title: string }>;
    }>
  ).map((c) => ({
    id: c.id,
    title: c.title,
    gradeLevel: c.gradeLevel,
    lessons: c.lessons.map((l) => ({ id: l.id, title: l.title }))
  }));
  return (
    <div className="mx-auto max-w-4xl">
      <ClassClient classId={classId} courses={courses} />
    </div>
  );
}
