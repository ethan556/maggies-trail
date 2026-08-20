# S316 — fractions-deeper-g3 residual defect fixes

Follow-up to `reports/closure/S316_LANEAV_G2_G3_VERIFICATION.md`, which found 3 residual defects
in `fractions-deeper-g3` after the prior revision packet (lane A / laneAV g2-g3). This packet
fixes exactly those 3 defects, in exactly the 3 named files. No other files were touched, and no
gate commands (`npm`/`vitest`/`tsc`) were run per instructions.

## 1. content/courses/fractions-deeper-g3/lessons/g3f-01-04.json — k3

**Defect:** `k3` was still a plain array-total count ("Four counters form a 2-by-2 array. Enter
the total number of counters.") — not a fraction-of-a-set task — carrying the mismatched
`Ssg2GridApplyNumeric` variant (which only ever generates "rows × columns, enter the total"
prompts) and the contextually-false fallback "Name the equal pieces the whole was cut into, then
count how many of them the question is about," which never applied to a counted array.

**Fix:**
- Redesigned `k3` to match the already-redesigned `k1`/remedial shape: a total split into a
  stated number of equal groups, find how many are in one group. New prompt: "A tray of 24
  muffins is divided into 6 equal rows. How many muffins are in one row?" (answer 4 = 24 ÷ 6).
- New context (muffins/tray/rows) and new numbers (24, 6, 4) chosen so the prompt does not
  normalize (digits → `#`) to the same text as any other step in the lesson — `k1`/remedial
  already share one normalized form ("A set of `#` counters is split into `#` equal groups. How
  many counters are in each group?"), so `k3` needed a different sentence, not just different
  numbers.
- `commonErrors` recomputed for the new numbers, mirroring `k1`'s error pattern: the row-count
  trap (6 — "That names the number of rows, not how many muffins land in one row.") and the
  subtract-instead-of-divide trap (18 = 24 − 6 — "That subtracts the row count from the tray
  instead of splitting it into 6 equal rows."). Neither trap equals the answer (4) or each other.
- `fallbackFeedback` replaced with a truthful statement of the actual task: "Split the tray into
  the stated number of equal rows, then count how many muffins land in one row."
- `successFeedback` updated to name the drawn numbers: "Correct — 4 muffins in each of the 6
  equal rows."
- **Variant removed.** `{gen: "g2-shapes-shares", form: "Ssg2GridApplyNumeric"}` was deleted.
  That generator (`src/lib/g2Variants.ts:101`) hardcodes `rows × cols → total` array prompts; it
  cannot produce "total split into N equal groups → size of one group." A scan of every `Ssg2*`
  form in `g2Variants.ts` (`GridApplyNumeric`, `GridApplyRead`, `CompareSharesMcq`, `NameAnyMcq`,
  `NameThirdMcq`, `PyramidNumeric`, `ShapeVocabMcq`, `ShapeVocabNumeric`, `ThirdsCountMcq`,
  `ThirdsCountNumeric`) and every other generator family found no form that produces this
  fraction-of-a-set division shape, so per the packet's own rule the key was removed rather than
  left mismatched. `k1` (already redesigned to the same shape in the prior packet) also carries
  no `variant` key, so this keeps `k1`/`k3` consistent with each other.

**Verification:** JSON parses. `conceptTag` (`g3f-set-model`), step `id`, widget `type`
(`numeric`), `tolerance`/`unit` (0/""), hints, and `cml` block all left untouched. Arithmetic:
24 ÷ 6 = 4 (independently re-derived by repeated subtraction: 24 − 6 − 6 − 6 − 6 = 0, 4 sixes).

## 2. content/courses/fractions-deeper-g3/lessons/g3f-02-05.json — k2

**Defect:** `k1` and `k2` both tested 8/2 = 4 with near-identical prompts ("8/2 equals a whole
number exactly. Which whole number is it?" vs. the same sentence plus "Group the halves into
complete wholes."), identical `commonErrors` (8, 2) and identical feedback.

**Fix:**
- `k2` redrawn to a new fraction pair: 10/5 = 2 (still an exact whole-number quotient, same
  `g3f-whole-as-fraction` concept). Chosen to be distinct from every fraction already in the
  lesson: `k1` = 8/2 = 4, `ch1` = 24/8 = 3, remedial = 12/4 = 3.
- New prompt phrasing: "How many wholes are hiding inside 10/5?" — distinct in both wording and
  normalized (digit→`#`) form from `k1` ("`#`/`#` equals a whole number exactly. Which whole
  number is it?"), `ch1`, and the remedial.
- `commonErrors` recomputed for 10/5: numerator-as-answer trap (10 — "That counts the PIECES.
  Every 5 of them rebuild one whole, so ask how many groups of 5 fit.") and denominator-as-answer
  trap (5 — "That is the piece size, not how many wholes 10 pieces make."). Neither equals the
  new answer (2) or each other.
- `successFeedback`: "Correct — 4." → "Correct — 2."
- `fallbackFeedback` left as-is ("Name the equal pieces the whole was cut into, then count how
  many of them the question is about.") — this text is shared verbatim across `k1`/`k2`/`ch1`/
  remedial already and remains literally true of the new 10/5 task (same task type, just new
  numbers), so no change was needed there.

**Verification:** JSON parses. `conceptTag`, step `id`, widget `type`, hints, `explanationVariants`
("How many fit inside?" / "That count is the whole.") and `cml` block untouched — the existing
explanation text already fits the new prompt without modification. Arithmetic: 10 ÷ 5 = 2
(independently re-derived by counting groups of 5 inside 10: 5, 10 → 2 groups).

## 3. content/courses/fractions-deeper-g3/lessons/g3f-03-02.json — remedial option o2

**Defect:** The remedial's distractor `o2` ("Fifths are always bigger than fourths") was a stale
leftover from the pre-revision Maya/Ben (halves vs. fourths) prompt. The redrawn prompt ("A
student compares 3/5 of one ribbon with 3/5 of a much longer ribbon...") uses only fifths and
never mentions fourths, so the option's own feedback had to explicitly disclaim it ("This
comparison never involves fourths..."), confirming it was not a real misconception grounded in
the drawn numbers.

**Fix:**
- Replaced `o2` with a misconception genuinely grounded in the drawn numbers (3/5 and 3/5, two
  different wholes): label "The amounts must be equal since both are 3/5"; feedback "3/5 names
  the SAME fraction of each whole, but the wholes differ in size, so the actual amounts differ
  too." This targets the real Grade 3 error of assuming matching fraction names guarantee
  matching amounts regardless of whole size — exactly the misconception the remedial's concept
  text and `o0`/`o1` are already built around.
- No other option touched. `o0` (correct: "The two ribbons (wholes) are not the same size"),
  `o1` ("The numerators don't match"), and `o3` ("There is no flaw — the comparison is valid")
  are unchanged.

**Verification:** JSON parses. `o0` remains `correct: true` and remains first in option order
(MCQ correct-first preserved). No trap/answer or trap/trap collision: `o2`'s claim ("amounts are
equal") is a different assertion from `o0` ("wholes differ in size," correct), `o1` ("numerators
don't match"), and `o3` ("no flaw"). Feedback (89 chars) is well over the 25-character floor and
does not open with a negation. `conceptTag` (`g3f-same-whole`), remedial `id`s, and every other
step in the lesson left untouched.

## Files touched (exactly 3, as scoped)

- `content/courses/fractions-deeper-g3/lessons/g3f-01-04.json`
- `content/courses/fractions-deeper-g3/lessons/g3f-02-05.json`
- `content/courses/fractions-deeper-g3/lessons/g3f-03-02.json`

## Not run (per instructions)

`npm run typecheck`, `npx vitest run`, `npm run validate:content`, `npm run lint:pedagogy`,
`npm run validate:native`, `node scripts/check-registration.mjs`, `npm run build` — none of
these were executed. All verification above is limited to: JSON parse-check on all 3 files,
manual re-derivation of the arithmetic in each changed widget, manual normalized-prompt
distinctness check against every other step in each lesson, and manual trap-vs-answer /
trap-vs-trap distinctness check for every changed distractor set. A human or a later gated pass
should still run the full gate sequence before this is considered closed.

## Ledger

Appended: `reports/closure/cowork-staging/laneA-g3f-residuals.jsonl` (3 records, one per file,
`rejected: false` for all three — none of the 3 defects warranted rejection; all were fixable
within scope).
