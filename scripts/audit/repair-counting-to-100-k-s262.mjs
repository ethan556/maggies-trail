import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DIR = path.join(ROOT, "content", "courses", "counting-to-100-k", "lessons");
const CHECK = process.argv.includes("--check");

const bindings = {
  "k100-01-01": { c2: "c120-same-pattern" },
  "k100-01-02": { c1: "odometer-roll", c2: "c120-roll-ten" },
  "k100-01-03": { c1: "chart-120", c2: "chart-120" },
  "k100-01-04": { c1: "tno-move-tens-digit", c2: "tno-move-tens-digit" },
  "k100-01-05": { c1: "kc-ten-hops-to-100", c2: "kc-ten-hops-to-100" },
  "k100-01-06": { c2: "kc-ten-hops-to-100" },
  "k100-02-01": { c1: "kc-by-tens", c2: "kc-by-tens" },
  "k100-02-02": { c1: "kc-ten-hops-to-100", c2: "kc-ten-hops-to-100" },
  "k100-02-03": { c1: "chart-120", c2: "chart-rows" },
  "k100-02-04": { c1: "kc-ten-hops-to-100", c2: "kc-ten-hops-to-100" },
  "k100-02-05": { c1: "tno-count-down-tens", c2: "tno-count-down-tens" },
  "k100-03-03": { c1: "chart-120", c2: "chart-120" },
  "k100-03-05": { c1: "chart-rows", c2: "c120-chart-row" },
  "k100-03-06": { c1: "c120-missing-order", c2: "c120-missing-order" },
};

const residuals = new Set([
  "k100-01-06/c1",
  "k100-03-01/c1", "k100-03-01/c2",
  "k100-03-02/c1", "k100-03-02/c2",
  "k100-03-04/c1", "k100-03-04/c2",
  "k100-03-07/c1", "k100-03-07/c2",
]);

const bodies = {
  "k100-01-01/c2": "Counting past 20 repeats a pattern. The picture shows 24, 25, 26 growing just like 4, 5, 6, with a 2 in front.",
  "k100-01-02/c1": "When the ones digit reaches 9, one more starts the next group of ten. The picture shows 29 rolling to 30.",
  "k100-01-02/c2": "A number ending in 9 is followed by the next group of ten: 29 then 30, 39 then 40, and 49 then 50.",
  "k100-01-03/c1": "The blue chart row shows 41 through 50. Read each square from left to right to keep the count going.",
  "k100-01-03/c2": "In the blue row, the numbers go 41, 42, 43 and keep growing by one until 50.",
  "k100-01-04/c1": "Fifty, sixty, and seventy are ten apart. The arrows show that one ten-step moves to the next number name.",
  "k100-01-04/c2": "The picture shows 50, 60, 70. Move right one ten-step to count forward, or left one ten-step to count back.",
  "k100-01-05/c1": "The number line reaches 100 in equal jumps of ten. The last jumps land on 70, 80, 90, and 100.",
  "k100-01-05/c2": "Ten equal jumps of ten reach 100. Each landing adds one more group of ten.",
  "k100-01-06/c2": "One hundred is ten groups of ten. The number line shows ten equal ten-jumps landing on 100.",
  "k100-02-01/c1": "Count by tens: 10, 20, 30, 40. Each new card is one whole ten more.",
  "k100-02-01/c2": "The cards show four tens landings in order: 10, 20, 30, 40.",
  "k100-02-02/c1": "The number line keeps counting by tens all the way to 100. Every giant hop adds ten.",
  "k100-02-02/c2": "Treat each landing as one bundle of ten. Ten bundle-landings make 100.",
  "k100-02-03/c1": "A number chart places ten numbers in each row. Read across by ones; move down one row for ten more.",
  "k100-02-03/c2": "The first three chart rows end at 10, 20, and 30. Each complete row holds ten numbers.",
  "k100-02-04/c1": "The number line shows which ten comes next: each giant hop lands ten more.",
  "k100-02-04/c2": "Find the current tens landing, then follow one giant hop right to the next ten.",
  "k100-02-05/c1": "Counting back by tens means each step is ten less. The picture counts 65, 55, 45, 35.",
  "k100-02-05/c2": "The picture walks backward by equal ten-steps: 65, 55, 45, 35.",
  "k100-03-03/c1": "The count stopped at 46. On the blue chart row, start again with 47, then 48 and 49.",
  "k100-03-03/c2": "To restart a count, find the last number on the chart and read the next squares in order.",
  "k100-03-05/c1": "The chart row shows 29 at the end and 30 next. Counting continues into the next row.",
  "k100-03-05/c2": "Read a chart row left to right. After its last square, continue with the first square of the next row.",
  "k100-03-06/c1": "A covered square still has one correct number. The picture shows 42, 43, a covered square, then 45.",
  "k100-03-06/c2": "Say the row in order: 42, 43, 44, 45. The covered square must be 44.",
};

const stringReplacements = new Map([
  ["Every ten ends in 9, then a new ten starts: 29 then 30, 39 then 40, 49 then 50.", "A number ending in 9 is followed by the next ten: 29 then 30, 39 then 40, and 49 then 50."],
  ["Every ten ends in 9.", "A number ending in 9 is followed by the next ten."],
  ["The tens names change — fifty, sixty, seventy — but inside each ten it is still 1 to 9.", "The tens names change — fifty, sixty, seventy — while the ones digit still follows its counting pattern."],
  ["Inside each ten: 1 to 9, then a new ten.", "The ones digits follow their counting pattern, then the next ten begins."],
  ["Start at 10 and count on 2: you land on 30.", "Start at 10 and make two ten-hops: you land on 30."],
  ["Start at 70 and count on 2: you land on 90.", "Start at 70 and make two ten-hops: you land on 90."],
  ["Start at 20 and count on one: you land on 30.", "Start at 20 and make one ten-hop: you land on 30."],
  ["Start at 40 and count on one: you land on 50.", "Start at 40 and make one ten-hop: you land on 50."],
  ["Start at 50 and count on one: you land on 60.", "Start at 50 and make one ten-hop: you land on 60."],
  ["Start at 60 and count on one: you land on 70.", "Start at 60 and make one ten-hop: you land on 70."],
  ["Start at 70 and count on one: you land on 80.", "Start at 70 and make one ten-hop: you land on 80."],
  ["Start at 80 and count back one: you land on 70.", "Start at 80 and make one ten-hop back: you land on 70."],
  ["Start at 100 and count back one: you land on 90.", "Start at 100 and make one ten-hop back: you land on 90."],
  ["Counting back walks DOWN the number line: 60 back 20 lands on 40. 80 is what counting FORWARD 20 gives — right arithmetic, wrong direction.", "Counting back makes the numbers smaller: two ten-hops back from 60 land on 40. Moving forward instead would land on 80."],
  ["Counting back walks DOWN the number line: 20 back 4 lands on 16. 24 is what counting FORWARD 4 gives — right arithmetic, wrong direction.", "Counting back makes the numbers smaller: four one-steps back from 20 land on 16. Moving forward instead would land on 24."],
]);

function step(lesson, id) {
  const found = lesson.steps.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`${lesson.id}: missing step ${id}`);
  return found;
}

function replaceStrings(value) {
  if (typeof value === "string") return stringReplacements.get(value) ?? value;
  if (Array.isArray(value)) return value.map(replaceStrings);
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) value[key] = replaceStrings(child);
  }
  return value;
}

function mcqOption(widget, id) {
  const option = widget.options.find((candidate) => candidate.id === id);
  if (!option) throw new Error(`missing option ${id}`);
  return option;
}

function repairLesson(lesson) {
  replaceStrings(lesson);
  for (const id of ["c1", "c2"]) {
    const host = step(lesson, id);
    const key = `${lesson.id}/${id}`;
    const figure = bindings[lesson.id]?.[id];
    if (figure) host.figure = figure;
    else if (residuals.has(key)) delete host.figure;
    if (bodies[key]) host.body = bodies[key];
  }

  const remedial = lesson.remedials?.[0]?.concept;
  if (remedial) {
    remedial.body = step(lesson, "c2").body;
    const figure = bindings[lesson.id]?.c2;
    if (figure) remedial.figure = figure;
    else delete remedial.figure;
  }

  if (lesson.id === "k100-02-01") {
    const k2 = step(lesson, "k2");
    k2.body = "Build one more ten.";
    k2.widget.prompt = "Three bundles of ten are ready. Add one bundle. What total do you have?";
    k2.explanationVariants = ["Three bundles are 30. One more bundle makes 40.", "Add one whole ten: 30, then 40."];
    k2.hints = ["Each bundle is ten.", "Three bundles are 30; add one more bundle.", "40."];

    const k3 = step(lesson, "k3");
    k3.body = "Fill the tens gap.";
    k3.widget.prompt = "Fill the missing ten: 20, 30, __, 50.";
    const labels = { o0: "40", o1: "30", o2: "50", o3: "41" };
    for (const option of k3.widget.options) option.label = labels[option.id];
    mcqOption(k3.widget, "o0").feedback = "Yes — the tens count is 20, 30, 40, 50.";
    mcqOption(k3.widget, "o1").feedback = "That repeats the ten before the gap. The missing ten is 40.";
    mcqOption(k3.widget, "o2").feedback = "That is the ten after the gap. The missing ten is 40.";
    mcqOption(k3.widget, "o3").feedback = "That adds one, not a whole ten. The missing ten is 40.";
    k3.explanationVariants = ["The tens count goes 20, 30, 40, 50.", "One ten after 30 is 40."];
    k3.hints = ["Count by tens, not ones.", "20, 30, then?", "40."];
    k3.variant.form = "kTensNextMcq";
  }

  if (lesson.id === "k100-02-03") {
    for (const id of ["k1", "k2", "ch1"]) step(lesson, id).figure = "chart-120";
  }

  if (lesson.id === "k100-02-05") {
    const k3 = step(lesson, "k3");
    k3.body = "Ten back.";
    k3.widget.prompt = "Counting back by tens — what comes before 40?";
    mcqOption(k3.widget, "o0").feedback = "That is two ten-steps back. One ten before 40 is 30.";
    mcqOption(k3.widget, "o1").feedback = "Yes — one ten before 40 is 30.";
    mcqOption(k3.widget, "o2").feedback = "That subtracts 19, not one whole ten. One ten before 40 is 30.";
    mcqOption(k3.widget, "o3").feedback = "That is three ten-steps back. One ten before 40 is 30.";
    k3.explanationVariants = ["Count one ten back from 40 to 30.", "The backward tens count goes 50, 40, 30."];
    k3.hints = ["Count backward by one whole ten.", "40, then one ten back.", "30."];
    k3.variant.form = "kTensBackHop";
  }

  if (lesson.id === "k100-03-02") {
    const yes = step(lesson, "i1").predict.options.find((option) => option.id === "yes");
    yes.label = "Yes — you pass 40 and land on 42";
  }
  if (lesson.id === "k100-03-03") {
    const yes = step(lesson, "i1").predict.options.find((option) => option.id === "yes");
    yes.label = "Yes — you pass 50 and land on 51";
  }
  if (lesson.id === "k100-03-05") {
    step(lesson, "i1").figure = "c120-chart-row";
    step(lesson, "k2").figure = "chart-120";
    step(lesson, "ch1").figure = "chart-120";
  }
  if (lesson.id === "k100-03-06") {
    for (const id of ["k1", "k2", "ch1"]) step(lesson, id).figure = "c120-missing-order";
    step(lesson, "k3").figure = "chart-120";
  }
  if (lesson.id === "k100-03-07") {
    const i2 = step(lesson, "i2");
    i2.body = "Put the numbers in backward counting order.";
    i2.widget.prompt = "Drag these into backward counting order, biggest first.";
    i2.widget.correctOrder = ["n4", "n3", "n2", "n1", "n0"];
    i2.widget.misorderFeedback = [
      { first: "n0", second: "n4", feedback: "Backward counting starts with 18, the biggest number." },
      { first: "n2", second: "n3", feedback: "17 comes before 16 when the count moves backward." },
    ];
    i2.widget.missFeedback = "Count backward from the biggest: 18, 17, 16, 15, 14.";
    i2.widget.successFeedback = "18, 17, 16, 15, 14 — correct backward counting order!";

    const k3 = step(lesson, "k3");
    k3.body = "Fill the backward gap.";
    k3.widget.prompt = "Fill the missing number: 17, 16, __, 14.";
    mcqOption(k3.widget, "o0").feedback = "Yes — 17, 16, 15, 14 counts backward.";
    mcqOption(k3.widget, "o1").feedback = "That repeats the number before the gap. Count one back from 16 to 15.";
    mcqOption(k3.widget, "o2").feedback = "That moves forward. The backward gap holds 15.";
    mcqOption(k3.widget, "o3").feedback = "That moves forward past 17. The backward gap holds 15.";
    for (const option of k3.widget.options) if (option.id === "o0") option.label = "15"; else if (option.id === "o1") option.label = "16"; else if (option.id === "o2") option.label = "17"; else option.label = "18";
    k3.explanationVariants = ["The backward count is 17, 16, 15, 14.", "One back from 16 is 15."];
    k3.hints = ["Read the run backward.", "16, then one less?", "15."];
  }
}

const files = fs.readdirSync(DIR).filter((file) => file.endsWith(".json")).sort();
if (files.length !== 18) throw new Error(`expected 18 lessons, found ${files.length}`);
let changed = 0;
for (const file of files) {
  const full = path.join(DIR, file);
  const before = fs.readFileSync(full, "utf8");
  const lesson = JSON.parse(before);
  const idsBefore = JSON.stringify(lesson.steps.map((item) => item.id));
  repairLesson(lesson);
  if (JSON.stringify(lesson.steps.map((item) => item.id)) !== idsBefore) throw new Error(`${lesson.id}: stable step IDs changed`);
  const after = `${JSON.stringify(lesson, null, 2)}\n`;
  if (after !== before) {
    changed += 1;
    if (!CHECK) fs.writeFileSync(full, after);
  }
}

const status = changed ? `${changed} lesson files need repair` : "CURRENT";
if (CHECK && changed) throw new Error(status);
console.log(`${CHECK ? "CHECK" : "REPAIR"} counting-to-100-k: ${status}; 26 truthful concept bindings; 9 explicit fail-closed residuals`);
