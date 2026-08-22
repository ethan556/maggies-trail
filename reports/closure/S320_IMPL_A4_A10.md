# S320 Implementation — A4 + A10 REVISE contracts (19 lessons)

Implementation worker packet. Read `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` first, then all
implementation contracts in `reports/closure/S320_ASSESS_A4.md` and `reports/closure/S320_ASSESS_A10.md`.
Implemented every REVISE contract from both reports — 19 lessons across 5 courses:
`decimal-operations`, `decimals-place-value`, `exponents-scientific-notation`,
`derivatives-in-context`, `exponents-polynomials`. This packet does not assess or close its own
work (per the prefix's authority rules) — it implements the two independent assessors' contracts
exactly as written and returns evidence for independent verification.

Base commit at start: `ae399cc647fedf3f0a0db1aadfeb4cc04d3b90c1`. No npm/vitest/tsc run, per
instructions; only `python3 -c "import json"` parse-checks, hand/scripted arithmetic verification,
and `node scripts/session/print-review-basis.mjs` (read-only hash helper, no build step) were run.

Deliverable NDJSON (one record per lesson, 19 records): `reports/closure/cowork-staging/laneA-s320-impl-6.jsonl`.

## Per-lesson changes and arithmetic verification

### `decimal-operations`

**dop-01-02** — `k3.widget.numericErrors[0]` reinterpreted: `value` stays `8`, but the feedback is
rewritten from a self-negating fragment (derivation shown, 9−3÷2=9−1.5, actually equals 7.5, not
8, and trails off "...no)") to the contract's recommended fix: "8 groups correctly (9 − 3 = 6) but
adds instead of dividing outside the parentheses (6 + 2 = 8). The outer operation here is ÷: 6 ÷ 2
= 3." Verified: 9−3=6, 6+2=8 ✓; correct answer 6÷2=3 ✓.

**dop-01-03** — `i2.widget.options[2]` (id `c`): label changed from "12 plus 7, three times in a
row added" (mathematically identical to the correct answer — 3×(12+7) = 19+19+19 = 57, same
quantity as "three times the sum") to "12, then 7 added three times" (a genuine, different
misconception: 12+7+7+7 = 33, repeating only the 7). Feedback rewritten to name that actual wrong
total instead of conceding the option was correct. Verified: 12+7+7+7=33 ≠ 3×(12+7)=57 ✓ (now
genuinely different, not dual-correct).

**dop-02-02** — `ch1.widget.commonErrors[1].value` changed from `5612` to `5632`
(concat("56","32")="5632", not "5612"). Feedback text unchanged (was already accurate). Cross-checked
against the lesson's two other correct side-by-side-concatenation instances (`k2`: "30"+"15"="3015";
remedial: "6"+"18"="618"). Verified: concat("56","32")=5632 ✓.

### `decimals-place-value`

**dpv-01-02** (CHOICE-0050) — `k2.widget.options[0]` (id `a`, correct): label shortened from "5 —
the third place after the point" (35 chars) to "5 — thousandths place" (21 chars). Distractor
lengths: 18/22/20 chars. Verified with `String.prototype.length`: a=21, b=18, c=22, d=20 — well
balanced.

**dpv-02-01** — `i1.hints[1]` and `explanationVariants` rewritten from stale digits ("2"/"8", from
an unrelated 0.28 example) to the lesson's actual digits for 0.47: hints now "The 4 is tenths; the
7 is next."; explanationVariants now reference "The 7 is the second digit... hundredths" and
"First place tenths (4), second place hundredths (7)." Verified: 0.47 → tenths digit 4, hundredths
digit 7 ✓.

**dpv-02-02** — `i1.hints[2]` and `explanationVariants` rewritten: the `hundredthsGrid` target is
20 hundredths (0.20), but hints/explanationVariants referenced a stale "0.28"/digit-"8" example.
Fixed to: "That digit is 0 — 20 hundredths is exactly two full columns, 2/10." and
explanationVariants "0.20 = 2/10 + 0/100 — shading 20 cells fills exactly two full columns." /
"20 hundredths is the same amount as 2 tenths: 20/100 = 2/10." Verified: target=20 → 0.20,
hundredths digit=0 ✓.

**dpv-02-03** — `i1.hints[0]/[2]` and `explanationVariants` rewritten: the step asks which place
holds the last digit of 0.327 (correct: thousandths), but hints/explanationVariants asserted
"hundredths" (the wrong-choice misconception) via a stale "28" example. Fixed to reference 0.327 →
"327" and "thousandths" throughout. Verified: 0.327 → last digit 7 is in thousandths ✓ (previously
contradicted the correct answer; now consistent with it).

**dpv-03-02** — `i1.widget.options[1]/[2]` labels trimmed from "0.50 is bigger — it has more
digits" / "0.5 is bigger — it's simpler" to "0.50 is bigger" / "0.5 is bigger", balancing against
correct option (a) "They are equal". Verified lengths: a=14, b=14, c=13 chars — no longer a parity
leak (previously 14 vs 35/28).

### `exponents-scientific-notation`

**esn-01-01** (highest severity) — Systemic off-by-one "n zeros" rule for 10⁻ⁿ fixed at every
occurrence found: **13 total** (the 11 the assessor's report named by field path, plus 2 more with
the identical bug the report's prose didn't individually cite — `k3.widget.commonErrors[1]`
"(four zeros)" for 10⁻⁴, and `ch1.widget.successFeedback` "five zeros before the 1" for 10⁻⁵ — both
found and fixed via a full-file scripted scan). Fixed locations: `c1` body (rule + 10⁻³ example),
`i2.fallbackFeedback`, `i2.commonErrors[1]`, `k3.explanationVariants[1]`, `k3.successFeedback`,
`k3.commonErrors[1]`, `ch1.explanationVariants[0]`, `ch1.commonBuilds[0]`, `ch1.commonBuilds[2]`,
`ch1.hints[2]`, `ch1.successFeedback`, `r1` takeaway, remedial concept body. The negative-exponent
rule now consistently states "the 1 sits n places after the point, (n−1) zeros before it" (or the
specific corrected count per instance). Positive-exponent "n zeros" statements (already correct)
were left untouched. Grading (every stored numeric answer / mcq / buildExpression correct
selection) was already correct throughout and is unaffected — only the taught rule text changed.
**Arithmetic verified by hand and script**: 10⁻³=0.001→2 zeros before 1; 10⁻⁴=0.0001→3; 10⁻⁵=0.00001→4;
10⁻⁶=0.000001→5 — all now correctly stated at all 18 "N zero(s) before/after/between" claims
scripted-scanned in the file (0 remaining off-by-one instances).

**esn-01-02** — `i2.widget.numericErrors[0].value` changed from `15` to `-15` (3×(−5)=−15 is the
actual "multiply the exponents instead of adding" error; +15 was never a value that derivation
produces). Feedback text unchanged. `k3`'s already-correct value=12 for (−3)×(−4) confirmed
untouched. Verified: 3×(−5)=−15 ✓.

**esn-02-02** — `i2.widget.options[0]` and `remedials[0].check.widget.options[0]` labels changed
from "x = −2 (only one solution)" / "x = 2 (only one solution)" to plain "x = −2" / "x = 2",
dropping the editorializing parenthetical that both lengthened the correct option and previewed
the exact reasoning distinguishing it from the two-solution distractor. Reasoning kept inside each
option's `feedback` field (remedial's feedback extended slightly since the original was terse).
Both options remain `correct: true` and first-listed.

**esn-04-01** — `ch1.widget.commonBuilds[2].feedback` (for the wrong-token build "1.3 × 10¹¹")
rewritten from a version stating the wrong renormalized exponent (10¹²) and trailing into an
unresolved "...check again" fragment, to the contract's exact replacement text: "That adds the
coefficients instead of multiplying: 7+6=13, not 7×6=42. Even renormalized (13×10¹⁰ = 1.3×10¹¹),
that's still the wrong approach — multiplying gives 42×10¹⁰, which renormalizes to 4.2×10¹¹."
Verified: 13×10¹⁰=1.3×10¹¹ ✓; 42×10¹⁰=4.2×10¹¹ ✓ (matches the token set's correct answer t0,t1,t2 =
"4.2 × 10¹¹", unchanged).

**esn-04-02** — `i1.widget.successFeedback` simplified from "...Now the sum is (2.5 + 0.3) × 10⁴ =
2.8 × 10⁴." (citing a number, 2.5×10⁴, never shown anywhere in this step's prompt/body/predict) to
"Both 3 × 10³ and 0.3 × 10⁴ equal 3,000." — dropping the ungrounded sentence per the contract's
option (b).

**esn-04-03** — `i1.widget.numericErrors[1].feedback` rewritten from "Keeping only the bee-count
exponent ignores the 10² grams attached to each bee." (stale content from an earlier
bee-colony-themed draft) to "Keeping only the 10⁴ exponent ignores the second factor's 10² — both
must combine: 4 + 2 = 6.", matching the step's actual abstract numeric prompt. Confirmed no other
"bee" references remain in the file.

### `derivatives-in-context`

**dc-03-01** — `i1` reworded direction-neutral, mirroring the lc-03-03 precedent (which frames the
same `graphZoom` widget as a limit-existence confirmation, not a curve-flattening animation): step
`body` changed from "Zoom in and the curve becomes its tangent." to "Near a differentiable point,
the graph agrees with its tangent."; `widget.prompt`/`successFeedback`/`moreZoomFeedback`/
`wrongVerdictFeedback` reworded to ask the student to confirm both sides settle on the same height
(which `GraphZoomW` genuinely renders and checks — confirmed by reading
`src/components/widgets.tsx`, `SLOPE=1`, `f(x)=leftValue+1*(x−a)` for every x at every zoom level,
unchanged), rather than promising to "watch the curve straighten," which the renderer never draws
(a straight line at every zoom level, not an animated transition from curved to straight). Widget
type and spec (`behaviour: "continuous"`, `a: 3`, `leftValue: 5`, `rightValue: 5`, `fAtA: 5`,
`requiredZoom: 3`) left completely untouched, per the task's explicit instruction — no
`src/components/widgets.tsx` or `figures.tsx` file was modified.

### `exponents-polynomials`

**ep-01-02** — `remedials[0].check` ("rem-ep-k") replaced the `(2⁴)²` instance (byte-identical
prompt/answer/errors to step `i1`) with a fresh power-of-a-power instance not used anywhere else in
the lesson: `(3²)³`, exponent answer `6` (2·3=6; 3⁶=729). `commonErrors` recomputed: `5`
(2+3, add-not-multiply) and `4` (2², squared-the-base). Concept ("rem-ep-c") left as-is — matches
this course's established remedial convention where the concept keeps a general worked example and
only the check gets the fresh instance (confirmed against `dop`/`dpv` remedial patterns
elsewhere). Verified: 2·3=6, 3⁶=729 ✓.

**ep-02-03** — `remedials[0]` ("rem-ps-c"/"rem-ps-k") replaced the
`(5x²+3x−2)−(2x²+7x−6)` instance (byte-identical to `k1`) with a fresh subtraction pair not used
elsewhere in the lesson: `(4x²+5x−3)−(x²+2x−1) = 3x²+3x−2`. Coefficient-of-x answer changed from
`-4` to `3` (5−2=3). `commonErrors` recomputed: `7` (5+2, add-not-subtract) and `-3` (2−5,
sign-reversed). Concept illustration updated to match the check's new numbers (same paired
concept/check convention used throughout the codebase's remedials). Verified: 5−2=3 ✓; 4−1=3 (x²
coefficient, sanity) ✓; −3−(−1)=−2 (constant, sanity) ✓.

**ep-03-01** — **two independent defects, one fixed, one fail-closed:**
- *Duplication (FIXED)*: `remedials[0]` ("rem-pmm-c"/"rem-pmm-k") replaced the `(3x)(x+4)` instance
  (byte-identical to `k1`) with a fresh monomial-times-binomial instance not used elsewhere in the
  lesson: `(2x)(x+5)`, coefficient-of-x answer changed from `12` to `10` (2·5=10). `commonErrors`
  recomputed: `7` (2+5, add-not-multiply) and `5` (bare second factor). Concept illustration
  updated to match. Verified: 2·5=10 ✓.
- *Figure mismatch (FAIL-CLOSED — see "Fail-closed items" below)*: `c1`'s figure key
  `distribute-area` was NOT changed. Read-verified the defect is real: `DistributeArea()` in
  `src/components/figures.tsx` (~line 7803) renders exactly "3(x + 4) = 3x + 12" (a plain-constant
  multiplier, no x² term), directly beneath `c1`'s text which explicitly works
  "3x(x + 4) = 3x·x + 3x·4 = 3x² + 12x" — a genuinely different multiplier and a missing x² term.
  Checked the two other figures used in this lesson (`ep-monomial`: 2x(3x−5); `ep-higher-monomial`:
  4x²(...)) — neither matches the exact worked numbers `3x(x+4)` either, so the contract's
  "repoint to an existing matching figure" fallback option is not available. Fixing the primary
  contract option (make the figure render `3x(x+4)=3x²+12x`) requires a new/modified
  `src/components/figures.tsx` component, which is outside this packet's content-JSON scope; per
  the task's explicit instruction ("if it needs a figures.tsx change, fail-close that sub-item and
  note it"), this sub-item is fail-closed and reported here rather than silently skipped or
  worked around by editing the platform component file.

**ep-04-01** — `remedials[0]` ("rem-fg-c"/"rem-fg-k") replaced the `(6x²+9x)` GCF instance
(near-verbatim duplicate of `i1`) with a fresh GCF instance not used elsewhere in the lesson:
`(14x²+21x)`, GCD(14,21)=7 (`i3` uses GCD(10,15)=5; `ch1` uses GCD(12,18)=6). `commonErrors`
recomputed: `14` and `21` (each first coefficient alone). Verified: gcd(14,21)=7 ✓ (computed via
`math.gcd`).

## Verification performed on every edit

- **Parse-check**: `python3 -c "import json; json.load(open(f))"` on all 19 changed files — all
  pass.
- **Arithmetic**: every new numeric fact introduced by these fixes (exponent products, GCFs,
  polynomial coefficients, decimal-place zero counts, concatenation values, sign products) was
  recomputed programmatically and cross-checked against the intended feedback text — all match
  (see per-lesson sections above).
- **esn-01-01 scripted scan**: extracted every "&lt;word&gt; zero(s) before/after/between" claim
  in the file (18 total) and its adjacent decimal/power-of-ten reference, verified each
  programmatically — 0 remaining off-by-one instances.
- **ep duplication scan**: for each of `ep-01-02`, `ep-02-03`, `ep-03-01`, `ep-04-01`, extracted
  every widget `prompt` string (main steps + remedial check) and confirmed 0 exact duplicates
  remain after the fix.
- **mcq correct-first**: confirmed on every mcq touched (`dop-01-03` i2, `dpv-01-02` k2,
  `dpv-03-02` i1, `esn-02-02` i2 + remedial) — correct option is always `options[0]`.
- **Feedback invariants**: scripted scan of every `feedback` field (commonErrors/numericErrors/mcq
  options/pairErrors) across all 19 files — 0 fields under 25 characters, 0 negation-opening
  strings, confirmed on the fields this packet touched. (Note: several pre-existing, untouched
  `fallbackFeedback` fields elsewhere in these files are intentionally short by this codebase's
  house style — e.g. terse numeric-widget fallback cues distinct from the primary `feedback`
  strings the length/negation rule targets; none of those were edited by this packet and none are
  reported as findings here.)
- **reviewBasisHash**: `node scripts/session/print-review-basis.mjs` run for all 19 lesson IDs
  post-edit — all resolve cleanly (no missing/errored lessons); full hash values are recorded per
  record in the NDJSON deliverable.
- **Preserved invariants**: IDs, `conceptTag`s, widget types, and evaluator semantics
  (answer/tolerance/group configs) were left unchanged in every lesson except where a contract
  explicitly required a numeric answer to change (dop-02-02, esn-01-02, esn-04-01's implied value
  via feedback only, ep-01-02, ep-02-03, ep-03-01, ep-04-01 — all documented above with the new
  answer and its verification).

## Fail-closed items

- **`ep-03-01` / `c1` figure mismatch** — NOT fixed. `c1.figure` remains `distribute-area`, which
  renders `3(x + 4) = 3x + 12`, not the `3x(x + 4) = 3x² + 12x` the adjacent text teaches. Fixing
  this correctly (per the contract's own preferred option) requires either a new
  `src/components/figures.tsx` component or a change to an existing one — both are out of scope
  for a content-JSON implementation packet, and no existing figure in the exponents-polynomials
  set matches the exact worked numbers, so no safe repoint target exists either. This sub-item is
  explicitly flagged for a follow-on figures.tsx-authorized packet rather than silently worked
  around.

No other item in either contract was fail-closed; all other 18 REVISE contracts (dop-01-02,
dop-01-03, dop-02-02, dpv-01-02, dpv-02-01, dpv-02-02, dpv-02-03, dpv-03-02, esn-01-01, esn-01-02,
esn-02-02, esn-04-01, esn-04-02, esn-04-03, dc-03-01, ep-01-02, ep-02-03's duplication, ep-03-01's
duplication, ep-04-01) were fully implemented and verified.

## Return

```
packet_id: S320-IMPL-A4-A10
base_commit: ae399cc647fedf3f0a0db1aadfeb4cc04d3b90c1
contract_hash: n/a (contracts are prose in S320_ASSESS_A4.md / S320_ASSESS_A10.md, not hash-pinned)
role: implementation-worker
scope_ids: dop-01-02, dop-01-03, dop-02-02, dpv-01-02, dpv-02-01, dpv-02-02, dpv-02-03, dpv-03-02,
  esn-01-01, esn-01-02, esn-02-02, esn-04-01, esn-04-02, esn-04-03, dc-03-01, ep-01-02, ep-02-03,
  ep-03-01, ep-04-01 (19 lessons)
status: 18/19 contracts fully fixed; 1/19 (ep-03-01) partially fixed — duplication defect fixed,
  figure-mismatch sub-item fail-closed (see above)
changed_file_hashes: see reports/closure/cowork-staging/laneA-s320-impl-6.jsonl (sha256 per file,
  plus post-change reviewBasisHash captured via node scripts/session/print-review-basis.mjs)
evidence_refs: reports/closure/S320_ASSESS_A4.md, reports/closure/S320_ASSESS_A10.md,
  reports/closure/cowork-staging/laneA-s320-impl-6.jsonl
gates_passed: parse-check (19/19), hand/scripted arithmetic verification (19/19), esn-01-01
  zero-remaining-misrule scan, ep duplicate-prompt scan (4/4 lessons, 0 duplicates), mcq
  correct-first (4/4 mcqs touched), feedback>=25-chars + no-negation-opening (0 violations on
  touched feedback fields)
gates_failed: none
cache_invalidations: this packet supersedes the REVISE dispositions for these 19 lesson IDs in
  laneB-s320-A4-dispositions.jsonl and laneB-s320-A10-dispositions.jsonl — those entries' verdicts
  are now stale-by-fix and require independent re-assessment against current source
new_decision_required: ep-03-01 figure mismatch needs a figures.tsx-scoped follow-on packet (new
  or modified DistributeArea-family component rendering 3x(x+4)=3x²+12x) before that sub-item can
  close
risks: none identified beyond the one fail-closed item; no widget/evaluator semantics changed
  except the explicitly-contracted numeric-answer changes, all recomputed and verified
next_owner: independent Cowork assessor for re-verification of these 19 lessons against current
  source hashes, plus a figures.tsx-scoped implementation packet for the ep-03-01 figure sub-item
```
