const fs=require('fs'),path=require('path'),assert=require('assert');
const ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const {variantForGenForm}=require('../../src/lib/variants.ts');
const GROUPS={
'g8-fn-compare-context':['fgCompareLowerRate','fgCompareBreakEven'],
'g8-fn-linear-nonlinear':['fgLinearTableNonlinear','fgLinearTableLinear','fgLinearEquationNonlinear','fgLinearSort'],
'g8-fn-qualitative-graphs':['fgQualSteeper','fgQualDirection','fgQualFlattening','fgQualStopped'],
'g8-fn-graph-stories':['fgStoryAccelerateSteady','fgStorySteadyStop','fgStoryIncreasingGrowth','fgStoryFastStopSlow'],
};
const TAGS=new Set(Object.keys(GROUPS));
function routes(){
 const file=path.resolve('src/lib/variants.test.ts'),text=fs.readFileSync(file,'utf8');
 const sf=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS),props=[];
 function visit(n){if(ts.isVariableDeclaration(n)&&n.name.getText(sf)==='INDEPENDENT'&&n.initializer&&ts.isObjectLiteralExpression(n.initializer))for(const p of n.initializer.properties){if(!ts.isPropertyAssignment(p))continue;const key=p.name.getText(sf).replace(/^['"]|['"]$/g,'');if(TAGS.has(key))props.push(p.getText(sf));}ts.forEachChild(n,visit);}visit(sf);
 const snippet=`const INDEPENDENT={\n${props.join(',\n')}\n}; module.exports=INDEPENDENT;`;
 const js=ts.transpileModule(snippet,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
 const m={exports:{}};new Function('module','exports',js)(m,m.exports);return m.exports;
}
const R=routes();for(const t of TAGS)assert.equal(typeof R[t],'function',`missing route ${t}`);
const NEG=/^(no|not|wrong|incorrect|sorry|try again|nope)\b/i;
function feedbacks(w){if(w.type==='mcq')return w.options.map(o=>o.feedback);if(w.type==='numeric')return [...w.commonErrors.map(e=>e.feedback),w.fallbackFeedback];if(w.type==='dragBucket')return [...w.items.map(i=>i.feedback),w.missFeedback,w.successFeedback];return[];}
function generic(v){const w=v.widget;assert(w.prompt.length>=9,`short prompt ${w.prompt}`);assert(!/\ba a\b/i.test(w.prompt),`double article ${w.prompt}`);assert(!/\b1 (minutes|places|units)\b/.test(w.prompt),`grammar ${w.prompt}`);assert(!/\d\.\d{12,}/.test(w.prompt),`float ${w.prompt}`);for(const f of feedbacks(w)){assert(f.length>=25,`short feedback ${f}`);assert(!NEG.test(f),`negative feedback ${f}`);assert(!/\d\.\d{12,}/.test(f),`float feedback ${f}`);}if(w.type==='mcq'){assert.equal(w.options.filter(o=>o.correct).length,1);assert.equal(new Set(w.options.map(o=>o.label)).size,w.options.length);}else if(w.type==='numeric'){const vals=w.commonErrors.map(e=>e.value);assert(vals.every(Number.isFinite));assert(vals.every(x=>Math.abs(x-w.answer)>Math.max(1e-12,w.tolerance)));assert.equal(new Set(vals.map(x=>x.toPrecision(14))).size,vals.length);}else if(w.type==='dragBucket'){assert.equal(new Set(w.items.map(i=>i.label)).size,w.items.length);const used=new Set(w.items.map(i=>i.bucketId));for(const b of w.buckets)assert(used.has(b.id));}}
function verify(v){const w=v.widget,r=R[v.tag];if(w.type==='mcq'){const key=w.prompt+'||'+w.options.map(o=>o.label).join(';;');assert.equal(r(key),w.options.find(o=>o.correct).label,`${v.tag}: ${w.prompt}`);}else if(w.type==='numeric'){assert(Math.abs(r(w.prompt)-v.answer)<1e-9,`${v.tag}: ${w.prompt}`);}else if(w.type==='dragBucket'){const key=w.prompt+'||'+w.items.map(i=>i.label).join(',');const want=r(key),got=Object.fromEntries(w.items.map(i=>[i.label,i.bucketId]));assert.deepStrictEqual(want,got,`${v.tag}: ${w.prompt}`);}else throw new Error(w.type);}
const bands=['support','core','stretch'],draws=Number(process.env.DRAWS||5000);let checks=0;const pos=new Map();
for(const [tag,forms] of Object.entries(GROUPS))for(const form of forms)for(const band of bands){const fresh=new Set();for(let i=0;i<draws;i++){const seed=`s74:${tag}:${form}:${band}:${i}`;const v=variantForGenForm(tag,form,seed,band);assert.deepStrictEqual(v,variantForGenForm(tag,form,seed,band));generic(v);verify(v);if(i<12)fresh.add(JSON.stringify(v.widget)+'|'+JSON.stringify(v.answer));if(v.widget.type==='mcq'){const k=`${tag}@${form}`,a=pos.get(k)||[0,0,0,0];a[v.widget.options.findIndex(o=>o.correct)]++;pos.set(k,a);}checks++;}assert(fresh.size>=4,`freshness ${tag}@${form}/${band} ${fresh.size}`);}
for(const [k,a] of pos)assert(a.filter(n=>n).length>=3,`positions ${k}: ${a}`);
for(const [tag,forms] of Object.entries(GROUPS))for(let i=0;i<1000;i++){for(const band of bands){const seen=new Set();for(const form of forms){const v=variantForGenForm(tag,form,`same:${tag}:${band}:${i}`,band),sig=JSON.stringify(v.widget)+'|'+JSON.stringify(v.answer);assert(!seen.has(sig),`form collapse ${tag}@${form}`);seen.add(sig);}}for(const form of forms){const sigs=bands.map(b=>{const v=variantForGenForm(tag,form,`band:${tag}:${form}:${i}`,b);return JSON.stringify(v.widget)+'|'+JSON.stringify(v.answer)});assert.equal(new Set(sigs).size,3,`band collapse ${tag}@${form}`);}}
console.log(JSON.stringify({forms:Object.values(GROUPS).flat().length,drawsPerFormBand:draws,checks,routes:Object.keys(R).length,status:'PASS'}));
