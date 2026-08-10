#!/usr/bin/env node
// S181b: the remaining 12 a1-exponential numeric steps -> exactNumberLab/approximationEvaluate.
// Same four-way pre-write gate as S180/S181a. The prompt check is deliberately fussy: exp-04-02
// ch1 names TWO functions, so the extractor finds the definition of the function the question
// actually asks about rather than the first one in the sentence.
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const require = createRequire(import.meta.url);
const { exactNumberTruth } = require(join(root, "scripts/audit/load-schema-runtime-s151.cjs"));
const REL = (lid) => `content/courses/exponential-functions/lessons/${lid}.json`;

const ROWS = [
  { lid: "exp-01-02", sid: "k3", kind: "exp-decay", c: { a: 81, den: 3, steps: 2 } },
  { lid: "exp-01-02", sid: "ch1", kind: "exp-decay", c: { a: 32, den: 2, steps: 4 } },
  { lid: "exp-02-03", sid: "k2", kind: "exp-eval", c: { a: 25, b: 2, v: 3 } },
  { lid: "exp-02-03", sid: "ch1", kind: "exp-rate", c: { a: 8, fn: 3, fd: 2, v: 3 } },
  { lid: "exp-04-01", sid: "k1", kind: "exp-zero", c: { a: 3, b: 4 } },
  { lid: "exp-04-01", sid: "k3", kind: "exp-zero", c: { a: 10, b: 3 } },
  { lid: "exp-04-01", sid: "ch1", kind: "exp-zero", c: { a: 4, b: 5 } },
  { lid: "exp-04-02", sid: "k1", kind: "exp-eval", c: { a: 10, b: 2, v: 2 } },
  { lid: "exp-04-02", sid: "k3", kind: "exp-eval", c: { a: 1, b: 4, v: 3 } },
  { lid: "exp-04-02", sid: "ch1", kind: "exp-eval", c: { a: 2, b: 3, v: 2 } },
  { lid: "exp-04-03", sid: "k2", kind: "exp-eval", c: { a: 3, b: 2, v: 4 } },
  { lid: "exp-04-03", sid: "ch1", kind: "exp-eval", c: { a: 5, b: 2, v: 3 } },
];

const tableAnswer = ({ kind, c }) => {
  if (kind === "exp-eval") { let t = c.a; for (let i = 0; i < c.v; i++) t *= c.b; return t; }
  if (kind === "exp-decay") { let t = c.a; for (let i = 0; i < c.steps; i++) t /= c.den; return t; }
  if (kind === "exp-rate") { let t = c.a; for (let i = 0; i < c.v; i++) t = (t * c.fn) / c.fd; return t; }
  if (kind === "exp-zero") return c.a;
  throw new Error(`unknown kind ${kind}`);
};

function promptCheck({ kind, c }, prompt) {
  if (kind === "exp-zero") {
    if (!/y-axis|y-intercept/.test(prompt)) throw new Error(`exp-zero prompt is not about the intercept: ${prompt}`);
    const m = prompt.match(/\(x\) = (\d+) \* (\d+)\^x/);
    if (!m || +m[1] !== c.a || +m[2] !== c.b) throw new Error(`exp-zero parts mismatch: ${prompt}`);
    return +m[1];
  }
  if (kind === "exp-decay") {
    const m = prompt.match(/\(x\) = (\d+) \* \(1\/(\d+)\)\^x, what is [A-Za-z]\((\d+)\)\?/);
    if (!m || +m[1] !== c.a || +m[2] !== c.den || +m[3] !== c.steps) throw new Error(`exp-decay parts mismatch: ${prompt}`);
    let t = +m[1]; for (let i = 0; i < +m[3]; i++) t /= +m[2]; return t;
  }
  // The asked-about function decides which definition is read.
  const ask = prompt.match(/what is ([A-Za-z])\((\d+)\)\?/i);
  if (!ask) throw new Error(`no question target: ${prompt}`);
  const [name, at] = [ask[1], +ask[2]];
  if (kind === "exp-rate") {
    const defs = [...prompt.matchAll(/([A-Za-z])\(x\) = (\d+) \* \((\d+)\/(\d+)\)\^x/g)].filter((d) => d[1] === name);
    if (defs.length !== 1) throw new Error(`expected one definition of ${name}: ${prompt}`);
    const [, , a, fn, fd] = defs[0];
    if (+a !== c.a || +fn !== c.fn || +fd !== c.fd || at !== c.v) throw new Error(`exp-rate parts mismatch: ${prompt}`);
    let t = +a; for (let i = 0; i < at; i++) t = (t * +fn) / +fd; return t;
  }
  const defs = [...prompt.matchAll(/([A-Za-z])\(x\) = (\d+) \* (\d+)\^x/g)].filter((d) => d[1] === name);
  if (defs.length !== 1) throw new Error(`expected one definition of ${name}: ${prompt}`);
  const [, , a, b] = defs[0];
  if (+a !== c.a || +b !== c.b || at !== c.v) throw new Error(`exp-eval parts mismatch: ${prompt}`);
  let t = +a; for (let i = 0; i < at; i++) t *= +b; return t;
}

const CONST = (id) => ({ op: "const", id });
const chain = (startId, factorId, steps) => { let f = CONST(startId); for (let i = 0; i < steps; i++) f = { op: "multiply", left: f, right: CONST(factorId) }; return f; };
const gcd = (x, y) => (y ? gcd(y, x % y) : x);

function config({ kind, c }) {
  const base = { task: "approximationEvaluate", values: [], approxRound: 0 };
  if (kind === "exp-eval") return { ...base,
    approxConstants: [{ id: "a", label: "the start amount a", value: c.a }, { id: "b", label: "the base b (one factor per step)", value: c.b }],
    approxFormula: chain("a", "b", c.v) };
  if (kind === "exp-decay") return { ...base,
    approxConstants: [{ id: "a", label: "the start amount", value: c.a }, { id: "h", label: `the decay factor 1/${c.den} (one factor per step)`, value: 1 / c.den }],
    approxFormula: chain("a", "h", c.steps) };
  if (kind === "exp-rate") {
    const d = gcd(c.fn, c.fd), fn = c.fn / d, fd = c.fd / d;
    return { ...base,
      approxConstants: [{ id: "a", label: "the start amount", value: c.a }, { id: "f", label: `the growth factor ${fn}${fd === 1 ? "" : `/${fd}`} (one factor per step)`, value: fn / fd }],
      approxFormula: chain("a", "f", c.v) };
  }
  return { ...base,
    approxConstants: [{ id: "a", label: "the coefficient a", value: c.a }, { id: "b", label: "the base b (b^0 = b / b = 1)", value: c.b }],
    approxFormula: { op: "multiply", left: CONST("a"), right: { op: "divide", left: CONST("b"), right: CONST("b") } } };
}

const serialize = (doc) => JSON.stringify(doc, null, 2) + "\n";
const control = join(root, "content/courses/exponential-functions/lessons/exp-03-01.json");
if (serialize(JSON.parse(readFileSync(control, "utf8"))) !== readFileSync(control, "utf8")) {
  console.error("ABORT: serializer does not reproduce the repo byte format"); process.exit(1);
}

const docs = new Map();
const planned = [];
for (const row of ROWS) {
  const rel = REL(row.lid);
  if (!docs.has(rel)) docs.set(rel, JSON.parse(readFileSync(join(root, rel), "utf8")));
  const step = docs.get(rel).steps.find((s) => s.id === row.sid);
  if (!step || step.widget.type !== "numeric") { console.error(`ABORT: ${row.lid}/${row.sid} not a numeric step`); process.exit(1); }
  if (step.variant?.gen !== "a1-exponential") { console.error(`ABORT: ${row.lid}/${row.sid} gen=${step.variant?.gen}`); process.exit(1); }
  const legacy = step.widget;
  const fromTable = tableAnswer(row);
  const fromPrompt = promptCheck(row, legacy.prompt);
  const cfg = config(row);
  const t = exactNumberTruth(cfg);
  if (!(fromTable === legacy.answer && fromPrompt === legacy.answer && t.answerNumber === legacy.answer)) {
    console.error(`ABORT before write: ${row.lid}/${row.sid} table=${fromTable} prompt=${fromPrompt} derived=${t.answerNumber} frozen=${legacy.answer}`);
    process.exit(1);
  }
  const stages = t.stages.map((s) => s.key);
  planned.push({ rel, lessonId: row.lid, stepId: row.sid, frozenAnswer: legacy.answer, step,
    widget: { type: "exactNumberLab", prompt: legacy.prompt, task: cfg.task, values: [],
      approxConstants: cfg.approxConstants, approxFormula: cfg.approxFormula, approxRound: 0,
      answerMode: "numeric", tolerance: legacy.tolerance, numericErrors: legacy.commonErrors,
      choices: [], authoredStages: [],
      requiredStageKeys: stages.slice(0, Math.min(stages.length, 4)),
      requiredExplorations: Math.min(Math.max(1, stages.length), 4),
      explorationFeedback: "Inspect the required exact-number states before checking.",
      fallbackFeedback: legacy.fallbackFeedback, successFeedback: legacy.fallbackFeedback } });
}
if (planned.length !== 12) { console.error("ABORT: expected exactly 12 steps"); process.exit(1); }
console.log(`verified ${planned.length}/12: table == prompt == derived == frozen, zero mismatch`);

const baseDir = join(here, "baselines-s181b");
mkdirSync(baseDir, { recursive: true });
for (const rel of docs.keys()) {
  const dest = join(baseDir, rel.split("/").pop());
  if (!existsSync(dest)) copyFileSync(join(root, rel), dest);
}
writeFileSync(join(here, "session181b-applied.json"), JSON.stringify({
  session: 181, wave: "a1-exponential", engine: "exactNumberLab",
  changes: planned.map(({ rel, lessonId, stepId, frozenAnswer }) => ({ rel, lessonId, stepId, frozenAnswer })),
}, null, 1) + "\n");
for (const p of planned) p.step.widget = p.widget;
for (const [rel, doc] of docs) writeFileSync(join(root, rel), serialize(doc));
console.log(`applied: ${planned.length} steps across ${docs.size} lessons; baselines sealed in baselines-s181b/`);
