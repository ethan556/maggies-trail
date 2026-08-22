/** S292 — source-local Series & Convergence MCQ parity repair. */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DIR = path.join(ROOT, "content", "courses", "series-convergence", "lessons");
const CHECK = process.argv.includes("--check");
const choices = [
  ["sc-01-01", "ch1", { o1: "No—the terms approach 1 rather than 0, so the nth-term test says diverge", o2: "Yes—the terms stay below 1, so their total can settle", o3: "Yes—the ratio eventually drops below 1 and proves convergence", o4: "It depends on where the series starts, because early terms control the sum" }],
  ["sc-01-01", "k1", { o1: "It diverges because nonzero-size terms keep forcing finite jumps in the sums", o2: "It converges because repeated terms can cancel each other out", o3: "No conclusion follows until a comparison test is chosen", o4: "It converges when the nonzero terms are all positive" }],
  ["sc-01-01", "k3", { o1: "A settled ratio below 1 makes the tail shrink like a convergent geometric series", o2: "Every series has one fixed geometric ratio after enough terms", o3: "Terms approaching zero alone force any series to converge", o4: "It applies only when every term is positive and decreasing" }],
  ["sc-01-02", "ch1", { o1: "No—the terms exceed 1/n, so they sit above a divergent harmonic series", o2: "Yes—the terms approach zero as n grows larger", o3: "Yes—the terms are bounded above by the convergent 1/n² series", o4: "It cannot be decided without knowing how many terms are added" }],
  ["sc-01-02", "k3", { o1: "A smaller divergent comparison proves nothing; 1/n² is smaller yet converges", o2: "The harmonic series actually converges after enough terms", o3: "The comparison fails because 1/n² has negative terms", o4: "Nothing is wrong because both series must share the same behavior" }],
  ["sc-01-03", "k1", { o1: "They alternate above and below a limit, with shrinking jumps that squeeze together", o2: "They grow upward without bound because the positive terms dominate", o3: "They keep oscillating with a fixed gap and never settle", o4: "They settle exactly at the second partial sum, 0.5" }],
  ["sc-02-01", "k1", { o1: "The tangent-line approximation at 0, built from value and slope", o2: "The secant-line approximation through two nearby data points", o3: "The full function value at every input, not an approximation", o4: "The average height of the function over a symmetric interval" }],
  ["sc-02-01", "k2", { o1: "n derivatives of xⁿ produce n!, so dividing by n! matches the nth derivative", o2: "It makes all Taylor terms small enough for the series to converge", o3: "It is a notation convention with no effect on derivative values", o4: "It forces the signs to alternate as powers of x increase" }],
  ["sc-02-02", "k3", { o1: "For any fixed x, n + 1 eventually dominates it, so the ratio tends to zero", o2: "eˣ stays positive for every real input, so its series must converge", o3: "The irrational base e makes the terms shrink faster than powers", o4: "The ratio is always below 1 because the radius is exactly one" }],
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
    if (actual !== "o1|o2|o3|o4") throw new Error(`${lessonId}/${stepId}: option IDs drifted (${actual})`);
    for (const option of widget.options) if (option.label !== labels[option.id]) { option.label = labels[option.id]; repaired += 1; changed = true; }
  }
  if (changed && CHECK) throw new Error(`${lessonId}: repair required in --check mode`);
  const eol = before.includes("\r\n") ? "\r\n" : "\n";
  const rendered = `${JSON.stringify(lesson, null, 2)}\n`.replace(/\n/g, eol);
  if (changed) await writeFile(file, rendered, "utf8");
  packet.push(`${path.basename(file)}\0${changed ? rendered : before}`);
}
if (repaired > choices.length * 4) throw new Error(`repair count exceeded contract: ${repaired}`);
console.log(JSON.stringify({ course: "series-convergence", sourceRows: choices.length, choiceRows: choices.length, repaired, current: repaired === 0, packetSeal: createHash("sha256").update(packet.join("\n")).digest("hex") }, null, 2));
