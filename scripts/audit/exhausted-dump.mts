/**
 * S242 / GRB-04 — PRINT EVERY DISTINCT PROBLEM A THIN PAIR CAN PRODUCE, WITH ITS ANSWER.
 *
 * CLAUDE.md's working rhythm, step 2: read every authored item before writing anything, and step 5:
 * print the generated output and read it. A pool size in a CSV says how many prompts exist. It does
 * not say whether they are different PROBLEMS, and that is the only question that decides whether
 * widening a pair is a repair or an anti-pattern.
 *
 * Run: npx tsx scripts/audit/exhausted-dump.mts <generator>[|form] …
 */
import { variantForGenForm } from "../../src/lib/variants";
import type { Band } from "../../src/lib/difficulty";

const BANDS: Band[] = ["support", "core", "stretch"];
const targets = process.argv.slice(2);
if (!targets.length) {
  console.error("usage: npx tsx scripts/audit/exhausted-dump.mts <generator>[|form] …");
  process.exit(1);
}

for (const target of targets) {
  const [generator, form = "default"] = target.split("|");
  const seen = new Map<string, { answer: string; band: string }>();
  for (let i = 0; i < 120; i++) {
    for (const band of BANDS) {
      let v;
      try {
        v = variantForGenForm(generator, form, `${generator}|${form}|${band}|${i}`, band);
      } catch {
        continue;
      }
      const w = v?.widget as { prompt?: string; answer?: unknown; options?: Array<{ label?: string; correct?: boolean }> } | undefined;
      if (!w?.prompt || seen.has(w.prompt)) continue;
      const answer =
        w.answer !== undefined
          ? String(w.answer)
          : (w.options ?? []).filter((o) => o.correct).map((o) => o.label).join(" / ") || "?";
      seen.set(w.prompt, { answer, band });
    }
  }
  console.log(`\n══ ${generator}|${form} — ${seen.size} distinct prompts ══`);
  const answers = new Set<string>();
  for (const [prompt, { answer }] of seen) {
    answers.add(answer);
    console.log(`  [${answer}]  ${prompt}`);
  }
  console.log(`  → ${seen.size} prompts, ${answers.size} DISTINCT ANSWERS`);
}
