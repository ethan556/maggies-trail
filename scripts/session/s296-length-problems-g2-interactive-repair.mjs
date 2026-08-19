import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const lessonsDirectory = join(process.cwd(), "content", "courses", "length-problems-g2", "lessons");

const lengthSuccesses = [
  ["g2p-01-01", "Correct — after the starts align, the blue ribbon reaches farther."],
  ["g2p-01-02", "Correct — after the starts align, the hiking pole reaches farther."],
  ["g2p-03-01", "Correct — after the starts align, trail A reaches farther."],
  ["g2p-03-04", "Correct — the computed gap bar is longer. That shows the result cannot be a reasonable gap."],
];

const interactiveTargets = [
  {
    lessonId: "g2p-01-01",
    body: "Repair the comparison.",
    before: {
      type: "lengthCompare", mode: "align", prompt: "Line the ribbons up from the same start. Which is longer?",
      items: [
        { id: "top", label: "blue ribbon", length: 7, startOffset: 2 },
        { id: "bottom", label: "red ribbon", length: 5 },
      ],
      answerId: "top",
      unalignedFeedback: "Looks can trick you — line the starting ends up first.",
      missFeedback: "Now the starts are lined up — check the far ends again: the one reaching farther is longer.",
      successFeedback: "Same start makes the compare fair — the bottom ribbon really does reach farther.",
    },
    after: {
      type: "lengthCompare", mode: "align", prompt: "The red ribbon begins farther right, so it only looks longer. Align the starts. Which ribbon is actually longer?",
      items: [
        { id: "top", label: "blue ribbon", length: 7 },
        { id: "bottom", label: "red ribbon", length: 5, startOffset: 4 },
      ],
      answerId: "top",
      unalignedFeedback: "Looks can trick you — line the starting ends up first.",
      missFeedback: "Now the starts are lined up — check the far ends again: the blue ribbon reaches farther.",
      successFeedback: "Correct — after the starts align, the blue ribbon reaches farther.",
    },
  },
  {
    lessonId: "g2p-01-02",
    body: "Use a new alignment.",
    before: {
      type: "lengthCompare", mode: "align", prompt: "Two of the four items, aligned: which of these two is longer?",
      items: [
        { id: "top", label: "hiking pole", length: 8, startOffset: 2 },
        { id: "bottom", label: "walking stick", length: 6 },
      ],
      answerId: "top",
      unalignedFeedback: "Looks can trick you — line the starting ends up first.",
      missFeedback: "Now the starts are lined up — check the far ends again: the one reaching farther is longer.",
      successFeedback: "Same start makes the compare fair — the bottom ribbon really does reach farther.",
    },
    after: {
      type: "lengthCompare", mode: "align", prompt: "The walking stick begins later, so its far end looks ahead. Align the starts. Which item is actually longer?",
      items: [
        { id: "top", label: "hiking pole", length: 8 },
        { id: "bottom", label: "walking stick", length: 6, startOffset: 5 },
      ],
      answerId: "top",
      unalignedFeedback: "Looks can trick you — line the starting ends up first.",
      missFeedback: "Now the starts are lined up — check the far ends again: the hiking pole reaches farther.",
      successFeedback: "Correct — after the starts align, the hiking pole reaches farther.",
    },
  },
  {
    lessonId: "g2p-01-03",
    body: "Measure the same length from a new starting mark.",
    before: {
      type: "unitRuler", prompt: "Measure the ribbon with one-unit blocks: align its start, place four with no gaps or overlaps.",
      objectStart: 2, objectEnd: 6, allowedUnitSizes: [1, 2], targetUnitSize: 1, startUnitSize: 2, requiredPlacements: 4,
      successFeedback: "Four one-unit blocks tile the ribbon exactly — the count of units IS the length, wherever the ribbon starts.",
      alignFeedback: "Line up zero with the object's starting end before measuring.",
      gapOverlapFeedback: "The blocks must touch end to end — no spaces and no covering the same part twice.",
      unitFeedback: "Every block must be the same size, or the count means nothing.",
    },
    after: {
      type: "unitRuler", prompt: "Measure a ribbon that starts at 4 with one-unit blocks. Align zero with 4; place four with no gaps or overlaps.",
      objectStart: 4, objectEnd: 8, allowedUnitSizes: [1, 2], targetUnitSize: 1, startUnitSize: 2, requiredPlacements: 4,
      successFeedback: "Four one-unit blocks tile the ribbon exactly, even when the ribbon begins at 4.",
      alignFeedback: "Line up zero with the 4 mark before measuring.",
      gapOverlapFeedback: "The blocks must touch end to end — no spaces and no covering the same part twice.",
      unitFeedback: "Every block must be the same size, or the count means nothing.",
    },
  },
  {
    lessonId: "g2p-02-01",
    body: "Partition the second piece in fives.",
    before: {
      type: "numberLineHop", prompt: "Join a 34 cm piece and a 20 cm piece: from 34, two ten-hops for the second piece.",
      min: 20, max: 70, start: 34, hop: 10, hops: 2, direction: "forward",
      commonLandings: [{ value: 36, feedback: "Two centimeters of the second piece placed — the whole 20 must join." }],
      missFeedback: "Each hop is 10. From 34, 2 hops land on 54.",
      successFeedback: "54 — the second piece laid end to end carries the far end to the joined total.",
    },
    after: {
      type: "numberLineHop", prompt: "Join a 34 cm piece and a 20 cm piece: from 34, make four five-hops for the second piece.",
      min: 20, max: 70, start: 34, hop: 5, hops: 4, direction: "forward",
      commonLandings: [{ value: 39, feedback: "One five of the second piece is placed — keep adding five until all 20 cm join." }],
      missFeedback: "Each hop is 5. From 34, 4 hops land on 54.",
      successFeedback: "54 — the second piece laid end to end carries the far end to the joined total.",
    },
  },
  {
    lessonId: "g2p-02-02",
    body: "Partition the final leg in fives.",
    before: {
      type: "numberLineHop", prompt: "Legs of a hike: the first two banked 55 m; the last leg is 20 m. Hop its tens.",
      min: 40, max: 90, start: 55, hop: 10, hops: 2, direction: "forward",
      commonLandings: [{ value: 57, feedback: "Two meters of the last leg — the full 20 belongs in the total." }],
      missFeedback: "Each hop is 10. From 55, 2 hops land on 75.",
      successFeedback: "75 meters — every leg collected, no meter walked twice.",
    },
    after: {
      type: "numberLineHop", prompt: "Legs of a hike: the first two banked 55 m; the last leg is 20 m. Mark it as four five-hops.",
      min: 40, max: 90, start: 55, hop: 5, hops: 4, direction: "forward",
      commonLandings: [{ value: 60, feedback: "One five of the last leg is placed — the full 20 belongs in the total." }],
      missFeedback: "Each hop is 5. From 55, 4 hops land on 75.",
      successFeedback: "75 meters — every leg collected, no meter walked twice.",
    },
  },
  {
    lessonId: "g2p-02-03",
    body: "Rebuild the whole with five-unit hops.",
    before: {
      type: "numberLineHop", prompt: "Rebuild the whole: the known 40 m stretch is walked; hop the missing part's tens toward 75.",
      min: 30, max: 90, start: 40, hop: 10, hops: 3, direction: "forward",
      commonLandings: [{ value: 50, feedback: "One ten of the missing stretch — keep walking until the whole is rebuilt." }],
      missFeedback: "Each hop is 10. From 40, 3 hops land on 70.",
      successFeedback: "70 — three tens of the missing part walked; five more meters would complete the 75 m whole.",
    },
    after: {
      type: "numberLineHop", prompt: "Rebuild the whole: the known 40 m stretch is walked; hop the missing part in six fives toward 75.",
      min: 30, max: 90, start: 40, hop: 5, hops: 6, direction: "forward",
      commonLandings: [{ value: 45, feedback: "One five of the missing stretch is walked — keep moving until the whole is rebuilt." }],
      missFeedback: "Each hop is 5. From 40, 6 hops land on 70.",
      successFeedback: "70 — six fives of the missing part walked; five more meters would complete the 75 m whole.",
    },
  },
  {
    lessonId: "g2p-03-01",
    body: "Align a new pair from the same story.",
    before: {
      type: "lengthCompare", mode: "align", prompt: "The story's two bars, aligned: which quantity is longer?",
      items: [
        { id: "top", label: "trail A", length: 8, startOffset: 2 },
        { id: "bottom", label: "trail B", length: 5 },
      ],
      answerId: "top",
      unalignedFeedback: "Looks can trick you — line the starting ends up first.",
      missFeedback: "Now the starts are lined up — check the far ends again: the one reaching farther is longer.",
      successFeedback: "Same start makes the compare fair — the bottom ribbon really does reach farther.",
    },
    after: {
      type: "lengthCompare", mode: "align", prompt: "Trail B begins farther right, so it may look ahead. Align the starts. Which trail is actually longer?",
      items: [
        { id: "top", label: "trail A", length: 8 },
        { id: "bottom", label: "trail B", length: 5, startOffset: 5 },
      ],
      answerId: "top",
      unalignedFeedback: "Looks can trick you — line the starting ends up first.",
      missFeedback: "Now the starts are lined up — check the far ends again: trail A reaches farther.",
      successFeedback: "Correct — after the starts align, trail A reaches farther.",
    },
  },
  {
    lessonId: "g2p-03-02",
    body: "Chain the second piece in fives.",
    before: {
      type: "numberLineHop", prompt: "A 34 cm piece as a jump from zero — then chain a 20 cm piece: two more ten-hops.",
      min: 0, max: 70, start: 34, hop: 10, hops: 2, direction: "forward",
      commonLandings: [{ value: 44, feedback: "One ten of the second piece — its whole 20 cm belongs in the chain." }],
      missFeedback: "Each hop is 10. From 34, 2 hops land on 54.",
      successFeedback: "54 — two pieces chained on the endless ruler, their join read at the landing.",
    },
    after: {
      type: "numberLineHop", prompt: "A 34 cm piece is a jump from zero. Chain a 20 cm piece as four more five-hops.",
      min: 0, max: 70, start: 34, hop: 5, hops: 4, direction: "forward",
      commonLandings: [{ value: 39, feedback: "One five of the second piece is in the chain — its whole 20 cm still belongs there." }],
      missFeedback: "Each hop is 5. From 34, 4 hops land on 54.",
      successFeedback: "54 — two pieces chained on the endless ruler, their join read at the landing.",
    },
  },
  {
    lessonId: "g2p-03-03",
    body: "Build the second story step in fives.",
    before: {
      type: "numberLineHop", prompt: "Step two of a story: after using ribbon, 35 cm remained; the purchase adds 30. Hop its tens.",
      min: 20, max: 80, start: 35, hop: 10, hops: 3, direction: "forward",
      commonLandings: [{ value: 45, feedback: "One ten of the purchase — the story bought three tens' worth." }],
      missFeedback: "Each hop is 10. From 35, 3 hops land on 65.",
      successFeedback: "65 cm — the second step joined the survivor of the first.",
    },
    after: {
      type: "numberLineHop", prompt: "Step two of a story: after using ribbon, 35 cm remained; the purchase adds 30. Mark it as six five-hops.",
      min: 20, max: 80, start: 35, hop: 5, hops: 6, direction: "forward",
      commonLandings: [{ value: 40, feedback: "One five of the purchase is placed — the story bought six fives' worth." }],
      missFeedback: "Each hop is 5. From 35, 6 hops land on 65.",
      successFeedback: "65 cm — the second step joined the survivor of the first.",
    },
  },
  {
    lessonId: "g2p-03-04",
    body: "Check the picture before trusting the result.",
    before: {
      type: "lengthCompare", mode: "align", prompt: "A suspicious result, drawn: the 'computed gap' towers over the item it should fit inside. Which bar is longer?",
      items: [
        { id: "top", label: "computed gap", length: 9, startOffset: 2 },
        { id: "bottom", label: "longer item", length: 6 },
      ],
      answerId: "top",
      unalignedFeedback: "Looks can trick you — line the starting ends up first.",
      missFeedback: "Now the starts are lined up — check the far ends again: the one reaching farther is longer.",
      successFeedback: "Same start makes the compare fair — the bottom ribbon really does reach farther.",
    },
    after: {
      type: "lengthCompare", mode: "align", prompt: "A bar placed farther right can look longer. Align the starts, then decide which bar is actually longer.",
      items: [
        { id: "top", label: "computed gap", length: 9 },
        { id: "bottom", label: "longer item", length: 6, startOffset: 5 },
      ],
      answerId: "top",
      unalignedFeedback: "Looks can trick you — line the starting ends up first.",
      missFeedback: "Now the starts are lined up — the computed gap bar reaches farther, so this cannot be a reasonable gap.",
      successFeedback: "Correct — the computed gap bar is longer. That shows the result cannot be a reasonable gap.",
    },
  },
];

function fail(message) {
  throw new Error(`S296 length-problems-g2 interactive repair: ${message}`);
}

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function load(id) {
  const path = join(lessonsDirectory, `${id}.json`);
  return { path, lesson: JSON.parse(readFileSync(path, "utf8")), changed: false };
}

const records = new Map();
function record(id) {
  if (!records.has(id)) records.set(id, load(id));
  return records.get(id);
}

function step(id, stepId) {
  const current = record(id);
  const entry = current.lesson.steps.find((candidate) => candidate.id === stepId);
  if (!entry) fail(`${id}/${stepId} is missing`);
  return [current, entry];
}

function replaceValue(holder, key, before, after, label) {
  if (holder[key] === after) return false;
  if (holder[key] !== before) fail(`${label}/${key} drifted`);
  holder[key] = after;
  return true;
}

for (const [lessonId, successFeedback] of lengthSuccesses) {
  const [current, entry] = step(lessonId, "i1");
  if (entry.widget?.type !== "lengthCompare" || entry.widget.answerId !== "top")
    fail(`${lessonId}/i1 must retain its top-answer length comparison`);
  current.changed = replaceValue(
    entry.widget,
    "successFeedback",
    "Same start makes the compare fair — the bottom ribbon really does reach farther.",
    successFeedback,
    `${lessonId}/i1`,
  ) || current.changed;
}

for (const target of interactiveTargets) {
  const [current, entry] = step(target.lessonId, "i2");
  if (entry.kind !== "interactive") fail(`${target.lessonId}/i2 must remain interactive`);
  if (same(entry.widget, target.after) && entry.body === target.body) continue;
  if (!same(entry.widget, target.before)) fail(`${target.lessonId}/i2 widget drifted`);
  if (entry.body !== "Try it again.") fail(`${target.lessonId}/i2 body drifted`);
  entry.widget = target.after;
  entry.body = target.body;
  current.changed = true;
}

const changed = [];
for (const [id, current] of [...records.entries()].sort(([left], [right]) => left.localeCompare(right))) {
  if (!current.changed) continue;
  writeFileSync(current.path, `${JSON.stringify(current.lesson, null, 2)}\n`);
  changed.push(id);
}

console.log(`S296 length-problems-g2 interactive repair: ${changed.length ? `updated ${changed.join(", ")}` : "already current"}`);
