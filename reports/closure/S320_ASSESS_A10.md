# S320 Assess A10 — Independent Course Assessment

Reviewer: Claude Cowork independent assessor (S320)
Reviewed at: 2026-08-20T18:35:11.000Z
Scope: content/courses/expressions-patterns-g5, content/courses/derivatives-in-context, content/courses/exponents-polynomials — course.json + every lesson, in full.
Authority contract: reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md (read first, obeyed throughout).
Output: reports/closure/cowork-staging/laneB-s320-A10-dispositions.jsonl (35 NDJSON records, one per lesson). This file does not write, and was not derived by editing, reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl (the ledger).

Method: every lesson JSON read in full; every arithmetic evaluation, order-of-operations chain, exponent/polynomial product-quotient-factor, and contextual-derivative interpretation recomputed by hand from scratch; every commonErrors/numericErrors distractor's derivation checked against its feedback text; every referenced figure located in src/components/figures.tsx and its rendered SVG text/title checked against the adjacent lesson prose for numeric consistency; interactive-widget renderers for graphZoom, derivativeTrace, secantSlope, and relatedRatesLab located in src/components/widgets.tsx and read to confirm displayed quantities are genuinely computed from spec, not hardcoded; duplication scanned programmatically both within-lesson (main steps vs. remedials) and cross-lesson, across all widget types (not just mcq/numeric); reviewBasisHash values bulk-fetched via `node scripts/session/print-review-basis.mjs`; the seeded-shuffle-at-render behavior (widgets.tsx / LessonPlayer.tsx) confirmed so raw-JSON option order/index is never itself treated as a defect; the session197-family platform-red test pins in expressions-patterns-g5 confirmed as engine/generator test debt, not a content defect, per the task's explicit note, and not re-litigated here. No npm/vitest/tsc was run.

Additional evidence consulted (read-only): `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` (current workload queue, authoritative per the contract) was checked for every one of the 35 lesson IDs — it confirms an open VISUAL_FIRST_REPRESENTATION and (for most dc/ep lessons) GRADE_LANGUAGE_REVIEW row per lesson, i.e. this assessment is the intended mechanism for closing those rows, and a LESSON_PROGRESSION_AND_DUPLICATION row for 7 specific lessons (ep-01-01, ep-01-02, ep-01-03, ep-02-03, ep-03-01, ep-04-03, g5e-01-04) citing specific "number-normalized-prompt" step pairs. Each of those 7 is individually addressed in its rationale below. `reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl` (the ledger) was also read for context only (never written): it holds 11 stale `S246-DC-*` REVISE records for every dc lesson and one current `S318-V-ep-01-01` KEEP record. Every dc ledger hash was recomputed via print-review-basis.mjs and confirmed to differ from the current source hash (i.e. the source changed since those findings were recorded — stale per the authority contract's "treat mismatched hash as stale" rule), while ep-01-01's ledger hash matches current source exactly and its KEEP/SUFFICIENT/FIT verdict agrees with this independent review. Rather than silently accept or silently discard the stale dc findings, the two most substantive (non-runtime-only) ones were independently re-derived from current source: the L'Hôpital theorem-precision concern (dc-04-01/dc-04-02, re-verified clean on current text) and the tangent-vs-curve interactive concern (dc-03-01, re-verified and CONFIRMED as a live defect by reading the widget's rendering code — see below). Purely runtime-only claims in the stale entries (figure-withheld-by-blocklist, generated-variant answer-length parity) are outside what a read-only JSON review can verify and are flagged as such in the affected lessons' rationale rather than asserted or dismissed.

## Counts by course

| Course | Lessons | KEEP | REVISE |
|---|---|---|---|
| expressions-patterns-g5 | 12 | 12 | 0 |
| derivatives-in-context | 11 | 10 | 1 |
| exponents-polynomials | 12 | 8 | 4 |
| **Total** | **35** | **30** | **5** |

## REVISE list (one-phrase reasons)

1. **dc-03-01** — i1's graphZoom widget promises "watch the curve straighten" but its renderer draws an unconditionally straight line (hardcoded slope) at every zoom level, so no curvature is ever shown to straighten.
2. **ep-01-02** — remedial check is a near-verbatim duplicate of i1 (same prompt, answer, and error feedback), zero new practice value.
3. **ep-02-03** — remedial check is byte-identical to k1 (same prompt, answer, and commonErrors), zero new practice value.
4. **ep-03-01** — remedial check is byte-identical to k1 (zero new practice value), AND c1's distribute-area figure renders "3(x+4)=3x+12" while the adjacent text teaches "3x(x+4)=3x²+12x" (visual omits the exponent-growth point being taught).
5. **ep-04-01** — remedial check duplicates i1 almost verbatim (same GCF-coefficient prompt/answer/errors), zero new practice value.

## Per-lesson verdicts

### expressions-patterns-g5 (12/12 KEEP)

| Lesson | Decision | Visual | Language | One-line basis |
|---|---|---|---|---|
| g5e-01-01 | KEEP | SUFFICIENT | FIT | Order-of-operations chains recomputed correct; dop-precedence/dop-grouping figures match. |
| g5e-01-02 | KEEP | SUFFICIENT | FIT | Word-expression translations correct; dop-word-expr figure matches. |
| g5e-01-03 | KEEP | SUFFICIENT | FIT | Nested-grouping evaluations correct; remedial numbers fresh. |
| g5e-01-04 | KEEP | SUFFICIENT | FIT | All 5 multiply-then-subtract evaluations recomputed correct; PROGRESSION-g5e-01-04 (k3) reviewed and approved as fluency design. |
| g5e-02-01 | KEEP | SUFFICIENT | FIT | Word-phrase translations correct in both directions. |
| g5e-02-02 | KEEP | SUFFICIENT | FIT | Expression/words mappings correct; remedial reuses concept numbers with a different question (standard, not duplication). |
| g5e-02-03 | KEEP | SUFFICIENT | FIT | Multi-operation phrase translations correct; no exact-prompt repeats. |
| g5e-03-01 | KEEP | REQUIRED | FIT | Pattern-pair values correct; coordinate visual is the core representation. |
| g5e-03-02 | KEEP | REQUIRED | FIT | Plotted points (2,4)/(4,8)/(6,12) cross-checked against cg-pair-terms figure — match exactly. |
| g5e-03-03 | KEEP | REQUIRED | FIT | Pair/rule conversions correct; figures match adjacent ratios. |
| g5e-03-04 | KEEP | REQUIRED | FIT | cg-pair-terms reuse scrutinized: rendered SVG shows no visible false "doubling" claim next to the ratio-3 example. |
| g5e-03-05 | KEEP | REQUIRED | FIT | Capstone values correct; remedial uses a fresh pair. |

### derivatives-in-context (10/11 KEEP, 1 REVISE)

| Lesson | Decision | Visual | Language | One-line basis |
|---|---|---|---|---|
| dc-01-01 | KEEP | REQUIRED | FIT | Motion arithmetic correct; derivativeTrace genuinely samples spec.fn (verified in source), not hardcoded. |
| dc-01-02 | KEEP | REQUIRED | FIT | Speeding-up/slowing-down sign logic correct on every instance. |
| dc-01-03 | KEEP | PREFERRED | FIT | Distance-vs-displacement three-leg arithmetic correct, including backtrack sign. |
| dc-02-01 | KEEP | REQUIRED | FIT | Ladder/disc/balloon rates independently re-derived and correct; RelatedRatesLab renderer confirmed live-computed, not hardcoded. |
| dc-02-02 | KEEP | REQUIRED | FIT | Sliding-ladder numbers (x=6,y=8,dy/dt=-1.5; x=8,y=6,dy/dt=-8/3) re-derived and correct. |
| dc-02-03 | KEEP | REQUIRED | FIT | Relation-choice and car-transfer rate arithmetic correct. |
| **dc-03-01** | **REVISE** | **ESCALATE** | FIT | See implementation contract below — graphZoom widget cannot show curvature. |
| dc-03-02 | KEEP | PREFERRED | FIT | Error-propagation arithmetic correct, including independently re-derived √9.1 error scale. |
| dc-03-03 | KEEP | PREFERRED | FIT | Secant-to-tangent and corner-case reasoning correct; secantSlope confirmed to sample a real curve. |
| dc-04-01 | KEEP | SUFFICIENT | FIT | Every L'Hôpital limit re-derived correct; theorem-precision re-checked specifically and found adequately hedged (form-check warning, non-indeterminate trap). |
| dc-04-02 | KEEP | SUFFICIENT | FIT | x·ln x rewrite and growth hierarchy correct; ∞−∞ mention is an ungraded, untested survey remark, not a scored false claim. |

### exponents-polynomials (8/12 KEEP, 4 REVISE)

| Lesson | Decision | Visual | Language | One-line basis |
|---|---|---|---|---|
| ep-01-01 | KEEP | SUFFICIENT | FIT | All product/quotient evaluations correct; agrees with existing current-hash ledger entry S318-V-ep-01-01. |
| **ep-01-02** | **REVISE** | SUFFICIENT | FIT | See implementation contract below — remedial duplicates i1. |
| ep-01-03 | KEEP | SUFFICIENT | FIT | Zero/negative exponent rules correct; PROGRESSION items (k3, ch1) reviewed and approved as fluency design. |
| ep-02-01 | KEEP | SUFFICIENT | FIT | Term/degree/coefficient identification correct throughout. |
| ep-02-02 | KEEP | SUFFICIENT | FIT | Polynomial addition correct, including ep-add-poly figure's worked instance. |
| **ep-02-03** | **REVISE** | SUFFICIENT | FIT | See implementation contract below — remedial duplicates k1. |
| **ep-03-01** | **REVISE** | **ESCALATE** | FIT | See implementation contract below — remedial duplicates k1, AND figure mismatch. |
| ep-03-02 | KEEP | REQUIRED | FIT | FOIL arithmetic correct throughout; binomialAreaLab is the primary teaching device. |
| ep-03-03 | KEEP | REQUIRED | FIT | Special-products arithmetic correct; k2/ch1 same-numbers pattern reviewed as intentional part-then-whole scaffolding. |
| **ep-04-01** | **REVISE** | SUFFICIENT | FIT | See implementation contract below — remedial duplicates i1. |
| ep-04-02 | KEEP | REQUIRED | FIT | Trinomial factoring correct throughout, including every buildExpression distractor. |
| ep-04-03 | KEEP | REQUIRED | FIT | Difference-of-squares factoring correct; PROGRESSION (k2, ch1) reviewed as intentional escalating-coefficient design. |

## Implementation contracts for REVISE lessons

### 1. dc-03-01 — "The Tangent as an Approximation"

**Defect:** Step `i1` (kind `interactive`, widget type `graphZoom`, `behaviour: "continuous"`, `a: 3`, `leftValue: 5`, `rightValue: 5`, `fAtA: 5`) is introduced with "Watch the curve straighten — that straightness IS the linearisation," and its `successFeedback` says "At high magnification the curve is indistinguishable from a straight line... The approximation is good precisely because differentiability promised local straightness in the first place." But `GraphZoomW` in `src/components/widgets.tsx` (~lines 2972–2979) defines the rendered function as:
```
const SLOPE = 1;
const f = (x) => {
  const d = x - spec.a;
  ...
  if (Math.abs(d) < 1e-9) return spec.behaviour === "removable" ? null : spec.fAtA;
  return spec.leftValue + SLOPE * d;
};
```
For `behaviour: "continuous"` this is `f(x) = leftValue + 1*(x - a)` for every `x`, at every zoom level from 0 to 6 — an exactly straight line with slope 1, unconditionally. There is no curved shape at low zoom that visually resolves into a line at high zoom; the rendering is identical (a straight line) before any magnification is applied. The interactive therefore cannot demonstrate its own claim — that a genuinely curved differentiable function becomes indistinguishable from its tangent only in the limit of high magnification — because no curvature is ever present to begin with.

**Fix contract:** Either (a) give this widget instance a genuinely curved backing function (the `GraphZoomW` component would need a `behaviour` variant, or a `curve`-style spec like `SecantSlopeW`/`DerivativeTraceW` already use, that samples a real nonlinear function and only approaches linearity as zoom increases), or (b) if `GraphZoomW`'s continuous/removable/jump modes are intentionally always-linear by design (e.g. because they exist primarily to teach continuity/limit-existence, as in dc-04-01 and the limits-continuity course), replace this specific instructional moment with a different widget (e.g. a `secantSlope`- or `derivativeTrace`-style component, both confirmed in this review to render genuine sampled curves) that can actually show curvature flattening under magnification. Text/feedback should not be changed to describe a lesser claim merely to match the current rendering — the pedagogical point (local straightness under zoom) is correct and worth keeping; the widget needs to be capable of showing it.

### 2. ep-01-02 — "Power of a Power & Products"

**Defect:** The lesson's only remedial check (`remedials[0].check`, id `rem-ep-k`) has prompt "Simplify (2^4)^2 to 2^?. What is the exponent?", answer `8`, `commonErrors` values `6` and `16` — identical prompt, answer, and (for value 16) verbatim-identical feedback text to step `i1`'s `placeValueTransformLab` widget, which every student already answers earlier in the same lesson. Main-path checks `k1`, `k2`, `k3` use different numbers ((2^3)^2, (x^2)^5), so the remedial retests nothing a struggling student got wrong.

**Fix contract:** Replace the remedial check's prompt/numbers with a fresh power-of-a-power instance not already used in `i1`, `k1`, `k2`, `k3`, or `ch1` (e.g. `(3^2)^3` or `(x^3)^4`), updating `answer` and `commonErrors` values/feedback to match the new numbers, following the same template the existing remedial already uses.

### 3. ep-02-03 — "Subtracting Polynomials"

**Defect:** The remedial check (`rem-ps-k`) is byte-identical to step `k1`: both read "Subtract: (5x^2 + 3x - 2) - (2x^2 + 7x - 6). What is the coefficient of x?", answer `-4`, with matching `commonErrors`. A student remediated after failing `k1` is handed the exact same question.

**Fix contract:** Replace the remedial's polynomial pair with a fresh subtraction instance not used elsewhere in the lesson (`k2`/`k3` already use `(6x^2+2x-1)-(3x^2+2x-5)`, `ch1` uses `(7x^2+4x-2)-(3x^2-x+5)` — pick a fourth distinct pair), recomputing `answer` and `commonErrors` to match.

### 4. ep-03-01 — "Multiplying by a Monomial"

**Defect A (duplication):** The remedial check (`rem-pmm-k`) is byte-identical to `k1`: both "Multiply (3x)(x + 4). What is the coefficient of x?", answer `12`, matching `commonErrors`.

**Defect B (figure mismatch):** Step `c1`'s figure `distribute-area` (`DistributeArea` in `src/components/figures.tsx`) renders "3(x + 4) = 3x + 12" (a plain-constant multiplier, no x² term), directly beneath text that explicitly works "So 3x(x + 4) = 3x·x + 3x·4 = 3x² + 12x." The visual uses a different multiplier (3 instead of 3x) and a different-degree result (no x² term), so it fails to show the exponent-addition point (x·x = x²) that is the sentence's actual subject. This same lesson's `c2` step already pairs correctly with figure `ep-monomial` ("2x(3x−5) = 6x² − 10x"), proving a matching figure convention is available.

**Fix contract:** (A) Replace the remedial's numbers with a fresh monomial-times-binomial instance not used elsewhere in the lesson (e.g. `(2x)(x + 5)` or `(4x)(x + 2)`), recomputing `answer`/`commonErrors`. (B) Swap `c1`'s `figure` key from `distribute-area` to a figure that actually renders `3x(x + 4) = 3x² + 12x` (either point it at a new component built for this exact worked instance, following the same pattern as `ep-monomial`, or repoint to any existing figure in the exponents-polynomials set that already shows a monomial-with-variable times a binomial with a resulting x² term).

### 5. ep-04-01 — "Factoring with the GCF"

**Defect:** The remedial check (`rem-fg-k`) duplicates step `i1` almost verbatim: both "What is the GCF coefficient of (6x^2 + 9x)?", answer `3`, `commonErrors` values `6`/`9` with equivalent feedback wording.

**Fix contract:** Replace the remedial's expression with a fresh GCF instance not used elsewhere in the lesson (`i3` already uses `(10x^2 - 15x)`, `ch1` uses `(12x^3 - 18x^2)` — pick a distinct pair, e.g. `(14x^2 + 21x)`, GCD 7), recomputing `answer` and `commonErrors`.

## Notes

- No lesson or course source file was modified by this review (read-only on content, as instructed).
- `reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl` (the ledger) was never written to.
- expressions-patterns-g5's known session197-family platform-red test pins (positional hazards in `g4-multiply` variant routes, plotPoint manipulation caps) are confirmed engine/generator test debt, not a content defect, and were judged on content merits only, per the task's explicit instruction.
- `cml` blocks (kernel/invariants/misconceptions/representations/transferFamily) present on most steps are internal instructional-design metadata, consistently templated per conceptTag; they were read but not treated as learner-facing text requiring independent duplication/language scrutiny.
- The `mcq`/`predict` "always index o0/first option is correct" pattern visible in raw JSON is expected and not a defect: seeded-shuffle-at-render is confirmed present in `src/components/widgets.tsx`, `src/components/LessonPlayer.tsx`, and extensive test coverage.
