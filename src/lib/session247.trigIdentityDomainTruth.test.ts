import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { lintLesson } from "./pedagogy";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

type RawStep = {
  id: string;
  body?: string;
  explanationVariants?: string[];
  hints?: string[];
  takeaways?: string[];
  predict?: { prompt?: string; reveal?: string };
  widget?: unknown;
};

type RawLesson = {
  id: string;
  steps: RawStep[];
  remedials?: Array<{ concept?: RawStep; check?: RawStep }>;
};

const readLesson = (lessonId: string): RawLesson =>
  JSON.parse(
    readFileSync(
      join(
        process.cwd(),
        "content",
        "courses",
        "trig-identities-equations",
        "lessons",
        `${lessonId}.json`,
      ),
      "utf8",
    ),
  ) as RawLesson;

const ti0203 = readLesson("ti-02-03");
const ti0403 = readLesson("ti-04-03");

const step = (lesson: RawLesson, id: string) => {
  const result = lesson.steps.find((candidate) => candidate.id === id);
  if (!result) throw new Error(`Missing ${lesson.id}/${id}`);
  return result;
};

const allStrings = (value: unknown): string[] => {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(allStrings);
  if (value && typeof value === "object")
    return Object.values(value).flatMap(allStrings);
  return [];
};

const learnerText = (value: unknown) => allStrings(value).join(" ");

const allLessonSteps = (lesson: RawLesson): RawStep[] => [
  ...lesson.steps,
  ...(lesson.remedials ?? []).flatMap((remedial) =>
    [remedial.concept, remedial.check].filter(
      (candidate): candidate is RawStep => Boolean(candidate),
    ),
  ),
];

const expectEveryOptionFeedbackToContain = (
  lesson: RawLesson,
  stepId: string,
  needle: string,
) => {
  const candidate = step(lesson, stepId);
  const widget = candidate.widget as
    { options?: Array<{ feedback?: string }> } | undefined;
  const feedback = widget?.options?.map((option) => option.feedback) ?? [];
  expect(feedback.length).toBeGreaterThan(0);
  for (const message of feedback) expect(message).toContain(needle);
};

const EPSILON = 1e-10;
const quotient = (numerator: number, denominator: number) =>
  Math.abs(denominator) < EPSILON ? undefined : numerator / denominator;

describe("S247 trigonometric cancellation domain truth", () => {
  it("keeps both scoped lessons schema-valid, widget-integral, and pedagogy-clean", () => {
    for (const raw of [ti0203, ti0403]) {
      const parsed = Lesson.parse(raw);
      expect(lintLesson(parsed)).toEqual([]);
      for (const candidate of allLessonSteps(raw)) {
        if (!candidate.widget) continue;
        const widget = WidgetSpec.parse(candidate.widget);
        expect(
          widgetIntegrityErrors(widget),
          `${raw.id}/${candidate.id}`,
        ).toEqual([]);
      }
    }
  });

  it("states and preserves every ti-02-03 cancellation domain", () => {
    expect(learnerText(step(ti0203, "c1"))).toContain("common domain");
    expect(learnerText(step(ti0203, "i1"))).toContain("cos θ ≠ 0");
    expect(learnerText(step(ti0203, "i1"))).toContain("remains undefined");

    for (const id of ["k1"]) {
      expect(learnerText(step(ti0203, id))).toContain("cos θ ≠ 0");
      expect(learnerText(step(ti0203, id))).toContain("remain excluded");
      expectEveryOptionFeedbackToContain(ti0203, id, "cos θ = 0");
    }

    expect(learnerText(step(ti0203, "c2"))).toContain("sin θ ≠ 0");
    expect(learnerText(step(ti0203, "c2"))).toContain(
      "original quotient is undefined",
    );

    const secTan = learnerText(step(ti0203, "k2"));
    expect(secTan).toContain("sin θ ≠ 0");
    expect(secTan).toContain("cos θ ≠ 0");
    expectEveryOptionFeedbackToContain(ti0203, "k2", "sin θ ≠ 0");
    expectEveryOptionFeedbackToContain(ti0203, "k2", "cos θ ≠ 0");

    const numericCheck = learnerText(step(ti0203, "k3"));
    expect(numericCheck).toContain("common domain");
    expect(numericCheck).toContain("excluded inputs remain excluded");

    const cotProof = learnerText(step(ti0203, "ch1"));
    expect(cotProof).toContain("sin θ ≠ 0");
    expect(cotProof).toContain("remain excluded");

    const recap = learnerText(step(ti0203, "r1"));
    expect(recap).toContain("Cancel only a factor known to be nonzero");
    expect(recap).toContain("cannot remove domain restrictions");

    const remedial = learnerText(ti0203.remedials);
    expect(remedial).toContain("common domain cos θ ≠ 0");
    expect(remedial).toContain("original product is undefined");
  });

  it("states and preserves every ti-04-03 quotient domain without losing equation roots", () => {
    const opening = learnerText(step(ti0403, "c1"));
    expect(opening).toContain("common domain sin θ ≠ 0");
    expect(opening).toContain("original quotient is undefined");

    const interactive = learnerText(step(ti0403, "i1"));
    expect(interactive).toContain("common domain sin θ ≠ 0");
    expect(interactive).toContain("remain excluded");

    const ratio = learnerText(step(ti0403, "k1"));
    expect(ratio).toContain("common domain cos θ ≠ 0");
    expect(ratio).toContain("original quotient");
    expectEveryOptionFeedbackToContain(ti0403, "k1", "remain excluded");

    const equationStep = learnerText(step(ti0403, "k1c"));
    expect(equationStep).toContain("never divide by sin x");
    expect(equationStep).toContain("sinx = 0");

    expect(learnerText(step(ti0403, "r1"))).toContain(
      "excluded values remain excluded",
    );

    const remedial = learnerText(ti0403.remedials);
    expect(remedial).toContain("common domain cos θ − sin θ ≠ 0");
    expect(remedial).toContain("θ = π/4 + kπ");
    expect(remedial).toContain("original quotient is undefined");
  });

  it("keeps the double-angle quotient restriction visible and diagnoses the 4.19 challenge error truthfully", () => {
    const challenge = step(ti0403, "ch1");
    const widget = challenge.widget as { commonErrors?: Array<{ value: number; feedback: string }> };
    const feedback = widget.commonErrors?.find((entry) => entry.value === 4.19)?.feedback ?? "";
    expect(feedback).toContain("counts only one");
    expect(feedback).toContain("2π/3 and 4π/3");
    expect(feedback).toContain("2π ≈ 6.28");
    expect(feedback).not.toContain("4.19 ≈ 2π/3 + 4π/3");

    const source = readFileSync(join(process.cwd(), "src", "components", "figures.tsx"), "utf8");
    const figure = source.slice(source.indexOf("function TiDoubleProve()"), source.indexOf("function TiExpandMixed()"));
    expect(figure).toContain("only where sin θ ≠ 0");
    expect(figure).toContain("Inputs where sine theta is zero remain excluded");
  });
  it("rejects the former unrestricted-cancellation claim", () => {
    const scopedText = learnerText([ti0203, ti0403]);
    expect(scopedText).not.toMatch(/cancelled anywhere/i);
    expect(scopedText).not.toMatch(/cancell?ation is legal for every θ/i);
  });

  it("independently evaluates excluded original inputs, including shared undefined points", () => {
    const halfPi = Math.PI / 2;
    const quarterPi = Math.PI / 4;
    const excludedCases = [
      {
        name: "tan θ · cos θ at π/2",
        original: quotient(Math.sin(halfPi), Math.cos(halfPi)),
        reduced: Math.sin(halfPi),
      },
      {
        name: "(1 − cos²θ)/sin θ at 0",
        original: quotient(1 - Math.cos(0) ** 2, Math.sin(0)),
        reduced: Math.sin(0),
      },
      {
        name: "(sec²θ − 1)/tan θ at 0",
        original: quotient((1 / Math.cos(0)) ** 2 - 1, Math.tan(0)),
        reduced: Math.tan(0),
      },
      {
        name: "(sec²θ − 1)/tan θ at π/2",
        reducedDefined: false,
        original: quotient(1, Math.cos(halfPi)),
        reduced: quotient(Math.sin(halfPi), Math.cos(halfPi)),
      },
      {
        name: "cot θ · sin θ at 0",
        original: quotient(Math.cos(0), Math.sin(0)),
        reduced: Math.cos(0),
      },
      {
        name: "sec θ · cos θ at π/2",
        original: quotient(1, Math.cos(halfPi)),
        reduced: 1,
      },
      {
        name: "sin 2θ/sin θ at 0",
        original: quotient(Math.sin(0), Math.sin(0)),
        reduced: 2 * Math.cos(0),
      },
      {
        name: "sin 2θ/cos θ at π/2",
        original: quotient(Math.sin(2 * halfPi), Math.cos(halfPi)),
        reduced: 2 * Math.sin(halfPi),
      },
      {
        name: "cos 2θ/(cos θ − sin θ) at π/4",
        original: quotient(
          Math.cos(2 * quarterPi),
          Math.cos(quarterPi) - Math.sin(quarterPi),
        ),
        reduced: Math.cos(quarterPi) + Math.sin(quarterPi),
      },
    ];

    for (const candidate of excludedCases) {
      expect(candidate.original, candidate.name).toBeUndefined();
      expect(Number.isFinite(candidate.reduced), candidate.name).toBe(
        "reducedDefined" in candidate ? candidate.reducedDefined : true,
      );
    }
  });
});
