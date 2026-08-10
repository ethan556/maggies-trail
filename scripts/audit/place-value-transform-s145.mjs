#!/usr/bin/env node
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
const root=resolve(import.meta.dirname,'../..'),baseDir=join(root,'scripts/audit/baselines/s145');
const targets={
 'pv2-03-02':'content/courses/place-value-million/lessons/pv2-03-02.json',
 'dop-05-03':'content/courses/decimal-operations/lessons/dop-05-03.json',
 'dpv-01-03':'content/courses/decimals-place-value/lessons/dpv-01-03.json',
 'dpv-03-01':'content/courses/decimals-place-value/lessons/dpv-03-01.json',
 'dpv-04-03':'content/courses/decimals-place-value/lessons/dpv-04-03.json',
 'esn-01-02':'content/courses/exponents-scientific-notation/lessons/esn-01-02.json',
 'esn-01-03':'content/courses/exponents-scientific-notation/lessons/esn-01-03.json'};
const clean=n=>{const x=Math.round(n*1e12)/1e12;return Object.is(x,-0)?0:x},near=(a,b,t=0)=>Math.abs(a-b)<=t+1e-9,pow=e=>10**e;
const digit=(v,e)=>Math.floor(Math.abs(v)/pow(e)+1e-9)%10;
const deciding=(a,b)=>{const max=Math.max(0,Math.floor(Math.log10(Math.max(Math.abs(a),Math.abs(b),1e-12))));for(let e=max;e>=-12;e--)if(digit(a,e)!==digit(b,e))return e;return -12};
const round=(v,e)=>clean(Math.round((v+Number.EPSILON*Math.sign(v||1))/pow(e))*pow(e));
const scale=v=>{for(let e=0;e<=12;e++)if(Math.abs(v*pow(e)-Math.round(v*pow(e)))<1e-9)return e;return 12};
function truth(w){let n,c;switch(w.task){case'shift':n=w.values[0]*pow(w.shiftExponent);break;case'identifyShift':c=`shift:${Math.round(Math.log10(w.values[1]/w.values[0]))}`;break;case'compare':c=`relation:${near(w.values[0],w.values[1])?'eq':w.values[0]<w.values[1]?'lt':'gt'}`;break;case'decidingPlace':c=`place:${deciding(w.values[0],w.values[1])}`;break;case'round':n=round(w.values.reduce((a,b)=>a+b,0),w.targetExponent);break;case'roundPartsThenSum':n=w.values.map(v=>round(v,w.targetExponent)).reduce((a,b)=>a+b,0);break;case'roundMethod':c='method:exact-then-round';break;case'roundGapCause':{const ds=w.values.map(v=>Math.sign(round(v,w.targetExponent)-v));c=`bias:${ds.every(d=>d>0)?'both-up':ds.every(d=>d<0)?'both-down':'mixed'}`;break}case'decimalDivision':n=w.values[0]/w.values[1];break;case'divisionFirstMove':c=`scale:${scale(w.values[1])}`;break;case'exponentChain':n=w.values.slice(1).reduce((t,v,i)=>w.exponentOps[i]==='add'?t+v:t-v,w.values[0]);break;case'placeExponent':c=`place-exponent:${w.targetExponent}`;break;case'scientificForm':{const e=Math.floor(Math.log10(Math.abs(w.values[0]))),co=clean(w.values[0]/pow(e));c=`scientific:${co}:${e}`;break}case'evaluatePowerTen':n=w.values[0]*pow(w.targetExponent);break;default:throw Error('unknown task '+w.task)}if(n!==undefined){n=clean(n);c=c??`number:${n}`}return{n,c}}
function surfaces(d){return [...d.steps.filter(s=>s.widget).map(s=>({kind:'main',step:s})),...d.remedials.map(r=>({kind:'remedial',step:r.check})).filter(x=>x.step.widget)]}
function clone(x){return JSON.parse(JSON.stringify(x))}
function skeleton(d){const x=clone(d);for(const {step} of surfaces(x))step.widget='__WIDGET__';return x}
function legacyChoices(w){if(w.type==='mcq')return w.options;if(w.type==='placeCompare'){const ans=w.answer;return['lt','eq','gt'].map(id=>({id,label:`${w.left} ${id==='lt'?'<':id==='gt'?'>':'='} ${w.right}`,correct:id===ans,feedback:id===ans?w.successFeedback:(id==='lt'?w.ltFeedback:id==='gt'?w.gtFeedback:w.eqFeedback)}))}throw Error(w.type)}
const errors=[],records=[];let count=0,main=0,remedial=0,variantDeclarations=0;
/* SEAM ALLOWANCE (S203D). A later session may retarget a lesson's recap teaser when a new chapter
 * is inserted after it — esn-01-03 now points at ch1b-exponent-rules-any-base instead of the roots
 * chapter. That is a legitimate authored change and NOT the widget-conversion drift this audit
 * exists to catch, so it is permitted for the listed lessons ONLY on the recap.teaser field: the
 * comparison below neutralises that one field and then still demands byte-equality of everything
 * else. Regenerating the baseline instead would have silently retired the whole check. */
const SEAM_TEASER_ALLOWED=new Set(['esn-01-03']);
function skeletonForCompare(d,id){const x=skeleton(d);if(SEAM_TEASER_ALLOWED.has(id)){const r=x.steps.find(s=>s.kind==='recap');if(r)r.teaser='__SEAM_TEASER__'}return x}
for(const [id,rel] of Object.entries(targets)){
 const before=JSON.parse(readFileSync(join(baseDir,`${id}.json`),'utf8')),after=JSON.parse(readFileSync(join(root,rel),'utf8'));
 if(JSON.stringify(skeletonForCompare(before,id))!==JSON.stringify(skeletonForCompare(after,id)))errors.push(`${id}: non-widget authored structure drift`);
 const b=new Map(surfaces(before).map(x=>[x.step.id,x])),a=new Map(surfaces(after).map(x=>[x.step.id,x]));
 if(b.size!==a.size)errors.push(`${id}: surface count ${a.size}/${b.size}`);
 for(const [sid,oldEntry] of b){const next=a.get(sid);if(!next){errors.push(`${id}/${sid}: missing surface`);continue}const old=oldEntry.step.widget,w=next.step.widget;if(w.type!=='placeValueTransformLab'){errors.push(`${id}/${sid}: fallback ${w.type}`);continue}count++;if(next.kind==='main')main++;else remedial++;
  if(old.prompt!==w.prompt)errors.push(`${id}/${sid}: prompt drift`);
  if(JSON.stringify(oldEntry.step.variant??null)!==JSON.stringify(next.step.variant??null))errors.push(`${id}/${sid}: variant declaration drift`);if(next.step.variant)variantDeclarations++;
  const t=truth(w);let correctId=null;
  if(old.type==='numeric'){
   if(w.answerMode!=='numeric')errors.push(`${id}/${sid}: numeric surface became choice`);
   if(!near(old.answer,t.n,old.tolerance??0))errors.push(`${id}/${sid}: numeric truth mismatch ${old.answer}/${t.n}`);
   if(JSON.stringify(old.commonErrors??[])!==JSON.stringify(w.numericErrors))errors.push(`${id}/${sid}: misconception value/feedback drift`);
   if(old.fallbackFeedback!==w.successFeedback||old.fallbackFeedback!==w.fallbackFeedback)errors.push(`${id}/${sid}: numeric route feedback drift`);
  }else{
   if(w.answerMode!=='choice')errors.push(`${id}/${sid}: choice surface became numeric`);
   const opts=legacyChoices(old),byId=new Map(w.choices.map(c=>[c.id,c]));
   for(const o of opts){const c=byId.get(o.id);if(!c){errors.push(`${id}/${sid}: missing choice ${o.id}`);continue}if(c.label!==o.label)errors.push(`${id}/${sid}/${o.id}: label drift`);if(c.feedback!==o.feedback)errors.push(`${id}/${sid}/${o.id}: feedback drift`);if(o.correct)correctId=o.id}
   const winners=w.choices.filter(c=>(typeof c.value==='number'&&typeof t.n==='number'&&near(c.value,t.n))||c.claim===t.c);
   if(winners.length!==1||winners[0].id!==correctId)errors.push(`${id}/${sid}: independently-derived winner mismatch`);
   if(w.successFeedback!==opts.find(o=>o.correct)?.feedback)errors.push(`${id}/${sid}: success feedback drift`);
  }
  records.push({lesson:id,step:sid,kind:next.kind,task:w.task,answerMode:w.answerMode,promptPreserved:old.prompt===w.prompt,variantPreserved:JSON.stringify(oldEntry.step.variant??null)===JSON.stringify(next.step.variant??null),truth:t});
 }
}
const report={session:145,engine:'placeValueTransformLab',targetLessons:Object.keys(targets),experienceCount:count,mainExperiences:main,remedialExperiences:remedial,variantDeclarationsPreserved:variantDeclarations,records,errors,baselineHashes:Object.fromEntries(Object.keys(targets).map(id=>[id,createHash('sha256').update(readFileSync(join(baseDir,`${id}.json`))).digest('hex')])),passed:count===50&&main===43&&remedial===7&&errors.length===0};
writeFileSync(join(root,'PLACE_VALUE_TRANSFORM_S145.json'),JSON.stringify(report,null,2)+'\n');
let md=`# Session 145 Place-Value Transform Audit\n\n- Lessons: **${report.targetLessons.length}**\n- Authored experiences: **${count}/50**\n- Main experiences: **${main}**\n- Remedial experiences: **${remedial}**\n- Errors: **${errors.length}**\n- Result: **${report.passed?'PASS':'FAIL'}**\n\n## Preserved contract\n\nEvery converted surface preserves its authored prompt, answer, misconception values or labels, feedback routes, step identity, remedial mapping, and seeded variant declaration. Correctness is re-derived from the base-ten truth model rather than copied from an authored correctness flag.\n`;
if(errors.length)md+='\n## Errors\n\n'+errors.map(e=>`- ${e}`).join('\n')+'\n';
writeFileSync(join(root,'PLACE_VALUE_TRANSFORM_S145.md'),md);
if(!report.passed){errors.forEach(e=>console.error(e));process.exit(1)}console.log(`place-value authored audit: ${count}/50; main ${main}; remedial ${remedial}`);
