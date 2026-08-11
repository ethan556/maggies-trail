// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, fireEvent } from "@testing-library/react";
import { WidgetRenderer } from "./widgets";
import { GraphReadSpec, graphReadAnswer } from "@/lib/schema";
import { evaluate } from "@/lib/evaluate";

/**
 * S237 — THE PICTURE GRAPH IS ACTUALLY ON SCREEN.
 *
 * Ten steps across three lessons asked "the picture graph shows 7 apple pictures for Tuesday — how
 * many votes?" through a bare `numeric` input. The lesson's whole stated skill is reading a picture
 * graph, and no picture graph was drawn. `graphRead` was built in S125 for exactly this defect
 * (schema.ts:1529 — "until S125 they described it in a sentence and asked a 7-year-old to type a
 * number"); mmt-05-01 and g2g-02-02 already used it on their INTERACTIVE steps and left their
 * graded checks behind.
 *
 * The schema gate and the corpus gate next door prove the arithmetic and the trap wiring. This one
 * exists because both of those can be green while nothing is drawn: `drawn` is just a number in a
 * JSON file until something renders it. So this test walks the real content, mounts the real
 * component, and COUNTS THE ICONS IN THE DOM.
 *
 * The property it pins is figure–text alignment, which is the defect class this repo already has a
 * whole audit for: the number the prompt states and the number of pictures actually drawn must be
 * the same. A row that draws 6 apples under a sentence saying 7 would be a worse item than the
 * no-graph state it replaced, and it is invisible to every other gate.
 *
 * Every rejection below is paired with a near-identical case that must be ACCEPTED, so the detector
 * cannot pass by blindness.
 */

type Step = { id: string; widget?: Record<string, unknown> };
type Lesson = { id: string; steps: Step[]; remedials?: Array<{ check?: Step; concept?: Step }> };

const LESSONS = [
  ["measure-money-time", "mmt-05-01", ["k1", "k2", "k3", "ch1", "rem-mpg-k"]],
  ["data-line-plots-g2", "g2g-02-01", ["k1", "k2", "ch1"]],
  ["data-line-plots-g2", "g2g-02-02", ["k1", "k3"]]
] as const;

function load(course: string, id: string): Lesson {
  return JSON.parse(
    readFileSync(join(process.cwd(), "content", "courses", course, "lessons", `${id}.json`), "utf8")
  ) as Lesson;
}

function stepById(lesson: Lesson, id: string): Step {
  const inSteps = lesson.steps.find((s) => s.id === id);
  if (inSteps) return inSteps;
  for (const r of lesson.remedials ?? []) {
    for (const st of [r.check, r.concept]) if (st?.id === id) return st;
  }
  throw new Error(`${lesson.id}: no step ${id}`);
}

/** The count the authored SENTENCE claims. These prompts all lead with it: "…shows 7 apple
 *  pictures for Tuesday…". Read positionally rather than recomputed, so this is a genuinely
 *  different route to the answer than `drawn × unitValue`. */
function countStatedInPrompt(prompt: string): number {
  const m = prompt.match(/\d+/);
  if (!m) throw new Error(`no number in prompt: ${prompt}`);
  return Number(m[0]);
}

/** Icons actually painted for a picture row, counted from the DOM. Keyed on a testid rather
 *  than on markup, so the count survives a rendering change (the row became an SVG in S237 so it
 *  could scale to one line at phone widths) and keeps asserting the same property. */
function iconsRendered(container: HTMLElement): number {
  const row = container.querySelector('[role="img"][aria-label^="Picture graph"]');
  if (!row) return 0;
  return row.querySelectorAll('[data-testid="gread-icon"]').length;
}

/* ────────────────────────────── self-check ────────────────────────────── */

const synthetic = {
  type: "graphRead" as const, mode: "picture" as const,
  prompt: "The picture graph shows 6 apple pictures for Monday. Each picture equals 1 vote. How many votes on Monday?",
  drawn: 6, unitValue: 1, categoryLabel: "Monday", unitNoun: "vote", unitNounPlural: "votes",
  scaleMax: 9, icon: "\u{1F34E}", commonResults: [],
  fallbackFeedback: "Count the pictures one at a time — each picture stands for one vote.",
  successFeedback: "6 votes for Monday — six pictures, each worth one vote."
};

describe("the icon counter is a real detector", () => {
  it("ACCEPTS a row whose drawn count matches its sentence", () => {
    const spec = GraphReadSpec.parse(synthetic);
    const { container } = render(<WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} />);
    expect(iconsRendered(container)).toBe(countStatedInPrompt(spec.prompt));
    cleanup();
  });

  it("REJECTS the same row drawn one picture short", () => {
    const spec = GraphReadSpec.parse({ ...synthetic, drawn: 5 });
    const { container } = render(<WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} />);
    expect(iconsRendered(container)).not.toBe(countStatedInPrompt(spec.prompt));
    cleanup();
  });

  it("counts an EMPTY row as zero rather than as 'nothing rendered'", () => {
    // k3 asks about a day with no votes at all. A detector that cannot tell "0 drawn" from
    // "the widget failed to mount" would pass that step for the wrong reason.
    const spec = GraphReadSpec.parse({
      ...synthetic, drawn: 0,
      prompt: "The picture graph shows 0 apple pictures for Saturday. Each picture equals 1 vote. How many votes on Saturday?"
    });
    const { container } = render(<WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} />);
    expect(iconsRendered(container)).toBe(0);
    expect(container.querySelector('[role="img"]')).not.toBeNull();
    expect(container.textContent).toContain("no pictures at all");
    cleanup();
  });
});

/* ────────────────────────────── the real content ────────────────────────────── */

for (const [course, lessonId, stepIds] of LESSONS) {
  describe(`${lessonId} — the graph the prompt promises is drawn`, () => {
    const lesson = load(course, lessonId);

    for (const stepId of stepIds) {
      it(`${stepId}: draws exactly the row its sentence claims, and every tap grades`, () => {
        const step = stepById(lesson, stepId);
        const spec = GraphReadSpec.parse(step.widget);
        const stated = countStatedInPrompt(spec.prompt);
        const truth = graphReadAnswer(spec);

        const { container } = render(<WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} />);

        // 1. The picture exists and shows what the sentence says.
        expect(iconsRendered(container), `${lessonId}/${stepId}: icons drawn`).toBe(stated);
        expect(truth, `${lessonId}/${stepId}: graded answer disagrees with the drawn row`).toBe(stated);

        // 2. The row is labelled with the category the question asks about — otherwise a learner
        //    reading a multi-day question has no way to know which row is on screen.
        expect(container.textContent).toContain(spec.categoryLabel);
        expect(spec.prompt).toContain(spec.categoryLabel);

        // 3. Every value the learner can tap exists, and the answer is among them.
        const taps = Array.from(container.querySelectorAll("button")).map((b) => b.textContent);
        expect(taps).toHaveLength(spec.scaleMax + 1);
        expect(taps).toContain(String(truth));

        // 4. Every authored trap is reachable AS A BUTTON. A trap the thumb cannot land on is
        //    dead feedback — the schema check calls it "unreachable, so its feedback is dead".
        for (const r of spec.commonResults) {
          expect(taps, `${lessonId}/${stepId}: trap ${r.value} has no tap target`).toContain(String(r.value));
          const got = evaluate(spec, { picked: r.value });
          expect(got.correct).toBe(false);
          expect(got.feedback, `${lessonId}/${stepId}: trap ${r.value} misroutes`).toBe(r.feedback);
        }

        // 5. Tapping the correct value actually grades correct, through the component.
        const winner = Array.from(container.querySelectorAll("button")).find((b) => b.textContent === String(truth))!;
        let picked: unknown = null;
        cleanup();
        const live = render(<WidgetRenderer spec={spec} value={null} onChange={(v: unknown) => { picked = v; }} disabled={false} />);
        fireEvent.click(Array.from(live.container.querySelectorAll("button")).find((b) => b.textContent === String(truth))!);
        expect(picked).toEqual({ picked: truth });
        expect(evaluate(spec, picked).correct).toBe(true);
        expect(winner).toBeDefined();
        cleanup();
      });
    }

    it("no converted step composes English from a template", () => {
      // The generator this batch replaced printed "1 apple pictures" on every seed where the count
      // was 1. Singular and plural are stored on the spec; this asserts the authored steps never
      // print a count of 1 against a plural noun either.
      for (const stepId of stepIds) {
        const spec = GraphReadSpec.parse(stepById(lesson, stepId).widget);
        expect(spec.unitNoun, `${lessonId}/${stepId}`).not.toBe(spec.unitNounPlural);
        if (graphReadAnswer(spec) === 1) expect(spec.prompt).not.toMatch(/\b1 [a-z]+s\b/);
      }
    });
  });
}
