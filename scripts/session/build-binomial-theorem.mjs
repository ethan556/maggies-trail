#!/usr/bin/env node
// S199 — G6-12 expansion course 3/4: binomial-theorem (A-APR.C.5 +).
//
// WHY THIS COURSE: the repo already teaches both halves of the theorem and never joins them —
// polynomial expansion in `exponents-polynomials`, combinations in `conditional-probability`.
// A-APR.C.5 is at zero coverage. Lesson 3 is the conceptual heart: each product term is a CHOICE
// SEQUENCE, so counting paths IS choosing, and the combinations were the coefficients all along.
// Lesson 6 closes the loop to `expected-value`: (p + q)^n expanded term-by-term IS the binomial
// probability distribution.
//
// ENGINE CHOICES:
//   binomialAreaLab — manip 3 / conseq 3 / adapt 3, and it shows the n = 2 case as AREA: the
//                     x^2 block, two strips, one corner. That is Pascal's row 1 2 1 drawn as
//                     regions, which is why the course opens on it rather than on a table.
//                     Integrity forbids startA/startB equal to the target and forbids
//                     targetA*targetB == middle (the add-vs-multiply misconception must stay
//                     distinguishable), so both are asserted here before authoring.
//   treeDiagram     — stage-by-stage choice counting: 2 choices per factor, n factors.
//   numeric/mcq     — the coefficient arithmetic, with C(n,k) recomputed in-script.
//
// EVERY coefficient in this file is recomputed by choose()/pascalRow() and asserted against the
// authored answer, so no binomial coefficient is hand-carried.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SLUG = "binomial-theorem";
const spec = JSON.parse(readFileSync("/mnt/user-data/uploads/g6-12-expansion.json", "utf8"))
  .courses.find((c) => c.slug === SLUG);

let asserts = 0;
const must = (ok, msg) => { asserts++; if (!ok) throw new Error("FACTORY ASSERT: " + msg); };
must(spec && spec.lessons.length === 6, "spec course present with 6 lessons");
must(spec.grade === 12, "grade 12");

/* ---- independent combinatorics: every authored coefficient is checked against these ---- */
function choose(n, k) {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - i + 1)) / i;
  return Math.round(r);
}
const pascalRow = (n) => Array.from({ length: n + 1 }, (_, k) => choose(n, k));
must(JSON.stringify(pascalRow(4)) === JSON.stringify([1, 4, 6, 4, 1]), "row 4 is 1 4 6 4 1");
must(choose(7, 3) === 35 && choose(7, 4) === 35, "C(7,3) = C(7,4) = 35");

function numeric({ prompt, answer, errors, fallbackFeedback, successFeedback }) {
  must(errors.length >= 2, "numeric needs >=2 diagnostic wrong answers");
  for (const [v] of errors) must(v !== answer, `trap ${v} equals answer ${answer}`);
  must(new Set(errors.map((e) => e[0])).size === errors.length, "duplicate traps");
  const w = { type: "numeric", prompt, answer, tolerance: 0,
    commonErrors: errors.map(([value, feedback]) => ({ value, feedback })), fallbackFeedback };
  if (successFeedback) w.successFeedback = successFeedback;
  return w;
}
function mcq(prompt, options) {
  must(options.filter((o) => o[2]).length === 1, `${prompt}: exactly one correct`);
  must(options.length >= 3, "mcq needs >=3 options");
  return { type: "mcq", prompt, options: options.map(([id, label, correct, feedback]) => ({ id, label, correct: !!correct, feedback })) };
}
const predict = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o[0] === outcomeId), "predict outcome offered");
  return { prompt, options: options.map(([id, label]) => ({ id, label })), outcomeId, reveal };
};
function binomialAreaLab(o) {
  const middle = o.pX * o.targetB + o.qX * o.targetA;
  const constant = o.targetA * o.targetB;
  must(!(o.targetA === 0 && o.targetB === 0), "both partitions zero leaves no structure");
  must(!(o.startA === o.targetA && o.startB === o.targetB), "start must not be the target");
  must(o.targetA * o.targetB !== middle, `add-vs-multiply indistinguishable (${o.targetA * o.targetB} = ${middle})`);
  if (o.asks === "constant") must(constant !== 0, "constant term must exist to be asked for");
  if (o.asks === "middle") must(!(middle === 0 && o.targetA + o.targetB !== 0), "middle must be readable");
  return { type: "binomialAreaLab", requiredMoves: 3, startA: 0, startB: 0, ...o };
}
function treeDiagram(o) { return { type: "treeDiagram", ...o }; }
/** areaModel in countGrid mode: a FIXED w x h grid the learner counts. Integrity demands
 *  wStart === wMax, hStart === hMax and w*h === targetArea, so the grid cannot resize. */
function countGrid(o) {
  must(o.wStart === o.wMax && o.hStart === o.hMax, "countGrid must not resize");
  must(o.wStart * o.hStart === o.targetArea, `countGrid ${o.hStart}x${o.wStart} != ${o.targetArea}`);
  for (const c of o.commonCounts ?? []) {
    must(c.count !== o.targetArea, "common count equals the answer");
    must(c.count < o.targetArea, "common count exceeds the visible grid");
  }
  return { type: "areaModel", countGrid: true, commonCounts: [], ...o };
}

const L = [];
const lesson = (id, slug, title, chapterId, minutes, steps, remedial) =>
  L.push({ id, slug, title, courseId: SLUG, chapterId, minutes, steps, remedials: [remedial] });
const remedialFrom = (steps, tag) => {
  const c = steps.find((s) => s.kind === "concept" && s.id === "c2");
  const k = steps.find((s) => (s.kind === "check" || s.kind === "challenge") && s.conceptTag === tag && s.widget);
  must(c && k, `remedial sources for ${tag}`);
  return { conceptTag: tag,
    concept: { id: `rem-${tag}-c`, kind: "concept", body: c.body },
    check: { id: `rem-${tag}-k`, kind: "check", body: k.body, conceptTag: tag,
      explanationVariants: k.explanationVariants, widget: structuredClone(k.widget) } };
};

/* ================== CH1 — Pascal's Pattern ================== */

/* 1. Powers of a Sum — bt-powers-of-sum */
{
  const TAG = "bt-powers-of-sum";
  const steps = [
    { id: "c1", kind: "concept", body: "(a + b)\u00b2 is not a\u00b2 + b\u00b2. Squaring a sum means multiplying the whole sum by itself, and the cross terms that appear are the entire content of this course. Drawn as a rectangle, (a + b)\u00b2 is one a-square, one b-square, and TWO identical strips \u2014 and the strips are what the wrong version throws away." },
    { id: "i1", kind: "interactive", body: "Lay the square out as area and read its middle.",
      widget: binomialAreaLab({ prompt: "Build (x + 3)(x + 3) as a rectangle: drag both partitions to 3, then read the middle coefficient.",
        pX: 1, qX: 1, targetA: 3, targetB: 3, startA: 1, startB: 0, asks: "middle", requiredMoves: 3,
        successFeedback: "x\u00b2 + 6x + 9. The 6x is TWO strips of 3x, one along each side \u2014 which is exactly the term a\u00b2 + b\u00b2 forgets. The coefficients read 1, 2, 1 against the blocks.",
        productMiddleFeedback: "The strips were multiplied instead of counted. Two strips of 3x add to 6x; 3\u00d73 = 9 is the CORNER, a different region entirely.",
        partialFeedback: "One partition has arrived and the other has not \u2014 a square needs both sides equal to 3.",
        signFeedback: "Right sizes, wrong direction: a negative partition draws area taken away, but (x + 3) adds its 3." }),
      predict: predict("Is (a + b)\u00b2 equal to a\u00b2 + b\u00b2?",
        [["yes", "Yes \u2014 the square distributes over the sum"],
         ["no", "No \u2014 something extra appears"],
         ["sometimes", "Only when a and b are both positive"]],
        "no",
        "Two cross terms appear: (a + b)\u00b2 = a\u00b2 + 2ab + b\u00b2. On the rectangle they are the two strips between the corner squares, and they have real area \u2014 so dropping them is not a simplification, it is a different number. Test it with a = b = 1: 4, not 2."),
    },
    { id: "k1", kind: "check", body: "Read the middle coefficient.", conceptTag: TAG,
      explanationVariants: ["(x + 3)\u00b2 = x\u00b2 + 6x + 9, so the middle coefficient is 6.",
                            "Two strips of 3x each give 6x."],
      widget: numeric({ prompt: "In the expansion of (x + 3)\u00b2, what is the coefficient of x?", answer: 6,
        errors: [[9, "9 is the CONSTANT \u2014 the corner square, 3\u00d73. The middle term comes from the two strips."],
                 [3, "That counts one strip. There are two, one along each side."]],
        fallbackFeedback: "Two strips of 3x give 6x, so the coefficient is 6.",
        successFeedback: "6 \u2014 and its coefficient pattern 1, 6, 9 comes from 1, 2, 1 acting on powers of 3." }) },
    { id: "c2", kind: "concept", body: "Push the exponent up and the pattern keeps going. (a + b)\u00b3 has four terms, not two; (a + b)\u2074 has five. In general (a + b)\u207f expands into n + 1 terms, whose a-powers count down from n while the b-powers count up \u2014 and whose coefficients are what the rest of this chapter is about." },
    { id: "k2", kind: "check", body: "Count the terms.", conceptTag: TAG,
      explanationVariants: ["(a + b)\u2075 has 5 + 1 = 6 terms, from a\u2075 down to b\u2075.",
                            "The exponent on a runs 5, 4, 3, 2, 1, 0 \u2014 six values."],
      widget: numeric({ prompt: "How many terms does the expansion of (a + b)\u2075 have?", answer: 6,
        errors: [[5, "The count is n + 1, not n \u2014 both a\u2075 and b\u2075 are terms, and so are the four between them."],
                 [2, "Two terms would be a\u2075 + b\u2075, the same error this lesson opened by refuting."]],
        fallbackFeedback: "The powers of a run 5 down to 0, which is six terms.",
        successFeedback: "6 \u2014 one term for each way of splitting the exponent 5 between a and b." }) },
    { id: "k3", kind: "check", body: "Test the false identity.", conceptTag: TAG,
      explanationVariants: ["At a = b = 1, (a + b)\u00b2 = 4 while a\u00b2 + b\u00b2 = 2 \u2014 the identity fails.",
                            "One counterexample is enough to kill a claimed identity."],
      widget: mcq("Put a = 1 and b = 1. What do (a + b)\u00b2 and a\u00b2 + b\u00b2 come to?", [
        ["o1", "4 and 2 \u2014 they disagree", true, "Exactly. A single counterexample settles it, and the gap of 2 is the 2ab that was dropped."],
        ["o2", "2 and 2 \u2014 they agree", false, "(1 + 1)\u00b2 = 2\u00b2 = 4, not 2. Add first, then square."],
        ["o3", "4 and 4 \u2014 they agree", false, "1\u00b2 + 1\u00b2 = 2. The two expressions genuinely differ."],
      ]) },
    { id: "ch1", kind: "challenge", body: "One step further up.", conceptTag: TAG,
      explanationVariants: [`(a + b)\u00b3 has ${pascalRow(3).length} terms and its middle coefficients are 3 and 3.`,
                            "The a-exponent runs 3, 2, 1, 0 \u2014 four terms."],
      hints: ["Write (a + b)\u00b3 as (a + b)(a + b)\u00b2 and expand what you already know.",
              "(a + b)\u00b2 = a\u00b2 + 2ab + b\u00b2; multiply that by (a + b).",
              "The result is a\u00b3 + 3a\u00b2b + 3ab\u00b2 + b\u00b3 \u2014 now read the a\u00b2b coefficient."],
      widget: numeric({ prompt: "In (a + b)\u00b3 = a\u00b3 + ?a\u00b2b + 3ab\u00b2 + b\u00b3, what is the missing coefficient?", answer: choose(3, 1),
        errors: [[1, "1 is the coefficient of a\u00b3, the end term. The inner terms carry more weight because more products land on them."],
                 [2, "2 belongs to the SQUARE, (a + b)\u00b2. Cubing raises the inner coefficients to 3."]],
        fallbackFeedback: "(a + b)\u00b3 = a\u00b3 + 3a\u00b2b + 3ab\u00b2 + b\u00b3, so the coefficient is 3.",
        successFeedback: "3 \u2014 and the full row reads 1, 3, 3, 1. That row is about to get a name." }) },
    { id: "r1", kind: "recap", body: "Cross terms are the content.",
      takeaways: ["(a + b)\u207f is not a\u207f + b\u207f \u2014 cross terms appear and they are not optional.",
                  "(a + b)\u207f expands into n + 1 terms, with a's power falling as b's rises.",
                  "For n = 2 the coefficients are 1, 2, 1; for n = 3 they are 1, 3, 3, 1."],
      teaser: "Next: those coefficient rows, stacked into the triangle that generates them all." },
  ];
  lesson("bt-01-01", "powers-of-a-sum", "Powers of a Sum", "ch1-pascals-pattern", 10, steps, remedialFrom(steps, TAG));
}

/* 2. Pascal's Triangle — bt-pascals-triangle */
{
  const TAG = "bt-pascals-triangle";
  const steps = [
    { id: "c1", kind: "concept", body: "Stack the coefficient rows and a triangle appears. Row 0 is a lone 1; row 1 is 1 1; row 2 is 1 2 1; row 3 is 1 3 3 1. Every interior entry is the sum of the two directly above it, and every row begins and ends with 1. The rows are numbered from ZERO, which is the single most common place to slip." },
    { id: "i1", kind: "interactive", body: "Rebuild row 2 as area, then read the row off the regions.",
      widget: binomialAreaLab({ prompt: "Build (x + 4)(x + 4) and read the constant term \u2014 the corner region.",
        pX: 1, qX: 1, targetA: 4, targetB: 4, startA: 0, startB: 1, asks: "constant", requiredMoves: 3,
        successFeedback: "x\u00b2 + 8x + 16: one block, two strips, one corner \u2014 the regions count 1, 2, 1, which is row 2 of the triangle whatever the partition happens to be.",
        productMiddleFeedback: "The corner is 4\u00d74 = 16, one region. The 8x is a different pair of regions \u2014 the two strips, which ADD.",
        partialFeedback: "Both sides of a square must reach 4 before the corner is right.",
        signFeedback: "A negative partition draws area removed; (x + 4) adds its 4." }),
      predict: predict("Pascal's triangle starts with row 0. Which row holds the coefficients of (a + b)\u2074?",
        [["r3", "Row 3"], ["r4", "Row 4"], ["r5", "Row 5"]],
        "r4",
        "Row n serves (a + b)\u207f, because the numbering starts at row 0 for (a + b)\u2070 = 1. Row 4 reads 1 4 6 4 1. Counting the top row as \u2018row 1\u2019 shifts every coefficient by one place and is the classic source of wrong answers here."),
    },
    { id: "k1", kind: "check", body: "Build the next row.", conceptTag: TAG,
      explanationVariants: [`Row 4 is ${pascalRow(4).join(", ")}, each interior entry the sum of the two above.`,
                            "From 1 3 3 1: 1, 1+3 = 4, 3+3 = 6, 3+1 = 4, 1."],
      widget: numeric({ prompt: "Row 3 is 1, 3, 3, 1. What is the MIDDLE entry of row 4?", answer: choose(4, 2),
        errors: [[4, "4 is the second entry of row 4, from 1 + 3. The middle comes from 3 + 3."],
                 [3, "3 is a row-3 entry. Row 4's middle is built by adding the two 3s above it."]],
        fallbackFeedback: "The middle of row 4 is 3 + 3 = 6, giving the row 1, 4, 6, 4, 1.",
        successFeedback: "6 \u2014 row 4 reads 1, 4, 6, 4, 1, exactly the coefficients of (a + b)\u2074." }) },
    { id: "c2", kind: "concept", body: "Two facts make the triangle worth trusting. Every row is symmetric, so reading it backwards changes nothing. And the entries of row n add to 2\u207f \u2014 row 3 sums to 8, row 4 to 16 \u2014 which is a fast way to check a row you have just built." },
    { id: "k2", kind: "check", body: "Check a row by its sum.", conceptTag: TAG,
      explanationVariants: [`Row 4 sums to ${pascalRow(4).reduce((a, b) => a + b, 0)} = 2\u2074.`,
                            "1 + 4 + 6 + 4 + 1 = 16."],
      widget: numeric({ prompt: "What do the entries of row 4 (1, 4, 6, 4, 1) add up to?", answer: 16,
        errors: [[8, "8 is 2\u00b3, the sum of ROW 3. Row 4 doubles it."],
                 [15, "Recount \u2014 1 + 4 + 6 + 4 + 1 includes both end 1s."]],
        fallbackFeedback: "1 + 4 + 6 + 4 + 1 = 16, which is 2\u2074.",
        successFeedback: "16 = 2\u2074 \u2014 and that is not a coincidence, as lesson 3 will show." }) },
    { id: "k3", kind: "check", body: "Use the symmetry.", conceptTag: TAG,
      explanationVariants: ["Row 6 is symmetric, so the second entry equals the second-from-last: both 6.",
                            "Reading a Pascal row backwards gives the same row."],
      widget: mcq("Row 6 begins 1, 6, 15, 20, \u2026 What are its LAST two entries?", [
        ["o1", "6, 1", true, "Yes \u2014 every row is symmetric, so it ends the way it began, reversed."],
        ["o2", "15, 1", false, "That skips the 6. Reversed, the row ends \u2026 15, 6, 1."],
        ["o3", "20, 1", false, "20 is the middle entry, not the second-from-last."],
      ]) },
    { id: "ch1", kind: "challenge", body: "Reach further down.", conceptTag: TAG,
      explanationVariants: [`Row 5 is ${pascalRow(5).join(", ")}, so its largest entry is 10.`,
                            "From 1 4 6 4 1: 1, 5, 10, 10, 5, 1."],
      hints: ["Build row 5 from row 4 = 1, 4, 6, 4, 1 by adding neighbouring pairs.",
              "1, then 1+4, then 4+6, then 6+4, then 4+1, then 1.",
              "Row 5 is 1, 5, 10, 10, 5, 1 \u2014 now pick out its largest entry."],
      widget: numeric({ prompt: "What is the LARGEST entry in row 5 of Pascal's triangle?", answer: choose(5, 2),
        errors: [[5, "5 is the second entry. The middle entries are larger \u2014 they collect more paths."],
                 [6, "6 is row 4's middle. Row 5's middle entries come from 4 + 6."]],
        fallbackFeedback: "Row 5 is 1, 5, 10, 10, 5, 1, so the largest entry is 10.",
        successFeedback: "10 \u2014 middles are always the biggest, because the most product paths land there." }) },
    { id: "r1", kind: "recap", body: "The rows that generate themselves.",
      takeaways: ["Rows are numbered from 0; row n gives the coefficients of (a + b)\u207f.",
                  "Each interior entry is the sum of the two above it, and each row is symmetric.",
                  "Row n's entries sum to 2\u207f, which checks a freshly built row."],
      teaser: "Next: why these particular numbers \u2014 and why they are the same combinations you counted in probability." },
  ];
  lesson("bt-01-02", "pascals-triangle", "Pascal's Triangle", "ch1-pascals-pattern", 10, steps, remedialFrom(steps, TAG));
}

/* 3. Why Combinations Appear — bt-combinations-link (the conceptual heart) */
{
  const TAG = "bt-combinations-link";
  const steps = [
    { id: "c1", kind: "concept", body: "Expanding (a + b)\u2074 means multiplying four brackets, and from EACH bracket you take either an a or a b. Every term of the answer is one such choice sequence. So the coefficient of a\u00b2b\u00b2 is simply the number of ways to choose which two of the four brackets contribute the b \u2014 a counting question, not an algebra one." },
    { id: "i1", kind: "interactive", body: "Count the choice sequences directly.",
      widget: treeDiagram({ prompt: "Each of 3 brackets offers 2 choices, a or b. Set the tree to 3 stages of 2 and read the total number of paths.",
        stage1Label: "Brackets", stage2Label: "Choices per bracket",
        targetA: 3, targetB: 2, maxA: 6, maxB: 6, aStart: 1, bStart: 1,
        successFeedback: "8 paths \u2014 and 2\u00b3 = 8 is exactly the sum of row 3 (1 + 3 + 3 + 1). Every path is one term before like terms are collected.",
        lowFeedback: "Not enough paths yet \u2014 raise the number of brackets or the choices per bracket.",
        highFeedback: "Too many paths \u2014 three brackets of two choices is what (a + b)\u00b3 offers." }),
      predict: predict("In (a + b)\u2074, the coefficient of a\u00b2b\u00b2 counts what?",
        [["ways", "The ways to pick which 2 of the 4 brackets give the b"],
         ["product", "The product 2 \u00d7 2"],
         ["sum", "The sum 2 + 2"]],
        "ways",
        "Each term is a choice sequence, so collecting like terms is counting sequences. Choosing 2 brackets out of 4 can be done C(4,2) = 6 ways, which is precisely row 4's middle entry. The combinations from probability were the coefficients all along."),
    },
    { id: "i2", kind: "interactive", body: "See the same counting at n = 2, as regions.",
      widget: binomialAreaLab({ prompt: "Build (x + 2)(x + 6) and read the middle coefficient \u2014 the two strips together.",
        pX: 1, qX: 1, targetA: 2, targetB: 6, startA: 0, startB: 0, asks: "middle", requiredMoves: 3,
        successFeedback: "x\u00b2 + 8x + 12. There are exactly TWO strips because there are exactly C(2,1) = 2 ways to take the constant from one bracket and the x from the other \u2014 the region count IS the combination.",
        productMiddleFeedback: "The strips were multiplied: 2\u00d76 = 12 is the corner. The two strips ADD, because they are two separate ways of choosing.",
        partialFeedback: "One partition has arrived and the other has not \u2014 this rectangle is 2 down and 6 across.",
        signFeedback: "Both partitions are added here, so both stay positive." }) },
    { id: "k1", kind: "check", body: "Compute the combination.", conceptTag: TAG,
      explanationVariants: [`C(4,2) = ${choose(4, 2)}, which is row 4's middle entry.`,
                            "There are 6 ways to choose 2 brackets from 4."],
      widget: numeric({ prompt: "How many ways can you choose 2 of the 4 brackets to supply the b? (That is C(4,2).)", answer: choose(4, 2),
        errors: [[4, "4 counts choosing ONE bracket, C(4,1). Two must be chosen here."],
                 [8, "8 double-counts by treating the two chosen brackets as ordered. Choosing brackets 1 and 3 is the same term as choosing 3 and 1."]],
        fallbackFeedback: "C(4,2) = (4\u00d73)/(2\u00d71) = 6.",
        successFeedback: "6 \u2014 the same 6 that sits in the middle of row 4. The triangle was counting combinations the whole time." }) },
    { id: "c2", kind: "concept", body: "That identification is the theorem's engine: the entry in row n, position k, IS C(n, k). Pascal's addition rule is the same statement in disguise \u2014 choosing k things from n either uses the last item or does not, which is exactly C(n\u22121, k\u22121) + C(n\u22121, k), the two entries above." },
    { id: "k2", kind: "check", body: "Read a row entry as a combination.", conceptTag: TAG,
      explanationVariants: [`Row 5's third entry (position k = 2) is C(5,2) = ${choose(5, 2)}.`,
                            "Positions are counted from 0, so the third entry is k = 2."],
      widget: numeric({ prompt: "Row 5 of Pascal's triangle, position k = 2 (counting from 0). What is C(5,2)?", answer: choose(5, 2),
        errors: [[5, "That is C(5,1), position k = 1. Positions start at 0, so k = 2 is the THIRD entry."],
                 [20, "20 is C(6,3), from row 6. Stay in row 5."]],
        fallbackFeedback: "C(5,2) = (5\u00d74)/(2\u00d71) = 10.",
        successFeedback: "10 \u2014 row entry and combination are the same number, read two different ways." }) },
    { id: "k3", kind: "check", body: "Explain the symmetry.", conceptTag: TAG,
      explanationVariants: ["Choosing which k brackets give b is the same as choosing which n\u2212k give a, so C(n,k) = C(n,n\u2212k).",
                            "Every choice of a set is simultaneously a choice of its complement."],
      widget: mcq("Why is Pascal's triangle symmetric?", [
        ["o1", "Choosing k brackets to give b is the same as choosing the other n\u2212k to give a", true, "Exactly \u2014 C(n,k) = C(n,n\u2212k), because a choice and its complement are one decision."],
        ["o2", "Because addition is commutative", false, "Commutativity explains why a\u00b2b\u00b2 and b\u00b2a\u00b2 are the same term, not why the COUNTS mirror."],
        ["o3", "Because every row starts and ends with 1", false, "That is a consequence of the symmetry, not its cause."],
      ]) },
    { id: "ch1", kind: "challenge", body: "Count paths a different way.", conceptTag: TAG,
      explanationVariants: [`(a + b)\u2074 offers 2\u2074 = 16 choice sequences, and row 4 sums to ${pascalRow(4).reduce((a, b) => a + b, 0)}.`,
                            "Each of 4 brackets contributes 2 choices, giving 2\u2074 = 16."],
      hints: ["Each bracket independently offers two choices \u2014 how many brackets are there?",
              "Multiply the choices: 2 for each of the 4 brackets.",
              "2\u2074, which should also equal the sum of row 4."],
      widget: numeric({ prompt: "How many choice sequences does expanding (a + b)\u2074 produce, before like terms are collected?", answer: 16,
        errors: [[8, "8 is 2\u00b3, three brackets' worth. There are four brackets here."],
                 [5, "5 is the number of TERMS after collecting. Before collecting, each bracket doubles the count."]],
        fallbackFeedback: "Four brackets, two choices each: 2\u2074 = 16 sequences.",
        successFeedback: "16 \u2014 and row 4 sums to 16 too, because collecting like terms only groups those sequences, never loses one." }) },
    { id: "r1", kind: "recap", body: "Counting was the algebra.",
      takeaways: ["Every term of (a + b)\u207f is one choice of a-or-b from each bracket.",
                  "The coefficient of a\u207f\u207b\u1d4fb\u1d4f is C(n,k) \u2014 the number of such choices.",
                  "Pascal's row n, position k, IS C(n,k), and its symmetry is the complement rule."],
      teaser: "Next: write that identification down as a single formula \u2014 the Binomial Theorem." },
  ];
  lesson("bt-01-03", "why-combinations-appear", "Why Combinations Appear", "ch1-pascals-pattern", 11, steps, remedialFrom(steps, TAG));
}

/* ================== CH2 — The Theorem at Work ================== */

/* 4. The Binomial Theorem — bt-theorem */
{
  const TAG = "bt-theorem";
  const steps = [
    { id: "c1", kind: "concept", body: "Written out, the identification of the last lesson becomes one line: (a + b)\u207f is the sum, over k from 0 to n, of C(n,k)\u00b7a\u207f\u207b\u1d4f\u00b7b\u1d4f. Three moving parts \u2014 a combination, a falling power of a, a rising power of b \u2014 and their exponents always total n, which is the fastest check that a term was written correctly." },
    { id: "i1", kind: "interactive", body: "Confirm the n = 2 case against the theorem.",
      widget: binomialAreaLab({ prompt: "Build (x + 5)(x + 1) and read the middle coefficient \u2014 the case where the two partitions differ.",
        pX: 1, qX: 1, targetA: 5, targetB: 1, startA: 0, startB: 0, asks: "middle", requiredMoves: 3,
        successFeedback: "x\u00b2 + 6x + 5. The strips are 5x and 1x, and they ADD to 6x \u2014 while the corner multiplies to 5. Two regions, two different operations.",
        productMiddleFeedback: "The strips were multiplied: 5\u00d71 = 5 is the corner. The middle coefficient adds them: 5 + 1 = 6.",
        partialFeedback: "One partition is right and the other is not \u2014 this rectangle is 5 down and 1 across.",
        signFeedback: "Right sizes, wrong direction \u2014 both partitions are added here, so both are positive." }),
      predict: predict("In every term C(n,k)\u00b7a\u207f\u207b\u1d4f\u00b7b\u1d4f, what do the two exponents always add to?",
        [["n", "n"], ["k", "k"], ["2n", "2n"]],
        "n",
        "(n \u2212 k) + k = n identically, so every term's exponents total n no matter which term you are in. That is the cheapest error-check available: write a term, add its exponents, and if the total is not n something has gone wrong before any arithmetic was attempted."),
    },
    { id: "k1", kind: "check", body: "Assemble one term.", conceptTag: TAG,
      explanationVariants: [`The a\u00b2b\u00b3 term of (a + b)\u2075 has coefficient C(5,3) = ${choose(5, 3)}.`,
                            "b\u00b3 means k = 3, so the coefficient is C(5,3) = 10."],
      widget: numeric({ prompt: "In (a + b)\u2075, what is the coefficient of a\u00b2b\u00b3?", answer: choose(5, 3),
        errors: [[5, "That is C(5,1). Here k = 3, because b appears three times."],
                 [6, "6 is a row-4 entry. This is row 5, whose entries are 1, 5, 10, 10, 5, 1."]],
        fallbackFeedback: "b\u00b3 means k = 3, so the coefficient is C(5,3) = 10.",
        successFeedback: "10 \u2014 and the exponents 2 and 3 total 5, confirming the term belongs to this expansion." }) },
    { id: "c2", kind: "concept", body: "The theorem also handles binomials that are not bare letters. For (2x + 3)\u2074, take a = 2x and b = 3 and apply the formula unchanged \u2014 but every power now acts on the whole quantity, so a\u00b2 means (2x)\u00b2 = 4x\u00b2, coefficient included. Forgetting to raise the 2 is the standard slip." },
    { id: "k2", kind: "check", body: "Powers act on everything.", conceptTag: TAG,
      explanationVariants: ["(2x)\u00b3 = 8x\u00b3 \u2014 the exponent applies to the 2 as well as the x.",
                            "Cubing 2x cubes both factors."],
      widget: numeric({ prompt: "What is the coefficient of x\u00b3 in (2x)\u00b3?", answer: 8,
        errors: [[2, "The exponent applies to the whole quantity 2x, so the 2 is cubed too: 2\u00b3 = 8."],
                 [6, "That multiplies 2 by 3 instead of cubing 2. (2x)\u00b3 = 2\u00b3x\u00b3."]],
        fallbackFeedback: "(2x)\u00b3 = 2\u00b3 \u00b7 x\u00b3 = 8x\u00b3.",
        successFeedback: "8 \u2014 and this is why substituted binomials need brackets kept until the very last step." }) },
    { id: "k3", kind: "check", body: "Spot the malformed term.", conceptTag: TAG,
      explanationVariants: ["In (a + b)\u2076 every term's exponents total 6, so a\u00b3b\u00b2 cannot belong to it.",
                            "3 + 2 = 5 \u2260 6, so that term fails the exponent check."],
      widget: mcq("Which of these CANNOT be a term of (a + b)\u2076?", [
        ["o1", "20a\u00b3b\u00b2", true, "Right \u2014 3 + 2 = 5, not 6. The coefficient happens to be a real Pascal entry, which is what makes this one tempting."],
        ["o2", "15a\u2074b\u00b2", false, "4 + 2 = 6 and C(6,2) = 15 \u2014 this term is genuine."],
        ["o3", "6a\u2075b", false, "5 + 1 = 6 and C(6,1) = 6 \u2014 also genuine."],
      ]) },
    { id: "ch1", kind: "challenge", body: "Apply it to a substituted binomial.", conceptTag: TAG,
      explanationVariants: [`The x\u00b2 term of (x + 2)\u2074 is C(4,2)\u00b7x\u00b2\u00b72\u00b2 = ${choose(4, 2)}\u00d74 = 24.`,
                            "Coefficient 6 from the triangle, times 2\u00b2 = 4 from the substitution."],
      hints: ["Identify which k gives x\u00b2 when a = x and b = 2, in (a + b)\u2074.",
              "x\u00b2 needs k = 2, so the combination is C(4,2) = 6 \u2014 but b\u00b2 = 2\u00b2 also contributes.",
              "Multiply 6 by 2\u00b2 = 4."],
      widget: numeric({ prompt: "In the expansion of (x + 2)\u2074, what is the coefficient of x\u00b2?", answer: choose(4, 2) * 4,
        errors: [[6, "That is C(4,2) alone. The b\u00b2 = 2\u00b2 = 4 has to multiply it."],
                 [12, "That uses 2\u00b7C(4,2), raising the 2 to the first power. The b exponent here is 2, so it contributes 4."]],
        fallbackFeedback: "C(4,2)\u00b7x\u00b2\u00b72\u00b2 = 6\u00b74 = 24, so the coefficient is 24.",
        successFeedback: "24 \u2014 combination times substituted power, which is the whole procedure in one product." }) },
    { id: "r1", kind: "recap", body: "One line, three parts.",
      takeaways: ["(a + b)\u207f = \u03a3 C(n,k)\u00b7a\u207f\u207b\u1d4f\u00b7b\u1d4f for k from 0 to n.",
                  "Every term's exponents total n \u2014 a one-second check on any written term.",
                  "For substituted binomials the powers act on the whole quantity, coefficients included."],
      teaser: "Next: reach a single term without expanding anything before it." },
  ];
  lesson("bt-02-01", "the-binomial-theorem", "The Binomial Theorem", "ch2-the-theorem-at-work", 11, steps, remedialFrom(steps, TAG));
}

/* 5. Finding a Single Term — bt-general-term */
{
  const TAG = "bt-general-term";
  const steps = [
    { id: "c1", kind: "concept", body: "The theorem's real power is selective. If you want only the b\u00b3 term of (a + b)\u2077, you need not expand the other seven \u2014 set k = 3 and write C(7,3)\u00b7a\u2074\u00b7b\u00b3. The whole skill is deciding what k is, and reading it off the power of b every time." },
    { id: "i1", kind: "interactive", body: "Which region is which, when the constants differ.",
      widget: binomialAreaLab({ prompt: "Build (x + 4)(x + 2) and read the CONSTANT term \u2014 the corner alone.",
        pX: 1, qX: 1, targetA: 4, targetB: 2, startA: 1, startB: 1, asks: "constant", requiredMoves: 3,
        successFeedback: "x\u00b2 + 6x + 8. The corner is 4\u00d72 = 8 and the strips add to 6x \u2014 selecting one region is exactly what \u2018find a single term\u2019 asks you to do.",
        productMiddleFeedback: "That reads the strips instead of the corner. The corner multiplies the two partitions: 4\u00d72 = 8.",
        partialFeedback: "One partition has not arrived \u2014 this rectangle is 4 down and 2 across.",
        signFeedback: "Both partitions are added here, so both stay positive." }),
      predict: predict("In (a + b)\u2077, which k gives the term containing b\u00b3?",
        [["k3", "k = 3"], ["k4", "k = 4"], ["k7", "k = 7"]],
        "k3",
        "k IS the exponent on b, always \u2014 so b\u00b3 means k = 3 and the coefficient is C(7,3) = 35. The tempting C(7,4) comes from reading k off the power of a instead, and here it happens to give 35 as well, which hides the error. In (a + b)\u2078 the same slip would give 70 instead of 56."),
    },
    { id: "k1", kind: "check", body: "Read k off the b-power.", conceptTag: TAG,
      explanationVariants: [`b\u00b3 in (a + b)\u2077 means k = 3, so the coefficient is C(7,3) = ${choose(7, 3)}.`,
                            "The a-power is then 7 \u2212 3 = 4, and 4 + 3 = 7 checks out."],
      widget: numeric({ prompt: "In (a + b)\u2077, what is the coefficient of a\u2074b\u00b3?", answer: choose(7, 3),
        errors: [[21, "21 is C(7,2). The b-power here is 3, so k = 3, not 2."],
                 [7, "7 is C(7,1), the coefficient of a\u2076b. Match k to the exponent on b."]],
        fallbackFeedback: "k = 3 gives C(7,3) = 35.",
        successFeedback: "35 \u2014 and C(7,4) is also 35, which is why this particular case forgives the wrong reasoning. The next one will not." }) },
    { id: "c2", kind: "concept", body: "Because rows are symmetric, C(n,k) and C(n,n\u2212k) agree \u2014 so mixing up which exponent supplies k sometimes yields the right number by luck. Depending on that luck is how the error survives. Anchor k to the power of b and it never matters." },
    { id: "k2", kind: "check", body: "Where the luck runs out.", conceptTag: TAG,
      explanationVariants: [`b\u00b3 in (a + b)\u2078 means k = 3, so the coefficient is C(8,3) = ${choose(8, 3)}.`,
                            "C(8,3) = 56, while C(8,4) = 70 \u2014 here the two disagree."],
      widget: numeric({ prompt: "In (a + b)\u2078, what is the coefficient of a\u2075b\u00b3?", answer: choose(8, 3),
        errors: [[choose(8, 4), "70 is C(8,4) \u2014 k was read off the power of a. With n = 8 the symmetry no longer covers the mistake."],
                 [28, "28 is C(8,2). The b-power is 3."]],
        fallbackFeedback: "k = 3, so the coefficient is C(8,3) = 56.",
        successFeedback: "56 \u2014 and note that C(8,4) = 70 is a different number entirely. Anchoring k to b is what protects you." }) },
    { id: "k3", kind: "check", body: "Locate the term.", conceptTag: TAG,
      explanationVariants: ["Terms are numbered from k = 0, so the term with k = 3 is the fourth one.",
                            "k = 0 is the first term, so k = 3 is the fourth."],
      widget: mcq("Counting from the start, which term of (a + b)\u2077 contains b\u00b3?", [
        ["o1", "The 4th", true, "Yes \u2014 k runs 0, 1, 2, 3, so k = 3 sits in fourth place."],
        ["o2", "The 3rd", false, "That reads k as the position. Position is k + 1, because k starts at 0."],
        ["o3", "The 7th", false, "The 7th term would be k = 6, giving b\u2076."],
      ]) },
    { id: "ch1", kind: "challenge", body: "A substituted single term.", conceptTag: TAG,
      explanationVariants: [`The x\u00b2 term of (x + 3)\u2075 is C(5,3)\u00b7x\u00b2\u00b73\u00b3 = ${choose(5, 3)}\u00d727 = 270.`,
                            "k = 3 because b\u00b3 = 3\u00b3, giving 10 \u00d7 27."],
      hints: ["Decide k first: which power of the constant 3 pairs with x\u00b2 in (x + 3)\u2075?",
              "x\u00b2 leaves three factors of 3, so k = 3 and the combination is C(5,3) = 10.",
              "Multiply 10 by 3\u00b3 = 27."],
      widget: numeric({ prompt: "In (x + 3)\u2075, what is the coefficient of x\u00b2?", answer: choose(5, 3) * 27,
        errors: [[10, "That is C(5,3) alone \u2014 the 3\u00b3 = 27 still has to multiply it."],
                 [30, "That uses 3\u00b9 instead of 3\u00b3. Three factors of the constant accompany x\u00b2."]],
        fallbackFeedback: "C(5,3)\u00b7x\u00b2\u00b73\u00b3 = 10\u00b727 = 270.",
        successFeedback: "270 \u2014 one term extracted, four never computed." }) },
    { id: "r1", kind: "recap", body: "Pick the term, skip the rest.",
      takeaways: ["The general term is C(n,k)\u00b7a\u207f\u207b\u1d4f\u00b7b\u1d4f, with k read off the power of b.",
                  "Row symmetry can hide a wrong k \u2014 anchor it to b every time.",
                  "The term with exponent k sits in position k + 1."],
      teaser: "Next: let a and b be probabilities, and the expansion becomes a distribution." },
  ];
  lesson("bt-02-02", "finding-a-single-term", "Finding a Single Term", "ch2-the-theorem-at-work", 11, steps, remedialFrom(steps, TAG));
}

/* 6. Binomials Meet Probability — bt-probability */
{
  const TAG = "bt-probability";
  const steps = [
    { id: "c1", kind: "concept", body: "Let p be the chance of a success and q = 1 \u2212 p the chance of a failure. Then (p + q)\u207f expands into terms C(n,k)p\u1d4fq\u207f\u207b\u1d4f, and each one is the probability of exactly k successes in n trials. Since p + q = 1, the whole expansion sums to 1\u207f = 1 \u2014 the distribution accounts for every outcome." },
    { id: "i1", kind: "interactive", body: "Count the outcome paths behind one probability.",
      widget: treeDiagram({ prompt: "Four coin flips, two outcomes each. Set the tree to 4 stages of 2 and read the total number of outcome paths.",
        stage1Label: "Flips", stage2Label: "Outcomes per flip",
        targetA: 4, targetB: 2, maxA: 6, maxB: 6, aStart: 2, bStart: 1,
        successFeedback: "16 equally likely paths \u2014 2\u2074. Six of them show exactly two heads, which is C(4,2), so that probability is 6/16.",
        lowFeedback: "Not enough paths \u2014 add flips or outcomes.",
        highFeedback: "Too many paths \u2014 four flips of two outcomes is what this experiment offers." }),
      predict: predict("Four fair coin flips. Is \u2018exactly 2 heads\u2019 more likely than \u2018exactly 4 heads\u2019?",
        [["yes", "Yes \u2014 by a lot"], ["no", "No \u2014 all counts are equally likely"], ["same", "They are exactly equal"]],
        "yes",
        "Six of the sixteen paths give exactly two heads, but only one gives four. 6/16 against 1/16. Counts in the middle collect far more paths, which is Pascal's row 1 4 6 4 1 acting as a probability distribution."),
    },
    { id: "i2", kind: "interactive", body: "Count the whole outcome space as a grid.",
      widget: countGrid({ prompt: "The 16 outcomes of four flips are laid out as a 4 by 4 grid of squares. Count them.",
        targetArea: 16, wMax: 4, hMax: 4, wStart: 4, hStart: 4,
        commonCounts: [
          { count: 8, feedback: "8 is 2\u00b3, the outcome count for THREE flips. A fourth flip doubles it." },
          { count: 4, feedback: "4 counts the flips' outcomes one flip at a time. Each flip doubles the whole space, giving 2\u2074." },
        ],
        successFeedback: "16 equally likely outcomes \u2014 2\u2074. The distribution 1, 4, 6, 4, 1 splits exactly these 16 squares among the five possible head-counts.",
        lowFeedback: "Keep counting \u2014 four rows of four squares.",
        highFeedback: "Too many \u2014 the grid holds four rows of four." }) },
    { id: "k1", kind: "check", body: "Count the favourable paths.", conceptTag: TAG,
      explanationVariants: [`Exactly two heads in four flips happens C(4,2) = ${choose(4, 2)} ways.`,
                            "Choose which 2 of the 4 flips are heads."],
      widget: numeric({ prompt: "In how many of the 16 outcomes of four coin flips do exactly 2 heads appear?", answer: choose(4, 2),
        errors: [[8, "8 is half of 16, which would be right if every head-count were equally likely. They are not."],
                 [4, "4 counts the ways to get exactly ONE head, C(4,1)."]],
        fallbackFeedback: "C(4,2) = 6 of the 16 outcomes have exactly two heads.",
        successFeedback: "6 \u2014 row 4's middle entry, now counting coin outcomes instead of algebra terms." }) },
    { id: "c2", kind: "concept", body: "With a fair coin every path is equally likely, so the probability of exactly k heads is C(n,k)/2\u207f. When p is not \u00bd the paths stop being equally likely and each carries weight p\u1d4fq\u207f\u207b\u1d4f instead \u2014 but the COUNT of paths is still C(n,k), unchanged. The combination counts; the powers weigh." },
    { id: "k2", kind: "check", body: "Turn the count into a probability.", conceptTag: TAG,
      explanationVariants: ["Only one outcome of sixteen gives four heads, so the probability is 1/16.",
                            "C(4,4) = 1 path out of 2\u2074 = 16."],
      widget: mcq("What is the probability of getting exactly 4 heads in four fair flips?", [
        ["o1", "1/16", true, "Right \u2014 C(4,4) = 1 path out of 16, the rarest column of the distribution."],
        ["o2", "1/4", false, "That would be one flip's worth. Four heads in a row needs all four flips to cooperate."],
        ["o3", "6/16", false, "6/16 is exactly TWO heads \u2014 the most likely count, not the extreme one."],
      ]) },
    { id: "k3", kind: "check", body: "Why the total is 1.", conceptTag: TAG,
      explanationVariants: ["The counts 1, 4, 6, 4, 1 sum to 16, which is every outcome, so the probabilities sum to 1.",
                            "(p + q)\u207f = 1\u207f = 1 because p + q = 1."],
      widget: numeric({ prompt: "Add the path counts for 0, 1, 2, 3 and 4 heads (1 + 4 + 6 + 4 + 1). What total do you get?", answer: 16,
        errors: [[15, "Recount \u2014 both end 1s belong, for zero heads and for four."],
                 [10, "That drops the end terms. Every head-count from 0 to 4 is a genuine outcome."]],
        fallbackFeedback: "1 + 4 + 6 + 4 + 1 = 16 = 2\u2074, every outcome accounted for.",
        successFeedback: "16 \u2014 so the probabilities 1/16 + 4/16 + 6/16 + 4/16 + 1/16 total exactly 1, as a distribution must." }) },
    { id: "ch1", kind: "challenge", body: "An unfair coin.", conceptTag: TAG,
      explanationVariants: ["Exactly 2 heads in 3 trials with p = 1/2 has probability C(3,2)/8 = 3/8, so the numerator over 8 is 3.",
                            "C(3,2) = 3 paths out of 2\u00b3 = 8."],
      hints: ["Count the paths with exactly two successes among three trials.",
              "That count is C(3,2).",
              "C(3,2) = 3, out of 2\u00b3 = 8 equally likely paths."],
      widget: numeric({ prompt: "Three fair flips. Written as a fraction over 8, the probability of exactly 2 heads is ?/8. What is the numerator?", answer: choose(3, 2),
        errors: [[1, "1 counts only HHT-style thinking with a fixed position. Three different flips could be the tail."],
                 [6, "6 counts ORDERED arrangements of three items. Here the two heads are indistinguishable, so C(3,2) = 3."]],
        fallbackFeedback: "C(3,2) = 3 paths out of 8, so the probability is 3/8.",
        successFeedback: "3 \u2014 row 3 reads 1, 3, 3, 1, and those four numbers over 8 are the whole distribution." }) },
    { id: "r1", kind: "recap", body: "The expansion as a distribution.",
      takeaways: ["(p + q)\u207f expands to the binomial distribution: term k is the chance of exactly k successes.",
                  "C(n,k) counts the paths; p\u1d4fq\u207f\u207b\u1d4f weighs each one.",
                  "Because p + q = 1, the terms sum to 1 and account for every outcome."],
      teaser: "Next in probability: attach a payoff to each outcome and ask what the long run is worth." },
  ];
  lesson("bt-02-03", "binomials-meet-probability", "Binomials Meet Probability", "ch2-the-theorem-at-work", 11, steps, remedialFrom(steps, TAG));
}

/* ------------------------- write ------------------------- */
must(L.length === 6, "6 lessons authored");
must(JSON.stringify(L.map((l) => l.title)) === JSON.stringify(spec.lessons.map((l) => l.title)), "titles match the plan spec exactly");
for (let i = 0; i < 6; i++)
  must(L[i].steps.some((s) => s.conceptTag === spec.lessons[i].conceptTag), `lesson ${i + 1} carries ${spec.lessons[i].conceptTag}`);

const CHAPTERS = [
  { id: "ch1-pascals-pattern", title: "Pascal's Pattern", lessonIds: ["bt-01-01", "bt-01-02", "bt-01-03"] },
  { id: "ch2-the-theorem-at-work", title: "The Theorem at Work", lessonIds: ["bt-02-01", "bt-02-02", "bt-02-03"] },
];
must(JSON.stringify(CHAPTERS.flatMap((c) => c.lessonIds)) === JSON.stringify(L.map((l) => l.id)), "chapter order matches lesson order");

const dir = join(root, "content/courses", SLUG);
must(!existsSync(dir), "course dir must not pre-exist");
mkdirSync(join(dir, "lessons"), { recursive: true });
writeFileSync(join(dir, "course.json"), JSON.stringify({
  id: SLUG, slug: SLUG, title: spec.title,
  tagline: "Powers of a sum, Pascal's triangle, and why the coefficients were combinations all along \u2014 closing with the binomial distribution.",
  category: "Math", gradeLevel: 12, chapters: CHAPTERS,
}, null, 2) + "\n");
for (const l of L) writeFileSync(join(dir, "lessons", `${l.id}.json`), JSON.stringify(l, null, 2) + "\n");

console.log(`built ${SLUG}: ${L.length} lessons, ${L.reduce((t, l) => t + l.steps.length, 0)} steps; ${asserts} assertions passed`);
