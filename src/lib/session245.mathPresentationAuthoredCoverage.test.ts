import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  lessonAuthoredMathStrings,
  type AuthoredMathCoverage,
} from "../../scripts/audit/math-presentation-authored";

function jsonFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory()
      ? jsonFiles(path)
      : entry.isFile() && path.endsWith(".json")
        ? [path]
        : [];
  });
}

describe("S245 math-presentation authored coverage", () => {
  it("includes learner-visible prose on main and remedial steps with the right render surface", () => {
    const lesson = {
      steps: [
        {
          id: "k1",
          narration: "Narrate x^2.",
          explanationVariants: ["Explain sqrt(9)."],
          takeaways: ["Keep 1/2."],
          teaser: "Next: integral from 0 to 1 of x dx.",
          widget: { type: "numeric", prompt: "Find x^2." },
        },
      ],
      remedials: [
        {
          concept: { id: "rc", body: "Review 1/3." },
          check: {
            id: "rk",
            explanationVariants: ["Because 1/3 is one third."],
            widget: { type: "numeric", prompt: "Enter 1/3." },
          },
        },
      ],
    };
    const result = lessonAuthoredMathStrings(lesson);
    expect(result.coverage).toMatchObject({
      mainSteps: 1,
      remedialSteps: 2,
      explanationVariants: 2,
      takeaways: 1,
      teasers: 1,
      narrations: 1,
    });
    expect(result.strings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          unit: "rc",
          field: "body",
          arithmetic: true,
        }),
        expect.objectContaining({
          unit: "rk",
          field: "explanationVariants[0]",
          arithmetic: true,
        }),
        expect.objectContaining({
          unit: "rk",
          field: "widget.prompt",
          arithmetic: false,
        }),
      ]),
    );
  });

  it("locks the complete current corpus inventory", () => {
    const totals: AuthoredMathCoverage = {
      mainSteps: 0,
      remedialSteps: 0,
      explanationVariants: 0,
      mainExplanationVariants: 0,
      remedialExplanationVariants: 0,
      takeaways: 0,
      teasers: 0,
      narrations: 0,
      mainNarrations: 0,
      remedialNarrations: 0,
      strings: 0,
    };
    for (const file of jsonFiles(join(process.cwd(), "content", "courses"))) {
      const json = JSON.parse(readFileSync(file, "utf8"));
      const lesson = json.lesson ?? json;
      const { coverage } = lessonAuthoredMathStrings(lesson);
      for (const key of Object.keys(totals) as Array<
        keyof AuthoredMathCoverage
      >) {
        totals[key] += coverage[key];
      }
    }

    expect(totals).toMatchObject({
      remedialSteps: 3394,
      explanationVariants: 17154,
      mainExplanationVariants: 13760,
      remedialExplanationVariants: 3394,
      takeaways: 5100,
      teasers: 1701,
      narrations: 1650,
      mainNarrations: 1100,
      remedialNarrations: 550,
    });
    expect(totals.mainSteps).toBeGreaterThan(totals.remedialSteps);
    expect(totals.strings).toBeGreaterThan(50_000);
  });
});
