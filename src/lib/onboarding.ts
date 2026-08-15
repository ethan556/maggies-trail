/** Onboarding placement (P4): 3 adaptive questions + comfort → recommended start. Pure & unit-tested. */

export type Goal = "school" | "catchup" | "ahead";
export type GradeLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

/** 13 is the Calculus band — a year above precalculus, not a thirteenth school grade. */
export const CALCULUS_GRADE = 13 as const;

export interface PlacementOption {
  id: string;
  label: string;
  correct?: boolean;
}
export interface PlacementQuestion {
  id: string;
  prompt: string;
  options: PlacementOption[];
}

export const Q1: PlacementQuestion = {
  id: "q1",
  prompt: "4 × 6 = ?",
  options: [
    { id: "a", label: "24", correct: true },
    { id: "b", label: "10" },
    { id: "c", label: "46" }
  ]
};

/** Easier follow-up if Q1 missed. */
export const Q2_EASY: PlacementQuestion = {
  id: "q2e",
  prompt: "3 bags with 2 apples in each — how many apples?",
  options: [
    { id: "a", label: "6", correct: true },
    { id: "b", label: "5" },
    { id: "c", label: "32" }
  ]
};

/** Harder follow-up if Q1 correct. */
export const Q2_HARD: PlacementQuestion = {
  id: "q2h",
  prompt: "20 ÷ 5 = ?",
  options: [
    { id: "a", label: "4", correct: true },
    { id: "b", label: "15" },
    { id: "c", label: "100" }
  ]
};

export const Q3: PlacementQuestion = {
  id: "q3",
  prompt: "In the number 72, what is the 7 worth?",
  options: [
    { id: "a", label: "70", correct: true },
    { id: "b", label: "7" },
    { id: "c", label: "2" }
  ]
};

/** Adaptive branch: the second question depends on the first answer. */
export function secondQuestion(q1Correct: boolean): PlacementQuestion {
  return q1Correct ? Q2_HARD : Q2_EASY;
}

export interface Recommendation {
  lessonId: string;
  courseSlug: string;
  note: string;
}

/**
 * Placement rules (logged in DECISIONS):
 * - shaky (≤1 correct, or lowest comfort) → very start of the flagship trail
 * - 2 correct + some comfort → skip to Meet Division (soft skip; adaptive flow guards it)
 * - 3 correct + high comfort → start Place Value (facts assumed solid)
 * - 3 correct + modest comfort → Fact Fluency chapter (knows ideas, sharpen speed)
 */
export function recommend(comfort: 1 | 2 | 3, correctCount: number): Recommendation {
  if (correctCount <= 1 || comfort === 1) {
    return {
      lessonId: "mult-01-01",
      courseSlug: "multiplication-division",
      note: "We'll start at the trailhead: what multiplication really is."
    };
  }
  if (correctCount === 2) {
    return {
      lessonId: "mult-02-01",
      courseSlug: "multiplication-division",
      note: "Multiplication basics look familiar — we'll start where division begins. You can always walk back."
    };
  }
  if (comfort === 3) {
    return {
      lessonId: "pv-01-01",
      courseSlug: "place-value",
      note: "Your facts look solid — start with Place Value & Big Numbers, and revisit the flagship trail any time."
    };
  }
  return {
    lessonId: "mult-03-01",
    courseSlug: "multiplication-division",
    note: "You know the ideas — we'll sharpen speed in Fact Fluency first."
  };
}

/**
 * [P9/P10] Grades 4 and 5 have no calibrated adaptive placement quiz yet
 * (deliberately — see DECISIONS.md: simplicity over cleverness, rather than
 * rushing an uncalibrated new quiz). Instead, a Grade 4 or 5 learner picks
 * directly among that grade's live trails. Extend these arrays as more
 * courses ship. Grade 3 keeps the calibrated comfort/placement path.
 */
export interface GradeTrail {
  id: string;
  title: string;
  tagline: string;
  lessonId: string;
}

/** Back-compat alias — earlier code referenced G4Trail. */
export type G4Trail = GradeTrail;

/**
 * Grade 1 trails. Only the flagship course (add-subtract-20) has authored content so far;
 * the other planned G1 courses (counting-120, tens-and-ones, shapes-measure-g1) join here
 * once authored. Recommended entry lesson is as-01-01.
 */
export const K_TRAILS: GradeTrail[] = [
  {
    id: "counting-to-20-k",
    title: "Kindergarten: Counting & Numbers",
    tagline: "Count objects, compare groups, meet the teen numbers, and put numbers together and apart.",
    lessonId: "kc-01-01"
  },
  {
    id: "shapes-and-sorting-k",
    title: "Kindergarten: Shapes & Sorting",
    tagline: "Name flat and solid shapes, tell where things are, and compare and sort the world.",
    lessonId: "ks-01-01"
  }
];

export const G1_TRAILS: GradeTrail[] = [
  {
    id: "counting-120",
    title: "Count & Write to 120",
    tagline: "Count past twenty, fill the 120 chart, and jump by ones and tens.",
    lessonId: "c120-01-01"
  },
  {
    id: "add-subtract-20",
    title: "Adding & Subtracting to 20",
    tagline: "Count on, make ten, and take away — the moves every math trail is built on.",
    lessonId: "as-01-01"
  },
  {
    id: "tens-and-ones",
    title: "Tens & Ones",
    tagline: "Bundle ten ones into a ten, break numbers into expanded form, add and subtract tens, and compare two-digit numbers.",
    lessonId: "tno-01-01"
  },
  {
    id: "shapes-measure-g1",
    title: "Shapes, Fractions & Measurement",
    tagline: "Tell flat shapes from solids, split shapes into halves and fourths, compare lengths, and tell time to the hour and half-hour.",
    lessonId: "smg1-01-01"
  }
];

export const G2_TRAILS: GradeTrail[] = [
  {
    id: "add-subtract-100",
    title: "Addition & Subtraction within 100",
    tagline: "Doubles, regrouping, two-step stories, and odd vs. even — arithmetic grows to 100.",
    lessonId: "as100-01-01"
  },
  {
    id: "place-value-1000",
    title: "Place Value to 1,000",
    tagline: "Meet hundreds, count to 1,000, compare 3-digit numbers, and add and subtract with concrete strategies.",
    lessonId: "pv1000-01-01"
  },
  {
    id: "measure-money-time",
    title: "Measurement, Money & Time",
    tagline: "Measure length in standard units, estimate and compare lengths, count coins, and tell time to five minutes.",
    lessonId: "mmt-01-01"
  },
  {
    id: "shapes-shares-g2",
    title: "Shapes & Equal Shares",
    tagline: "Meet bigger shape families and pyramids, count grids of unit squares, and split wholes into thirds.",
    lessonId: "ssg2-01-01"
  }
];

/* S242 (UX-01). Grade 3 was the one grade with no direct-pick trails, and the onboarding flow
 * offered it the "Start at my grade level" route anyway — which set stage `gradetrail`, mapped over
 * an empty array, and rendered a heading with nothing under it. A first-run learner picking the
 * single most common elementary grade reached a screen with no way forward.
 *
 * The selection rule here is the one the other grades already use, not a new judgement: offer the
 * BROAD DOMAIN ENTRY POINTS and leave the narrow fluency/extension courses to placement and the
 * trail map. Grade 2 offers 4 of its 11 courses on exactly that basis (place value, add/subtract,
 * measurement/money/time, shapes/shares — not fluency-20-g2, four-addends-g2, number-line-g2,
 * arrays-even-odd-g2, length-problems-g2, data-line-plots-g2). Applying it to Grade 3's ten courses
 * keeps these five and omits add-subtract-1000-g3, division-fluency-g3, fractions-deeper-g3,
 * mult-fluency-g3 and word-problems-g3, all of which remain fully reachable by placement.
 *
 * Multiplication/division and fractions lead because they are the two ideas Grade 3 exists to
 * introduce; the remaining three carry the other domains so no strand is unreachable from a
 * direct pick. Every `lessonId` below is the course's first lesson, verified against the manifest.
 *
 * VERIFIED against `content/standards/course-crosswalk.json`, not just asserted. These five map
 * one-to-one onto the five CCSS Grade 3 domains — multiplication-division 3.OA, place-value 3.NBT,
 * fractions 3.NF, measurement-data 3.MD, shapes-space 3.G — with complete coverage and no domain
 * offered twice. The five omitted courses carry NO CCSS domain code at all (they are absent from
 * the crosswalk), which is the crosswalk's own way of saying they are fluency and extension
 * courses rather than domain entry points: nothing is reachable only by an omitted course. That
 * puts Grade 3 in the same tier as G2, G6 and G7, the three grades whose offers are exactly
 * one-per-domain. (For contrast, G4 offers 2 trails covering only 4.NBT, leaving 4.OA, 4.NF, 4.MD
 * and 4.G with no direct pick at all — a real gap, but a different grade's problem.) */
export const G3_TRAILS: GradeTrail[] = [
  {
    id: "multiplication-division",
    title: "Multiplication & Division Foundations",
    tagline: "Equal groups, arrays and area — and division as the same picture read the other way round.",
    lessonId: "mult-01-01"
  },
  {
    id: "fractions",
    title: "Fractions from Scratch",
    tagline: "A fraction as a number on the line, not a piece of pie — naming, comparing and finding equal shares.",
    lessonId: "fr-01-01"
  },
  {
    id: "place-value",
    title: "Place Value & Big Numbers",
    tagline: "Rounding, comparing and adding past a thousand, with the place chart doing the explaining.",
    lessonId: "pv-01-01"
  },
  {
    id: "measurement-data",
    title: "Measurement, Time & Data",
    tagline: "Time to the minute, mass and volume, and picture graphs that answer a question worth asking.",
    lessonId: "md-01-01"
  },
  {
    id: "shapes-space",
    title: "Shapes & Space",
    tagline: "Sorting shapes by what they actually share, and splitting them into equal parts.",
    lessonId: "geo-01-01"
  }
];

/* S242. Grade 4 offered two trails and BOTH were 4.NBT — multiply-bigger and place-value-million —
 * so a learner picking directly could reach one domain and only one. 4.NF, 4.G and 4.MD each had a
 * course sitting in the catalogue with no way to pick it. That is not a dead end (the picker was
 * never empty, so the S242 branch test passed) but "not a dead end" is a weaker property than
 * "covers its grade", and the gap was invisible until the offers were checked against
 * `content/standards/course-crosswalk.json`.
 *
 * The three additions below are the only grade-4 courses carrying those codes: fractions-add
 * (4.NF), lines-angles (4.G), measure-convert (4.MD). Grade 4 has exactly five courses in the
 * crosswalk, so this offers all five. 4.NBT remains offered twice, deliberately — multiply-bigger
 * and place-value-million are genuinely different entry points, and dropping one would remove a
 * shipped choice for no coverage gain. Duplication is fine; an uncovered domain is not, and that is
 * the distinction `onboarding.branches.s242.test.ts` now enforces.
 *
 * NOTE 4.OA is not a gap: no course in the crosswalk carries it at any grade. */
export const G4_TRAILS: GradeTrail[] = [
  {
    id: "multiply-bigger",
    title: "Multiply Bigger",
    tagline: "Comparisons, factors, and the area model for any-size multiplication.",
    lessonId: "mb-01-01"
  },
  {
    id: "place-value-million",
    title: "Place Value to a Million",
    tagline: "Climb the ×10 ladder — reading, rounding, and comparing big numbers.",
    lessonId: "pv2-01-01"
  },
  {
    id: "fractions-add",
    title: "Fractions That Add Up",
    tagline: "Equivalence earns its rule — then like denominators add, mixed numbers behave, and a fraction meets a whole number.",
    lessonId: "fa-01-01"
  },
  {
    id: "measure-convert",
    title: "Measure & Convert",
    tagline: "Units that trade places, area and perimeter formulas, and angles that open in degrees and add.",
    lessonId: "mc-01-01"
  },
  {
    id: "lines-angles",
    title: "Lines & Angles",
    tagline: "Points, rays and right angles — sorting shapes by the angles they carry, and finding the lines they fold along.",
    lessonId: "la-01-01"
  }
];

export const G5_TRAILS: GradeTrail[] = [
  {
    id: "decimals-place-value",
    title: "Powers of Ten & Decimals",
    tagline: "Take the ×10 ladder below one — tenths, hundredths, comparing and rounding.",
    lessonId: "dpv-01-01"
  },
  {
    id: "decimal-operations",
    title: "Decimal & Whole-Number Operations",
    tagline: "Order of operations, the standard algorithms, and arithmetic across the point.",
    lessonId: "dop-01-01"
  },
  {
    id: "fractions-multiply",
    title: "Multiplying & Dividing Fractions",
    tagline: "Unlike denominators, the area model, scaling, and dividing with unit fractions.",
    lessonId: "fm-01-01"
  },
  {
    id: "volume-measurement",
    title: "Volume & Measurement",
    tagline: "Unit conversions, line plots with fractions, and volume from unit cubes to composite solids.",
    lessonId: "vm-01-01"
  },
  {
    id: "coordinate-geometry",
    title: "The Coordinate Plane & Shape Families",
    tagline: "Plot points, turn number patterns into graphs, and sort every shape into its family tree.",
    lessonId: "cg-01-01"
  }
];

export const G6_TRAILS: GradeTrail[] = [
  {
    id: "ratios-rates",
    title: "Ratios & Rates",
    tagline: "Two quantities, one relationship — the idea that runs all of middle school.",
    lessonId: "rr-01-01"
  },
  {
    id: "number-system",
    title: "The Number System",
    tagline: "Divide fractions, master decimals, and step below zero for the first time.",
    lessonId: "ns-01-01"
  },
  {
    id: "expressions-equations",
    title: "Expressions & Equations",
    tagline: "Exponents, variables, and solving your first real equations.",
    lessonId: "ee-01-01"
  },
  {
    id: "area-surface-volume",
    title: "Area, Surface Area & Volume",
    tagline: "Measure triangles, prisms, and every composite shape in between.",
    lessonId: "asv-01-01"
  },
  {
    id: "data-distributions",
    title: "Data & Distributions",
    tagline: "Ask statistical questions, picture the answers, and summarize what you see.",
    lessonId: "dd-01-01"
  }
];

export const HS_TRAILS: GradeTrail[] = [
  {
    id: "statistical-inference",
    title: "Statistical Inference",
    tagline: "How the data was made, how much an estimate wobbles, what a margin of error really promises, and how to tell a real difference from a lucky one.",
    lessonId: "si-01-01"
  },
  {
    id: "conditional-probability",
    title: "Conditional Probability & the Rules of Chance",
    tagline: "Events as sets, conditioning on what you know, independence, and counting your way to a probability.",
    lessonId: "cpr-01-01"
  },
  {
    id: "solving-equations",
    title: "Algebra 1: Solving Linear Equations",
    tagline: "Two-step machines, both-sides balances, parentheses, fractions, and the flip rule.",
    lessonId: "alg1-01-01"
  },
  {
    id: "linear-functions",
    title: "Algebra 1: Linear Functions",
    tagline: "Slope, graphing lines, slope-intercept, point-slope, standard form, and writing equations of lines.",
    lessonId: "lf-01-01"
  },
  {
    id: "systems-equations",
    title: "Algebra 1: Systems of Linear Equations",
    tagline: "Solve two lines at once — by graphing, substitution, and elimination — and turn word problems into systems.",
    lessonId: "se-01-01"
  },
  {
    id: "exponents-polynomials",
    title: "Algebra 1: Exponents & Polynomials",
    tagline: "Master the exponent rules, then build, multiply, and factor the polynomials that follow from them.",
    lessonId: "ep-01-01"
  },
  {
    id: "quadratics",
    title: "Algebra 1: Quadratic Functions",
    tagline: "Graph parabolas, solve quadratics by factoring, the square-root method and the quadratic formula, and apply them to motion and area.",
    lessonId: "qu-01-01"
  },
  {
    id: "exponential-functions",
    title: "Algebra 1: Exponential Functions",
    tagline: "Evaluate and model exponential growth and decay, solve exponential equations by matching bases, and compare exponential with linear growth.",
    lessonId: "exp-01-01"
  },
  {
    id: "radicals-and-exponents",
    title: "Algebra 1: Radicals & Rational Exponents",
    tagline: "Simplify and combine radicals, work with rational exponents, and apply the Pythagorean theorem and the distance formula.",
    lessonId: "rad-01-01"
  },
  {
    id: "functions-and-sequences",
    title: "Algebra 1: Functions & Sequences",
    tagline: "Evaluate functions, find domain and range, and work with arithmetic and geometric sequences and their nth-term formulas.",
    lessonId: "fn-01-01"
  },
  {
    id: "function-transformations",
    title: "Algebra 2: Functions & Transformations",
    tagline: "Parent functions, domain and range, shifts, flips, stretches, composition, and inverses.",
    lessonId: "ft-01-01"
  },
  {
    id: "complex-numbers",
    title: "Algebra 2: Complex Numbers & Quadratics",
    tagline: "Complete the square, meet i, master complex arithmetic, and finish the discriminant story every quadratic deserves.",
    lessonId: "cn-01-01"
  },
  {
    id: "polynomial-functions",
    title: "Algebra 2: Polynomial Functions",
    tagline: "Read end behavior, hunt zeros with multiplicity, divide and factor higher-degree polynomials, and sketch the whole curve.",
    lessonId: "pf-01-01"
  },
  {
    id: "radical-functions",
    title: "Algebra 2: Radical Functions & Equations",
    tagline: "Put variables under radicals and into rational exponents, rationalize like a pro, graph radical functions, and solve equations without falling for phantoms.",
    lessonId: "re-01-01"
  },
  {
    id: "rational-functions",
    title: "Algebra 2: Rational Functions",
    tagline: "Fractions grow up: simplify polynomial ratios, track forbidden inputs, read asymptotes and holes off a graph, and solve the equations they create.",
    lessonId: "rf-01-01"
  },
  {
    id: "logarithms",
    title: "Algebra 2: Exponentials & Logarithms",
    tagline: "Meet the exponential's inverse: evaluate logs by asking the right question, wield the three properties, crack equations no base-matching can touch, and model continuous growth with e.",
    lessonId: "lg-01-01"
  },
  {
    id: "sequences-series",
    title: "Algebra 2: Sequences & Series",
    tagline: "From recursive rules to sums that run forever: read and write sigma notation, fold arithmetic series Gauss-style, shift-and-subtract geometric ones, and tame infinity with |r| < 1.",
    lessonId: "sr-01-01"
  },
  {
    id: "trig-functions",
    title: "Algebra 2: Trigonometric Functions",
    tagline: "From SOH-CAH-TOA to the unit circle and the sine wave: solve triangles, speak radians, master reference angles and exact values, tune amplitude and period, and model ferris wheels and tides.",
    lessonId: "tf-01-01"
  },
  {
    id: "geometry-foundations",
    title: "Geometry: Foundations & Rigid Motions",
    tagline: "Undefined terms, definitions that sort perfectly, transformations as functions, symmetry — and congruence defined the honest way: a rigid motion exists.",
    lessonId: "gf-01-01"
  },
  {
    id: "constructions-and-proof",
    title: "Geometry: Constructions & Proof",
    tagline: "Compass-and-straightedge constructions with the reasons they work, then your first real proofs — vertical angles, the transversal theorems, and their converses.",
    lessonId: "cp-01-01"
  },
  {
    id: "triangle-congruence",
    title: "Geometry: Triangle Congruence & Centers",
    tagline: "Prove triangles congruent with SSS, SAS, ASA, AAS, and HL; use CPCTC; then the isosceles, midsegment, triangle-center, and inequality theorems.",
    lessonId: "tc-01-01"
  },
  {
    id: "similarity",
    title: "Geometry: Similarity",
    tagline: "Dilations and scale factor, the AA/SAS~/SSS~ criteria, the side-splitter theorem, geometric means in right triangles, and indirect measurement.",
    lessonId: "sy-01-01"
  },
  {
    id: "right-triangles-trig",
    title: "Geometry: Right Triangles & Trigonometry",
    tagline: "The Pythagorean theorem and special right triangles, the trig ratios born from similarity, solving right triangles, angles of elevation and depression, and the Laws of Sines and Cosines.",
    lessonId: "rt-01-01"
  },
  {
    id: "polygons-quadrilaterals",
    title: "Geometry: Polygons & Quadrilaterals",
    tagline: "Interior and exterior angle sums, parallelogram properties and tests, rectangles, rhombi and squares, trapezoids and kites, and the quadrilateral family tree.",
    lessonId: "pq-01-01"
  },
  {
    id: "circle-theorems",
    title: "Geometry: Circle Theorems",
    tagline: "Central and inscribed angles, chords, tangents, secants, power of a point, sectors, and cyclic quadrilaterals.",
    lessonId: "cr-01-01"
  },
  {
    id: "coordinate-proofs",
    title: "Geometry: Coordinate Geometry & Proofs",
    tagline: "Distance and midpoint, partitioning segments, slope criteria proved, classification proofs, perimeter and area on the plane, and the equation of a circle.",
    lessonId: "cx-01-01"
  },
  {
    id: "solid-geometry",
    title: "Geometry: Solid Geometry & Modeling",
    tagline: "Cross-sections and solids of revolution, Cavalieri’s principle, why the volume formulas are true, composite solids, scale effects, and density-based design.",
    lessonId: "sg-01-01"
  }
];

export const G7_TRAILS: GradeTrail[] = [
  {
    id: "proportional-relationships",
    title: "Proportional Relationships",
    tagline: "Find unit rates with fractions and test tables for proportionality.",
    lessonId: "pr-01-01"
  },
  {
    id: "rational-number-operations",
    title: "Rational Number Operations",
    tagline: "Add, subtract, multiply, and divide signed integers, fractions, and decimals.",
    lessonId: "rno-01-01"
  },
  {
    id: "two-step-equations",
    title: "Two-Step Equations & Inequalities",
    tagline: "Distribute and combine like terms with rational coefficients, then solve two-step equations and inequalities.",
    lessonId: "tse-01-01"
  },
  {
    id: "sampling-and-probability",
    title: "Sampling & Probability",
    tagline: "Estimate a population from a random sample, compare two populations, and understand probability and compound events.",
    lessonId: "sp-01-01"
  },
  {
    id: "geometry-g7",
    title: "Grade 7: Geometry",
    tagline: "Scale drawings, circles, angle equations, triangles, and cross-sections.",
    lessonId: "g7-01-01"
  }
];

export const G8_TRAILS: GradeTrail[] = [
  {
    id: "the-real-number-system",
    title: "The Real Number System",
    tagline: "Rational decimals, irrational numbers, and pinning both down on the number line.",
    lessonId: "rns-01-01"
  },
  {
    id: "exponents-scientific-notation",
    title: "Exponents, Roots & Scientific Notation",
    tagline: "Powers of ten, square and cube roots, and writing numbers small and huge.",
    lessonId: "esn-01-01"
  },
  {
    id: "functions-g8",
    title: "Functions",
    tagline: "Inputs and outputs, rate of change, and telling linear from nonlinear.",
    lessonId: "fg-01-01"
  },
  {
    id: "linear-equations-systems",
    title: "Linear Equations & Systems",
    tagline: "Solve equations with one, none, or infinitely many solutions — and systems of two.",
    lessonId: "les-01-01"
  },
  {
    id: "transformations-measurement",
    title: "Transformations & Measurement",
    tagline: "Slides, flips, turns, dilations, angle rules, the Pythagorean theorem, and volume of round solids.",
    lessonId: "tm-01-01"
  },
  {
    id: "bivariate-statistics",
    title: "Bivariate Statistics",
    tagline: "Scatter plots, association, lines of best fit, predictions, and two-way tables.",
    lessonId: "bv-01-01"
  }
];

/** Precalculus band (grade 11) direct-pick trails — entries land as each PC course closes. */
export const PC_TRAILS: GradeTrail[] = [
  {
    id: "function-analysis",
    title: "Precalculus: Function Analysis",
    tagline: "Rates of change, graph behavior, symmetry, piecewise, composition depth, and inverses formalized.",
    lessonId: "fna-01-01"
  },
  {
    id: "polynomial-rational-analysis",
    title: "Precalculus: Polynomial & Rational Analysis",
    tagline: "Rational roots, the Fundamental Theorem of Algebra, conjugate pairs, slant asymptotes, and inequality sign charts.",
    lessonId: "pra-01-01"
  },
  {
    id: "trig-graphs-inverses",
    title: "Precalculus: Trig Graphs & Inverse Trig",
    tagline: "Phase shift and full sinusoids, the tangent graph, and the inverse trig functions on their restricted branches.",
    lessonId: "tg-01-01"
  },
  {
    id: "trig-identities-equations",
    title: "Precalculus: Trig Identities & Equations",
    tagline: "General solutions, the six-function toolkit, sum/difference and double-angle formulas, and equations that need identities.",
    lessonId: "ti-01-01"
  },
  {
    id: "polar-parametric",
    title: "Precalculus: Polar Coordinates & Parametric Curves",
    tagline: "The (r, θ) address system, polar graphs, complex numbers in polar form with De Moivre, and parametric curves through projectile motion.",
    lessonId: "pp-01-01"
  },
  {
    id: "vectors-matrices",
    title: "Precalculus: Vectors & Matrices",
    tagline: "Vectors in components, magnitude and direction, the dot product and its angle/work uses, and 2×2 matrices — arithmetic, inverses, solving systems, and geometric transformations.",
    lessonId: "vec-01-01"
  },
  {
    id: "conic-sections",
    title: "Precalculus: Conic Sections",
    tagline: "Parabolas, ellipses, and hyperbolas as loci — focus-directrix and two-foci definitions, standard forms via completing the square, and eccentricity unifying them all into orbits and reflectors.",
    lessonId: "co-01-01"
  },
  {
    id: "limits-continuity",
    title: "Precalculus: Limits & the Doorway to Calculus",
    tagline: "Limits graphically, numerically, and algebraically; one-sided limits and limits at infinity; continuity and the IVT; and the derivative as a limit — the bridge into calculus.",
    lessonId: "lc-01-01"
  }
];

export const CALC_TRAILS: GradeTrail[] = [
  {
    id: "derivatives-in-context",
    title: "Calculus: Derivatives in Context",
    tagline: "What derivatives are FOR. Motion — and the sign rule that finally settles speeding up versus slowing down — and related rates, which is implicit differentiation with a clock.",
    lessonId: "dc-01-01"
  },
  {
    id: "curve-analysis",
    title: "Calculus: Curve Analysis",
    tagline: "f′ = 0 is a suspect, not a conviction. Critical points, the first- and second-derivative tests, concavity and inflections — the sign chart you already own, pointed at f′ and f″.",
    lessonId: "ca-01-01"
  },
  {
    id: "differential-equations",
    title: "Calculus: Differential Equations",
    tagline: "An equation that tells a curve which way to go. Slope fields, equilibria, separable equations — and the one that finally explains why growth is exponential.",
    lessonId: "de-01-01"
  },
  {
    id: "integration-applications",
    title: "Calculus: Applications of the Integral",
    tagline: "Slice the region, measure ONE slice, add them up. Areas between curves, and solids of revolution — where a flat strip sweeps into a disc.",
    lessonId: "ia-01-01"
  },
  {
    id: "integration-accumulation",
    title: "Calculus: Integration & the Fundamental Theorem",
    tagline: "Trap the area between rectangles and squeeze; let the endpoint move and the area becomes a function; then discover that the slope of the accumulation is the height of the curve.",
    lessonId: "in-01-01"
  },
  {
    id: "parametric-polar-calculus",
    title: "Calculus BC: Parametric & Polar",
    tagline: "Curves that refuse to be functions — differentiated by cancelling the parameter, measured by adding up hypotenuses, and integrated by slicing into triangles.",
    lessonId: "pc-01-01"
  },
  {
    id: "series-convergence",
    title: "Calculus BC: Series & Convergence",
    tagline: "Convergence beyond the geometric ceiling — and the Taylor polynomial that hugs the curve, then peels away at the radius.",
    lessonId: "sc-01-01"
  },
  {
    id: "derivative-rules",
    title: "Calculus: The Derivative",
    tagline: "The derivative as a FUNCTION, not a number at a point — then the power, product, quotient and chain rules, implicit differentiation, and the derivatives of the whole function library.",
    lessonId: "dr-01-01"
  }
];

/** Returns the direct-pick trails for a grade. Every grade 0-13 returns a non-empty list; the
 * onboarding flow offers a direct-pick route for all of them, so an empty list here is a dead
 * stage (S242/UX-01 — Grade 3 was exactly that). `onboarding.branches.s242.test.ts` asserts it. */
export function trailsForGrade(grade: GradeLevel): GradeTrail[] {
  if (grade === 0) return K_TRAILS;
  if (grade === 1) return G1_TRAILS;
  if (grade === 2) return G2_TRAILS;
  if (grade === 3) return G3_TRAILS;
  if (grade === 4) return G4_TRAILS;
  if (grade === 5) return G5_TRAILS;
  if (grade === 6) return G6_TRAILS;
  if (grade === 7) return G7_TRAILS;
  if (grade === 8) return G8_TRAILS;
  if (grade === 9 || grade === 10 || grade === 11) return HS_TRAILS;
  if (grade === 12) return PC_TRAILS;
  if (grade === 13) return CALC_TRAILS;
  return [];
}

export function recommendGradeTrail(trailId: string): Recommendation {
  const all = [...K_TRAILS, ...G1_TRAILS, ...G2_TRAILS, ...G3_TRAILS, ...G4_TRAILS, ...G5_TRAILS, ...G6_TRAILS, ...G7_TRAILS, ...G8_TRAILS, ...HS_TRAILS, ...PC_TRAILS, ...CALC_TRAILS];
  // Fallback stays the G1 root (not the array head): K is opt-in via grade 0, and an
  // unrecognized id during G4 onboarding should land on foundational G1, not kindergarten.
  const trail = all.find((t) => t.id === trailId) ?? G1_TRAILS[0];
  return {
    lessonId: trail.lessonId,
    courseSlug: trail.id,
    note: `Let's start with ${trail.title} — ${trail.tagline}`
  };
}

/** Back-compat: earlier code called recommendG4. */
export function recommendG4(trailId: string): Recommendation {
  return recommendGradeTrail(trailId);
}
