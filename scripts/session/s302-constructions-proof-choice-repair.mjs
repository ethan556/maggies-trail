/** S302 — source-local Constructions & Proof MCQ choice-parity repair. */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const directory = path.join(root, "content", "courses", "constructions-and-proof", "lessons");
const check = process.argv.includes("--check");
const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const sourceJson = (value) => JSON.stringify(value).replace(/[^\x20-\x7e]/g, (character) => `\\u${character.codePointAt(0).toString(16).padStart(4, "0")}`);
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const choices = Object.freeze([
  { workId: "CHOICE-0012", lessonId: "cp-01-02", stepId: "ch", kind: "challenge", evaluatorHash: "dac754d2675ac36251183047ac538d6ce5ead8279d1802e63eb1acdfaeb6c43b", feedbackHash: "3d33e4a0df19e913c768755a35951009f9e5beda5a990bed5bc3af38c24b993b", labels: [["o1", "the perpendicular bisector — its crossing with the segment IS the midpoint", "A perpendicular bisector meets the segment at its midpoint."], ["o2", "copying the segment onto a new ray", "Copying the segment onto a new ray gives its midpoint."], ["o3", "drawing a single arc from one endpoint", "One arc from an endpoint marks the segment’s midpoint."], ["o4", "connecting the endpoints with a straightedge", "A straightedge through the endpoints marks the midpoint."]] },
  { workId: "CHOICE-0013", lessonId: "cp-02-01", stepId: "k1", kind: "check", evaluatorHash: "5f29621e4f1a0bae269fad0d105f47b9d24cfdd0f5072a6ac3b341920fe2bcb8", feedbackHash: "8271fb2a9d609bd823a38bf33e5bd62f4088d97e7e0e23da09d12ce44448ac20", labels: [["o1", "Both P and Q are equidistant from A and B, so PQ is the perpendicular bisector of AB", "P and Q are equidistant from A and B, so PQ is a perpendicular bisector."], ["o2", "Q was drawn directly above P by eye", "P and Q were drawn vertical to each other, so PQ must be perpendicular."], ["o3", "The compass always makes right angles", "The arcs cross at 90°, so their joining line is perpendicular."], ["o4", "Because PA = PB, angle APQ must be 90°", "PA = PB, so angle APQ is a right angle and PQ is perpendicular."]] },
  { workId: "CHOICE-0014", lessonId: "cp-02-02", stepId: "k1", kind: "check", evaluatorHash: "5a4e03a4a1227fb02a30ca2d3484cedae1ac164f2bf048eb8b9e4aff20a49e60", feedbackHash: "0ba85f4297ce7d71cd6ff2ff0443904e39a8c257683d709ba28f214a10fc5cf7", labels: [["o1", "P and E are both equidistant from C and D, so PE is the perpendicular bisector of CD", "P and E are equidistant from C and D, so PE is their perpendicular bisector."], ["o2", "P was directly above the midpoint of CD to begin with", "P began above CD’s midpoint, so PE meets the original line at a right angle."], ["o3", "E is the reflection of P over the line", "E is P’s reflection over the original line, so PE must meet it at a right angle."], ["o4", "any line from P to the line is perpendicular", "Any segment from P to the original line makes a right angle with it."]] },
  { workId: "CHOICE-0015", lessonId: "cp-03-02", stepId: "i3", kind: "interactive", evaluatorHash: "0784472f6625547b59d2fe14da01a8a740d794de0d81658675a79c1548da3234", feedbackHash: "d550f78a936dd5022502e8f845cac45b1b4bef5a4dd046e92a51aa179e7a6776", labels: [["o1", "Equal central angles cut equal-length chords, and equal chords make the polygon regular", "Equal central angles cut equal chords, giving equal sides and angles."], ["o2", "Because the compass can only draw equal things", "A compass automatically makes every side and angle equal."], ["o3", "Any polygon inscribed in a circle is regular", "Every polygon inscribed in a circle is automatically regular."], ["o4", "Equal angles make the polygon bigger", "Equal central angles force a larger polygon, not a regular one."]] },
  { workId: "CHOICE-0016", lessonId: "cp-03-03", stepId: "ch", kind: "challenge", evaluatorHash: "ab0b7dd1cd2d97b81bf728cfda1bd986b67ef4ecbc6844a919246337bd4a7984", feedbackHash: "edfbdcf772080a0252a5eb9a5fd084eec2b4563471f9ce34b8a358e2e4134da9", labels: [["o1", "A drawing can be slightly off in ways too small to see; only a logical chain from guaranteed facts is certain", "A drawing can hide tiny errors; only logic proves every case."], ["o2", "Drawings are always completely wrong", "A precise drawing is always exact enough to prove every construction."], ["o3", "Proofs are just a formality once you've measured", "Measurements turn into proof once the drawing has been checked."], ["o4", "You'd need to measure in more than one place", "Measuring several places proves all future construction cases."]] },
  { workId: "CHOICE-0017", lessonId: "cp-04-01", stepId: "ch", kind: "challenge", evaluatorHash: "7ce7527a5a61913b50bf066a99bc8265d41cd211f762cd039669939cbcd36acf", feedbackHash: "1dccb19a1b7fe1bb2cb4e3f9cac5f89c4e228eac9b83290424432991dd2aaaa1", labels: [["o1", "It's true — for any angle a, (180 − a) − (90 − a) = 90, with no counterexample", "True: (180 − a) − (90 − a) is always 90° for an acute angle."], ["o2", "False — a 45° angle is a counterexample", "False: a 45° angle makes the two angles differ by another amount."], ["o3", "False — a 30° angle is a counterexample", "False: a 30° angle makes the two angles differ by another amount."], ["o4", "It can't be decided without checking every angle", "Undecidable: every acute angle needs a separate numerical check."]] },
  { workId: "CHOICE-0018", lessonId: "cp-04-01", stepId: "k2", kind: "check", evaluatorHash: "87a68a3dae822a123b5c807740fa9d43e6fde2aadddd627bd6c68293f100b631", feedbackHash: "46646615cb68230809c1a4d72b2964b4b1d9c51230a89c95df3f58050f4421ca", labels: [["o1", "A drawing is just one more example, and examples can't prove a universal claim", "A single drawing is one case, not proof of a universal claim."], ["o2", "Drawings are never accurate enough to be useful", "Drawings never have enough accuracy to support any geometric claim."], ["o3", "Measuring tools are illegal in geometry", "Geometry forbids using any measuring tool on a construction."], ["o4", "Proofs are shorter than drawings", "Proofs take fewer marks to draw than a construction does."]] },
  { workId: "CHOICE-0019", lessonId: "cp-05-02", stepId: "i3", kind: "interactive", evaluatorHash: "94460804471980ac86429ef358f715e549b8e02af4a4e3cc334e2e2f84b03052", feedbackHash: "872d68f7126994f4459c8404bbad157e509e2ca183f9f8cffbfceec3b21c5332", labels: [["o1", "a vertical-angle step (an alternate exterior angle is vertical to a corresponding one)", "Use a vertical-angle fact to link an exterior angle to a corresponding angle."], ["o2", "a linear-pair step", "Use a linear-pair fact: the exterior angles form supplementary linear pairs."], ["o3", "two vertical-angle steps", "Use two vertical-angle facts to link both exterior angles through the intersection."], ["o4", "a perpendicularity step", "Use a perpendicularity fact: the transversal creates equal exterior angles."]] },
  { workId: "CHOICE-0020", lessonId: "cp-05-02", stepId: "k2", kind: "check", evaluatorHash: "e2bac45bca81e18854464251d14cc011c09a3560f502a461fa32e6c68fa42750", feedbackHash: "a6e7671f6b28094ff571b1f703cac6d2af100155235f9641fa747f26621aeaa9", labels: [["o1", "a linear pair (two angles on a straight line)", "A linear pair: adjacent angles on a straight line sum to 180°."], ["o2", "vertical angles are equal", "Vertical angles: opposite angles made by intersecting lines are equal."], ["o3", "the reflexive property", "The reflexive property: every geometric quantity is equal to itself."], ["o4", "the definition of midpoint", "The midpoint definition: it divides a segment into equal lengths."]] },
]);

const files = new Map();
async function source(lessonId) {
  const file = path.join(directory, `${lessonId}.json`);
  if (!files.has(file)) files.set(file, await readFile(file, "utf8"));
  return [file, files.get(file)];
}
function lesson(text) { return JSON.parse(text); }
function findStep(raw, stepId) {
  const found = raw.steps.find((entry) => entry.id === stepId);
  if (!found) throw new Error(`missing ${raw.id}/${stepId}`);
  return found;
}
function evaluator(widget) {
  const { prompt: _prompt, options, ...rest } = widget;
  return { ...rest, options: options.map(({ label: _label, ...option }) => option) };
}
function replaceOnce(text, pattern, replacement, label) {
  let count = 0;
  const updated = text.replace(pattern, (...matches) => {
    count += 1;
    return replacement.replace(/\$(\d+)/g, (_, index) => String(matches[Number(index)] ?? ""));
  });
  if (count !== 1) throw new Error(`${label}: expected one raw source match, found ${count}`);
  return updated;
}

for (const target of choices) {
  const [, text] = await source(target.lessonId);
  const step = findStep(lesson(text), target.stepId);
  const widget = step.widget;
  if (step.kind !== target.kind || !widget || widget.type !== "mcq" || !Array.isArray(widget.options)) throw new Error(`${target.workId}: expected ${target.kind} MCQ`);
  if (hash(evaluator(widget)) !== target.evaluatorHash || hash(widget.options.map((option) => [option.id, option.feedback ?? null])) !== target.feedbackHash) throw new Error(`${target.workId}: evaluator or feedback drift`);
  if (widget.options.filter((option) => option.correct).map((option) => option.id).join(",") !== "o1") throw new Error(`${target.workId}: correct-answer drift`);
  for (const [optionId, before, after] of target.labels) {
    const option = widget.options.find((candidate) => candidate.id === optionId);
    if (!option || (option.label !== before && option.label !== after)) throw new Error(`${target.workId}/${optionId}: label drift`);
  }
}

let changed = 0;
for (const target of choices) {
  const [file] = await source(target.lessonId);
  let text = files.get(file);
  for (const [optionId, before, after] of target.labels) {
    if (findStep(lesson(text), target.stepId).widget.options.find((option) => option.id === optionId).label === after) continue;
    const unicodeLiteral = JSON.stringify(before);
    const beforeLiteral = text.includes(unicodeLiteral) ? unicodeLiteral : sourceJson(before);
    const afterLiteral = beforeLiteral === unicodeLiteral ? JSON.stringify(after) : sourceJson(after);
    const pattern = new RegExp(`(\\{\\s*"id"\\s*:\\s*"${escape(target.stepId)}"[\\s\\S]*?"id"\\s*:\\s*"${escape(optionId)}"\\s*,\\s*"label"\\s*:\\s*)${escape(beforeLiteral)}`);
    text = replaceOnce(text, pattern, `$1${afterLiteral}`, `${target.workId}/${optionId}`);
    changed += 1;
  }
  files.set(file, text);
}

if (check && changed) throw new Error(`S302 needs ${changed} source repair(s)`);
if (!check && changed) for (const [file, text] of files) await writeFile(file, text);
const packetSeal = createHash("sha256").update([...files].sort(([a], [b]) => a.localeCompare(b)).map(([file, text]) => `${path.basename(file)}\0${text}`).join("\n")).digest("hex");
console.log(JSON.stringify({ course: "constructions-and-proof", choiceRows: choices.length, labelEdits: changed, current: changed === 0, packetSeal }, null, 2));
