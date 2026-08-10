# Session 201 — World Parity Before Rollout

## Outcome

S201 closes the four ordered capability gaps opened by the Session 200 Pattern Valley pilot without
changing the lesson player, authored lesson JSON, derivation, scheduler, seeded ordering, or
local-first progress model.

## Step 1 — Atlas search / filter / sort

**Shipped**

- Global course-title search over all 129 courses.
- Server-side lesson-title search over all 1,667 lessons through `/api/atlas-search`.
- Explicit grade filter and recommended / grade / title sorting.
- Empty-results state and live search status.
- `AccessibleRegionList` remains the semantic catalogue path and is filtered with the query.
- Search, grade, and sort controls exist in Minimal, Guided, and Immersive modes.
- Course hits link to canonical Basecamps; lesson hits link directly to waypoints.

**Payload design and measurement**

- Initial client index: course id/title/grade plus compact lesson-id/grade pairs, preserving completed-work grade inference without shipping lesson titles.
- Initial serialized prop: 33,755 bytes raw / **7,340 bytes gzip**.
- Lesson-title corpus remains server-side: 122,149 bytes raw / 22,948 bytes gzip.
- World manifest remains server-side: 252,313 bytes raw / 39,685 bytes gzip.
- A production-build route bundle delta could not be measured because `npm ci` could not resolve
  `zustand@5.0.14` from the sandbox registry. No build-bundle result is claimed.

**Tests added or changed**

- non-pilot course query;
- lesson-title query;
- explicit empty state;
- grade-filtered semantic list;
- mode contract expanded to include inputs and selects;
- forced-colors Atlas search and region entry;
- real-browser non-pilot course and lesson search.

The mode-equivalence assertion was expanded, not weakened: filter controls are part of the
functional contract and must exist in every presentation mode.

## Step 2 — Engagement systems below the dominant action

**Shipped**

- Daily goal, XP, streak, league standing, freeze disclosure, and mastery recommendation now render
  in a compact support block after `[data-primary-action]`.
- The dominant action remains singular and continues to use the existing `dominantAction` priority
  ladder. Review is promoted through `repair`; no second primary CTA was introduced.
- `dashboardRecommendation` was moved into `src/lib/dashboardRecommendation.ts` and is shared by
  Dashboard and Trailhead.
- Streak freezes are persisted and explicitly disclosed to the learner.

**Test intent change**

The old test asserted that XP and streak were absent. S201 correctly replaces that assertion with
DOM-order and hierarchy assertions: engagement metrics must exist **after** the single primary
action. The test was not deleted or weakened to accommodate implementation.

## Step 3 — Basecamp for all 129 courses

**Shipped**

- `courseWorld(courseId)` returns the target course plus its full transitive prerequisite closure.
- A cross-region fixture pins target-course derivation from the course slice to derivation from the
  full manifest.
- `/basecamp/[courseId]` resolves all courses, not only the pilot region.
- `/courses/[slug]` permanently redirects to the corresponding Basecamp. Basecamp is the canonical
  course surface; there are not two independently maintained course UIs.

**Legacy syllabus affordance audit**

| Existing affordance | S201 Basecamp result |
|---|---|
| Course category, icon, title, tagline | Ported |
| Lesson / chapter / time scope | Ported as lesson / landmark / time scope |
| Hydration-safe progress skeleton | Ported |
| Completed count and progress bar | Ported |
| Continue / start / rewalk action | Ported |
| Chapter completion and next marker | Ported as landmark state |
| Practice link | Ported |
| Test-out link | Ported |
| Premium soft disclosure | Ported |
| Lesson title and minutes | Ported |
| Connected route rail | Ported |
| Mastery Studio | Ported |
| Standalone `/courses/[slug]` UI | Intentionally removed; permanent canonical redirect |

No functional syllabus affordance was dropped. Terminology changes are world-semantic equivalents,
not capability removals.

## Step 4 — Region rollout and adversarial review

**Shipped**

- Every Atlas region links to a region-specific Trailhead.
- Trailhead validates the requested region and derives a scoped world with prerequisite closure.
- All Basecamps remain global.
- Forced-colors, grayscale, adult-surface containment, non-pilot route, and 4x CPU-throttled trace
  test sources were added.

**Still unverified**

- Young-learner comprehension: requires actual learners; no proxy is substituted.
- Older-learner tone: structurally age-neutral but not user-tested.
- Real low-end hardware: the 4x CPU trace is a reproducible proxy only.
- Human visual review of adult surfaces.
- New Vitest and Playwright execution in this sandbox, because dependency installation failed.

## Authored content

- Added lesson JSON: 0
- Removed lesson JSON: 0
- Changed lesson JSON: 0
- Session 200 → Session 201 hash comparison: **1,667/1,667 byte-identical**

The seven-place content authorization trap was not triggered.
