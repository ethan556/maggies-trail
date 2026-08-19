/** S299 — source-local Integration & Accumulation MCQ choice-parity repair. */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const directory = path.join(root, "content", "courses", "integration-accumulation", "lessons");
const check = process.argv.includes("--check");
const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const choices = Object.freeze([
  { workId: "CHOICE-0115", lessonId: "in-01-01", stepId: "k1", evaluatorHash: "6133d1379b43536e895b0ff29e3e3ace9e8e623ddb656de13e4c1cfc001e7548", feedbackHash: "e61b8d0614b567860b2b6b8a4b15941daa78de313be15e1f0cfbdcdc0d06f369", labels: [["o1", "Each rectangle is only as tall as the LOWEST point of its strip, so it fits under the curve with room to spare.", "Left heights are lowest, so rectangles stay below."], ["o2", "Because rectangles are smaller than curves.", "Every rectangle is smaller than a curved area."], ["o3", "Because we did not use enough of them.", "Too few rectangles always makes an estimate too small."], ["o4", "It does not — it can go either way.", "Either endpoint rule must underestimate a rising curve."]] },
  { workId: "CHOICE-0116", lessonId: "in-01-01", stepId: "k2", evaluatorHash: "2cbc7c8b7d96f24ce2a12f4b2c0d9312ac4970ec054ffb4a08bcfdbff079503b", feedbackHash: "b1cd14882c36dff030271cff10c2b6b184cb501926d864a1d37a0fef4099602e", labels: [["o1", "The trapezoid rule — a slanted top matches a straight line perfectly.", "Trapezoid rule: its top matches the straight line."], ["o2", "The left rule.", "Left rule: it uses the line’s lower endpoint."], ["o3", "The right rule.", "Right rule: it uses the line’s upper endpoint."], ["o4", "None — every rule has some error.", "No rule can be exact with a single strip."]] },
  { workId: "CHOICE-0117", lessonId: "in-01-02", stepId: "k1", evaluatorHash: "e1cc09ccd9d10abd077e3f06980d3dc67e599490fffcf3ae3228d725867b94a6", feedbackHash: "fc8e28055af8b1783c4fa69b502637d382349a20f6a7e13cde271f9dcb870dde", labels: [["o1", "h = (b − a)/n shrinks to 0, and the height difference is a fixed number.", "h tends to 0 while f(b) − f(a) stays fixed."], ["o2", "Because f(b) − f(a) shrinks.", "f(b) − f(a) tends to 0 as n increases."], ["o3", "Because the rectangles become perfect.", "The rectangles become perfect at a finite n."], ["o4", "It does not vanish — it just gets small.", "The gap never vanishes; it only shrinks."]] },
  { workId: "CHOICE-0118", lessonId: "in-02-01", stepId: "k2", evaluatorHash: "fb503f54da2d9e0b7c912e19f671c66f73cee98e51782aa711d5c0f8e64d6764", feedbackHash: "c33786c8bc72ec7955b25703a9f30b93c7c7ab14c178186ec6bb6a6321794a01", labels: [["o1", "A dummy variable — it sweeps across the interval and then disappears.", "A dummy variable used only inside the integral."], ["o2", "The same thing as x.", "The output value of the accumulated area."], ["o3", "A constant.", "A constant that stays fixed during integration."], ["o4", "The width of a strip.", "The width of each approximation rectangle."]] },
  { workId: "CHOICE-0119", lessonId: "in-02-03", stepId: "k2", evaluatorHash: "1e6332e1f06a1fc50fa0d179f9773f5d8541488578cf9ff5524c9cb66651f701", feedbackHash: "bdb7687364037f6df2d2946ee241b1a6c97919bd4e870b6f09caed4c17768f44", labels: [["o1", "She ended 2 miles from where she started, having run 8 miles in total.", "Net displacement is 2 miles; total distance is 8 miles."], ["o2", "She ran 2 miles in total.", "Net displacement is 8 miles; total distance is 2 miles."], ["o3", "She ended 8 miles away.", "The runner traveled 2 miles and stopped at 8 miles."], ["o4", "The two numbers contradict each other.", "The integrals conflict because velocity changed direction."]] },
  { workId: "CHOICE-0120", lessonId: "in-03-01", stepId: "k2", evaluatorHash: "b4d4886eec071bf49a0c92aa112e553ffec7502f7d424b982dbe4d510abde37b", feedbackHash: "947bede3574c9e4ad55268d3f232c125133f6c13f089fd85c7ee80f3a6ad236d", labels: [["o1", "They are identical — both are x³. The lower limit only shifts A by a constant.", "They are both x³; changing a lower limit adds a constant."], ["o2", "They differ by 4.", "The first derivative is 4 larger than the second."], ["o3", "The second is larger.", "The lower limit makes the second derivative larger."], ["o4", "You cannot compare them.", "They cannot be compared without evaluating each integral."]] },
  { workId: "CHOICE-0121", lessonId: "in-03-02", stepId: "k2", evaluatorHash: "506c73db3aa2d6c87f35431c88dc8ecdd3d9ce245de60ee2256af46cddcb3aba", feedbackHash: "b873bd235e17d0d65985ecb4c98036f7ccbe5bf458b5af08aedece32ae0957c2", labels: [["o1", "Two antiderivatives differ by a constant, and the constant cancels in F(b) − F(a).", "Their constant difference cancels in F(b) − F(a)."], ["o2", "Because C is small.", "All antiderivatives of f are exactly the same function."], ["o3", "They do not differ — there is only one antiderivative.", "The constant C is too small to affect an integral."], ["o4", "Because the integral is definite.", "A definite integral has no need for an antiderivative."]] },
  { workId: "CHOICE-0122", lessonId: "in-04-01", stepId: "k3", evaluatorHash: "d78864052959ce93cc228db400539aa28ff7f12dcee45f44225a98ecc2fb7cc1", feedbackHash: "597ed1eb5b5bbd6548fec197f219ee711e2523b5820c2cd230c2a8f327f8d18f", labels: [["o1", "For indefinite integrals — a definite integral subtracts it away.", "In an indefinite integral; a definite integral cancels it."], ["o2", "Never — it is a formality.", "For a definite integral because the endpoints are fixed."], ["o3", "Always, including for definite integrals.", "Never; it is only a notation convention in calculus."], ["o4", "Only when the constant is large.", "Only when its numerical value is larger than 1."]] },
  { workId: "CHOICE-0123", lessonId: "in-04-03", stepId: "k2", evaluatorHash: "0d1cabb9d04e95c62de6a3c317881b402595409e725f7f52b7a1bee2952dd30f", feedbackHash: "946156f51db802fa66e3a4d0bac5db6375ac4761ae91e928c5c76a1c750c93c7", labels: [["o1", "The rule divides by n + 1, which is 0 when n = −1 — the formula breaks down.", "At n = −1, the rule divides by n + 1 = 0."], ["o2", "Because negative powers cannot be integrated.", "Negative powers cannot be integrated with any method."], ["o3", "It is an arbitrary convention.", "The exception is only a historical convention."], ["o4", "Because 1/x has no antiderivative.", "The function 1/x has no antiderivative at all."]] },
  { workId: "CHOICE-0124", lessonId: "in-05-01", stepId: "k1", evaluatorHash: "1213edb82f16ebd2323fbf82158b4d88c8d472bb02dbf8b8beacc99ab5131370", feedbackHash: "58ce48d607330cdf9eaf185b23024663d07389b6d8ee8abc25f84366555287f8", labels: [["o1", "u = x² + 1 — the inside of the bracket, whose derivative 2x is right there as a factor.", "u = x² + 1; its derivative 2x is the remaining factor."], ["o2", "u = 2x", "u = 2x; its derivative provides the outside factor."], ["o3", "u = (x² + 1)³", "u = (x² + 1)³; the whole power should be substituted."], ["o4", "u = x", "u = x; its derivative accounts for the coefficient."]] },
  { workId: "CHOICE-0125", lessonId: "in-05-03", stepId: "k1", evaluatorHash: "a4a30c1e818a8dc8273e9f6df14b9bce86622245ce02a53390dfdd4448b2ad62", feedbackHash: "ccfbffa88d1233e16374d961d2dc9d947b4cb5fd48e78372f8dab52389849b27", labels: [["o1", "u = x³ + 1 — and du = 3x² dx, so x² dx = du/3.", "u = x³ + 1; du = 3x² dx supplies the x² factor."], ["o2", "u = x²", "u = x²; its derivative supplies the x² factor."], ["o3", "u = x³", "u = x³; its derivative makes the power disappear."], ["o4", "There is no valid u.", "No substitution can match both the factor and the power."]] },
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
  if (step.kind !== "check" || !widget || widget.type !== "mcq" || !Array.isArray(widget.options)) throw new Error(`${target.workId}: expected check MCQ`);
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
    const pattern = new RegExp(`(\\{\\s*"id"\\s*:\\s*"${escape(target.stepId)}"[\\s\\S]*?"id"\\s*:\\s*"${escape(optionId)}"\\s*,\\s*"label"\\s*:\\s*)${escape(JSON.stringify(before))}`);
    text = replaceOnce(text, pattern, `$1${JSON.stringify(after)}`, `${target.workId}/${optionId}`);
    changed += 1;
  }
  files.set(file, text);
}

if (check && changed) throw new Error(`S299 needs ${changed} source repair(s)`);
if (!check && changed) for (const [file, text] of files) await writeFile(file, text);
const packetSeal = createHash("sha256").update([...files].sort(([a], [b]) => a.localeCompare(b)).map(([file, text]) => `${path.basename(file)}\0${text}`).join("\n")).digest("hex");
console.log(JSON.stringify({ course: "integration-accumulation", choiceRows: choices.length, labelEdits: changed, current: changed === 0, packetSeal }, null, 2));
