const fs=require('fs'),assert=require('assert'),Module=require('module');
const ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const V=require('../../src/lib/variants.ts');
const file='src/lib/variants.test.ts',text=fs.readFileSync(file,'utf8');
const sf=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
const initializers=new Map();
function visit(n){
  if(ts.isVariableDeclaration(n)&&n.name.getText(sf)==='INDEPENDENT'&&n.initializer&&ts.isObjectLiteralExpression(n.initializer)){
    for(const p of n.initializer.properties)if(ts.isPropertyAssignment(p))initializers.set(p.name.getText(sf).replace(/^['"]|['"]$/g,''),p.initializer.getText(sf));
  }
  ts.forEachChild(n,visit);
}visit(sf);
function loadRoute(key){const src=`module.exports = ${initializers.get(key)};`;const out=ts.transpileModule(src,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;const m=new Module(`route:${key}`,module);m._compile(out,`route:${key}`);return m.exports;}
const pairs=[
 ['grouping-first','mulAddEval'],['grouping-first','mulSubNumeric'],['grouping-first','divAddNumeric'],['grouping-first','doubleAddEval'],['grouping-first','wordSubtractMultiply'],['grouping-first','groupPhraseMcq'],
 ['partial-products','carryContinue'],['partial-products','carryScaffold'],['partial-products','carryColumn'],['partial-products','carryBare'],
 ['frac-unlike-addsub','addNumerator'],['frac-unlike-addsub','subNumerator'],['whole-times-fraction','numeratorOnly'],
 ['frac-multiply','unitGrid'],['frac-multiply','areaGrid'],['frac-multiply','areaCompare'],['frac-multiply','denominatorOnly'],
 ['fraction-scaling','singleCompare'],['fraction-scaling','pairCompare'],['fraction-scaling','largestThree'],
 ['unit-frac-divide','wholeCountNumeric'],['unit-frac-divide','unitDenominatorNumeric'],['unit-frac-divide','shareDenominatorNumeric'],['unit-frac-divide','scoopsComputation'],['unit-frac-divide','servingsNumeric']
];
const routes={};for(const [g,f] of pairs){const key=initializers.has(`${g}@${f}`)?`${g}@${f}`:g;routes[`${g}@${f}`]=loadRoute(key)}
let checks=0;
for(const [gen,form] of pairs)for(const band of ['support','core','stretch'])for(let i=0;i<200;i++){
 const v=V.variantForGenForm(gen,form,`standing75:${gen}:${form}:${band}:${i}`,band),w=v.widget;
 const key=w.type==='mcq'?w.prompt+'||'+w.options.map(o=>o.label).join(';;'):w.prompt;
 const got=routes[`${gen}@${form}`](key);
 if(w.type==='mcq'){
  const correct=w.options.filter(o=>o.correct);assert.equal(correct.length,1);assert.equal(got,correct[0].label,`${gen}@${form}/${band}/${i}`);assert.equal(v.answer,correct[0].id);
 }else assert.deepStrictEqual(got,v.answer,`${gen}@${form}/${band}/${i}`);
 checks++;
}
console.log(JSON.stringify({routes:pairs.length,checks,status:'PASS'}));
