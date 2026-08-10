#!/usr/bin/env node
const fs=require('node:fs'),path=require('node:path'),child=require('node:child_process'),os=require('node:os'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
function loadTs(){const c=[path.join(root,'node_modules/typescript/lib/typescript.js'),'/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js','/opt/nvm/versions/node/v22.22.2/lib/node_modules/typescript/lib/typescript.js'];try{c.unshift(path.join(child.execFileSync('npm',['root','-g'],{encoding:'utf8'}).trim(),'typescript/lib/typescript.js'))}catch{}const f=c.find(fs.existsSync);if(!f)throw Error('TypeScript unavailable');return require(f)}
const ts=loadTs(),srcRoot=path.join(root,'src/lib'),out=fs.mkdtempSync(path.join(os.tmpdir(),'s143-variants-'));
function uniq(xs){return new Set(xs).size===xs.length}
function key(xs){return xs.join('>')}
function readTruth(w){const target=w.segments.find(s=>s.id===w.targetSegmentId)||w.segments[0];switch(w.readTask){case'flatMeaning':return w.axisContext==='distanceFromOrigin'?'motion:stopped':'change:constant';case'steepMeaning':return target.kind==='riseGentle'?'rate:slower':'rate:faster';case'directionMeaning':return target.kind==='flat'?'change:constant':target.kind.startsWith('rise')?'change:increasing':'change:decreasing';case'flatteningMeaning':return target.kind.startsWith('rise')?'rate:increasing-more-slowly':'rate:decreasing-more-slowly';case'locateStopped':{const s=w.segments.find(s=>s.kind==='flat');return`section:${s?.label??'none'}`}case'storySummary':return`sequence:${key(w.segments.map(s=>s.kind))}`;default:throw Error('unknown readTask')}}
try{
 const q=['variants.ts'],seen=new Set();while(q.length){const rel=q.shift();if(seen.has(rel))continue;seen.add(rel);const text=fs.readFileSync(path.join(srcRoot,rel),'utf8');const tr=ts.transpileModule(text,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true},reportDiagnostics:true,fileName:rel});if(tr.diagnostics?.length)throw Error(`${rel}: transpile diagnostics ${tr.diagnostics.map(d=>ts.flattenDiagnosticMessageText(d.messageText,' ')).join('; ')}`);const js=tr.outputText;const dest=path.join(out,rel.replace(/\.tsx?$/,'.js'));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,js);for(const m of js.matchAll(/require\(["']\.\/(.+?)["']\)/g)){const dep=m[1];if(dep==='schema'){const stub=`const round=v=>Math.round(v*1e12)/1e12;exports.proportionalReasoningTruth=s=>{const series=s.series.map(e=>({...e,rates:e.pairs.map(([x,y])=>round(y/x)),constant:round(e.pairs[0][1]/e.pairs[0][0])}));const target=series.find(e=>e.id===s.targetSeriesId)||series[0];const ranked=[...series].sort((a,b)=>a.constant-b.constant||a.id.localeCompare(b.id));const best=s.optimize==='max'?ranked.at(-1):ranked[0];let answerNumber,answerClaim;switch(s.task){case'unitRate':case'constant':answerNumber=target.constant;break;case'predictOutput':case'scaleRatio':answerNumber=round(target.constant*(s.targetInput||0));break;case'predictInput':answerNumber=round((s.targetOutput||0)/target.constant);break;case'percentOf':answerNumber=round((s.targetInput||0)*(s.percent||0)/100);break;case'discount':{const sub=round(target.constant*(s.targetInput||0)),d=round(sub*(s.percent||0)/100);answerNumber=round(sub-d);break}case'cheaperThenPredict':answerNumber=round(best.constant*(s.targetInput||0));answerClaim='series:'+best.id;break;case'bestRate':answerClaim='series:'+best.id;break;case'steadyAssumption':answerClaim=target.rates.every(r=>Math.abs(r-target.constant)<1e-9)?'assumption:holds':'assumption:failed';break;case'testProportional':answerClaim=target.rates.every(r=>Math.abs(r-target.constant)<1e-9)?'proportional:yes':'proportional:no';break}if(answerNumber!==undefined&&answerClaim===undefined)answerClaim='number:'+round(answerNumber);return{series,target,best,answerNumber,answerClaim,stages:[]}};`;fs.writeFileSync(path.join(out,'schema.js'),stub+"\nexports.placeValueTransformTruth=()=>({answerNumber:0,answerClaim:'stub',stages:[]});");continue}if(dep.endsWith('.json')){fs.mkdirSync(path.dirname(path.join(out,dep)),{recursive:true});fs.copyFileSync(path.join(srcRoot,dep),path.join(out,dep));continue}const opts=[`${dep}.ts`,`${dep}.tsx`,path.join(dep,'index.ts')];const f=opts.find(x=>fs.existsSync(path.join(srcRoot,x)));if(!f)throw Error(`${rel}: unresolved ${dep}`);q.push(f)}}
 const v=require(path.join(out,'variants.js'));
 const forms=[['g8-fn-qualitative-graphs','fgQualSteeper','read'],['g8-fn-qualitative-graphs','fgQualDirection','read'],['g8-fn-qualitative-graphs','fgQualFlattening','read'],['g8-fn-qualitative-graphs','fgQualStopped','read'],['g8-fn-graph-stories','fgStoryAccelerateSteady','build'],['g8-fn-graph-stories','fgStorySteadyStop','build'],['g8-fn-graph-stories','fgStoryIncreasingGrowth','build'],['g8-fn-graph-stories','fgStoryFastStopSlow','build']];
 const bands=['support','core','stretch'];let total=0;const byForm={},byMode={read:0,build:0},mutationSentinels={distanceAwayTruths:0,fallingDistanceDistractors:0,concavityPairs:0,orderedThreeStage:0};
 for(const [gen,form,mode] of forms)for(const band of bands)for(let seed=0;seed<384;seed++){
   const r=v.variantForGenForm(gen,form,`s143-${seed}`,band);if(!r)throw Error(`${gen}/${form}/${band}/${seed}: no variant`);const w=r.widget;
   if(w.type!=='graphStoryLab'||w.mode!==mode)throw Error(`${gen}/${form}/${band}/${seed}: surface ${w.type}/${w.mode}`);
   if(['mcq','numeric','fractionEntry'].includes(w.type))throw Error(`${gen}/${form}/${band}/${seed}: fallback response surface`);
   if(!uniq(w.segments.map(s=>s.id))||!uniq(w.segments.map(s=>s.label)))throw Error(`${gen}/${form}/${band}/${seed}: duplicate segment id/label`);
   if(w.axisContext==='distanceFromOrigin'&&w.distanceRule==='awayOnly'){
     mutationSentinels.distanceAwayTruths++;
     if(w.segments.some(s=>s.kind.startsWith('fall')))throw Error(`${gen}/${form}/${band}/${seed}: away-only truth falls`);
   }
   if(mode==='read'){
     if(!uniq(w.choices.map(c=>c.id))||!uniq(w.choices.map(c=>c.label))||!uniq(w.choices.map(c=>c.claim)))throw Error(`${gen}/${form}/${band}/${seed}: duplicate read choice`);
     const truth=readTruth(w),wins=w.choices.filter(c=>c.claim===truth);if(wins.length!==1)throw Error(`${gen}/${form}/${band}/${seed}: ${wins.length} correct claims for ${truth}`);if(r.answer!==wins[0].id)throw Error(`${gen}/${form}/${band}/${seed}: answer id mismatch`);
     if(w.choices.some(c=>!c.feedback||c.feedback.length<20))throw Error(`${gen}/${form}/${band}/${seed}: weak read feedback`);
     if(form==='fgQualFlattening')mutationSentinels.concavityPairs++;
   }else{
     if(!w.answerLabel||w.answerLabel.length<3)throw Error(`${gen}/${form}/${band}/${seed}: missing authored answer label`);
     if(!uniq(w.bank.map(s=>s.id))||!uniq(w.bank.map(s=>s.label))||!uniq(w.bank.map(s=>s.kind)))throw Error(`${gen}/${form}/${band}/${seed}: duplicate bank identity`);
     if(!uniq(w.wrongSequences.map(x=>x.label))||!uniq(w.wrongSequences.map(x=>key(x.kinds))))throw Error(`${gen}/${form}/${band}/${seed}: duplicate wrong path`);
     const target=key(w.segments.map(s=>s.kind));if(w.wrongSequences.some(x=>key(x.kinds)===target))throw Error(`${gen}/${form}/${band}/${seed}: wrong path equals truth`);
     if(!r.answer||!Array.isArray(r.answer.segmentIds))throw Error(`${gen}/${form}/${band}/${seed}: answer is not constructed stage state`);
     const byId=new Map(w.bank.map(s=>[s.id,s.kind])),actual=r.answer.segmentIds.map(id=>byId.get(id));if(actual.some(x=>!x)||key(actual)!==target)throw Error(`${gen}/${form}/${band}/${seed}: construction answer mismatch`);
     if(w.wrongSequences.some(x=>x.kinds.some(k=>k.startsWith('fall')))&&w.axisContext==='distanceFromOrigin')mutationSentinels.fallingDistanceDistractors++;
     if(w.segments.length===3)mutationSentinels.orderedThreeStage++;
     if(w.wrongSequences.some(x=>!x.feedback||x.feedback.length<20))throw Error(`${gen}/${form}/${band}/${seed}: weak build feedback`);
   }
   total++;byMode[mode]++;byForm[form]=(byForm[form]||0)+1;
 }
 const sourceHash=crypto.createHash('sha256').update(fs.readFileSync(path.join(srcRoot,'variants.ts'))).digest('hex');
 const report={session:143,total,seedsPerBandForm:384,bands,forms:forms.map(([gen,form,mode])=>({gen,form,mode})),byMode,byForm,mutationSentinels,sourceHash,transpiledSourceFiles:[...seen].sort(),transpiledSourceFileCount:seen.size,passed:true};
 fs.writeFileSync(path.join(root,'GRAPH_STORY_VARIANT_SWEEP_S143.json'),JSON.stringify(report,null,2)+'\n');console.log(`graph-story sweep: ${total}/${total}; read ${byMode.read}; build ${byMode.build}; source files ${seen.size}`);
}finally{fs.rmSync(out,{recursive:true,force:true})}
