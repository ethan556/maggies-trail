// Registration-consistency gate: files on disk <-> course.json lessonIds <-> PLAN.md checkmarks.
// Added after the mult-01-05 PLAN-drift finding (ch5 batch critique): a silent replace-miss
// left an authored lesson unchecked in the plan. This makes that class of drift a hard failure.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = "content/courses";
let failures = 0;
const fail = (msg) => { console.error("  ✗ " + msg); failures++; };

const plan = readFileSync("content/PLAN.md", "utf8");
for (const courseDir of readdirSync(root)) {
  const course = JSON.parse(readFileSync(join(root, courseDir, "course.json"), "utf8"));
  const registered = course.chapters.flatMap((ch) => ch.lessonIds);
  const onDisk = readdirSync(join(root, courseDir, "lessons")).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));

  for (const id of onDisk) if (!registered.includes(id)) fail(`${id}: file exists but not in any chapter of ${courseDir}/course.json`);
  for (const id of registered) if (!onDisk.includes(id)) fail(`${id}: registered in ${courseDir}/course.json but no lesson file`);
  const dupes = registered.filter((id, i) => registered.indexOf(id) !== i);
  for (const id of dupes) fail(`${id}: registered more than once in ${courseDir}/course.json`);

  for (const id of onDisk) {
    const line = plan.split("\n").find((l) => l.includes(` ${id} `));
    if (!line) fail(`${id}: no line in content/PLAN.md mentions it`);
    else if (!line.includes("✅")) fail(`${id}: authored on disk but PLAN.md still shows it unchecked`);
  }
}
const checked = (plan.match(/✅ \w+-\d\d-\d\d/g) ?? []);
for (const m of checked) {
  const id = m.replace("✅ ", "");
  const courseDirs = readdirSync(root);
  const exists = courseDirs.some((d) => { try { readFileSync(join(root, d, "lessons", id + ".json")); return true; } catch { return false; } });
  if (!exists) fail(`${id}: checked ✅ in PLAN.md but no lesson file exists`);
}
if (failures) { console.error(`registration: ${failures} inconsistencies`); process.exit(1); }
console.log("registration: files ↔ course.json ↔ PLAN.md all consistent");
