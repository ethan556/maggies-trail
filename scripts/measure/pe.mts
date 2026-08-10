import fs from "fs"; import path from "path";
import { variantForStep } from "../../src/lib/variants";
const t=new Map<string,number>();
function walk(d:string){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);
 if(e.isDirectory()){walk(p);continue;} if(!e.name.endsWith(".json"))continue;
 let j:any;try{j=JSON.parse(fs.readFileSync(p,"utf8"))}catch{continue}
 for(const s of (j.steps||[])){ if(!((s.kind==="check"||s.kind==="challenge")&&s.widget?.type==="pointEntry"&&s.conceptTag))continue;
  if(variantForStep(s,"probe"))continue; t.set(s.conceptTag,(t.get(s.conceptTag)||0)+1);}}}
walk("content/courses");
for(const [k,v] of [...t].sort((a,b)=>b[1]-a[1])) console.log(String(v).padStart(3), k);
