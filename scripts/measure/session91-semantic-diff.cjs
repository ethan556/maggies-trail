const fs=require('fs'),path=require('path'),assert=require('assert');
const baseRoot=process.env.SESSION91_BASELINE||'/mnt/data/session91_baseline/maggies-trail-session-90';
const curRoot=process.cwd();
const expected=new Map([
 ['functions-g8/lessons/fg-03-01.json','i1'],['functions-g8/lessons/fg-01-03.json','i1'],
 ['sampling-and-probability/lessons/sp-01-02.json','i1'],['data-distributions/lessons/dd-01-03.json','i1'],
 ['bivariate-statistics/lessons/bv-04-03.json','i1'],['shapes-space/lessons/geo-01-02.json','i1'],
 ['shapes-measure-g1/lessons/smg1-03-01.json','i1'],['shapes-shares-g2/lessons/ssg2-01-03.json','i1'],
 ['measure-money-time/lessons/mmt-01-01.json','i1'],['ratios-rates/lessons/rr-02-02.json','e1'],
 ['proportional-relationships/lessons/pr-02-02.json','i1'],['shapes-and-sorting-k/lessons/ks-03-01.json','i1'],
 ['lines-angles/lessons/la-03-03.json','i1'],['lines-angles/lessons/la-02-02.json','i1'],
 ['lines-angles/lessons/la-02-01.json','i1'],['lines-angles/lessons/la-03-02.json','i1'],
]);
const allowed=new Set(['body','widget','cml','predict']);
let files=0,lessons=0,changedSteps=0;
const current=path.join(curRoot,'content/courses'), baseline=path.join(baseRoot,'content/courses');
for(const course of fs.readdirSync(current)){
 const ld=path.join(current,course,'lessons'); if(!fs.existsSync(ld))continue;
 for(const file of fs.readdirSync(ld).filter(x=>x.endsWith('.json'))){lessons++;
  const rel=`${course}/lessons/${file}`, cp=path.join(current,rel), bp=path.join(baseline,rel);
  assert(fs.existsSync(bp),`baseline lesson missing: ${rel}`);
  const a=JSON.parse(fs.readFileSync(bp,'utf8')),b=JSON.parse(fs.readFileSync(cp,'utf8'));
  if(JSON.stringify(a)===JSON.stringify(b)){assert(!expected.has(rel),`expected change missing: ${rel}`);continue;}
  files++;assert(expected.has(rel),`unauthorized changed lesson: ${rel}`);
  const amap=new Map((a.steps||[]).map(s=>[s.id,s])),bmap=new Map((b.steps||[]).map(s=>[s.id,s]));
  assert.deepStrictEqual([...amap.keys()],[...bmap.keys()],`step order/id drift: ${rel}`);
  const diffs=[];
  for(const [id,bs] of bmap){const as=amap.get(id);if(JSON.stringify(as)===JSON.stringify(bs))continue;diffs.push(id);changedSteps++;
    assert.equal(id,expected.get(rel),`unexpected changed step ${rel}/${id}`);
    const keys=new Set([...Object.keys(as),...Object.keys(bs)].filter(k=>JSON.stringify(as[k])!==JSON.stringify(bs[k])));
    for(const k of keys)assert(allowed.has(k),`unauthorized field change ${rel}/${id}/${k}`);
    assert(as.variant===bs.variant||JSON.stringify(as.variant)===JSON.stringify(bs.variant),`variant drift ${rel}/${id}`);
    assert(bs.cml?.flagship===true,`new lab is not flagship ${rel}/${id}`);
  }
  assert.deepStrictEqual(diffs,[expected.get(rel)],`multiple changed steps in ${rel}`);
 }
}
assert.equal(files,expected.size);assert.equal(changedSteps,expected.size);
console.log(JSON.stringify({lessonFilesCompared:lessons,changedLessonFiles:files,changedSteps,allowedFields:[...allowed],status:'PASS'}));
