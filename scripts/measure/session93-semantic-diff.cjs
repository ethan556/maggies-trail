const fs=require('fs'),path=require('path'),assert=require('assert');
const baseline=process.argv[2];if(!baseline)throw new Error('usage: node session93-semantic-diff.cjs <baseline-root>');
const lock=JSON.parse(fs.readFileSync('scripts/variant-batch/session93-algebra2.lock.json','utf8'));
const variantAllowed=new Set(lock.targets.map(t=>`${t.course}/${t.file}/${t.stepId}`));
const cmlAllowed=new Set([
'complex-numbers/cn-03-02.json/i1','function-transformations/ft-03-01.json/i1','logarithms/lg-01-03.json/i1','polynomial-functions/pf-02-02.json/i1','radical-functions/re-04-02.json/i1','rational-functions/rf-04-02.json/i1','sequences-series/sr-05-01.json/i1','statistical-inference/si-02-02.json/i1','trig-functions/tf-03-02.json/i1']);
const predictionAllowed=new Set(['logarithms/lg-01-03.json/i1','radical-functions/re-04-02.json/i1','sequences-series/sr-05-01.json/i1','statistical-inference/si-02-02.json/i1']);
const courses=['complex-numbers','function-transformations','logarithms','polynomial-functions','radical-functions','rational-functions','sequences-series','statistical-inference','trig-functions'];
const clone=x=>JSON.parse(JSON.stringify(x));let lessonFiles=0,changedFiles=0,variantAdditions=0,cmlAdditions=0,predictionAdditions=0,steps=0;
const lockMap=new Map(lock.targets.map(t=>[`${t.course}/${t.file}/${t.stepId}`,{gen:t.gen,form:t.form}]));
for(const course of courses){const dir=`content/courses/${course}/lessons`;for(const file of fs.readdirSync(dir).filter(x=>x.endsWith('.json'))){lessonFiles++;const before=JSON.parse(fs.readFileSync(path.join(baseline,dir,file),'utf8')),after=JSON.parse(fs.readFileSync(path.join(dir,file),'utf8'));const b=clone(before),a=clone(after);let changed=false;
 assert.equal(a.steps.length,b.steps.length,`${course}/${file} step count drift`);for(let i=0;i<a.steps.length;i++){steps++;assert.equal(a.steps[i].id,b.steps[i].id,`${course}/${file} step order drift`);const key=`${course}/${file}/${a.steps[i].id}`;
  if(variantAllowed.has(key)){assert.deepStrictEqual(a.steps[i].variant,lockMap.get(key),`${key} declaration mismatch`);assert(!b.steps[i].variant,`${key} baseline already served`);delete a.steps[i].variant;delete b.steps[i].variant;variantAdditions++;changed=true;}
  if(cmlAllowed.has(key)){assert(a.steps[i].cml?.flagship===true,`${key} missing CML`);assert(!b.steps[i].cml,`${key} baseline already had CML`);delete a.steps[i].cml;delete b.steps[i].cml;cmlAdditions++;changed=true;}
  if(predictionAllowed.has(key)){assert(a.steps[i].predict,`${key} missing prediction`);assert(!b.steps[i].predict,`${key} baseline already had prediction`);delete a.steps[i].predict;delete b.steps[i].predict;predictionAdditions++;changed=true;}
 }
 assert.deepStrictEqual(a,b,`${course}/${file} unauthorized authored drift`);if(changed)changedFiles++;}}
assert.equal(variantAdditions,405);assert.equal(cmlAdditions,9);assert.equal(predictionAdditions,4);
const report={courses:courses.length,lessonFiles,steps,changedFiles,variantAdditions,cmlAdditions,predictionAdditions,unauthorizedChanges:0,status:'PASS'};
fs.writeFileSync('SESSION93_SEMANTIC_DIFF.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
