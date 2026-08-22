import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "../components/figures";
import { evaluate } from "./evaluate";
import { isFigureTextAligned } from "./figureTextAlignment";
import { lintLesson } from "./pedagogy";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

type RawStep = { id: string; kind: string; body?: string; narration?: string; figure?: string; widget?: unknown };
type RawLesson = { id: string; courseId: string; steps: RawStep[]; remedials?: Array<{ concept?: RawStep; check?: RawStep }> };
const dir = join(process.cwd(), "content", "courses", "compose-shapes-g1", "lessons");
const lessons = readdirSync(dir).filter((name) => name.endsWith(".json")).sort()
  .map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const byId = Object.fromEntries(lessons.map((lesson) => [lesson.id, lesson]));
const step = (lessonId: string, stepId: string) => byId[lessonId]!.steps.find((candidate) => candidate.id === stepId)!;
const normalized = (prompt: string) => prompt.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();

const expectedBindings: Record<string, string> = {
  "g1s-01-01/c1": "shape-attributes", "g1s-01-01/c2": "shape-attributes",
  "g1s-01-02/c1": "ks-any-way-up", "g1s-01-02/c2": "ks-size-same",
  "g1s-01-03/c1": "geo3-sort-yesno", "g1s-01-03/c2": "ks-sort-count",
  "g1s-02-01/c1": "ks-build-shapes", "g1s-02-01/c2": "ks-build-shapes",
  "g1s-03-01/c1": "flat-vs-solid", "g1s-03-01/c2": "solid-shapes",
  "g1s-03-02/c1": "ks-build-shapes", "g1s-03-02/c2": "ks-build-shapes",
  "g1s-03-03/c1": "ks-build-shapes", "g1s-03-03/c2": "shape-attributes",
};
const residuals = [
  "g1s-02-02/c1", "g1s-02-02/c2",
  "g1s-02-03/c1", "g1s-02-03/c2",
  "g1s-02-04/c1", "g1s-02-04/c2",
];
const progressionPlacements: Record<string, string[]> = {
  "g1s-01-01": ["i2"], "g1s-01-02": ["i2"],
  "g1s-02-01": ["i2"], "g1s-02-02": ["i2"],
  "g1s-03-01": ["k3", "ch1"], "g1s-03-02": ["i2", "k3"], "g1s-03-03": ["i2"],
};

describe("S262 compose-shapes-g1 bounded P0 repair", () => {
  it("keeps all 10 lessons schema-valid, pedagogy-clean, widget-integral, and stable-shaped", () => {
    expect(lessons).toHaveLength(10);
    for (const raw of lessons) {
      expect(raw.courseId).toBe("compose-shapes-g1");
      expect(raw.steps.map((candidate) => candidate.id)).toEqual(["c1", "i1", "k1", "c2", "i2", "k2", "k3", "ch1", "r1"]);
      expect(lintLesson(Lesson.parse(raw)), raw.id).toEqual([]);
      const surfaces = [...raw.steps, ...(raw.remedials ?? []).flatMap((route) => [route.concept, route.check].filter(Boolean) as RawStep[])];
      for (const candidate of surfaces) if (candidate.widget) {
        expect(widgetIntegrityErrors(WidgetSpec.parse(candidate.widget)), `${raw.id}/${candidate.id}`).toEqual([]);
      }
    }
  });

  it("renders 14 exact accessible semantic replacements and fail-closes six unsupported compositions", () => {
    expect(Object.keys(expectedBindings)).toHaveLength(14);
    expect(residuals).toHaveLength(6);
    for (const [placement, figureId] of Object.entries(expectedBindings)) {
      const [lessonId, stepId] = placement.split("/");
      const concept = step(lessonId!, stepId!);
      expect(concept.figure, placement).toBe(figureId);
      expect(concept.body, placement).toBe(concept.narration);
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
    expect(lessons.flatMap((lesson) => lesson.steps).some((candidate) => candidate.figure === "count-on-hops")).toBe(false);
  });

  it("closes all seven P0 progression causes with distinct current learner jobs", () => {
    expect(Object.keys(progressionPlacements)).toHaveLength(7);
    for (const [lessonId, repairedIds] of Object.entries(progressionPlacements)) {
      const widgets = byId[lessonId]!.steps.filter((candidate) => candidate.widget).map((candidate) => ({
        id: candidate.id,
        widget: WidgetSpec.parse(candidate.widget),
      }));
      for (const repairedId of repairedIds) {
        const repaired = widgets.find((candidate) => candidate.id === repairedId)!;
        const peers = widgets.filter((candidate) => candidate.id !== repairedId);
        expect(peers.map((candidate) => candidate.widget.prompt), `${lessonId}/${repairedId} exact`).not.toContain(repaired.widget.prompt);
        expect(peers.map((candidate) => normalized(candidate.widget.prompt)), `${lessonId}/${repairedId} normalized`).not.toContain(normalized(repaired.widget.prompt));
        expect(peers.map((candidate) => JSON.stringify(candidate.widget)), `${lessonId}/${repairedId} payload`).not.toContain(JSON.stringify(repaired.widget));
      }
    }
  });

  it("removes authored shape-definition and composition overgeneralizations", () => {
    const corpus = JSON.stringify(lessons);
    expect(corpus).not.toMatch(/"label":"Having 4 straight sides"/i);
    expect(corpus).not.toMatch(/What new shape do two triangles make when joined/i);
    expect(corpus).not.toMatch(/What new shape do two squares make when joined/i);
    expect(corpus).not.toMatch(/What new shape do six triangles make when joined/i);
    expect(corpus).not.toMatch(/How can a rectangle be taken apart\?/i);
    expect(step("g1s-03-01", "c2").body).toMatch(/flat faces, curved surfaces, or both/i);
    expect((step("g1s-03-02", "k3").widget as { prompt: string }).prompt).toMatch(/reverses joining/i);
  });

  it("preserves authored evaluator IDs, correctness, and diagnostic feedback", () => {
    for (const lesson of lessons) for (const candidate of lesson.steps) {
      if (!candidate.widget) continue;
      const widget = WidgetSpec.parse(candidate.widget);
      if (widget.type === "mcq") {
        expect(widget.options.filter((option) => option.correct), `${lesson.id}/${candidate.id}`).toHaveLength(1);
        expect(widget.options[0]?.correct, `${lesson.id}/${candidate.id}/correct-id`).toBe(true);
        for (const option of widget.options) {
          const result = evaluate(widget, option.id);
          expect(result.correct, `${lesson.id}/${candidate.id}/${option.id}`).toBe(option.correct);
          expect(result.feedback, `${lesson.id}/${candidate.id}/${option.id}`).toBe(option.feedback);
        }
      }
      if (widget.type === "numeric") expect(evaluate(widget, widget.answer).correct, `${lesson.id}/${candidate.id}`).toBe(true);
      if (widget.type === "tapDiagram") expect(widget.hotspots.filter((hotspot) => hotspot.correct), `${lesson.id}/${candidate.id}`).toHaveLength(1);
    }
  });

  it("seals the P0 queue effect at 21 source closures and six explicit visual residuals", () => {
    expect(Object.keys(expectedBindings).length + Object.keys(progressionPlacements).length).toBe(21);
    expect(residuals).toHaveLength(6);
  });
});
