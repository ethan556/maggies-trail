import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { WidgetSpec, widgetIntegrityErrors, type TWidget } from "./schema";

const DIR = join(__dirname, "../../content/courses/expressions-patterns-g5/lessons");
type OptionRecord = { id: string; label: string; feedback: string; correct?: boolean };
type WidgetRecord = { type: string; prompt: string; options?: OptionRecord[] };
type StepRecord = { id: string; kind: string; body?: string; widget?: WidgetRecord };
type LessonRecord = {
  id: string;
  steps: StepRecord[];
  remedials?: Array<{ check: StepRecord }>;
};

const lessons = readdirSync(DIR).sort().map((file) =>
  JSON.parse(readFileSync(join(DIR, file), "utf8"))
) as LessonRecord[];

function itemIdentity(widget: { prompt: string; options?: Array<{ label: string }> }) {
  return JSON.stringify({
    prompt: widget.prompt.trim().replace(/\s+/g, " "),
    options: (widget.options ?? []).map((option) => option.label.trim()).sort(),
  });
}

function hasWidget(step: StepRecord): step is StepRecord & { widget: WidgetRecord } {
  return Boolean(step.widget);
}

function allQuestionSteps(lesson: LessonRecord) {
  const main = lesson.steps.filter(hasWidget);
  const remedial = (lesson.remedials ?? []).map((row) => row.check).filter(hasWidget);
  return [...main, ...remedial];
}

describe("S244 Grade 5 expressions and patterns — varied lesson jobs", () => {
  it("covers the complete twelve-lesson family", () => {
    expect(lessons).toHaveLength(12);
    expect(lessons.map((lesson) => lesson.id)).toEqual([
      "g5e-01-01", "g5e-01-02", "g5e-01-03", "g5e-01-04",
      "g5e-02-01", "g5e-02-02", "g5e-02-03",
      "g5e-03-01", "g5e-03-02", "g5e-03-03", "g5e-03-04", "g5e-03-05",
    ]);
  });

  it("never asks the same prompt-and-options item twice in one sitting", () => {
    for (const lesson of lessons) {
      const items = allQuestionSteps(lesson);
      const identities = items.map((step) => itemIdentity(step.widget));
      expect(new Set(identities).size, `${lesson.id}: repeated item`).toBe(identities.length);
    }
  });

  it("gives every second manipulative a genuinely new instance", () => {
    for (const lesson of lessons) {
      const [first, second] = lesson.steps.filter((step) => step.kind === "interactive" && step.widget)
        .filter(hasWidget);
      expect(first.widget.prompt, `${lesson.id}: copied interactive prompt`).not.toBe(second.widget.prompt);
      expect(itemIdentity(first.widget), `${lesson.id}: copied interactive state`).not.toBe(itemIdentity(second.widget));
      expect(second.body).not.toMatch(/^Try it again\.?$/i);
    }
  });

  it("keeps every remedial item distinct from the assessed item that triggered it", () => {
    for (const lesson of lessons) {
      const mainIdentities = new Set(
        lesson.steps.filter(hasWidget).map((step) => itemIdentity(step.widget))
      );
      for (const row of lesson.remedials ?? []) {
        expect(row.check.widget, `${lesson.id}: remedial has no widget`).toBeDefined();
        if (!row.check.widget) continue;
        expect(mainIdentities.has(itemIdentity(row.check.widget)), `${lesson.id}: copied remedial`).toBe(false);
      }
    }
  });

  it("moves challenges to contextual transfer or a boundary-case decision", () => {
    const transferEvidence: Record<string, RegExp> = {
      "g5e-01-01": /display|lights/i,
      "g5e-01-02": /game|points/i,
      "g5e-01-03": /workshop|parts/i,
      "g5e-01-04": /shelf|books/i,
      "g5e-02-01": /hall|chairs/i,
      "g5e-02-02": /guide|difference/i,
      "g5e-02-03": /shop|trays|rolls/i,
      "g5e-03-01": /rule B|rule A/i,
      "g5e-03-02": /graph point/i,
      "g5e-03-03": /straight pattern|when x/i,
      "g5e-03-04": /trail-map point/i,
      "g5e-03-05": /starts at 1|not doubled/i,
    };
    for (const lesson of lessons) {
      const challenge = lesson.steps.find((step) => step.kind === "challenge" && step.widget);
      expect(challenge?.widget).toBeDefined();
      if (!challenge?.widget) continue;
      expect(challenge.widget.prompt, `${lesson.id}: challenge is still a bare near-copy`)
        .toMatch(transferEvidence[lesson.id]);
      const earlier = lesson.steps.filter((step) => step.kind === "check" && step.widget).filter(hasWidget);
      expect(earlier.some((step) => itemIdentity(step.widget) === itemIdentity(challenge.widget!)))
        .toBe(false);
    }
  });

  it("keeps every revised widget mathematically and structurally valid", () => {
    for (const lesson of lessons) {
      for (const step of allQuestionSteps(lesson)) {
        const widget = WidgetSpec.parse(step.widget) as TWidget;
        expect(widgetIntegrityErrors(widget), `${lesson.id}/${step.id}`).toEqual([]);
        if (widget.type === "mcq") {
          expect(widget.options).toHaveLength(4);
          expect(widget.options.filter((option) => option.correct)).toHaveLength(1);
          expect(new Set(widget.options.map((option) => option.label)).size).toBe(4);
          for (const option of widget.options) {
            expect(option.feedback.length, `${lesson.id}/${step.id}/${option.id}: thin feedback`)
              .toBeGreaterThanOrEqual(25);
          }
        }
      }
    }
  });
});
