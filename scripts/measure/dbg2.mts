import { variantForGenForm } from "../../src/lib/variants";
for (let i=0;i<6;i++){
  const v = variantForGenForm("vec-displacement","equalVector",`s${i}`);
  const w:any = v!.widget;
  console.log(w.prompt, "||", w.options.map((o:any)=>o.label).join(";;"));
}
