#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
const root=resolve(import.meta.dirname,"../..");
const records=[]; const errors=[];
for(const course of readdirSync(join(root,"content/courses")).sort()){
  const dir=join(root,"content/courses",course,"lessons"); if(!existsSync(dir)) continue;
  for(const file of readdirSync(dir).filter(x=>x.endsWith(".json")).sort()){
    const path=`content/courses/${course}/lessons/${file}`; const bytes=readFileSync(join(root,path));
    try{const lesson=JSON.parse(bytes);if(!lesson.id||!Array.isArray(lesson.steps)) errors.push(`${path}: missing id or steps`);records.push({path,id:lesson.id,sha256:createHash("sha256").update(bytes).digest("hex"),steps:lesson.steps?.length??0,remedials:lesson.remedials?.length??0});}
    catch(e){errors.push(`${path}: ${e.message}`)}
  }
}
const ids=new Set();for(const r of records){if(ids.has(r.id))errors.push(`duplicate lesson id ${r.id}`);ids.add(r.id)}
const report={session:148,lessons:records.length,uniqueLessonIds:ids.size,parseErrors:errors.length,errors,passed:records.length===1701&&ids.size===1701/*S203V: corpus 1694->1701*//*S203F: corpus 1691->1694*//*S203E: corpus 1685->1691*//*S203D: corpus 1679->1685*//*S203C: corpus 1673->1679*//*S203B: corpus 1667->1673*//*S199: corpus 1619->1640 (+21 G6-12 gap-patch lessons), then 1640->1667 (+27 G6-12 expansion lessons: absolute-value-piecewise 9, surface-area-solids-g7 6, binomial-theorem 6, expected-value 6)*/&&errors.length===0/*S197: corpus grew 1129->1539 across sessions 146-197 (legitimate new-course additions through k5-expansion Batch F, 116 courses); pin advanced to track truth, 0 parse/duplicate errors either count*/,corpusSha256:createHash("sha256").update(records.map(r=>`${r.path}:${r.sha256}`).join("\n")).digest("hex")};
writeFileSync(join(root,"CONTENT_JSON_S148.json"),JSON.stringify(report,null,2)+"\n");
writeFileSync(join(root,"CONTENT_JSON_S148.md"),`# Session 148 content JSON proof\n\n- Lessons parsed: ${report.lessons}\n- Unique lesson IDs: ${report.uniqueLessonIds}\n- Errors: ${errors.length}\n- Corpus hash: \`${report.corpusSha256}\`\n- Result: **${report.passed?"PASS":"FAIL"}**\n`);
if(!report.passed){errors.forEach(x=>console.error(x));process.exit(1)}
console.log(`content JSON S148 passed: ${records.length} lessons, ${ids.size} unique ids`);
