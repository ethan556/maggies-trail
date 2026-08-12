# Premium Experience Contract

**Source of authority:** `OPTIMIZATION_PLAN_V3.md` (canonical, adopted 2026-08-12). This file is
the machine- and reviewer-checkable restatement of WS-G §1. Every shipped learner-facing surface
is measured against these rows. A row marked *(machine)* is or must become a CI gate; a row
marked *(pixels)* is certified from screenshots by an adversarial reviewer, never from JSX.

| # | Rule | Check |
|---|---|---|
| 1 | **MVA ≥ 60%** — on visual concept steps the mathematical object owns at least 60% of the primary content area | pixels |
| 2 | **Direct manipulation where meaningful** — the learner moves the object itself; sliders/steppers/numeric survive only as the precision fallback or where the quantity is genuinely scalar | pixels + `DIRECT_MANIPULATION_AUDIT.csv` |
| 3 | **Continuous transitions where state changes** — state morphs, never teleports, wherever motion communicates mathematics (CMR ≥ 90%) | pixels |
| 4 | **0 unnecessary persistent controls or pedagogical labels** during active reasoning — screen contract: prompt + mathematical object + one contextual action | machine (chrome census) + pixels |
| 5 | **0 purpose-free predictions** — every surviving gate independently judged necessary (PGR = 100%) | machine (`PREDICTION_GATE_AUDIT.csv` verdicts) |
| 6 | **Immediate response** — no Apply button where avoidable; consequence appears where the action occurred | pixels |
| 7 | **Excellent at 390px** — no overflow, no sub-44px targets, no wrapped one-row structures | machine (e2e) + pixels |
| 8 | **Complete keyboard + reduced-motion paths** — any lesson completable keyboard-only; `prefers-reduced-motion` end-to-end | machine (e2e + axe) |
| 9 | **Professional math typography** — no raw caret/ASCII math on learner surfaces; KaTeX + MathML + a11y string | machine (typesetting gates) |
| 10 | **0 label collisions** — no legible text drawn over other text at any authored spec × tone | machine (`widgets.labelCollision.s237` + e2e) |
| 11 | **No feedback-only state change where the model can show it** — the object demonstrates the consequence, the banner narrates it | pixels |
| 12 | **No control-panel syndrome** — controls revealed contextually; the object is not surrounded by a dashboard | pixels |
| 13 | **No MCQ answer-shape leakage** — ACQ < 1% (length, punctuation, notation, grammatical cues) | machine (`MCQ_DISTRACTOR_AUDIT.csv` detectors) |

## Standing stop rules (Plan v3 §4.5 — gate every change)

Don't optimize a lesson because its count is low · don't add a prediction because one is missing ·
don't animate because a screen is static · don't redraw a clear figure · don't replace retrieval
with manipulation · no decorative world-building inside active reasoning · don't sterilize K–2 for
consistency · don't infantilize calculus for brand · don't accept a slider because it works ·
don't accept a gesture that breaks keyboard access · don't ship without pixel-level QA.

## Protected strengths (regression here fails QA)

Misconception-naming diagnosis · spaced review (1/3/7/21) · K–Calculus continuity · exact
mathematical state engines · TTS on every step · dark mode · test-out · explanation variants ·
fast TTFB. Guarded by the existing gate suite; never trade one of these for a contract row.

## Relationship to prior program documents

`PREMIUM_REBUILD_PLAN.md` (Waves A–F) remains the historical record of what landed S226–S237 and
maps into Plan v3 as follows: Wave A → WS-D (chrome purge, partially done; stage sizing still
open) · Wave B → WS-C typesetting (largely done) · Wave C → WS-G MCQ factory (in progress,
572-row queue) · Wave D → WS-E prediction reform (open) · Wave E → WS-G/Wave 7 visual maturity
(open) · Wave F → WS-C direct manipulation (open, the largest single win). Where the two
documents disagree, **Plan v3 wins.**
