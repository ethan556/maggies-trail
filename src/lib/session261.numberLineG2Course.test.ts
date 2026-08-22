import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "@/components/figureIds";

type Choice = { id: string; label: string; correct: boolean; feedback: string };
type McqWidget = { type: "mcq"; prompt: string; options: Choice[] };
type HopWidget = {
  type: "numberLineHop"; prompt: string; min: number; max: number; start: number; hop: number; hops: number;
  direction: "forward" | "back"; commonLandings?: { value: number; feedback: string }[]; successFeedback: string;
};
type NumericWidget = {
  type: "numeric"; answer: number; prompt: string; successFeedback: string; commonErrors: { value: number; feedback: string }[];
};
type Widget = McqWidget | HopWidget | NumericWidget;
type Step = { id: string; kind?: string; figure?: string; body?: string; widget?: Widget };
type Lesson = { id: string; steps: Step[]; remedials?: { concept?: Step; check?: Step }[] };

const dir = "content/courses/number-line-g2/lessons";
const files = fs.readdirSync(dir).filter((file) => file.endsWith(".json")).sort();
const lessons: Lesson[] = files.map((name) => JSON.parse(fs.readFileSync(path.join(dir, name), "utf8")) as Lesson);

const i2Goals = new Map([
  ["g2l-01-01", 60], ["g2l-01-02", 45], ["g2l-01-03", 73], ["g2l-02-01", 59], ["g2l-02-02", 51],
  ["g2l-02-03", 72], ["g2l-03-01", 59], ["g2l-03-02", 34], ["g2l-03-03", 52], ["g2l-03-04", 48],
]);

function requiredStep(lessonId: string, stepId: string): Step {
  const lesson = lessons.find((item) => item.id === lessonId);
  const found = lesson?.steps.find((item) => item.id === stepId);
  if (!found) throw new Error(`missing ${lessonId}/${stepId}`);
  return found;
}

function requiredLesson(lessonId: string): Lesson {
  const lesson = lessons.find((item) => item.id === lessonId);
  if (!lesson) throw new Error(`missing ${lessonId}`);
  return lesson;
}

function assertMcq(widget: Widget | undefined): asserts widget is McqWidget {
  expect(widget?.type).toBe("mcq");
  const mcq = widget as McqWidget;
  expect(mcq.options).toHaveLength(4);
  // reports/quality/S308_NUMBER_LINE_G2_CHOICE_ORDER.md deliberately reordered every main-sequence
  // MCQ's options array so the correct option (always id o0) no longer renders at a fixed index-0
  // position; ids stay stable, array order does not. Compare the id set, not the array order.
  expect([...mcq.options.map((option) => option.id)].sort()).toEqual(["o0", "o1", "o2", "o3"]);
  expect(mcq.options.filter((option) => option.correct)).toHaveLength(1);
  expect(mcq.options.find((option) => option.correct)?.id).toBe("o0");
  expect(new Set(mcq.options.map((option) => option.label)).size).toBe(4);
  for (const option of mcq.options) expect(option.feedback.trim().length).toBeGreaterThan(20);
}

function assertHop(widget: Widget | undefined): asserts widget is HopWidget {
  expect(widget?.type).toBe("numberLineHop");
  const hop = widget as HopWidget;
  const landing = hop.start + (hop.direction === "back" ? -1 : 1) * hop.hop * hop.hops;
  expect(landing).toBeGreaterThanOrEqual(hop.min);
  expect(landing).toBeLessThanOrEqual(hop.max);
  expect(landing).not.toBe(hop.start);
  for (const common of hop.commonLandings ?? []) {
    expect(common.value).toBeGreaterThanOrEqual(hop.min);
    expect(common.value).toBeLessThanOrEqual(hop.max);
    expect(common.value).not.toBe(landing);
    expect(common.feedback.trim().length).toBeGreaterThan(20);
  }
  expect(hop.successFeedback).toContain(String(landing));
}

describe("S261 number-line-g2 source implementation", () => {
  it("covers the clean ten-lesson course and all twenty queued concept placements", () => {
    expect(files).toHaveLength(10);
    const concepts = lessons.flatMap((lesson) => lesson.steps.filter((item) => item.id === "c1" || item.id === "c2"));
    expect(concepts).toHaveLength(20);
  });

  it("fail-closes all twenty unsynchronised fixed 4 + 3 = 7 visual placements", () => {
    let removed = 0;
    for (const lesson of lessons) for (const item of lesson.steps) {
      if (item.id !== "c1" && item.id !== "c2") continue;
      expect(item.figure).toBeUndefined();
      expect(item.figure).not.toBe("count-on-hops");
      removed += 1;
    }
    expect(removed).toBe(20);
  });

  it("keeps all remaining lesson and remedial figures registered and semantically bounded", () => {
    for (const lesson of lessons) {
      for (const item of lesson.steps) if (item.figure) expect(FIGURE_IDS.has(item.figure)).toBe(true);
      for (const remedial of lesson.remedials ?? []) {
        expect(remedial.concept?.figure).not.toBe("count-on-hops");
        expect(remedial.check?.figure).not.toBe("count-on-hops");
        if (remedial.concept?.figure) expect(FIGURE_IDS.has(remedial.concept.figure)).toBe(true);
        if (remedial.check?.figure) expect(FIGURE_IDS.has(remedial.check.figure)).toBe(true);
      }
    }
  });

  it("turns every former repeat into a distinct evaluator-safe transfer, completion, reconstruction, or story job", () => {
    expect(i2Goals.size).toBe(10);
    for (const lesson of lessons) {
      const i1 = requiredStep(lesson.id, "i1");
      const i2 = requiredStep(lesson.id, "i2");
      const i1Widget = i1.widget;
      const i2Widget = i2.widget;
      assertHop(i1Widget);
      assertHop(i2Widget);
      expect(i2.body).not.toBe("Try it again.");
      expect(i2Widget.prompt).not.toBe(i1Widget.prompt);
      expect(i2Widget.start).not.toBe(i1Widget.start);
      const landing = i2Widget.start + (i2Widget.direction === "back" ? -1 : 1) * i2Widget.hop * i2Widget.hops;
      expect(landing).toBe(i2Goals.get(lesson.id));
    }
    for (const lessonId of ["g2l-01-01", "g2l-01-02"]) {
      const k3Widget = requiredStep(lessonId, "k3").widget;
      const k1Widget = requiredStep(lessonId, "k1").widget;
      assertMcq(k3Widget);
      assertMcq(k1Widget);
      expect(k3Widget.prompt).not.toBe(k1Widget.prompt);
    }
  });

  it("repairs both queued choice surfaces without changing stable IDs or correct answers", () => {
    const k1Widget = requiredStep("g2l-02-03", "k1").widget;
    const ch1Widget = requiredStep("g2l-02-03", "ch1").widget;
    const remedial = requiredLesson("g2l-02-03").remedials?.[0]?.check;
    if (!remedial) throw new Error("missing g2l-02-03 remedial check");
    const remedialWidget = remedial.widget;
    assertMcq(k1Widget);
    assertMcq(ch1Widget);
    assertMcq(remedialWidget);
    // The remedial check is the same MCQ as k1 (same prompt, same four options by id/label/
    // correct/feedback), but S308's choice-order repair rotated each occurrence's options array
    // independently, so the two are no longer array-order-identical. Compare by id-sorted content.
    const byId = (options: Choice[]) => [...options].sort((a, b) => a.id.localeCompare(b.id));
    expect({ ...remedialWidget, options: byId(remedialWidget.options) }).toEqual({ ...k1Widget, options: byId(k1Widget.options) });
    expect(k1Widget.prompt).toContain("fewest hops");
    expect(ch1Widget.prompt).toContain("lands exactly on 72");
    for (const widget of [k1Widget, ch1Widget]) {
      const lengths = widget.options.map((option) => option.label.length);
      expect(Math.max(...lengths) / Math.min(...lengths)).toBeLessThanOrEqual(1.3);
    }
  });

  it("keeps every authored MCQ and numeric evaluator unambiguous", () => {
    for (const lesson of lessons) {
      for (const item of lesson.steps) {
        const widget = item.widget;
        if (widget?.type === "mcq") assertMcq(widget);
        if (widget?.type === "numeric") {
          expect(Number.isFinite(widget.answer)).toBe(true);
          expect(widget.successFeedback).toContain(String(widget.answer));
        }
      }
      const remedialWidget = lesson.remedials?.[0]?.check?.widget;
      if (remedialWidget?.type === "mcq") assertMcq(remedialWidget);
      if (remedialWidget?.type === "numeric") {
        expect(Number.isFinite(remedialWidget.answer)).toBe(true);
        expect(remedialWidget.successFeedback).toContain(String(remedialWidget.answer));
      }
    }
  });

  it("states trail distance as a gap rather than a contradictory destination", () => {
    // ch1 was rewritten by S327_FIX_PG4 (reports/closure/S327_FIX_PG4.md, "g2l-03-04"): it was a
    // true duplicate of k2's no-regroup gap (46-14=32), so ch1 now poses a regrouping-required gap
    // (71-44=27) instead. k2 itself is untouched and keeps its original expected values.
    for (const stepId of ["k2", "ch1"]) {
      const widget = requiredStep("g2l-03-04", stepId).widget;
      if (widget?.type !== "numeric") throw new Error(`expected numeric g2l-03-04/${stepId}`);
      expect(widget.answer).toBe(stepId === "k2" ? 32 : 27);
      expect(widget.prompt).toMatch(/How far behind her/);
      expect(widget.successFeedback).toContain(stepId === "k2" ? "32 meters separate markers" : "27 meters separate markers");
      expect(widget.commonErrors.map((error) => error.value)).toEqual(stepId === "k2" ? [60, 34] : [33, 37]);
    }
  });
});