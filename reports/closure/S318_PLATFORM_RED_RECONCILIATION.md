# S318 platform-red reconciliation

Worker: platform-red reconciliation (S318). Baseline oracle: pristine git worktree `/tmp/mt-head`
at commit `06a9bb1` (clean HEAD per HANDOVER_COWORK_S316.md's "Test-suite truth" note), node_modules
symlinked from the main checkout. All classification below was diagnosed against that baseline
first, then fixes were applied in `/home/user/maggies-trail` (test files only) and re-verified
green in **both** the main checkout and a scratch copy applied to `/tmp/mt-head` (reverted after
verification, never committed there).

## 0. The premise, checked and partially refuted

The brief's suspected root-cause class (A) was CRLF/mixed-line-ending byte artifacts, "same class
as the S316 ledger migration" (`scripts/session/migrate-decision-basis-lf-normalization-cowork.mjs`).
Before triaging individual tests this was checked directly:

```
find content reports scripts src -type f (json/csv/jsonl/ts/tsx/md/mjs) | xargs grep -lI $'\r'
=> 0 files, in every directory, in both the main checkout and /tmp/mt-head
```

**There is no CRLF anywhere in this checkout.** Class A in the literal "CRLF-normalize-before-hash"
sense does not apply to any test in the families worked below — the S316 ledger migration fixed
exactly the artifact it targeted (`LESSON_REVIEW_DECISIONS_S244.jsonl`); it left nothing else to
normalize. This is a real, useful negative finding: it means the ~318/~79 platform-red set is
**not** a byte-encoding problem and bulk "normalize CRLF" tooling would fix nothing.

What *was* found, and is the actual actionable class-A-adjacent category: several tests hard-code
**text-scraping locators or DOM query strings against a specific historical shape of `schema.ts` /
component output**, and that shape moved (legitimately, in-repo, pre-session) while the test's
literal string/regex did not. These are mechanically fixable, in the test file only, without
weakening any assertion, and verified byte-for-byte reproducible at clean HEAD. They're reported
as their own class below (marked **B-locator**) because they aren't hash pins, but they are exactly
the "test asserts against stale coordinates into otherwise-legitimate current source" pattern the
brief's class B describes.

## 1. Fixed (5 files, 60 tests: 3 + 4 + 7 + 49 + 148 → all green)

| file | tests | class | root cause | fix | verified |
|---|---|---|---|---|---|
| `src/lib/widget-coverage.test.ts` | 3/3 fixed | B-locator | `schemaWidgetTypes()` scraped `src/lib/schema.ts` starting at `"export const WidgetSpec"`. Since S317-era, `WidgetSpec` is `Object.assign(widgetSpecWithPlotPointIntegrity, {options: WidgetSpecBase.options})` — a `superRefine` wrapper — not the union itself; the union list lives on the (non-exported) `WidgetSpecBase = z.discriminatedUnion(...)`. The old locator found the wrapper's `});` far downstream from the wrong `]);`, extracting one spurious match, so all 3 assertions compared against `['UNRESOLVED:widgetSpec']`. | Locate `WidgetSpecBase = z.discriminatedUnion(` instead; also widen the per-spec literal search from `"export const NAME = z.object("` to `"export const NAME = z"` (PlotPointSpec chains `.object(` on the next line). No assertions changed. | Green in main; copied into `/tmp/mt-head`, ran green, reverted (not committed there). |
| `src/lib/engineCapabilities.coverage.s116.test.ts` | 4/4 fixed | B-locator | Same `WidgetSpec` refactor: the test read `registeredTypes` off `(WidgetSpec)._def.options`, which no longer exists (a `ZodEffects._def` is `{schema, typeName, effect}`). `schema.ts`'s own comment says it deliberately re-exposes the member list as a **plain top-level `.options`** property "available to registry tooling" — this test just wasn't updated to use it, so it threw `TypeError: Cannot read properties of undefined (reading 'map')` before any assertion ran. | Read `(WidgetSpec).options` instead of `._def.options`. No assertions changed. | Green in main; verified green at `/tmp/mt-head` HEAD (reverted). |
| `src/components/emitters.s41.test.tsx` | 2/7 fixed | B-locator | The `plotPoint — x/y reversal` fixture predates `xLabels`/`yLabels` becoming required schema fields (`PlotPointSpec.yLabels: z.array(...)`, no `.optional()`), so `WidgetSpec.parse(spec)` threw a `ZodError` before either test body ran. The query strings also assumed accessible names of the form `"column N... row M"`; the live `PlotPointW` component names a cell `` `${xLabels[x-1]}, ${yLabels[y-1]}` `` (no "column"/"row" words at all). | Added `xLabels: ["1","2","3"]`, `yLabels: ["1","2","3"]` to the fixture (cols=3/rows=3, numeric labels so the values line up with the (x,y) under test) and changed the two queries to the actual accessible names (`"2, 1"`, `"1, 2"`). Same events asserted. | Green in main (7/7); verified green at HEAD (reverted). |
| `src/components/widgets.tone.test.tsx` | file-level failure → 49/49 fixed | B-locator | Same required-`yLabels` gap: the `ppSpec` module-level fixture (`rows: 4`) had `xLabels` but no `yLabels`, so `WidgetSpec.parse` threw at import time and the whole file failed to collect (0 tests). | Added `yLabels: ["1","2","3","4"]`. Neither assertion in the file inspects label text (only `data-testid` ghost-ring counts), so no other change needed. | Green in main (49/49); verified green at HEAD (reverted). |
| `src/components/widgets.keyboard.test.tsx` | 2/148 fixed | B-locator | Two independent stale queries in the "P2 keyboard gate" sweep: (a) `plotPoint` case queried `"Cat, row 1"` etc.; the gallery sample (`widgetSamples.ts`) already carries `yLabels: ["1","2","3","4"]`, so the real accessible name is `"Cat, 1"`. (b) `boxPlot` case queried `/minimum/i`, `/first quartile/i`, `/third quartile/i` etc.; the live `BoxPlotW` slider labels are `"set minimum"`, `"set Q1 lower quartile"`, `"set median"`, `"set Q3 upper quartile"`, `"set maximum"` (renamed per an in-source accessibility note about "a private vocabulary" — low/lower-mid/mid wording — being replaced with real statistical names), and a bare `/minimum/i` etc. now *also* matches the plot's own summary `aria-label` on the `<svg role="img">` (which restates every statistic in one sentence), producing "Found multiple elements" instead of "not found". | Updated the `plotPoint` clicks to `"Cat, 1"/"Cat, 2"/"Cat, 3"`; updated the 5 `boxPlot` slider queries to `/set minimum/i`, `/set q1 lower quartile/i`, `/set median/i`, `/set q3 upper quartile/i`, `/set maximum/i` (the `"set "` prefix is only on the input's own label, disambiguating it from the SVG summary). Same 5 assertions, same expected final state. | Green in main (148/148); verified green at HEAD (reverted). |

All five are genuinely pre-existing (reproduced and fixed against clean HEAD `06a9bb1`, not an
artifact of the in-progress S317 working-tree state), touch **only** the 5 test files listed, and
change no assertion's pass/fail semantics — only what element/value each query resolves to, to
match already-legitimate, already-shipped source.

## 2. Investigated and left RED (Class C — real content/logic defects; no content/src/validator
files were touched)

The overwhelming majority of the ~304 remaining failing tests (68 files) are **not** artifact-hash
or locator problems — they are direct semantic assertions about lesson content or widget behavior
that the live content/code currently fails. Representative evidence per family (full per-test
detail is in the vitest output; this table gives the diagnostic signature that rules out class
A/B):

| family | files (failing) | class | representative failure | why it's C, not A/B |
|---|---|---|---|---|
| session186/188/189/190/191/192/194 (course batch pins, K-G2 fluency) | 11 files, ~110 tests | C | `expected NaN to be 6`, `expected 0.111... to be 9`, `g1a-01-01/ch1 ... expected NaN to be 8` | Generator/evaluator producing NaN or wrong numeric answers for specific authored items — an arithmetic defect in generated content, not a byte or locator issue. |
| session195 | (not in target-family run this session; noted in S317 addendum as pre-existing `.variant.gen` dereference red) | C (documented, not reverified this pass) | — | Per S317 addendum, already-documented pre-existing class. |
| session196/197/198 (G3-G5, K fluency/measure/shape) | 15 files, ~90 tests | C | `khm-03-03/ch1 countMoreFewerMcq: solver disagrees with authored correct label: expected 'They are equal' to be 'More stars'`, `teen frame prompt must end in "make <teen>."` failing on 4+ lessons | Solver/evaluator disagreeing with authored correct answers, and prompts missing required trailing phrasing — content-authoring defects. |
| session244/245 (precache seal, stem/feedback, math presentation) | `chatgptWorkPrecache`, `lessonReviewCards`, `stemAndFeedbackIntegrity`, `mathPresentationAuthoredCoverage`, `mathPresentationSourceSeal`, `scaledCircleUnits` — 6 files | **B, unverifiable in safe scope** (see §3) | `sourceSeals... expected '...2a2b58...' to be '...47c276...'` (real content-hash drift, not CRLF variant) | These are "materialized view" self-checks: the test hashes **live** file bytes (already LF, already checked for CRLF above) and compares to a value baked into a generated report/precache artifact under `reports/closure/` or `.chatgpt-work-cache/`. The mismatch is genuine content drift between when the artifact was generated and current HEAD, not an encoding artifact. Regenerating the artifact requires running its own audit script with `--write`, which is out of the "test files only" edit surface and — critically — the main checkout currently has 74 unrelated in-flight content edits (S317 work), so any regen run there would NOT reflect clean HEAD. Left red; see §3. |
| session248/252/253/254/255/256/258/261/264 (course integrity) | 15 files, ~20 tests (1 flaky-pass: `session252.unlikeFractionsG5CourseIntegrity` toggled pass/fail across runs with no code change — see §4) | C | `expected ['o1','o2','o0','o3'] to deeply equal ['o0','o1','o2','o3']` (×3, sessions 253/261/264), `g2g-03-01/c2: expected undefined to be 'single-scale-graph'`, `mult-02-01/c2: expected false to be true` | MCQ option arrays authored out of canonical id order, missing figure-kind fields, evaluator-truth mismatches — all inside `content/courses/**/*.json`, off-limits to edit under this brief. |
| session283/287/289/291/294 (visual repair pins) | 5 files | C | `expected [ {…(4)}, … ] to deeply equal [ { src: '/icon.svg', … }, … ]` (icon manifest drift), `c1/chart-120: expected false to be true` | Manifest/figure-truth pins against current content that genuinely differs — content-side, not test-side. |
| variants.test / variants.delivery / variants.prose / variants.resolver | 4 files, ~41 tests | C | `pr-unit-rate-g7 @ form=rrRateDiscount: 150 seeds through the identical gate: expected false to be true`, `declared k0-count-100 but it does not serve mcq: expected null not to be null` | Property/seed-based generator gates failing on specific generator forms — generator logic defects, not hash pins. Also flaky run-to-run (see §4). |
| widget-coverage | fixed, see §1 | — | — | — |
| engineCapabilities* | `engineCapabilities.coverage.s116` fixed (§1); `engineCapabilities.test.ts` still red | C | `slopeTriangle: onEvent wired=true but adapt=0` | Requires a judgment call on whether `scripts/engine-capabilities.json`'s `adapt` rating for `slopeTriangle` should change — a data/config file outside test-file scope, and not something safely re-pinned without engineering sign-off on what `onEvent` wiring implies about that specific widget. |
| excellenceBacklog.s126 | 1 file, 4 tests | **B, unverifiable** | `S126 excellence audit: policy/live backlog drift; missing policy=[df3-03-02], stale policy=[]` | The audit script itself throws before the test can even compare output — a policy file is missing an entry for a lesson that exists live. Same "regenerate a report/policy artifact" shape as §3; left red. |
| content.authoredKeys/duplicateItems/gradeVocabulary/numericPreview/widgets.audit | 5 files, ~9 tests | C | `distinct items appearing more than once: expected 60 to be 162`, `is declared on exactly the 111 steps... expected 110`, DEAD FEEDBACK on 2 live widget instances | Corpus-wide content counts/audits disagreeing with the live corpus — real drift in content, not in the test's hash logic. |
| cmlLint.portability | 1 file, 1 test | **B, unverifiable** | expects stdout to contain `"all warning classes within their waived ceilings"`; script now prints only `"CML lint (strict): 0 error(s), 0 warning(s)"` because the corpus currently has **zero** lint warnings (`scripts/cml-lint.mjs:221` only emits the waiver-summary line when `warnings.length > 0`) | Plausibly a *good* outcome (warnings went to zero) rather than a defect, but that can't be told apart from "lint silently stopped detecting warnings" without deeper audit-script verification that was out of budget this pass. Re-pinning the literal string would be safe-looking but I could not verify which of the two is true, so left red per the "leave red if unverifiable" rule rather than guess. |
| conversions.s120 | 1 file, 1/119 failed | C | `sy-01-01/i2: lowFeedback unreachable: expected 0 to be greater than or equal to 0.499999999` | Single authored item's feedback threshold unreachable given its evaluator range — content defect. |
| scaffoldFixes | 1 file, 2/90 failed | C | `expected false to be true` (scaffold-gap assertions) | Not enough context recovered in budget to separate locator vs content; error shape matches the corpus-audit family, not a hash pin. Left red, undiagnosed beyond this. |
| mmipHarness-dependent files | included via `mmip/mmipHarness.test.ts` (passed) and `widgets.mmip.o2.s208/s209` (failed) | C | Two DOM elements both legitimately rendering `"y = 3x + 2"` (`.math-inline` spans in two places) or `"y = 0x + 0"` (a live `<p aria-live>` readout plus a `.math-inline` mirror) — ambiguous `getByText`/helper `equationText()` queries | This *could* be another locator staleness case (disambiguate the query), but unlike §1 I could not confirm in budget whether the second matching element is an intentional accessibility-mirror (safe to scope the query) or an unintended duplicate render (a real defect the test is correctly catching). Flagged as the top candidate for next-session investigation; left red rather than guess. |
| LessonPlayer.play/ui | 2 files, 6 tests | C | `Unable to find an accessible element with the role "radio" and name /^3 × 5$/` | An authored MCQ option's rendered/accessible text no longer matches `"3 × 5"` exactly — content or renderer formatting drift, needs component-level investigation outside "test files only" to resolve safely. |
| widgets.keyboard/tone/v2modes/mmip/axisFurniture/labelCollision/numberLineScale/postInteraction/accessibleParity | keyboard+tone fixed (§1); v2modes/mmip.o2.s208-209/axisFurniture/labelCollision/numberLineScale/postInteraction/accessibleParity still red, 7 files, ~22 tests | C (mostly) | e.g. `cn-03-02/i2: real axis ["-15","-10","0","10","15"]: expected 5 to be 3`, `expected […] to not include '60'` | Axis/figure content pins disagreeing with live content — same as the course-integrity family above. |
| playerFieldReachability | 1 file, 2 tests | C | `figure on kind "challenge" (4 steps...) — no declared consumer`; corpus pin `3` vs expected `2` for `figure::interactive` | A real authored-field reachability gap plus a stale corpus count — content-side. |
| emitters.s41 | fixed, see §1 | — | — | — |
| ProfileClient/SiteNav avatar | 2 files, 2 tests | C | `expected '/avatars/avatar-101-256.webp' to be '/avatars/placeholder-neutral.svg'`, button-count mismatch (`+0` vs `15`) | Avatar manifest/enablement state assertions disagreeing with the live manifest — content/config, not test-locator. |
| onboarding.branches | 1 file, 1/112 failed | C | `grade 0 has courses for K.OA that no direct-pick trail reaches: expected ['K.OA'] to deeply equal []` | Real curriculum-graph reachability gap. |
| session247 | 4 files (in scope), only `session247.addSubtract1000G2Course` red, 1-2 tests | C | `g2b-02-04: expected ['pv1000-cascade-down', …(1)] to deeply equal [Array(2)]` | Content-side tag-count mismatch. |

## 3. "B, unverifiable in safe scope" — full list and why nothing was regenerated

`session244.chatgptWorkPrecache.test.ts`, `session244.lessonReviewCards.test.ts`,
`session245.mathPresentationSourceSeal.test.ts`, `session252.graphFigureLabelingInventory.test.ts`,
`excellenceBacklog.s126.test.ts`, `cmlLint.portability.s243.test.ts` (6 files, ~14 tests) all follow
the same shape: the test's own assertions are simple equality/hash checks against a **generated
artifact** (`reports/closure/*.json`, `.chatgpt-work-cache/*`, `scripts/engine-capabilities.json`-
adjacent policy files) that is regenerated by a dedicated `scripts/audit/*.mjs` / `scripts/*.mjs`
script, several of which the test itself shells out to via `execFileSync(..., ["--check"])`.

These are the closest thing to genuine "stale pin" (class B) cases in the whole set — but three
things put safe reconciliation out of reach this session:

1. **Edit surface.** The fix is not a test-file change — the test logic is already correct (it's
   comparing live-derived data to a stored artifact and correctly finding drift). Making it green
   means regenerating the artifact via its script, and the brief scopes this session's edits to
   "test files only, never content, never src components, never validators."
2. **Dirty main tree.** `/home/user/maggies-trail` currently has 74 modified files (in-flight,
   uncommitted content from concurrent S317 work — confirmed via `git status`). Running any
   `--write` regeneration there would bake those in-progress, not-yet-signed edits into a
   "sealed" artifact, which is exactly the kind of silent authority-laundering the
   `CHATGPT_WORK_V4_EXACT_PREFIX.md` prefix explicitly forbids ("Treat any mismatched source...
   as stale. Stop the packet and return the mismatch; do not repair or reinterpret authority
   silently").
3. **No independent legitimacy check available in budget.** Several of these reports encode 1,000+
   lesson-level judgments (`LESSON_REVIEW_CARDS_S244.json` alone has 1,701 cards, 6,121 standards
   dossiers). Confirming that a regenerated version is a *faithful mechanical recomputation* and
   not silently absorbing bad data would require the same review rigor as the original S244/S246
   sessions — outside what this pass could respect.

All 6 are left RED with this documentation rather than guessed at. Recommended next step: run each
script's `--check`/`--write` mode in a **clean worktree at HEAD** (not the dirty main tree), diff
the proposed regeneration against the stored artifact, and hand the diff to an independent reviewer
per this doc's own "An implementation worker cannot assess or close its own packet" rule — this is
exactly the S316 ledger-migration pattern, just for these six artifacts instead of the ledger.

## 4. Additional finding: run-to-run flakiness in the baseline itself

Re-running the identical 74-file baseline set twice (once for initial triage, once post-fix) on
the same commit produced slightly different failure counts and, in one case
(`session252.unlikeFractionsG5CourseIntegrity.test.tsx`), a full pass↔fail flip with **no code
change**. `variants.test.ts` / `variants.prose.test.ts` (seed-based generator gates, "150 seeds
through the identical gate") are the most likely source. This means the "~318 tests / ~79 files"
figure in the handover is a **snapshot, not a stable constant** — expect ±5-15 tests of variance
between runs independent of any reconciliation work. Not investigated further (out of scope: this
is a test-suite determinism issue, not a platform-red pin issue), but flagged so the next session
doesn't chase phantom regressions/fixes caused by run-to-run noise.

## 5. Totals

Baseline (this session's captured snapshot, target families only, `/tmp/mt-head` @ `06a9bb1`):
**311 failing tests across 74 files** (of the ~318/~79 platform-wide figure — the remainder are in
families outside this session's assigned list, e.g. `session132/137/144` correctly skipped as
already green, and the S317-addendum-documented `session195` red).

| | files | tests |
|---|---|---|
| Fixed (class B-locator, verified green in main + HEAD, reverted at HEAD) | 5 | 60 |
| Classified B but left RED (unverifiable in safe scope — generated-artifact staleness) | 6 | ~14 |
| Classified C, left RED (real content/widget/generator defects — undocumented content edits forbidden) | ~63 | ~230 |
| Not reached / insufficient budget to classify precisely (scaffoldFixes, widgets.mmip ambiguous-query cases) | 2 | ~7 |

Class A (byte-encoding / CRLF hash-input normalization) as literally specified in the brief: **0
files, 0 tests** — confirmed absent from this checkout (§0). No test was re-pinned to a "LF value"
because no test's failure was attributable to line-ending differences; all remaining hash/count
mismatches trace to genuine content or generated-artifact drift, not encoding.

No assertion was weakened anywhere. No `content/`, `src/components`, `src/lib` (non-test) or
`scripts/` files were modified. The 5 fixed files' diffs are locator/fixture corrections only,
each independently verified to reproduce green against the pristine `06a9bb1` worktree before
being counted as fixed.
