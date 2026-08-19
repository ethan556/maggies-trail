/** S285 — fail-closed guard for the local Circle Theorems choice/progression packet. */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DIR = path.join(ROOT, "content", "courses", "circle-theorems", "lessons");
const expected = Object.freeze({
  "cr-01-03/i2": "1802982656daaa09fa19b99a2e2fb3c5079e40269e88db145eafaf97200db473",
  "cr-02-02/k3": "91418ac5aefe926feec44e2a6a8a311f6b53303dc34a688220c5b2d50ab3462e",
  "cr-04-01/i1": "c11789d44288bdce5fabfa7699a34acc50baf9a7bc39bdf7c3e94c345a66ef77",
  "cr-04-01/k3": "774662e3e6c1206bed949fffad47183bd4953eb4fee4c8916653fbf730ae709a",
  "cr-04-02/i2": "39481b131ff178136ba9eff03138190d3ee277ded6d56c4ec0f2aae3e37e4a54",
  "cr-04-02/k3": "2897582044fda8296264ec1785ee667e05f9b39f7e37b9c34bf33e240a0b6cf7",
  "cr-04-03/i1": "154722d4eee960f5fe6cc5af984814725f150dd5466ccf74499d14a4fc96be84",
  "cr-05-03/k2": "7e750c40381c5aa15c3b54c6a25ec8f86c8feefe575f9a25eb616addc5a6e1bd",
  "cr-05-03/k3": "8d5a0db053b4bc3cdd2dbaeb2d4c931f2ee5d17a6bf026a393100537ada1946a",
  "cr-06-01/k2": "2303db8620327b9fcc79027d7a81bbff2d1c00e57097da3307fe8d333d4fbb8d",
});
const numericPrompt = "A stage light covers a 72° sector of radius 10. Treat it as part of the full area; enter the lit area to 2 decimals.";

function hash(value) { return createHash("sha256").update(JSON.stringify(value)).digest("hex"); }
for (const [key, expectedHash] of Object.entries(expected)) {
  const [lessonId, stepId] = key.split("/");
  const lesson = JSON.parse(await readFile(path.join(DIR, `${lessonId}.json`), "utf8"));
  const widget = lesson.steps.find((step) => step.id === stepId)?.widget;
  if (widget?.type !== "mcq" || !Array.isArray(widget.options)) throw new Error(`${key}: expected MCQ`);
  const correct = widget.options.filter((option) => option.correct);
  if (correct.length !== 1) throw new Error(`${key}: expected one correct option`);
  const longestWrong = Math.max(...widget.options.filter((option) => !option.correct).map((option) => option.label.length));
  if (correct[0].label.length > longestWrong * 1.5 && correct[0].label.length - longestWrong >= 12) throw new Error(`${key}: choice-length leak returned`);
  if (hash(widget.options.map((option) => [option.id, option.label])) !== expectedHash) throw new Error(`${key}: label contract drifted`);
}
const sector = JSON.parse(await readFile(path.join(DIR, "cr-05-02.json"), "utf8")).steps.find((step) => step.id === "k2")?.widget;
if (!sector || sector.type !== "numeric" || sector.prompt !== numericPrompt || sector.answer !== 62.83 || sector.tolerance !== 0.05 || sector.commonErrors?.length !== 3) throw new Error("cr-05-02/k2: numeric transfer contract drifted");
console.log(JSON.stringify({ course: "circle-theorems", choiceRows: Object.keys(expected).length, progressionRows: 1, status: "CURRENT" }, null, 2));
