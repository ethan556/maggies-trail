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
    prompt: `The ${quantity} changes as its radius grows at dr/dt = ${chosen.rate} cm/s. Find ${symbol} when r = ${chosen.radius}, as a multiple of pi (give only the coefficient).`,
    answer,
    tolerance: 0,
    unit: `pi ${unit}`,
    commonErrors: traps.filter((value, index, all) => value !== answer && all.indexOf(value) === index).map((value) => ({
      value,
      feedback: `Differentiate the ${chosen.shape === "circle" ? "area" : "volume"} formula with respect to time, including the factor dr/dt, before substituting the radius.`,
    })),
    fallbackFeedback: chosen.shape === "circle"
      ? `dA/dt = 2 pi r(dr/dt) = 2 pi(${chosen.radius})(${chosen.rate}) = ${answer} pi.`
      : `dV/dt = 4 pi r^2(dr/dt) = 4 pi(${chosen.radius})^2(${chosen.rate}) = ${answer} pi.`,
    successFeedback: `The chain rule gives ${symbol} = ${answer} pi ${unit}.`,
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
      fallbackFeedback: `y = sqrt(${chosen.length}^2 - ${chosen.foot}^2) = ${chosen.height} ft.`,
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
      prompt: `For f(x) = sqrt(x), find f'(${input}) to three decimal places.`,
      answer,
      tolerance: 0.0005,
      unit: "",
      commonErrors: [chosen.root, 0.5, 2 * chosen.root]
        .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
        .map((value) => ({ value, feedback: "The derivative is 1/(2 sqrt(x)); substitute the perfect-square input after differentiating." })),
      fallbackFeedback: `f'(${input}) = 1/(2 * ${chosen.root}) = ${answer}.`,
      successFeedback: `The slope at x = ${input} is ${answer}.`,
    };
  }
  if (chosen.kind === "sqrtEstimate") {
    const base = chosen.root ** 2;
    const target = base + chosen.delta;
    const answer = Number((chosen.root + chosen.delta / (2 * chosen.root)).toFixed(4));
    return {
      type: "numeric" as const,
      prompt: `Use the tangent to sqrt(x) at x = ${base} to estimate sqrt(${target}). Give four decimal places.`,
      answer,
      tolerance: 0.00005,
      unit: "",
      commonErrors: [chosen.root + chosen.delta, chosen.root, chosen.root + 2 * chosen.root * chosen.delta]
        .filter((value, index, all) => value !== answer && all.indexOf(value) === index)
        .map((value) => ({ value, feedback: `Use L(x) = ${chosen.root} + (x - ${base})/(2 * ${chosen.root}); scale the small input change by the tangent slope.` })),
      fallbackFeedback: `L(${target}) = ${chosen.root} + ${chosen.delta}/(2 * ${chosen.root}) = ${answer}.`,
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
      .map((value) => ({ value, feedback: "The linear estimate is f(a) + f'(a)(x - a); multiply the slope by the small change, not by the full input." })),
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
    const answer = 3 * chosen.side ** 2 * chosen.error;
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

export const CALCULUS_GENERATORS = AUTHORED_CALCULUS_GENERATORS.map((generator) => {
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
