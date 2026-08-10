const fs=require('fs'),path=require('path'),assert=require('assert'),ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const V=require('../../src/lib/variants.ts');
const dir='content/courses/ratios-rates/lessons';const targets=[];
for(const file of fs.readdirSync(dir).filter(x=>x.endsWith('.json')).sort()){
 const d=JSON.parse(fs.readFileSync(path.join(dir,file),'utf8'));
 for(const s of d.steps||[]) if(['check','challenge'].includes(s.kind)&&s.variant) targets.push([file.replace('.json',''),s.id,s.variant.gen,s.variant.form||'default',s.widget.type]);
}
assert.equal(targets.length,57);
const baseline=new Set();const bdir='/mnt/data/session82_work/session82_baseline/content/courses/ratios-rates/lessons';
for(const file of fs.readdirSync(bdir).filter(x=>x.endsWith('.json'))){const d=JSON.parse(fs.readFileSync(path.join(bdir,file),'utf8'));for(const s of d.steps||[])if(['check','challenge'].includes(s.kind)&&s.variant)baseline.add(`${file}:${s.id}`)}
const added=targets.filter(t=>!baseline.has(`${t[0]}.json:${t[1]}`));assert.equal(added.length,57);
const NEG=/^(no|not|wrong|incorrect|sorry|try again|nope)\b/i;
function fb(x,w){assert(typeof x==='string'&&x.length>=25,`${w} short feedback: ${x}`);assert(!NEG.test(x),`${w} negation: ${x}`)}
function check(v,surface,where){const w=v.widget;assert.equal(w.type,surface,`${where} surface`);assert(typeof w.prompt==='string'&&w.prompt.length>=9,`${where} prompt`);
 if(surface==='numeric'){assert.equal(v.answer,w.answer);assert(Number.isFinite(w.answer));assert(w.commonErrors.length>=2);const vals=w.commonErrors.map(e=>Number(e.value).toPrecision(14));assert.equal(new Set(vals).size,vals.length,`${where} duplicate traps ${vals}`);for(const e of w.commonErrors){assert(Math.abs(e.value-w.answer)>w.tolerance,`${where} trap equals answer ${e.value}`);fb(e.feedback,where)}fb(w.fallbackFeedback,where);}
 else if(surface==='mcq'){assert(w.options.length>=3);assert.equal(w.options.filter(o=>o.correct).length,1);assert.equal(new Set(w.options.map(o=>o.label)).size,w.options.length,`${where} duplicate labels`);assert.equal(new Set(w.options.map(o=>o.id)).size,w.options.length);assert.equal(v.answer,w.options.find(o=>o.correct).id);for(const o of w.options)fb(o.feedback,where);}
 else if(surface==='buildExpression'){assert.deepStrictEqual(v.answer,w.correct);assert.equal(new Set(w.tokens.map(t=>t.id)).size,w.tokens.length);assert.equal(new Set(w.tokens.map(t=>t.label)).size,w.tokens.length,`${where} duplicate token labels`);const known=new Set(w.tokens.map(t=>t.id));for(const seq of [w.correct,...w.acceptAlso,...w.commonBuilds.map(x=>x.sequence)])for(const id of seq)assert(known.has(id));const accepted=new Set([w.correct,...w.acceptAlso].map(x=>x.join('|')));for(const b of w.commonBuilds){assert(!accepted.has(b.sequence.join('|')));fb(b.feedback,where)}assert(w.tokens.some(t=>!new Set([...w.correct,...w.acceptAlso.flat()]).has(t.id)));fb(w.missFeedback,where);fb(w.successFeedback,where);}
 else throw new Error(`unsupported ${surface}`);
}
const unique=[...new Map(added.map(t=>[`${t[2]}@${t[3]}`,{gen:t[2],form:t[3],surface:t[4]}])).values()];
let builds=0;for(const {gen,form,surface} of unique)for(const band of ['support','core','stretch'])for(let i=0;i<280;i++){const seed=`session82:${gen}:${form}:${band}:${i}`,a=V.variantForGenForm(gen,form,seed,band),b=V.variantForGenForm(gen,form,seed,band);assert(a,`${gen}@${form} null`);assert.deepStrictEqual(a,b,`${gen}@${form} nondeterministic`);check(a,surface,`${gen}@${form}/${band}/${i}`);builds++;}
let total=0,served=0;for(const f of fs.readdirSync(dir).filter(x=>x.endsWith('.json'))){const d=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));for(const s of d.steps||[])if(['check','challenge'].includes(s.kind)){total++;if(V.variantForStep(s,`coverage:${f}:${s.id}`,'core'))served++;}}
assert.deepStrictEqual({total,served,gaps:total-served},{total:61,served:61,gaps:0});
console.log(JSON.stringify({targets:added.length,uniqueForms:unique.length,builds,course:{total,served,gaps:0},status:'PASS'}));
