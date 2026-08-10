import fs from "fs"; import path from "path";
// Unserved numeric/mcq steps whose conceptTag suggests inherently VISUAL mathematics.
const PAT=/histogram|box.?plot|dot.?plot|scatter|stem|mean|median|mode|spread|iqr|quartile|distribution|angle|protractor|rotat|reflect|dilat|transform|symmetr|net|surface|volume|tape|bar.?model|ratio|proportion|tree|spinner|venn|sample.?space/i;
const hits={};
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);
 if(e.isDirectory()){walk(p);continue;} if(!e.name.endsWith(".json")||e.name==="course.json")continue;
 let j;try{j=JSON.parse(fs.readFileSync(p,"utf8"))}catch{continue}
 for(const s of (j.steps||[])){
  if(!((s.kind==="check"||s.kind==="challenge")&&s.widget&&s.conceptTag))continue;
  if(s.variant) continue;
  if(!["numeric","mcq"].includes(s.widget.type)) continue;
  if(!PAT.test(s.conceptTag)) continue;
  hits[s.conceptTag]=(hits[s.conceptTag]||0)+1;
 }}}
walk("content/courses");
const rows=Object.entries(hits).sort((a,b)=>b[1]-a[1]);
let tot=0; for(const [,c] of rows) tot+=c;
console.log("unserved numeric/mcq steps on VISUAL topics:", tot, "across", rows.length, "tags\n");
for(const [t,c] of rows.slice(0,26)) console.log(String(c).padStart(3), t);
