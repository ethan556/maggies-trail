#!/usr/bin/env node
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const crypto=require('node:crypto');
const cp=require('node:child_process');
const root=process.cwd();
const read=(p)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const sha=(value)=>crypto.createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
const stable=(value)=>Array.isArray(value)?`[${value.map(stable).join(',')}]`:value&&typeof value==='object'?`{${Object.keys(value).sort().map((key)=>`${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`:JSON.stringify(value);
const stableSha=(value)=>crypto.createHash('sha256').update(stable(value)).digest('hex');
const fail=(message)=>{throw new Error(message)};
const assert=(condition,message)=>{if(!condition)fail(message)};

const cert=read('content/mastery/exact-practice-certification.json');
assert(cert.objectiveCount===87,'exact certification objective count');
assert(cert.stateCount===2088,'exact certification state count');
const allStateHashes=new Set();
for(const objective of cert.objectives){
  assert(objective.certificationStatus==='certified-24',`${objective.objectiveId}: certification status`);
  assert(objective.states.length===24,`${objective.objectiveId}: expected 24 states`);
  const widgets=new Set(),prompts=new Set(),difficulty=new Set(),representation=new Set(),context=new Set(),transfer=new Set();
  for(const state of objective.states){
    const widget=state.widget;
    assert(['numeric','mcq'].includes(widget.type),`${state.stateId}: unsupported certified surface`);
    const key=JSON.stringify(widget);
    widgets.add(key);prompts.add(widget.prompt);difficulty.add(state.difficulty);representation.add(state.representation);context.add(state.context);transfer.add(state.transferDistance);
    assert(/^[a-f0-9]{64}$/.test(state.stateHash),`${state.stateId}: invalid state hash`);
    allStateHashes.add(state.stateHash);
    assert(typeof widget.prompt==='string'&&widget.prompt.length>=40,`${state.stateId}: weak prompt`);
    if(widget.type==='numeric'){
      assert(Number.isFinite(widget.answer),`${state.stateId}: numeric answer`);
      assert(Array.isArray(widget.commonErrors)&&widget.commonErrors.length>=2,`${state.stateId}: numeric misconception evidence`);
      const values=new Set([Number(widget.answer).toPrecision(12)]);
      for(const error of widget.commonErrors){assert(Number.isFinite(error.value),`${state.stateId}: invalid error`);values.add(Number(error.value).toPrecision(12));assert(typeof error.feedback==='string'&&error.feedback.length>=20,`${state.stateId}: weak error feedback`)}
      assert(values.size===widget.commonErrors.length+1,`${state.stateId}: answer/error collision`);
    }else{
      assert(Array.isArray(widget.options)&&widget.options.length>=3,`${state.stateId}: mcq options`);
      assert(widget.options.filter((option)=>option.correct).length===1,`${state.stateId}: exactly one correct option`);
      assert(new Set(widget.options.map((option)=>option.label)).size===widget.options.length,`${state.stateId}: duplicate option labels`);
      for(const option of widget.options)assert(typeof option.feedback==='string'&&option.feedback.length>=15,`${state.stateId}: weak option feedback`);
    }
  }
  assert(widgets.size===24,`${objective.objectiveId}: cosmetic duplicate states`);
  assert(prompts.size>=12,`${objective.objectiveId}: insufficient prompt diversity`);
  assert([...['support','core','stretch']].every((x)=>difficulty.has(x)),`${objective.objectiveId}: difficulty coverage`);
  assert([...['symbolic','verbal','table','diagram']].every((x)=>representation.has(x)),`${objective.objectiveId}: representation coverage`);
  assert([...['contextual','non-contextual']].every((x)=>context.has(x)),`${objective.objectiveId}: context coverage`);
  assert([...['near','medium','far']].every((x)=>transfer.has(x)),`${objective.objectiveId}: transfer coverage`);
}

const certPath=path.join(root,'content/mastery/exact-practice-certification.json');
const certBefore=fs.readFileSync(certPath,'utf8');
cp.execFileSync('python',['scripts/build-exact-practice-certification.py'],{cwd:root,stdio:'pipe'});
assert(fs.readFileSync(certPath,'utf8')===certBefore,'exact-practice certification is not deterministic');

const depth=read('content/mastery/practice-depth.json');
assert(depth.objectives.length===1165,'practice-depth objective count');
assert(depth.objectives.every((row)=>row.exactPracticeStates>=20),'all objectives must have 20+ exact states');
assert(depth.objectives.every((row)=>row.familyPracticeStates>=20),'all objectives must have 20+ family states');
assert(depth.objectives.filter((row)=>row.certifiedExactPracticeStates>=24).length===87,'87 certified objective banks');

const sources=read('content/standards/source-registry.json');
const evidence=read('content/standards/evidence-dossiers.json');
const decisions=read('content/standards/human-review-decisions.json');
assert(sources.sources.length===8,'official source registry count');
assert(sources.sources.every((source)=>source.authorityVerified&&/^https:\/\//.test(source.officialUrl)&&source.sourceFingerprint.length===64),'official source provenance');
assert(evidence.dossiers.length===6119,'standards dossier count');
assert(decisions.decisions.length===0,'release may not ship auto-approved standards decisions');
for(const dossier of evidence.dossiers){
  const {dossierHash,...core}=dossier;
  assert(sha(core)===dossierHash,`${dossier.edgeId}: dossier checksum`);
  assert(dossier.review.status==='ready-for-human-review',`${dossier.edgeId}: unexpected automatic review status`);
  assert(dossier.checks.officialAuthoritySource===true,`${dossier.edgeId}: official authority missing`);
  assert(dossier.stepEvidence.length>0,`${dossier.edgeId}: lesson evidence missing`);
  assert(dossier.claimLimit.includes('Not a verified alignment'),`${dossier.edgeId}: claim boundary missing`);
}

const contract=read('content/assessment/diagnostic-calibration-contract.json');
const activePath='content/assessment/calibration/active.json';
const activeText=fs.readFileSync(path.join(root,activePath),'utf8');
const active=JSON.parse(activeText);
assert(contract.instrumentVersion==='maggies-diagnostic-2026.1','instrument version');
assert(contract.collection.explicitConsentRequired===true,'explicit consent gate');
assert(contract.qualityGates.humanApprovalRequired===true,'human approval gate');
assert(active.status==='awaiting-field-data'&&Object.keys(active.parameters).length===0,'runtime must remain provisional before field evidence');
const migration=fs.readFileSync(path.join(root,'db/migrations/004_diagnostic_calibration.sql'),'utf8');
for(const table of ['diagnostic_field_sessions','diagnostic_field_responses','diagnostic_calibration_runs','diagnostic_item_calibrations','diagnostic_scale_links'])assert(migration.includes(`CREATE TABLE ${table}`),`migration missing ${table}`);
for(const forbidden of ['learner_name','email_address','ip_address','prompt_text','free_text'])assert(!migration.toLowerCase().includes(forbidden),`migration contains direct identifier ${forbidden}`);
const route=fs.readFileSync(path.join(root,'src/app/api/diagnostic-calibration/route.ts'),'utf8');
assert(route.includes('validateDiagnosticFieldSubmission')&&route.includes('sessionFor')&&route.includes('rateLimit'),'diagnostic API boundary');
const flow=fs.readFileSync(path.join(root,'src/app/(shell)/placement/PlacementFlow.tsx'),'utf8');
assert(flow.includes('I agree — contribute this diagnostic')&&flow.includes('Download research packet'),'explicit consent/export UI');
const loader=fs.readFileSync(path.join(root,'src/lib/placementBank.server.ts'),'utf8');
assert(loader.includes("active.status !== 'field-calibrated'")&&loader.includes('sampleN < 500'),'runtime promotion guard');

// Deterministic synthetic smoke fixture exercises the complete estimator without becoming evidence.
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'maggies-session100-'));
try{
  let seed=246813579;const rand=()=>((seed=(1664525*seed+1013904223)>>>0)/2**32);const logistic=(x)=>1/(1+Math.exp(-x));
  const itemSeeds=[
    ['p-k-count',-3.25,.9],['p-k-shape',-3.05,.85],['p-g1-maketen',-2.75,1],['p-g1-half',-2.55,.9],['p-g2-regroup',-2.25,1.1],['p-g2-time',-2.05,.95],['p-g3-fraction',-1.75,1.15],['p-g3-groups',-1.55,1.05],['p-g4-addfrac',-1.25,1.2],['p-g4-angle',-1.05,1.15],['p-g5-decimal',-.75,1.1],['p-g5-coordinate',-.55,1.05],['p-g6-ratio',-.25,1.3],['p-g6-mean',-.05,1.15],['p-g7-rate',.25,1.25],['p-g7-prob',.45,1.15],['p-g8-slope',.75,1.35],['p-g8-system',.95,1.25],['p-g9-vertex',1.25,1.35],['p-g9-exp',1.45,1.2],['p-g10-midpoint',1.75,1.25],['p-g10-conditional',1.95,1.35],['p-g11-log',2.25,1.3],['p-g11-inference',2.45,1.25],['p-g12-limit',2.75,1.35],['p-g12-conic',2.95,1.2],['p-g13-derivative',3.15,1.4],['p-g13-integral',3.35,1.3]
  ];
  const packets=[];
  for(let s=0;s<60;s++){
    const theta=-3.2+6.4*(s/59);
    packets.push({analysisGroup:s%2?'B':'A',studyLearnerId:`study:${String(Math.floor(s/2)).padStart(24,'0')}`,packet:{schemaVersion:1,sessionId:`diag:smoke:${String(s).padStart(3,'0')}`,instrumentVersion:contract.instrumentVersion,startGrade:6,completedAt:'2026-07-23T12:00:00.000Z',qualityFlags:[],responses:itemSeeds.map(([itemId,b,a],i)=>{const probability=.25+.75*logistic(a*(theta-b));const correct=rand()<probability;return {position:i+1,itemId,correct,selectedChoice:correct?0:1,confidence:correct?.5:0,responseMs:2500+Math.floor(rand()*5000),provisionalDifficulty:b,provisionalDiscrimination:a};})}});
  }
  const input=path.join(tmp,'packets.json'),output=path.join(tmp,'run.json');
  fs.writeFileSync(input,JSON.stringify(packets));
  cp.execFileSync(process.execPath,['scripts/calibrate-diagnostic.cjs','--input',input,'--output',output,'--population','Synthetic software smoke fixture only; not learner calibration.'],{cwd:root,stdio:'pipe'});
  const run=JSON.parse(fs.readFileSync(output,'utf8'));
  assert(run.source.uniqueSessions===60&&run.items.length===28,'calibration estimator smoke output');
  assert(run.status==='research-only'&&run.qualitySummary.promotionEligible===false,'synthetic smoke must not promote');
  assert(run.growthSummary.learnersWithRepeatedMeasures===30&&run.growthSummary.status==='research-estimate','longitudinal growth smoke output');
  assert(fs.readFileSync(path.join(root,activePath),'utf8')===activeText,'calibration smoke changed runtime parameters');
}finally{fs.rmSync(tmp,{recursive:true,force:true});}

console.log(JSON.stringify({
  exactPractice:{objectives:87,states:2088,allObjectives20Plus:1165},
  standards:{officialSources:8,reviewDossiers:6119,humanApproved:0},
  diagnostic:{instrument:contract.instrumentVersion,status:active.status,syntheticSmoke:'pass'},
  result:'PASS'
},null,2));
