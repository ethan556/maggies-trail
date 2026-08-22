# S320 Implementation — Lane A13 REVISE Contracts (17 lessons)

Bounded implementation worker. Authority per `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`:
repository source and the explicit implementation contracts in `reports/closure/S320_ASSESS_A13.md`
are authoritative; this packet implements every REVISE contract from that file, deviating from the
contract's literal example text only where necessary to actually satisfy the contract's stated goal
(zero duplicates, truthful feedback) — every such deviation is called out per-lesson below. No gate
was weakened and no new judgment call was invented; where a contract left an ambiguity (several
numeric/MCQ duplicate clusters named a canonical instance but did not spell out every later
instance's replacement text), the later instance was differentiated using the same technique the
contract itself sanctioned elsewhere in the same document (reworded-but-equivalent prompt, or a
different but pedagogically consistent target shape/number).

Base commit: `ae399cc647fedf3f0a0db1aadfeb4cc04d3b90c1`.

Scope: 17 grade-1 lessons across 2 courses — `compose-shapes-g1` (g1s-01-01, g1s-01-02, g1s-01-03,
g1s-02-01, g1s-02-02, g1s-02-03, g1s-02-04, g1s-03-02, g1s-03-03) and `add-three-numbers-g1`
(g1t-01-01, g1t-01-02, g1t-01-03, g1t-02-01, g1t-02-03, g1t-03-01, g1t-03-02, g1t-03-03). All edits
are content-only JSON changes under `content/courses/`; no `src/` file was modified. No npm/vitest/tsc
run, per instructions.

Deliverables: this report + NDJSON at
`reports/closure/cowork-staging/laneA-s320-impl-4.jsonl` (17 records, one per lesson; `g1t-01-02`
required no file edit and is recorded with `verdict: "NO_FILE_CHANGE_REQUIRED"`).

## Verification method (run after every edit, and again as a full course-wide sweep at the end)

- **Parse-check**: `python3 -m json.tool` on all 16 edited files plus the 1 unedited-but-in-scope
  file (`g1t-01-02`): **17/17 OK**.
- **Official duplicate scanner**: ran the repo's own `buildDuplicateInventory` from
  `scripts/audit/lesson-review-authority-s246.mjs` (mcq-only, prompt+sorted-option-labels identity,
  main `steps` only — matches the assessment report's stated methodology) across the **entire repo**
  (all courses, not just these two), then filtered to clusters touching `compose-shapes-g1` or
  `add-three-numbers-g1`: **0 clusters**.
- **Custom cross-widget duplicate scan**: a second, independent Python scan extended the same
  prompt-identity logic to `numeric` widgets (prompt+answer), across both courses' `steps` and
  `remedials`, excluding the accepted own-lesson remedial-mirrors-own-check pattern. Result:
  **0 MCQ clusters**; exactly **1 numeric cluster** remains, and it is the intentionally-accepted
  shared "A square is cut along one diagonal, leaving a triangle. How many corners does a triangle
  have?"=3 check reused verbatim across `g1s-02-01/ch1`, `g1s-02-02/k3`, `g1s-02-03/k2`,
  `g1s-02-04/k2` — per the assessment report's own scope count ("6+ duplicate MCQ clusters + 4
  numeric cross-lesson duplicates"), this shared numeric prompt was **not** one of the 4 numeric
  duplicates in scope; only its previously-mismatched `commonErrors` feedback was in scope, and that
  feedback is now corrected identically (and truthfully) in all four places. The 4 numeric
  cross-lesson duplicates that *were* in scope (bare triangle-corners, bare rectangle-corners, bare
  square-sides, and the triangle-halves-of-a-square scenario) are now all resolved to 0 duplicates.
- **Grammar scan**: `grep -rnoE "one (more )?(corners|sides)\b"` across every lesson file in both
  courses: **0 matches** (down from 20 "one corners"/"one sides" occurrences plus 9 "one more
  corners"/"one more sides" occurrences before this packet — all fixed, including 2 occurrences not
  explicitly named in the per-lesson contract prose but caught by the full-corpus grep, per the
  task's "fix EVERY occurrence" instruction).
- **False-"double" template scan**: `grep -rn "double alone\|two equal groups from the double"`
  across `add-three-numbers-g1`: **0 matches** (was 9 occurrences — g1t-01-01/ch1 ×2,
  g1t-01-03/k1 ×2, g1t-01-03/k2(rem too via k1 mirror) ×2, g1t-02-03/ch1 ×2, g1t-03-01/k3 ×2,
  g1t-03-03/ch1 ×2 — hand-verified against each problem's actual addends before rewriting; every
  fix is grounded in the real numbers of that specific widget, not a copy-pasted new template).
- **False "not guaranteed here" scan**: `grep -rn "not guaranteed here"` across
  `add-three-numbers-g1`: **0 matches** (was 3 occurrences — g1t-01-03/k3, g1t-02-01/k2,
  g1t-03-03/k1(+its remedial) — each verified by hand: 3+4+3, 2+2+2, and 4+2+2 all genuinely contain
  an equal pair, so the "not guaranteed" claim was false in every instance; replaced with a template
  that is true regardless of the specific addends — a double is possible but unnecessary given how
  small the numbers already are).
- **MCQ/numeric widget invariants**: a Python checker re-verified, across every touched widget:
  correct option listed first, every feedback string ≥25 chars, no feedback opening with a negation
  word (no/not/never/isn't/doesn't/can't), and no duplicate option labels within a single MCQ.
  **0 issues found.**
- **Hand-verified arithmetic**: every numeric answer and every MCQ's correct/incorrect option was
  recomputed by hand (see the arithmetic list in each lesson's NDJSON `gatesRun`/`changes`); no
  answer key was left unchecked.
- `node scripts/session/print-review-basis.mjs <17 ids>` was run against the post-fix file bytes for
  `reviewBasisHashAfter` (recorded per lesson in the NDJSON); `sha256sum` was additionally run on each
  changed file for `changed_file_hashes` in the return-contract summary below.

## Fail-closed check (g1t-01-01/c2 figure/strategy mismatch)

The contract offered two options: (a) swap `figure: "make-ten-bridge"` for a genuine three-addend
figure, or (b) keep the figure and rewrite the body text to describe what it actually renders. Option
(a) was investigated first: `src/components/figures.tsx` has no existing figure that renders three
labeled addends joining in two steps, and the contract's own suggested fallback ("reuse `bar-join`
again") does not solve the problem either — `BarJoin` is hardcoded to the two-part fact 7 + 5 = 12
(same as `c1`), so reusing it at `c2` would not be "a genuine three-addend figure" either, just a
second copy of `c1`'s figure. Building a real three-addend figure would require a `src/` code change,
which is out of this packet's content-only scope. **Option (b) was used instead** — no `figures.tsx`
change was needed, so this is **not** a fail-closed item: `c2`'s body/narration was rewritten to
truthfully describe the rendered `make-ten-bridge` figure (8 + 5 = 10 + 3 = 13, a single-fact bridge
over two addends), removing the false "third addend" framing entirely, per the contract's explicitly
sanctioned fallback.

---

## compose-shapes-g1 (9 lessons)

### g1s-01-01 — k1, k2, k3, ch1, remedial
Kept as the **canonical** (first-occurrence) copy for every duplicate cluster it seeds (later lessons
were differentiated instead, per contract). Fixed independently: `k2`'s MCQ distractor-length leak
(43 vs 9–15 chars) — rebalanced to `"4 equal sides and 4 square corners"` (correct) against three
similarly-sized distractors. Grammar: `"one corners"` → `"one corner"` (k1, k3, remedial),
`"one more corners"` → `"one more corner"` (k1, k3, remedial), `"one sides"` → `"one side"` and
`"one more sides"` → `"one more side"` (ch1).

### g1s-01-02 — k1, k2, ch1, remedial
`k1` retargeted from triangle to **square** non-defining-attribute MCQ so it no longer duplicates
`g1s-01-03/k3` verbatim; remedial updated to mirror the new `k1` (otherwise the remedial itself would
have kept the duplicate alive). `k2` reworded (`"How many corners can you count on a triangle?"`) to
exit the 4-lesson bare-triangle-corners numeric cluster; grammar-fixed. `ch1` kept as the canonical
`"What makes a shape a rectangle?"` wording; distractor lengths rebalanced.

### g1s-01-03 — k1, k2, ch1, remedial
`k1` retargeted from rectangle-defining to **hexagon**-defining MCQ (`"What makes a shape a
hexagon?"`, 6 straight sides and 6 corners) — resolves the 3-way rectangle-MCQ cluster with
`g1s-01-02/ch1` and `g1s-02-02/ch1`; remedial updated to match. `k2` retargeted to
`"How many corners does a hexagon have?"`=6 (contract's explicit suggestion), fresh commonErrors.
`ch1` retargeted to `"How many corners does a square have?"`=4 (contract's explicit suggestion),
fresh commonErrors.

### g1s-02-01 — k2, ch1
`ch1`'s `value=5` false "both starting pieces...joining" feedback (pasted from a two-piece join
template onto a one-piece cut/decompose prompt) replaced with the contract's corrected text; grammar
fixed on `value=2`. `k2`'s `value=3` grammar-fixed (`"one corners"` → `"one corner"`) — this
template's join-scenario match was already pedagogically correct per the assessment's own note, so
only the grammar was touched. `k1`/`k3`/their remedial left untouched: this lesson is the canonical
member of those two duplicate clusters; the later lessons (`g1s-02-03`, `g1s-02-02`) were edited
instead.

### g1s-02-02 — k1, k2, k3, ch1, remedial
`k2` reworded (`"Two equal squares are placed side by side and joined. What shape results?"`) to
break the verbatim duplicate with `g1s-02-01/k3`. `k3`'s `value=5` false join-feedback corrected
(same fix family as `g1s-02-01/ch1`); grammar-fixed on `value=2`. `ch1` reworded
(`"Which features make a rectangle a rectangle?"`) to resolve its slot in the 3-way rectangle-MCQ
cluster, with distractor lengths rebalanced simultaneously. `k1`/remedial: grammar-fixed
(`"one corners"` → `"one corner"`).

### g1s-02-03 — k1, k2, ch1, remedial
`k1` reworded (`"Joining two matching triangle halves along their long edges makes which four-sided
shape?"`) to break the verbatim duplicate with `g1s-02-01/k1`; remedial updated to match. `k2`'s
`value=5` false join-feedback corrected; grammar-fixed on `value=2`. `ch1` reworded
(`"Trace around a triangle. How many corners do you count?"`) to exit the bare-triangle-corners
cluster; grammar-fixed. `k3` left untouched: canonical member of the 3-way hexagon-question cluster;
`g1s-02-04/ch1` and `g1s-03-03/k2` were edited instead.

### g1s-02-04 — k2, ch1
`k2`'s `value=5` false join-feedback corrected; grammar-fixed on `value=2`. `ch1` reworded
(`"Arranging six matching triangle pieces around one centre point makes what shape?"`) to resolve its
slot in the 3-way hexagon-question cluster.

### g1s-03-02 — k2, ch1
`k2` retargeted from the verbatim-duplicate "two triangle halves joined... corners of a square"=4
(the 4th cross-lesson numeric duplicate, matching `g1s-02-01/k2` byte-for-byte) to a decompose-framed
question fitting this lesson's own "Taking a Shape Apart" topic: `"A square made from two matching
triangle halves is separated along the seam. How many corners does one triangle piece have?"`=3, with
fresh true `commonErrors` and `successFeedback` updated to 3. `ch1` retargeted from `"How many sides
does a square have?"`=4 (verbatim duplicate of `g1s-01-01/ch1`) to `"How many sides does a rectangle
have?"`=4 per the contract's explicit suggestion; grammar/wording fixed.

### g1s-03-03 — k1, k2, ch1
`k2` reworded (`"When six matching triangle pieces meet at one centre, what shape do they form?"`) to
resolve its slot in the 3-way hexagon-question cluster. `ch1` retargeted from `"What makes a shape a
square?"` (verbatim duplicate of `g1s-01-01/k2`, same length leak) to `"What two features together
make a shape a rectangle?"` per the contract's explicit suggestion, with a wording distinct from both
other rectangle-MCQ instances. `k1`/remedial: grammar-fixed (`"one sides"` → `"one side"`).

## add-three-numbers-g1 (8 lessons)

### g1t-01-01 — c2, ch1
`c2`'s body/narration rewritten to truthfully describe the `make-ten-bridge` figure it renders
(8 + 5 = 10 + 3 = 13), removing the false "third addend" claim — see the fail-closed check above for
why this is a content-only fix, not a `figures.tsx` change. `ch1`'s two false "double
alone/third addend" `commonErrors` (4 + 9 = 13 has neither) replaced with feedback matching the
actual two-addend bead-counting problem.

### g1t-01-02 — no edit (canonical source)
Per the contract's explicit instruction, this lesson's `k1` (`"4 + ? = 10..."`=6) and `k3`
(`"To add 4 + 6 + 7..."`) are the canonical first-occurrence copies; the two duplicating lessons were
changed instead (`g1t-03-02/k3` differentiated from `k1`; `g1t-02-03/k1` differentiated from `k3`).
Recorded in the NDJSON with `verdict: "NO_FILE_CHANGE_REQUIRED"` for completeness of the 17-lesson set.

### g1t-01-03 — k1, k2, k3, remedial
`k1`'s false "double alone/third addend" template on 6 + 7 = 13 (6 ≠ 7) replaced; remedial mirrors the
fix. `k2`'s false template on "Double 8 means 8 + 8"=16 replaced with the contract's suggested
`value=10` text plus a fresh true `value=11` text. `k3`'s false "not guaranteed here" claim for
3 + 4 + 3 (which **does** contain the equal pair 3 and 3) replaced with a template that is true
regardless of the specific addends.

### g1t-02-01 — k2, ch1
`k2`'s false "not guaranteed here" claim for 2 + 2 + 2 (all three addends equal) replaced. `ch1`: the
arithmetic error `"then join the 6"` corrected to `"then join the 4"` (4 + 5 + 5 minus the double
5 + 5 leaves 4, not 6); `o1`'s false "no ten-partner pair" feedback corrected (5 + 5 = 10 **is** a
ten-partner pair); `o2`'s nonexistent-pair label `"4 and 4"` (only one 4 exists among 4, 5, 5)
replaced with `"There is no double here"` and truthful rejecting feedback.

### g1t-02-03 — k1, remedial, k2, ch1
`k1`/remedial retargeted 4 + 6 + 7 → 7 + 3 + 5 to remove the verbatim duplicate with `g1t-01-02/k3`.
`k2` grounded with concrete numbers (`"In 8 + 2 + 4, why is grouping 8 and 2 first a smart choice?"`)
and every option's label/feedback rewritten to cohere with each other and the numbers (the old `o1`
label/feedback pair described unrelated claims). `ch1`'s false "double alone/third addend" template on
10 + 9 = 19 (10 ≠ 9) replaced.

### g1t-03-01 — k3
False "double alone/third addend" template on "A full ten has 7 more counters joined"=17 (a
ten-plus-seven structure, no double) replaced with the contract's suggested feedback.

### g1t-03-02 — k3
Known addend retargeted 4 → 7 (`"7 + ? = 10..."`=3) per the contract's explicit suggestion, removing
the verbatim duplicate with `g1t-01-02/k1`; `PartWholeNumeric` framing and `commonErrors` pattern
preserved with recomputed numbers.

### g1t-03-03 — k1, remedial, ch1
`k1`/remedial: false "not guaranteed here" claim for 4 + 2 + 2 (contains the equal pair 2 and 2)
replaced. `ch1`'s false "double alone/third addend" template on 8 + 2 = 10 (8 ≠ 2) replaced.

## Fail-closed items

**None.** The one flagged risk (`g1t-01-01/c2`) was resolved via the contract's content-only fallback
option (b) without touching `src/components/figures.tsx` — see the "Fail-closed check" section above.

## Notes on scope and authority

- No `src/` file was read-write; `src/components/figures.tsx` was read-only inspected to verify the
  `g1t-01-01/c2` fix against the actual rendered `MakeTenBridge` SVG (`<title>`/on-canvas caption).
- The two `course.json` files for `compose-shapes-g1` and `add-three-numbers-g1` were not touched
  (no lesson IDs, conceptTags, widget types, or chapter membership changed — only prompt/option/
  feedback/figure-body text and a small number of numeric answer keys, all recomputed by hand).
- All 32 `cml` blocks in the 17 touched lessons (main steps only carry `cml`; remedials do not) were
  left byte-identical; only `body`/`narration`/`widget.prompt`/`widget.options`/`widget.answer`/
  `widget.commonErrors`/`widget.successFeedback` fields were edited, and only where a specific defect
  required it.
- `readingProfile` remains `"standard"` in all 17 lessons (unaffected, not in scope).
