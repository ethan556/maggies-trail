import { variantFor, variantForGenForm } from "../../src/lib/variants";
for (let i=0;i<10;i++){
  const v = variantFor("mvt-bound", `t${i}`);
  console.log(v!.answer, "|", (v!.widget as any).prompt);
}
