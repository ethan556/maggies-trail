import type { Metadata } from "next";
import { getCatalog } from "@/lib/content.server";
import { localDateStr } from "@/lib/engine";
import { loadManifest, PILOT_REGION_ID, regionWorld } from "@/world/worldServer";
import { WorldShell } from "@/world/WorldShell";
import { Trailhead } from "@/world/Trailhead";
import { WorldPreferences } from "@/world/WorldPreferences";

export const metadata: Metadata = { title: "Trailhead — Maggie's Trail" };

export default async function TrailheadPage({
  searchParams
}: {
  searchParams: Promise<{ region?: string | string[] }>;
}) {
  const rawRegion = (await searchParams).region;
  const requestedRegion = Array.isArray(rawRegion) ? rawRegion[0] : rawRegion;
  const full = loadManifest();
  const regionId = requestedRegion && full.regions.some((region) => region.id === requestedRegion)
    ? requestedRegion
    : PILOT_REGION_ID;
  const manifest = regionWorld(regionId);
  const catalog = await getCatalog();
  const courseNames: Record<string, string> = {};
  for (const course of manifest.courses) {
    courseNames[course.courseId] =
      catalog.courses.find((entry) => entry.course.id === course.courseId)?.course.title ?? course.trailName;
  }
  const waypointTitles: Record<string, string> = {};
  for (const entry of catalog.courses) for (const lesson of entry.lessons) waypointTitles[lesson.id] = lesson.title;
  const recommendationCourses = catalog.courses.map((entry) => ({
    courseId: entry.course.id,
    slug: entry.course.slug,
    title: entry.course.title,
    comingSoon: false,
    conceptTags: entry.conceptTags
  }));
  const region = full.regions.find((entry) => entry.id === regionId);

  return (
    <WorldShell manifest={manifest} today={localDateStr(new Date())}>
      <Trailhead
        landmarks={manifest.landmarks}
        courseNames={courseNames}
        regionName={region?.name ?? "Your region"}
        instruments={manifest.instruments}
        waypointTitles={waypointTitles}
        recommendationCourses={recommendationCourses}
      />
      <section aria-labelledby="prefs-heading" className="mt-8">
        <h2 id="prefs-heading" className="text-sm font-extrabold uppercase tracking-wide text-content-2">Presentation</h2>
        <div className="mt-2"><WorldPreferences /></div>
      </section>
    </WorldShell>
  );
}
