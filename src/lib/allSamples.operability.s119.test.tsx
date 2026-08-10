// @vitest-environment jsdom
/**
 * S119 — EVERY sample, not just the first of each type.
 *
 * `widgets.keyboard.test.tsx` resolves specs with `byType`, which takes the FIRST sample of a widget
 * type. That was fine when each type had one sample; it is not fine now. Six modes were added this
 * session behind an existing sample of the same type — `numberLineHop` rational and hop-size,
 * `lengthCompare` difference, `circleMeasureExplore` radiusScale, `volumeBuilder` round solids,
 * `shapeParts` cube — and the shared gate never rendered a single one of them.
 *
 * The "drive it to correct" half of that gate genuinely needs per-mode steps and stays where it is.
 * The OPERABILITY half does not: whether a control is a real element, reachable, and named is a
 * universal property, and it can be swept across every sample there is. This file does that.
 *
 * It is adversarial in the specific sense that it fails against defects this session actually
 * shipped: the `<g role="button" tabIndex={0}>` shim first written for `shapeParts` is caught here
 * on ANY sample, not only on whichever one happens to sort first.
 */
import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { useState } from "react";
import { WidgetRenderer } from "@/components/widgets";
import { SAMPLES } from "@/components/widgetSamples";
import { WidgetSpec, type TWidget } from "./schema";

afterEach(() => cleanup());

/** Every sample, parsed through zod so defaults are present exactly as the app sees them. */
const ALL: Array<{ i: number; type: string; spec: TWidget }> = SAMPLES.map((s, i) => ({
  i,
  type: (s as { type: string }).type,
  spec: WidgetSpec.parse(s) as TWidget
}));

function mountSpec(spec: TWidget) {
  function Host() {
    const [v, setV] = useState<unknown>(null);
    return <WidgetRenderer spec={spec} value={v} disabled={false} onChange={setV} />;
  }
  return render(<Host />).container;
}

const label = (r: { i: number; type: string }) => `sample #${r.i} (${r.type})`;

describe("coverage — the sweep genuinely reaches past the first sample of each type", () => {
  it("there are more samples than types, so first-only testing leaves modes unrendered", () => {
    const types = new Set(ALL.map((r) => r.type));
    expect(ALL.length).toBeGreaterThan(types.size);
  });

  it("names the types carrying more than one sample, so the gap is explicit", () => {
    const counts = new Map<string, number>();
    for (const r of ALL) counts.set(r.type, (counts.get(r.type) ?? 0) + 1);
    const multi = [...counts.entries()].filter(([, n]) => n > 1).map(([t]) => t);
    // Every one of these has at least one mode the first-only gate never renders.
    expect(multi.length).toBeGreaterThan(0);
  });
});

describe("ADVERSARIAL — every sample renders without throwing", () => {
  it.each(ALL.map((r) => [label(r), r] as const))("%s", (_l, r) => {
    expect(() => mountSpec(r.spec)).not.toThrow();
  });
});

describe("ADVERSARIAL — no role-shimmed controls anywhere (the shapeParts defect class)", () => {
  it.each(ALL.map((r) => [label(r), r] as const))("%s uses native elements for its controls", (_l, r) => {
    const c = mountSpec(r.spec);
    // Anything PRESENTED as pressable must BE pressable. A <g role="button"> only imitates the
    // focus, activation and pressed-state semantics a real button gets for free.
    for (const el of c.querySelectorAll('[role="button"], [role="radio"], [role="switch"], [role="checkbox"]'))
      expect(el.tagName, `${label(r)}: <${el.tagName.toLowerCase()} role="${el.getAttribute("role")}">`).toBe("BUTTON");
    // Anything focus-managed must be a natively focusable element.
    for (const el of c.querySelectorAll("[tabindex]"))
      expect(["BUTTON", "INPUT", "SELECT", "TEXTAREA", "A"], `${label(r)}: tabindex on <${el.tagName.toLowerCase()}>`).toContain(
        el.tagName
      );
    // A slider must be a real range input, or arrow keys and AT value reporting are lost.
    for (const el of c.querySelectorAll('[role="slider"]'))
      expect(el.tagName, `${label(r)}: role=slider`).toBe("INPUT");
  });
});

describe("ADVERSARIAL — every interactive control is named", () => {
  it.each(ALL.map((r) => [label(r), r] as const))("%s names all its controls", (_l, r) => {
    const c = mountSpec(r.spec);
    const named = (el: Element) =>
      !!(el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || (el.textContent ?? "").trim());
    for (const el of c.querySelectorAll("button"))
      expect(named(el), `${label(r)}: an unnamed <button>`).toBe(true);
    for (const el of c.querySelectorAll('input[type="range"]'))
      expect(
        !!(el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || el.closest("label")),
        `${label(r)}: an unnamed range input`
      ).toBe(true);
  });
});

describe("ADVERSARIAL — range inputs report a MEANING, not just a number", () => {
  it.each(ALL.map((r) => [label(r), r] as const))("%s gives sliders sane bounds", (_l, r) => {
    const c = mountSpec(r.spec);
    for (const el of c.querySelectorAll('input[type="range"]')) {
      const input = el as HTMLInputElement;
      const min = Number(input.min === "" ? 0 : input.min);
      const max = Number(input.max === "" ? 100 : input.max);
      // A slider whose range is empty or inverted cannot be driven to anything.
      expect(max, `${label(r)}: slider max ${max} <= min ${min}`).toBeGreaterThan(min);
      const val = Number(input.value);
      expect(val, `${label(r)}: value ${val} outside [${min}, ${max}]`).toBeGreaterThanOrEqual(min);
      expect(val).toBeLessThanOrEqual(max);
    }
  });
});

describe("ADVERSARIAL — touch targets meet the 44px minimum contract", () => {
  // SCOPE, stated honestly. jsdom has no layout engine, so no test here can measure a rendered
  // height. What CAN be proved is the explicit contract: a button either declares a min-height
  // utility of at least 44px (min-h-11 and up, or h-11/h-12), or it is sized by substantive
  // content it wraps — a bar, a figure, a tile — which carries its own height.
  //
  // A button that is BARE TEXT with no height class is the genuinely risky case, and that is what
  // this asserts. Claiming to verify more than that would be the same kind of false claim this
  // session spent its time removing.
  const heightClass = (cls: string) => {
    const m = cls.match(/(?:^|\s)(?:min-)?h-(\d+)(?:\s|$)/);
    if (m && Number(m[1]) >= 11) return true; // Tailwind spacing: 11 = 44px
    return /min-h-\[(4[4-9]|[5-9]\d|\d{3,})px\]|min-h-full|min-h-screen/.test(cls);
  };
  it.each(ALL.map((r) => [label(r), r] as const))("%s sizes its buttons", (_l, r) => {
    const c = mountSpec(r.spec);
    for (const el of c.querySelectorAll("button")) {
      const cls = el.getAttribute("class") ?? "";
      const wrapsContent = el.querySelector("svg, img, div") !== null;
      const ok = heightClass(cls) || wrapsContent;
      expect(ok, `${label(r)}: bare-text button with no min-height — "${cls.slice(0, 70)}"`).toBe(true);
    }
  });
});
