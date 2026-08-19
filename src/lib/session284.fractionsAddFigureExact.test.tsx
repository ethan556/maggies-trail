// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { FIGURES } from "@/components/figures";
import { isFigureTextAligned } from "@/lib/figureTextAlignment";

afterEach(cleanup);

const lessonDir = path.join(process.cwd(), "content", "courses", "fractions-add", "lessons");
type LessonStep = { id: string; body?: string; figure?: string };
type Lesson = {
  id: string;
  steps: LessonStep[];
  remedials?: Array<{ concept?: LessonStep; check?: LessonStep }>;
};
const load = (id: string) => JSON.parse(readFileSync(path.join(lessonDir, `${id}.json`), "utf8")) as Lesson;
const step = (lesson: Lesson, id: string) => lesson.steps.find((candidate) => candidate.id === id);

const expected = Object.freeze([
  ["fa-01-02", "c1", "fm-common-denom"],
  ["fa-03-01", "c1", undefined],
  ["fa-03-01", "c2", undefined],
  ["fa-03-02", "c1", undefined],
  ["fa-03-02", "c2", undefined],
  ["fa-04-01", "c1", undefined],
  ["fa-04-01", "c2", undefined],
  ["fa-04-02", "c1", undefined],
  ["fa-04-03", "c1", undefined],
  ["fa-04-03", "c2", undefined],
  ["fa-05-01", "c1", undefined],
  ["fa-05-01", "c2", undefined],
  ["fa-05-02", "c1", undefined],
] as const);

describe("S284 — fractions-add figure-exact source closure", () => {
  it("rebinds one exact model and fail-closes all twelve contradictory fixed exemplars", () => {
    expect(expected).toHaveLength(13);
    for (const [lessonId, stepId, figure] of expected) {
      expect(step(load(lessonId), stepId)?.figure, `${lessonId}/${stepId}`).toBe(figure);
    }
  });

  it("uses an existing model that visibly and accessibly proves one third becomes two sixths", () => {
    const Figure = FIGURES["fm-common-denom"];
    expect(Figure).toBeDefined();
    const { container } = render(<Figure />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("role")).toBe("img");
    const semanticText = `${svg?.getAttribute("aria-label") ?? ""} ${svg?.textContent ?? ""}`.toLowerCase();
    expect(semanticText).toMatch(/one third.*two sixths|1\/3\s*→\s*2\/6/);
    const concept = step(load("fa-01-02"), "c1");
    expect(isFigureTextAligned(concept?.figure ?? "", concept?.body ?? "")).toBe(true);
  });

  it("leaves no unsafe retained figure anywhere in the fourteen-lesson course", () => {
    const unsafe: string[] = [];
    let placements = 0;
    for (const file of readdirSync(lessonDir).filter((name) => name.endsWith(".json"))) {
      const lesson = JSON.parse(readFileSync(path.join(lessonDir, file), "utf8")) as Lesson;
      for (const candidate of lesson.steps ?? []) {
        if (!candidate.figure) continue;
        placements += 1;
        if (!FIGURES[candidate.figure] || !isFigureTextAligned(candidate.figure, candidate.body ?? "")) {
          unsafe.push(`${lesson.id}/${candidate.id}:${candidate.figure}`);
        }
      }
      for (const remedial of lesson.remedials ?? []) {
        for (const candidate of [remedial.concept, remedial.check]) {
          if (!candidate?.figure) continue;
          placements += 1;
          if (!FIGURES[candidate.figure] || !isFigureTextAligned(candidate.figure, candidate.body ?? "")) {
            unsafe.push(`${lesson.id}/${candidate.id}:${candidate.figure}`);
          }
        }
      }
    }
    expect(placements).toBeGreaterThan(0);
    expect(unsafe).toEqual([]);
  });
});
