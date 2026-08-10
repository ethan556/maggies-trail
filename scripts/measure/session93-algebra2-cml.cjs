const fs=require('fs'),assert=require('assert');
const ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const schemaPath=require.resolve('../../src/lib/schema.ts');
require.cache[schemaPath]={id:schemaPath,filename:schemaPath,loaded:true,exports:{mixedRegroupTruth:()=>({}),columnCalcTruth:()=>0}};
const {evaluate,signChartSigns}=require('../../src/lib/evaluate.ts');
const {buildCMLMesh}=require('../../src/lib/cml/mesh.ts');
const courses=['complex-numbers','function-transformations','logarithms','polynomial-functions','radical-functions','rational-functions','sequences-series','statistical-inference','trig-functions'];
const expected=new Map([
 ['complex-numbers/cn-03-02.json/i1','argandExplore'],
 ['function-transformations/ft-03-01.json/i1','quadraticExplore'],
 ['logarithms/lg-01-03.json/i1','expLogExplore'],
 ['polynomial-functions/pf-02-02.json/i1','signChart'],
 ['radical-functions/re-04-02.json/i1','radicalCheck'],
 ['rational-functions/rf-04-02.json/i1','graphZoom'],
 ['sequences-series/sr-05-01.json/i1','sequenceBuild'],
 ['statistical-inference/si-02-02.json/i1','sampleSim'],
 ['trig-functions/tf-03-02.json/i1','unitCircleExplore']
]);
const correctValue=(w)=>{switch(w.type){
 case 'argandExplore':{if(w.mode==='plot')return{re:w.targetRe,im:w.targetIm};const den=w.mulRe*w.mulRe+w.mulIm*w.mulIm;return{re:(w.targetRe*w.mulRe+w.targetIm*w.mulIm)/den,im:(w.targetIm*w.mulRe-w.targetRe*w.mulIm)/den};}
 case 'quadraticExplore':return{a:w.targetA,h:w.targetH,k:w.targetK};
 case 'expLogExplore':return w.targetBase;
 case 'signChart':return signChartSigns(w.roots,w.leadingPositive);
 case 'radicalCheck':return w.target;
 case 'graphZoom':return{zoom:w.requiredZoom,verdict:w.targetVerdict};
 case 'sequenceBuild':return w.mode==='arithmetic'?w.targetD:w.targetRTenths;
 case 'sampleSim':return{size:w.targetSize,draws:w.requiredDraws};
 case 'unitCircleExplore':return{angle:w.targetAngle};
 default:throw new Error(`unsupported flagship ${w.type}`);
}};
const wrongValue=(w)=>{switch(w.type){
 case 'argandExplore':return{re:w.reStart,im:w.imStart};
 case 'quadraticExplore':return{a:w.targetA===1?2:1,h:w.targetH,k:w.targetK};
 case 'expLogExplore':return w.startBase===w.targetBase?w.targetBase+0.5:w.startBase;
 case 'signChart':{const a=[...signChartSigns(w.roots,w.leadingPositive)];a[0]=a[0]==='+'?'-':'+';return a;}
 case 'radicalCheck':return w.extraneous;
 case 'graphZoom':return{zoom:w.requiredZoom,verdict:w.targetVerdict==='limit-exists'?'no-limit':'limit-exists'};
 case 'sequenceBuild':return w.start===correctValue(w)?w.start+1:w.start;
 case 'sampleSim':return{size:w.sizes.find(x=>x!==w.targetSize)??w.targetSize,draws:w.requiredDraws};
 case 'unitCircleExplore':return{angle:w.angleStart===w.targetAngle?w.targetAngle-w.angleStep:w.angleStart};
 default:throw new Error(`unsupported flagship ${w.type}`);
}};
const catalog=fs.readFileSync('src/lib/cml/catalog.ts','utf8');
const profiles=new Set([...catalog.matchAll(/^  ([A-Za-z0-9_]+): \{/gm)].map(m=>m[1]));
let lessons=0,steps=0,response=0,direct=0,flagship=0,meshCards=0,evaluatorAssertions=0;
const surfaces={};
for(const course of courses){
 const dir=`content/courses/${course}/lessons`;
 for(const file of fs.readdirSync(dir).filter(x=>x.endsWith('.json'))){lessons++;const d=JSON.parse(fs.readFileSync(`${dir}/${file}`,'utf8'));
  for(const s of d.steps||[]){steps++;const t=s.widget?.type;if(!t)continue;surfaces[t]=(surfaces[t]||0)+1;if(['numeric','mcq','fractionEntry','pointEntry'].includes(t))response++;if(profiles.has(t))direct++;
   if(s.cml?.flagship){flagship++;const key=`${course}/${file}/${s.id}`;assert.equal(expected.get(key),t,`unexpected flagship ${key}`);assert(s.predict,`${key} missing prediction`);assert(s.cml.invariants?.length>=2&&s.cml.misconceptions?.length>=2,`${key} missing causal metadata`);assert(s.cml.representations?.length>=3,`${key} weak mesh metadata`);assert(s.cml.translationFrom&&s.cml.translationTo,`${key} missing translation`);assert(s.cml.counterfactualPrompt&&s.cml.transferFamily&&s.cml.delayed===true,`${key} incomplete mastery cycle`);assert.equal(s.cml.explanation.options.filter(o=>o.correct).length,1,`${key} explanation truth`);
    const cv=correctValue(s.widget),wv=wrongValue(s.widget);let r=evaluate(s.widget,cv);assert(r.correct,`${key} correct action rejected: ${r.feedback}`);evaluatorAssertions++;r=evaluate(s.widget,wv);assert(!r.correct,`${key} wrong action accepted`);evaluatorAssertions++;
    const mesh=buildCMLMesh(s.widget,cv);assert(mesh.cards.length>=3,`${key} lacks specialized mesh`);assert(mesh.narration.length>=20,`${key} weak narration`);assert(mesh.cards.every(c=>c.label&&c.value),`${key} malformed mesh card`);meshCards+=mesh.cards.length;
   }
  }
 }
}
assert.equal(flagship,9);assert.equal(expected.size,9);
for(const type of ['argandExplore','quadraticExplore','expLogExplore','signChart','radicalCheck','graphZoom','sequenceBuild','sampleSim','unitCircleExplore'])assert(profiles.has(type),`${type} missing shared CML profile`);
const report={courses:courses.length,lessons,steps,responseOnlySteps:response,directManipulativeSteps:direct,flagshipSteps:flagship,meshCards,evaluatorAssertions,surfaces,status:'PASS'};
fs.writeFileSync('ALGEBRA2_CML_AUDIT_SESSION_93.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
