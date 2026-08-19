import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const dir = "content/courses/data-graphs-g1/lessons";
const files = fs.readdirSync(dir).filter((file) => file.endsWith(".json")).sort();
describe("S261 data-graphs-g1 illustration closure", () => {
  it("covers all 12 lessons", () => expect(files).toHaveLength(12));
  it.each(files)("%s has no unrelated hard-coded bar comparison", (name) => {
    const lesson = JSON.parse(fs.readFileSync(path.join(dir, name), "utf8"));
    expect(lesson.steps.filter((step: { figure?: string }) => step.figure === "bar-compare")).toEqual([]);
    expect(lesson.steps.every((step: { id?: string }) => typeof step.id === "string")).toBe(true);
  });
});
