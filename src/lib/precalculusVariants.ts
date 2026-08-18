import templates from "./precalculusVariantTemplates.json";
import { generatorsFromAuthoredBank } from "./authoredTemplateVariants";

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
