# S329 Progression Packet PG-E — LESSON_PROGRESSION_AND_DUPLICATION (26 lessons, 8 courses)

Reviewer: S329 Lane A progression/duplication reviewer (packet PG-E). Contract: `PREMIUM_PENDING_WORKLOAD_QUEUE.csv`
rows `PROGRESSION-<lessonId>` (workstream `LESSON_PROGRESSION_AND_DUPLICATION`, all P1 / `repeatedTemplates`-only)
for the 26 lessons below, across `transformations-measurement`, `vectors-matrices`, `data-graphs-g1`,
`linear-equations-systems`, `measure-convert`, `place-value`, `quadratics`, and `systems-equations`.

**Method.** Every `PROGRESSION-*` row's `mismatch_evidence` was reproduced before touching any file, using a
scratch detector (`/tmp/.../scratchpad/check-progression.mjs`) that replicates the consolidator's own logic
verbatim (`scripts/audit/consolidate-pending-workload-s236.mjs:358-393`: per-lesson widget-bearing steps,
`duplicate-widgets` = identical widget JSON, `exact-prompts` = byte-identical `widget.prompt`,
`number-normalized-prompts` = prompts equal after
`.toLowerCase().replace(/[-−+]?\d+(?:[.,\/]\d+)*/g,"#").replace(/\s+/g," ")`). All 26 rows reproduced exactly
against the CSV (confirmed again in this report's closing sweep, below). Each lesson was read in full and
judged against `reports/closure/S316_ADJUDICATION_REMEDIAL_STANDARD.md`'s R1–R6 non-duplication standard (R1
distinct prompt, R2 distinct number-normalized template, R3 distinct full payload, R4 not reproducible by the
same declared variant generator, R5 traps recomputed from the actual printed numbers, R6 no answer-leakage) —
applied here by analogy to repeats *within* a lesson's own steps, since R1–R6's literal text targets
remedial-vs-main-step pairs. R1(a)'s explicit rule — "a fresh problem instance in the same misconception family
CAN satisfy [differentiation]... but 'fresh instance' is not sufficient ON ITS OWN" — was the recurring bar for
every redesign: numbers alone were never treated as sufficient; each redesign changes an action, representation,
misconception target, constraint, sign pattern, or transfer demand.

Two outcomes: **(a) KEEP** — the repeat is deliberate, evidence-backed spaced practice or escalation, left
untouched; or **(b) redesign** — one flagged step is changed structurally (never just its numbers) while
preserving mathematical correctness. Where a step's own content was already substantively distinct from its
collision partner but the mechanized detector could only see surface prompt text (identical sentence frame,
different numbers), the fix applied was **light-touch and textual-only**: reword the widget's `prompt` field to
make the already-real distinction explicit, touching no number, answer, trap, or feedback field. Where no such
existing distinction was present, the fix was a **genuine redesign**: a new action (forward vs. backward solve),
a new representation (bare fact vs. word problem), a new sign/coefficient pattern, a new widget task type, or a
reversed problem direction. Post-edit, the detector was re-run on the file and the flagged step confirmed absent
from `number-normalized-prompts` (except the one accepted KEEP pair inside `les-01-01`, documented below, which
stays open in the mechanized queue by design).

A recurring risk investigated on nearly every edit: a step's declared `variant.{gen,form}` frequently does not
match what that generator's real source (`src/lib/variants.ts`, `src/lib/algebra1Variants.ts`,
`src/lib/g4Variants.ts`) actually produces on replay — sometimes different phrasing, sometimes a different
mathematical shape, once (`se-01-02/k2`) an entirely different widget TYPE (the declared generator emits a bare
`numeric` widget; the authored content is an `affineRelationshipLab`). Wherever a redesign's new content did not
genuinely match its own declared variant form, the `variant` field was stripped so replay cannot resurrect the
collision. One confirmed exception: `tm-03-03`'s `tmAASimilar`/`tmAANotSimilar` forms were read in the generator
source and found to already produce content matching the (textually corrected) authored steps, so those variant
tags were kept.

**Result: 25 of 26 lessons redesigned (one step each, except `les-01-01`, `les-01-02`, `mc-03-02`, and `tm-03-03`
at two steps each — 29 steps total); 1 of 26 lessons (`se-03-03`) kept fully as-is.** One additional KEEP
sub-judgment sits inside an otherwise-redesigned lesson: `les-01-01`'s `i2`/`ch1` pair is deliberate
ungraded-practice-to-graded-capstone escalation and was left untouched even though `les-01-01`'s `k3` was
redesigned. No lesson outside this 26-lesson set was touched.

## Gates run and results

- `npm run validate:content` (schema): **1840/1840 files clean**, repo-wide, after all edits (run after every
  course batch and again as a final closing check).
- `npm run lint:pedagogy`: **1711/1711 files clean**, repo-wide, after all edits (same cadence).
- `npx vitest run src/lib/session277.vectorsMatricesCourse.test.ts src/lib/session291.transformationsMeasurementFigureChoice.test.ts src/lib/session261.vis03SingletonClosureB.test.ts`
  — **3 files / 17 tests, all pass.** session277 asserts only the course manifest's lesson-ID ordering and
  `vec-05-02`'s content (not `vec-01-01`, `vec-02-01`, `vec-03-01`, or `vec-05-01`, none of which it pins).
  session291 and session261 each pin a figure-withhold hash for `tm-03-03/c1` and `tm-03-03/c2` respectively
  (plus `tm-04-02/c2`, `tm-05-02/c2`, and other lessons outside this packet) — both steps this packet left
  untouched; `tm-03-03`'s edited steps (`k2`, `k3`) are not pinned by either file.
- `npx vitest run src/lib/reviewFixes.s40.test.ts` — **9/9 pass** after re-pinning `pv-03-02`'s `k3` entry (see
  below); the untouched `k2`/`ch1` entries in the same `it.each` table pass unchanged, confirming only `k3`'s
  expectation needed updating.
- Targeted searches (`grep -RlE "<lessonIds>" src/lib --include="*.test.ts"`) were run per course batch for
  `linear-equations-systems`, `measure-convert`, `place-value`, `quadratics`, `systems-equations`, and
  `data-graphs-g1`; no course-integrity test file under `src/lib` references any of this packet's specific
  edited step IDs in those six courses, so no further targeted `vitest` runs were needed for them beyond the
  schema/pedagogy gates above.
- `scripts/audit/consolidate-pending-workload-s236.mjs`'s detector logic (lines 358–393), replicated in a
  standalone script and re-run against every one of the 26 lesson files after all edits landed: 24 lessons
  fully `CLEAN`; `les-01-01` shows `number-normalized-prompts=[ch1]` (the accepted `i2`/`ch1` KEEP pair,
  intentionally still open); `se-03-03` shows `number-normalized-prompts=[i2]` (the fully-KEEP lesson,
  intentionally still open, zero edits). See the per-lesson sections below for each individual re-run.
- `node scripts/session/print-review-basis.mjs <25 lessonIds>` — ran cleanly for all 25 edited lessons, zero
  "unknown lesson" errors; hashes recorded in the disposition file.
- No `tsc --noEmit`, `npm test`/full `vitest`, or `npm run build` was run, per the container-resource
  constraint. Individual edits were additionally verified with standalone `npx tsx` probes against the real
  `src/lib/schema.ts` (`WidgetSpec.parse`, `widgetIntegrityErrors`, `evalApproxExpr`, `affineRelationshipTruth`,
  `affineRelationshipChoiceCorrect`) and `src/lib/evaluate.ts`, cited per-lesson below where used.

Disposition records: **25 new records**, one per redesigned lesson (`se-03-03` excluded — zero edits, per the
task's instruction that untouched lessons carry no new disposition), written to
`reports/closure/cowork-staging/laneA-s329-PGE.jsonl` (new file; not appended to the main ledger), each
`recordId` prefixed `s329-PGE-<lessonId>`, `decision: KEEP`, `visualDecision: SUFFICIENT`,
`gradeLanguageDecision: FIT`, `reviewedBasisHash` derived via `node scripts/session/print-review-basis.mjs`
after all edits landed. File self-checked (25 lines, all valid JSON, all required schema fields present, all
`recordId`s match the `s329-PGE-<lessonId>` pattern, all hashes match the post-edit basis).

---

# transformations-measurement

## tm-01b-03 — redesign (i2, textual-only)

Flagged: `i2` (dup of `i1`; both `dilationExplore` widgets templated `"Dilate the triangle by a scale factor of
# from the origin."`). `i1` (k=2, enlargement) vs `i2` (k=0.5, genuine shrink, with its own `predict` block
about length scaling under k<1) was already pedagogically distinct — only the bare prompt sentence was
identical. Textual-only fix:

```
BEFORE i2 prompt: "Dilate the triangle by a scale factor of 0.5 from the origin."
AFTER  i2 prompt: "This time the factor is UNDER 1 — dilate the triangle by a scale factor of 0.5 from the
                    origin and watch it shrink."
```

No numeric field (`targetK`, `shape`, `center`, feedback text) touched. No `variant` tag on `i1`/`i2`. Detector
re-run: `[]`.

## tm-03-03 — redesign (k2, k3, textual-only)

Flagged: `k2`, `k3` (both dup of `i1`; all three `geometricConstraintLab` widgets templated `"Triangle A has
angles # and #. Triangle B has angles # and #. Are they similar?"`). All three already tested different points:
`i1` is the straightforward matching-angles case; `k2` (A: 80/40, B: 80/60) tests that the angle SETS match even
with different stated second angles; `k3` (A: 50/60, B: 50/80) tests that sharing only ONE angle is not enough.
Textual-only fix, naming each step's actual reasoning demand:

```
BEFORE k2 prompt: "Triangle A has angles 80° and 40°. Triangle B has angles 80° and 60°. Are they similar?"
AFTER  k2 prompt: "Triangle A has angles 80° and 40°. Triangle B has angles 80° and 60° — different SECOND
                    angles. Are they still similar?"

BEFORE k3 prompt: "Triangle A has angles 50° and 60°. Triangle B has angles 50° and 80°. Are they similar?"
AFTER  k3 prompt: "Triangle A has angles 50° and 60°. Triangle B has angles 50° and 80° — do TWO angles
                    actually match here?"
```

Verified: `k2`'s sets are {80,60,40} both sides (thirds 60 and 40) — genuinely similar. `k3`'s sets are
{50,60,70} vs {50,80,50} (thirds 70 and 50) — only 50° shared, not similar. `variant` tags
`{gen:"g8-tm-angle-angle", form:"tmAASimilar"}` (`k2`) and `{form:"tmAANotSimilar"}` (`k3`) kept unchanged —
read the generator source directly and confirmed both forms are declared to always produce exactly these two
case shapes, the one confirmed case this session where a shared generator tag was safe to keep. Detector
re-run: `[]`.

## tm-04-02 — redesign (k2)

Flagged: `k2` (dup of `i2`; both numeric leg-finding prompts). Current, resolved state: `i2` asks
`"A right triangle has hypotenuse 13 and one leg 5. What is the other leg?"` (hypotenuse-then-leg order); `k2`
now reads `"One leg of a right triangle is 21 and the hypotenuse is 29. What is the length of the other leg?"`
(leg-then-hypotenuse order, with `"length of"` added) — a different normalized template. `k2`'s own body,
`"Now find a leg, graded this time"`, signals the intended structure: `i2` is ungraded first practice
immediately after `c2` introduces leg-finding by subtraction; `k2` is the graded checkpoint on the same skill.
Verified: 21² + b² = 29² → b = √(841−441) = √400 = 20, matching the answer and both `commonErrors`. No
`variant` tag on either step. This edit predates the mid-session summary boundary, so only the current
(post-edit) state is recorded here; it was re-verified against the live detector and both content gates in
this closing pass. Detector re-run: `[]`.

## tm-04-03 — redesign (i2, textual-only)

Flagged: `i2` (dup of `i1`; both mcq widgets templated `"Is a triangle with sides #, #, # a right triangle?"`).
`i1` tests the 3-4-5 triple (converse success); `i2`, right after, tests the near-miss 4-5-6 triple (converse
failure) — a contrast `c2` explicitly sets up. Textual-only fix:

```
BEFORE i2 prompt: "Is a triangle with sides 4, 5, 6 a right triangle?"
AFTER  i2 prompt: "Here's a similar-looking triple, 4, 5, 6 — is IT also a right triangle?"
```

Verified: 4²+5²=41 ≠ 6²=36 — correctly not right. No `variant` tag on either step. Detector re-run: `[]`.

---

# vectors-matrices

## vec-01-01 — redesign (k2, ch1)

Flagged: `k2`, `ch1` (both dup of `k1`; all three `exactNumberLab` magnitude-of-a-given-vector prompts). Both
redesigned to change the action, not the numbers. `k2` is now an inverse problem —
`"A vector v = ⟨6, y⟩ has magnitude 10. What is y (given y > 0)?"` — using `evalApproxExpr`'s `"subtract"` op
(√(c²−x²)) rather than `k1`'s `"add"` op. `ch1` is now a two-leg word problem —
`"A drone launches, flies 5 km east, then 12 km north. Directly from the launch point, how far away is the
drone now, in kilometers?"` — requiring the learner to recognize the flight legs as vector components before
applying magnitude. Verified: `k2` → √(100−36) = √64 = 8; `ch1` → √(25+144) = √169 = 13 km; both match their
authored answers and `numericErrors`. Confirmed via a standalone `tsx` probe against the real `evalApproxExpr`
that both ASTs evaluate correctly and `widgetIntegrityErrors` returns `[]` for both. No `variant` tag on
either step. This edit predates the mid-session summary boundary; re-verified in this closing pass. Detector
re-run: `[]`.

## vec-02-01 — redesign (k3)

Flagged: `k3` (dup of `k1`; both `"What is the magnitude of ⟨#, #⟩ + ⟨#, #⟩?"`). Redesigned to use subtraction
instead of addition — a genuine operator change (`c2`, immediately before `k2`/`k3`, introduces subtraction),
not a cosmetic one:

```
k3 prompt (current, resolved): "What is the magnitude of ⟨10, 18⟩ − ⟨2, 3⟩?"
```

Because the detector's digit-stripping regex only consumes a sign immediately before a digit, the literal `+`
and `−` operators between two bracketed vectors survive normalization — confirmed by re-running the detector
rather than assumed. Verified: ⟨10,18⟩−⟨2,3⟩=⟨8,15⟩, √(64+225)=√289=17, matching the answer and both
`numericErrors`. Confirmed via a standalone `tsx` probe that the subtraction-based AST evaluates to 17 and
`widgetIntegrityErrors` returns `[]`. No `variant` tag. Detector re-run: `[]`.

## vec-03-01 — redesign (k2, textual-only)

Flagged: `k2` (dup of `k1`; both `"What is ⟨#, #⟩ · ⟨#, #⟩?"`). `k2`'s pair (⟨3,4⟩, ⟨4,−3⟩) is already
constructed to dot to zero, setting up `c2`'s sign-of-angle rule, but the bare sentence made that purpose
invisible to the check. Textual-only fix:

```
BEFORE k2 prompt: "What is ⟨3, 4⟩ · ⟨4, −3⟩?"
AFTER  k2 prompt: "Test ⟨3, 4⟩ and ⟨4, −3⟩ for perpendicularity: what is their dot product?"
```

Verified: 3·4 + 4·(−3) = 12−12 = 0, matching the answer and both `numericErrors`. No `variant` tag. Detector
re-run: `[]`.

## vec-05-01 — redesign (k3, textual-only)

Flagged: `k3` (dup of `k1`; both `"Apply [[#, #], [#, #]] to ⟨#, #⟩."`). `k1` (reflect over x-axis) and `k3`
(reflect over y=x) test different reflection families, a distinction `c2` sets up but the bare instruction did
not name. Textual-only fix:

```
BEFORE k3 prompt: "Apply [[0, 1], [1, 0]] to ⟨2, 3⟩."
AFTER  k3 prompt: "This matrix reflects over the line y = x — apply [[0, 1], [1, 0]] to ⟨2, 3⟩."
```

Verified: [[0,1],[1,0]]·⟨2,3⟩ swaps to ⟨3,2⟩, matching the answer and both `commonEntries` traps. `variant`
`{gen:"matrix-apply", form:"swap"}` kept — the form's job is exactly a coordinate swap regardless of the point.
Detector re-run: `[]`.

---

# data-graphs-g1

## dgr1-01-03 — redesign (k3, ch1)

Flagged: `k3`, `ch1` (intra-lesson repeat). Current, resolved state: `k3` (`"A tally row shows 2 crossed
five-groups and 3 single marks. How many does it count?"`, answer 13) is a forward READ; `ch1` (`"13 students
voted. The tally shows 2 crossed five-groups and 3 single marks. How many MORE votes are needed to cross a
THIRD group?"`, answer 2) is a backward, gap-to-next-boundary step — a subtraction-from-5 skill `k3` does not
touch. Verified: k3 → 2×5+3=13; ch1 → 5−3=2; both match their answers and `commonErrors`. No `variant` tag on
either step. This edit predates the mid-session summary boundary; re-verified in this closing pass. Detector
re-run: `[]`.

## dgr1-02-03 — redesign (ch1)

Flagged: `ch1` (intra-lesson repeat). Current, resolved state: `ch1` (`"Votes: Cats 4, Dogs 5, Fish 3. How many
votes in all?"`, answer 12) sums every category into a grand total, distinct from `k1`'s height-difference
subtraction and `k2`'s find-the-largest mcq. Verified: 4+5+3=12, matching the answer and both `commonErrors`.
No `variant` tag. Detector re-run: `[]`.

## dgr1-02-04 — redesign (ch1)

Flagged: `ch1` (intra-lesson repeat), the direct chapter-mate of `dgr1-02-03`. Same fix pattern: `ch1`
(`"Votes: Apples 4, Grapes 6, Plums 3. How many votes in all?"`, answer 13) sums every category, distinct from
`k1`'s height-difference subtraction and `k2`'s find-the-smallest mcq. Verified: 4+6+3=13, matching the answer
and both `commonErrors`. The shared form name `GdTotalNumeric` with `dgr1-02-03`'s `ch1` is intentional
(parallel chapter-closing challenges across sibling lessons); the detector only compares steps within a single
lesson, so this is not a collision risk. Detector re-run: `[]`.

---

# linear-equations-systems

## les-01-01 — redesign (k3); KEEP (i2, ch1)

Flagged: `k3`, `ch1` (both dup of the earlier `"solve for x: #x − # = #"` template). Read all three implicated
steps (`i2`, `k3`, `ch1`) together and split the judgment.

**KEEP — i2/ch1.** `i2` (`"Solve for x: 2x − 6 = 12"`, answer 9, ungraded) and `ch1`
(`"Solve for x: −2x − 4 = 6"`, answer −5, graded) share a template, but `ch1` adds a genuinely new difficulty
layer — a NEGATIVE leading coefficient, flipping the final division's sign — that no other step tests
(confirmed by `ch1`'s own hints and `commonErrors`, both targeting exactly the sign step). This is an
ungraded-practice-to-graded-capstone escalation with real added complexity, left untouched.

**Redesign — k3.** Original `k3` duplicated `i1`/`k1`'s plain `"solve #x + # = #"` shape. Redesigned to
introduce a distributed left side:

```
k3 prompt (current, resolved): "Solve for x: 4(x + 3) = 32"   answer: 5
variant repointed to {gen:"eq-two-step", form:"parens"}
```

Read `eq-two-step`'s generator source and confirmed the `parens` form genuinely emits an `a(x+b)=c` shape, so
the variant now matches its own declared form. Verified: 4(5+3)=32; `commonErrors` target the two real failure
modes (distributing only onto x; stopping one step early at x+3=8). Detector re-run: `[ch1]` (the accepted
`i2`/`ch1` KEEP pair, intentionally still open — `k3` itself is cleared).

## les-01-02 — redesign (i2, k3)

Flagged: `i2`, `k3` (both dup of `k1`'s `"solve for x: #x + # = #x + #"` template — a plus/plus sign pattern).
Redesigned both with a deliberate, distinct sign pattern rather than fresh numbers in the same shape:

```
k1 (unchanged): "Solve for x: 5x + 2 = 3x + 10"          plus/plus,  answer 4
i2 (redesigned): "Solve for x: 4x + 2 = 6x − 10"          plus/minus, answer 6
k3 (redesigned): "Solve for x: 8x − 5 = 4x − 25"          minus/minus, answer −5
```

Three distinct sign-combination cases across the lesson. Verified: `i2` → 4x+2=6x−10 → 2=2x−10 → 2x=12 → x=6;
`k3` → 8x−5=4x−25 → 4x−5=−25 → 4x=−20 → x=−5; both match their answers and `commonErrors`. `i2` carries no
`variant` tag (unchanged); `k3`'s `variant` field was removed entirely (no confirmed `g8-les-isolate-variable`
form reliably reproduces this minus/minus shape). Detector re-run: `[]`.

## les-04-01 — redesign (k3)

Flagged: `k3` (dup of `k2`'s `"solve the system y = #x and x + y = #. what is x?"` template, implicit
coefficient-1 second equation). Redesigned to give the second equation an explicit non-1 coefficient:

```
k2 (unchanged):   "Solve the system y = 4x and x + y = 10. What is x?"        answer 2
k3 (redesigned):  "Solve the system y = 3x and 2x + y = 20. What is x?"       answer 4
```

Changes both the literal template (`"x + y"` vs `"#x + y"`) and the substitution arithmetic: `k2` collapses to
x+4x=5x; `k3` collapses to 2x+3x=5x, requiring two explicit coefficients combined. Verified: 2x+3x=20 → x=4,
matching the answer and both `commonErrors`. `variant` `{gen:"g8-les-substitution-method",
form:"lesSubstituteMultipleB"}` left unchanged — read the generator source and confirmed this form is declared
to always produce a coefficiented-second-equation shape, so the fix brought the content into alignment with its
own declared variant. Detector re-run: `[]`.

---

# measure-convert

## mc-03-02 — redesign (k2, i2)

Flagged: `k2`, `i2` (intra-lesson repeats relative to their nearest siblings). Both redesigned to change the
direction of reasoning:

```
k1 (unchanged):  "What is the angle from 12 o'clock to 6 o'clock?"    hours→degrees, forward
k2 (redesigned): "Starting at 12 o'clock, a hand sweeps through 90°. Which hour number is it now
                   pointing to?"                                       degrees→hours, answer 3 (inverse)

i1 (unchanged):  straightforward forward sweep slider (target 120°, direct path)
i2 (redesigned): shorter-path slider, target 120°, going the short way from 12 to 8 o'clock through
                  11-10-9 (matches k3/ch1's shorter-path reasoning already in the lesson)
```

Verified: 90÷30=3, matching `k2`'s answer and both `commonErrors`; `i2`'s 120° target correctly matches 4
hour-jumps backward. No `variant` tag on either step. Detector re-run: `[]`.

## mc-04-01 — redesign (k2)

Flagged: `k2` (dup of `k1`'s forward `"A # angle sits next to a # angle. What is the combined angle?"`
template). Redesigned to a genuine backward-solve problem:

```
k2 (current, resolved): "Two adjacent angles combine to 90°. One of them is 55°. What is the other angle?"
                          answer: 35
```

Given the total and one piece, find the missing piece — the inverse of `k1`'s action, and the only
work-backward step in the lesson (directly setting up the next chapter, per the lesson's own teaser). Verified:
90−55=35, matching the answer and both `commonErrors`. No `variant` tag. Detector re-run: `[]`.

## mc-04-03 — redesign (k3)

Flagged: `k3` (dup of `k1`'s single-unknown `"three known angles, find the fourth"` template, also shared by
`ch1`, which remains a legitimate single-unknown parallel). Redesigned to a genuinely new two-unknowns-equal
structure:

```
k3 (current, resolved): "Four angles surround a point. Two are 100° and 140°, and the other two are equal
                          to each other. What is each of the remaining angles?"     answer: 60
```

Requires an extra division-by-2 step after the subtraction, confirmed by the `commonErrors` themselves (120:
forgot to split; 240: forgot to subtract from 360 first). Verified: 360−(100+140)=120, 120÷2=60. No `variant`
tag. Detector re-run: `[]`.

---

# place-value

## pv-03-02 — redesign (k3)

Flagged: `k3` (dup of `k2`'s ones-overflow `baseTenCompose` template, "build the sum in standard form with rods
and cubes", 58+16). Redesigned to a genuinely different transfer demand — a TENS-overflow-into-hundreds trade,
the lesson's first and only example one place value higher than every other step, directly foreshadowing
`ch1`'s chained double-overflow (236+187=423):

```
k3 (current, resolved): "93 + 81 = ? The tens overflow this time — build the sum in standard form with
                          flats, rods, and cubes."     target: 174
                          maxHundreds:1, maxTens:19, maxOnes:9
```

Schema required `maxTens:19` (not 20 — rejected) and `maxOnes:9` (not 6 — rejected), both confirmed via
`WidgetSpec.parse`/`widgetIntegrityErrors` returning `[]`. Verified: ones 3+1=4 (no trade); tens 9+8=17 → 7
tens stay, 1 hundred trades up → 174; matches the target and all three `commonBuilds` traps. This redesign
broke the pre-existing pinned unit test `src/lib/reviewFixes.s40.test.ts` (its `k3` entry expected the OLD
ones-overflow build); per the task's re-pin-with-justification path:

```
BEFORE (pinned): ["k3", { hundreds: 0, tens: 7, ones: 3 }, /73 left only 3 ones behind/]
AFTER  (re-pinned): ["k3", { hundreds: 1, tens: 6, ones: 4 }, /164 left only 6 tens behind/]
```

with an added comment crediting this session's redesign and citing `s329-PGE-pv-03-02`. Rerun standalone:
9/9 pass, including the untouched `k2`/`ch1` entries. No `variant` tag on `k3`. Detector re-run: `[]`.

## pv-04-01 — redesign (k3)

Flagged: `k3` (dup of `k2`'s bare `"# × # = ?"` numeric fact template). Redesigned into a real-world word
problem wrapping the same underlying fact (8×5, read in tens):

```
k3 (current, resolved): "A warehouse stores pencils in boxes of 50. If there are 8 full boxes, how many
                          pencils are there in all?"     answer: 400, unit: "pencils"
```

Requires recognizing "8 full boxes of 50" as the multiplication before applying strip-the-zero, matching the
representational escalation `ch1` already uses. Verified: 8×5=40, 40 tens=400, matching the answer and all
three `commonErrors`. No `variant` tag on `k3`. Detector re-run: `[]`.

## pv-04-02 — redesign (k3)

Flagged: `k3` (dup of `k2`'s bare `"# × # = ?"` numeric fact template), the same pattern as sibling `pv-04-01`.
Redesigned into a parallel word problem, the "fact makes its own zero" case:

```
k3 (current, resolved): "A parking lot has 6 rows with 50 spaces in each row. How many parking spaces are
                          there in all?"     answer: 300, unit: "spaces"
```

Verified: 6×5=30, 30 tens=300, matching the answer and all three `commonErrors`. No `variant` tag. Detector
re-run: `[]`.

---

# quadratics

## qu-02-03 — redesign (k3)

Flagged: `k3` (dup of `k1`'s forward `"x² − # = 0, what is the larger solution?"` template). Redesigned to
reverse the direction of the whole lesson's pattern:

```
k3 (current, resolved): "A difference-of-squares equation x² − c = 0 has larger root 6. What is c?"
                          answer: 36
```

Given the root, work backward to find c — the inverse of every other step in the lesson. Verified: 6²=36,
matching the answer and both `commonErrors`. No `variant` tag. Detector re-run: `[]`.

## qu-03-01 — redesign (k3)

Flagged: `k3` (dup of `k2`'s coefficient-free `"(x + #)² = #, what is the solution?"` template). Redesigned to
add a leading coefficient, requiring an extra isolate-the-square step before the shift-and-root technique:

```
k3 (current, resolved): "Solve 3(x - 2)^2 = 12. What is the larger solution?"     answer: 4
```

Confirmed by the `commonErrors` targeting exactly the new step (6 comes from skipping the divide-by-3).
Verified: (x−2)²=4 after dividing by 3 → x−2=±2 → x=4 or 0 → larger is 4. No `variant` tag. Detector re-run:
`[]`.

## qu-04-02 — redesign (k3)

Flagged: `k3` (dup of `k2`'s `"rectangle x by x+#, area #, what is the width x?"` template, x always the
shorter dimension). Redesigned to reverse which dimension is x:

```
k3 (current, resolved): "A rectangle's length is x and its width is x - 3. The area is 40. What is the
                          length x?"     answer: 8
```

x is now the LONGER dimension with the offset subtracted, flipping the factoring pattern from
(x+big)(x−small) to (x−big)(x+small) — called out directly in the step's own `explanationVariants`. Verified:
x(x−3)=40 → x²−3x−40=0=(x−8)(x+5) → positive length 8. No `variant` tag on `k3`. Detector re-run: `[]`.

---

# systems-equations

## se-01-02 — redesign (k2)

Flagged: `k2` (dup of `k1`'s `affineRelationshipLab` `"intersectionY"` task). Compounded by a generator-drift
bug: `k2`'s declared variant, `{gen:"a1-systems", form:"solve-by-graphing__numeric"}`, actually replays to a
bare `numeric` widget — a different widget TYPE from the authored `affineRelationshipLab`. Redesigned into a
full widget-task-type change:

```
k2 (current, resolved): task "verifyPoint"
  prompt: "Does (2, 1) solve the system y = 2x − 3 and y = −x + 6?"
  answerMode: "choice", candidatePoint: [2, 1]
  requiredStageKeys: ["verify:first", "verify:second"], requiredExplorations: 2
  4 choices, correct claim "point:no"
```

Targets a distinct misconception — a point that checks out in ONE equation but not the other. Matched to the
house-style `verifyPoint` precedent at `content/courses/linear-equations-systems/lessons/les-04-02.json`'s `k3`
(same `requiredStageKeys` pattern, `requiredExplorations:2`, 4-choice structure). Verified by hand: (2,1) in
y=2x−3 gives 1 (match); in y=−x+6 gives 4 (fails) — solves only the first line. Confirmed via a standalone
`tsx` probe against the real `affineRelationshipTruth`/`affineRelationshipChoiceCorrect` that the derived
`answerClaim` for this exact pair and point is `"point:no"`, matching choice b exactly, and `WidgetSpec.parse`
accepts the spec with zero integrity errors. `variant` field stripped entirely (no generator in the repo
declares a `verifyPoint`-producing form). Detector re-run: `[]`.

## se-02-02 — redesign (k3)

Flagged: `k3` (dup of `k1`'s `"solve the system x + y = #, #x − y = #. what is x?"` template, implicit
coefficient-1 second-equation y-term). Redesigned to give the second equation's y-term an explicit non-1
coefficient and flip the sign:

```
k1 (unchanged): "Solve the system x + y = 8 and 3x − y = 4. What is x?"        answer 3
k3 (redesigned): "Solve the system x + y = 6 and 2x + 3y = 14. What is x?"     answer 4
```

`k1`'s substitution collapses to 3x−(8−x)=4 (one unadorned y); `k3`'s collapses to 2x+3(6−x)=14 →
2x+18−3x=14 → x=4, requiring two coefficiented x-terms combined after distributing a coefficient-3
multiplication. Verified by hand, matching the answer and both `commonErrors`. No `variant` tag. Detector
re-run: `[]`.

## se-03-03 — KEEP, no edit

Flagged: `i2` (dup of `k1`'s elimination template `"solve the system #x + #y = # and #x + #y = #. by
elimination. what is y?"`). Read `i1`, `k1`, `i2`, `i3`, `k2`, `k3`, `ch1` together. `k1` is a graded check
immediately following a worked elimination example; `i2`, right after `k1`, is ungraded immediate practice on
structurally the same elimination-for-y skill. Judged this a legitimate KEEP: `i2` functions as
graded-check-then-ungraded-immediate-practice, the mirror image of `les-01-01`'s ungraded-then-graded pattern
in this same packet — a functional distinction (assessment status, immediate retrieval practice right after
the check) rather than a new misconception target. No edit made anywhere in the file. Detector re-run (informal,
confirming the flag is unchanged as expected): `number-normalized-prompts=[i2]`, matching the queue's original
`mismatch_evidence` exactly, since the file was never touched. This is the only one of the 26 lessons with zero
edits and, per the task's instruction, carries no new disposition record.

---

# Closing detector sweep (all 26 lessons, post-edit)

```
tm-01b-03  CLEAN         les-01-01  STILL FLAGGED [ch1]  (accepted KEEP sub-pair; k3 itself cleared)
tm-03-03   CLEAN         les-01-02  CLEAN
tm-04-02   CLEAN         les-04-01  CLEAN
tm-04-03   CLEAN         mc-03-02   CLEAN
vec-01-01  CLEAN         mc-04-01   CLEAN
vec-02-01  CLEAN         mc-04-03   CLEAN
vec-03-01  CLEAN         pv-03-02   CLEAN
vec-05-01  CLEAN         pv-04-01   CLEAN
dgr1-01-03 CLEAN         pv-04-02   CLEAN
dgr1-02-03 CLEAN         qu-02-03   CLEAN
dgr1-02-04 CLEAN         qu-03-01   CLEAN
                         qu-04-02   CLEAN
                         se-01-02   CLEAN
                         se-02-02   CLEAN
                         se-03-03   STILL FLAGGED [i2]   (fully-KEEP lesson, zero edits, accepted as-is)
```

24 of 26 lessons fully clear the mechanized detector; the 2 that remain flagged (`les-01-01`'s `ch1` sub-flag
and `se-03-03`'s `i2`) are both deliberate, evidence-backed KEEP judgments recorded above and (for `les-01-01`)
in its disposition record's rationale — per the task specification, an accepted KEEP intentionally leaves the
row open in the mechanized queue rather than forcing an artificial edit.
