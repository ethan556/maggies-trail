import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "../components/figureIds";
import { evaluate } from "./evaluate";
import { lintLesson } from "./pedagogy";
import { seededShuffle } from "./prng";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

type RawStep = {
  id: string;
  kind: string;
  body?: string;
  narration?: string;
  figure?: string;
  widget?: unknown;
};

type RawLesson = {
  id: string;
  title: string;
  courseId: string;
  steps: RawStep[];
  remedials?: Array<{ concept?: RawStep; check?: RawStep }>;
};

const lessonDir = join(
  process.cwd(),
  "content",
  "courses",
  "mult-div-fluency-g4",
  "lessons",
);

const lessons = readdirSync(lessonDir)
  .filter((name) => name.endsWith(".json"))
  .sort()
  .map(
    (name) =>
      JSON.parse(readFileSync(join(lessonDir, name), "utf8")) as RawLesson,
  );

const stable = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map(
        (key) =>
          `${JSON.stringify(key)}:${stable((value as Record<string, unknown>)[key])}`,
      )
      .join(",")}}`;
  }
  return JSON.stringify(value);
};

const normalizedPrompt = (prompt: string) =>
  prompt
    .toLowerCase()
    .replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#")
    .replace(/\s+/g, " ");

const allSteps = (lesson: RawLesson): RawStep[] => [
  ...lesson.steps,
  ...(lesson.remedials ?? []).flatMap((remedial) =>
    [remedial.concept, remedial.check].filter(
      (step): step is RawStep => Boolean(step),
    ),
  ),
];

describe("S248 mult-div-fluency-g4 whole-course integrity", () => {
  it("keeps all 16 lessons schema-valid, pedagogy-clean, and widget-integral", () => {
    expect(lessons).toHaveLength(16);
    for (const raw of lessons) {
      expect(raw.courseId).toBe("mult-div-fluency-g4");
      expect(raw.steps.map((step) => step.id)).toEqual([
        "c1",
        "i1",
        "k1",
        "c2",
        "i2",
        "k2",
        "k3",
        "ch1",
        "r1",
      ]);
      const parsed = Lesson.parse(raw);
      expect(lintLesson(parsed), raw.id).toEqual([]);
      for (const step of allSteps(raw)) {
        if (!step.widget) continue;
        const widget = WidgetSpec.parse(step.widget);
        expect(widgetIntegrityErrors(widget), `${raw.id}/${step.id}`).toEqual(
          [],
        );
      }
    }
  });

  it("uses synchronized semantic visuals instead of the generic hop figure", () => {
    const figures = new Set<string>();
    for (const lesson of lessons) {
      const concepts = lesson.steps.filter((step) => step.kind === "concept");
      expect(concepts, lesson.id).toHaveLength(2);
      expect(concepts[0].figure, lesson.id).not.toBe(concepts[1].figure);
      for (const concept of concepts) {
        expect(concept.figure, `${lesson.id}/${concept.id}`).toBeTruthy();
        expect(concept.figure, `${lesson.id}/${concept.id}`).not.toBe(
          "count-on-hops",
        );
        expect(FIGURE_IDS.has(concept.figure!), `${lesson.id}/${concept.id}`).toBe(
          true,
        );
        expect(concept.narration).toBe(concept.body);
        expect(concept.body?.length).toBeGreaterThanOrEqual(80);
        figures.add(concept.figure!);
      }
    }
    expect(figures.size).toBe(13);
  });

  it("closes every live same-sitting repetition signature", () => {
    for (const lesson of lessons) {
      const widgets = lesson.steps
        .filter((step) => step.widget)
        .map((step) => {
          const widget = step.widget as { prompt?: string };
          return {
            id: step.id,
            signature: stable(widget),
            prompt: String(widget.prompt ?? "").trim(),
          };
        });

      expect(new Set(widgets.map((row) => row.signature)).size, lesson.id).toBe(
        widgets.length,
      );
      expect(new Set(widgets.map((row) => row.prompt)).size, lesson.id).toBe(
        widgets.length,
      );
      expect(
        new Set(widgets.map((row) => normalizedPrompt(row.prompt))).size,
        lesson.id,
      ).toBe(widgets.length);

      const i2 = lesson.steps.find((step) => step.id === "i2")!;
      expect(i2.body, lesson.id).toContain("claim");
      expect(
        (i2.widget as { prompt: string }).prompt.toLowerCase(),
        lesson.id,
      ).toContain("claim");
    }
  });

  it("keeps all 19 MCQs cue-resistant, shuffled, and evaluator-true", () => {
    const prompts = new Set<string>();
    let count = 0;
    for (const lesson of lessons) {
      for (const step of lesson.steps) {
        if (!step.widget) continue;
        const widget = WidgetSpec.parse(step.widget);
        if (widget.type !== "mcq") continue;
        count += 1;
        expect(prompts.has(widget.prompt), `${lesson.id}/${step.id}`).toBe(false);
        prompts.add(widget.prompt);
        expect(widget.options.filter((option) => option.correct)).toHaveLength(1);
        expect(widget.options[0].id).toBe("o0");
        expect(widget.options[0].correct).toBe(true);
        expect(new Set(widget.options.map((option) => option.label)).size).toBe(4);
        expect(new Set(widget.options.map((option) => option.feedback)).size).toBe(
          4,
        );

        const lengths = widget.options.map((option) => option.label.length);
        expect(Math.max(...lengths) - Math.min(...lengths)).toBeLessThanOrEqual(
          14,
        );

        for (const option of widget.options) {
          const result = evaluate(widget, option.id);
          expect(result.correct, `${lesson.id}/${step.id}/${option.id}`).toBe(
            option.correct,
          );
          expect(result.feedback).toBe(option.feedback);
        }

        const positions = new Set<number>();
        for (let index = 0; index < 32; index += 1) {
          const seed = `s248:g4m:${lesson.id}:${step.id}:${index}`;
          const first = seededShuffle(widget.options, seed);
          const second = seededShuffle(widget.options, seed);
          expect(first.map((option) => option.id)).toEqual(
            second.map((option) => option.id),
          );
          positions.add(first.findIndex((option) => option.correct));
        }
        expect([...positions].sort()).toEqual([0, 1, 2, 3]);
      }
    }
    expect(count).toBe(19);
  });

  it("preserves answer truth and makes every column result mathematically specific", () => {
    for (const lesson of lessons) {
      for (const step of lesson.steps) {
        if (!step.widget) continue;
        const widget = WidgetSpec.parse(step.widget);
        if (widget.type === "numeric") {
          expect(
            evaluate(widget, widget.answer).correct,
            `${lesson.id}/${step.id}`,
          ).toBe(true);
        }
        if (widget.type === "columnCalc") {
          const expected = widget.a * widget.b;
          expect(widget.op).toBe("multiply");
          expect(widget.successFeedback).toContain(
            `${widget.a} × ${widget.b} = ${expected}`,
          );
          expect(widget.successFeedback).not.toContain("24,681");
          expect(widget.fallbackFeedback).not.toMatch(/Add column/i);
        }
      }
    }
  });

  it("ratchets independent mathematical truth defects", () => {
    const divisionIds = new Set([
      "g4m-02-03",
      "g4m-02-04",
      "g4m-02-05",
      "g4m-03-01",
      "g4m-03-02",
      "g4m-03-03",
      "g4m-03-04",
      "g4m-03-05",
    ]);
    let cmlCount = 0;
    let numericFallbackCount = 0;

    for (const lesson of lessons.filter((candidate) => divisionIds.has(candidate.id))) {
      for (const current of lesson.steps) {
        const cml = (current as RawStep & { cml?: Record<string, unknown> }).cml;
        if (cml) {
          cmlCount += 1;
          const text = JSON.stringify(cml);
          expect(text, `${lesson.id}/${current.id}`).not.toMatch(
            /Split a factor|partial products|reassemble the whole|Adding only some/i,
          );
          expect((cml.representations as string[]).length).toBeGreaterThan(0);
        }
        if (!current.widget) continue;
        const widget = WidgetSpec.parse(current.widget);
        if (widget.type === "numeric") {
          numericFallbackCount += 1;
          expect(widget.fallbackFeedback, `${lesson.id}/${current.id}`).not.toMatch(
            /Split a factor|multiply each part|add every piece/i,
          );
        }
      }
      for (const remedial of lesson.remedials ?? []) {
        if (!remedial.check?.widget) continue;
        const widget = WidgetSpec.parse(remedial.check.widget);
        if (widget.type === "numeric") {
          expect(widget.fallbackFeedback, `${lesson.id}/remedial`).not.toMatch(
            /Split a factor|multiply each part|add every piece/i,
          );
        }
      }
    }
    expect(cmlCount).toBe(48);
    expect(numericFallbackCount).toBe(24);

    const partialQuotients = lessons.find((lesson) => lesson.id === "g4m-02-04")!;
    for (const id of ["i1", "i2"]) {
      const current = partialQuotients.steps.find((candidate) => candidate.id === id)!;
      const widget = WidgetSpec.parse(current.widget);
      expect(widget.type).toBe("estimateSlider");
      if (widget.type !== "estimateSlider") continue;
      expect(widget.prompt).toMatch(/reasonable|estimate/i);
      expect(widget.prompt).not.toMatch(/slide (?:the )?total|test.*213/i);
      expect(widget.successFeedback).toMatch(/broad.*not an exact answer/i);
      /* S319-EARLY-g4m-02-04 replaced i2's duplicate 852÷4 slider with 636÷4 (=159); re-derive the
       * exact quotient from each step's own prompt instead of pinning i1's 213 for both. */
      const division = widget.prompt.match(/(\d[\d,]*) ÷ (\d+)/);
      expect(division, `${partialQuotients.id}/${id}: prompt states its division`).toBeTruthy();
      expect(widget.successFeedback).toContain(
        `exact quotient is ${Number(division![1].replace(/,/g, "")) / Number(division![2])}`,
      );
    }

    const fourDigit = lessons.find((lesson) => lesson.id === "g4m-03-01")!;
    const fourDigitConcept = fourDigit.steps.find((current) => current.id === "c1")!;
    expect(fourDigitConcept.body).toMatch(/quotient easier to estimate/i);
    expect(fourDigitConcept.body).not.toContain("four-digit quotient");

    const remainders = lessons.find((lesson) => lesson.id === "g4m-03-04")!;
    const reveal = (remainders.steps.find((current) => current.id === "i1") as RawStep & {
      predict?: { reveal?: string };
    }).predict?.reveal;
    expect(reveal).toMatch(/nearby friendly/i);
    expect(reveal).not.toMatch(/closest multiple/i);
    expect(JSON.stringify(remainders)).not.toContain("1 hikers");

    const interpret = lessons.find((lesson) => lesson.id === "g4m-03-02")!;
    expect(interpret.steps.find((current) => current.id === "c1")?.body).toMatch(
      /quotient tells how many are in each full group/i,
    );

    const facts = lessons.find((lesson) => lesson.id === "g4m-02-03")!;
    for (const id of ["i1", "i2"]) {
      const widget = WidgetSpec.parse(facts.steps.find((current) => current.id === id)!.widget);
      expect(widget.type).toBe("estimateSlider");
      if (widget.type !== "estimateSlider") continue;
      /* S319-EARLY-g4m-02-03 replaced i2's duplicate 936÷3 slider with 828÷4; re-derive each
       * step's hundreds-per-group truth (hundreds digit ÷ divisor) from its own prompt. */
      const division = widget.prompt.match(/(\d)(\d)(\d) ÷ (\d)/);
      expect(division, `${facts.id}/${id}: prompt states its division`).toBeTruthy();
      expect(widget.lowFeedback).toContain(
        `${Math.floor(Number(division![1]) / Number(division![4]))} hundreds`,
      );
      expect(widget.lowFeedback).not.toMatch(/one hundred per group/i);
    }

    const placeValueLessons = lessons.filter((lesson) =>
      ["g4m-01-01", "g4m-01-03"].includes(lesson.id),
    );
    expect(JSON.stringify(placeValueLessons)).not.toMatch(
      /attach the tens|count every zero|zeros come from|invent or drop a zero|zeros survive|attach only the zeros/i,
    );
    const multiDigit = placeValueLessons.find((lesson) => lesson.id === "g4m-01-03")!;
    for (const id of ["k1", "k2", "ch1"]) {
      const widget = WidgetSpec.parse(multiDigit.steps.find((current) => current.id === id)!.widget);
      expect(widget.type).toBe("numeric");
      if (widget.type !== "numeric") continue;
      expect(widget.fallbackFeedback).toMatch(/tens and ones|partial products/i);
      expect(widget.fallbackFeedback).not.toMatch(/nonzero digits/i);
    }

    const estimateProduct = lessons.find((lesson) => lesson.id === "g4m-02-01")!;
    expect(estimateProduct.steps.find((current) => current.id === "c2")?.body).toContain(
      "product of two two-digit factors",
    );
  });

  it("uses concise Grade 4 directions and specific transfer tasks", () => {
    const learnerText = JSON.stringify(lessons);
    expect(learnerText).not.toMatch(
      /count-on-hops|Try it again|One more, for the road|You did it!|24,681 \+ 13,247/,
    );
    expect(lessons.find((lesson) => lesson.id === "g4m-02-05")?.title).toBe(
      "Three-Digit Division by One Digit",
    );
    expect(lessons.find((lesson) => lesson.id === "g4m-03-01")?.title).toBe(
      "Four-Digit Division by One Digit",
    );

    for (const lesson of lessons) {
      const challenge = lesson.steps.find((step) => step.id === "ch1")!;
      const prompt = String(
        (challenge.widget as { prompt?: string } | undefined)?.prompt ?? "",
      );
      expect(challenge.body).toBe("Solve the transfer challenge.");
      expect(prompt.length, lesson.id).toBeGreaterThan(45);
      expect(prompt.endsWith("?") || prompt.endsWith(".")).toBe(true);
    }
  });
});
