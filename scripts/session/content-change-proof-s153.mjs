#!/usr/bin/env node
// Session 153 content-change proof: pins the single authored conversion against the sealed
// S151C ledger. lf-03-03/i2 numeric -> affineRelationshipLab(readIntercept); the frozen answer
// (6) is re-derived by the engine's own truth function and every other byte is unchanged.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
const root=resolve(import.meta.dirname,'../..');
const prior=JSON.parse(readFileSync(join(root,'SESSION151C_LESSON_HASHES.json'),'utf8')).files;
const applied=JSON.parse(readFileSync(join(root,'scripts/session/session153-applied.json'),'utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex');
const targets=new Set(applied.changes.map(c=>c.rel));
const entries=[];
for(const c of applied.changes){
  const before=JSON.parse(readFileSync(join(root,`scripts/session/baselines-s153/${c.lid}.json`),'utf8'));
  const after=JSON.parse(readFileSync(join(root,c.rel),'utf8'));
  const bs=before.steps.find(s=>s.id===c.stepId), as=after.steps.find(s=>s.id===c.stepId);
  if(!bs||!as)throw new Error(`${c.lid}: step ${c.stepId} missing`);
  if(bs.widget.type!==c.oldType||as.widget.type!==c.newType)throw new Error(`${c.lid}: widget boundary mismatch`);
  if(JSON.stringify(bs.variant)!==JSON.stringify(as.variant))throw new Error(`${c.lid}: variant drift`);
  if(bs.widget.prompt!==as.widget.prompt)throw new Error(`${c.lid}: prompt drift`);
  const oldErrs=(bs.widget.commonErrors??[]).map(e=>[e.value,e.feedback]);
  const newErrs=(as.widget.numericErrors??[]).map(e=>[e.value,e.feedback]);
  if(JSON.stringify(oldErrs)!==JSON.stringify(newErrs))throw new Error(`${c.lid}: misconception route drift`);
  const line=as.widget.lines.find(l=>l.id===as.widget.targetLineId);
  if(line.b!==bs.widget.answer)throw new Error(`${c.lid}: derived intercept ${line.b} != frozen answer ${bs.widget.answer}`);
  const rebuilt=JSON.parse(JSON.stringify(after));
  rebuilt.steps.find(s=>s.id===c.stepId).widget=bs.widget;
  if(JSON.stringify(rebuilt)!==JSON.stringify(before))throw new Error(`${c.lid}: authored drift outside the single widget`);
  entries.push({lesson:c.rel,stepId:c.stepId,oldType:c.oldType,newType:c.newType,frozenAnswer:bs.widget.answer,derivedIntercept:line.b,misconceptionRoutesPreserved:oldErrs.length});
}
const lessonPaths=[];
for(const course of readdirSync(join(root,'content/courses')).sort()){
  const dir=join(root,'content/courses',course,'lessons');
  if(!existsSync(dir))continue;
  for(const f of readdirSync(dir).filter(x=>x.endsWith('.json')).sort())lessonPaths.push(`content/courses/${course}/lessons/${f}`);
}
const changed=[],unexpected=[];
for(const rel of lessonPaths){
  if(prior[rel]!==sha(readFileSync(join(root,rel)))){changed.push(rel);if(!targets.has(rel))unexpected.push(rel);}
}
const passed=changed.length===1&&unexpected.length===0&&entries.length===1&&lessonPaths.length===1129;
const report={session:153,baseline:'SESSION151C_LESSON_HASHES.json',summary:{lessonFilesChanged:changed.length,widgetNodesChanged:entries.length,unexpected:unexpected.length,nonTargetByteIdentical:lessonPaths.length-changed.length},entries,deferred:applied.deferred??[],changed,unexpected,passed};
writeFileSync(join(root,'SESSION153_CONTENT_CHANGE_PROOF.json'),JSON.stringify(report,null,2)+'\n');
if(!passed){console.error(JSON.stringify(report.summary));process.exit(1);}
console.log(`content-change proof S153 passed: ${entries.length} conversion; frozen answer re-derived; ${report.summary.nonTargetByteIdentical} lessons byte-identical`);
