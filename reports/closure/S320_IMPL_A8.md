# S320 Implementation — Packet A8 (Bounded Implementation Worker)

Prefix: `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` (MT-V4-WORKER-PREFIX-1), read and applied.
Contracts: `reports/closure/S320_ASSESS_A8.md` — all 23 REVISE lessons implemented.
Scope: `content/courses/solving-equations`, `content/courses/linear-equations-systems`, `content/courses/quadratics` lesson JSON files named in the contracts. No other files edited. No `npm`/`vitest`/`tsc` run, per instructions.

## Summary

| Course | REVISE lessons fixed |
|---|---|
| solving-equations | 11 / 11 |
| linear-equations-systems | 4 / 4 |
| quadratics | 8 / 8 |
| **Total** | **23 / 23** |

Every changed file parses (`node JSON.parse`). Every changed equation/system was hand-solved and, for systems, checked in both equations. A scripted duplicate scan (within-lesson and cross-lesson, per course) found no unintended new duplicates after the fixes; the only same-lesson repeats it turned up are the two patterns the contracts explicitly exempt (an interactive step and its own immediately-following check sharing a system by original lesson design, and a remedial reusing its own lesson's intro example) plus one boilerplate prompt string ("Match each formula to the correct rearrangement.") shared between two unrelated alg1-03-0x lessons. `node scripts/session/print-review-basis.mjs` was re-run for all 23 lessons (plus les-03-01/les-04-01, the two read-only reference lessons) to confirm every `reviewedBasisHash` changed; per the S320 disposition file's `reopenCondition`, these 23 lessons now need re-review before they can be marked KEEP — that re-review is out of this packet's scope (implementation workers cannot assess their own packet).

## Per-lesson changes and substitution checks

### solving-equations

**alg1-01-01** — i2 (matchPairs) pre-revealed ch1 (`5x+3=38`) and k2 (`3x-5=16`). Changed `e2` to `6x − 4 = 38` and `e3` to `4x + 9 = 37`, both still x=7 (right/pairs unchanged). Check: 6(7)−4=38 ✓; 4(7)+9=37 ✓. Updated the one pairError feedback string that quoted e3's old text.

**alg1-01-02** — i2 pre-revealed k2 (`7x+3=4x+15`) and ch1 (`9x+4=5x+24`). Changed `f1` to `8x + 1 = 5x + 13` (x=4) and `f2` to `7x + 2 = 3x + 22` (x=5). Check: 8(4)+1=33=5(4)+13 ✓; 7(5)+2=37=3(5)+22 ✓. Updated both pairErrors feedback strings.

**alg1-01-03** — i1 (equationOutcomeLab) fully solved k1's `3(x+4)=27`. Changed to `4(x+2)=32` → x=6. Check: 4(6+2)=32 ✓. Updated prompt/leftDisplay/coefficients/all 3 operation labels/successFeedback.

**alg1-02-01** — i1 solved k2's `x/4−3=2`; i2 pre-revealed k2 and ch1 (`x/5+1=4`). Changed i1 to `x/3−2=4` → x=18 (check: 18/3−2=4 ✓). Changed i2's `e1` to `x/5+2=6` (x=20) and `e2` to `x/3+2=7` (x=15), preserving target answers. Checks: 20/5+2=6 ✓; 15/3+2=7 ✓. Updated both pairErrors feedback strings.

**alg1-02-02** — i2 fully solved k2's `x/2+x/5=7`. Changed to `x/2+x/6=8` → x=12 (chosen instead of the contract's literal example `x/3+x/4=7`, which is byte-identical to this lesson's own ch1 — using it would have created a fresh duplicate). Check: 12/2+12/6=6+2=8 ✓. Updated LCD-clear result block, all 3 operation labels, successFeedback.

**alg1-02-03** — i2 fully solved k2's `0.2x+3=4`. Changed to `0.4x+1=5` → x=10. Check: 0.4(10)+1=5 ✓. Updated ×10-shift result block, all 3 operation labels, successFeedback.

**alg1-03-01** — i2 `m1`/`r1` (`d=rt, solve for t` → `t=d/r`) was byte-identical to k2. Changed to `P=4s, solve for s` → `s=P/4`. Check: divide both sides by 4 ✓. Updated both pairErrors feedback strings.

**alg1-03-02** — **Hard math error (signed contract, citing `reports/closure/S320_ASSESS_A8.md` line 107).** i1 solveBalance stated `A=bh/2, A=12, b=6` becomes `3h=24` → `h=8`; both false. Correct: `2A=bh` → `24=6h` → `h=4`. Set `widget.a` from 3 to 6, updated prompt (`6h = 24`), successFeedback (`h = 4...`), missFeedback (`6h = 24 splits into 6 equal groups.`). Check: 12=6(4)/2=24/2=12 ✓.

**alg1-04-01** — i1 fully solved k1's `2x+3<11`. Changed to `2x+5<15` → x<5 (fresh boundary, per contract's stronger option). Check: 2x+5<15 → 2x<10 → x<5 ✓.

**alg1-04-02** — Two sites: c1's worked example stated k1's exact `−2x<6`→`x>−3`; changed to `−3x<9`→`x>−3` (same answer, different equation). i2 fully solved k2's `−3x+1>10`; changed to `−2x+5>15` → x<−5. Checks: −3x<9 → x>−3 ✓ (divide by −3, flip); −2x+5>15 → −2x>10 → x<−5 ✓ (divide by −2, flip).

**alg1-04-03** — i1 fully solved k1's `2x+5>5x−4`; i2's `e1` repeated it and `e3` duplicated k2's `4x+2>x+11`. Changed i1 to `3x+4>6x−8` → x<4. Changed i2's `e1` to `5x+1>8x−8` (x<3) and `e3` to `5x−1>2x+8` (x>3), preserving target answers. Checks: 3x+4>6x−8 → −3x>−12 → x<4 ✓; 5x+1>8x−8 → −3x>−9 → x<3 ✓; 5x−1>2x+8 → 3x>9 → x>3 ✓. **Residual not in scope**: i2's `e2` (`3x+7<7x−5`) is byte-identical to ch1's equation; the contract for this lesson named only e1/e3, so e2 was left unchanged and is flagged here for a future disposition rather than fixed unilaterally.

### linear-equations-systems

**les-01-02** — i1 (solveBalance) fully solved k1's `5x+2=3x+10`. Changed to `4x+3=2x+11` (a:2,b:3,c:11) → x=4. Check: 2x+3=11 → 2x=8 → x=4 ✓. Also updated i1's `predict` block (prompt/options/reveal) to the same new equation for internal consistency — the contract named prompt/successFeedback explicitly; the predict block sits inside the same step and would otherwise reference a different equation than the widget it accompanies.

**les-03-02** — k2/k3 (`y=−x+4, y=2x−5` → (3,1)) and ch1 (`y=3x−4, y=x+2` → (3,5)) were byte-identical to les-03-01's k2/ch1. Changed k2/k3 to `y=−2x+9, y=x−3` → (4,1); changed ch1 to `y=2x−1, y=x+4` → (5,9). Checks: −2(4)+9=1 and 4−3=1 ✓ both; 2(5)−1=9 and 5+4=9 ✓ both. Note: the contract described k2/k3 as an `affineRelationshipLab` widget; the file's actual widget type is `numeric` — fields updated to match the file's real structure (prompt/answer/commonErrors), not the contract's literal widget-type label.

**les-04-02** — 6 of 7 items reused les-04-01's systems verbatim. i1/k3: `y=3x,2x+y=10`→`y=5x,3x+y=16` (x=2,y=10). i2: `y=2x,x+y=9`→`y=3x,x+y=12` (x=3,y=9). k2: `y=x+1,x+y=7`→`y=x+2,x+y=8` (x=3,y=5). ch1: `y=3x−5,x+y=7`→`y=2x−3,x+y=9` (x=4,y=5). remedial: `y=4x,x+y=10`→`y=5x,x+y=12` (x=2,y=10, distinct full system from i1/k3 despite sharing the first equation, per contract). k1 (`y=x−2,2x+y=10`) was already fresh, left unchanged. Checks (both equations each): 3x+5x=16→x=2,y=10 ✓; x+3x=12→x=3,y=9 ✓; 2x+2=8→x=3,y=5 ✓; 3x−3=9→x=4,y=5 ✓; x+5x=12→x=2,y=10 ✓.

**les-04-03** — Word-problem systems reused bare-algebra systems from les-04-01/les-04-02. i1/k1 (numbers, 4:1 ratio): total 10→15 (x=3,y=12). i2/k2 (rope, 2:1): total 9→12 (x=4,y=8). k3 (tickets, +1): total 7→13 (x=6,y=7). remedial (numbers): ratio 2:1/total 9 → ratio 3:1/total 12 (x=3,y=9), distinct from corrected i2/k2. ch1 was already fresh, unchanged. Checks: 5x=15→x=3,y=12 ✓; 3x=12→x=4,y=8 ✓; 2x+1=13→x=6,y=7 ✓; 4x=12→x=3,y=9 ✓.

### quadratics

**qu-01-03** — Remedial check was byte-identical to k2 (`(x+2)^2+5`, vertex x=−2). Changed remedial to `(x+5)^2+1`, vertex x=−5. Check: x+5=0 → x=−5 ✓.

**qu-02-01** — Remedial identical to k1 (`x²−x−6=0=(x−3)(x+2)`, larger 3); i1's predict.reveal also pre-stated k1's root pair. Primary: remedial changed to `x²−3x−10=0=(x−5)(x+2)`, larger 5 (contract's first-listed alternative, `(x+4)(x−3)`, still gave 3, so the final revised value was used). Secondary (optional per contract, applied for completeness): softened i1's predict.reveal to drop the bare "x = 3 or x = −2" while keeping the zero-product reasoning. Check: (x−5)(x+2)=x²−3x−10 ✓; roots 5, −2, larger 5.

**qu-02-02** — Remedial identical to k1 (`x²+5x+6=0`, larger −2). Changed to `x²+8x+15=0=(x+3)(x+5)`, larger −3 (per contract's final revised suggestion, since the two intermediate candidates it walked through both still gave −2). Check: (x+3)(x+5)=x²+8x+15 ✓; roots −3, −5, larger −3.

**qu-02-03** — Remedial identical to k1 (`x²−25=0`, larger 5). Changed to `x²−64=0`, larger 8. Check: x²=64 → x=±8 ✓.

**qu-03-01** — Remedial identical to k1 (`x²−49=0`, larger 7); k1 itself was byte-identical to qu-02-03's k3 (qu-02-03 precedes in sequence, so it stays KEEP and this lesson owns both fixes). k1 changed to `x²−121=0`, larger 11. Remedial changed to `x²−100=0`, larger 10 — deviates from the contract's literal suggestion (`x²−64=0`) because that value was independently assigned to qu-02-03's own remedial in this same packet, so reusing it here would create a fresh cross-lesson duplicate; `x²−100=0` satisfies the contract's actual requirement (fresh, distinct from the new k1). Checks: x²=121→x=±11 ✓; x²=100→x=±10 ✓.

**qu-03-02** — Remedial identical to k1 (`x²+2x−8=0` via formula, larger 2). Changed to `x²−4x−5=0`, larger 5. Check: a=1,b=−4,c=−5; D=16+20=36, √36=6; x=(4±6)/2 → 5 or −1 ✓.

**qu-03-03** — i1's predict.reveal pre-answered k1's identical discriminant-count question (`x²−5x+6=0`, D=1, 2 solutions). Changed k1 to `x²+2x−3=0`, D=16, still 2 solutions. Check: D=4+12=16>0 ✓. i1 and the remedial's reuse of i1's own sub-question left unchanged per contract (accepted pattern-B).

**qu-04-03** — i1's predict.reveal pre-answered k1's identical max-value question (`P=−x²+12x`, max 36). Changed k1 to `P=−x²+16x`, max 64. Check: axis x=−16/(2·−1)=8; P(8)=−64+128=64 ✓. i1 and the remedial's reuse of i1's own axis question left unchanged per contract (accepted pattern-B, same precedent as qu-03-03).

## Verification gates run

- `node -e "JSON.parse(...)"` on every one of the 23 changed files — all parse clean.
- Hand substitution check for every changed equation/system, shown per-lesson above (systems checked in both equations).
- Scripted within-lesson duplicate scan (prompts, matchPairs labels, equationOutcomeLab display strings, affineRelationshipLab/systemsExplore `lines[].sourceText`) across every step (main + remedial) of all 36 lessons in the three courses — flags only the contract-exempt patterns noted above.
- Scripted cross-lesson duplicate scan (bare equations and full systems, normalized) within each of the three courses — 0 unexpected matches after the fixes.
- `node scripts/session/print-review-basis.mjs` re-run for all 23 changed lessons (new `reviewedBasisHash` values recorded in the NDJSON) plus les-03-01/les-04-01 (read-only reference lessons, unedited, hashes re-confirmed unchanged in effect since their files were not modified).
- `npm`/`vitest`/`tsc` intentionally **not** run, per task instructions.

## Deviations from literal contract text (all preserve the contract's underlying intent)

1. **alg1-02-02 i2**: used `x/2+x/6=8` instead of the contract's literal example `x/3+x/4=7`, because that literal example is byte-identical to this lesson's own ch1 and would have created a new duplicate the moment it replaced the old one.
2. **qu-02-01 remedial**: used the contract's own fallback value (`x²−3x−10=0`, larger 5) rather than its first-listed example, because the first-listed example still coincided with k1's answer (3).
3. **qu-02-02 remedial**: used the contract's final revised value (`x²+8x+15=0`, larger −3) rather than its intermediate suggestions, for the same reason (both intermediate options still produced −2).
4. **qu-03-01 remedial**: used `x²−100=0` instead of the contract's literal suggestion `x²−64=0`, because `x²−64=0` was independently assigned (per this same contract's own text) to qu-02-03's remedial, and reusing it here would have created a new cross-lesson duplicate within the same packet.

No other deviations. All IDs, `conceptTag`s, widget types, and evaluator semantics were preserved except where a contract explicitly required a widget-field change (alg1-03-02's `widget.a`).

## Residual finding (not fixed, out of this packet's contract scope)

**alg1-04-03**: i2's `e2` (`3x+7<7x−5`, x>3) is byte-identical to ch1's equation in the same lesson — the same pre-reveal pattern this packet's contracts fix elsewhere, but the S320 contract for alg1-04-03 named only `e1`/`e3` for replacement. Left unchanged per the "do not broaden scope" rule; flagged here for an independent assessor to decide whether it needs its own disposition.

## Raw data

- Contracts: `reports/closure/S320_ASSESS_A8.md`
- This report: `reports/closure/S320_IMPL_A8.md`
- NDJSON (23 records, one per fixed lesson): `reports/closure/cowork-staging/laneA-s320-impl-5.jsonl`
- Changed files: 11 in `content/courses/solving-equations/lessons/`, 4 in `content/courses/linear-equations-systems/lessons/`, 8 in `content/courses/quadratics/lessons/` (paths and post-fix sha256 in the NDJSON).
- No files outside these 23 lesson JSONs were modified. No `npm`/`vitest`/`tsc` commands were run.
