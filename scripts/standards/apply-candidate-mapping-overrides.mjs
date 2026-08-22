#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
const readJson = (root, p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const writeJson = (root, p, value) => fs.writeFileSync(path.join(root, p), JSON.stringify(value, null, 2) + '\n');

function lessonEvidenceRoles(steps) {
  const roles = new Set(['exposed']);
  if (steps.some((step) => step.kind === 'interactive')) roles.add('constructed');
  if (steps.some((step) => ['check', 'challenge'].includes(step.kind))) roles.add('practiced');
  return [...roles];
}

function deriveBoundedEvidence(steps) {
  const assessedSteps = steps.filter((step) => ['check', 'challenge'].includes(step.kind));
  const assessedWidgets = new Set(assessedSteps.map((step) => step.widget?.type).filter(Boolean));
  const arc = {
    prediction: steps.some((step) => Boolean(step.predict?.prompt && step.predict?.outcomeId && step.predict?.reveal)),
    construction: steps.some((step) => step.kind === 'interactive'),
    linkedConsequence: false,
    explanation: assessedSteps.some((step) => Array.isArray(step.explanationVariants) && step.explanationVariants.length > 0),
    nearMiss: false,
    independentSymbolic: assessedSteps.some((step) => ['numeric', 'mcq'].includes(step.widget?.type)),
    mixedPractice: assessedWidgets.size > 1,
    delayedRetrieval: false,
    unfamiliarTransfer: false,
    cumulativeAssessment: false
  };
  return {
    evidence: {
      exposed: steps.length > 0,
      constructed: arc.construction,
      practiced: assessedSteps.length > 0,
      transferred: false,
      retrievalReady: false,
      cumulative: false
    },
    arc,
    practiceStates: assessedSteps.length,
    masteryArcScore: Object.values(arc).filter(Boolean).length
  };
}

export function applyCandidateMappingOverrides(root, documents) {
  const config = readJson(root, 'content/standards/candidate-mapping-overrides.json');
  const courses = documents.crosswalk.courses;
  const objectives = documents.objectives.objectives;
  const lessonMap = documents.lessonMap.lessons;
  const applied = [];

  for (const override of config.overrides ?? []) {
    const course = readJson(root, `content/courses/${override.courseId}/course.json`);
    if (course.id !== override.courseId || course.gradeLevel !== override.gradeLevel) throw new Error(`Course contract mismatch for ${override.courseId}`);
    const lessons = override.lessonIds.map((lessonId) => readJson(root, `content/courses/${override.courseId}/lessons/${lessonId}.json`));
    const foundTags = new Set(lessons.flatMap((lesson) => (lesson.steps ?? []).map((step) => step.conceptTag).filter(Boolean)));
    for (const tag of override.conceptTags) if (!foundTags.has(tag)) throw new Error(`Missing scoped concept tag ${tag}`);

    const courseRow = {
      courseId: override.courseId, title: override.courseTitle, gradeLevel: override.gradeLevel,
      frameworkRefs: override.courseFrameworkRefs.map((ref) => ({ ...ref, scopeLessonIds: override.lessonIds, scopeConceptTags: override.conceptTags }))
    };
    const existingCourse = courses.findIndex((row) => row.courseId === override.courseId);
    if (existingCourse >= 0) courses.splice(existingCourse, 1, courseRow); else courses.push(courseRow);

    for (const objective of objectives) {
      if (objective.courseId === override.courseId && override.conceptTags.includes(objective.id)) objective.frameworkRefs = [];
    }

    for (const group of override.evidenceGroups) {
      const sourceSteps = lessons.flatMap((lesson) => (lesson.steps ?? [])
        .filter((step) => override.conceptTags.includes(step.conceptTag)));
      const scopedSteps = lessons.flatMap((lesson) => (lesson.steps ?? [])
        .filter((step) => override.conceptTags.includes(step.conceptTag))
        .map((step) => ({ lessonId: lesson.id, stepId: step.id, kind: step.kind, widget: step.widget?.type ?? null, variant: step.variant ?? null })));
      if (!scopedSteps.some((step) => ['check', 'challenge'].includes(step.kind))) throw new Error(`${group.objectiveId} lacks independent evidence`);
      const widgets = [...new Set(scopedSteps.map((step) => step.widget).filter(Boolean))];
      const derived = deriveBoundedEvidence(sourceSteps);
      const objective = {
        id:group.objectiveId, title:group.title, courseId:override.courseId, gradeLevel:override.gradeLevel,
        frameworkRefs:[{
          framework:'CCSS-MATH', code:group.code, label:`Candidate partial alignment to ${group.code}`,
          role:'develop', depth:'standard', status:'provisional-crosswalk', officialUrl:group.officialUrl,
          sourceLocator:group.code,
          mappingRationale:`Bounded Chapter 1 review against the full official ${group.code} expectation; evidence supports only the documented addition strand and must not be reported as full-intent alignment.`
        }],
        lessonIds:[...override.lessonIds], stepRefs:scopedSteps, widgets, representations:[...group.representations],
        directManipulation:{coverage:'none'},
        evidence:derived.evidence, arc:derived.arc,
        practiceStates:derived.practiceStates, masteryArcScore:derived.masteryArcScore,
        partialDecisionEvidence:{ officialTextSnapshot:group.officialTextSnapshot, officialUrl:group.officialUrl, approvedDepth:group.approvedDepth, claimBoundary:group.claimBoundary }
      };
      const existingObjective = objectives.findIndex((row) => row.id === group.objectiveId);
      if (existingObjective >= 0) objectives.splice(existingObjective, 1, objective); else objectives.push(objective);
      applied.push(group.objectiveId);
    }

    for (const lesson of lessons) {
      const taggedSteps = (lesson.steps ?? []).filter((step) => override.conceptTags.includes(step.conceptTag));
      const row = { lessonId:lesson.id, courseId:override.courseId, title:lesson.title, gradeLevel:override.gradeLevel, conceptTags:[...new Set(taggedSteps.map((step)=>step.conceptTag))], maxDesignedLevel:3, evidenceRoles:lessonEvidenceRoles(taggedSteps) };
      const existing = lessonMap.findIndex((entry) => entry.lessonId === lesson.id);
      if (existing >= 0) lessonMap.splice(existing, 1, row); else lessonMap.push(row);
    }
  }
  courses.sort((a,b)=>a.courseId.localeCompare(b.courseId));
  objectives.sort((a,b)=>a.gradeLevel-b.gradeLevel || a.courseId.localeCompare(b.courseId) || a.id.localeCompare(b.id));
  lessonMap.sort((a,b)=>a.courseId.localeCompare(b.courseId) || a.lessonId.localeCompare(b.lessonId));
  return applied;
}

if (isCli) {
  const root = process.cwd();
  const documents = {
    crosswalk:readJson(root,'content/standards/course-crosswalk.json'),
    objectives:readJson(root,'content/standards/objectives.json'),
    lessonMap:readJson(root,'content/standards/lesson-evidence-map.json')
  };
  const applied = applyCandidateMappingOverrides(root, documents);
  writeJson(root,'content/standards/course-crosswalk.json',documents.crosswalk);
  writeJson(root,'content/standards/objectives.json',documents.objectives);
  writeJson(root,'content/standards/lesson-evidence-map.json',documents.lessonMap);
  console.log(`candidate mapping overrides: ${applied.length} objective edges prepared (${applied.join(', ')})`);
}
