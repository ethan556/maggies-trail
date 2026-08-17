"use client";
/**
 * S201 Step 1 — Atlas capability parity.
 *
 * Course search/filter/sort runs over a tiny server-built course index. Lesson titles remain in
 * a cached server index queried through /api/atlas-search, so the 252 KB world manifest and the
 * 1,667-title lesson corpus never join the Atlas first-load payload. The ordered region list is
 * still the semantic catalogue; the map remains an optional aria-hidden companion.
 */
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Surface } from "@/components/ui";
import { gradeBandLabel } from "@/lib/copy";
import { progressStore } from "@/lib/progress";
import { useWorld } from "./WorldShell";
import { RegionMap } from "./RegionMap";
import type { AtlasRegion } from "./RegionMap";
import {
  ATLAS_SEARCH_LIMIT,
  inferAtlasLearnerBand,
  MIN_ATLAS_QUERY,
  normalizeAtlasSearchResult,
  type AtlasLessonHit,
  type AtlasSearchIndex,
  type AtlasSearchResult,
  type AtlasSortMode
} from "./atlasSearch";

/** S202: 250 ms. S201 used 120 ms, which fired a request on essentially every keystroke. */
const SEARCH_DEBOUNCE_MS = 250;

type SearchState = "idle" | "loading" | "ready" | "error";

export function Atlas({
  regions,
  activeRegionId,
  searchIndex
}: {
  regions: AtlasRegion[];
  activeRegionId: string;
  searchIndex: AtlasSearchIndex;
}) {
  const { flags } = useWorld();
  const [q, setQ] = useState("");
  const [grade, setGrade] = useState<string>("all");
  const [sort, setSort] = useState<AtlasSortMode>("recommended");
  const [learnerBand, setLearnerBand] = useState<number | null>(null);
  const [lessonHits, setLessonHits] = useState<AtlasLessonHit[]>([]);
  const [lessonTotal, setLessonTotal] = useState(0);
  const [searchState, setSearchState] = useState<SearchState>("idle");

  useEffect(() => {
    try {
      const profile = progressStore.load();
      const completed = new Set(Object.keys(profile.lessons).filter((id) => profile.lessons[id]?.completed));
      setLearnerBand(inferAtlasLearnerBand(profile.onboarding?.grade, completed, searchIndex.lessonBands));
    } catch {
      setLearnerBand(null);
    }
  }, [searchIndex.lessonBands]);

  const query = q.trim().toLowerCase();
  /** A single character matches most of the corpus, so it is a keystroke, not a query. Course
   * filtering still runs on it client-side; only the server round-trip waits for a real term. */
  const lessonQuery = query.length >= MIN_ATLAS_QUERY ? query : "";

  useEffect(() => {
    if (!lessonQuery) {
      setLessonHits([]);
      setLessonTotal(0);
      setSearchState("idle");
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setSearchState("loading");
      const params = new URLSearchParams({ q: lessonQuery, sort });
      if (grade !== "all") params.set("grade", grade);
      if (learnerBand !== null) params.set("band", String(learnerBand));
      fetch(`/api/atlas-search?${params.toString()}`, { signal: controller.signal })
        .then((response) => response.ok ? response.json() : Promise.reject(new Error("search failed")))
        .then((payload: Partial<AtlasSearchResult>) => {
          const result = normalizeAtlasSearchResult(payload);
          setLessonHits(result.lessons);
          setLessonTotal(result.total);
          setSearchState("ready");
        })
        .catch((error: unknown) => {
          if ((error as { name?: string })?.name === "AbortError") return;
          setLessonHits([]);
          setLessonTotal(0);
          setSearchState("error");
        });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [grade, learnerBand, lessonQuery, sort]);

  const filtered = useMemo(() => {
    const gradeNumber = grade === "all" ? null : Number(grade);
    const rank = (value: number) => learnerBand === null ? 0 : Math.abs(value - learnerBand);
    const courseHits = searchIndex.courses
      .filter((course) => gradeNumber === null || course[2] === gradeNumber)
      .filter((course) => !query || course[1].toLowerCase().includes(query))
      .sort((a, b) => {
        if (sort === "title") return a[1].localeCompare(b[1]) || a[2] - b[2];
        if (sort === "grade") return a[2] - b[2] || a[1].localeCompare(b[1]);
        return rank(a[2]) - rank(b[2]) || a[2] - b[2] || a[1].localeCompare(b[1]);
      });

    // S203: a filter marks regions, it does not delete them. Every one of the fourteen stays in
    // the list and on the map; `matchedRegionIds` is what changes. See RegionMap for why.
    const hasConstraint = Boolean(query) || gradeNumber !== null;
    const matchedGrades = new Set<number>();
    for (const course of courseHits) matchedGrades.add(course[2]);
    for (const lesson of lessonHits) matchedGrades.add(lesson[3]);
    if (!query && gradeNumber !== null) matchedGrades.add(gradeNumber);
    const matchedRegionIds = new Set(
      regions.filter((region) => !hasConstraint || matchedGrades.has(region.gradeBand)).map((region) => region.id)
    );
    return { courseHits, matchedRegionIds, hasConstraint };
  }, [grade, learnerBand, lessonHits, query, regions, searchIndex, sort]);

  const searchFinished = !lessonQuery || searchState === "ready" || searchState === "error";
  const noResults = filtered.hasConstraint && filtered.courseHits.length === 0 && lessonHits.length === 0 && searchFinished;

  /**
   * S203: ONE status line, not a live region wrapped around the results.
   *
   * `aria-live` on the results container meant every keystroke replaced the whole subtree and a
   * screen reader re-read both lists — and the empty-state panel sat inside it with its own
   * `role="status"`, so that message could be announced twice. A search needs a summary
   * announced, not its contents re-read. This is that summary: one element, one role, and the
   * same words on screen as in the ear.
   */
  const plural = (count: number, noun: string) => `${count} ${noun}${count === 1 ? "" : "s"}`;
  const searchStatus = !filtered.hasConstraint
    ? null
    : noResults
      ? "No Atlas results match these search and grade filters. Try a broader phrase or choose all grades."
      : searchState === "loading"
        ? "Searching waypoint titles…"
        : [
            plural(filtered.courseHits.length, "course"),
            !lessonQuery
              ? null
              : lessonTotal > lessonHits.length
                ? `${lessonHits.length} of ${lessonTotal} waypoints`
                : plural(lessonHits.length, "waypoint"),
            `${filtered.matchedRegionIds.size} of ${regions.length} regions`
          ]
            .filter(Boolean)
            .join(" · ");

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Learner Atlas</h1>
      <p className="mt-1 text-body-lg text-content-2">
        Fourteen regions, one per grade band. Search every course and waypoint without entering a region first.
      </p>

      <section aria-label="Atlas search and filters" className="mt-5 grid gap-3 rounded-card border border-ink/10 bg-surface p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] dark:border-paper/12 dark:bg-dusk">
        <label className="block">
          <span className="text-sm font-bold text-content-2">Search courses and lessons</span>
          <input
            type="search"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Try “equivalent fractions”…"
            className="mt-1 min-h-[44px] w-full rounded-card border border-ink/15 bg-surface px-3 py-2 outline-none focus:border-sky focus:ring-2 focus:ring-sky/25 dark:border-paper/15 dark:bg-ink/35"
          />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-content-2">Grade</span>
          <select value={grade} onChange={(event) => setGrade(event.target.value)} className="mt-1 min-h-[44px] w-full rounded-card border border-ink/15 bg-surface px-3 py-2 dark:border-paper/15 dark:bg-ink/35">
            <option value="all">All grades</option>
            {regions.map((region) => <option key={region.id} value={region.gradeBand}>{gradeBandLabel(region.gradeBand)}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-bold text-content-2">Sort</span>
          <select value={sort} onChange={(event) => setSort(event.target.value as AtlasSortMode)} className="mt-1 min-h-[44px] w-full rounded-card border border-ink/15 bg-surface px-3 py-2 dark:border-paper/15 dark:bg-ink/35">
            <option value="recommended">Recommended</option>
            <option value="grade">Grade order</option>
            <option value="title">A–Z</option>
          </select>
        </label>
      </section>

      {filtered.hasConstraint && (
        <div className="mt-6 space-y-6" aria-busy={searchState === "loading" || undefined}>
          <p
            role="status"
            className={noResults
              ? "rounded-card border border-dashed border-ink/20 p-4 text-sm text-content-2 dark:border-paper/20"
              : "text-sm text-content-2"}
          >
            {searchStatus}
          </p>

          <section aria-label="Matching courses">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-content-2">Courses ({filtered.courseHits.length})</h2>
            {filtered.courseHits.length > 0 ? (
              <ul className="mt-2 grid gap-3 sm:grid-cols-2">
                {filtered.courseHits.map(([courseId, title, gradeBand]) => (
                  <li key={courseId}>
                    <Link href={`/basecamp/${courseId}`} className="block min-h-[44px] rounded-card border border-ink/10 bg-surface p-4 hover:border-sky dark:border-paper/12 dark:bg-dusk">
                      <span className="block text-xs font-extrabold uppercase tracking-wide text-sky-ink">{gradeBandLabel(gradeBand)}</span>
                      <span className="mt-1 block font-extrabold">{title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-2 text-sm text-content-2">No course titles match “{q.trim()}”.</p>}
          </section>

          {query && (
            <section aria-label="Matching lessons">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-content-2">
                Lessons ({lessonHits.length}{lessonTotal > lessonHits.length ? ` of ${lessonTotal}` : ""})
              </h2>
              {!lessonQuery ? (
                <p className="mt-2 text-sm text-content-2">Type at least {MIN_ATLAS_QUERY} letters to search waypoint titles.</p>
              ) : searchState === "loading" ? (
                <p className="mt-2 text-sm text-content-2">Searching lesson titles…</p>
              ) : searchState === "error" ? (
                <p className="mt-2 text-sm text-content-2">Lesson search is temporarily unavailable. Course and region filtering still work.</p>
              ) : lessonHits.length > 0 ? (
                <ul className="mt-2 divide-y divide-ink/8 overflow-hidden rounded-card border border-ink/10 bg-surface dark:divide-paper/8 dark:border-paper/12 dark:bg-dusk">
                  {lessonHits.map(([lessonId, title, courseTitle, gradeBand]) => (
                    <li key={lessonId}>
                      <Link href={`/learn/${lessonId}`} className="flex min-h-[44px] items-center justify-between gap-3 px-4 py-2 hover:bg-sky/5">
                        <span className="font-bold">{title}</span>
                        <span className="text-right text-xs text-content-2">{gradeBandLabel(gradeBand)}<span className="hidden sm:inline"> · {courseTitle}</span></span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : <p className="mt-2 text-sm text-content-2">No lesson titles match “{q.trim()}”.</p>}
              {lessonHits.length > 0 && lessonTotal > lessonHits.length && (
                <p className="mt-2 text-xs text-content-2">
                  Showing the closest {ATLAS_SEARCH_LIMIT} of {lessonTotal} matching waypoints. Add a word or choose a
                  grade to narrow it.
                </p>
              )}
            </section>
          )}

        </div>
      )}

      {flags.regionArt && (
        <div className="mt-5">
          <RegionMap regions={regions} activeRegionId={activeRegionId} matchedRegionIds={filtered.matchedRegionIds} />
        </div>
      )}
      <AccessibleRegionList
        regions={regions}
        activeRegionId={activeRegionId}
        matchedRegionIds={filtered.hasConstraint ? filtered.matchedRegionIds : undefined}
      />
    </div>
  );
}

/** §11/§28: the map's semantic equivalent. A plain, ordered, keyboard-native list. */
export function AccessibleRegionList({
  regions,
  activeRegionId,
  matchedRegionIds
}: {
  regions: AtlasRegion[];
  activeRegionId: string;
  /** Undefined when no filter is active. Non-matching regions are marked, never removed. */
  matchedRegionIds?: ReadonlySet<string>;
}) {
  return (
    <section aria-labelledby="atlas-regions-heading" className="mt-6">
      {/* S203: the heading said "Regions in view" while the list's accessible name said "All
          regions" — two different answers to the same question depending on how you read the
          page. Now the list is labelled BY the heading, so they cannot disagree again. */}
      <h2 id="atlas-regions-heading" className="text-sm font-extrabold uppercase tracking-wide text-content-2">All regions</h2>
      {regions.length === 0 ? <p className="mt-3 text-sm text-content-2">No regions in this Atlas.</p> : (
        <ol aria-labelledby="atlas-regions-heading" className="mt-3 grid gap-3 sm:grid-cols-2">
          {regions.map((region) => {
            const active = region.id === activeRegionId;
            const matched = matchedRegionIds === undefined || matchedRegionIds.has(region.id);
            return (
              <li key={region.id} data-region={region.id} data-matched={matched ? "true" : "false"} className={matched ? undefined : "opacity-60"}>
                <Surface border className="h-full rounded-card p-4" aria-label={region.accessibilityLabel}>
                  {/* Text, not opacity, is what carries "no matches here" — opacity would vanish
                      under forced-colors and never reaches a screen reader at all. */}
                  {!matched && <p className="text-xs font-bold text-content-2">No matches here</p>}
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-sky-ink">{gradeBandLabel(region.gradeBand)}</p>
                  <h3 className="mt-1 text-lg font-extrabold">{region.name}</h3>
                  <p className="mt-1 text-sm text-content-2">{region.environmentalGrammar}</p>
                  <p className="mt-2 text-xs text-content-2">{region.courseCount} trails · {region.waypointCount} waypoints</p>
                  <div className="mt-3">
                    <Link href={`/trailhead?region=${encodeURIComponent(region.id)}`} aria-current={active ? "page" : undefined} className={`inline-flex min-h-[44px] items-center rounded-card border-2 px-3 py-2 text-sm font-extrabold ${active ? "border-sky bg-sky/10" : "border-ink/15 dark:border-paper/15"}`}>
                      Enter {region.name}
                    </Link>
                  </div>
                </Surface>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
