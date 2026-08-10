#!/usr/bin/env node
// S121c: move the variant-free conversion CHECK steps of the G4 mc-01-* cluster onto unitChain.
// Same hard rules as convert-vm01-s121.mjs — abort before any write unless the engine's
// independently derived answer equals the FROZEN authored answer and every non-widget surface
// is byte-identical. No predictions added: these lessons already score prediction=2, and the
// A-gate they miss is manip (1 → 2), which the engine supplies on its own.
//
// The ch1 challenge of each lesson is DELIBERATELY DECLINED: each composes a conversion with a
// further arithmetic step (5 bags → 5 kg; 3 km + 250 m; 2 L − 350 mL). unitChain models one
// crossing chain and nothing else; staging it as the whole task would quietly drop the modeling
// or the addition the step exists to assess. Same principle as the S120i dop-01-02 decline.
import { readFileSync, writeFileSync } from "node:fs";
import { unitChainAnswer } from "../../src/lib/schema.ts";

const dir = "content/courses/measure-convert/lessons";
const H = (from, to, bigger, factor) => ({ from, to, bigger, factor });

const PLAN = {
  "mc-01-01": {
    k1: {
      startValue: 1, startUnit: "kg", targetUnit: "g", hops: [H("kg", "g", "from", 1000)],
      prompt: "1 kilogram = how many grams? Cross the chain — the mass never changes, only the counting unit.",
      fallbackFeedback: "The prefix kilo- means a thousand: one kilogram is 1000 grams, so the crossing multiplies.",
      successFeedback: "1000 g. That is what kilo- means — one badge of a thousand."
    },
    k2: {
      startValue: 1, startUnit: "km", targetUnit: "m", hops: [H("km", "m", "from", 1000)],
      prompt: "1 kilometer = how many meters?",
      fallbackFeedback: "Kilo- is the same badge whatever it sits on: one kilometer is 1000 meters.",
      successFeedback: "1000 m — the prefix carries the same factor across every unit it joins."
    },
    k3: {
      startValue: 1, startUnit: "m", targetUnit: "cm", hops: [H("m", "cm", "from", 100)],
      prompt: "1 meter = how many centimeters?",
      fallbackFeedback: "Centi- means a hundredth, so a meter holds 100 centimeters and the crossing multiplies.",
      successFeedback: "100 cm. Centi- is a hundredth of the unit, so it takes 100 of them to rebuild it."
    }
  },
  "mc-01-02": {
    k1: {
      startValue: 400, startUnit: "cm", targetUnit: "m", hops: [H("cm", "m", "to", 100)],
      prompt: "400 cm = how many meters? This crossing goes UP to the bigger unit.",
      fallbackFeedback: "A meter holds 100 centimeters, so going up to meters divides: 400 ÷ 100 = 4 m.",
      successFeedback: "4 m. Going to a bigger unit, the same length needs fewer of them."
    },
    k2: {
      startValue: 7, startUnit: "m", targetUnit: "mm", hops: [H("m", "mm", "from", 1000)],
      prompt: "7 meters = how many millimeters?",
      fallbackFeedback: "Milli- is a thousandth, so a meter holds 1000 millimeters: 7 × 1000 = 7000 mm.",
      successFeedback: "7000 mm — a much smaller counting unit, so a much bigger count."
    },
    k3: {
      startValue: 2, startUnit: "km", targetUnit: "cm", hops: [H("km", "m", "from", 1000), H("m", "cm", "from", 100)],
      prompt: "2 kilometers = how many centimeters? Two crossings, through meters.",
      fallbackFeedback: "2 × 1000 = 2000 m, then 2000 × 100 = 200000 cm.",
      successFeedback: "200000 cm. Chained gears multiply: 1000 × 100 = 100000 centimeters in a kilometer."
    }
  },
  "mc-01-03": {
    k1: {
      startValue: 5, startUnit: "kg", targetUnit: "g", hops: [H("kg", "g", "from", 1000)],
      prompt: "5 kilograms = how many grams?",
      fallbackFeedback: "Each kilogram is 1000 grams: 5 × 1000 = 5000 g.",
      successFeedback: "5000 g — the same mass, counted in a unit a thousand times smaller."
    },
    k2: {
      startValue: 6000, startUnit: "mL", targetUnit: "L", hops: [H("mL", "L", "to", 1000)],
      prompt: "6,000 milliliters = how many liters? Up the chain this time.",
      fallbackFeedback: "A liter holds 1000 milliliters, so going up divides: 6000 ÷ 1000 = 6 L.",
      successFeedback: "6 L. Bigger unit, smaller count — the volume itself never moved."
    },
    k3: {
      startValue: 4000, startUnit: "g", targetUnit: "kg", hops: [H("g", "kg", "to", 1000)],
      prompt: "4,000 grams = how many kilograms?",
      fallbackFeedback: "A kilogram holds 1000 grams, so going up to kilograms divides: 4000 ÷ 1000 = 4 kg.",
      successFeedback: "4 kg — mass and volume cross exactly like length does."
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
    converted++;
  }
  for (let i = 0; i < before.steps.length; i++) {
    const b = { ...before.steps[i] }, a = { ...after.steps[i] };
    delete b.widget; delete a.widget;
    if (JSON.stringify(b) !== JSON.stringify(a))
      throw new Error(`${lid}: step ${before.steps[i].id} frozen surface changed — ABORT`);
  }
  if (before.steps.length !== after.steps.length) throw new Error(`${lid}: step count changed`);
  writeFileSync(path, JSON.stringify(after, null, 1) + "\n");
  console.log(`${lid}: written`);
}
console.log(`converted ${converted} steps`);
