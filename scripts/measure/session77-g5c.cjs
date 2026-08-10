const fs=require('fs'),assert=require('assert'),ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const V=require('../../src/lib/variants.ts');
const targets=[
['cg-01-01','k1','coordinate-plot','cgOrigin','pointEntry'],['cg-01-01','k3','coordinate-plot','cgYCoordinate','numeric'],['cg-01-01','ch1','coordinate-plot','cgVerticalAlignment','mcq'],
['cg-01-02','k3','coordinate-plot','cgAxisDistance','numeric'],['cg-01-02','ch1','coordinate-plot','cgRectangleCorner','mcq'],
['cg-01-03','k1','coordinate-plot','cgAxisDistance','numeric'],['cg-01-03','k2','coordinate-plot','cgContextRead','mcq'],['cg-01-03','k3','coordinate-plot','cgPathLength','numeric'],['cg-01-03','ch1','coordinate-plot','cgContextRead','mcq'],
['cg-02-01','k1','proportional-plot','cgPairNext','numeric'],['cg-02-01','k2','proportional-plot','cgPairRelation','mcq'],['cg-02-01','k3','proportional-plot','cgPairValue','numeric'],['cg-02-01','ch1','proportional-plot','cgPairRelation','mcq'],
['cg-02-02','k1','proportional-plot','default','plotPoint'],['cg-02-02','k2','proportional-plot','cgPairLineReason','mcq'],['cg-02-02','k3','proportional-plot','cgPairValue','numeric'],['cg-02-02','ch1','proportional-plot','cgPairPointAtX','mcq'],
['cg-03-01','k1','shape-hierarchy','cgInheritProperty','mcq'],['cg-03-01','k2','shape-hierarchy','cgInheritanceDirection','mcq'],['cg-03-01','k3','shape-hierarchy','cgInheritProperty','mcq'],['cg-03-01','ch1','shape-hierarchy','cgInheritanceChain','mcq'],
['cg-03-02','k1','attributes','cgSquareExtra','mcq'],['cg-03-02','k2','shape-hierarchy','cgParallelogramTrapezoid','mcq'],['cg-03-02','k3','quadrilaterals','cgEqualSidePerimeter','numeric'],['cg-03-02','ch1','shape-hierarchy','hierarchyTruth','mcq'],
['cg-03-03','k1','attributes','cgTriangleAngleFamily','mcq'],['cg-03-03','k2','angle-sum','cgTriangleEqualAngle','numeric'],['cg-03-03','k3','attributes','cgTriangleSideHierarchy','mcq'],['cg-03-03','ch1','attributes','cgTriangleDualLabel','mcq'],
['cg-04-01','k1','quadrilaterals','cgGuaranteedRhombus','mcq'],['cg-04-01','k2','quadrilaterals','cgParallelogramNotGuaranteed','mcq'],['cg-04-01','k3','quadrilaterals','trapezoidByParallel','mcq'],['cg-04-01','ch1','sorting-rules','bothRules','mcq'],
['cg-04-02','k1','shape-hierarchy','cgSquareRhombusAlways','mcq'],['cg-04-02','k2','attributes','cgEquilateralRightNever','mcq'],['cg-04-02','k3','shape-hierarchy','cgParallelogramTrapezoid','mcq'],['cg-04-02','ch1','shape-hierarchy','cgRhombusRectangleSometimes','mcq'],
];
assert.equal(targets.length,37);
const NEG=/^(no|not|wrong|incorrect|sorry|try again|nope)\b/i;
function feedbacks(x,key='',out=[]){if(typeof x==='string'&&/feedback/i.test(key))out.push(x);else if(Array.isArray(x))x.forEach((v,i)=>feedbacks(v,`${key}[${i}]`,out));else if(x&&typeof x==='object')for(const [k,v] of Object.entries(x))feedbacks(v,k,out);return out}
function keyPoint(p){return `${p.x},${p.y}`}
function check(v,surface,where){const w=v.widget;assert.equal(w.type,surface,`${where} surface`);assert(typeof w.prompt==='string'&&w.prompt.length>=12,`${where} prompt`);for(const f of feedbacks(w)){assert(f.length>=25,`${where} short feedback: ${f}`);assert(!NEG.test(f),`${where} negating feedback: ${f}`)}
 if(surface==='numeric'){assert.equal(v.answer,w.answer);assert(Number.isFinite(w.answer));const vals=w.commonErrors.map(e=>e.value);assert.equal(new Set(vals.map(x=>x.toPrecision(14))).size,vals.length,`${where} duplicate numeric traps`);for(const x of vals){assert(Number.isFinite(x));assert(Math.abs(x-w.answer)>w.tolerance,`${where} trap equals answer`);}}
 else if(surface==='mcq'){assert.equal(w.options.filter(o=>o.correct).length,1);assert.equal(new Set(w.options.map(o=>o.label)).size,w.options.length);assert.equal(v.answer,w.options.find(o=>o.correct).id);}
 else if(surface==='pointEntry'){assert.deepStrictEqual(v.answer,w.answer);assert(Array.isArray(w.answer));const ans=w.answer.join(',');const traps=w.commonEntries.map(e=>e.values.join(','));assert.equal(new Set(traps).size,traps.length);assert(!traps.includes(ans));for(const e of w.commonEntries)assert.equal(e.values.length,w.answer.length);}
 else if(surface==='plotPoint'){assert.deepStrictEqual(v.answer,w.targets);const want=new Set(w.targets.map(keyPoint));assert.equal(want.size,w.targets.length,`${where} duplicate targets`);for(const p of w.targets){assert(p.x>=1&&p.x<=w.cols&&p.y>=1&&p.y<=w.rows,`${where} target off-grid`)}const errs=w.pointErrors.map(keyPoint);assert.equal(new Set(errs).size,errs.length,`${where} duplicate point traps`);for(const e of w.pointErrors){assert(e.x>=1&&e.x<=w.cols&&e.y>=1&&e.y<=w.rows,`${where} trap off-grid`);assert(!want.has(keyPoint(e)),`${where} trap is target`);}}
 else throw new Error(`unsupported surface ${surface}`);
}
for(const [lesson,id,gen,form,surface] of targets){const f=`content/courses/coordinate-geometry/lessons/${lesson}.json`;const d=JSON.parse(fs.readFileSync(f,'utf8'));const step=d.steps.find(s=>s.id===id);assert(step,`${lesson}/${id}`);const expected=form==='default'?{gen}:{gen,form};assert.deepStrictEqual(step.variant,expected,`${lesson}/${id} declaration`);assert.equal(step.widget.type,surface);}
const unique=[...new Map(targets.map(t=>[`${t[2]}@${t[3]}`,{gen:t[2],form:t[3],surface:t[4]}])).values()];
let builds=0;
for(const {gen,form,surface} of unique)for(const band of ['support','core','stretch'])for(let i=0;i<120;i++){const seed=`session77:${gen}:${form}:${band}:${i}`;const a=V.variantForGenForm(gen,form,seed,band),b=V.variantForGenForm(gen,form,seed,band);assert.deepStrictEqual(a,b,`${gen}@${form} nondeterministic`);check(a,surface,`${gen}@${form}/${band}/${i}`);builds++;}
let total=0,served=0;for(const f of fs.readdirSync('content/courses/coordinate-geometry/lessons').filter(x=>x.endsWith('.json'))){const d=JSON.parse(fs.readFileSync(`content/courses/coordinate-geometry/lessons/${f}`,'utf8'));for(const s of d.steps||[])if(['check','challenge'].includes(s.kind)){total++;if(V.variantForStep(s,`coverage:${f}:${s.id}`,'core'))served++;}}
assert.deepStrictEqual({total,served,gaps:total-served},{total:40,served:40,gaps:0});
console.log(JSON.stringify({targets:targets.length,uniqueForms:unique.length,builds,course:{total,served,gaps:0},status:'PASS'}));
