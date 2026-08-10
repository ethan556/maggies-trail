// @vitest-environment jsdom
//
// ARIA-LABEL COLLISION LINT.
//
// Bug class this retires: a widget's SVG `aria-label` (role="img") sharing a substring with one of
// its own control labels (`<input>` / `<button>` aria-label). When that happens, screen-reader
// users hear two elements announce nearly the same name, and `getByLabelText` becomes ambiguous.
// It bit three times by hand (probabilityArea, dilationExplore, integerChips) before being linted.
//
// Rule: for every registered widget, no control's accessible name may appear as a substring of the
// image's accessible name (or vice versa), case-insensitively. Names must be distinguishable.

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { REGISTERED_WIDGETS } from "./widgets";
import { WidgetRenderer } from "./widgets";
import { SAMPLES } from "./widgetSamples";
import { WidgetSpec, type TWidget } from "@/lib/schema";

afterEach(cleanup);

// Parse through the real schema (as `/dev/widgets` and every sibling sample-sweep test do) so
// `.default(...)` fields (e.g. `offsetMax`, `gridMax`) are populated. Rendering an un-parsed raw
// sample fed NaN into several widgets' SVG geometry (React "Received NaN for the `y1`/`cx`/..."
// warnings) — that's not what the app ever actually renders.
const SPECS: TWidget[] = SAMPLES.map((s) => WidgetSpec.parse(s));

/** Words too generic to constitute a real collision (they'd never be a whole control name). */
const STOP = new Set(["of", "to", "at", "the", "a", "is", "and", "or", "in", "on"]);

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
}

/** A control name collides with the image name if the control's name (minus digits/stopwords)
 * appears verbatim inside the image's name. Digits are stripped so live values don't false-positive. */
function collides(imageName: string, controlName: string): boolean {
  const strip = (s: string) =>
    normalize(s)
      .split(" ")
      .filter((w) => !STOP.has(w) && !/^\d+$/.test(w))
      .join(" ");
  const img = strip(imageName);
  const ctl = strip(controlName);
  if (!ctl || ctl.length < 4) return false; // too short to be a meaningful name
  return img.includes(ctl);
}

describe("aria-label collision lint", () => {
  for (const kind of REGISTERED_WIDGETS) {
    it(`${kind}: image label is distinguishable from every control label`, () => {
      const spec = SPECS.find((s) => s.type === kind);
      expect(spec, `no sample for ${kind}`).toBeTruthy();
      if (!spec) return;

      const { container } = render(
        <WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} />
      );

      const images = Array.from(container.querySelectorAll('[role="img"]'));
      const controls = Array.from(container.querySelectorAll("input, button, [role='switch']"));

      const controlNames = controls
        .map((c) => c.getAttribute("aria-label") ?? "")
        .filter((n) => n.length > 0);

      for (const img of images) {
        const imgName = img.getAttribute("aria-label") ?? "";
        if (!imgName) continue;
        for (const ctl of controlNames) {
          expect(
            collides(imgName, ctl),
            `${kind}: image label "${imgName}" contains control label "${ctl}" — rename the SVG aria-label so the two are distinguishable`
          ).toBe(false);
        }
      }
    });
  }

  it("exercises every registered widget", () => {
    // Guards against the lint silently covering nothing if SAMPLES drifts.
    expect(REGISTERED_WIDGETS.length).toBeGreaterThan(0);
    for (const kind of REGISTERED_WIDGETS) {
      expect(SPECS.some((s) => s.type === kind), `missing sample: ${kind}`).toBe(true);
    }
  });
});

// Keep `screen` imported for parity with the other widget suites without tripping lint.
void screen;
