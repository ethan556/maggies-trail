# C/D Burn-Down Map — Session 152

Measured from disk (TIER_JSON export of `flagship-tier.mjs`, current: A 618 / B 282 / C 212 /
D 17; K–8 entirely A/B — all 229 C/D lessons are secondary-level). Tier is driven by
`scripts/engine-capabilities.json`: a lesson rises when its steps use engines with manip ≥ 2 +
consequence ≥ 2 (+ prediction and misconception gates for A). Conversion therefore means
swapping static mcq/numeric step widgets for high-capability engines — the S126–S151 wave
pattern — never touching authored prose/answers.

## CORRECTED ROOT CAUSE (measured, S152)

The initial premise below — that D-tier means "weak/absent manipulation to be repaired by new
engine tasks" — was **falsified by measurement**. All 17 D lessons already score
`misconception = 3` and `total = 24`, and every one of them already carries an authored
prediction step. They fall to D through the *second* D rule in `flagship-tier.mjs`:

    predictSteps.length > 0 && d.manip === 0 && d.conseq <= 1   // "prediction stapled to a static step"

They are not impoverished lessons. They are lessons whose expensive authored assets
(prediction prompt + 2–3 misconception paths per assessed step) are already in place, sitting
on top of plain `numeric`/`mcq` widgets. The only missing ingredient is a manipulable engine
on the prediction-carrying step.

**Empirical proof (S152).** Eight lessons were patched in place (widget `type` only), re-scored
with `flagship-tier.mjs`, then restored and verified byte-identical against
`SESSION151C_LESSON_HASHES.json` (hash-proof exit 0, S151C content proof still 15/15):

| Lesson | Engine substituted | Before | After |
|---|---|---|---|
| qu-03-03 | quadraticExplore | D (24) | **A (34)** |
| gf-03-03 | transformExplore | D (25) | **A (35)** |
| lf-03-02 | lineExplore | D (24) | **A (34)** |
| ft-01-03 | functionMachine | D (24) | **A (34)** |
| cn-01-02 | quadraticExplore | D (24) | **A (34)** |
| ep-01-01 | algebraTiles | D (24) | **A (32)** |
| rt-01-03 | triangleSolve | D (24) | **A (31)** |
| rad-01-01 | distanceGrid | D (24) | **A (30)** |

Consequences for the plan: (1) these are **D→A** conversions, not D→B — the highest
tier-movement-per-token work available in the repository; (2) **no new engine tasks are
required for any of the 17** — every fit is an existing registered engine, so the
ENGINE-EXTEND rows below are downgraded to optional refinements, not prerequisites;
(3) the `buildExpression` / `dragOrder` / `dragBucket` / `matchPairs` suggestions in the
original table are **withdrawn** — the capability table gives them `manip: 1`, which can never
clear the A/B manip gate. Conversions must target engines with `manip ≥ 2` **and**
`conseq ≥ 2`, and must land on the **prediction-carrying step** (that is what lifts
`d.prediction` from 2 to 3).

## D-tier (17 lessons) — original engine-fit table (superseded in part by the above)

| Cluster | Lessons | Fit engine (sibling A/B evidence) | Effort class |
|---|---|---|---|
| Alg1 radicals | rad-01-01, rad-02-02 | `exactNumberLab` — **requires new tasks** (rootEvaluate, perfectSquareFactor, radicalMultiply; verified absent from the task enum). Full 8-surface extension + sweep. | ENGINE-EXTEND |
| Alg1 exponent rules | ep-01-01/02/03, ep-02-01 | Symbolic exponent rules (x^a·x^b): no existing symbolic-exponent engine; `buildExpression` (10× in cn siblings) is the candidate carrier — inspect its spec before committing. Else new `exponentLawLab`. | ENGINE-EXTEND or NEW |
| Alg1 linear forms | lf-03-02, lf-03-03 | `lineExplore` (5×) / `slopeTriangle` (9×) — form conversion on a manipulable line. | CONVERT |
| Alg1 discriminant | qu-03-03 | `quadraticExplore` (11× in siblings) — manipulate a,b,c, watch root count. | CONVERT |
| Alg2 CTS | cn-01-02 | `buildExpression` (10×) / `quadraticExplore`. | CONVERT |
| Alg2 range | ft-01-03 | `functionMachine` (4×) / `quadraticExplore` (5×). | CONVERT |
| Geometry foundations | gf-02-02 (angle addition), gf-03-03 (rotations), gf-04-03 (rot. symmetry), gf-05-01 (congruence) | `transformExplore` (2×) for the three rigid-motion lessons; `tapDiagram` (3×) for angle addition. | CONVERT |
| Geometry converses | cp-05-03 | `dragOrder`/`dragBucket` (logical structure) — weakest fit; may stay C-bound honestly. | CONVERT (low confidence) |
| Right triangles | rt-01-03 | `triangleSolve` (8× in siblings) — direct fit for 45-45-90. | CONVERT |

## Session plan (revised from the fit evidence)

- **S153 — pure-CONVERT wave (no engine changes):** qu-03-03, rt-01-03, lf-03-02/03,
  ft-01-03, cn-01-02, gf-03-03/04-03/05-01, gf-02-02 → 10 D lessons onto five existing
  engines. Seal-first: baselines + applied.json + hash ledger written **before** conversion;
  per-step derived-answer == frozen-answer assertions; authored-content + changed-set +
  failure-first audits modeled on `apply-session151.mjs` / s149-s151 proofs.
- **S154 — exactNumberLab radical extension:** three new tasks + truth + evaluate + renderer
  stages + keyboard/gateOne/INDEPENDENT/GENERATOR_BAND registration + sweep + mutations, then
  rad-01-01/02-02 conversion. Also decide ep-cluster carrier from the `buildExpression` spec
  read; cp-05-03 disposition (convert vs documented intentional-C).
- **S155+ — C-tier by concentration:** Precalc Conics 12 → Alg2 Exp/Log 11 → Alg2 Trig 11 →
  Function Analysis 10 → Alg2 Radical 10 (reuses S154 tasks) → Alg1 Systems 10
  (`affineRelationshipLab` intersection machinery already derives the truth) → …
  ≤2 engine-families per session, `describeState` closed for every engine touched
  (current coverage 79/124 — free-rider narration work while each engine is in context).

## Done this session (S152)

- s150 + s151 audit stages (10 verified green standalone first) + the S151C content-change
  proof wired into `gen:reports` — the chain is now 74 stages and self-protects against the
  sweep-staleness class that bit `session150-failure-first` in S151C.
- This map (all fits measured from step prompts + sibling engine usage, not impression).
