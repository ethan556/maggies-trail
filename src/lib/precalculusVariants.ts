import templates from "./precalculusVariantTemplates.json";
import { generatorsFromAuthoredBank } from "./authoredTemplateVariants";
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

const signedLimitNumber = (value: number): string => value < 0 ? `−${Math.abs(value)}` : String(value);
const decimalLimitNumber = (value: number): string => {
  const fixed = value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return fixed.startsWith("-") ? `−${fixed.slice(1)}` : fixed;
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
    `The graph is the continuous line f(x) = ${signedLimitNumber(chosen.m)}x ${bSign}. Find the limit as x approaches ${signedLimitNumber(chosen.at)}.`,
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

function limitsContinuityVariant(rand: () => number, requestedForm: string): LimitGeneratedVariant | null {
  if (requestedForm === LIMIT_IDEA_MCQ_FORM) return limitIdeaMcqVariant(rand);
  if (requestedForm === LIMIT_IDEA_NUMERIC_FORM) return limitIdeaNumericVariant(rand);
  if (requestedForm === LIMIT_READ_NUMERIC_FORM) return limitReadNumericVariant(rand);
  if (requestedForm === LIMIT_DNE_MCQ_FORM) return limitDneMcqVariant(rand);
  if (requestedForm === LIMIT_DNE_NUMERIC_FORM) return limitDneNumericVariant(rand);
  if (requestedForm === LIMIT_FACTOR_NUMERIC_FORM) return limitFactorNumericVariant(rand);
  if (requestedForm === LIMIT_RATIONALIZE_MCQ_FORM) return limitRationalizeMcqVariant(rand);
  if (requestedForm === LIMIT_RATIONALIZE_NUMERIC_FORM) return limitRationalizeNumericVariant(rand);
  return null;
}

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
