#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const readJSON = (p) => JSON.parse(read(p));
const writeJSON = (p, value) => {
  const full = path.join(root, p);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(value, null, 2) + '\n');
};

const caps = readJSON('scripts/engine-capabilities.json').types;
const direct = (type) => (caps[type]?.manip ?? 0) >= 2;
const consequence = (type) => (caps[type]?.conseq ?? 0) >= 2;
const symbolic = new Set(['numeric','fractionEntry','pointEntry','buildExpression','placeCompare','rationalCompare']);

const frameworks = [
  {
    id: 'CCSS-MATH', name: 'Common Core State Standards for Mathematics', version: 'current canonical spine',
    authority: 'Common Core State Standards Initiative', status: 'official',
    source: 'https://corestandards.org/mathematics-standards/'
  },
  {
    id: 'CA-CCSSM', name: 'California Common Core State Standards: Mathematics', version: 'current',
    authority: 'California Department of Education', status: 'official',
    source: 'https://www.cde.ca.gov/be/st/ss/'
  },
  {
    id: 'NY-NGLS-MATH', name: 'New York State Next Generation Mathematics Learning Standards', version: '2017; fully implemented',
    authority: 'New York State Education Department', status: 'official',
    source: 'https://www.nysed.gov/standards-instruction/mathematics'
  },
  {
    id: 'FL-BEST-MATH', name: 'Florida B.E.S.T. Standards for Mathematics', version: 'adopted 2020',
    authority: 'Florida Department of Education', status: 'official',
    source: 'https://www.fldoe.org/academics/standards/subject-areas/math-science/mathematics/'
  },
  {
    id: 'TX-TEKS-MATH', name: 'Texas Essential Knowledge and Skills for Mathematics', version: 'current Chapter 111',
    authority: 'Texas Education Agency', status: 'official',
    source: 'https://tea.texas.gov/laws-and-rules/texas-administrative-code/19-tac-chapter-111'
  },
  {
    id: 'AP-PRECALCULUS', name: 'AP Precalculus Course Framework', version: '2026-27',
    authority: 'College Board', status: 'official',
    source: 'https://apcentral.collegeboard.org/courses/ap-precalculus'
  },
  {
    id: 'AP-CALCULUS-ABBC', name: 'AP Calculus AB and BC Course Framework', version: '2026-27 clarifications',
    authority: 'College Board', status: 'official',
    source: 'https://apcentral.collegeboard.org/courses/ap-calculus-ab'
  },
  {
    id: 'AP-STATISTICS', name: 'AP Statistics Course Framework', version: 'effective Fall 2026',
    authority: 'College Board', status: 'official',
    source: 'https://apcentral.collegeboard.org/courses/ap-statistics'
  }
];

function ccssDomain(course) {
  const id = course.id;
  const g = course.gradeLevel;
  const has = (...xs) => xs.some((x) => id.includes(x));
  if (g === 0) return has('shape') ? 'K.G' : 'K.CC';
  if (g === 1) {
    if (has('shape')) return '1.G';
    if (has('counting','tens')) return '1.NBT';
    return '1.OA';
  }
  if (g === 2) {
    if (has('shape')) return '2.G';
    if (has('measure','money','time')) return '2.MD';
    if (has('place-value')) return '2.NBT';
    return '2.OA';
  }
  if (g === 3) {
    if (has('fraction')) return '3.NF';
    if (has('measure','data')) return '3.MD';
    if (has('shape')) return '3.G';
    if (has('place-value')) return '3.NBT';
    return '3.OA';
  }
  if (g === 4) {
    if (has('fraction')) return '4.NF';
    if (has('measure')) return '4.MD';
    if (has('line','angle')) return '4.G';
    if (has('place-value','multiply')) return '4.NBT';
    return '4.OA';
  }
  if (g === 5) {
    if (has('fraction')) return '5.NF';
    if (has('volume','measurement')) return '5.MD';
    if (has('coordinate')) return '5.G';
    if (has('decimal','place-value')) return '5.NBT';
    return '5.OA';
  }
  if (g === 6) {
    if (has('ratio','rate')) return '6.RP';
    if (has('number-system')) return '6.NS';
    if (has('expression','equation')) return '6.EE';
    if (has('area','surface','volume')) return '6.G';
    return '6.SP';
  }
  if (g === 7) {
    if (has('proportional')) return '7.RP';
    if (has('rational-number')) return '7.NS';
    if (has('equation')) return '7.EE';
    if (has('geometry')) return '7.G';
    return '7.SP';
  }
  if (g === 8) {
    if (has('real-number')) return '8.NS';
    if (has('exponent','linear-equation','system')) return '8.EE';
    if (has('function')) return '8.F';
    if (has('transform','measurement')) return '8.G';
    return '8.SP';
  }
  if (has('statistics','probability','sampling','bivariate','data-distribution','inference')) return 'HSS';
  if (has('geometry','triangle','circle','similarity','construction','proof','polygon','solid','right-triangle','coordinate-proof')) return 'HSG';
  if (has('complex','vector','matrix','real-number')) return 'HSN';
  if (has('equation','polynomial','radical','rational','exponent')) return 'HSA';
  return 'HSF';
}

function apRefs(course) {
  const id = course.id;
  const refs = [];
  const add = (framework, code, label) => refs.push({ framework, code, label, role: 'develop', depth: 'course-scope', status: 'provisional-crosswalk' });
  if (course.gradeLevel === 12) {
    if (['function-analysis','polynomial-rational-analysis'].includes(id)) add('AP-PRECALCULUS','Unit 1','Polynomial and Rational Functions');
    if (['trig-graphs-inverses','trig-identities-equations'].includes(id)) add('AP-PRECALCULUS','Unit 3','Trigonometric and Polar Functions');
    if (['polar-parametric','vectors-matrices','conic-sections'].includes(id)) add('AP-PRECALCULUS','Unit 4','Functions Involving Parameters, Vectors, and Matrices');
    if (id === 'limits-continuity') add('AP-PRECALCULUS','Bridge','Limits and covariation bridge to calculus');
  }
  if (course.gradeLevel === 13) {
    const map = {
      'derivative-rules':['Units 1-3','Limits, derivative definitions, and derivative rules'],
      'derivatives-in-context':['Unit 4','Contextual applications of differentiation'],
      'curve-analysis':['Unit 5','Analytical applications of differentiation'],
      'integration-accumulation':['Unit 6','Integration and accumulation of change'],
      'differential-equations':['Unit 7','Differential equations'],
      'integration-applications':['Unit 8','Applications of integration'],
      'parametric-polar-calculus':['Unit 9 (BC)','Parametric, polar, and vector-valued functions'],
      'series-convergence':['Unit 10 (BC)','Infinite sequences and series']
    };
    if (map[id]) add('AP-CALCULUS-ABBC',map[id][0],map[id][1]);
  }
  if (['data-distributions','bivariate-statistics','sampling-and-probability','conditional-probability','statistical-inference'].includes(id)) {
    const map = {
      'data-distributions':['Unit 1','Exploring one-variable data'],
      'bivariate-statistics':['Unit 2','Exploring two-variable data'],
      'sampling-and-probability':['Units 3-5','Collecting data, probability, and sampling distributions'],
      'conditional-probability':['Unit 4','Probability, random variables, and probability distributions'],
      'statistical-inference':['Units 6-9','Statistical inference']
    };
    add('AP-STATISTICS',map[id][0],map[id][1]);
  }
  return refs;
}

function stateRefs(course, ccss) {
  const g = course.gradeLevel;
  const refs = [
    { framework:'CA-CCSSM', code:`CA-${ccss}`, label:`Candidate California alignment via ${ccss}`, role:'develop', depth:'course-scope', status:'provisional-crosswalk' },
    { framework:'NY-NGLS-MATH', code:`NY-${ccss}`, label:`Candidate New York alignment via ${ccss}`, role:'develop', depth:'course-scope', status:'provisional-crosswalk' }
  ];
  const flDomain = ccss.split('.').at(-1);
  refs.push({ framework:'FL-BEST-MATH', code:g <= 8 ? `MA.${g}.${flDomain}` : `MA.HS.${flDomain}`, label:`Florida B.E.S.T. ${course.title} scope`, role:'develop', depth:'course-scope', status:'provisional-crosswalk' });
  const txSection = g <= 5 ? `§111.${g + 2}` : g <= 8 ? `§111.${g + 20}` : course.id.includes('geometry') || ['triangle-congruence','similarity','circle-theorems','coordinate-proofs','constructions-and-proof','polygons-quadrilaterals','solid-geometry','right-triangles-trig','geometry-foundations'].includes(course.id) ? '§111.41' : course.gradeLevel === 9 ? '§111.39' : course.gradeLevel === 11 ? '§111.40' : course.gradeLevel === 12 ? '§111.42' : course.id.includes('stat') || course.id.includes('probability') ? '§111.47' : '§111.42';
  refs.push({ framework:'TX-TEKS-MATH', code:txSection, label:`Texas TEKS course/grade scope for ${course.title}`, role:'develop', depth:'course-scope', status:'provisional-crosswalk' });
  return refs;
}

function humanize(tag) {
  return tag.replace(/^(kc|ks|smg1|mmt|pv1000|g7|pr|rno|bv|esn|fg|exp|fn|cr|cpr|cn|ft|lg|co|fna|lc|ca|dr|ia|de|ic|pc|sc)-/,'')
    .replace(/[-_]+/g,' ').replace(/\b\w/g,(c)=>c.toUpperCase());
}

const courses = [];
const lessonRows = [];
const objectives = new Map();
const courseById = new Map();
for (const dir of fs.readdirSync(path.join(root,'content/courses'))) {
  const cp = path.join(root,'content/courses',dir,'course.json');
  if (!fs.existsSync(cp)) continue;
  const course = JSON.parse(fs.readFileSync(cp,'utf8'));
  courseById.set(course.id, course);
  const ccss = ccssDomain(course);
  const refs = [
    { framework:'CCSS-MATH', code:ccss, label:`Candidate alignment to ${ccss}`, role:'develop', depth:'course-scope', status:'provisional-crosswalk' },
    ...stateRefs(course, ccss), ...apRefs(course)
  ];
  courses.push({ courseId:course.id, title:course.title, gradeLevel:course.gradeLevel, frameworkRefs:refs });
  const ld = path.join(root,'content/courses',dir,'lessons');
  for (const file of fs.readdirSync(ld).filter((f)=>f.endsWith('.json'))) {
    const lesson = JSON.parse(fs.readFileSync(path.join(ld,file),'utf8'));
    const tags = [];
    for (const step of lesson.steps ?? []) {
      if (!step.conceptTag) continue;
      tags.push(step.conceptTag);
      let obj = objectives.get(step.conceptTag);
      if (!obj) {
        obj = {
          id:step.conceptTag, title:humanize(step.conceptTag), courseId:course.id, gradeLevel:course.gradeLevel,
          frameworkRefs:refs, lessonIds:new Set(), stepRefs:[], widgets:new Set(), representations:new Set(),
          evidence:{exposed:false,constructed:false,practiced:false,transferred:false,retrievalReady:false,cumulative:false},
          arc:{prediction:false,construction:false,linkedConsequence:false,explanation:false,nearMiss:false,independentSymbolic:false,mixedPractice:false,delayedRetrieval:false,unfamiliarTransfer:false,cumulativeAssessment:false}
        };
        objectives.set(step.conceptTag,obj);
      }
      obj.lessonIds.add(lesson.id);
      obj.stepRefs.push({ lessonId:lesson.id, stepId:step.id, kind:step.kind, widget:step.widget?.type ?? null, variant:step.variant ?? null });
      if (step.widget) obj.widgets.add(step.widget.type);
      for (const r of step.cml?.representations ?? []) obj.representations.add(r);
      obj.evidence.exposed = true;
      obj.arc.prediction ||= Boolean(step.predict);
      obj.arc.explanation ||= Boolean(step.cml?.explanation || step.explanationVariants);
      obj.arc.nearMiss ||= Boolean(step.widget && (caps[step.widget.type]?.err ?? 0) >= 2);
      if (step.widget && direct(step.widget.type)) {
        obj.evidence.constructed = true; obj.arc.construction = true;
      }
      if (step.widget && consequence(step.widget.type)) obj.arc.linkedConsequence = true;
      if (step.widget && symbolic.has(step.widget.type) && ['check','challenge'].includes(step.kind)) obj.arc.independentSymbolic = true;
      if (['check','challenge'].includes(step.kind)) obj.evidence.practiced = true;
      if (step.kind === 'challenge' || step.cml?.transferFamily) {
        obj.evidence.transferred = true; obj.arc.unfamiliarTransfer = true;
      }
      if (step.variant && ['check','challenge'].includes(step.kind)) {
        obj.evidence.retrievalReady = true; obj.arc.delayedRetrieval = true;
      }
      if (step.kind === 'challenge') obj.arc.cumulativeAssessment = true;
    }
    lessonRows.push({ lessonId:lesson.id, courseId:course.id, title:lesson.title, gradeLevel:course.gradeLevel, conceptTags:[...new Set(tags)] });
  }
}

// Determine exact and family-level lab sources. Family-level reuse stays within the same course,
// so the model is mathematically adjacent rather than a percentage-driven random widget injection.
const courseLabs = new Map();
for (const [tag,obj] of objectives) {
  const exact = obj.stepRefs.find((r)=>r.widget && direct(r.widget));
  if (exact && !courseLabs.has(obj.courseId)) courseLabs.set(obj.courseId,{ tag, sourceCourseId:obj.courseId, ...exact });
}
// Explicit concept-family reuse for the two courses without a native direct engine. These are
// mathematically defensible bridges, not arbitrary widget injection: balance preserves equation
// equivalence, while a quadratic parent-function lab exposes the power relation that radicals undo.
const familyCourseBridge = new Map([
  ['solving-equations','two-step-equations'],
  ['radical-functions','quadratics']
]);
for (const [tag,obj] of objectives) {
  const exact = obj.stepRefs.find((r)=>r.widget && direct(r.widget));
  const bridgeCourse = familyCourseBridge.get(obj.courseId);
  const family = exact ?? courseLabs.get(obj.courseId) ?? (bridgeCourse ? courseLabs.get(bridgeCourse) : null) ?? null;
  obj.directManipulation = exact
    ? { coverage:'exact', sourceTag:tag, sourceCourseId:obj.courseId, lessonId:exact.lessonId, stepId:exact.stepId, engine:exact.widget }
    : family
      ? { coverage:'family', sourceTag:family.tag, sourceCourseId:family.sourceCourseId, lessonId:family.lessonId, stepId:family.stepId, engine:family.widget }
      : { coverage:'none' };
  obj.arc.mixedPractice = obj.widgets.size > 1 || obj.lessonIds.size > 1;
  obj.evidence.cumulative = obj.arc.cumulativeAssessment && obj.arc.mixedPractice;
  obj.practiceStates = obj.stepRefs.filter((r)=>r.variant && ['check','challenge'].includes(r.kind)).length > 0 ? 32 : Math.max(1,obj.stepRefs.filter((r)=>['check','challenge'].includes(r.kind)).length);
  const arcCount = Object.values(obj.arc).filter(Boolean).length;
  obj.masteryArcScore = arcCount;
}

const objectiveList = [...objectives.values()].map((o)=>({
  ...o,
  lessonIds:[...o.lessonIds], widgets:[...o.widgets], representations:[...o.representations]
})).sort((a,b)=>a.gradeLevel-b.gradeLevel || a.courseId.localeCompare(b.courseId) || a.id.localeCompare(b.id));

const lessonEvidence = lessonRows.map((l)=>{
  const os = l.conceptTags.map((t)=>objectives.get(t)).filter(Boolean);
  const maxDesignedLevel = os.some((o)=>o.evidence.retrievalReady) ? 5 : os.some((o)=>o.evidence.transferred) ? 4 : os.some((o)=>o.evidence.practiced) ? 3 : os.some((o)=>o.evidence.constructed) ? 2 : 1;
  return { ...l, maxDesignedLevel, evidenceRoles:[...new Set(os.flatMap((o)=>Object.entries(o.evidence).filter(([,v])=>v).map(([k])=>k)))] };
});

const exactCount = objectiveList.filter((o)=>o.directManipulation.coverage==='exact').length;
const familyCount = objectiveList.filter((o)=>o.directManipulation.coverage!=='none').length;
const fullArc = objectiveList.filter((o)=>o.masteryArcScore>=8).length;
const twentyPlus = objectiveList.filter((o)=>o.practiceStates>=20).length;

writeJSON('content/standards/frameworks.json',{ schemaVersion:1, generatedAt:'deterministic', frameworks });
writeJSON('content/standards/course-crosswalk.json',{ schemaVersion:1, generatedAt:'deterministic', courses });
writeJSON('content/standards/objectives.json',{ schemaVersion:1, generatedAt:'deterministic', objectives:objectiveList });
writeJSON('content/standards/lesson-evidence-map.json',{ schemaVersion:1, generatedAt:'deterministic', lessons:lessonEvidence });
writeJSON('content/mastery/mastery-cells.json',{ schemaVersion:1, generatedAt:'deterministic', cells:objectiveList.map((o)=>({
  id:o.id,title:o.title,courseId:o.courseId,gradeLevel:o.gradeLevel,frameworkRefs:o.frameworkRefs,prerequisites:[],representations:o.representations,
  directManipulation:o.directManipulation,practiceStates:o.practiceStates,masteryArc:o.arc,masteryArcScore:o.masteryArcScore,evidence:o.evidence,lessonIds:o.lessonIds
})) });
writeJSON('content/mastery/direct-manipulation-map.json',{ schemaVersion:1, generatedAt:'deterministic', mappings:objectiveList.map((o)=>({ objectiveId:o.id,courseId:o.courseId,...o.directManipulation })) });
writeJSON('content/mastery/infrastructure-metrics.json',{
  schemaVersion:1, objectives:objectiveList.length, lessons:lessonRows.length,
  exactDirectManipulationObjectives:exactCount,
  exactDirectManipulationPct:+(exactCount/objectiveList.length*100).toFixed(2),
  familyLabCoverageObjectives:familyCount,
  familyLabCoveragePct:+(familyCount/objectiveList.length*100).toFixed(2),
  objectivesWithEightOfTenMasteryArcElements:fullArc,
  objectivesWithTwentyPlusPracticeStates:twentyPlus,
  frameworks:frameworks.length,
  crosswalkEdges:objectiveList.reduce((n,o)=>n+o.frameworkRefs.length,0),
  verifiedFullIntentEdges:objectiveList.reduce((n,o)=>n+o.frameworkRefs.filter((r)=>r.status==='verified' && r.depth==='full-intent').length,0),
  provisionalEdges:objectiveList.reduce((n,o)=>n+o.frameworkRefs.filter((r)=>r.status==='provisional-crosswalk').length,0)
});

console.log(`mastery-infrastructure: ${objectiveList.length} objectives · exact direct ${exactCount} (${(exactCount/objectiveList.length*100).toFixed(1)}%) · family lab ${familyCount} (${(familyCount/objectiveList.length*100).toFixed(1)}%) · ≥8/10 arc ${fullArc} · ≥20 states ${twentyPlus}`);
