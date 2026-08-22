import fs from "node:fs";
import path from "node:path";

const dir = "content/courses/conditional-probability/lessons";
const exactUnionBody =
  'Use the same 200-student table: 100 take the bus, 110 play a sport, and 40 do both. `100 + 110 − 40 = 170` shades exactly the students in the bus row or sport column. That is `170/200 = 0.85`; if an "or" probability exceeds 1, the crossing cell was not subtracted once.';

function read(lessonId) {
  const file = path.join(dir, `${lessonId}.json`);
  return { file, source: fs.readFileSync(file, "utf8") };
}

const union = read("cpr-02-03");
const unionLesson = JSON.parse(union.source);
const unionRemedial = unionLesson.remedials?.[0]?.concept;
if (!unionRemedial || unionRemedial.id !== "rc1") throw new Error("cpr-02-03/remedials.0.concept rc1 is missing");
if (unionRemedial.figure !== "cpr-table-union") throw new Error("cpr-02-03/rc1 must retain cpr-table-union");
if (unionRemedial.body !== exactUnionBody) {
  if (!unionRemedial.body.startsWith("Row total + column total always overshoots")) {
    throw new Error("cpr-02-03/rc1 has an unexpected body; refusing a non-idempotent rewrite");
  }
  unionRemedial.body = exactUnionBody;
  const indent = union.source.match(/\n( +)"/)?.[1].length || 2;
  fs.writeFileSync(union.file, `${JSON.stringify(unionLesson, null, indent)}\n`);
}

const multiplication = JSON.parse(read("cpr-03-03").source);
const multiplicationConcept = multiplication.steps?.find((step) => step.id === "c1");
if (multiplicationConcept?.figure !== "cpr-multiplication-area") throw new Error("cpr-03-03/c1 must retain its exact multiplication-area figure");
if (!/0\.5 × 0\.4 = 0\.20/.test(multiplicationConcept.body)) throw new Error("cpr-03-03/c1 no longer states the figure's exact arithmetic");

const counting = read("cpr-05-03");
const countingLesson = JSON.parse(counting.source);
const countingConcept = countingLesson.steps?.find((step) => step.id === "c2");
if (!countingConcept || countingConcept.id !== "c2") throw new Error("cpr-05-03/c2 is missing");
if (countingConcept.figure !== undefined) {
  if (countingConcept.figure !== "cpr-count-prob-bars") {
    throw new Error("cpr-05-03/c2 has an unexpected figure; refusing to remove an unreviewed visual");
  }
  delete countingConcept.figure;
  const indent = counting.source.match(/\n( +)"/)?.[1].length || 2;
  fs.writeFileSync(counting.file, `${JSON.stringify(countingLesson, null, indent)}\n`);
}
const countingCore = countingLesson.steps?.find((step) => step.id === "c1");
if (countingCore?.figure !== "cpr-count-prob-bars") {
  throw new Error("cpr-05-03/c1 must retain the exact 10/56 marble visual");
}

console.log("S273 conditional-probability: exact union remedial, exact multiplication retention, and one unrelated visual fail-closure sealed");
