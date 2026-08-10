import { variantForGenForm } from "../../src/lib/variants";
for (const seed of [11, 42, 99, 123]) {
  const v = variantForGenForm("g7-tse-inequality-build", "graphBuild", seed, "core");
  const w = v.widget as Record<string, unknown>;
  console.log("== seed", seed);
  console.log("prompt:", w.prompt);
  console.log("start:", JSON.stringify(w.start));
  console.log("target:", JSON.stringify(w.target));
  console.log("success:", w.successFeedback);
  console.log("fallback:", w.fallbackFeedback);
}
