# S318 Lane A — G3 mult/div WITHHELD figure clearance
## division-fluency-g3, multiplication-division, word-problems-g3

Worker: Claude Cowork implementation. Obeyed `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`
byte-for-byte: repository source is authoritative; `reports/vis/VIS01_PLACEMENTS.csv` (cause !=
RENDERS) is the binding evidence for this packet's 19 named placements. Method follows the protocol
proven in `reports/closure/S317_FIGURE_TRUTH_FIXES.md` (the cpr-03-03/cpr-05-01 worked examples).

Scope: `src/components/figures.tsx` (additive only — 5 new typed-props helper functions, 11 new
zero-arg wrapper components, 11 new `FIGURES` map entries), figure-ID registration
(`src/components/figureIds.ts`, regenerated via `node scripts/gen-figure-ids.mjs` — never
hand-edited), the renderer-derived numeric-claims map (`src/lib/figureNumericClaims.generated.ts`,
regenerated via `npx tsx scripts/audit/generate-figure-numeric-claims.mts` — never hand-edited; see
"Numeric-claims regeneration" below), the 16 named lesson JSONs, the new test file
`src/components/s318G3Figures.test.tsx`, this report, and
`reports/closure/cowork-staging/laneA-s318-g3-figures.jsonl`.
`src/lib/figureTextMismatchBlocklist.generated.ts` and `.manualHolds.ts` were **not edited** — every
placement clears by making the (figureId, body) pair genuinely not blocklisted, never by touching the
blocklist itself.

## The repetition: mult3-missing-factor and mult3-fact-family

`mult3-missing-factor` appears in 8 of the 19 placements (7 in division-fluency-g3, 1 in
word-problems-g3) and `mult3-fact-family` in 1 more (division-fluency-g3). Read every one of those 9
bodies before deciding anything: they are **not** interchangeable generic prose next to one shared
fixed exemplar (4 × ▢ = 12 / 3, 4, 12). Each lesson step teaches its own real division/multiplication
fact:

| placement | stated fact |
|---|---|
| df3-01-04 c1 | generic (no numbers) → bound to this chapter's own leading fact, 6 × 7 = 42 (i1/predict already teach it) |
| df3-01-04 remedial | 6 × 5 = 30 |
| df3-02-01 c1 | generic (no numbers) → bound to this chapter's own leading fact, 8 × 9 = 72 |
| df3-02-03 c1 | 7 × 8 = 56 ("56 ÷ 7 asks 7 × ? = 56") |
| df3-02-03 remedial | 7 × 7 = 49 |
| df3-02-04 c1 | 6 × 9 = 54 |
| df3-02-04 remedial | 8 × 7 = 56 |
| df3-03-03 remedial (fact-family) | 5 × 7 = 35 |
| g3w-02-01 c2 | 6 × 7 = 42 ("6 × n = 42") — same fact as df3-01-04 c1 |

Forcing all 9 bodies to restate 4/3/12 (or 3/4/12) would be false for 7 of the 9 and would still
force a body edit for the other 2. Per the task's decision rule, the truthful pattern is a
**parameterized additive component**: `Mult3MissingFactorExample({ a, b })` (product computed as
`a * b`; same `a × ▢ = product, so ▢ = b` layout, `role="img"`, a `<title>`, and an aria-label
stating the real numbers in words) and `Mult3FactFamilyExample({ a, b })` (same triangle layout,
generalized). Each distinct `(a, b)` pair gets one zero-arg wrapper component and one new figure ID;
`(6, 7)` is reused verbatim by both df3-01-04 c1 and g3w-02-01 c2 since they teach the identical
fact. This yields **7 new missing-factor instances covering 8 placements** and **1 new fact-family
instance covering 1 placement**, instead of 9 separate prose rewrites.

**Title convention (why these new figures don't newly gate future text):** the original
`Mult3MissingFactor`/`Mult3FactFamily`/`Mult3Estimate` components all keep their `<title>` free of
digits (`"Division finds the missing factor."`, `"Estimate to check the answer."` — the fact-family
title `"A fact family from 3, 4, and 12."` has digits but no operator/`=`, so it still doesn't parse
as arithmetic). `scripts/audit/generate-figure-numeric-claims.mts` only admits a figure to
`FIGURE_NUMERIC_CLAIMS` when its `<title>` asserts an operator/equals claim
(`isExactArithmeticTitle`). The new missing-factor and fact-family wrappers follow the same
convention (numbers live only in the visible SVG `<text>` and the `aria-label`, not the `<title>`),
so they stay outside `FIGURE_NUMERIC_CLAIMS` and are governed only by the (now brand-new, unblocked)
`FIGURE_TEXT_MISMATCH_BLOCKLIST` key — exactly the same governance the original fixed component had.
This matters concretely for g3w-02-01 c2, whose body ("Writing 6 × n = 42...") never states the
answer 7 as a digit (the lesson is deliberately introducing variable notation before revealing the
solve) — had the new figure's title carried the full "...so ▢ = 7" claim, the renderer-derived
numeric-claims map would have picked it up and then withheld this exact placement for a *new*
reason (missing atom "7"). Keeping titles digit-free avoids manufacturing a fresh defect while
fixing the old one.

`mult3-fair-shares` (mult-02-01 c2 → 15 ÷ 5 = 3), `number-line-jumps` (mult-02-03 c2 → 7 hops of
5 = 35), and `mult3-estimate` (mult-04-05 c2 → 6 × 9 ≈ 6 × 10 = 60) each got one similar
parameterized instance where the lesson's own worked example genuinely differs from the fixed
exemplar (verified case-by-case below — these three *are* newly admitted to `FIGURE_NUMERIC_CLAIMS`,
or already were, since their titles do assert arithmetic; their bound bodies already stated the
matching digits, so alignment holds regardless).

## Reworded-prose fixes (7 placements, no new component)

Where the fixed exemplar's own numbers were already the lesson's genuine teaching content — just
missing a digit, missing the final `= product`, or citing a genuinely different but non-essential
example that a same-lesson sibling step already replaces — the smaller, S317-precedented fix
(reword prose to state the figure's real numbers) was used instead of adding a new figure:

- **mult-01-02 c2** (`mult3-array`, fixed 4×6=24): original example stated 4×3=12 (matching this
  lesson's own k1 mcq, not the figure). Reworded to 4×6=24, which also happens to match this same
  lesson's k3 choir mcq verbatim.
- **mult-01-03 c1** (`number-line-jumps`, fixed 3-hops-of-4=12): content already matched (4, 8, 12)
  but never spelled the hop count "3" as a digit. Added "— 3 equal hops of 4".
- **mult-01-04 c2** (`number-line-jumps`): generic formula prose ("hops × hop length = landing
  spot... start at 0") false-positive-triggered the numeric-claim guard via its "×"/"="/"0" tokens.
  Restated the figure's fixed values inline: "For 3 hops of 4, hops × hop length = 3 × 4 = 12".
- **mult-01-05 c2** (`mult3-flip`, fixed 3×4=4×3): original example used 9×2/2×9, a different fact
  pair. This lesson's own c1 already establishes 3×4/4×3 as the figure's numbers — reworded c2 to
  the same pair rather than building a new flip figure (same rationale as S317's fr-04-04 fix).
- **mult-03-05 c1** (`mult3-break-apart`, fixed 7×6=5×6+2×6, splitting the first factor): original
  body split the *second* factor (6 into 5+1) instead — a different, equally valid decomposition
  that the exact-parity check correctly flagged as non-matching. Reworded to split the first factor
  (7 into 5+2), matching the figure.
- **g3w-01-03 c2** (`g3w-subtract-once`, fixed 20−3=17): body already referenced this lesson's own
  i1 story (5 tables of 4 chairs = 20, minus 3 broken) via the word "from", which false-positive-
  triggered the numeric-claim guard, but never spelled out 20/17 as digits. Appended "— the 5
  tables' 20 chairs lose only 3 once, leaving 20 − 3 = 17."
- **g3w-03-04 c2** (`g3w-multiply-then-add`, fixed (5×6)+4=34): body already stated "(5 × 6) + 4"
  verbatim but never "= 34". Appended "= 34".

## Verification

Per the VERIFY instructions, the binding recomputation is implemented as vitest assertions in
`src/components/s318G3Figures.test.tsx` (imports the repo's own `figureTextAlignment.ts`,
`figureTextMismatchBlocklist.generated.ts`, `figureIds.ts`, and `figures.tsx` modules directly — the
same code path `LessonPlayer.tsx`/`FigureView.tsx` gate rendering on). It:

- Parse-checks all 16 touched lesson files.
- For all 19 named placements: confirms the lesson JSON's `figure`/`concept.figure` key equals the
  intended value, the figure ID is registered in `FIGURE_IDS` and `FIGURES`, the step body is ≤80
  words, `figureTextBindingKey(figure, body)` is **absent** from
  `FIGURE_TEXT_MISMATCH_BLOCKLIST`, and `isFigureTextAligned(figure, body)` is `true`.
- Renders all 11 new parameterized figure instances via `renderToStaticMarkup` and asserts
  `role="img"`, a `<title>`, and the real bound numbers appear in the markup (both figures sharing
  a fact family but stating it in opposite factor order — `mult3-missing-factor-7x8` vs
  `-8x7` — are asserted to render distinctly).
- Asserts the 8 new missing-factor/fact-family/estimate titles carry **no digits**, confirming they
  are not newly admitted to the renderer-derived `FIGURE_NUMERIC_CLAIMS` map.
- Asserts all 10 original fixed components (`mult3-missing-factor`, `mult3-fact-family`,
  `mult3-fair-shares`, `mult3-estimate`, `number-line-jumps`, `mult3-array`, `mult3-flip`,
  `mult3-break-apart`, `g3w-subtract-once`, `g3w-multiply-then-add`) still render their original
  fixed numbers byte-for-byte.
- Asserts every non-target `figure`/`concept.figure` key in the 16 touched lesson files (including
  the 5 sibling placements that already rendered and were correctly left untouched — mult-02-03 c1,
  g3w-02-01's remedial, df3-03-03 c1/c2, and df3-02-01/df3-02-03/df3-02-04's other `c2`s) is
  unchanged.

## Numeric-claims regeneration

`src/lib/figureNumericClaims.generated.ts` is regenerated (documented generator, never hand-edited)
after adding the new figures to `figures.tsx`. This is purely additive relative to the prior
committed state: `mult3-fair-shares-15-over-5` ("15 ÷ 5 = 3 each") and `number-line-jumps-7x5` ("7
times 5 equals 35") are newly admitted (their titles do assert arithmetic, matching the original
fixed components' own convention); the 8 missing-factor/fact-family/estimate instances are **not**
admitted (digit-free titles, by design — see above). One unrelated entry (`decimal-shift-divide`,
"15 divided by 5 equals 3") was also picked up by this run — that component was added to
`figures.tsx` by a different concurrent lane worker in this same checkout before this packet started
and had not yet regenerated this shared file; running the documented generator brought it into sync
as a side effect, matching the same repo-wide invariant this packet's own new figures rely on. No
key was removed.

## Gate outputs

```
$ npx vitest run src/components/s318G3Figures.test.tsx
 Test Files  1 passed (1)
      Tests  40 passed (40)

$ node scripts/check-registration.mjs
registration: files ↔ course.json ↔ PLAN.md all consistent

$ npx tsc --noEmit
(no output — exit 0)

$ npx tsx scripts/audit/generate-figure-numeric-claims.mts --check
CURRENT 190 exact arithmetic-title claims
```

`src/components/figureIds.ts` was regenerated via `node scripts/gen-figure-ids.mjs` after adding the
11 new figure IDs to `figures.tsx`, so the synchronous existence gate (`FIGURE_IDS.has(...)`,
consumed by `LessonPlayer.tsx`) recognizes them.

## Changed files

- `src/components/figures.tsx` — additive: `Mult3MissingFactorExample` + 7 zero-arg wrappers
  (`Mult3MissingFactor6x7/6x5/8x9/7x8/7x7/6x9/8x7`), `Mult3FactFamilyExample` + 1 wrapper
  (`Mult3FactFamily5x7`), `Mult3FairSharesExample` + 1 wrapper (`Mult3FairShares15Over5`),
  `Mult3EstimateExample` + 1 wrapper (`Mult3Estimate6x9`), `NumberLineJumpsExample` + 1 wrapper
  (`NumberLineJumps7x5`), and 11 new `FIGURES` map entries. No existing component body edited.
- `src/components/figureIds.ts` — regenerated (adds the 11 new IDs; otherwise identical set).
- `src/lib/figureNumericClaims.generated.ts` — regenerated (adds 2 new entries for this packet's
  figures, plus 1 unrelated entry from a concurrent lane's prior uncommitted change; no removals).
- `content/courses/division-fluency-g3/lessons/df3-01-04.json` — `c1.figure` and
  `remedials[0].concept.figure` rebind only.
- `content/courses/division-fluency-g3/lessons/df3-02-01.json` — `c1.figure` rebind only.
- `content/courses/division-fluency-g3/lessons/df3-02-03.json` — `c1.figure` and
  `remedials[0].concept.figure` rebind only.
- `content/courses/division-fluency-g3/lessons/df3-02-04.json` — `c1.figure` and
  `remedials[0].concept.figure` rebind only.
- `content/courses/division-fluency-g3/lessons/df3-03-03.json` — `remedials[0].concept.figure`
  rebind only.
- `content/courses/word-problems-g3/lessons/g3w-02-01.json` — `c2.figure` rebind only.
- `content/courses/multiplication-division/lessons/mult-01-02.json` — `c2.body` reworded (numbers
  only).
- `content/courses/multiplication-division/lessons/mult-01-03.json` — `c1.body` reworded (added
  digit).
- `content/courses/multiplication-division/lessons/mult-01-04.json` — `c2.body` reworded (added
  restatement sentence).
- `content/courses/multiplication-division/lessons/mult-01-05.json` — `c2.body` reworded (numbers
  swapped to match c1's established pair).
- `content/courses/multiplication-division/lessons/mult-02-01.json` — `c2.figure` rebind only.
- `content/courses/multiplication-division/lessons/mult-02-03.json` — `c2.figure` rebind only.
- `content/courses/multiplication-division/lessons/mult-03-05.json` — `c1.body` reworded (split
  direction swapped to match figure).
- `content/courses/multiplication-division/lessons/mult-04-05.json` — `c2.figure` rebind only.
- `content/courses/word-problems-g3/lessons/g3w-01-03.json` — `c2.body`/`narration` reworded (added
  digits).
- `content/courses/word-problems-g3/lessons/g3w-03-04.json` — `c2.body`/`narration` reworded (added
  "= 34").
- `src/components/s318G3Figures.test.tsx` — new test file (40 assertions).
- `reports/closure/S318_G3_WITHHELD_CLEARANCE.md` — this report.
- `reports/closure/cowork-staging/laneA-s318-g3-figures.jsonl` — 19 `lesson-fix` records.

## Untouched / explicitly out of scope

Every other lesson step in the 16 touched files that already had `cause=RENDERS` in
`VIS01_PLACEMENTS.csv` was left untouched, including: mult-02-03 c1 (still bound to the original
`mult3-missing-factor`, which renders fine for it), g3w-02-01's own remedial `rem-g3w-variable-c`
(still bound to `mult3-missing-factor`, its own 4×?=12 fact), df3-03-03 c1/c2, and every `c2`
sibling of the 3 division-fluency-g3 lessons whose `c1` was in scope (still bound to
`mult3-fact-family` generically). No WITHHELD placement in this packet's scope required a fail-close
disposition — every one of the 19 had a figure that could genuinely and truthfully be made to agree
with its adjacent prose. `mf3-*` (mult-fluency-g3), `mult-fluency-g3`, `g4m-*`
(mult-div-fluency-g4), and every other course's `mult3-missing-factor`/`mult3-fact-family`
placements are out of this packet's course scope (not in the named 3 courses) and were not touched.
