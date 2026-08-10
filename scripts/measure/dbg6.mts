import { variantForGenForm } from "../../src/lib/variants";
function route(p: string): string {
  const [prompt, labelsRaw] = p.split("||");
  const m = prompt.match(/\((-?\d+)x (−|\+) (\d+)\)\/\(x − (-?\d+)\)\. What happens at x = (-?\d+)/)!;
  const a = Number(m[1]), b = (m[2] === "−" ? -1 : 1) * Number(m[3]), k = Number(m[5]);
  const numeratorAtPole = a * k + b;
  console.log("  parsed a,b,k:", a, b, k, "numeratorAtPole:", numeratorAtPole);
  const wanted = numeratorAtPole !== 0 ? "A vertical asymptote — the bottom vanishes and the top does not." : "A hole.";
  for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
  throw new Error("no matching option");
}
for (let i=0;i<6;i++){
  const v = variantForGenForm("end-behavior","poleClassify",`z${i}`);
  const w:any = v.widget;
  const full = w.prompt + "||" + w.options.map((o:any)=>o.label).join(";;");
  console.log(w.prompt);
  console.log("  route says:", route(full));
}
