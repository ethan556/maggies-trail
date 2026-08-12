/* Throwaway (CLAUDE.md rhythm step 5): print the wave-9 generated forms with every string. */
import { variantForStep } from "../../src/lib/variants";

const CASES: Array<{ gen: string; form: string; type: string }> = [
  { gen: "line-plot", form: "default", type: "mcq" },
  { gen: "line-plot", form: "totalCount", type: "numeric" },
  { gen: "line-plot", form: "halfMarks", type: "numeric" },
  { gen: "line-plot", form: "rangeSpan", type: "mcq" },
  { gen: "g4-measure", form: "mcLinePlotBuildNumeric", type: "numeric" }
];

for (const c of CASES) {
  console.log(`\n================ ${c.gen}@${c.form} ================`);
  for (let i = 0; i < 3; i++) {
    const v = variantForStep({ widget: { type: c.type }, variant: { gen: c.gen, form: c.form } }, `read:${c.form}:${i}`);
    if (!v) { console.log("DECLINED"); continue; }
    const w = v.widget as Record<string, unknown>;
    console.log(`\n--- seed ${i} ---`);
    console.log("PROMPT:", w.prompt);
    if (w.plotData) console.log("PLOT:", JSON.stringify(w.plotData));
    if (w.type === "numeric") {
      console.log("ANSWER:", w.answer);
      for (const t of (w.commonErrors ?? []) as Array<{ value: number; feedback: string }>)
        console.log(`  trap ${t.value}: ${t.feedback}`);
      console.log("  fallback:", w.fallbackFeedback);
    } else {
      for (const o of (w.options ?? []) as Array<{ label: string; correct?: boolean; feedback: string }>)
        console.log(`  ${o.correct ? "KEY " : "trap"} "${o.label}": ${o.feedback}`);
    }
  }
}
