#!/usr/bin/env node
const fs=require('fs'),path=require('path'),assert=require('assert');
const ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
const root=path.resolve(process.argv[2]||'.'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const inv=JSON.parse(read('scripts/variant-batch/session97-statprob-cml-inventory.json'));
assert.equal(inv.summary.direct,45);assert.equal(inv.summary.explicitCML,45);assert.equal(inv.summary.flagships,9);assert.equal(inv.summary.supporting,36);
assert.equal(new Set(inv.rows.map(r=>r.course)).size,6);assert(inv.rows.every(r=>r.cml));
for(const row of inv.rows){const doc=JSON.parse(read(row.file));const step=doc.steps.find(s=>s.id===row.step);assert(step,`missing ${row.file}#${row.step}`);assert.equal(step.widget.type,row.widget);const m=step.cml;assert(m?.kernel&&m.actionGoal&&m.invariants?.length&&m.misconceptions?.length&&m.representations?.length>=3,`incomplete CML ${row.file}#${row.step}`);if(row.flagship){assert(step.predict&&m.flagship&&m.translationFrom&&m.translationTo&&m.counterfactualPrompt&&m.transferFamily&&m.delayed===true,`incomplete flagship ${row.file}#${row.step}`);assert.equal(m.explanation?.options?.filter(o=>o.correct).length,1)}}
const required=['src/lib/schema.ts','src/components/widgets.tsx','src/lib/evaluate.ts','src/lib/describeState.ts','src/lib/pedagogy.ts','src/lib/cml/catalog.ts','src/lib/cml/mesh.ts','src/components/widgetSamples.ts','scripts/engine-capabilities.json'];
for(const file of required)assert(read(file).includes('conditionalTableLab'),`conditionalTableLab missing ${file}`);
const cap=JSON.parse(read('scripts/engine-capabilities.json')).types.conditionalTableLab;assert(cap&&Object.values(cap).every(v=>v===3),'conditionalTableLab capability incomplete');
const lesson=JSON.parse(read('content/courses/conditional-probability/lessons/cpr-03-02.json')),step=lesson.steps.find(s=>s.id==='i1'),spec=step.widget;
assert.equal(spec.type,'conditionalTableLab');assert.equal(spec.counts.reduce((a,b)=>a+b,0),200);assert.equal(spec.targetCondition,'row0');assert.equal(spec.targetCell,'r0c0');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
const schemaPath=require.resolve(path.join(root,'src/lib/schema.ts'));
require.cache[schemaPath]={id:schemaPath,filename:schemaPath,loaded:true,exports:{mixedRegroupTruth:()=>({}),columnCalcTruth:()=>0}};
const {evaluate}=require(path.join(root,'src/lib/evaluate.ts'));
let r=evaluate(spec,{condition:'row0',cell:'r0c0',switches:2});assert(r.correct);assert.equal(r.feedback,spec.successFeedback);
r=evaluate(spec,{condition:'row0',cell:'r0c0',switches:1});assert(!r.correct);assert.equal(r.feedback,spec.explorationFeedback);
r=evaluate(spec,{condition:'col0',cell:'r0c0',switches:2});assert(!r.correct);assert.equal(r.feedback,spec.conditionFeedback);
r=evaluate(spec,{condition:'row0',cell:'r0c1',switches:2});assert(!r.correct);assert.equal(r.feedback,spec.cellFeedback);
const old=JSON.parse(fs.readFileSync('/mnt/data/session97-baseline/content/courses/conditional-probability/lessons/cpr-03-02.json','utf8')).steps.find(s=>s.id==='i1');assert.equal(old.widget.type,'tapDiagram');
console.log(JSON.stringify({status:'PASS',courses:6,directManipulatives:45,explicitCML:45,flagships:9,supporting:36,newEngines:1,intentionalReplacements:1,evaluatorTruthCases:4,types:inv.summary.byWidget},null,2));
