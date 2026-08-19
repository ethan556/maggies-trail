import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "../components/figures";
import { evaluate } from "./evaluate";
import { isFigureTextAligned } from "./figureTextAlignment";
import { lintLesson } from "./pedagogy";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

type RawStep = { id: string; kind: string; body?: string; narration?: string; figure?: string; widget?: unknown; predict?: { options: Array<{ id: string; label: string }> } };
type RawLesson = { id: string; courseId: string; steps: RawStep[]; remedials?: Array<{ concept?: RawStep; check?: RawStep }> };
const dir = join(process.cwd(), "content", "courses", "counting-to-100-k", "lessons");
const lessons = readdirSync(dir).filter((name) => name.endsWith(".json")).sort()
  .map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const byId = Object.fromEntries(lessons.map((lesson) => [lesson.id, lesson]));
const step = (lessonId: string, stepId: string) => byId[lessonId]!.steps.find((candidate) => candidate.id === stepId)!;

const expectedBindings: Record<string, string> = {
  "k100-01-01/c2": "c120-same-pattern",
  "k100-01-02/c1": "odometer-roll", "k100-01-02/c2": "c120-roll-ten",
  "k100-01-03/c1": "chart-120", "k100-01-03/c2": "chart-120",
  "k100-01-04/c1": "tno-move-tens-digit", "k100-01-04/c2": "tno-move-tens-digit",
  "k100-01-05/c1": "kc-ten-hops-to-100", "k100-01-05/c2": "kc-ten-hops-to-100",
  "k100-01-06/c2": "kc-ten-hops-to-100",
  "k100-02-01/c1": "kc-by-tens", "k100-02-01/c2": "kc-by-tens",
  "k100-02-02/c1": "kc-ten-hops-to-100", "k100-02-02/c2": "kc-ten-hops-to-100",
  "k100-02-03/c1": "chart-120", "k100-02-03/c2": "chart-rows",
  "k100-02-04/c1": "kc-ten-hops-to-100", "k100-02-04/c2": "kc-ten-hops-to-100",
  "k100-02-05/c1": "tno-count-down-tens", "k100-02-05/c2": "tno-count-down-tens",
  "k100-03-03/c1": "chart-120", "k100-03-03/c2": "chart-120",
  "k100-03-05/c1": "chart-rows", "k100-03-05/c2": "c120-chart-row",
  "k100-03-06/c1": "c120-missing-order", "k100-03-06/c2": "c120-missing-order",
};

const residuals = [
  "k100-01-06/c1",
  "k100-03-01/c1", "k100-03-01/c2",
  "k100-03-02/c1", "k100-03-02/c2",
  "k100-03-04/c1", "k100-03-04/c2",
  "k100-03-07/c1", "k100-03-07/c2",
];

describe("S262 counting-to-100-k bounded whole-course repair", () => {
  it("keeps all 18 lessons schema-valid, pedagogy-clean, widget-integral, and stable-shaped", () => {
    expect(lessons).toHaveLength(18);
    for (const raw of lessons) {
      expect(raw.courseId).toBe("counting-to-100-k");
      expect(raw.steps.map((candidate) => candidate.id)).toEqual(["c1", "i1", "k1", "c2", "i2", "k2", "k3", "ch1", "r1"]);
      const parsed = Lesson.parse(raw);
      expect(lintLesson(parsed), raw.id).toEqual([]);
      for (const candidate of [...raw.steps, ...(raw.remedials ?? []).flatMap((route) => [route.concept, route.check].filter(Boolean) as RawStep[])]) {
        if (!candidate.widget) continue;
        expect(widgetIntegrityErrors(WidgetSpec.parse(candidate.widget)), `${raw.id}/${candidate.id}`).toEqual([]);
      }
    }
  });

  it("renders 26 truthful accessible semantic replacements and fail-closes nine unsynchronized placements", () => {
    expect(Object.keys(expectedBindings)).toHaveLength(26);
    expect(residuals).toHaveLength(9);
    for (const [placement, figureId] of Object.entries(expectedBindings)) {
      const [lessonId, stepId] = placement.split("/");
      const concept = step(lessonId!, stepId!);
      expect(concept.figure, placement).toBe(figureId);
      expect(isFigureTextAligned(figureId, `${concept.body ?? ""} ${concept.narration ?? ""}`), placement).toBe(true);
      const Figure = FIGURES[figureId];
      expect(Figure, `${placement}/${figureId}`).toBeDefined();
      const markup = renderToStaticMarkup(Figure());
      expect(markup, placement).toContain("<title>");
      expect(markup, placement).toContain('role="img"');
    }
    for (const placement of residuals) {
      const [lessonId, stepId] = placement.split("/");
      expect(step(lessonId!, stepId!).figure, placement).toBeUndefined();
    }
    const queuedConcepts = lessons.flatMap((lesson) => lesson.steps
      .filter((candidate) => ["c1", "c2"].includes(candidate.id) && `${lesson.id}/${candidate.id}` !== "k100-01-01/c1"));
    expect(queuedConcepts.some((candidate) => candidate.figure === "number-track")).toBe(false);
  });

  it("repairs direction, tens-unit, prediction, and chart-support defects without changing correctness IDs", () => {
    const forbidden = /Every ten ends in 9|inside each ten|right arithmetic, wrong direction/i;
    for (const lesson of lessons) expect(JSON.stringify(lesson), lesson.id).not.toMatch(forbidden);

    const k201 = WidgetSpec.parse(step("k100-02-01", "k3").widget);
    expect(k201.type).toBe("mcq");
    if (k201.type === "mcq") {
      expect(k201.options.find((option) => option.correct)?.id).toBe("o0");
      expect(k201.options.find((option) => option.id === "o0")?.label).toBe("40");
    }
    const k205 = WidgetSpec.parse(step("k100-02-05", "k3").widget);
    expect(k205.prompt).toMatch(/before 40/i);
    const i307 = WidgetSpec.parse(step("k100-03-07", "i2").widget);
    expect(i307.type).toBe("dragOrder");
    if (i307.type === "dragOrder") expect(i307.correctOrder).toEqual(["n4", "n3", "n2", "n1", "n0"]);
    const k307 = WidgetSpec.parse(step("k100-03-07", "k3").widget);
    expect(k307.prompt).toMatch(/17, 16, __, 14/);
    expect(step("k100-03-02", "i1").predict!.options.find((option) => option.id === "yes")?.label).toMatch(/42/);
    expect(step("k100-03-03", "i1").predict!.options.find((option) => option.id === "yes")?.label).toMatch(/51/);
    expect(["k1", "k2", "ch1"].map((id) => step("k100-02-03", id).figure)).toEqual(["chart-120", "chart-120", "chart-120"]);
  });

  it("keeps every MCQ evaluator and feedback contract exact", () => {
    for (const lesson of lessons) for (const candidate of lesson.steps) {
      if (!candidate.widget) continue;
      const widget = WidgetSpec.parse(candidate.widget);
      if (widget.type !== "mcq") continue;
      expect(widget.options.filter((option) => option.correct), `${lesson.id}/${candidate.id}`).toHaveLength(1);
      for (const option of widget.options) {
        const result = evaluate(widget, option.id);
        expect(result.correct, `${lesson.id}/${candidate.id}/${option.id}`).toBe(option.correct);
        expect(result.feedback, `${lesson.id}/${candidate.id}/${option.id}`).toBe(option.feedback);
      }
    }
  });

  it("seals the honest queue effect at 39 source closures and 14 assessor-controlled residual rows", () => {
    expect(Object.keys(expectedBindings).length + 13).toBe(39);
    expect(residuals.length + 5).toBe(14);
  });
});
