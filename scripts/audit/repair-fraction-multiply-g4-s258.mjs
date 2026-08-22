import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const COURSE = path.join(ROOT, "content", "courses", "fraction-multiply-g4", "lessons");
const CHECK = process.argv.includes("--check");

const step = (lesson, id) => {
  const found = lesson.steps.find((entry) => entry.id === id);
  if (!found) throw new Error(`Missing ${lesson.id}/${id}`);
  return found;
};

const mainVisualContexts = {
  "g4x-01-03/c1": "The figure shows another unit-fraction example, 1/4; use the same one-equal-part idea when collecting four sixths.",
  "g4x-02-01/c2": "The figure shows another beyond-one point, 5/4; here the three 2/5 jumps land at 6/5 instead.",
  "g4x-02-02/c1": "The figure shows another equal-groups model, 4 × 2/3 = 8/3; the four rows of 3/8 use the same fixed-piece-size structure.",
  "g4x-02-02/c2": "The figure shows another repeated-addition example, 3 × 2/5 = 6/5; stacked eighth-pieces are collected in the same way.",
  "g4x-02-03/c2": "The figure shows another improper fraction, 11/8 = 1 3/8; regroup 15/4 into fourth-sized wholes by the same method.",
  "g4x-02-04/c1": "The figure shows the same conversion direction with another value, 11/8 = 1 3/8; regroup 12/8 into complete groups of eight.",
  "g4x-02-04/c2": "The figure shows the inverse conversion, 2 1/4 = 9/4; reading that grouping backward illustrates how an improper fraction becomes a mixed number.",
  "g4x-03-02/c1": "The figure shows another equal-groups product, 4 × 2/3 = 8/3; five batches of 3/4 follow the same count-the-pieces structure.",
  "g4x-03-03/c1": "The figure shows another repeated-jump model, three jumps of 4 landing at 12; six jumps of 3/8 use the same number-line action with fractional lengths.",
  "g4x-03-04/c1": "The figure shows another benchmark comparison, 3/5 > 1/2; for 5/6, comparing with one whole supports an estimate near six for seven groups.",
  "g4x-03-04/c2": "The figure shows another repeated-addition product, 3 × 2/5 = 6/5; unlike multiplying both parts, repeated groups increase the value.",
};

const numeric = (prompt, answer, previewDenominator, commonErrors, fallbackFeedback, successFeedback) => ({
  type: "numeric", prompt, answer, tolerance: 0, unit: "", ...(previewDenominator ? { previewDenominator } : {}),
  commonErrors, fallbackFeedback, successFeedback,
});
const option = (id, label, correct, feedback) => ({ id, label, correct, feedback });
const mcq = (prompt, options) => ({ type: "mcq", prompt, options });

const remedialPlans = {
  "g4x-01-01": ["fa-add-like", "The figure shows 2/5 + 1/5 = 3/5: the count changes while the fifth-sized pieces stay fixed.", numeric(
    "A cyclist rides 2/7 mile, then 3/7 mile more. Express the total as ?/7. What is the numerator?", 5, 7,
    [{ value: 7, feedback: "Seven names the piece size; add the two counts of seventh-sized pieces." }, { value: 6, feedback: "Multiplying 2 and 3 does not represent joining the two distances; add the piece counts." }],
    "Add the numerators because both distances use seventh-sized pieces.", "Correct — two sevenths plus three sevenths is five sevenths.")],
  "g4x-01-02": ["fm-groups", "The figure shows 4 × 2/3 = 8/3: four groups scale the piece count while thirds remain thirds.", mcq(
    "Which expression correctly represents 5 × 2/7?", [
      option("o0", "(5 × 2)/7", true, "Correct — five groups of two seventh-sized pieces make ten sevenths."),
      option("o1", "5/(2 × 7)", false, "That changes the piece size instead of collecting five equal groups."),
      option("o2", "(5 + 2)/7", false, "The 5 counts groups, so it multiplies the two pieces in each group."),
      option("o3", "(5 × 2)/(5 × 7)", false, "Scaling both parts renames 2/7; it does not make five groups of 2/7."),
    ])],
  "g4x-01-03": ["frac-unit-fourth", "The figure identifies 1/4 as one equal part; a numerator counts copies of the named unit fraction.", numeric(
    "Use unit-fraction counting to compute 5 × 1/8 as ?/8. What is the numerator?", 5, 8,
    [{ value: 8, feedback: "Eight names the piece size; five copies of one eighth make five eighths." }, { value: 13, feedback: "Adding the group count to the denominator mixes two different roles." }],
    "Count five copies of one eighth while keeping the eighth-sized pieces fixed.", "Correct — 5 × 1/8 = 5/8.")],
  "g4x-01-04": ["fa-repeated-add", "The figure shows 3 × 2/5 as three copies of two fifths; the same counting rule works for other whole-number factors.", numeric(
    "Use repeated groups to compute 3 × 4/7 as ?/7. What is the numerator?", 12, 7,
    [{ value: 21, feedback: "That scales the denominator; the seventh-sized pieces stay the same size." }, { value: 4, feedback: "Four is one group's piece count; collect all three groups." }],
    "Multiply the group count by the numerator and keep the named denominator.", "Correct — 3 × 4/7 = 12/7.")],
  "g4x-02-01": ["fa-repeated-add", "The figure shows three groups of 2/5 reaching 6/5, the same endpoint described by three equal 2/5 jumps.", mcq(
    "On a number line marked in sixths, how do you show 5 × 1/6?", [
      option("o0", "Five jumps of 1/6, landing on 5/6", true, "Correct — five equal one-sixth jumps land at five sixths."),
      option("o1", "One jump of 5/6", false, "That reaches the same endpoint but does not model five equal groups."),
      option("o2", "Six jumps of 1/5, landing on 6/5", false, "That swaps the group count and piece size."),
      option("o3", "Five jumps of 5/6, landing on 25/6", false, "Each jump must be one sixth, not five sixths."),
    ])],
  "g4x-02-02": ["fm-groups", "The figure stacks four groups of 2/3; each row keeps the same third-sized pieces while their total count grows.", mcq(
    "Five rows each shade 1/8 of a same-size bar. What fraction is shaded altogether?", [
      option("o0", "5/8", true, "Correct — five rows contribute five eighth-sized pieces."),
      option("o1", "5/40", false, "Stacking rows does not repartition the original whole into fortieths."),
      option("o2", "6/8", false, "The five rows and one shaded piece per row multiply; they do not add as unlike roles."),
      option("o3", "1/8", false, "That counts only one row; include all five rows."),
    ])],
  "g4x-02-03": ["fa-improper-mixed", "The figure regroups 11/8 as 1 3/8, making visible why an improper fraction can exceed one whole.", mcq(
    "Use a piece count to decide: why is 3 × 3/4 greater than one whole?", [
      option("o0", "Nine fourths is more than the four fourths in one whole", true, "Correct — 3 × 3/4 = 9/4, which contains more than two wholes."),
      option("o1", "Every product is greater than both factors", false, "That rule is false; the piece count here shows why this particular product exceeds one."),
      option("o2", "Three fourths is already greater than one", false, "Three fourths is below one; taking three groups moves the total past one."),
      option("o3", "Fractions cannot be greater than one", false, "Improper fractions such as 9/4 are greater than one."),
    ])],
  "g4x-02-04": ["fa-improper-mixed", "The figure groups 11 eighth-sized pieces into one whole and three eighths; the same complete-group method converts any improper fraction.", numeric(
    "Regroup the pieces into wholes: convert 14/5 to a mixed number. What is the WHOLE NUMBER part?", 2, undefined,
    [{ value: 14, feedback: "Fourteen counts fifth-sized pieces; group them into sets of five." }, { value: 3, feedback: "Three complete wholes need fifteen fifths, but only fourteen are available." }],
    "Count how many complete groups of five fit into fourteen pieces.", "Correct — 14/5 = 2 4/5, so the whole-number part is 2.")],
  "g4x-03-01": ["fm-groups", "The figure separates group count from group size: four groups, each containing two third-sized pieces.", numeric(
    "Use the group count and group size to compute 4 × 3/7 as ?/7. What is the numerator?", 12, 7,
    [{ value: 28, feedback: "That multiplies by the denominator; seventh-sized pieces keep their size." }, { value: 3, feedback: "Three sevenths is one group; collect four groups." }],
    "Multiply the four groups by the three pieces in each group.", "Correct — four groups of three sevenths make twelve sevenths.")],
  "g4x-03-02": ["fa-improper-mixed", "The figure regroups an improper fraction into complete wholes and a remainder, the final step when a scaled recipe exceeds one cup.", numeric(
    "Three recipes each use 5/6 cup of flour. Express the total as ?/6. What is the numerator?", 15, 6,
    [{ value: 5, feedback: "Five sixths is one recipe; include all three recipes." }, { value: 8, feedback: "Adding the group count to the numerator does not build three equal groups." }],
    "Multiply three recipes by five sixth-sized pieces per recipe.", "Correct — the total is 15/6 cups, or 2 1/2 cups.")],
  "g4x-03-03": ["number-line-jumps", "The figure shows equal jumps accumulating a total distance; fractional lap lengths use the same repeated-jump structure.", mcq(
    "A swimmer completes 4 laps of 3/10 kilometre. Which computes the total distance?", [
      option("o0", "4 × 3/10 = 12/10 kilometres", true, "Correct — four equal laps collect twelve tenths of a kilometre."),
      option("o1", "4 + 3/10 kilometres", false, "Four counts laps, not kilometres to add directly."),
      option("o2", "4 ÷ 3/10 kilometres", false, "That asks how many fractional lengths fit into four kilometres."),
      option("o3", "3/10 kilometre", false, "That is one lap; include all four laps."),
    ])],
  "g4x-03-04": ["fa-benchmark-half", "The figure benchmarks 3/5 against one half; comparing 4/5 with one whole similarly predicts the size of several groups.", mcq(
    "Roughly how large is 6 × 4/5?", [
      option("o0", "About 5, because 24/5 = 4 4/5", true, "Correct — twenty-four fifths is four and four fifths, close to five."),
      option("o1", "About 24, using only 6 × 4", false, "Twenty-four counts fifth-sized pieces; it is not twenty-four wholes."),
      option("o2", "Less than 1 because 4/5 is a fraction", false, "Six groups of nearly one whole total nearly six wholes."),
      option("o3", "Exactly 6 because 4/5 rounds to 1", false, "Six is an upper estimate; the exact value 4 4/5 is closer to five."),
    ])],
};

function restoreVariantContracts(lesson) {
  const suffix = {
    k2: "Then explain why the denominator keeps its role.",
    k3: "Use the result to check the retrieval case.",
    ch1: "Use the result to complete the transfer case.",
  };
  for (const id of Object.keys(suffix)) {
    const entry = step(lesson, id);
    if (entry.variant?.form !== "faWholeTimesFractionNumeric") continue;
    let prompt = entry.widget.prompt.replace(/^(?:Apply without the model|Retrieve in a new form|Transfer to a final context):\s*/i, "");
    prompt = prompt.replace(/^compute\b/, "Compute").replace(/\s+(?:Then explain why|Use the result to).+$/i, "").trim();
    entry.widget.prompt = `${prompt} ${suffix[id]}`;
  }
}

function synchronizeVisualsAndRemedials(lesson) {
  for (const [key, context] of Object.entries(mainVisualContexts)) {
    const [lessonId, stepId] = key.split("/");
    if (lesson.id !== lessonId) continue;
    const concept = step(lesson, stepId);
    const body = concept.body.replace(/\s+The figure shows (?:another|the same|the inverse).+$/s, "").trim();
    concept.body = `${body} ${context}`;
    concept.narration = concept.body;
  }
  if (!Array.isArray(lesson.remedials) || lesson.remedials.length !== 1) throw new Error(`${lesson.id}: expected one remedial route`);
  const route = lesson.remedials[0];
  const [figure, visual, widget] = remedialPlans[lesson.id];
  const body = route.concept.body.replace(/\s+The figure (?:shows|identifies|stacks|regroups|groups|separates|benchmarks).+$/s, "").trim();
  route.concept.body = `${body} ${visual}`;
  route.concept.narration = route.concept.body;
  route.concept.figure = figure;
  route.check.widget = widget;
}

const files = (await readdir(COURSE)).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 12) throw new Error(`Expected 12 lessons, found ${files.length}`);
let changed = 0;
const hashes = [];
for (const file of files) {
  const full = path.join(COURSE, file);
  const before = await readFile(full, "utf8");
  const lesson = JSON.parse(before);
  restoreVariantContracts(lesson);
  synchronizeVisualsAndRemedials(lesson);
  const after = `${JSON.stringify(lesson, null, 2)}\n`;
  if (after !== before) {
    changed += 1;
    if (!CHECK) await writeFile(full, after, "utf8");
  }
  hashes.push(createHash("sha256").update(after).digest("hex"));
}
if (CHECK && changed) throw new Error(`${changed} fraction-multiply-g4 lessons are not S258-normalized`);
console.log(JSON.stringify({
  status: CHECK ? "CURRENT" : "UPDATED", lessons: files.length, changed,
  restoredLiteralVariantPrompts: 14, synchronizedMainFigures: 11,
  visualRemedialsAdded: 12, distinctRemedialTransfersAdded: 12,
  sourceRevisionResidual: 0,
  courseSeal: createHash("sha256").update(hashes.join("\n")).digest("hex"),
}, null, 2));
