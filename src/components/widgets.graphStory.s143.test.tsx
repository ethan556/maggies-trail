// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { WidgetRenderer as WidgetView } from "./widgets";

const spec = {
  type:"graphStoryLab" as const, mode:"build" as const, prompt:"Build steady travel, a stop, then faster travel.",
  axisContext:"distanceFromOrigin" as const, distanceRule:"awayOnly" as const, xAxisLabel:"time", yAxisLabel:"distance",
  segments:[{id:"s1",label:"Steady travel",kind:"riseSteady" as const,meaning:"Constant rate."},{id:"s2",label:"Stop",kind:"flat" as const,meaning:"No change."},{id:"s3",label:"Faster travel",kind:"riseSteep" as const,meaning:"Faster constant rate."}],
  choices:[], bank:[{id:"b1",label:"Straight rise",kind:"riseSteady" as const,meaning:"Constant rate."},{id:"b2",label:"Flat",kind:"flat" as const,meaning:"No change."},{id:"b3",label:"Steep rise",kind:"riseSteep" as const,meaning:"Faster rate."},{id:"b4",label:"Fall",kind:"fallSteady" as const,meaning:"Decrease."}],
  wrongSequences:[{label:"Reverse speeds",kinds:["riseSteep","flat","riseSteady"] as ("riseSteep"|"flat"|"riseSteady")[],feedback:"That reverses the two travel rates."}], answerLabel:"Straight rise, flat, steep rise",
  successFeedback:"The graph preserves all three stages.", explorationFeedback:"Build every stage.", fallbackFeedback:"Use direction and order."
};

describe("graphStoryLab build renderer", () => {
  it("supports keyboard-native stage assembly with explicit labels", () => {
    const onChange=vi.fn();render(<WidgetView spec={spec} value={{segmentIds:[]}} onChange={onChange} disabled={false} tone="neutral" />);
    const button=screen.getByRole("button",{name:"Add Straight rise"});
    expect(button.getAttribute("type")).toBe("button");
    fireEvent.keyDown(button,{key:"Enter"});fireEvent.click(button);
    expect(onChange).toHaveBeenCalledWith({segmentIds:["b1"]});
  });
  it("renders reveal as a separate ghost without overwriting learner work", () => {
    const onChange=vi.fn();render(<WidgetView spec={spec} value={{segmentIds:["b4"]}} onChange={onChange} disabled={false} tone="info" />);
    expect(screen.getAllByText("1. Fall").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId("graph-story-ghost").textContent).toMatch(/your graph above is unchanged/i);
    expect(onChange).not.toHaveBeenCalled();
  });
  it("does not rely on color alone", () => {
    render(<WidgetView spec={spec} value={{segmentIds:["b1","b2"]}} onChange={()=>{}} disabled={false} tone="neutral" />);
    expect(screen.getAllByText("1. Straight rise").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("2. Flat").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("img").getAttribute("aria-label")).toMatch(/straight rising line.*flat horizontal segment/i);
  });
});
