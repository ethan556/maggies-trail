const fs=require('fs'),ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const {variantForGenForm}=require('../../src/lib/variants.ts');
const groups={
'g8-fn-compare-context':['fgCompareLowerRate','fgCompareBreakEven'],
'g8-fn-linear-nonlinear':['fgLinearTableNonlinear','fgLinearTableLinear','fgLinearEquationNonlinear','fgLinearSort'],
'g8-fn-qualitative-graphs':['fgQualSteeper','fgQualDirection','fgQualFlattening','fgQualStopped'],
'g8-fn-graph-stories':['fgStoryAccelerateSteady','fgStorySteadyStop','fgStoryIncreasingGrowth','fgStoryFastStopSlow']};
for(const [g,forms] of Object.entries(groups))for(const f of forms)for(const b of ['support','core','stretch'])for(let i=0;i<3;i++){
 const v=variantForGenForm(g,f,`read:${g}:${f}:${b}:${i}`,b),w=v.widget;
 console.log(`\n### ${g}@${f} ${b} seed${i}\n${w.prompt}`);
 if(w.type==='mcq')for(const o of w.options)console.log(`${o.correct?'*':'-'} ${o.label}\n  ${o.feedback}`);
 else if(w.type==='numeric'){console.log('ANSWER',w.answer);for(const e of w.commonErrors)console.log('-',e.value,e.feedback);console.log('FALLBACK',w.fallbackFeedback)}
 else if(w.type==='dragBucket'){for(const it of w.items)console.log('-',it.label,'=>',it.bucketId,'|',it.feedback);console.log(w.missFeedback,w.successFeedback)}
}
