#!/usr/bin/env node
import {createHash} from "node:crypto";
import {existsSync,readFileSync,readdirSync} from "node:fs";
import {join,resolve} from "node:path";
const root=resolve(import.meta.dirname,"../..");
const baseline=JSON.parse(readFileSync(join(root,"SESSION142_LESSON_HASHES.json"),"utf8"));
const ledger=JSON.parse(readFileSync(join(root,"SESSION143_CONTENT_CHANGE_LEDGER.json"),"utf8"));
const sha=b=>createHash("sha256").update(b).digest("hex");
const stable=v=>Array.isArray(v)?`[${v.map(stable)}]`:v&&typeof v==="object"?`{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${stable(v[k])}`).join(",")}}`:JSON.stringify(v);
const H=v=>sha(Buffer.from(stable(v)));
const errors=[]; const records=new Map(ledger.lessons.map(r=>[r.sourcePath,r]));
const repairs=new Map((ledger.repairs??[]).map(r=>[r.sourcePath,r]));
const files=[];for(const course of readdirSync(join(root,"content/courses"))){const dir=join(root,"content/courses",course,"lessons");if(!existsSync(dir))continue;for(const f of readdirSync(dir).filter(x=>x.endsWith(".json")))files.push(`content/courses/${course}/lessons/${f}`)}files.sort();
if(files.length!==1129)errors.push(`lesson count ${files.length}, expected 1129`);
const get=(d,id)=>id.startsWith("rem-")?d.remedials.find(r=>r.check.id===id)?.check:d.steps.find(s=>s.id===id);
const FALL=new Set(["fallSteady","fallConcaveUp","fallConcaveDown"]);
const readClaim=w=>{
 const target=(w.segments??[]).find(s=>s.id===w.targetSegmentId)??w.segments?.[0];
 const kinds=(w.segments??[]).map(s=>s.kind);
 if(w.readTask==="flatMeaning")return w.axisContext==="distanceFromOrigin"?"motion:stopped":"change:constant";
 if(w.readTask==="steepMeaning")return target?.kind==="riseGentle"?"rate:slower":"rate:faster";
 if(w.readTask==="directionMeaning")return target?.kind==="flat"?"change:constant":target?.kind?.startsWith("rise")?"change:increasing":"change:decreasing";
 if(w.readTask==="flatteningMeaning")return target?.kind?.startsWith("rise")?"rate:increasing-more-slowly":"rate:decreasing-more-slowly";
 if(w.readTask==="locateStopped")return `section:${(w.segments??[]).find(s=>s.kind==="flat")?.label??"none"}`;
 return `sequence:${kinds.join(">")}`;
};
for(const path of files){
 const bytes=readFileSync(join(root,path)); const rec=records.get(path); const repair=repairs.get(path);
 if(repair){
  const text=bytes.toString("utf8");
  const occurrences=text.split(repair.after).length-1;
  if(occurrences!==1) errors.push(`${path}: expected exactly one corrected string, found ${occurrences}`);
  const reverted=Buffer.from(text.replace(repair.after,repair.before));
  if(sha(reverted)!==baseline.files[path]) errors.push(`${path}: content differs from sealed Session 142 beyond the authorized string`);
  if(sha(bytes)!==repair.afterSha256||baseline.files[path]!==repair.beforeSha256) errors.push(`${path}: repair hash mismatch`);
  const d=JSON.parse(bytes); const step=d.steps.find(s=>s.id===repair.stepId);
  if(step?.variant?.form!==repair.after) errors.push(`${path}/${repair.stepId}: corrected variant.form missing`);
  continue;
 }
 if(!rec){if(sha(bytes)!==baseline.files[path])errors.push(`${path}: changed outside ledger`);continue}
 if(rec.beforeSha256!==baseline.files[path]||rec.afterSha256!==sha(bytes))errors.push(`${path}: byte hash mismatch`);
 const d=JSON.parse(bytes); const top=Object.fromEntries(Object.entries(d).filter(([k])=>!["steps","remedials"].includes(k)));
 if(H(top)!==rec.topLevelAfter||rec.topLevelBefore!==rec.topLevelAfter)errors.push(`${path}: top-level drift`);
 if(stable(d.steps.map(s=>s.id))!==stable(rec.stepOrderAfter)||stable(rec.stepOrderBefore)!==stable(rec.stepOrderAfter))errors.push(`${path}: step order drift`);
 if(stable((d.remedials??[]).map(r=>r.check.id))!==stable(rec.remedialOrderAfter)||stable(rec.remedialOrderBefore)!==stable(rec.remedialOrderAfter))errors.push(`${path}: remedial order drift`);
 for(const id of rec.changedIds){
  const step=get(d,id),item=rec.items[id]; if(!step){errors.push(`${path}/${id}: missing`);continue}
  const frozen=Object.fromEntries(Object.entries(step).filter(([k])=>!["widget","predict"].includes(k)));
  if(H(frozen)!==item.frozenAfter||item.frozenBefore!==item.frozenAfter)errors.push(`${path}/${id}: frozen surface drift`);
  if(stable(step.variant??null)!==stable(item.variantAfter??null)||stable(item.variantBefore??null)!==stable(item.variantAfter??null))errors.push(`${path}/${id}: variant declaration drift`);
  if(stable(step.predict??null)!==stable(item.predictAfter??null))errors.push(`${path}/${id}: prediction drift`);
  if(id!=="i1"||d.id!=="fg-04-03"){if(item.predictBefore!==null||item.predictAfter!==null)errors.push(`${path}/${id}: unauthorized prediction change`)}
  else if(item.predictBefore!==null||!item.predictAfter)errors.push(`${path}/${id}: required additive prediction missing`);
  const w=step.widget; if(w?.type!=="graphStoryLab")errors.push(`${path}/${id}: graphStoryLab surface lost`);
  const expectedMode=d.id==="fg-04-02"?"read":"build";if(w?.mode!==expectedMode)errors.push(`${path}/${id}: mode ${w?.mode}, expected ${expectedMode}`);
  const kinds=(w?.segments??[]).map(s=>s.kind);if(stable(kinds)!==stable(item.targetKinds))errors.push(`${path}/${id}: target truth drift`);
  if(w?.axisContext==="distanceFromOrigin"&&w?.distanceRule==="awayOnly"&&kinds.some(k=>FALL.has(k)))errors.push(`${path}/${id}: away-only distance falls`);
  const allStrings=[];const walk=x=>{if(typeof x==="string")allStrings.push(x);else if(Array.isArray(x))x.forEach(walk);else if(x&&typeof x==="object")Object.values(x).forEach(walk)};walk(w);
  for(const text of item.authoredResponseStrings)if(!allStrings.includes(text))errors.push(`${path}/${id}: authored response string lost: ${text}`);
  if(expectedMode==="build"&&w.answerLabel!==item.beforeAnswer)errors.push(`${path}/${id}: correct answer label drift`);
  if(expectedMode==="read"){const claim=readClaim(w);const correct=(w.choices??[]).filter(c=>c.claim===claim);if(correct.length!==1)errors.push(`${path}/${id}: read truth does not select exactly one claim`);if(item.beforeAnswer!==null&&correct[0]?.label!==item.beforeAnswer)errors.push(`${path}/${id}: read answer label drift`)}
 }
}
if(ledger.summary.widgetNodesChanged!==14||ledger.summary.variantDeclarationsChanged!==0||ledger.summary.predictAdditions!==1||ledger.summary.repairFilesChanged!==1||ledger.summary.repairStringsChanged!==1)errors.push("ledger summary mismatch");
if(errors.length){console.error(`Session 143 content proof failed (${errors.length})`);errors.forEach(e=>console.error(`- ${e}`));process.exit(1)}
console.log("Session 143 content proof passed: 1129 lessons; graph-story 2 files / 14 widget nodes / 1 additive prediction / 0 variant declarations; repair 1 file / 1 string");
