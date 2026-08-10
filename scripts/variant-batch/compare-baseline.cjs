const fs=require('fs'),path=require('path'),assert=require('assert');
const baseline=process.argv[2],planPath=process.argv[3];
if(!baseline||!planPath)throw new Error('usage: node compare-baseline.cjs <baseline-root> <plan.json>');
const plan=JSON.parse(fs.readFileSync(planPath,'utf8'));
const lock=JSON.parse(fs.readFileSync(planPath.replace(/\.plan\.json$/,'.lock.json'),'utf8'));
const targetKeys=new Set(lock.targets.map(t=>`${t.course}/${t.file}/${t.stepId}`));
const canonical=(v,dropVariant=false)=>{if(Array.isArray(v))return v.map(x=>canonical(x,dropVariant));if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().filter(k=>!(dropVariant&&k==='variant')).map(k=>[k,canonical(v[k],dropVariant)]));return v};
let files=0,steps=0,variantAdditions=0;
for(const course of plan.courses){
 const currentDir=path.join('content','courses',course,'lessons'),baseDir=path.join(baseline,currentDir);
 const names=fs.readdirSync(currentDir).filter(x=>x.endsWith('.json')).sort();
 assert.deepStrictEqual(names,fs.readdirSync(baseDir).filter(x=>x.endsWith('.json')).sort(),`${course}: lesson file set drift`);
 for(const file of names){files++;const a=JSON.parse(fs.readFileSync(path.join(baseDir,file),'utf8')),b=JSON.parse(fs.readFileSync(path.join(currentDir,file),'utf8'));
  assert.deepStrictEqual(canonical(a,true),canonical(b,true),`${course}/${file}: authored lesson drift`);
  const aBy=new Map((a.steps||[]).map(s=>[s.id,s]));
  for(const s of b.steps||[]){steps++;const old=aBy.get(s.id);assert(old,`${course}/${file}/${s.id}: new step`);const key=`${course}/${file}/${s.id}`,target=targetKeys.has(key);
   if(target){assert(!Object.hasOwn(old,'variant'),`${key}: baseline already had declaration`);assert(Object.hasOwn(s,'variant'),`${key}: declaration missing`);variantAdditions++;}
   else assert.deepStrictEqual(old.variant,s.variant,`${key}: non-target declaration drift`);
  }
 }
}
assert.equal(variantAdditions,lock.targets.length,'target addition count');
console.log(JSON.stringify({courses:plan.courses.length,lessonFiles:files,steps,variantAdditions,authoredChanges:0,nonTargetDeclarationChanges:0,status:'PASS'}));
