/** S291 — Place Value to Millions progression and choice repair. */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lessonDir = path.join(root, "content", "courses", "place-value-million", "lessons");
const checkOnly = process.argv.includes("--check");
const repairs = Object.freeze([
  { closure: "PROGRESSION-pv2-01-03", lessonId: "pv2-01-03", stepId: "k3", type: "numeric", before: { body: "One more value check.", prompt: "In 719,000, what is the VALUE of the digit 7?", answer: 700000 }, after: { body: "Correct a place-value claim.", prompt: "A student says the 7 in 719,000 is worth 7. What value should the student report?", answer: 700000 } },
  { closure: "PROGRESSION-pv2-02-02", lessonId: "pv2-02-02", stepId: "k2", type: "mcq", before: { body: "Read the gap correctly.", prompt: "How do you read 40,020 aloud?", answer: "a" }, after: { body: "Repair a silent-zero reading.", prompt: "A classmate reads 40,020 as 'forty thousand, two.' Which reading puts the 2 in its correct place?", answer: "a" } },
  { closure: "CHOICE-0211", lessonId: "pv2-02-03", stepId: "k3", type: "mcq", before: { labels: ["The last group must be exactly 3 digits — it should be 620,345", "Nothing — that's correct", "It should be 62,0345", "It should be 6203,45"] }, after: { labels: ["The final group needs 3 digits, so write 620,345.", "The final group needs 5 digits, so keep 6,20345.", "The final group needs 4 digits, so write 62,0345.", "The final group needs 2 digits, so write 6203,45."] } },
  { closure: "PROGRESSION-pv2-03-01/k3", lessonId: "pv2-03-01", stepId: "k3", type: "numeric", before: { body: "The halfway convention.", prompt: "Round 345,500 to the nearest thousand.", answer: 346000 }, after: { body: "Correct a halfway call.", prompt: "A student rounds 345,500 down to 345,000 because the check digit is 5. What rounded number is correct?", answer: 346000 } },
  { closure: "PROGRESSION-pv2-03-01/ch1", lessonId: "pv2-03-01", stepId: "ch1", type: "numeric", before: { body: "The rounding rollover.", prompt: "Round 999,600 to the nearest thousand.", answer: 1000000 }, after: { body: "Explain a rounding rollover.", prompt: "A student says 999,600 rounds to 999,000 to the nearest thousand. What rounded number shows the rollover?", answer: 1000000 } },
  { closure: "PROGRESSION-pv2-04-03/k2", lessonId: "pv2-04-03", stepId: "k2", type: "numeric", before: { body: "Two separate borrow spots.", prompt: "What is 500,203 − 87,456?", answer: 412747 }, after: { body: "Correct an early borrow-chain error.", prompt: "A student gets 413,747 for 500,203 − 87,456. What difference should replace that result?", answer: 412747 } },
  { closure: "PROGRESSION-pv2-04-03/ch1", lessonId: "pv2-04-03", stepId: "ch1", type: "columnCalc", before: { body: "The four-zero chain.", prompt: "What is 600,004 − 235,478? Tap each column to work it out; tap a top digit to break a ten when you need one." }, after: { body: "Audit a four-zero borrow chain.", prompt: "A student says 600,004 − 235,478 = 365,474. Use the columns to correct the missed zero-chain. Tap a top digit to break a ten when you need one." } },
]);
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const grouped = new Map();
for (const repair of repairs) grouped.set(repair.lessonId, [...(grouped.get(repair.lessonId) ?? []), repair]);
let changed = 0;
for (const [lessonId, entries] of grouped) {
  const source = path.join(lessonDir, `${lessonId}.json`);
  const lesson = JSON.parse(await readFile(source, "utf8"));
  let lessonChanged = false;
  for (const repair of entries) {
    const step = lesson.steps.find((candidate) => candidate.id === repair.stepId);
    if (!step || step.widget?.type !== repair.type) throw new Error(`${repair.closure}: expected ${repair.type} at ${repair.lessonId}/${repair.stepId}`);
    if (repair.type === "mcq") {
      const options = step.widget.options;
      if (!same(options.map((option) => option.id), ["a", "b", "c", "d"]) || !same(options.filter((option) => option.correct).map((option) => option.id), [repair.after.answer ?? "a"])) throw new Error(`${repair.closure}: MCQ evaluator drifted`);
      const current = repair.before.labels ? { labels: options.map((option) => option.label) } : { body: step.body, prompt: step.widget.prompt, answer: options.find((option) => option.correct)?.id };
      const target = repair.after.labels ? { labels: repair.after.labels } : repair.after;
      if (same(current, target)) continue;
      const expected = repair.before.labels ? { labels: repair.before.labels } : repair.before;
      if (!same(current, expected)) throw new Error(`${repair.closure}: unexpected source; refusing overwrite`);
      if (repair.after.labels) options.forEach((option, index) => { option.label = repair.after.labels[index]; });
      else { step.body = repair.after.body; step.widget.prompt = repair.after.prompt; }
    } else {
      const current = { body: step.body, prompt: step.widget.prompt, ...(repair.type === "numeric" ? { answer: step.widget.answer } : {}) };
      if (same(current, repair.after)) continue;
      if (!same(current, repair.before)) throw new Error(`${repair.closure}: unexpected source; refusing overwrite`);
      step.body = repair.after.body;
      step.widget.prompt = repair.after.prompt;
      if (repair.type === "numeric" && step.widget.answer !== repair.after.answer) throw new Error(`${repair.closure}: numeric evaluator drifted`);
    }
    changed += 1;
    lessonChanged = true;
  }
  if (lessonChanged && !checkOnly) await writeFile(source, `${JSON.stringify(lesson, null, 2)}\n`, "utf8");
}
if (checkOnly && changed) throw new Error(`S291 is not current: ${changed} signed repairs still need application`);
console.log(JSON.stringify({ course: "place-value-million", signedRootCauseClosures: 5, targetStepRepairs: repairs.length, changed, current: changed === 0 }, null, 2));
