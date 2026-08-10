import { variantForGenForm } from "../../src/lib/variants";
const v = variantForGenForm("opt-box","uselessRoot","z0")!;
const w:any = v.widget;
console.log("PROMPT:", w.prompt);
for (const o of w.options) console.log(o.correct?"* ":"  ", JSON.stringify(o.label));
