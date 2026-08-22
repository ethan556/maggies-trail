import fs from "node:fs";
import { describe, expect, it } from "vitest";

const closed = [
  ["fractions-add", "fa-03-03", "c2"], ["number-system", "ns-03-03", "c2"],
  ["number-system", "ns-05-01", "c2"], ["number-system", "ns-05-02", "c1"],
  ["place-value", "pv-03-02", "c2"], ["proportional-relationships", "pr-04-01", "c2"],
  ["right-triangles-trig", "rt-01-04", "c2"], ["sequences-series", "sr-03-01", "c1"],
  ["transformations-measurement", "tm-03-03", "c2"], ["trig-functions", "tf-03-01", "c1"],
  ["volume-measurement", "vm-05-02", "c2"],
] as const;

describe("S261 remaining VIS-03 singleton fail-closures", () => {
  it.each(closed)("%s/%s/%s has no conflicting exemplar", (course, lessonId, stepId) => {
    const lesson = JSON.parse(fs.readFileSync(`content/courses/${course}/lessons/${lessonId}.json`, "utf8"));
    expect(lesson.steps.find((step: { id: string }) => step.id === stepId)?.figure).toBeUndefined();
  });
});
