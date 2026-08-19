import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const COURSE = path.join(ROOT, "content", "courses", "how-many-k", "lessons");
const CHECK = process.argv.includes("--check");

const figures = {
  "khm-01-01": ["khm-toy-one-to-one", "khm-touch-tracks-count"],
  "khm-01-02": ["khm-skip-repeat-errors", "khm-exactly-once"],
  "khm-01-03": ["khm-row-start-end", "khm-counted-vs-waiting"],
  "khm-01-04": ["khm-circle-start-marker", "khm-stop-before-start"],
  "khm-01-05": ["khm-mark-fixed-pictures", "khm-marked-vs-unmarked"],
  "khm-02-01": ["khm-last-word-total", "khm-five-shells-total"],
  "khm-02-02": ["khm-unchanged-group-count", "khm-recount-only-change"],
  "khm-02-03": ["khm-any-order-same-total", "khm-both-directions-five"],
  "khm-02-04": ["khm-spacing-conservation", "khm-amount-not-space"],
  "khm-02-05": ["khm-scattered-marking", "khm-clean-waits"],
  "khm-03-01": ["khm-one-more-object", "khm-next-number"],
  "khm-03-02": ["khm-known-plus-new", "khm-count-on-not-over"],
  "khm-03-03": ["khm-paired-groups-leftover", "khm-one-more-compare"],
  "khm-03-04": ["khm-count-out-from-pile", "khm-stop-and-remainder"],
  "khm-03-05": ["khm-subitize-patterns", "khm-quick-look-shapes"],
  "khm-03-06": ["khm-five-and-two-frame", "khm-frame-patterns"],
};

function choose(prompt, choices, correctId, success) {
  return {
    type: "tapDiagram", prompt, mode: "selectOne", canvas: { w: 3, h: 1 },
    hotspots: choices.map((choice, index) => ({
      id: choice.id, x: 20 + index * 30, y: 50, label: choice.label, icon: choice.icon, count: choice.count ?? 1,
      correct: choice.id === correctId,
      feedback: choice.id === correctId ? success : choice.feedback,
    })),
    missFeedback: "Look for the choice that follows the counting rule exactly.",
    successFeedback: success,
  };
}

function order(prompt, labels, success) {
  const items = labels.map((label, index) => ({ id: `stage-${index + 1}`, label }));
  return {
    type: "dragOrder", prompt, items: [...items].reverse(), correctOrder: items.map(({ id }) => id),
    misorderFeedback: [{ first: items.at(-1).id, second: items[0].id, feedback: "Begin with the starting set or marker before you count or stop." }],
    missFeedback: `Use this order: ${labels.join(", then ")}.`, successFeedback: success,
  };
}

const i2 = {
  "khm-01-01": choose("Which record proves that every one of four toys was counted exactly once?", [
    { id: "skip", label: "3 marks", icon: "✓✓✓", count: 3, feedback: "Three marks leave one toy without a count." },
    { id: "exact", label: "4 marks", icon: "✓✓✓✓", count: 4 },
    { id: "repeat", label: "5 marks", icon: "✓✓✓✓✓", count: 5, feedback: "Five marks mean one of four toys was counted twice." },
  ], "exact", "Four toys and four marks show one-to-one counting."),
  "khm-01-02": choose("Six buttons were counted. Which tracking strip shows no skip and no repeat?", [
    { id: "five", label: "one skipped", icon: "✓✓✓✓✓", count: 5, feedback: "Five checks leave one of the six buttons uncounted." },
    { id: "six", label: "each once", icon: "✓✓✓✓✓✓", count: 6 },
    { id: "seven", label: "one repeated", icon: "✓✓✓✓✓✓✓", count: 7, feedback: "Seven checks mean one of the six buttons was counted twice." },
  ], "six", "Six checks for six buttons is exact."),
  "khm-01-03": order("Put the row-counting actions in a safe order.", ["Start at one end", "Touch each object in order", "Stop at the other end"], "Yes — one end, every object, then stop."),
  "khm-01-04": order("Put the circle-counting actions in order.", ["Mark the starting bead", "Touch every bead once", "Stop before the marked bead repeats"], "Yes — the marker creates a start and prevents a second lap."),
  "khm-01-05": choose("Which eight-star record proves every fixed star was marked once?", [
    { id: "seven", label: "7 ticks", icon: "✓×7", count: 7, feedback: "Seven ticks leave one star waiting." },
    { id: "eight", label: "8 ticks", icon: "✓×8", count: 8 },
    { id: "nine", label: "9 ticks", icon: "✓×9", count: 9, feedback: "Nine ticks mean one star was marked twice." },
  ], "eight", "Eight ticks match the eight fixed stars."),
  "khm-02-01": order("Show why the last count word answers how many.", ["Count all five shells", "Say five last", "Use five for the whole group"], "Yes — the final count word names the whole set."),
  "khm-02-02": choose("The same six shells are still on the mat. Which answer uses the known count?", [
    { id: "remember", label: "still 6", icon: "6", count: 6 },
    { id: "guess", label: "maybe 5", icon: "5", count: 5, feedback: "Nothing was removed, so the known count does not shrink." },
    { id: "add", label: "now 7", icon: "7", count: 7, feedback: "Nothing was added, so the known count does not grow." },
  ], "remember", "An unchanged group keeps its known count of six."),
  "khm-02-03": choose("The same five toys are counted from opposite ends. Which result must both paths reach?", [
    { id: "four", label: "both reach 4", icon: "4", count: 4, feedback: "Five toys counted once cannot total four." },
    { id: "five", label: "both reach 5", icon: "5", count: 5 },
    { id: "six", label: "both reach 6", icon: "6", count: 6, feedback: "Five toys counted once cannot total six." },
  ], "five", "Direction changes the path, not the total of five."),
  "khm-02-04": choose("Which pair shows the same five buttons with only the spacing changed?", [
    { id: "same", label: "5 close; 5 spread", icon: "5 = 5", count: 5 },
    { id: "added", label: "5 close; 6 spread", icon: "5 ≠ 6", count: 6, feedback: "That pair added a button, so it does not isolate spacing." },
    { id: "removed", label: "5 close; 4 spread", icon: "5 ≠ 4", count: 4, feedback: "That pair removed a button, so it does not isolate spacing." },
  ], "same", "The same five buttons stay five when spread apart."),
  "khm-02-05": order("Organize a count of scattered stickers.", ["Find an unmarked sticker", "Say the next number and mark it", "Stop when every sticker is marked"], "Yes — each visible mark separates counted stickers from waiting stickers."),
  "khm-03-01": choose("Five toys gain one toy. Which group shows one more?", [
    { id: "same", label: "still 5", icon: "●×5", count: 5, feedback: "One toy was added, so the total cannot stay five." },
    { id: "six", label: "now 6", icon: "●×6", count: 6 },
    { id: "seven", label: "now 7", icon: "●×7", count: 7, feedback: "Seven would be two more than five." },
  ], "six", "Six is exactly one more than five."),
  "khm-03-02": order("Count on from a known group of ten when three new toys arrive.", ["Keep the known 10", "Say 11, 12, 13 for the new toys", "Name 13 as the total"], "Yes — count only the newcomers after the known ten."),
  "khm-03-03": choose("Ana has six grapes. Which paired record proves Ben has one more?", [
    { id: "less", label: "5 paired; none left", icon: "5 < 6", count: 5, feedback: "Five is one less than six, not one more." },
    { id: "more", label: "6 paired; 1 left", icon: "6 + 1", count: 7 },
    { id: "two", label: "6 paired; 2 left", icon: "6 + 2", count: 8, feedback: "Two leftovers show two more, not one more." },
  ], "more", "Six pairs and one leftover show that Ben has seven."),
  "khm-03-04": order("Count out exactly seven crayons from a larger pile.", ["Move one crayon at a time", "Say the next count word", "Stop when the count reaches 7"], "Yes — stop at seven and leave the rest in the pile."),
  "khm-03-05": choose("Which familiar dot pattern shows four at a quick look?", [
    { id: "three", label: "three pips", icon: "● ● ●", count: 3, feedback: "Three pips show three, not four." },
    { id: "four", label: "four corners", icon: "● ● / ● ●", count: 4 },
    { id: "five", label: "four + center", icon: "●●●●●", count: 5, feedback: "Four corners plus a center show five." },
  ], "four", "Four corner pips make the familiar dice-four pattern."),
  "khm-03-06": choose("Which ten-frame description shows seven without counting every space?", [
    { id: "six", label: "5 and 1", icon: "5 + 1", count: 6, feedback: "A full row and one extra make six." },
    { id: "seven", label: "5 and 2", icon: "5 + 2", count: 7 },
    { id: "eight", label: "5 and 3", icon: "5 + 3", count: 8, feedback: "A full row and three extras make eight." },
  ], "seven", "A full row of five and two extras make seven."),
};

const prompts = {
  "khm-01-05": { ch1: "Eight stars each have one tick. Which numeral records the finished count?" },
  "khm-03-01": { k2: "A row has 5 beads. Add one bead; use the hop to show the new total.", k3: "A full ten and three extras gain one more. Which total comes next?" },
  "khm-03-02": { k1: "A known group of 12 gets four new counters. Continue from 12 to find the total.", k3: "Four newcomers join a known group of 14. Continue the count to find the whole group.", ch1: "Fifteen shells are counted; one new shell arrives. Which total should be remembered?" },
  "khm-03-03": { ch1: "Pair 5 hearts with 5 of the 6 stars. What does the leftover star prove?" },
  "khm-03-05": { ch1: "A dice-style pattern will flash. Name its amount without counting one by one." },
  "khm-03-06": { ch1: "A ten-frame will flash. Use its rows to recognize the amount." },
};

const files = (await readdir(COURSE)).filter((file) => file.endsWith(".json")).sort();
if (files.length !== 16) throw new Error(`Expected 16 lesson files, found ${files.length}`);
let changed = 0;
const hashes = [];
for (const file of files) {
  const full = path.join(COURSE, file);
  const before = await readFile(full, "utf8");
  const lesson = JSON.parse(before);
  const concepts = lesson.steps.filter((step) => step.kind === "concept");
  if (concepts.length !== 2 || !figures[lesson.id]) throw new Error(`Unexpected concept contract in ${lesson.id}`);
  [concepts[0].figure, concepts[1].figure] = figures[lesson.id];
  const second = lesson.steps.find((step) => step.id === "i2");
  if (!second?.widget || !i2[lesson.id]) throw new Error(`Missing i2 contract in ${lesson.id}`);
  second.body = "Use a different representation to test the same idea.";
  second.widget = i2[lesson.id];
  for (const [stepId, prompt] of Object.entries(prompts[lesson.id] ?? {})) {
    const step = lesson.steps.find((candidate) => candidate.id === stepId);
    if (!step?.widget?.prompt) throw new Error(`Missing ${lesson.id}#${stepId}`);
    step.widget.prompt = prompt;
  }
  if (lesson.id === "khm-01-02") {
    const step = lesson.steps.find((candidate) => candidate.id === "k2");
    const labels = ["One block was skipped", "One block was repeated", "The count ran backward", "Four is close enough"];
    const feedback = [
      "Correct — saying four count words for five blocks leaves one block without a number.",
      "Repeating a block would make the spoken count too large, not too small.",
      "Counting backward can still pair one word with each block; the missing word shows a skip.",
      "A count must be exact; one of the five blocks did not receive a count word.",
    ];
    step.widget.options.forEach((option, index) => { option.label = labels[index]; option.feedback = feedback[index]; });
  }
  if (lesson.id === "khm-02-04") {
    const step = lesson.steps.find((candidate) => candidate.id === "k1");
    const labels = ["No; still five", "Yes; more space", "No; now fewer", "We need their weight"];
    const feedback = [
      "Correct — spreading the same five buttons changes space, not amount.",
      "More space does not add a button; the count remains five.",
      "The five original buttons are all still present, so the amount cannot be smaller.",
      "Weight does not answer how many; counting the unchanged set still gives five.",
    ];
    step.widget.options.forEach((option, index) => { option.label = labels[index]; option.feedback = feedback[index]; });
  }
  const after = `${JSON.stringify(lesson, null, 2)}\n`;
  if (after !== before) { changed += 1; if (!CHECK) await writeFile(full, after, "utf8"); }
  hashes.push(createHash("sha256").update(after).digest("hex"));
}
if (CHECK && changed) throw new Error(`${changed} lessons are not normalized`);
console.log(JSON.stringify({ status: CHECK ? "CURRENT" : "UPDATED", lessons: files.length, changed, courseSeal: createHash("sha256").update(hashes.join("\n")).digest("hex") }, null, 2));
