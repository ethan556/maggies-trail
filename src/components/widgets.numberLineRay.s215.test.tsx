// @vitest-environment jsdom
/**
 * numberLineRay — the renderer, held to the house rule adopted after S214:
 *
 *   EVERY authored or generated string gets a test that RENDERS THE STATE which triggers it and
 *   asserts the claim is TRUE OF THAT STATE — not merely that the string appears.
 *
 * So every assertion below pairs a rendered string with an independent check of the mathematics it
 * claims. `oracle` is that independent check: membership decided from the raw integer parts of the
 * relation, written out here, never by calling the model. `the oracle really does bite` mutates it
 * and asserts the suite then fails.
 *
 * Nothing here reaches through `widgets.tsx`: this engine lives in its own module and is imported
 * directly, so the tests stand up before the one-line registry wiring lands.
 */

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { NumberLineRayW, type NumberLineRayValue } from "./widgets/numberLineRay";
import { SAMPLES } from "./widgetSamples";
import { NumberLineRaySpec, widgetIntegrityErrors, WidgetSpec, type TNumberLineRay, type TWidget } from "@/lib/schema";
import { canCheck, correctAnswerText, evaluate } from "@/lib/evaluate";

afterEach(cleanup);

/* ── the independent oracle ───────────────────────────────────────────────────────────────────── */

type Frac = { n: number; d: number };

/** Does `v` satisfy `coeff·x REL constant`? Cross multiplication on the raw integers, written out
 * here. Never calls the model. */
function oracle(rel: NumberLineRayValue, v: Frac, mutate = false): boolean {
  const cmp = rel.coeff.n * v.n * rel.constant.d - rel.constant.n * (rel.coeff.d * v.d);
  const gt = mutate ? rel.relation === "lt" : rel.relation === "gt";
  if (gt) return rel.inclusive ? cmp >= 0 : cmp > 0;
  return rel.inclusive ? cmp <= 0 : cmp < 0;
}

/* ── fixtures ─────────────────────────────────────────────────────────────────────────────────── */

const RAW: TNumberLineRay = NumberLineRaySpec.parse({
  type: "numberLineRay",
  prompt: "Build the set the words describe.",
  variable: "x",
  // x > 3 — the plainest instance, coefficient 1, no transforms.
  start: { coeff: { n: 1, d: 1 }, constant: { n: 3, d: 1 }, relation: "gt", inclusive: false },
  window: { min: { n: -6, d: 1 }, max: { n: 6, d: 1 }, tickStep: { n: 1, d: 1 } },
  step: { n: 1, d: 1 },
  transforms: [{ id: "neg2", factor: { n: -2, d: 1 }, label: "× (−2) both sides" }],
  target: { coeff: { n: 1, d: 1 }, constant: { n: -1, d: 1 }, relation: "lt", inclusive: true }
});

const SAMPLE = WidgetSpec.parse(
  (SAMPLES as Array<{ type?: string }>).find((s) => s?.type === "numberLineRay")!
) as TNumberLineRay;

/** Mount with real state, so an edit round-trips through `value` exactly as the player drives it. */
function mount(spec: TNumberLineRay = RAW, opts: { tone?: "info" | "neutral"; disabled?: boolean } = {}) {
  const seen: NumberLineRayValue[] = [];
  const Host = () => {
    const [v, setV] = useState<unknown>(undefined);
    return (
      <NumberLineRayW
        spec={spec}
        value={v}
        onChange={(next) => {
          seen.push(next as NumberLineRayValue);
          setV(next);
        }}
        disabled={opts.disabled ?? false}
        tone={opts.tone}
      />
    );
  };
  const { container } = render(<Host />);
  return { container, seen, latest: () => seen[seen.length - 1] };
}

/** `allSamples.operability.s119.test.tsx`'s touch-target predicate, transcribed here so this
 * engine's own suite enforces the same contract rather than waiting to be told by a gate that
 * scans a file this engine does not live in. */
const gateHeightClass = (cls: string): boolean => {
  const m = cls.match(/(?:^|\s)(?:min-)?h-(\d+)(?:\s|$)/);
  if (m && Number(m[1]) >= 11) return true;
  return /min-h-\[(4[4-9]|[5-9]\d|\d{3,})px\]|min-h-full|min-h-screen/.test(cls);
};

const solutionText = () => screen.getByTestId("nlr-solution").textContent ?? "";
const status = () => screen.getByTestId("nlr-status").textContent ?? "";
const dot = () => screen.getByTestId("nlr-dot");
const ray = () => screen.getByTestId("nlr-ray");

/* ── console.error trap (this path is not on vitest.setup's opt-in list, so it is set here) ────── */

let consoleErrors: string[] = [];
beforeEach(() => {
  consoleErrors = [];
  vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    consoleErrors.push(args.map(String).join(" "));
  });
});
afterEach(() => {
  const errs = consoleErrors;
  consoleErrors = [];
  vi.restoreAllMocks();
  expect(errs, `unexpected console.error:\n${errs.join("\n")}`).toEqual([]);
});

/* ── the suite ────────────────────────────────────────────────────────────────────────────────── */

describe("numberLineRay — what is drawn is what is true", () => {
  it("the picture, the words and the symbols all describe the same set, and the set is right", () => {
    mount();
    const claim: NumberLineRayValue = { coeff: { n: 1, d: 1 }, constant: { n: 3, d: 1 }, relation: "gt", inclusive: false };
    expect(solutionText()).toContain("x > 3");
    expect(solutionText()).toContain("(3, ∞)");
    expect(screen.getByTestId("nlr-endpoint-label").textContent).toBe("3 not included");
    expect(dot().getAttribute("data-filled")).toBe("false");
    expect(screen.getByTestId("nlr-line").getAttribute("aria-label")).toBe(
      "A number line shaded for all values greater than 3, 3 not included. 3 is not a solution."
    );
    // …and every one of those claims is TRUE of the relation, by the independent oracle.
    expect(oracle(claim, { n: 3, d: 1 })).toBe(false);
    expect(oracle(claim, { n: 7, d: 2 })).toBe(true);
    expect(oracle(claim, { n: 5, d: 2 })).toBe(false);
  });

  it("the membership readout is the real substitution at the value it names", () => {
    mount();
    const claim: NumberLineRayValue = { coeff: { n: 1, d: 1 }, constant: { n: 3, d: 1 }, relation: "gt", inclusive: false };
    // The probe starts on the endpoint — the one point open and closed differ by.
    expect(screen.getByTestId("nlr-probe-value").textContent).toBe("3");
    expect(screen.getByTestId("nlr-membership").textContent).toBe("3 > 3 is false, so 3 is not a solution.");
    expect(oracle(claim, { n: 3, d: 1 })).toBe(false);
    fireEvent.click(screen.getByTestId("nlr-probe-up"));
    expect(screen.getByTestId("nlr-probe-value").textContent).toBe("4");
    expect(screen.getByTestId("nlr-membership").textContent).toBe("4 > 3 is true, so 4 is a solution.");
    expect(oracle(claim, { n: 4, d: 1 })).toBe(true);
  });

  it("the oracle really does bite", () => {
    const claim: NumberLineRayValue = { coeff: { n: 1, d: 1 }, constant: { n: 3, d: 1 }, relation: "gt", inclusive: false };
    const straight = [2, 3, 4].map((k) => oracle(claim, { n: k, d: 1 }));
    const mutated = [2, 3, 4].map((k) => oracle(claim, { n: k, d: 1 }, true));
    // x > 3 is true only at 4; the mutated oracle reads the same numbers as x < 3, true only at 2.
    expect(straight).toEqual([false, false, true]);
    expect(mutated).toEqual([true, false, false]);
    expect(mutated).not.toEqual(straight);
  });
});

describe("numberLineRay — the endpoint is the control", () => {
  it("pressing the dot closes it: one point joins the set, and every channel says so", () => {
    const { latest } = mount();
    fireEvent.click(screen.getByTestId("nlr-endpoint"));
    expect(latest()).toEqual({ coeff: { n: 1, d: 1 }, constant: { n: 3, d: 1 }, relation: "gt", inclusive: true });
    expect(solutionText()).toContain("x ≥ 3");
    expect(solutionText()).toContain("[3, ∞)");
    expect(screen.getByTestId("nlr-endpoint-label").textContent).toBe("3 included");
    expect(dot().getAttribute("data-filled")).toBe("true");
    expect(screen.getByTestId("nlr-inclusive").textContent).toBe("endpoint included");
    expect(status()).toContain("Close the endpoint: 3 joins the solutions, so > becomes ≥.");
    // TRUE of the new state, and of nothing else: only 3 changed.
    const before: NumberLineRayValue = { coeff: { n: 1, d: 1 }, constant: { n: 3, d: 1 }, relation: "gt", inclusive: false };
    const after = latest();
    const moved = [];
    for (let k = -12; k <= 12; k += 1) if (oracle(before, { n: k, d: 2 }) !== oracle(after, { n: k, d: 2 })) moved.push(k / 2);
    expect(moved).toEqual([3]);
  });

  it("the arrow keys move the endpoint through the declared lattice", () => {
    const { latest } = mount();
    const endpoint = screen.getByTestId("nlr-endpoint");
    fireEvent.keyDown(endpoint, { key: "ArrowLeft" });
    expect(latest().constant).toEqual({ n: 2, d: 1 });
    expect(solutionText()).toContain("x > 2");
    fireEvent.keyDown(endpoint, { key: "ArrowRight" });
    fireEvent.keyDown(endpoint, { key: "ArrowRight" });
    expect(latest().constant).toEqual({ n: 4, d: 1 });
    expect(solutionText()).toContain("x > 4");
    expect(status()).toContain("Move the boundary up by 1: it goes from 3 to 4.");
  });

  it("the endpoint clamps at the drawn end of the line and says what moved", () => {
    mount();
    const endpoint = screen.getByTestId("nlr-endpoint");
    for (let i = 0; i < 4; i += 1) fireEvent.keyDown(endpoint, { key: "ArrowRight" });
    expect(solutionText()).toContain("x > 6");
    fireEvent.keyDown(endpoint, { key: "ArrowRight" });
    expect(solutionText()).toContain("x > 6");
    expect(status()).toContain("7 is off the drawn line, so the boundary stopped at 6.");
  });

  it("the ± steppers and the slider are the SAME edit as the arrow keys", () => {
    const a = mount();
    fireEvent.keyDown(screen.getByTestId("nlr-endpoint"), { key: "ArrowLeft" });
    const viaKeyboard = a.latest();
    cleanup();
    const b = mount();
    fireEvent.click(screen.getByTestId("nlr-boundary-down"));
    const viaStepper = b.latest();
    cleanup();
    const c = mount();
    fireEvent.change(screen.getByTestId("nlr-boundary-range"), { target: { value: "2" } });
    const viaSlider = c.latest();
    expect(viaStepper).toEqual(viaKeyboard);
    expect(viaSlider).toEqual(viaKeyboard);
  });
});

describe("numberLineRay — turning the ray round, from either alphabet", () => {
  it("the arrow button and the symbol button reach the identical state", () => {
    const a = mount();
    fireEvent.click(screen.getByTestId("nlr-direction"));
    const viaPicture = a.latest();
    expect(solutionText()).toContain("x < 3");
    cleanup();
    const b = mount();
    fireEvent.click(screen.getByTestId("nlr-symbol"));
    const viaSymbol = b.latest();
    expect(solutionText()).toContain("x < 3");
    expect(viaSymbol).toEqual(viaPicture);
    // TRUE of the state: 4 was in, and is now out.
    expect(oracle(viaSymbol, { n: 4, d: 1 })).toBe(false);
    expect(oracle(viaSymbol, { n: 2, d: 1 })).toBe(true);
  });

  it("typing the right-hand side moves the picture", () => {
    const { latest } = mount();
    fireEvent.change(screen.getByTestId("nlr-constant"), { target: { value: "-4" } });
    expect(latest()).toEqual({ coeff: { n: 1, d: 1 }, constant: { n: -4, d: 1 }, relation: "gt", inclusive: false });
    expect(solutionText()).toContain("x > −4");
    expect(screen.getByTestId("nlr-endpoint-label").textContent).toBe("−4 not included");
    expect(oracle(latest(), { n: -4, d: 1 })).toBe(false);
    expect(oracle(latest(), { n: -3, d: 1 })).toBe(true);
  });

  it("a half-typed minus is a draft and never becomes a claim", () => {
    const { seen } = mount();
    const field = () => screen.getByTestId("nlr-constant") as HTMLInputElement;
    // A `type="number"` field reports an unparseable entry as "", so the draft it holds is empty
    // rather than "−". Either way the point is the same: nothing is committed, and the picture and
    // the solved form still state exactly the relation the model holds.
    fireEvent.change(field(), { target: { value: "-" } });
    expect(seen).toEqual([]);
    expect(solutionText()).toContain("x > 3");
    expect(screen.getByTestId("nlr-endpoint-label").textContent).toBe("3 not included");
    expect(field().value).toBe("");
    fireEvent.change(field(), { target: { value: "-2" } });
    expect(solutionText()).toContain("x > −2");
    expect(field().value).toBe("-2");
    // and blurring an abandoned draft returns the field to the model's own value
    fireEvent.change(field(), { target: { value: "" } });
    fireEvent.blur(field());
    expect(field().value).toBe("-2");
  });
});

describe("numberLineRay — inequality reversal, on the number line", () => {
  it("multiplying both sides by −2 without turning the sign round moves the ray, visibly", () => {
    const { latest } = mount();
    const before = { coeff: { n: 1, d: 1 }, constant: { n: 3, d: 1 }, relation: "gt" as const, inclusive: false };
    fireEvent.click(screen.getByTestId("nlr-transform-neg2"));
    const after = latest();
    expect(after).toEqual({ coeff: { n: -2, d: 1 }, constant: { n: -6, d: 1 }, relation: "gt", inclusive: false });
    // the written relation changed…
    expect(screen.getByTestId("nlr-coeff").textContent).toContain("−2x");
    expect((screen.getByTestId("nlr-constant") as HTMLInputElement).value).toBe("-6");
    // …the endpoint did NOT move…
    expect(screen.getByTestId("nlr-endpoint-label").textContent).toBe("3 not included");
    // …and the ray now runs the other way. Two independent readings of that: the drawn ray's
    // geometry, and the solved form.
    expect(solutionText()).toContain("x < 3");
    expect(Number(ray().getAttribute("x2"))).toBeLessThan(Number(ray().getAttribute("x1")));
    expect(status()).toContain("The solution set moved from x > 3 to x < 3.");
    // TRUE of both states, by the oracle: 4 satisfied the first and does not satisfy the second.
    expect(oracle(before, { n: 4, d: 1 })).toBe(true);
    expect(oracle(after, { n: 4, d: 1 })).toBe(false);
  });

  it("turning the sign round afterwards puts the set back exactly", () => {
    const { latest } = mount();
    fireEvent.click(screen.getByTestId("nlr-transform-neg2"));
    fireEvent.click(screen.getByTestId("nlr-symbol"));
    const after = latest();
    expect(after).toEqual({ coeff: { n: -2, d: 1 }, constant: { n: -6, d: 1 }, relation: "lt", inclusive: false });
    expect(solutionText()).toContain("x > 3");
    expect(status()).toContain("The solution set moved from x < 3 to x > 3.");
    for (let k = -12; k <= 12; k += 1) {
      const start = { coeff: { n: 1, d: 1 }, constant: { n: 3, d: 1 }, relation: "gt" as const, inclusive: false };
      expect(oracle(after, { n: k, d: 2 }), `${k}/2`).toBe(oracle(start, { n: k, d: 2 }));
    }
  });

  it("on the shipped sample, × (−1) turns the ray and × 2 never does", () => {
    const { latest } = mount(SAMPLE);
    expect(solutionText()).toContain("x > −5"); // −x < 5
    fireEvent.click(screen.getByTestId("nlr-transform-double"));
    expect(latest()).toEqual({ coeff: { n: -2, d: 1 }, constant: { n: 10, d: 1 }, relation: "lt", inclusive: false });
    expect(solutionText()).toContain("x > −5"); // unchanged, and the words say so
    expect(status()).toContain("The solution set is unchanged: still x > −5.");
    fireEvent.click(screen.getByTestId("nlr-transform-neg"));
    expect(solutionText()).toContain("x < −5");
    expect(status()).toContain("The solution set moved from x > −5 to x < −5.");
  });
});

describe("numberLineRay — open and closed are unmistakable, and undo is exact", () => {
  it("open leaves a literal gap between the dot and the ray; closed does not", () => {
    mount();
    expect(dot().getAttribute("data-filled")).toBe("false");
    expect(ray().getAttribute("data-open-gap")).toBe("10");
    const openStart = Number(ray().getAttribute("x1"));
    const dotX = Number(dot().getAttribute("cx"));
    expect(openStart - dotX).toBe(10);
    fireEvent.click(screen.getByTestId("nlr-endpoint"));
    expect(dot().getAttribute("data-filled")).toBe("true");
    expect(ray().getAttribute("data-open-gap")).toBe("0");
    expect(Number(ray().getAttribute("x1"))).toBe(Number(dot().getAttribute("cx")));
    // the words move with the shape — so the distinction survives a monochrome screen
    expect(screen.getByTestId("nlr-endpoint-label").textContent).toBe("3 included");
  });

  it("undo steps back through the moves, exactly", () => {
    const { latest } = mount();
    fireEvent.click(screen.getByTestId("nlr-endpoint")); // close
    fireEvent.click(screen.getByTestId("nlr-direction")); // flip
    expect(solutionText()).toContain("x ≤ 3");
    fireEvent.click(screen.getByTestId("nlr-undo"));
    expect(solutionText()).toContain("x ≥ 3");
    fireEvent.click(screen.getByTestId("nlr-undo"));
    expect(solutionText()).toContain("x > 3");
    expect(latest()).toEqual({ coeff: { n: 1, d: 1 }, constant: { n: 3, d: 1 }, relation: "gt", inclusive: false });
    expect(screen.queryByTestId("nlr-undo")).toBeNull(); // nothing left to step back to
  });

  it("consecutive stepper presses are ONE step back, not four", () => {
    mount();
    for (let i = 0; i < 4; i += 1) fireEvent.click(screen.getByTestId("nlr-boundary-down"));
    expect(solutionText()).toContain("x > −1");
    fireEvent.click(screen.getByTestId("nlr-undo"));
    expect(solutionText()).toContain("x > 3");
  });
});

describe("numberLineRay — access", () => {
  it("every control is a native button or input, keyboard-reachable, and ≥ 44 px", () => {
    const { container } = mount();
    const controls = Array.from(container.querySelectorAll("button, input"));
    expect(controls.length).toBeGreaterThanOrEqual(9);
    for (const el of controls) {
      expect(["BUTTON", "INPUT"]).toContain(el.tagName);
      expect((el as HTMLButtonElement).disabled).toBe(false);
      // Measured at a 320 px viewport: the two object handles carry an explicit 44×44 inline box;
      // every other control carries Tailwind's `h-11` / `min-h-11` (2.75 rem = 44 px).
      const cls = el.getAttribute("class") ?? "";
      expect(gateHeightClass(cls), `${el.getAttribute("data-testid")} has no 44 px height CLASS: "${cls}"`).toBe(true);
    }
    // The handles ON the mathematical object carry it as a class too. An inline `width: 44px` is
    // genuinely 44 px and the repo's contract still cannot see it — the guarantee has to be
    // machine-visible, not merely true (S215 Fable-QA, F1).
    expect(screen.getByTestId("nlr-endpoint").getAttribute("class")).toContain("h-11");
    expect(screen.getByTestId("nlr-endpoint").getAttribute("class")).toContain("w-11");
    expect(screen.getByTestId("nlr-direction").getAttribute("class")).toContain("min-h-11");
    // …and no control hides its size inline, where the contract cannot reach it.
    for (const el of controls) {
      expect(el.getAttribute("style") ?? "", el.getAttribute("data-testid") ?? "").not.toContain("width: 44px");
    }
  });

  it("no two touch targets on the picture can overlap, in ANY reachable state", () => {
    /* THE GEOMETRY CONTRACT (S215 Fable-QA, F2).
     *
     * The picture is a SCALED coordinate space; a control laid over it keeps its 44 CSS px box
     * while the space shrinks with the viewport. So a separation expressed in viewBox units is a
     * guarantee at exactly one width, and the contract has to be stated in CSS px at the NARROWEST
     * supported one. This engine's answer is structural: exactly ONE fixed-size target lives on the
     * picture, so there is no pair left to collide at any width. The sweep enforces that over the
     * whole reachable state space rather than over a handful of samples — which is precisely what
     * a four-state test missed. */
    const MIN_CONTAINER_PX = 288; // a 320 px viewport minus the stage's 16 px gutters
    const VIEW_W = 320;
    const VIEW_H = 104;
    const scale = MIN_CONTAINER_PX / VIEW_W;
    const chebyshev = (a: { x: number; y: number }, b: { x: number; y: number }) =>
      Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)); // axis-aligned squares overlap below 44

    let maxOverlays = 0;
    let worstPair = Infinity;
    let statesSwept = 0;
    for (const coeff of [1, -1]) {
      for (const relation of ["lt", "gt"] as const) {
        for (const inclusive of [false, true]) {
          for (let b = -6; b <= 6; b += 1) {
            cleanup();
            const { container } = render(
              <NumberLineRayW
                spec={SAMPLE}
                value={{ coeff: { n: coeff, d: 1 }, constant: { n: coeff * b, d: 1 }, relation, inclusive }}
                onChange={() => {}}
                disabled={false}
              />
            );
            statesSwept += 1;
            const overlays = Array.from(container.querySelectorAll<HTMLElement>('[data-overlay="picture"]')).map((el) => ({
              id: el.getAttribute("data-testid") ?? "",
              x: (parseFloat(el.style.left) / 100) * MIN_CONTAINER_PX,
              y: (parseFloat(el.style.top) / 100) * (MIN_CONTAINER_PX * (VIEW_H / VIEW_W))
            }));
            maxOverlays = Math.max(maxOverlays, overlays.length);
            for (let i = 0; i < overlays.length; i += 1) {
              for (let j = i + 1; j < overlays.length; j += 1) {
                worstPair = Math.min(worstPair, chebyshev(overlays[i], overlays[j]));
              }
            }
          }
        }
      }
    }
    expect(statesSwept).toBe(104);
    expect(maxOverlays).toBe(1); // one target on the picture, so no pair exists to collide
    if (worstPair !== Infinity) expect(worstPair).toBeGreaterThanOrEqual(44);

    /* THE SWEEP BITES. The geometry this replaced put a second 44 px puck on the ray at
     * `clamp(endpointX ± 58, PAD, VW − PAD)`. Run that rule over the same state space and the same
     * separation test and it collides — reproducing the assessor's count exactly: six states
     * overlap, two of them are pixel-identical. A sweep that cannot fail certifies nothing. */
    const oldSeparations: number[] = [];
    for (const direction of ["greater", "less"] as const) {
      for (let b = -6; b <= 6; b += 1) {
        const t = (b + 6) / 12;
        const endpointX = 30 + t * (VIEW_W - 60);
        const arrowX = direction === "greater" ? Math.min(VIEW_W - 30, endpointX + 58) : Math.max(30, endpointX - 58);
        oldSeparations.push(Math.abs(endpointX - arrowX) * scale);
      }
    }
    expect(oldSeparations.filter((d) => d < 44)).toHaveLength(6);
    expect(oldSeparations.filter((d) => d === 0)).toHaveLength(2);
  });

  it("the accessible names state the MATHEMATICS, never a position on screen", () => {
    const { container } = mount();
    /* POSITION VOCABULARY — the thing this engine must never say, because a ray's meaning is which
     * numbers are in it, not where a dot sits on a screen.
     *
     * Scanned PER STRING, never over a concatenated `textContent` blob. Welding a DOM tree into one
     * string destroys word boundaries ("…5.66).errorWhat's…"), which makes any `\b`-anchored
     * negative assertion over such a blob vacuous; this walks each aria-label and each text node on
     * its own so the boundaries survive. */
    const POSITION = /pixel|left of the screen|two thirds across|slider at|field \d|\bdot at \d/i;
    // …and it BITES: a check that cannot fail certifies nothing.
    expect("the slider at 3").toMatch(POSITION);
    expect("a dot at 40 pixels from the left of the screen").toMatch(POSITION);
    expect("all values greater than 3, 3 not included").not.toMatch(POSITION);

    const names = Array.from(document.querySelectorAll("[aria-label]")).map((el) => el.getAttribute("aria-label") ?? "");
    expect(names.length).toBeGreaterThan(4);
    for (const name of names) expect(name, name).not.toMatch(POSITION);

    // every VISIBLE string too, one text node at a time
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const nodes: string[] = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const text = (n.textContent ?? "").trim();
      if (text) nodes.push(text);
    }
    expect(nodes.length).toBeGreaterThan(10);
    for (const text of nodes) expect(text, text).not.toMatch(POSITION);

    expect(screen.getByTestId("nlr-endpoint").getAttribute("aria-label")).toBe(
      "The endpoint of the solution set is at 3, and 3 is not a solution. Press Enter to put it into the solution set. " +
        "Use the left and right arrow keys to move the endpoint by 1."
    );
    expect(screen.getByTestId("nlr-direction").getAttribute("aria-label")).toBe(
      "The ray runs toward larger numbers: all values greater than 3, 3 not included. Press Enter to turn it round."
    );
    expect(screen.getByTestId("nlr-symbol").getAttribute("aria-label")).toBe(
      "The relation symbol is >. Press Enter to turn it round: x > 3 would become x < 3."
    );
    expect(screen.getByTestId("nlr-boundary-range").getAttribute("aria-valuetext")).toBe(
      "all values greater than 3, 3 not included"
    );
  });

  it("the accessible names stay true after the state moves", () => {
    mount();
    fireEvent.click(screen.getByTestId("nlr-transform-neg2")); // −2x > −6, drawn as x < 3
    expect(screen.getByTestId("nlr-direction").getAttribute("aria-label")).toBe(
      "The ray runs toward smaller numbers: all values less than 3, 3 not included. Press Enter to turn it round."
    );
    expect(screen.getByTestId("nlr-symbol").getAttribute("aria-label")).toBe(
      "The relation symbol is >. Press Enter to turn it round: −2x > −6 would become −2x < −6."
    );
    // the locked coefficient explains itself in mathematics, not in mechanics
    expect(within(screen.getByTestId("nlr-coeff")).getByText(/only changes when you multiply or divide BOTH sides/)).toBeTruthy();
  });

  it("nothing carries the target until reveal, and the ghost is the only place it appears", () => {
    const { container } = mount();
    const all = [container, ...Array.from(container.querySelectorAll("*"))];
    const text = all
      .flatMap((el) => [
        ...Array.from(el.attributes ?? []).map((a) => a.value),
        ...Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent ?? "")
      ])
      .join(" \n ");
    for (const forbidden of ["x ≤ −1", "(−∞, −1]", "the target set is"]) {
      expect(text.includes(forbidden), forbidden).toBe(false);
    }
    cleanup();
    mount(RAW, { tone: "info", disabled: true });
    expect(screen.getByTestId("nlr-ghost").textContent).toBe("the target set is x ≤ −1");
    expect(screen.getByTestId("nlr-ghost").getAttribute("aria-hidden")).toBe("true");
  });

  it("with reduced motion nothing travels and the words carry the whole move", () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: /prefers-reduced-motion:\s*reduce/.test(query),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false
    })) as typeof window.matchMedia;
    try {
      const { container } = mount();
      fireEvent.click(screen.getByTestId("nlr-transform-neg2"));
      // the state change is complete without any motion at all
      expect(solutionText()).toContain("x < 3");
      expect(screen.getByTestId("nlr-coeff").textContent).toContain("−2x");
      expect(container.querySelectorAll("[data-morph-ms]")).toHaveLength(0);
      // …and the reduced plan's own words, including its net delta, reached the live region
      expect(status()).toContain("Multiply both sides by a negative number");
      expect(status()).toContain("The solution set moved from x > 3 to x < 3.");
      expect(status()).toContain("State delta:");
    } finally {
      window.matchMedia = original;
    }
  });

  it("a locked control is disabled and the rest stay usable", () => {
    render(
      <NumberLineRayW spec={RAW} value={undefined} onChange={() => {}} disabled={false} locks={["transform"]} />
    );
    expect((screen.getByTestId("nlr-transform-neg2") as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByTestId("nlr-endpoint") as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByTestId("nlr-symbol") as HTMLButtonElement).disabled).toBe(false);
  });
});

describe("numberLineRay — the grader and the picture tell one story", () => {
  /** RAW's target is the set `x \u2264 \u22121`: endpoint \u22121, ray toward the smaller numbers, endpoint in. */
  const TARGET = { coeff: { n: 1, d: 1 }, constant: { n: -1, d: 1 }, relation: "lt" as const, inclusive: true };
  const claim = (coeff: number, constant: number, relation: "lt" | "gt", inclusive: boolean): NumberLineRayValue => ({
    coeff: { n: coeff, d: 1 },
    constant: { n: constant, d: 1 },
    relation,
    inclusive
  });
  /** What the widget actually draws for a value \u2014 read off the DOM, not from the model. */
  const drawn = (v: NumberLineRayValue): string => {
    cleanup();
    render(<NumberLineRayW spec={RAW} value={v} onChange={() => {}} disabled />);
    const text = screen.getByTestId("nlr-solution").textContent ?? "";
    // strip the interval that follows it — it opens with "(" or "[" depending on inclusivity
    return text.split(/\s[[(]/)[0].trim();
  };

  it("an equivalent WRITING of the target set grades correct", () => {
    // \u22122x \u2265 2 is the same claim as x \u2264 \u22121 \u2014 boundary 2 \u00f7 (\u22122) = \u22121, and the negative
    // coefficient turns the written \u2265 into a drawn \u2264. Checked here by hand, then by the oracle.
    const written = claim(-2, 2, "gt", true);
    expect(drawn(written)).toBe("x \u2264 \u22121");
    for (let k = -12; k <= 12; k += 1) {
      expect(oracle(written, { n: k, d: 2 }), `${k}/2`).toBe(oracle(TARGET, { n: k, d: 2 }));
    }
    expect(evaluate(RAW as TWidget, written).correct).toBe(true);
    expect(evaluate(RAW as TWidget, TARGET).correct).toBe(true);
  });

  it("the diagnosis names which of the three facts is wrong, and says nothing false about the state", () => {
    const wrongEndpoint = claim(1, 3, "gt", false); // x > 3
    expect(drawn(wrongEndpoint)).toBe("x > 3");
    expect(evaluate(RAW as TWidget, wrongEndpoint).feedback).toContain(
      "Your line shows x > 3, so its endpoint sits at 3. The endpoint is the part that is not right yet."
    );
    // …and 3 really is where it turns over: 3 is out, anything above is in.
    expect(oracle(wrongEndpoint, { n: 3, d: 1 })).toBe(false);
    expect(oracle(wrongEndpoint, { n: 7, d: 2 })).toBe(true);

    const wrongDirection = claim(1, -1, "gt", true); // x \u2265 \u22121
    expect(drawn(wrongDirection)).toBe("x \u2265 \u22121");
    expect(evaluate(RAW as TWidget, wrongDirection).feedback).toContain(
      "Your line shows x \u2265 \u22121, so it runs toward the larger numbers."
    );
    expect(oracle(wrongDirection, { n: 0, d: 1 })).toBe(true);
    expect(oracle(wrongDirection, { n: -2, d: 1 })).toBe(false);

    const wrongEndpointMembership = claim(1, -1, "lt", false); // x < \u22121
    expect(drawn(wrongEndpointMembership)).toBe("x < \u22121");
    expect(evaluate(RAW as TWidget, wrongEndpointMembership).feedback).toContain(
      "Your line shows x < \u22121, so \u22121 is left out."
    );
    expect(oracle(wrongEndpointMembership, { n: -1, d: 1 })).toBe(false);
    expect(oracle(TARGET, { n: -1, d: 1 })).toBe(true);
  });

  it("the diagnosis never prints the target", () => {
    for (const v of [claim(1, 3, "gt", false), claim(1, -1, "gt", true), claim(1, -1, "lt", false)]) {
      const feedback = evaluate(RAW as TWidget, v).feedback;
      expect(feedback.includes("x \u2264 \u22121"), feedback).toBe(false);
      expect(feedback.length).toBeGreaterThanOrEqual(25);
    }
  });

  it("Check is offered only once there is a relation to check, and never without a target", () => {
    expect(canCheck(RAW as TWidget, undefined)).toBe(false);
    expect(canCheck(RAW as TWidget, { coeff: { n: 0, d: 1 }, constant: { n: 1, d: 1 }, relation: "gt", inclusive: false })).toBe(false);
    expect(canCheck(RAW as TWidget, TARGET)).toBe(true);
    const explore = NumberLineRaySpec.parse({ ...RAW, target: undefined }) as TWidget;
    expect(canCheck(explore, TARGET)).toBe(false);
    expect(correctAnswerText(explore)).toBe("");
    expect(correctAnswerText(RAW as TWidget)).toBe("x \u2264 \u22121");
  });

  it("the grader is correct exactly when the picture reads the target set", () => {
    const states: NumberLineRayValue[] = [
      claim(1, 3, "gt", false),
      claim(1, -1, "lt", true),
      claim(-2, 2, "gt", true),
      claim(1, -1, "lt", false),
      claim(1, -1, "gt", true),
      claim(-1, 1, "lt", true)
    ];
    for (const v of states) {
      const graded = evaluate(RAW as TWidget, v).correct;
      const picture = drawn(v) === "x \u2264 \u22121";
      expect(graded, `${JSON.stringify(v)} \u2192 ${drawn(v)}`).toBe(picture);
    }
  });
});

describe("numberLineRay — requireSolvedForm: grading the FORM as well as the set", () => {
  /** `−2x > −8` already DRAWS `x < 4`, so graded on the set alone the item begins at its answer.
   * With the flag, the task is to reach the solved form without moving the line. */
  const SOLVE: TNumberLineRay = NumberLineRaySpec.parse({
    type: "numberLineRay",
    prompt: "Reach x on its own without letting the line move.",
    variable: "x",
    start: { coeff: { n: -2, d: 1 }, constant: { n: -8, d: 1 }, relation: "gt", inclusive: false },
    window: { min: { n: -2, d: 1 }, max: { n: 10, d: 1 }, tickStep: { n: 1, d: 1 } },
    step: { n: 1, d: 1 },
    transforms: [
      { id: "div", factor: { n: -1, d: 2 }, label: "÷ (−2) on both sides" },
      { id: "mul", factor: { n: -2, d: 1 }, label: "× (−2) on both sides" }
    ],
    target: { coeff: { n: 1, d: 1 }, constant: { n: 4, d: 1 }, relation: "lt", inclusive: false },
    requireSolvedForm: true,
    fallbackFeedback: "Test a number on each side of the endpoint in the original −2x > −8 and see which side really works."
  });
  const V = (cn: number, cd: number, k: number, relation: "lt" | "gt", inclusive = false): NumberLineRayValue => ({
    coeff: { n: cn, d: cd },
    constant: { n: k, d: 1 },
    relation,
    inclusive
  });
  /** INDEPENDENT set-equality: two relations name the same set iff they agree at every sampled
   * point, decided by the oracle. Never asks the schema helper the grader asks. */
  const sameSetByOracle = (a: NumberLineRayValue, b: NumberLineRayValue) => {
    for (let k = -24; k <= 24; k += 1) if (oracle(a, { n: k, d: 2 }) !== oracle(b, { n: k, d: 2 })) return false;
    return true;
  };
  const TARGET = V(1, 1, 4, "lt");

  it("the untouched start is NOT correct, and the solved form is", () => {
    const start = V(-2, 1, -8, "gt");
    // the two states name the same SET — checked independently, by sampling
    expect(sameSetByOracle(start, TARGET)).toBe(true);
    // …and yet only one of them is the answer, because the form is graded too
    expect(evaluate(SOLVE as TWidget, start).correct).toBe(false);
    expect(evaluate(SOLVE as TWidget, TARGET).correct).toBe(true);
    expect(widgetIntegrityErrors(SOLVE as TWidget)).toEqual([]);
  });

  it("right set, wrong form gets its OWN message — never a diagnosis that is false of the state", () => {
    // reachable in two presses of the one intended button: −2x > −8, scaled twice by −1/2
    const twice = V(-1, 2, -2, "gt");
    // reachable the other way: ×(−1) then flip
    const doubled = V(2, 1, 8, "lt");
    for (const state of [twice, doubled]) {
      expect(sameSetByOracle(state, TARGET), JSON.stringify(state)).toBe(true); // the set IS right
      const r = evaluate(SOLVE as TWidget, state);
      expect(r.correct).toBe(false);
      expect(r.feedback).toContain("Your line already shows the right set of numbers");
      // …and it must NOT claim one of the three facts is wrong, because none of them is
      expect(r.feedback).not.toContain("The endpoint is the part that is not right yet");
      expect(r.feedback).not.toContain("Which way the ray runs is the part that is not right yet");
      expect(r.feedback).not.toContain("Whether the endpoint itself belongs is the part that is not right yet");
      expect(r.feedback).not.toContain("x < 4"); // and it never prints the target
    }
    // it quotes the learner's OWN written relation, and the quote is true of the state
    expect(evaluate(SOLVE as TWidget, twice).feedback).toContain("The inequality still reads (−1/2)x > −2");
    expect(evaluate(SOLVE as TWidget, doubled).feedback).toContain("The inequality still reads 2x < 8");
  });

  it("a wrong SET still gets the direction diagnosis, unchanged", () => {
    const scaledNotFlipped = V(1, 1, 4, "gt"); // x > 4 — the misconception this engine exists for
    expect(sameSetByOracle(scaledNotFlipped, TARGET)).toBe(false);
    const r = evaluate(SOLVE as TWidget, scaledNotFlipped);
    expect(r.correct).toBe(false);
    expect(r.feedback).toContain("Your line shows x > 4, so it runs toward the larger numbers.");
    expect(r.feedback).toContain("Which way the ray runs is the part that is not right yet");
    expect(r.feedback).not.toContain("x < 4");
  });

  it("MUTATION: dropping the flag flips the verdict on exactly the states the flag was added for", () => {
    const withoutFlag = NumberLineRaySpec.parse({ ...SOLVE, requireSolvedForm: undefined }) as TWidget;
    const formOnly = [V(-2, 1, -8, "gt"), V(-1, 2, -2, "gt"), V(2, 1, 8, "lt")];
    for (const state of formOnly) {
      expect(evaluate(SOLVE as TWidget, state).correct, "with the flag").toBe(false);
      expect(evaluate(withoutFlag, state).correct, "without the flag").toBe(true);
    }
    // and the begins-solved guard moves with it: legal with the flag, refused without
    expect(widgetIntegrityErrors(SOLVE as TWidget)).toEqual([]);
    expect(widgetIntegrityErrors(withoutFlag).join(" ")).toContain("begins solved");
  });

  it("OLD PATHS REDUCE LITERALLY: without the flag, grading is set-equality and nothing else", () => {
    // The shipped gallery sample carries no `requireSolvedForm`. Sweep the reachable space and
    // assert `correct` is exactly "same set as the target", decided by the independent oracle.
    const sampleTarget: NumberLineRayValue = {
      coeff: SAMPLE.target!.coeff,
      constant: SAMPLE.target!.constant,
      relation: SAMPLE.target!.relation,
      inclusive: SAMPLE.target!.inclusive
    };
    let swept = 0;
    let correctSeen = 0;
    for (const coeff of [1, -1, 2, -2]) {
      for (const relation of ["lt", "gt"] as const) {
        for (const inclusive of [false, true]) {
          for (let b = -6; b <= 6; b += 1) {
            const state: NumberLineRayValue = {
              coeff: { n: coeff, d: 1 },
              constant: { n: coeff * b, d: 1 },
              relation,
              inclusive
            };
            swept += 1;
            const graded = evaluate(SAMPLE as TWidget, state).correct;
            if (graded) correctSeen += 1;
            expect(graded, `${JSON.stringify(state)}`).toBe(sameSetByOracle(state, sampleTarget));
          }
        }
      }
    }
    expect(swept).toBe(208);
    expect(correctSeen).toBeGreaterThan(0); // the sweep really does reach the answer
  });

  it("the gate refuses a requireSolvedForm target that is not itself in solved form", () => {
    const bad = NumberLineRaySpec.parse({
      ...SOLVE,
      target: { coeff: { n: 2, d: 1 }, constant: { n: 8, d: 1 }, relation: "lt", inclusive: false }
    }) as TWidget;
    expect(widgetIntegrityErrors(bad).join(" ")).toContain("the target must be written in it");
  });
});

describe("numberLineRay — the spec gate", () => {
  it("the shipped sample passes the same integrity check lesson content is held to", () => {
    expect(widgetIntegrityErrors(SAMPLE as TWidget)).toEqual([]);
  });

  it("the gate bites on each defect it exists to catch", () => {
    const bad = (over: Record<string, unknown>) =>
      widgetIntegrityErrors(NumberLineRaySpec.parse({ ...SAMPLE, ...over }) as TWidget).join(" ");
    expect(bad({ start: { ...SAMPLE.start, coeff: { n: 0, d: 1 } } })).toContain("must not be 0");
    expect(bad({ window: { ...SAMPLE.window, min: { n: 6, d: 1 }, max: { n: -6, d: 1 } } })).toContain("window.min must be below");
    expect(bad({ start: { ...SAMPLE.start, constant: { n: 40, d: 1 } } })).toContain("sits off the drawn line");
    expect(bad({ step: { n: 4, d: 1 } })).toContain("not on the step lattice");
    expect(bad({ transforms: [{ id: "a", factor: { n: 1, d: 1 }, label: "× 1" }] })).toContain("multiplies by 1");
    expect(bad({ transforms: [{ id: "a", factor: { n: 0, d: 1 }, label: "× 0" }] })).toContain("multiplies by 0");
    expect(
      bad({
        transforms: [
          { id: "a", factor: { n: -1, d: 1 }, label: "one" },
          { id: "a", factor: { n: 2, d: 1 }, label: "two" }
        ]
      })
    ).toContain("ids must be unique");
    // "begins solved": target written differently but naming the same set as the start.
    expect(bad({ target: { coeff: { n: 2, d: 1 }, constant: { n: -10, d: 1 }, relation: "gt", inclusive: false } })).toContain(
      "begins solved"
    );
    expect(bad({ window: { min: { n: 0, d: 1 }, max: { n: 1000, d: 1 }, tickStep: { n: 1, d: 1 } } })).toContain("caps at 200");
  });

  it("the renderer module is deterministic at source level", () => {
    const src = readFileSync(resolve(process.cwd(), "src/components/widgets/numberLineRay.tsx"), "utf8");
    expect(src.includes("Math.random")).toBe(false);
    expect(src.includes("Date.now")).toBe(false);
    expect(src.includes("new Date")).toBe(false);
  });
});

describe("numberLineRay — S217 reachability guard: coefficient 1 must be reachable from the offered transforms", () => {
  const BASE = {
    type: "numberLineRay",
    prompt: "Reach x on its own.",
    variable: "x",
    window: { min: { n: -2, d: 1 }, max: { n: 10, d: 1 }, tickStep: { n: 1, d: 1 } },
    step: { n: 1, d: 1 },
    target: { coeff: { n: 1, d: 1 }, constant: { n: 4, d: 1 }, relation: "gt", inclusive: false },
    requireSolvedForm: true,
    fallbackFeedback: "Test a number on each side of the endpoint and see which side really works."
  };

  it("a solvable ladder passes: start 3, transforms \u00f73 and \u00d73", () => {
    const spec = NumberLineRaySpec.parse({
      ...BASE,
      start: { coeff: { n: 3, d: 1 }, constant: { n: 12, d: 1 }, relation: "gt", inclusive: false },
      transforms: [
        { id: "div", factor: { n: 1, d: 3 }, label: "\u00f7 3 on both sides" },
        { id: "mul", factor: { n: 3, d: 1 }, label: "\u00d7 3 on both sides" }
      ]
    });
    expect(widgetIntegrityErrors(spec as TWidget)).toEqual([]);
  });

  it("an UNSOLVABLE ladder is refused: start 3 with only \u00d73 offered (3\u00b73^k diverges, so the bounded search refuses with the honest 'could not confirm' wording)", () => {
    // 3\u00b73^k is genuinely never 1, but the coefficients DIVERGE past the search's magnitude cap,
    // and a bounded search cannot distinguish divergence from a very deep ladder. The refusal is
    // identical either way; only the wording differs, and it must be true (S217 QA REQUIRED_FIX 2):
    // exhausted frontier \u2192 "no finite sequence" (proved); halted on bounds \u2192 "could not confirm".
    const spec = NumberLineRaySpec.parse({
      ...BASE,
      start: { coeff: { n: 3, d: 1 }, constant: { n: 12, d: 1 }, relation: "gt", inclusive: false },
      transforms: [{ id: "mul", factor: { n: 3, d: 1 }, label: "\u00d7 3 on both sides" }]
    });
    expect(widgetIntegrityErrors(spec as TWidget).join(" ")).toContain("could not confirm it is reachable");
  });

  it("no transforms at all with an unsolved start is refused (nothing can ever reach coefficient 1)", () => {
    const spec = NumberLineRaySpec.parse({
      ...BASE,
      start: { coeff: { n: -2, d: 1 }, constant: { n: -8, d: 1 }, relation: "gt", inclusive: false },
      target: { coeff: { n: 1, d: 1 }, constant: { n: 4, d: 1 }, relation: "lt", inclusive: false },
      transforms: []
    });
    expect(widgetIntegrityErrors(spec as TWidget).join(" ")).toContain("no finite sequence of the offered both-sides transforms");
  });

  it("a solved-form start needs no transforms (build-a-set tasks stay legal)", () => {
    const spec = NumberLineRaySpec.parse({
      ...BASE,
      start: { coeff: { n: 1, d: 1 }, constant: { n: -1, d: 1 }, relation: "lt", inclusive: false },
      transforms: []
    });
    expect(widgetIntegrityErrors(spec as TWidget)).toEqual([]);
  });

  it("the two shipped requireSolvedForm lessons both pass the guard through the real lesson linter", () => {
    // Read the authored files off disk, exactly as validate:content does.
    for (const path of [
      "content/courses/two-step-equations/lessons/tse-04-01.json",
      "content/courses/two-step-equations/lessons/tse-04-02.json"
    ]) {
      const lesson = JSON.parse(readFileSync(path, "utf8"));
      const step = lesson.steps.find((st: { id: string }) => st.id === "i1b");
      expect(step, path).toBeTruthy();
      const spec = WidgetSpec.parse(step.widget);
      expect(widgetIntegrityErrors(spec as TWidget), path).toEqual([]);
    }
  });
});
