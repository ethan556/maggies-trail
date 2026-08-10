type Band = "support" | "core" | "stretch";
type Variant = { tag: string; widget: any; answer: any };
type VariantGen = {
  tag: string;
  label: string;
  forms?: readonly never[];
  gen: (rand: () => number, band?: Band, form?: string) => Variant;
};
type Rand = () => number;
type FormHandler = (rand: Rand, band: Band) => Variant;

const pick = (rand: Rand, lo: number, hi: number): number => lo + Math.floor(rand() * (hi - lo + 1));
const choose = <T>(rand: Rand, xs: readonly T[]): T => xs[pick(rand, 0, xs.length - 1)];
const bandHi = (band: Band, support: number, core: number, stretch: number) => band === "support" ? support : band === "stretch" ? stretch : core;

function shuffled<T>(rand: Rand, xs: readonly T[]): T[] {
  const out = [...xs];
  for (let i = out.length - 1; i > 0; i--) {
    const j = pick(rand, 0, i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function distinctInts(rand: Rand, lo: number, hi: number, n: number): number[] {
  const pool = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
  return shuffled(rand, pool).slice(0, n);
}

const mcq = (
  rand: Rand,
  tag: string,
  prompt: string,
  correct: [string, string],
  wrong: Array<[string, string]>,
): Variant => {
  const seen = new Set<string>([correct[0]]);
  const unique = wrong.filter(([label]) => !seen.has(label) && seen.add(label));
  for (const fallback of [
    ["A different choice", "That choice does not match the counting, shape, position, or comparison shown in the question."],
    ["There is not enough information", "The picture words and quantities provide enough information to decide the answer."],
  ] as Array<[string, string]>) {
    if (unique.length >= 3) break;
    if (!seen.has(fallback[0])) { seen.add(fallback[0]); unique.push(fallback); }
  }
  const options = shuffled(rand, [
    { label: correct[0], feedback: correct[1], correct: true },
    ...unique.slice(0, 3).map(([label, feedback]) => ({ label, feedback, correct: false })),
  ]).map((o, i) => ({ id: `o${i}`, ...o }));
  return { tag, answer: options.find((o) => o.correct)!.id, widget: { type: "mcq", prompt, options } };
};

const subitize = (
  tag: string,
  prompt: string,
  count: number,
  arrangement: "dice" | "tenFrame" | "line" | "scatter",
  flashMs: number,
): Variant => {
  const candidates = [count - 1, count, count + 1, count === 10 ? 5 : count + 2].filter((n) => n >= 0 && n <= 10);
  const options = [...new Set(candidates)];
  while (options.length < 3) {
    const candidate = options.length === 0 ? count : Math.max(0, Math.min(10, count + options.length - 1));
    if (!options.includes(candidate)) options.push(candidate); else options.push(Math.max(0, count - options.length));
  }
  const wrong = options.filter((n) => n !== count);
  return {
    tag,
    answer: count,
    widget: {
      type: "subitizeFlash",
      prompt,
      count,
      arrangement,
      flashMs,
      options: shuffled(() => 0.37, options),
      commonPicks: wrong.slice(0, 3).map((value) => ({
        value,
        feedback: value < count
          ? `${value} misses ${count - value} of the visible dots. Group the dots, then count the full group as ${count}.`
          : `${value} counts ${value - count} extra. Touch each visible dot once; the complete group contains ${count}.`,
      })),
      missFeedback: `Look for a familiar group, then count any dots that remain. The complete group contains ${count}.`,
      successFeedback: `Correct — the flashed arrangement contains exactly ${count} dots, even though their positions may change.`,
    },
  };
};

const numberLine = (
  tag: string,
  prompt: string,
  min: number,
  max: number,
  start: number,
  hop: number,
  hops: number,
  direction: "forward" | "back",
): Variant => {
  const sign = direction === "back" ? -1 : 1;
  const land = start + sign * hop * hops;
  const traps = [
    land - sign * hop,
    land + sign * hop,
    start,
  ].filter((x, i, a) => x >= min && x <= max && x !== land && a.indexOf(x) === i);
  return {
    tag,
    answer: land,
    widget: {
      type: "numberLineHop",
      prompt,
      min,
      max,
      start,
      hop,
      hops,
      direction,
      commonLandings: traps.map((value, i) => ({
        value,
        feedback: i === 0
          ? `${value} stops one complete hop too soon. Continue the final ${hop}-unit hop to reach ${land}.`
          : i === 1
            ? `${value} goes one complete hop too far. Count exactly ${hops} ${hops === 1 ? "hop" : "hops"} from ${start} to reach ${land}.`
            : `${value} is the starting point. The task asks you to move ${direction === "back" ? "backward" : "forward"} before choosing ${land}.`,
      })),
      missFeedback: `Begin at ${start}, move ${direction === "back" ? "left" : "right"} by ${hop} for each hop, and stop after ${hops}.`,
      successFeedback: `Correct — ${hops} ${hop}-unit ${hops === 1 ? "hop" : "hops"} from ${start} land on ${land}.`,
    },
  };
};

const dragOrder = (tag: string, prompt: string, rand: Rand, values: number[]): Variant => {
  const ordered = [...values].sort((a, b) => a - b);
  const items = ordered.map((value, i) => ({ id: `n${i}`, label: String(value) }));
  let shown = shuffled(rand, items);
  if (shown.every((x, i) => x.id === items[i].id)) shown = [...shown].reverse();
  return {
    tag,
    answer: items.map((x) => x.id),
    widget: {
      type: "dragOrder",
      prompt,
      items: shown,
      correctOrder: items.map((x) => x.id),
      misorderFeedback: [{
        first: items[items.length - 1].id,
        second: items[0].id,
        feedback: `${items[items.length - 1].label} before ${items[0].label} starts with the greatest value. Counting order begins with the smallest value, ${items[0].label}.`,
      }],
      missFeedback: `Find the smallest value first, then choose the next number each time until the greatest value is last.`,
      successFeedback: `Correct — ${ordered.join(", ")} is counting order from the smallest value to the greatest value.`,
    },
  };
};

const tenFrame = (tag: string, prompt: string, target: number, preFilled: number, color: "sky" | "tangerine" | "leaf"): Variant => {
  const candidates = [preFilled, target - 1, target + 1].filter((n, i, a) => n >= 0 && n <= 10 && n !== target && a.indexOf(n) === i);
  return {
    tag,
    answer: target,
    widget: {
      type: "tenFrame",
      prompt,
      target,
      preFilled,
      addColor: color,
      commonCounts: candidates.map((count) => ({
        count,
        feedback: count < target
          ? `${count} leaves ${target - count} ${target - count === 1 ? "dot" : "dots"} still missing. Continue until the frame shows exactly ${target}.`
          : `${count} adds ${count - target} too many ${count - target === 1 ? "dot" : "dots"}. Remove the extras so the frame shows exactly ${target}.`,
      })),
      missFeedback: `Count the locked dots and the dots you add together. Stop when the total reaches ${target}.`,
      successFeedback: `Correct — the completed frame shows exactly ${target} ${target === 1 ? "dot" : "dots"}, matching the number named in the question.`,
    },
  };
};

const tap = (
  tag: string,
  prompt: string,
  mode: "selectOne" | "selectAll",
  groups: Array<{ label: string; icon: string; count: number; correct: boolean; feedback?: string }>,
): Variant => {
  const hotspots = groups.map((g, i) => ({ id: `g${i}`, x: Math.round(((i + 0.5) / groups.length) * 100), y: 50, ...g }));
  return {
    tag,
    answer: hotspots.filter((h) => h.correct).map((h) => h.id),
    widget: {
      type: "tapDiagram",
      prompt,
      mode,
      canvas: { w: 3, h: 1 },
      hotspots,
      missFeedback: `Use the position, amount, or shape named in the prompt and select every picture that matches it.`,
      successFeedback: `Correct — the selected picture or pictures match every clue stated in the prompt.`,
    },
  };
};

const match = (tag: string, prompt: string, rand: Rand, rows: Array<[string, string]>): Variant => {
  const left = rows.map(([label], i) => ({ id: `l${i}`, label }));
  const rightBase = rows.map(([, label], i) => ({ id: `r${i}`, label }));
  let right = shuffled(rand, rightBase);
  if (right.every((x, i) => x.id === rightBase[i].id)) right = [...right].reverse();
  const pairs = Object.fromEntries(rows.map((_, i) => [`l${i}`, `r${i}`]));
  const pairErrors = rows.length > 1 ? [{
    left: "l0",
    right: "r1",
    feedback: `${rows[0][0]} does not build ${rows[1][1]}. Think about how the pieces touch and rebuild the matching whole.`,
  }] : [];
  return {
    tag,
    answer: pairs,
    widget: {
      type: "matchPairs",
      prompt,
      left,
      right,
      pairs,
      pairErrors,
      missFeedback: `Picture each set of pieces joined without gaps or overlaps, then link it to the whole shape it creates.`,
      successFeedback: `Correct — every group of pieces is linked to the complete shape those pieces build.`,
    },
  };
};

const lengthCompare = (
  tag: string,
  prompt: string,
  mode: "pick" | "align",
  orientation: "h" | "v",
  items: Array<{ id: string; label: string; length: number; startOffset?: number }>,
): Variant => {
  const best = Math.max(...items.map((i) => i.length));
  const answer = items.find((i) => i.length === best)!;
  return {
    tag,
    answer: answer.id,
    widget: {
      type: "lengthCompare",
      prompt,
      mode,
      orientation,
      unitLabel: orientation === "h" ? "cubes" : undefined,
      items: items.map((item) => ({
        ...item,
        startOffset: item.startOffset ?? 0,
        ...(item.id === answer.id ? {} : { feedback: `${item.label} measures ${item.length}, which is shorter than ${answer.label} at ${best}. Compare from the same starting line.` }),
      })),
      answerId: answer.id,
      ...(mode === "align" ? { unalignedFeedback: `The starting ends are still different. Move every ribbon to the same start line before comparing their lengths.` } : {}),
      missFeedback: `Compare from one shared starting line and choose the item that reaches the farthest endpoint.`,
      successFeedback: `Correct — ${answer.label} reaches ${best}, farther than every other item when the starts are aligned.`,
    },
  };
};

const COUNT_FORMS = [
  "countAddMcq", "countAddLine", "countCompareEqualMcq", "countTensMcq", "countTensLine",
  "countObjectsMcq", "countObjectsFlash", "countDecomposeMcq", "countMakeTenMcq", "countMoreFewerMcq",
  "countOrderDrag", "countBetweenMcq", "countReadMcq", "countReadFlash", "countZeroTap",
  "countSubtractMcq", "countSubtractLine", "countTeenFrame",
] as const;

const countHandlers: Record<string, FormHandler> = {
  countAddMcq: (rand, band) => {
    const three = band === "stretch" && rand() < 0.55;
    if (three) {
      const a = pick(rand, 1, 3), b = pick(rand, 1, 3), c = pick(rand, 1, Math.max(1, 10 - a - b));
      const ans = a + b + c;
      return mcq(rand, "g0-counting", `A jar has ${a} red counters, ${b} blue counters, and ${c} green counters. How many counters are in the jar altogether?`,
        [String(ans), `Correct — combining all three groups gives ${a} + ${b} + ${c} = ${ans} counters.`],
        [[String(a + b), `That combines only the red and blue groups. The ${c} green counters must be included too.`], [String(b + c), `That combines only two color groups. Include the ${a} red counters as well.`], [String(ans + 1), `That total counts one extra counter. Adding each group once gives ${ans}.`]]);
    }
    const a = pick(rand, 1, bandHi(band, 6, 8, 9));
    const b = rand() < 0.25 ? 0 : pick(rand, 1, 10 - a);
    const ans = a + b;
    const birds = (n: number) => `${n} ${n === 1 ? "bird" : "birds"}`;
    return mcq(rand, "g0-counting", `There are ${birds(a)} on a fence and ${birds(b)} more land. How many birds are there now?`,
      [String(ans), `Correct — putting the groups together gives ${a} + ${b} = ${birds(ans)}.`],
      [[String(a), `${a} counts only the birds that were there first. Include the ${birds(b)} that landed.`], [String(b), `${b} counts only the new birds. The original group of ${a} must remain in the total.`], [String(Math.min(10, ans + 1)), `That total counts one bird too many. Count both groups once to get ${ans}.`]]);
  },
  countAddLine: (rand, band) => {
    const hops = pick(rand, 1, bandHi(band, 3, 4, 5));
    const start = pick(rand, 1, 10 - hops);
    return numberLine("g0-counting", `Start at ${start}. Hop forward ${hops === 1 ? "once" : `${hops} times`} by 1. Where do you land?`, 0, 10, start, 1, hops, "forward");
  },
  countCompareEqualMcq: (rand, band) => {
    const n = pick(rand, 0, bandHi(band, 7, 10, 15));
    return mcq(rand, "g0-counting", `Compare ${n} and ${n}. Which statement is true?`,
      ["They are equal", `Correct — the same number names the same amount, so ${n} equals ${n}.`],
      [["The first number is greater", `Both numbers are ${n}, so neither one is greater than the other.`], ["The second number is greater", `Both positions show ${n}, so the amounts match exactly.`], [`${n} is less than ${n}`, `A number cannot be less than itself; the two values are equal.`]]);
  },
  countTensMcq: (rand, band) => {
    if (rand() < 0.5) {
      const hops = pick(rand, 2, bandHi(band, 6, 8, 10)), target = hops * 10;
      return mcq(rand, "g0-counting", `Starting at 0, how many hops of 10 reach ${target}?`,
        [String(hops), `Correct — ${hops} equal hops of 10 make ${target}.`],
        [[String(target), `${target} is the landing number, not the number of ten-hops. Count the hops themselves.`], [String(Math.max(1, hops - 1)), `That many hops reach only ${(hops - 1) * 10}. One more hop is needed.`], [String(hops + 1), `That many hops would reach ${(hops + 1) * 10}, which passes ${target}.`]]);
    }
    const start = pick(rand, 2, bandHi(band, 5, 7, 8));
    const seq = [start, start + 1, start + 2];
    const tens = seq.map((n) => n * 10).join(", ");
    return mcq(rand, "g0-counting", `Counting ${seq.join(", ")} helps you name which tens?`,
      [tens, `Correct — each counting number becomes its matching group of tens: ${tens}.`],
      [[seq.join(", "), `Those are ones, not groups of ten. Each value needs a zero in the ones place.`], [seq.map((n) => n + 10).join(", "), `Those are teen numbers. Tens are ${tens}.`], [seq.map((n) => n * 100).join(", "), `Those are hundreds, which are ten times larger than the requested tens.`]]);
  },
  countTensLine: (rand, band) => {
    const hops = pick(rand, 1, bandHi(band, 2, 3, 4));
    const startTens = pick(rand, 1, 9 - hops), start = startTens * 10;
    const max = Math.min(100, start + (hops + 1) * 10);
    return numberLine("g0-counting", `Start at ${start}. Make ${hops} ${hops === 1 ? "hop" : "hops"} of 10. Which ten do you land on?`, Math.max(0, start - 10), max, start, 10, hops, "forward");
  },
  countObjectsMcq: (rand, band) => {
    const n = pick(rand, 3, bandHi(band, 7, 10, 12));
    const seq = Array.from({ length: n }, (_, i) => i + 1).join(", ");
    return mcq(rand, "g0-counting", `Mina counts her blocks: ${seq}. How many blocks does she have?`,
      [String(n), `Correct — the last number said, ${n}, tells how many blocks are in the whole group.`],
      [["1", `One is the first number in the count, but the last number tells the total amount.`], [String(n - 1), `The count continues one more number after ${n - 1}, so the total is ${n}.`], [String(n + 1), `The count stops at ${n}; adding another number would count a block that is not there.`]]);
  },
  countObjectsFlash: (rand, band) => {
    const count = pick(rand, 2, bandHi(band, 5, 7, 8));
    const arrangement = choose(rand, band === "support" ? ["dice", "line"] as const : ["dice", "line", "scatter"] as const);
    return subitize("g0-counting", `A group of dots will flash. Choose the number of dots you see.`, count, arrangement, band === "support" ? 1800 : 1200);
  },
  countDecomposeMcq: (rand, band) => {
    if (rand() < 0.5) {
      const each = pick(rand, 1, bandHi(band, 4, 5, 6)), total = each * 2;
      return mcq(rand, "g0-counting", `${total} cherries are shared equally between 2 bowls. How many cherries go in each bowl?`,
        [String(each), `Correct — two equal groups of ${each} use all ${total} cherries.`],
        [[String(total), `${total} is the whole amount before sharing. Each bowl receives only one of the two equal groups.`], [String(each + 1), `Two groups of ${each + 1} would need ${2 * (each + 1)} cherries, more than the ${total} available.`], [String(Math.max(0, each - 1)), `Two groups of ${Math.max(0, each - 1)} would leave cherries unshared. Equal sharing gives ${each} in each bowl.`]]);
    }
    const total = pick(rand, 4, bandHi(band, 7, 9, 10));
    const goodA = pick(rand, 1, total - 1), goodB = total - goodA;
    const badA = pick(rand, 1, total - 1);
    let badB = Math.max(0, total - badA - 1);
    if (badA + badB === total) badB = Math.max(0, badB - 1);
    const wrongPairs = [[0, total], [1, total - 1], [goodA, goodB]].filter(([a, b], i, a0) => a + b === total && a0.findIndex(([x, y]) => `${x},${y}` === `${a},${b}`) === i);
    return mcq(rand, "g0-counting", `Which pair is NOT a split of ${total}?`,
      [`${badA} and ${badB}`, `Correct — ${badA} + ${badB} = ${badA + badB}, so this pair does not rebuild ${total}.`],
      wrongPairs.map(([a, b]) => [`${a} and ${b}`, `${a} + ${b} = ${total}, so this pair is a valid split of ${total}.`]));
  },
  countMakeTenMcq: (rand) => {
    const a = pick(rand, 0, 10), b = 10 - a;
    const pairs: Array<[number, number]> = [[a, b], [a, Math.max(0, b - 1)], [Math.min(10, a + 1), b], [Math.max(0, a - 1), Math.max(0, b - 1)]];
    return mcq(rand, "g0-counting", `Which pair makes exactly 10?`,
      [`${a} and ${b}`, `Correct — ${a} + ${b} = 10, so the pair fills one complete ten.`],
      pairs.slice(1).map(([x, y]) => [`${x} and ${y}`, `${x} + ${y} = ${x + y}, which does not make exactly 10.`]));
  },
  countMoreFewerMcq: (rand, band) => {
    const a = pick(rand, 0, bandHi(band, 7, 10, 12));
    const b = rand() < 0.35 ? a : pick(rand, 0, bandHi(band, 7, 10, 12));
    const correct = a > b ? "More stars" : b > a ? "More hearts" : "They are equal";
    return mcq(rand, "g0-counting", `There ${a === 1 ? "is" : "are"} ${a} ${a === 1 ? "star" : "stars"} and ${b} ${b === 1 ? "heart" : "hearts"}. Which statement is true?`,
      [correct, a === b ? `Correct — both groups contain ${a}, so the amounts are equal.` : `Correct — ${Math.max(a, b)} is greater than ${Math.min(a, b)}, so the matching group has more.`],
      [["More stars", `${a} ${a === 1 ? "star" : "stars"} compared with ${b} ${b === 1 ? "heart" : "hearts"} does not make the star group larger in this problem.`], ["More hearts", `${b} ${b === 1 ? "heart" : "hearts"} compared with ${a} ${a === 1 ? "star" : "stars"} does not make the heart group larger in this problem.`], ["They are equal", `The groups are equal only when both counts match; here the counts are ${a} and ${b}.`]].filter(([label]) => label !== correct) as Array<[string, string]>);
  },
  countOrderDrag: (rand, band) => {
    const n = band === "stretch" ? 4 : 3;
    const values = distinctInts(rand, 0, bandHi(band, 10, 15, 20), n);
    return dragOrder("g0-counting", `Drag the numbers into counting order, smallest first.`, rand, values);
  },
  countBetweenMcq: (rand, band) => {
    const a = pick(rand, 0, bandHi(band, 8, 13, 18)), ans = a + 1, end = a + 2;
    return mcq(rand, "g0-counting", `Which number comes between ${a} and ${end}?`,
      [String(ans), `Correct — the counting sequence is ${a}, ${ans}, ${end}.`],
      [[String(a), `${a} is the first endpoint, not the number between the endpoints.`], [String(end), `${end} is the second endpoint, not the middle number.`], [String(Math.max(0, a - 1)), `${Math.max(0, a - 1)} comes before ${a}; the number between ${a} and ${end} is ${ans}.`]]);
  },
  countReadMcq: (rand) => {
    const n = pick(rand, 0, 10);
    return mcq(rand, "g0-counting", `A group shows ${n} ${n === 1 ? "dot" : "dots"}. Which numeral names that amount?`,
      [String(n), `Correct — the numeral ${n} names a group containing ${n} ${n === 1 ? "dot" : "dots"}.`],
      [[String(Math.max(0, n - 1)), `That numeral names one fewer dot than the group shows.`], [String(Math.min(10, n + 1)), `That numeral names one more dot than the group shows.`], [n === 0 ? "10" : "0", n === 0 ? `Ten names a full frame, while an empty group is named by 0.` : `Zero names an empty group, while this group contains ${n} ${n === 1 ? "dot" : "dots"}.`]]);
  },
  countReadFlash: (rand, band) => {
    const count = pick(rand, band === "support" ? 5 : 6, 10);
    return subitize("g0-counting", `Look at the ten-frame flash and choose the matching numeral.`, count, "tenFrame", band === "support" ? 2000 : 1400);
  },
  countZeroTap: (rand) => {
    const counts = shuffled(rand, [0, pick(rand, 1, 3), pick(rand, 4, 6)]);
    return tap("g0-counting", `Tap the plate that shows zero cookies.`, "selectOne", counts.map((count) => ({
      label: count === 0 ? "empty plate" : `plate with ${count} cookies`, icon: "🍪", count, correct: count === 0,
      ...(count === 0 ? {} : { feedback: `This plate shows ${count} cookies. Zero means an empty plate with no cookies at all.` }),
    })));
  },
  countSubtractMcq: (rand, band) => {
    const start = pick(rand, 1, bandHi(band, 7, 9, 10));
    const take = rand() < 0.3 ? 0 : rand() < 0.3 ? start : pick(rand, 1, start);
    const ans = start - take;
    return mcq(rand, "g0-counting", `You have ${start} stickers and give away ${take}. How many stickers are left?`,
      [String(ans), `Correct — taking away ${take} from ${start} leaves ${ans} stickers.`],
      [[String(start), `${start} is the starting amount. It is the answer only when nothing is taken away.`], [String(take), `${take} is the amount given away, not the amount that remains.`], [String(Math.min(10, start + take)), `That puts the groups together, but the story asks you to take stickers away.`]]);
  },
  countSubtractLine: (rand, band) => {
    const start = pick(rand, bandHi(band, 6, 8, 10) - 2, bandHi(band, 7, 9, 10));
    const hops = pick(rand, 1, Math.min(start, bandHi(band, 3, 5, 6)));
    return numberLine("g0-counting", `Start at ${start}. Hop back ${hops === 1 ? "once" : `${hops} times`} by 1. Where do you land?`, 0, 10, start, 1, hops, "back");
  },
  countTeenFrame: (rand, band) => {
    const extra = pick(rand, 1, bandHi(band, 4, 7, 9)), teen = 10 + extra;
    return tenFrame("g0-counting", `A full group of 10 is already shown. Add the extra dots needed to make ${teen}.`, extra, 0, "tangerine");
  },
};

const SHAPE_FORMS = [
  "shapeComposePairs", "shapeComposeMcq", "shapeComposeTap", "shapeWeightMcq", "shapeWeightTap",
  "shapeLengthCompare", "shapePositionMcq", "shapePositionTap", "shapeRollStackMcq", "shapeRollStackTap",
  "shapeAnyWayMcq", "shapeAnyWayTap", "shapeSortMcq", "shapeSortTap", "shapeSortFrame",
] as const;

const shapeHandlers: Record<string, FormHandler> = {
  shapeComposePairs: (rand, band) => {
    const table: Array<[string, string]> = [
      ["two triangles", "a square"], ["two squares side by side", "a rectangle"], ["six squares folded up", "a cube"],
      ["two half-circles", "a circle"], ["four equal triangles", "a larger square"],
    ];
    const n = band === "support" ? 3 : 4;
    return match("g0-shapes-sorting", `Match each group of pieces to the whole shape those pieces can build.`, rand, shuffled(rand, table).slice(0, n));
  },
  shapeComposeMcq: (rand, band) => {
    if (rand() < 0.5) {
      const object = choose(rand, ["house", "school", "tent"] as const);
      return mcq(rand, "g0-shapes-sorting", `A simple ${object} picture has a square body and a pointy roof. Which shapes build the picture?`,
        ["A square and a triangle", `Correct — the square makes the body and the triangle makes the pointy roof.`],
        [["A circle and a rectangle", `Those shapes do not provide the pointy triangular roof described in the picture.`], ["Two circles", `Circles have curved edges and cannot make the square body and pointy roof.`], ["A cube and a sphere", `Those are solid shapes, while the drawing is built from flat shapes.`]]);
    }
    const squares = pick(rand, 2, bandHi(band, 3, 4, 5)), ans = squares * 2;
    return mcq(rand, "g0-shapes-sorting", `Two triangles build one square. How many triangles build ${squares} squares?`,
      [String(ans), `Correct — ${squares} squares need ${squares} groups of 2 triangles, which is ${ans}.`],
      [[String(squares), `${squares} counts the squares, but every square needs two triangles.`], [String(ans - 1), `That leaves one triangle missing from the final square.`], [String(ans + 2), `That adds one extra pair of triangles, enough for another square.`]]);
  },
  shapeComposeTap: (rand) => tap("g0-shapes-sorting", `A sailboat has a pointy sail. Tap the flat shape that can make the sail.`, "selectOne", shuffled(rand, [
    { label: "triangle", icon: "🔺", count: 1, correct: true },
    { label: "circle", icon: "⚪", count: 1, correct: false, feedback: `A circle has one curved edge and does not make the pointy sides of a sail.` },
    { label: "square", icon: "◼️", count: 1, correct: false, feedback: `A square has four equal straight sides but no single point for the top of the sail.` },
  ])),
  shapeWeightMcq: (rand) => {
    const mode = choose(rand, ["up", "down", "level"] as const);
    const prompt = mode === "level" ? `Two bags sit on a seesaw and the board stays level. What does that show?` : `A toy bear sits on a seesaw and its side goes ${mode}. What does that show about the bear?`;
    const correct = mode === "level" ? "The bags weigh the same" : mode === "up" ? "The bear is lighter" : "The bear is heavier";
    return mcq(rand, "g0-shapes-sorting", prompt,
      [correct, mode === "level" ? `Correct — a level seesaw shows that both sides have the same weight.` : `Correct — the lower side is heavier and the higher side is lighter.`],
      [["The bear is heavier", `A heavier side moves down, so a side that moves up cannot be the heavier side.`], ["The bear is lighter", `A lighter side moves up, so a side that moves down cannot be the lighter side.`], ["The bags weigh the same", `Equal weights keep a seesaw level rather than moving one side up or down.`]].filter(([label]) => label !== correct) as Array<[string, string]>);
  },
  shapeWeightTap: (rand) => {
    if (rand() < 0.5) {
      const heavy = choose(rand, ["rock", "book", "full water bottle"] as const), light = choose(rand, ["balloon", "feather", "empty cup"] as const);
      return tap("g0-shapes-sorting", `On a seesaw, the ${heavy} side goes down and the ${light} side goes up. Tap the heavier object.`, "selectOne", shuffled(rand, [
        { label: heavy, icon: heavy === "rock" ? "🪨" : heavy === "book" ? "📘" : "🧴", count: 1, correct: true },
        { label: light, icon: light === "balloon" ? "🎈" : light === "feather" ? "🪶" : "🥤", count: 1, correct: false, feedback: `The ${light} side rises, which shows that it is lighter than the ${heavy}.` },
      ]));
    }
    const large = choose(rand, ["bucket", "bowl", "pitcher"] as const), small = choose(rand, ["spoon", "cup", "small scoop"] as const);
    return tap("g0-shapes-sorting", `A ${large} holds more than a ${small}. Tap the object that holds less.`, "selectOne", shuffled(rand, [
      { label: large, icon: "🪣", count: 1, correct: false, feedback: `The ${large} is the container that holds more, so it is not the smaller-capacity choice.` },
      { label: small, icon: "🥄", count: 1, correct: true },
    ]));
  },
  shapeLengthCompare: (rand, band) => {
    const mode = band === "support" ? "pick" : rand() < 0.45 ? "align" : "pick";
    if (mode === "align") {
      const long = pick(rand, 7, 11), short = pick(rand, 3, long - 1);
      return lengthCompare("g0-shapes-sorting", `Move both ribbons to the same starting line, then tap the longer ribbon.`, "align", "h", shuffled(rand, [
        { id: "top", label: "top ribbon", length: short, startOffset: pick(rand, 1, 3) },
        { id: "bottom", label: "bottom ribbon", length: long, startOffset: 0 },
      ]));
    }
    if (rand() < 0.5) {
      const giraffe = pick(rand, 8, 12), pony = pick(rand, 4, giraffe - 1);
      return lengthCompare("g0-shapes-sorting", `The animals stand on the same ground. Tap the taller animal.`, "pick", "v", [
        { id: "giraffe", label: "giraffe", length: giraffe }, { id: "pony", label: "pony", length: pony },
      ]);
    }
    const lens = distinctInts(rand, 4, bandHi(band, 9, 12, 15), 3).sort((a, b) => a - b);
    return lengthCompare("g0-shapes-sorting", `Compare the three vehicles from one start line and tap the longest.`, "pick", "h", [
      { id: "bike", label: "bike", length: lens[0] }, { id: "car", label: "car", length: lens[1] }, { id: "train", label: "train", length: lens[2] },
    ]);
  },
  shapePositionMcq: (rand) => {
    const pairs = [["above", "below"], ["in front of", "behind"], ["inside", "outside"], ["left of", "right of"]] as const;
    const [word, opposite] = choose(rand, pairs);
    return mcq(rand, "g0-shapes-sorting", `What is the opposite position of “${word}”?`,
      [opposite, `Correct — ${opposite} names the position directly opposite ${word}.`],
      pairs.flatMap(([a, b]) => [a, b]).filter((x) => x !== opposite).slice(0, 3).map((x) => [x, `${x} does not reverse the position ${word}. The opposite position is ${opposite}.`] as [string, string]));
  },
  shapePositionTap: (rand) => {
    const relation = choose(rand, ["above", "below", "beside"] as const);
    return tap("g0-shapes-sorting", `Tap the cat that is ${relation} the table.`, "selectOne", shuffled(rand, [
      { label: "cat above the table", icon: "🐈", count: 1, correct: relation === "above", ...(relation === "above" ? {} : { feedback: `This cat is above the table, which does not match the requested position ${relation}.` }) },
      { label: "cat below the table", icon: "🐈", count: 1, correct: relation === "below", ...(relation === "below" ? {} : { feedback: `This cat is below the table, which does not match the requested position ${relation}.` }) },
      { label: "cat beside the table", icon: "🐈", count: 1, correct: relation === "beside", ...(relation === "beside" ? {} : { feedback: `This cat is beside the table, which does not match the requested position ${relation}.` }) },
    ]));
  },
  shapeRollStackMcq: (rand) => {
    if (rand() < 0.5) return mcq(rand, "g0-shapes-sorting", `Why can cans stack in a store display?`,
      ["Their flat circle ends rest on one another", `Correct — flat faces meet without rocking, so the cans can stack steadily.`],
      [["Their curved sides lock together", `Curved sides roll rather than provide a stable stacking surface.`], ["They have sharp corners", `A can has curved sides and flat circle ends rather than sharp corners.`], ["They are always the heaviest objects", `Weight alone does not create a flat, stable surface for stacking.`]]);
    return mcq(rand, "g0-shapes-sorting", `Which solid rolls most easily because its surface is curved all the way around?`,
      ["A sphere", `Correct — a sphere has a curved surface in every direction, so it rolls easily.`],
      [["A cube", `A cube rests on flat square faces and does not roll smoothly.`], ["A rectangular prism", `A rectangular prism has flat faces and edges that interrupt rolling.`], ["A pyramid", `A pyramid has flat triangular faces and pointed edges rather than one continuous curve.`]]);
  },
  shapeRollStackTap: (rand) => tap("g0-shapes-sorting", `Tap the solid blocks that make the most stable tall tower.`, "selectOne", shuffled(rand, [
    { label: "cubes", icon: "🧊", count: 3, correct: true },
    { label: "spheres", icon: "⚽", count: 3, correct: false, feedback: `Spheres have curved surfaces and roll away instead of making a stable tower.` },
    { label: "cones", icon: "🔺", count: 3, correct: false, feedback: `Cones narrow to points, so they do not make broad, steady layers for a tall tower.` },
  ])),
  shapeAnyWayMcq: (rand) => {
    if (rand() < 0.5) {
      const shape = choose(rand, ["rectangle", "triangle", "square"] as const);
      return mcq(rand, "g0-shapes-sorting", `A ${shape} is turned sideways. What shape is it now?`,
        [`Still a ${shape}`, `Correct — turning a shape changes its direction, not its sides and corners.`],
        [["A circle", `Turning cannot replace straight sides with one curved edge.`], ["A different shape every time", `A shape keeps its name when it is moved, turned, or resized.`], ["It has no shape name", `Its defining sides and corners remain visible after the turn.`]]);
    }
    return mcq(rand, "g0-shapes-sorting", `What features decide the name of a flat shape?`,
      ["Its sides and corners", `Correct — the number and arrangement of sides and corners define the flat shape.`],
      [["Its color", `Changing color does not change the shape's sides or corners.`], ["Its size", `A small and a large version can still have the same shape name.`], ["The direction it points", `Turning a shape does not change its defining sides and corners.`]]);
  },
  shapeAnyWayTap: (rand) => {
    const target = rand() < 0.5 ? "circle" : "triangle";
    const groups = target === "circle" ? [
      { label: "tiny circle", icon: "⚪", count: 1, correct: true }, { label: "large circle", icon: "⭕", count: 1, correct: true },
      { label: "square", icon: "◼️", count: 1, correct: false, feedback: `This shape has four straight sides, so it is a square rather than a circle.` },
      { label: "triangle", icon: "🔺", count: 1, correct: false, feedback: `This shape has three straight sides, so it is a triangle rather than a circle.` },
    ] : [
      { label: "large triangle pointing up", icon: "🔺", count: 1, correct: true }, { label: "triangle pointing down", icon: "🔻", count: 1, correct: true },
      { label: "tiny triangle", icon: "🔺", count: 1, correct: true }, { label: "circle", icon: "⚪", count: 1, correct: false, feedback: `This shape has a curved edge and no corners, so it is not a triangle.` },
    ];
    return tap("g0-shapes-sorting", `Tap every ${target}, even when its size or direction is different.`, "selectAll", shuffled(rand, groups));
  },
  shapeSortMcq: (rand) => {
    const items = [
      { color: "red", kind: "food", item: "apple" }, { color: "blue", kind: "toy", item: "car" },
      { color: "green", kind: "clothing", item: "sock" }, { color: "yellow", kind: "food", item: "banana" },
    ];
    const x = choose(rand, items);
    return mcq(rand, "g0-shapes-sorting", `You sort a ${x.color} ${x.item} first by color and then by kind. Where does it go each time?`,
      [`${x.color[0].toUpperCase() + x.color.slice(1)} group first, then ${x.kind} group`, `Correct — the first rule uses color, and the second rule uses what kind of object it is.`],
      [[`${x.kind[0].toUpperCase() + x.kind.slice(1)} group first, then ${x.color} group`, `That reverses the two sorting rules. Color is used first, then kind.`], ["The same group both times", `Changing the sorting rule can move one object into a different group.`], ["It cannot be sorted twice", `The same object can be regrouped whenever the sorting rule changes.`]]);
  },
  shapeSortTap: (rand, band) => {
    const labels = ["circles", "squares", "triangles"];
    const counts = distinctInts(rand, 2, bandHi(band, 6, 8, 10), 3);
    const max = Math.max(...counts);
    return tap("g0-shapes-sorting", `Tap the group with the greatest number of shapes.`, "selectOne", shuffled(rand, labels.map((label, i) => ({
      label: `${counts[i]} ${label}`, icon: i === 0 ? "⚪" : i === 1 ? "◼️" : "🔺", count: counts[i], correct: counts[i] === max,
      ...(counts[i] === max ? {} : { feedback: `${counts[i]} is fewer than the greatest group, which contains ${max} shapes.` }),
    }))));
  },
  shapeSortFrame: (rand, band) => {
    const red = pick(rand, 1, bandHi(band, 3, 4, 5));
    const blue = pick(rand, 1, Math.min(10 - red, bandHi(band, 4, 5, 6)));
    const total = red + blue;
    return tenFrame("g0-shapes-sorting", `The frame already has ${red} red ${red === 1 ? "button" : "buttons"}. Add ${blue} blue ${blue === 1 ? "button" : "buttons"} so it shows ${total} buttons altogether.`, total, red, "sky");
  },
};

function family(tag: string, label: string, forms: readonly string[], handlers: Record<string, FormHandler>): VariantGen {
  return {
    tag,
    label,
    forms: forms as unknown as readonly never[],
    gen: (rand, band = "core", form = "default") => {
      const key = String(form) === "default" ? forms[0] : String(form);
      const handler = handlers[key];
      if (!handler) throw new Error(`unknown ${tag} form ${key}`);
      return handler(rand, band);
    },
  } as VariantGen;
}

/** S183: `k0-count-100` — Kindergarten counting to 100 (K.CC.A.1, K.CC.A.2), built for the
 * counting-to-100-k course. Every form is HARD-CAPPED at 100 by construction: a kindergarten
 * count-to-100 course must never draw a variant whose numbers exceed the standard's ceiling,
 * and the session test sweeps that invariant rather than trusting it. Prose stays in the K
 * voice: short, concrete, one idea per sentence. */
const K100_FORMS = [
  "kSeqNextHop", "kSeqNextMcq", "kSeqBeforeHop", "kSeqMissingMcq", "kDecadeCrossHop",
  "kDecadeNextMcq", "kTensNextHop", "kTensNextMcq", "kTensBackHop", "kTensOrderDrag",
  "kChartRowMcq", "kChartMissingMcq", "kCountFromHop", "kCountBackHop", "kSeqOrderDrag",
] as const;
const kCap = (band: Band, support: number, core: number, stretch: number) => bandHi(band, support, core, stretch);
const k100Handlers: Record<string, FormHandler> = {
  kSeqNextHop: (r, b) => {
    const n = pick(r, 20, kCap(b, 48, 78, 98));
    return numberLine("k0-count-100", `What number comes right after ${n}? Hop one and tap where you land.`, Math.max(0, n - 4), Math.min(100, n + 5), n, 1, 1, "forward");
  },
  kSeqNextMcq: (r, b) => {
    const n = pick(r, 20, kCap(b, 48, 78, 98));
    return mcq(r, "k0-count-100", `What number comes right after ${n}?`,
      [String(n + 1), `Yes — counting on by one, right after ${n} comes ${n + 1}.`],
      [[String(n), `That is the same number. The NEXT number is one more: ${n + 1}.`],
       [String(n + 2), `That skips one. Right after ${n} comes ${n + 1}.`],
       [String(n - 1), `That is the number BEFORE ${n}. After ${n} comes ${n + 1}.`]]);
  },
  kSeqBeforeHop: (r, b) => {
    const n = pick(r, 21, kCap(b, 49, 79, 99));
    return numberLine("k0-count-100", `What number comes right before ${n}? Hop one back and tap where you land.`, Math.max(0, n - 5), Math.min(100, n + 4), n, 1, 1, "back");
  },
  kSeqMissingMcq: (r, b) => {
    const a = pick(r, 20, kCap(b, 45, 75, 96));
    return mcq(r, "k0-count-100", `Fill the missing number: ${a}, ${a + 1}, __, ${a + 3}.`,
      [String(a + 2), `Yes — the run counts ${a}, ${a + 1}, ${a + 2}, ${a + 3} in order.`],
      [[String(a + 1), `That repeats the number before the gap. The gap holds ${a + 2}.`],
       [String(a + 3), `That is the number after the gap. The gap holds ${a + 2}.`],
       [String(a + 4), `That is past the end of the run. The gap holds ${a + 2}.`]]);
  },
  kDecadeCrossHop: (r, b) => {
    const d = pick(r, 3, kCap(b, 4, 7, 9)) * 10;
    const start = d - 3;
    return numberLine("k0-count-100", `Start at ${start} and count on 5. Tap where you land.`, Math.max(0, start - 2), Math.min(100, start + 7), start, 1, 5, "forward");
  },
  kDecadeNextMcq: (r, b) => {
    const d = pick(r, 3, kCap(b, 4, 7, 9)) * 10;
    return mcq(r, "k0-count-100", `What number comes right after ${d - 1}?`,
      [String(d), `Yes — after ${d - 1} the count moves into a new ten: ${d}.`],
      [[String(d - 1), `That is the same number. After ${d - 1} comes ${d}.`],
       [String(d + 10), `That jumps a whole ten too far. After ${d - 1} comes ${d}.`],
       [String(d - 10), `That goes back a ten. Counting moves UP: after ${d - 1} comes ${d}.`]]);
  },
  kTensNextHop: (r, b) => {
    const t = pick(r, 1, kCap(b, 4, 7, 9)) * 10;
    return numberLine("k0-count-100", `Count by tens: what comes after ${t}? Hop one ten and tap where you land.`, Math.max(0, t - 10), Math.min(100, t + 20), t, 10, 1, "forward");
  },
  kTensNextMcq: (r, b) => {
    const t = pick(r, 1, kCap(b, 4, 7, 9)) * 10;
    return mcq(r, "k0-count-100", `Counting by tens — what comes after ${t}?`,
      [String(t + 10), `Yes — ten more than ${t} is ${t + 10}.`],
      [[String(t + 1), `That adds just one. Counting by TENS adds a whole ten: ${t + 10}.`],
       [String(t - 10), `That goes back a ten. Counting forward by tens gives ${t + 10}.`],
       [String(t), `That stays still. Ten more than ${t} is ${t + 10}.`]]);
  },
  kTensBackHop: (r, b) => {
    const t = pick(r, 3, kCap(b, 5, 8, 10)) * 10;
    return numberLine("k0-count-100", `Count back by tens from ${t}. Hop one ten back and tap where you land.`, Math.max(0, t - 20), Math.min(100, t + 10), t, 10, 1, "back");
  },
  kTensOrderDrag: (r, b) => {
    const t0 = pick(r, 1, kCap(b, 2, 4, 6)) * 10;
    return dragOrder("k0-count-100", "Drag the tens into counting order, smallest first.", r, [t0, t0 + 10, t0 + 20, t0 + 30, t0 + 40]);
  },
  kChartRowMcq: (r, b) => {
    const n = pick(r, 11, kCap(b, 39, 69, 89));
    return mcq(r, "k0-count-100", `On the hundred chart, what number sits directly BELOW ${n}?`,
      [String(n + 10), `Yes — one row down is ten more: ${n + 10}.`],
      [[String(n + 1), `That is the next number in the SAME row. Directly below is ten more: ${n + 10}.`],
       [String(n - 10), `That is the row ABOVE. Below ${n} is ${n + 10}.`],
       [String(n), `That is the same square. Below it sits ${n + 10}.`]]);
  },
  kChartMissingMcq: (r, b) => {
    // the row-BELOW trap shows a+12, so the draw is capped at 88 to keep every visible number <= 100
    const a = pick(r, 21, kCap(b, 46, 76, 88));
    return mcq(r, "k0-count-100", `A chart row reads ${a}, ${a + 1}, __, ${a + 3}. What is missing?`,
      [String(a + 2), `Yes — the row counts on by one: ${a + 2}.`],
      [[String(a + 12), `That is from the row BELOW. This row holds ${a + 2}.`],
       [String(a + 1), `That repeats the square before the gap. The gap holds ${a + 2}.`],
       [String(a + 3), `That is the square after the gap. The gap holds ${a + 2}.`]]);
  },
  kCountFromHop: (r, b) => {
    const start = pick(r, 6, kCap(b, 40, 70, 93));
    const hops = Math.min(pick(r, 3, 6), 100 - start);
    return numberLine("k0-count-100", `Start at ${start} and count on ${hops}. Tap where you land.`, Math.max(0, start - 2), Math.min(100, start + hops + 2), start, 1, hops, "forward");
  },
  kCountBackHop: (r, b) => {
    const start = pick(r, 6, kCap(b, 12, 16, 20));
    const hops = Math.min(pick(r, 1, 3), start);
    return numberLine("k0-count-100", `Start at ${start} and count back ${hops}. Tap where you land.`, Math.max(0, start - hops - 2), Math.min(100, start + 3), start, 1, hops, "back");
  },
  kSeqOrderDrag: (r, b) => {
    const a = pick(r, 21, kCap(b, 44, 74, 95));
    return dragOrder("k0-count-100", "Drag the numbers into counting order, smallest first.", r, [a, a + 1, a + 2, a + 3, a + 4]);
  },
};

/* ===================================================== k0-add-subtract (S189, 20 forms) ===== */

const KOA = "k0-add-subtract";
// Additive fact-family key, identical to factFluency.ts's sumFamilyKey. Kept local so this
// generator file stays dependency-free like every other g*Variants module.
const koaFam = (a: number, b: number) => `${Math.min(a, b)}+${Math.max(a, b)}`;

/** Numeric variant carrying an optional additive fact family. Only the K.OA.A.5 fluency forms
 * set it: the K.OA.A.1/2 forms are about REPRESENTING and MODELLING a situation, not recalling a
 * fact, so tagging them would put modelling evidence into a recall leech box. */
const koaNum = (
  prompt: string, answer: number, errs: Array<[number, string]>, success: string, family?: string
) => {
  const seen = new Set<number>([answer]);
  const commonErrors: Array<{ value: number; feedback: string }> = [];
  for (const [value, feedback] of errs) {
    if (!Number.isInteger(value) || value < 0 || seen.has(value)) continue;
    seen.add(value); commonErrors.push({ value, feedback });
  }
  const v: {
    tag: string; answer: number; factFamily?: string;
    widget: Record<string, unknown>;
  } = {
    tag: KOA, answer,
    widget: {
      type: "numeric", prompt, answer, tolerance: 0, unit: "",
      commonErrors,
      fallbackFeedback: "Count the objects one at a time, touching each one exactly once.",
      successFeedback: success
    }
  };
  if (family) v.factFamily = family;
  return v;
};

const koaMcq = (
  r: () => number, prompt: string, correct: [string, string], wrong: Array<[string, string]>
) => {
  const seen = new Set<string>([correct[0]]);
  const ws = wrong.filter((w) => !seen.has(w[0]) && seen.add(w[0]));
  const all = [
    { label: correct[0], feedback: correct[1], correct: true },
    ...ws.map(([label, feedback]) => ({ label, feedback, correct: false }))
  ];
  // Deterministic rotation, no Math.random. NOT by prompt.length alone: these K prompts embed
  // single-digit numbers, so their length is CONSTANT across seeds and the correct option would
  // park in one fixed slot forever — a position the learner could game. Folding in the digit
  // characters makes the rotation vary with the actual numbers while staying fully deterministic.
  const rotKey = prompt.length + [...prompt].reduce((t, ch) => t + (ch >= "0" && ch <= "9" ? ch.charCodeAt(0) : 0), 0);
  const rot = rotKey % all.length;
  const options = [...all.slice(rot), ...all.slice(0, rot)].map((o, i) => ({ id: `o${i}`, ...o }));
  return {
    tag: KOA, answer: options.find((o) => o.correct)!.id,
    widget: { type: "mcq", prompt, options }
  };
};

const kpick = (r: () => number, a: number, b: number) => a + Math.floor(r() * (b - a + 1));
const kchoose = <T,>(r: () => number, xs: readonly T[]) => xs[kpick(r, 0, xs.length - 1)];
const kThing = (r: () => number) => kchoose(r, ["apples", "blocks", "ducks", "leaves", "stars", "bears"] as const);
/** Singular form of a kThing noun, so a count of 1 never reads "1 blocks". Every prompt that
 * places a NUMBER directly before the noun must go through this. */
const kOne: Record<string, string> = { apples: "apple", blocks: "block", ducks: "duck", leaves: "leaf", stars: "star", bears: "bear" };
const kN = (n: number, thing: string) => `${n} ${n === 1 ? (kOne[thing] ?? thing) : thing}`;

const koaHandlers: Record<string, (r: () => number) => unknown> = {
  /* ---- K.OA.A.1: represent addition and subtraction ---- */
  KoaJoinNumeric: (r) => {
    const a = kpick(r, 1, 5), b = kpick(r, 1, Math.min(5, 10 - a)), t = kThing(r);
    return koaNum(`One group has ${kN(a, t)}. Another group has ${kN(b, t)}. Put them together. How many ${t} in all?`, a + b,
      [[a, `That counts only the first group. Putting together means counting BOTH groups.`],
       [Math.abs(a - b), `That compares the groups instead of joining them. Count every object in both groups.`]],
      `Correct — ${a} and ${b} together make ${a + b}.`);
  },
  KoaFingersNumeric: (r) => {
    const a = kpick(r, 1, 5), b = kpick(r, 1, 5);
    return koaNum(`Hold up ${a} fingers on one hand and ${b} on the other. How many fingers are up?`, a + b,
      [[a, `That counts one hand only. Count the fingers on BOTH hands.`],
       [10 - (a + b), `That counts the fingers still DOWN. The question asks how many are up.`]],
      `Correct — ${a} fingers and ${b} fingers make ${a + b}.`);
  },
  KoaDrawingsNumeric: (r) => {
    const a = kpick(r, 2, 5), b = kpick(r, 1, Math.min(4, 10 - a));
    return koaNum(`Draw ${a} circles. Then draw ${b} more circles. How many circles did you draw?`, a + b,
      [[a, `That counts only the first drawing. The ${b} new circles count too.`],
       [b, `That counts only the circles drawn second. Count every circle on the page.`]],
      `Correct — ${a} circles and ${b} more make ${a + b}.`);
  },
  KoaActOutNumeric: (r) => {
    const a = kpick(r, 2, 6), b = kpick(r, 1, Math.min(4, 10 - a));
    return koaNum(`${a} children are playing. ${b} more children join them. How many children are playing now?`, a + b,
      [[a, `That is how many started. ${b} more joined, so the group grew.`],
       [a - b >= 0 ? a - b : a + 1, `That takes children away. "Join" means MORE children, so the total goes up.`]],
      `Correct — ${a} children and ${b} more make ${a + b}.`);
  },
  KoaWriteAddMcq: (r) => {
    const a = kpick(r, 2, 5), b = kpick(r, 1, Math.min(4, 10 - a));
    return koaMcq(r, `${a} birds sit on a branch. ${b} more birds land. Which sentence shows this?`,
      [`${a} + ${b} = ${a + b}`, `Correct — joining ${a} and ${b} is written with a plus sign, and the total is ${a + b}.`],
      [[`${a} − ${b} = ${a - b >= 0 ? a - b : 0}`, `The minus sign means taking away, but these birds are ARRIVING.`],
       [`${a} + ${b} = ${a + b + 1}`, `The plus sign is right, but the total is off by one — count again: ${a + b}.`],
       [`${b} − ${a} = 0`, `That both reverses the numbers and takes away instead of joining.`]]);
  },

  /* ---- K.OA.A.1: subtraction ---- */
  KoaTakeAwayNumeric: (r) => {
    const total = kpick(r, 4, 10), away = kpick(r, 1, total - 1);
    return koaNum(`There are ${total} cookies. You eat ${away}. How many cookies are left?`, total - away,
      [[total, `That is how many there were BEFORE eating. ${away} are gone now.`],
       [away, `That counts the cookies eaten, not the ones left on the plate.`]],
      `Correct — ${total} take away ${away} leaves ${total - away}.`);
  },
  KoaSubDrawingsNumeric: (r) => {
    const total = kpick(r, 4, 9), away = kpick(r, 1, total - 1);
    return koaNum(`Draw ${total} circles, then cross out ${away}. How many circles are NOT crossed out?`, total - away,
      [[away, `That counts the crossed-out circles. The question asks about the ones still plain.`],
       [total, `That counts every circle drawn, including the crossed-out ones.`]],
      `Correct — ${total} circles with ${away} crossed out leaves ${total - away}.`);
  },
  KoaSubActOutNumeric: (r) => {
    const total = kpick(r, 4, 9), away = kpick(r, 1, total - 1);
    return koaNum(`${total} children are playing. ${away} go home. How many children are still playing?`, total - away,
      [[total, `That is how many started. ${away} have left, so fewer are playing now.`],
       [away, `That counts the children who went home, not the ones still playing.`]],
      `Correct — ${total} children with ${away} gone leaves ${total - away}.`);
  },
  KoaWriteSubMcq: (r) => {
    const total = kpick(r, 4, 9), away = kpick(r, 1, total - 1);
    return koaMcq(r, `${total} frogs sit on a log. ${away} hop away. Which sentence shows this?`,
      [`${total} − ${away} = ${total - away}`, `Correct — hopping away is taking away, written with a minus sign.`],
      [[`${total} + ${away} = ${total + away}`, `The plus sign means more frogs arrived, but these frogs LEFT.`],
       [`${away} − ${total} = 0`, `That reverses the numbers. The ${total} frogs came first, and ${away} left from them.`],
       [`${total} − ${away} = ${total - away + 1}`, `The minus sign is right, but the answer is one too many — count again.`]]);
  },
  KoaHowManyLeftNumeric: (r) => {
    const total = kpick(r, 5, 10), away = kpick(r, 2, total - 1);
    return koaNum(`${total} balloons float away one at a time until ${away} have gone. How many balloons are left?`, total - away,
      [[away, `That counts the balloons that floated away, not the ones still held.`],
       [total, `That is the starting number. ${away} have gone since then.`]],
      `Correct — ${total} balloons with ${away} gone leaves ${total - away}.`);
  },

  /* ---- K.OA.A.2: word-problem types ---- */
  KoaAddToStoryNumeric: (r) => {
    const a = kpick(r, 2, 6), b = kpick(r, 1, Math.min(4, 10 - a)), t = kThing(r);
    return koaNum(`A basket holds ${kN(a, t)}. Someone puts in ${b} more. How many ${t} are in the basket now?`, a + b,
      [[a, `That is the number before anything was added.`],
       [b, `That counts only what was put in. The basket already held ${a}.`]],
      `Correct — ${a} plus ${b} more makes ${a + b}.`);
  },
  KoaTakeFromStoryNumeric: (r) => {
    const total = kpick(r, 5, 10), away = kpick(r, 1, total - 2), t = kThing(r);
    return koaNum(`A basket holds ${kN(total, t)}. Someone takes out ${away}. How many ${t} are in the basket now?`, total - away,
      [[total, `That is the number before any were taken out.`],
       [away, `That counts what was removed, not what remains in the basket.`]],
      `Correct — ${total} take away ${away} leaves ${total - away}.`);
  },
  KoaPutTogetherNumeric: (r) => {
    const a = kpick(r, 2, 5), b = kpick(r, 2, Math.min(5, 10 - a));
    return koaNum(`A bowl has ${a} red grapes and ${b} green grapes. How many grapes are in the bowl?`, a + b,
      [[a, `That counts the red grapes only. Both colors are in the same bowl.`],
       [Math.abs(a - b), `That compares the two colors. "How many in the bowl" counts them all together.`]],
      `Correct — ${a} red and ${b} green make ${a + b} grapes in all.`);
  },
  KoaChooseOpMcq: (r) => {
    const addStory = r() < 0.5;
    const a = kpick(r, 3, 6), b = kpick(r, 1, 3);
    if (addStory) {
      return koaMcq(r, `${a} ducks swim in a pond. ${b} more ducks swim over. What should you do to find how many ducks are in the pond?`,
        ["Add", `Correct — more ducks arriving means the group grows, so add.`],
        [["Subtract", `Subtracting would make the group smaller, but these ducks ARRIVED.`],
         ["Count only the new ducks", `That leaves out the ${a} ducks already swimming there.`]]);
    }
    return koaMcq(r, `${a + b} ducks swim in a pond. ${b} ducks fly away. What should you do to find how many ducks are left?`,
      ["Subtract", `Correct — ducks leaving means the group shrinks, so subtract.`],
      [["Add", `Adding would make the group bigger, but these ducks LEFT.`],
       ["Count only the ducks that flew away", `That counts what is gone, not what is still on the pond.`]]);
  },
  KoaModelStoryMcq: (r) => {
    const a = kpick(r, 2, 5), b = kpick(r, 1, 3);
    return koaMcq(r, `"${a} cats sit on a wall. ${b} jump down." Which drawing shows this story?`,
      [`${a} cats drawn, with ${b} crossed out`, `Correct — crossing out shows the ${b} cats that jumped down and left.`],
      [[`${a} cats drawn, with ${b} more added`, `Adding more cats would show cats ARRIVING, but these cats left.`],
       [`${a + b} cats drawn, none crossed out`, `That draws the wrong starting number and never shows the cats leaving.`],
       [`${b} cats drawn only`, `That draws only the cats that jumped down, not the ${a} that started on the wall.`]]);
  },

  /* ---- K.OA.A.5: FLUENCY within 5 — these carry additive fact families ---- */
  KoaSums5Numeric: (r) => {
    const total = kpick(r, 2, 5), a = kpick(r, 1, total - 1), b = total - a;
    return koaNum(`${a} + ${b} = ?`, total,
      [[total - 1, `That stops one short. Count on ${b} from ${a} and land on ${total}.`],
       [Math.abs(a - b), `That finds the difference instead of the total.`]],
      `Correct — ${a} + ${b} = ${total}.`, koaFam(a, b));
  },
  KoaDiffs5Numeric: (r) => {
    const total = kpick(r, 2, 5), away = kpick(r, 1, total - 1);
    return koaNum(`${total} − ${away} = ?`, total - away,
      [[total, `That repeats the starting number instead of taking ${away} away.`],
       [away, `That repeats the number taken away, not the number left.`]],
      `Correct — ${total} − ${away} = ${total - away}.`, koaFam(away, total - away));
  },
  KoaPlusMinusOneNumeric: (r) => {
    const plus = r() < 0.5, n = kpick(r, 1, plus ? 9 : 10);
    if (plus) {
      return koaNum(`${n} + 1 = ?`, n + 1,
        [[n, `Adding one moves to the NEXT number, so it does not stay ${n}.`],
         [n + 2, `That counts on two. Adding one moves exactly one step.`]],
        `Correct — one more than ${n} is ${n + 1}.`, koaFam(n, 1));
    }
    return koaNum(`${n} − 1 = ?`, n - 1,
      [[n, `Taking one away moves to the number BEFORE, so it does not stay ${n}.`],
       [n + 1, `That adds one instead of taking one away.`]],
      `Correct — one less than ${n} is ${n - 1}.`, koaFam(1, n - 1));
  },
  KoaZeroFactNumeric: (r) => {
    const plus = r() < 0.5, n = kpick(r, 1, 10);
    if (plus) {
      return koaNum(`${n} + 0 = ?`, n,
        [[0, `Adding zero does not empty the group — nothing was added, so ${n} remain.`],
         [n + 1, `Zero means NO objects were added, so the total does not grow.`]],
        `Correct — adding zero changes nothing: ${n} + 0 = ${n}.`, koaFam(n, 0));
    }
    return koaNum(`${n} − 0 = ?`, n,
      [[0, `Taking zero away does not empty the group — nothing left, so ${n} remain.`],
       [n - 1 >= 0 ? n - 1 : n + 1, `Zero means NO objects were taken, so the total does not shrink.`]],
      `Correct — taking away zero changes nothing: ${n} − 0 = ${n}.`, koaFam(n, 0));
  },
  KoaSpeedy5Numeric: (r) => {
    const sub = r() < 0.5, total = kpick(r, 2, 5);
    if (sub) {
      const away = kpick(r, 1, total - 1);
      return koaNum(`Answer fast: ${total} − ${away} = ?`, total - away,
        [[total, `That repeats the starting number instead of taking ${away} away.`],
         [away, `That repeats the number taken away, not the number left.`]],
        `Correct — ${total} − ${away} = ${total - away}.`, koaFam(away, total - away));
    }
    const a = kpick(r, 1, total - 1), b = total - a;
    return koaNum(`Answer fast: ${a} + ${b} = ?`, total,
      [[total - 1, `That stops one count short of ${total}.`],
       [Math.abs(a - b), `That finds the difference between ${a} and ${b} instead of their total.`]],
      `Correct — ${a} + ${b} = ${total}.`, koaFam(a, b));
  },
};

const KOA_FORMS = Object.keys(koaHandlers);

export const G0_GENERATORS: readonly VariantGen[] = [
  family(KOA, "Kindergarten adding and taking away within 10, and fluency within 5", KOA_FORMS, koaHandlers as never),
  family("g0-counting", "Kindergarten counting, comparison, ordering, addition, subtraction, and teen numbers", COUNT_FORMS, countHandlers),
  family("g0-shapes-sorting", "Kindergarten shapes, position, measurement comparison, composing, and sorting", SHAPE_FORMS, shapeHandlers),
  family("k0-count-100", "Kindergarten counting to 100: sequences, decades, tens, hundred chart, counting on and back", K100_FORMS, k100Handlers),
];

export const G0_FORM_SURFACES: Readonly<Record<string, string>> = {
  KoaJoinNumeric: "numeric", KoaFingersNumeric: "numeric", KoaDrawingsNumeric: "numeric", KoaActOutNumeric: "numeric", KoaWriteAddMcq: "mcq", KoaTakeAwayNumeric: "numeric", KoaSubDrawingsNumeric: "numeric", KoaSubActOutNumeric: "numeric", KoaWriteSubMcq: "mcq", KoaHowManyLeftNumeric: "numeric", KoaAddToStoryNumeric: "numeric", KoaTakeFromStoryNumeric: "numeric", KoaPutTogetherNumeric: "numeric", KoaChooseOpMcq: "mcq", KoaModelStoryMcq: "mcq", KoaSums5Numeric: "numeric", KoaDiffs5Numeric: "numeric", KoaPlusMinusOneNumeric: "numeric", KoaZeroFactNumeric: "numeric", KoaSpeedy5Numeric: "numeric",
  kSeqNextHop: "numberLineHop", kSeqNextMcq: "mcq", kSeqBeforeHop: "numberLineHop", kSeqMissingMcq: "mcq",
  kDecadeCrossHop: "numberLineHop", kDecadeNextMcq: "mcq", kTensNextHop: "numberLineHop", kTensNextMcq: "mcq",
  kTensBackHop: "numberLineHop", kTensOrderDrag: "dragOrder", kChartRowMcq: "mcq", kChartMissingMcq: "mcq",
  kCountFromHop: "numberLineHop", kCountBackHop: "numberLineHop", kSeqOrderDrag: "dragOrder",
  countAddMcq: "mcq", countAddLine: "numberLineHop", countCompareEqualMcq: "mcq", countTensMcq: "mcq", countTensLine: "numberLineHop",
  countObjectsMcq: "mcq", countObjectsFlash: "subitizeFlash", countDecomposeMcq: "mcq", countMakeTenMcq: "mcq", countMoreFewerMcq: "mcq",
  countOrderDrag: "dragOrder", countBetweenMcq: "mcq", countReadMcq: "mcq", countReadFlash: "subitizeFlash", countZeroTap: "tapDiagram",
  countSubtractMcq: "mcq", countSubtractLine: "numberLineHop", countTeenFrame: "tenFrame",
  shapeComposePairs: "matchPairs", shapeComposeMcq: "mcq", shapeComposeTap: "tapDiagram", shapeWeightMcq: "mcq", shapeWeightTap: "tapDiagram",
  shapeLengthCompare: "lengthCompare", shapePositionMcq: "mcq", shapePositionTap: "tapDiagram", shapeRollStackMcq: "mcq", shapeRollStackTap: "tapDiagram",
  shapeAnyWayMcq: "mcq", shapeAnyWayTap: "tapDiagram", shapeSortMcq: "mcq", shapeSortTap: "tapDiagram", shapeSortFrame: "tenFrame",
};
