/** S288 — fail-closed source contract for the local Right Triangles packet. */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DIR = path.join(ROOT, "content", "courses", "right-triangles-trig", "lessons");
const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const figureBodies = Object.freeze({
  "rt-01-04/c1": "ce662830e0370e7994a3a0e9db31d84108158c3dc1ccd3c1136113418b12feb5",
  "rt-03-01/c1": "ebcfb3eea95605c7adbd833ba9df8738c93c2a50ab3704a8755b6077640e42f4",
  "rt-03-02/c2": "be27324028d0494666c884e1cce67c4e4c24de9d9b553fe3a255f29c074bc09a",
  "rt-03-03/c1": "98412ccc6b61515131315332fd2f74c726ee0d397661a48f2e210239ef196275",
  "rt-04-03/c2": "d3ada7cb5e44436ec81ae22329a2557d23abf79396a4430faf219f950fbadda0",
});
const choices = Object.freeze({
  "rt-01-04/i2": ["f33018bda620877218ce2e7556bbd0defb2bf72a4574fb608762e6c6d0ef9bac", "cf33fbe7541601a069da3bdb95ac9a5da799e12b8cb0411a0ce5d7b9a7e22b00"],
  "rt-04-01/i1": ["64245b030e38bc4c45f38744a90a3cd34baf1510cfa85a691bc7ac0c4b5f25d9", "64d83fcb766bd80858604ef337d5f27226d2c3632e4a9c9c533db168c5a579b1"],
  "rt-04-01/k2": ["93995bb016a28870f82ca24c57f0db40c86ff6c0b26eb20970669831173dcded", "967c588cf9a1e803abb55eedfa64b4e48fc3077f708e20f2f69b36a09212b158"],
  "rt-04-02/i1": ["f23ca4e8d8fc6817e5a5109883aeb067276276abca66890e7485d9c132f363f6", "a6e3ffbe314ca8a21a9eb85e54bfff3be52f060046852a4555272941f6702105"],
  "rt-04-03/i1": ["959fde3f8246730cbf10fa156e8916a25d2fe98a18703c3e00528807a36d62ef", "502dab9967efc4de31865b5380cd669b6c97d0bf1755b15713b56aa5f3aed1b3"],
  "rt-05-03/k3": ["c77068175efeb13aa1347a1dea6a951f4b5e7bf18d222eece8280c7d88c9a451", "584ede7ad12a5aff3a6cb2e8fac1c2b48a4c4d44573f47df0a59ffe8c040e938"],
  "rt-05-04/i1": ["c771b8fbc024bca06efd37db4e78583230b848770dfe279d3f8e01d7d25b1b82", "47b56e897196fca06d9133e25d9341b909077623933eb1c9105928d7d230bfaa"],
});

const load = async (lessonId) => JSON.parse(await readFile(path.join(DIR, `${lessonId}.json`), "utf8"));
for (const [key, bodyHash] of Object.entries(figureBodies)) {
  const [lessonId, stepId] = key.split("/");
  const step = (await load(lessonId)).steps.find((candidate) => candidate.id === stepId);
  if (!step || Object.hasOwn(step, "figure") || hash(step.body) !== bodyHash) throw new Error(`${key}: stale figure binding or concept drift`);
}
for (const [key, [evaluatorHash, labelsHash]] of Object.entries(choices)) {
  const [lessonId, stepId] = key.split("/");
  const widget = (await load(lessonId)).steps.find((candidate) => candidate.id === stepId)?.widget;
  if (widget?.type !== "mcq" || !Array.isArray(widget.options)) throw new Error(`${key}: expected MCQ`);
  const correct = widget.options.filter((option) => option.correct);
  if (correct.length !== 1) throw new Error(`${key}: expected exactly one correct option`);
  const longestWrong = Math.max(...widget.options.filter((option) => !option.correct).map((option) => option.label.length));
  if (correct[0].label.length > longestWrong * 1.5 && correct[0].label.length - longestWrong >= 12) throw new Error(`${key}: choice-length leak returned`);
  const { prompt: _prompt, options, ...evaluator } = widget;
  if (hash({ ...evaluator, options: options.map(({ label: _label, ...option }) => option) }) !== evaluatorHash) throw new Error(`${key}: evaluator drifted`);
  if (hash(options.map((option) => [option.id, option.label])) !== labelsHash) throw new Error(`${key}: label contract drifted`);
}
console.log(JSON.stringify({ course: "right-triangles-trig", figureWithholds: Object.keys(figureBodies).length, choiceRows: Object.keys(choices).length, status: "CURRENT" }, null, 2));
