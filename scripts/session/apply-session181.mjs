#!/usr/bin/env node
// S181: convert the 11 frozen exponent-solving steps to exactNumberLab/exponentSolve.
// Same discipline as S180: verify all 11 first, seal baselines + ledger, then write.
//
// Four-way agreement per step, or abort:
//   (a) the hand table's parts, solved by repeated multiplication only (never ** , never log);
//   (b) the numbers extracted from the FROZEN PROMPT by a strict per-shape regex;
//   (c) exactNumberTruth() of the spec about to be written;
//   (d) the frozen widget.answer.
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const require = createRequire(import.meta.url);
const { exactNumberTruth } = require(join(root, "scripts/audit/load-schema-runtime-s151.cjs"));

const REL = (lid) => `content/courses/exponential-functions/lessons/${lid}.json`;

// coef · (bn/bd)^x = rn/rd, every part a positive integer.
const ROWS = [
  { lid: "exp-03-01", sid: "k1", c: { coef: 1, bn: 3, bd: 1, rn: 81, rd: 1 } },   // 3^4 = 81
  { lid: "exp-03-01", sid: "k2", c: { coef: 1, bn: 2, bd: 1, rn: 32, rd: 1 } },   // 2^5 = 32
  { lid: "exp-03-01", sid: "ch1", c: { coef: 1, bn: 3, bd: 1, rn: 243, rd: 1 } }, // 3^5 = 243
  { lid: "exp-03-02", sid: "k1", c: { coef: 2, bn: 3, bd: 1, rn: 54, rd: 1 } },   // 54/2 = 27 = 3^3
  { lid: "exp-03-02", sid: "k2", c: { coef: 7, bn: 2, bd: 1, rn: 56, rd: 1 } },   // 56/7 = 8 = 2^3
  { lid: "exp-03-02", sid: "k3", c: { coef: 2, bn: 5, bd: 1, rn: 50, rd: 1 } },   // 50/2 = 25 = 5^2
  { lid: "exp-03-02", sid: "ch1", c: { coef: 6, bn: 2, bd: 1, rn: 48, rd: 1 } },  // 48/6 = 8 = 2^3
  { lid: "exp-03-03", sid: "k1", c: { coef: 1, bn: 3, bd: 1, rn: 1, rd: 9 } },    // 3^-2 = 1/9
  { lid: "exp-03-03", sid: "k2", c: { coef: 1, bn: 2, bd: 1, rn: 1, rd: 16 } },   // 2^-4 = 1/16
  { lid: "exp-03-03", sid: "k3", c: { coef: 1, bn: 1, bd: 3, rn: 9, rd: 1 } },    // (1/3)^-2 = 9
  { lid: "exp-03-03", sid: "ch1", c: { coef: 1, bn: 5, bd: 1, rn: 1, rd: 25 } },  // 5^-2 = 1/25
];

// (a) table solve: repeated multiplication only, scanning the same window the engine uses.
function tableAnswer({ coef, bn, bd, rn, rd }) {
  const ipow = (base, k) => { let out = 1; for (let i = 0; i < k; i++) out *= base; return out; };
  const hits = [];
  for (let x = -12; x <= 12; x++) {
    const k = Math.abs(x);
    const pn = ipow(x >= 0 ? bn : bd, k);
    const pd = ipow(x >= 0 ? bd : bn, k);
    if (coef * pn * rd === rn * pd) hits.push(x);
  }
  if (hits.length !== 1) throw new Error(`table: ${hits.length} solutions`);
  return hits[0];
}

// (b) strict prompt extraction, cross-checked against the table's parts.
function promptCheck(row, prompt) {
  const { coef, bn, bd, rn, rd } = row.c;
  const idx = (base, target) => { let acc = 1; for (let k = 0; k <= 12; k++) { if (acc === target) return k; acc *= base; } throw new Error(`not a power of ${base}: ${target}`); };
  let m;
  if ((m = prompt.match(/^Solve (\d+)\^x = 1\/(\d+)\.$/))) {
    if (coef !== 1 || +m[1] !== bn || bd !== 1 || rn !== 1 || +m[2] !== rd) throw new Error(`negExponent parts mismatch: ${prompt}`);
    return -idx(+m[1], +m[2]);
  }
  if ((m = prompt.match(/^Solve \(1\/(\d+)\)\^x = (\d+)\.$/))) {
    if (coef !== 1 || bn !== 1 || +m[1] !== bd || +m[2] !== rn || rd !== 1) throw new Error(`reciprocalBase parts mismatch: ${prompt}`);
    return -idx(+m[1], +m[2]);
  }
  if ((m = prompt.match(/^Solve (\d+) \* (\d+)\^x = (\d+)\.$/))) {
    if (+m[1] !== coef || +m[2] !== bn || bd !== 1 || +m[3] !== rn || rd !== 1) throw new Error(`coefficient parts mismatch: ${prompt}`);
    const isolated = +m[3] / +m[1];
    if (!Number.isInteger(isolated)) throw new Error(`coefficient does not divide: ${prompt}`);
    return idx(+m[2], isolated);
  }
  if ((m = prompt.match(/^Solve (\d+)\^x = (\d+)\.$/))) {
    if (coef !== 1 || +m[1] !== bn || bd !== 1 || +m[2] !== rn || rd !== 1) throw new Error(`plain parts mismatch: ${prompt}`);
    return idx(+m[1], +m[2]);
  }
  throw new Error(`unparsed prompt: ${prompt}`);
}

const config = ({ coef, bn, bd, rn, rd }) => ({
  task: "exponentSolve", values: [],
  esCoef: coef, esBaseNum: bn, esBaseDen: bd, esRhsNum: rn, esRhsDen: rd,
});

const serialize = (doc) => JSON.stringify(doc, null, 2) + "\n";

// serializer format proof on an S180-written control (untouched by this session)
const control = join(root, "content/courses/exponential-functions/lessons/exp-01-01.json");
if (serialize(JSON.parse(readFileSync(control, "utf8"))) !== readFileSync(control, "utf8")) {
  console.error("ABORT: serializer does not reproduce the repo byte format on the control file");
  process.exit(1);
}

const docs = new Map();
const planned = [];
for (const row of ROWS) {
  const rel = REL(row.lid);
  if (!docs.has(rel)) docs.set(rel, JSON.parse(readFileSync(join(root, rel), "utf8")));
  const doc = docs.get(rel);
  const step = doc.steps.find((s) => s.id === row.sid);
  if (!step) { console.error(`ABORT: ${row.lid}/${row.sid} missing`); process.exit(1); }
  const legacy = step.widget;
  if (legacy.type !== "numeric") { console.error(`ABORT: ${row.lid}/${row.sid} is ${legacy.type}`); process.exit(1); }
  const gen = step.variant?.gen;
  if (gen !== "exp-solve" && gen !== "a1-exponential") { console.error(`ABORT: ${row.lid}/${row.sid} gen=${gen}`); process.exit(1); }
  const fromTable = tableAnswer(row.c);
  const fromPrompt = promptCheck(row, legacy.prompt);
  const cfg = config(row.c);
  const t = exactNumberTruth(cfg);
  const frozen = legacy.answer;
  if (!(fromTable === frozen && fromPrompt === frozen && t.answerNumber === frozen)) {
    console.error(`ABORT before write: ${row.lid}/${row.sid} table=${fromTable} prompt=${fromPrompt} derived=${t.answerNumber} frozen=${frozen}`);
    process.exit(1);
  }
  const stages = t.stages.map((s) => s.key);
  planned.push({
    rel, lessonId: row.lid, stepId: row.sid, frozenAnswer: frozen, step,
    widget: {
      type: "exactNumberLab", prompt: legacy.prompt, task: cfg.task, values: [],
      esCoef: cfg.esCoef, esBaseNum: cfg.esBaseNum, esBaseDen: cfg.esBaseDen,
      esRhsNum: cfg.esRhsNum, esRhsDen: cfg.esRhsDen,
      answerMode: "numeric", tolerance: legacy.tolerance, numericErrors: legacy.commonErrors,
      choices: [], authoredStages: [],
      requiredStageKeys: stages.slice(0, Math.min(stages.length, 4)),
      requiredExplorations: Math.min(Math.max(1, stages.length), 4),
      explorationFeedback: "Inspect the required exact-number states before checking.",
      fallbackFeedback: legacy.fallbackFeedback, successFeedback: legacy.fallbackFeedback,
    },
  });
}
if (planned.length !== 11) { console.error("ABORT: expected exactly 11 steps"); process.exit(1); }
console.log(`verified ${planned.length}/11: table == prompt == derived == frozen, zero mismatch`);

const baseDir = join(here, "baselines-s181");
mkdirSync(baseDir, { recursive: true });
for (const rel of docs.keys()) {
  const dest = join(baseDir, rel.split("/").pop());
  if (!existsSync(dest)) copyFileSync(join(root, rel), dest);
}
writeFileSync(join(here, "session181-applied.json"), JSON.stringify({
  session: 181, engine: "exactNumberLab", task: "exponentSolve",
  changes: planned.map(({ rel, lessonId, stepId, frozenAnswer }) => ({ rel, lessonId, stepId, frozenAnswer })),
}, null, 1) + "\n");

for (const p of planned) p.step.widget = p.widget;
for (const [rel, doc] of docs) writeFileSync(join(root, rel), serialize(doc));
console.log(`applied: ${planned.length} steps across ${docs.size} lessons; baselines sealed in baselines-s181/`);
