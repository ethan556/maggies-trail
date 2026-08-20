# S319 — Bounded Implementation: HS Course Contracts (8 lessons)

Implementation worker pass over the 8 REVISE contracts issued by the independent S319
assessment reports (`S319_ASSESS_CS_PP.md`, `S319_ASSESS_FT_PRA.md`, `S319_ASSESS_CN_PF.md`,
`S319_ASSESS_SIM_GF.md`). Per `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`, only the 8 named
owned lesson files were edited; all other content, `course.json` files, and widget source were
read-only. No `npm`/`vitest`/`tsc` was run. Deliverables: this report and
`reports/closure/cowork-staging/laneA-s319-hs.jsonl` (9 NDJSON records — sy-05-03 has two
independent fixes).

## Per-lesson changes

### 1. `conic-sections/co-01-03` — `k1b` duplicate

**Before**: `k1b` ("A dish is shaped like y = x²/12...") was the same instructional job as
`k1` ("A dish is shaped like y = x²/8...") — same `variant.form: "dishForm"`, same "read p from
the equation" computation, only the numbers differed.

**After**: `k1b` now reverses the direction of the calculation, per the contract's own
suggested fix. New prompt: "A parabolic dish has its focus (receiver) p = 3 units above the
vertex, so x² = 4py = 12y. How WIDE is the dish, tip to tip, at a height of 3 units above the
vertex?" `variant.form` changed to `"widthFromP"` (distinct from `k1`'s `"dishForm"` and from
`ch1`'s `"focusPoint"`).

**Arithmetic verification**: x² = 4(3)(3) = 36 → x = 6; width = 2×6 = 12. `commonErrors`
recomputed: 6 (half-width only, forgot to double) and 36 (x² left un-rooted) both check out as
the described mistakes. `k1`, `k2`, `ch1`, `r1`, and the remedial block were not touched.

### 2. `polar-parametric/pp-02-01` — `i1` mismatched/duplicated widget

**Before**: `i1` was a `polarTrace` rose-curve drill ("Trace r = 3 cos(2θ) and count the
petals") — rose-curve content, not this lesson's actual concept (r=a circles / θ=c lines), and
a near-duplicate of `pp-02-02`'s own `i1` rose drill one lesson later. The assessor confirmed
in `src/components/widgets.tsx` that `PolarTraceW` can only render `rose` or default-limaçon
modes — there is no way to truthfully render a plain `r = a` circle with this widget — and
flagged that specific figure-capability gap ESCALATE, leaving it alone.

**After**: Per the contract's option 2 (no widget-capability change authorized in this
owned-files-only packet), `i1` was replaced with a non-`polarTrace` `mcq` step testing
`θ = π/4` — a line through the pole, the OTHER half of this lesson's actual concept (`c1`
introduces both `r = a` circles and `θ = c` lines). This directly serves the lesson, does not
re-ask the remedial's `r = 5` circle fact or `k1`–`ch1`'s shifted-circle facts, and shares no
content with `pp-02-02`'s rose-curve material. The false "watch it happen" trace promise was
dropped rather than left unmet, as the contract required either way.

**Verification**: θ = π/4 with r unrestricted sweeps every point at that angle (and its
opposite ray) through the origin — the standard line-through-the-pole definition, matching
`c1`'s own concept text.

### 3. `polar-parametric/pp-04-03` — `ch1` rambling explanation

**Before**: `ch1.explanationVariants[0]` opened with an unrelated alternate parametrization
starting at (0,3), self-corrected mid-sentence ("...that's clockwise)"), proposed a second
alternate form, and only then reached the actual answer.

**After**: Replaced with a direct derivation matching `explanationVariants[1]`'s style: "x =
3cos t, y = 3sin t at t = π/2: cos(π/2) = 0, sin(π/2) = 1, so y = 3·1 = 3." `explanationVariants[1]`
left unchanged.

**Arithmetic verification**: cos(π/2) = 0, sin(π/2) = 1, y = 3(1) = 3 — matches the widget's
`answer: 3` exactly.

### 4. `function-transformations/ft-05-03` — false "Course complete!" teaser

**Before**: `r1.teaser` claimed "Course complete! Next course: numbers beyond the real line —
complex numbers." while `ft-05-04` ("Building the Undo Machine") still follows in
`course.json`'s `ch5-inverse-functions.lessonIds`.

**After**: Read `ft-05-04.json` in full to confirm its actual content (inversePipeline
undo-machine drills — reverse the order, flip each step — building to a 4-layer challenge).
New teaser: "Next: one more hands-on lesson — build inverse machines by reversing and flipping
each step, up to a four-layer challenge, then the course wraps." `takeaways`/`body` untouched.

### 5. `function-transformations/ft-05-04` — teaser re-promised already-taught content

**Before**: `r1.teaser` re-promised the horizontal-line-test / "two inputs share an output"
content, which `ft-05-03`'s `k3` (its predecessor in `course.json`'s lesson order) already
taught.

**After**: Verified via `course.json` that `ft-05-04` is the true final lessonId in
`ch5-inverse-functions` (and in the course). Replaced the stale forward-pointer with the exact
course-completion string removed from `ft-05-03` in fix #4 — net effect across the two files:
the teaser strings are swapped, with no change to `course.json`, exercises, widgets, or math
content in either file.

### 6. `polynomial-rational-analysis/pra-03-03` — false hole claim in `i1` feedback

**Before**: `i1.widget.successFeedback`'s second sentence claimed "Compare that with x = 2,
where BOTH vanish and the break is a removable hole instead" for f(x) = (x² − 4)/(x − 1). At
x = 2 the denominator (x − 1) = 1 ≠ 0 — it does not vanish there; x = 2 is simply the
x-intercept, as this same lesson's `k3` correctly states.

**After**: Replaced the false specific claim with a generic-but-true VA-vs-hole contrast that
keeps the pedagogical point without misdescribing this f: "Compare that with a function where a
factor is shared by BOTH the top and bottom at the same input — there the two sides would meet
at a removable hole instead of flying apart, even though the equation looks just as broken at
that point." `k3` (already correct) untouched.

**Arithmetic verification**: f(x) = (x² − 4)/(x − 1). At x = 1: denominator = 0, numerator =
1 − 4 = −3 ≠ 0 → genuine VA (not a hole). At x = 2: denominator = 2 − 1 = 1 ≠ 0 → f(2) =
(4 − 4)/1 = 0, an ordinary x-intercept. gcd(x² − 4, x − 1) = 1 — confirmed no shared factor, so
f has no hole anywhere.

### 7. `polynomial-functions/pf-05-01` — `k3` contradicted its own correct-answer feedback

**Before**: `explanationVariants[0]` computed g(0) for g(x) = (x − 3)(x + 3)·x² as if the ·x²
factor didn't exist: "f(0) = −9... times: (3)(−3) = −9" — directly contradicting the same
step's correct option `o1` ("bounces on the axis at the origin") and `o4`'s own feedback
("g(0) = (−3)(3)(0) = 0").

**After**: Replaced with the true computation including the x² factor: "Degree 4, positive
lead: up on both ends; crosses at ±3 (both odd, from the linear factors); the x² factor gives g
a double zero at 0, so g(0) = (−3)(3)(0)² = 0 — the graph touches and bounces at the origin
rather than crossing, and is negative on both sides of it since (x² − 9) < 0 near x = 0."
`explanationVariants[1]` (already compatible) left unchanged.

**Arithmetic verification**: g(x) = (x−3)(x+3)x² = (x²−9)x². g(0) = (0−9)(0) = 0. Near x = 0,
x² − 9 ≈ −9 < 0 and x² ≥ 0, so g(x) ≤ 0 on both sides of 0 — confirms the bounce-from-below
framing used in `o1`'s correct-answer feedback.

### 8. `similarity/sy-05-03` — duplicate `i2` + false "Course complete!" teaser

**(a) `i2` duplicate.** Before: scale factor 3, smaller area 5 → 45 — identical numbers to
`sy-01-02/i3`. After: scale factor 4, smaller area 6 → 96 (the contract's own suggested
numbers), with `commonErrors` recomputed for the new numbers (24 = uses k instead of k²; 10 =
additive error). `sy-01-02` untouched.

**Arithmetic verification**: k² = 4² = 16; 6 × 16 = 96. 24 = 6×4 (k, not k² — verified as the
described mistake); 10 = 6+4 (additive — verified). A normalized-template (digits→#) scan of
`sy-05-03` vs `sy-01-02` post-fix found no remaining prompt-template match between the two
lessons' scale/area items. (The scan did surface one pre-existing template match between the two
lessons' *remedial* checks — `rem-sy-area-perimeter-k` vs `rem-sy-similarity-k`, both "scale
factor #, area scales by what factor" — but remedials were not named in this contract's scope
and were not touched.)

**(b) `r1` teaser.** Before: "Course complete! Next: right-triangle trigonometry builds on
these similar triangles." — false; `ch6-the-parallel-line-theorem` (`sy-06-01`) still follows
per `course.json`. After: read `course.json` (confirms ch5→ch6 order) and `sy-06-01.json`'s `c1`
concept directly, then used the contract's suggested truthful forward pointer: "Next: one more
relationship — dilations always keep a segment's image parallel to the original, unless the
segment passes through the center." This matches `sy-06-01`'s `c1` body verbatim in substance.
`sy-06-01.json` itself was **not edited** — it is out of this packet's 8-lesson scope (its own
separate REVISE, the `SyDilationParallel` figure-geometry fix, belongs to a different packet).

## Fail-closed items

None. All 8 contracts were implementable within the 8 owned lesson files; no contract required
touching a forbidden file (`pp-02-01`'s figure/widget-capability gap was explicitly left alone
per the assessor's own ESCALATE, and the contract's required *content* fix — replacing `i1` with
a widget-truthful, non-duplicate mcq — was fully implementable in-file).

## Gates run

- **Parse-check**: all 8 edited lesson JSON files parse with `JSON.parse` (see NDJSON `status:
  "applied"` on all 9 records).
- **Duplicate scan**: normalized-template (digits→#) comparison of widget prompts within
  `co-01-03`; between `pp-02-01`/`pp-02-02`; and between `sy-05-03`/`sy-01-02`. No post-fix
  duplicate found among the target steps (one pre-existing, out-of-scope remedial-vs-remedial
  match noted above, unrelated to this packet's edits).
- **Feedback invariants**: scripted scan of every `feedback` string across all 8 files —
  ≥25 chars and no negation-opening (`no/not/never/isn't/...`) violations found.
- **mcq correct-first**: verified by inspection for the one new/rewritten mcq (`pp-02-01/i1`,
  `o1` correct and listed first).
- **Hand-verified arithmetic**: all recomputations listed above (k² area scaling; parabola
  focal-width p→x→width; rational-function VA/hole check at x=1 and x=2; polynomial evaluation
  g(0) with the x² factor included; parametric sin/cos substitution at t=π/2) reproduced by
  hand and cross-checked against each step's own `answer`/correct-option field.
- **Course-order verification**: `ft-05-03`/`ft-05-04` teaser swap and `sy-05-03`'s teaser
  fix were both checked directly against `course.json`'s lesson/chapter ordering (read-only)
  before writing, plus a direct read of the referenced next lesson's actual content
  (`ft-05-04.json`, `sy-06-01.json`) to confirm the new teaser text is true.
- **IDs/conceptTags/widget types preserved** except where the contract explicitly directed a
  change (`co-01-03/k1b`'s `variant.form`; `pp-02-01/i1`'s widget `type` from `polarTrace` to
  `mcq`, which the contract itself prescribed as the in-file remedy for the capability gap).
- **No figure-binding changes**: none of the 8 lessons had their `figure` fields touched;
  `pp-02-01/i1` had no `figure` field before or after.

## Raw data

9 NDJSON records in `reports/closure/cowork-staging/laneA-s319-hs.jsonl` (one per lesson-level
fix; `sy-05-03` contributes two records for its two independent fixes). Each record carries
`sha256Before`/`sha256After` (whole-file, computed via `git show HEAD:<file> | sha256sum` vs
the post-edit file), the exact defect class quoted from its source contract, the fix applied,
and the hand-verification arithmetic.
