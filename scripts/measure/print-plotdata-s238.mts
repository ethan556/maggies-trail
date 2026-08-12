// Throwaway (CLAUDE.md rhythm step 5): print the S238 plotData family — authored and generated —
// with every option, trap and feedback string, to be READ as a human.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { WidgetSpec, plotDataParts, type TWidget } from "../../src/lib/schema";
import { describeWidgetState } from "../../src/lib/describeState";
import { variantForStep } from "../../src/lib/variants";

const rows: Array<[string, string, string]> = [
  ["volume-measurement/lessons/vm-02-01.json", "k1", ""], ["volume-measurement/lessons/vm-02-01.json", "k2", ""],
  ["volume-measurement/lessons/vm-02-01.json", "ch1", ""], ["volume-measurement/lessons/vm-02-01.json", "rem-rl-k", "rem"],
  ["data-line-plots-g2/lessons/g2g-01-05.json", "k1", ""], ["data-line-plots-g2/lessons/g2g-01-05.json", "k3", ""],
  ["data-line-plots-g2/lessons/g2g-01-05.json", "rem-g2g-mode-k", "rem"], ["data-line-plots-g2/lessons/g2g-03-03.json", "k3", ""],
  ["volume-measurement/lessons/vm-02-02.json", "i2", ""], ["volume-measurement/lessons/vm-02-02.json", "rem-lo-k", "rem"],
];
const draw = (p: NonNullable<ReturnType<typeof plotDataParts>>) => {
  const tall = Math.max(...p.counts);
  const lines: string[] = [];
  for (let h = tall; h >= 1; h--) lines.push(p.counts.map((c) => (c >= h ? " ✗ " : "   ")).join(""));
  lines.push(p.labels.map((l) => l.padStart(2).padEnd(3)).join(""));
  return lines.join("\n");
};
for (const [file, id, kind] of rows) {
  const lesson = JSON.parse(readFileSync(join(process.cwd(), "content/courses", file), "utf8"));
  let w: Record<string, unknown> | undefined;
  if (kind === "rem") for (const r of lesson.remedials ?? []) { for (const k of ["check", "concept"]) if (r[k]?.id === id) w = r[k].widget; }
  else w = lesson.steps.find((s: { id: string }) => s.id === id)?.widget;
  const spec = WidgetSpec.parse(w) as TWidget;
  const parts = plotDataParts(spec as { plotData?: never })!;
  console.log(`\n======== ${file.split("/")[0]} / ${id} [${spec.type}]`);
  console.log("PROMPT:", (spec as { prompt: string }).prompt);
  console.log(draw(parts));
  console.log("SPOKEN:", describeWidgetState(spec, null));
  if (spec.type === "mcq") for (const o of spec.options) console.log(`  ${o.correct ? "KEY " : "trap"} "${o.label}" -> ${o.feedback}`);
}
console.log("\n\n############ GENERATED (3 seeds per changed form) ############");
for (const form of ["fractionMode", "fractionTotal", "atOrAbove"]) {
  for (let i = 0; i < 3; i++) {
    const v = variantForStep({ widget: { type: form === "fractionMode" ? "mcq" : "numeric" }, variant: { gen: "line-plot", form } }, `read:${form}:${i}`)!;
    const w = WidgetSpec.parse(v.widget) as TWidget;
    const parts = plotDataParts(w as { plotData?: never })!;
    console.log(`\n-------- ${form} seed ${i}`);
    console.log("PROMPT:", (w as { prompt: string }).prompt);
    console.log(draw(parts));
    console.log("SPOKEN:", describeWidgetState(w, null));
    if (w.type === "mcq") for (const o of w.options) console.log(`  ${o.correct ? "KEY " : "trap"} "${o.label}" -> ${o.feedback}`);
    else {
      const n = w as Extract<TWidget, { type: "numeric" }>;
      console.log("ANSWER:", n.answer);
      for (const t of n.commonErrors) console.log(`  trap ${t.value} -> ${t.feedback}`);
      console.log("  success ->", n.successFeedback);
    }
  }
}
