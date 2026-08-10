const fs=require('fs'),path=require('path'),assert=require('assert');
const baseline=process.argv[2]; if(!baseline) throw new Error('usage: node session90-semantic-diff.cjs <session89-root>');
const allowed=new Map([
 ['measure-money-time/mmt-01-01/i1',new Set(['body','widget'])],
 ['measure-money-time/mmt-01-01/i2',new Set(['body','widget'])],
 ['measure-money-time/mmt-01-01/i3',new Set(['body','widget'])],
 ['coordinate-geometry/cg-03-02/i1',new Set(['body','widget','cml'])],
 ['functions-g8/fg-01-03/i1',new Set(['body','widget','cml'])]
]);
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
let lessonFiles=0,steps=0,changedSteps=0,changedFiles=0;
for(const course of fs.readdirSync('content/courses').sort()){
 const curDir=path.join('content','courses',course,'lessons'), baseDir=path.join(baseline,'content','courses',course,'lessons');
 if(!fs.existsSync(curDir)||!fs.existsSync(baseDir)) continue;
 const names=fs.readdirSync(curDir).filter(f=>f.endsWith('.json')).sort();
 assert.deepStrictEqual(names,fs.readdirSync(baseDir).filter(f=>f.endsWith('.json')).sort(),`${course}: file-set drift`);
 for(const file of names){lessonFiles++; const cur=JSON.parse(fs.readFileSync(path.join(curDir,file),'utf8')), old=JSON.parse(fs.readFileSync(path.join(baseDir,file),'utf8'));
  assert.equal(cur.steps.length,old.steps.length,`${course}/${file}: step-count drift`); let fileChanged=false;
  for(let i=0;i<cur.steps.length;i++){steps++; const a=structuredClone(cur.steps[i]),b=structuredClone(old.steps[i]); assert.equal(a.id,b.id,`${course}/${file}: step order drift`);
   const key=`${course}/${path.basename(file,'.json')}/${a.id}`, keys=allowed.get(key);
   if(keys){for(const k of keys){assert.notDeepStrictEqual(canonical(a[k]),canonical(b[k]),`${key}: expected ${k} change missing`); delete a[k];delete b[k];} changedSteps++;fileChanged=true;}
   assert.deepStrictEqual(canonical(a),canonical(b),`${key}: drift outside approved fields`);
  }
  if(fileChanged)changedFiles++;
 }
}
assert.equal(changedSteps,allowed.size,'approved-step count');assert.equal(changedFiles,3,'changed lesson-file count');
console.log(JSON.stringify({lessonFiles,steps,changedFiles,changedSteps,authoredDriftOutsideApprovedFields:0,status:'PASS'}));
