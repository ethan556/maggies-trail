import fs from "fs"; import path from "path";
// Steps whose PROMPT contains a small comma-separated data set — the natural dot-plot candidates.
const LIST=/\b\d+(\s*,\s*\d+){3,}\b/;
let n=0; const byCourse={};
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);
 if(e.isDirectory()){walk(p);continue;} if(!e.name.endsWith(".json")||e.name==="course.json")continue;
 let j;try{j=JSON.parse(fs.readFileSync(p,"utf8"))}catch{continue}
 const c=p.split("/")[2];
 for(const s of (j.steps||[])){
  if(!((s.kind==="check"||s.kind==="challenge")&&s.widget))continue;
  if(s.variant) continue;
  const pr=s.widget.prompt||"";
  if(!LIST.test(pr)) continue;
  if(!["numeric","mcq"].includes(s.widget.type)) continue;
  n++; byCourse[c]=(byCourse[c]||0)+1;
 }}}
walk("content/courses");
console.log("unserved numeric/mcq steps whose prompt carries a DATA LIST:", n);
for(const [c,k] of Object.entries(byCourse).sort((a,b)=>b[1]-a[1]).slice(0,10)) console.log(String(k).padStart(3), c);
