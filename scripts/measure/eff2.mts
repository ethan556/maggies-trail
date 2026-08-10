import fs from "fs"; import path from "path";
import { variantForStep } from "../../src/lib/variants";
let elig=0, refreshed=0, manip=0, declared=0;
const lost=new Map<string,number>();
function walk(d:string){ for(const e of fs.readdirSync(d,{withFileTypes:true})){ const p=path.join(d,e.name);
 if(e.isDirectory()){walk(p);continue;} if(!e.name.endsWith(".json"))continue;
 let j:any; try{j=JSON.parse(fs.readFileSync(p,"utf8"))}catch{continue}
 for(const s of (j.steps||[])){ if(!((s.kind==="check"||s.kind==="challenge")&&s.widget&&s.conceptTag))continue;
  elig++;
  const v=variantForStep(s,"probe");
  if(v){refreshed++; if(s.variant)declared++; if(s.widget.type!=="numeric")manip++;}
 }}}
walk("content/courses");
console.log(`practice-eligible ${elig} | REFRESHED ${refreshed} (${(100*refreshed/elig).toFixed(2)}%) | manipulative ${manip} | via item-level declaration ${declared}`);
