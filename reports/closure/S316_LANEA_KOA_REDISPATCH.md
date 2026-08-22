# S316 Lane A — KOA Redispatch (add-subtract-10-k, pattern KOA-R)

Prefix: `MT-V4-WORKER-PREFIX-1` (see `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`).
Authority for this packet: `reports/closure/S316_ADJUDICATION_REMEDIAL_STANDARD.md`, §3
(binding fix pattern **KOA-R**), overturning Worker A's `add-subtract-10-k` REVISE-lane
rejection for these 15 lessons specifically. `koa-02-01…koa-02-05` (already conforming) and
`mf3-*` (rejections upheld by the same adjudication) were left untouched, as instructed.

## Scope

15 lessons in `add-subtract-10-k`, each with the signed defect
`remedials[0].check.widget` byte-identical to the lesson's `k1` check:

`koa-01-01, koa-01-02, koa-01-03, koa-01-04, koa-01-05, koa-03-01, koa-03-02, koa-03-03,
koa-03-04, koa-03-05, koa-03-06, koa-03-07, koa-03-08, koa-03-09, koa-03-10`

## Method

For each lesson, read `koa-02-01…koa-02-05` as the in-course conforming template (hands-on
manipulative directive, smaller operands than `k1`, same widget `type`, both traps recomputed
with feedback in the manipulative's own language), then:

1. Read the full lesson JSON (`c1, i1, k1, c2, i2, k2, k3, ch1, r1`) to get `k1`'s exact
   operands, `k1`'s own `commonErrors` misconception formulas (confirmed by cross-checking the
   same formula against `k2`/`k3`/`ch1` in the same lesson), and the manipulative
   object/verb available from `i1`/`i2` (tenFrame counters, number-line hops, fingers,
   circles — substituting a generic hands-on prop such as "counter"/"toy person"/"block" where
   the interactive step's own noun was just the story character, matching the precedent set by
   `koa-02-03`'s own remedial, which does the same).
2. Picked the smallest qualifying operand pair strictly less than `k1`'s (see "operand
   correspondence" note below), re-derived the answer, and recomputed both traps from `k1`'s
   own misconception formula with the new numbers — never copy-pasted.
3. Rewrote the prompt as an imperative manipulative directive (Shape α: route/representation
   changed, not just an operand swap under `k1`'s own template) so the remedial is not a
   regenerable draw of the step's declared `variant` generator (R4).
4. Verified programmatically: parse-clean; `normalized(prompt)` (digit runs → `#`) distinct
   from every other widget-bearing step in the lesson; trap≠trap; trap≠answer; feedback ≥25
   chars and not negation-opening; MCQ options correct-first with exactly one correct option;
   `remedials[0].check.widget` payload differs from `k1`'s; prompt differs from `k1`'s.
5. Edited **only** `remedials[0].check.widget` in each file — verified byte-for-byte that every
   other JSON path (including `remedials[0].concept`, `remedials[0].check.body`,
   `remedials[0].check.explanationVariants`, `remedials[0].check.conceptTag`,
   `remedials[0].check.id`, and every `step`) is unchanged from `HEAD`.

Verification and edits were done with two short Python scripts (json-native round-trip,
`ensure_ascii=False`, matching the file's existing 2-space indent) rather than the project's
TypeScript gates — **`npm`/`vitest`/`tsc` were not run**, per instruction. This means R4
(non-regenerability by the declared `variant` generator) and the repo's own
`src/lib/variants.test.ts` / `session252.addSubtract10KCourseIntegrity.test.tsx` gates were
**not executed**; see "Not verified" below.

### Operand correspondence

Step 3 of KOA-R says "both operands strictly less than `k1`'s corresponding operands." For
addition/subtraction "put together"/"join"/"take away" stories this is unambiguous
(position = story role). For two lessons the literal positional reading collapsed one trap
onto another or onto the answer for every value in range — see "Documented deviations" below.

## Per-lesson results

| Lesson | k1 operands | New operands | New answer | Widget type |
|---|---|---|---|---|
| koa-01-01 | (3, 2) | (1, 1) | 2 | numeric |
| koa-01-02 | (4, 2) | (1, 2) | 3 | numeric |
| koa-01-03 | (2, 4) | (1, 2) | 3 | numeric |
| koa-01-04 | (3, 2) | (1, 1) | 2 | numeric |
| koa-01-05 | (3, 2) | (1, 1) | 2 | mcq |
| koa-03-01 | (4, 3) | (1, 2) | 3 | numeric |
| koa-03-02 | (8, 3) | (3, 1) | 2 | numeric |
| koa-03-03 | (3, 4) | (1, 1) | 2 | numeric |
| koa-03-04 | (5, 2) | (1, 1) | — (choose-op) | mcq |
| koa-03-05 | (5, 2) | (1, 1) | — (choose-drawing) | mcq |
| koa-03-06 | (2, 3) | (1, 1) | 2 | numeric |
| koa-03-07 | (5, 3) | (3, 2) | 1 | numeric |
| koa-03-08 | (6, 1) | (1, 1)* | 2 | numeric |
| koa-03-09 | (6, 0) | (1, 0)* | 1 | numeric |
| koa-03-10 | (3, 2) | (1, 1) | 2 | numeric |

\* see documented deviation below.

Full per-lesson machine-checked results (R1/R2/R3/R5, feedback length, MCQ correct-first,
operand bound) are in
`reports/closure/cowork-staging/laneA-koa-redispatch.jsonl` (one NDJSON record per lesson).

**All 15 lessons: R1 (prompt≠k1), R2 (normalized-distinct from every widget-bearing step in
the lesson), R3 (payload≠k1), R5 (trap≠trap, trap≠answer, feedback ≥25 chars, no
negation-opening), and MCQ correct-first/exactly-one-correct all PASS.**

### Documented deviations (both logged, both deliberate)

- **koa-03-07** (`differences-within-5`): the lexicographically smallest pair passing every
  R1–R5 check under the literal positional reading was `(a=3, b=1)`, answer 2 — but
  `remedials[0].concept.body` (untouched, out of scope) reads "...if 2 and 3 make 5, then 5
  take away 3 leaves **2**," i.e. the number 2 is stated immediately before the check in the
  injected `[concept, check]` pair. Per the R6 concern (§1.4, and defect (i) in the
  adjudication), this is a reveal-adjacency risk even though it doesn't technically restate
  *this* problem's numbers. Skipped that pair and used the next-smallest valid pair,
  `(a=3, b=2)`, answer 1, which shares no digit with the concept text.
- **koa-03-08** (`plus-one-minus-one`) and **koa-03-09** (`zero-changes-nothing`): `k1`'s
  second operand (1 and 0 respectively) is the fixed constant that *defines* the lesson's
  concept, not a free quantity — shrinking it below 1 (or below 0) would either be impossible
  (0 has no non-negative value less than it) or would silently turn the lesson into a
  different concept (e.g. "plus one" becoming "plus zero", which is a different, separately
  authored lesson). Only the genuine variable operand (`a`: 6→1 in both cases) was shrunk; the
  structural constant was left at its lesson-defining value. This is flagged in the NDJSON
  (`operandsStrictlySmallerThanK1: false`, with `operandBoundNote` explaining why) rather than
  silently passed.

## Not verified (no gates were run, per instruction)

- `npx vitest run` (in particular `src/lib/variants.test.ts` and
  `src/lib/session252.addSubtract10KCourseIntegrity.test.tsx`), `npm run typecheck`,
  `npm run validate:content`, `npm run lint:pedagogy`, `npm run validate:native`,
  `node scripts/check-registration.mjs`, and the build were **not run**.
- R4 (remedial prompt not producible by the step's declared `variant` generator/form) was
  checked only by manual template comparison: every new remedial prompt uses a hands-on
  manipulative directive ("Fill the frame to show…", "Show… on the frame", "Set out…", "Put
  out…/Slide…") built from the lesson's own `i1`/`i2` interactive language, which is a
  different phrasing family from every `k1`/`k2`/`k3`/`ch1` template in the same lesson (those
  use story-specific nouns — cookies, birds, ducks, cats, apples — never "counter"/"frame" as a
  generic prop). This is consistent with the adjudication's own §1.3 finding (representation
  shifts, not operand swaps under an identical template, are what clears R4), but it was not
  confirmed by driving the actual TypeScript generator.
- `remedials[0].check.explanationVariants` (left untouched, per explicit instruction) now
  states `k1`'s original numbers, which no longer match the new widget's numbers in all 15
  lessons (e.g. `koa-01-01`'s remedial still says "3 and 2 together make 5" next to a widget
  that now asks about 1 and 1). This mirrors the existing, separately-tracked
  `remedials[0].concept.body === c2.body` defect class (§6 of the adjudication) — recorded
  here for a human, not fixed, because the task and the adjudication both explicitly scope
  `explanationVariants` out of this packet.

## No lessons rejected

All 15 lessons in scope were fixed. No lesson required a new figure, a generator change, or an
authored-prose amendment outside `remedials[0].check.widget`, so none were escalated or left
unedited.
