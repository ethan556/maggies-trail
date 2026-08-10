const fs=require('fs'),assert=require('assert'),ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const V=require('../../src/lib/variants.ts');
const targets=[];
for(const file of fs.readdirSync('content/courses/number-system/lessons').filter(x=>x.endsWith('.json')).sort()){
 const d=JSON.parse(fs.readFileSync(`content/courses/number-system/lessons/${file}`,'utf8'));
 for(const s of d.steps||[]) if(['check','challenge'].includes(s.kind) && s.variant) targets.push([file.replace('.json',''),s.id,s.variant.gen,s.variant.form||'default',s.widget.type]);
}
assert.equal(targets.length,60);
const baseline=new Set();
for(const file of fs.readdirSync('/mnt/data/session81_baseline/maggies-trail-session-80/content/courses/number-system/lessons').filter(x=>x.endsWith('.json'))){
 const d=JSON.parse(fs.readFileSync(`/mnt/data/session81_baseline/maggies-trail-session-80/content/courses/number-system/lessons/${file}`,'utf8'));
 for(const s of d.steps||[]) if(['check','challenge'].includes(s.kind)&&s.variant) baseline.add(`${file}:${s.id}`);
}
const added=targets.filter(t=>!baseline.has(`${t[0]}.json:${t[1]}`));
assert.equal(added.length,48);
const NEG=/^(no|not|wrong|incorrect|sorry|try again|nope)\b/i;
function fb(x,where){assert(typeof x==='string'&&x.length>=25,`${where} short feedback: ${x}`);assert(!NEG.test(x),`${where} negating feedback: ${x}`)}
function check(v,surface,where){const w=v.widget;assert.equal(w.type,surface,`${where} surface`);assert(typeof w.prompt==='string'&&w.prompt.length>=9,`${where} prompt`);
 if(surface==='numeric'){assert.equal(v.answer,w.answer);assert(Number.isFinite(w.answer));assert(w.commonErrors.length>=2);const vals=w.commonErrors.map(e=>Number(e.value).toPrecision(14));assert.equal(new Set(vals).size,vals.length,`${where} duplicate traps`);for(const e of w.commonErrors){assert(Math.abs(e.value-w.answer)>w.tolerance,`${where} trap equals answer`);fb(e.feedback,where)}fb(w.fallbackFeedback,where);}
 else if(surface==='mcq'){assert(w.options.length>=3);assert.equal(w.options.filter(o=>o.correct).length,1);assert.equal(new Set(w.options.map(o=>o.label)).size,w.options.length,`${where} duplicate labels`);assert.equal(new Set(w.options.map(o=>o.id)).size,w.options.length);assert.equal(v.answer,w.options.find(o=>o.correct).id);for(const o of w.options)fb(o.feedback,where);}
 else if(surface==='rationalCompare'){assert(['lt','eq','gt'].includes(w.answer));assert.equal(v.answer,w.answer);const slots={lt:w.ltFeedback,eq:w.eqFeedback,gt:w.gtFeedback};assert.equal(slots[w.answer],undefined,`${where} answer slot dead feedback`);for(const rel of ['lt','eq','gt'])if(rel!==w.answer)fb(slots[rel],where);fb(w.successFeedback,where);}
 else if(surface==='dragOrder'){assert.deepStrictEqual(v.answer,w.correctOrder);assert.equal(new Set(w.items.map(i=>i.id)).size,w.items.length);assert.equal(new Set(w.items.map(i=>i.label)).size,w.items.length);assert.notDeepStrictEqual(w.items.map(i=>i.id),w.correctOrder,`${where} pre-sorted`);assert.deepStrictEqual([...w.correctOrder].sort(),w.items.map(i=>i.id).sort());for(const m of w.misorderFeedback)fb(m.feedback,where);fb(w.missFeedback,where);fb(w.successFeedback,where);}
 else if(surface==='absValueLine'){const max=Math.max(...w.items.map(i=>Math.abs(i.value)));const far=w.items.filter(i=>Math.abs(i.value)===max);const truth=far.length>1?'equal':far[0].id;assert.equal(w.answerId,truth);assert.equal(v.answer,truth);assert.equal(new Set(w.items.map(i=>i.id)).size,w.items.length);assert.equal(new Set(w.items.map(i=>i.label)).size,w.items.length);for(const i of w.items){if(i.id===truth)assert.equal(i.feedback,undefined);else fb(i.feedback,where)}if(truth!=='equal'&&w.equalLabel)fb(w.equalFeedback,where);fb(w.missFeedback,where);fb(w.successFeedback,where);}
 else throw new Error(`unsupported ${surface}`);
}
const unique=[...new Map(added.map(t=>[`${t[2]}@${t[3]}`,{gen:t[2],form:t[3],surface:t[4]}])).values()];
assert.equal(unique.length,40);
let builds=0;
for(const {gen,form,surface} of unique)for(const band of ['support','core','stretch'])for(let i=0;i<280;i++){
 const seed=`session81:${gen}:${form}:${band}:${i}`,a=V.variantForGenForm(gen,form,seed,band),b=V.variantForGenForm(gen,form,seed,band);
 assert(a,`${gen}@${form} null`);assert.deepStrictEqual(a,b,`${gen}@${form} nondeterministic`);check(a,surface,`${gen}@${form}/${band}/${i}`);builds++;
}
let total=0,served=0;for(const f of fs.readdirSync('content/courses/number-system/lessons').filter(x=>x.endsWith('.json'))){const d=JSON.parse(fs.readFileSync(`content/courses/number-system/lessons/${f}`,'utf8'));for(const s of d.steps||[])if(['check','challenge'].includes(s.kind)){total++;if(V.variantForStep(s,`coverage:${f}:${s.id}`,'core'))served++;}}
assert.deepStrictEqual({total,served,gaps:total-served},{total:60,served:60,gaps:0});
console.log(JSON.stringify({targets:added.length,uniqueForms:unique.length,builds,course:{total,served,gaps:0},status:'PASS'}));
