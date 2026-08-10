import { variantForGenForm } from "../../src/lib/variants";
function route(p: string): string {
  const [prompt, labelsRaw] = p.split("||");
  const m = prompt.match(/\((-?\d+)x (−|\+) (\d+)\)\/\(x − (-?\d+)\)\. What happens at x = (-?\d+)/)!;
  const a = Number(m[1]), b = (m[2] === "−" ? -1 : 1) * Number(m[3]), k = Number(m[5]);
  const numeratorAtPole = a * k + b;
  const wanted = numeratorAtPole !== 0 ? "A vertical asymptote — the bottom vanishes and the top does not." : "A hole.";
  for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
  return "NO MATCH";
}
for (let s=0;s<150;s++){
  const v = variantForGenForm("end-behavior","poleClassify",`form-${s}`);
  if (!v) continue;
  const w:any = v.widget;
  const full = w.prompt + "||" + w.options.map((o:any)=>o.label).join(";;");
  const r = route(full);
  const correctLabel = w.options.find((o:any)=>o.correct).label;
  if (r !== correctLabel) console.log("MISMATCH at", s, ":", w.prompt, "| route says:", r, "| actual correct:", correctLabel);
}
console.log("scan done");
