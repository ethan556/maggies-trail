/** S289 — fail-closed source contract for the local Logarithms packet. */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DIR = path.join(ROOT, "content", "courses", "logarithms", "lessons");
const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const figureBody = "d0a12bd7edaeb243184f8d4d5d2a31ee1237b0b616c0c7e1cd7dff7edc143477";
const choices = Object.freeze({
  "lg-01-01/k3": ["f0636513f4a69714cbbefb3f23759c1b2567c87a0c8765052cfa898d7b297ecb", "4d2d7ace0f8d8db44686f05e348ca2a18dd15ea327b8ef023a2b5075693b4c5a"],
  "lg-03-03/i2": ["95593e429d0ea4c1c849cf9babb640668e983f0b4a0973066f4958713adee3b5", "f269bdd0657d612d8bbbed95358cc224cbc6df48f65e3916a18c16c1dbed108a"],
  "lg-04-01/k1": ["d60f70d3e81ade61f15fb3c200faad59d59be9ef5b635e07ff7585f41c459637", "1e487de1b22d1168898c8f18803ac53066667faedd14f0a458e40f5fa14d6c07"],
  "lg-04-01/k2": ["13f01a1b5742d31edf4c42a788c12ca18a76bd94882b3a414254598c51559a34", "238c05285fc63e2719630d7e37d1cd92017c62a07913ebf935b001a806b215fc"],
  "lg-04-03/k3": ["65dd5466267a89fa28aea1415664bc977c1b788f564084b1afb66ca522594777", "05284cec351f7a6ef4e7a946a4495cd4367a7ab225eaa503a4afa0628861de7d"],
  "lg-05-01/k2": ["08df01a5001a742443176812cac5d0f00795a0f07ea35a1175d5d530ce005734", "17d1cf9f0c647e5c5cfdfb5c1ea46024672a64f1cd1d7873bd855f1e287d03fd"],
  "lg-05-02/k2": ["046267fba15c625ca1b49a8771bc340f3fca5922ca97598907ba65cfcda769ae", "371ca8465b32ae25b30cc30bea2bb1809ea8b004969d5c6f26c174948192d326"],
  "lg-05-03/k3": ["1ae053adc1854d2666095481b30ecc366f9f2c4c67c07f3f89dfce6bfe413861", "26b242c71355ed3f308fd312173154e5a7f79625c50bf379289562a1abe655c8"],
});
const load = async (lessonId) => JSON.parse(await readFile(path.join(DIR, `${lessonId}.json`), "utf8"));
const retained = (await load("lg-05-03")).steps.find((step) => step.id === "c1");
if (!retained || retained.figure !== "log-scale-ladder" || hash(retained.body) !== figureBody) throw new Error("lg-05-03/c1: exact figure alignment drifted");
for (const [key, [evaluatorHash, labelsHash]] of Object.entries(choices)) {
  const [lessonId, stepId] = key.split("/");
  const widget = (await load(lessonId)).steps.find((step) => step.id === stepId)?.widget;
  if (widget?.type !== "mcq" || !Array.isArray(widget.options)) throw new Error(`${key}: expected MCQ`);
  const correct = widget.options.filter((option) => option.correct);
  if (correct.length !== 1) throw new Error(`${key}: expected exactly one correct option`);
  const longestWrong = Math.max(...widget.options.filter((option) => !option.correct).map((option) => option.label.length));
  if (correct[0].label.length > longestWrong * 1.5 && correct[0].label.length - longestWrong >= 12) throw new Error(`${key}: choice-length leak returned`);
  const { prompt: _prompt, options, ...evaluator } = widget;
  if (hash({ ...evaluator, options: options.map(({ label: _label, ...option }) => option) }) !== evaluatorHash) throw new Error(`${key}: evaluator drifted`);
  if (hash(options.map((option) => [option.id, option.label])) !== labelsHash) throw new Error(`${key}: label contract drifted`);
}
console.log(JSON.stringify({ course: "logarithms", choiceRows: Object.keys(choices).length, figureVerified: 1, status: "CURRENT" }, null, 2));
