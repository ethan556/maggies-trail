import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const DIR = path.join(process.cwd(), "content", "courses", "place-value", "lessons");
const CHECK = process.argv.includes("--check");
const EXCLUDED = "pv-03-02";

const PATCHES = {
  "pv-01-02": {
    c1: {
      body: "Every number can **explode into its worth-pieces**: 342 = 300 + 40 + 2. That's called expanded form. Building goes the other way — snap the pieces back together. Nothing is ever lost in either direction; it's the same number, unpacked or packed.",
      figure: "pv3-expanded",
    },
    c2: {
      body: "Why use expanded form at all? **Pieces let you work on one place at a time.** The figure keeps the hundreds, tens, and ones pieces separate, so you can change one place while the others stay put. Next, use that structure to add tens mentally.",
      figure: "pv3-expanded",
    },
  },
  "pv-01-03": {
    c2: {
      body: "The figure shows why **later places cannot overturn the first difference**: 342 > 328 because the hundreds tie and 4 tens > 2 tens. More generally, one step in a place is worth more than every possible digit to its right combined. That is why comparison works from left to right.",
      figure: "pv3-compare",
    },
  },
  "pv-02-04": {
    c2: { figure: null },
  },
  "pv-03-01": {
    c2: { figure: null },
  },
  "pv-03-03": {
    c1: {
      body: "To subtract 305 − 128, the ones need more than 5 and the tens place starts at zero. Trade **downhill** in two stages: break 1 hundred into 10 tens, then break 1 of those tens into 10 ones. The figure tracks the same value as 3 hundreds become 2, 0 tens become 10 then 9, and 5 ones become 15.",
      figure: "pv3-borrow-zero",
    },
  },
  "pv-03-04": {
    c2: {
      body: "The figure shows 349 rounding to 300 because it lies just below the halfway point, 350. Use that same guard routine in three beats: **round the players → one friendly computation → compare**. If an exact answer has the wrong size, redo the computation.",
      figure: "pv3-round-hundred",
    },
  },
  "pv-04-03": {
    c1: {
      body: "The figure shows 4 × 60 as 4 groups of 6 tens: 24 tens, or 240. That pattern works in stories about rows of chairs, packs of stickers, or cents in dimes: **spot the tens unit → run the small fact → read in units → guard with an estimate**.",
      figure: "pv3-times-tens",
    },
    c2: { figure: null },
  },
};

function step(lesson, id) {
  const found = lesson.steps.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`${lesson.id}: missing step ${id}`);
  return found;
}

function repairLesson(lesson) {
  const patch = PATCHES[lesson.id];
  if (!patch) return;
  for (const [stepId, values] of Object.entries(patch)) {
    const candidate = step(lesson, stepId);
    if (values.body !== undefined) candidate.body = values.body;
    if (values.figure === null) delete candidate.figure;
    else if (values.figure !== undefined) candidate.figure = values.figure;
  }
}

const files = fs.readdirSync(DIR).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 15) throw new Error(`expected 15 course lessons, found ${files.length}`);
if (PATCHES[EXCLUDED]) throw new Error(`${EXCLUDED} must remain outside this packet`);

let changed = 0;
const packetHashes = [];
for (const file of files) {
  const full = path.join(DIR, file);
  const before = fs.readFileSync(full, "utf8");
  const lesson = JSON.parse(before);
  const stableIds = JSON.stringify(lesson.steps.map((candidate) => candidate.id));
  const evaluatorTypes = JSON.stringify(lesson.steps.filter((candidate) => candidate.widget).map((candidate) => [candidate.id, candidate.widget.type]));
  repairLesson(lesson);
  if (JSON.stringify(lesson.steps.map((candidate) => candidate.id)) !== stableIds) throw new Error(`${lesson.id}: stable step IDs changed`);
  if (JSON.stringify(lesson.steps.filter((candidate) => candidate.widget).map((candidate) => [candidate.id, candidate.widget.type])) !== evaluatorTypes) throw new Error(`${lesson.id}: evaluator types changed`);
  const owned = Object.hasOwn(PATCHES, lesson.id);
  const eol = before.includes("\r\n") ? "\r\n" : "\n";
  const serialized = `${JSON.stringify(lesson, null, 2)}\n`.replace(/\n/g, eol);
  const after = owned ? serialized : before;
  if (lesson.id === EXCLUDED && after !== before) throw new Error(`${EXCLUDED}: excluded dirty file was altered`);
  if (owned) packetHashes.push(`${file}\0${after}`);
  if (after.replace(/\r\n/g, "\n") !== before.replace(/\r\n/g, "\n")) {
    changed += 1;
    if (!CHECK) fs.writeFileSync(full, after);
  }
}

if (CHECK && changed) throw new Error(`${changed} owned lesson files need repair`);
const packetSeal = createHash("sha256").update(packetHashes.join("\n")).digest("hex");
console.log(`${CHECK ? "CHECK" : "REPAIR"} place-value disjoint P0: ${changed ? `${changed} owned lesson files need repair` : "CURRENT"}; 9 source closures (6 aligned, 3 withheld); 1 excluded dirty row; packet seal ${packetSeal}`);
