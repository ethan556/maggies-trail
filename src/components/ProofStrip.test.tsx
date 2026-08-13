// @vitest-environment jsdom
/**
 * ProofStrip — the WS-H Phase 3 one-line proof strip.
 *
 * jsdom has no `IntersectionObserver`, so `FakeIntersectionObserver` below stands in for it (a
 * controllable fake, not a real polyfill — `vitest.setup.ts` mirrors this exact
 * observe/unobserve/disconnect shape for `ResizeObserver`, feature-detected the same way
 * production code checks it). Assertions that need the count-up to have SETTLED force reduced
 * motion via the in-app `data-reduce-motion` toggle (`prefersReducedMotion()`, `@/lib/motion`) so
 * `useCountUp` snaps synchronously instead of requiring fake timers / rAF ticks — deterministic,
 * not a timing-dependent test.
 */
import { act, cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ProofStrip } from "./ProofStrip";

afterEach(cleanup);

type IOEntry = { isIntersecting: boolean };
type IOCallback = (entries: IOEntry[]) => void;

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  callback: IOCallback;
  disconnected = false;
  constructor(cb: IOCallback) {
    this.callback = cb;
    FakeIntersectionObserver.instances.push(this);
  }
  observe() {}
  unobserve() {}
  disconnect() {
    this.disconnected = true;
  }
  trigger(isIntersecting: boolean) {
    // The real IntersectionObserver invokes its callback off the render cycle, same as this fake
    // does; `act()` flushes the resulting setState synchronously so the very next assertion sees
    // it, matching how @testing-library/react wraps fireEvent internally.
    act(() => this.callback([{ isIntersecting }]));
  }
}

const originalIO = (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver;

beforeEach(() => {
  FakeIntersectionObserver.instances = [];
  (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver = FakeIntersectionObserver;
});

afterEach(() => {
  (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver = originalIO;
  delete document.documentElement.dataset.reduceMotion;
});

const strip = () => screen.getByText("courses", { exact: false }).closest("p") as HTMLElement;

describe("ProofStrip", () => {
  it("starts at zero before the strip has been observed as on screen", () => {
    render(<ProofStrip courseCount={129} lessonCount={1701} gradeSpan="K–Calc" />);
    expect(within(strip()).getByLabelText("0 courses")).toBeTruthy();
    expect(within(strip()).getByLabelText("0 lessons")).toBeTruthy();
    // the non-numeric facts never depend on the reveal state
    expect(within(strip()).getByText("K–Calc")).toBeTruthy();
    expect(within(strip()).getByText("state-aware feedback")).toBeTruthy();
  });

  it("counts up to the REAL catalogue numbers once the strip is observed intersecting", () => {
    document.documentElement.dataset.reduceMotion = "true"; // deterministic: snaps, no rAF ticks
    render(<ProofStrip courseCount={129} lessonCount={1701} gradeSpan="K–Calc" />);
    expect(FakeIntersectionObserver.instances).toHaveLength(1);
    FakeIntersectionObserver.instances[0].trigger(true);
    expect(within(strip()).getByLabelText("129 courses")).toBeTruthy();
    expect(within(strip()).getByLabelText("1701 lessons")).toBeTruthy();
  });

  it("reveals once — the observer disconnects after the first intersection", () => {
    document.documentElement.dataset.reduceMotion = "true";
    render(<ProofStrip courseCount={5} lessonCount={40} gradeSpan="K–1" />);
    const observer = FakeIntersectionObserver.instances[0];
    observer.trigger(true);
    expect(observer.disconnected).toBe(true);
  });

  it("does not reveal on a non-intersecting callback (e.g. the element leaving view first)", () => {
    render(<ProofStrip courseCount={5} lessonCount={40} gradeSpan="K–1" />);
    FakeIntersectionObserver.instances[0].trigger(false);
    expect(within(strip()).getByLabelText("0 courses")).toBeTruthy();
  });

  it("reveals immediately when IntersectionObserver is unavailable, never stuck at zero", () => {
    (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver = undefined;
    document.documentElement.dataset.reduceMotion = "true";
    render(<ProofStrip courseCount={129} lessonCount={1701} gradeSpan="K–Calc" />);
    expect(within(strip()).getByLabelText("129 courses")).toBeTruthy();
    expect(within(strip()).getByLabelText("1701 lessons")).toBeTruthy();
  });

  it("formats large counts with the same thousands separator the hero stat row uses", () => {
    document.documentElement.dataset.reduceMotion = "true";
    render(<ProofStrip courseCount={129} lessonCount={1701} gradeSpan="K–Calc" />);
    FakeIntersectionObserver.instances[0].trigger(true);
    expect(within(strip()).getByText("1,701")).toBeTruthy();
  });
});
