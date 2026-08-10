import type { Metadata } from "next";
import { localDateStr } from "@/lib/engine";
import { getCatalog } from "@/lib/content.server";
import { atlasRegions, PILOT_REGION_ID, regionWorld } from "@/world/worldServer";
import { WorldShell } from "@/world/WorldShell";
import { Atlas } from "@/world/Atlas";
import type { AtlasSearchIndex } from "@/world/atlasSearch";

export const metadata: Metadata = { title: "Atlas — Maggie's Trail" };

export default async function AtlasPage() {
  // Only course identity/title/grade crosses the server boundary. Lesson titles are searched
  // through /api/atlas-search and the complete world manifest remains server-only.
  const manifest = regionWorld(PILOT_REGION_ID);
  const catalog = await getCatalog();
  const searchIndex: AtlasSearchIndex = {
    courses: catalog.courses.map((entry) => [entry.course.id, entry.course.title, entry.course.gradeLevel] as const),
    lessonBands: catalog.courses.flatMap((entry) =>
      entry.lessons.map((lesson) => [lesson.id, entry.course.gradeLevel] as const)
    )
  };
  return (
    <WorldShell manifest={manifest} today={localDateStr(new Date())}>
      <Atlas regions={atlasRegions()} activeRegionId={PILOT_REGION_ID} searchIndex={searchIndex} />
    </WorldShell>
  );
}
