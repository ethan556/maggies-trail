const fs=require('fs'),path=require('path'),assert=require('assert'),ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const V=require('../../src/lib/variants.ts');
function loadRoutes(){let src=fs.readFileSync('src/lib/variants.test.ts','utf8');src=src.slice(0,src.indexOf('const NEGATION'));src=src.replace(/^import .*;\s*$/gm,'');src+='\nmodule.exports={INDEPENDENT};\n';const js=ts.transpileModule(src,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;const mod={exports:{}};new Function('module','exports','require','__filename','__dirname',js)(mod,mod.exports,require,'src/lib/variants.test.ts','src/lib');return mod.exports.INDEPENDENT;}
const R=loadRoutes();
const dir='content/courses/data-distributions/lessons',base='/mnt/data/session83_baseline/content/courses/data-distributions/lessons';
const prior=new Set();for(const f of fs.readdirSync(base).filter(x=>x.endsWith('.json'))){const j=JSON.parse(fs.readFileSync(path.join(base,f),'utf8'));for(const s of j.steps||[])if(s.variant)prior.add(`${f}:${s.id}`)}
const forms=new Map();for(const f of fs.readdirSync(dir).filter(x=>x.endsWith('.json'))){const j=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));for(const s of j.steps||[])if(s.variant&&!prior.has(`${f}:${s.id}`)){const gen=s.variant.gen,form=s.variant.form||'default';forms.set(`${gen}@${form}`,{gen,form,surface:s.widget.type});}}
assert.equal(forms.size,59);
let checks=0;
for(const {gen,form,surface} of forms.values()){
 const route=R[`${gen}@${form}`]||R[gen];assert.equal(typeof route,'function',`missing route ${gen}@${form}`);
 for(const band of ['support','core','stretch'])for(let i=0;i<250;i++){
  const v=V.variantForGenForm(gen,form,`session83-route:${gen}:${form}:${band}:${i}`,band),w=v.widget;assert(v);let input=w.prompt;
  if(w.type==='mcq')input+='||'+w.options.map(o=>o.label).join(';;');
  const got=route(input);
  if(w.type==='mcq'){const good=w.options.filter(o=>o.correct);assert.equal(good.length,1);assert.equal(got,good[0].label,`${gen}@${form}/${band}/${i}: ${got} != ${good[0].label}`);}
  else if(w.type==='buildExpression'){const labels=Object.fromEntries(w.tokens.map(t=>[t.id,t.label]));assert.deepStrictEqual(got,w.correct.map(id=>labels[id]),`${gen}@${form}/${band}/${i}: ${JSON.stringify(got)} != ${JSON.stringify(w.correct.map(id=>labels[id]))}`);}
  else {assert.equal(surface,'numeric');assert.deepStrictEqual(got,v.answer,`${gen}@${form}/${band}/${i}: ${JSON.stringify(got)} != ${JSON.stringify(v.answer)}`);}
  checks++;
 }
}
console.log(JSON.stringify({forms:forms.size,checks,status:'PASS'}));
