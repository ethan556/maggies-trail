# Session 146 exact-fit rerank

Live queue recomputed from disk: **27 lessons**.

## Ranked families

1. **exact quotient states** — 5 lessons — **accepted**
   - Lessons: dop-03-03, ns-01-02, ns-02-01, rns-01-01, rns-01-03
   - All five derive from exact division states: quotient, product, remainder, reciprocal quotient, decimal remainder cycle, or repeating-block elimination. Distinct tasks remain explicit modes; no mode is reduced to generic calculation.
2. **line and function comparison** — 3 lessons — **rejected-for-this-session**
   - Lessons: bv-02-03, fg-03-02, fg-03-03
   - Exact family, but smaller. Retained for a later functionCompareLab wave.
3. **number-line sets and root bracketing** — 3 lessons — **rejected-for-this-session**
   - Lessons: ee-05-01, rns-02-01, rns-02-03
   - Shared number-line canvas but two separate truth models: inequality solution sets and square-root interval refinement.
4. **systems substitution and modelling** — 2 lessons — **rejected-for-this-session**
   - Lessons: les-04-02, les-04-03
   - Exact two-lesson closure but smaller.
5. **single-lesson exact engines** — 10 lessons — **deferred**
   - Lessons: md-05-02, fa-02-02, cg-01-03, dop-01-02, dd-04-01, ee-01-02, g7-01-03, g7-03-02, tm-03-03, tm-04-01
   - High-value but not the largest exact-fit closure.

## Selected closure

`quotientReasoningLab` across **5 lessons / 37 authored experiences**.

## Acceptance contract

- One normalized rational/quotient state must drive renderer, grading, feedback, narration, reveal, accessibility, and generation.
- Integer remainder contexts must distinguish round-up, full-groups, quotient-per-group, and remainder-as-answer without changing the quotient state.
- Fraction division must derive reciprocal, raw product, and reduced quotient; only the divisor may invert.
- Long division must enforce 0 <= remainder < divisor and preserve multiply-back verification.
- Decimal classification must arise from remainder zero or a repeated remainder, not denominator-name heuristics alone.
- Repeating-decimal conversion must shift exactly one full period, subtract aligned repeats, and simplify exactly.
- All targeted seeded forms must remain quotientReasoningLab in every band and seed.
- All authored prompts, answers, wrong-path feedback, remedial routes, IDs, ordering, and variant declarations must be preserved.
