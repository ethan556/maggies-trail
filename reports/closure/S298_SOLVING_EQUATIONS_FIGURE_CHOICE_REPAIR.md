# S298 Solving Equations figure and choice repair

## Scope and closures

- Course: `solving-equations` (12 lessons), collision-cleared before this bounded G6–HS packet.
- Closed P0 `VIS-alg1-04-02-c1-flip-arrow` by withholding its source-controlled blocked figure binding. The exact lesson body, narration, stable IDs, and all evaluator surfaces remain intact.
- Closed P1 `CHOICE-0001` (`alg1-01-02/k3`) by replacing only the three labels with concise, parallel misconception-based alternatives. Correct ID `a`, evaluator, feedback, and scoring remain unchanged.

## Evidence and guard

- `scripts/session/s298-solving-equations-figure-choice-repair.mjs` validates the exact c1 text/narration and the MCQ evaluator/feedback/correctness hashes before editing. It changes only the one `figure` property and three option labels; `--check` fails on any pending repair.
- `src/lib/session298.solvingEquationsFigureChoice.test.ts` seals the safe visual withhold, retained accessible instruction, MCQ parity and evaluator correctness, and all 12 lesson schemas.
- Source seal (all 12 sorted lesson files): $seal.

## Audited residuals

- The six P1 progression rows are deliberate out-of-scope authority: they require progression review rather than a source-verifiable figure or choice correction.
- Queue, cards, cache, figure registry/runtime, and all derived artifacts are untouched.
