const fs=require('fs'),assert=require('assert'),ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const V=require('../../src/lib/variants.ts');
const targets=[
['vm-01-01','k3','metric-convert','metricMcq','mcq'],
['vm-01-02','k1','metric-convert','customary','numeric'],['vm-01-02','k2','metric-convert','customary','numeric'],['vm-01-02','k3','metric-convert','customaryMcq','mcq'],['vm-01-02','ch1','metric-convert','customary','numeric'],
['vm-02-01','k1','line-plot','fractionMode','mcq'],['vm-02-01','k2','line-plot','fractionTotal','numeric'],['vm-02-01','k3','line-plot','fractionRange','mcq'],['vm-02-01','ch1','line-plot','atOrAbove','numeric'],
['vm-02-02','k3','line-plot','quarterNumerator','numeric'],
['vm-03-01','k1','box-volume','unitCubes','numeric'],['vm-03-01','k2','box-volume','unitCubes','numeric'],['vm-03-01','k3','box-volume','singleLayer','numeric'],['vm-03-01','ch1','box-volume','stackedCubes','numeric'],
['vm-03-02','k1','box-volume','layers','numeric'],['vm-03-02','k2','box-volume','dimensionsMcq','mcq'],['vm-03-02','k3','box-volume','default','numeric'],['vm-03-02','ch1','box-volume','dimensionsMcq','mcq'],
['vm-04-01','k1','box-volume','layers','numeric'],['vm-04-01','k2','box-volume','layersMcq','mcq'],['vm-04-01','k3','box-volume','layers','numeric'],['vm-04-01','ch1','box-volume','layersMcq','mcq'],
['vm-04-02','k1','box-volume','default','numeric'],['vm-04-02','k2','box-volume','dimensionsMcq','mcq'],['vm-04-02','k3','box-volume','default','numeric'],['vm-04-02','ch1','box-volume','dimensionsMcq','mcq'],
['vm-04-03','k1','box-volume','layers','numeric'],['vm-04-03','k2','box-volume','layers','numeric'],['vm-04-03','k3','box-volume','volumeFormula','mcq'],['vm-04-03','ch1','box-volume','layers','numeric'],
['vm-05-01','k1','box-volume','composite','numeric'],['vm-05-01','k2','box-volume','compositeMcq','mcq'],['vm-05-01','k3','box-volume','composite','numeric'],['vm-05-01','ch1','box-volume','compositeMcq','mcq'],
['vm-05-02','k1','box-volume','composite','numeric'],['vm-05-02','k2','box-volume','composite','numeric'],['vm-05-02','k3','box-volume','composite','numeric'],['vm-05-02','ch1','box-volume','compositeMcq','mcq'],
];
assert.equal(targets.length,38);
const NEG=/^(no|not|wrong|incorrect|sorry|try again|nope)\b/i;
function feedbacks(x,key='',out=[]){if(typeof x==='string'&&/feedback/i.test(key))out.push(x);else if(Array.isArray(x))x.forEach((v,i)=>feedbacks(v,`${key}[${i}]`,out));else if(x&&typeof x==='object')for(const [k,v] of Object.entries(x))feedbacks(v,k,out);return out}
function check(v,surface,where){const w=v.widget;assert.equal(w.type,surface,`${where} surface`);assert(typeof w.prompt==='string'&&w.prompt.length>=12,`${where} prompt`);for(const f of feedbacks(w)){assert(f.length>=25,`${where} short feedback: ${f}`);assert(!NEG.test(f),`${where} negating feedback: ${f}`)}
 if(surface==='numeric'){assert.equal(v.answer,w.answer);assert(Number.isFinite(w.answer));const vals=w.commonErrors.map(e=>e.value);assert.equal(new Set(vals.map(x=>x.toPrecision(14))).size,vals.length,`${where} duplicate numeric traps`);for(const x of vals){assert(Number.isFinite(x));assert(Math.abs(x-w.answer)>w.tolerance,`${where} trap equals answer`);}}
 else if(surface==='mcq'){assert.equal(w.options.filter(o=>o.correct).length,1);assert.equal(new Set(w.options.map(o=>o.label)).size,w.options.length);assert.equal(v.answer,w.options.find(o=>o.correct).id);}
 else throw new Error(`unsupported surface ${surface}`);
}
for(const [lesson,id,gen,form,surface] of targets){const f=`content/courses/volume-measurement/lessons/${lesson}.json`;const d=JSON.parse(fs.readFileSync(f,'utf8'));const step=d.steps.find(s=>s.id===id);assert(step,`${lesson}/${id}`);const expected=form==='default'?{gen}:{gen,form};assert.deepStrictEqual(step.variant,expected,`${lesson}/${id} declaration`);assert.equal(step.widget.type,surface);}
const unique=[...new Map(targets.map(t=>[`${t[2]}@${t[3]}`,{gen:t[2],form:t[3],surface:t[4]}])).values()];
assert.equal(unique.length,18);
let builds=0;
for(const {gen,form,surface} of unique)for(const band of ['support','core','stretch'])for(let i=0;i<180;i++){const seed=`session78:${gen}:${form}:${band}:${i}`;const a=V.variantForGenForm(gen,form,seed,band),b=V.variantForGenForm(gen,form,seed,band);assert.deepStrictEqual(a,b,`${gen}@${form} nondeterministic`);check(a,surface,`${gen}@${form}/${band}/${i}`);builds++;}
let total=0,served=0;for(const f of fs.readdirSync('content/courses/volume-measurement/lessons').filter(x=>x.endsWith('.json'))){const d=JSON.parse(fs.readFileSync(`content/courses/volume-measurement/lessons/${f}`,'utf8'));for(const s of d.steps||[])if(['check','challenge'].includes(s.kind)){total++;if(V.variantForStep(s,`coverage:${f}:${s.id}`,'core'))served++;}}
assert.deepStrictEqual({total,served,gaps:total-served},{total:48,served:48,gaps:0});
console.log(JSON.stringify({targets:targets.length,uniqueForms:unique.length,builds,course:{total,served,gaps:0},status:'PASS'}));
