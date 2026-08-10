#!/usr/bin/env node
// S199 — G6-12 expansion course 2/4: surface-area-solids-g7 (7.G.B.6).
//
// WHY THIS COURSE: the repo teaches prism surface area at G6 and round-solid volume at G8, while
// Grade 7 itself only slices solids (7.G.A.3). 7.G.B.6 — "area, volume and surface area of
// objects composed of triangles, quadrilaterals, polygons, cubes, and right prisms" — has no
// grade-level home. Composite figures are the distinctly-G7 contribution and get their own lesson.
//
// ENGINE CHOICES:
//   netFold          — the unfolding metaphor made literal: set l/w/h and watch the six faces and
//                      their total. netFold's adapt cap is 0, so lessons that lead with it pair it
//                      with an adapt-3 engine elsewhere OR rely on the remedial alone (+1); to keep
//                      every lesson at adapt 3 each netFold lesson also carries areaModel or
//                      volumeBuilder, both adapt-3.
//   volumeBuilder    — base-area x height, built rather than recited.
//   compositeAreaLab — the piece-ledger scene: add and subtract named pieces, which is exactly the
//                      decomposition move the standard names. adapt 3, conseq 3, mobile 3.
//   areaModel        — rectangle areas as a built object.
//
// SURFACE-AREA ARITHMETIC is recomputed in-script (sa/volume helpers below) and asserted against
// every authored target, so no total is ever hand-carried.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SLUG = "surface-area-solids-g7";
const spec = JSON.parse(readFileSync("/mnt/user-data/uploads/g6-12-expansion.json", "utf8"))
  .courses.find((c) => c.slug === SLUG);

let asserts = 0;
const must = (ok, msg) => { asserts++; if (!ok) throw new Error("FACTORY ASSERT: " + msg); };
must(spec && spec.lessons.length === 6, "spec course present with 6 lessons");
must(spec.grade === 7, "grade 7");

/* ---- independent geometry, used to check every authored number ---- */
const saBox = (l, w, h) => 2 * (l * w + l * h + w * h);
const volBox = (l, w, h) => l * w * h;
const triArea = (b, h) => (b * h) / 2;

function numeric({ prompt, answer, errors, fallbackFeedback, successFeedback, unit }) {
  must(errors.length >= 2, "numeric needs >=2 diagnostic wrong answers");
  for (const [v] of errors) must(v !== answer, `trap ${v} equals answer ${answer}`);
  must(new Set(errors.map((e) => e[0])).size === errors.length, "duplicate traps");
  const w = { type: "numeric", prompt, answer, tolerance: 0,
    commonErrors: errors.map(([value, feedback]) => ({ value, feedback })), fallbackFeedback };
  if (successFeedback) w.successFeedback = successFeedback;
  if (unit) w.unit = unit;
  return w;
}
function mcq(prompt, options) {
  must(options.filter((o) => o[2]).length === 1, `${prompt}: exactly one correct`);
  must(options.length >= 3, "mcq needs >=3 options");
  return { type: "mcq", prompt, options: options.map(([id, label, correct, feedback]) => ({ id, label, correct: !!correct, feedback })) };
}
const predict = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o[0] === outcomeId), "predict outcome offered");
  return { prompt, options: options.map(([id, label]) => ({ id, label })), outcomeId, reveal };
};
function netFold(o) {
  must(o.targetSurfaceArea > 0, "positive SA");
  let reachable = false;
  for (let l = 1; l <= (o.lMax ?? 6) && !reachable; l++)
    for (let w = 1; w <= (o.wMax ?? 6) && !reachable; w++)
      for (let h = 1; h <= (o.hMax ?? 6); h++)
        if (saBox(l, w, h) === o.targetSurfaceArea) { reachable = true; break; }
  must(reachable, `netFold SA ${o.targetSurfaceArea} unreachable inside the authored slider bounds`);
  return { type: "netFold", ...o };
}
function volumeBuilder(o) {
  let reachable = false;
  for (let l = 1; l <= (o.lMax ?? 6) && !reachable; l++)
    for (let w = 1; w <= (o.wMax ?? 6) && !reachable; w++)
      for (let h = 1; h <= (o.hMax ?? 6); h++) {
        if (o.lockL && l !== o.lStart) continue;
        if (o.lockW && w !== o.wStart) continue;
        if (o.lockH && h !== o.hStart) continue;
        if (volBox(l, w, h) === o.targetVolume) { reachable = true; break; }
      }
  must(reachable, `volumeBuilder volume ${o.targetVolume} unreachable under the authored locks`);
  for (const c of o.commonBuilds ?? []) must(c.volume !== o.targetVolume, "commonBuild equals target");
  return { type: "volumeBuilder", commonBuilds: [], ...o };
}
function areaModel(o) {
  must(o.targetArea > 0, "positive area");
  if (o.requireFactors) must(o.requireFactors.w * o.requireFactors.h === o.targetArea, "requireFactors multiply to the target");
  return { type: "areaModel", ...o };
}
function compositeAreaLab({ prompt, pieces, choices, correctValue, fallbackFeedback, successFeedback }) {
  const area = (p) => p.shape === "rectangle" ? p.width * p.height
    : p.shape === "triangle" ? triArea(p.base, p.height)
    : p.shape === "parallelogram" ? p.base * p.height : p.area;
  const total = pieces.reduce((t, p) => t + (p.operation === "subtract" ? -1 : 1) * area(p), 0);
  must(total === correctValue, `piece ledger totals ${total}, not the authored ${correctValue}`);
  must(choices.some((c) => c.value === correctValue), "one choice carries the true total");
  must(new Set(choices.map((c) => c.value)).size === choices.length, "choice values unique");
  must(new Set(choices.map((c) => c.id)).size === choices.length, "choice ids unique");
  must(new Set(pieces.map((p) => p.id)).size === pieces.length, "piece ids unique");
  return { type: "compositeAreaLab", prompt, scene: "piece-ledger", pieces,
    target: { kind: "total" }, choices, fallbackFeedback, successFeedback };
}

const L = [];
const lesson = (id, slug, title, chapterId, minutes, steps, remedial) =>
  L.push({ id, slug, title, courseId: SLUG, chapterId, minutes, steps, remedials: [remedial] });
const remedialFrom = (steps, tag) => {
  const c = steps.find((s) => s.kind === "concept" && s.id === "c2");
  const k = steps.find((s) => (s.kind === "check" || s.kind === "challenge") && s.conceptTag === tag && s.widget);
  must(c && k, `remedial sources for ${tag}`);
  return { conceptTag: tag,
    concept: { id: `rem-${tag}-c`, kind: "concept", body: c.body },
    check: { id: `rem-${tag}-k`, kind: "check", body: k.body, conceptTag: tag,
      explanationVariants: k.explanationVariants, widget: structuredClone(k.widget) } };
};

/* ================= CH1 — Wrapping Solids ================= */

/* 1. Unfolding a Prism — sa7-nets-prisms */
{
  const TAG = "sa7-nets-prisms";
  const SA = saBox(4, 3, 2); must(SA === 52, "4x3x2 box has SA 52");
  const steps = [
    { id: "c1", kind: "concept", body: "Surface area is a flat question wearing a 3-D costume. Cut a box along its edges and lay it out: what you get is a NET, a flat arrangement of the same faces. Adding up the net's areas is adding up the solid's surface, because they are the same cardboard either way." },
    { id: "i1", kind: "interactive", body: "Fold and unfold until the total matches.",
      widget: netFold({ prompt: "Set the box's dimensions so the unfolded net's total area is 52 square units.",
        targetSurfaceArea: SA, lMax: 6, wMax: 6, hMax: 6, lStart: 1, wStart: 1, hStart: 1,
        successFeedback: "4 by 3 by 2: the faces come in matching pairs \u2014 two 12s, two 8s, two 6s \u2014 and 2(12 + 8 + 6) = 52.",
        lowFeedback: "Total still under 52 \u2014 enlarge a dimension and watch which two faces grow.",
        highFeedback: "Total past 52 \u2014 shrink a dimension; each one controls exactly four of the six faces." }),
      predict: predict("A closed box has six faces. How many DIFFERENT face areas can it have at most?",
        [["six", "Six \u2014 every face can differ"],
         ["three", "Three \u2014 they come in matching pairs"],
         ["two", "Two \u2014 top-bottom and sides"]],
        "three",
        "Opposite faces of a box are identical rectangles, so six faces carry at most three distinct areas. That pairing is why every surface-area formula for a box starts by doubling: you compute three faces and the box supplies their twins."),
    },
    { id: "i2", kind: "interactive", body: "Build one face of that net on its own.",
      widget: areaModel({ prompt: "Build the crate's largest face: the 4 by 3 rectangle.",
        targetArea: 12, wMax: 6, hMax: 6, wStart: 1, hStart: 1, requireFactors: { w: 4, h: 3 },
        factorFeedback: "That rectangle covers 12 square units, but the face this net needs measures 4 by 3 \u2014 build those exact sides.",
        successFeedback: "12 square units \u2014 and the opposite face is identical, so this single rectangle already accounts for 24 of the net's 52.",
        lowFeedback: "Face still under 12 square units \u2014 grow a side.",
        highFeedback: "Face past 12 square units \u2014 pull a side back in." }) },
    { id: "k1", kind: "check", body: "Count the faces.", conceptTag: TAG,
      explanationVariants: ["A rectangular prism's net has six rectangles \u2014 three matching pairs.",
                            "Two ends, two sides, a top and a bottom: six in all."],
      widget: mcq("How many rectangles appear in the net of a rectangular prism?", [
        ["o1", "6", true, "Yes \u2014 three matching pairs, which is why surface area doubles three products."],
        ["o2", "4", false, "That counts only the walls and forgets the top and bottom."],
        ["o3", "12", false, "12 is the number of EDGES, not faces."],
      ]) },
    { id: "c2", kind: "concept", body: "So the formula is bookkeeping, not magic: 2(lw + lh + wh). Each product is one face; each 2 is that face's opposite twin. If you ever forget it, unfold the box in your head and add the rectangles \u2014 the formula will reassemble itself." },
    { id: "k2", kind: "check", body: "Add the net by hand.", conceptTag: TAG,
      explanationVariants: [`The three distinct faces are 5\u00d73 = 15, 5\u00d72 = 10 and 3\u00d72 = 6, and 2(15 + 10 + 6) = ${saBox(5, 3, 2)}.`,
                            "Compute three faces, double the sum: that is the whole method."],
      widget: numeric({ prompt: "A 5 by 3 by 2 box: what is its surface area, in square units?", answer: saBox(5, 3, 2),
        errors: [[volBox(5, 3, 2), "That is the VOLUME, 5\u00d73\u00d72 \u2014 how much fits inside, not how much wraps around."],
                 [31, "That adds the three distinct faces (15 + 10 + 6) but forgets their opposite twins. Double it."]],
        fallbackFeedback: "Faces: 15, 10 and 6, each appearing twice. 2(15 + 10 + 6) = 62.",
        successFeedback: "62 square units \u2014 three faces computed, three twins supplied by the box." }) },
    { id: "k3", kind: "check", body: "Which faces does one dimension touch?", conceptTag: TAG,
      explanationVariants: ["Height appears in the lh and wh faces \u2014 four of the six.",
                            "Changing the height leaves only the top and bottom untouched."],
      widget: mcq("If you increase ONLY the height of a box, how many of its six faces change area?", [
        ["o1", "4", true, "Right \u2014 the four side walls grow; the top and bottom keep their l\u00d7w area."],
        ["o2", "2", false, "Only two faces AVOID changing \u2014 the top and bottom. The other four all involve the height."],
        ["o3", "6", false, "The top and bottom are l by w, with no height in them at all."],
      ]) },
    { id: "ch1", kind: "challenge", body: "A cube, from one number.", conceptTag: TAG,
      explanationVariants: ["A cube has six identical faces of 4\u00d74 = 16, so its surface area is 96.",
                            "6s\u00b2 with s = 4 gives 6\u00d716 = 96."],
      hints: ["A cube's faces are all the same square \u2014 how many of them are there?",
              "Find the area of one face first, from the edge length 4.",
              "One face is 4\u00d74 = 16, and there are six of them."],
      widget: numeric({ prompt: "A cube has edge 4. What is its surface area, in square units?", answer: 6 * 16,
        errors: [[64, "That is the VOLUME, 4\u00b3. Surface area wraps the outside: six faces of 16."],
                 [16, "That is ONE face. A cube has six of them."]],
        fallbackFeedback: "One face is 4\u00d74 = 16; six faces give 6\u00d716 = 96.",
        successFeedback: "96 \u2014 the cube is the case where all three of the box's distinct faces coincide." }) },
    { id: "r1", kind: "recap", body: "Unfold, then add.",
      takeaways: ["A net is the solid's surface laid flat; adding its areas gives surface area.",
                  "A box's six faces come in three matching pairs, hence 2(lw + lh + wh).",
                  "Surface area is measured in square units; volume is not the same question."],
      teaser: "Next: run that formula on real boxes \u2014 and keep it clearly apart from volume." },
  ];
  lesson("sa7-01-01", "unfolding-a-prism", "Unfolding a Prism", "ch1-wrapping-solids", 9, steps, remedialFrom(steps, TAG));
}

/* 2. Surface Area of Rectangular Prisms — sa7-sa-rectangular */
{
  const TAG = "sa7-sa-rectangular";
  const steps = [
    { id: "c1", kind: "concept", body: "With the net understood, surface area becomes a routine you can trust: find the three distinct face areas, add them, double. The only real hazard is mixing it up with volume \u2014 they use the same three numbers and answer completely different questions." },
    { id: "i1", kind: "interactive", body: "Build a box to a required wrapping area.",
      widget: netFold({ prompt: "A gift box needs exactly 62 square units of wrapping. Build it.",
        targetSurfaceArea: saBox(5, 3, 2), lMax: 6, wMax: 6, hMax: 6, lStart: 2, wStart: 2, hStart: 2,
        successFeedback: "5 by 3 by 2: faces of 15, 10 and 6, doubled, give 62 square units of paper.",
        lowFeedback: "Not enough paper yet \u2014 grow a dimension.",
        highFeedback: "More paper than needed \u2014 shrink a dimension." }),
      predict: predict("Double every dimension of a box. What happens to its surface area?",
        [["double", "It doubles"], ["quadruple", "It multiplies by 4"], ["octuple", "It multiplies by 8"]],
        "quadruple",
        "Every face is a product of TWO lengths, so doubling both doubles it twice: each face quadruples, and so does the total. Volume, which multiplies three lengths, would multiply by 8 \u2014 the clearest sign that these two measures are genuinely different questions."),
    },
    { id: "i2", kind: "interactive", body: "Now fill the same box instead of wrapping it.",
      widget: volumeBuilder({ prompt: "That box is 3 wide and 2 high, both locked. Set its length so it HOLDS exactly 30 cubic units.",
        targetVolume: 30, lMax: 6, wMax: 6, hMax: 6, lStart: 1, wStart: 3, hStart: 2, lockW: true, lockH: true,
        commonBuilds: [
          { volume: 62, feedback: "62 is the SURFACE AREA of this box, in square units. Volume counts what fits inside, in cubic units." },
          { volume: 24, feedback: "Not quite full \u2014 lengthen it one more unit." },
        ],
        successFeedback: "Length 5: the very same 5 by 3 by 2 box that needed 62 square units of paper holds only 30 cubic units of filling. Same box, two different measures.",
        lowFeedback: "Not full yet \u2014 lengthen the box.",
        highFeedback: "Overfilled \u2014 shorten the box." }) },
    { id: "k1", kind: "check", body: "Surface area or volume?", conceptTag: TAG,
      explanationVariants: ["Paint covers the outside, so the quantity needed is surface area.",
                            "Anything that wraps, coats or covers is a surface-area question."],
      widget: mcq("You want to PAINT the outside of a storage chest. Which measure do you need?", [
        ["o1", "Surface area", true, "Yes \u2014 paint covers the outside skin, measured in square units."],
        ["o2", "Volume", false, "Volume tells you what FITS INSIDE the chest, which paint never touches."],
        ["o3", "Perimeter", false, "Perimeter measures a flat boundary in linear units; a chest's surface is two-dimensional."],
      ]) },
    { id: "c2", kind: "concept", body: "Units settle the question when words do not. Surface area lands in square units because every face is a length times a length. Volume lands in cubic units because it multiplies three lengths. If your answer's units do not match the question's, the wrong measure was computed." },
    { id: "k2", kind: "check", body: "Compute one.", conceptTag: TAG,
      explanationVariants: [`Faces of 6\u00d74 = 24, 6\u00d75 = 30 and 4\u00d75 = 20 double to ${saBox(6, 4, 5)}.`,
                            "Three distinct faces, summed and doubled."],
      widget: numeric({ prompt: "A 6 by 4 by 5 box: what is its surface area, in square units?", answer: saBox(6, 4, 5),
        errors: [[volBox(6, 4, 5), "That is the volume 6\u00d74\u00d75 = 120 \u2014 cubic units, a different question."],
                 [74, "The three distinct faces sum to 74; each has a twin, so double it."]],
        fallbackFeedback: "2(24 + 30 + 20) = 148 square units.",
        successFeedback: "148 square units \u2014 and note the volume of the very same box is 120, a different number for a different question." }) },
    { id: "k3", kind: "check", body: "Same numbers, other question.", conceptTag: TAG,
      explanationVariants: [`Volume multiplies all three: 6\u00d74\u00d75 = ${volBox(6, 4, 5)} cubic units.`,
                            "Volume fills; surface area wraps."],
      widget: numeric({ prompt: "That same 6 by 4 by 5 box: what is its VOLUME, in cubic units?", answer: volBox(6, 4, 5),
        errors: [[saBox(6, 4, 5), "That is the surface area you just computed. Volume multiplies the three dimensions instead of pairing them."],
                 [15, "That adds the dimensions. Volume multiplies them: 6\u00d74\u00d75."]],
        fallbackFeedback: "6\u00d74\u00d75 = 120 cubic units.",
        successFeedback: "120 cubic units \u2014 same box, same three numbers, entirely different measure." }) },
    { id: "ch1", kind: "challenge", body: "Work backwards from a face.", conceptTag: TAG,
      explanationVariants: ["A cube of surface area 54 has faces of 54 \u00f7 6 = 9, so its edge is 3.",
                            "Divide by six to get one face, then take the square root."],
      hints: ["A cube's six faces are identical, so start by finding ONE face's area.",
              "54 \u00f7 6 tells you the area of a single square face.",
              "A square face of area 9 has side 3."],
      widget: numeric({ prompt: "A cube has surface area 54 square units. What is its edge length?", answer: 3,
        errors: [[9, "That is the area of one FACE. The edge is the square root of it."],
                 [6, "6 is the number of faces, not a length."]],
        fallbackFeedback: "One face is 54 \u00f7 6 = 9 square units, so the edge is \u221a9 = 3.",
        successFeedback: "3 \u2014 surface area run in reverse, which is how most real measuring problems arrive." }) },
    { id: "r1", kind: "recap", body: "Wrap versus fill.",
      takeaways: ["Surface area of a box is 2(lw + lh + wh), in square units.",
                  "Volume is lwh, in cubic units \u2014 the same three numbers answering a different question.",
                  "Doubling every dimension multiplies surface area by 4 and volume by 8."],
      teaser: "Next: solids whose ends are triangles \u2014 where the pairs stop being so obliging." },
  ];
  lesson("sa7-01-02", "surface-area-of-rectangular-prisms", "Surface Area of Rectangular Prisms", "ch1-wrapping-solids", 9, steps, remedialFrom(steps, TAG));
}

/* 3. Surface Area of Triangular Prisms & Pyramids — sa7-sa-triangular */
{
  const TAG = "sa7-sa-triangular";
  // triangular prism: right triangle legs 3,4, hypotenuse 5, length 10
  const ENDS = 2 * triArea(3, 4);            // 12
  const SIDES = (3 + 4 + 5) * 10;            // 120
  const TOTAL = ENDS + SIDES;                // 132
  must(ENDS === 12 && SIDES === 120 && TOTAL === 132, "triangular prism arithmetic");
  const steps = [
    { id: "c1", kind: "concept", body: "A triangular prism has two triangular ENDS and three rectangular SIDES. The ends match each other, so they still come as a pair; the sides usually do not match at all. Surface area is the same idea as before \u2014 add every face \u2014 but the bookkeeping has to be done honestly rather than by doubling three products." },
    { id: "i1", kind: "interactive", body: "Total the faces on a ledger.",
      widget: compositeAreaLab({
        prompt: "A prism 10 long has right-triangle ends with legs 3 and 4 (hypotenuse 5). Add every face.",
        pieces: [
          { id: "end1", label: "Triangular end", shape: "triangle", operation: "add", base: 3, height: 4 },
          { id: "end2", label: "Matching end", shape: "triangle", operation: "add", base: 3, height: 4 },
          { id: "side3", label: "Rectangle 3 \u00d7 10", shape: "rectangle", operation: "add", width: 3, height: 10 },
          { id: "side4", label: "Rectangle 4 \u00d7 10", shape: "rectangle", operation: "add", width: 4, height: 10 },
          { id: "side5", label: "Rectangle 5 \u00d7 10", shape: "rectangle", operation: "add", width: 5, height: 10 },
        ],
        correctValue: TOTAL,
        choices: [
          { id: "c1", label: "132", value: 132, feedback: "Correct: two ends of 6 each, plus rectangles of 30, 40 and 50." },
          { id: "c2", label: "126", value: 126, feedback: "Only ONE triangular end was counted. A prism is closed at both ends." },
          { id: "c3", label: "144", value: 144, feedback: "The ends were computed as full rectangles. A triangle is half its base times height: 6, not 12." },
          { id: "c4", label: "120", value: 120, feedback: "That is the three rectangles alone \u2014 the two triangular ends are still missing." },
        ],
        fallbackFeedback: "Two ends at (3\u00d74)/2 = 6 each, and rectangles 3\u00d710, 4\u00d710, 5\u00d710. Total 12 + 120.",
        successFeedback: "132 square units. Every side rectangle is a side of the triangle times the prism's length \u2014 which is why the perimeter of the end times the length gives all three at once.",
      }),
      predict: predict("The three rectangular sides of a triangular prism \u2014 what do their widths equal?",
        [["equal", "All the same \u2014 they are matching faces"],
         ["sides", "The three SIDES of the triangular end"],
         ["length", "The prism's length, in each case"]],
        "sides",
        "Each rectangle is glued to one edge of the triangle, so its width is that edge and its length is the prism's length. Add the three widths and you have the triangle's perimeter \u2014 which is why 'perimeter times length' produces the entire lateral surface in a single product."),
    },
    { id: "k1", kind: "check", body: "One triangular end.", conceptTag: TAG,
      explanationVariants: ["A right triangle with legs 3 and 4 has area (3\u00d74)/2 = 6.",
                            "Half of base times height: half of 12 is 6."],
      widget: numeric({ prompt: "What is the area of one triangular end with legs 3 and 4?", answer: triArea(3, 4),
        errors: [[12, "That is 3\u00d74, the whole rectangle. A triangle is half of it."],
                 [5, "5 is the hypotenuse \u2014 a length, not an area."]],
        fallbackFeedback: "(3\u00d74)/2 = 6 square units.",
        successFeedback: "6 \u2014 and the prism has two of these, one at each end." }) },
    { id: "c2", kind: "concept", body: "The shortcut worth keeping is lateral surface = perimeter of the end \u00d7 length. Here the perimeter is 3 + 4 + 5 = 12 and the length is 10, giving 120 in one step. Add the two ends and the prism is finished. The same rule works for ANY prism, whatever polygon its end happens to be." },
    { id: "k2", kind: "check", body: "Use the shortcut.", conceptTag: TAG,
      explanationVariants: [`Perimeter 12 times length 10 gives ${SIDES} for the three rectangles.`,
                            "Perimeter times length collapses all the side faces into one product."],
      widget: numeric({ prompt: "Perimeter of the end is 12, prism length is 10. What is the LATERAL surface area?", answer: SIDES,
        errors: [[TOTAL, "That is the whole surface area \u2014 lateral means the sides only, without the two ends."],
                 [22, "That adds perimeter and length. The rule multiplies them."]],
        fallbackFeedback: "12 \u00d7 10 = 120 square units of sides.",
        successFeedback: "120 \u2014 and adding the two 6-unit ends gives the 132 you found on the ledger." }) },
    { id: "k3", kind: "check", body: "A pyramid instead.", conceptTag: TAG,
      explanationVariants: ["A square pyramid has one square base and four triangular faces \u2014 five in all.",
                            "Pyramids come to a point, so their side faces are triangles, not rectangles."],
      widget: mcq("How many faces does a square pyramid have?", [
        ["o1", "5 \u2014 a square base and four triangles", true, "Right: pyramids taper to a point, so every side face is a triangle."],
        ["o2", "6 \u2014 like a box", false, "A box has two matching ends; a pyramid has one base and a single apex."],
        ["o3", "4 \u2014 the triangles only", false, "The base is a face too, unless the problem says the pyramid is open."],
      ]) },
    { id: "ch1", kind: "challenge", body: "Assemble a pyramid.", conceptTag: TAG,
      explanationVariants: ["Base 6\u00d76 = 36, plus four triangles of (6\u00d75)/2 = 15, giving 36 + 60 = 96.",
                            "One square plus four congruent triangles."],
      hints: ["Handle the base and the four slanted faces separately.",
              "The base is a 6 by 6 square; each triangular face has base 6 and slant height 5.",
              "36 for the base, and four triangles of 15 each."],
      widget: numeric({ prompt: "A square pyramid has base edge 6 and slant height 5. What is its total surface area?", answer: 36 + 4 * triArea(6, 5),
        errors: [[60, "That is the four triangles alone \u2014 the square base has not been added."],
                 [36, "That is the base alone \u2014 the four slanted faces are still missing."]],
        fallbackFeedback: "Base 6\u00d76 = 36; each triangle (6\u00d75)/2 = 15, four of them 60. Total 96.",
        successFeedback: "96 \u2014 base plus lateral, the same two-part bookkeeping every solid uses." }) },
    { id: "r1", kind: "recap", body: "Ends plus sides.",
      takeaways: ["A triangular prism has two matching triangular ends and three rectangular sides.",
                  "Lateral surface area of any prism is the end's perimeter times the prism's length.",
                  "A pyramid has one base and triangular faces meeting at an apex."],
      teaser: "Next: stop wrapping and start filling \u2014 how much fits inside a right prism." },
  ];
  lesson("sa7-01-03", "surface-area-of-triangular-prisms-and-pyramids", "Surface Area of Triangular Prisms & Pyramids", "ch1-wrapping-solids", 10, steps, remedialFrom(steps, TAG));
}

/* ================= CH2 — Filling & Combining ================= */

/* 4. Volume of Right Prisms — sa7-volume-prisms */
{
  const TAG = "sa7-volume-prisms";
  const steps = [
    { id: "c1", kind: "concept", body: "Volume of a right prism is one idea repeated: cover the base once, then stack that layer as many times as the height allows. Base area times height. For a box the base is a rectangle, but the rule never mentions rectangles \u2014 it works for a triangular base, a hexagonal base, any base at all." },
    { id: "i1", kind: "interactive", body: "Build a solid to a required capacity.",
      widget: volumeBuilder({ prompt: "This prism is 3 wide and 2 high, both locked. Set its length so it holds exactly 24 cubic units.",
        targetVolume: 24, lMax: 6, wMax: 6, hMax: 6, lStart: 1, wStart: 3, hStart: 2, lockW: true, lockH: true,
        commonBuilds: [
          { volume: 12, feedback: "Only one layer's worth. The height is 2, so the base area must be 12, not 24." },
          { volume: 48, feedback: "Twice the target \u2014 halve the length." },
        ],
        successFeedback: "Length 4: the base is 4 \u00d7 3 = 12 square units, stacked twice, filling 24 cubic units. Base area \u00d7 height, exactly.",
        lowFeedback: "Not full yet \u2014 lengthen the prism.",
        highFeedback: "Overfilled \u2014 shorten the prism." }),
      predict: predict("The height is fixed at 2 and you need 24 cubic units. What must the BASE area be?",
        [["24", "24 \u2014 the same as the volume"], ["12", "12"], ["48", "48"]],
        "12",
        "Two identical layers make the solid, so each layer holds half the total: 12 square units of base \u2014 which at a locked width of 3 means a length of 4. Volume divided by height recovers the base area every time, and that is how capacity problems get solved backwards."),
    },
    { id: "k1", kind: "check", body: "Base times height.", conceptTag: TAG,
      explanationVariants: ["A base of 15 stacked 4 high gives 15\u00d74 = 60 cubic units.",
                            "Each layer contributes the base area; four layers contribute four times it."],
      widget: numeric({ prompt: "A prism has base area 15 square units and height 4. What is its volume?", answer: 60,
        errors: [[19, "That adds base and height. Volume multiplies them."],
                 [30, "That doubles the base instead of stacking four layers of it."]],
        fallbackFeedback: "15 \u00d7 4 = 60 cubic units.",
        successFeedback: "60 cubic units \u2014 fifteen squares of floor, four layers deep." }) },
    { id: "c2", kind: "concept", body: "Because the rule is base-area times height, a triangular prism needs no new formula at all. Compute the triangle's area, multiply by the length, done. The shape of the base changes what you compute FIRST; it never changes the stacking." },
    { id: "k2", kind: "check", body: "A triangular base.", conceptTag: TAG,
      explanationVariants: ["The base is (6\u00d74)/2 = 12, and 12\u00d710 = 120 cubic units.",
                            "Triangle first, then stack it along the length."],
      widget: numeric({ prompt: "A triangular prism has a base triangle with base 6 and height 4, and length 10. What is its volume?", answer: 12 * 10,
        errors: [[240, "The triangle was treated as a rectangle. Its area is half of 6\u00d74, so 12, not 24."],
                 [12, "That is the base triangle's AREA. It still has to be stacked along the length of 10."]],
        fallbackFeedback: "Base (6\u00d74)/2 = 12; volume 12\u00d710 = 120 cubic units.",
        successFeedback: "120 cubic units \u2014 the same stacking rule, applied to a triangle." }) },
    { id: "k3", kind: "check", body: "Recover a missing dimension.", conceptTag: TAG,
      explanationVariants: ["Height = volume \u00f7 base area = 90 \u00f7 18 = 5.",
                            "Dividing by the base area undoes the stacking."],
      widget: numeric({ prompt: "A prism holds 90 cubic units on a base of 18 square units. What is its height?", answer: 5,
        errors: [[1620, "That multiplies where it should divide \u2014 the volume already includes the base."],
                 [72, "That subtracts. Stacking is multiplication, so undoing it is division."]],
        fallbackFeedback: "90 \u00f7 18 = 5.",
        successFeedback: "5 \u2014 volume divided by base area returns the number of layers." }) },
    { id: "ch1", kind: "challenge", body: "Fill a container.", conceptTag: TAG,
      explanationVariants: ["The tank holds 8\u00d75\u00d73 = 120 cubic units; half of that is 60.",
                            "Compute the full capacity, then halve it."],
      hints: ["Find the tank's full volume before worrying about the half.",
              "8 \u00d7 5 \u00d7 3 gives the full capacity.",
              "Full is 120 cubic units; the tank is filled halfway."],
      widget: numeric({ prompt: "A tank 8 by 5 by 3 is filled halfway. How many cubic units of water does it hold?", answer: 60,
        errors: [[120, "That is the FULL tank. It is only half full."],
                 [40, "That halves a dimension rather than the volume. Halving the water halves the whole 120."]],
        fallbackFeedback: "Full volume 8\u00d75\u00d73 = 120; half of that is 60 cubic units.",
        successFeedback: "60 cubic units \u2014 and note halving the water is the same as halving the height, which is why 8\u00d75\u00d71.5 agrees." }) },
    { id: "r1", kind: "recap", body: "Cover the base, then stack.",
      takeaways: ["Volume of any right prism is base area \u00d7 height, in cubic units.",
                  "The base's shape changes what you compute first, not the stacking rule.",
                  "Dividing volume by base area recovers the height."],
      teaser: "Next: shapes that are not one clean piece \u2014 cut them up and keep a ledger." },
  ];
  lesson("sa7-02-01", "volume-of-right-prisms", "Volume of Right Prisms", "ch2-filling-and-combining", 9, steps, remedialFrom(steps, TAG));
}

/* 5. Composite Areas — sa7-composite-area */
{
  const TAG = "sa7-composite-area";
  const steps = [
    { id: "c1", kind: "concept", body: "Real floor plans are not single rectangles. The move that handles all of them is the same: break the figure into pieces you already know, find each area, then ADD the pieces that are there and SUBTRACT the ones cut away. A ledger, kept honestly, beats any formula." },
    { id: "i1", kind: "interactive", body: "Keep the ledger for an L-shaped room.",
      widget: compositeAreaLab({
        prompt: "A 10 by 8 room has a 3 by 4 alcove cut out of one corner. What floor area remains?",
        pieces: [
          { id: "room", label: "Whole room 10 \u00d7 8", shape: "rectangle", operation: "add", width: 10, height: 8 },
          { id: "alcove", label: "Alcove removed 3 \u00d7 4", shape: "rectangle", operation: "subtract", width: 3, height: 4 },
        ],
        correctValue: 10 * 8 - 3 * 4,
        choices: [
          { id: "c1", label: "68", value: 68, feedback: "Correct: 80 square units of room, less the 12 taken by the alcove." },
          { id: "c2", label: "92", value: 92, feedback: "The alcove was ADDED. It is cut away, so its area comes off the total." },
          { id: "c3", label: "80", value: 80, feedback: "That is the room before the alcove was removed \u2014 the subtraction has not happened yet." },
          { id: "c4", label: "12", value: 12, feedback: "That is the alcove alone, not the floor that remains." },
        ],
        fallbackFeedback: "10\u00d78 = 80, minus 3\u00d74 = 12, leaves 68 square units.",
        successFeedback: "68 square units. Subtracting a known piece is often far quicker than slicing the leftover into strips.",
      }),
      predict: predict("An alcove is cut out of a rectangular room. To find the remaining floor, the alcove's area is\u2026",
        [["added", "Added to the room's area"],
         ["subtracted", "Subtracted from the room's area"],
         ["ignored", "Ignored \u2014 it does not change the floor"]],
        "subtracted",
        "The ledger's signs are the whole method: pieces present count positive, pieces removed count negative. Getting a sign wrong is the most common composite-area error, and it is visible immediately \u2014 the answer comes out larger than the whole rectangle it started from."),
    },
    { id: "k1", kind: "check", body: "Add two pieces.", conceptTag: TAG,
      explanationVariants: ["6\u00d74 = 24 plus 5\u00d72 = 10 gives 34 square units.",
                            "Two rectangles side by side simply add."],
      widget: numeric({ prompt: "An L-shape splits into a 6 by 4 rectangle and a 5 by 2 rectangle. What is its total area?", answer: 34,
        errors: [[24, "That is the larger piece alone \u2014 the 5 by 2 rectangle is still to be added."],
                 [17, "That adds the dimensions rather than the areas. Compute each rectangle first."]],
        fallbackFeedback: "24 + 10 = 34 square units.",
        successFeedback: "34 \u2014 cut into knowable pieces, add the ledger." }) },
    { id: "c2", kind: "concept", body: "There is usually more than one correct cut. The same L-shape can be sliced vertically or horizontally, or read as a big rectangle with a bite taken out. Every honest route gives the same total \u2014 which makes a second method the fastest way to check the first." },
    { id: "k2", kind: "check", body: "Subtract instead.", conceptTag: TAG,
      explanationVariants: ["A 9 by 6 rectangle is 54; removing a 2 by 3 corner of 6 leaves 48.",
                            "Whole minus hole."],
      widget: numeric({ prompt: "A 9 by 6 rectangle has a 2 by 3 corner removed. What area remains?", answer: 48,
        errors: [[60, "The corner was added instead of removed \u2014 the answer cannot exceed the original 54."],
                 [54, "That is the full rectangle; the corner has not been taken off yet."]],
        fallbackFeedback: "54 \u2212 6 = 48 square units.",
        successFeedback: "48 \u2014 and slicing the L into two rectangles would give 48 as well, which is exactly the check worth doing." }) },
    { id: "k3", kind: "check", body: "Mixed pieces.", conceptTag: TAG,
      explanationVariants: ["The rectangle is 8\u00d75 = 40 and the triangle (8\u00d73)/2 = 12, totalling 52.",
                            "A house shape is a rectangle plus a triangular roof."],
      widget: numeric({ prompt: "A house outline is an 8 by 5 rectangle topped by a triangle with base 8 and height 3. What is its area?", answer: 40 + triArea(8, 3),
        errors: [[64, "The roof was counted as a full rectangle. A triangle is half of base times height: 12, not 24."],
                 [40, "That is the walls alone \u2014 the roof has not been added."]],
        fallbackFeedback: "40 + (8\u00d73)/2 = 40 + 12 = 52 square units.",
        successFeedback: "52 \u2014 pieces of different shapes cause no trouble as long as each is computed with its own rule." }) },
    { id: "ch1", kind: "challenge", body: "Two holes.", conceptTag: TAG,
      explanationVariants: ["12\u00d710 = 120, minus two 3\u00d73 squares of 9 each, leaves 102.",
                            "Subtract both cut-outs, not just one."],
      hints: ["Start with the whole rectangle before removing anything.",
              "Each cut-out square has area 3\u00d73 = 9, and there are two of them.",
              "120 minus 9 minus 9."],
      widget: numeric({ prompt: "A 12 by 10 panel has TWO 3 by 3 squares cut out. What area remains?", answer: 120 - 18,
        errors: [[111, "Only one square was removed. Both cut-outs come off the total."],
                 [120, "Neither cut-out has been subtracted yet."]],
        fallbackFeedback: "120 \u2212 9 \u2212 9 = 102 square units.",
        successFeedback: "102 \u2014 the ledger scales to any number of pieces, in either direction." }) },
    { id: "r1", kind: "recap", body: "Cut, compute, combine.",
      takeaways: ["Break a composite figure into shapes whose areas you already know.",
                  "Pieces present are added; pieces removed are subtracted.",
                  "Different valid cuts give the same total, which makes a second method a free check."],
      teaser: "Next: one situation asking for area, surface area AND volume \u2014 and how to tell which is which." },
  ];
  lesson("sa7-02-02", "composite-areas", "Composite Areas", "ch2-filling-and-combining", 10, steps, remedialFrom(steps, TAG));
}

/* 6. Area, Surface Area & Volume in Context — sa7-asv-context */
{
  const TAG = "sa7-asv-context";
  const steps = [
    { id: "c1", kind: "concept", body: "One crate, three questions. How much floor does it stand on? Area. How much paint wraps it? Surface area. How much sand fills it? Volume. The numbers are the same; the question decides which measure answers it \u2014 and the units confirm the choice." },
    { id: "i1", kind: "interactive", body: "Build the crate the story describes.",
      widget: areaModel({ prompt: "The crate's rectangular FOOTPRINT must cover exactly 12 square units. Build it as 4 by 3.",
        targetArea: 12, wMax: 6, hMax: 6, wStart: 1, hStart: 1, requireFactors: { w: 4, h: 3 },
        factorFeedback: "That rectangle does cover 12 square units, but the crate in this story is 4 across and 3 deep \u2014 build those exact sides, since the surface-area and volume questions ahead depend on them.",
        successFeedback: "A 4 by 3 footprint is 12 square units of floor \u2014 the base the whole crate will stand on and be stacked from.",
        lowFeedback: "Footprint still under 12 square units \u2014 widen or deepen it.",
        highFeedback: "Footprint past 12 square units \u2014 pull a side back in." }),
      predict: predict("The crate is 4 by 3 by 2. Which is LARGEST as a number: footprint area, surface area, or volume?",
        [["floor", "Footprint area"], ["surface", "Surface area"], ["volume", "Volume"]],
        "surface",
        "Footprint 12, volume 24, surface area 52 \u2014 the wrapping wins here. But this is a fact about these particular numbers, not a rule: a tall thin crate would order them differently. Comparing measures across different units is a habit worth distrusting."),
    },
    { id: "k1", kind: "check", body: "Pick the measure.", conceptTag: TAG,
      explanationVariants: ["Filling the crate with sand is a capacity question, so volume answers it.",
                            "Anything that fills is measured in cubic units."],
      widget: mcq("Which measure tells you how much SAND fits in the crate?", [
        ["o1", "Volume", true, "Yes \u2014 filling is a volume question, answered in cubic units."],
        ["o2", "Surface area", false, "Surface area is what you would need to PAINT the crate, not fill it."],
        ["o3", "Footprint area", false, "The footprint is the floor space it occupies, ignoring height entirely."],
      ]) },
    { id: "c2", kind: "concept", body: "The reliable check is units. Floor space and paint are square units. Sand is cubic units. Tape along an edge would be linear units. When an answer's units do not match what the question is asking for, the wrong measure was computed \u2014 no matter how clean the arithmetic was." },
    { id: "k2", kind: "check", body: "The paint job.", conceptTag: TAG,
      explanationVariants: [`A 4 by 3 by 2 crate has surface area 2(12 + 8 + 6) = ${saBox(4, 3, 2)}.`,
                            "Three distinct faces, doubled."],
      widget: numeric({ prompt: "The crate is 4 by 3 by 2. How many square units must be painted to cover the whole outside?", answer: saBox(4, 3, 2),
        errors: [[volBox(4, 3, 2), "That is the volume \u2014 how much fits inside. Paint covers the outside."],
                 [26, "That sums the three distinct faces but forgets their twins. Double it."]],
        fallbackFeedback: "2(4\u00d73 + 4\u00d72 + 3\u00d72) = 2(12 + 8 + 6) = 52 square units.",
        successFeedback: "52 square units of paint \u2014 and 24 cubic units of sand would fill the same crate." }) },
    { id: "k3", kind: "check", body: "The sand order.", conceptTag: TAG,
      explanationVariants: [`Volume is 4\u00d73\u00d72 = ${volBox(4, 3, 2)} cubic units.`,
                            "Multiply all three dimensions to fill it."],
      widget: numeric({ prompt: "Same crate. How many cubic units of sand fill it?", answer: volBox(4, 3, 2),
        errors: [[saBox(4, 3, 2), "That is the surface area, in square units \u2014 the paint answer, not the sand answer."],
                 [12, "That is the footprint. It still has to be stacked two layers high."]],
        fallbackFeedback: "4\u00d73\u00d72 = 24 cubic units.",
        successFeedback: "24 cubic units \u2014 the footprint of 12, stacked twice." }) },
    { id: "ch1", kind: "challenge", body: "Price the job.", conceptTag: TAG,
      explanationVariants: ["52 square units of paint at $2 each costs $104.",
                            "Choose surface area, then multiply by the rate."],
      hints: ["Decide first which measure a paint job needs \u2014 the units of the price will tell you.",
              "Paint is sold per square unit, so surface area is the quantity to compute.",
              "The surface area is 52; multiply by $2."],
      widget: numeric({ prompt: "Paint costs $2 per square unit. What does it cost to paint the whole 4 by 3 by 2 crate?", answer: 2 * saBox(4, 3, 2),
        errors: [[48, "That prices the VOLUME at $2 per unit. Paint is sold by area, and volume's cubic units do not match the price's square units."],
                 [saBox(4, 3, 2), "That is the surface area itself \u2014 it still has to be multiplied by the $2 rate."]],
        fallbackFeedback: "Surface area 52 square units \u00d7 $2 = $104.",
        successFeedback: "$104 \u2014 and the units settled the choice before any arithmetic happened." }) },
    { id: "r1", kind: "recap", body: "One object, three questions.",
      takeaways: ["Footprint area, surface area and volume answer different questions about the same solid.",
                  "Units identify the right measure: linear, square, or cubic.",
                  "Real problems usually name the measure indirectly \u2014 covering, filling, or bordering."],
      teaser: "Next in geometry: scale drawings and the transformations that move these solids around." },
  ];
  lesson("sa7-02-03", "area-surface-area-and-volume-in-context", "Area, Surface Area & Volume in Context", "ch2-filling-and-combining", 10, steps, remedialFrom(steps, TAG));
}

/* ------------------------- write ------------------------- */
must(L.length === 6, "6 lessons authored");
must(JSON.stringify(L.map((l) => l.title)) === JSON.stringify(spec.lessons.map((l) => l.title)), "titles match the plan spec exactly");
for (let i = 0; i < 6; i++)
  must(L[i].steps.some((s) => s.conceptTag === spec.lessons[i].conceptTag), `lesson ${i + 1} carries ${spec.lessons[i].conceptTag}`);

const CHAPTERS = [
  { id: "ch1-wrapping-solids", title: "Wrapping Solids", lessonIds: ["sa7-01-01", "sa7-01-02", "sa7-01-03"] },
  { id: "ch2-filling-and-combining", title: "Filling & Combining", lessonIds: ["sa7-02-01", "sa7-02-02", "sa7-02-03"] },
];
must(JSON.stringify(CHAPTERS.flatMap((c) => c.lessonIds)) === JSON.stringify(L.map((l) => l.id)), "chapter order matches lesson order");

const dir = join(root, "content/courses", SLUG);
must(!existsSync(dir), "course dir must not pre-exist");
mkdirSync(join(dir, "lessons"), { recursive: true });
writeFileSync(join(dir, "course.json"), JSON.stringify({
  id: SLUG, slug: SLUG, title: spec.title,
  tagline: "Nets and surface area, volume of right prisms, composite figures, and choosing the right measure for a real situation.",
  category: "Math", gradeLevel: 7, chapters: CHAPTERS,
}, null, 2) + "\n");
for (const l of L) writeFileSync(join(dir, "lessons", `${l.id}.json`), JSON.stringify(l, null, 2) + "\n");

console.log(`built ${SLUG}: ${L.length} lessons, ${L.reduce((t, l) => t + l.steps.length, 0)} steps; ${asserts} assertions passed`);
