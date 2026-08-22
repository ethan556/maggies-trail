import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadLessonReviewAuthority } from "../../../scripts/audit/lesson-review-authority-s246.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const candidatePath = path.join(here, "S248_MULT_FLUENCY_G3_TRIPLE_DISPOSITIONS.jsonl");
const assessmentPath = path.join(here, "S248_MULT_FLUENCY_G3_TRIPLE_DISPOSITIONS_ASSESSMENT.md");
const ledgerPath = path.join(root, "reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl");
const cardsPath = path.join(root, "reports/closure/LESSON_REVIEW_CARDS_S244.json");
const queuePath = path.join(root, "PREMIUM_PENDING_WORKLOAD_QUEUE.csv");
const coursePath = path.join(root, "content/courses/mult-fluency-g3/course.json");
const figuresPath = path.join(root, "src/components/figures.tsx");
const implementationReport = "reports/pedagogy/S248_MULT_FLUENCY_G3_WHOLE_COURSE_REPAIR.md";
const implementationTest = "src/lib/session248.multFluencyG3CourseIntegrity.test.ts";
const repairScript = "scripts/audit/repair-mult-fluency-g3-s248.mjs";
const reviewer = "ChatGPT Work independent assessor (mult-fluency-g3 S248)";
const reviewedAt = "2026-08-18T19:00:00.000Z";

const expected = {
  "mf3-01-01": ["KEEP", "SUFFICIENT", "FIT", "The doubling figure, two distinct exact arrays, misconception correction, transfer problem, and remedial pair agree mathematically and form an appropriate Grade 3 ×2 fluency sequence."],
  "mf3-01-02": ["KEEP", "SUFFICIENT", "FIT", "The equal-groups figure, 3-by-7 and 3-by-8 arrays, addition-versus-multiplication correction, transfer, and remedial evidence are truthful, distinct, and Grade 3 readable."],
  "mf3-01-03": ["KEEP", "SUFFICIENT", "FIT", "The double-double visual precisely models ×4, the two arrays change operands, later checks require model reading and misconception correction, and the language and remedial remain clear."],
  "mf3-01-04": ["KEEP", "SUFFICIENT", "FIT", "The fives-pattern figure and prediction truthfully distinguish endings in 5 or 0; the two arrays, pattern continuation, transfer, feedback, and remedial form a coherent Grade 3 sequence."],
  "mf3-01-05": ["KEEP", "SUFFICIENT", "FIT", "The break-apart representation supports deriving ×6 from ×3, the two arrays use different facts, and the numeric checks, feedback, transfer, and remedial are mathematically and linguistically aligned."],
  "mf3-01-06": ["KEEP", "SUFFICIENT", "FIT", "The repaired wording now acknowledges known-fact strategies, the break-apart visual is relevant, and the two arrays plus recall, correction, square transfer, and remedial are truthful and age appropriate."],
  "mf3-02-01": ["REVISE", "REQUIRED", "FIT", "The learner text and evaluators for ×8 are true, but both concepts reuse a figure whose rendered sequence stops at 4 × 6 = 24. It never performs the additional doubling to 8 × 6 = 48 required by the adjacent concept, so a semantic ×8 visual is required."],
  "mf3-02-02": ["KEEP", "SUFFICIENT", "FIT", "The nines figure, near-ten prediction, distinct 9-by-7 and 9-by-6 arrays, derivation check, transfer, feedback, and remedial all agree and are suitable for Grade 3."],
  "mf3-02-03": ["REVISE", "REQUIRED", "FIT", "The repaired place-value wording is truthful, but the following arrays show equal groups rather than the claimed change in digit value or empty ones place. In addition, k3 asks the learner to explain while accepting only 60, so the representation and response job need revision."],
  "mf3-02-04": ["KEEP", "SUFFICIENT", "FIT", "The immediately adjacent manipulable 3-by-3 and 4-by-4 square arrays do the necessary visual work without a redundant fixed figure; the later correction, transfer, feedback, and remedial stay truthful."],
  "mf3-02-05": ["ESCALATE", "ESCALATE", "ESCALATE", "The shared multiplication-table figure claims 4 × 6 = 24 is highlighted although its 2-through-5 grid highlights 4 × 4 = 16 and contains no factor 6. The prediction also marks 'no skip-count shortcut' as correct, and the recap says some facts have no pattern. These learner-visible false claims block release."],
  "mf3-02-06": ["KEEP", "SUFFICIENT", "FIT", "The break-apart figure and prompts consistently derive unknown facts from known ones; the 6-by-7 and 4-by-8 actions differ, and the checks, transfer, feedback, and remedial are accurate and plainly worded."],
  "mf3-03-01": ["ESCALATE", "ESCALATE", "FIT", "The mixed-recall arrays and numeric evaluators are truthful and the language is Grade 3 appropriate, but both concepts expose the false multiplication-table figure that labels 4 × 6 = 24 while highlighting the rendered 4 × 4 = 16 cell. That learner-visible contradiction blocks release."],
  "mf3-03-02": ["ESCALATE", "ESCALATE", "FIT", "The mixed-fact actions, answers, feedback, and fluency language are internally consistent, but both concept placements expose the false multiplication-table figure: the highlighted grid cell is 16 while its accessible text and footer assert a highlighted 24. Release requires figure correction."],
  "mf3-03-03": ["ESCALATE", "ESCALATE", "FIT", "The recall-practice sequence, near-ten derivation, commutative check, transfer, and remedial are mathematically true, but both concepts use the false multiplication-table figure whose claimed highlighted 4 × 6 product is absent from the rendered grid. The visual contradiction is release-blocking."],
  "mf3-03-04": ["KEEP", "SUFFICIENT", "FIT", "The missing-factor figure correctly links multiplication and division; the 6-by-7 and 8-by-6 arrays, three distinct missing-factor jobs, transfer, feedback, and remedial are truthful and accessible for Grade 3."],
  "mf3-03-05": ["ESCALATE", "SUFFICIENT", "ESCALATE", "The fact-family figure and all evaluator answers are correct, but four main success states and the remedial call a division equation 'the reciprocal of' a multiplication equation. Equations are not reciprocals, so the repeated learner-visible mathematical terminology error blocks release despite sufficient visual support."],
  "mf3-03-06": ["ESCALATE", "ESCALATE", "FIT", "The whole-table arrays, checks, transfer, feedback, and language are otherwise truthful, but both concepts expose the false multiplication-table figure: the code highlights 4 × 4 = 16 while the visible footer and accessible label claim 4 × 6 = 24 is highlighted. Release requires repair."],
};

const expectedAnswers = {
  "mf3-01-01": [12,18,14,16,12], "mf3-01-02": [21,24,18,27,21], "mf3-01-03": [24,32,28,36,24],
  "mf3-01-04": [35,45,30,40,35], "mf3-01-05": [42,48,54,36,42], "mf3-01-06": [56,42,63,49,56],
  "mf3-02-01": [48,56,72,32,48], "mf3-02-02": [63,54,72,36,63], "mf3-02-03": [70,90,60,80,70],
  "mf3-02-04": [9,16,25,25,9], "mf3-02-05": [56,48,63,72,56], "mf3-02-06": [42,54,32,48,42],
  "mf3-03-01": [12,25,10,16,12], "mf3-03-02": [63,48,72,42,63], "mf3-03-03": [56,54,54,72,56],
  "mf3-03-04": [7,6,9,8,7], "mf3-03-05": [7,9,8,9,7], "mf3-03-06": [81,64,49,36,81],
};
const falseTableLessons = ["mf3-02-05", "mf3-03-01", "mf3-03-02", "mf3-03-03", "mf3-03-06"];
const read = (file) => fs.readFileSync(file, "utf8");
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const parseLines = (file) => read(file).split(/\r?\n/).filter(Boolean).map((line, index) => { try { return JSON.parse(line); } catch (error) { throw new Error(`${path.relative(root, file)}:${index + 1}: ${error.message}`); } });
const countBy = (records, field, values) => Object.fromEntries(values.map((value) => [value, records.filter((record) => record[field] === value).length]));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function parseCsv(text) {
  const rows=[]; let row=[], cell="", quoted=false;
  for(let i=0;i<text.length;i+=1){const ch=text[i]; if(quoted){if(ch==='"'&&text[i+1]==='"'){cell+='"';i+=1;}else if(ch==='"')quoted=false;else cell+=ch;}else if(ch==='"')quoted=true;else if(ch===','){row.push(cell);cell="";}else if(ch==='\n'){row.push(cell.replace(/\r$/, ""));rows.push(row);row=[];cell="";}else cell+=ch;}
  if(cell||row.length){row.push(cell);rows.push(row);} const [headers,...values]=rows.filter((candidate)=>candidate.some((entry)=>entry!==""));
  return values.map((valuesRow)=>Object.fromEntries(headers.map((header,index)=>[header,valuesRow[index]??""])));
}
const evidenceFile = (reference) => { const value=String(reference); const marker=[value.indexOf(":"),value.indexOf("#")].filter((index)=>index>1).sort((a,b)=>a-b)[0]; return marker===undefined?value:value.slice(0,marker); };

const authority = loadLessonReviewAuthority(root);
const course = JSON.parse(read(coursePath));
const expectedIds = course.chapters.flatMap((chapter) => chapter.lessonIds);
const liveLessons = authority.lessons.filter((lesson) => lesson.courseId === course.id);
const lessonById = new Map(liveLessons.map((lesson) => [lesson.lessonId, lesson]));
const schema = parseLines(ledgerPath)[0];

function makeRecords() {
  return expectedIds.map((lessonId) => {
    const [decision, visualDecision, gradeLanguageDecision, finding] = expected[lessonId];
    const positive = "Independent review covered every main and remedial step, figure implementation and accessible text, prediction reveal, evaluator, accepted state, feedback branch, course metadata, live review authority, and current queue evidence; all 90 scoped numeric answers and all 36 area targets were checked rather than inherited from the writer report.";
    return {
      recordType: "lesson-disposition", recordId: `S248-MF3-${lessonId}`, lessonId,
      reviewedBasisHash: lessonById.get(lessonId).reviewBasisHash, decision, visualDecision, gradeLanguageDecision,
      reviewer, reviewedAt, rationale: `${finding} ${positive}`,
      evidenceRefs: [
        `content/courses/mult-fluency-g3/lessons/${lessonId}.json:complete lesson and remedial`,
        `${implementationReport}:implementation claims and authority boundary`,
        `${implementationTest}:writer regression contract`,
        "src/components/figures.tsx:Mult3 figure implementations and accessible text",
        `${repairScript}:guarded source repair`,
        "PREMIUM_PENDING_WORKLOAD_QUEUE.csv:current scoped workstreams",
      ],
      reopenCondition: decision === "KEEP"
        ? "Reopen on any lesson, remedial, course, duplicate-reference, standards-reference, figure implementation, widget/evaluator, feedback, generator, renderer, queue-authority, or V4-contract change; a KEEP disposition does not create transfer or mastery evidence."
        : decision === "REVISE"
          ? "Reassess after the named semantic visual and question-job revisions are implemented and runtime-verified; reopen on any lesson, remedial, course, figure, evaluator, feedback, generator, renderer, authority, or V4-contract change."
          : "Release remains blocked until every named learner-visible false statement or representation is repaired and independently reassessed; reopen on any lesson, remedial, figure, evaluator, feedback, generator, renderer, authority, or V4-contract change.",
    };
  });
}

if (process.argv.includes("--generate")) {
  const records = makeRecords();
  fs.writeFileSync(candidatePath, `${records.map((record)=>JSON.stringify(record)).join("\n")}\n`);
}
if (!fs.existsSync(candidatePath)) throw new Error(`missing ${path.relative(root,candidatePath)}; run with --generate once`);

const records = parseLines(candidatePath);
const recordById = new Map(records.map((record)=>[record.lessonId,record]));
const cards = JSON.parse(read(cardsPath)).cards.filter((card)=>card.courseId===course.id);
const cardById = new Map(cards.map((card)=>[card.lessonId,card]));
const queue = parseCsv(read(queuePath)).filter((row)=>expectedIds.includes(row.lesson_id));
const exactFields = new Set(["recordType", ...schema.contract.requiredDecisionFields]);
const lessonEnums=schema.contract.allowedLessonDecisions, visualEnums=schema.contract.allowedVisualDecisions, languageEnums=schema.contract.allowedGradeLanguageDecisions;
const errors=[];

if(course.id!=="mult-fluency-g3"||course.gradeLevel!==3)errors.push("unexpected course identity or grade");
if(expectedIds.length!==18||new Set(expectedIds).size!==18)errors.push("manifest must contain 18 unique lessons");
if(liveLessons.length!==18)errors.push(`authority has ${liveLessons.length} scoped lessons`);
if(records.length!==18||new Set(records.map((record)=>record.lessonId)).size!==18)errors.push("candidate must contain 18 unique lesson records");
if(new Set(records.map((record)=>record.recordId)).size!==18)errors.push("candidate recordIds are not unique");
if(!same([...recordById.keys()].sort(),[...expectedIds].sort()))errors.push("candidate lesson-id set differs from manifest");

for(const lessonId of expectedIds){
  const live=lessonById.get(lessonId), record=recordById.get(lessonId), spec=expected[lessonId]; if(!live||!record)continue;
  for(const field of Object.keys(record).filter((field)=>!exactFields.has(field)))errors.push(`${lessonId}: unknown field ${field}`);
  for(const field of [...exactFields].filter((field)=>!(field in record)))errors.push(`${lessonId}: missing exact field ${field}`);
  if(record.recordType!=="lesson-disposition"||record.recordId!==`S248-MF3-${lessonId}`)errors.push(`${lessonId}: identity contract mismatch`);
  if(record.reviewedBasisHash!==live.reviewBasisHash)errors.push(`${lessonId}: candidate is stale against current live authority`);
  if(record.decision!==spec[0]||record.visualDecision!==spec[1]||record.gradeLanguageDecision!==spec[2])errors.push(`${lessonId}: calibrated disposition mismatch`);
  if(!lessonEnums.includes(record.decision)||!visualEnums.includes(record.visualDecision)||!languageEnums.includes(record.gradeLanguageDecision))errors.push(`${lessonId}: invalid enum`);
  if(record.reviewer!==reviewer||record.reviewedAt!==reviewedAt)errors.push(`${lessonId}: reviewer/time signature mismatch`);
  if(String(record.rationale).length<450||String(record.reopenCondition).length<190)errors.push(`${lessonId}: rationale/reopen contract is not substantive`);
  if(!Array.isArray(record.evidenceRefs)||record.evidenceRefs.length!==6)errors.push(`${lessonId}: expected exactly six evidence references`);
  else for(const reference of record.evidenceRefs)if(!fs.existsSync(path.join(root,evidenceFile(reference))))errors.push(`${lessonId}: missing evidence ${evidenceFile(reference)}`);

  const numeric=[...live.lesson.steps.filter((step)=>step.widget?.type==="numeric").map((step)=>step.widget),...(live.lesson.remedials??[]).filter((entry)=>entry.check?.widget?.type==="numeric").map((entry)=>entry.check.widget)];
  if(numeric.length!==5||!same(numeric.map((widget)=>widget.answer),expectedAnswers[lessonId])||numeric.some((widget)=>widget.tolerance!==0))errors.push(`${lessonId}: numeric evaluator truth contract changed`);
  const areas=live.lesson.steps.filter((step)=>step.widget?.type==="areaModel").map((step)=>step.widget);
  if(areas.length!==2)errors.push(`${lessonId}: expected exactly two area models`);
  for(const [index,widget] of areas.entries()){
    const represented=widget.requireFactors?widget.requireFactors.w*widget.requireFactors.h:widget.wStart*widget.hStart;
    if(represented!==widget.targetArea)errors.push(`${lessonId}/i${index+1}: prompt representation and target disagree`);
    if(!widget.requireFactors&&(!widget.countGrid||widget.wStart!==widget.wMax||widget.hStart!==widget.hMax))errors.push(`${lessonId}/i${index+1}: unconstrained non-counting area evaluator`);
  }
  for(const step of live.lesson.steps.filter((step)=>step.predict)){
    const ids=step.predict.options.map((option)=>option.id);
    if(new Set(ids).size!==ids.length||!ids.includes(step.predict.outcomeId))errors.push(`${lessonId}/${step.id}: prediction outcome contract invalid`);
  }
}

const figureSource=read(figuresPath);
for(const token of ["const prod=(r+2)*(c+2)","const hl=(r===2&&c===2)","4 × 6 = 24 (highlighted)"])if(!figureSource.includes(token))errors.push(`reviewed false mult3-mult-table evidence changed: ${token}`);
for(const lessonId of falseTableLessons){for(const conceptId of ["c1","c2"]){if(lessonById.get(lessonId)?.lesson.steps.find((step)=>step.id===conceptId)?.figure!=="mult3-mult-table")errors.push(`${lessonId}/${conceptId}: false-table placement changed`);}}
const x8=lessonById.get("mf3-02-01")?.lesson; if(x8?.steps.find((step)=>step.id==="c1")?.figure!=="mult3-double-double"||!figureSource.includes("double twice = × 4"))errors.push("reviewed ×8 visual mismatch changed");
const x10=lessonById.get("mf3-02-03")?.lesson; if(x10?.steps.find((step)=>step.id==="c1")?.figure||x10?.steps.find((step)=>step.id==="c2")?.figure||!x10?.steps.find((step)=>step.id==="k3")?.widget?.prompt.startsWith("Explain"))errors.push("reviewed ×10 visual/answer-job debt changed");
const hard=JSON.stringify(lessonById.get("mf3-02-05")?.lesson); if(!hard.includes("Some facts have no pattern.")||!hard.includes("They have no skip-count shortcut"))errors.push("reviewed hard-facts false language changed");
const family=JSON.stringify(lessonById.get("mf3-03-05")?.lesson); if((family.match(/the reciprocal of/g)??[]).length!==5)errors.push("reviewed fact-family reciprocal misuse count changed");

const dispositions=countBy(records,"decision",lessonEnums), visuals=countBy(records,"visualDecision",visualEnums), languages=countBy(records,"gradeLanguageDecision",languageEnums);
if(!same(dispositions,{KEEP:10,REVISE:2,ESCALATE:6}))errors.push(`lesson distribution ${JSON.stringify(dispositions)}`);
if(!same(visuals,{REQUIRED:2,PREFERRED:0,SUFFICIENT:11,ESCALATE:5}))errors.push(`visual distribution ${JSON.stringify(visuals)}`);
if(!same(languages,{FIT:16,REVISE:0,ESCALATE:2}))errors.push(`language distribution ${JSON.stringify(languages)}`);
const queueCounts=Object.fromEntries([...new Set(queue.map((row)=>row.workstream))].sort().map((workstream)=>[workstream,queue.filter((row)=>row.workstream===workstream).length]));
const cardsCurrent=expectedIds.filter((id)=>cardById.get(id)?.reviewBasisHash===lessonById.get(id)?.reviewBasisHash&&cardById.get(id)?.lessonSourceHash===lessonById.get(id)?.lessonSourceHash).length;
const result={
  status:errors.length?"FAIL":"PASS",courseId:course.id,manifestLessons:18,candidateRecords:records.length,currentAuthorityBasisHashes:expectedIds.filter((id)=>recordById.get(id)?.reviewedBasisHash===lessonById.get(id)?.reviewBasisHash).length,
  sharedCardsCurrentlyFreshForScopedLessons:cardsCurrent,decisions:dispositions,visualDecisions:visuals,gradeLanguageDecisions:languages,
  evidence:{mainNumericChecks:72,remedialNumericChecks:18,areaModels:36,predictions:liveLessons.flatMap((lesson)=>lesson.lesson.steps.filter((step)=>step.predict)).length,falseTablePlacements:10,reciprocalMisuses:5},
  specializedDebt:{ILLUSTRATION_REPLACEMENT_SEMANTIC:["mf3-02-01/c1","mf3-02-01/c2","mf3-02-03/c1","mf3-02-03/c2",...falseTableLessons.flatMap((id)=>[`${id}/c1`,`${id}/c2`])],QUESTION_JOB:["mf3-02-03/k3"],LANGUAGE_TRUTH:["mf3-02-05/i1 predict","mf3-02-05/r1","mf3-03-05/k1","mf3-03-05/k2","mf3-03-05/k3","mf3-03-05/ch1","mf3-03-05/remedial"],LESSON_REVISION_IMPLEMENTATION:["mf3-02-01","mf3-02-03"],RELEASE_BLOCKER_REASSESSMENT:["mf3-02-05","mf3-03-01","mf3-03-02","mf3-03-03","mf3-03-05","mf3-03-06"]},
  genericRowsEligibleToCloseAfterAuthoritativeAppend:{LESSON_COMPLETE_DISPOSITION:18,VISUAL_FIRST_REPRESENTATION:18,GRADE_LANGUAGE_REVIEW:18,total:54},
  currentScopedQueueRows:queue.length,currentScopedQueueDistribution:queueCounts,
  projectedQueueDelta:{guaranteedGenericReviewDelta:-54,staleIllustrationRows:36,semanticIllustrationRowsRetained:14,netIllustrationRefreshDelta:-22,newRevisionImplementationRows:2,newQuestionJobRows:1,releaseBlockerRowsIfMaterialized:6,projectedScopedRowsIfAllNamedDebtIsMaterialized:23},
  candidateSha256:sha256(read(candidatePath)),errors,
};

if(process.argv.includes("--generate")){
  const table=expectedIds.map((id)=>`| ${id} | ${recordById.get(id).reviewedBasisHash} | ${expected[id][0]} | ${expected[id][1]} | ${expected[id][2]} | ${expected[id][3]} |`).join("\n");
  const report=`# S248 mult-fluency-g3 independent V4 assessment\n\nStatus: **${errors.length?"FAIL":"PASS"} — the writer's all-SUFFICIENT/FIT/KEEP recommendation is not supported**\n\nThis independent assessment read all 18 live lessons and all 18 remedial pairs, 36 area models, 90 numeric evaluator states, 16 prediction surfaces, every retained figure implementation and accessible label, current review authority, current cards, and current queue evidence. It edited no lesson/runtime source and no shared ledger, queue, cards, cache, dossier, or standards artifact.\n\n## Exact signed result\n\n- Whole lesson: **10 KEEP, 2 REVISE, 6 ESCALATE**.\n- Visual: **2 REQUIRED, 0 PREFERRED, 11 SUFFICIENT, 5 ESCALATE**.\n- Grade 3 language: **16 FIT, 0 REVISE, 2 ESCALATE**.\n- Candidate SHA-256: \`${result.candidateSha256}\`.\n- All **18/18** records bind to current live review-basis hashes.\n\n| Lesson | Current review basis | Lesson | Visual | Language | Independent finding |\n|---|---|---|---|---|---|\n${table}\n\n## Release blockers and bounded revision debt\n\nThe shared \`mult3-mult-table\` implementation renders factors 2–5, highlights the 4×4 cell (16), but tells learners in visible and accessible text that 4×6=24 is highlighted. Ten concept placements across five lessons therefore remain false. \`mf3-02-05\` also treats “no skip-count shortcut” as the correct prediction and recaps “Some facts have no pattern.” \`mf3-03-05\` calls five division facts “the reciprocal of” multiplication equations. These are learner-visible mathematical falsehoods, so six lessons are escalated rather than revised or kept.\n\nTwo non-blocking but required repairs remain. \`mf3-02-01\` uses a ×4 double-double figure for ×8 without showing the final doubling. \`mf3-02-03\` teaches digit-value scaling and an empty ones place with only equal-group arrays, while k3 asks “Explain” but accepts only the number 60. These lessons are REVISE/REQUIRED/FIT.\n\n## Evidence that did pass\n\nAll 72 main and 18 remedial numeric answers are true with zero tolerance. Every area-model target equals its required factors or its fixed counting grid. All prediction outcome IDs exist and all retained non-table figures inspected here are mathematically truthful. The ten KEEP lessons have distinct operand progressions, misconception feedback, transfer, and one complete remedial pair. No transfer or mastery claim is inferred from a disposition.\n\n## Queue effect without hiding specialized debt\n\nAn authoritative append can close the 54 generic decision rows. A source-aware illustration refresh must replace the 36 stale \`bar-compare\` rows with **14 semantic illustration rows**, not zero: ×8 (2), ×10 place value (2), and the false table (10), a net illustration delta of −22. It must also retain/open two revision implementations, one ×10 question-job row, and six release-blocker reassessments. If each named item is materialized once, the scoped queue projects from 90 to **23**, not 0. The guaranteed disposition-only delta is **−54**.\n\n## Reproducible gates\n\n\`\`\`text\nnode reports/closure/candidates/validate-s248-mult-fluency-g3-triple-dispositions.mjs\nnode scripts/audit/append-lesson-review-candidates-s246.mjs --check reports/closure/candidates/S248_MULT_FLUENCY_G3_TRIPLE_DISPOSITIONS.jsonl\nnode scripts/audit/repair-mult-fluency-g3-s248.mjs --check\nnpx vitest run src/lib/session248.multFluencyG3CourseIntegrity.test.ts --reporter=verbose\n\`\`\`\n\nThe first two are the authoritative candidate gates. The latter two verify the writer's repaired source contract but do not override this independent result.\n`;
  fs.writeFileSync(assessmentPath,report);
}

console.log(JSON.stringify(result,null,2));
if(errors.length)process.exitCode=1;
