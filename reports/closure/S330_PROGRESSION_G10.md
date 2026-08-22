# S330 Progression Packet G10 — LESSON_PROGRESSION_AND_DUPLICATION

Scope: `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` rows `PROGRESSION-<lessonId>` under workstream
`LESSON_PROGRESSION_AND_DUPLICATION` for the 10 lessons assigned this packet, across 8 courses
spanning Kindergarten through high-school precalculus: `add-subtract-20` (as-04-01),
`add-subtract-100` (as100-03-04), `area-surface-volume` (asv-03-01), `complex-numbers` (cn-05-02),
`expressions-equations` (ee-05-01), `function-analysis` (fna-03-02), `counting-to-20-k` (kc-01-03,
kc-05-01), `trig-identities-equations` (ti-03-01, ti-03-02).

**Method.** The detector (`scripts/audit/consolidate-pending-workload-s236.mjs` lines 358–393:
lowercase each graded/interactive step's widget `prompt`, strip digits via
`/[-−+]?\d+(?:[.,\/]\d+)*/g` → `#`, collapse whitespace, then flag any step whose resulting
template exactly matches an earlier step's within the same lesson) was reproduced verbatim in a
standalone script (`probe-repeats.mjs`) and run against every lesson's live, current JSON both
before and after any edit — every collision and every post-edit clearance below is the script's
computed output, not a by-eye claim. Each lesson was then read in full and a genuine pedagogical
call was made: **KEEP** where the repeat is defensible fluency/retrieval practice, an intentional
escalating pair, or a deliberate two-sided test of one rule; **REDESIGN** (the later of the two
colliding steps, usually the challenge) where the repeat reads as an accidental same-job copy with
new numbers.

Result: **7 lessons KEPT as-is, 3 lessons REDESIGNED** (one step each: `cn-05-02/ch1`,
`fna-03-02/k2`, `ti-03-02/ch1`).

---

## Category A — Legitimately kept, no edit (7 lessons)

### `as-04-01` — Fact Families (add-subtract-20, Grade 1)
**Flagged:** `k2`. **Collides with:** `k1` (both `"family #, #, #: # − # = ?"`).
**KEEP.** `k1` (family 8,5,13) is the check immediately after `i1` teaches the fact-family skill;
`k2` (family 9,4,13) follows a fresh concept card (`c2`, new numbers 6/7/13) and an interactive
matching activity (`i2`) before re-checking with its own new family. This is the `FactFamilyNumeric`
variant form doing exactly what it's for — repeated production practice of the converse-subtraction
fact across spaced teaching, not a lazy copy. `k3` (mcq recognition) and `ch1` (spot-the-outsider)
already supply shape diversity elsewhere in the lesson.

### `as100-03-04` — Break a Ten (add-subtract-100, Grade 2)
**Flagged:** `k2`. **Collides with:** `k1` (both `"# − # = ?"`).
**KEEP.** `k1` (62−37) checks the break-a-ten procedure right after `c1`/`i1` teach it concretely
with base-ten blocks. `k2` (74−28) follows a second concept (`c2`, "two traps") and an interactive
classification activity (`i2`) that specifically flags 74−28 as a "needs a break" case — `k2` then
asks the student to actually compute the value `i2` only classified. Genuine spaced retrieval, not
a copy: the two checks sit after two different teaching contexts (concrete blocks, then
recognize-when-to-break).

### `asv-03-01` — Finding Side Lengths from Coordinates (area-surface-volume, Grade 6)
**Flagged:** `k3`. **Collides with:** `i2` (both `"a side runs from (#, #) to (#, #). what is its length?"`).
**KEEP.** `i2` (horizontal side, negative coordinates) is an interactive practice item immediately
followed by `k3` (vertical side, negative coordinates) — the assessed check. This is the canonical
"interactive teaches it, check immediately re-drills it" pattern, here specifically pairing the two
orientations (same-y vs. same-x) that both need negative-coordinate handling, which is exactly this
lesson's stated scope (c2: "the same rule works for vertical sides... it also works with negative
coordinates").

### `ee-05-01` — What an Inequality Says (expressions-equations, Grade 7)
**Flagged:** `k1`. **Collides with:** `i1` (both `"is x = # a solution of x > #?"`).
**KEEP.** `i1` tests an easy interior candidate (x=6 vs. x>5); `k1` — immediately following — tests
the boundary itself (x=5 vs. x>5), the classic "strict inequality excludes its own boundary" trap.
Same widget engine (`exactNumberLab`/`inequalityMembership`), deliberately different difficulty
tier, confirmed by the choice sets: `i1`'s distractors are about equality-vs-greater-than in
general, `k1`'s distractors are specifically about the boundary ("5 is close enough," "the boundary
always counts").

### `kc-01-03` — Count On (counting-to-20-k, Kindergarten)
**Flagged:** `i2`. **Collides with:** `i1` (both `"start at #. hop forward # times. where do you land?"`).
**KEEP.** Foundational K counting-on fluency: `i1` (start 3, hop 2, with a predict sub-question) and
`i2` (start 5, hop 3, no predict — independent execution) are separated by a full concept card (`c2`)
and an assessed check (`k1`) testing the related "next number" idea. Repeating the core
number-line-hop mechanic with new numbers at Kindergarten level, lightly escalating hop count, is
standard-issue fluency building, not a gap.

### `kc-05-01` — Make Ten (counting-to-20-k, Kindergarten)
**Flagged:** `i2`, `k2`, `k3`. **Collides with:** `i1` (i2, both `"# dots are here. tap the empty
spots to make ten."`) and `k1` (k2 and k3, all three `"# dots are in the ten frame. tap to add dots
until the frame makes ten."`).
**KEEP.** This is the strongest legitimate-fluency case in the packet: the entire point of a "Make
Ten" lesson is drilling every ten-partner pair (6&4, 7&3, 9&1, 3&7, 5&5 — explicitly named in `c2`,
"Every number has a ten partner"). `k1`/`k2`/`k3` drill three different partner pairs with the
identical `tenFrame` mechanic by design; forcing a redesign here would actively work against the
lesson's own purpose. `i1`/`i2` are the matching guided-practice pair before assessment.

### `ti-03-01` — Sum & Difference: New Angles from Old (trig-identities-equations, Grade 12)
**Flagged:** `k2`. **Collides with:** `k1b` (both `"evaluate cos #° to four decimals."`).
**KEEP.** `k1b` (cos 75° = cos(45°+30°)) and `k2` (cos 15° = cos(45°−30°)), sitting back-to-back
right after `c2` introduces "cosine's sign flip is the classic trap," deliberately test the two
*opposite* directions of that single sign-flip rule — sum uses minus, difference uses plus. Testing
only one direction would let rote "always minus" memorization pass; both angles are the exact pair
`c1` itself sets up (75° = 45°+30°, 15° = 45°−30°). A genuine two-sided rule check, not a copy.

---

## Category B — Redesigned (3 lessons)

### `cn-05-02` — Building Quadratics from Roots (complex-numbers, Algebra 2)
**Flagged:** `k1`, `ch1`. **Both collide with:** `i1` (all three `"which quadratic has roots # ±
#i?"`).
- **`k1` kept.** `i1` (mcq, recognize the correct quadratic from 4 options) → `k1` (buildExpression,
  construct it) immediately after is a genuine recognition→construction escalation using fresh
  numbers (1±5i vs. 3±2i), the standard check-after-interactive pattern.
- **`ch1` redesigned** (the later, challenge-tier collision — three steps now shared this template,
  which is the flag-worthy pattern the task calls out).
  - **Before:** "Which quadratic has roots −1 ± 2i?" (buildExpression) — mechanically identical
    construct-the-expression job to `k1`, just a third set of roots.
  - **After:** mcq — "Quadratic A has roots −1 ± 2i. Quadratic B has roots −1 ± 4i. Which part of
    x² − (sum)x + (product) is DIFFERENT between A and B?" (options: x-coefficient only / constant
    only / both / neither; correct = constant only).
  - **Why genuine:** changes the action from *construct* to *compare/identify-what-changes* — it
    tests whether the student understands that the sum (hence x-coefficient) depends only on the
    real part while the product (constant) also depends on the imaginary magnitude, directly
    validating the lesson's own recap point ("Sum 2a → middle term; product a²+b² → constant")
    rather than repeating a third build.
  - **Math re-verification (by hand, cross-checked with node):** A: sum = (−1+2i)+(−1−2i) = −2 →
    +2x; product = 1²+2² = 5 → x²+2x+5. B: sum = (−1+4i)+(−1−4i) = −2 → +2x (same); product =
    1²+4² = 17 → x²+2x+17. x-coefficient identical, constant differs (5 vs. 17) — confirms the
    correct option and both traps ("x-coefficient only" and "both") are genuinely wrong.
  - **Variant:** removed `{gen:"a2-complex", form:"cn-build-quad__buildExpression"}` — confirmed via
    `src/lib/algebra2Variants.ts` (`CONCEPT_ALIASES[CN]`) that `cn-build-quad__buildExpression` and
    `cn-build-quad__mcq` are both real registered forms, but neither produces a two-quadratic
    comparison; hand-authored per the task's preferred option (b) rather than adding a new form.
  - **Post-edit live re-derivation:** `repeatedTemplates=[k1]` — `ch1` no longer present; `k1`
    correctly remains (accepted `i1`→`k1` escalation, not claimed closed).

### `fna-03-02` — Piecewise Functions (function-analysis, Precalculus)
**Flagged:** `k2`. **Collides with:** `k1` (both `"what is p(#)?"`).
- **`k2` redesigned** (`k1` and `k2` are adjacent checks with no concept/interactive between them —
  `k1` tests the boundary trap p(2), `k2` immediately re-tested a second point in the same
  squaring branch, p(3), the profile the task flags as more likely accidental than intentional).
  - **Before:** "What is p(3)?" (numeric) — same single-branch evaluate action as `k1`.
  - **After:** mcq — "Is p(2) bigger than, smaller than, or equal to p(1)?" (options: bigger /
    smaller [correct] / equal to p(1)).
  - **Why genuine:** changes the action from *single-point evaluate* to *cross-branch compare*,
    targeting a new misconception untested elsewhere in the lesson — that a larger input must give
    a larger output — which is false here because the branch switch at x=2 causes a drop.
  - **Math re-verification (by hand, cross-checked with node):** p(1) = 1+5 = 6 (first branch, since
    1<2); p(2) = 2² = 4 (second branch, since 2≥2). 4 < 6, so p(2) is smaller — confirmed the
    correct option and that the "bigger" trap is genuinely plausible-but-wrong (a student who
    assumes monotonicity would pick it).
  - **Variant:** removed `{gen:"piecewise-eval"}` (default form) — read the generator directly in
    `src/lib/variants.ts`; its default form only ever evaluates a single point in the squaring
    branch (comment: "evaluate p at a point in the squaring branch (the boundary or above it)"), it
    cannot produce a cross-branch comparison, so hand-authored per option (b).
  - **Post-edit live re-derivation:** `repeatedTemplates=[]` — lesson now has zero structural
    repeats of any kind.

### `ti-03-02` — Tangent Sums & Cofunctions (trig-identities-equations, Grade 12)
**Flagged:** `ch1`. **Collides with:** `k1` (both `"evaluate tan #° to three decimals."`).
- **`ch1` redesigned** (a `check` and a far-later `challenge` posing the identical sentence shape —
  the exact pattern the task calls out as most likely a missed capstone opportunity; `k1` computes
  tan 75° = tan(45°+30°), `ch1` computed tan 15° = tan(45°−30°), the mirror-image difference case,
  separated by an entirely different sub-topic, cofunctions, that the challenge never touched).
  - **Before:** "Evaluate tan 15° to three decimals." (numeric, answer 0.268) — same
    apply-the-difference-formula action as `k1`, just the complementary angle.
  - **After:** "From this lesson, tan 75° = 2 + √3 and tan 15° = 2 − √3. What is tan 75° × tan 15°,
    exactly?" (numeric, exact answer 1).
  - **Why genuine:** synthesizes BOTH lesson topics — the closed-form tangent-sum/difference values
    and the complementary-angle relationship (75°+15°=90°) — into one capstone with an exact
    integer answer via difference-of-squares, rather than a second decimal-approximation repeat of
    the same formula-application job. Deliberately phrased without asserting the (untaught-by-name)
    "tangent cofunction is cotangent" identity — it stays inside vocabulary this lesson actually
    teaches, using the two values already established, and multiplying them directly.
  - **Math re-verification (by hand, cross-checked with node against `Math.tan`):**
    (2+√3)(2−√3) = 2² − (√3)² = 4 − 3 = 1 exactly. Cross-checked numerically:
    `Math.tan(75°)·Math.tan(15°) = 3.7320508...×0.2679491... = 1` to floating precision. Both traps
    verified wrong-but-plausible: 4 (adding instead of multiplying: 2+√3 + 2−√3 = 4) and 3.732
    (reporting tan 75° alone, forgetting to multiply by tan 15°).
  - **Variant:** removed `{gen:"g12-trig-identities-equations", form:"trig-identities-equations__ti-
    tan-cofunction__numeric"}`. Traced this tag to `src/lib/precalculusVariantTemplates.json` (an
    authored-template bank, not a procedural generator) and found its two stored entries for this
    form are verbatim copies of `k1`'s and the OLD `ch1`'s prompts — i.e. this form was seeded
    directly from this lesson's own original content. `k1` still points at the same form/bank
    unaffected by this edit (its entry is untouched); `ch1`'s new content has no matching entry, so
    per the task's preferred option (b) the pointer was deleted and the widget hand-authored,
    avoiding any edit to the shared JSON template bank.
  - **Post-edit live re-derivation:** `repeatedTemplates=[]` — lesson now has zero structural
    repeats of any kind.

---

## Gates run (after all edits)

- `node -e "JSON.parse(...)"` on all 3 edited files — all syntactically valid.
- `npm run validate:content` (`tsx scripts/content-check.ts schema`, whole corpus) →
  **schema: 1840/1840 files clean.**
- `npm run lint:pedagogy` (`tsx scripts/content-check.ts pedagogy`, whole corpus) →
  **pedagogy: 1710/1711 files clean** — the one failure is `content/courses/length-problems-g2/
  lessons/g2p-02-01.json` (generic incorrect-feedback on `k2`), a lesson never opened or touched by
  this packet (not one of this packet's 10 lessons, not in a course this packet touches) —
  pre-existing and out of scope for G10.
- `npx vitest run src/lib/content.widgets.audit.test.ts` (whole-corpus solvability gate: every
  widget SOLVABLE, not PRE-SOLVED, no DEAD wrong-paths) → 2 pre-existing failures, both unrelated to
  this packet's files (`g4x-02-01`, `sy-01-01` — neither in scope here); none of the 3 redesigned
  widgets appear in the failure list.
- `npx vitest run src/lib/content.authoredKeys.s242.test.ts` (whole-corpus reachable-string ratchet)
  → 1 failure, a stale pinned baseline (expected 148, measured 140 — a *decrease*, and every listed
  offender is `tf-01-*`/`knb-01-*`, none of this packet's lessons); unrelated to and not caused by
  this packet's edits.
- `npx vitest run src/lib/content.duplicateItems.s242.test.ts` (whole-corpus exact-MCQ-duplicate
  ratchet, S242) → all 4 sub-tests failed against a stale baseline (pinned 75/67 groups, measured 0
  everywhere) — this is a stricter same-prompt-AND-same-option-set check than our digit-normalized
  one; none of this packet's 3 edited lessons ever contributed to that baseline (their collisions
  were always number-different, never exact-prompt). Given the baseline's own comment pins it to
  "seal 642965a, 2026-08-16" and five days of subsequent sessions (S318–S329, visible in `git log`)
  did large-scale MCQ-duplicate remediation, this reads as a stale ratchet constant nobody has
  lowered yet, not a regression from this edit. Left untouched — updating a shared ratchet-baseline
  test file is out of this packet's scope.
- `npx vitest run src/lib/session277.functionAnalysisCourse.test.ts` → 2/2 pass.
- `npx vitest run src/lib/session309.trigIdentitiesEquationsChoiceParity.test.ts
  src/lib/session247.trigIdentityDomainTruth.test.ts` → 8/8 pass (the parity test's one `ti-03-02`
  entry tracks `k3`, untouched by this edit).
- No complex-numbers-specific course test exists (searched both `src/lib/session*.test.ts` by
  course-name substring and the `*Course.test.ts` family used by later-session courses — that
  family has no `complex-numbers` entry).
- No shared generator source file (`src/lib/variants.ts`, `algebra2Variants.ts`, `g0Variants.ts`,
  `precalculusVariantTemplates.json`) was edited by this packet — all three redesigns used the
  task's preferred option (b): delete the stale `variant` pointer and hand-author a static widget.
  `variants.resolver.test.ts` was therefore not required per the task's own conditional trigger, and
  was not run (a full run is a whole-registry sweep disproportionate to a content-only change).
- Live structural-repeat probe re-run on all 10 lessons after edits: all 3 redesigned steps clear
  their flag as described per-lesson above; all 7 kept lessons' flags persist unchanged, as expected
  for a purely structural detector that dispositions cannot suppress.

## A note on this session's shared working directory

Mid-task, a system reminder reported that all three edited files had reverted to their pre-edit HEAD
content — confirmed independently via `git diff HEAD` (zero diff) immediately after. This packet's
own 3 lessons were not claimed by any other visible concurrent packet (checked `S330_PROGRESSION_G6/
G8/G11.md` and their staging `.jsonl` files for `cn-05-02`/`fna-03-02`/`ti-03-02` — no matches), so
this was not another agent's competing edit; it looked like a transient sync/checkpoint artifact of
this shared multi-agent working directory. Re-reading moments later, the edits were back (this time
staged in git's index — `M ` in `git status --short`, which this session never ran itself),
`git diff HEAD` showed exactly the expected hunks, and a direct `grep` for the new content (bypassing
any tool-level caching) confirmed it on disk. `reviewBasisHash` was recomputed after this and matches
what was already recorded in `laneA-s330-G10.jsonl` byte-for-byte, so no disposition record needed
correcting — but flagging this here in case the same volatility affects other packets' evidence.

## Summary

**3 of 10 lessons redesigned, 7 kept as-is.** Every redesigned lesson's flagged repeat sat at the
challenge (or challenge-adjacent, `fna-03-02/k2` being the later of two adjacent checks) tier and was
mechanically identical in action to an earlier step in the same lesson — construct-the-same-shape-of-
expression again, or evaluate-the-same-single-branch-function again, or apply-the-same-formula-to-a-
mirror-angle again. Each was rewritten to demand a genuinely different job (compare, cross-branch
reasoning, or a two-topic synthesis) rather than a bigger/different number in the same slot. Every
kept lesson's flagged repeat was either ordinary fluency/retrieval practice of one well-defined skill
across fresh numbers (`as-04-01`, `as100-03-04`, `kc-01-03`, `kc-05-01` — the last being this
packet's clearest case, since drilling every ten-partner pair *is* the lesson), or a deliberately
paired two-sided/escalating test already doing real pedagogical work (`asv-03-01`'s
interactive→check orientation pair, `ee-05-01`'s easy-case→boundary-trap pair, `ti-03-01`'s
sum-sign→difference-sign pair, `cn-05-02/k1`'s recognition→construction pair) — forcing a redesign
on any of these would have made the lesson worse to manufacture a closed row, so they were left
alone.
