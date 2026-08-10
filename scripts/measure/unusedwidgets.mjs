import fs from "fs"; import path from "path";
const schema=fs.readFileSync("src/lib/schema.ts","utf8");
const declared=[...schema.matchAll(/type: z\.literal\("([a-zA-Z]+)"\)/g)].map(m=>m[1]);
const used=new Set();
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);
 if(e.isDirectory()){walk(p);continue;} if(!e.name.endsWith(".json")||e.name==="course.json")continue;
 let j;try{j=JSON.parse(fs.readFileSync(p,"utf8"))}catch{continue}
 for(const s of (j.steps||[])) if(s.widget) used.add(s.widget.type);
}}
walk("content/courses");
const uniq=[...new Set(declared)];
const unused=uniq.filter(t=>!used.has(t)).sort();
console.log(`declared: ${uniq.length}   used by content: ${used.size}   BUILT BUT UNUSED: ${unused.length}\n`);
const evalTs=fs.readFileSync("src/lib/evaluate.ts","utf8");
const comp=fs.readFileSync("src/components/widgets.tsx","utf8");
console.log("unused widget            evaluator  component");
for(const t of unused){
  console.log(t.padEnd(24), (evalTs.includes(`case "${t}"`)?"  yes    ":"  --     "), (comp.includes(t)?"   yes":"    --"));
}
