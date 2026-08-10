import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/content.server";
import { ATLAS_SEARCH_LIMIT, MIN_ATLAS_QUERY, type AtlasLessonHit, type AtlasSortMode } from "@/world/atlasSearch";

/**
 * S202 — bounded lesson-title search.
 *
 * S201 shipped this uncapped. Measured against the real corpus a one-character query matched
 * 1,335 of 1,667 lessons: ~99 KB of JSON and 1,335 anchors in the DOM, produced by the FIRST
 * keystroke of almost any search. `/api/lesson-titles` had already set the house rule — cap the
 * input, cap the output — and this route did not follow it.
 *
 * So: a floor on the query (a single letter is not a search), a ceiling on the query (an
 * unbounded string is a free `includes` scan), and a ceiling on the result set. `total` is the
 * true match count so the UI can say "50 of 433" honestly rather than silently truncating, which
 * would be the worse failure: a learner concluding a lesson does not exist.
 */

/** Long enough that a stale result is impossible within a typing session, short enough that
 * an authoring change reaches learners the same day. */
const CACHE_CONTROL = "public, max-age=300, stale-while-revalidate=60";
const MAX_QUERY_LENGTH = 64;

interface AtlasSearchResponse {
  lessons: AtlasLessonHit[];
  total: number;
  hasMore: boolean;
}

function empty(): NextResponse {
  return NextResponse.json({ lessons: [], total: 0, hasMore: false } satisfies AtlasSearchResponse, {
    headers: { "Cache-Control": CACHE_CONTROL }
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim().slice(0, MAX_QUERY_LENGTH).toLowerCase();
  if (query.length < MIN_ATLAS_QUERY) return empty();

  const gradeRaw = url.searchParams.get("grade");
  const grade = gradeRaw === null || gradeRaw === "all" ? null : Number(gradeRaw);
  const learnerBandRaw = url.searchParams.get("band");
  const learnerBand = learnerBandRaw === null ? null : Number(learnerBandRaw);
  const requestedSort = url.searchParams.get("sort");
  const sort: AtlasSortMode = requestedSort === "grade" || requestedSort === "title" ? requestedSort : "recommended";

  const catalog = await getCatalog();
  const rank = (value: number) => learnerBand === null || !Number.isFinite(learnerBand) ? 0 : Math.abs(value - learnerBand);
  const matches: AtlasLessonHit[] = catalog.courses
    .filter((entry) => grade === null || entry.course.gradeLevel === grade)
    .flatMap((entry) => entry.lessons
      .filter((lesson) => lesson.title.toLowerCase().includes(query))
      .map((lesson) => [lesson.id, lesson.title, entry.course.title, entry.course.gradeLevel] as const));

  // Sort the whole match set, then cut: the first 50 must be the best 50 under the requested
  // sort, not the first 50 the catalogue walk happened to reach.
  matches.sort((a, b) => {
    if (sort === "title") return a[1].localeCompare(b[1]) || a[3] - b[3];
    if (sort === "grade") return a[3] - b[3] || a[1].localeCompare(b[1]);
    return rank(a[3]) - rank(b[3]) || a[3] - b[3] || a[1].localeCompare(b[1]);
  });

  const body: AtlasSearchResponse = {
    lessons: matches.slice(0, ATLAS_SEARCH_LIMIT),
    total: matches.length,
    hasMore: matches.length > ATLAS_SEARCH_LIMIT
  };
  return NextResponse.json(body, { headers: { "Cache-Control": CACHE_CONTROL } });
}
