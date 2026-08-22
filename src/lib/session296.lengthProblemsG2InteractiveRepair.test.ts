import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

const directory = join(process.cwd(), "content", "courses", "length-problems-g2", "lessons");
const lessons = readdirSync(directory)
  .filter((file) => file.endsWith(".json"))
  .sort()
  .map((file) => Lesson.parse(JSON.parse(readFileSync(join(directory, file), "utf8"))));

const lesson = (id: string) => lessons.find((candidate) => candidate.id === id)!;
const step = (lessonId: string, stepId: string) => lesson(lessonId).steps.find((candidate) => candidate.id === stepId)!;
const repairedIds = ["g2p-01-01", "g2p-01-02", "g2p-01-03", "g2p-02-01", "g2p-02-02", "g2p-02-03", "g2p-03-01", "g2p-03-02", "g2p-03-03", "g2p-03-04"];

describe("S296 length-problems-g2 interactive repair", () => {
  it("replaces every cloned retry with a distinct but valid learner job", () => {
    expect(lessons).toHaveLength(10);
    expect(repairedIds).toHaveLength(10);
    for (const lessonId of repairedIds) {
      const first = step(lessonId, "i1");
      const retry = step(lessonId, "i2");
      expect(first.kind, lessonId).toBe("interactive");
      expect(retry.kind, lessonId).toBe("interactive");
      expect(first.widget, `${lessonId}/i1`).toBeDefined();
      expect(retry.widget, `${lessonId}/i2`).toBeDefined();
      expect(JSON.stringify(retry.widget), `${lessonId}/i2 must not repeat i1`).not.toBe(JSON.stringify(first.widget));
      expect(retry.body, `${lessonId}/i2 needs a distinct instructional role`).not.toBe("Try it again.");
      const parsed = WidgetSpec.parse(retry.widget);
      expect(widgetIntegrityErrors(parsed), `${lessonId}/i2`).toEqual([]);
    }
  });

  it("keeps the comparison truth aligned with its text instead of naming the opposite bar", () => {
    const expectations = new Map([
      ["g2p-01-01", "blue ribbon"],
      ["g2p-01-02", "hiking pole"],
      ["g2p-03-01", "trail A"],
      ["g2p-03-04", "computed gap bar"],
    ]);
    for (const [lessonId, answerWords] of expectations) {
      for (const stepId of ["i1", "i2"]) {
        const parsed = WidgetSpec.parse(step(lessonId, stepId).widget);
        expect(parsed.type, `${lessonId}/${stepId}`).toBe("lengthCompare");
        if (parsed.type !== "lengthCompare") throw new Error("Expected a length comparison");
        const answer = parsed.items.find((item) => item.id === parsed.answerId)!;
        expect(answer.length, `${lessonId}/${stepId} must select the actually longer bar`).toBeGreaterThan(
          Math.max(...parsed.items.filter((item) => item.id !== parsed.answerId).map((item) => item.length)),
        );
        expect(parsed.successFeedback.toLowerCase(), `${lessonId}/${stepId} success text`).toContain(answerWords.toLowerCase());
      }
    }
  });

  it("retains the original mathematical destinations while offering alternate partitions", () => {
    const landings = new Map([
      ["g2p-02-01", 54], ["g2p-02-02", 75], ["g2p-02-03", 70], ["g2p-03-02", 54], ["g2p-03-03", 65],
    ]);
    for (const [lessonId, landing] of landings) {
      const parsed = WidgetSpec.parse(step(lessonId, "i2").widget);
      expect(parsed.type, lessonId).toBe("numberLineHop");
      if (parsed.type !== "numberLineHop") throw new Error("Expected a number line hop");
      expect(parsed.hop).toBe(5);
      expect(parsed.start + parsed.hop * parsed.hops).toBe(landing);
      expect(parsed.commonLandings).toHaveLength(1);
      expect(parsed.commonLandings[0].value).not.toBe(landing);
    }
    const ruler = WidgetSpec.parse(step("g2p-01-03", "i2").widget);
    expect(ruler.type).toBe("unitRuler");
    if (ruler.type !== "unitRuler") throw new Error("Expected a unit ruler");
    expect(ruler.objectStart).toBe(4);
    expect(ruler.objectEnd - ruler.objectStart).toBe(ruler.requiredPlacements * ruler.targetUnitSize);
  });
});
