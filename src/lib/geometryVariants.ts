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
  const answer = Number((y0 - (q * (x1 - x0)) / p).toFixed(3));
  return {
    type: "numeric",
    prompt: `A line through (${x0}, ${y0}) is perpendicular to a line of slope ${p}/${q}. Find its y-coordinate when x = ${x1}, rounded to three decimal places if needed.`,
    answer,
    tolerance: 0.0005,
    commonErrors: [
      { value: Number((y0 + (p * (x1 - x0)) / q).toFixed(3)), feedback: "That keeps the original slope. A perpendicular line uses the negative reciprocal −q/p." },
      { value: Number((y0 + (q * (x1 - x0)) / p).toFixed(3)), feedback: "The reciprocal also needs the opposite sign for a perpendicular line." },
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

/* S331 / lane G1. The sixteen numeric g10-right-triangles forms below previously drew from one-,
 * two-, or three-row fixed pools, so reseeding regenerated identical problems and every declared
 * step failed the resolver's freshness gate. Each builder now draws a genuine mathematical state
 * (a Pythagorean triple, an angle, a length) that changes the answer, keeps every trap a computed
 * misconception named with the drawn numbers, and states any rounding convention in the prompt.
 * The matching prompt parsers in geometryIndependent.cjs re-derive every answer from the printed
 * numbers along a separate route (integer search for triples, own half-up rounding for trig). */

const RT_TRIPLES = [
  [3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17],
  [12, 16, 20], [7, 24, 25], [20, 21, 29], [10, 24, 26], [9, 40, 41],
] as const;
const RT_DEG = Math.PI / 180;
const rtRound = (x: number, dp: number): number => Math.round(x * 10 ** dp) / 10 ** dp;
const rt2 = (x: number): number => rtRound(x, 2);

function rtPythagoreanWidget(rand: Rand): any {
  const [a, b, c] = pick(rand, RT_TRIPLES);
  return {
    type: "numeric",
    prompt: `A right triangle has legs ${a} and ${b}. Find the hypotenuse.`,
    answer: c,
    tolerance: 0,
    commonErrors: [
      { value: a + b, feedback: `${a + b} = ${a} + ${b} adds the legs directly. Add their SQUARES: ${a * a} + ${b * b} = ${c * c}, then √${c * c} = ${c}.` },
      { value: c * c, feedback: `${c * c} is c² — you stopped before the square root. c = √${c * c} = ${c}.` },
      { value: a * b, feedback: `${a * b} = ${a} × ${b} multiplies the legs. The theorem squares and adds: ${a * a} + ${b * b} = ${c * c} → c = ${c}.` },
    ],
    fallbackFeedback: `c² = ${a}² + ${b}² = ${c * c}, so c = ${c}.`,
    successFeedback: `${a}² + ${b}² = ${c * c} and √${c * c} = ${c} — the hypotenuse checks out.`,
  };
}

function rtPythagoreanLegWidget(rand: Rand): any {
  const [a, b, c] = pick(rand, RT_TRIPLES);
  const [given, other] = rand() < 0.5 ? [a, b] : [b, a];
  return {
    type: "numeric",
    prompt: `The hypotenuse is ${c} and one leg is ${given}. Find the other leg.`,
    answer: other,
    tolerance: 0,
    commonErrors: [
      { value: c * c + given * given, feedback: `${c * c + given * given} = ${c * c} + ${given * given} ADDS — but ${c} is the hypotenuse, the total. Subtract: ${c * c} − ${given * given} = ${other * other} → ${other}.` },
      { value: c - given, feedback: `${c - given} = ${c} − ${given} subtracts the sides themselves. Subtract the SQUARES: ${c * c} − ${given * given} = ${other * other}, then √${other * other} = ${other}.` },
      { value: other * other, feedback: `${other * other} is the missing leg SQUARED. Take the square root: √${other * other} = ${other}.` },
    ],
    fallbackFeedback: `leg² = ${c * c} − ${given * given} = ${other * other}, so the leg is ${other}.`,
    successFeedback: `${given}² + ${other}² = ${c * c} = ${c}² — the sides close the right triangle.`,
  };
}

function rtPythagoreanApplyWidget(rand: Rand): any {
  const [a, b, c] = pick(rand, RT_TRIPLES);
  if (rand() < 0.5) {
    const wrongAdd = rt2(Math.sqrt(c * c + a * a));
    return {
      type: "numeric",
      prompt: `A ${c} ft ladder leans against a wall with its base ${a} ft from the wall. How high up the wall does it reach (ft)?`,
      answer: b,
      tolerance: 0,
      commonErrors: [
        { value: wrongAdd, feedback: `That treats the ladder as a LEG (√(${c * c} + ${a * a}) ≈ ${wrongAdd}). The ladder is the hypotenuse — subtract: √(${c * c} − ${a * a}) = ${b}.` },
        { value: c - a, feedback: `${c - a} = ${c} − ${a} subtracts lengths, not squares. Compute ${c * c} − ${a * a} = ${b * b}, then √${b * b} = ${b}.` },
        { value: b * b, feedback: `${b * b} is the height SQUARED. Finish with the square root: √${b * b} = ${b} ft.` },
      ],
      fallbackFeedback: `The ladder (${c}) is the hypotenuse: h = √(${c * c} − ${a * a}) = √${b * b} = ${b} ft.`,
      successFeedback: `√(${c * c} − ${a * a}) = ${b} ft — the ${a}-${b}-${c} triple in a ladder.`,
    };
  }
  return {
    type: "numeric",
    prompt: `A rectangular field is ${a} m by ${b} m. How long is the diagonal path across it (m)?`,
    answer: c,
    tolerance: 0,
    commonErrors: [
      { value: a + b, feedback: `${a + b} = ${a} + ${b} walks AROUND the corner (two sides), not across. The diagonal is √(${a * a} + ${b * b}) = ${c}.` },
      { value: c * c, feedback: `${c * c} is the diagonal SQUARED. Square-root it: d = ${c} m.` },
      { value: (a + b) / 2, feedback: `${(a + b) / 2} averages the sides. Use the theorem: √(${a}² + ${b}²) = √${c * c} = ${c}.` },
    ],
    fallbackFeedback: `d = √(${a}² + ${b}²) = √${c * c} = ${c} m.`,
    successFeedback: `The diagonal completes the ${a}-${b}-${c} triple: ${c} m.`,
  };
}

const RT_BASE_TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]] as const;
const RT_SCALES = [2, 3, 4, 5, 10] as const;

function rtTriplesWidget(rand: Rand): any {
  const [a, b, c] = pick(rand, RT_BASE_TRIPLES);
  const k = pick(rand, RT_SCALES);
  const [A, B, C] = [a * k, b * k, c * k];
  return {
    type: "numeric",
    prompt: `Legs ${A} and ${B} — use a scaled triple to name the hypotenuse instantly.`,
    answer: C,
    tolerance: 0,
    commonErrors: [
      { value: A + B, feedback: `${A + B} = ${A} + ${B} adds legs. This is ${a}-${b}-${c} scaled by ${k}, so c = ${C} (${A * A} + ${B * B} = ${C * C}).` },
      { value: C * C, feedback: `${C * C} is c². This is ${a}-${b}-${c} × ${k}: c = ${C}.` },
      { value: (A + B) / 2, feedback: `${(A + B) / 2} averages the legs. Recognize ${a}-${b}-${c} × ${k} → hypotenuse ${C}.` },
    ],
    fallbackFeedback: `${A}-${B}-? is ${a}-${b}-${c} scaled by ${k}: c = ${C}.`,
    successFeedback: `${a}-${b}-${c} × ${k} gives ${A}-${B}-${C} — no squaring needed.`,
  };
}

const RT_ISO_LEGS = [3, 4, 5, 6, 7, 8, 9, 11, 12, 15] as const;
const RT_ISO_HYPS = [6, 8, 10, 12, 14, 16, 18, 20] as const;

function rt454590Widget(rand: Rand): any {
  if (rand() < 0.5) {
    const s = pick(rand, RT_ISO_LEGS);
    const answer = rt2(s * Math.SQRT2);
    return {
      type: "numeric",
      prompt: `A 45-45-90 triangle has legs of ${s}. Find the hypotenuse (round to 2 decimals).`,
      answer,
      tolerance: 0.02,
      commonErrors: [
        { value: 2 * s, feedback: `${2 * s} = ${s} + ${s} adds the legs. Multiply ONE leg by √2: ${s}√2 ≈ ${answer}.` },
        { value: s * s, feedback: `${s * s} = ${s}² squares a leg but never finishes. c = √(${s * s} + ${s * s}) = ${s}√2 ≈ ${answer}.` },
        { value: rt2(s / Math.SQRT2), feedback: `${rt2(s / Math.SQRT2)} ≈ ${s} ÷ √2 DIVIDES — that's the move for going hypotenuse → leg. Leg → hypotenuse multiplies: ≈ ${answer}.` },
      ],
      fallbackFeedback: `hyp = leg × √2 = ${s}√2 ≈ ${answer}.`,
      successFeedback: `Both legs equal ${s}, so the hypotenuse is ${s}√2 ≈ ${answer}.`,
    };
  }
  const h = pick(rand, RT_ISO_HYPS);
  const answer = rt2(h / Math.SQRT2);
  return {
    type: "numeric",
    prompt: `A 45-45-90 triangle has hypotenuse ${h}. Find each leg (round to 2 decimals).`,
    answer,
    tolerance: 0.02,
    commonErrors: [
      { value: rt2(h * Math.SQRT2), feedback: `${rt2(h * Math.SQRT2)} = ${h}√2 MULTIPLIED — but a leg must be SHORTER than the hypotenuse. Divide: ${h}/√2 ≈ ${answer}.` },
      { value: h / 2, feedback: `${h / 2} = ${h} ÷ 2 halves the hypotenuse — that's the 30-60-90 short-leg move. Here divide by √2: ≈ ${answer}.` },
    ],
    fallbackFeedback: `leg = ${h} ÷ √2 ≈ ${answer}.`,
    successFeedback: `Dividing the hypotenuse ${h} by √2 gives each leg ≈ ${answer}.`,
  };
}

const RT_SQUARE_SIDES = [4, 5, 6, 7, 8, 9, 11, 12, 14, 15] as const;

function rt454590ApplyWidget(rand: Rand): any {
  const s = pick(rand, RT_SQUARE_SIDES);
  const answer = rt2(s * Math.SQRT2);
  return {
    type: "numeric",
    prompt: `A square has sides of ${s} cm. How long is its diagonal (cm, round to 2 decimals)?`,
    answer,
    tolerance: 0.02,
    commonErrors: [
      { value: 2 * s, feedback: `${2 * s} = ${s} + ${s} walks two sides. The diagonal cuts across: ${s}√2 ≈ ${answer}.` },
      { value: rt2(s / Math.SQRT2), feedback: `${rt2(s / Math.SQRT2)} ≈ ${s} ÷ √2 divides — backwards. Side → diagonal multiplies: ${s}√2 ≈ ${answer}.` },
      { value: s * s, feedback: `${s * s} = ${s}² is the square's AREA. Its diagonal is ${s}√2 ≈ ${answer} cm.` },
    ],
    fallbackFeedback: `diagonal = ${s}√2 ≈ ${answer} cm.`,
    successFeedback: `The diagonal is a 45-45-90 hypotenuse over two ${s} cm sides: ${s}√2 ≈ ${answer} cm.`,
  };
}

const RT_306090_SHORT = [3, 4, 5, 6, 7, 9, 10, 11] as const;
const RT_306090_HYPS = [6, 8, 10, 12, 14, 16, 18] as const;
const RT_306090_LONG = [5, 6, 7, 8, 9, 10, 12] as const;

function rt306090Widget(rand: Rand): any {
  const job = Math.floor(rand() * 3);
  if (job === 0) {
    const s = pick(rand, RT_306090_SHORT);
    const long = rt2(s * Math.sqrt(3));
    return {
      type: "numeric",
      prompt: `A 30-60-90 triangle has short leg ${s}. Find the hypotenuse.`,
      answer: 2 * s,
      tolerance: 0,
      commonErrors: [
        { value: long, feedback: `${long} ≈ ${s}√3 is the LONG leg. The hypotenuse doubles the short leg: ${2 * s}.` },
        { value: rt2(s * Math.SQRT2), feedback: `${rt2(s * Math.SQRT2)} ≈ ${s}√2 borrows the 45-45-90 rule. Here hyp = 2 × short = ${2 * s}.` },
      ],
      fallbackFeedback: `hyp = 2 × short leg = 2 × ${s} = ${2 * s}.`,
      successFeedback: `The hypotenuse is exactly double the short leg: 2 × ${s} = ${2 * s}.`,
    };
  }
  if (job === 1) {
    const h = pick(rand, RT_306090_HYPS);
    const short = h / 2;
    const answer = rt2(short * Math.sqrt(3));
    return {
      type: "numeric",
      prompt: `A 30-60-90 triangle has hypotenuse ${h}. Find the LONG leg (round to 2 decimals).`,
      answer,
      tolerance: 0.02,
      commonErrors: [
        { value: short, feedback: `${short} is the SHORT leg (half of ${h}). The long leg multiplies it by √3: ${short}√3 ≈ ${answer}.` },
        { value: rt2(h * Math.sqrt(3)), feedback: `${rt2(h * Math.sqrt(3))} ≈ ${h}√3 multiplies the HYPOTENUSE by √3 — and beats ${h}, impossible for a leg. Route via short leg: ${short}√3 ≈ ${answer}.` },
        { value: rt2(h / Math.SQRT2), feedback: `${rt2(h / Math.SQRT2)} ≈ ${h}/√2 uses the 45-45-90 divisor. Here: halve to ${short}, then ×√3 ≈ ${answer}.` },
      ],
      fallbackFeedback: `short = ${short}, long = ${short}√3 ≈ ${answer}.`,
      successFeedback: `Halving ${h} gives ${short}; multiplying by √3 gives the long leg ≈ ${answer}.`,
    };
  }
  const L = pick(rand, RT_306090_LONG);
  const short = rt2(L / Math.sqrt(3));
  const answer = rt2((2 * L) / Math.sqrt(3));
  return {
    type: "numeric",
    prompt: `A 30-60-90 triangle has long leg ${L}. Find the hypotenuse (round to 2 decimals).`,
    answer,
    tolerance: 0.02,
    commonErrors: [
      { value: 2 * L, feedback: `${2 * L} doubles the LONG leg — doubling belongs to the short leg. First ${L}/√3 ≈ ${short}, then ×2 ≈ ${answer}.` },
      { value: rt2(L * Math.sqrt(3)), feedback: `${rt2(L * Math.sqrt(3))} ≈ ${L}√3 multiplies by √3 — the short→long move, applied backwards. Divide: ${L}/√3 ≈ ${short}, double: ${answer}.` },
      { value: short, feedback: `${short} is the SHORT leg — you stopped mid-route. Double it: ≈ ${answer}.` },
    ],
    fallbackFeedback: `hyp = 2 × (${L}/√3) ≈ ${answer}.`,
    successFeedback: `Dividing ${L} by √3 gives the short leg ≈ ${short}; doubling gives the hypotenuse ≈ ${answer}.`,
  };
}

function rtSohcahtoaWidget(rand: Rand): any {
  const [a, b, c] = pick(rand, RT_TRIPLES);
  const oppFirst = rand() < 0.5;
  const [opp, adj] = oppFirst ? [a, b] : [b, a];
  const fn = pick(rand, ["sin", "cos", "tan"] as const);
  /* Two decimals, not four: several triples put a repeating decimal (4/3 = 1.3333…) in the
   * printed feedback, which the prose gate rightly rejects as an unstated truncation. */
  const r4 = (x: number): number => rtRound(x, 2);
  const value = fn === "sin" ? opp / c : fn === "cos" ? adj / c : opp / adj;
  const answer = r4(value);
  const traps =
    fn === "sin"
      ? [
          { value: r4(adj / c), feedback: `${r4(adj / c)} = ${adj}/${c} is cos θ (adjacent over hypotenuse). Sine takes the OPPOSITE side: ${opp}/${c} ≈ ${answer}.` },
          { value: r4(opp / adj), feedback: `${r4(opp / adj)} = ${opp}/${adj} is tan θ (opposite over adjacent). Sine divides by the HYPOTENUSE: ${opp}/${c} ≈ ${answer}.` },
          { value: r4(c / opp), feedback: `${r4(c / opp)} = ${c}/${opp} flips the fraction. Sine puts the hypotenuse on the BOTTOM: ${opp}/${c} ≈ ${answer}.` },
        ]
      : fn === "cos"
        ? [
            { value: r4(opp / c), feedback: `${r4(opp / c)} = ${opp}/${c} is sin θ. Cosine takes the ADJACENT side over the hypotenuse: ${adj}/${c} ≈ ${answer}.` },
            { value: r4(adj / opp), feedback: `${r4(adj / opp)} = ${adj}/${opp} is adjacent over opposite — an inverted tangent, not a named ratio here. cos θ = ${adj}/${c} ≈ ${answer}.` },
            { value: r4(opp / adj), feedback: `${r4(opp / adj)} = ${opp}/${adj} is tan θ. Cosine divides adjacent by the HYPOTENUSE: ${adj}/${c} ≈ ${answer}.` },
          ]
        : [
            { value: r4(opp / c), feedback: `${r4(opp / c)} = ${opp}/${c} is sin θ (over the hypotenuse). Tangent stays among the LEGS: ${opp}/${adj} ≈ ${answer}.` },
            { value: r4(adj / c), feedback: `${r4(adj / c)} = ${adj}/${c} is cos θ. TOA: opposite/adjacent = ${opp}/${adj} ≈ ${answer}.` },
            { value: r4(adj / opp), feedback: `${r4(adj / opp)} = ${adj}/${opp} flips the fraction: that's tan of the OTHER acute angle. For θ: ${opp}/${adj} ≈ ${answer}.` },
          ];
  return {
    type: "numeric",
    prompt: `In a ${a}-${b}-${c} right triangle, θ is the angle whose opposite side is ${opp}. What is ${fn} θ (round to 2 decimals)?`,
    answer,
    tolerance: 0.005,
    commonErrors: traps,
    fallbackFeedback: `SOH-CAH-TOA on the printed sides gives ${fn} θ = ${fn === "sin" ? `${opp}/${c}` : fn === "cos" ? `${adj}/${c}` : `${opp}/${adj}`} ≈ ${answer}.`,
    successFeedback: `With opposite ${opp}, adjacent ${adj}, hypotenuse ${c}: ${fn} θ ≈ ${answer}.`,
  };
}

const RT_RAMP_RISES = [0.9, 1.2, 1.5, 1.8, 2.4] as const;
const RT_RAMP_RUNS = [4.8, 5.6, 6.4, 7.2] as const;

function rtInverseTrigWidget(rand: Rand): any {
  const job = Math.floor(rand() * 3);
  const deg = (x: number): number => rt2(x / RT_DEG);
  if (job === 0) {
    const [a, b, c] = pick(rand, RT_TRIPLES);
    const opp = rand() < 0.5 ? a : b;
    const answer = deg(Math.asin(opp / c));
    const other = deg(Math.acos(opp / c));
    return {
      type: "numeric",
      prompt: `Right triangle: the side opposite θ is ${opp}, the hypotenuse is ${c}. Find θ in degrees (round to 2 decimals).`,
      answer,
      tolerance: 0.02,
      commonErrors: [
        { value: other, feedback: `${other}° = cos⁻¹(${opp}/${c}) — the OTHER acute angle. For ${opp} as the opposite side, use sin⁻¹: ≈ ${answer}°.` },
        { value: rt2(opp / c), feedback: `${rt2(opp / c)} is the RATIO ${opp}/${c}, not the angle. Finish with the inverse: sin⁻¹(${rt2(opp / c)}) ≈ ${answer}°.` },
      ],
      fallbackFeedback: `θ = sin⁻¹(${opp}/${c}) ≈ ${answer}°.`,
      successFeedback: `sin θ = ${opp}/${c}, so θ = sin⁻¹(${opp}/${c}) ≈ ${answer}°.`,
    };
  }
  if (job === 1) {
    const [a, b] = pick(rand, RT_TRIPLES);
    const [p, q] = rand() < 0.5 ? [a, b] : [b, a];
    const answer = deg(Math.atan(p / q));
    const traps = [
      { value: deg(Math.atan(q / p)), feedback: `${deg(Math.atan(q / p))}° = tan⁻¹(${q}/${p}) is the angle opposite the ${q}. Your angle faces the ${p}: tan⁻¹(${p}/${q}) ≈ ${answer}°.` },
      p < q
        ? { value: deg(Math.asin(p / q)), feedback: `${deg(Math.asin(p / q))}° = sin⁻¹(${p}/${q}) treats the ${q} as the hypotenuse — but both are LEGS. Use tan⁻¹(${p}/${q}) ≈ ${answer}°.` }
        : { value: rt2(p / q), feedback: `${rt2(p / q)} is the RATIO ${p}/${q}, not the angle. Apply tan⁻¹ to get ≈ ${answer}°.` },
    ];
    return {
      type: "numeric",
      prompt: `Legs ${p} and ${q}; θ is the angle OPPOSITE the leg of length ${p}. Find θ in degrees (round to 2 decimals).`,
      answer,
      tolerance: 0.02,
      commonErrors: traps,
      fallbackFeedback: `θ = tan⁻¹(${p}/${q}) ≈ ${answer}°.`,
      successFeedback: `tan θ = ${p}/${q}, so θ = tan⁻¹(${p}/${q}) ≈ ${answer}°.`,
    };
  }
  const rise = pick(rand, RT_RAMP_RISES);
  const run = pick(rand, RT_RAMP_RUNS);
  const answer = deg(Math.atan(rise / run));
  return {
    type: "numeric",
    prompt: `A ramp rises ${rise} m over a horizontal run of ${run} m. Find its angle with the ground, in degrees (round to 2 decimals).`,
    answer,
    tolerance: 0.02,
    commonErrors: [
      { value: deg(Math.asin(rise / run)), feedback: `${deg(Math.asin(rise / run))}° = sin⁻¹(${rise}/${run}) treats the ${run} m RUN as the sloped surface — it's the horizontal leg. tan⁻¹ gives ≈ ${answer}°.` },
      { value: deg(Math.atan(run / rise)), feedback: `${deg(Math.atan(run / rise))}° = tan⁻¹(${run}/${rise}) is the ramp's OTHER angle, up at the top. The ground angle is tan⁻¹(${rise}/${run}) ≈ ${answer}°.` },
      { value: rt2(rise / run), feedback: `${rt2(rise / run)} rounds the RATIO ${rise}/${run} — the tangent, not the angle. Apply tan⁻¹: ≈ ${answer}°.` },
    ],
    fallbackFeedback: `θ = tan⁻¹(${rise}/${run}) ≈ ${answer}°.`,
    successFeedback: `The rise-over-run tangent is ${rise}/${run}; tan⁻¹ gives ≈ ${answer}°.`,
  };
}

const RT_ELEV_DISTS = [35, 40, 45, 50, 55, 60, 65, 70] as const;
const RT_ELEV_ANGLES = [18, 22, 25, 28, 32, 35, 38, 41, 44] as const;
const RT_CLIFF_HEIGHTS = [60, 70, 80, 90, 100, 120] as const;
const RT_DEPRESS_ANGLES = [12, 15, 18, 21, 24] as const;

function rtElevDepressWidget(rand: Rand): any {
  if (rand() < 0.5) {
    const d = pick(rand, RT_ELEV_DISTS);
    const t = pick(rand, RT_ELEV_ANGLES);
    const obj = pick(rand, ["treetop", "rooftop"] as const);
    const answer = rt2(d * Math.tan(t * RT_DEG));
    return {
      type: "numeric",
      prompt: `From ${d} m away (on flat ground), the angle of elevation to a ${obj} is ${t}°. How high is the ${obj} above eye level, in meters (round to 2 decimals)?`,
      answer,
      tolerance: 0.02,
      commonErrors: [
        { value: rt2(d * Math.sin(t * RT_DEG)), feedback: `${rt2(d * Math.sin(t * RT_DEG))} = ${d}·sin ${t}° treats the ${d} m GROUND distance as the line of sight. It's the adjacent leg: ${d}·tan ${t}° ≈ ${answer}.` },
        { value: rt2(d / Math.tan(t * RT_DEG)), feedback: `${rt2(d / Math.tan(t * RT_DEG))} = ${d} ÷ tan ${t}° divides — but the unknown height sits on TOP of tan ${t}° = h/${d}. Multiply: ≈ ${answer}.` },
        { value: rt2(d * Math.cos(t * RT_DEG)), feedback: `${rt2(d * Math.cos(t * RT_DEG))} = ${d}·cos ${t}° mixes in cosine — yet no hypotenuse is known. Leg-to-leg needs tangent: ≈ ${answer}.` },
      ],
      fallbackFeedback: `h = ${d}·tan ${t}° ≈ ${answer} m.`,
      successFeedback: `tan ${t}° = h/${d}, so h ≈ ${answer} m above eye level.`,
    };
  }
  const h = pick(rand, RT_CLIFF_HEIGHTS);
  const t = pick(rand, RT_DEPRESS_ANGLES);
  const answer = rt2(h / Math.tan(t * RT_DEG));
  return {
    type: "numeric",
    prompt: `From the top of a ${h} m cliff, the angle of depression to a boat is ${t}°. How far is the boat from the base of the cliff, in meters (round to 2 decimals)?`,
    answer,
    tolerance: 0.02,
    commonErrors: [
      { value: rt2(h * Math.tan(t * RT_DEG)), feedback: `${rt2(h * Math.tan(t * RT_DEG))} = ${h}·tan ${t}° multiplies — but x sits on the BOTTOM of tan ${t}° = ${h}/x. Divide: ${h} ÷ tan ${t}° ≈ ${answer}.` },
      { value: rt2(h / Math.sin(t * RT_DEG)), feedback: `${rt2(h / Math.sin(t * RT_DEG))} = ${h} ÷ sin ${t}° is the LINE-OF-SIGHT distance (hypotenuse) — real, but the question asks the horizontal leg: ≈ ${answer}.` },
      { value: rt2(h * Math.sin(t * RT_DEG)), feedback: `${rt2(h * Math.sin(t * RT_DEG))} = ${h}·sin ${t}° treats ${h} as the hypotenuse — it's the vertical leg. x = ${h} ÷ tan ${t}° ≈ ${answer}.` },
    ],
    fallbackFeedback: `x = ${h} ÷ tan ${t}° ≈ ${answer} m.`,
    successFeedback: `The depression angle equals the elevation from the boat: tan ${t}° = ${h}/x, so x ≈ ${answer} m.`,
  };
}

const RT_BUILDING_DISTS = [30, 40, 50, 60] as const;
const RT_BUILDING_ANGLES = [40, 48, 55, 62] as const;
const RT_EYE_HEIGHTS = [1.4, 1.5, 1.6, 1.7] as const;
const RT_KITE_STRINGS = [60, 75, 90, 105, 120] as const;
const RT_KITE_ANGLES = [36, 42, 48, 54] as const;
const RT_PLANE_ALTS = [1800, 2000, 2500, 3000] as const;
const RT_PLANE_ANGLES = [9, 12, 15, 18] as const;

function rtHeightAppsWidget(rand: Rand): any {
  const job = Math.floor(rand() * 3);
  if (job === 0) {
    const d = pick(rand, RT_BUILDING_DISTS);
    const t = pick(rand, RT_BUILDING_ANGLES);
    const e = pick(rand, RT_EYE_HEIGHTS);
    const rise = d * Math.tan(t * RT_DEG);
    const answer = rt2(rise + e);
    return {
      type: "numeric",
      prompt: `You stand ${d} m from a building; the angle of elevation to its top is ${t}°, measured from an eye height of ${e} m. Total building height in meters (round to 2 decimals)?`,
      answer,
      tolerance: 0.02,
      commonErrors: [
        { value: rt2(rise), feedback: `${rt2(rise)} = ${d}·tan ${t}° stops at eye level — the bottom ${e} m is missing. Total ≈ ${answer}.` },
        { value: rt2(d * Math.sin(t * RT_DEG) + e), feedback: `${rt2(d * Math.sin(t * RT_DEG) + e)} = ${d}·sin ${t}° + ${e} treats the ${d} m ground distance as the line of sight. It's the adjacent LEG: ${d}·tan ${t}° + ${e} ≈ ${answer}.` },
      ],
      fallbackFeedback: `${d}·tan ${t}° + ${e} ≈ ${answer} m.`,
      successFeedback: `The triangle gives ${d}·tan ${t}° above eye level; adding the ${e} m eye height totals ≈ ${answer} m.`,
    };
  }
  if (job === 1) {
    const L = pick(rand, RT_KITE_STRINGS);
    const t = pick(rand, RT_KITE_ANGLES);
    const answer = rt2(L * Math.sin(t * RT_DEG));
    return {
      type: "numeric",
      prompt: `A kite flies on a taut ${L} m string at ${t}° elevation. How high is the kite (round to 2 decimals)? Ignore the flyer's height.`,
      answer,
      tolerance: 0.02,
      commonErrors: [
        { value: rt2(L * Math.cos(t * RT_DEG)), feedback: `${rt2(L * Math.cos(t * RT_DEG))} = ${L}·cos ${t}° is the HORIZONTAL distance to below the kite. Height is the opposite leg: ${L}·sin ${t}° ≈ ${answer}.` },
        { value: rt2(L * Math.tan(t * RT_DEG)), feedback: `${rt2(L * Math.tan(t * RT_DEG))} = ${L}·tan ${t}° uses tangent — but the ${L} m string is the HYPOTENUSE, which tangent never touches. Sine: ≈ ${answer}.` },
      ],
      fallbackFeedback: `${L}·sin ${t}° ≈ ${answer} m.`,
      successFeedback: `The string is the hypotenuse, so height = ${L}·sin ${t}° ≈ ${answer} m.`,
    };
  }
  const A = pick(rand, RT_PLANE_ALTS);
  const t = pick(rand, RT_PLANE_ANGLES);
  const answer = rt2(A / Math.tan(t * RT_DEG));
  return {
    type: "numeric",
    prompt: `A plane is at ${A} m altitude; the angle of depression to the airport is ${t}°. Horizontal ground distance in meters (round to 2 decimals)?`,
    answer,
    tolerance: 0.02,
    commonErrors: [
      { value: rt2(A * Math.tan(t * RT_DEG)), feedback: `${rt2(A * Math.tan(t * RT_DEG))} = ${A}·tan ${t}° multiplies — and fails the sanity check: ${t === 18 ? "an" : "a"} ${t}° glide is SHALLOW, so the reach must dwarf the height. Divide: ≈ ${answer}.` },
      { value: rt2(A / Math.sin(t * RT_DEG)), feedback: `${rt2(A / Math.sin(t * RT_DEG))} = ${A} ÷ sin ${t}° is the slant distance the plane actually flies — the hypotenuse, not the ground leg: ≈ ${answer}.` },
    ],
    fallbackFeedback: `x = ${A} ÷ tan ${t}° ≈ ${answer} m.`,
    successFeedback: `tan ${t}° = ${A}/x, so the ground distance is ≈ ${answer} m.`,
  };
}

const RT_TREE_HEIGHTS = [8, 10, 12, 15, 18] as const;
const RT_SUN_ANGLES = [31, 34, 38, 42, 47] as const;
const RT_POLE_HEIGHTS = [12, 15, 18, 21, 24] as const;
const RT_WIRE_ANGLES = [58, 61, 65, 68, 72] as const;

function rtTrigAppsWidget(rand: Rand): any {
  if (rand() < 0.5) {
    const h = pick(rand, RT_TREE_HEIGHTS);
    const t = pick(rand, RT_SUN_ANGLES);
    const answer = rt2(h / Math.tan(t * RT_DEG));
    return {
      type: "numeric",
      prompt: `The sun is at ${t}° elevation. How long a shadow does a ${h} m tree cast, in meters (round to 2 decimals)?`,
      answer,
      tolerance: 0.02,
      commonErrors: [
        { value: rt2(h * Math.tan(t * RT_DEG)), feedback: `${rt2(h * Math.tan(t * RT_DEG))} = ${h}·tan ${t}° multiplies — but the shadow s is on the BOTTOM of tan ${t}° = ${h}/s. Divide: ≈ ${answer}.` },
        { value: rt2(h / Math.sin(t * RT_DEG)), feedback: `${rt2(h / Math.sin(t * RT_DEG))} = ${h} ÷ sin ${t}° computes the sun-ray's slant length (hypotenuse), not the ground shadow: ≈ ${answer}.` },
        { value: rt2(h * Math.sin(t * RT_DEG)), feedback: `${rt2(h * Math.sin(t * RT_DEG))} = ${h}·sin ${t}° treats the ${h} m tree as a hypotenuse — it's the vertical LEG. s = ${h} ÷ tan ${t}° ≈ ${answer}.` },
      ],
      fallbackFeedback: `s = ${h} ÷ tan ${t}° ≈ ${answer} m.`,
      successFeedback: `tan ${t}° = ${h}/s, so the shadow stretches ≈ ${answer} m.`,
    };
  }
  const h = pick(rand, RT_POLE_HEIGHTS);
  const t = pick(rand, RT_WIRE_ANGLES);
  const answer = rt2(h / Math.sin(t * RT_DEG));
  return {
    type: "numeric",
    prompt: `A guy wire runs from the top of ${h === 18 ? "an" : "a"} ${h} m pole to the ground, meeting it at ${t}°. How long is the wire (round to 2 decimals)?`,
    answer,
    tolerance: 0.02,
    commonErrors: [
      { value: rt2(h * Math.sin(t * RT_DEG)), feedback: `${rt2(h * Math.sin(t * RT_DEG))} = ${h}·sin ${t}° multiplies — giving a wire SHORTER than the pole it must reach over. Divide: ${h} ÷ sin ${t}° ≈ ${answer}.` },
      { value: rt2(h / Math.cos(t * RT_DEG)), feedback: `${rt2(h / Math.cos(t * RT_DEG))} = ${h} ÷ cos ${t}° pairs the pole with cosine — but the pole is OPPOSITE the ${t}° ground angle, sine's side: ≈ ${answer}.` },
      { value: rt2(h * Math.tan(t * RT_DEG)), feedback: `${rt2(h * Math.tan(t * RT_DEG))} = ${h}·tan ${t}° relates the two LEGS — the wire is the hypotenuse, which tangent never touches: ≈ ${answer}.` },
    ],
    fallbackFeedback: `wire = ${h} ÷ sin ${t}° ≈ ${answer} m.`,
    successFeedback: `sin ${t}° = ${h}/wire, so the wire runs ≈ ${answer} m.`,
  };
}

const RT_LS_ANCHOR_ANGLES = [35, 40, 44, 48, 52] as const;
const RT_LS_TARGET_ANGLES = [58, 63, 65, 70, 76] as const;
const RT_LS_SIDES = [10, 12, 14, 16, 18] as const;
const RT_LS_BASELINES = [50, 60, 70, 80] as const;
const RT_LS_SURVEY_A = [64, 68, 72, 76] as const;
const RT_LS_SURVEY_B = [50, 54, 58, 62] as const;

function rtLawSinesWidget(rand: Rand): any {
  if (rand() < 0.5) {
    const A = pick(rand, RT_LS_ANCHOR_ANGLES);
    const B = pick(rand, RT_LS_TARGET_ANGLES);
    const a = pick(rand, RT_LS_SIDES);
    const sinA = Math.sin(A * RT_DEG);
    const sinB = Math.sin(B * RT_DEG);
    const answer = rt2((a * sinB) / sinA);
    return {
      type: "numeric",
      prompt: `In triangle ABC: A = ${A}°, B = ${B}°, and side a = ${a} (opposite A). Find side b (round to 2 decimals).`,
      answer,
      tolerance: 0.02,
      commonErrors: [
        { value: rt2((a * sinA) / sinB), feedback: `${rt2((a * sinA) / sinB)} = ${a}·sin ${A}°/sin ${B}° crosses the pairs — and shrinks the side facing the BIGGER angle, backwards. b = ${a}·sin ${B}°/sin ${A}° ≈ ${answer}.` },
        { value: rt2(a * sinB), feedback: `${rt2(a * sinB)} = ${a}·sin ${B}° multiplies but never divides by sin ${A}° — half the proportion. Finish it: ≈ ${answer}.` },
        { value: rt2(a / sinA), feedback: `${rt2(a / sinA)} = ${a}/sin ${A}° is the common RATIO itself, before multiplying by sin ${B}°: ≈ ${answer}.` },
      ],
      fallbackFeedback: `b = ${a}·sin ${B}°/sin ${A}° ≈ ${answer}.`,
      successFeedback: `The pairs stay matched: b = ${a}·sin ${B}°/sin ${A}° ≈ ${answer}.`,
    };
  }
  const d = pick(rand, RT_LS_BASELINES);
  const A = pick(rand, RT_LS_SURVEY_A);
  const bOptions = RT_LS_SURVEY_B.filter((x) => A + 2 * x !== 180);
  const B = pick(rand, bOptions);
  const T = 180 - A - B;
  const sinB = Math.sin(B * RT_DEG);
  const sinT = Math.sin(T * RT_DEG);
  const answer = rt2((d * sinB) / sinT);
  return {
    type: "numeric",
    prompt: `Surveyors at A and B stand ${d} m apart on a riverbank. A tree T sits across the river; angle A (∠TAB) = ${A}° and angle B (∠TBA) = ${B}°. Find the distance from A to the tree (round to 2 decimals).`,
    answer,
    tolerance: 0.02,
    commonErrors: [
      { value: rt2((d * Math.sin(A * RT_DEG)) / sinT), feedback: `${rt2((d * Math.sin(A * RT_DEG)) / sinT)} = ${d}·sin ${A}°/sin ${T}° uses A's own angle on top — that computes the distance from station B (side BT faces ∠A). Side AT faces ∠B = ${B}°: ≈ ${answer}.` },
      { value: rt2((d * sinT) / sinB), feedback: `${rt2((d * sinT) / sinB)} = ${d}·sin ${T}°/sin ${B}° flips the proportion, putting the anchor's sine on top. The unknown side's sine goes on top: ${d}·sin ${B}°/sin ${T}° ≈ ${answer}.` },
    ],
    fallbackFeedback: `∠T = 180° − ${A}° − ${B}° = ${T}°; AT = ${d}·sin ${B}°/sin ${T}° ≈ ${answer} m.`,
    successFeedback: `Side AT faces ∠B, so AT = ${d}·sin ${B}°/sin ${T}° ≈ ${answer} m.`,
  };
}

const RT_LC_SIDE_A = [6, 7, 8, 9] as const;
const RT_LC_SIDE_B = [9, 10, 11, 12] as const;
const RT_LC_ANGLES = [48, 52, 57, 63, 74] as const;
const RT_LC_OBTUSE = [[5, 7, 10], [4, 7, 9], [6, 7, 11], [5, 8, 12], [7, 9, 13], [6, 9, 13]] as const;
const RT_SHIP_LEG1 = [110, 120, 140, 150] as const;
const RT_SHIP_LEG2 = [70, 80, 90, 100] as const;
const RT_SHIP_TURNS = [104, 112, 118, 126] as const;

function rtLawCosinesWidget(rand: Rand): any {
  const job = Math.floor(rand() * 3);
  if (job === 0) {
    const a = pick(rand, RT_LC_SIDE_A);
    const b = pick(rand, RT_LC_SIDE_B);
    const C = pick(rand, RT_LC_ANGLES);
    const sumSq = a * a + b * b;
    const term = 2 * a * b;
    const cSq = sumSq - term * Math.cos(C * RT_DEG);
    const answer = rt2(Math.sqrt(cSq));
    return {
      type: "numeric",
      prompt: `a = ${a}, b = ${b}, included angle C = ${C}°. Find side c (round to 2 decimals).`,
      answer,
      tolerance: 0.02,
      commonErrors: [
        { value: rt2(Math.sqrt(sumSq)), feedback: `${rt2(Math.sqrt(sumSq))} = √${sumSq} skips the correction term entirely — valid only at C = 90°. Subtract ${term}·cos ${C}° first: ≈ ${answer}.` },
        { value: rt2(Math.sqrt(sumSq + term * Math.cos(C * RT_DEG))), feedback: `${rt2(Math.sqrt(sumSq + term * Math.cos(C * RT_DEG)))} = √(${sumSq} + ${term}·cos ${C}°) flips the sign — the term SUBTRACTS here. √(${sumSq} − ${term}·cos ${C}°) ≈ ${answer}.` },
        { value: rt2(cSq), feedback: `${rt2(cSq)} is c², one step from done. Take the square root: ≈ ${answer}.` },
      ],
      fallbackFeedback: `c = √(${sumSq} − ${term}·cos ${C}°) ≈ ${answer}.`,
      successFeedback: `c² = ${a}² + ${b}² − ${term}·cos ${C}° ≈ ${rt2(cSq)}, so c ≈ ${answer}.`,
    };
  }
  if (job === 1) {
    const [p, q, r] = pick(rand, RT_LC_OBTUSE);
    const num = p * p + q * q - r * r;
    const den = 2 * p * q;
    const answer = rtRound(Math.acos(num / den) / RT_DEG, 1);
    const dropSign = rtRound(Math.acos(-num / den) / RT_DEG, 1);
    const oppP = rtRound(Math.acos((q * q + r * r - p * p) / (2 * q * r)) / RT_DEG, 1);
    return {
      type: "numeric",
      prompt: `Sides ${p}, ${q}, and ${r}. Find the angle OPPOSITE the ${r}, in degrees (round to 1 decimal).`,
      answer,
      tolerance: 0.05,
      commonErrors: [
        { value: dropSign, feedback: `${dropSign}° = cos⁻¹(+${Math.abs(rtRound(num / den, 4))}) drops the minus sign — but ${p * p} + ${q * q} − ${r * r} is NEGATIVE, and negative cosine means obtuse: ≈ ${answer}°.` },
        { value: oppP, feedback: `${oppP}° is the angle opposite the ${p} — the sides got shuffled in the formula. The angle opposite the ${r} puts ${r * r} in the c² slot: ≈ ${answer}°.` },
      ],
      fallbackFeedback: `C = cos⁻¹((${p * p} + ${q * q} − ${r * r})/${den}) = cos⁻¹(−${Math.abs(rtRound(num / den, 4))}) ≈ ${answer}°.`,
      successFeedback: `cos C = −${Math.abs(rtRound(num / den, 4))} is negative, so C is obtuse: ≈ ${answer}°.`,
    };
  }
  const u = pick(rand, RT_SHIP_LEG1);
  const v = pick(rand, RT_SHIP_LEG2);
  const t = pick(rand, RT_SHIP_TURNS);
  const sumSq = u * u + v * v;
  const term = 2 * u * v;
  const cosT = Math.cos(t * RT_DEG);
  const answer = rt2(Math.sqrt(sumSq - term * cosT));
  return {
    type: "numeric",
    prompt: `A ship sails ${u} km, turns so the two path segments meet at ${t}°, then sails ${v} km. How far is it from the start (round to 2 decimals)?`,
    answer,
    tolerance: 0.02,
    commonErrors: [
      { value: rt2(Math.sqrt(sumSq)), feedback: `${rt2(Math.sqrt(sumSq))} = √(${u}² + ${v}²) ignores the angle — Pythagoras only rules at 90°. The ${t}° correction ADDS: ≈ ${answer}.` },
      { value: rt2(Math.sqrt(sumSq - term * Math.abs(cosT))), feedback: `${rt2(Math.sqrt(sumSq - term * Math.abs(cosT)))} subtracts the magnitude — but cos ${t}° is already NEGATIVE, so the formula's − sign turns it into addition: ≈ ${answer}.` },
      { value: u + v, feedback: `${u + v} = ${u} + ${v} measures the path SAILED, not the straight-line gap back to the start: ≈ ${answer}.` },
    ],
    fallbackFeedback: `d = √(${u}² + ${v}² − ${term}·cos ${t}°) ≈ ${answer} km.`,
    successFeedback: `With cos ${t}° negative, the correction adds: d ≈ ${answer} km.`,
  };
}

const RT_AREA_SIDE_M = [6, 7, 8, 9] as const;
const RT_AREA_SIDE_N = [9, 10, 11, 12] as const;
const RT_AREA_ANGLES = [35, 40, 50, 65] as const;
const RT_ADJ_LEGS = [18, 20, 24, 28, 32] as const;
const RT_ADJ_ANGLES = [27, 31, 36, 42] as const;
const RT_GARDEN_P = [6, 8, 10, 12] as const;
const RT_GARDEN_Q = [10, 12, 14] as const;

function rtChooseToolWidget(rand: Rand): any {
  const job = Math.floor(rand() * 3);
  if (job === 0) {
    const m = pick(rand, RT_AREA_SIDE_M);
    const n = pick(rand, RT_AREA_SIDE_N);
    const t = pick(rand, RT_AREA_ANGLES);
    const sinT = Math.sin(t * RT_DEG);
    const answer = rt2(0.5 * m * n * sinT);
    return {
      type: "numeric",
      prompt: `Two sides measure ${m} and ${n}, meeting at ${t}°. Area (round to 2 decimals)?`,
      answer,
      tolerance: 0.02,
      commonErrors: [
        { value: rt2(m * n * sinT), feedback: `${rt2(m * n * sinT)} = ${m}·${n}·sin ${t}° forgets the ½ — that's the PARALLELOGRAM on those sides. The triangle is half: ≈ ${answer}.` },
        { value: rt2(0.5 * m * n), feedback: `${rt2(0.5 * m * n)} = ½·${m}·${n} drops the sine — correct only if the sides met at 90°. Scale by sin ${t}°: ≈ ${answer}.` },
        { value: rt2(0.5 * m * n * Math.cos(t * RT_DEG)), feedback: `${rt2(0.5 * m * n * Math.cos(t * RT_DEG))} = ½·${m}·${n}·cos ${t}° grabs cosine — but the HEIGHT is b·sin C, the opposite-style leg: ≈ ${answer}.` },
      ],
      fallbackFeedback: `Area = ½·${m}·${n}·sin ${t}° ≈ ${answer}.`,
      successFeedback: `½·${m}·${n}·sin ${t}° ≈ ${answer} — the SAS area tool.`,
    };
  }
  if (job === 1) {
    const m = pick(rand, RT_ADJ_LEGS);
    const t = pick(rand, RT_ADJ_ANGLES);
    const answer = rt2(m * Math.tan(t * RT_DEG));
    return {
      type: "numeric",
      prompt: `A RIGHT triangle: the leg adjacent to the ${t}° angle is ${m}. The opposite leg (round to 2 decimals)?`,
      answer,
      tolerance: 0.02,
      commonErrors: [
        { value: rt2(m / Math.tan(t * RT_DEG)), feedback: `${rt2(m / Math.tan(t * RT_DEG))} = ${m} ÷ tan ${t}° divides — the unknown opposite rides on TOP of tan ${t}° = x/${m}. Multiply: ≈ ${answer}.` },
        { value: rt2(m * Math.sin(t * RT_DEG)), feedback: `${rt2(m * Math.sin(t * RT_DEG))} = ${m}·sin ${t}° casts the ${m} as a hypotenuse — it's the adjacent LEG. Tangent: ≈ ${answer}.` },
        { value: rt2(m * Math.cos(t * RT_DEG)), feedback: `${rt2(m * Math.cos(t * RT_DEG))} = ${m}·cos ${t}° mixes cosine into a two-leg problem. Leg-to-leg is tangent: ≈ ${answer}.` },
      ],
      fallbackFeedback: `x = ${m}·tan ${t}° ≈ ${answer}.`,
      successFeedback: `tan ${t}° = x/${m}, so the opposite leg is ≈ ${answer}.`,
    };
  }
  const p = pick(rand, RT_GARDEN_P);
  const q = pick(rand, RT_GARDEN_Q);
  const answer = (p * q) / 4;
  return {
    type: "numeric",
    prompt: `A triangular garden bed has sides ${p} m and ${q} m meeting at 30°. Its exact area in m²?`,
    answer,
    tolerance: 0.01,
    commonErrors: [
      { value: (p * q) / 2, feedback: `${(p * q) / 2} = ½·${p}·${q} stops before the sine — that's the area if the sides met at 90°. Scale by sin 30° = ½: ${answer}.` },
      { value: rt2(((p * q) / 2) * (Math.sqrt(3) / 2)), feedback: `${rt2(((p * q) / 2) * (Math.sqrt(3) / 2))} = ½·${p}·${q}·cos 30° swaps in cosine — the height is b·SIN C. With sin 30° = ½: ${answer}.` },
      { value: p * q, feedback: `${p * q} = ${p} × ${q} is the full sides-product — missing both the ½ and the sine: ½ × ${p * q} × ½ = ${answer}.` },
    ],
    fallbackFeedback: `Area = ½·${p}·${q}·sin 30° = ${answer} m².`,
    successFeedback: `sin 30° = ½ exactly, so the area is ½·${p}·${q}·½ = ${answer} m².`,
  };
}

type RtConstantState = { fn: "sin" | "cos" | "tan"; deg: number; exact: boolean };
const RT_CONSTANT_STATES: readonly RtConstantState[] = [
  { fn: "tan", deg: 45, exact: true },
  { fn: "sin", deg: 30, exact: true },
  { fn: "cos", deg: 60, exact: true },
  { fn: "sin", deg: 45, exact: false },
  { fn: "cos", deg: 45, exact: false },
  { fn: "tan", deg: 30, exact: false },
  { fn: "tan", deg: 60, exact: false },
  { fn: "sin", deg: 60, exact: false },
  { fn: "cos", deg: 30, exact: false },
] as const;

function rtTrigConstantWidget(rand: Rand): any {
  const state = pick(rand, RT_CONSTANT_STATES);
  const { fn, deg, exact } = state;
  const raw = fn === "sin" ? Math.sin(deg * RT_DEG) : fn === "cos" ? Math.cos(deg * RT_DEG) : Math.tan(deg * RT_DEG);
  const answer = exact ? Math.round(raw * 2) / 2 : rt2(raw);
  const key = `${fn}${deg}`;
  const TRAPS: Record<string, Array<{ value: number; feedback: string }>> = {
    tan45: [
      { value: 0.71, feedback: "0.71 ≈ 1/√2 is sin 45° (leg over hypotenuse). Tangent is leg over LEG: 1/1 = 1." },
      { value: 1.41, feedback: "1.41 ≈ √2 is the hypotenuse-to-leg ratio. tan = opposite/adjacent = 1/1 = 1." },
      { value: 2, feedback: "2 doubles a leg — a 30-60-90 reflex. Here the legs are equal, so tan 45° = 1." },
    ],
    sin30: [
      { value: 0.87, feedback: "0.87 ≈ √3/2 is cos 30° — the long leg over the hypotenuse. sin 30° takes the SHORT leg: 1/2 = 0.5." },
      { value: 0.58, feedback: "0.58 ≈ 1/√3 is tan 30°. Sine divides by the HYPOTENUSE: sin 30° = 1/2 = 0.5." },
      { value: 2, feedback: "2 is the hypotenuse-to-short-leg ratio, flipped upside down. sin 30° = 1/2 = 0.5." },
    ],
    cos60: [
      { value: 0.87, feedback: "0.87 ≈ √3/2 is sin 60° — the side OPPOSITE 60°. cos 60° takes the adjacent short leg: 1/2 = 0.5." },
      { value: 1.73, feedback: "1.73 ≈ √3 is tan 60°. Cosine divides by the HYPOTENUSE: cos 60° = 1/2 = 0.5." },
    ],
    sin45: [
      { value: 1, feedback: "1 = tan 45° — the leg-over-leg ratio. Sine divides a leg by the hypotenuse √2: 1/√2 ≈ 0.71." },
      { value: 1.41, feedback: "1.41 ≈ √2 flips the ratio, hypotenuse over leg. sin 45° = 1/√2 ≈ 0.71." },
      { value: 0.5, feedback: "0.5 is sin 30°, leaking in from the other special triangle. At 45°: 1/√2 ≈ 0.71." },
    ],
    cos45: [
      { value: 1, feedback: "1 = tan 45° — the leg-over-leg ratio. Cosine divides the adjacent leg by the hypotenuse √2: 1/√2 ≈ 0.71." },
      { value: 1.41, feedback: "1.41 ≈ √2 flips the ratio, hypotenuse over leg. cos 45° = 1/√2 ≈ 0.71." },
      { value: 0.5, feedback: "0.5 is cos 60°, leaking in from the other special triangle. At 45°: 1/√2 ≈ 0.71." },
    ],
    tan30: [
      { value: 0.5, feedback: "0.5 = 1/2 is sin 30°. Tangent stays among the LEGS: short over long = 1/√3 ≈ 0.58." },
      { value: 1.73, feedback: "1.73 ≈ √3 is tan 60° — the reciprocal. For 30°, short over long: 1/√3 ≈ 0.58." },
      { value: 0.87, feedback: "0.87 ≈ √3/2 is cos 30°. tan 30° = 1/√3 ≈ 0.58." },
    ],
    tan60: [
      { value: 0.58, feedback: "0.58 ≈ 1/√3 is tan 30° — the ratio flipped. tan 60° = √3/1 ≈ 1.73." },
      { value: 0.87, feedback: "0.87 ≈ √3/2 is sin 60°, dividing by the hypotenuse. Tangent uses the LEGS: √3/1 ≈ 1.73." },
      { value: 2, feedback: "2 doubles the short leg — that builds the hypotenuse, a length. tan 60° = √3 ≈ 1.73." },
    ],
    sin60: [
      { value: 0.5, feedback: "0.5 = 1/2 is cos 60° (equally, sin 30°). The side opposite 60° is the LONG leg: √3/2 ≈ 0.87." },
      { value: 1.73, feedback: "1.73 ≈ √3 is tan 60°. Sine divides by the HYPOTENUSE: √3/2 ≈ 0.87." },
    ],
    cos30: [
      { value: 0.5, feedback: "0.5 = 1/2 is sin 30° (equally, cos 60°). Adjacent to 30° sits the LONG leg: √3/2 ≈ 0.87." },
      { value: 0.58, feedback: "0.58 ≈ 1/√3 is tan 30°. Cosine divides by the HYPOTENUSE: √3/2 ≈ 0.87." },
    ],
  };
  const printed = exact ? String(answer) : `≈ ${answer}`;
  return {
    type: "numeric",
    prompt: `Using the special right triangles (45-45-90 has sides 1, 1, √2; 30-60-90 has sides 1, √3, 2): what is ${fn} ${deg}°${exact ? " exactly" : ", rounded to 2 decimals"}?`,
    answer,
    tolerance: exact ? 0 : 0.02,
    commonErrors: TRAPS[key]!,
    fallbackFeedback: `Read ${fn} ${deg}° off the special triangle: ${printed}.`,
    successFeedback: exact
      ? `The special-triangle ratio gives ${fn} ${deg}° = ${answer} exactly.`
      : `The special-triangle ratio gives ${fn} ${deg}° ≈ ${answer} at the stated rounding.`,
  };
}

/* S331 / lane G1. The twelve numeric g10-solid-geometry forms below kept the S168/169
 * exactNumberLab conversion (answers re-derived from authored constants by the truth function)
 * but drew from 1–4 fixed pool rows, so reseeding repeated identical problems. Each builder now
 * draws a genuine dimensional state — radii, heights, densities, Pythagorean slice triples —
 * that changes the answer, keeps π at the prompt's stated 3.14159 where a decimal is requested,
 * and computes every trap from the drawn numbers. geometryIndependent.cjs parses the printed
 * prompts to re-derive every answer without reading these state tables. */

const SG_PI = 3.14159;
type SgErr = { value: number; feedback: string };
const sgLit = (value: number): any => ({ op: "lit", value });
const sgConst = (id: string): any => ({ op: "const", id });
const sgMul = (left: any, right: any): any => ({ op: "multiply", left, right });
const sgDiv = (left: any, right: any): any => ({ op: "divide", left, right });
const sgSub = (left: any, right: any): any => ({ op: "subtract", left, right });
const sgSqrt = (arg: any): any => ({ op: "sqrt", arg });
const sgRoot = (index: number, arg: any): any => ({ op: "root", index, arg });

function sgSpec(args: {
  prompt: string;
  consts: Array<{ id: string; label: string; value: number }>;
  formula: any;
  round: number;
  tolerance: number;
  errors: SgErr[];
  fallback: string;
  success: string;
}): any {
  return {
    type: "exactNumberLab",
    prompt: args.prompt,
    task: "approximationEvaluate",
    values: [],
    approxConstants: args.consts,
    approxFormula: args.formula,
    approxRound: args.round,
    answerMode: "numeric",
    tolerance: args.tolerance,
    numericErrors: args.errors,
    choices: [],
    authoredStages: [],
    requiredStageKeys: [],
    requiredExplorations: 1,
    explorationFeedback: "Inspect the required exact-number states before checking.",
    fallbackFeedback: args.fallback,
    successFeedback: args.success,
  };
}

/** (r, h, hyp) right-triangle triples reused for revolution, slices, and shears. */
const SG_TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]] as const;

function sgRevolutionWidget(rand: Rand): any {
  const job = Math.floor(rand() * 3);
  if (job === 0) {
    const [r, h] = pick(rand, [[3, 7], [4, 9], [5, 6], [6, 5], [3, 10], [4, 7], [5, 8]] as const);
    return sgSpec({
      prompt: `A ${r}-by-${h} rectangle spins about its ${h}-unit side. The swept cylinder's volume = ? (exact multiple of π — enter the coefficient)`,
      consts: [{ id: "r", label: "the radius", value: r }, { id: "h", label: "the height", value: h }],
      formula: sgMul(sgMul(sgConst("r"), sgConst("r")), sgConst("h")),
      round: 0,
      tolerance: 0.01,
      errors: [
        { value: r * h, feedback: `${r * h} = ${r} × ${h} forgets to square the radius — V = πr²h = π(${r * r})(${h}) = ${r * r * h}π.` },
        { value: h * h * r, feedback: `${h * h * r} = π(${h * h})(${r})'s coefficient spins about the WRONG side — the ${h}-side is the axis, so r = ${r}: ${r * r * h}π.` },
        { value: 2 * r * r * h, feedback: `${2 * r * r * h} doubles — the sweep counts the full circle once: π(${r * r})(${h}) = ${r * r * h}π.` },
      ],
      fallback: `The ${h}-side is the axis, so r = ${r}: V = π(${r * r})(${h}) = ${r * r * h}π.`,
      success: `Spinning about the ${h}-side sweeps radius ${r}: π(${r * r})(${h}) = ${r * r * h}π.`,
    });
  }
  if (job === 1) {
    const [a, b] = pick(rand, [[5, 12], [3, 4], [6, 8], [9, 12], [8, 15]] as const);
    const coeff = (a * a * b) / 3;
    const wrongAxis = (b * b * a) / 3;
    return sgSpec({
      prompt: `A right triangle with legs ${a} and ${b} spins about its ${b}-unit leg. The swept cone's volume coefficient (of π) = ?`,
      consts: [{ id: "r", label: "the radius", value: a }, { id: "h", label: "the height", value: b }],
      formula: sgMul(sgDiv(sgLit(1), sgLit(3)), sgMul(sgMul(sgConst("r"), sgConst("r")), sgConst("h"))),
      round: 0,
      tolerance: 0.01,
      errors: [
        { value: wrongAxis, feedback: `${wrongAxis} spins about the ${a}-leg instead (r = ${b}, h = ${a}) — the stated axis is the ${b}-leg: ⅓(${a * a})(${b}) = ${coeff}.` },
        { value: a * a * b, feedback: `${a * a * b} skips the ⅓ — a cone claims a third of its cylinder: ${coeff}.` },
        { value: (a * b) / 3, feedback: `${(a * b) / 3} = ⅓(${a})(${b}) forgets to square r — ⅓(${a}²)(${b}) = ${coeff}.` },
      ],
      fallback: `The ${b}-leg is the axis, so r = ${a}: ⅓(${a * a})(${b}) = ${coeff}.`,
      success: `Spinning about the ${b}-leg makes r = ${a}: ⅓π(${a * a})(${b}) = ${coeff}π.`,
    });
  }
  const [r, h, slant] = pick(rand, SG_TRIPLES);
  return sgSpec({
    prompt: `You need a cone of radius ${r} and height ${h} by revolution. The right triangle you spin has its ${h}-leg on the axis — how long is its hypotenuse (the cone's slant edge)?`,
    consts: [{ id: "r", label: "the radius", value: r }, { id: "h", label: "the height", value: h }],
    formula: sgSqrt({ op: "add", left: sgMul(sgConst("r"), sgConst("r")), right: sgMul(sgConst("h"), sgConst("h")) }),
    round: 0,
    tolerance: 0.01,
    errors: [
      { value: r + h, feedback: `${r + h} = ${r} + ${h} adds the legs — the hypotenuse is √(${r * r} + ${h * h}) = ${slant}.` },
      { value: slant * slant, feedback: `${slant * slant} is the squared hypotenuse — root: ${slant}.` },
    ],
    fallback: `slant = √(${r * r} + ${h * h}) = √${slant * slant} = ${slant}.`,
    success: `√(${r * r} + ${h * h}) = ${slant} — the ${r}-${h}-${slant} triple as a slant edge.`,
  });
}

function sgCavalieriWidget(rand: Rand): any {
  const job = Math.floor(rand() * 3);
  if (job === 0) {
    const B = pick(rand, [18, 24, 30, 36, 42] as const);
    const h = pick(rand, [6, 7, 8, 9] as const);
    const s = h + 2;
    return sgSpec({
      prompt: `An oblique (leaning) prism has base area ${B}, vertical height ${h}, and slant edge ${s}. Its volume = ?`,
      consts: [{ id: "B", label: "the base area", value: B }, { id: "h", label: "the vertical height", value: h }],
      formula: sgMul(sgConst("B"), sgConst("h")),
      round: 0,
      tolerance: 0.01,
      errors: [
        { value: B + h, feedback: `${B + h} = ${B} + ${h} adds — volume multiplies base by height: ${B * h}.` },
        { value: (B * h) / 2, feedback: `${(B * h) / 2} halves — no halving in prisms: Bh = ${B * h} (Cavalieri matches it to the upright twin).` },
        { value: B * s, feedback: `${B * s} = ${B} × ${s} bills the SLANT edge — Cavalieri uses the vertical height ${h}: ${B * h}.` },
      ],
      fallback: `Bh = ${B} × ${h} = ${B * h} — same slices as the upright prism at every level.`,
      success: `Bh = ${B} × ${h} = ${B * h} — same slices as the upright prism at every level.`,
    });
  }
  if (job === 1) {
    const r = pick(rand, [3, 4, 5] as const);
    const [h, s] = pick(rand, [[8, 10], [12, 13], [15, 17]] as const);
    const exact = r * r * h;
    const answer = rtRound(SG_PI * exact, 2);
    const noSquare = rtRound(SG_PI * r * h, 2);
    const slantBill = rtRound(SG_PI * r * r * s, 2);
    const halves = rtRound((SG_PI * exact) / 2, 2);
    return sgSpec({
      prompt: `A leaning cylinder has base radius ${r}, vertical height ${h}, and slant length ${s}. Volume (2 decimals, π ≈ 3.14159) = ?`,
      consts: [
        { id: "pi", label: "pi", value: SG_PI },
        { id: "r", label: "the radius", value: r },
        { id: "h", label: "the vertical height", value: h },
      ],
      formula: sgMul(sgConst("pi"), sgMul(sgMul(sgConst("r"), sgConst("r")), sgConst("h"))),
      round: 2,
      tolerance: 0.5,
      errors: [
        { value: noSquare, feedback: `${noSquare} ≈ ${r * h}π forgets to square the radius — π(${r}²)(${h}) = ${exact}π ≈ ${answer}.` },
        { value: halves, feedback: `${halves} ≈ ${exact / 2}π halves — cylinders take the full Bh: ${exact}π ≈ ${answer}.` },
        { value: slantBill, feedback: `${slantBill} ≈ ${r * r * s}π bills the slant ${s} — Cavalieri says the lean is free, so height ${h} rules: ${exact}π ≈ ${answer}.` },
      ],
      fallback: `V = π(${r * r})(${h}) = ${exact}π ≈ ${answer}.`,
      success: `The lean is free by Cavalieri: π(${r * r})(${h}) = ${exact}π ≈ ${answer}.`,
    });
  }
  const r = pick(rand, [2, 3, 4] as const);
  const [l, d, h] = pick(rand, [[10, 6, 8], [13, 5, 12], [17, 8, 15], [5, 3, 4], [25, 7, 24]] as const);
  const coeff = r * r * h;
  return sgSpec({
    prompt: `A leaning cylinder of radius ${r} has a slant edge of length ${l}, and its top face is shifted ${d} units sideways from its base. Volume coefficient (of π) = ?`,
    consts: [
      { id: "r", label: "the radius", value: r },
      { id: "l", label: "the slant length", value: l },
      { id: "d", label: "the sideways shift", value: d },
    ],
    formula: sgMul(sgMul(sgConst("r"), sgConst("r")), sgSqrt(sgSub(sgMul(sgConst("l"), sgConst("l")), sgMul(sgConst("d"), sgConst("d"))))),
    round: 0,
    tolerance: 0.01,
    errors: [
      { value: r * r * l, feedback: `${r * r * l} = ${r * r} × ${l} multiplies by the SLANT — the vertical height is √(${l}² − ${d}²) = ${h}: ${coeff}π.` },
      { value: r * r * d, feedback: `${r * r * d} = ${r * r} × ${d} uses the SHIFT as height — the shift is horizontal; h = ${h}: ${coeff}.` },
      { value: r * h, feedback: `${r * h} = ${r} × ${h} forgets to square the radius — r² = ${r * r} and h = ${h}: ${coeff}.` },
    ],
    fallback: `h = √(${l * l} − ${d * d}) = ${h}, so V = (${r * r})(${h})π = ${coeff}π.`,
    success: `The ${d}-${h}-${l} triple recovers h = ${h}: (${r * r})(${h}) = ${coeff}.`,
  });
}

function sgCavalieriApplyWidget(rand: Rand): any {
  const job = Math.floor(rand() * 3);
  if (job === 0) {
    const r = pick(rand, [3, 4, 5] as const);
    const h = pick(rand, [8, 10, 12] as const);
    const exact = r * r * h;
    const answer = rtRound(SG_PI * exact, 2);
    const prism = 4 * r * r * h;
    return sgSpec({
      prompt: `A square prism (side ${2 * r}, height ${h}) circumscribes a cylinder (radius ${r}, height ${h}). The cylinder's volume (2 decimals, π ≈ 3.14159) = ?`,
      consts: [
        { id: "pi", label: "pi", value: SG_PI },
        { id: "r", label: "the radius", value: r },
        { id: "h", label: "the height", value: h },
      ],
      formula: sgMul(sgConst("pi"), sgMul(sgMul(sgConst("r"), sgConst("r")), sgConst("h"))),
      round: 2,
      tolerance: 0.5,
      errors: [
        { value: prism, feedback: `${prism} is the PRISM (${2 * r}² × ${h}) — the cylinder claims the π/4 share of every slice: ${exact}π ≈ ${answer}.` },
        { value: rtRound(SG_PI * r * h, 2), feedback: `${rtRound(SG_PI * r * h, 2)} ≈ ${r * h}π forgets to square r — π(${r * r})(${h}) = ${exact}π ≈ ${answer}.` },
        { value: rtRound(2 * SG_PI * exact, 2), feedback: `${rtRound(2 * SG_PI * exact, 2)} ≈ ${2 * exact}π doubles — (π/4)(${prism}) = ${exact}π ≈ ${answer}.` },
      ],
      fallback: `V = π(${r * r})(${h}) = ${exact}π ≈ ${answer}.`,
      success: `Every slice keeps the π/4 share: π(${r * r})(${h}) ≈ ${answer}.`,
    });
  }
  if (job === 1) {
    const r = pick(rand, [3, 6, 9] as const);
    const h = pick(rand, [7, 8, 10, 11] as const);
    const coeff = (r * r * h) / 3;
    return sgSpec({
      prompt: `A leaning (oblique) cone: base radius ${r}, vertical height ${h}. Volume coefficient (of π) = ?`,
      consts: [{ id: "r", label: "the radius", value: r }, { id: "h", label: "the height", value: h }],
      formula: sgMul(sgDiv(sgLit(1), sgLit(3)), sgMul(sgMul(sgConst("r"), sgConst("r")), sgConst("h"))),
      round: 0,
      tolerance: 0.01,
      errors: [
        { value: r * r * h, feedback: `${r * r * h} skips the ⅓ — cones (upright or leaning) claim a third: ${coeff}.` },
        { value: (r * h) / 3, feedback: `${(r * h) / 3} = ⅓(${r})(${h}) mangles the square — ⅓(${r * r})(${h}) = ${coeff}.` },
        { value: 2 * coeff, feedback: `${2 * coeff} takes two thirds of Bh — a cone claims exactly one third: ${coeff}.` },
      ],
      fallback: `⅓(${r * r})(${h}) = ${coeff}, lean or no lean.`,
      success: `Cavalieri ignores the lean: ⅓(${r * r})(${h}) = ${coeff}.`,
    });
  }
  const [a, h] = pick(rand, [[25, 12], [16, 9], [36, 10], [49, 6], [25, 9], [16, 12], [36, 8]] as const);
  const root = Math.round(Math.sqrt(a));
  return sgSpec({
    prompt: `A curvy vase of height ${h} has horizontal cross-section area ${a}π at EVERY height — the same as a radius-${root} cylinder of height ${h}. The vase's volume coefficient (of π) = ?`,
    consts: [{ id: "a", label: "the section coefficient", value: a }, { id: "h", label: "the height", value: h }],
    formula: sgMul(sgConst("a"), sgConst("h")),
    round: 0,
    tolerance: 0.01,
    errors: [
      { value: (a * h) / 3, feedback: `${(a * h) / 3} = ⅓(${a})(${h}) applies a cone's third — constant sections mean cylinder pricing: ${a} × ${h} = ${a * h}.` },
      { value: root * h, feedback: `${root * h} = ${root} × ${h} forgets the square — the section is already ${a}π: coefficient ${a} × ${h} = ${a * h}.` },
    ],
    fallback: `Constant ${a}π sections over height ${h} give ${a * h}π.`,
    success: `Same slices as the radius-${root} cylinder: ${a} × ${h} = ${a * h}.`,
  });
}

function sgCylinderJustifiedWidget(rand: Rand): any {
  const job = Math.floor(rand() * 3);
  if (job === 0) {
    /* r = 3 is excluded: the forgot-the-square trap r·h and the sneaked-⅓ trap r²h/3 collapse
     * onto the same number exactly when r = 3, making one diagnosis unreachable. */
    const r = pick(rand, [4, 5, 6] as const);
    const h = pick(rand, [7, 8, 9] as const);
    const coeff = r * r * h;
    return sgSpec({
      prompt: `A cylinder has radius ${r} and height ${h}. Its Cavalieri twin is a prism with base area ${r * r}π and height ${h}. Both volumes' coefficient (of π) = ?`,
      consts: [{ id: "r", label: "the radius", value: r }, { id: "h", label: "the height", value: h }],
      formula: sgMul(sgMul(sgConst("r"), sgConst("r")), sgConst("h")),
      round: 0,
      tolerance: 0.01,
      errors: [
        { value: r * h, feedback: `${r * h} = ${r} × ${h} forgets the square — the base is π(${r}²) = ${r * r}π: coefficient ${coeff}.` },
        { value: rtRound(coeff / 3, 2), feedback: `${rtRound(coeff / 3, 2)} sneaks in a ⅓ — cylinders are prisms-in-spirit: full Bh = ${coeff}.` },
        { value: 2 * coeff, feedback: `${2 * coeff} doubles — ${r * r} × ${h} = ${coeff}.` },
      ],
      fallback: `Coefficient = ${r * r} × ${h} = ${coeff} for both solids.`,
      success: `Twin slices match at every level: ${r * r} × ${h} = ${coeff}.`,
    });
  }
  if (job === 1) {
    const r = pick(rand, [4, 5, 6] as const);
    const [h, s] = pick(rand, [[8, 10], [12, 13], [15, 17]] as const);
    const exact = r * r * h;
    const answer = rtRound(SG_PI * exact, 2);
    return sgSpec({
      prompt: `A leaning cylinder: radius ${r}, vertical height ${h}, slant edge ${s}. Volume (2 decimals, π ≈ 3.14159) = ?`,
      consts: [
        { id: "pi", label: "pi", value: SG_PI },
        { id: "r", label: "the radius", value: r },
        { id: "h", label: "the vertical height", value: h },
      ],
      formula: sgMul(sgConst("pi"), sgMul(sgMul(sgConst("r"), sgConst("r")), sgConst("h"))),
      round: 2,
      tolerance: 1,
      errors: [
        { value: rtRound((SG_PI * exact) / 3, 2), feedback: `${rtRound((SG_PI * exact) / 3, 2)} ≈ ${rtRound(exact / 3, 2)}π charges a cone's third — cylinders take full Bh: ${exact}π ≈ ${answer}.` },
        { value: rtRound(SG_PI * r * h, 2), feedback: `${rtRound(SG_PI * r * h, 2)} ≈ ${r * h}π forgets the square — π(${r * r})(${h}) = ${exact}π ≈ ${answer}.` },
        { value: rtRound(SG_PI * r * r * s, 2), feedback: `${rtRound(SG_PI * r * r * s, 2)} ≈ ${r * r * s}π bills the slant ${s} — vertical height is ${h}: ${exact}π ≈ ${answer}.` },
      ],
      fallback: `V = π(${r * r})(${h}) = ${exact}π ≈ ${answer}.`,
      success: `The lean never changes the slices: ${exact}π ≈ ${answer}.`,
    });
  }
  const B = pick(rand, [14, 18, 22, 26] as const);
  const L = pick(rand, [40, 50, 60] as const);
  return sgSpec({
    prompt: `A tunnel's cross-section is a constant curvy shape of area ${B} m², and the tunnel runs ${L} m. Its volume = ?`,
    consts: [{ id: "B", label: "the section area", value: B }, { id: "L", label: "the length", value: L }],
    formula: sgMul(sgConst("B"), sgConst("L")),
    round: 0,
    tolerance: 0.01,
    errors: [
      { value: B + L, feedback: `${B + L} adds — constant sections multiply: ${B} × ${L} = ${B * L} m³.` },
      { value: rtRound((B * L) / 3, 2), feedback: `${rtRound((B * L) / 3, 2)} sneaks a ⅓ — thirds belong to shrinking sections (cones); constant ones pay full: ${B * L}.` },
      { value: (B * L) / 2, feedback: `${(B * L) / 2} halves — the full run of constant ${B}-slices: ${B * L}.` },
    ],
    fallback: `V = ${B} × ${L} = ${B * L} m³ — a Cavalieri prism in disguise.`,
    success: `Constant ${B} m² slices along ${L} m give ${B * L} m³.`,
  });
}

function sgThirdStoryWidget(rand: Rand): any {
  const job = Math.floor(rand() * 3);
  if (job === 0) {
    const s = pick(rand, [6, 9, 12, 15] as const);
    const V = s * s * s;
    const each = V / 3;
    return sgSpec({
      prompt: `A cube of side ${s} (volume ${V}) is tiled by three congruent pyramids. Each pyramid's volume = ?`,
      consts: [{ id: "V", label: "the cube volume", value: V }, { id: "n", label: "the pyramid count", value: 3 }],
      formula: sgDiv(sgConst("V"), sgConst("n")),
      round: 0,
      tolerance: 0.01,
      errors: [
        { value: V / 2, feedback: `${V / 2} halves — the tiling uses THREE congruent pyramids: ${V}/3 = ${each}.` },
        { value: V, feedback: `${V} is the whole cube — one pyramid claims a third: ${each}.` },
        { value: s * s, feedback: `${s * s} is the base area — the volume is ⅓(${s * s})(${s}) = ${each}.` },
      ],
      fallback: `Each of the three congruent pyramids holds ${V}/3 = ${each}.`,
      success: `${V}/3 = ${each} — the cube's own ⅓ story.`,
    });
  }
  if (job === 1) {
    const [r, h] = pick(rand, [[3, 8], [6, 7], [3, 10], [6, 11], [9, 5]] as const);
    const B = r * r;
    const coeff = (B * h) / 3;
    return sgSpec({
      prompt: `A cone (radius ${r}, height ${h}) is matched to a pyramid of base area ${B}π and height ${h}. Both volumes' coefficient (of π) = ?`,
      consts: [{ id: "B", label: "the base coefficient", value: B }, { id: "h", label: "the height", value: h }],
      formula: sgMul(sgDiv(sgLit(1), sgLit(3)), sgMul(sgConst("B"), sgConst("h"))),
      round: 0,
      tolerance: 0.01,
      errors: [
        { value: B * h, feedback: `${B * h} skips the ⅓ — shrinking sections pay a third of Bh: ${coeff}.` },
        { value: (r * h) / 3, feedback: `${(r * h) / 3} = ⅓(${r})(${h}) forgets the square — ⅓(${B})(${h}) = ${coeff}.` },
        { value: 2 * coeff, feedback: `That's twice the answer — you took two thirds of Bh instead of one third. ⅓(${B * h}) = ${coeff}.` },
      ],
      fallback: `⅓(${B})(${h}) = ${coeff} for the cone and its pyramid twin alike.`,
      success: `Matched slices shrink together: ⅓(${B})(${h}) = ${coeff}.`,
    });
  }
  const B = pick(rand, [36, 45, 48, 54] as const);
  const h = pick(rand, [6, 9, 12] as const);
  const V = (B * h) / 3;
  return sgSpec({
    prompt: `An oblique pyramid: base area ${B}, apex hovering ${h} units above the base plane but displaced sideways. Its volume = ?`,
    consts: [{ id: "B", label: "the base area", value: B }, { id: "h", label: "the height", value: h }],
    formula: sgMul(sgDiv(sgLit(1), sgLit(3)), sgMul(sgConst("B"), sgConst("h"))),
    round: 0,
    tolerance: 0.01,
    errors: [
      { value: B * h, feedback: `${B * h} charges full Bh — pyramids (leaning or not) pay a third: ${V}.` },
      { value: (B * h) / 2, feedback: `${(B * h) / 2} halves Bh — the split is ⅓: ${V}.` },
      { value: B, feedback: `${B} is the base area alone — the volume multiplies and thirds: ⅓(${B})(${h}) = ${V}.` },
    ],
    fallback: `⅓(${B})(${h}) = ${V}, sideways apex or not.`,
    success: `The sideways apex is free by Cavalieri: ⅓(${B})(${h}) = ${V}.`,
  });
}

function sgDensityWidget(rand: Rand): any {
  const job = Math.floor(rand() * 3);
  if (job === 0) {
    const r = pick(rand, [2, 3, 4, 5] as const);
    const [metal, den] = pick(rand, [["steel", 7.8], ["aluminum", 2.7], ["copper", 8.9], ["iron", 7.9]] as const);
    const volume = (4 / 3) * SG_PI * r * r * r;
    const answer = Math.round(volume * (den as number));
    const volTrap = Math.round(volume);
    const dropThird = Math.round(4 * SG_PI * r * r * r * (den as number));
    return sgSpec({
      prompt: `A solid ${metal} sphere (radius ${r} cm, density ${den} g/cm³). Mass (nearest gram, π ≈ 3.14159) = ?`,
      consts: [
        { id: "pi", label: "pi", value: SG_PI },
        { id: "r", label: "the radius", value: r },
        { id: "d", label: "the density", value: den as number },
      ],
      formula: sgMul(sgMul(sgDiv(sgLit(4), sgLit(3)), sgMul(sgConst("pi"), sgMul(sgConst("r"), sgMul(sgConst("r"), sgConst("r"))))), sgConst("d")),
      round: 0,
      tolerance: 1,
      errors: [
        { value: volTrap, feedback: `${volTrap} is the VOLUME ((4/3)π(${r * r * r}) cm³) — multiply by the density ${den}: ≈ ${answer} g.` },
        { value: dropThird, feedback: `${dropThird} uses V = 4πr³ (dropping the /3) — the sphere holds (4/3)π(${r * r * r}): ≈ ${answer} g.` },
        { value: Math.round((4 / 3) * SG_PI * r * r * (den as number)), feedback: `${Math.round((4 / 3) * SG_PI * r * r * (den as number))} squares the radius instead of cubing — r³ = ${r * r * r}: ≈ ${answer} g.` },
      ],
      fallback: `mass = (4/3)π(${r * r * r}) × ${den} ≈ ${answer} g.`,
      success: `V = (4/3)π(${r * r * r}) ≈ ${volTrap} cm³; times ${den} g/cm³ ≈ ${answer} g.`,
    });
  }
  if (job === 1) {
    const s = pick(rand, [3, 4, 5] as const);
    const den = pick(rand, [2, 3, 5, 7, 8, 9, 11] as const);
    const V = s * s * s;
    const m = den * V;
    return sgSpec({
      prompt: `A solid cube of side ${s} cm has mass ${m} g. Its density (g/cm³) = ?`,
      consts: [{ id: "m", label: "the mass", value: m }, { id: "s", label: "the side", value: s }],
      formula: sgDiv(sgConst("m"), sgMul(sgConst("s"), sgMul(sgConst("s"), sgConst("s")))),
      round: 0,
      tolerance: 0.01,
      errors: [
        { value: m / s, feedback: `${m / s} = ${m}/${s} divides by the SIDE — divide by the volume ${s}³ = ${V}: density ${den}.` },
        { value: m / (s * s), feedback: `${m / (s * s)} = ${m}/${s * s} divides by a FACE — the volume is ${V}: ${den}.` },
        { value: rtRound(V / m, 2), feedback: `${rtRound(V / m, 2)} ≈ ${V}/${m} inverts the ratio — density = mass ÷ volume = ${m}/${V} = ${den}.` },
      ],
      fallback: `density = ${m}/${V} = ${den} g/cm³.`,
      success: `${m} g over ${V} cm³ gives ${den} g/cm³.`,
    });
  }
  const [V, rho] = pick(rand, [[200, 18.5], [150, 17.8], [250, 18.9], [180, 19.0], [220, 16.5]] as const);
  const m = Math.round((V as number) * (rho as number));
  return sgSpec({
    prompt: `A 'gold' crown has mass ${m} g and displaces ${V} cm³ of water. Pure gold's density is 19.3 g/cm³. The crown's measured density = ?`,
    consts: [{ id: "m", label: "the mass", value: m }, { id: "V", label: "the displaced volume", value: V as number }],
    formula: sgDiv(sgConst("m"), sgConst("V")),
    round: 1,
    tolerance: 0.01,
    errors: [
      { value: 19.3, feedback: `19.3 is PURE gold's card — this crown measures ${m}/${V} = ${rho}: adulterated.` },
      { value: rtRound((V as number) / m, 4), feedback: `${rtRound((V as number) / m, 4)} inverts — density = mass ÷ volume = ${rho}.` },
      { value: m * (V as number), feedback: `${m * (V as number)} multiplies — DIVIDE: ${m}/${V} = ${rho}.` },
    ],
    fallback: `density = ${m}/${V} = ${rho} g/cm³, under gold's 19.3.`,
    success: `${m}/${V} = ${rho} g/cm³ — short of pure gold's 19.3.`,
  });
}

function sgModelingWidget(rand: Rand): any {
  const job = Math.floor(rand() * 3);
  if (job === 0) {
    const C = pick(rand, [150, 176, 200, 228, 250] as const);
    const rate = pick(rand, [2, 3] as const);
    const S = rtRound(C * SG_PI, 1);
    const answer = Math.round(S * rate);
    return sgSpec({
      prompt: `Painting a silo (exposed surface ${C}π ≈ ${S} units²) at $${rate} per unit² costs about ? (nearest dollar)`,
      consts: [{ id: "S", label: "the surface area", value: S }, { id: "rate", label: "the price per unit²", value: rate }],
      formula: sgMul(sgConst("S"), sgConst("rate")),
      round: 0,
      tolerance: 2,
      errors: [
        { value: C * rate, feedback: `${C * rate} charges $${rate} on the COEFFICIENT ${C} — the surface is ${C}π ≈ ${S}: ≈ $${answer}.` },
        { value: Math.round(S * rate * 2), feedback: `${Math.round(S * rate * 2)} doubles — ${S} × ${rate} ≈ ${answer}.` },
      ],
      fallback: `${S} × $${rate} ≈ $${answer}.`,
      success: `Paint bills the surface: ${S} × ${rate} ≈ $${answer}.`,
    });
  }
  if (job === 1) {
    const k = pick(rand, [2, 3, 4, 5] as const);
    const answer = rtRound(1 / k, 3);
    return sgSpec({
      prompt: `A spherical tank's radius is scaled by ${k}. Steel (surface) per unit of capacity (volume) becomes what fraction of before? (decimal, 3 places)`,
      consts: [{ id: "k", label: "the scale factor", value: k }],
      formula: sgDiv(sgMul(sgConst("k"), sgConst("k")), sgMul(sgConst("k"), sgMul(sgConst("k"), sgConst("k")))),
      round: 3,
      tolerance: 0.01,
      errors: [
        { value: k, feedback: `${k} inverts — surface ×${k * k} over capacity ×${k * k * k} is ${k * k}/${k * k * k} = ${answer}: LESS steel per liter.` },
        { value: rtRound(1 / (k * k), 3), feedback: `${rtRound(1 / (k * k), 3)} is the pure 1/k² of surface alone — per CAPACITY it's k²/k³ = 1/${k} ≈ ${answer}.` },
        { value: 1, feedback: `1 would mean no economy — surface lags volume: ${answer}.` },
      ],
      fallback: `k²/k³ = 1/${k} ≈ ${answer}.`,
      success: `Surface ×${k * k} against capacity ×${k * k * k}: 1/${k} ≈ ${answer} of the steel per liter.`,
    });
  }
  const r = pick(rand, [3, 6, 9, 12] as const);
  const V = (4 * r * r * r) / 3;
  return sgSpec({
    prompt: `A client needs a spherical tank holding exactly ${V}π units³. The radius to build = ?`,
    consts: [{ id: "V", label: "the volume coefficient", value: V }],
    formula: sgRoot(3, sgDiv(sgMul(sgLit(3), sgConst("V")), sgLit(4))),
    round: 0,
    tolerance: 0.01,
    errors: [
      { value: r * r * r, feedback: `${r * r * r} is r³ — cube-root it: ${r}.` },
      { value: 2 * r, feedback: `${2 * r} names the diameter — the build calls for the radius: r³ = (3/4)(${V}) = ${r * r * r}, r = ${r}.` },
    ],
    fallback: `r³ = (3/4)(${V}) = ${r * r * r}, so r = ${r}.`,
    success: `(4/3)(${r * r * r}) = ${V} checks out: build radius ${r}.`,
  });
}

function sgCrossSectionsWidget(rand: Rand): any {
  if (rand() < 0.5) {
    const [rho, d, r] = pick(rand, SG_TRIPLES);
    const coeff = r * r - d * d;
    const answer = rtRound(SG_PI * coeff, 2);
    return sgSpec({
      prompt: `A sphere of radius ${r} is sliced by a plane ${d} units from its center. The cross-section's AREA (2 decimals, π ≈ 3.14159) = ?`,
      consts: [
        { id: "pi", label: "pi", value: SG_PI },
        { id: "r", label: "the sphere radius", value: r },
        { id: "d", label: "the plane distance", value: d },
      ],
      formula: sgMul(sgConst("pi"), sgSub(sgMul(sgConst("r"), sgConst("r")), sgMul(sgConst("d"), sgConst("d")))),
      round: 2,
      tolerance: 0.05,
      errors: [
        { value: rtRound(SG_PI * r * r, 2), feedback: `${rtRound(SG_PI * r * r, 2)} ≈ ${r * r}π is the GREAT circle's area — ${d} units off-center, Pythagoras shrinks the radius to ${rho}: ${coeff}π ≈ ${answer}.` },
        { value: rtRound(SG_PI * (r - d) * (r - d), 2), feedback: `${rtRound(SG_PI * (r - d) * (r - d), 2)} ≈ ${(r - d) * (r - d)}π subtracts the lengths (${r} − ${d}) before squaring — subtract the SQUARES: ${r * r} − ${d * d} = ${coeff}: ≈ ${answer}.` },
        { value: rtRound(SG_PI * d * d, 2), feedback: `${rtRound(SG_PI * d * d, 2)} ≈ ${d * d}π squares the DISTANCE (${d}) — the slice radius is ${rho}: ${coeff}π ≈ ${answer}.` },
      ],
      fallback: `area = π(${r * r} − ${d * d}) = ${coeff}π ≈ ${answer}.`,
      success: `The ${d}-${rho}-${r} triple shrinks the slice radius to ${rho}: ${coeff}π ≈ ${answer}.`,
    });
  }
  const [rho, d, r] = pick(rand, SG_TRIPLES);
  const a = rho * rho;
  return sgSpec({
    prompt: `A sphere of radius ${r} is sliced by a plane, producing a cross-section of area ${a}π. How far is the plane from the sphere's center?`,
    consts: [{ id: "r", label: "the sphere radius", value: r }, { id: "a", label: "the section coefficient", value: a }],
    formula: sgSqrt(sgSub(sgMul(sgConst("r"), sgConst("r")), sgConst("a"))),
    round: 0,
    tolerance: 0.01,
    errors: [
      { value: rho, feedback: `${rho} is the SLICE's radius (√${a}) — the distance is the other leg: √(${r * r} − ${a}) = ${d}.` },
      { value: d * d, feedback: `${d * d} is d², not d itself. Take the square root to finish: d = ${d}.` },
      { value: d / 2, feedback: `${d / 2} halves — ${r * r} − ${a} = ${d * d}, so d = ${d} (the ${rho}-${d}-${r} triple again).` },
    ],
    fallback: `d = √(${r * r} − ${a}) = ${d}.`,
    success: `√(${r * r} − ${a}) = ${d} — the ${rho}-${d}-${r} triple in a sphere.`,
  });
}

function sgSectionReasoningWidget(rand: Rand): any {
  if (rand() < 0.5) {
    const r = pick(rand, [6, 9, 12, 15] as const);
    const c = 2 * r;
    const cube = r * r * r;
    const answer = (4 * cube) / 3;
    return sgSpec({
      prompt: `A sphere's great circle has circumference ${c}π. The sphere's volume coefficient (of π) = ?`,
      consts: [{ id: "c", label: "the circumference coefficient", value: c }],
      formula: sgMul(sgDiv(sgLit(4), sgLit(3)), sgMul(sgDiv(sgConst("c"), sgLit(2)), sgMul(sgDiv(sgConst("c"), sgLit(2)), sgDiv(sgConst("c"), sgLit(2))))),
      round: 0,
      tolerance: 0.01,
      errors: [
        { value: cube, feedback: `${cube} = ${r}³ misses the 4/3 — (4/3)(${cube}) = ${answer}.` },
        { value: (4 * r * r) / 3, feedback: `${(4 * r * r) / 3} = (4/3)(${r * r}) cubes nothing — r³ = ${cube}, so (4/3)(${cube}) = ${answer}.` },
        { value: c * c, feedback: `${c * c} = ${c}² squares the circumference's coefficient — first r = ${r}, then (4/3)(${r}³) = ${answer}.` },
      ],
      fallback: `${c}π = 2πr gives r = ${r}; V-coefficient = (4/3)(${cube}) = ${answer}.`,
      success: `r = ${r} from the circumference, so (4/3)(${cube}) = ${answer}.`,
    });
  }
  const [a, d, rho] = pick(rand, [[100, 8, 6], [100, 6, 8], [169, 5, 12], [169, 12, 5], [225, 9, 12], [225, 12, 9]] as const);
  const answer = a - d * d;
  return sgSpec({
    prompt: `A sphere-shaped tank's widest horizontal section (through the center) has area ${a}π. What is the area coefficient (of π) of the section ${d} units above the center?`,
    consts: [{ id: "a", label: "the great-circle coefficient", value: a }, { id: "d", label: "the height above center", value: d }],
    formula: sgSub(sgConst("a"), sgMul(sgConst("d"), sgConst("d"))),
    round: 0,
    tolerance: 0.01,
    errors: [
      { value: a, feedback: `${a} is the great circle — ${d} up, the slice pays the d² penalty: ${a} − ${d * d} = ${answer}.` },
      { value: d * d, feedback: `${d * d} is d², the penalty itself — the remaining area coefficient is ${a} − ${d * d} = ${answer}.` },
      { value: rho, feedback: `${rho} is the slice's RADIUS — its area coefficient is ${answer}.` },
    ],
    fallback: `coefficient = ${a} − ${d}² = ${answer}.`,
    success: `${d} units up, the slice keeps ${a} − ${d * d} = ${answer}.`,
  });
}

function sgSphereJustifiedWidget(rand: Rand): any {
  const job = Math.floor(rand() * 4);
  if (job === 0) {
    const [rho, h, r] = pick(rand, SG_TRIPLES);
    const answer = r * r - h * h;
    return sgSpec({
      prompt: `r = ${r}, slicing height h = ${h}. The hemisphere's disk area AND the drilled cylinder's ring area both equal ? (coefficient of π)`,
      consts: [{ id: "r", label: "the radius", value: r }, { id: "h", label: "the slicing height", value: h }],
      formula: sgSub(sgMul(sgConst("r"), sgConst("r")), sgMul(sgConst("h"), sgConst("h"))),
      round: 0,
      tolerance: 0.01,
      errors: [
        { value: r * r, feedback: `${r * r} is the full base disk — at height ${h} both slices shrink to ${r * r} − ${h * h} = ${answer}.` },
        { value: h * h, feedback: `${h * h} is the drilled HOLE (or the h² penalty) — the surviving area is ${r * r} − ${h * h} = ${answer}.` },
        { value: rho, feedback: `${rho} is the disk's RADIUS (√${answer}) — the area coefficient is ${answer}.` },
      ],
      fallback: `Both slices measure ${r * r} − ${h * h} = ${answer} (coefficient of π).`,
      success: `Disk and ring agree at every height: ${r * r} − ${h * h} = ${answer}.`,
    });
  }
  if (job === 1) {
    const r = pick(rand, [3, 5, 6, 9] as const);
    const cyl = r * r * r;
    const answer = rtRound((2 * cyl) / 3, 2);
    const cone = rtRound(cyl / 3, 2);
    return sgSpec({
      prompt: `r = ${r}. Hemisphere volume = cylinder (${cyl}π) minus cone (${cyl}π/3). Coefficient of π (2 decimals) = ?`,
      consts: [{ id: "cyl", label: "the cylinder coefficient", value: cyl }],
      formula: sgSub(sgConst("cyl"), sgDiv(sgConst("cyl"), sgLit(3))),
      round: 2,
      tolerance: 0.05,
      errors: [
        { value: cyl, feedback: `${cyl} is the CYLINDER alone — subtract the cone's third: ${cyl} − ${cone} = ${answer}.` },
        { value: cone, feedback: `${cone} is the CONE (${cyl}/3) — the hemisphere keeps the rest: ${answer}.` },
        { value: rtRound((4 * cyl) / 3, 2), feedback: `${rtRound((4 * cyl) / 3, 2)} doubles into the full sphere — the HEMISPHERE is ${2 * cyl}/3 ≈ ${answer}.` },
      ],
      fallback: `${cyl} − ${cyl}/3 = ${2 * cyl}/3 ≈ ${answer}.`,
      success: `Cylinder minus cone leaves ${2 * cyl}/3 ≈ ${answer}.`,
    });
  }
  if (job === 2) {
    const r = pick(rand, [3, 6, 9, 12] as const);
    const cube = r * r * r;
    const answer = (4 * cube) / 3;
    return sgSpec({
      prompt: `Double the hemisphere: the full sphere's V = (4/3)πr³. For r = ${r}, the coefficient of π = ?`,
      consts: [{ id: "r", label: "the radius", value: r }],
      formula: sgMul(sgDiv(sgLit(4), sgLit(3)), sgMul(sgConst("r"), sgMul(sgConst("r"), sgConst("r")))),
      round: 0,
      tolerance: 0.01,
      errors: [
        { value: cube, feedback: `${cube} = ${r}³ misses the 4/3 — (4/3)(${cube}) = ${answer}.` },
        { value: (2 * cube) / 3, feedback: `${(2 * cube) / 3} is the HEMISPHERE (⅔ × ${cube}) — the sphere doubles: ${answer}.` },
        { value: 4 * cube, feedback: `${4 * cube} = 4(${cube}) misses the /3 — (4/3)(${cube}) = ${answer}.` },
      ],
      fallback: `(4/3)(${cube}) = ${answer}.`,
      success: `Twice the hemisphere's ⅔r³: (4/3)(${cube}) = ${answer}.`,
    });
  }
  const r = pick(rand, [3, 6, 9, 12] as const);
  const V = (4 * r * r * r) / 3;
  const answer = (4 * r) / 3;
  return sgSpec({
    prompt: `A solid sphere of radius ${r} is melted and poured into an empty cylinder of radius ${r}. The water rises to height = ?`,
    consts: [{ id: "V", label: "the sphere's volume coefficient", value: V }, { id: "r", label: "the radius", value: r }],
    formula: sgDiv(sgConst("V"), sgMul(sgConst("r"), sgConst("r"))),
    round: 0,
    tolerance: 0.01,
    errors: [
      { value: r, feedback: `${r} assumes it fills to one radius — (4/3)(${r * r * r}) = ${V} = ${r * r}h gives h = ${answer}.` },
      { value: 2 * r, feedback: `${2 * r} assumes the full diameter — the sphere holds only ⅔ of that cylinder: h = ${answer}.` },
      { value: rtRound((3 * r) / 4, 2), feedback: `${rtRound((3 * r) / 4, 2)} inverts the fraction — ${V}/${r * r} = ${answer}.` },
    ],
    fallback: `${V}π = ${r * r}πh, so h = ${answer}.`,
    success: `${V}/${r * r} = ${answer} — the sphere fills 4/3 of one radius's worth.`,
  });
}

function sgCavalieriLimitsWidget(rand: Rand): any {
  const s = pick(rand, [3, 4, 5, 6] as const);
  const [d, h, l] = pick(rand, [[5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15]] as const);
  void d;
  const answer = 4 * s * l;
  return sgSpec({
    prompt: `A sheared prism (${s}×${s} base, vertical height ${h}, slant edge ${l}). Its LATERAL surface area (the four side faces) = ?`,
    consts: [{ id: "s", label: "the base side", value: s }, { id: "l", label: "the slant edge", value: l }],
    formula: sgMul(sgMul(sgLit(4), sgConst("s")), sgConst("l")),
    round: 0,
    tolerance: 0.01,
    errors: [
      { value: 4 * s * h, feedback: `${4 * s * h} is the UPRIGHT twin's lateral surface (${4 * s} × ${h}) — the sheared sides run along ${l}: ${4 * s} × ${l} = ${answer}.` },
      { value: 8 * s * l, feedback: `${8 * s * l} doubles — four sides of ${s} × ${l} total (${4 * s})(${l}) = ${answer}.` },
      { value: s * l, feedback: `${s * l} = ${s} × ${l} is ONE face — all four: ${answer}.` },
    ],
    fallback: `Four ${s} × ${l} faces total ${answer} — Cavalieri covers volume, never surface.`,
    success: `${4 * s} × ${l} = ${answer} — the shear stretches surface even as volume holds.`,
  });
}

function sgCompositeSubtractWidget(rand: Rand): any {
  const job = Math.floor(rand() * 4);
  if (job === 0) {
    const R = pick(rand, [4, 5, 6] as const);
    const rOptions = [1, 2, 3].filter((x) => x < R && R !== 2 * x);
    const r = pick(rand, rOptions);
    const L = pick(rand, [5, 6, 8, 10] as const);
    const answer = (R * R - r * r) * L;
    return sgSpec({
      prompt: `A tube: outer radius ${R}, inner radius ${r}, length ${L}. Volume coefficient (of π) = ?`,
      consts: [
        { id: "R", label: "the outer radius", value: R },
        { id: "r", label: "the inner radius", value: r },
        { id: "L", label: "the length", value: L },
      ],
      formula: sgMul(sgSub(sgMul(sgConst("R"), sgConst("R")), sgMul(sgConst("r"), sgConst("r"))), sgConst("L")),
      round: 0,
      tolerance: 0.01,
      errors: [
        { value: R * R * L, feedback: `${R * R * L} is the SOLID outer cylinder — the bore removes (${r * r})(${L}) = ${r * r * L}: ${answer}.` },
        { value: (R - r) * (R - r) * L, feedback: `${(R - r) * (R - r) * L} = (${R}−${r})²(${L}) squares the DIFFERENCE — subtract the squares: (${R * R} − ${r * r})(${L}) = ${answer}.` },
        { value: r * r * L, feedback: `${r * r * L} is the BORE alone — the tube keeps ${R * R * L} − ${r * r * L} = ${answer}.` },
      ],
      fallback: `(${R * R} − ${r * r})(${L}) = ${answer} (coefficient of π).`,
      success: `Ring times length: (${R * R} − ${r * r})(${L}) = ${answer}.`,
    });
  }
  if (job === 1) {
    const s = pick(rand, [8, 10, 12] as const);
    const t = pick(rand, [3, 4, 5] as const);
    const r = pick(rand, [1, 2] as const);
    const block = s * s * t;
    const bore = SG_PI * r * r * t;
    const answer = rtRound(block - bore, 2);
    return sgSpec({
      prompt: `${s === 8 ? "An" : "A"} ${s} × ${s} × ${t} block has a cylindrical hole of radius ${r} drilled straight through its ${t}-unit thickness. Remaining volume (2 decimals, π ≈ 3.14159) = ?`,
      consts: [
        { id: "pi", label: "pi", value: SG_PI },
        { id: "s", label: "the block side", value: s },
        { id: "t", label: "the thickness", value: t },
        { id: "r", label: "the hole radius", value: r },
      ],
      formula: sgSub(sgMul(sgMul(sgConst("s"), sgConst("s")), sgConst("t")), sgMul(sgConst("pi"), sgMul(sgMul(sgConst("r"), sgConst("r")), sgConst("t")))),
      round: 2,
      tolerance: 0.5,
      errors: [
        { value: block, feedback: `${block} ignores the hole — the drill removes π(${r}²)(${t}) = ${r * r * t}π ≈ ${rtRound(bore, 2)}: ≈ ${answer}.` },
        { value: rtRound(block - bore / 2, 2), feedback: `${rtRound(block - bore / 2, 2)} removes only half the bore (${(r * r * t) / 2}π) — the full hole is ${r * r * t}π: ≈ ${answer}.` },
        { value: rtRound(block - 2 * bore, 2), feedback: `${rtRound(block - 2 * bore, 2)} subtracts the bore twice — once: ${block} − ${r * r * t}π ≈ ${answer}.` },
      ],
      fallback: `${block} − π(${r * r})(${t}) ≈ ${answer}.`,
      success: `Block minus bore: ${block} − ${r * r * t}π ≈ ${answer}.`,
    });
  }
  if (job === 2) {
    const s = pick(rand, [8, 10] as const);
    const t = pick(rand, [4, 5] as const);
    const r = pick(rand, [2, 3] as const);
    const block = s * s * t;
    const bowl = (2 / 3) * SG_PI * r * r * r;
    const answer = rtRound(block - bowl, 2);
    return sgSpec({
      prompt: `A hemispherical bowl of radius ${r} is carved (flat side up) into ${s === 8 ? "an" : "a"} ${s} × ${s} × ${t} block. Remaining material (2 decimals, π ≈ 3.14159) = ?`,
      consts: [
        { id: "pi", label: "pi", value: SG_PI },
        { id: "s", label: "the block side", value: s },
        { id: "t", label: "the thickness", value: t },
        { id: "r", label: "the bowl radius", value: r },
      ],
      formula: sgSub(sgMul(sgMul(sgConst("s"), sgConst("s")), sgConst("t")), sgMul(sgDiv(sgLit(2), sgLit(3)), sgMul(sgConst("pi"), sgMul(sgConst("r"), sgMul(sgConst("r"), sgConst("r")))))),
      round: 2,
      tolerance: 0.5,
      errors: [
        { value: block, feedback: `${block} ignores the carving — the hemisphere removes ⅔π(${r * r * r}) ≈ ${rtRound(bowl, 2)}: ≈ ${answer}.` },
        { value: rtRound(block - 2 * bowl, 2), feedback: `${rtRound(block - 2 * bowl, 2)} carves a FULL sphere (≈ ${rtRound(2 * bowl, 2)}) — the bowl is half: ≈ ${answer}.` },
        { value: rtRound(block - bowl / 2, 2), feedback: `${rtRound(block - bowl / 2, 2)} removes a CONE-sized ⅓π(${r * r * r}) — the carved bowl is a hemisphere holding ⅔π(${r * r * r}): ≈ ${answer}.` },
      ],
      fallback: `${block} − ⅔π(${r * r * r}) ≈ ${answer}.`,
      success: `Block minus hemisphere: ${block} − ⅔π(${r * r * r}) ≈ ${answer}.`,
    });
  }
  const ri = pick(rand, [3, 4, 5] as const);
  const w = pick(rand, [1, 2] as const);
  const ro = ri + w;
  const L = pick(rand, [40, 50, 60] as const);
  const ring = ro * ro - ri * ri;
  const answer = rtRound(SG_PI * ring * L, 2);
  return sgSpec({
    prompt: `A concrete pipe: inner (water) radius ${ri}, wall thickness ${w}, length ${L}. Concrete volume (2 decimals, π ≈ 3.14159) = ?`,
    consts: [
      { id: "pi", label: "pi", value: SG_PI },
      { id: "ri", label: "the inner radius", value: ri },
      { id: "ro", label: "the outer radius", value: ro },
      { id: "L", label: "the length", value: L },
    ],
    formula: sgMul(sgConst("pi"), sgMul(sgSub(sgMul(sgConst("ro"), sgConst("ro")), sgMul(sgConst("ri"), sgConst("ri"))), sgConst("L"))),
    round: 2,
    tolerance: 2,
    errors: [
      { value: rtRound(SG_PI * ri * ri * L, 2), feedback: `${rtRound(SG_PI * ri * ri * L, 2)} ≈ ${ri * ri * L}π prices the WATER channel — the concrete is the ring: (${ro * ro} − ${ri * ri})(${L}) = ${ring * L}π ≈ ${answer}.` },
      { value: rtRound(SG_PI * w * w * L, 2), feedback: `${rtRound(SG_PI * w * w * L, 2)} ≈ ${w * w * L}π uses (R − r)² = ${w * w} — rings difference the squares: ${ring} per length, ${ring * L}π total.` },
      { value: rtRound(SG_PI * ro * ro * L, 2), feedback: `${rtRound(SG_PI * ro * ro * L, 2)} ≈ ${ro * ro * L}π pours the pipe SOLID — subtract the channel: ${ring * L}π ≈ ${answer}.` },
    ],
    fallback: `(${ro * ro} − ${ri * ri})(${L})π = ${ring * L}π ≈ ${answer}.`,
    success: `The ring holds ${ring} per unit length: ${ring * L}π ≈ ${answer}.`,
  });
}

const SOLID_GEOMETRY_FORM_BUILDERS: Record<string, (rand: Rand) => any> = {
  "sg-revolution__numeric": sgRevolutionWidget,
  "sg-cavalieri__numeric": sgCavalieriWidget,
  "sg-cavalieri-apply__numeric": sgCavalieriApplyWidget,
  "sg-cylinder-justified__numeric": sgCylinderJustifiedWidget,
  "sg-third-story__numeric": sgThirdStoryWidget,
  "sg-density__numeric": sgDensityWidget,
  "sg-modeling__numeric": sgModelingWidget,
  "sg-cross-sections__numeric": sgCrossSectionsWidget,
  "sg-section-reasoning__numeric": sgSectionReasoningWidget,
  "sg-sphere-justified__numeric": sgSphereJustifiedWidget,
  "sg-cavalieri-limits__numeric": sgCavalieriLimitsWidget,
  "sg-composite-subtract__numeric": sgCompositeSubtractWidget,
};

/* S331 / lane G1. The twelve numeric g10-similarity forms repeated one or two fixed rows. Each
 * builder draws genuine proportional states — scale factors, hypotenuse segments, split sides —
 * that change the answer; geometryIndependent.cjs re-derives every answer from the printed
 * numbers, using integer search wherever a square root or proportion is involved. */

const SY_DILATION_PAIRS = [[8, 12], [4, 10], [5, 15], [6, 15], [5, 20], [8, 4], [12, 6]] as const;

function syDilationWidget(rand: Rand): any {
  if (rand() < 0.5) {
    const [o, i] = pick(rand, SY_DILATION_PAIRS);
    const answer = i / o;
    const inverse = rtRound(o / i, 3);
    return {
      type: "numeric",
      prompt: `An original segment is ${o} units; after a dilation its image is ${i} units. What is the scale factor?`,
      answer,
      tolerance: 0,
      commonErrors: [
        { value: i - o, feedback: `${i - o} = ${i} − ${o} is the DIFFERENCE, not the ratio. Scale factor is image ÷ original: ${i} ÷ ${o} = ${answer}.` },
        { value: inverse, feedback: `${inverse} = ${o} ÷ ${i} divides the wrong way. Scale factor is IMAGE over ORIGINAL: ${i} ÷ ${o} = ${answer}.` },
      ],
      fallbackFeedback: `scale factor = image ÷ original = ${i} ÷ ${o} = ${answer}.`,
      successFeedback: `${i} ÷ ${o} = ${answer} — every length scales by that factor.`,
    };
  }
  const k = pick(rand, [2, 3, 4, 5] as const);
  const d = pick(rand, [4, 6, 7, 9] as const);
  const kd = k * d;
  return {
    type: "numeric",
    prompt: `A dilation with center O and scale factor ${k} sends point P to P′, where OP′ = ${kd}. How far was the ORIGINAL point P from O?`,
    answer: d,
    tolerance: 0,
    commonErrors: [
      { value: kd * k, feedback: `${kd * k} = ${kd} × ${k} multiplies again — but P′ is ALREADY the image. To undo, DIVIDE: ${kd} ÷ ${k} = ${d}.` },
      { value: kd - k, feedback: `${kd - k} = ${kd} − ${k} subtracts. Dilation multiplies, so reversing divides: ${kd} ÷ ${k} = ${d}.` },
    ],
    fallbackFeedback: `OP = OP′ ÷ k = ${kd} ÷ ${k} = ${d}.`,
    successFeedback: `Undoing the ×${k} dilation puts P at ${d} units from O.`,
  };
}

const SY_ALTITUDE_PAIRS = [[4, 16], [2, 8], [3, 12], [9, 16], [4, 25], [8, 18]] as const;
const SY_LEG_STATES = [
  { p: 9, q: 16, adj: 16, leg: 20, traps: [
    { value: 12, feedback: "12 = √(9 × 16) is the ALTITUDE, not this leg. The leg adjacent to 16 is √(25 × 16) = 20." },
    { value: 15, feedback: "15 = √(25 × 9) is the leg adjacent to the OTHER segment (9). The one adjacent to 16 is √(25 × 16) = 20." },
  ] },
  { p: 9, q: 16, adj: 9, leg: 15, traps: [
    { value: 12, feedback: "12 = √(9 × 16) is the ALTITUDE, not this leg. The leg adjacent to 9 is √(25 × 9) = 15." },
    { value: 20, feedback: "20 = √(25 × 16) is the leg adjacent to the OTHER segment (16). The one adjacent to 9 is √(25 × 9) = 15." },
  ] },
  { p: 18, q: 32, adj: 32, leg: 40, traps: [
    { value: 24, feedback: "24 = √(18 × 32) is the ALTITUDE, not this leg. The leg adjacent to 32 is √(50 × 32) = 40." },
    { value: 30, feedback: "30 = √(50 × 18) is the leg adjacent to the OTHER segment (18). The one adjacent to 32 is √(50 × 32) = 40." },
  ] },
  { p: 18, q: 32, adj: 18, leg: 30, traps: [
    { value: 24, feedback: "24 = √(18 × 32) is the ALTITUDE, not this leg. The leg adjacent to 18 is √(50 × 18) = 30." },
    { value: 40, feedback: "40 = √(50 × 32) is the leg adjacent to the OTHER segment (32). The one adjacent to 18 is √(50 × 18) = 30." },
  ] },
  { p: 16, q: 20, adj: 16, leg: 24, traps: [
    { value: 36, feedback: "36 = 16 + 20 is the whole hypotenuse. The leg is √(36 × 16) = 24." },
    { value: 18, feedback: "18 = (16 + 20)/2 averages the segments. The leg adjacent to 16 is √(36 × 16) = 24." },
  ] },
  { p: 4, q: 5, adj: 4, leg: 6, traps: [
    { value: 9, feedback: "9 = 4 + 5 is the whole hypotenuse. The leg is √(9 × 4) = 6." },
    { value: 4.5, feedback: "4.5 = (4 + 5)/2 averages the segments. The leg adjacent to 4 is √(9 × 4) = 6." },
  ] },
] as const;

function sySolvingRightWidget(rand: Rand): any {
  if (rand() < 0.5) {
    const [p, q] = pick(rand, SY_ALTITUDE_PAIRS);
    const answer = Math.round(Math.sqrt(p * q));
    return {
      type: "numeric",
      prompt: `The hypotenuse segments are ${p} and ${q}. Find the altitude.`,
      answer,
      tolerance: 0,
      commonErrors: [
        { value: (p + q) / 2, feedback: `${(p + q) / 2} = (${p} + ${q})/2 is the average. The altitude is √(${p} × ${q}) = √${p * q} = ${answer}.` },
        { value: p + q, feedback: `${p + q} = ${p} + ${q} is the whole hypotenuse. The altitude is √(${p} × ${q}) = ${answer}.` },
      ],
      fallbackFeedback: `altitude = √(${p} × ${q}) = √${p * q} = ${answer}.`,
      successFeedback: `The altitude is the geometric mean of the segments: √(${p} × ${q}) = ${answer}.`,
    };
  }
  const state = pick(rand, SY_LEG_STATES);
  return {
    type: "numeric",
    prompt: `Hypotenuse segments are ${state.p} and ${state.q} (hypotenuse ${state.p + state.q}). Find the leg adjacent to the segment of length ${state.adj}.`,
    answer: state.leg,
    tolerance: 0,
    commonErrors: [...state.traps],
    fallbackFeedback: `leg = √(hypotenuse × adjacent segment) = √(${state.p + state.q} × ${state.adj}) = ${state.leg}.`,
    successFeedback: `√(${state.p + state.q} × ${state.adj}) = ${state.leg} — the leg is the geometric mean of hypotenuse and its own segment.`,
  };
}

function syScaleWidget(rand: Rand): any {
  if (rand() < 0.5) {
    const n = pick(rand, [50, 24, 100, 20] as const);
    const d = pick(rand, [6, 8, 12, 15] as const);
    const R = n * d;
    return {
      type: "numeric",
      prompt: `At scale 1 : ${n}, a real object is ${R} cm long. How long is it in the scale drawing, in cm?`,
      answer: d,
      tolerance: 0,
      commonErrors: [
        { value: R * n, feedback: `${R * n} = ${R} × ${n} goes the wrong way (that enlarges). Real-to-drawing DIVIDES: ${R} ÷ ${n} = ${d} cm.` },
        { value: R - n, feedback: `${R - n} = ${R} − ${n} subtracts. Divide by the scale: ${R} ÷ ${n} = ${d} cm.` },
      ],
      fallbackFeedback: `drawing length = ${R} ÷ ${n} = ${d} cm.`,
      successFeedback: `Dividing the real ${R} cm by ${n} gives ${d} cm on the drawing.`,
    };
  }
  const n = pick(rand, [24, 16, 30] as const);
  const b = pick(rand, [9, 12, 15, 18] as const);
  return {
    type: "numeric",
    prompt: `A blueprint has scale 1 : ${n}. A wall measures ${b} inches on the blueprint. How long is the real wall, in inches?`,
    answer: b * n,
    tolerance: 0,
    commonErrors: [
      { value: b + n, feedback: `${b + n} = ${b} + ${n} adds. Multiply by the scale: ${b} × ${n} = ${b * n} inches.` },
      { value: rtRound(b / n, 3), feedback: `${rtRound(b / n, 3)} = ${b} ÷ ${n} divides the wrong way. Blueprint-to-real multiplies: ${b} × ${n} = ${b * n} inches.` },
    ],
    fallbackFeedback: `real length = ${b} × ${n} = ${b * n} inches.`,
    successFeedback: `Each blueprint inch stands for ${n} real inches: ${b} × ${n} = ${b * n}.`,
  };
}

const SY_AREA_SIDE_STATES = [
  { m: 2, n: 5, A: 8 }, { m: 2, n: 3, A: 8 }, { m: 3, n: 4, A: 18 }, { m: 2, n: 5, A: 12 }, { m: 3, n: 5, A: 9 }, { m: 1, n: 4, A: 3 },
] as const;

function syAreaPerimeterWidget(rand: Rand): any {
  if (rand() < 0.5) {
    const k = pick(rand, [3, 4, 5, 6, 7] as const);
    return {
      type: "numeric",
      prompt: `Two similar figures have areas in the ratio ${k * k} : 1. What is the ratio of their corresponding sides?`,
      answer: k,
      tolerance: 0,
      commonErrors: [
        { value: k * k, feedback: `${k * k} is the AREA ratio. Sides scale by k, areas by k², so the side ratio is √${k * k} = ${k}.` },
        { value: (k * k) / 2, feedback: `${(k * k) / 2} = ${k * k} ÷ 2 halves it — but you need the SQUARE ROOT: √${k * k} = ${k}.` },
      ],
      fallbackFeedback: `side ratio = √(area ratio) = √${k * k} = ${k}.`,
      successFeedback: `Areas grow with the square, so sides scale by √${k * k} = ${k}.`,
    };
  }
  const { m, n, A } = pick(rand, SY_AREA_SIDE_STATES);
  const answer = (A * n * n) / (m * m);
  return {
    type: "numeric",
    prompt: `Two similar figures have sides in ratio ${m} : ${n}. The smaller has area ${A}. What is the larger's area?`,
    answer,
    tolerance: 0,
    commonErrors: [
      { value: (A * n) / m, feedback: `${(A * n) / m} = ${A} × ${n} ÷ ${m} uses the side ratio — but AREA scales by the SQUARE: ${A} × (${n}/${m})² = ${answer}.` },
      { value: A + n - m, feedback: `${A + n - m} = ${A} + ${n} − ${m} mixes operations. Area ratio is (${n}/${m})² = ${n * n}/${m * m}, so ${A} × ${n * n}/${m * m} = ${answer}.` },
    ],
    fallbackFeedback: `larger area = ${A} × (${n}/${m})² = ${answer}.`,
    successFeedback: `The (${n}/${m})² area factor lifts ${A} to ${answer}.`,
  };
}

function sySimilarityWidget(rand: Rand): any {
  const k = pick(rand, [3, 4, 5, 6, 8] as const);
  return {
    type: "numeric",
    prompt: `Two similar figures have areas in the ratio ${k * k} : 1. What is the ratio of their corresponding SIDES?`,
    answer: k,
    tolerance: 0,
    commonErrors: [
      { value: k * k, feedback: `${k * k} is the AREA ratio. Sides scale by k, areas by k², so the side ratio is √${k * k} = ${k}.` },
      { value: (k * k) / 2, feedback: `${(k * k) / 2} = ${k * k} ÷ 2 halves it — but you need the SQUARE ROOT of the area ratio: √${k * k} = ${k}.` },
    ],
    fallbackFeedback: `side ratio = √${k * k} = ${k}.`,
    successFeedback: `√${k * k} = ${k} — the side ratio is the square root of the area ratio.`,
  };
}

const SY_SAS_STATES = [
  { AD: 4, AB: 10, AE: 6 }, { AD: 3, AB: 9, AE: 5 }, { AD: 4, AB: 8, AE: 7 }, { AD: 6, AB: 9, AE: 8 }, { AD: 5, AB: 15, AE: 4 }, { AD: 6, AB: 10, AE: 9 },
] as const;

function sySasSimilarWidget(rand: Rand): any {
  const { AD, AB, AE } = pick(rand, SY_SAS_STATES);
  const AC = (AE * AB) / AD;
  return {
    type: "numeric",
    prompt: `Triangles share angle A. AD = ${AD}, AB = ${AB}, and AE = ${AE}. For the triangles to be similar by SAS~, what must AC equal?`,
    answer: AC,
    tolerance: 0,
    commonErrors: [
      { value: AE + AB - AD, feedback: `${AE + AB - AD} = ${AE} + ${AB} − ${AD} mixes operations. Use the proportion ${AD}/${AB} = ${AE}/AC → AC = ${AE} × ${AB} ÷ ${AD} = ${AC}.` },
      { value: rtRound((AD * AE) / AB, 2), feedback: `${rtRound((AD * AE) / AB, 2)} = ${AD} × ${AE} ÷ ${AB} solves the wrong ratio. Set AD/AB = AE/AC: ${AD}/${AB} = ${AE}/AC → AC = ${AC}.` },
    ],
    fallbackFeedback: `AD/AB = AE/AC gives AC = ${AE} × ${AB} ÷ ${AD} = ${AC}.`,
    successFeedback: `The shared angle plus matching ratios ${AD}/${AB} = ${AE}/${AC} secure SAS similarity.`,
  };
}

const SY_SSS_TRIANGLES = [[5, 7, 10], [4, 6, 9], [3, 5, 7], [6, 8, 11]] as const;

function sySssSimilarWidget(rand: Rand): any {
  const [a, b, c] = pick(rand, SY_SSS_TRIANGLES);
  const k = pick(rand, [2, 3, 4] as const);
  return {
    type: "numeric",
    prompt: `Triangle A has sides ${a}, ${b}, ${c}; similar triangle B has scale factor ${k}. What is B's side corresponding to A's ${b}?`,
    answer: b * k,
    tolerance: 0,
    commonErrors: [
      { value: b + k, feedback: `${b + k} = ${b} + ${k} adds. Multiply by the scale factor: ${b} × ${k} = ${b * k}.` },
      { value: rtRound(b / k, 2), feedback: `${rtRound(b / k, 2)} = ${b} ÷ ${k} divides the wrong way. B is LARGER: ${b} × ${k} = ${b * k}.` },
    ],
    fallbackFeedback: `Corresponding sides scale by ${k}: ${b} × ${k} = ${b * k}.`,
    successFeedback: `Every side of B is ${k} times A's: ${b} → ${b * k}.`,
  };
}

const SY_CRITERION_STATES = [
  { AD: 6, DB: 4, AE: 9 }, { AD: 4, DB: 4, AE: 7 }, { AD: 6, DB: 3, AE: 8 }, { AD: 8, DB: 4, AE: 10 }, { AD: 5, DB: 5, AE: 8 }, { AD: 9, DB: 3, AE: 12 },
] as const;

function syCriterionChoiceWidget(rand: Rand): any {
  const { AD, DB, AE } = pick(rand, SY_CRITERION_STATES);
  const AB = AD + DB;
  const AC = (AE * AB) / AD;
  return {
    type: "numeric",
    prompt: `In △ABC, DE ∥ BC with D on AB and E on AC. AD = ${AD}, DB = ${DB}, and AE = ${AE}. Find AC.`,
    answer: AC,
    tolerance: 0,
    commonErrors: [
      { value: AE + DB, feedback: `${AE + DB} = ${AE} + ${DB} adds the wrong pieces. Use AD/AB = AE/AC: ${AD}/${AB} = ${AE}/AC → AC = ${AC}.` },
      { value: rtRound((AE * AD) / AB, 2), feedback: `${rtRound((AE * AD) / AB, 2)} = ${AE} × ${AD} ÷ ${AB} solves an inverted ratio. Set ${AD}/${AB} = ${AE}/AC → AC = ${AE} × ${AB} ÷ ${AD} = ${AC}.` },
    ],
    fallbackFeedback: `DE ∥ BC gives AD/AB = AE/AC, so AC = ${AE} × ${AB} ÷ ${AD} = ${AC}.`,
    successFeedback: `The parallel line copies the ratio: ${AD}/${AB} = ${AE}/${AC}.`,
  };
}

const SY_SPLITTER_STATES = [
  { d: 2, e1: 6, e2: 9 }, { d: 3, e1: 8, e2: 12 }, { d: 2, e1: 10, e2: 14 }, { d: 5, e1: 4, e2: 6 }, { d: 3, e1: 10, e2: 15 },
] as const;

function sySideSplitterWidget(rand: Rand): any {
  const { d, e1, e2 } = pick(rand, SY_SPLITTER_STATES);
  const x = (d * e1) / (e2 - e1);
  return {
    type: "numeric",
    prompt: `A parallel line splits the sides: AD = x, DB = x + ${d}, AE = ${e1}, EC = ${e2}. Solve for x.`,
    answer: x,
    tolerance: 0,
    commonErrors: [
      { value: e1, feedback: `${e1} copies AE — but you must solve the proportion x/(x + ${d}) = ${e1}/${e2}. That gives x = ${x}.` },
      { value: x / 2, feedback: `${x / 2} halves the answer. From x/(x + ${d}) = ${e1}/${e2}: ${e2}x = ${e1}x + ${e1 * d} → x = ${x}.` },
    ],
    fallbackFeedback: `x/(x + ${d}) = ${e1}/${e2} cross-multiplies to ${e2}x = ${e1}(x + ${d}), so x = ${x}.`,
    successFeedback: `Cross-multiplying the split ratio gives x = ${x}.`,
  };
}

const SY_PROPORTION_STATES = [
  { AD: 6, DB: 4, AE: 9 }, { AD: 8, DB: 4, AE: 10 }, { AD: 6, DB: 3, AE: 10 }, { AD: 9, DB: 6, AE: 15 }, { AD: 10, DB: 4, AE: 15 }, { AD: 5, DB: 4, AE: 10 },
] as const;

function syProportionsFiguresWidget(rand: Rand): any {
  const { AD, DB, AE } = pick(rand, SY_PROPORTION_STATES);
  const EC = (AE * DB) / AD;
  return {
    type: "numeric",
    prompt: `A parallel line splits the sides: AD = ${AD}, DB = ${DB}, AE = ${AE}. Find EC.`,
    answer: EC,
    tolerance: 0,
    commonErrors: [
      { value: AE + DB, feedback: `${AE + DB} = ${AE} + ${DB} adds the pieces. Use ${AD}/${DB} = ${AE}/EC → EC = ${AE} × ${DB} ÷ ${AD} = ${EC}.` },
      { value: rtRound((AE * AD) / DB, 2), feedback: `${rtRound((AE * AD) / DB, 2)} = ${AE} × ${AD} ÷ ${DB} inverts the ratio. EC = ${AE} × ${DB} ÷ ${AD} = ${EC}.` },
    ],
    fallbackFeedback: `AD/DB = AE/EC gives EC = ${AE} × ${DB} ÷ ${AD} = ${EC}.`,
    successFeedback: `The split ratios match: ${AD}/${DB} = ${AE}/${EC}.`,
  };
}

const SY_GEOMEAN_STATES = [[6, 4], [6, 3], [8, 4], [10, 5], [12, 9], [6, 2]] as const;

function syGeometricMeanWidget(rand: Rand): any {
  const [h, p] = pick(rand, SY_GEOMEAN_STATES);
  const q = (h * h) / p;
  return {
    type: "numeric",
    prompt: `The altitude to a hypotenuse is ${h}, and one segment of the hypotenuse is ${p}. What is the OTHER segment?`,
    answer: q,
    tolerance: 0,
    commonErrors: [
      { value: Math.abs(h - p), feedback: `${Math.abs(h - p)} = ${h} − ${p} subtracts. Use h² = p·q: ${h * h} = ${p}·q → q = ${q}.` },
      { value: h * p, feedback: `${h * p} = ${h} × ${p} multiplies. From h² = p·q: ${h * h} = ${p}q → q = ${h * h} ÷ ${p} = ${q}.` },
    ],
    fallbackFeedback: `h² = p·q gives ${h * h} = ${p}·q, so q = ${q}.`,
    successFeedback: `The altitude is the geometric mean: ${h}² = ${p} × ${q}.`,
  };
}

const SY_INDIRECT_STATES = [
  { h: 5, s: 8, S: 32 }, { h: 6, s: 4, S: 28 }, { h: 5, s: 6, S: 42 }, { h: 4, s: 6, S: 30 }, { h: 6, s: 9, S: 45 },
] as const;

function syIndirectWidget(rand: Rand): any {
  const { h, s, S } = pick(rand, SY_INDIRECT_STATES);
  const H = (h * S) / s;
  return {
    type: "numeric",
    prompt: `A ${h}-ft person casts ${s === 8 ? "an" : "a"} ${s}-ft shadow while a building casts a ${S}-ft shadow. How tall is the building, in feet?`,
    answer: H,
    tolerance: 0,
    commonErrors: [
      { value: h + S - s, feedback: `${h + S - s} = ${h} + ${S} − ${s} mixes operations. Use ${h}/${s} = H/${S} → H = ${h} × ${S} ÷ ${s} = ${H}.` },
      { value: rtRound((s * S) / h, 1), feedback: `${rtRound((s * S) / h, 1)} = ${s} × ${S} ÷ ${h} inverts the ratio. Set ${h}/${s} = H/${S} → H = ${H}.` },
    ],
    fallbackFeedback: `The sun's rays match the ratios: ${h}/${s} = H/${S}, so H = ${H} ft.`,
    successFeedback: `Same-sun similarity gives ${h}/${s} = ${H}/${S}: the building is ${H} ft.`,
  };
}

/* S331 / lane G1. The eight numeric g10-polygons-quadrilaterals forms repeated 1–3 fixed rows.
 * Each builder draws genuine quadrilateral states — diagonals, angle lists, regular-polygon
 * sizes — that change the answer; geometryIndependent.cjs re-derives each one from the printed
 * numbers (integer search for the Pythagorean pieces, direct sums for the angle ledgers). */

const PQ_DIAG_EQ_STATES = [
  { a: 2, b: 3, c: 1, d: 8 }, { a: 3, b: 2, c: 1, d: 10 }, { a: 2, b: 5, c: 1, d: 9 }, { a: 4, b: 1, c: 2, d: 9 }, { a: 3, b: 4, c: 2, d: 7 },
] as const;

function pqParaDiagonalsWidget(rand: Rand): any {
  const job = Math.floor(rand() * 3);
  if (job === 0) {
    const D = pick(rand, [14, 18, 22, 26, 30] as const);
    return {
      type: "numeric",
      prompt: `Diagonal AC of a parallelogram measures ${D}, meeting BD at O. Find AO.`,
      answer: D / 2,
      tolerance: 0,
      commonErrors: [
        { value: D, feedback: `${D} is the WHOLE diagonal — O sits at its midpoint, so AO is half: ${D / 2}.` },
        { value: 2 * D, feedback: `${2 * D} doubles it — backwards. From whole to half: ${D}/2 = ${D / 2}.` },
      ],
      fallbackFeedback: `Parallelogram diagonals bisect each other: AO = ${D}/2 = ${D / 2}.`,
      successFeedback: `O is the midpoint, so AO = ${D / 2}.`,
    };
  }
  if (job === 1) {
    const h = pick(rand, [5, 6, 7, 9, 11] as const);
    return {
      type: "numeric",
      prompt: `In a parallelogram the diagonals meet at O, and BO = ${h}. Find the full diagonal BD.`,
      answer: 2 * h,
      tolerance: 0,
      commonErrors: [
        { value: h, feedback: `${h} is only the HALF from B to O — the diagonal continues equally beyond O: ${2 * h}.` },
        { value: 4 * h, feedback: `${4 * h} doubles the whole — BO is a half, so one doubling suffices: 2 × ${h} = ${2 * h}.` },
      ],
      fallbackFeedback: `BD = 2 × BO = 2 × ${h} = ${2 * h}.`,
      successFeedback: `The bisection makes BD twice BO: ${2 * h}.`,
    };
  }
  const { a, b, c, d } = pick(rand, PQ_DIAG_EQ_STATES);
  const x = (d - b) / (a - c);
  const half = a * x + b;
  return {
    type: "numeric",
    prompt: `With AO = ${a}x + ${b} and OC = ${c === 1 ? "" : c}x + ${d}, find the FULL diagonal AC.`,
    answer: 2 * half,
    tolerance: 0,
    commonErrors: [
      { value: x, feedback: `${x} is x — the question asks the diagonal's LENGTH. Each half is ${half}, so AC = ${2 * half}.` },
      { value: half, feedback: `${half} is one HALF (AO). The diagonal spans both halves: 2 × ${half} = ${2 * half}.` },
    ],
    fallbackFeedback: `Bisection makes AO = OC: x = ${x}, each half ${half}, AC = ${2 * half}.`,
    successFeedback: `Equal halves of ${half} give AC = ${2 * half}.`,
  };
}

/** (p, q, side): half-diagonals of a rhombus and the side they generate. */
const PQ_RHOMBUS_TRIPLES = [[5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15], [20, 21, 29]] as const;
const PQ_RECT_SIDE_STATES = [[17, 8, 15], [13, 5, 12], [25, 7, 24], [26, 10, 24], [29, 20, 21]] as const;

function pqCapstoneWidget(rand: Rand): any {
  const job = Math.floor(rand() * 3);
  if (job === 0) {
    const [p, q, side] = pick(rand, PQ_RHOMBUS_TRIPLES);
    const [d1, d2] = [2 * p, 2 * q];
    return {
      type: "numeric",
      prompt: `A quadrilateral's diagonals (${d1} and ${d2}) bisect each other at right angles. Find its side length.`,
      answer: side,
      tolerance: 0.01,
      commonErrors: [
        { value: p + q, feedback: `${p + q} = ${p} + ${q} adds the half-diagonals — they're perpendicular LEGS: √(${p}² + ${q}²) = ${side}.` },
        { value: 2 * side, feedback: `${2 * side} = √(${d1}² + ${d2}²) forgot to halve the diagonals first: √(${p}² + ${q}²) = ${side}.` },
        { value: d1 + d2, feedback: `${d1 + d2} = ${d1} + ${d2} adds full diagonals — neither halved nor Pythagorized: ${side}.` },
      ],
      fallbackFeedback: `Half-diagonals ${p} and ${q} are perpendicular legs: side = √(${p}² + ${q}²) = ${side}.`,
      successFeedback: `The rhombus certificate: √(${p}² + ${q}²) = ${side}.`,
    };
  }
  if (job === 1) {
    const [p, q, side] = pick(rand, PQ_RHOMBUS_TRIPLES);
    const [d1, d2] = [2 * p, 2 * q];
    return {
      type: "numeric",
      prompt: `A rhombus has diagonals ${d1} and ${d2}. Its perimeter = ?`,
      answer: 4 * side,
      tolerance: 0.01,
      commonErrors: [
        { value: side, feedback: `${side} is ONE side — the rhombus has four of them: ${4 * side}.` },
        { value: (d1 * d2) / 2, feedback: `${(d1 * d2) / 2} = ½ × ${d1} × ${d2} is the AREA (the perpendicular-diagonals formula) — the perimeter is 4 × ${side} = ${4 * side}.` },
        { value: 2 * (d1 + d2), feedback: `${2 * (d1 + d2)} = 2 × (${d1} + ${d2}) treats the diagonals as sides — sides are ${side} each: ${4 * side}.` },
      ],
      fallbackFeedback: `side = √(${p}² + ${q}²) = ${side}; perimeter = 4 × ${side} = ${4 * side}.`,
      successFeedback: `Four sides of ${side} wrap the rhombus in ${4 * side}.`,
    };
  }
  const [c, a, b] = pick(rand, PQ_RECT_SIDE_STATES);
  return {
    type: "numeric",
    prompt: `A quadrilateral's diagonals bisect each other AND are congruent, each measuring ${c}. One side is ${a}. Find the adjacent side.`,
    answer: b,
    tolerance: 0.01,
    commonErrors: [
      { value: c - a, feedback: `${c - a} = ${c} − ${a} subtracts lengths — Pythagoras subtracts SQUARES: √(${c * c} − ${a * a}) = ${b}.` },
      { value: rt2(Math.sqrt(c * c + a * a)), feedback: `${rt2(Math.sqrt(c * c + a * a))} ≈ √(${c * c} + ${a * a}) ADDS — but ${c} is the hypotenuse (the diagonal), so subtract: ${b}.` },
      { value: (c + a) / 2, feedback: `${(c + a) / 2} = (${c} + ${a})/2 averages — the certified rectangle calls for the right-triangle route: √(${c * c} − ${a * a}) = ${b}.` },
    ],
    fallbackFeedback: `Congruent bisecting diagonals certify a rectangle: adjacent side = √(${c}² − ${a}²) = ${b}.`,
    successFeedback: `The diagonal ${c} closes the ${a}-${b} right triangle.`,
  };
}

const PQ_TILING_STATES = [
  { shape: "hexagon", count: 3, traps: [
    { value: 6, feedback: "6 counts the hexagon's SIDES — the question counts corners around a point: 360/120 = 3." },
    { value: 4, feedback: "4 is the answer for SQUARES (360/90). Hexagon corners are 120°: 360/120 = 3." },
  ] },
  { shape: "square", count: 4, traps: [
    { value: 3, feedback: "3 is the answer for HEXAGONS (360/120). Square corners are 90°: 360/90 = 4." },
    { value: 6, feedback: "6 is the answer for TRIANGLES (360/60). Square corners are 90°: 360/90 = 4." },
  ] },
  { shape: "equilateral triangle", count: 6, traps: [
    { value: 3, feedback: "3 counts the triangle's SIDES — the question counts corners around a point: 360/60 = 6." },
    { value: 4, feedback: "4 is the answer for SQUARES (360/90). Triangle corners are 60°: 360/60 = 6." },
  ] },
] as const;

function pqRegularAnglesWidget(rand: Rand): any {
  if (rand() < 0.5) {
    const n = pick(rand, [8, 9, 10, 12, 15, 18, 20] as const);
    const ext = 360 / n;
    return {
      type: "numeric",
      prompt: `Each exterior angle of a regular ${n}-gon?`,
      answer: ext,
      tolerance: 0,
      commonErrors: [
        { value: 180 - ext, feedback: `${180 - ext}° is each INTERIOR angle. The exterior is its straight-line partner: 180 − ${180 - ext} = ${ext}°.` },
        { value: 180 / n, feedback: `${180 / n} = 180 ÷ ${n} splits a straight line — the turns split the full LAP: 360/${n} = ${ext}°.` },
      ],
      fallbackFeedback: `The exterior angles complete one lap: 360/${n} = ${ext}°.`,
      successFeedback: `360° shared by ${n} turns is ${ext}° each.`,
    };
  }
  const state = pick(rand, PQ_TILING_STATES);
  return {
    type: "numeric",
    prompt: `Regular ${state.shape}s tile a floor. How many ${state.shape}s meet at each point?`,
    answer: state.count,
    tolerance: 0,
    commonErrors: [...state.traps],
    fallbackFeedback: `Corners must fill 360° exactly, so ${state.count} ${state.shape}s meet at each point.`,
    successFeedback: `${state.count} corners of the ${state.shape} complete the full 360°.`,
  };
}

const PQ_RECT_EQ_STATES = [
  { a: 2, b: 1, d: 9 }, { a: 3, b: 2, d: 14 }, { a: 2, b: 3, d: 11 }, { a: 4, b: 3, d: 12 },
] as const;
const PQ_RECT_DIAG_TRIPLES = [[9, 12, 15], [6, 8, 10], [5, 12, 13], [8, 15, 17], [20, 21, 29]] as const;

function pqRectangleWidget(rand: Rand): any {
  if (rand() < 0.5) {
    const { a, b, d } = pick(rand, PQ_RECT_EQ_STATES);
    const x = (d - b) / (a - 1);
    const half = a * x + b;
    return {
      type: "numeric",
      prompt: `In rectangle ABCD the diagonals meet at O, with AO = ${a}x + ${b} and BO = x + ${d}. Find the FULL diagonal AC.`,
      answer: 2 * half,
      tolerance: 0.01,
      commonErrors: [
        { value: x, feedback: `${x} is x itself — the problem asks for the diagonal. AO = ${a}(${x}) + ${b} = ${half}, so AC = ${2 * half}.` },
        { value: half, feedback: `${half} is the HALF-diagonal AO. Diagonals bisect each other, so AC = 2 × ${half} = ${2 * half}.` },
        { value: half + d, feedback: `${half + d} mixes a half-diagonal with the constant ${d} — recompute: AO = BO = ${half}, AC = ${2 * half}.` },
      ],
      fallbackFeedback: `Rectangle halves are equal: ${a}x + ${b} = x + ${d} gives x = ${x}, AO = ${half}, AC = ${2 * half}.`,
      successFeedback: `All four half-diagonals measure ${half}, so AC = ${2 * half}.`,
    };
  }
  const [a, b, c] = pick(rand, PQ_RECT_DIAG_TRIPLES);
  return {
    type: "numeric",
    prompt: `A rectangle measures ${a} by ${b}. How long is each diagonal?`,
    answer: c,
    tolerance: 0.01,
    commonErrors: [
      { value: a + b, feedback: `${a + b} = ${a} + ${b} adds side lengths — Pythagoras adds their SQUARES: √(${a * a} + ${b * b}) = ${c}.` },
      { value: (a + b) / 2, feedback: `${(a + b) / 2} = (${a} + ${b})/2 averages the sides — the diagonal is a hypotenuse, not a mean: ${c}.` },
      { value: rt2(Math.sqrt(b * b - a * a)), feedback: `${rt2(Math.sqrt(b * b - a * a))} ≈ √(${b * b} − ${a * a}) subtracts squares, which finds a missing LEG. Both sides are legs here: √(${a * a} + ${b * b}) = ${c}.` },
    ],
    fallbackFeedback: `diagonal = √(${a}² + ${b}²) = √${c * c} = ${c}.`,
    successFeedback: `The ${a}-${b}-${c} triple closes the rectangle's diagonal.`,
  };
}

function pqSquareWidget(rand: Rand): any {
  if (rand() < 0.5) {
    const s = pick(rand, [4, 5, 6, 7, 8, 9] as const);
    const answer = rt2(s * Math.SQRT2);
    return {
      type: "numeric",
      prompt: `A square has side ${s}. Its diagonal (2 decimals)?`,
      answer,
      tolerance: 0.01,
      commonErrors: [
        { value: 2 * s, feedback: `${2 * s} = ${s} + ${s} adds two sides walking around the corner — the diagonal cuts across: ${s}√2 ≈ ${answer}.` },
        { value: rt2(s / Math.SQRT2), feedback: `${rt2(s / Math.SQRT2)} ≈ ${s} ÷ √2 divides — the wrong direction. Side to diagonal MULTIPLIES by √2: ≈ ${answer}.` },
        { value: s * s, feedback: `${s * s} = ${s}² is the square's AREA. The diagonal is a length: ${s}√2 ≈ ${answer}.` },
      ],
      fallbackFeedback: `diagonal = ${s}√2 ≈ ${answer}.`,
      successFeedback: `The 45-45-90 cut gives ${s}√2 ≈ ${answer}.`,
    };
  }
  const d = pick(rand, [8, 10, 12, 14] as const);
  const answer = rt2(d / Math.SQRT2);
  return {
    type: "numeric",
    prompt: `A square's DIAGONAL is ${d}. Its side (2 decimals)?`,
    answer,
    tolerance: 0.01,
    commonErrors: [
      { value: rt2(d * Math.SQRT2), feedback: `${rt2(d * Math.SQRT2)} = ${d}√2 multiplies — producing a side LONGER than the diagonal, impossible. Divide: ${d}/√2 ≈ ${answer}.` },
      { value: d / 2, feedback: `${d / 2} = ${d} ÷ 2 halves — but √2 ≈ 1.414 is the true ratio, not 2. ${d}/√2 ≈ ${answer}.` },
      { value: d * d, feedback: `${d * d} = ${d}² squares the diagonal — that's twice the AREA, not the side. ${d}/√2 ≈ ${answer}.` },
    ],
    fallbackFeedback: `side = ${d} ÷ √2 ≈ ${answer}.`,
    successFeedback: `Dividing the diagonal ${d} by √2 gives the side ≈ ${answer}.`,
  };
}

const PQ_INTERIOR_STATES = [
  { name: "pentagon", n: 5, angles: [100, 110, 95, 120] }, { name: "pentagon", n: 5, angles: [90, 130, 105, 85] },
  { name: "pentagon", n: 5, angles: [125, 95, 110, 80] }, { name: "hexagon", n: 6, angles: [130, 120, 110, 125, 105] },
  { name: "hexagon", n: 6, angles: [140, 115, 120, 100, 110] }, { name: "heptagon", n: 7, angles: [130, 140, 125, 120, 135, 115] },
] as const;

function pqInteriorSumWidget(rand: Rand): any {
  const state = pick(rand, PQ_INTERIOR_STATES);
  const G = state.angles.reduce((s, v) => s + v, 0);
  const total = (state.n - 2) * 180;
  const answer = total - G;
  const wrongTotal = (state.n - 1) * 180;
  const listText = state.angles.map((v) => `${v}°`).join(", ").replace(/, (\d+°)$/, ", and $1");
  return {
    type: "numeric",
    prompt: `${state.angles.length} angles of a ${state.name} are ${listText}. Find the ${state.n === 5 ? "fifth" : state.n === 6 ? "sixth" : "seventh"}.`,
    answer,
    tolerance: 0,
    commonErrors: [
      { value: wrongTotal - G, feedback: `${wrongTotal - G} = ${wrongTotal} − ${G} uses the ${state.n + 1}-sided sum. ${state.n} sides hold (${state.n} − 2) × 180 = ${total}°: ${answer}°.` },
      { value: G, feedback: `${G} is the given angles added up — the question wants what's LEFT of ${total}: ${answer}°.` },
    ],
    fallbackFeedback: `The ${state.name}'s angles total (${state.n} − 2) × 180 = ${total}°; subtracting ${G} leaves ${answer}°.`,
    successFeedback: `${total} − ${G} = ${answer}° completes the ${state.name}.`,
  };
}

const PQ_EXTERIOR_STATES = [
  { angles: [85, 60, 70, 75] }, { angles: [90, 80, 75, 50] }, { angles: [72, 68, 85, 70] },
  { angles: [65, 70, 55, 60, 50] }, { angles: [80, 66, 74, 60] },
] as const;

function pqExteriorSumWidget(rand: Rand): any {
  const state = pick(rand, PQ_EXTERIOR_STATES);
  const G = state.angles.reduce((s, v) => s + v, 0);
  const answer = 360 - G;
  const n = state.angles.length + 1;
  const name = n === 5 ? "pentagon" : "hexagon";
  const interiorTotal = (n - 2) * 180;
  const listText = state.angles.map((v) => `${v}°`).join(", ").replace(/, (\d+°)$/, ", and $1");
  return {
    type: "numeric",
    prompt: `${state.angles.length} exterior angles of a ${name} are ${listText}. The ${n === 5 ? "fifth" : "sixth"}?`,
    answer,
    tolerance: 0,
    commonErrors: [
      { value: interiorTotal - G, feedback: `${interiorTotal - G} = ${interiorTotal} − ${G} reaches for the INTERIOR sum. Exterior angles close a single 360° lap: ${answer}°.` },
      { value: G, feedback: `${G} is the turns so far — the last one finishes the lap: 360 − ${G} = ${answer}°.` },
    ],
    fallbackFeedback: `Exterior angles always total 360°: the missing one is 360 − ${G} = ${answer}°.`,
    successFeedback: `The lap closes: ${G} + ${answer} = 360°.`,
  };
}

const PQ_TEST_STATES = [
  { b: 4, c: 3, d: 10 }, { b: 6, c: 3, d: 8 }, { b: 3, c: 2, d: 9 }, { b: 2, c: 4, d: 13 }, { b: 5, c: 2, d: 4 },
] as const;

function pqParaTestsWidget(rand: Rand): any {
  const { b, c, d } = pick(rand, PQ_TEST_STATES);
  const x = (b + d) / (c - 1);
  const AO = x + b;
  return {
    type: "numeric",
    prompt: `Quadrilateral ABCD has diagonals meeting at O, with AO = x + ${b} and OC = ${c}x − ${d}. For what value of AO does the diagonal-bisection test apply (given BO = OD already)?`,
    answer: AO,
    tolerance: 0.01,
    commonErrors: [
      { value: x, feedback: `${x} is x — the test needs the segment length: AO = ${x} + ${b} = ${AO}.` },
      { value: 2 * AO, feedback: `${2 * AO} is the full diagonal AC after the test passes. AO alone is half: ${AO}.` },
    ],
    fallbackFeedback: `Set AO = OC: x + ${b} = ${c}x − ${d} gives x = ${x}, so AO = ${AO}.`,
    successFeedback: `With AO = OC = ${AO}, both diagonals bisect each other — a parallelogram.`,
  };
}

/* S331 / lane G1. The eight numeric g10-triangle-congruence forms repeated 1–2 fixed rows. Each
 * builder draws genuine triangle states — base angles, midsegments, centroid coordinates,
 * inequality bounds — that change the answer; geometryIndependent.cjs re-derives each from the
 * printed numbers (integer search for equations and hidden legs, loop-counting for inequality
 * ranges). */

function tcIsoscelesWidget(rand: Rand): any {
  if (rand() < 0.5) {
    const b = pick(rand, [40, 55, 65, 70, 75, 80] as const);
    const apex = 180 - 2 * b;
    return {
      type: "numeric",
      prompt: `An isosceles triangle has base angles of ${b}° each. What is its apex angle, in degrees?`,
      answer: apex,
      tolerance: 0,
      commonErrors: [
        { value: b, feedback: `${b}° is a BASE angle. The apex is what's left after both base angles: 180 − ${b} − ${b} = ${apex}°.` },
        { value: 180 - b, feedback: `${180 - b} = 180 − ${b} subtracts only ONE base angle. Subtract both: 180 − ${2 * b} = ${apex}°.` },
      ],
      fallbackFeedback: `apex = 180 − 2 × ${b} = ${apex}°.`,
      successFeedback: `The two equal base angles leave ${apex}° at the apex.`,
    };
  }
  const a = pick(rand, [40, 50, 70] as const);
  const base = (180 - a) / 2;
  const x = base / 5;
  return {
    type: "numeric",
    prompt: `An isosceles triangle has an apex angle of ${a}°. One base angle is labeled (5x)°. Find x.`,
    answer: x,
    tolerance: 0,
    commonErrors: [
      { value: base, feedback: `${base} is the base ANGLE in degrees, not x. Since 5x = ${base}, divide: x = ${x}.` },
      { value: a / 5, feedback: `${a / 5} would make 5x = ${a}, the APEX angle — but 5x is a BASE angle = ${base}, so x = ${x}.` },
    ],
    fallbackFeedback: `Each base angle is (180 − ${a})/2 = ${base}°, so 5x = ${base} and x = ${x}.`,
    successFeedback: `5x = ${base} solves to x = ${x}.`,
  };
}

function tcMidsegmentWidget(rand: Rand): any {
  if (rand() < 0.5) {
    const P = pick(rand, [24, 30, 36, 40, 48] as const);
    return {
      type: "numeric",
      prompt: `A triangle has perimeter ${P}. Connecting all three side-midpoints forms a smaller triangle. What is its perimeter?`,
      answer: P / 2,
      tolerance: 0,
      commonErrors: [
        { value: P, feedback: `${P} is the ORIGINAL perimeter. Each midsegment is half a side, so the inner perimeter halves: ${P / 2}.` },
        { value: 2 * P, feedback: `${2 * P} doubles it — the midpoint triangle is SMALLER. Each side halves, so the perimeter is ${P / 2}.` },
      ],
      fallbackFeedback: `Every midsegment is half its parallel side: inner perimeter = ${P}/2 = ${P / 2}.`,
      successFeedback: `Halving all three sides halves the perimeter to ${P / 2}.`,
    };
  }
  const S = pick(rand, [18, 22, 26, 30] as const);
  const half = S / 2;
  const x = (half - 1) / 2;
  return {
    type: "numeric",
    prompt: `A midsegment measures (2x + 1) and the side it's parallel to measures ${S}. Find x.`,
    answer: x,
    tolerance: 0,
    commonErrors: [
      { value: half, feedback: `${half} is the midsegment's LENGTH (half of ${S}), not x. Since 2x + 1 = ${half}, solve: x = ${x}.` },
      { value: (S - 1) / 2, feedback: `${(S - 1) / 2} halves ${S} − 1 instead of solving. The midsegment is ${S} ÷ 2 = ${half}, so 2x + 1 = ${half} gives x = ${x}.` },
    ],
    fallbackFeedback: `The midsegment is half the side: 2x + 1 = ${half}, so x = ${x}.`,
    successFeedback: `2(${x}) + 1 = ${half}, exactly half of ${S}.`,
  };
}

const TC_CENTROID_STATES = [[0, 6, 3], [2, 8, 5], [1, 7, 4], [3, 9, 6], [2, 5, 8], [4, 10, 7]] as const;

function tcCentroidWidget(rand: Rand): any {
  const coords = pick(rand, TC_CENTROID_STATES);
  const axis = rand() < 0.5 ? "x" : "y";
  const sum = coords[0] + coords[1] + coords[2];
  const mean = sum / 3;
  const biggest = Math.max(...coords);
  return {
    type: "numeric",
    prompt: `A triangle has vertices with ${axis}-coordinates ${coords[0]}, ${coords[1]}, and ${coords[2]}. What is the ${axis}-coordinate of the centroid?`,
    answer: mean,
    tolerance: 0,
    commonErrors: [
      { value: sum, feedback: `${sum} is the SUM of the ${axis}-coordinates. The centroid AVERAGES them: (${coords.join(" + ")}) ÷ 3 = ${mean}.` },
      { value: biggest, feedback: `${biggest} is one vertex's ${axis}-coordinate. The centroid is the average of all three: ${mean}.` },
    ],
    fallbackFeedback: `centroid ${axis} = (${coords.join(" + ")}) ÷ 3 = ${mean}.`,
    successFeedback: `The centroid balances the three vertices at ${mean}.`,
  };
}

const TC_INEQ_PAIRS = [[5, 8], [7, 12], [4, 9], [6, 13], [9, 14]] as const;
const TC_INEQ_COUNT_PAIRS = [[7, 10], [5, 8], [6, 11], [8, 13], [4, 9]] as const;

function tcTriangleInequalityWidget(rand: Rand): any {
  if (rand() < 0.5) {
    const [a, b] = pick(rand, TC_INEQ_PAIRS);
    const low = b - a;
    return {
      type: "numeric",
      prompt: `With two sides ${a} and ${b}, the third side must be GREATER than what value?`,
      answer: low,
      tolerance: 0,
      commonErrors: [
        { value: a + b, feedback: `${a + b} is the UPPER bound (${a} + ${b}) — the third must be LESS than that. The lower bound is ${b} − ${a} = ${low}.` },
        { value: 0, feedback: `Zero is too weak — a side of length ${low - 1} would fail (${low - 1} + ${a} < ${b}). The real floor is |${b} − ${a}| = ${low}.` },
      ],
      fallbackFeedback: `The third side must exceed |${b} − ${a}| = ${low} and stay under ${a + b}.`,
      successFeedback: `Any third side above ${low} (and below ${a + b}) closes the triangle.`,
    };
  }
  const [a, b] = pick(rand, TC_INEQ_COUNT_PAIRS);
  const count = 2 * a - 1;
  return {
    type: "numeric",
    prompt: `Two sides of a triangle are ${a} and ${b}. How many INTEGER values are possible for the third side?`,
    answer: count,
    tolerance: 0,
    commonErrors: [
      { value: 2 * a, feedback: `${2 * a} counts ${b - a} through ${a + b - 1} — but the third side must be strictly GREATER than ${b - a}, so drop it: ${count}.` },
      { value: a + b, feedback: `${a + b} is the upper bound itself, which is excluded. Integers strictly between ${b - a} and ${a + b} number ${count}.` },
    ],
    fallbackFeedback: `Strictly between ${b - a} and ${a + b} lie ${count} integers.`,
    successFeedback: `From ${b - a + 1} up to ${a + b - 1}: ${count} integer options.`,
  };
}

function tcCpctcWidget(rand: Rand): any {
  const v = pick(rand, [8, 11, 15, 21, 27] as const);
  return {
    type: "numeric",
    prompt: `△ABC ≅ △DEF has been proven. If AB = ${v}, what is DE?`,
    answer: v,
    tolerance: 0,
    commonErrors: [
      { value: 2 * v, feedback: `${2 * v} doubles it — but congruent triangles are the SAME size. Corresponding sides are equal: DE = ${v}.` },
      { value: v / 2, feedback: `${v / 2} halves it — congruence preserves size exactly. DE corresponds to AB, so DE = ${v}.` },
    ],
    fallbackFeedback: `Corresponding parts of congruent triangles are equal: DE = AB = ${v}.`,
    successFeedback: `CPCTC hands DE the same length: ${v}.`,
  };
}

const TC_HL_TRIPLES = [[17, 8, 15], [13, 5, 12], [25, 7, 24], [10, 6, 8], [29, 20, 21]] as const;

function tcHlWidget(rand: Rand): any {
  const [c, a, b] = pick(rand, TC_HL_TRIPLES);
  return {
    type: "numeric",
    prompt: `Two right triangles each have hypotenuse ${c} and one leg ${a}. What is the length of the other leg in each?`,
    answer: b,
    tolerance: 0,
    commonErrors: [
      { value: c - a, feedback: `${c - a} = ${c} − ${a} subtracts the sides. Use squares: √(${c}² − ${a}²) = √${b * b} = ${b}.` },
      { value: c + a, feedback: `${c + a} = ${c} + ${a} adds them. The other leg is √(${c}² − ${a}²) = √(${c * c} − ${a * a}) = ${b}.` },
    ],
    fallbackFeedback: `HL fixes the whole triangle: other leg = √(${c * c} − ${a * a}) = ${b}.`,
    successFeedback: `Both triangles close with the ${a}-${b}-${c} triple.`,
  };
}

function tcCpctcPracticeWidget(rand: Rand): any {
  const v = pick(rand, [6, 9, 13, 17, 23] as const);
  return {
    type: "numeric",
    prompt: `△ABC ≅ △DEF is proven, and BC = ${v}. By CPCTC, what is EF?`,
    answer: v,
    tolerance: 0,
    commonErrors: [
      { value: 2 * v, feedback: `${2 * v} doubles it — congruence keeps sizes equal. BC corresponds to EF, so EF = ${v}.` },
      { value: v / 2, feedback: `${v / 2} halves it — CPCTC gives EQUAL corresponding parts. EF = BC = ${v}.` },
    ],
    fallbackFeedback: `BC and EF are corresponding sides of congruent triangles: EF = ${v}.`,
    successFeedback: `CPCTC copies BC straight across: EF = ${v}.`,
  };
}

const TC_CONVERSE_STATES = [
  { k: 3, mCoeff: 2, c: 20 }, { k: 4, mCoeff: 2, c: 32 }, { k: 5, mCoeff: 4, c: 13 }, { k: 3, mCoeff: 1, c: 44 }, { k: 7, mCoeff: 5, c: 12 }, { k: 4, mCoeff: 3, c: 17 },
] as const;

function tcIsoscelesConverseWidget(rand: Rand): any {
  const { k, mCoeff, c } = pick(rand, TC_CONVERSE_STATES);
  const x = c / (k - mCoeff);
  const angle = k * x;
  return {
    type: "numeric",
    prompt: `A triangle has two base angles measuring (${k}x)° and (${mCoeff === 1 ? "" : mCoeff}x + ${c})°, and they are equal. Find the measure of each base angle, in degrees.`,
    answer: angle,
    tolerance: 0,
    commonErrors: [
      { value: x, feedback: `${x} is the value of x, not the angle. Substitute: ${k}(${x}) = ${angle}°.` },
      { value: 2 * angle, feedback: `${2 * angle} comes from adding the two expressions. They're EQUAL (${k}x = ${mCoeff === 1 ? "" : mCoeff}x + ${c} → x = ${x}), each measuring ${angle}°.` },
    ],
    fallbackFeedback: `${k}x = ${mCoeff === 1 ? "" : mCoeff}x + ${c} gives x = ${x}, so each base angle is ${angle}°.`,
    successFeedback: `Equal base angles of ${angle}° confirm the isosceles converse.`,
  };
}

const TRIANGLE_CONGRUENCE_FORM_BUILDERS: Record<string, (rand: Rand) => any> = {
  "tc-isosceles__numeric": tcIsoscelesWidget,
  "tc-midsegment__numeric": tcMidsegmentWidget,
  "tc-centroid__numeric": tcCentroidWidget,
  "tc-triangle-inequality__numeric": tcTriangleInequalityWidget,
  "tc-cpctc__numeric": tcCpctcWidget,
  "tc-hl__numeric": tcHlWidget,
  "tc-cpctc-practice__numeric": tcCpctcPracticeWidget,
  "tc-isosceles-converse__numeric": tcIsoscelesConverseWidget,
};

const POLYGON_QUAD_FORM_BUILDERS: Record<string, (rand: Rand) => any> = {
  "pq-para-diagonals__numeric": pqParaDiagonalsWidget,
  "pq-capstone__numeric": pqCapstoneWidget,
  "pq-regular-angles__numeric": pqRegularAnglesWidget,
  "pq-rectangle__numeric": pqRectangleWidget,
  "pq-square__numeric": pqSquareWidget,
  "pq-interior-sum__numeric": pqInteriorSumWidget,
  "pq-exterior-sum__numeric": pqExteriorSumWidget,
  "pq-para-tests__numeric": pqParaTestsWidget,
};

const SIMILARITY_FORM_BUILDERS: Record<string, (rand: Rand) => any> = {
  "sy-dilation__numeric": syDilationWidget,
  "sy-solving-right__numeric": sySolvingRightWidget,
  "sy-scale__numeric": syScaleWidget,
  "sy-area-perimeter__numeric": syAreaPerimeterWidget,
  "sy-similarity__numeric": sySimilarityWidget,
  "sy-sas-similar__numeric": sySasSimilarWidget,
  "sy-sss-similar__numeric": sySssSimilarWidget,
  "sy-criterion-choice__numeric": syCriterionChoiceWidget,
  "sy-side-splitter__numeric": sySideSplitterWidget,
  "sy-proportions-figures__numeric": syProportionsFiguresWidget,
  "sy-geometric-mean__numeric": syGeometricMeanWidget,
  "sy-indirect__numeric": syIndirectWidget,
};

const RIGHT_TRIANGLE_FORM_BUILDERS: Record<string, (rand: Rand) => any> = {
  "rt-pythagorean__numeric": rtPythagoreanWidget,
  "rt-pythagorean-leg__numeric": rtPythagoreanLegWidget,
  "rt-pythagorean-apply__numeric": rtPythagoreanApplyWidget,
  "rt-triples__numeric": rtTriplesWidget,
  "rt-454590__numeric": rt454590Widget,
  "rt-454590-apply__numeric": rt454590ApplyWidget,
  "rt-306090__numeric": rt306090Widget,
  "rt-sohcahtoa__numeric": rtSohcahtoaWidget,
  "rt-inverse-trig__numeric": rtInverseTrigWidget,
  "rt-elev-depress__numeric": rtElevDepressWidget,
  "rt-height-apps__numeric": rtHeightAppsWidget,
  "rt-trig-apps__numeric": rtTrigAppsWidget,
  "rt-law-sines__numeric": rtLawSinesWidget,
  "rt-law-cosines__numeric": rtLawCosinesWidget,
  "rt-choose-tool__numeric": rtChooseToolWidget,
  "rt-trig-constant__numeric": rtTrigConstantWidget,
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
          : tag === "g10-right-triangles"
            ? RIGHT_TRIANGLE_FORM_BUILDERS[form]
            : tag === "g10-solid-geometry"
              ? SOLID_GEOMETRY_FORM_BUILDERS[form]
              : tag === "g10-similarity"
                ? SIMILARITY_FORM_BUILDERS[form]
                : tag === "g10-polygons-quadrilaterals"
                  ? POLYGON_QUAD_FORM_BUILDERS[form]
                  : tag === "g10-triangle-congruence"
                    ? TRIANGLE_CONGRUENCE_FORM_BUILDERS[form]
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
