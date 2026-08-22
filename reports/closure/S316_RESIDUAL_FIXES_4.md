# S316 Residual Fixes 4

Scope: exactly 3 files, per task packet. No `npm`/`vitest`/`tsc` run (per instruction). Verification
below is JSON parse-check plus a scripted scan (Python) recomputing every drawn/tested value by
hand, run against the current working-tree content.

## Item 1 — content/courses/measure-money-time/lessons/mmt-02-01.json

**Defect (S316_LANEBV2_VERIFICATION.md, mmt-02-01 REVISE):** `ch1`'s `hints` were already fixed to
walk the real 3-item `matchPairs` (book 9in→10in, key 4in→5in, marker 12in→13in), but
`explanationVariants` on the same step was left byte-identical to its pre-fix text, still reading
"9 is close to the actual 8 inches — a good estimate." / "Being off by just 1 inch is a good
estimate." — no object in the widget has an actual length of 8 inches.

**Fix (only `steps[ch1].explanationVariants` touched):**

- Old: `["9 is close to the actual 8 inches — a good estimate.", "Being off by just 1 inch is a good estimate."]`
- New: `["The book (9 in) matches 10, the key (4 in) matches 5, and the marker (12 in) matches 13 — each real length is close to its match.", "Every match here is just 1 inch off: 9 rounds to 10, 4 rounds to 5, and 12 rounds to 13. Close counts for a good estimate."]`

Both variants now walk the actual 3-item `matchPairs` (l1 book 9→r1 10, l2 key 4→r2 5, l3 marker
12→r3 13), consistent with the already-fixed `hints`. No other field in `ch1` (widget, pairs,
pairErrors, hints, variant) was touched.

**Verification:**
- `python3 -m json.tool` parse: OK.
- `grep "actual 8 inches"` in the file: 0 matches (the only remaining "actual N inches" lines
  belong to other steps' own widgets, each internally consistent with its own object).
- Both new strings ≥25 chars, neither opens with a negation.
- `git diff --stat`: 1 file, 2 lines changed, both inside `explanationVariants`.

## Item 2 — content/courses/unlike-fractions-g5/lessons/g5u-01-02.json

**Defect (S316_LANEBV2_VERIFICATION.md, g5u-01-02 REVISE, new finding):**
`remedials[0].concept.figure` (`fa-multiplier`, static SVG, no props — always draws `1/2` →
`× 3/3 ↓` → `3/6`) renders immediately before `remedials[0].check`, whose prompt ("A learner
scales 1/2 to sixths but writes 1/6, changing only the bottom. What is the correct numerator?")
asked for exactly the numerator (3) the figure had just drawn as the finished answer.

`fa-multiplier` (`src/components/figures.tsx:3608`) takes no props and cannot be rebound to a
different fraction pair — it is hardcoded to `1/2 = 3/6`. Per the task's stated fallback, the
smaller fix is to change the check's tested pair, keeping the same misconception job
(keep-numerator-fixed-while-denominator-scales) and the same model-backed `numeric` widget with a
matching `previewDenominator`.

**Fix (only `remedials[0].check.widget` touched — prompt/answer/commonErrors/successFeedback):**

- Old prompt: `"A learner scales 1/2 to sixths but writes 1/6, changing only the bottom. What is the correct numerator?"`, answer `3`, traps `1`/`6` (1/2-specific feedback).
- New prompt: `"A learner scales 1/3 to sixths but writes 1/6, changing only the bottom. What is the correct numerator?"`, answer `2`, `previewDenominator: 6` (unchanged), traps:
  - `1` → `"Keeping the top fixed while the bottom doubles turns 1/3 into the much smaller fraction 1/6."`
  - `6` → `"Matching the numerator to the denominator makes the fraction equal to one whole, not one third."`
  - `successFeedback` → `"Correct — 2 — scaling by 2/2 has to reach the top as well, or the fraction's value silently changes to 1/6."`

`1/3` and `2/6` never appear as drawn text in `fa-multiplier` (which only ever draws `1/2`, `3/6`,
`3/3`), so the figure no longer pre-answers the check. The misconception tested (fixed numerator
while scaling the denominator) and the diagnostic job are unchanged; only the fraction pair moved.

Also restored literal UTF-8 (the file had been re-serialized with `ensure_ascii=True` by a prior
worker): rewrote with `json.dumps(..., indent=2, ensure_ascii=False)`, same 2-space indent style.
Working tree now has 18 literal em-dashes / 4 literal `×`, 0 `\uXXXX` escapes.

**Verification:**
- Parse OK.
- Scripted scan: figure `fa-multiplier` draws `{1/2, 3/6, 3/3}`; check's answer fraction is `2/6`
  — no overlap.
- Trap/answer/trap distinctness: `{1, 6, 2}` — 3 distinct values.
- New strings: `successFeedback` 107 chars, both `commonErrors` feedbacks 92/95 chars — all ≥25,
  none negation-opening.
- `git diff` (vs. working-tree-before-this-edit, confirmed by re-reading the file pre-edit):
  only `remedials[0].check.widget.{prompt,answer,commonErrors,successFeedback}` changed; the
  `remedials[0].concept` block, all named `steps`, IDs, `conceptTag`, and widget `type` are
  untouched. (The `git diff HEAD` also shows an unrelated pre-existing uncommitted delta from an
  earlier session — `narration`/figure-restore on the same concept block — which predates this
  edit and was not made by this task; isolated by re-reading the exact pre-edit JSON before
  writing.)

## Item 3 — content/courses/unlike-fractions-g5/lessons/g5u-01-04.json

**Defect (S316_LANEBV2_VERIFICATION.md, g5u-01-04 REVISE, new finding):**
`remedials[0].concept.figure` (`fm-common-denom`, static SVG, no props — always draws
`1/2 → 3/6` and `1/3 → 2/6`) renders immediately before `remedials[0].check`, an mcq asking which
plan is wrong when "a learner scales 1/2 and 1/3 both to sixths by ×3" — whose correct option
("1/3 needs ×2, not ×3 — only 1/2 needs ×3 to reach sixths") states exactly the two per-fraction
scaling facts the figure had just drawn.

`fm-common-denom` also takes no props and cannot be rebound. Per the task's stated fallback,
changed the check's tested fraction pair to one this lesson already legitimately uses elsewhere
(`1/4` and `1/6` → twelfths, scale factors 3 and 2 — the same pair `i1`/`i2`/`k1` in this same
lesson use) so the misconception/diagnostic job (two fractions need different scale factors to
reach a shared denominator; a single blanket factor is wrong) is preserved but the figure's own
`1/2`/`1/3`/`3/6`/`2/6` numerals no longer solve it.

**Fix (only `remedials[0].check.widget.{prompt, options[0..2].label, options[0..2].feedback}`
touched; `options[3]` — the "numerators added" trap — is fraction-pair-generic and left as-is):**

- Old prompt: `"To rename 1/2 and 1/3 both to sixths, a learner scales both by ×3. What is wrong with that plan?"`
- New prompt: `"To rename 1/4 and 1/6 both to twelfths, a learner scales both by ×3. What is wrong with that plan?"`
- `o0` (correct): `"1/6 needs ×2, not ×3 — only 1/4 needs ×3 to reach twelfths"` / `"Correct — 1/4 scales by 3 to reach 3/12, but 1/6 only needs ×2 to reach 2/12; each fraction gets its own factor."`
- `o1`: `"Nothing is wrong; ×3 works for both"` / `"Scaling 1/6 by ×3 gives 3/18, not twelfths at all — the factor must match each fraction's own denominator gap."`
- `o2`: `"Both fractions need ×6 instead"` / `"×6 way overshoots; 1/4 needs only ×3 and 1/6 needs only ×2 to land on twelfths."`
- `o3` (unchanged): `"The numerators should be added instead"` / `"Renaming scales top and bottom together; it never adds the numerators of the two original fractions."`

Arithmetic re-verified: 1/4 × (3/3) = 3/12 (so ×3 is correct for 1/4); 1/6 × (2/2) = 2/12 (so 1/6
needs ×2, not ×3); 1/6 × (3/3) = 3/18 ≠ twelfths at all (o1's claim holds); ×6 on either fraction
overshoots past 12ths (o2's claim holds). `1/4`/`1/6`/`3/12`/`2/12` never appear as drawn text in
`fm-common-denom` (which only ever draws `1/2`, `1/3`, `3/6`, `2/6`).

Also restored literal UTF-8 (file had `ensure_ascii=True` escapes): rewrote with
`json.dumps(..., indent=2, ensure_ascii=False)`, same 2-space indent style. Working tree now has
16 literal em-dashes / 14 literal `×`, 0 `\uXXXX` escapes.

**Verification:**
- Parse OK.
- Scripted scan: figure `fm-common-denom` draws `{1/2, 3/6, 1/3, 2/6}`; correct-option label
  `"1/6 needs ×2, not ×3 — only 1/4 needs ×3 to reach twelfths"` contains none of those substrings.
- Exactly one `correct: true`, on the first option (`o0`) — mcq correct-first invariant held.
- Four option labels distinct.
- New/changed feedback strings: 112 / 110 / 79 chars — all ≥25, none negation-opening.
- Structural diff: only `remedials[0].check.widget` fields listed above changed; `remedials[0]`
  `concept` block (body/narration/figure) and all named `steps` (`c1`…`r1`, including `k1`'s own
  distinct "Scale 1/6 by ×2..." numeric check) confirmed byte-identical to the pre-edit read.

## Gate note

Per task instruction, `npm`/`vitest`/`tsc` were **not** run. All three files pass
`python3 -m json.tool` parse-check. All verification above is independent scripted recomputation
(figure-drawn-number sets vs. check-answer values; trap/answer distinctness; feedback length and
non-negation; option correct-first) plus manual diff review, not test-suite execution. A full gate
run (`npm run typecheck`, `npx vitest run`, `npm run validate:content`, `npm run lint:pedagogy`,
`npm run validate:native`, `node scripts/check-registration.mjs`, `npm run build`) is still owed
before these three files can be considered gate-clean; that is out of this packet's scope.
