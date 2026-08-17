/** S242 / GRB-04 — CLAUDE.md step 5: print the whole item and read it as a human would. */
import { variantForGenForm } from "../../src/lib/variants";
import type { Band } from "../../src/lib/difficulty";

for (const target of process.argv.slice(2)) {
  const [gen, form = "default"] = target.split("|");
  console.log(`\n══════ ${gen}|${form} ══════`);
  const seen = new Set<string>();
  let printed = 0;
  for (let i = 0; i < 60 && printed < 4; i++) {
    for (const band of ["support", "core", "stretch"] as Band[]) {
      if (printed >= 4) break;
      let v;
      try { v = variantForGenForm(gen, form, `${gen}|${form}|${band}|${i}`, band); } catch { continue; }
      const w = v?.widget as Record<string, unknown> | undefined;
      const prompt = String(w?.prompt ?? "");
      if (!prompt || seen.has(prompt)) continue;
      seen.add(prompt);
      printed++;
      console.log(`\n── ${band} ──`);
      console.log(`PROMPT   ${prompt}`);
      if (w?.answer !== undefined) console.log(`ANSWER   ${JSON.stringify(w.answer)}`);
      for (const key of ["traps", "options", "distractors"]) {
        const list = w?.[key] as Array<Record<string, unknown>> | undefined;
        if (!Array.isArray(list)) continue;
        for (const t of list) console.log(`  ${key.slice(0, 4).toUpperCase()}  ${JSON.stringify(t)}`);
      }
      for (const key of ["successFeedback", "fallbackFeedback", "feedback", "relationFeedback"]) {
        if (w?.[key] !== undefined) console.log(`${key.padEnd(8)} ${JSON.stringify(w[key])}`);
      }
    }
  }
}
