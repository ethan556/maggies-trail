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

const REASONING_MARK = "\n\nReasoning check:";
const PROMPT_EXTENSIONS: Record<Band, readonly string[]> = {
  support: [
    "Identify the representation and the governing relationship before calculating.",
    "Mark the known quantities, then choose the operation or theorem that connects them.",
    "Use the visible structure one step at a time and check the units.",
    "Name what stays fixed before changing or computing anything.",
    "Translate the graph, table, or expression into one precise relationship first.",
    "Sketch or annotate the situation before entering the result.",
  ],
  core: [
    "Justify the relationship before entering the result.",
    "Connect the visual, numerical, and symbolic representations.",
    "State the invariant or definition that makes the method valid.",
    "Check the result against the domain, sign, orientation, and units.",
    "Use a second representation to verify the conclusion.",
    "Distinguish a pattern you notice from a relationship you can defend.",
  ],
  stretch: [
    "Give a definition-level justification and audit every hidden assumption.",
    "Test the conclusion against a boundary case or counterexample.",
    "Verify the result by an independent representation or reverse operation.",
    "Explain why the method still works after the parameters are changed.",
    "Check both the numerical result and the logical conditions that permit it.",
    "Generalize the relationship before committing to the specific answer.",
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
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function polishText(text: string): string {
  return text
    .replace(/\bundefined\b/gi, "not defined")
    .replace(/\+\s*[−-]\s*(\d)/g, "− $1")
    .replace(/\b1x\b/g, "x")
    .replace(/\b-1x\b/g, "−x")
    .replace(/\s{3,}/g, "  ");
}

function safeFeedback(text: unknown): string {
  let out = typeof text === "string" && text.trim()
    ? polishText(text.trim())
    : "Reconstruct the relationship from the information shown and check each condition.";
  if (/^(no|not|wrong|incorrect|sorry|try again|nope)\b/i.test(out)) {
    out = `Reconsider the governing relationship: ${out.replace(/^(no|not|wrong|incorrect|sorry|try again|nope)\b[\s,:—-]*/i, "")}`;
  }
  if (out.length < 25) out = `${out} Recheck the governing relationship and its conditions.`;
  return out;
}

function normalizeStrings(value: any, key = ""): any {
  if (typeof value === "string") return /feedback/i.test(key) ? safeFeedback(value) : polishText(value);
  if (Array.isArray(value)) return value.map((item) => normalizeStrings(item, key));
  if (value && typeof value === "object") {
    for (const [childKey, child] of Object.entries(value)) value[childKey] = normalizeStrings(child, childKey);
  }
  return value;
}

function freshPrompt(base: string, rand: Rand, band: Band): string {
  return `${polishText(base.trim())}${REASONING_MARK} ${pick(rand, PROMPT_EXTENSIONS[band])}`;
}

function normalizeNumeric(widget: any): void {
  widget.tolerance = Number.isFinite(Number(widget.tolerance)) ? Number(widget.tolerance) : 0;
  widget.unit = typeof widget.unit === "string" ? widget.unit : "";
  widget.commonErrors = Array.isArray(widget.commonErrors) ? widget.commonErrors : [];
  const answer = Number(widget.answer);
  const seen = new Set<string>([answer.toPrecision(14)]);
  widget.commonErrors = widget.commonErrors
    .filter((error: any) => Number.isFinite(Number(error?.value)))
    .map((error: any) => ({ ...error, value: Number(error.value), feedback: safeFeedback(error.feedback) }))
    .filter((error: any) => {
      const key = Number(error.value).toPrecision(14);
      if (Math.abs(Number(error.value) - answer) <= widget.tolerance || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  for (let delta = 1; widget.commonErrors.length < 2; delta += 1) {
    for (const candidate of [answer + delta, answer - delta]) {
      const key = candidate.toPrecision(14);
      if (Math.abs(candidate - answer) <= widget.tolerance || seen.has(key)) continue;
      seen.add(key);
      widget.commonErrors.push({
        value: candidate,
        feedback: safeFeedback("This result changes one operation without preserving the stated relationship."),
      });
      if (widget.commonErrors.length >= 2) break;
    }
  }
  widget.fallbackFeedback = safeFeedback(widget.fallbackFeedback);
  if ("successFeedback" in widget) widget.successFeedback = safeFeedback(widget.successFeedback);
}

function signChartAnswer(widget: any): Array<"+" | "-"> {
  const roots = [...widget.roots].sort((a: any, b: any) => a.x - b.x);
  let sign = widget.leadingPositive === false ? -1 : 1;
  const result: Array<"+" | "-"> = Array(roots.length + 1).fill("+");
  result[result.length - 1] = sign > 0 ? "+" : "-";
  for (let index = roots.length - 1; index >= 0; index -= 1) {
    if (roots[index]!.mult % 2 === 1) sign *= -1;
    result[index] = sign > 0 ? "+" : "-";
  }
  return result;
}

function answerFor(widget: any): any {
  switch (widget.type) {
    case "numeric": return widget.answer;
    case "exactNumberLab": {
      const truth = exactNumberTruth(widget);
      if (widget.answerMode === "numeric") return truth.answerNumber;
      throw new Error(`Authored-template exactNumberLab only supports answerMode "numeric" (form uses ${widget.answerMode})`);
    }
    case "mcq": return widget.options.find((option: any) => option.correct === true)?.id;
    case "pointEntry": return widget.answer;
    case "buildExpression": return widget.correct;
    case "dragOrder": return widget.correctOrder;
    case "dragBucket": return Object.fromEntries(widget.items.map((item: any) => [item.id, item.bucketId]));
    case "matchPairs": return widget.pairs;
    case "signChart": return signChartAnswer(widget);
    default: throw new Error(`Unsupported authored-template surface ${widget.type}`);
  }
}

function diversify(widget: any, rand: Rand): void {
  if (widget.type === "mcq") {
    widget.options = shuffle(rand, widget.options).map((option: any, index: number) => ({ ...option, id: `o${index}`, correct: option.correct === true }));
  } else if (widget.type === "dragBucket") {
    widget.items = shuffle(rand, widget.items);
  } else if (widget.type === "matchPairs") {
    widget.left = shuffle(rand, widget.left);
    widget.right = shuffle(rand, widget.right);
    // A blind double-shuffle lands fully ALIGNED (pairs[left[i]] === right[i]) with probability
    // ~1/n! per draw — a certainty across a 150-seed sweep at n=3. Aligned columns let a learner
    // score by matching row i to row i without reading, so rotate the right column until the
    // presentation is misaligned. Deterministic: same seed, same rotation.
    const alignedAt = (rightItems: any[]) => widget.left.every((l: any, i: number) => widget.pairs[l.id] === rightItems[i]?.id);
    for (let turns = 0; turns < widget.right.length && alignedAt(widget.right); turns += 1) {
      widget.right = [...widget.right.slice(1), widget.right[0]];
    }
  } else if (widget.type === "buildExpression") {
    widget.tokens = shuffle(rand, widget.tokens);
    // A build that repeats a token id (x < −1 or x > 2 needs x twice) is only playable when the
    // bank is reusable — a single-use tile disables after its first tap and the correct answer
    // becomes unbuildable. The authored banks omit the flag; derive it from the builds.
    const builds: string[][] = [widget.correct, ...(widget.acceptAlso ?? [])];
    if (builds.some((seq) => new Set(seq).size !== seq.length)) widget.reusable = true;
  } else if (widget.type === "dragOrder") {
    let items = shuffle(rand, widget.items);
    if (items.map((item: any) => item.id).join("|") === widget.correctOrder.join("|")) items = [...items].reverse();
    widget.items = items;
  }
}

export function generatorsFromAuthoredBank(bank: TemplateBank, labelPrefix: string): VariantGen[] {
  return Object.entries(bank).map(([tag, forms]) => ({
    tag,
    label: `${labelPrefix}: ${tag}`,
    forms: Object.keys(forms) as never[],
    gen: (rand, band = "core", requestedForm = "default") => {
      const form = requestedForm === "default" ? Object.keys(forms)[0]! : requestedForm;
      const pool = forms[form];
      if (!pool?.length) throw new Error(`Unsupported authored-template form ${tag}@${requestedForm}`);
      const widget = normalizeStrings(clone(pick(rand, pool)));
      widget.prompt = freshPrompt(String(widget.prompt), rand, band);
      if (widget.type === "numeric") normalizeNumeric(widget);
      diversify(widget, rand);
      const answer = answerFor(widget);
      if (answer === undefined) throw new Error(`Authored-template item has no answer: ${tag}@${form}`);
      return { tag, widget, answer };
    },
  }));
}
