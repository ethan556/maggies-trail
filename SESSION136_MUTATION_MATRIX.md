# Session 136 adversarial mutation matrix

Every mutation below must be detected by a named test or audit. A green suite that survives one of these changes is insufficient.

| # | Deliberate defect | Required detector |
|---:|---|---|
| 1 | Halve parallelogram area as if it were a triangle | `session136.composite-area.test.ts` derived-piece test + fixed-experience answer audit |
| 2 | Omit one trapezoid triangle | integrity/answer derivation and the long-base-only wrong-path checks |
| 3 | Grade the whole trapezoid when the target is triangle 2 | piece-target helper test and `asv-01-02/i2` expected target audit |
| 4 | Add a cut-away notch instead of subtracting it | signed-total derivation and exact `add-notch` misconception test |
| 5 | Multiply separate piece areas instead of adding them | converted wrong-path reachability test |
| 6 | Duplicate the correct value under a second choice ID | integrity test: unique values + exactly one correct choice |
| 7 | Remove a piece dimension while leaving a visually plausible shape | integrity test: derivable positive area and required dimensions |
| 8 | Point a piece target to a nonexistent ID | integrity target-piece test |
| 9 | Author a parallelogram scene with rectangle pieces | scene-truth integrity test |
| 10 | Author a trapezoid scene without exactly two equal-height triangles | scene-truth integrity test |
| 11 | Convert the grouping-order reasoning MCQ to the new lab | Session-136 content proof and audit experience count |
| 12 | Let a seeded variant fall back to numeric or MCQ | 1,728-draw form/band/seed sweep in the Session-136 unit test |
| 13 | Generate duplicate or ambiguous seeded choices | variant sweep integrity and one-correct-choice assertions |
| 14 | Drop either remedial conversion | composite-area audit expects 13 experiences and two remedials |
| 15 | Replace a wrong claim's authored feedback | Session-136 content proof misconception hashes |
| 16 | Change an authored answer, prompt, hint, explanation, ordering, or concept tag | 1,129-file content proof and per-step frozen-surface hashes |
| 17 | Remove the 44px native claim control | `widgets.compositeArea.s136.test.tsx` class assertion |
| 18 | Communicate add/subtract only by sky/berry color | DOM test requires plus/minus labels, dashed cut-away geometry, text and borders |
| 19 | Replace learner work with the answer on reveal | DOM reveal test requires wrong `aria-pressed` state plus separate ghost chip |
| 20 | Emit no process signal, or label wrong choices as toward | DOM `onEvent` toward/away sequence test |
| 21 | Register the engine but omit its capability record from `types` | generated tier delta + composite audit capability check |
| 22 | Put the capability record at the JSON top level | `gen:reports` must leave lessons D and fail the expected Session-136 movement check |
| 23 | Omit a schema/evaluator/pedagogy/renderer/stage/sample surface | generated 110/110 engine-registration contract |
| 24 | Leave a Session-135 frozen total in a historical audit | generated freshness and non-regression audit policy |
