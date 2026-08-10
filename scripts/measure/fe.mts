import fs from "fs"; import path from "path";
import { variantForStep } from "../../src/lib/variants";
function walk(d:string){
  for(const e of fs.readdirSync(d,{withFileTypes:true})){
    const p=path.join(d,e.name);
    if(e.isDirectory()){walk(p);continue;}
    if(!e.name.endsWith(".json")||e.name==="course.json")continue;
    let j:any; try{j=JSON.parse(fs.readFileSync(p,"utf8"))}catch{continue}
    for(const s of j.steps??[]){
      if(!((s.kind==="check"||s.kind==="challenge")&&s.widget?.type==="fractionEntry"&&s.conceptTag))continue;
      if(variantForStep(s,"probe"))continue;
      console.log(`${s.conceptTag}\t${p}\t${s.id}`);
    }
  }
}
walk("content/courses");
