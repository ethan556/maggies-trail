import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const dir = "content/courses/length-problems-g2/lessons";
const files = fs.readdirSync(dir).filter((file) => file.endsWith(".json")).sort();
const expected = new Map([
  ["g2p-01-01:c1", "mmt-how-much-longer"], ["g2p-01-01:c2", "mmt-how-much-longer"],
  ["g2p-01-03:c1", "mmt-any-start"], ["g2p-01-03:c2", "mmt-any-start"],
  ["g2p-03-02:c1", "number-line-jumps"], ["g2p-03-02:c2", "number-line-jumps"],
]);
describe("S261 length-problems-g2 semantic illustration closure", () => {
  it("covers all 10 lessons", () => expect(files).toHaveLength(10));
  it.each(files)("%s has only exact semantic figure placements", (name) => {
    const lesson = JSON.parse(fs.readFileSync(path.join(dir, name), "utf8"));
    for (const step of lesson.steps) {
      const wanted = expected.get(`${lesson.id}:${step.id}`);
      if (wanted) expect(step.figure).toBe(wanted); else expect(step.figure).not.toBe("count-on-hops");
    }
  });
});
