#!/usr/bin/env node
// S192 — PROTOCOL v3, Batch B course 3/3: compose-shapes-g1 (1.G.A.1, 1.G.A.2).
//
// FIT-CHECK RESULT — third consecutive deviation from HANDOVER's Batch B table ("g1-shapes-measure
// has no compose/decompose form; needs new forms"). Findings at build time:
//   1. The DEFINING-ATTRIBUTE half of 1.G.A.1 is already fully covered by registered forms:
//        Smg1ShapeSidesNumeric  -> sides/corners of a triangle|square|rectangle|circle
//        Smg1SolidPartsNumeric  -> flat faces / edges of a cube|cone|cylinder|sphere
//        Smg12D3DMcq            -> 2D vs 3D
//      (Route bodies read directly from g1Independent.cjs, not assumed.)
//   2. The COMPOSE half of 1.G.A.2 does not want a numeric generator. Composition is a spatial
//      act, so it is authored on shipped manipulatives (tapDiagram / dragBucket / matchPairs).
//      Where a graded numeric IS appropriate, it asks for sides/corners of the RESULTING shape —
//      which is exactly what Smg1ShapeSidesNumeric parses, and is honest content: composing and
//      then counting the result's attributes is the standard's own reasoning.
//   3. REJECTED SHORTCUT: g0-shapes-sorting registers shapeComposePairs/shapeComposeMcq, which
//      look like a perfect fit. No G1 course in the corpus declares a g0-* tag, so adopting one
//      would introduce cross-band tag reuse on a hunch. Not done.
// Compose targets outside the route table (hexagon, trapezoid) are MCQs, never numerics — the
// numeric route only recognises triangle|square|rectangle|circle.
// Net: ZERO new generator code; no edits to variants.ts / g1Variants.ts / g1Independent.cjs.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "compose-shapes-g1");
if (!spec || spec.lessons.length !== 10) throw new Error("spec course missing or wrong size");

let asserts = 0;
const must = (ok, msg) => { asserts++; if (!ok) throw new Error("FACTORY ASSERT: " + msg); };

const REGISTERED = new Set([
  "Smg12D3DMcq","Smg12D3DNumeric","Smg1HalvesFractionBar","Smg1FourthsFractionBar",
  "Smg1HalvesNumeric","Smg1FourthsNumeric","Smg1HalvesMcq","Smg1FourthsMcq",
  "Smg1HalvesFourthsNumeric","Smg1HalvesFourthsMcq","Smg1LengthDifferenceNumeric",
  "Smg1ShapeSidesNumeric","Smg1ShapeSidesMcq","Smg1SolidPartsNumeric","Smg1SolidPartsMcq",
]);
// Truth tables mirrored from g1Independent.cjs. The factory computes answers from THESE, and the
// session test re-derives them with the REAL solver — so a mismatch is caught, not hidden.
const FLAT = { triangle: { sides: 3, corners: 3 }, square: { sides: 4, corners: 4 },
               rectangle: { sides: 4, corners: 4 }, circle: { sides: 0, corners: 0 } };
const SOLID = { cube: { faces: 6, edges: 12 }, cone: { faces: 1, edges: 1 },
                cylinder: { faces: 2, edges: 2 }, sphere: { faces: 0, edges: 0 } };

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
const choose = (r, arr) => arr[pick(r, 0, arr.length - 1)];

/* ---- numeric mirrors: prompts MUST contain "a <shape>" for the route regex ---- */
function ShapeSidesNumeric(r) {
  const shape = choose(r, ["triangle", "square", "rectangle"]); // circle excluded: 0 sides gives degenerate traps
  const want = choose(r, ["sides", "corners"]);
  const answer = FLAT[shape][want];
  const other = want === "sides" ? "corners" : "sides";
  const traps = [];
  if (answer + 1 !== answer) traps.push([answer + 1, `That counts one more ${want} than a ${shape} actually has; trace around it once and stop where you began.`]);
  if (answer - 1 !== answer && answer - 1 >= 0) traps.push([answer - 1, `That misses one ${want}; the last one closes the ${shape} back to the start.`]);
  must(traps.length >= 2, "ShapeSidesNumeric traps");
  return { form: "Smg1ShapeSidesNumeric",
    prompt: `How many ${want} does a ${shape} have?`, answer,
    commonErrors: traps.slice(0, 2), note: other };
}
function ComposedShapeSidesNumeric(r) {
  // Compose first, then count the RESULT's attributes. The result is always in the route table.
  const cases = [
    { made: "square", from: "Two triangles are joined along their long edges to make a square." },
    { made: "rectangle", from: "Two squares are pushed together side by side to make a rectangle." },
    { made: "triangle", from: "A square is cut along one diagonal, leaving a triangle." },
  ];
  const c = choose(r, cases);
  const want = choose(r, ["sides", "corners"]);
  const answer = FLAT[c.made][want];
  return { form: "Smg1ShapeSidesNumeric",
    prompt: `${c.from} How many ${want} does a ${c.made} have?`, answer,
    commonErrors: [
      [answer + 2, `That counts the ${want} of both starting pieces; joining them hides the edges that meet inside.`],
      [answer - 1, `That misses one ${want} of the finished ${c.made}; count all the way around the outside.`],
    ] };
}
function SolidPartsNumeric(r) {
  const shape = choose(r, ["cube", "cone", "cylinder"]); // sphere excluded: 0 faces gives degenerate traps
  const want = choose(r, ["flat faces", "edges"]);
  const key = want === "flat faces" ? "faces" : "edges";
  const answer = SOLID[shape][key];
  const traps = [];
  if (answer + 1 !== answer) traps.push([answer + 1, `That counts one part more than a ${shape} has; check each ${want.replace("flat ", "")} once only.`]);
  if (answer - 1 >= 0 && answer - 1 !== answer) traps.push([answer - 1, `That leaves one of the ${shape}'s ${want} uncounted.`]);
  must(traps.length >= 2, "SolidPartsNumeric traps");
  return { form: "Smg1SolidPartsNumeric",
    prompt: `How many ${want} does a ${shape} have?`, answer, commonErrors: traps.slice(0, 2) };
}

/* ---- MCQ mirrors ---- */
function DefiningMcq(r) {
  const shape = choose(r, ["triangle", "square", "rectangle"]);
  const n = FLAT[shape].sides;
  const opts = [
    { label: `Having ${n} straight sides`, correct: true, feedback: `Correct — the number of straight sides is what makes a shape a ${shape}, whatever it looks like otherwise.` },
    { label: `Being red`, correct: false, feedback: `Color can change freely without the shape changing; it is not a defining attribute.` },
    { label: `Being large`, correct: false, feedback: `Size can change freely without the shape changing; a tiny ${shape} is still a ${shape}.` },
    { label: `Pointing upward`, correct: false, feedback: `Turning a shape does not change what it is; orientation is not a defining attribute.` },
  ];
  return { form: "Smg1ShapeSidesMcq", prompt: `What makes a shape a ${shape}?`, options: opts };
}
function NonDefiningMcq(r) {
  const shape = choose(r, ["triangle", "square", "rectangle"]);
  const opts = [
    { label: `Its color`, correct: true, feedback: `Correct — color can change to anything and the shape is still a ${shape}.` },
    { label: `Its number of sides`, correct: false, feedback: `Change the number of sides and it stops being a ${shape} — that attribute defines it.` },
    { label: `Its number of corners`, correct: false, feedback: `Corners are a defining attribute; changing them changes what the shape is.` },
    { label: `Whether its sides are straight`, correct: false, feedback: `Straight sides are part of what a ${shape} is; curving them makes a different shape.` },
  ];
  return { form: "Smg1ShapeSidesMcq", prompt: `Which of these can change WITHOUT a ${shape} stopping being a ${shape}?`, options: opts };
}
function ComposeTwoMcq(r) {
  const cases = [
    { a: "two triangles", made: "square", why: "their long edges match exactly" },
    { a: "two squares", made: "rectangle", why: "they share one full side" },
    { a: "six triangles", made: "hexagon", why: "they meet at a single centre point" },
  ];
  const c = choose(r, cases);
  const wrong = ["circle", "cone", "sphere"].filter((w) => w !== c.made);
  const opts = [
    { label: `A ${c.made}`, correct: true, feedback: `Correct — joining ${c.a} makes a ${c.made} because ${c.why}.` },
    { label: `A ${wrong[0]}`, correct: false, feedback: `Straight-sided pieces cannot join into a ${wrong[0]}; every edge they contribute stays straight.` },
    { label: `A ${wrong[1]}`, correct: false, feedback: `That is a solid, but joining flat pieces edge to edge keeps the result flat.` },
    { label: `Nothing — shapes cannot be joined`, correct: false, feedback: `Shapes combine readily; a new, larger shape is exactly what composing produces.` },
  ];
  return { form: "Smg1ShapeSidesMcq", prompt: `What new shape do ${c.a} make when joined?`, options: opts };
}
function DecomposeMcq(r) {
  const cases = [
    { whole: "square", into: "two triangles", how: "cut along a diagonal" },
    { whole: "rectangle", into: "two squares", how: "cut straight down the middle" },
    { whole: "hexagon", into: "six triangles", how: "cut from the centre to each corner" },
  ];
  const c = choose(r, cases);
  const opts = [
    { label: `Into ${c.into}`, correct: true, feedback: `Correct — ${c.how} and the ${c.whole} separates into ${c.into}.` },
    { label: `Into nothing — it is one piece`, correct: false, feedback: `Any shape can be cut into smaller shapes; being one piece now does not prevent it.` },
    { label: `Into a circle`, correct: false, feedback: `Straight cuts produce straight edges, so a round piece cannot appear.` },
    { label: `Into a cube`, correct: false, feedback: `A cube is a solid; cutting a flat shape leaves flat pieces.` },
  ];
  return { form: "Smg1ShapeSidesMcq", prompt: `How can a ${c.whole} be taken apart?`, options: opts };
}
function TwoDThreeDMcq(r) {
  const solid = choose(r, ["cube", "cone", "cylinder", "sphere"]);
  const opts = [
    { label: `3D`, correct: true, feedback: `Correct — a ${solid} is a solid: it takes up space and cannot lie flat on the page.` },
    { label: `2D`, correct: false, feedback: `A ${solid} has thickness, so it is a solid rather than a flat shape.` },
    { label: `Neither`, correct: false, feedback: `Every shape here is either flat or solid; a ${solid} is one of them.` },
    { label: `Both at once`, correct: false, feedback: `A shape is flat or solid, not both; a ${solid} takes up space.` },
  ];
  return { form: "Smg12D3DMcq", prompt: `Is a ${solid} a flat (2D) shape or a solid (3D) shape?`, options: opts };
}
function FillOutlineMcq(r) {
  const n = pick(r, 4, 8);
  const opts = [
    { label: `Cover it completely with no gaps or overlaps`, correct: true, feedback: `Correct — the pieces must cover the whole outline exactly, leaving no space and never stacking.` },
    { label: `Leave small gaps between pieces`, correct: false, feedback: `Gaps mean part of the outline is not covered, so the shape is not truly filled.` },
    { label: `Stack pieces on top of each other`, correct: false, feedback: `Overlapping covers the same region twice and leaves other parts bare.` },
    { label: `Use pieces of any size at random`, correct: false, feedback: `Pieces must fit the outline exactly; random sizes will not close it without gaps.` },
  ];
  return { form: "Smg1ShapeSidesMcq", prompt: `You fill an outline with ${n} pattern blocks. What must be true when you finish?`, options: opts };
}

const REUSE = { ShapeSidesNumeric, ComposedShapeSidesNumeric, SolidPartsNumeric,
  DefiningMcq, NonDefiningMcq, ComposeTwoMcq, DecomposeMcq, TwoDThreeDMcq, FillOutlineMcq };

function reused(mirror, seedStr, hints, ev,
                fallback = "Look again at the shape's sides and corners, counting each one exactly once.") {
  const r = mulberry32(seedFromString(seedStr));
  const out = REUSE[mirror](r);
  must(REGISTERED.has(out.form), `${mirror}: form ${out.form} is NOT registered`);
  if (out.options) {
    must(out.options.length >= 4, `${mirror} needs >=4 options`);
    must(out.options.filter((o) => o.correct).length === 1, `${mirror} mcq correct count`);
    must(out.options[0].correct === true, `${mirror} correct option must stay at index 0`);
    must(new Set(out.options.map((o) => o.label)).size === out.options.length, `${mirror} duplicate labels`);
    const withIds = out.options.map((o, i) => ({ id: `o${i}`, ...o }));
    for (const o of withIds) must(o.feedback.length >= 25, `${mirror} feedback too short`);
    must(new Set(withIds.map((o) => o.feedback)).size === withIds.length, `${mirror} feedback not distinct`);
    return { variant: { gen: "g1-shapes-measure", form: out.form },
      widget: { type: "mcq", prompt: out.prompt, options: withIds }, hints, ev };
  }
  const commonErrors = out.commonErrors
    .filter(([v]) => v !== out.answer && v >= 0)
    .map(([value, feedback]) => { must(feedback.length >= 25, `${mirror} trap feedback short`); return { value, feedback }; });
  must(commonErrors.length >= 2, `${mirror} needs 2 live traps`);
  must(new Set(commonErrors.map((e) => e.value)).size === commonErrors.length, `${mirror} duplicate traps`);
  return { variant: { gen: "g1-shapes-measure", form: out.form },
    widget: { type: "numeric", prompt: out.prompt, answer: out.answer, tolerance: 0, unit: "", commonErrors,
      fallbackFeedback: fallback, successFeedback: `Correct — the count is ${out.answer}.` },
    hints, ev };
}

/* ---- manipulatives ---- */
function tapShape(prompt, options, success, miss) {
  must(options.filter((o) => o.correct).length === 1, "tapShape needs exactly one correct hotspot");
  must(options.length >= 3, "tapShape needs >=3 hotspots");
  const step = Math.floor(100 / (options.length + 1));
  const hotspots = options.map((o, i) => {
    const h = { id: `h${i + 1}`, x: step * (i + 1), y: 50, label: o.label, icon: o.icon, count: 1 };
    if (o.correct) h.correct = true;
    else { must(o.feedback.length >= 25, "tapShape distractor feedback short"); h.feedback = o.feedback; }
    return h;
  });
  return { type: "tapDiagram", mode: "selectOne", canvas: { w: options.length, h: 1 }, prompt, hotspots,
    missFeedback: miss, successFeedback: success };
}
function sortBuckets(prompt, bucketA, bucketB, items, success, miss) {
  must(items.length >= 4, "sortBuckets needs >=4 items");
  must(items.some((i) => i.bucket === "a") && items.some((i) => i.bucket === "b"), "sortBuckets needs both buckets used");
  return { type: "dragBucket", prompt,
    buckets: [{ id: "a", label: bucketA }, { id: "b", label: bucketB }],
    items: items.map((it, i) => {
      must(it.feedback.length >= 25, "sortBuckets item feedback short");
      return { id: `d${i + 1}`, label: it.label, bucketId: it.bucket, feedback: it.feedback };
    }),
    missFeedback: miss, successFeedback: success };
}

const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "spatial-invariance",
  actionGoal: `Manipulate the model and track how it represents ${tag.replace(/-/g, " ")}.`,
  invariants: [`A shape's defining attributes must stay fixed while colour, size and orientation vary.`],
  misconceptions: [`Treating colour, size or orientation as if it decided what a shape is.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `compose-shapes-g1:${tag}`, delayed: true,
  counterfactualPrompt: "What change would make the model stop representing the same shape?",
});
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

const H = {
  def: ["Look at sides and corners.", "Those are the defining attributes.", "Colour and size are not."],
  nond: ["Ask what can change freely.", "Colour, size and turning can.", "Sides and corners cannot."],
  comp: ["Look at which edges match.", "Joined edges disappear inside.", "Count around the new outside."],
  dec: ["A cut makes smaller shapes.", "Straight cuts give straight edges.", "The pieces rebuild the whole."],
  solid: ["Solids take up space.", "Count flat faces or edges.", "Each part once only."],
};

const L = [];
// i2 (optional): a genuinely DIFFERENT second manipulative. The sorting lessons previously
// repeated the same dragBucket for both interactive steps; a distinct tapDiagram gives the
// learner a second way into the same idea instead of the identical task twice.
const def = (n, c1, c2, i1, checks, recap, teaser, i2) => L.push({ n, c1, c2, i1, checks, recap, teaser, i2 });

def(1,
  "A shape is decided by its defining attributes: how many straight sides it has and how many corners. Those are the parts that cannot change.",
  "Count the sides and corners and you can name the shape, whatever colour or size it happens to be.",
  { rep: "diagram", widget: () => tapShape("Tap the shape with exactly 3 straight sides.",
      [{ label: "triangle", icon: "🔺", correct: true },
       { label: "square", icon: "🟦", feedback: "A square has 4 straight sides — the 3-sided one is the triangle." },
       { label: "circle", icon: "⚪", feedback: "A circle has no straight sides at all; it curves the whole way round." },
       { label: "rectangle", icon: "▬", feedback: "A rectangle has 4 straight sides — count again for the 3-sided shape." }],
      "Yes — 3 straight sides and 3 corners make a triangle.", "Count the straight sides on each shape, then tap the one with 3."),
    predict: P("Two triangles are different colours and sizes. Are they both still triangles?", [{ id: "yes", label: "Yes — both triangles" }, { id: "no", label: "No — colour changes it" }], "yes",
      "Only sides and corners decide the shape, so colour and size can differ freely.") },
  [
    reused("ShapeSidesNumeric", "g1s1-k1", H.def, ["Sides and corners define a shape.", "Count each one exactly once."]),
    reused("DefiningMcq", "g1s1-k2", H.def, ["Defining attributes cannot change.", "Sides and corners are defining."]),
    reused("ShapeSidesNumeric", "g1s1-k3", H.def, ["Trace around and stop where you began.", "That count names the shape."]),
    reused("ShapeSidesNumeric", "g1s1-ch1", H.def, ["Every closed shape's sides and corners match.", "Count carefully around the outside."]),
  ],
  ["Sides and corners define a shape.", "Count each exactly once.", "That count names the shape."],
  "next: what does not count.");

def(2,
  "Colour, size and which way a shape points are non-defining attributes. Change any of them and the shape stays exactly what it was.",
  "A tiny red triangle turned upside down is still a triangle, because its sides and corners never changed.",
  { rep: "diagram", widget: () => tapShape("All four are triangles. Tap the one that is still a triangle after being turned upside down.",
      [{ label: "upside-down triangle", icon: "🔻", correct: true },
       { label: "circle", icon: "⚪", feedback: "A circle is not a triangle at all — it has no straight sides." },
       { label: "square", icon: "🟦", feedback: "A square has 4 sides, so turning it never makes it a triangle." },
       { label: "rectangle", icon: "▬", feedback: "A rectangle has 4 sides; turning changes nothing about that." }],
      "Yes — turning a triangle leaves all 3 sides and 3 corners exactly as they were.", "Turning never changes sides or corners — look for the 3-sided shape."),
    predict: P("A square is painted a new colour. What happens to its number of sides?", [{ id: "same", label: "It stays 4" }, { id: "change", label: "It changes" }], "same",
      "Colour is non-defining; the sides are untouched by it.") },
  [
    reused("NonDefiningMcq", "g1s2-k1", H.nond, ["Ask what can change freely.", "Colour and size can."]),
    reused("ShapeSidesNumeric", "g1s2-k2", H.nond, ["Sides stay fixed under recolouring.", "Count them to confirm."]),
    reused("NonDefiningMcq", "g1s2-k3", H.nond, ["Non-defining attributes vary freely.", "Defining ones never do."]),
    reused("DefiningMcq", "g1s2-ch1", H.def, ["Defining attributes make the shape.", "Everything else is decoration."]),
  ],
  ["Colour, size and turning are non-defining.", "They can change freely.", "Sides and corners cannot."],
  "next: sorting by what matters.");

def(3,
  "Sorting by a defining attribute puts shapes into groups that really are alike: all the 3-sided shapes together, all the 4-sided ones together.",
  "Sorting by colour makes groups too, but they are not shape groups — the same shape can end up in different piles.",
  { rep: "diagram", widget: () => sortBuckets("Sort each shape by its number of straight sides.", "3 straight sides", "4 straight sides",
      [{ label: "triangle", bucket: "a", feedback: "Three straight sides and three corners — a triangle." },
       { label: "square", bucket: "b", feedback: "Four equal straight sides — a square belongs with the 4-sided shapes." },
       { label: "rectangle", bucket: "b", feedback: "Four straight sides, two long and two short — still four." },
       { label: "small triangle", bucket: "a", feedback: "Size is non-defining; three sides still means triangle." }],
      "Sorted by sides — a defining attribute, so every group really is alike.", "Count the straight sides on each shape before placing it."),
    predict: P("Shapes are sorted by colour instead. Will each group contain only one kind of shape?", [{ id: "no", label: "No — mixed shapes" }, { id: "yes", label: "Yes — one kind" }], "no",
      "Colour is non-defining, so a red triangle and a red square land in the same pile.") },
  [
    reused("DefiningMcq", "g1s3-k1", H.def, ["Sort by what defines the shape.", "Then the groups are truly alike."]),
    reused("ShapeSidesNumeric", "g1s3-k2", H.def, ["Counting sides decides the group.", "Count each side once."]),
    reused("NonDefiningMcq", "g1s3-k3", H.nond, ["Colour sorting mixes shapes.", "It is not a shape sort."]),
    reused("ShapeSidesNumeric", "g1s3-ch1", H.def, ["Corners match sides on these shapes.", "Either can drive the sort."]),
  ],
  ["Sort by defining attributes.", "Then groups are truly alike.", "Colour sorts mix shapes together."],
  "next: joining two shapes.",
  () => tapShape("Tap the shape that belongs in the 4-sided group.",
    [{ label: "rectangle", icon: "\u25ac", correct: true },
     { label: "triangle", icon: "\ud83d\udd3a", feedback: "A triangle has 3 straight sides, so it belongs with the 3-sided group." },
     { label: "circle", icon: "\u26aa", feedback: "A circle has no straight sides at all, so it joins neither group." },
     { label: "small triangle", icon: "\ud83d\udd3a", feedback: "Size is non-defining; with 3 sides it still belongs in the 3-sided group." }],
    "Yes \u2014 4 straight sides puts the rectangle in the 4-sided group.", "Count the straight sides, then choose the group that matches."));

def(4,
  "Two shapes can be joined along a matching edge to make a brand-new, larger shape. The edge where they meet disappears inside.",
  "That is why the new shape has fewer sides than the two pieces had between them — the joined edges are no longer on the outside.",
  { rep: "diagram", widget: () => tapShape("Two triangles are joined along their long edges. Tap the shape they make.",
      [{ label: "square", icon: "🟦", correct: true },
       { label: "triangle", icon: "🔺", feedback: "Joining two triangles makes something larger with 4 sides, not another triangle." },
       { label: "circle", icon: "⚪", feedback: "Straight-edged pieces cannot make a round shape." },
       { label: "rectangle", icon: "▬", feedback: "Close — but with equal edges joined, all four sides come out equal, making a square." }],
      "Yes — two triangles joined on their long edges make a square.", "Picture the two long edges pressed together, then look at the outside."),
    predict: P("Two shapes are joined along one edge. What happens to that shared edge?", [{ id: "inside", label: "It goes inside" }, { id: "outside", label: "It stays on the outside" }], "inside",
      "The shared edge is covered by the join, so it is no longer part of the new outline.") },
  [
    reused("ComposeTwoMcq", "g1s4-k1", H.comp, ["Matching edges join cleanly.", "The join hides those edges."]),
    reused("ComposedShapeSidesNumeric", "g1s4-k2", H.comp, ["Count around the new outside only.", "Inside edges do not count."]),
    reused("ComposeTwoMcq", "g1s4-k3", H.comp, ["The result is a single larger shape.", "Name it by its outside sides."]),
    reused("ComposedShapeSidesNumeric", "g1s4-ch1", H.comp, ["The finished shape has its own attributes.", "Count them on the result."]),
  ],
  ["Two shapes join along a matching edge.", "The shared edge goes inside.", "Count the new outline only."],
  "next: making a rectangle.");

def(5,
  "Two squares pushed together side by side make a rectangle: four straight sides, four corners, but longer than it is tall.",
  "The two squares still exist inside the rectangle — composing does not destroy the pieces, it only hides the edge between them.",
  { rep: "diagram", widget: () => tapShape("Two squares are pushed together side by side. Tap the shape they make.",
      [{ label: "rectangle", icon: "▬", correct: true },
       { label: "square", icon: "🟦", feedback: "The result is longer than it is tall, so its sides are no longer all equal." },
       { label: "triangle", icon: "🔺", feedback: "Joining two four-sided pieces cannot reduce the outline to three sides." },
       { label: "circle", icon: "⚪", feedback: "Straight-edged squares keep straight edges however they are joined." }],
      "Yes — two squares side by side make a rectangle.", "Press the two squares together and trace the outside edge."),
    predict: P("Two squares join into a rectangle. How many sides does the rectangle have?", [{ id: "four", label: "Four" }, { id: "eight", label: "Eight" }], "four",
      "The two joined edges are hidden inside, leaving four sides on the outside.") },
  [
    reused("ComposedShapeSidesNumeric", "g1s5-k1", H.comp, ["The rectangle's outline has four sides.", "Inside edges are hidden."]),
    reused("ComposeTwoMcq", "g1s5-k2", H.comp, ["Two squares share one full side.", "That makes a rectangle."]),
    reused("ComposedShapeSidesNumeric", "g1s5-k3", H.comp, ["Count corners on the result.", "Four corners, four sides."]),
    reused("DefiningMcq", "g1s5-ch1", H.def, ["The result is named by its own attributes.", "Sides and corners decide."]),
  ],
  ["Two squares make a rectangle.", "The shared edge hides inside.", "The outline has four sides."],
  "next: making a hexagon.");

def(6,
  "Six triangles meeting at a single centre point make a hexagon — a shape with six straight sides.",
  "Composing is not limited to two pieces. Any number of shapes can combine, as long as their edges match up.",
  { rep: "diagram", widget: () => sortBuckets("Sort each build: does it make a hexagon?", "Makes a hexagon", "Does not",
      [{ label: "six triangles round a centre", bucket: "a", feedback: "Six triangles meeting at one point close into a six-sided hexagon." },
       { label: "two triangles on their long edges", bucket: "b", feedback: "Two triangles make a four-sided square, not a hexagon." },
       { label: "two squares side by side", bucket: "b", feedback: "Two squares make a four-sided rectangle." },
       { label: "six equal triangles in a ring", bucket: "a", feedback: "A closed ring of six triangles forms a hexagon." }],
      "Sorted — only a full ring of six triangles closes into a hexagon.", "Ask how many sides the finished outline would have."),
    predict: P("Six triangles meet at one centre point. How many sides does the finished outline have?", [{ id: "six", label: "Six" }, { id: "three", label: "Three" }], "six",
      "Each triangle contributes one outer edge, so the ring closes with six sides.") },
  [
    reused("ComposeTwoMcq", "g1s6-k1", H.comp, ["Many pieces can compose at once.", "Edges must match all round."]),
    reused("ComposedShapeSidesNumeric", "g1s6-k2", H.comp, ["Count only the outer edges.", "Inner edges are hidden."]),
    reused("ComposeTwoMcq", "g1s6-k3", H.comp, ["A closed ring makes one new shape.", "Its sides are the outer edges."]),
    reused("ShapeSidesNumeric", "g1s6-ch1", H.def, ["Named shapes have fixed side counts.", "Count to confirm."]),
  ],
  ["Six triangles make a hexagon.", "More than two pieces can compose.", "Only outer edges count."],
  "next: filling an outline.",
  () => tapShape("Six triangles meet at a centre point. Tap how many sides the finished outline has.",
    [{ label: "6 sides", icon: "\u2b21", correct: true },
     { label: "3 sides", icon: "\ud83d\udd3a", feedback: "Three sides is one triangle alone; six of them close into a larger outline." },
     { label: "4 sides", icon: "\ud83d\udfe6", feedback: "Four sides comes from joining two triangles, not six." },
     { label: "0 sides", icon: "\u26aa", feedback: "Straight-edged triangles always leave straight sides on the outside." }],
    "Yes \u2014 each triangle contributes one outer edge, so the hexagon has 6.", "Count one outer edge per triangle in the ring."));

def(7,
  "Filling an outline with smaller shapes means covering it completely: no gaps left uncovered and no pieces stacked on top of each other.",
  "The same outline can often be filled in more than one way, using different pieces — and every correct filling covers it exactly.",
  { rep: "diagram", widget: () => sortBuckets("Sort each attempt at filling an outline.", "Correct fill", "Not a correct fill",
      [{ label: "pieces cover every part, none overlap", bucket: "a", feedback: "Complete cover with no overlaps — this is a correct fill." },
       { label: "small gaps left between pieces", bucket: "b", feedback: "Gaps mean part of the outline is still uncovered." },
       { label: "pieces stacked on each other", bucket: "b", feedback: "Stacking covers the same part twice and leaves other parts bare." },
       { label: "different pieces, still covering exactly", bucket: "a", feedback: "A different set of pieces is fine as long as the cover is exact." }],
      "Sorted — a correct fill covers everything exactly once.", "Check for two things: any gap, and any overlap."),
    predict: P("Can one outline be filled correctly in more than one way?", [{ id: "yes", label: "Yes — several ways" }, { id: "no", label: "No — only one" }], "yes",
      "Different combinations of pieces can each cover the same outline exactly.") },
  [
    reused("FillOutlineMcq", "g1s7-k1", H.comp, ["Cover everything, overlap nothing.", "Both rules must hold."]),
    reused("ComposedShapeSidesNumeric", "g1s7-k2", H.comp, ["The filled outline keeps its own shape.", "Count its sides."]),
    reused("FillOutlineMcq", "g1s7-k3", H.comp, ["Gaps undercover; overlaps double-cover.", "Neither is a correct fill."]),
    reused("ComposeTwoMcq", "g1s7-ch1", H.comp, ["Pieces combine into one shape.", "The outline names it."]),
  ],
  ["Cover the outline completely.", "No gaps, no overlaps.", "Several fillings can be correct."],
  "next: building with solids.",
  () => tapShape("Tap the piece that would fill the last gap in a half-filled square outline.",
    [{ label: "matching triangle", icon: "\ud83d\udd3a", correct: true },
     { label: "circle", icon: "\u26aa", feedback: "A round piece leaves gaps at the corners, so the fill is never exact." },
     { label: "oversized square", icon: "\ud83d\udfe6", feedback: "A piece larger than the gap would overlap what is already placed." },
     { label: "no piece at all", icon: "\u2b1c", feedback: "Leaving the gap empty means the outline is not filled." }],
    "Yes \u2014 the matching triangle closes the gap exactly, with no overlap.", "Look for the piece whose edges match the empty space exactly."));

def(8,
  "Solid shapes can be composed too. A cube, a cone, a cylinder and a sphere take up space, unlike flat shapes that lie on the page.",
  "Solids have flat faces and edges to count, just as flat shapes have sides and corners.",
  { rep: "diagram", widget: () => sortBuckets("Sort each shape: flat or solid?", "Flat (2D)", "Solid (3D)",
      [{ label: "triangle", bucket: "a", feedback: "A triangle lies flat on the page — it is a 2D shape." },
       { label: "cube", bucket: "b", feedback: "A cube takes up space and has flat faces — it is 3D." },
       { label: "circle", bucket: "a", feedback: "A circle is flat, with no thickness at all." },
       { label: "sphere", bucket: "b", feedback: "A sphere is solid and round all over — it is 3D." }],
      "Sorted — flat shapes lie on the page, solids take up space.", "Ask whether it could be picked up, or only drawn."),
    predict: P("Can a solid shape lie completely flat on the page?", [{ id: "no", label: "No — it takes up space" }, { id: "yes", label: "Yes" }], "no",
      "A solid has thickness, so it cannot lie flat the way a drawn shape does.") },
  [
    reused("TwoDThreeDMcq", "g1s8-k1", H.solid, ["Solids take up space.", "Flat shapes lie on the page."]),
    reused("SolidPartsNumeric", "g1s8-k2", H.solid, ["Count flat faces or edges.", "Each part exactly once."]),
    reused("TwoDThreeDMcq", "g1s8-k3", H.solid, ["A shape is flat or solid, not both.", "Thickness decides."]),
    reused("SolidPartsNumeric", "g1s8-ch1", H.solid, ["Different solids have different counts.", "Count carefully."]),
  ],
  ["Solids take up space.", "Flat shapes lie on the page.", "Solids have faces and edges."],
  "next: taking a shape apart.",
  () => tapShape("Tap the shape that takes up space (a solid).",
    [{ label: "cube", icon: "\ud83e\uddca", correct: true },
     { label: "square", icon: "\ud83d\udfe6", feedback: "A square is flat \u2014 it lies on the page with no thickness." },
     { label: "triangle", icon: "\ud83d\udd3a", feedback: "A triangle is a flat shape, not a solid." },
     { label: "circle", icon: "\u26aa", feedback: "A circle is flat; the solid version of it would be a sphere." }],
    "Yes \u2014 a cube takes up space, so it is a solid (3D) shape.", "Ask which one could be picked up rather than only drawn."));

def(9,
  "Composing has an opposite: a shape can be cut into smaller shapes. A square cut along its diagonal becomes two triangles.",
  "Decomposing and composing undo each other — the pieces can always be rejoined into the original shape.",
  { rep: "diagram", widget: () => tapShape("A square is cut along one diagonal. Tap the shape each piece becomes.",
      [{ label: "triangle", icon: "🔺", correct: true },
       { label: "square", icon: "🟦", feedback: "Each piece is only half the square, with three sides rather than four." },
       { label: "rectangle", icon: "▬", feedback: "A diagonal cut leaves a slanted edge, giving three sides, not four." },
       { label: "circle", icon: "⚪", feedback: "A straight cut cannot produce a curved edge." }],
      "Yes — one straight diagonal cut turns a square into two triangles.", "Follow the diagonal cut and count the sides of one piece."),
    predict: P("The two triangles are pushed back together. What shape returns?", [{ id: "square", label: "The square" }, { id: "new", label: "Something new" }], "square",
      "Composing undoes decomposing, so the original square comes back.") },
  [
    reused("DecomposeMcq", "g1s9-k1", H.dec, ["A cut makes smaller shapes.", "Straight cuts give straight edges."]),
    reused("ComposedShapeSidesNumeric", "g1s9-k2", H.dec, ["Count the sides of one piece.", "The cut adds a new edge."]),
    reused("DecomposeMcq", "g1s9-k3", H.dec, ["Pieces rebuild the whole.", "Composing undoes cutting."]),
    reused("ShapeSidesNumeric", "g1s9-ch1", H.def, ["Each piece is its own shape.", "Name it by its sides."]),
  ],
  ["Shapes can be cut into smaller shapes.", "Straight cuts give straight edges.", "The pieces rebuild the whole."],
  "next: new shapes from old.");

def(10,
  "Composing and decomposing together let you build new shapes from old ones, then take them apart again — the pieces are never lost.",
  "Whatever you build, name it by its own defining attributes: count the sides and corners of the finished outline.",
  { rep: "diagram", widget: () => tapShape("Two triangles are joined, then that shape is joined to another like it. Tap what the four triangles make.",
      [{ label: "rectangle", icon: "▬", correct: true },
       { label: "triangle", icon: "🔺", feedback: "Four triangles make a larger four-sided shape, not a three-sided one." },
       { label: "circle", icon: "⚪", feedback: "Straight-edged pieces always leave straight edges." },
       { label: "cube", icon: "🧊", feedback: "A cube is solid; joining flat pieces keeps the result flat." }],
      "Yes — two squares' worth of triangles line up into a rectangle.", "Build it in stages: two triangles make a square, and two squares make a rectangle."),
    predict: P("You build a new shape from old pieces. How do you decide what to call it?", [{ id: "attrs", label: "Count its sides and corners" }, { id: "pieces", label: "Name the pieces used" }], "attrs",
      "A shape is named by its own defining attributes, not by what it was built from.") },
  [
    reused("ComposedShapeSidesNumeric", "g1s10-k1", H.comp, ["Name the result by its own outline.", "Count its sides and corners."]),
    reused("ComposeTwoMcq", "g1s10-k2", H.comp, ["Pieces combine into one new shape.", "Matching edges make it possible."]),
    reused("DecomposeMcq", "g1s10-k3", H.dec, ["Any build can be taken apart.", "The pieces are never lost."]),
    reused("DefiningMcq", "g1s10-ch1", H.def, ["Defining attributes name the shape.", "Not the pieces it came from."]),
  ],
  ["Build new shapes from old.", "Take them apart again.", "Name a shape by its own attributes."],
  "course complete: composing and decomposing shapes.");

/* ------------------------------------------------------------------- assembly */
must(L.length === 10, `10 lessons defined, got ${L.length}`);
const chapterTitles = ["What Makes a Shape", "Putting Shapes Together", "Building and Taking Apart"];
const perChapter = [3, 4, 3];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 3 ? 1 : n <= 7 ? 2 : 3);
const outDir = join(root, "content/courses/compose-shapes-g1");
mkdirSync(join(outDir, "lessons"), { recursive: true });

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seq = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `g1s-0${ch}-${String(seq).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => ({
    id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
    explanationVariants: c.ev, widget: c.widget, hints: c.hints, variant: c.variant, cml: cml(tag, "diagram"),
  });

  const lesson = {
    id, slug, title: row.title, courseId: "compose-shapes-g1",
    chapterId: chapters[ch - 1].id, minutes: 6, readingProfile: "standard",
    steps: [
      { id: "c1", kind: "concept", figure: "count-on-hops", body: d.c1, narration: d.c1 },
      { id: "i1", kind: "interactive", body: "Try it.", conceptTag: tag, widget: d.i1.widget(), predict: d.i1.predict, cml: cml(tag, d.i1.rep) },
      stepFromCheck("k1", d.checks[0]),
      { id: "c2", kind: "concept", figure: "count-on-hops", body: d.c2, narration: d.c2 },
      { id: "i2", kind: "interactive", body: "Try it another way.", conceptTag: tag, widget: d.i2 ? d.i2() : d.i1.widget(), cml: cml(tag, "diagram") },
      stepFromCheck("k2", d.checks[1]),
      stepFromCheck("k3", d.checks[2]),
      stepFromCheck("ch1", d.checks[3], "challenge"),
      { id: "r1", kind: "recap", body: "You did it!", takeaways: d.recap, teaser: d.teaser },
    ],
    remedials: [{
      conceptTag: tag,
      concept: { id: `rem-${tag}-c`, kind: "concept", body: d.c2, narration: d.c2 },
      check: { id: `rem-${tag}-k`, kind: "check", body: "", conceptTag: tag,
        explanationVariants: d.checks[0].ev,
        widget: d.checks[0].widget.type === "numeric"
          ? { ...d.checks[0].widget, commonErrors: d.checks[0].widget.commonErrors.slice(0, 2) }
          : d.checks[0].widget },
    }],
  };

  for (const s of lesson.steps) {
    const w = s.widget;
    if (!w) continue;
    if (w.type === "numeric") for (const e of w.commonErrors) must(e.value !== w.answer, `${id}/${s.id} trap==answer`);
    if (w.type === "mcq") {
      must(w.options.filter((o) => o.correct).length === 1, `${id}/${s.id} mcq correct count`);
      must(w.options.length >= 4, `${id}/${s.id} mcq option count`);
      must(w.options[0].correct === true, `${id}/${s.id} correct must be index 0`);
    }
    if (w.type === "tapDiagram") must(w.hotspots.filter((h) => h.correct).length === 1, `${id}/${s.id} tapDiagram correct count`);
    if (w.type === "dragBucket") {
      const used = new Set(w.items.map((it) => it.bucketId));
      must(used.size === 2, `${id}/${s.id} dragBucket must use both buckets`);
    }
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
    if (s.variant) {
      must(s.variant.gen === "g1-shapes-measure", `${id}/${s.id} unexpected gen`);
      must(REGISTERED.has(s.variant.form), `${id}/${s.id} form ${s.variant.form} not registered`);
    }
  }
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c, i) => c === perChapter[i]), `chapter sizes ${chCount}`);
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "compose-shapes-g1", slug: "compose-shapes-g1", title: spec.title,
  tagline: "Find what really makes a shape, then join and cut shapes to build new ones.",
  category: "Math", gradeLevel: 1, chapters,
}, null, 2) + "\n");
console.log(`built 10 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
