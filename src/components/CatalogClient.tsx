"use client";

import { AppIcon } from "@/components/ui";
import { courseIcon } from "@/lib/personalize";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { gradeBandLabel } from "@/lib/copy";
import { learnerGradeBand } from "@/components/DashboardClient";
import { progressStore } from "@/lib/progress";

export interface CatalogCourseProps {
  slug: string;
  gradeLevel: number;
  title: string;
  tagline: string;
  lessonCount: number;
  totalMinutes: number;
  chapterCount: number;
  lessons: Array<{ id: string; title: string }>;
}
export interface UpcomingProps {
  slug: string;
  title: string;
  tagline: string;
  gradeLevel: number;
}

function CourseCard({ c, showBand = false }: { c: CatalogCourseProps; showBand?: boolean }) {
  return (
    <Link
      href={`/courses/${c.slug}`}
      className="lift group block min-w-0 rounded-card bg-surface p-4 ring-1 ring-ink/8 hover:ring-sky/50 dark:bg-dusk dark:ring-paper/10"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex min-w-0 items-center gap-2.5 text-lg font-extrabold tracking-tight">
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-sky/10 text-sky-ink transition-colors group-hover:bg-cta group-hover:text-white"
          >
            <AppIcon name={courseIcon(c.title)} size={17} />
          </span>
          <span className="truncate">{c.title}</span>
        </h3>
        {showBand && (
          <span className="whitespace-nowrap rounded-pill bg-tangerine/10 px-2 py-0.5 text-[11px] font-extrabold text-tangerine-ink">
            {gradeBandLabel(c.gradeLevel)}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-content-2">{c.tagline}</p>
      <p className="mt-3 text-xs font-bold text-muted">
        {c.lessonCount} lessons · {c.chapterCount} chapters · ~{c.totalMinutes} min
      </p>
    </Link>
  );
}

export default function CatalogClient({
  courses,
  upcoming
}: {
  courses: CatalogCourseProps[];
  upcoming: UpcomingProps[];
}) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  // The learner's grade band, so search can rank by relevance TO THIS LEARNER.
  // Without it, "fractions" returned Grade 1 hits first for a Grade 6 kid —
  // pure catalog order. Null (no profile signal) keeps catalog order.
  const [band, setBand] = useState<number | null>(null);
  useEffect(() => {
    try {
      const p = progressStore.load();
      setBand(
        learnerGradeBand(
          p,
          courses.map((c) => ({
            slug: c.slug,
            title: c.title,
            tagline: c.tagline,
            comingSoon: false,
            gradeLevel: c.gradeLevel,
            chapters: [],
            lessonIds: c.lessons.map((l) => l.id),
            firstLessonId: null,
            after: [],
            conceptTags: []
          }))
        )
      );
    } catch {
      setBand(null);
    }
  }, [courses]);

  const results = useMemo(() => {
    if (!query) return null;
    // Stable rank: distance from the learner's band first (their level floats
    // to the top), then grade ascending (prerequisites before extensions),
    // preserving catalog order within a band. With no band signal, this is
    // exactly the old catalog order.
    const rank = (g: number) => (band === null ? 0 : Math.abs(g - band));
    const courseHits = courses
      .filter((c) => c.title.toLowerCase().includes(query))
      .sort((a, b) => rank(a.gradeLevel) - rank(b.gradeLevel) || a.gradeLevel - b.gradeLevel);
    const lessonHits = courses
      .flatMap((c) =>
        c.lessons
          .filter((l) => l.title.toLowerCase().includes(query))
          .map((l) => ({ ...l, courseTitle: c.title, gradeLevel: c.gradeLevel }))
      )
      .sort((a, b) => rank(a.gradeLevel) - rank(b.gradeLevel) || a.gradeLevel - b.gradeLevel);
    return { courseHits, lessonHits };
  }, [query, courses, band]);

  return (
    <div>
      <label className="block">
        <span className="text-sm font-bold text-ink/70 dark:text-paper/70">
          Search courses and lessons
        </span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Try “arrays” or “rounding”…"
          className="mt-1 w-full rounded-card border border-ink/12 bg-surface px-4 py-3 text-base outline-none transition-colors focus:border-sky focus:ring-2 focus:ring-sky/25 dark:border-paper/15 dark:bg-dusk"
        />
      </label>

      {results ? (
        <div className="mt-6 space-y-6">
          <section aria-label="Matching courses">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted">
              Courses ({results.courseHits.length})
            </h2>
            {results.courseHits.length === 0 ? (
              <p className="mt-2 text-sm text-muted">
                No course titles match “{q.trim()}”.
              </p>
            ) : (
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {results.courseHits.map((c) => (
                  <CourseCard key={c.slug} c={c} showBand />
                ))}
              </div>
            )}
          </section>
          <section aria-label="Matching lessons">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted">
              Lessons ({results.lessonHits.length})
            </h2>
            {results.lessonHits.length === 0 ? (
              <p className="mt-2 text-sm text-muted">
                No lesson titles match “{q.trim()}”.
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-ink/8 overflow-hidden rounded-card bg-surface ring-1 ring-ink/8 dark:divide-paper/8 dark:bg-dusk dark:ring-paper/10">
                {results.lessonHits.map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/learn/${l.id}`}
                      className="flex min-h-11 items-center justify-between gap-3 px-4 py-2 hover:bg-sky/5"
                    >
                      <span className="flex-1 font-bold">{l.title}</span>
                      <span className="whitespace-nowrap rounded-pill bg-ink/6 px-2 py-0.5 text-[11px] font-bold text-muted dark:bg-paper/10">
                        {gradeBandLabel(l.gradeLevel)}
                      </span>
                      <span className="hidden text-xs text-muted sm:inline">{l.courseTitle}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {Array.from(new Set([...courses.map((c) => c.gradeLevel), ...upcoming.map((u) => u.gradeLevel)]))
            .sort((a, b) => a - b)
            .map((g) => (
              <section key={g} aria-label={`${gradeBandLabel(g)} math`}>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted">
                  {`Math · ${gradeBandLabel(g)}`}
                </h2>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {courses
                    .filter((c) => c.gradeLevel === g)
                    .map((c) => (
                      <CourseCard key={c.slug} c={c} />
                    ))}
                  {upcoming
                    .filter((u) => u.gradeLevel === g)
                    .map((u) => (
              <div
                key={u.slug}
                className="rounded-card border border-dashed border-ink/15 bg-surface-2 p-4 dark:border-paper/15"
                aria-label={`${u.title} — coming soon`}
              >
                <h3 className="text-lg font-extrabold text-muted">{u.title}</h3>
                <p className="mt-1 text-sm text-muted/80">{u.tagline}</p>
                <p className="mt-3 inline-block rounded-pill bg-tangerine/10 px-2.5 py-1 text-xs font-bold text-tangerine-ink">
                  Coming soon
                </p>
                      </div>
                    ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}
