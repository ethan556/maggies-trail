import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

type Option = { correct?: boolean };
type Widget = { type: string; prompt?: string; options?: Option[]; buckets?: Array<{ id: string }>; items?: Array<{ bucketId: string }>; left?: Array<{ id: string }>; right?: Array<{ id: string }>; pairs?: Record<string, string> };
type Step = { id: string; body: string; figure?: string; widget?: Widget };
type Lesson = { steps: Step[] };
const dir = path.join(process.cwd(), "content", "courses", "measure-money-time", "lessons");

async function get(lessonId: string, stepId: string): Promise<Step> {
  const lesson = JSON.parse(await readFile(path.join(dir, `${lessonId}.json`), "utf8")) as Lesson;
  const step = lesson.steps.find((candidate) => candidate.id === stepId);
  if (!step) throw new Error(`missing ${lessonId}/${stepId}`);
  return step;
}
function expectWidgetAnswerContract(widget: Widget | undefined) {
  expect(widget).toBeDefined();
  if (widget?.type === "mcq") expect(widget.options?.filter((option) => option.correct)).toHaveLength(1);
  if (widget?.type === "matchPairs") {
    const left = new Set(widget.left?.map((item) => item.id)); const right = new Set(widget.right?.map((item) => item.id));
    expect(Object.keys(widget.pairs ?? {}).every((key) => left.has(key) && right.has(widget.pairs?.[key] ?? ""))).toBe(true);
  }
}

describe("S268 Measure, Money & Time source-local repair", () => {
  it("uses graph figures that match the taught representation and an exact clock explanation", async () => {
    expect((await get("mmt-03-02", "c2")).figure).toBe("mmt-biggest-first");
    // S318-FIGA-RISK-mmt-03-02: body spells the coin values the way the figure title does
    expect((await get("mmt-03-02", "c2")).body).toContain("twenty-five, fifty, seventy-five");
    expect((await get("mmt-04-03", "c1")).body).toContain("3:20");
    expect((await get("mmt-04-03", "c1")).figure).toBe("five-minute-clock");
    expect((await get("mmt-05-01", "c1")).figure).toBe("mmt-picture-graph");
    expect((await get("mmt-05-03", "c1")).figure).toBe("md3-lineplot");
  });

  it("gives the P0 challenge and progression surfaces valid diverse answer contracts", async () => {
    const expected: ReadonlyArray<readonly [string, string, string]> = [
      ["mmt-02-01", "ch1", "matchPairs"], ["mmt-04-03", "ch1", "mcq"], ["mmt-05-02", "i3", "lengthCompare"], ["mmt-05-02", "k2", "mcq"], ["mmt-05-02", "k3", "graphRead"], ["mmt-05-02", "ch1", "mcq"],
    ];
    for (const [lessonId, stepId, type] of expected) {
      const current = await get(lessonId, stepId);
      expect(current.widget?.type, `${lessonId}/${stepId}`).toBe(type);
      expectWidgetAnswerContract(current.widget);
    }
    expect((await get("mmt-05-02", "i2")).widget?.prompt).not.toBe((await get("mmt-05-02", "i3")).widget?.prompt);
  });
});
