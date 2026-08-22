import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const COURSE = path.join(ROOT, "content", "courses", "measure-compare-k", "lessons");
const CHECK = process.argv.includes("--check");

const figures = {
  "kmd-01-01": { c1: "ks-size-trick", c2: "ks-seesaw" },
  "kmd-01-02": { c1: "ks-compare-length", c2: "length-compare" },
  "kmd-01-03": { c1: "ks-seesaw", c2: "ks-size-trick" },
  "kmd-01-04": { c1: "kmd-capacity-same-scoop", c2: "kmd-capacity-same-scoop" },
  "kmd-02-01": { c1: "ks-compare-length", c2: "length-compare" },
  "kmd-02-02": { c1: "ks-seesaw", c2: "add-balance-scale" },
  "kmd-02-03": { c1: "ks-same-end-fair", c2: "ks-compare-length" },
  "kmd-02-04": { c1: "ks-compare-length", c2: "length-compare" },
  "kmd-03-01": { c1: "ks-sort-count", c2: "geo3-sort-yesno" },
  "kmd-03-02": { c1: "geo3-sort-yesno", c2: "ks-compare-length" },
  "kmd-03-03": { c1: "ks-sort-count", c2: "ks-count-groups" },
  "kmd-03-04": { c1: "ks-count-groups", c2: "ks-sort-count" },
};

const choiceLabels = {
  "kmd-01-01": { k3: ["Seesaw: heavier; ruler: longer", "Seesaw: longer; ruler: heavier", "Both tools compare only length", "Both tools compare only weight"] },
  "kmd-01-04": { ch1: ["Seesaw: heavier; ruler: longer", "Seesaw: longer; ruler: heavier", "Both tools compare only length", "Both tools compare only weight"] },
  "kmd-03-01": { k2: ["One clear rule tests every object", "Equal-sized piles decide the groups", "A neat pattern decides every group", "Fast sorting decides every group"] },
  "kmd-03-02": { k1: ["One clear rule tests every object", "Equal-sized piles decide the groups", "A neat pattern decides every group", "Fast sorting decides every group"] },
};

function step(lesson, id) {
  const found = lesson.steps.find((entry) => entry.id === id);
  if (!found) throw new Error(`Missing ${lesson.id}/${id}`);
  return found;
}


function repairI2(lesson) {
  const target = step(lesson, "i2").widget;
  switch (lesson.id) {
    case "kmd-01-01":
      target.objectEnd = 5; target.requiredPlacements = 5;
      target.prompt = "Repair the measurement: line zero up with the badge's start, then cover its full length with 5 equal blocks.";
      target.successFeedback = "The repaired measure uses one start and 5 equal, gap-free blocks, so the badge is 5 blocks long.";
      break;
    case "kmd-01-02":
      target.objectEnd = 6; target.requiredPlacements = 6;
      target.prompt = "Turn the length idea upright: measure the tower from its floor to its top with 6 equal blocks.";
      target.successFeedback = "The upright tower is 6 blocks tall; tall and long both describe end-to-end length.";
      break;
    case "kmd-01-03":
      target.c = 4; target.xStart = 7;
      target.prompt = "The block pan starts too heavy. Remove blocks until it balances the toy bear at 4 blocks.";
      target.successFeedback = "Removing blocks until 4 remain levels the pans, so the bear weighs the same as 4 blocks.";
      target.lowFeedback = "Too many blocks came off; the bear's pan is now heavier. Add a block.";
      target.highFeedback = "The block pan is still heavier. Remove another block.";
      break;
    case "kmd-01-04":
      target.target = 6; target.preFilled = 4;
      target.prompt = "Record a capacity test: one jug took 4 red scoops. Add 2 blue scoop marks to show 6 equal scoops in all.";
      target.successFeedback = "Four red scoop marks and two blue scoop marks record 6 equal scoops in all.";
      target.missFeedback = "Count every equal scoop mark; the red marks and blue marks must total 6.";
      break;
    case "kmd-02-01":
      target.objectEnd = 7; target.requiredPlacements = 7;
      target.prompt = "Check the second rope independently: align zero, cover it with 7 equal blocks, and use the count to compare it with the 6-block rope.";
      target.successFeedback = "This rope is 7 blocks long, one block longer than the earlier 6-block rope.";
      break;
    case "kmd-02-02":
      target.c = 5; target.xStart = 8;
      target.prompt = "The block pan begins too low. Remove blocks until 5 blocks balance the parcel.";
      target.successFeedback = "Five blocks make the beam level, so the parcel and 5 blocks have equal weight.";
      target.lowFeedback = "Too many blocks came off; add a block to bring the beam back toward level.";
      target.highFeedback = "The blocks are still heavier; remove another block.";
      break;
    case "kmd-02-03":
      target.objectEnd = 5; target.requiredPlacements = 5;
      target.prompt = "Undo the head start: align zero with the straw's beginning, then cover its true 5-block length without gaps.";
      target.successFeedback = "After the false head start is removed, 5 equal blocks cover the straw exactly.";
      break;
    case "kmd-02-04":
      target.objectEnd = 6; target.requiredPlacements = 6;
      target.prompt = "Use the floor as the shared start and measure the upright plant to its top with 6 equal blocks.";
      target.successFeedback = "From the same floor, the plant reaches 6 blocks tall.";
      break;
    case "kmd-03-01":
      target.prompt = "The rule is 'circles.' Tap the group that belongs in the circle group.";
      target.hotspots[0].label = "6 triangles"; target.hotspots[0].correct = false;
      target.hotspots[1].label = "9 squares"; target.hotspots[1].correct = false;
      target.hotspots[2].label = "2 circles"; target.hotspots[2].correct = true;
      target.hotspots[0].feedback = "Triangles do not match the circle rule.";
      target.hotspots[1].feedback = "Squares do not match the circle rule.";
      target.hotspots[2].feedback = "These are circles, so this group matches the rule.";
      target.missFeedback = "Test each group with the one rule: are these shapes circles?";
      target.successFeedback = "Yes — the circle rule sends the 2 circles into this group.";
      break;
    case "kmd-03-02":
      target.prompt = "The size rule is 'small shapes.' Tap the group that matches the rule.";
      target.hotspots[0].label = "5 large triangles"; target.hotspots[0].correct = false;
      target.hotspots[1].label = "8 large squares"; target.hotspots[1].correct = false;
      target.hotspots[2].label = "3 small circles"; target.hotspots[2].correct = true;
      target.hotspots[0].feedback = "These triangles are large, so they do not match the small-shape rule.";
      target.hotspots[1].feedback = "These squares are large, so they do not match the small-shape rule.";
      target.hotspots[2].feedback = "These circles are small, so this group matches the rule.";
      target.missFeedback = "Use the stated size rule, not the number of shapes: find the small shapes.";
      target.successFeedback = "Yes — all 3 shapes in this group match the small-shape rule.";
      break;
    case "kmd-03-03":
      target.target = 8; target.preFilled = 5;
      target.prompt = "Count the sorted parts into one total: 5 red buttons are shown. Add 3 blue buttons to record 8 buttons altogether.";
      target.successFeedback = "Five red and three blue make 8; the two group counts rebuild the whole.";
      target.missFeedback = "Count both sorted color groups; the red and blue buttons must total 8.";
      break;
    case "kmd-03-04":
      target.prompt = "Tap the group with the fewest shapes.";
      target.hotspots[0].correct = false; target.hotspots[1].correct = false; target.hotspots[2].correct = true;
      target.hotspots[0].feedback = "Six is more than 2, so this is not the fewest group.";
      target.hotspots[1].feedback = "Nine is more than 2, so this is not the fewest group.";
      target.hotspots[2].feedback = "Two is the smallest count.";
      target.missFeedback = "Compare the counts 6, 9, and 2; fewest means the smallest count.";
      target.successFeedback = "Right — 2 is the smallest count, so the circle group has the fewest shapes.";
      break;
    default: throw new Error(`No i2 repair for ${lesson.id}`);
  }
}

function repairProgression(lesson) {
  repairI2(lesson);
  if (lesson.id === "kmd-01-02") step(lesson, "ch1").widget.prompt = "A new set has ribbons of 6, 9, and 5 cubes. Tap the ribbon that reaches farthest from the shared start.";
  if (lesson.id === "kmd-02-01") step(lesson, "ch1").widget.prompt = "Transfer the method: compare ribbons of 7, 9, and 5 cubes from one start and choose the longest.";
  if (lesson.id === "kmd-02-03") step(lesson, "k3").widget.prompt = "A ribbon begins ahead of the shared start. What action makes the comparison fair before you choose?";
  if (lesson.id === "kmd-03-02") {
    const k2 = step(lesson, "k2").widget;
    k2.prompt = "The rule is 'big shapes.' Tap the group that matches this size rule.";
    k2.hotspots[0].label = "4 big triangles"; k2.hotspots[0].correct = true;
    k2.hotspots[1].label = "7 small squares"; k2.hotspots[1].correct = false;
    k2.hotspots[2].label = "2 small circles"; k2.hotspots[2].correct = false;
    k2.hotspots[0].feedback = "These triangles are big, so this group matches the rule.";
    k2.hotspots[1].feedback = "These squares are small, so they do not match the big-shape rule.";
    k2.hotspots[2].feedback = "These circles are small, so they do not match the big-shape rule.";
    k2.missFeedback = "Read the rule before counting; this sort asks which shapes are big.";
    k2.successFeedback = "Yes — these triangles match the big-shape rule.";
  }
  if (lesson.id === "kmd-03-03") {
    step(lesson, "i1").widget.prompt = "Build the whole after a color sort: 3 red buttons are shown. Add 4 blue buttons to make 7 altogether.";
    step(lesson, "k1").widget.prompt = "A second color sort has 3 red buttons. Add 3 blue buttons so both groups total 6.";
    step(lesson, "ch1").widget.prompt = "Transfer the count check: 2 red buttons are shown. Add 5 blue buttons to make a total of 7.";
  }
  if (lesson.id === "kmd-03-04") step(lesson, "k1").widget.prompt = "In a fresh sort, compare groups of 5 triangles, 9 squares, and 3 circles. Tap the group with the most.";
}

function repairTruthAndLanguage(lesson) {
  const walk = (value) => {
    if (Array.isArray(value)) return value.forEach(walk);
    if (!value || typeof value !== "object") return;
    for (const [key, current] of Object.entries(value)) {
      if (typeof current === "string") {
        value[key] = current
          .replace(/that number IS its length/g, "that count names its length in blocks")
          .replace(/Every block must be the same size, or the count means nothing\./g, "Use same-size blocks so every count names the same unit.")
          .replace(/You can always tell — count each group/g, "Here you can tell — count each group")
          .replace(/Without counts the groups are just piles; the numbers make them comparable\./g, "The sort already makes meaningful groups; counts add sizes that you can compare.")
          .replace(/Counting touches nothing — the groups stand as sorted, now with sizes\./g, "Counting keeps the sort in place and adds a number to each group.");
      } else walk(current);
    }
  };
  walk(lesson);

  if (lesson.id === "kmd-01-01") {
    step(lesson, "k1").widget.options[3].feedback = "A pencil can be measured for length and weight; different attributes need different tools.";
  }
  if (lesson.id === "kmd-01-04") {
    step(lesson, "k1").widget.options[0].label = "Use one same scoop to test both";
    step(lesson, "i1").widget.prompt = "Record equal scoops: 2 red scoop marks are shown. Add 3 blue scoop marks to show 5 scoops in all.";
    step(lesson, "i1").widget.successFeedback = "Two red and three blue scoop marks record 5 equal scoops in all.";
    const k2 = step(lesson, "k2").widget;
    k2.prompt = "The bowl needs 3 red scoops and the cup needs 4 blue scoops. Add the 4 blue scoop marks to record 7 scoops in all.";
    k2.successFeedback = "Three red and four blue scoop marks record 7 equal scoops in all.";
    const k3 = step(lesson, "k3").widget;
    k3.prompt = "A small cup holds 4 scoops and a larger jug holds 2 more. Count on 2 to find the jug's 6-scoop capacity.";
    k3.successFeedback = "Four scoops and two more make 6 scoops for the larger jug.";
  }
  if (lesson.id === "kmd-03-01") {
    const k3 = step(lesson, "k3").widget;
    k3.prompt = "One sorted group has 3 shapes and another has 4. Count on 4 to find the 7 shapes in both groups.";
    k3.successFeedback = "Three shapes and four shapes make 7 across the two sorted groups.";
  }
  if (lesson.id === "kmd-03-02") {
    const k3 = step(lesson, "k3").widget;
    k3.prompt = "The big group has 6 shapes and the small group has 3. Count on 3 to find 9 shapes altogether.";
    k3.successFeedback = "Six shapes and three shapes make 9 across the size groups.";
  }

  const authoredSteps = [
    ...lesson.steps,
    ...(lesson.remedials ?? []).flatMap((route) => [route.concept, route.check].filter(Boolean)),
  ];
  for (const entry of authoredSteps) {
    const widget = entry.widget;
    if (widget?.type === "tapDiagram" && /circle is round all the way/i.test(widget.successFeedback ?? "")) {
      const answer = widget.hotspots.find((spot) => spot.correct);
      widget.successFeedback = `Right — ${answer?.label ?? "that group"} matches the question.`;
    }
  }
  if (lesson.id === "kmd-01-01") {
    const remedial = lesson.remedials?.[0]?.check?.widget;
    if (remedial?.type === "mcq") remedial.options[3].feedback = "A pencil can be measured for length and weight; different attributes need different tools.";
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
  repairTruthAndLanguage(lesson);
  for (const [stepId, labels] of Object.entries(choiceLabels[lesson.id] ?? {})) {
    const widget = step(lesson, stepId).widget;
    widget.options.forEach((option, index) => { option.label = labels[index]; });
  }
  const after = `${JSON.stringify(lesson, null, 2)}\n`;
  if (after !== before) {
    changed += 1;
    if (!CHECK) await writeFile(full, after, "utf8");
  }
  hashes.push(createHash("sha256").update(after).digest("hex"));
}

if (CHECK && changed) throw new Error(`${changed} measure-compare-k lessons are not normalized`);
console.log(JSON.stringify({ status: CHECK ? "CURRENT" : "UPDATED", lessons: files.length, changed, seal: createHash("sha256").update(hashes.join("\n")).digest("hex") }, null, 2));
