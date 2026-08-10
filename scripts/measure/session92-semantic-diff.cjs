const fs=require('fs'),path=require('path'),assert=require('assert');
const baseline=process.argv[2];if(!baseline)throw new Error('usage: node session92-semantic-diff.cjs <baseline-root>');
const lock=JSON.parse(fs.readFileSync('scripts/variant-batch/session92-algebra1.lock.json','utf8'));
const variantAllowed=new Set(lock.targets.map(t=>`${t.course}/${t.file}/${t.stepId}`));
const cmlAllowed=new Set([
'exponential-functions/exp-01-02.json/i1','exponents-polynomials/ep-02-02.json/i1','functions-and-sequences/fn-01-01.json/i1','linear-functions/lf-02-01.json/e1',
'quadratics/qu-01-03.json/e1','radicals-and-exponents/rad-04-03.json/i1','solving-equations/alg1-01-01.json/i1','systems-equations/se-01-01.json/i1']);
const courses=['exponential-functions','exponents-polynomials','functions-and-sequences','linear-functions','quadratics','radicals-and-exponents','solving-equations','systems-equations'];
const clone=x=>JSON.parse(JSON.stringify(x));let lessonFiles=0,changedFiles=0,variantAdditions=0,cmlAdditions=0,steps=0;
for(const course of courses){const dir=`content/courses/${course}/lessons`;for(const file of fs.readdirSync(dir).filter(x=>x.endsWith('.json'))){lessonFiles++;const before=JSON.parse(fs.readFileSync(path.join(baseline,dir,file),'utf8')),after=JSON.parse(fs.readFileSync(path.join(dir,file),'utf8'));const b=clone(before),a=clone(after);let changed=false;
 assert.equal(a.steps.length,b.steps.length,`${course}/${file} step count drift`);for(let i=0;i<a.steps.length;i++){steps++;assert.equal(a.steps[i].id,b.steps[i].id,`${course}/${file} step order drift`);const key=`${course}/${file}/${a.steps[i].id}`;
  if(variantAllowed.has(key)){assert.deepStrictEqual(a.steps[i].variant,lock.targets.find(t=>`${t.course}/${t.file}/${t.stepId}`===key)&&{gen:lock.targets.find(t=>`${t.course}/${t.file}/${t.stepId}`===key).gen,form:lock.targets.find(t=>`${t.course}/${t.file}/${t.stepId}`===key).form});delete a.steps[i].variant;delete b.steps[i].variant;variantAdditions++;changed=true;}
  if(cmlAllowed.has(key)){assert(a.steps[i].cml?.flagship===true,`${key} missing CML`);delete a.steps[i].cml;delete b.steps[i].cml;cmlAdditions++;changed=true;}
 }
 assert.deepStrictEqual(a,b,`${course}/${file} unauthorized authored drift`);if(changed)changedFiles++;}}
assert.equal(variantAdditions,295);assert.equal(cmlAdditions,8);
const report={courses:courses.length,lessonFiles,steps,changedFiles,variantAdditions,cmlAdditions,unauthorizedChanges:0,status:'PASS'};
fs.writeFileSync('SESSION92_SEMANTIC_DIFF.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
