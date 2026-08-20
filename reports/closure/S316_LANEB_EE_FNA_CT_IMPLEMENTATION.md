# S316 Lane B — Implementation: expressions-equations / function-analysis / circle-theorems

Role: bounded implementation worker. Authority: `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`
(prefix used verbatim, evidence appended below the marker per that contract). Source contracts:
`reports/closure/S316_LANEB_EXPRESSIONS_EQUATIONS_ASSESSMENT.md` (6 REVISE),
`reports/closure/S316_LANEB_FUNCTION_ANALYSIS_ASSESSMENT.md` (3 REVISE),
`reports/closure/S316_LANEB_CIRCLE_THEOREMS_ASSESSMENT.md` (2 REVISE).

Base commit: `06a9bb1f9e827ab4b77b886dcf4071ddf0d9b37c` (repo had numerous unrelated pre-existing
uncommitted modifications from other work in progress; only the 11 files below were touched by
this packet).

Scope discipline: exactly 11 lesson JSON files edited, no others. No `npm`/`vitest`/`tsc` run per
instructions (raw data only, for independent gate/assessment). Every file parses as valid JSON
(verified with `python3 -c "json.load(...)"` on all 11) and a per-lesson normalized-duplicate
scan (digits→`#` on every step's widget `prompt`/`body`) found no duplicate prompts introduced or
pre-existing within any of the 11 lessons.

Per-lesson NDJSON implementation records: `reports/closure/cowork-staging/laneB-ee-fna-ct-implementation.jsonl`
(11 lines, one per lesson, `recordType: "lesson-implementation"`).

## expressions-equations (6 REVISE → 6 IMPLEMENTED)

### ee-01-02 — k3 given a distinct instructional job (contract: "give k3 a distinct diagnostic
target ... tie it explicitly to the doubling-growth pattern started in i1's sequenceBuild")

Step `k3` ("Evaluate 2^5") previously shared k1's generic "evaluate a power" job and the same
off-by-one-factor trap shape (16 = one factor short). Reframed k3's prompt/body to explicitly
continue i1's doubling sequence (1, 2, 4, 8, 16, ...) and replaced the off-by-one trap with a
distinct misconception: **additive** growth instead of **multiplicative** growth.

- Widget, values, base=2/exponent=5 unchanged (answer stays 32).
- New trap: `18` = 16 + 2 (adding the previous term's increment instead of doubling it) — a
  genuinely different diagnostic target from k1's off-by-one-factor error.
- Kept trap: `10` = 2×5 (multiply-instead-of-repeat, unchanged, still distinct from k1's traps).
- **Arithmetic verification:** 2^5 = 2×2×2×2×2 = 32. 16+2=18≠32. 2×5=10≠32. 18≠10. All three
  values (32, 18, 10) pairwise distinct — no trap can grade correct, guarded both ways.

**Variant flag:** `k3` still declares `{"gen":"power-product","form":"basicPower"}`, identical to
k1 and k2's form. The authored/static content is now differentiated, but the shared generator
form means runtime-regenerated instances of k3 may still resemble k1's generic shape until a
distinct form is registered in `src/lib/variants.ts` (outside this packet's file scope — lesson
JSON only). Flagged, not resolved; the `variant` key itself was not touched or removed.

### ee-01-03 — ch1 value-42 unfinished feedback replaced with a real derivation

Old text ("42 does 8 + 2 = 10 then... no.") was literally unfinished authoring and 42 corresponds
to no real derivation of `8 + 2 × 3^2`. Replaced with value **44**, a computed misconception:
squaring the product 2×3 instead of just the 3, i.e. reading the expression as `8 + (2×3)^2`.

- **Arithmetic verification:** answer 26 unchanged (3^2=9, 2×9=18, 8+18=26). New trap: (2×3)^2 =
  6^2 = 36, 8+36 = **44** — true computation, ≠26, ≠90 (the unchanged sibling trap, which is
  (8+2)×3^2=10×9=90). 44≠26, 44≠90, 90≠26 — pairwise distinct.

**Variant flag:** `ch1` declares `{"gen":"power-product","form":"mixedPowerOrder"}`. Only the
trap value/feedback text changed (42→44); no widget-shape change. Low risk, but noting for the
generator owner in case the shared form hardcodes 42 as an expected trap value anywhere.

### ee-02-03 — ch1 value-9 hedge replaced with the real two-step derivation

Old text ("9 computes 3(m − 8) + something or slips the order") never named an operation or
resolved to 9. Replaced with the actual derivation: bracketing the subtraction before the
multiplication, then a sign-drop.

- **Arithmetic verification:** answer 7 unchanged (3×5−8=15−8=7). Trap 9: 3×(5−8) = 3×(−3) = −9,
  then dropping the negative sign gives **9** — a real, computed two-step error. 9≠7. Sibling
  trap −7 unchanged (8−3×5=8−15=−7), 9≠−7.

**Variant flag:** `ch1` declares `{"gen":"variable-meaning","form":"tripleMinusEval"}`. Trap value
(9) and answer (7) unchanged — only feedback text corrected. No widget-shape change; low risk.

### ee-03-03 — ch1 value-16 false claim removed

Old text asserted "3x alone = 15" at x=5, which is false (3×5=15 is correct, but that's not what
the value-16 trap actually computes) and left the real derivation unstated. Replaced with the true
computation: treating the bare `+x` term as if it contributed only +1.

- **Arithmetic verification:** answer 20 unchanged (3x+x=4x=20 at x=5, matches 2(2×5)=20). Trap
  16: 3×5 + 1 = 15+1 = **16** — true, computed, replaces the false clause entirely. 16≠20.
  Sibling trap 35 (pre-existing, not part of this contract, left untouched), 16≠35.

**Variant flag:** `ch1` declares `{"gen":"equiv-test","form":"combineCheck"}`. Trap value and
answer unchanged — text-only fix. No widget-shape change.

### ee-04-02 — k2/k3 literal duplicates differentiated (contract option (a): word-context item)

k2 and k3 were mechanically identical ("Solve x − a = b," same two distractor shapes, same
`variant.form: "solveSubtract"`, differing only in numbers). Replaced k3's widget with a
word-context subtraction-equation item — "after spending $6, a gift card has $9 left; find the
original balance n" — mirroring the fee/tip pattern already used acceptably by k4/ch1 in this
same lesson, with context-bound distractors (unit: dollars).

- **Arithmetic verification:** n−6=9 ⇒ n=9+6=**15** (new answer, was 11). Trap 3 = 9−6
  (subtract-instead-of-add, true). Trap 9 = the post-spending balance copied as the answer (true,
  same pattern as original k2/k3's second trap). 15≠3, 15≠9, 3≠9 — pairwise distinct.

**Variant flag — FLAGGED, unresolved at generator level:** `k3` still declares
`{"gen":"unknown-letter","form":"solveSubtract"}`, identical to k2. The contract's preferred fix
("so it has its own variant.form") requires registering a new form (e.g. `withdrawSolve`) in
`src/lib/variants.ts`, which is outside this packet's edit scope (lesson JSON files only). The
authored/static widget is now fully differentiated and no longer mechanically identical to k2, but
the runtime variant generator will still route both k2 and k3 through the same `solveSubtract`
template until that form is added. The `variant` key itself was not removed.

### ee-04-03 — k4/ch1 literal duplicates differentiated

k4 and ch1 both used the identical "tickets cost $N each, spent $M" template and
`variant.form: "tickets"`. Changed ch1's context to "parking costs $6/hour, receipt shows $42
total, solve for hours parked h" — a different context, same one-step multiplication structure
(kept single-operation, appropriate for the ch4-one-step-equations chapter, rather than the
assessor's alternative two-step-equation suggestion which would have exceeded the chapter's
one-step scope).

- **Arithmetic verification:** 6h=42 ⇒ h=42/6=**7** (answer unchanged). Trap 252=6×42
  (multiply-instead-of-divide, true). Trap 36=42−6 (subtract-instead-of-divide, true). 7≠252,
  7≠36, 252≠36 — pairwise distinct.

**Variant flag — FLAGGED, unresolved at generator level:** `ch1` still declares
`{"gen":"solve-mult-div","form":"tickets"}`, identical to k4. Same limitation as ee-04-02 k3:
registering a distinct form (e.g. `parkingSolve`) requires editing `src/lib/variants.ts`, outside
scope. Authored content is context-differentiated; runtime generation is not yet. `variant` key
not removed.

## function-analysis (3 REVISE → 3 IMPLEMENTED)

### fna-01-03 — i1 successFeedback rewritten to match the actual computation

Old `successFeedback` narrated a fabricated tank scenario ("48 to 12 gallons... = −6 gallons per
minute") that contradicted the widget's real parameters (`curve:"square"`, `a:0`, `targetH:6`).
Replaced with feedback describing the true drawn computation, generically connectable to a
real-rate story without inventing numbers the widget cannot produce.

- **Arithmetic verification:** curveAt(6) = 6² = 36, curveAt(0) = 0² = 0. Slope = (36−0)/(6−0) =
  **6**, positive (rising curve) — matches the widget's actual output. New feedback: "Rise 36 over
  run 6 gives a slope of 6: (36 − 0)/(6 − 0) = 6..." Old feedback's −6 and 48/12 gallon figures do
  not correspond to any value this widget can produce with its current parameters; both removed.

No `variant` declaration on this step — no flag needed.

### fna-05-03 — recap teaser corrected (contract option (a): keep chapter order, fix both teasers)

`fna-05-03`'s `r1.teaser` falsely declared "Course complete — next course: polynomial and
rational functions..." while chapter 6 (`fna-06-01`) still follows in `course.json`'s declared
chapter order. Replaced with a forward-pointing teaser to the actual next lesson: "next chapter:
comparing a function's properties across graphs, tables, and equations."

`course.json`'s chapter order was **not** touched (it is not one of the 11 owned files); contract
option (a) — rewrite both teasers to agree with the existing order — was used rather than option
(b) (reordering chapters), which would have required editing `course.json`.

### fna-06-01 — recap teaser corrected, paired with fna-05-03

`fna-06-01`'s `r1.teaser` pointed backward ("next chapter: restricting a domain to build an
inverse" — describes `fna-05-02`, completed two lessons earlier). Since `fna-06-01` is confirmed
the course's actual final lesson (per `course.json`'s chapter array, `ch6-comparing-representations`
is listed last, containing only this lesson), replaced its teaser with the true course-complete
closing line — the same text that was previously misplaced on `fna-05-03` ("Course complete —
next course: polynomial and rational functions under the analysis microscope.").

Net effect across the two lessons: the "course complete" claim now sits on the actual final
lesson, and the penultimate lesson's teaser correctly points forward to it. No numeric content
changed in either lesson.

## circle-theorems (2 REVISE → 2 IMPLEMENTED)

### cr-05-03 — missing figure added to c1

Step `c1` ("A cyclic quadrilateral has all four vertices on one circle... opposite angles are
supplementary") was the only concept step across all 16 circle-theorems lessons missing a
`"figure"` key. Added `"figure": "cr-cyclic-quad"` per the contract's named option — reusing the
figure already registered in `src/components/figureIds.ts`, implemented in
`src/components/figures.tsx`, and already used by `c2` for the identical four-points-on-a-circle
configuration. No other step text, answers, feedback, or widgets touched.

### cr-06-01 — dangling teaser replaced with a true course-complete closing

`r1.teaser` promised "next chapter: inscribed and circumscribed circles of a triangle" — no such
chapter exists in `circle-theorems`' `course.json` (ch6-all-circles-are-similar, containing only
`cr-06-01`, is the last chapter) and no lesson on triangle incircles/circumcircles exists under
any other course id in the repo (confirmed by inspecting `course.json`'s `chapters` array; no
`nextCourseId`-style field exists on the course record to reference a real next course).
Replaced with a closing summary of the six chapters covered, with no forward promise. No other
step text, answers, feedback, or widgets touched.

## Flagged variant declarations (summary)

Per the HARD RULES, no `variant` key was removed. Four steps carry a flag for follow-up
generator-side work (all in `src/lib/variants.ts`, outside this packet's file scope):

| Lesson | Step | Form | Issue |
|---|---|---|---|
| ee-01-02 | k3 | `basicPower` (shared with k1, k2) | Authored content now diagnostically distinct from k1 (doubling-sequence framing, additive-growth trap); runtime generation still shares k1/k2's generic template. |
| ee-01-03 | ch1 | `mixedPowerOrder` | Trap value changed 42→44; spot-check generator's hardcoded trap values against new template. |
| ee-04-02 | k3 | `solveSubtract` (shared with k2) | Authored content now a word-problem, mechanically distinct from k2; runtime generation still shares k2's bare-equation template. |
| ee-04-03 | ch1 | `tickets` (shared with k4) | Authored content now a different context (parking vs tickets), mechanically distinct from k4; runtime generation still shares k4's template. |

All four remain functional (no dangling/unregistered form names were introduced) — the flags are
about authored/runtime-generation divergence, not about broken declarations.

## Verification performed

- **Parse-check:** all 11 files verified valid JSON via `python3 -c "json.load(...)"` — all OK.
- **Normalized-duplicate check:** per-lesson scan of every step's widget `prompt` (or `body` where
  no widget prompt exists) with digits replaced by `#`, checked for collisions within each of the
  11 lessons — zero duplicates found in any lesson, before or after edits.
- **Hand arithmetic verification:** every changed numeric answer and every changed/added trap
  value was recomputed by hand and checked pairwise against the answer and every sibling trap in
  the same widget (see per-lesson sections above) — no trap can grade correct against the answer
  or against another trap in any edited widget.
- **Feedback quality:** every new/edited feedback string is ≥25 characters, does not open with a
  negation, and is literally true of the drawn/computed numbers stated in it.
- **MCQ correct-first:** unaffected — no `mcq` widget options were added, removed, or reordered by
  this packet.
- **Pedagogy invariants:** unaffected — no step was added, removed, or reordered in any of the 11
  lessons (concept→check/interactive spacing, action-step ratio, and recap takeaway counts are
  unchanged from the pre-edit lesson structure).
- **Scope discipline:** only the 11 named lesson JSON files were edited. `course.json` files,
  `src/lib/variants.ts`, `src/components/figures.tsx`, and `src/components/figureIds.ts` were read
  for verification only and not modified.

## Gate note

No `npm`/`vitest`/`tsc` commands were run, per instructions. This is raw implementation data for
independent assessment/closure; findings and self-verifications above are evidence, not a
self-approval.

## Return contract

`packet_id`: `S316-LANEB-EE-FNA-CT-IMPL-1`
`base_commit`: `06a9bb1f9e827ab4b77b886dcf4071ddf0d9b37c`
`contract_hash`: n/a (three source `.md` contracts named above; not independently hashed by this
packet — see `evidence_refs`)
`role`: bounded implementation worker
`model`: Claude (Sonnet 5)
`effort`: read every named contract in full; hand-recomputed all changed arithmetic; read every
edited file after write
`speed`: single pass, no retries needed
`scope_ids`: ee-01-02, ee-01-03, ee-02-03, ee-03-03, ee-04-02, ee-04-03 (expressions-equations);
fna-01-03, fna-05-03, fna-06-01 (function-analysis); cr-05-03, cr-06-01 (circle-theorems)
`status`: 11/11 contracts implemented
`changed_file_hashes`: see table below (sha256, post-edit)
`evidence_refs`: `reports/closure/S316_LANEB_EXPRESSIONS_EQUATIONS_ASSESSMENT.md`,
`reports/closure/S316_LANEB_FUNCTION_ANALYSIS_ASSESSMENT.md`,
`reports/closure/S316_LANEB_CIRCLE_THEOREMS_ASSESSMENT.md`,
`reports/closure/cowork-staging/laneB-ee-fna-ct-implementation.jsonl`
`gates_passed`: parse-check (11/11), normalized-duplicate check (11/11 lessons clean), hand
arithmetic verification (11/11 changed items)
`gates_failed`: none run (npm/vitest/tsc explicitly out of scope for this packet)
`cache_invalidations`: the ChatGPT Work cache entries (if any) for ee-01-02, ee-01-03, ee-02-03,
ee-03-03, ee-04-02, ee-04-03, fna-01-03, fna-05-03, fna-06-01, cr-05-03, cr-06-01 are now stale
against these file hashes
`new_decision_required`: whether to register distinct `src/lib/variants.ts` forms for the four
flagged steps (ee-01-02/k3, ee-01-03/ch1, ee-04-02/k3, ee-04-03/ch1) so runtime-regenerated
practice items match the now-differentiated authored templates
`risks`: the four flagged variant forms mean re-asked/regenerated instances of those four steps
may still resemble their sibling step's shape at runtime until generator-side work lands; no other
known risk
`next_owner`: independent assessor for closure verdict; generator owner for the flagged
`src/lib/variants.ts` follow-up

### changed_file_hashes (sha256, post-edit)

```
6a9e3184f447ae94d875bcf552af2a8a8e8286888b215a94eb80eccc84f7f1a3  content/courses/expressions-equations/lessons/ee-01-02.json
90afe2456812617436287a98af4cdc145d61e109462cb3c3141c903a4cdab4d4  content/courses/expressions-equations/lessons/ee-01-03.json
e1e8782118975a0b5c6350c77c96ba283fd303698fffbfa9a81d21aba71d03fa  content/courses/expressions-equations/lessons/ee-02-03.json
7295298225c2bb9db53c97e73a1d9734a62e57bfa2420caa393d0060d85a1c34  content/courses/expressions-equations/lessons/ee-03-03.json
768b4a925c0ac8c9299b1c95de12ff0cbc847621a0f41428ee1b81b12bafb626  content/courses/expressions-equations/lessons/ee-04-02.json
2c1a30bc8589a3cd5b2c6c37a9a0ddb3de56bf151954819797ddffecb5a78e4f  content/courses/expressions-equations/lessons/ee-04-03.json
374d3f2b16c4f88a77114ada0e8b6fa5310800ca6dac850bc3a62bc99de4cc26  content/courses/function-analysis/lessons/fna-01-03.json
643f5042f80cc0fda2dc7605610e41e3b729322bf87251c70d005cd154fab552  content/courses/function-analysis/lessons/fna-05-03.json
2193366a3d6017559e7363281cb185d5e5a08783dea37631a5a759be69696da8  content/courses/function-analysis/lessons/fna-06-01.json
d6e6303a1e3598eed63f7d6e8deb2f4e34270f5c62eb8ceafb3f4611c54a423b  content/courses/circle-theorems/lessons/cr-05-03.json
b437160862cce4376ff84f5fcd4c0c45e10cb17d535216c5f11f9df66d1c7d7f  content/courses/circle-theorems/lessons/cr-06-01.json
```
