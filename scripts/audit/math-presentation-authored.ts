export type AuthoredMathString = {
  unit: string;
  field: string;
  text: string;
  arithmetic: boolean;
};

export type AuthoredMathCoverage = {
  mainSteps: number;
  remedialSteps: number;
  explanationVariants: number;
  mainExplanationVariants: number;
  remedialExplanationVariants: number;
  takeaways: number;
  teasers: number;
  narrations: number;
  mainNarrations: number;
  remedialNarrations: number;
  strings: number;
};

type UnknownRecord = Record<string, unknown>;
const asRecord = (value: unknown): UnknownRecord | null =>
  value && typeof value === "object" ? (value as UnknownRecord) : null;

const ID_KEYS = new Set([
  "id",
  "type",
  "form",
  "kind",
  "gen",
  "tag",
  "variant",
  "delimiter",
  "mode",
  "shape",
  "orientation",
]);

/** Widget spec strings render through widgets.tsx with arithmetic tokenization off. */
export function widgetStrings(
  node: unknown,
  path: string,
  out: Array<{ path: string; text: string }> = [],
): Array<{ path: string; text: string }> {
  if (typeof node === "string") {
    const leaf = path.split(".").pop() ?? "";
    if (!ID_KEYS.has(leaf) && !/(^|[a-z])Id$|Ids$/.test(leaf))
      out.push({ path, text: node });
    return out;
  }
  if (Array.isArray(node)) {
    node.forEach((value, index) =>
      widgetStrings(value, `${path}[${index}]`, out),
    );
    return out;
  }
  if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      widgetStrings(value, path ? `${path}.${key}` : key, out);
    }
  }
  return out;
}

function collectStep(
  step: UnknownRecord,
  fallbackUnit: string,
  coverage: AuthoredMathCoverage,
  location: "main" | "remedial",
): AuthoredMathString[] {
  const unit = String(step.id ?? fallbackUnit);
  const strings: AuthoredMathString[] = [];
  const add = (value: unknown, field: string, arithmetic = true) => {
    if (typeof value !== "string") return;
    strings.push({ unit, field, text: value, arithmetic });
  };

  for (const field of [
    "body",
    "feedback",
    "successFeedback",
    "explanation",
    "narration",
    "teaser",
  ]) {
    add(step[field], field);
  }
  if (typeof step.narration === "string") {
    coverage.narrations += 1;
    coverage[location === "main" ? "mainNarrations" : "remedialNarrations"] +=
      1;
  }
  if (typeof step.teaser === "string") coverage.teasers += 1;

  for (const field of ["hints", "explanationVariants", "takeaways"] as const) {
    const values = Array.isArray(step[field]) ? step[field] : [];
    for (const [index, value] of values.entries())
      add(value, `${field}[${index}]`);
    if (field === "explanationVariants") {
      coverage.explanationVariants += values.length;
      coverage[
        location === "main"
          ? "mainExplanationVariants"
          : "remedialExplanationVariants"
      ] += values.length;
    }
    if (field === "takeaways") coverage.takeaways += values.length;
  }

  const predict = asRecord(step.predict);
  if (predict) {
    add(predict.prompt, "predict.prompt");
    add(predict.reveal, "predict.reveal");
    const options = Array.isArray(predict.options) ? predict.options : [];
    for (const [index, option] of options.entries()) {
      const record = asRecord(option);
      add(record?.label, `predict.options[${index}].label`);
      add(record?.feedback, `predict.options[${index}].feedback`);
    }
  }

  for (const { path, text } of widgetStrings(step.widget, "widget")) {
    strings.push({ unit, field: path, text, arithmetic: false });
  }
  coverage.strings += strings.length;
  return strings;
}

/** Enumerate every learner-visible authored string on main and remedial concept/check paths. */
export function lessonAuthoredMathStrings(lesson: UnknownRecord): {
  strings: AuthoredMathString[];
  coverage: AuthoredMathCoverage;
} {
  const coverage: AuthoredMathCoverage = {
    mainSteps: 0,
    remedialSteps: 0,
    explanationVariants: 0,
    mainExplanationVariants: 0,
    remedialExplanationVariants: 0,
    takeaways: 0,
    teasers: 0,
    narrations: 0,
    mainNarrations: 0,
    remedialNarrations: 0,
    strings: 0,
  };
  const strings: AuthoredMathString[] = [];
  const steps = Array.isArray(lesson.steps) ? lesson.steps : [];
  coverage.mainSteps = steps.length;
  for (const [index, step] of steps.entries()) {
    const record = asRecord(step);
    if (record) {
      strings.push(...collectStep(record, `step-${index}`, coverage, "main"));
    }
  }

  const remedials = Array.isArray(lesson.remedials) ? lesson.remedials : [];
  for (const [index, remedial] of remedials.entries()) {
    const remedialRecord = asRecord(remedial);
    for (const branch of ["concept", "check"] as const) {
      const step = asRecord(remedialRecord?.[branch]);
      if (!step) continue;
      coverage.remedialSteps += 1;
      strings.push(
        ...collectStep(
          step,
          `remedial-${index}-${branch}`,
          coverage,
          "remedial",
        ),
      );
    }
  }
  return { strings, coverage };
}
