import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const LESSONS = join(ROOT, "content", "courses", "arrays-even-odd-g2", "lessons");

function fail(message) {
  throw new Error(`S286 arrays-even-odd-g2 repair: ${message}`);
}

function step(lesson, id) {
  const found = lesson.steps.find((entry) => entry.id === id);
  if (!found) fail(`${lesson.id}/${id} is missing`);
  return found;
}

function sameIds(actual, expected) {
  return actual.length === expected.length && actual.every((id, index) => id === expected[index]);
}

function correctIds(widget) {
  return widget.hotspots.filter((spot) => spot.correct).map((spot) => spot.id).sort();
}

function repairPairs(lesson, before, after) {
  const widget = step(lesson, "i2").widget;
  if (widget.type !== "oddEvenPairs") fail(`${lesson.id}/i2 must be oddEvenPairs`);
  if (widget.n === after.n && widget.mode === after.mode && widget.prompt === after.prompt && widget.answer === after.answer) return false;
  if (widget.n !== before.n || widget.mode !== before.mode || widget.prompt !== before.prompt || widget.answer !== before.answer) {
    fail(`${lesson.id}/i2 no longer matches the guarded source payload`);
  }
  widget.n = after.n;
  widget.mode = after.mode;
  widget.prompt = after.prompt;
  widget.answer = after.answer;
  delete widget.oddFeedback;
  delete widget.evenFeedback;
  widget[after.answer === "even" ? "oddFeedback" : "evenFeedback"] = after.wrongFeedback;
  widget.successFeedback = after.successFeedback;
  return true;
}

function repairTap(lesson, before, after) {
  const widget = step(lesson, "i2").widget;
  if (widget.type !== "tapDiagram") fail(`${lesson.id}/i2 must be tapDiagram`);
  const expectedAfterIds = after.correctIds.slice().sort();
  if (widget.prompt === after.prompt && sameIds(correctIds(widget), expectedAfterIds)) return false;
  if (widget.prompt !== before.prompt || !sameIds(correctIds(widget), before.correctIds.slice().sort())) {
    fail(`${lesson.id}/i2 no longer matches the guarded source payload`);
  }
  widget.prompt = after.prompt;
  const wanted = new Set(after.correctIds);
  for (const spot of widget.hotspots) {
    if (wanted.has(spot.id)) {
      spot.correct = true;
      delete spot.feedback;
    } else {
      delete spot.correct;
      spot.feedback = `${spot.label} is not in the ${after.target}. ${after.hint}`;
    }
  }
  widget.missFeedback = after.missFeedback;
  widget.successFeedback = after.successFeedback;
  return true;
}

const pairRepairs = [
  ["g2a-01-01", { n: 14, mode: "pair", prompt: "Pair up 14 counters. Odd or even?", answer: "even" }, { n: 15, mode: "pair", prompt: "Pair up 15 counters. Odd or even?", answer: "odd", wrongFeedback: "15 makes 7 pairs with 1 left over. A leftover means odd.", successFeedback: "Yes — 15 makes 7 pairs and 1 stands alone." }],
  ["g2a-01-02", { n: 17, mode: "pair", prompt: "Pair up 17 counters. Odd or even?", answer: "odd" }, { n: 18, mode: "onesDigit", prompt: "18 ends in 8. Is it odd or even?", answer: "even", wrongFeedback: "The ones digit is 8, so all counters can pair. That makes 18 even.", successFeedback: "Yes — 18 ends in 8, so it is even." }],
  ["g2a-01-03", { n: 16, mode: "pair", prompt: "Pair up 16 counters. Odd or even?", answer: "even" }, { n: 14, mode: "pair", prompt: "Pair up 14 counters. Odd or even?", answer: "even", wrongFeedback: "14 pairs up completely (7 pairs, 0 left). No leftover means even.", successFeedback: "Yes — 14 makes 7 pairs with none left over." }],
  ["g2a-01-04", { n: 18, mode: "pair", prompt: "Pair up 18 counters. Odd or even?", answer: "even" }, { n: 13, mode: "pair", prompt: "Pair up 13 counters. Odd or even?", answer: "odd", wrongFeedback: "13 makes 6 pairs with 1 left over. A leftover means odd.", successFeedback: "Yes — 13 makes 6 pairs and 1 stands alone." }],
];

const tapRepairs = [
  ["g2a-02-01", { prompt: "Tap the counter in row 2, column 3.", correctIds: ["r2c3"] }, { prompt: "Tap the counter in row 3, column 1.", correctIds: ["r3c1"], target: "named row and column", hint: "Trace row 3 across and column 1 down to their crossing.", missFeedback: "Rows run across and columns run up and down — find the crossing in row 3, column 1.", successFeedback: "Exactly right — that is where row 3 and column 1 meet." }],
  ["g2a-02-02", { prompt: "Tap every counter in the TOP row.", correctIds: ["r1c1", "r1c2", "r1c3", "r1c4"] }, { prompt: "Tap every counter in the RIGHT column.", correctIds: ["r1c4", "r2c4", "r3c4"], target: "right column", hint: "The right column is column 4.", missFeedback: "The right column is column 4. Tap its counter in every row.", successFeedback: "Exactly right — the right column has one counter in every row." }],
  ["g2a-02-03", { prompt: "Tap every counter in the LEFT column.", correctIds: ["r1c1", "r2c1", "r3c1"] }, { prompt: "Tap every counter in the BOTTOM row.", correctIds: ["r3c1", "r3c2", "r3c3", "r3c4"], target: "bottom row", hint: "The bottom row is row 3.", missFeedback: "The bottom row is row 3. Tap every counter across that row.", successFeedback: "Exactly right — the bottom row has one counter in every column." }],
  ["g2a-03-01", { prompt: "This array shows 4 + 4 + 4. Tap the row that is the LAST addend.", correctIds: ["r3c1", "r3c2", "r3c3", "r3c4"] }, { prompt: "This array shows 4 + 4 + 4. Tap the row that is the FIRST addend.", correctIds: ["r1c1", "r1c2", "r1c3", "r1c4"], target: "first addend", hint: "The first + 4 is the top row, row 1.", missFeedback: "The first + 4 is the top row. Tap every counter in row 1.", successFeedback: "Exactly right — the first + 4 is the top row." }],
  ["g2a-03-02", { prompt: "This 2-by-6 array holds 12. Tap every counter in the BOTTOM row.", correctIds: ["r2c1", "r2c2", "r2c3", "r2c4", "r2c5", "r2c6"] }, { prompt: "This 2-by-6 array holds 12. Tap every counter in the TOP row.", correctIds: ["r1c1", "r1c2", "r1c3", "r1c4", "r1c5", "r1c6"], target: "top row", hint: "The top row is row 1.", missFeedback: "The top row is row 1. Tap every counter across that row.", successFeedback: "Exactly right — the top row has one counter in every column." }],
  ["g2a-03-03", { prompt: "A seed tray: 3 rows of 5. Tap every counter in the MIDDLE row.", correctIds: ["r2c1", "r2c2", "r2c3", "r2c4", "r2c5"] }, { prompt: "A seed tray: 3 rows of 5. Tap every counter in the BOTTOM row.", correctIds: ["r3c1", "r3c2", "r3c3", "r3c4", "r3c5"], target: "bottom row", hint: "The bottom row is row 3.", missFeedback: "The bottom row is row 3. Tap every counter across that row.", successFeedback: "Exactly right — the bottom row has one counter in every column." }],
];

const changed = [];
for (const [lessonId, before, after] of pairRepairs) {
  const path = join(LESSONS, `${lessonId}.json`);
  const lesson = JSON.parse(readFileSync(path, "utf8"));
  if (repairPairs(lesson, before, after)) {
    writeFileSync(path, `${JSON.stringify(lesson, null, 2)}\n`);
    changed.push(lessonId);
  }
}
for (const [lessonId, before, after] of tapRepairs) {
  const path = join(LESSONS, `${lessonId}.json`);
  const lesson = JSON.parse(readFileSync(path, "utf8"));
  if (repairTap(lesson, before, after)) {
    writeFileSync(path, `${JSON.stringify(lesson, null, 2)}\n`);
    changed.push(lessonId);
  }
}

console.log(`S286 arrays-even-odd-g2 progression repair: ${changed.length ? `updated ${changed.join(", ")}` : "already current"}`);
