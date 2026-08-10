const fs=require('fs'),assert=require('assert'),ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const schemaPath=require.resolve('../../src/lib/schema.ts');
require.cache[schemaPath]={id:schemaPath,filename:schemaPath,loaded:true,exports:{
  mixedRegroupTruth:()=>({whole:0,num:0}), columnCalcTruth:(op,a,b)=>op==='add'?a+b:op==='subtract'?a-b:a*b
}};
const {evaluate}=require('../../src/lib/evaluate.ts');
const load=(course,file,id)=>JSON.parse(fs.readFileSync(`content/courses/${course}/lessons/${file}.json`,'utf8')).steps.find(s=>s.id===id).widget;
let assertions=0;
for(const id of ['i1','i2','i3']){
 const w=load('measure-money-time','mmt-01-01',id); assert.equal(w.type,'numberLineHop');
 const answer=w.start+w.hop*w.hops; let r=evaluate(w,answer); assert(r.correct); assertions++;
 for(const e of w.commonLandings){r=evaluate(w,e.value);assert(!r.correct);assert.equal(r.feedback,e.feedback);assertions+=2;}
}
{
 const w=load('coordinate-geometry','cg-03-02','i1'); assert.equal(w.type,'quadDrag');
 let r=evaluate(w,{x:w.targetX,y:w.targetY});assert(r.correct);assert.equal(r.feedback,w.successFeedback);assertions+=2;
 r=evaluate(w,{x:w.targetX+1,y:w.targetY});assert(!r.correct);assert.equal(r.feedback,w.sideFeedback);assertions+=2;
 r=evaluate(w,{x:w.targetX,y:w.targetY+1});assert(!r.correct);assert.equal(r.feedback,w.angleFeedback);assertions+=2;
}
{
 const w=load('functions-g8','fg-01-03','i1'); assert.equal(w.type,'plotPoint');
 let r=evaluate(w,w.targets);assert(r.correct);assert.equal(r.score,1);assertions+=2;
 r=evaluate(w,[w.targets[0]]);assert(!r.correct);assert.equal(r.score,0.5);assertions+=2;
 r=evaluate(w,[{x:2,y:3}]);assert(!r.correct);assert.equal(r.feedback,w.pointErrors[0].feedback);assertions+=2;
}
console.log(JSON.stringify({surfaces:5,assertions,status:'PASS'}));
