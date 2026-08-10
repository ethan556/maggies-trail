import fs from "fs"; import path from "path";
const want=new Set(process.argv.slice(2));
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);
 if(e.isDirectory()){walk(p);continue;} if(!e.name.endsWith(".json"))continue;
 let j;try{j=JSON.parse(fs.readFileSync(p,"utf8"))}catch{continue}
 for(const s of (j.steps||[])){ if(!((s.kind==="check"||s.kind==="challenge")&&s.widget&&want.has(s.conceptTag)))continue;
  const w=s.widget; if(w.type!=="pointEntry"&&w.type!=="plotPoint")continue;
  console.log(`\n[${s.conceptTag}] ${p.split("/").pop()}/${s.id} (${w.type})${s.variant?" SERVED":""}`);
  console.log(JSON.stringify(w,null,1));
 }}}
walk("content/courses");
