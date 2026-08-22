import templates from "./precalculusVariantTemplates.json";
import { generatorsFromAuthoredBank } from "./authoredTemplateVariants";
import { exactNumberTruth } from "./schema";
import type { Variant } from "./variants";

const AUTHORED_PRECALCULUS_GENERATORS = generatorsFromAuthoredBank(
  templates as Record<string, Record<string, any[]>>,
  "Grade 12 Precalculus isomorphic authored variants"
);

type ApproxNode =
  | { op: "lit"; value: number }
  | { op: "const"; id: string }
  | { op: "add"; left: ApproxNode; right: ApproxNode }
  | { op: "multiply"; left: ApproxNode; right: ApproxNode };

const PARABOLA_DEFINITION_FORM = "conic-sections__co-parabola-def__numeric";
const HYPERBOLA_ECCENTRICITY_FORM = "conic-sections__co-hyp-ecc__numeric";
const PARABOLA_DEFINITION_CASES = [
  { axis: "y", focus: [0, 1], directrix: -1, point: [2, 1] },
  { axis: "y", focus: [1, 2], directrix: -2, point: [9, 8] },
  { axis: "y", focus: [-2, 0], directrix: -2, point: [2, 3] },
  { axis: "y", focus: [0, -2], directrix: 2, point: [4, -2] },
  { axis: "y", focus: [-1, 1], directrix: 3, point: [5, -7] },
  { axis: "x", focus: [1, 1], directrix: -5, point: [1, 7] },
  { axis: "x", focus: [-1, 2], directrix: -3, point: [2, 6] },
  { axis: "x", focus: [1, -1], directrix: 3, point: [-2, 3] },
] as const;
const HYPERBOLA_ECCENTRICITY_CASES = [
  { a: 3, b: 4, c: 5, orientation: "horizontal" },
  { a: 5, b: 12, c: 13, orientation: "vertical" },
  { a: 8, b: 15, c: 17, orientation: "horizontal" },
  { a: 7, b: 24, c: 25, orientation: "vertical" },
  { a: 20, b: 21, c: 29, orientation: "horizontal" },
  { a: 12, b: 35, c: 37, orientation: "vertical" },
  { a: 28, b: 45, c: 53, orientation: "horizontal" },
  { a: 33, b: 56, c: 65, orientation: "vertical" },
] as const;

const coordinate = (value: number): string => value < 0 ? `−${Math.abs(value)}` : String(value);

function parabolaDefinitionVariant(rand: () => number) {
  const item = PARABOLA_DEFINITION_CASES[Math.floor(rand() * PARABOLA_DEFINITION_CASES.length)]!;
  const pointCoordinate = item.axis === "y" ? item.point[1] : item.point[0];
  const answer = Math.abs(pointCoordinate - item.directrix);
  const candidates = [
    {
      value: Math.abs(pointCoordinate),
      feedback: `That measures from the coordinate axis, not from the directrix ${item.axis} = ${coordinate(item.directrix)}.`,
    },
    {
      value: Math.abs(item.directrix),
      feedback: "That is the directrix’s distance from the coordinate axis. The question asks for the gap from the point to the directrix.",
    },
    {
      value: Math.abs(pointCoordinate + item.directrix),
      feedback: `That combines signed coordinates without measuring their separation. Use |${coordinate(pointCoordinate)} − (${coordinate(item.directrix)})|.`,
    },
  ];
  const seen = new Set([answer]);
  const commonErrors = candidates.filter((candidate) => {
    if (seen.has(candidate.value)) return false;
    seen.add(candidate.value);
    return true;
  });
  for (let offset = 1; commonErrors.length < 2; offset += 1) {
    const value = answer + offset;
    if (seen.has(value)) continue;
    seen.add(value);
    commonErrors.push({
      value,
      feedback: "That distance is one interval too large. Count the perpendicular coordinate gap between the point and the directrix.",
    });
  }
  const [focusX, focusY] = item.focus;
  const [pointX, pointY] = item.point;
  return {
    tag: "g12-conic-sections",
    widget: {
      type: "numeric" as const,
      prompt: `A parabola has focus (${coordinate(focusX)}, ${coordinate(focusY)}) and directrix ${item.axis} = ${coordinate(item.directrix)}. The point (${coordinate(pointX)}, ${coordinate(pointY)}) lies on the parabola. What is its perpendicular distance to the directrix?`,
      answer,
      tolerance: 0,
      commonErrors,
      fallbackFeedback: `Use the ${item.axis}-coordinates because the directrix is ${item.axis} = ${coordinate(item.directrix)}: |${coordinate(pointCoordinate)} − (${coordinate(item.directrix)})| = ${answer}.`,
    },
    answer,
  };
}

function hyperbolaEccentricityVariant(rand: () => number) {
  const item = HYPERBOLA_ECCENTRICITY_CASES[Math.floor(rand() * HYPERBOLA_ECCENTRICITY_CASES.length)]!;
  const answer = Math.round((item.c / item.a) * 100) / 100;
  const reciprocal = Math.round((item.a / item.c) * 100) / 100;
  const otherRatio = Math.round((item.b / item.a) * 100) / 100;
  const equation = item.orientation === "horizontal"
    ? `x²/${item.a ** 2} − y²/${item.b ** 2} = 1`
    : `y²/${item.a ** 2} − x²/${item.b ** 2} = 1`;
  return {
    tag: "g12-conic-sections",
    widget: {
      type: "numeric" as const,
      prompt: `For ${equation} (a = ${item.a}, c = ${item.c}), find the eccentricity e = c/a, rounded to two decimal places.`,
      answer,
      tolerance: 0.005,
      commonErrors: [
        {
          value: reciprocal,
          feedback: `That computes a/c. Hyperbola eccentricity is c/a, so divide ${item.c} by ${item.a}.`,
        },
        {
          value: item.c,
          feedback: `That reports c itself. Eccentricity is the ratio c/a = ${item.c}/${item.a}.`,
        },
        {
          value: otherRatio,
          feedback: `That uses b/a. Eccentricity uses the focus distance parameter c, not the conjugate-axis parameter b.`,
        },
      ],
      fallbackFeedback: `Use e = c/a: ${item.c}/${item.a} = ${answer.toFixed(2)}, which is greater than 1 as required for a hyperbola.`,
    },
    answer,
  };
}

const FUNCTION_GRAPH_READ_FORM = "function-analysis__fna-graph-read__numeric";
const FUNCTION_GRAPH_READ_CASES = [
  { h: -4, k: 9, x: -1 }, { h: -3, k: 18, x: 1 },
  { h: -2, k: 12, x: 2 }, { h: -1, k: 10, x: 3 },
  { h: 0, k: 9, x: 4 }, { h: 1, k: 16, x: 5 },
  { h: 2, k: 9, x: 5 }, { h: 3, k: 20, x: 7 },
  { h: 4, k: 25, x: 9 }, { h: 5, k: 18, x: 2 },
  { h: 6, k: 24, x: 10 }, { h: 7, k: 30, x: 1 },
] as const;

function graphReadVariant(rand: () => number) {
  const chosen = FUNCTION_GRAPH_READ_CASES[Math.floor(rand() * FUNCTION_GRAPH_READ_CASES.length)]!;
  const delta = chosen.x - chosen.h;
  const answer = chosen.k - delta ** 2;
  const hTerm = chosen.h < 0 ? `x + ${Math.abs(chosen.h)}` : chosen.h === 0 ? "x" : `x - ${chosen.h}`;
  const traps = [chosen.k, delta ** 2, -(delta ** 2)]
    .filter((value, index, all) => value !== answer && all.indexOf(value) === index);
  return {
    tag: "g12-function-analysis",
    widget: {
      type: "numeric" as const,
      prompt: `For g(x) = -(${hTerm})^2 + ${chosen.k}, find g(${chosen.x}).`,
      answer,
      tolerance: 0,
      commonErrors: traps.map((value) => ({
        value,
        feedback: "Evaluate the horizontal offset first, square it, apply the leading negative, and then add the vertex height.",
      })),
      fallbackFeedback: `The horizontal offset is ${delta}; therefore g(${chosen.x}) = -(${delta})^2 + ${chosen.k} = ${answer}.`,
      successFeedback: `Substitution into vertex form gives g(${chosen.x}) = ${answer}.`,
    },
    answer,
  };
}

const COMPOSE_ORDER_FORM = "function-analysis__fna-compose-order__numeric";
const COMPOSE_ORDER_CASES = [
  { a: 2, b: -1, x: 3, order: "gof" as const }, { a: 3, b: 1, x: 2, order: "gof" as const },
  { a: 4, b: -2, x: 2, order: "gof" as const }, { a: 2, b: 3, x: -1, order: "gof" as const },
  { a: 5, b: -1, x: 1, order: "gof" as const }, { a: 3, b: -2, x: 4, order: "gof" as const },
  { a: 2, b: -1, x: 3, order: "fog" as const }, { a: 3, b: 1, x: 2, order: "fog" as const },
  { a: 4, b: -2, x: 2, order: "fog" as const }, { a: 2, b: 3, x: -1, order: "fog" as const },
  { a: 5, b: -1, x: 1, order: "fog" as const }, { a: 3, b: -2, x: 4, order: "fog" as const },
] as const;

function composeOrderVariant(rand: () => number) {
  const chosen = COMPOSE_ORDER_CASES[Math.floor(rand() * COMPOSE_ORDER_CASES.length)]!;
  const fValue = chosen.a * chosen.x + chosen.b;
  const answer = chosen.order === "gof" ? fValue ** 2 : chosen.a * chosen.x ** 2 + chosen.b;
  const linear = {
    op: "add" as const,
    left: { op: "multiply" as const, left: { op: "lit" as const, value: chosen.a }, right: { op: "const" as const, id: "x" } },
    right: { op: "lit" as const, value: chosen.b },
  };
  const square = (node: typeof linear | { op: "const"; id: string }) => ({ op: "multiply" as const, left: node, right: node });
  const formula = chosen.order === "gof"
    ? square(linear)
    : { op: "add" as const, left: { op: "multiply" as const, left: { op: "lit" as const, value: chosen.a }, right: square({ op: "const" as const, id: "x" }) }, right: { op: "lit" as const, value: chosen.b } };
  const widget = {
    type: "exactNumberLab" as const,
    prompt: `Let f(x) = ${chosen.a}x ${chosen.b < 0 ? "-" : "+"} ${Math.abs(chosen.b)} and g(x) = x^2. Find ${chosen.order === "gof" ? "g(f" : "f(g"}(${chosen.x})).`,
    task: "approximationEvaluate" as const,
    values: [], approxConstants: [{ id: "x", label: "the starting input", value: chosen.x }],
    approxFormula: formula, approxRound: 3, answerMode: "numeric" as const, tolerance: 0,
    numericErrors: [fValue, chosen.x ** 2, chosen.order === "gof" ? chosen.a * chosen.x ** 2 + chosen.b : fValue ** 2]
      .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
      .map((value) => ({ value, feedback: "Composition order matters: evaluate the inner function first, then use that result as the outer function's input." })),
    choices: [], authoredStages: [], requiredStageKeys: [], requiredExplorations: 1,
    explorationFeedback: "Evaluate the inner function before checking the outer-function result.",
    fallbackFeedback: `Following the stated inside-to-outside order gives ${answer}.`,
    successFeedback: `The composed value is ${answer}.`,
  };
  return { tag: "g12-function-analysis", widget, answer };
}

const COMPOSE_DOMAIN_FORM = "function-analysis__fna-compose-domain__numeric";
const COMPOSE_DOMAIN_CASES = [
  { boundary: -6, direction: "minimum" as const }, { boundary: -4, direction: "minimum" as const },
  { boundary: -2, direction: "minimum" as const }, { boundary: 1, direction: "minimum" as const },
  { boundary: 3, direction: "minimum" as const }, { boundary: 5, direction: "minimum" as const },
  { boundary: -5, direction: "maximum" as const }, { boundary: -3, direction: "maximum" as const },
  { boundary: 0, direction: "maximum" as const }, { boundary: 2, direction: "maximum" as const },
  { boundary: 4, direction: "maximum" as const }, { boundary: 7, direction: "maximum" as const },
] as const;

function composeDomainVariant(rand: () => number) {
  const chosen = COMPOSE_DOMAIN_CASES[Math.floor(rand() * COMPOSE_DOMAIN_CASES.length)]!;
  const expression = chosen.direction === "minimum"
    ? `sqrt(x ${chosen.boundary < 0 ? "+" : "-"} ${Math.abs(chosen.boundary)})`
    : `sqrt(${chosen.boundary} - x)`;
  const widget = {
    type: "exactNumberLab" as const,
    prompt: `For h(x) = ${expression}, what is the ${chosen.direction} allowed x-value?`,
    task: "approximationEvaluate" as const,
    values: [], approxConstants: [{ id: "k", label: "the domain boundary", value: chosen.boundary }],
    approxFormula: { op: "const" as const, id: "k" }, approxRound: 0,
    answerMode: "numeric" as const, tolerance: 0,
    numericErrors: [-chosen.boundary, 0]
      .filter((value, index, all) => value !== chosen.boundary && all.indexOf(value) === index)
      .map((value) => ({ value, feedback: "Set the radicand greater than or equal to zero and solve the resulting boundary inequality." })),
    choices: [], authoredStages: [], requiredStageKeys: [], requiredExplorations: 1,
    explorationFeedback: "Inspect where the square-root radicand reaches zero.",
    fallbackFeedback: `The radicand reaches zero at x = ${chosen.boundary}, which is the ${chosen.direction} allowed value.`,
    successFeedback: `The domain boundary is x = ${chosen.boundary}.`,
  };
  return { tag: "g12-function-analysis", widget, answer: chosen.boundary };
}

const DECOMPOSE_FORM = "function-analysis__fna-decompose__numeric";
const DECOMPOSE_CASES = [
  { a: 2, b: 1, x: 2, power: 2 }, { a: 3, b: 1, x: 2, power: 2 },
  { a: 5, b: 2, x: 2, power: 2 }, { a: 4, b: -2, x: 2, power: 2 },
  { a: 2, b: 1, x: 2, power: 3 }, { a: 3, b: -1, x: 3, power: 3 },
  { a: 2, b: -3, x: 5, power: 3 }, { a: 4, b: 1, x: 2, power: 3 },
  { a: 2, b: 1, x: 3, power: 4 }, { a: 3, b: 1, x: 3, power: 4 },
  { a: 2, b: -1, x: 2, power: 4 }, { a: 4, b: -3, x: 2, power: 4 },
] as const;

function decomposeVariant(rand: () => number) {
  const chosen = DECOMPOSE_CASES[Math.floor(rand() * DECOMPOSE_CASES.length)]!;
  const innerValue = chosen.a * chosen.x + chosen.b;
  const answer = innerValue ** chosen.power;
  const linear: ApproxNode = {
    op: "add",
    left: { op: "multiply", left: { op: "lit", value: chosen.a }, right: { op: "const", id: "x" } },
    right: { op: "lit", value: chosen.b },
  };
  let formula: ApproxNode = linear;
  for (let factorIndex = 1; factorIndex < chosen.power; factorIndex += 1) {
    formula = { op: "multiply", left: formula, right: linear };
  }
  const widget = {
    type: "exactNumberLab" as const,
    prompt: `Let g(x) = ${chosen.a}x ${chosen.b < 0 ? "-" : "+"} ${Math.abs(chosen.b)} and f(x) = x^${chosen.power}. Find f(g(${chosen.x})).`,
    task: "approximationEvaluate" as const,
    values: [], approxConstants: [{ id: "x", label: "the input to the inner function", value: chosen.x }],
    approxFormula: formula, approxRound: 0, answerMode: "numeric" as const, tolerance: 0,
    numericErrors: [innerValue, chosen.x ** chosen.power, chosen.a * chosen.x ** chosen.power + chosen.b]
      .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
      .map((value) => ({ value, feedback: "Evaluate the inner linear function completely, then raise that result to the stated outer power." })),
    choices: [], authoredStages: [], requiredStageKeys: [], requiredExplorations: 1,
    explorationFeedback: "Evaluate g first, then apply the outer power.",
    fallbackFeedback: `The inner value is ${innerValue}; raising it to power ${chosen.power} gives ${answer}.`,
    successFeedback: `The composed value is ${answer}.`,
  };
  return { tag: "g12-function-analysis", widget, answer };
}

const ONE_TO_ONE_FORM = "function-analysis__fna-one-to-one__numeric";
const ONE_TO_ONE_INPUTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15] as const;

function oneToOneVariant(rand: () => number) {
  const input = ONE_TO_ONE_INPUTS[Math.floor(rand() * ONE_TO_ONE_INPUTS.length)]!;
  const widget = {
    type: "exactNumberLab" as const,
    prompt: `For h(x) = |x|, at what output value do the distinct inputs ${input} and -${input} collide?`,
    task: "approximationEvaluate" as const,
    values: [], approxConstants: [{ id: "x", label: "the positive input magnitude", value: input }],
    approxFormula: { op: "sqrt" as const, arg: { op: "multiply" as const, left: { op: "const" as const, id: "x" }, right: { op: "const" as const, id: "x" } } },
    approxRound: 0, answerMode: "numeric" as const, tolerance: 0,
    numericErrors: [-input, 0, 2 * input].map((value) => ({
      value,
      feedback: "Absolute value removes the sign, so the positive and negative inputs share the same positive magnitude as output.",
    })),
    choices: [], authoredStages: [], requiredStageKeys: [], requiredExplorations: 1,
    explorationFeedback: "Compare the two absolute-value outputs before checking.",
    fallbackFeedback: `Both |${input}| and |-${input}| equal ${input}, so the two inputs collide at output ${input}.`,
    successFeedback: `Both inputs map to ${input}, demonstrating the collision.`,
  };
  return { tag: "g12-function-analysis", widget, answer: input };
}

const RESTRICTED_FORM = "function-analysis__fna-restricted__numeric";
const RESTRICTED_CASES = [
  { vertex: -4, root: 1, branch: "right" as const }, { vertex: -2, root: 2, branch: "right" as const },
  { vertex: 0, root: 3, branch: "right" as const }, { vertex: 2, root: 4, branch: "right" as const },
  { vertex: 3, root: 1, branch: "right" as const }, { vertex: 5, root: 2, branch: "right" as const },
  { vertex: -5, root: 2, branch: "left" as const }, { vertex: -3, root: 3, branch: "left" as const },
  { vertex: -1, root: 4, branch: "left" as const }, { vertex: 1, root: 1, branch: "left" as const },
  { vertex: 4, root: 2, branch: "left" as const }, { vertex: 6, root: 3, branch: "left" as const },
] as const;

function restrictedInverseVariant(rand: () => number) {
  const chosen = RESTRICTED_CASES[Math.floor(rand() * RESTRICTED_CASES.length)]!;
  const target = chosen.root ** 2;
  const answer = chosen.branch === "right" ? chosen.vertex + chosen.root : chosen.vertex - chosen.root;
  const vertexExpression = chosen.vertex < 0 ? `x + ${Math.abs(chosen.vertex)}` : chosen.vertex === 0 ? "x" : `x - ${chosen.vertex}`;
  const relation = chosen.branch === "right" ? ">=" : "<=";
  const formula: ApproxNode = chosen.branch === "right"
    ? { op: "add", left: { op: "const", id: "v" }, right: { op: "sqrt", arg: { op: "const", id: "t" } } as never }
    : { op: "add", left: { op: "const", id: "v" }, right: { op: "multiply", left: { op: "lit", value: -1 }, right: { op: "sqrt", arg: { op: "const", id: "t" } } as never } };
  const widget = {
    type: "exactNumberLab" as const,
    prompt: `Let f(x) = (${vertexExpression})^2 with domain x ${relation} ${chosen.vertex}. Find f^(-1)(${target}).`,
    task: "approximationEvaluate" as const,
    values: [], approxConstants: [{ id: "v", label: "the restricted vertex", value: chosen.vertex }, { id: "t", label: "the target output", value: target }],
    approxFormula: formula, approxRound: 0, answerMode: "numeric" as const, tolerance: 0,
    numericErrors: [chosen.vertex, chosen.branch === "right" ? chosen.vertex - chosen.root : chosen.vertex + chosen.root, target]
      .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
      .map((value) => ({ value, feedback: "Take the square root of the target and choose the sign allowed by the stated domain restriction." })),
    choices: [], authoredStages: [], requiredStageKeys: [], requiredExplorations: 1,
    explorationFeedback: "Use the domain restriction to select the correct inverse branch.",
    fallbackFeedback: `The allowed branch gives x = ${chosen.vertex} ${chosen.branch === "right" ? "+" : "-"} sqrt(${target}) = ${answer}.`,
    successFeedback: `The restricted inverse value is ${answer}.`,
  };
  return { tag: "g12-function-analysis", widget, answer };
}

const INVERSE_POINT_FORM = "function-analysis__fna-inverse-verify__pointEntry";
const INVERSE_POINTS = [
  [-6, 2], [-5, 9], [-3, -7], [-2, 10], [-1, 4], [1, -8],
  [2, 10], [3, -5], [4, 7], [5, 12], [6, -3], [8, 1],
] as const;

function inversePointVariant(rand: () => number) {
  const point = INVERSE_POINTS[Math.floor(rand() * INVERSE_POINTS.length)]!;
  const answer = [point[1], point[0]];
  return {
    tag: "g12-function-analysis",
    widget: {
      type: "pointEntry" as const,
      prompt: `The point (${point[0]}, ${point[1]}) lies on f. Enter the corresponding point on f^(-1).`,
      answer,
      delimiter: "paren" as const,
      commonEntries: [
        { values: [-point[0], -point[1]], feedback: "That reflects through the origin. An inverse swaps the input and output coordinates." },
        { values: [point[0], -point[1]], feedback: "That reflects across an axis. An inverse reflects across y = x by swapping coordinates." },
      ],
      fallbackFeedback: `Swap the coordinates: (${point[0]}, ${point[1]}) on f becomes (${answer[0]}, ${answer[1]}) on f^(-1).`,
      successFeedback: `The inverse point is (${answer[0]}, ${answer[1]}).`,
    },
    answer,
  };
}

const INVERSE_VERIFY_FORM = "function-analysis__fna-inverse-verify__numeric";
const INVERSE_VERIFY_CASES = [
  { a: 2, b: 6, x: -3 }, { a: 3, b: 5, x: -2 }, { a: 4, b: -3, x: 2 },
  { a: 5, b: 1, x: 3 }, { a: 2, b: -7, x: 4 }, { a: 3, b: -2, x: 5 },
  { a: -2, b: 4, x: 6 }, { a: -3, b: 6, x: 7 }, { a: -4, b: -1, x: 8 },
  { a: -5, b: 2, x: 9 }, { a: 6, b: -5, x: -1 }, { a: 7, b: 3, x: 10 },
] as const;

function inverseVerifyVariant(rand: () => number) {
  const chosen = INVERSE_VERIFY_CASES[Math.floor(rand() * INVERSE_VERIFY_CASES.length)]!;
  const fValue = chosen.a * chosen.x + chosen.b;
  const widget = {
    type: "exactNumberLab" as const,
    prompt: `Let f(x) = ${chosen.a}x ${chosen.b < 0 ? "-" : "+"} ${Math.abs(chosen.b)} and g(x) = (x ${chosen.b < 0 ? "+" : "-"} ${Math.abs(chosen.b)})/${chosen.a}. Find g(f(${chosen.x})).`,
    task: "approximationEvaluate" as const,
    values: [], approxConstants: [{ id: "x", label: "the round-trip input", value: chosen.x }],
    approxFormula: {
      op: "divide" as const,
      left: {
        op: "subtract" as const,
        left: { op: "add" as const, left: { op: "multiply" as const, left: { op: "lit" as const, value: chosen.a }, right: { op: "const" as const, id: "x" } }, right: { op: "lit" as const, value: chosen.b } },
        right: { op: "lit" as const, value: chosen.b },
      },
      right: { op: "lit" as const, value: chosen.a },
    },
    approxRound: 3, answerMode: "numeric" as const, tolerance: 0,
    numericErrors: [fValue, (chosen.x - chosen.b) / chosen.a, -chosen.x]
      .filter((value, index, all) => value !== chosen.x && all.indexOf(value) === index)
      .map((value) => ({ value, feedback: "Evaluate f first, then apply g. Inverse functions undo every affine step and return the starting input." })),
    choices: [], authoredStages: [], requiredStageKeys: [], requiredExplorations: 1,
    explorationFeedback: "Track the input through f and then back through g.",
    fallbackFeedback: `f(${chosen.x}) = ${fValue}, and g(${fValue}) returns the original input ${chosen.x}.`,
    successFeedback: `The round trip returns ${chosen.x}, confirming the inverse relationship.`,
  };
  return { tag: "g12-function-analysis", widget, answer: chosen.x };
}

/* S246 / Phase 5: lc-01 previously fell back to one-to-three authored items per
 * form. Keep the three lesson jobs distinct while giving every form a twelve-
 * state mathematical pool. The independent checker parses only the learner-
 * visible prompt; none of these case tables are shared with it. */
type LimitGeneratedVariant = Variant & { tag: "g12-limits-continuity" };
type LimitChoice = { label: string; correct: boolean; feedback: string };

const LIMIT_IDEA_MCQ_FORM = "limits-continuity__lc-limit-idea__mcq";
const LIMIT_IDEA_NUMERIC_FORM = "limits-continuity__lc-limit-idea__numeric";
const LIMIT_READ_NUMERIC_FORM = "limits-continuity__lc-read-limit__numeric";
const LIMIT_DNE_MCQ_FORM = "limits-continuity__lc-dne__mcq";
const LIMIT_DNE_NUMERIC_FORM = "limits-continuity__lc-dne__numeric";
const LIMIT_FACTOR_NUMERIC_FORM = "limits-continuity__lc-factor__numeric";
const LIMIT_RATIONALIZE_MCQ_FORM = "limits-continuity__lc-rationalize__mcq";
const LIMIT_RATIONALIZE_NUMERIC_FORM = "limits-continuity__lc-rationalize__numeric";
const LIMIT_ONESIDED_MCQ_FORM = "limits-continuity__lc-onesided__mcq";
const LIMIT_ONESIDED_NUMERIC_FORM = "limits-continuity__lc-onesided__numeric";
const LIMIT_INFINITY_NUMERIC_FORM = "limits-continuity__lc-infinity__numeric";
const LIMIT_ENDBEHAVIOR_MCQ_FORM = "limits-continuity__lc-endbehavior__mcq";
const LIMIT_CONTINUITY_MCQ_FORM = "limits-continuity__lc-continuity__mcq";
const LIMIT_CONTINUITY_NUMERIC_FORM = "limits-continuity__lc-continuity__numeric";
const LIMIT_DISCONTINUITY_MCQ_FORM = "limits-continuity__lc-discontinuity__mcq";
const LIMIT_DISCONTINUITY_NUMERIC_FORM = "limits-continuity__lc-discontinuity__numeric";
const LIMIT_IVT_MCQ_FORM = "limits-continuity__lc-ivt__mcq";
const LIMIT_IVT_NUMERIC_FORM = "limits-continuity__lc-ivt__numeric";
const LIMIT_AVG_RATE_MCQ_FORM = "limits-continuity__lc-avg-rate__mcq";
const LIMIT_AVG_RATE_NUMERIC_FORM = "limits-continuity__lc-avg-rate__numeric";
const LIMIT_DERIVATIVE_MCQ_FORM = "limits-continuity__lc-derivative__mcq";
const LIMIT_DERIVATIVE_NUMERIC_FORM = "limits-continuity__lc-derivative__numeric";
const LIMIT_SERIES_MCQ_FORM = "limits-continuity__lc-series-limit__mcq";
const LIMIT_SERIES_NUMERIC_FORM = "limits-continuity__lc-series-limit__numeric";

const chooseLimitCase = <T,>(rand: () => number, cases: readonly T[]): T =>
  cases[Math.floor(rand() * cases.length)]!;

function shuffleLimitChoices(rand: () => number, choices: readonly LimitChoice[]) {
  const copy = [...choices];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rand() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap]!, copy[index]!];
  }
  return copy.map((choice, index) => ({ ...choice, id: `o${index}` }));
}

function limitMcq(rand: () => number, prompt: string, choices: readonly LimitChoice[]): LimitGeneratedVariant {
  const options = shuffleLimitChoices(rand, choices);
  const correct = options.find((option) => option.correct);
  if (!correct) throw new Error("Generated limits MCQ has no correct option");
  return { tag: "g12-limits-continuity", widget: { type: "mcq", prompt, options }, answer: correct.id };
}

function limitNumeric(prompt: string, answer: number, traps: readonly number[], feedback: string): LimitGeneratedVariant {
  const used = new Set([answer]);
  const commonErrors = traps.filter((value) => {
    if (!Number.isFinite(value) || used.has(value)) return false;
    used.add(value);
    return true;
  }).map((value) => ({ value, feedback }));
  for (let offset = 1; commonErrors.length < 2; offset += 1) {
    const value = answer + offset;
    if (used.has(value)) continue;
    used.add(value);
    commonErrors.push({ value, feedback });
  }
  return {
    tag: "g12-limits-continuity",
    widget: { type: "numeric", prompt, answer, tolerance: 0, commonErrors, fallbackFeedback: feedback },
    answer,
  };
}

const LIMIT_APPROACH_CASES = [
  { at: -5, value: -3, gap: 0.2 }, { at: -4, value: 2, gap: 0.1 },
  { at: -3, value: 7, gap: 0.05 }, { at: -2, value: -6, gap: 0.25 },
  { at: -1, value: 4, gap: 0.01 }, { at: 0, value: -2, gap: 0.1 },
  { at: 1, value: 5, gap: 0.2 }, { at: 2, value: 9, gap: 0.05 },
  { at: 3, value: -4, gap: 0.25 }, { at: 4, value: 6, gap: 0.01 },
  { at: 5, value: 11, gap: 0.1 }, { at: 6, value: 3, gap: 0.2 },
] as const;

const LIMIT_POINT_CASES = [
  { at: -5, approach: 3, point: -2 }, { at: -4, approach: -1, point: 6 },
  { at: -3, approach: 8, point: 2 }, { at: -2, approach: 4, point: -5 },
  { at: -1, approach: 7, point: 0 }, { at: 0, approach: -3, point: 5 },
  { at: 1, approach: 6, point: -4 }, { at: 2, approach: 9, point: 1 },
  { at: 3, approach: -2, point: 7 }, { at: 4, approach: 5, point: -1 },
  { at: 5, approach: 10, point: 4 }, { at: 6, approach: 2, point: 11 },
] as const;

const LIMIT_LINE_CASES = [
  { m: -4, b: 3, at: -2 }, { m: -3, b: -1, at: 4 },
  { m: -2, b: 5, at: 3 }, { m: -1, b: -4, at: -5 },
  { m: 1, b: 6, at: -3 }, { m: 2, b: -4, at: 4 },
  { m: 3, b: 2, at: -2 }, { m: 4, b: -3, at: 5 },
  { m: 5, b: 2, at: 2 }, { m: 6, b: -2, at: -1 },
  { m: 7, b: 4, at: 3 }, { m: 8, b: -6, at: 2 },
] as const;

const LIMIT_JUMP_CASES = [
  { at: -5, left: -3, right: 2 }, { at: -4, left: 1, right: 6 },
  { at: -3, left: 7, right: -2 }, { at: -2, left: -5, right: 4 },
  { at: -1, left: 0, right: 8 }, { at: 0, left: -4, right: 3 },
  { at: 1, left: 2, right: 9 }, { at: 2, left: 6, right: -1 },
  { at: 3, left: -2, right: 5 }, { at: 4, left: 10, right: 4 },
  { at: 5, left: 3, right: 11 }, { at: 6, left: 8, right: -3 },
] as const;

const LIMIT_AGREEMENT_CASES = [
  { at: -5, value: -8 }, { at: -4, value: 3 }, { at: -3, value: 7 },
  { at: -2, value: -5 }, { at: -1, value: 2 }, { at: 0, value: 9 },
  { at: 1, value: -4 }, { at: 2, value: 6 }, { at: 3, value: 11 },
  { at: 4, value: -1 }, { at: 5, value: 8 }, { at: 6, value: 4 },
] as const;

const LIMIT_FACTOR_CASES = [
  { at: 2, other: 3 }, { at: 3, other: -2 }, { at: 4, other: 1 },
  { at: 5, other: -3 }, { at: -2, other: 4 }, { at: -3, other: -5 },
  { at: 1, other: 6 }, { at: 6, other: 2 }, { at: -4, other: 3 },
  { at: 7, other: -2 }, { at: -5, other: -1 }, { at: 8, other: -3 },
] as const;

const LIMIT_RATIONALIZE_CASES = [
  { root: 1 }, { root: 2 }, { root: 3 }, { root: 4 },
  { root: 5 }, { root: 6 }, { root: 7 }, { root: 8 },
  { root: 9 }, { root: 10 }, { root: 11 }, { root: 12 },
] as const;

const LIMIT_ONESIDED_CASES = [
  { at: -5, m: -2, b: 1, side: "left" }, { at: -4, m: 3, b: -2, side: "right" },
  { at: -3, m: 4, b: 5, side: "left" }, { at: -2, m: -3, b: -4, side: "right" },
  { at: -1, m: 5, b: 2, side: "left" }, { at: 0, m: -4, b: 7, side: "right" },
  { at: 1, m: 6, b: -3, side: "left" }, { at: 2, m: -5, b: 4, side: "right" },
  { at: 3, m: 2, b: -6, side: "left" }, { at: 4, m: 7, b: 1, side: "right" },
  { at: 5, m: -6, b: 3, side: "left" }, { at: 6, m: 3, b: -5, side: "right" },
] as const;

const LIMIT_TWOSIDED_CASES = [
  { at: -5, left: -3, right: -3 }, { at: -4, left: 2, right: 7 },
  { at: -3, left: 8, right: 8 }, { at: -2, left: -6, right: 1 },
  { at: -1, left: 4, right: 4 }, { at: 0, left: -2, right: 5 },
  { at: 1, left: 6, right: 6 }, { at: 2, left: 9, right: -1 },
  { at: 3, left: -4, right: -4 }, { at: 4, left: 10, right: 3 },
  { at: 5, left: 11, right: 11 }, { at: 6, left: 3, right: -5 },
] as const;

const LIMIT_INFINITY_CASES = [
  { numerator: -7, denominator: 2 }, { numerator: -5, denominator: 4 },
  { numerator: -3, denominator: 2 }, { numerator: -1, denominator: 4 },
  { numerator: 1, denominator: 5 }, { numerator: 2, denominator: 3 },
  { numerator: 3, denominator: 2 }, { numerator: 4, denominator: 3 },
  { numerator: 5, denominator: 2 }, { numerator: 7, denominator: 4 },
  { numerator: 8, denominator: 3 }, { numerator: 9, denominator: 2 },
] as const;

const LIMIT_END_CASES = [
  { a: 3, n: 1, b: 2, m: 3 }, { a: -5, n: 2, b: 4, m: 5 },
  { a: 7, n: 3, b: 3, m: 4 }, { a: -2, n: 1, b: 5, m: 2 },
  { a: 4, n: 2, b: 2, m: 2 }, { a: -3, n: 3, b: 2, m: 3 },
  { a: 5, n: 4, b: 4, m: 4 }, { a: -7, n: 1, b: 2, m: 1 },
  { a: 2, n: 3, b: 5, m: 1 }, { a: -4, n: 4, b: 3, m: 2 },
  { a: 6, n: 5, b: 5, m: 3 }, { a: -8, n: 3, b: 7, m: 1 },
] as const;

const LIMIT_CONTINUITY_CASES = [
  { at: -5, limit: -3, point: -3 }, { at: -4, limit: 2, point: 7 },
  { at: -3, limit: 8, point: 8 }, { at: -2, limit: -6, point: 1 },
  { at: -1, limit: 4, point: 4 }, { at: 0, limit: -2, point: 5 },
  { at: 1, limit: 6, point: 6 }, { at: 2, limit: 9, point: -1 },
  { at: 3, limit: -4, point: -4 }, { at: 4, limit: 10, point: 3 },
  { at: 5, limit: 11, point: 11 }, { at: 6, limit: 3, point: -5 },
] as const;

const LIMIT_CONTINUITY_PARAMETER_CASES = [
  { at: -5, m: -2, b: 1 }, { at: -4, m: 3, b: -2 },
  { at: -3, m: 4, b: 5 }, { at: -2, m: -3, b: -4 },
  { at: -1, m: 5, b: 2 }, { at: 0, m: -4, b: 7 },
  { at: 1, m: 6, b: -3 }, { at: 2, m: -5, b: 4 },
  { at: 3, m: 2, b: -6 }, { at: 4, m: 7, b: 1 },
  { at: 5, m: -6, b: 3 }, { at: 6, m: 3, b: -5 },
] as const;

const LIMIT_DISCONTINUITY_CASES = [
  { at: -6, kind: "removable", first: 4, second: 0 },
  { at: -5, kind: "jump", first: -2, second: 3 },
  { at: -4, kind: "infinite", first: 0, second: 0 },
  { at: -3, kind: "removable", first: 7, second: 0 },
  { at: -2, kind: "jump", first: 5, second: -1 },
  { at: -1, kind: "infinite", first: 0, second: 0 },
  { at: 0, kind: "removable", first: -4, second: 0 },
  { at: 1, kind: "jump", first: -3, second: 6 },
  { at: 2, kind: "infinite", first: 0, second: 0 },
  { at: 3, kind: "removable", first: 9, second: 0 },
  { at: 4, kind: "jump", first: 8, second: 2 },
  { at: 5, kind: "infinite", first: 0, second: 0 },
] as const;

const LIMIT_IVT_CASES = [
  { a: -6, b: -4, fa: -5, fb: 3 }, { a: -5, b: -2, fa: 7, fb: -1 },
  { a: -4, b: -1, fa: -2, fb: 6 }, { a: -3, b: 1, fa: 4, fb: -8 },
  { a: -2, b: 2, fa: -7, fb: 5 }, { a: -1, b: 3, fa: 9, fb: -3 },
  { a: 0, b: 4, fa: -4, fb: 2 }, { a: 1, b: 5, fa: 6, fb: -5 },
  { a: 2, b: 6, fa: -8, fb: 1 }, { a: 3, b: 7, fa: 3, fb: -9 },
  { a: 4, b: 8, fa: -6, fb: 7 }, { a: 5, b: 9, fa: 2, fb: -4 },
] as const;

const LIMIT_IVT_EVALUATION_CASES = [
  { x: -6, c: 5 }, { x: -5, c: 7 }, { x: -4, c: 3 },
  { x: -3, c: 8 }, { x: -2, c: 1 }, { x: -1, c: 6 },
  { x: 1, c: 9 }, { x: 2, c: -2 }, { x: 3, c: 4 },
  { x: 4, c: -3 }, { x: 5, c: 2 }, { x: 6, c: -4 },
] as const;

const LIMIT_AVG_RATE_CASES = [
  { q: 1, m: 0, c: 2, a: 1, b: 2 }, { q: 1, m: 1, c: -3, a: 1, b: 3 },
  { q: 1, m: -1, c: 4, a: 2, b: 5 }, { q: 2, m: 0, c: -1, a: 1, b: 3 },
  { q: 1, m: 2, c: 5, a: 3, b: 5 }, { q: 2, m: 1, c: -4, a: 2, b: 4 },
  { q: 3, m: -2, c: 1, a: 1, b: 5 }, { q: 2, m: 3, c: 2, a: 3, b: 5 },
  { q: 3, m: 1, c: -2, a: 2, b: 5 }, { q: 4, m: -3, c: 3, a: 3, b: 4 },
  { q: 3, m: 4, c: -5, a: 4, b: 5 }, { q: 5, m: -2, c: 6, a: 3, b: 5 },
] as const;

const LIMIT_DERIVATIVE_CASES = [
  { q: 1, m: 0, c: 2, at: 1 }, { q: 1, m: 1, c: -3, at: 2 },
  { q: 1, m: -2, c: 4, at: 4 }, { q: 2, m: 0, c: 1, at: 2 },
  { q: 2, m: 3, c: -2, at: 2 }, { q: 2, m: -1, c: 5, at: 4 },
  { q: 3, m: 0, c: -1, at: 3 }, { q: 3, m: 2, c: 2, at: 4 },
  { q: 3, m: -4, c: 0, at: 6 }, { q: 4, m: 1, c: 3, at: 5 },
  { q: 4, m: -2, c: -5, at: 6 }, { q: 5, m: 3, c: 1, at: 5 },
] as const;

const LIMIT_SERIES_CASES = [
  { aNum: 1, aDen: 5, rNum: 1, rDen: 2 }, { aNum: 1, aDen: 3, rNum: 1, rDen: 3 },
  { aNum: 3, aDen: 10, rNum: 1, rDen: 2 }, { aNum: 1, aDen: 2, rNum: 1, rDen: 3 },
  { aNum: 3, aDen: 5, rNum: 1, rDen: 4 }, { aNum: 1, aDen: 2, rNum: 1, rDen: 2 },
  { aNum: 4, aDen: 5, rNum: 1, rDen: 3 }, { aNum: 1, aDen: 1, rNum: 1, rDen: 5 },
  { aNum: 1, aDen: 1, rNum: 1, rDen: 3 }, { aNum: 4, aDen: 5, rNum: 1, rDen: 2 },
  { aNum: 1, aDen: 1, rNum: 1, rDen: 2 }, { aNum: 2, aDen: 1, rNum: 1, rDen: 5 },
] as const;

const signedLimitNumber = (value: number): string => value < 0 ? `−${Math.abs(value)}` : String(value);
const limitCoefficientVariable = (coefficient: number, variable: string): string => {
  if (coefficient === 1) return variable;
  if (coefficient === -1) return `−${variable}`;
  return `${signedLimitNumber(coefficient)}${variable}`;
};
const limitPower = (value: number): string => ({ 1: "", 2: "²", 3: "³", 4: "⁴", 5: "⁵" })[value] ?? String(value);
const decimalLimitNumber = (value: number): string => {
  const fixed = value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return fixed.startsWith("-") ? `−${fixed.slice(1)}` : fixed;
};
const limitPolynomial = (q: number, m: number, c: number): string => {
  const quadratic = q === 1 ? "x²" : `${q}x²`;
  const linear = m === 0 ? "" : ` ${m < 0 ? "−" : "+"} ${Math.abs(m) === 1 ? "" : Math.abs(m)}x`;
  const constant = c === 0 ? "" : ` ${c < 0 ? "−" : "+"} ${Math.abs(c)}`;
  return `${quadratic}${linear}${constant}`;
};

const limitLinearExpression = (coefficient: number, constant: number, variable = "a"): string => {
  const linear = coefficient === 1 ? variable : `${coefficient}${variable}`;
  return constant === 0 ? linear : `${linear} ${constant < 0 ? "−" : "+"} ${Math.abs(constant)}`;
};

const distinctLimitNumbers = (answer: number, candidates: readonly number[]): number[] => {
  const used = new Set([answer]);
  const values: number[] = [];
  for (const candidate of candidates) {
    const value = Number(candidate.toFixed(3));
    if (!Number.isFinite(value) || used.has(value)) continue;
    used.add(value);
    values.push(value);
  }
  for (let offset = 1; values.length < 3; offset += 1) {
    const value = Number((answer + offset).toFixed(3));
    if (used.has(value)) continue;
    used.add(value);
    values.push(value);
  }
  return values.slice(0, 3);
};

function limitIdeaNumericVariant(rand: () => number): LimitGeneratedVariant {
  const chosen = chooseLimitCase(rand, LIMIT_APPROACH_CASES);
  const left = chosen.value - chosen.gap;
  const right = chosen.value + chosen.gap;
  return limitNumeric(
    `Near x = ${signedLimitNumber(chosen.at)}, a table shows ${decimalLimitNumber(left)} from the left and ${decimalLimitNumber(right)} from the right. What value do both sides approach?`,
    chosen.value,
    [chosen.at, Number((right - left).toFixed(2)), Number((left + right).toFixed(2))],
    `The two output values bracket ${signedLimitNumber(chosen.value)} equally, so the limit is ${signedLimitNumber(chosen.value)}.`,
  );
}

function limitIdeaMcqVariant(rand: () => number): LimitGeneratedVariant {
  const chosen = chooseLimitCase(rand, LIMIT_POINT_CASES);
  const approach = signedLimitNumber(chosen.approach);
  const point = signedLimitNumber(chosen.point);
  return limitMcq(rand,
    `As x approaches ${signedLimitNumber(chosen.at)}, the curve approaches ${approach}, while the plotted point gives f(${signedLimitNumber(chosen.at)}) = ${point}. What is the limit?`,
    [
      { label: `${approach}; use the nearby approach`, correct: true, feedback: `Correct. A limit follows nearby values, which approach ${approach}.` },
      { label: `${point}; use the plotted point`, correct: false, feedback: `That is the single function value. Nearby values approach ${approach}.` },
      { label: "DNE; the point and approach differ", correct: false, feedback: `A different point value does not prevent the nearby curve from approaching ${approach}.` },
    ],
  );
}

function limitReadNumericVariant(rand: () => number): LimitGeneratedVariant {
  const chosen = chooseLimitCase(rand, LIMIT_LINE_CASES);
  const answer = chosen.m * chosen.at + chosen.b;
  const bSign = chosen.b < 0 ? `− ${Math.abs(chosen.b)}` : `+ ${chosen.b}`;
  return limitNumeric(
    `The graph is the continuous line f(x) = ${limitCoefficientVariable(chosen.m, "x")} ${bSign}. Find the limit as x approaches ${signedLimitNumber(chosen.at)}.`,
    answer,
    [chosen.at, chosen.m * chosen.at, chosen.b],
    `A continuous line can be evaluated directly: ${signedLimitNumber(chosen.m)}(${signedLimitNumber(chosen.at)}) ${bSign} = ${signedLimitNumber(answer)}.`,
  );
}

function limitDneMcqVariant(rand: () => number): LimitGeneratedVariant {
  const chosen = chooseLimitCase(rand, LIMIT_JUMP_CASES);
  const left = signedLimitNumber(chosen.left);
  const right = signedLimitNumber(chosen.right);
  const average = decimalLimitNumber((chosen.left + chosen.right) / 2);
  return limitMcq(rand,
    `At x = ${signedLimitNumber(chosen.at)}, the left-hand limit is ${left} and the right-hand limit is ${right}. What is the two-sided limit?`,
    [
      { label: `DNE; the sides give ${left} and ${right}`, correct: true, feedback: `Correct. A two-sided limit exists only when both one-sided limits agree.` },
      { label: `${left}; use only the left-hand side`, correct: false, feedback: `The right-hand side approaches ${right}, so the two sides do not agree.` },
      { label: `${right}; use only the right-hand side`, correct: false, feedback: `The left-hand side approaches ${left}, so the two sides do not agree.` },
      { label: `${average}; average the two side values`, correct: false, feedback: "One-sided limits are not averaged. Disagreement means the two-sided limit does not exist." },
    ],
  );
}

function limitDneNumericVariant(rand: () => number): LimitGeneratedVariant {
  const chosen = chooseLimitCase(rand, LIMIT_AGREEMENT_CASES);
  return limitNumeric(
    `At x = ${signedLimitNumber(chosen.at)}, both the left-hand and right-hand limits equal ${signedLimitNumber(chosen.value)}. What is the two-sided limit?`,
    chosen.value,
    [chosen.at, 2 * chosen.value, -chosen.value],
    `The one-sided limits agree at ${signedLimitNumber(chosen.value)}, so the two-sided limit is ${signedLimitNumber(chosen.value)}.`,
  );
}

const limitLinearFactor = (root: number): string => root < 0 ? `(x + ${Math.abs(root)})` : `(x − ${root})`;

function limitFactorNumericVariant(rand: () => number): LimitGeneratedVariant {
  const chosen = chooseLimitCase(rand, LIMIT_FACTOR_CASES);
  const answer = chosen.at - chosen.other;
  const cancelled = limitLinearFactor(chosen.at);
  const remaining = limitLinearFactor(chosen.other);
  return limitNumeric(
    `Find the limit as x approaches ${signedLimitNumber(chosen.at)} of [${cancelled}${remaining}]/${cancelled}.`,
    answer,
    [0, chosen.at, chosen.other],
    `For x away from the removable point, cancel ${cancelled}; then ${remaining} approaches ${signedLimitNumber(answer)}.`,
  );
}

function limitRationalizeNumericVariant(rand: () => number): LimitGeneratedVariant {
  const chosen = chooseLimitCase(rand, LIMIT_RATIONALIZE_CASES);
  const square = chosen.root ** 2;
  const answer = Number((1 / (2 * chosen.root)).toFixed(3));
  const widget = {
    type: "exactNumberLab" as const,
    prompt: `Find the limit as x approaches 0 of [√(x + ${square}) − ${chosen.root}]/x. Give a decimal to three places.`,
    task: "approximationEvaluate" as const,
    values: [],
    approxConstants: [{ id: "c", label: "the value under the square root at x = 0", value: square }],
    approxFormula: {
      op: "divide" as const,
      left: { op: "lit" as const, value: 1 },
      right: {
        op: "add" as const,
        left: { op: "sqrt" as const, arg: { op: "const" as const, id: "c" } },
        right: { op: "sqrt" as const, arg: { op: "const" as const, id: "c" } },
      },
    },
    approxRound: 3,
    answerMode: "numeric" as const,
    tolerance: 0.0005,
    numericErrors: [0, Number((1 / chosen.root).toFixed(3)), Number((1 / square).toFixed(3))]
      .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
      .map((value) => ({ value, feedback: "Multiply by the conjugate, cancel x, and evaluate 1 divided by twice the square-root value." })),
    choices: [], authoredStages: [], requiredStageKeys: [], requiredExplorations: 1,
    explorationFeedback: "Use the conjugate to replace the radical difference with x before checking.",
    fallbackFeedback: `The conjugate gives 1/[√(x + ${square}) + ${chosen.root}], so the limit is 1/${2 * chosen.root} = ${answer}.`,
    successFeedback: `After rationalizing and canceling, the limit is ${answer}.`,
  };
  return { tag: "g12-limits-continuity", widget, answer };
}

function limitRationalizeMcqVariant(rand: () => number): LimitGeneratedVariant {
  const chosen = chooseLimitCase(rand, LIMIT_RATIONALIZE_CASES);
  const square = chosen.root ** 2;
  const conjugate = `(√(x + ${square}) + ${chosen.root})/(√(x + ${square}) + ${chosen.root})`;
  return limitMcq(rand,
    `For [√(x + ${square}) − ${chosen.root}]/x as x approaches 0, which move resolves the 0/0 form?`,
    [
      { label: `use the conjugate: ${conjugate}`, correct: true, feedback: "Correct. The conjugate turns the numerator product into x, which then cancels." },
      { label: `use the same sign: (√(x + ${square}) − ${chosen.root})/(√(x + ${square}) − ${chosen.root})`, correct: false, feedback: "That repeats the original radical difference. Use the conjugate with the opposite sign." },
      { label: "use x factors: multiply numerator and denominator by x", correct: false, feedback: "That adds another factor of x and does not remove the radical difference." },
      { label: "use substitution: stop and report the result as 0/0", correct: false, feedback: "The indeterminate form signals that an algebraic rewrite is needed; it is not the limit." },
    ],
  );
}

function limitOneSidedNumericVariant(rand: () => number): LimitGeneratedVariant {
  const chosen = chooseLimitCase(rand, LIMIT_ONESIDED_CASES);
  const answer = chosen.m * chosen.at + chosen.b;
  const relation = chosen.side === "left" ? `x < ${signedLimitNumber(chosen.at)}` : `x > ${signedLimitNumber(chosen.at)}`;
  const sign = chosen.b < 0 ? `− ${Math.abs(chosen.b)}` : `+ ${chosen.b}`;
  return limitNumeric(
    `For the ${chosen.side}-hand branch, f(x) = ${signedLimitNumber(chosen.m)}x ${sign} when ${relation}. Find the ${chosen.side}-hand limit at x = ${signedLimitNumber(chosen.at)}.`,
    answer,
    [chosen.at, chosen.m * chosen.at, chosen.b],
    `Follow only the ${chosen.side}-hand branch and approach the boundary: ${signedLimitNumber(chosen.m)}(${signedLimitNumber(chosen.at)}) ${sign} = ${signedLimitNumber(answer)}.`,
  );
}

function limitOneSidedMcqVariant(rand: () => number): LimitGeneratedVariant {
  const chosen = chooseLimitCase(rand, LIMIT_TWOSIDED_CASES);
  const left = signedLimitNumber(chosen.left);
  const right = signedLimitNumber(chosen.right);
  const agrees = chosen.left === chosen.right;
  const truth = agrees ? `${left}; both one-sided limits agree` : `DNE; left ${left} differs from right ${right}`;
  const average = decimalLimitNumber((chosen.left + chosen.right) / 2);
  const choices: LimitChoice[] = agrees
    ? [
        { label: truth, correct: true, feedback: "Correct. Matching one-sided limits establish the two-sided limit." },
        { label: "DNE; one-sided limits never combine", correct: false, feedback: "One-sided limits do combine when their values agree." },
        { label: `${signedLimitNumber(chosen.at)}; use the boundary input`, correct: false, feedback: "The boundary input is not the output approached by the function." },
      ]
    : [
        { label: truth, correct: true, feedback: "Correct. Different one-sided limits prevent a two-sided limit." },
        { label: `${left}; use only the left-hand value`, correct: false, feedback: `The right-hand value is ${right}, so both sides do not agree.` },
        { label: `${right}; use only the right-hand value`, correct: false, feedback: `The left-hand value is ${left}, so both sides do not agree.` },
        { label: `${average}; average the one-sided values`, correct: false, feedback: "One-sided limits are not averaged; disagreement means DNE." },
      ];
  return limitMcq(rand,
    `At x = ${signedLimitNumber(chosen.at)}, the left-hand limit is ${left} and the right-hand limit is ${right}. What is the two-sided limit?`,
    choices,
  );
}

function limitInfinityNumericVariant(rand: () => number): LimitGeneratedVariant {
  const chosen = chooseLimitCase(rand, LIMIT_INFINITY_CASES);
  const answer = Number((chosen.numerator / chosen.denominator).toFixed(3));
  const widget = {
    type: "exactNumberLab" as const,
    prompt: `For f(x) = (${limitCoefficientVariable(chosen.numerator, "x³")} + 1)/(${chosen.denominator}x³ − 2), find the limit as x approaches +∞. Give a decimal to three places.`,
    task: "approximationEvaluate" as const,
    values: [],
    approxConstants: [
      { id: "a", label: "the numerator's leading coefficient", value: chosen.numerator },
      { id: "b", label: "the denominator's leading coefficient", value: chosen.denominator },
    ],
    approxFormula: { op: "divide" as const, left: { op: "const" as const, id: "a" }, right: { op: "const" as const, id: "b" } },
    approxRound: 3,
    answerMode: "numeric" as const,
    tolerance: 0.0005,
    numericErrors: [0, chosen.numerator, chosen.denominator, Number((chosen.denominator / chosen.numerator).toFixed(3))]
      .filter((value, index, all) => value !== answer && Number.isFinite(value) && all.indexOf(value) === index)
      .map((value) => ({ value, feedback: "Equal degrees give the ratio of leading coefficients, numerator over denominator." })),
    choices: [], authoredStages: [], requiredStageKeys: [], requiredExplorations: 1,
    explorationFeedback: "Compare the highest powers and their coefficients before checking.",
    fallbackFeedback: `The degrees match, so the limit is ${chosen.numerator}/${chosen.denominator} = ${answer}.`,
    successFeedback: `The leading-coefficient ratio is ${answer}.`,
  };
  return { tag: "g12-limits-continuity", widget, answer };
}

function limitEndBehaviorMcqVariant(rand: () => number): LimitGeneratedVariant {
  const chosen = chooseLimitCase(rand, LIMIT_END_CASES);
  const ratio = Number((chosen.a / chosen.b).toFixed(3));
  const correctCategory = chosen.n < chosen.m ? "lower" : chosen.n === chosen.m ? "equal" : chosen.a / chosen.b > 0 ? "positive" : "negative";
  const choices = [
    { category: "lower", label: `limit 0; denominator degree ${chosen.m} exceeds numerator degree ${chosen.n}`, feedback: "That applies only when the denominator has the higher degree." },
    { category: "equal", label: `limit ${signedLimitNumber(ratio)}; numerator degree ${chosen.n} equals denominator degree ${chosen.m}`, feedback: "A finite coefficient ratio applies only when the degrees are equal." },
    { category: "positive", label: `limit +∞; numerator degree ${chosen.n} exceeds denominator degree ${chosen.m}`, feedback: "Check both the degree comparison and the sign of the leading-coefficient ratio." },
    { category: "negative", label: `limit −∞; numerator degree ${chosen.n} exceeds denominator degree ${chosen.m}`, feedback: "Check both the degree comparison and the sign of the leading-coefficient ratio." },
  ].map((choice) => ({
    label: choice.label,
    correct: choice.category === correctCategory,
    feedback: choice.category === correctCategory ? "Correct. Compare degrees first, then use the leading coefficients when needed." : choice.feedback,
  }));
  return limitMcq(rand,
    `A rational function has leading terms ${signedLimitNumber(chosen.a)}x${limitPower(chosen.n)} in the numerator and ${chosen.b}x${limitPower(chosen.m)} in the denominator (degrees ${chosen.n} and ${chosen.m}). As x approaches +∞, which end behavior is correct?`,
    choices,
  );
}

function limitContinuityMcqVariant(rand: () => number): LimitGeneratedVariant {
  const chosen = chooseLimitCase(rand, LIMIT_CONTINUITY_CASES);
  const limit = signedLimitNumber(chosen.limit);
  const point = signedLimitNumber(chosen.point);
  const continuous = chosen.limit === chosen.point;
  const truth = continuous
    ? `continuous; the limit and f(${signedLimitNumber(chosen.at)}) both equal ${limit}`
    : `not continuous; the limit is ${limit} but f(${signedLimitNumber(chosen.at)}) is ${point}`;
  const distractors: LimitChoice[] = continuous
    ? [
        { label: "not continuous; every checked point is a break", correct: false, feedback: "Checking a point does not create a break; here the value matches the limit." },
        { label: "not continuous; equal values force a hole", correct: false, feedback: "Equal limit and function values satisfy the point condition for continuity." },
        { label: "not continuous; only one-sided limits count", correct: false, feedback: "The stated two-sided limit exists and agrees with the point value." },
      ]
    : [
        { label: `continuous; a finite limit ${limit} is enough`, correct: false, feedback: "Continuity also requires the limit to equal the actual function value." },
        { label: `continuous; use only the point value ${point}`, correct: false, feedback: "The point value alone cannot establish continuity; it must match the limit." },
        { label: "continuous; any two finite values qualify", correct: false, feedback: "The two finite values must be equal, not merely defined." },
      ];
  return limitMcq(rand,
    `At x = ${signedLimitNumber(chosen.at)}, the two-sided limit is ${limit} and f(${signedLimitNumber(chosen.at)}) = ${point}. Is f continuous there?`,
    [{ label: truth, correct: true, feedback: continuous ? "Correct. The limit exists and equals the function value." : "Correct. Continuity fails when the limit and function value differ." }, ...distractors],
  );
}

function limitContinuityNumericVariant(rand: () => number): LimitGeneratedVariant {
  const chosen = chooseLimitCase(rand, LIMIT_CONTINUITY_PARAMETER_CASES);
  const answer = chosen.m * chosen.at + chosen.b;
  const sign = chosen.b < 0 ? `− ${Math.abs(chosen.b)}` : `+ ${chosen.b}`;
  const widget = {
    type: "exactNumberLab" as const,
    prompt: `For x < ${signedLimitNumber(chosen.at)}, f(x) = ${signedLimitNumber(chosen.m)}x ${sign}; define f(${signedLimitNumber(chosen.at)}) = k. What value of k makes f continuous at x = ${signedLimitNumber(chosen.at)}?`,
    task: "approximationEvaluate" as const,
    values: [],
    approxConstants: [
      { id: "m", label: "the branch slope", value: chosen.m },
      { id: "a", label: "the boundary input", value: chosen.at },
      { id: "b", label: "the branch intercept", value: chosen.b },
    ],
    approxFormula: {
      op: "add" as const,
      left: { op: "multiply" as const, left: { op: "const" as const, id: "m" }, right: { op: "const" as const, id: "a" } },
      right: { op: "const" as const, id: "b" },
    },
    approxRound: 0, answerMode: "numeric" as const, tolerance: 0,
    numericErrors: [chosen.at, chosen.m * chosen.at, chosen.b]
      .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
      .map((value) => ({ value, feedback: "For continuity, k must equal the branch's limiting value at the boundary." })),
    choices: [], authoredStages: [], requiredStageKeys: [], requiredExplorations: 1,
    explorationFeedback: "Evaluate the approaching branch at the boundary before checking k.",
    fallbackFeedback: `The branch approaches ${signedLimitNumber(chosen.m)}(${signedLimitNumber(chosen.at)}) ${sign} = ${signedLimitNumber(answer)}, so k = ${signedLimitNumber(answer)}.`,
    successFeedback: `Setting k = ${signedLimitNumber(answer)} makes the value match the limit.`,
  };
  return { tag: "g12-limits-continuity", widget, answer };
}

function limitDiscontinuityNumericVariant(rand: () => number): LimitGeneratedVariant {
  const chosen = chooseLimitCase(rand, LIMIT_FACTOR_CASES);
  const answer = chosen.at - chosen.other;
  const cancelled = limitLinearFactor(chosen.at);
  const remaining = limitLinearFactor(chosen.other);
  return limitNumeric(
    `A graph has a removable hole at x = ${signedLimitNumber(chosen.at)} from [${cancelled}${remaining}]/${cancelled}. What is the hole's y-value?`,
    answer,
    [0, chosen.at, chosen.other],
    `Cancel the common factor, then evaluate ${remaining} at x = ${signedLimitNumber(chosen.at)} to get ${signedLimitNumber(answer)}.`,
  );
}

function limitDiscontinuityMcqVariant(rand: () => number): LimitGeneratedVariant {
  const chosen = chooseLimitCase(rand, LIMIT_DISCONTINUITY_CASES);
  const at = signedLimitNumber(chosen.at);
  const prompt = chosen.kind === "removable"
    ? `At x = ${at}, a finite two-sided limit ${signedLimitNumber(chosen.first)} exists, but the point is missing. Which discontinuity is shown?`
    : chosen.kind === "jump"
      ? `At x = ${at}, the left-hand limit is ${signedLimitNumber(chosen.first)} and the right-hand limit is ${signedLimitNumber(chosen.second)}. Which discontinuity is shown?`
      : `At x = ${at}, the function values grow without bound beside a vertical asymptote. Which discontinuity is shown?`;
  const truth = `${chosen.kind} discontinuity at x = ${at}`;
  return limitMcq(rand, prompt, ["removable", "jump", "infinite"].map((kind) => ({
    label: `${kind} discontinuity at x = ${at}`,
    correct: kind === chosen.kind,
    feedback: kind === chosen.kind ? `Correct. This is a ${truth}.` : "Recheck whether the graph has a finite hole, disagreeing sides, or unbounded behavior.",
  })) as LimitChoice[]);
}

function limitIvtMcqVariant(rand: () => number): LimitGeneratedVariant {
  const chosen = chooseLimitCase(rand, LIMIT_IVT_CASES);
  const truth = `at least one root lies in (${chosen.a}, ${chosen.b})`;
  return limitMcq(rand,
    `A function is continuous on [${chosen.a}, ${chosen.b}], with f(${chosen.a}) = ${signedLimitNumber(chosen.fa)} and f(${chosen.b}) = ${signedLimitNumber(chosen.fb)}. What does the Intermediate Value Theorem guarantee?`,
    [
      { label: truth, correct: true, feedback: "Correct. Opposite endpoint signs force the continuous graph to cross zero inside the interval." },
      { label: `exactly one root lies in (${chosen.a}, ${chosen.b})`, correct: false, feedback: "The theorem guarantees at least one crossing, not uniqueness." },
      { label: `a root must occur at x = ${chosen.a}`, correct: false, feedback: "The endpoint value is nonzero; the guaranteed root lies strictly inside." },
      { label: `no root is forced in (${chosen.a}, ${chosen.b})`, correct: false, feedback: "Continuity plus opposite endpoint signs does force an interior zero." },
    ],
  );
}

function limitIvtNumericVariant(rand: () => number): LimitGeneratedVariant {
  const chosen = chooseLimitCase(rand, LIMIT_IVT_EVALUATION_CASES);
  const answer = chosen.x ** 2 - chosen.c;
  const cSign = chosen.c < 0 ? `+ ${Math.abs(chosen.c)}` : `− ${chosen.c}`;
  const widget = {
    type: "exactNumberLab" as const,
    prompt: `For the IVT sign check, let f(x) = x² ${cSign}. Compute f(${signedLimitNumber(chosen.x)}).`,
    task: "approximationEvaluate" as const,
    values: [],
    approxConstants: [
      { id: "x", label: "the endpoint input", value: chosen.x },
      { id: "c", label: "the subtracted constant", value: chosen.c },
    ],
    approxFormula: {
      op: "subtract" as const,
      left: { op: "multiply" as const, left: { op: "const" as const, id: "x" }, right: { op: "const" as const, id: "x" } },
      right: { op: "const" as const, id: "c" },
    },
    approxRound: 0, answerMode: "numeric" as const, tolerance: 0,
    numericErrors: [chosen.x - chosen.c, chosen.x ** 2, -chosen.c]
      .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
      .map((value) => ({ value, feedback: "Square the endpoint input first, then subtract the signed constant exactly as printed." })),
    choices: [], authoredStages: [], requiredStageKeys: [], requiredExplorations: 1,
    explorationFeedback: "Evaluate the endpoint value before using its sign in the IVT argument.",
    fallbackFeedback: `Square the endpoint input first: f(${signedLimitNumber(chosen.x)}) = (${signedLimitNumber(chosen.x)})² ${cSign} = ${chosen.x ** 2} ${cSign} = ${signedLimitNumber(answer)}.`,
    successFeedback: `The endpoint value is ${signedLimitNumber(answer)}.`,
  };
  return { tag: "g12-limits-continuity", widget, answer };
}

function limitAverageRateNumericVariant(rand: () => number): LimitGeneratedVariant {
  const chosen = chooseLimitCase(rand, LIMIT_AVG_RATE_CASES);
  const answer = chosen.q * (chosen.a + chosen.b) + chosen.m;
  const run = chosen.b - chosen.a;
  const rise = answer * run;
  return limitNumeric(
    `For f(x) = ${limitPolynomial(chosen.q, chosen.m, chosen.c)}, find the average rate of change on [${chosen.a}, ${chosen.b}].`,
    answer,
    [rise, run, chosen.q * chosen.a ** 2 + chosen.m * chosen.a + chosen.c],
    `Use [f(${chosen.b}) − f(${chosen.a})]/(${chosen.b} − ${chosen.a}); the secant slope is ${answer}.`,
  );
}

function limitAverageRateMcqVariant(rand: () => number): LimitGeneratedVariant {
  const chosen = chooseLimitCase(rand, LIMIT_AVG_RATE_CASES);
  const answer = chosen.q * (chosen.a + chosen.b) + chosen.m;
  const run = chosen.b - chosen.a;
  const rise = answer * run;
  const distractors = distinctLimitNumbers(answer, [rise, run, chosen.q * chosen.a + chosen.m]);
  return limitMcq(rand,
    `For f(x) = ${limitPolynomial(chosen.q, chosen.m, chosen.c)} on [${chosen.a}, ${chosen.b}], which average rate of change is correct?`,
    [
      { label: `average rate = ${answer}`, correct: true, feedback: `Correct. The secant slope [f(${chosen.b}) − f(${chosen.a})]/(${run}) equals ${answer}.` },
      ...distractors.map((value) => ({ label: `average rate = ${value}`, correct: false, feedback: "Compute the endpoint rise, then divide by the full interval width." })),
    ],
  );
}

function limitDerivativeMcqVariant(rand: () => number): LimitGeneratedVariant {
  const chosen = chooseLimitCase(rand, LIMIT_DERIVATIVE_CASES);
  const derivative = limitLinearExpression(2 * chosen.q, chosen.m);
  const quotient = `${derivative} + ${chosen.q === 1 ? "" : chosen.q}h`;
  const functionAtA = limitPolynomial(chosen.q, chosen.m, chosen.c).replaceAll("x", "a");
  return limitMcq(rand,
    `For f(x) = ${limitPolynomial(chosen.q, chosen.m, chosen.c)}, the difference quotient simplifies to ${quotient}. As h approaches 0, which formula is f′(a)?`,
    [
      { label: `f′(a) = ${derivative}`, correct: true, feedback: "Correct. Taking h to 0 removes the remaining h-term." },
      { label: `f′(a) = ${limitLinearExpression(chosen.q, chosen.m)}`, correct: false, feedback: "The quadratic term contributes twice its coefficient after the limit." },
      { label: `f′(a) = ${limitLinearExpression(2 * chosen.q, chosen.m + chosen.q)}`, correct: false, feedback: "The h-term approaches 0; it does not become its coefficient." },
      { label: `f′(a) = ${functionAtA}`, correct: false, feedback: "That is f(a), the function value, not the limit of the difference quotient." },
    ],
  );
}

function limitDerivativeNumericVariant(rand: () => number): LimitGeneratedVariant {
  const chosen = chooseLimitCase(rand, LIMIT_DERIVATIVE_CASES);
  const answer = 2 * chosen.q * chosen.at + chosen.m;
  const functionValue = chosen.q * chosen.at ** 2 + chosen.m * chosen.at + chosen.c;
  return limitNumeric(
    `For f(x) = ${limitPolynomial(chosen.q, chosen.m, chosen.c)}, use the difference-quotient limit to find f′(${chosen.at}).`,
    answer,
    [functionValue, chosen.q * chosen.at + chosen.m, 2 * chosen.q * chosen.at],
    `The limit gives f′(x) = ${limitLinearExpression(2 * chosen.q, chosen.m, "x")}; at x = ${chosen.at}, f′(${chosen.at}) = ${answer}.`,
  );
}

/** GRB-02 (S331): an approxConstant whose exact value terminates within five decimals is stored
 * exactly; otherwise it is stored to five decimal places and the label states that convention. */
const seriesConstant = (id: string, name: string, num: number, den: number) => {
  const exact = num / den;
  const five = Number(exact.toFixed(5));
  return five === exact
    ? { id, label: `${name} ${num}/${den}`, value: exact }
    : { id, label: `${name} ${num}/${den} (to five decimal places)`, value: five };
};

const limitSeriesParts = (chosen: typeof LIMIT_SERIES_CASES[number]) => {
  const first = chosen.aNum / chosen.aDen;
  const ratio = chosen.rNum / chosen.rDen;
  const answer = Number((first / (1 - ratio)).toFixed(3));
  return { first, ratio, answer, firstText: `${chosen.aNum}/${chosen.aDen}`, ratioText: `${chosen.rNum}/${chosen.rDen}` };
};

function limitSeriesNumericVariant(rand: () => number): LimitGeneratedVariant {
  const chosen = chooseLimitCase(rand, LIMIT_SERIES_CASES);
  const { first, ratio, answer, firstText, ratioText } = limitSeriesParts(chosen);
  const widget = {
    type: "exactNumberLab" as const,
    prompt: `A geometric series has first term ${firstText} and common ratio ${ratioText}. Find its infinite sum a/(1 − r). Give a decimal to three places.`,
    task: "approximationEvaluate" as const,
    values: [],
    /* GRB-02 (S331): the stage text prints `<label> = <value>`, so a third stored at full float
     * precision put "0.333333333333" on screen with no stated convention. Non-terminating
     * fractions are now stored to five decimal places WITH the convention stated in the label;
     * terminating ones stay exact. The 1e-5 perturbation cannot move any case's three-decimal
     * rounded sum (all sums land on clean multiples of 0.05). */
    approxConstants: [
      seriesConstant("a", "the first term", chosen.aNum, chosen.aDen),
      seriesConstant("r", "the common ratio", chosen.rNum, chosen.rDen),
    ],
    approxFormula: {
      op: "divide" as const,
      left: { op: "const" as const, id: "a" },
      right: { op: "subtract" as const, left: { op: "lit" as const, value: 1 }, right: { op: "const" as const, id: "r" } },
    },
    approxRound: 3,
    answerMode: "numeric" as const,
    tolerance: 0.0005,
    numericErrors: distinctLimitNumbers(answer, [first, ratio, first / ratio]).map((value) => ({
      value,
      feedback: "Use the first term divided by 1 minus the common ratio; do not report a single term or the ratio.",
    })),
    choices: [], authoredStages: [], requiredStageKeys: [], requiredExplorations: 1,
    explorationFeedback: "Identify the first term and common ratio before evaluating the limiting sum.",
    fallbackFeedback: `Use a/(1 − r): (${firstText})/(1 − ${ratioText}) = ${answer}.`,
    successFeedback: `The partial sums approach ${answer}.`,
  };
  return { tag: "g12-limits-continuity", widget, answer };
}

function limitSeriesMcqVariant(rand: () => number): LimitGeneratedVariant {
  const chosen = chooseLimitCase(rand, LIMIT_SERIES_CASES);
  const { first, ratio, answer, firstText, ratioText } = limitSeriesParts(chosen);
  const distractors = distinctLimitNumbers(answer, [first, ratio, first / ratio]);
  return limitMcq(rand,
    `A geometric series has first term ${firstText} and common ratio ${ratioText}. Which infinite sum is correct?`,
    [
      { label: `sum = ${decimalLimitNumber(answer)}`, correct: true, feedback: `Correct. a/(1 − r) = (${firstText})/(1 − ${ratioText}) = ${decimalLimitNumber(answer)}.` },
      ...distractors.map((value) => ({ label: `sum = ${decimalLimitNumber(value)}`, correct: false, feedback: "Use a/(1 − r), not a single term, the ratio, or a/r." })),
    ],
  );
}
function limitsContinuityVariant(rand: () => number, requestedForm: string): LimitGeneratedVariant | null {
  // The registry-wide generator gate also exercises the legacy bare/default
  // route. Keep it on the same prompt-derived contract as the declared
  // consumers instead of falling back to the small authored template bank.
  if (requestedForm === "default") return limitAverageRateMcqVariant(rand);
  if (requestedForm === LIMIT_IDEA_MCQ_FORM) return limitIdeaMcqVariant(rand);
  if (requestedForm === LIMIT_IDEA_NUMERIC_FORM) return limitIdeaNumericVariant(rand);
  if (requestedForm === LIMIT_READ_NUMERIC_FORM) return limitReadNumericVariant(rand);
  if (requestedForm === LIMIT_DNE_MCQ_FORM) return limitDneMcqVariant(rand);
  if (requestedForm === LIMIT_DNE_NUMERIC_FORM) return limitDneNumericVariant(rand);
  if (requestedForm === LIMIT_FACTOR_NUMERIC_FORM) return limitFactorNumericVariant(rand);
  if (requestedForm === LIMIT_RATIONALIZE_MCQ_FORM) return limitRationalizeMcqVariant(rand);
  if (requestedForm === LIMIT_RATIONALIZE_NUMERIC_FORM) return limitRationalizeNumericVariant(rand);
  if (requestedForm === LIMIT_ONESIDED_MCQ_FORM) return limitOneSidedMcqVariant(rand);
  if (requestedForm === LIMIT_ONESIDED_NUMERIC_FORM) return limitOneSidedNumericVariant(rand);
  if (requestedForm === LIMIT_INFINITY_NUMERIC_FORM) return limitInfinityNumericVariant(rand);
  if (requestedForm === LIMIT_ENDBEHAVIOR_MCQ_FORM) return limitEndBehaviorMcqVariant(rand);
  if (requestedForm === LIMIT_CONTINUITY_MCQ_FORM) return limitContinuityMcqVariant(rand);
  if (requestedForm === LIMIT_CONTINUITY_NUMERIC_FORM) return limitContinuityNumericVariant(rand);
  if (requestedForm === LIMIT_DISCONTINUITY_MCQ_FORM) return limitDiscontinuityMcqVariant(rand);
  if (requestedForm === LIMIT_DISCONTINUITY_NUMERIC_FORM) return limitDiscontinuityNumericVariant(rand);
  if (requestedForm === LIMIT_IVT_MCQ_FORM) return limitIvtMcqVariant(rand);
  if (requestedForm === LIMIT_IVT_NUMERIC_FORM) return limitIvtNumericVariant(rand);
  if (requestedForm === LIMIT_AVG_RATE_MCQ_FORM) return limitAverageRateMcqVariant(rand);
  if (requestedForm === LIMIT_AVG_RATE_NUMERIC_FORM) return limitAverageRateNumericVariant(rand);
  if (requestedForm === LIMIT_DERIVATIVE_MCQ_FORM) return limitDerivativeMcqVariant(rand);
  if (requestedForm === LIMIT_DERIVATIVE_NUMERIC_FORM) return limitDerivativeNumericVariant(rand);
  if (requestedForm === LIMIT_SERIES_MCQ_FORM) return limitSeriesMcqVariant(rand);
  if (requestedForm === LIMIT_SERIES_NUMERIC_FORM) return limitSeriesNumericVariant(rand);
  return null;
}

/* ------------------------------------------------------------------------------------------------
 * S331 / lane G1. The twelve numeric g12-trig-identities-equations forms drew from 1–4 fixed
 * authored rows, so reseeding repeated identical problems and every declared step failed the
 * resolver freshness gate. Each variant function below draws a genuine trigonometric state — a
 * Pythagorean triple behind sin θ, a factorable equation with different solution sets, a
 * different special angle — that changes the answer. Every trap is the number a named wrong move
 * actually produces with the drawn values. precalculusIndependent.cjs re-derives every answer
 * from the printed prompt (integer search for the hidden leg, literal numeric evaluation of the
 * printed expression, or a half-integer scan of the substituted quadratic).
 * ------------------------------------------------------------------------------------------------ */

const TI_FORM = (stem: string): string => `trig-identities-equations__${stem}__numeric`;
const tiRound = (x: number, dp: number): number => Math.round(x * 10 ** dp) / 10 ** dp;
const TI_TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]] as const;
const tiPick = <T,>(rand: () => number, xs: readonly T[]): T => xs[Math.floor(rand() * xs.length)]!;
type TiVariant = { tag: "g12-trig-identities-equations"; widget: any; answer: number };

/** Interpolated negative numbers arrive with an ASCII hyphen; the bank's typography uses −. */
const tiMinus = (text: string): string => text.replace(/-(?=\d|\()/g, "−");
/** Mirrors the authored-bank feedback floor: terse-but-true lines get a closing instruction
 * instead of tripping the 25-character diagnostic-quality gate. */
const tiPad = (text: string): string => (text.length < 25 ? `${text} Rebuild it from the printed values.` : text);

function tiNumeric(prompt: string, answer: number, tolerance: number, commonErrors: Array<{ value: number; feedback: string }>, fallbackFeedback: string): TiVariant {
  return {
    tag: "g12-trig-identities-equations",
    widget: {
      type: "numeric" as const,
      prompt: tiMinus(prompt),
      answer,
      tolerance,
      commonErrors: commonErrors.map((e) => ({ value: e.value, feedback: tiMinus(tiPad(e.feedback)) })),
      fallbackFeedback: tiMinus(tiPad(fallbackFeedback)),
    },
    answer,
  };
}

function tiDoubleBasicVariant(rand: () => number): TiVariant {
  const [p, q, c] = tiPick(rand, TI_TRIPLES);
  const [o, adj] = rand() < 0.5 ? [p, q] : [q, p];
  const job = Math.floor(rand() * 3);
  if (job === 0) {
    const answer = tiRound((adj * adj - o * o) / (c * c), 4);
    return tiNumeric(
      `θ is acute with sin θ = ${o}/${c}. What is cos 2θ, to four decimals?`,
      answer,
      0.0005,
      [
        { value: tiRound(answer / 2, 4), feedback: `${tiRound(answer / 2, 4)} halves the answer. cos 2θ = cos²θ − sin²θ = ${adj * adj}/${c * c} − ${o * o}/${c * c} = ${adj * adj - o * o}/${c * c} ≈ ${answer}.` },
        { value: -answer, feedback: `${-answer} flips the sign of cos²θ − sin²θ = (${adj * adj} − ${o * o})/${c * c} ≈ ${answer}.` },
      ],
      `cos 2θ = cos²θ − sin²θ = (${adj * adj} − ${o * o})/${c * c} ≈ ${answer}.`
    );
  }
  if (job === 1) {
    const answer = tiRound((-2 * o * adj) / (c * c), 4);
    return tiNumeric(
      `θ is in Quadrant II with sin θ = ${o}/${c}. What is sin 2θ, to four decimals?`,
      answer,
      0.0005,
      [
        { value: -answer, feedback: `In Q2 cos θ is NEGATIVE (−${adj}/${c}), so sin 2θ = 2·(${o}/${c})·(−${adj}/${c}) = −${2 * o * adj}/${c * c} ≈ ${answer}.` },
        { value: tiRound(-o / c, 4), feedback: `${tiRound(-o / c, 4)} is −sin θ. Apply the full formula with cos θ = −${adj}/${c}: −${2 * o * adj}/${c * c} ≈ ${answer}.` },
      ],
      `sin 2θ = 2 sin θ cos θ = 2(${o}/${c})(−${adj}/${c}) = −${2 * o * adj}/${c * c} ≈ ${answer}.`
    );
  }
  const num = 2 * o * adj;
  const den = adj * adj - o * o;
  const answer = tiRound(num / den, 4);
  const tanFrac = den < 0 ? `−${num}/${-den}` : `${num}/${den}`;
  const cosFrac = den < 0 ? `−${-den}/${c * c}` : `${den}/${c * c}`;
  return tiNumeric(
    `θ is acute with sin θ = ${o}/${c}. Find tan 2θ, to four decimals.`,
    answer,
    0.0005,
    [
      { value: tiRound(o / adj, 4), feedback: `That is tan θ = ${o}/${adj} itself. tan 2θ is the doubled-angle tangent: ${tanFrac} ≈ ${answer}.` },
      { value: tiRound(num / (c * c), 4), feedback: `${tiRound(num / (c * c), 4)} = ${num}/${c * c} is sin 2θ. Divide by cos 2θ = ${cosFrac}: tan 2θ ≈ ${answer}.` },
    ],
    `tan 2θ = sin 2θ/cos 2θ = ${tanFrac} ≈ ${answer}.`
  );
}

function tiCos2FormsVariant(rand: () => number): TiVariant {
  const job = Math.floor(rand() * 3);
  if (job === 0) {
    const s = tiPick(rand, [0.6, 0.8, 0.28, 0.96] as const);
    const s2 = tiRound(s * s, 4);
    const answer = tiRound(1 - 2 * s * s, 4);
    return tiNumeric(
      `With sin θ = ${s}, use 1 − 2sin²θ to find cos 2θ, to four decimals.`,
      answer,
      0.0005,
      [
        { value: tiRound(1 - s * s, 4), feedback: `${tiRound(1 - s * s, 4)} = 1 − ${s2} forgets the factor 2: 1 − 2(${s2}) = ${answer}.` },
        { value: tiRound(2 * s * s, 4), feedback: `${tiRound(2 * s * s, 4)} = 2sin²θ is the piece being SUBTRACTED: 1 − ${tiRound(2 * s * s, 4)} = ${answer}.` },
      ],
      `cos 2θ = 1 − 2sin²θ = 1 − 2(${s2}) = ${answer}.`
    );
  }
  if (job === 1) {
    const [xs, cos2x, answer] = tiPick(rand, [["π/6", 0.5, 0.25], ["π/3", -0.5, 0.75]] as const);
    const doubled = xs === "π/6" ? "π/3" : "2π/3";
    return tiNumeric(
      `Use sin²θ = (1 − cos 2θ)/2 to find sin²(${xs}).`,
      answer,
      0.005,
      [
        { value: tiRound(1 - cos2x, 4), feedback: `${tiRound(1 - cos2x, 4)} = 1 − cos(${doubled}) before halving: (1 − ${cos2x === 0.5 ? "1/2" : "(−1/2)"})/2 = ${answer}.` },
        { value: tiRound((1 + cos2x) / 2, 4), feedback: `${tiRound((1 + cos2x) / 2, 4)} uses the cosine half-angle form (1 + cos 2θ)/2. Sine's version subtracts: (1 − ${cos2x === 0.5 ? "1/2" : "(−1/2)"})/2 = ${answer}.` },
      ],
      `cos(${doubled}) = ${cos2x === 0.5 ? "1/2" : "−1/2"}, so sin²(${xs}) = (1 − ${cos2x === 0.5 ? "1/2" : "(−1/2)"})/2 = ${answer}.`
    );
  }
  const n = tiPick(rand, [3, 4, 5, 6] as const);
  const answer = tiRound(2 / (n * n) - 1, 4);
  return tiNumeric(
    `θ has cos θ = 1/${n}. Find cos 2θ using the cosine-only form, to four decimals.`,
    answer,
    0.0005,
    [
      { value: -answer, feedback: `${-answer} flips the sign: 2(1/${n * n}) − 1 = ${2 - n * n}/${n * n} ≈ ${answer}, negative.` },
      { value: tiRound(-1 / n, 4), feedback: `That echoes −1/${n}, the given value with a stray sign. Apply the form: 2(1/${n * n}) − 1 ≈ ${answer}.` },
    ],
    `cos 2θ = 2cos²θ − 1 = 2(1/${n * n}) − 1 = ${2 - n * n}/${n * n} ≈ ${answer}.`
  );
}

/** 2cos²x + b·sin x + c = 0 states whose substituted quadratic factors over halves.
 * roots lists the sine-values; count/sum are derived from the [0, 2π) solution sets. */
const TI_QUAD_STATES = [
  { b: 3, c: -3, roots: [0.5, 1], count: 3, sum: (3 * Math.PI) / 2, pair: "π/6, 5π/6", pairFrom: "sin x = 1/2", single: "π/2", singleFrom: "sin x = 1" },
  { b: 1, c: -1, roots: [-0.5, 1], count: 3, sum: (7 * Math.PI) / 2, pair: "7π/6, 11π/6", pairFrom: "sin x = −1/2", single: "π/2", singleFrom: "sin x = 1" },
  { b: -1, c: -1, roots: [0.5, -1], count: 3, sum: (5 * Math.PI) / 2, pair: "π/6, 5π/6", pairFrom: "sin x = 1/2", single: "3π/2", singleFrom: "sin x = −1" },
  { b: 5, c: -4, roots: [0.5, 2], count: 2, sum: Math.PI, pair: "π/6, 5π/6", pairFrom: "sin x = 1/2", single: "", singleFrom: "sin x = 2" },
  { b: -3, c: 0, roots: [0.5, -2], count: 2, sum: Math.PI, pair: "π/6, 5π/6", pairFrom: "sin x = 1/2", single: "", singleFrom: "sin x = −2" },
  { b: 7, c: -5, roots: [0.5, 3], count: 2, sum: Math.PI, pair: "π/6, 5π/6", pairFrom: "sin x = 1/2", single: "", singleFrom: "sin x = 3" },
] as const;

function tiQuadEquationText(b: number, c: number): string {
  const bCoeff = Math.abs(b) === 1 ? "" : String(Math.abs(b));
  const bPart = `${b < 0 ? "−" : "+"} ${bCoeff}sin x`;
  const cPart = c === 0 ? "" : ` ${c < 0 ? "−" : "+"} ${Math.abs(c)}`;
  return `2cos²x ${bPart}${cPart} = 0`;
}

function tiConvertSolveVariant(rand: () => number): TiVariant {
  const sumJob = rand() < 0.5;
  if (sumJob) {
    const state = tiPick(rand, TI_QUAD_STATES.slice(0, 3));
    const answer = tiRound(state.sum, 4);
    const pairSum = tiRound(Math.PI, 4);
    const singleValue = tiRound(state.single === "π/2" ? Math.PI / 2 : (3 * Math.PI) / 2, 4);
    const pairSumActual = state.pairFrom === "sin x = −1/2" ? tiRound(3 * Math.PI, 4) : pairSum;
    return tiNumeric(
      `Sum the solutions of ${tiQuadEquationText(state.b, state.c)} on [0, 2π), to four decimals.`,
      answer,
      0.001,
      [
        { value: pairSumActual, feedback: `${pairSumActual} sums only the ${state.pairFrom} pair (${state.pair}). Add ${state.single} from ${state.singleFrom}: ≈ ${answer}.` },
        { value: singleValue, feedback: `${singleValue} = ${state.single} counts only ${state.singleFrom}. Add the ${state.pairFrom} pair (${state.pair}): ≈ ${answer}.` },
      ],
      `${state.pairFrom} gives ${state.pair}; ${state.singleFrom} gives ${state.single}. The sum is ≈ ${answer}.`
    );
  }
  const state = tiPick(rand, TI_QUAD_STATES);
  const answer = state.count;
  const traps = answer === 3
    ? [
        { value: 2, feedback: `${state.pairFrom} gives TWO (${state.pair}), and ${state.singleFrom} adds ${state.single}: three.` },
        { value: 4, feedback: `${state.singleFrom} has exactly one solution (${state.single}). Total with the ${state.pairFrom} pair: three.` },
      ]
    : [
        { value: 4, feedback: `${state.singleFrom} has NO solutions — a sine value must stay within [−1, 1]. Only the ${state.pairFrom} pair counts: two.` },
        { value: 1, feedback: `${state.pairFrom} gives a PAIR (${state.pair}), so the equation has two solutions, and the ${state.singleFrom} branch is impossible.` },
      ];
  return tiNumeric(
    `How many solutions does ${tiQuadEquationText(state.b, state.c)} have on [0, 2π)?`,
    answer,
    0,
    traps,
    `Substituting cos²x = 1 − sin²x leaves a quadratic whose valid sine values give ${answer} solutions.`
  );
}

/** Factoring states: f(x) = 0 with the tempting divide-by-a-factor mistake, plus square-and-check
 * states whose squared version invites an extraneous root. */
const TI_FACTOR_STATES = [
  { eq: "sin x cos x = sin x", count: 2, sols: "0 and π", divisor: "sin x", kept: "sin x = 0", keptSols: "0, π", other: "cos x = 1", otherSols: "0", overlap: true, keptSum: Math.PI, otherSum: 0 },
  { eq: "sin x cos x = −sin x", count: 2, sols: "0 and π", divisor: "sin x", kept: "sin x = 0", keptSols: "0, π", other: "cos x = −1", otherSols: "π", overlap: true, keptSum: Math.PI, otherSum: Math.PI },
  { eq: "2 sin x cos x = sin x", count: 4, sols: "0, π, π/3, 5π/3", divisor: "sin x", kept: "sin x = 0", keptSols: "0, π", other: "cos x = 1/2", otherSols: "π/3, 5π/3", overlap: false, keptSum: Math.PI, otherSum: 2 * Math.PI },
  { eq: "2 sin x cos x = cos x", count: 4, sols: "π/2, 3π/2, π/6, 5π/6", divisor: "cos x", kept: "cos x = 0", keptSols: "π/2, 3π/2", other: "sin x = 1/2", otherSols: "π/6, 5π/6", overlap: false, keptSum: 2 * Math.PI, otherSum: Math.PI },
  { eq: "2 sin x cos x = −cos x", count: 4, sols: "π/2, 3π/2, 7π/6, 11π/6", divisor: "cos x", kept: "cos x = 0", keptSols: "π/2, 3π/2", other: "sin x = −1/2", otherSols: "7π/6, 11π/6", overlap: false, keptSum: 2 * Math.PI, otherSum: 3 * Math.PI },
] as const;
const TI_EXTRANEOUS_STATES = [
  { eq: "cos x = 1 − sin x", valid: "0 and π/2", count: 2, extraneous: "π", validSum: Math.PI / 2, sumWithExtra: (3 * Math.PI) / 2 },
  { eq: "sin x = 1 − cos x", valid: "0 and π/2", count: 2, extraneous: "3π/2", validSum: Math.PI / 2, sumWithExtra: 2 * Math.PI },
  { eq: "cos x = sin x − 1", valid: "π/2 and π", count: 2, extraneous: "0", validSum: (3 * Math.PI) / 2, sumWithExtra: (3 * Math.PI) / 2 },
] as const;

function tiRootTrapsVariant(rand: () => number): TiVariant {
  const job = Math.floor(rand() * 3);
  if (job === 0) {
    const state = tiPick(rand, TI_EXTRANEOUS_STATES);
    return tiNumeric(
      `After rejecting the extraneous root, how many valid solutions does ${state.eq} have on [0, 2π)?`,
      state.count,
      0,
      [
        { value: state.count + 1, feedback: `x = ${state.extraneous} fails the check in the original equation. Only x = ${state.valid} survive: two.` },
        { value: state.count - 1, feedback: `Both x = ${state.valid} satisfy the original equation: two valid roots.` },
      ],
      `Squaring invites x = ${state.extraneous}, which fails the original equation; x = ${state.valid} remain.`
    );
  }
  if (job === 1) {
    const state = tiPick(rand, TI_FACTOR_STATES);
    const traps = state.count === 4
      ? [
          { value: 2, feedback: `Dividing by ${state.divisor} loses the ${state.kept} pair (${state.keptSols}). Factoring keeps all four: ${state.sols}.` },
          { value: 3, feedback: `${state.other} gives TWO solutions (${state.otherSols}) and ${state.kept} gives two more (${state.keptSols}): four.` },
        ]
      : [
          { value: 1, feedback: `Dividing by ${state.divisor} keeps only ${state.other} (x = ${state.otherSols}). Factoring keeps ${state.kept} too: ${state.sols}, two distinct.` },
          { value: 3, feedback: `${state.other} gives x = ${state.otherSols}, which ${state.kept} ALSO gives — they overlap. Distinct solutions: ${state.sols}, so two.` },
        ];
    return tiNumeric(
      `Solve ${state.eq} on [0, 2π) by FACTORING. How many distinct solutions?`,
      state.count,
      0,
      traps,
      `Factoring gives ${state.kept} (${state.keptSols}) and ${state.other} (${state.otherSols || "no new x"}): ${state.count} distinct solutions.`
    );
  }
  const state = tiPick(rand, TI_FACTOR_STATES.slice(2));
  const keptSum = tiRound(state.keptSum, 4);
  const otherSum = tiRound(state.otherSum, 4);
  const answer = tiRound(state.keptSum + state.otherSum, 4);
  return tiNumeric(
    `Solve ${state.eq} on [0, 2π) by factoring. Sum the solutions, to four decimals.`,
    answer,
    0.001,
    [
      { value: otherSum, feedback: `${otherSum} sums only ${state.other} (${state.otherSols}). Include the ${state.kept} pair (${state.keptSols}): ≈ ${answer}.` },
      { value: keptSum, feedback: `${keptSum} sums only ${state.kept} (${state.keptSols}) — dividing by ${state.divisor} loses nothing there, but drops ${state.other} (${state.otherSols}): ≈ ${answer}.` },
    ],
    `${state.kept} gives ${state.keptSols}; ${state.other} gives ${state.otherSols}. All four sum to ≈ ${answer}.`
  );
}

function tiGeneralVariant(rand: () => number): TiVariant {
  const sumJob = rand() < 0.5;
  const fn = tiPick(rand, ["sin", "cos"] as const);
  if (sumJob) {
    const k = tiPick(rand, [1, 2, 3] as const);
    const base = fn === "sin" ? Math.PI : 2 * Math.PI;
    const answer = tiRound(base + 4 * k * Math.PI, 2);
    const baseText = fn === "sin" ? "π/6 + 5π/6 = π" : "π/3 + 5π/3 = 2π";
    const first = fn === "sin" ? tiRound(Math.PI / 6 + 2 * k * Math.PI, 2) : tiRound(Math.PI / 3 + 2 * k * Math.PI, 2);
    const twin = fn === "sin" ? tiRound((5 * Math.PI) / 6 + 2 * k * Math.PI, 2) : tiRound((5 * Math.PI) / 3 + 2 * k * Math.PI, 2);
    return tiNumeric(
      `Sum the solutions of ${fn} x = 1/2 that lie in [${2 * k}π, ${2 * k + 2}π), to hundredths.`,
      answer,
      0.02,
      [
        { value: tiRound(base, 2), feedback: `${tiRound(base, 2)} is the BASE pair's sum (${baseText}). Each member gained ${2 * k}π in this window: total ≈ ${answer}.` },
        { value: first, feedback: `${first} is just one member of the window's pair. Add its twin ≈ ${twin}: ≈ ${answer}.` },
      ],
      `The base pair ${baseText} shifts up by ${2 * k}π each: total ≈ ${answer}.`
    );
  }
  const k = tiPick(rand, [2, 3, 4] as const);
  const answer = 2 * k;
  const traps = k === 2
    ? [
        { value: 2, feedback: `2 is the count in ONE turn [0, 2π). Two turns double it: 4.` },
        { value: 8, feedback: `8 would count four per turn. ${fn === "sin" ? "Sine" : "Cosine"} crosses the line 1/2 exactly twice per turn: 4.` },
      ]
    : [
        { value: 2, feedback: `2 is the count in ONE turn [0, 2π). ${k === 3 ? "Three turns triple" : "Four turns quadruple"} it: ${answer}.` },
        { value: k, feedback: `Each turn contributes TWO solutions (the twins), not one: ${k} turns × 2 = ${answer}.` },
      ];
  return tiNumeric(
    `How many solutions does ${fn} x = 1/2 have on [0, ${2 * k}π)?`,
    answer,
    0,
    traps,
    `${fn === "sin" ? "Sine" : "Cosine"} meets the line 1/2 twice per 2π turn: ${k} × 2 = ${answer}.`
  );
}

function tiTanLadderVariant(rand: () => number): TiVariant {
  const sumJob = rand() < 0.5;
  const c = tiPick(rand, [1, -1] as const);
  const cText = c === 1 ? "1" : "−1";
  if (sumJob) {
    const w = tiPick(rand, [2, 4] as const);
    const rungs: number[] = [];
    let x = c === 1 ? Math.PI / 4 : (3 * Math.PI) / 4;
    while (x < w * Math.PI - 1e-9) {
      rungs.push(x);
      x += Math.PI;
    }
    const answer = tiRound(rungs.reduce((a, b) => a + b, 0), 2);
    const firstRung = tiRound(rungs[0]!, 2);
    const wrongSignFirst = c === 1 ? "3π/4" : "5π/4";
    const wrongSignSum = tiRound(rungs.reduce((a, b) => a + b, 0) + rungs.length * (c === 1 ? Math.PI / 2 : -Math.PI / 2), 2);
    return tiNumeric(
      `Sum the solutions of tan x = ${cText} on [0, ${w}π), to hundredths.`,
      answer,
      0.02,
      [
        { value: firstRung, feedback: `${firstRung} is one rung only. Tangent repeats every π — all ${rungs.length} rungs sum to ≈ ${answer}.` },
        { value: wrongSignSum, feedback: `${wrongSignSum} sums the rungs starting at ${wrongSignFirst}, where tan = ${c === 1 ? "−1" : "+1"}. The tan = ${cText} ladder starts at ${c === 1 ? "π/4" : "3π/4"}: ≈ ${answer}.` },
      ],
      `The ladder starts at ${c === 1 ? "π/4" : "3π/4"} and climbs by π: sum ≈ ${answer}.`
    );
  }
  const w = tiPick(rand, [2, 4, 6] as const);
  return tiNumeric(
    `How many solutions does tan x = ${cText} have on [0, ${w}π)?`,
    w,
    0,
    [
      { value: w / 2, feedback: `${w / 2} counts one solution per 2π — that is sine/cosine pacing. Tangent solves once per π: ${w} in [0, ${w}π).` },
      { value: 2 * w, feedback: `${2 * w} would need period π/2. Tangent's rungs are π apart: ${w}.` },
    ],
    `Tangent hits every value once per π, so [0, ${w}π) holds ${w} solutions.`
  );
}

const TI_RECIPROCAL_EVAL_STATES = [
  { pair: "tan θ · cot θ", g: "cos", xs: "0", gx: 1, special: true },
  { pair: "tan θ · cot θ", g: "cos", xs: "π/3", gx: 0.5, special: false },
  { pair: "sin θ · csc θ", g: "sin", xs: "π/6", gx: 0.5, special: false },
  { pair: "sin θ · csc θ", g: "cos", xs: "π/6", gx: 0.87, special: false },
  { pair: "cos θ · sec θ", g: "sin", xs: "π/3", gx: 0.87, special: false },
] as const;

function tiReciprocalsVariant(rand: () => number): TiVariant {
  if (rand() < 0.5) {
    const [a, b, c] = tiPick(rand, TI_TRIPLES);
    const fn = tiPick(rand, ["cot", "sec", "csc"] as const);
    const answer = tiRound(fn === "cot" ? b / a : fn === "sec" ? c / b : c / a, 2);
    const traps = fn === "cot"
      ? [
          { value: tiRound(a / b, 2), feedback: `${tiRound(a / b, 2)} = ${a}/${b} = tan θ. Cotangent is its RECIPROCAL: ${b}/${a} ≈ ${answer}.` },
          { value: tiRound(c / b, 2), feedback: `${tiRound(c / b, 2)} = sec θ (1/cos). Cotangent is cos/sin = ${b}/${a} ≈ ${answer}.` },
        ]
      : fn === "sec"
        ? [
            { value: tiRound(b / c, 2), feedback: `${tiRound(b / c, 2)} = cos θ. Secant is its reciprocal: ${c}/${b} ≈ ${answer}.` },
            { value: tiRound(c / a, 2), feedback: `${tiRound(c / a, 2)} = csc θ flips SINE. Secant flips cosine: ${c}/${b} ≈ ${answer}.` },
          ]
        : [
            { value: tiRound(a / c, 2), feedback: `${tiRound(a / c, 2)} = sin θ. Cosecant is its reciprocal: ${c}/${a} ≈ ${answer}.` },
            { value: tiRound(c / b, 2), feedback: `${tiRound(c / b, 2)} = sec θ flips COSINE. Cosecant flips sine: ${c}/${a} ≈ ${answer}.` },
          ];
    return tiNumeric(
      `sin θ = ${a}/${c} and cos θ = ${b}/${c}. What is ${fn} θ? (As a decimal to hundredths.)`,
      answer,
      0.005,
      traps,
      `${fn} θ = ${fn === "cot" ? `cos/sin = ${b}/${a}` : fn === "sec" ? `1/cos = ${c}/${b}` : `1/sin = ${c}/${a}`} ≈ ${answer}.`
    );
  }
  const state = tiPick(rand, TI_RECIPROCAL_EVAL_STATES);
  const answer = tiRound(1 + state.gx, 2);
  const traps = state.special
    ? [
        { value: 1, feedback: `${state.pair} = 1, but don't forget + cos 0 = +1: total 2.` },
        { value: 0, feedback: `A function times its reciprocal is 1, never 0. Plus cos 0 = 1 gives 2.` },
      ]
    : [
        { value: state.gx, feedback: `${state.gx} is only ${state.g}(${state.xs}). The product ${state.pair} = 1 must be added: 1 + ${state.gx} = ${answer}.` },
        { value: 1, feedback: `1 is ${state.pair} alone. Add ${state.g}(${state.xs}) = ${state.gx}: ${answer}.` },
      ];
  return tiNumeric(
    `Simplify ${state.pair} + ${state.g} θ, then evaluate at θ = ${state.xs}. (To hundredths.)`,
    answer,
    0.005,
    traps,
    `${state.pair} = 1 for every allowed θ, so the value is 1 + ${state.g}(${state.xs}) = ${answer}.`
  );
}

function tiPythagoreanVariant(rand: () => number): TiVariant {
  if (rand() < 0.5) {
    const [a, b, c] = tiPick(rand, TI_TRIPLES);
    const fn = tiPick(rand, ["sec", "csc"] as const);
    const answer = tiRound(fn === "sec" ? c / b : c / a, 4);
    const squared = tiRound(fn === "sec" ? (c * c) / (b * b) : (c * c) / (a * a), 4);
    const reciprocal = tiRound(fn === "sec" ? b / c : a / c, 4);
    return tiNumeric(
      `θ is acute with tan θ = ${a}/${b}. What is ${fn} θ, to four decimals?`,
      answer,
      0.0005,
      [
        { value: squared, feedback: `${squared} is ${fn}²θ. Take the square root: √(${c * c}/${fn === "sec" ? b * b : a * a}) = ${c}/${fn === "sec" ? b : a} ≈ ${answer}.` },
        { value: reciprocal, feedback: `${reciprocal} = ${fn === "sec" ? `cos θ. Secant is its reciprocal` : `sin θ. Cosecant is its reciprocal`}: ${c}/${fn === "sec" ? b : a} ≈ ${answer}.` },
      ],
      `tan θ = ${a}/${b} gives legs ${a} and ${b} with hypotenuse ${c}, so ${fn} θ = ${c}/${fn === "sec" ? b : a} ≈ ${answer}.`
    );
  }
  const identity = tiPick(rand, ["sin", "cos"] as const);
  const [xs, tanSq] = tiPick(rand, [["π/6", 1 / 3], ["π/3", 3]] as const);
  const value = identity === "sin" ? tanSq : 1 / tanSq;
  /* Two decimals: the 1/3-valued states would otherwise print 0.3333, an unstated truncation. */
  const answer = tiRound(value, 2);
  const unsquared = tiRound(Math.sqrt(value), 2);
  const flipped = tiRound(1 / value, 2);
  const simplified = identity === "sin" ? "tan²θ" : "cot²θ";
  const expr = identity === "sin" ? "(1 − cos²θ)·sec²θ" : "(1 − sin²θ)·csc²θ";
  return tiNumeric(
    `Simplify ${expr} to a single function, then evaluate at θ = ${xs}, to two decimals.`,
    answer,
    0.005,
    [
      { value: unsquared, feedback: `${unsquared} stops before squaring. The simplified form is ${simplified}, and its value at ${xs} is ≈ ${answer}.` },
      { value: flipped, feedback: `${flipped} is the RECIPROCAL square. ${expr} = ${simplified}, which at ${xs} equals ≈ ${answer}.` },
    ],
    `${expr} = ${simplified}; at θ = ${xs} that is ≈ ${answer}.`
  );
}

const TI_PROVE_STATES = [
  { family: "A", xs: "π/6", ans: 0.58, trap1: 0.33, trap2: 1.73 },
  { family: "A", xs: "π/3", ans: 1.73, trap1: 3, trap2: 0.58 },
  { family: "B", xs: "π/6", ans: 0.87, trap1: 0.5, trap2: 0.58 },
  { family: "B", xs: "π/3", ans: 0.5, trap1: 0.87, trap2: 1.73 },
  { family: "C", xs: "π/6", ans: 0.5, trap1: 0.87, trap2: 0.25 },
  { family: "C", xs: "π/3", ans: 0.87, trap1: 0.5, trap2: 0.75 },
] as const;

function tiProveVariant(rand: () => number): TiVariant {
  const state = tiPick(rand, TI_PROVE_STATES);
  if (state.family === "A") {
    return tiNumeric(
      `Check (sec²θ − 1)/tan θ = tan θ at θ = ${state.xs}: what does BOTH sides equal? (To hundredths.)`,
      state.ans,
      0.005,
      [
        { value: state.trap1, feedback: `${state.trap1} = sec²θ − 1 is the NUMERATOR alone. Divided by tan(${state.xs}), it gives ≈ ${state.ans}.` },
        { value: state.trap2, feedback: `${state.trap2} = cot(${state.xs}), the reciprocal. Both sides equal tan(${state.xs}) ≈ ${state.ans}.` },
      ],
      `sec²θ − 1 = tan²θ, so the quotient is tan(${state.xs}) ≈ ${state.ans} on both sides.`
    );
  }
  if (state.family === "B") {
    return tiNumeric(
      `Prove cot θ · sin θ = cos θ, then evaluate the common value at θ = ${state.xs} (to hundredths).`,
      state.ans,
      0.005,
      [
        { value: state.trap1, feedback: `${state.trap1} = sin(${state.xs}). The identity simplifies to COS θ, and cos(${state.xs}) ≈ ${state.ans}.` },
        { value: state.trap2, feedback: `${state.trap2} = tan(${state.xs}). cot θ · sin θ = (cos/sin)·sin = cos θ ≈ ${state.ans}.` },
      ],
      `cot θ · sin θ collapses to cos θ, and cos(${state.xs}) ≈ ${state.ans}.`
    );
  }
  return tiNumeric(
    `Verify (1 − cos²θ)/sin θ = sin θ at θ = ${state.xs}: the common value (to hundredths) = ?`,
    state.ans,
    0.005,
    [
      { value: state.trap1, feedback: `${state.trap1} = cos(${state.xs}). The identity collapses to SIN θ ≈ ${state.ans}.` },
      { value: state.trap2, feedback: `${state.trap2} = 1 − cos²θ = sin²θ is the numerator before dividing. The common value is sin(${state.xs}) ≈ ${state.ans}.` },
    ],
    `1 − cos²θ = sin²θ, so the quotient is sin(${state.xs}) ≈ ${state.ans}.`
  );
}

const TI_SUMDIFF_STATES = [
  { p: "cosDiff", A: 80, B: 20 }, { p: "cosDiff", A: 50, B: 20 }, { p: "cosDiff", A: 65, B: 35 },
  { p: "cosDiff", A: 100, B: 20 }, { p: "cosDiff", A: 110, B: 30 },
  { p: "sinDiff", A: 70, B: 25 }, { p: "sinDiff", A: 80, B: 20 }, { p: "sinDiff", A: 55, B: 25 }, { p: "sinDiff", A: 75, B: 30 },
  { p: "sinSum", A: 50, B: 40 }, { p: "sinSum", A: 80, B: 40 }, { p: "sinSum", A: 100, B: 50 },
] as const;

function tiApplySumDiffVariant(rand: () => number): TiVariant {
  const DEG = Math.PI / 180;
  const { p, A, B } = tiPick(rand, TI_SUMDIFF_STATES);
  if (p === "cosDiff") {
    const answer = tiRound(Math.cos((A - B) * DEG), 4);
    const wrong = tiRound(Math.cos((A + B) * DEG), 4);
    const partial = tiRound(Math.cos(A * DEG) * Math.cos(B * DEG), 4);
    return tiNumeric(
      `Evaluate cos ${A}° cos ${B}° + sin ${A}° sin ${B}°, to four decimals.`,
      answer,
      0.0005,
      [
        { value: wrong, feedback: `${wrong} = cos(${A + B}°) reads the PLUS pattern as a sum of angles. cosAcosB + sinAsinB compresses to cos(A − B) = cos ${A - B}° ≈ ${answer}.` },
        { value: partial, feedback: `${partial} = cos ${A}° cos ${B}° keeps only the first product. The full pattern compresses to cos(${A}° − ${B}°) ≈ ${answer}.` },
      ],
      `cosAcosB + sinAsinB = cos(A − B) = cos ${A - B}° ≈ ${answer}.`
    );
  }
  if (p === "sinDiff") {
    const answer = tiRound(Math.sin((A - B) * DEG), 4);
    const wrong = tiRound(Math.sin((A + B) * DEG), 4);
    const partial = tiRound(Math.sin(A * DEG) * Math.cos(B * DEG), 4);
    return tiNumeric(
      `Evaluate sin ${A}° cos ${B}° − cos ${A}° sin ${B}°, to four decimals.`,
      answer,
      0.0005,
      [
        { value: wrong, feedback: `${wrong} = sin(${A + B}°) is the SUM compression. The minus sign makes it a difference: sin(${A}° − ${B}°) = sin ${A - B}° ≈ ${answer}.` },
        { value: partial, feedback: `${partial} = sin ${A}° cos ${B}° keeps only the first product. The pattern compresses to sin(${A - B}°) ≈ ${answer}.` },
      ],
      `sinAcosB − cosAsinB = sin(A − B) = sin ${A - B}° ≈ ${answer}.`
    );
  }
  const answer = tiRound(Math.sin((A + B) * DEG), 4);
  const wrong = tiRound(Math.sin((A - B) * DEG), 4);
  const partial = tiRound(Math.sin(A * DEG) * Math.cos(B * DEG), 4);
  return tiNumeric(
    `Evaluate sin ${A}° cos ${B}° + cos ${A}° sin ${B}°, to four decimals.`,
    answer,
    0.0005,
    [
      { value: wrong, feedback: `${wrong} = sin(${A - B}°) reads the plus as a minus. The PLUS pattern compresses to sin(${A}° + ${B}°) = sin ${A + B}° ≈ ${answer}.` },
      { value: partial, feedback: `${partial} = sin ${A}° cos ${B}° keeps only the first product. The pattern compresses to sin(${A + B}°) ≈ ${answer}.` },
    ],
    `sinAcosB + cosAsinB = sin(A + B) = sin ${A + B}° ≈ ${answer}.`
  );
}

const TI_COFUNCTION_STATES = [
  { deg: 15, ansExpr: "2 − √3", traps: [
    { value: 3.732, feedback: "3.732 = tan 75° — the cofunction partner. tan 15° = 2 − √3 ≈ 0.268." },
    { value: 0.577, feedback: "0.577 = tan 30° = 1/√3. tan 15° is smaller: 2 − √3 ≈ 0.268." },
  ] },
  { deg: 75, ansExpr: "2 + √3", traps: [
    { value: 1.577, feedback: "1.577 = tan 45° + tan 30° forgets to divide by the (small) denominator 1 − tan 45° tan 30° ≈ 0.42. The full value is 2 + √3 ≈ 3.732." },
    { value: 0.268, feedback: "0.268 ≈ tan 15° — you may have inverted. tan 75° = 2 + √3 ≈ 3.732." },
  ] },
  { deg: 105, ansExpr: "−(2 + √3)", traps: [
    { value: 3.732, feedback: "3.732 drops the sign — the denominator 1 − tan 60° tan 45° is NEGATIVE, so tan 105° = −(2 + √3) ≈ −3.732." },
    { value: 2.732, feedback: "2.732 = tan 60° + tan 45° is the numerator alone. Divide by 1 − √3 ≈ −0.732: ≈ −3.732." },
  ] },
  { deg: 165, ansExpr: "−(2 − √3)", traps: [
    { value: 0.268, feedback: "0.268 = tan 15° without the sign. tan 165° = tan(180° − 15°) = −tan 15° ≈ −0.268." },
    { value: 0.577, feedback: "0.577 = tan 30°. tan 165° flips tan 15°'s sign: −(2 − √3) ≈ −0.268." },
  ] },
] as const;

function tiTanCofunctionVariant(rand: () => number): TiVariant {
  const state = tiPick(rand, TI_COFUNCTION_STATES);
  const exact = state.deg === 15 ? 2 - Math.sqrt(3) : state.deg === 75 ? 2 + Math.sqrt(3) : state.deg === 105 ? -(2 + Math.sqrt(3)) : -(2 - Math.sqrt(3));
  const answer = tiRound(exact, 3);
  return tiNumeric(
    `Evaluate tan ${state.deg}° to three decimals.`,
    answer,
    0.005,
    [...state.traps],
    `The sum/difference formula gives tan ${state.deg}° = ${state.ansExpr} ≈ ${answer}.`
  );
}

const TI_DOUBLE_ACTION_STATES = [
  { eq: "cos 2x = cos x", count: 3, sum: 2 * Math.PI, sols: "0, 2π/3, 4π/3", pair: "2π/3 and 4π/3", pairFrom: "cos x = −1/2", single: "0", singleFrom: "cos x = 1", pairSum: (2 * Math.PI) / 3 + (4 * Math.PI) / 3 },
  { eq: "cos 2x = sin x", count: 3, sum: (5 * Math.PI) / 2, sols: "π/6, 5π/6, 3π/2", pair: "π/6 and 5π/6", pairFrom: "sin x = 1/2", single: "3π/2", singleFrom: "sin x = −1", pairSum: Math.PI },
  { eq: "cos 2x = −cos x", count: 3, sum: 3 * Math.PI, sols: "π/3, π, 5π/3", pair: "π/3 and 5π/3", pairFrom: "cos x = 1/2", single: "π", singleFrom: "cos x = −1", pairSum: 2 * Math.PI },
  { eq: "sin 2x = sin x", count: 4, sum: 3 * Math.PI, sols: "0, π, π/3, 5π/3", pair: "π/3 and 5π/3", pairFrom: "cos x = 1/2", single: "0 and π", singleFrom: "sin x = 0", pairSum: 2 * Math.PI },
  { eq: "sin 2x = cos x", count: 4, sum: 3 * Math.PI, sols: "π/2, 3π/2, π/6, 5π/6", pair: "π/6 and 5π/6", pairFrom: "sin x = 1/2", single: "π/2 and 3π/2", singleFrom: "cos x = 0", pairSum: Math.PI },
] as const;

function tiDoubleActionVariant(rand: () => number): TiVariant {
  const state = tiPick(rand, TI_DOUBLE_ACTION_STATES);
  if (rand() < 0.5) {
    const answer = tiRound(state.sum, 2);
    const pairOnly = tiRound(state.pairSum, 2);
    const rest = tiRound(state.sum - state.pairSum, 2);
    /* When the extra branch contributes only x = 0, "pair-only" equals the full total, so the
     * partial-sum misconceptions become the two single members instead. */
    const traps = rest === 0
      ? [
          { value: tiRound((2 * Math.PI) / 3, 2), feedback: `${tiRound((2 * Math.PI) / 3, 2)} ≈ 2π/3 is a single solution. The full set ${state.sols} sums to ≈ ${answer}.` },
          { value: tiRound((4 * Math.PI) / 3, 2), feedback: `${tiRound((4 * Math.PI) / 3, 2)} ≈ 4π/3 is a single solution. Add 2π/3 (and x = 0, which adds nothing): ≈ ${answer}.` },
        ]
      : [
          { value: pairOnly, feedback: `${pairOnly} sums only the ${state.pairFrom} pair (${state.pair}). The ${state.singleFrom} branch adds ≈ ${rest}: ≈ ${answer}.` },
          { value: rest, feedback: `${rest} sums only the ${state.singleFrom} branch (${state.single}). Add the ${state.pairFrom} pair (${state.pair}): ≈ ${answer}.` },
        ];
    return tiNumeric(
      `Solve ${state.eq} on [0, 2π). What is the SUM of the solutions, to hundredths?`,
      answer,
      0.02,
      traps,
      `The solutions are ${state.sols}; they sum to ≈ ${answer}.`
    );
  }
  const traps = state.count === 3
    ? [
        { value: 2, feedback: `${state.pairFrom} gives the pair ${state.pair}; ${state.singleFrom} adds x = ${state.single}: three in total.` },
        { value: 4, feedback: `${state.singleFrom} contributes exactly ONE solution (${state.single}): 2 + 1 = 3.` },
      ]
    : [
        { value: 2, feedback: `${state.singleFrom} gives ${state.single} AND ${state.pairFrom} gives ${state.pair}: 2 + 2 = 4.` },
        { value: 3, feedback: `Both branches give two each — ${state.singleFrom} (${state.single}) and ${state.pairFrom} (${state.pair}): 4.` },
      ];
  return tiNumeric(
    `Solve ${state.eq} on [0, 2π). How many solutions are there?`,
    state.count,
    0,
    traps,
    `Rewriting the double angle splits ${state.eq} into ${state.singleFrom} and ${state.pairFrom}: ${state.count} solutions (${state.sols}).`
  );
}

/* S331 / lane G1. The thirteen numeric g12-trig-graphs-inverses forms below likewise repeated
 * 1–3 fixed rows. Each now draws genuine sinusoid dials (A, B, C, D), tangent-ladder windows, or
 * inverse-trig inputs that change the answer; the parsers in precalculusIndependent.cjs
 * re-derive every value by literal evaluation of the printed function or by integer search. */

const TG_FORM = (stem: string): string => `trig-graphs-inverses__${stem}__numeric`;
type TgVariant = { tag: "g12-trig-graphs-inverses"; widget: any; answer: number };

function tgNumeric(prompt: string, answer: number, tolerance: number, commonErrors: Array<{ value: number; feedback: string }>, fallbackFeedback: string): TgVariant {
  return {
    tag: "g12-trig-graphs-inverses",
    widget: {
      type: "numeric" as const,
      prompt: tiMinus(prompt),
      answer,
      tolerance,
      commonErrors: commonErrors.map((e) => ({ value: e.value, feedback: tiMinus(tiPad(e.feedback)) })),
      fallbackFeedback: tiMinus(tiPad(fallbackFeedback)),
    },
    answer,
  };
}

const TG_MIDLINE_PAIRS = [[5, 1], [5, 3], [7, 1], [7, 3], [9, 1], [11, 1], [11, 3]] as const;
const TG_PERIOD_STATES = [
  { p: 4, M: 8, m: 2 }, { p: 4, M: 11, m: 1 }, { p: 6, M: 9, m: 1 }, { p: 6, M: 11, m: 1 }, { p: 8, M: 7, m: 1 }, { p: 8, M: 11, m: 1 },
] as const;

function tgFourDialsVariant(rand: () => number): TgVariant {
  const job = Math.floor(rand() * 3);
  if (job === 0) {
    const A = tiPick(rand, [2, 3, 4, 5] as const);
    const dOptions = [-2, -1, 1, 2, 3].filter((x) => x !== A);
    const D = tiPick(rand, dOptions);
    const wantMax = rand() < 0.5;
    const dText = D < 0 ? `− ${-D}` : `+ ${D}`;
    if (wantMax) {
      return tgNumeric(
        `y = ${A} sin x ${dText}. What is the MAXIMUM value?`,
        D + A,
        0,
        [
          { value: A, feedback: `${A} is the amplitude alone. The wave rides midline ${D}, so the peak is ${D} + ${A} = ${D + A}.` },
          { value: D, feedback: `${D} is the MIDLINE. The peak stands the amplitude ${A} above it: ${D + A}.` },
        ],
        `max = D + A = ${D} + ${A} = ${D + A}.`
      );
    }
    return tgNumeric(
      `y = ${A} sin x ${dText}. What is the MINIMUM value?`,
      D - A,
      0,
      [
        { value: A - D, feedback: `Subtract the amplitude FROM the midline: ${D} − ${A} = ${D - A}, not ${A} − ${D}.` },
        { value: -A, feedback: `${-A} would be the min around midline 0. This wave rides midline ${D}: min ${D - A}.` },
      ],
      `min = D − A = ${D} − ${A} = ${D - A}.`
    );
  }
  if (job === 1) {
    const [M, m] = tiPick(rand, TG_MIDLINE_PAIRS);
    const D = (M + m) / 2;
    const amp = (M - m) / 2;
    return tgNumeric(
      `A sinusoid oscillates between a max of ${M} and a min of ${m}. What is its midline D?`,
      D,
      0,
      [
        { value: amp, feedback: `${amp} is the AMPLITUDE (${M} − ${m})/2. The midline AVERAGES the extremes: (${M} + ${m})/2 = ${D}.` },
        { value: M - m, feedback: `(${M} + ${m})/2 = ${D} — average the extremes, don't subtract them.` },
      ],
      `D = (${M} + ${m})/2 = ${D}, halfway between the peak and the trough.`
    );
  }
  const { p, M, m } = tiPick(rand, TG_PERIOD_STATES);
  const answer = tiRound(2 / p, 2);
  const amp = (M - m) / 2;
  return tgNumeric(
    `A wave has max ${M}, min ${m}, period ${p}π, and a rising midline-crossing at x = π. In y = A sin(B(x − C)) + D, what is B? (Round to hundredths.)`,
    answer,
    0.005,
    [
      { value: p / 2, feedback: `${p / 2} would give period 2π/${p / 2}. Period ${p}π needs B = 2π/(${p}π) = 2/${p} ≈ ${answer}.` },
      { value: p, feedback: `${p} is the period's coefficient of π, not B. B = 2π ÷ ${p}π = 2/${p} ≈ ${answer}.` },
      { value: amp, feedback: `${amp} is the AMPLITUDE. B is the period dial: 2π/(${p}π) ≈ ${answer}.` },
    ],
    `B = 2π ÷ period = 2π/(${p}π) = 2/${p} ≈ ${answer}.`
  );
}

function tgFivePointsVariant(rand: () => number): TgVariant {
  const job = Math.floor(rand() * 3);
  if (job === 0) {
    const A = tiPick(rand, [2, 3, 4] as const);
    const D = tiPick(rand, [-1, 1, 2] as const);
    const dText = D < 0 ? `− ${-D}` : `+ ${D}`;
    return tgNumeric(
      `y = ${A} sin x ${dText}. What is y at its first trough (x > 0)?`,
      D - A,
      0,
      [
        { value: D, feedback: `${D} is the MIDLINE. The trough dips A = ${A} below it: ${D - A}.` },
        { value: D + A, feedback: `${D + A} is the PEAK height (${D} + ${A}). The trough mirrors it below the midline: ${D - A}.` },
      ],
      `trough = D − A = ${D} − ${A} = ${D - A}.`
    );
  }
  if (job === 1) {
    const A = tiPick(rand, [2, 3, 4] as const);
    const D = tiPick(rand, [4, 5, 6] as const);
    return tgNumeric(
      `y = −${A} sin x + ${D}. What is y one quarter-period after x = 0?`,
      D - A,
      0,
      [
        { value: D + A, feedback: `${D + A} = ${D} + ${A} is the PEAK — but negative A dives first. One quarter in: the trough, ${D} − ${A} = ${D - A}.` },
        { value: D, feedback: `${D} is the midline, where the wave STARTS. A quarter-period later it bottoms out at ${D - A}.` },
      ],
      `Negative A dives first: one quarter-period in, y = ${D} − ${A} = ${D - A}.`
    );
  }
  const A = tiPick(rand, [3, 4, 5] as const);
  const D = tiPick(rand, [1, 2] as const);
  const B = tiPick(rand, [2, 3] as const);
  const Cs = tiPick(rand, ["π/3", "π/6"] as const);
  return tgNumeric(
    `y = ${A} sin(${B}(x − ${Cs})) + ${D}. What is the y-VALUE at its first peak after x = ${Cs}?`,
    D + A,
    0,
    [
      { value: A, feedback: `${A} is the amplitude. The peak stands A above the midline ${D}: y = ${D + A}.` },
      { value: D, feedback: `${D} is the midline. Add the amplitude: ${D} + ${A} = ${D + A}.` },
      { value: D + A + B, feedback: `${D + A + B} adds B too. B only compresses the period — the peak is D + A = ${D + A}.` },
    ],
    `peak = D + A = ${D} + ${A} = ${D + A}.`
  );
}

const TG_COS_WAVE_STATES = [
  { M: 11, m: 3, p: "π", half: "π/2" }, { M: 9, m: 1, p: "π", half: "π/2" },
  { M: 7, m: 3, p: "2π", half: "π" }, { M: 10, m: 2, p: "2π", half: "π" }, { M: 8, m: 2, p: "π", half: "π/2" },
] as const;

function tgCosGraphVariant(rand: () => number): TgVariant {
  const job = Math.floor(rand() * 3);
  if (job === 0) {
    const A = tiPick(rand, [2, 3, 4] as const);
    const D = tiPick(rand, [3, 4, 5] as const);
    return tgNumeric(
      `y = ${A} cos x + ${D}. What is y at x = π?`,
      D - A,
      0,
      [
        { value: D + A, feedback: `${D + A} is the PEAK (x = 0). Half a period later cosine is at its trough: ${D} − ${A} = ${D - A}.` },
        { value: -A, feedback: `cos π = −1 scales the amplitude to −${A}, but the wave rides midline ${D}: y = −${A} + ${D} = ${D - A}.` },
      ],
      `y(π) = ${A}·(−1) + ${D} = ${D - A}.`
    );
  }
  if (job === 1) {
    const A = tiPick(rand, [2, 3, 4] as const);
    const D = tiPick(rand, [-1, 1, 2] as const);
    const B = tiPick(rand, [2, 3] as const);
    const dText = D < 0 ? `− ${-D}` : `+ ${D}`;
    return tgNumeric(
      `y = ${A} cos(${B}x) ${dText}. What is the y-value at its FIRST trough (x > 0)?`,
      D - A,
      0,
      [
        { value: D, feedback: `${D} is the midline. The trough dips A = ${A} below: ${D - A}.` },
        { value: D + A, feedback: `${D + A} is the PEAK value (${D} + ${A}), at x = 0. The trough is its mirror: ${D - A}.` },
        { value: D - A - B, feedback: `Leave B out of the height: trough = D − A = ${D} − ${A} = ${D - A}.` },
      ],
      `trough = D − A = ${D} − ${A} = ${D - A}; B only squeezes where it happens.`
    );
  }
  const { M, m, p, half } = tiPick(rand, TG_COS_WAVE_STATES);
  const mid = (M + m) / 2;
  return tgNumeric(
    `A wave peaks at (0, ${M}), has min ${m}, and period ${p}. What is its y-value at x = ${half}?`,
    m,
    0,
    [
      { value: M, feedback: `${M} is the peak. Half a period later, a cosine-start wave is at its TROUGH: ${m}.` },
      { value: mid, feedback: `${mid} is the midline — that's at the QUARTER period. At x = ${half} the wave bottoms out: ${m}.` },
      { value: 0, feedback: `The min is ${m}, not 0: D − A = ${mid} − ${(M - m) / 2} = ${m}.` },
    ],
    `Half a period after its peak, the wave sits at its min ${m}.`
  );
}

function tgMixedCompVariant(rand: () => number): TgVariant {
  const [p, q, c] = tiPick(rand, TI_TRIPLES);
  const [a, b] = rand() < 0.5 ? [p, q] : [q, p];
  const job = Math.floor(rand() * 3);
  /* Two decimals: several triples put a repeating decimal (4/3 = 1.3333…) in the feedback. */
  const r4 = (x: number): number => tiRound(x, 2);
  if (job === 0) {
    const answer = r4(b / c);
    return tgNumeric(
      `What is cos(arcsin(${a}/${c})), to two decimals?`,
      answer,
      0.005,
      [
        { value: r4(a / c), feedback: `That is ${a}/${c}, the SINE. Cosine reads the adjacent leg: ${b}/${c} ≈ ${answer}.` },
        { value: r4(a / b), feedback: `That is ${a}/${b}, mixing the two legs. Cosine is adjacent over HYPOTENUSE: ${b}/${c} ≈ ${answer}.` },
      ],
      `sin = ${a}/${c} puts the legs at ${a} and ${b}: cos = ${b}/${c} ≈ ${answer}.`
    );
  }
  if (job === 1) {
    const answer = r4(a / b);
    return tgNumeric(
      `What is tan(arccos(${b}/${c})), to two decimals?`,
      answer,
      0.005,
      [
        { value: r4(b / a), feedback: `That is ${b}/${a}, the ratio inverted. Tangent is OPPOSITE over adjacent: ${a}/${b} ≈ ${answer}.` },
        { value: r4(a / c), feedback: `That is ${a}/${c}, the SINE. Divide by the cosine ${b}/${c}: tan = ${a}/${b} ≈ ${answer}.` },
        { value: r4(c / b), feedback: `That is ${c}/${b}, using the hypotenuse. Tangent never does: ${a}/${b} ≈ ${answer}.` },
      ],
      `cos = ${b}/${c} makes the opposite leg ${a}: tan = ${a}/${b} ≈ ${answer}.`
    );
  }
  const answer = r4(a / c);
  return tgNumeric(
    `What is sin(arctan(${a}/${b})), to two decimals?`,
    answer,
    0.005,
    [
      { value: r4(a / b), feedback: `That is ${a}/${b}, the TANGENT (the input). Sine needs the hypotenuse ${c}: ${a}/${c} ≈ ${answer}.` },
      { value: r4(b / c), feedback: `That is ${b}/${c}, the COSINE of this angle. Sine takes the opposite leg: ${a}/${c} ≈ ${answer}.` },
    ],
    `tan = ${a}/${b} gives hypotenuse ${c}: sin = ${a}/${c} ≈ ${answer}.`
  );
}

const TG_PHASE_PEAK_STATES = [
  { B: 2, Cs: "π/3", Xs: "5π/12" }, { B: 2, Cs: "π/6", Xs: "π/3" }, { B: 3, Cs: "π/4", Xs: "π/4" }, { B: 3, Cs: "π/2", Xs: "π/3" },
] as const;

function tgPhaseVariant(rand: () => number): TgVariant {
  if (rand() < 0.5) {
    const A = tiPick(rand, [2, 3, 4] as const);
    const { B, Cs, Xs } = tiPick(rand, TG_PHASE_PEAK_STATES);
    return tgNumeric(
      `y = ${A} sin(${B}x − ${Cs}). What is y at x = ${Xs}?`,
      A,
      0,
      [
        { value: 1, feedback: `The inside reaches π/2, where sin is exactly 1 — then the amplitude ${A} scales it: y = ${A}.` },
        { value: 0, feedback: `x = ${Xs} makes the inside π/2 — a PEAK, not a zero: y = ${A}·1 = ${A}.` },
      ],
      `${B}·${Xs} − ${Cs} = π/2, so y = ${A}·sin(π/2) = ${A}.`
    );
  }
  const B = tiPick(rand, [2, 3, 4] as const);
  const kOptions = [2, 3, 4, 6].filter((x) => x !== B);
  const k = tiPick(rand, kOptions);
  const n = k * B;
  return tgNumeric(
    `y = sin(${B}x + π/${k}) is shifted LEFT by π/n. What is n?`,
    n,
    0,
    [
      { value: k, feedback: `π/${k} is the raw constant. Factor out B = ${B}: the true shift is (π/${k})/${B} = π/${n}, so n = ${n}.` },
      { value: B, feedback: `${B} is B, the period-changer. The shift divides the constant by it: π/${n} → n = ${n}.` },
    ],
    `shift = (π/${k}) ÷ ${B} = π/${n}, so n = ${n}.`
  );
}

const TG_TAN_ANGLE_STATES = [
  { xs: "π/4", ans: 1, traps: [
    { value: 0.71, feedback: "0.71 ≈ √2/2 is sin(π/4) alone. Tangent DIVIDES: (√2/2)/(√2/2) = 1." },
    { value: 0.5, feedback: "0.5 is sin(π/6), a different angle. At π/4, sine and cosine are equal, so the ratio is exactly 1." },
  ] },
  { xs: "5π/4", ans: 1, traps: [
    { value: -1, feedback: "Both sin and cos are negative at 5π/4 — their RATIO is positive: (−√2/2)/(−√2/2) = +1." },
    { value: 0, feedback: "5π/4 is not a zero of sine. It's π/4 plus one period of tangent: tan = 1." },
  ] },
  { xs: "3π/4", ans: -1, traps: [
    { value: 1, feedback: "At 3π/4, sine is positive but cosine is NEGATIVE — the ratio flips sign: −1." },
    { value: 0.71, feedback: "0.71 ≈ √2/2 is sin(3π/4) alone. Divide by cos(3π/4) = −√2/2: tan = −1." },
  ] },
  { xs: "7π/4", ans: -1, traps: [
    { value: 1, feedback: "At 7π/4, sine is negative while cosine is positive — the ratio is NEGATIVE: −1." },
    { value: -0.71, feedback: "−0.71 ≈ −√2/2 is sin(7π/4) alone. Tangent divides by cos(7π/4) = √2/2: −1." },
  ] },
] as const;

function tgTanShapeVariant(rand: () => number): TgVariant {
  if (rand() < 0.5) {
    const state = tiPick(rand, TG_TAN_ANGLE_STATES);
    return tgNumeric(
      `What is tan(${state.xs})?`,
      state.ans,
      0,
      [...state.traps],
      `tan(${state.xs}) = sin/cos at that angle = ${state.ans}.`
    );
  }
  const w = tiPick(rand, [2, 3, 4] as const);
  const walls = ["π/2", "3π/2", "5π/2", "7π/2"].slice(0, w).join(", ");
  return tgNumeric(
    `How many vertical asymptotes does tan x have strictly between 0 and ${w}π?`,
    w,
    0,
    [
      { value: 2 * w, feedback: `${2 * w} would be walls every π/2 — but they're spaced a FULL π apart: ${walls} → ${w}.` },
      { value: w - 1, feedback: `Count all the way up: ${(2 * w - 1) / 2}π is still below ${w}π. The walls are ${walls}: ${w} of them.` },
    ],
    `Walls sit at π/2 + kπ: ${walls}, so ${w} of them before ${w}π.`
  );
}

const TG_TAN_WALL_STATES = [
  { k: 6, wallText: "2π", n: 3 }, { k: 3, wallText: "5π", n: 6 }, { k: 5, wallText: "7π", n: 10 },
] as const;

function tgTanTransformVariant(rand: () => number): TgVariant {
  if (rand() < 0.5) {
    const kAmp = tiPick(rand, [2, 3, 4] as const);
    const B = tiPick(rand, [2, 3] as const);
    const Xs = B === 2 ? "π/8" : "π/12";
    const unscaled = tiRound(Math.tan(Math.PI / (4 * B)), 2);
    return tgNumeric(
      `y = ${kAmp} tan(${B}x). What is y at x = ${Xs}?`,
      kAmp,
      0,
      [
        { value: 1, feedback: `tan(π/4) = 1 is the inside value — the outside ${kAmp} still scales it: y = ${kAmp}.` },
        { value: unscaled, feedback: `${unscaled} ≈ tan(${Xs}) skips the ${B}: the ${B} multiplies FIRST, making the argument π/4, and ${kAmp}·tan(π/4) = ${kAmp}.` },
      ],
      `${B}·${Xs} = π/4, so y = ${kAmp}·tan(π/4) = ${kAmp}.`
    );
  }
  const { k, wallText, n } = tiPick(rand, TG_TAN_WALL_STATES);
  return tgNumeric(
    `The first positive wall of y = tan(x − π/${k}) is at x = ${wallText}/n. What is n?`,
    n,
    0,
    [
      { value: 2, feedback: `π/2 is the UNSLID wall. Add the shift: π/2 + π/${k} = ${wallText}/${n}, so n = ${n}.` },
      { value: k, feedback: `π/${k} is the slide itself, not the wall. The wall lands at ${wallText}/${n}: n = ${n}.` },
    ],
    `wall = π/2 + π/${k} = ${wallText}/${n}, so n = ${n}.`
  );
}

function tgCosSinVariant(rand: () => number): TgVariant {
  const A = tiPick(rand, [2, 3, 4, 5] as const);
  const atPi = rand() < 0.5;
  if (atPi) {
    return tgNumeric(
      `y = ${A} sin(x + π/2) and y = ${A} cos x claim to be the same wave. What do BOTH give at x = π?`,
      -A,
      0,
      [
        { value: A, feedback: `Keep the sign: cos π = −1, so both rules give ${A}·(−1) = −${A}.` },
        { value: -1, feedback: `−1 is cos π before the amplitude. Scale by ${A}: both give −${A}.` },
      ],
      `sin(π + π/2) = cos π = −1, so both give ${A}·(−1) = −${A}.`
    );
  }
  return tgNumeric(
    `y = ${A} sin(x + π/2) and y = ${A} cos x claim to be the same wave. What do BOTH give at x = 0?`,
    A,
    0,
    [
      { value: 0, feedback: `sin(0) = 0, but the argument is 0 + π/2: sin(π/2) = 1, so both rules give ${A}.` },
      { value: 1, feedback: `1 is sin(π/2) before the amplitude. Scale by ${A}: both give ${A}.` },
    ],
    `sin(0 + π/2) = 1 = cos 0, so both give ${A}·1 = ${A}.`
  );
}

const TG_TAN_VALUE_STATES = [
  { xs: "π/6", ans: 0.58, traps: [
    { value: 1.73, feedback: "1.73 is tan(π/3). At π/6 the SMALL value (1/2) is on top: 1/√3 ≈ 0.58." },
    { value: 0.5, feedback: "0.5 is sin(π/6) before dividing. The quotient is (1/2)/(√3/2) ≈ 0.58." },
  ] },
  { xs: "π/3", ans: 1.73, traps: [
    { value: 0.58, feedback: "0.58 is tan(π/6) — the reciprocal partner. At π/3 the LARGE value (√3/2) is on top: √3 ≈ 1.73." },
    { value: 0.87, feedback: "0.87 ≈ √3/2 is sin(π/3) before dividing. The quotient is (√3/2)/(1/2) ≈ 1.73." },
  ] },
  { xs: "π/4", ans: 1, traps: [
    { value: 0.71, feedback: "0.71 ≈ √2/2 is sin(π/4) alone. Sine and cosine match at π/4, so the ratio is exactly 1." },
    { value: 0.5, feedback: "0.5 is sin(π/6), a different angle entirely. tan(π/4) = 1 because the two legs are equal." },
  ] },
  { xs: "2π/3", ans: -1.73, traps: [
    { value: 1.73, feedback: "1.73 drops the sign — at 2π/3 cosine is NEGATIVE, so the ratio is −√3 ≈ −1.73." },
    { value: -0.58, feedback: "−0.58 is tan(5π/6), the shallow QII angle. tan(2π/3) = (√3/2)/(−1/2) ≈ −1.73." },
  ] },
  { xs: "5π/6", ans: -0.58, traps: [
    { value: 0.58, feedback: "0.58 drops the sign — at 5π/6 cosine is NEGATIVE, so the ratio is −1/√3 ≈ −0.58." },
    { value: -1.73, feedback: "−1.73 is tan(2π/3), the steep QII angle. tan(5π/6) = (1/2)/(−√3/2) ≈ −0.58." },
  ] },
] as const;

function tgTanValuesVariant(rand: () => number): TgVariant {
  const state = tiPick(rand, TG_TAN_VALUE_STATES);
  return tgNumeric(
    `What is tan(${state.xs}), to hundredths?`,
    state.ans,
    0.005,
    [...state.traps],
    `tan(${state.xs}) = sin/cos at that angle ≈ ${state.ans}.`
  );
}

const TG_ARCSIN_STATES = [
  { vs: "1", n: 2, traps: [
    { value: 1, feedback: "sin π = 0, not 1. Sine reaches 1 at π/2: n = 2." },
    { value: 6, feedback: "π/6 has sine 1/2. The FULL value 1 needs π/2: n = 2." },
  ] },
  { vs: "1/2", n: 6, traps: [
    { value: 3, feedback: "π/3 has sine √3/2, the big twin. Sine equals 1/2 at π/6: n = 6." },
    { value: 2, feedback: "π/2 has sine 1, the maximum. For 1/2 the branch angle is π/6: n = 6." },
  ] },
  { vs: "√2/2", n: 4, traps: [
    { value: 2, feedback: "π/2 has sine 1. The value √2/2 belongs to π/4: n = 4." },
    { value: 6, feedback: "π/6 has sine 1/2. √2/2 is the π/4 value: n = 4." },
  ] },
  { vs: "√3/2", n: 3, traps: [
    { value: 6, feedback: "π/6 has sine 1/2 — the SMALL twin. √3/2 belongs to π/3: n = 3." },
    { value: 2, feedback: "π/2 has sine 1. √3/2 is the π/3 value: n = 3." },
  ] },
] as const;

function tgArcsinVariant(rand: () => number): TgVariant {
  const state = tiPick(rand, TG_ARCSIN_STATES);
  return tgNumeric(
    `arcsin(${state.vs}) = π/n. What is n?`,
    state.n,
    0,
    [...state.traps],
    `On the arcsin branch, sin(π/${state.n}) = ${state.vs}, so n = ${state.n}.`
  );
}

const TG_ARCTAN_STATES = [
  { vs: "1", n: 4, traps: [
    { value: 2, feedback: "π/2 is the WALL — excluded, since tan has no value there. tan(π/4) = 1: n = 4." },
    { value: 1, feedback: "tan π = 0. The angle with tangent 1 is π/4: n = 4." },
  ] },
  { vs: "√3", n: 3, traps: [
    { value: 6, feedback: "π/6 has tangent 1/√3, the reciprocal. tan(π/3) = √3: n = 3." },
    { value: 2, feedback: "π/2 is tangent's wall, not a value. tan(π/3) = √3: n = 3." },
  ] },
  { vs: "1/√3", n: 6, traps: [
    { value: 3, feedback: "π/3 has tangent √3 — inverted. tan(π/6) = 1/√3: n = 6." },
    { value: 2, feedback: "π/2 is tangent's wall, not a value. tan(π/6) = 1/√3: n = 6." },
  ] },
  { vs: "−1", n: 4, negative: true, traps: [
    { value: 2, feedback: "π/2 is the WALL, where tangent has no value at all. tan(−π/4) = −1: n = 4." },
    { value: 3, feedback: "−π/3 has tangent −√3, too steep. The angle with tangent −1 is −π/4: n = 4." },
  ] },
  { vs: "−√3", n: 3, negative: true, traps: [
    { value: 4, feedback: "−π/4 has tangent −1, too shallow. tan(−π/3) = −√3: n = 3." },
    { value: 6, feedback: "−π/6 has tangent −1/√3, the reciprocal. The angle with tangent −√3 is −π/3: n = 3." },
  ] },
] as const;

function tgArccosVariant(rand: () => number): TgVariant {
  const state = tiPick(rand, TG_ARCTAN_STATES);
  const neg = "negative" in state && state.negative === true;
  return tgNumeric(
    `arctan(${state.vs}) = ${neg ? "−π" : "π"}/n. What is n?`,
    state.n,
    0,
    [...state.traps],
    `On the arctan branch, tan(${neg ? "−π" : "π"}/${state.n}) = ${state.vs}, so n = ${state.n}.`
  );
}

const TG_ARCCOS_VALUE_STATES = [
  { vs: "1", ans: 0, traps: [
    { value: 3.14, feedback: "arccos(−1) = π ≈ 3.14. For the input +1, the branch angle is 0 (cos 0 = 1)." },
    { value: 1.57, feedback: "1.57 ≈ π/2 is arccos(0). Cosine equals 1 at the angle 0." },
  ] },
  { vs: "0", ans: 1.57, traps: [
    { value: 0, feedback: "0 is arccos(1). Cosine equals 0 a quarter-turn up, at π/2 ≈ 1.57." },
    { value: 3.14, feedback: "3.14 ≈ π is arccos(−1). For the input 0 the branch angle is π/2 ≈ 1.57." },
  ] },
  { vs: "−1", ans: 3.14, traps: [
    { value: 1.57, feedback: "1.57 ≈ π/2 is arccos(0). Cosine reaches −1 only at π ≈ 3.14." },
    { value: -3.14, feedback: "The arccos branch stays within [0, π]: the answer is +π ≈ 3.14." },
  ] },
  { vs: "1/2", ans: 1.05, traps: [
    { value: 2.09, feedback: "2.09 ≈ 2π/3 is arccos(−1/2). For +1/2 the branch angle is π/3 ≈ 1.05." },
    { value: 0.52, feedback: "0.52 ≈ π/6 is arcsin(1/2) — the SINE inverse. arccos(1/2) = π/3 ≈ 1.05." },
  ] },
  { vs: "−1/2", ans: 2.09, traps: [
    { value: 1.05, feedback: "1.05 ≈ π/3 is arccos(+1/2). The negative input pushes past π/2: 2π/3 ≈ 2.09." },
    { value: -1.05, feedback: "The arccos branch never goes negative: arccos(−1/2) = 2π/3 ≈ 2.09." },
  ] },
] as const;

function tgInverseGraphsVariant(rand: () => number): TgVariant {
  const state = tiPick(rand, TG_ARCCOS_VALUE_STATES);
  return tgNumeric(
    `What is arccos(${state.vs}), to hundredths?`,
    state.ans,
    0.005,
    [...state.traps],
    `On the [0, π] branch, arccos(${state.vs}) ≈ ${state.ans}.`
  );
}

function tgCompositionTrapVariant(rand: () => number): TgVariant {
  const v = tiPick(rand, [0.4, 0.7, 1.1, 1.3, -0.7] as const);
  const sinV = tiRound(Math.sin(v), 2);
  return tgNumeric(
    `What is arcsin(sin(${v}))? (${v} radians.)`,
    v,
    0.005,
    [
      { value: sinV, feedback: `${sinV} ≈ sin(${v}) is the INTERMEDIATE value. arcsin undoes it exactly, returning ${v} itself.` },
      { value: -v, feedback: `Nothing flips: ${v} already lies on the arcsin branch [−π/2, π/2], so the composition returns ${v}.` },
    ],
    `${v} is inside [−π/2, π/2], so arcsin(sin(${v})) = ${v} exactly.`
  );
}

const TG_FORM_VARIANTS: Record<string, (rand: () => number) => TgVariant> = {
  [TG_FORM("tg-four-dials")]: tgFourDialsVariant,
  [TG_FORM("tg-five-points")]: tgFivePointsVariant,
  [TG_FORM("tg-cos-graph")]: tgCosGraphVariant,
  [TG_FORM("tg-mixed-comp")]: tgMixedCompVariant,
  [TG_FORM("tg-phase")]: tgPhaseVariant,
  [TG_FORM("tg-tan-shape")]: tgTanShapeVariant,
  [TG_FORM("tg-tan-transform")]: tgTanTransformVariant,
  [TG_FORM("tg-cos-sin")]: tgCosSinVariant,
  [TG_FORM("tg-tan-values")]: tgTanValuesVariant,
  [TG_FORM("tg-arcsin")]: tgArcsinVariant,
  [TG_FORM("tg-arccos")]: tgArccosVariant,
  [TG_FORM("tg-inverse-graphs")]: tgInverseGraphsVariant,
  [TG_FORM("tg-composition-trap")]: tgCompositionTrapVariant,
};

/* S331 / lane G1. The ten numeric g12-vectors-matrices forms repeated 2–3 fixed rows. Each now
 * draws genuine vector/matrix states — components, scalars, systems — that change the answer.
 * precalculusIndependent.cjs re-derives every value from the printed components: magnitudes by
 * integer search against the squares where exact, systems by brute-force integer search. */

const VEC_FORM = (stem: string): string => `vectors-matrices__${stem}__numeric`;
type VecVariant = { tag: "g12-vectors-matrices"; widget: any; answer: number };

/* The vec-* and six pra-* forms are authored on the exactNumberLab surface, whose truth function
 * re-derives every answer from the spec's own constants and formula. These node helpers build
 * that formula; where the answer comes from a search or a count that the approx-expression
 * grammar cannot express, the formula is an explicit literal of the independently checked value. */
const labLit = (value: number): any => ({ op: "lit", value });
const labConst = (id: string): any => ({ op: "const", id });
const labMul = (left: any, right: any): any => ({ op: "multiply", left, right });
const labDiv = (left: any, right: any): any => ({ op: "divide", left, right });
const labAdd = (left: any, right: any): any => ({ op: "add", left, right });
const labSub = (left: any, right: any): any => ({ op: "subtract", left, right });
const labSqrt = (arg: any): any => ({ op: "sqrt", arg });
const labNeg = (arg: any): any => ({ op: "negate", arg });
const labSinDeg = (degrees: number): any => ({ op: "sinDeg", degrees });
const labCosDeg = (degrees: number): any => ({ op: "cosDeg", degrees });

function labVariant<Tag extends string>(
  tag: Tag,
  prompt: string,
  consts: Array<{ id: string; label: string; value: number }>,
  formula: any,
  round: number,
  tolerance: number,
  numericErrors: Array<{ value: number; feedback: string }>,
  fallbackFeedback: string
): { tag: Tag; widget: any; answer: number } {
  const widget = {
    type: "exactNumberLab" as const,
    prompt: tiMinus(prompt),
    task: "approximationEvaluate" as const,
    values: [],
    approxConstants: consts,
    approxFormula: formula,
    approxRound: round,
    answerMode: "numeric" as const,
    tolerance,
    numericErrors: numericErrors.map((e) => ({ value: e.value, feedback: tiMinus(tiPad(e.feedback)) })),
    choices: [],
    authoredStages: [],
    requiredStageKeys: [],
    requiredExplorations: 1,
    explorationFeedback: "Inspect the required exact-number states before checking.",
    fallbackFeedback: tiMinus(tiPad(fallbackFeedback)),
    successFeedback: tiMinus(tiPad(fallbackFeedback)),
  };
  const answer = exactNumberTruth(widget as any).answerNumber;
  if (answer === undefined) throw new Error(`S331 lab variant produced no numeric answer: ${prompt}`);
  return { tag, widget, answer };
}

function vecNumeric(prompt: string, answer: number, tolerance: number, commonErrors: Array<{ value: number; feedback: string }>, fallbackFeedback: string): VecVariant {
  return {
    tag: "g12-vectors-matrices",
    widget: {
      type: "numeric" as const,
      prompt: tiMinus(prompt),
      answer,
      tolerance,
      commonErrors: commonErrors.map((e) => ({ value: e.value, feedback: tiMinus(tiPad(e.feedback)) })),
      fallbackFeedback: tiMinus(tiPad(fallbackFeedback)),
    },
    answer,
  };
}

/** Adapter: the same drawn state and traps, emitted on the exactNumberLab surface with the given
 * constants/formula so the lab's truth function re-derives the answer. */
function vecLab(v: VecVariant, consts: Array<{ id: string; label: string; value: number }>, formula: any, round: number): VecVariant {
  const built = labVariant("g12-vectors-matrices" as const, v.widget.prompt, consts, formula, round, v.widget.tolerance, v.widget.commonErrors, v.widget.fallbackFeedback);
  if (Math.abs(built.answer - v.answer) > 1e-9) {
    throw new Error(`S331 vec lab formula disagrees with the drawn answer (${built.answer} vs ${v.answer}): ${v.widget.prompt}`);
  }
  return built;
}

const VEC_DIRECTION_ANGLE_STATES = [
  { x: -1, y: -1, ans: 225, traps: [
    { value: 45, feedback: "45° is the reference angle — both components negative put v in QIII: 180° + 45° = 225°." },
    { value: 315, feedback: "315° is ⟨1, −1⟩'s direction, flipping only the y-sign. Both signs negative give 225°." },
  ] },
  { x: 1, y: 1, ans: 45, traps: [
    { value: 225, feedback: "225° points the OPPOSITE way, into QIII. Both components positive keep v in QI: 45°." },
    { value: 135, feedback: "135° is ⟨−1, 1⟩'s direction. With both components positive, the angle is 45°." },
  ] },
  { x: -1, y: 1, ans: 135, traps: [
    { value: 45, feedback: "45° is the reference angle — the negative x pushes v into QII: 180° − 45° = 135°." },
    { value: 225, feedback: "225° is QIII, where BOTH components are negative. Here only x is: 135°." },
  ] },
  { x: 1, y: -1, ans: 315, traps: [
    { value: 45, feedback: "45° is the reference angle — the negative y drops v into QIV: 360° − 45° = 315°." },
    { value: 135, feedback: "135° is ⟨−1, 1⟩'s direction, the mirror image. Here x is positive and y negative: 315°." },
  ] },
] as const;

function vecDirectionVariant(rand: () => number): VecVariant {
  if (rand() < 0.5) {
    const mag = tiPick(rand, [6, 8, 10, 12] as const);
    const theta = tiPick(rand, [30, 45, 60] as const);
    const wantX = rand() < 0.5;
    const DEG = Math.PI / 180;
    const answer = tiRound(mag * (wantX ? Math.cos(theta * DEG) : Math.sin(theta * DEG)), 2);
    const other = tiRound(mag * (wantX ? Math.sin(theta * DEG) : Math.cos(theta * DEG)), 2);
    const traps = theta === 45
      ? [
          { value: mag, feedback: `${mag} is the whole magnitude. The ${wantX ? "x" : "y"}-component takes ${wantX ? "cos" : "sin"} 45° of it: ≈ ${answer}.` },
          { value: tiRound(mag * Math.SQRT2, 2), feedback: `${tiRound(mag * Math.SQRT2, 2)} multiplies by √2 instead of √2/2. Component = ${mag}·${wantX ? "cos" : "sin"} 45° ≈ ${answer}.` },
        ]
      : [
          { value: other, feedback: `${other} is the ${wantX ? "y" : "x"}-component (${mag}·${wantX ? "sin" : "cos"} ${theta}°). The ${wantX ? "x" : "y"}-component uses ${wantX ? "cos" : "sin"}: ≈ ${answer}.` },
          { value: mag, feedback: `${mag} is the magnitude, not a component. Multiply by ${wantX ? "cos" : "sin"} ${theta}°: ≈ ${answer}.` },
        ];
    return vecLab(
      vecNumeric(
        `A vector has magnitude ${mag} and direction ${theta}°. What is its ${wantX ? "x" : "y"}-component, to two decimals?`,
        answer,
        0.01,
        traps,
        `${wantX ? "x" : "y"}-component = ${mag}·${wantX ? "cos" : "sin"} ${theta}° ≈ ${answer}.`
      ),
      [{ id: "m", label: "the magnitude", value: mag }],
      labMul(labConst("m"), wantX ? labCosDeg(theta) : labSinDeg(theta)),
      2
    );
  }
  const state = tiPick(rand, VEC_DIRECTION_ANGLE_STATES);
  return vecLab(
    vecNumeric(
      `The direction angle of v = ⟨${state.x}, ${state.y}⟩, in [0°, 360°), is how many degrees?`,
      state.ans,
      0,
      [...state.traps],
      `The signs of ⟨${state.x}, ${state.y}⟩ place v so its direction is ${state.ans}°.`
    ),
    [{ id: "deg", label: "the quadrant-adjusted direction", value: state.ans }],
    labConst("deg"),
    0
  );
}

function vecScalarVariant(rand: () => number): VecVariant {
  const job = Math.floor(rand() * 3);
  if (job === 0) {
    const [a, b] = tiPick(rand, [[2, 1], [1, 3], [3, 2]] as const);
    const k = tiPick(rand, [2, 3, 4] as const);
    const sq = a * a + b * b;
    const base = Math.sqrt(sq);
    const answer = tiRound(k * base, 2);
    return vecLab(
      vecNumeric(
        `|⟨${a}, −${b}⟩| = √${sq}. What is |${k}⟨${a}, −${b}⟩|? (As a decimal to two places.)`,
        answer,
        0.01,
        [
          { value: tiRound(base, 2), feedback: `${tiRound(base, 2)} ≈ √${sq} is the ORIGINAL magnitude. Scaling by ${k} scales the length too: ${k}√${sq} ≈ ${answer}.` },
          { value: tiRound(k * k * base, 2), feedback: `${tiRound(k * k * base, 2)} scales by ${k}² — a scalar stretches length linearly: ${k}√${sq} ≈ ${answer}.` },
        ],
        `|${k}v| = ${k}|v| = ${k}√${sq} ≈ ${answer}.`
      ),
      [{ id: "k", label: "the scalar", value: k }],
      labMul(labConst("k"), labSqrt(labLit(sq))),
      2
    );
  }
  if (job === 1) {
    const [a, b, c] = tiPick(rand, TI_TRIPLES);
    const answer = tiRound(a / c, 2);
    return vecLab(
      vecNumeric(
        `What is the x-component of the unit vector along ⟨${a}, ${b}⟩, to two decimals?`,
        answer,
        0.005,
        [
          { value: a, feedback: `${a} is the ORIGINAL x-component. The unit vector divides by |v| = ${c}: ${a}/${c} = ${answer}.` },
          { value: tiRound(a / b, 2), feedback: `${tiRound(a / b, 2)} = ${a}/${b} divides by the other COMPONENT. Divide by the magnitude ${c}: ${answer}.` },
        ],
        `|⟨${a}, ${b}⟩| = ${c}, so the unit vector's x-component is ${a}/${c} = ${answer}.`
      ),
      [{ id: "x", label: "the x-component", value: a }, { id: "y", label: "the y-component", value: b }],
      labDiv(labConst("x"), labSqrt(labAdd(labMul(labConst("x"), labConst("x")), labMul(labConst("y"), labConst("y"))))),
      2
    );
  }
  const [k, p, q, r, s] = tiPick(rand, [[2, 1, 2, 1, -1], [3, 1, 1, 0, 1], [2, 2, 1, -1, 2], [2, 1, 3, 2, -2], [3, 2, 0, -2, 3]] as const);
  const rx = k * p + r;
  const ry = k * q + s;
  const answer = tiRound(Math.hypot(rx, ry), 2);
  const magSum = tiRound(k * Math.hypot(p, q) + Math.hypot(r, s), 2);
  return vecLab(
    vecNumeric(
      `Find the magnitude of ${k}⟨${p}, ${q}⟩ + ⟨${r}, ${s}⟩, to two decimals.`,
      answer,
      0.01,
      [
        { value: magSum, feedback: `${magSum} adds the two separate lengths. Combine components first: ${k}⟨${p}, ${q}⟩ + ⟨${r}, ${s}⟩ = ⟨${rx}, ${ry}⟩, magnitude ≈ ${answer}.` },
        { value: rx + ry, feedback: `${rx + ry} adds the resulting components ${rx} + ${ry}. The magnitude is √(${rx}² + ${ry}²) ≈ ${answer}.` },
      ],
      `The sum is ⟨${rx}, ${ry}⟩, so the magnitude is √(${rx * rx} + ${ry * ry}) ≈ ${answer}.`
    ),
    [{ id: "rx", label: "the resulting x-component", value: rx }, { id: "ry", label: "the resulting y-component", value: ry }],
    labSqrt(labAdd(labMul(labConst("rx"), labConst("rx")), labMul(labConst("ry"), labConst("ry")))),
    2
  );
}

const VEC_DOT_STATES = [
  { a: 2, b: 3, c: 4, d: 1 }, { a: 3, b: 4, c: 4, d: -3 }, { a: 1, b: 5, c: 2, d: 3 },
  { a: 2, b: 6, c: 6, d: -2 }, { a: 4, b: 2, c: 3, d: 5 }, { a: 5, b: 1, c: 2, d: 7 },
] as const;

function vecDotVariant(rand: () => number): VecVariant {
  const { a, b, c, d } = tiPick(rand, VEC_DOT_STATES);
  const answer = a * c + b * d;
  const crossed = a * d + b * c;
  const subbed = a * c - b * d;
  const suffix = answer === 0 ? " (Confirming they're perpendicular.)" : "";
  return vecLab(
    vecNumeric(
      `What is ⟨${a}, ${b}⟩ · ⟨${c}, ${d}⟩?${suffix}`,
      answer,
      0,
      [
        { value: crossed, feedback: `${crossed} = ${a}·${d} + ${b}·${c} CROSSES the components. Match x with x and y with y: ${a}·${c} + ${b}·${d} = ${answer}.` },
        { value: subbed, feedback: `${subbed} subtracts the products. A dot product ADDS them: ${a}·${c} + ${b}·${d} = ${answer}.` },
      ],
      `⟨${a}, ${b}⟩ · ⟨${c}, ${d}⟩ = ${a}·${c} + ${b}·${d} = ${answer}.`
    ),
    [
      { id: "x1", label: "u_x", value: a }, { id: "y1", label: "u_y", value: b },
      { id: "x2", label: "v_x", value: c }, { id: "y2", label: "v_y", value: d },
    ],
    labAdd(labMul(labConst("x1"), labConst("x2")), labMul(labConst("y1"), labConst("y2"))),
    0
  );
}

const VEC_DET_STATES = [
  { a: 1, b: 2, c: 2, d: 4 }, { a: 2, b: 3, c: 1, d: 4 }, { a: 3, b: 1, c: 2, d: 4 }, { a: 2, b: 5, c: 3, d: 4 }, { a: 1, b: 2, c: 3, d: 4 },
] as const;
const VEC_INV_STATES = [
  { a: 1, b: 2, c: 3, d: 4 }, { a: 2, b: 1, c: 5, d: 3 }, { a: 5, b: 2, c: 2, d: 1 }, { a: 3, b: 4, c: 2, d: 3 }, { a: 4, b: 3, c: 5, d: 4 },
] as const;

function vecDeterminantVariant(rand: () => number): VecVariant {
  const job = Math.floor(rand() * 3);
  if (job === 0) {
    const { a, b, c, d } = tiPick(rand, VEC_DET_STATES);
    const det = a * d - b * c;
    const added = a * d + b * c;
    const secondTrap = det === 0
      ? { value: a * d, feedback: `${a * d} stops at the main diagonal product ${a}·${d}. Subtract the other diagonal ${b}·${c}: ${det}.` }
      : { value: b * c - a * d, feedback: `${b * c - a * d} subtracts in the wrong order. det = ${a}·${d} − ${b}·${c} = ${det}.` };
    return vecLab(
      vecNumeric(
        `What is the determinant of [[${a}, ${b}], [${c}, ${d}]]?`,
        det,
        0,
        [
          { value: added, feedback: `${added} = ${a}·${d} + ${b}·${c} ADDS the diagonal products. The determinant subtracts: ${a}·${d} − ${b}·${c} = ${det}.` },
          secondTrap,
        ],
        `det = ${a}·${d} − ${b}·${c} = ${det}.`
      ),
      [
        { id: "a", label: "the top-left entry", value: a }, { id: "b", label: "the top-right entry", value: b },
        { id: "c", label: "the bottom-left entry", value: c }, { id: "d", label: "the bottom-right entry", value: d },
      ],
      labSub(labMul(labConst("a"), labConst("d")), labMul(labConst("b"), labConst("c"))),
      0
    );
  }
  if (job === 1) {
    const a = tiPick(rand, [2, 4, 5] as const);
    const bOptions = [2, 3].filter((x) => x !== a);
    const b = tiPick(rand, bOptions);
    const answer = tiRound(1 / a, 2);
    return vecLab(
      vecNumeric(
        `The inverse of [[${a}, 0], [0, ${b}]] has what top-left entry? (As a decimal.)`,
        answer,
        0.005,
        [
          { value: a, feedback: `${a} is the ORIGINAL entry. A diagonal matrix inverts entrywise: 1/${a} = ${answer}.` },
          { value: tiRound(1 / b, 2), feedback: `${tiRound(1 / b, 2)} = 1/${b} inverts the wrong diagonal entry. Top-left: 1/${a} = ${answer}.` },
        ],
        `Diagonal matrices invert entrywise, so the top-left becomes 1/${a} = ${answer}.`
      ),
      [{ id: "a", label: "the top-left entry", value: a }],
      labDiv(labLit(1), labConst("a")),
      2
    );
  }
  const { a, b, c, d } = tiPick(rand, VEC_INV_STATES);
  const det = a * d - b * c;
  const answer = tiRound(d / det, 2);
  const entrywise = tiRound(1 / a, 2);
  const traps: Array<{ value: number; feedback: string }> = [
    { value: entrywise, feedback: `${entrywise} = 1/${a} inverts entrywise — a 2×2 inverse swaps d into the top-left and divides by det = ${det}: ${answer}.` },
  ];
  if (d !== answer) traps.push({ value: d, feedback: `${d} swaps d into the top-left but forgets to divide by det = ${det}: ${d}/${det} = ${answer}.` });
  else traps.push({ value: -answer, feedback: `Keep the sign of det = ${det}: the top-left is ${d}/${det} = ${answer}.` });
  return vecLab(
    vecNumeric(
      `The inverse of [[${a}, ${b}], [${c}, ${d}]] has what top-left entry?`,
      answer,
      0.005,
      traps,
      `det = ${det}; the inverse's top-left is d/det = ${d}/${det} = ${answer}.`
    ),
    [
      { id: "a", label: "the top-left entry", value: a }, { id: "b", label: "the top-right entry", value: b },
      { id: "c", label: "the bottom-left entry", value: c }, { id: "d", label: "the bottom-right entry", value: d },
    ],
    labDiv(labConst("d"), labSub(labMul(labConst("a"), labConst("d")), labMul(labConst("b"), labConst("c")))),
    2
  );
}

const VEC_SYSTEM_STATES = [
  { a1: 2, b1: 1, c1: 5, a2: 1, b2: 3, c2: 10, x: 1, y: 3 },
  { a1: 3, b1: 1, c1: 9, a2: 1, b2: 2, c2: 8, x: 2, y: 3 },
  { a1: 1, b1: 2, c1: 8, a2: 2, b2: 1, c2: 7, x: 2, y: 3 },
  { a1: 2, b1: 3, c1: 12, a2: 1, b2: 1, c2: 5, x: 3, y: 2 },
  { a1: 3, b1: 2, c1: 13, a2: 1, b2: 4, c2: 11, x: 3, y: 2 },
] as const;
const vecTerm = (k: number, v: string): string => (k === 1 ? v : `${k}${v}`);

function vecSolveSystemsVariant(rand: () => number): VecVariant {
  const s = tiPick(rand, VEC_SYSTEM_STATES);
  const wantX = rand() < 0.5;
  const answer = wantX ? s.x : s.y;
  const other = wantX ? s.y : s.x;
  return vecLab(
    vecNumeric(
      `Solve the system ${vecTerm(s.a1, "x")} + ${vecTerm(s.b1, "y")} = ${s.c1}, ${vecTerm(s.a2, "x")} + ${vecTerm(s.b2, "y")} = ${s.c2} for ${wantX ? "x" : "y"}.`,
      answer,
      0,
      [
        { value: other, feedback: `${other} is ${wantX ? "y" : "x"}, the other unknown. The system solves at (x, y) = (${s.x}, ${s.y}), so ${wantX ? "x" : "y"} = ${answer}.` },
        { value: s.x + s.y, feedback: `${s.x + s.y} adds both unknowns. The solution point is (${s.x}, ${s.y}): ${wantX ? "x" : "y"} = ${answer}.` },
      ],
      `Elimination gives (x, y) = (${s.x}, ${s.y}), so ${wantX ? "x" : "y"} = ${answer}.`
    ),
    // The approx-expression grammar cannot run elimination; the constant below is what the
    // brute-force route in precalculusIndependent.cjs independently re-derives.
    [{ id: "sol", label: `the solved value of ${wantX ? "x" : "y"}`, value: answer }],
    labConst("sol"),
    0
  );
}

const VEC_ADD_STATES = [
  { a: 3, b: 0, c: 0, d: 4 }, { a: 1, b: 2, c: 2, d: 2 }, { a: 2, b: 3, c: 4, d: 5 }, { a: 1, b: 5, c: 4, d: 7 }, { a: 2, b: 2, c: 6, d: 13 },
] as const;

function vecAddVariant(rand: () => number): VecVariant {
  if (rand() < 0.5) {
    const { a, b, c, d } = tiPick(rand, VEC_ADD_STATES);
    const rx = a + c;
    const ry = b + d;
    const mag = Math.round(Math.hypot(rx, ry));
    const magSum = tiRound(Math.hypot(a, b) + Math.hypot(c, d), 2);
    /* When both addends lie on the axes, "add the lengths" and "add the components" produce the
     * same number — keep one and expose the stopped-before-the-root move instead. */
    const secondTrap = magSum === rx + ry
      ? { value: mag * mag, feedback: `${mag * mag} = ${rx}² + ${ry}² is the magnitude SQUARED. Finish with the square root: ${mag}.` }
      : { value: rx + ry, feedback: `${rx + ry} adds the components ${rx} + ${ry}. The magnitude is √(${rx * rx} + ${ry * ry}) = ${mag}.` };
    return vecLab(
      vecNumeric(
        `What is the magnitude of ⟨${a}, ${b}⟩ + ⟨${c}, ${d}⟩?`,
        mag,
        0,
        [
          { value: magSum, feedback: `${magSum} adds the two separate lengths. Add components first: ⟨${rx}, ${ry}⟩ has magnitude ${mag}.` },
          secondTrap,
        ],
        `The sum is ⟨${rx}, ${ry}⟩, and √(${rx * rx} + ${ry * ry}) = ${mag}.`
      ),
      [
        { id: "x1", label: "u_x", value: a }, { id: "y1", label: "u_y", value: b },
        { id: "x2", label: "v_x", value: c }, { id: "y2", label: "v_y", value: d },
      ],
      labSqrt(labAdd(
        labMul(labAdd(labConst("x1"), labConst("x2")), labAdd(labConst("x1"), labConst("x2"))),
        labMul(labAdd(labConst("y1"), labConst("y2")), labAdd(labConst("y1"), labConst("y2")))
      )),
      0
    );
  }
  const [a, b, c] = tiPick(rand, TI_TRIPLES);
  return vecLab(
    vecNumeric(
      `Two forces ⟨${a}, 0⟩ N and ⟨0, ${b}⟩ N act on a point. What is the magnitude of the resultant, in newtons?`,
      c,
      0,
      [
        { value: a + b, feedback: `${a + b} = ${a} + ${b} adds the two strengths head-to-head — but the forces act at right angles: √(${a * a} + ${b * b}) = ${c}.` },
        { value: Math.abs(a - b), feedback: `${Math.abs(a - b)} subtracts them as if opposed. Perpendicular forces combine by the Pythagorean rule: ${c} N.` },
      ],
      `The resultant is ⟨${a}, ${b}⟩ with magnitude √(${a * a} + ${b * b}) = ${c} N.`
    ),
    [{ id: "fx", label: "the horizontal force", value: a }, { id: "fy", label: "the vertical force", value: b }],
    labSqrt(labAdd(labMul(labConst("fx"), labConst("fx")), labMul(labConst("fy"), labConst("fy")))),
    0
  );
}

const VEC_BALANCE_STATES = [
  { p: 5, q: 2, r: -1, s: 3 }, { p: 3, q: 4, r: 2, s: -1 }, { p: 6, q: 1, r: -2, s: 3 }, { p: 2, q: 5, r: 3, s: -2 }, { p: 4, q: 3, r: -1, s: 2 },
] as const;

function vecApplicationsVariant(rand: () => number): VecVariant {
  if (rand() < 0.5) {
    const [u, v, c] = tiPick(rand, TI_TRIPLES);
    return vecLab(
      vecNumeric(
        `A boat's velocity ⟨0, ${v}⟩ m/s combines with a current ⟨${u}, 0⟩ m/s. What is the resulting speed, in m/s?`,
        c,
        0,
        [
          { value: u + v, feedback: `${u + v} = ${u} + ${v} adds the two speeds directly — but they act at right angles: √(${u * u} + ${v * v}) = ${c}.` },
          { value: v, feedback: `${v} ignores the current. The resultant is ⟨${u}, ${v}⟩ with magnitude ${c} m/s.` },
        ],
        `The resultant ⟨${u}, ${v}⟩ has speed √(${u * u} + ${v * v}) = ${c} m/s.`
      ),
      [{ id: "u", label: "the current speed", value: u }, { id: "v", label: "the boat speed", value: v }],
      labSqrt(labAdd(labMul(labConst("u"), labConst("u")), labMul(labConst("v"), labConst("v")))),
      0
    );
  }
  const { p, q, r, s } = tiPick(rand, VEC_BALANCE_STATES);
  const rx = p + r;
  const ry = q + s;
  const answer = tiRound(Math.hypot(rx, ry), 2);
  const magSum = tiRound(Math.hypot(p, q) + Math.hypot(r, s), 2);
  return vecLab(
    vecNumeric(
      `Forces ⟨${p}, ${q}⟩ and ⟨${r}, ${s}⟩ act on a point. What magnitude of third force balances them? (Two decimals.)`,
      answer,
      0.01,
      [
        { value: magSum, feedback: `${magSum} adds the two separate magnitudes. Sum the components first: the resultant is ⟨${rx}, ${ry}⟩, so the balancer needs magnitude ≈ ${answer}.` },
        { value: rx + ry, feedback: `${rx + ry} adds the resultant's components. Its magnitude is √(${rx * rx} + ${ry * ry}) ≈ ${answer}.` },
      ],
      `The resultant is ⟨${rx}, ${ry}⟩; the balancing force must match its magnitude ≈ ${answer}.`
    ),
    [{ id: "rx", label: "the resultant's x-component", value: rx }, { id: "ry", label: "the resultant's y-component", value: ry }],
    labSqrt(labAdd(labMul(labConst("rx"), labConst("rx")), labMul(labConst("ry"), labConst("ry")))),
    2
  );
}

const VEC_MATRIX_STATES = [
  { a: 1, b: 2, c: 3, d: 4 }, { a: 2, b: 1, c: 4, d: 3 }, { a: 3, b: 1, c: 2, d: 5 }, { a: 1, b: 3, c: 2, d: 6 },
] as const;
const VEC_MATVEC_STATES = [
  { a: 3, b: 1, c: 2, d: 4, e: 2, f: 1 }, { a: 2, b: 3, c: 1, d: 2, e: 1, f: 2 }, { a: 4, b: 1, c: 3, d: 2, e: 2, f: 3 }, { a: 1, b: 2, c: 5, d: 1, e: 3, f: 1 },
] as const;

function vecMatrixArithVariant(rand: () => number): VecVariant {
  if (rand() < 0.5) {
    const k = tiPick(rand, [2, 3] as const);
    const { a, b, c, d } = tiPick(rand, VEC_MATRIX_STATES);
    return vecLab(
      vecNumeric(
        `What is the bottom-right entry of ${k}·[[${a}, ${b}], [${c}, ${d}]]?`,
        k * d,
        0,
        [
          { value: d, feedback: `${d} forgets the scalar. Every entry scales by ${k}: bottom-right = ${k}·${d} = ${k * d}.` },
          { value: k * a, feedback: `${k * a} = ${k}·${a} scales the TOP-LEFT entry. Bottom-right is ${k}·${d} = ${k * d}.` },
        ],
        `Scalar multiplication scales every entry: bottom-right = ${k}·${d} = ${k * d}.`
      ),
      [{ id: "k", label: "the scalar", value: k }, { id: "d", label: "the bottom-right entry", value: d }],
      labMul(labConst("k"), labConst("d")),
      0
    );
  }
  const { a, b, c, d, e, f } = tiPick(rand, VEC_MATVEC_STATES);
  const answer = a * e + b * f;
  const yComp = c * e + d * f;
  return vecLab(
    vecNumeric(
      `Compute [[${a}, ${b}], [${c}, ${d}]]·⟨${e}, ${f}⟩ and enter the x-component.`,
      answer,
      0,
      [
        { value: yComp, feedback: `${yComp} = ${c}·${e} + ${d}·${f} is the y-component (bottom row). The x-component uses the TOP row: ${a}·${e} + ${b}·${f} = ${answer}.` },
        { value: a * e, feedback: `${a * e} = ${a}·${e} keeps only the first product. The row dots the whole vector: ${a}·${e} + ${b}·${f} = ${answer}.` },
      ],
      `x-component = top row · vector = ${a}·${e} + ${b}·${f} = ${answer}.`
    ),
    [
      { id: "a", label: "the top-left entry", value: a }, { id: "b", label: "the top-right entry", value: b },
      { id: "e", label: "the vector's x", value: e }, { id: "f", label: "the vector's y", value: f },
    ],
    labAdd(labMul(labConst("a"), labConst("e")), labMul(labConst("b"), labConst("f"))),
    0
  );
}

const VEC_ROTATE_STATES = [
  { x: 1, y: 0, axis: "y" }, { x: 2, y: 3, axis: "y" }, { x: 3, y: 1, axis: "x" }, { x: 1, y: 4, axis: "x" }, { x: 4, y: 2, axis: "y" },
] as const;

function vecRotationVariant(rand: () => number): VecVariant {
  if (rand() < 0.5) {
    const [a, b] = tiPick(rand, [[3, 2], [2, 5], [4, 1], [1, 3]] as const);
    const sq = a * a + b * b;
    const answer = tiRound(Math.sqrt(sq), 2);
    return vecLab(
      vecNumeric(
        `⟨${a}, ${b}⟩ has magnitude √${sq} ≈ ${answer}. After a 90° rotation to ⟨−${b}, ${a}⟩, its magnitude is what, to two decimals?`,
        answer,
        0.01,
        [
          { value: sq, feedback: `${sq} is the magnitude SQUARED. Rotation preserves length: √${sq} ≈ ${answer}.` },
          { value: a + b, feedback: `${a + b} adds the components. The rotated vector keeps the same length: √(${b * b} + ${a * a}) ≈ ${answer}.` },
        ],
        `Rotations preserve magnitude: |⟨−${b}, ${a}⟩| = √${sq} ≈ ${answer}.`
      ),
      [{ id: "x", label: "the x-component", value: a }, { id: "y", label: "the y-component", value: b }],
      labSqrt(labAdd(labMul(labConst("x"), labConst("x")), labMul(labConst("y"), labConst("y")))),
      2
    );
  }
  const { x, y, axis } = tiPick(rand, VEC_ROTATE_STATES);
  const answer = axis === "y" ? x : -y;
  const traps = axis === "y"
    ? [
        { value: y, feedback: `${y} keeps the old y-component. A 90° CCW turn sends ⟨x, y⟩ → ⟨−y, x⟩: the new y is the old x = ${x}.` },
        { value: -x, feedback: `Watch the signs: the minus lands on the NEW x (−y). The new y-component is +x = ${x}.` },
      ]
    : [
        { value: x, feedback: `${x} keeps the old x-component. A 90° CCW turn sends ⟨x, y⟩ → ⟨−y, x⟩: the new x is −y = ${-y}.` },
        { value: y, feedback: `${y} forgets the sign flip. The new x-component is −y = ${-y}.` },
      ];
  return vecLab(
    vecNumeric(
      `Rotate ⟨${x}, ${y}⟩ by 90° CCW and enter the resulting ${axis}-component.`,
      answer,
      0,
      traps,
      `⟨${x}, ${y}⟩ → ⟨${-y}, ${x}⟩ under a 90° CCW turn, so the ${axis}-component is ${answer}.`
    ),
    [{ id: "x", label: "the x-component", value: x }, { id: "y", label: "the y-component", value: y }],
    axis === "y" ? labConst("x") : labNeg(labConst("y")),
    0
  );
}

function vecComponentsVariant(rand: () => number): VecVariant {
  const [a, b, c] = tiPick(rand, TI_TRIPLES);
  const sx = rand() < 0.5 ? -1 : 1;
  const xText = sx < 0 ? `−${a}` : `${a}`;
  return vecLab(
    vecNumeric(
      `What is the magnitude of v = ⟨${xText}, ${b}⟩?`,
      c,
      0,
      [
        { value: a + b, feedback: `${a + b} adds the component sizes. The magnitude squares first: √(${a * a} + ${b * b}) = ${c}.` },
        { value: c * c, feedback: `${c * c} is the magnitude SQUARED. Finish with the square root: ${c}.` },
      ],
      `|v| = √((${xText})² + ${b}²) = √${c * c} = ${c} — signs vanish in the squares.`
    ),
    [{ id: "x", label: "the x-component", value: sx * a }, { id: "y", label: "the y-component", value: b }],
    labSqrt(labAdd(labMul(labConst("x"), labConst("x")), labMul(labConst("y"), labConst("y")))),
    0
  );
}

/* S331 / lane G1. The fifteen g12-polar-parametric forms below (numeric and pointEntry) drew
 * from 1–4 fixed rows. Each now draws genuine polar/parametric states — radii, special angles,
 * rose parameters, launch velocities, complex powers — that change the answer. The parsers in
 * precalculusIndependent.cjs re-derive every value from the printed prompt: conversions by
 * evaluating r·cos θ / r·sin θ literally, complex powers by repeated multiplication, landings by
 * integer search, arguments by atan2 on the printed components. */

const PP_FORM = (stem: string): string => `polar-parametric__${stem}`;
type PpVariant = { tag: "g12-polar-parametric"; widget: any; answer: any };

function ppNumeric(prompt: string, answer: number, tolerance: number, commonErrors: Array<{ value: number; feedback: string }>, fallbackFeedback: string): PpVariant {
  return {
    tag: "g12-polar-parametric",
    widget: {
      type: "numeric" as const,
      prompt: tiMinus(prompt),
      answer,
      tolerance,
      commonErrors: commonErrors.map((e) => ({ value: e.value, feedback: tiMinus(tiPad(e.feedback)) })),
      fallbackFeedback: tiMinus(tiPad(fallbackFeedback)),
    },
    answer,
  };
}

function ppPoint(prompt: string, answer: readonly [number, number], commonEntries: Array<{ values: [number, number]; feedback: string }>, fallbackFeedback: string, successFeedback: string): PpVariant {
  return {
    tag: "g12-polar-parametric",
    widget: {
      type: "pointEntry" as const,
      prompt: tiMinus(prompt),
      answer: [...answer],
      delimiter: "paren",
      commonEntries: commonEntries.map((e) => ({ values: [...e.values], feedback: tiMinus(tiPad(e.feedback)) })),
      fallbackFeedback: tiMinus(tiPad(fallbackFeedback)),
      successFeedback: tiMinus(tiPad(successFeedback)),
    },
    answer: [...answer],
  };
}

const PP_PATH_STATES = [
  { p: 4, q: 3, D: 45 }, { p: 5, q: 4, D: 32 }, { p: 3, q: 2, D: 50 }, { p: 2, q: 1, D: 35 }, { p: 3, q: 4, D: 60 },
] as const;

function ppParabolicPathVariant(rand: () => number): PpVariant {
  const job = Math.floor(rand() * 3);
  if (job === 0) {
    const { p, q, D } = tiPick(rand, PP_PATH_STATES);
    const landing = (D * p) / q;
    return ppNumeric(
      `From the path y = (${p}/${q})x − x²/${D}, the ball lands (y = 0) at what x > 0? (In meters.)`,
      landing,
      0.5,
      [
        { value: D, feedback: `${D} keeps only the quadratic's divisor. Setting (${p}/${q}) − x/${D} = 0 gives x = ${D}·(${p}/${q}) = ${landing} m.` },
        { value: 0, feedback: `x = 0 is the LAUNCH point. The other root is the landing at x = ${landing} m.` },
      ],
      `Factoring x out leaves (${p}/${q}) = x/${D}, so x = ${D}·${p}/${q} = ${landing} m.`
    );
  }
  if (job === 1) {
    const L = tiPick(rand, [40, 60, 70, 80, 90] as const);
    return ppNumeric(
      `The trajectory's highest point is horizontally midway between launch (x = 0) and landing (x = ${L}). At what x? (In meters.)`,
      L / 2,
      0,
      [
        { value: L, feedback: `${L} is the LANDING point. The peak is halfway: (0 + ${L})/2 = ${L / 2} m.` },
        { value: L / 4, feedback: `The midpoint of 0 and ${L} is ${L / 2} m, not ${L / 4}.` },
      ],
      `Halfway between 0 and ${L} is ${L / 2} m.`
    );
  }
  /* vy = 20 is excluded: v_y²/(2g) = 20 there, colliding with the echo-v_y trap. */
  const vy = tiPick(rand, [25, 30, 40, 50] as const);
  const vx = tiPick(rand, [10, 15] as const);
  const h = (vy * vy) / 20;
  return ppNumeric(
    `A ball launches with vₓ = ${vx}, v_y = ${vy}, g = 10. What is its maximum height? (In meters.)`,
    h,
    0.005,
    [
      { value: (vy * vy) / 10, feedback: `${(vy * vy) / 10} = v_y²/g forgets the factor 2: v_y²/(2g) = ${vy * vy}/20 = ${h} m.` },
      { value: vy, feedback: `${vy} = v_y, the initial vertical speed. Max height = v_y²/(2g) = ${h} m.` },
    ],
    `Max height = v_y²/(2g) = ${vy * vy}/20 = ${h} m.`
  );
}

const PP_RECT_STATES = [
  { r: 4, ths: "π/3" }, { r: 2, ths: "3π/4" }, { r: 3, ths: "π/6" }, { r: 6, ths: "2π/3" }, { r: 2, ths: "π/4" }, { r: 4, ths: "5π/6" },
] as const;
const ppTh = (ths: string): number => {
  const m = ths.match(/^(\d*)π\/(\d+)$/)!;
  return ((m[1] === "" ? 1 : Number(m[1])) * Math.PI) / Number(m[2]);
};

function ppToRectVariant(rand: () => number): PpVariant {
  const sumJob = rand() >= 0.75;
  /* θ = 3π/4 is excluded from the sum job: cos θ + sin θ = 0 there, so the answer and its
   * sign-slip trap collapse onto 0 together. */
  const statePool = sumJob ? PP_RECT_STATES.filter((s) => s.ths !== "3π/4") : [...PP_RECT_STATES];
  const { r, ths } = tiPick(rand, statePool);
  const th = ppTh(ths);
  if (!sumJob) {
    const wantX = rand() < 0.5;
    const answer = tiRound(r * (wantX ? Math.cos(th) : Math.sin(th)), 4);
    const other = tiRound(r * (wantX ? Math.sin(th) : Math.cos(th)), 4);
    const candidates: Array<{ value: number; feedback: string }> = [
      { value: other, feedback: `${other} is the ${wantX ? "y" : "x"}-coordinate (r·${wantX ? "sin" : "cos"} θ). The ${wantX ? "x" : "y"} uses ${wantX ? "COSINE" : "SINE"}: ${r}·${wantX ? "cos" : "sin"}(${ths}) ≈ ${answer}.` },
      { value: -answer, feedback: `Watch the sign of ${wantX ? "cos" : "sin"}(${ths}): the coordinate is ≈ ${answer}, with the sign the formula produces.` },
      { value: r, feedback: `${r} forgets the ${wantX ? "cosine" : "sine"} factor entirely: ${r}·${wantX ? "cos" : "sin"}(${ths}) ≈ ${answer}.` },
    ];
    const seen = new Set([answer]);
    const traps = candidates.filter((cand) => {
      if (seen.has(cand.value) || Math.abs(cand.value - answer) <= 0.0005) return false;
      seen.add(cand.value);
      return true;
    }).slice(0, 2);
    return ppNumeric(
      `For the polar point (${r}, ${ths}), what is ${wantX ? "x" : "y"}? (To four decimals.)`,
      answer,
      0.0005,
      traps,
      `${wantX ? "x" : "y"} = r·${wantX ? "cos" : "sin"} θ = ${r}·${wantX ? "cos" : "sin"}(${ths}) ≈ ${answer}.`
    );
  }
  const answer = tiRound(r * (Math.cos(th) + Math.sin(th)), 4);
  const subbed = tiRound(r * (Math.cos(th) - Math.sin(th)), 4);
  return ppNumeric(
    `Convert (${r}, ${ths}) to rectangular and report x + y, to four decimals.`,
    answer,
    0.001,
    [
      { value: -answer, feedback: `Sign slip somewhere: x = ${tiRound(r * Math.cos(th), 4)} and y = ${tiRound(r * Math.sin(th), 4)}, so x + y ≈ ${answer}.` },
      { value: subbed, feedback: `${subbed} subtracts y from x. The report asks for the SUM: x + y ≈ ${answer}.` },
    ],
    `x = ${r}·cos(${ths}) and y = ${r}·sin(${ths}); their sum is ≈ ${answer}.`
  );
}

const PP_ROSE_STATES = [
  { a: 2, n: 4, fn: "sin" }, { a: 5, n: 2, fn: "cos" }, { a: 3, n: 5, fn: "sin" }, { a: 6, n: 7, fn: "cos" }, { a: 4, n: 3, fn: "cos" }, { a: 2, n: 6, fn: "sin" },
] as const;

function ppRosesVariant(rand: () => number): PpVariant {
  const { a, n, fn } = tiPick(rand, PP_ROSE_STATES);
  const count = n % 2 === 0 ? 2 * n : n;
  const job = Math.floor(rand() * 3);
  if (job === 0) {
    const traps = n % 2 === 0
      ? [
          { value: n, feedback: `n = ${n} is EVEN, so the count is 2n = ${count}, not n. The negative-r lobes are separate petals.` },
          { value: 2 * n * n, feedback: `It's 2n, not 2n²: 2·${n} = ${count}.` },
        ]
      : [
          { value: 2 * n, feedback: `${2 * n} doubles — but n = ${n} is ODD, so the negative-r lobes retrace: ${count} petals.` },
          { value: n * n, feedback: `${n * n} squares n. Odd n keeps exactly n petals: ${count}.` },
        ];
    return ppNumeric(
      `How many petals does r = ${a} ${fn}(${n}θ) have?`,
      count,
      0,
      traps,
      `n = ${n} is ${n % 2 === 0 ? "even, so the rose shows 2n" : "odd, so the rose shows n"} = ${count} petals.`
    );
  }
  if (job === 1) {
    const candidates: Array<{ value: number; feedback: string }> = [
      { value: n, feedback: `${n} is n (the petal-count driver), not the length. Length = |a| = ${a}.` },
      { value: count, feedback: `${count} counts petals, not length. Each petal reaches |a| = ${a}.` },
      { value: a + n, feedback: `${a + n} adds the two dials. Each petal reaches exactly |a| = ${a}.` },
    ];
    const seen = new Set<number>([a]);
    const traps = candidates.filter((cand) => {
      if (seen.has(cand.value)) return false;
      seen.add(cand.value);
      return true;
    }).slice(0, 2);
    return ppNumeric(
      `How long is each petal of r = ${a} ${fn}(${n}θ)?`,
      a,
      0,
      traps,
      `The amplitude |a| = ${a} sets each petal's reach.`
    );
  }
  const wrongCount = n % 2 === 0 ? n : 2 * n;
  return ppNumeric(
    `For r = ${a} ${fn}(${n}θ), compute (number of petals) × (petal length).`,
    count * a,
    0,
    [
      { value: wrongCount * a, feedback: `${wrongCount * a} = ${wrongCount} × ${a} uses ${wrongCount} petals, but n = ${n} is ${n % 2 === 0 ? "EVEN → 2n" : "ODD → n"} = ${count} petals: ${count} × ${a} = ${count * a}.` },
      { value: count + a, feedback: `${count + a} = ${count} + ${a} adds them. The problem asks for the PRODUCT: ${count} × ${a} = ${count * a}.` },
    ],
    `${count} petals of length ${a} give ${count} × ${a} = ${count * a}.`
  );
}

const PP_LIMACON_STATES = [
  { a: 2, b: 3, fn: "cos" }, { a: 4, b: 4, fn: "sin" }, { a: 3, b: 2, fn: "cos" }, { a: 5, b: 3, fn: "sin" }, { a: 3, b: 4, fn: "sin" }, { a: 5, b: 2, fn: "cos" },
] as const;

function ppLimaconsVariant(rand: () => number): PpVariant {
  const { a, b, fn } = tiPick(rand, PP_LIMACON_STATES);
  const wantMax = a < b ? true : rand() < 0.5;
  if (wantMax) {
    const answer = a + b;
    const candidates: Array<{ value: number; feedback: string }> = [
      { value: b, feedback: `${b} is b alone. Max r is at ${fn} θ = 1: a + b = ${a} + ${b} = ${answer}.` },
      { value: a - b, feedback: `${a - b} = a − b is the MINIMUM. The max is a + b = ${answer}.` },
      { value: a, feedback: `${a} is a alone, ignoring the swing. Max r = a + b = ${answer}.` },
    ];
    const seen = new Set([answer]);
    const traps = candidates.filter((cand) => {
      if (seen.has(cand.value)) return false;
      seen.add(cand.value);
      return true;
    }).slice(0, 2);
    return ppNumeric(
      `What is the maximum value of r for r = ${a} + ${b} ${fn} θ?`,
      answer,
      0,
      traps,
      `Max r happens where ${fn} θ = 1: a + b = ${a} + ${b} = ${answer}.`
    );
  }
  const answer = a - b;
  const candidates: Array<{ value: number; feedback: string }> = [
    { value: a + b, feedback: `${a + b} is the MAX (at ${fn} θ = 1). The minimum uses ${fn} θ = −1: a − b = ${answer}.` },
    { value: b, feedback: `${b} is b alone. Min r = a − b = ${a} − ${b} = ${answer}.` },
    { value: a, feedback: `${a} is a alone. Min r = a − b = ${answer}.` },
  ];
  const seen = new Set([answer]);
  const traps = candidates.filter((cand) => {
    if (seen.has(cand.value)) return false;
    seen.add(cand.value);
    return true;
  }).slice(0, 2);
  return ppNumeric(
    `What is the minimum value of r for r = ${a} + ${b} ${fn} θ?`,
    answer,
    0,
    traps,
    `Min r happens where ${fn} θ = −1: a − b = ${a} − ${b} = ${answer}.`
  );
}

const PP_POWER_STATES = [
  { zs: "(1 + i)⁴", ans: -4, traps: [
    { value: 4, feedback: "The angle 4·π/4 = π lands on the NEGATIVE real axis: 4(cos π) = −4, not +4." },
    { value: 16, feedback: "16 = (√2)⁸ squares the exponent. Modulus is (√2)⁴ = 4, and cos π = −1: −4." },
  ] },
  { zs: "(1 + i)⁸", ans: 16, traps: [
    { value: -16, feedback: "Angle 8·π/4 = 2π ≡ 0, NOT π. cos 0 = +1, so +16." },
    { value: 256, feedback: "256 = (√2)¹⁶ doubles the exponent. (√2)⁸ = 16, times cos 2π = 1: +16." },
  ] },
  { zs: "(1 + i√3)³", ans: -8, traps: [
    { value: 8, feedback: "Angle 3·π/3 = π gives cos π = −1: the result is −8, not +8." },
    { value: 2, feedback: "2 is the modulus r, not r³. Modulus cubed = 8, times cos π = −1: −8." },
  ] },
  { zs: "(1 − i)⁴", ans: -4, traps: [
    { value: 4, feedback: "The angle 4·(−π/4) = −π also lands on the NEGATIVE real axis: 4·cos(−π) = −4." },
    { value: 16, feedback: "16 = (√2)⁸ squares the exponent. Modulus is (√2)⁴ = 4, and cos(−π) = −1: −4." },
  ] },
  { zs: "(1 + i√3)⁶", ans: 64, traps: [
    { value: -64, feedback: "Angle 6·π/3 = 2π ≡ 0, NOT π. cos 2π = +1, so +64." },
    { value: 12, feedback: "12 = 2·6 multiplies the modulus by the exponent. De Moivre RAISES it: 2⁶ = 64, times cos 2π = 1." },
  ] },
] as const;

function ppDeMoivreVariant(rand: () => number): PpVariant {
  if (rand() < 0.4) {
    const [A, B] = tiPick(rand, [[20, 40], [30, 45], [25, 50], [15, 60], [35, 55]] as const);
    return ppNumeric(
      `Two complex numbers have arguments ${A}° and ${B}°. Their product has what argument, in degrees?`,
      A + B,
      0,
      [
        { value: A * B, feedback: `${A * B} = ${A}·${B} MULTIPLIES the angles. Arguments ADD under multiplication: ${A} + ${B} = ${A + B}°.` },
        { value: A, feedback: `${A}° is just the first angle. Add the second: ${A} + ${B} = ${A + B}°.` },
      ],
      `Arguments add when complex numbers multiply: ${A}° + ${B}° = ${A + B}°.`
    );
  }
  const state = tiPick(rand, PP_POWER_STATES);
  return ppNumeric(
    `Use De Moivre to find ${state.zs}. (It is a real number; enter it.)`,
    state.ans,
    0,
    [...state.traps],
    `Raise the modulus to the power and multiply the argument: ${state.zs} = ${state.ans}.`
  );
}

function ppProjectileVariant(rand: () => number): PpVariant {
  const vy = tiPick(rand, [20, 25, 30, 40] as const);
  const tOptions = [1, 2, 3].filter((t) => vy * t - 5 * t * t > 0);
  const t = tiPick(rand, tOptions);
  const y = vy * t - 5 * t * t;
  if (rand() < 0.5) {
    return ppNumeric(
      `With v_y = ${vy} m/s and g = 10, use y = v_y·t − ½g t² to find the height at t = ${t} s.`,
      y,
      0,
      [
        { value: vy * t, feedback: `${vy * t} = v_y·t alone ignores the −½g t² fall term: ${vy * t} − ${5 * t * t} = ${y} m.` },
        { value: vy * t - 10 * t * t, feedback: `The fall term is ½·10·${t}² = ${5 * t * t}, not ${10 * t * t}: ${vy * t} − ${5 * t * t} = ${y} m.` },
      ],
      `y = ${vy}·${t} − 5·${t}² = ${vy * t} − ${5 * t * t} = ${y} m.`
    );
  }
  const vxOptions = [10, 15, 25].filter((vx) => vx * t !== y && vx !== vy);
  const vx = tiPick(rand, vxOptions);
  return ppNumeric(
    `A ball has vₓ = ${vx}, v_y = ${vy} (g = 10). What is its height y at t = ${t} s?`,
    y,
    0,
    [
      { value: vx * t, feedback: `${vx * t} is the horizontal position x = ${vx}·${t}. The height is y = ${vy * t} − ${5 * t * t} = ${y} m.` },
      { value: vy * t, feedback: `${vy * t} = ${vy}·${t} forgets the fall term 5·${t}² = ${5 * t * t}: height is ${y} m.` },
    ],
    `y = v_y·t − ½g t² = ${vy * t} − ${5 * t * t} = ${y} m.`
  );
}

const PP_POLAR_POINT_STATES = [
  { r: 2, ths: "π", ans: [-2, 0] as const, traps: [
    { values: [2, 0] as [number, number], feedback: "That's angle 0. θ = π points the OTHER way: (−2, 0)." },
    { values: [0, 2] as [number, number], feedback: "(0, 2) would need θ = π/2. Angle π points left: (−2, 0)." },
  ] },
  { r: 4, ths: "π", ans: [-4, 0] as const, traps: [
    { values: [4, 0] as [number, number], feedback: "That's angle 0. θ = π points the OTHER way: (−4, 0)." },
    { values: [0, 4] as [number, number], feedback: "(0, 4) would need θ = π/2. Angle π points left: (−4, 0)." },
  ] },
  { r: 3, ths: "π/2", ans: [0, 3] as const, traps: [
    { values: [3, 0] as [number, number], feedback: "That's angle 0, along the +x axis. θ = π/2 points straight up: (0, 3)." },
    { values: [0, -3] as [number, number], feedback: "(0, −3) is angle 3π/2, pointing down. π/2 points up: (0, 3)." },
  ] },
  { r: 5, ths: "π/2", ans: [0, 5] as const, traps: [
    { values: [5, 0] as [number, number], feedback: "That's angle 0, along the +x axis. θ = π/2 points straight up: (0, 5)." },
    { values: [0, -5] as [number, number], feedback: "(0, −5) is angle 3π/2, pointing down. π/2 points up: (0, 5)." },
  ] },
  { r: 2, ths: "3π/2", ans: [0, -2] as const, traps: [
    { values: [0, 2] as [number, number], feedback: "(0, 2) is angle π/2, pointing up. 3π/2 points DOWN: (0, −2)." },
    { values: [-2, 0] as [number, number], feedback: "(−2, 0) is angle π, pointing left. 3π/2 points down: (0, −2)." },
  ] },
] as const;

function ppPolarSystemPointVariant(rand: () => number): PpVariant {
  const state = tiPick(rand, PP_POLAR_POINT_STATES);
  return ppPoint(
    `Where is the polar point (${state.r}, ${state.ths}) in rectangular coordinates?`,
    state.ans,
    state.traps.map((t) => ({ values: [...t.values] as [number, number], feedback: t.feedback })),
    `Convert with x = r cos θ, y = r sin θ: angle ${state.ths} fixes the direction, ${state.r} the distance.`,
    `Angle ${state.ths} with r = ${state.r} lands at (${state.ans[0]}, ${state.ans[1]}).`
  );
}

function ppCirclesPointVariant(rand: () => number): PpVariant {
  const a = tiPick(rand, [1, 2, 3] as const);
  const sinForm = rand() < 0.5;
  const coeff = 2 * a;
  const ans: [number, number] = sinForm ? [0, a] : [a, 0];
  const traps = sinForm
    ? [
        { values: [a, 0] as [number, number], feedback: `That's a COSINE circle's center. Sine puts the center on the y-axis: (0, ${a}).` },
        { values: [0, coeff] as [number, number], feedback: `The center distance is HALF the coefficient: ${coeff}/2 = ${a}, giving (0, ${a}).` },
      ]
    : [
        { values: [0, a] as [number, number], feedback: `That's a SINE circle's center. Cosine puts the center on the x-axis: (${a}, 0).` },
        { values: [coeff, 0] as [number, number], feedback: `The center distance is HALF the coefficient: ${coeff}/2 = ${a}, giving (${a}, 0).` },
      ];
  return ppPoint(
    `Where is the center of the circle r = ${coeff} ${sinForm ? "sin" : "cos"} θ?`,
    ans,
    traps,
    `A ${sinForm ? "sine" : "cosine"} circle centers on the ${sinForm ? "y" : "x"}-axis at HALF the coefficient: ${coeff}/2 = ${a}.`,
    `${sinForm ? "Sine" : "Cosine"} centers on the ${sinForm ? "y" : "x"}-axis; half of ${coeff} is ${a}, radius ${a}.`
  );
}

function ppCirclesNumericVariant(rand: () => number): PpVariant {
  const a = tiPick(rand, [2, 3, 4, 5] as const);
  const fn = rand() < 0.5 ? "sin" : "cos";
  return ppNumeric(
    `What is the radius of the circle r = ${2 * a} ${fn} θ?`,
    a,
    0,
    [
      { value: 2 * a, feedback: `${2 * a} is the coefficient (2a). The radius is |a| = ${2 * a}/2 = ${a}.` },
      { value: a / 2, feedback: `Halving twice lands at ${a / 2}. 2a = ${2 * a} → a = ${a}, and radius = |a| = ${a}.` },
    ],
    `r = ${2 * a} ${fn} θ is a circle of radius ${2 * a}/2 = ${a}.`
  );
}

const PP_ARG_STATES = [
  { zText: "−1 − i√3", x: -1, y: -Math.sqrt(3), frac: "4π/3", ans: 4.19, traps: [
    { value: 1.05, feedback: "1.05 ≈ π/3 is the reference angle only. In Q3 add π: 4π/3 ≈ 4.19." },
    { value: 2.09, feedback: "2.09 ≈ 2π/3 is Q2. Both parts here are negative → Q3: 4π/3 ≈ 4.19." },
  ] },
  { zText: "−1 + i√3", x: -1, y: Math.sqrt(3), frac: "2π/3", ans: 2.09, traps: [
    { value: 1.05, feedback: "1.05 ≈ π/3 is the reference angle only. Negative real, positive imaginary → Q2: 2π/3 ≈ 2.09." },
    { value: 4.19, feedback: "4.19 ≈ 4π/3 is Q3, where BOTH parts are negative. Here only the real part is: 2π/3 ≈ 2.09." },
  ] },
  { zText: "−√3 − i", x: -Math.sqrt(3), y: -1, frac: "7π/6", ans: 3.67, traps: [
    { value: 0.52, feedback: "0.52 ≈ π/6 is the reference angle only. In Q3 add π: 7π/6 ≈ 3.67." },
    { value: 2.62, feedback: "2.62 ≈ 5π/6 is Q2. Both parts negative → Q3: 7π/6 ≈ 3.67." },
  ] },
  { zText: "−1 + i", x: -1, y: 1, frac: "3π/4", ans: 2.36, traps: [
    { value: 0.79, feedback: "0.79 ≈ π/4 is the reference angle only. Q2 subtracts from π: 3π/4 ≈ 2.36." },
    { value: 5.5, feedback: "5.5 ≈ 7π/4 is Q4, the mirror below the axis. Here the imaginary part is positive: 3π/4 ≈ 2.36." },
  ] },
  { zText: "1 − i√3", x: 1, y: -Math.sqrt(3), frac: "5π/3", ans: 5.24, traps: [
    { value: 1.05, feedback: "1.05 ≈ π/3 is the reference angle only. Q4 subtracts from 2π: 5π/3 ≈ 5.24." },
    { value: 4.19, feedback: "4.19 ≈ 4π/3 is Q3, where the real part is also negative. Here it is positive: 5π/3 ≈ 5.24." },
  ] },
  { zText: "−√3 + i", x: -Math.sqrt(3), y: 1, frac: "5π/6", ans: 2.62, traps: [
    { value: 0.52, feedback: "0.52 ≈ π/6 is the reference angle only. Q2 subtracts from π: 5π/6 ≈ 2.62." },
    { value: 3.67, feedback: "3.67 ≈ 7π/6 is Q3, where the imaginary part is also negative. Here it is positive: 5π/6 ≈ 2.62." },
  ] },
  { zText: "1 − i", x: 1, y: -1, frac: "7π/4", ans: 5.5, traps: [
    { value: 0.79, feedback: "0.79 ≈ π/4 is the reference angle only. Q4 subtracts from 2π: 7π/4 ≈ 5.50." },
    { value: 2.36, feedback: "2.36 ≈ 3π/4 is Q2, the mirror above the axis. Here the imaginary part is negative: 7π/4 ≈ 5.50." },
  ] },
] as const;

function ppPolarFormVariant(rand: () => number): PpVariant {
  const state = tiPick(rand, PP_ARG_STATES);
  return ppNumeric(
    `The argument of z = ${state.zText} (in [0, 2π)) is ${state.frac}. Enter it as a decimal to hundredths.`,
    state.ans,
    0.02,
    [...state.traps],
    `${state.frac} converted to a decimal is ≈ ${state.ans}.`
  );
}

const PP_ROOT_STATES = [
  { zs: "i", modRoot: 1, traps: [
    { value: 0.5, feedback: "0.5 = cos 60°. The root's angle is π/4 (45°), so the real part is cos 45° = √2/2 ≈ 0.7071." },
    { value: 1, feedback: "cos of the root angle π/4 is √2/2 ≈ 0.7071, not 1 (that would be angle 0)." },
  ] },
  { zs: "4i", modRoot: 2, traps: [
    { value: 2, feedback: "2 is √4, the root's modulus. Multiply by cos(π/4): 2·√2/2 ≈ 1.4142." },
    { value: 4, feedback: "4 is the original modulus. The square root halves the angle AND roots the modulus: √4·cos(π/4) ≈ 1.4142." },
  ] },
  { zs: "9i", modRoot: 3, traps: [
    { value: 3, feedback: "3 is √9, the root's modulus. Multiply by cos(π/4): 3·√2/2 ≈ 2.1213." },
    { value: 9, feedback: "9 is the original modulus. Root it and take cos(π/4): √9·√2/2 ≈ 2.1213." },
  ] },
  { zs: "16i", modRoot: 4, traps: [
    { value: 4, feedback: "4 is √16, the root's modulus. Multiply by cos(π/4): 4·√2/2 ≈ 2.8284." },
    { value: 16, feedback: "16 is the original modulus. Root it and take cos(π/4): √16·√2/2 ≈ 2.8284." },
  ] },
] as const;

function ppNthRootsVariant(rand: () => number): PpVariant {
  const state = tiPick(rand, PP_ROOT_STATES);
  const answer = tiRound(state.modRoot * Math.SQRT2 / 2, 4);
  return ppNumeric(
    `The principal (k = 0) square root of ${state.zs} has what real part? (To four decimals.)`,
    answer,
    0.0005,
    [...state.traps],
    `The root has modulus ${state.modRoot} and angle π/4, so its real part is ${state.modRoot}·cos(π/4) ≈ ${answer}.`
  );
}

function ppParametricVariant(rand: () => number): PpVariant {
  const a = tiPick(rand, [2, 3, 4] as const);
  const job = Math.floor(rand() * 4);
  if (job === 0) {
    return ppNumeric(
      `For x = ${a}cos t, y = ${a}sin t, what is the x-coordinate at t = π?`,
      -a,
      0,
      [
        { value: a, feedback: `cos π = −1, so x = ${a}(−1) = −${a}, not +${a}.` },
        { value: 0, feedback: `0 is the y-coordinate (${a}sin π). The x-coordinate is ${a}cos π = −${a}.` },
      ],
      `x = ${a}cos π = ${a}·(−1) = −${a}.`
    );
  }
  if (job === 1) {
    return ppNumeric(
      `For x = ${a}cos t, y = ${a}sin t, what is the y-coordinate at t = π?`,
      0,
      0,
      [
        { value: -a, feedback: `−${a} is the x-coordinate (${a}cos π). The y-coordinate is ${a}sin π = 0.` },
        { value: a, feedback: `sin π = 0, not 1: y = ${a}·0 = 0 at the far-left point of the circle.` },
      ],
      `y = ${a}sin π = ${a}·0 = 0.`
    );
  }
  if (job === 2) {
    return ppNumeric(
      `For x = ${a}cos t, y = ${a}sin t, what is the y-coordinate at t = π/2?`,
      a,
      0,
      [
        { value: 0, feedback: `0 is the x-coordinate (${a}cos(π/2)). The y is ${a}sin(π/2) = ${a}.` },
        { value: 1, feedback: `sin(π/2) = 1, but y = ${a}sin(π/2) = ${a}·1 = ${a}.` },
      ],
      `y = ${a}sin(π/2) = ${a}·1 = ${a}.`
    );
  }
  return ppNumeric(
    `For x = ${a}cos t, y = ${a}sin t, what is the x-coordinate at t = π/2?`,
    0,
    0,
    [
      { value: a, feedback: `${a} is the y-coordinate (${a}sin(π/2)). The x is ${a}cos(π/2) = 0.` },
      { value: 1, feedback: `cos(π/2) is 0, not 1: x = ${a}·0 = 0 at the top of the circle.` },
    ],
    `x = ${a}cos(π/2) = ${a}·0 = 0.`
  );
}

function ppEliminateVariant(rand: () => number): PpVariant {
  const cube = rand() < 0.4;
  if (cube) {
    const v = tiPick(rand, [2, 4, 5] as const);
    const answer = v * v * v;
    return ppNumeric(
      `Eliminate t from x = t³, y = t to get x = y³. What is x when y = ${v}?`,
      answer,
      0,
      [
        { value: 3 * v, feedback: `${3 * v} = 3·${v} triples instead of cubing. x = y³ = ${v}³ = ${answer}.` },
        { value: v * v, feedback: `${v * v} = ${v}² stops one factor short. x = y³ = ${answer}.` },
      ],
      `x = y³ = ${v}³ = ${answer}.`
    );
  }
  const v = tiPick(rand, [3, 4, 5] as const);
  const answer = v * v;
  return ppNumeric(
    `Eliminate t from x = t², y = t to get x = y². What is x when y = ${v}?`,
    answer,
    0,
    [
      { value: 2 * v, feedback: `${2 * v} = 2·${v} doubles instead of squaring. x = y² = ${v}² = ${answer}.` },
      { value: v, feedback: `${v} = y itself. x = y² = ${answer}.` },
    ],
    `x = y² = ${v}² = ${answer}.`
  );
}

const PP_PARAM_POINT_STATES = [
  { c: 1, ts: "π/2", ans: [0, -1] as const, traps: [
    { values: [0, 1] as [number, number], feedback: "The NEGATIVE sine sends it to (0, −1), not (0, 1)." },
    { values: [-1, 0] as [number, number], feedback: "That's t = π. At t = π/2 the point is (0, −1)." },
  ] },
  { c: 1, ts: "π", ans: [-1, 0] as const, traps: [
    { values: [1, 0] as [number, number], feedback: "cos π = −1, so the point is (−1, 0), not (1, 0)." },
    { values: [0, -1] as [number, number], feedback: "That's t = π/2. At t = π the point is (−1, 0)." },
  ] },
  { c: 2, ts: "π/2", ans: [0, -2] as const, traps: [
    { values: [0, 2] as [number, number], feedback: "The NEGATIVE sine sends it to (0, −2), not (0, 2)." },
    { values: [-2, 0] as [number, number], feedback: "That's t = π. At t = π/2 the point is (0, −2)." },
  ] },
  { c: 2, ts: "π", ans: [-2, 0] as const, traps: [
    { values: [2, 0] as [number, number], feedback: "cos π = −1, so the point is (−2, 0), not (2, 0)." },
    { values: [0, -2] as [number, number], feedback: "That's t = π/2. At t = π the point is (−2, 0)." },
  ] },
] as const;

function ppParametrizePointVariant(rand: () => number): PpVariant {
  const state = tiPick(rand, PP_PARAM_POINT_STATES);
  const cText = state.c === 1 ? "" : String(state.c);
  return ppPoint(
    `For x = ${cText}cos t, y = −${cText}sin t, where is the point at t = ${state.ts}?`,
    state.ans,
    state.traps.map((t) => ({ values: [...t.values] as [number, number], feedback: t.feedback })),
    `Evaluate x = ${cText}cos t and y = −${cText}sin t at t = ${state.ts}.`,
    `The clockwise parametrization puts t = ${state.ts} at (${state.ans[0]}, ${state.ans[1]}).`
  );
}

function ppParametrizeNumericVariant(rand: () => number): PpVariant {
  const a = tiPick(rand, [2, 3, 4, 5] as const);
  const down = rand() < 0.5;
  if (down) {
    return ppNumeric(
      `For the circle x = ${a}cos t, y = ${a}sin t, what is the y-coordinate at t = 3π/2?`,
      -a,
      0,
      [
        { value: 0, feedback: `0 is the x-coordinate (${a}cos(3π/2)). The y is ${a}sin(3π/2) = −${a}.` },
        { value: a, feedback: `sin(3π/2) = −1, so y keeps the sign: ${a}·(−1) = −${a}.` },
      ],
      `y = ${a}sin(3π/2) = ${a}·(−1) = −${a}.`
    );
  }
  return ppNumeric(
    `For the circle x = ${a}cos t, y = ${a}sin t, what is the y-coordinate at t = π/2?`,
    a,
    0,
    [
      { value: 0, feedback: `0 is the x-coordinate (${a}cos(π/2)). The y is ${a}sin(π/2) = ${a}.` },
      { value: 1, feedback: `sin(π/2) = 1, but y = ${a}sin(π/2) = ${a}·1 = ${a}.` },
    ],
    `y = ${a}sin(π/2) = ${a}·1 = ${a}.`
  );
}

/* S331 / lane G1. The nine numeric g12-polynomial-rational-analysis forms repeated 1–3 fixed
 * rows. Each now draws genuine algebraic states — new polynomials, roots, inequalities — that
 * change the answer. precalculusIndependent.cjs re-derives each answer from the printed
 * expression: cubic zeros and inequality counts by brute-force integer search, candidate counts
 * by its own divisor enumeration, coefficients by literal expansion. */

const PRA_FORM = (stem: string): string => `polynomial-rational-analysis__${stem}__numeric`;
type PraVariant = { tag: "g12-polynomial-rational-analysis"; widget: any; answer: number };

/** Adapter for the six pra forms authored on the exactNumberLab surface. */
function praLab(v: PraVariant, consts: Array<{ id: string; label: string; value: number }>, formula: any, round: number): PraVariant {
  const built = labVariant("g12-polynomial-rational-analysis" as const, v.widget.prompt, consts, formula, round, v.widget.tolerance, v.widget.commonErrors, v.widget.fallbackFeedback);
  if (Math.abs(built.answer - v.answer) > 1e-9) {
    throw new Error(`S331 pra lab formula disagrees with the drawn answer (${built.answer} vs ${v.answer}): ${v.widget.prompt}`);
  }
  return built;
}

function praNumeric(prompt: string, answer: number, tolerance: number, commonErrors: Array<{ value: number; feedback: string }>, fallbackFeedback: string): PraVariant {
  return {
    tag: "g12-polynomial-rational-analysis",
    widget: {
      type: "numeric" as const,
      prompt: tiMinus(prompt),
      answer,
      tolerance,
      commonErrors: commonErrors.map((e) => ({ value: e.value, feedback: tiMinus(tiPad(e.feedback)) })),
      fallbackFeedback: tiMinus(tiPad(fallbackFeedback)),
    },
    answer,
  };
}

const praDivisors = (n: number): number[] => {
  const out: number[] = [];
  for (let d = 1; d <= Math.abs(n); d += 1) if (Math.abs(n) % d === 0) out.push(d);
  return out;
};

const PRA_RRT_STATES = [
  { text: "x³ + 2x² − 5x − 6", lead: 1, constant: -6 },
  { text: "2x³ − 3x² − 3x + 2", lead: 2, constant: 2 },
  { text: "3x³ + x² − 5x + 5", lead: 3, constant: 5 },
  { text: "x³ − x² − 8x − 12", lead: 1, constant: -12 },
  { text: "2x³ + x² − 7x − 3", lead: 2, constant: -3 },
  { text: "4x³ − 5x² + x + 6", lead: 4, constant: 6 },
] as const;

function praRrtListVariant(rand: () => number): PraVariant {
  const state = tiPick(rand, PRA_RRT_STATES);
  const ps = praDivisors(state.constant);
  const qs = praDivisors(state.lead);
  const distinct = new Set<string>();
  for (const p of ps) for (const q of qs) distinct.add(`${p / q}`);
  const answer = 2 * distinct.size;
  const naive = 2 * ps.length * qs.length;
  const secondTrap = naive !== answer
    ? { value: naive, feedback: `${naive} counts every ±p/q pairing without removing duplicates like ${ps[ps.length - 1]}/${ps[ps.length - 1]}. Distinct values: ${answer}.` }
    : { value: answer - 2, feedback: `${answer - 2} leaves out ±1 — 1 divides every constant, so ±1 always join the list: ${answer}.` };
  return praLab(
    praNumeric(
      `f(x) = ${state.text} (constant ${state.constant}, leading ${state.lead}). How many DISTINCT rational-root candidates does the theorem give?`,
      answer,
      0,
      [
        { value: answer / 2, feedback: `${answer / 2} forgets the ± pairs — every candidate p/q also appears negated: ${answer}.` },
        secondTrap,
      ],
      `±(divisors of ${Math.abs(state.constant)})/(divisors of ${state.lead}) collapse to ${answer} distinct candidates.`
    ),
    // A distinct-count of ±p/q values is not expressible in the approx grammar; the constant
    // below is what the divisor-enumeration route in precalculusIndependent.cjs re-derives.
    [{ id: "count", label: "the distinct candidate count", value: answer }],
    labConst("count"),
    0
  );
}

const PRA_FTA_FACTORED = [
  { text: "(x − 1)²(x + 2)", exps: [2, 1] }, { text: "(x − 5)³(x + 1)²(x − 4)", exps: [3, 2, 1] },
  { text: "(x + 3)²(x − 2)²", exps: [2, 2] }, { text: "(x − 7)(x + 2)³", exps: [1, 3] },
] as const;
const PRA_FTA_CROSS = [
  { n: 5, k: 1 }, { n: 5, k: 3 }, { n: 6, k: 2 }, { n: 6, k: 4 }, { n: 7, k: 3 }, { n: 7, k: 1 },
] as const;

function praFtaCountVariant(rand: () => number): PraVariant {
  const job = Math.floor(rand() * 3);
  if (job === 0) {
    const state = tiPick(rand, PRA_FTA_FACTORED);
    const total = state.exps.reduce((s, e) => s + e, 0);
    const distinct = state.exps.length;
    return praLab(
      praNumeric(
        `f(x) = ${state.text}. Counting multiplicity, how many zeros does f have?`,
        total,
        0,
        [
          { value: distinct, feedback: `${distinct} counts each root once. Multiplicity counts the exponents too: ${state.exps.join(" + ")} = ${total}.` },
          { value: total + 1, feedback: `The degree is exactly ${total} — the exponents ${state.exps.join(", ")} sum to ${total}, no more.` },
        ],
        `The exponents ${state.exps.join(" + ")} total ${total} zeros with multiplicity.`
      ),
      state.exps.map((e, i) => ({ id: `e${i + 1}`, label: `the ${i + 1}${i === 0 ? "st" : i === 1 ? "nd" : i === 2 ? "rd" : "th"} factor's exponent`, value: e })),
      state.exps.map((_, i) => labConst(`e${i + 1}`)).reduce((acc: any, node: any) => (acc === null ? node : labAdd(acc, node)), null),
      0
    );
  }
  if (job === 1) {
    const state = tiPick(rand, PRA_FTA_FACTORED);
    const total = state.exps.reduce((s, e) => s + e, 0);
    const distinct = state.exps.length;
    const secondTrap = distinct + 1 === total
      ? { value: distinct - 1, feedback: `${distinct - 1} skips a factor. Every distinct factor of ${state.text} names its own root: ${distinct}.` }
      : { value: distinct + 1, feedback: `Count the different roots in ${state.text}: exactly ${distinct} of them.` };
    return praLab(
      praNumeric(
        `g(x) = ${state.text}. How many DISTINCT zeros does g have?`,
        distinct,
        0,
        [
          { value: total, feedback: `${total} counts multiplicity. Each factor names ONE distinct zero: ${distinct}.` },
          secondTrap,
        ],
        `${state.text} names ${distinct} different roots.`
      ),
      [{ id: "distinct", label: "the count of distinct factors", value: distinct }],
      labConst("distinct"),
      0
    );
  }
  const { n, k } = tiPick(rand, PRA_FTA_CROSS);
  return praLab(
    praNumeric(
      `A degree-${n} polynomial's graph crosses the x-axis exactly ${k === 1 ? "once" : `${k} times`} (simple crossings). How many NON-REAL zeros does it have?`,
      n - k,
      0,
      [
        { value: k, feedback: `${k} is the count of REAL crossings. The remaining ${n} − ${k} = ${n - k} zeros are non-real.` },
        { value: n, feedback: `${n} is the TOTAL zero count (the degree). Subtract the ${k} real crossings: ${n - k} non-real.` },
      ],
      `Degree ${n} promises ${n} zeros; ${k} are real, so ${n - k} are non-real (in conjugate pairs).`
    ),
    [{ id: "n", label: "the degree", value: n }, { id: "k", label: "the real crossings", value: k }],
    labSub(labConst("n"), labConst("k")),
    0
  );
}

const PRA_EXPAND_STATES = [
  { r: 2, b: 4, c: 3 }, { r: 3, b: 5, c: 2 }, { r: 1, b: 6, c: 8 }, { r: 4, b: 2, c: 5 }, { r: 2, b: 7, c: 10 },
] as const;
const PRA_CUBIC_STATES = [
  { text: "x³ − 6x² + 11x − 6", roots: [1, 2, 3] }, { text: "x³ − 7x² + 14x − 8", roots: [1, 2, 4] },
  { text: "x³ − 9x² + 23x − 15", roots: [1, 3, 5] }, { text: "x³ − 10x² + 31x − 30", roots: [2, 3, 5] },
  { text: "x³ − 8x² + 17x − 10", roots: [1, 2, 5] },
] as const;

function praRrtPipelineVariant(rand: () => number): PraVariant {
  if (rand() < 0.5) {
    const { r, b, c } = tiPick(rand, PRA_EXPAND_STATES);
    const answer = b - r;
    const candidates: Array<{ value: number; feedback: string }> = [
      { value: b, feedback: `${b} copies the quadratic's middle coefficient. The −${r} also contributes: ${b} − ${r} = ${answer}.` },
      { value: b + r, feedback: `${b + r} adds — the factor is (x − ${r}), so its contribution subtracts: ${b} − ${r} = ${answer}.` },
      { value: -r, feedback: `${-r} keeps only the −${r}·x² piece. The x·${b}x term adds ${b}: ${answer}.` },
    ];
    const seen = new Set([answer]);
    const traps = candidates.filter((cand) => {
      if (seen.has(cand.value)) return false;
      seen.add(cand.value);
      return true;
    }).slice(0, 2);
    return praLab(
      praNumeric(
        `Expanding (x − ${r})(x² + ${b}x + ${c}), what is the coefficient of x²?`,
        answer,
        0,
        traps,
        `x·${b}x and −${r}·x² combine to (${b} − ${r})x² = ${answer}x².`
      ),
      [{ id: "b", label: "the quadratic's middle coefficient", value: b }, { id: "r", label: "the subtracted root", value: r }],
      labSub(labConst("b"), labConst("r")),
      0
    );
  }
  const state = tiPick(rand, PRA_CUBIC_STATES);
  const largest = Math.max(...state.roots);
  const smallest = Math.min(...state.roots);
  const sum = state.roots.reduce((s, v) => s + v, 0);
  return praLab(
    praNumeric(
      `h(x) = ${state.text}. Using the full pipeline, what is its LARGEST zero?`,
      largest,
      0,
      [
        { value: smallest, feedback: `${smallest} is the SMALLEST zero. Factoring fully gives zeros ${state.roots.join(", ")}: the largest is ${largest}.` },
        { value: sum, feedback: `${sum} is the SUM of all zeros (read off the x² coefficient). The largest single zero is ${largest}.` },
      ],
      `The cubic factors over the zeros ${state.roots.join(", ")}; the largest is ${largest}.`
    ),
    // Picking the largest zero is not expressible in the approx grammar; the constant below is
    // what the brute-force root search in precalculusIndependent.cjs independently re-derives.
    [{ id: "z", label: "the largest zero", value: largest }],
    labConst("z"),
    0
  );
}

const PRA_SLANT_STATES = [
  { a2: 2, a1: 5, a0: 1, d: 2 }, { a2: 3, a1: 7, a0: 2, d: 1 }, { a2: 2, a1: 9, a0: 3, d: 3 }, { a2: 4, a1: 6, a0: 1, d: 1 }, { a2: 3, a1: 8, a0: 2, d: 2 },
] as const;

function praSlantFindVariant(rand: () => number): PraVariant {
  if (rand() < 0.5) {
    const { a2, a1, a0, d } = tiPick(rand, PRA_SLANT_STATES);
    const answer = a1 - a2 * d;
    return praLab(
      praNumeric(
        `g(x) = (${a2}x² + ${a1}x + ${a0})/(x + ${d}) has slant asymptote y = ${a2}x + b. What is b?`,
        answer,
        0,
        [
          { value: a1, feedback: `${a1} copies the numerator's middle coefficient. Division peels off ${a2}·${d}: b = ${a1} − ${a2 * d} = ${answer}.` },
          { value: a1 - d, feedback: `${a1 - d} subtracts d alone. The quotient step removes ${a2}·${d} = ${a2 * d}: b = ${answer}.` },
        ],
        `Long division gives quotient ${a2}x + (${a1} − ${a2}·${d}) = ${a2}x + ${answer}.`
      ),
      [
        { id: "a2", label: "the leading coefficient", value: a2 },
        { id: "a1", label: "the middle coefficient", value: a1 },
        { id: "d", label: "the divisor's constant", value: d },
      ],
      labSub(labConst("a1"), labMul(labConst("a2"), labConst("d"))),
      0
    );
  }
  const k = tiPick(rand, [2, 3, 4] as const);
  const N = 101;
  const answer = tiRound((1 - k * k) / (N - 1), 4);
  return praLab(
    praNumeric(
      `For f(x) = (x² − ${k * k})/(x − 1) with slant y = x + 1, what is f(${N}) − ${N + 1}? (Answer as a decimal.)`,
      answer,
      0.001,
      [
        { value: 0, feedback: `Zero would mean the slant is already exact at x = ${N} — but the remainder ${1 - k * k} leaves a gap of ${1 - k * k}/${N - 1} = ${answer}.` },
        { value: -answer, feedback: `Watch the remainder's sign: 1 − ${k * k} = ${1 - k * k}, so the gap is ${1 - k * k}/${N - 1} = ${answer}.` },
      ],
      `f(x) = x + 1 + (${1 - k * k})/(x − 1), so f(${N}) − ${N + 1} = ${1 - k * k}/${N - 1} = ${answer}.`
    ),
    [{ id: "ksq", label: "the subtracted square", value: k * k }, { id: "N", label: "the evaluation point", value: N }],
    labSub(
      labDiv(labSub(labMul(labConst("N"), labConst("N")), labConst("ksq")), labSub(labConst("N"), labLit(1))),
      labAdd(labConst("N"), labLit(1))
    ),
    4
  );
}

const PRA_TEST_STATES = [
  { text: "x³ + 2x² − 5x − 6", coeffs: [1, 2, -5, -6], c: 2 },
  { text: "x³ + 2x² − 5x − 6", coeffs: [1, 2, -5, -6], c: 1 },
  { text: "x³ − 4x² + x + 6", coeffs: [1, -4, 1, 6], c: 2 },
  { text: "x³ − 4x² + x + 6", coeffs: [1, -4, 1, 6], c: 1 },
  { text: "x³ − 2x² − 5x + 6", coeffs: [1, -2, -5, 6], c: 3 },
  { text: "x³ − 2x² − 5x + 6", coeffs: [1, -2, -5, 6], c: 2 },
] as const;

function praRrtTestVariant(rand: () => number): PraVariant {
  const state = tiPick(rand, PRA_TEST_STATES);
  const evalAt = (x: number): number => state.coeffs.reduce((acc, co) => acc * x + co, 0);
  const answer = evalAt(state.c);
  const candidates: Array<{ value: number; feedback: string }> = [
    { value: evalAt(-state.c), feedback: `${evalAt(-state.c)} = f(−${state.c}) tests the OPPOSITE candidate. f(${state.c}) substitutes +${state.c}: ${answer}.` },
    { value: state.coeffs.reduce((acc, co) => acc * state.c + Math.abs(co), 0), feedback: `That drops the minus signs while substituting. Keeping every sign, f(${state.c}) = ${answer}.` },
  ];
  const seen = new Set([answer]);
  const traps = candidates.filter((cand) => {
    if (seen.has(cand.value)) return false;
    seen.add(cand.value);
    return true;
  });
  while (traps.length < 2) {
    const filler = answer + (traps.length + 1) * 2;
    if (!seen.has(filler)) {
      seen.add(filler);
      traps.push({ value: filler, feedback: `Substitute carefully term by term: f(${state.c}) works out to ${answer}.` });
    } else {
      break;
    }
  }
  return praLab(
    praNumeric(
      `f(x) = ${state.text}. Test the candidate c = ${state.c}: what is f(${state.c})?`,
      answer,
      0,
      traps,
      `Substituting x = ${state.c} into ${state.text} gives ${answer}${answer === 0 ? " — a confirmed zero" : ", so " + state.c + " is not a root"}.`
    ),
    [{ id: "c", label: "the tested candidate", value: state.c }],
    state.coeffs.reduce((acc: any, co) => (acc === null ? labLit(co) : labAdd(labMul(acc, labConst("c")), labLit(co))), null),
    0
  );
}

function praConjugateVariant(rand: () => number): PraVariant {
  const k = tiPick(rand, [3, 4, 5, 6, 7, 8] as const);
  return praLab(
    praNumeric(
      `Multiply the conjugate pair: (x − ${k}i)(x + ${k}i) = x² + c. What is c?`,
      k * k,
      0,
      [
        { value: -(k * k), feedback: `The product is x² − (${k}i)² = x² − (−${k * k}) — i² = −1 turns the sign to +${k * k}.` },
        { value: 2 * k, feedback: `${2 * k} doubles ${k} instead of squaring. c = ${k}² = ${k * k} (after i² = −1 turns the sign).` },
      ],
      `(x − ${k}i)(x + ${k}i) = x² − ${k * k}i² = x² + ${k * k}, so c = ${k * k}.`
    ),
    [{ id: "k", label: "the imaginary coefficient", value: k }],
    labMul(labConst("k"), labConst("k")),
    0
  );
}

const PRA_INEQ_STATES = [
  { p: 2, q: 4 }, { p: 1, q: 5 }, { p: 3, q: 7 }, { p: 2, q: 6 }, { p: 3, q: 5 }, { p: 1, q: 3 },
] as const;

function praIneqScratchVariant(rand: () => number): PraVariant {
  const { p, q } = tiPick(rand, PRA_INEQ_STATES);
  const count = q - p + 1;
  return praNumeric(
    `How many INTEGER solutions does x² + ${p * q} ≤ ${p + q}x have?`,
    count,
    0,
    [
      { value: count - 2, feedback: `The endpoints belong: at x = ${p}, ${p * p} + ${p * q} = ${p * p + p * q} = ${p + q}·${p} ✓, and likewise at x = ${q}. All of [${p}, ${q}]'s ${count} integers count.` },
      { value: count + 2, feedback: `Stretching a unit past each end fails — test x = ${p - 1}: ${(p - 1) * (p - 1)} + ${p * q} ≤ ${(p + q) * (p - 1)} is false. Only [${p}, ${q}]: ${count} integers.` },
    ],
    `x² − ${p + q}x + ${p * q} = (x − ${p})(x − ${q}) ≤ 0 on [${p}, ${q}]: ${count} integers.`
  );
}

const PRA_BOUNDARY_STATES = [
  { z: 6, e: 3, op: "≤", included: 2 }, { z: 8, e: 5, op: "≤", included: 2 }, { z: 6, e: 3, op: "<", included: 0 },
  { z: 10, e: 4, op: "≥", included: 2 }, { z: 8, e: 2, op: "<", included: 0 },
] as const;

function praBoundaryRuleVariant(rand: () => number): PraVariant {
  const state = tiPick(rand, PRA_BOUNDARY_STATES);
  const traps = state.included === 2
    ? [
        { value: 3, feedback: `Only cuts where the expression EQUALS 0 can close: 0 and ${state.z}. The excluded value ${state.e} (the pole) never joins: 2.` },
        { value: 0, feedback: `With ${state.op}, the numerator's zeros do join: at x = 0 and x = ${state.z} the expression is exactly 0 — two closed points.` },
      ]
    : [
        { value: 2, feedback: `Strict ${state.op} keeps the zeros OUT — equality is not allowed, so 0 and ${state.z} stay open: 0 closed points.` },
        { value: 3, feedback: `The pole ${state.e} can never close, and strict ${state.op} opens the zeros too: 0 closed points.` },
      ];
  return praNumeric(
    `For x(x − ${state.z})/(x − ${state.e}) ${state.op} 0, how many boundary points are INCLUDED (closed) in the solution?`,
    state.included,
    0,
    traps,
    state.included === 2
      ? `The zeros 0 and ${state.z} satisfy equality under ${state.op}; the pole ${state.e} never joins: 2 closed points.`
      : `Strict ${state.op} admits no equality, so no boundary point closes: 0.`
  );
}

const PRA_REARRANGE_STATES = [
  { d: 2, K: 3, lo: -3, hi: 6 }, { d: 2, K: 2, lo: -2, hi: 6 }, { d: 3, K: 2, lo: -2, hi: 7 }, { d: 2, K: 4, lo: -4, hi: 5 }, { d: 3, K: 3, lo: -3, hi: 6 },
] as const;

function praRearrangeVariant(rand: () => number): PraVariant {
  const { d, K, lo, hi } = tiPick(rand, PRA_REARRANGE_STATES);
  let count = 0;
  let below = 0;
  for (let x: number = lo; x <= hi; x += 1) {
    if (x === d) continue;
    if (x / (x - d) <= K + 1e-12) {
      count += 1;
      if (x < d) below += 1;
    }
  }
  const total = hi - lo + 1;
  return praNumeric(
    `How many INTEGERS x with ${lo} ≤ x ≤ ${hi} satisfy x/(x − ${d}) ≤ ${K}?`,
    count,
    0,
    [
      { value: total, feedback: `The range holds ${total} integers, but at x = ${d} the expression has no value, and the strip just above ${d} exceeds ${K}: only ${count} qualify.` },
      { value: below, feedback: `${below} counts only the x < ${d} side. The far branch beyond ${d} adds ${count - below} more — ${count} total.` },
    ],
    `Every integer except x = ${d} and the few just above it passes the ${K}-test: ${count} in all.`
  );
}

const PRA_FORM_VARIANTS: Record<string, (rand: () => number) => PraVariant> = {
  [PRA_FORM("pra-rrt-list")]: praRrtListVariant,
  [PRA_FORM("pra-fta-count")]: praFtaCountVariant,
  [PRA_FORM("pra-rrt-pipeline")]: praRrtPipelineVariant,
  [PRA_FORM("pra-slant-find")]: praSlantFindVariant,
  [PRA_FORM("pra-rrt-test")]: praRrtTestVariant,
  [PRA_FORM("pra-conjugate")]: praConjugateVariant,
  [PRA_FORM("pra-ineq-scratch")]: praIneqScratchVariant,
  [PRA_FORM("pra-boundary-rule")]: praBoundaryRuleVariant,
  [PRA_FORM("pra-rearrange")]: praRearrangeVariant,
};

const PP_FORM_VARIANTS: Record<string, (rand: () => number) => PpVariant> = {
  [PP_FORM("pp-parabolic-path__numeric")]: ppParabolicPathVariant,
  [PP_FORM("pp-to-rect__numeric")]: ppToRectVariant,
  [PP_FORM("pp-roses__numeric")]: ppRosesVariant,
  [PP_FORM("pp-limacons__numeric")]: ppLimaconsVariant,
  [PP_FORM("pp-de-moivre__numeric")]: ppDeMoivreVariant,
  [PP_FORM("pp-projectile__numeric")]: ppProjectileVariant,
  [PP_FORM("pp-polar-system__pointEntry")]: ppPolarSystemPointVariant,
  [PP_FORM("pp-circles__pointEntry")]: ppCirclesPointVariant,
  [PP_FORM("pp-circles__numeric")]: ppCirclesNumericVariant,
  [PP_FORM("pp-polar-form__numeric")]: ppPolarFormVariant,
  [PP_FORM("pp-nth-roots__numeric")]: ppNthRootsVariant,
  [PP_FORM("pp-parametric__numeric")]: ppParametricVariant,
  [PP_FORM("pp-eliminate__numeric")]: ppEliminateVariant,
  [PP_FORM("pp-parametrize__pointEntry")]: ppParametrizePointVariant,
  [PP_FORM("pp-parametrize__numeric")]: ppParametrizeNumericVariant,
};

const VEC_FORM_VARIANTS: Record<string, (rand: () => number) => VecVariant> = {
  [VEC_FORM("vec-direction")]: vecDirectionVariant,
  [VEC_FORM("vec-scalar")]: vecScalarVariant,
  [VEC_FORM("vec-dot")]: vecDotVariant,
  [VEC_FORM("vec-determinant")]: vecDeterminantVariant,
  [VEC_FORM("vec-solve-systems")]: vecSolveSystemsVariant,
  [VEC_FORM("vec-add")]: vecAddVariant,
  [VEC_FORM("vec-applications")]: vecApplicationsVariant,
  [VEC_FORM("vec-matrix-arith")]: vecMatrixArithVariant,
  [VEC_FORM("vec-rotation")]: vecRotationVariant,
  [VEC_FORM("vec-components")]: vecComponentsVariant,
};

const TI_FORM_VARIANTS: Record<string, (rand: () => number) => TiVariant> = {
  [TI_FORM("ti-double-basic")]: tiDoubleBasicVariant,
  [TI_FORM("ti-cos2-forms")]: tiCos2FormsVariant,
  [TI_FORM("ti-convert-solve")]: tiConvertSolveVariant,
  [TI_FORM("ti-root-traps")]: tiRootTrapsVariant,
  [TI_FORM("ti-general")]: tiGeneralVariant,
  [TI_FORM("ti-tan-ladder")]: tiTanLadderVariant,
  [TI_FORM("ti-reciprocals")]: tiReciprocalsVariant,
  [TI_FORM("ti-pythagorean")]: tiPythagoreanVariant,
  [TI_FORM("ti-prove")]: tiProveVariant,
  [TI_FORM("ti-apply-sum-diff")]: tiApplySumDiffVariant,
  [TI_FORM("ti-tan-cofunction")]: tiTanCofunctionVariant,
  [TI_FORM("ti-double-action")]: tiDoubleActionVariant,
};

export const PRECALCULUS_GENERATORS = AUTHORED_PRECALCULUS_GENERATORS.map((generator) => {
  if (generator.tag === "g12-function-analysis") {
    return {
      ...generator,
      gen: (rand: () => number, band?: "support" | "core" | "stretch", requestedForm = "default") => {
        if (requestedForm === FUNCTION_GRAPH_READ_FORM) return graphReadVariant(rand);
        if (requestedForm === COMPOSE_ORDER_FORM) return composeOrderVariant(rand);
        if (requestedForm === COMPOSE_DOMAIN_FORM) return composeDomainVariant(rand);
        if (requestedForm === DECOMPOSE_FORM) return decomposeVariant(rand);
        if (requestedForm === ONE_TO_ONE_FORM) return oneToOneVariant(rand);
        if (requestedForm === RESTRICTED_FORM) return restrictedInverseVariant(rand);
        if (requestedForm === INVERSE_POINT_FORM) return inversePointVariant(rand);
        if (requestedForm === INVERSE_VERIFY_FORM) return inverseVerifyVariant(rand);
        return generator.gen(rand, band, requestedForm);
      },
    };
  }
  if (generator.tag === "g12-limits-continuity") {
    return {
      ...generator,
      gen: (rand: () => number, band?: "support" | "core" | "stretch", requestedForm = "default") =>
        limitsContinuityVariant(rand, requestedForm) ?? generator.gen(rand, band, requestedForm),
    };
  }
  if (generator.tag === "g12-trig-identities-equations") {
    return {
      ...generator,
      gen: (rand: () => number, band?: "support" | "core" | "stretch", requestedForm = "default") => {
        const build = TI_FORM_VARIANTS[requestedForm];
        return build ? build(rand) : generator.gen(rand, band, requestedForm);
      },
    };
  }
  if (generator.tag === "g12-trig-graphs-inverses") {
    return {
      ...generator,
      gen: (rand: () => number, band?: "support" | "core" | "stretch", requestedForm = "default") => {
        const build = TG_FORM_VARIANTS[requestedForm];
        return build ? build(rand) : generator.gen(rand, band, requestedForm);
      },
    };
  }
  if (generator.tag === "g12-vectors-matrices") {
    return {
      ...generator,
      gen: (rand: () => number, band?: "support" | "core" | "stretch", requestedForm = "default") => {
        const build = VEC_FORM_VARIANTS[requestedForm];
        return build ? build(rand) : generator.gen(rand, band, requestedForm);
      },
    };
  }
  if (generator.tag === "g12-polar-parametric") {
    return {
      ...generator,
      gen: (rand: () => number, band?: "support" | "core" | "stretch", requestedForm = "default") => {
        const build = PP_FORM_VARIANTS[requestedForm];
        return build ? build(rand) : generator.gen(rand, band, requestedForm);
      },
    };
  }
  if (generator.tag === "g12-polynomial-rational-analysis") {
    return {
      ...generator,
      gen: (rand: () => number, band?: "support" | "core" | "stretch", requestedForm = "default") => {
        const build = PRA_FORM_VARIANTS[requestedForm];
        return build ? build(rand) : generator.gen(rand, band, requestedForm);
      },
    };
  }
  return generator.tag === "g12-conic-sections"
    ? {
        ...generator,
        gen: (rand: () => number, band?: "support" | "core" | "stretch", requestedForm = "default") => {
          if (requestedForm === PARABOLA_DEFINITION_FORM) return parabolaDefinitionVariant(rand);
          if (requestedForm === HYPERBOLA_ECCENTRICITY_FORM) return hyperbolaEccentricityVariant(rand);
          return generator.gen(rand, band, requestedForm);
        },
      }
    : generator;
});
