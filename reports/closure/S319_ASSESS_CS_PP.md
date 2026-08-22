# S319 — Independent Assessment: Conic Sections & Polar/Parametric

Independent course assessor pass over the two complete Grade 12 precalculus courses
`content/courses/conic-sections` (15 lessons) and `content/courses/polar-parametric`
(15 lessons). Every lesson (concept/interactive/check/challenge/recap steps plus each
lesson's `remedials` block) was read in full and every focus/directrix/vertex/
eccentricity value, polar↔rectangular conversion, and parametric elimination was
recomputed by hand against the authored answer, `commonErrors`/`commonBuilds`
feedback, and `explanationVariants`. Basis hashes were pulled in bulk via
`node scripts/session/print-review-basis.mjs <ids>` (see full 30-line output folded
into the disposition NDJSON's `reviewedBasisHash` field). Read-only on all content;
the only writes are `reports/closure/cowork-staging/laneB-s319-cs-pp-dispositions.jsonl`
(30 lesson-disposition records, one per lesson, appended fresh — the file did not
exist before this session) and this report.

The ChatGPT Work cache prefix (`reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`) was
read and its authority/evidence framing followed: only repository source (the lesson
JSON, `course.json`, and `src/components/widgets.tsx`/`src/lib/evaluate.ts` where a
widget's actual rendering behavior needed to be checked) was treated as authoritative;
no prior audit file, classifier output, or cache entry was treated as a substitute for
recomputing the mathematics myself.

## Course-level decision counts

**conic-sections** (15 lessons): 14 KEEP, 1 REVISE, 0 ESCALATE.
**polar-parametric** (15 lessons): 13 KEEP, 2 REVISE, 0 ESCALATE.

Every lesson's mathematics — every stated value, every `commonErrors`/`commonBuilds`
distractor's arithmetic, and every `explanationVariants` derivation — checked out
correct on hand recomputation. No answer leaks, no unreachable answers, no false
feedback, and no stale-hash/ownership issues were found. Grade-language fit is FIT
for all 30 lessons (both courses are Grade 12 per `course.json`; vocabulary — focal
length, eccentricity, modulus/argument, De Moivre, elimination of the parameter — is
used precisely and consistently with the grade level throughout).

## REVISE list (one-phrase reasons)

| Lesson | Reason |
|---|---|
| `co-01-03` | `k1`/`k1b` are a near-verbatim duplicate check (same variant form `dishForm`, same instructional job, only the numbers differ). |
| `pp-02-01` | `i1`'s widget is a rose-curve petal drill that contradicts its own body text and the lesson's actual concept (circles/lines), and duplicates `pp-02-02`'s `i1` almost verbatim. |
| `pp-04-03` | `ch1`'s first `explanationVariants` entry is a rambling, self-correcting draft-quality explanation exposed to learners. |

## Per-lesson verdicts

### conic-sections

- `co-01-01` — KEEP / SUFFICIENT / FIT. Focus-directrix arithmetic (x²=4py chain, distance checks at (2,1)→2 and (4,4)→5) all correct; distinct jobs per step.
- `co-01-02` — KEEP / SUFFICIENT / FIT. Shifted-vertex/focus/directrix arithmetic correct throughout ((2,−1)→focus (2,1); directrix y=2; focus y=5).
- `co-01-03` — **REVISE** / SUFFICIENT / FIT. Reflective-property facts and all p=4p/4 arithmetic correct, but see REVISE list — `k1`/`k1b` duplicate.
- `co-02-01` — KEEP / REQUIRED / FIT. Two-foci sum (1+9=10) verified; `conicLocusLab` genuinely renders the invariant sum across the eccentricity sweep.
- `co-02-02` — KEEP / REQUIRED / FIT. c²=a²−b² arithmetic correct throughout (c=4; 13-12-5→c=5; b=4; vertical foci c=4).
- `co-02-03` — KEEP / SUFFICIENT / FIT. Shifted-center foci ((6,−1)/(−2,−1)), e=0.8, and e=5/13≈0.38 (two-decimal rounding respected by tolerance) all correct.
- `co-03-01` — KEEP / SUFFICIENT / FIT. |r₁−r₂|=2a definition and vertex/orientation reads from x²/9−y²/16=1 correct.
- `co-03-02` — KEEP / SUFFICIENT / FIT. Slope b/a=4/3, box b=4, c²=a²+b²=25→c=5 all correct; ellipse-vs-hyperbola sign-flip check is a genuinely distinct job.
- `co-03-03` — KEEP / REQUIRED / FIT. `conicLocusLab` crosses e=1 live; e=5/3≈1.67 and e=5/4=1.25 both correct.
- `co-04-01` — KEEP / SUFFICIENT / FIT. A/C-sign classification correctly applied across all four conic types with four distinct examples.
- `co-04-02` — KEEP / REQUIRED / FIT. Completing-the-square verified (circle center (3,−2), r=2; ellipse a=4); `quadraticExplore` interactive genuinely lands the vertex at (3,0).
- `co-04-03` — KEEP / SUFFICIENT / FIT. Hyperbola (a=2,b=3), parabola (p=2), and the full 16x²−9y²−144=0→a=3 challenge all correct. `i1` reuses the `expLogExplore` (exponential/log) widget as an abstract "solve a²=4" analogy — mathematically sound and explicitly framed as an analogy, but doesn't visualize the hyperbola itself; adequate, not ideal, hence SUFFICIENT rather than REQUIRED.
- `co-05-01` — KEEP / SUFFICIENT / FIT. e-scale classification and the buildExpression ordering task (circle,ellipse,parabola,hyperbola) both correct with well-formed distractors.
- `co-05-02` — KEEP / REQUIRED / FIT. Directrix x=a/e=6.25, ratio check 1/1.25=0.8, hyperbola ratio 5/3≈1.67 all correct; flagship `conicLocusLab` (with predict/reveal/CML explanation) genuinely demonstrates the e=1 boundary with `requiredSamples` enforced.
- `co-05-03` — KEEP / SUFFICIENT / FIT. Real-world eccentricities accurate (Earth ≈0.017, Halley's Comet ≈0.97); bound/unbound classification checks correct.

### polar-parametric

- `pp-01-01` — KEEP / SUFFICIENT / FIT. All polar-address-equivalence conversions verified by hand, including the correctly-flagged non-equivalent case (4,7π/6) vs (4,π/6) (a π-shift, not 2π).
- `pp-01-02` — KEEP / SUFFICIENT / FIT. x=r cosθ / y=r sinθ conversions correct to stated precision, including the negative-r and Q2 cases.
- `pp-01-03` — KEEP / SUFFICIENT / FIT. r=√(x²+y²) and the x<0 arctan+π quadrant rule verified across Q1/Q2/Q3 and the full r+θ≈6.618 synthesis.
- `pp-02-01` — **REVISE** / ESCALATE / FIT. See REVISE list. `i1`'s widget (`polarTrace`, mode `rose`, targetPetals 4/targetA 3) teaches rose-curve petal parity — content for the next lesson, `pp-02-02`, which reintroduces an almost-identical 4-petal/n=2 drill in its own `i1` (cross-lesson duplication) — while the step's own body text ("Identify r = 3") and the preceding `c1` concept both promise the plain circle r=a / line θ=c this chapter opens with. Confirmed in `src/components/widgets.tsx`'s `PolarTraceW`: the component only implements `rose` and default-limaçon (`r = a + 2cos θ`) render modes; there is no way to actually draw r=a with this widget. Fixing the promised visual is a widget-capability gap, not a same-shape content edit — flagged ESCALATE rather than a prescribed swap.
- `pp-02-02` — KEEP / REQUIRED / FIT. Petal-parity rule (odd→n, even→2n) verified including the n=3-gives-fewer-than-n=2 counterexample; flagship interactive with predict/reveal/CML.
- `pp-02-03` — KEEP / REQUIRED / FIT. a/b ratio-to-shape rules and all worked maxima (5, 8) correct; `targetA=2` matches the widget's hardcoded r=a+2cosθ formula, correctly showing the cardioid transition.
- `pp-03-01` — KEEP / REQUIRED / FIT. Modulus/argument conversions verified across all quadrants (π/3, 3π/4, 4π/3≈4.19); `argandExplore` + predict/reveal tie modulus to Pythagoras on the Argand plane.
- `pp-03-02` — KEEP / REQUIRED / FIT. De Moivre multiply/power arithmetic correct throughout, with rectangular cross-checks in the explanations ((1+i)²=2i→(2i)²=−4; (1+i√3)³=−8; (1+i)⁸=16 via a full 2π turn).
- `pp-03-03` — KEEP / SUFFICIENT / FIT. Root modulus/argument/spacing correct (cube roots of 8 at 120°/radius 2; i is a 4th root of unity; principal √i real part = √2/2≈0.7071). `i1` reuses `expLogExplore` for 8^(1/3)=2 — correct but doesn't render the "points on a circle" visual the lesson title promises (the static `c1` figure carries that role) — SUFFICIENT, not blocking.
- `pp-04-01` — KEEP / REQUIRED / FIT. Two distinct `parametricTrace` interactives (line targeting t=2; circle targeting t=π/2) use exact radian constants matching the math; non-function (t²,t) check is a distinct job.
- `pp-04-02` — KEEP / SUFFICIENT / FIT. Both elimination techniques (solve-and-substitute; Pythagorean square-and-add) verified across line/parabola/circle/ellipse cases, including the (x/3)²+(y/2)²=1 ellipse.
- `pp-04-03` — **REVISE** / SUFFICIENT / FIT. All arithmetic correct (radius-5 CCW circle; clockwise unit circle landing at (0,−1); y=3 at t=π/2). See REVISE list for `ch1`'s explanation-text defect.
- `pp-05-01` — KEEP / SUFFICIENT / FIT. Independent-axes projectile physics correct throughout (x=45; y=15 at t=1; v_y=0 at peak; combined t=2 check y=20).
- `pp-05-02` — KEEP / SUFFICIENT / FIT. t_peak, max height, flight time, range formulas and all worked numbers internally consistent (2, 20, 4, 60; independent fresh-launch check 48).
- `pp-05-03` — KEEP / SUFFICIENT / FIT. Eliminated-parameter trajectory y=(4/3)x−x²/45 independently rederived from the pp-05-01/02 scenario; landing root (60) and peak (30) both cross-check exactly against the timing-method values from the prior lesson. Strong closing synthesis.

## Implementation contracts for each REVISE

### `co-01-03` — duplicate check items `k1`/`k1b`

**File:** `content/courses/conic-sections/lessons/co-01-03.json`

`k1` ("A parabolic dish is y = x²/8...") and `k1b` ("A dish is shaped like y = x²/12...")
are the same instructional job — read p from y=x²/(4p) — with the same
`variant.form: "dishForm"` and no new misconception, representation, or context
between them. `ch1` (form `focusPoint`, x²=20y) is a third instance of essentially the
same skill but is acceptable as the lesson's closing challenge (it's explicitly framed
as a harder/final application). Fix: replace `k1b`'s prompt with a check that exercises
a **different** instructional job under the same `co-reflector` concept tag — e.g.
given the focus distance p, ask for the width of the dish at a specified height
(reversing the direction of the calculation), or ask a qualitative question about how
doubling p changes the receiver's distance (a covariation question, not another
"divide by 4" arithmetic repeat). Keep the `variant.form` tag distinct from `k1`'s
`dishForm` once the content changes. Do not touch `k1`, `k2`, `ch1`, the recap, or the
remedial block — they are correct and non-duplicative.

### `pp-02-01` — `i1` widget mismatched to lesson concept (ESCALATE)

**File:** `content/courses/polar-parametric/lessons/pp-02-01.json`
**Dependency (read-only, do not edit as part of this fix without separate sign-off):**
`src/components/widgets.tsx` (`PolarTraceW`, ~L3975–4066)

Current `i1`:
```json
"widget": {
  "type": "polarTrace",
  "mode": "rose",
  "targetPetals": 4,
  "targetA": 3,
  "prompt": "Trace r = 3 cos(2θ) and count the petals that appear.",
  ...
}
```
This is rose-curve content (petal parity), not the r=a circle / θ=c line the lesson's
`c1` concept and this step's own body text ("Identify r = 3") promise, and it
duplicates `pp-02-02`'s `i1` (also a 4-petal/n=2 rose drill) almost verbatim one lesson
later. `PolarTraceW`'s two render modes are `rose` (`r = cos(nθ)`) and default/limaçon
(`r = a + 2cos θ`, used correctly by `pp-02-03`) — **neither can render a plain
circle r=a**. This is a genuine widget-capability gap, not a same-shape content swap,
so it is flagged ESCALATE rather than prescribed as a direct edit. Two viable
directions for a human decision:
1. Extend `PolarTraceW` with a third mode (e.g. `mode: "circle"`) that renders
   `r = a` for all θ, with a slider on `a` and a success state on `a === targetA` —
   the natural counterpart to the existing rose/limaçon modes — then author `i1` in
   `pp-02-01` against that new mode with body/prompt/feedback about the circle's
   radius (not petals).
2. If no new widget capability is authorized this cycle, replace `i1` with a
   non-`polarTrace` step (e.g. an `mcq`/`numeric` step in the same style as this
   lesson's own `k1`–`k3`) that keeps the "watch it happen" framing dropped and
   instead directly checks understanding of `r=a`/`θ=c`, removing the false visual
   promise rather than leaving it unmet.
Either way, do not simply retarget the existing rose widget with different numbers —
that would still teach the wrong curve family for this lesson's position in the
sequence and would not resolve the cross-lesson duplication with `pp-02-02`.

### `pp-04-03` — messy `ch1` explanation text

**File:** `content/courses/polar-parametric/lessons/pp-04-03.json`

Current `ch1.explanationVariants[0]`:
> "A circle radius 3 starting at (0, 3) counterclockwise: x = 3sin t, y = 3cos t
> works (t = 0 → (0, 3), t = π/2 → (3, 0)... that's clockwise). Use x = −3sin t,
> y = 3cos t for CCW; but the standard start-at-(3,0) form is x = 3cos t, y = 3sin t.
> At t = π/2, y = 3sin(π/2) = 3, so the y-coordinate is 3."

The widget's actual prompt is "For the circle x = 3cos t, y = 3sin t, what is the
y-coordinate at t = π/2?" — a direct substitution. The explanation instead opens with
an unrelated alternate parametrization (starting at (0,3)), self-corrects mid-sentence
("...that's clockwise)"), proposes a second alternate form, and only then states the
actual answer — exposing authoring scratch-work to the learner. The math is correct
throughout (sin(π/2)=1, y=3), so this is a clarity/tone fix, not a correctness fix.
Fix: replace with a direct explanation matching `explanationVariants[1]`'s style,
e.g. "x = 3cos t, y = 3sin t at t = π/2: cos(π/2) = 0, sin(π/2) = 1, so
y = 3·1 = 3." — dropping the (0,3)-start tangent entirely. `explanationVariants[1]`
("For x = 3cos t, y = 3sin t at t = π/2: y = 3.") is already fine as-is and can stay
or be lightly expanded to carry the full derivation alone.

## Notes on repaired-in-source items (not re-flagged)

- The four `CHOICE-0189`–`CHOICE-0192` roots closed by S315
  (`pp-02-03/k3`, `pp-03-03/k2`, `pp-04-01/k3`, `pp-05-03/k1`) were re-read in full in
  this pass; their option labels are parallel, learner-visible mathematical choices
  with no length/format leak, consistent with the S315 report. Not re-flagged.
- `conicLocusLab`/`argandExplore`/`parametricTrace`/`polarTrace` are shuffle-fixed or
  not choice-based (S316 lab-choice shuffle fix applies to `PercentChangeLabW` /
  `ProportionalReasoningLabW`, neither of which appears in either course); no
  authored-order-bias risk found in this pass's `mcq`/`buildExpression`/`pointEntry`
  steps beyond the two items above.
