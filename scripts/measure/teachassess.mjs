import fs from "fs"; import path from "path";
const PLAIN=new Set(["numeric","mcq"]);
const c={interactive:{plain:0,manip:0},check:{plain:0,manip:0},challenge:{plain:0,manip:0}};
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);
 if(e.isDirectory()){walk(p);continue;} if(!e.name.endsWith(".json")||e.name==="course.json")continue;
 let j;try{j=JSON.parse(fs.readFileSync(p,"utf8"))}catch{continue}
 for(const s of (j.steps||[])){ if(!s.widget||!c[s.kind])continue;
  c[s.kind][PLAIN.has(s.widget.type)?"plain":"manip"]++; }}}
walk("content/courses");
for(const [k,v] of Object.entries(c)){
  const tot=v.plain+v.manip;
  console.log(k.padEnd(12), `manipulative ${String(v.manip).padStart(4)} / ${String(tot).padStart(4)}`,
    `= ${(100*v.manip/tot).toFixed(0)}%`.padStart(7));
}
