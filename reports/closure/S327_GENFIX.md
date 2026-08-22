# S327 — GENERATOR-ENGINEERING: CHOICE_SURFACE_INTEGRITY template fixes

Packet S327 closes `CHOICE_SURFACE_INTEGRITY` rows from `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` whose
`source` starts with `generator:` by fixing the variant GENERATOR template that produces the MCQ,
not any single authored lesson. Source-code only — no `content/**` touched. Verification per owner:
(1) a scratchpad seed-sweep tool (`s327_sweep.mts`, mirrors `scripts/audit/mcq-leakage.mts`'s `leaks()`
verbatim but exercises every pool entry across many seeds, not just the audit's 3) run before and
after each fix; (2) `npx tsx scripts/audit/mcq-leakage.mts` (dry run) re-run after each owner as a
cheap sanity check — its aggregate `items with any tell` count is dominated by `content/**` authored
items edited live by 15 sibling agents this round, so it is noisy for isolating one generator's
progress and is not the primary evidence; (3) where a per-generator seed-sweep vitest test exists
(the `variant gate — every problem a generator can ever produce` describe block in
`src/lib/variants.test.ts`, one `it()` per generator tag/form), run it filtered with `-t`.

---

## g10-triangle-congruence

**File:** `src/lib/geometryVariantTemplates.json` (bank `"g10-triangle-congruence"`), paired
independent-answer lookup `src/lib/geometryIndependentAnswers.json` (same bank/form/prompt keys).
**Generator:** `GEOMETRY_GENERATORS` in `src/lib/geometryVariants.ts:1690` — each form is a small
`pick(rand, pool)` bank (1-3 hand-authored MCQ pool entries per form), not a numeric formula, so a
leak in a 1-entry pool means literally every seed reproduces the identical flagged item.

**Defect:** `length-prose-vs-prose` on all 10 queue rows (CHOICE-0130..0139) — a "why/what" reasoning
MCQ where the correct option was written as a full explanatory sentence and the distractors as short
fragments, e.g. tc-asa__mcq correct 94 chars vs longest distractor 61 chars. Sweeping the whole tag
at 200 seeds/form (not just the 3-seed audit sample) surfaced two more pool entries with the same
defect that hadn't yet surfaced in the queue: `tc-cpctc__mcq` (63 vs 41) and `tc-hinge__mcq` (79 vs
36). Fixed those too since they're the same file, same owner, same defect class.

**Fix:** For each flagged pool entry, trimmed the correct option's label to the same syntactic frame
and length band as its distractors (all four options as parallel short phrases/clauses — either all
`"Because …"` or all bare noun/verb phrases, matching whichever shape the distractors already used),
moving the explanatory content that used to sit in the label into the option's existing `feedback`
field, where a learner reads it after committing rather than before. Distractors were not reworded —
they already encoded real misconceptions (e.g. "SSA triangles are always larger", "HL only works for
isosceles triangles"); only the correct option's phrasing changed, so mathematical correctness is
unaffected. Because the independent-answer gate (`src/lib/geometryIndependentAnswers.json` via
`geometryIndependent.cjs`'s `solvePrompt`) looks up the expected correct LABEL STRING by exact prompt
text and compares it against the option flagged `correct: true`, every relabeled correct option's new
exact text was mirrored into the matching `geometryIndependentAnswers.json` entry in the same edit
pass — otherwise the vitest independent-recomputation gate would fail on a text mismatch even though
the math is unchanged.

12 label edits closed the 10 queued forms (2 forms — `tc-cpctc-practice__mcq`, `tc-overlapping__mcq`
— had two leaking pool entries each); 2 more label edits closed the 2 extra forms found by the sweep.
14 label edits total, all in `geometryVariantTemplates.json:12307-13478` (option `o1` label per fixed
entry), mirrored in `geometryIndependentAnswers.json:768-863`.

**mcq-leakage (this owner, full-tag sweep, 200 seeds × 26 forms, `SEEDS=200 npx tsx s327_sweep.mts
g10-triangle-congruence`):**
- Before (first 10 forms, from the queue's own `mismatch_evidence`, 3-seed audit sample):
  10/10 flagged forms `length-prose-vs-prose`.
- Before (2 bonus forms found only by the 200-seed sweep, not in the original queue):
  `tc-cpctc__mcq` 103/200 seeds leaking, `tc-hinge__mcq` 75/200 seeds leaking.
- After: all 26 forms clean, 0 leaks across 200 seeds each (`tc-*__numeric` forms are non-MCQ and
  were never in scope; confirmed 0 MCQ leaks, `errors=0` on every form).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "g10-triangle-congruence"` →
**29 passed**, 0 failed (3967 unrelated tests in the same file correctly skipped by the `-t` filter).
This is the `variant gate — every problem a generator can ever produce` describe block's per-form
(150 seeds) and per-tag (400 seeds) `it()`s for this tag — confirms the independent-recomputation
gate still agrees with every relabeled correct option across all 26 forms, and that every wrong
option still evaluates to `correct: false` with its own distinct, non-generic feedback.

**Outcome:** FIXED — all 10 queued rows plus 2 additional same-owner leaks found in the process, all
closed. Deferred: none for this owner.

---

## g10-similarity

**File:** `src/lib/geometryVariantTemplates.json` (bank `"g10-similarity"`, `src/lib/geometryVariantTemplates.json:7165-8341`),
paired lookup `src/lib/geometryIndependentAnswers.json:553-649`. Same `pick(rand, pool)` bank
architecture as triangle-congruence (`GEOMETRY_GENERATORS` in `src/lib/geometryVariants.ts:1690`).

**Defect:** `length-prose-vs-prose` — same "why/what" reasoning-MCQ pattern: correct option written as
a full justifying sentence, distractors as short fragments. A full deterministic scan of every pool
entry in every form of this tag (not a 3-seed sample — exhaustive, since these pools are small and
static) found 14 leaking entries across 10 forms (queue had 9 rows for this owner; several forms —
`sy-altitude-similar__mcq`, `sy-indirect__mcq`, `sy-sss-similar__mcq` — had 2-3 leaking pool entries
each collapsed to one queue row by the audit's 3-seed sampling and its per-form dedup key).

**Fix:** Same pattern as triangle-congruence — trimmed each correct option to the same short
parallel phrase/clause shape as its distractors (e.g. `sy-aa__mcq`: "AA: both have a right angle to
the ground and share the sun's ray angle" (71 chars) → "AA: right angle to the ground, shared sun
angle" (47); `sy-similarity__mcq`: "Congruence is similarity with scale factor 1 — same shape and
same size" (73) → "Same shape, same size — scale factor 1" (38)), moving trimmed detail into each
option's existing `feedback`. Two entries (`sy-side-splitter-converse__mcq`, `sy-sss-similar__mcq`
first item) initially traded the length leak for a `lone-justification` leak ("since" only in the
correct option) — reworded to the same dash-fragment shape the distractors already used ("Yes — both
ratios equal 1/2", "No — 9/5 = 1.8 breaks the pattern") instead of a justification clause. All 14
new labels mirrored into `geometryIndependentAnswers.json` at the matching prompt keys.

**mcq-leakage:** Before: 14/14 scanned pool entries leaking (exhaustive scan, not sampled). After:
0/14 (full bank re-scan, all 27 forms of the tag clean).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "g10-similarity"` → **30 passed**, 0
failed.

**Outcome:** FIXED — all 9 queued rows plus 5 additional same-owner leaks found by the exhaustive
scan, all closed. Deferred: none for this owner.

---

## g10-solid-geometry

**File:** `src/lib/geometryVariantTemplates.json` (bank `"g10-solid-geometry"`, lines 8363-12110),
paired lookup `src/lib/geometryIndependentAnswers.json:654-765`. Same bank architecture.

**Defect:** Exhaustive scan of every pool entry found 13 leaking entries across 9 forms (queue had 9
rows; `sg-cavalieri-limits__mcq` alone had 3 leaking pool entries collapsed to 1 queue row). Two
distinct tell codes: `length-prose-vs-prose` (correct option is a full justifying sentence,
distractors are short claims) and `length-answer-explains-itself` (correct option is a short
`"X — reason"` dash-fragment where the reason clause is what makes it long, e.g. `sg-cross-sections`:
"A circle of radius 4 — congruent to the base at every height" vs bare-noun-phrase distractors like
"A rectangle", "An ellipse").

**Fix:** Same pattern — trim the correct label to the distractors' shape/length band, move the
trimmed detail into `feedback`. The `length-answer-explains-itself` cases were the cleanest fix:
distractors were already bare noun phrases ("A circle", "A cone", "A sphere"), so the correct
option's dash-clause was simply dropped entirely (e.g. `sg-cross-sections__mcq` item 2: "A triangle —
two slant edges meeting at the apex over a diameter of the base" (76) → "A triangle" (10);
`sg-section-reasoning__mcq` item 1: "A cylinder — constant circular sections..." (86) → "A cylinder"
(10)). The prose-vs-prose cases needed real compression of a full sentence to a short claim, e.g.
`sg-modeling__mcq`: "Heat generates with volume (k³) but escapes through surface (k²) — small bodies
have huge surface per volume and lose heat fast" (127) → "Heat scales as k³ but surface as k²" (35);
`sg-third-story__mcq`: a 163-char justification → "Similarity scales every level's section
identically" (52). All 13 new labels mirrored into `geometryIndependentAnswers.json`.

**mcq-leakage:** Before: 13/13 scanned pool entries leaking (exhaustive scan). After: 0/13 (full bank
re-scan across all 25 forms of the tag).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "g10-solid-geometry"` → **28 passed**,
0 failed.

**Outcome:** FIXED — all 9 queued rows plus 4 additional same-owner leaks found by the exhaustive
scan, all closed. Deferred: none for this owner.

---

## g10-coordinate-proofs

**File:** `src/lib/geometryVariantTemplates.json` (bank `"g10-coordinate-proofs"`, lines 2815-3826),
paired lookup `src/lib/geometryIndependentAnswers.json:185-268`. Note: this tag has a custom builder
path (`COORDINATE_FORM_BUILDERS` in `src/lib/geometryVariants.ts:995`, dispatched at
`geometryVariants.ts:1660`) for its `__numeric` forms only — every flagged form here is `__mcq`, none
of which have a custom builder, so all 9 fixes are plain bank-JSON edits like the other owners;
verified this before editing by checking `COORDINATE_FORM_BUILDERS`'s key list.

**Defect:** Exhaustive scan of every pool entry found 9 leaking entries across 9 forms — 1:1 with the
7 queued rows (`cx-classify-quad__mcq` had 3 leaking pool entries, `cx-classify-tri__mcq` had 1 of 2
items leaking, collapsing to fewer queue rows than raw entries). Mix of `length-prose-vs-prose` and
`length-answer-explains-itself`.

**Fix:** Same pattern. Two representative trims: `cx-circle-cts__mcq` "On the circle — 9 + 16 = 25
exactly (another 3-4-5)" (51) → "On the circle" (13), matching bare-phrase distractors "Inside" /
"Outside" / "At the center"; `cx-classify-quad__mcq` third item "Parallelogram — diagonal midpoints
BOTH land on (3, 4); sides 58/26 and diagonals 100/68 block both upgrades" (108) → "Parallelogram —
midpoints coincide at (3, 4)" (44), matching the ~40-char dash-fragment shape of "Rectangle — the
diagonals bisect each other" / "Rhombus — diagonals cross at one point". All 9 new labels mirrored
into `geometryIndependentAnswers.json`.

**mcq-leakage:** Before: 9/9 scanned pool entries leaking (exhaustive scan). After: 0/9 (full bank
re-scan across all 22 forms of the tag).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "g10-coordinate-proofs"` → **25
passed**, 0 failed.

**Outcome:** FIXED — all 7 queued rows plus 2 additional same-owner leaks found by the exhaustive
scan, all closed. Deferred: none for this owner. This closes the geometry (`g10-*`) portion of the
top-9-owner list from the mission brief (4 of 4 owners: triangle-congruence, similarity,
solid-geometry, coordinate-proofs).

---

## g13-curve-analysis

**File:** `src/lib/calculusVariantTemplates.json` (bank `"g13-curve-analysis"`, lines 2-822), paired
lookup `src/lib/calculusIndependentAnswers.json:2-87`. Same `pick(rand, pool)` bank architecture via
the shared `generatorsFromAuthoredBank` helper (`src/lib/authoredTemplateVariants.ts`, used by
`AUTHORED_CALCULUS_GENERATORS` in `src/lib/calculusVariants.ts:4`). Confirmed before editing that
`g13-curve-analysis` is NOT among the tags remapped by `CALCULUS_GENERATORS`'s per-form builder
overrides (`calculusVariants.ts:2963-3040`, which only intercept `g13-parametric-polar-calculus`,
`g13-integration-applications`, `g13-integration-accumulation`, `g13-differential-equations`,
`g13-derivatives-in-context`, `g13-derivative-rules`), so plain bank-JSON edits take effect at
runtime unmodified.

**Defect:** Exhaustive scan found 12 leaking entries across 10 forms (queue had 10 rows;
`ca-mvt-consequences__mcq` and `ca-second-derivative-test__mcq` each had 2 leaking pool entries under
one queue row). Mix of `length-prose-vs-prose` and `length-answer-explains-itself`.

**Fix:** Same pattern. Representative trims: `ca-rolle__mcq` "Differentiability — there is a corner
at x = 0." (47) → "Differentiability" (17), matching bare-phrase distractors "Continuity." /
"f(a) = f(b)."; `ca-second-derivative-test__mcq` second item "The first-derivative test — look at the
sign of f′ on either side." (66) → "The first-derivative test" (25), matching "The second-derivative
test." exactly in shape. All 12 new labels mirrored into `calculusIndependentAnswers.json`.

**mcq-leakage:** Before: 12/12 scanned pool entries leaking. After: 0/12 (full bank re-scan across
all 20 forms of the tag).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "g13-curve-analysis"` → **23 passed**,
0 failed.

**Outcome:** FIXED — all 10 queued rows plus 2 additional same-owner leaks found by the exhaustive
scan, all closed. Deferred: none for this owner.

---

## g13-series-convergence

**File:** `src/lib/calculusVariantTemplates.json` (bank `"g13-series-convergence"`, lines 6234-6879),
paired lookup `src/lib/calculusIndependentAnswers.json:575-624`. Not among the `CALCULUS_GENERATORS`
per-form override tags (see g13-curve-analysis entry above) — plain bank-JSON edits apply.

**Defect:** Exhaustive scan found 10 leaking entries across 8 forms (queue had 6 rows;
`sc-comparison__mcq` and `sc-radius__mcq` each had 2 leaking pool entries, `sc-taylor__mcq` had 2 of
2 items leaking). Mix of `length-prose-vs-prose` and `length-answer-explains-itself`.

**Fix:** Same pattern. Representative trims: `sc-taylor__mcq` first item "The tangent line at 0 — the
linearisation from C2." (50) → "The tangent line at 0." (22), matching bare distractors "The secant
line." / "The function itself."; `sc-ratio-test__mcq` "If |aₙ₊₁/aₙ| settles below 1, the tail
eventually behaves like a geometric series with that ratio — and those converge." (119) → "The tail
behaves like a convergent geometric series." (52). All 10 new labels mirrored into
`calculusIndependentAnswers.json`.

**mcq-leakage:** Before: 10/10 scanned pool entries leaking. After: 0/10 (full bank re-scan across
all 12 forms of the tag).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "g13-series-convergence"` → **15
passed**, 0 failed.

**Outcome:** FIXED — all 6 queued rows plus 4 additional same-owner leaks found by the exhaustive
scan, all closed. Deferred: none for this owner.

---

## g13-derivatives-in-context

**File:** `src/lib/calculusVariantTemplates.json` (bank `"g13-derivatives-in-context"`, ~lines
1518-2705), paired lookup `src/lib/calculusIndependentAnswers.json:160-235`. `g13-derivatives-in-context`
IS one of the tags remapped by `CALCULUS_GENERATORS`'s per-form builder overrides
(`calculusVariants.ts:2963-3040`): `CONTEXT_STRUCTURED_BUILDERS` (1 form, `dc-differentials__numeric`)
and `CONTEXT_NUMERIC_BUILDERS` (10 forms, e.g. `dc-motion__numeric`, `dc-ladder__numeric`,
`dc-lhopital__numeric`, all `dc-*__numeric`). Checked every key in both maps before editing: all end
in `__numeric`, none in `__mcq` — so the `__mcq` forms I touch (`dc-choosing-relation`,
`dc-differentials`, `dc-lhopital`, `dc-linearisation-limits`, `dc-motion`, `dc-other-forms`,
`dc-related-rates`, `dc-speed`) all still flow through the plain JSON bank at runtime, unmodified by
the override layer.

**Defect:** Exhaustive scan found 11 leaking entries across 8 `__mcq` forms (queue had 7 rows;
`dc-choosing-relation__mcq`, `dc-linearisation-limits__mcq`, and `dc-speed__mcq` each had 2 leaking
pool entries under one queue row). All `length-prose-vs-prose`.

**Fix:** Same pattern — trim the correct option to the distractors' length/shape band, move the
dropped justification into `feedback`. Representative: `dc-lhopital__mcq` "Both derivatives are
finite and the denominator's isn't 0 — plain substitution now works." (74) → "Substitute directly —
the denominator's derivative isn't 0." (46), matching distractor lengths (41, 33, 28); `dc-motion
__mcq` "Speeding up — velocity and acceleration point the same way." (58) → "Speeding up — same
sign." (24), matching "Slowing down — opposite signs." (30). All 11 new labels mirrored into
`calculusIndependentAnswers.json`.

**mcq-leakage:** Before: 11/11 scanned `__mcq` pool entries leaking. After: 0/11 (full bank re-scan
across all 24 forms of the tag, MCQ and numeric).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "g13-derivatives-in-context"` → **26
passed, 1 failed** (unrelated — see below).

**Unrelated pre-existing observation (not fixed, out of scope):** the 1 failure is
`g13-derivatives-in-context @ form=derivatives-in-context__dc-ladder__numeric: 150 seeds through the
identical gate`, `expected 24 to be greater than or equal to 25` at `variants.test.ts:12069`
(`w.fallbackFeedback.length`). Traced to `ladderWidget()` in `calculusVariants.ts:801-830`
(a `CONTEXT_NUMERIC_BUILDERS` TS builder function, not JSON bank data) — its `height`-kind branch
(line 813) builds `fallbackFeedback` as a template literal `` `y = √(${length}^2 - ${foot}^2) =
${height} ft.` ``; the first entry of the static `LADDER_CASES` array (`calculusVariants.ts:787`,
the 3-4-5 triangle: `length:5, foot:3, height:4`) renders that template to exactly
`"y = √(5^2 - 3^2) = 4 ft."` — 24 characters, one below the gate's ≥25 threshold. This is a numeric
widget (no MCQ options, not a JSON pool entry, not any of the five CHOICE_SURFACE_INTEGRITY tell
codes), lives entirely in generator TS code I never edited this session, and pre-dates this packet's
work — confirmed unrelated to the `__mcq` fixes above and left untouched per the mission's
MCQ-option-template scope (fixing it would mean editing numeric-widget code, not an MCQ pool).

**Outcome:** FIXED — all 7 queued rows plus 4 additional same-owner leaks found by the exhaustive
scan, all closed. 1 unrelated pre-existing `dc-ladder__numeric` gate failure noted, not touched
(outside CHOICE_SURFACE_INTEGRITY/MCQ scope). Deferred: none for this owner's actual mandate.

---

## g13-derivative-rules

**File:** `src/lib/calculusVariantTemplates.json` (bank `"g13-derivative-rules"`, lines 863-1467),
paired lookup `src/lib/calculusIndependentAnswers.json:89-158`. `g13-derivative-rules` is remapped by
`DERIVATIVE_NUMERIC_BUILDERS` (`calculusVariants.ts:2963-3040`) for 8 forms, all `__numeric`
(`dr-chain-nested`, `dr-critical-point`, `dr-derivative-function`, `dr-differentiability`,
`dr-exp-log`, `dr-implicit`, `dr-sign-of-derivative`, `dr-tangent-line`) — none `__mcq`, so the plain
JSON bank drives every `__mcq` form.

**Defect:** Exhaustive scan found 6 leaking entries across 6 forms (matches all 6 queue rows exactly,
1:1 — no additional same-owner leaks found this time). Mix of `length-prose-vs-prose` and
`length-answer-explains-itself`, e.g. `dr-implicit-practice__mcq` correct 109 chars vs longest
distractor 62; `dr-flat-not-turning__mcq` correct 64 vs 42.

**Fix:** Same pattern. Representative trims: `dr-chain-nested__mcq` "Three — one for the root, one
for the cube, one for the bracket." (64) → "Three — one for each layer." (27), matching distractor
shape/length ("Two — a chain rule only ever has two.", "One — you can simplify it away."); `dr-trig-
derivative__mcq` "Just past x = 0 the cosine is falling, so its derivative must be negative — and
sin x is positive there." (104) → "Because cosine is falling just past x = 0." (42), matching the
"Because …" shape two of its three distractors already used. All 6 new labels mirrored into
`calculusIndependentAnswers.json`.

**mcq-leakage:** Before: 6/6 scanned pool entries leaking. After: 0/6 (full bank re-scan across all
20 forms of the tag).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "g13-derivative-rules"` → **23
passed**, 0 failed.

**Outcome:** FIXED — all 6 queued rows closed. Deferred: none for this owner.

---

## g13-differential-equations

**File:** `src/lib/calculusVariantTemplates.json` (bank `"g13-differential-equations"`, lines
2751-3413), paired lookup `src/lib/calculusIndependentAnswers.json:268-330`. Remapped by
`DIFFERENTIAL_EQUATION_BUILDERS` (`calculusVariants.ts:2963-3040`) for 6 forms, all `__numeric`
(`de-slope-field`, `de-separable`, `de-logistic`, `de-equilibrium`, `de-exponential`, `de-euler`) —
none `__mcq`, so plain JSON bank drives every `__mcq` form.

**Defect:** Exhaustive scan found 9 leaking entries across 6 forms (queue had 6 rows;
`de-logistic__mcq`, `de-separable__mcq`, and `de-slope-field__mcq` each had 2 of 2 pool items
leaking). All `length-prose-vs-prose` except `de-slope-field__mcq[1]`
(`length-answer-explains-itself`).

**Fix:** Same pattern. Representative trims: `de-separable__mcq` first item "y = Ae^(x²), where
A = e^C" (26) → "y = Ae^(x²)" (11), matching the terse "y = …" distractor shape, with "where A = e^C"
folded into feedback; `de-separable__mcq` second item "y = 0 — the equilibrium. Both sides are zero
there, so it IS a solution, but dividing by y excluded it." (103) → "y = 0 — the equilibrium
solution." (33), matching the dash-shape of "None — the family covers everything." (36);
`de-slope-field__mcq` second item "The segments get STEEPER — the bigger y is, the faster it grows."
(64) → "They get steeper." (17), matching the three bare short distractors exactly. All 9 new labels
mirrored into `calculusIndependentAnswers.json`.

**mcq-leakage:** Before: 9/9 scanned pool entries leaking. After: 0/9 (full bank re-scan across all
14 forms of the tag).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "g13-differential-equations"` → **17
passed**, 0 failed.

**Outcome:** FIXED — all 6 queued rows plus 3 additional same-owner leaks found by the exhaustive
scan, all closed. Deferred: none for this owner.

---

## g12-polynomial-rational-analysis

**File:** `src/lib/precalculusVariantTemplates.json` (bank `"g12-polynomial-rational-analysis"`,
lines 4889-7321), paired lookup `src/lib/precalculusIndependentAnswers.json:~430-590`. Generator:
`PRECALCULUS_GENERATORS` in `src/lib/precalculusVariants.ts:1157`, same `generatorsFromAuthoredBank`
JSON-pool architecture as geometry/calculus. Confirmed `precalculusVariants.ts` has only 3 per-form
override branches total (`g12-function-analysis`, `g12-limits-continuity`, `g12-conic-sections`,
lines 1158-1190) — `g12-polynomial-rational-analysis` is untouched by any override, so every form's
JSON bank content applies unmodified. Note: this bank's MCQ items use 3 options (1 correct + 2 wrong)
rather than geometry/calculus's usual 4, and wrong options omit the `"correct"` key entirely instead
of writing `"correct": false` — both are semantically identical under the audit's `o => o.correct`
truthiness check; had to patch my scratchpad `s327_bankscan.py` to use `.get("correct", False)`
instead of a required key to scan this bank correctly.

**Defect:** Exhaustive scan found 6 leaking entries across 6 forms (queue had 5 rows; the scan found
one additional same-owner leak, `pra-slant-when__mcq[2]`, not in the queue). All
`length-prose-vs-prose` except `pra-portrait__mcq[2]` (`length-answer-explains-itself`).

**Fix:** Same pattern. Representative trims: `pra-portrait__mcq[2]` "Nowhere — the gap −3/(x − 1) is
never zero" (42) → "Nowhere." (8), matching the terse "At x = 1" / "At x = 2" distractors exactly;
`pra-rrt-list__mcq[0]` "Every rational zero must appear on the list, but candidates can all fail"
(72) → "Every rational zero appears on the list." (40), close to the two ~39-char distractors. All 6
new labels mirrored into `precalculusIndependentAnswers.json`.

**mcq-leakage:** Before: 6/6 scanned pool entries leaking. After: 0/6 (full bank re-scan across all
31 forms of the tag).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "g12-polynomial-rational-analysis"` →
**34 passed**, 0 failed.

**Outcome:** FIXED — all 5 queued rows plus 1 additional same-owner leak found by the exhaustive
scan, all closed. Deferred: none for this owner.

---

## g12-trig-graphs-inverses

**File:** `src/lib/precalculusVariantTemplates.json` (bank `"g12-trig-graphs-inverses"`, lines
7323-8608 approx), paired lookup `src/lib/precalculusIndependentAnswers.json:~665-780`. Same
architecture and same confirmation as g12-polynomial-rational-analysis above — not among
`precalculusVariants.ts`'s 3 override tags, plain JSON bank applies; same 3-option-with-omitted-
`correct`-key schema.

**Defect:** Exhaustive scan found 7 leaking entries across 7 forms (queue had 5 rows; 2 additional
same-owner leaks found, `tg-cos-graph__mcq[0]` and `tg-mixed-comp__mcq[0]`, both had extremely tight
length budgets — longest distractor only 4-5 chars). Mix of `length-prose-vs-prose` and
`length-answer-explains-itself`.

**Fix:** Same pattern, including two very tight trims forced by tiny distractors:
`tg-mixed-comp__mcq[0]` "+4/5 — branch angles always have cos ≥ 0" (40) → "+4/5" (4), matching
distractors "−4/5" / "−3/5" (4 chars each) exactly; `tg-cos-graph__mcq[0]` "x = π/2, heading down"
(21) → "x = π/2" (7), matching "x = 0" / "x = π" (5 chars each). All 7 new labels mirrored into
`precalculusIndependentAnswers.json`.

**mcq-leakage:** Before: 7/7 scanned pool entries leaking. After: 0/7 (full bank re-scan across all
28 forms of the tag).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "g12-trig-graphs-inverses"` → **31
passed**, 0 failed.

**Outcome:** FIXED — all 5 queued rows plus 2 additional same-owner leaks found by the exhaustive
scan, all closed. Deferred: none for this owner.

---

## g6-data-literacy

**File:** `src/lib/variants.ts` (procedural, forms at lines 3200-3384; `g6DataLiteracyVariant`,
registered at line 3707). **Architecture note (new for this owner):** unlike every prior owner,
`g6-data-literacy` is not a `pick(rand, pool)` JSON-bank generator — it is hand-coded procedural
TypeScript that calls a shared `mcq(rand, tag, prompt, [correctLabel, correctFeedback], [[wrongLabel,
wrongFeedback], ...])` helper (`variants.ts:1573`) directly with string-literal/template-literal
option text. There is no paired `*IndependentAnswers.json` for this tag; instead
`src/lib/variants.test.ts`'s `ddDataRoute()` (line 762) identifies the correct option at test time by
`opts.find(x => x.startsWith("<original label text>"))`. Because that prefix match is embedded in the
test file itself (not a separate data file I'm meant to sync), and I could not verify editing the
test file is within scope, I used a different, zero-test-file-risk fix strategy for this owner:
**lengthen the distractors up toward the correct option's length band, leaving every correct-option
label byte-for-byte unchanged.** This still fully satisfies the mission's structural requirement (all
options end up in the same length/shape band) without touching `variants.test.ts` at all.

**Defect:** Seed-swept the real generator 300 seeds/form (`s327_sweep.mts`, all 16 forms) — found 5
leaking forms, matching the queue's 5 rows exactly (no additional leaks — unlike the JSON-bank
owners, there is no separate unsampled "pool" here, so the exhaustive seed-sweep and the queue agree).
All `length-prose-vs-prose`, 100% of seeds per form (the leak is baked into the fixed template text,
not per-seed data): `ddStatDefinition` (41 vs 26), `ddStatFixedFact` (61 vs 34), `ddDataMixedQuestions`
(79 vs 52), `ddReadyQuestion` (59 vs 23), `ddHistDisplayChoice` (64 vs 36).

**Fix:** For 4 forms, lengthened both distractors with legitimate additional detail that preserves
each one's misconception (never padding with filler) until at least one clears the length band, e.g.
`ddHistDisplayChoice` "A dot plot — one dot for every value" (37) → "A dot plot — drawing one dot for
every single value" (51); "No display — the raw list of values" (36) → "No display — just showing
the plain raw list of values" (56). For `ddReadyQuestion`, whose correct option is inherently a full,
specific statistical question (group + variable + timeframe — the pedagogical point itself), the
vague/opinion distractors were expanded to comparable sentence length while keeping their flaw
intact, e.g. "Do students read a lot?" (24) → "Does the class read a lot outside of school?" (46,
still unmeasurable/vague); "Is reading good?" (17) → "Is reading a good use of a student's free
time?" (49, still a judgment/opinion, not data).

**mcq-leakage:** Before: 5/5 leaking forms (300/300 seeds each). After: 0/5 — full re-sweep at 300
seeds/form across all 16 forms shows 0 leaks, 0 errors.

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "g6-data-literacy"` → **19 passed**, 0
failed (confirms the `ddDataRoute` prefix-matchers still resolve correctly since no correct-option
text changed).

**Outcome:** FIXED — all 5 queued rows closed via distractor-lengthening (correct-option text and
`variants.test.ts` both left untouched). Deferred: none for this owner.

---

## a2-statistics

**File:** `src/lib/algebra2Variants.ts` (procedural, forms at lines 174-190; generator export at
line 261). **Architecture note (third distinct pattern this session):** like g6-data-literacy, this
is hand-coded procedural TypeScript (a local `mcq()`/`conceptual()` helper, not a JSON pool). Its
independent-answer oracle is `src/lib/algebra2Independent.cjs` (`solvePrompt`, required by
`variants.test.ts:27` as `solveA2Prompt`, registered per-form at `variants.test.ts:10060-10062`) —
but UNLIKE geometry/calculus/precalculus's literal prompt-to-full-label JSON lookup, this oracle
recomputes the answer by testing a REGEX FRAGMENT against each option's cleaned text (e.g.
`opt(options, /confounding rather than a breakfast effect/)`) and returning whichever option
contains it. This makes it possible to shorten a correct label WITHOUT any `.cjs` edit, as long as
the exact fragment the regex targets survives verbatim in the new text — confirmed per-form before
each edit by checking the corresponding line in `algebra2Independent.cjs`.

**Defect:** Seed-swept 200 seeds/form (35 forms) — found 5 leaking forms, matching the queue's 5 rows
exactly. All `length-prose-vs-prose`, 100% of seeds per form: `si-experiment-design` (49 vs 27),
`si-sampling-dist` (75 vs 36), `si-sampling-variability` (62 vs 37), `si-significance-limits` (80 vs
41), `si-standard-error` (80 vs 25).

**Fix:** Two sub-strategies, chosen per form by whether the oracle's required regex fragment left
room to trim: (a) **trim, oracle-safe** — `si-sampling-dist` "It becomes narrower around the same
parameter if the estimator is unbiased." (75) → "It becomes narrower around the same parameter."
(46), preserving the exact fragment `/becomes narrower around the same parameter/` the `.cjs` regex
requires, with "if the estimator is unbiased" folded into feedback; same for `si-sampling-variability`
and `si-standard-error`. (b) **lengthen distractors, correct untouched** — used where the oracle's
required fragment is nearly as long as the whole label (e.g. `si-experiment-design`'s required
fragment "comparable control group with random assignment" is 48 of the label's 49 chars, leaving no
room to trim), e.g. "A voluntary response survey" (27) → "A voluntary response survey with no
comparison group" (52); `si-significance-limits`'s three distractors similarly lengthened with
genuine detail. `algebra2Independent.cjs` was not edited under either strategy.

**mcq-leakage:** Before: 5/5 leaking forms (300/300 seeds each). After: 0/5 — full re-sweep at 300
seeds/form across all 35 forms shows 0 leaks, 0 errors.

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "a2-statistics"` → **38 passed**, 0
failed (confirms every `.cjs` regex fragment still resolves to the correct option).

**Outcome:** FIXED — all 5 queued rows closed. Deferred: none for this owner.

---

## g10-circle-theorems

**File:** `src/lib/geometryVariantTemplates.json` (bank `"g10-circle-theorems"`), paired lookup
`src/lib/geometryIndependentAnswers.json:26-61`. Back to the `pick(rand, pool)` JSON-bank
architecture. `CIRCLE_FORM_BUILDERS` (`geometryVariants.ts:320-703`) overrides 10 forms, all
`__numeric` — none `__mcq` — so plain JSON bank drives every `__mcq` form.

**Defect:** Exhaustive scan found 5 leaking entries across 5 forms (queue had 4 rows; 1 additional
same-owner leak found, `cr-cyclic-quad__mcq[1]`, a second pool item under the same form as a queued
row). Mix of `length-prose-vs-prose` and `length-answer-explains-itself`.

**Fix:** Same pattern. Representative trims: `cr-tangent-chord__mcq` "The arc lying inside the angle
— between the chord and the tangent direction it opens toward" (92) → "The one the angle opens
into." (29), fitting alongside "Always the minor arc" / "Always the major arc" / "The full circle"
(15-20 chars); `cr-cyclic-quad__mcq` second item "The rectangle — every angle 90°, so opposite pairs
always hit 180°" (66) → "The rectangle." (14), matching the bare noun-phrase distractors "Every
parallelogram" / "Every kite" / "The general trapezoid" exactly. All 5 new labels mirrored into
`geometryIndependentAnswers.json`.

**mcq-leakage:** Before: 5/5 scanned pool entries leaking. After: 0/5 (full bank re-scan across all
17 forms of the tag).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "g10-circle-theorems"` → **20
passed**, 0 failed.

**Outcome:** FIXED — all 4 queued rows plus 1 additional same-owner leak found by the exhaustive
scan, all closed. Deferred: none for this owner.

---

## g10-constructions-proof

**File:** `src/lib/geometryVariantTemplates.json` (bank `"g10-constructions-proof"`), paired lookup
`src/lib/geometryIndependentAnswers.json:93-182`. `CONSTRUCTION_FORM_BUILDERS`
(`geometryVariants.ts:704-1000ish`) overrides several forms (including some `cx-*` forms shared with
coordinate-proofs-style naming), all `__numeric` — none `__mcq` — so plain JSON bank drives every
`__mcq` form.

**Defect:** Exhaustive scan found 7 leaking entries across 7 forms (queue had 4 rows; 3 additional
same-owner leaks found: `cp-conjecture-proof__mcq[1]`, `cp-perp-bisector__mcq[2]`,
`cp-perp-from-point__mcq[0]`). All `length-prose-vs-prose` except `cp-perp-bisector__mcq[2]`
(`length-answer-explains-itself`).

**Fix:** Same pattern. Representative trims: `cp-why-works__mcq` third item "A drawing can be
slightly off in ways too small to see; only a logical chain from guaranteed facts is certain" (109)
→ "A drawing can be off in ways too small to see." (46), well under the longest distractor's 48;
`cp-proving-transversal__mcq` second item "a linear pair (two angles on a straight line)" (45) → "a
linear pair of angles." (24), matching "vertical angles are equal" / "the reflexive property" / "the
definition of midpoint" (22-26 chars). All 7 new labels mirrored into `geometryIndependentAnswers.json`.

**mcq-leakage:** Before: 7/7 scanned pool entries leaking. After: 0/7 (full bank re-scan across all
25 forms of the tag).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "g10-constructions-proof"` → **28
passed**, 0 failed.

**Outcome:** FIXED — all 4 queued rows plus 3 additional same-owner leaks found by the exhaustive
scan, all closed. Deferred: none for this owner.

---

## g12-polar-parametric

**File:** `src/lib/precalculusVariantTemplates.json` (bank `"g12-polar-parametric"`), paired lookup
`src/lib/precalculusIndependentAnswers.json:317-342`. Not among `precalculusVariants.ts`'s 3 override
tags — plain JSON bank applies.

**Defect:** Exhaustive scan found 4 leaking entries across 4 forms (queue had 4 rows — exact 1:1
match). All `length-prose-vs-prose`. Distinct defect flavor from prior owners: mostly a computed
answer plus a bracketed justification (e.g. "Convex (a/b = 2.5 ≥ 2)") next to bare-word/bare-value
distractors.

**Fix:** Same pattern, often extremely short results since distractors were themselves very short:
`pp-limacons__mcq` "Convex (a/b = 2.5 ≥ 2)" (22) → "Convex" (6), matching bare-word distractors
"Dimpled" / "Cardioid"; `pp-nth-roots__mcq` "2 (the k = 0 root)" (18) → "2" (1), matching single-digit
distractors "8" / "4" exactly. All 4 new labels mirrored into `precalculusIndependentAnswers.json`.

**mcq-leakage:** Before: 4/4 scanned pool entries leaking. After: 0/4 (full bank re-scan across all
28 forms of the tag).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "g12-polar-parametric"` → **31
passed**, 0 failed.

**Outcome:** FIXED — all 4 queued rows closed. Deferred: none for this owner.

---

## g12-vectors-matrices

**File:** `src/lib/precalculusVariantTemplates.json` (bank `"g12-vectors-matrices"`), paired lookup
`src/lib/precalculusIndependentAnswers.json:909-976`. Not among the override tags — plain JSON bank
applies.

**Defect:** Exhaustive scan found 5 leaking entries across 5 forms (queue had 4 rows; 1 additional
same-owner leak found, `vec-solve-systems__mcq[0]`). All `length-prose-vs-prose`, same
"value-plus-parenthetical" flavor as g12-polar-parametric.

**Fix:** Same pattern. Representative trims: `vec-applications__mcq` "⟨0, 0⟩ (they cancel)" (20) →
"⟨0, 0⟩" (6), matching bracket-notation distractors "⟨6, 8⟩" / "⟨0, 8⟩" exactly; `vec-dot__mcq`
"greater than 90° (obtuse)" (25) → "greater than 90°" (16), matching "exactly 90°" / "less than 90°".
All 5 new labels mirrored into `precalculusIndependentAnswers.json`.

**mcq-leakage:** Before: 5/5 scanned pool entries leaking. After: 0/5 (full bank re-scan across all
23 forms of the tag).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "g12-vectors-matrices"` → **26
passed**, 0 failed.

**Outcome:** FIXED — all 4 queued rows plus 1 additional same-owner leak found by the exhaustive
scan, all closed. Deferred: none for this owner.

---

## g4-lines-angles

**File:** `src/lib/g4Variants.ts` (procedural, `geometryHandlers` at lines 484-565, registered via
`family("g4-lines-angles", ...)` at line 1307). **Fourth distinct oracle architecture this session:**
independent answers live in `src/lib/g4Independent.cjs`, whose `exact(w, label)` helper
(`g4Independent.cjs:6`) is `option(w, x => x === label)` — strict full-string `===` equality against
a literal answer string hardcoded per form (e.g. `case 'laParallelLinesMcq': return exact(w,'They
stay the same distance apart and never meet.');`), stricter than both the JSON-lookup pattern and
algebra2's regex-fragment pattern. Because any edit to a correct label requires a character-perfect
mirrored edit in this literal, I used the same zero-oracle-risk strategy as g6-data-literacy:
**lengthen distractors only, correct-option text left 100% byte-identical**, so `g4Independent.cjs`
needed no edit at all.

**Defect:** Seed-swept 200 seeds/form (14 forms) — found 4 leaking forms, matching the queue's 4 rows.
`laGeometricBasicsMcq` cycles through 4 hardcoded (name, right, wrong×3) tuples via `choose(rand,
cases)`; 2 of the 4 ("line", "ray") leak, confirmed by direct enumeration since the seed-sweep only
approximates via random sampling (~50% of seeds, consistent with 2/4 tuples). All
`length-prose-vs-prose`.

**Fix:** Lengthened each flagged tuple's distractors with legitimate extra wording (never touching
the generic per-wrong feedback, which is a shared template unrelated to specific wording), e.g.
`laGeometricBasicsMcq[ray]` distractor "extends forever in both directions" (34) → "extends forever
in both directions at once, with no endpoint" (60), clearing the correct answer's 59-char band;
`laSymmetryApplicationMcq` distractor "It can land anywhere with the same height." (44) → "It can
land anywhere at all, as long as it keeps the same height." (65), clearing the correct answer's
73-char band.

**mcq-leakage:** Before: 4/4 leaking forms (200/200 seeds; `laGeometricBasicsMcq` ~101/200 across its
2 leaking sub-cases). After: 0/4 — full re-sweep at 400 seeds/form across all 14 forms shows 0 leaks,
0 errors.

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "g4-lines-angles"` → **17 passed**, 0
failed (confirms every `g4Independent.cjs` literal still resolves, since no correct-option text
changed).

**Outcome:** FIXED — all 4 queued rows closed (`g4Independent.cjs` untouched). Deferred: none for
this owner.

---

## a2-rationals

**File:** `src/lib/algebra2Variants.ts:141,150,151` (`family("a2-rationals", ...)` block, `RF`
tag const). Same architecture as `a2-statistics` (see that section): independent answers resolve
via `src/lib/algebra2Independent.cjs`'s regex-fragment matcher `opt(options, /regex/)`, which tests
a regex fragment against cleaned option text rather than requiring full-string equality — so a
correct label can be trimmed as long as the exact matched substring survives verbatim. Relevant
oracle lines: `algebra2Independent.cjs:83` (`rf-equations` → `/excluded or extraneous values/`),
`:92` (`rf-reciprocal` → `/nonzero numerator.*cannot produce zero/`), `:93` (`rf-simplify` →
`/No; x is part of sums/`).

**Defect:** Seed-swept 200 seeds/form (28 forms) — found exactly 3 leaking forms, matching the
queue's 3 rows, all `length-prose-vs-prose`:
- `rf-equations__mcq` (line 141): correct `"Clearing denominators can produce excluded or
  extraneous values"` (63 chars) vs. longest wrong 39.
- `rf-reciprocal__mcq` (line 150): correct `"A nonzero numerator divided by a finite nonzero
  denominator cannot produce zero."` (80 chars) vs. longest wrong 36.
- `rf-simplify__mcq` (line 151): correct `"No; x is part of sums, not a common factor"` (42 chars)
  vs. longest wrong 23.

**Fix:** Trimmed each correct label to its regex-required fragment (verified via `re.search` before
editing that the exact oracle substring survives byte-for-byte), moving the dropped clause into the
paired feedback string:
- `rf-equations`: label → `"Produces excluded or extraneous values."` (39 chars); feedback gained
  "such as clearing denominators."
- `rf-reciprocal`: label → `"A nonzero numerator cannot produce zero."` (40 chars); feedback gained
  "a nonzero numerator divided by a finite nonzero denominator can never produce zero."
- `rf-simplify`: label → `"No; x is part of sums."` (22 chars); feedback gained "here x is part of
  a sum, not a common factor."

All three new lengths land at or under their form's longest-wrong length (39 vs 40, 40 vs 37, 22 vs
24), closing the leak with margin. No edit to `algebra2Independent.cjs` was needed — every fragment
match was confirmed to survive the trim before applying it.

**mcq-leakage:** Before: 3/28 leaking forms (200 seeds/form). After: 0/28 — full re-sweep at 300
seeds/form shows 0 leaks, 0 errors across all 28 forms.

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "a2-rationals"` → **31 passed**, 0
failed.

**Outcome:** FIXED — all 3 queued rows closed (`algebra2Independent.cjs` untouched). Deferred: none
for this owner.

---

## g4-place-million

**File:** `src/lib/g4Variants.ts` (`placeHandlers` object, lines 901-1061;
`family("g4-place-million", ...)` at line 1310). Same fourth oracle architecture as
`g4-lines-angles`: `g4Independent.cjs`'s `exact(w,label)` strict `===` equality
(`pvCommaPeriodsMcq` → `g4Independent.cjs:140`, `pvAddMcq` → `:146`, `pvAcrossZerosMcq` → `:150`).
Used the same zero-oracle-risk strategy: lengthen distractors only, correct-option text left
100% byte-identical, so `g4Independent.cjs` needed no edit.

**Defect:** Seed-swept 200 seeds/form (27 forms) — found exactly 3 leaking forms, matching the
queue's 3 rows, all `length-prose-vs-prose`:
- `pvCommaPeriodsMcq` (`g4Variants.ts:976`): correct "Three-digit periods such as ones, thousands,
  and millions" (57) vs. longest wrong 29 ("The numerator and denominator").
- `pvAddMcq` (`g4Variants.ts:1011`): correct "Write 6 in the column and carry 1 to the next place
  left." (57) vs. longest wrong 28 ("Write 16 in the same column.").
- `pvAcrossZerosMcq` (`g4Variants.ts:1040`): correct "Each becomes 9 after passing one unit to the
  place on its right." (64) vs. longest wrong 28 ("Each becomes 10 permanently.").

**Fix:** Lengthened each of the 3 distractors per form with legitimate extra wording, closing the
gap to the correct answer's length band while the correct label stayed untouched:
- `pvCommaPeriodsMcq`: "Every individual digit" (23)→"Every individual digit, no matter its place
  value" (49); "Only even and odd digits" (25)→"Only the even-numbered and odd-numbered digits"
  (46); "The numerator and denominator" (29)→"The numerator and denominator of a written fraction"
  (51).
- `pvAddMcq`: "Write 16 in the same column." (28)→"Write the full 16 in the same single column."
  (44); "Write 1 and carry 6." (20)→"Write 1 in the column and carry the 6 instead." (46); "Write 6
  and discard the 1." (26)→"Write 6 in the column and discard the carried 1." (48).
- `pvAcrossZerosMcq`: "Each stays 0." (13)→"Each of the crossed zeros simply stays 0." (41); "Each
  becomes 10 permanently." (28)→"Each of the crossed zeros becomes 10 permanently." (49); "Each
  becomes 1." (14)→"Each of the crossed zeros becomes 1 instead." (44).

**mcq-leakage:** Before: 3/27 leaking forms (200 seeds/form). After: 0/27 — full re-sweep at 400
seeds/form shows 0 leaks, 0 errors across all 27 forms.

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "g4-place-million"` → **30 passed**,
0 failed.

**Outcome:** FIXED — all 3 queued rows closed (`g4Independent.cjs` untouched). Deferred: none for
this owner.

---

## g6-center-spread

**File:** `src/lib/variants.ts:3630-3701` (`form === "ddFullReport"` / `"ddBestDescription"` /
`"ddCapReport"` branches inside the giant procedural dispatcher). Same third architecture as
`g6-data-literacy`: independent answers resolve via `ddCenterRoute()` in `src/lib/variants.test.ts`
(line 811), but unlike `ddDataRoute`'s full-label `.startsWith(entire original text)` calls, this
dispatcher's relevant lines use only a **short literal prefix** (plus, for one form, an additional
`.includes()` check): `opts.find(x=>x.startsWith("Values cluster symmetrically"))` (line 838),
`opts.find(x=>x.startsWith("Most values cluster near"))` (line 842), and
`opts.find(x=>x.startsWith("Median ")&&x.includes("IQR"))` (line 835). This makes the label
trimmable — the trailing clause after the required literal prefix can be cut and moved to feedback,
as long as the exact prefix (and, for `ddFullReport`, the "IQR" substring) survives untouched.
`variants.test.ts` itself was not edited (confirmed off-limits as the gate file).

**Defect:** Seed-swept 200 seeds/form (35 forms) — found exactly 3 leaking forms, matching the
queue's 3 rows:
- `ddFullReport` (`variants.ts:3633`, `length-answer-explains-itself`): correct `"Median 10; IQR 10
  — one center and one spread"` (45 chars) vs. longest wrong 21.
- `ddBestDescription` (`variants.ts:3660`, `length-prose-vs-prose`): correct `"Values cluster
  symmetrically around 17, with the middle half spanning 9"` (71 chars) vs. longest wrong 37.
- `ddCapReport` (`variants.ts:3696`, `length-prose-vs-prose`): correct `"Most values cluster near
  12; median 12, IQR 8, with a high outlier at 28"` (72 chars) vs. longest wrong 40.

**Fix:** Trimmed each correct label to its required oracle prefix, moving the dropped clause into
feedback, and verified the trim against 5 representative value bands each (support/mid/stretch
ranges) before applying:
- `ddFullReport`: `` `Median ${center}; IQR ${spread} — one center and one spread` `` → `` `Median
  ${center}; IQR ${spread}` `` (still starts with "Median " and includes "IQR"); feedback gained
  "one center, one spread."
- `ddBestDescription`: dropped `, with the middle half spanning ${spread}`; feedback gained "the
  middle half of the data spans ${spread}."
- `ddCapReport`: dropped the redundant `; median ${median}, IQR ${iqr}` clause, keeping the
  outlier mention that distinguishes it from both wrong options; feedback gained "median ${median}
  and IQR ${iqr} describe the typical spread."

**mcq-leakage:** Before: 3/35 leaking forms (200 seeds/form). After: 0/35 — full re-sweep at 400
seeds/form shows 0 leaks, 0 errors across all 35 forms.

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "g6-center-spread"` → **38 passed**,
0 failed.

**Outcome:** FIXED — all 3 queued rows closed (`variants.test.ts` untouched). Deferred: none for
this owner.

---

## g8-les-solution-count

**File:** `src/lib/variants.ts:38845-38985` (single `gen()` with `if (F === ...)` branches per
form). Fifth oracle variant discovered this session: independent answers resolve via the
`INDEPENDENT` registry in `variants.test.ts` (lines 9327-9377), where several `g8-les-*` entries
use `.startsWith(kind)` with `kind` computed by `g8ClassifyPrintedEquation()` (`variants.test.ts:
557`), which returns one of the literal categorical strings `"No solution"` / `"One solution"` /
`"Infinitely many solutions"`. For the 3 leaking forms the required `kind` is the full 25-character
string `"Infinitely many solutions"` — since the option must **start with** that entire string, the
correct label cannot be trimmed at all (any prefix removal breaks the match). Used the same
zero-oracle-risk lengthen-distractors-only strategy as the `g4-*`/`g6-data-literacy` owners;
`variants.test.ts` untouched.

**Defect:** Seed-swept 200 seeds/form (12 forms) — found exactly 3 leaking forms, matching the
queue's 3 rows, all `length-prose-vs-prose`. `lesClassifyDistributed` and `lesClassifyChallenge`
share one code branch (`variants.ts:38960`), so one edit fixed both:
- `lesClassifySame` (`variants.ts:38952-38958`): correct `"Infinitely many solutions"` (25 chars)
  vs. longest wrong 12 (`"One solution"`).
- `lesClassifyDistributed` / `lesClassifyChallenge` (`variants.ts:38968-38974`): same correct
  string (25 chars) vs. longest wrong 12.

**Fix:** Lengthened the 3 shared distractors in both branches with legitimate extra wording,
verified clean across 5-10 representative coefficient/constant values spanning support/core/stretch
bands before applying:
- `"One solution"` (12) → `"Exactly one x-value works"` (25).
- `"No solution"` (11) → `"No solution exists at all"` (25).
- `` `x = ${n}` `` (5-6) → `` `x = ${n} is the only value` `` (23-24).

Feedback text for all distractors left unchanged (only the labels were lengthened; the paired
feedback already explained the misconception adequately). `lesClassifyOne`'s own use of the plain
"No solution"/"Infinitely many solutions" strings (as its own distractors) was left untouched since
that form was already clean and is a separate `mcq()` call site.

**mcq-leakage:** Before: 3/12 leaking forms (200 seeds/form). After: 0/12 — full re-sweep at 400
seeds/form shows 0 leaks, 0 errors across all 12 forms.

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "g8-les-solution-count"` → **15
passed**, 0 failed.

**Outcome:** FIXED — all 3 queued rows closed (`variants.test.ts` untouched). Deferred: none for
this owner.

---

## a2-logarithms

**File:** `src/lib/algebra2Variants.ts:74,81` (`LG='a2-logarithms'` tag const). Same regex-fragment
architecture as `a2-statistics`/`a2-rationals`: `src/lib/algebra2Independent.cjs`'s `opt()` matches
a regex fragment against cleaned option text. Oracle lines: `algebra2Independent.cjs:36`
(`lg-graph` → `/domain is x>0.*vertical asymptote x=0/i`, case-insensitive, requires both literal
substrings in order with anything in between) and `:43` (`lg-scales` → dynamically built
`` new RegExp(`${10**diff} times`) ``, requiring the exact computed power-of-ten value followed by
"times").

**Defect:** Seed-swept 200 seeds/form (29 forms) — found exactly 2 leaking forms, matching the
queue's 2 rows, both `length-prose-vs-prose`:
- `lg-graph__mcq` (`algebra2Variants.ts:74`): correct `"Its domain is x>0 and it has vertical
  asymptote x=0."` (52 chars) vs. longest wrong 31.
- `lg-scales__mcq` (`algebra2Variants.ts:81`): correct `"It is about 100000000 times as large"`
  (36 chars, for a magnitude-difference seed of 8) vs. longest wrong 23; only leaked on ~85/200
  seeds since `10**diff` for `diff∈[2,9]` isn't always long enough to breach the threshold.

**Fix:** Trimmed both labels to their required regex fragments, verified the fragment survives
before applying:
- `lg-graph`: `"Its domain is x>0 and it has vertical asymptote x=0."` → `"Domain is x>0 with
  vertical asymptote x=0."` (42 chars) — still contains "domain is x>0" (case-insensitive) followed
  by "vertical asymptote x=0".
- `lg-scales`: `` `It is about ${10**diff} times as large` `` → `` `About ${10**diff} times as
  large` `` — dropped "It is" only; verified across the full `diff∈[2,9]` range (correct length
  24-31 chars vs. longest wrong a constant 23, since `10*diff` stays 2 digits for this range),
  feedback gained "compounding across every unit of increase."

**mcq-leakage:** Before: 2/29 leaking forms (200 seeds/form). After: 0/29 — full re-sweep at 400
seeds/form shows 0 leaks, 0 errors across all 29 forms.

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "a2-logarithms"` → **32 passed**, 0
failed.

**Outcome:** FIXED — all 2 queued rows closed (`algebra2Independent.cjs` untouched). Deferred: none
for this owner.

---

## end-behavior

**File:** `src/lib/variants.ts:20163-20266` (`gen()` branches for `poleClassify` and `polyLimit`
inside the `end-behavior` tag block). Independent answers resolve via `variants.test.ts`'s
`INDEPENDENT` registry: `end-behavior@poleClassify` (line 4248) recomputes `wanted` from the parsed
prompt and does exact `label === wanted` equality against one of two hardcoded literals — a sixth
confirmation of the exact-match architecture, so this form's correct label (`"A vertical asymptote
— the bottom vanishes and the top does not."`) had to stay 100% byte-identical (lengthen distractors
only). `end-behavior@polyLimit` (line 4259) instead does `label.startsWith(wanted)` with a short
6-character `wanted` (`"f → +∞"` / `"f → −∞"`), so its correct label was trimmable to that literal
prefix. Confirmed via the code comment at `variants.ts:20176-20184` that the generator's `draw()`
guard (`b !== -a*k`) makes the "hole" case structurally unreachable for `poleClassify`, so `"A
hole."` never becomes the oracle's `wanted` value here and was safe to reword.

**Defect:** Seed-swept 200 seeds/form (3 forms) — found exactly 2 leaking forms, matching the
queue's 2 rows, both `length-answer-explains-itself` and both label sets **seed-independent**
(fully static text, no interpolation):
- `poleClassify` (`variants.ts:20192-20203`): correct `"A vertical asymptote — the bottom vanishes
  and the top does not."` (64 chars) vs. longest wrong 16 (`"Nothing special."`).
- `polyLimit` (`variants.ts:20232-20245`): correct `` `f → ${dir} — the ${term} term dominates and
  is ${...} for negative x.` `` (62 chars for a representative seed) vs. longest wrong 6.

**Fix:**
- `poleClassify`: correct label left untouched; lengthened all 3 distractors with the real
  misconception each already encoded in its feedback: `"A hole."` → `"A removable hole, if the
  numerator also vanished there."` (57); `"A root."` → `"A root of the numerator, not the
  denominator."` (47); `"Nothing special."` → `"Nothing special happens at this particular
  x-value."` (53).
- `polyLimit`: trimmed the correct label to its oracle prefix, `` `f → ${dir}` `` (6 chars, now the
  same length band as every distractor: `f → ${otherDir}` 6, `f → 0` 5, `f → ${±C}` 5-6 for
  single-digit `C`), folding the dropped dominance explanation into the feedback string.

**mcq-leakage:** Before: 2/3 leaking forms (200 seeds/form). After: 0/3 — full re-sweep at 400
seeds/form shows 0 leaks, 0 errors across all 3 forms.

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "end-behavior"` → **8 passed**, 0
failed.

**Outcome:** FIXED — all 2 queued rows closed (`variants.test.ts` untouched). Deferred: none for
this owner.

---

## full-sketch

**File:** `src/lib/variants.ts:20279-20367` (`gen()` branches for `fallingSteepening` and
`logicalContradiction` inside the `full-sketch` tag block). Independent answers resolve via
`variants.test.ts`'s `INDEPENDENT` registry using exact `label === wanted` equality for both forms
(`full-sketch@fallingSteepening` at line 4291 against a fully static literal; `full-sketch@
logicalContradiction` at line 4309 against a literal interpolating only the two small interval
bounds `lo`/`hi`). Both correct labels therefore had to stay 100% byte-identical — lengthen
distractors only.

**Defect:** Seed-swept 200 seeds/form (3 forms) — found exactly 2 leaking forms, matching the
queue's 2 rows, both `length-prose-vs-prose`:
- `fallingSteepening` (`variants.ts:20287-20295`): correct `"Falling, and the fall is steepening
  (f′ < 0, f″ < 0)."` (53 chars, static) vs. longest wrong 27 (`"Falling, but levelling off."`).
- `logicalContradiction` (`variants.ts:20307-20321`): correct `"An interior maximum needs f′ to
  change sign — but f′ never changes sign on (4, 9)."` (82 chars) vs. longest wrong 52.

**Fix:** Lengthened each form's 3 distractors with legitimate extra wording drawn from their own
existing feedback, verified clean across 5 representative interval values before applying:
- `fallingSteepening`: `"Falling, but levelling off."` (27)→`"Falling, but levelling off as it
  approaches the next turn."` (58); `"Rising and bending up."` (22)→`"Rising steadily and bending
  upward the whole time."` (50); `"Flat throughout."` (16)→`"Perfectly flat throughout the entire
  interval."` (46).
- `logicalContradiction`: `"Nothing — a curve can rise and still have a maximum."` (53)→`"Nothing
  is wrong — a curve can rise and still have a maximum."` (61); `` `The maximum should be at x =
  ${lo}.` `` (~31-32)→`` `The maximum should really be located at x = ${lo} instead.` `` (~53-54);
  `"f″ must be negative there."` (27)→`"The second derivative f″ must be negative there instead."`
  (56).

**mcq-leakage:** Before: 2/3 leaking forms (200 seeds/form). After: 0/3 — full re-sweep at 400
seeds/form shows 0 leaks, 0 errors across all 3 forms.

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "full-sketch"` → **6 passed**, 0
failed.

**Outcome:** FIXED — all 2 queued rows closed (`variants.test.ts` untouched). Deferred: none for
this owner.

---

## g10-right-triangles

**File:** `src/lib/geometryVariantTemplates.json` (`g10-right-triangles.rt-elev-depress__mcq[0]`
and `.rt-law-cosines__mcq[0]`), mirrored in `src/lib/geometryIndependentAnswers.json`. Standard
locked authored-template-bank architecture (JSON literal lookup, prompt → exact-label-string map
read by `geometryIndependent.cjs`); confirmed no override in `geometryVariants.ts`'s
`CIRCLE_FORM_BUILDERS`/`CONSTRUCTION_FORM_BUILDERS` maps touches this tag.

**Defect:** Bankscanned all 29 forms — found exactly 2 leaking pool entries, matching the queue's 2
rows:
- `rt-elev-depress__mcq[0]` (`length-prose-vs-prose`): correct `"15° — alternate interior angles
  between parallels"` (49 chars) vs. longest wrong 32 (`"It depends on the cliff's height"`).
- `rt-law-cosines__mcq[0]` (`length-answer-explains-itself`): correct `"Law of Cosines — SAS is its
  home turf"` (37 chars) vs. longest wrong 23 (`"The Pythagorean theorem"`).

**Fix:** Trimmed both correct labels, mirrored character-for-character into
`geometryIndependentAnswers.json`, moving the dropped clause into feedback:
- `rt-elev-depress__mcq[0]`: label → `"15° — alternate interior angles"` (31 chars); feedback
  gained "alternate interior angles between them match exactly" (folding "between parallels" back
  in).
- `rt-law-cosines__mcq[0]`: label → `"Law of Cosines"` (14 chars, now matching the plain-tool-name
  style of all 3 distractors); feedback gained "— that combination is the Law of Cosines' home
  turf" (folding the dropped SAS framing back in).

**mcq-leakage:** Before: 2 leaking pool entries. After: `s327_bankscan.py` reports "(all mcq pool
entries clean)" across all 29 forms.

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "g10-right-triangles"` → **32
passed**, 0 failed.

**Outcome:** FIXED — all 2 queued rows closed (`geometryIndependent.cjs` untouched). Deferred: none
for this owner.

---

## g12-conic-sections

**File:** `src/lib/precalculusVariantTemplates.json` (`conic-sections__co-asymptote__mcq[0]` and
`conic-sections__co-general-hp__mcq[0]`), mirrored in `src/lib/precalculusIndependentAnswers.json`.
**Architecture check performed first:** this tag is one of only 3 override tags in
`precalculusVariants.ts`'s `PRECALCULUS_GENERATORS` map (`precalculusVariants.ts:1181-1190`), which
intercepts two specific form names (`PARABOLA_DEFINITION_FORM`, `HYPERBOLA_ECCENTRICITY_FORM` —
`parabolaDefinitionVariant`/`hyperbolaEccentricityVariant`, both defined at lines 60-123) before
falling through to the plain JSON-bank generator for every other form. Both overridden forms are
`type: "numeric"`, never `mcq`, so they cannot be the source of an MCQ leak — confirming the 2
leaking forms found below fall through to the ordinary JSON-bank path and are safe to fix with a
plain label trim (same as every other precalculus owner this session). Also uses the 3-option
schema (1 correct + 2 wrong, wrong options omit the `"correct"` key).

**Defect:** Bankscanned all 13 forms — found exactly 2 leaking pool entries, matching the queue's 2
rows, both `length-prose-vs-prose`:
- `co-asymptote__mcq[0]`: correct `"Hyperbola ADDS (c² = a² + b²); ellipse SUBTRACTS"` (48 chars)
  vs. longest wrong 31 (`"They use the exact same formula"`).
- `co-general-hp__mcq[0]`: correct `"the parabola (only one squared term)"` (36 chars) vs. longest
  wrong 13 (`"the hyperbola"`).

**Fix:** Trimmed both correct labels, mirrored character-for-character into
`precalculusIndependentAnswers.json`, moving the dropped clause into feedback:
- `co-asymptote__mcq[0]`: label → `"Hyperbola ADDS; ellipse SUBTRACTS"` (33 chars); feedback gained
  the explicit `c² = a² + b²` vs. `c² = a² − b²` formulas that were dropped from the label.
- `co-general-hp__mcq[0]`: label → `"the parabola"` (12 chars, now matching the plain lowercase
  `"the ellipse"`/`"the hyperbola"` style of both distractors); feedback gained "the parabola has
  only one squared term" (folding the dropped parenthetical back in).

**mcq-leakage:** Before: 2 leaking pool entries. After: `s327_bankscan.py` reports "(all mcq pool
entries clean)" across all 13 forms.

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "g12-conic-sections"` → **16
passed**, 0 failed.

**Outcome:** FIXED — all 2 queued rows closed (`precalculusVariants.ts` and
`precalculusIndependent.cjs` untouched). Deferred: none for this owner.

---

## g13-parametric-polar-calculus

**File:** `src/lib/calculusVariantTemplates.json` (`parametric-polar-calculus__pc-polar-area__
mcq[0]` and `.pc-vector-motion__mcq[0]`), mirrored in `src/lib/calculusIndependentAnswers.json`.
**Architecture check performed first:** `calculusVariants.ts:2963-2974` overrides this tag with
`PARAMETRIC_PC01_BUILDERS`, a map from full form-key strings to TS widget-builder functions for 3
of its 9 forms (`pc-parametric-derivative__mcq`, `pc-arc-length__mcq`/`__numeric`,
`pc-second-derivative__numeric`) — meaning the JSON bank is potentially dead code for those specific
keys and `bankscan` alone cannot be trusted. Used `s327_sweep.mts` (imports the real
`VARIANT_GENERATORS`) instead of `s327_bankscan.py` for this owner so the leak check exercises
whichever path (TS override or JSON fallback) actually runs. The 2 leaking forms found below,
`pc-polar-area__mcq` and `pc-vector-motion__mcq`, are confirmed absent from the override map, so
they fall through to the plain JSON-bank path and were safe to fix with the standard label-trim.

**Defect:** Seed-swept 200 seeds/form (9 forms) — found exactly 2 leaking forms, matching the
queue's 2 rows, both `length-prose-vs-prose`:
- `pc-polar-area__mcq`: correct `"A thin wedge is a TRIANGLE, and a triangle's area is ½ · base ·
  height."` (71 chars) vs. longest wrong 39 (`"Because you sweep only half the circle."`).
- `pc-vector-motion__mcq`: correct `"Yes — a = ⟨−cos t, −sin t⟩ has magnitude 1. The DIRECTION of
  the velocity keeps changing, even though its length does not."` (122 chars) vs. longest wrong 58.

**Fix:** Trimmed both correct labels, mirrored character-for-character into
`calculusIndependentAnswers.json`, moving the dropped clause into feedback:
- `pc-polar-area__mcq`: label → `"A thin wedge is a TRIANGLE."` (27 chars); feedback gained the
  dropped "a triangle's area is ½ · base · height" justification.
- `pc-vector-motion__mcq`: label → `"Yes — the DIRECTION of the velocity keeps changing."` (51
  chars); feedback gained the dropped `a = ⟨−cos t, −sin t⟩ has magnitude 1` computation.

**mcq-leakage:** Before: 2/9 leaking forms (200 seeds/form). After: 0/9 — full re-sweep at 400
seeds/form shows 0 leaks, 0 errors across all 9 forms (real-generator sweep, so this also confirms
the TS-overridden forms stayed unaffected).

**Targeted test:** The tag-wide gate (`-t "g13-parametric-polar-calculus"`) surfaced 3 failures, but
all 3 are the tag's bulk/band-level gate tests hitting a **pre-existing, unrelated** oracle gap in
`pc-arc-length` (see note below) — confirmed via `git diff` that `calculusVariants.ts` and
`calculusIndependent.cjs` have **zero changes this session** (only the two JSON files differ), and
`git show HEAD:...` shows the failing prompt text and its exact error message already present
before any session edit. The per-form pinned gate tests for both forms I actually touched pass
cleanly: `@ form=...pc-polar-area__mcq: 150 seeds` ✓ and `@ form=...pc-vector-motion__mcq: 150
seeds` ✓. Isolated with `-t "pc-polar-area"` → **2 passed**, 0 failed, and `-t "pc-vector-motion"` →
**2 passed**, 0 failed.

**Unrelated pre-existing observation (not fixed, out of scope):** `pc-arc-length__mcq`'s JSON bank
holds a pool entry with prompt `"What IS the quantity √((dx/dt)² + (dy/dt)²)?"` that
`calculusIndependent.cjs:904-906`'s `solveParametricPc01` cannot parse (its regex only recognizes
the `x(t) = …t and y(t) = …t` numeric-arc-length prompt shape), throwing `unrecognized
parametric-arc prompt`. This entry is unreachable when `form` is pinned to the exact override key
(`parametric-polar-calculus__pc-arc-length__mcq`, confirmed passing above), but the tag's
`form="default"` bulk gate path falls through to the plain generator and can reach it. Fixing this
would mean either extending the oracle's regex or reworking the "default" dispatch — a generator
redesign, not a leak-closure fix — so per the mission's scope guard this is logged only, not
touched. This entry is not among the queue's 2 rows for this owner (confirmed both queued rows are
closed above) and was not introduced by any edit this session (`git diff` shows zero changes to
either `.ts` or `.cjs` file).

**Outcome:** FIXED — all 2 queued rows closed (`calculusVariants.ts`/`calculusIndependent.cjs`
untouched). Deferred: the pre-existing `pc-arc-length` oracle gap above (not part of this owner's 2
queued rows).

---

## line-plot

**File:** `src/lib/variants.ts:32271-32379` (`gen()` branches for `ddDotDataSet` and
`ddShapeFullStory`, inside the `G6_DOT_FORMS` block of the `line-plot` tag). Independent answers
resolve via `variants.test.ts`'s `ddDotRoute()` (line 785): `ddDotDataSet` (line 789) recomputes the
fully-expanded value list from the parsed prompt and does **exact** `x === values.join(", ")`
equality — the correct label can never deviate from that precise recomputed string. `ddShapeFullStory`
(line 808) instead does `x.startsWith("Clustered at")` — a short 12-character prefix — so its label
is trimmable.

**Defect:** Seed-swept 200 seeds/form (16 forms) — found exactly 2 leaking forms, matching the
queue's 2 rows, both `length-prose-vs-prose`:
- `ddDotDataSet`: correct is the fully expanded dot list (e.g. `"19, 19, 19, 22, 22, 22, 22, 25,
  28, 28, 28, 28, 28"`, 50 chars for this seed, up to 78 chars in the worst case — 4 values × up to
  5 dots each, all 2-digit) vs. longest wrong 14 (`"19, 22, 25, 28"`).
- `ddShapeFullStory`: correct `"Clustered at 1–2, followed by a gap and an outlier at 6"` (55 chars)
  vs. longest wrong 25 (`"Evenly spread from 1 to 6"`).

**Fix:**
- `ddShapeFullStory`: trimmed to the oracle prefix, `` `Clustered at ${base}–${base + 1}` `` (16
  chars, now shorter than both distractors), folding the dropped "followed by a gap and an outlier"
  clause into feedback.
- `ddDotDataSet` required an extra pass: the correct label is inherently a numbers-only list whose
  length is proportional to the total dot count and cannot be trimmed (exact-match oracle), so the
  fix had to lengthen the distractors instead — but lengthening **both** of the original
  numbers-only distractors (`values.join(", ")` and `counts.join(", ")`) with prose introduced a
  **new tell not seen earlier this session**, `only-numeric-option` (the checker's `is_numeric()`
  gate: flags a purely-numeric correct answer when *no* distractor is even value-like, i.e. numeric
  or a simple symbolic value). Fix: left the `values.join(", ")` distractor **completely
  untouched** (keeping it numeric-only so the `only-numeric-option` gate always has a value-like
  wrong option to point to) and lengthened only the `counts.join(", ")` distractor: `` `Just the
  stack heights, not the actual data values: ${counts.join(", ")}` `` (62 chars, comfortably above
  even the 78-char worst-case correct's 1.5× threshold of ~117). Verified clean across 7
  representative value/count combinations spanning the full support/core/stretch range, including
  the generator's own all-1s→forced-2 edge case.

**mcq-leakage:** Before: 2/16 leaking forms (200 seeds/form). After: 0/16 — full re-sweep at 600
seeds/form (raised from the usual 200-400 specifically to stress-test `ddDotDataSet`'s wide
total-dot-count range) shows 0 leaks, 0 errors across all 16 forms.

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "line-plot"` → **23 passed**, 0
failed.

**Outcome:** FIXED — all 2 queued rows closed (`variants.test.ts` untouched). Deferred: none for
this owner.

---

## a1-exponential

**File:** `src/lib/algebra1Variants.ts:52` (`concept==='exp-graph-read'`, `EXP='a1-exponential'`
tag const). **First owner from a new family file this session** (`algebra1Variants.ts` +
`algebra1Independent.cjs`, discovered here). Architecture check: `algebra1Independent.cjs:14`'s
`chooseOption(options, answer)` does exact match on `polishText(x) === polishText(answer)` (light
normalization only — unicode minus, whitespace, "1x"→"x", a couple of decimal→fraction
canonicalizations) with a numeric-value fallback that only helps when the ENTIRE label is a bare
number/fraction. For `exp-graph-read`'s prose label this is effectively exact-match — a sixth
confirmed independent-answer architecture this session, functionally identical in consequence to
architectures #3/#4 (correct label must stay untouched).

**Defect:** Seed-swept 200 seeds/form (12 forms) — found exactly 1 leaking form, matching the
queue's 1 row, `length-prose-vs-prose`, but only on **10/200 seeds (5%)**: correct `"increasing
exponential growth with y-intercept 3"` (48 chars) vs. longest wrong 28 (`"a line with constant
slope"`). Root cause: `exp-graph-read`'s first distractor is `` `${kind} with y-intercept ${base}` ``
— normally close in length to the correct label since it mirrors the same "kind" phrase — but
`algebra1Variants.ts`'s `mcq()` helper deduplicates options by label text, and whenever the randomly
drawn `a` (y-intercept) happens to equal `base` (the growth/decay factor), that mirror distractor
becomes byte-identical to the correct label and gets silently dropped, leaving only the two
short, fixed-text distractors (`"a line with constant slope"`, and the opposite-kind label) — this
is exactly the rare-collision pattern the 5% leak rate reflects.

**Fix:** Correct label is exact-match locked, so lengthened only the one static distractor that is
short in every scenario: `"a line with constant slope"` (28 chars) → `"A straight line that changes
by a constant slope, not a constant ratio."` (71 chars). Verified clean via checker across both the
collision case (a === base, only 2 distractors survive) and the normal 3-distractor case, at several
representative y-intercept/base combinations including decimal bases (0.5, 0.25).

**mcq-leakage:** Before: 1/12 leaking forms, leaking on ~5% of seeds (200 seeds/form). After: 0/12 —
full re-sweep at **2000 seeds/form** (raised specifically to give the rare a===base collision case
enough occurrences to re-verify) shows 0 leaks, 0 errors across all 12 forms.

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "a1-exponential"` → **15 passed**, 0
failed.

**Outcome:** FIXED — 1 queued row closed (`algebra1Independent.cjs` untouched). Deferred: none for
this owner.

---

## a1-systems

**File:** `src/lib/algebra1Variants.ts:331-333` (`concept==='classify-systems'`, `SYS='a1-systems'`
tag const). Same `chooseOption` exact-match architecture as `a1-exponential`
(`algebra1Independent.cjs:94`), against one of 3 fully static literals: `'one solution'`, `'no
solution'`, `'infinitely many solutions'`.

**Defect:** Seed-swept 200 seeds/form (15 forms) — found exactly 1 leaking form, matching the
queue's 1 row, `length-prose-vs-prose`, on 53/200 seeds (~27%): correct `"infinitely many
solutions"` (25 chars) vs. longest wrong 12. Root cause, distinct from the usual pattern: the
original code passed **all 3** canonical phrases into the wrong-options array
(`[['one solution',…],['no solution',…],['infinitely many solutions',…]]`), relying on `mcq()`'s
built-in dedup to silently drop whichever one collided with the correct `kind`. Whenever `kind`
was `'infinitely many solutions'`, the two surviving wrongs were always the two short phrases
(`'one solution'` 12 chars, `'no solution'` 11 chars) — a structural, not incidental, leak (fires on
every draw where that kind is selected, not a rare collision).

**Fix:** Restructured (not merely relabeled) the wrong-option construction so it never re-uses the 3
oracle-locked literal phrases as distractor text: added a `CLASSIFY_WRONG` lookup mapping each of
the 3 kinds to a longer paraphrase (`'one solution'` → `"Exactly one solution point."` 27 chars;
`'no solution'` → `"No point satisfies both lines at once."` 38 chars; `'infinitely many
solutions'` → `"Every point on the line satisfies both equations."` 49 chars), then built the wrong
array from `others = KINDS.filter(k => k !== kind)` mapped through that lookup — so exactly 2
distractors are always shown (never 3-with-a-silent-drop), always using the long paraphrase, and the
correct option always renders the required short oracle literal. This keeps the underlying
classification math (`lines[0].m!==lines[1].m ? …`) and every misconception pairing completely
unchanged — only which TEXT represents each non-chosen category was touched. Verified via checker
across all 3 possible `kind` draws (previously-clean scenarios stayed clean; the leaking scenario
is now clean with correct 25 chars vs. longest wrong 38).

**mcq-leakage:** Before: 1/15 leaking forms, leaking on 53/200 seeds (200 seeds/form). After: 0/15 —
full re-sweep at 600 seeds/form shows 0 leaks, 0 errors across all 15 forms.

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "a1-systems"` → **18 passed**, 0
failed.

**Outcome:** FIXED — 1 queued row closed (`algebra1Independent.cjs` untouched). Deferred: none for
this owner.

---

## a2-complex

**File:** `src/lib/algebra2Variants.ts:47` (`CN='a2-complex'` tag const). Standard algebra2
regex-fragment architecture: `algebra2Independent.cjs:15`, `opt(options, /preserves equality.*
perfect-square|perfect-square trinomial/)`.

**Defect:** Seed-swept 200 seeds/form (11 forms) — found exactly 1 leaking form, matching the
queue's 1 row, `length-prose-vs-prose`: `cn-cts-solve__mcq` correct `"It preserves equality while
creating a perfect-square trinomial."` (64 chars) vs. longest wrong 42.

**Fix:** Trimmed to the regex's second alternative (`perfect-square trinomial`, verified present
verbatim): label → `"It creates a perfect-square trinomial."` (38 chars, now shorter than the
longest distractor); feedback gained the dropped equality-preservation reasoning.

**mcq-leakage:** Before: 1/11 leaking forms (200 seeds/form). After: 0/11 — full re-sweep at 400
seeds/form shows 0 leaks, 0 errors across all 11 forms.

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "a2-complex"` → **14 passed**, 0
failed.

**Outcome:** FIXED — 1 queued row closed (`algebra2Independent.cjs` untouched). Deferred: none for
this owner.

---

## a2-polynomials

**File:** `src/lib/algebra2Variants.ts:94` (`PF='a2-polynomials'` tag const). Standard algebra2
regex-fragment architecture: `algebra2Independent.cjs:53`, `opt(options, /dividend = divisor.*
quotient \+ remainder/)`.

**Defect:** Seed-swept 200 seeds/form (34 forms) — found exactly 1 leaking form, matching the
queue's 1 row, `length-prose-vs-prose`: `pf-long-div__mcq` correct `"Verify dividend =
divisor·quotient + remainder"` (46 chars) vs. longest wrong 28.

**Fix:** Trimmed the "Verify " prefix (not part of the required regex fragment, verified present
verbatim without it): label → `"dividend = divisor·quotient + remainder"` (39 chars); feedback
gained "Verifying" to keep the imperative framing.

**mcq-leakage:** Before: 1/34 leaking forms (200 seeds/form). After: 0/34 — full re-sweep at 400
seeds/form shows 0 leaks, 0 errors across all 34 forms.

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "a2-polynomials"` → **37 passed**, 0
failed.

**Outcome:** FIXED — 1 queued row closed (`algebra2Independent.cjs` untouched). Deferred: none for
this owner.

---

## a2-radicals

**File:** `src/lib/algebra2Variants.ts:125` (`RE='a2-radicals'` tag const). Standard algebra2
regex-fragment architecture: `algebra2Independent.cjs:70`, `opt(options, /Squaring loses sign
information/)`.

**Defect:** Seed-swept 200 seeds/form (31 forms) — found exactly 1 leaking form, matching the
queue's 1 row, `length-prose-vs-prose`: `re-extraneous__mcq` correct `"Squaring loses sign
information and is not reversible without checking."` (71 chars) vs. longest wrong 43.

**Fix:** Trimmed to the required fragment: label → `"Squaring loses sign information."` (32 chars,
now in the same band as the 3 distractors, 29-43 chars); feedback gained the dropped
"reversible without checking" reasoning.

**mcq-leakage:** Before: 1/31 leaking forms (200 seeds/form). After: 0/31 — full re-sweep at 400
seeds/form shows 0 leaks, 0 errors across all 31 forms.

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "a2-radicals"` → **34 passed**, 0
failed.

**Outcome:** FIXED — 1 queued row closed (`algebra2Independent.cjs` untouched). Deferred: none for
this owner.

---

## area-formula-pick

**File:** `src/lib/variants.ts:22428-22447` (`form === "trapezoidAverage"` branch, giant procedural
dispatcher). Independent answer resolves via `variants.test.ts`'s `area-formula-pick@
trapezoidAverage` (line 4994), which does `label.includes(\`gives area ${area}\`)` — a **substring
match anywhere in the label**, not just a prefix — so any surrounding text can be trimmed as long as
that exact fragment survives somewhere in the string.

**Defect:** Seed-swept 200 seeds/form (5 forms) — found exactly 1 leaking form, matching the queue's
1 row, `length-prose-vs-prose`: `trapezoidAverage` correct `"Averaging gives an effective width
between 5 and 12; multiplying by 8 gives area 68"` (83 chars) vs. longest wrong 50.

**Fix:** Trimmed to a short sentence that still ends in the required fragment: label →
`` `The average width times ${h} gives area ${area}` `` (38-40 chars across the b1/b2/h ranges
tested); feedback gained the dropped "effective width between" framing. Verified across 5
representative base/height combinations spanning the generator's full range.

**mcq-leakage:** Before: 1/5 leaking forms (200 seeds/form). After: 0/5 — full re-sweep at 400
seeds/form shows 0 leaks, 0 errors across all 5 forms.

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "area-formula-pick"` → **8 passed**,
0 failed.

**Outcome:** FIXED — 1 queued row closed (`variants.test.ts` untouched). Deferred: none for this
owner.

---

## attributes

**File:** `src/lib/variants.ts:31452-31458` (`form === "definingAttribute"` branch, procedural
dispatcher). Independent answer resolves via `variants.test.ts`'s `attributes@definingAttribute`
(line 8403), exact `label === wanted` equality against `` `It has ${sides} straight sides and is
closed` `` recomputed from the parsed shape name — exact-match architecture, correct label
untouchable.

**Defect:** Seed-swept 200 seeds/form (8 forms) — found exactly 1 leaking form, matching the
queue's 1 row, `length-prose-vs-prose`: `definingAttribute` correct `"It has 4 straight sides and
is closed"` (37 chars) vs. longest wrong 25.

**Fix:** Lengthened all 3 distractors with legitimate extra wording (verified clean across all 4
shape names — triangle/quadrilateral/pentagon/hexagon): `"It is drawn in blue"` (20)→`"It is drawn
in a particular shade of blue"` (41); `"It is larger than a hand"` (25)→`"It happens to be larger
than a human hand"` (41); `"One vertex points upward"` (25)→`"One of its vertices currently points
upward"` (43).

**mcq-leakage:** Before: 1/8 leaking forms (200 seeds/form). After: 0/8 — full re-sweep at 400
seeds/form shows 0 leaks, 0 errors across all 8 forms.

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "attributes"` → **11 passed**, 0
failed.

**Outcome:** FIXED — 1 queued row closed (`variants.test.ts` untouched). Deferred: none for this
owner.

---

## compare-same-num

**File:** `src/lib/variants.ts:30528-30558` (`form === "whoIsRight"` branch). Independent answer
resolves via `variants.test.ts`'s `compare-same-num@whoIsRight` (line 7415, distinct from the
same-named `equivalent-fractions@whoIsRight` at line 7236 — confirmed the correct tag-scoped
entry), exact `label === wanted` equality against `` `The ${big} means a ${big}-way cut, so those
pieces are smaller` `` — exact-match architecture, correct label untouchable.

**Defect:** Seed-swept 200 seeds/form (3 forms) — found exactly 1 leaking form, matching the
queue's 1 row, `length-prose-vs-prose`, on 114/200 seeds (57%): correct `"The 11 means a 11-way
cut, so those pieces are smaller"` (54 chars) vs. longest wrong 35.

**Fix:** Lengthened all 3 distractors, verified clean across 5 representative name/fraction
combinations: `` `${N} is right — ${big} beats ${small}` `` (~26)→`` `${N} is right — ${big} is
simply a bigger number than ${small}` `` (~50); `"She should add the tops and bottoms"` (36)→`"She
should add the tops together and the bottoms together"` (57); `` `${...many} aren't real
fractions` `` (~32)→`` `${...many} aren't valid fractions at all` `` (~36-39).

**mcq-leakage:** Before: 1/3 leaking forms, leaking on 114/200 seeds (200 seeds/form). After: 0/3 —
full re-sweep at 600 seeds/form shows 0 leaks, 0 errors across all 3 forms.

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "compare-same-num"` → **6 passed**,
0 failed.

**Outcome:** FIXED — 1 queued row closed (`variants.test.ts` untouched). Deferred: none for this
owner.

---

## const-sum-rule

**File:** `src/lib/variants.ts:20932-20949` (`form === "whyConstant"` branch). Independent answer
resolves via `variants.test.ts`'s `const-sum-rule@whyConstant` (line 4549), exact `label === wanted`
equality against `` `Adding ${k} raises the whole curve without tilting it, so every slope is
unchanged.` `` — exact-match architecture, correct label untouchable.

**Defect:** Seed-swept 200 seeds/form (3 forms) — found exactly 1 leaking form, matching the
queue's 1 row, `length-prose-vs-prose`: correct `"Adding 5 raises the whole curve without tilting
it, so every slope is unchanged."` (80 chars) vs. longest wrong 42.

**Fix:** Lengthened only the shortest distractor (the other two were already reasonably close):
`` `Because ${k} is small.` `` (20)→`` `Because the value ${k} happens to be a fairly small
number.` `` (56-57). Verified clean across 5 representative n/k combinations spanning the
generator's full range (k from 3 to 40).

**mcq-leakage:** Before: 1/3 leaking forms (200 seeds/form). After: 0/3 — full re-sweep at 400
seeds/form shows 0 leaks, 0 errors across all 3 forms.

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "const-sum-rule"` → **6 passed**, 0
failed.

**Outcome:** FIXED — 1 queued row closed (`variants.test.ts` untouched). Deferred: none for this
owner.

---

## critical-count

**File:** `src/lib/variants.ts:19761-19776` (`form === "oddPowerSaddle"` branch). Independent
answer resolves via `variants.test.ts`'s `critical-count@oddPowerSaddle` (line 4123),
`label.startsWith("Neither a peak")` — a short 14-character prefix, so the label is trimmable.

**Defect:** Seed-swept 200 seeds/form (2 forms) — found exactly 1 leaking form, matching the
queue's 1 row, `length-answer-explains-itself`: correct `"Neither a peak nor a valley — f′ = 5x⁴
is positive on BOTH sides, so f keeps climbing."` (86 chars) vs. longest wrong 19.

**Fix:** Trimmed to the oracle prefix: label → `"Neither a peak nor a valley"` (27 chars, now
comparable to the 3 short distractors 10-19 chars); feedback gained the dropped derivative-sign
reasoning. Verified across all 3 possible odd powers (n=3,5,7).

**mcq-leakage:** Before: 1/2 leaking forms (200 seeds/form). After: 0/2 — full re-sweep at 400
seeds/form shows 0 leaks, 0 errors across both forms.

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "critical-count"` → **5 passed**, 0
failed.

**Outcome:** FIXED — 1 queued row closed (`variants.test.ts` untouched). Deferred: none for this
owner.

---

## estimation

**File:** `src/lib/variants.ts:29028-29045` (`form === "whenEstimate"` branch). Independent answer
resolves via `variants.test.ts`'s `estimation@whenEstimate` (line 8716), exact `label === wanted`
equality against the fully static literal `"When a quick, close-enough value is useful and
exactness is not required"` — exact-match architecture, correct label untouchable.

**Defect:** Seed-swept 200 seeds/form (4 forms) — found exactly 1 leaking form, matching the
queue's 1 row, `length-prose-vs-prose`: correct (72 chars) vs. longest wrong 37.

**Fix:** Lengthened all 3 distractors, verified clean across all 3 possible prompt contexts:
`"When paying a bill to the exact cent"` (37)→`"When paying a bill that must be exact to the very
last cent"` (59); `"Whenever an exact answer is difficult"` (38)→`"Whenever getting an exact answer
turns out to be difficult"` (58); `"Only when both numbers end in zero"` (35)→`"Only when both of
the numbers happen to end in zero"` (51).

**mcq-leakage:** Before: 1/4 leaking forms (200 seeds/form). After: 0/4 — full re-sweep at 400
seeds/form shows 0 leaks, 0 errors across all 4 forms.

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "estimation"` → **7 passed**, 0
failed.

**Outcome:** FIXED — 1 queued row closed (`variants.test.ts` untouched). Deferred: none for this
owner.

## even-odd-classify

**File:** `src/lib/variants.ts:24410-24448` (`tag: "even-odd-classify"`, `forms: ["neitherMixed",
"evenPolynomial"]`; edited branch at lines ~24441-24448).

**Oracle:** `variants.test.ts:5578-5585`, `"even-odd-classify@neitherMixed"` — exact `label ===
wanted` equality; `wanted` is computed via `parityOf(f)` and mapped to the fully static literal
`"Neither even nor odd"` when the verdict is `"Neither"`. Correct label is oracle-locked
(architecture 3, full-literal-exact sub-variant); only distractors could be rewritten.

**Defect:** `length-prose-vs-prose`, `neitherMixed` — correct label `"Neither even nor odd"` (20
chars) vs. longest distractor `"Odd"`/`"Even"` (4 chars). `evenPolynomial` was already clean.

**Fix:** Lengthened both distractor labels while leaving their (already long, misconception-laden)
feedback strings and the correct label untouched:
- `` `Even` `` → `` `An even function` ``
- `` `Odd` `` → `` `An odd function` ``

**mcq-leakage:** before — `neitherMixed` ok=0/200 errors=0 nonMcq=0
`codes={"length-prose-vs-prose":200}`, detail `"20 chars vs longest distractor 4"`;
`evenPolynomial` already clean. After — `neitherMixed` ok=400/400 errors=0 nonMcq=0 codes={};
`evenPolynomial` ok=400/400 errors=0 nonMcq=0 codes={} (SEEDS=400 seed-sweep, both forms).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "even-odd-classify"` → **5 passed**,
0 failed.

**Outcome:** FIXED — 1 queued row closed (`variants.test.ts` untouched). Deferred: none for this
owner.

## fact-family

**File:** `src/lib/variants.ts:22131-22182` (`tag: "fact-family"`, `forms: ["familyDivide",
"howManyFacts", "shareThenGiveBack"]`; edited branch at lines ~22174-22179, `form ===
"howManyFacts"`). The other two forms are `num()` (numeric), not MCQ, so they were never leak
candidates.

**Oracle:** `variants.test.ts:4915-4925`, `"fact-family@howManyFacts"` — exact `label === wanted`
equality; `wanted` is the fully computed literal `` `2 — just ${a} × ${a} = ${P} and ${P} ÷ ${a} =
${a}` `` when the two-factors-equal collapse condition holds. Correct label is oracle-locked
(architecture 3, full-literal-exact sub-variant); only distractors could be rewritten.

**Defect:** `length-answer-explains-itself`, `howManyFacts` — correct label (32-40 chars depending
on `a`) vs. longest distractor `"4, like every family"` (20 chars), with two other distractors
being the bare digits `"1"` and `"3"` (1 char each).

**Fix:** Lengthened all 3 distractor labels to a matching length band while leaving their
(already long, misconception-laden) feedback strings and the correct label untouched:
- `` `4, like every family` `` → `` `4, since every family has that many` ``
- `` `1` `` → `` `1, as if the flip didn't count separately` ``
- `` `3` `` → `` `3, forgetting that one flip repeats itself` ``

**mcq-leakage:** before — `howManyFacts` ok=0/200 errors=0 nonMcq=0
`codes={"length-answer-explains-itself":200}`, detail `"32 chars vs longest distractor 20"`;
`familyDivide`/`shareThenGiveBack` already clean (non-MCQ). After — `howManyFacts` ok=400/400
errors=0 nonMcq=0 codes={}; other two forms unchanged (SEEDS=400 seed-sweep, all 3 forms).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "fact-family"` → **6 passed**, 0
failed.

**Outcome:** FIXED — 1 queued row closed (`variants.test.ts` untouched). Deferred: none for this
owner.

## g10-conditional-probability

**File:** `src/lib/statProbabilityVariantTemplates.json:977` (pool
`conditional-probability__cpr-table-union__mcq`, single entry) + mirrored in
`src/lib/statProbabilityIndependentAnswers.json:98`. `statProbabilityVariants.ts` TS-overrides 7
`__numeric` forms only (all other `__numeric`/`__mcq`/`matchPairs`/`dragBucket` forms, including
this one, fall through to the authored JSON bank via `generatorsFromAuthoredBank`) —
architecture 1 (JSON literal lookup), confirmed via `statProbabilityIndependent.cjs` reading
`statProbabilityIndependentAnswers.json` as a prompt→exact-label-string map.

**Oracle:** JSON literal lookup — prompt string keys directly to the correct label string; fully
editable as long as both files are mirrored character-for-character.

**Defect:** `length-prose-vs-prose`, `cpr-table-union__mcq` (only leaking form of 21 in this tag) —
correct label 80 chars vs. longest distractor 53 chars.

**Fix:** Trimmed the correct label, moving the dropped consequence clause into `feedback`:
- label: `"Those 40 students sit in both the row and the column, so they are counted twice."` →
  `"Because they sit in both the row and the column."`
- feedback: `"Exactly — 100 + 110 = 210, which overshoots the 170 shaded students by precisely
  those 40."` → `"Exactly — sitting in both means they're counted twice: 100 + 110 = 210, which
  overshoots the 170 shaded students by precisely those 40."`

Mirrored the label change verbatim into `statProbabilityIndependentAnswers.json`'s
`cpr-table-union__mcq` entry (same prompt key, same new answer string). Both files re-validated as
syntactically correct JSON after editing.

**mcq-leakage:** before — `cpr-table-union__mcq` ok=0/200 errors=0 nonMcq=0
`codes={"length-prose-vs-prose":200}`, detail `"80 chars vs longest distractor 53"`; all other 20
forms already clean. After — all 21 forms ok/clean, codes={} (SEEDS=400 seed-sweep, full tag).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "g10-conditional-probability"` →
**24 passed**, 0 failed. (Two session-specific test files also reference this tag —
`session246.conditionalProbabilityFreshness.test.ts` only exercises the untouched `__numeric`
form, and `session273.conditionalProbabilityCourse.test.ts` checks an unrelated lesson-body string
in `content/**` — neither touches the edited MCQ label, so neither was run.)

**Outcome:** FIXED — 1 queued row closed (`statProbabilityVariants.ts` and
`statProbabilityIndependent.cjs` untouched). Deferred: none for this owner.

## g12-function-analysis

**File:** `src/lib/precalculusVariantTemplates.json:1642,1763,1785` (pools
`function-analysis__fna-one-to-one__mcq` entry 0 and `function-analysis__fna-restricted__mcq`
entries 0 and 1) + mirrored in `src/lib/precalculusIndependentAnswers.json:144,152-153`.
`precalculusVariants.ts:1157-1173` TS-overrides 8 forms for this tag (all `numeric` /
`exactNumberLab` / `pointEntry`, confirmed via read — never `mcq`), so every `__mcq` form
(10 pools) falls through to the authored JSON bank — architecture 1 (JSON literal lookup).

**Oracle:** JSON literal lookup — prompt string keys directly to the correct label string in
`precalculusIndependentAnswers.json`; fully editable as long as both files are mirrored
character-for-character.

**Defect:** the queue's 1 row undercounted the actual leak surface — a full seed-sweep across all
20 forms found 2 leaking `__mcq` forms covering 3 of this owner's pool entries total (all in the
same generator family, so all fixed together per the "fix the owner's generator" mandate):
- `fna-one-to-one__mcq` entry 0 (prompt "Why does f(x) = x² ... have no inverse function?"):
  `length-prose-vs-prose`, correct 75 chars vs. longest distractor 34 chars. (63/200 draws hit
  this specific pool entry.)
- `fna-restricted__mcq` entry 0 (prompt "Which restriction ALSO makes f(x) = (x − 3)² ...?"):
  `length-prose-vs-prose`, correct 23 chars vs. longest distractor 10 chars.
- `fna-restricted__mcq` entry 1 (prompt "...What is the DOMAIN of f⁻¹(x) = √x?"):
  `length-answer-explains-itself`, correct 41 chars vs. longest distractor 16 chars (dash-explained
  pattern — a short lead clause followed by " — " and a justification).

**Fix:** Trimmed each correct label to match its distractors' bare notation/length band, moving
the dropped clause into `feedback` (already largely duplicated there in each case):
- `"An inverse would need to send 9 to both 3 and −3 — a function can't do that"` →
  `"It would send 9 to both 3 and −3"`; feedback gained the dropped "a function can't do that"
  clause.
- `"x ≤ 3 (the left branch)"` → `"x ≤ 3"`; feedback gained "that's the left branch."
- `"x ≥ 0 — the inverse's domain is f's range"` → `"x ≥ 0"`; feedback gained the dropped
  "the inverse's domain is f's range" clause.

Mirrored all three label changes verbatim into `precalculusIndependentAnswers.json`. Both files
re-validated as syntactically correct JSON after editing.

**mcq-leakage:** before — `fna-one-to-one__mcq` ok=137/200 errors=0 nonMcq=0
`codes={"length-prose-vs-prose":63}`; `fna-restricted__mcq` ok=0/200 errors=0 nonMcq=0
`codes={"length-answer-explains-itself":94,"length-prose-vs-prose":106}`; all other 18 forms
already clean. After — all 20 forms ok/clean, codes={} (SEEDS=400 seed-sweep, full tag).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "g12-function-analysis"` →
**23 passed**, 0 failed. Grepped `src/lib/*.test.ts` for the three edited literal strings — no
other test file references them.

**Outcome:** FIXED — 1 queued row closed, plus 2 additional same-owner leak instances the queue's
snapshot had not itemized (`precalculusVariants.ts` and `precalculusIndependent.cjs` untouched).
Deferred: none for this owner.

## g13-integration-accumulation

**File:** `src/lib/calculusVariants.ts:1517-1529` (`accumulationMcqWidget`, backing form
`integration-accumulation__in-accumulation__mcq`). `calculusVariants.ts:2884-2920,2986-2996`
TS-overrides 34 of this tag's 35 forms via `INTEGRATION_FOUNDATIONS_BUILDERS` (near-total
override); only unmapped forms would fall through to the JSON-authored bank at runtime.

**Oracle:** `calculusIndependent.cjs:495-499` (`solveIntegrationFoundation`, dispatched through
`solvePrompt`) — regex-extracts the dummy variable from the TS-built prompt and reconstructs the
full literal `` `${dummy} is the dummy variable of integration.` ``; exact-match, correct label
oracle-locked (architecture akin to #2/#4 combined — regex-extraction feeding a full-literal
reconstruction). Only distractors could be rewritten.

**Defect:** `length-prose-vs-prose`, `in-accumulation__mcq` (only leaking form of 35) — correct
label 39 chars (fixed length regardless of draw, since `dummy` is always a single letter) vs.
longest distractor 24 chars.

**Fix:** Lengthened all 3 distractor labels to match the correct label's ~39-40 char band while
preserving each one's distinct misconception and leaving feedback and the correct label untouched:
- `` `${dummy} is the upper endpoint.` `` → `` `${dummy} is the upper endpoint of the integral.` ``
- `` `${dummy} is a fixed constant.` `` → `` `${dummy} is a fixed constant, not a variable.` ``
- `` `${dummy} is the strip width.` `` → `` `${dummy} is the strip width used in each slice.` ``

**mcq-leakage:** before — `in-accumulation__mcq` ok=0/200 errors=0 nonMcq=0
`codes={"length-prose-vs-prose":200}`, detail `"39 chars vs longest distractor 24"`; all other 34
forms already clean. After — all 35 forms ok/clean, codes={} (SEEDS=400 seed-sweep, full tag).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "g13-integration-accumulation"` hit
**3 pre-existing failures** unrelated to this fix (35 other tests in the same run passed) — the
tag-wide gate test throws `Error: unrecognized dummy-variable prompt: In A(x) = ∫₀ˣ f(t) dt, what
is t?` from `calculusIndependent.cjs:497`. This is a separate, dead-but-still-gate-tested JSON
pool entry at `calculusVariantTemplates.json:3442-3470` (same form key, a completely different
authored prompt/option set using "∫₀ˣ" notation) whose phrasing the `ACCUMULATION_MCQ` regex was
never written to parse — confirmed pre-existing via `git diff --stat HEAD -- src/lib/
calculusVariants.ts src/lib/calculusIndependent.cjs` (only `calculusVariants.ts` differs, and only
at the 3 distractor-label lines shown above — `calculusIndependent.cjs` is byte-identical to HEAD)
plus `git show HEAD:src/lib/calculusVariantTemplates.json | grep -n "what is t?"` (found verbatim
at HEAD, line 3446, before any session edits). Re-ran with a narrower selector isolating just my
fixed form: `npx vitest run src/lib/variants.test.ts -t "in-accumulation"` → **2 passed**, 0
failed. Also ran the dedicated `npx vitest run src/lib/session246.integrationFoundationsFreshness.
test.ts` (unaffected by the pre-existing gap, since it drives the TS-override builders directly) →
**2 passed**, 0 failed.

**Outcome:** FIXED — 1 queued row closed (`calculusIndependent.cjs` untouched). Deferred: the
pre-existing `∫₀ˣ`-notation JSON pool entry's regex gap is unrelated to this defect class (a
prompt-parsing gap, not an option-shape leak) and out of this mission's scope — logged here for
visibility only, not counted against this owner's closure.

## g3-div-fluency

**File:** `src/lib/g3FluencyVariants.ts:295-303` (`divHandlers.DivZeroMcq`, form `DivZeroMcq`, tag
`g3-div-fluency`). **Eighth independent generator family discovered this session**:
`g3FluencyVariants.ts` (self-contained local `mcq()`/`num()` helpers, not imported from
`variants.ts`) paired with `g3FluencyIndependent.cjs`, aggregated into `VARIANT_GENERATORS` via
`variants.ts:29,39829`.

**Oracle:** `g3FluencyIndependent.cjs:5-8,69-71` — `exact(opts, label)` scans the option array for
one that `===` the fixed literal `"Undefined — division by zero has no answer"`; exact-match
architecture (like #4), correct label oracle-locked. Only distractors could be rewritten.

**Defect:** `length-answer-explains-itself`, `DivZeroMcq` (only leaking form of 12; `DivChooseMcq`
was already clean) — correct label 42 chars (dash-explained shape: short lead + " — " +
justification) vs. longest distractor 2 chars (bare digit strings `"0"`, `String(n)`, `"1"`).

**Fix:** Lengthened all 3 distractor labels into the same dash-explained shape and length band as
the correct label, preserving each one's distinct misconception:
- `"0"` → `"0 — dividing by zero gives nothing"`
- `` `${n}` `` → `` `${n} — dividing by zero repeats the number` ``
- `"1"` → `"1 — dividing by zero always equals one"`

**Regression found and fixed during verification:** the original bare-digit labels meant that when
`n === 1`, `String(n)` and the literal `"1"` distractor were IDENTICAL strings, so the `mcq()`
helper's built-in label dedup silently dropped one of them (only 2 wrong options ever rendered for
that draw) — which had been masking a separate, genuinely pre-existing bug: the two entries'
FEEDBACK strings ALSO degenerate to byte-identical text when `n === 1` (`` `If 1 ÷ 0 = 1, then 1 ×
0 would have to equal 1, but 1 × 0 = 0.` `` appears in both). Once the label fix above made all 3
distractors distinct (no more collision), both entries survived into the rendered options and the
dedicated `g3Fluency.sweep.test.ts` gate (`"traps are wrong and distinct"`) caught the now-exposed
duplicate feedback (`expected 2 to be 3`, i.e. only 2 distinct feedback strings among 3 wrong
options). Fixed by rewording the fixed-`"1"`-distractor's feedback so it can never textually
coincide with the `${n}`-distractor's feedback regardless of the drawn `n`: `` `If ${n} ÷ 0 = 1,
then 1 × 0 would have to equal ${n}, but 1 × 0 = 0.` `` → `` `Multiplying back doesn't work
either: 1 × 0 = 0, not ${n}, so ${n} ÷ 0 can't be 1.` ``.

**mcq-leakage:** before — `DivZeroMcq` ok=0/200 errors=0 nonMcq=0
`codes={"length-answer-explains-itself":200}`, detail `"42 chars vs longest distractor 2"`;
`DivChooseMcq` and all 10 numeric forms already clean. After — all 12 forms ok/clean, codes={}
(SEEDS=400 seed-sweep, full tag).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "g3-div-fluency"` → **15 passed**, 0
failed. `npx vitest run src/lib/g3Fluency.sweep.test.ts` (dedicated generator-level gate for this
family) → **38 passed**, 0 failed (after the feedback-uniqueness fix above; first run caught the
regression described above).

Also ran `npx vitest run src/lib/session186.fluencyPair.test.ts` (a `content/courses/
division-fluency-g3/**` lesson-integrity test) for completeness: **11 pre-existing failures**, all
unrelated to this fix — confirmed via `git diff --stat HEAD -- content/courses/
division-fluency-g3/` (zero changes; the course content is byte-identical to HEAD) plus manual
inspection of the failure causes: most are a reciprocal-value numeric-solver mismatch (`expected
0.111... to be 9`, i.e. divisor/dividend swapped) on authored `numeric`-widget steps unconnected to
`DivZeroMcq`, and one (`df3-03-02`) is a missing `predict` field on frozen lesson JSON, also
unconnected — this lesson's own MCQ options are static authored content copied at authoring time,
not re-derived from the live generator, so my label edit cannot reach them either way. Not
touched, per the standing "never touch `content/**`" constraint; logged for visibility only.

**Outcome:** FIXED — 1 queued row closed, plus 1 self-inflicted-then-immediately-fixed regression
caught by the dedicated sweep gate before it could ship (`g3FluencyIndependent.cjs` untouched).
Deferred: the `session186.fluencyPair.test.ts` content-integrity failures are pre-existing,
`content/**`-side, and out of this mission's scope.

## g4-measure

**File:** `src/lib/g4Variants.ts:601-603` (`measureHandlers.mcProtractorReadingMcq`, tag
`g4-measure`).

**Oracle:** `g4Independent.cjs:80` — `exact(w, 'The scale that begins with 0° on the right.')`;
exact-string architecture (#4), correct label oracle-locked. Only distractors could be rewritten.

**Defect:** `length-prose-vs-prose`, `mcProtractorReadingMcq` (only leaking form of 13) — correct
label 43 chars vs. longest distractor 24 chars.

**Fix:** Lengthened all 3 distractor labels to match the correct label's length band, preserving
each one's distinct misconception and leaving feedback untouched:
- `"Always the outer scale"` → `"Always read the outer scale instead."`
- `"Always the larger number"` → `"Always read the larger of the two numbers."`
- `"Add both scale readings"` → `"Add together both of the scale readings."`

**mcq-leakage:** before — `mcProtractorReadingMcq` ok=0/200 errors=0 nonMcq=0
`codes={"length-prose-vs-prose":200}`, detail `"43 chars vs longest distractor 24"`; all other 12
forms already clean. After — all 13 forms ok/clean, codes={} (SEEDS=400 seed-sweep, full tag).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "g4-measure"` → **16 passed**, 0
failed. Also ran the dedicated `npx vitest run src/lib/session196.measureProblemsG4.test.ts`
(loads `content/courses/measure-problems-g4/**`) → **18 passed**, 0 failed — no regression.

**Outcome:** FIXED — 1 queued row closed (`g4Independent.cjs` untouched). Deferred: none for this
owner.

## g7-sp-sampling-bias

**File:** `src/lib/variants.ts:36133-36212` (`tag: "g7-sp-sampling-bias"`, `forms: ["spBiasCivic",
"spBiasCustomer", "spBiasSchool"]`, all 3 forms sharing one `gen()` that only switches which
authored pool it draws from; edited entry at lines ~36170-36178, the `customer` pool's second
item).

**Oracle:** `variants.test.ts:1812-1817` — regex-fragment architecture (#3/#2 style): `` /^Randomly
select \d+ .+ from the complete /.test(label) `` finds whichever option matches this PREFIX
pattern and returns it as-is. Only the `"Randomly select N MEMBER from the complete "` prefix is
oracle-constrained; everything after "the complete " (i.e. the `frame` field's own tail text) is
free-form and safely editable.

**Defect:** `length-prose-vs-prose`, `spBiasCustomer` pool entry 1 (prompt "A delivery service
wants to estimate how satisfied all recent customers are...") — correct label 104 chars (bloated
by an overlong `frame` value, `"the complete customer list for deliveries completed in the past
month"`) vs. longest distractor 52 chars. (88/200 draws hit this specific pool entry; the tag's
other 2 forms and the customer pool's other entry were already clean.)

**Fix:** Shortened the `frame` field (which only feeds the oracle-safe tail of the correct label)
and moved the dropped "last month" detail into the `question` field instead (untouched by the
oracle, which matches only the option label):
- `frame`: `"the complete customer list for deliveries completed in the past month"` →
  `"the complete delivery customer list"`
- `question`: `"A delivery service wants to estimate how satisfied all recent customers are."` →
  `"A delivery service wants to estimate how satisfied last month's delivery customers are."`

Verified the regex still matches the shortened label (`"Randomly select N customers from the
complete delivery customer list"` still starts with `"Randomly select \d+ .+ from the complete
"`), and re-checked across the tag's full `sampleSizes` range (80–500) — all clean.

**mcq-leakage:** before — `spBiasCustomer` ok=112/200 errors=0 nonMcq=0
`codes={"length-prose-vs-prose":88}`, detail `"104 chars vs longest distractor 52"`;
`spBiasCivic`/`spBiasSchool` already clean. After — all 3 forms ok/clean, codes={} (SEEDS=400
seed-sweep, full tag).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "g7-sp-sampling-bias"` →
**6 passed**, 0 failed. Grepped `src/lib/*.test.ts` for the old/new `frame`/`question` text — no
other test file references them.

**Outcome:** FIXED — 1 queued row closed (`variants.test.ts` untouched). Deferred: none for this
owner.

## g8-tm-congruence

**File:** `src/lib/variants.ts:37877-37888` (`tag: "g8-tm-congruence"`, form
`tmCongruenceMeaning`).

**Oracle:** `variants.test.ts:9085-9086` — `.startsWith("All corresponding")`, both at the
tag-level route and the form-specific route (which just delegates to the tag-level one);
short-prefix match (architecture 3), trimmable — the prefix "All corresponding" must survive
verbatim, the rest is free.

**Defect:** `length-prose-vs-prose`, `tmCongruenceMeaning` (only leaking form of 4; the tag's
other 2 MCQ forms and its dragBucket form were already clean) — correct label 59 chars vs. longest
distractor 35 chars.

**Fix:** Trimmed the correct label to keep the oracle-required prefix, moving the dropped
elaboration into `feedback`:
- label: `"All corresponding side lengths and angle measures are equal"` → `"All corresponding
  sides and angles match"`
- feedback: `"Right — congruent figures match exactly after rigid motions."` → `"Right — every
  corresponding side length and angle measure is equal, since congruent figures match exactly
  after rigid motions."`

**mcq-leakage:** before — `tmCongruenceMeaning` ok=0/200 errors=0 nonMcq=0
`codes={"length-prose-vs-prose":200}`, detail `"59 chars vs longest distractor 35"`; other 3 forms
already clean. After — all 4 forms ok/clean, codes={} (SEEDS=400 seed-sweep, full tag).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "g8-tm-congruence"` → **7 passed**,
0 failed. Grepped `src/lib/*.test.ts` for the old label text — no other test file references it.

**Outcome:** FIXED — 1 queued row closed (`variants.test.ts` untouched). Deferred: none for this
owner.

## mult-patterns

**File:** `src/lib/variants.ts:34065-34093` (`tag: "mult-patterns"`, form `rowSubset`). Note: the
tag's `gen()` also has a 4th, unnamed fallback branch (commutative-property MCQ) reachable only
via `form === "default"`, which is NOT in the declared `forms: ["halfRow", "rowSubset",
"timesTableStep"]` array and so is outside this sweep's/the queue's scope — the queue's 1 row
matches the `rowSubset` leak exactly with no residual, so this was not investigated further.

**Oracle:** `variants.test.ts:8257-8271`, `"mult-patterns@rowSubset"` — reconstructs the full
literal `` `Each ${big} is ${factor} groups of ${small} — the ${big}s row takes every ${ordinal}
number of the ${small}s row` `` and requires exact match; correct label oracle-locked (architecture
3, full-literal-exact sub-variant). Only distractors could be rewritten. (Noted in passing, not
fixed: the oracle's `ordinal` — like the generator's own — collapses to `"third"` for factor values
of 3, 4, AND 5 alike, e.g. mislabeling factor-4/5 pairs; generator and oracle agree so this isn't a
leak, and fixing it would mean redesigning the generator's core math — out of scope, deferred.)

**Defect:** `length-answer-explains-itself`, `rowSubset` (only leaking form of 3) — correct label
75-78 chars (varies by the drawn `big`/`small`/`factor`) vs. longest distractor 47 chars.

**Fix:** Lengthened all 3 distractor labels to match the correct label's ~75-78 char band,
verified across all 8 authored `(big, small)` pairs, preserving each one's distinct misconception:
- `"Both rows have the same last digit"` → `"Both rows just happen to share the same last digit"`
- `"It is only a coincidence among small products"` → `"It is only a coincidence that shows up in
  small products"`
- `` `${big} is larger than ${small}` `` → `` `${big} is simply a larger number than ${small}` ``

**mcq-leakage:** before — `rowSubset` ok=0/200 errors=0 nonMcq=0
`codes={"length-answer-explains-itself":200}`, detail `"76 chars vs longest distractor 45"`;
`halfRow`/`timesTableStep` already clean (numeric). After — all 3 forms ok/clean, codes={}
(SEEDS=400 seed-sweep, full tag).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "mult-patterns"` → **6 passed**, 0
failed. Grepped `src/lib/*.test.ts` for the old distractor text — no other test file references it.

**Outcome:** FIXED — 1 queued row closed (`variants.test.ts` untouched). Deferred: the pre-existing
factor-4/5 ordinal-mislabeling quirk noted above is a core-math content-quality issue, not an
option-shape leak, and out of this mission's scope.

## nl-fraction

**File:** `src/lib/variants.ts:29681-29712` (`tag: "nl-fraction"`, form `whereLands`).

**Oracle:** `variants.test.ts:7145-7153`, `"nl-fraction@whereLands"` — `.startsWith("Exactly
halfway")`; short-prefix match (architecture 3), trimmable — the prefix must survive verbatim.

**Defect:** `length-answer-explains-itself`, `whereLands` (only leaking form of 3; `afterNthJump`
was already clean and `waterStops` is numeric) — correct label 38 chars vs. longest distractor 20
chars (`"A quarter of the way"`/`"One ${fraction} of the way"`, which varies 20-22 chars by the
drawn denominator).

**Fix:** Trimmed the correct label to keep the oracle-required prefix (dropping "— the same spot
as 1/2", already covered by `feedback`), and lengthened the other 2 distractors for a tighter,
more uniform band across the full `b ∈ {4,6,8,10,12}` range (chose to lengthen rather than rely on
a borderline pass against only the longest distractor):
- label: `"Exactly halfway — the same spot as 1/2"` → `"Exactly halfway along the trip"`
- `` `At the number ${a}` `` → `` `Landing exactly at the number ${a}` ``
- `"Almost at 1"` → `"Almost all the way, near 1"`

**mcq-leakage:** before — `whereLands` ok=0/200 errors=0 nonMcq=0
`codes={"length-answer-explains-itself":200}`, detail `"38 chars vs longest distractor 20"`;
`afterNthJump` already clean. After — all 3 forms ok/clean, codes={} (SEEDS=400 seed-sweep, full
tag; also spot-checked all 5 `b` values individually via the checker before applying).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "nl-fraction"` → **6 passed**, 0
failed. Grepped `src/lib/*.test.ts` for the old option text — no other test file references it.

**Outcome:** FIXED — 1 queued row closed (`variants.test.ts` untouched). Deferred: none for this
owner.

## opt-box

**File:** `src/lib/variants.ts:20473-20488` (`tag: "opt-box"`, form `uselessRoot`). Note: like
`mult-patterns`, the tag's `gen()` has a 4th, unnamed fallback branch (factor-V′ MCQ) reachable
only via `form === "default"`, outside the declared `forms: ["maxVolume", "uselessRoot",
"beatEndpoint"]` array and the queue's 1-row scope for this owner — not investigated further.

**Oracle:** `variants.test.ts:4377-4389`, `"opt-box@uselessRoot"` — reconstructs the full literal
`` `At x = ${at} the base is ${2*threeM} − ${2*at} = 0 — there is no box, and V = 0. It is the
degenerate edge of the domain.` `` and requires exact match; correct label oracle-locked
(architecture 3, full-literal-exact sub-variant). Only distractors could be rewritten.

**Defect:** `length-prose-vs-prose`, `uselessRoot` (only leaking form of 3; `maxVolume` and
`beatEndpoint` are numeric) — correct label 103-104 chars (varies with the drawn `m`) vs. longest
distractor 55 chars — the gap was large enough that a modest lengthening would not clear the 1.5×
threshold, so all 3 distractors needed substantial rewording.

**Fix:** Lengthened all 3 distractor labels into the 66-101 char band (verified across `m` = 2, 4,
9 spanning the full authored range), preserving each one's distinct misconception:
- `"Because it is a maximum too, and you can only have one."` → `"Because it is a maximum of the
  volume function too, and a function can only have one maximum overall."`
- `` `Because ${threeM} is not a critical point.` `` → `` `Because x = ${threeM} does not actually
  make the derivative equal to zero.` ``
- `"Because the derivative is wrong."` → `"Because the derivative was computed incorrectly and
  needs to be redone."`

**mcq-leakage:** before — `uselessRoot` ok=0/200 errors=0 nonMcq=0
`codes={"length-prose-vs-prose":200}`, detail `"104 chars vs longest distractor 55"`;
`maxVolume`/`beatEndpoint` already clean (numeric). After — all 3 forms ok/clean, codes={}
(SEEDS=400 seed-sweep, full tag).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "opt-box"` → **6 passed**, 0 failed.
Grepped `src/lib/*.test.ts` for the old distractor text — no other test file references it.

**Outcome:** FIXED — 1 queued row closed (`variants.test.ts` untouched). Deferred: none for this
owner.

## pr-constant-k-g7

**File:** `src/lib/variants.ts:2864-2871` (form `rrZeroAnchor`, inside the `g6RatioVariant(rand,
band, form)` helper that `tag: "pr-constant-k-g7"`'s `gen()` at line 34956 delegates to first, for
any of its 21 `rr*`-prefixed forms — `g6RatioVariant` is called exclusively from this one tag).

**Oracle:** `variants.test.ts:655` (`g6RatioRoute`), line 693: `.startsWith("The stacked marks
stop")`; short-prefix match (architecture 3), trimmable — the prefix must survive verbatim.
Reached via the tag-level `"pr-constant-k-g7"` route (`variants.test.ts:2094-2096`), which
delegates to `g6RatioRoute` first before its own parsing.

**Defect:** `length-prose-vs-prose`, `rrZeroAnchor` (only leaking form of 25) — correct label 85
chars vs. longest distractor 46 chars.

**Fix:** Trimmed the correct label to keep the oracle-required prefix, moving the dropped
elaboration into `feedback`:
- label: `"The stacked marks stop sharing one multiplier, so the pairs are not equivalent ratios"`
  → `"The stacked marks stop sharing a common ratio"`
- feedback: `"Correct — the offset changes proportional scaling into addition. Both lines must
  share the zero anchor."` → `"Correct — the offset changes proportional scaling into addition, so
  the pairs stop sharing one multiplier and are no longer equivalent ratios. Both lines must share
  the zero anchor."`

Verified across the form's full `offset ∈ {1,2,3}` range — all clean, tightly banded (45-46 chars
across all 3 options).

**mcq-leakage:** before — `rrZeroAnchor` ok=0/200 errors=0 nonMcq=0
`codes={"length-prose-vs-prose":200}`, detail `"85 chars vs longest distractor 46"`; all other 24
forms already clean. After — all 25 forms ok/clean, codes={} (SEEDS=400 seed-sweep, full tag).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "rrZeroAnchor"` (narrowed selector)
→ **1 passed**, 0 failed — this fix in isolation is clean. The wider `-t "pr-constant-k-g7"`
selector surfaced **4 pre-existing failures unrelated to this fix**, all in the tag's OTHER 4
forms (`constantWhole`, `constantFraction`, `constantUse`, `constantApply`) — none of which this
session has ever touched. Root cause: those 4 forms (and 3 other tags') widgets are rewritten at
module-load time by `upgradeProportionalVariant`/`proportionalUpgradeConfig` (`variants.ts:
39876-39965`) from plain `mcq`/`numeric` into a `proportionalReasoningLab` widget shape, whose
independent truth-check (`proportionalReasoningTruth`, imported from `./schema`) disagrees with
`evaluate()`'s own grading (`expected false to be true` at `variants.test.ts:11841`,
deterministic/reproducible on every re-run). Confirmed pre-existing and disconnected from this
owner's fix via `git diff --stat HEAD -- src/lib/variants.ts src/lib/schema.ts src/lib/
evaluate.ts` showing zero changes to `schema.ts`/`evaluate.ts` and zero changes to the wrapper
logic or the 4 failing forms' own source (`constantWhole`/`constantFraction`/`constantUse`/
`constantApply` — my diff touches only `rrZeroAnchor`, in the unrelated `g6RatioVariant` helper,
which the wrapper's `proportionalUpgradeConfig` never matches and so is never wrapped).

**Outcome:** FIXED — 1 queued row closed (`variants.test.ts` untouched). Deferred: the 4
pre-existing `proportionalReasoningLab`-wrapper/`evaluate()` disagreements are a widget-evaluation
correctness gap, not an option-shape leak, and fixing it would mean touching `schema.ts`'s
core evaluation logic — out of this mission's scope, logged for visibility only.

## read-clock

**File:** `src/lib/variants.ts:30945-30972` (`tag: "read-clock"`, form `hourBetween`).

**Oracle:** `variants.test.ts:7773-7779`, `"read-clock@hourBetween"` — reconstructs the full
literal `` `Halfway between the ${hour} and the ${hour + 1}` `` and requires exact match; correct
label oracle-locked (architecture 3, full-literal-exact sub-variant). Only distractors could be
rewritten.

**Defect:** `length-prose-vs-prose`, `hourBetween` (only leaking form of 2; `readHands` already
clean) — correct label 31-33 chars (varies with the drawn `hour`) vs. longest distractor 16-17
chars.

**Fix:** Lengthened all 3 distractor labels to the 28-39 char band (verified across `hour` = 1, 9,
10, 11 spanning the full authored range including the 2-digit-hour edge cases), preserving each
one's distinct misconception:
- `` `Exactly on the ${hour}` `` → `` `Right on the ${hour}, not moving yet` ``
- `"On the 6"` → `"Pointing at the 6, like the minute hand"`
- `` `Exactly on the ${next}` `` → `` `Already all the way at the ${next}` ``

**mcq-leakage:** before — `hourBetween` ok=0/200 errors=0 nonMcq=0
`codes={"length-prose-vs-prose":200}`, detail `"31 chars vs longest distractor 16"`; `readHands`
already clean. After — both forms ok/clean, codes={} (SEEDS=400 seed-sweep, full tag).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "read-clock"` → **5 passed**, 0
failed. Grepped `src/lib/*.test.ts` for the old distractor text — only `variants.resolver.test.ts`
references the tag name, and only for an unrelated band-difficulty mapping (`"read-clock":
"early"`), not option content — not run.

**Outcome:** FIXED — 1 queued row closed (`variants.test.ts` untouched). Deferred: none for this
owner.

## scatter-features

**File:** `src/lib/variants.ts:25703-25734` (`tag: "scatter-features"`, form `clusterCorner`).

**Oracle:** `variants.test.ts:5952-5961`, `"scatter-features@clusterCorner"` — reconstructs the
full literal `` `Many items share similar ${xWord} x-values and ${yWord} y-values` `` and requires
exact match; correct label oracle-locked (architecture 3, full-literal-exact sub-variant). Only
distractors could be rewritten.

**Defect:** `length-prose-vs-prose`, `clusterCorner` (only leaking form of 2; `sortFeatures` is a
dragBucket) — correct label 54-56 chars (varies with the drawn corner) vs. longest distractor 27
chars.

**Fix:** Lengthened all 3 distractor labels to the 43-51 char band (verified across all 3 authored
corners: lower-left, upper-right, upper-left), preserving each one's distinct misconception:
- `"There is an outlier"` → `"There is a single outlier far from the rest"`
- `"The association is negative"` → `"The overall association between x and y is negative"`
- `"The form is nonlinear"` → `"The overall form of the pattern is nonlinear"`

**mcq-leakage:** before — `clusterCorner` ok=0/200 errors=0 nonMcq=0
`codes={"length-prose-vs-prose":200}`, detail `"56 chars vs longest distractor 27"`; `sortFeatures`
already clean. After — both forms ok/clean, codes={} (SEEDS=400 seed-sweep, full tag).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "scatter-features"` → **5 passed**,
0 failed. Grepped `src/lib/*.test.ts` for the old distractor text — no other test file references
it.

**Outcome:** FIXED — 1 queued row closed (`variants.test.ts` untouched). Deferred: none for this
owner.

## variable-meaning

**File:** `src/lib/variants.ts:12753-12765` (`tag: "variable-meaning"`, form `independentPay`).

**Oracle:** `variants.test.ts:9707`, `"variable-meaning@independentPay"` — `x === "h (hours
worked)"`, a fully static literal (doesn't even vary with the drawn `rate`); exact-string
architecture (#4), correct label oracle-locked. Only distractors could be rewritten.

**Defect:** `length-prose-vs-prose`, `independentPay` (only leaking form of 11) — correct label 16
chars vs. longest distractor 3 chars (bare `"pay"` and the bare numeral `${rate}`).

**Fix:** Lengthened both distractor labels to match the correct label's `"value (description)"`
syntactic shape and length band, verified across the form's full `rate` range (6, 9, 15):
- `"pay"` → `"pay (the total earned)"`
- `` `${rate}` `` → `` `${rate} (the hourly rate)` ``

**mcq-leakage:** before — `independentPay` ok=0/200 errors=0 nonMcq=0
`codes={"length-prose-vs-prose":200}`, detail `"16 chars vs longest distractor 3"`; all other 10
forms already clean. After — all 11 forms ok/clean, codes={} (SEEDS=400 seed-sweep, full tag).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "variable-meaning"` → **14 passed**,
0 failed. Grepped `src/lib/*.test.ts` for `independentPay` and the old distractor text — no other
test file references them.

**Outcome:** FIXED — 1 queued row closed (`variants.test.ts` untouched). Deferred: none for this
owner.

## g12-trig-identities-equations (retroactive entry)

This owner's fix (3 queued rows) was applied and verified correct earlier in this session, but its
report section was lost — most likely during one of the placeholder-insertion mistakes documented
for other owners (accidentally inserted under an earlier heading, then reverted). Re-verified from
scratch just now, with fully current numbers, rather than left undocumented.

**File:** `src/lib/precalculusVariantTemplates.json:8908-8914` (`ti-general__mcq`, prompt "The
GENERAL solution of cos x = 1/2 is:"), `:8967-8972` (`ti-prove__mcq`, prompt "After rewriting, the
left side (sin θ/cos θ)·cos θ becomes:"), `:9518-9523` (`ti-tan-ladder__mcq`, prompt "The general
solution of sin x = 0 is best written as:") + all 3 mirrored in
`src/lib/precalculusIndependentAnswers.json`. No TS override exists for this tag in
`precalculusVariants.ts` (confirmed via grep — zero matches) — pure JSON-authored-bank tag,
architecture 1 (JSON literal lookup), fully editable both ways.

**Fix:** Trimmed each correct label, moving the dropped elaboration into `feedback`:
- `ti-general__mcq`: `"x = π/3 + 2πk or x = 5π/3 + 2πk"` → `"x = ±π/3 + 2πk"`; feedback gained the
  dropped `"the same as x = π/3 + 2πk or x = 5π/3 + 2πk"` clause.
- `ti-prove__mcq`: `"sin θ — the proof is complete"` → `"sin θ"`; feedback gained "the proof is
  complete."
- `ti-tan-ladder__mcq`: `"x = πk (one merged family)"` → `"x = πk"`; feedback gained "one merged
  family."

All 3 mirrored verbatim into `precalculusIndependentAnswers.json` (confirmed matching on
re-inspection just now).

**mcq-leakage (current, re-verified):** `SEEDS=200` seed-sweep, full tag, 25 forms — all clean,
codes={} (no leak reproducible from the current file state).

**Targeted test:** `npx vitest run src/lib/variants.test.ts -t "g12-trig-identities-equations"` →
**28 passed**, 0 failed (re-run just now).

**Outcome:** FIXED (confirmed via retroactive re-verification) — 3 queued rows closed
(`precalculusVariants.ts` and `precalculusIndependent.cjs` untouched). Deferred: none for this
owner.
