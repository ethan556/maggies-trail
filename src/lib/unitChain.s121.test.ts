import { describe, it, expect } from "vitest";
import { UnitChainSpec, unitChainAnswer, unitChainWorlds, widgetIntegrityErrors } from "./schema";
import { evaluate, canCheck, correctAnswerText } from "./evaluate";
import type { TUnitChain } from "./schema";

const km = (over: Partial<TUnitChain> = {}): TUnitChain =>
  UnitChainSpec.parse({
    type: "unitChain",
    prompt: "3 km = ? m",
    startValue: 3,
    startUnit: "km",
    targetUnit: "m",
    hops: [{ from: "km", to: "m", bigger: "from", factor: 1000 }],
    fallbackFeedback: "fb",
    successFeedback: "ok",
    ...over
  });

const ydIn = (): TUnitChain =>
  km({
    prompt: "3 yd = ? in",
    startUnit: "yd",
    targetUnit: "in",
    hops: [
      { from: "yd", to: "ft", bigger: "from", factor: 3 },
      { from: "ft", to: "in", bigger: "from", factor: 12 }
    ]
  });

const gKg = (): TUnitChain =>
  km({
    prompt: "3500 g = ? kg",
    startValue: 3500,
    startUnit: "g",
    targetUnit: "kg",
    hops: [{ from: "g", to: "kg", bigger: "to", factor: 1000 }]
  });

describe("unitChain: independent derivation", () => {
  it("multiplies crossing toward the smaller unit", () => {
    expect(unitChainAnswer(km())).toBe(3000);
  });
  it("divides crossing toward the bigger unit", () => {
    expect(unitChainAnswer(gKg())).toBe(3.5);
  });
  it("chains hops (3 yd = 108 in)", () => {
    expect(unitChainAnswer(ydIn())).toBe(108);
  });
  it("every direction world is enumerated: 2^hops values", () => {
    const w = unitChainWorlds(ydIn());
    expect(w).toHaveLength(4);
    const values = w.map((x) => x.value).sort((a, b) => a - b);
    // ÷3÷12 = 1/12, ×3÷12 = 3/4, ÷3×12 = 12, ×3×12 = 108 — four distinct worlds on 3.
    expect(values).toEqual([3 / 36, 0.75, 12, 108]);
  });
});

describe("unitChain: integrity gate", () => {
  const errsOf = (spec: TUnitChain) => widgetIntegrityErrors(spec);
  it("accepts a well-formed chain", () => {
    expect(errsOf(km())).toEqual([]);
    expect(errsOf(ydIn())).toEqual([]);
    expect(errsOf(gKg())).toEqual([]);
  });
  it("rejects a broken chain (hop gap)", () => {
    const bad = km({
      targetUnit: "cm",
      hops: [
        { from: "km", to: "m", bigger: "from", factor: 1000 },
        { from: "mm", to: "cm", bigger: "to", factor: 10 }
      ]
    });
    expect(errsOf(bad).join(" ")).toMatch(/hop 2 starts at mm/);
  });
  it("rejects a first hop that does not start at startUnit", () => {
    const bad = km({ hops: [{ from: "m", to: "cm", bigger: "from", factor: 100 }], targetUnit: "cm" });
    expect(errsOf(bad).join(" ")).toMatch(/first hop/);
  });
  it("rejects factor-symmetric authoring where a wrong direction reproduces the answer", () => {
    // ×2 then ÷2 correct = ÷2 then ×2 wrong — direction has no observable state.
    const bad = km({
      targetUnit: "u2",
      hops: [
        { from: "km", to: "mid", bigger: "from", factor: 2 },
        { from: "mid", to: "u2", bigger: "to", factor: 2 }
      ]
    });
    expect(errsOf(bad).join(" ")).toMatch(/reproduces the correct value/);
  });
  it("rejects a commonResults entry equal to the answer", () => {
    const bad = km({ commonResults: [{ value: 3000, feedback: "dead" }] });
    expect(errsOf(bad).join(" ")).toMatch(/success slot/);
  });
});

describe("unitChain: grading", () => {
  it("cannot check before reaching the target unit", () => {
    expect(canCheck(km(), { unitIdx: 0, value: 3, dirs: [] })).toBe(false);
    expect(canCheck(km(), { unitIdx: 1, value: 3000, dirs: ["mul"] })).toBe(true);
  });
  it("correct at the derived answer", () => {
    const r = evaluate(km(), { unitIdx: 1, value: 3000, dirs: ["mul"] });
    expect(r.correct).toBe(true);
    expect(r.feedback).toBe("ok");
  });
  it("names the hop crossed the wrong way, with its factor and units", () => {
    const r = evaluate(km(), { unitIdx: 1, value: 0.003, dirs: ["div"] });
    expect(r.correct).toBe(false);
    expect(r.feedback).toMatch(/km to m you divided by 1000/);
    expect(r.feedback).toMatch(/one km holds 1000 m/);
  });
  it("names the FIRST wrong hop in a chain (÷3 then ×12 on 3 yd)", () => {
    const r = evaluate(ydIn(), { unitIdx: 2, value: 12, dirs: ["div", "mul"] });
    expect(r.correct).toBe(false);
    expect(r.feedback).toMatch(/yd to ft you divided by 3/);
  });
  it("division-direction lesson grades ÷ as correct and × as the named error", () => {
    expect(evaluate(gKg(), { unitIdx: 1, value: 3.5, dirs: ["div"] }).correct).toBe(true);
    const wrong = evaluate(gKg(), { unitIdx: 1, value: 3500000, dirs: ["mul"] });
    expect(wrong.correct).toBe(false);
    expect(wrong.feedback).toMatch(/g to kg you multiplied/);
  });
  it("falls to authored landings, then fallback, for values outside the direction worlds", () => {
    const spec = km({ commonResults: [{ value: 300, feedback: "dropped a zero" }] });
    // A value not reachable by direction choice alone (widget state hand-built for the test).
    expect(evaluate(spec, { unitIdx: 1, value: 300, dirs: ["mul"] }).feedback).toBe("dropped a zero");
    expect(evaluate(spec, { unitIdx: 1, value: 7, dirs: ["mul"] }).feedback).toBe("fb");
  });
  it("answer text carries the unit", () => {
    expect(correctAnswerText(km())).toBe("3000 m");
    expect(correctAnswerText(gKg())).toBe("3.5 kg");
  });
});
