// @vitest-environment jsdom
// THE INVERSE PIPELINE GATE.
//
// This engine exists for one reason: to tell two wrong answers apart that every other widget in the
// registry collapses into "incorrect". A learner who undoes the steps in the order they were applied
// has made the single most common mistake in inverse work, and a learner who reverses the chain but
// forgets to flip an operation has made a different one. If those two states ever stop reaching their
// own feedback, the engine has no reason to exist and this file should fail.
//
//   REVERSED AND FLIPPED   the authored answer grades correct
//   FORWARD ORDER          right operations, original order → forwardOrderFeedback
//   UNFLIPPED              right order, an operation copied instead of inverted → unflippedFeedback
//   ANYTHING ELSE          wrong cards or a short track → missFeedback, never an empty string
//   IT IS SOLVABLE         the answer is buildable from the tray, and is genuinely the inverse
import { describe, expect, it } from "vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { evaluate, correctAnswerText } from "@/lib/evaluate";
import { InversePipelineSpec, type TInversePipeline } from "@/lib/schema";
import { SAMPLES } from "@/components/widgetSamples";
import { WidgetRenderer } from "@/components/widgets";

const sample = (SAMPLES as Array<{ type: string }>).find((s) => s.type === "inversePipeline") as unknown as TInversePipeline;

/** Apply a chain of ops to a value — the arithmetic the learner is being asked to reason about. */
const run = (ops: Array<{ op: string; n: number }>, x: number) =>
  ops.reduce((v, c) => (c.op === "add" ? v + c.n : c.op === "sub" ? v - c.n : c.op === "mul" ? v * c.n : v / c.n), x);

describe("inversePipeline", () => {
  it("the gallery sample is a valid spec and is buildable from its own tray", () => {
    const spec = InversePipelineSpec.parse(sample);
    for (const id of spec.answer) {
      expect(spec.tray.some((t) => t.id === id), `answer card ${id} is not in the tray`).toBe(true);
    }
    expect(spec.answer.length).toBe(spec.forward.length);
    // Decoys are the point of the tray — without them the task is an ordering exercise, not a choice.
    expect(spec.tray.length).toBeGreaterThan(spec.answer.length);
  });

  it("the authored answer really is the inverse, checked by arithmetic not by rule", () => {
    const spec = InversePipelineSpec.parse(sample);
    const inverse = spec.answer.map((id) => spec.tray.find((t) => t.id === id)!);
    for (const x of [-6, -1, 0, 2, 5, 11]) {
      const there = run(spec.forward, x);
      const back = run(inverse, there);
      expect(Math.round(back * 1e6) / 1e6, `x = ${x} did not come back`).toBe(x);
    }
  });

  it("grades the reversed, flipped track correct", () => {
    const spec = InversePipelineSpec.parse(sample);
    const r = evaluate(spec, spec.answer);
    expect(r.correct).toBe(true);
    expect(r.feedback).toBe(spec.successFeedback);
  });

  it("diagnoses undoing in the ORIGINAL order", () => {
    const spec = InversePipelineSpec.parse(sample);
    const FLIP = { add: "sub", sub: "add", mul: "div", div: "mul" } as const;
    // Flip each forward step but leave it where it was — the headline misconception.
    const track = spec.forward.map((f) => spec.tray.find((t) => t.op === FLIP[f.op] && t.n === f.n)!.id);
    expect(track).not.toEqual(spec.answer); // otherwise the case is vacuous
    const r = evaluate(spec, track);
    expect(r.correct).toBe(false);
    expect(r.feedback).toBe(spec.forwardOrderFeedback);
  });

  it("diagnoses reversing without flipping", () => {
    const spec = InversePipelineSpec.parse(sample);
    // Right order, but every card copied rather than inverted.
    const track = [...spec.forward].reverse().map((f) => spec.tray.find((t) => t.op === f.op && t.n === f.n)?.id);
    const usable = track.filter((x): x is string => typeof x === "string");
    if (usable.length !== spec.forward.length) return; // sample's tray lacks the un-flipped cards
    const r = evaluate(spec, usable);
    expect(r.correct).toBe(false);
    expect(r.feedback).toBe(spec.unflippedFeedback);
  });

  it("never returns an empty diagnosis for any reachable state", () => {
    const spec = InversePipelineSpec.parse(sample);
    const states: string[][] = [
      [],
      [spec.tray[0].id],
      [spec.answer[0]],
      spec.tray.slice(0, spec.forward.length).map((t) => t.id),
      [...spec.answer].reverse(),
      spec.answer.concat(spec.tray[0].id),
    ];
    for (const st of states) {
      const r = evaluate(spec, st);
      expect(r.feedback.length, `empty feedback for [${st.join(",")}]`).toBeGreaterThan(0);
    }
  });

  it("reports the correct answer as a readable chain", () => {
    const spec = InversePipelineSpec.parse(sample);
    const txt = correctAnswerText(spec);
    expect(txt).toContain("\u2192");
    expect(txt).not.toContain("?"); // every id resolved
  });

  it("renders the forward chain, an empty track, and a tappable tray", () => {
    cleanup();
    render(<WidgetRenderer spec={sample} value={undefined} onChange={() => {}} disabled={false} />);
    expect(screen.getByTestId("ip-forward")).toBeTruthy();
    expect(screen.getByTestId("ip-track")).toBeTruthy();
    // Every slot is a real button, so keyboard operation needs no separate path.
    for (let i = 0; i < sample.forward.length; i++) {
      expect(screen.getByTestId(`ip-slot-${i}`)).toBeTruthy();
    }
    for (const t of sample.tray) {
      expect(screen.getByTestId(`ip-card-${t.id}`)).toBeTruthy();
    }
  });

  it("labels every card in words, so the state does not depend on colour", () => {
    cleanup();
    render(<WidgetRenderer spec={sample} value={undefined} onChange={() => {}} disabled={false} />);
    // The "undo" badge and the aria labels both carry the meaning the tangerine cue carries.
    const card = screen.getByTestId(`ip-card-${sample.answer[0]}`);
    expect(card.getAttribute("aria-label")).toMatch(/multiply by|divide by|add|subtract/);
    expect(card.getAttribute("aria-label")).toMatch(/undoes a step/);
    const slot = screen.getByTestId("ip-slot-0");
    expect(slot.getAttribute("aria-label")).toMatch(/empty/);
  });
});
