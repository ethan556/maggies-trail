import templates from "./geometryVariantTemplates.json";
import { exactNumberTruth } from "./schema";

type Band = "support" | "core" | "stretch";
type Variant = { tag: string; widget: any; answer: any };
type VariantGen = {
  tag: string;
  label: string;
  forms?: readonly never[];
  gen: (rand: () => number, band?: Band, form?: string) => Variant;
};
type Rand = () => number;

type TemplateBank = Record<string, Record<string, any[]>>;
const BANK = templates as TemplateBank;

const REASONING_MARK = "\n\nReasoning check:";
const PROMPT_EXTENSIONS: Record<Band, readonly string[]> = {
  support: [
    "Use the labeled relationship before calculating.",
    "Mark the given quantities, then choose the governing theorem.",
    "Name the invariant first; then compute.",
    "Sketch the relationship and track the units.",
    "Identify what is fixed before using the numbers.",
    "Write the relevant equality before entering the result.",
    "Trace the diagram information one fact at a time.",
    "Check whether the relationship is equal, proportional, or supplementary.",
  ],
  core: [
    "Justify the relationship before entering the result.",
    "Connect the diagram, theorem, and calculation.",
    "State the invariant that makes the calculation valid.",
    "Use only the information guaranteed by the geometry.",
    "Check the result against the figure's constraints.",
    "Translate the labeled structure into an equation first.",
    "Verify the answer with a second geometric relationship.",
    "Distinguish a measured appearance from a proven fact.",
  ],
  stretch: [
    "Give a theorem-level justification, not an appearance-based guess.",
    "Audit every assumption before committing to the result.",
    "Use the most general invariant that proves the relationship.",
    "Check whether a converse is actually available before using it.",
    "Confirm that the result survives a deformation of the figure.",
    "Reconstruct the result from definitions rather than pattern matching.",
    "Verify both the numerical result and the logical dependency.",
    "Test the conclusion against a possible counterexample.",
  ],
};

const pick = <T>(rand: Rand, xs: readonly T[]): T => xs[Math.floor(rand() * xs.length)]!;
const shuffle = <T>(rand: Rand, xs: readonly T[]): T[] => {
  const out = [...xs];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
};
const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function cleanTypography(text: string): string {
  return text
    .replace(/\bUNDEFINED TERMS?\b/g, (value) => value.endsWith("S") ? "PRIMITIVE TERMS" : "PRIMITIVE TERM")
    .replace(/\bundefined terms?\b/gi, (value) => /s$/i.test(value) ? "primitive terms" : "primitive term")
    .replace(/\bundefined\b/gi, "not formally defined")
    .replace(/\+\s*[−-]\s*(\d)/g, "− $1")
    .replace(/\b1x\b/g, "x")
    .replace(/\b-1x\b/g, "−x")
    .replace(/\s{3,}/g, "  ");
}

function feedback(text: unknown, fallback: string): string {
  let out = typeof text === "string" && text.trim() ? text.trim() : fallback;
  out = cleanTypography(out);
  if (/^(no|not|wrong|incorrect|sorry|try again|nope)\b/i.test(out)) {
    out = `Review the geometric relationship: ${out.replace(/^(no|not|wrong|incorrect|sorry|try again|nope)\b[\s,:—-]*/i, "")}`;
  }
  if (out.length < 25) out = `${out} Recheck the labeled geometric relationship.`;
  return out;
}

function freshPrompt(base: string, rand: Rand, band: Band): string {
  return `${cleanTypography(base.trim())}${REASONING_MARK} ${pick(rand, PROMPT_EXTENSIONS[band])}`;
}

function normalizeNumeric(widget: any): any {
  const w = widget;
  w.tolerance = Number.isFinite(w.tolerance) ? w.tolerance : 0;
  w.unit = typeof w.unit === "string" ? w.unit : "";
  w.commonErrors = Array.isArray(w.commonErrors) ? w.commonErrors : [];
  const seen = new Set<number>([Number(w.answer)]);
  w.commonErrors = w.commonErrors
    .filter((e: any) => Number.isFinite(Number(e?.value)))
    .map((e: any) => ({
      ...e,
      value: Number(e.value),
      feedback: feedback(e.feedback, "This result uses a different geometric relationship from the one shown."),
    }))
    .filter((e: any) => {
      if (Math.abs(e.value - Number(w.answer)) <= w.tolerance || seen.has(e.value)) return false;
      seen.add(e.value);
      return true;
    });
  for (let delta = 1; w.commonErrors.length < 2; delta += 1) {
    for (const candidate of [Number(w.answer) + delta, Number(w.answer) - delta]) {
      if (Math.abs(candidate - Number(w.answer)) <= w.tolerance || seen.has(candidate)) continue;
      seen.add(candidate);
      w.commonErrors.push({
        value: candidate,
        feedback: feedback("This value changes one operation without preserving the diagram's stated relationship.", "Reconstruct the relationship."),
      });
      if (w.commonErrors.length >= 2) break;
    }
  }
  w.fallbackFeedback = feedback(
    w.fallbackFeedback,
    "Reconstruct the equation from the visible geometry, then verify each operation and unit."
  );
  w.successFeedback = feedback(
    w.successFeedback,
    "The result is consistent with the labeled geometry and its governing invariant."
  );
  return w;
}

function normalizeMcq(widget: any, rand: Rand): any {
  const w = widget;
  const options = Array.isArray(w.options) ? w.options : [];
  const polished = options.map((option: any) => ({
    ...option,
    label: cleanTypography(String(option.label)),
    feedback: feedback(option.feedback, "This choice does not follow from the geometric conditions shown."),
  }));
  w.options = shuffle(rand, polished).map((option: any, index: number) => ({ ...option, id: `o${index}` }));
  return w;
}

function buildVariant(tag: string, rand: Rand, band: Band, requestedForm: string): Variant {
  const forms = BANK[tag];
  if (!forms) throw new Error(`Unknown Geometry generator ${tag}`);
  const form = requestedForm === "default" ? Object.keys(forms)[0]! : requestedForm;
  const pool = forms[form];
  if (!pool?.length) throw new Error(`Unsupported Geometry form ${tag}@${requestedForm}`);
  const widget = deepClone(pick(rand, pool));
  widget.prompt = freshPrompt(String(widget.prompt), rand, band);
  if (widget.type === "numeric") {
    normalizeNumeric(widget);
    return { tag, widget, answer: widget.answer };
  }
  if (widget.type === "mcq") {
    normalizeMcq(widget, rand);
    const correct = widget.options.find((option: any) => option.correct === true);
    if (!correct) throw new Error(`Geometry MCQ has no correct option: ${tag}@${form}`);
    return { tag, widget, answer: correct.id };
  }
  /* S168: exactNumberLab pool entries carry their quantities as spec data, so the answer is
   * re-derived from the truth function rather than read off a stored `answer` field. */
  if (widget.type === "exactNumberLab") {
    if (widget.answerMode !== "numeric") throw new Error(`Geometry exactNumberLab only supports answerMode "numeric": ${tag}@${form}`);
    const truth = exactNumberTruth(widget);
    if (truth.answerNumber === undefined) throw new Error(`Geometry exactNumberLab produced no numeric answer: ${tag}@${form}`);
    return { tag, widget, answer: truth.answerNumber };
  }
  throw new Error(`Geometry template surface is not supported: ${widget.type}`);
}

export const GEOMETRY_GENERATORS: VariantGen[] = Object.entries(BANK).map(([tag, forms]) => ({
  tag,
  label: `Grade 10 Geometry isomorphic authored variants: ${tag}`,
  forms: Object.keys(forms) as never[],
  gen: (rand, band = "core", form = "default") => buildVariant(tag, rand, band, form),
}));
