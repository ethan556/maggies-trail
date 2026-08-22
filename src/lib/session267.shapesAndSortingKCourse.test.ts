import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

type Option = { correct?: boolean };
type Widget = { type: string; options?: Option[]; buckets?: Array<{ id: string }>; items?: Array<{ bucketId: string }>; left?: Array<{ id: string }>; right?: Array<{ id: string }>; pairs?: Record<string, string> };
type Step = { id: string; widget?: Widget };
type Lesson = { id: string; steps: Step[] };

const lessonDir = path.join(process.cwd(), "content", "courses", "shapes-and-sorting-k", "lessons");
const expectedTypes: Record<string, string> = {
  "ks-01-01": "mcq", "ks-01-02": "matchPairs", "ks-01-03": "dragBucket", "ks-02-01": "mcq", "ks-02-03": "dragBucket", "ks-03-02": "dragBucket", "ks-03-03": "matchPairs",
};

async function readLesson(id: string): Promise<Lesson> {
  return JSON.parse(await readFile(path.join(lessonDir, `${id}.json`), "utf8")) as Lesson;
}

describe("S267 Shapes & Sorting K transfer challenges", () => {
  it("covers the complete clean nine-lesson course", async () => {
    expect((await readdir(lessonDir)).filter((file) => file.endsWith(".json"))).toHaveLength(9);
  });

  it("gives every flagged lesson a distinct, valid challenge action", async () => {
    for (const [lessonId, type] of Object.entries(expectedTypes)) {
      const challenge = (await readLesson(lessonId)).steps.find((step) => step.id === "ch1")?.widget;
      expect(challenge?.type, lessonId).toBe(type);
      if (challenge?.type === "mcq") expect(challenge.options?.filter((option) => option.correct)).toHaveLength(1);
      if (challenge?.type === "dragBucket") {
        const bucketIds = new Set(challenge.buckets?.map((bucket) => bucket.id));
        expect(challenge.items?.every((item) => bucketIds.has(item.bucketId))).toBe(true);
      }
      if (challenge?.type === "matchPairs") {
        const leftIds = new Set(challenge.left?.map((item) => item.id));
        const rightIds = new Set(challenge.right?.map((item) => item.id));
        expect(Object.keys(challenge.pairs ?? {}).every((left) => leftIds.has(left) && rightIds.has(challenge.pairs?.[left] ?? ""))).toBe(true);
      }
    }
  });
});
