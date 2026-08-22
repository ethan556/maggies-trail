import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const LESSONS = join(ROOT, "content", "courses", "counting-to-100-k", "lessons");

function fail(message) {
  throw new Error(`S289 counting-to-100-k visual repair: ${message}`);
}

function conceptStep(lesson, id) {
  const step = lesson.steps.find((candidate) => candidate.id === id);
  if (!step || step.kind !== "concept") fail(`${lesson.id}/${id} must be a concept step`);
  return step;
}

function remedialConcept(lesson, conceptTag) {
  const remedial = lesson.remedials.find((candidate) => candidate.conceptTag === conceptTag);
  if (!remedial || remedial.concept.kind !== "concept") fail(`${lesson.id}/${conceptTag} remedial concept is missing`);
  return remedial.concept;
}

function matches(concept, expected) {
  return Object.entries(expected).every(([key, value]) => concept[key] === value);
}

function repairConcept(concept, before, after, label) {
  if (matches(concept, after)) return false;
  if (!matches(concept, before)) fail(`${label} no longer matches the guarded source payload`);
  Object.assign(concept, after);
  return true;
}

const repairs = [
  {
    id: "k100-01-03",
    placements: [
      {
        get: (lesson) => conceptStep(lesson, "c1"),
        before: { figure: "chart-120", body: "The blue chart row shows 41 through 50. Read each square from left to right to keep the count going.", narration: "The count climbs on: thirties, then forties, up to fifty. The pattern never changes." },
        after: { figure: "chart-120", body: "The blue chart row runs from 41 to 50. Read across from 41, 42, 43 to 50.", narration: "On the blue row, read 41, 42, 43 and continue to 50." },
        label: "k100-01-03/c1",
      },
    ],
  },
  {
    id: "k100-02-05",
    placements: [
      {
        get: (lesson) => conceptStep(lesson, "c1"),
        before: { figure: "tno-count-down-tens", body: "Counting back by tens means each step is ten less. The picture counts 65, 55, 45, 35.", narration: "Tens can count down: 50, 40, 30, 20, 10. Each hop back takes away a whole ten." },
        after: { figure: "tno-count-down-tens", body: "Count backward by 10: 65, 55, 45, 35. Each hop subtracts 10.", narration: "Start at 65. Count back by 10: 55, 45, 35." },
        label: "k100-02-05/c1",
      },
      {
        get: (lesson) => conceptStep(lesson, "c2"),
        before: { figure: "tno-count-down-tens", body: "The picture walks backward by equal ten-steps: 65, 55, 45, 35.", narration: "Counting back by tens is the same jumps, walked the other way." },
        after: { figure: "tno-count-down-tens", body: "Follow the line backward by 10: 65, 55, 45, 35.", narration: "Say 65, 55, 45, 35: each step is back 10." },
        label: "k100-02-05/c2",
      },
      {
        get: (lesson) => remedialConcept(lesson, "kcc-tens-back"),
        before: { figure: "tno-count-down-tens", body: "The picture walks backward by equal ten-steps: 65, 55, 45, 35.", narration: "Counting back by tens is the same jumps, walked the other way." },
        after: { figure: "tno-count-down-tens", body: "Follow the line backward by 10: 65, 55, 45, 35.", narration: "Say 65, 55, 45, 35: each step is back 10." },
        label: "k100-02-05/remedials.0.concept",
      },
    ],
  },
  {
    id: "k100-03-03",
    placements: [
      {
        get: (lesson) => conceptStep(lesson, "c1"),
        before: { figure: "chart-120", body: "The count stopped at 46. On the blue chart row, start again with 47, then 48 and 49.", narration: "A count can stop and start again. It stopped at 46? Pick it up: 47, 48, 49." },
        after: { figure: "chart-120", body: "The blue row continues 41 through 50. After 46 come 47, 48, and 49.", narration: "After 46 on this row come 47, 48, and 49." },
        label: "k100-03-03/c1",
      },
    ],
  },
  {
    id: "k100-03-05",
    placements: [
      {
        get: (lesson) => conceptStep(lesson, "c1"),
        before: { figure: "chart-rows", body: "The chart row shows 29 at the end and 30 next. Counting continues into the next row.", narration: "The chart can answer 'what comes next?' Find your number; the next square holds the next count." },
        after: { figure: "chart-rows", body: "The third chart row ends 29, 30. The next row begins 31.", narration: "At the end of the third row, 29 is followed by 30. The next row starts at 31." },
        label: "k100-03-05/c1",
      },
    ],
  },
  {
    id: "k100-03-06",
    placements: [
      {
        get: (lesson) => conceptStep(lesson, "c1"),
        before: { figure: "c120-missing-order", body: "A covered square still has one correct number. The picture shows 42, 43, a covered square, then 45.", narration: "Some chart squares are blank. The count tells you what belongs: read the row, fill the gap." },
        after: { figure: "c120-missing-order", body: "The pictured row is 42, 43, ?, 45. Count one more after 43 to find 44.", narration: "The covered square is 44: 42, 43, 44, 45." },
        label: "k100-03-06/c1",
      },
      {
        get: (lesson) => conceptStep(lesson, "c2"),
        before: { figure: "c120-missing-order", body: "Say the row in order: 42, 43, 44, 45. The covered square must be 44.", narration: "A gap in a row is just a gap in the count. Say the row out loud and the missing number appears." },
        after: { figure: "c120-missing-order", body: "Read the pictured row: 42, 43, ?, 45. The missing number is 44.", narration: "Say 42, 43, 44, 45. The missing square is 44." },
        label: "k100-03-06/c2",
      },
      {
        get: (lesson) => remedialConcept(lesson, "kcc-chart-missing"),
        before: { figure: "c120-missing-order", body: "Say the row in order: 42, 43, 44, 45. The covered square must be 44.", narration: "A gap in a row is just a gap in the count. Say the row out loud and the missing number appears." },
        after: { figure: "c120-missing-order", body: "Read the pictured row: 42, 43, ?, 45. The missing number is 44.", narration: "Say 42, 43, 44, 45. The missing square is 44." },
        label: "k100-03-06/remedials.0.concept",
      },
    ],
  },
];

const changed = [];
for (const repair of repairs) {
  const path = join(LESSONS, `${repair.id}.json`);
  const lesson = JSON.parse(readFileSync(path, "utf8"));
  let lessonChanged = false;
  for (const placement of repair.placements) {
    lessonChanged = repairConcept(placement.get(lesson), placement.before, placement.after, placement.label) || lessonChanged;
  }
  if (lessonChanged) {
    writeFileSync(path, `${JSON.stringify(lesson, null, 2)}\n`);
    changed.push(repair.id);
  }
}

console.log(`S289 counting-to-100-k visual repair: ${changed.length ? `updated ${changed.join(", ")}` : "already current"}`);
