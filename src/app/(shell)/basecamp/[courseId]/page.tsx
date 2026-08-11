import type { Metadata } from "next";
import { masteryMissionExists } from "@/lib/masteryMission.server";
import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/content.server";
import { localDateStr } from "@/lib/engine";
import { courseWorld, loadManifest } from "@/world/worldServer";
import { WorldShell } from "@/world/WorldShell";
import { Basecamp } from "@/world/Basecamp";

export async function generateMetadata({
  params
}: { params: Promise<{ courseId: string }> }): Promise<Metadata> {
  const { courseId } = await params;
  const course = loadManifest().courses.find((entry) => entry.courseId === courseId);
  return { title: course ? `${course.trailName} — Maggie's Trail` : "Basecamp — Maggie's Trail" };
}

export default async function BasecampPage({
  params
}: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const manifest = courseWorld(courseId);
  const course = manifest.courses.find((entry) => entry.courseId === courseId);
  if (!course) notFound();

  const catalog = await getCatalog();
  const entry = catalog.courses.find((catalogEntry) => catalogEntry.course.id === courseId);
  if (!entry) notFound();

  const landmarks = course.landmarkIds
    .map((id) => manifest.landmarks.find((landmark) => landmark.id === id))
    .filter((landmark): landmark is NonNullable<typeof landmark> => Boolean(landmark));

  const waypoints: Record<string, { title: string; minutes: number }> = {};
  for (const lesson of entry.lessons) waypoints[lesson.id] = { title: lesson.title, minutes: lesson.minutes };

  const prerequisites = course.prerequisiteCourseIds
    .map((id) => manifest.courses.find((candidate) => candidate.courseId === id))
    .filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate))
    .map((candidate) => ({ courseId: candidate.courseId, trailName: candidate.trailName }));

  // S237. Same defect as the lesson-complete screen: a concept tag is not a mission. 572 of the
  // 1,737 tags reachable as Basecamp chips have no mastery mission, so a third of these chips led
  // to "404 · TRAIL MARKER MISSING". Offer only the ones that resolve.
  const masteryMap = new Map<string, string>();
  for (const lesson of entry.lessons) {
    for (const tag of lesson.conceptTags) {
      if (!tag || masteryMap.has(tag)) continue;
      if (!(await masteryMissionExists(tag))) continue;
      masteryMap.set(tag, tag.replaceAll("-", " "));
    }
  }

  return (
    <WorldShell manifest={manifest} today={localDateStr(new Date())}>
      <Basecamp
        courseId={courseId}
        trailName={entry.course.title}
        trailSummary={entry.course.tagline}
        category={entry.course.category}
        lessonCount={entry.lessonCount}
        totalMinutes={entry.totalMinutes}
        landmarks={landmarks}
        waypoints={waypoints}
        prerequisites={prerequisites}
        masteryConcepts={[...masteryMap.entries()].slice(0, 8)}
      />
    </WorldShell>
  );
}
