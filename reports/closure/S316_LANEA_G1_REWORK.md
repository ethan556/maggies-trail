# S316 Lane A — `add-within-100-g1` + `properties-strategies-g1` remedial rework (28)

Worker: Cowork bounded rework worker. Spec: `reports/closure/S316_ADJUDICATION_REMEDIAL_STANDARD.md`
(binding standard S316-R), obeying `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` byte-for-byte as
authority contract. Scope: 28 lessons named in the dispatch, `remedials[0].check.widget`
(and its `options` where the widget is `mcq`) only. No IDs, no other steps, no `remedials[0].concept`
touched.

## What was done

Worker B (prior packet) had already replaced `remedials[0].check.widget` with a fresh problem
instance (new operands, recomputed traps) in all 28 lessons, but the adjudicator measured that
15/28 remained **template-identical** to the lesson's own `k1` (or another main step) under
digit-normalization, and regenerable by the step's own declared variant generator. This packet
restates the remedial **stem** in each of the 28 lessons as a concrete hands-on directive or word
context — a genuinely different representation, not a cosmetic synonym swap — while:

- **Keeping every operand and answer Worker B already chose.** No number was changed anywhere in
  this packet.
- **Recomputing/rewording every trap's feedback (and every MCQ option's feedback)** so it stays
  literally true of the drawn numbers under the new stem's phrasing.
- **Preserving MCQ correct-option-first ordering** (`options[0].correct === true`) in every case —
  it was already true of Worker B's output and remains true.
- **Touching nothing else.** No lesson id, step id, `conceptTag`, hint, `remedials[0].concept`,
  or any main-sequence step was edited. Verified structurally (see Verification, item 4).

Shapes used, one per generator-form family actually declared on `k1` in that lesson (Shape α from
S316-R §1.5, restated per lesson rather than reused verbatim from a sibling `k2`/`k3`, because
several siblings share the exact same template as each other in these two courses and a literal
`k2` copy would only shift which step it collided with):

| Family (declared `gen`/`form` on `k1`) | Lessons | New stem shape |
|---|---|---|
| `g1-add-subtract` / `CountOnSmallNumeric` | g1a-01-01, g1a-02-03, g1p-01-04 | "Put out N counters. Count on D more, one at a time. How many counters do you have now?" |
| `g1-add-subtract` / `MakeTenFirstNumeric` | g1a-01-02, g1a-02-04, g1p-02-04 | "Put A counters in one pile and B counters in another pile. Move counters from the second pile into the first pile until the first pile makes a ten. How many counters are left in the second pile?" |
| `g1-tens-ones` / `TnoAddTensNumeric` | g1a-01-03, g1a-01-04, g1a-02-02 | "Build N with ten-rods and one-cubes. Add K more ten-rod(s). What number do you have now?" |
| `g1-tens-ones` / `TnoTenMoreLessNumeric` | g1a-02-01, g1a-02-05, g1a-02-06 | "Build N with ten-rods and one-cubes. Add/Take away 1 ten-rod. What number do you have now?" |
| `g1-add-subtract` / `EqualSignMcq` | g1a-03-01 | "You have A red counters and B blue counters together in a bowl. How many counters are in the bowl in all?" |
| `g1-add-subtract` / `PartWholeNumeric` | g1a-03-02, g1p-02-01, g1p-02-02, g1p-02-03 | Hands/rows physically brought together ("Bring both hands together" / "Push the rows together and count every counter") |
| `g1-add-subtract` / `ResultUnknownNumeric` | g1a-03-03, g1p-01-05, g1p-02-05 | Non-frog object context (blocks/table, grapes/plate, pretzels/bag) replacing the lesson's repeated frogs-at-a-pond theme |
| `g1-add-subtract` / `SubFactsMcq` | g1a-03-04, g1p-03-04 | Sticker give-away story; stacked-blocks commutativity story |
| `g1-add-subtract` / `BiggerFirstNumeric` | g1p-01-01 | Two piles of blocks physically merged |
| `g1-add-subtract` / `EqualSignMcq` (swap) | g1p-01-02 | Stacked-blocks reorder story |
| `g1-add-subtract` / `CountingOnNumeric` | g1p-01-03 | Line of buttons extended one at a time |
| `g1-add-subtract` / `FactFamilyNumeric` | g1p-03-01 | Two piles combined to a known total, one pile removed |
| `g1-add-subtract` / `EqualSignNumeric` | g1p-03-02 | Balance-scale directive |
| `g1-add-subtract` / `CountingOnMcq` | g1p-03-03 | "Which way of counting them works best?" (blocks) |

## Verification (per lesson, programmatic)

Ran a Python check (S255 normalization: `text.lower()`, digit-runs `[-−+]?\d+(?:[.,/]\d+)*` → `#`,
whitespace collapse) against all 28 lessons, asserting:

1. **R1** `remedial.prompt !== k1.prompt` — 28/28 pass.
2. **R2** `normalized(remedial.prompt)` differs from the normalized prompt of **every**
   widget-bearing step in the lesson (`i1`, `k1`, `i2`, `k2`, `k3`, `ch1` — not just `k1`) —
   28/28 pass.
3. **R3** `JSON.stringify(remedial.widget) !== JSON.stringify(k1.widget)` — 28/28 pass (trivially,
   since R1/R2 already hold).
4. **Scope**: diffed every hunk of every file against `HEAD` and confirmed every changed line falls
   inside the `"remedials"` array (line-offset check against the `"remedials"` key's position) —
   28/28 confined, no `.steps`/id/other-field edits.
5. **R5 (traps)**: for every remedial, `commonErrors` values are pairwise distinct and none equals
   the answer; every trap feedback and MCQ option feedback is ≥25 characters and does not match the
   repo's `NEGATION` regex (`^(no|not|wrong|incorrect|sorry|try again|nope)\b`, case-insensitive,
   copied verbatim from `src/lib/variants.test.ts:10097`) — 28/28 pass.
6. **MCQ shape**: exactly one `correct: true` option per MCQ remedial, and it is `options[0]`
   (authored order; render shuffles) — 6/6 MCQ remedials pass (g1a-03-01, g1a-03-04, g1p-01-02,
   g1p-03-03, g1p-03-04, and the g1p-01-02 swap item).
7. **R4 (generator non-producibility)**: read the actual generator source
   (`src/lib/g1Variants.ts`, `addHandlers`/`countHandlers`/`tensOnes` tables) for every form
   declared on the lessons' `k1` steps, extracted the literal template strings (e.g.
   `` `${a} + ${d} = ? Count on ${d}.` ``, `` `True or false: ${a} + ${b} = ${c}` ``,
   `` `Fact family ${a}, ${b}, ${t}: ${t} − ${a} = ?` ``, `` `${n} + ${t*10} = ?` ``), and confirmed
   by pattern check that none of the 28 new prompts match a bare-equation shape
   (`/^\s*[\d.]+\s*[+\-−]\s*[\d.]+\s*=\s*\?/`) or contain a generator-template-distinctive phrase
   (`true or false:`, `which addition fact helps solve`, `fact family`, `make both sides equal:`,
   `the fast way to add`, `sit by a pond`) — 0/28 flagged. (`npx vitest run` itself was **not** run,
   per the "Do NOT run npm/vitest/tsc" instruction for this packet.)
8. **R6 spot-check**: confirmed no remedial's answer value appears as a literal digit run inside
   the adjacent `remedials[0].concept.body` for any of the 28 lessons (the concept text in this
   course is written in strategy-only prose with no drawn numbers, so this was never at risk, but
   checked anyway since `playerStore` renders concept + check back-to-back).
9. **Manual reading pass**: printed every remedial concept+check pair and read every trap,
   fallback, and success string as a human would (per CLAUDE.md rule "PRINT THE GENERATED OUTPUT
   AND READ IT"). One defect found and fixed during this pass (below).

### One defect found and fixed during the reading pass

`g1p-02-05`: initial draft feedback for trap value `10` (on prompt "You have 17 pretzels in a bag.
Take out 8 pretzels, one at a time. How many pretzels are left in the bag?", answer `9`) read *"That
is one too many pretzels removed; recheck the last pretzel taken out."* This is backwards — `10` is
**higher** than the true answer `9`, meaning the trap corresponds to removing only **7** pretzels
(one *too few*, i.e. `17 − 7 = 10`), not "too many removed." Corrected to *"That stops one pretzel
too soon; take out all 8 pretzels, not just 7."*, which is literally true of the drawn numbers.
Re-ran the full verification suite after the fix; all 28 lessons still pass.

## Files changed

All 28 under `content/courses/add-within-100-g1/lessons/` and
`content/courses/properties-strategies-g1/lessons/`:

`g1a-01-01, g1a-01-02, g1a-01-03, g1a-01-04, g1a-02-01, g1a-02-02, g1a-02-03, g1a-02-04, g1a-02-05,
g1a-02-06, g1a-03-01, g1a-03-02, g1a-03-03, g1a-03-04, g1p-01-01, g1p-01-02, g1p-01-03, g1p-01-04,
g1p-01-05, g1p-02-01, g1p-02-02, g1p-02-03, g1p-02-04, g1p-02-05, g1p-03-01, g1p-03-02, g1p-03-03,
g1p-03-04`

Ledger: `reports/closure/cowork-staging/laneA-g1-rework.jsonl` (28 NDJSON lines, one per lesson).

## Not run (per dispatch instruction)

`npm run typecheck`, `npx vitest run`, `npm run validate:content`, `npm run lint:pedagogy`,
`npm run validate:native`, `node scripts/check-registration.mjs`, the build. This packet's
verification is limited to the Python-based R1/R2/R3/R5/R6 checks and the source-level R4 check
described above. **This packet may not be declared landed without those gates.**

## Anything that would not conform / residual notes

- Nothing in the 28-lesson scope failed to conform after the fix above — all 28 pass R1–R5 and the
  structural-scope check.
- Not addressed (out of this packet's scope, per S316-R §1.4 "explicitly NOT binding"): the 28
  lessons' `remedials[0].concept.body` was not touched. A quick read shows these bodies are already
  strategy-prose without drawn numbers (unlike the `g4v`/`g3f`/`koa` courses flagged elsewhere in
  the adjudication for `body === c2.body` duplication), so this course does not appear to carry that
  separate defect class — but that was not exhaustively re-verified against every `c2.body` string
  in this packet and should not be assumed closed without a dedicated pass.
- `session190.addWithin100g1` and `session251.*CourseIntegrity` gates were flagged elsewhere in the
  adjudication as red for reasons unrelated to `.remedials` (they read only `lesson.steps`). This
  packet's edits are 100% inside `.remedials` and should not change that gate's pass/fail state, but
  it was not run to confirm, per the "Do NOT run npm/vitest/tsc" instruction.
