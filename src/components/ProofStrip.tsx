/**
 * A compact evidence strip backed by the same server-loaded catalogue values as the hero.
 * The totals render in the initial HTML and never animate from zero, so a fresh load, slow
 * hydration, crawler, or assistive-technology snapshot always receives canonical values.
 */
export function ProofStrip({
  courseCount,
  lessonCount,
  gradeSpan
}: {
  courseCount: number;
  lessonCount: number;
  gradeSpan: string;
}) {
  return (
    <section className="mt-20">
      <p className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 rounded-card bg-surface-2 px-5 py-5 text-center text-base font-bold text-content-2">
        <span aria-label={`${courseCount} courses`}>
          <span className="font-extrabold tabular-nums text-content">{courseCount.toLocaleString()}</span> courses
        </span>
        <Dot />
        <span aria-label={`${lessonCount} lessons`}>
          <span className="font-extrabold tabular-nums text-content">{lessonCount.toLocaleString()}</span> lessons
        </span>
        <Dot />
        <span className="font-extrabold text-content">{gradeSpan}</span>
        <Dot />
        <span className="font-extrabold text-content">state-aware feedback</span>
      </p>
    </section>
  );
}

function Dot() {
  return (
    <span aria-hidden="true" className="text-muted">
      &middot;
    </span>
  );
}
