import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURES } from "../components/figures";
import { isFigureTextAligned } from "./figureTextAlignment";

type Step = { id: string; body?: string; narration?: string; figure?: string; widget?: unknown };
type Lesson = { id: string; courseId: string; steps: Step[] };
const dir = path.join(process.cwd(), "content", "courses", "decimal-fluency-g5", "lessons");
const repairs = [
  ["g5d-01-04", "c1", "dpv-trailing-zero", "Zeros to the right of a decimal do not change its value. Use them to align place values before subtracting."],
  ["g5d-01-06", "c1", "dpv-hundredths-grid", "A hundredths grid shows one whole divided into equal hundredths. Equal groups collect the same-sized pieces."],
  ["g5d-01-06", "c2", "dop-count-places", "First multiply the digits. Then count decimal places in both factors to place the decimal in the product."],
  ["g5d-02-01", "c1", "dpv-round-whole", "Round a decimal factor to a nearby whole before estimating the product. Use the estimate to check the product's decimal point."],
  ["g5d-02-01", "c2", "dop-count-places", "After multiplying, compare the product with the estimate. Count decimal places again if the product's point looks misplaced."],
  ["g5d-02-03", "c1", "dop-count-places", "The picture separates two jobs: multiply the digits, then count decimal places to position the product's point."],
  ["g5d-02-04", "c1", "dop-estimate-quotient", "Estimate a decimal quotient with nearby compatible values before dividing. The estimate checks whether the quotient's size makes sense."],
  ["g5d-02-04", "c2", "dpv-hundredths-grid", "Think in hundredths: divide the equal-sized pieces among the groups, then write the quotient as a decimal."],
  ["g5d-02-05", "c2", "dpv-place-names", "Use place names to decide how far each decimal point must move. Shift both numbers equally so the quotient keeps its value."],
  ["g5d-03-01", "c2", "pv4-times10-shift", "A power-of-ten shift moves every digit by the same number of places. Shift dividend and divisor together before dividing."],
  ["g5d-03-02", "c2", "dop-count-places", "Use an estimate to check the decimal placement after you count decimal places in both factors."],
  ["g5d-03-04", "c1", "vm-metric-ladder", "The metric ladder links units by powers of ten. Moving to a smaller metric unit multiplies; moving back divides."],
] as const;

async function lesson(id: string) { return JSON.parse(await readFile(path.join(dir, `${id}.json`), "utf8")) as Lesson; }
function step(current: Lesson, id: string) { const found = current.steps.find((candidate) => candidate.id === id); if (!found) throw new Error(`${current.id}/${id} missing`); return found; }

describe("S294 Decimal Fluency Grade 5 visual repair", () => {
  it("retains all twelve registered figures with only truthful, guard-aligned structural explanations", async () => {
    for (const [lessonId, stepId, figure, body] of repairs) {
      const current = step(await lesson(lessonId), stepId);
      expect(current.figure).toBe(figure);
      expect(current.widget).toBeUndefined();
      expect(current.body).toBe(body);
      expect(current.narration).toBe(body);
      expect(FIGURES[figure]).toBeDefined();
      expect(isFigureTextAligned(figure, body)).toBe(true);
    }
  });

  it("retains all sixteen course identities", async () => {
    const files = (await readdir(dir)).filter((file) => file.endsWith(".json")).sort();
    expect(files).toHaveLength(16);
    for (const file of files) {
      const current = JSON.parse(await readFile(path.join(dir, file), "utf8")) as Lesson;
      expect(file).toBe(`${current.id}.json`);
      expect(current.courseId).toBe("decimal-fluency-g5");
    }
  });
});
