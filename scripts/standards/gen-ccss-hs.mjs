#!/usr/bin/env node
/**
 * S203H — generate the standards reference the high-school coverage gate reads.
 *
 * WHY. The 6–8 instrument (S203) closed a band that had ten uncovered sub-standards nobody could
 * see, because the crosswalk resolved only to domain level. High school has no instrument at all,
 * and it is by far the corpus's weakest region: 186 Tier C lessons and 10 Tier D, against one
 * Tier C in the whole of K–8. Nothing currently answers "does anything teach G-GPE.B.5?".
 *
 * SCOPE, stated up front:
 *   - Grades 9–12 (542 lessons, 39 courses). Grade 13 is Calculus/Calculus BC — beyond CCSS-M
 *     entirely — so it is deliberately OUT of this instrument's denominator. Measuring calculus
 *     against a framework that does not contain it would manufacture a fake gap.
 *   - CCSS-M high school is organised by CONCEPTUAL CATEGORY, not grade, so unlike 6–8 there is no
 *     grade field: a standard belongs to N, A, F, G or S and may legitimately be taught anywhere
 *     across the four years.
 *
 * THE (+) DISTINCTION MATTERS AND IS TRACKED SEPARATELY. CCSS marks some standards (+) —
 * "additional mathematics that students should learn in order to take advanced courses". They are
 * NOT part of the expectation for all students. Lumping them into one number would either overstate
 * the gap (counting optional content as missing) or understate it (diluting core misses among
 * optional ones). So every entry carries `plus: true|false`, the audit reports the two populations
 * separately, and only the CORE population is gated.
 *
 * Usage:  node scripts/standards/gen-ccss-hs.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/** [code, short title, plus?]. Lettered sub-standards are separate entries. */
const STANDARDS = {
  "N-RN": [
    ["N-RN.A.1", "Extend exponent properties to rational exponents"],
    ["N-RN.A.2", "Rewrite radical and rational-exponent expressions"],
    ["N-RN.B.3", "Sums and products of rational and irrational numbers"]
  ],
  "N-Q": [
    ["N-Q.A.1", "Use units to guide multi-step problems; interpret scale and origin"],
    ["N-Q.A.2", "Define appropriate quantities for descriptive modelling"],
    ["N-Q.A.3", "Choose a level of accuracy appropriate to the measurement"]
  ],
  "N-CN": [
    ["N-CN.A.1", "Know i² = −1; every complex number has the form a + bi"],
    ["N-CN.A.2", "Add, subtract and multiply complex numbers"],
    ["N-CN.A.3", "Conjugates; moduli and quotients of complex numbers", true],
    ["N-CN.B.4", "Represent complex numbers on the complex plane", true],
    ["N-CN.B.5", "Represent operations geometrically on the complex plane", true],
    ["N-CN.B.6", "Distance and midpoint on the complex plane", true],
    ["N-CN.C.7", "Solve quadratic equations with complex solutions"],
    ["N-CN.C.8", "Extend polynomial identities to complex numbers", true],
    ["N-CN.C.9", "Fundamental Theorem of Algebra", true]
  ],
  "N-VM": [
    ["N-VM.A.1", "Recognise vector quantities; magnitude and direction", true],
    ["N-VM.A.2", "Components of a vector from initial and terminal points", true],
    ["N-VM.A.3", "Solve problems with vectors", true],
    ["N-VM.B.4a", "Add vectors end-to-end and by the parallelogram rule", true],
    ["N-VM.B.4b", "Magnitude and direction of a vector sum", true],
    ["N-VM.B.4c", "Vector subtraction as adding the additive inverse", true],
    ["N-VM.B.5a", "Scalar multiplication componentwise", true],
    ["N-VM.B.5b", "Magnitude of a scalar multiple; direction under sign", true],
    ["N-VM.C.6", "Use matrices to represent and manipulate data", true],
    ["N-VM.C.7", "Multiply matrices by scalars", true],
    ["N-VM.C.8", "Add, subtract and multiply matrices", true],
    ["N-VM.C.9", "Matrix multiplication is associative but not commutative", true],
    ["N-VM.C.10", "Zero and identity matrices; the determinant", true],
    ["N-VM.C.11", "Matrices as transformations of vectors", true],
    ["N-VM.C.12", "2×2 matrices as transformations of the plane; determinant as area", true]
  ],
  "A-SSE": [
    ["A-SSE.A.1a", "Interpret parts of an expression: terms, factors, coefficients"],
    ["A-SSE.A.1b", "Interpret complicated expressions by viewing parts as single entities"],
    ["A-SSE.A.2", "Use structure to rewrite an expression"],
    ["A-SSE.B.3a", "Factor a quadratic to reveal its zeros"],
    ["A-SSE.B.3b", "Complete the square to reveal the maximum or minimum"],
    ["A-SSE.B.3c", "Use exponent properties to transform exponential expressions"],
    ["A-SSE.B.4", "Derive and use the sum of a finite geometric series"]
  ],
  "A-APR": [
    ["A-APR.A.1", "Polynomials are closed under addition, subtraction and multiplication"],
    ["A-APR.B.2", "Remainder Theorem"],
    ["A-APR.B.3", "Identify zeros of polynomials and use them to sketch the graph"],
    ["A-APR.C.4", "Prove polynomial identities"],
    ["A-APR.C.5", "The Binomial Theorem", true],
    ["A-APR.D.6", "Rewrite rational expressions; long division"],
    ["A-APR.D.7", "Rational expressions are closed under the four operations", true]
  ],
  "A-CED": [
    ["A-CED.A.1", "Create equations and inequalities in one variable"],
    ["A-CED.A.2", "Create equations in two or more variables; graph them"],
    ["A-CED.A.3", "Represent constraints; interpret solutions as viable or not"],
    ["A-CED.A.4", "Rearrange formulas to highlight a quantity of interest"]
  ],
  "A-REI": [
    ["A-REI.A.1", "Explain each step in solving an equation"],
    ["A-REI.A.2", "Solve rational and radical equations; extraneous solutions"],
    ["A-REI.B.3", "Solve linear equations and inequalities in one variable"],
    ["A-REI.B.4a", "Complete the square to derive the quadratic formula"],
    ["A-REI.B.4b", "Solve quadratics by inspection, roots, completing the square, formula, factoring"],
    ["A-REI.C.5", "Replacing one equation by a sum preserves the solution set"],
    ["A-REI.C.6", "Solve systems of linear equations exactly and approximately"],
    ["A-REI.C.7", "Solve a simple linear-quadratic system"],
    ["A-REI.C.8", "Represent a system of linear equations as a matrix equation", true],
    ["A-REI.C.9", "Find the inverse of a matrix and use it to solve systems", true],
    ["A-REI.D.10", "The graph of an equation is the set of its solutions"],
    ["A-REI.D.11", "Solutions of f(x) = g(x) are the intersections of the graphs"],
    ["A-REI.D.12", "Graph the solutions to a linear inequality and to a system"]
  ],
  "F-IF": [
    ["F-IF.A.1", "Definition of a function; domain, range, f(x) notation"],
    ["F-IF.A.2", "Evaluate functions and interpret statements in context"],
    ["F-IF.A.3", "Sequences are functions on a subset of the integers"],
    ["F-IF.B.4", "Interpret key features of graphs and tables in context"],
    ["F-IF.B.5", "Relate the domain to the quantitative relationship it describes"],
    ["F-IF.B.6", "Average rate of change over an interval"],
    ["F-IF.C.7a", "Graph linear and quadratic functions; intercepts, maxima, minima"],
    ["F-IF.C.7b", "Graph square root, cube root and piecewise-defined functions"],
    ["F-IF.C.7c", "Graph polynomial functions; zeros and end behaviour"],
    ["F-IF.C.7d", "Graph rational functions; zeros, asymptotes and end behaviour", true],
    ["F-IF.C.7e", "Graph exponential, logarithmic and trigonometric functions"],
    ["F-IF.C.8a", "Factor or complete the square to reveal zeros and extrema"],
    ["F-IF.C.8b", "Use exponent properties to interpret growth and decay rates"],
    ["F-IF.C.9", "Compare properties of functions in different representations"]
  ],
  "F-BF": [
    ["F-BF.A.1a", "Build a function: determine an explicit expression or recursive process"],
    ["F-BF.A.1b", "Combine standard function types with arithmetic operations"],
    ["F-BF.A.1c", "Compose functions", true],
    ["F-BF.A.2", "Write arithmetic and geometric sequences recursively and explicitly"],
    ["F-BF.B.3", "Effect of replacing f(x) by f(x)+k, kf(x), f(kx), f(x+k)"],
    ["F-BF.B.4a", "Find an inverse function by solving for the input"],
    ["F-BF.B.4b", "Verify one function is the inverse of another", true],
    ["F-BF.B.4c", "Read inverse values from a graph or table", true],
    ["F-BF.B.4d", "Restrict a domain to produce an invertible function", true],
    ["F-BF.B.5", "Inverse relationship between exponents and logarithms", true]
  ],
  "F-LE": [
    ["F-LE.A.1a", "Linear functions grow by equal differences, exponential by equal factors"],
    ["F-LE.A.1b", "Recognise situations with a constant rate of change"],
    ["F-LE.A.1c", "Recognise situations with a constant percent rate of change"],
    ["F-LE.A.2", "Construct linear and exponential functions from data"],
    ["F-LE.A.3", "Exponential growth eventually exceeds polynomial growth"],
    ["F-LE.A.4", "Solve ab^(ct) = d using logarithms"],
    ["F-LE.B.5", "Interpret the parameters of a linear or exponential model"]
  ],
  "F-TF": [
    ["F-TF.A.1", "Radian measure as arc length on the unit circle"],
    ["F-TF.A.2", "Extend trigonometric functions to all real numbers via the unit circle"],
    ["F-TF.A.3", "Special angles; use symmetry and periodicity", true],
    ["F-TF.A.4", "Use the unit circle to explain symmetry and periodicity", true],
    ["F-TF.B.5", "Model periodic phenomena with trigonometric functions"],
    ["F-TF.B.6", "Restrict a trigonometric domain to build an inverse", true],
    ["F-TF.B.7", "Use inverse functions to solve trigonometric equations", true],
    ["F-TF.C.8", "Prove and use the Pythagorean identity"],
    ["F-TF.C.9", "Prove and use addition and subtraction formulas", true]
  ],
  "G-CO": [
    ["G-CO.A.1", "Precise definitions of angle, circle, line, segment, parallel, perpendicular"],
    ["G-CO.A.2", "Represent transformations; compare rigid motions to others"],
    ["G-CO.A.3", "Symmetries of rectangles, parallelograms, trapezoids, regular polygons"],
    ["G-CO.A.4", "Define rotations, reflections and translations"],
    ["G-CO.A.5", "Draw and specify a sequence of transformations"],
    ["G-CO.B.6", "Use rigid motions to decide whether figures are congruent"],
    ["G-CO.B.7", "Congruence of triangles in terms of corresponding parts"],
    ["G-CO.B.8", "Explain ASA, SAS and SSS from the definition of congruence"],
    ["G-CO.C.9", "Prove theorems about lines and angles"],
    ["G-CO.C.10", "Prove theorems about triangles"],
    ["G-CO.C.11", "Prove theorems about parallelograms"],
    ["G-CO.D.12", "Make formal geometric constructions"],
    ["G-CO.D.13", "Construct an equilateral triangle, square and regular hexagon in a circle"]
  ],
  "G-SRT": [
    ["G-SRT.A.1a", "A dilation takes a line not through the centre to a parallel line"],
    ["G-SRT.A.1b", "A dilation of a segment is longer or shorter by the scale factor"],
    ["G-SRT.A.2", "Similarity as a sequence of transformations; corresponding parts"],
    ["G-SRT.A.3", "Establish the AA criterion for similarity"],
    ["G-SRT.B.4", "Prove theorems about triangles using similarity"],
    ["G-SRT.B.5", "Use congruence and similarity criteria to solve problems and prove"],
    ["G-SRT.C.6", "Side ratios in right triangles define the trigonometric ratios"],
    ["G-SRT.C.7", "Relationship between the sine and cosine of complementary angles"],
    ["G-SRT.C.8", "Use trigonometric ratios and the Pythagorean Theorem"],
    ["G-SRT.D.9", "Derive the area formula A = ½ab·sin(C)", true],
    ["G-SRT.D.10", "Prove the Laws of Sines and Cosines", true],
    ["G-SRT.D.11", "Apply the Laws of Sines and Cosines to solve triangles", true]
  ],
  "G-C": [
    ["G-C.A.1", "All circles are similar"],
    ["G-C.A.2", "Relationships among inscribed angles, radii and chords"],
    ["G-C.A.3", "Inscribed and circumscribed circles of a triangle"],
    ["G-C.A.4", "Construct a tangent line from a point outside a circle", true],
    ["G-C.B.5", "Arc length and sector area proportionality; radian measure"]
  ],
  "G-GPE": [
    ["G-GPE.A.1", "Derive the equation of a circle; complete the square"],
    ["G-GPE.A.2", "Derive the equation of a parabola from focus and directrix"],
    ["G-GPE.A.3", "Derive the equations of ellipses and hyperbolas", true],
    ["G-GPE.B.4", "Use coordinates to prove simple geometric theorems"],
    ["G-GPE.B.5", "Slope criteria for parallel and perpendicular lines"],
    ["G-GPE.B.6", "Find a point partitioning a segment in a given ratio"],
    ["G-GPE.B.7", "Compute perimeters and areas using coordinates"]
  ],
  "G-GMD": [
    ["G-GMD.A.1", "Informal arguments for circumference, area and volume formulas"],
    ["G-GMD.A.2", "Cavalieri's principle for volume", true],
    ["G-GMD.A.3", "Use volume formulas to solve problems"],
    ["G-GMD.B.4", "Cross-sections of solids; solids of revolution"]
  ],
  "G-MG": [
    ["G-MG.A.1", "Use geometric shapes to describe objects"],
    ["G-MG.A.2", "Apply density concepts in modelling"],
    ["G-MG.A.3", "Apply geometric methods to design problems"]
  ],
  "S-ID": [
    ["S-ID.A.1", "Represent data with plots on the real number line"],
    ["S-ID.A.2", "Compare centre and spread of two or more data sets"],
    ["S-ID.A.3", "Interpret differences in shape, centre and spread; effect of outliers"],
    ["S-ID.A.4", "Normal distribution; estimate population percentages"],
    ["S-ID.B.5", "Two-way frequency tables; joint, marginal and conditional frequencies"],
    ["S-ID.B.6a", "Fit a function to data and use it to solve problems"],
    ["S-ID.B.6b", "Assess fit by analysing residuals"],
    ["S-ID.B.6c", "Fit a linear function using technology"],
    ["S-ID.C.7", "Interpret slope and intercept of a linear model in context"],
    ["S-ID.C.8", "Compute and interpret the correlation coefficient"],
    ["S-ID.C.9", "Distinguish between correlation and causation"]
  ],
  "S-IC": [
    ["S-IC.A.1", "Statistics as a process for making inferences about a population"],
    ["S-IC.A.2", "Decide whether a model is consistent with results from a process"],
    ["S-IC.B.3", "Purposes and differences among surveys, experiments and observational studies"],
    ["S-IC.B.4", "Use sample data to estimate a population mean or proportion; margin of error"],
    ["S-IC.B.5", "Compare two treatments; decide whether differences are significant"],
    ["S-IC.B.6", "Evaluate reports based on data"]
  ],
  "S-CP": [
    ["S-CP.A.1", "Describe events as subsets of a sample space"],
    ["S-CP.A.2", "Independence via the product of probabilities"],
    ["S-CP.A.3", "Conditional probability and independence"],
    ["S-CP.A.4", "Two-way tables of data as sample spaces"],
    ["S-CP.A.5", "Explain conditional probability and independence in everyday language"],
    ["S-CP.B.6", "Find conditional probability as a fraction of outcomes"],
    ["S-CP.B.7", "Apply the Addition Rule"],
    ["S-CP.B.8", "Apply the general Multiplication Rule", true],
    ["S-CP.B.9", "Use permutations and combinations to compute probabilities", true]
  ],
  "S-MD": [
    ["S-MD.A.1", "Define a random variable and graph its distribution", true],
    ["S-MD.A.2", "Calculate the expected value of a random variable", true],
    ["S-MD.A.3", "Expected value of a theoretical probability distribution", true],
    ["S-MD.A.4", "Expected value from an empirical distribution", true],
    ["S-MD.B.5a", "Find expected payoff for a game of chance", true],
    ["S-MD.B.5b", "Evaluate and compare strategies on expected values", true],
    ["S-MD.B.6", "Use probabilities to make fair decisions", true],
    ["S-MD.B.7", "Analyse decisions and strategies using probability", true]
  ]
};

const CATEGORY = {
  "N-RN": "Number and Quantity", "N-Q": "Number and Quantity",
  "N-CN": "Number and Quantity", "N-VM": "Number and Quantity",
  "A-SSE": "Algebra", "A-APR": "Algebra", "A-CED": "Algebra", "A-REI": "Algebra",
  "F-IF": "Functions", "F-BF": "Functions", "F-LE": "Functions", "F-TF": "Functions",
  "G-CO": "Geometry", "G-SRT": "Geometry", "G-C": "Geometry",
  "G-GPE": "Geometry", "G-GMD": "Geometry", "G-MG": "Geometry",
  "S-ID": "Statistics and Probability", "S-IC": "Statistics and Probability",
  "S-CP": "Statistics and Probability", "S-MD": "Statistics and Probability"
};

const standards = [];
for (const [domain, rows] of Object.entries(STANDARDS)) {
  for (const [code, title, plus] of rows) {
    standards.push({ code, domain, category: CATEGORY[domain], title, plus: Boolean(plus) });
  }
}

const core = standards.filter((s) => !s.plus).length;
const doc = {
  schemaVersion: 1,
  framework: "CCSS-MATH-HS",
  note: "Lettered sub-standards of CCSS-M high school. Organised by conceptual category, not grade — a high school standard may legitimately be taught in any of grades 9-12. `plus: true` marks the (+) standards, which CCSS designates as additional mathematics for students intending advanced courses; they are reported but NOT gated.",
  scope: "grades 9-12. Grade 13 (Calculus, Calculus BC) is beyond CCSS-M and is excluded from the denominator.",
  total: standards.length,
  core,
  plus: standards.length - core,
  standards
};

mkdirSync(join(root, "content/standards"), { recursive: true });
writeFileSync(join(root, "content/standards/ccss-hs.json"), JSON.stringify(doc, null, 2) + "\n");
console.log(`ccss-hs.json: ${doc.total} sub-standards (${doc.core} core, ${doc.plus} plus) across ${Object.keys(STANDARDS).length} domains`);
