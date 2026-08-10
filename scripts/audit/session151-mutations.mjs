import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';const require=createRequire(import.meta.url);const schema=require('./load-schema-runtime-s151.cjs'),ev=require('./load-evaluate-runtime-s151.cjs');
const idx=JSON.parse(fs.readFileSync('scripts/session/baselines-s151/index.json','utf8')),results=[];let controls=0;
const reject=(name,fn)=>{let ok=false,detail='';try{ok=Boolean(fn())}catch(e){ok=true;detail=e.message}results.push({name,rejected:ok,detail});if(!ok)throw new Error(`mutation survived: ${name}`)};
const accept=(name,fn)=>{let ok=false;try{ok=Boolean(fn())}catch{}if(!ok)throw new Error(`valid control rejected: ${name}`);controls++};
for(const rel of idx.targets){const id=path.basename(rel,'.json'),doc=JSON.parse(fs.readFileSync(rel,'utf8')),w=doc.steps.map(s=>s.widget).find(widget=>id.startsWith('alg1-')?widget?.type==='equationOutcomeLab':id.startsWith('sr-')?widget?.type==='sequenceBuild'&&widget.task!=='dial':widget?.type==='geometricConstraintLab'&&widget.task==='coordinateProof');if(!w)throw new Error(`${id}: target missing`);
 if(w.type==='equationOutcomeLab'){
   const valid={stageIds:[...w.correctOrder]};accept(`${id} valid equation route`,()=>ev.canCheck(w,valid)&&ev.evaluate(w,valid).correct);
   reject(`${id} fabricated operation ids`,()=>!ev.canCheck(w,{stageIds:Array(w.requiredMoves).fill('fabricated')}));
   reject(`${id} reversed operation order`,()=>!ev.evaluate(w,{stageIds:[...w.correctOrder].reverse()}).correct);
   const duplicate=structuredClone(w);duplicate.operations[1].id=duplicate.operations[0].id;reject(`${id} duplicate operation ids`,()=>schema.widgetIntegrityErrors(duplicate).some(x=>x.includes('operation ids')));
   const missing=structuredClone(w);missing.correctOrder[0]='missing';reject(`${id} missing operation reference`,()=>schema.widgetIntegrityErrors(missing).some(x=>x.includes('missing operation')));
   const illegal=structuredClone(w);const norm=illegal.operations.find(o=>o.kind==='normalize');if(norm){norm.value=2;reject(`${id} normalize scalar carrier`,()=>schema.widgetIntegrityErrors(illegal).some(x=>x.includes('must not carry')))}
   const rewrite=structuredClone(w),candidate=rewrite.operations.find(o=>o.kind==='normalize');if(candidate){candidate.result={leftCoeff:1,leftConstant:0,rightCoeff:0,rightConstant:999,relation:'eq'};reject(`${id} solution-changing rewrite`,()=>schema.widgetIntegrityErrors(rewrite).some(x=>x.includes('changes the solution set')))}
 }
 else if(w.type==='sequenceBuild'){
   const truth=schema.sequenceReasoningTruth(w),keys=truth.stages.map(s=>s.key),correct=w.answerMode==='numeric'?{explored:keys,numeric:truth.answerNumber}:{explored:keys,choiceId:w.choices.find(c=>c.claim===truth.answerClaim)?.id};accept(`${id} valid sequence state`,()=>ev.canCheck(w,correct)&&ev.evaluate(w,correct).correct);
   reject(`${id} fabricated exploration`,()=>!ev.canCheck(w,{explored:['fabricated','also-fake'],numeric:truth.answerNumber,choiceId:correct.choiceId}));
   reject(`${id} missing required exploration`,()=>!ev.evaluate(w,{...correct,explored:[]}).correct);
   if(w.answerMode==='numeric'){
     const wrong=w.numericErrors[0]?.value??(truth.answerNumber+1);reject(`${id} numeric misconception`,()=>!ev.evaluate(w,{explored:keys,numeric:wrong}).correct);
     const collision=structuredClone(w);collision.numericErrors.push({value:truth.answerNumber,feedback:'collision'});reject(`${id} numeric trap collision`,()=>schema.widgetIntegrityErrors(collision).some(x=>x.includes('collides')));
   }else{
     const wrong=w.choices.find(c=>c.claim!==truth.answerClaim);reject(`${id} semantic misconception`,()=>!ev.evaluate(w,{explored:keys,choiceId:wrong.id}).correct);
     const duplicate=structuredClone(w);duplicate.choices[1].claim=duplicate.choices[0].claim;reject(`${id} duplicate semantic truth`,()=>schema.widgetIntegrityErrors(duplicate).some(x=>x.includes('mathematical')||x.includes('correct')));
   }
   const impossible=structuredClone(w);impossible.requiredExplorations=16;reject(`${id} impossible exploration demand`,()=>schema.widgetIntegrityErrors(impossible).some(x=>x.includes('exceeds')));
 }
 else {
   const truth=schema.geometricConstraintTruth(w),keys=truth.stages.map(s=>s.key),correct=w.answerMode==='numeric'?{revealed:keys,numeric:truth.answerNumber}:{revealed:keys,choiceId:w.choices.find(c=>schema.geometricConstraintChoiceCorrect(w,c))?.id};accept(`${id} valid coordinate proof`,()=>ev.canCheck(w,correct)&&ev.evaluate(w,correct).correct);
   reject(`${id} fabricated geometry exploration`,()=>!ev.canCheck(w,{revealed:['fabricated','fake'],numeric:truth.answerNumber,choiceId:correct.choiceId}));
   reject(`${id} geometry check before exploration`,()=>!ev.evaluate(w,{...correct,revealed:[]}).correct);
   if(w.answerMode==='numeric'){
     const wrong=w.numericErrors[0]?.value??truth.answerNumber+1;reject(`${id} geometry numeric misconception`,()=>!ev.evaluate(w,{revealed:keys,numeric:wrong}).correct);
     const collision=structuredClone(w);collision.numericErrors.push({value:truth.answerNumber,feedback:'collision'});reject(`${id} geometry trap collision`,()=>schema.widgetIntegrityErrors(collision).some(x=>x.includes('collides')));
   }else{
     const wrong=w.choices.find(c=>!schema.geometricConstraintChoiceCorrect(w,c));reject(`${id} geometry semantic misconception`,()=>!ev.evaluate(w,{revealed:keys,choiceId:wrong.id}).correct);
     const duplicate=structuredClone(w);duplicate.choices[1].claim=duplicate.choices[0].claim;reject(`${id} duplicate geometry truth carrier`,()=>schema.widgetIntegrityErrors(duplicate).some(x=>x.includes('mathematical')||x.includes('correct')));
   }
   const duplicatePoint=structuredClone(w);if(duplicatePoint.coordinateProof.points.length>1){duplicatePoint.coordinateProof.points[1].id=duplicatePoint.coordinateProof.points[0].id;reject(`${id} duplicate coordinate point id`,()=>schema.widgetIntegrityErrors(duplicatePoint).some(x=>x.includes('point ids')))}
 }
}
// Cross-family high-impact defects
const schemaSource=fs.readFileSync('src/lib/schema.ts','utf8'),widgets=fs.readFileSync('src/components/widgets.tsx','utf8'),evaluate=fs.readFileSync('src/lib/evaluate.ts','utf8');
for(const name of ['EquationOutcomeLabSpec','SequenceBuildSpec','GeometricConstraintLabSpec'])reject(`${name} refine-wrapper union collapse`,()=>{const a=schemaSource.indexOf(`export const ${name}`),b=schemaSource.indexOf('/**',a+20),block=schemaSource.slice(a,b<0?a+6000:b);return /z\.object\s*\(/.test(block)&&!/\.superRefine\s*\(|\.refine\s*\(/.test(block)});
reject('equation mastery colors missing',()=>['border-sky','border-tangerine','border-leaf','border-berry'].every(token=>widgets.includes(token)));
reject('sequence exact stages missing',()=>widgets.includes('SequenceReasoningW')&&widgets.includes('partial sums')&&widgets.includes('sequence-stage'));
reject('coordinate proof diagram missing non-color semantics',()=>widgets.includes('horizontal differences')&&widgets.includes('vertical differences')&&widgets.includes('strokeDasharray'));
reject('fabricated-key filtering removed',()=>evaluate.includes('valid.has(key)')||evaluate.includes('valid.has(item)'));
const failed=results.filter(r=>!r.rejected);const out={session:151,passed:failed.length===0,rejected:results.length,failed:failed.length,validControls:controls,mutations:results};fs.writeFileSync('SESSION151_ADVERSARIAL_MUTATION_MATRIX.json',JSON.stringify(out,null,2)+'\n');fs.writeFileSync('SESSION151_ADVERSARIAL_MUTATION_MATRIX.md',`# Session 151 Adversarial Mutation Matrix\n\n- Rejected: **${results.length}/${results.length}**\n- Valid controls accepted: **${controls}/${controls}**\n\n${results.map(r=>`- ✓ ${r.name}`).join('\n')}\n`);console.log(`Session 151 mutations passed: ${results.length}/${results.length} rejected; ${controls}/${controls} controls accepted.`);
