/** S291 — fail-closed source contract for Transformations & Measurement. */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DIR = path.join(ROOT, "content", "courses", "transformations-measurement", "lessons");
const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const withholds = Object.freeze({
  "tm-03-03/c1": "352d6e3a07e0e0b2bca84ed906949b1854f219f24ddf725f9e5921cf94f81458",
  "tm-04-02/c2": "7fc190a54c8648d2bb0fb2af12780fc6b92989ad3e010827e651a9cd80598d7b",
  "tm-05-02/c2": "0fdcb9ab0e30397a70efc2b92222f628365b3f8c6d94e18f806a3e18ba0fc30f",
  "tm-05-03/c2": "491e414873e4c2eaeac812a62fd76d9329c51923b5130ffcea3bb5829d511617",
});
const choices = Object.freeze({
  "tm-01-01/k2": ["d8f8302a00697170f07ca871150de2c8d2822b7fe1d11928add483f52fa19132", "dd485d866607b08cef85248ad6575fb66dc327e2a2b5f669e624b81675cf7571"],
  "tm-02-01/k1": ["3418b55aa1cb49ea07f5111bce6ea0f27a286db03446fd1e6a42fdb24831b07a", "2100bfaa9160bb69419a2e26711afe5a46e244bc0db776df308948c8125c76dc"],
  "tm-05-03/i2": ["b59278b9bb68870356f9c7a844d42a1527ac8d8465891412915786405b075099", "c3271fccf22e6a653cc255b045058cba8579151c0a79c7fc41244fc552c65106"],
});
const load = async (lessonId) => JSON.parse(await readFile(path.join(DIR, `${lessonId}.json`), "utf8"));
for (const [key, bodyHash] of Object.entries(withholds)) {
  const [lessonId, stepId] = key.split("/");
  const step = (await load(lessonId)).steps.find((candidate) => candidate.id === stepId);
  if (!step || Object.hasOwn(step, "figure") || hash(step.body) !== bodyHash) throw new Error(`${key}: stale figure binding or prose drift`);
}
const triangle = (await load("tm-03-02")).steps.find((step) => step.id === "c2");
if (!triangle || triangle.figure !== "la-triangle-sum" || hash(triangle.body) !== "67cedceffcd1021f2592262b8a3144cb6369dfe3f479d3b831f89939e9791282") throw new Error("tm-03-02/c2: exact triangle-sum figure alignment drifted");
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
console.log(JSON.stringify({ course: "transformations-measurement", figureWithholds: Object.keys(withholds).length, figureVerified: 1, choiceRows: Object.keys(choices).length, status: "CURRENT" }, null, 2));
