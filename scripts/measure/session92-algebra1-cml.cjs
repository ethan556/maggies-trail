const fs=require('fs'),path=require('path'),assert=require('assert');
const ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const schemaPath=require.resolve('../../src/lib/schema.ts');
require.cache[schemaPath]={id:schemaPath,filename:schemaPath,loaded:true,exports:{mixedRegroupTruth:()=>({}),columnCalcTruth:()=>0}};
const {evaluate}=require('../../src/lib/evaluate.ts');
const {buildCMLMesh}=require('../../src/lib/cml/mesh.ts');
const courses=['exponential-functions','exponents-polynomials','functions-and-sequences','linear-functions','quadratics','radicals-and-exponents','solving-equations','systems-equations'];
const expected=new Map([
 ['exponential-functions/exp-01-02.json/i1','expLogExplore'],['exponents-polynomials/ep-02-02.json/i1','algebraTiles'],
 ['functions-and-sequences/fn-01-01.json/i1','functionMachine'],['linear-functions/lf-02-01.json/e1','lineExplore'],
 ['quadratics/qu-01-03.json/e1','quadraticExplore'],['radicals-and-exponents/rad-04-03.json/i1','distanceGrid'],
 ['solving-equations/alg1-01-01.json/i1','balanceScale'],['systems-equations/se-01-01.json/i1','systemsExplore']]);
const correctValue=(w)=>{switch(w.type){
 case 'expLogExplore':return w.targetBase;case 'algebraTiles':return{x:w.targetX,c:w.targetConst};case 'functionMachine':return{input:(w.targetOutput-w.b)/w.a};
 case 'lineExplore':return{m:w.targetSlope,b:w.targetIntercept};case 'quadraticExplore':return{a:w.targetA,h:w.targetH,k:w.targetK};case 'distanceGrid':return{x:w.targetPoint[0],y:w.targetPoint[1]};
 case 'balanceScale':return{x:(w.c-w.b)/w.a};case 'systemsExplore':{const x=(w.b2-w.b1)/(w.m1-w.m2);return{x,y:w.m1*x+w.b1};}default:throw new Error(`unsupported flagship ${w.type}`);}};
const wrongValue=(w)=>{switch(w.type){
 case 'expLogExplore':return Math.abs(w.startBase-w.targetBase)>1e-9?w.startBase:Math.min(10,w.targetBase+0.5);case 'algebraTiles':return{x:w.targetX+1,c:w.targetConst};case 'functionMachine':return{input:w.inputStart};
 case 'lineExplore':return{m:w.targetSlope+1,b:w.targetIntercept};case 'quadraticExplore':return{a:w.targetA===1?2:1,h:w.targetH,k:w.targetK};case 'distanceGrid':return{x:w.anchor[0],y:w.anchor[1]};
 case 'balanceScale':return{x:w.xStart};case 'systemsExplore':return{x:w.xStart,y:w.yStart};default:throw new Error(`unsupported flagship ${w.type}`);}};
const catalog=fs.readFileSync('src/lib/cml/catalog.ts','utf8');
const profiles=new Set([...catalog.matchAll(/^  ([A-Za-z0-9_]+): \{/gm)].map(m=>m[1]));
let lessons=0,steps=0,response=0,direct=0,flagship=0,meshCards=0,evaluatorAssertions=0;
const surfaces={};
for(const course of courses){
 const dir=`content/courses/${course}/lessons`;
 for(const file of fs.readdirSync(dir).filter(x=>x.endsWith('.json'))){lessons++;const d=JSON.parse(fs.readFileSync(`${dir}/${file}`,'utf8'));
  for(const s of d.steps||[]){steps++;const t=s.widget?.type;if(!t)continue;surfaces[t]=(surfaces[t]||0)+1;if(['numeric','mcq','fractionEntry','pointEntry','radicalCheck'].includes(t))response++;if(profiles.has(t))direct++;
   if(s.cml?.flagship){flagship++;const key=`${course}/${file}/${s.id}`;assert.equal(expected.get(key),t,`unexpected flagship ${key}`);assert(s.predict,`${key} missing prediction`);assert(s.cml.invariants?.length&&s.cml.misconceptions?.length,`${key} missing causal metadata`);assert(s.cml.representations?.length>=3,`${key} weak mesh metadata`);assert(s.cml.translationFrom&&s.cml.translationTo,`${key} missing translation`);assert(s.cml.counterfactualPrompt&&s.cml.transferFamily&&s.cml.delayed===true,`${key} incomplete mastery cycle`);assert.equal(s.cml.explanation.options.filter(o=>o.correct).length,1,`${key} explanation truth`);
    const cv=correctValue(s.widget),wv=wrongValue(s.widget);let r=evaluate(s.widget,cv);assert(r.correct,`${key} correct action rejected: ${r.feedback}`);evaluatorAssertions++;r=evaluate(s.widget,wv);assert(!r.correct,`${key} wrong action accepted`);evaluatorAssertions++;
    const mesh=buildCMLMesh(s.widget,cv);assert(mesh.cards.length>=3,`${key} lacks specialized mesh`);assert(mesh.narration.length>=20,`${key} weak narration`);meshCards+=mesh.cards.length;
   }
  }
 }
}
assert.equal(flagship,8);assert.equal(expected.size,8);
const report={courses:courses.length,lessons,steps,responseOnlySteps:response,directManipulativeSteps:direct,flagshipSteps:flagship,meshCards,evaluatorAssertions,surfaces,status:'PASS'};
fs.writeFileSync('ALGEBRA1_CML_AUDIT_SESSION_92.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
