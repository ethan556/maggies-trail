/** S289 — source-local Logarithms MCQ parity repair and verified figure retention. */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DIR = path.join(ROOT, "content", "courses", "logarithms", "lessons");
const CHECK = process.argv.includes("--check");
const figure = ["lg-05-03", "c1", "log-scale-ladder"];
const figureBody = "Some quantities span such vast ranges that scientists measure their **logarithms** instead. On a log scale, **each step of 1 means ×10 underneath**: a magnitude-6 earthquake shakes 10 times harder than a magnitude 5, and 100 times harder than a magnitude 4. Equal steps, equal multiplications.";
const choices = [
  ["lg-01-01", "k3", { o1: "x = log₂ 10, which lies between 3 and 4", o2: "x = 5, because 2⁵ is the next whole power", o3: "No real solution because 10 is not a whole power of 2", o4: "x = 5, from dividing the target by the base" }],
  ["lg-03-03", "i2", { o1: "Keep 5; reject −2 because it makes log inputs negative", o2: "Keep both because each candidate came from the equation", o3: "Reject both because neither keeps both log inputs positive", o4: "Keep −2; reject 5 because only negative values work" }],
  ["lg-04-01", "k1", { o1: "Between them: faster than 2ˣ but slower than 3ˣ", o2: "Slower than both because e is not a whole number", o3: "Faster than both because e is larger than 2", o4: "Equal to 2.7ˣ because e rounds to 2.7" }],
  ["lg-04-01", "k2", { o1: "Decay — e⁻ˣ is the same as (1/e)ˣ with base below 1", o2: "Growth — e is above 1 before the negative exponent", o3: "Neither — the starting factor 5 makes it constant", o4: "Decay — the starting factor 5 always forces decrease" }],
  ["lg-04-03", "k3", { o1: "x = −4, valid because the log input equals 1 > 0", o2: "x = −4, extraneous because negative solutions are disallowed", o3: "x = −5, because ln(0) equals zero", o4: "No real solution because logarithms cannot equal zero" }],
  ["lg-05-01", "k2", { o1: "It does not depend on P; P cancels from the doubling equation", o2: "A larger P doubles faster because it starts farther ahead", o3: "A larger P doubles slower because it takes more to double", o4: "Only P matters; the rate r does not set the doubling time" }],
  ["lg-05-02", "k2", { o1: "(1/2)^(1/2), about 71% after half of one half-life", o2: "Exactly 75%, halfway between the starting and half amount", o3: "Exactly 50%, because four days is enough for one halving", o4: "Exactly 25%, because the amount is halved twice" }],
  ["lg-05-03", "k3", { o1: "Intensities span factors of billions, so logs make the range comparable", o2: "Logs make the physical shaking smaller before instruments measure it", o3: "Raw intensity cannot be measured without converting it to logs", o4: "Log scales are always more accurate than a linear scale" }],
];
const byLesson = new Map();
for (const [lesson, stepId, labels] of choices) (byLesson.get(lesson) ?? byLesson.set(lesson, []).get(lesson)).push({ stepId, labels });
let repaired = 0;
const packet = [];
for (const [lessonId, repairs] of byLesson) {
  const file = path.join(DIR, `${lessonId}.json`);
  const before = await readFile(file, "utf8");
  const lesson = JSON.parse(before);
  let changed = false;
  for (const { stepId, labels } of repairs) {
    const widget = lesson.steps.find((step) => step.id === stepId)?.widget;
    if (widget?.type !== "mcq" || !Array.isArray(widget.options)) throw new Error(`${lessonId}/${stepId}: expected MCQ`);
    const actual = widget.options.map((option) => option.id).sort().join("|");
    const expected = Object.keys(labels).sort().join("|");
    if (actual !== expected) throw new Error(`${lessonId}/${stepId}: option IDs drifted (${actual})`);
    for (const option of widget.options) if (option.label !== labels[option.id]) { option.label = labels[option.id]; repaired += 1; changed = true; }
  }
  if (changed && CHECK) throw new Error(`${lessonId}: repair required in --check mode`);
  const eol = before.includes("\r\n") ? "\r\n" : "\n";
  const rendered = `${JSON.stringify(lesson, null, 2)}\n`.replace(/\n/g, eol);
  if (changed) await writeFile(file, rendered, "utf8");
  packet.push(`${path.basename(file)}\0${changed ? rendered : before}`);
}
const retained = JSON.parse(await readFile(path.join(DIR, `${figure[0]}.json`), "utf8")).steps.find((step) => step.id === figure[1]);
if (!retained || retained.figure !== figure[2] || retained.body !== figureBody) throw new Error("lg-05-03/c1: exact source figure alignment drifted");
if (repaired > choices.length * 4) throw new Error(`repair count exceeded contract: ${repaired}`);
console.log(JSON.stringify({ course: "logarithms", sourceRows: choices.length + 1, choiceRows: choices.length, figureVerified: 1, repaired, current: repaired === 0, packetSeal: createHash("sha256").update(packet.join("\n")).digest("hex") }, null, 2));
