import { variantForGenForm } from "../../src/lib/variants";
const w:any = variantForGenForm("combination-count","orderBucket","z0")!.widget;
console.log("labels:", w.items.map((i:any)=>i.label));
const PERMISH = ["gold","pin","chair","prize"];
for (const it of w.items) {
  const low = it.label.toLowerCase();
  console.log(` want=${it.bucketId}  route=${PERMISH.some(x=>low.includes(x))?"perm":"comb"}  :: ${it.label}`);
}
