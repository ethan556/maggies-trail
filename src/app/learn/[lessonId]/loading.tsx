/**
 * Lesson-route loading state (S111) — the trail clearing, held open.
 * Mirrors the player's shape (waypoint line, stage block, action row) so the
 * lesson lands with no shift; the dashed route walks while the chunk loads.
 */
export default function LessonLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading lesson"
      className="mx-auto min-h-dvh w-full max-w-3xl px-4 py-6"
    >
      <svg viewBox="0 0 160 24" width="160" height="24" aria-hidden="true" className="text-sky-ink">
        <path
          d="M6 18 C 40 18, 52 6, 84 8 C 110 9.6, 122 14, 150 9"
          fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"
          className="trail-loading-route"
        />
        <circle cx="6" cy="18" r="3" fill="currentColor" />
        <circle cx="150" cy="9" r="4" fill="none" stroke="currentColor" strokeWidth="2.4" />
      </svg>
      <div className="trail-skeleton mt-4 h-6 w-72" />
      <div className="trail-skeleton mt-3 h-4 w-full max-w-lg" />
      <div className="trail-skeleton mt-5 min-h-72 w-full" />
      <div className="mt-5 flex justify-end gap-3">
        <div className="trail-skeleton h-11 w-28" />
        <div className="trail-skeleton h-11 w-36" />
      </div>
    </main>
  );
}
