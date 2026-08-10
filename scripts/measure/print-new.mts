import { variantForGenForm, variantFor } from "../../src/lib/variants";
const SETS: Array<[string,string]> = [
 ["mult-meaning","default"],["mult-meaning","whichOperation"],["mult-meaning","sheetsMinus"],
 ["times-2","default"],["times-2","doubleIt"],["times-2","twiceDaily"],["times-2","ferryDouble"],
 ["double-double","default"],["double-double","timesEight"],["double-double","whichFact"],["double-double","spiderLegs"],
];
for (const [g,f] of SETS) {
  console.log(`\n== ${g} @ ${f}`);
  for (let i=0;i<2;i++){
    const v = f==="default" ? variantFor(g, `y${i}`) : variantForGenForm(g, f, `y${i}`);
    const w:any = v!.widget;
    console.log(`[${i}] ${w.prompt.slice(0,104)}`);
    if (w.type==="mcq") { const c=w.options.find((o:any)=>o.correct); console.log(`   * ${c.label.slice(0,46)}  |  ${c.feedback.slice(0,44)}`); }
    else { console.log(`   ANS ${v!.answer}   fb: ${w.fallbackFeedback.slice(0,60)}`); }
  }
}
