import templates from "./calculusVariantTemplates.json";
import { generatorsFromAuthoredBank } from "./authoredTemplateVariants";

const AUTHORED_CALCULUS_GENERATORS = generatorsFromAuthoredBank(
  templates as Record<string, Record<string, any[]>>,
  "Grade 13 Calculus isomorphic authored variants"
);

type Rand = () => number;
type Band = "support" | "core" | "stretch";

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
    prompt: `f(x) = x(${a}x + ${b})^${n}. Find f'(0).`,
    answer,
    tolerance: 0,
    unit: "",
    commonErrors: traps.map((value) => ({ value, feedback: "Use the product rule before substituting x = 0; the term multiplied by x then vanishes." })),
    fallbackFeedback: `f'(x) = (${a}x + ${b})^${n} + x * ${n * a}(${a}x + ${b})^${n - 1}. At x = 0, only ${b}^${n} remains, giving ${answer}.`,
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
    prompt: `A differentiable function has f'(x) = ${chosen.derivative}. How many real critical points does f have?`,
    answer: chosen.answer,
    tolerance: 0,
    unit: "",
    commonErrors: [0, 1, 2, 3].filter((value) => value !== chosen.answer).slice(0, 3).map((value) => ({
      value,
      feedback: "Critical points occur at the real zeros of f'. Count distinct real solutions, including an even-multiplicity zero once.",
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
    prompt: `For f(x) = x^${n}, find f'(${x}).`,
    answer,
    tolerance: 0,
    unit: "",
    commonErrors: traps.map((value) => ({ value, feedback: `Use the power rule f'(x) = ${n}x^${n - 1}, then substitute x = ${x}.` })),
    fallbackFeedback: `f'(x) = ${n}x^${n - 1}, so f'(${x}) = ${answer}.`,
    successFeedback: `The power rule gives f'(${x}) = ${n}(${x})^${n - 1} = ${answer}.`,
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
    prompt: `f(x) = e^(${coefficient}x). Find f'(0).`,
    answer: coefficient,
    tolerance: 0,
    unit: "",
    commonErrors: [0, 1, Math.E].filter((value) => value !== coefficient).map((value) => ({
      value,
      feedback: `The chain rule gives f'(x) = ${coefficient}e^(${coefficient}x), and e^0 = 1.`,
    })),
    fallbackFeedback: `f'(x) = ${coefficient}e^(${coefficient}x), so f'(0) = ${coefficient}.`,
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
    prompt: `f'(x) = ${scale}(x^2 - ${square}). How many integer values of x have f falling (f'(x) < 0)?`,
    answer,
    tolerance: 0,
    unit: "",
    commonErrors: [2 * radius + 1, 2 * radius, radius]
      .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
      .map((value) => ({ value, feedback: `The derivative is negative only for -${radius} < x < ${radius}; the endpoints make f' equal zero.` })),
    fallbackFeedback: `f'(x) < 0 exactly when -${radius} < x < ${radius}, which contains ${answer} integers.`,
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

export const CALCULUS_GENERATORS = AUTHORED_CALCULUS_GENERATORS.map((generator) => {
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
