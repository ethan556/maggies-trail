#!/usr/bin/env node
// S121: convert the variant-free numeric conversion steps of vm-01-01/02/03 onto unitChain.
// HARD RULES enforced below, aborting before any write on violation:
//   1. The engine's independently derived answer must equal the FROZEN authored answer.
//   2. body / hints / explanationVariants / conceptTag / step ids / step order are byte-identical.
//   3. Steps carrying a `variant` key are never touched (resolver contract).
// Authored commonErrors that are unreachable inside the engine (mid-chain stops, added factors)
// are NOT carried over: the engine's canCheck structurally removes those states, and dead
// feedback is decoration. Direction errors are derived and named by the grader per hop.
import { readFileSync, writeFileSync } from "node:fs";
import { unitChainAnswer } from "../../src/lib/schema.ts";

const dir = "content/courses/volume-measurement/lessons";
const H = (from, to, bigger, factor) => ({ from, to, bigger, factor });

// Per step: hops + startValue/units + fresh feedback copy + optional predict.
const PLAN = {
  "vm-01-01": {
    i1: {
      startValue: 3, startUnit: "km", targetUnit: "m", hops: [H("km", "m", "from", 1000)],
      prompt: "3 km = ? m. Cross the chain — watch the bar: it never changes, only how it is counted.",
      fallbackFeedback: "A kilometer holds 1000 meters — counting the same distance in meters needs more of them: 3 × 1000 = 3000 m.",
      successFeedback: "3000 m. The bar never moved — a smaller counting unit needs a bigger number for the same distance.",
      predict: {
        prompt: "The bar is 3 km long. When the ruler under it is re-labeled to count in meters, the number on the readout will…",
        options: [
          { id: "bigger", label: "get bigger — meters are smaller, so more of them fit" },
          { id: "smaller", label: "get smaller — meters are a smaller unit, so the number shrinks" },
          { id: "same", label: "stay 3 — the bar didn't change" }
        ],
        outcomeId: "bigger",
        reveal: "The bar really didn't change — but the counting unit did. A smaller unit fits more times into the same distance, so the number grows: 3 km is 3000 m."
      }
    },
    k1: {
      startValue: 1.5, startUnit: "m", targetUnit: "cm", hops: [H("m", "cm", "from", 100)],
      prompt: "1.5 m = ? cm. One crossing — choose the direction.",
      fallbackFeedback: "A meter holds 100 centimeters, so the crossing multiplies: 1.5 × 100 = 150 cm.",
      successFeedback: "150 cm — the decimal start changes nothing: smaller unit, bigger count."
    },
    k2: {
      startValue: 3500, startUnit: "g", targetUnit: "kg", hops: [H("g", "kg", "to", 1000)],
      prompt: "3500 g = ? kg. This crossing goes UP the chain — to the bigger unit.",
      fallbackFeedback: "A kilogram holds 1000 grams, so going up to kilograms divides: 3500 ÷ 1000 = 3.5 kg.",
      successFeedback: "3.5 kg. Going to a BIGGER unit, the same mass needs fewer of them — the number shrinks.",
      predict: {
        prompt: "3500 grams re-counted in kilograms: which way does the number move?",
        options: [
          { id: "down", label: "down — a kilogram is the bigger unit, so the same mass needs fewer" },
          { id: "up", label: "up — converting always multiplies" },
          { id: "hold", label: "it depends on the mass, not the units" }
        ],
        outcomeId: "down",
        reveal: "The direction lives in the units, not the mass: kilograms are bigger than grams, so the same 3500 g is only 3.5 of them."
      }
    },
    i2: {
      startValue: 2, startUnit: "L", targetUnit: "mL", hops: [H("L", "mL", "from", 1000)],
      prompt: "2 L = ? mL. Same chain, capacity this time.",
      fallbackFeedback: "A liter holds 1000 milliliters: 2 × 1000 = 2000 mL.",
      successFeedback: "2000 mL — capacity converts exactly like length: powers of ten, direction from the unit sizes."
    },
    ch1: {
      startValue: 2.5, startUnit: "km", targetUnit: "m", hops: [H("km", "m", "from", 1000)],
      prompt: "2.5 km = ? m — a decimal start down the chain.",
      fallbackFeedback: "The decimal changes nothing about the crossing: 2.5 × 1000 = 2500 m.",
      successFeedback: "2500 m — decimals ride the same crossing as whole numbers."
    }
  },
  "vm-01-02": {
    i1: {
      startValue: 3, startUnit: "ft", targetUnit: "in", hops: [H("ft", "in", "from", 12)],
      prompt: "3 ft = ? in. Customary factors aren't tens — the gearing here is 12.",
      fallbackFeedback: "A foot holds 12 inches, so the crossing multiplies: 3 × 12 = 36 in.",
      successFeedback: "36 in. Different factor, same rule: the direction comes from which unit is bigger.",
      predict: {
        prompt: "Feet to inches uses ×12 instead of ×10 or ×1000. What actually changes about the crossing?",
        options: [
          { id: "factor", label: "only the factor — the direction rule is the same" },
          { id: "direction", label: "the direction — customary units convert by dividing" },
          { id: "both", label: "both the factor and the direction" }
        ],
        outcomeId: "factor",
        reveal: "The rule survives the factor swap: bigger unit to smaller unit still multiplies. Customary units just use their own gear sizes — 12, 3, 4, 16 — instead of tens."
      }
    },
    i2: {
      startValue: 2, startUnit: "gal", targetUnit: "qt", hops: [H("gal", "qt", "from", 4)],
      prompt: "2 gal = ? qt. A small gear this time: 4.",
      fallbackFeedback: "A gallon holds 4 quarts: 2 × 4 = 8 qt.",
      successFeedback: "8 qt — small factor, same crossing rule."
    }
  },
  "vm-01-03": {
    i1: {
      startValue: 3, startUnit: "yd", targetUnit: "in", hops: [H("yd", "ft", "from", 3), H("ft", "in", "from", 12)],
      prompt: "3 yd = ? in — two crossings, through feet.",
      fallbackFeedback: "Cross both rungs: 3 × 3 = 9 ft, then 9 × 12 = 108 in.",
      successFeedback: "108 in. Two crossings chained — and 3 × 12 = 36, so a yard holds 36 inches in one jump.",
      predict: {
        prompt: "Yards to inches crosses two gears, 3 and 12. Combined into one jump, they act like…",
        options: [
          { id: "mult", label: "×36 — chained gears multiply" },
          { id: "add", label: "×15 — the factors add up" },
          { id: "big", label: "×12 — the bigger gear wins" }
        ],
        outcomeId: "mult",
        reveal: "Each yard is 3 feet and each of those feet is 12 inches — 3 groups of 12, which is multiplication: 36 inches per yard."
      }
    },
    k1: {
      startValue: 2, startUnit: "km", targetUnit: "cm", hops: [H("km", "m", "from", 1000), H("m", "cm", "from", 100)],
      prompt: "2 km = ? cm — a metric chain through meters.",
      fallbackFeedback: "2 × 1000 = 2000 m, then 2000 × 100 = 200000 cm.",
      successFeedback: "200000 cm. Two metric gears, 1000 then 100 — chained, that's ×100000."
    },
    k2: {
      startValue: 1.5, startUnit: "gal", targetUnit: "cups", hops: [H("gal", "qt", "from", 4), H("qt", "cups", "from", 4)],
      prompt: "1.5 gal = ? cups — through quarts.",
      fallbackFeedback: "1.5 × 4 = 6 qt, then 6 × 4 = 24 cups.",
      successFeedback: "24 cups. Two ×4 gears chain into ×16."
    },
    k3: {
      startValue: 3, startUnit: "gal", targetUnit: "pt", hops: [H("gal", "qt", "from", 4), H("qt", "pt", "from", 2)],
      prompt: "3 gal = ? pt — quarts sit in the middle again.",
      fallbackFeedback: "3 × 4 = 12 qt, then 12 × 2 = 24 pt.",
      successFeedback: "24 pt — the middle unit carries you across."
    },
    ch1: {
      startValue: 2, startUnit: "yd", targetUnit: "in", hops: [H("yd", "ft", "from", 3), H("ft", "in", "from", 12)],
      prompt: "A ribbon is 2 yards long. Cross to inches.",
      fallbackFeedback: "2 × 3 = 6 ft, then 6 × 12 = 72 in.",
      successFeedback: "72 in of ribbon — the chain works on real things exactly as on bare numbers."
    }
  }
};

let converted = 0;
for (const [lid, steps] of Object.entries(PLAN)) {
  const path = `${dir}/${lid}.json`;
  const before = JSON.parse(readFileSync(path, "utf8"));
  const after = JSON.parse(readFileSync(path, "utf8"));
  for (const [sid, plan] of Object.entries(steps)) {
    const sB = before.steps.find((s) => s.id === sid);
    const sA = after.steps.find((s) => s.id === sid);
    if (!sB || !sA) throw new Error(`${lid}/${sid}: step not found`);
    if (sB.variant || sB.widget?.variant) throw new Error(`${lid}/${sid}: carries a variant — must not be touched`);
    if (sB.widget?.type !== "numeric") throw new Error(`${lid}/${sid}: expected numeric, found ${sB.widget?.type}`);
    const frozen = sB.widget.answer;
    const spec = {
      type: "unitChain",
      prompt: plan.prompt,
      startValue: plan.startValue,
      startUnit: plan.startUnit,
      targetUnit: plan.targetUnit,
      hops: plan.hops,
      commonResults: [],
      fallbackFeedback: plan.fallbackFeedback,
      successFeedback: plan.successFeedback
    };
    const derived = unitChainAnswer(spec);
    if (Math.abs(derived - frozen) > 1e-9)
      throw new Error(`${lid}/${sid}: derived ${derived} ≠ frozen authored answer ${frozen} — ABORT`);
    sA.widget = spec;
    if (plan.predict) {
      if (sB.predict) throw new Error(`${lid}/${sid}: already has a predict block`);
      sA.predict = plan.predict;
    }
    converted++;
  }
  // Frozen-surface assertions: everything except widget/predict is byte-identical.
  for (let i = 0; i < before.steps.length; i++) {
    const b = { ...before.steps[i] }, a = { ...after.steps[i] };
    delete b.widget; delete a.widget; delete b.predict; delete a.predict;
    if (JSON.stringify(b) !== JSON.stringify(a))
      throw new Error(`${lid}: step ${before.steps[i].id} frozen surface changed — ABORT`);
  }
  if (before.steps.length !== after.steps.length) throw new Error(`${lid}: step count changed`);
  writeFileSync(path, JSON.stringify(after, null, 1) + "\n");
  console.log(`${lid}: written`);
}
console.log(`converted ${converted} steps`);
