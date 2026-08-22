import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "../components/figureIds";
import { FIGURES } from "../components/figures";
import { evaluate } from "./evaluate";
import { factFamilyKey } from "./factFluency";
import { G3_FLUENCY_GENERATORS } from "./g3FluencyVariants";
import { Lesson, WidgetSpec } from "./schema";

type RawStep = { id: string; kind: string; body?: string; narration?: string; figure?: string; widget?: unknown };
type RawLesson = { id: string; steps: RawStep[]; remedials?: Array<{ concept?: RawStep; check?: RawStep }> };
type Generated = { widget: { type: string; prompt: string; answer: number; commonErrors?: Array<{ value: number; feedback: string }> }; answer: number; params?: Record<string, number | string> };

const dir = join(process.cwd(), "content", "courses", "division-fluency-g3", "lessons");
const lessons = readdirSync(dir).filter((name) => name.endsWith(".json")).sort().map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const generator = G3_FLUENCY_GENERATORS.find((entry) => entry.tag === "g3-div-fluency")!;
const normalized = (prompt: string) => prompt.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();
const rand = (values: number[]) => {
  let index = 0;
  return () => values[index++] ?? values.at(-1) ?? 0;
};
const generateSpecial = (n: number, self: boolean): Generated => {
  const pickN = (n - 2 + 0.1) / 11;
  return generator.gen(rand([pickN, self ? 0.75 : 0.25]), "core", "DivSpecialNumeric") as Generated;
};
const specialTruthErrors = (variant: Generated, n: number): string[] => {
  const errors: string[] = [];
  if (variant.params?.factFamily !== factFamilyKey(1, n)) errors.push("wrong fact-family");
  const zeroFeedback = variant.widget.commonErrors?.find((entry) => entry.value === 0)?.feedback ?? "";
  if (!zeroFeedback.includes("0 ÷ 0 is undefined")) errors.push("missing zero-domain truth");
  if (/unless the number itself is zero/i.test(zeroFeedback)) errors.push("implies zero self-division");
  return errors;
};

describe("S254 division-fluency-g3 follow-on closure", () => {
  it("exhaustively binds every generated special-division fact to truthful domain feedback and 1×n mastery", () => {
    for (let n = 2; n <= 12; n += 1) {
      const self = generateSpecial(n, true);
      expect(self.widget.prompt).toBe(`${n} ÷ ${n} = ?`);
      expect(self.answer).toBe(1);
      expect(specialTruthErrors(self, n), `self division n=${n}`).toEqual([]);
      expect(evaluate(WidgetSpec.parse(self.widget), self.answer).correct).toBe(true);

      const byOne = generateSpecial(n, false);
      expect(byOne.widget.prompt).toBe(`${n} ÷ 1 = ?`);
      expect(byOne.answer).toBe(n);
      expect(byOne.params?.factFamily).toBe(factFamilyKey(1, n));
    }
  });

  it("kills both historical DivSpecialNumeric mutants", () => {
    for (let n = 2; n <= 12; n += 1) {
      const valid = generateSpecial(n, true);
      const familyMutant = structuredClone(valid);
      familyMutant.params = { ...familyMutant.params, factFamily: factFamilyKey(n, n) };
      expect(specialTruthErrors(familyMutant, n)).toContain("wrong fact-family");

      const feedbackMutant = structuredClone(valid);
      const zeroError = feedbackMutant.widget.commonErrors!.find((entry) => entry.value === 0)!;
      zeroError.feedback = "A number divided by itself is never zero unless the number itself is zero.";
      expect(specialTruthErrors(feedbackMutant, n)).toEqual(expect.arrayContaining(["missing zero-domain truth", "implies zero self-division"]));
    }
  });

  it("gives all 12 remedials a rendered semantic figure and a nonrepeated graded job", () => {
    expect(lessons).toHaveLength(12);
    for (const raw of lessons) {
      Lesson.parse(raw);
      const route = raw.remedials?.[0];
      expect(route?.concept?.figure, raw.id).toBeTruthy();
      const id = route!.concept!.figure!;
      expect(FIGURE_IDS.has(id), `${raw.id}/${id}`).toBe(true);
      const Figure = FIGURES[id];
      expect(Figure).toBeDefined();
      const markup = renderToStaticMarkup(Figure());
      expect(markup).toContain("<title>");
      expect(markup).toContain('role="img"');
      expect(route!.concept!.body).toBe(route!.concept!.narration);

      const remedial = WidgetSpec.parse(route!.check!.widget);
      const main = raw.steps.filter((entry) => entry.widget).map((entry) => WidgetSpec.parse(entry.widget));
      expect(main.some((widget) => widget.prompt === remedial.prompt), `${raw.id}: exact prompt`).toBe(false);
      expect(main.some((widget) => normalized(widget.prompt) === normalized(remedial.prompt)), `${raw.id}: normalized prompt`).toBe(false);
      expect(main.some((widget) => JSON.stringify(widget) === JSON.stringify(remedial)), `${raw.id}: payload`).toBe(false);
      if (remedial.type === "numeric") expect(evaluate(remedial, remedial.answer).correct).toBe(true);
      if (remedial.type === "mcq") {
        const correct = remedial.options.filter((option) => option.correct);
        expect(correct).toHaveLength(1);
        expect(evaluate(remedial, correct[0]!.id).correct).toBe(true);
      }
    }
  });

  it("uses direct Grade 3 stems and repaired specialized division visuals", () => {
    const allPrompts = lessons.flatMap((lesson) => [
      ...lesson.steps.filter((entry) => entry.widget).map((entry) => WidgetSpec.parse(entry.widget).prompt),
      ...(lesson.remedials ?? []).flatMap((route) => route.check?.widget ? [WidgetSpec.parse(route.check.widget).prompt] : []),
    ]);
    expect(allPrompts.join("\n")).not.toMatch(/Model a second case, then verify it:|Use an inverse multiplication fact to solve:|Retrieve without the array:|Transfer to a final case:/);

    const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));
    const figures = (id: string) => byId.get(id)!.steps.filter((entry) => entry.kind === "concept").map((entry) => entry.figure);
    expect(figures("df3-02-01")).toEqual(["mult3-missing-factor-8x9", "mult3-divide-by-nine"]);
    expect(figures("df3-02-02")).toEqual(["mult3-divide-by-ten", "mult3-divide-by-ten"]);
    expect(figures("df3-03-01")).toEqual(["mult3-divide-one-self", "mult3-divide-one-self"]);
    expect(figures("df3-03-02")).toEqual(["mult3-divide-by-zero", "mult3-divide-by-zero"]);

    const zero = byId.get("df3-03-02")!;
    expect(["i1", "i2"].map((id) => WidgetSpec.parse(zero.steps.find((entry) => entry.id === id)!.widget).type)).toEqual(["mcq", "mcq"]);
    const remedial = WidgetSpec.parse(zero.remedials![0]!.check!.widget);
    expect(remedial.type).toBe("mcq");
    if (remedial.type === "mcq") {
      const lengths = remedial.options.map((option) => option.label.length);
      expect(Math.max(...lengths) - Math.min(...lengths)).toBeLessThanOrEqual(5);
    }
  });
});
