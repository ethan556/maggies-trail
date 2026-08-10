import fs from "fs"; import path from "path";
const byKind={};
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);
 if(e.isDirectory()){walk(p);continue;} if(!e.name.endsWith(".json")||e.name==="course.json")continue;
 let j;try{j=JSON.parse(fs.readFileSync(p,"utf8"))}catch{continue}
 for(const s of (j.steps||[])) if(s.widget){
   const k=s.kind||"?"; byKind[k]=byKind[k]||new Set(); byKind[k].add(s.widget.type);
 }}}
walk("content/courses");
for(const [k,v] of Object.entries(byKind)) console.log(k.padEnd(12), String(v.size).padStart(3), "distinct widget types");
