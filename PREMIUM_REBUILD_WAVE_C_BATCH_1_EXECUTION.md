# Premium Experience Rebuild — S228 Wave C Batch 1

## Outcome

S228 begins Wave C with a frequency-weighted MCQ batch and closes two learner-screen defects reported from the exponent lesson. Curriculum answers, grading, sequence, XP, and mathematical conclusions are unchanged.

## MCQ batch

- Baseline: 697 of 3,293 MCQ moments failed the blind-guess length/punctuation heuristic.
- Selected evidence: four repeated Grade 5 decimal misconception patterns occurring across 22 authored/remedial checks in 10 lesson files.
- Change: correct labels were shortened into parallel answer choices; all wrong options and all authored feedback rationales were retained.
- Result: all 22 target rows now pass; regenerated queue is 675 rows.

The four patterns cover trailing-zero padding, locating a decimal product, estimating a misplaced decimal point, and equivalent scaling in decimal division.

## Learner-screen correction

1. Replaced the mismatched same-base product illustration on `ep-01-02` with the existing registered power-of-a-power factor-group visual.
2. Reframed the exponent interaction as “Two repeated groups: 4 + 4,” with “First factor group” and “After group 2” stages.
3. Removed the internal `task: exponentChain` token.
4. Replaced the always-visible mastery metadata/data strip with one optional “Need help connecting the model?” disclosure.
5. Removed lifecycle badges, “Deep dive,” mastery-cycle chips, and the mathematical color-key legend from the learner panel.
6. Made the expanded narration and invariants exponent-specific.
7. Raised representation tabs from 36 px to the 44 px touch minimum.

## Verification

- Typecheck: PASS.
- Focused Vitest: 46/46 PASS.
- CML integration: PASS; 18 pilots, 91 direct-engine profiles, 1,701 lesson files.
- Math-format verifier: PASS.
- Engine registration: PASS, 127/127.
- Visual explanations: PASS, 3,684/3,684 registered concept figures.
- Production build: PASS, 57 routes generated.
- Offline production dependency audit: PASS, 0 vulnerabilities.
- Content schema and pedagogy commands: unavailable on this Windows host because `tsx` fails before project code with `uv_os_get_passwd` ENOMEM.

## Evidence

`PREMIUM_REBUILD_SCREENSHOTS_S228/` contains the two user-supplied before states and three accepted 390 px after states. `MCQ_DISTRACTOR_AUDIT.csv`, `PREMIUM_REBUILD_BASELINE.md`, and `VISUAL_REBUILD_QUEUE.csv` were regenerated from current source.
