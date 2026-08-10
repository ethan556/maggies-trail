# Premium Rebuild Baseline — S226

Generated from the current S225 working tree before Wave A product-source edits. The live/current-source lesson player was also inspected at 390×844 and 1440×1000 in the in-app browser.

## Corpus

- Lessons: **1,701**
- Authored and remedial MCQ moments: **3,293**
- MCQs failing the blind-guess heuristic: **697**
- MCQs requiring distractor remediation or human review: **697**
- Authored prediction gates: **1,362** (keep 1162, reframe 0, remove 200)
- Source range inputs: **121**
- Authored figure IDs: **1,819**
- Math-bearing authored strings: **42,813**; ASCII-notation risks: **9,576**
- Registered or authored engine types: **127**

## Current-flow evidence

1. The sticky player header already provides exit, progress, lesson identity, and XP.
2. A second waypoint card repeats stage identity, progress, and lesson title before every step.
3. A third “Trail clearing” label repeats the step kind immediately above the mathematical object.
4. On 390×844, those layers plus resume/prediction receipts push the active model below the initial viewport and leave only a partial object above the fixed action bar.
5. The mathematical engines and curriculum content are not the root cause of this Wave A defect; redundant shell height and repeated labels are.

Evidence: `PREMIUM_REBUILD_SCREENSHOTS_S226/baseline-mobile-prediction.png`, `baseline-mobile-active-math.png`, and `baseline-desktop-active-math.png`.

## Wave A decision

Make the lesson title and progress a compact single header, remove the repeated waypoint/clearing labels from the visual hierarchy, suppress decorative trail atmosphere during active work, and shorten non-mathematical action-dock copy. Preserve navigation, narration, prediction state, grading, adaptive feedback, XP, and all curriculum mathematics.

The audit CSVs are machine-generated triage, not a claim that heuristics replace mathematical review. Rows marked REVIEW or REMEDIATE require human verification before curriculum changes.
