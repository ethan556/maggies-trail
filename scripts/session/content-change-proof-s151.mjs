#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { verifiedPostS151Changes } from './verified-post-s151-changes.mjs';
const root=resolve(import.meta.dirname,'../..');
const baseDir=join(root,'scripts/session/baselines-s151');
const applied=JSON.parse(readFileSync(join(root,'scripts/session/session151-applied.json'),'utf8')).changes;
const prior=JSON.parse(readFileSync(join(root,'SESSION150_LESSON_HASHES.json'),'utf8')).files;
const sha=b=>createHash('sha256').update(b).digest('hex');
const clone=x=>JSON.parse(JSON.stringify(x));
const targetSet=new Set(applied.map(x=>x.rel));
const postS151=verifiedPostS151Changes(root);
const expectedCurrent=new Set([...targetSet,...postS151]);
const entries=[];let variantChanges=0;
for(const change of applied){
  const currentPath=join(root,change.rel),basePath=join(baseDir,basename(change.rel));
  if(!existsSync(basePath))throw new Error(`missing baseline ${basePath}`);
  const before=JSON.parse(readFileSync(basePath,'utf8')),after=JSON.parse(readFileSync(currentPath,'utf8'));
  const bi=before.steps.findIndex(s=>s.id===change.stepId),ai=after.steps.findIndex(s=>s.id===change.stepId);
  if(bi<0||ai<0)throw new Error(`${change.rel}: step ${change.stepId} missing`);
  const bstep=before.steps[bi],astep=after.steps[ai];
  if(bstep.variant!==undefined||astep.variant!==undefined){if(JSON.stringify(bstep.variant)!==JSON.stringify(astep.variant))variantChanges++;}
  if(astep.widget?.type!==change.newType||bstep.widget?.type!==change.oldType)throw new Error(`${change.rel}: widget boundary mismatch`);
  const reconstructed=clone(after);reconstructed.steps[ai].widget=clone(bstep.widget);
  if(JSON.stringify(reconstructed)!==JSON.stringify(before))throw new Error(`${change.rel}: authored drift outside the single widget substitution`);
  entries.push({lessonFile:change.rel,lessonId:after.id,title:after.title,stepId:change.stepId,oldType:change.oldType,newType:change.newType,beforeWidgetSha256:sha(Buffer.from(JSON.stringify(bstep.widget))),afterWidgetSha256:sha(Buffer.from(JSON.stringify(astep.widget))),variantDeclarationPreserved:JSON.stringify(bstep.variant)===JSON.stringify(astep.variant),nonWidgetAuthoredContentPreserved:true});
}
const lessonPaths=[];for(const course of readdirSync(join(root,'content/courses')).sort()){const dir=join(root,'content/courses',course,'lessons');if(!existsSync(dir))continue;for(const file of readdirSync(dir).filter(x=>x.endsWith('.json')).sort())lessonPaths.push(`content/courses/${course}/lessons/${file}`)}
const changed=[];const unexpected=[];for(const rel of lessonPaths){const got=sha(readFileSync(join(root,rel)));if(prior[rel]!==got){changed.push(rel);if(!expectedCurrent.has(rel))unexpected.push(rel)}}
const missing=[...expectedCurrent].filter(x=>!changed.includes(x));
const summary={lessonFilesChanged:changed.length,widgetNodesChanged:entries.length,variantDeclarationsChanged:variantChanges,nonTargetLessonFilesByteIdentical:lessonPaths.length-changed.length,unexpectedChangedLessonFiles:unexpected.length,missingTargetChanges:missing.length};
const report={session:151,baselineSession:150,summary,changedLessonFiles:changed,entries,unexpected,missing,passed:changed.length===expectedCurrent.size&&entries.length===29&&variantChanges===0&&unexpected.length===0&&missing.length===0};
writeFileSync(join(root,'SESSION151_CONTENT_CHANGE_LEDGER.json'),JSON.stringify(report,null,2)+'\n');
writeFileSync(join(root,'SESSION151_AUTHORED_CONTENT_LEDGER.json'),JSON.stringify({session:151,engineExtensions:['equationOutcomeLab','sequenceBuild','geometricConstraintLab'],entries,passed:report.passed},null,2)+'\n');
if(!report.passed){console.error(report);process.exit(1)}
console.log(`Session 151 content boundary passed: ${changed.length} lesson files, ${entries.length} widget substitutions, ${summary.nonTargetLessonFilesByteIdentical} non-target lessons byte-identical`);
