/** S292 — fail-closed source contract for Series & Convergence choice parity. */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DIR = path.join(ROOT, "content", "courses", "series-convergence", "lessons");
const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const choices = Object.freeze({
  "sc-01-01/ch1": ["27d2bf6c6d189574998ba30846aff3e83a4cd1d26d54ada4beb0fdc7d4787975", "f138584b250220222e7ab1b0523d9db1417c7af88a50cc42198ef672783cbf3b"],
  "sc-01-01/k1": ["724ac14e7f23792f1df402ae63610ace9b5325eef45cceaead288f29e7a868bf", "88a63332d01259f5e40cdad9a7af3685663e2fc0632f2d871c7128eaf1b87f24"],
  "sc-01-01/k3": ["ab6b8e66fc78b59dc686653cb8e2a566e023623cf60cbe959025edd7c77269a0", "011f803c034f4fcb0d2e1008e65e795d0e6404c8ebd0a556250f2479abd4eca9"],
  "sc-01-02/ch1": ["673f45886a9e9e4b928052adbe0c709180d86b4b40ef15df44ad49896df12153", "7e3eaf1546de5a62d6765e8f6a92a85e70675144a4c4511e586e97e9a6855a25"],
  "sc-01-02/k3": ["3f59cebe80c63616d6a22903b8581a5b92dd67d53a1fd3af30145b78eb90c7f8", "9c9d7a9beb3e42fec922e1aca29623bfe2ef052d91bda2c62ba150457d2891ae"],
  "sc-01-03/k1": ["3bbb3e08e8f4cab86f593f2b409bce9e512db90bfda1538ca057ebc1d80e8389", "95a456d863c0153419e96e4ef020b1d2e0d6b405230c8cd9da94e99d9cd8d85e"],
  "sc-02-01/k1": ["31a311bf20de8c9a3c4c8e35e7cd1d25af4dee4b3a8d45a43a9e5f6790eee2af", "bd269a627d0820c046df308985fa3bca53b100acefa188b9e90f880e201d75f0"],
  "sc-02-01/k2": ["f9a34a986fc19c40aa0489a4655df35f838761dde96c8a1b7add39717dc3fa17", "65662cc155acf9d12e34cca4a510bc3d8b3fc45558c15907ebca4404caaf97af"],
  "sc-02-02/k3": ["de040c2cbe87b9905101cac448314c1b8172d19f5a6cba48ca28248d2fdf2b32", "9f5479d679dacd56a6ab18f052a0e0605c7a8c0f87aca0dace4e12f1cb875c47"],
});
for (const [key, [evaluatorHash, labelsHash]] of Object.entries(choices)) {
  const [lessonId, stepId] = key.split("/");
  const lesson = JSON.parse(await readFile(path.join(DIR, `${lessonId}.json`), "utf8"));
  const widget = lesson.steps.find((step) => step.id === stepId)?.widget;
  if (widget?.type !== "mcq" || !Array.isArray(widget.options)) throw new Error(`${key}: expected MCQ`);
  const correct = widget.options.filter((option) => option.correct);
  if (correct.length !== 1 || correct[0].id !== "o1") throw new Error(`${key}: correctness drifted`);
  const longestWrong = Math.max(...widget.options.filter((option) => !option.correct).map((option) => option.label.length));
  if (correct[0].label.length > longestWrong * 1.5 && correct[0].label.length - longestWrong >= 12) throw new Error(`${key}: choice-length leak returned`);
  const { prompt: _prompt, options, ...evaluator } = widget;
  if (hash({ ...evaluator, options: options.map(({ label: _label, ...option }) => option) }) !== evaluatorHash) throw new Error(`${key}: evaluator drifted`);
  if (hash(options.map((option) => [option.id, option.label])) !== labelsHash) throw new Error(`${key}: label contract drifted`);
}
console.log(JSON.stringify({ course: "series-convergence", choiceRows: Object.keys(choices).length, status: "CURRENT" }, null, 2));
