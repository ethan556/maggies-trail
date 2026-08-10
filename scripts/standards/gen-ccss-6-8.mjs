#!/usr/bin/env node
/**
 * S203 — generate the two standards files the 6–8 coverage gate reads.
 *
 * WHY THIS EXISTS. The existing crosswalk resolves to DOMAIN level only — fifteen codes (`6.RP`,
 * `7.EE`, `8.G`, …) for the whole of grades 6–8 — with `"depth": "course-scope"` and
 * `"status": "provisional-crosswalk"`. A domain-level map cannot answer "is 8.EE.A.1 covered?",
 * which is why 8.EE.A.1 (general-base exponent rules) sat entirely in Grade 9 for 200 sessions
 * without anything noticing. Instruction and assessment both work at the LETTERED sub-standard,
 * so that is the unit here: 112 of them across grades 6–8.
 *
 * TWO OUTPUTS, DELIBERATELY SEPARATE:
 *
 *   ccss-6-8.json               the standards themselves. Reference data; changes only when the
 *                               framework does (CCSS-M has been stable since 2010).
 *
 *   ccss-6-8-coverage-map.json  which EXISTING chapters teach which sub-standards. A sidecar, not
 *                               a lesson field, for one hard reason: tagging the back catalogue
 *                               inline would change 218 lesson files, and any lesson-JSON byte
 *                               change must be authorized in three separate audit scripts whose
 *                               pass conditions hardcode corpus counts (HANDOVER §8, the
 *                               "seven-place trap"). A sidecar closes the visibility gap at zero
 *                               risk to the sealed ledger.
 *
 * NEW lessons declare `standards: [...]` inline in their own JSON — the sidecar is for history,
 * not the destination. The audit merges both and prefers the inline value.
 *
 * PROVENANCE, STATED PLAINLY: the coverage map is authored from a lesson-by-lesson reading of the
 * 218 grade 6–8 lessons. It is `authored-unreviewed` — better evidence than the domain-level
 * crosswalk it supplements, and NOT a substitute for the human sign-off that
 * `content/standards/human-review-decisions.json` still records as empty. Do not let it become
 * one silently: a coverage map that claims alignment nobody checked is the failure mode this
 * whole exercise exists to fix.
 *
 * Usage: node scripts/standards/gen-ccss-6-8.mjs
 */
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const out = join(root, "content", "standards");

/* ------------------------------------------------------------------ standards */
/** [code, short title]. Lettered sub-standards are separate entries; unlettered standards are one. */
const STANDARDS = {
  6: {
    RP: [
      ["6.RP.A.1", "Understand ratio concepts and use ratio language"],
      ["6.RP.A.2", "Understand the unit rate a/b associated with a ratio a:b"],
      ["6.RP.A.3a", "Tables of equivalent ratios; plot the pairs on the coordinate plane"],
      ["6.RP.A.3b", "Unit rate problems including unit pricing and constant speed"],
      ["6.RP.A.3c", "Percent of a quantity; find the whole given a part and the percent"],
      ["6.RP.A.3d", "Convert measurement units using ratio reasoning"]
    ],
    NS: [
      ["6.NS.A.1", "Divide fractions by fractions; interpret quotients in word problems"],
      ["6.NS.B.2", "Fluently divide multi-digit numbers using the standard algorithm"],
      ["6.NS.B.3", "Fluently add, subtract, multiply and divide multi-digit decimals"],
      ["6.NS.B.4", "GCF and LCM; factor a sum using the distributive property"],
      ["6.NS.C.5", "Positive and negative numbers describing opposite directions"],
      ["6.NS.C.6a", "Opposites; −(−a) = a"],
      ["6.NS.C.6b", "Signs of ordered pairs; reflection across the axes"],
      ["6.NS.C.6c", "Position rational numbers on the number line and coordinate plane"],
      ["6.NS.C.7a", "Interpret inequality statements about relative position"],
      ["6.NS.C.7b", "Write, interpret and explain order statements in context"],
      ["6.NS.C.7c", "Absolute value as distance from zero; magnitude"],
      ["6.NS.C.7d", "Distinguish absolute-value comparisons from order statements"],
      ["6.NS.C.8", "Graph in all four quadrants; distance between points sharing a coordinate"]
    ],
    EE: [
      ["6.EE.A.1", "Write and evaluate numerical expressions with whole-number exponents"],
      ["6.EE.A.2a", "Write expressions that record operations with numbers and letters"],
      ["6.EE.A.2b", "Identify parts of an expression using mathematical terms"],
      ["6.EE.A.2c", "Evaluate expressions, including formulas, using order of operations"],
      ["6.EE.A.3", "Apply properties of operations to generate equivalent expressions"],
      ["6.EE.A.4", "Identify when two expressions are equivalent"],
      ["6.EE.B.5", "Solving an equation or inequality as answering a question; substitution"],
      ["6.EE.B.6", "Use variables to represent numbers in real-world problems"],
      ["6.EE.B.7", "Solve real-world problems of the form x + p = q and px = q"],
      ["6.EE.B.8", "Write x > c or x < c; represent solutions on a number line"],
      ["6.EE.C.9", "Dependent and independent variables; relate equation, table and graph"]
    ],
    G: [
      ["6.G.A.1", "Area of triangles, special quadrilaterals and polygons"],
      ["6.G.A.2", "Volume of right rectangular prisms with fractional edge lengths"],
      ["6.G.A.3", "Polygons in the coordinate plane; side lengths from coordinates"],
      ["6.G.A.4", "Nets and surface area"]
    ],
    SP: [
      ["6.SP.A.1", "Recognize a statistical question as one anticipating variability"],
      ["6.SP.A.2", "A distribution has centre, spread and overall shape"],
      ["6.SP.A.3", "Measures of centre versus measures of variation"],
      ["6.SP.B.4", "Display data in dot plots, histograms and box plots"],
      ["6.SP.B.5a", "Report the number of observations"],
      ["6.SP.B.5b", "Describe the attribute under investigation and its units"],
      ["6.SP.B.5c", "Give centre and variability (IQR, MAD); describe the pattern in context"],
      ["6.SP.B.5d", "Relate the choice of measures to the shape of the distribution"]
    ]
  },
  7: {
    RP: [
      ["7.RP.A.1", "Unit rates with ratios of fractions"],
      ["7.RP.A.2a", "Decide whether two quantities are in a proportional relationship"],
      ["7.RP.A.2b", "Identify the constant of proportionality"],
      ["7.RP.A.2c", "Represent proportional relationships by equations"],
      ["7.RP.A.2d", "Explain what the points (0,0) and (1,r) mean on the graph"],
      ["7.RP.A.3", "Multistep ratio and percent problems: interest, tax, markup, markdown, gratuities, commissions, fees, percent increase/decrease, percent error"]
    ],
    NS: [
      ["7.NS.A.1a", "Opposite quantities combine to make 0"],
      ["7.NS.A.1b", "Add rational numbers; p + q is |q| from p; interpret in context"],
      ["7.NS.A.1c", "Subtraction as adding the additive inverse; distance as |p − q|"],
      ["7.NS.A.1d", "Apply properties of operations to add and subtract rational numbers"],
      ["7.NS.A.2a", "Multiply rational numbers; the distributive property and signs"],
      ["7.NS.A.2b", "Divide integers; −(p/q) = (−p)/q = p/(−q)"],
      ["7.NS.A.2c", "Apply properties of operations to multiply and divide rational numbers"],
      ["7.NS.A.2d", "Convert a rational number to a decimal by long division; terminates or repeats"],
      ["7.NS.A.3", "Solve real-world problems with the four operations on rational numbers"]
    ],
    EE: [
      ["7.EE.A.1", "Add, subtract, factor and expand linear expressions with rational coefficients"],
      ["7.EE.A.2", "Rewriting an expression in a different form sheds light on the problem"],
      ["7.EE.B.3", "Multi-step problems with rational numbers; assess reasonableness by estimation"],
      ["7.EE.B.4a", "Solve px + q = r and p(x + q) = r"],
      ["7.EE.B.4b", "Solve inequalities px + q > r; graph and interpret the solution set"]
    ],
    G: [
      ["7.G.A.1", "Scale drawings: actual lengths and areas; reproduce at a different scale"],
      ["7.G.A.2", "Draw shapes with given conditions; unique, many or no triangle"],
      ["7.G.A.3", "Cross-sections of right rectangular prisms and pyramids"],
      ["7.G.B.4", "Area and circumference of a circle; informal derivation"],
      ["7.G.B.5", "Supplementary, complementary, vertical and adjacent angles"],
      ["7.G.B.6", "Area, volume and surface area of composed two- and three-dimensional objects"]
    ],
    SP: [
      ["7.SP.A.1", "Representative samples; random sampling supports valid inferences"],
      ["7.SP.A.2", "Draw inferences from a random sample; gauge variation across samples"],
      ["7.SP.B.3", "Visual overlap; difference of centres as a multiple of a measure of variability"],
      ["7.SP.B.4", "Comparative inferences about two populations"],
      ["7.SP.C.5", "Probability as a number between 0 and 1; likelihood language"],
      ["7.SP.C.6", "Approximate probability from long-run relative frequency"],
      ["7.SP.C.7a", "Develop a uniform probability model"],
      ["7.SP.C.7b", "Develop a probability model from observed frequencies"],
      ["7.SP.C.8a", "Probability of a compound event as a fraction of the sample space"],
      ["7.SP.C.8b", "Sample spaces via organized lists, tables and tree diagrams"],
      ["7.SP.C.8c", "Design and use a simulation to estimate probabilities"]
    ]
  },
  8: {
    NS: [
      ["8.NS.A.1", "Rational versus irrational; decimal expansions repeat; convert to a fraction"],
      ["8.NS.A.2", "Approximate irrationals; locate on a number line; estimate expressions"]
    ],
    EE: [
      ["8.EE.A.1", "Properties of integer exponents, including zero and negative exponents"],
      ["8.EE.A.2", "Square and cube root symbols; solve x² = p and x³ = p; √2 is irrational"],
      ["8.EE.A.3", "Scientific notation; estimate how many times as much one is than another"],
      ["8.EE.A.4", "Operations in scientific notation; choose units; read technology output"],
      ["8.EE.B.5", "Graph proportional relationships; unit rate as slope; compare representations"],
      ["8.EE.B.6", "Similar triangles explain constant slope; derive y = mx and y = mx + b"],
      ["8.EE.C.7a", "Equations with one solution, infinitely many, or none"],
      ["8.EE.C.7b", "Solve linear equations with the distributive property and like terms"],
      ["8.EE.C.8a", "Solutions of a system as points of intersection"],
      ["8.EE.C.8b", "Solve systems algebraically; estimate solutions by graphing"],
      ["8.EE.C.8c", "Real-world problems leading to two linear equations in two variables"]
    ],
    F: [
      ["8.F.A.1", "A function assigns exactly one output to each input; graph as ordered pairs"],
      ["8.F.A.2", "Compare properties of two functions represented in different ways"],
      ["8.F.A.3", "y = mx + b defines a linear function; give examples of nonlinear ones"],
      ["8.F.B.4", "Construct a function for a linear relationship; rate of change and initial value"],
      ["8.F.B.5", "Describe a graph qualitatively; sketch a graph from a verbal description"]
    ],
    G: [
      ["8.G.A.1a", "Rigid motions take lines to lines and segments to segments of equal length"],
      ["8.G.A.1b", "Rigid motions take angles to angles of the same measure"],
      ["8.G.A.1c", "Rigid motions take parallel lines to parallel lines"],
      ["8.G.A.2", "Congruence via a sequence of rigid motions; describe the sequence"],
      ["8.G.A.3", "Effect of dilations, translations, rotations and reflections using coordinates"],
      ["8.G.A.4", "Similarity via similarity transformations; describe the sequence"],
      ["8.G.A.5", "Angle sum and exterior angle; parallel lines and a transversal; AA criterion"],
      ["8.G.B.6", "Explain a proof of the Pythagorean theorem and its converse"],
      ["8.G.B.7", "Apply the Pythagorean theorem in two and three dimensions"],
      ["8.G.B.8", "Distance between two points in the coordinate plane"],
      ["8.G.C.9", "Volume of cones, cylinders and spheres"]
    ],
    SP: [
      ["8.SP.A.1", "Scatter plots; clustering, outliers, association, linear and nonlinear"],
      ["8.SP.A.2", "Fit a straight line informally; assess closeness of the data points"],
      ["8.SP.A.3", "Use the equation of a linear model; interpret slope and intercept"],
      ["8.SP.A.4", "Two-way tables; relative frequencies; association between variables"]
    ]
  }
};

const standards = [];
for (const [grade, domains] of Object.entries(STANDARDS)) {
  for (const [domain, list] of Object.entries(domains)) {
    for (const [code, title] of list) {
      standards.push({ code, grade: Number(grade), domain: `${grade}.${domain}`, title });
    }
  }
}

/* ------------------------------------------------------- chapter coverage map */
/**
 * chapterId → sub-standards that chapter teaches. Authored from the lesson-by-lesson reading.
 * Chapter granularity is the honest resolution: these courses are built three-lessons-to-a-chapter
 * around a single idea, so a chapter is the smallest unit where "this teaches 6.SP.B.4" is a claim
 * about design rather than a guess about one screen.
 *
 * A `partial:` prefix records a chapter that touches a sub-standard without carrying it — the box
 * plot that appears as a supporting figure inside the quartiles chapter, for example. Partial
 * coverage does NOT satisfy the gate; it is recorded so the next author knows where to build.
 */
const COVERAGE = {
  /* ---- Grade 6 ---- */
  "ch1-what-a-ratio-says": ["6.RP.A.1"],
  "ch2-ratio-tables": ["6.RP.A.1", "partial:6.RP.A.3a"],
  "ch3-unit-rates": ["6.RP.A.2", "6.RP.A.3b"],
  "ch4-percent": ["6.RP.A.3c"],
  "ch5-converting": ["6.RP.A.3d"],

  "ch1-dividing-fractions": ["6.NS.A.1"],
  "ch2-fluent-operations": ["6.NS.B.2", "6.NS.B.3"],
  "ch3-factors-multiples": ["6.NS.B.4"],
  "ch4-below-zero": ["6.NS.C.5", "6.NS.C.6a", "6.NS.C.6c", "6.NS.C.8", "partial:6.NS.C.6b"],
  "ch5-absolute-value": ["6.NS.C.7a", "6.NS.C.7b", "6.NS.C.7c", "6.NS.C.7d"],

  "ch1-exponents": ["6.EE.A.1", "6.EE.A.2c"],
  "ch2-variables": ["6.EE.A.2a", "6.EE.B.6", "partial:6.EE.A.2b"],
  "ch3-equivalent-expressions": ["6.EE.A.3", "6.EE.A.4"],
  "ch4-one-step-equations": ["6.EE.B.5", "6.EE.B.7"],
  "ch5-inequalities": ["6.EE.B.8", "6.EE.C.9"],

  "ch1-area-triangles-quads": ["6.G.A.1"],
  "ch2-composite-figures": ["6.G.A.1"],
  "ch3-coordinate-polygons": ["6.G.A.3", "6.NS.C.8"],
  "ch4-surface-area-prisms": ["6.G.A.4"],
  "ch5-fractional-volume": ["6.G.A.2"],

  "ch1-statistical-questions": ["6.SP.A.1", "6.SP.B.5b"],
  "ch2-dot-plots-histograms": ["6.SP.A.2", "6.SP.B.4"],
  "ch3-mean-median": ["6.SP.A.3", "6.SP.B.5d"],
  "ch4-range-iqr": ["6.SP.A.3", "partial:6.SP.B.4", "partial:6.SP.B.5c"],
  "ch5-describing-distributions": ["6.SP.B.5a", "6.SP.B.5d", "partial:6.SP.B.4"],

  /* ---- Grade 7 ---- */
  "ch1-unit-rates-with-fractions": ["7.RP.A.1"],
  "ch2-is-it-proportional": ["7.RP.A.2a", "7.RP.A.2b", "partial:7.RP.A.2c"],
  "ch3-graphs-of-proportional-relationships": ["7.RP.A.2d", "8.EE.B.5"],
  "ch4-percent-problems": ["7.RP.A.3"],

  "ch1-adding-integers": ["7.NS.A.1a", "7.NS.A.1b"],
  "ch2-subtracting-integers": ["7.NS.A.1c", "7.NS.A.1d"],
  "ch3-multiplying-and-dividing-integers": ["7.NS.A.2a", "7.NS.A.2b"],
  "ch4-operations-with-rational-numbers": ["7.NS.A.2c", "7.NS.A.3"],

  "ch1-distributing-and-combining-with-rational-coefficients": ["7.EE.A.1"],
  "ch2-two-step-equations": ["7.EE.B.4a", "7.EE.B.3"],
  "ch3-equations-with-parentheses": ["7.EE.B.4a"],
  "ch4-two-step-inequalities": ["7.EE.B.4b"],

  "ch1-scale-drawings": ["7.G.A.1"],
  "ch2-circles": ["7.G.B.4"],
  "ch3-angle-equations": ["7.G.B.5"],
  "ch4-triangles-cross-sections": ["7.G.A.3", "partial:7.G.A.2"],

  "ch1-wrapping-solids": ["7.G.B.6"],
  "ch2-filling-and-combining": ["7.G.B.6"],

  "ch1-random-sampling-and-making-inferences": ["7.SP.A.1", "7.SP.A.2"],
  "ch2-comparing-two-populations": ["7.SP.B.4", "partial:7.SP.B.3"],
  "ch3-understanding-probability": ["7.SP.C.5", "7.SP.C.6"],
  "ch4-probability-models-and-compound-events": ["7.SP.C.7a", "7.SP.C.7b", "7.SP.C.8a", "7.SP.C.8b", "7.SP.C.8c"],

  /* ---- Grade 8 ---- */
  "ch1-rational-decimals": ["8.NS.A.1", "7.NS.A.2d"],
  "ch2-irrational-numbers": ["8.NS.A.1"],
  "ch3-approximating-irrationals": ["8.NS.A.2"],

  "ch1-powers-of-ten": ["partial:8.EE.A.1"],
  "ch2-square-cube-roots": ["8.EE.A.2"],
  "ch3-scientific-notation": ["8.EE.A.3"],
  "ch4-computing-scientific-notation": ["8.EE.A.4"],

  "ch1-solving-linear-equations": ["8.EE.C.7b"],
  "ch2-one-none-infinite": ["8.EE.C.7a"],
  "ch3-systems-and-solutions": ["8.EE.C.8a"],
  "ch4-substitution": ["8.EE.C.8b", "8.EE.C.8c"],

  "ch1-what-is-a-function": ["8.F.A.1"],
  "ch2-rate-of-change": ["8.F.B.4", "8.EE.B.6", "8.F.A.3"],
  "ch3-comparing-functions": ["8.F.A.2"],
  "ch4-linear-vs-nonlinear": ["8.F.A.3", "8.F.B.5"],

  "ch1-rigid-transformations": ["8.G.A.1a", "8.G.A.1b", "8.G.A.1c"],
  "ch2-congruence-similarity": ["8.G.A.2", "8.G.A.4", "partial:8.G.A.3"],
  "ch3-angle-relationships": ["8.G.A.5"],
  "ch4-pythagorean": ["8.G.B.6", "8.G.B.7", "8.G.B.8"],
  "ch5-volume-round-solids": ["8.G.C.9"],

  "ch1-scatter-association": ["8.SP.A.1"],
  "ch2-fitting-a-line": ["8.SP.A.2"],
  "ch3-using-the-line": ["8.SP.A.3"],
  "ch4-two-way-tables": ["8.SP.A.4"],
  "ch5-what-the-line-misses": []   // residuals — high-school S-ID.6b, not a 6–8 standard
};

/**
 * Covered, but missing a component the standard names explicitly.
 *
 * Some CCSS codes bundle several displays or measures into one line, and a single code cannot
 * express "two of the three." 6.SP.B.4 names dot plots, histograms AND box plots; this corpus
 * teaches the first two. Counting it uncovered would overstate — histograms are genuinely taught.
 * Counting it covered and saying nothing would hide the exact gap the gate exists to surface.
 * So it is counted covered and named here, reported on every run and never gated: the next author
 * sees what is missing inside a code that already looks green.
 */
const INCOMPLETE = {
  "6.SP.B.4": "box plots appear only as a supporting figure inside the quartiles and summary lessons; no lesson builds, reads or compares one",
  "6.EE.A.2c": "formulas are evaluated, but the 'identify the parts' vocabulary half of 6.EE.A.2 has no lesson (see 6.EE.A.2b)",
  "7.EE.A.1": "expanding and combining are taught; FACTORING a linear expression (6x + 9 = 3(2x + 3)) has no lesson",
  "7.RP.A.3": "tax, tip, markup, markdown and percent change are taught; simple interest, commissions, fees and percent error are not",
  "7.EE.B.3": "multi-step rational-number problems are taught; the 'assess reasonableness by mental computation and estimation' half is not",
  "8.EE.C.8b": "substitution only; elimination is in G9 systems-equations, and every state assessment expects it at grade 8",
  "8.G.A.2": "congruence is established, but 'describe the sequence of rigid motions' — the assessed skill — gets one lesson",
  "8.G.A.4": "similarity is established; 'describe the sequence of similarity transformations' gets one lesson",
  "8.G.B.7": "two-dimensional application only; the three-dimensional case is absent",
  "8.F.B.4": "rate of change and initial value are read from graphs and tables; constructing the function from two (x, y) values is thin",
  "7.G.A.1": "actual lengths and areas are computed; 'reproduce a scale drawing at a different scale' is thin"
};

const known = new Set(standards.map((s) => s.code));
for (const [chapterId, codes] of Object.entries(COVERAGE)) {
  for (const raw of codes) {
    const code = raw.startsWith("partial:") ? raw.slice(8) : raw;
    if (!known.has(code)) throw new Error(`coverage map references unknown standard ${code} (${chapterId})`);
  }
}
for (const code of Object.keys(INCOMPLETE)) {
  if (!known.has(code)) throw new Error(`incomplete-coverage note references unknown standard ${code}`);
}

writeFileSync(
  join(out, "ccss-6-8.json"),
  JSON.stringify(
    {
      schemaVersion: 1,
      framework: "CCSS-MATH",
      note: "Lettered sub-standards for grades 6-8. The unit instruction and assessment work in.",
      total: standards.length,
      standards
    },
    null,
    2
  ) + "\n"
);

/* ANTI-CLOBBER GUARD (S203I). The COVERAGE constant above is a SNAPSHOT of the map as it stood in
 * S203. Batches B–F then added eleven chapters directly to the emitted JSON, and S203G renamed two
 * more during the surface-area merge, so this constant is now STALE. Re-running this script blind
 * deletes those chapters and drops their standards from the coverage scan — a passing gate quietly
 * becomes a wrong one. It did exactly that once, in S203I, which is why this guard exists.
 * Refuse rather than overwrite: if the map on disk knows chapters this file does not, stop and name
 * them. Compare on the BARE id so the course-qualified keys on disk still match. */
{
  const existingPath = join(out, "ccss-6-8-coverage-map.json");
  if (existsSync(existingPath)) {
    const existing = JSON.parse(readFileSync(existingPath, "utf8"));
    const bare = (k) => (k.includes("/") ? k.slice(k.indexOf("/") + 1) : k);
    const mine = new Set(Object.keys(COVERAGE).map(bare));
    const unknown = Object.keys(existing.chapters ?? {}).map(bare).filter((k) => !mine.has(k));
    if (unknown.length) {
      console.error("REFUSING to overwrite content/standards/ccss-6-8-coverage-map.json.");
      console.error(`  The map on disk contains ${unknown.length} chapter(s) this generator does not know about:`);
      for (const k of unknown) console.error(`    ${k}`);
      console.error("  Re-running would delete them. Fold them into COVERAGE here first, or edit the JSON directly.");
      process.exit(1);
    }
  }
}

writeFileSync(
  join(out, "ccss-6-8-coverage-map.json"),
  JSON.stringify(
    {
      schemaVersion: 1,
      status: "authored-unreviewed",
      provenance:
        "Authored in S203 from a lesson-by-lesson reading of all 218 grade 6-8 lessons. Supplements the domain-level provisional-crosswalk; does NOT constitute the human review that human-review-decisions.json still records as empty.",
      resolution: "chapter",
      note: "A 'partial:' prefix marks a chapter that touches a sub-standard without carrying it. Partial coverage does not satisfy the gate.",
      chapters: COVERAGE,
      incompleteCoverage: INCOMPLETE
    },
    null,
    2
  ) + "\n"
);

console.log(`ccss-6-8: ${standards.length} sub-standards (G6 ${standards.filter((s) => s.grade === 6).length}, G7 ${standards.filter((s) => s.grade === 7).length}, G8 ${standards.filter((s) => s.grade === 8).length})`);
console.log(`ccss-6-8-coverage-map: ${Object.keys(COVERAGE).length} chapters mapped, ${Object.keys(INCOMPLETE).length} covered-but-incomplete notes`);
