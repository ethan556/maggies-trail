import { describe, it, expect } from "vitest";
import { GraphReadSpec, graphReadAnswer, widgetIntegrityErrors } from "./schema";
import { evaluate, canCheck, correctAnswerText } from "./evaluate";
import type { TGraphRead } from "./schema";

const pic = (over: Partial<TGraphRead> = {}): TGraphRead =>
  GraphReadSpec.parse({
    type: "graphRead",
    mode: "picture",
    prompt: "How many votes?",
    drawn: 4,
    unitValue: 1,
    categoryLabel: "Monday",
    unitNoun: "vote",
    unitNounPlural: "votes",
    scaleMax: 12,
    fallbackFeedback: "fb",
    successFeedback: "ok",
    ...over
  });

const bar = (over: Partial<TGraphRead> = {}): TGraphRead =>
  pic({ mode: "bar", drawn: 6, scaleMax: 10, unitNoun: "cookie", unitNounPlural: "cookies", ...over });

describe("graphRead: derivation", () => {
  it("one picture, one unit", () => expect(graphReadAnswer(pic())).toBe(4));
  it("scaled picture graphs multiply", () => expect(graphReadAnswer(pic({ drawn: 3, unitValue: 5 }))).toBe(15));
  it("an empty row reads zero, not blank", () => expect(graphReadAnswer(pic({ drawn: 0 }))).toBe(0));
});

describe("graphRead: integrity gate", () => {
  it("accepts well-formed picture and bar displays", () => {
    expect(widgetIntegrityErrors(pic())).toEqual([]);
    expect(widgetIntegrityErrors(bar())).toEqual([]);
    expect(widgetIntegrityErrors(pic({ drawn: 0 }))).toEqual([]);
  });
  it("rejects an answer above the readable scale", () => {
    expect(widgetIntegrityErrors(pic({ drawn: 4, unitValue: 5, scaleMax: 10 })).join(" ")).toMatch(/above scaleMax/);
  });
  it("rejects a bar taller than its own scale", () => {
    expect(widgetIntegrityErrors(bar({ drawn: 14, scaleMax: 10 })).join(" ")).toMatch(/cannot be drawn/);
  });
  it("rejects icon counts that turn reading into tallying", () => {
    expect(widgetIntegrityErrors(pic({ drawn: 24, scaleMax: 30 })).join(" ")).toMatch(/past the point/);
  });
  it("rejects a commonResults entry equal to the answer", () => {
    expect(widgetIntegrityErrors(pic({ commonResults: [{ value: 4, feedback: "dead" }] })).join(" ")).toMatch(/success slot/);
  });
  it("rejects an off-scale commonResults entry as dead feedback", () => {
    expect(widgetIntegrityErrors(pic({ commonResults: [{ value: 99, feedback: "dead" }] })).join(" ")).toMatch(/off the scale/);
  });
});

describe("graphRead: grading", () => {
  it("cannot check before a number is chosen", () => {
    expect(canCheck(pic(), null)).toBe(false);
    expect(canCheck(pic(), { picked: 4 })).toBe(true);
    expect(canCheck(pic(), { picked: 0 })).toBe(true);
  });
  it("correct on the derived value", () => {
    const r = evaluate(pic(), { picked: 4 });
    expect(r.correct).toBe(true);
    expect(r.feedback).toBe("ok");
  });
  it("names an off-by-one read in picture mode", () => {
    const r = evaluate(pic(), { picked: 5 });
    expect(r.correct).toBe(false);
    expect(r.feedback).toMatch(/one picture out/);
    expect(r.feedback).toMatch(/lands on 4, not 5/);
  });
  it("names an off-by-one read in bar mode with the right noun", () => {
    const r = evaluate(bar(), { picked: 5 });
    expect(r.correct).toBe(false);
    expect(r.feedback).toMatch(/one gridline out/);
  });
  it("off-by-one is measured in UNITS, not in ticks, on a scaled graph", () => {
    // 3 pictures × 5 = 15; one picture out is 10 or 20, not 14.
    const spec = pic({ drawn: 3, unitValue: 5, scaleMax: 25 });
    expect(evaluate(spec, { picked: 20 }).feedback).toMatch(/one picture out/);
    expect(evaluate(spec, { picked: 14 }).feedback).toBe("fb");
  });
  it("authored landings win over the generic fallback", () => {
    const spec = pic({ commonResults: [{ value: 7, feedback: "you counted the day labels too" }] });
    expect(evaluate(spec, { picked: 7 }).feedback).toBe("you counted the day labels too");
  });
  it("answer text agrees with the noun's number", () => {
    expect(correctAnswerText(pic())).toBe("4 votes");
    expect(correctAnswerText(pic({ drawn: 1 }))).toBe("1 vote");
    expect(correctAnswerText(bar())).toBe("6 cookies");
  });
});
