#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const capsPath = path.join(root, 'scripts/engine-capabilities.json');
const capsDoc = JSON.parse(fs.readFileSync(capsPath, 'utf8'));
for (const type of ['triangleConstraintLab','coordinateProofLab','solidSliceLab']) {
  capsDoc.types[type] ??= { manip:3, conseq:3, err:3, adapt:3, a11y:3, mobile:3, polish:3 };
}
fs.writeFileSync(capsPath, JSON.stringify(capsDoc, null, 2) + '\n');
const caps = capsDoc.types;
const direct = (type) => Boolean(type && (caps[type]?.manip ?? 0) >= 2);

const graph = new Set(['lineExplore','quadraticExplore','systemsExplore','scatterFit','expLogExplore','secantSlope','derivativeTrace','riemannSum','accumulateArea','slopeField','taylorApprox','signChart','polarTrace','covariationScrubber','verticalLineScanner','coordinateProofLab','relatedRatesLab']);
const table = new Set(['ratioTable','treeDiagram','doubleNumberLine','conditionalTableLab','boxPlot','dotPlot']);
const numberLine = new Set(['numberLinePlace','numberLineHop','lineExplore']);
const concrete = new Set(['fractionBar','barBuilder','areaModel','placeValue','fractionOfSet','percentBar','integerChips','volumeBuilder','netFold','fractionGrid','algebraTiles','tenFrame','baseTenCompose','mixedRegroup','moneyBoard','clockSet','unitRuler','lengthCompare']);

function humanize(tag) {
  return tag.replace(/^(kc|ks|smg1|mmt|pv1000|g7|pr|rno|bv|esn|fg|exp|fn|cr|cpr|cn|ft|lg|co|fna|lc|ca|dr|ia|de|ic|pc|sc)-/,'')
    .replace(/[-_]+/g,' ').replace(/\b\w/g,(c)=>c.toUpperCase());
}
function representations(type) {
  if (numberLine.has(type)) return ['number-line','symbolic'];
  if (table.has(type)) return ['table','symbolic'];
  if (graph.has(type)) return ['graph','symbolic'];
  if (concrete.has(type)) return ['concrete','symbolic'];
  return ['diagram','symbolic'];
}
function kernel(courseId) {
  if (/probability|statistics|sampling|data-distribution|bivariate|inference/.test(courseId)) return 'chance-sampling';
  if (/geometry|triangle|circle|construction|proof|solid|angle|shape|measure|coordinate/.test(courseId)) return 'spatial-invariance';
  if (/function|calculus|derivative|integration|limit|curve|sequence|exponential|logarithm|trig|polar|differential/.test(courseId)) return 'covariation';
  if (/count|addition|subtraction|multiply|division|fraction|decimal|ratio|rate|percent|place-value/.test(courseId)) return 'quantity-composition';
  return 'equivalence-transformation';
}

let filesChanged = 0;
let tagsAdded = 0;
let cmlAdded = 0;
let directSteps = 0;
let unresolved = 0;
const courseStats = {};
for (const courseDir of fs.readdirSync(path.join(root,'content/courses'))) {
  const coursePath = path.join(root,'content/courses',courseDir,'course.json');
  if (!fs.existsSync(coursePath)) continue;
  const course = JSON.parse(fs.readFileSync(coursePath,'utf8'));
  const lessonDir = path.join(root,'content/courses',courseDir,'lessons');
  for (const file of fs.readdirSync(lessonDir).filter((x)=>x.endsWith('.json'))) {
    const full = path.join(lessonDir,file);
    const lesson = JSON.parse(fs.readFileSync(full,'utf8'));
    const tagged = lesson.steps.map((step,index)=>step.conceptTag ? { index, tag:step.conceptTag } : null).filter(Boolean);
    let changed = false;
    for (let index=0; index<lesson.steps.length; index++) {
      const step = lesson.steps[index];
      const type = step.widget?.type;
      if (!direct(type)) continue;
      directSteps++;
      courseStats[course.id] ??= { direct:0, tagsAdded:0, cmlAdded:0 };
      courseStats[course.id].direct++;
      if (!step.conceptTag) {
        const nearest = tagged.length
          ? [...tagged].sort((a,b)=>Math.abs(a.index-index)-Math.abs(b.index-index) || a.index-b.index)[0]
          : null;
        if (nearest) {
          step.conceptTag = nearest.tag;
          tagsAdded++; courseStats[course.id].tagsAdded++; changed = true;
        } else unresolved++;
      }
      if (!step.cml && step.conceptTag) {
        const title = humanize(step.conceptTag);
        const reps = representations(type);
        step.cml = {
          stage:'construct',
          flagship:false,
          kernel:kernel(course.id),
          actionGoal:`Manipulate the model and track how it represents ${title.toLowerCase()}.`,
          invariants:[`The manipulated model and the mathematical relationship for ${title.toLowerCase()} must stay consistent.`],
          misconceptions:[`Changing a visible feature without preserving the relationship that defines ${title.toLowerCase()}.`],
          representations:reps,
          translationFrom:reps[0],
          translationTo:reps[1],
          fadeLevel:0,
          transferFamily:`${course.id}:${step.conceptTag}`,
          delayed:true,
          counterfactualPrompt:'What change would make the model stop representing the same mathematical relationship?'
        };
        cmlAdded++; courseStats[course.id].cmlAdded++; changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(full, JSON.stringify(lesson,null,2)+'\n');
      filesChanged++;
    }
  }
}

const report = {
  schemaVersion:1,
  directSteps,
  filesChanged,
  conceptTagsAdded:tagsAdded,
  cmlContractsAdded:cmlAdded,
  unresolved,
  courseStats:Object.fromEntries(Object.entries(courseStats).sort(([a],[b])=>a.localeCompare(b)))
};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/session98-direct-manipulative-wiring.json'),JSON.stringify(report,null,2)+'\n');
console.log(`direct-manipulative-wiring: ${directSteps} direct steps · ${tagsAdded} tags added · ${cmlAdded} CML contracts added · ${unresolved} unresolved`);
if (unresolved) process.exitCode = 1;
