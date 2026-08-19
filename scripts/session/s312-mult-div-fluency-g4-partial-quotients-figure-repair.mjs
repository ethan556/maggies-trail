/**
 * S312 — binds the exact partial-quotients representation for g4m-02-04/c1.
 *
 * The guard intentionally permits only the audited generic long-division copy or
 * the exact 852 ÷ 4 chunk model. It never mutates evaluator-bearing steps.
 * Run: node scripts/session/s312-mult-div-fluency-g4-partial-quotients-figure-repair.mjs [--check]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const FILE = join(process.cwd(), "content", "courses", "mult-div-fluency-g4", "lessons", "g4m-02-04.json");
const FIGURE = "g4m-partial-quotients-852-4";
const BEFORE = "The long-division cycle can remove large known groups instead of one group at a time. Each partial quotient records how many divisor-sized groups were removed, and the partial quotients add to the total.";
const AFTER = "The partial-quotients model for 852 ÷ 4 removes 200 groups of 4 (800), leaving 52. Then 13 groups of 4 remove the rest. The partial quotients 200 + 13 make the quotient 213.";

const raw = readFileSync(FILE, "utf8");
const lesson = JSON.parse(raw);
const concept = lesson.steps?.find((step) => step.id === "c1");
if (!concept || concept.kind !== "concept") throw new Error("g4m-02-04/c1 concept is missing");

const current = concept.figure === FIGURE && concept.body === AFTER && concept.narration === AFTER;
const baseline = concept.figure === "dop-long-division" && concept.body === BEFORE && concept.narration === BEFORE;
if (!current && !baseline) throw new Error("g4m-02-04/c1 drifted; refusing an unsafe partial-quotients rewrite");

if (process.argv.includes("--check")) {
  if (!current) {
    console.error("PENDING S312 g4m-02-04/c1 partial-quotients figure binding");
    process.exitCode = 1;
  } else {
    console.log("CURRENT S312 g4m-02-04/c1 exact partial-quotients figure binding");
  }
} else if (current) {
  console.log("CURRENT S312 g4m-02-04/c1 exact partial-quotients figure binding");
} else {
  concept.figure = FIGURE;
  concept.body = AFTER;
  concept.narration = AFTER;
  const eol = raw.includes("\r\n") ? "\r\n" : "\n";
  writeFileSync(FILE, `${JSON.stringify(lesson, null, 2).replace(/\n/g, eol)}${eol}`);
  console.log("REPAIRED S312 g4m-02-04/c1 exact partial-quotients figure binding");
}