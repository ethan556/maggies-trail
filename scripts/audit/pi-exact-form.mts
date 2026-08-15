#!/usr/bin/env npx tsx
/**
 * S242 / ARCH-02 — EXACT π BEATS ITS DECIMAL, UNLESS THE PROMPT ASKED FOR THE DECIMAL.
 *
 * THE RULING (user, S242): "It is better to leave questions/options/answers with pi than to give
 * exact answers (which are actually just approximations). Hence 9pi is better than 28.27, likewise
 * 10pi is better than 31.42."
 *
 * It is the right call and it is already half-written in the repository. CLAUDE.md rule 6 says round
 * once, at the end, and only to a convention the authored prompt states — so a graded answer of
 * 28.27 where the exact value is 9π asserts a precision the mathematics does not have and the
 * lesson never asked for. Worse, it is gradeable-wrong: a learner who answers 28.274 is correct and
 * may be marked incorrect by a tolerance that was set around the wrong number.
 *
 * WHAT THIS FINDS. Every authored and generated item whose ANSWER, OPTION or TRAP is a decimal that
 * approximates a clean multiple of π — integer, half, quarter or third — and whose prompt does NOT
 * ask for a decimal.
 *
 * WHAT IT DELIBERATELY DOES NOT FLAG, because these are the correct uses:
 *   · a prompt that states a convention — "(2 decimals)", "round to the nearest tenth", "use
 *     π ≈ 3.14" — is asking for the decimal, and giving it is compliance, not invention;
 *   · a string that shows BOTH — "9π ≈ 28.27" — which is how a good explanation reads;
 *   · a value that is not near a clean π multiple, because a decimal that is not standing in for an
 *     exact form is just a number.
 *
 * Usage: npx tsx scripts/audit/pi-exact-form.mts [--write]
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { execSync } from "node:child_process";
import { VARIANT_GENERATORS } from "../../src/lib/variants";
import { hashSeed, mulberry32 } from "../../src/lib/prng";
import type { Band } from "../../src/lib/difficulty";

const ROOT = process.cwd();
const WRITE = process.argv.includes("--write");
const seal = (() => {
  try { return execSync("git rev-parse --short HEAD", { cwd: ROOT }).toString().trim(); }
  catch { return "unsealed"; }
})();

/** The prompt states a rounding or approximation convention, so a decimal answer is what it wants. */
const ASKS_FOR_DECIMAL =
  /\bdecimal|\bround|nearest\b|\bapprox|≈|\bto \d+ ?(?:d\.?p\.?|places?)\b|\bestimate|\btenth|\bhundredth|use π/i;

/** Denominators worth recognising: a circle answer is a whole, half, quarter or third of π. */
const DENOMINATORS = [1, 2, 3, 4, 6];

/* THE CONTEXT FILTER, AND IT IS THE WHOLE ACCURACY OF THIS AUDIT.
 *
 * The first cut used denominators up to 12 and a 0.005 tolerance, and reported 58 hits of which most
 * were nonsense: a median of 5.5 "is" 7π/4 (5.4978), a probability of 0.52 "is" π/6 (0.5236), and
 * "Compute 12.5 + 3.47 = 15.97" "is" 61π/12. That is the birthday problem, not a finding — the
 * lattice of clean π multiples is dense enough that almost any two-decimal number sits within 0.005
 * of one, so proximity alone proves nothing.
 *
 * What makes 28.27 a stand-in for 9π and 5.5 merely five-and-a-half is the SUBJECT. A decimal is
 * only suspected of replacing an exact π form when the item is about circles: π itself, radius, arc,
 * sector, circumference, radian, or a trigonometric value. Everywhere else a decimal is just a
 * number, and this audit has nothing to say about it. */
const PI_CONTEXT = /π|\bpi\b|\bradi(?:us|i|an)|\barc\b|\bsector|\bcircumference|\bcircle|\bdiameter|\bchord|\barccos|\barcsin|\barctan|\bsin\b|\bcos\b|\btan\b|\bdegrees?\b/i;

/** If `value` is within tolerance of a clean multiple of π, name that multiple. */
function asPiMultiple(value: number): string | null {
  if (!Number.isFinite(value) || Math.abs(value) < 0.5) return null;
  const ratio = value / Math.PI;
  for (const den of DENOMINATORS) {
    const num = Math.round(ratio * den);
    if (num === 0) continue;
    const exact = (num / den) * Math.PI;
    // The decimal must be a ROUNDING of the exact value, so the gap has to be small in absolute
    // terms — a printed 28.27 sits 0.004 from 9π. A relative test would accept far too much.
    if (Math.abs(exact - value) > 0.005) continue;
    // And it must actually be a rounded PRINTED value, not a coincidence of a long decimal.
    // Proper mathematical form: a coefficient of 1 is not written. "π/2", never "1π/2"; "π", never "1π".
    const g = (a: number, b: number): number => (b ? g(b, a % b) : a);
    const d = g(Math.abs(num), den) || 1;
    const p = num / d, q = den / d;
    if (q === 1) return p === 1 ? "π" : `${p}π`;
    return p === 1 ? `π/${q}` : `${p}π/${q}`;
  }
  return null;
}

type Row = { source: string; owner: string; unit: string; field: string; value: string; exact: string; prompt: string; seed: string };
const rows: Row[] = [];

function consider(value: unknown, meta: Omit<Row, "value" | "exact">, prompt: string) {
  const n = typeof value === "number" ? value : typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value.trim()) ? Number(value) : NaN;
  if (!Number.isFinite(n)) return;
  // A printed integer is already exact; only a decimal can be standing in for π.
  if (Number.isInteger(n)) return;
  const exact = asPiMultiple(n);
  if (!exact) return;
  if (ASKS_FOR_DECIMAL.test(prompt)) return;
  if (!PI_CONTEXT.test(prompt)) return;
  rows.push({ ...meta, value: String(n), exact });
}

/** Option and choice labels that are a bare decimal, where the exact form would read better. */
function considerLabel(label: unknown, meta: Omit<Row, "value" | "exact">, prompt: string) {
  if (typeof label !== "string") return;
  const trimmed = label.trim().replace(/^[≈~]\s*/, "");
  if (!/^-?\d+\.\d+$/.test(trimmed)) return;
  consider(Number(trimmed), meta, prompt);
}

function scanWidget(widget: Record<string, any>, meta: Omit<Row, "value" | "exact" | "field">) {
  if (!widget || typeof widget !== "object") return;
  /* THE SECOND FILTER, added after reading the first ten authored hits: the ITEM must mention π
   * somewhere — prompt, feedback, anywhere. Circle vocabulary alone was not enough. "5.5 halves —
   * the theorem copies, full strength: 11" is a tangent-segment length on a circle question, and
   * 5.5 sits 0.002 from 7π/4 by coincidence; "21.21 is 15 ÷ cos 45°" is a hypotenuse. Neither item
   * involves π at all, so neither decimal can be standing in for it. An item that never writes π is
   * not withholding an exact π form. */
  const whole = JSON.stringify(widget);
  if (!whole.includes("π")) return;
  const prompt = [widget.prompt, widget.ask, widget.question].filter(Boolean).join(" ");
  consider(widget.answer, { ...meta, field: "widget.answer" }, prompt);
  for (const key of ["answerValue", "targetValue", "expected"]) consider(widget[key], { ...meta, field: `widget.${key}` }, prompt);
  for (const [i, o] of (widget.options ?? []).entries()) considerLabel(o?.label, { ...meta, field: `widget.options[${i}].label` }, prompt);
  for (const [i, c] of (widget.choices ?? []).entries()) considerLabel(c?.label, { ...meta, field: `widget.choices[${i}].label` }, prompt);
  for (const [i, e] of (widget.commonErrors ?? []).entries()) consider(e?.value, { ...meta, field: `widget.commonErrors[${i}].value` }, prompt);
}

/* ---- authored ---- */
function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.isFile() && e.name.endsWith(".json")) out.push(full);
  }
  return out;
}
for (const file of walk(join(ROOT, "content"))) {
  let json: Record<string, any>;
  try { json = JSON.parse(readFileSync(file, "utf8")); } catch { continue; }
  const lesson = json.lesson ?? json;
  for (const [i, step] of (lesson.steps ?? []).entries())
    scanWidget(step.widget, {
      source: "authored", owner: String(lesson.id ?? relative(ROOT, file).split(sep).join("/")),
      unit: String(step.id ?? i), prompt: String(step.widget?.prompt ?? "").slice(0, 120), seed: ""
    });
}

/* ---- generated ---- */
const BANDS: Band[] = ["support", "core", "stretch"];
for (const generator of VARIANT_GENERATORS) {
  const forms = generator.forms?.length ? [...generator.forms] : ["default"];
  for (const form of forms) {
    for (let i = 0; i < 9; i++) {
      const band = BANDS[i % BANDS.length];
      const seedText = `${generator.tag}|${form}|${band}|${i}`;
      try {
        const widget = generator.gen(mulberry32(hashSeed(seedText)), band, form as never).widget as Record<string, any>;
        scanWidget(widget, {
          source: "generated", owner: generator.tag, unit: String(form),
          prompt: String(widget.prompt ?? "").slice(0, 120), seed: seedText
        });
      } catch { /* declaration-only default */ }
    }
  }
}

/* ---- report ---- */
const seen = new Set<string>();
const unique = rows.filter((r) => {
  const key = `${r.source}|${r.owner}|${r.unit}|${r.field}|${r.exact}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});
const authored = unique.filter((r) => r.source === "authored");

console.log(`pi-exact-form @ ${seal}`);
console.log(`  decimals standing in for an exact π form: ${unique.length} (${authored.length} authored, ${unique.length - authored.length} generated)`);
for (const r of unique.slice(0, 20))
  console.log(`    ${r.source.padEnd(9)} ${r.owner}#${r.unit} ${r.field}: ${r.value} → ${r.exact}   "${r.prompt.slice(0, 60)}"`);
if (unique.length > 20) console.log(`    … ${unique.length - 20} more`);

if (WRITE) {
  const out = join(ROOT, "reports", "math-presentation");
  mkdirSync(out, { recursive: true });
  const csv = (c: string[]) => c.map((x) => (/[",\n]/.test(x) ? `"${x.replace(/"/g, '""')}"` : x)).join(",");
  writeFileSync(join(out, "MATH_PI_EXACT_FORM_INDEX.csv"), [
    `# sourceSeal=${seal} generatedBy=scripts/audit/pi-exact-form.mts`,
    "# S242 ruling: exact pi forms beat decimal approximations in questions, options and answers.",
    "# A row is a decimal within 0.005 of a clean multiple of pi (whole, half, quarter, third) whose",
    "# prompt does NOT state a rounding or approximation convention. Prompts that ask for decimals are",
    "# excluded: giving the decimal there is compliance, not invention.",
    csv(["source", "owner", "unit", "field", "printed", "exact", "prompt", "seed"]),
    ...unique.map((r) => csv([r.source, r.owner, r.unit, r.field, r.value, r.exact, r.prompt, r.seed]))
  ].join("\n") + "\n");
  console.log(`  wrote reports/math-presentation/MATH_PI_EXACT_FORM_INDEX.csv`);
}
