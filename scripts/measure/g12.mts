import fs from "fs"; import path from "path";
import { variantForStep } from "../../src/lib/variants";
const TARGET = Number(process.argv[2] ?? 12);
const grade = new Map<string,number>();
for (const c of fs.readdirSync("content/courses",{withFileTypes:true})) {
  if(!c.isDirectory())continue;
  try{grade.set(c.name,JSON.parse(fs.readFileSync(path.join("content/courses",c.name,"course.json"),"utf8")).gradeLevel);}catch{}
}
const tags = new Map<string,{u:number;types:Set<string>;lessons:Set<string>}>();
function walk(d:string,course:string){
  for(const e of fs.readdirSync(d,{withFileTypes:true})){
    const p=path.join(d,e.name);
    if(e.isDirectory()){walk(p,course||e.name);continue;}
    if(!e.name.endsWith(".json")||e.name==="course.json")continue;
    let j:any; try{j=JSON.parse(fs.readFileSync(p,"utf8"))}catch{continue}
    if((grade.get(course)??-1)!==TARGET)continue;
    for(const s of j.steps??[]){
      if(!((s.kind==="check"||s.kind==="challenge")&&s.widget&&s.conceptTag))continue;
      if(variantForStep(s,"probe"))continue;
      if(!tags.has(s.conceptTag))tags.set(s.conceptTag,{u:0,types:new Set(),lessons:new Set()});
      const o=tags.get(s.conceptTag)!; o.u++; o.types.add(s.widget.type); o.lessons.add(e.name);
    }
  }
}
walk("content/courses","");
const rows=[...tags].sort((a,b)=>b[1].u-a[1].u);
console.log(`G${TARGET} unserved tags: ${rows.length}, steps ${rows.reduce((a,r)=>a+r[1].u,0)}\n`);
for(const [t,o] of rows.slice(0,18))
  console.log(`${String(o.u).padStart(3)}u  ${[...o.types].join("/").padEnd(22)} ${t.padEnd(28)} ${[...o.lessons].slice(0,3).join(" ")}`);
