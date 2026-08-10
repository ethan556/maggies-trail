import fs from "fs"; import path from "path";
const byCourse={};
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);
 if(e.isDirectory()){walk(p);continue;} if(!e.name.endsWith(".json")||e.name==="course.json")continue;
 let j;try{j=JSON.parse(fs.readFileSync(p,"utf8"))}catch{continue}
 const course=p.split("/")[2];
 for(const s of (j.steps||[])){
  if(!((s.kind==="check"||s.kind==="challenge")&&s.widget&&s.conceptTag))continue;
  if(/dot.?plot|histogram|distribution|mean|median|mode|iqr|quartile|spread|box|stem|scatter|sample|survey|data/i.test(s.conceptTag)){
    byCourse[course]=byCourse[course]||{n:0,unserved:0,types:{}};
    byCourse[course].n++;
    if(!s.variant) byCourse[course].unserved++;
    byCourse[course].types[s.widget.type]=(byCourse[course].types[s.widget.type]||0)+1;
  }
 }}}
walk("content/courses");
for(const [c,v] of Object.entries(byCourse).sort((a,b)=>b[1].unserved-a[1].unserved))
  console.log(String(v.unserved).padStart(3),"unserved /",String(v.n).padStart(3),"  ",c.padEnd(30),JSON.stringify(v.types));
