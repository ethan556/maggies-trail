// @vitest-environment jsdom
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WidgetSpec, type TAngleMeasure, type TScaledCircleLab, type TTriangleClosureLab } from "@/lib/schema";
import { WidgetRenderer, type StageTone } from "./widgets";

function scaledFixture(): TScaledCircleLab {
  const parsed = WidgetSpec.parse({
    type: "scaledCircleLab", prompt: "Scale the fountain.", drawingRadius: 3, scale: 2, drawingUnit: "cm", realRadius: 6, realUnit: "m", ask: "realRadius",
    choices: [
      { id: "correct", label: "6 m", value: 6, feedback: "correct" },
      { id: "drawing", label: "3 m", value: 3, feedback: "drawing only" },
      { id: "diameter", label: "12 m", value: 12, feedback: "diameter" }
    ], fallbackFeedback: "scale once", successFeedback: "correct"
  });
  if (parsed.type !== "scaledCircleLab") throw new Error("bad scaled fixture");
  return parsed;
}
function triangleFixture(): TTriangleClosureLab {
  const parsed = WidgetSpec.parse({
    type: "triangleClosureLab", prompt: "Close the frame.", sides: [7,8,12], angleStart: 30, angleStep: 5, requiredMoves: 2,
    choices: [
      { id: "correct", label: "Yes — 7 + 8 > 12", verdict: "forms", feedback: "correct" },
      { id: "largest", label: "No — 12 is too long", verdict: "does-not-form", feedback: "largest" },
      { id: "different", label: "No — sides differ", verdict: "does-not-form", feedback: "different" }
    ], fallbackFeedback: "compare", successFeedback: "correct"
  });
  if (parsed.type !== "triangleClosureLab") throw new Error("bad triangle fixture");
  return parsed;
}
function angleFixture(): TAngleMeasure {
  const parsed = WidgetSpec.parse({
    type: "angleMeasure", prompt: "Solve x + 2x = 180.", targetAngle: 60, angleStart: 90, angleStep: 30,
    linearPair: { multiplier: 2, total: 180 }, commonAngles: [{ angle: 90, feedback: "combine" }, { angle: 30, feedback: "straight line" }],
    successFeedback: "correct", lowFeedback: "low", highFeedback: "high"
  });
  if (parsed.type !== "angleMeasure") throw new Error("bad angle fixture");
  return parsed;
}

function Harness({ spec, tone="neutral", onEvent=vi.fn() }: { spec: TScaledCircleLab | TTriangleClosureLab | TAngleMeasure; tone?: StageTone; onEvent?: (e: unknown)=>void }) {
  const [value,setValue]=useState<unknown>(undefined);
  return <WidgetRenderer spec={spec} value={value} onChange={setValue} onEvent={onEvent} disabled={false} tone={tone}/>;
}
afterEach(cleanup);

describe("Session 137 geometry-roundup visual interactions", () => {
  it("shows the scale chain, uses 44px native claims, and preserves the learner choice on reveal", () => {
    render(<Harness spec={scaledFixture()} tone="info"/>);
    expect(screen.getByRole("img", { name: /drawing circle radius 3/i })).toBeTruthy();
    expect(screen.getByRole("img", { name: /real circle radius 6/i })).toBeTruthy();
    const wrong=screen.getByRole("button",{name:"3 m"});
    expect(wrong.className).toContain("min-h-11");
    fireEvent.click(wrong);
    expect(wrong.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("correct claim: 6 m")).toBeTruthy();
    expect(screen.getByText("Selected 3 m.")).toBeTruthy();
  });

  it("keeps pre-check process evidence neutral for scaled-circle claims", () => {
    const onEvent=vi.fn(); render(<Harness spec={scaledFixture()} onEvent={onEvent}/>);
    fireEvent.click(screen.getByRole("button",{name:"3 m"}));
    fireEvent.click(screen.getByRole("button",{name:"6 m"}));
    expect(onEvent).toHaveBeenNthCalledWith(1,expect.objectContaining({control:"circle-claim",dir:"neutral"}));
    expect(onEvent).toHaveBeenNthCalledWith(2,expect.objectContaining({control:"circle-claim",dir:"neutral"}));
  });

  it("requires hinge exploration, communicates flat failure without color alone, and keeps exact claims native", () => {
    render(<Harness spec={triangleFixture()}/>);
    const slider=screen.getByRole("slider",{name:"hinge angle"});
    expect(slider.className).toContain("h-11");
    fireEvent.change(slider,{target:{value:"60"}}); fireEvent.change(slider,{target:{value:"90"}});
    expect(screen.getByText(/moves 2\/2/)).toBeTruthy();
    const claim=screen.getByRole("button",{name:/Yes — 7 \+ 8 > 12/});
    expect(claim.className).toContain("min-h-11"); fireEvent.click(claim);
    expect(claim.getAttribute("aria-pressed")).toBe("true");
  });

  it("renders the algebraic straight-line relationship rather than a bare protractor", () => {
    render(<Harness spec={angleFixture()}/>);
    expect(screen.getByRole("img",{name:/straight line is split into x and 2x/i})).toBeTruthy();
    expect(screen.getByText("x = 90°")).toBeTruthy();
    expect(screen.getByText("2x = 180°")).toBeTruthy();
    const slider=screen.getByRole("slider",{name:"angle in degrees"});
    fireEvent.change(slider,{target:{value:"60"}});
    expect(screen.getByText("x = 60°")).toBeTruthy();
    expect(screen.getByText("2x = 120°")).toBeTruthy();
  });
});
