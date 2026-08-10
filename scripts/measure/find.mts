import { VARIANT_GENERATORS, variantFor, variantForGenForm } from "../../src/lib/variants";
const NOUNS=/\b1 (ones|tens|hundreds|tenths|hundredths|dots|coins|degrees|numbers|pieces|times|wholes)\b/;
const OTHER=/\b(the a|a the|an a)\b|  | [,.;:]/;
const seen=new Set<string>();
for (const g of VARIANT_GENERATORS) for (const form of ["default",...(g.forms??[])]) for (let i=0;i<60;i++){
  const v = form==="default"?variantFor(g.tag,`prose:${g.tag}:${form}:core:${i}`):variantForGenForm(g.tag,form,`prose:${g.tag}:${form}:core:${i}`);
  if(!v) continue;
  const walk=(n:any,k=""):string[]=>typeof n==="string"?(["id","type","form","correct","answer","sequence","targets"].includes(k)?[]:[n]):Array.isArray(n)?n.flatMap(x=>walk(x,k)):n&&typeof n==="object"?Object.entries(n).flatMap(([kk,vv])=>walk(vv,kk)):[];
  for(const s of walk(v.widget)){
    const m=s.match(NOUNS)??s.match(OTHER);
    if(m){const key=`${g.tag}|${m[0]}`; if(!seen.has(key)){seen.add(key);console.log(`${g.tag}@${form}  [${JSON.stringify(m[0])}]  ${s.slice(0,120)}`);}}
  }
}
