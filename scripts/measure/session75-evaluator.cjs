const fs=require('fs'),assert=require('assert'),Module=require('module');
const ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const V=require('../../src/lib/variants.ts');
let js=ts.transpileModule(fs.readFileSync('src/lib/evaluate.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
js=js.replace('require("./schema")','({ columnCalcTruth: (op,a,b) => op === "add" ? a+b : op === "subtract" ? a-b : a*b, mixedRegroupTruth: () => ({whole:0,num:0}) })');
js=js.replace('require("./mathUtils")','({ gcd: (a,b) => { while (b) [a,b]=[b,a%b]; return Math.abs(a); } })');
const mod=new Module('session75-evaluate',module);mod.filename=require('path').resolve('src/lib/session75-evaluate.cjs');mod.paths=module.paths;mod._compile(js,mod.filename);const {evaluate}=mod.exports;
const pairs=[
 ['grouping-first','mulAddEval'],['grouping-first','mulSubNumeric'],['grouping-first','divAddNumeric'],['grouping-first','doubleAddEval'],['grouping-first','wordSubtractMultiply'],['grouping-first','groupPhraseMcq'],
 ['partial-products','carryContinue'],['partial-products','carryScaffold'],['partial-products','carryColumn'],['partial-products','carryBare'],
 ['frac-unlike-addsub','addNumerator'],['frac-unlike-addsub','subNumerator'],['whole-times-fraction','numeratorOnly'],
 ['frac-multiply','unitGrid'],['frac-multiply','areaGrid'],['frac-multiply','areaCompare'],['frac-multiply','denominatorOnly'],
 ['fraction-scaling','singleCompare'],['fraction-scaling','pairCompare'],['fraction-scaling','largestThree'],
 ['unit-frac-divide','wholeCountNumeric'],['unit-frac-divide','unitDenominatorNumeric'],['unit-frac-divide','shareDenominatorNumeric'],['unit-frac-divide','scoopsComputation'],['unit-frac-divide','servingsNumeric']
];
let builds=0, assertions=0;
for(const [gen,form] of pairs)for(const band of ['support','core','stretch'])for(let i=0;i<80;i++){
 const v=V.variantForGenForm(gen,form,`eval75:${gen}:${form}:${band}:${i}`,band),w=v.widget;
 if(w.type==='numeric'){
  assert.equal(evaluate(w,w.answer).correct,true);assertions++;
  for(const e of w.commonErrors){const r=evaluate(w,e.value);assert.equal(r.correct,false);assert.equal(r.feedback,e.feedback);assertions+=2;}
 }else if(w.type==='mcq'){
  for(const o of w.options){const r=evaluate(w,o.id);assert.equal(r.correct,o.correct);assert.equal(r.feedback,o.feedback);assertions+=2;}
 }else if(w.type==='columnCalc'){
  assert.equal(evaluate(w,{value:w.a*w.b,complete:true}).correct,true);assert.equal(evaluate(w,{value:w.a*w.b,complete:false}).correct,false);assertions+=2;
  for(const e of w.commonResults){const r=evaluate(w,{value:e.value,complete:true});assert.equal(r.correct,false);assert.equal(r.feedback,e.feedback);assertions+=2;}
 }else if(w.type==='evalOrder'){
  assert.equal(evaluate(w,{tokens:[String(w.target)]}).correct,true);assert.equal(evaluate(w,{tokens:w.tokens}).correct,false);assertions+=2;
  for(const e of w.commonResults){const r=evaluate(w,{tokens:[String(e.value)]});assert.equal(r.correct,false);assert.equal(r.feedback,e.feedback);assertions+=2;}
 }else if(w.type==='fractionGrid'){
  const answer={rows:w.den1,cols:w.den2,shadeR:w.num1,shadeC:w.num2};assert.equal(evaluate(w,answer).correct,true);assertions++;
  let r=evaluate(w,{...answer,rows:answer.rows+1});assert.equal(r.correct,false);assert.equal(r.feedback,w.rowFeedback);assertions+=2;
  r=evaluate(w,{...answer,cols:answer.cols+1});assert.equal(r.correct,false);assert.equal(r.feedback,w.colFeedback);assertions+=2;
  for(const b of w.commonBuilds){r=evaluate(w,{rows:b.rows,cols:b.cols,shadeR:b.shadeR,shadeC:b.shadeC});assert.equal(r.correct,false);assert.equal(r.feedback,b.feedback);assertions+=2;}
 }else throw new Error(`unexpected surface ${w.type}`);
 builds++;
}
console.log(JSON.stringify({forms:pairs.length,builds,assertions,status:'PASS'}));
