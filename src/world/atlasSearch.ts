/** Compact Atlas search contracts shared by server and client without importing a client module. */
export type AtlasCourseSearchRow = readonly [courseId: string, title: string, gradeBand: number];
export type AtlasLessonBandRow = readonly [lessonId: string, gradeBand: number];

export interface AtlasSearchIndex {
  courses: AtlasCourseSearchRow[];
  lessonBands: AtlasLessonBandRow[];
}

/** Preserve the existing catalogue's completed-work fallback without sending lesson titles. */
export function inferAtlasLearnerBand(
  statedGrade: number | undefined,
  completedLessonIds: ReadonlySet<string>,
  lessonBands: readonly AtlasLessonBandRow[]
): number | null {
  if (typeof statedGrade === "number" && Number.isFinite(statedGrade)) return statedGrade;
  const counts = new Map<number, number>();
  for (const [lessonId, gradeBand] of lessonBands) {
    if (!completedLessonIds.has(lessonId)) continue;
    counts.set(gradeBand, (counts.get(gradeBand) ?? 0) + 1);
  }
  let best: number | null = null;
  let bestCount = 0;
  for (const [gradeBand, count] of counts) {
    if (count > bestCount || (count === bestCount && best !== null && gradeBand > best)) {
      best = gradeBand;
      bestCount = count;
    }
  }
  return best;
}

/** Returned by the server only after a text query. */
export type AtlasLessonHit = readonly [
  lessonId: string,
  title: string,
  courseTitle: string,
  gradeBand: number
];

export type AtlasSortMode = "recommended" | "grade" | "title";

/**
 * S202 search bounds, shared so the client and the route agree.
 *
 * `MIN_ATLAS_QUERY` is 2 because one character is not a search: "a" matches 1,335 of 1,667
 * lesson titles. `ATLAS_SEARCH_LIMIT` is 50, matching the cap `/api/lesson-titles` already
 * applies to its id list — one house rule, not two.
 */
export const MIN_ATLAS_QUERY = 2;
export const ATLAS_SEARCH_LIMIT = 50;

/** What `/api/atlas-search` returns. `total` is the true match count, so a truncated result set
 * can be disclosed rather than silently passed off as complete. */
export interface AtlasSearchResult {
  lessons: AtlasLessonHit[];
  total: number;
  hasMore: boolean;
}

/** S201 clients answered `{ lessons }` with no counts; tolerate that shape rather than
 * rendering a search as broken during a rolling deploy. */
export function normalizeAtlasSearchResult(payload: Partial<AtlasSearchResult> | null | undefined): AtlasSearchResult {
  const lessons = payload?.lessons ?? [];
  const total = typeof payload?.total === "number" ? payload.total : lessons.length;
  return { lessons, total, hasMore: payload?.hasMore ?? total > lessons.length };
}
