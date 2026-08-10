#!/usr/bin/env node
// S197 — Batch F course 5/6: volume-problems-g5 (5.MD.C.3, 5.MD.C.4, 5.MD.C.5).
// Zero new generator code.
//
// WHY g4-multiply RATHER THAN A VOLUME FAMILY. box-volume and fraction-volume are
// authored-template LOOKUP families (see authoredTemplateIndependent.cjs) and cannot carry a new
// prompt. No computational route multiplies three numbers. But V = B x h is itself the standard's
// framing (5.MD.C.5b), and it decomposes into two multiplications the solver DOES compute:
//     base area   = l x w      via mbMultiplyTensNumeric  (ns[0]*ns[1])
//     volume      = B x h      via mbMultiplyTensNumeric  (ns[0]*ns[1])
// A missing dimension recovers by mbDivideBigNumeric, and a composite solid rides
// mbMultiStepNumeric (ns[0]*ns[1] − ns[2]) — build the block, remove the notch.
// Every route reads ns POSITIONALLY across the whole prompt, so each graded prompt LEADS with its
// operands; asserted per step.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "volume-problems-g5");
if (!spec || spec.lessons.length !== 8) throw new Error("spec course missing or wrong size");

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
const AREA_T = corpusTemplate("areaModel", "measurement-data");
const BAR_T = corpusTemplate("barBuilder", "measurement-data");
const EST_T = corpusTemplate("estimateSlider", "multiplication-division");

const REG_MB = new Set(["mbTimesAsManyMcq","mbTimesAsManyNumeric","mbComparisonEquationsMcq",
  "mbComparisonEquationsNumeric","mbAdditiveVsMultiplicativeMcq","mbAdditiveVsMultiplicativeNumeric",
  "mbFactorsMcq","mbFactorsNumeric","mbMultiplesMcq","mbPrimeCompositeMcq","mbPrimeCompositeNumeric",
  "mbMultiplyTensMcq","mbMultiplyTensNumeric","mbAreaModel1DigitMcq","mbAreaModel1DigitNumeric",
  "mbAreaModel2DigitMcq","mbAreaModel2DigitNumeric","mbRemaindersMcq","mbRemaindersNumeric",
  "mbDivideBigNumeric","mbInterpretRemaindersMcq","mbInterpretRemaindersNumeric","mbPatternsMcq",
  "mbPatternsNumeric","mbMultiStepNumeric"]);
const REG = { "g4-multiply": REG_MB };

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

function traps2(answer, cands) {
  const out = [];
  for (const [v, fb] of cands) {
    if (v !== answer && v >= 0 && Number.isInteger(v) && !out.some((o) => o[0] === v)) out.push([v, fb]);
    if (out.length === 2) break;
  }
  for (let d = 3; out.length < 2; d++) {
    const v = answer + d;
    if (!out.some((o) => o[0] === v)) {
      out.push([v, "That value does not follow from the layer size and the number of layers."]);
    }
  }
  return out.map(([value, feedback]) => ({ value, feedback }));
}

/* ---------------- graded mirrors — prompts LEAD with their operands ---------------- */
function BaseAreaNumeric(r) {
  const l = pick(r, 3, 9), w = pick(r, 3, 9);
  return { gen: "g4-multiply", form: "mbMultiplyTensNumeric",
    prompt: `Compute ${l} × ${w} — the base area of a ${l}-by-${w} rectangle, in square units.`,
    answer: l * w,
    traps: traps2(l * w, [
      [l + w, `Adding gives the distance round part of the edge, not the number of squares covering the base.`],
      [2 * (l + w), `That is the perimeter of the base; area counts the squares inside it.`]]) };
}
function VolumeFromBaseNumeric(r) {
  const base = pick(r, 6, 40), h = pick(r, 2, 9);
  return { gen: "g4-multiply", form: "mbMultiplyTensNumeric",
    prompt: `Compute ${base} × ${h} — a base of ${base} square units repeated through ${h} layers.`,
    answer: base * h,
    traps: traps2(base * h, [
      [base + h, `Adding the height treats a layer count as extra cubes; each layer repeats the whole base.`],
      [base, `${base} is ONE layer; the solid stacks ${h} of them.`]]) };
}
function MissingDimensionNumeric(r) {
  const base = pick(r, 5, 30), h = pick(r, 2, 9);
  const vol = base * h;
  return { gen: "g4-multiply", form: "mbDivideBigNumeric",
    prompt: `Compute ${vol} ÷ ${base} — the height of a solid with volume ${vol} and base area ${base}.`,
    answer: h,
    traps: traps2(h, [
      [vol - base, `Subtracting removes one layer's worth once; the height counts how many layers FIT.`],
      [vol, `${vol} is the whole volume; the height is how many base-layers it contains.`]]) };
}
function CompositeNumeric(r) {
  const a = pick(r, 4, 9), b = pick(r, 4, 9);
  const notch = pick(r, 3, a * b - 4);
  const ans = a * b - notch;
  must(ans > 0, "composite volume must stay positive");
  return { gen: "g4-multiply", form: "mbMultiStepNumeric",
    prompt: `Compute ${a} × ${b} − ${notch} — a block of ${a} by ${b} cubes with a notch of ${notch} removed.`,
    answer: ans,
    traps: traps2(ans, [
      [a * b, `That reported the full block; the notch of ${notch} cubes still has to come out.`],
      [a * b + notch, `A notch removes cubes, so the last step subtracts rather than adds.`]]) };
}
function CompareSolidsNumeric(r) {
  const base = pick(r, 4, 20), h = pick(r, 2, 6);
  return { gen: "g4-multiply", form: "mbTimesAsManyNumeric",
    prompt: `Compute ${base} × ${h} — the volume of the taller solid, whose base is ${base} and height ${h}.`,
    answer: base * h,
    traps: traps2(base * h, [
      [base + h, `Adding mixes a layer size with a layer count; the layers repeat the base.`],
      [h, `${h} is the number of layers, not the cubes they contain.`]]) };
}
/* ---------------- variant-less reasoning MCQs ---------------- */
function CountCubesMcq() {
  return { kind: "mcq",
    prompt: `Why does counting unit cubes measure volume?`,
    options: [
      { label: "Because each cube fills one unit of space, so the count IS the space filled", correct: true, feedback: `Correct — volume is a count of equal units, exactly as area counts equal squares.` },
      { label: "Because cubes are easy to draw", correct: false, feedback: `Convenience is not the reason; the cube being one unit of space is.` },
      { label: "Because cubes have six faces", correct: false, feedback: `Face count describes the shape's surface, which is a different measurement entirely.` },
      { label: "It does not — volume needs a formula", correct: false, feedback: `The formula is a shortcut for the count, not a replacement for what volume means.` },
    ] };
}
function LayersMcq() {
  return { kind: "mcq",
    prompt: `A box has a base of 12 cubes and is 4 layers tall. How does the height act?`,
    options: [
      { label: "It repeats the base 4 times, giving 48 cubes", correct: true, feedback: `Correct — each layer is a full copy of the base, so the height multiplies rather than adds.` },
      { label: "It adds 4 cubes to the base, giving 16", correct: false, feedback: `Adding would treat the height as a handful of extra cubes; each layer copies the whole base.` },
      { label: "It has no effect on the count", correct: false, feedback: `Stacking layers is exactly what turns a flat base into a solid with volume.` },
      { label: "It halves the base each layer", correct: false, feedback: `Every layer is identical to the base; nothing shrinks as the stack rises.` },
    ] };
}
function FormulaLwhMcq() {
  return { kind: "mcq",
    prompt: `Why does V = l × w × h give the same answer as counting cubes?`,
    options: [
      { label: "Because l × w counts one layer and h repeats it", correct: true, feedback: `Correct — the formula is the counting, organised: a layer first, then the stack.` },
      { label: "Because three numbers always multiply to a volume", correct: false, feedback: `Only lengths along three perpendicular directions do; any three numbers would not.` },
      { label: "Because the formula was chosen by convention", correct: false, feedback: `It follows from the structure of the stack rather than from agreement.` },
      { label: "It does not always agree with counting", correct: false, feedback: `It always agrees for a right rectangular prism, because it IS the count rearranged.` },
    ] };
}
function FormulaBhMcq() {
  return { kind: "mcq",
    prompt: `What advantage does V = B × h have over V = l × w × h?`,
    options: [
      { label: "It works for any prism, whatever shape the base is", correct: true, feedback: `Correct — once you can find the base's area, the stacking argument carries across unchanged.` },
      { label: "It uses fewer letters", correct: false, feedback: `Brevity is incidental; generality across base shapes is the real gain.` },
      { label: "It gives a larger answer", correct: false, feedback: `The two give identical answers for a rectangular prism; B is simply l × w.` },
      { label: "It only works for cubes", correct: false, feedback: `It is the more general of the two, not the more restricted.` },
    ] };
}
function CompositeMcq() {
  return { kind: "mcq",
    prompt: `A solid is a 5-by-6 block with a notch of 8 cubes cut out. How do you find its volume?`,
    options: [
      { label: "Find the full block, then subtract the notch", correct: true, feedback: `Correct — build the simple solid first and remove what is missing, exactly as with area.` },
      { label: "Add the notch to the block", correct: false, feedback: `A notch is space removed, so the count must fall rather than rise.` },
      { label: "Multiply the block by the notch", correct: false, feedback: `Multiplying would scale the whole solid; the notch is a fixed amount taken away.` },
      { label: "Ignore the notch, since it is small", correct: false, feedback: `Every removed cube changes the volume by one, however small the notch looks.` },
    ] };
}
function StoryMcq() {
  return { kind: "mcq",
    prompt: `"A tank is 4 m by 3 m at the base and 2 m deep." What is the plan?`,
    options: [
      { label: "Find the base area 4 × 3, then multiply by the depth", correct: true, feedback: `Correct — the base area is one layer, and the depth says how many such layers stack.` },
      { label: "Add 4, 3 and 2", correct: false, feedback: `Adding lengths gives a distance, not a count of cubic units.` },
      { label: "Multiply 4 by 3 and stop", correct: false, feedback: `That is the base area alone — a flat measurement, with the depth still unused.` },
      { label: "Multiply 4 by 2 only", correct: false, feedback: `That uses one side and the depth, leaving the third dimension out of the solid entirely.` },
    ] };
}

const REUSE = { BaseAreaNumeric, VolumeFromBaseNumeric, MissingDimensionNumeric, CompositeNumeric,
  CompareSolidsNumeric,
  CountCubesMcq: () => CountCubesMcq(), LayersMcq: () => LayersMcq(),
  FormulaLwhMcq: () => FormulaLwhMcq(), FormulaBhMcq: () => FormulaBhMcq(),
  CompositeMcq: () => CompositeMcq(), StoryMcq: () => StoryMcq() };

function reused(mirror, seedStr, hints, ev,
                fallback = "Find one layer first, then count how many layers the height stacks.") {
  const r = mulberry32(seedFromString(seedStr));
  const out = REUSE[mirror](r);

  if (out.kind === "mcq") {
    must(out.options.length >= 4, `${mirror} needs >=4 options`);
    must(out.options.filter((o) => o.correct).length === 1, `${mirror} mcq correct count`);
    must(out.options[0].correct === true, `${mirror} correct option must stay at index 0`);
    must(new Set(out.options.map((o) => o.label)).size === out.options.length, `${mirror} duplicate labels`);
    const withIds = out.options.map((o, i) => ({ id: `o${i}`, ...o }));
    for (const o of withIds) must(o.feedback.length >= 25, `${mirror} feedback too short`);
    must(new Set(withIds.map((o) => o.feedback)).size === withIds.length, `${mirror} feedback not distinct`);
    return { widget: { type: "mcq", prompt: out.prompt, options: withIds }, hints, ev };
  }

  must(REG[out.gen]?.has(out.form), `${mirror}: ${out.gen}/${out.form} NOT registered`);
  const nums = (out.prompt.match(/\d+/g) || []).map(Number);
  if (out.form === "mbMultiplyTensNumeric" || out.form === "mbTimesAsManyNumeric") {
    must(nums[0] * nums[1] === out.answer, `${mirror}: the first two numbers must be the operands`);
  }
  if (out.form === "mbDivideBigNumeric") must(nums[0] / nums[1] === out.answer, `${mirror}: ns0/ns1`);
  if (out.form === "mbMultiStepNumeric") must(nums[0] * nums[1] - nums[2] === out.answer, `${mirror}: ns0*ns1−ns2`);
  const commonErrors = out.traps;
  must(commonErrors.length >= 2, `${mirror} needs 2 traps`);
  must(new Set(commonErrors.map((e) => e.value)).size === commonErrors.length, `${mirror} duplicate traps`);
  for (const e of commonErrors) {
    must(e.value !== out.answer, `${mirror} trap==answer`);
    must(e.feedback.length >= 25, `${mirror} trap feedback short`);
  }
  return { variant: { gen: out.gen, form: out.form },
    widget: { type: "numeric", prompt: out.prompt, answer: out.answer, tolerance: 0, unit: "",
      commonErrors, fallbackFeedback: fallback, successFeedback: `Correct — ${out.answer}.` },
    hints, ev };
}

/* ---------------- manipulatives ---------------- */
function area(prompt, w, h, success, low, high, factorFeedback) {
  const spec2 = structuredClone(AREA_T);
  spec2.prompt = prompt; spec2.targetArea = w * h;
  const bound = Math.max(w, h);
  spec2.wMax = bound; spec2.hMax = bound;
  spec2.wStart = 1; spec2.hStart = 1;
  spec2.square = false;
  spec2.requireFactors = { w, h };
  spec2.factorFeedback = factorFeedback;
  if ("countGrid" in spec2) delete spec2.countGrid;
  if ("commonCounts" in spec2) delete spec2.commonCounts;
  spec2.successFeedback = success; spec2.lowFeedback = low; spec2.highFeedback = high;
  must(h <= spec2.wMax && w <= spec2.hMax, "area TRANSPOSE must also fit the tray");
  must(bound <= 30, `areaModel side ${bound} is too wide to read at 360px`);
  must(factorFeedback && factorFeedback.length >= 25, "areaModel requireFactors needs factorFeedback");
  return spec2;
}
function bars(prompt, categories, target, success, partial) {
  const w = structuredClone(BAR_T);
  w.prompt = prompt; w.categories = categories; w.target = target;
  w.display = "bar"; w.maxVal = Math.max(...target) + 3; w.step = 1; w.histogram = false;
  w.successFeedback = success; w.partialFeedback = partial;
  must(categories.length === target.length, "bars categories/target aligned");
  return w;
}
function estimate(prompt, min, max, target, unitLabel, low, high, success) {
  const w = structuredClone(EST_T);
  w.prompt = prompt; w.min = min; w.max = max; w.start = min; w.target = target;
  w.acceptFactor = 2; w.unitLabel = unitLabel;
  w.ticks = [min, Math.round((min + max) / 2), max];
  w.lowFeedback = low; w.highFeedback = high;
  if ("successFeedback" in w) w.successFeedback = success;
  if ("choices" in w) delete w.choices;
  must(min < target && target < max, "estimate target inside range");
  return w;
}

const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "quantity-composition",
  actionGoal: `Build one layer, then count how many layers the height stacks for ${tag.replace(/-/g, " ")}.`,
  invariants: [`Volume is a count of unit cubes, and a prism organises that count into identical layers: the base area counts one layer and the height counts the layers, which is why ${tag.replace(/-/g, " ")} is a product rather than a sum.`],
  misconceptions: [`Adding the three dimensions instead of multiplying, stopping at the base area, or adding a removed notch instead of subtracting it.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `volume-problems-g5:${tag}`, delayed: true,
  counterfactualPrompt: "If the height doubled but the base stayed the same, what would happen to the cube count?",
});
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

const H = {
  count: ["A cube is one unit of space.", "Count them.", "The count is the volume."],
  layer: ["Base counts one layer.", "Height counts the layers.", "Layers repeat the base."],
  formula: ["l × w is one layer.", "h stacks it.", "B × h generalises."],
  comp: ["Build the simple solid.", "Then remove the notch.", "Subtract once."],
};

const L = [];
const def = (n, c1, c2, i1, checks, recap, teaser) => L.push({ n, c1, c2, i1, checks, recap, teaser });

def(1,
  "Volume is a count: each unit cube fills one unit of space, so the number of cubes that pack a solid IS its volume.",
  "This is the same idea as area, one dimension further on. Area counts equal squares covering a surface; volume counts equal cubes filling a space.",
  { rep: "diagram", widget: () => area("Build the base layer of a solid: a 5-by-4 rectangle of unit cubes.", 5, 4,
      "20 cubes in the base layer — and the volume will be that count repeated for every layer.",
      "Smaller than 20 — keep building until the layer reaches 5 by 4.",
      "Larger than 20 — a side has grown past the dimensions given.",
      "That area is right, but from different sides — this layer must measure 5 across and 4 deep."),
    predict: P("Does counting cubes measure volume?", [{ id: "yes", label: "Yes — a cube is one unit of space" }, { id: "no", label: "No — you need a formula" }], "yes",
      "The formula is a shortcut for the count; the count is what volume means.") },
  [
    reused("CountCubesMcq", "g5v1-k1", H.count, ["A cube is one unit.", "The count is the volume."]),
    reused("BaseAreaNumeric", "g5v1-k2", H.layer, ["One layer of squares.", "Multiply the sides."]),
    reused("CountCubesMcq", "g5v1-k3", H.count, ["Same idea as area.", "One dimension further."]),
    reused("BaseAreaNumeric", "g5v1-ch1", H.layer, ["Bigger bases, same counting.", "Length times width."]),
  ],
  ["Volume counts unit cubes.", "Each cube fills one unit of space.", "The formula is a shortcut for the count."],
  "next: stacking the layers.");

def(2,
  "A prism is layers of the same base stacked up. Each layer is a complete copy, so the height MULTIPLIES rather than adds.",
  "A base of 12 cubes, four layers tall, holds 48 cubes — not 16. That distinction is the whole of the volume formula.",
  { rep: "diagram", widget: () => bars("Build four identical layers of 12 cubes each.",
      ["Layer 1", "Layer 2", "Layer 3", "Layer 4"], [12, 12, 12, 12],
      "48 cubes — four complete copies of the 12-cube base.",
      "Every layer is a full copy of the base: build each bar to 12."),
    predict: P("Base of 12, four layers — 16 cubes or 48?", [{ id: "48", label: "48" }, { id: "16", label: "16" }], "48",
      "Each layer repeats the whole base, so four layers hold four twelves.") },
  [
    reused("LayersMcq", "g5v2-k1", H.layer, ["Layers repeat the base.", "Multiply."]),
    reused("VolumeFromBaseNumeric", "g5v2-k2", H.layer, ["Base times layers.", "That is the volume."]),
    reused("LayersMcq", "g5v2-k3", H.layer, ["Not adding.", "Each layer is complete."]),
    reused("VolumeFromBaseNumeric", "g5v2-ch1", H.layer, ["Taller stacks, same rule.", "Base times height."]),
  ],
  ["A prism stacks identical layers.", "The height multiplies the base.", "Adding would count only a handful of cubes."],
  "next: the formula that records it.");

def(3,
  "V = l × w × h records the counting in order: l × w builds one layer, and h stacks it.",
  "The formula is not a rule to memorise separately from the cubes — it IS the cube count, organised so you never have to draw them.",
  { rep: "diagram", widget: () => area("Build the l × w layer for a 6-by-4 base.", 6, 4,
      "24 cubes in the layer — multiply by the height and the formula is complete.",
      "Smaller than 24 — keep building to 6 by 4.",
      "Larger than 24 — a side has overshot the dimensions.",
      "That area is right, but from other sides — this layer must measure 6 across and 4 deep."),
    predict: P("In V = l × w × h, what does l × w produce?", [{ id: "layer", label: "One layer" }, { id: "vol", label: "The whole volume" }], "layer",
      "Two dimensions give a flat layer; the third stacks it into a solid.") },
  [
    reused("FormulaLwhMcq", "g5v3-k1", H.formula, ["l × w is one layer.", "h stacks it."]),
    reused("BaseAreaNumeric", "g5v3-k2", H.layer, ["Multiply the base sides.", "Squares, not cubes yet."]),
    reused("VolumeFromBaseNumeric", "g5v3-k3", H.layer, ["Then multiply by height.", "Cubes at last."]),
    reused("VolumeFromBaseNumeric", "g5v3-ch1", H.formula, ["Any dimensions, same order.", "Layer then stack."]),
  ],
  ["V = l × w × h.", "l × w builds one layer.", "h stacks the layers."],
  "next: the more general form.");

def(4,
  "V = B × h says the same thing more generally: whatever shape the base is, find its area and stack it.",
  "For a rectangular prism B is just l × w, so the two formulas agree. But B × h keeps working when the base is a triangle or an L-shape.",
  { rep: "diagram", widget: () => estimate("A base of 18 square units, 4 layers tall — slide to the volume.", 5, 400, 72, "cubes",
      "Too low — four complete copies of an 18-cube base already pass fifty.",
      "Too high — four layers of 18 is seventy-two, not the hundreds.",
      "72 — the base area repeated once for every layer."),
    predict: P("Why prefer V = B × h?", [{ id: "general", label: "It works for any base shape" }, { id: "short", label: "It is shorter to write" }], "general",
      "The stacking argument never depended on the base being a rectangle.") },
  [
    reused("FormulaBhMcq", "g5v4-k1", H.formula, ["B is the base area.", "Any shape."]),
    reused("VolumeFromBaseNumeric", "g5v4-k2", H.layer, ["Base times height.", "One product."]),
    reused("FormulaBhMcq", "g5v4-k3", H.formula, ["Agrees with l × w × h.", "More general."]),
    reused("VolumeFromBaseNumeric", "g5v4-ch1", H.formula, ["Bigger bases, same stacking.", "Multiply."]),
  ],
  ["V = B × h works for any prism.", "B is the base's area.", "It agrees with l × w × h."],
  "next: working backwards.");

def(5,
  "If the volume and the base are known, the height follows by division: how many base-layers fit inside the volume?",
  "This is the formula run in reverse, and it is the same move as recovering a missing side from an area.",
  { rep: "diagram", widget: () => estimate("Volume 60 cubes with a base of 20 — slide to the height.", 1, 30, 3, "layers",
      "Too low — three layers of twenty are needed to reach sixty.",
      "Too high — more than three layers of twenty would overshoot sixty.",
      "3 — because 60 ÷ 20 = 3, so three base-layers fill the solid."),
    predict: P("Volume 60, base 20 — how is the height found?", [{ id: "div", label: "60 ÷ 20" }, { id: "sub", label: "60 − 20" }], "div",
      "The height counts how many base-layers fit, and counting how many fit is division.") },
  [
    reused("MissingDimensionNumeric", "g5v5-k1", H.layer, ["Divide volume by base.", "Layers fit."]),
    reused("VolumeFromBaseNumeric", "g5v5-k2", H.layer, ["Check by multiplying back.", "It must rebuild."]),
    reused("MissingDimensionNumeric", "g5v5-k3", H.layer, ["Not subtraction.", "Counting how many fit."]),
    reused("MissingDimensionNumeric", "g5v5-ch1", H.layer, ["Any missing dimension.", "Divide it out."]),
  ],
  ["A missing dimension divides out.", "Height counts base-layers.", "Multiplying back checks it."],
  "next: solids made of parts.");

def(6,
  "Composite solids are built from simple ones: find the full block, then subtract what has been cut away.",
  "A notch is space removed, so every cube it takes lowers the count by one. The subtraction happens once, on the whole solid.",
  { rep: "diagram", widget: () => bars("Build a 5-by-6 block as five layers of 6, before the notch is cut.",
      ["L1", "L2", "L3", "L4", "L5"], [6, 6, 6, 6, 6],
      "30 cubes in the full block — the notch of 8 comes off this total, leaving 22.",
      "Every layer holds the same 6 cubes; build each bar to 6."),
    predict: P("A 5-by-6 block with an 8-cube notch — volume?", [{ id: "22", label: "22" }, { id: "38", label: "38" }], "22",
      "The notch removes cubes, so the count falls from 30 rather than rising.") },
  [
    reused("CompositeMcq", "g5v6-k1", H.comp, ["Full block first.", "Then remove."]),
    reused("CompositeNumeric", "g5v6-k2", H.comp, ["Build, then subtract.", "Once."]),
    reused("CompositeMcq", "g5v6-k3", H.comp, ["A notch lowers the count.", "Never raises it."]),
    reused("CompositeNumeric", "g5v6-ch1", H.comp, ["Bigger notches, same order.", "Subtract at the end."]),
  ],
  ["Build the simple solid first.", "Subtract what was cut away.", "A notch always lowers the count."],
  "next: volume in stories.");

def(7,
  "Volume word problems name the dimensions in words. Find the base, find the height, and the plan writes itself.",
  "The commonest slip is stopping at the base area — a flat answer to a question about space.",
  { rep: "diagram", widget: () => estimate("A tank 4 m by 3 m at the base and 2 m deep — slide to its volume.", 1, 120, 24, "cubic metres",
      "Too low — a base of twelve square metres, two layers deep, passes twenty.",
      "Too high — twelve square metres twice over is twenty-four, not the hundreds.",
      "24 — the base area of 12 repeated through 2 layers of depth."),
    predict: P("4 m by 3 m base, 2 m deep — is 12 the answer?", [{ id: "no", label: "No — that is the base only" }, { id: "yes", label: "Yes" }], "no",
      "Twelve is one layer; the depth stacks two of them, giving 24 cubic metres.") },
  [
    reused("StoryMcq", "g5v7-k1", H.formula, ["Base then height.", "Two steps."]),
    reused("BaseAreaNumeric", "g5v7-k2", H.layer, ["Base area first.", "Multiply the sides."]),
    reused("VolumeFromBaseNumeric", "g5v7-k3", H.layer, ["Then stack it.", "Times the depth."]),
    reused("CompositeNumeric", "g5v7-ch1", H.comp, ["Some stories remove parts.", "Subtract once."]),
  ],
  ["Read the base and the height from the words.", "Base area is only one layer.", "The depth stacks it."],
  "next: comparing two solids.");

def(8,
  "Two solids can be compared without imagining either one: compute both volumes and the larger count wins.",
  "Different shapes can hold identical volumes, which is exactly why the count settles the question and appearances do not.",
  { rep: "diagram", widget: () => estimate("Solid A is 20 by 3; solid B is 12 by 5 — slide to A's volume.", 1, 200, 60, "cubes",
      "Too low — a base of twenty repeated three times already reaches sixty.",
      "Too high — three layers of twenty is sixty, not more.",
      "60 — and B is also 60, so two different shapes hold the same volume."),
    predict: P("A is 20 × 3 and B is 12 × 5. Which is larger?", [{ id: "equal", label: "Equal — both 60" }, { id: "a", label: "A" }], "equal",
      "Different dimensions can multiply to the same count; the shapes differ but the space filled does not.") },
  [
    reused("CompareSolidsNumeric", "g5v8-k1", H.layer, ["Compute both.", "Compare the counts."]),
    reused("VolumeFromBaseNumeric", "g5v8-k2", H.layer, ["Base times height.", "Each solid."]),
    reused("MissingDimensionNumeric", "g5v8-k3", H.layer, ["Recover a dimension.", "Divide."]),
    reused("CompareSolidsNumeric", "g5v8-ch1", H.layer, ["Equal volumes, different shapes.", "The count decides."]),
  ],
  ["Compute both volumes to compare.", "Different shapes can hold equal volume.", "The cube count settles it."],
  "course complete: counted, stacked, formulated, reversed, and compared.");

/* ------------------------------------------------------------------- assembly */
must(L.length === 8, `8 lessons defined, got ${L.length}`);
const chapterTitles = ["Counting and Stacking", "The Volume Formulas", "Composite Solids and Problems"];
const perChapter = [2, 3, 3];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 2 ? 1 : n <= 5 ? 2 : 3);
const outDir = join(root, "content/courses/volume-problems-g5");
mkdirSync(join(outDir, "lessons"), { recursive: true });

const ENTRY = new Set(["numeric", "fractionEntry", "buildExpression", "pointEntry"]);
const MANIP2 = new Set(["numberLineHop", "barBuilder", "estimateSlider", "numberLinePlace", "areaModel", "columnCalc", "fractionBar", "tapDiagram", "plotPoint"]);

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seq = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `g5v-0${ch}-${String(seq).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => {
    const step = { id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
      explanationVariants: c.ev, widget: c.widget, hints: c.hints, cml: cml(tag, "symbolic") };
    if (c.variant) step.variant = c.variant;
    return step;
  };

  const lesson = {
    id, slug, title: row.title, courseId: "volume-problems-g5",
    chapterId: chapters[ch - 1].id, minutes: 7, readingProfile: "standard",
    steps: [
      { id: "c1", kind: "concept", figure: "count-on-hops", body: d.c1, narration: d.c1 },
      { id: "i1", kind: "interactive", body: "Try it.", conceptTag: tag, widget: d.i1.widget(), predict: d.i1.predict, cml: cml(tag, d.i1.rep) },
      stepFromCheck("k1", d.checks[0]),
      { id: "c2", kind: "concept", figure: "count-on-hops", body: d.c2, narration: d.c2 },
      { id: "i2", kind: "interactive", body: "Try it again.", conceptTag: tag, widget: d.i1.widget(), cml: cml(tag, "symbolic") },
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

  let manipSeen = false, entryAfterManip = false;
  for (const s of lesson.steps) {
    if (!s.widget) continue;
    if (MANIP2.has(s.widget.type)) manipSeen = true;
    else if (manipSeen && ENTRY.has(s.widget.type)) entryAfterManip = true;
  }
  must(entryAfterManip, `${id}: needs a numeric check after the manipulative or it caps at Tier B`);

  for (const s of lesson.steps) {
    const w = s.widget;
    if (!w) continue;
    if (w.type === "numeric") {
      for (const e of w.commonErrors) must(e.value !== w.answer, `${id}/${s.id} trap==answer`);
      const n = (w.prompt.match(/\d+/g) || []).map(Number);
      const f = s.variant?.form;
      if (f === "mbMultiplyTensNumeric" || f === "mbTimesAsManyNumeric") {
        must(n[0] * n[1] === w.answer, `${id}/${s.id}: first two numbers must be the operands`);
      }
      if (f === "mbDivideBigNumeric") must(n[0] / n[1] === w.answer, `${id}/${s.id} ns0/ns1`);
      if (f === "mbMultiStepNumeric") must(n[0] * n[1] - n[2] === w.answer, `${id}/${s.id} ns0*ns1−ns2`);
    }
    if (w.type === "mcq") {
      must(w.options.filter((o) => o.correct).length === 1, `${id}/${s.id} mcq correct count`);
      must(w.options.length >= 4, `${id}/${s.id} mcq option count`);
      must(w.options[0].correct === true, `${id}/${s.id} correct must be index 0`);
    }
    if (w.type === "areaModel" && w.requireFactors) {
      must(w.targetArea === w.requireFactors.w * w.requireFactors.h, `${id}/${s.id} areaModel factors`);
      must(w.factorFeedback, `${id}/${s.id} areaModel needs factorFeedback`);
    }
    if (w.type === "barBuilder") must(w.categories.length === w.target.length, `${id}/${s.id} barBuilder misaligned`);
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
    if (s.variant) must(REG[s.variant.gen]?.has(s.variant.form), `${id}/${s.id} ${s.variant.gen}/${s.variant.form} not registered`);
  }
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c, i) => c === perChapter[i]), `chapter sizes ${chCount}`);
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "volume-problems-g5", slug: "volume-problems-g5", title: spec.title,
  tagline: "Build one layer, stack it, and the cube count is the volume.",
  category: "Math", gradeLevel: 5, chapters,
}, null, 2) + "\n");
console.log(`built 8 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
