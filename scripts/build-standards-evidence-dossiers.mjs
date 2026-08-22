#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { decisionStatusOf } from './standards/decision-contract.mjs';

const root = process.cwd();
const read = (p) => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const write = (p,v) => { const f=path.join(root,p); fs.mkdirSync(path.dirname(f),{recursive:true}); fs.writeFileSync(f,JSON.stringify(v,null,2)+'\n'); };
const hash = (v) => crypto.createHash('sha256').update(typeof v === 'string' ? v : JSON.stringify(v)).digest('hex');

const sourceRegistry = {
  schemaVersion: 1,
  verifiedAt: '2026-07-23',
  verificationMethod: 'Official-authority web source metadata verified; standard-to-objective mappings remain subject to human content review.',
  sources: [
    { id:'CCSS-MATH-OFFICIAL', framework:'CCSS-MATH', authority:'Common Core State Standards Initiative', title:'Mathematics Standards', officialUrl:'https://corestandards.org/mathematics-standards/', versionLabel:'2010 standards; canonical spine', authorityVerified:true, contentLocatorRule:'grade/domain/cluster/standard code', claimBoundary:'Official framework source verified; candidate mappings are not automatically full-intent.' },
    { id:'CA-CCSSM-OFFICIAL', framework:'CA-CCSSM', authority:'California Department of Education', title:'California Common Core State Standards for Mathematics', officialUrl:'https://www.cde.ca.gov/be/st/ss/', versionLabel:'Adopted 2010; modified 2013; electronic corrections 2014', authorityVerified:true, contentLocatorRule:'grade/domain/standard code, including CA additions', claimBoundary:'Official source and version verified; mapping requires comparison to full wording and California additions.' },
    { id:'NY-NGLS-MATH-OFFICIAL', framework:'NY-NGLS-MATH', authority:'New York State Education Department', title:'New York State Next Generation Mathematics Learning Standards', officialUrl:'https://www.nysed.gov/standards-instruction/mathematics', versionLabel:'2017 Next Generation standards; implementation transition through 2025-26', authorityVerified:true, contentLocatorRule:'grade/course/domain/standard code', claimBoundary:'Official source verified; Algebra/Geometry/Algebra II transitions and crosswalk notes must be reviewed.' },
    { id:'FL-BEST-MATH-OFFICIAL', framework:'FL-BEST-MATH', authority:'Florida Department of Education', title:'Florida B.E.S.T. Standards for Mathematics', officialUrl:'https://www.fldoe.org/academics/standards/subject-areas/math-science/mathematics/', versionLabel:'Adopted February 12, 2020', authorityVerified:true, contentLocatorRule:'MA.grade.domain.benchmark and MTR code', claimBoundary:'Official source verified; placeholder scope codes must be replaced with exact benchmark codes before approval.' },
    { id:'TX-TEKS-MATH-OFFICIAL', framework:'TX-TEKS-MATH', authority:'Texas Education Agency', title:'19 TAC Chapter 111 — Texas Essential Knowledge and Skills for Mathematics', officialUrl:'https://tea.texas.gov/laws-and-rules/texas-administrative-code/19-tac-chapter-111', versionLabel:'Current Chapter 111; K-8 and high-school course sections listed by TEA', authorityVerified:true, contentLocatorRule:'19 TAC section and student expectation subsection', claimBoundary:'Official course/grade section verified; exact student expectation must be reviewed before approval.' },
    { id:'AP-PRECALCULUS-OFFICIAL', framework:'AP-PRECALCULUS', authority:'College Board', title:'AP Precalculus Course and Exam Description', officialUrl:'https://apcentral.collegeboard.org/courses/ap-precalculus', versionLabel:'Current course framework; 2026-27 clarifications announced without content change', authorityVerified:true, contentLocatorRule:'unit/topic/learning objective/essential knowledge/skill', claimBoundary:'Official framework verified; Unit 4 is not assessed on the AP Exam and must be labelled accordingly.' },
    { id:'AP-CALCULUS-ABBC-OFFICIAL', framework:'AP-CALCULUS-ABBC', authority:'College Board', title:'AP Calculus AB and BC Course and Exam Description', officialUrl:'https://apcentral.collegeboard.org/courses/ap-calculus-ab', versionLabel:'Current course framework; 2026-27 clarifications announced without content change', authorityVerified:true, contentLocatorRule:'AB/BC unit/topic/learning objective/essential knowledge/mathematical practice', claimBoundary:'Official framework verified; AB versus BC scope must be explicit in every approved mapping.' },
    { id:'AP-STATISTICS-OFFICIAL', framework:'AP-STATISTICS', authority:'College Board', title:'AP Statistics Course and Exam Description', officialUrl:'https://apcentral.collegeboard.org/courses/ap-statistics', versionLabel:'Revised framework effective 2026-27', authorityVerified:true, contentLocatorRule:'unit/topic/learning objective/essential knowledge/statistical practice', claimBoundary:'Official revised framework verified; removed and reorganized topics must not inherit old mappings.' }
  ]
};
for (const source of sourceRegistry.sources) source.sourceFingerprint = hash(`${source.framework}|${source.authority}|${source.officialUrl}|${source.versionLabel}`);
write('content/standards/source-registry.json',sourceRegistry);

const sourceByFramework = new Map(sourceRegistry.sources.map((s)=>[s.framework,s]));
const objectives = read('content/standards/objectives.json').objectives;
const reviewsPath='content/standards/human-review-decisions.json';
const reviews = fs.existsSync(path.join(root,reviewsPath)) ? read(reviewsPath) : { schemaVersion:1, decisions:[] };
const decisionByEdge = new Map((reviews.decisions ?? []).map((d)=>[d.edgeId,{...d,decision:decisionStatusOf(d)}]));
const dossiers=[];
for (const objective of objectives) {
  for (const ref of objective.frameworkRefs ?? []) {
    const source=sourceByFramework.get(ref.framework);
    if (!source) throw new Error(`No official source registry entry for ${ref.framework}`);
    const edgeId=hash(`${objective.id}|${ref.framework}|${ref.code}`).slice(0,24);
    const stepEvidence=(objective.stepRefs ?? []).map((s)=>({
      lessonId:s.lessonId, stepId:s.stepId, kind:s.kind, widget:s.widget,
      evidenceRoles:[
        'exposure',
        ...(s.kind==='interactive'?['construction']:[]),
        ...(['check','challenge'].includes(s.kind)?['independent-practice']:[]),
        ...(s.kind==='challenge' && objective.evidence?.transferred===true?['transfer']:[])
      ]
    }));
    const decision=decisionByEdge.get(edgeId) ?? null;
    const exactCode = ref.depth === 'standard' || ref.depth === 'full-intent';
    const checks={
      officialAuthoritySource:source.authorityVerified,
      sourceLocatorPresent:Boolean(ref.code),
      lessonEvidencePresent:stepEvidence.length>0,
      independentPracticePresent:stepEvidence.some((s)=>s.evidenceRoles.includes('independent-practice')),
      transferEvidencePresent:stepEvidence.some((s)=>s.evidenceRoles.includes('transfer')) || objective.evidence?.transferred===true,
      retrievalEvidencePresent:objective.evidence?.retrievalReady===true,
      exactStandardCodeCandidate:exactCode && !/^(CA-|NY-|MA\.|§111\.)/.test(ref.code)
    };
    const dossierCore={
      edgeId, objectiveId:objective.id, objectiveTitle:objective.title, courseId:objective.courseId, gradeLevel:objective.gradeLevel,
      framework:ref.framework, candidateCode:ref.code, candidateLabel:ref.label, candidateRole:ref.role, candidateDepth:ref.depth,
      sourceId:source.id, officialUrl:ref.officialUrl ?? source.officialUrl, sourceVersion:source.versionLabel, sourceLocator:ref.sourceLocator ?? ref.code,
      sourceTextStatus: checks.exactStandardCodeCandidate ? 'exact-code-text-import-required' : 'scope-locator-requires-exact-benchmark',
      mappingRationale:`Review whether the full official expectation at ${ref.code} requires the mathematical action expressed by “${objective.title}”, including grade/course limits, representation, application, reasoning, and practices.`,
      evidenceSummary:{ lessonIds:objective.lessonIds, representations:objective.representations, directManipulation:objective.directManipulation, exactPracticeStates:objective.exactPracticeStates, designedEvidence:objective.evidence },
      stepEvidence, checks,
      claimLimit: decision?.decision === 'approved'
        ? 'Approved only to the reviewer-specified depth and official text snapshot.'
        : decision?.decision === 'partial'
          ? decision.claimBoundary
          : 'Planning/review only. Not a verified alignment or mastery claim.',
      review:{
        status:decision?.decision ?? 'candidate', reviewer:decision?.reviewer ?? null, reviewedAt:decision?.reviewedAt ?? null,
        notes:decision?.notes ?? null, officialTextSnapshot:decision?.officialTextSnapshot ?? null,
        officialSourceUrl:decision?.officialSourceUrl ?? null, claimBoundary:decision?.claimBoundary ?? null,
        approvedDepth:decision?.approvedDepth ?? null
      }
    };
    if (ref.mappingRationale) dossierCore.mappingRationale = ref.mappingRationale;
    dossiers.push({...dossierCore,dossierHash:hash(dossierCore)});
  }
}
const counts={
  total:dossiers.length,
  candidate:dossiers.filter((d)=>d.review.status==='candidate').length,
  partial:dossiers.filter((d)=>d.review.status==='partial').length,
  approved:dossiers.filter((d)=>d.review.status==='approved').length,
  rejected:dossiers.filter((d)=>d.review.status==='rejected').length,
  needsExactBenchmark:dossiers.filter((d)=>d.sourceTextStatus==='scope-locator-requires-exact-benchmark').length
};
write('content/standards/evidence-dossiers.json',{schemaVersion:2,generatedAt:'deterministic',statusContract:['candidate','partial','approved','rejected'],counts,dossiers});
const metrics=read('content/mastery/infrastructure-metrics.json');
const lessonCount=read('content/standards/lesson-evidence-map.json').lessons.length;
const frameworkCount=read('content/standards/frameworks.json').frameworks.length;
const exactManipulationCount=objectives.filter((objective)=>objective.directManipulation?.coverage==='exact').length;
const familyLabCount=objectives.filter((objective)=>objective.directManipulation?.coverage!=='none').length;
const eightOfTenArcCount=objectives.filter((objective)=>objective.masteryArcScore>=8).length;
const twentyPlusPracticeCount=objectives.filter((objective)=>objective.practiceStates>=20).length;
const twentyPlusFamilyCount=objectives.filter((objective)=>objective.practiceStates>=20 && objective.directManipulation?.coverage!=='none').length;
const runtimeArcCount=objectives.filter((objective)=>objective.arc && typeof objective.arc==='object').length;
const percentage=(count,total)=>total ? +(count/total*100).toFixed(2) : 0;
Object.assign(metrics,{
  objectives:objectives.length,
  lessons:lessonCount,
  exactDirectManipulationObjectives:exactManipulationCount,
  exactDirectManipulationPct:percentage(exactManipulationCount,objectives.length),
  familyLabCoverageObjectives:familyLabCount,
  familyLabCoveragePct:percentage(familyLabCount,objectives.length),
  objectivesWithEightOfTenMasteryArcElements:eightOfTenArcCount,
  objectivesWithTwentyPlusPracticeStates:twentyPlusPracticeCount,
  frameworks:frameworkCount,
  crosswalkEdges:counts.total,
  verifiedFullIntentEdges:objectives.reduce((total,objective)=>total+(objective.frameworkRefs??[]).filter((ref)=>ref.status==='verified' && ref.depth==='full-intent').length,0),
  provisionalEdges:objectives.reduce((total,objective)=>total+(objective.frameworkRefs??[]).filter((ref)=>ref.status==='provisional-crosswalk').length,0),
  objectivesWithTwentyPlusFamilyStates:twentyPlusFamilyCount,
  exactPracticeDepthPct:percentage(twentyPlusPracticeCount,objectives.length),
  familyPracticeDepthPct:percentage(twentyPlusFamilyCount,objectives.length),
  objectivesWithRuntimeMasteryArc:runtimeArcCount,
  runtimeMasteryArcPct:percentage(runtimeArcCount,objectives.length),
  officialSourceRegistryCount:sourceRegistry.sources.length,
  reviewReadyEdges:counts.candidate,
  humanPartialEdges:counts.partial,
  humanApprovedEdges:counts.approved,
  humanRejectedEdges:counts.rejected,
  edgesNeedingExactBenchmark:counts.needsExactBenchmark
});
write('content/mastery/infrastructure-metrics.json',metrics);
// Compatibility for the legacy console label only; persisted schema uses `candidate`.
counts.ready=counts.candidate;
console.log(`standards evidence dossiers: ${counts.total} edges · ${counts.ready} ready · ${counts.approved} approved · ${counts.rejected} rejected`);
