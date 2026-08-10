#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
const root=resolve(import.meta.dirname,"../..");
const lessonPath="content/courses/proportional-relationships/lessons/pr-04-02.json";
const lesson=JSON.parse(readFileSync(join(root,lessonPath),"utf8"));
const state=JSON.parse(readFileSync(join(root,"PRODUCT_STATE.json"),"utf8"));
const excellence=JSON.parse(readFileSync(join(root,"EXCELLENCE_BACKLOG_S126.json"),"utf8"));
const errors=[];
const steps=Object.fromEntries(lesson.steps.map(s=>[s.id,s]));
const expected={
 i1:{base:10,percent:25,direction:"markup",answer:12.5},
 k1:{base:50,percent:20,direction:"markup",answer:60},
 i2:{base:80,percent:5,direction:"markdown",answer:76},
 i3:{base:200,percent:15,direction:"markdown",answer:170},
 k2:{base:50,percent:10,direction:"markdown",answer:45},
 k3:{base:20,percent:50,direction:"markup",answer:30},
 ch1:{base:200,percent:8,direction:"markdown",answer:184}
};
const round=n=>Math.round(n*100)/100;
const rows=[];
for(const [id,e] of Object.entries(expected)){
 const w=steps[id]?.widget;
 if(!w){errors.push(`${id}: missing widget`);continue}
 if(w.type!=="percentChangeLab"){errors.push(`${id}: ${w.type} != percentChangeLab`);continue}
 const amount=round(w.base*w.percent/100);
 const target=round(w.direction==="markup"?w.base+amount:w.base-amount);
 if(w.base!==e.base||w.percent!==e.percent||w.direction!==e.direction)errors.push(`${id}: authored givens drifted`);
 if(target!==e.answer)errors.push(`${id}: derived ${target} != frozen ${e.answer}`);
 const correct=w.choices.filter(c=>Math.abs(c.value-target)<1e-9);
 if(correct.length!==1)errors.push(`${id}: ${correct.length} correct choices`);
 if(w.choices.length!==3)errors.push(`${id}: expected three exact claims`);
 if(new Set(w.choices.map(c=>c.id)).size!==3||new Set(w.choices.map(c=>c.value)).size!==3)errors.push(`${id}: duplicate claim`);
 const wrong=w.choices.filter(c=>Math.abs(c.value-target)>=1e-9);
 if(wrong.length!==2)errors.push(`${id}: ${wrong.length} wrong paths`);
 if(w.currency!=="$")errors.push(`${id}: currency marker drifted`);
 rows.push({id,base:w.base,percent:w.percent,direction:w.direction,changeAmount:amount,derivedAnswer:target,wrongPaths:wrong.length});
}
const source={
 schema:readFileSync(join(root,"src/lib/schema.ts"),"utf8"),
 eval:readFileSync(join(root,"src/lib/evaluate.ts"),"utf8"),
 pedagogy:readFileSync(join(root,"src/lib/pedagogy.ts"),"utf8"),
 renderer:readFileSync(join(root,"src/components/widgets.tsx"),"utf8"),
 narration:readFileSync(join(root,"src/lib/describeState.ts"),"utf8"),
 width:readFileSync(join(root,"src/components/stageWidth.ts"),"utf8"),
 samples:readFileSync(join(root,"src/components/widgetSamples.ts"),"utf8")
};
for(const [surface,text] of Object.entries(source)){const needle=surface==="width"?'percentChangeLab: "wide"':"percentChangeLab";if(!text.includes(needle))errors.push(`percentChangeLab: missing ${surface}`)}
if(!source.renderer.includes('control: "final-price-claim"')||!source.renderer.includes('dir: percentChangeChoiceCorrect(spec, choice) ? "toward" : "away"'))errors.push("process events are not wired to exact truth");
if(!source.renderer.includes('min-h-11')||!source.renderer.includes('pcl-ghost')||!source.renderer.includes('border-dashed'))errors.push("renderer lost target size, reveal ghost, or non-colour pattern");
const caps=JSON.parse(readFileSync(join(root,"scripts/engine-capabilities.json"),"utf8")).types.percentChangeLab;
if(!caps)errors.push("missing capability row");
if(caps?.adapt!==3)errors.push("adapt=3 claimed without expected process wiring");
if((state.flagshipTiers?.B??0)<216||(state.flagshipTiers?.D??999)>24)errors.push(`tier non-regression failed ${JSON.stringify(state.flagshipTiers)}`);
if((excellence.summary?.liveK8Backlog??999)>49)errors.push("live queue regressed above 49");
if((excellence.records??[]).some(r=>r.lessonId==="pr-04-02"))errors.push("completed lesson remains in live queue");
if(errors.length){console.error(`percent-change-s138 failed (${errors.length})`);for(const e of errors)console.error(`- ${e}`);process.exit(1)}
const report={session:138,baselineSession:137,lessonId:lesson.id,sourcePath:lessonPath,experiences:rows,registeredEngine:"percentChangeLab",tierCounts:state.flagshipTiers,liveK8Backlog:excellence.summary.liveK8Backlog,lessonSha256:createHash("sha256").update(readFileSync(join(root,lessonPath))).digest("hex")};
writeFileSync(join(root,"PERCENT_CHANGE_S138.json"),JSON.stringify(report,null,2)+"\n");
const table=rows.map(r=>`| ${r.id} | ${r.direction} | ${r.base} | ${r.percent}% | ${r.changeAmount} | ${r.derivedAnswer} | ${r.wrongPaths} |`).join("\n");
writeFileSync(join(root,"PERCENT_CHANGE_S138.md"),`# Session 138 — Percent-change price laboratory\n\nThe given percent is not an adjustable target. The engine keeps the base price, exact change amount, add/subtract direction, and selected final-price claim visible together. This is why a percentBar slider was rejected as a false fit.\n\n| step | direction | base | percent | derived change | derived final price | wrong paths |\n|---|---|---:|---:|---:|---:|---:|\n${table}\n\n- Exact-fit experiences: **${rows.length}/7**\n- Live reviewed K–8 queue: **${report.liveK8Backlog}**\n- Tier counts: **A ${report.tierCounts.A} · B ${report.tierCounts.B} · C ${report.tierCounts.C} · D ${report.tierCounts.D}**\n`,"utf8");
console.log(`percent-change-s138: ${rows.length}/7 experiences; queue ${report.liveK8Backlog}`);
