import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "../components/figureIds";
import { isFigureTextAligned } from "./figureTextAlignment";
import { Lesson } from "./schema";

type RawStep = { id: string; kind: string; figure?: string; body?: string; narration?: string };
type RawLesson = {
  id: string;
  courseId: string;
  steps: RawStep[];
  remedials?: Array<{ conceptTag: string; concept: RawStep }>;
};

const directory = join(process.cwd(), "content", "courses", "data-line-plots-g2", "lessons");
const lessons = readdirSync(directory)
  .filter((name) => name.endsWith(".json"))
  .sort()
  .map((name) => JSON.parse(readFileSync(join(directory, name), "utf8")) as RawLesson);
const lesson = (id: string) => lessons.find((candidate) => candidate.id === id)!;
const step = (lessonId: string, stepId: string) => lesson(lessonId).steps.find((candidate) => candidate.id === stepId)!;
const remedial = (lessonId: string, conceptTag: string) => lesson(lessonId).remedials!.find((candidate) => candidate.conceptTag === conceptTag)!.concept;

const allThree = "This bar graph shows cats = 3, dogs = 6, and birds = 4. Each gridline is one.";
const expected = [
  step("g2g-02-03", "c2"),
  remedial("g2g-02-03", "g2g-build-bar"),
  step("g2g-02-04", "c1"),
  step("g2g-03-01", "c1"),
  remedial("g2g-03-01", "g2g-total-question"),
  step("g2g-03-02", "c2"),
  step("g2g-03-03", "c2"),
] as const;

describe("S290 data-line-plots-g2 visual repair", () => {
  it("keeps the seven audited graph captions and narration bound to rendered values", () => {
    expect(expected).toHaveLength(7);
    expect(expected).toEqual([
      { ...expected[0], figure: "single-scale-graph", body: allThree, narration: allThree },
      { ...expected[1], figure: "single-scale-graph", body: allThree, narration: allThree },
      { ...expected[2], figure: "single-scale-graph", body: "This bar graph shows dogs = 6. Each gridline is one.", narration: "This bar graph shows dogs = 6. Each gridline is one." },
      { ...expected[3], figure: "single-scale-graph", body: "This bar graph shows cats = 3 and dogs = 6. Together, 3 + 6 = 9. Each gridline is one.", narration: "This bar graph shows cats = 3 and dogs = 6. Together, 3 + 6 = 9. Each gridline is one." },
      { ...expected[4], figure: "single-scale-graph", body: "This bar graph shows dogs = 6 and birds = 4. Together, 6 + 4 = 10. Each gridline is one.", narration: "This bar graph shows dogs = 6 and birds = 4. Together, 6 + 4 = 10. Each gridline is one." },
      { ...expected[5], figure: "single-scale-graph", body: "This bar graph shows dogs = 6 and cats = 3. Dogs have 3 more because 6 - 3 = 3. Each gridline is one.", narration: "This bar graph shows dogs = 6 and cats = 3. Dogs have 3 more because 6 - 3 = 3. Each gridline is one." },
      { ...expected[6], figure: "single-scale-graph", body: "This bar graph compares cats = 3, dogs = 6, and birds = 4. Each gridline is one.", narration: "This bar graph compares cats = 3, dogs = 6, and birds = 4. Each gridline is one." },
    ]);
    for (const placement of expected) {
      expect(FIGURE_IDS.has(placement.figure!), placement.id).toBe(true);
      expect(isFigureTextAligned(placement.figure!, placement.body!), placement.id).toBe(true);
    }
  });

  it("keeps every illustrated concept and remedial placement in the course text-aligned", () => {
    for (const raw of lessons) {
      Lesson.parse(raw);
      const placements = [...raw.steps, ...(raw.remedials ?? []).map((route) => route.concept)];
      for (const placement of placements) {
        if (!placement.figure || !placement.body) continue;
        expect(isFigureTextAligned(placement.figure, placement.body), `${raw.id}/${placement.id}`).toBe(true);
      }
    }
  });
});
