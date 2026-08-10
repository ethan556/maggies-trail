// Completeness check that reads the LESSON FILES, not a truncated survey.
// Session 46 wrongly declared mult-* complete because `g12.mts | grep mult-` returned nothing —
// the tags were below that tool's print cutoff. Never conclude "family complete" from a summary.
import fs from "fs"; import path from "path";
const prefix = process.argv[2] ?? "";
const rows = [];
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);
  if(e.isDirectory()){walk(p);continue;}
  if(!e.name.endsWith(".json")||e.name==="course.json")continue;
  if(prefix && !e.name.startsWith(prefix))continue;
  let j;try{j=JSON.parse(fs.readFileSync(p,"utf8"))}catch{continue}
  const steps=(j.steps||[]).filter(s=>s.kind==="check"||s.kind==="challenge");
  const miss=steps.filter(s=>!s.variant);
  if(miss.length) rows.push({file:e.name, missing:miss.length, total:steps.length,
    tags:[...new Set(miss.map(s=>s.conceptTag).filter(Boolean))].join(","),
    types:[...new Set(miss.map(s=>s.widget?.type).filter(Boolean))].join("/")});
}}
walk("content/courses");
rows.sort((a,b)=>b.missing-a.missing);
let tot=0; for(const r of rows) tot+=r.missing;
console.log(`${rows.length} files with unserved steps, ${tot} steps total\n`);
for(const r of rows) console.log(String(r.missing).padStart(2), "/", String(r.total).padStart(2), " ", r.file.padEnd(18), r.types.padEnd(28), r.tags);
