const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true }
}).outputText, f);
const V = require('../../src/lib/variants.ts');

const targets = [
  ['decimal-operations','dop-01-01','k1','grouping-first','mulAddEval','evalOrder'],
  ['decimal-operations','dop-01-01','k2','grouping-first','mulSubNumeric','numeric'],
  ['decimal-operations','dop-01-01','k3','grouping-first','divAddNumeric','numeric'],
  ['decimal-operations','dop-01-01','ch1','grouping-first','mulAddEval','evalOrder'],
  ['decimal-operations','dop-01-03','k1','grouping-first','wordSubtractMultiply','numeric'],
  ['decimal-operations','dop-01-03','k2','grouping-first','doubleAddEval','evalOrder'],
  ['decimal-operations','dop-01-03','k3','grouping-first','groupPhraseMcq','mcq'],
  ['decimal-operations','dop-01-03','ch1','grouping-first','wordSubtractMultiply','numeric'],
  ['decimal-operations','dop-02-02','k1','partial-products','carryContinue','numeric'],
  ['decimal-operations','dop-02-02','k2','partial-products','carryScaffold','numeric'],
  ['decimal-operations','dop-02-02','k3','partial-products','carryColumn','columnCalc'],
  ['decimal-operations','dop-02-02','ch1','partial-products','carryBare','numeric'],
  ['fractions-multiply','fm-01-02','k1','frac-unlike-addsub','addNumerator','numeric'],
  ['fractions-multiply','fm-01-03','k1','frac-unlike-addsub','subNumerator','numeric'],
  ['fractions-multiply','fm-02-01','k1','whole-times-fraction','numeratorOnly','numeric'],
  ['fractions-multiply','fm-03-01','k1','frac-multiply','unitGrid','fractionGrid'],
  ['fractions-multiply','fm-03-01','k2','frac-multiply','unitGrid','fractionGrid'],
  ['fractions-multiply','fm-03-01','k3','frac-multiply','areaCompare','mcq'],
  ['fractions-multiply','fm-03-01','ch1','frac-multiply','areaGrid','fractionGrid'],
  ['fractions-multiply','fm-03-02','k1','frac-multiply','areaGrid','fractionGrid'],
  ['fractions-multiply','fm-03-03','k1','frac-multiply','denominatorOnly','numeric'],
  ['fractions-multiply','fm-04-01','k1','fraction-scaling','singleCompare','mcq'],
  ['fractions-multiply','fm-04-01','k2','fraction-scaling','singleCompare','mcq'],
  ['fractions-multiply','fm-04-01','k3','fraction-scaling','singleCompare','mcq'],
  ['fractions-multiply','fm-04-01','ch1','fraction-scaling','singleCompare','mcq'],
  ['fractions-multiply','fm-04-02','k1','fraction-scaling','singleCompare','mcq'],
  ['fractions-multiply','fm-04-02','k2','fraction-scaling','pairCompare','mcq'],
  ['fractions-multiply','fm-04-02','k3','fraction-scaling','largestThree','mcq'],
  ['fractions-multiply','fm-04-02','ch1','fraction-scaling','pairCompare','mcq'],
  ['fractions-multiply','fm-05-01','k1','unit-frac-divide','wholeCountNumeric','numeric'],
  ['fractions-multiply','fm-05-01','ch1','unit-frac-divide','wholeCountNumeric','numeric'],
  ['fractions-multiply','fm-05-02','k1','unit-frac-divide','unitDenominatorNumeric','numeric'],
  ['fractions-multiply','fm-05-03','k1','unit-frac-divide','shareDenominatorNumeric','numeric'],
  ['fractions-multiply','fm-05-03','k2','unit-frac-divide','scoopsComputation','mcq'],
  ['fractions-multiply','fm-05-03','k3','unit-frac-divide','servingsNumeric','numeric'],
];
assert.equal(targets.length, 35);

function labels(w) { return w.options.map(o => o.label); }
function correctLabel(w) { const c = w.options.filter(o => o.correct); assert.equal(c.length,1); return c[0].label; }
function mul(a,b) { let t=0; for(let i=0;i<b;i++) t+=a; return t; }
function divi(a,b) { let q=0; while(a>=b){a-=b;q++;} return q; }
function gcd(a,b){ while(b){[a,b]=[b,a%b]} return Math.abs(a); }

function truth(gen, form, w) {
  const p = w.prompt;
  let m;
  if (gen === 'grouping-first') {
    if (form === 'mulAddEval') { m=p.match(/what is (\d+) \+ (\d+) × (\d+)/i); return Number(m[1])+mul(Number(m[2]),Number(m[3])); }
    if (form === 'mulSubNumeric') { m=p.match(/What is (\d+) − (\d+) × (\d+)/); return Number(m[1])-mul(Number(m[2]),Number(m[3])); }
    if (form === 'divAddNumeric') { m=p.match(/What is (\d+) ÷ (\d+) \+ (\d+)/); return divi(Number(m[1]),Number(m[2]))+Number(m[3]); }
    if (form === 'doubleAddEval') { m=p.match(/Double (\d+), then add (\d+)/); return mul(Number(m[1]),2)+Number(m[2]); }
    if (form === 'wordSubtractMultiply') { m=p.match(/Subtract (\d+) from (\d+), then multiply by (\d+)/); return mul(Number(m[2])-Number(m[1]),Number(m[3])); }
    if (form === 'groupPhraseMcq') { m=p.match(/\((\d+) \+ (\d+)\) × (\d+)/); return labels(w).find(x=>x===`${m[3]} times the sum of ${m[1]} and ${m[2]}`); }
  }
  if (gen === 'partial-products') { m=p.match(/(\d+) × (\d)/); return mul(Number(m[1]),Number(m[2])); }
  if (gen === 'frac-unlike-addsub') { m=p.match(/rewritten is (\d+)\/(\d+) ([+−]) (\d+)\/(\d+)/); return m[3]==='+'?Number(m[1])+Number(m[4]):Number(m[1])-Number(m[4]); }
  if (gen === 'whole-times-fraction') { m=p.match(/^(\d+) × (\d+)\/(\d+)/); return mul(Number(m[2]),Number(m[1])); }
  if (gen === 'frac-multiply') {
    if (form === 'unitGrid' || form === 'areaGrid') { m=p.match(/(\d+)\/(\d+) × (\d+)\/(\d+)/); return {rows:Number(m[2]),cols:Number(m[4]),shadeR:Number(m[1]),shadeC:Number(m[3])}; }
    if (form === 'areaCompare') return labels(w).find(x=>x.startsWith('Smaller than both'));
    m=p.match(/= (\d+)\/(\d+)\. In lowest terms this is 1 over/); return Number(m[2])/gcd(Number(m[1]),Number(m[2]));
  }
  if (gen === 'fraction-scaling') {
    if (form === 'singleCompare') { m=p.match(/Is (\d+) × (\d+)\/(\d+)/); const [base,n,d]=m.slice(1).map(Number); return labels(w).find(x=>x===(n<d?`Smaller than ${base}`:n===d?`Exactly ${base}`:`Bigger than ${base}`)); }
    if (form === 'pairCompare') { m=p.match(/Which is bigger: (\d+)\/(\d+) × (\d+) or (\d+)\/(\d+) × (\d+)/); const left=Number(m[1])*Number(m[5])>Number(m[4])*Number(m[2]); return labels(w).find(x=>x===(left?`${m[1]}/${m[2]} × ${m[3]}`:`${m[4]}/${m[5]} × ${m[6]}`)); }
    const candidates=labels(w).map(label=>{const mm=label.match(/(\d+)\/(\d+) × (\d+)/);return {label,n:Number(mm[1]),d:Number(mm[2]),b:Number(mm[3])}}); let best=candidates[0]; for(const x of candidates.slice(1)) if(x.n*x.b*best.d>best.n*best.b*x.d)best=x; return best.label;
  }
  if (gen === 'unit-frac-divide') {
    if (form === 'unitDenominatorNumeric' || form === 'shareDenominatorNumeric') { m=p.match(/1\/(\d+).*(?:into|among) (\d+)/); return mul(Number(m[1]),Number(m[2])); }
    if (form === 'scoopsComputation') { m=p.match(/1\/(\d+)-cup scoops fit in (\d+) cups/); return labels(w).find(x=>x===`${m[2]} ÷ 1/${m[1]}`); }
    m=p.match(/1\/(\d+).*?(\d+) (?:cups|wholes)|^(\d+) ÷ 1\/(\d+)/);
    const u=Number(m[1]||m[4]), whole=Number(m[2]||m[3]); return mul(u,whole);
  }
  throw new Error(`no truth route ${gen}@${form}`);
}

function assertWidget(v, expected, where) {
  const w=v.widget;
  assert.equal(w.type, expected, `${where} surface`);
  const want=truth(v.tag, where.split('@')[1].split('/')[0], w);
  if (w.type !== 'mcq') assert.deepStrictEqual(v.answer,want,`${where} answer mismatch`);
  if (w.type==='numeric') {
    assert.equal(w.answer,want); const vals=w.commonErrors.map(x=>x.value); assert.equal(new Set(vals).size,vals.length); assert(vals.every(x=>x!==want));
  } else if (w.type==='mcq') {
    assert.equal(correctLabel(w),want); assert.equal(w.options.find(o=>o.correct).id,v.answer); assert.equal(new Set(labels(w)).size,w.options.length);
  } else if (w.type==='columnCalc') {
    assert.equal(w.op,'multiply'); assert.equal(mul(w.a,w.b),want); assert(w.commonResults.every(x=>x.value!==want));
  } else if (w.type==='evalOrder') {
    assert.equal(w.target,want); assert(w.tokens.length>1); assert(w.commonResults.every(x=>x.value!==want));
  } else if (w.type==='fractionGrid') {
    assert.deepStrictEqual({rows:w.den1,cols:w.den2,shadeR:w.num1,shadeC:w.num2},want); assert(w.num1<w.den1 && w.num2<w.den2); assert(w.commonBuilds.every(x=>JSON.stringify(x)!==JSON.stringify(want)));
  }
}

for (const [course,lesson,id,gen,form,surface] of targets) {
  const file=`content/courses/${course}/lessons/${lesson}.json`;
  const data=JSON.parse(fs.readFileSync(file,'utf8'));
  const step=data.steps.find(s=>s.id===id); assert(step,`${lesson}/${id} missing`);
  assert.deepStrictEqual(step.variant,{gen,form},`${lesson}/${id} declaration`);
  assert.equal(step.widget.type,surface,`${lesson}/${id} authored surface`);
}

let builds=0;
const unique=[...new Map(targets.map(t=>[`${t[3]}@${t[4]}`,{gen:t[3],form:t[4],surface:t[5]}])).values()];
for (const {gen,form,surface} of unique) for (const band of ['support','core','stretch']) for(let i=0;i<120;i++) {
  const seed=`session75:${gen}:${form}:${band}:${i}`;
  const a=V.variantForGenForm(gen,form,seed,band), b=V.variantForGenForm(gen,form,seed,band);
  assert.deepStrictEqual(a,b,`${gen}@${form}/${band}/${i} nondeterministic`);
  assertWidget(a,surface,`${gen}@${form}/${band}/${i}`); builds++;
}

function courseCoverage(course){
  let total=0, served=0;
  for(const f of fs.readdirSync(`content/courses/${course}/lessons`).filter(x=>x.endsWith('.json'))){
    const d=JSON.parse(fs.readFileSync(`content/courses/${course}/lessons/${f}`,'utf8'));
    for(const s of d.steps||[]) if(['check','challenge'].includes(s.kind)){total++; if(s.variant)served++;}
  }
  return {total,served,gaps:total-served};
}
const decimal=courseCoverage('decimal-operations');
const fractions=courseCoverage('fractions-multiply');
assert.deepStrictEqual(decimal,{total:58,served:58,gaps:0});
assert.deepStrictEqual(fractions,{total:52,served:52,gaps:0});
console.log(JSON.stringify({targets:targets.length,uniqueForms:unique.length,builds,decimal,fractions,status:'PASS'}));
