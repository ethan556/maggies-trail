# S319 — Middle-Grade Implementation Packet (11 contracts)

Prefix `MT-V4-WORKER-PREFIX-1` (`reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`) read and applied
byte-for-byte before work began. This is an implementation-worker packet, not an assessment: the
five source contracts (`S319_ASSESS_TSE_NS.md`, `S319_ASSESS_RR_MC.md`, `S319_ASSESS_ASV_PQ.md`,
`S319_ASSESS_CP_SG.md`, `S319_ASSESS_SIM_GF.md`) are the sole authority for what to change; nothing
here re-opens or re-litigates their verdicts. Scope was held to exactly the 11 named contracts
across 11 lesson files — no other file was touched, no additional defect noticed in passing (e.g.
a second, out-of-scope "wait" fragment in `ns-01-01/k3`, and the `pr-unit-rate-g7` internal
`variant.gen` id in `rr-05-03`, which is a structural field, not learner-facing prose) was fixed,
per the "do not broaden scope" rule.

Per-lesson NDJSON fix records (12 records — `ns-01-01` has two independent defects/records) are at
`reports/closure/cowork-staging/laneA-s319-middle.jsonl`. All 11 files parse-check clean; all
changed strings pass the ≥25-char feedback floor, none open on a negation, no `mcq` had its
correct-first position or `correct:true` flag disturbed, no `id`/`conceptTag`/widget `type` was
changed, and no figure binding was added or removed anywhere in this packet.

## 1–2. `ns-01-01` — "How Many Fit?" (`content/courses/number-system/lessons/ns-01-01.json`)

**Defect 1 — value/feedback mismatch.** `remedials[0].check.widget.commonErrors[0]` had
`"value": 0` paired with feedback text ("0.5 multiplies 2 by 1/4 instead of counting how many
quarters FIT...") that describes the *0.5* mistake (2 × 1/4 = 0.5), not 0.
**Fix:** `"value": 0` → `"value": 0.5`. No text changed — the feedback was already correct for 0.5.

**Defect 2 — k2 mcq label-length leak.** Correct option `a` was 67 chars ("Bigger — dividing by a
fraction under 1 always increases the number") against distractors of 42/45 chars.
**Fix:** shortened `a`'s label to "Bigger — a fraction under 1 grows the answer" (44 chars),
bringing all three options to 44/42/45 chars. `correct: true` and every option's `feedback` text
untouched.

## 3. `ns-05-01` — "Absolute Value" (`content/courses/number-system/lessons/ns-05-01.json`)

**Defect — k2 mcq label-length leak.** Correct option `a` was 57 chars ("Both equal 12 —
opposites are the same distance from zero") against distractors of 25/42 chars.
**Fix:** shortened `a` to "Both equal 12 — same distance, opposite sides" (45 chars) and lengthened
`b` from "|-12| = -12 and |12| = 12" (25 chars) to "|-12| = -12 and |12| = 12 — keep the sign"
(41 chars), landing all three options at 45/41/42 chars — tight parity, per the contract's
"or lengthen b" alternate path. `correct: true` and feedback text untouched.

## 4. `rr-05-03` — "Ratios Capstone", step `k4` (`content/courses/ratios-rates/lessons/rr-05-03.json`)

**Defect — leftover scratch text.** `explanationVariants[0]` read: "4 lb at $4/lb costs 4×4=$16.
Wait — recompute with THESE numbers: 5 lb at $4/lb = $20. A 10% discount is 10% of 20 = $2. Final
price: 20−2=$18." — a self-interrupting draft that briefly asserts a wrong intermediate ($16).
**Fix:** replaced with the contract's suggested clean text: "5 lb × $4/lb = $20 before the coupon;
10% of $20 is $2 off, so the final price is 20−2=$18."
**Arithmetic verification:** 5 lb × $4/lb = $20. 10% of $20 = $2. $20 − $2 = $18. Matches the
widget's `successFeedback`/`fallbackFeedback` (already correct, untouched) and the unchanged
`answer` field.

## 5. `asv-01-02` — remedial (`content/courses/area-surface-volume/lessons/asv-01-02.json`)

**Defect — stray "wait:" fragment.** `remedials[0].check.explanationVariants[1]`: "Average the
bases (4), multiply by height... wait: sum first, then halve with height: 16."
**Fix:** replaced with "The average of 6 and 2 is 4; 4 × 4 = 16." (contract's suggested text).
**Arithmetic verification:** trapezoid bases 6 and 2, height 4 → average of bases = (6+2)/2 = 4;
area = 4 × 4 = 16 — matches the unchanged `answer: 16`.

## 6. `asv-02-03` — step `i2` (`content/courses/area-surface-volume/lessons/asv-02-03.json`)

**Defect — unpolished body text.** `steps[i2].body`: "Add a pool, subtract... wait, other way."
**Fix:** replaced with "Mixed operations: subtract the pool, add the shed." — matching the
widget's own `pieces` array exactly (yard: add; pool: subtract; shed: add).

## 7. `cx-03-02` — "Classifying Quadrilaterals" (`content/courses/coordinate-proofs/lessons/cx-03-02.json`)

**Defect — 6× "pq" course-slug leak** in learner-facing feedback (`remedials[0].check.widget.
options[0,2].feedback`, `steps[2].widget.options[0].feedback`, `steps[3].explanationVariants[1]`,
`steps[3].widget.fallbackFeedback`, `steps[6].widget.options[0].feedback`).
**Fix:** replaced every bare "pq" with "the quadrilaterals course" in its noun-modifying form
(e.g. "pq's diagonal test" → "the quadrilaterals course's diagonal test"; "The pq course's..." →
"The quadrilaterals course's..."). All 6 occurrences confirmed removed by follow-up grep. No
math claim, number, or `correct` flag touched.

## 8. `cx-03-03` — hint (`content/courses/coordinate-proofs/lessons/cx-03-03.json`)

**Defect — "pq" leak** in `steps[7].hints[2]`: "A parallelogram with four equal sides has a name
from pq."
**Fix:** → "A parallelogram with four equal sides has a name from the quadrilaterals course."

## 9. `cx-04-02` — "Area by the Box Method" (`content/courses/coordinate-proofs/lessons/cx-04-02.json`)

**Defect — 2× "g7" (Grade 7) leak** in `steps[7].explanationVariants[0]` ("co-signs g7's formula")
and `steps[8].takeaways[1]` ("legs, g7 formulas").
**Fix:** → "co-signs your Grade 7 trapezoid formula" and "legs, Grade-7 formulas" respectively,
matching the spelled-out grade convention used elsewhere in the course (cx-01-01's "your Grade 8
workhorse"). Underlying trapezoid cross-check ((8+4)/2×4=24 vs box 32−4−4=24) re-verified correct.

## 10. `cx-05-03` — "Circles in Disguise" (`content/courses/coordinate-proofs/lessons/cx-05-03.json`)

**Defect — 2× "cr" (circle-theorems) leak** in `steps[3].body` ("even cr's tangent theorems") and
`steps[6].widget.options[0].feedback` ("cr's secant/tangent/miss trichotomy").
**Fix:** → "even the circle-theorems course's tangent theorems" and "the circle-theorems course's
secant/tangent/miss trichotomy" respectively.

## 11. `cx-01-03` — challenge `ch` (`content/courses/coordinate-proofs/lessons/cx-01-03.json`)

**Defect — invalid "shorter route" comparison.** The wire-route challenge compared a direct
distance to `(5, 12)` against a bent path to `(9, 3)` — two *different* endpoints — while framing
it as "how much SHORTER is the shorter route?", which falsely implies both paths reach the same
destination.
**Fix:** reworded to a genuine two-jobs/two-relays comparison (per contract): `body` → "Two jobs,
two relays — compare the wire."; hints renamed Route 1/Route 2 → Job A/Job B; `explanationVariants`
reworded to "Job B uses 1 less unit of wire"; `widget.prompt` → "A survey crew compares two jobs
from base camp (0, 0): Job A runs a wire straight to a relay at (5, 12). Job B runs a wire along
the fence line (0,0)→(9, 0)→(9, 3) to a different relay. How much LESS wire does the shorter job
use?" `answer` (1) and every `commonErrors`/`fallbackFeedback` string left byte-identical, per the
contract's instruction to change framing only.
**Arithmetic verification (hand-recomputed):**
- Job A: distance (0,0)→(5,12) = √(5² + 12²) = √(25+144) = √169 = **13**.
- Job B: (0,0)→(9,0) is 9 units (horizontal leg); (9,0)→(9,3) is 3 units (vertical leg); total =
  9 + 3 = **12**.
- Gap: 13 − 12 = **1** — matches the widget's unchanged `answer: 1`.

## Solid geometry: `sg-02-03` — MATH ERROR fix (largest change in this packet)

`content/courses/solid-geometry/lessons/sg-02-03.json`, challenge step `ch`.

**Defect.** The lesson's "honest bill" challenge priced the lateral surface area of a sheared
4×4-base square prism (vertical height 12, slant edge 13, top shifted 5 sideways) using
`perimeter × slant = 16 × 13 = 208`, and 208 was baked into the `approxFormula` (naive
`4 × s × l`), every `numericErrors` anchor, and both `fallbackFeedback`/`successFeedback`. Per
`S319_ASSESS_CP_SG.md`'s signed lesson-level evidence, `perimeter × slant` is invalid for an
oblique/sheared prism — the assessor recomputed the true total as ≈200 (exact 200 for the
single-axis shear this lesson's own numbers describe) via vector cross-products, and this
assessor-supplied lesson evidence is the only reason this packet is permitted to change evaluator
truth (per the task's explicit authorization — a fix of this class otherwise requires new judgment
outside a content packet's scope).

**Full derivation (independently rebuilt and hand-verified, not copied from the contract):**

Model the base as the square with vertices `(0,0,0)`, `(4,0,0)`, `(4,4,0)`, `(0,4,0)`. The shear
translates every top vertex by the same vector `v = (vx, vy, 12)`, where the stated slant edge 13
means `|v| = 13`, i.e. `vx² + vy² = 5² = 25`. "Top shifted 5 sideways" (parallel to one pair of
base sides) is the natural reading: `v = (5, 0, 12)`, and indeed `√(5² + 12²) = √169 = 13` ✓.

This is an oblique prism (a parallelepiped): each lateral face is a parallelogram spanned by one
base edge and `v`.

- **Faces spanned by edge `e_x = (4,0,0)` and `v = (5,0,12)`** (the two faces parallel to the
  shear direction, at `y=0` and `y=4`):
  `e_x × v = (0·12 − 0·0, 0·5 − 4·12, 4·0 − 0·5) = (0, −48, 0)`, magnitude **48**.
  These two faces do **not** stretch — each is exactly `base × height = 4 × 12 = 48`.
  Subtotal: `2 × 48 = 96`.

- **Faces spanned by edge `e_y = (0,4,0)` and `v = (5,0,12)`** (the two faces facing the lean, at
  `x=0` and `x=4`):
  `e_y × v = (4·12 − 0·0, 0·12 − 0·5, 0·0 − 4·5) = (48, 0, −20)`, magnitude
  `√(48² + 20²) = √(2304 + 400) = √2704 = 52`.
  These two faces elongate to `base × slant = 4 × 13 = 52` each.
  Subtotal: `2 × 52 = 104`.

- **Total lateral surface area = 96 + 104 = 200** (exact, for this single-axis-shear framing —
  matches the assessor's independently-derived bound of `[200, 200.2]` over all valid shear
  directions, landing exactly at 200 for the natural "parallel to one pair of sides" reading the
  fix now states explicitly in the prompt).

- **Sanity check:** as the shear → 0 (upright limit), the formula converges to
  `perimeter × height = 16 × 12 = 192` (the lesson's own, unchanged, and still-correct upright-twin
  reference value) — confirms the model. `192` is not `200` because two faces still gained
  `2 × (52 − 48) = 8` of extra area from the lean: `192 + 8 = 200` ✓.

**Fix applied:**
- `widget.prompt`: now states the shear direction explicitly ("the top slides 5 units parallel to
  one pair of the base's sides") so the geometry is fully determined, per the contract.
- `approxConstants`/`approxFormula`: rebuilt from the naive `4 × s × l` (perimeter × slant) to
  `2×(s×h) + 2×(s×l)` using the exactNumberLab engine's existing generic `add`/`multiply`/
  `const`/`lit` `ApproxExpr` tree (`src/lib/schema.ts`, `evalApproxExpr` — confirmed to support
  arbitrary nesting of these ops already, no engine change needed), evaluating to exactly `200`.
- `numericErrors`: kept `192` (upright twin) with its explanation now relative to 200; added a
  **new** entry for `208` explaining why naive `perimeter × slant` overcounts (per the contract's
  explicit suggestion); kept `52` ("one face") with an updated explanation.
- `fallbackFeedback`/`successFeedback`: replaced the `208`-anchored text with "Two faces keep their
  original height (4×12=48 each); the other two elongate to the slant (4×13=52 each):
  2(48)+2(52) = 200 — only the faces facing the lean actually stretch." (the contract's exact
  suggested text).
- `hints` (all 3) and `explanationVariants` (both) rewritten so no hint or explanation any longer
  points the learner at the false "4 rectangles along the slant" / "perimeter × slant" shortcut.
- `recap` (`r1.takeaways[0]`): reworded from an ambiguous "12 → 13 per side" (which could be
  misread as claiming all four faces stretch) to "two faces stretch from height 12 to slant 13
  (192 → 200 total)" — precise and consistent with the corrected math.
- **Untouched, independently re-verified still correct:** `i1`'s volume question (`answer: 192`,
  `Bh = 16 × 12 = 192`) is a *different* quantity (volume, not lateral area) and was not affected by
  this fix; its `208` distractor remains correctly flagged as wrong-for-volume regardless of the
  lateral-area correction. `k1`/`k2`/`k3`/`i2`/`c1`/remedial (qualitative volume-vs-surface claims,
  no baked-in `208`/`200` numbers) were all confirmed unaffected and left untouched.

## Gates run on all 11 files

- **Parse-check:** all 11 files loaded clean with `python3 -c "json.load(...)"` after every edit.
- **Normalized-duplicate scan:** no new near-duplicate step/prompt introduced by any edit (all
  edits were in-place text/value rewrites, not new steps).
- **Trap/answer collisions:** `sg-02-03`'s new `numericErrors` values (208, 192, 52) all remain
  distinct from the corrected answer (200); no other file's `commonErrors`/`numericErrors`/`answer`
  values were altered.
- **Hand-verified arithmetic:** every numeric claim touched by this packet (`ns-01-01`'s 0.5
  mistake, `rr-05-03`'s $18, `asv-01-02`'s 16, `cx-01-03`'s 13/12/1, `sg-02-03`'s full 200
  derivation and its 192-volume/192-upright-surface cross-checks) was independently recomputed by
  hand above, not copied from the source contracts without verification.
- **Feedback ≥25 chars / no negation-opening / mcq correct-first / id-conceptTag-widget-type
  preserved / no figure bindings touched:** spot-checked on every edited string (see NDJSON
  `gatesChecked` per record).

## Return contract

`packet_id=S319-MID-implementation, base_commit=<local working tree, git repo present at
/home/user/maggies-trail, branch codex/v4-s244-authored-visual-wave>, contract_hash=<n/a — no
single packet contract hash was issued; sourced from 5 named assessment reports>,
role=implementation-worker, model=claude-sonnet-5, effort=high, speed=n/a,
scope_ids=[ns-01-01, ns-05-01, rr-05-03, asv-01-02, asv-02-03, cx-03-02, cx-03-03, cx-04-02,
cx-05-03, cx-01-03, sg-02-03] (11 lessons, 11 contracts, 12 fix records), status=complete,
changed_file_hashes=see reports/closure/cowork-staging/laneA-s319-middle.jsonl
(sha256Before/sha256After per record), evidence_refs=[reports/closure/S319_ASSESS_TSE_NS.md,
reports/closure/S319_ASSESS_RR_MC.md, reports/closure/S319_ASSESS_ASV_PQ.md,
reports/closure/S319_ASSESS_CP_SG.md, reports/closure/S319_ASSESS_SIM_GF.md,
src/lib/schema.ts (evalApproxExpr)], gates_passed=[json-parse(11/11),
value-feedback-consistency(ns-01-01), label-length-parity(ns-01-01, ns-05-01),
no-leftover-scratch-text(rr-05-03, asv-01-02, asv-02-03), jargon-expansion-complete(cx-03-02
6/6, cx-03-03 1/1, cx-04-02 2/2, cx-05-03 2/2 — confirmed by grep), shared-destination-removed
(cx-01-03), math-error-corrected(sg-02-03, 208->200, hand-derived), trap-collision-check(11/11),
feedback-length-floor(all edited strings), mcq-correct-first-preserved(ns-01-01, ns-05-01)],
gates_failed=[], cache_invalidations=[none — this packet consumes the 5 assessment reports as
evidence, does not itself write a ledger], new_decision_required=[none — all 11 items were
mechanical content fixes within a content packet's authority; sg-02-03's value change was
pre-authorized by the assessor's signed lesson-level evidence per task instructions],
risks=[sg-02-03's approxFormula rebuild depends on evalApproxExpr's existing generic add/multiply/
const/lit support, which was confirmed present in src/lib/schema.ts but not executed via
npm/vitest/tsc per instructions — recommend a build-time schema/render check before merge],
next_owner=independent re-assessment or merge decision (this packet does not close itself).`
