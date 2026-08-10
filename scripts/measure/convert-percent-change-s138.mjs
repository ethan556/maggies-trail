#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "..");
const path = resolve(root, "content/courses/proportional-relationships/lessons/pr-04-02.json");
const lesson = JSON.parse(readFileSync(path, "utf8"));
if (lesson.id !== "pr-04-02") throw new Error(`wrong lesson ${lesson.id}`);

const cases = {
  i1: { base: 10, percent: 25, direction: "markup" },
  k1: { base: 50, percent: 20, direction: "markup" },
  i2: { base: 80, percent: 5, direction: "markdown" },
  i3: { base: 200, percent: 15, direction: "markdown" },
  k2: { base: 50, percent: 10, direction: "markdown" },
  k3: { base: 20, percent: 50, direction: "markup" },
  ch1: { base: 200, percent: 8, direction: "markdown" }
};
const roundMoney = (n) => Math.round(n * 100) / 100;
const money = (n) => `$${n.toFixed(2)}`;
let changed = 0;
for (const [id, cfg] of Object.entries(cases)) {
  const step = lesson.steps.find((s) => s.id === id);
  if (!step) throw new Error(`${id}: missing step`);
  const w = step.widget;
  if (!w || w.type !== "numeric") throw new Error(`${id}: expected numeric, got ${w?.type}`);
  if (!Array.isArray(w.commonErrors) || w.commonErrors.length !== 2) throw new Error(`${id}: expected exactly two authored commonErrors`);
  const amount = roundMoney(cfg.base * cfg.percent / 100);
  const derived = roundMoney(cfg.direction === "markup" ? cfg.base + amount : cfg.base - amount);
  if (Math.abs(derived - w.answer) > 1e-9) throw new Error(`${id}: derived ${derived} != authored answer ${w.answer}`);
  const values = [w.answer, ...w.commonErrors.map((e) => e.value)];
  if (new Set(values).size !== 3) throw new Error(`${id}: answer/error values are not unique`);
  step.widget = {
    type: "percentChangeLab",
    prompt: w.prompt,
    base: cfg.base,
    percent: cfg.percent,
    direction: cfg.direction,
    currency: "$",
    choices: [
      { id: "correct", label: money(w.answer), value: w.answer, feedback: w.fallbackFeedback },
      ...w.commonErrors.map((entry, index) => ({ id: `wrong-${index + 1}`, label: money(entry.value), value: entry.value, feedback: entry.feedback }))
    ],
    fallbackFeedback: w.fallbackFeedback,
    successFeedback: w.fallbackFeedback
  };
  changed++;
}
if (changed !== 7) throw new Error(`changed ${changed}, expected 7`);
writeFileSync(path, JSON.stringify(lesson, null, 2) + "\n");
console.log(`percent-change-s138: converted ${changed} exact price experiences in ${lesson.id}`);
