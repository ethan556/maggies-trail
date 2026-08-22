import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { WidgetSpec, widgetIntegrityErrors, type TWidget } from "./schema";

type Option = { label: string };
type Widget = { type: string; prompt: string; options?: Option[] };
type Step = { id: string; kind: string; widget?: Widget };
type Remedial = { check: { widget: Widget } };
type Lesson = { id: string; steps: Step[]; remedials?: Remedial[] };

const DIR = join(__dirname, "../../content/courses/fraction-division-g5/lessons");
const lessons = readdirSync(DIR)
  .filter((file) => file.endsWith(".json"))
  .sort()
  .map((file) => JSON.parse(readFileSync(join(DIR, file), "utf8")) as Lesson);

function normalized(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9/]+/g, " ").trim();
}

function identity(widget: Widget): string {
  const options = (widget.options ?? []).map((option) => normalized(option.label)).sort();
  return `${normalized(widget.prompt)}::${options.join("|")}`;
}

function questionJob(prompt: string): "estimate" | "model" | "context" | "compute" {
  const value = prompt.toLowerCase();
  if (/estimate|roughly|about how many|benchmark/.test(value)) return "estimate";
  if (/model|picture|bar|build|draw|sketch|mark|slide/.test(value)) return "model";
  if (/litre|metre|sandwich|muffin|student|team|container|bottle|ribbon|trail/.test(value)) return "context";
  return "compute";
}

describe("S244 fraction division — repetition and transfer guard", () => {
  it("uses a different second manipulation in every lesson", () => {
    for (const lesson of lessons) {
      const interactives = lesson.steps.filter((step) => step.kind === "interactive");
      expect(interactives, `${lesson.id}: expected two manipulatives`).toHaveLength(2);
      expect(normalized(interactives[1].widget!.prompt), `${lesson.id}: copied i2 prompt`)
        .not.toBe(normalized(interactives[0].widget!.prompt));
    }
  });

  it("never asks an identical stem-and-option item twice in one sitting", () => {
    for (const lesson of lessons) {
      const assessed = lesson.steps
        .filter((step) => step.kind === "check" || step.kind === "challenge")
        .flatMap((step) => step.widget ? [step.widget] : []);
      const remedials = (lesson.remedials ?? []).map((remedial) => remedial.check.widget);
      const identities = [...assessed, ...remedials].map(identity);
      expect(new Set(identities).size, `${lesson.id}: repeated assessed item`).toBe(identities.length);
    }
  });

  it("gives every remedial a different scaffold from the main checks", () => {
    for (const lesson of lessons) {
      const mainPrompts = new Set(
        lesson.steps
          .filter((step) => step.kind === "check" || step.kind === "challenge")
          .flatMap((step) => step.widget ? [normalized(step.widget.prompt)] : [])
      );
      for (const remedial of lesson.remedials ?? []) {
        expect(mainPrompts.has(normalized(remedial.check.widget.prompt)), `${lesson.id}: copied remedial`).toBe(false);
      }
    }
  });

  it("keeps the challenge distinct and uses at least two question jobs per lesson", () => {
    for (const lesson of lessons) {
      const checks = lesson.steps.filter((step) => step.kind === "check" && step.widget);
      const challenge = lesson.steps.find((step) => step.kind === "challenge")!;
      expect(challenge.widget, `${lesson.id}: missing challenge widget`).toBeDefined();
      expect(checks.some((step) => normalized(step.widget!.prompt) === normalized(challenge.widget!.prompt)),
        `${lesson.id}: challenge repeats a check`).toBe(false);

      const jobs = new Set(
        [...checks, challenge].flatMap((step) => step.widget ? [questionJob(step.widget.prompt)] : [])
      );
      expect(jobs.size, `${lesson.id}: one repeated question job`).toBeGreaterThanOrEqual(2);
    }
  });

  it("keeps every modified widget mathematically and structurally valid", () => {
    for (const lesson of lessons) {
      const widgets = lesson.steps.flatMap((step) => step.widget ? [step.widget] : []);
      widgets.push(...(lesson.remedials ?? []).map((remedial) => remedial.check.widget));
      for (const widget of widgets) {
        const parsed = WidgetSpec.parse(widget) as TWidget;
        expect(widgetIntegrityErrors(parsed), `${lesson.id}: ${widget.prompt}`).toEqual([]);
      }
    }
  });
});
