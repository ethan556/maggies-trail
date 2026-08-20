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
  /* S317 (2026-08-20): the 0dc18745 hold for cpr-03-03/cpr-multiplication-area was retired.
   * The S317 figure-truth packet reworded c1's prose (signed disposition S317-V2-cpr-03-03);
   * the placement now binds under key 5d9a9fce, verified aligned by isFigureTextAligned and
   * absent from the generated blocklist. The legacy 0dc18745 key remains in the generated
   * blocklist per its monotonic policy; the CURRENT hold row is removed because it binds to
   * no live placement, which the adversarial audit's exactly-once invariant requires. */
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
