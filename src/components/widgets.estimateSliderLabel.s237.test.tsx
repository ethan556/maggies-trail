// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, type TWidget } from "@/lib/schema";
import { describeWidgetState } from "@/lib/describeState";

/**
 * S237b — THE ESTIMATE SLIDER NAMES WHAT IT SETS, AND THERE IS ONLY ONE OF IT.
 *
 * THE DEFECT (reported from the running app). On g3w-01-01, "Finding the Hidden Question"
 * ("4 boxes hold 6 pencils each, then 5 are given away…"), the learner reported TWO sliders and
 * expected one to be labelled "the number of boxes" and the other "the number of pencils". There
 * was one. Underneath the real <input type="range"> sat a decorative track carrying a
 * `h-3.5 w-3.5 rounded-full ring-2 ring-white` dot — the exact size, shape and ring of a range
 * thumb, directly below a range input. Nothing on screen named the quantity either: the control
 * had no visible label at all, and its accessible name was the whole prompt sentence.
 *
 * WHY THE PROMPT IS A BAD ACCESSIBLE NAME. A control's name answers "what does this set?". The
 * prompt answers "what is the task?" — it is already on screen as a paragraph, is read in document
 * order, and repeating it as the slider's name means a screen-reader user hears the whole word
 * problem again every time focus lands, while still never being told what the slider controls.
 *
 * WHAT IS PINNED (properties, not strings):
 *   · exactly ONE control — one range input, and nothing else presenting as one;
 *   · the control has a VISIBLE label, and that label is its accessible name;
 *   · the name states the quantity when the content states one (`unitLabel`), and stays generic
 *     and TRUE when it does not — an invented quantity would be worse than a vague one;
 *   · the name is not the prompt;
 *   · the position marker on the decorative track does not present as a grabbable thumb;
 *   · exact-comparison mode (authored `choices`) is untouched.
 */

afterEach(cleanup);

const base = {
  type: "estimateSlider",
  prompt: "4 boxes hold 6 pencils each, then 5 are given away. First slide to the HIDDEN total: how many pencils the boxes hold.",
  min: 4, max: 240, start: 4, target: 24, acceptFactor: 2, unitLabel: "pencils", ticks: [4, 122, 240],
  lowFeedback: "Too few — four boxes of six is more than that.",
  highFeedback: "Too many — six pencils per box across four boxes cannot reach that high.",
  successFeedback: "24 — the total the story never states."
};

const mount = (raw: Record<string, unknown>, tone: "neutral" | "info" = "neutral") => {
  const spec = WidgetSpec.parse(raw) as TWidget;
  const { container } = render(
    <WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} tone={tone} />
  );
  return { spec, container };
};

/** The accessible name of a labelled form control, computed the way a screen reader would. */
function accessibleName(input: HTMLElement): string {
  const aria = input.getAttribute("aria-label");
  if (aria) return aria;
  const labelled = input.getAttribute("aria-labelledby");
  if (labelled) return document.getElementById(labelled)?.textContent?.trim() ?? "";
  const id = input.getAttribute("id");
  const label = id ? document.querySelector(`label[for="${id}"]`) : input.closest("label");
  return label?.textContent?.trim() ?? "";
}

describe("S237b estimateSlider — one labelled control", () => {
  it("g3w-01-01/i1: the slider is named by a VISIBLE label that states the quantity", () => {
    const { container } = mount(base);
    const inputs = container.querySelectorAll('input[type="range"]');
    expect(inputs, "one quantity is being estimated, so there is one slider").toHaveLength(1);
    const input = inputs[0] as HTMLInputElement;

    const name = accessibleName(input);
    expect(name, "the accessible name must state the quantity").toContain("pencils");
    expect(name, "…and must not be the prompt sentence").not.toBe(base.prompt);
    expect(name.length, "…nor anything as long as one").toBeLessThan(60);

    // VISIBLE, not accessible-only: the same text is rendered on screen, and it is what names
    // the input. A learner who can see the screen must be able to read what the slider sets.
    const label = input.closest("label");
    expect(label, "the input is named by a real <label>").toBeTruthy();
    expect(label!.textContent).toBe(name);
    expect(label!.className, "the label is not sr-only").not.toContain("sr-only");
    expect(screen.getByText(name)).toBeTruthy();

    // The value readout keeps its unit, and the prompt is still on screen as a prompt.
    expect(container.textContent).toContain(base.prompt);
    expect(input.getAttribute("aria-valuetext")).toBe("4 pencils");
  });

  it("with no unitLabel the name stays true and generic — no quantity is invented", () => {
    const { spec, container } = mount({ ...base, unitLabel: undefined });
    const input = container.querySelector('input[type="range"]') as HTMLInputElement;
    const name = accessibleName(input);
    expect(name).toBe("Your estimate");
    // Nothing from the prompt's nouns may leak into the name of a control the content never named.
    for (const noun of ["pencil", "box", "boxes"]) expect(name.toLowerCase()).not.toContain(noun);
    expect(spec.type).toBe("estimateSlider");
  });

  it("the odd authored unit labels stay readable", () => {
    // `unitLabel` is authored free text: the corpus holds "units", "cubic metres", "%", "(about)".
    // The name joins it, never inflects it — no derived morphology.
    for (const unit of ["units", "cubic metres", "%", "(about)", "metres per second"]) {
      const { container } = mount({ ...base, unitLabel: unit });
      const input = container.querySelector('input[type="range"]') as HTMLInputElement;
      expect(accessibleName(input)).toBe(`Your estimate — ${unit}`);
      cleanup();
    }
  });

  it("the position marker does not present as a second thumb", () => {
    // THE HEURISTIC, stated: a range thumb is a small round disc with a light ring. The reported
    // decorative marker was literally `h-3.5 w-3.5 rounded-full ring-2 ring-white`. Nothing
    // aria-hidden inside this widget may be round-and-ringed, and the marker must stay
    // non-interactive: no role, no tabindex, no listener-bearing element type.
    const { container } = mount(base);
    for (const el of Array.from(container.querySelectorAll("[aria-hidden='true'] *, [aria-hidden='true']"))) {
      const cls = el.className;
      const s = typeof cls === "string" ? cls : "";
      expect(
        s.includes("rounded-full") && s.includes("ring-"),
        `a decorative element still reads as a slider thumb: ${s}`
      ).toBe(false);
    }
    const marker = container.querySelector('[data-testid="es-marker"]')!;
    expect(marker, "the position marker is still drawn — it is the useful half").toBeTruthy();
    expect(marker.getAttribute("role")).toBeNull();
    expect(marker.getAttribute("tabindex")).toBeNull();
    expect(marker.closest("[aria-hidden='true']"), "…and it is decorative").toBeTruthy();
  });

  it("the reveal ghost still shows the acceptance band and the exact target", () => {
    const { container } = mount(base, "info");
    expect(container.querySelector('[data-testid="es-ghost"]'), "the band survives the relayout").toBeTruthy();
  });

  it("the slider, its scale and its landmarks read as ONE instrument", () => {
    // The scale's tick labels annotate the track. They used to render two rows below it, under a
    // 3xl readout, which is a large part of why the two rows read as two separate controls.
    const { container } = mount(base);
    const input = container.querySelector('input[type="range"]')!;
    const marker = container.querySelector('[data-testid="es-marker"]')!;
    const tick = screen.getByText("122");
    const card = input.closest("label")!.parentElement!;
    expect(card.contains(marker), "the track lives with the slider").toBe(true);
    expect(card.contains(tick), "so do the scale's landmarks").toBe(true);
    // …and in reading order the landmarks follow the track, not the readout.
    const order = Array.from(card.children);
    expect(order.indexOf(tick.parentElement!)).toBeGreaterThan(order.indexOf(marker.parentElement!));
  });

  it("narration names the control and its quantity without stating the answer", () => {
    const spec = WidgetSpec.parse(base) as TWidget;
    const said = describeWidgetState(spec, 30)!;
    expect(said).toContain("pencils");
    expect(said).toContain("One slider");
    expect(said).toContain("30"); // the learner's own estimate
    expect(said, "never the target").not.toMatch(/(^|[^\d])24([^\d]|$)/); // 240 is a tick, 24 is the answer
    for (const t of base.ticks) expect(said).toContain(String(t)); // the aria-hidden scale, spoken
  });

  it("exact-comparison mode is untouched: candidate buttons, and no slider at all", () => {
    const { container } = mount({
      ...base, min: 0, unitLabel: "units", ticks: [],
      choices: [
        { value: 24, label: "24", correct: true, feedback: "Four sixes — the hidden total." },
        { value: 19, label: "19", correct: false, feedback: "That subtracts the 5 before multiplying." }
      ],
      start: 19
    });
    expect(container.querySelectorAll('input[type="range"]')).toHaveLength(0);
    expect(container.querySelectorAll("button").length).toBeGreaterThanOrEqual(2);
  });
});

/* ------------------------------------------------------------------ *
 * S238 — the same contract on the generic `slider` engine.
 *
 * The S237 handover named this the remaining class-B instance: SliderW still carried
 * `aria-label={spec.prompt}` — the whole task sentence as the control's accessible name,
 * the exact defect the file above exists to prevent. Same remedy, same house pattern:
 * a visible <label> wraps the range, naming what it SETS.
 * ------------------------------------------------------------------ */

const sliderBase = {
  type: "slider",
  prompt: "A tank holds 8 liters. Slide to show how many liters remain after 3 liters pour out.",
  min: 0, max: 8, step: 1, start: 8, target: 5, visual: "bar",
  successFeedback: "5 liters — 8 minus the 3 that poured away.",
  lowFeedback: "Too few left — only 3 liters poured out, not more.",
  highFeedback: "Too many left — 3 liters DID pour out, so count down from 8."
};

describe("S238: the generic slider names what it sets", () => {
  it("the range's accessible name is the quantity, visible, and never the prompt", () => {
    const { container } = mount({ ...sliderBase, unitLabel: "liters left" });
    const range = container.querySelector('input[type="range"]') as HTMLElement;
    expect(range).toBeTruthy();
    const name = accessibleName(range);
    expect(name).toBe("Your value — liters left");
    expect(name).not.toContain("tank holds");
    // Visible, not aria-only: the wrapping label's text IS the name.
    expect(range.closest("label")?.textContent).toContain("Your value — liters left");
    expect(range.getAttribute("aria-label")).toBeNull();
  });

  it("with no unitLabel the name stays generic and TRUE — no invented quantity", () => {
    const { container } = mount(sliderBase);
    const range = container.querySelector('input[type="range"]') as HTMLElement;
    expect(accessibleName(range)).toBe("Your value");
  });

  it("a groups slider is named for the groups it counts, and its valuetext still totals", () => {
    const { container } = mount({
      ...sliderBase, visual: "groups", groupSize: 6, max: 5, start: 2, target: 4,
      prompt: "Build 4 equal groups of 6.", itemEmoji: "🍎"
    });
    const range = container.querySelector('input[type="range"]') as HTMLElement;
    expect(accessibleName(range)).toBe("Number of groups");
    expect(range.getAttribute("aria-valuetext")).toBe("2 groups, 12 in all");
  });
});

/* ------------------------------------------------------------------ *
 * S238 wave 15 — the same contract on `numeric`, the LAST recorded
 * prompt-as-name instance (deferred from batch 3 as its own mechanical
 * batch: the old name was load-bearing across the test harness).
 *
 * NumericW carried `aria-label={spec.prompt}` — the whole task sentence
 * as the text field's accessible name. Same remedy, same house pattern:
 * a visible <label> wraps the input, the name states the unit when the
 * content states one ("Your answer (cm)", mirroring the lab widgets'
 * numeric fields), and stays generic and TRUE when it does not.
 * ------------------------------------------------------------------ */

const numericBase = {
  type: "numeric",
  prompt: "A ribbon is cut into 3 equal pieces of 4 cm. How long was the ribbon?",
  answer: 12, tolerance: 0,
  fallbackFeedback: "Count the three equal pieces again — each one is four centimetres long."
};

describe("S238: the numeric field names what it takes", () => {
  it("the textbox's accessible name is 'Your answer (unit)', visible, and never the prompt", () => {
    const { container } = mount({ ...numericBase, unit: "cm" });
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input).toBeTruthy();
    const name = accessibleName(input);
    expect(name).toBe("Your answer (cm)");
    expect(name).not.toContain("ribbon");
    // Visible, not aria-only: the wrapping label's text IS the name.
    expect(input.closest("label")?.textContent).toBe("Your answer (cm)");
    expect(input.getAttribute("aria-label")).toBeNull();
  });

  it("without a unit the name stays generic and TRUE — no invented quantity", () => {
    const { container } = mount(numericBase);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(accessibleName(input)).toBe("Your answer");
  });

  it("the unit is stated ONCE — in the name, not repeated in a sibling span", () => {
    const { container } = mount({ ...numericBase, unit: "cm" });
    // The old layout printed the unit twice for screen readers: once in the name, once as an
    // inline span after the box. The label is now the only place the unit appears.
    const label = container.querySelector("label") as HTMLElement;
    const outside = (container.textContent ?? "").replace(label.textContent ?? "", "").replace(numericBase.prompt, "");
    expect(outside).not.toContain("cm");
  });

  it("the reveal ghost still states value AND unit — naming did not touch tone grammar", () => {
    const spec = WidgetSpec.parse({ ...numericBase, unit: "cm" }) as TWidget;
    const { container } = render(
      <WidgetRenderer spec={spec} value={7} onChange={() => {}} disabled={false} tone="info" />
    );
    expect(container.textContent).toContain("Correct: 12 cm");
  });
});
