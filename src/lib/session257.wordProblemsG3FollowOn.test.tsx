import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "../components/figureIds";
import { FIGURES } from "../components/figures";
import { evaluate } from "./evaluate";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

type RawStep = { id: string; kind: string; body?: string; narration?: string; figure?: string; widget?: unknown; cml?: Record<string, unknown> };
type RawLesson = { id: string; steps: RawStep[]; remedials?: Array<{ concept?: RawStep; check?: RawStep }> };
const dir = join(process.cwd(), "content", "courses", "word-problems-g3", "lessons");
const lessons = readdirSync(dir).filter((name) => name.endsWith(".json")).sort().map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));
const normalized = (prompt: string) => prompt.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();
const expectedMainRepairs: Record<string, [string, string]> = {
  "g3w-01-01": ["c2", "mb-multistep"], "g3w-01-03": ["c2", "g3w-subtract-once"],
  "g3w-01-04": ["c2", "g3w-share-then-add"], "g3w-02-03": ["c1", "g3w-subtract-once"],
  "g3w-03-03": ["c1", "g3w-relevant-information"], "g3w-03-04": ["c2", "g3w-multiply-then-add"],
};
const expectedRemedialFigures: Record<string, string> = {
  "g3w-01-01": "mb-multistep", "g3w-01-02": "dop-grouping", "g3w-01-03": "g3w-subtract-once", "g3w-01-04": "g3w-share-then-add",
  "g3w-02-01": "mult3-missing-factor", "g3w-02-02": "mb-multistep", "g3w-02-03": "g3w-subtract-once", "g3w-02-04": "mmt-estimate",
  "g3w-03-01": "mult3-estimate", "g3w-03-02": "mb-multistep", "g3w-03-03": "g3w-relevant-information", "g3w-03-04": "g3w-multiply-then-add",
};
const expectedPrompts: Record<string, Record<string, string>> = {
  "g3w-01-03": { k1: "A shelf has 54 markers. Students take 14, then return 3. How many markers remain?", k3: "A tray has 24 markers. Students use 22, then return 1. How many markers remain?" },
  "g3w-01-04": { k1: "24 counters are shared equally among 6 teams. How many counters does each team get?" },
  "g3w-02-02": { k2: "A class makes 36 markers, gives away 9, then makes 5 more. How many markers are there now?" },
  "g3w-02-03": { k2: "A box has 63 markers. Students use 24, then return 5. How many markers remain?", ch1: "A box has 48 tiles. Builders use 20, then return 3. How many tiles remain?" },
  "g3w-02-04": { ch1: "The exact product is 336. A clerk removes 100 apples, then returns 4. How many apples remain?" },
  "g3w-03-01": { k2: "The rounded product is 400. A store sells 30 items, then 10 are returned. What checking estimate results?", ch1: "A display starts with 234 cards. 5 are removed, then 26 are added. How many cards are there now?" },
  "g3w-03-02": { k2: "A shelf begins with 54 markers. Students borrow 18, then return 5. How many markers remain?" },
  "g3w-03-04": { ch1: "Equal groups make 35 markers. 2 are removed, then 8 are added. How many markers are there now?" },
};

describe("S257 word-problems-g3 residual follow-on", () => {
  it("binds six synchronized main figures and renders the four new exact semantic figures accessibly", () => {
    expect(lessons).toHaveLength(12);
    for (const [lessonId, [stepId, figure]] of Object.entries(expectedMainRepairs)) {
      expect(byId.get(lessonId)?.steps.find((step) => step.id === stepId)?.figure).toBe(figure);
    }
    const semanticChecks: Record<string, string[]> = {
      "g3w-subtract-once": ["remove 3 once", "20 − 3 = 17"],
      "g3w-share-then-add": ["+2 goes into every bag", "(18 ÷ 3) + 2 = 8 each"],
      "g3w-relevant-information": ["extra information", "4 × 6 = 24 blue marbles"],
      "g3w-multiply-then-add": ["equal groups first", "(5 × 6) + 4 = 34"],
    };
    for (const [figure, claims] of Object.entries(semanticChecks)) {
      expect(FIGURE_IDS.has(figure), figure).toBe(true);
      const markup = renderToStaticMarkup(FIGURES[figure]());
      expect(markup).toContain("<title>");
      expect(markup).toContain('role="img"');
      expect(markup).toContain("aria-label=");
      for (const claim of claims) expect(markup, `${figure}: ${claim}`).toContain(claim);
    }
  });

  it("gives every remedial a registered rendered figure and preserves collision-free transfer", () => {
    for (const raw of lessons) {
      Lesson.parse(raw);
      const route = raw.remedials?.[0];
      expect(route?.concept?.figure, raw.id).toBe(expectedRemedialFigures[raw.id]);
      const figure = route!.concept!.figure!;
      expect(FIGURE_IDS.has(figure), `${raw.id}/${figure}`).toBe(true);
      const markup = renderToStaticMarkup(FIGURES[figure]());
      expect(markup).toContain("<title>");
      expect(markup).toContain('role="img"');
      expect(route!.concept!.body).toBe(route!.concept!.narration);
      const remedial = WidgetSpec.parse(route!.check!.widget);
      const main = raw.steps.filter((step) => step.widget).map((step) => WidgetSpec.parse(step.widget));
      expect(main.some((widget) => widget.prompt === remedial.prompt), `${raw.id}: exact`).toBe(false);
      expect(main.some((widget) => normalized(widget.prompt) === normalized(remedial.prompt)), `${raw.id}: normalized`).toBe(false);
      expect(main.some((widget) => JSON.stringify(widget) === JSON.stringify(remedial)), `${raw.id}: payload`).toBe(false);
    }
  });

  it("replaces all eleven generator-shaped prompts with natural same-answer stories", () => {
    let count = 0;
    for (const [lessonId, prompts] of Object.entries(expectedPrompts)) for (const [stepId, prompt] of Object.entries(prompts)) {
      const step = byId.get(lessonId)!.steps.find((entry) => entry.id === stepId)!;
      expect(WidgetSpec.parse(step.widget).prompt, `${lessonId}/${stepId}`).toBe(prompt);
      count += 1;
    }
    expect(count).toBe(11);
    expect(JSON.stringify(lessons)).not.toMatch(/compact retrieval case|what is 24 ÷ 6 counters per team|\b(?:return|returned|add|added|subtract|remove) 0\b/i);
  });

  it("keeps every evaluator true and the useful-estimate contract exact", () => {
    for (const lesson of lessons) for (const entry of [...lesson.steps, ...(lesson.remedials ?? []).flatMap((route) => [route.concept, route.check].filter(Boolean) as RawStep[])]) {
      if (!entry.widget) continue;
      const widget = WidgetSpec.parse(entry.widget);
      expect(widgetIntegrityErrors(widget), `${lesson.id}/${entry.id}`).toEqual([]);
      if (widget.type === "numeric") expect(evaluate(widget, widget.answer).correct, `${lesson.id}/${entry.id}`).toBe(true);
      if (widget.type === "mcq") for (const option of widget.options) expect(evaluate(widget, option.id).correct).toBe(option.correct);
      if (widget.type === "numberLineHop") expect(evaluate(widget, widget.start + (widget.direction === "back" ? -1 : 1) * widget.hop * widget.hops).correct).toBe(true);
      if (widget.type === "numberLinePlace" || widget.type === "estimateSlider") expect(evaluate(widget, widget.target).correct).toBe(true);
      if (widget.type === "barBuilder") expect(evaluate(widget, widget.target).correct).toBe(true);
      if (widget.type === "tapDiagram") expect(evaluate(widget, widget.hotspots.filter((spot) => spot.correct).map((spot) => spot.id)).correct).toBe(true);
    }
    const estimate = WidgetSpec.parse(byId.get("g3w-02-04")!.steps.find((step) => step.id === "i1")!.widget);
    expect(estimate.type).toBe("estimateSlider");
    if (estimate.type === "estimateSlider") {
      expect(estimate.target).toBe(250);
      expect(evaluate(estimate, 250).correct).toBe(true);
      expect(evaluate(estimate, 240).correct).toBe(false);
    }
  });

  it("retains lesson-specific CML without a waiver", () => {
    let count = 0;
    for (const lesson of lessons) for (const step of [...lesson.steps, ...(lesson.remedials ?? []).flatMap((route) => [route.concept, route.check].filter(Boolean) as RawStep[])]) if (step.cml) {
      count += 1;
      expect(Object.keys(step.cml).some((key) => /waiver/i.test(key)), `${lesson.id}/${step.id}`).toBe(false);
      expect(String(step.cml.actionGoal ?? "")).not.toMatch(/g3w |hidden question first/i);
    }
    expect(count).toBe(72);
  });
});
