#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
const root=resolve(import.meta.dirname,"../..");
const baseline=JSON.parse(readFileSync(join(root,"SESSION137_LESSON_HASHES.json"),"utf8"));
const ledger=JSON.parse(readFileSync(join(root,"SESSION138_CONTENT_CHANGE_LEDGER.json"),"utf8"));
const sha=v=>createHash("sha256").update(v).digest("hex");
const canonical=v=>Array.isArray(v)?`[${v.map(canonical).join(",")}]`:v&&typeof v==="object"?`{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${canonical(v[k])}`).join(",")}}`:JSON.stringify(v);
const H=v=>sha(canonical(v));
const errors=[];
if(ledger.session!==138||ledger.baselineSession!==137)errors.push("ledger session/baseline mismatch");
if(ledger.authoredFilesChanged!==1||ledger.widgetNodesChanged!==7||ledger.variantDeclarationsChanged!==0)errors.push("ledger count mismatch");
const record=ledger.lessons[0],target=record.sourcePath;
const files=[];const courses=join(root,"content/courses");
for(const course of readdirSync(courses)){const dir=join(courses,course,"lessons");if(!existsSync(dir))continue;for(const file of readdirSync(dir).filter(n=>n.endsWith(".json")))files.push(`content/courses/${course}/lessons/${file}`)}
files.sort();
if(files.length!==baseline.count)errors.push(`lesson count ${files.length} != ${baseline.count}`);
for(const path of files){const bytes=readFileSync(join(root,path));if(path!==target){if(sha(bytes)!==baseline.files[path])errors.push(`${path}: changed outside S138 ledger`);continue;}if(baseline.files[path]!==record.beforeSha256)errors.push("target before hash does not match S137 seal");if(sha(bytes)!==record.afterSha256)errors.push("target after hash does not match current bytes");}
const doc=JSON.parse(readFileSync(join(root,target),"utf8"));
const top=Object.fromEntries(Object.entries(doc).filter(([k])=>k!=="steps"));
if(H(top)!==record.frozenSurfaceProof.topLevel.after||record.frozenSurfaceProof.topLevel.before!==record.frozenSurfaceProof.topLevel.after)errors.push("top-level authored fields changed");
if(H(doc.steps.map(s=>s.id))!==record.frozenSurfaceProof.stepOrder.after||record.frozenSurfaceProof.stepOrder.before!==record.frozenSurfaceProof.stepOrder.after)errors.push("step order changed");
const changedWidgets=new Set(record.changes.filter(c=>/\/widget$/.test(c.path)).map(c=>c.path.split("/")[1]));
const targetValue=w=>{const amount=Math.round(w.base*w.percent)/100;return Math.round((w.direction==="markup"?w.base+amount:w.base-amount)*100)/100};
for(const step of doc.steps){const proof=record.frozenSurfaceProof.steps[step.id];if(!proof){errors.push(`${step.id}: missing step proof`);continue;}const copy=structuredClone(step);if(changedWidgets.has(step.id))delete copy.widget;if(H(copy)!==proof.after||proof.before!==proof.after)errors.push(`${step.id}: frozen step surface changed`);if(changedWidgets.has(step.id)){const w=step.widget;const ap=record.answerProof[step.id];if(targetValue(w)!==ap.after||ap.before!==ap.after)errors.push(`${step.id}: answer changed`);const fp=record.misconceptionFeedbackProof[step.id];const after=w.choices.filter(c=>c.id!=="correct").map(c=>c.feedback);if(canonical(after)!==canonical(fp.after)||canonical(fp.before)!==canonical(fp.after))errors.push(`${step.id}: misconception feedback changed`);}}
if(errors.length){console.error(`Session 138 content proof failed (${errors.length})`);for(const e of errors)console.error(`- ${e}`);process.exit(1)}
console.log(`Session 138 content proof passed: ${files.length} lessons; 1 file / 7 widget nodes / 0 variant declarations changed; all other authored surfaces preserved`);
