import fs from "fs"; import path from "path";
const want=new Set(process.argv.slice(2));
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);
 if(e.isDirectory()){walk(p);continue;} if(!e.name.endsWith(".json"))continue;
 let j;try{j=JSON.parse(fs.readFileSync(p,"utf8"))}catch{continue}
 for(const s of (j.steps||[])){ if(!((s.kind==="check"||s.kind==="challenge")&&s.widget&&want.has(s.conceptTag)))continue;
  const w=s.widget; if(w.type!=="numeric")continue;
  console.log(`\n[${s.conceptTag}] ${e.name}/${s.id}  "${(w.prompt||"").replace(/\s+/g," ")}"  => ${w.answer}`);
  for(const c of (w.commonErrors||[])) console.log(`    ${c.value}: ${c.feedback}`);
  if(w.successFeedback) console.log(`    ok: ${w.successFeedback}`);
 }}}
walk("content/courses");
