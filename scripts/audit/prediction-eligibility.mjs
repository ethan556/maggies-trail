/**
 * Determine whether adding a prediction cycle would create real mathematical
 * work rather than merely duplicating an observation/classification task.
 *
 * This is deliberately rule-based and lesson-content-driven. It does not name
 * lesson IDs. The report can therefore explain why a lesson is an honest Tier-B
 * ceiling without creating a growing exception list.
 */

const OBSERVATION_TYPES = new Set([
  "graphRead",
  "unitRuler",
  "clockRead",
  "dotPlot",
  "boxPlot",
  "placeCompare",
  "rationalCompare",
  "fractionCompare",
  "lengthCompare",
  "subitizeFlash"
]);

const CLASSIFICATION_TYPES = new Set(["mcq", "dragBucket", "dragOrder", "matchPairs"]);
const READ_WORDS = /\b(read|count|identify|name|which|what value|how many|how long|select|choose)\b/i;
const EXPERIMENT_WORDS = /\b(predict|before|will|change|move|drag|build|construct|test|compare what happens|vary|adjust|simulate|try)\b/i;

function stepText(step) {
  return `${step?.body ?? ""} ${step?.widget?.prompt ?? ""}`.trim();
}

function isObservationStep(step) {
  const type = step?.widget?.type;
  if (!type) return false;
  if (type === "dotPlot" && !Array.isArray(step.widget.given)) return false;
  if (OBSERVATION_TYPES.has(type)) return true;
  return READ_WORDS.test(stepText(step)) && !EXPERIMENT_WORDS.test(stepText(step));
}

function isClassificationStep(step) {
  const type = step?.widget?.type;
  return CLASSIFICATION_TYPES.has(type) && !EXPERIMENT_WORDS.test(stepText(step));
}

/**
 * @param {object} lesson parsed lesson JSON
 * @param {Record<string, {manip:number,conseq:number}>} caps capability table
 * @returns {{status:"eligible"|"redundant"|"unsafe", reason:string}}
 */
export function predictionEligibility(lesson, caps) {
  const steps = lesson?.steps ?? [];
  if (steps.some((step) => step.predict)) {
    return { status: "eligible", reason: "An authored prediction cycle already exists." };
  }

  const interactive = steps.filter((step) => step.kind === "interactive" && step.widget);
  if (!interactive.length) {
    return {
      status: "unsafe",
      reason: "There is no exploratory interactive state to predict before; adding a prediction would change the task structure."
    };
  }

  if (interactive.every(isObservationStep)) {
    return {
      status: "redundant",
      reason: "Every exploratory step is a read/count/identify observation; predicting would duplicate or precede the object-reading task rather than test a causal relationship."
    };
  }

  if (interactive.every(isClassificationStep)) {
    return {
      status: "unsafe",
      reason: "Every exploratory step is itself a classification/selection judgment; a preceding prediction would duplicate the assessed judgment."
    };
  }

  const causal = interactive.filter((step) => {
    const c = caps[step.widget.type] ?? { manip: 0, conseq: 0 };
    return c.manip >= 2 && c.conseq >= 2;
  });
  if (causal.length) {
    return {
      status: "eligible",
      reason: `${causal.length} exploratory step${causal.length === 1 ? "" : "s"} expose a manipulable cause-and-effect state that can support prediction before action.`
    };
  }

  return {
    status: "unsafe",
    reason: "The current exploratory steps do not expose a causal state; prediction should wait for an exact-fit engine rather than be stapled to an answer surface."
  };
}

export const predictionEligibilityInternals = {
  OBSERVATION_TYPES,
  CLASSIFICATION_TYPES,
  isObservationStep,
  isClassificationStep
};
