# Known limitations

These are explicit product seams, not hidden green claims.

## External services not yet connected

- **Email delivery:** verification, magic-link, and password-reset flows generate single-use links and write them to SQLite `mail_outbox`. No SMTP/SES worker drains the outbox yet.
- **Billing:** checkout and account entitlement in the learner UI are demonstrations. No payment processor, webhook verification, refund handling, or server-authoritative subscription lifecycle is connected.

## Deployment boundary

- The durable backend uses SQLite and therefore requires one application node with a writable persistent volume. It is not safe to place independent application nodes over separate database files.
- `AUTH_PEPPER` is mandatory in production. Auth routes fail closed with 503 when it is absent.
- Backups and retention purges are implemented as commands, but the hosting environment must schedule and monitor them.

## Classroom transport

The server supports authenticated class creation, learner joins, and teacher-owned roster reads.
Since Session 113 there is also a durable, cross-device class surface — `/teach/class/[classId]`
(assignments, tier board, intervention cases) — and a learner-side "From your teacher" card, both
reading the audited server tables.

What is still true: the **device-local `/teach` store does not hydrate from the server**. A fresh
teacher device shows no previously created classes until the teacher navigates to a class URL
directly, and device-local classroom reporting remains the complete UI path for the local store.
The two class systems are decoupled by design; unifying them is future work.

## Verification still owed in each release environment

- Run the full typecheck, unit/integration, content-schema, pedagogy, native-integrity, production build, Playwright, and dependency-audit gates after `npm ci` succeeds.
- **`npm run lint` is runnable again (Session 113 final pass).** The script was migrated off
  the deprecated `next lint` onto the ESLint CLI with `.eslintrc.cjs` (`next/core-web-vitals` +
  `next/typescript`; every deliberate rule deviation is documented in the config header with its
  reason). The gate exits 0 with **0 errors**; 188 warnings remain, all on legacy code
  (55 × `no-explicit-any`, the rest underscore-convention `no-unused-vars`) — kept as warnings
  so new violations still surface in every run while the backlog burns down as tracked work.
  The accompanying `prefer-const` fixes split 16 mixed declarations *preserving seeded `pick()`
  call order*; the 3,866-test variant gate (byte-identical output per seed) proves no stream
  shifted. Flat-config migration rides the Next 16 session.
- Run a real-device screen-reader and keyboard sweep after material UI changes; source-level semantics and automated accessibility tests do not replace that review.
- Validate outbound email URLs and SQLite volume/backup behavior against the final deployed origin and host.

## Session 101 findings (2026-07-24)

### Content defect awaiting a one-word human fix — RESOLVED in Session 113
`content/courses/decimal-operations/lessons/dop-02-02.json` step `k3` carried a `predict`
block on `"kind": "check"`. The pedagogy lint (correctly) requires prediction steps to be
`interactive` — 598 of the corpus's 599 predict steps followed that convention, and k3's
widget (`columnCalc`) is a genuine manipulative, so the fix was `"check"` → `"interactive"`.
Applied in Session 113; `npm run lint:pedagogy` now reports **1139/1139**. The defect
predated Session 101: the lint is tsx-backed and had not executed since Session 98
(registry unreachable in 99–100). Full note in `VARIANT_LOG.md`.

### CML causal-advisory backlog — triaged and formally acknowledged
`npm run cml:lint:strict` passes (exit 0) and additionally reports 250 advisories:
218 × `prediction-not-causal` (a prediction not attached to, or followed within three
steps by, direct mathematical manipulation) and 32 × `flagship-response-heavy` (a
flagship lesson that outside its causal pilot step remains answer-entry/recognition).
Both classes describe authored step sequencing, which only a content session may change.
Triage outcome: real, non-blocking, uniformly distributed across older course material,
and already the roadmap's stated direction (CML conversion). They are acknowledged here
so the strict gate's green cannot be mistaken for "no advisories".

### Dependency audit floor under the Next 15 invariant
`npm audit` reports 2 high advisories after remediation: `next` (all 15.x flagged; the
upstream fix ships in 16.3, a major upgrade the session invariants forbid) and its
bundled `sharp`. `brace-expansion` was fixed in-lock this session (3 → 2). Clearing the
final two requires a dedicated Next 16 migration session.

### Gates whose one flag is the environment, not the tree
- `validate:native` flags exactly one path: `node_modules/` — definitionally present in a
  working checkout (`npm ci` is mandated) while the gate audits a *shipped archive*. All
  genuine violations found this session (scratch probe scripts with host-absolute paths,
  `tsconfig.tsbuildinfo`) were deleted; every other check passes.
- Playwright's browser CDN (`cdn.playwright.dev`) is egress-blocked here. E2E runs green
  (3/3 against the production build) using a CDP-compatible Chromium 149 installed from
  the allowed npm registry (`@sparticuz/chromium`, dev-only) via the env-gated
  `PW_CHROMIUM_EXE` override in `playwright.config.ts`; unset, behavior is stock.

## Session 102 finding — the err=3 consistency check is a count, not a mapping

`engineCapabilities.test.ts` enforces that the number of reveal-ghost testids in
`widgets.tsx` is at least the number of engines rated `err: 3`. A per-engine audit run
this session shows the two sets are not identical: of the 60 engines now rated err=3,
**51 carry a ghost inside their own component body and 9 do not** —
`coordinateProofLab`, `covariationScrubber`, `samplingBiasLab`, `shapeFamilyBuilder`,
`solidSliceLab`, `triangleAngleLab`, `triangleConstraintLab`, `unitRuler`,
`verticalLineScanner`.

This is not necessarily nine wrong ratings. Those engines teach error live rather than
on reveal (a triangle collapsing onto its twin, a scan line failing the vertical-line
test, an ambiguous SSA case showing both candidates at once), which is the same
pedagogical goal by a different mechanism, and several also render their target
permanently — the standing `fb-ghost` rule says a target-visible build needs no ghost.
The honest statement is that the current gate cannot distinguish "teaches error by a
non-ghost mechanism" from "over-rated", and a per-engine gate would therefore need a
documented allowlist. Recorded here rather than silently tightening or loosening the
gate; deciding it requires a per-engine pedagogical review, not a script.

Related: `sb-ghost` is used by two different engines (`solveBalance` and the series
builder). Harmless at runtime — one widget renders at a time — but the testid namespace
is not unique, so any future cross-widget query must scope to the rendered engine.

## Session 107
- RESOLVED: automated accessibility — axe route sweep now a committed gate
  (e2e/a11y.spec.ts), 19/19 routes zero serious/critical on the production build.
- RESOLVED (S109): the landmark/heading moderates — nested <main>s on
  /standards, /standards/review, /premium became <div>s (shell owns the
  landmark); FamilyDashboard's five h3s → h2; the lesson play screen's
  waypoint title is now its <h1>. The a11y gate asserts ZERO violations of
  ANY impact across 19 routes × both themes.
- RESOLVED (S108): dark-mode axe sweep automated — the gate now runs 19 routes
  × both themes (38 tests), zero serious/critical; dark -ink tokens re-solved
  against TOOL-MEASURED worst surfaces (scripts/dark-contrast-dump.ts), not
  arithmetic — see SESSION_NOTES §108 for the values and basis.
- RESOLVED (S108, emulated): forced-colors pass — globals forced-colors block
  keeps stage line-work/borders/focus visible; pinned by e2e/forced-colors.spec.ts.
  Still owed: on-device Windows HCM visual review (ACCESSIBILITY_CERTIFICATION.md).


## Session 113
- ADDED: institutional layer (districts/schools, OneRoster CSV rostering,
  assignments, tier dashboard + intervention cases, district reporting with
  cohort suppression, LTI 1.3 login/launch). Fully additive and server-side;
  with no durable DB every institutional surface degrades to a calm empty
  state. Zero new deps; LTI signature verification is node:crypto only. See
  INSTITUTIONS.md.
- KNOWN LIMITATION: AGS scores are QUEUED into lms_outbox, not delivered — this
  deployment makes no outbound HTTP. The drain worker is the documented seam.
- KNOWN LIMITATION: reporting growth-over-time is intentionally absent
  (growthSeries refuses to fabricate history; needs a snapshot table).
- RESOLVED (same session, later pass): the learner dashboard assignment card is
  wired ("From your teacher"). The roster child id IS the server learner id
  (sync's claim-on-first-push), so no mapping layer was needed. The card is
  strictly additive: signed out / DB-less / unassigned all render nothing.
- FIXED (a11y, found by running the Playwright axe gate): the shell loading
  region was a bare <div> carrying aria-label, which ARIA prohibits on an
  element with no implicit role (axe: aria-prohibited-attr, serious) — screen
  readers could drop the name entirely. It now carries role="status", which
  permits the name and announces politely. The lesson loading state was already
  correct (<main> has an implicit role). The same defect was caught and fixed in
  the new class-page tier dot (bare <span> → role="img").
- E2E NOTE: the axe gate audits pages after `networkidle`. On a memory-
  constrained container the dev server can still be compiling when networkidle
  resolves, so axe audits the loading SKELETON and reports
  `page-has-heading-one` (the skeleton has no <h1>). This is an environment
  artifact, not a page defect — the same run passes `/` and `/daily`. A
  production-server run is the reliable way to execute this gate.
- KNOWN LIMITATION: activeDays14 counts distinct first-completion dates in the
  trailing 14 days (durable signal available); a pure-review day with no first
  completion is not counted. Documented in INSTITUTIONS.md §8.
- NOTE: the durable class page (/teach/class/[classId]) is reachable directly
  and via /api/class listings, but the device-local /teach store does not yet
  deep-link into it (the two class systems are decoupled by design this session).

### Session 113 documentation + integrity sweep (same session, final pass)
- FIXED: six native `<button>` elements in the new `/admin` and `/teach/class/[classId]`
  clients shipped without an explicit `type`, which `npm run validate:native` flags (an
  untyped button inside a form submits it). Caught only because the sweep ran a gate the
  session's own checklist omitted. `validate:native` has since been added to the CLAUDE.md
  gate sequence so it cannot be skipped again.
- CONFIRMED CURRENT: `PRODUCT_STATE.md` regenerates byte-identically
  (`node scripts/gen-product-state.mjs`), so every catalogue count cited in README and
  elsewhere — 84 courses, 1,129 lessons, 10,487 steps, 100 widget types, 94 manipulatives —
  matches disk.
- REMAINING ENVIRONMENT FLAGS: `validate:native` still reports `node_modules/` and `.next/`
  in a working checkout. Both are definitionally present after `npm ci` and are excluded from
  the shipped archive; the gate audits an archive, not a dev tree.
- FIXED: `/admin` and `/teach/class/[classId]` had **no `<h1>` in any state** — `SectionHeader`
  always emitted `<h2>` and `EmptyState`'s title is a `<p>`, so axe reported
  `page-has-heading-one` on both routes in both themes. `SectionHeader` gained an
  `as?: "h1" | "h2"` prop (default `h2`, so all 40+ existing call sites are untouched and the
  visual size is unchanged) and both pages now render a document heading in *every* state,
  including loading, denied, and empty. Both routes were added to the axe sweep, which is now
  **42/42** across 21 routes × 2 themes.
- E2E FLAKE, NOT A DEFECT: under parallel workers on a loaded container, axe's `page.evaluate`
  on `/dashboard` and `/review` (the two heaviest client-rendered routes) can exceed the 30 s
  test timeout. Re-run single-worker against a fresh production server they complete in 4.1 s
  and 2.7 s with zero violations. If these two routes fail with a *timeout* rather than a
  violation list, suspect the container before the code — and re-run with `--workers=1`.

## S114 — tse-04-03 not converted (large-magnitude pans)
`5x + 20 >= 50` needs 50 unit tiles on one pan; the 44px tap-target floor makes 70 targets
unreadable at 360px. Lesson stays on its authored mcq (Tier B). Natural fix: base-ten grouping
inside the solveBalance pan (a ten-rod tile), which also unlocks larger G7 story equations.

## S115 — RESOLVED (S117): tg-02-03's ghost lab landed, via a moved formalization step
S115 built the lab and withdrew it because `i1` was the lesson's ONLY notation-entry step, so
converting it dropped `formal` below the §9.2 bar. Closed under mandate by ADDING rather than
editing: the authored `numeric` widget was moved byte-identically onto a new `i1b` after the lab
(hashed before the move, re-asserted after the splice), so every authored word survives and entry
now FOLLOWS manipulation — `formal` 2 → 3. The ghost kind was re-derived and S115's assignment was
wrong for this lesson: it teaches the half-period slide, where BOTH coordinates flip (the antipode),
which is `ghost: "sum"` with `ghostAngle: 180` — not `negate`, which is the θ → −θ reflection where
only sine flips. C → A (31).

## S115 diagnosis, RESOLVED S119 — but not by the fix S115 proposed
S115 read the diagnosis, not the step, and proposed an exact-ratio angle-snapping mode for
`unitCircleExplore`. Reading `i1` itself shows the lesson never asks for an angle in degrees at
all: it gives opposite=3, hypotenuse=5 and asks for the adjacent leg -- an exact Pythagorean-triple
computation (answer 4, tolerance 0), matching its own concept step's instruction to "draw the
helper right triangle." `distanceGrid` -- already registered, integer-only, documented as showing
"the distance formula as the Pythagorean theorem" -- draws exactly that triangle (two legs plus a
hypotenuse, live `sqrt(dx^2+dy^2)` readout) with ZERO engine work. Converted: **C -> A (31)**.
No unitCircleExplore mode was needed. The corrected lesson: measure the actual step before
proposing an engine change, even when an earlier session's diagnosis sounds authoritative.

## S116 — cx-02-01 not converted (segment-partition ratio has no engine)
P divides AB in ratio m:n from A. This is a point dragged along ONE segment between two fixed
endpoints — a genuinely different shape than `coordinateProofLab`'s three-fixed-plus-dragged-4th
quadrilateral model, and no existing engine represents it. Natural fix: a `segmentPartition` mode,
or relaxing `coordinateProofLab.fixed` to accept 2 points for this narrower claim family. Lesson
keeps its authored numeric entry.

## S116 — RESOLVED (S117): cx-03-02 converted by re-posing the CLAIM, not the vertices
The lesson asks whether a given rhombus is also a square. A `quadDrag` staging ("drag S until it
becomes a square") is unsolvable by construction here: the three fixed vertices (0,0), (5,0), (8,4)
have equal sides but the angle at Q is not 90°, so no fourth point completes a square — verified by
sweeping `quadName` over the whole integer grid (zero squares found). The attempt was made, caught
by the solvability gate, and reverted. Natural fix: re-pose the lesson on a different quadrilateral
whose three fixed points ARE three corners of a square — but that would edit authored content, so
it needs an explicit mandate.

**S117: resolved, and the content edit turned out to be unnecessary.** The reachable claim is *a
rhombus* (fourth vertex (3, 4), all sides 5), and the lesson's own question is "one more check
decides square vs rhombus — which, and what's the verdict?". The lab now asks the learner to make
the four sides equal and READ WHAT THE SHAPE CALLS ITSELF; the live classifier says rhombus, and
its refusal to say square IS the answer. The deciding check runs in the success feedback as a
number: diagonals √80 and √20 (verified d((0,0),(8,4))² = 80, d((5,0),(3,4))² = 20), unequal, so
the corners are not right angles. Authored vertices untouched. C → A (33).

## S116 — cx-02-02 and tc-02-01 not converted (converting would break a LIVE variant contract)
Both steps carry a `variant` declaration whose generator serves a different widget surface than the
conversion would install (`cx-parallel-proof__numeric` → numeric; `tc-hl__mcq` → mcq). Those
generators exist and fire, so converting the surface silently stops the step refreshing — the step
trades live, independently-answer-checked freshness for a one-off lab. Both were converted, caught
by the `variants.resolver` surface gate, and reverted. Natural fix: author a matching
`coordinateProofLab`- / `triangleConstraintLab`-surface form on each generator, then convert. Until
then the authored steps stay, and keep their freshness.

## S116 — RESOLVED: the five classical compassConstruct modes now have lessons
Originally logged because `angleBisector`, `perpAtPoint`, `perpFromPoint`, `parallelThroughPoint`
and `copyAngle` shipped with no lesson able to take them — the cp- lessons teaching those
constructions carry `steppedReveal` prose that must not be deleted. Resolved under explicit
mandate: each lesson gained ONE new interactive lab step inserted AFTER its stepped reveal
(cp-01-03, cp-02-01, cp-02-02, cp-02-03 at `i1b`; cp-01-01 at `i2b`), so the prose is read first
and then performed. No authored content was rewritten. Those four lessons moved C → A.
(Note: the original entry said "four modes"; measured, it was all five — `perpBisector` and
`hexagon` were the only modes with lessons.)

## S116 — RESOLVED IN S120: pq-04-02 and showMidsegment
The S116 diagnosis was wrong about the cause, and the wrong cause hid a defect for four sessions.
It read: *"`pq-04-02`'s two variant-free steps are a degenerate-limit question … and a computation
on bases 30 and 12, which do not fit a 10-unit grid"*, and proposed a `trapezoidMidsegment` mode
or a grid-scale option.

The real blocker was neither. `showMidsegment`'s own integrity gate rejected any shape `quadName`
called "just a quadrilateral" — and `quadName` had **no trapezoid case**, so the gate refused every
trapezoid that exists. The enhancement was unreachable for its intended use from the day it
shipped, and its only demonstration (the `/dev/widgets` sample) was a parallelogram, where the
midsegment readout is degenerate.

S120 replaced the shape-name proxy with a direct parallel-base test (`hasParallelBasePair`) and
gave `quadName` a trapezoid case, ordered after the kite branch so no existing name changes.
`pq-04-02/i2` now carries the lab on bases 8 and 4 — midsegment exactly 6, on the existing grid,
with the starting corner deliberately placed where there is no parallel pair so the precondition
is seen to fail before it is seen to hold. No new mode and no grid-scale option were needed.
Lesson tier C → **A**. Pinned by `src/lib/conversions.s120.test.ts`.

## S120 — three playbook prescriptions that the engines as built cannot express

Measured by reading every remaining C/D lesson in the three blocks against the engine schema on
disk, not against the playbook's table. This is the §11 residue the playbook budgeted for
("fit was verified by reading, not by building"), now located precisely instead of estimated.

**1. `cx-` (coordinate proofs) — the playbook's "every cx- lesson maps directly" does not survive
contact.** §3.2 assigns the whole course to `coordinateProofLab`. That engine is a *quadrilateral*
vertex drag with slope / midpoint / distance evidence and `targetClaim` limited to
`parallelogram | rectangle | rhombus`. The nine remaining C lessons are not that shape of problem:
`cx-02-01` partitions a segment by ratio, `cx-03-01` classifies *triangles*, `cx-04-01/02/03` are
perimeter, box-method area and the shoelace formula, and `cx-05-03` intersects a circle with a
line. Their interactive steps are computations on given coordinates, not invariants discovered by
dragging a fourth vertex. Forcing the lab in would mean editing prose to match a widget, which the
frozen-content rule forbids and which would be the wrong trade anyway.

*What would actually unblock them:* a triangle-claim mode (`targetClaim: "right" | "isosceles" |
"scalene"` over three vertices, with the side/angle audit as the evidence tabs) serving cx-03-\*,
and an area/perimeter readout mode serving cx-04-\*. Two moderate additions to an existing engine,
not a new one. Until they exist these lessons keep their authored numeric entry, which is honest
for shoelace and perimeter — those genuinely are computations.

**2. `re-` (Block 6 residue) — `extraneousRootLab` is narrower than §7.2's table assumes.** As
built it models `scale·√(x + c) = m·x + b`, integers only. §7.2 assigns `re-04-03` (Radical =
Radical, `√(3x − 2) = √(x + 8)`) and the cube-root contrast it names as the block's key
counter-example. Neither is expressible: there is no right-hand radical and no odd index. The
`phantomRoot: null` field exists for "squaring invents nothing", but the lesson's own step asks
specifically about *cubing*.

*What would unblock them:* a right-hand radical (`line` becomes a second curve) and an
`index: 2 | 3` field, with the fold animation suppressed for odd indices — which is exactly the
point being taught. Until then `re-04-03` and `re-05-\*` keep their authored form; the two lessons
that fit (`re-04-01`, `re-04-02`) already run the lab. `re-01-\*` and `re-02-\*` are legitimately
formalization-heavy and the playbook does not list them.

**3. RESOLVED IN S120 — `sy-04-\*` needed a figure no engine could draw.** §3.4 asked for an
"altitude-to-hypotenuse drag in `dilationExplore` segments mode". `SideSplitterW` places both cut
points at the same fraction along two sides, so its cut is parallel to the base by construction and
can never be a perpendicular from the right angle. The prescription named a figure the engine could
not draw, which is why these three lessons survived every earlier authoring pass at Tier C.

S120 built the `altitude` stage on `dilationExplore` — a re-staging in the same style `segments`
established, so no new widget type. The apex is placed at height √(p·q), the Thales semicircle, so
the right angle is a consequence of the construction rather than a claim in the prose. sy-04-01,
sy-04-02 and sy-04-03 are all Tier **A**.

## S116 — sy-03-02 not converted (the engine cannot pose the converse)
`SideSplitterW` interpolates D and E at the same parameter t along two sides, so its cutter is
parallel BY CONSTRUCTION and can never render a non-parallel cut. The side-splitter CONVERSE asks
"given these ratios, IS it parallel?" — the engine would display a parallel line while asking the
learner to decide whether it is parallel. Natural fix: an independent-D/E mode where the two cut
points move separately and parallelism becomes an outcome rather than a premise.

## S116 — PARTLY RESOLVED: G6 decimal/division lessons
Originally three lessons (ns-02-01, ns-02-02, ns-02-03) blocked because every place-value engine
is integer-only. **ns-02-02 is resolved**: `columnCalc.decimals` renames the columns past ones into
tenths/hundredths and draws an aligned point, while keeping all arithmetic in exact integers
(8.60 + 0.75 authored as a: 860, b: 75, decimals: 2). D (24) -> A (32).

**ns-02-03 is also resolved — but by a better representation, not an engine change.** The blocker
above was a correct diagnosis of `columnCalc` and a wrong diagnosis of the LESSON. Its step is
"Compute 0.6 x 0.7", and its sibling i1 asks the question the lesson actually turns on: how many
decimal places does the answer need? Column arithmetic can produce 0.42 but cannot show WHY it has
two places. `probabilityArea` can: on a unit square cut into hundredths, a block 6 tenths wide and
7 tenths tall covers 42 small squares, and each small square IS a tenth of a tenth. The place count
stops being a digit-counting rule and becomes a fact about the grid. No engine work; the engine
already existed. D (24) -> A (31).

**One remains, and the reason is now precise:**
- **ns-02-01** — the original entry said "no divide mode". Re-reading the lesson corrects that: its
  step is "verify 936 / 24 = 39 by computing 24 x 39", so what it needs is a TWO-DIGIT MULTIPLIER,
  not division. `columnCalc` caps the multiplier at 2-9 because `columnCalcReachable` enumerates
  exactly one partial-product pass (`(A[i] ?? 0) * b`). Two digits means two partial-product rows
  plus a final addition: three interacting move-sequences instead of one, a different grid
  geometry, and a reachability enumeration that is a different algorithm rather than a wider loop.
  A scoped engine project, not a field addition.

**Also still open (no longer blocking any lesson): `columnCalc` decimal multiply.** Blocked on the
renderer, not the arithmetic. `ccPt` emits the point as a fixed separator cell after column index
`decimals` in EVERY row, and that shared alignment is deliberately the content of the add/subtract
lesson. A product's point sits elsewhere, and the model breaks down further when the product needs
more decimal places than the operand grid has columns (0.6 x 0.7 scales to a single-digit grid but
a two-place answer). Needs per-row point positions and a grid that widens for the result.

## S116 — RESOLVED: ns-03-03 unblocked by areaModel.requireFactors
`areaModel` graded on `targetArea` alone, so for 8 + 12 = 20 it accepted 1x20, 2x10 and 4x5 alike
and could not demand the GREATEST common factor. Resolved by adding an optional `requireFactors`
pair plus a required `factorFeedback`, with integrity refusing five ways to misconfigure it and a
test pinning that ungated areaModel behaviour is unchanged. ns-03-03 converted, C (22) -> A (33).

## S116 — RESOLVED (S117 measurement): the 9th surface IS gated, in three links
`scripts/engine-capabilities.json` is the ninth, and it is NOT type-checked: a new widget type
missing from it silently falls back to `{manip:0, conseq:0, err:1, adapt:0, a11y:2, mobile:2,
polish:1}`, which scores BELOW a trivial engine. `extraneousRootLab` shipped without an entry and
the symptom was re-04-02 getting WORSE on conversion (B 28 -> B 27) despite gaining a full
laboratory; with the entry it is A 34. Nothing in the build or test suite catches this, because the
JSON is read only by the reporting scripts. Natural fix: a test asserting every member of the
`WidgetSpec` union has a capability entry.

**S117: measured, and that gate already exists — twice over.** The entry above was stale: it
described the fix as still owed when S116 had already shipped it.

1. **Directly.** `src/lib/engineCapabilities.coverage.s116.test.ts` is exactly the "natural fix"
   the paragraph above asks for: it introspects `WidgetSpec._def.options` for every `type` literal
   and asserts each has a capability row, that no row names an unregistered type, and that all
   seven dimensions are numbers in 0–3 — plus a guard that the introspection itself has not
   silently broken (it fails if fewer than 50 types are found).
2. **Indirectly, as a three-link chain** that would have caught it anyway:
   `widgets.registry.test.ts` pins `WidgetSpec.options` ↔ `REGISTERED_WIDGETS`;
   `stageWidth.test.ts` pins `REGISTERED_WIDGETS` ↔ `STAGE_TIER`; `engineCapabilities.test.ts`
   pins `STAGE_TIER` ↔ the capability table — every link bidirectional, with no-phantom-row
   assertions and a count equality on each side.

A new engine therefore cannot ship without rating itself, and the silent
`{manip:0, conseq:0, …}` fallback cannot recur. Re-verified green this session. **No new test was
written**: the correct action was to measure the tree and correct the note, not to add a fifth copy
of a gate that already holds. Recording the failure mode itself, since it cost real time twice: a
KNOWN_ISSUES entry that names a fix as owed is not evidence the fix is missing — the tree is.

## S116 — RESOLVED: extraneousRootLab wired into processEvents (adapt: 0 -> 3)
The probe now emits direction against whichever root the phase is about, and the SQUARE button
emits too — necessarily, because `one-control-fixation` fires when four moves sit on one control
while the other was never touched, so a silent button would have told a learner who correctly
squared that they never had. Six tests pin the contract, including that exact false-accusation
case. re-04-02: A 34 -> A 36.

## S116 — rf-04-03 (horizontal asymptotes) has no fitting engine
Two candidates fail for reasons in the engines. `signChart` cannot place the lesson's numerator
root (x = −1/3; `roots.x` is integer-typed), and more fundamentally its sketch is deliberately
schematic — a hump per interval, "the sketch follows YOUR signs", with no y-scale — so a
quantitative settle-line would assert precision the widget does not have. `graphZoom` magnifies
around a FINITE point to classify a limit; a horizontal asymptote is a limit at infinity, a
different question with no channel in that schema. Natural fix: an end-behaviour engine that zooms
OUT rather than in, showing the curve flattening toward its ratio-of-leading-coefficients.

## S116 — ft-04-02 (composition) cannot use functionMachine without erasing the concept
`functionMachine` models one machine, y = a·x + b. The composite f(g(x)) = 2x + 3 IS representable
as a single machine (a = 2, b = 3) and would even grade correctly — but the lesson's own predict
asks "which function runs FIRST?", so collapsing two stages into one deletes the thing being
taught. Natural fix: a `chain` mode carrying two machines in series with a visible intermediate
readout.

## S118 — RESOLVED: `binomialAreaLab` built; and the "seven lessons" claim was too broad
The engine is built and registered across all ELEVEN surfaces, with `ep-03-01/03-02/03-03` authored
on it (D 24 → **A 35** each). Sides are (pX·x + a) by (qX·x + b); the learner drags the two constant
partitions and watches the two strips resize independently, which is what makes the middle
coefficient visibly a SUM rather than a product. Negative partitions draw outside the block in
berry as area taken away, so (x + 6)(x − 6) loses its middle term by visible cancellation.

**The original entries over-counted.** They named seven Tier-D `ep-` lessons. Measured against the
lessons: `ep-01-01` (2³ · 2⁴), `ep-01-02` ((2⁴)²) and `ep-01-03` (5⁰, 2⁻³) are exponent RULES, and
`ep-02-01` is degree and like terms — none is a product of two linear factors, and a rectangle
would misrepresent them. Exactly three lessons were blocked; all three are converted. **The other
four remain Tier D and are a separate, unsolved problem** — an exponent-rule engine would need to
show repeated multiplication being counted, which nothing in the registry does.

## S118 — the engine registration contract is ELEVEN surfaces
S116 corrected the standing note from eight to nine. Measured again this session by sweeping the
newest engine across the whole tree, it is eleven: `schema.ts`, `evaluate.ts` (THREE switches —
grade, `canCheck`, `correctAnswerText`), `widgets.tsx` (component, registry switch, **and the
hand-maintained `REGISTERED_WIDGETS` array**), `widgetSamples.ts`, `stageWidth.ts`,
`describeState.ts`, `pedagogy.ts`, `masteryMission.server.ts`, `processEvents.ts`, and
`scripts/engine-capabilities.json`. `REGISTERED_WIDGETS` is not derived from the union and does not
break typecheck when stale — it was caught by `stageWidth.test.ts` failing with a 101-vs-100 diff,
the three-link chain S117 documented doing exactly its job.

## S118 — RESOLVED (partly), and the original claim was too broad: the ep- cluster
`binomialAreaLab` is built (11-surface contract complete, 25 tests) and **ep-03-01, ep-03-02 and
ep-03-03 are converted, all D -> A (35)**.

**The claim of "seven blocked lessons" was wrong, measured against the lessons rather than the
entry.** `ep-01-01/01-02/01-03` are exponent RULES (2^3 * 2^4 to a single power, (2^4)^2, 5^0 and
2^-3) and `ep-02-01` is degree and like terms. None is a product of two linear factors; a
partitioned rectangle would misrepresent them rather than reveal them. Exactly THREE lessons were
blocked on this engine and exactly three are converted.

**Still open, and a genuinely different problem:** ep-01-01/01-02/01-03 and ep-02-01 remain Tier D.
Exponent rules are about what happens to EXPONENTS under multiplication, division and nesting --
the natural manipulative is an expanded-factor strip (2^3 as three 2s, 2^4 as four, pushed together
to count seven) rather than an area rectangle. No registered engine does that. `ep-02-01` (degree,
like terms) is a classification task and may be a legitimate KEEP. Neither is served by this build.

## S116 — the original entry (SUPERSEDED by S118 above)
`ep-03-01/03-02/03-03` (monomial products, FOIL, special products) are all Tier D. `algebraTiles`
builds only a LINEAR expression (`targetX·x + targetConst`) with no x² channel, so (x+2)(x+3)
cannot be laid out, and `areaModel` handles numeric area only. Natural fix: a partitioned-rectangle
mode with sides (x+a) and (x+b) and four labelled regions — x², ax, bx, ab — which makes the
middle coefficient visibly a+b rather than a rule to recall.

## S118 — RESOLVED (partly), and the original scope was WRONG
`binomialAreaLab` is built and registered across all eleven surfaces; ep-03-01, ep-03-02 and
ep-03-03 run on it, D → **A (35)** each. Sides (pX·x + a) and (qX·x + b), two draggable constant
partitions, four regions; the middle coefficient is visibly the SUM of two strips that share a side
of length x, and negative constants render outside the block as area taken away (so the difference
of squares cancels on screen). The add-vs-multiply misconception is a reachable STATE, protected by
an integrity rule that refuses any authoring where the sum and the product coincide — (x + 2)² is
rejected for exactly that reason.

**The original entry named seven lessons and only three were ever blocked on this.** Measured
against the lessons: ep-01-01/01-02/01-03 are exponent RULES (2³·2⁴, (2⁴)², 5⁰, 3⁴/3⁶) and
ep-02-01 is degree and like terms. None is a product of two linear factors; a rectangle would
represent nothing about them. Those four remain Tier D and are a DIFFERENT gap — naming this
engine as their fix would send a future session to build the wrong thing. Natural fix for them:
an exponent-rule engine where the repeated factors are visible as a countable strip
(2³·2⁴ as three tiles beside four, joined into seven), which is a genuinely separate build.

**The registration contract is ELEVEN surfaces, not nine.** Measured by
`grep -rl extraneousRootLab src/ scripts/`. The eleventh is `REGISTERED_WIDGETS` in `widgets.tsx` —
a string array, so typecheck does NOT catch an omission. It was missed this session and caught by
`stageWidth.test.ts` with a 101-vs-100 diff. The three-link chain confirmed in S117 earned its keep
on the very next engine.

## S116 — SUPERSEDED by the entry above (original text kept for the record)
Seven D-tier lessons (ep-01-01, ep-01-02, ep-01-03, ep-02-01, ep-03-01, ep-03-02, ep-03-03) are all
`numeric` with a predict — the "prediction stapled to a static step" pattern. `algebraTiles` builds
only a LINEAR expression (`targetX * x + targetConst`, no x² channel), so (x + 2)(x + 3) cannot be
laid out; `areaModel` is numeric area only, with no algebraic labels on its sides. The classic
partitioned rectangle for binomial products — x², x, x, 1 tiles arranged to show FOIL as area — is
a genuine engine gap, not a conversion. Natural fix: a 2D tile variant of `algebraTiles` (or a new
`binomialAreaLab`) with two linear factors as side lengths and an x²/x/const tile count as the
graded value.

## S117 — sg-04-02/04-03 not converted (no ring cross-section in the solid enum)
A tube's horizontal section is an ANNULUS, area πR² − πr² — which is exactly the quantity these
lessons contrast with the classic wrong answer π(R − r)². `solidSliceLab.solid` is an enum of four
primitives (prism, cylinder, cone, sphere); none has a ring section, so the lab cannot draw the
shape the lesson is about. Natural fix: a `tube` solid with inner and outer radii, whose sweep
shows the annulus area holding constant — which would also serve the Cavalieri framing already in
the course. Lessons keep their authored mcq/numeric.

## S117 — sg-05-02/05-03 not converted (density and cost are whole-solid ratios)
Average density (mass ÷ outer volume) and cost-per-unit-volume are properties of an entire solid,
not of a cross-section. A slice sweep would display a quantity these lessons never ask about, so
the engine that fits the course does not fit these two steps. `dilationExplore` already serves the
k/k²/k³ content at sg-05-01. No engine gap — a genuine scope boundary.

## S117 — rf-03-01/03-02/03-03 not converted (non-integer numerator roots)
The sums reduce to (2x + 7)/(x − 1) and (5x + 3)/(x(x + 1)), whose zeros are −7/2 and −3/5.
`signChart.roots.x` is `z.number().int()`, so the chart cannot place the root it would need to
divide on. Same integer-lattice constraint that blocked rf-04-03 in S116, reached from a different
direction — which makes a rational-root option on `signChart` (a `{num, den}` root form with an
exact-fraction axis label) the single change unblocking the most remaining rf- lessons.

## S117 — rf-02-03 not converted (its excluded value is neither pole nor hole)
The chain's exclusion at x = 3 is a sign-CHANGING zero of the reduced function: the curve reaches
it, so it is not a pole, and the sign flips there, so it is not a hole (a hole is sign-neutral by
the engine's own contract, which is what makes the pole/hole distinction teachable). Authoring it
as either ships a chart that is false about the function. The engine is right to have no channel
for it; what the lesson needs is a restriction LEDGER alongside the chart — a list of excluded x's
with the operation each came from — which is a display addition, not a new cut type.

## S117 — cp-04-03 not converted (angleMeasure cannot lock two readouts together)
The vertical-angle lesson wants two angle readouts that stay equal through a drag — the thing a
static diagram can only assert. `angleMeasure` drags ONE opening against a target and grades that
opening; it has no second ray-pair and no invariant readout. Natural fix: a `verticalPair` mode
drawing both crossing lines, with the two vertical readouts live and locked and the two adjacent
readouts summing to 180° — the same one-drag-two-invariants shape `triangleSolve` ratios mode uses.
Size S–M. The lesson keeps its authored numeric and dragOrder proof (a legitimate KEEP).


## S118 — the engine registration contract is ELEVEN surfaces, not nine
S116 corrected the note from eight to nine. Measured again this session by sweeping the newest
engine (`grep -rl extraneousRootLab src/ scripts/`), it is **eleven**:

`schema.ts` (spec + union + type export + integrity gate + shared truth fn) - `evaluate.ts`
(grading + `canCheck` + `correctAnswerText`) - `widgets.tsx` (component + type import + registry
switch + **`REGISTERED_WIDGETS`**) - `widgetSamples.ts` - `stageWidth.ts` - `describeState.ts` -
`pedagogy.ts` - `masteryMission.server.ts` - `processEvents.ts` (MULTI_CONTROL + direction cues +
per-control fixation copy) - `scripts/engine-capabilities.json`.

`REGISTERED_WIDGETS` is the one missed while building `binomialAreaLab`. It is a SEPARATE export
from the registry switch **in the same file**, so a file-level grep looks complete while the
contract is not. It was caught immediately by the three-link chain (`stageWidth.test.ts` failed
with a 101-vs-100 array diff naming the new type) -- the gate S117 measured and declined to
duplicate has now paid for itself.

## S118 — two edit hazards in the two largest files
Both self-inflicted this session, both caught by typecheck, both easy to repeat:
1. **Anchoring a replacement ON the union declaration line deletes it.** Replacing
   `export const WidgetSpec = z.discriminatedUnion("type", [` with content ending at that line left
   the member list dangling after a function body (TS1128 at the union's `]);`). Anchor on a line
   you intend to keep, or re-emit it.
2. **Cases in the `widgets.tsx` registry switch are not uniformly braced.** `extraneousRootLab` is
   brace-less; inserting a `{`-braced case after it produced an unmatched pair. Check the specific
   neighbour, not the file's general style.

## S119 — the cx-02-01 / tc-04-* "one engine, 4 lessons" estimate was too broad
S117's priority ranking listed "coordinateProofLab: 2-fixed-point segmentPartition mode +
three-line-concurrency evidence -- cx-02-01 + tc-04-* (4 lessons, one engine)." Reading the actual
tc-04-* steps this session: tc-04-01 (circumcenter/incenter) and tc-04-03 (choosing the right
center) are matching/sorting tasks -- WHICH lines define WHICH center, WHICH property each has --
the same legitimate-keep classification class already documented for cp- and gf-. Only
tc-04-02/i1 (the centroid's 2:1 median ratio) is a genuine numeric fact a lab could verify, and it
alone does not justify a "three-line-concurrency evidence type" build spanning four different
center constructions (perpendicular bisectors, angle bisectors, medians, altitudes).

**Real scope: cx-02-01 only**, and it is honest residue, not solved this session. Its i1, i2 and
ch steps are all genuinely segment-partition-shaped (P divides AB in ratio m:n, both directions --
find the ratio given P, and find P given the ratio). No registered engine fits without distorting
the geometry: `coordinateProofLab` is a 3-fixed-vertex-plus-dragged-4th CONSTRUCTION tool (a bare
two-point segment has no fourth vertex to drag); `distanceGrid` is single-anchor distance, with no
ratio concept; `dilationExplore`'s segments mode needs a triangle side to cut, and inventing a
fake third vertex to reuse it would draw structure the lesson does not have. A lightweight
`segmentPartition` engine (anchor two fixed points, one point constrained to the segment via a
single interpolation parameter, live ratio + coordinate readouts) remains the honest fix -- smaller
than `extraneousRootLab`/`binomialAreaLab` (one interpolation, no branching truth function), but a
full engine build nonetheless, deferred to a session with room to finish the 11-surface contract.

## S119 — RESOLVED: fractionBar could not draw an improper fraction
`seg(count, shaded)` drew exactly `count` parts and shaded the first `shaded`, so any numerator
above the denominator filled every part: **7/4 was pixel-identical to 4/4** while the aria-label
correctly read "7 of 4 parts shaded". Two shipped lessons author improper targets (`fa-04-01` 7/4,
`ns-01-03` 7/3), so this was live, not hypothetical -- learners saw a picture of one whole and were
asked to reason about more than one.

Fixed: the bar spans `ceil(n/d)` wholes, each cut into `d` parts, with a dashed rule at every whole
boundary crossed. Proper fractions are geometrically unchanged. Pinned by
`fractionBar.improper.s119.test.tsx` (6 tests), including the bug itself (7/4 must not render as
4/4) and the unchanged-proper-case regression risk.

**Why no gate caught it:** the a11y sweep and keyboard gate check structure and labelling, and the
label was correct throughout. A defect that lives only in the drawing needs a test that counts what
was drawn. Worth remembering for the next visual engine.

## S119 — fm-05-01 / fm-05-03 blocked on fractional hops (unchanged from S116)
Both are measurement division: "how many 1/2s fit in 4?". `fractionBar` builds ONE fraction and
cannot show N wholes partitioned into unit pieces and counted. `numberLineHop` is the right shape
and its `hop`/`min`/`max` are integer-typed, so a 1/2-hop is not representable -- the same
constraint recorded in S116 for ns-01-01. Natural fix: a rational-hop mode on `numberLineHop`
(hop as a fraction with a common-denominator lattice), which would also unblock ns-01-01 and
ns-01-02. That is one engine change serving at least four lessons across two grade bands, and is
the strongest remaining fraction-side candidate.

## S119 — RESOLVED: numberLineHop rational hops (`denom`)
Recorded three times (S116 for ns-01-01; S119 for fm-05-01/fm-05-03) as "integer-only, a 1/5 hop
is not representable". Closed with an additive-optional `denom`: every integer on the spec is read
as a COUNT OF 1/denom UNITS and the axis renders true fraction labels via the shared `hopLabel`
truth function, so the numbers on screen are the question's numbers. The evaluator needed NO change
-- grading was always integer-exact and still is, so determinism is untouched. Integer specs parse
with no injected key and render identically (asserted first in the suite).
Unblocked: fm-05-01 C -> A (33), fm-05-03 C -> A (34), ns-01-01 C -> A (33).
Pinned by `numberLineHop.rational.s119.test.tsx` (18 tests), including sweeps asserting no label
contains a decimal point and every label reads back to exactly units/denom across denominators
2-12.

## S119 — ns-01-02 still needs a genuine two-track hop mode
The playbook's idea -- run the divide-by-(a/b) track and the multiply-by-(b/a) track and watch them
land identically -- is right, and the new rational lattice does NOT deliver it. Measured on the
lesson's own numbers: i2 is 2/3 / 4/9, which on ninths is 6/9 / 4/9 = **1.5 hops**, and `hops` is
integer-typed, so the landing is unreachable on a single track. i1 ("the reciprocal of 3/8") is a
naming task; `fractionBar` building 8/3 would show the number without showing why it is the
reciprocal -- a relationship, not a build. Natural fix: a second-track mode carrying two hoppers
with independent hop sizes over one axis, with a shared-landing readout. That would also serve
ns-03-01/ns-03-02 (GCF/LCM), which S116 deferred for the same single-track reason -- so it is one
mode serving at least three lessons.

## S119 — RESOLVED: ns-03-01 (GCF) via numberLineHop hop-SIZE mode
S116 deferred it with an exact diagnosis: "the greatest common factor is a property of two hop
SIZES, not of one landing, and this engine grades a single landing." Correct at the time. Hop-size
mode adds the missing channel -- the learner sets the STRIDE and watches per-mark hit/skip, and the
GCF is the biggest stride hitting every mark. ns-03-01 B (27) -> A (33). Additive-optional: landing
specs parse with none of the five new keys injected and render unchanged (asserted first in the
22-test suite). Both wrong paths are reachable states and the integrity gate refuses a spec whose
reachable path lacks its feedback, an unsolvable range, or -- the subtle one -- a range where every
stride hits every mark, which has no contrast case.

## S119 — ns-03-02 fidelity item (not a tier issue)
`ns-03-02/i1` is a `numberLineHop` whose prompt reads "Stop at the first place a 5-hopper would
also land" -- but the widget draws only ONE track, so the 5-hopper exists in the prose and in three
feedback strings ("5 goes 5, 10, 15") and nowhere on screen. The lesson is already Tier A (33) with
no gaps, so this moves no metric; it is a faithfulness gap, not a scoring one. A ghost second track
(landings of a second hop size drawn as marks) would close it, and is the same mode ns-01-02 needs
for its two-track comparison -- worth building for those two together rather than for either alone.

## S119 — tm-03-03 (AA similarity) has no two-triangle engine
The AA criterion is a claim about TWO triangles and no registered engine draws two.
`triangleConstraintLab`'s criterion enum is SSS/SAS/ASA/AAS/HL/SSA -- congruence criteria, with AA
absent by construction (AA does not give congruence). `dilationExplore` draws a shape and its
scaled image, which PRESUMES similarity rather than testing it: the learner would judge whether two
triangles are similar while looking at a picture that already assumed it. Natural fix: a
two-triangle comparison mode where each triangle's angles are set independently and a live verdict
reports whether the shapes match up to scale -- which would also serve the sy- similarity-criteria
lessons the playbook assigns to `triangleConstraintLab`.

## S119 — tm-05-01 (cylinder volume) has no circular-base volume engine
`volumeBuilder` builds rectangular prisms (l x w x h) with no circular base. `solidSliceLab` grades
a slice POSITION, and every cross-section of a cylinder is identical, so no position is
distinguishable and `targetFraction` would be arbitrary. Natural fix: a cylinder mode on
`volumeBuilder` (drag r and h; the base disc's area and the accumulated pi*r^2*h both read live),
which would also serve tm-05-02/03 and the G8 cone/sphere lessons if extended.

## S119 — RESOLVED: shapeParts engine built
The entry below is closed. `shapeParts` draws the figure and makes its own parts the tap targets:
polygon (3-10 sides), cube, rectangularPrism, squarePyramid, cylinder, with sides/corners for the
flat shape and faces/vertices for the solids. Solids use oblique projection with hidden edges
dashed so back corners are findable. Grading is SET-based -- the value is which parts were tapped,
not a total -- so "counted one corner twice and missed another" is caught where a bare number could
not distinguish it from a correct count. 11 steps converted across 5 lessons, all reaching Tier A.
Every derived count was verified against the lesson's own authored answer before writing.
Pinned by `shapeParts.s119.test.tsx` (25 tests), including Euler's V - E + F = 2 for every solid.

**Accessibility note learned here:** the first renderer used `<g role="button" tabIndex={0}>` in
the SVG and `auditNativeControls` rejected it -- anything presented as pressable must BE a button.
Rewritten with the SVG `aria-hidden` and real `<button>` elements positioned over the figure, each
44px minimum with its own accessible name. The gate forced a genuine improvement.

## S119 — SUPERSEDED: the original shape-parts entry
The three Grade 1 lessons count a shape's sides, faces and corners. `tapDiagram` is the only
tap-to-count engine and it places ICONS at coordinates on a blank canvas -- it never draws the
figure, so "tap each side of the triangle" would present no triangle and the learner would count
floating markers. Natural fix: a `shapeParts` mode that renders a named polygon or solid and makes
its own sides / faces / vertices the tappable hotspots, with a running count. Serves at least these
three and the adjacent K-2 geometry lessons.

## S119 — RESOLVED: lengthCompare difference mode
The entry below is closed. `mode: "difference"` grades the OVERHANG: both bars from a shared
baseline with unit ticks, the stretch by which the longer one sticks out shaded, and the learner
counts that. Converted all six "how many more" steps the measurement pass found -- smg1-03-02
(C -> A 31), mmt-02-02 and mmt-05-03 (both C -> A after a predict was added to close a
`prediction: 0` gate). Nine integrity refusals, including one that keeps the count-the-whole-bar
misconception REACHABLE (a `diffMax` below the longer bar would turn its diagnosis into dead copy).
Pinned by `lengthCompare.difference.s119.test.tsx` (25 tests).

**Contract note learned here:** capability ratings in `engine-capabilities.json` are per widget
TYPE, so wiring `onEvent` into ONE mode of a multi-mode engine forces `adapt: 3` on the whole type
and credits every other mode's lessons with process evidence they do not have. The difference mode
therefore deliberately does not emit events -- pick mode cannot (a categorical tap has no ordinal
target for `moveRelation`), so the honest rating is the one the type already carried.

## S119 — RESOLVED (superseded): lengthCompare grades a pick, the lesson asks a difference
"A pencil is 5 paperclips long and an eraser is 3 -- how many more?" `lengthCompare` draws exactly
this picture, per-unit tick marks included, but `mode: "pick"` grades WHICH BAR the learner taps.
Converting would grade "the pencil" when the answer is 2. Natural fix: a `difference` mode that
keeps the two tick-marked bars and grades the count of units by which one overhangs the other --
which is what comparison subtraction IS, and would serve the whole K-2 "how many more" family.


## S119 — RESOLVED: covariationScrubber drew duplicate rows at a bound
Found via a React duplicate-key warning emitted during the keyboard sweep, in a widget this session
had not touched. The five-row value window clamped each cell independently
(`Math.max(min, Math.min(max, x + i - 2))`), so at a bound it collapsed: x = 0 with inputMin = 0
gave `[0, 0, 0, 1, 2]` -- duplicate React keys, and three IDENTICAL rows in a table whose entire
job is showing neighbouring values. Fixed by sliding the window
(`lo = max(min, min(x - 2, max - 4))`) instead of squashing it. Regression test sweeps every x
across every bound pair in range, asserting distinctness and in-bounds.

Worth noting how it was found: not by a failing assertion but by a WARNING printed during a passing
test run. A green suite can still be telling you something.

## S119 — RESOLVED: quadraticExplore had NO process instrumentation (adapt: 0)
Seven of eighteen lessons using this engine sat at Tier D with `manip conseq adapt` gaps, even
though five already used `quadraticExplore` steps -- the engine itself carried `adapt: 0` while
comparable engines carry 3, because neither branch (vertex or roots) wired `onEvent`. Fixed by
wiring both genuinely rather than editing the capability row: each root is scored against whichever
target it sits nearer to, so a correct pair held in the opposite order -- (x-3)(x+2) is the same
parabola as (x+2)(x-3) -- is never reported as moving away. The vertex drag reports both h and k
together, since one drag moves both. Per-control fixation copy added for all five controls.
Raised `adapt` 0 -> 3 only after both branches genuinely emitted. Tier A 508 -> 515, D 43 -> 36 --
the single largest Tier-D drop from one change this session. Pinned by
`quadraticProcess.s119.test.tsx` (10 tests).

**Also caught by this change:** two `\uXXXX` escapes written directly in JSX text/attributes (which
do not interpret them the way template literals do) would have shown literal backslash-u sequences
on screen instead of ² and −. Caught immediately by the `noLiteralEscapes.s119.test.tsx`
sweep built earlier this session, on the very next sample added to it -- the sweep paying for itself
one pass after being written, the same story as the operability sweep's `denom` gap.

## S119 — RESOLVED: g7-02-* circle measures via circleMeasureExplore radiusScale
The entry above is closed. `mode: "radiusScale"` drags the RADIUS and recomputes diameter,
circumference and area together, so "C = 2*pi*r doubles, A = pi*r^2 squares" -- the misconception
g7-02-03's own concept step names -- becomes a divergence the learner watches rather than a warning
they read. All readouts are exact integers (pi carried symbolically). g7-02-01 B -> A (31),
g7-02-02 D -> A (31), g7-02-03 D -> A (31). Pinned by `circleRadiusScale.s119.test.tsx` (29 tests).
The integrity gate refuses targetRadius < 3: at r = 2 the two coefficients coincide (both 4), which
the suite proves is the only coincidence in range.

## S119 — the shared keyboard gate cannot reach a new mode behind an existing sample
`widgets.keyboard.test.tsx` resolves samples with `byType`, which takes the FIRST sample of each
widget type. Adding `radiusScale` as a second `circleMeasureExplore` sample therefore left it
untested by the shared gate -- the earlier `chordDistance` sample still claims the slot. Its
keyboard drive lives in `circleRadiusScale.s119.test.tsx` instead.

**This applies to every multi-mode engine.** Any new mode added behind an existing sample is
invisible to the shared keyboard and a11y sweeps and must carry its own coverage. A stronger fix
would be to have the gate iterate ALL samples of a type rather than the first, which would also
retroactively cover `lengthCompare` difference mode and `numberLineHop`'s rational and hop-size
modes -- worth doing, and larger than a one-line change because each mode needs its own
drive-to-correct steps.

## S119 — RESOLVED: tm-05-* round-solid volumes
`volumeBuilder` gained `solid: "prism" | "cylinder" | "cone" | "sphere"`. The round modes swap
l/w/h for radius and height and report the volume as an EXACT reduced multiple of pi, because the
lessons' content is a set of coincidences that rounding destroys: cylinder(3,4) = 36pi, cone(3,4)
= 12pi (exactly a third), sphere(3) = 36pi (equal to the cylinder). tm-05-01 D -> A (33),
tm-05-02 C -> A, tm-05-03 B -> A. `prism` is the default, so every existing spec is unchanged.
Pinned by `roundSolidVolume.s119.test.ts` (20 tests).

## S119 — HAZARD: a duplicate `case` in a switch silently kills the earlier one
Adding round-solid checks as a SECOND `case "volumeBuilder"` in `widgetIntegrityErrors` compiled
cleanly and disabled every existing prism lock-reachability check, because the first case wins.
Nothing that named the new code failed; `constrainedBuilders.s51` caught it only because it asserts
a specific error STRING that had quietly stopped being produced.

**Rule:** when extending an engine that already has an integrity block, EXTEND that block. Before
adding any `case`, grep the switch for the literal first -- `grep -n 'case "<type>"' src/lib/schema.ts`
should return exactly one line per switch. The same hazard applies to `evaluate.ts`, which has three
switches over the same union.

## S119 — HAZARD: route on the positive, not the negative, when adding a mode
`VolumeBuilderW` routed with `spec.solid !== "prism"`, so a spec that skipped zod's defaults
(`solid === undefined`) fell into the NEW branch, received the old value shape, and produced NaN --
which recursed forever in a gcd helper and blew the stack. Test as
`solid === "cylinder" || "cone" || "sphere"` so an unparsed or unexpected spec fails toward the
pre-existing behaviour. Helpers that recurse on arithmetic should also guard `Number.isFinite`.

## S119 — RESOLVED: three mathematical release blockers
Each shipped a FALSE mathematical claim. All fixed with adversarial suites (115 tests total) that
fail against the old behaviour.

1. **Inequality solution-set equivalence.** `solveBalance` graded an inequality at ONE witness
   value, so `x > 3` passed for `x > 4` (both true at the witness x = 5), as did `x >= 4`. Now
   every claim reduces to a canonical solution set (half-line with a reduced-fraction boundary,
   point, all, or none) and is compared AS A SET. The comparator reversal on dividing by a negative
   lives in one function so no caller can omit it. Boundaries are exact integer arithmetic.
2. **Unit-circle causal representation.** One vertical leader line claimed "the point's height IS
   the trace value" for all three traces — true only for sine. Cosine now reads the HORIZONTAL
   coordinate via a quarter-turn arc; tangent uses the tangent-line intersection at x = 1 and is
   reported undefined at asymptotes. The circle stays a UNIT circle at every amplitude (it was
   being scaled by |amp|), and the graph scale no longer divides by |amp|, which had exactly
   cancelled the amplitude it was meant to show.
3. **Triangle-constraint geometry.** The released isosceles state used
   `otherBase = 180 - apex - baseAngle * 0.72`, displaying 196.8 degrees of angle at apex 60 — an
   impossible triangle shown as fact. The midsegment mode's two readouts were both the constant
   `sideA / 2` with no geometry behind them. Both now derive from ONE coordinate model, with angles
   from the law of cosines (summing to 180 by construction) and the midsegment measured between the
   points it is actually drawn between.

**The shared lesson:** all three had passing tests before. What none of them had was a test that
computed the expected value INDEPENDENTLY and compared. A test that asks the engine what it thinks
and agrees with it will never find a false claim.

## S119 — RESOLVED: asv-05-02 (fractional prism edges) via volumeBuilder denomL
`volumeBuilder` only counted whole unit cubes; "1/2 x 2 x 3" had no representation. Added `denomL`
-- the length tick is a count of 1/denomL units, reusing the `numberLineHop.denom` /
`doubleNumberLine.denom` pattern for the third time this session. A dedicated renderer draws a
length ruler (true-fraction tick labels, whole-unit boundary marks -- the fractionBar idiom reused)
crossed with a flat w-by-h grid, rather than forcing the isometric unit-cube loop to fake partial
cubes. asv-05-02 D -> A (33). Pinned by `volumeFractionalEdge.s119.test.tsx` (21 tests).

**A proven fact, not an assumption:** whenever the fractional formula (l/denom)*w*h lands on an
integer within a lattice starting at 1, that integer is ALWAYS also reachable as a plain integer
product in the same lattice -- confirmed by exhaustive search (denom 2-7, dims up to 19, including
prime-flavoured asymmetric bounds), zero counterexamples. So `wholeUnitFeedback` is required
UNCONDITIONALLY whenever `denomL` is set, not conditionally on a reachability check that would
never actually fire the "unreachable" branch. The search is preserved in the test file itself.

**If this pattern is needed a fourth time:** the shared shape is now `hopLabel(raw, denom)` for
display plus a truth function computing `raw/denom` (or similar) for the graded quantity. Any
future engine wanting a fractional-tick lattice should reuse this shape rather than re-derive it.

## S119 — RESOLVED: fn-03 geometric sequences via sequenceBuild.geometricTerm
A THIRD, distinct mode from `geometric` (which is the infinite-series/tenths-ratio case) -- this
one is a finite growing sequence a_n = first*r^(n-1) with r a small whole-number drag. All nine
fn-03-* steps converted, all reaching Tier A. Pinned by `sequenceGeometricTerm.s119.test.tsx`.

## S119 — RESOLVED: seven more qu- lessons via quadraticExplore roots form
qu-02-01/02-02/02-03/03-01/03-02/04-02/04-03 converted onto the roots form built earlier this
session -- factoring, square-root solving and the quadratic formula are all "find the two
x-intercepts" once posed that way. qu-03-03 (the Discriminant) deliberately excluded: it asks for a
discriminant VALUE and a solution COUNT from coefficients, a different task from dragging to two
roots, and remains the cluster's one honest Tier D.

## S119 — RESOLVED: pr-01-* unit rates via ratioTable's new fraction mode
Declined earlier this session because doubleNumberLine renders 1/4 as "0.25"; a `denom` extension
to doubleNumberLine was then measured and found to fit only 1 of 3 steps (the others need
sixteenths/twentieths against a max step of 8). ratioTable has no step-lattice constraint at all,
so it fits all three, rendering through the same `hopLabel` proven for numberLineHop -- reused a
fourth time this session. pr-01-01/i1, pr-01-03/i1, pr-01-03/i2 converted, all Tier A.

## S119 — RESOLVED: three sequenceBuild steps opened pre-solved (real defect, self-caught)
The fn-03 conversion script used a blanket `start: 2`; two target ratios in the batch are also 2,
so fn-03-02/i3 and two fn-03-03 steps opened already showing the answer. Caught by
`content.widgets.audit.test.ts` on its first pass over this content, by name, for all three.

**Hazard recorded:** the schema's `start` default is 1, but the RENDERER's slider has a hardcoded
`min={2}` for geometricTerm mode. Moving a broken start to 1 (the schema default) would have created
a state/display mismatch rather than a fix -- the stored value would sit below the slider's own
floor. The three steps were moved to `start: 5` instead, independently verified against
`geometricTerm` not to coincide with any target ratio before the write. Any future geometricTerm
authoring must pick a start within [2, rMax] that provably differs from the target, not merely a
schema-valid integer.

## S120 — 73 duplicated prediction prompts/reveals in pre-existing content
`scripts/measure/predict-qa.mjs` sweeps all 784 `predict` blocks and reports 73 hard failures,
every one a prompt or reveal reused verbatim somewhere else in the corpus. `ti-01-01/i1` carries
both the prompt AND the reveal of `tg-03-01/i1`; `vec-03-01`, `vec-03-02` and `vec-03-03` all
carry `pc-03-01`'s prompt word for word — four lessons across two courses sharing one prediction.

Invisible to every existing gate, because each copy is individually well-formed: valid outcome,
distinct options, substantive reveal. Only a corpus-wide comparison sees it.

Not rewritten here. Fifty-three predictions were authored this session and none of them duplicates
anything; fixing the seventy-three legacy copies is a separate authoring pass with its own review,
and silently rewording authored content to make a gate go green is the wrong trade. Run
`node scripts/measure/predict-qa.mjs` for the list, and `PREDICT_QA_WARN=1` for the advisory
warnings (binary predictions and low-vocabulary-overlap prompts) alongside it.

## S120 — a test that rotted on the wall clock (fixed)
`NotebookClient.test.tsx` asserted the fading cue is ABSENT for a skill with `mastery: 0.8` and a
hardcoded `lastSeen: "2026-07-16"`. That skill comes due at 7 + 30·ln(0.8/0.7) ≈ 11.0 days, so the
test passed for eleven days and then began failing for reasons unconnected to the component. Fixed
by dating the fixture to the day the test runs, which is what "not fading" actually means. The
other hardcoded `lastSeen` fixtures pass an explicit TODAY into the function under test and are
deterministic; the fading-cue assertion was the only one reading the real clock.

## S121 — the registration contract is TWELVE surfaces, not eleven
`pedagogy.ts`'s `widgetWrongPaths` switch is exhaustively typed over the widget union, so tsc
catches an omission — but it was missing from the standing note and cost a typecheck cycle on
`unitChain`. Full list to complete in one session: schema spec · schema union · schema type
export · schema integrity gate · evaluate grading · evaluate canCheck · evaluate
correctAnswerText · pedagogy widgetWrongPaths · widgets renderer + switch ·
widgets REGISTERED_WIDGETS · stageWidth tier · widgetSamples (+ describeState and
engine-capabilities where the engine holds SVG state).

For engines whose diagnosis is DERIVED rather than authored, `widgetWrongPaths` returns the
authored surface (landings + fallback) and `flagship-tier.mjs` counts the derived worlds —
otherwise the tier audit scores a rich engine as having no misconception coverage.

## S121 — vitest timeouts under CPU contention are not defects
Running two vitest invocations concurrently (or vitest alongside `gen-product-state.mjs`, which
shells out to `vitest list`) pushes `solve-trig-all` and `in-definite-power` past the 5s default
timeout. They pass in isolation (`variants.test.ts` 3845/3845). Never run two suites at once in
this container, and read a timeout failure as a scheduling artifact before treating it as a bug.

## S121 — RESOLVED (S121d): dotPlot given/read mode shipped; vm-02-01/02 now Tier A
The corrected spec below was implemented the same session: read mode + denom lattice landed,
vm-02-01 i1/i2 converted onto it, vm-02-02 i1 onto numberLineHop rational hops. Original note:

### (original) dotPlot: the S120j spec was wrong; what is actually needed is a GIVEN/READ mode
S120j scoped "fractional ticks + total/share readout" for vm-02-01/02. Measured against the
steps: vm-02-02/i1 and /i2 are fraction arithmetic on plot data (3 × 1/2; 3 cups shared among 4)
with named misconception entries — a plot-BUILDING widget grades a configuration, not a computed
fraction, so converting them would change the assessed claim. They stay on fractionEntry.

The real defect is legibility: six steps across vm-02-01/02 describe the plot only inside a
parenthetical, `(1/4 → XX, 1/2 → XXX, 3/4 → X, 1 → XX)`, and it is never drawn. Needed:
dotPlot gains (a) fractional tick labels and (b) a GIVEN mode where authored stacks render and
the learner reads a count off them. That preserves vm-02-01/i1 (answer 3) and /i2 (answer 2)
byte-for-byte while replacing prose-encoded data with the picture the standard (5.MD.B.2) asks
learners to read. Next session's first item.

## S125 — a stale `tsconfig.tsbuildinfo` breaks the build after `rm -rf .next`
Symptom: the build prints `✓ Compiled successfully`, then exits 1 with
`File '.next/types/app/(shell)/account/page.ts' not found. The file is in the program because:
Root file specified for compilation` and `Next.js build worker exited with code: 1`.
Cause: `tsconfig.tsbuildinfo` still lists `.next/types/**` files that `rm -rf .next` deleted;
tsc treats them as root files and fails before Next regenerates them. A plain `tsc --noEmit`
recreates the file, so any session that typechecks and later clears `.next` can hit this.
Fix: delete BOTH — `rm -rf .next tsconfig.tsbuildinfo` — then build. Identical tree then
compiles in 70s, exit 0. This is the third distinct build failure mode that prints
"Compiled successfully" (the others: ESLint errors, and OOM SIGKILL from S122). Always read the
exit code, then read the last 25 lines before it — not the compile banner.

## S126 — tier letters are triage, not causal-coverage proof

`flagship-tier.mjs` deliberately uses lesson-level maxima for several dimensions. One excellent
engine can therefore elevate a lesson even when most widget steps remain answer surfaces. Session
126 adds denominator-visible measures to `EXCELLENCE_BACKLOG_S126.json`: all widget-step causal
coverage, interactive-step causal coverage, and the share of lessons with a causal interactive
spine. Future excellence claims must cite both the tier and these step-weighted measures.

## S126 — honest B/C-intentional ceilings are valid outcomes

The old "one gate from A" report was score-only. It recommended adding predictions even when the
learner's action was simply reading a rendered object or making the classification that the
prediction would duplicate. The new content-driven rule separates prediction-eligible lessons
from honest ceilings. Current detected ceilings include `mmt-05-01`, `mmt-05-02`, and
`dop-01-03`; no lesson-ID exception list is used.

## S126 — representation-presence scan is a candidate finder, not an auto-fixer

The strict text scan in `EXCELLENCE_BACKLOG_S126.json` flags graded answer surfaces that name a
graph, table, ruler, grid, number line, or figure without a step-level rendered object. It is
intentionally high recall and can flag prompts whose figure is supplied elsewhere in the lesson.
Only reviewed queue records are authoritative; every corpus candidate requires source inspection
before conversion.
## S126 — the registration contract is generated, not a remembered surface count

The S121 twelve-surface note remains useful history but is no longer the executable contract.
`scripts/audit/engine-registration-contract.mjs` derives the registry authority and cross-checks
schema, evaluator, pedagogy, renderer, registered list, stage tier, gallery sample, and capability
surfaces from current source. Session 126 closes at 106/106 core-complete. Future engine work must
make this generated gate green in the same session; do not update a hard-coded surface count.

## S127 — static harness presence is not production-browser certification

`PLAYER_HARNESS_CONTRACT_S127.md/json` proves the behavioral specs, assertions, observable hooks,
viewport projects, visual-capture states, and deliberate browser budget are present. It does not
prove that Next.js rendered them correctly. The release claim becomes browser-certified only after
an exact-lock install, production build, 71/71 Playwright executions, and six screenshot captures.
Do not begin lesson conversion merely because the static 36/36 contract is green.

## S127 — exact-lock install blocked by package-source availability in this container

The internal npm mirror returns 404 for the lockfile's exact `zustand@5.0.14` tarball. The public
registry cannot resolve (`EAI_AGAIN`) in this container. `@sparticuz/chromium@149.0.0` additionally
warns that Node 22.17+ is required while the container is Node 22.16. These are environment findings,
not source defects. Preserve `package-lock.json`; do not weaken or upgrade dependencies to make the
gate appear green. Rerun on Node 22.17+ with the exact lockfile available.

## S129 — generated product state must never be skipped when runtime dependencies are absent

Before Session 129, `verify-generated` omitted `PRODUCT_STATE.md/json` when local Vitest was unavailable. That allowed stale tier totals to coexist with a current `HANDOVER.md`. The generator now separates current source-derived declarations from `reports/certified-runtime.json`, the last exact-lock execution evidence, and product state is always included in byte-stability verification. Never infer current executed test counts from static declarations.

## S129 — exact-choice estimation is not continuous tolerance estimation

A best-of-three estimation task must not be converted onto an arbitrary continuous slider: doing so changes the answer set and can erase authored misconception routes. `estimateSlider.choices` is the exact discrete mode. Its integrity gate requires unique in-range candidates, exactly one correct choice, and a uniquely smallest distance to the stated actual value.

## S130 — generic numeric trap synthesis is unsafe for bounded construction engines

A helper that fills missing numeric misconceptions with `answer + d` is valid for an unbounded numeric field but can author an unreachable state for a bounded manipulative. In fixed-grid counting, the 2×2 product collides with the rows+columns trap; a generic filler then produced 5 for a four-cell grid. `Ssg2GridApplyRead` now uses a dedicated reachable-count builder constrained to `0 < count < answer`, and Session 130 seed-sweeps support/core/stretch draws. Future engine variants must synthesize errors inside the engine's reachable state space, not merely outside the correct answer.

## Session 131 — misconception inventories must understand engine-native choice arrays

A new engine can preserve every authored wrong path yet appear misconception-free if tier/audit tooling only recognizes legacy `commonErrors` and `options`. `distributionCompareLab` initially exposed this defect: two converted lessons were falsely scored D because `measureChoices` and `judgeOptions` were invisible to `wrongPathCount`. Both the tier compiler and excellence inventory now count only reachable wrong entries from these arrays. Future choice-bearing engines must update the measurement compiler in the same session as registration; a green evaluator alone is not sufficient evidence.

## Session 132 — exact-choice probability engines need rational truth, not a `correct` flag

`trialProbabilityLab` identifies its accepted choice by cross-product equality with the displayed favourable/total evidence. Tier and misconception inventories must therefore not assume every `choices` array carries a boolean `correct` field. Session 132 updates both compilers to exclude only the rationally equivalent choice and count every other feedback-bearing fraction as a reachable misconception. Future exact-choice engines must register their own truth predicate with measurement tooling in the same session.

## Session 133 — compound-event engines must keep count and probability as separate claims

A compound experiment has at least two related but non-interchangeable truths: the product that gives the complete ordered sample-space size, and the favourable-over-total fraction for a particular event. Reusing a tree or area visualization without separate grading can hide whether the learner multiplied stage sizes correctly or merely selected a familiar probability. `compoundEventLab` therefore has distinct `count` and `probability` modes driven by the same fixed stage structure. Future extensions must preserve this separation and must render the complete ordered sample space within the bounded 120-outcome contract.

## S134–135 — hazards distilled from repairing eight unverified sessions
1. **"Blocked gates" must be re-proven each environment.** S126–133 carried a dependency
   blocker forward for eight sessions; deps were byte-identical to the last verified tree the
   whole time. If install fails, hard-link node_modules from any tree with an identical
   lockfile before accepting a blocked chain.
2. **Zod `.default()` fields are required on the OUTPUT type.** A generator typed against the
   parsed widget union must emit every defaulted field explicitly, or tsc fails — and if tsc
   isn't running, the drift ships silently.
3. **"The complement is a distractor" fails when favourable = total/2.** Any fraction-trap
   authoring must check reduce-equality against the answer; the uniqueness guard exists to
   catch exactly this, but only if the suite runs.
4. **Playwright specs need a hydration anchor** before global-key or tab-order interaction:
   wait for a rendered footer control, or retry the keypress with `toPass`. A dead first
   keypress looks like a viewport-dependent product bug.
5. **The in-app reduce-motion attribute must mirror the OS media block's `animation: none`
   list.** The 0.001ms universal fallback leaves completed `both`-fill animations holding
   their keyframe transform (identity matrix ≠ `none`; a stray containing block).
6. **`scrollIntoViewIfNeeded` ignores sticky occlusion.** Element-level `scroll-margin` is the
   mechanism Chromium honours in both the needs-scroll check and placement; scroll-padding
   smaller than the occluder does nothing.

## Session 136 — registration and capability measurement are separate contracts

A new widget can pass schema/evaluator/renderer registration while still score as non-manipulative if its capability record is placed outside `engine-capabilities.json.types`. Session 136's first generated report caught exactly this: the new area engine rendered and graded correctly, but both lessons remained D until the capability entry moved under the measured `types` map. New engine completion therefore requires both `check:engine-registration` and a measured tier/coverage delta consistent with the declared capability.

## Session 136 — composite-area remediation must preserve the same representation

When the primary task is decomposition or signed composition, a remedial numeric field is a representation regression even if its answer is correct. `asv-01-02` and `asv-02-03` now keep both remedial checks on `compositeAreaLab`. Future conversions must include every remedial route that teaches the same claim, or document why the remedial action is intentionally different.

## Session 139 — environment blockers are observations, never standing assumptions

Session 135 proved that a previously repeated dependency blocker could be false in another environment. Session 139 therefore reran `npm ci --ignore-scripts` from the exact lockfile. This container's configured mirror returned 404 for `zustand@5.0.14`, and Node is 22.16 versus Chromium 149's declared 22.17 minimum. Record this only as a Session-139 environment observation. Every future session must attempt the canonical runtime recovery again and must search for an identical-lock dependency tree before declaring primary gates unavailable.

## Session 139 — equivalent value and accepted form are separate signed-fraction truths

For `signedFractionLab`, rational equivalence is not sufficient when `form: "lowestTerms"`. The engine uses one predicate for equivalent magnitude and a stricter grading predicate for accepted form. An unreduced fraction may be mathematically equivalent and still be a named, feedback-bearing wrong path. Future fraction engines must not collapse these two truths into a single cross-product check.

## Session 142 environment note

The current execution container cannot restore the exact lockfile because the configured registry returns 404 for `zustand@5.0.14`; Node is 22.16 while `@sparticuz/chromium@149` declares 22.17+. Current-tree primary runtime gates must be executed in the canonical dependency environment and must not be inherited from Session 135.

## S143–144 — hazards from repairing S141–142
1. **Never chain `.refine()`/`.superRefine()` onto a discriminated-union member.** It yields
   `ZodEffects`, not `ZodObject`, and collapses the WHOLE union's inferred type — breaking every
   consumer repo-wide from one line. Cross-field validation belongs in `widgetIntegrityErrors`.
2. **Verify the branch point before starting.** Diff a handful of known-fixed strings against the
   last green tree; a tar cut from a stale snapshot silently reverts completed work, and the only
   signal is tests that "should already pass" failing again.
3. **A source-hash audit failure means regenerate the artifact, not edit the check.** Those
   detectors exist precisely to catch a generator changing without its sweep being re-executed.
4. **A new widget type has eight surfaces**, several of which fail silently: `evaluate`,
   `canCheck`, `correctAnswerText`, `learnerAnswerText`, `gateOne`, the keyboard gate,
   `INDEPENDENT`, and `GENERATOR_BAND`.
5. **Independent-check parsers return two honest shapes** — a numeric value or the winning
   label — and some require the compound `prompt||labels` argument. Read the specific parser
   before calling `check()` from a new gate branch.
6. **Background long chains with `nohup setsid`, not `setsid` alone.** A plain `setsid` process
   died silently at a turn boundary mid-pipeline.

## S151C hazards (recurrence-prevention)

- **Conversion scripts must populate `values` (or the equivalent stage-source field) for
  stage-gated labs.** An empty source array yields zero truth stages, and `requiredExplorations`
  ≥ 1 then makes `canCheck` permanently false — the Check button locks and the lesson is
  uncompletable. Found in rns-02-01 k1/i2/ch1 (exactNumberLab rootSelect/rootList).
- **`authoredStages.length` must equal the derived truth-stage count.** Renderers index
  `authoredStages[index]` against `truth.stages`; excess authored panels are silently
  unreachable. Found in rns-01-01/i2 (3 panels, 2 derivable stages for 1/3).
- **Two-anchor source slices in audit scripts go stale when new specs are inserted between the
  anchors.** Use the order-immune bound: slice from the spec anchor to the next `\nexport `.
  A field-level `.refine` inside an unrelated spec is NOT the §5.1 union-collapse hazard —
  only object-level chaining inside a discriminatedUnion is.
- **Never modify content after the session hash ledger is sealed.** The late-S151 wave changed
  13 lesson files after `SESSION151_LESSON_HASHES.json` was written and recorded nothing,
  breaking four downstream seal audits. If late work is unavoidable, regenerate the ledger and
  extend the session's applied/ledger artifacts in the same commit of work.
- **Serialization artifacts: Python `None` → JSON `null` is NOT "field absent"** under
  `z.string().optional()`. Emit-time filtering of None-valued keys is required in every
  conversion writer.
- **[RESOLVED S152]** The s150/s151 audit stages and the S151C content proof are now wired
  into `gen:reports` (74 stages, GREXIT:0). Residual pattern to watch: source-needle audits
  (exact-string pins on renderer/schema) go stale across refactors — S152 caught point-set
  M65 after the S151 props-spread dispatch refactor; update needles consciously, never delete.
- **Target-file seal audits cannot distinguish conversion timing.** s150's per-widget checks
  accepted late-wave conversions inside its own target (cg-01-03) because each surface still
  matched the sealed legacy baseline. Whole-file hash ledgers are the only timing evidence.

## S153 hazards

- **Unattributed content write detected (linear-functions/lf-03-03, step i2).** Between the
  publication of the S152 tar and the S153 conversion work, `i2` changed from `numeric` to
  `affineRelationshipLab` with no session, script, or ledger entry accounting for it. It was
  caught only because an *untouched* lesson moved D→A in a tier re-score. Bisection cleared
  every plausible writer (`validate:content`, `flagship-tier`, and all five
  `session151-*` audit stages leave the file byte-identical). The file was restored from the
  published S152 tar, whose bytes match the ORIGINAL uploaded archive, so the restored state
  is the long-standing authored one. Root cause remains unidentified — treat any future
  unexplained tier movement as a content-integrity incident, not a scoring quirk.
- **Detection rule that worked, adopt it as standard:** after any conversion, diff the tier
  export against the pre-change export and require that the set of lessons whose tier moved is
  EXACTLY the set of lessons you edited. A superset means something else wrote content.
- **Never regenerate a hash ledger mid-session "to make the proof pass."** The S151C ledger was
  regenerated at 11:51 and silently absorbed the lf-03-03 drift, which is why the content
  proof kept passing while the tree was wrong. Regenerate a ledger only as a deliberate,
  documented re-baseline at a known-good state, and always pin the authorized change set in a
  content-change proof first.
- **Tier-simulation caveat:** swapping a widget `type` alone moves the scorer but does not
  prove a valid spec exists. Only ~10 registered engines carry value-keyed error surfaces
  (`numericErrors`/`commonErrors`/`choices`/`commonResults`/…); engines without one
  (quadraticExplore, lineExplore, transformExplore, functionMachine, triangleSolve,
  distanceGrid, algebraTiles) CANNOT receive an authored `commonErrors` set and are therefore
  invalid conversion targets under the frozen-content rule, however well they score.
- **A D-tier content conversion is never content-only when the steps carry variant
  declarations.** Any step with `variant:{gen,form}` must have its generator upgraded to the
  new surface in the SAME session (the `*_VARIANT_FORMS` + `upgrade*Variant` pattern), and the
  engine's variant sweep artifact regenerated because it pins a sha256 of `variants.ts`.
  Budget a conversion as: content edit + generator branch + sweep + mutations + failure-first +
  full suite. Check `variant` presence on the target steps BEFORE planning the session.
- **Coverage claims must be proven, not simulated.** Use `scripts/measure/coverage-prover.mjs`:
  it re-derives every candidate step's answer with an independent exact-rational solver and
  exits nonzero on any disagreement with frozen content. A widget-`type` swap that moves the
  tier scorer proves nothing about whether a valid, answer-preserving spec exists.
- **99.1% of remaining C/D assessed steps carry variant declarations.** Budget every future
  conversion as content edit + generator-tag upgrade + variant-sweep regeneration. Never plan
  a "content-only" conversion wave again.

## S156 hazards and environment pins

- **Playwright is pinned to 1.56.1 — do not "upgrade" it.** The container caches exactly one
  chromium-headless-shell build, revision 1194, at /opt/pw-browsers (PLAYWRIGHT_BROWSERS_PATH),
  and Playwright's browser CDN is not in the network allowlist, so no other revision can ever
  be downloaded here. playwright-core@1.61.x demands revision 1228 and fails all 71 e2e tests
  with "Executable doesn't exist". The registry was bisected: 1.56.0/1.56.1 -> 1194 (exact
  match). Both `@playwright/test: 1.56.1` and an explicit `playwright-core: ^1.56.1`
  devDependency are pinned — the second entry is deliberate, because npm otherwise hoists a
  newer transitive playwright-core that shadows the pin (observed: lockfile said 1.56.1 while
  node_modules held 1.61.1; fixed only by a targeted `npm install playwright-core@1.56.1`).
- **Run e2e against a production server, not the dev server.** `npm run dev` under Playwright's
  webServer exceeds the container's memory threshold and Next restarts it mid-suite, failing
  batches of tests with 30s timeouts. Build once, `npx next start -H 127.0.0.1 -p 3100`, wait
  for HTTP 200, then `npx playwright test` — reuseExistingServer picks it up (verify with
  `ps | grep -c "next dev"` = 0). Production-mode runs complete in ~2.6m at ~560Mi.
- **Backgrounding pitfall that cost two dead launches:** in `cd X && nohup A & B`, the `&`
  backgrounds the WHOLE `cd X && nohup A` chain and `B` runs in the ORIGINAL cwd. Playwright
  then resolves no config, scans /tmp, and reports "No tests found" against alien files. Always
  put the `cd` INSIDE the quoted `bash -c` script.
- **Known limitation (pre-existing, environment-sensitive): player-short-landscape occlusion
  test fails by 2.6px on chromium 1194.** In `player-viewport.spec.ts` "retry feedback stays
  contained…", at 844x390 the input's center sits at y=225.8 while the sticky
  .trail-action-dock's top edge sits at y=223.2, so elementFromPoint returns the dock —
  `inputCenterOwned` false. The same assertion PASSES on chromium 1228 (the last green run
  before the version pin) and passes at all five other viewport projects on 1194; the margin
  was always razor-thin and the older browser's rendering metrics land 2.6px differently. A
  first fix attempt (reserving `padding-bottom: calc(22dvh + 6.5rem)` on `main` at the
  max-height:480px breakpoint, mirroring the existing scroll-margin budget) was measured to
  make the dock overflow the viewport (footerBottom 517.9 on a 390px viewport, actionHeight
  collapsed 48->26) and was fully reverted — globals.css verified byte-identical to the S155
  tar afterward. Any real fix must first map the dock's actual flex/sticky container chain;
  do NOT reapply padding to `main` blind. Current e2e state on this container: 70/71, with
  this single failure quantified above.

## S159 hazards

- **NEVER run two verification chains concurrently on one tree.** Two racing drivers (one
  continuing past a GR:1 into vitest while a second re-ran gen:reports) produced FOUR false
  vitest failures — gen:reports rewrites generated fixtures mid-run of the other chain's
  vitest. A clean re-run of the same files passed 3880/3880. Before launching any chain:
  `ps aux | grep -cE "node|vitest"` must be 0 for this tree, and kill stale drivers first.
- **Instant-return waiter (replaces sleep polling):**
  `timeout 290 sh -c 'tail -F -n +1 /tmp/x.done 2>/dev/null | grep -m1 -q "PATTERN"'`
  returns the moment the sentinel line lands (exit 0) or at timeout (124 = poll again).
  One readable line, no sleep granularity, no busy loop.
- **A new exactNumberLab TASK is not a new ENGINE.** All consumers dispatch generically through
  `exactNumberTruth`; none enumerate individual tasks. Adding a task = schema enum + truth
  branch + any new spec fields. Do not budget an 8-file registration wave for it. (Verified by
  grepping every task name across src/ before relying on it.)
- **exactNumberLab source labels must be unique per spec** — enforced by BOTH the variant gate
  (variants.test.ts gateOne) and lint:pedagogy. Symmetric problems (√6·√6, √n·√n) legitimately
  produce identical terms, so any upgrade path building multi-source specs must disambiguate
  positionally (`√6 (factor 1)` / `√6 (factor 2)`). Fixed in exactConfig for radicalProduct and
  radicalCombine; apply the same helper to any future multi-source task.
- **A contaminated sentinel means another agent is running your exact driver.** In S161 a
  parallel agent wrote `VT:1 DONE` into /tmp/s161c.done while this session's driver had not yet
  reached its first stage. When sentinel lines appear out of order, stop trusting the sentinel:
  wait on YOUR pid (`while kill -0 <pid>; do sleep 5; done`) and read YOUR log file.
- **Register a variant form only if EVERY content step on that form can convert.** A form with
  one convertible step and one approximation-based sibling will upgrade the generator surface
  while the sibling stays numeric, failing variants.resolver.test.ts ("declared <tag> but it
  does not serve numeric"). Enumerate the form's steps first. (S163: lg-cob__numeric and
  lg-exp-solve__numeric.)

## S165: two writer-discipline findings
- The recurring "transient module-load error" on content-change-proof-s151c.mjs (seen end of
  S164 and again in S165) was a PYTHON `#` COMMENT written into a .mjs file by a patch script.
  JS comments are `//`. The S164 instance of the same bug was silently fixed by a concurrent
  agent, which made it look transient. Any script that injects comments into another file must
  match the TARGET file's comment syntax.
- Lesson JSON files do not all share one byte convention: radical-functions lessons use
  indent-2 with NO trailing newline, logarithms use indent-1 WITH trailing newline. The indent
  probe must detect the trailing newline separately (nl='\n' if raw.endswith('\n') else ''),
  and a file-by-file writer that asserts mid-loop leaves earlier files written — always make
  the conversion loop resumable (skip already-converted steps) rather than assuming
  all-or-nothing.

## S166: file truncation from simultaneous read-and-write
A Python expression `open(path,'w').write(open(path).read())` (note: different from `open(path,'w').write(new)`)
truncates the destination file to zero when the arguments evaluate in the wrong order — confirmed empirically.
The safe pattern for patching audit scripts is:
1. `src = open(target).read()` — explicit read into a variable
2. Construct `new = src.replace(...)` — pure transformation  
3. `open('/tmp/patch.py','w').write(new)` — write to a temp file
4. `subprocess.run(['python', '/tmp/patch.py'], cwd=CWD)` — test from correct CWD
5. `shutil.copy('/tmp/patch.py', target)` — only on success, copy to real location

Lesson: never use `open(x,'w').write(open(x).read())` in any form, even separated across lines.
Also: audit scripts that use `Path(__file__).resolve()` to set ROOT must be tested from the
repository root directory, not from /tmp, even when the /tmp copy is otherwise correct.

## S177: a gate-blind-spot class of error — matching a frozen number is not the same as a valid derivation
A concurrent instance (S176) converted pf-turning (turning-point minimum-degree problems) using
answer=turns+1 for both its steps. This is CORRECT for the simple case (k3) and is what the live
generator always produces — verified airtight, not probabilistic (the generator's numeric branch
has exactly one hardcoded template; the end-behavior-constrained shape lives in a structurally
separate `mcq` branch it can never reach). But ch1 ("falls left, rises right", 2 turning points)
tests a DIFFERENT relationship: smallest degree must also match the required end-behavior PARITY.
turns+1=3 is right for ch1 only because 3 happens to already be odd. The same formula applied to
turns=3 (needing odd parity) gives 4 — both the wrong parity and mathematically incapable of the
required end behavior; the true answer is 5.

The concurrent instance caught and disclosed this honestly (a test literally titled "KNOWN
LIMITATION, recorded not hidden"), arguing it was safe because the generator can never regenerate
ch1's shape. That safety argument is correct. The judgment call is narrower: exactNumberLab's
stage narration is shown to the learner as the reasoning trace, and "turns+1" alone would
misrepresent the tested concept even though the number is right. REVERTED both content and the
exactConfig branch on review; the fix is a genuine parity-aware task (smallest degree >= turns+1
matching a required odd/even parity), not yet built.

**The structural lesson, worth generalizing:** the adversarial gate (checks generator redraws)
and post-write soundness (checks the frozen number matches, wrong values are rejected) are BOTH
blind to this error class whenever a hand-authored content instance uses a shape the live
generator can never reproduce — which is a pattern this lineage has used repeatedly and
correctly (S164 lg-ln's k3, S165, S168's π-authored constants, S173's vec-angle). Those cases are
fine because the hand-built formula IS a genuine, general derivation of the stated relationship.
The failure mode is specifically: reusing an EXISTING formula/task because it's already wired and
happens to match, without checking it's the RIGHT formula for what THIS problem actually tests.
No gate catches that; it requires reading the problem's mathematical content directly, every time
a frozen instance's shape differs from what regenerates it.

### S178 RESOLUTION of the above
Built `polynomialMinimumDegree`: takes the turning-point count AND an explicit
`pmdEndBehavior` ("opposite" | "same" | "unconstrained"), returns turns+1 bumped to the required
parity. pf-05-02 re-converted with ch1 carrying pmdEndBehavior:"opposite" as DATA rather than an
unstated assumption, and its stage narration now shows both the floor step and the parity step —
so the learner sees the reasoning that was previously invisible. The live generator maps to
"unconstrained" (it only ever poses that shape, re-verified over 600 draws). The counter-example
that motivated the whole reversal is now a passing assertion: turns=3 under an odd constraint
returns 5, not 4. The general lesson above still stands unchanged — no gate would have caught
the original problem; it needed someone to read the mathematics.

## Fixed in S180 — sticky dock could occlude the answer control on short landscape viewports

At <=480px viewport height the retry/correct/revealed dock can reach ~42% of the viewport. The
CSS scroll-margin reservation is honoured by Element.scrollIntoView but NOT by Chromium's
scrollIntoViewIfNeeded (used by Playwright, and by some in-page reveal paths), so a control
resting a few pixels under the stuck dock counted as "visible" and never moved. LessonPlayer now
performs an overlap-aware reveal on phase change (measure, nudge by exactly the overlap, clamp to
slack, no-op when there is no overlap). Regression coverage: e2e/player-viewport.spec.ts, both
the occlusion contract and a minimal/conditional assertion, across all six viewport projects.

## Fixed in S200 — authored hint ladders and explanation variants were unreachable on interactive steps

`LessonPlayer` gated two learner-facing surfaces on step KIND while every other layer gated on
AVAILABILITY, so authored content that validated, scored, and rendered correctly could not be
reached by any learner action:

- **Figure rendering** tested `s.kind === "concept"`, stranding a REGISTERED figure on two
  interactive construction steps (cp-01-02 `i1` "perp-bisector-stage1", cp-01-03 `i1`
  "angle-bisector-construction"), so two construction lessons opened their steppedReveal with no
  construction on screen. Fixed in the same session; the clearing label is now suppressed when a
  widget follows, since the widget block renders its own.
- **Hint control** tested `s.kind === "challenge" || s.kind === "check"`. But `usePlayer.hint()`
  advances `hintsShown` for any step carrying `hints`; the ladder renderer draws
  `s.hints.slice(0, hintsShown)` for any step; and `xpFor()` already prices the `"interactive"`
  kind at the same −2 XP per rung. Only the button excluded them. Enter does not call `hint()`,
  so there was no alternate path. **118 interactive steps** across nine courses
  (decimal-operations 27, fractions-multiply 22, ratios-rates 17, decimals-place-value 12,
  number-system 12, volume-measurement 12, coordinate-geometry 8, expressions-equations 7,
  data-distributions 1) carried three-rung ladders no learner could open.
- **`showExplanation`** carried the same kind test, stranding `explanationVariants` on 118
  interactive steps — 116 of them the very same steps. A learner finished an explored step with
  a correct/revealed banner, no "here is why", and no access to the swap control.

All three now gate on availability (`actionable`, or FIGURE_IDS membership for the figure)
rather than on step kind. No authored content was touched; the fix is entirely presentation.

Detection note: no gate caught this at the time. validate:content and lint:pedagogy check that
the content is well-formed, not that the player renders a path to it. The defect is only visible
by cross-referencing authored fields BY STEP KIND against the render conditions.

**That gap is now closed.** `src/components/playerFieldReachability.s200.test.ts` (content group,
~7ms) walks the corpus, collects every (field, kind) pair actually authored, and fails any pair
without a declared consumer in its CONSUMERS map. A full sweep at S200 found NO fourth instance:
`narration` is consumed by `speech.narrationFor()` (preferred over body by the Listen control),
step-level `variant` by the seeded generator in `variants.ts`, `cml` by the kind-agnostic
`resolveCMLMeta`, `teaser`/`takeaways` by the recap block, and `conceptTag` on interactive steps
is deliberately process-evidence-only. Authoring a field on a new kind now fails the gate with the
field, kind, step count and an example step id, forcing a conscious wire-or-record decision.

Coverage: `src/components/LessonPlayer.hintReach.s200.test.tsx` (6 tests). Falsification-checked
both ways — reverting the hint gate fails 3 of 6, reverting the explanation gate fails exactly 1.

## S200 environment — rest-group halves are at the memory edge at 268 test files

Adding one test file took `rest-a` from 98 to 99 files and pushed that single fork over the
documented native-memory accumulation line: `LessonPlayer.play.test.tsx` died on a 5000ms TIMEOUT
(not an assertion). The same file passes 12/12 standalone, and re-running the whole `rest` group
as `chunk rest 4` (four ~50-file processes) produced zero timeouts and collapsed the failing set
to exactly the 17 sqlite-bindings files. **Use `chunk rest 4 0..3` rather than rest-a/rest-b.**

## S200 environment — e2e/player-state.spec.ts:88 is load-sensitive

The "rapid Enter cannot skip the next concept" assertion depends on two `page.keyboard.press`
calls landing inside the production 350ms advance latch. Under a fully parallel 8-project run on
1 CPU the gap can exceed 350ms, and the second Enter then legitimately advances — the test reports
`data-step-id` "i2" where it expects "c2". Observed once; passed 3/3 in isolation and 77/77 on a
clean full re-run. It is a timing sensitivity in the test, not in the latch. If it recurs, re-run
before investigating: the fixture lesson (as100-01-01) has zero interactive hints/explanations, so
the S200 gate changes render byte-identical DOM there and cannot be implicated.

## KaTeX 0.16.31+ jsdom render slowdown — pinned at 0.16.30 (S205)

`npm audit fix` during the S205 release seal moved katex 0.16.11 -> 0.16.47 and the hint-ladder
player test went from ~3s to ~11s true duration (caught only because it crossed vitest's default
5s budget). Bisect on the SAME test, same box, warm cache:

| katex | hint test |
| --- | --- |
| 0.16.11 (CVE-vulnerable) | ~3.0s |
| 0.16.21 (first fixed) | 0.54s |
| 0.16.30 | 0.76s |
| 0.16.34 | 4.5s |
| 0.16.37 | 6.0s |
| 0.16.40 | 5.3s |
| 0.16.44 | 4.9s |
| 0.16.47 | 4.8s |

The ~6-8x slowdown lands in (0.16.30, 0.16.34]. package.json pins EXACT "katex": "0.16.30" —
CVE GHSA-cg87-wmx4-v546 is fixed at >=0.16.21, so the pin loses no security. DO NOT let a future
`npm audit fix` or range install float katex past 0.16.30 without first re-timing
LessonPlayer.play.test.tsx ("hints cost XP") and profiling whether the slowdown reaches real
browsers or is jsdom-only. Either way the pin is a deliberate decision, not drift.

## Seal chains must clear `.next` before building (S205E)

SEAL14's build failed with `PageNotFoundError: Cannot find module for page: /_document`, and the
S205D reprove build failed with `ENOENT ... pages-manifest.json`. Neither was a code defect: both
were a PARTIALLY-WRITTEN `.next` directory left behind when an earlier build was killed mid-write
(tool-call timeout, or an orphaned `next-server` child surviving its kill). Next reuses whatever it
finds in `.next`, so one interrupted build poisons every later build in the same tree until the
directory is cleared.

The symptom is misleading — it names a missing framework page, which reads like a broken app —
and the failure cascades: no build means no server, so `curl` returns 000 and the whole Playwright
matrix reports failure. Two of the three red lines in that run were consequences of the first.

RULE: every seal script runs `rm -rf .next` immediately before `next build`, and any build failure
naming a missing manifest or framework page (`/_document`, `pages-manifest.json`,
`build-manifest.json`) is treated as a dirty-tree artifact and re-run clean BEFORE it is
investigated as a code defect. Verified both times: the clean rerun passed EXIT=0 with no source
change.

Related, same family: kill `next-server` by PID and confirm the port is actually free before
starting a new one — an orphan holding :3100 makes the new server die with EADDRINUSE while the
suite runs green against the STALE build, which is worse than a red run.

## better-sqlite3 bindings: the 17-file / 76-test sandbox baseline is RESOLVED (S205)

For many sessions the standing note read: `better-sqlite3` native bindings are absent in the
sandbox, so 17 DB-layer test files / 76 tests always fail and that is NEVER a regression. **That is
no longer true and the note must not be carried forward as an excuse.** As of S205 the bindings
load (`better-sqlite3@12.11.1`, verified by opening `:memory:` and running DDL), and the full suite
is green end to end: content 1241 · rest-a 2331 · rest-b 4275 · sweep 3988 = **11,835 tests across
276 files, zero failures**.

Consequences, in order of importance:
1. **A DB-layer failure is now a real failure.** The blanket "expected 76" excuse is retired. If
   DB tests fail, debug them.
2. **Server-backed features are now testable here**, which is what unblocked the Priority 6
   messaging layer (`messagingService.s205.test.ts`, 12 tests covering the five authz rules) from
   being written on faith.
3. If a future container loses the bindings again, the correct response is to say the suite could
   not be fully proven — not to re-adopt a number from a previous era. Re-derive the count.

## sharp <0.35.0 high-severity CVEs via Next 15 — mitigated by disabling the image optimizer (S205)

`npm audit` (S205 seal) reports 2 high: sharp inherits libvips CVE-2026-33327, CVE-2026-33328,
CVE-2026-35590, CVE-2026-35591 (GHSA-f88m-g3jw-g9cj). sharp is Next 15's bundled image-optimizer
backend; the advertised fix is next@16.3.0 — a MAJOR upgrade, wrong to take mid-seal.

Exposure analysis: the product's only `next/image` usage is the Tally Peak brand SVG
(LessonPlayer.tsx:370, 518), both already `unoptimized`; no raster images, no remote images. The
one reachable path to sharp was the default `/_next/image` endpoint itself, which will process
crafted same-origin requests whether or not the app links to it. Mitigation shipped:
`images: { unoptimized: true }` in next.config.mjs removes that endpoint entirely — sharp becomes
dead code in node_modules, with zero visual or behavioral change. `npm audit` still REPORTS the
advisory (it scans the tree, not reachability); the seal records it as risk-assessed-and-mitigated,
not clean. Empirically confirmed on the hardened build: `/_next/image?url=...` returns 404 — the
endpoint no longer exists (a pre-hardening server returns 400 there, the optimizer's own SVG
rejection; do not mistake one for the other when re-verifying). REAL FIX: the Next 16 migration, as its own planned session with the full gate matrix.
Do not `npm audit fix --force` — it installs next@16 blind.

## Rebuilding `.next` under a running `next start` corrupts the served app — 31 phantom Playwright failures (S205)

During the S205 seal a config change forced a rebuild + re-run. The re-run reported **31 failed /
84 passed**, with failures that looked structural: `locator('.stage svg')` not found,
`[data-player-phase]` not found across every viewport project. Nothing in the diff could produce
that, and the same suite had just passed 115/115.

Cause: the phase-2 script's `kill $SRV` had not actually stopped its server (PID 12581 survived),
so the phase-3 script's `next start` died with `EADDRINUSE` — silently, into its own log — while
`npx next build` rewrote `.next/` **underneath the still-running phase-2 server**. That server then
served a half-swapped build: HTML shell fine (`curl` returns 200 and 21 KB), client chunks
mismatched, so hydration never ran and no client-set attribute ever appeared. Every "element not
found" was a hydration corpse, not a regression.

Diagnostic tells, in order of speed: (1) `curl` the lesson route and grep for a client-set
attribute — 200 with **zero** `data-player-phase` means hydration is dead, not that the page is
broken; (2) read the server log for `EADDRINUSE`; (3) `ss -ltnp | grep 3100` before trusting any
`next start`. After killing by PID and starting clean on the identical tree: **115/115**.

RULES: never `next build` while a server serves that `.next`. Kill by **PID** (`kill $PID`, verify
with `ss -ltnp`), never `pkill -f next` (matches the harness) and don't trust `pkill -x next-server`
to have worked — verify. Have the start script **fail loudly** if the port is occupied rather than
letting a stale server answer the suite.
