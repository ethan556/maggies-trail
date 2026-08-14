// @vitest-environment jsdom
/**
 * Contract tests for the shared UI primitives. These guard the accessibility and
 * behavior surface the rest of the app now depends on: buttons stay real buttons,
 * icons expose a title only when labelled, progress reports its value, and the
 * empty state renders its action.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { AppIcon, Badge, Button, EmptyState, LinkButton, Notice, ProgressBar, StepSegments } from "./ui";

afterEach(cleanup);

describe("Button", () => {
  it("renders a native button, forwards clicks, and respects disabled", () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <Button onClick={onClick} icon="icon-704">
        Save
      </Button>
    );
    const btn = screen.getByRole("button", { name: /save/i });
    expect(btn.tagName).toBe("BUTTON");
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <Button onClick={onClick} disabled>
        Save
      </Button>
    );
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(onClick).toHaveBeenCalledTimes(1); // still 1 — disabled swallowed the click
  });
});

describe("LinkButton", () => {
  it("renders an anchor to its href", () => {
    render(<LinkButton href="/courses">Browse</LinkButton>);
    const link = screen.getByRole("link", { name: /browse/i });
    expect(link.getAttribute("href")).toBe("/courses");
  });
});

describe("AppIcon", () => {
  it("is decorative (aria-hidden) without a title, and labelled with one", () => {
    const { container, rerender } = render(<AppIcon name="icon-601" />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.getAttribute("role")).toBeNull();

    rerender(<AppIcon name="icon-601" title="Home" />);
    const labelled = container.querySelector("svg")!;
    expect(labelled.getAttribute("role")).toBe("img");
    expect(labelled.getAttribute("aria-label")).toBe("Home");
    expect(labelled.getAttribute("aria-hidden")).toBeNull();
  });
});

describe("ProgressBar", () => {
  it("exposes a clamped progressbar value", () => {
    render(<ProgressBar value={30} max={60} label="Course progress" />);
    const bar = screen.getByRole("progressbar", { name: "Course progress" });
    expect(bar.getAttribute("aria-valuenow")).toBe("50");
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
  });

  it("never overflows 100 or drops below 0", () => {
    const { rerender } = render(<ProgressBar value={999} max={10} />);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100");
    rerender(<ProgressBar value={-5} max={10} />);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("0");
  });
});

describe("Notice", () => {
  it("carries a role for assistive tech", () => {
    render(<Notice tone="success" role="status">Saved</Notice>);
    expect(screen.getByRole("status").textContent).toContain("Saved");
  });
});

describe("Badge / EmptyState", () => {
  it("renders badge content and an empty-state action", () => {
    render(<Badge tone="leaf">Mastered</Badge>);
    expect(screen.getByText("Mastered")).toBeTruthy();

    render(
      <EmptyState title="Nothing due" action={<Button>Start</Button>}>
        You are all caught up.
      </EmptyState>
    );
    expect(screen.getByText("Nothing due")).toBeTruthy();
    expect(screen.getByRole("button", { name: /start/i })).toBeTruthy();
  });
});

describe("StepSegments — the broken bar over a sitting", () => {
  it("walked segments are leaf, current is tangerine, ahead is hairline; label carries the count", () => {
    render(<StepSegments total={5} current={2} label="Step 3 of 5" />);
    const bar = screen.getByRole("img", { name: "Step 3 of 5" });
    const segs = Array.from(bar.querySelectorAll("span"));
    expect(segs).toHaveLength(5);
    expect(segs[0].className).toContain("bg-leaf");
    expect(segs[1].className).toContain("bg-leaf");
    expect(segs[2].className).toContain("bg-tangerine");
    expect(segs[3].className).toContain("bg-ink/12");
    expect(segs[4].className).toContain("bg-ink/12");
  });

  it("injected steps keep the berry ring + dot-in arrival", () => {
    render(<StepSegments total={4} current={1} injected={new Set([2])} label="Step 2 of 4" />);
    const bar = screen.getByRole("img", { name: "Step 2 of 4" });
    const ringed = bar.querySelectorAll(".ring-berry\\/60");
    expect(ringed).toHaveLength(1);
    expect(ringed[0].className).toContain("dot-in");
  });
});
