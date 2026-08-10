// @vitest-environment jsdom
/**
 * S119 — numberLineHop draws ONE ARC PER HOP.
 *
 * The bug: the renderer drew `|chosen - start|` arcs, each spanning a single unit. For hop = 1
 * that is right by coincidence, and every early-grades lesson uses hop = 1, which is why it
 * survived. But 18 shipped steps author hop > 1, and for those the picture contradicted the
 * lesson: `kc-03-03` teaches "count on by tens — three hops of ten" and drew THIRTY arcs;
 * `dop-03-02` drew 36 arcs for three hops of twelve. The hop count IS the content of those
 * lessons, and the drawing showed a different number.
 *
 * The contract now: `arcCount = |chosen - start| / hop` when the landing sits a whole number of
 * hops from the start, each arc spanning `hop` units. An off-lattice landing (an authored trap
 * that is not a whole number of hops away) draws ONE arc across the whole distance rather than a
 * misleading partial count.
 */
import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { WidgetRenderer } from "@/components/widgets";
import { WidgetSpec, type TWidget } from "./schema";

afterEach(() => cleanup());

const spec = (o: Record<string, unknown>) =>
  WidgetSpec.parse({
    type: "numberLineHop",
    prompt: "p",
    min: 0,
    max: 100,
    start: 0,
    hop: 10,
    hops: 3,
    direction: "forward",
    commonLandings: [],
    missFeedback: "miss",
    successFeedback: "ok",
    ...o
  }) as TWidget;

function mount(s: TWidget) {
  function Host() {
    const [v, setV] = useState<unknown>(null);
    return <WidgetRenderer spec={s} value={v} disabled={false} onChange={setV} />;
  }
  return render(<Host />).container;
}

const arcs = (c: HTMLElement) => c.querySelectorAll('[data-testid="nlh-arc"]').length;
/** Tap a landing by its tick label, the way a learner does. */
const tap = (n: number) => fireEvent.click(screen.getByRole("radio", { name: `Land on ${n}` }));

describe("numberLineHop — one arc per hop", () => {
  it("THE BUG, pinned: three hops of ten draws 3 arcs, not 30", () => {
    const c = mount(spec({ hop: 10, hops: 3, start: 0 }));
    tap(30);
    expect(arcs(c)).toBe(3);
  });

  it("four hops of ten from 30 draws 4 arcs (as100-02-01's shape)", () => {
    const c = mount(spec({ hop: 10, hops: 4, start: 30 }));
    tap(70);
    expect(arcs(c)).toBe(4);
  });

  it("three hops of twelve draws 3 arcs (dop-03-02's shape)", () => {
    const c = mount(spec({ min: 0, max: 60, hop: 12, hops: 3, start: 0 }));
    tap(36);
    expect(arcs(c)).toBe(3);
  });

  it("counting BACK draws one arc per hop too", () => {
    const c = mount(spec({ hop: 10, hops: 3, start: 70, direction: "back" }));
    tap(40);
    expect(arcs(c)).toBe(3);
  });

  it("hop = 1 is unchanged — the case that always worked", () => {
    const c = mount(spec({ min: 0, max: 10, hop: 1, hops: 4, start: 2 }));
    tap(6);
    expect(arcs(c)).toBe(4);
  });

  it("no landing chosen draws no arcs", () => {
    const c = mount(spec({ hop: 10, hops: 3, start: 0 }));
    expect(arcs(c)).toBe(0);
  });

  it("an off-lattice trap landing draws a single arc, never a misleading partial count", () => {
    // 25 is not a whole number of 10-hops from 0; it is reachable only as an authored trap.
    const c = mount(
      spec({ hop: 10, hops: 3, start: 0, commonLandings: [{ value: 25, feedback: "off the tens" }] })
    );
    tap(25);
    expect(arcs(c)).toBe(1);
  });
});
