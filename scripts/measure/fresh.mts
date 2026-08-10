import { variantForGenForm, variantFor } from "../../src/lib/variants";
for (const [g,f] of [["back-substitute","default"],["back-substitute","given"],["point-transform","rotate"]] as const) {
  const xs = new Set<string>(), whole = new Set<string>();
  for (let i=0;i<40;i++){
    const v:any = f==="default" ? variantFor(g,`f${i}`) : variantForGenForm(g,f,`f${i}`);
    xs.add(String(v.answer[0])); whole.add(JSON.stringify(v.widget));
  }
  console.log(`${g}@${f}: ${whole.size} distinct widgets / 40 seeds, first-slot values seen: ${[...xs].sort((a,b)=>+a-+b).join(",")}`);
}
