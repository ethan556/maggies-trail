import type { Metadata } from "next";
import ProfileClient from "@/components/ProfileClient";
import { getCatalog } from "@/lib/content.server";

export const metadata: Metadata = { title: "Profile — Maggie's Trail" };

export default async function ProfilePage() {
  const cat = await getCatalog();
  const courses = cat.courses.map((c) => ({
    slug: c.course.slug,
    title: c.course.title,
    gradeLevel: c.course.gradeLevel,
    lessonIds: c.lessons.map((l) => l.id),
    conceptTags: c.conceptTags
  }));
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-extrabold tracking-tight">Your trail log</h1>
      <div className="mt-5">
        <ProfileClient courses={courses} />
      </div>
    </div>
  );
}
