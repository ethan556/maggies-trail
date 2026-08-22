import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lessonsRoot = path.join(
  repoRoot,
  "content/courses/mult-fluency-g3/lessons",
);
const checkOnly = process.argv.includes("--check");

const plan = {
  "mf3-01-01": {
    figure: "mult3-double",
    c2: "Every ×2 fact is a double: the model shows 2 × 5 = 5 + 5 = 10.",
  },
  "mf3-01-02": { figure: "mult3-equal-groups" },
  "mf3-01-03": {
    figure: "mult3-double-double",
    c1: "Multiplying by 4 is doubling twice: for 4 × 6, double 6 to 12, then double 12 to 24.",
  },
  "mf3-01-04": {
    figure: "mult3-fives",
    c2: "The last digit is a check, not the whole answer: ×5 products alternate between ending in 5 and ending in 0.",
  },
  "mf3-01-05": {
    figure: "mult3-break-apart",
    c1: "A hard ×6 fact can be split into known parts: 7 × 6 is 5 × 6 plus 2 × 6, so 30 + 12 = 42.",
    c2: "Breaking a hard fact into two known facts is faster and safer than counting every object.",
  },
  "mf3-01-06": {
    figure: "mult3-break-apart",
    c1: "The ×7 facts do not share one quick pattern as obvious as ×2, ×5, or ×10, so use facts you already know.",
    c2: "For 7 × 6, split the seven groups into five groups and two groups: 30 + 12 = 42.",
  },
  "mf3-02-01": { figure: "mult3-double-double" },
  "mf3-02-02": { figure: "mult3-nines" },
  "mf3-02-03": {
    figure: null,
    c1: "Multiplying a whole number by 10 makes each digit worth ten times as much: 7 ones become 7 tens, or 70.",
    c2: "The zero records an empty ones place; it is not simply tacked onto a fact.",
    remedial:
      "Multiplying a whole number by 10 makes each digit worth ten times as much. The zero records an empty ones place.",
  },
  "mf3-02-04": {
    figure: null,
    c1: "A square array has the same number of rows and columns. Its equal side counts make a square.",
    c2: "Growing to the next square adds one new row and one new column.",
  },
  "mf3-02-05": {
    figure: "mult3-mult-table",
    c1: "Some facts, such as 6 × 7, 7 × 8, and 8 × 9, do not all share one quick table pattern. Practise them until recall is reliable.",
  },
  "mf3-02-06": { figure: "mult3-break-apart" },
  "mf3-03-01": { figure: "mult3-mult-table" },
  "mf3-03-02": { figure: "mult3-mult-table" },
  "mf3-03-03": { figure: "mult3-mult-table" },
  "mf3-03-04": {
    figure: "mult3-missing-factor",
    c1: "A missing factor turns multiplication around: 4 × ? = 12 asks what completes the fact.",
    c2: "The matching division fact finds the missing factor.",
  },
  "mf3-03-05": {
    figure: "mult3-fact-family",
    c1: "Three numbers make one fact family: 3, 4, and 12 give two multiplications and two divisions.",
  },
  "mf3-03-06": {
    figure: "mult3-mult-table",
    c1: "The whole multiplication table is a network of rows and columns; by now most entries are familiar.",
  },
};

const errors = [];
const repaired = [];

for (const [lessonId, lessonPlan] of Object.entries(plan)) {
  const file = path.join(lessonsRoot, `${lessonId}.json`);
  const lesson = JSON.parse(fs.readFileSync(file, "utf8"));

  if (lesson.id !== lessonId) {
    errors.push(`${lessonId}: lesson id is ${lesson.id}`);
    continue;
  }

  const byId = new Map(lesson.steps.map((step) => [step.id, step]));
  const c1 = byId.get("c1");
  const c2 = byId.get("c2");
  const recap = byId.get("r1");
  const remedial = lesson.remedials?.[0]?.concept;
  if (!c1 || !c2 || !recap || !remedial) {
    errors.push(`${lessonId}: missing c1, c2, or remedial-c1`);
    continue;
  }

  for (const concept of [c1, c2]) {
    if (
      concept.figure !== "bar-compare" &&
      concept.figure !== lessonPlan.figure &&
      !(lessonPlan.figure === null && concept.figure === undefined)
    ) {
      errors.push(
        `${lessonId}: unexpected pre-repair figure ${JSON.stringify(concept.figure)}`,
      );
    }
    if (lessonPlan.figure === null) delete concept.figure;
    else concept.figure = lessonPlan.figure;
  }

  for (const key of ["c1", "c2"]) {
    if (!lessonPlan[key]) continue;
    const concept = key === "c1" ? c1 : c2;
    concept.body = lessonPlan[key];
    concept.narration = lessonPlan[key];
  }

  if (lessonPlan.remedial) {
    remedial.body = lessonPlan.remedial;
    remedial.narration = lessonPlan.remedial;
    if (recap.body === lessonPlan.remedial) {
      recap.body = "You did it!";
      delete recap.narration;
    }
    if (Array.isArray(recap.takeaways) && recap.takeaways[1] === "Digits shift one place left.") {
      recap.takeaways[1] = "Each digit becomes worth ten times as much.";
    }
  }

  const output = `${JSON.stringify(lesson, null, 2)}\n`;
  const input = fs.readFileSync(file, "utf8");
  if (input !== output) {
    repaired.push(lessonId);
    if (!checkOnly) fs.writeFileSync(file, output, "utf8");
  }
}

if (errors.length > 0) {
  throw new Error(`Course repair guard failed:\n${errors.join("\n")}`);
}
if (checkOnly && repaired.length > 0) {
  throw new Error(`Repair drift in: ${repaired.join(", ")}`);
}

console.log(
  checkOnly
    ? `Verified ${Object.keys(plan).length} multiplication-fluency lessons.`
    : `Repaired ${repaired.length} multiplication-fluency lessons.`,
);
