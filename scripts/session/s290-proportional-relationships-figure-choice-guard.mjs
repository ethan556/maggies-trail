/** S290 — fail-closed contract for Proportional Relationships figure/choice repair. */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DIR = path.join(ROOT, "content", "courses", "proportional-relationships", "lessons");
const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const withholds = Object.freeze({
  "pr-01-02/c1": "0f4cf2e381c028fda29417853791debb2034b70357ab9b6a858186e2b1369862",
  "pr-02-02/c3": "b876fa8801a5f0295611d71df4f15808b3d12c0db33d366656feac857fb09e1f",
  "pr-03b-01/c1": "f2d8eb9b9cfc940c4754cb020230e84fa07bab75434c112036a02830b2aeb77a",
  "pr-04-01/c3": "8485888b2b7ef72d871462f6339afe0bd75f8a754915e8f101eefc08ba56a3be",
  "pr-04-02/c1": "b359e0f427881e9fe4af7d3bea462e6f5d6a4d55b93b8577d4eef7caeed676e4",
});
const load = async (lessonId) => JSON.parse(await readFile(path.join(DIR, `${lessonId}.json`), "utf8"));
for (const [key, bodyHash] of Object.entries(withholds)) {
  const [lessonId, stepId] = key.split("/");
  const step = (await load(lessonId)).steps.find((candidate) => candidate.id === stepId);
  if (!step || Object.hasOwn(step, "figure") || hash(step.body) !== bodyHash) throw new Error(`${key}: stale figure binding or prose drift`);
}
const markdown = (await load("pr-04-02")).steps.find((step) => step.id === "c2");
if (!markdown || markdown.figure !== "pr-markdown" || hash(markdown.body) !== "5ab34fff9213e03749a6823da212d41027b14bbd114a870a3b019dddc65a3c3a") throw new Error("pr-04-02/c2: exact markdown figure alignment drifted");
const widget = (await load("pr-04b-02")).steps.find((step) => step.id === "k3")?.widget;
if (widget?.type !== "mcq" || !Array.isArray(widget.options)) throw new Error("pr-04b-02/k3: expected MCQ");
const correct = widget.options.filter((option) => option.correct);
if (correct.length !== 1 || correct[0].id !== "a") throw new Error("pr-04b-02/k3: correctness drifted");
const longestWrong = Math.max(...widget.options.filter((option) => !option.correct).map((option) => option.label.length));
if (correct[0].label.length > longestWrong * 1.5 && correct[0].label.length - longestWrong >= 12) throw new Error("pr-04b-02/k3: choice-length leak returned");
const { prompt: _prompt, options, ...evaluator } = widget;
if (hash({ ...evaluator, options: options.map(({ label: _label, ...option }) => option) }) !== "f2ea79921113fbd54d2ccf96919fbec2f12599319bf595afc8f314890859ec89") throw new Error("pr-04b-02/k3: evaluator drifted");
if (hash(options.map((option) => [option.id, option.label])) !== "98af056e4397d72dbf5b2f20dbfacbf0936d6759adaefe2aeda40f33f88666b7") throw new Error("pr-04b-02/k3: labels drifted");
console.log(JSON.stringify({ course: "proportional-relationships", figureWithholds: Object.keys(withholds).length, figureVerified: 1, choiceRows: 1, status: "CURRENT" }, null, 2));
