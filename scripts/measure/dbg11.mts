import { variantForGenForm } from "../../src/lib/variants";
const w:any = variantForGenForm("scatter-features","sortFeatures","form-0")!.widget;
for (const it of w.items) {
  const l = it.label;
  const single = /\bone\b|\bsingle\b|lone|isolated/.test(l);
  const group = /group|bunched|several|knot/.test(l);
  console.log(`want=${it.bucketId}  route=${single?"out":group?"clu":"form"}  :: ${l}`);
}
