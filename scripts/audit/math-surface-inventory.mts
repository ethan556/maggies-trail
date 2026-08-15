#!/usr/bin/env npx tsx
/**
 * S242 / MATH-02 — EVERY LEARNER-FACING MATH PATHWAY, INCLUDING THE ONES THAT BYPASS THE BOUNDARY.
 *
 * WHAT MATH-02 ASKS FOR: "Map every learner-facing math pathway. 100% surface inventory tied to
 * renderer/canonicalizer tests."
 *
 * THE HALF THAT MATTERS. Cataloguing the call sites of `MathProse` is easy and nearly useless on its
 * own — those are the surfaces that already work. The question worth answering is the complement:
 * WHERE DOES AUTHORED OR GENERATED TEXT REACH THE SCREEN WITHOUT PASSING THROUGH THE BOUNDARY AT
 * ALL? A field rendered as `{spec.caption}` in bare JSX never meets the tokenizer, so its `x^2`
 * cannot render — and no presentation index will ever show it, because those indexes measure what
 * the tokenizer does with a string, not whether the string was handed to it.
 *
 * So this builds three lists:
 *   1. ROUTED — component call sites that pass text through MathProse/MathText, with the
 *      `includeArithmetic` setting each one uses. That setting is a property of the SURFACE, not of
 *      the string, so the same text renders differently in two places and the inventory has to say
 *      which is which.
 *   2. UNROUTED — JSX expressions that interpolate a spec/step/item field directly. Each is a
 *      candidate bypass, and the ones whose field carries math shorthand in the corpus are the
 *      findings.
 *   3. FIELD REACH — for every widget spec field that holds a string, whether the corpus/generators
 *      ever put math shorthand in it. A field that never carries shorthand does not need routing;
 *      one that does and is unrouted is a defect.
 *
 * WHAT IT CANNOT SEE, stated because a surface inventory that overclaims is worse than none. This is
 * a static scan of JSX text. A field reached through a variable, a helper, or `dangerouslySetInnerHTML`
 * is invisible to it, and so is anything rendered by a component this scan does not recognise as a
 * text sink. It finds bypasses; it does not prove their absence.
 *
 * Usage: npx tsx scripts/audit/math-surface-inventory.mts [--write]
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { execSync } from "node:child_process";
import { VARIANT_GENERATORS } from "../../src/lib/variants";
import { hashSeed, mulberry32 } from "../../src/lib/prng";

const ROOT = process.cwd();
const OUT = join(ROOT, "reports", "math-presentation");
const WRITE = process.argv.includes("--write");
const seal = (() => {
  try { return execSync("git rev-parse --short HEAD", { cwd: ROOT }).toString().trim(); }
  catch { return "unsealed"; }
})();

const posix = (p: string) => p.split(sep).join("/");
function walkFiles(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) walkFiles(full, out);
    else if (e.isFile() && /\.tsx$/.test(e.name) && !/\.test\.tsx$/.test(e.name)) out.push(full);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* 1. ROUTED SURFACES                                                                               */
/* ------------------------------------------------------------------ */

type Routed = { file: string; line: number; component: string; arithmetic: boolean; expression: string };
const routed: Routed[] = [];

/* ------------------------------------------------------------------ */
/* 2. UNROUTED CANDIDATES                                                                           */
/* ------------------------------------------------------------------ */

type Unrouted = { file: string; line: number; expression: string; field: string };
const unrouted: Unrouted[] = [];

/** `{spec.prompt}` / `{item.body}` / `{step.feedback}` sitting directly in JSX, not inside a prop. */
const BYPASS = /\{\s*((?:spec|step|item|w|lesson|option|o|choice)\.[A-Za-z0-9_.?[\]]*)\s*\}/g;
/** A prop assignment is not a text sink — `text={spec.prompt}` is routed if the component routes. */
const IS_PROP = /[A-Za-z-]+=\s*$/;

for (const file of walkFiles(join(ROOT, "src"))) {
  const rel = posix(relative(ROOT, file));
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, index) => {
    for (const m of line.matchAll(/<(MathProse|MathText|MathInline|MathDisplay)\b([^>]*)/g)) {
      routed.push({
        file: rel, line: index + 1, component: m[1],
        arithmetic: /includeArithmetic(?!=\{false\})/.test(m[2]),
        expression: m[0].slice(0, 110).trim()
      });
    }
    for (const m of line.matchAll(BYPASS)) {
      const before = line.slice(0, m.index ?? 0);
      if (IS_PROP.test(before)) continue;
      const field = m[1].split(".").slice(1).join(".");
      unrouted.push({ file: rel, line: index + 1, expression: m[0], field });
    }
  });
}

/* ------------------------------------------------------------------ */
/* 3. FIELD REACH — which spec fields actually carry math shorthand                                 */
/* ------------------------------------------------------------------ */

/** The shorthands the boundary exists to convert. A field holding one of these needs routing. */
const SHORTHAND = /\^|sqrt\s*\(|(?<![\w/])\d+\s*\/\s*\d+(?![\w/])|[≤≥≠±π∞√∑∫]|<=|>=|\bpi\b/;
const fieldCarriesMath = new Map<string, { hits: number; example: string }>();

function scanFields(node: unknown, path: string) {
  if (typeof node === "string") {
    if (!SHORTHAND.test(node)) return;
    const leaf = path.replace(/\[\d+\]/g, "[]");
    const prior = fieldCarriesMath.get(leaf);
    if (prior) prior.hits++;
    else fieldCarriesMath.set(leaf, { hits: 1, example: node.slice(0, 90) });
    return;
  }
  if (Array.isArray(node)) { node.forEach((v, i) => scanFields(v, `${path}[${i}]`)); return; }
  if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) scanFields(v, path ? `${path}.${k}` : k);
}

function walkContent(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) walkContent(full, out);
    else if (e.isFile() && e.name.endsWith(".json")) out.push(full);
  }
  return out;
}
for (const file of walkContent(join(ROOT, "content"))) {
  let json: Record<string, any>;
  try { json = JSON.parse(readFileSync(file, "utf8")); } catch { continue; }
  const lesson = json.lesson ?? json;
  for (const step of lesson.steps ?? []) {
    for (const key of ["body", "feedback", "successFeedback"]) scanFields(step[key], key);
    (step.hints ?? []).forEach((h: unknown) => scanFields(h, "hints[]"));
    if (step.predict) scanFields(step.predict, "predict");
    scanFields(step.widget, "widget");
  }
}
for (const generator of VARIANT_GENERATORS) {
  const forms = generator.forms?.length ? [...generator.forms] : ["default"];
  for (const form of forms) {
    for (let i = 0; i < 4; i++) {
      try { scanFields(generator.gen(mulberry32(hashSeed(`${generator.tag}|${form}|core|${i}`)), "core", form as never).widget, "widget"); }
      catch { /* declaration-only default; not this audit's concern */ }
    }
  }
}

/* ------------------------------------------------------------------ */
/* CROSS-REFERENCE: an unrouted expression whose field is known to carry math.                      */
/* ------------------------------------------------------------------ */

const mathFieldLeaves = new Set([...fieldCarriesMath.keys()].map((k) => k.split(".").pop() ?? k));
const suspects = unrouted.filter((u) => mathFieldLeaves.has(u.field.split(".").pop() ?? u.field));

/* ------------------------------------------------------------------ */
/* OUTPUT                                                                                           */
/* ------------------------------------------------------------------ */

const csv = (cells: string[]) => cells.map((c) => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(",");
const byFile = new Map<string, { on: number; off: number }>();
for (const r of routed) {
  const entry = byFile.get(r.file) ?? { on: 0, off: 0 };
  if (r.arithmetic) entry.on++; else entry.off++;
  byFile.set(r.file, entry);
}

console.log(`math-surface-inventory @ ${seal}`);
console.log(`  routed call sites          ${routed.length} across ${byFile.size} files`);
for (const [file, n] of [...byFile].sort((a, b) => (b[1].on + b[1].off) - (a[1].on + a[1].off)).slice(0, 8))
  console.log(`    ${String(n.on + n.off).padStart(4)}  ${file}  (arithmetic on ${n.on}, off ${n.off})`);
console.log(`  direct JSX interpolations  ${unrouted.length}`);
console.log(`  spec fields carrying math  ${fieldCarriesMath.size}`);
console.log(`  BYPASS SUSPECTS            ${suspects.length}  (interpolated field also seen carrying shorthand)`);
for (const s of suspects.slice(0, 12)) console.log(`    ${s.file}:${s.line}  ${s.expression}`);

if (WRITE) {
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, "MATH_SURFACE_INVENTORY.csv"), [
    `# sourceSeal=${seal} generatedBy=scripts/audit/math-surface-inventory.mts`,
    "# kind=routed: text passed through the boundary, with the includeArithmetic setting of that call site.",
    "# kind=bypass-suspect: a spec/step field interpolated straight into JSX whose name is also seen carrying math shorthand.",
    "# kind=field: a spec field observed holding math shorthand in authored content or generated output.",
    "# STATIC SCAN. A field reached via a variable, a helper or dangerouslySetInnerHTML is invisible here:",
    "# this finds bypasses, it does not prove their absence.",
    csv(["kind", "file", "line", "detail", "arithmetic", "example"]),
    ...routed.map((r) => csv(["routed", r.file, String(r.line), r.component, r.arithmetic ? "on" : "off", r.expression])),
    ...suspects.map((s) => csv(["bypass-suspect", s.file, String(s.line), s.field, "", s.expression])),
    ...[...fieldCarriesMath].sort((a, b) => b[1].hits - a[1].hits)
      .map(([field, v]) => csv(["field", "", "", field, "", `${v.hits} occurrence(s): ${v.example}`]))
  ].join("\n") + "\n");
  console.log(`  wrote ${posix(relative(ROOT, join(OUT, "MATH_SURFACE_INVENTORY.csv")))}`);
}
