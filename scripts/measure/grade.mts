import fs from "fs"; import path from "path";
import { variantForStep } from "../../src/lib/variants";
const grade=new Map<string,number>();
for(const c of fs.readdirSync("content/courses",{withFileTypes:true})){ if(!c.isDirectory())continue;
 try{grade.set(c.name,JSON.parse(fs.readFileSync(path.join("content/courses",c.name,"course.json"),"utf8")).gradeLevel);}catch{} }
const g=new Map<number,[number,number]>();
function walk(d:string,c:string){ for(const e of fs.readdirSync(d,{withFileTypes:true})){ const p=path.join(d,e.name);
 if(e.isDirectory()){walk(p,c||e.name);continue;} if(!e.name.endsWith(".json"))continue;
 let j:any; try{j=JSON.parse(fs.readFileSync(p,"utf8"))}catch{continue}
 for(const s of (j.steps||[])){ if(!((s.kind==="check"||s.kind==="challenge")&&s.widget&&s.conceptTag))continue;
  const G=grade.get(c)??99; if(!g.has(G))g.set(G,[0,0]); g.get(G)![0]++;
  if(variantForStep(s,"probe"))g.get(G)![1]++; }}}
walk("content/courses","");
for(const k of [...g.keys()].sort((a,b)=>a-b)){const [t,c]=g.get(k)!;
 console.log(`G${String(k).padStart(2)}  ${String(c).padStart(3)}/${String(t).padStart(4)}  ${(100*c/t).toFixed(1).padStart(5)}%`);}
