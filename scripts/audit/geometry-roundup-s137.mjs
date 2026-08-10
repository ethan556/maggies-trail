#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
const root=resolve(import.meta.dirname,"../..");
const lessonPath="content/courses/geometry-g7/lessons/g7-04-03.json";
const lesson=JSON.parse(readFileSync(join(root,lessonPath),"utf8"));
const state=JSON.parse(readFileSync(join(root,"PRODUCT_STATE.json"),"utf8"));
const excellence=JSON.parse(readFileSync(join(root,"EXCELLENCE_BACKLOG_S126.json"),"utf8"));
const errors=[];
const steps=Object.fromEntries(lesson.steps.map(s=>[s.id,s]));
const expected={i1:["scaledCircleLab",6],k1:["scaledCircleLab",12],i2:["scaledCircleLab",36],k2:["angleMeasure",60],k3:["triangleClosureLab","a"],ch1:["scaledCircleLab",16]};
const rows=[];
function scaledTarget(w){return w.ask==="realRadius"?w.realRadius:w.ask==="circumferenceCoef"?2*w.realRadius:w.realRadius*w.realRadius}
function forms(w){const [a,b,c]=[...w.sides].sort((x,y)=>x-y);return a+b>c}
for(const [id,[type,answer]] of Object.entries(expected)){
 const w=steps[id]?.widget;if(!w){errors.push(`${id}: missing widget`);continue}if(w.type!==type)errors.push(`${id}: ${w.type} != ${type}`);
 let derived=null, correct=null, wrong=0;
 if(w.type==="scaledCircleLab"){derived=scaledTarget(w);correct=w.choices.filter(c=>Math.abs(c.value-derived)<1e-9);wrong=w.choices.length-correct.length;if(w.drawingRadius!==undefined&&Math.abs(w.drawingRadius*w.scale-w.realRadius)>1e-9)errors.push(`${id}: broken scale chain`)}
 if(w.type==="angleMeasure"){derived=w.targetAngle;correct=[{id:"angle"}];wrong=(w.commonAngles??[]).length;if(!w.linearPair||(1+w.linearPair.multiplier)*w.targetAngle!==w.linearPair.total)errors.push(`${id}: broken linear-pair truth`)}
 if(w.type==="triangleClosureLab"){derived=w.choices.find(c=>c.verdict===(forms(w)?"forms":"does-not-form"))?.id;correct=w.choices.filter(c=>c.verdict===(forms(w)?"forms":"does-not-form"));wrong=w.choices.length-correct.length;if(w.requiredMoves<2)errors.push(`${id}: exploration requirement weakened`)}
 if(derived!==answer)errors.push(`${id}: derived ${derived} != frozen ${answer}`);if(correct?.length!==1)errors.push(`${id}: ${correct?.length} correct choices`);if(wrong<2)errors.push(`${id}: only ${wrong} wrong paths`);
 rows.push({id,type:w.type,derivedAnswer:derived,wrongPaths:wrong,variant:steps[id].variant??null});
}
if(steps.k2.variant?.form!=="linearPairLab")errors.push("k2: seeded form is not linearPairLab");
if(steps.k3.variant?.form!=="frameCheck")errors.push("k3: seeded frameCheck declaration changed");
const source={schema:readFileSync(join(root,"src/lib/schema.ts"),"utf8"),eval:readFileSync(join(root,"src/lib/evaluate.ts"),"utf8"),pedagogy:readFileSync(join(root,"src/lib/pedagogy.ts"),"utf8"),renderer:readFileSync(join(root,"src/components/widgets.tsx"),"utf8"),narration:readFileSync(join(root,"src/lib/describeState.ts"),"utf8"),width:readFileSync(join(root,"src/components/stageWidth.ts"),"utf8"),samples:readFileSync(join(root,"src/components/widgetSamples.ts"),"utf8")};
for(const type of ["scaledCircleLab","triangleClosureLab"]){for(const [surface,text] of Object.entries(source)){const needle=surface==="width"?`${type}: \"wide\"`:type;if(!text.includes(needle))errors.push(`${type}: missing ${surface}`)}}
const caps=JSON.parse(readFileSync(join(root,"scripts/engine-capabilities.json"),"utf8")).types;
for(const type of ["scaledCircleLab","triangleClosureLab"]){if(!caps[type])errors.push(`${type}: missing capabilities`);if(caps[type]?.adapt!==3)errors.push(`${type}: adapt claim not 3`)}
if((state.flagshipTiers?.B??0)<215||(state.flagshipTiers?.D??999)>25)errors.push(`tier non-regression failed ${JSON.stringify(state.flagshipTiers)}`);
if((excellence.summary?.liveK8Backlog??999)>50)errors.push("live queue regressed above 50");
if((excellence.records??[]).some(r=>r.lessonId==="g7-04-03"))errors.push("completed lesson remains in live queue");
if(errors.length){console.error(`geometry-roundup-s137 failed (${errors.length})`);for(const e of errors)console.error(`- ${e}`);process.exit(1)}
const report={session:137,baselineSession:136,lessonId:lesson.id,sourcePath:lessonPath,experiences:rows,registeredEngines:["scaledCircleLab","triangleClosureLab"],tierCounts:state.flagshipTiers,liveK8Backlog:excellence.summary.liveK8Backlog,lessonSha256:createHash("sha256").update(readFileSync(join(root,lessonPath))).digest("hex")};
writeFileSync(join(root,"GEOMETRY_ROUNDUP_S137.json"),JSON.stringify(report,null,2)+"\n");
const table=rows.map(r=>`| ${r.id} | ${r.type} | ${r.derivedAnswer} | ${r.wrongPaths} | ${r.variant?`${r.variant.gen}/${r.variant.form??"default"}`:"fixed"} |`).join("\n");
writeFileSync(join(root,"GEOMETRY_ROUNDUP_S137.md"),`# Session 137 — Geometry roundup causal conversion\n\nThe six graded claims remain separate but now share visible causal evidence: scale-to-radius-to-circle-formula, a linear-pair equation, and strict triangle closure. No monolithic roundup widget was introduced.\n\n| step | surface | independently derived answer | wrong paths | variant |\n|---|---|---:|---:|---|\n${table}\n\n- Registered engines added: **2**\n- Exact-fit experiences: **${rows.length}/6**\n- Live reviewed K–8 queue: **${report.liveK8Backlog}**\n- Tier counts: **A ${report.tierCounts.A} · B ${report.tierCounts.B} · C ${report.tierCounts.C} · D ${report.tierCounts.D}**\n`,"utf8");
console.log(`geometry-roundup-s137: ${rows.length}/6 experiences; 2 engines; queue ${report.liveK8Backlog}`);
