import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";
import { WidgetSpec } from "./schema";
import { variantForGenForm } from "./variants";

const require2 = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { solvePrompt: solveG0Prompt } = require2("./g0Independent.cjs");

const BANDS = ["support", "core", "stretch"] as const;
const SEEDS = 200;

const generate = (tag: string, form: string, band: typeof BANDS[number], seed: number) => {
  const variant = variantForGenForm(tag, form, `g0-language-${form}-${band}-${seed}`, band);
  expect(variant, `${form}/${band}/${seed}`).toBeDefined();
  return WidgetSpec.parse(variant!.widget);
};

describe("Grade K generated question language", () => {
  it("uses positive joining and separating actions, with no filler MCQ options", () => {
    const correctPositions = new Set<number>();
    for (const form of ["countAddMcq", "countSubtractMcq"] as const) {
      for (const band of BANDS) {
        for (let seed = 1; seed <= SEEDS; seed++) {
          const widget = generate("g0-counting", form, band, seed);
          expect(widget.type).toBe("mcq");
          if (widget.type !== "mcq") continue;

          expect(widget.prompt).not.toMatch(/\b(?:land|lands|join|joins|give|gives) (?:away )?0\b/i);
          expect(widget.prompt).not.toMatch(/\b0 (?:birds?|stickers?)\b/i);
          expect(widget.options).toHaveLength(4);
          expect(widget.options.map((option) => option.label), widget.prompt).not.toContain("A different choice");
          expect(widget.options.map((option) => option.label), widget.prompt).not.toContain("There is not enough information");
          expect(new Set(widget.options.map((option) => option.label)).size).toBe(widget.options.length);
          expect(widget.options.every((option) => /^\d+$/.test(option.label))).toBe(true);
          correctPositions.add(widget.options.findIndex((option) => option.correct));
        }
      }
    }
    expect(correctPositions).toEqual(new Set([0, 1, 2, 3]));
  });

  it("keeps singular nouns and action verbs in agreement across story forms", () => {
    const forms = [
      "KoaFingersNumeric", "KoaDrawingsNumeric", "KoaActOutNumeric", "KoaWriteAddMcq",
      "KoaTakeAwayNumeric", "KoaSubDrawingsNumeric", "KoaSubActOutNumeric", "KoaWriteSubMcq",
      "KoaHowManyLeftNumeric", "KoaAddToStoryNumeric", "KoaTakeFromStoryNumeric",
      "KoaChooseOpMcq", "KoaModelStoryMcq",
    ] as const;
    const pluralAfterOne = /\b1 (?:birds|stickers|fingers|circles|children|cookies|frogs|cats|ducks|balloons|apples|blocks|leaves|stars|bears)\b/i;
    const bareSingularVerb = /\b1 (?:more )?(?:bird|child|frog|cat|duck) (?:land|join|go|hop|jump|swim|fly)\b/i;

    for (const form of forms) {
      for (const band of BANDS) {
        for (let seed = 1; seed <= SEEDS; seed++) {
          const widget = generate("k0-add-subtract", form, band, seed);
          const optionCopy = widget.type === "mcq" ? widget.options.map((option) => option.label).join(" ") : "";
          const learnerCopy = `${widget.prompt} ${optionCopy}`;
          expect(learnerCopy, `${form}/${band}/${seed}`).not.toMatch(pluralAfterOne);
          expect(learnerCopy, `${form}/${band}/${seed}`).not.toMatch(bareSingularVerb);
        }
      }
    }
  });

  it("names the actor in basket stories and keeps operation choices parallel", () => {
    for (const form of ["KoaAddToStoryNumeric", "KoaTakeFromStoryNumeric", "KoaChooseOpMcq"] as const) {
      for (const band of BANDS) {
        for (let seed = 1; seed <= SEEDS; seed++) {
          const widget = generate("k0-add-subtract", form, band, seed);
          expect(widget.prompt).not.toMatch(/\bsomeone\b/i);
          if (form !== "KoaChooseOpMcq") {
            expect(widget.prompt).toMatch(/^Maya has \d+/);
          } else {
            expect(widget.type).toBe("mcq");
            if (widget.type === "mcq") {
              expect(widget.options.every((option) => /group/i.test(option.label))).toBe(true);
            }
          }
        }
      }
    }
  });

  it("uses singular counter wording in the stretch three-colour branch", () => {
    let threeColourDraws = 0;
    for (let seed = 1; seed <= SEEDS; seed++) {
      const widget = generate("g0-counting", "countAddMcq", "stretch", seed);
      if (widget.type !== "mcq" || !widget.prompt.startsWith("A jar has")) continue;
      threeColourDraws++;
      const learnerCopy = [widget.prompt, ...widget.options.map((option) => option.feedback)].join(" ");
      expect(learnerCopy, widget.prompt).not.toMatch(/\b1 (?:red|blue|green) counters\b/i);
      const amounts = widget.prompt.match(/(\d+) red counters?, (\d+) blue counters?, and (\d+) green counters?/i);
      expect(amounts, widget.prompt).not.toBeNull();
      const expected = Number(amounts![1]) + Number(amounts![2]) + Number(amounts![3]);
      expect(widget.options.find((option) => option.correct)?.label).toBe(String(expected));
      expect(solveG0Prompt("countAddMcq", `${widget.prompt}||${widget.options.map((option) => option.label).join(";;")}`)).toBe(String(expected));
    }
    expect(threeColourDraws).toBeGreaterThan(0);
  });

  it("never removes more cats than the story starts with", () => {
    for (const band of BANDS) {
      for (let seed = 1; seed <= SEEDS; seed++) {
        const widget = generate("k0-add-subtract", "KoaModelStoryMcq", band, seed);
        expect(widget.type).toBe("mcq");
        const amounts = widget.prompt.match(/^"(\d+) cats? sit on a wall\. (\d+) cats? jumps?/i);
        expect(amounts, widget.prompt).not.toBeNull();
        expect(Number(amounts![2]), widget.prompt).toBeLessThan(Number(amounts![1]));
      }
    }
  });
});
