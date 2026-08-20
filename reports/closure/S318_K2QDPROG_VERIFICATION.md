# S318 Lane V — independent verification of the K2 withheld-figure, QD P0, and PROG P0 packets

Verifier: Claude Cowork independent verifier (S318). Read-only: no content, gate-module,
blocklist, generator, schema, or report file was edited by this pass. `git diff HEAD`, the live
gate/schema modules, the widget component sources, and hand arithmetic were consulted **first**,
before the implementer's own reports were read, and every implementer claim below was
independently recomputed rather than trusted. No `npm`/`vitest`/`tsc` was run; `npx tsx` (and one
throwaway `npx vitest run <probe file>`, deleted after use, needed only because a plain `npx tsx`
script cannot render the figure components' JSX the way the adversarial-audit heuristic requires)
were used for every recomputation.

Packets under review:

- `reports/closure/S318_K2_WITHHELD_CLEARANCE.md` (+ its Addendum) + `reports/closure/cowork-staging/laneA-s318-k2-figures.jsonl` — 13 placements / 8 lessons.
- `reports/closure/S318_QD_P0_IMPLEMENTATION.md` + `reports/closure/cowork-staging/laneA-s318-qd.jsonl` — 15 rows / 1 fixed lesson (`fa-02-02`).
- `reports/closure/S318_PROG_P0_IMPLEMENTATION.md` + `reports/closure/cowork-staging/laneA-s318-prog.jsonl` — 11 rows / 11 lessons.

20 lessons signed in total (8 + 1 + 11).

## Verdict

**20/20 lessons KEEP. 0 REVISE, 0 ESCALATE.** Independent recomputation matches every claim in
all three implementer reports: figure/text binding keys, blocklist membership, the adversarial
`risks()` heuristic, hand arithmetic for every new answer/trap, zod schema validity,
`widgetIntegrityErrors`, the digit-normalized within-lesson duplicate scan, and the generator-debt
justifications for every removed `variant` key.

Signed dispositions: `reports/closure/cowork-staging/laneV-s318-k2qdprog-dispositions.jsonl` (20
`lesson-disposition` records, `reviewedBasisHash` from
`node scripts/session/print-review-basis.mjs`).

## Scope A — K2 withheld-figure clearances (13 placements / 8 lessons)

**Result: 8/8 lessons KEEP.**

Method: for each of the 8 lesson files, `git diff HEAD` was read in full and confirmed **body-only**
changes — no `figure`, id, `conceptTag`, or evaluator field touched anywhere in the 8 files. Each
figure component (`Chart120`, `ChartRows`, `TnoCountDownTens`, `C120MissingOrder`,
`SkipCountLine`, `MmtBiggestFirst`, `Pv3Regroup`) was read directly in `src/components/figures.tsx`
and compared against the reworded body to confirm the reword restates the figure's own rendered
content truthfully (no invented numbers, no dropped relationship).

Wrote a throwaway `src/components/verifyK2Probe.test.tsx` (deleted after use) that imports the
repo's live `isFigureTextAligned`/`figureTextBindingKey` (`src/lib/figureTextAlignment.ts`),
`FIGURE_TEXT_MISMATCH_BLOCKLIST` (`src/lib/figureTextMismatchBlocklist.generated.ts`), and
replays `figureTextAdversarialAudit.test.tsx`'s exact `risks()`/`namedPartCounts()`/
`operationSet()`/`exampleNumbers()`/`disjoint()` functions verbatim, reading each lesson's
*current* body off disk (not the jsonl's cached copy) for all 13 (figureId, body) pairs. Ran via
`npx vitest run` (not `tsx`, since `renderToStaticMarkup` on the real figure components needs a
JSX-capable transform).

| Placement | Figure | key (recomputed) | aligned | blocklisted | risk_reasons | words |
|---|---|---|---|---|---|---|
| k100-01-03/c1 | chart-120 | a1755d73 | true | false | [] | 26 |
| k100-02-05/c1 | tno-count-down-tens | 08918d9d | true | false | [] | 25 |
| k100-02-05/c2 | tno-count-down-tens | 512aaab2 | true | false | [] | 19 |
| k100-02-05/remedials.0.concept | tno-count-down-tens | 512aaab2 | true | false | [] | 19 |
| k100-03-03/c1 | chart-120 | 58af580a | true | false | [] | 28 |
| k100-03-05/c1 | chart-rows | 780408b5 | true | false | [] | 24 |
| k100-03-06/c1 | c120-missing-order | d4c5912a | true | false | [] | 21 |
| k100-03-06/c2 | c120-missing-order | 529d9ada | true | false | [] | 24 |
| k100-03-06/remedials.0.concept | c120-missing-order | 529d9ada | true | false | [] | 24 |
| g2b-02-06/c2 | skip-count-line | baae1bb7 | true | false | [] | 19 |
| g2b-02-06/remedials.0.concept | skip-count-line | baae1bb7 | true | false | [] | 19 |
| mmt-03-02/c2 | mmt-biggest-first | d528bc2a | true | false | [] | 23 |
| pv-03-02/c1 | pv3-regroup | 610a669d | true | false | [] | 59 |

All 13 binding keys match the addendum's final post-risk-fix state exactly (the addendum's
second-pass keys for the 11 risk-fixed placements; the original main-report keys for the 2
placements — `k100-03-05/c1`, `pv-03-02/c1` — that the addendum correctly left untouched). All 13
`aligned=true`, `blocklisted=false`, `risk_reasons=[]`, word counts ≤80. `pv-03-02/c1` additionally
re-verified against `compareExactFigureNumericParity`/`FIGURE_NUMERIC_CLAIMS` directly (the fixed
numeric-exemplar path, not the generic `risks()` heuristic): `figureAtoms=[7,5,12,1,2]`, all now
present in the reworded text, `aligned=true`.

## Scope B — QD P0 (`fa-02-02`, 15 rows total)

**Result: 1/1 fixed lesson KEEP; 3/14 `NOT_REPRODUCIBLE` rows spot-checked and confirmed.**

`git diff HEAD` on `content/courses/fractions-add/lessons/fa-02-02.json` confirms only the `ch1`
step changed — every other step (`c1,i1,k1,c2,k2,i2,k3,r1`) is byte-identical, matching the
report's "no other step touched" claim.

**Arithmetic (independently recomputed, doubling test vs. 1/2):**

| Pair | Doubled numerators | Verdict | Bucket (authored) |
|---|---|---|---|
| 9/16 vs. 7/15 | 9×2=18>16 (above); 7×2=14<15 (below) | 9/16 bigger | `left` ✓ |
| 5/11 vs. 4/7 | 5×2=10<11 (below); 4×2=8>7 (above) | 4/7 bigger | `right` ✓ |
| 5/12 vs. 7/10 | 5×2=10<12 (below); 7×2=14>10 (above) | 7/10 bigger | `right` ✓ |
| 3/5 vs. 4/5 | 3×2=6>5 (above); 4×2=8>5 (above) | same side | `unclear` ✓ |
| 5/9 vs. 6/11 | 5×2=10>9 (above); 6×2=12>11 (above) | same side | `unclear` ✓ |

All 5 buckets and their feedback strings are correct.

**Schema/integrity:** parsed the full lesson against the live `Lesson`/`DragBucketSpec` zod schema
(`src/lib/schema.ts`) via `npx tsx` — schema valid; every `items[].bucketId` resolves to a
declared `buckets[].id`. Feedback strings on all 5 items plus `missFeedback`/`successFeedback` are
90–149 characters (well over the 25-char floor).

**Duplication:** independent digit-collapse (`\d+`→`#`) duplicate scan over every step's
`widget.prompt` in the lesson: 0 collisions across all 6 widget-bearing steps
(`i1,k1,k2,i2,k3,ch1`) — `ch1`'s normalized prompt does not match `i2`'s.

**Pedagogy invariants:** step-kind sequence unchanged
(`concept,interactive,check,concept,check,interactive,check,challenge,recap`); action ratio 6/9 =
66.7% (≥60%).

**Precedent claim** (exactNumberLab → dragBucket as a widget-engine repair for
`QUESTION_DIVERSITY_AND_TRANSFER` P0s): read `reports/closure/S267_SHAPES_AND_SORTING_K_SOURCE_IMPLEMENTATION.md`
directly. That report documents exactly this technique used repeatedly and at scale — 3 of its 7
`ch1` fixes (`ks-01-03`, `ks-02-03`, `ks-03-02`) moved to `dragBucket` specifically, alongside MCQ
and match-pairs moves for the rest — confirming a real, non-fabricated precedent for changing a
challenge step's widget engine as a `QUESTION_DIVERSITY_AND_TRANSFER` fix. (Note: `S267` alone
carries this precedent; `S263`/`S264`'s reports, also read, describe distinct repair techniques —
new transfer inputs/tasks on stable widget families, corrected feedback messages, live
misconception branches — and do not themselves document a widget-*type* change. The general
technique is real and precedented in this repo's practice; citing all three by name overstates
which specific report demonstrates it.)

**Spot-check of 3 of the 14 `NOT_REPRODUCIBLE` rows** (against current lesson source, not the
report's prose):

| Lesson | Queue's cached `mismatch_evidence` | Current `ch1` (read directly) | Verdict |
|---|---|---|---|
| `kc-01-01` | "current assessed surfaces: mcq + subitizeFlash" | `subitizeFlash`: "Six dots were counted, then only moved into a scattered pattern... how many?" | Confirmed — a conservation-of-number prediction, distinct job from `k1`/`k2`'s direct-count `subitizeFlash`. |
| `ks-01-01` | "current assessed surfaces: matchPairs + tapDiagram" (**omits `mcq` entirely**) | `mcq`: "A honeycomb shape is turned on its side... What is it still called?" | Confirmed, **and** the queue's own cached evidence is demonstrably stale — it does not even name `ch1`'s actual widget type. |
| `mmt-04-03` | "current assessed surfaces: clockSet + elapsedTime" (**omits `mcq` entirely**) | `mcq`: "The minute hand points to 8. The short hand is just past 2. What time is it?" | Confirmed, **and** the queue's own cached evidence is again stale in the same way. |

All 3 spot-checks confirm the report's claims and independently corroborate the "stale queue
signal, not a live defect" explanation for the 14 unedited rows.

## Scope C — PROG P0 (11 lessons)

**Result: 11/11 lessons KEEP** (10 fully fixed; `rno-04-02` fixed on 3 of its 4 named steps, with
its 4th step's `NOT_REPRODUCIBLE` ruling independently reviewed and concurred with below).

For every lesson: pulled the original queue row's `mismatch_evidence`/`step_path` from
`PREMIUM_PENDING_WORKLOAD_QUEUE.csv` directly (not from the report), confirmed it names exactly
the steps the report edited, then ran an independent digit-collapse (`\d+`→`#`) duplicate scan
over every `widget.prompt`/`predict.prompt` in the **current** JSON for all 11 files: **0
collisions in every lesson**, including every sibling step the original queue row named
(`k1`/`k2`/`k3`/`ch1` families). `git diff HEAD` on all 11 files confirms **zero** step/option
`id`, `conceptTag`, or widget `type` changes anywhere — only `body`, `widget.prompt`,
`widget.answer`, `commonErrors`/`options`, `hints`, `explanationVariants`, and the `variant`
key were touched.

**Hand-verified arithmetic (every new answer and trap, independently recomputed):**

| Lesson | Step(s) | Recomputed | Match |
|---|---|---|---|
| g2a-01-02 | k3 | 133 odd; 128/150/246 all even | ✓ |
| g2a-01-02 | ch1 (oddEvenPairs) | n=126, ones digit 6 → even | ✓ |
| g2a-02-02 | ch1 | 7+7+7+7=28; traps 21 (3×7), 35 (5×7) | ✓ |
| g2a-02-03 | k2 | 5+5+5+5=20; traps 15 (3×5), 9 (4+5) | ✓ |
| g2a-02-03 | ch1 | 18+6+6=30; traps 24 (18+6), 36 (18+6+6+6) | ✓ |
| g2a-03-03 | k3 | 6×4=24; traps 18 (3×6), 30 (5×6) | ✓ |
| g2a-03-03 | ch1 | 21+7+7=35; traps 28 (21+7), 42 (21+7+7+7) | ✓ |
| g2p-02-02 | k2 | 15+12+9=36; traps 27 (15+12), 45 (double-count) | ✓ |
| g2p-02-02 | ch1 | 40+15+9=64; traps 55 (40+15), 73 (extra leg) | ✓ |
| g2p-03-01 | k3 | 26+17=43; traps 9 (subtract), 26 (drop piece), 52 (2×26) | ✓ |
| g2p-03-04 | k3 | 18+24=42, exceeds both parts → "reasonable" | ✓ |
| g2l-01-02 | ch1 | 60+5+5+5=75; traps 65 (one jump), 90 (jump=10) | ✓ |
| g5l-03-01 | i2 | 119−104=15; bounds `0<5<15<100`, `100/5=20≥4` | ✓ |
| g5l-03-01 | ch1 | 217÷34: 5×34=170 (rem 47, too low), 6×34=204 (rem 13, correct), 7×34=238 / 8×34=272 (overshoot) | ✓ |
| mmt-05-02 | i2 | text/context-only fix; `drawn:9` numeric value unchanged | ✓ |
| rno-04-02 | i3 | -4.1+(-2.85)=-6.95; traps -6.86 (misalign), -1.25 (subtract-not-add) | ✓ |
| rno-04-02 | k3 | 0.55-(-0.35)=0.9; traps 0.2, -0.9 | ✓ |
| rno-04-02 | ch1 | 6.4-(-1.75)=8.15; traps 7.79 (misalign), 4.65 (sign-flip) | ✓ |

**Schema/integrity:** parsed all 11 lesson files against the live `Lesson` zod schema and ran
`widgetIntegrityErrors` (`src/lib/schema.ts`) on every widget in all 11 files via `npx tsx`: all
11 files schema-valid; 0 integrity errors on any touched widget. (Two pre-existing
`lengthCompare` "align mode is horizontal-only" integrity errors were found on the **untouched**
`i1`/`i2` steps of `g2p-03-01` and `g2p-03-04` — these predate this packet's edits, are outside
its scope, and do not affect this disposition.) `g2a-01-02/ch1`'s `oddEvenPairs` widget
specifically verified against the schema's answer-slot-discipline rule: only `oddFeedback` (the
wrong-parity slot) is present, `evenFeedback` (the answer's own slot) is correctly absent.
`g5l-03-01/i2`'s `estimateSlider` verified against the continuous-mode bound: `0 < 5 < 15 < 100`
and `100/5 = 20 ≥ 4`.

**mcq invariants:** correct-first (`options[0].correct === true`) preserved on every mcq edited
(`g2a-01-02/k3`, `g2p-03-01/k3`, `g2p-03-04/k3`, `g5l-03-01/ch1`); every touched option's feedback
is 81–108 characters (well over the 25-char floor) and none opens with a negation.

**Generator-debt (`variant` removal) justification** — checked against the live
`src/lib/g2Variants.ts` generator source directly (not asserted from the report):

| Generator form | Fixed template in source | Why the new content exceeds it |
|---|---|---|
| `OddEvenMcq` | `'Which number is even?'`, 2-digit range, always the even option | New: 3-digit odd-number word problem |
| `OddEvenOddEvenPairs` | `'Is {n} odd or even? Pair the ones digit, then choose.'` | New: real-world 126-chairs framing, different wording |
| `Add2DigitNumeric` | `'{a} + {c} = ?'`, a∈[21,79], c∈[12,69] | New: word problems / multi-addend sums outside that template and range (7 occurrences across `g2a-02-02`, `g2a-02-03`, `g2a-03-03`, `g2p-02-02`) |
| `AddOnesNumeric` | `'{a} + {d} = ?'`, single addend d∈[1,9] | New: chained three-jump prompt (`g2l-01-02/ch1`) |

All 7 removals independently confirmed justified against the actual generator source, not merely
asserted.

### `rno-04-02` / `k2` — independent ruling

The queue's `step_path` names `k2` alongside `i3`, `k3`, `ch1`; the implementer fixed the other
three and left `k2` (`-4.1 - (-2.9) = ?` → `-1.2`) unedited, ruling it `NOT_REPRODUCIBLE` as
deliberate compare-and-contrast pedagogy rather than a duplicate.

Independently formed a view **before** reading the implementer's argument: ran my own
digit-collapse, sign-preserving duplicate scan (`\d+`→`#`, leaving `-`/`+` intact) over every
`widget.prompt` in the current lesson. `k2`'s normalized template is `-#.# - (-#.#) = ?`
(negative minuend). This is textually distinct from every other step's template in the lesson —
`k1`/`i3` are `-#.# + (-#.#) = ?` (addition); `i2`/`k3`/`ch1` are variants of `#.# - (-#.#) = ?`
(positive minuend). No collision under either exact-byte or normalized-template comparison.

`k2` also produces a materially different result (`-1.2`, still negative) from `k1`'s `-7` despite
sharing the identical two operands (`-4.1`, `-2.9`) — this is the classic same-operands,
different-operator contrast used to isolate a sign rule (here: "adding two negatives" vs.
"subtracting a negative from a negative"), and it sits immediately adjacent to `k1` in the step
sequence, which is exactly where a compare-and-contrast pair belongs pedagogically.

**Independent ruling: concur with `NOT_REPRODUCIBLE`.** This is deliberate compare-and-contrast
pedagogy (same operands, contrasted operators, isolating the sign rule), not a duplicated question
job under the packet's own defect class (a genuinely repeated instructional job). No edit was
warranted, and none was made.

## Discrepancies found

**None material to the KEEP/REVISE/ESCALATE decision for any of the 20 lessons.** Every binding
key, alignment result, `risks()` result, hand-arithmetic answer/trap, schema/integrity result, and
duplicate-scan result independently recomputed in this pass matches the implementer's reports
exactly for all 20 lessons. Two minor, non-blocking observations:

1. **QD precedent over-attribution.** The "precedented per S263/S264/S267" framing (used to
   justify `fa-02-02/ch1`'s `exactNumberLab`→`dragBucket` widget-engine change) is correct in
   substance — `S267` documents the identical technique used 3 times — but `S263`/`S264`'s own
   reports do not themselves demonstrate a widget-*type* change; they document other repair
   techniques (new transfer content on stable widget families, corrected feedback, live
   misconception branches). Citing all three as equally demonstrating the specific technique
   overstates the evidence; the technique itself is real and precedented by `S267` alone. Does not
   change the KEEP verdict for `fa-02-02`.
2. **Queue staleness confirmed, not just claimed.** Two of the three spot-checked
   `NOT_REPRODUCIBLE` QD rows (`ks-01-01`, `mmt-04-03`) have queue `mismatch_evidence` fields that
   omit `ch1`'s actual current widget type (`mcq`) entirely — independent, direct confirmation
   that `PREMIUM_PENDING_WORKLOAD_QUEUE.csv`'s cached evidence is stale for these rows, not merely
   an assertion in the implementer's report.

## Signed dispositions

`reports/closure/cowork-staging/laneV-s318-k2qdprog-dispositions.jsonl` — 20 `lesson-disposition`
records, one per lesson, `recordId` = `S318-V2-<lessonId>`, `reviewer` = "Claude Cowork independent
verifier (S318)", `decision`/`visualDecision`/`gradeLanguageDecision` all set from the exact enum
sets (`KEEP|REVISE|ESCALATE`, `REQUIRED|PREFERRED|SUFFICIENT|ESCALATE`, `FIT|REVISE|ESCALATE`),
`reviewedBasisHash` from `node scripts/session/print-review-basis.mjs` run once across all 20
lesson IDs, `reviewedAt` = `2026-08-20T12:10:23.000Z` (`date -u +%FT%T.000Z`), `reopenCondition` =
"Lesson or course source bytes change (review basis hash drift)." on every record.

All 20: `decision=KEEP`, `visualDecision=SUFFICIENT`, `gradeLanguageDecision=FIT`.

## Addendum — follow-up re-sign (k100-01-03, k100-03-03 word-cap tightening)

Integrator tightened `c1.body` on `k100-01-03` (27→25 words) and `k100-03-03` (28→24 words) to
satisfy the kindergarten 25-word concept cap; `git diff HEAD` confirmed these are the only changes
since my original signatures (figure/narration/IDs/conceptTag/other steps untouched), meaning and
truth are preserved against `chart-120` (41–50 row; 46→47,48,49,50 continuation), and independent
recomputation confirms `isFigureTextAligned=true`, not blocklisted, `risks()`=`[]` for both — **2/2
KEEP**, re-signed as `S318-VF2-k100-01-03` / `S318-VF2-k100-03-03` in
`reports/closure/cowork-staging/laneV-s318-final-dispositions.jsonl`.

## Return contract

```
packet_id: S318-LANEV-K2QDPROG-VERIFICATION
role: independent verification
model: claude-sonnet-5
scope_ids: 13 K2 placements / 8 lessons + 1 QD lesson (15 queue rows, 14 spot-checked/sampled 3) + 11 PROG lessons = 20 lessons signed
status: complete
decision_summary: 20/20 lessons KEEP, 0 REVISE, 0 ESCALATE
discrepancies: none material; 2 non-blocking observations (QD precedent attribution, confirmed queue staleness)
rno-04-02_k2_ruling: concur with NOT_REPRODUCIBLE (deliberate compare-and-contrast pedagogy, not a duplicate)
evidence_refs: reports/closure/S318_K2QDPROG_VERIFICATION.md (this file),
  reports/closure/cowork-staging/laneV-s318-k2qdprog-dispositions.jsonl
next_owner: closure ledger owner
```
