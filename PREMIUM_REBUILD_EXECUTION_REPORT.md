# Premium Experience Rebuild — S226 Execution Report

## Scope executed

The pasted rebuild program was reviewed against the current S225 working tree. Its dependency order was preserved: this session completed the forensic baseline and implemented **Wave A only**. Waves B–J were audited and queued; they were not collapsed into an unsafe single rewrite.

## Baseline artifacts

- `PREMIUM_REBUILD_BASELINE.md`
- `MCQ_DISTRACTOR_AUDIT.csv` — 3,293 authored/remedial MCQ moments; 697 blind-guess heuristic failures queued.
- `DIRECT_MANIPULATION_AUDIT.csv` — 121 source range inputs: KEEP-SLIDER 6, DIRECT 68, HYBRID 47.
- `VISUAL_REBUILD_QUEUE.csv` — 1,819 figure IDs: P0 8, P1 5, P2 180, P3 1,626.
- `PREDICTION_GATE_AUDIT.csv` — 1,362 prediction gates: KEEP 1,162, REMOVE 200.
- `MATH_TYPESETTING_AUDIT.csv` — 42,813 math-bearing strings; 9,576 ASCII-notation risks; classifications A 22,279 / B 5,630 / C 14,337 / D 567.
- `PREMIUM_ENGINE_PRIORITY.csv` — 127 registered/authored engine types ranked by learner harm × frequency × visibility × strategic importance.
- `PREMIUM_REBUILD_PLAN.md`

All CSV decisions are deterministic triage. They do not authorize curriculum changes without row-level mathematical review.

## Product-source implementation

1. Consolidated title and progress into the sticky header.
2. Removed the repeated active-step waypoint card.
3. Removed visible “Trail clearing” labels before figures and widgets.
4. Removed active-work terrain atmosphere and contour texture while preserving the summit screen.
5. Compressed the resume notice from a wrapping banner to a single compact row.
6. Removed ornamental action-dock route copy.
7. Added an explicit main/heading relationship and `data-step-kind` for semantics and deterministic QA.
8. Updated presentation contracts to pin the mathematics-first shell.

No Wave A edit changes lesson JSON, mathematical answers, grading logic, explanations, prediction outcomes, XP, or sequencing.

## Current-source gates

| Gate | Result |
|---|---|
| TypeScript typecheck | PASS |
| Wave A focused Vitest | PASS — 17/17 |
| Seven-file LessonPlayer Vitest | 34/53; 19 existing MathProse query failures recorded |
| Full Vitest | INCOMPLETE — 240 s host limit, partial failures recorded |
| Production Next build | PASS — 57 static/dynamic route entries emitted |
| Math-format verifier | PASS — 2 sanctioned KaTeX importers, 0 raw-LaTeX lesson files |
| Engine registration | PASS — 127/127 core-complete; describeState 84/127 |
| Strict CML | KNOWN BASELINE — 2 errors / 340 warnings, CL-P1-044 |
| Content/pedagogy scripts | ENVIRONMENT EXCEPTION — Node `os.userInfo()` ENOMEM after global test run |
| Browser 390/768/1440 × light/dark | PASS — 6/6 Wave A comparison states |
| Horizontal overflow | PASS — 0/6 failures |
| Captured target sizes | PASS — 0 visible controls below 44×44 |
| Production dependency audit | PASS — 0 vulnerabilities |

## Defect priority after Wave A

1. **Wave B / mathematical notation:** 9,576 ASCII-notation risks require row-level conversion, starting with dense C and learner-visible B strings.
2. **Wave C / MCQ leakage:** 697 items fail the deterministic blind-guess heuristic and require misconception-backed remediation.
3. **Wave D / prediction ceremony:** 200 authored gates lack the direct-causal threshold and are queued for removal review.
4. **Wave G / high-use response engines:** `exactNumberLab`, `buildExpression`, `dragBucket`, and `matchPairs` rank highest among redesign candidates; raw usage does not itself authorize conversion.
5. **Retained platform gaps:** CL-P1-035 manual hardware accessibility, CL-P1-044 strict CML baseline, production billing/email/sync/observability/performance/calibration remain outside this shell wave.

## Identity and preservation

- Git base at start: `ed3da510af24becda7589521b2e4f4c02942ccde` on `main`, matching `origin/main` before this uncommitted session.
- Existing S225 Wave 04 batch-2 work was preserved in place.
- No commit or push was performed in this session.
