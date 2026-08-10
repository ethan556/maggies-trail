import fs from "fs"; import path from "path";
import { variantForStep } from "../../src/lib/variants";
function walk(d:string){ for(const e of fs.readdirSync(d,{withFileTypes:true})){ const p=path.join(d,e.name);
 if(e.isDirectory()){walk(p);continue;} if(!e.name.endsWith(".json"))continue;
 let j:any; try{j=JSON.parse(fs.readFileSync(p,"utf8"))}catch{continue}
 for(const s of (j.steps||[])){ if(!s.variant)continue;
  const v=variantForStep(s,"verify-seed");
  console.log(`\n${e.name}/${s.id}  [${s.conceptTag}]  ${s.variant.gen}${s.variant.form?"/"+s.variant.form:""}`);
  console.log(`  authored:  ${(s.widget.prompt||"").replace(/\s+/g," ").slice(0,76)}`);
  console.log(`  generated: ${v?((v.widget as any).prompt||"").replace(/\s+/g," ").slice(0,76):"** NULL **"}`);
 }}}
walk("content/courses");
