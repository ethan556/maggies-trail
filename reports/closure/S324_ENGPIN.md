# S324 ENG-PIN — test-pin-authority packet, implementation evidence

Worker: cowork-s324-engpin. Branch: codex/v4-s244-authored-visual-wave. Date: 2026-08-21.
Scope: the five signed ESCALATE records `s323-P3-g3f-01-03`, `s323-P3-g3f-01-05`, `s323-P3-g3f-02-01`,
`s323-P3-g3f-02-02`, `s323-P6-g2a-01-03` in `reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl`
(lines 2857–2860, 2896), whose blocker was in each case a src-side pin this packet holds authority over.
Contracts: `reports/closure/S322_ASSESS_F10.md` (g3f), `reports/closure/S322_ASSESS_F5.md` §59 (g2a),
context `S323_FIX_P3.md` / `S323_FIX_P6.md`, standard `S316_ADJUDICATION_REMEDIAL_STANDARD.md` (S316-R R1–R6).
No npm/vitest/tsc/build was run (hard constraint). All proofs are `node` / `npx tsx` one-offs
(scratchpad `s299hash.mjs`, `verify.ts`, `verify286.ts`) that replay the pinned tests' OWN algorithms and
predicates, plus `Lesson.parse`, `lintLesson`, `widgetIntegrityErrors`, and `evaluate` from `src/lib`.

Files changed (7, all in-scope; no other tracked file touched by this packet):
- `content/courses/fractions-deeper-g3/lessons/g3f-01-03.json` (remedial check prompt)
- `content/courses/fractions-deeper-g3/lessons/g3f-01-05.json` (remedial check prompt)
- `content/courses/fractions-deeper-g3/lessons/g3f-02-01.json` (remedial check prompt + traps)
- `content/courses/fractions-deeper-g3/lessons/g3f-02-02.json` (remedial check widget; ch1 widget/hints; ch1 variant removed)
- `content/courses/arrays-even-odd-g2/lessons/g2a-01-03.json` (i2 renumber, 4 value lines)
- `src/lib/session299.fractionsDeeperG3VisualCopyRepair.test.ts` (4 `nonCopyHash` values ONLY)
- `src/lib/session286.arraysEvenOddG2Progression.test.ts` (1 `expectedSecondJobs` prompt value ONLY)

No assertion was deleted, loosened, or wildcarded; every pin was re-pinned to the exact recomputed value
per CLAUDE.md/S316 §7.6 ("re-pin in the same packet, state the break in the log").

Baseline (before any edit): all four session299 `nonCopyHash` pins recomputed with the test's own
algorithm (structuredClone → delete named concept step's body/narration → sha256(JSON.stringify)) and
MATCHED the working tree — so every post-edit mismatch is attributable solely to the intended change.

## Pin ledger (old → new)

| Pin | Old | New |
|---|---|---|
| session299 g3f-01-03 nonCopyHash | `d469552451800b62603fe1c73bbe3eebb3c7733966f8c4f05728cf7a79a5f3e2` | `78d18bfb5c8507fc2e1acac2f7e96194249d62c388a0bbff570b07ef49ef6358` |
| session299 g3f-01-05 nonCopyHash | `5e50b9a9cb587861212c54ad6b62c68dcc84226ce6966784a3706439df1da861` | `e6f62bd8f55678b6b2771a05b4f5e77361ecfeef611c0e4d40bdffc8efafe1e6` |
| session299 g3f-02-01 nonCopyHash | `2cfc9aea2a8157846183c61b8bdc0c7eabe817269e2010689ac5463ca44789f0` | `e242ad02c59d410c84d1bcc319314fe8e39c200fa472c206408a37a45d4b6f11` |
| session299 g3f-02-02 nonCopyHash | `6189227bd2337aa79baa3701d4d4fa52c807af8c462e7c81c1624e0ce438e765` | `4b8dc11b070db6ad28490b2b2bb4dd9599b126dd7d7b016c9a5948f602a769ec` |
| session286 g2a-01-03 i2 prompt | `"Pair up 14 counters. Odd or even?"` | `"Pair up 12 counters. Odd or even?"` (answer `"even"` unchanged) |

Final proof run (end state): recomputing each g3f hash with the test's own algorithm against the edited
lesson equals the value now pinned in the test source (pins parsed FROM the test file, not restated) —
4/4 MATCH; the session286 predicate replayed against the updated pin passes end-to-end. Test-green
equivalence holds for both pinned suites without running vitest.

## g3f-01-03 — remedial rewrite (S316-R Shape α)

- Defect (confirmed live pre-edit): `rem-g3f-build-k` byte-identical to k1.
- Before: `"Compute 4 × 1/6 as ?/6. What is the numerator?"` (answer 4, traps 6/10).
- After: `"Drop a sixth-size piece into a cup 4 times, one piece at a time. The cup now holds ?/6. What is the numerator?"` —
  route shift to the lesson's own collecting-pieces representation; answer 4, previewDenominator 6,
  traps 6 ("6 is the DENOMINATOR…") and 10 ("Adding the two numbers…" = 4+6) kept verbatim, both still
  literally true of the printed 4 and 6. successFeedback/fallback unchanged.
- S316-R: R1/R2/R3 pass vs k1 and every widget step (one-off probe, S255 normalization); R4: not
  producible by `g4-fractions/faWholeTimesFractionNumeric`, whose sole template is
  `"Compute ${w} × ${n}/${den}. Before converting to a mixed number, what is the numerator?"`
  (`src/lib/g4Variants.ts:459`); R5 verified (traps unique, ≠ answer, ≥25-char true feedback);
  R6: remedial concept body states no "4".
- Math: 4 × 1/6 = 4/6 → numerator 4 ✓. Prompt unique corpus-wide (1 occurrence).
- reviewBasisHash: `120ba5c3594e6eea12a2cfc467c9997f78366ebd77076a01b553d7f3ed6d5f15`. Disposition KEEP.

## g3f-01-05 — remedial rewrite (S316-R Shape α)

- Defect (confirmed live pre-edit): `rem-g3f-ruler-k` byte-identical to k1 (eighths-ruler 1/2 mcq).
- Before: `"On a ruler marked in eighths, which mark lands exactly on 1/2?"`.
- After: `"Maggie's toy ruler shows eighths. She slides her finger from 0 and stops exactly halfway to 1. Which mark is under her finger?"` —
  enacted route; all four options (correct `"The 4/8 mark"` at o0; 2/8; 1/8; "There is no such mark")
  and their feedback kept verbatim, each still literally true of the halfway job.
- S316-R: R1/R2/R3 pass vs k1 AND k3 ("A learner stops at 2/8 for one half…") and all widget steps;
  R4 trivially clear (no mcq generator declared in the lesson); R6: remedial concept lists
  "1/8, 2/8, 3/8 and onward" but never 4/8. Math: half of 8 jumps = 4 jumps → 4/8 = 1/2 ✓.
- The record's other named defects (k1 == g3f-02-04/ch1, ch1 == g3f-03-04/k2) were repaired on the
  partner side in S323-P3; re-verified at end state: both byte-equalities are gone (partner prompts now
  "On a SIXTHS number line…" and "A hiker walks 2/5 mile…").
- reviewBasisHash: `90d2eb46f93b7b86e9e512a6f80095512741dde12d20c512b251e7b4c1159124`. Disposition KEEP.

## g3f-02-01 — remedial rewrite (route shift + diagnostic trap)

- Defect (confirmed live pre-edit): `rem-g3f-thirds-line-k` byte-identical to k1 (garden-bed thirds count),
  with the extra constraint that k3 shares k1's template ("paper strip" noun swap) — R2 had to clear both.
- Before: `"A garden bed is split into thirds. How many equal pieces are there?"` (answer 3, traps 1/2).
- After: `"A THIRDS number line runs from 0 to 1. Counting the equal jumps between the marks, how many jumps make the whole trip?"` —
  answer 3 held; traps recomputed per R5 for the printed scenario: **4** ("That counts the tick marks.
  A thirds line shows four marks, but the fraction lives in the three jumps between them." — exactly the
  marks-vs-spaces slip the remedial concept teaches; four marks 0, 1/3, 2/3, 1 vs three jumps ✓) and
  **2** (halves confusion, feedback kept verbatim, still true). Trap 1 dropped as implausible for a
  jump-count stem (replaced by the mark-counting diagnostic).
- S316-R: R1/R2/R3 pass vs k1, k3, and all widget steps; R4: not producible by
  `g2-shapes-shares/Ssg2ThirdsCountNumeric`, whose sole template is
  `"If the ${whole} is split into thirds, how many equal parts are there?"` (`src/lib/g2Variants.ts:112`);
  R6: remedial concept body is digit-free. Prompt unique corpus-wide.
- reviewBasisHash: `2fae3776f2322a4c66056fd420dc932f5384cc6d50ab1e8089cd65c362c29db0`. Disposition KEEP.

## g3f-02-02 — remedial rewrite + ch1 replacement

- Defects (confirmed live pre-edit): `rem-g3f-sixths-eighths-k` byte-identical to k1
  ("Which is bigger: a half or a third?"); ch1 needed its own on-tag sixths-eighths item (its old
  half-vs-fourth mcq had byte-duplicated g3f-01-02/k2's pre-S323 state).
- Remedial after: `"Two same-size sandwiches: the first is cut into 2 equal shares, the second into 3 equal shares. Which sandwich gives the bigger share?"` —
  correct `"the sandwich cut into 2 shares"` at o0; distractors 3-share cut and same-size, all feedback
  recomputed and literally true. Half-vs-third quantities (2 vs 3) deliberately retained: the injected
  remedial concept states "1/8 is less than 1/6", so a sixths/eighths check would have had its answer
  on screen (R6); the 2-vs-3 concrete check exercises the same bigger-bottom-smaller-piece invariant
  without the adjacency. R4: not producible by `Ssg2CompareSharesMcq`
  (`"Which is ${smaller|bigger}: ${shareName} or ${shareName}?"`, `src/lib/g2Variants.ts:100`).
  R1/R2/R3 pass vs k1 and all widget steps.
- ch1 after: `"Two identical number lines run 0 to 1. One has a dot at 5/6, the other a dot at 5/8. Which dot sits farther from zero?"` —
  on-tag (g3f-sixths-eighths), same-numerator comparison squarely on 3.NF.A.3d. Correct
  `"The dot at 5/6"` at o0 (5/6 = 20/24 > 15/24 = 5/8 ✓); distractors: 8-is-bigger reversal, same-point,
  cannot-be-decided — four options, distinct recomputed feedback, no length leak (correct label is not
  an outlier: 14/14/31/20 chars). Per the signed record's implementer note the `Ssg2CompareSharesMcq`
  variant was REMOVED from ch1 (the g2 solver's vocabulary is half/third/fourth only — it cannot carry a
  sixths/eighths surface): an mcq without `variant` carries no solver clause in session195, and the
  course's family-usage invariant ("both families used") still holds — k1 keeps `Ssg2CompareSharesMcq`
  and g3f-02-01 k1/k3 keep `Ssg2ThirdsCountNumeric`. Middle hint refreshed to
  `"Same count? Compare jump sizes."` (old hint addressed the removed same-size-add job).
- Within-lesson exact/normalized/payload uniqueness of all step prompts re-verified (session252's own
  predicate); old cross-lesson duplicate vs g3f-01-02/k2 confirmed gone; both new prompts unique corpus-wide.
- reviewBasisHash: `c7e2621611938234a6bc0da774a48c62ee7590e4cb896ebbcf002748cf9218af`. Disposition KEEP.

## g2a-01-03 — contracted i2 renumber + session286 re-pin

- Defect (confirmed live pre-edit): i2 `oddEvenPairs` byte-identical to g2a-01-01/i1
  ("Pair up 14 counters. Odd or even?"), blocked by session286's verbatim prompt pin.
- After (exactly the four contracted value lines — see `git diff`): n 14 → 12; prompt
  `"Pair up 12 counters. Odd or even?"`; successFeedback `"Yes — 12 makes 6 pairs with none left over."`;
  oddFeedback `"12 pairs up completely (6 pairs, 0 left). No leftover means even."` (63 chars,
  wrong-parity slot only). Math: 12 = 6 pairs + 0 left → even ✓. answer `"even"` unchanged, so only the
  pin's prompt string needed updating.
- One-off replay of session286's own predicate against the UPDATED pin (parsed from the test source):
  type/prompt/answer equality, `JSON.stringify(i2) !== JSON.stringify(i1)`, `widgetIntegrityErrors` empty,
  `evaluate({paired: 6, choice: "even"}).correct === true` — ALL PASS. session194's oddEvenPairs clauses
  (parity truth, wrong-parity-slot-only, ≥25 chars) re-verified. "Pair up 12 counters" is unique in the
  course; byte-identity with g2a-01-01/i1 eliminated.
- Pre-existing, uncontracted, untouched (per F5 §59's do-not-touch clause, recorded not fixed):
  remedial check is a byte-copy of k1 ("7 + 7 = ?") — the course-wide remedial debt class named in
  S323_FIX_P6; the i1~i2 "pair up # counters" normalized pair is the session286-sealed designed
  retrieval rep; k1/k3/ch1 doubles reps are the approved fluency branch.
- reviewBasisHash: `d990063dccf968e6f79789fb207d34bab9e1eac697719f886255191933de7b59`. Disposition KEEP.

## Dispositions

`reports/closure/cowork-staging/laneA-s324-engpin.jsonl` — 5 records
(`s324-engpin-g3f-01-03/-01-05/-02-01/-02-02`, `s324-engpin-g2a-01-03`), all KEEP, schema-validated
(parseable JSONL, 64-hex `reviewedBasisHash` from `print-review-basis.mjs` at post-edit state,
ISO-8601 UTC `reviewedAt`). Escalations remaining: none — all five discharged.

## Gate impact statement

- `session299.fractionsDeeperG3VisualCopyRepair`: green by construction — body/narration contract
  strings untouched (verified equal to the test's own `body` fields), figures untouched, and each
  re-pinned `nonCopyHash` equals the recomputed value.
- `session286.arraysEvenOddG2Progression`: green by construction — replayed predicate passes.
- `session195`, `session252.fractionsDeeperG3CourseIntegrity`, `session194`, `session261`: their
  operative predicates (lint, schema, widget integrity, evaluate truth, family usage, within-lesson
  step collision scans, oddEvenPairs slot rules) were re-run as one-offs over the edited lessons — all pass.
  Remedials are outside session195/session252-collision scan scope; no step these suites pin was changed
  except g3f-02-02/ch1, whose new shape satisfies every asserted clause (≥3 options, one correct at o0,
  unique feedback, evaluate agreement, no variant ⇒ no solver clause).
