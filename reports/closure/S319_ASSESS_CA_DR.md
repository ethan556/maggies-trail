# S319 — Independent Assessment: `curve-analysis` and `derivative-rules`

Independent Cowork assessment of both complete Grade-13 calculus courses,
`content/courses/curve-analysis` (15 lessons) and
`content/courses/derivative-rules` (15 lessons). Every lesson JSON and both
`course.json` files were read in full. Every derivative (power, product,
quotient, chain), critical point, concavity/inflection claim, MVT/Rolle
constant, and optimisation candidate was recomputed by hand against the
prompt/widget/feedback/explanation text. Read-only on all content; the only
writes are this report and the disposition NDJSON at
`reports/closure/cowork-staging/laneB-s319-ca-dr-dispositions.jsonl`.

This report was produced starting from the `MT-V4-WORKER-PREFIX-1` block in
`reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`: the cache is evidence only,
nothing here approves its own work, and this packet does not touch the
ledger.

## Result counts

- `curve-analysis`: 15 lessons reviewed — **11 KEEP, 4 REVISE**, 0 ESCALATE.
- `derivative-rules`: 15 lessons reviewed — **15 KEEP**, 0 REVISE, 0 ESCALATE.
- Combined: 30/30 lessons signed, **26 KEEP / 4 REVISE**.

No mathematical error, answer leak, false feedback, or missing-visual defect
was found. Every REVISE below is the same defect class: a **figure
mismatch** — a `figure` id that renders content from a different topic than
the step it is attached to, so the visual promise is actively wrong rather
than merely generic. No new judgment call, standards question, or identity
question was invented; all four are mechanical figure-id corrections.

## REVISE list (curve-analysis only)

| Lesson | One-phrase reason |
|---|---|
| `ca-03-03` | Step `c2`'s figure `dr-inverse-reciprocal` renders the inverse-function reciprocal-slope diagram (home: `dr-05-03`), not the `+C`/antiderivative-family relationship the step teaches. |
| `ca-04-01` | Steps `c1`, `c2`, and remedial `rc1` all cite `dr-power-rule-pattern` (the derivative power-rule table), unrelated to end-behaviour/asymptotes; on-topic replacements already exist in the figure catalog. |
| `ca-05-02` | Step `c1`'s figure `dr-power-rule-pattern` is unrelated to the open-top-box optimisation setup; no existing figure covers this content — a new figure is needed. |
| `ca-05-03` | Step `c1` and remedial `rc1` cite `dr-power-rule-pattern` for the fence-against-a-wall setup, unrelated; no existing figure covers this content — a new figure is needed. |

## Implementation contracts (REVISE only)

### `ca-03-03` — "What the MVT Buys"

- **Defect**: `steps[].id == "c2"` (`figure: "dr-inverse-reciprocal"`). The
  concept text is "If F′ = G′ everywhere, then (F − G)′ = 0, so F − G is
  constant... why every antiderivative of f has the form F + C." The cited
  figure (`DrInverseReciprocalSlope` in `src/components/figures.tsx`) shows
  two reflected curves with slopes 4 and 1/4 and the caption
  "(f⁻¹)′(b) = 1 / f′(a)" — a completely different calculus fact (inverse
  function derivatives), correctly used elsewhere in `dr-05-03`,
  `in-03-03`, `in-05-03`, `sc-03-01`.
- **Fix**: replace `figure: "dr-inverse-reciprocal"` at `c2` with a figure
  that actually shows a family of curves differing by a vertical constant
  shift (two or three parallel copies of the same curve, offset vertically,
  each tagged with an identical tangent slope at matching x, captioned along
  the lines of "F and F+C share every slope — only the height differs").
  No such figure currently exists in `src/components/figures.tsx` under any
  `ca-`, `dr-`, or `in-` prefix (grepped for `constant|family|plus-c|
  antideriv|vertical-shift` against the figure registry, no match); this is
  a new-figure build, not a swap.
- **Scope**: only the `figure` value at step `c2`. `rc1`'s existing figure
  (`dr-tangent-line`) is a generic, non-misleading illustration and is not
  in scope.

### `ca-04-01` — "End Behaviour and Asymptotes"

- **Defect**: `steps[].id == "c1"`, `steps[].id == "c2"`, and
  `remedials[0].concept.figure` (id `rc1`) all cite
  `figure: "dr-power-rule-pattern"` — `DrPowerRulePattern` renders the
  power-rule table (x → 1, x² → 2x, x³ → 3x², x⁴ → 4x³, xⁿ → n·xⁿ⁻¹), a
  derivative-computation mnemonic with no connection to end behaviour,
  horizontal/vertical asymptotes, or degree comparison. `dr-power-rule-
  pattern`'s correct home is `dr-02-01`/`dr-02-02`/`dr-02-03`
  (derivative-rules ch2).
- **Fix**: swap in figures that already exist and already match the exact
  content of each step:
  - `c1` (rational-function degree comparison for horizontal asymptotes,
    plus the vertical-asymptote discussion) → `"ha-degree-panels"`
    (`HaDegreePanels`, `src/components/figures.tsx:9474`, three panels for
    top<bottom→0, top=bottom→ratio, top>bottom→none).
  - `c2` (polynomial end behaviour by degree parity and leading sign) →
    `"end-behavior-quadrants"` (`EndBehaviorQuadrants`,
    `src/components/figures.tsx:9226`, four mini-graphs: even/a>0,
    even/a<0, odd/a>0, odd/a<0 — an exact match for the four bullet cases
    in `c2`'s body text).
  - remedial `rc1` (same rational-degree content as `c1`) →
    `"ha-degree-panels"` again, for consistency with `c1`.
- **Scope**: only the three `figure` values named above. No prompt, widget,
  answer, or feedback text in this lesson needs to change.

### `ca-05-02` — "The Open-Top Box"

- **Defect**: `steps[].id == "c1"` (`figure: "dr-power-rule-pattern"`) —
  same power-rule-table mismatch as above, here attached to the classic
  cut-corner open-box setup (`V = x(12−2x)²`, domain `0 < x < 6`).
- **Fix**: no existing figure in the catalog depicts a square sheet with
  corner squares of side `x` cut out and the sides folded up (grepped the
  figure registry for `optim|box-|fence|volume`; matches are either
  unrelated courses — `cx-box-method`/`cx-box-classify`,
  `dd-box-five-number`, `sg-volume-only`, `tm-*-volume`, `iar-optimum-at-
  corner` — or generic 3D-volume figures for other topics, none showing
  this construction). This requires building a new figure: a labelled
  12×12 sheet with four corner squares of side `x` marked for removal, and/
  or the folded box with base `(12−2x)` and height `x`, matching the
  `V = x(12−2x)²`, `0 < x < 6` text exactly.
- **Scope**: only the `c1` figure. The rest of the lesson (V′ = 12(x−2)
  (x−6), max V = 128 at x = 2, endpoint degeneracy) is correct and untouched.

### `ca-05-03` — "Applied Optimisation"

- **Defect**: `steps[].id == "c1"` and `remedials[0].concept.figure` (id
  `rc1`) both cite `figure: "dr-power-rule-pattern"`, attached to the
  fence-against-a-wall setup (`2x + y = 100`, `A = x(100 − 2x)`).
- **Fix**: same gap as `ca-05-02` — no existing figure shows a three-sided
  rectangular pen against a wall. Build a new figure: a wall segment on one
  side, two fence runs of length `x` (depth) perpendicular to the wall, one
  fence run of length `y = 100 − 2x` (width) parallel to the wall, matching
  the `2x + y = 100` constraint used in `k1`'s remedial and `c1`.
- **Scope**: only the two `figure` values named above. `A′ = 100 − 4x`,
  `A(25) = 1250`, and the sum-of-squares challenge (`S(10) = 200`) are all
  correct and untouched.

## Notes on borderline calls resolved as KEEP

- `ca-01-03`, `ca-05-01`: reuse `dr-flat-not-turning` as a recurring
  "critical point is a suspect, not a conviction" motif in concept steps
  whose *primary* visual demonstration is actually carried by a dedicated
  interactive (steppedReveal/derivativeTrace/signChart) that is
  topic-correct. Judged SUFFICIENT rather than a defect, since the figure
  does not assert anything false about the step it decorates — unlike the
  four REVISE cases, where the cited figure is on a different subject
  entirely.
- `dr-03-02` (`c2`, figure `dr-power-rule-pattern`): the step's own text is
  "many quotients are powers in disguise" (`x³/x` simplifies to `x²`) — the
  power-rule table is directly on-topic here, in contrast to its four
  misuses in `curve-analysis`.
- `dr-04-02`/`dr-04-03` `relatedRatesLab`/`derivativeRuleLab` widget reuse
  for implicit-differentiation and product/chain mechanics: verified the
  rendered numbers against hand computation (e.g. slope on the circle at
  `x=3` → `-0.75`), no defect.
- Widget-schema note (not a defect): `ca-04-03`'s `i1` `derivativeTrace`
  widget carries `mode: "slope"` with both `targetSlope: -4` and an unused
  `targetX: 0`. Confirmed against `src/lib/evaluate.ts` (`case
  "derivativeTrace"`) that for `mode !== "point"` grading and the reveal
  ghost line both key off `targetSlope` only; `targetX` is inert in this
  mode and does not affect correctness, feedback, or the rendered ghost.
  Left as KEEP.

## Per-lesson verdict lines

### curve-analysis

- `ca-01-01` — KEEP / SUFFICIENT / FIT — critical-point find-vs-classify,
  x²/x³−12x/x⁴−4x³ math verified.
- `ca-01-02` — KEEP / SUFFICIENT / FIT — first-derivative-test sign
  chart + max/min values verified; figure exactly matches worked example.
- `ca-01-03` — KEEP / SUFFICIENT / FIT — EVT candidate lists and endpoint
  maxima verified.
- `ca-02-01` — KEEP / SUFFICIENT / FIT — f″ sign chart, inflection
  definition, x⁴ counterexample verified.
- `ca-02-02` — KEEP / SUFFICIENT / FIT — second-derivative test, x⁴/−x⁴/x³
  inconclusive trio, corner case verified.
- `ca-02-03` — KEEP / SUFFICIENT / FIT — three-chart synthesis, saddle+
  inflection independence, quadrant matchPairs verified.
- `ca-03-01` — KEEP / SUFFICIENT / FIT — Rolle's theorem, |x|−1
  counterexample, root-counting corollary verified.
- `ca-03-02` — KEEP / SUFFICIENT / FIT — MVT c-values (x², x³ cases),
  speeding-ticket and two-value reasoning verified.
- `ca-03-03` — **REVISE** / REQUIRED / FIT — see contract above.
- `ca-04-01` — **REVISE** / REQUIRED / FIT — see contract above.
- `ca-04-02` — KEEP / SUFFICIENT / FIT — full-sketch checklist, inflection
  at x=2, direction-change count verified.
- `ca-04-03` — KEEP / SUFFICIENT / FIT — reading f from f′, touch-vs-cross
  extremum count verified; widget grading confirmed in evaluate.ts.
- `ca-05-01` — KEEP / SUFFICIENT / FIT — box domain/V′ sign chart,
  P=x(20−x) max=100 verified.
- `ca-05-02` — **REVISE** / REQUIRED / FIT — see contract above.
- `ca-05-03` — **REVISE** / REQUIRED / FIT — see contract above.

### derivative-rules

- `dr-01-01` — KEEP / SUFFICIENT / FIT — definition-based f′=2x, tangent
  line y=6x−9 verified; figure exact match.
- `dr-01-02` — KEEP / SUFFICIENT / FIT — x³ flat-not-turning, x³−12x
  critical-point preview (deliberate cross-course bridge) verified.
- `dr-01-03` — KEEP / SUFFICIENT / FIT — |x| one-sided slopes, four-way
  differentiability classification verified.
- `dr-02-01` — KEEP / SUFFICIENT / FIT — power rule on x⁵, √x, x⁻², x³/x
  verified; figure is this lesson's home.
- `dr-02-02` — KEEP / SUFFICIENT / FIT — const/sum rules, product-rule
  counterexample (80 vs 48) verified.
- `dr-02-03` — KEEP / SUFFICIENT / FIT — f″, f‴ chains verified;
  motion (velocity/acceleration) MCQ sound.
- `dr-03-01` — KEEP / SUFFICIENT / FIT — product rule on 3 polynomial
  pairs plus abstract (fg)′(3)=18 verified; figure is this lesson's home.
- `dr-03-02` — KEEP / SUFFICIENT / FIT — quotient rule order/sign on 3
  pairs plus abstract case verified.
- `dr-03-03` — KEEP / SUFFICIENT / FIT — structure-classification and
  nested-rule assembly verified.
- `dr-04-01` — KEEP / SUFFICIENT / FIT — chain rule on power/root, abstract
  (f∘g)′(1)=30 verified; figure is this lesson's home.
- `dr-04-02` — KEEP / SUFFICIENT / FIT — nested chains, implicit circle
  slope −0.75 verified.
- `dr-04-03` — KEEP / SUFFICIENT / FIT — tangent-line intercept, xy=12 and
  x²+xy+y²=7 implicit slopes verified.
- `dr-05-01` — KEEP / SUFFICIENT / FIT — eˣ/ln x base cases and chain
  variants verified; ln2/ln3 constants correct to 3 d.p.
- `dr-05-02` — KEEP / SUFFICIENT / FIT — sin/cos derivatives, sin2x chain,
  x·sinx product verified.
- `dr-05-03` — KEEP / SUFFICIENT / FIT — inverse-derivative reciprocal
  rule on 4 cases verified; figure is this lesson's home.

## Return contract

`packet_id=S319-H-ca-dr-assessment, base_commit=<unresolved, no git repo
present at /home/user/maggies-trail>, contract_hash=<n/a — no packet
contract file supplied for this task>, role=independent-assessor,
model=claude-sonnet-5, effort=high, speed=n/a,
scope_ids=[ca-01-01..ca-05-03, dr-01-01..dr-05-03] (30 lessons),
status=complete, changed_file_hashes=<none — read-only on content;
report+disposition NDJSON are new files, not content changes>,
evidence_refs=[content/courses/curve-analysis/**, content/courses/
derivative-rules/**, src/components/figures.tsx, src/lib/evaluate.ts],
gates_passed=[math-recomputation(30/30), answer-leak-check(30/30),
feedback-specificity-check(30/30), accessibility-title-spotcheck(pass on
all inspected figures)], gates_failed=[figure-topic-match(4/30:
ca-03-03,ca-04-01,ca-05-02,ca-05-03)], cache_invalidations=none,
new_decision_required=none (all four REVISE are mechanical figure-id
corrections, no unplanned mathematical/pedagogical/visual/language/
accessibility/identity judgment call), risks=[ca-05-02 and ca-05-03 need a
newly authored figure, not just an id swap — scope that as its own small
build], next_owner=implementation-lane (figure-id swap for ca-03-03/
ca-04-01; new-figure build for ca-05-02/ca-05-03).`
