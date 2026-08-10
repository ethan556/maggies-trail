const fs=require('fs'),path=require('path'),assert=require('assert');
const ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const V=require('../../src/lib/variants.ts');
// Registered generators must all have a base independent route in the standing gate.
const testFile='src/lib/variants.test.ts';
const text=fs.readFileSync(testFile,'utf8');
const sf=ts.createSourceFile(testFile,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
const routes=new Set();
function visit(n){
 if(ts.isVariableDeclaration(n)&&n.name.getText(sf)==='INDEPENDENT'&&n.initializer&&ts.isObjectLiteralExpression(n.initializer)){
  for(const p of n.initializer.properties) if(ts.isPropertyAssignment(p)) routes.add(p.name.getText(sf).replace(/^['"]|['"]$/g,''));
 }
 ts.forEachChild(n,visit);
} visit(sf);
for(const g of V.VARIANT_GENERATORS) assert(routes.has(g.tag),`missing independent route ${g.tag}`);
// Every declared item resolves deterministically and preserves its authored surface in 5 seeds x 3 bands.
const declarations=[];
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(e.name.endsWith('.json')){let j;try{j=JSON.parse(fs.readFileSync(p,'utf8'))}catch{continue}for(const s of j.steps||[])if(s.variant)declarations.push({file:p,id:s.id,surface:s.widget?.type,decl:s.variant,step:s});}}}
walk('content/courses');
let declarationChecks=0;
for(const d of declarations){
 const g=V.VARIANT_GENERATORS.find(x=>x.tag===d.decl.gen);assert(g,`unknown generator ${d.decl.gen}`);
 if(d.decl.form!==undefined && d.decl.form!=='default') assert((g.forms||[]).includes(d.decl.form),`unknown form ${d.decl.gen}@${d.decl.form}`);
 for(const band of ['support','core','stretch'])for(let i=0;i<5;i++){
  const seed=`decl:${d.file}:${d.id}:${band}:${i}`;
  const a=V.variantForGenForm(d.decl.gen,d.decl.form||'default',seed,band);
  const b=V.variantForGenForm(d.decl.gen,d.decl.form||'default',seed,band);
  assert.deepStrictEqual(a,b,`nondeterministic declaration ${d.file}/${d.id}`);
  assert.equal(a.widget.type,d.surface,`surface changed ${d.file}/${d.id}: ${d.surface}->${a.widget.type}`);
  declarationChecks++;
 }
}
// All registered forms build deterministically across bands.
let generatorBuilds=0;
for(const g of V.VARIANT_GENERATORS){for(const form of (g.forms||['default'])){for(const band of ['support','core','stretch'])for(let i=0;i<6;i++){
 const seed=`gen:${g.tag}:${form}:${band}:${i}`;
 assert.deepStrictEqual(V.variantForGenForm(g.tag,form,seed,band),V.variantForGenForm(g.tag,form,seed,band));generatorBuilds++;
}}}
console.log(JSON.stringify({generators:V.VARIANT_GENERATORS.length,routes:routes.size,declarations:declarations.length,declarationChecks,generatorBuilds,status:'PASS'}));
