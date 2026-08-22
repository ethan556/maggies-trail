import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const COURSE = path.join(ROOT, "content", "courses", "data-line-plots-g2", "lessons");
const CHECK = process.argv.includes("--check");

const figures = {
  "g2g-01-01": { c1: "ruler-measure", c2: "mmt-same-reading" },
  "g2g-01-02": { c1: "dd-data-answers", c2: "vm-line-plot-read" },
  "g2g-01-03": { c1: "vm-line-plot-read", c2: "vm-line-plot-read" },
  "g2g-01-04": { c1: "vm-line-plot-read", c2: "vm-line-plot-read" },
  "g2g-01-05": { c1: "vm-line-plot-read", c2: "vm-line-plot-read" },
  "g2g-02-01": { c1: "mmt-picture-graph", c2: "mmt-picture-graph" },
  "g2g-02-02": { c1: "mmt-picture-graph", c2: "mmt-picture-graph" },
  "g2g-02-03": { c1: "single-scale-graph", c2: "single-scale-graph" },
  "g2g-02-04": { c1: "single-scale-graph", c2: "mmt-taller-bar" },
  "g2g-03-01": { c1: "single-scale-graph", c2: "single-scale-graph" },
  "g2g-03-02": { c1: "mmt-graph-subtraction", c2: "single-scale-graph" },
  "g2g-03-03": { c1: "vm-line-plot-read", c2: "single-scale-graph" },
};

function step(lesson, id) {
  const found = lesson.steps.find((entry) => entry.id === id);
  if (!found) throw new Error(`Missing ${lesson.id}/${id}`);
  return found;
}

function setConcept(lesson, id, body) {
  const target = step(lesson, id);
  target.body = body;
  target.narration = body;
}

function dotPlot(prompt, values, target, askIndex, successFeedback, partialFeedback) {
  return {
    type: "dotPlot",
    prompt,
    values,
    target,
    maxPerValue: Math.max(...target) + 1,
    successFeedback,
    partialFeedback,
    denominator: 2,
    given: [...target],
    askIndex,
  };
}

function repairProgression(lesson) {
  switch (lesson.id) {
    case "g2g-01-01": {
      const i2 = step(lesson, "i2").widget;
      Object.assign(i2, {
        prompt: "Check a second ribbon with the same one-unit blocks: align its start and cover its 5-unit length exactly.",
        objectStart: 1, objectEnd: 6, requiredPlacements: 5,
        successFeedback: "Five one-unit blocks cover the second ribbon, so both measurements use the same unit.",
      });
      step(lesson, "k3").widget.prompt = "A ribbon starts at the 1 cm mark and ends at the 6 cm mark. A classmate reports 6 cm. What length should be recorded?";
      step(lesson, "ch1").widget.prompt = "A new ribbon runs from 4 cm to 11 cm. What span belongs in the shared-centimeter data table?";
      break;
    }
    case "g2g-01-02": {
      const i2 = step(lesson, "i2").widget;
      Object.assign(i2, {
        prompt: "Make tallies for a second record: 5 cm once, 6 cm three times, and 7 cm twice.",
        categories: ["5 cm", "6 cm", "7 cm"], target: [1, 3, 2],
        successFeedback: "One, three, two — the new tally keeps all six measurements, including repeats.",
        partialFeedback: "Give every repeated measurement its own tally in the matching length row.",
      });
      step(lesson, "k3").widget = {
        type: "mcq",
        prompt: "A record says 5, 7, 5, 6 cm. A student rewrites it as 5, 6, 7 cm. What information was lost?",
        options: [
          { id: "o0", label: "One of the two 5 cm measurements", correct: true, feedback: "Correct — both 5 cm measurements are separate data and both must remain in the record." },
          { id: "o1", label: "Nothing; repeats never matter", correct: false, feedback: "Repeats show how often a value occurred, so removing one changes the data." },
          { id: "o2", label: "The 7 cm measurement", correct: false, feedback: "Seven is still listed; the missing fact is the second measurement of 5 cm." },
          { id: "o3", label: "The measurement unit", correct: false, feedback: "Centimeters still appear; the lost information is one repeated value." },
        ],
      };
      step(lesson, "ch1").widget.prompt = "Before adding a ribbon to the record, note that it starts at 1 cm and ends at 6 cm. What length should be entered?";
      break;
    }
    case "g2g-01-03":
      step(lesson, "i2").widget = dotPlot(
        "A second record has one 4, two 5s, and three 6s. Check its line plot by counting the x's above 6.",
        [8, 10, 12], [1, 2, 3], 2,
        "Three x's stand above 6, one for each recorded 6.",
        "Match each stack to the second record; every repeated value needs its own x.",
      );
      step(lesson, "k2").widget.prompt = "5 x's stand above 10 on a line plot. What frequency should be recorded for the value 10?";
      break;
    case "g2g-01-04":
      step(lesson, "i2").widget = dotPlot(
        "Read a different line plot: how many ribbons measured 7? Count only the x's in that stack.",
        [10, 12, 14], [2, 1, 5], 2,
        "Five — the stack above 7 contains exactly five x's.",
        "Use the number below to choose the stack, then count the x's above it.",
      );
      step(lesson, "k2").widget.prompt = "3 x's stand above the label 9. What is the frequency at 9?";
      step(lesson, "ch1").widget.prompt = "3 x's stand above 8 on the line plot. What frequency belongs in the data table for 8?";
      break;
    case "g2g-01-05":
      step(lesson, "i2").widget = dotPlot(
        "Compare a new set of stacks. Which measured value appears most often?",
        [8, 10, 12, 14], [4, 2, 6, 3], 2,
        "Six is most common because six x's make the tallest stack above 6.",
        "First find the tallest stack; then read the measured value below it.",
      );
      step(lesson, "k3").widget.prompt = "In a second line plot, the counts above 5, 6, 7, and 8 inches are 6, 2, 3, and 1. Which length appears most often?";
      step(lesson, "ch1").widget.prompt = "5 x's make the stack above 3 inches tallest. How many measurements are in that winning stack?";
      break;
    case "g2g-02-01": {
      const i2 = step(lesson, "i2").widget;
      Object.assign(i2, {
        prompt: "Build a second key-of-1 picture graph: Thursday 2 finds, Friday 5, Saturday 4.",
        categories: ["Thursday", "Friday", "Saturday"], target: [2, 5, 4],
        successFeedback: "Two, five, and four pictures match the second set of category counts.",
        partialFeedback: "With a key of 1, place exactly one picture for each find in its day row.",
      });
      break;
    }
    case "g2g-02-02": {
      const i2 = step(lesson, "i2").widget;
      Object.assign(i2, {
        prompt: "Read Wednesday's row in a new key-of-1 picture graph. Move the marker to its count.",
        drawn: 4, categoryLabel: "Wednesday", scaleMax: 8,
        commonResults: [
          { value: 3, feedback: "That stopped one picture short; count all four pictures in Wednesday's row." },
          { value: 5, feedback: "That counted one picture too many; only four are drawn in Wednesday's row." },
        ],
        fallbackFeedback: "Count only the pictures in Wednesday's row, one at a time.",
        successFeedback: "Four — every picture in Wednesday's row was counted once.",
      });
      break;
    }
    case "g2g-02-03": {
      const i2 = step(lesson, "i2").widget;
      Object.assign(i2, {
        prompt: "Build a new unit-scale bar graph: Walk 5, Bus 2, Car 7.",
        categories: ["Walk", "Bus", "Car"], target: [5, 2, 7],
        successFeedback: "The new bars reach 5, 2, and 7 on the one-unit scale.",
        partialFeedback: "Raise each bar until its top meets that category's count on the unit scale.",
      });
      step(lesson, "k2").widget.prompt = "3 objects are shown by the bar. Which y-axis label should line up with its top on a unit-scale graph?";
      step(lesson, "ch1").widget.prompt = "The Cars bar ends at gridline 3 on a unit-scale graph. What count should a reader record?";
      break;
    }
    case "g2g-02-04": {
      const i2 = step(lesson, "i2").widget;
      Object.assign(i2, {
        prompt: "Read the Tacos bar on a different unit-scale graph. Move the marker to its height.",
        drawn: 5, categoryLabel: "Tacos", scaleMax: 8,
        commonResults: [
          { value: 4, feedback: "That is one gridline below the Tacos bar; follow its top to 5." },
          { value: 6, feedback: "That is one gridline above the Tacos bar; its top meets 5." },
        ],
        fallbackFeedback: "Follow the top of the Tacos bar straight to the numbered scale.",
        successFeedback: "Five — the Tacos bar reaches the gridline labeled 5.",
      });
      step(lesson, "k3").widget.prompt = "The Books bar ends at gridline 6 on a unit-scale graph. What count does the bar show?";
      break;
    }
    case "g2g-03-01": {
      const i2 = step(lesson, "i2").widget;
      Object.assign(i2, {
        prompt: "Continue the put-together: read Tuesday's bar as the second addend.",
        drawn: 6, categoryLabel: "Tuesday", scaleMax: 8,
        commonResults: [
          { value: 5, feedback: "That is one gridline low; Tuesday's bar reaches 6." },
          { value: 7, feedback: "That is one gridline high; Tuesday's bar stops at 6." },
        ],
        fallbackFeedback: "Read Tuesday's bar top against the numbered scale before adding.",
        successFeedback: "Six — with Monday's 5, the two bars make 11 votes together.",
      });
      step(lesson, "ch1").widget.prompt = "29 + 33 = ? Transfer: these are Thursday's and Friday's bar counts together.";
      break;
    }
    case "g2g-03-02": {
      const i2 = step(lesson, "i2").widget;
      Object.assign(i2, {
        prompt: "Now read Wednesday's shorter bar so you can compare it with Thursday's 9.",
        drawn: 4, categoryLabel: "Wednesday", scaleMax: 12,
        commonResults: [
          { value: 3, feedback: "That is one gridline low; Wednesday's bar reaches 4." },
          { value: 5, feedback: "That is one gridline high; Wednesday's bar stops at 4." },
        ],
        fallbackFeedback: "Read the shorter bar exactly before subtracting it from Thursday's 9.",
        successFeedback: "Four — the two bar heights are 9 and 4, so their gap is 5.",
      });
      step(lesson, "ch1").widget.prompt = "Transfer to a new graph: Wednesday has 6 votes and Thursday has 8. What is the gap between the bar heights?";
      break;
    }
    case "g2g-03-03":
      step(lesson, "i2").widget = dotPlot(
        "Lengths of 4, 5, 5, 6, 5, and 4 inches need a measurement display. Check the fitting line plot by reading the stack above 5.",
        [8, 10, 12], [2, 3, 1], 1,
        "Three x's above 5 show that 5 inches occurred three times.",
        "Measurements belong at number values; count only the x's above 5.",
      );
      break;
    default:
      throw new Error(`No progression repair for ${lesson.id}`);
  }
}

function repairTruthAndFeedback(lesson) {
  if (lesson.id === "g2g-01-02") {
    setConcept(lesson, "c1", "A record keeps every measurement, including repeats. It may list them as collected or organize them without dropping any.");
    setConcept(lesson, "c2", "Three ribbons of 6 cm are three data points. Keep all three so a later graph can show how often 6 cm occurred.");
  }
  if (lesson.id === "g2g-02-01") {
    setConcept(lesson, "c1", "A picture graph has one row per category. Each picture can stand for one or more things, and the key tells its value.");
    setConcept(lesson, "c2", "When the key says one picture equals 1, four finds on Monday need four pictures in Monday's row.");
  }
  if (lesson.id === "g2g-03-01") {
    setConcept(lesson, "c1", "To find how many two graph categories have together, read both bar heights and add the two counts.");
    setConcept(lesson, "c2", "In the graph shown, cats have 3 votes and birds have 4. Together they have 3 + 4 = 7 votes.");
  }
  if (lesson.id === "g2g-03-02") {
    setConcept(lesson, "c1", "To find how many more, subtract the smaller graph count from the larger graph count.");
    setConcept(lesson, "c2", "In the graph shown, dogs have 6 votes and cats have 3. The bar-height gap is 6 − 3 = 3 votes.");
  }
  if (lesson.id === "g2g-03-03") {
    setConcept(lesson, "c1", "Measurements belong at number values. A line plot stacks one x for each measurement above its value.");
    setConcept(lesson, "c2", "Categories such as trip choices belong in separate picture rows or bars so their counts can be compared.");
  }

  for (const entry of [
    ...lesson.steps,
    ...(lesson.remedials ?? []).flatMap((route) => [route.concept, route.check].filter(Boolean)),
  ]) {
    if (entry.explanationVariants) {
      entry.explanationVariants = entry.explanationVariants.map((text) =>
        text === "One picture per counted thing."
          ? "The key tells how many things each picture represents."
          : text
      );
    }
    const widget = entry.widget;
    if (!widget) continue;
    widget.prompt = widget.prompt
      .replace(/shells pictures/g, "shell pictures")
      .replace(/pinecones pictures/g, "pinecone pictures")
      .replace(/stickers pictures/g, "sticker pictures")
      .replace(/apples pictures/g, "apple pictures");
    if (widget.type === "unitRuler") {
      widget.unitFeedback = "Use the same-size unit blocks for every ribbon so the measurements can be compared fairly.";
    }
    if (widget.type === "graphRead") {
      if (widget.mode === "bar") widget.fallbackFeedback = "Follow the bar's top to the numbered scale and use the value it reaches.";
      if (widget.mode === "picture") widget.fallbackFeedback = "Use the key, count the pictures in the named row, and find their total value.";
    }
    if (widget.type === "numeric") {
      const prompt = widget.prompt;
      if (/ribbon|cm mark|centimeter/i.test(prompt)) widget.fallbackFeedback = "Subtract the start mark from the end mark; the gap between them is the ribbon's length.";
      else if (/line plot|x's|stack|frequency/i.test(prompt)) widget.fallbackFeedback = "Use the stated stack: the value below names the measurement, while the x marks give its frequency.";
      else if (/how many more|gap between/i.test(prompt)) widget.fallbackFeedback = "Subtract the smaller category count from the larger category count to find the gap.";
      else if (/bar reaches|bar ends|bar show|gridline/i.test(prompt)) widget.fallbackFeedback = "Follow the bar's top to the unit scale and record the number it reaches.";
      else if (/put together|total do the two bars/i.test(prompt)) widget.fallbackFeedback = "Add the two category counts because the question asks how many they have together.";
    }
  }
}

const files = (await readdir(COURSE)).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 12) throw new Error(`Expected 12 lessons, found ${files.length}`);

let changed = 0;
const hashes = [];
for (const file of files) {
  const full = path.join(COURSE, file);
  const before = await readFile(full, "utf8");
  const lesson = JSON.parse(before);
  for (const [stepId, figureId] of Object.entries(figures[lesson.id])) step(lesson, stepId).figure = figureId;
  repairProgression(lesson);
  repairTruthAndFeedback(lesson);
  const after = `${JSON.stringify(lesson, null, 2)}\n`;
  if (after !== before) {
    changed += 1;
    if (!CHECK) await writeFile(full, after, "utf8");
  }
  hashes.push(createHash("sha256").update(after).digest("hex"));
}

if (CHECK && changed) throw new Error(`${changed} data-line-plots-g2 lessons are not normalized`);
console.log(JSON.stringify({
  status: CHECK ? "CURRENT" : "UPDATED",
  lessons: files.length,
  changed,
  sourceClosures: { illustration: 24, progression: 12, total: 36 },
  seal: createHash("sha256").update(hashes.join("\n")).digest("hex"),
}, null, 2));
