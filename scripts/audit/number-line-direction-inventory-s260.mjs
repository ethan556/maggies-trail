import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const coursesRoot = path.join(root, "content", "courses");
const runtimeTypes = ["numberLinePlace", "numberLineHop", "numberLineRay", "doubleNumberLine"];
const runtime = Object.fromEntries(runtimeTypes.map((type) => [type, { occurrences: 0, lessons: new Set(), courses: new Set() }]));
const graphInventory = JSON.parse(fs.readFileSync(path.join(root, "reports", "graph-labeling", "GRAPH_FIGURE_LABELING_INVENTORY_S252.json"), "utf8"));
const inventoryStaticIds = graphInventory.figureRenderers.filter((item) => item.displayType === "number_line").map((item) => item.id).sort();
const supplementalStaticIds = ["rno7-zero-pair", "rno7-change-line", "rno-opposites-cancel", "rno-change-sign", "rno7-change-rise-line", "rno7-subtract-negative"];
const staticIds = [...new Set([...inventoryStaticIds, ...supplementalStaticIds])];
const staticBindings = Object.fromEntries(staticIds.map((id) => [id, 0]));
const invalid = [];

function visit(value, course, lessonId) {
  if (Array.isArray(value)) return value.forEach((entry) => visit(entry, course, lessonId));
  if (!value || typeof value !== "object") return;
  if (typeof value.type === "string" && runtime[value.type]) {
    runtime[value.type].occurrences += 1;
    runtime[value.type].lessons.add(`${course}/${lessonId}`);
    runtime[value.type].courses.add(course);
  }
  for (const [key, child] of Object.entries(value)) {
    if ((key === "figureId" || key === "figure") && typeof child === "string" && child in staticBindings) staticBindings[child] += 1;
    visit(child, course, lessonId);
  }
}

for (const course of fs.readdirSync(coursesRoot)) {
  const lessons = path.join(coursesRoot, course, "lessons");
  if (!fs.existsSync(lessons)) continue;
  for (const file of fs.readdirSync(lessons).filter((name) => name.endsWith(".json"))) {
    try {
      const lesson = JSON.parse(fs.readFileSync(path.join(lessons, file), "utf8"));
      visit(lesson, course, lesson.id ?? file.replace(/\.json$/, ""));
    } catch (error) {
      invalid.push(`${course}/${file}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

const runtimeSummary = Object.fromEntries(Object.entries(runtime).map(([type, item]) => [type, {
  occurrences: item.occurrences,
  lessons: item.lessons.size,
  courses: item.courses.size,
}]));
const result = {
  status: invalid.length === 0 ? "PASS" : "FAIL",
  runtime: runtimeSummary,
  runtimeTotal: Object.values(runtimeSummary).reduce((sum, item) => sum + item.occurrences, 0),
  inventoryClassifiedStaticIds: inventoryStaticIds.length,
  supplementalStaticIds: supplementalStaticIds.length,
  explicitStaticIds: staticIds.length,
  explicitStaticBindings: Object.values(staticBindings).reduce((sum, count) => sum + count, 0),
  boundStaticIds: Object.values(staticBindings).filter((count) => count > 0).length,
  invalid,
};
console.log(JSON.stringify(result, null, 2));
if (invalid.length > 0) process.exitCode = 1;
