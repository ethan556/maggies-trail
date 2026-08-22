import templates from "./calculusVariantTemplates.json";
import { generatorsFromAuthoredBank } from "./authoredTemplateVariants";

const AUTHORED_CALCULUS_GENERATORS = generatorsFromAuthoredBank(
  templates as Record<string, Record<string, any[]>>,
  "Grade 13 Calculus isomorphic authored variants"
);

type Rand = () => number;
type Band = "support" | "core" | "stretch";
const pick = <T>(rand: Rand, values: readonly T[]): T => values[Math.floor(rand() * values.length)]!;
const shuffle = <T>(rand: Rand, values: readonly T[]): T[] => {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rand() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex]!, result[index]!];
  }
  return result;
};

const FIRST_DERIVATIVE_MAXIMUM_CASES = [
  { a: 1, constant: 0 },
  { a: 1, constant: 3 },
  { a: 1, constant: -2 },
  { a: 2, constant: 0 },
  { a: 2, constant: 5 },
  { a: 2, constant: -5 },
  { a: 3, constant: 0 },
  { a: 3, constant: 7 },
  { a: 3, constant: -7 },
  { a: 4, constant: 0 },
  { a: 4, constant: 9 },
  { a: 4, constant: -9 },
] as const;

function signedConstant(value: number): string {
  if (value === 0) return "";
  return value > 0 ? ` + ${value}` : ` − ${Math.abs(value)}`;
}

function coefficientVariable(coefficient: number, variable: string): string {
  if (coefficient === 1) return variable;
  if (coefficient === -1) return `−${variable}`;
  return `${coefficient}${variable}`;
}

/**
 * S246 / Phase 5. The authored pool held only two numeric widgets, one of
 * which always answered 1. These cubics preserve the first-derivative-test
 * question job while varying the derivative roots, function height, and
 * maximum value. Every answer is recoverable from the printed function:
 * f′(x)=3(x−a)(x+a), so the local maximum is at −a and equals c+2a³.
 */
function firstDerivativeMaximumWidget(rand: Rand) {
  const chosen = FIRST_DERIVATIVE_MAXIMUM_CASES[
    Math.floor(rand() * FIRST_DERIVATIVE_MAXIMUM_CASES.length)
  ]!;
  const { a, constant } = chosen;
  const linearCoefficient = 3 * a * a;
  const maximum = constant + 2 * a ** 3;
  const minimum = constant - 2 * a ** 3;
  const functionText = `f(x) = x³ − ${linearCoefficient}x${signedConstant(constant)}`;
  const commonErrors = [
    {
      value: -a,
      feedback: `−${a} is where the local maximum occurs. Substitute x = −${a} into the displayed function to find its value.`,
    },
    {
      value: minimum,
      feedback: `${minimum} is the local minimum value at x = ${a}; the local maximum occurs at the other critical point.`,
    },
    {
      value: a,
      feedback: `${a} is the x-coordinate of the local minimum, not the value of the local maximum.`,
    },
  ].filter((error, index, all) =>
    error.value !== maximum && all.findIndex((candidate) => candidate.value === error.value) === index
  );
  return {
    type: "numeric" as const,
    prompt: `${functionText}. The derivative is positive, then negative, then positive. Find the local maximum value of f.`,
    answer: maximum,
    tolerance: 0,
    unit: "",
    commonErrors,
    fallbackFeedback: `f′(x) = 3(x − ${a})(x + ${a}), so f′ changes from positive to negative at x = −${a}. Evaluating gives f(−${a}) = ${maximum}.`,
    successFeedback: `The sign change at x = −${a} identifies the local maximum, and substituting into ${functionText} gives ${maximum}.`,
  };
}

const FIRST_DERIVATIVE_SIGN_CASES = [
  { doubleRoot: -3, singleRoot: 2 },
  { doubleRoot: -2, singleRoot: 3 },
  { doubleRoot: -1, singleRoot: 4 },
  { doubleRoot: 0, singleRoot: 3 },
  { doubleRoot: 1, singleRoot: 4 },
  { doubleRoot: 2, singleRoot: 5 },
  { doubleRoot: 3, singleRoot: -2 },
  { doubleRoot: 2, singleRoot: -3 },
  { doubleRoot: 1, singleRoot: -4 },
  { doubleRoot: 0, singleRoot: -3 },
  { doubleRoot: -1, singleRoot: -4 },
  { doubleRoot: -2, singleRoot: -5 },
] as const;

function factor(root: number, squared = false): string {
  const inside = root === 0 ? "x" : root > 0 ? `(x − ${root})` : `(x + ${Math.abs(root)})`;
  return squared ? `${inside}²` : inside;
}

function signsForRoots(doubleRoot: number, singleRoot: number): Array<"+" | "-"> {
  const roots = [
    { x: doubleRoot, mult: 2 },
    { x: singleRoot, mult: 1 },
  ].sort((left, right) => left.x - right.x);
  const signs: Array<"+" | "-"> = Array(roots.length + 1).fill("+");
  let sign: "+" | "-" = "+";
  signs[roots.length] = sign;
  for (let index = roots.length - 1; index >= 0; index -= 1) {
    if (roots[index]!.mult % 2 === 1) sign = sign === "+" ? "-" : "+";
    signs[index] = sign;
  }
  return signs;
}

function firstDerivativeSignChartWidget(rand: Rand) {
  const chosen = FIRST_DERIVATIVE_SIGN_CASES[
    Math.floor(rand() * FIRST_DERIVATIVE_SIGN_CASES.length)
  ]!;
  const { doubleRoot, singleRoot } = chosen;
  const roots = [
    { x: doubleRoot, mult: 2 },
    { x: singleRoot, mult: 1 },
  ].sort((left, right) => left.x - right.x);
  const signs = signsForRoots(doubleRoot, singleRoot);
  return {
    type: "signChart" as const,
    roots,
    leadingPositive: true,
    prompt: `f′(x) = ${factor(doubleRoot, true)}${factor(singleRoot)}. It has a double root at x = ${doubleRoot} and a single root at x = ${singleRoot}. Set the sign of f′ on each interval.`,
    successFeedback: `${signs.join(" ")}. The double root at ${doubleRoot} keeps the same sign on both sides, while the single root at ${singleRoot} flips it.`,
    crossFeedback: `The root at ${singleRoot} is single, so f′ changes sign there and f has an extremum.`,
    bounceFeedback: `The root at ${doubleRoot} is double, so f′ touches zero without changing sign; f has a flat pause rather than an extremum there.`,
  };
}

const INFLECTION_CASES = [
  { secondDerivative: "(x - 4)(x + 1)", answer: 2 },
  { secondDerivative: "(x - 3)(x + 2)", answer: 2 },
  { secondDerivative: "(x - 5)(x - 1)", answer: 2 },
  { secondDerivative: "(x + 4)(x + 1)", answer: 2 },
  { secondDerivative: "(x - 4)^2", answer: 0 },
  { secondDerivative: "(x - 2)^2", answer: 0 },
  { secondDerivative: "(x + 1)^2", answer: 0 },
  { secondDerivative: "(x + 3)^2", answer: 0 },
  { secondDerivative: "x - 5", answer: 1 },
  { secondDerivative: "x - 2", answer: 1 },
  { secondDerivative: "x + 2", answer: 1 },
  { secondDerivative: "x + 4", answer: 1 },
] as const;

function inflectionCountWidget(rand: Rand) {
  const chosen = INFLECTION_CASES[Math.floor(rand() * INFLECTION_CASES.length)]!;
  const { secondDerivative, answer } = chosen;
  const commonErrors = [0, 1, 2, 3]
    .filter((value) => value !== answer)
    .slice(0, 3)
    .map((value) => ({
      value,
      feedback: value === 3
        ? "A quadratic second derivative has at most two distinct real zeros."
        : "Count only zeros where the second derivative changes sign; an even-multiplicity zero does not create an inflection point.",
    }));
  return {
    type: "numeric" as const,
    prompt: `A twice-differentiable function has f''(x) = ${secondDerivative}. How many inflection points does f have?`,
    answer,
    tolerance: 0,
    unit: "",
    commonErrors,
    fallbackFeedback: answer === 0
      ? `The squared factor in f''(x) = ${secondDerivative} does not change sign, so f has no inflection point.`
      : `The second derivative changes sign at ${answer === 1 ? "its single simple zero" : "both distinct simple zeros"}, so f has ${answer} inflection point${answer === 1 ? "" : "s"}.`,
    successFeedback: `Correct: f'' changes sign at ${answer} zero${answer === 1 ? "" : "s"}.`,
  };
}

const F_PRIME_GRAPH_CASES = [
  { crosses: [-4], touches: [2] },
  { crosses: [-3, 4], touches: [1] },
  { crosses: [-5, 0, 3], touches: [2] },
  { crosses: [-4, -1, 2, 5], touches: [0] },
  { crosses: [-2], touches: [-5, 3] },
  { crosses: [-4, 1], touches: [-1, 4] },
  { crosses: [-3, 0, 5], touches: [-5, 2] },
  { crosses: [-5, -2, 1, 4], touches: [3] },
  { crosses: [3], touches: [-4, 0] },
  { crosses: [-1, 4], touches: [-3, 2] },
  { crosses: [-4, 2, 5], touches: [-1] },
  { crosses: [-3, 0, 2, 5], touches: [-1] },
] as const;

function formatXValues(values: readonly number[]): string {
  return values.map((value) => `x = ${value}`).join(", ");
}

function readFirstDerivativeWidget(rand: Rand) {
  const chosen = F_PRIME_GRAPH_CASES[Math.floor(rand() * F_PRIME_GRAPH_CASES.length)]!;
  const answer = chosen.crosses.length;
  const commonErrors = [chosen.touches.length, chosen.crosses.length + chosen.touches.length, 0, answer + 1]
    .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
    .slice(0, 3)
    .map((value) => ({
      value,
      feedback: "An extremum of f occurs where f' crosses the x-axis and changes sign, not where f' only touches it.",
    }));
  return {
    type: "numeric" as const,
    prompt: `The graph of f' crosses the x-axis at ${formatXValues(chosen.crosses)}; it only touches the axis at ${formatXValues(chosen.touches)}. How many local extrema does f have?`,
    answer,
    tolerance: 0,
    unit: "",
    commonErrors,
    fallbackFeedback: `There are ${answer} crossings of the x-axis, so f' changes sign ${answer} time${answer === 1 ? "" : "s"} and f has ${answer} local extremum${answer === 1 ? "" : "a"}.`,
    successFeedback: `Each of the ${answer} crossings marks one sign change of f' and therefore one local extremum of f.`,
  };
}

const THREE_CHART_CASES = [
  { h: -5, constant: 4 },
  { h: -4, constant: -3 },
  { h: -3, constant: 7 },
  { h: -2, constant: 1 },
  { h: -1, constant: -6 },
  { h: 1, constant: 5 },
  { h: 2, constant: -4 },
  { h: 3, constant: 8 },
  { h: 4, constant: -2 },
  { h: 5, constant: 3 },
] as const;

function formatPolynomialTerm(coefficient: number, variable: string): string {
  return coefficient < 0
    ? ` - ${Math.abs(coefficient)}${variable}`
    : ` + ${coefficient}${variable}`;
}

function threeChartsWidget(rand: Rand) {
  const chosen = THREE_CHART_CASES[Math.floor(rand() * THREE_CHART_CASES.length)]!;
  const xSquaredCoefficient = -3 * chosen.h;
  const functionText = `f(x) = x^3${formatPolynomialTerm(xSquaredCoefficient, "x^2")}${signedConstant(chosen.constant)}`;
  const answer = chosen.h;
  const commonErrors = [-chosen.h, 3 * chosen.h, 0]
    .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
    .map((value) => ({
      value,
      feedback: "Differentiate twice and solve f''(x) = 0. The inflection x-coordinate comes from the zero of the linear second derivative.",
    }));
  return {
    type: "numeric" as const,
    prompt: `${functionText}. Find the x-coordinate of its inflection point.`,
    answer,
    tolerance: 0,
    unit: "",
    commonErrors,
    fallbackFeedback: `Here f''(x) = 6(x - ${chosen.h}), which changes sign at x = ${chosen.h}.`,
    successFeedback: `The second derivative changes sign at x = ${chosen.h}, so that is the inflection x-coordinate.`,
  };
}

const OPTIMISATION_CASES = [
  ...[40, 48, 56, 64, 72, 80, 88, 96, 104, 112].map((perimeter) => ({ kind: "pen" as const, total: perimeter })),
  ...[12, 14, 16, 18, 20, 22, 24, 26, 28, 30].map((sum) => ({ kind: "squares" as const, total: sum })),
];

function optimisationAppliedWidget(rand: Rand) {
  const chosen = OPTIMISATION_CASES[Math.floor(rand() * OPTIMISATION_CASES.length)]!;
  if (chosen.kind === "pen") {
    const answer = chosen.total ** 2 / 8;
    const depth = chosen.total / 4;
    const width = chosen.total / 2;
    return {
      type: "numeric" as const,
      prompt: `A rectangular pen uses a straight wall as one side and ${chosen.total} m of fencing for the other three sides. What is the maximum possible area, in square metres?`,
      answer,
      tolerance: 0,
      unit: "m^2",
      commonErrors: [
        { value: chosen.total ** 2 / 4, feedback: "That treats the available fencing as though it formed only two equal sides." },
        { value: depth ** 2, feedback: `At the optimum the depth is ${depth} m, but the width is ${width} m; multiply both dimensions.` },
        { value: width, feedback: `That is the optimal width, not the area.` },
      ],
      fallbackFeedback: `If x is the depth, A(x) = x(${chosen.total} - 2x). Its maximum occurs at x = ${depth}, giving ${depth} x ${width} = ${answer} m^2.`,
      successFeedback: `The optimal dimensions are ${depth} m by ${width} m, so the maximum area is ${answer} m^2.`,
    };
  }
  const half = chosen.total / 2;
  const answer = 2 * half ** 2;
  return {
    type: "numeric" as const,
    prompt: `Two real numbers add to ${chosen.total}. What is the smallest possible sum of their squares?`,
    answer,
    tolerance: 0,
    unit: "",
    commonErrors: [
      { value: chosen.total ** 2, feedback: "That is the square of the total, not the least sum of the two separate squares." },
      { value: half ** 2, feedback: `That is the square of one optimal number; add the equal square from the other number.` },
      { value: half, feedback: `That is the value of each number at the minimum, not the sum of their squares.` },
    ],
    fallbackFeedback: `The minimum occurs when the numbers are equal: ${half} and ${half}. Their squared sum is ${answer}.`,
    successFeedback: `Equal numbers minimise the squared sum, and ${half}^2 + ${half}^2 = ${answer}.`,
  };
}

const NESTED_PRODUCT_CASES = [
  { a: 2, b: 1, n: 3 }, { a: 3, b: 2, n: 2 }, { a: 1, b: 3, n: 2 },
  { a: 4, b: 2, n: 3 }, { a: 2, b: 3, n: 3 }, { a: 5, b: 2, n: 4 },
  { a: 1, b: 4, n: 2 }, { a: 3, b: 3, n: 2 }, { a: 2, b: 4, n: 3 },
  { a: 4, b: 3, n: 2 }, { a: 5, b: 4, n: 2 }, { a: 3, b: 2, n: 4 },
] as const;

function nestedProductWidget(rand: Rand) {
  const { a, b, n } = NESTED_PRODUCT_CASES[Math.floor(rand() * NESTED_PRODUCT_CASES.length)]!;
  const answer = b ** n;
  const traps = [0, n * a * b ** (n - 1), b, n * b ** (n - 1)]
    .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
    .slice(0, 3);
  return {
    type: "numeric" as const,
    prompt: `f(x) = x(${a}x + ${b})^${n}. Find f′(0).`,
    answer,
    tolerance: 0,
    unit: "",
    commonErrors: traps.map((value) => ({ value, feedback: "Use the product rule before substituting x = 0; the term multiplied by x then vanishes." })),
    fallbackFeedback: `f′(x) = (${a}x + ${b})^${n} + x × ${n * a}(${a}x + ${b})^${n - 1}. At x = 0, only ${b}^${n} remains, giving ${answer}.`,
    successFeedback: `At x = 0 the second product-rule term vanishes, while the first gives ${b}^${n} = ${answer}.`,
  };
}

const CRITICAL_POINT_CASES = [
  { derivative: "x^2 - 1", answer: 2 }, { derivative: "x^2 - 4", answer: 2 },
  { derivative: "x^2 - 9", answer: 2 }, { derivative: "x^2 - 16", answer: 2 },
  { derivative: "(x - 4)^2", answer: 1 }, { derivative: "(x - 2)^2", answer: 1 },
  { derivative: "(x + 1)^2", answer: 1 }, { derivative: "(x + 3)^2", answer: 1 },
  { derivative: "x^2 + 1", answer: 0 }, { derivative: "x^2 + 4", answer: 0 },
  { derivative: "x^2 + 9", answer: 0 }, { derivative: "x^2 + 16", answer: 0 },
] as const;

function criticalPointWidget(rand: Rand) {
  const chosen = CRITICAL_POINT_CASES[Math.floor(rand() * CRITICAL_POINT_CASES.length)]!;
  return {
    type: "numeric" as const,
    prompt: `A differentiable function has f′(x) = ${chosen.derivative}. How many real critical points does f have?`,
    answer: chosen.answer,
    tolerance: 0,
    unit: "",
    commonErrors: [0, 1, 2, 3].filter((value) => value !== chosen.answer).slice(0, 3).map((value) => ({
      value,
      feedback: "Critical points occur at the real zeros of f′. Count distinct real solutions, including an even-multiplicity zero once.",
    })),
    fallbackFeedback: `Solving ${chosen.derivative} = 0 gives ${chosen.answer} distinct real zero${chosen.answer === 1 ? "" : "s"}.`,
    successFeedback: `The derivative has ${chosen.answer} distinct real zero${chosen.answer === 1 ? "" : "s"}, so f has ${chosen.answer} critical point${chosen.answer === 1 ? "" : "s"}.`,
  };
}

const DERIVATIVE_EVALUATION_CASES = [
  { n: 2, x: -5 }, { n: 2, x: -3 }, { n: 2, x: 4 },
  { n: 3, x: -3 }, { n: 3, x: -2 }, { n: 3, x: 2 },
  { n: 4, x: -2 }, { n: 4, x: 2 }, { n: 4, x: 3 },
  { n: 5, x: -2 }, { n: 5, x: 2 }, { n: 5, x: 3 },
] as const;

function derivativeEvaluationWidget(rand: Rand) {
  const { n, x } = DERIVATIVE_EVALUATION_CASES[Math.floor(rand() * DERIVATIVE_EVALUATION_CASES.length)]!;
  const answer = n * x ** (n - 1);
  const functionValue = x ** n;
  const traps = [functionValue, n * x, (n - 1) * x ** Math.max(0, n - 2), x]
    .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
    .slice(0, 3);
  return {
    type: "numeric" as const,
    prompt: `For f(x) = x^${n}, find f′(${x}).`,
    answer,
    tolerance: 0,
    unit: "",
    commonErrors: traps.map((value) => ({ value, feedback: `Use the power rule f′(x) = ${n}x^${n - 1}, then substitute x = ${x}.` })),
    fallbackFeedback: `f′(x) = ${n}x^${n - 1}, so f′(${x}) = ${answer}.`,
    successFeedback: `The power rule gives f′(${x}) = ${n}(${x})^${n - 1} = ${answer}.`,
  };
}

const DIFFERENTIABILITY_CASES = [
  ["jump", "corner", "smooth minimum"],
  ["cusp", "smooth maximum", "smooth point"],
  ["vertical tangent", "corner", "smooth minimum"],
  ["jump", "cusp", "vertical tangent", "smooth point"],
  ["corner", "smooth maximum", "smooth minimum", "smooth point"],
  ["jump", "vertical tangent", "smooth maximum", "smooth point"],
  ["cusp", "corner", "smooth minimum", "smooth maximum"],
  ["jump", "cusp", "corner", "smooth point"],
  ["vertical tangent", "smooth point", "smooth minimum"],
  ["jump", "corner", "vertical tangent", "smooth maximum"],
  ["cusp", "smooth point", "smooth minimum", "smooth maximum"],
  ["jump", "cusp", "corner", "vertical tangent", "smooth point"],
] as const;

const NON_DIFFERENTIABLE_FEATURES = new Set(["jump", "corner", "cusp", "vertical tangent"]);

function differentiabilityCountWidget(rand: Rand) {
  const features = DIFFERENTIABILITY_CASES[Math.floor(rand() * DIFFERENTIABILITY_CASES.length)]!;
  const answer = features.filter((feature) => NON_DIFFERENTIABLE_FEATURES.has(feature)).length;
  return {
    type: "numeric" as const,
    prompt: `A graph has these marked features: ${features.join(", ")}. At how many marked points does f' fail to exist?`,
    answer,
    tolerance: 0,
    unit: "",
    commonErrors: [0, 1, 2, 3, 4, 5].filter((value) => value !== answer).slice(0, 3).map((value) => ({
      value,
      feedback: "Jumps, corners, cusps, and vertical tangents are not differentiable; a smooth point or smooth extremum is differentiable.",
    })),
    fallbackFeedback: `${answer} listed feature${answer === 1 ? "" : "s"} break differentiability. Smooth points and smooth extrema still have derivatives.`,
    successFeedback: `Exactly ${answer} of the marked features make f' fail to exist.`,
  };
}

const EXPONENTIAL_COEFFICIENTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

function exponentialDerivativeWidget(rand: Rand) {
  const coefficient = EXPONENTIAL_COEFFICIENTS[Math.floor(rand() * EXPONENTIAL_COEFFICIENTS.length)]!;
  return {
    type: "numeric" as const,
    prompt: `f(x) = e^(${coefficient}x). Find f′(0).`,
    answer: coefficient,
    tolerance: 0,
    unit: "",
    commonErrors: [0, 1, Math.E].filter((value) => value !== coefficient).map((value) => ({
      value,
      feedback: `The chain rule gives f′(x) = ${coefficient}e^(${coefficient}x), and e^0 = 1.`,
    })),
    fallbackFeedback: `f′(x) = ${coefficient}e^(${coefficient}x), so f′(0) = ${coefficient}.`,
    successFeedback: `The inner derivative contributes ${coefficient}, and e^0 = 1, giving ${coefficient}.`,
  };
}

const IMPLICIT_CIRCLE_POINTS = [
  { x: 3, y: 4 }, { x: 4, y: 3 }, { x: 5, y: 12 }, { x: 12, y: 5 },
  { x: 7, y: 24 }, { x: 24, y: 7 }, { x: 8, y: 15 }, { x: 15, y: 8 },
  { x: 9, y: 40 }, { x: 40, y: 9 }, { x: 20, y: 21 }, { x: 21, y: 20 },
] as const;

function implicitCircleWidget(rand: Rand) {
  const { x, y } = IMPLICIT_CIRCLE_POINTS[Math.floor(rand() * IMPLICIT_CIRCLE_POINTS.length)]!;
  const radiusSquared = x ** 2 + y ** 2;
  const answer = Number((-x / y).toFixed(3));
  const traps = [Number((x / y).toFixed(3)), Number((-y / x).toFixed(3)), Number((y / x).toFixed(3))]
    .filter((value, index, all) => value !== answer && all.indexOf(value) === index);
  return {
    type: "numeric" as const,
    prompt: `x^2 + y^2 = ${radiusSquared}. Find dy/dx at (${x}, ${y}), rounded to three decimal places.`,
    answer,
    tolerance: 0.0005,
    unit: "",
    commonErrors: traps.map((value) => ({ value, feedback: "Implicit differentiation gives dy/dx = -x/y; keep the negative sign and preserve the coordinate order." })),
    fallbackFeedback: `2x + 2y(dy/dx) = 0, so dy/dx = -x/y = -${x}/${y} = ${answer}.`,
    successFeedback: `Substituting (${x}, ${y}) into -x/y gives ${answer}.`,
  };
}

const FALLING_INTERVAL_CASES = [
  { scale: 1, radius: 1 }, { scale: 2, radius: 2 }, { scale: 3, radius: 3 },
  { scale: 1, radius: 4 }, { scale: 2, radius: 5 }, { scale: 3, radius: 6 },
  { scale: 4, radius: 2 }, { scale: 5, radius: 3 }, { scale: 4, radius: 5 },
  { scale: 2, radius: 7 }, { scale: 3, radius: 8 }, { scale: 1, radius: 9 },
] as const;

function signOfDerivativeWidget(rand: Rand) {
  const { scale, radius } = FALLING_INTERVAL_CASES[Math.floor(rand() * FALLING_INTERVAL_CASES.length)]!;
  const square = radius ** 2;
  const answer = 2 * radius - 1;
  return {
    type: "numeric" as const,
    prompt: `f′(x) = ${scale}(x^2 - ${square}). How many integer values of x have f falling (f′(x) < 0)?`,
    answer,
    tolerance: 0,
    unit: "",
    commonErrors: [2 * radius + 1, 2 * radius, radius]
      .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
      .map((value) => ({ value, feedback: `The derivative is negative only for -${radius} < x < ${radius}; the endpoints make f' equal zero.` })),
    fallbackFeedback: `f′(x) < 0 exactly when -${radius} < x < ${radius}, which contains ${answer} integers.`,
    successFeedback: `There are ${answer} integers strictly between -${radius} and ${radius}.`,
  };
}

const TANGENT_CASES = [
  { x: -5, constant: 3 }, { x: -4, constant: -2 }, { x: -3, constant: 5 },
  { x: -2, constant: -4 }, { x: -1, constant: 6 }, { x: 1, constant: -5 },
  { x: 2, constant: 4 }, { x: 3, constant: -3 }, { x: 4, constant: 7 },
  { x: 5, constant: -6 }, { x: 6, constant: 2 }, { x: 7, constant: -1 },
] as const;

function tangentInterceptWidget(rand: Rand) {
  const chosen = TANGENT_CASES[Math.floor(rand() * TANGENT_CASES.length)]!;
  const pointY = chosen.x ** 2 + chosen.constant;
  const slope = 2 * chosen.x;
  const answer = chosen.constant - chosen.x ** 2;
  const functionText = `f(x) = x^2${chosen.constant < 0 ? ` - ${Math.abs(chosen.constant)}` : ` + ${chosen.constant}`}`;
  const traps = [pointY, slope, chosen.constant]
    .filter((value, index, all) => value !== answer && all.indexOf(value) === index);
  return {
    type: "numeric" as const,
    prompt: `${functionText}. Find the y-intercept of the tangent line at x = ${chosen.x}.`,
    answer,
    tolerance: 0,
    unit: "",
    commonErrors: traps.map((value) => ({ value, feedback: "Use the curve point and derivative slope in point-slope form, then set x = 0 to obtain the intercept." })),
    fallbackFeedback: `The tangent passes through (${chosen.x}, ${pointY}) with slope ${slope}; setting x = 0 gives y = ${answer}.`,
    successFeedback: `Point-slope form with slope ${slope} gives y-intercept ${answer}.`,
  };
}

const PERPENDICULAR_MOTION_CASES = [
  { northRate: 3, eastRate: 4, hours: 6 },
  { northRate: 5, eastRate: 12, hours: 3 },
  { northRate: 8, eastRate: 15, hours: 2 },
  { northRate: 7, eastRate: 24, hours: 2 },
  { northRate: 20, eastRate: 21, hours: 2 },
  { northRate: 9, eastRate: 40, hours: 1 },
  { northRate: 12, eastRate: 35, hours: 2 },
  { northRate: 11, eastRate: 60, hours: 1 },
  { northRate: 28, eastRate: 45, hours: 1 },
  { northRate: 33, eastRate: 56, hours: 1 },
  { northRate: 16, eastRate: 30, hours: 2 },
  { northRate: 14, eastRate: 48, hours: 1 },
] as const;

function choosingRelationWidget(rand: Rand) {
  const chosen = PERPENDICULAR_MOTION_CASES[Math.floor(rand() * PERPENDICULAR_MOTION_CASES.length)]!;
  const northDistance = chosen.northRate * chosen.hours;
  const eastDistance = chosen.eastRate * chosen.hours;
  const separation = Math.hypot(northDistance, eastDistance);
  const answer = (northDistance * chosen.northRate + eastDistance * chosen.eastRate) / separation;
  const traps = [chosen.northRate + chosen.eastRate, Math.abs(chosen.northRate - chosen.eastRate), (chosen.northRate + chosen.eastRate) / 2]
    .filter((value, index, all) => value !== answer && all.indexOf(value) === index);
  return {
    type: "numeric" as const,
    prompt: `Two vehicles leave the same junction at the same time. One travels north at ${chosen.northRate} mph and is ${northDistance} miles from the junction; the other travels east at ${chosen.eastRate} mph and is ${eastDistance} miles away. How fast is the distance between them increasing, in mph?`,
    answer,
    tolerance: 0,
    unit: "mph",
    commonErrors: traps.map((value) => ({
      value,
      feedback: "The paths are perpendicular. Differentiate z^2 = x^2 + y^2, then use z dz/dt = x dx/dt + y dy/dt.",
    })),
    fallbackFeedback: `The separation is ${separation} miles, so ${separation}(dz/dt) = ${northDistance}(${chosen.northRate}) + ${eastDistance}(${chosen.eastRate}), giving ${answer} mph.`,
    successFeedback: `Using the differentiated Pythagorean relation gives ${answer} mph.`,
  };
}

const MOTION_CASES = [
  { kind: "acceleration" as const, a2: -6, a1: 9, constant: 0, time: 1 },
  { kind: "acceleration" as const, a2: -3, a1: -4, constant: 2, time: 2 },
  { kind: "acceleration" as const, a2: 4, a1: -5, constant: -3, time: 1 },
  { kind: "acceleration" as const, a2: -9, a1: 12, constant: 5, time: 4 },
  { kind: "stops" as const, first: 1, second: 3 },
  { kind: "stops" as const, first: 2, second: 2 },
  { kind: "stops" as const, first: 2, second: 5 },
  { kind: "stops" as const, first: 4, second: 4 },
  { kind: "position" as const, first: 1, second: 3, constant: 0 },
  { kind: "position" as const, first: 2, second: 4, constant: 1 },
  { kind: "position" as const, first: 1, second: 5, constant: -2 },
  { kind: "position" as const, first: 3, second: 5, constant: 4 },
] as const;

function signedTerm(coefficient: number, variable = ""): string {
  return coefficient < 0
    ? ` - ${Math.abs(coefficient)}${variable}`
    : ` + ${coefficient}${variable}`;
}

function motionWidget(rand: Rand) {
  const chosen = MOTION_CASES[Math.floor(rand() * MOTION_CASES.length)]!;
  if (chosen.kind === "acceleration") {
    const answer = 6 * chosen.time + 2 * chosen.a2;
    const position = chosen.time ** 3 + chosen.a2 * chosen.time ** 2 + chosen.a1 * chosen.time + chosen.constant;
    const velocity = 3 * chosen.time ** 2 + 2 * chosen.a2 * chosen.time + chosen.a1;
    return {
      type: "numeric" as const,
      prompt: `A particle has s(t) = t^3${signedTerm(chosen.a2, "t^2")}${signedTerm(chosen.a1, "t")}${signedTerm(chosen.constant)}. Find its acceleration at t = ${chosen.time}.`,
      answer,
      tolerance: 0,
      unit: "",
      commonErrors: [position, velocity, -answer]
        .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
        .map((value) => ({ value, feedback: "Acceleration is the second derivative of position. Differentiate twice before substituting the time." })),
      fallbackFeedback: `a(t) = 6t${signedTerm(2 * chosen.a2)}, so a(${chosen.time}) = ${answer}.`,
      successFeedback: `Differentiating position twice gives acceleration ${answer} at t = ${chosen.time}.`,
    };
  }
  if (chosen.kind === "stops") {
    const answer = chosen.first === chosen.second ? 1 : 2;
    return {
      type: "numeric" as const,
      prompt: `A particle's velocity is v(t) = 3(t - ${chosen.first})(t - ${chosen.second}). At how many distinct times is the particle at rest?`,
      answer,
      tolerance: 0,
      unit: "",
      commonErrors: [0, 1, 2, 3].filter((value) => value !== answer).slice(0, 3).map((value) => ({
        value,
        feedback: "The particle is at rest at each distinct real zero of its velocity; a repeated zero counts once.",
      })),
      fallbackFeedback: `The velocity has ${answer} distinct zero${answer === 1 ? "" : "s"}, so the particle is at rest at ${answer} distinct time${answer === 1 ? "" : "s"}.`,
      successFeedback: `There ${answer === 1 ? "is" : "are"} ${answer} distinct time${answer === 1 ? "" : "s"} when v(t) = 0.`,
    };
  }
  const a2 = -1.5 * (chosen.first + chosen.second);
  const a1 = 3 * chosen.first * chosen.second;
  const firstTime = Math.min(chosen.first, chosen.second);
  const answer = firstTime ** 3 + a2 * firstTime ** 2 + a1 * firstTime + chosen.constant;
  return {
    type: "numeric" as const,
    prompt: `A particle has s(t) = t^3${signedTerm(a2, "t^2")}${signedTerm(a1, "t")}${signedTerm(chosen.constant)} and v(t) = 3(t - ${chosen.first})(t - ${chosen.second}). Where is it the first time it comes to rest?`,
    answer,
    tolerance: 0,
    unit: "",
    commonErrors: [firstTime, Math.max(chosen.first, chosen.second), chosen.constant]
      .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
      .map((value) => ({ value, feedback: "First solve v(t) = 0 for the earliest time, then substitute that time into the position function s(t)." })),
    fallbackFeedback: `The first zero of v is t = ${firstTime}; substituting into s gives position ${answer}.`,
    successFeedback: `The earliest rest time is ${firstTime}, and s(${firstTime}) = ${answer}.`,
  };
}

const SPEED_INTERVAL_CASES = [
  { scale: 1, first: 1, second: 3, start: 0, end: 4 },
  { scale: 2, first: 2, second: 4, start: 0, end: 6 },
  { scale: 3, first: 3, second: 7, start: 0, end: 9 },
  { scale: 1, first: 2, second: 6, start: 0, end: 4 },
  { scale: 2, first: 2, second: 6, start: 4, end: 8 },
  { scale: 3, first: 1, second: 5, start: 0, end: 3 },
  { scale: 4, first: 1, second: 5, start: 3, end: 7 },
  { scale: 2, first: 4, second: 8, start: 0, end: 6 },
  { scale: 1, first: 4, second: 8, start: 6, end: 10 },
  { scale: 5, first: 3, second: 9, start: 1, end: 6 },
  { scale: 3, first: 3, second: 9, start: 6, end: 11 },
  { scale: 4, first: 2, second: 8, start: 0, end: 10 },
] as const;

function speedingIntervalCount(first: number, second: number, start: number, end: number): number {
  const midpoint = (first + second) / 2;
  const boundaries = [start, first, midpoint, second, end]
    .filter((value) => value >= start && value <= end)
    .sort((left, right) => left - right)
    .filter((value, index, all) => index === 0 || value !== all[index - 1]);
  let count = 0;
  for (let index = 0; index < boundaries.length - 1; index += 1) {
    const sample = (boundaries[index]! + boundaries[index + 1]!) / 2;
    const velocity = (sample - first) * (sample - second);
    const acceleration = 2 * sample - first - second;
    if (velocity * acceleration > 0) count += 1;
  }
  return count;
}

function speedIntervalsWidget(rand: Rand) {
  const chosen = SPEED_INTERVAL_CASES[Math.floor(rand() * SPEED_INTERVAL_CASES.length)]!;
  const answer = speedingIntervalCount(chosen.first, chosen.second, chosen.start, chosen.end);
  const accelerationConstant = chosen.scale * (chosen.first + chosen.second);
  return {
    type: "numeric" as const,
    prompt: `A particle has v(t) = ${chosen.scale}(t - ${chosen.first})(t - ${chosen.second}) and a(t) = ${2 * chosen.scale}t - ${accelerationConstant} on [${chosen.start}, ${chosen.end}]. On how many sub-intervals is it speeding up?`,
    answer,
    tolerance: 0,
    unit: "",
    commonErrors: [0, 1, 2, 3, 4].filter((value) => value !== answer).slice(0, 3).map((value) => ({
      value,
      feedback: "Split the domain at every zero of velocity and acceleration. The particle speeds up only where v and a have the same sign.",
    })),
    fallbackFeedback: `A sign chart split at t = ${chosen.first}, ${(chosen.first + chosen.second) / 2}, and ${chosen.second} shows ${answer} speeding-up interval${answer === 1 ? "" : "s"} inside the stated domain.`,
    successFeedback: `Velocity and acceleration share a sign on ${answer} sub-interval${answer === 1 ? "" : "s"}.`,
  };
}

const DISTANCE_CASES = [
  { kind: "displacement" as const, a: -4, constant: 3, start: 0, end: 5 },
  { kind: "displacement" as const, a: 3, constant: -2, start: 1, end: 4 },
  { kind: "displacement" as const, a: -6, constant: 5, start: 2, end: 7 },
  { kind: "displacement" as const, a: 5, constant: 1, start: 0, end: 3 },
  { kind: "legs" as const, roots: [1, 3], start: 0, end: 4 },
  { kind: "legs" as const, roots: [2, 6], start: 0, end: 8 },
  { kind: "legs" as const, roots: [3, 7], start: 4, end: 9 },
  { kind: "legs" as const, roots: [2, 8], start: 3, end: 7 },
  { kind: "total" as const, positions: [0, 4, 0, 4] },
  { kind: "total" as const, positions: [2, 9, 5, 12] },
  { kind: "total" as const, positions: [-3, 2, -1, 6] },
  { kind: "total" as const, positions: [5, -2, 4, 1] },
] as const;

function distanceWidget(rand: Rand) {
  const chosen = DISTANCE_CASES[Math.floor(rand() * DISTANCE_CASES.length)]!;
  if (chosen.kind === "displacement") {
    const evaluate = (time: number) => time ** 2 + chosen.a * time + chosen.constant;
    const answer = evaluate(chosen.end) - evaluate(chosen.start);
    return {
      type: "numeric" as const,
      prompt: `A particle has s(t) = t^2${signedTerm(chosen.a, "t")}${signedTerm(chosen.constant)}. Find its displacement over [${chosen.start}, ${chosen.end}].`,
      answer,
      tolerance: 0,
      unit: "",
      commonErrors: [evaluate(chosen.end), evaluate(chosen.start), Math.abs(answer)]
        .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
        .map((value) => ({ value, feedback: "Displacement is final position minus initial position: s(end) - s(start)." })),
      fallbackFeedback: `Displacement is final minus initial position: s(${chosen.end}) - s(${chosen.start}) = ${answer}.`,
      successFeedback: `Final position minus initial position gives displacement ${answer}.`,
    };
  }
  if (chosen.kind === "legs") {
    const reversals = chosen.roots.filter((root) => root > chosen.start && root < chosen.end).length;
    const answer = reversals + 1;
    return {
      type: "numeric" as const,
      prompt: `On [${chosen.start}, ${chosen.end}], a particle has v(t) = (t - ${chosen.roots[0]})(t - ${chosen.roots[1]}). Into how many motion legs must its journey be split?`,
      answer,
      tolerance: 0,
      unit: "",
      commonErrors: [reversals, chosen.roots.length, answer + 1]
        .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
        .map((value) => ({ value, feedback: "Each velocity sign change inside the interval starts a new leg, so the number of legs is one more than the number of interior reversals." })),
      fallbackFeedback: `${reversals} velocity zero${reversals === 1 ? " lies" : "s lie"} inside the interval, making ${answer} motion legs.`,
      successFeedback: `The interval contains ${reversals} reversal${reversals === 1 ? "" : "s"}, so it splits into ${answer} legs.`,
    };
  }
  const answer = chosen.positions.slice(1).reduce<number>((sum, position, index) => sum + Math.abs(position - chosen.positions[index]!), 0);
  const displacement = chosen.positions.at(-1)! - chosen.positions[0];
  return {
    type: "numeric" as const,
    prompt: `A particle visits these positions in order: ${chosen.positions.join(" -> ")}. Find the total distance travelled.`,
    answer,
    tolerance: 0,
    unit: "",
    commonErrors: [displacement, Math.abs(displacement), chosen.positions.at(-1)!]
      .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
      .map((value) => ({ value, feedback: "Total distance adds the absolute change on every leg; it does not cancel backward motion." })),
    fallbackFeedback: `Adding the absolute change on each consecutive leg gives ${answer}.`,
    successFeedback: `The leg lengths add to a total distance of ${answer}.`,
  };
}

const RELATED_RATE_CASES = [
  { shape: "circle" as const, radius: 2, rate: 1 }, { shape: "circle" as const, radius: 3, rate: 2 },
  { shape: "circle" as const, radius: 4, rate: 3 }, { shape: "circle" as const, radius: 5, rate: 2 },
  { shape: "circle" as const, radius: 6, rate: 4 }, { shape: "circle" as const, radius: 7, rate: 3 },
  { shape: "sphere" as const, radius: 2, rate: 1 }, { shape: "sphere" as const, radius: 3, rate: 2 },
  { shape: "sphere" as const, radius: 4, rate: 1 }, { shape: "sphere" as const, radius: 5, rate: 3 },
  { shape: "sphere" as const, radius: 6, rate: 2 }, { shape: "sphere" as const, radius: 7, rate: 1 },
] as const;

function relatedRatesWidget(rand: Rand) {
  const chosen = RELATED_RATE_CASES[Math.floor(rand() * RELATED_RATE_CASES.length)]!;
  const answer = chosen.shape === "circle"
    ? 2 * chosen.radius * chosen.rate
    : 4 * chosen.radius ** 2 * chosen.rate;
  const quantity = chosen.shape === "circle" ? "area of a circle" : "volume of a sphere";
  const symbol = chosen.shape === "circle" ? "dA/dt" : "dV/dt";
  const unit = chosen.shape === "circle" ? "cm^2/s" : "cm^3/s";
  const traps = chosen.shape === "circle"
    ? [2 * chosen.radius, chosen.radius ** 2, answer + chosen.radius]
    : [4 * chosen.radius ** 2, chosen.radius ** 3, answer / chosen.rate];
  return {
    type: "numeric" as const,
    prompt: `The ${quantity} changes as its radius grows at dr/dt = ${chosen.rate} cm/s. Find ${symbol} when r = ${chosen.radius}, as a multiple of π (give only the coefficient).`,
    answer,
    tolerance: 0,
    unit: `π ${unit}`,
    commonErrors: traps.filter((value, index, all) => value !== answer && all.indexOf(value) === index).map((value) => ({
      value,
      feedback: `Differentiate the ${chosen.shape === "circle" ? "area" : "volume"} formula with respect to time, including the factor dr/dt, before substituting the radius.`,
    })),
    fallbackFeedback: chosen.shape === "circle"
      ? `dA/dt = 2πr × dr/dt = 2π × ${chosen.radius} × ${chosen.rate} = ${answer}π.`
      : `dV/dt = 4πr² × dr/dt = 4π × ${chosen.radius}² × ${chosen.rate} = ${answer}π.`,
    successFeedback: `The chain rule gives ${symbol} = ${answer}π ${unit}.`,
  };
}

const LADDER_CASES = [
  { kind: "height" as const, length: 5, foot: 3, height: 4 },
  { kind: "height" as const, length: 10, foot: 6, height: 8 },
  { kind: "height" as const, length: 13, foot: 5, height: 12 },
  { kind: "height" as const, length: 17, foot: 8, height: 15 },
  { kind: "height" as const, length: 25, foot: 7, height: 24 },
  { kind: "height" as const, length: 29, foot: 20, height: 21 },
  { kind: "rate" as const, length: 5, foot: 3, height: 4, footRate: 2 },
  { kind: "rate" as const, length: 10, foot: 6, height: 8, footRate: 2 },
  { kind: "rate" as const, length: 13, foot: 5, height: 12, footRate: 3 },
  { kind: "rate" as const, length: 17, foot: 8, height: 15, footRate: 4 },
  { kind: "rate" as const, length: 25, foot: 7, height: 24, footRate: 6 },
  { kind: "rate" as const, length: 29, foot: 20, height: 21, footRate: 3 },
] as const;

function ladderWidget(rand: Rand) {
  const chosen = LADDER_CASES[Math.floor(rand() * LADDER_CASES.length)]!;
  if (chosen.kind === "height") {
    return {
      type: "numeric" as const,
      prompt: `A ${chosen.length}-ft ladder rests against a wall with its foot ${chosen.foot} ft from the wall. How high is the top, in feet?`,
      answer: chosen.height,
      tolerance: 0,
      unit: "ft",
      commonErrors: [chosen.length - chosen.foot, chosen.length, chosen.foot]
        .filter((value, index, all) => value !== chosen.height && all.indexOf(value) === index)
        .map((value) => ({ value, feedback: "The ladder is the hypotenuse. Use x^2 + y^2 = L^2 and take the positive height." })),
      fallbackFeedback: `The ladder is the hypotenuse, so y = √(${chosen.length}^2 - ${chosen.foot}^2) = ${chosen.height} ft.`,
      successFeedback: `The Pythagorean relation gives height ${chosen.height} ft.`,
    };
  }
  const answer = Number((-(chosen.foot / chosen.height) * chosen.footRate).toFixed(3));
  const traps = [Math.abs(answer), Number((-(chosen.height / chosen.foot) * chosen.footRate).toFixed(3)), -chosen.footRate]
    .filter((value, index, all) => value !== answer && all.indexOf(value) === index);
  return {
    type: "numeric" as const,
    prompt: `A ${chosen.length}-ft ladder has foot distance x = ${chosen.foot} ft and height y = ${chosen.height} ft. Its foot slides away at dx/dt = ${chosen.footRate} ft/s. Find dy/dt to three decimal places, including its sign.`,
    answer,
    tolerance: 0.0005,
    unit: "ft/s",
    commonErrors: traps.map((value) => ({ value, feedback: "Differentiate x^2 + y^2 = L^2: dy/dt = -(x/y)(dx/dt). The top moves downward, so the sign is negative." })),
    fallbackFeedback: `dy/dt = -(${chosen.foot}/${chosen.height})(${chosen.footRate}) = ${answer} ft/s.`,
    successFeedback: `The related-rate equation gives dy/dt = ${answer} ft/s.`,
  };
}

const LINEARISATION_CASES = [
  { kind: "sqrtSlope" as const, root: 2 }, { kind: "sqrtSlope" as const, root: 3 },
  { kind: "sqrtSlope" as const, root: 4 }, { kind: "sqrtSlope" as const, root: 5 },
  { kind: "sqrtEstimate" as const, root: 2, delta: 0.1 }, { kind: "sqrtEstimate" as const, root: 3, delta: 0.1 },
  { kind: "sqrtEstimate" as const, root: 4, delta: 0.2 }, { kind: "sqrtEstimate" as const, root: 5, delta: 0.2 },
  { kind: "cubicEstimate" as const, base: 2, delta: 0.1 }, { kind: "cubicEstimate" as const, base: 3, delta: 0.1 },
  { kind: "cubicEstimate" as const, base: 4, delta: -0.1 }, { kind: "cubicEstimate" as const, base: 5, delta: -0.2 },
] as const;

function linearisationWidget(rand: Rand) {
  const chosen = LINEARISATION_CASES[Math.floor(rand() * LINEARISATION_CASES.length)]!;
  if (chosen.kind === "sqrtSlope") {
    const input = chosen.root ** 2;
    const answer = Number((1 / (2 * chosen.root)).toFixed(3));
    return {
      type: "numeric" as const,
      prompt: `For f(x) = √x, find f′(${input}) to three decimal places.`,
      answer,
      tolerance: 0.0005,
      unit: "",
      commonErrors: [chosen.root, 0.5, 2 * chosen.root]
        .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
        .map((value) => ({ value, feedback: "The derivative is 1/(2√x); substitute the perfect-square input after differentiating." })),
      fallbackFeedback: `f′(${input}) = 1/(2 × ${chosen.root}) = ${answer}.`,
      successFeedback: `The slope at x = ${input} is ${answer}.`,
    };
  }
  if (chosen.kind === "sqrtEstimate") {
    const base = chosen.root ** 2;
    const target = base + chosen.delta;
    const answer = Number((chosen.root + chosen.delta / (2 * chosen.root)).toFixed(4));
    return {
      type: "numeric" as const,
      prompt: `Use the tangent to √x at x = ${base} to estimate √${target}. Give four decimal places.`,
      answer,
      tolerance: 0.00005,
      unit: "",
      commonErrors: [chosen.root + chosen.delta, chosen.root, chosen.root + 2 * chosen.root * chosen.delta]
        .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
        .map((value) => ({ value, feedback: `Use L(x) = ${chosen.root} + (x - ${base})/(2 × ${chosen.root}); scale the small input change by the tangent slope.` })),
      fallbackFeedback: `L(${target}) = ${chosen.root} + ${chosen.delta}/(2 × ${chosen.root}) = ${answer}.`,
      successFeedback: `The tangent-line estimate is ${answer}.`,
    };
  }
  const target = chosen.base + chosen.delta;
  const answer = Number((chosen.base ** 3 + 3 * chosen.base ** 2 * chosen.delta).toFixed(4));
  return {
    type: "numeric" as const,
    prompt: `Use the tangent to f(x) = x^3 at x = ${chosen.base} to estimate ${target}^3. Give four decimal places.`,
    answer,
    tolerance: 0.00005,
    unit: "",
    commonErrors: [Number((target ** 3).toFixed(4)), chosen.base ** 3, 3 * chosen.base ** 2]
      .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
      .map((value) => ({ value, feedback: "The linear estimate is f(a) + f′(a)(x - a); multiply the slope by the small change, not by the full input." })),
    fallbackFeedback: `L(${target}) = ${chosen.base ** 3} + ${3 * chosen.base ** 2}(${chosen.delta}) = ${answer}.`,
    successFeedback: `The tangent-line estimate is ${answer}.`,
  };
}

const DIFFERENTIAL_CASES = [
  { kind: "cubeError" as const, side: 6, error: 0.1 },
  { kind: "cubeError" as const, side: 8, error: 0.2 },
  { kind: "cubeError" as const, side: 10, error: 0.1 },
  { kind: "cubeError" as const, side: 12, error: 0.25 },
  { kind: "percent" as const, power: 2, error: 1 },
  { kind: "percent" as const, power: 2, error: 3 },
  { kind: "percent" as const, power: 3, error: 1 },
  { kind: "percent" as const, power: 3, error: 2 },
  { kind: "tolerance" as const, side: 10, tolerance: 3 },
  { kind: "tolerance" as const, side: 12, tolerance: 6 },
  { kind: "tolerance" as const, side: 15, tolerance: 3 },
  { kind: "tolerance" as const, side: 20, tolerance: 1.5 },
] as const;

function differentialLabGenerated(rand: Rand) {
  const chosen = DIFFERENTIAL_CASES[Math.floor(rand() * DIFFERENTIAL_CASES.length)]!;
  if (chosen.kind === "cubeError") {
    const answer = Number((3 * chosen.side ** 2 * chosen.error).toFixed(3));
    const widget = {
      type: "exactNumberLab" as const,
      prompt: `A cube's side is measured as ${chosen.side} cm with an error of up to ${chosen.error} cm. Estimate the resulting volume error, in cm^3.`,
      task: "approximationEvaluate" as const,
      values: [],
      approxConstants: [
        { id: "s", label: "the measured side", value: chosen.side },
        { id: "ds", label: "the measurement error", value: chosen.error },
      ],
      approxFormula: {
        op: "multiply" as const,
        left: { op: "multiply" as const, left: { op: "lit" as const, value: 3 }, right: { op: "multiply" as const, left: { op: "const" as const, id: "s" }, right: { op: "const" as const, id: "s" } } },
        right: { op: "const" as const, id: "ds" },
      },
      approxRound: 3,
      answerMode: "numeric" as const,
      tolerance: 0.0005,
      numericErrors: [chosen.error, 3 * chosen.side * chosen.error, chosen.side ** 3]
        .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
        .map((value) => ({ value, feedback: "Use dV = 3s^2 ds; the derivative converts the side error into a volume error." })),
      choices: [], authoredStages: [], requiredStageKeys: [], requiredExplorations: 1,
      explorationFeedback: "Inspect the measured side and error before checking the differential estimate.",
      fallbackFeedback: `dV = 3(${chosen.side})^2(${chosen.error}) = ${answer} cm^3.`,
      successFeedback: `The differential estimate is ${answer} cm^3.`,
    };
    return { widget, answer };
  }
  if (chosen.kind === "percent") {
    const answer = chosen.power * chosen.error;
    const quantity = chosen.power === 2 ? "area" : "volume";
    const widget = {
      type: "exactNumberLab" as const,
      prompt: `A length is measured with a ${chosen.error}% error. Estimate the percentage error in a related ${quantity} proportional to that length^${chosen.power}.`,
      task: "approximationEvaluate" as const,
      values: [],
      approxConstants: [{ id: "e", label: "the percentage error in length", value: chosen.error }],
      approxFormula: { op: "multiply" as const, left: { op: "lit" as const, value: chosen.power }, right: { op: "const" as const, id: "e" } },
      approxRound: 3,
      answerMode: "numeric" as const,
      tolerance: 0.0005,
      numericErrors: [chosen.error, chosen.power ** 2 * chosen.error, chosen.power + chosen.error]
        .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
        .map((value) => ({ value, feedback: `For a power ${chosen.power}, the approximate relative error is ${chosen.power} times the input relative error.` })),
      choices: [], authoredStages: [], requiredStageKeys: [], requiredExplorations: 1,
      explorationFeedback: "Inspect the exponent and input percentage before checking.",
      fallbackFeedback: `${chosen.power} x ${chosen.error}% = ${answer}%.`,
      successFeedback: `The estimated percentage error is ${answer}%.`,
    };
    return { widget, answer };
  }
  const answer = (chosen.tolerance / 3 / 100) * chosen.side;
  const widget = {
    type: "exactNumberLab" as const,
    prompt: `A cube's volume must be accurate within ${chosen.tolerance}%. How precisely must its ${chosen.side}-cm side be measured, in cm?`,
    task: "approximationEvaluate" as const,
    values: [],
    approxConstants: [
      { id: "tol", label: "allowed percentage volume error", value: chosen.tolerance },
      { id: "s", label: "the measured side", value: chosen.side },
    ],
    approxFormula: {
      op: "multiply" as const,
      left: { op: "divide" as const, left: { op: "divide" as const, left: { op: "const" as const, id: "tol" }, right: { op: "lit" as const, value: 3 } }, right: { op: "lit" as const, value: 100 } },
      right: { op: "const" as const, id: "s" },
    },
    approxRound: 3,
    answerMode: "numeric" as const,
    tolerance: 0.0005,
    numericErrors: [chosen.tolerance / 100 * chosen.side, chosen.tolerance / 100, chosen.side / 100]
      .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
      .map((value) => ({ value, feedback: "A cube's relative volume error is about three times its relative side error; divide the percentage tolerance by 3 before applying it to the side." })),
    choices: [], authoredStages: [], requiredStageKeys: [], requiredExplorations: 1,
    explorationFeedback: "Inspect the allowed volume percentage and side length before checking.",
    fallbackFeedback: `ds = (${chosen.tolerance}/3)/100 x ${chosen.side} = ${answer} cm.`,
    successFeedback: `The side must be measured within ${answer} cm.`,
  };
  return { widget, answer };
}

const LINEARISATION_ERROR_FACTORS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15] as const;

function linearisationLimitsWidget(rand: Rand) {
  const factor = LINEARISATION_ERROR_FACTORS[Math.floor(rand() * LINEARISATION_ERROR_FACTORS.length)]!;
  const answer = factor ** 2;
  return {
    type: "numeric" as const,
    prompt: `Near a fixed base point, a tangent-line approximation has error proportional to the square of the input distance. If a new input is ${factor} times farther from the base point, roughly how many times larger is the error?`,
    answer,
    tolerance: 0,
    unit: "times",
    commonErrors: [factor, 2 * factor, factor ** 3]
      .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
      .map((value) => ({ value, feedback: "The leading linearisation error is quadratic in the distance, so square the distance factor." })),
    fallbackFeedback: `The distance factor is ${factor}, so the error factor is ${factor}^2 = ${answer}.`,
    successFeedback: `A ${factor}-fold distance increase gives about ${answer} times the error.`,
  };
}

const LHOPITAL_CASES = [
  { power: 2, point: 2 }, { power: 2, point: 3 }, { power: 2, point: 4 },
  { power: 2, point: 5 }, { power: 2, point: 6 }, { power: 2, point: 7 },
  { power: 3, point: 2 }, { power: 3, point: 3 }, { power: 3, point: 4 },
  { power: 3, point: 5 }, { power: 3, point: 6 }, { power: 3, point: 7 },
] as const;

function lhopitalWidget(rand: Rand) {
  const chosen = LHOPITAL_CASES[Math.floor(rand() * LHOPITAL_CASES.length)]!;
  const constant = chosen.point ** chosen.power;
  const answer = chosen.power * chosen.point ** (chosen.power - 1);
  return {
    type: "numeric" as const,
    prompt: `Evaluate lim(x -> ${chosen.point}) (x^${chosen.power} - ${constant})/(x - ${chosen.point}) using L'Hopital's rule.`,
    answer,
    tolerance: 0,
    unit: "",
    commonErrors: [0, chosen.point, chosen.power * chosen.point]
      .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
      .map((value) => ({ value, feedback: `Differentiate numerator and denominator separately, then substitute x = ${chosen.point}.` })),
    fallbackFeedback: `The derivative ratio is ${chosen.power}x^${chosen.power - 1}/1, which gives ${answer} at x = ${chosen.point}.`,
    successFeedback: `L'Hopital's rule gives ${answer}.`,
  };
}

const OTHER_LIMIT_CASES = [
  { kind: "exponential" as const, power: 1, rate: 1 }, { kind: "exponential" as const, power: 2, rate: 1 },
  { kind: "exponential" as const, power: 3, rate: 1 }, { kind: "exponential" as const, power: 2, rate: 2 },
  { kind: "exponential" as const, power: 3, rate: 2 }, { kind: "exponential" as const, power: 4, rate: 3 },
  { kind: "logProduct" as const, power: 1 }, { kind: "logProduct" as const, power: 2 },
  { kind: "logProduct" as const, power: 3 }, { kind: "logProduct" as const, power: 4 },
  { kind: "logProduct" as const, power: 5 }, { kind: "logProduct" as const, power: 6 },
] as const;

function otherLimitFormsWidget(rand: Rand) {
  const chosen = OTHER_LIMIT_CASES[Math.floor(rand() * OTHER_LIMIT_CASES.length)]!;
  const prompt = chosen.kind === "exponential"
    ? `Evaluate lim(x -> infinity) x^${chosen.power}/e^(${chosen.rate}x).`
    : `Evaluate lim(x -> 0+) x^${chosen.power} ln(x).`;
  return {
    type: "numeric" as const,
    prompt,
    answer: 0,
    tolerance: 0,
    unit: "",
    commonErrors: [1, -1, chosen.power].filter((value, index, all) => value !== 0 && all.indexOf(value) === index).map((value) => ({
      value,
      feedback: chosen.kind === "exponential"
        ? "Repeated L'Hopital differentiation removes the polynomial while the positive exponential remains, so the ratio tends to zero."
        : "Rewrite the product as a quotient and apply L'Hopital; every positive power of x dominates the logarithm near zero.",
    })),
    fallbackFeedback: chosen.kind === "exponential"
      ? "The exponential outgrows every fixed polynomial, so the limit is 0."
      : "After rewriting as a quotient, the positive power of x dominates ln(x), so the limit is 0.",
    successFeedback: "The limit is 0.",
  };
}

const SLOPE_FIELD_CASES = [
  { a: 1, b: 0, x: 2, y: 7 }, { a: 2, b: 0, x: -3, y: 4 },
  { a: 0, b: 1, x: 5, y: -2 }, { a: 0, b: 3, x: 1, y: 4 },
  { a: 1, b: 1, x: 2, y: 3 }, { a: 2, b: 1, x: -1, y: 5 },
  { a: 1, b: -1, x: 4, y: 2 }, { a: 3, b: -1, x: 2, y: 5 },
  { a: -1, b: 2, x: 3, y: 4 }, { a: 2, b: -3, x: 5, y: 2 },
  { a: -2, b: 1, x: -3, y: 6 }, { a: 4, b: 1, x: 1, y: -2 },
] as const;

function linearExpression(a: number, b: number): string {
  const xTerm = a === 0 ? "" : a === 1 ? "x" : a === -1 ? "-x" : `${a}x`;
  const yTerm = b === 0 ? "" : b > 0 ? `${xTerm ? " + " : ""}${b === 1 ? "y" : `${b}y`}` : `${xTerm ? " - " : "-"}${Math.abs(b) === 1 ? "y" : `${Math.abs(b)}y`}`;
  return `${xTerm}${yTerm}`;
}

function slopeFieldWidget(rand: Rand) {
  const chosen = SLOPE_FIELD_CASES[Math.floor(rand() * SLOPE_FIELD_CASES.length)]!;
  const answer = chosen.a * chosen.x + chosen.b * chosen.y;
  const traps = [chosen.x, chosen.y, chosen.x * chosen.y]
    .filter((value, index, all) => value !== answer && all.indexOf(value) === index);
  const expression = linearExpression(chosen.a, chosen.b);
  return {
    type: "numeric" as const,
    prompt: `For dy/dx = ${expression}, find the slope-field value at (${chosen.x}, ${chosen.y}).`,
    answer, tolerance: 0, unit: "",
    commonErrors: traps.map((value) => ({ value, feedback: "Substitute the point's x- and y-coordinates into the displayed right-hand side exactly as written." })),
    fallbackFeedback: `Substitute the point into the field rule: at (${chosen.x}, ${chosen.y}), ${expression} = ${answer}.`,
    successFeedback: `The field assigns slope ${answer} at that point.`,
  };
}

const SEPARABLE_CASES = [
  { coefficient: 2, initial: 2, x: 1 }, { coefficient: 2, initial: 3, x: 1 },
  { coefficient: 2, initial: 4, x: 1 }, { coefficient: 4, initial: 2, x: 1 },
  { coefficient: 4, initial: 3, x: 1 }, { coefficient: 6, initial: 2, x: 1 },
  { coefficient: 2, initial: 5, x: 2 }, { coefficient: 4, initial: 1, x: 2 },
  { coefficient: -2, initial: 3, x: 1 }, { coefficient: -4, initial: 5, x: 1 },
  { coefficient: -2, initial: 4, x: 2 }, { coefficient: 6, initial: 1, x: 2 },
] as const;

function separableWidget(rand: Rand) {
  const chosen = SEPARABLE_CASES[Math.floor(rand() * SEPARABLE_CASES.length)]!;
  const exponent = chosen.coefficient * chosen.x ** 2 / 2;
  const answer = Number((chosen.initial * Math.exp(exponent)).toFixed(3));
  return {
    type: "numeric" as const,
    prompt: `The equation dy/dx = ${chosen.coefficient}xy has y(0) = ${chosen.initial}. Its solution is y = ${chosen.initial}e^(${chosen.coefficient / 2}x^2). Find y(${chosen.x}) to three decimal places.`,
    answer, tolerance: 0.0005, unit: "",
    commonErrors: [chosen.initial, Number(Math.exp(exponent).toFixed(3)), chosen.initial ** 2]
      .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
      .map((value) => ({ value, feedback: "Substitute x into the exponent, evaluate the exponential, and keep the initial-value multiplier." })),
    fallbackFeedback: `Substituting x = ${chosen.x} into the separated solution gives y(${chosen.x}) = ${chosen.initial}e^(${exponent}) = ${answer}.`,
    successFeedback: `The separated solution gives y(${chosen.x}) = ${answer}.`,
  };
}

const LOGISTIC_CASES = [40, 60, 80, 100, 120, 200, 300, 400, 500, 600, 800, 1000] as const;

function logisticWidget(rand: Rand) {
  const capacity = LOGISTIC_CASES[Math.floor(rand() * LOGISTIC_CASES.length)]!;
  const rate = [0.1, 0.2, 0.3, 0.4][capacity % 4] ?? 0.2;
  const answer = capacity / 2;
  return {
    type: "numeric" as const,
    prompt: `A population follows dP/dt = ${rate}P(1 - P/${capacity}). At what population is its growth rate greatest?`,
    answer, tolerance: 0, unit: "",
    commonErrors: [capacity, 0, rate].filter((value) => value !== answer).map((value) => ({ value, feedback: "The logistic growth-rate parabola has zeros at 0 and the carrying capacity, so its maximum is halfway between." })),
    fallbackFeedback: `The carrying capacity is ${capacity}, so the rate peaks at P = ${capacity}/2 = ${answer}.`,
    successFeedback: `Maximum growth occurs at half the carrying capacity: ${answer}.`,
  };
}

const EQUILIBRIUM_CASES = [
  { job: "count" as const, capacity: 4, initial: 6 }, { job: "count" as const, capacity: 10, initial: 12 },
  { job: "count" as const, capacity: 50, initial: 70 }, { job: "count" as const, capacity: 100, initial: 140 },
  { job: "peak" as const, capacity: 20, initial: 30 }, { job: "peak" as const, capacity: 40, initial: 60 },
  { job: "peak" as const, capacity: 80, initial: 120 }, { job: "peak" as const, capacity: 200, initial: 260 },
  { job: "settle" as const, capacity: 30, initial: 45 }, { job: "settle" as const, capacity: 60, initial: 90 },
  { job: "settle" as const, capacity: 120, initial: 180 }, { job: "settle" as const, capacity: 300, initial: 450 },
] as const;

function equilibriumWidget(rand: Rand) {
  const chosen = EQUILIBRIUM_CASES[Math.floor(rand() * EQUILIBRIUM_CASES.length)]!;
  const prompt = chosen.job === "count"
    ? `For dy/dt = 0.4y(1 - y/${chosen.capacity}), how many equilibrium solutions are there?`
    : chosen.job === "peak"
      ? `For dP/dt = 0.4P(1 - P/${chosen.capacity}), at what population is the growth rate greatest?`
      : `A population follows dP/dt = 0.4P(1 - P/${chosen.capacity}) and starts at P = ${chosen.initial}. What value does it approach in the long run?`;
  const answer = chosen.job === "count" ? 2 : chosen.job === "peak" ? chosen.capacity / 2 : chosen.capacity;
  return {
    type: "numeric" as const,
    prompt, answer, tolerance: 0, unit: "",
    commonErrors: [0, chosen.capacity / 2, chosen.capacity, chosen.initial]
      .filter((value, index, all) => value !== answer && all.indexOf(value) === index).slice(0, 3)
      .map((value) => ({ value, feedback: "Use the two logistic equilibria, the midpoint peak, and the stable carrying capacity according to the question's job." })),
    fallbackFeedback: chosen.job === "count" ? "The factors vanish at y = 0 and y = K, giving two equilibria." : chosen.job === "peak" ? `The growth-rate parabola peaks at K/2 = ${answer}.` : `The stable carrying capacity is ${answer}, so the solution approaches it.`,
    successFeedback: `The requested logistic value is ${answer}.`,
  };
}

const EXPONENTIAL_MODEL_CASES = [
  { job: "growth" as const, initial: 100, rate: 0.1, time: 5 }, { job: "growth" as const, initial: 200, rate: 0.1, time: 10 },
  { job: "growth" as const, initial: 80, rate: 0.2, time: 4 }, { job: "growth" as const, initial: 150, rate: 0.05, time: 8 },
  { job: "growth" as const, initial: 300, rate: 0.03, time: 12 }, { job: "growth" as const, initial: 50, rate: 0.15, time: 6 },
  { job: "halfLife" as const, halfLife: 2 }, { job: "halfLife" as const, halfLife: 3 },
  { job: "halfLife" as const, halfLife: 4 }, { job: "halfLife" as const, halfLife: 5 },
  { job: "halfLife" as const, halfLife: 8 }, { job: "halfLife" as const, halfLife: 10 },
] as const;

function exponentialModelWidget(rand: Rand) {
  const chosen = EXPONENTIAL_MODEL_CASES[Math.floor(rand() * EXPONENTIAL_MODEL_CASES.length)]!;
  if (chosen.job === "growth") {
    const answer = Number((chosen.initial * Math.exp(chosen.rate * chosen.time)).toFixed(3));
    return {
      type: "numeric" as const,
      prompt: `A quantity satisfies dP/dt = ${chosen.rate}P with P(0) = ${chosen.initial}. Find P(${chosen.time}) to three decimal places.`,
      answer, tolerance: 0.0005, unit: "",
      commonErrors: [chosen.initial, chosen.initial * chosen.time, chosen.initial * (1 + chosen.rate)]
        .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
        .map((value) => ({ value, feedback: "Use P(t) = P(0)e^(kt); continuous exponential growth is not a one-time percentage or linear change." })),
      fallbackFeedback: `P(${chosen.time}) = ${chosen.initial}e^(${round3(chosen.rate * chosen.time)}) = ${answer}.`, successFeedback: `The exponential model gives ${answer}.`,
    };
  }
  const answer = Number((Math.log(2) / chosen.halfLife).toFixed(4));
  return {
    type: "numeric" as const,
    prompt: `A substance has half-life ${chosen.halfLife} days. Find the positive decay constant k = ln(2)/T to four decimal places.`,
    answer, tolerance: 0.00005, unit: "per day",
    commonErrors: [chosen.halfLife, 1 / chosen.halfLife, Math.log(2)]
      .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
      .map((value) => ({ value, feedback: "The positive decay constant is ln(2) divided by the half-life." })),
    fallbackFeedback: `k = ln(2)/${chosen.halfLife} = ${answer} per day.`, successFeedback: `The decay constant is ${answer} per day.`,
  };
}

const EULER_CASES = [
  { rate: 1, initial: 1, step: 0.5, steps: 1 }, { rate: 1, initial: 1, step: 0.5, steps: 2 },
  { rate: 1, initial: 1, step: 0.25, steps: 4 }, { rate: 2, initial: 1, step: 0.25, steps: 2 },
  { rate: 0.5, initial: 4, step: 0.5, steps: 2 }, { rate: -1, initial: 8, step: 0.25, steps: 2 },
  { rate: 1, initial: 2, step: 0.2, steps: 5 }, { rate: 2, initial: 3, step: 0.1, steps: 4 },
  { rate: -0.5, initial: 10, step: 0.2, steps: 3 }, { rate: 3, initial: 1, step: 0.1, steps: 3 },
  { rate: 0.25, initial: 16, step: 0.4, steps: 2 }, { rate: -2, initial: 5, step: 0.1, steps: 4 },
] as const;

function eulerWidget(rand: Rand) {
  const chosen = EULER_CASES[Math.floor(rand() * EULER_CASES.length)]!;
  const answer = Number((chosen.initial * (1 + chosen.rate * chosen.step) ** chosen.steps).toFixed(4));
  return {
    type: "numeric" as const,
    prompt: `Use Euler's method for dy/dx = ${coefficientVariable(chosen.rate, "y")}, starting at y(0) = ${chosen.initial}, with step h = ${chosen.step}. Find y after ${chosen.steps} step${chosen.steps === 1 ? "" : "s"}, to four decimal places.`,
    answer, tolerance: 0.00005, unit: "",
    commonErrors: [chosen.initial, chosen.initial * (1 + chosen.rate * chosen.step), chosen.initial + chosen.steps * chosen.step]
      .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
      .map((value) => ({ value, feedback: "For each Euler step, update y by h times the current slope; here every step multiplies y by 1 + kh." })),
    fallbackFeedback: `Each step multiplies y by ${1 + chosen.rate * chosen.step}, giving ${answer} after ${chosen.steps} step${chosen.steps === 1 ? "" : "s"}.`,
    successFeedback: `Euler's method gives ${answer}.`,
  };
}

/* S246 / Phase 5. The in-01 pools repeated one or two mathematical prompts.
 * These builders preserve the Riemann-sum, squeeze, integral-property, and
 * signed-area jobs while varying the quantities and independently gradeable truth. */
type GeneratedIntegrationVariant = { widget: any; answer: any };
type ChoiceSeed = { label: string; correct: boolean; feedback: string };

function integrationMcq(rand: Rand, prompt: string, choices: readonly ChoiceSeed[]): GeneratedIntegrationVariant {
  const options = shuffle(rand, choices).map((choice, index) => ({ ...choice, id: `o${index}` }));
  const correct = options.find((choice) => choice.correct);
  if (!correct) throw new Error("Generated integration MCQ has no correct choice");
  return { widget: { type: "mcq", prompt, options }, answer: correct.id };
}

const RIEMANN_NUMERIC_CASES = [
  { m: 1, n: 2 }, { m: 2, n: 2 }, { m: 1, n: 3 }, { m: 2, n: 3 },
  { m: 3, n: 3 }, { m: 1, n: 5 }, { m: 2, n: 4 }, { m: 3, n: 4 },
  { m: 2, n: 5 }, { m: 4, n: 4 }, { m: 3, n: 5 }, { m: 4, n: 5 },
] as const;

function riemannNumericWidget(rand: Rand): GeneratedIntegrationVariant {
  const { m, n } = pick(rand, RIEMANN_NUMERIC_CASES);
  const answer = m * n * (n - 1) / 2;
  const right = m * n * (n + 1) / 2;
  const exact = m * n * n / 2;
  const widget = {
    type: "numeric" as const,
    prompt: `For f(x) = ${coefficientVariable(m, "x")} on [0, ${n}], use ${n} equal strips and left endpoints. What is the Riemann-sum estimate?`,
    answer,
    tolerance: 0,
    unit: "",
    commonErrors: [
      { value: right, feedback: "That uses the right endpoints; the requested left sum begins with x = 0 and stops one strip before the upper bound." },
      { value: exact, feedback: "That is the exact triangular area; the question asks for the finite left-endpoint rectangle sum." },
    ],
    fallbackFeedback: `Each strip has width 1, so add the heights ${m}·0 through ${m}·${n - 1}; the estimate is ${answer}.`,
    successFeedback: `The ${n} left-endpoint heights sum to ${answer}, with unit strip width.`,
  };
  return { widget, answer };
}

const RIEMANN_CHOICE_CASES = [
  { m: 1, c: 2, b: 3, direction: "increasing", rule: "left" },
  { m: 2, c: 1, b: 4, direction: "increasing", rule: "right" },
  { m: 3, c: 20, b: 5, direction: "decreasing", rule: "left" },
  { m: 1, c: 9, b: 6, direction: "decreasing", rule: "right" },
  { m: 4, c: 3, b: 2, direction: "increasing", rule: "left" },
  { m: 5, c: 2, b: 3, direction: "increasing", rule: "right" },
  { m: 2, c: 18, b: 7, direction: "decreasing", rule: "left" },
  { m: 3, c: 25, b: 6, direction: "decreasing", rule: "right" },
  { m: 6, c: 1, b: 4, direction: "increasing", rule: "left" },
  { m: 2, c: 5, b: 8, direction: "increasing", rule: "right" },
  { m: 4, c: 30, b: 5, direction: "decreasing", rule: "left" },
  { m: 5, c: 40, b: 6, direction: "decreasing", rule: "right" },
] as const;

function riemannMcqWidget(rand: Rand): GeneratedIntegrationVariant {
  const entry = pick(rand, RIEMANN_CHOICE_CASES);
  const increasing = entry.direction === "increasing";
  const underestimate = (increasing && entry.rule === "left") || (!increasing && entry.rule === "right");
  const expression = increasing ? `${coefficientVariable(entry.m, "x")} + ${entry.c}` : `${entry.c} − ${coefficientVariable(entry.m, "x")}`;
  const correct = underestimate ? "The estimate is an underestimate." : "The estimate is an overestimate.";
  return integrationMcq(
    rand,
    `The function f(x) = ${expression} is ${entry.direction} on [0, ${entry.b}]. Equal-width rectangles use ${entry.rule} endpoints. Which conclusion is guaranteed?`,
    [
      { label: "The estimate is an underestimate.", correct: correct === "The estimate is an underestimate.", feedback: "Compare each endpoint height with the function values across its entire strip." },
      { label: "The estimate is an overestimate.", correct: correct === "The estimate is an overestimate.", feedback: "Compare each endpoint height with the function values across its entire strip." },
      { label: "The estimate is exact for every number of strips.", correct: false, feedback: "Endpoint rectangles do not match a nonconstant sloping graph exactly for every partition." },
      { label: "The error direction cannot be determined from monotonicity.", correct: false, feedback: "Monotonicity and the endpoint choice determine whether every rectangle lies above or below the graph." },
    ],
  );
}

const SQUEEZE_NUMERIC_CASES = [
  { m: 1, n: 2 }, { m: 1, n: 3 }, { m: 2, n: 2 }, { m: 2, n: 3 },
  { m: 2, n: 4 }, { m: 3, n: 3 }, { m: 3, n: 4 }, { m: 3, n: 5 },
  { m: 4, n: 4 }, { m: 4, n: 5 }, { m: 5, n: 5 }, { m: 5, n: 6 },
] as const;

function squeezeNumericWidget(rand: Rand): GeneratedIntegrationVariant {
  const { m, n } = pick(rand, SQUEEZE_NUMERIC_CASES);
  const answer = m * n;
  const widget = {
    type: "numeric" as const,
    prompt: `For f(x) = ${coefficientVariable(m, "x")} on [0, ${n}], use ${n} equal strips. By how much does the right sum exceed the left sum?`,
    answer,
    tolerance: 0,
    unit: "",
    commonErrors: [
      { value: m * n * n, feedback: "That omits the strip-width factor; the endpoint-height gap must be multiplied by Δx." },
      { value: 1, feedback: "That is only the strip width; multiply it by f(b) − f(a) to get the gap between sums." },
    ],
    fallbackFeedback: `The gap is [f(${n}) − f(0)]Δx = ${m * n}·1 = ${answer}.`,
    successFeedback: `The endpoint-height difference times Δx gives a right-minus-left gap of ${answer}.`,
  };
  return { widget, answer };
}

const SQUEEZE_BOUND_CASES = [
  { left: 2, right: 9 }, { left: 4, right: 11 }, { left: 5, right: 13 }, { left: 7, right: 16 },
  { left: 8, right: 18 }, { left: 10, right: 21 }, { left: 12, right: 25 }, { left: 15, right: 29 },
  { left: 18, right: 33 }, { left: 20, right: 37 }, { left: 24, right: 42 }, { left: 27, right: 48 },
] as const;

function squeezeMcqWidget(rand: Rand): GeneratedIntegrationVariant {
  const { left, right } = pick(rand, SQUEEZE_BOUND_CASES);
  const correct = `The integral is in [${left}, ${right}].`;
  return integrationMcq(
    rand,
    `For a continuous increasing function, a partition gives left sum ${left} and right sum ${right}. What has this proved about the definite integral?`,
    [
      { label: correct, correct: true, feedback: "The increasing graph lies above every left rectangle and below every right rectangle, so these are rigorous bounds." },
      { label: `The integral equals ${(left + right) / 2}.`, correct: false, feedback: "The midpoint is an estimate, but the two endpoint sums alone do not prove the integral equals it." },
      { label: `The integral is less than ${left}.`, correct: false, feedback: "The left sum is the lower bound for this increasing function, not an upper bound." },
      { label: `The integral is greater than ${right}.`, correct: false, feedback: "The right sum is the upper bound for this increasing function, so the integral cannot exceed it." },
    ],
  );
}

const INTEGRAL_PROPERTY_CASES = [
  { p: 2, q: 5 }, { p: 3, q: 7 }, { p: 4, q: 9 }, { p: 5, q: 8 },
  { p: 6, q: 11 }, { p: 7, q: 13 }, { p: 8, q: 15 }, { p: 9, q: 17 },
  { p: 10, q: 19 }, { p: 11, q: 21 }, { p: 12, q: 23 }, { p: 14, q: 25 },
] as const;

function definiteIntegralNumericWidget(rand: Rand): GeneratedIntegrationVariant {
  const { p, q } = pick(rand, INTEGRAL_PROPERTY_CASES);
  const reversed = rand() < 0.5;
  const answer = reversed ? -(p + q) : p + q;
  const formula = reversed
    ? { op: "negate", arg: { op: "add", left: { op: "const", id: "p" }, right: { op: "const", id: "q" } } }
    : { op: "add", left: { op: "const", id: "p" }, right: { op: "const", id: "q" } };
  const target = reversed ? "∫₅¹ f(x) dx" : "∫₁⁵ f(x) dx";
  const widget = {
    type: "exactNumberLab" as const,
    prompt: `Given ∫₁³ f(x) dx = ${p} and ∫₃⁵ f(x) dx = ${q}, find ${target}.`,
    task: "approximationEvaluate" as const,
    values: [],
    approxConstants: [
      { id: "p", label: "integral from 1 to 3", value: p },
      { id: "q", label: "integral from 3 to 5", value: q },
    ],
    approxFormula: formula,
    approxRound: 0,
    answerMode: "numeric" as const,
    tolerance: 0,
    numericErrors: [
      { value: reversed ? p + q : q - p, feedback: reversed ? "This joins the intervals but does not reverse the sign for the backward limits." : "Adjacent intervals add; subtracting their values does not represent their union." },
      { value: p * q, feedback: "Definite integrals over adjacent intervals add rather than multiply." },
      { value: reversed ? -p - q + 1 : p + q + 1, feedback: "Reapply interval addition and, when needed, the sign change from reversing limits." },
    ],
    choices: [],
    authoredStages: [],
    requiredStageKeys: [],
    requiredExplorations: 1,
    explorationFeedback: "Inspect the two adjacent interval values before combining them.",
    fallbackFeedback: reversed
      ? `First join the intervals: ${p} + ${q} = ${p + q}; reversing the limits gives ${answer}.`
      : `Adjacent intervals add: ${p} + ${q} = ${answer}.`,
    successFeedback: reversed
      ? `The joined value is ${p + q}, and reversing the limits gives ${answer}.`
      : `The adjacent integral values combine to ${answer}.`,
  };
  return { widget, answer };
}

function definiteIntegralMatchWidget(rand: Rand): GeneratedIntegrationVariant {
  const { p, q } = pick(rand, INTEGRAL_PROPERTY_CASES);
  const left = [
    { id: "l-total", label: "∫₁⁵ f(x) dx" },
    { id: "l-first-reverse", label: "∫₃¹ f(x) dx" },
    { id: "l-second-reverse", label: "∫₅³ f(x) dx" },
  ];
  const right = [
    { id: "r-total", label: String(p + q) },
    { id: "r-first-reverse", label: String(-p) },
    { id: "r-second-reverse", label: String(-q) },
  ];
  const pairs = {
    "l-total": "r-total",
    "l-first-reverse": "r-first-reverse",
    "l-second-reverse": "r-second-reverse",
  };
  const shuffledLeft = shuffle(rand, left);
  let shuffledRight = shuffle(rand, right);
  const aligned = () => shuffledLeft.every((item, index) => pairs[item.id as keyof typeof pairs] === shuffledRight[index]?.id);
  if (aligned()) shuffledRight = [...shuffledRight.slice(1), shuffledRight[0]!];
  const widget = {
    type: "matchPairs" as const,
    prompt: `Given ∫₁³ f(x) dx = ${p} and ∫₃⁵ f(x) dx = ${q}, match each integral to its value.`,
    left: shuffledLeft,
    right: shuffledRight,
    pairs,
    pairErrors: [
      { left: "l-first-reverse", right: "r-first-reverse" === pairs["l-first-reverse"] ? "r-total" : "r-first-reverse", feedback: "Reversing the first interval changes its sign; it does not join both intervals." },
      { left: "l-total", right: "r-first-reverse", feedback: "The interval from 1 to 5 joins the two forward pieces, so their values add." },
    ],
    missFeedback: "Use interval addition for the joined interval and negate an integral whenever its limits are reversed.",
    successFeedback: "The joined interval adds the two values, while each reversed interval keeps its magnitude and changes sign.",
  };
  return { widget, answer: pairs };
}

const SIGNED_AREA_CASES = [
  { above: 5, below: 2 }, { above: 7, below: 3 }, { above: 9, below: 4 }, { above: 11, below: 5 },
  { above: 8, below: 6 }, { above: 13, below: 4 }, { above: 15, below: 7 }, { above: 17, below: 8 },
  { above: 12, below: 5 }, { above: 14, below: 9 }, { above: 19, below: 6 }, { above: 21, below: 10 },
] as const;

function signedAreaMcqWidget(rand: Rand): GeneratedIntegrationVariant {
  const { above, below } = pick(rand, SIGNED_AREA_CASES);
  const signed = above - below;
  const geometric = above + below;
  const correct = `signed integral = ${signed}; total geometric area = ${geometric}`;
  return integrationMcq(
    rand,
    `A graph encloses area ${above} above the x-axis and area ${below} below it. What are its signed integral and total geometric area?`,
    [
      { label: correct, correct: true, feedback: "The integral subtracts the below-axis region, while geometric area adds both magnitudes." },
      { label: `signed integral = ${geometric}; total geometric area = ${geometric}`, correct: false, feedback: "This treats the below-axis region as positive in the signed integral instead of subtracting it." },
      { label: `signed integral = ${signed}; total geometric area = ${signed}`, correct: false, feedback: "Geometric area adds region magnitudes and does not cancel the below-axis region." },
      { label: `signed integral = ${geometric}; total geometric area = ${signed}`, correct: false, feedback: "This reverses the two roles: cancellation belongs to the signed integral, not geometric area." },
    ],
  );
}

const ACCUMULATION_VALUE_CASES = [
  { m: 2, c: 1, n: 2 }, { m: 2, c: 3, n: 3 }, { m: 4, c: 1, n: 3 },
  { m: 4, c: 2, n: 4 }, { m: 6, c: 1, n: 2 }, { m: 6, c: 2, n: 3 },
] as const;

const ACCUMULATION_DIFFERENCE_CASES = [
  { m: 2, c: 1, a: 1, b: 3 }, { m: 2, c: 2, a: 2, b: 5 },
  { m: 4, c: 1, a: 1, b: 4 }, { m: 4, c: 3, a: 2, b: 4 },
  { m: 6, c: 1, a: 1, b: 3 }, { m: 6, c: 2, a: 2, b: 5 },
] as const;

function uniqueNumericErrors(answer: number, entries: readonly { value: number; feedback: string }[]) {
  return entries.filter((entry, index, all) => entry.value !== answer && all.findIndex((other) => other.value === entry.value) === index);
}

function accumulationNumericWidget(rand: Rand): GeneratedIntegrationVariant {
  if (rand() < 0.5) {
    const { m, c, n } = pick(rand, ACCUMULATION_VALUE_CASES);
    const answer = m * n * n / 2 + c * n;
    const finalHeight = m * n + c;
    const widget = {
      type: "numeric" as const,
      prompt: `Let A(x) = the integral from 0 to x of (${m}t + ${c}) dt. Find A(${n}).`,
      answer,
      tolerance: 0,
      unit: "",
      commonErrors: uniqueNumericErrors(answer, [
        { value: finalHeight, feedback: `That is f(${n}), the final height. A(${n}) is the accumulated area from 0 to ${n}.` },
        { value: m * n * n + c * n, feedback: "The sloping part forms a triangle, so its area includes a factor of one-half." },
        { value: c * n, feedback: `That counts only the constant rectangle. Include the area contributed by ${m}t.` },
      ]),
      fallbackFeedback: `Integrate term by term: A(${n}) = (${m}/2)(${n})^2 + ${c}(${n}) = ${answer}.`,
      successFeedback: `The accumulated value is ${answer}.`,
    };
    return { widget, answer };
  }
  const { m, c, a, b } = pick(rand, ACCUMULATION_DIFFERENCE_CASES);
  const antiderivative = (x: number) => m * x * x / 2 + c * x;
  const answer = antiderivative(b) - antiderivative(a);
  const widget = {
    type: "numeric" as const,
    prompt: `Let A(x) = the integral from 0 to x of (${m}t + ${c}) dt. Find A(${b}) - A(${a}).`,
    answer,
    tolerance: 0,
    unit: "",
    commonErrors: uniqueNumericErrors(answer, [
      { value: antiderivative(b), feedback: `That is A(${b}) alone. Subtract A(${a}) to isolate the accumulation from ${a} to ${b}.` },
      { value: antiderivative(b) + antiderivative(a), feedback: "The requested difference subtracts the earlier accumulation; it does not add both values." },
      { value: b - a, feedback: "That is only the interval width. Accumulation also depends on the values of f across the interval." },
    ]),
    fallbackFeedback: `Use A(x) = (${m}/2)x^2 + ${coefficientVariable(c, "x")}. Then A(${b}) - A(${a}) = ${answer}.`,
    successFeedback: `The accumulation added between ${a} and ${b} is ${answer}.`,
  };
  return { widget, answer };
}

const DUMMY_VARIABLE_CASES = [
  { accumulation: "A", endpoint: "x", dummy: "t" }, { accumulation: "A", endpoint: "u", dummy: "s" },
  { accumulation: "B", endpoint: "y", dummy: "r" }, { accumulation: "F", endpoint: "z", dummy: "v" },
  { accumulation: "G", endpoint: "p", dummy: "q" }, { accumulation: "H", endpoint: "w", dummy: "k" },
  { accumulation: "P", endpoint: "b", dummy: "a" }, { accumulation: "Q", endpoint: "c", dummy: "h" },
  { accumulation: "R", endpoint: "d", dummy: "j" }, { accumulation: "S", endpoint: "m", dummy: "n" },
  { accumulation: "T", endpoint: "g", dummy: "r" }, { accumulation: "V", endpoint: "u", dummy: "p" },
] as const;

function accumulationMcqWidget(rand: Rand): GeneratedIntegrationVariant {
  const { accumulation, endpoint, dummy } = pick(rand, DUMMY_VARIABLE_CASES);
  return integrationMcq(
    rand,
    `In ${accumulation}(${endpoint}) = the integral from 0 to ${endpoint} of f(${dummy}) d${dummy}, what role does ${dummy} play?`,
    [
      { label: `${dummy} is the dummy variable of integration.`, correct: true, feedback: `The letter ${dummy} moves across the interval and can be renamed without changing ${accumulation}(${endpoint}).` },
      { label: `${dummy} is the upper endpoint of the integral.`, correct: false, feedback: `The upper endpoint is ${endpoint}; ${dummy} moves between the limits.` },
      { label: `${dummy} is a fixed constant, not a variable.`, correct: false, feedback: `${dummy} varies as the integral sweeps across the interval.` },
      { label: `${dummy} is the strip width used in each slice.`, correct: false, feedback: `d${dummy} represents an infinitesimal width; ${dummy} locates the strip.` },
    ],
  );
}

const ACCUMULATION_EXTREMUM_CASES = [
  { scale: 1, root: 2 }, { scale: 2, root: 3 }, { scale: 3, root: 4 },
  { scale: 1, root: 5 }, { scale: 2, root: 6 }, { scale: 3, root: 7 },
  { scale: -1, root: 2 }, { scale: -2, root: 3 }, { scale: -3, root: 4 },
  { scale: -1, root: 5 }, { scale: -2, root: 6 }, { scale: -3, root: 7 },
] as const;

function readAccumulationMcqWidget(rand: Rand): GeneratedIntegrationVariant {
  const { scale, root } = pick(rand, ACCUMULATION_EXTREMUM_CASES);
  const upper = root * 2;
  const kind = scale > 0 ? "minimum" : "maximum";
  const direction = scale > 0 ? "negative to positive" : "positive to negative";
  const expression = scale === 1 ? `(x - ${root})` : scale === -1 ? `-(x - ${root})` : `${scale}(x - ${root})`;
  const correct = `x = ${root}`;
  return integrationMcq(
    rand,
    `For f(x) = ${expression} on [0, ${upper}], let A(x) be the integral from 0 to x of f(t) dt. At which x does A have its ${kind}?`,
    [
      { label: correct, correct: true, feedback: `At x = ${root}, f changes from ${direction}, so A changes direction there.` },
      { label: "x = 0", correct: false, feedback: `The endpoint starts the accumulation, but A continues toward its ${kind} until f changes sign.` },
      { label: `x = ${upper}`, correct: false, feedback: `By the far endpoint, A has already turned at the zero of f.` },
      { label: `x = ${root + 1}`, correct: false, feedback: `A turns where A'(x) = f(x) changes sign, which occurs at x = ${root}.` },
    ],
  );
}

const ACCUMULATION_MATCH_CASES = [
  { rise: 1, fall: 2 }, { rise: 2, fall: 1 }, { rise: 2, fall: 3 },
  { rise: 3, fall: 2 }, { rise: 3, fall: 4 }, { rise: 4, fall: 3 },
  { rise: 4, fall: 5 }, { rise: 5, fall: 4 }, { rise: 5, fall: 6 },
  { rise: 6, fall: 5 }, { rise: 6, fall: 7 }, { rise: 7, fall: 6 },
] as const;

function readAccumulationMatchWidget(rand: Rand): GeneratedIntegrationVariant {
  const { rise, fall } = pick(rand, ACCUMULATION_MATCH_CASES);
  const left = [
    { id: "l-positive", label: `f(x) = ${rise}` },
    { id: "l-zero", label: "f(x) = 0" },
    { id: "l-negative", label: `f(x) = -${fall}` },
  ];
  const right = [
    { id: "r-positive", label: `A rises at ${rise} unit${rise === 1 ? "" : "s"} per x-unit` },
    { id: "r-zero", label: "A is momentarily flat" },
    { id: "r-negative", label: `A falls at ${fall} unit${fall === 1 ? "" : "s"} per x-unit` },
  ];
  const pairs = { "l-positive": "r-positive", "l-zero": "r-zero", "l-negative": "r-negative" };
  const shuffledLeft = shuffle(rand, left);
  let shuffledRight = shuffle(rand, right);
  const aligned = () => shuffledLeft.every((item, index) => pairs[item.id as keyof typeof pairs] === shuffledRight[index]?.id);
  if (aligned()) shuffledRight = [...shuffledRight.slice(1), shuffledRight[0]!];
  const widget = {
    type: "matchPairs" as const,
    prompt: `For A(x) = the integral from 0 to x of f(t) dt, f(x) takes the values ${rise}, 0, and -${fall} at three marked points. Match each value of f(x) to A's instantaneous behavior.`,
    left: shuffledLeft,
    right: shuffledRight,
    pairs,
    pairErrors: [
      { left: "l-zero", right: "r-negative", feedback: "When f(x) = 0, the instantaneous slope A'(x) is 0, so A is flat at that point." },
      { left: "l-negative", right: "r-positive", feedback: "A negative value of f gives A a negative slope, so A falls." },
    ],
    missFeedback: "Use A'(x) = f(x): the value of f is the instantaneous slope of A.",
    successFeedback: "Each match follows from A'(x) = f(x).",
  };
  return { widget, answer: pairs };
}

const SIGNED_AREA_NUMERIC_CASES = [
  { above: 3, below: 1 }, { above: 4, below: 7 }, { above: 5, below: 1 },
  { above: 6, below: 11 }, { above: 8, below: 2 }, { above: 9, below: 16 },
  { above: 10, below: 2 }, { above: 11, below: 20 }, { above: 13, below: 3 },
  { above: 14, below: 25 }, { above: 16, below: 4 }, { above: 18, below: 31 },
] as const;

function signedAreaNumericWidget(rand: Rand): GeneratedIntegrationVariant {
  const { above, below } = pick(rand, SIGNED_AREA_NUMERIC_CASES);
  const answer = above - below;
  const widget = {
    type: "numeric" as const,
    prompt: `On [a, b], the graph of f encloses area ${above} above the x-axis and area ${below} below it. Find the signed integral from a to b of f(x) dx.`,
    answer,
    tolerance: 0,
    unit: "",
    commonErrors: uniqueNumericErrors(answer, [
      { value: above + below, feedback: "That is total geometric area. A signed integral subtracts the below-axis area." },
      { value: below - above, feedback: "This reverses the signs. Above-axis area is positive and below-axis area is negative." },
      { value: above, feedback: "Include the below-axis region as a negative contribution." },
    ]),
    fallbackFeedback: `Signed area is above minus below: ${above} - ${below} = ${answer}.`,
    successFeedback: `The signed integral is ${answer}.`,
  };
  return { widget, answer };
}

const TURNING_POINT_CASES = [
  { roots: [2], start: "negative" }, { roots: [3], start: "positive" },
  { roots: [1, 4], start: "positive" }, { roots: [2, 5], start: "negative" },
  { roots: [1, 3, 6], start: "negative" }, { roots: [2, 4, 7], start: "positive" },
  { roots: [1, 3, 5, 8], start: "positive" }, { roots: [2, 4, 6, 9], start: "negative" },
  { roots: [1, 2, 4, 7, 10], start: "negative" }, { roots: [2, 3, 5, 8, 11], start: "positive" },
  { roots: [1, 2, 4, 6, 9, 12], start: "positive" }, { roots: [2, 3, 5, 7, 10, 13], start: "negative" },
] as const;

function readAccumulationNumericWidget(rand: Rand): GeneratedIntegrationVariant {
  const { roots, start } = pick(rand, TURNING_POINT_CASES);
  const upper = roots[roots.length - 1]! + 2;
  const rootList = roots.join(", ");
  const answer = roots.length;
  const widget = {
    type: "numeric" as const,
    prompt: `On [0, ${upper}], f starts ${start}, is zero only at x = ${rootList}, and changes sign at every listed zero. How many turning points does A(x) = the integral from 0 to x of f(t) dt have?`,
    answer,
    tolerance: 0,
    unit: "turning points",
    commonErrors: uniqueNumericErrors(answer, [
      { value: answer - 1, feedback: "Each listed zero changes the sign of A'(x) = f(x), so every one creates a turning point." },
      { value: answer + 1, feedback: "Endpoints are not counted here; count only the interior sign changes of f." },
      { value: 0, feedback: "Because f changes sign, A changes from increasing to decreasing or vice versa at each listed zero." },
    ]),
    fallbackFeedback: `A'(x) = f(x). The ${answer} sign-changing zeros of f therefore give A ${answer} turning points.`,
    successFeedback: `There are ${answer} turning points, one at each sign-changing zero of f.`,
  };
  return { widget, answer };
}

const NET_CHANGE_UNIT_CASES = [
  { rate: "velocity", rateUnit: "kilometres per hour", timeUnit: "hours", result: "kilometres" },
  { rate: "signed water flow", rateUnit: "litres per minute", timeUnit: "minutes", result: "litres" },
  { rate: "electric current", rateUnit: "coulombs per second", timeUnit: "seconds", result: "coulombs" },
  { rate: "population change", rateUnit: "people per year", timeUnit: "years", result: "people" },
  { rate: "power", rateUnit: "joules per second", timeUnit: "seconds", result: "joules" },
  { rate: "signed mass flow", rateUnit: "kilograms per minute", timeUnit: "minutes", result: "kilograms" },
] as const;

const NET_CHANGE_TRAVEL_CASES = [
  { net: 2, total: 8, unit: "km" }, { net: -3, total: 11, unit: "km" },
  { net: 4, total: 14, unit: "m" }, { net: -5, total: 17, unit: "m" },
  { net: 6, total: 20, unit: "miles" }, { net: -7, total: 23, unit: "miles" },
] as const;

function netChangeMcqWidget(rand: Rand): GeneratedIntegrationVariant {
  if (rand() < 0.5) {
    const entry = pick(rand, NET_CHANGE_UNIT_CASES);
    return integrationMcq(
      rand,
      `A ${entry.rate} rate r(t) is measured in ${entry.rateUnit}, and t is measured in ${entry.timeUnit}. What units does the integral of r(t) dt have?`,
      [
        { label: entry.result, correct: true, feedback: `Multiplying ${entry.rateUnit} by ${entry.timeUnit} cancels the time unit.` },
        { label: entry.rateUnit, correct: false, feedback: "Those are the units of the rate before integration; integration multiplies by time." },
        { label: entry.timeUnit, correct: false, feedback: "Those are only the units of the interval width, not the accumulated quantity." },
        { label: `${entry.result} per ${entry.timeUnit} squared`, correct: false, feedback: "Those derivative units move in the opposite direction from integration." },
      ],
    );
  }
  const { net, total, unit } = pick(rand, NET_CHANGE_TRAVEL_CASES);
  const correct = `Net change = ${net} ${unit}; total travel = ${total} ${unit}.`;
  return integrationMcq(
    rand,
    `For a motion, the integral of v(t) is ${net} ${unit}, while the integral of |v(t)| is ${total} ${unit}. Which interpretation is correct?`,
    [
      { label: correct, correct: true, feedback: "The signed velocity integral gives displacement; the absolute-value integral gives total distance traveled." },
      { label: `Net change = ${total} ${unit}; total travel = ${net} ${unit}.`, correct: false, feedback: "This swaps displacement with total distance." },
      { label: `Net change = ${net} ${unit}; total travel = ${Math.abs(net)} ${unit}.`, correct: false, feedback: "The magnitude of displacement need not equal total travel when direction changes." },
      { label: `Net change = ${total} ${unit}; total travel = ${total} ${unit}.`, correct: false, feedback: "The signed integral already states the net change; total travel uses the absolute-value integral." },
    ],
  );
}

const NET_CHANGE_NUMERIC_CASES = [
  { m: 2, c: 1, n: 2 }, { m: 2, c: -3, n: 4 }, { m: 4, c: 1, n: 3 },
  { m: 4, c: -5, n: 4 }, { m: 6, c: 2, n: 3 }, { m: 6, c: -7, n: 4 },
  { m: -2, c: 5, n: 2 }, { m: -2, c: 3, n: 4 }, { m: -4, c: 9, n: 3 },
  { m: -4, c: 5, n: 4 }, { m: -6, c: 11, n: 3 }, { m: -6, c: 7, n: 4 },
] as const;

function netChangeNumericWidget(rand: Rand): GeneratedIntegrationVariant {
  const { m, c, n } = pick(rand, NET_CHANGE_NUMERIC_CASES);
  const sign = c >= 0 ? "+" : "-";
  const answer = m * n * n / 2 + c * n;
  const finalRate = m * n + c;
  const constantLitres = Math.abs(c) === 1 ? "litre" : "litres";
  const answerLitres = Math.abs(answer) === 1 ? "litre" : "litres";
  const widget = {
    type: "numeric" as const,
    prompt: `A tank's signed flow rate is r(t) = ${m}t ${sign} ${Math.abs(c)} ${constantLitres} per minute. Find the net volume change during the first ${n} minutes, in litres.`,
    answer,
    tolerance: 0,
    unit: "litres",
    commonErrors: uniqueNumericErrors(answer, [
      { value: finalRate, feedback: `That is the rate at t = ${n}, measured in litres per minute, not the accumulated volume change.` },
      { value: finalRate * n, feedback: "This treats the final rate as if it held throughout the interval. Integrate the changing rate instead." },
      { value: Math.abs(answer), feedback: "Net change is signed. Do not replace a negative contribution by its absolute value." },
    ]),
    fallbackFeedback: `Integrate the rate: (${m}/2)(${n})^2 ${sign} ${Math.abs(c)}(${n}) = ${answer} ${answerLitres}.`,
    successFeedback: `The net volume change is ${answer} ${answerLitres}.`,
  };
  return { widget, answer };
}

const FTC1_MCQ_CASES = [
  { kind: "basic", lower: 0, coeff: 2, power: 2 }, { kind: "basic", lower: 1, coeff: 3, power: 3 },
  { kind: "basic", lower: 2, coeff: 4, power: 4 }, { kind: "basic", lower: 3, coeff: 5, power: 2 },
  { kind: "compare", lower: 1, other: 4, coeff: 2, power: 3 }, { kind: "compare", lower: 2, other: 6, coeff: 3, power: 2 },
  { kind: "compare", lower: 3, other: 7, coeff: 4, power: 3 }, { kind: "compare", lower: 4, other: 9, coeff: 5, power: 2 },
  { kind: "chain", lower: 0, coeff: 2, power: 2, inner: 2 }, { kind: "chain", lower: 1, coeff: 3, power: 2, inner: 3 },
  { kind: "chain", lower: 2, coeff: 2, power: 3, inner: 2 }, { kind: "chain", lower: 3, coeff: 4, power: 2, inner: 2 },
] as const;

function ftc1McqWidget(rand: Rand): GeneratedIntegrationVariant {
  const entry = pick(rand, FTC1_MCQ_CASES);
  const integrand = `${entry.coeff}t^${entry.power}`;
  const baseTruth = `${entry.coeff}x^${entry.power}`;
  if (entry.kind === "basic") {
    return integrationMcq(rand, `Find d/dx of the integral from ${entry.lower} to x of ${integrand} dt.`, [
      { label: baseTruth, correct: true, feedback: "FTC Part 1 returns the integrand evaluated at the moving endpoint x." },
      { label: `${entry.coeff}x^${entry.power + 1}/${entry.power + 1}`, correct: false, feedback: "That is an antiderivative, but the question differentiates the accumulation." },
      { label: `${entry.coeff * entry.power}x^${entry.power - 1}`, correct: false, feedback: "That differentiates the integrand instead of differentiating the accumulation." },
      { label: "0", correct: false, feedback: "A fixed lower endpoint contributes no derivative, but the moving upper endpoint does." },
    ]);
  }
  if (entry.kind === "compare") {
    const correct = `Both derivatives are ${baseTruth}.`;
    return integrationMcq(
      rand,
      `Compare d/dx of the integral from ${entry.lower} to x of ${integrand} dt with d/dx of the integral from ${entry.other} to x of ${integrand} dt.`,
      [
        { label: correct, correct: true, feedback: "Changing a fixed lower limit shifts the accumulation by a constant, so its derivative is unchanged." },
        { label: `They differ by ${Math.abs(entry.other - entry.lower)}.`, correct: false, feedback: "The accumulation functions differ by a constant, but their derivatives do not." },
        { label: `Only the first derivative is ${baseTruth}.`, correct: false, feedback: "FTC Part 1 applies to either fixed lower limit." },
        { label: "They cannot be compared.", correct: false, feedback: "Both derivatives are determined by the same integrand at the same upper endpoint." },
      ],
    );
  }
  const coefficient = entry.coeff * entry.inner;
  const exponent = entry.inner * entry.power + entry.inner - 1;
  const correct = `${coefficient}x^${exponent}`;
  return integrationMcq(rand, `Find d/dx of the integral from ${entry.lower} to x^${entry.inner} of ${integrand} dt.`, [
    { label: correct, correct: true, feedback: "Evaluate the integrand at the moving endpoint, then multiply by the endpoint derivative." },
    { label: `${entry.coeff}x^${entry.inner * entry.power}`, correct: false, feedback: "This substitutes the endpoint but omits its derivative from the chain rule." },
    { label: `${entry.inner}x^${entry.inner - 1}`, correct: false, feedback: "That is only the derivative of the moving endpoint; also evaluate the integrand there." },
    { label: `${entry.coeff}x^${entry.inner * (entry.power + 1)}/${entry.power + 1}`, correct: false, feedback: "That describes the accumulation rather than its derivative." },
  ]);
}

const FTC1_EXTREMUM_CASES = [
  { root: 2, direction: "minimum" }, { root: 3, direction: "minimum" }, { root: 4, direction: "minimum" },
  { root: 5, direction: "minimum" }, { root: 6, direction: "minimum" }, { root: 7, direction: "minimum" },
  { root: 2, direction: "maximum" }, { root: 3, direction: "maximum" }, { root: 4, direction: "maximum" },
  { root: 5, direction: "maximum" }, { root: 6, direction: "maximum" }, { root: 7, direction: "maximum" },
] as const;

function ftc1NumericWidget(rand: Rand): GeneratedIntegrationVariant {
  const { root, direction } = pick(rand, FTC1_EXTREMUM_CASES);
  const square = root * root;
  const expression = direction === "minimum" ? `t^2 - ${square}` : `${square} - t^2`;
  const upper = root + 2;
  const widget = {
    type: "numeric" as const,
    prompt: `Let A(x) be the integral from 0 to x of (${expression}) dt on [0, ${upper}]. At what x does A reach its ${direction}?`,
    answer: root,
    tolerance: 0,
    unit: "",
    commonErrors: uniqueNumericErrors(root, [
      { value: 0, feedback: `A continues toward its ${direction} after the left endpoint because A'(x) has not yet changed sign.` },
      { value: upper, feedback: `By x = ${upper}, A has already turned where A'(x) changed sign.` },
      { value: square, feedback: `Solve x^2 = ${square}; the nonnegative critical point in the interval is x = ${root}.` },
    ]),
    fallbackFeedback: `FTC Part 1 gives A'(x) = ${expression}. Its sign changes at x = ${root}, producing the ${direction}.`,
    successFeedback: `A reaches its ${direction} at x = ${root}.`,
  };
  return { widget, answer: root };
}

const FTC2_POWER_CASES = [
  { power: 1, lower: 0, upper: 3 }, { power: 1, lower: 1, upper: 4 },
  { power: 2, lower: 0, upper: 2 }, { power: 2, lower: 1, upper: 3 },
  { power: 3, lower: 0, upper: 2 }, { power: 3, lower: 1, upper: 3 },
] as const;

const FTC2_RATE_CASES = [
  { m: 2, c: 1, n: 3 }, { m: 2, c: 3, n: 4 }, { m: 4, c: 1, n: 2 },
  { m: 4, c: 2, n: 3 }, { m: 6, c: 1, n: 2 }, { m: 6, c: 2, n: 4 },
] as const;

const round3 = (value: number) => Number(value.toFixed(3));

function ftc2NumericWidget(rand: Rand): GeneratedIntegrationVariant {
  if (rand() < 0.5) {
    const { power, lower, upper } = pick(rand, FTC2_POWER_CASES);
    const divisor = power + 1;
    const answer = round3((upper ** divisor - lower ** divisor) / divisor);
    const upperOnly = round3(upper ** divisor / divisor);
    const widget = {
      type: "numeric" as const,
      prompt: `Evaluate the integral from ${lower} to ${upper} of x^${power} dx. Give a decimal to three places.`,
      answer,
      tolerance: 0.005,
      unit: "",
      commonErrors: uniqueNumericErrors(answer, [
        { value: upper ** power, feedback: "That is the integrand's height at the upper endpoint, not the accumulated area." },
        { value: upperOnly, feedback: "Evaluate the antiderivative at both endpoints and subtract the lower value." },
        { value: round3(upper ** divisor - lower ** divisor), feedback: `The antiderivative of x^${power} divides by ${divisor}.` },
      ]),
      fallbackFeedback: `Use F(x) = x^${divisor}/${divisor}. Then F(${upper}) - F(${lower}) = ${answer}.`,
      successFeedback: `The definite integral is ${answer}.`,
    };
    return { widget, answer };
  }
  const { m, c, n } = pick(rand, FTC2_RATE_CASES);
  const answer = m * n * n / 2 + c * n;
  const finalRate = m * n + c;
  const constantLitres = c === 1 ? "litre" : "litres";
  const answerLitres = answer === 1 ? "litre" : "litres";
  const widget = {
    type: "numeric" as const,
    prompt: `Water enters at r(t) = ${m}t + ${c} ${constantLitres} per minute. Use an antiderivative to find how many litres arrive in the first ${n} minutes.`,
    answer,
    tolerance: 0,
    unit: "litres",
    commonErrors: uniqueNumericErrors(answer, [
      { value: finalRate, feedback: `That is r(${n}), the final rate, rather than the accumulated volume.` },
      { value: finalRate * n, feedback: "This treats the final rate as constant across the whole interval." },
      { value: m * n * n / 2, feedback: `Include the antiderivative of the constant term +${c}.` },
    ]),
    fallbackFeedback: `An antiderivative is (${m}/2)t^2 + ${c}t. Its change from 0 to ${n} is ${answer} ${answerLitres}.`,
    successFeedback: `${answer} ${answerLitres} arrive.`,
  };
  return { widget, answer };
}

const FTC2_MCQ_CASES = [
  { kind: "constant", k: 2, lower: 0, upper: 3 }, { kind: "constant", k: 5, lower: 1, upper: 4 },
  { kind: "constant", k: 7, lower: 2, upper: 6 }, { kind: "constant", k: 11, lower: 3, upper: 8 },
  { kind: "reverse", value: 6, lower: 1, upper: 4 }, { kind: "reverse", value: 9, lower: 2, upper: 5 },
  { kind: "reverse", value: 13, lower: 0, upper: 6 }, { kind: "reverse", value: 17, lower: 3, upper: 9 },
  { kind: "join", first: 2, second: 5, middle: 2 }, { kind: "join", first: 3, second: 7, middle: 3 },
  { kind: "join", first: 4, second: 9, middle: 4 }, { kind: "join", first: 6, second: 11, middle: 5 },
] as const;

function ftc2McqWidget(rand: Rand): GeneratedIntegrationVariant {
  const entry = pick(rand, FTC2_MCQ_CASES);
  if (entry.kind === "constant") {
    const correct = `The +${entry.k} cancels when endpoint values are subtracted.`;
    return integrationMcq(
      rand,
      `F and G are antiderivatives of f with G(x) = F(x) + ${entry.k}. Why do both give the same integral from ${entry.lower} to ${entry.upper}?`,
      [
        { label: correct, correct: true, feedback: `G(${entry.upper}) - G(${entry.lower}) contains +${entry.k} at both endpoints, so the constants cancel.` },
        { label: `The +${entry.k} is too small to matter.`, correct: false, feedback: "Constants can have any size; exact subtraction, not approximation, removes them." },
        { label: "F and G are actually the same function.", correct: false, feedback: "They are different antiderivatives with the same derivative." },
        { label: "Only F may be used for a definite integral.", correct: false, feedback: "Any antiderivative works because endpoint subtraction cancels its constant shift." },
      ],
    );
  }
  if (entry.kind === "reverse") {
    const correct = `The reversed integral is -${entry.value}.`;
    return integrationMcq(
      rand,
      `The integral from ${entry.lower} to ${entry.upper} of f(x) dx is ${entry.value}. What happens when the limits are reversed?`,
      [
        { label: correct, correct: true, feedback: "Reversing the endpoint subtraction changes the sign of the definite integral." },
        { label: `The reversed integral is ${entry.value}.`, correct: false, feedback: "The magnitude stays the same, but reversing the limits changes the sign." },
        { label: `The reversed integral is ${-2 * entry.value}.`, correct: false, feedback: "Reversing limits negates the value; it does not double it." },
        { label: "The reversed integral is 0.", correct: false, feedback: "Only equal limits force a zero integral." },
      ],
    );
  }
  const joined = entry.first + entry.second;
  const correct = `The joined integral is ${joined}.`;
  return integrationMcq(
    rand,
    `The integral from 0 to ${entry.middle} is ${entry.first}, and the integral from ${entry.middle} to ${entry.middle + 2} is ${entry.second}. What is the integral from 0 to ${entry.middle + 2}?`,
    [
      { label: correct, correct: true, feedback: "Definite integrals over adjacent intervals add." },
      { label: `The joined integral is ${entry.second - entry.first}.`, correct: false, feedback: "The intervals point in the same direction, so their values add rather than subtract." },
      { label: `The joined integral is ${entry.first * entry.second}.`, correct: false, feedback: "Adjacent interval values add; they do not multiply." },
      { label: "The joined integral cannot be determined.", correct: false, feedback: "The two adjacent pieces cover the full requested interval without a gap." },
    ],
  );
}

const FTC_PROOF_CASES = [
  { accumulation: "A", antiderivative: "F", integrand: "f", lower: "a", upper: "b" },
  { accumulation: "B", antiderivative: "G", integrand: "g", lower: "c", upper: "d" },
  { accumulation: "P", antiderivative: "Q", integrand: "p", lower: "m", upper: "n" },
  { accumulation: "R", antiderivative: "S", integrand: "r", lower: "u", upper: "v" },
  { accumulation: "H", antiderivative: "K", integrand: "h", lower: "1", upper: "4" },
  { accumulation: "J", antiderivative: "L", integrand: "j", lower: "2", upper: "6" },
  { accumulation: "M", antiderivative: "N", integrand: "m", lower: "0", upper: "5" },
  { accumulation: "U", antiderivative: "V", integrand: "u", lower: "3", upper: "8" },
  { accumulation: "C", antiderivative: "D", integrand: "c", lower: "q", upper: "z" },
  { accumulation: "E", antiderivative: "I", integrand: "e", lower: "s", upper: "w" },
  { accumulation: "O", antiderivative: "T", integrand: "o", lower: "2", upper: "9" },
  { accumulation: "W", antiderivative: "Y", integrand: "w", lower: "1", upper: "7" },
] as const;

function ftcProofLabels(entry: typeof FTC_PROOF_CASES[number]) {
  return [
    `Part 1 gives ${entry.accumulation}'(x) = ${entry.integrand}(x), so ${entry.accumulation} is an antiderivative.`,
    `Any other antiderivative ${entry.antiderivative} has ${entry.antiderivative}(x) = ${entry.accumulation}(x) + C.`,
    `Subtracting endpoints cancels C: ${entry.antiderivative}(${entry.upper}) - ${entry.antiderivative}(${entry.lower}) = ${entry.accumulation}(${entry.upper}) - ${entry.accumulation}(${entry.lower}).`,
    `Because ${entry.accumulation}(${entry.lower}) = 0, the difference equals the integral from ${entry.lower} to ${entry.upper}.`,
  ];
}

function ftcUnifiedDragOrderWidget(rand: Rand): GeneratedIntegrationVariant {
  const entry = pick(rand, FTC_PROOF_CASES);
  const labels = ftcProofLabels(entry);
  const items = labels.map((label, index) => ({ id: ["a", "b", "c", "d"][index]!, label }));
  const correctOrder = ["a", "b", "c", "d"];
  let shuffledItems = shuffle(rand, items);
  if (shuffledItems.every((item, index) => item.id === correctOrder[index])) shuffledItems = [...shuffledItems.slice(1), shuffledItems[0]!];
  const widget = {
    type: "dragOrder" as const,
    prompt: `For ${entry.accumulation}(x) = the integral from ${entry.lower} to x of ${entry.integrand}(t) dt, order the steps that derive the evaluation formula using ${entry.antiderivative} at ${entry.upper}.`,
    items: shuffledItems,
    correctOrder,
    misorderFeedback: [
      { first: "c", second: "b", feedback: "First establish that the antiderivatives differ by a constant; only then can endpoint subtraction cancel it." },
      { first: "d", second: "a", feedback: "Begin with FTC Part 1, which establishes that the accumulation function is an antiderivative." },
    ],
    missFeedback: "Start with FTC Part 1, relate the two antiderivatives, cancel the constant, then use the zero accumulation at the lower endpoint.",
    successFeedback: "FTC Part 2 follows from Part 1 and the cancellation of the antiderivative constant.",
  };
  return { widget, answer: correctOrder };
}

const FTC_BUCKET_CASES = [
  { p: 1, q: 2, c: 2, b: 3 }, { p: 2, q: 3, c: 3, b: 4 }, { p: 3, q: 1, c: 4, b: 5 },
  { p: 4, q: 2, c: 5, b: 6 }, { p: 2, q: 4, c: 6, b: 7 }, { p: 3, q: 2, c: 7, b: 8 },
  { p: 1, q: 3, c: 4, b: 7 }, { p: 2, q: 1, c: 5, b: 8 }, { p: 3, q: 4, c: 2, b: 6 },
  { p: 4, q: 3, c: 3, b: 7 }, { p: 1, q: 4, c: 6, b: 9 }, { p: 4, q: 1, c: 7, b: 10 },
] as const;

function ftcBucketLabels(entry: typeof FTC_BUCKET_CASES[number]) {
  return [
    `Differentiate the accumulation from ${entry.c} to x of t^${entry.p} dt`,
    `Evaluate the integral from 0 to ${entry.b} of x^${entry.q} dx`,
    `Find where the accumulation of (t - ${entry.c}) from 0 to x is smallest`,
    `Find the total from a rate over [0, ${entry.b}]`,
  ];
}

function ftcUnifiedDragBucketWidget(rand: Rand): GeneratedIntegrationVariant {
  const entry = pick(rand, FTC_BUCKET_CASES);
  const labels = ftcBucketLabels(entry);
  const buckets = [
    { id: "p1", label: "Differentiate an accumulation (Part 1)" },
    { id: "p2", label: "Evaluate a definite integral (Part 2)" },
  ];
  const items = [
    { id: "s1", label: labels[0]!, bucketId: "p1", feedback: "Differentiating an accumulation uses FTC Part 1 to return the integrand at the endpoint." },
    { id: "s2", label: labels[1]!, bucketId: "p2", feedback: "Computing a definite value uses an antiderivative and endpoint subtraction from FTC Part 2." },
    { id: "s3", label: labels[2]!, bucketId: "p1", feedback: "An accumulation extremum is found from its derivative, so this uses FTC Part 1." },
    { id: "s4", label: labels[3]!, bucketId: "p2", feedback: "Accumulating a rate over a fixed interval is a definite-integral evaluation using FTC Part 2." },
  ];
  const shuffledItems = shuffle(rand, items);
  const answer = Object.fromEntries(items.map((item) => [item.id, item.bucketId]));
  const widget = {
    type: "dragBucket" as const,
    prompt: `Use p = ${entry.p}, q = ${entry.q}, c = ${entry.c}, and b = ${entry.b}. Sort each task by the part of the Fundamental Theorem it uses.`,
    buckets,
    items: shuffledItems,
    missFeedback: "Ask whether the task differentiates an accumulation or evaluates a definite integral.",
    successFeedback: "Part 1 differentiates accumulation functions; Part 2 evaluates definite integrals from antiderivatives.",
  };
  return { widget, answer };
}

const FTC_UNIFIED_POWER_CASES = [
  { power: 2, lower: 0, upper: 3 }, { power: 3, lower: 0, upper: 2 },
  { power: 4, lower: 0, upper: 2 }, { power: 2, lower: 1, upper: 4 },
  { power: 3, lower: 1, upper: 3 }, { power: 4, lower: 1, upper: 3 },
] as const;

const FTC_UNIFIED_MINIMUM_ROOTS = [2, 3, 4, 5, 6, 7] as const;

function ftcUnifiedNumericWidget(rand: Rand): GeneratedIntegrationVariant {
  if (rand() < 0.5) {
    const { power, lower, upper } = pick(rand, FTC_UNIFIED_POWER_CASES);
    const divisor = power + 1;
    const answer = round3((upper ** divisor - lower ** divisor) / divisor);
    const widget = {
      type: "numeric" as const,
      prompt: `Use both parts of the FTC to evaluate the integral from ${lower} to ${upper} of x^${power} dx. Give a decimal to three places.`,
      answer,
      tolerance: 0.005,
      unit: "",
      commonErrors: uniqueNumericErrors(answer, [
        { value: upper ** power, feedback: "That is the integrand at the endpoint, which FTC Part 1 would return after differentiating an accumulation." },
        { value: round3(upper ** divisor / divisor), feedback: "FTC Part 2 requires subtracting the antiderivative value at the lower endpoint." },
        { value: round3(upper ** divisor - lower ** divisor), feedback: `The antiderivative of x^${power} includes division by ${divisor}.` },
      ]),
      fallbackFeedback: `An antiderivative is x^${divisor}/${divisor}; endpoint subtraction gives ${answer}.`,
      successFeedback: `The definite integral is ${answer}.`,
    };
    return { widget, answer };
  }
  const root = pick(rand, FTC_UNIFIED_MINIMUM_ROOTS);
  const square = root * root;
  const answer = round3(-2 * root ** 3 / 3);
  const widget = {
    type: "numeric" as const,
    prompt: `Let G(x) be the integral from 0 to x of (t^2 - ${square}) dt on [0, ${root + 2}]. Find the minimum value of G, as a decimal to three places.`,
    answer,
    tolerance: 0.005,
    unit: "",
    commonErrors: uniqueNumericErrors(answer, [
      { value: root, feedback: `That is where the minimum occurs. Use FTC Part 2 to evaluate G(${root}).` },
      { value: Math.abs(answer), feedback: "The accumulated region before the turning point lies below the axis, so the minimum value is negative." },
      { value: 0, feedback: "G starts at zero but decreases while its derivative is negative." },
    ]),
    fallbackFeedback: `FTC Part 1 locates the minimum at x = ${root}; FTC Part 2 gives G(${root}) = ${answer}.`,
    successFeedback: `The minimum value of G is ${answer}.`,
  };
  return { widget, answer };
}

/* S246 / Phase 5. Chapter in-04 previously fell back to two or three authored
 * examples per form. These builders keep the original question jobs and
 * response surfaces while varying every quantity needed to recompute truth
 * from the learner-visible prompt. */
const ANTIDERIVATIVE_MCQ_CASES = [
  { power: 1, scale: 1 }, { power: 1, scale: 2 }, { power: 1, scale: 3 },
  { power: 2, scale: 1 }, { power: 2, scale: 2 }, { power: 2, scale: 3 },
  { power: 3, scale: 1 }, { power: 3, scale: 2 }, { power: 3, scale: 3 },
  { power: 4, scale: 1 }, { power: 4, scale: 2 }, { power: 4, scale: 3 },
] as const;

const powerLabel = (coefficient: number, power: number) => {
  if (power === 0) return String(coefficient);
  const coefficientText = coefficient === 1 ? "" : String(coefficient);
  return power === 1 ? `${coefficientText}x` : `${coefficientText}x^${power}`;
};

function antiderivativeMcqWidget(rand: Rand): GeneratedIntegrationVariant {
  const { power, scale } = pick(rand, ANTIDERIVATIVE_MCQ_CASES);
  const coefficient = scale * (power + 1);
  const correct = `${powerLabel(scale, power + 1)} + C`;
  return integrationMcq(rand, `What is the indefinite integral of ${powerLabel(coefficient, power)} dx?`, [
    { label: correct, correct: true, feedback: `Raise the power to ${power + 1}, divide ${coefficient} by ${power + 1}, and include the constant of integration.` },
    { label: `${powerLabel(coefficient * power, power - 1)} + C`, correct: false, feedback: "That differentiates the displayed power instead of antidifferentiating it." },
    { label: `${powerLabel(coefficient, power + 1)} + C`, correct: false, feedback: `Raising the power is only half the reversal; also divide by ${power + 1}.` },
    { label: `${powerLabel(coefficient, power)} + C`, correct: false, feedback: "An antiderivative must differentiate back to the integrand; leaving the power unchanged does not." },
  ]);
}

const ANTIDERIVATIVE_NUMERIC_CASES = [
  { cubic: 1, square: 1, lower: 0, upper: 2 }, { cubic: 1, square: 2, lower: 0, upper: 3 },
  { cubic: 2, square: 1, lower: 0, upper: 2 }, { cubic: 2, square: 2, lower: 1, upper: 3 },
  { cubic: 3, square: 1, lower: 1, upper: 2 }, { cubic: 3, square: 2, lower: 0, upper: 3 },
  { cubic: 4, square: 1, lower: 1, upper: 3 }, { cubic: 4, square: 3, lower: 0, upper: 2 },
  { cubic: 5, square: 2, lower: 1, upper: 2 }, { cubic: 5, square: 3, lower: 0, upper: 3 },
  { cubic: 6, square: 1, lower: 2, upper: 4 }, { cubic: 6, square: 4, lower: 1, upper: 3 },
] as const;

function antiderivativeNumericWidget(rand: Rand): GeneratedIntegrationVariant {
  const { cubic, square, lower, upper } = pick(rand, ANTIDERIVATIVE_NUMERIC_CASES);
  const x2 = 3 * cubic;
  const x1 = 2 * square;
  const primitive = (x: number) => cubic * x ** 3 + square * x ** 2;
  const answer = primitive(upper) - primitive(lower);
  const upperOnly = primitive(upper);
  const widget = {
    type: "numeric" as const,
    prompt: `Evaluate the integral from ${lower} to ${upper} of (${x2}x^2 + ${x1}x) dx.`,
    answer,
    tolerance: 0,
    unit: "",
    commonErrors: uniqueNumericErrors(answer, [
      { value: upperOnly, feedback: `That is F(${upper}) alone. Subtract F(${lower}) as well.` },
      { value: (x2 * upper ** 3 + x1 * upper ** 2) - (x2 * lower ** 3 + x1 * lower ** 2), feedback: "The coefficients must be divided by the new powers when antidifferentiating." },
      { value: x2 * upper ** 2 + x1 * upper, feedback: "That evaluates the integrand at the upper endpoint rather than accumulating it." },
    ]),
    fallbackFeedback: `An antiderivative is ${powerLabel(cubic, 3)} + ${powerLabel(square, 2)}. Endpoint subtraction gives ${answer}.`,
    successFeedback: `The definite integral is ${answer}.`,
  };
  return { widget, answer };
}

const INITIAL_VALUE_CASES = [
  { a: 2, b: 1, at: 0, initial: 4, target: 2 }, { a: 2, b: 3, at: 1, initial: 6, target: 3 },
  { a: 4, b: 1, at: 0, initial: 5, target: 2 }, { a: 4, b: 2, at: 1, initial: 8, target: 3 },
  { a: 6, b: 1, at: 0, initial: 2, target: 3 }, { a: 6, b: 2, at: 1, initial: 7, target: 2 },
  { a: 8, b: 1, at: 0, initial: 3, target: 2 }, { a: 8, b: 3, at: 1, initial: 9, target: 3 },
  { a: 10, b: 1, at: 0, initial: 6, target: 2 }, { a: 10, b: 2, at: 1, initial: 11, target: 2 },
  { a: 12, b: 1, at: 0, initial: 1, target: 3 }, { a: 12, b: 4, at: 1, initial: 12, target: 3 },
] as const;

function constantOfIntegrationNumericWidget(rand: Rand): GeneratedIntegrationVariant {
  const { a, b, at, initial, target } = pick(rand, INITIAL_VALUE_CASES);
  const primitive = (x: number) => a * x ** 2 / 2 + b * x;
  const constant = initial - primitive(at);
  const answer = primitive(target) + constant;
  const widget = {
    type: "exactNumberLab" as const,
    prompt: `F'(x) = ${a}x + ${b} and F(${at}) = ${initial}. Find F(${target}).`,
    task: "antiderivativeInitialValue" as const,
    values: [],
    aivRate: [a, b],
    aivOrder: 1,
    aivAt0: at,
    aivInit: [initial],
    aivTarget: target,
    answerMode: "numeric" as const,
    tolerance: 0,
    numericErrors: uniqueNumericErrors(answer, [
      { value: primitive(target), feedback: "That silently sets C = 0. Use the given point to determine the vertical shift." },
      { value: initial, feedback: `That is F(${at}), the given value, rather than F(${target}).` },
      { value: a * target + b, feedback: `That is F'(${target}), the rate at the target, not the function value.` },
    ]),
    choices: [],
    authoredStages: [],
    requiredStageKeys: [],
    requiredExplorations: 1,
    explorationFeedback: "Use the initial condition to identify the one member of the antiderivative family.",
    fallbackFeedback: `The initial condition gives C = ${constant}; substituting x = ${target} gives ${answer}.`,
    successFeedback: `The initial condition fixes C = ${constant}, so F(${target}) = ${answer}.`,
  };
  return { widget, answer };
}

const CONSTANT_FAMILY_CASES = [
  { a: 2, b: 1 }, { a: 2, b: 2 }, { a: 2, b: 3 }, { a: 2, b: 4 },
  { a: 4, b: 1 }, { a: 4, b: 2 }, { a: 4, b: 3 }, { a: 4, b: 4 },
  { a: 6, b: 1 }, { a: 6, b: 2 }, { a: 6, b: 3 }, { a: 6, b: 4 },
] as const;

function constantOfIntegrationMcqWidget(rand: Rand): GeneratedIntegrationVariant {
  const { a, b } = pick(rand, CONSTANT_FAMILY_CASES);
  const half = a / 2;
  const family = `${powerLabel(half, 2)} + ${powerLabel(b, 1)} + C`;
  return integrationMcq(rand, `F'(x) = ${a}x + ${b}, but no value of F is given. Which conclusion is fully determined?`, [
    { label: `F(x) = ${family}.`, correct: true, feedback: "The derivative determines the shape, while the unknown vertical position remains as C." },
    { label: `F(x) = ${powerLabel(half, 2)} + ${powerLabel(b, 1)}.`, correct: false, feedback: "Without one value of F, there is no evidence that the constant is zero." },
    { label: `F(x) = ${powerLabel(a, 1)} + ${b} + C.`, correct: false, feedback: "That repeats the derivative rather than antidifferentiating it." },
    { label: "C = 0.", correct: false, feedback: "A derivative cannot reveal vertical position; an initial value is needed to determine C." },
  ]);
}

type LibraryChoiceCase =
  | { kind: "sin" | "cos" | "exp"; k: number }
  | { kind: "log"; m: number };

const LIBRARY_MCQ_CASES: readonly LibraryChoiceCase[] = [
  { kind: "sin", k: 2 }, { kind: "sin", k: 3 }, { kind: "sin", k: 4 },
  { kind: "cos", k: 2 }, { kind: "cos", k: 3 }, { kind: "cos", k: 5 },
  { kind: "exp", k: 2 }, { kind: "exp", k: 4 }, { kind: "exp", k: 6 },
  { kind: "log", m: 2 }, { kind: "log", m: 3 }, { kind: "log", m: 5 },
];

function libraryMcqWidget(rand: Rand): GeneratedIntegrationVariant {
  const entry = pick(rand, LIBRARY_MCQ_CASES);
  if (entry.kind === "log") {
    const correct = `${entry.m} ln|x| + C`;
    return integrationMcq(rand, `What is the indefinite integral of ${entry.m}/x dx?`, [
      { label: correct, correct: true, feedback: "Because the derivative of ln|x| is 1/x, the coefficient carries through unchanged." },
      { label: `${entry.m}/x + C`, correct: false, feedback: "That repeats the integrand; differentiating it would produce a negative square in the denominator." },
      { label: `ln|${entry.m}x| + C`, correct: false, feedback: "A constant inside the logarithm changes only the integration constant; it does not create the required outside coefficient." },
      { label: `${entry.m}x ln|x| + C`, correct: false, feedback: "Differentiating this introduces an extra logarithm term." },
    ]);
  }
  const { kind, k } = entry;
  const prompt = `What is the indefinite integral of ${kind}(${k}x) dx?`;
  if (kind === "sin") {
    const correct = `-cos(${k}x)/${k} + C`;
    return integrationMcq(rand, prompt, [
      { label: correct, correct: true, feedback: "The minus reverses the derivative of cosine, and division by the inner coefficient reverses the chain rule." },
      { label: `cos(${k}x)/${k} + C`, correct: false, feedback: "Differentiating gives the negative of the requested sine." },
      { label: `-cos(${k}x) + C`, correct: false, feedback: `Differentiating multiplies by ${k}; divide by ${k} to cancel it.` },
      { label: `sin(${k}x)/${k} + C`, correct: false, feedback: "Differentiating sine produces cosine, not sine." },
    ]);
  }
  if (kind === "cos") {
    const correct = `sin(${k}x)/${k} + C`;
    return integrationMcq(rand, prompt, [
      { label: correct, correct: true, feedback: "Differentiate back: the inner factor cancels the division, leaving cosine." },
      { label: `-sin(${k}x)/${k} + C`, correct: false, feedback: "Cosine needs no negative sign when read backward from the derivative of sine." },
      { label: `sin(${k}x) + C`, correct: false, feedback: `Divide by ${k} to reverse the inner derivative.` },
      { label: `cos(${k}x)/${k} + C`, correct: false, feedback: "Differentiating cosine produces sine with a negative sign." },
    ]);
  }
  const correct = `e^(${k}x)/${k} + C`;
  return integrationMcq(rand, prompt, [
    { label: correct, correct: true, feedback: `The exponential keeps its form, and division by ${k} reverses the inner derivative.` },
    { label: `e^(${k}x) + C`, correct: false, feedback: `Differentiating would produce ${k} times the requested integrand.` },
    { label: `${k}e^(${k}x) + C`, correct: false, feedback: "That multiplies by the inner derivative again instead of reversing it." },
    { label: `e^x/${k} + C`, correct: false, feedback: "The inner expression remains kx in the antiderivative." },
  ]);
}

type LibraryNumericCase =
  | { kind: "log" | "sin" | "cos" | "exp"; multiplier: number };

const LIBRARY_NUMERIC_CASES: readonly LibraryNumericCase[] = [
  { kind: "log", multiplier: 2 }, { kind: "log", multiplier: 3 }, { kind: "log", multiplier: 5 },
  { kind: "sin", multiplier: 3 }, { kind: "sin", multiplier: 4 }, { kind: "sin", multiplier: 6 },
  { kind: "cos", multiplier: 7 }, { kind: "cos", multiplier: 9 }, { kind: "cos", multiplier: 10 },
  { kind: "exp", multiplier: 11 }, { kind: "exp", multiplier: 13 }, { kind: "exp", multiplier: 14 },
];

function libraryNumericWidget(rand: Rand): GeneratedIntegrationVariant {
  const { kind, multiplier } = pick(rand, LIBRARY_NUMERIC_CASES);
  const prompt = kind === "log"
    ? `Evaluate the integral from 1 to e of ${multiplier}/x dx.`
    : kind === "sin"
      ? `Evaluate the integral from 0 to π of ${multiplier} sin x dx.`
      : kind === "cos"
        ? `Evaluate the integral from 0 to π/2 of ${multiplier} cos x dx.`
        : `Evaluate the integral from 0 to ln 2 of ${multiplier} e^x dx.`;
  const answer = kind === "sin" ? 2 * multiplier : multiplier;
  const widget = {
    type: "numeric" as const,
    prompt,
    answer,
    tolerance: 0,
    unit: "",
    commonErrors: uniqueNumericErrors(answer, [
      { value: multiplier, feedback: kind === "sin" ? "The sine accumulation from 0 to π contributes a factor of 2." : "Recheck the endpoint subtraction rather than copying the coefficient." },
      { value: 2 * multiplier, feedback: kind === "sin" ? "That is the correct endpoint change; recheck which quantity the prompt asks for." : "This doubles the endpoint change without a mathematical reason." },
      { value: 0, feedback: "The antiderivative has different values at the two stated endpoints." },
      { value: -answer, feedback: "This reverses the endpoint subtraction or the antiderivative sign." },
    ]),
    fallbackFeedback: kind === "log"
      ? `${multiplier}[ln x] from 1 to e is ${answer}.`
      : kind === "sin"
        ? `${multiplier}[-cos x] from 0 to π is ${answer}.`
        : kind === "cos"
          ? `${multiplier}[sin x] from 0 to π/2 is ${answer}.`
          : `${multiplier}[e^x] from 0 to ln 2 is ${answer}.`,
    successFeedback: `The definite integral is ${answer}.`,
  };
  return { widget, answer };
}

/* S246 / Phase 5. The in-05 authored banks repeated the same substitution
 * exercises across twelve lesson consumers. These pools preserve the seven
 * response surfaces while varying the inside function, derivative receipt,
 * exponent, limits, and resulting truth. */
const USUB_POWER_CASES = [
  { power: 2, shift: 1, outer: 1, scale: 1 }, { power: 2, shift: 2, outer: 1, scale: 2 },
  { power: 2, shift: 3, outer: 1, scale: 3 }, { power: 3, shift: 1, outer: 2, scale: 2 },
  { power: 3, shift: 2, outer: 2, scale: 3 }, { power: 3, shift: 3, outer: 2, scale: 4 },
  { power: 4, shift: 1, outer: 3, scale: 1 }, { power: 4, shift: 2, outer: 3, scale: 2 },
  { power: 4, shift: 3, outer: 3, scale: 3 }, { power: 5, shift: 1, outer: 4, scale: 1 },
  { power: 5, shift: 2, outer: 4, scale: 2 }, { power: 5, shift: 3, outer: 4, scale: 3 },
] as const;

function receiptTerm(coefficient: number, power: number) {
  if (power === 0) return String(coefficient);
  const coefficientText = coefficient === 1 ? "" : String(coefficient);
  return power === 1 ? `${coefficientText}x` : `${coefficientText}x^${power}`;
}

function uSubMcqWidget(rand: Rand): GeneratedIntegrationVariant {
  const { power, shift, outer, scale } = pick(rand, USUB_POWER_CASES);
  const receipt = receiptTerm(scale * power, power - 1);
  const correct = `u = x^${power} + ${shift}.`;
  return integrationMcq(rand, `In the integral of ${receipt}(x^${power} + ${shift})^${outer} dx, which substitution exposes the power rule?`, [
    { label: correct, correct: true, feedback: `Its derivative is ${power}x^${power - 1}, and the displayed factor differs only by the constant ${scale}.` },
    { label: `u = ${receipt}.`, correct: false, feedback: "That is the derivative receipt, not the repeated inside expression." },
    { label: `u = (x^${power} + ${shift})^${outer}.`, correct: false, feedback: "Choose the inside before the outer power so the remaining expression becomes a simple power of u." },
    { label: "u = x.", correct: false, feedback: "This changes no structure and leaves the nested power intact." },
  ]);
}

function powerSubstitutionNumeric(rand: Rand, family: "usub" | "choosing"): GeneratedIntegrationVariant {
  const { power, shift, outer, scale } = pick(rand, USUB_POWER_CASES);
  const receipt = receiptTerm(scale * power, power - 1);
  const divisor = outer + 1;
  const exact = scale * ((shift + 1) ** divisor - shift ** divisor) / divisor;
  const answer = round3(exact);
  const prompt = family === "usub"
    ? `Evaluate the integral from 0 to 1 of ${receipt}(x^${power} + ${shift})^${outer} dx. Give a decimal to three places.`
    : `Choose u, then evaluate the integral from 0 to 1 of ${receipt}(x^${power} + ${shift})^${outer} dx. Give a decimal to three places.`;
  const widget = {
    type: "numeric" as const,
    prompt,
    answer,
    tolerance: 0.005,
    unit: "",
    commonErrors: uniqueNumericErrors(answer, [
      { value: round3(exact / scale), feedback: `The derivative receipt carries the constant factor ${scale}; do not discard it.` },
      { value: round3(scale * (shift + 1) ** divisor / divisor), feedback: "A definite integral subtracts the transformed lower endpoint as well as evaluating the upper endpoint." },
      { value: round3(exact * divisor), feedback: `The antiderivative of u^${outer} divides by ${divisor}.` },
    ]),
    fallbackFeedback: `Use u = x^${power} + ${shift}. The receipt becomes ${scale} du and the limits become ${shift} and ${shift + 1}, giving ${answer}.`,
    successFeedback: `The substitution gives ${answer}.`,
  };
  return { widget, answer };
}

const USUB_LIMIT_CASES = [
  { m: 2, c: 1, a: 0, b: 1, outer: 2 }, { m: 2, c: 3, a: 1, b: 2, outer: 1 },
  { m: 3, c: 1, a: 0, b: 1, outer: 1 }, { m: 3, c: 2, a: 1, b: 2, outer: 2 },
  { m: 4, c: 1, a: 0, b: 2, outer: 1 }, { m: 4, c: 3, a: 1, b: 2, outer: 2 },
  { m: 5, c: 1, a: 0, b: 1, outer: 2 }, { m: 5, c: 2, a: 1, b: 3, outer: 1 },
  { m: 6, c: 1, a: 0, b: 2, outer: 1 }, { m: 6, c: 3, a: 1, b: 2, outer: 2 },
  { m: 7, c: 2, a: 0, b: 1, outer: 2 }, { m: 8, c: 1, a: 1, b: 2, outer: 1 },
] as const;

function uSubLimitsMcqWidget(rand: Rand): GeneratedIntegrationVariant {
  const { m, c, a, b, outer } = pick(rand, USUB_LIMIT_CASES);
  const lower = m * a + c;
  const upper = m * b + c;
  const correct = `u runs from ${lower} to ${upper}.`;
  return integrationMcq(rand, `For the integral from ${a} to ${b} of ${m}(${m}x + ${c})^${outer} dx with u = ${m}x + ${c}, what are the u-limits?`, [
    { label: correct, correct: true, feedback: `Substitute each x-endpoint into u = ${m}x + ${c}.` },
    { label: `u runs from ${a} to ${b}.`, correct: false, feedback: "Those are x-values; a u-integral requires u-values." },
    { label: `u runs from ${m * a} to ${m * b}.`, correct: false, feedback: `This omits the +${c} from both endpoint conversions.` },
    { label: `u runs from ${upper} to ${lower}.`, correct: false, feedback: "This reverses the orientation of the interval." },
  ]);
}

function uSubLimitsNumericWidget(rand: Rand): GeneratedIntegrationVariant {
  const { m, c, a, b, outer } = pick(rand, USUB_LIMIT_CASES);
  const lower = m * a + c;
  const upper = m * b + c;
  const divisor = outer + 1;
  const answer = round3((upper ** divisor - lower ** divisor) / divisor);
  const widget = {
    type: "numeric" as const,
    prompt: `Evaluate the integral from ${a} to ${b} of ${m}(${m}x + ${c})^${outer} dx by changing to u-limits. Give a decimal to three places.`,
    answer,
    tolerance: 0.005,
    unit: "",
    commonErrors: uniqueNumericErrors(answer, [
      { value: round3((b ** divisor - a ** divisor) / divisor), feedback: "Those are the original x-limits used inside a u-antiderivative." },
      { value: round3(upper ** divisor / divisor), feedback: `Subtract the transformed lower endpoint u = ${lower}.` },
      { value: round3(upper ** divisor - lower ** divisor), feedback: `The antiderivative of u^${outer} divides by ${divisor}.` },
    ]),
    fallbackFeedback: `The limits become ${lower} and ${upper}; integrating u^${outer} gives ${answer}.`,
    successFeedback: `Changing the limits gives ${answer}.`,
  };
  return { widget, answer };
}

function choosingUMcqWidget(rand: Rand): GeneratedIntegrationVariant {
  const { power, shift, outer, scale } = pick(rand, USUB_POWER_CASES);
  const receipt = receiptTerm(scale * power, power - 1);
  const correct = `u = x^${power} + ${shift}.`;
  return integrationMcq(rand, `For the integral of ${receipt}(x^${power} + ${shift})^${outer} dx, which choice of u leaves no x behind?`, [
    { label: correct, correct: true, feedback: `du = ${power}x^${power - 1} dx, so the remaining factor is only the constant ${scale}.` },
    { label: `u = x^${power - 1}.`, correct: false, feedback: "This chooses the outside receipt rather than the repeated inside expression." },
    { label: `u = x^${power}.`, correct: false, feedback: `Including the +${shift} turns the complete bracket into u.` },
    { label: "No power-rule substitution works.", correct: false, feedback: "The derivative of the inside is present up to a constant, so substitution does work." },
  ]);
}

const CHOOSING_U_BUCKET_CASES = [
  { power: 2, shift: 1 }, { power: 2, shift: 2 }, { power: 2, shift: 3 },
  { power: 3, shift: 1 }, { power: 3, shift: 2 }, { power: 3, shift: 3 },
  { power: 4, shift: 1 }, { power: 4, shift: 2 }, { power: 4, shift: 3 },
  { power: 5, shift: 1 }, { power: 5, shift: 2 }, { power: 5, shift: 3 },
] as const;

function choosingUBucketLabels(power: number, shift: number) {
  return [
    `integral of ${power}x^${power - 1} cos(x^${power} + ${shift}) dx`,
    `integral of cos(x^${power} + ${shift}) dx`,
    `integral of (x + ${shift})^${power} dx`,
    `integral of x^${Math.max(0, power - 2)}(x^${power} + ${shift})^2 dx`,
  ];
}

function choosingUDragBucketWidget(rand: Rand): GeneratedIntegrationVariant {
  const { power, shift } = pick(rand, CHOOSING_U_BUCKET_CASES);
  const labels = choosingUBucketLabels(power, shift);
  const buckets = [
    { id: "yes", label: "Substitution works" },
    { id: "no", label: "The needed derivative factor is missing" },
  ];
  const items = [
    { id: "s1", label: labels[0]!, bucketId: "yes", feedback: "The derivative of the inside is present exactly." },
    { id: "s2", label: labels[1]!, bucketId: "no", feedback: `u = x^${power} + ${shift} needs an x^${power - 1} factor.` },
    { id: "s3", label: labels[2]!, bucketId: "yes", feedback: "The inside x plus a constant has derivative 1." },
    { id: "s4", label: labels[3]!, bucketId: "no", feedback: `The displayed x-power is one degree short of the x^${power - 1} receipt.` },
  ];
  const shuffledItems = shuffle(rand, items);
  const answer = Object.fromEntries(items.map((item) => [item.id, item.bucketId]));
  return {
    widget: {
      type: "dragBucket" as const,
      prompt: `Use p = ${power} and c = ${shift}. Sort each integral by whether a direct u-substitution has its derivative receipt.`,
      buckets,
      items: shuffledItems,
      missFeedback: "Differentiate the proposed inside and look for that factor, allowing only a constant multiple.",
      successFeedback: "A usable substitution needs both a meaningful inside and its derivative receipt.",
    },
    answer,
  };
}

/* S246 / Phase 5: ia-01 area and solids-of-revolution assurance. */
const AREA_BETWEEN_MCQ_CASES = Array.from({ length: 12 }, (_, index) => ({
  line: index + 1,
  quadratic: index % 3 + 1,
})) as readonly { line: number; quadratic: number }[];

function areaBetweenMcqWidget(rand: Rand): GeneratedIntegrationVariant {
  const { line, quadratic } = pick(rand, AREA_BETWEEN_MCQ_CASES);
  const intersection = round3(line / quadratic);
  const linearLabel = coefficientVariable(line, "x");
  const quadraticLabel = coefficientVariable(quadratic, "x^2");
  const correct = `y = ${linearLabel} is on top.`;
  return integrationMcq(rand, `On the open interval from 0 to ${intersection}, which curve is on top: y = ${linearLabel} or y = ${quadraticLabel}?`, [
    { label: correct, correct: true, feedback: "Between the two intersections, the linear curve has the greater y-value." },
    { label: `y = ${quadraticLabel} is on top.`, correct: false, feedback: "That curve is below the line between the intersections and catches it at the right endpoint." },
    { label: "The curves have equal height throughout.", correct: false, feedback: "They agree only at their intersection points, not throughout the interval." },
    { label: "The top curve changes inside the interval.", correct: false, feedback: "There is no additional intersection inside the stated open interval." },
  ]);
}

type AreaBetweenNumericCase = { kind: "intersection" | "signed" | "area"; line: number; quadratic: number };
const AREA_BETWEEN_NUMERIC_CASES: readonly AreaBetweenNumericCase[] = [
  { kind: "intersection", line: 1, quadratic: 1 }, { kind: "intersection", line: 2, quadratic: 1 },
  { kind: "intersection", line: 3, quadratic: 2 }, { kind: "intersection", line: 4, quadratic: 3 },
  { kind: "signed", line: 1, quadratic: 2 }, { kind: "signed", line: 2, quadratic: 1 },
  { kind: "signed", line: 3, quadratic: 1 }, { kind: "signed", line: 4, quadratic: 2 },
  { kind: "area", line: 1, quadratic: 1 }, { kind: "area", line: 2, quadratic: 2 },
  { kind: "area", line: 3, quadratic: 1 }, { kind: "area", line: 4, quadratic: 1 },
];

function areaBetweenNumericWidget(rand: Rand): GeneratedIntegrationVariant {
  const { kind, line, quadratic } = pick(rand, AREA_BETWEEN_NUMERIC_CASES);
  const upper = line / quadratic;
  const signed = quadratic * upper ** 3 / 3 - line * upper ** 2 / 2;
  const rawAnswer = kind === "intersection" ? upper : kind === "signed" ? signed : -signed;
  // round3, not toFixed(4): line/quadratic ratios like 4/3 repeat forever, and a four-place
  // rounding prints that as a run of identical digits ("1.3333") that reads as a truncated
  // repeating decimal rather than a deliberately rounded value. Three places (the precision
  // every sibling numeric widget in this file already rounds to) never has room for a same-digit
  // run of four, so it cannot reproduce that artifact.
  const answer = round3(rawAnswer);
  const linearLabel = coefficientVariable(line, "x");
  const quadraticLabel = coefficientVariable(quadratic, "x^2");
  const prompt = kind === "intersection"
    ? `The curves y = ${linearLabel} and y = ${quadraticLabel} meet at x = 0 and at what larger x-value? Give a decimal to three places.`
    : kind === "signed"
      ? `Find the signed integral from 0 to ${round3(upper)} of (${quadraticLabel} - ${linearLabel}) dx. Give a decimal to three places.`
      : `Find the area between y = ${linearLabel} and y = ${quadraticLabel} from x = 0 to x = ${round3(upper)}. Give a decimal to three places.`;
  const widget = {
    type: "numeric" as const,
    prompt,
    answer,
    tolerance: 0.0005,
    unit: kind === "area" ? "square units" : "",
    commonErrors: uniqueNumericErrors(answer, kind === "intersection" ? [
      { value: 0, feedback: "That is the shared origin; the question asks for the larger intersection." },
      { value: round3(quadratic / line), feedback: "This reverses the coefficient ratio when solving the factored intersection equation." },
    ] : [
      { value: Number((-rawAnswer).toFixed(4)), feedback: kind === "signed" ? "This changes the requested signed integral into positive geometric area." : "Area is nonnegative; subtract the lower curve from the upper curve." },
      { value: Number((Math.abs(rawAnswer) * 2).toFixed(4)), feedback: "Recheck the antiderivative coefficients rather than doubling the region." },
      { value: 0, feedback: "The curves meet at the endpoints, but the vertical gap is nonzero inside the interval." },
    ]),
    fallbackFeedback: kind === "intersection"
      ? `Factor x(${line} - ${coefficientVariable(quadratic, "x")}) = 0; the larger solution is ${answer}.`
      : `Integrate the displayed upper-minus-lower order over the stated interval to obtain ${answer}.`,
    successFeedback: `${kind === "area" ? "The geometric area" : kind === "signed" ? "The signed integral" : "The larger intersection"} is ${answer}.`,
  };
  return { widget, answer };
}

const DISC_CASES = Array.from({ length: 12 }, (_, index) => ({
  coefficient: index + 1,
  power: index % 3 + 1,
})) as readonly { coefficient: number; power: number }[];

function discMcqWidget(rand: Rand): GeneratedIntegrationVariant {
  const { coefficient, power } = pick(rand, DISC_CASES);
  const functionLabel = coefficientVariable(coefficient, `x^${power}`);
  const correct = `The radius is ${functionLabel}.`;
  return integrationMcq(rand, `The region under y = ${functionLabel} is revolved about the x-axis. What is the radius of the disc at x?`, [
    { label: correct, correct: true, feedback: "The radius is the vertical distance from the x-axis to the curve." },
    { label: `The radius is (${functionLabel})^2.`, correct: false, feedback: "Squaring occurs in the circle-area formula after identifying the radius." },
    { label: `The radius is π${functionLabel}.`, correct: false, feedback: "π belongs to the disc area, not the radius." },
    { label: "The radius is the slice thickness dx.", correct: false, feedback: "dx is the slice thickness, not its distance from the axis." },
  ]);
}

function discNumericWidget(rand: Rand): GeneratedIntegrationVariant {
  const { coefficient, power } = pick(rand, DISC_CASES);
  const answer = round3(Math.PI * coefficient ** 2 / (2 * power + 1));
  const widget = {
    type: "numeric" as const,
    prompt: `Revolve y = ${coefficientVariable(coefficient, `x^${power}`)} on [0, 1] about the x-axis. Find the volume to three decimal places.`,
    answer,
    tolerance: 0.005,
    unit: "cubic units",
    commonErrors: uniqueNumericErrors(answer, [
      { value: round3(Math.PI * coefficient / (power + 1)), feedback: "This integrates the radius, but disc area is π times the radius squared." },
      { value: round3(coefficient ** 2 / (2 * power + 1)), feedback: "The circular cross-section contributes a factor of π." },
      { value: round3(Math.PI * coefficient ** 2 / (power + 1)), feedback: "Squaring x^p doubles the exponent before integration." },
    ]),
    fallbackFeedback: `V = π times the integral of (${coefficientVariable(coefficient, `x^${power}`)})^2 from 0 to 1, which is ${answer}.`,
    successFeedback: `The disc-method volume is ${answer} cubic units.`,
  };
  return { widget, answer };
}

const WASHER_CASES = Array.from({ length: 12 }, (_, index) => ({
  outer: index + 3,
  inner: index % 2 + 1,
})) as readonly { outer: number; inner: number }[];

function washerMcqWidget(rand: Rand): GeneratedIntegrationVariant {
  const { outer, inner } = pick(rand, WASHER_CASES);
  const coefficient = outer ** 2 - inner ** 2;
  const correct = `${coefficient}pi square units.`;
  return integrationMcq(rand, `A washer has outer radius ${outer} and inner radius ${inner}. What is its face area?`, [
    { label: correct, correct: true, feedback: "Subtract the inner disc area from the outer disc area." },
    { label: `${outer ** 2 + inner ** 2}pi square units.`, correct: false, feedback: "The central hole is removed, so its area is subtracted rather than added." },
    { label: `${(outer - inner) ** 2}pi square units.`, correct: false, feedback: "Subtract the squared radii, not the radii before squaring." },
    { label: `${outer ** 2}pi square units.`, correct: false, feedback: "That is the full outer disc before removing the inner hole." },
  ]);
}

function washerNumericWidget(rand: Rand): GeneratedIntegrationVariant {
  const { outer } = pick(rand, WASHER_CASES);
  const answer = round3(2 * Math.PI * outer ** 2 / 3);
  const widget = {
    type: "numeric" as const,
    prompt: `Revolve the region between y = ${outer} and y = ${outer}x on [0, 1] about the x-axis. Find the washer-method volume to three decimal places.`,
    answer,
    tolerance: 0.005,
    unit: "cubic units",
    commonErrors: uniqueNumericErrors(answer, [
      { value: round3(Math.PI * outer ** 2), feedback: "That uses only the outer cylinder and does not remove the growing inner radius." },
      { value: round3(Math.PI * outer ** 2 / 3), feedback: "That is the inner solid alone; subtract it from the outer cylinder." },
      { value: round3(4 * Math.PI * outer ** 2 / 3), feedback: "Recheck outer-minus-inner; this doubles the surviving washer volume." },
    ]),
    fallbackFeedback: `Integrate π((${outer})^2 - (${outer}x)^2) from 0 to 1 to obtain ${answer}.`,
    successFeedback: `The washer-method volume is ${answer} cubic units.`,
  };
  return { widget, answer };
}

function washerMatchWidget(rand: Rand): GeneratedIntegrationVariant {
  const { outer, inner } = pick(rand, WASHER_CASES);
  const face = outer ** 2 - inner ** 2;
  const left = [
    { id: "l-outer", label: `outer radius R = ${outer}` },
    { id: "l-inner", label: `inner radius r = ${inner}` },
    { id: "l-face", label: `face area = ${face}pi` },
    { id: "l-volume", label: `slice volume = ${face}pi dx` },
  ];
  const right = [
    { id: "r-outer", label: "distance from the axis to the outside curve" },
    { id: "r-inner", label: "distance from the axis to the hole boundary" },
    { id: "r-face", label: "area on one washer face" },
    { id: "r-volume", label: "volume of one thin washer" },
  ];
  const pairs = { "l-outer": "r-outer", "l-inner": "r-inner", "l-face": "r-face", "l-volume": "r-volume" };
  const shuffledLeft = shuffle(rand, left);
  let shuffledRight = shuffle(rand, right);
  if (shuffledLeft.every((item, index) => pairs[item.id as keyof typeof pairs] === shuffledRight[index]?.id)) {
    shuffledRight = [...shuffledRight.slice(1), shuffledRight[0]!];
  }
  const widget = {
    type: "matchPairs" as const,
    prompt: `For a washer with R = ${outer}, r = ${inner}, and thickness dx, match each visible quantity to what it measures.`,
    left: shuffledLeft,
    right: shuffledRight,
    pairs,
    pairErrors: [
      { left: "l-face", right: "r-volume", feedback: "Face area becomes a volume only after multiplication by the thickness dx." },
      { left: "l-inner", right: "r-outer", feedback: "The inner radius reaches the hole boundary; the outer radius reaches the outside curve." },
    ],
    missFeedback: "Separate radius, face area, and thin-slice volume before matching.",
    successFeedback: "The washer model moves from two radii to face area and then to thin-slice volume.",
  };
  return { widget, answer: pairs };
}

type CrossSectionShape = "squares" | "equilateral triangles" | "semicircles";
const CROSS_SECTION_CASES = Array.from({ length: 12 }, (_, index) => ({
  shape: (["squares", "equilateral triangles", "semicircles"] as const)[index % 3]!,
  coefficient: index + 1,
  power: index % 3 + 1,
})) as readonly { shape: CrossSectionShape; coefficient: number; power: number }[];

function crossSectionFactor(shape: CrossSectionShape) {
  return shape === "squares" ? 1 : shape === "equilateral triangles" ? Math.sqrt(3) / 4 : Math.PI / 8;
}

function crossSectionNumericWidget(rand: Rand): GeneratedIntegrationVariant {
  const { shape, coefficient, power } = pick(rand, CROSS_SECTION_CASES);
  const factor = crossSectionFactor(shape);
  const answer = round3(factor * coefficient ** 2 / (2 * power + 1));
  const widthRole = shape === "semicircles" ? "diameter" : "side length";
  const widget = {
    type: "numeric" as const,
    prompt: `The base width is y = ${coefficient}x^${power} on [0, 1]. Cross-sections perpendicular to the x-axis are ${shape}, with ${widthRole} equal to the base width. Find the volume to three decimal places.`,
    answer,
    tolerance: 0.005,
    unit: "cubic units",
    commonErrors: uniqueNumericErrors(answer, [
      { value: round3(factor * coefficient / (power + 1)), feedback: "Cross-sectional area depends on the square of the base width." },
      { value: round3(coefficient ** 2 / (2 * power + 1)), feedback: shape === "squares" ? "This is the correct square-slice factor; recheck the requested result." : "This omits the shape-specific area factor." },
      { value: round3(factor * coefficient ** 2 / (power + 1)), feedback: "Squaring x^p doubles the exponent before integration." },
    ]),
    fallbackFeedback: `Use the ${shape} area factor times (${coefficient}x^${power})^2, then integrate from 0 to 1 to obtain ${answer}.`,
    successFeedback: `The cross-sectional volume is ${answer} cubic units.`,
  };
  return { widget, answer };
}

const CROSS_SECTION_MCQ_CASES = Array.from({ length: 12 }, (_, index) => ({
  shape: (["squares", "equilateral triangles", "semicircles"] as const)[index % 3]!,
  width: index + 2,
})) as readonly { shape: CrossSectionShape; width: number }[];

function crossSectionAreaLabel(shape: CrossSectionShape, width: number) {
  if (shape === "squares") return `The slice area is ${width ** 2} square units.`;
  if (shape === "equilateral triangles") return `The slice area is ${width ** 2}sqrt(3)/4 square units.`;
  return `The slice area is ${width ** 2}pi/8 square units.`;
}

function crossSectionName(shape: CrossSectionShape) {
  if (shape === "squares") return "a square";
  if (shape === "equilateral triangles") return "an equilateral triangle";
  return "a semicircle";
}

function crossSectionMcqWidget(rand: Rand): GeneratedIntegrationVariant {
  const { shape, width } = pick(rand, CROSS_SECTION_MCQ_CASES);
  const correct = crossSectionAreaLabel(shape, width);
  const shapeName = crossSectionName(shape);
  return integrationMcq(rand, `At a marked x-value, the base width is ${width} units. The perpendicular cross-section is ${shapeName}, with its side or diameter equal to that width. Which slice-area statement is correct?`, [
    { label: correct, correct: true, feedback: "Use the area formula for the stated shape with the displayed base width." },
    { label: `The slice area is ${width} square units.`, correct: false, feedback: "Area is not the unsquared one-dimensional width." },
    { label: `The slice area is ${width ** 2}pi square units.`, correct: false, feedback: "That treats the width as a circle radius and ignores the stated cross-section formula." },
    { label: `The slice area is ${width ** 2}/2 square units.`, correct: false, feedback: `That area rule does not match ${shapeName}.` },
  ]);
}

type AverageValueNumericCase =
  | { kind: "average"; coefficient: number; power: number; upper: number }
  | { kind: "meanPoint"; coefficient: number; power: number; upper: number }
  | { kind: "velocity"; slope: number; intercept: number; upper: number };

const AVERAGE_VALUE_NUMERIC_CASES: readonly AverageValueNumericCase[] = [
  { kind: "average", coefficient: 1, power: 1, upper: 2 },
  { kind: "average", coefficient: 2, power: 1, upper: 3 },
  { kind: "average", coefficient: 3, power: 2, upper: 2 },
  { kind: "average", coefficient: 4, power: 3, upper: 3 },
  { kind: "meanPoint", coefficient: 1, power: 2, upper: 3 },
  { kind: "meanPoint", coefficient: 2, power: 3, upper: 4 },
  { kind: "meanPoint", coefficient: 3, power: 1, upper: 5 },
  { kind: "meanPoint", coefficient: 4, power: 4, upper: 6 },
  { kind: "velocity", slope: 2, intercept: 1, upper: 4 },
  { kind: "velocity", slope: 3, intercept: 2, upper: 4 },
  { kind: "velocity", slope: 4, intercept: 3, upper: 5 },
  { kind: "velocity", slope: 5, intercept: 4, upper: 6 },
];

function averageValueNumericWidget(rand: Rand): GeneratedIntegrationVariant {
  const entry = pick(rand, AVERAGE_VALUE_NUMERIC_CASES);
  let answer: number;
  let prompt: string;
  let feedback: string;
  if (entry.kind === "velocity") {
    answer = round3(entry.slope * entry.upper / 2 + entry.intercept);
    prompt = `A velocity is v(t) = ${entry.slope}t + ${entry.intercept} on [0, ${entry.upper}]. Find the average velocity to three decimal places.`;
    feedback = `Divide the displacement integral by the elapsed time ${entry.upper}.`;
  } else {
    const average = entry.coefficient * entry.upper ** entry.power / (entry.power + 1);
    if (entry.kind === "average") {
      answer = round3(average);
      prompt = `Find the average value of f(x) = ${entry.coefficient}x^${entry.power} on [0, ${entry.upper}], to three decimal places.`;
      feedback = `Divide the integral by the interval width ${entry.upper}.`;
    } else {
      answer = round3(entry.upper / (entry.power + 1) ** (1 / entry.power));
      prompt = `For f(x) = ${entry.coefficient}x^${entry.power} on [0, ${entry.upper}], find the positive c where f(c) equals its average value. Give three decimals.`;
      feedback = `First compute the average ${round3(average)}, then solve f(c) = average.`;
    }
  }
  const widget = {
    type: "numeric" as const,
    prompt,
    answer,
    tolerance: 0.005,
    unit: entry.kind === "velocity" ? "units per time" : "",
    commonErrors: uniqueNumericErrors(answer, entry.kind === "meanPoint" ? [
      { value: round3(entry.upper / (entry.power + 1)), feedback: "The equation for c includes a power; take the appropriate root." },
      { value: entry.upper, feedback: "The right endpoint is not generally where the function equals its average." },
      { value: 0, feedback: "A positive increasing power function has a positive average on this interval." },
    ] : [
      { value: round3(answer * entry.upper), feedback: "That is the accumulated integral before division by interval width." },
      { value: round3(answer / entry.upper), feedback: "This divides by the interval width twice." },
      { value: 0, feedback: "The displayed function is positive over most or all of the interval." },
    ]),
    fallbackFeedback: feedback,
    successFeedback: `The requested average-value result is ${answer}.`,
  };
  return { widget, answer };
}

const AVERAGE_VALUE_MCQ_CASES = Array.from({ length: 12 }, (_, index) => ({
  coefficient: index + 1,
  power: index % 4 + 1,
  upper: index % 3 + 2,
})) as readonly { coefficient: number; power: number; upper: number }[];

function averageValueMcqWidget(rand: Rand): GeneratedIntegrationVariant {
  const { coefficient, power, upper } = pick(rand, AVERAGE_VALUE_MCQ_CASES);
  const correct = `1/${upper} times the integral from 0 to ${upper} of ${coefficient}x^${power} dx.`;
  return integrationMcq(rand, `For f(x) = ${coefficient}x^${power} on [0, ${upper}], which expression gives the average value?`, [
    { label: correct, correct: true, feedback: "Average value is accumulated function value divided by interval width." },
    { label: `1 time the integral from 0 to ${upper} of ${coefficient}x^${power} dx.`, correct: false, feedback: "That is total accumulation; divide by the interval width to obtain an average." },
    { label: `1/${upper + 1} times the integral from 0 to ${upper} of ${coefficient}x^${power} dx.`, correct: false, feedback: "Divide by the interval width, not one more than the width." },
    { label: `1/${upper ** 2} times the integral from 0 to ${upper} of ${coefficient}x^${power} dx.`, correct: false, feedback: "Divide by the interval length once, not its square." },
  ]);
}

/* S246 / Phase 5. The pc-01 authored pools exposed only one to three fixed
 * prompts per form. These builders preserve each lesson surface while varying
 * coefficients, translations, evaluation times, intervals, and exact truth. */
type ParametricPcCase = { ax: number; ay: number; t: number; x0: number; y0: number };
const PARAMETRIC_PC_CASES: readonly ParametricPcCase[] = [
  { ax: 2, ay: 1, t: 1, x0: -3, y0: 2 }, { ax: 3, ay: 2, t: 1, x0: 4, y0: -1 },
  { ax: 4, ay: 3, t: 1, x0: -2, y0: 5 }, { ax: 5, ay: 4, t: 1, x0: 1, y0: -4 },
  { ax: 1, ay: 1, t: 1, x0: 6, y0: 3 }, { ax: 3, ay: 2, t: 2, x0: -5, y0: 1 },
  { ax: 4, ay: 3, t: 2, x0: 3, y0: -2 }, { ax: 5, ay: 4, t: 2, x0: -1, y0: 6 },
  { ax: 2, ay: 3, t: 2, x0: 5, y0: -3 }, { ax: 3, ay: 4, t: 3, x0: -4, y0: 2 },
  { ax: 4, ay: 5, t: 4, x0: 2, y0: -5 }, { ax: 5, ay: 6, t: 5, x0: -6, y0: 4 },
];

const parametricExpression = (coefficient: number, power: 1 | 2 | 3, constant: number) =>
  `${coefficient}t${power === 1 ? "" : power === 2 ? "²" : "³"}${signedConstant(constant)}`;

function pcNumericWidget(prompt: string, answer: number, candidates: readonly number[], feedback: string): GeneratedIntegrationVariant {
  const commonErrors = uniqueNumericErrors(answer, candidates.map((value) => ({
    value: round3(value),
    feedback,
  }))).slice(0, 3);
  for (let offset = 1; commonErrors.length < 3; offset += 1) {
    const value = round3(answer + offset);
    if (value !== answer && commonErrors.every((error) => error.value !== value)) commonErrors.push({ value, feedback });
  }
  const widget = {
    type: "numeric" as const, prompt, answer, tolerance: 0.005, unit: "", commonErrors,
    fallbackFeedback: feedback,
    successFeedback: `The prompt-derived value is ${answer}.`,
  };
  return { widget, answer };
}

function pcChoiceValues(answer: number, candidates: readonly number[]) {
  const values = [answer, ...candidates.map(round3)].filter((value, index, all) => all.indexOf(value) === index);
  for (let offset = 1; values.length < 4; offset += 1) {
    const value = round3(answer + offset);
    if (!values.includes(value)) values.push(value);
  }
  return values.slice(0, 4);
}

function parametricDerivativeNumericWidget(rand: Rand): GeneratedIntegrationVariant {
  const entry = pick(rand, PARAMETRIC_PC_CASES);
  const dx = entry.ax;
  const dy = 2 * entry.ay * entry.t;
  const answer = round3(dy / dx);
  return pcNumericWidget(
    `x(t) = ${parametricExpression(entry.ax, 1, entry.x0)} and y(t) = ${parametricExpression(entry.ay, 2, entry.y0)}. Find dy/dx at t = ${entry.t}. Give three decimals if needed.`,
    answer, [round3(dx / dy), round3(entry.ay * entry.t / entry.ax), round3(Math.hypot(dx, dy))],
    `Differentiate both coordinates with respect to t, then divide dy/dt = ${dy} by dx/dt = ${dx}.`,
  );
}

function parametricDerivativeMcqWidget(rand: Rand): GeneratedIntegrationVariant {
  const entry = pick(rand, PARAMETRIC_PC_CASES);
  const dx = entry.ax;
  const dy = 2 * entry.ay * entry.t;
  const answer = round3(dy / dx);
  const values = pcChoiceValues(answer, [dx / dy, entry.ay * entry.t / entry.ax, Math.hypot(dx, dy)]);
  return integrationMcq(rand,
    `For x(t) = ${parametricExpression(entry.ax, 1, entry.x0)} and y(t) = ${parametricExpression(entry.ay, 2, entry.y0)}, which value is dy/dx at t = ${entry.t}?`,
    values.map((value) => ({
      label: `dy/dx = ${value}`,
      correct: value === answer,
      feedback: value === answer
        ? `Dividing dy/dt = ${dy} by dx/dt = ${dx} gives ${answer}.`
        : `Use (dy/dt)/(dx/dt); the displayed coordinate derivatives are ${dy} and ${dx}.`,
    })),
  );
}

function parametricSecondDerivativeWidget(rand: Rand): GeneratedIntegrationVariant {
  const entry = pick(rand, PARAMETRIC_PC_CASES);
  const answer = round3(6 * entry.ay * entry.t / (entry.ax ** 2));
  const firstDerivative = round3(3 * entry.ay * entry.t ** 2 / entry.ax);
  return pcNumericWidget(
    `x(t) = ${parametricExpression(entry.ax, 1, entry.x0)} and y(t) = ${parametricExpression(entry.ay, 3, entry.y0)}. Find d²y/dx² at t = ${entry.t}. Give three decimals if needed.`,
    answer, [firstDerivative, round3(6 * entry.ay * entry.t / entry.ax), round3(6 * entry.ay / (entry.ax ** 2))],
    `Differentiate dy/dx with respect to t, then divide once more by dx/dt = ${entry.ax}.`,
  );
}

type ParametricArcCase = { ax: number; ay: number; upper: number; x0: number; y0: number };
const PARAMETRIC_ARC_CASES: readonly ParametricArcCase[] = [
  { ax: 3, ay: 4, upper: 1, x0: -2, y0: 1 }, { ax: 5, ay: 12, upper: 1, x0: 3, y0: -4 },
  { ax: 8, ay: 15, upper: 1, x0: -5, y0: 2 }, { ax: 7, ay: 24, upper: 1, x0: 4, y0: -3 },
  { ax: 20, ay: 21, upper: 1, x0: -1, y0: 5 }, { ax: 12, ay: 35, upper: 1, x0: 6, y0: -2 },
  { ax: 9, ay: 40, upper: 1, x0: -4, y0: 3 }, { ax: 28, ay: 45, upper: 1, x0: 2, y0: -6 },
  { ax: 3, ay: 4, upper: 2, x0: 5, y0: 1 }, { ax: 5, ay: 12, upper: 2, x0: -3, y0: 4 },
  { ax: 8, ay: 15, upper: 2, x0: 1, y0: -5 }, { ax: 7, ay: 24, upper: 2, x0: -6, y0: 2 },
];

const arcPrompt = (entry: ParametricArcCase) =>
  `The curve has x(t) = ${parametricExpression(entry.ax, 1, entry.x0)} and y(t) = ${parametricExpression(entry.ay, 1, entry.y0)} for 0 ≤ t ≤ ${entry.upper}.`;

function parametricArcNumericWidget(rand: Rand): GeneratedIntegrationVariant {
  const entry = pick(rand, PARAMETRIC_ARC_CASES);
  const speed = Math.hypot(entry.ax, entry.ay);
  const answer = round3(speed * entry.upper);
  return pcNumericWidget(
    `${arcPrompt(entry)} Find its arc length.`, answer,
    [round3((entry.ax + entry.ay) * entry.upper), round3((entry.ax ** 2 + entry.ay ** 2) * entry.upper), entry.upper],
    `The speed is √(${entry.ax}² + ${entry.ay}²) = ${speed}; integrate that constant speed over ${entry.upper} time unit${entry.upper === 1 ? "" : "s"}.`,
  );
}

function parametricArcMcqWidget(rand: Rand): GeneratedIntegrationVariant {
  const entry = pick(rand, PARAMETRIC_ARC_CASES);
  const speed = Math.hypot(entry.ax, entry.ay);
  const answer = round3(speed * entry.upper);
  const values = pcChoiceValues(answer, [
    (entry.ax + entry.ay) * entry.upper,
    (entry.ax ** 2 + entry.ay ** 2) * entry.upper,
    answer + entry.upper,
  ]);
  return integrationMcq(rand, `${arcPrompt(entry)} Which arc length is correct?`, values.map((value) => ({
    label: `arc length = ${value}`,
    correct: value === answer,
    feedback: value === answer
      ? `The constant speed ${speed} integrated over ${entry.upper} time unit${entry.upper === 1 ? "" : "s"} gives ${answer}.`
      : `Use the magnitude √((dx/dt)² + (dy/dt)²), then multiply by the full parameter interval.`,
  })));
}

const PARAMETRIC_PC01_BUILDERS: Record<string, (rand: Rand) => GeneratedIntegrationVariant> = {
  "parametric-polar-calculus__pc-parametric-derivative__numeric": parametricDerivativeNumericWidget,
  "parametric-polar-calculus__pc-parametric-derivative__mcq": parametricDerivativeMcqWidget,
  "parametric-polar-calculus__pc-second-derivative__numeric": parametricSecondDerivativeWidget,
  "parametric-polar-calculus__pc-arc-length__numeric": parametricArcNumericWidget,
  "parametric-polar-calculus__pc-arc-length__mcq": parametricArcMcqWidget,
};

const INTEGRATION_APPLICATION_BUILDERS: Record<string, (rand: Rand) => GeneratedIntegrationVariant> = {

  "integration-applications__ia-area-between__mcq": areaBetweenMcqWidget,
  "integration-applications__ia-area-between__numeric": areaBetweenNumericWidget,
  "integration-applications__ia-disc__mcq": discMcqWidget,
  "integration-applications__ia-disc__numeric": discNumericWidget,
  "integration-applications__ia-washer__mcq": washerMcqWidget,
  "integration-applications__ia-washer__numeric": washerNumericWidget,
  "integration-applications__ia-washer__matchPairs": washerMatchWidget,
  "integration-applications__ia-cross-sections__mcq": crossSectionMcqWidget,
  "integration-applications__ia-cross-sections__numeric": crossSectionNumericWidget,
  "integration-applications__ia-average-value__mcq": averageValueMcqWidget,
  "integration-applications__ia-average-value__numeric": averageValueNumericWidget,
};

const INTEGRATION_FOUNDATIONS_BUILDERS: Record<string, (rand: Rand) => GeneratedIntegrationVariant> = {
  "integration-accumulation__in-riemann__numeric": riemannNumericWidget,
  "integration-accumulation__in-riemann__mcq": riemannMcqWidget,
  "integration-accumulation__in-squeeze__numeric": squeezeNumericWidget,
  "integration-accumulation__in-squeeze__mcq": squeezeMcqWidget,
  "integration-accumulation__in-definite-integral__numeric": definiteIntegralNumericWidget,
  "integration-accumulation__in-definite-integral__matchPairs": definiteIntegralMatchWidget,
  "integration-accumulation__in-signed-area__mcq": signedAreaMcqWidget,
  "integration-accumulation__in-accumulation__numeric": accumulationNumericWidget,
  "integration-accumulation__in-accumulation__mcq": accumulationMcqWidget,
  "integration-accumulation__in-read-accumulation__mcq": readAccumulationMcqWidget,
  "integration-accumulation__in-read-accumulation__matchPairs": readAccumulationMatchWidget,
  "integration-accumulation__in-signed-area__numeric": signedAreaNumericWidget,
  "integration-accumulation__in-read-accumulation__numeric": readAccumulationNumericWidget,
  "integration-accumulation__in-net-change__mcq": netChangeMcqWidget,
  "integration-accumulation__in-net-change__numeric": netChangeNumericWidget,
  "integration-accumulation__in-ftc1__mcq": ftc1McqWidget,
  "integration-accumulation__in-ftc1__numeric": ftc1NumericWidget,
  "integration-accumulation__in-ftc2__numeric": ftc2NumericWidget,
  "integration-accumulation__in-ftc2__mcq": ftc2McqWidget,
  "integration-accumulation__in-ftc-unified__dragOrder": ftcUnifiedDragOrderWidget,
  "integration-accumulation__in-ftc-unified__dragBucket": ftcUnifiedDragBucketWidget,
  "integration-accumulation__in-ftc-unified__numeric": ftcUnifiedNumericWidget,
  "integration-accumulation__in-antiderivative__mcq": antiderivativeMcqWidget,
  "integration-accumulation__in-antiderivative__numeric": antiderivativeNumericWidget,
  "integration-accumulation__in-constant-of-integration__numeric": constantOfIntegrationNumericWidget,
  "integration-accumulation__in-constant-of-integration__mcq": constantOfIntegrationMcqWidget,
  "integration-accumulation__in-library__mcq": libraryMcqWidget,
  "integration-accumulation__in-library__numeric": libraryNumericWidget,
  "integration-accumulation__in-usub__mcq": uSubMcqWidget,
  "integration-accumulation__in-usub__numeric": (rand) => powerSubstitutionNumeric(rand, "usub"),
  "integration-accumulation__in-usub-limits__mcq": uSubLimitsMcqWidget,
  "integration-accumulation__in-usub-limits__numeric": uSubLimitsNumericWidget,
  "integration-accumulation__in-choosing-u__mcq": choosingUMcqWidget,
  "integration-accumulation__in-choosing-u__numeric": (rand) => powerSubstitutionNumeric(rand, "choosing"),
  "integration-accumulation__in-choosing-u__dragBucket": choosingUDragBucketWidget,
};

const TARGET_GENERATOR = "g13-curve-analysis";
const TARGET_FORM = "curve-analysis__ca-first-derivative-test__numeric";
const TARGET_SIGN_FORM = "curve-analysis__ca-first-derivative-test__signChart";
const INFLECTION_FORM = "curve-analysis__ca-inflection__numeric";
const READ_F_PRIME_FORM = "curve-analysis__ca-read-f-prime__numeric";
const THREE_CHARTS_FORM = "curve-analysis__ca-three-charts__numeric";
const OPTIMISATION_FORM = "curve-analysis__ca-optimisation-applied__numeric";
const DERIVATIVE_NUMERIC_BUILDERS: Record<string, (rand: Rand) => ReturnType<typeof nestedProductWidget>> = {
  "derivative-rules__dr-chain-nested__numeric": nestedProductWidget,
  "derivative-rules__dr-critical-point__numeric": criticalPointWidget,
  "derivative-rules__dr-derivative-function__numeric": derivativeEvaluationWidget,
  "derivative-rules__dr-differentiability__numeric": differentiabilityCountWidget,
  "derivative-rules__dr-exp-log__numeric": exponentialDerivativeWidget,
  "derivative-rules__dr-implicit__numeric": implicitCircleWidget,
  "derivative-rules__dr-sign-of-derivative__numeric": signOfDerivativeWidget,
  "derivative-rules__dr-tangent-line__numeric": tangentInterceptWidget,
};
const CONTEXT_NUMERIC_BUILDERS: Record<string, (rand: Rand) => ReturnType<typeof choosingRelationWidget>> = {
  "derivatives-in-context__dc-choosing-relation__numeric": choosingRelationWidget,
  "derivatives-in-context__dc-motion__numeric": motionWidget,
  "derivatives-in-context__dc-speed__numeric": speedIntervalsWidget,
  "derivatives-in-context__dc-distance__numeric": distanceWidget,
  "derivatives-in-context__dc-related-rates__numeric": relatedRatesWidget,
  "derivatives-in-context__dc-ladder__numeric": ladderWidget,
  "derivatives-in-context__dc-linearisation__numeric": linearisationWidget,
  "derivatives-in-context__dc-linearisation-limits__numeric": linearisationLimitsWidget,
  "derivatives-in-context__dc-lhopital__numeric": lhopitalWidget,
  "derivatives-in-context__dc-other-forms__numeric": otherLimitFormsWidget,
};
const CONTEXT_STRUCTURED_BUILDERS = {
  "derivatives-in-context__dc-differentials__numeric": differentialLabGenerated,
} as const;
const DIFFERENTIAL_EQUATION_BUILDERS: Record<string, (rand: Rand) => ReturnType<typeof slopeFieldWidget>> = {
  "differential-equations__de-slope-field__numeric": slopeFieldWidget,
  "differential-equations__de-separable__numeric": separableWidget,
  "differential-equations__de-logistic__numeric": logisticWidget,
  "differential-equations__de-equilibrium__numeric": equilibriumWidget,
  "differential-equations__de-exponential__numeric": exponentialModelWidget,
  "differential-equations__de-euler__numeric": eulerWidget,
};

export const CALCULUS_GENERATORS = AUTHORED_CALCULUS_GENERATORS.map((generator) => {
  if (generator.tag === "g13-parametric-polar-calculus") {
    return {
      ...generator,
      gen: (rand: Rand, band: Band = "core", form = "default") => {
        const builder = PARAMETRIC_PC01_BUILDERS[form];
        if (!builder) return generator.gen(rand, band, form);
        const generated = builder(rand);
        return { tag: generator.tag, widget: generated.widget, answer: generated.answer };
      },
    };
  }
  if (generator.tag === "g13-integration-applications") {
    return {
      ...generator,
      gen: (rand: Rand, band: Band = "core", form = "default") => {
        const builder = INTEGRATION_APPLICATION_BUILDERS[form];
        if (!builder) return generator.gen(rand, band, form);
        const generated = builder(rand);
        return { tag: generator.tag, widget: generated.widget, answer: generated.answer };
      },
    };
  }
  if (generator.tag === "g13-integration-accumulation") {
    return {
      ...generator,
      gen: (rand: Rand, band: Band = "core", form = "default") => {
        const builder = INTEGRATION_FOUNDATIONS_BUILDERS[form];
        if (!builder) return generator.gen(rand, band, form);
        const generated = builder(rand);
        return { tag: generator.tag, widget: generated.widget, answer: generated.answer };
      },
    };
  }
  if (generator.tag === "g13-differential-equations") {
    return {
      ...generator,
      gen: (rand: Rand, band: Band = "core", form = "default") => {
        const builder = DIFFERENTIAL_EQUATION_BUILDERS[form];
        if (!builder) return generator.gen(rand, band, form);
        const widget = builder(rand);
        return { tag: generator.tag, widget, answer: widget.answer };
      },
    };
  }
  if (generator.tag === "g13-derivatives-in-context") {
    return {
      ...generator,
      gen: (rand: Rand, band: Band = "core", form = "default") => {
        const structuredBuilder = CONTEXT_STRUCTURED_BUILDERS[form as keyof typeof CONTEXT_STRUCTURED_BUILDERS];
        if (structuredBuilder) {
          const generated = structuredBuilder(rand);
          return { tag: generator.tag, widget: generated.widget, answer: generated.answer };
        }
        const builder = CONTEXT_NUMERIC_BUILDERS[form];
        if (!builder) return generator.gen(rand, band, form);
        const widget = builder(rand);
        return { tag: generator.tag, widget, answer: widget.answer };
      },
    };
  }
  if (generator.tag === "g13-derivative-rules") {
    return {
      ...generator,
      gen: (rand: Rand, band: Band = "core", form = "default") => {
        const builder = DERIVATIVE_NUMERIC_BUILDERS[form];
        if (!builder) return generator.gen(rand, band, form);
        const widget = builder(rand);
        return { tag: generator.tag, widget, answer: widget.answer };
      },
    };
  }
  if (generator.tag !== TARGET_GENERATOR) return generator;
  return {
    ...generator,
    gen: (rand: Rand, band: Band = "core", form = "default") => {
      const widget = form === TARGET_FORM
        ? firstDerivativeMaximumWidget(rand)
        : form === TARGET_SIGN_FORM
          ? firstDerivativeSignChartWidget(rand)
          : form === INFLECTION_FORM
            ? inflectionCountWidget(rand)
            : form === READ_F_PRIME_FORM
              ? readFirstDerivativeWidget(rand)
              : form === THREE_CHARTS_FORM
                ? threeChartsWidget(rand)
                : form === OPTIMISATION_FORM
                  ? optimisationAppliedWidget(rand)
                  : null;
      if (!widget) return generator.gen(rand, band, form);
      if (widget.type === "signChart") {
        return {
          tag: TARGET_GENERATOR,
          widget,
          answer: signsForRoots(
            widget.roots.find((root) => root.mult === 2)!.x,
            widget.roots.find((root) => root.mult === 1)!.x,
          ),
        };
      }
      return { tag: TARGET_GENERATOR, widget, answer: widget.answer };
    },
  };
});
