#!/usr/bin/env node
const fs=require('node:fs'),path=require('node:path'),child=require('node:child_process'),os=require('node:os'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
function loadTs(){const c=[path.join(root,'node_modules/typescript/lib/typescript.js'),'/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js','/opt/nvm/versions/node/v22.22.2/lib/node_modules/typescript/lib/typescript.js'];try{c.unshift(path.join(child.execFileSync('npm',['root','-g'],{encoding:'utf8'}).trim(),'typescript/lib/typescript.js'))}catch{}const f=c.find(fs.existsSync);if(!f)throw Error('TypeScript unavailable');return require(f)}
const ts=loadTs(),srcRoot=path.join(root,'src/lib'),out=fs.mkdtempSync(path.join(os.tmpdir(),'s145-place-value-'));
const clean=n=>{const x=Math.round(n*1e12)/1e12;return Object.is(x,-0)?0:x},near=(a,b)=>Math.abs(a-b)<1e-9,uniq=xs=>new Set(xs).size===xs.length;
const pow=e=>10**e;
function digitAt(v,e){return Math.floor(Math.abs(v)/pow(e)+1e-9)%10}
function deciding(a,b){const max=Math.max(0,Math.floor(Math.log10(Math.max(Math.abs(a),Math.abs(b),1e-12))));for(let e=max;e>=-12;e--)if(digitAt(a,e)!==digitAt(b,e))return e;return -12}
function roundExp(v,e){const unit=pow(e);return clean(Math.round((v+Number.EPSILON*Math.sign(v||1))/unit)*unit)}
function intScale(v){for(let e=0;e<=12;e++)if(Math.abs(v*pow(e)-Math.round(v*pow(e)))<1e-9)return e;return 12}
function scientific(v){const e=Math.floor(Math.log10(Math.abs(v)));return{coefficient:clean(v/pow(e)),exponent:e}}
function derive(w){let n,claim,relation,scaleExponent,decidingExponent;const stages=[];const values=w.values;switch(w.task){
 case'shift':{const shift=w.shiftExponent;for(let i=1;i<=Math.abs(shift);i++)stages.push(`shift:${i}`);n=clean(values[0]*pow(shift));break}
 case'identifyShift':claim='shift:'+Math.round(Math.log10(values[1]/values[0]));stages.push('compare:start','compare:end');break;
 case'compare':case'decidingPlace':{relation=near(values[0],values[1])?'eq':values[0]<values[1]?'lt':'gt';decidingExponent=deciding(values[0],values[1]);const max=Math.max(0,Math.floor(Math.log10(Math.max(Math.abs(values[0]),Math.abs(values[1]),1e-12))));for(let e=max;e>=decidingExponent;e--)stages.push(`place:${e}`);claim=w.task==='compare'?`relation:${relation}`:`place:${decidingExponent}`;break}
 case'round':n=roundExp(values.reduce((a,b)=>a+b,0),w.targetExponent);stages.push('round:exact','round:target','round:decider');break;
 case'roundPartsThenSum':n=clean(values.map(v=>roundExp(v,w.targetExponent)).reduce((a,b)=>a+b,0));values.forEach((_,i)=>stages.push(`round:part:${i}`));stages.push('round:sum');break;
 case'roundMethod':claim='method:exact-then-round';stages.push('method:exact','method:parts');break;
 case'roundGapCause':{const ds=values.map(v=>Math.sign(roundExp(v,w.targetExponent)-v)),k=ds.every(d=>d>0)?'both-up':ds.every(d=>d<0)?'both-down':'mixed';claim=`bias:${k}`;values.forEach((_,i)=>stages.push(`gap:part:${i}`));stages.push('gap:exact');break}
 case'decimalDivision':scaleExponent=intScale(values[1]);stages.push(scaleExponent>0?'division:scale':'division:place','division:quotient');n=clean(values[0]/values[1]);break;
 case'divisionFirstMove':scaleExponent=intScale(values[1]);claim=`scale:${scaleExponent}`;stages.push('division:source','division:scale');break;
 case'exponentChain':{let total=values[0];stages.push('exponent:0');for(let i=1;i<values.length;i++){total=w.exponentOps[i-1]==='add'?total+values[i]:total-values[i];stages.push(`exponent:${i}`)}n=clean(total);break}
 case'placeExponent':claim=`place-exponent:${w.targetExponent}`;stages.push('power:place');break;
 case'scientificForm':{const s=scientific(values[0]);claim=`scientific:${s.coefficient}:${s.exponent}`;stages.push('scientific:coefficient','scientific:exponent');break}
 case'evaluatePowerTen':n=clean(values[0]*pow(w.targetExponent));stages.push('power:coefficient','power:shift');break;
 default:throw Error('unknown task '+w.task)
 }if(n!==undefined&&!claim)claim='number:'+clean(n);return{n,claim,relation,scaleExponent,decidingExponent,stages}}
try{
 const q=['variants.ts'],seen=new Set();while(q.length){const rel=q.shift();if(seen.has(rel))continue;seen.add(rel);const text=fs.readFileSync(path.join(srcRoot,rel),'utf8');const tr=ts.transpileModule(text,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true},reportDiagnostics:true,fileName:rel});const errs=(tr.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error);if(errs.length)throw Error(`${rel}: transpile diagnostics ${errs.map(e=>e.messageText).join(';')}`);const js=tr.outputText,dest=path.join(out,rel.replace(/\.tsx?$/,'.js'));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,js);for(const m of js.matchAll(/require\(["']\.\/(.+?)["']\)/g)){const dep=m[1];if(dep==='schema'){const stub=`const clean=n=>{const x=Math.round(n*1e12)/1e12;return Object.is(x,-0)?0:x};const pow=e=>10**e;const digit=(v,e)=>Math.floor(Math.abs(v)/pow(e)+1e-9)%10;const deciding=(a,b)=>{const m=Math.max(0,Math.floor(Math.log10(Math.max(Math.abs(a),Math.abs(b),1e-12))));for(let e=m;e>=-12;e--)if(digit(a,e)!==digit(b,e))return e;return -12};const scale=v=>{for(let e=0;e<=12;e++)if(Math.abs(v*pow(e)-Math.round(v*pow(e)))<1e-9)return e;return 12};exports.placeValueTransformTruth=s=>{let answerNumber,answerClaim,relation,scaleExponent,decidingExponent;const stages=[],v=s.values;switch(s.task){case'shift':for(let i=1;i<=Math.abs(s.shiftExponent);i++)stages.push({key:'shift:'+i});answerNumber=clean(v[0]*pow(s.shiftExponent));break;case'identifyShift':answerClaim='shift:'+Math.round(Math.log10(v[1]/v[0]));stages.push({key:'compare:start'},{key:'compare:end'});break;case'compare':case'decidingPlace':relation=Math.abs(v[0]-v[1])<1e-12?'eq':v[0]<v[1]?'lt':'gt';decidingExponent=deciding(v[0],v[1]);for(let e=Math.max(0,Math.floor(Math.log10(Math.max(Math.abs(v[0]),Math.abs(v[1]),1e-12))));e>=decidingExponent;e--)stages.push({key:'place:'+e});answerClaim=s.task==='compare'?'relation:'+relation:'place:'+decidingExponent;break;case'round':answerNumber=clean(Math.round(v.reduce((a,b)=>a+b,0)/pow(s.targetExponent))*pow(s.targetExponent));stages.push({key:'round:exact'},{key:'round:target'},{key:'round:decider'});break;case'roundPartsThenSum':answerNumber=clean(v.map(x=>clean(Math.round(x/pow(s.targetExponent))*pow(s.targetExponent))).reduce((a,b)=>a+b,0));v.forEach((_,i)=>stages.push({key:'round:part:'+i}));stages.push({key:'round:sum'});break;case'roundMethod':answerClaim='method:exact-then-round';stages.push({key:'method:exact'},{key:'method:parts'});break;case'roundGapCause':{const ds=v.map(x=>Math.sign(clean(Math.round(x/pow(s.targetExponent))*pow(s.targetExponent))-x)),k=ds.every(d=>d>0)?'both-up':ds.every(d=>d<0)?'both-down':'mixed';answerClaim='bias:'+k;v.forEach((_,i)=>stages.push({key:'gap:part:'+i}));stages.push({key:'gap:exact'});break}case'decimalDivision':scaleExponent=scale(v[1]);stages.push({key:scaleExponent>0?'division:scale':'division:place'},{key:'division:quotient'});answerNumber=clean(v[0]/v[1]);break;case'divisionFirstMove':scaleExponent=scale(v[1]);answerClaim='scale:'+scaleExponent;stages.push({key:'division:source'},{key:'division:scale'});break;case'exponentChain':{let t=v[0];stages.push({key:'exponent:0'});for(let i=1;i<v.length;i++){t=s.exponentOps[i-1]==='add'?t+v[i]:t-v[i];stages.push({key:'exponent:'+i})}answerNumber=clean(t);break}case'placeExponent':answerClaim='place-exponent:'+s.targetExponent;stages.push({key:'power:place'});break;case'scientificForm':{const e=Math.floor(Math.log10(Math.abs(v[0]))),c=clean(v[0]/pow(e));answerClaim='scientific:'+c+':'+e;stages.push({key:'scientific:coefficient'},{key:'scientific:exponent'});break}case'evaluatePowerTen':answerNumber=clean(v[0]*pow(s.targetExponent));stages.push({key:'power:coefficient'},{key:'power:shift'});break}if(answerNumber!==undefined&&!answerClaim)answerClaim='number:'+clean(answerNumber);return{answerNumber,answerClaim,relation,scaleExponent,decidingExponent,stages}};exports.proportionalReasoningTruth=s=>({answerNumber:0,answerClaim:'stub',stages:[]});`;fs.writeFileSync(path.join(out,'schema.js'),stub);continue}if(dep.endsWith('.json')){fs.mkdirSync(path.dirname(path.join(out,dep)),{recursive:true});fs.copyFileSync(path.join(srcRoot,dep),path.join(out,dep));continue}const opts=[`${dep}.ts`,`${dep}.tsx`,path.join(dep,'index.ts')],f=opts.find(x=>fs.existsSync(path.join(srcRoot,x)));if(!f)throw Error(`${rel}: unresolved ${dep}`);q.push(f)}}
 const v=require(path.join(out,'variants.js'));
 const forms={
  'g4-place-million':['pvRoundingNumeric','pvRoundingMcq'],
  'ladder-shift':['default','mulTwice','divTenth','divThrice'],
  'decimal-shift-divide':['default','shiftBoth','bareDivide'],
  'round-place':['contextWhole','contextTenth','deciderMcq'],
  'place-compare':['decimalTie','decimalMixed','decimalClose','decidingPlace'],
  'power-ten-exponent':['default','negDivide','negMultiply','threeStep'],
  'g8-esn-place-value':['esnPlaceMcq','esnPlacePositive','esnPlaceNegative','esnPlaceLarge']
 };
 const expectedTasks={
  'g4-place-million':()=> 'round','ladder-shift':()=> 'shift','decimal-shift-divide':()=> 'decimalDivision',
  'round-place':f=>f==='deciderMcq'?'placeExponent':'round','place-compare':f=>f==='decidingPlace'?'decidingPlace':'compare',
  'power-ten-exponent':()=> 'exponentChain','g8-esn-place-value':f=>f==='esnPlaceMcq'?'scientificForm':'evaluatePowerTen'};
 const bands=['support','core','stretch'];let total=0,numeric=0,choice=0,negativeExponents=0,decimalDivisors=0;const byForm={};
 for(const [gen,list] of Object.entries(forms))for(const form of list)for(const band of bands)for(let seed=0;seed<384;seed++){
  const r=v.variantForGenForm(gen,form,`s145-${seed}`,band);if(!r)throw Error(`${gen}/${form}/${band}/${seed}: no variant`);const w=r.widget;if(w.type!=='placeValueTransformLab')throw Error(`${gen}/${form}/${band}/${seed}: fallback ${w.type}`);
  if(w.task!==expectedTasks[gen](form))throw Error(`${gen}/${form}/${band}/${seed}: task ${w.task}`);
  const t=derive(w);if(w.requiredExplorations>t.stages.length)throw Error(`${gen}/${form}/${band}/${seed}: impossible exploration ${w.requiredExplorations}/${t.stages.length}`);
  if(!uniq(t.stages))throw Error(`${gen}/${form}/${band}/${seed}: duplicate exploration key`);
  if(w.answerMode==='numeric'){
   numeric++;if(typeof t.n!=='number'||typeof r.answer!=='number'||!near(r.answer,t.n))throw Error(`${gen}/${form}/${band}/${seed}: numeric mismatch ${r.answer}/${t.n}`);
   if(w.choices.length)throw Error(`${gen}/${form}/${band}/${seed}: numeric carries choices`);
   if(!uniq(w.numericErrors.map(x=>x.value)))throw Error(`${gen}/${form}/${band}/${seed}: duplicate numeric trap`);
   if(w.numericErrors.some(x=>near(x.value,t.n)))throw Error(`${gen}/${form}/${band}/${seed}: trap collides with truth`);
  }else{
   choice++;if(!uniq(w.choices.map(x=>x.id))||!uniq(w.choices.map(x=>x.label)))throw Error(`${gen}/${form}/${band}/${seed}: duplicate choice identity`);
   const carriers=w.choices.map(x=>x.claim??(typeof x.value==='number'?`number:${clean(x.value)}`:''));if(!uniq(carriers))throw Error(`${gen}/${form}/${band}/${seed}: duplicate mathematical carrier`);
   if(w.choices.some(x=>(typeof x.claim==='string')===(typeof x.value==='number')))throw Error(`${gen}/${form}/${band}/${seed}: invalid truth carrier count`);
   const wins=w.choices.filter(x=>(typeof x.value==='number'&&typeof t.n==='number'&&near(x.value,t.n))||x.claim===t.claim);if(wins.length!==1||r.answer!==wins[0].id)throw Error(`${gen}/${form}/${band}/${seed}: choice mismatch ${r.answer}/${wins.map(x=>x.id)}`);
  }
  if((w.targetExponent??0)<0)negativeExponents++;
  if(w.task==='decimalDivision'&&!Number.isInteger(w.values[1]))decimalDivisors++;
  if(!w.successFeedback||!w.explorationFeedback||!w.fallbackFeedback)throw Error(`${gen}/${form}/${band}/${seed}: feedback route missing`);
  total++;byForm[`${gen}@${form}`]=(byForm[`${gen}@${form}`]||0)+1;
 }
 const sourceHash=crypto.createHash('sha256').update(fs.readFileSync(path.join(srcRoot,'variants.ts'))).digest('hex');
 const report={session:145,engine:'placeValueTransformLab',total,seedsPerBandForm:384,bands,forms:Object.entries(forms).flatMap(([gen,list])=>list.map(form=>({gen,form}))),byForm,answerModes:{numeric,choice},sentinels:{negativeExponents,decimalDivisors},sourceHash,transpiledSourceFiles:[...seen].sort(),passed:total===27648};
 fs.writeFileSync(path.join(root,'PLACE_VALUE_TRANSFORM_VARIANT_SWEEP_S145.json'),JSON.stringify(report,null,2)+'\n');console.log(`place-value sweep: ${total}/${total}; numeric ${numeric}; choice ${choice}; source files ${seen.size}`);
}finally{fs.rmSync(out,{recursive:true,force:true})}
