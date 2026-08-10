import fs from "fs"; import path from "path";
import { variantForStep } from "../../src/lib/variants";
const grade = new Map<string,number>();
for (const c of fs.readdirSync("content/courses",{withFileTypes:true})) {
  if(!c.isDirectory())continue;
  try{grade.set(c.name,JSON.parse(fs.readFileSync(path.join("content/courses",c.name,"course.json"),"utf8")).gradeLevel);}catch{}
}
type T = { unserved:number; served:number; tags:Map<string,number>; grades:Set<number> };
const byType = new Map<string,T>();
function walk(d:string,course:string){
  for(const e of fs.readdirSync(d,{withFileTypes:true})){
    const p=path.join(d,e.name);
    if(e.isDirectory()){walk(p,course||e.name);continue;}
    if(!e.name.endsWith(".json")||e.name==="course.json")continue;
    let j:any; try{j=JSON.parse(fs.readFileSync(p,"utf8"))}catch{continue}
    for(const s of j.steps??[]){
      if(!((s.kind==="check"||s.kind==="challenge")&&s.widget&&s.conceptTag))continue;
      const t=s.widget.type;
      if(!byType.has(t))byType.set(t,{unserved:0,served:0,tags:new Map(),grades:new Set()});
      const o=byType.get(t)!;
      o.grades.add(grade.get(course)??99);
      if(variantForStep(s,"probe"))o.served++;
      else {o.unserved++; o.tags.set(s.conceptTag,(o.tags.get(s.conceptTag)||0)+1);}
    }
  }
}
walk("content/courses","");
const rows=[...byType].filter(([t])=>t!=="numeric"&&t!=="mcq").sort((a,b)=>b[1].unserved-a[1].unserved);
console.log("MANIPULATIVE ENGINES BY UNSERVED STEPS\n");
for(const [t,o] of rows.slice(0,22)){
  const top=[...o.tags].sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>`${k}(${v})`).join(" ");
  console.log(`${String(o.unserved).padStart(3)}u ${String(o.served).padStart(3)}s  G[${[...o.grades].sort((a,b)=>a-b).join(",")}]`.padEnd(30), t.padEnd(20), top);
}
