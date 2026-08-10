// @vitest-environment jsdom
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { WidgetSpec, type TDistributionCompareLab } from "@/lib/schema";
import { WidgetRenderer, type StageTone } from "./widgets";

const measureParsed = WidgetSpec.parse({
  type: "distributionCompareLab",
  prompt: "Measure the separation.",
  mode: "measure",
  meanA: 18,
  meanB: 6,
  variability: 4,
  answer: 3,
  tolerance: 0.01,
  measureChoices: [
    { value: 12, feedback: "raw gap" },
    { value: 3, feedback: "correct" },
    { value: -3, feedback: "signed gap" }
  ],
  fallbackFeedback: "Compare the gap with the variability.",
  successFeedback: "Three variability-widths."
});
if (measureParsed.type !== "distributionCompareLab") throw new Error("bad measure fixture");
const measureSpec = measureParsed as TDistributionCompareLab;

const judgeParsed = WidgetSpec.parse({
  type: "distributionCompareLab",
  prompt: "Judge the overlap.",
  mode: "judge",
  gapUnits: 4,
  judgeOptions: [
    { id: "little", label: "Little overlap", correct: true, feedback: "correct" },
    { id: "heavy", label: "Heavy overlap", feedback: "wrong" },
    { id: "same", label: "Identical groups", feedback: "wrong" }
  ],
  successFeedback: "Little overlap."
});
if (judgeParsed.type !== "distributionCompareLab") throw new Error("bad judge fixture");
const judgeSpec = judgeParsed as TDistributionCompareLab;

function Harness({ spec, tone = "neutral" }: { spec: TDistributionCompareLab; tone?: StageTone }) {
  const [value, setValue] = useState<unknown>(undefined);
  return <WidgetRenderer spec={spec} value={value} onChange={setValue} disabled={false} tone={tone} />;
}

afterEach(cleanup);

describe("distributionCompareLab visual interaction", () => {
  it("draws two non-color-coded distributions and exposes the mathematical relationship", () => {
    render(<Harness spec={measureSpec} />);
    const image = screen.getByRole("img");
    expect(image.getAttribute("aria-label")).toContain("mean 18");
    expect(image.getAttribute("aria-label")).toContain("variability width 4");
    expect(screen.getByText(/Group A ○/)).toBeTruthy();
    expect(screen.getByText(/Group B ◇/)).toBeTruthy();
    expect(screen.getByText("raw gap 12")).toBeTruthy();
    expect(screen.getByText("1 variability-width = 4")).toBeTruthy();
    expect(document.querySelector("polyline[stroke-dasharray='8 5']")).toBeTruthy();
    expect(document.querySelector("pattern#dcl-overlap")).toBeTruthy();
  });

  it("uses keyboard-native 44px exact-choice controls and a learner-controlled tape", () => {
    render(<Harness spec={measureSpec} />);
    const rawGap = screen.getByRole("button", { name: /12/ });
    expect(rawGap.className).toContain("min-h-11");
    fireEvent.click(rawGap);
    expect(rawGap.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByTestId("dcl-measure-tape")).toBeTruthy();
    expect(screen.getByText("your measurement: 12 variability-units")).toBeTruthy();
  });

  it("distinguishes a negative misconception with shape/readout semantics, not color alone", () => {
    render(<Harness spec={measureSpec} />);
    fireEvent.click(screen.getByRole("button", { name: /−3/ }));
    expect(screen.getByTestId("dcl-negative-tape")).toBeTruthy();
    expect(screen.getByText("your measurement: −3 variability-units")).toBeTruthy();
  });

  it("reveals the target without replacing the learner's selected tape", () => {
    render(<Harness spec={measureSpec} tone="info" />);
    fireEvent.click(screen.getByRole("button", { name: /12/ }));
    expect(screen.getByTestId("dcl-measure-tape")).toBeTruthy();
    expect(screen.getByTestId("dcl-reveal-ghost").textContent).toContain("target 3 units");
    expect(screen.getByText("your measurement: 12 variability-units")).toBeTruthy();
  });

  it("keeps overlap interpretation as a conclusion choice while the geometry stays fixed", () => {
    render(<Harness spec={judgeSpec} />);
    const little = screen.getByRole("button", { name: "Little overlap" });
    expect(little.className).toContain("min-h-11");
    fireEvent.click(little);
    expect(little.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText(/mean separation: 4 variability-units/)).toBeTruthy();
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("patterned overlap");
  });
});
