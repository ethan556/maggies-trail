const fs=require('fs'),assert=require('assert'),ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const V=require('../../src/lib/variants.ts');
function loadEvaluate(){
 const src=fs.readFileSync('src/lib/evaluate.ts','utf8');
 const js=ts.transpileModule(src,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
 const mod={exports:{}};
 const custom=(id)=>{if(id==='./schema')return {columnCalcTruth(){throw new Error('unused columnCalcTruth')},mixedRegroupTruth(){throw new Error('unused mixedRegroupTruth')}};if(id==='./mathUtils')return require('../../src/lib/mathUtils.ts');return require(id)};
 new Function('module','exports','require','__filename','__dirname',js)(mod,mod.exports,custom,'src/lib/evaluate.ts','src/lib');
 return mod.exports.evaluate;
}
const evaluate=loadEvaluate();
const forms=[
 ['decimal-representation','tenthsFraction'],['decimal-representation','unitCount'],['order-decimals','tenthsOrder'],['decimal-representation','moneyTenths'],
 ['decimal-representation','rungCount'],['decimal-place-value','placeDigitMcq'],['decimal-representation','moneyHundredths'],['decimal-place-value','placeDigitNumeric'],
 ['decimal-place-value','readSimple'],['decimal-representation','expandedBuild'],['decimal-representation','expandedDecimal'],['decimal-representation','missingExpandedDigit'],
 ['decimal-representation','wordBuildSimple'],['decimal-representation','wordToDecimal'],['decimal-representation','wordBuildMixed'],['place-compare','decimalTie'],
 ['place-compare','decimalMixed'],['place-compare','decidingPlace'],['place-compare','decimalClose'],['decimal-representation','trailingEquivalent'],
 ['decimal-representation','leadingZeroCompare'],['decimal-representation','trailingMatchCount'],['round-place','contextWhole'],['round-place','contextTenth'],['round-place','deciderMcq'],
];
let builds=0,assertions=0;
for(const [gen,form] of forms)for(const band of ['support','core','stretch'])for(let i=0;i<80;i++){
 const v=V.variantForGenForm(gen,form,`session76-eval:${gen}:${form}:${band}:${i}`,band),w=v.widget;builds++;
 if(w.type==='numeric'){
  let r=evaluate(w,w.answer);assert(r.correct);assertions++;
  for(const e of w.commonErrors){r=evaluate(w,e.value);assert(!r.correct);assert.equal(r.feedback,e.feedback);assertions+=2;}
  r=evaluate(w,w.answer+0.314159);assert(!r.correct);assertions++;
 }else if(w.type==='mcq'){
  for(const o of w.options){const r=evaluate(w,o.id);assert.equal(r.correct,o.correct);assert.equal(r.feedback,o.feedback);assertions+=2;}
 }else if(w.type==='buildExpression'){
  let r=evaluate(w,w.correct);assert(r.correct);assertions++;
  for(const a of w.acceptAlso){r=evaluate(w,a);assert(r.correct);assertions++;}
  for(const b of w.commonBuilds){r=evaluate(w,b.sequence);assert(!r.correct);assert.equal(r.feedback,b.feedback);assertions+=2;}
  r=evaluate(w,[]);assert(!r.correct);assertions++;
 }else if(w.type==='placeCompare'){
  let r=evaluate(w,w.answer);assert(r.correct);assertions++;
  for(const sym of ['lt','eq','gt'])if(sym!==w.answer){r=evaluate(w,sym);assert(!r.correct);assert.equal(r.feedback,w[`${sym}Feedback`]);assertions+=2;}
 }else throw new Error(`unexpected surface ${w.type}`);
}
console.log(JSON.stringify({forms:forms.length,builds,assertions,status:'PASS'}));
