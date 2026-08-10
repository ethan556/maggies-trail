const fs=require('fs'),path=require('path'),crypto=require('crypto');
const ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const V=require('../../src/lib/variants.ts');
const planPath=process.argv[2]; if(!planPath) throw new Error('usage: node compile.cjs <plan.json>');
const plan=JSON.parse(fs.readFileSync(planPath,'utf8'));
const canonical=(v)=>{if(Array.isArray(v))return v.map(canonical);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().filter(k=>k!=='variant').map(k=>[k,canonical(v[k])]));return v};
const digest=(v)=>crypto.createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
const targets=[]; const baseline={};
for(const course of plan.courses){const dir=`content/courses/${course}/lessons`;let total=0,served=0;
 for(const file of fs.readdirSync(dir).filter(x=>x.endsWith('.json')).sort()){
  const full=path.join(dir,file),doc=JSON.parse(fs.readFileSync(full,'utf8'));let changed=false;
  for(const step of doc.steps||[]) if(['check','challenge'].includes(step.kind)){
   total++; const seed=`${plan.id}:baseline:${course}:${file}:${step.id}`;
   if(V.variantForStep(step,seed,'core')){served++;continue;}
   const surface=step.widget?.type,key=`${course}|${step.conceptTag}|${surface}`,selector=plan.selectors[key];
   if(!selector) throw new Error(`unmapped runtime gap ${course}/${file}/${step.id}: ${key}`);
   if(step.variant) throw new Error(`runtime gap already has unusable declaration ${course}/${file}/${step.id}`);
   const hash=digest(step); step.variant={gen:selector.gen,form:selector.form}; changed=true;
   targets.push({course,file,stepId:step.id,kind:step.kind,conceptTag:step.conceptTag,surface,gen:selector.gen,form:selector.form,authoredHash:hash});
  }
  if(changed) fs.writeFileSync(full,JSON.stringify(doc,null,1)+'\n');
 }
 baseline[course]={total,served,gaps:total-served};
}
if(targets.length!==plan.expectedGaps)throw new Error(`expected ${plan.expectedGaps} gaps, compiled ${targets.length}`);
const used=new Set(targets.map(t=>`${t.course}|${t.conceptTag}|${t.surface}`));
const unused=Object.keys(plan.selectors).filter(k=>!used.has(k));if(unused.length)throw new Error(`unused selectors: ${unused.join(', ')}`);
const lock={schemaVersion:1,id:plan.id,session:plan.session,grade:plan.grade,compiledAt:new Date().toISOString(),planPath:path.relative(process.cwd(),planPath),baseline,targets};
const lockPath=planPath.replace(/\.plan\.json$/,'.lock.json');fs.writeFileSync(lockPath,JSON.stringify(lock,null,2)+'\n');
console.log(JSON.stringify({id:plan.id,targets:targets.length,selectors:used.size,baseline,lockPath,status:'PASS'}));
