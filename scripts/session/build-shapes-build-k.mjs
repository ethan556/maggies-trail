#!/usr/bin/env node
// S198 — Batch G course 6/6: shapes-build-k (K.G.A.1-3, K.G.B.4-6). Zero new generator code.
//
// ADAPT-3 ROUTE (per the tier correction measured in course 5): position lessons carry AUTHORED
// position-framed numberLineHops ("the fly waits 3 hops to the right" IS a position statement,
// and authored hops carry no solver constraint); side/edge lessons carry unitRuler i1s (sides
// are lengths — all-3s engine); compose lessons carry authored doubling hops (2 triangles, then
// 2 more). Every lesson also gets the predict + two-traps recipe.
//
// SOLVER-REGEX CONTRACTS (g0Independent, verbatim — authored prompts must match):
//   shapePositionMcq  'What is the opposite position of \u201c{word}\u201d?' (CURLY quotes) ->
//                     opposite from {above:below, below:above, in front of:behind, behind:in front of,
//                     inside:outside, outside:inside, left of:right of, right of:left of}
//   shapePositionTap  'Tap the cat that is (above|below|beside) the table.' -> the hotspot whose
//                     label CONTAINS that relation word; other labels must avoid it
//   shapeComposeMcq   'Two triangles build one square. How many triangles build N squares?' -> 2N
//   shapeComposeTap   correct hotspot labelled EXACTLY 'triangle' (solver filters label==='triangle');
//                     no other hotspot may carry that exact label
//   shapeComposePairs matchPairs drawn verbatim from the 5-entry map: two triangles->a square,
//                     two squares side by side->a rectangle, six squares folded up->a cube,
//                     two half-circles->a circle, four equal triangles->a larger square
//   shapeAnyWayMcq    'A {shape} ...' -> 'Still a {shape}'; any prompt NOT starting 'A ' ->
//                     'Its sides and corners'
//   shapeAnyWayTap    mode selectAll; 'Tap every circle/triangle...' -> every hotspot whose label
//                     contains the target word is correct, the rest are not
//   shapeRollStackMcq 'Why can cans...' -> 'Their flat circle ends rest on one another';
//                     otherwise -> 'A sphere'
//   shapeRollStackTap correct hotspot labelled 'cubes'
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "shapes-build-k");
if (!spec || spec.lessons.length !== 14) throw new Error("spec course missing or wrong size");

let asserts = 0;
const must = (ok, msg) => { asserts++; if (!ok) throw new Error("FACTORY ASSERT: " + msg); };

function corpusTemplate(type, fromCourse = null) {
  const courses = fromCourse ? [fromCourse] : readdirSync(join(root, "content/courses"));
  for (const c of courses) {
    const dir = join(root, "content/courses", c, "lessons");
    let files; try { files = readdirSync(dir).sort(); } catch { continue; }
    for (const f of files) {
      const lesson = JSON.parse(readFileSync(join(dir, f), "utf8"));
      for (const s of lesson.steps) if (s.widget?.type === type) return structuredClone(s.widget);
    }
  }
  throw new Error("no corpus template for " + type);
}
const HOP_T = corpusTemplate("numberLineHop", "counting-to-100-k");
const FRAME_T = corpusTemplate("tenFrame", "add-subtract-10-k");
const TAP_T = corpusTemplate("tapDiagram", "shapes-and-sorting-k");
const RULER_T = corpusTemplate("unitRuler", "measure-length-g1");
const PAIRS_T = corpusTemplate("matchPairs", "shapes-and-sorting-k");

const REG_G0 = new Set(["countAddMcq","countAddLine","countCompareEqualMcq","countTensMcq","countTensLine",
  "countObjectsMcq","countObjectsFlash","countDecomposeMcq","countMakeTenMcq","countMoreFewerMcq",
  "countOrderDrag","countBetweenMcq","countReadMcq","countReadFlash","countZeroTap",
  "countSubtractMcq","countSubtractLine","countTeenFrame"]);
const REG_K100 = new Set(["kSeqNextHop","kSeqNextMcq","kSeqBeforeHop","kSeqMissingMcq","kDecadeCrossHop",
  "kDecadeNextMcq","kTensNextHop","kTensNextMcq","kTensBackHop","kTensOrderDrag","kChartRowMcq",
  "kChartMissingMcq","kCountFromHop","kCountBackHop","kSeqOrderDrag"]);
const REG_SHAPES = new Set(["shapeComposePairs","shapeComposeMcq","shapeComposeTap","shapeWeightMcq","shapeWeightTap",
  "shapeLengthCompare","shapePositionMcq","shapePositionTap","shapeRollStackMcq","shapeRollStackTap",
  "shapeAnyWayMcq","shapeAnyWayTap","shapeSortMcq","shapeSortTap","shapeSortFrame"]);
const REG = { "g0-counting": REG_G0, "k0-count-100": REG_K100, "g0-shapes-sorting": REG_SHAPES };

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seedFromString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const pick = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));

function mcqStep(prompt, correctLabel, wrongs, feedbackByLabel, gen, form) {
  const labels = [correctLabel, ...wrongs];
  must(new Set(labels).size === labels.length, `mcq duplicate labels: ${prompt.slice(0, 40)}`);
  must(labels.length >= 4, `mcq needs >=4 options: ${prompt.slice(0, 40)}`);
  const options = labels.map((label, i) => {
    const fb = feedbackByLabel[label];
    must(fb && fb.length >= 25, `mcq feedback missing/short for "${label}"`);
    return { id: `o${i}`, label, correct: i === 0, feedback: fb };
  });
  must(new Set(options.map((o) => o.feedback)).size === options.length, "mcq feedback not distinct");
  const step = { widget: { type: "mcq", prompt, options } };
  if (gen) { must(REG[gen]?.has(form), `${gen}/${form} NOT registered`); step.variant = { gen, form }; }
  return step;
}

/* ---------------- solver-exact position forms ---------------- */
const OPP = { "above": "below", "below": "above", "in front of": "behind", "behind": "in front of",
  "inside": "outside", "outside": "inside", "left of": "right of", "right of": "left of" };
function PositionMcq(word) {
  const correct = OPP[word];
  must(correct, `no opposite for ${word}`);
  const wrongs = Object.values(OPP).filter((w) => w !== correct && w !== word).slice(0, 3);
  const fb = { [correct]: `Correct — ${correct} names the position directly opposite ${word}.` };
  for (const w of wrongs) fb[w] = `${w} does not reverse the position ${word}. The opposite position is ${correct}.`;
  return mcqStep(`What is the opposite position of \u201c${word}\u201d?`, correct, wrongs, fb,
    "g0-shapes-sorting", "shapePositionMcq");
}
function PositionTap(rel) {
  must(["above", "below", "beside"].includes(rel), "positionTap relation");
  const others = ["above", "below", "beside"].filter((x) => x !== rel);
  const w = structuredClone(TAP_T);
  w.prompt = `Tap the cat that is ${rel} the table.`;
  w.mode = "selectOne"; w.canvas = { w: 3, h: 1 };
  const labels = [others[0], rel, others[1]];
  w.hotspots = labels.map((r2, i) => {
    const label = `cat ${r2} the table`;
    must(!label.includes(","), "tap label comma-free");
    const h = { id: `g${i}`, x: 17 + 33 * i, y: 50, label, icon: "🐈", count: 1, correct: r2 === rel };
    if (r2 !== rel) h.feedback = `This cat is ${r2} the table, which does not match the requested position ${rel}.`;
    return h;
  });
  w.missFeedback = `Position words locate one thing against another — find the cat whose place matches ${rel}.`;
  return { widget: w, variant: { gen: "g0-shapes-sorting", form: "shapePositionTap" } };
}

/* ---------------- solver-exact compose forms ---------------- */
function ComposeMcq(r) {
  const n = pick(r, 2, 5);
  const ans = 2 * n;
  return mcqStep(`Two triangles build one square. How many triangles build ${n} squares?`,
    String(ans), [String(ans - 1), String(n), String(ans + 2)],
    { [String(ans)]: `Correct — ${n} squares need ${n} groups of 2 triangles, which is ${ans}.`,
      [String(ans - 1)]: `That leaves one triangle missing from the final square.`,
      [String(n)]: `${n} counts the squares, but every square needs two triangles, not one.`,
      [String(ans + 2)]: `That builds ${n + 1} squares' worth of triangles — one square too many.` },
    "g0-shapes-sorting", "shapeComposeMcq");
}
function ComposeTap() {
  const w = structuredClone(TAP_T);
  w.prompt = "A sailboat has a pointy sail. Tap the flat shape that can make the sail.";
  w.mode = "selectOne"; w.canvas = { w: 3, h: 1 };
  w.hotspots = [
    { id: "g0", x: 17, y: 50, label: "triangle", icon: "🔺", count: 1, correct: true },
    { id: "g1", x: 50, y: 50, label: "circle", icon: "⚪", count: 1, correct: false,
      feedback: "A circle has one curved edge and does not make the pointy sides of a sail." },
    { id: "g2", x: 83, y: 50, label: "square", icon: "◼️", count: 1, correct: false,
      feedback: "A square's four equal corners cannot narrow to a sail's single point." },
  ];
  must(w.hotspots.filter((h) => h.label === "triangle").length === 1, "exactly one 'triangle' label (solver filters by it)");
  w.missFeedback = "Match the picture's pointed outline to the flat shape that shares it.";
  return { widget: w, variant: { gen: "g0-shapes-sorting", form: "shapeComposeTap" } };
}
const PAIR_MAP = [
  ["two triangles", "a square"],
  ["two squares side by side", "a rectangle"],
  ["six squares folded up", "a cube"],
  ["two half-circles", "a circle"],
  ["four equal triangles", "a larger square"],
];
function ComposePairs(r, count = 4) {
  const idx = [0, 1, 2, 3, 4];
  for (let i = idx.length - 1; i > 0; i--) { const j = pick(r, 0, i); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  const chosen = idx.slice(0, count).map((i) => PAIR_MAP[i]);
  const w = structuredClone(PAIRS_T);
  w.prompt = "Match each group of pieces to the whole shape those pieces can build.";
  w.left = chosen.map(([l], i) => ({ id: `l${i}`, label: l }));
  const rIdx = [...chosen.keys()];
  for (let i = rIdx.length - 1; i > 0; i--) { const j = pick(r, 0, i); [rIdx[i], rIdx[j]] = [rIdx[j], rIdx[i]]; }
  w.right = rIdx.map((k) => ({ id: `r${k}`, label: chosen[k][1] }));
  w.pairs = Object.fromEntries(chosen.map((_, i) => [`l${i}`, `r${i}`]));   // schema: object map, not array
  for (const [l, rv] of chosen) {
    must(PAIR_MAP.some(([a, b]) => a === l && b === rv), "pair must come verbatim from the solver map");
  }
  w.missFeedback = "Picture the pieces sliding together — their combined outline names the whole shape.";
  return { widget: w, variant: { gen: "g0-shapes-sorting", form: "shapeComposePairs" } };
}

/* ---------------- solver-exact any-way & roll/stack forms ---------------- */
function AnyWayStill(shape) {
  const correct = `Still a ${shape}`;
  return mcqStep(`A ${shape} is turned upside down. What is it now?`,
    correct, ["A different shape", "A bigger shape", "No shape at all"],
    { [correct]: `Correct — turning moves a shape without changing its sides and corners, so its name survives.`,
      "A different shape": "The sides and corners all came along for the turn; nothing that names the shape changed.",
      "A bigger shape": "Turning is not growing — every side keeps its length through the spin.",
      "No shape at all": "The shape is all still there, just posed differently on the page." },
    "g0-shapes-sorting", "shapeAnyWayMcq");
}
function AnyWayFeatures() {
  return mcqStep("What features decide the name of a flat shape?",
    "Its sides and corners", ["The direction it points", "Its size", "Its color"],
    { "Its sides and corners": "Correct — the number of sides and corners names the shape, whatever its pose or size.",
      "The direction it points": "Turning a shape does not change its defining sides and corners.",
      "Its size": "A small and a large version can still have the same shape name.",
      "Its color": "Color decorates a shape without touching what it is." },
    "g0-shapes-sorting", "shapeAnyWayMcq");
}
function AnyWayTap(target) {
  must(["circle", "triangle"].includes(target), "anyWayTap target");
  const w = structuredClone(TAP_T);
  w.prompt = `Tap every ${target}, even when its size or direction is different.`;
  w.mode = "selectAll"; w.canvas = { w: 3, h: 1 };
  const icon = target === "circle" ? "⚪" : "🔺";
  const decoy = target === "circle" ? ["square", "◼️"] : ["rectangle", "▬"];
  w.hotspots = [
    { id: "g0", x: 13, y: 50, label: `tiny ${target}`, icon, count: 1, correct: true },
    { id: "g1", x: 38, y: 50, label: `large ${target}`, icon: target === "circle" ? "⭕" : "🔻", count: 1, correct: true },
    { id: "g2", x: 63, y: 50, label: decoy[0], icon: decoy[1], count: 1, correct: false,
      feedback: `This shape's sides and corners belong to a ${decoy[0]}, not a ${target}, whatever its size.` },
    { id: "g3", x: 88, y: 50, label: `upside-down ${target}`, icon, count: 1, correct: true },
  ];
  for (const h of w.hotspots) {
    must(!h.label.includes(","), "tap label comma-free");
    must(h.correct === h.label.includes(target), "correctness must equal label-contains-target (the solver filters by it)");
  }
  w.missFeedback = `Size and direction never rename a shape — every ${target} counts, tiny, large, or flipped.`;
  return { widget: w, variant: { gen: "g0-shapes-sorting", form: "shapeAnyWayTap" } };
}
function RollStackCans() {
  return mcqStep("Why can cans be stacked into a steady tower?",
    "Their flat circle ends rest on one another", ["They are shiny", "They roll well", "They are heavy"],
    { "Their flat circle ends rest on one another": "Correct — stacking needs flat faces meeting flat faces; the cans' circular ends provide them.",
      "They are shiny": "Shine is looks, not structure — a dull can stacks exactly as well.",
      "They roll well": "Rolling is the SIDE surface's talent; stacking uses the flat ends instead.",
      "They are heavy": "Weight without flat faces topples; the flat ends do the steadying." },
    "g0-shapes-sorting", "shapeRollStackMcq");
}
function RollStackSphere() {
  return mcqStep("Which solid rolls most easily because its surface is curved all the way around?",
    "A sphere", ["A cube", "A rectangular prism", "A pyramid"],
    { "A sphere": "Correct — a sphere has a curved surface in every direction, so it rolls easily.",
      "A cube": "A cube rests on flat square faces and does not roll smoothly.",
      "A rectangular prism": "Its flat faces catch the ground and stop the tumble.",
      "A pyramid": "A pyramid sits fast on its flat base and points stubbornly upward." },
    "g0-shapes-sorting", "shapeRollStackMcq");
}
function RollStackTap() {
  const w = structuredClone(TAP_T);
  w.prompt = "Tap the solid blocks that make the most stable tall tower.";
  w.mode = "selectOne"; w.canvas = { w: 3, h: 1 };
  w.hotspots = [
    { id: "g0", x: 17, y: 50, label: "cones", icon: "🔺", count: 3, correct: false,
      feedback: "Cones narrow to points, so they do not make broad, steady layers for a tall tower." },
    { id: "g1", x: 50, y: 50, label: "spheres", icon: "⚽", count: 3, correct: false,
      feedback: "Spheres roll out from under any layer placed on them; curves cannot hold a tower." },
    { id: "g2", x: 83, y: 50, label: "cubes", icon: "🧊", count: 3, correct: true },
  ];
  must(w.hotspots.find((h) => h.correct).label === "cubes", "solver expects the 'cubes' label");
  w.missFeedback = "Towers stand on flat faces meeting flat faces — find the blocks made entirely of them.";
  return { widget: w, variant: { gen: "g0-shapes-sorting", form: "shapeRollStackTap" } };
}

/* ---------------- authored engines ---------------- */
function Ruler(span, thing) {
  const w = structuredClone(RULER_T);
  w.objectStart = 0; w.objectEnd = span;
  w.allowedUnitSizes = [1, 2]; w.targetUnitSize = 1; w.startUnitSize = 1;
  w.requiredPlacements = span;
  w.prompt = `Measure the ${thing}. Align zero with its start, then place ${span} one-unit blocks with no gaps or overlaps.`;
  w.successFeedback = `${span} equal blocks cover the ${thing} exactly — a side is a length, and the block count names it.`;
  w.alignFeedback = "Line up zero with the object's starting end before measuring.";
  w.gapOverlapFeedback = "The blocks must touch end to end — no spaces and no covering the same part twice.";
  w.unitFeedback = "Every block must be the same size, or the count means nothing.";
  must(w.requiredPlacements === w.objectEnd - w.objectStart, "ruler placements must tile the span");
  return w;
}
function hop(prompt, min, max, start, hops, direction, success, landings, low, high) {
  const w = structuredClone(HOP_T);
  const land = direction === "back" ? start - hops : start + hops;
  w.prompt = prompt; w.min = min; w.max = max; w.start = start;
  w.hop = 1; w.hops = hops; w.direction = direction;
  must(land > min && land < max, `hop landing ${land} at the edge`);
  w.successFeedback = success;
  w.missFeedback = `Count ${hops} ${direction === "back" ? "back" : "on"} from ${start}: you land on ${land}.`;
  w.lowFeedback = low; w.highFeedback = high;
  must(low.length >= 25 && high.length >= 25, "hop needs authored low/high feedback");
  w.commonLandings = landings.map(([value, feedback]) => {
    must(value !== land && value >= min && value <= max, `hop trap ${value} invalid`);
    must(feedback.length >= 25, "hop trap feedback short");
    return { value, feedback };
  });
  return { widget: w };
}
const PosHopRight = (at, steps) => hop(
  `The frog sits at ${at}. The fly waits ${steps} hops to the RIGHT. Hop there and tap where the fly sits.`,
  at - 2, at + steps + 2, at, steps, "forward",
  `${at + steps} — "${steps} to the right" is a position told in hops; the line makes it exact.`,
  [[at + steps - 1, `That stops one complete hop too soon. Continue the final 1-unit hop to reach ${at + steps}.`],
   [at + steps + 1, `That goes one complete hop too far. Count just ${steps} hops right from ${at}.`]],
  `Short of the fly — all ${steps} hops rightward are needed.`,
  `Past the fly — RIGHT of ${at} by ${steps} means stopping at ${at + steps}.`);
const PosHopLeft = (at, steps) => hop(
  `The frog sits at ${at}. The fly waits ${steps} hops to the LEFT. Hop there and tap where the fly sits.`,
  at - steps - 2, at + 2, at, steps, "back",
  `${at - steps} — "${steps} to the left" points the hops the other way; left of means smaller on the line.`,
  [[at - steps + 1, `That stops one complete hop too soon. Continue the final 1-unit hop back to reach ${at - steps}.`],
   [at - steps - 1, `That goes one complete hop too far. Count just ${steps} hops left from ${at}.`]],
  `Short of the fly — keep hopping left to ${at - steps}.`,
  `Past the fly — LEFT of ${at} by ${steps} stops at ${at - steps}.`);
const CountHop = (start, n, noun) => hop(
  `Count the ${noun}: start at ${start} and count on ${n}. Tap where you land.`,
  Math.max(0, start - 2), start + n + 2, start, n, "forward",
  `${start + n} — each ${noun.replace(/s$/, "")} takes one hop, and the landing is the count.`,
  [[start + n - 1, `That stops one complete hop too soon. Continue the final 1-unit hop to reach ${start + n}.`],
   [start + n + 1, `That goes one complete hop too far. Count exactly ${n} hops from ${start}.`]],
  `Short of the landing — all ${n} counts are needed to reach ${start + n}.`,
  `Past the landing — the count stops after ${n} hops, on ${start + n}.`);
const DoubleHop = (squares) => hop(
  `Each square needs 2 triangles. Start at 2 and count on ${2 * (squares - 1)} for the rest. Tap the total.`,
  0, 2 * squares + 2, 2, 2 * (squares - 1), "forward",
  `${2 * squares} — two triangles per square, ${squares} squares, and the line adds the pairs.`,
  [[2 * squares - 1, `That stops one complete hop too soon. Continue the final 1-unit hop to reach ${2 * squares}.`],
   [2 * squares + 1, `That goes one complete hop too far. The pairs stop at ${2 * squares}.`]],
  `Short of the total — every square's PAIR must be counted in.`,
  `Past the total — ${squares} squares need exactly ${2 * squares} triangles.`);

function frame(prompt, target, success, traps, miss) {
  const w = structuredClone(FRAME_T);
  w.prompt = prompt; w.target = target; w.preFilled = 0; w.addColor = "sky";
  must(target >= 1 && target <= 10, `tenFrame target ${target}`);
  w.successFeedback = success; w.missFeedback = miss;
  w.commonCounts = traps.map(([count, feedback]) => {
    must(count !== target && count >= 0 && count <= 10, `frame trap ${count}`);
    must(feedback.length >= 25, "frame trap feedback short");
    return { count, feedback };
  });
  must(w.commonCounts.length >= 2, "frame needs 2 traps");
  return w;
}

/* ---------------- authored MCQs ---------------- */
const authored = (prompt, opts) => {
  must(opts.length >= 4 && opts[0][1], "authored mcq shape");
  return mcqStep(prompt, opts[0][0], opts.slice(1).map((o) => o[0]),
    Object.fromEntries(opts.map(([l, , f]) => [l, f])), null, null);
};
const PositionWordsMcq = () => authored("What do position words like ABOVE and BESIDE always need?", [
  ["Two things — one placed against the other", true, "Correct — above is above SOMETHING; position words compare a thing to a landmark."],
  ["Just one thing", false, "Alone, a thing is nowhere in particular; the landmark gives the word its meaning."],
  ["A ruler", false, "Position words locate without measuring — no units required."],
  ["A map", false, "Maps help, but any landmark works: the cup is beside the PLATE."]]);
const SameSpotTwoWordsMcq = () => authored("The cup sits ABOVE the shelf and BELOW the lamp. How can both be true?", [
  ["Each word compares the cup to a different landmark", true, "Correct — position is relative; change the landmark and the true word changes with it."],
  ["One of them must be a lie", false, "Both are honest — they simply answer against different neighbours."],
  ["The cup is in two places", false, "One cup, one spot; two landmarks give it two true descriptions."],
  ["Above and below mean the same", false, "They are opposites — which applies depends on the landmark chosen."]]);
const CornerMcq = () => authored("What is a CORNER of a flat shape?", [
  ["A point where two sides meet", true, "Correct — sides run straight, and where two of them meet, the shape turns: that point is the corner."],
  ["The middle of the shape", false, "The middle floats away from the edges; corners live where sides join."],
  ["Any curved part", false, "Curves have no meeting point; corners belong to straight-sided shapes."],
  ["The biggest side", false, "Sides are the lines themselves; the corner is where two of them touch."]]);
const SideMcq = () => authored("What is a SIDE of a flat shape?", [
  ["One straight edge running corner to corner", true, "Correct — each side is a straight stretch of the outline, ending where the next side begins."],
  ["The inside of the shape", false, "The inside is the filled part; sides are the straight edges around it."],
  ["A dot on the shape", false, "Dots mark corners at most; a side is the whole straight edge between them."],
  ["The shape's shadow", false, "Shadows copy shapes; the side is part of the shape's own outline."]]);
const TriangleCountMcq = () => authored("A triangle — how many sides and how many corners?", [
  ["3 sides and 3 corners", true, "Correct — tri means three: three straight sides meeting at three corners, always together."],
  ["3 sides and 4 corners", false, "Every side-meeting makes one corner; three sides close up with exactly three."],
  ["4 sides and 3 corners", false, "Four sides would build a quadrilateral; the triangle stops at three."],
  ["It depends on the triangle", false, "Skinny or wide, every triangle carries the same three-and-three."]]);
const SquareCountMcq = () => authored("A square — how many sides and how many corners?", [
  ["4 equal sides and 4 corners", true, "Correct — four sides all the same length, meeting at four corners: that is what square means."],
  ["4 sides and 2 corners", false, "Each pair of meeting sides makes a corner; four sides close with four corners."],
  ["3 sides and 3 corners", false, "Three-and-three is the triangle's signature; the square carries four of each."],
  ["5 sides and 5 corners", false, "Five sides would make a pentagon; the square stops at four."]]);
const FlatSolidMcq = () => authored("What separates a FLAT shape from a SOLID shape?", [
  ["Flat lies on paper; solid takes up space you can grasp", true, "Correct — a drawn circle is flat, a ball is solid; the solid has an inside your hand can hold."],
  ["Flat shapes are smaller", false, "A flat shape can be enormous and a solid tiny; the difference is space, not size."],
  ["Solid shapes are heavier", false, "Weight belongs to material; a foam cube is light and still solid."],
  ["There is no difference", false, "Try picking a drawn circle off the page — the ball comes, the drawing stays."]]);
const FaceIsFlatMcq = () => authored("A cube's FACE is which kind of thing?", [
  ["A flat shape — a square — worn on the solid's surface", true, "Correct — solids wear flat shapes as faces: the cube wears six squares."],
  ["A tiny cube", false, "The face has no thickness of its own; it is the flat square skin of one side."],
  ["A corner", false, "Corners are points; the face is the whole flat panel between the edges."],
  ["A shadow", false, "Shadows fall elsewhere; faces belong to the solid itself."]]);
const DrawPlanMcq = () => authored("Drawing a triangle — what must the pencil do?", [
  ["Draw 3 straight sides that close back to the start", true, "Correct — three straight strokes, each ending where the next begins, the last returning home."],
  ["Draw one long curve", false, "Curves make circles and blobs; the triangle asks for straight sides only."],
  ["Draw 3 dots", false, "Dots mark where corners WILL be; the sides between them make the shape."],
  ["Draw 4 sides", false, "A fourth side builds a quadrilateral; the triangle closes after three."]]);
const CloseShapeMcq = () => authored("A drawing has 3 straight sides but a gap where the ends miss. Is it a triangle?", [
  ["Not yet — a shape must close all the way around", true, "Correct — the outline must return to its start; a gap leaks the inside out and unmakes the shape."],
  ["Yes — three sides is enough", false, "Three sides that fail to meet leave an open path, not a shape."],
  ["Yes, if the gap is small", false, "Small or large, a gap breaks the closed outline that defines the shape."],
  ["No drawing is ever a triangle", false, "Close the gap and the drawing becomes a perfectly good triangle."]]);
const SticksMcq = () => authored("Building a square from sticks — what must the sticks be?", [
  ["Four sticks, all the same length", true, "Correct — the square's four equal sides demand four equal sticks, corner to corner."],
  ["Any four sticks", false, "Unequal sticks build a lopsided quadrilateral; EQUAL is part of square."],
  ["Three long sticks", false, "Three sides close into a triangle; the square needs a fourth."],
  ["As many as possible", false, "Extra sticks make extra sides — a pentagon, a hexagon, not a square."]]);
const BiggerFromSmallMcq = () => authored("Four small equal triangles slide together. What can they build?", [
  ["One larger triangle-family shape — such as a bigger square", true, "Correct — small shapes are building blocks; joined without gaps they compose a larger whole."],
  ["Nothing — shapes cannot join", false, "Edges laid against edges merge outlines; composing is exactly how bigger shapes are built."],
  ["A circle", false, "Straight-sided pieces keep straight sides; no curve appears from nowhere."],
  ["Four separate triangles forever", false, "Apart they are four; edge to edge their outlines fuse into one shape."]]);

const H = {
  pos: ["Find the landmark first.", "The word compares to it.", "New landmark, new word."],
  count: ["Touch each corner once.", "Sides run corner to corner.", "Count, then name."],
  same: ["Sides and corners name it.", "Turning changes nothing.", "Size changes nothing."],
  build: ["Edges meet edges.", "Close the outline.", "Pieces compose wholes."],
};

const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "quantity-composition",
  actionGoal: `Name shapes by sides and corners, place them with position words, and compose them edge to edge for ${tag.replace(/-/g, " ")}.`,
  invariants: [`A shape's name lives in its sides and corners — not its size, pose, or color; position words compare a thing to a landmark; and shapes joined edge to edge compose a larger whole — the anchors for ${tag.replace(/-/g, " ")}.`],
  misconceptions: [`Renaming a turned or resized shape, using position words without a landmark, or treating shapes as unjoinable.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `shapes-build-k:${tag}`, delayed: true,
  counterfactualPrompt: "If the shape were turned upside down, which of its sides or corners would disappear?",
});
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

const L = [];
const def = (n, c1, c2, i1, checks, recap, teaser) => L.push({ n, c1, c2, i1, checks, recap, teaser });
const A = (mkOrStep, hints, ev) => {
  const out = typeof mkOrStep === "function" ? mkOrStep() : mkOrStep;
  return { ...(out.widget ? out : { widget: out }), hints, ev };
};

def(1,
  "Position words place one thing against another: the star is ABOVE the box, BELOW the cloud, BESIDE the tree. The landmark makes the word true.",
  "Every position word hides a comparison — above is always above SOMETHING.",
  { rep: "concrete", widget: () => PositionTap("above").widget, variant: PositionTap("above").variant,
    predict: P("\u201cThe cat is above\u201d — is the sentence finished?", [{ id: "no", label: "No — above WHAT?" }, { id: "yes", label: "Yes, it is complete" }], "no",
      "Position words compare; without a landmark, above points at nothing.") },
  [
    A(() => PositionMcq("above"), H.pos, ["Opposites swap places.", "Above flips to below."]),
    A(PositionWordsMcq, H.pos, ["Two things needed.", "Word plus landmark."]),
    A(PosHopRight(4, 3), H.pos, ["Hops tell position.", "Right means forward here."]),
    A(() => PositionTap("below").widget ? PositionTap("below") : null, H.pos, ["Match place to word.", "Check the landmark."]),
  ],
  ["Position words need a landmark.", "Above, below, beside compare.", "The landmark makes the word true."],
  "next: in front, behind, next to.");

def(2,
  "More position words: IN FRONT OF, BEHIND, NEXT TO. Same rule — each one places a thing against its landmark.",
  "Opposites come in pairs: in front of flips to behind, just as above flips to below.",
  { rep: "concrete", widget: () => PositionTap("beside").widget, variant: PositionTap("beside").variant,
    predict: P("The dog is IN FRONT OF the house. Where is the house?", [{ id: "behind", label: "Behind the dog" }, { id: "front", label: "Also in front" }], "behind",
      "Swap the landmark and the word flips to its opposite — in front of becomes behind.") },
  [
    A(() => PositionMcq("in front of"), H.pos, ["Pairs of opposites.", "Flip the landmark, flip the word."]),
    A(() => PositionMcq("behind"), H.pos, ["Behind reverses.", "To in front of."]),
    A(PosHopLeft(9, 3), H.pos, ["Left points the hops back.", "Position on the line."]),
    A(SameSpotTwoWordsMcq, H.pos, ["Two landmarks, two truths.", "Both can hold."]),
  ],
  ["In front, behind, next to compare.", "Opposites come in pairs.", "Swap the landmark, flip the word."],
  "next: describing where shapes sit.");

def(3,
  "Describing position is answering WHERE with a word and a landmark: the circle is beside the square, the triangle above them both.",
  "One thing can wear many position words at once — one for every landmark you pick.",
  { rep: "concrete", widget: () => PositionTap("beside").widget, variant: PositionTap("beside").variant,
    predict: P("A cup sits between shelf and lamp. How many position words can describe it?", [{ id: "many", label: "Many — one per landmark" }, { id: "one", label: "Exactly one" }], "many",
      "Each landmark grants its own true word: above the shelf, below the lamp, beside the vase.") },
  [
    A(SameSpotTwoWordsMcq, H.pos, ["Every landmark, a word.", "All true together."]),
    A(() => PositionMcq("inside"), H.pos, ["Inside flips to outside.", "Another pair."]),
    A(PosHopRight(2, 5), H.pos, ["Describe by hops.", "Five right of two."]),
    A(() => PositionMcq("left of"), H.pos, ["Left of flips to right of.", "The last pair."]),
  ],
  ["Describing position: word plus landmark.", "One thing, many true words.", "Each landmark grants its own."],
  "next: what corners and sides are.");

def(4,
  "Flat shapes are built from SIDES — straight edges — and CORNERS, where two sides meet. Count them and shapes tell their names.",
  "Sides and corners always balance: each new side brings exactly one new corner to a closed shape.",
  { rep: "concrete", widget: () => Ruler(4, "square's side"),
    predict: P("Where exactly does a corner live?", [{ id: "meet", label: "Where two sides meet" }, { id: "middle", label: "In the shape's middle" }], "meet",
      "Corners are meeting points — the outline turns there, from one side onto the next.") },
  [
    A(CornerMcq, H.count, ["Two sides meet.", "The turn is the corner."]),
    A(SideMcq, H.count, ["Straight, corner to corner.", "The outline's stretches."]),
    A(CountHop(3, 3, "corners"), H.count, ["Two shapes' corners.", "Count on across them."]),
    A(AnyWayFeatures, H.same, ["Sides and corners name it.", "Nothing else does."]),
  ],
  ["Sides are straight edges.", "Corners are where sides meet.", "Their counts name the shape."],
  "next: counting corners.");

def(5,
  "Count corners by touching each meeting point once around the shape: a triangle gives three touches, a square four.",
  "The count never changes with size or pose — a giant tilted square still hands you four corners.",
  { rep: "concrete", widget: () => frame("Touch-count a square's corners, then show the count on the frame.", 4,
      "Four — one touch per meeting point, all the way around and stop.",
      [[3, "Three misses a corner; circle the outline once and every meeting point gets a touch."],
       [5, "Five touched a corner twice; each meeting point counts exactly once."]],
      "Around the outline once: each corner, one touch, then stop."),
    predict: P("A square is tilted like a diamond. How many corners now?", [{ id: "four", label: "Still four" }, { id: "more", label: "More than four" }], "four",
      "Tilting moves the corners without making or unmaking any; the count is the shape's own.") },
  [
    A(TriangleCountMcq, H.count, ["Tri means three.", "Three and three."]),
    A(CountHop(4, 4, "corners"), H.count, ["A square, then another.", "Count on to eight."]),
    A(() => AnyWayStill("square"), H.same, ["Tilted is still square.", "Corners survive turning."]),
    A(SquareCountMcq, H.count, ["Four equal sides.", "Four corners with them."]),
  ],
  ["Touch each corner once.", "Triangle three, square four.", "Size and pose never change the count."],
  "next: counting sides.");

def(6,
  "Count sides by running a finger along each straight edge: one, turn at the corner, two, turn — until you arrive back home.",
  "Each side is also a length — lay unit blocks along it and the side becomes a number too.",
  { rep: "concrete", widget: () => Ruler(5, "rectangle's long side"),
    predict: P("Counting a triangle's sides — when do you stop?", [{ id: "home", label: "Back at the starting corner" }, { id: "tired", label: "Whenever you like" }], "home",
      "The outline closes; arriving home means every side has been walked exactly once.") },
  [
    A(SideMcq, H.count, ["Straight stretches.", "Corner to corner."]),
    A(CountHop(3, 4, "sides"), H.count, ["Triangle then square.", "Three, count on four."]),
    A(() => AnyWayStill("triangle"), H.same, ["Flipped, still a triangle.", "Sides came along."]),
    A(TriangleCountMcq, H.count, ["Three sides close it.", "Three corners lock it."]),
  ],
  ["Run the outline edge by edge.", "Turn at each corner.", "Stop when you arrive home."],
  "next: does size change a shape?");

def(7,
  "A tiny square and a giant square share one name, because they share what matters: four equal sides, four corners.",
  "Size is a costume. Measure the sides and the numbers differ — count the sides and the counts agree.",
  { rep: "concrete", widget: () => Ruler(3, "small square's side"),
    predict: P("A square grows to double size. What happens to its name?", [{ id: "same", label: "Still a square" }, { id: "new", label: "It becomes a new shape" }], "same",
      "Growing stretches the sides but keeps four-equal-and-four-corners — the name rides on those.") },
  [
    A(() => AnyWayStill("square"), H.same, ["Bigger, still square.", "Counts unchanged."]),
    A(AnyWayFeatures, H.same, ["Sides and corners decide.", "Size never does."]),
    A(CountHop(4, 4, "corners"), H.count, ["Small square, big square.", "Four and four again."]),
    A(() => AnyWayTap("circle"), H.same, ["Every size counts.", "Tiny, large, flipped."]),
  ],
  ["Size is a costume.", "Sides and corners are the shape.", "Tiny and giant squares share one name."],
  "next: how shapes are alike.");

def(8,
  "Comparing shapes starts with ALIKE: a square and a rectangle both carry four sides and four corners — cousins in the four-family.",
  "Alikeness hides in the counts. Ask both shapes the same questions: how many sides, how many corners?",
  { rep: "concrete", widget: () => AnyWayTap("triangle").widget, variant: AnyWayTap("triangle").variant,
    predict: P("Square and rectangle — what do they share?", [{ id: "four", label: "Four sides and four corners" }, { id: "nothing", label: "Nothing at all" }], "four",
      "Both answer FOUR to the side question and the corner question — that is their family bond.") },
  [
    A(SquareCountMcq, H.count, ["Ask the counts.", "Four and four."]),
    A(() => AnyWayTap("circle"), H.same, ["Family by feature.", "Every circle belongs."]),
    A(CountHop(4, 4, "sides"), H.count, ["Square's four, rectangle's four.", "Counted together."]),
    A(AnyWayFeatures, H.same, ["Shared features, shared family.", "Counts reveal them."]),
  ],
  ["Alike hides in the counts.", "Ask both shapes the same questions.", "Square and rectangle both answer four."],
  "next: how shapes differ.");

def(9,
  "DIFFERENT is the other half: a triangle answers three where the square answers four; a circle answers no straight sides at all.",
  "One honest difference is enough to split two shapes into different names.",
  { rep: "concrete", widget: () => AnyWayTap("circle").widget, variant: AnyWayTap("circle").variant,
    predict: P("Triangle against square — the telling difference?", [{ id: "counts", label: "Three sides against four" }, { id: "color", label: "Their colors" }], "counts",
      "The side count splits them; color decorates without deciding.") },
  [
    A(TriangleCountMcq, H.count, ["Three against four.", "The split that names."]),
    A(() => AnyWayStill("triangle"), H.same, ["Different from square.", "Same as itself, turned."]),
    A(CountHop(3, 1, "extra sides"), H.count, ["From three to four.", "One side apart."]),
    A(SquareCountMcq, H.count, ["The four-family answer.", "Sides and corners."]),
  ],
  ["Different lives in the counts too.", "Three against four splits the names.", "Color never decides."],
  "next: flat shapes and solid shapes.");

def(10,
  "Some shapes lie flat on paper; others take up space you can hold. The drawn circle is FLAT; the ball is SOLID.",
  "Solids wear flat shapes as FACES — a cube wears six squares, and its square faces are why it stacks.",
  { rep: "concrete", widget: () => Ruler(4, "box's edge"),
    predict: P("A ball and a drawn circle — which can your hand pick up?", [{ id: "ball", label: "The ball — it takes up space" }, { id: "both", label: "Both alike" }], "ball",
      "The drawing stays on its page; the solid has an inside for your hand to grasp.") },
  [
    A(FlatSolidMcq, H.build, ["Paper against space.", "Grasp decides."]),
    A(RollStackCans, H.build, ["Flat ends stack.", "That is the why."]),
    A(RollStackTap, H.build, ["All-flat faces tower best.", "Find the cubes."]),
    A(RollStackSphere, H.build, ["Curves roll.", "Everywhere-curved rolls best."]),
  ],
  ["Flat lies on paper.", "Solid takes up space.", "Solids wear flat faces — and flat faces stack."],
  "next: drawing shapes.");

def(11,
  "Drawing a shape is making its rules with a pencil: straight sides, real corners, and an outline that closes back home.",
  "The gap test: if the outline leaks, the shape is not yet born — close it and the name arrives.",
  { rep: "concrete", widget: () => Ruler(4, "drawn side"),
    predict: P("Three straight strokes, but the ends miss. A triangle yet?", [{ id: "no", label: "Not until it closes" }, { id: "yes", label: "Yes — three strokes is enough" }], "no",
      "The outline must return to its start; a gap leaks the inside out.") },
  [
    A(DrawPlanMcq, H.build, ["Three strokes, closing.", "Last returns home."]),
    A(CloseShapeMcq, H.build, ["The gap test.", "Closed or not yet."]),
    A(CountHop(3, 3, "strokes"), H.build, ["Stroke per side.", "Count as you draw."]),
    A(AnyWayFeatures, H.same, ["Drawn right, named right.", "Sides and corners."]),
  ],
  ["Drawing makes the rules real.", "Straight sides, true corners.", "Close the outline — then it is born."],
  "next: building with sticks.");

def(12,
  "Sticks build shapes the honest way: each stick one side, each meeting one corner. A triangle takes three sticks, a square four equal ones.",
  "The sticks expose the rules — unequal sticks refuse to make a square, and two sticks refuse to close at all.",
  { rep: "concrete", widget: () => Ruler(4, "stick"),
    predict: P("Two sticks only — can they close into a shape?", [{ id: "no", label: "No — nothing closes with two" }, { id: "yes", label: "Yes, a thin shape" }], "no",
      "Two straight sticks can meet at most at their ends and leave the rest open; closing needs a third.") },
  [
    A(SticksMcq, H.build, ["Four equal for a square.", "Equal is the rule."]),
    A(CountHop(3, 1, "sticks"), H.build, ["Triangle's three, then one more.", "Four makes the square."]),
    A(() => AnyWayStill("square"), H.same, ["Built and turned.", "Still a square."]),
    A(TriangleCountMcq, H.count, ["Three sticks, three corners.", "The build proves it."]),
  ],
  ["One stick, one side.", "One meeting, one corner.", "The sticks expose the shape's rules."],
  "next: two shapes becoming one.");

def(13,
  "Shapes compose: slide two triangles together along their long sides and a SQUARE appears — two pieces, one new outline.",
  "Two triangles per square, always. Build more squares and the triangles count up in twos.",
  { rep: "concrete", widget: () => ComposeTap().widget, variant: ComposeTap().variant,
    predict: P("Two triangles slide together edge to edge. What can appear?", [{ id: "square", label: "A square" }, { id: "circle", label: "A circle" }], "square",
      "Their outlines fuse along the shared edge; the straight sides compose a square, never a curve.") },
  [
    A((r => () => ComposeMcq(r))(mulberry32(seedFromString("kgb13-k1"))), H.build, ["Two per square.", "Count in twos."]),
    A((r => () => ComposePairs(r))(mulberry32(seedFromString("kgb13-k2"))), H.build, ["Pieces to wholes.", "Picture them sliding."]),
    A(DoubleHop(2), H.build, ["Two, then two more.", "The line adds pairs."]),
    A(BiggerFromSmallMcq, H.build, ["Small builds large.", "Edge against edge."]),
  ],
  ["Shapes compose edge to edge.", "Two triangles make a square.", "More squares, twos counting up."],
  "next: building bigger from smaller.");

def(14,
  "Composition scales: four small triangles build a bigger square; small squares row up into a rectangle; six squares fold into a cube.",
  "Every big shape is a promise that smaller ones can build it — composing runs as far as the pieces last.",
  { rep: "concrete", widget: () => ComposeTap().widget, variant: ComposeTap().variant,
    predict: P("Four small equal triangles, joined without gaps. What can they build?", [{ id: "big", label: "A larger shape — such as a bigger square" }, { id: "none", label: "Nothing larger" }], "big",
      "Small shapes are building blocks — edge to edge, their outlines fuse into one larger whole.") },
  [
    A((r => () => ComposePairs(r))(mulberry32(seedFromString("kgb14-k1"))), H.build, ["The whole map of builds.", "Pieces to wholes."]),
    A((r => () => ComposeMcq(r))(mulberry32(seedFromString("kgb14-k2"))), H.build, ["Twos scale up.", "Squares by pairs."]),
    A(DoubleHop(3), H.build, ["Three squares of triangles.", "Pairs to six."]),
    A(BiggerFromSmallMcq, H.build, ["Composing scales.", "As far as pieces last."]),
  ],
  ["Four small triangles, one bigger square.", "Six squares fold into a cube.", "Composing runs as far as pieces last."],
  "course complete: shapes named, placed, and built.");

/* ------------------------------------------------------------------- assembly */
must(L.length === 14, `14 lessons defined, got ${L.length}`);
const chapterTitles = ["Where Shapes Sit", "Naming by Counts", "Building Shapes"];
const perChapter = [5, 5, 4];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 5 ? 1 : n <= 10 ? 2 : 3);
const outDir = join(root, "content/courses/shapes-build-k");
mkdirSync(join(outDir, "lessons"), { recursive: true });

const ADAPT3 = new Set(["unitRuler", "balanceScale", "numberLineHop"]);

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seqN = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `kgb-0${ch}-${String(seqN).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => {
    must(c && c.widget, `${id}/${sid}: check has no widget`);
    const step = { id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
      explanationVariants: c.ev && c.ev.length >= 2 ? c.ev : [...(c.ev ?? []), "Sides and corners name a shape; a landmark anchors a position word; edges joined compose a whole."].slice(0, 3),
      widget: c.widget, hints: c.hints, cml: cml(tag, "concrete") };
    if (c.variant) step.variant = c.variant;
    return step;
  };

  const mkI1 = () => (typeof d.i1.widget === "function" ? d.i1.widget() : structuredClone(d.i1.widget));
  const i1raw = mkI1();
  const i1w = i1raw.widget ?? i1raw;
  const i1variant = i1raw.variant ?? d.i1.variant ?? null;
  const i2raw = mkI1();
  const i2w = i2raw.widget ?? i2raw;
  const lesson = {
    id, slug, title: row.title, courseId: "shapes-build-k",
    chapterId: chapters[ch - 1].id, minutes: 6, readingProfile: "early",
    steps: [
      { id: "c1", kind: "concept", figure: "count-on-hops", body: d.c1, narration: d.c1 },
      { id: "i1", kind: "interactive", body: "Try it.", conceptTag: tag, widget: i1w,
        ...(i1variant ? { variant: i1variant } : {}), predict: d.i1.predict, cml: cml(tag, d.i1.rep) },
      stepFromCheck("k1", d.checks[0]),
      { id: "c2", kind: "concept", figure: "count-on-hops", body: d.c2, narration: d.c2 },
      { id: "i2", kind: "interactive", body: "Try it again.", conceptTag: tag, widget: i2w,
        ...(i1variant ? { variant: i1variant } : {}), cml: cml(tag, "concrete") },
      stepFromCheck("k2", d.checks[1]),
      stepFromCheck("k3", d.checks[2]),
      stepFromCheck("ch1", d.checks[3], "challenge"),
      { id: "r1", kind: "recap", body: "You did it!", takeaways: d.recap, teaser: d.teaser },
    ],
    remedials: [{
      conceptTag: tag,
      concept: { id: `rem-${tag}-c`, kind: "concept", body: d.c2, narration: d.c2 },
      check: { id: `rem-${tag}-k`, kind: "check", body: "", conceptTag: tag,
        explanationVariants: d.checks[0].ev && d.checks[0].ev.length >= 2 ? d.checks[0].ev : [...(d.checks[0].ev ?? []), "Count the sides and corners — they name the shape whatever its pose."].slice(0, 3),
        widget: d.checks[0].widget },
    }],
  };

  must(lesson.steps[1].predict, `${id}: i1 must carry a predict step`);
  must(lesson.steps.some((s) => s.widget && ADAPT3.has(s.widget.type)),
    `${id}: needs an adapt-3 engine (unitRuler, balanceScale, or numberLineHop)`);
  const wc = (t) => t.split(/\s+/).filter(Boolean).length;
  for (const s of lesson.steps) {
    if (s.kind === "concept") must(wc(s.body) <= 25, `${id}/${s.id}: concept body ${wc(s.body)} words > early cap 25`);
    const w = s.widget;
    if (!w) continue;
    if (w.type === "mcq") {
      must(w.options.filter((o) => o.correct).length === 1 && w.options.length >= 4 && w.options[0].correct === true, `${id}/${s.id} mcq shape`);
      for (const o of w.options) must(o.feedback.length >= 25, `${id}/${s.id} feedback short`);
      if (s.variant?.form === "shapePositionMcq") {
        const m = w.prompt.match(/\u201c(.+?)\u201d/);
        must(m && OPP[m[1]] === w.options[0].label, `${id}/${s.id} positionMcq answer must be the map opposite`);
      }
      if (s.variant?.form === "shapeComposeMcq" && /How many triangles build (\d+)/.test(w.prompt)) {
        const n = Number(w.prompt.match(/build (\d+) squares/)[1]);
        must(w.options[0].label === String(2 * n), `${id}/${s.id} composeMcq answer must be 2N`);
      }
      if (s.variant?.form === "shapeAnyWayMcq") {
        if (w.prompt.startsWith("A ")) {
          const shape = w.prompt.match(/^A (\w+)/)[1];
          must(w.options[0].label === `Still a ${shape}`, `${id}/${s.id} anyWay still-branch answer`);
        } else {
          must(w.options[0].label === "Its sides and corners", `${id}/${s.id} anyWay features-branch answer`);
        }
      }
      if (s.variant?.form === "shapeRollStackMcq") {
        must(w.options[0].label === (w.prompt.startsWith("Why can cans") ? "Their flat circle ends rest on one another" : "A sphere"),
          `${id}/${s.id} rollStack answer branch`);
      }
    }
    if (w.type === "tapDiagram") {
      const correctN = w.hotspots.filter((h) => h.correct).length;
      if (w.mode === "selectAll") must(correctN >= 1 && correctN < w.hotspots.length, `${id}/${s.id} selectAll needs correct and wrong`);
      else must(correctN === 1, `${id}/${s.id} selectOne needs exactly one correct`);
      for (const h of w.hotspots) {
        must(!h.label.includes(","), `${id}/${s.id} tap label comma`);
        if (!h.correct) must((h.feedback ?? "").length >= 25, `${id}/${s.id} tap wrong needs feedback`);
      }
      if (s.variant?.form === "shapePositionTap") {
        const rel = w.prompt.match(/is (above|below|beside) the table/)[1];
        for (const h of w.hotspots) must(h.correct === h.label.includes(rel), `${id}/${s.id} positionTap label-contains rule`);
      }
      if (s.variant?.form === "shapeComposeTap") {
        must(w.hotspots.filter((h) => h.label === "triangle").length === 1 &&
          w.hotspots.find((h) => h.label === "triangle").correct, `${id}/${s.id} composeTap triangle rule`);
      }
      if (s.variant?.form === "shapeAnyWayTap") {
        const target = w.prompt.includes("circle") ? "circle" : "triangle";
        for (const h of w.hotspots) must(h.correct === h.label.includes(target), `${id}/${s.id} anyWayTap contains rule`);
      }
      if (s.variant?.form === "shapeRollStackTap") {
        must(w.hotspots.find((h) => h.correct).label === "cubes", `${id}/${s.id} rollStackTap cubes rule`);
      }
    }
    if (w.type === "matchPairs") {
      must(w.left.length >= 3 && Object.keys(w.pairs).length === w.left.length, `${id}/${s.id} pairs shape`);
      const rightById = new Map(w.right.map((x) => [x.id, x.label]));
      const leftById = new Map(w.left.map((x) => [x.id, x.label]));
      for (const [pl, pr] of Object.entries(w.pairs)) {
        const l = leftById.get(pl), rv = rightById.get(pr);
        must(PAIR_MAP.some(([a, b]) => a === l && b === rv), `${id}/${s.id} pair (${l} -> ${rv}) not in the solver map`);
      }
    }
    if (w.type === "numberLineHop") {
      const land = w.direction === "back" ? w.start - w.hop * w.hops : w.start + w.hop * w.hops;
      must(land > w.min && land < w.max, `${id}/${s.id} hop landing at the edge`);
      must(w.commonLandings.length >= 2, `${id}/${s.id} hop needs 2 traps`);
    }
    if (w.type === "tenFrame") {
      must(w.target >= 1 && w.target <= 10 && w.commonCounts.length >= 2, `${id}/${s.id} frame shape`);
    }
    if (w.type === "unitRuler") {
      must(w.requiredPlacements === (w.objectEnd - w.objectStart) / w.targetUnitSize, `${id}/${s.id} ruler tiling`);
    }
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
    if (s.variant) must(REG[s.variant.gen]?.has(s.variant.form), `${id}/${s.id} ${s.variant.gen}/${s.variant.form} not registered`);
  }
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c, i) => c === perChapter[i]), `chapter sizes ${chCount}`);
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "shapes-build-k", slug: "shapes-build-k", title: spec.title,
  tagline: "Name them by counts, place them with words, build them edge to edge.",
  category: "Math", gradeLevel: 0, chapters,
}, null, 2) + "\n");
console.log(`built 14 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
