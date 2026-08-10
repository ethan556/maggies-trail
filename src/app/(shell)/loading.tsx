/**
 * Shell loading state (S111) — trail-shaped, layout-matching.
 * Server component, zero client JS: an inline dashed route with a walking
 * dash (reduced-motion: static) above skeleton blocks that mirror the common
 * shell page shape (heading, stat row, card list), so the loaded page lands
 * with no shift.
 */
export default function ShellLoading() {
  return (
    // A bare <div> has no implicit role, so aria-label on it is PROHIBITED
    // (axe: aria-prohibited-attr) and screen readers may drop the name
    // entirely. role="status" is the correct semantic for a loading region:
    // it permits the accessible name and announces politely, without
    // interrupting whatever the learner is doing.
    <div role="status" aria-busy="true" aria-label="Loading">
      <svg viewBox="0 0 160 24" width="160" height="24" aria-hidden="true" className="text-sky-ink">
        <path
          d="M6 18 C 40 18, 52 6, 84 8 C 110 9.6, 122 14, 150 9"
          fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"
          className="trail-loading-route"
        />
        <circle cx="6" cy="18" r="3" fill="currentColor" />
        <circle cx="150" cy="9" r="4" fill="none" stroke="currentColor" strokeWidth="2.4" />
      </svg>
      <div className="trail-skeleton mt-4 h-9 w-56" />
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="trail-skeleton h-20" />
        ))}
      </div>
      <div className="mt-6 space-y-3">
        <div className="trail-skeleton h-24" />
        <div className="trail-skeleton h-24" />
        <div className="trail-skeleton h-24" />
      </div>
    </div>
  );
}
