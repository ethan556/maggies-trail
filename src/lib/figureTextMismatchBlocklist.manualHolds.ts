/**
 * Current exceptions to the adversarial figure/text candidate scan.
 *
 * These bindings remain withheld even though the conservative scan cannot
 * currently prove their conflict.  They are deliberately source-controlled:
 * remove a record only after a reviewed replacement or an independently
 * sufficient runtime guard exists.
 */
export type FigureTextMismatchManualHold = Readonly<{
  status: "CURRENT_MANUAL_HOLD";
  bindingKey: string;
  source: string;
  lessonId: string;
  stepPath: string;
  figureId: string;
  reason: string;
}>;

export const CURRENT_FIGURE_TEXT_MISMATCH_MANUAL_HOLDS = [
  {
    status: "CURRENT_MANUAL_HOLD",
    bindingKey: "0dc18745",
    source: "content/courses/conditional-probability/lessons/cpr-03-03.json",
    lessonId: "cpr-03-03",
    stepPath: "steps.0",
    figureId: "cpr-multiplication-area",
    reason:
      "The candidate scan no longer emits a high-confidence token conflict, but no independent fixed-number, numeric-parity, or legacy runtime guard withholds this currently bound multiplication-area figure.",
  },
  {
    status: "CURRENT_MANUAL_HOLD",
    bindingKey: "67c19c25",
    source: "content/courses/exponential-functions/lessons/exp-02-03.json",
    lessonId: "exp-02-03",
    stepPath: "steps.5",
    figureId: "exp-decay-50",
    reason:
      "The candidate scan no longer emits a high-confidence token conflict, but no independent fixed-number, numeric-parity, or legacy runtime guard withholds this currently bound exponential-decay figure.",
  },
] as const satisfies readonly FigureTextMismatchManualHold[];
