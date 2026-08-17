import templates from "./precalculusVariantTemplates.json";
import { generatorsFromAuthoredBank } from "./authoredTemplateVariants";

const AUTHORED_PRECALCULUS_GENERATORS = generatorsFromAuthoredBank(
  templates as Record<string, Record<string, any[]>>,
  "Grade 12 Precalculus isomorphic authored variants"
);

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

export const PRECALCULUS_GENERATORS = AUTHORED_PRECALCULUS_GENERATORS.map((generator) =>
  generator.tag === "g12-conic-sections"
    ? {
        ...generator,
        gen: (rand: () => number, band?: "support" | "core" | "stretch", requestedForm = "default") => {
          if (requestedForm === PARABOLA_DEFINITION_FORM) return parabolaDefinitionVariant(rand);
          if (requestedForm === HYPERBOLA_ECCENTRICITY_FORM) return hyperbolaEccentricityVariant(rand);
          return generator.gen(rand, band, requestedForm);
        },
      }
    : generator,
);
