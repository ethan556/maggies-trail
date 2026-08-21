# S326 Reconciliation — Packet R1 (K-2 + onboarding/platform-adjacent)

Scope: K-2 course integrity/choice-order tests, S192/S194 solver tests, S247/S255 component tests, manipulativeAlongside S237, OnboardingFlow avatar/name.

Baseline note (affects every row): the S325 red list was generated against the stale
`/tmp/mt-head` worktree pinned at commit `06a9bb1`, but the repo's actual clean HEAD is
`a78d6a3` (5 commits later, including the committed "S320-S321: 143 contracts implemented"
wave). Reds whose cause is in `06a9bb1..a78d6a3` are therefore *committed* signed work,
not uncommitted-tree drift; they are still resolved here so the branch is green.

---

## src/lib/session249.numberWritingKCourseIntegrity.test.ts (2 reds)

Root cause for both: signed record **S320-IMPL-A5-kcw-02-04**
(reports/closure/cowork-staging/laneA-s320-impl-2.jsonl and laneB-s320-A5-dispositions.jsonl,
contract reports/closure/S320_ASSESS_A5.md) — committed in `a78d6a3` — swapped
kcw-02-04/ch1's off-topic `subitizeFlash(count=7)` for a `numberLineHop`
(start=10, hops=8, lands 18).

1. "pins every independently discovered place-value and flash-feedback truth repair" —
   **(a) STALE PIN.** Course-wide subitizeFlash census legitimately fell 5 → 4.
   Re-pinned `toHaveLength(5)` → `toHaveLength(4)` with a citation comment naming
   S320-IMPL-A5-kcw-02-04. All per-flash feedback/count assertions still hold.

2. "replaces every copied i2 … removes exact/normalized same-sitting prompts" —
   **(b) REAL REGRESSION.** The new ch1 prompt "Start at 10 and count on 8. Tap where
   you land." collides under digit-normalization with untouched k2 ("Start at 10 and
   count on 6. Tap where you land.") — the S320 gates scanned exact duplicates only, not
   the S249 normalized same-sitting invariant. Fixed the CONTENT: ch1 prompt reworded to
   "Make 8 one-unit hops forward from 10. Tap the teen number where you land."
   (same widget, same math, landings/feedback untouched; prompt unique corpus-wide).
   Corrective disposition appended: `s326-R1-kcw-02-04` in
   reports/closure/cowork-staging/laneA-s326-R1.jsonl
   (reviewedBasisHash b3ddb30f1c2970f99d37d44f6791973bd313f41f0e98934b0ad36f01f0599fb7).

Final: `npx vitest run src/lib/session249.numberWritingKCourseIntegrity.test.ts` — 5/5 GREEN.

---

## src/lib/session253.compareNumbersKCourseIntegrity.test.tsx (1 red)

"keeps every answer route truthful and choice labels parallel" — kcm-02-02/k1 label
spread 16 > pinned cap 15. **(b) REAL REGRESSION.** Signed **S320-IMPL-kcm-02-02**
(laneA-s320-impl-3.jsonl; verified by S321-V1-kcm-02-02, laneV-s321-impl123) legitimately
reworded k1 off kcm-01-03/k2's verbatim duplicate, but the new correct label ran 56 chars
against a 40-char shortest distractor, re-creating the length cue the ≤15 spread pin
guards. Cap not raised (that would weaken the anti-cue invariant); instead the CONTENT
was trimmed: correct label "It is obvious — 9 blue blocks is clearly the bigger pile" →
"It is obvious — 9 blue blocks is the bigger pile" (48 chars; spread 14; semantics,
feedback, evaluator routes untouched). Corrective disposition `s326-R1-kcm-02-02`
appended (reviewedBasisHash 0ccc10a3073e9dbe6b7e9f3ee9d57e55e9b58bc42c544ded014e151892aef815).

Final: 4/4 GREEN.

---

## src/lib/session305.measureCompareKChoiceOrder.test.ts (1 red)

**(a)+(b) MIXED.** Eight contract rows drifted, all caused by the committed signed
S320-A11 dedup lane (records S320-IMPL-kmd-01-04 / -kmd-02-02 / -kmd-02-03 /
-kmd-02-04 / -kmd-03-02 / -kmd-03-04; laneA-s320-impl-3.jsonl, verified in
laneV-s321-impl123): byte-duplicate MCQs were rewritten with fresh questions.

- (a) STALE PINS: promptHash/optionsHash re-pinned to the S320-authored content for
  kmd-01-04/ch1, kmd-02-02/{k2,k3,ch1}, kmd-02-03/k2, kmd-02-04/k2, kmd-03-02/k1,
  kmd-03-04/ch1 — recomputed with the test's own sha256 algorithm; citation comments
  added at each row.
- (b) REAL REGRESSION: the S320 lane re-authored those MCQs correct-FIRST, undoing the
  S305 choice-order repair (correct answer back at display index 0 in all 8 steps).
  Fixed the CONTENT by reordering the options array only, restoring each step's
  contracted position (row-index %3+1): kmd-01-04/ch1→3, kmd-02-02 k2→2 k3→3 ch1→1,
  kmd-02-03/k2→2, kmd-02-04/k2→3, kmd-03-02/k1→1, kmd-03-04/ch1→2. Labels, ids,
  correct flags, feedback, prompts untouched (options hash is id-sorted, so pins are
  order-independent). Dispositions `s326-R1-kmd-01-04` … `s326-R1-kmd-03-04` appended.

Final: 2/2 GREEN.

---

## src/lib/session306.compareNumbersKChoiceOrder.test.ts (1 red)

**(a)+(b) MIXED**, same pattern as S305. Ten contract rows drifted, all caused by signed
S320-IMPL-kcm-* dedup rewrites (laneA-s320-impl-3.jsonl) and S322-kcm-* stale
stub-template fixes (laneA-s322-dupfix.jsonl), verified in laneV-s321-impl123.
- (a) STALE PINS re-pinned (test's own sha256): kcm-01-03/{k1,ch1}, kcm-01-04/{k3,ch1},
  kcm-02-01/ch1, kcm-02-02/{k1,k2,ch1}, kcm-02-03/k2, kcm-03-02/ch1.
- (b) REAL REGRESSION: six of those steps were re-authored correct-FIRST, undoing the
  S306 position repair. Reordered options only: kcm-01-03/k1→1, kcm-01-04/k3→2,
  kcm-02-02/k1→1 k2→2, kcm-02-03/k2→2, kcm-03-02/ch1→3. Dispositions
  s326-R1-kcm-01-03/-01-04/-02-03/-03-02 appended; s326-R1-kcm-02-02 updated.
- Cross-check: S253 compare-numbers-k suite re-run after reorders — still 4/4 GREEN.
Final: 2/2 GREEN.

## src/lib/session307.teenNumbersKChoiceOrder.test.ts (1 red)

**(a)+(b) MIXED**, same pattern. Eleven rows drifted, all signed S320-IMPL-knb-* dedup
rewrites (verified S321-V1-knb-*): knb-01-04/{k1,k2}, knb-02-01/{k2,ch1}, knb-02-03/k1,
knb-03-01/{k1,ch1}, knb-03-02/ch1, knb-03-03/{k1,k2}, knb-03-04/ch1.
- (a) hashes re-pinned for all 11 rows; (b) all 11 were correct-first — reordered
  options to contracted positions (3,1,2,3,3,3,2,3,1,2,2 respectively).
  Dispositions s326-R1-knb-* appended (7 lessons).
Final: 2/2 GREEN.

## src/lib/session310.countingTo20KChoiceOrder.test.ts (1 red)

**(a) STALE PIN.** Single drift: kc-04-01/ch1 optionsHash. Signed
S320-IMPL-A5-kc-04-01 (verified S321-V1-kc-04-01) fixed option c's factually backwards
feedback ("misses the blue" → "misses the red"; 7=3+4 omits the 2 red marbles).
Correct position unchanged (index 3, as contracted). Re-pinned
cdc271278f3ea16d... → e8f4bde2fc200231e8ac7478589ebb04e54205af593727182f7ae667401724d4.
No content change. Final: 2/2 GREEN.

## src/lib/session313.numberWritingKChoiceOrder.test.ts (1 red)

**(a) STALE PIN.** Aggregate expectedSemanticHash drifted from exactly one MCQ:
kcw-03-04/k2, changed by signed S322-kcw-03-04 (6-dots duplicate of kcw-01-02/k2 →
truthful 16-dots pattern; options 16/17/15/18 recomputed). All 35 correct-position
checks passed unchanged. Re-pinned 8c4ee1de… → cac7918d46533a6acbf61eb2cce9e5ce98d1f1c845fa44544fa68450a5a4708f.
No content change. Final: 2/2 GREEN.

## src/lib/session314.measureLengthG1ChoiceOrder.test.ts (1 red)

**(a) STALE PIN.** Aggregate expectedSemanticHash drifted from three MCQs rewritten by
signed committed S320-IMPL-g1m-03-01 (k1: 9-cubes/ribbon → 11-blocks/scarf) and
S320-IMPL-g1m-03-03 (k1: 12-cubes/stick → 15-blocks/rope; k3: 8-cubes/ribbon →
10-blocks/belt), both verified S321-V1. All 22 position checks passed. Re-pinned
c21a1988… → eb4926d51a190b66119006f5903de65af5f26b12cd293c8ce6db520e729b4421.
No content change. Final: 2/2 GREEN.

---

## src/lib/session192.addThreeNumbers.test.ts (3 reds)

**(c) PRE-EXISTING MISCLASSIFIED — all 3. Nothing touched.**
g1t-01-04/ch1 ("After making a ten, add 9 more…"=19, PartWholeNumeric),
g1t-03-01/k3 ("A full ten has 7 more counters joined…"=17, PartWholeNumeric),
g1t-03-02/k2 ("There are 17 stickers. Ten are already sorted…"=7, UnknownNumeric).
All three prompts spell "ten" as a word, so g1Independent.cjs's digit-based re-derivation
returns NaN. Verified red at clean HEAD a78d6a3, at 06a9bb1 (the stale /tmp/mt-head the
S325 baseline was cut from), and at c977efa; `git log -S` shows all three prompts were
introduced in commit c5af1f1 ("Advance mastery and content integrity"), which predates
this wave entirely — the S320-A13 assessment lane already treated these prompts as
existing canon (only trap feedback was fixed there). The answers themselves are
mathematically correct; the red is an oracle-parsing gap that predates this session.
Not turned green (out of (a)/(b) authority; flagged for a follow-up packet).
Final: 9/12 GREEN (3 pre-existing reds unchanged, same as clean HEAD).

## src/lib/session192.composeShapes.test.ts (2 reds)

**(b) REAL REGRESSION (oracle gap exposed by signed committed rewrites).**
Signed S320-IMPL-A13-g1s-01-03 retargeted k2 to "How many corners does a hexagon
have?"=6 (removing a triangle-corners duplicate) and S320-IMPL-A13-g1s-03-02 reframed
k2 to "…How many corners does one triangle piece have?"=3 (removing the 4th verbatim
numeric duplicate of g1s-02-01/k2); both verified S321-V2. The shipped independent
solver (src/lib/g1Independent.cjs, Smg1ShapeSidesNumeric) knew only
a (triangle|square|rectangle|circle), so re-derivation crashed (match null).
Fix applied on the src side (no lesson content changed): extended the shape table with
hexagon {sides:6, corners:6} and widened the article matcher to `(?:a|one) <shape>`.
Verified the new solver derives the correct answer for ALL 18 Smg1ShapeSidesNumeric
steps corpus-wide (13 distinct prompts), and collateral-checked the other
g1Independent consumers: session192.measureLength and session191.batchA fail counts are
byte-identical with and without the edit (10 and 12 — both pre-existing red at clean
HEAD and correctly absent from the S325 NEW list); no behavior change for any
non-hexagon/non-"one <shape>" prompt.
Final: 12/12 GREEN.

---

## src/lib/session194.arraysEvenOdd.test.ts (4 reds)

**(a) STALE STRUCTURAL PINS.** Signed S318 PROG (PROGRESSION-g2a-02-03, verified
S318-V2-g2a-02-03) and s323-P6 (g2a-01-02/g2a-02-02/g2a-03-02/g2a-03-03) replaced
byte-duplicate checks with scenario-specific and repeated-sum array rewrites. Seven
variant declarations were withdrawn with those rewrites (32 → 25 declared), five of
them on numeric steps whose new repeated-sum prompts (7*4=28, 5*4=20, 18+6+6=30,
6*4=24, 21+7+7=35 — all hand-reverified here and in the signed records) are not
derivable by any registered g2-add-subtract-100 form. Test re-pinned without
weakening: `declared > 25` → exact `declared === 25` (two-way ratchet), and an
explicit POOL_WITHDRAWN pin set for the five numeric steps that asserts they remain
variant-free while every other numeric must still solver-derive; evaluate/trap
assertions unchanged for all steps. No content changed → no new disposition.
Cross-effect note for R3: these same withdrawals reduce the refreshable pool that
variants.delivery.s242 FLOOR test counts.
Final: 12/12 GREEN.

## src/lib/session194.lengthProblems.test.ts (1 red)

**(a) STALE STRUCTURAL PIN**, same class. Signed PROGRESSION-g2p-02-02 (S318 PROG,
verified S318-V2-g2p-02-02, committed in 992b590) rewrote g2p-02-02 k2/ch1 as
three-addend leg sums (15+12+9=36, 40+15+9=64, hand-verified) with variants withdrawn.
Re-pinned with an explicit two-step withdrawal exemption (must stay variant-free);
all other numerics still solver-derive; evaluate/trap checks unchanged. No content
changed. Final: 12/12 GREEN.

---

## src/components/session247.addSubtract1000G2Course.test.tsx (scoped red: language-hazards test)

1. "removes the reviewed Grade 2 language hazards" — **(b) REAL REGRESSION.** Signed
   S318-FIGA-g2b-02-06 (committed 992b590, verified S318-V2-g2b-02-06) reworded the
   c2 + remedial concept BODY (to escape blocklisted stale-fingerprint key 90c2bb3d and
   spell "two hundred" for skip-count-line word-number alignment) but left narration
   stale and ran 111 chars — breaking body===narration and the ≤110 cap. Fixed the
   CONTENT: dropped "only" (106 chars) keeping the signed wording otherwise intact, and
   synced narration:=body on both placements. Verified with the live module: new
   binding key cee99f99, isFigureTextAligned=true, not blocklisted, "two hundred"
   retained per S318-FIGA-RISK-g2b-02-06. Disposition `s326-R1-g2b-02-06` appended.
   GREEN.

2. "binds all concept and remedial moments to registered, visible semantic figures" —
   **(c) PRE-EXISTING MISCLASSIFIED** (and NOT in the S325 NEW list). g2b-02-04's two
   concepts bind pv1000-cascade-down + pv1000-trade-down (two distinct figures) since
   commit c5af1f1, predating this wave; the pin expects the same figure twice
   (pv3-borrow-zero). Red at 06a9bb1 and at clean HEAD identically. Untouched — needs
   its own signed contract (either a duplicate-figure restoration or a pin-structure
   rework allowing per-concept figures).

Final: 4/5 GREEN (the 1 red is the documented pre-existing figure pin, unchanged from
baseline).

Cross-effect note for R3: g2b-02-06's binding key changed baae1bb7 → cee99f99; the
figureTextAlignment corpus test and any blocklist regeneration should pick this up
automatically (key verified not blocklisted).

## src/components/session247.howManyFlashCountTruth.test.tsx (1 red)

**(a) STALE PIN.** Signed S319-EARLY-khm-03-06 (committed ae399cc, verified
S319-V2-khm-03-06) retargeted khm-03-06/ch1's subitizeFlash 4 → 6 to break its
identical-stimulus duplication of k2 (options [5,6,7,8], commonPicks 5/7, feedback
recomputed). Re-pinned EXPECTED count 4 → 6 with citation; every truth-agreement
assertion (evaluator, feedback digits, rendered reveal) recomputes from content and
passes. No content change. Final: 4/4 GREEN.

## src/lib/session255.dataLinePlotsG2FollowOn.test.tsx (scoped red: MCQ parity test)

1. "balances all 15 MCQ keys … label parity" — **(b) REAL REGRESSION.** Signed
   S320-IMPL-g2g-03-03 (verified S321-V1) rescoped k1 to pencil lengths; new labels
   broke the ≤1.25 length-ratio anti-cue pin (29/21 = 1.381). Fixed CONTENT by
   lengthening the two short distractors only ("A clock showing the time",
   "A ruler for just one pencil" → 29/28/24/27, ratio 1.208); correct option,
   feedback, and the signed rescope untouched. Disposition `s326-R1-g2g-03-03`
   appended. GREEN.

2. "gives every remedial a registered visual, a new concept explanation, and a
   distinct check" — **(c) PRE-EXISTING MISCLASSIFIED** (red at 06a9bb1 baseline and
   NOT in the S325 NEW list): g2g-02-03's remedial concept body byte-equals its c2
   body ("This bar graph shows cats = 3, dogs = 6, and birds = 4…"), a duplication
   that predates this wave. Untouched; needs its own signed contract.

Final: 5/6 GREEN (1 documented pre-existing red, unchanged from baseline).

---

## src/lib/manipulativeAlongside.s237.test.ts (scoped reds: ns-01-01 and pv-03-03 rows)

**(a) STALE PINS — both scoped rows.**
- ns-01-01/k2 servedAnswer: signed **S319-MID-ns-01-01-k2-label-length** (verified
  S319-V2-ns-01-01) shortened the correct label 67 → 44 chars ("Bigger — a fraction
  under 1 grows the answer") to close a length leak; feedback and wrong paths
  untouched. Pin updated with citation.
- pv-03-03/k1 servedAnswer + wrongPaths[d]: signed **S317-PV-pv-03-03**
  (laneB-pv-implementation.jsonl, contract S316_LANEB_PLACE_VALUE_ASSESSMENT.md)
  rebalanced k1 labels 67/38/47/29 → 50/38/47/37 (correct "…— 5 tens, 13 ones";
  distractor d "It's a mistake — 63 somehow became 53"). Pins updated; feedback
  strings byte-identical.
No content changed.

Remaining 5 reds (de-01-01, de-03-01, de-03-02, dr-01-03, pr-04b-02 rows) are
**(c) PRE-EXISTING** — identical FAIL set at the 06a9bb1 baseline and at clean HEAD,
and correctly absent from the S325 NEW list. Untouched (they pin pre-wave label
rewrites in HS courses owned by other packets).

Final: my 2 scoped rows GREEN; file at 154/159 = exactly the baseline failure set.

---

## src/app/(shell)/onboarding/OnboardingFlow.avatar.test.tsx (3 reds)
## src/app/(shell)/onboarding/OnboardingFlow.name.test.tsx (1 red)

**(a) STALE FIXTURE PINS — all 4.** The authorizing signed change is the opening of the
avatar release allowlist: `ENABLED_AVATAR_IDS` in src/lib/avatars.ts now lists all 60
manifest ids (committed in c5af1f1, the authored-visual wave; per-cohort QA evidence in
reports/avatar-candidates/S244_EARLY/EXPLORER/ADVENTURER/SUMMIT/MATH_SYMBOL_COHORT_QA.md
and S244_AVATAR_CANARY_EVIDENCE.md; asset/manifest parity mechanically enforced by
avatars.test.ts, and all 120 webp files are present in public/avatars).

- OnboardingFlow.avatar.test.tsx was built on the fixture "every entry is enabled:false
  → the avatar stage is dead and must be skipped." That premise is obsolete. Rewrote the
  file to pin the new real-manifest truth at equal strength: exact fixture pin
  (60 entries, all enabled — stronger than the old some()===false), stage renders
  between grade and goal, Continue advances, and passing through without a pick never
  writes an avatarId. The band-mocked behaviors remain covered by
  OnboardingFlow.avatarEnabled.test.tsx (still 5/5 green).
- OnboardingFlow.name.test.tsx "routes Grade 3 through the same 12-item diagnostic":
  flow-path pin only — inserted the now-present avatar-stage Continue click between
  grade and goal; every diagnostic-routing assertion unchanged.

Note: OnboardingFlow.avatarEnabled.test.tsx's docstring still says "today the real
manifest has zero enabled entries" — stale comment only, its mocks make it
state-independent; left untouched (green).

Final: avatar 3/3 GREEN, name 3/3 GREEN.

---

# R1 Summary

Scoped S325 NEW reds: 28 test rows across 18 files — ALL resolved (green) except the 3
session192.addThreeNumbers rows proven pre-existing (red at clean HEAD, at 06a9bb1, at
c977efa; introduced by pre-wave commit c5af1f1) and therefore untouched per packet rules.

Classification counts (per test file):
- (a) stale pins re-pinned: session249 (flash census), S305/S306/S307 hash rows,
  S310 optionsHash, S313/S314 semantic hashes, session194 ×2 (variant-withdrawal
  structural pins), session247.howManyFlash (count 4→6), s237 ×2 rows, onboarding ×2
  files (avatar fixture + flow path).
- (b) real regressions fixed in content/src: kcw-02-04 normalized-prompt collision,
  kcm-02-02 label-length cue, 13 MCQ option-order restorations (kmd/kcm/knb) undoing
  the S320 correct-first regression against the S305/306/307 position contracts,
  g2b-02-06 body/narration desync + length, g2g-03-03 label-parity, g1Independent.cjs
  oracle extension for the signed hexagon/decompose rewrites.
- (c) pre-existing, documented, untouched: session192.addThreeNumbers ×3,
  session247 figure-binding test, session255 remedial-duplication test,
  s237 de-01-01/de-03-01/de-03-02/dr-01-03/pr-04b-02 rows.

Lesson dispositions appended to reports/closure/cowork-staging/laneA-s326-R1.jsonl: 21
records (kcw-02-04, kcm-01-03/-01-04/-02-02/-02-03/-03-02, kmd-01-04/-02-02/-02-03/
-02-04/-03-02/-03-04, knb-01-04/-02-01/-02-03/-03-01/-03-02/-03-03/-03-04, g2b-02-06,
g2g-03-03).

Key systemic finding: the S325 baseline was cut against the stale /tmp/mt-head worktree
pinned at 06a9bb1, five commits behind the repo's actual clean HEAD a78d6a3 — so several
"NEW" reds were caused by committed (not uncommitted) signed work, and a few pre-existing
reds were mislabeled NEW. Also: the S320 dedup/rewrite lanes systematically re-authored
MCQs correct-first, silently regressing every S305-family choice-order repair they
touched — worth a lane-wide checklist item for future waves.
