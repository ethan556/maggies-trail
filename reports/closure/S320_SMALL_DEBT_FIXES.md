# S320 — Small Debt Fixes: 3 Bounded Lesson Repairs

Bounded fix-up packet closing the two open-debt items recorded in
`reports/closure/S319_EARLY_MID_VERIFICATION.md` (discrepancy 1: `ns-01-01/k3` "wait" fragment;
discrepancy 2: `g4m-02-03/ch1` vs. `g4m-02-05/k1` cross-lesson accidental repetition) plus the
`vm-04-01`/`box-layers` collateral-drift discrepancy recorded in
`reports/closure/S319_FIG_HS_VERIFICATION.md` (discrepancy 1). Per
`reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`: repository source and the two verifier reports are
authoritative; the fixes below are truth-first and additive only.

Scope: exactly 3 lesson files, plus (item 1 only) additive `src/components/figures.tsx` /
`src/components/figureIds.ts` work. No other file was edited. (The working tree also carries
unrelated, in-progress changes to `content/courses/place-value-1000/*`,
`PREMIUM_PENDING_WORKLOAD_QUEUE*`, and `reports/mcq/MCQ_LEAKAGE_INDEX.csv` from a concurrent,
independent lane — confirmed by reading their diffs, none of which touch this packet's 3 lessons
or figures.tsx; they are not part of this packet and were left untouched.)

Deliverables: this report + `reports/closure/cowork-staging/laneA-s320-smalldebt.jsonl` (4 NDJSON
records — item 2 produced two step-level fixes in one file, recorded as two lines sharing one
`sha256After`).

## Item 1 — `vm-04-01` / `c1` figure truth (`box-layers` → new `vm-sixty-cube-box`)

**Defect** (`S319_FIG_HS_VERIFICATION.md`, discrepancy 1): `box-layers` is shared by two lessons.
`asv-05-01` owns it and was correctly parameterized by S319 to a 3×2-base/4-layer (24-cube)
render. `vm-04-01/c1`'s prose ("a 4-by-3 base holds 4 × 3 = 12 cubes... 5 layers hold 12 × 5 = 60
cubes") never matched `box-layers` on either side of that edit (18 cubes before, 24 after) — a
pre-existing, unrelated mismatch the S319 figure packet correctly declined to fix (out of its
contract scope) and flagged forward.

**Investigation.** Read `BoxLayers()` (`src/components/figures.tsx`) directly: it is a fixed,
non-parameterized function (no props) hardcoding a 3×2×4 isometric cube stack for `asv-05-01`.
`vm-04-01/k1`'s own check widget (`answer: 60`, "12 per layer × 5 layers = 60 cubic units") and
`i1`'s widget ("base is 4 cubes long and 3 cubes wide... answer 12") both depend on the literal
4×3×5=60 numbers, so realigning the *prose* to the figure (rather than the figure to the prose)
would have broken those checks — truth-first therefore means fixing the figure binding, per the
task's own preference order.

**Fix (additive, house-style).** Added a new, self-contained component `VmSixtyCubeBox()` next to
the lesson's existing sibling figure `VmBaseLayers` (used by `vm-04-01/c2`, same file/course
region) — an isometric 4-column × 3-row × 5-layer cube stack (180 `<polygon>` elements = 5 × 4 × 3
× 3 faces/cube), reusing `BoxLayers`'s established cube-drawing convention (same fill tokens,
same accented-bottom-layer semantics) but as an independent function — `BoxLayers` itself was not
modified, so `asv-05-01`'s already-verified binding is untouched. Registered as
`"vm-sixty-cube-box"` in the `FIGURES` map (inserted after `"vm-base-layers"`). `figureIds.ts`
regenerated via `node scripts/gen-figure-ids.mjs` (2015 ids, +1). `vm-04-01/c1.figure` rebound from
`"box-layers"` to `"vm-sixty-cube-box"` — the only field changed in the lesson file.

Screen-reader `<title>`: "A box built from unit cubes: the base layer is 4 by 3 cubes, stacked 5
layers high, for 60 cubes in all; the highlighted bottom layer shows the base." (states 60 cubes,
per instructions; phrased in words rather than a literal `4 × 3 = 12`/`12 × 5 = 60` equation so it
does not register as an "exact arithmetic title" claim — confirmed below). Visible on-figure text
does show the full arithmetic (`base layer: 4 × 3 = 12`, `12 × 5 = 60 cubes`) since only `<title>`/
`aria-label` feed the alignment/adversarial checks, not general SVG `<text>`.

**Verification** (scratch `npx tsx --tsconfig scripts/audit/tsconfig.figure-ssr.json` probe, deleted
after use, per the established S319-verifier convention):
- `FIGURES`/`FIGURE_IDS` both carry `vm-sixty-cube-box`; `box-layers` unchanged and still registered.
- Rendered polygon count: 180 (= 4 × 3 × 5 × 3, hand-verified expected value).
- `isFigureTextAligned("vm-sixty-cube-box", <live c1.body>)` → **true** (called for real, not
  reimplemented).
- `figureTextBindingKey(...)` → `f6e49387`, **not** present in
  `FIGURE_TEXT_MISMATCH_BLOCKLIST`.
- Independent re-derivation of the adversarial `risks()` conflict logic (part-count / operation /
  example-number) against the real rendered description vs. the real `c1.body` → `[]` (zero
  conflicts); `adversarial_decision` → `PASS`. `figureNumbers {4,3,5,60} ⊂ lessonNumbers
  {4,3,12,5,60}` (not disjoint).
- `asv-05-01`'s own figure bindings re-read directly from source: still exactly
  `{c1: "box-layers", c2: "box-layers"}` — unchanged.
- `npx tsx scripts/audit/generate-figure-numeric-claims.mts --check` → `CURRENT 193 exact
  arithmetic-title claims` (unchanged from the pre-fix S319 count — the new title deliberately
  does not qualify as an exact-arithmetic claim, so no generated-claims drift was introduced).
- `npx vitest run src/components/figureTextAdversarialAudit.test.tsx` → **1 passed** (0 REVIEW
  rows; blocklist/manual-hold assertions all pass; this is the actual repo test, not a
  reimplementation).
- `npx tsc --noEmit` → clean, no errors.

## Item 2 — `g4m-02-05` / `k1` cross-lesson duplicate of `g4m-02-03` / `ch1`

**Defect** (`S319_EARLY_MID_VERIFICATION.md`, discrepancy 2): `g4m-02-03/ch1` and `g4m-02-05/k1`
both presented 1,393 ÷ 7 = 199 with byte-identical `answer`, `commonErrors` (values + feedback),
`tolerance`, and `unit` — prompt framing was the only difference.

**Duplication scan** (scratch Node script, deleted after use; cross-lesson, all-pairs — not just
consecutive-step, closing the gap the original `DIG4_MDF4` assessor's method left): extracted a
normalized-digit signature (every number in `prompt`/`answer`/`target`/`a`/`b`/`commonErrors`
values/`commonResults` values/mcq option labels, sorted) for all 14 widget-bearing steps across
both lesson files (`steps` + `remedials`). Pre-fix: **1 collision** — exactly the flagged pair,
signature `[7,19,199,1393,1990]`. A second, stronger scan (numeric-widget exact fingerprint:
`answer`+`tolerance`+`unit`+sorted `commonErrors` values) found the *same* fingerprint on a
**third**, previously-unflagged step: `g4m-02-05`'s own remedial (`rem-g4m-3div1-k`), which also
used 1,393 ÷ 7 = 199 (with a "use 1,400 ÷ 7 as a benchmark" scaffold). Fixing only `k1` would have
left this remedial as a new, still-live duplicate of `g4m-02-03/ch1`'s exact fact — so both were
changed together (the remedial is `k1`'s dedicated scaffolded retry, keyed to the same
`conceptTag`, so it must keep tracking `k1`'s numbers to remain internally coherent).

**Fix** (`g4m-02-05` only — `g4m-02-03/ch1` left byte-for-byte canonical/untouched, confirmed via
`git diff --stat`, empty). New fact: **1,752 ÷ 8 = 219** (hand-verified: 219 × 8 = 1,752). Traps
recomputed following the exact template already shared by every sibling numeric-quotient check in
both files (`×10` slide, and the ones-digit-dropped truncation):
- `commonErrors[0].value`: 2,190 (= 219 × 10), feedback template reused verbatim ("slid the
  quotient one place too far left").
- `commonErrors[1].value`: 21 (= ⌊219 / 10⌋), feedback re-derived for the new dividend ("every
  place of 1752 has to be divided in turn").
- `successFeedback`: "Correct — 219."
- Remedial `prompt` benchmark: "1,760 ÷ 8" (1,752 + one more divisor-worth = 1,760; 1,760 ÷ 8 =
  220), mirroring the original's exact pattern (1,393 + 7 = 1,400; 1,400 ÷ 7 = 200 — a benchmark
  that overshoots the true quotient by exactly 1, same as the original).
- `hints`, `explanationVariants`, `fallbackFeedback` template, `cml` block, `conceptTag`,
  `variant.gen`/`form`, and every other step: unchanged.

**Post-fix duplication scan** (re-run): normalized-digit signatures now **14/14 distinct, 0
collisions** across both lessons. (The `k1` ↔ its-own-remedial numeric fingerprint still matches
by design — that is the pre-existing, intentional "same check, added benchmark scaffold"
relationship every other check/remedial pair in these two lessons already uses, not the
cross-lesson accidental-repetition defect class.)

**Verification**: `python3 -c "import json; json.load(...)"` parse-check on `g4m-02-05.json` →
OK. Arithmetic hand/script-verified: `1752/8=219`, `219*8=1752`, `219*10=2190`, `219//10=21`,
`1752+8=1760`, `1760/8=220`. Real `Lesson` Zod schema + real `lintLesson` (via `npx tsx`, both
`src/lib/schema.ts` / `src/lib/pedagogy.ts` imported directly, not reimplemented) on both
`g4m-02-05.json` and `g4m-02-03.json` → schema-valid, 0 lint findings, both files.

## Item 3 — `ns-01-01` / `k3` scratch-text fragment

**Defect** (`S319_EARLY_MID_VERIFICATION.md`, discrepancy 1): `k3.explanationVariants[0]` read:
*"Six eighths holds 3 pairs the size of 2/8 each — **wait, count directly**: 6/8 ÷ 2/8 asks how
many 2/8-pieces fit in 6/8, which is 3."* — a leftover scratch/self-correction fragment, never
named in `ns-01-01`'s own `S319_ASSESS_TSE_NS.md` contract (which scoped only the remedial
value/feedback mismatch and the `k2` label-length leak, both already fixed by S319), so S319
correctly left it untouched and flagged it forward.

**Values verified before rewriting**: `k3`'s widget is "A 6/8-meter strip is cut into pieces that
are 2/8 meter long. How many equal pieces fit?", `answer: 3`. Check: 6/8 ÷ 2/8 = 6 ÷ 2 = 3
(same-denominator division reduces to numerator ÷ numerator); 3 × 2/8 = 6/8 ✓ — matches the
widget's own `fallbackFeedback` ("Three 2/8-pieces make up 6/8: 3 × 2/8 = 6/8.") and
`commonErrors` (4 and 12, both explicitly refuted in-file). The "3" and "2/8" values referenced by
the fragment were already correct; only the leftover scratch phrasing needed cleanup.

**Fix**: replaced `explanationVariants[0]` with clean, precise text that keeps the mathematically
sound "asks how many X fit in Y" framing already used elsewhere in this exact lesson (e.g. `k1`'s
own second variant), drops the "wait, count directly" fragment and the imprecise word "pairs"
(reworded to "pieces", matching the widget's own prompt/fallback wording), and stays worded
differently from `explanationVariants[1]` (no new near-duplicate introduced):

> "Six eighths holds exactly 3 pieces the size of 2/8 each: 6/8 ÷ 2/8 asks how many 2/8-pieces fit
> in 6/8, which is 3."

No other field in `k3` (id, `conceptTag`, widget, `commonErrors`, `hints`, `variant`) touched.
Grepped the file afterward for `wait[,:]|scratch|todo|fixme|xxx` (case-insensitive): no remaining
matches.

**Verification**: `python3 -c "import json; json.load(...)"` parse-check → OK. Real `Lesson` Zod
schema + real `lintLesson` → schema-valid, 0 lint findings.

## Cross-cutting verification (run once, covers all 3 items)

- Parse-check: all 3 edited files (`vm-04-01.json`, `g4m-02-05.json`, `ns-01-01.json`) plus the
  untouched `g4m-02-03.json` parse as valid JSON.
- Real `Lesson` Zod schema (`src/lib/schema.ts`) + real `lintLesson` (`src/lib/pedagogy.ts`), run
  via `npx tsx` against all 4 files above: **4/4 schema-valid, 0/4 lint findings.**
- `git diff --stat` scoped to exactly the 5 intended files (`vm-04-01.json`, `g4m-02-05.json`,
  `ns-01-01.json`, `figures.tsx`, `figureIds.ts`) — no collateral edits; `g4m-02-03.json` diff is
  empty (confirmed untouched/canonical).
- Because `figures.tsx` was touched (item 1): `npx vitest run
  src/components/figureTextAdversarialAudit.test.tsx` → **1 passed**; `npx tsc --noEmit` → clean.
  No other `npm`/`vitest`/`tsc` command was run.
- All scratch probe scripts (`scripts/audit/_tmp_probe_s320_item1.mts`,
  `_tmp_probe_s320_item2_scan.mjs`, `_tmp_probe_s320_schema.mts`) were deleted immediately after
  use; none are part of this packet's output.

## IDs / conceptTags / evaluator semantics preserved

No lesson `id`, step `id`, `conceptTag`, `variant.gen`/`form`, or `cml` block was changed in any
of the 3 files. No mcq `correct`-first ordering was touched (items 2 and 3 touch only numeric
widgets / explanation text). No feedback-length or reveal invariant was weakened. Item 1 is a
figure-registration change only (additive; `box-layers` itself byte-unchanged).

## Raw data

- NDJSON: `reports/closure/cowork-staging/laneA-s320-smalldebt.jsonl` (4 records).
- Base commit: `ae399cc647fedf3f0a0db1aadfeb4cc04d3b90c1` (working tree on top of it).
- Changed-file sha256 (16-hex prefix, before → after):
  - `content/courses/volume-measurement/lessons/vm-04-01.json`: `5ed56706924170ab` →
    `1b27d9f0cb198bb7`
  - `content/courses/mult-div-fluency-g4/lessons/g4m-02-05.json`: `21a0f2eeb39ff5dc` →
    `71e4497a72b19d69`
  - `content/courses/number-system/lessons/ns-01-01.json`: `8857a59632ff967e` →
    `491f2d14e3b3cc2e`
  - `src/components/figures.tsx`: `ab62d6a2400eaebc` → `8208988253feb53e`
  - `src/components/figureIds.ts`: `bbe8ffc93ee50f62` → `91281b4109fb8346`
