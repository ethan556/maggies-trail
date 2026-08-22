import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const CHECK = process.argv.includes("--check");
const COURSE = path.join(process.cwd(), "content", "courses", "word-problems-g3", "lessons");

const mainFigures = {
  "g3w-01-01": { step: "c2", before: "two-step-bar", after: "mb-multistep" },
  "g3w-01-03": { step: "c2", before: "mult3-equal-groups", after: "g3w-subtract-once" },
  "g3w-01-04": { step: "c2", before: "bar-join", after: "g3w-share-then-add" },
  "g3w-02-03": { step: "c1", before: "two-step-bar", after: "g3w-subtract-once" },
  "g3w-03-03": { step: "c1", before: "as100-keyword-trap", after: "g3w-relevant-information" },
  "g3w-03-04": { step: "c2", before: "dop-grouping", after: "g3w-multiply-then-add" },
};

const remedials = {
  "g3w-01-01": { figure: "mb-multistep", body: "First build 6 × 4 = 24, then subtract 5 once from the whole to get 19. The hidden total is the product 24." },
  "g3w-01-02": { figure: "dop-grouping", body: "In (2 + 3) × 4, add inside parentheses first: 2 + 3 = 5, then 5 × 4 = 20." },
  "g3w-01-03": { figure: "g3w-subtract-once", body: "Five groups of 4 make 20. Remove 3 once from the whole, not from every group, to leave 17." },
  "g3w-01-04": { figure: "g3w-share-then-add", body: "Eighteen shared among 3 bags gives 6 in each bag. Adding 2 to each bag makes 8 in each." },
  "g3w-02-01": { figure: "mult3-missing-factor", body: "A missing factor can be found with division: 4 × ? = 12, so 12 ÷ 4 = 3." },
  "g3w-02-02": { figure: "mb-multistep", body: "Six groups of 4 make 24. When 5 are donated once from the total, 24 − 5 = 19." },
  "g3w-02-03": { figure: "g3w-subtract-once", body: "Five groups of 4 make 20. Crossing off 3 once from the end leaves 17; crossing off 3 inside every group is a different story." },
  "g3w-02-04": { figure: "mmt-estimate", body: "A useful estimate stays near the exact answer without pretending to be exact. Round friendly numbers, then keep the same operation order." },
  "g3w-03-01": { figure: "mult3-estimate", body: "An estimate can show whether an exact answer is plausible: 4 × 19 is about 4 × 20 = 80, so 76 is reasonable." },
  "g3w-03-02": { figure: "mb-multistep", body: "Six groups of 4 make 24. After 5 are used, 19 remain, so an answer above 24 is impossible." },
  "g3w-03-03": { figure: "g3w-relevant-information", body: "For blue marbles, use 4 blue bags and 6 marbles in each. The 3 red bags are extra information." },
  "g3w-03-04": { figure: "g3w-multiply-then-add", body: "Five groups of 6 make 30, then 4 join once, so (5 × 6) + 4 = 34." },
};

const promptRepairs = {
  "g3w-01-03": {
    k1: ["The hidden shelf total is 54 markers. Students take 11 and return 0. How many remain?", "A shelf has 54 markers. Students take 14, then return 3. How many markers remain?"],
    k3: ["In a compact retrieval case, the hidden total is 24 markers. Students take 21 and return 0. How many remain?", "A tray has 24 markers. Students use 22, then return 1. How many markers remain?"],
  },
  "g3w-01-04": { k1: ["Before any extras are added, what is 24 ÷ 6 counters per team?", "24 counters are shared equally among 6 teams. How many counters does each team get?"] },
  "g3w-02-02": { k2: ["The equation first makes 36 markers, then 4 are taken and 0 returned. How many remain?", "A class makes 36 markers, gives away 9, then makes 5 more. How many markers are there now?"] },
  "g3w-02-03": {
    k2: ["The bar first totals 63 markers. Then 19 are crossed off and 0 returned. How many remain?", "A box has 63 markers. Students use 24, then return 5. How many markers remain?"],
    ch1: ["A bar totals 48 tiles. Then 17 are crossed off and 0 added back. How many remain?", "A box has 48 tiles. Builders use 20, then return 3. How many tiles remain?"],
  },
  "g3w-02-04": { ch1: ["The exact product is 336. Subtract 96 and add 0. What exact result do you get?", "The exact product is 336. A clerk removes 100 apples, then returns 4. How many apples remain?"] },
  "g3w-03-01": {
    k2: ["The rounded product is 400. Subtract 20 and add 0. What checking estimate results?", "The rounded product is 400. A store sells 30 items, then 10 are returned. What checking estimate results?"],
    ch1: ["The exact product is 234. Subtract 0, then add 21. What is the exact result?", "A display starts with 234 cards. 5 are removed, then 26 are added. How many cards are there now?"],
  },
  "g3w-03-02": { k2: ["The shelves begin with 54 markers. Students take 13 and return 0. How many remain?", "A shelf begins with 54 markers. Students borrow 18, then return 5. How many markers remain?"] },
  "g3w-03-04": { ch1: ["The equal groups make 35 markers. Remove 0, then add 6 once. How many markers?", "Equal groups make 35 markers. 2 are removed, then 8 are added. How many markers are there now?"] },
};

const normalize = (prompt) => prompt.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const files = (await readdir(COURSE)).filter((name) => name.endsWith(".json")).sort();
let changed = 0;
const seals = [];

for (const file of files) {
  const full = path.join(COURSE, file);
  const source = await readFile(full, "utf8");
  const lesson = JSON.parse(source);
  const main = mainFigures[lesson.id];
  if (main) {
    const step = lesson.steps.find((entry) => entry.id === main.step);
    if (!step || ![main.before, main.after].includes(step.figure)) throw new Error(`${lesson.id}/${main.step}: unexpected figure ${step?.figure}`);
    step.figure = main.after;
  }

  const route = lesson.remedials?.[0];
  const remedial = remedials[lesson.id];
  if (!route || !remedial) throw new Error(`${lesson.id}: missing expected remedial route/plan`);
  route.concept.figure = remedial.figure;
  route.concept.body = remedial.body;
  route.concept.narration = remedial.body;

  for (const [stepId, [before, after]] of Object.entries(promptRepairs[lesson.id] ?? {})) {
    const step = lesson.steps.find((entry) => entry.id === stepId);
    if (!step?.widget || ![before, after].includes(step.widget.prompt)) throw new Error(`${lesson.id}/${stepId}: unexpected prompt ${step?.widget?.prompt}`);
    step.widget.prompt = after;
  }

  const widgets = [...lesson.steps.filter((entry) => entry.widget), route.check].map((entry) => entry.widget);
  const prompts = widgets.map((widget) => widget.prompt);
  if (new Set(prompts).size !== prompts.length || new Set(prompts.map(normalize)).size !== prompts.length || new Set(widgets.map((widget) => JSON.stringify(widget))).size !== widgets.length) throw new Error(`${lesson.id}: follow-on introduced a progression collision`);

  const output = `${JSON.stringify(lesson, null, 2)}\n`;
  seals.push([lesson.id, sha256(output)]);
  if (output !== source) {
    changed += 1;
    if (!CHECK) await writeFile(full, output, "utf8");
  }
}

const result = {
  status: CHECK ? (changed ? "STALE" : "CURRENT") : "APPLIED",
  lessons: files.length,
  changed,
  remedialFigures: Object.keys(remedials).length,
  diversifiedRemedials: Object.keys(remedials).length,
  mainFigureSynchronizations: Object.keys(mainFigures).length,
  languageLessonsRepaired: Object.keys(promptRepairs).length,
  languagePromptsRepaired: Object.values(promptRepairs).reduce((sum, entries) => sum + Object.keys(entries).length, 0),
  courseSeal: sha256(JSON.stringify(seals)),
};
console.log(JSON.stringify(result, null, 2));
if (CHECK && changed) process.exitCode = 1;
