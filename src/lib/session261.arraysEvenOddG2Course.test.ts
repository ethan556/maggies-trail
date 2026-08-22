import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const dir = "content/courses/arrays-even-odd-g2/lessons";
const files = fs.readdirSync(dir).filter((file) => file.endsWith(".json")).sort();
const expected = new Map([
  ["g2a-02-03:c1", "mult3-flip"], ["g2a-02-03:c2", "mult3-flip"],
  ["g2a-03-02:c1", "mult3-flip"], ["g2a-03-02:c2", "mult3-flip"],
]);
describe("S261 arrays-even-odd-g2 semantic illustration closure", () => {
  it("covers all 10 lessons", () => expect(files).toHaveLength(10));
  it.each(files)("%s has only exact semantic figure placements", (name) => {
    const lesson = JSON.parse(fs.readFileSync(path.join(dir, name), "utf8"));
    for (const step of lesson.steps) {
      const wanted = expected.get(`${lesson.id}:${step.id}`);
      if (wanted) expect(step.figure).toBe(wanted); else expect(step.figure).not.toBe("count-on-hops");
    }
  });
});
