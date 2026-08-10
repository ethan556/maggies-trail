const fs=require('fs'),path=require('path'),assert=require('assert'),ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const V=require('../../src/lib/variants.ts');
function loadEvaluate(){const src=fs.readFileSync('src/lib/evaluate.ts','utf8');const js=ts.transpileModule(src,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;const mod={exports:{}};const custom=(id)=>{if(id==='./schema')return {columnCalcTruth(){throw new Error('unused')},mixedRegroupTruth(){throw new Error('unused')}};if(id==='./mathUtils')return require('../../src/lib/mathUtils.ts');return require(id)};new Function('module','exports','require','__filename','__dirname',js)(mod,mod.exports,custom,'src/lib/evaluate.ts','src/lib');return mod.exports.evaluate;}
const evaluate=loadEvaluate();
const dir='content/courses/ratios-rates/lessons',base='/mnt/data/session82_work/session82_baseline/content/courses/ratios-rates/lessons';
const prior=new Set();for(const f of fs.readdirSync(base).filter(x=>x.endsWith('.json'))){const j=JSON.parse(fs.readFileSync(path.join(base,f),'utf8'));for(const s of j.steps||[])if(s.variant)prior.add(`${f}:${s.id}`)}
const forms=new Map();for(const f of fs.readdirSync(dir).filter(x=>x.endsWith('.json'))){const j=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));for(const s of j.steps||[])if(s.variant&&!prior.has(`${f}:${s.id}`)){const gen=s.variant.gen,form=s.variant.form||'default';forms.set(`${gen}@${form}`,{gen,form,surface:s.widget.type});}}
assert.equal(forms.size,50);let builds=0,assertions=0;
for(const {gen,form} of forms.values())for(const band of ['support','core','stretch'])for(let i=0;i<120;i++){
 const v=V.variantForGenForm(gen,form,`session82-eval:${gen}:${form}:${band}:${i}`,band),w=v.widget;builds++;
 if(w.type==='numeric'){let r=evaluate(w,w.answer);assert(r.correct);assertions++;for(const e of w.commonErrors){r=evaluate(w,e.value);assert(!r.correct);assert.equal(r.feedback,e.feedback);assertions+=2;}r=evaluate(w,w.answer+Math.max(w.tolerance*2,0.314159));assert(!r.correct);assert.equal(r.feedback,w.fallbackFeedback);assertions+=2;}
 else if(w.type==='mcq'){for(const o of w.options){const r=evaluate(w,o.id);assert.equal(r.correct,o.correct);assert.equal(r.feedback,o.feedback);assertions+=2;}}
 else if(w.type==='buildExpression'){let r=evaluate(w,w.correct);assert(r.correct);assert.equal(r.feedback,w.successFeedback);assertions+=2;for(const a of w.acceptAlso){r=evaluate(w,a);assert(r.correct);assert.equal(r.feedback,w.successFeedback);assertions+=2;}for(const b of w.commonBuilds){r=evaluate(w,b.sequence);assert(!r.correct);assert.equal(r.feedback,b.feedback);assertions+=2;}const junk=w.tokens.map(t=>t.id).reverse().slice(0,Math.max(1,w.correct.length));if(![w.correct,...w.acceptAlso,...w.commonBuilds.map(b=>b.sequence)].some(x=>x.join('|')===junk.join('|'))){r=evaluate(w,junk);assert(!r.correct);assert.equal(r.feedback,w.missFeedback);assertions+=2;}}
 else throw new Error(`unexpected ${w.type}`);
}
console.log(JSON.stringify({forms:forms.size,builds,assertions,status:'PASS'}));
