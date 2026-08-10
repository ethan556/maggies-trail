const fs=require('fs'),assert=require('assert'),ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const V=require('../../src/lib/variants.ts');
const targets=[
['asv-01-01','k2','triangle-area-calc','heightMeaning','mcq'],
['asv-01-02','k1','area-formula-pick','parallelogramMcq','mcq'],
['asv-01-03','k3','area-formula-pick','trapezoidAverage','mcq'],
['asv-03-01','k1','coordinate-plot','asvAxisDistance','numeric'],['asv-03-01','k2','coordinate-plot','asvAxisDistance','numeric'],['asv-03-01','k3','coordinate-plot','asvAxisDistance','numeric'],['asv-03-01','ch1','coordinate-plot','cgRectangleCorner','mcq'],
['asv-03-02','k1','triangle-area-calc','coordinateRightTriangle','numeric'],['asv-03-02','k2','area-formula-pick','coordinateRectangle','numeric'],['asv-03-02','k3','triangle-area-calc','coordinateRightTriangle','numeric'],['asv-03-02','ch1','triangle-area-calc','coordinateRightTriangle','numeric'],
['asv-03-03','k1','triangle-area-calc','coordinateRightTriangle','numeric'],['asv-03-03','k2','area-compose','attachedAreas','numeric'],['asv-03-03','k3','area-formula-pick','coordinateRectangle','numeric'],['asv-03-03','ch1','area-compose','coordinateComposite','numeric'],
['asv-04-03','k1','box-surface-area','roomPaint','numeric'],['asv-04-03','k2','box-volume','whichMeasure','mcq'],['asv-04-03','k3','prism-surface-area','tentFabric','numeric'],['asv-04-03','ch1','box-surface-area','sameVolumeDifference','numeric'],
['asv-05-03','k1','fraction-volume','planterDecimal','numeric'],['asv-05-03','k2','box-volume','fitBoxes','numeric'],['asv-05-03','k3','box-volume','missingHeight','numeric'],['asv-05-03','ch1','fraction-volume','bucketTrips','numeric'],
];
assert.equal(targets.length,23);
const NEG=/^(no|not|wrong|incorrect|sorry|try again|nope)\b/i;
function feedbacks(x,key='',out=[]){if(typeof x==='string'&&/feedback/i.test(key))out.push(x);else if(Array.isArray(x))x.forEach((v,i)=>feedbacks(v,`${key}[${i}]`,out));else if(x&&typeof x==='object')for(const [k,v] of Object.entries(x))feedbacks(v,k,out);return out}
function check(v,surface,where){const w=v.widget;assert.equal(w.type,surface,`${where} surface`);assert(typeof w.prompt==='string'&&w.prompt.length>=12,`${where} prompt`);for(const f of feedbacks(w)){assert(f.length>=25,`${where} short feedback: ${f}`);assert(!NEG.test(f),`${where} negating feedback: ${f}`)}
 if(surface==='numeric'){assert.equal(v.answer,w.answer);assert(Number.isFinite(w.answer));assert(Number.isFinite(w.tolerance)&&w.tolerance>=0);assert(Array.isArray(w.commonErrors)&&w.commonErrors.length>=2,`${where} missing numeric traps`);const vals=w.commonErrors.map(e=>e.value);assert.equal(new Set(vals.map(x=>Number(x).toPrecision(14))).size,vals.length,`${where} duplicate numeric traps`);for(const x of vals){assert(Number.isFinite(x));assert(Math.abs(x-w.answer)>w.tolerance,`${where} trap equals answer`);}}
 else if(surface==='mcq'){assert(Array.isArray(w.options)&&w.options.length>=3,`${where} too few options`);assert.equal(w.options.filter(o=>o.correct).length,1);assert.equal(new Set(w.options.map(o=>o.label)).size,w.options.length,`${where} duplicate labels`);assert.equal(new Set(w.options.map(o=>o.id)).size,w.options.length,`${where} duplicate ids`);assert.equal(v.answer,w.options.find(o=>o.correct).id);}
 else throw new Error(`unsupported surface ${surface}`);
}
for(const [lesson,id,gen,form,surface] of targets){const f=`content/courses/area-surface-volume/lessons/${lesson}.json`;const d=JSON.parse(fs.readFileSync(f,'utf8'));const step=d.steps.find(s=>s.id===id);assert(step,`${lesson}/${id}`);assert.deepStrictEqual(step.variant,{gen,form},`${lesson}/${id} declaration`);assert.equal(step.widget.type,surface);}
const unique=[...new Map(targets.map(t=>[`${t[2]}@${t[3]}`,{gen:t[2],form:t[3],surface:t[4]}])).values()];
assert.equal(unique.length,17);
let builds=0;
for(const {gen,form,surface} of unique)for(const band of ['support','core','stretch'])for(let i=0;i<180;i++){const seed=`session79:${gen}:${form}:${band}:${i}`;const a=V.variantForGenForm(gen,form,seed,band),b=V.variantForGenForm(gen,form,seed,band);assert(a,`${gen}@${form} returned null`);assert.deepStrictEqual(a,b,`${gen}@${form} nondeterministic`);check(a,surface,`${gen}@${form}/${band}/${i}`);builds++;}
let total=0,served=0;for(const f of fs.readdirSync('content/courses/area-surface-volume/lessons').filter(x=>x.endsWith('.json'))){const d=JSON.parse(fs.readFileSync(`content/courses/area-surface-volume/lessons/${f}`,'utf8'));for(const s of d.steps||[])if(['check','challenge'].includes(s.kind)){total++;if(V.variantForStep(s,`coverage:${f}:${s.id}`,'core'))served++;}}
assert.deepStrictEqual({total,served,gaps:total-served},{total:61,served:61,gaps:0});
console.log(JSON.stringify({targets:targets.length,uniqueForms:unique.length,builds,course:{total,served,gaps:0},status:'PASS'}));
