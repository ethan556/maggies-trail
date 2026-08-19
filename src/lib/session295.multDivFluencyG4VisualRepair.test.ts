import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURES } from "../components/figures";
import { isFigureTextAligned } from "./figureTextAlignment";

type Step = { id: string; body?: string; narration?: string; figure?: string; widget?: unknown };
type Lesson = { id: string; courseId: string; steps: Step[] };
const dir = path.join(process.cwd(), "content", "courses", "mult-div-fluency-g4", "lessons");
const repairs = [
  ["g4m-01-03", "c1", "dop-standard-algo", "A standard algorithm multiplies one place at a time. Regroup a full bundle into the next place before continuing."],
  ["g4m-01-03", "c2", "dop-partial-products", "An area model splits a factor by place value. The partial products from every region combine to make the product."],
  ["g4m-01-04", "c1", "dop-standard-algo", "Regrouping trades a full bundle into the next place. Include that trade before multiplying the next place."],
  ["g4m-01-04", "c2", "pv4-carry-chain", "Regrouping trades a full bundle from one place to the next. Include every trade in the next place before finishing the product."],
  ["g4m-01-05", "c2", "mb-break-area", "An area model breaks apart multiplication by place value. The partial products from every region combine to make the product."],
  ["g4m-01-06", "c2", "dop-partial-products", "Partial products make each area region visible. Add every region to make the full product."],
  ["g4m-02-03", "c2", "pv4-ladder", "A place-value ladder keeps columns ordered by powers of ten. Dividing a number shares each place-value unit into equal groups."],
  ["g4m-03-01", "c1", "dop-estimate-quotient", "Compatible numbers make a quotient easier to estimate. Compare the estimate with the exact quotient to check its size."],
  ["g4m-03-02", "c1", "mb-remainder", "When objects are shared equally, anything left over is the remainder. The quotient tells how many are in each full group."],
  ["g4m-03-03", "c2", "mb-remainder", "When objects are shared equally, anything left over is the remainder. The context tells whether to report it, keep it, or use another whole group."],
] as const;

async function lesson(id: string) { return JSON.parse(await readFile(path.join(dir, `${id}.json`), "utf8")) as Lesson; }
function step(current: Lesson, id: string) { const found = current.steps.find((candidate) => candidate.id === id); if (!found) throw new Error(`${current.id}/${id} missing`); return found; }

describe("S295 Multiply/Divide Fluency Grade 4 visual repair", () => {
  it("retains all ten registered figures with evaluator-safe, guard-aligned structural explanations", async () => {
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
      expect(current.courseId).toBe("mult-div-fluency-g4");
    }
  });
});
