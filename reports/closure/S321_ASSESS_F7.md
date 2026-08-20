# S321 Assessment F7 — differential-equations, series-convergence, integration-applications

Independent course assessor pass over three complete AP Calculus BC courses (18 lessons total).
Read-only on content; dispositions staged (not ledger-written) at
`reports/closure/cowork-staging/laneB-s321-F7-dispositions.jsonl`. Every disposition supersedes
any prior decision on these lesson IDs.

Method: read every lesson JSON in full; hand-recomputed every numeric/mcq/challenge answer against
its stated tolerance; cross-checked interactive-widget math (`fieldSlope`, `sliceMeasure`,
`sliceExact`, `taylorFn`/`taylorTerm`, `accumFnAt`/`accumAreaAt` in `src/lib/evaluate.ts`) against
the prose so the rendered visual is confirmed to carry the literal equation/quantity discussed, not
just a plausible-looking one; ran the corpus-wide MCQ-identity duplicate scan
(`scripts/audit/lesson-review-authority-s246.mjs`, 1701 lessons) plus a raw widget-prompt duplicate
scan scoped to these 18 lessons — zero duplicate clusters either way; measured every mcq option
label length and flagged ratios standing out from this same corpus's normal ~1.3x variance.
`differential-equations` carries the S306 choice-parity repair per the caller's brief — not
re-flagged; recomputation found no new defects there.

## Per-course counts

| Course | Lessons | KEEP | REVISE | ESCALATE |
|---|---|---|---|---|
| differential-equations | 6 | 6 | 0 | 0 |
| series-convergence | 6 | 5 | 1 | 0 |
| integration-applications | 6 | 4 | 2 | 0 |
| **Total** | **18** | **15** | **3** | **0** |

All 18 lessons: `visualDecision = REQUIRED` (every lesson's interactive widget — slopeField,
taylorApprox, sliceSum, accumulateArea — is the load-bearing mechanism for the concept, not
decorative), `gradeLanguageDecision = FIT` (AP Calculus AB/BC register throughout, no
grade-inappropriate language found).

## REVISE list (one-phrase reasons)

1. **sc-02-02** (`Where the Polynomial Gives Up`) — remedial rk1's 2-option mcq option-length leak
   (43 vs 12 chars, 3.6x — an outlier against every sibling remedial pair in the corpus).
2. **ia-01-02** (`Spinning a Strip Into a Disc`) — k1's mcq option-length leak (46 vs 1/6/2 chars,
   7.7x — correct option is the only full sentence among bare symbols).
3. **ia-02-01** (`Known Cross-Sections`) — k2's mcq option-length leak (90 vs 30–39 chars, 2.3x).

No mathematical, visual-rendering, duplication, or accessibility defects were found in any of the
18 lessons; every REVISE is the same class of defect (mcq option-length parity), and every KEEP
lesson's numeric answers, tolerances, commonErrors, and widget-rendered quantities were
independently recomputed and confirmed correct.

## Implementation contract per REVISE

### sc-02-02 — `content/courses/series-convergence/lessons/sc-02-02.json`, step `remedials[0].check` (id `rk1`)
- Current options: `o1` (correct) `"No — the terms are growing, so it diverges."` (43 chars);
  `o2` `"Yes, slowly."` (12 chars).
- Fix: bring the two options to comparable length/construction, e.g. shorten `o1` to
  `"No — it diverges."` (18 chars) to match `o2`'s brevity, or lengthen `o2` with a matching clause
  (e.g. `"Yes — 27 is still a finite number."`). Preserve both options' truth values, ids, and
  feedback text; only the option `label` text needs to change. Do not touch any other step.
- Scope: this file only, this one widget. All other math and prose in the lesson is correct — do
  not alter c1/c2/i1/k1–k3/ch1/r1.

### ia-01-02 — `content/courses/integration-applications/lessons/ia-01-02.json`, step `k1`
- Current options: `o1` (correct) `"f(x) — the height of the curve above the axis."` (46 chars);
  `o2` `"x"` (1); `o3` `"πf(x)²"` (6); `o4` `"dx"` (2).
- Fix: shorten `o1` to match the distractors' bare-symbol register, e.g. `"f(x)"` — the existing
  `feedback` string already supplies the "height of the curve above the axis" explanation, so no
  meaning is lost. Preserve `o2`–`o4` and all `correct`/`feedback` values unchanged.
- Scope: this file only, this one widget. All other math (V = π∫₀²x²dx = 8π/3, V = π∫₀¹x⁴dx = π/5,
  disc face computations) is correct — do not alter c1/c2/i1/k2/k3/ch1/r1.

### ia-02-01 — `content/courses/integration-applications/lessons/ia-02-01.json`, step `k2`
- Current options: `o1` (correct) `"Only the constant: multiply the same ∫[f(x)]² dx by √3/4, the
  triangle's area coefficient."` (90 chars); `o2` `"You must revolve the region first."` (34);
  `o3` `"The integral becomes ∫f(x) dx."` (30); `o4` `"You cannot integrate triangular slices."`
  (39).
- Fix: trim `o1` toward the ~35-char range without losing the correct claim, e.g. `"Only the
  constant changes: multiply by √3/4."` (~40 chars) — the fuller reasoning already lives in
  `feedback`. Preserve `o2`–`o4` and all `correct`/`feedback` values unchanged.
- Scope: this file only, this one widget. All other math (square/semicircle/triangle
  cross-section volumes) is correct — do not alter c1/c2/i1/k1/k3/ch1/r1.

## Raw data

- Review basis hashes (via `node scripts/session/print-review-basis.mjs <ids>`), staged
  dispositions, and all evidence refs are recorded per-lesson in
  `reports/closure/cowork-staging/laneB-s321-F7-dispositions.jsonl` (18 NDJSON records,
  `recordId` = `S321-F7-<lessonId>`).
- Duplicate scan: `buildDuplicateInventory` over the full 1701-lesson corpus returned zero MCQ
  identity clusters touching any of these 18 lesson IDs; a raw widget-prompt string scan scoped to
  these 18 lessons also returned zero duplicates.
- Widget-truth cross-check: `fieldSlope("linear")=x`, `fieldSlope("exponential")=0.5y`,
  `fieldSlope("decay")=-0.5y`, `fieldSlope("logistic")=1.8y(1-y/4)` in `src/lib/evaluate.ts` match
  every differential-equations lesson's stated equation exactly; `sliceMeasure`/`sliceExact` for
  `areaBetween`/`disc`/`washer` match integration-applications' 1/6, 8π/3, 2π/15 exactly;
  `taylorFn`/`taylorTerm` for `exp`/`geometric` match series-convergence's eˣ and 1/(1−x) series
  exactly; `accumFnAt`/`accumAreaAt` for `square`/`shifted` match ia-03-01/ia-04-01's integrands
  and antiderivatives exactly.
