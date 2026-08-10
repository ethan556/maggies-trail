import { variantForGenForm } from "../../src/lib/variants";
for (let i=0;i<6;i++){
  const v = variantForGenForm("end-behavior","poleClassify",`z${i}`);
  const w:any = v.widget;
  console.log(w.prompt);
  for (const o of w.options) console.log(`  ${o.correct?"*":" "} ${o.label}`);
}
