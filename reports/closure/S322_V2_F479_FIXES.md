# S322 — Bounded Implementation of V2 Content Findings + F4/F7/F9 Contracts

Implementer: Claude Cowork bounded implementation worker (S322). Date: 2026-08-20.

Scope: V2's 3 residual content findings from `reports/closure/S321_VERIFY_IMPL456.md`, plus F4's 9
contracts (`reports/closure/S321_ASSESS_F4.md`), F7's 3 contracts (`S321_ASSESS_F7.md`), and F9's 5
contracts (`S321_ASSESS_F9.md`). Prefix `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` read and
obeyed: repository source and the named contracts are authoritative; no cache entry was treated as
self-approving. Every change below was independently re-derived against the current committed
source (read first with the Read tool), not copied blind from the contract's suggested text — each
new numeric/geometric/algebraic claim was hand-verified before writing.

No `npm`/`vitest`/`tsc` was run, per instructions. Parse-checked every touched JSON with Python's
`json.load`. Ran the corpus-wide MCQ-identity duplicate scan (`buildDuplicateInventory` from
`scripts/audit/lesson-review-authority-s246.mjs`) after all edits, plus a custom within-lesson
prompt+widget duplicate scan scoped to every touched lesson — both post-fix scans are clean (0
clusters, 0 within-lesson duplicates touching any of the 20 lessons/items in scope).

Dispositions written to `reports/closure/cowork-staging/laneA-s322-v2fix.jsonl` (20 NDJSON records,
`recordId` = `S322-<lessonId>`).

## A. V2's 3 content findings

1. **`g1s-03-02` / `k2`** — the uncontracted extra fix's wrong-answer feedback for value=2 asserted
   *"the seam adds a new corner where the diagonal cut meets each side."* This is geometrically
   false: a diagonal cut through a square runs corner-to-corner, so both endpoints of the cut are
   pre-existing square vertices — no new vertex is ever created. Each triangle piece's 3 corners are
   all corners the square already had (two diagonal endpoints, shared between both triangles, plus
   one more square corner unique to that half). Rewritten to the truthful `"That misses one corner;
   every corner of a triangle piece was already a corner of the square, so count all three."` The
   pedagogical point (recount to 3) is preserved without the false claim.

2. **`g1t-01-01` / `ch1`** — the wrong-answer feedback for value=11 asserted *"That is one less than
   the full total."* The prompt is "4 red beads + 9 blue beads" (answer 13), and 13 − 11 = 2, not 1.
   Rewritten to `"That is two less than the full total; recount both groups together."`

3. **`alg1-04-03` / `ch1`** — `i2`'s `e2` (`3x + 7 < 7x − 5`) was byte-identical to `ch1`'s inequality
   (same equation, same pre-reveal class, same answer x > 3). `ch1` was rewritten to
   `2x + 9 < 6x − 11`, following the lesson's established "collect on the side that keeps the
   coefficient positive, no flip needed" pattern. Verified by substitution both ways: collecting
   right — subtract 2x (9 < 4x − 11), add 11 (20 < 4x), divide by +4 → x > 5, no flip; collecting
   left — subtract 6x (−4x + 9 < −11), subtract 9 (−4x < −20), divide by −4 and flip → x > 5 (same
   answer, confirming the lesson's "either path works" claim). Tokens, `commonBuilds` feedback,
   `explanationVariants`, hints, and `successFeedback` were all recomputed to match. `i2.e2` is now
   distinct from `ch1` (`3x+7<7x−5` vs `2x+9<6x−11`), resolving the residual duplicate.

## B. F4's 9 contracts (multistep-g4, volume-problems-g5, long-division-g5)

4. **`g4s-03-01` / `k3`** — was byte-identical to `g4s-02-03` / `k1`. Replaced with a fresh "is the
   estimate reasonable" scenario: `8 × 47 − 60` (exact 316) vs. estimate `8 × 50 − 60 = 340`.
   Recomputed: 8×47=376, 376−60=316; 8×50=400, 400−60=340; gap=24=8×3. Same 4-option shape preserved.

5. **`g4s-03-02` / `k3`** — was byte-identical to `g4s-01-02` / `k2`. Replaced with a fresh
   three-operation-order scenario: "8 boxes of 5 pencils, 12 given away, then 15 more bought."
   Verified the "reaches the same number either way" distractor claim still holds: multiply→subtract→add
   gives 8×5=40, 40−12=28, 28+15=43; multiply→add→subtract gives 40+15=55, 55−12=43 (same total, wrong
   story order).

6. **`g5v-01-01` / `k3`** — was byte-identical to `k1`. Replaced with a new scenario ("a shipping crate
   packed edge-to-edge with unit cubes, no gaps/overlaps — what does the count tell you?") and four new
   options, correct-first.

7. **`g5v-01-02` / `k3`** — was byte-identical to `k1`. Replaced with a new "pouring identical layers"
   scenario and four new options, correct-first.

8. **`g5v-02-02` / `k3`** — was byte-identical to `k1` **and** had a correct-option length leak.
   Replaced with "Which situation actually needs V = B × h instead of V = l × w × h?" and four new
   options measured at 27/30/29/29 chars (tight parity, within the contract's ~25–40 char target).

9. **`g5v-03-01` / `k3`** — was byte-identical to `k1`. Replaced with a new question ("which quantity
   do you subtract from the full block's volume?") and four new options, correct-first.

10. **`g5v-03-03` / `ch1`** — the numeric base/height pair (8×3=24) duplicated `k1`'s exact pair.
    Replaced with an unused pair, 9×4=36, with `commonErrors` recomputed proportionally
    (mix-mistake 9+4=13, layers-only=4) and `successFeedback` updated to "Correct — 36."

11. **`g5l-02-02` / `k3`** — was byte-identical to `g5l-02-01` / `k1` **and** topically misplaced (a
    partial-quotients question inside the standard-algorithm lesson). Replaced with an
    algorithm-specific question: "Why does the standard algorithm's first quotient digit have to sit
    in a specific place-value column?" with distractors naming free choice / no effect / one-digit-only.

12. **`g5l-03-01` / `ch1`** — correct option was a 64-char length outlier against 34–46-char
    distractors. All four options rewritten to a consistent `"<digit> — <digit>×34=<product>
    <verdict>"` register; new lengths (via `wc -c`): 39/36/30/33 chars.

## C. F7's 3 contracts (series-convergence, integration-applications)

13. **`sc-02-02` / `remedials[0].check` (`rk1`)** — correct option (43 chars) vs. distractor (12
    chars), a 3.6× outlier. Shortened the correct option to `"No — it diverges."` (19 chars); new
    ratio 1.6×. IDs, correctness, and feedback untouched.

14. **`ia-01-02` / `k1`** — correct option (46 chars, a full sentence) vs. bare-symbol distractors
    (1/6/2 chars). Shortened to `"f(x)"` (4 chars); the fuller explanation already lives in the
    unchanged `feedback` string, so no meaning was lost.

15. **`ia-02-01` / `k2`** — correct option (90 chars) vs. distractors (30–39 chars). Trimmed to
    `"Only the constant changes: multiply by √3/4."` (46 chars), close to the distractor band; fuller
    reasoning already lives in the unchanged `feedback` string.

## D. F9's 5 contracts (multiplication-division, transformations-measurement)

16. **`mult-04-04` / `c1`, `c2` — FAIL-CLOSED.** The contract's only fix requires binding `c1`/`c2` to
    a *new* figure component (a two-step build-then-subtract visual) that does not exist anywhere in
    `src/components/figures.tsx`. This is new-component authorship, not a reword/rebind to an existing
    exact figure, so it is outside this packet's bounded scope. Left the mismatched `mult3-which-op`
    binding and lesson text untouched (both are otherwise correct) rather than either quietly leaving
    the defect unfixed while marked closed, or authoring an unreviewed new component under
    implementation-worker authority. **Human/next-owner action needed:** author and independently
    review a new `figures.tsx` component depicting the two-step multiply-then-subtract build, then
    rebind `c1.figure`/`c2.figure` to it.

17. **`mult-05-01` / `c1`, `c2` (figure `mult3-add-table`) — FIXED.** No lesson-JSON change was
    needed (text and figure binding were already correct). Confirmed via `grep` that `mult3-add-table`
    has exactly one consumer in the whole content tree (`mult-05-01` `c1`+`c2`), so rewriting the
    shared component in place (contract option (a), not a new component) is safe. Rewrote
    `Mult3AddTable()` in `src/components/figures.tsx` to highlight the **main diagonal** (`r===c`, the
    doubles: 2,4,6,8) instead of the previous anti-diagonal (`r+c===3`, constant-sum), matching `c1`'s
    "doubles" text and `k1`'s fold-along-the-doubles-diagonal reasoning check exactly. Added a mirror
    caption; grew the `viewBox` from 112→122 to fit it, matching the sibling `Mult3MultTable()`
    component's own convention. `aria-label`/`<title>` updated to describe the corrected rendering.
    Brace/paren/`<svg>` tag balance verified (21/21, 7/7, 1/1).

18. **`tm-04-02` / `k3`** — one of six near-identical Pythagorean-template instances (2 templates,
    numbers only changed). Replaced with an error-diagnosis mcq using a fresh triple (7-24-25, not
    reused elsewhere in the lesson): "A learner answers 31 by computing 7+24 for the hypotenuse of
    legs 7 and 24 — what went wrong?" Recomputed: 7²+24²=49+576=625, √625=25 (correct); 7+24=31
    (the error). `c2`'s S291 fail-close (no missing-leg figure) **stands** — not re-attempted, per
    task instruction. `i2`/`k1`/`k2`/`ch1`/remedial preserved unchanged as the still-legitimate
    direct-application items.

19. **`tm-05-02` / `k3`, `ch1`** — four near-identical cone-volume instances (one template). `k3`
    replaced with the inverse of `k2`'s job: "A cone has volume 24π. What is its matching cylinder's
    volume?" (cylinder = 3× cone = 72; verified). `ch1` replaced with an estimation/comparison mcq
    needing no exact triple: "Cone A (r=5,h=3) vs Cone B (r=3,h=8) — without computing both exactly,
    which holds more?" Recomputed via the shared ⅓π factor cancelling in comparison: r²h — A: 5²×3=75,
    B: 3²×8=72, so A holds more. `i1` (volumeBuilder), `i2` (steppedReveal), `k1`, `k2`, and the
    remedial preserved unchanged.

20. **`tm-05-03` / `k2`** — `explanationVariants[0]` was an unedited scratch-note ("r³ = 3³... wait,
    r = 3 gives 27; for r = 3: V computed earlier is 36π. For radius 1: ...") that digressed through an
    unrelated r=3 computation before answering the actual r=1 question. Replaced with a direct
    derivation: `"r³ = 1³ = 1, so V = 4⁄3 π × 1 = 4⁄3 π."` `explanationVariants[1]` (already clean) and
    the mcq itself (options/`correct`/`feedback`) were left untouched, per contract.

## Verification

- **Parse-check:** every touched JSON file loaded cleanly with Python's `json.load` (19 lesson files;
  `src/components/figures.tsx` checked separately for brace/paren/tag balance, since it is TypeScript
  not JSON).
- **Duplicate scans (both, post-fix):**
  - `buildDuplicateInventory` (the corpus-wide MCQ-identity scan from
    `scripts/audit/lesson-review-authority-s246.mjs`, run over all courses): 19 clusters / 44
    placements remain corpus-wide, **0 of them touch any of the 20 lessons edited in this packet**
    (verified by cross-referencing every cluster's placements against the touched-lesson-id set).
  - Custom within-lesson prompt+widget duplicate scan (prompt + type + answer/options, scoped to each
    touched lesson): **0 duplicates** in any of the 19 touched lesson files.
- **Hand-verified arithmetic/algebra/geometry** for every recomputed value — shown inline in each
  finding above and in the NDJSON `changes[]`/`gatesRun[]` fields.
- **mcq correct-first** preserved in every rewritten mcq (`o0`/first option is always the correct one).
- **Option-length parity** measured with `wc -c` for every length-leak fix (g5v-02-02, g5l-03-01,
  sc-02-02, ia-01-02, ia-02-01).
- No IDs, `conceptTag`s, widget `type`s, or evaluator semantics were changed anywhere except where the
  contract explicitly named the change (e.g. `alg1-04-03/ch1`'s token relabeling, which stays within
  the existing `buildExpression` widget contract).

## Fail-closed list

- **`mult-04-04`** (`content/courses/multiplication-division/lessons/mult-04-04.json`, steps `c1`,
  `c2`) — requires a new `figures.tsx` component outside this packet's bounded scope. See item 16
  above for the full reason and required next step. This is the only fail-closed item in this packet.

## Raw data

- Dispositions/changes: `reports/closure/cowork-staging/laneA-s322-v2fix.jsonl` (20 NDJSON records)
- This report: `reports/closure/S322_V2_F479_FIXES.md`
- Contracts read: `reports/closure/S321_VERIFY_IMPL456.md`, `S321_ASSESS_F4.md`, `S321_ASSESS_F7.md`,
  `S321_ASSESS_F9.md`
- Review-basis hashes recomputed post-fix for all 20 lessons via
  `node scripts/session/print-review-basis.mjs <ids>` (recorded per-lesson as
  `reviewBasisHashAfter` in the NDJSON).
- Files touched: 19 lesson JSON files (listed per-record above) plus
  `src/components/figures.tsx` (`Mult3AddTable()` only). No file under `content/` or `src/` outside
  this named set was modified. No `npm`/`vitest`/`tsc` was run.
