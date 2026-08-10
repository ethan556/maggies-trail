import fs from "fs"; import path from "path";
const total={}, unserved={};
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);
 if(e.isDirectory()){walk(p);continue;} if(!e.name.endsWith(".json")||e.name==="course.json")continue;
 let j;try{j=JSON.parse(fs.readFileSync(p,"utf8"))}catch{continue}
 for(const s of (j.steps||[])){
  if(!((s.kind==="check"||s.kind==="challenge")&&s.widget))continue;
  const t=s.widget.type;
  total[t]=(total[t]||0)+1;
  if(!s.variant) unserved[t]=(unserved[t]||0)+1;
 }}}
walk("content/courses");
const rows=Object.keys(total).map(t=>[t,total[t],unserved[t]||0]).sort((a,b)=>b[1]-a[1]);
console.log("TYPE".padEnd(22),"TOTAL","UNSERVED");
for(const [t,a,u] of rows) console.log(t.padEnd(22), String(a).padStart(5), String(u).padStart(8));
console.log("\ndistinct widget types in use:", rows.length);
