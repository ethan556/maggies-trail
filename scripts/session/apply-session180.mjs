#!/usr/bin/env node
// S180: convert the 16 frozen exp-function steps to exactNumberLab.
//
// Ordering discipline (unchanged from S161…S179):
//   1. verify EVERYTHING (all 16 steps, four independent agreement checks) before any write;
//   2. seal baselines-s180/ and session180-applied.json BEFORE mutating a single lesson file;
//   3. only then rewrite the four lessons, with a serializer proven byte-identical on a control.
//
// Four-way agreement per step, or abort:
//   (a) the hand-authored table's constants, recomputed by repeated multiplication/division only;
//   (b) the numbers extracted from the FROZEN PROMPT by a strict per-form regex;
//   (c) exactNumberTruth() of the spec this script is about to write;
//   (d) the frozen widget.answer.
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const require = createRequire(import.meta.url);
const schema = require(join(root, "scripts/audit/load-schema-runtime-s151.cjs"));
const { exactNumberTruth } = schema;

const REL = (lid) => `content/courses/exponential-functions/lessons/${lid}.json`;

// ——— the hand table: every constant transcribed from the frozen prompt, by eye ———
const ROWS = [
  { lid: "exp-01-01", sid: "k1", kind: "exp-eval", c: { a: 5, b: 3, v: 2 } },      // 5·3·3 = 45
  { lid: "exp-01-01", sid: "k2", kind: "exp-eval", c: { a: 3, b: 2, v: 4 } },      // 3·2·2·2·2 = 48
  { lid: "exp-01-01", sid: "k3", kind: "exp-zero", c: { a: 5, b: 3 } },            // f(0) = 5
  { lid: "exp-01-01", sid: "ch1", kind: "exp-eval", c: { a: 2, b: 3, v: 3 } },     // 2·3·3·3 = 54
  { lid: "exp-01-03", sid: "k1", kind: "exp-ratio", c: { t0: 5, t1: 10 } },        // 10÷5 = 2
  { lid: "exp-01-03", sid: "k2", kind: "exp-ratio", c: { t0: 1, t1: 4 } },         // 4÷1 = 4
  { lid: "exp-01-03", sid: "k3", kind: "exp-next", c: { t0: 3, t1: 6, tLast: 24 } },     // 24·(6÷3) = 48
  { lid: "exp-01-03", sid: "ch1", kind: "exp-next", c: { t0: 5, t1: 15, tLast: 135 } },  // 135·3 = 405
  { lid: "exp-02-01", sid: "k1", kind: "exp-eval", c: { a: 500, b: 2, v: 3 } },    // 500·2·2·2 = 4000
  { lid: "exp-02-01", sid: "k2", kind: "exp-eval", c: { a: 150, b: 2, v: 4 } },    // 150·16 = 2400
  { lid: "exp-02-01", sid: "k3", kind: "exp-zero", c: { a: 500, b: 2 } },          // A(0) = 500
  { lid: "exp-02-01", sid: "ch1", kind: "exp-eval", c: { a: 20, b: 3, v: 3 } },    // 20·27 = 540
  { lid: "exp-02-02", sid: "k1", kind: "exp-decay", c: { a: 640, den: 2, steps: 3 } },    // 640÷2÷2÷2 = 80
  { lid: "exp-02-02", sid: "k2", kind: "exp-decay", c: { a: 24000, den: 2, steps: 3 } },  // 24000÷8 = 3000
  { lid: "exp-02-02", sid: "k3", kind: "exp-zero-decay", c: { a: 640, den: 2 } },  // A(0) = 640
  { lid: "exp-02-02", sid: "ch1", kind: "exp-decay", c: { a: 256, den: 4, steps: 2 } },   // 256÷4÷4 = 16
];

// (a) table recompute: repeated multiplication/division only — never **.
function tableAnswer({ kind, c }) {
  if (kind === "exp-eval") { let t = c.a; for (let i = 0; i < c.v; i++) t *= c.b; return t; }
  if (kind === "exp-zero" || kind === "exp-zero-decay") return c.a;
  if (kind === "exp-decay") { let t = c.a; for (let i = 0; i < c.steps; i++) t /= c.den; return t; }
  if (kind === "exp-ratio") return c.t1 / c.t0;
  if (kind === "exp-next") return c.tLast * (c.t1 / c.t0);
  throw new Error(`unknown kind ${kind}`);
}

// (b) strict prompt extraction, cross-checked against the table's constants.
function promptCheck(row, prompt) {
  const { kind, c } = row;
  let m;
  if (kind === "exp-eval") {
    m = prompt.match(/\(x\) = (\d+) \* (\d+)\^x[.,] (?:What is|what is) [A-Za-z]\((\d+)\)|\(x\) = (\d+) \* (\d+)\^x\. How many are there after (\d+) hours/);
    if (!m) throw new Error(`exp-eval prompt unparsed: ${prompt}`);
    const [a, b, v] = m[1] !== undefined ? [+m[1], +m[2], +m[3]] : [+m[4], +m[5], +m[6]];
    if (a !== c.a || b !== c.b || v !== c.v) throw new Error(`exp-eval table/prompt mismatch: ${prompt}`);
    let t = a; for (let i = 0; i < v; i++) t *= b; return t;
  }
  if (kind === "exp-zero") {
    m = prompt.match(/^For [A-Za-z]\(x\) = (\d+) \* (\d+)\^x, what is the (?:initial value|starting amount) [A-Za-z]\(0\)\?$/);
    if (!m || +m[1] !== c.a || +m[2] !== c.b) throw new Error(`exp-zero table/prompt mismatch: ${prompt}`);
    return +m[1];
  }
  if (kind === "exp-zero-decay") {
    m = prompt.match(/^For [A-Za-z]\(x\) = (\d+) \* \(1\/(\d+)\)\^x, what is the starting amount [A-Za-z]\(0\)\?$/);
    if (!m || +m[1] !== c.a || +m[2] !== c.den) throw new Error(`exp-zero-decay table/prompt mismatch: ${prompt}`);
    return +m[1];
  }
  if (kind === "exp-decay") {
    m = prompt.match(/\(x\) = (\d+) \* \(1\/(\d+)\)\^x\. What is [A-Za-z]\((\d+)\)\?$/);
    if (!m || +m[1] !== c.a || +m[2] !== c.den || +m[3] !== c.steps) throw new Error(`exp-decay table/prompt mismatch: ${prompt}`);
    let t = +m[1]; for (let i = 0; i < +m[3]; i++) t /= +m[2]; return t;
  }
  // sequence forms: extract all four terms, demand they are genuinely geometric with r = t1/t0
  m = prompt.match(/(\d+), (\d+), (\d+), (\d+)/);
  if (!m) throw new Error(`sequence prompt unparsed: ${prompt}`);
  const t = [+m[1], +m[2], +m[3], +m[4]];
  if (t[0] !== c.t0 || t[1] !== c.t1) throw new Error(`sequence table/prompt mismatch: ${prompt}`);
  const r = t[1] / t[0];
  if (t[2] / t[1] !== r || t[3] / t[2] !== r) throw new Error(`sequence not geometric: ${prompt}`);
  if (kind === "exp-ratio") return r;
  if (t[3] !== c.tLast) throw new Error(`exp-next tLast table/prompt mismatch: ${prompt}`);
  return t[3] * r;
}

// spec construction — byte-equal labels and shapes to the exactConfig branches in variants.ts.
const CONST = (id) => ({ op: "const", id });
const MUL = (left, right) => ({ op: "multiply", left, right });
const DIV = (left, right) => ({ op: "divide", left, right });
const chain = (startId, factorId, steps) => { let f = CONST(startId); for (let i = 0; i < steps; i++) f = MUL(f, CONST(factorId)); return f; };

function config({ kind, c }) {
  const base = { task: "approximationEvaluate", values: [] };
  if (kind === "exp-eval") return { ...base,
    approxConstants: [{ id: "a", label: "the start amount a", value: c.a }, { id: "b", label: "the base b (one factor per step)", value: c.b }],
    approxFormula: chain("a", "b", c.v), approxRound: 0 };
  if (kind === "exp-zero") return { ...base,
    approxConstants: [{ id: "a", label: "the coefficient a", value: c.a }, { id: "b", label: "the base b (b^0 = b / b = 1)", value: c.b }],
    approxFormula: MUL(CONST("a"), DIV(CONST("b"), CONST("b"))), approxRound: 0 };
  if (kind === "exp-zero-decay") return { ...base,
    approxConstants: [{ id: "a", label: "the coefficient a", value: c.a }, { id: "h", label: `the decay factor 1/${c.den} ((1/${c.den})^0 = 1)`, value: 1 / c.den }],
    approxFormula: MUL(CONST("a"), DIV(CONST("h"), CONST("h"))), approxRound: 0 };
  if (kind === "exp-decay") return { ...base,
    approxConstants: [{ id: "a", label: "the start amount", value: c.a }, { id: "h", label: `the decay factor 1/${c.den} (one factor per step)`, value: 1 / c.den }],
    approxFormula: chain("a", "h", c.steps), approxRound: 0 };
  if (kind === "exp-ratio") return { ...base,
    approxConstants: [{ id: "t0", label: "the first term", value: c.t0 }, { id: "t1", label: "the second term", value: c.t1 }],
    approxFormula: DIV(CONST("t1"), CONST("t0")), approxRound: 0 };
  return { ...base,
    approxConstants: [{ id: "t0", label: "the first term", value: c.t0 }, { id: "t1", label: "the second term", value: c.t1 }, { id: "tLast", label: "the last given term", value: c.tLast }],
    approxFormula: MUL(CONST("tLast"), DIV(CONST("t1"), CONST("t0"))), approxRound: 0 };
}

// The S179-written lesson files end with a trailing newline (the pre-conversion originals do
// not); converted files adopt the S179 convention, proven byte-for-byte on an S179 control.
const serialize = (doc) => JSON.stringify(doc, null, 2) + "\n";

// ——— serializer format proof on an untouched control file ———
const control = join(root, "content/courses/linear-functions/lessons/lf-02-01.json");
const controlRaw = readFileSync(control, "utf8");
if (serialize(JSON.parse(controlRaw)) !== controlRaw) {
  console.error("ABORT: serializer does not reproduce repo byte format on the control file");
  process.exit(1);
}

// ——— verify all 16 (no writes yet) ———
const docs = new Map();
const planned = [];
for (const row of ROWS) {
  const rel = REL(row.lid);
  if (!docs.has(rel)) docs.set(rel, JSON.parse(readFileSync(join(root, rel), "utf8")));
  const doc = docs.get(rel);
  const step = doc.steps.find((s) => s.id === row.sid);
  if (!step) { console.error(`ABORT: ${row.lid}/${row.sid} missing`); process.exit(1); }
  const legacy = step.widget;
  if (legacy.type !== "numeric") { console.error(`ABORT: ${row.lid}/${row.sid} is ${legacy.type}, expected numeric`); process.exit(1); }
  if ((step.variant?.gen ?? "") !== "exp-function") { console.error(`ABORT: ${row.lid}/${row.sid} variant.gen mismatch`); process.exit(1); }
  const fromTable = tableAnswer(row);
  const fromPrompt = promptCheck(row, legacy.prompt);
  const cfg = config(row);
  const truth = exactNumberTruth(cfg);
  const stages = truth.stages.map((s) => s.key);
  const frozen = legacy.answer;
  if (!(fromTable === frozen && fromPrompt === frozen && truth.answerNumber === frozen)) {
    console.error(`ABORT before write: ${row.lid}/${row.sid} table=${fromTable} prompt=${fromPrompt} derived=${truth.answerNumber} frozen=${frozen}`);
    process.exit(1);
  }
  const widget = {
    type: "exactNumberLab",
    prompt: legacy.prompt,
    task: cfg.task,
    values: cfg.values,
    approxConstants: cfg.approxConstants,
    approxFormula: cfg.approxFormula,
    approxRound: cfg.approxRound,
    answerMode: "numeric",
    tolerance: legacy.tolerance,
    numericErrors: legacy.commonErrors,
    choices: [],
    authoredStages: [],
    requiredStageKeys: stages.slice(0, Math.min(stages.length, 4)),
    requiredExplorations: Math.min(Math.max(1, stages.length), 4),
    explorationFeedback: "Inspect the required exact-number states before checking.",
    fallbackFeedback: legacy.fallbackFeedback,
    successFeedback: legacy.fallbackFeedback,
  };
  planned.push({ rel, lessonId: row.lid, stepId: row.sid, frozenAnswer: frozen, step, widget });
}
console.log(`verified ${planned.length}/16 steps: table == prompt == derived == frozen, zero mismatch`);
if (planned.length !== 16) { console.error("ABORT: expected exactly 16 steps"); process.exit(1); }

// ——— seal baselines + ledger BEFORE mutating ———
const baseDir = join(here, "baselines-s180");
mkdirSync(baseDir, { recursive: true });
for (const rel of docs.keys()) {
  const dest = join(baseDir, rel.split("/").pop());
  if (!existsSync(dest)) copyFileSync(join(root, rel), dest);
}
writeFileSync(join(here, "session180-applied.json"), JSON.stringify({
  session: 180,
  engine: "exactNumberLab",
  changes: planned.map(({ rel, lessonId, stepId, frozenAnswer }) => ({ rel, lessonId, stepId, frozenAnswer })),
}, null, 1) + "\n");

// ——— apply ———
for (const p of planned) p.step.widget = p.widget;
for (const [rel, doc] of docs) writeFileSync(join(root, rel), serialize(doc));
console.log(`applied: ${planned.length} steps across ${docs.size} lessons; baselines sealed in baselines-s180/`);
