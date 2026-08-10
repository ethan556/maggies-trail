import Link from "next/link";
import dynamic from "next/dynamic";
import { COPY } from "@/lib/copy";
import { getCatalog } from "@/lib/content.server";
import { AppIcon, LinkButton, Badge } from "@/components/ui";

const HeroWidget = dynamic(() => import("@/components/HeroWidget"), {
  loading: () => (
    <div className="min-h-56 animate-pulse rounded-card border border-ink/10 bg-white dark:border-paper/15 dark:bg-night" />
  )
});

const PILLARS = [
  {
    icon: "compass" as const,
    title: "Predict, then find out",
    body: "You commit to an answer before you touch the manipulative — then the math shows whether you were right. The surprise is the lesson."
  },
  {
    icon: "target" as const,
    title: "Feedback that names the mix-up",
    body: "Wrong answers get a real diagnosis — which error you made and how to repair it — never just \u201cnope, try again.\u201d"
  },
  {
    icon: "repeat" as const,
    title: "Review that remembers",
    body: "Missed questions come back right when you'd start to forget — 1, 3, 7, 21 days — with fresh numbers each time."
  }
];

function gradeLabel(g: number): string {
  if (g <= 0) return "K";
  if (g >= 13) return "Calc";
  return `G${g}`;
}

export default async function Home() {
  const catalog = await getCatalog();
  const courseCount = catalog.courses.length;
  const lessonCount = catalog.courses.reduce((s, c) => s + c.lessonCount, 0);
  const grades = catalog.courses.map((c) => c.course.gradeLevel).filter((g) => typeof g === "number");
  const gradeSpan = `${gradeLabel(Math.min(...grades))}\u2013${gradeLabel(Math.max(...grades))}`;
  const featured = catalog.courses.slice(0, 6);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-16 pt-10">
      {/* Hero */}
      <section className="grid items-center gap-10 md:grid-cols-[1.05fr_1fr]">
        <div>
          <Badge tone="sky" icon="route" className="mb-4">
            {gradeSpan} math you can touch
          </Badge>
          <h1 className="text-display font-extrabold leading-[1.03] tracking-tight md:text-display-lg">
            {COPY.appName}
          </h1>
          <p className="mt-4 max-w-md text-lg text-content-2">
            A visual math curriculum you <strong className="text-content">slide, tap, and build</strong> — with
            feedback that names your exact mix-up and a review trail that remembers what you missed.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <LinkButton href="/onboarding" size="lg" iconRight="chevronRight">
              Start the trail
            </LinkButton>
            <LinkButton href="/courses" size="lg" variant="secondary">
              Browse courses
            </LinkButton>
          </div>
          <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
            {[
              [courseCount, "courses"],
              [lessonCount, "lessons"],
              [gradeSpan, "grade range"]
            ].map(([v, l]) => (
              <div key={String(l)}>
                <dt className="text-2xl font-extrabold tabular-nums text-content">{v}</dt>
                <dd className="text-xs font-bold uppercase tracking-wide text-muted">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="rounded-card bg-surface p-2 shadow-e2 ring-1 ring-ink/5 dark:ring-paper/10">
          <HeroWidget />
        </div>
      </section>

      {/* Differentiators */}
      <section className="mt-20">
        <h2 className="text-2xl font-extrabold tracking-tight">Why it sticks</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {PILLARS.map((p) => (
            <div key={p.title} className="rounded-card bg-surface-2 p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-card bg-sky/12 text-sky-ink">
                <AppIcon name={p.icon} size={22} />
              </div>
              <h3 className="text-base font-extrabold">{p.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-content-2">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Course showcase */}
      <section className="mt-20">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-2xl font-extrabold tracking-tight">
            {courseCount} courses, Kindergarten through calculus
          </h2>
          <Link href="/courses" className="hidden shrink-0 items-center gap-1 text-sm font-bold text-sky-ink hover:underline sm:flex">
            See all <AppIcon name="chevronRight" size={16} />
          </Link>
        </div>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {featured.map(({ course, lessonCount }) => (
            /* min-w-0: a grid track's auto minimum is the item's min-content width,
               and min-content here is the UNtruncated course title — without this the
               whole landing page scrolls ~950px sideways at phone widths (S121). */
            <li key={course.slug} className="min-w-0">
              <Link
                href={`/courses/${course.slug}`}
                className="lift group flex items-center gap-3 rounded-card bg-surface p-4 ring-1 ring-ink/8 dark:ring-paper/10"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card bg-tangerine/12 text-sm font-extrabold text-[#B5581F] dark:text-tangerine-ink">
                  {gradeLabel(course.gradeLevel)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-extrabold">{course.title}</span>
                  <span className="mt-0.5 block truncate text-sm text-content-2">{course.tagline}</span>
                </span>
                <span className="shrink-0 text-xs font-bold text-muted">{lessonCount}</span>
                <AppIcon name="chevronRight" size={18} className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-sky-ink" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Evidence, not invented social proof. Counts are derived from the live catalogue. */}
      <section className="mt-20">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-2xl font-extrabold tracking-tight">What you can verify</h2>
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted">Product evidence</span>
        </div>
        <ul className="mt-5 grid gap-4 sm:grid-cols-3">
          <li className="rounded-card bg-surface-2 p-5">
            <p className="text-2xl font-extrabold tabular-nums text-content">{lessonCount.toLocaleString()}</p>
            <p className="mt-1 font-extrabold">authored lessons</p>
            <p className="mt-2 text-sm leading-relaxed text-content-2">Across {courseCount} live courses, counted from the same catalogue learners browse.</p>
          </li>
          <li className="rounded-card bg-surface-2 p-5">
            <p className="text-2xl font-extrabold text-content">{gradeSpan}</p>
            <p className="mt-1 font-extrabold">one continuous math trail</p>
            <p className="mt-2 text-sm leading-relaxed text-content-2">Kindergarten foundations through calculus, without switching to a separate high-school product.</p>
          </li>
          <li className="rounded-card bg-surface-2 p-5">
            <p className="text-2xl font-extrabold text-content">State-aware</p>
            <p className="mt-1 font-extrabold">mathematical feedback</p>
            <p className="mt-2 text-sm leading-relaxed text-content-2">Interactive models grade the mathematical state and can diagnose distinct wrong configurations instead of relying on decorative motion.</p>
          </li>
        </ul>
      </section>

      {/* Closing CTA */}
      <section className="mt-20 overflow-hidden rounded-card bg-cta px-6 py-10 text-center text-white shadow-e2">
        <h2 className="text-2xl font-extrabold tracking-tight">Chapter 1 of every course is free</h2>
        <p className="mx-auto mt-2 max-w-md text-white">
          Walk the first chapter of every trail, keep your streak, and watch the review queue work.
        </p>
        <LinkButton href="/onboarding" size="lg" variant="secondary" iconRight="chevronRight" className="mt-5 !bg-white !text-[rgb(var(--cta))]">
          Start the trail
        </LinkButton>
      </section>
    </main>
  );
}
