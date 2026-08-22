/** S268 — Measure, Money & Time: truthful visual and question-job closure. */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lessonDir = path.join(root, "content", "courses", "measure-money-time", "lessons");
const legacyIndent = new Map([["mmt-02-01", 1], ["mmt-04-03", 2], ["mmt-05-01", 1], ["mmt-05-02", 1], ["mmt-05-03", 2]]);
function serialize(lesson) {
  const indent = legacyIndent.get(lesson.id);
  if (indent === undefined) throw new Error(`unexpected lesson ${lesson.id}`);
  return `${JSON.stringify(lesson, null, indent)}\n`;
}

const replacements = Object.freeze({
  "mmt-02-01": {
    stepId: "ch1", body: "Match an object to a sensible estimate.",
    widget: {
      type: "matchPairs", prompt: "Match each object to a good estimate of its length.",
      left: [{ id: "l1", label: "a book, about 9 inches" }, { id: "l2", label: "a key, about 4 inches" }, { id: "l3", label: "a marker, about 12 inches" }],
      right: [{ id: "r1", label: "10 inches" }, { id: "r2", label: "5 inches" }, { id: "r3", label: "13 inches" }],
      pairs: { l1: "r1", l2: "r2", l3: "r3" },
      pairErrors: [{ left: "l2", right: "r3", feedback: "13 inches is much too long for a 4-inch key. A good estimate is close: 5 inches." }],
      missFeedback: "Choose the number that is close to each real length, not a number far away.",
      successFeedback: "Great estimates — each choice is close to the object, not exact on purpose!",
    },
  },
  "mmt-04-03": {
    conceptBody: "On this clock, the minute hand points to 4, so 4 × 5 = 20 minutes. The short hand is between 3 and 4, so the time is 3:20. For any other clock, skip-count the minute hand by 5s, then read the hour from the short hand.",
    challenge: {
      body: "Read the hands before setting one yourself.",
      widget: {
        type: "mcq", prompt: "The minute hand points to 8. The short hand is just past 2. What time is it?",
        options: [
          { id: "a", label: "2:08", feedback: "The minute hand's number is counted by 5s: 8 × 5 = 40, not 8." },
          { id: "b", label: "2:40", correct: true, feedback: "Yes — 8 five-minute marks is 40 minutes, and the short hand says 2." },
          { id: "c", label: "8:10", feedback: "The long hand gives minutes, not the hour. The short hand is just past 2." },
          { id: "d", label: "3:40", feedback: "The short hand has not reached 3 yet. It is still 2:40." },
        ],
      },
    },
  },
  "mmt-05-02": {
    i3: {
      body: "Compare two bar heights.",
      widget: {
        type: "lengthCompare", mode: "difference", orientation: "h", prompt: "A bar graph shows 4 votes for cats and 7 votes for dogs. How many more votes for dogs?", unitLabel: "votes",
        items: [{ id: "dogs", label: "Dogs", length: 7 }, { id: "cats", label: "Cats", length: 4 }], answerId: "dogs", targetDifference: 3, diffMax: 7,
        successFeedback: "3 more votes — compare the gap from 4 to 7.", countsWholeFeedback: "7 is the dogs total. The question asks for the gap: 7 − 4 = 3.", missFeedback: "Start at the end of the cats bar and count to the end of the dogs bar.",
      },
    },
    k2: {
      body: "Catch a scale mistake.",
      widget: {
        type: "mcq", prompt: "A bar reaches 8. Each gridline is worth 1. Maya says the value is 16. Is Maya right?",
        options: [
          { id: "a", label: "No — the value is 8", correct: true, feedback: "Right — each line is 1, so a bar at 8 means 8, not 16." },
          { id: "b", label: "Yes — double 8", feedback: "Doubling would only work if each line were worth 2. Here each line is 1." },
          { id: "c", label: "No — the value is 1", feedback: "One is the value of each gridline, not the height the bar reaches." },
        ],
      },
    },
    k3: {
      body: "Read a named bar.",
      widget: {
        type: "graphRead", mode: "bar", prompt: "The plants bar ends at the gridline marked 5. Each gridline is 1 plant. How many plants are shown?", drawn: 5, unitValue: 1, categoryLabel: "Plants", unitNoun: "plant", unitNounPlural: "plants", scaleMax: 12,
        commonResults: [{ value: 10, feedback: "Do not double the height. Each gridline is 1, so the bar shows 5 plants." }, { value: 4, feedback: "The bar reaches the gridline marked 5." }],
        fallbackFeedback: "Read the top of the plants bar: it reaches 5.", successFeedback: "5 plants — one gridline per plant, read directly from the bar.",
      },
    },
    challenge: {
      body: "Use bar heights to find a gap.",
      widget: {
        type: "mcq", prompt: "The blue bar reaches 11 and the green bar reaches 6. How many more does the blue bar show?",
        options: [
          { id: "a", label: "5", correct: true, feedback: "Yes — 11 − 6 = 5 more." },
          { id: "b", label: "17", feedback: "17 adds the bar heights. “How many more” asks for the gap: 11 − 6." },
          { id: "c", label: "11", feedback: "11 is the blue bar's total, not how many more it shows." },
        ],
      },
    },
  },
});

async function load(id) {
  const source = path.join(lessonDir, `${id}.json`);
  return { source, lesson: JSON.parse(await readFile(source, "utf8")) };
}
function step(lesson, id) {
  const found = lesson.steps.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`missing ${lesson.id}/${id}`);
  return found;
}
function applyWidget(target, body, widget) {
  if (JSON.stringify(target.widget) === JSON.stringify(widget)) return false;
  target.body = body;
  target.widget = widget;
  return true;
}

let repaired = 0;
{
  const { source, lesson } = await load("mmt-02-01");
  repaired += Number(applyWidget(step(lesson, replacements["mmt-02-01"].stepId), replacements["mmt-02-01"].body, replacements["mmt-02-01"].widget));
  await writeFile(source, serialize(lesson), "utf8");
}
{
  const { source, lesson } = await load("mmt-04-03");
  const concept = step(lesson, "c1");
  if (concept.figure !== "five-minute-clock") throw new Error("mmt-04-03/c1 must retain its exact clock figure");
  if (concept.body !== replacements["mmt-04-03"].conceptBody) { concept.body = replacements["mmt-04-03"].conceptBody; repaired += 1; }
  repaired += Number(applyWidget(step(lesson, "ch1"), replacements["mmt-04-03"].challenge.body, replacements["mmt-04-03"].challenge.widget));
  await writeFile(source, serialize(lesson), "utf8");
}
{
  const { source, lesson } = await load("mmt-05-01");
  const concept = step(lesson, "c1");
  if (concept.figure === "single-scale-graph") { concept.figure = "mmt-picture-graph"; repaired += 1; }
  else if (concept.figure !== "mmt-picture-graph") throw new Error(`mmt-05-01/c1 unexpected figure ${concept.figure}`);
  await writeFile(source, serialize(lesson), "utf8");
}
{
  const { source, lesson } = await load("mmt-05-02");
  repaired += Number(applyWidget(step(lesson, "i3"), replacements["mmt-05-02"].i3.body, replacements["mmt-05-02"].i3.widget));
  repaired += Number(applyWidget(step(lesson, "k2"), replacements["mmt-05-02"].k2.body, replacements["mmt-05-02"].k2.widget));
  repaired += Number(applyWidget(step(lesson, "k3"), replacements["mmt-05-02"].k3.body, replacements["mmt-05-02"].k3.widget));
  repaired += Number(applyWidget(step(lesson, "ch1"), replacements["mmt-05-02"].challenge.body, replacements["mmt-05-02"].challenge.widget));
  await writeFile(source, serialize(lesson), "utf8");
}
{
  const { source, lesson } = await load("mmt-05-03");
  const concept = step(lesson, "c1");
  if (concept.figure === "single-scale-graph") { concept.figure = "md3-lineplot"; repaired += 1; }
  else if (concept.figure !== "md3-lineplot") throw new Error(`mmt-05-03/c1 unexpected figure ${concept.figure}`);
  await writeFile(source, serialize(lesson), "utf8");
}
{
  const { lesson } = await load("mmt-03-02");
  const concept = step(lesson, "c2");
  if (concept.figure !== "mmt-biggest-first" || !concept.body.includes("25, 50, 75")) throw new Error("mmt-03-02/c2 no longer matches the rendered quarter sequence");
}

if (repaired > 10) throw new Error(`guard failed: ${repaired}`);
console.log(JSON.stringify({ course: "measure-money-time", repaired, expected: 10, idempotent: repaired === 0 }, null, 2));
