# S316-V2 — independent verification of `add-within-100-g1`, `properties-strategies-g1`, and the KOA-R `add-subtract-10-k` redispatch (43 lessons)

Verifier: Claude Cowork independent verifier (S316-R). Date: 2026-08-20.
Standard: `reports/closure/S316_ADJUDICATION_REMEDIAL_STANDARD.md` (S316-R), §1.4 (R1–R9),
including pattern **KOA-R** (§3). This assessor edited no content file; it wrote only
`reports/closure/cowork-staging/laneAV2-g1-koa-dispositions.jsonl` and this report.

## Method

For each of the 43 lessons: read the original bare S244 REVISE rationale
(`reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl`), read the current working-tree lesson JSON
and `git diff HEAD -- <file>`, and independently recomputed R1–R6 programmatically (a throwaway
Node script, not the staged implementer claims) — normalized-prompt distinctness against **every**
widget-bearing step in the lesson (not just `k1`), trap/option value and feedback distinctness and
truth, feedback length/negation, MCQ correct-first. R4 was checked by reading the actual generator
source (`src/lib/g1Variants.ts` for g1a/g1p, `src/lib/g0Variants.ts` for koa) for every `gen`/`form`
declared on each lesson's `k1`/`k2`/`k3`/`ch1`, not by trusting the implementer's self-report. The
staged implementer evidence
(`reports/closure/cowork-staging/laneA-g1-rework.jsonl`, `S316_LANEA_G1_REWORK.md`,
`laneA-koa-redispatch.jsonl`, `S316_LANEA_KOA_REDISPATCH.md`) was read only **after** an independent
verdict had been formed per lesson, then cross-checked for discrepancies.

`npm`/`vitest`/`tsc` were not run, per instruction.

## Verdict counts

| Decision | Count |
|---|---|
| KEEP | 29 |
| REVISE | 14 |
| ESCALATE | 0 |
| **Total** | **43** |

- `add-within-100-g1` (14): **KEEP 14/14**
- `properties-strategies-g1` (14): **KEEP 14/14**
- `add-subtract-10-k` KOA-R redispatch (15): **KEEP 1** (`koa-03-04`), **REVISE 14**

## Non-KEEP list with reasons

All 14 REVISE verdicts are in `add-subtract-10-k` and share one defect class, found independently
during this verification pass (not present in the implementer's machine-checked NDJSON, though
disclosed narratively in the implementer's own report — see "Cross-check" below):

**`remedials[0].check.explanationVariants` was left untouched by the KOA-R rework and now states
the pre-rework (`k1`-scale) numbers, which no longer match the new, smaller-operand remedial
widget.** `LessonPlayer.tsx:892–894` renders `explanationVariants[st.variant]` to the learner
immediately after the check is answered, so this is a live, learner-visible falsehood, not a
cosmetic leftover — exactly the residual class the verification brief asked to be checked and named.

| Lesson | New widget (operands → answer) | Stale `explanationVariants` |
|---|---|---|
| koa-01-01 | 1 counter + 1 more → 2 | "3 and 2 together make 5." / "Counting every object in both groups gives 5." |
| koa-01-02 | 1 finger + 2 more → 3 | "4 fingers and 2 fingers make 6." |
| koa-01-03 | 1 circle + 2 more → 3 | "2 circles and 4 more make 6." |
| koa-01-04 | 1 toy person + 1 more → 2 | "3 children and 2 more make 5." |
| koa-01-05 | 1 block + 1 more → 1+1=2 | "Joining is written with a plus sign: 3 + 2 = 5." |
| koa-03-01 | 1 apple + 2 more → 3 | "4 plus 3 more makes 7." |
| koa-03-02 | 3 apples − 1 → 2 | "8 take away 3 leaves 5." |
| koa-03-03 | 1 red + 1 green → 2 | "3 red and 4 green make 7 grapes." |
| koa-03-05 | 1 counter, 1 moved away | "Crossing out shows the **2 cats** that left." (stale number **and** stale noun — no cats in the new widget) |
| koa-03-06 | 1 counter + 1 more → 2 | "2 + 3 = 5." / "2 and 3 more makes 5." |
| koa-03-07 | 3 counters − 2 → 1 | "5 − 3 = 2." / "Taking 3 from 5 leaves 2." |
| koa-03-08 | 1 counter + 1 more → 2 | "One more than 6 is 7." |
| koa-03-09 | 1 counter + 0 more → 1 | "Adding or taking away zero leaves **6** unchanged." / "...the count stays **6**." |
| koa-03-10 | 1 counter + 1 more → 2 | "3 + 2 = 5." |

Confirmed by contrast: the course's own already-conforming exemplar `koa-02-01` (not part of this
rework) correctly updates its `explanationVariants` to match its own new operands ("Five counters
with 2 moved away leave 3 counters"), showing the update was expected and simply skipped in this
15-lesson batch.

`koa-03-04` is the one exception: its `explanationVariants` ("More arriving means the group grows,
so add." / "Joining groups is addition.") are number-free and remain true of any add-story
regardless of operand size, so no mismatch exists — **KEEP**.

**Everything else in all 14 REVISE lessons conforms**: R1 (prompt≠k1), R2 (normalized-distinct from
every widget-bearing step), R3 (payload≠k1), R4 (confirmed against the actual `g0Variants.ts`
generator template, which is a bare story-equation shape, never the manipulative-directive phrasing
used here), R5 (traps recomputed, literally true, no trap=answer/trap=trap, feedback ≥25 chars,
no negation-opening), MCQ correct-first, R6 (no answer-on-screen), edits confined to
`remedials[0].check.widget`. The fix is narrow: rewrite `explanationVariants` to restate the
strategy using the widget's own drawn numbers (the `koa-02-01` pattern), or make it number-free like
`koa-03-04`'s.

## Deviation rulings (KOA-R §3, documented deviations)

Both documented deviations in `laneA-koa-redispatch.jsonl` / `S316_LANEA_KOA_REDISPATCH.md` are
**AFFIRMED as sound**, independently re-derived from the lesson content rather than taken on trust:

1. **`koa-03-07` — second-smallest pair chosen instead of the mechanically-smallest, for
   reveal-adjacency.** The lexicographically smallest valid pair under KOA-R Step 3's literal rule
   is `(a=3, b=1)` → answer `2`. But `remedials[0].concept.body` (untouched, out of scope) reads
   *"...if 2 and 3 make 5, then 5 take away 3 leaves **2**"* — i.e. answer `2` is stated in the
   text `playerStore` injects immediately before the check. Using that pair would be a live R6
   violation. Independently verified the concept text does state "leaves 2" and that the pair
   actually shipped, `(a=3, b=2)` → answer `1`, shares no digit with that phrase. **Deviation
   sound**: the mechanical smallest-pair tiebreak is correctly subordinate to R6, and R6 is
   satisfied in the shipped state.
2. **`koa-03-08` / `koa-03-09` — fixed structural-constant operand not shrunk.** `k1`'s second
   operand (`1` for "plus one", `0` for "plus/minus zero") is the constant that *defines* the
   lesson's own concept; shrinking it below its lesson-defining value is either impossible (no
   non-negative value is less than `0`) or would silently turn the lesson into a different,
   separately-authored concept ("plus one" becoming "plus zero"). Only the genuine free operand
   (`a`: 6→1 in both cases) was shrunk, and the deviation is disclosed in the NDJSON
   (`operandsStrictlySmallerThanK1: false`, with an explanatory `operandBoundNote`) rather than
   silently passed. **Deviation sound**: KOA-R Step 3's "both operands strictly smaller" rule exists
   to force freshness and avoid degenerate/negative ranges, not to destroy the fact family the
   lesson exists to teach.

## Discrepancies between implementer claims and independent verification

1. **`explanationVariants` staleness (the main finding above) — implementer disclosed, but did not
   gate on it.** `S316_LANEA_KOA_REDISPATCH.md`'s own "Not verified" section states
   `explanationVariants` "now states `k1`'s original numbers, which no longer match the new widget's
   numbers in all 15 lessons... recorded here for a human, not fixed, because the task and the
   adjudication both explicitly scope `explanationVariants` out of this packet." This is an honest
   disclosure, not a concealment — but this verification pass was explicitly charged with checking
   `explanationVariants` against the new widget and issuing REVISE where it is mismatched
   (independent of the redispatch packet's own scoping decision), so 14/15 verdicts differ from a
   naive read of the implementer's "All 15 lessons: R1... R5... all PASS" summary line, which is
   true on its own narrow terms (it never claimed to check `explanationVariants`) but does not by
   itself support a KEEP disposition.
2. **`laneA-g1-rework.jsonl` (28 lessons) — no discrepancy found.** Every R1/R2/R3/R5/R4/MCQ claim
   in the NDJSON and `S316_LANEA_G1_REWORK.md` matches this independent re-derivation, including the
   one in-flight defect the worker's own reading pass found and fixed (`g1p-02-05`'s trap-`10`
   feedback direction was backwards in draft — "one too many removed" for a value that is *higher*
   than the answer — and was corrected to "stops one pretzel too soon"; verified the corrected text
   is now in the file and is literally true: 17 − 7 = 10). `explanationVariants` in all 28 g1a/g1p
   lessons are number-free strategy prose (independently re-verified for every lesson), so the
   staleness defect class found in the koa batch does not and cannot occur here — this matches the
   implementer's own claim and the adjudication's characterization of Worker B's packet.
3. **koa-03-04 in the implementer's per-lesson NDJSON carries no `operandBoundNote`** and is not
   called out as a residual explanationVariants risk in the summary table — consistent with the
   independent finding that it is the one clean lesson in the batch.

## Scope confinement (all 43 lessons)

Every modified file in the working tree for these three courses has exactly one contiguous diff
hunk against `HEAD` confined to `remedials[0].check.widget` (or, for `g1p-03-04`, two hunks both
inside that same JSON subtree, split only by an unchanged intervening line). No lesson id, step id,
`conceptTag`, hint, `remedials[0].concept`, or main-sequence step was touched in any of the 43
files. `remedials[0].concept.body === c2.body`: **0/28** in g1a+g1p (independently re-verified,
matching the implementer's claim that this course pair does not carry that separate, non-gating
residual class); **5/15** in the koa redispatch scope (`koa-01-01…01-05` match `c2.body`; all 10
`koa-03-*` lessons differ) — this is
the pre-existing, separately-tracked, non-gating residual class from the S316 adjudication (§6),
untouched by KOA-R as instructed (KOA-R Step 6 explicitly forbids editing `remedials[0].concept`),
and is recorded here for a human, not fixed.

## Gates

Per instruction, `npm run typecheck`, `npx vitest run`, `npm run validate:content`,
`npm run lint:pedagogy`, `npm run validate:native`, `node scripts/check-registration.mjs`, and the
build were **not run** by this verification pass. No packet in this batch may be declared landed on
the strength of this report alone; the 14 REVISE lessons additionally need
`remedials[0].check.explanationVariants` rewritten before they can be re-verified toward KEEP.

## Files

- Dispositions: `reports/closure/cowork-staging/laneAV2-g1-koa-dispositions.jsonl` (43 records, one
  per lesson, `reviewedBasisHash` from `node scripts/session/print-review-basis.mjs`).
- This report: `reports/closure/S316_LANEAV2_G1_KOA_VERIFICATION.md`.

---

## Addendum (2026-08-20) — round-2 residual fix verified; 14 koa REVISE records superseded

`reports/closure/S316_RESIDUAL_FIXES_2.md` (item 1) and staging
`reports/closure/cowork-staging/laneA-residuals-2.jsonl` report that `remedials[0].check.explanationVariants`
was rewritten in exactly the 14 `add-subtract-10-k` lessons this report REVISEd above
(`koa-01-01…01-05`, `koa-03-01…03-03`, `koa-03-05…03-10`), to restate each strategy using the
current widget's own drawn numbers/objects. `koa-03-04` (already KEEP, number-free explanation) was
correctly left untouched.

**Independent re-verification (own view formed first, staging read only afterward):**

1. **Widget unchanged.** For all 14 lessons, `remedials[0].check.widget` was structurally compared
   (`json.dumps(..., sort_keys=True)`) against the exact widget objects captured during the original
   S316-V2 pass — byte-identical in every case. `git diff HEAD` for each file shows exactly one
   hunk, confined to the `remedials[0].check` subtree (`explanationVariants` + the pre-existing
   KOA-R widget change, both against the `HEAD` baseline); nothing outside that subtree changed.
   `remedials[0].concept.body` spot-checked byte-identical for the four lessons (`koa-01-01`,
   `koa-03-07`, `koa-03-08`, `koa-03-09`) for which this report holds a full prior snapshot.
2. **New `explanationVariants` re-derived as literally true, independently.** Read each lesson's
   current `widget.prompt` / `widget.answer` (or MCQ correct option) and each new
   `explanationVariants` string side by side; all 28 strings (14 lessons × 2) are literally true of
   the numbers and nouns actually on screen, including the noun fix on `koa-03-05` (stale "2 cats"
   → "1 counter", matching the widget, which never mentions cats). All 28 strings are ≥25 characters
   (38–54, no length failures) and none opens with the `NEGATION` regex
   (`^(no|not|wrong|incorrect|sorry|try again|nope)\b`).
3. **R1–R6 and the KOA-R deviations still hold**, unaffected because the widget itself did not
   change: R1 (prompt≠k1), R2 (normalized-distinct from every widget-bearing step), R3 (payload≠k1),
   R4 (generator non-producibility), R5 (traps recomputed/true/distinct, feedback ≥25 chars, no
   negation), R6 (no answer-on-screen). The `koa-03-07` reveal-adjacency deviation and the
   `koa-03-08`/`koa-03-09` fixed-structural-constant deviation (both affirmed sound in the body of
   this report) are unaffected — `koa-03-07`'s new explanation ("...leaves 1") correctly reflects
   the same deviation-sound `(a=3, b=2)` pair and introduces no new collision with
   `remedials[0].concept.body`'s digits.
4. **`reviewBasisHash` cross-check.** `node scripts/session/print-review-basis.mjs` for all 14
   lessons returns hashes that match `laneA-residuals-2.jsonl`'s `reviewBasisHash` exactly,
   confirming no further edits landed after the residual fix and before this re-verification.

**No discrepancy found** between the coordinator's fix report/staging claims and this independent
re-derivation.

**Fresh dispositions signed:** `reports/closure/cowork-staging/laneAV3-koa-dispositions.jsonl` (14
records, `recordId` `S316-V3-<lessonId>`, decision **KEEP** for all 14). **These 14 records
supersede the corresponding `S316-V2-<lessonId>` REVISE records above** — `koa-01-01`, `koa-01-02`,
`koa-01-03`, `koa-01-04`, `koa-01-05`, `koa-03-01`, `koa-03-02`, `koa-03-03`, `koa-03-05`,
`koa-03-06`, `koa-03-07`, `koa-03-08`, `koa-03-09`, `koa-03-10` are now KEEP. `koa-03-04` (already
KEEP, untouched by this fix) and all 28 `add-within-100-g1`/`properties-strategies-g1` KEEP records
are unaffected and stand as originally signed.

**Updated cumulative verdict for the 43-lesson batch:** KEEP 43, REVISE 0, ESCALATE 0.

No residual remains from the `explanationVariants` staleness class in this batch. The pre-existing,
non-gating `remedials[0].concept.body === c2.body` residual (5/15 in the koa redispatch scope,
0/28 in g1a+g1p) is unchanged and still recorded for a human, not fixed. Per instruction,
`npm`/`vitest`/`tsc` and the build were **not** run in this re-verification pass either; no packet
in this batch may be declared landed on the strength of this report alone.
