// THROWAWAY — S211. Print a handful of reflect-compose@composeMatrix items (correct target,
// every trap and fallback) so a human can read them before the variant key is declared on
// vec-05-03/k1. Not part of any gate; delete after the session if desired.
import { variantForGenForm } from "../../src/lib/variants";

for (const seed of ["print-a", "print-b", "print-c", "print-d"]) {
  const v = variantForGenForm("reflect-compose", "composeMatrix", seed)!;
  const w = v.widget as Extract<typeof v.widget, { type: "matrixTransform" }>;
  console.log(`\n=== seed ${seed} ===`);
  console.log("prompt:          ", w.prompt);
  console.log("target:          ", `[[${w.ta}, ${w.tb}], [${w.tc}, ${w.td}]]`, "->", w.targetName);
  console.log("start:           ", `[[${w.sa}, ${w.sb}], [${w.sc}, ${w.sd}]]`);
  console.log("successFeedback: ", w.successFeedback);
  console.log("swappedFeedback: ", w.swappedFeedback);
  console.log("signFeedback:    ", w.signFeedback);
  console.log("fallbackFeedback:", w.fallbackFeedback);
  console.log("answer (gen):    ", JSON.stringify(v.answer));
}
