/**
 * S237 — accessible/visible parity measurement.
 *
 * THE RULE: accessible-only text (sr-only spans, aria-labels) may not state a value the visible
 * interface withholds. When it does, screen-reader users are handed something sighted learners
 * must work out — moneyBoard announcing "target 325 cents" beside a receipt reading "Change ?".
 *
 * This script MEASURES; it does not gate. Run it to size the problem before fixing the gate shape.
 *
 *   node scripts/audit/accessible-parity-s237.mjs [--limit N] [--engine name]
 *
 * Output: CSV on stdout, summary on stderr.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const limitPer = Number(args[args.indexOf("--limit") + 1]) || 4;
const onlyEngine = args.includes("--engine") ? args[args.indexOf("--engine") + 1] : null;

/** Collect authored widget specs, grouped by engine type. */
const byType = new Map();
const walk = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const f = join(dir, e.name);
    if (e.isDirectory()) walk(f);
    else if (f.endsWith(".json")) {
      let j;
      try { j = JSON.parse(readFileSync(f, "utf8")); } catch { continue; }
      (function rec(n, lesson) {
        if (!n || typeof n !== "object") return;
        if (typeof n.type === "string" && typeof n.prompt === "string") {
          if (!byType.has(n.type)) byType.set(n.type, []);
          byType.get(n.type).push({ spec: n, lesson });
        }
        for (const k in n) rec(n[k], lesson);
      })(j, e.name.replace(/\.json$/, ""));
    }
  }
};
walk("content");

/**
 * Numbers a learner could read off. Deliberately ignores 0 and 1 — they appear as counters,
 * indices and "1 coin" pluralisation everywhere, and would drown real findings in noise.
 */
const numbersIn = (text) => {
  const out = new Set();
  for (const m of String(text).matchAll(/-?\d+(?:\.\d+)?/g)) {
    const n = Number(m[0]);
    if (Number.isFinite(n) && Math.abs(n) > 1) out.add(m[0]);
  }
  return out;
};

/** The answer, where the spec states it outright. Derived answers are handled by the DOM diff. */
const declaredAnswers = (spec) => {
  const out = new Set();
  if (Array.isArray(spec.choices)) {
    for (const c of spec.choices) if (c && c.correct === true && c.label != null) out.add(String(c.label));
  }
  for (const [k, v] of Object.entries(spec)) {
    if (/^target/i.test(k) && typeof v === "number") out.add(String(v));
  }
  return out;
};

const rows = [["engine", "lesson", "kind", "value", "detail"]];
let engines = 0;
for (const [type, entries] of [...byType.entries()].sort()) {
  if (onlyEngine && type !== onlyEngine) continue;
  engines++;
  for (const { spec, lesson } of entries.slice(0, limitPer)) {
    // Static signal only: the answer is declared in the spec but never appears in the prompt.
    // A widget that also withholds it visually is where the accessible text becomes the giveaway.
    const promptNums = numbersIn(spec.prompt ?? "");
    for (const a of declaredAnswers(spec)) {
      const bare = a.replace(/[^\d.-]/g, "");
      if (!bare || Math.abs(Number(bare)) <= 1 || !Number.isFinite(Number(bare))) continue;
      if (!promptNums.has(bare)) {
        rows.push([type, lesson, "ANSWER_NOT_IN_PROMPT", a, "answer is derived or shown only by the widget"]);
      }
    }
  }
}

process.stdout.write(rows.map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n") + "\n");
process.stderr.write(
  `\nengines scanned: ${engines}\nspecs sampled per engine: ${limitPer}\n` +
  `rows: ${rows.length - 1}\n` +
  `\nNOTE: this static pass finds where an answer is NOT in the prompt — i.e. the learner must\n` +
  `derive it. That is the population at risk. Whether the accessible text then STATES it can only\n` +
  `be settled by rendering, which the vitest gate does.\n`
);
