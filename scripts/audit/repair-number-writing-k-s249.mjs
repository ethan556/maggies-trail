import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const COURSE = path.join(ROOT, "content", "courses", "number-writing-k", "lessons");
const CHECK = process.argv.includes("--check");

const figureByLesson = {
  "kcw-01-01": ["nwk-123-amount", "nwk-write-3-path"],
  "kcw-01-02": ["nwk-456-amount", "nwk-six-nine-orientation"],
  "kcw-01-03": ["nwk-789-to-ten", "nwk-readable-orientation"],
  "kcw-01-04": ["nwk-zero-and-ten", "nwk-empty-is-zero"],
  "kcw-01-05": ["nwk-match-both-ways", "nwk-exact-match"],
  "kcw-02-01": ["nwk-count-then-write", "nwk-no-early-guess"],
  "kcw-02-02": ["nwk-teen-ten-four", "nwk-leading-one-ten"],
  "kcw-02-03": ["nwk-eleven-twelve", "nwk-name-vs-numeral"],
  "kcw-02-04": ["nwk-teens-pattern", "nwk-ten-plus-extra"],
  "kcw-02-05": ["nwk-twenty-regroup", "nwk-zero-placeholder"],
  "kcw-03-01": ["nwk-teen-count-on", "nwk-ones-digit-count"],
  "kcw-03-02": ["nwk-numeral-orders-group", "nwk-stop-at-number"],
  "kcw-03-03": ["nwk-draw-and-count", "nwk-count-during-drawing"],
  "kcw-03-04": ["nwk-three-costumes", "nwk-translate-forms"],
};

function cardChoice(prompt, values, answer, success) {
  return {
    type: "tapDiagram",
    prompt,
    mode: "selectOne",
    canvas: { w: 3, h: 1 },
    hotspots: values.map((value, index) => ({
      id: `card-${String(value).replace(/\W/g, "-")}`,
      x: 20 + index * 30,
      y: 50,
      label: `numeral ${value}`,
      icon: String(value),
      count: 1,
      correct: value === answer,
      feedback: value === answer ? success : `${value} names a different amount. Read the target again, then match it exactly.`,
    })),
    missFeedback: "Compare the numeral with the amount or place-value clue before choosing.",
    successFeedback: success,
  };
}

function groupChoice(prompt, counts, answer, success) {
  return {
    type: "tapDiagram",
    prompt,
    mode: "selectOne",
    canvas: { w: 3, h: 1 },
    hotspots: counts.map((count, index) => ({
      id: `group-${count}`,
      x: 20 + index * 30,
      y: 50,
      label: `group of ${count}`,
      icon: "●",
      count,
      correct: count === answer,
      feedback: count === answer ? success : `This group has ${count}. Count each dot once and stop at the number on the card.`,
    })),
    missFeedback: "Count every dot once, then compare the total with the numeral.",
    successFeedback: success,
  };
}

function order(prompt, labels, success) {
  const items = labels.map((label, index) => ({ id: `stage-${index + 1}`, label }));
  return {
    type: "dragOrder",
    prompt,
    items: [...items].reverse(),
    correctOrder: items.map((item) => item.id),
    misorderFeedback: [{
      first: items.at(-1).id,
      second: items[0].id,
      feedback: "The final step cannot come first. Begin with the amount or starting point, then finish the numeral.",
    }],
    missFeedback: `Build the sequence in this order: ${labels.join(", then ")}.`,
    successFeedback: success,
  };
}

const i2ByLesson = {
  "kcw-01-01": order("Put the three writing moves in order for the numeral 3.", ["Start at the top", "Curve to the middle", "Curve to the bottom"], "Yes — the stable top-to-bottom path makes a readable 3."),
  "kcw-01-02": order("Put the writing moves in order for a correctly oriented 6.", ["Start at the top", "Curve down", "Close the bottom loop"], "Yes — closing the loop at the bottom distinguishes 6 from 9."),
  "kcw-01-03": order("Put the check routine for a readable numeral in order.", ["Write the numeral", "Check its direction", "Read the intended number"], "Yes — write, check the direction, then confirm the numeral can be read."),
  "kcw-01-04": order("Put the zero-recording routine in order.", ["See the empty plate", "Count no cookies", "Write 0"], "Yes — an empty group has count zero, written 0."),
  "kcw-01-05": groupChoice("The numeral card says 7. Tap the group it names exactly.", [6, 7, 8], 7, "Exactly seven dots match the numeral 7."),
  "kcw-02-01": cardChoice("The completed count ends at 9. Tap the numeral that records it.", [8, 9, 10], 9, "Nine is the final number said, so 9 records the count."),
  "kcw-02-02": order("Build the numeral 14 from its place-value parts.", ["Recognize one full ten", "Count four extra ones", "Write 14"], "Yes — one ten and four ones are written 14."),
  "kcw-02-03": cardChoice("One ten and two extra ones are shown. Tap the numeral that reveals that structure.", [11, 12, 21], 12, "12 shows one ten and two ones even though its name does not say teen."),
  "kcw-02-04": order("Build a teen numeral from the amount sixteen.", ["Write 1 for the ten", "Count six extra ones", "Write 6 in the ones place"], "Yes — the ten first and six extras make 16."),
  "kcw-02-05": order("Show how nineteen and one more become twenty.", ["Fill the second group of ten", "Regroup as two tens", "Write 20"], "Yes — two tens and no extra ones are written 20."),
  "kcw-03-01": cardChoice("A full ten and seven extra dots are shown. Tap the numeral you should write.", [16, 17, 18], 17, "One ten and seven ones are written 17."),
  "kcw-03-02": groupChoice("The card says 7. Tap the group where the builder stopped at exactly seven.", [6, 7, 8], 7, "Seven dots obey the numeral card's stopping rule."),
  "kcw-03-03": groupChoice("The instruction says draw 5 circles. Tap the drawing that stopped at five.", [4, 5, 6], 5, "Five circles show that each drawing move was counted and the pencil stopped on time."),
  "kcw-03-04": cardChoice("The word says ‘five’ and the picture shows five dots. Tap the matching numeral.", [4, 5, 6], 5, "The word, picture, and numeral 5 are three forms of the same amount."),
};

const promptRepairs = {
  "kcw-01-01": { ch1: "Mia counted three shells but wrote 2. Which numeral corrects her record?" },
  "kcw-01-02": { k2: "A six-dot card needs a written label. Which numeral belongs on it?", ch1: "Leo finishes counting six blocks. Which numeral should he record?" },
  "kcw-01-03": { k2: "A seven-bead string needs a numeral tag. Which tag is exact?" },
  "kcw-01-04": { k2: "Which place-value story matches the numeral 10?", ch1: "Eight counters are hidden under a cup. Which numeral records their count?" },
  "kcw-01-05": { ch1: "A card marked 7 belongs beside which counted amount?" },
  "kcw-02-01": { k1: "After counting six blocks, what should Kai write?", k2: "Eight dots fill the card. Which numeral is its exact label?" },
  "kcw-02-02": { k1: "In the numeral 14, what does the front 1 mean?" },
  "kcw-02-03": { k2: "Start at 10 and make 2 one-unit hops. Where do you land?" },
  "kcw-02-04": { k1: "Thirteen is one ten plus how many extra ones?", k3: "Which written pattern belongs to every numeral from 13 through 19?" },
  "kcw-02-05": { k3: "Nineteen gains one more. Which numeral records the regrouped amount?", ch1: "Why does the numeral 20 need a zero in the ones place?" },
  "kcw-03-01": { k1: "One full ten and three extra dots need a numeral label. Which one?", ch1: "A full ten-frame and two extra dots make which numeral?" },
};

const expectedFiles = 14;
const files = (await readdir(COURSE)).filter((name) => name.endsWith(".json")).sort();
if (files.length !== expectedFiles) throw new Error(`Expected ${expectedFiles} lesson files, found ${files.length}`);

let changed = 0;
const hashes = [];
for (const file of files) {
  const full = path.join(COURSE, file);
  const before = await readFile(full, "utf8");
  const lesson = JSON.parse(before);
  const figures = figureByLesson[lesson.id];
  if (!figures) throw new Error(`Missing figure contract for ${lesson.id}`);
  const concepts = lesson.steps.filter((step) => step.kind === "concept");
  if (concepts.length !== 2 || concepts[0].id !== "c1" || concepts[1].id !== "c2") throw new Error(`Unexpected concept structure in ${lesson.id}`);
  concepts[0].figure = figures[0];
  concepts[1].figure = figures[1];

  const i1 = lesson.steps.find((step) => step.id === "i1");
  const i2 = lesson.steps.find((step) => step.id === "i2");
  if (!i1?.widget || !i2?.widget) throw new Error(`Missing i1/i2 widget in ${lesson.id}`);
  i2.body = "Use a different representation.";
  i2.widget = i2ByLesson[lesson.id];
  if (!i2.widget) throw new Error(`Missing i2 contract for ${lesson.id}`);

  for (const [stepId, prompt] of Object.entries(promptRepairs[lesson.id] ?? {})) {
    const step = lesson.steps.find((candidate) => candidate.id === stepId);
    if (!step?.widget?.prompt) throw new Error(`Missing ${lesson.id}#${stepId} prompt`);
    step.widget.prompt = prompt;
  }

  if (lesson.id === "kcw-02-02") {
    const k1 = lesson.steps.find((step) => step.id === "k1");
    const labels = ["One full ten", "One loose one", "Four full tens", "No tens yet"];
    const feedback = [
      "Correct — the front 1 occupies the tens place, so it represents one full ten.",
      "The front 1 is not a loose one; its place gives it a value of ten.",
      "The 4 records four extra ones, not four tens.",
      "A teen numeral does contain a ten; the front 1 records it.",
    ];
    k1.widget.options.forEach((option, index) => { option.label = labels[index]; option.feedback = feedback[index]; });
  }
  if (lesson.id === "kcw-02-03") {
    const k1 = lesson.steps.find((step) => step.id === "k1");
    const labels = ["No; places changed", "Yes; digits match", "Only when counting", "12 is always larger"];
    const feedback = [
      "Correct — 12 has one ten and two ones, while 21 has two tens and one one.",
      "Matching digits do not guarantee the same number; their places determine their values.",
      "Place value does not change with the activity; 12 and 21 remain different.",
      "21 is greater than 12, but size is not the reason their values differ; the digit places are.",
    ];
    k1.widget.options.forEach((option, index) => { option.label = labels[index]; option.feedback = feedback[index]; });
  }
  if (lesson.id === "kcw-02-05") {
    const k1 = lesson.steps.find((step) => step.id === "k1");
    const labels = ["Two tens, zero ones", "Two ones, zero tens", "One ten, two ones", "Two tens, two ones"];
    const feedback = [
      "Correct — the 2 records two tens and the 0 records no extra ones.",
      "That would make only 2; in 20 the 2 occupies the tens place.",
      "One ten and two ones are written 12, not 20.",
      "Two tens and two ones are written 22; 20 has zero ones.",
    ];
    k1.widget.options.forEach((option, index) => { option.label = labels[index]; option.feedback = feedback[index]; });
  }  if (lesson.id === "kcw-02-04") {
    const k3 = lesson.steps.find((step) => step.id === "k3");
    const labels = ["They begin with 1", "They end with 1", "They use one digit", "They all end alike"];
    const feedback = [
      "Correct — every numeral from 13 through 19 begins with 1 for one full ten.",
      "Their ending digits change from 3 through 9; they do not all end with 1.",
      "Each numeral from 13 through 19 uses two digits.",
      "The ending digits are different because they count different extra ones.",
    ];
    k3.widget.options.forEach((option, index) => { option.label = labels[index]; option.feedback = feedback[index]; });
  }

  const after = `${JSON.stringify(lesson, null, 2)}\n`;
  if (after !== before) {
    changed += 1;
    if (!CHECK) await writeFile(full, after, "utf8");
  }
  hashes.push(createHash("sha256").update(after).digest("hex"));
}

if (CHECK && changed) throw new Error(`${changed} number-writing lessons are not normalized`);
console.log(JSON.stringify({ status: CHECK ? "CURRENT" : "UPDATED", lessons: files.length, changed, courseSeal: createHash("sha256").update(hashes.join("\n")).digest("hex") }, null, 2));
