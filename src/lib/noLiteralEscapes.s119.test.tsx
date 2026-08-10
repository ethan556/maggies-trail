// @vitest-environment jsdom
/**
 * S119 — no widget may render a literal `\uXXXX` escape to a learner.
 *
 * Found while fixing release blocker 3: a caption written as JSX TEXT containing `\u00b0` renders
 * the eight characters backslash-u-0-0-b-0 rather than a degree sign. Inside a JS string literal
 * the escape is interpreted; inside JSX text (and inside a JSX attribute's quoted string) it is
 * not. The distinction is invisible on inspection and obvious to a learner, so it is worth a gate
 * rather than vigilance.
 *
 * This renders every sample in the gallery and asserts nothing user-visible contains the escape.
 */
import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { useState } from "react";
import { WidgetRenderer } from "@/components/widgets";
import { SAMPLES } from "@/components/widgetSamples";
import { WidgetSpec, type TWidget } from "./schema";

afterEach(() => cleanup());

function Host({ s }: { s: TWidget }) {
  const [v, setV] = useState<unknown>(null);
  return <WidgetRenderer spec={s} value={v} disabled={false} onChange={setV} />;
}

describe("no literal unicode escapes reach the screen", () => {
  const specs = SAMPLES.map((raw, i) => [i, WidgetSpec.parse(raw) as TWidget] as const);

  it.each(specs)("sample %i (%s) renders no literal escape", (_i, s) => {
    const c = render(<Host s={s} />).container;
    const text = c.textContent ?? "";
    // The bug looks exactly like this in the DOM.
    expect(text).not.toMatch(/\\u[0-9a-fA-F]{4}/);
    // aria-labels and valuetexts are read aloud, so they matter just as much.
    for (const el of c.querySelectorAll("[aria-label],[aria-valuetext]")) {
      expect(el.getAttribute("aria-label") ?? "").not.toMatch(/\\u[0-9a-fA-F]{4}/);
      expect(el.getAttribute("aria-valuetext") ?? "").not.toMatch(/\\u[0-9a-fA-F]{4}/);
    }
  });
});
