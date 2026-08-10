import { variantFor } from "../../src/lib/variants";
const v = variantFor("multiplication-rule","q0")!;
const w:any = v.widget;
console.log(JSON.stringify(w.prompt));
console.log("correct:", JSON.stringify(w.options.find((o:any)=>o.correct).label));
const m = w.prompt.match(/P\(bus\) = ([\d.]+).+?P\(sport \| bus\) = ([\d.]+)/);
console.log("regex match:", m && m.slice(1));
