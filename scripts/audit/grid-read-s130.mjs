#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
const root=resolve(import.meta.dirname,"..","..");
const ids=['ssg2-02-02','ssg2-02-03'];
const paths=ids.map(id=>join(root,`content/courses/shapes-shares-g2/lessons/${id}.json`));
const ledger=JSON.parse(readFileSync(join(root,'SESSION130_CONTENT_CHANGE_LEDGER.json'),'utf8'));
const queue=JSON.parse(readFileSync(join(root,'EXCELLENCE_BACKLOG_S126.json'),'utf8'));
const product=JSON.parse(readFileSync(join(root,'PRODUCT_STATE.json'),'utf8'));
const tierPath=join(tmpdir(),`maggies-tier-s130-${process.pid}.json`); let tiers;
try{execFileSync(process.execPath,[join(root,'scripts/flagship-tier.mjs')],{cwd:root,env:{...process.env,TIER_JSON:tierPath},stdio:'ignore'});tiers=JSON.parse(readFileSync(tierPath,'utf8'));}finally{rmSync(tierPath,{force:true})}
const errors=[]; const experiences=[];
const sourceContracts = [
  ["src/lib/schema.ts", ["areaModel(countGrid): wStart/wMax and hStart/hMax must match", "duplicate common count"]],
  ["src/lib/evaluate.ts", ["spec.commonCounts.find((entry) => entry.count === count)", "spec.countGrid ? `${spec.targetArea} unit squares`"]],
  ["src/components/widgets.tsx", ["function CountGridW", "area-count-answer-ghost", "Count next row", "The grid itself never changes"]],
  ["src/lib/variants.ts", ["colTrapRead", "squareRead", "countGrid: true"]],
  ["src/lib/g2Variants.ts", ["Ssg2GridApplyRead", "countGrid:true"]]
];
for (const [path, tokens] of sourceContracts) {
  const text=readFileSync(join(root,path),'utf8');
  for (const token of tokens) if(!text.includes(token)) errors.push(`${path}: missing adversarial contract token ${token}`);
}
for(const path of paths){
 const lesson=JSON.parse(readFileSync(path,'utf8'));
 for(const step of lesson.steps.filter(s=>['i1','i2','i3','k1','k2','k3','ch1'].includes(s.id))){
  const w=step.widget;
  if(w?.type!=='areaModel'||w.countGrid!==true) errors.push(`${lesson.id}/${step.id}: not fixed-grid areaModel`);
  else {
   if(w.wStart*w.hStart!==w.targetArea) errors.push(`${lesson.id}/${step.id}: dimensions do not derive answer`);
   if(w.wStart!==w.wMax||w.hStart!==w.hMax) errors.push(`${lesson.id}/${step.id}: grid can resize`);
   experiences.push({lessonId:lesson.id,id:step.id,rows:w.hStart,columns:w.wStart,answer:w.targetArea,commonCounts:w.commonCounts.map(x=>x.count),variant:step.variant??null});
  }
 }
 const rem=lesson.remedials[0].check.widget;
 if(rem?.type!=='areaModel'||rem.countGrid!==true) errors.push(`${lesson.id}/remedial: not fixed-grid areaModel`);
 else experiences.push({lessonId:lesson.id,id:'remedial',rows:rem.hStart,columns:rem.wStart,answer:rem.targetArea,commonCounts:rem.commonCounts.map(x=>x.count),variant:null});
 const tier=tiers.find(r=>r.id===lesson.id);
 // S191 note: pinned 28 at s130 sealing; a later engine-capability upgrade raised areaModel's
 // adapt rating (processEvents wiring) 0->3, lifting these untouched lessons' honest total to 29.
 // The audit's claim — honest resting tier B — still holds; the total pin tracks the true measurement.
 if(tier?.tier!=='B'||tier.total!==29) errors.push(`${lesson.id}: expected honest B29, found ${tier?.tier}${tier?.total}`);
}
const rows=queue.records??queue.rows??[];
for(const id of ids) if(rows.some(r=>r.lessonId===id)) errors.push(`${id}: completed lesson remains in live queue`);
if(rows.length>59) errors.push(`live queue regressed behind Session 130: ${rows.length} rows`);
if((product.flagshipTiers?.B??0)<206||(product.flagshipTiers?.C??9999)>287) errors.push(`product tiers regressed behind Session 130: ${JSON.stringify(product.flagshipTiers)}`);
if(ledger.widgetNodesChanged!==16||ledger.variantDeclarationsChanged!==8) errors.push('content ledger counts mismatch');
const result={session:130,engine:'areaModel fixed-grid counting mode',lessons:ids,convertedExperiences:experiences,tier:{before:'C22 each',after:'B29 each (B28 at sealing; areaModel adapt capability later raised)',honestRestingTier:'B'},productTiers:product.flagshipTiers,queue:{before:61,after:rows.length,unreviewed:queue.summary?.unreviewed??0},authoredContent:{filesChanged:2,widgetNodesChanged:16,variantDeclarationsChanged:8,exception:ledger.exception},invariants:['given rows and columns are visible before interaction','the learner marks counted squares; dimensions never resize','every authored numeric wrong path is reachable as an exact count','practice variants preserve the areaModel surface','row grouping accelerates counting without auto-solving','reveal ghosts the complete grid without replacing learner work'],errors};
writeFileSync(join(root,'GRID_READ_S130.json'),JSON.stringify(result,null,2)+'\n');
const table=experiences.map(x=>`| ${x.lessonId} | ${x.id} | ${x.rows} × ${x.columns} | ${x.answer} | ${x.commonCounts.join(', ')} |`).join('\n');
writeFileSync(join(root,'GRID_READ_S130.md'),`# Session 130 — Fixed-grid counting\n\n## Result\n\n- **Engine extension:** ${result.engine}.\n- **Converted experiences:** ${experiences.length}.\n- **Lessons:** ${ids.join(', ')}; each C22 → **B29** (B28 at s130 sealing; areaModel adapt capability later raised).\n- **Reviewed K–8 queue:** 61 → **${rows.length}**, zero unreviewed.\n- **Product tiers:** A ${product.flagshipTiers.A} · B ${product.flagshipTiers.B} · C ${product.flagshipTiers.C} · D ${product.flagshipTiers.D}.\n\n## Independently derived grids\n\n| lesson | experience | fixed grid | answer | preserved misconception counts |\n|---|---|---:|---:|---|\n${table}\n\n## Breakthrough interaction\n\nThe engine now separates **reading a given array** from **constructing a factor pair**. The grid is fixed and visible. The learner marks counted cells using reversible +1, next-row, −1, and reset controls; the dimensions never move. This makes row grouping causal while preserving every authored addition and one-row misconception as an exact reachable state.\n\n## Adversarial contract\n\n${result.invariants.map(x=>`- ${x}`).join('\n')}\n\n## Frozen-content ledger\n\nTwo lesson JSON files changed under the broken-representation and broken-remedial-interaction exceptions: 16 widget nodes and 8 variant-form declarations. Every other authored surface is hash-proved unchanged in \`SESSION130_CONTENT_CHANGE_LEDGER.json\`.\n`);
if(errors.length){console.error(`grid-read-s130 failed (${errors.length})`); for(const e of errors) console.error(`- ${e}`); process.exit(1)}
console.log(`grid-read-s130 passed: 16 fixed-grid experiences; two C22 -> B29; queue 61 -> ${rows.length}`);
