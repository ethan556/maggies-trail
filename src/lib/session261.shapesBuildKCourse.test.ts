import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const dir = "content/courses/shapes-build-k/lessons";
const files = fs.readdirSync(dir).filter((file) => file.endsWith(".json")).sort();

describe("S261 shapes-build-k course-local illustration closure", () => {
  it("covers the complete 14-lesson course", () => expect(files).toHaveLength(14));
  it.each(files)("%s has no arithmetic number-line figure in a geometry concept", (name) => {
    const lesson = JSON.parse(fs.readFileSync(path.join(dir, name), "utf8"));
    expect(lesson.steps.filter((step: { figure?: string }) => step.figure === "count-on-hops")).toEqual([]);
    expect(lesson.steps.every((step: { id?: string }) => typeof step.id === "string")).toBe(true);
  });
});
