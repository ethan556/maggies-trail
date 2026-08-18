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

/* S245 / Phase 5. `cr-thales__numeric` previously had one pool row whose answer was always 90, so
 * every seed rebuilt the identical item. These cases keep one stable question job: use Thales to
 * set the inscribed angle equal to 90°, then solve the displayed linear equation. Varying both the
 * coefficient and constant changes the actual mathematics and answer, not merely point names. */
const THALES_LINEAR_CASES = [
  { coefficient: 2, constant: 10, solution: 40 },
  { coefficient: 3, constant: 18, solution: 24 },
  { coefficient: 4, constant: 10, solution: 20 },
  { coefficient: 5, constant: 15, solution: 15 },
  { coefficient: 6, constant: 18, solution: 12 },
  { coefficient: 7, constant: 20, solution: 10 },
  { coefficient: 8, constant: 18, solution: 9 },
  { coefficient: 9, constant: 18, solution: 8 },
  { coefficient: 10, constant: 20, solution: 7 },
  { coefficient: 12, constant: 18, solution: 6 },
] as const;

function thalesLinearWidget(rand: Rand): any {
  const chosen = pick(rand, THALES_LINEAR_CASES);
  const { coefficient, constant, solution } = chosen;
  if (coefficient * solution + constant !== 90) {
    throw new Error("Invalid cr-thales linear case: the inscribed angle must equal 90°");
  }
  return {
    type: "numeric",
    prompt: `AB is a diameter of a circle and C lies on the circle. If ∠ACB = (${coefficient}x + ${constant})°, find x.`,
    answer: solution,
    tolerance: 0.01,
    commonErrors: [
      {
        value: 90,
        feedback: "90° is the angle measure from Thales' theorem; the question asks for x in the angle expression.",
      },
      {
        value: 90 - constant,
        feedback: `After subtracting ${constant}, divide by the coefficient ${coefficient}; stopping early gives ${90 - constant}, not x.`,
      },
    ],
    fallbackFeedback: `Thales gives ∠ACB = 90°, so ${coefficient}x + ${constant} = 90 and x = ${solution}.`,
    successFeedback: `Thales makes the angle over diameter AB exactly 90°; solving ${coefficient}x + ${constant} = 90 gives x = ${solution}.`,
  };
}

const CHORD_ARC_MEASURES = [30, 40, 55, 65, 70, 75, 85, 100, 110, 135] as const;
function chordArcWidget(rand: Rand): any {
  const measure = pick(rand, CHORD_ARC_MEASURES);
  return {
    type: "numeric",
    prompt: `In one circle, chord AB cuts a ${measure}° arc. Congruent chord CD cuts an arc of how many degrees?`,
    answer: measure,
    tolerance: 0.01,
    commonErrors: [
      { value: measure * 2, feedback: "Doubling belongs to a central-versus-inscribed angle comparison; congruent chords copy their arc measures directly." },
      { value: measure / 2, feedback: "Halving belongs to an inscribed angle; congruent chords in one circle intercept congruent arcs." },
    ],
    fallbackFeedback: `Congruent chords intercept congruent arcs, so CD also cuts a ${measure}° arc.`,
    successFeedback: `The chord-arc correspondence copies the ${measure}° measure to the congruent chord CD.`,
  };
}

const CYCLIC_GIVEN_ANGLES = [62, 68, 74, 82, 95, 103, 112, 119, 126, 137] as const;
function cyclicQuadrilateralWidget(rand: Rand): any {
  const given = pick(rand, CYCLIC_GIVEN_ANGLES);
  const opposite = 180 - given;
  return {
    type: "numeric",
    prompt: `Cyclic quadrilateral ABCD has ∠A = ${given}°. Find the opposite angle ∠C.`,
    answer: opposite,
    tolerance: 0.01,
    commonErrors: [
      { value: given, feedback: "That copies the given angle; opposite angles in a cyclic quadrilateral are supplementary." },
      { value: 360 - given, feedback: "Using 360° treats one angle as the rest of the whole quadrilateral; the opposite pair totals 180°." },
    ],
    fallbackFeedback: `Opposite angles in a cyclic quadrilateral sum to 180°, so ∠C = 180° − ${given}° = ${opposite}°.`,
    successFeedback: `The cyclic-opposite-angle invariant gives ∠C = ${opposite}°.`,
  };
}

const SECTOR_ANGLE_CASES = [
  { radius: 6, areaPi: 4, angle: 40 },
  { radius: 6, areaPi: 6, angle: 60 },
  { radius: 6, areaPi: 8, angle: 80 },
  { radius: 6, areaPi: 10, angle: 100 },
  { radius: 6, areaPi: 12, angle: 120 },
  { radius: 6, areaPi: 15, angle: 150 },
  { radius: 9, areaPi: 9, angle: 40 },
  { radius: 9, areaPi: 18, angle: 80 },
  { radius: 9, areaPi: 27, angle: 120 },
  { radius: 9, areaPi: 36, angle: 160 },
] as const;
function sectorAreaWidget(rand: Rand): any {
  const { radius, areaPi, angle } = pick(rand, SECTOR_ANGLE_CASES);
  return {
    type: "numeric",
    prompt: `A sector of a radius-${radius} circle has area ${areaPi}π. Find its central angle in degrees.`,
    answer: angle,
    tolerance: 0.01,
    commonErrors: [
      { value: areaPi, feedback: "That reports the coefficient of π in the area, not the sector's degree measure." },
      { value: angle / 2, feedback: "The area fraction already matches the angle fraction; an extra halving changes the sector." },
    ],
    fallbackFeedback: `The whole-circle area is ${radius * radius}π, so the sector is ${areaPi}/${radius * radius} of 360° = ${angle}°.`,
    successFeedback: `Matching the area fraction to the angle fraction gives ${angle}°.`,
  };
}

const TANGENT_CHORD_ARCS = [60, 72, 84, 96, 110, 124, 140, 156, 180, 220] as const;
function tangentChordWidget(rand: Rand): any {
  const arc = pick(rand, TANGENT_CHORD_ARCS);
  const angle = arc / 2;
  return {
    type: "numeric",
    prompt: `A tangent and chord meet at the point of tangency and intercept a ${arc}° arc. Find the tangent-chord angle.`,
    answer: angle,
    tolerance: 0.01,
    commonErrors: [
      { value: arc, feedback: "That is the intercepted arc; a tangent-chord angle is half its intercepted arc." },
      { value: arc / 4, feedback: "That halves twice; the tangent-chord theorem requires one halving." },
    ],
    fallbackFeedback: `The tangent-chord angle is half the intercepted arc: ${arc}° ÷ 2 = ${angle}°.`,
    successFeedback: `Half of the ${arc}° intercepted arc is ${angle}°.`,
  };
}

function tangentPerpendicularWidget(rand: Rand): any {
  const chosen = pick(rand, THALES_LINEAR_CASES);
  const { coefficient, constant, solution } = chosen;
  return {
    type: "numeric",
    prompt: `Line ℓ is tangent to a circle at T, and OT is a radius. If the angle between ℓ and OT is (${coefficient}x + ${constant})°, find x.`,
    answer: solution,
    tolerance: 0.01,
    commonErrors: [
      { value: 90, feedback: "90° is the radius-tangent angle; solve the displayed expression to find x." },
      { value: 90 - constant, feedback: `After subtracting ${constant}, division by ${coefficient} is still required.` },
    ],
    fallbackFeedback: `A radius is perpendicular to a tangent at the contact point, so ${coefficient}x + ${constant} = 90 and x = ${solution}.`,
    successFeedback: `The radius-tangent angle is 90°, and the equation gives x = ${solution}.`,
  };
}

const EXTERNAL_SECANT_ANGLES = [30, 35, 40, 45, 50, 55, 60, 65, 70, 75] as const;
function externalSecantAngleWidget(rand: Rand): any {
  const answer = pick(rand, EXTERNAL_SECANT_ANGLES);
  const near = 20;
  const far = near + 2 * answer;
  return {
    type: "exactNumberLab",
    prompt: `Two secants from an external point intercept a far arc of ${far}° and a near arc of ${near}°. Find the external angle.`,
    task: "approximationEvaluate",
    values: [],
    approxConstants: [
      { id: "far", label: "far arc", value: far },
      { id: "near", label: "near arc", value: near },
    ],
    approxFormula: {
      op: "divide",
      left: {
        op: "subtract",
        left: { op: "const", id: "far" },
        right: { op: "const", id: "near" },
      },
      right: { op: "lit", value: 2 },
    },
    approxRound: 0,
    answerMode: "numeric",
    tolerance: 0.01,
    numericErrors: [
      { value: far - near, feedback: "That subtracts the arcs but omits the required halving." },
      { value: (far + near) / 2, feedback: "Half the sum is the inside-intersection rule; an outside vertex uses half the difference." },
    ],
    choices: [],
    authoredStages: [],
    requiredStageKeys: [],
    requiredExplorations: 1,
    explorationFeedback: "Inspect the far and near arcs before applying the outside-angle theorem.",
    fallbackFeedback: `An external secant angle is half the arc difference: (${far} − ${near}) ÷ 2 = ${answer}°.`,
    successFeedback: `Half the difference of the ${far}° and ${near}° arcs is ${answer}°.`,
  };
}

const INTERSECTING_CHORD_CASES = [
  { a: 3, b: 4, c: 2, answer: 6 },
  { a: 4, b: 6, c: 3, answer: 8 },
  { a: 5, b: 6, c: 3, answer: 10 },
  { a: 6, b: 8, c: 4, answer: 12 },
  { a: 7, b: 8, c: 4, answer: 14 },
  { a: 5, b: 9, c: 3, answer: 15 },
  { a: 8, b: 8, c: 4, answer: 16 },
  { a: 6, b: 9, c: 3, answer: 18 },
  { a: 8, b: 10, c: 4, answer: 20 },
  { a: 8, b: 12, c: 4, answer: 24 },
] as const;
function intersectingChordsWidget(rand: Rand): any {
  const { a, b, c, answer } = pick(rand, INTERSECTING_CHORD_CASES);
  return {
    type: "exactNumberLab",
    prompt: `Two chords cross inside a circle. One chord is split into ${a} and ${b}; the other into ${c} and x. Find x.`,
    task: "approximationEvaluate",
    values: [],
    approxConstants: [
      { id: "a", label: "first piece", value: a },
      { id: "b", label: "second piece", value: b },
      { id: "c", label: "known piece of other chord", value: c },
    ],
    approxFormula: {
      op: "divide",
      left: { op: "multiply", left: { op: "const", id: "a" }, right: { op: "const", id: "b" } },
      right: { op: "const", id: "c" },
    },
    approxRound: 0,
    answerMode: "numeric",
    tolerance: 0.01,
    numericErrors: [
      { value: a + b - c, feedback: "That combines lengths additively; intersecting chords equate the products of their segment pairs." },
      { value: a * b, feedback: "That is the common product, but x is the missing factor after division by the known partner segment." },
    ],
    choices: [],
    authoredStages: [],
    requiredStageKeys: [],
    requiredExplorations: 1,
    explorationFeedback: "Inspect both segment pairs before applying the intersecting-chords product.",
    fallbackFeedback: `Intersecting chords give ${a}·${b} = ${c}x, so x = ${answer}.`,
    successFeedback: `The equal-products invariant gives x = (${a}·${b})/${c} = ${answer}.`,
  };
}

const TANGENT_RIGHT_TRIANGLES = [
  { distance: 5, radius: 3, tangent: 4 },
  { distance: 10, radius: 6, tangent: 8 },
  { distance: 13, radius: 5, tangent: 12 },
  { distance: 13, radius: 12, tangent: 5 },
  { distance: 15, radius: 9, tangent: 12 },
  { distance: 17, radius: 8, tangent: 15 },
  { distance: 17, radius: 15, tangent: 8 },
  { distance: 25, radius: 7, tangent: 24 },
  { distance: 25, radius: 15, tangent: 20 },
  { distance: 29, radius: 20, tangent: 21 },
] as const;
function tangentLengthWidget(rand: Rand): any {
  const { distance, radius, tangent } = pick(rand, TANGENT_RIGHT_TRIANGLES);
  return {
    type: "exactNumberLab",
    prompt: `Point P is ${distance} units from a circle's center O. The radius to tangency point T is ${radius}. Find tangent length PT.`,
    task: "approximationEvaluate",
    values: [],
    approxConstants: [
      { id: "d", label: "center-to-point distance", value: distance },
      { id: "r", label: "radius", value: radius },
    ],
    approxFormula: {
      op: "sqrt",
      arg: {
        op: "subtract",
        left: { op: "multiply", left: { op: "const", id: "d" }, right: { op: "const", id: "d" } },
        right: { op: "multiply", left: { op: "const", id: "r" }, right: { op: "const", id: "r" } },
      },
    },
    approxRound: 0,
    answerMode: "numeric",
    tolerance: 0.01,
    numericErrors: [
      { value: distance - radius, feedback: "Subtracting the side lengths ignores the right triangle formed by radius OT and tangent PT." },
      { value: distance + radius, feedback: "Adding the lengths does not satisfy the Pythagorean relationship in triangle OPT." },
    ],
    choices: [],
    authoredStages: [],
    requiredStageKeys: [],
    requiredExplorations: 1,
    explorationFeedback: "Inspect the radius-tangent right angle before calculating the missing leg.",
    fallbackFeedback: `OT is perpendicular to PT, so PT = √(${distance}² − ${radius}²) = ${tangent}.`,
    successFeedback: `The radius-tangent right triangle gives PT = ${tangent}.`,
  };
}

const TANGENT_SEGMENT_LENGTHS = [6, 8, 9, 11, 12, 14, 15, 18, 20, 24] as const;
function equalTangentsWidget(rand: Rand): any {
  const length = pick(rand, TANGENT_SEGMENT_LENGTHS);
  return {
    type: "numeric",
    prompt: `Two tangent segments are drawn from external point P to the same circle. One has length ${length}. Find the other tangent length.`,
    answer: length,
    tolerance: 0.01,
    commonErrors: [
      { value: length * 2, feedback: "That totals the two segments; the theorem says each individual tangent segment has the given length." },
      { value: length / 2, feedback: "That splits the given segment; tangents from one external point are congruent, not halves." },
    ],
    fallbackFeedback: `Tangent segments from the same external point are congruent, so the other length is ${length}.`,
    successFeedback: `The equal-tangents theorem gives the second segment length as ${length}.`,
  };
}

const CIRCLE_FORM_BUILDERS: Record<string, (rand: Rand) => any> = {
  "cr-thales__numeric": thalesLinearWidget,
  "cr-chord-arc__numeric": chordArcWidget,
  "cr-cyclic-quad__numeric": cyclicQuadrilateralWidget,
  "cr-sector-area__numeric": sectorAreaWidget,
  "cr-tangent-chord__numeric": tangentChordWidget,
  "cr-tangent-perp__numeric": tangentPerpendicularWidget,
  "cr-secant-angles__numeric": externalSecantAngleWidget,
  "cr-power-point__numeric": intersectingChordsWidget,
  "cr-tangent-apps__numeric": tangentLengthWidget,
  "cr-two-tangent__numeric": equalTangentsWidget,
};

/* S246 / Phase 5. The authored `cp-perp-at-point__numeric` pool repeated one
 * fixed 180 / 2 question for every seed, and its generated feedback had also
 * drifted into an unrelated Thales explanation. These cases keep the
 * perpendicular-at-a-point invariant (the constructed angle is 90 degrees)
 * while varying the mathematics learners must do with that invariant. */
const PERPENDICULAR_AT_POINT_CASES = [
  { job: "equation", coefficient: 2, constant: 10, answer: 40 },
  { job: "equation", coefficient: 3, constant: 18, answer: 24 },
  { job: "equation", coefficient: 4, constant: 10, answer: 20 },
  { job: "equation", coefficient: 5, constant: 15, answer: 15 },
  { job: "equation", coefficient: 6, constant: 18, answer: 12 },
  { job: "partition", given: 17, answer: 73 },
  { job: "partition", given: 28, answer: 62 },
  { job: "partition", given: 34, answer: 56 },
  { job: "partition", given: 41, answer: 49 },
  { job: "partition", given: 63, answer: 27 },
] as const;

function perpendicularAtPointWidget(rand: Rand): any {
  const chosen = pick(rand, PERPENDICULAR_AT_POINT_CASES);
  if (chosen.job === "equation") {
    const { coefficient, constant, answer } = chosen;
    if (coefficient * answer + constant !== 90) {
      throw new Error("Invalid perpendicular-at-point equation case: the angle must equal 90 degrees");
    }
    return {
      type: "numeric",
      prompt: `A perpendicular raised at P makes a 90° angle with line ℓ. One angle is labelled (${coefficient}x + ${constant})°. Find x.`,
      answer,
      tolerance: 0,
      commonErrors: [
        {
          value: 90,
          feedback: "90° is the angle made by the perpendicular; the question asks for x in the angle expression.",
        },
        {
          value: 90 - constant,
          feedback: `After subtracting ${constant}, divide by ${coefficient} to isolate x.`,
        },
      ],
      fallbackFeedback: `A perpendicular makes a 90° angle, so ${coefficient}x + ${constant} = 90 and x = ${answer}.`,
      successFeedback: `The construction fixes the angle at 90°; solving ${coefficient}x + ${constant} = 90 gives x = ${answer}.`,
    };
  }

  const { given, answer } = chosen;
  if (given + answer !== 90) {
    throw new Error("Invalid perpendicular-at-point partition case: the two parts must total 90 degrees");
  }
  return {
    type: "numeric",
    prompt: `A perpendicular at P makes a 90° angle. A ray inside that angle splits it into two parts. One part is ${given}°. How many degrees is the other part?`,
    answer,
    tolerance: 0,
    commonErrors: [
      {
        value: given,
        feedback: "That copies the given part. The two parts together must fill the 90° angle.",
      },
      {
        value: 90,
        feedback: "90° is the whole angle made by the perpendicular. Subtract the known part to find the other part.",
      },
    ],
    fallbackFeedback: `The perpendicular makes 90°, so the missing part is 90° − ${given}° = ${answer}°.` ,
    successFeedback: `The two parts fill the right angle: ${given}° + ${answer}° = 90°.` ,
  };
}

const PERPENDICULAR_FROM_POINT_CASES = [
  { orientation: "horizontal", line: -2, pointX: -6, pointY: 5, answer: -6 },
  { orientation: "horizontal", line: 1, pointX: -4, pointY: 7, answer: -4 },
  { orientation: "horizontal", line: -3, pointX: -1, pointY: 4, answer: -1 },
  { orientation: "horizontal", line: 0, pointX: 2, pointY: 6, answer: 2 },
  { orientation: "horizontal", line: 2, pointX: 5, pointY: 9, answer: 5 },
  { orientation: "vertical", line: 3, pointX: -4, pointY: -5, answer: -5 },
  { orientation: "vertical", line: -1, pointX: 6, pointY: -2, answer: -2 },
  { orientation: "vertical", line: 4, pointX: -3, pointY: 1, answer: 1 },
  { orientation: "vertical", line: -2, pointX: 5, pointY: 4, answer: 4 },
  { orientation: "vertical", line: 1, pointX: -5, pointY: 7, answer: 7 },
] as const;

function perpendicularFromPointWidget(rand: Rand): any {
  const chosen = pick(rand, PERPENDICULAR_FROM_POINT_CASES);
  const { orientation, line, pointX, pointY, answer } = chosen;
  if (orientation === "horizontal") {
    if (answer !== pointX) throw new Error("A perpendicular to a horizontal line must preserve x");
    return {
      type: "numeric",
      prompt: `Line ℓ is horizontal: y = ${line}. Point P is (${pointX}, ${pointY}). A perpendicular from P meets ℓ at F. What is the x-coordinate of F?`,
      answer,
      tolerance: 0,
      commonErrors: [
        { value: pointY, feedback: `${pointY} is P's y-coordinate. A vertical drop preserves the x-coordinate ${pointX}.` },
        { value: line, feedback: `${line} is the line's y-coordinate. The question asks for the foot's x-coordinate.` },
      ],
      fallbackFeedback: `A perpendicular to a horizontal line is vertical, so F keeps P's x-coordinate: x = ${answer}.`,
      successFeedback: `The vertical drop from P preserves x, so the foot is (${answer}, ${line}).`,
    };
  }

  if (answer !== pointY) throw new Error("A perpendicular to a vertical line must preserve y");
  return {
    type: "numeric",
    prompt: `Line ℓ is vertical: x = ${line}. Point P is (${pointX}, ${pointY}). A perpendicular from P meets ℓ at F. What is the y-coordinate of F?`,
    answer,
    tolerance: 0,
    commonErrors: [
      { value: pointX, feedback: `${pointX} is P's x-coordinate. A horizontal path to the vertical line preserves y = ${pointY}.` },
      { value: line, feedback: `${line} is the line's x-coordinate. The question asks for the foot's y-coordinate.` },
    ],
    fallbackFeedback: `A perpendicular to a vertical line is horizontal, so F keeps P's y-coordinate: y = ${answer}.`,
    successFeedback: `The horizontal path from P preserves y, so the foot is (${line}, ${answer}).`,
  };
}

const CO_INTERIOR_GIVEN_ANGLES = [32, 38, 47, 55, 63, 71, 82, 104, 119, 137] as const;

function parallelThroughPointWidget(rand: Rand): any {
  const given = pick(rand, CO_INTERIOR_GIVEN_ANGLES);
  const answer = 180 - given;
  return {
    type: "numeric",
    prompt: `A transversal crosses two parallel lines. One interior angle is ${given}°. Find its co-interior (same-side interior) partner.`,
    answer,
    tolerance: 0,
    commonErrors: [
      {
        value: given,
        feedback: "Equal measures belong to corresponding or alternate interior angles. Co-interior angles are supplementary.",
      },
      {
        value: 360 - given,
        feedback: "A full turn is not needed. Co-interior angles fill a straight angle, so their sum is 180°.",
      },
    ],
    fallbackFeedback: `Co-interior angles between parallel lines are supplementary: 180° − ${given}° = ${answer}°.` ,
    successFeedback: `${given}° + ${answer}° = 180°, so the co-interior relationship is satisfied.` ,
  };
}

const HEXAGON_ANGLE_CASES = [
  { angleType: "central", target: 60, coefficient: 2, constant: 10, answer: 25 },
  { angleType: "central", target: 60, coefficient: 3, constant: 15, answer: 15 },
  { angleType: "central", target: 60, coefficient: 4, constant: 12, answer: 12 },
  { angleType: "central", target: 60, coefficient: 5, constant: 10, answer: 10 },
  { angleType: "central", target: 60, coefficient: 6, constant: 6, answer: 9 },
  { angleType: "interior", target: 120, coefficient: 2, constant: 20, answer: 50 },
  { angleType: "interior", target: 120, coefficient: 3, constant: 30, answer: 30 },
  { angleType: "interior", target: 120, coefficient: 4, constant: 40, answer: 20 },
  { angleType: "interior", target: 120, coefficient: 5, constant: 30, answer: 18 },
  { angleType: "interior", target: 120, coefficient: 6, constant: 24, answer: 16 },
] as const;

function regularHexagonWidget(rand: Rand): any {
  const chosen = pick(rand, HEXAGON_ANGLE_CASES);
  const { angleType, target, coefficient, constant, answer } = chosen;
  if (coefficient * answer + constant !== target) {
    throw new Error("Invalid regular-hexagon angle equation");
  }
  return {
    type: "numeric",
    prompt: `A regular hexagon has ${angleType} angles of ${target}°. One ${angleType} angle is labelled (${coefficient}x + ${constant})°. Find x.`,
    answer,
    tolerance: 0,
    commonErrors: [
      {
        value: target,
        feedback: `${target}° is the ${angleType} angle measure; the question asks for x in the expression.`,
      },
      {
        value: target - constant,
        feedback: `After subtracting ${constant}, divide by ${coefficient} to isolate x.`,
      },
    ],
    fallbackFeedback: `For a regular hexagon, the ${angleType} angle is ${target}°, so ${coefficient}x + ${constant} = ${target} and x = ${answer}.`,
    successFeedback: `The hexagon fixes this ${angleType} angle at ${target}°; solving the equation gives x = ${answer}.`,
  };
}

const INSCRIBED_POLYGON_ANGLE_CASES = [
  { polygon: "square", target: 90, coefficient: 2, constant: 10, answer: 40 },
  { polygon: "square", target: 90, coefficient: 3, constant: 18, answer: 24 },
  { polygon: "square", target: 90, coefficient: 4, constant: 10, answer: 20 },
  { polygon: "square", target: 90, coefficient: 5, constant: 15, answer: 15 },
  { polygon: "square", target: 90, coefficient: 6, constant: 18, answer: 12 },
  { polygon: "equilateral triangle", target: 120, coefficient: 2, constant: 20, answer: 50 },
  { polygon: "equilateral triangle", target: 120, coefficient: 3, constant: 30, answer: 30 },
  { polygon: "equilateral triangle", target: 120, coefficient: 4, constant: 28, answer: 23 },
  { polygon: "equilateral triangle", target: 120, coefficient: 5, constant: 30, answer: 18 },
  { polygon: "equilateral triangle", target: 120, coefficient: 6, constant: 24, answer: 16 },
] as const;

function squareTriangleWidget(rand: Rand): any {
  const chosen = pick(rand, INSCRIBED_POLYGON_ANGLE_CASES);
  const { polygon, target, coefficient, constant, answer } = chosen;
  if (coefficient * answer + constant !== target) throw new Error("Invalid inscribed-polygon angle equation");
  return {
    type: "numeric",
    prompt: `The vertices of an inscribed ${polygon} divide the circle equally, so each central angle is ${target}°. If one is labelled (${coefficient}x + ${constant})°, find x.`,
    answer,
    tolerance: 0,
    commonErrors: [
      { value: target, feedback: `${target}° is the central angle measure; solve the labelled expression to find x.` },
      { value: target - constant, feedback: `After subtracting ${constant}, divide by ${coefficient}.` },
    ],
    fallbackFeedback: `${coefficient}x + ${constant} = ${target}, so x = ${answer}.`,
    successFeedback: `Equal circle divisions fix the central angle at ${target}°; the equation gives x = ${answer}.`,
  };
}

const COUNTEREXAMPLE_LISTS = [
  [2, 4, 7, 8],
  [2, 3, 5, 8],
  [1, 2, 3, 4, 5, 6],
  [1, 3, 5, 7, 8],
  [10, 12, 14, 21],
  [6, 9, 12, 15, 18],
  [11, 13, 16, 18, 20],
  [22, 24, 27, 31, 34, 36],
  [40, 41, 42, 43, 44, 45],
  [51, 52, 53, 55, 58, 60],
] as const;

function conjectureCounterexampleWidget(rand: Rand): any {
  const values = pick(rand, COUNTEREXAMPLE_LISTS);
  const answer = values.filter((value) => value % 2 !== 0).length;
  return {
    type: "numeric",
    prompt: `Conjecture: “Every integer in this list is even.” In the list [${values.join(", ")}], how many displayed values are counterexamples?`,
    answer,
    tolerance: 0,
    commonErrors: [
      { value: 0, feedback: "Any odd value is a counterexample to the claim that every listed integer is even." },
      { value: values.length, feedback: "Count only the odd values that contradict the conjecture, not every value in the list." },
    ],
    fallbackFeedback: `The odd values are the counterexamples, and there are ${answer}.`,
    successFeedback: `${answer} displayed value${answer === 1 ? "" : "s"} contradict${answer === 1 ? "s" : ""} the universal claim.`,
  };
}

const CO_INTERIOR_EQUATION_CASES = [
  { a: 2, b: 10, c: 3, d: 0, answer: 34 },
  { a: 2, b: 7, c: 4, d: 5, answer: 28 },
  { a: 3, b: 4, c: 5, d: 8, answer: 21 },
  { a: 4, b: 10, c: 5, d: 8, answer: 18 },
  { a: 3, b: 9, c: 6, d: 0, answer: 19 },
  { a: 2, b: 6, c: 5, d: 6, answer: 24 },
  { a: 4, b: 12, c: 6, d: 8, answer: 16 },
  { a: 5, b: 5, c: 6, d: 10, answer: 15 },
  { a: 3, b: 4, c: 7, d: 6, answer: 17 },
  { a: 4, b: 12, c: 7, d: 14, answer: 14 },
] as const;

function converseCoInteriorWidget(rand: Rand): any {
  const { a, b, c, d, answer } = pick(rand, CO_INTERIOR_EQUATION_CASES);
  if ((a + c) * answer + b + d !== 180) throw new Error("Invalid co-interior converse equation");
  return {
    type: "numeric",
    prompt: `Two lines are cut by a transversal. Co-interior angles are (${a}x + ${b})° and (${c}x + ${d})°. Find x so the converse proves the lines parallel.`,
    answer,
    tolerance: 0,
    commonErrors: [
      { value: b + d, feedback: "That combines only the constants. Set the full angle sum equal to 180°." },
      { value: 180 - b - d, feedback: `After subtracting the constants, divide by ${a + c}.` },
    ],
    fallbackFeedback: `The converse needs supplementary angles: (${a}x + ${b}) + (${c}x + ${d}) = 180, so x = ${answer}.`,
    successFeedback: `At x = ${answer}, the two co-interior angles sum to 180°, proving the lines parallel.`,
  };
}

const ALTERNATE_INTERIOR_EQUATION_CASES = [
  { a: 2, b: 15, c: 4, d: 25, x: 20 },
  { a: 2, b: 10, c: 3, d: 8, x: 18 },
  { a: 3, b: 12, c: 5, d: 16, x: 14 },
  { a: 4, b: 6, c: 6, d: 18, x: 12 },
  { a: 2, b: 20, c: 5, d: 10, x: 10 },
  { a: 5, b: 5, c: 7, d: 15, x: 10 },
  { a: 3, b: 9, c: 6, d: 18, x: 9 },
  { a: 4, b: 12, c: 8, d: 20, x: 8 },
  { a: 5, b: 10, c: 10, d: 20, x: 6 },
  { a: 6, b: 6, c: 9, d: 15, x: 7 },
] as const;

function provingTransversalWidget(rand: Rand): any {
  const { a, b, c, d, x } = pick(rand, ALTERNATE_INTERIOR_EQUATION_CASES);
  const answer = a * x + b;
  if (answer !== c * x - d) throw new Error("Invalid alternate-interior equation");
  return {
    type: "numeric",
    prompt: `Across parallel lines, alternate interior angles are (${a}x + ${b})° and (${c}x − ${d})°. Find the measure of either angle.`,
    answer,
    tolerance: 0,
    commonErrors: [
      { value: x, feedback: `${x} is the value of x. Substitute it to find the requested angle measure.` },
      { value: 180 - answer, feedback: "That is the supplement. Alternate interior angles across parallel lines are equal." },
    ],
    fallbackFeedback: `Set the angles equal to get x = ${x}; substituting gives ${answer}° for either angle.`,
    successFeedback: `The alternate interior angles match at ${answer}°.`,
  };
}

const TRANSVERSAL_RELATION_CASES = [
  { relation: "corresponding", given: 28, answer: 28 },
  { relation: "corresponding", given: 42, answer: 42 },
  { relation: "corresponding", given: 57, answer: 57 },
  { relation: "corresponding", given: 73, answer: 73 },
  { relation: "corresponding", given: 116, answer: 116 },
  { relation: "co-interior", given: 31, answer: 149 },
  { relation: "co-interior", given: 49, answer: 131 },
  { relation: "co-interior", given: 64, answer: 116 },
  { relation: "co-interior", given: 108, answer: 72 },
  { relation: "co-interior", given: 137, answer: 43 },
] as const;

function transversalFamilyWidget(rand: Rand): any {
  const { relation, given, answer } = pick(rand, TRANSVERSAL_RELATION_CASES);
  const equal = relation === "corresponding";
  return {
    type: "numeric",
    prompt: `A transversal crosses parallel lines. One angle is ${given}°. Find its ${relation} partner.`,
    answer,
    tolerance: 0,
    commonErrors: [
      { value: equal ? 180 - given : given, feedback: equal ? "That is the supplement; corresponding angles are equal." : "That copies the given angle; co-interior angles are supplementary." },
      { value: 360 - given, feedback: "A full turn is not the relevant relationship for this angle pair." },
    ],
    fallbackFeedback: equal
      ? `Corresponding angles are equal, so the partner is ${answer}°.`
      : `Co-interior angles sum to 180°, so the partner is ${answer}°.` ,
    successFeedback: equal
      ? `The corresponding angle is also ${answer}°.`
      : `${given}° + ${answer}° = 180°.` ,
  };
}

function verticalAnglesWidget(rand: Rand): any {
  const equationJob = rand() < 0.5;
  if (equationJob) {
    const chosen = pick(rand, ALTERNATE_INTERIOR_EQUATION_CASES.slice(0, 5));
    const { a, b, c, d, x } = chosen;
    return {
      type: "numeric",
      prompt: `Two vertical angles are labelled (${a}x + ${b})° and (${c}x − ${d})°. Find x.`,
      answer: x,
      tolerance: 0,
      commonErrors: [
        { value: a * x + b, feedback: "That is the angle measure after substitution; the question asks for x." },
        { value: 180 - (a * x + b), feedback: "That uses a supplementary relationship. Vertical angles are equal." },
      ],
      fallbackFeedback: `Vertical angles are equal, so ${a}x + ${b} = ${c}x − ${d} and x = ${x}.`,
      successFeedback: `The two expressions are equal at x = ${x}.`,
    };
  }
  const chosen = pick(rand, CO_INTERIOR_EQUATION_CASES.slice(0, 5));
  const { a, b, c, d, answer: x } = chosen;
  const angle = a * x + b;
  return {
    type: "numeric",
    prompt: `Two adjacent angles form a linear pair: (${a}x + ${b})° and (${c}x + ${d})°. Find the angle vertical to the first angle.`,
    answer: angle,
    tolerance: 0,
    commonErrors: [
      { value: x, feedback: "That is x. Substitute it into the first expression to find the requested angle." },
      { value: 180 - angle, feedback: "That is the adjacent angle. The vertical angle equals the first angle." },
    ],
    fallbackFeedback: `The linear pair gives x = ${x}; the first and its vertical angle measure ${angle}°.` ,
    successFeedback: `After solving the linear pair, the vertical angle matches the first at ${angle}°.` ,
  };
}

const CONSTRUCTION_FORM_BUILDERS: Record<string, (rand: Rand) => any> = {
  "cp-perp-at-point__numeric": perpendicularAtPointWidget,
  "cp-perp-from-point__numeric": perpendicularFromPointWidget,
  "cp-parallel-through-point__numeric": parallelThroughPointWidget,
  "cp-hexagon__numeric": regularHexagonWidget,
  "cp-square-triangle__numeric": squareTriangleWidget,
  "cp-conjecture-proof__numeric": conjectureCounterexampleWidget,
  "cp-converses__numeric": converseCoInteriorWidget,
  "cp-proving-transversal__numeric": provingTransversalWidget,
  "cp-transversal-family__numeric": transversalFamilyWidget,
  "cp-vertical-angles__numeric": verticalAnglesWidget,
};

/* S246 / Phase 5. The coordinate-proof numeric pools contained only one to
 * three frozen questions per form. These builders keep each form's proof job
 * stable while varying the actual coordinates, equation, and answer. Every
 * answer is independently reconstructed from the learner-visible prompt in
 * geometryIndependent.cjs. */
const COORDINATE_VECTOR_CASES = [
  { a: 1, b: 2 },
  { a: 2, b: 3 },
  { a: 1, b: 4 },
  { a: 3, b: 4 },
  { a: 2, b: 5 },
  { a: 1, b: 6 },
  { a: 4, b: 5 },
  { a: 5, b: 5 },
  { a: 5, b: 6 },
  { a: 1, b: 8 },
] as const;

const COORDINATE_TRIPLES = [
  { a: 3, b: 4, c: 5 },
  { a: 5, b: 12, c: 13 },
  { a: 8, b: 15, c: 17 },
  { a: 7, b: 24, c: 25 },
  { a: 20, b: 21, c: 29 },
  { a: 12, b: 35, c: 37 },
  { a: 9, b: 40, c: 41 },
  { a: 28, b: 45, c: 53 },
  { a: 11, b: 60, c: 61 },
  { a: 33, b: 56, c: 65 },
] as const;

const CIRCLE_COEFFICIENT_CASES = [
  { d: -4, e: 6, f: -12 },
  { d: 6, e: -8, f: 9 },
  { d: -10, e: -2, f: -23 },
  { d: 8, e: 4, f: -29 },
  { d: -12, e: 10, f: 12 },
  { d: 2, e: -14, f: 14 },
  { d: -16, e: -6, f: 24 },
  { d: 4, e: 18, f: 21 },
  { d: -14, e: 12, f: 4 },
  { d: 10, e: 16, f: 25 },
] as const;

function coordinateCircleCompleteSquareWidget(rand: Rand): any {
  const { d, e, f } = pick(rand, CIRCLE_COEFFICIENT_CASES);
  const answer = (d / 2) ** 2 + (e / 2) ** 2 - f;
  return {
    type: "numeric",
    prompt: `A circle has equation x² + y² + Dx + Ey + F = 0 with D = ${d}, E = ${e}, and F = ${f}. After completing the square, find r².`,
    answer,
    tolerance: 0,
    commonErrors: [
      { value: Math.abs(f), feedback: "The constant alone is not r²; include both half-coefficient squares before subtracting F." },
      { value: (d / 2) ** 2 + (e / 2) ** 2 + f, feedback: "The expanded constant moves to the other side, so the formula subtracts F." },
    ],
    fallbackFeedback: `r² = (D/2)² + (E/2)² − F = (${d}/2)² + (${e}/2)² − (${f}) = ${answer}.`,
    successFeedback: `Completing both squares gives r² = ${answer}.`,
  };
}

function coordinateCircleEquationWidget(rand: Rand): any {
  const { a, b, c } = pick(rand, COORDINATE_TRIPLES);
  const h = Math.floor(rand() * 7) - 3;
  const k = Math.floor(rand() * 7) - 3;
  const x = h + a;
  const y = k + b;
  const answer = c * c;
  return {
    type: "numeric",
    prompt: `A circle is centered at (${h}, ${k}) and passes through (${x}, ${y}). Find r² in its standard equation.`,
    answer,
    tolerance: 0,
    commonErrors: [
      { value: c, feedback: "That is r. The standard equation asks for the squared radius r²." },
      { value: a + b, feedback: "Adding coordinate gaps does not give squared distance; square and add the gaps." },
    ],
    fallbackFeedback: `The coordinate gaps are ${a} and ${b}, so r² = ${a}² + ${b}² = ${answer}.`,
    successFeedback: `The center-to-point squared distance is ${answer}, so the circle's right side is r² = ${answer}.`,
  };
}

function coordinateCirclePositionWidget(rand: Rand): any {
  const { a, b, c } = pick(rand, COORDINATE_TRIPLES);
  const h = Math.floor(rand() * 7) - 3;
  const k = Math.floor(rand() * 7) - 3;
  const x = h - a;
  const y = k + b;
  const answer = c * c;
  return {
    type: "numeric",
    prompt: `For a circle centered at (${h}, ${k}), evaluate (x − h)² + (y − k)² at the point (${x}, ${y}).`,
    answer,
    tolerance: 0,
    commonErrors: [
      { value: c, feedback: "That is the distance, but the expression evaluates to the squared distance." },
      { value: a + b, feedback: "The circle expression squares each coordinate gap before adding." },
    ],
    fallbackFeedback: `The gaps have magnitudes ${a} and ${b}, so the value is ${a}² + ${b}² = ${answer}.`,
    successFeedback: `Substitution gives the squared center-to-point distance ${answer}.`,
  };
}

function coordinateClassifyQuadrilateralWidget(rand: Rand): any {
  const { a, b } = pick(rand, COORDINATE_VECTOR_CASES);
  const answer = a * a + b * b;
  return {
    type: "numeric",
    prompt: `Square ABCD has A(0, 0), B(${a}, ${b}), and D(${-b}, ${a}). Compute the common side length squared.`,
    answer,
    tolerance: 0,
    commonErrors: [
      { value: a + b, feedback: "Coordinate changes are not side lengths; square the horizontal and vertical changes." },
      { value: 2 * answer, feedback: "That combines two equal sides. The question asks for one side length squared." },
    ],
    fallbackFeedback: `AB² = ${a}² + ${b}² = ${answer}; AD has the same squared length and is perpendicular to AB.`,
    successFeedback: `Both adjacent side vectors have squared length ${answer}, supporting the square classification.`,
  };
}

function coordinateClassifyTriangleWidget(rand: Rand): any {
  const { a, b } = pick(rand, COORDINATE_VECTOR_CASES);
  const legSquared = a * a + b * b;
  const answer = 2 * legSquared;
  return {
    type: "numeric",
    prompt: `Right-isosceles triangle ABC has A(0, 0), B(${a}, ${b}), and C(${-b}, ${a}). Compute hypotenuse BC².`,
    answer,
    tolerance: 0,
    commonErrors: [
      { value: legSquared, feedback: "That is one leg squared. The right-isosceles hypotenuse squared is the sum of both equal leg squares." },
      { value: 2 * (a + b), feedback: "Adding coordinate gaps does not apply the distance formula." },
    ],
    fallbackFeedback: `AB² = AC² = ${legSquared}; the Pythagorean theorem gives BC² = ${legSquared} + ${legSquared} = ${answer}.`,
    successFeedback: `The equal perpendicular legs produce hypotenuse squared ${answer}.`,
  };
}

function coordinateDistanceApplicationWidget(rand: Rand): any {
  const { a, b, c } = pick(rand, COORDINATE_TRIPLES);
  const answer = 2 * a + 2 * c;
  return {
    type: "numeric",
    prompt: `Find the perimeter of the isosceles triangle with vertices (0, 0), (${2 * a}, 0), and (${a}, ${b}).`,
    answer,
    tolerance: 0,
    commonErrors: [
      { value: 2 * a + c, feedback: "That counts only one slanted side; the triangle has two congruent slanted sides." },
      { value: 2 * a + 2 * b, feedback: "The vertical height is not a side length; use the distance formula for each slanted side." },
    ],
    fallbackFeedback: `Each slanted side is √(${a}² + ${b}²) = ${c}; perimeter = ${2 * a} + ${c} + ${c} = ${answer}.`,
    successFeedback: `The two distance-formula sides and the base total ${answer}.`,
  };
}

function coordinateGeneralProofWidget(rand: Rand): any {
  const { a, b, c } = pick(rand, COORDINATE_TRIPLES);
  return {
    type: "numeric",
    prompt: `Rectangle A(0, 0), B(${a}, 0), C(${a}, ${b}), D(0, ${b}) has two congruent diagonals. Find either diagonal length.`,
    answer: c,
    tolerance: 0,
    commonErrors: [
      { value: a + b, feedback: "That walks two sides. A diagonal is the hypotenuse formed by the width and height." },
      { value: c * c, feedback: "That is the diagonal length squared; take the square root for the length." },
    ],
    fallbackFeedback: `Each diagonal has length √(${a}² + ${b}²) = ${c}.`,
    successFeedback: `Both diagonals share the same run and rise magnitudes, so each measures ${c}.`,
  };
}

const PARALLEL_LINE_CASES = [
  { x0: 1, y0: 2, p: 1, q: 2, x1: 7 },
  { x0: 2, y0: -1, p: 3, q: 4, x1: 10 },
  { x0: -3, y0: 4, p: 2, q: 5, x1: 7 },
  { x0: 0, y0: -2, p: 5, q: 3, x1: 6 },
  { x0: 4, y0: 1, p: -2, q: 3, x1: 10 },
  { x0: -2, y0: 5, p: 4, q: 3, x1: 4 },
  { x0: 3, y0: -4, p: -3, q: 5, x1: 13 },
  { x0: 5, y0: 6, p: 7, q: 4, x1: 13 },
  { x0: -5, y0: -3, p: 3, q: 2, x1: 1 },
  { x0: 6, y0: 2, p: -5, q: 6, x1: 18 },
] as const;

function coordinateParallelProofWidget(rand: Rand): any {
  const { x0, y0, p, q, x1 } = pick(rand, PARALLEL_LINE_CASES);
  const answer = y0 + (p * (x1 - x0)) / q;
  return {
    type: "numeric",
    prompt: `A line through (${x0}, ${y0}) is parallel to a line of slope ${p}/${q}. Find its y-coordinate when x = ${x1}.`,
    answer,
    tolerance: 0,
    commonErrors: [
      { value: (p * (x1 - x0)) / q, feedback: "That is only the change in y; add it to the starting y-coordinate." },
      { value: y0 + (q * (x1 - x0)) / p, feedback: "That swaps rise and run. Parallel lines keep the stated slope p/q." },
    ],
    fallbackFeedback: `Use y − ${y0} = (${p}/${q})(x − ${x0}); at x = ${x1}, y = ${answer}.`,
    successFeedback: `The equal-slope equation gives y = ${answer}.`,
  };
}

const PARTITION_CASES = [
  { ax: 0, ay: 0, bx: 12, by: 6, m: 1, n: 2 },
  { ax: 2, ay: -1, bx: 14, by: 5, m: 1, n: 2 },
  { ax: -4, ay: 2, bx: 8, by: 8, m: 2, n: 1 },
  { ax: 1, ay: 3, bx: 13, by: 9, m: 3, n: 1 },
  { ax: -6, ay: 0, bx: 9, by: 5, m: 2, n: 3 },
  { ax: 3, ay: -4, bx: 18, by: 6, m: 3, n: 2 },
  { ax: -8, ay: 1, bx: 12, by: 11, m: 1, n: 4 },
  { ax: 5, ay: 2, bx: 20, by: 7, m: 4, n: 1 },
  { ax: -3, ay: -3, bx: 15, by: 9, m: 2, n: 1 },
  { ax: 4, ay: 8, bx: 24, by: -2, m: 3, n: 2 },
] as const;

function coordinatePartitionWidget(rand: Rand): any {
  const { ax, ay, bx, by, m, n } = pick(rand, PARTITION_CASES);
  const answer = (n * ax + m * bx) / (m + n);
  return {
    type: "numeric",
    prompt: `Point P divides A(${ax}, ${ay}) to B(${bx}, ${by}) internally in the ratio AP:PB = ${m}:${n}. Find P's x-coordinate.`,
    answer,
    tolerance: 0,
    commonErrors: [
      { value: (ax + bx) / 2, feedback: "That is the midpoint and works only for a 1:1 ratio." },
      { value: (m * ax + n * bx) / (m + n), feedback: "The endpoint weights are reversed; AP:PB weights B by AP and A by PB." },
    ],
    fallbackFeedback: `xP = (${n}·${ax} + ${m}·${bx})/(${m} + ${n}) = ${answer}.`,
    successFeedback: `The section formula places P at x = ${answer}.`,
  };
}

function coordinatePerpendicularProofWidget(rand: Rand): any {
  const { x0, y0, p, q, x1 } = pick(rand, PARALLEL_LINE_CASES);
  const answer = y0 - (q * (x1 - x0)) / p;
  return {
    type: "numeric",
    prompt: `A line through (${x0}, ${y0}) is perpendicular to a line of slope ${p}/${q}. Find its y-coordinate when x = ${x1}.`,
    answer,
    tolerance: 0,
    commonErrors: [
      { value: y0 + (p * (x1 - x0)) / q, feedback: "That keeps the original slope. A perpendicular line uses the negative reciprocal −q/p." },
      { value: y0 + (q * (x1 - x0)) / p, feedback: "The reciprocal also needs the opposite sign for a perpendicular line." },
    ],
    fallbackFeedback: `The perpendicular slope is −${q}/${p}; using point-slope form at x = ${x1} gives y = ${answer}.`,
    successFeedback: `The negative-reciprocal slope produces y = ${answer}.`,
  };
}

const SHOELACE_CASES = [
  { width: 3, height: 4, shear: 1 },
  { width: 5, height: 6, shear: 2 },
  { width: 7, height: 3, shear: -2 },
  { width: 8, height: 5, shear: 3 },
  { width: 9, height: 7, shear: -1 },
  { width: 10, height: 4, shear: 4 },
  { width: 11, height: 6, shear: -3 },
  { width: 12, height: 8, shear: 2 },
  { width: 13, height: 5, shear: -4 },
  { width: 14, height: 9, shear: 3 },
] as const;

function coordinateShoelaceWidget(rand: Rand): any {
  const { width, height, shear } = pick(rand, SHOELACE_CASES);
  const answer = width * height;
  return {
    type: "numeric",
    prompt: `Use the shoelace formula on parallelogram (0, 0), (${width}, 0), (${width + shear}, ${height}), (${shear}, ${height}). Find its area.`,
    answer,
    tolerance: 0,
    commonErrors: [
      { value: answer / 2, feedback: "That applies the final one-half twice. Shoelace already halves the cross-sum difference once." },
      { value: width + height, feedback: "Adding dimensions does not measure area; the shoelace cross-products produce the base-height product." },
    ],
    fallbackFeedback: `The shoelace difference is ${2 * answer}; half of it is ${answer} square units.`,
    successFeedback: `Shoelace confirms the parallelogram area ${width} × ${height} = ${answer}.`,
  };
}

const COORDINATE_FORM_BUILDERS: Record<string, (rand: Rand) => any> = {
  "cx-circle-cts__numeric": coordinateCircleCompleteSquareWidget,
  "cx-circle-eq__numeric": coordinateCircleEquationWidget,
  "cx-circle-position__numeric": coordinateCirclePositionWidget,
  "cx-classify-quad__numeric": coordinateClassifyQuadrilateralWidget,
  "cx-classify-tri__numeric": coordinateClassifyTriangleWidget,
  "cx-dist-apps__numeric": coordinateDistanceApplicationWidget,
  "cx-general-proof__numeric": coordinateGeneralProofWidget,
  "cx-parallel-proof__numeric": coordinateParallelProofWidget,
  "cx-partition__numeric": coordinatePartitionWidget,
  "cx-perp-proof__numeric": coordinatePerpendicularProofWidget,
  "cx-shoelace__numeric": coordinateShoelaceWidget,
};

/* S246 / Phase 5. The original transformation-rule forms were one- or two-row
 * template pools, so the learner could replay the same mathematics under many
 * seeds. These builders keep each form's question job stable while varying the
 * coordinates, motion, requested coordinate, correct result, and misconceptions. */
const signedTerm = (variable: "x" | "y", delta: number): string =>
  `${variable} ${delta < 0 ? "−" : "+"} ${Math.abs(delta)}`;
const pointLabel = (x: number, y: number): string => `(${x}, ${y})`;

type TranslationCase = { x: number; y: number; dx: number; dy: number; axis: "x" | "y" };
const TRANSLATION_CASES: readonly TranslationCase[] = [
  { x: 10, y: 2, dx: -4, dy: 7, axis: "x" },
  { x: -3, y: 8, dx: 6, dy: -5, axis: "y" },
  { x: 7, y: -4, dx: -9, dy: 3, axis: "x" },
  { x: -8, y: -2, dx: 5, dy: 11, axis: "y" },
  { x: 4, y: 9, dx: 7, dy: -12, axis: "x" },
  { x: 12, y: -7, dx: -8, dy: 4, axis: "y" },
  { x: -5, y: 6, dx: -3, dy: -9, axis: "x" },
  { x: 2, y: -11, dx: 10, dy: 6, axis: "y" },
  { x: -9, y: 3, dx: 12, dy: -8, axis: "x" },
  { x: 6, y: 5, dx: -11, dy: 9, axis: "y" },
  { x: 1, y: -8, dx: 4, dy: 13, axis: "x" },
  { x: -12, y: 7, dx: 9, dy: -6, axis: "y" },
] as const;

function translationNumericWidget(rand: Rand): any {
  const { x, y, dx, dy, axis } = pick(rand, TRANSLATION_CASES);
  const answer = axis === "x" ? x + dx : y + dy;
  const unchanged = axis === "x" ? x : y;
  const reversed = axis === "x" ? x - dx : y - dy;
  return {
    type: "numeric",
    prompt: `Translation (x, y) → (${signedTerm("x", dx)}, ${signedTerm("y", dy)}) sends P${pointLabel(x, y)} to P′. Find P′'s ${axis}-coordinate.`,
    answer,
    tolerance: 0,
    commonErrors: [
      { value: unchanged, feedback: `That keeps the original ${axis}-coordinate; apply the ${axis}-shift printed in the translation rule.` },
      { value: reversed, feedback: `That reverses the ${axis}-shift; preserve the sign shown in the translation rule before combining values.` },
    ],
    fallbackFeedback: `Substitute P into the rule's ${axis}-slot: the image's ${axis}-coordinate is ${answer}.`,
    successFeedback: `Applying the printed translation to P gives ${axis} = ${answer} for the image.`,
  };
}

function translationRuleLabel(dx: number, dy: number): string {
  return `(x, y) → (${signedTerm("x", dx)}, ${signedTerm("y", dy)})`;
}

function translationMcqWidget(rand: Rand): any {
  const { x, y, dx, dy } = pick(rand, TRANSLATION_CASES);
  const imageX = x + dx;
  const imageY = y + dy;
  return {
    type: "mcq",
    prompt: `A translation sends A${pointLabel(x, y)} to A′${pointLabel(imageX, imageY)}. Which rule describes the translation?`,
    options: [
      { id: "correct", label: translationRuleLabel(dx, dy), correct: true, feedback: `Image minus preimage gives the shift ⟨${dx}, ${dy}⟩, matching both coordinate changes.` },
      { id: "inverse", label: translationRuleLabel(-dx, -dy), correct: false, feedback: "This is the inverse motion from A′ back to A; subtract preimage coordinates from image coordinates instead." },
      { id: "swap", label: translationRuleLabel(dy, dx), correct: false, feedback: "This swaps the horizontal and vertical changes; keep each coordinate difference in its matching slot." },
      { id: "y-sign", label: translationRuleLabel(dx, -dy), correct: false, feedback: "The horizontal change matches, but the vertical direction is reversed from the movement shown by A and A′." },
    ],
  };
}

type ReflectionName = "the x-axis" | "the y-axis" | "the line y = x" | "the line y = −x";
const reflectPoint = (name: ReflectionName, x: number, y: number): [number, number] => {
  if (name === "the x-axis") return [x, -y];
  if (name === "the y-axis") return [-x, y];
  if (name === "the line y = x") return [y, x];
  return [-y, -x];
};
type ReflectionCase = { x: number; y: number; mirror: ReflectionName; axis: "x" | "y" };
const REFLECTION_CASES: readonly ReflectionCase[] = [
  { x: -4, y: 6, mirror: "the y-axis", axis: "x" },
  { x: 7, y: 3, mirror: "the line y = x", axis: "x" },
  { x: 5, y: -8, mirror: "the x-axis", axis: "y" },
  { x: -2, y: 9, mirror: "the line y = −x", axis: "x" },
  { x: 11, y: -3, mirror: "the y-axis", axis: "x" },
  { x: -6, y: -10, mirror: "the x-axis", axis: "y" },
  { x: 4, y: -7, mirror: "the line y = x", axis: "y" },
  { x: 8, y: 1, mirror: "the line y = −x", axis: "y" },
  { x: -9, y: 5, mirror: "the y-axis", axis: "x" },
  { x: 3, y: 12, mirror: "the x-axis", axis: "y" },
  { x: -8, y: 2, mirror: "the line y = x", axis: "x" },
  { x: 6, y: -5, mirror: "the line y = −x", axis: "y" },
] as const;

function reflectionNumericWidget(rand: Rand): any {
  const { x, y, mirror, axis } = pick(rand, REFLECTION_CASES);
  const [imageX, imageY] = reflectPoint(mirror, x, y);
  const answer = axis === "x" ? imageX : imageY;
  const unchanged = axis === "x" ? x : y;
  const otherCoordinate = axis === "x" ? y : x;
  const wrongRule = mirror === "the line y = x" || mirror === "the line y = −x" ? -answer : otherCoordinate;
  return {
    type: "numeric",
    prompt: `Reflect P${pointLabel(x, y)} across ${mirror}. Find P′'s ${axis}-coordinate.`,
    answer,
    tolerance: 0,
    commonErrors: [
      { value: unchanged, feedback: "That leaves the requested coordinate unchanged; apply the coordinate rule for the named mirror line." },
      { value: wrongRule, feedback: "That uses a different reflection rule; check whether the named mirror swaps coordinates, changes a sign, or does both." },
    ],
    fallbackFeedback: `Applying the reflection rule to P gives P′${pointLabel(imageX, imageY)}, so the requested coordinate is ${answer}.`,
    successFeedback: `The reflection maps P to P′${pointLabel(imageX, imageY)}, making the requested coordinate ${answer}.`,
  };
}

const REFLECTION_NAMES: readonly ReflectionName[] = ["the x-axis", "the y-axis", "the line y = x", "the line y = −x"];
function reflectionMcqWidget(rand: Rand): any {
  const { x, y, mirror } = pick(rand, REFLECTION_CASES.filter((entry) => entry.x !== entry.y && entry.x !== -entry.y));
  const [imageX, imageY] = reflectPoint(mirror, x, y);
  return {
    type: "mcq",
    prompt: `Point P${pointLabel(x, y)} maps to P′${pointLabel(imageX, imageY)} under a reflection. Which line is the mirror?`,
    options: REFLECTION_NAMES.map((name) => ({
      id: name,
      label: name,
      correct: name === mirror,
      feedback: name === mirror
        ? `Applying this mirror's coordinate rule sends both coordinates of P exactly to P′.`
        : `Applying this mirror's coordinate rule does not send both coordinates of P to the displayed image P′.`,
    })),
  };
}

type RotationDegrees = 90 | 180 | 270;
const rotatePoint = (degrees: RotationDegrees, x: number, y: number): [number, number] =>
  degrees === 90 ? [-y, x] : degrees === 180 ? [-x, -y] : [y, -x];
type RotationCase = { x: number; y: number; degrees: RotationDegrees; axis: "x" | "y" };
const ROTATION_CASES: readonly RotationCase[] = [
  { x: 4, y: 1, degrees: 90, axis: "y" },
  { x: 1, y: 7, degrees: 270, axis: "y" },
  { x: -3, y: 8, degrees: 180, axis: "x" },
  { x: 6, y: -2, degrees: 90, axis: "x" },
  { x: -5, y: -9, degrees: 270, axis: "x" },
  { x: 10, y: 3, degrees: 180, axis: "y" },
  { x: -7, y: 4, degrees: 90, axis: "y" },
  { x: 2, y: -11, degrees: 270, axis: "y" },
  { x: 9, y: -6, degrees: 180, axis: "x" },
  { x: -8, y: 5, degrees: 90, axis: "x" },
  { x: 3, y: 12, degrees: 270, axis: "x" },
  { x: -4, y: -7, degrees: 180, axis: "y" },
] as const;

function rotationNumericWidget(rand: Rand): any {
  const { x, y, degrees, axis } = pick(rand, ROTATION_CASES);
  const [imageX, imageY] = rotatePoint(degrees, x, y);
  const answer = axis === "x" ? imageX : imageY;
  const unchanged = axis === "x" ? x : y;
  const signError = -answer;
  return {
    type: "numeric",
    prompt: `Rotate P${pointLabel(x, y)} ${degrees}° counterclockwise about the origin. Find P′'s ${axis}-coordinate.`,
    answer,
    tolerance: 0,
    commonErrors: [
      { value: unchanged, feedback: "That keeps the original coordinate; apply the full coordinate rule for the stated rotation angle." },
      { value: signError, feedback: "That has the correct magnitude but the opposite sign; trace the counterclockwise direction around the origin." },
    ],
    fallbackFeedback: `The ${degrees}° counterclockwise rule maps P to P′${pointLabel(imageX, imageY)}, so the requested coordinate is ${answer}.`,
    successFeedback: `Applying the ${degrees}° counterclockwise rule gives P′${pointLabel(imageX, imageY)} and the requested coordinate ${answer}.`,
  };
}

const rotationLabel = (degrees: RotationDegrees): string => `${degrees}° counterclockwise about the origin`;
function rotationMcqWidget(rand: Rand): any {
  const { x, y, degrees } = pick(rand, ROTATION_CASES.filter((entry) => entry.x !== 0 && entry.y !== 0 && Math.abs(entry.x) !== Math.abs(entry.y)));
  const [imageX, imageY] = rotatePoint(degrees, x, y);
  const labels = ([90, 180, 270] as const).map(rotationLabel);
  return {
    type: "mcq",
    prompt: `A rotation about the origin sends P${pointLabel(x, y)} to P′${pointLabel(imageX, imageY)}. Which rotation was applied?`,
    options: [
      ...labels.map((label, index) => ({
        id: label,
        label,
        correct: ([90, 180, 270] as const)[index] === degrees,
        feedback: ([90, 180, 270] as const)[index] === degrees
          ? "This rotation's coordinate rule sends both coordinates of P exactly to the displayed image."
          : "This rotation's coordinate rule sends P to a different ordered pair than the displayed image.",
      })),
      { id: "reflection", label: "reflection across the y-axis", correct: false, feedback: "A reflection is a different rigid motion; compare both coordinate changes with the three origin-rotation rules." },
    ],
  };
}

type CompositionCase = TranslationCase & { degrees: RotationDegrees };
const COMPOSITION_CASES: readonly CompositionCase[] = [
  { x: 2, y: 3, dx: 4, dy: -1, degrees: 90, axis: "x" },
  { x: -5, y: 4, dx: 3, dy: 2, degrees: 180, axis: "y" },
  { x: 6, y: -2, dx: -4, dy: 5, degrees: 270, axis: "x" },
  { x: -3, y: -7, dx: 8, dy: 3, degrees: 90, axis: "y" },
  { x: 9, y: 1, dx: -2, dy: -6, degrees: 180, axis: "x" },
  { x: 4, y: -8, dx: 5, dy: 4, degrees: 270, axis: "y" },
  { x: -6, y: 5, dx: -3, dy: 7, degrees: 90, axis: "x" },
  { x: 7, y: -4, dx: 2, dy: 9, degrees: 180, axis: "y" },
  { x: -8, y: -1, dx: 6, dy: -5, degrees: 270, axis: "x" },
  { x: 3, y: 10, dx: -7, dy: -2, degrees: 90, axis: "y" },
  { x: -2, y: 6, dx: 9, dy: -4, degrees: 180, axis: "x" },
  { x: 5, y: -9, dx: -8, dy: 6, degrees: 270, axis: "y" },
] as const;

function compositionResult(entry: CompositionCase): [number, number] {
  return rotatePoint(entry.degrees, entry.x + entry.dx, entry.y + entry.dy);
}

function compositionNumericWidget(rand: Rand): any {
  const entry = pick(rand, COMPOSITION_CASES);
  const { x, y, dx, dy, degrees, axis } = entry;
  const translated: [number, number] = [x + dx, y + dy];
  const [finalX, finalY] = compositionResult(entry);
  const answer = axis === "x" ? finalX : finalY;
  const stoppedEarly = axis === "x" ? translated[0] : translated[1];
  const rotatedOnly = rotatePoint(degrees, x, y);
  const skippedTranslation = axis === "x" ? rotatedOnly[0] : rotatedOnly[1];
  return {
    type: "numeric",
    prompt: `Start at P${pointLabel(x, y)}. Apply translation (x, y) → (${signedTerm("x", dx)}, ${signedTerm("y", dy)}), then rotate ${degrees}° counterclockwise about the origin. Find the final ${axis}-coordinate.`,
    answer,
    tolerance: 0,
    commonErrors: [
      { value: stoppedEarly, feedback: "That is the coordinate after the translation only; the stated rotation must still act on the intermediate image." },
      { value: skippedTranslation, feedback: "That rotates the starting point and skips the translation; apply both motions in the printed order." },
    ],
    fallbackFeedback: `The translation gives ${pointLabel(...translated)}; rotating that image ${degrees}° gives ${pointLabel(finalX, finalY)}, so the final ${axis}-coordinate is ${answer}.`,
    successFeedback: `Applying both motions in order gives the final image ${pointLabel(finalX, finalY)} and ${axis} = ${answer}.`,
  };
}

function compositionMcqWidget(rand: Rand): any {
  const entry = pick(rand, COMPOSITION_CASES);
  const { x, y, dx, dy, degrees } = entry;
  const translated: [number, number] = [x + dx, y + dy];
  const correct = compositionResult(entry);
  const rotatedOnly = rotatePoint(degrees, x, y);
  const reverseOrder: [number, number] = [rotatedOnly[0] + dx, rotatedOnly[1] + dy];
  const candidates = [correct, translated, rotatedOnly, reverseOrder];
  if (new Set(candidates.map(([px, py]) => `${px},${py}`)).size !== candidates.length) {
    throw new Error("Composition case does not produce four distinct diagnostic outcomes");
  }
  return {
    type: "mcq",
    prompt: `Start at P${pointLabel(x, y)}. Apply translation (x, y) → (${signedTerm("x", dx)}, ${signedTerm("y", dy)}), then rotate ${degrees}° counterclockwise about the origin. Where is the final image?`,
    options: [
      { id: "correct", label: pointLabel(...correct), correct: true, feedback: "This point results from applying the translation first and rotating its image second." },
      { id: "translated", label: pointLabel(...translated), correct: false, feedback: "This is the intermediate image after the translation; the rotation has not yet been applied." },
      { id: "rotated-only", label: pointLabel(...rotatedOnly), correct: false, feedback: "This rotates the starting point but omits the translation that must happen first." },
      { id: "reverse", label: pointLabel(...reverseOrder), correct: false, feedback: "This applies the two motions in reverse order; composition must follow the sequence printed in the prompt." },
    ],
  };
}

const REGULAR_POLYGON_SIDES = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 18] as const;
const regularPolygonLabel = (sides: number): string => `a regular ${sides}-gon`;

function lineSymmetryNumericWidget(rand: Rand): any {
  const sides = pick(rand, REGULAR_POLYGON_SIDES);
  return {
    type: "numeric",
    prompt: `How many lines of symmetry does a regular ${sides}-gon have?`,
    answer: sides,
    tolerance: 0,
    commonErrors: [
      { value: sides / 2, feedback: "That counts only half the matching folds; a regular polygon has one symmetry line associated with each vertex or side position." },
      { value: 2 * sides, feedback: "That double-counts each fold from its two directions; a line is counted once, not once from each end." },
    ],
    fallbackFeedback: `A regular n-gon has n lines of symmetry, so a regular ${sides}-gon has ${sides}.`,
    successFeedback: `One symmetry line corresponds to each repeated position, giving exactly ${sides} lines.`,
  };
}

function lineSymmetryMcqWidget(rand: Rand): any {
  const sides = pick(rand, REGULAR_POLYGON_SIDES);
  const candidates = [sides, sides - 1, sides + 1, sides + 3];
  return {
    type: "mcq",
    prompt: `Which regular polygon has exactly ${sides} lines of symmetry?`,
    options: candidates.map((candidate) => ({
      id: String(candidate),
      label: regularPolygonLabel(candidate),
      correct: candidate === sides,
      feedback: candidate === sides
        ? `A regular ${sides}-gon has one symmetry line for each of its ${sides} repeated positions.`
        : `A regular ${candidate}-gon has ${candidate} symmetry lines, so it does not match the requested count.`,
    })),
  };
}

const ROTATIONAL_POLYGON_SIDES = [3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24] as const;
const rotationalDescription = (sides: number, angle = 360 / sides): string =>
  `order ${sides}; smallest turn ${angle}°`;

function rotationalSymmetryNumericWidget(rand: Rand): any {
  const sides = pick(rand, ROTATIONAL_POLYGON_SIDES);
  const answer = 360 / sides;
  return {
    type: "numeric",
    prompt: `A regular ${sides}-gon has rotational symmetry of order ${sides}. What is its smallest positive matching rotation, in degrees?`,
    answer,
    tolerance: 0,
    commonErrors: [
      { value: sides, feedback: "That repeats the order as an angle; divide the full 360° turn by the number of matching positions." },
      { value: 180 / sides, feedback: "That divides a half-turn among the positions; rotational order partitions the full 360° turn." },
    ],
    fallbackFeedback: `Divide a full turn by the order: 360° ÷ ${sides} = ${answer}°.`,
    successFeedback: `The ${sides} matching positions divide 360° equally, so the smallest turn is ${answer}°.`,
  };
}

function rotationalSymmetryMcqWidget(rand: Rand): any {
  const sides = pick(rand, ROTATIONAL_POLYGON_SIDES);
  const angle = 360 / sides;
  return {
    type: "mcq",
    prompt: `Which statement correctly describes the rotational symmetry of a regular ${sides}-gon?`,
    options: [
      { id: "correct", label: rotationalDescription(sides), correct: true, feedback: `The ${sides} repeated positions divide the full 360° turn into steps of ${angle}°.` },
      { id: "double-angle", label: rotationalDescription(sides, 2 * angle), correct: false, feedback: "This skips the first matching position; the smallest positive turn is one full-turn step, not two." },
      { id: "double-order", label: rotationalDescription(2 * sides, angle), correct: false, feedback: "This doubles the order without adding matching positions; a regular n-gon has rotational order n." },
      { id: "one-less", label: rotationalDescription(sides - 1, angle), correct: false, feedback: "This removes one matching position while keeping the angle unchanged, so the order and turn no longer agree." },
    ],
  };
}

type CongruenceMeasureCase =
  | { kind: "angle"; motion: "reflection" | "rotation"; measure: number }
  | { kind: "segment"; motion: "translation" | "reflection" | "rotation"; measure: number }
  | { kind: "dilation"; scale: number; measure: number };
const CONGRUENCE_MEASURE_CASES: readonly CongruenceMeasureCase[] = [
  { kind: "angle", motion: "reflection", measure: 38 },
  { kind: "angle", motion: "rotation", measure: 52 },
  { kind: "segment", motion: "translation", measure: 7 },
  { kind: "segment", motion: "reflection", measure: 11 },
  { kind: "segment", motion: "rotation", measure: 14 },
  { kind: "dilation", scale: 2, measure: 3 },
  { kind: "dilation", scale: 3, measure: 4 },
  { kind: "angle", motion: "reflection", measure: 67 },
  { kind: "angle", motion: "rotation", measure: 105 },
  { kind: "segment", motion: "translation", measure: 18 },
  { kind: "dilation", scale: 4, measure: 5 },
  { kind: "segment", motion: "reflection", measure: 23 },
] as const;

function congruenceDefinitionNumericWidget(rand: Rand): any {
  const entry = pick(rand, CONGRUENCE_MEASURE_CASES);
  if (entry.kind === "dilation") {
    const answer = entry.scale * entry.measure;
    return {
      type: "numeric",
      prompt: `A dilation with scale factor ${entry.scale} maps a segment of length ${entry.measure} to its image. What is the image length?`,
      answer,
      tolerance: 0,
      commonErrors: [
        { value: entry.measure, feedback: "That treats the dilation as a rigid motion; a non-unit scale factor changes every segment length." },
        { value: entry.measure + entry.scale, feedback: "A scale factor multiplies lengths rather than adding its value to the original length." },
      ],
      fallbackFeedback: `Multiply the original length by the scale factor: ${entry.measure} × ${entry.scale} = ${answer}.`,
      successFeedback: `The dilation multiplies the segment length by ${entry.scale}, producing image length ${answer}.`,
    };
  }
  const noun = entry.kind === "angle" ? `an angle measuring ${entry.measure}°` : `a segment of length ${entry.measure}`;
  const requested = entry.kind === "angle" ? "image angle measure, in degrees" : "image segment length";
  return {
    type: "numeric",
    prompt: `A ${entry.motion} maps ${noun} to its image. What is the ${requested}?`,
    answer: entry.measure,
    tolerance: 0,
    commonErrors: [
      { value: 2 * entry.measure, feedback: "That changes the measure; a rigid motion preserves the size of every angle and segment." },
      { value: entry.kind === "angle" ? 180 - entry.measure : entry.measure / 2, feedback: "That applies an unrelated calculation; rigid motions copy the original measure exactly." },
    ],
    fallbackFeedback: `A ${entry.motion} is rigid, so the image keeps the original measure ${entry.measure}${entry.kind === "angle" ? "°" : ""}.`,
    successFeedback: `Rigid motions preserve ${entry.kind === "angle" ? "angle measures" : "segment lengths"}, so the image measure is ${entry.measure}.`,
  };
}

type CongruenceMotionCase =
  | { kind: "rigid"; description: string }
  | { kind: "dilation"; scale: number };
const CONGRUENCE_MOTION_CASES: readonly CongruenceMotionCase[] = [
  { kind: "rigid", description: "translation 6 units right and 2 units down" },
  { kind: "rigid", description: "reflection across the x-axis" },
  { kind: "rigid", description: "90° counterclockwise rotation about the origin" },
  { kind: "dilation", scale: 2 },
  { kind: "rigid", description: "translation 4 units left and 7 units up" },
  { kind: "rigid", description: "reflection across the line y = x" },
  { kind: "rigid", description: "180° rotation about the origin" },
  { kind: "dilation", scale: 3 },
  { kind: "rigid", description: "translation 9 units down" },
  { kind: "rigid", description: "reflection across the y-axis" },
  { kind: "rigid", description: "270° counterclockwise rotation about the origin" },
  { kind: "dilation", scale: 4 },
] as const;
const RIGID_CONGRUENCE_LABEL = "F and F′ are congruent because every distance and angle is preserved.";
const DILATION_NONCONGRUENCE_LABEL = "F and F′ are not necessarily congruent because the rule changes lengths.";

function congruenceDefinitionMcqWidget(rand: Rand): any {
  const entry = pick(rand, CONGRUENCE_MOTION_CASES);
  const motion = entry.kind === "rigid" ? entry.description : `dilation with scale factor ${entry.scale}`;
  const rigid = entry.kind === "rigid";
  return {
    type: "mcq",
    prompt: `A ${motion} maps figure F to figure F′. Which conclusion is justified?`,
    options: [
      { id: "rigid", label: RIGID_CONGRUENCE_LABEL, correct: rigid, feedback: rigid ? "The named rigid motion preserves all lengths and angles, which is exactly the congruence condition." : "A non-unit dilation changes lengths, so the rigid-motion congruence conclusion does not apply." },
      { id: "dilation", label: DILATION_NONCONGRUENCE_LABEL, correct: !rigid, feedback: rigid ? "The named transformation is rigid and preserves lengths, so this noncongruence conclusion conflicts with the motion." : "A non-unit dilation scales lengths, so congruence is not guaranteed even though shape is preserved." },
      { id: "area", label: "F and F′ are congruent only because their areas are equal.", correct: false, feedback: "Equal area alone is insufficient for congruence; the full distance-and-angle structure must be preserved." },
      { id: "orientation", label: "F and F′ cannot be congruent if their orientation changes.", correct: false, feedback: "Orientation may reverse under a reflection while all lengths and angles remain preserved." },
    ],
  };
}

type FindTranslationCase = TranslationCase & { px: number; py: number };
const FIND_TRANSLATION_CASES: readonly FindTranslationCase[] = [
  { x: 1, y: 3, dx: 5, dy: -2, px: 2, py: 7, axis: "x" },
  { x: -4, y: 6, dx: 3, dy: 8, px: 5, py: -1, axis: "y" },
  { x: 7, y: -2, dx: -6, dy: 4, px: -3, py: 9, axis: "x" },
  { x: -8, y: -5, dx: 9, dy: -3, px: 4, py: 6, axis: "y" },
  { x: 2, y: 10, dx: -7, dy: -5, px: 11, py: 3, axis: "x" },
  { x: 6, y: 4, dx: 2, dy: 7, px: -5, py: -6, axis: "y" },
  { x: -3, y: 8, dx: -4, dy: 6, px: 9, py: 2, axis: "x" },
  { x: 9, y: -7, dx: 5, dy: 3, px: -2, py: 12, axis: "y" },
  { x: -6, y: 1, dx: 8, dy: -9, px: 7, py: -4, axis: "x" },
  { x: 4, y: -9, dx: -3, dy: 11, px: -8, py: 5, axis: "y" },
  { x: 10, y: 2, dx: -12, dy: 5, px: 3, py: -7, axis: "x" },
  { x: -1, y: -4, dx: 6, dy: -8, px: 8, py: 9, axis: "y" },
] as const;

function findMotionNumericWidget(rand: Rand): any {
  const { x, y, dx, dy, px, py, axis } = pick(rand, FIND_TRANSLATION_CASES);
  const answer = axis === "x" ? px + dx : py + dy;
  const unchanged = axis === "x" ? px : py;
  const wrongShift = axis === "x" ? px + dy : py + dx;
  return {
    type: "numeric",
    prompt: `A translation sends A${pointLabel(x, y)} to A′${pointLabel(x + dx, y + dy)}. It sends P${pointLabel(px, py)} to P′. Find P′'s ${axis}-coordinate.`,
    answer,
    tolerance: 0,
    commonErrors: [
      { value: unchanged, feedback: "That leaves P unchanged; first recover the translation vector from A to A′, then apply it to P." },
      { value: wrongShift, feedback: "That applies the shift from the other coordinate; keep horizontal and vertical changes in their matching slots." },
    ],
    fallbackFeedback: `A to A′ gives vector ⟨${dx}, ${dy}⟩; applying it to P makes the requested coordinate ${answer}.`,
    successFeedback: `The same vector ⟨${dx}, ${dy}⟩ maps P to its image, giving ${axis} = ${answer}.`,
  };
}

type FindMotionName = "reflection across the x-axis" | "reflection across the y-axis" | "90° counterclockwise rotation about the origin" | "180° rotation about the origin";
const FIND_MOTION_NAMES: readonly FindMotionName[] = [
  "reflection across the x-axis",
  "reflection across the y-axis",
  "90° counterclockwise rotation about the origin",
  "180° rotation about the origin",
];
const FIND_MOTION_CASES: readonly { x: number; y: number; motion: FindMotionName }[] = [
  { x: 2, y: 7, motion: "reflection across the x-axis" },
  { x: -4, y: 9, motion: "reflection across the y-axis" },
  { x: 6, y: -3, motion: "90° counterclockwise rotation about the origin" },
  { x: -5, y: -8, motion: "180° rotation about the origin" },
  { x: 11, y: 4, motion: "reflection across the x-axis" },
  { x: -7, y: 3, motion: "reflection across the y-axis" },
  { x: 5, y: 12, motion: "90° counterclockwise rotation about the origin" },
  { x: 8, y: -6, motion: "180° rotation about the origin" },
  { x: -9, y: 2, motion: "reflection across the x-axis" },
  { x: 3, y: -10, motion: "reflection across the y-axis" },
  { x: -8, y: -1, motion: "90° counterclockwise rotation about the origin" },
  { x: 4, y: 13, motion: "180° rotation about the origin" },
] as const;
const applyFindMotion = (motion: FindMotionName, x: number, y: number): [number, number] => {
  if (motion === "reflection across the x-axis") return [x, -y];
  if (motion === "reflection across the y-axis") return [-x, y];
  if (motion === "90° counterclockwise rotation about the origin") return [-y, x];
  return [-x, -y];
};

function findMotionMcqWidget(rand: Rand): any {
  const { x, y, motion } = pick(rand, FIND_MOTION_CASES);
  const image = applyFindMotion(motion, x, y);
  return {
    type: "mcq",
    prompt: `Point P${pointLabel(x, y)} maps to P′${pointLabel(...image)}. Which rigid motion produced the image?`,
    options: FIND_MOTION_NAMES.map((name) => ({
      id: name,
      label: name,
      correct: name === motion,
      feedback: name === motion
        ? "This motion's coordinate rule sends both coordinates of P exactly to the displayed image."
        : "This motion's coordinate rule sends P to a different ordered pair than the displayed image.",
    })),
  };
}

type CorrespondenceCase = { left: string; right: string; side: readonly [0 | 1, 1 | 2] | readonly [0, 2]; measure: number };
const CORRESPONDENCE_CASES: readonly CorrespondenceCase[] = [
  { left: "ABC", right: "DEF", side: [0, 1], measure: 9 },
  { left: "ABC", right: "QRP", side: [1, 2], measure: 12 },
  { left: "GHJ", right: "PQR", side: [0, 2], measure: 15 },
  { left: "KLM", right: "XYZ", side: [0, 1], measure: 7 },
  { left: "RST", right: "JKL", side: [1, 2], measure: 18 },
  { left: "UVW", right: "CDE", side: [0, 2], measure: 11 },
  { left: "ABC", right: "RQP", side: [0, 2], measure: 14 },
  { left: "GHJ", right: "MNP", side: [1, 2], measure: 20 },
  { left: "KLM", right: "QRS", side: [0, 2], measure: 8 },
  { left: "RST", right: "DEF", side: [0, 1], measure: 13 },
  { left: "UVW", right: "JKL", side: [1, 2], measure: 16 },
  { left: "ABC", right: "XYZ", side: [0, 1], measure: 22 },
] as const;
const sideName = (triangle: string, [first, second]: CorrespondenceCase["side"]): string => `${triangle[first]}${triangle[second]}`;

function correspondingPartsNumericWidget(rand: Rand): any {
  const entry = pick(rand, CORRESPONDENCE_CASES);
  const source = sideName(entry.left, entry.side);
  const target = sideName(entry.right, entry.side);
  return {
    type: "numeric",
    prompt: `Δ${entry.left} ≅ Δ${entry.right}. If ${source} = ${entry.measure}, find ${target}.`,
    answer: entry.measure,
    tolerance: 0,
    commonErrors: [
      { value: entry.measure + 3, feedback: "That changes the measure; corresponding sides of congruent triangles have equal lengths." },
      { value: 2 * entry.measure, feedback: "That scales the corresponding side; congruence preserves size rather than multiplying it." },
    ],
    fallbackFeedback: `${source} and ${target} occupy the same two positions in the congruence statement, so ${target} = ${entry.measure}.`,
    successFeedback: `Matching vertex positions pairs ${source} with ${target}, preserving the length ${entry.measure}.`,
  };
}

function correspondingPartsMcqWidget(rand: Rand): any {
  const entry = pick(rand, CORRESPONDENCE_CASES);
  const source = sideName(entry.left, entry.side);
  const target = sideName(entry.right, entry.side);
  const triangleSideIndices = [[0, 1], [1, 2], [0, 2]] as const;
  const rightSides = triangleSideIndices.map((indices) => sideName(entry.right, indices));
  return {
    type: "mcq",
    prompt: `Given Δ${entry.left} ≅ Δ${entry.right}, which segment corresponds to ${source}?`,
    options: [...rightSides, source].map((label) => ({
      id: label,
      label,
      correct: label === target,
      feedback: label === target
        ? `The endpoints occupy the same two positions as ${source} in the congruence statement.`
        : `Match each endpoint by its position in the congruence statement before naming the corresponding segment.`,
    })),
  };
}

const GEOMETRY_FOUNDATIONS_FORM_BUILDERS: Record<string, (rand: Rand) => any> = {
  "gf-translation-rule__numeric": translationNumericWidget,
  "gf-translation-rule__mcq": translationMcqWidget,
  "gf-reflection-rule__numeric": reflectionNumericWidget,
  "gf-reflection-rule__mcq": reflectionMcqWidget,
  "gf-rotation-rule__numeric": rotationNumericWidget,
  "gf-rotation-rule__mcq": rotationMcqWidget,
  "gf-composition__numeric": compositionNumericWidget,
  "gf-composition__mcq": compositionMcqWidget,
  "gf-line-symmetry__numeric": lineSymmetryNumericWidget,
  "gf-line-symmetry__mcq": lineSymmetryMcqWidget,
  "gf-rotational-symmetry__numeric": rotationalSymmetryNumericWidget,
  "gf-rotational-symmetry__mcq": rotationalSymmetryMcqWidget,
  "gf-congruence-def__numeric": congruenceDefinitionNumericWidget,
  "gf-congruence-def__mcq": congruenceDefinitionMcqWidget,
  "gf-find-motion__numeric": findMotionNumericWidget,
  "gf-find-motion__mcq": findMotionMcqWidget,
  "gf-corresponding-parts__numeric": correspondingPartsNumericWidget,
  "gf-corresponding-parts__mcq": correspondingPartsMcqWidget,
};

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

function buildVariant(tag: string, rand: Rand, _band: Band, requestedForm: string): Variant {
  const forms = BANK[tag];
  if (!forms) throw new Error(`Unknown Geometry generator ${tag}`);
  const form = requestedForm === "default" ? Object.keys(forms)[0]! : requestedForm;
  const pool = forms[form];
  if (!pool?.length) throw new Error(`Unsupported Geometry form ${tag}@${requestedForm}`);
  const customBuilder = tag === "g10-circle-theorems"
    ? CIRCLE_FORM_BUILDERS[form]
    : tag === "g10-constructions-proof"
      ? CONSTRUCTION_FORM_BUILDERS[form]
      : tag === "g10-coordinate-proofs"
        ? COORDINATE_FORM_BUILDERS[form]
        : tag === "g10-geometry-foundations"
          ? GEOMETRY_FOUNDATIONS_FORM_BUILDERS[form]
          : undefined;
  const widget = customBuilder ? customBuilder(rand) : deepClone(pick(rand, pool));
  // This bank has no free-response reasoning surface, so the prompt must not
  // request a justification the learner has nowhere to enter.
  widget.prompt = cleanTypography(String(widget.prompt).trim());
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
