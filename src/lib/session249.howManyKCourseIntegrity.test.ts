import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "../components/figures";
import { evaluate } from "./evaluate";
import { lintLesson } from "./pedagogy";
import { seededShuffle } from "./prng";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

type Step = { id: string; kind: string; figure?: string; widget?: unknown };
type RawLesson = { id: string; courseId: string; steps: Step[]; remedials?: Array<{ concept?: Step; check?: Step }> };
const dir = join(process.cwd(), "content", "courses", "how-many-k", "lessons");
const lessons = readdirSync(dir).filter((name) => name.endsWith(".json")).sort()
  .map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const normalize = (value: string) => value.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();

describe("S249 how-many-k whole-course repair", () => {
  it("keeps all 16 lessons schema-valid, pedagogy-clean, and widget-integral", () => {
    expect(lessons).toHaveLength(16);
    for (const raw of lessons) {
      expect(raw.courseId).toBe("how-many-k");
      const parsed = Lesson.parse(raw);
      expect(lintLesson(parsed), raw.id).toEqual([]);
      for (const step of [...raw.steps, ...(raw.remedials ?? []).flatMap((r) => [r.concept, r.check].filter(Boolean) as Step[])]) {
        if (!step.widget) continue;
        const widget = WidgetSpec.parse(step.widget);
        expect(widgetIntegrityErrors(widget), `${raw.id}/${step.id}`).toEqual([]);
      }
    }
  });

  it("renders 32 unique, registered, accessible semantic figures", () => {
    const ids: string[] = [];
    for (const lesson of lessons) {
      const concepts = lesson.steps.filter((step) => step.kind === "concept");
      expect(concepts, lesson.id).toHaveLength(2);
      for (const concept of concepts) {
        expect(concept.figure).toMatch(/^khm-/);
        expect(concept.figure).not.toBe("count-on-hops");
        const Figure = FIGURES[concept.figure!];
        expect(Figure, concept.figure).toBeDefined();
        const markup = renderToStaticMarkup(Figure());
        expect(markup).toContain("<title>");
        expect(markup).toContain('data-how-many-figure="true"');
        ids.push(concept.figure!);
      }
    }
    expect(ids).toHaveLength(32);
    expect(new Set(ids).size).toBe(32);
  });

  it("removes copied i2 actions and every exact or number-normalized same-sitting prompt", () => {
    for (const lesson of lessons) {
      const i1 = WidgetSpec.parse(lesson.steps.find((step) => step.id === "i1")!.widget);
      const i2 = WidgetSpec.parse(lesson.steps.find((step) => step.id === "i2")!.widget);
      expect(`${i2.type}:${i2.prompt}`, lesson.id).not.toBe(`${i1.type}:${i1.prompt}`);
      const prompts = lesson.steps.filter((step) => step.widget).map((step) => WidgetSpec.parse(step.widget).prompt);
      expect(new Set(prompts).size, `${lesson.id}: exact`).toBe(prompts.length);
      expect(new Set(prompts.map(normalize)).size, `${lesson.id}: normalized`).toBe(prompts.length);
    }
  });

  it("seals MCQ evaluator truth, diagnostic feedback, queued parity, and answer-position variation", () => {
    for (const lesson of lessons) for (const step of lesson.steps) {
      if (!step.widget) continue;
      const widget = WidgetSpec.parse(step.widget);
      if (widget.type !== "mcq") continue;
      expect(widget.options.filter((option) => option.correct), `${lesson.id}/${step.id}`).toHaveLength(1);
      expect(new Set(widget.options.map((option) => option.label)).size).toBe(widget.options.length);
      expect(new Set(widget.options.map((option) => option.feedback)).size).toBe(widget.options.length);
      for (const option of widget.options) {
        const result = evaluate(widget, option.id);
        expect(result.correct).toBe(option.correct);
        expect(result.feedback).toBe(option.feedback);
      }
      const positions = new Set<number>();
      for (let seed = 0; seed < 32; seed += 1) positions.add(seededShuffle(widget.options, `s249:${lesson.id}:${step.id}:${seed}`).findIndex((option) => option.correct));
      expect(positions.size).toBe(widget.options.length);
      if ((lesson.id === "khm-01-02" && step.id === "k2") || (lesson.id === "khm-02-04" && step.id === "k1")) {
        const lengths = widget.options.map((option) => option.label.length);
        expect(Math.max(...lengths) - Math.min(...lengths)).toBeLessThanOrEqual(12);
      }
    }
  });
});
