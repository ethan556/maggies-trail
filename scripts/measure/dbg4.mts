import { variantFor } from "../../src/lib/variants";
function mvtBoundRoute(p: string): number {
  const m = p.match(/f\((-?\d+)\) = (-?\d+) and f′\(x\) ≤ (\d+) for all x\. What is the largest possible value of f\((-?\d+)\)/)!;
  const [x0, f0, bound, x1] = m.slice(1).map(Number);
  let acc = f0;
  for (let x = x0; x < x1; x++) acc += bound;
  return acc;
}
for (let i=0;i<400;i++){
  const v = variantFor("mvt-bound", `t${i}`);
  if (!v) continue;
  const w:any = v.widget;
  const r = mvtBoundRoute(w.prompt);
  if (r !== v.answer) { console.log("MISMATCH", v.answer, r, w.prompt); }
}
console.log("done");
