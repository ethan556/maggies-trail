#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
const root=resolve(import.meta.dirname,"../..");
const baseline=JSON.parse(readFileSync(join(root,"SESSION138_LESSON_HASHES.json"),"utf8"));
const ledger=JSON.parse(readFileSync(join(root,"SESSION139_CONTENT_CHANGE_LEDGER.json"),"utf8"));
const sha=v=>createHash("sha256").update(v).digest("hex");
const canonical=v=>Array.isArray(v)?`[${v.map(canonical).join(",")}]`:v&&typeof v==="object"?`{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${canonical(v[k])}`).join(",")}}`:JSON.stringify(v);
const H=v=>sha(canonical(v));
const errors=[];
if(ledger.session!==139||ledger.baselineSession!==138)errors.push("ledger session/baseline mismatch");
if(ledger.authoredFilesChanged!==1||ledger.widgetNodesChanged!==9||ledger.variantDeclarationsChanged!==0)errors.push("ledger count mismatch");
const record=ledger.lessons[0],target=record.sourcePath;
const files=[];const courses=join(root,"content/courses");
for(const course of readdirSync(courses)){const dir=join(courses,course,"lessons");if(!existsSync(dir))continue;for(const file of readdirSync(dir).filter(n=>n.endsWith(".json")))files.push(`content/courses/${course}/lessons/${file}`)}files.sort();
if(files.length!==baseline.count)errors.push(`lesson count ${files.length} != ${baseline.count}`);
for(const path of files){const bytes=readFileSync(join(root,path));if(path!==target){if(sha(bytes)!==baseline.files[path])errors.push(`${path}: changed outside Session 139 ledger`);continue;}if(baseline.files[path]!==record.beforeSha256)errors.push("target before hash does not match Session 138 seal");if(sha(bytes)!==record.afterSha256)errors.push("target after hash does not match current bytes");}
const doc=JSON.parse(readFileSync(join(root,target),"utf8"));
const top=Object.fromEntries(Object.entries(doc).filter(([k])=>!["steps","remedials"].includes(k)));
if(H(top)!==record.frozenSurfaceProof.topLevel.after||record.frozenSurfaceProof.topLevel.before!==record.frozenSurfaceProof.topLevel.after)errors.push("top-level authored fields changed");
if(H(doc.steps.map(s=>s.id))!==record.frozenSurfaceProof.stepOrder.after||record.frozenSurfaceProof.stepOrder.before!==record.frozenSurfaceProof.stepOrder.after)errors.push("step order changed");
if(H(doc.remedials.map(r=>r.check.id))!==record.frozenSurfaceProof.remedialOrder.after||record.frozenSurfaceProof.remedialOrder.before!==record.frozenSurfaceProof.remedialOrder.after)errors.push("remedial order changed");
const main=Object.fromEntries(doc.steps.map(s=>[s.id,s]));const remedials=Object.fromEntries(doc.remedials.map(r=>[r.check.id,r]));
const truth=w=>{const rawNum=w.operation==="multiply"?w.left.num*w.right.num:w.left.num*w.right.den;const rawDen=w.operation==="multiply"?w.left.den*w.right.den:w.left.den*w.right.num;let x=Math.abs(rawNum),y=Math.abs(rawDen);while(y)[x,y]=[y,x%y];const g=x||1;return{sign:w.left.sign*w.right.sign,num:rawNum/g,den:rawDen/g}};
for(const [id,proof] of Object.entries(record.frozenSurfaceProof.surfaces)){const isRem=id.startsWith("rem-");const item=isRem?remedials[id]:main[id];if(!item){errors.push(`${id}: missing authored item`);continue;}const copy=structuredClone(item);if(isRem)delete copy.check.widget;else delete copy.widget;if(H(copy)!==proof.after||proof.before!==proof.after)errors.push(`${id}: frozen authored surface changed`);const widget=isRem?item.check.widget:item.widget;const ap=record.answerProof[id];if(canonical(truth(widget))!==canonical(ap.after)||canonical(ap.before)!==canonical(ap.after))errors.push(`${id}: answer changed`);const fp=record.misconceptionFeedbackProof[id];const after=widget.choices.filter(c=>c.path!=="correct").map(c=>c.feedback);if(canonical(after)!==canonical(fp.after)||canonical(fp.before)!==canonical(fp.after))errors.push(`${id}: misconception feedback changed`);const vp=record.variantProof[id];const actual=isRem?null:(item.variant??null);if(canonical(actual)!==canonical(vp.after)||canonical(vp.before)!==canonical(vp.after))errors.push(`${id}: variant declaration changed`);}
if(errors.length){console.error(`Session 139 content proof failed (${errors.length})`);for(const e of errors)console.error(`- ${e}`);process.exit(1)}
console.log(`Session 139 content proof passed: ${files.length} lessons; 1 file / 9 widget nodes / 0 variant declarations changed; all other authored surfaces preserved`);
