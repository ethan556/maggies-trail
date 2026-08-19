// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import type { TStep } from "@/lib/schema";
import { TrailDots } from "./playerChrome";
import { normalizeStepProgress, StepSegments } from "./ui";

afterEach(cleanup);

function segments(bar: HTMLElement) {
  return Array.from(bar.querySelectorAll<HTMLElement>("[data-progress-state]"));
}

function description(bar: HTMLElement) {
  const id = bar.getAttribute("aria-describedby");
  return id ? document.getElementById(id)?.textContent ?? "" : "";
}

describe("shared lesson progress strip", () => {
  it("renders the one-item state as exactly one named current segment", () => {
    render(<StepSegments total={1} current={0} label="Step 1 of 1" />);
    const strip = screen.getByRole("img", { name: "Step 1 of 1" });
    const all = segments(strip);

    expect(all).toHaveLength(1);
    expect(all[0].getAttribute("data-progress-state")).toBe("current");
    expect(all[0].className).toContain("bg-tangerine");
    expect(all[0].className).toContain("scale-y-125");
    expect(description(strip)).toContain("0 completed; item 1 of 1 is current; 0 remaining.");
    expect(description(strip)).toContain("Item 1: current.");
  });

  it("keeps an eleven-item strip synchronized with its count, non-colour states, and summary", () => {
    render(<StepSegments total={11} current={4} label="Step 5 of 11" />);
    const strip = screen.getByRole("img", { name: "Step 5 of 11" });
    const all = segments(strip);

    expect(all).toHaveLength(11);
    expect(strip.getAttribute("data-progress-total")).toBe("11");
    expect(strip.getAttribute("data-progress-current")).toBe("5");
    expect(strip.getAttribute("data-progress-completed")).toBe("4");
    expect(strip.getAttribute("data-progress-remaining")).toBe("6");
    expect(all.filter((segment) => segment.dataset.progressState === "completed")).toHaveLength(4);
    expect(all.filter((segment) => segment.dataset.progressState === "current")).toHaveLength(1);
    expect(all.filter((segment) => segment.dataset.progressState === "remaining")).toHaveLength(6);
    expect(all[0].className).toContain("bg-leaf");
    expect(all[4].className).toContain("bg-tangerine");
    expect(all[5].className).toContain("border-dashed");
    expect(all[5].className).toContain("bg-slate-300/55");
    expect(description(strip)).toContain("Item 1: completed.");
    expect(description(strip)).toContain("Item 5: current.");
    expect(description(strip)).toContain("Item 11: remaining.");
  });

  it("has no remaining segment at the final item and keeps injected-help arrival", () => {
    render(<StepSegments total={11} current={10} injected={new Set([7])} label="Step 11 of 11" />);
    const strip = screen.getByRole("img", { name: "Step 11 of 11" });
    const all = segments(strip);

    expect(all).toHaveLength(11);
    expect(all.filter((segment) => segment.dataset.progressState === "completed")).toHaveLength(10);
    expect(all.filter((segment) => segment.dataset.progressState === "current")).toHaveLength(1);
    expect(all.filter((segment) => segment.dataset.progressState === "remaining")).toHaveLength(0);
    expect(strip.querySelectorAll(".ring-berry\\/60")).toHaveLength(1);
    expect(description(strip)).toContain("10 completed; item 11 of 11 is current; 0 remaining.");
  });

  it("keeps TrailDots aligned with the same normalized total/current contract", () => {
    const steps = Array.from({ length: 11 }, (_, index) => ({ id: `step-${index}` })) as unknown as TStep[];
    render(<TrailDots steps={steps} current={4} remedialIds={new Set(["step-7"])} />);
    const strip = screen.getByRole("img", { name: "Step 5 of 11; the trail grew to add help steps" });

    expect(segments(strip)).toHaveLength(11);
    expect(strip.getAttribute("data-progress-current")).toBe("5");
    expect(strip.getAttribute("data-progress-completed")).toBe("4");
    expect(strip.getAttribute("data-progress-remaining")).toBe("6");
  });
  it("normalizes malformed inputs while preserving the strict one-current segment invariant", () => {
    for (let total = 1; total <= 24; total += 1) {
      for (const current of [-4, 0, total - 1, total + 4, Number.NaN]) {
        const progress = normalizeStepProgress(total, current);
        expect(progress.completed + 1 + progress.remaining).toBe(progress.total);
        expect(progress.current).toBeGreaterThanOrEqual(0);
        expect(progress.current).toBeLessThan(progress.total);
      }
    }
  });
});