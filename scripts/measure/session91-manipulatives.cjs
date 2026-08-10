const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');

require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true }
}).outputText, f);

function loadEvaluate() {
  const src = fs.readFileSync('src/lib/evaluate.ts', 'utf8');
  const js = ts.transpileModule(src, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
  const mod = { exports: {} };
  const custom = (id) => {
    if (id === './schema') return { columnCalcTruth() { throw new Error('unused'); }, mixedRegroupTruth() { throw new Error('unused'); } };
    if (id === './mathUtils') return require('../../src/lib/mathUtils.ts');
    return require(id);
  };
  new Function('module', 'exports', 'require', '__filename', '__dirname', js)(mod, mod.exports, custom, 'src/lib/evaluate.ts', 'src/lib');
  return mod.exports;
}

const { evaluate, canCheck, correctAnswerText } = loadEvaluate();
const { buildCMLMesh } = require('../../src/lib/cml/mesh.ts');
const TYPES = new Set(['lineRelationLab','triangleAngleLab','verticalLineScanner','covariationScrubber','samplingBiasLab','shapeFamilyBuilder','unitRuler']);
const EXPECTED = { lineRelationLab:2, triangleAngleLab:1, verticalLineScanner:1, covariationScrubber:3, samplingBiasLab:3, shapeFamilyBuilder:3, unitRuler:3 };
const found = [];
for (const p of walk('content/courses')) {
  if (!p.endsWith('.json') || p.endsWith('/course.json')) continue;
  let lesson; try { lesson = JSON.parse(fs.readFileSync(p, 'utf8')); } catch { continue; }
  for (const step of lesson.steps || []) if (TYPES.has(step.widget?.type)) found.push({ p, lesson, step, spec: step.widget });
}
assert.equal(found.length, 16, 'expected 16 integrated lesson steps');
const counts = Object.fromEntries([...TYPES].map(t => [t, found.filter(x => x.spec.type === t).length]));
assert.deepStrictEqual(counts, EXPECTED);

let assertions = 0, evaluatorCases = 0, meshCards = 0;
function check(cond, message) { assert(cond, message); assertions++; }
function ev(spec, value, correct, feedback) {
  const r = evaluate(spec, value); evaluatorCases++;
  check(r.correct === correct, `${spec.type}: expected correct=${correct}, got ${r.correct}`);
  if (feedback) check(r.feedback === feedback, `${spec.type}: unexpected feedback`);
}
function angleAt(a,b,c){
  const u=[b[0]-a[0],b[1]-a[1]], v=[c[0]-a[0],c[1]-a[1]];
  const den=Math.hypot(...u)*Math.hypot(...v);
  return Math.acos(Math.max(-1,Math.min(1,(u[0]*v[0]+u[1]*v[1])/den)))*180/Math.PI;
}

for (const { p, step, spec } of found) {
  check(step.cml?.flagship === true, `${p}/${step.id} is not flagship`);
  check(!!step.predict?.outcomeId, `${p}/${step.id} lacks prediction commitment`);
  check(Array.isArray(step.cml?.invariants) && step.cml.invariants.length > 0, `${p}/${step.id} lacks invariant`);
  check(Array.isArray(step.cml?.misconceptions) && step.cml.misconceptions.length > 0, `${p}/${step.id} lacks misconception model`);
  check(!!step.cml?.counterfactualPrompt, `${p}/${step.id} lacks counterfactual`);
  check(!!step.cml?.translationFrom && !!step.cml?.translationTo, `${p}/${step.id} lacks representation translation`);
  check(step.cml?.delayed === true && !!step.cml?.transferFamily, `${p}/${step.id} lacks delayed transfer`);
  const exp = step.cml?.explanation;
  check(exp?.options?.filter(o => o.correct).length === 1, `${p}/${step.id} explanation must have one correct option`);
  const mesh = buildCMLMesh(spec, null);
  check(Array.isArray(mesh.cards) && mesh.cards.length >= 3, `${spec.type} mesh too thin`);
  check(typeof mesh.narration === 'string' && mesh.narration.length > 20, `${spec.type} mesh narration missing`);
  meshCards += mesh.cards.length;
  check(typeof correctAnswerText(spec) === 'string' && correctAnswerText(spec).length > 6, `${spec.type} correct-answer text missing`);

  switch(spec.type) {
    case 'lineRelationLab': {
      const value = spec.targetRelation === 'parallel'
        ? { angle: spec.baseAngle, offset: 2, moves: spec.requiredMoves }
        : { angle: spec.baseAngle + 90, offset: 1, moves: spec.requiredMoves };
      const raw=Math.abs(((value.angle-spec.baseAngle)%180+180)%180), diff=Math.min(raw,180-raw);
      check((spec.targetRelation==='parallel' ? diff===0 && value.offset!==0 : diff===90), 'independent line-relation truth failed');
      check(canCheck(spec,value), 'lineRelationLab cannot check valid state');
      ev(spec,value,true,spec.successFeedback);
      ev(spec,{...value,moves:spec.requiredMoves-1},false,spec.distanceFeedback);
      ev(spec,{...value,angle:spec.baseAngle+35},false,spec.angleFeedback);
      if(spec.targetRelation==='parallel') ev(spec,{...value,offset:0},false,spec.distanceFeedback);
      break;
    }
    case 'triangleAngleLab': {
      const value={x:5,y:5,moves:spec.requiredMoves};
      const A=angleAt(spec.fixedA,spec.fixedB,[value.x,value.y]);
      check(Math.abs(A-spec.targetAngleA)<=spec.tolerance, `independent triangle target failed: ${A}`);
      ev(spec,value,true,spec.successFeedback);
      ev(spec,{...value,moves:0},false,spec.invariantFeedback);
      ev(spec,{x:4,y:7,moves:spec.requiredMoves},false,spec.targetFeedback);
      break;
    }
    case 'verticalLineScanner': {
      const max = spec.relation==='circle' ? 2 : 1;
      check((max>1?'not-function':'function')===spec.targetVerdict, 'independent scanner verdict failed');
      const value={maxIntersections:max,sweeps:spec.requiredSweeps,verdict:spec.targetVerdict};
      check(canCheck(spec,value), 'vertical scanner cannot check verdict');
      ev(spec,value,true,spec.successFeedback);
      ev(spec,{...value,sweeps:spec.requiredSweeps-1},false,spec.moreSweepFeedback);
      ev(spec,{...value,verdict:spec.targetVerdict==='function'?'not-function':'function'},false,spec.verdictFeedback);
      break;
    }
    case 'covariationScrubber': {
      const y=spec.a*spec.targetInput+spec.b;
      check(Number.isFinite(y), 'covariation output not finite');
      ev(spec,spec.targetInput,true,spec.successFeedback);
      ev(spec,spec.targetInput-1,false,spec.lowFeedback);
      ev(spec,spec.targetInput+1,false,spec.highFeedback);
      break;
    }
    case 'samplingBiasLab': {
      const value={method:spec.targetMethod,size:spec.targetSize,draws:spec.requiredDraws};
      check(value.size>=spec.targetSize && value.draws>=spec.requiredDraws, 'independent sampling threshold failed');
      ev(spec,value,true,spec.successFeedback);
      const wrongMethod=spec.targetMethod==='random'?'convenience':'random';
      ev(spec,{...value,method:wrongMethod},false,spec.methodFeedback);
      ev(spec,{...value,size:spec.targetSize-spec.sizeStep},false,spec.sizeFeedback);
      ev(spec,{...value,draws:spec.requiredDraws-1},false,spec.drawsFeedback);
      break;
    }
    case 'shapeFamilyBuilder': {
      const value={sides:spec.targetSides,rightAngles:spec.targetRightAngles,equalSides:spec.targetEqualSides,parallelPairs:spec.targetParallelPairs};
      check(Object.entries(value).every(([,v])=>Number.isInteger(v)&&v>=0), 'independent shape attributes invalid');
      ev(spec,value,true,spec.successFeedback);
      ev(spec,{...value,sides:Math.max(3,spec.targetSides-1)},false,spec.sidesFeedback);
      ev(spec,{...value,rightAngles:value.rightAngles===0?1:value.rightAngles-1},false,spec.attributesFeedback);
      break;
    }
    case 'unitRuler': {
      const physical=spec.objectEnd-spec.objectStart;
      check(Math.abs(physical-spec.requiredPlacements*spec.targetUnitSize)<1e-9, 'ruler target does not cover object');
      const value={zeroAligned:true,unitSize:spec.targetUnitSize,placements:spec.requiredPlacements,spacing:'exact'};
      ev(spec,value,true,spec.successFeedback);
      ev(spec,{...value,zeroAligned:false},false,spec.alignFeedback);
      ev(spec,{...value,spacing:'gap'},false,spec.gapOverlapFeedback);
      const wrongUnit=spec.allowedUnitSizes.find(x=>x!==spec.targetUnitSize);
      if(wrongUnit!==undefined) ev(spec,{...value,unitSize:wrongUnit},false,spec.unitFeedback);
      ev(spec,{...value,placements:Math.max(0,spec.requiredPlacements-1)},false,spec.gapOverlapFeedback);
      break;
    }
  }
}

const renderer=fs.readFileSync('src/components/widgets.tsx','utf8');
const samples=fs.readFileSync('src/components/widgetSamples.ts','utf8');
const catalog=fs.readFileSync('src/lib/cml/catalog.ts','utf8');
const capabilities=JSON.parse(fs.readFileSync('scripts/engine-capabilities.json','utf8')).types;
for(const type of TYPES){
  check(renderer.includes(`case "${type}"`), `${type} missing renderer case`);
  check(new RegExp(`type\s*:\s*["\']${type}["\']`).test(samples), `${type} missing gallery sample`);
  check(new RegExp(`^  ${type}: \\{`,'m').test(catalog), `${type} missing CML profile`);
  check(capabilities[type]?.manip===3 && capabilities[type]?.conseq===3, `${type} capability profile below flagship`);
}

console.log(JSON.stringify({ integratedSteps:found.length, counts, evaluatorCases, assertions, meshCards, status:'PASS' }));

function* walk(root){
  for(const ent of fs.readdirSync(root,{withFileTypes:true})){
    const p=path.join(root,ent.name);
    if(ent.isDirectory()) yield* walk(p); else yield p;
  }
}
