import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "../components/figures";

type ConceptStep = { id: string; kind: string; figure?: string; body?: string; narration?: string };
type RawLesson = { id: string; steps: ConceptStep[] };

const courseDirectory = join(process.cwd(), "content", "courses", "fractions-deeper-g3", "lessons");
const sourceContracts = [
  {
    lessonId: "g3f-01-03",
    stepId: "c1",
    figure: "frac-three-fourths",
    body: "The bar is split into four equal pieces, and three are shaded: 3/4. Each shaded piece is one unit fourth.",
    figureTitle: "Three fourths shaded.",
    nonCopyHash: "78d18bfb5c8507fc2e1acac2f7e96194249d62c388a0bbff570b07ef49ef6358",
  },
  {
    lessonId: "g3f-01-05",
    stepId: "c2",
    figure: "mc-ruler-eighths",
    body: "This ruler marks 6/8, which is the same length as 3/4. Count the six equal jumps from zero to the marked tick.",
    figureTitle: "Reading eighths: 6/8 = 3/4 inch.",
    nonCopyHash: "e6f62bd8f55678b6b2771a05b4f5e77361ecfeef611c0e4d40bdffc8efafe1e6",
  },
  {
    lessonId: "g3f-02-01",
    stepId: "c2",
    figure: "frac-numline-unit",
    body: "This fourths line marks 1/4 after one equal jump from zero. On any fraction line, count equal spaces rather than tick marks.",
    figureTitle: "Locating one fourth on the number line.",
    nonCopyHash: "e242ad02c59d410c84d1bcc319314fe8e39c200fa472c206408a37a45d4b6f11",
  },
  {
    lessonId: "g3f-02-02",
    stepId: "c1",
    figure: "thirds-compare",
    body: "Halves, thirds, and fourths cut the same whole into more equal pieces. More equal pieces make each piece smaller.",
    figureTitle: "Three identical circles split into halves, thirds, and fourths, showing that more equal parts makes each piece smaller.",
    nonCopyHash: "4b8dc11b070db6ad28490b2b2bb4dd9599b126dd7d7b016c9a5948f602a769ec",
  },
] as const;

const readLesson = (lessonId: string) => JSON.parse(readFileSync(join(courseDirectory, `${lessonId}.json`), "utf8")) as RawLesson;
const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

describe("S299 fractions-deeper-g3 fixed-figure copy synchronization", () => {
  it("keeps all 14 course lessons available for the broader integrity suite", () => {
    expect(readdirSync(courseDirectory).filter((file) => file.endsWith(".json")).sort()).toHaveLength(14);
  });

  it("aligns each repaired narration with its fixed rendered figure and preserves every other lesson field", () => {
    for (const contract of sourceContracts) {
      const lesson = readLesson(contract.lessonId);
      const step = lesson.steps.find((candidate) => candidate.id === contract.stepId);
      expect(step, `${contract.lessonId}/${contract.stepId}`).toMatchObject({ kind: "concept", figure: contract.figure });
      expect(step?.body).toBe(contract.body);
      expect(step?.narration).toBe(contract.body);

      const copy = structuredClone(lesson);
      const copiedStep = copy.steps.find((candidate) => candidate.id === contract.stepId)!;
      delete copiedStep.body;
      delete copiedStep.narration;
      expect(sha256(JSON.stringify(copy)), `${contract.lessonId}: evaluator, option, and figure contract`).toBe(contract.nonCopyHash);

      const Figure = FIGURES[contract.figure];
      expect(Figure, contract.figure).toBeDefined();
      const markup = renderToStaticMarkup(Figure());
      expect(markup).toContain('role="img"');
      expect(markup).toContain(`<title>${contract.figureTitle}</title>`);
    }
  });
});
