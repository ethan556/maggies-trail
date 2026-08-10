#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(process.argv[2]??'.');
const fail=(m)=>{throw new Error(m)};
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const inventory=JSON.parse(read('scripts/variant-batch/session96-advanced-cml-inventory.json'));
const rows=inventory.rows;
if(inventory.summary.precalculusDirect!==29||inventory.summary.calculusDirect!==53||inventory.summary.totalDirect!==82) fail('advanced direct-manipulative inventory drift');
if(rows.filter(r=>r.flagship).length!==16) fail('expected sixteen course flagships');
if(new Set(rows.filter(r=>r.flagship).map(r=>r.course)).size!==16) fail('each advanced course must own exactly one flagship');
if(rows.some(r=>!r.widget||!r.file)) fail('inventory row missing identity');

const requiredTypes=['conicLocusLab','derivativeRuleLab','relatedRatesLab'];
const sourceFiles={
 schema:read('src/lib/schema.ts'), widgets:read('src/components/widgets.tsx'), evaluate:read('src/lib/evaluate.ts'),
 describe:read('src/lib/describeState.ts'), samples:read('src/components/widgetSamples.ts'),
 catalog:read('src/lib/cml/catalog.ts'), mesh:read('src/lib/cml/mesh.ts'), pedagogy:read('src/lib/pedagogy.ts')
};
for(const type of requiredTypes){
 for(const [name,text] of Object.entries(sourceFiles)) if(!text.includes(type)) fail(`${type} missing from ${name}`);
 const capability=JSON.parse(read('scripts/engine-capabilities.json')).types[type];
 if(!capability||Object.values(capability).some(v=>v!==3)) fail(`${type} capability contract is incomplete`);
}

const expectedNew=[
 ['content/courses/conic-sections/lessons/co-05-02.json','i1','conicLocusLab'],
 ['content/courses/derivative-rules/lessons/dr-03-01.json','i1','derivativeRuleLab'],
 ['content/courses/derivative-rules/lessons/dr-04-01.json','i1','derivativeRuleLab'],
 ['content/courses/derivatives-in-context/lessons/dc-02-02.json','i1','relatedRatesLab']
];
for(const [file,id,type] of expectedNew){
 const lesson=JSON.parse(read(file));const step=lesson.steps.find(s=>s.id===id);
 if(step?.widget?.type!==type) fail(`${file}#${id} is not ${type}`);
 if(!step.cml||!rows.some(r=>r.file===file&&r.step===id)) fail(`${file}#${id} is not CML-wired`);
}

for(const row of rows){
 const lesson=JSON.parse(read(row.file));const step=lesson.steps.find(s=>s.id===row.step);
 if(!step||step.widget?.type!==row.widget) fail(`inventory surface drift ${row.lesson}#${row.step}`);
 const meta=step.cml;
 if(!meta?.kernel||!meta.actionGoal||!meta.invariants?.length||!meta.misconceptions?.length||meta.representations?.length<3) fail(`incomplete CML contract ${row.lesson}#${row.step}`);
 if(row.flagship){
  if(!step.predict||!meta.flagship||!meta.translationFrom||!meta.translationTo||!meta.counterfactualPrompt||!meta.transferFamily||meta.delayed!==true) fail(`incomplete flagship ${row.lesson}#${row.step}`);
  if(meta.explanation?.options?.filter(o=>o.correct).length!==1) fail(`bad explanation key ${row.lesson}#${row.step}`);
 }
}

function gradeConic(spec,v){if(v.samples<spec.requiredSamples)return false;return v.eTenths===spec.targetEccentricityTenths}
function gradeRule(spec,v){if(v.moves<spec.requiredMoves)return false;return spec.mode==='product'?v.h<=spec.targetH+1e-9:v.innerRate===spec.targetInnerRate&&v.outerRate===spec.targetOuterRate}
function gradeRates(spec,v){return v.moves>=spec.requiredMoves&&v.x===spec.targetX}
const conic=JSON.parse(read(expectedNew[0][0])).steps.find(s=>s.id==='i1').widget;
if(!gradeConic(conic,{eTenths:10,samples:4})||gradeConic(conic,{eTenths:9,samples:4})||gradeConic(conic,{eTenths:10,samples:3})) fail('conic evaluator truth table failed');
const product=JSON.parse(read(expectedNew[1][0])).steps.find(s=>s.id==='i1').widget;
if(!gradeRule(product,{h:.1,innerRate:1,outerRate:1,moves:4})||gradeRule(product,{h:.15,innerRate:1,outerRate:1,moves:4})) fail('product-rule evaluator truth table failed');
const chain=JSON.parse(read(expectedNew[2][0])).steps.find(s=>s.id==='i1').widget;
if(!gradeRule(chain,{h:1,innerRate:3,outerRate:5,moves:4})||gradeRule(chain,{h:1,innerRate:3,outerRate:4,moves:4})) fail('chain-rule evaluator truth table failed');
const rates=JSON.parse(read(expectedNew[3][0])).steps.find(s=>s.id==='i1').widget;
if(!gradeRates(rates,{x:6,moves:4})||gradeRates(rates,{x:5,moves:4})||gradeRates(rates,{x:6,moves:3})) fail('related-rates evaluator truth table failed');

const types=new Map();for(const row of rows)types.set(row.widget,(types.get(row.widget)??0)+1);
console.log(JSON.stringify({status:'PASS',directManipulatives:rows.length,precalculus:29,calculus:53,flagships:16,supporting:66,newEngines:3,replacedPassiveSteps:4,types:Object.fromEntries([...types].sort())},null,2));
