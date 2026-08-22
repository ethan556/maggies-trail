import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const LESSONS = join(ROOT, "content", "courses", "data-line-plots-g2", "lessons");

function fail(message) {
  throw new Error(`S290 data-line-plots-g2 visual repair: ${message}`);
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

const allThree = "This bar graph shows cats = 3, dogs = 6, and birds = 4. Each gridline is one.";
const repairs = [
  {
    id: "g2g-02-03",
    placements: [
      {
        get: (lesson) => conceptStep(lesson, "c2"),
        before: { figure: "single-scale-graph", body: "Use the numbered grid like a ruler. Raise each bar until its top meets the correct count.", narration: "Use the numbered grid like a ruler. Raise each bar until its top meets the correct count." },
        after: { figure: "single-scale-graph", body: allThree, narration: allThree },
        label: "g2g-02-03/c2",
      },
      {
        get: (lesson) => remedialConcept(lesson, "g2g-build-bar"),
        before: { figure: "single-scale-graph", body: "Start every bar at zero. Follow the gridlines upward and stop the bar at its category's count.", narration: "Start every bar at zero. Follow the gridlines upward and stop the bar at its category's count." },
        after: { figure: "single-scale-graph", body: allThree, narration: allThree },
        label: "g2g-02-03/remedials.0.concept",
      },
    ],
  },
  {
    id: "g2g-02-04",
    placements: [
      {
        get: (lesson) => conceptStep(lesson, "c1"),
        before: { figure: "single-scale-graph", body: "To read a bar, follow its top across to the numbered scale. The number it reaches is the count.", narration: "To read a bar, follow its top across to the numbered scale. The number it reaches is the count." },
        after: { figure: "single-scale-graph", body: "This bar graph shows dogs = 6. Each gridline is one.", narration: "This bar graph shows dogs = 6. Each gridline is one." },
        label: "g2g-02-04/c1",
      },
    ],
  },
  {
    id: "g2g-03-01",
    placements: [
      {
        get: (lesson) => conceptStep(lesson, "c1"),
        before: { figure: "single-scale-graph", body: "To find how many two categories have together, read both bar heights and add the two counts.", narration: "To find how many two categories have together, read both bar heights and add the two counts." },
        after: { figure: "single-scale-graph", body: "This bar graph shows cats = 3 and dogs = 6. Together, 3 + 6 = 9. Each gridline is one.", narration: "This bar graph shows cats = 3 and dogs = 6. Together, 3 + 6 = 9. Each gridline is one." },
        label: "g2g-03-01/c1",
      },
      {
        get: (lesson) => remedialConcept(lesson, "g2g-total-question"),
        before: { figure: "single-scale-graph", body: "Read one bar, read the other bar, and add. Keep the two category counts separate until you add them.", narration: "Read one bar, read the other bar, and add. Keep the two category counts separate until you add them." },
        after: { figure: "single-scale-graph", body: "This bar graph shows dogs = 6 and birds = 4. Together, 6 + 4 = 10. Each gridline is one.", narration: "This bar graph shows dogs = 6 and birds = 4. Together, 6 + 4 = 10. Each gridline is one." },
        label: "g2g-03-01/remedials.0.concept",
      },
    ],
  },
  {
    id: "g2g-03-02",
    placements: [
      {
        get: (lesson) => conceptStep(lesson, "c2"),
        before: { figure: "single-scale-graph", body: "To find how many more, read both bars and subtract the smaller count from the larger count.", narration: "To find how many more, read both bars and subtract the smaller count from the larger count." },
        after: { figure: "single-scale-graph", body: "This bar graph shows dogs = 6 and cats = 3. Dogs have 3 more because 6 - 3 = 3. Each gridline is one.", narration: "This bar graph shows dogs = 6 and cats = 3. Dogs have 3 more because 6 - 3 = 3. Each gridline is one." },
        label: "g2g-03-02/c2",
      },
    ],
  },
  {
    id: "g2g-03-03",
    placements: [
      {
        get: (lesson) => conceptStep(lesson, "c2"),
        before: { figure: "single-scale-graph", body: "Use separate bars or picture rows for named categories so their counts can be compared.", narration: "Use separate bars or picture rows for named categories so their counts can be compared." },
        after: { figure: "single-scale-graph", body: "This bar graph compares cats = 3, dogs = 6, and birds = 4. Each gridline is one.", narration: "This bar graph compares cats = 3, dogs = 6, and birds = 4. Each gridline is one." },
        label: "g2g-03-03/c2",
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

console.log(`S290 data-line-plots-g2 visual repair: ${changed.length ? `updated ${changed.join(", ")}` : "already current"}`);
