import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURES } from "../components/figures";
import { isFigureTextAligned } from "./figureTextAlignment";

type Option = { id: string; label: string; correct?: boolean };
type Step = { id: string; body?: string; figure?: string; widget?: { type?: string; prompt?: string; answer?: number; options?: Option[] } };
type Lesson = { id: string; courseId: string; steps: Step[]; remedials?: Array<{ concept?: Step; check?: Step }> };
const dir = path.join(process.cwd(), "content", "courses", "place-value-million", "lessons");
const numeric = [["pv2-01-03", "k3", 700000, "A student says the 7 in 719,000 is worth 7. What value should the student report?"], ["pv2-03-01", "k3", 346000, "A student rounds 345,500 down to 345,000 because the check digit is 5. What rounded number is correct?"], ["pv2-03-01", "ch1", 1000000, "A student says 999,600 rounds to 999,000 to the nearest thousand. What rounded number shows the rollover?"], ["pv2-04-03", "k2", 412747, "A student gets 413,747 for 500,203 − 87,456. What difference should replace that result?"]] as const;
async function lesson(id: string) { return JSON.parse(await readFile(path.join(dir, `${id}.json`), "utf8")) as Lesson; }
function step(lesson: Lesson, id: string) { const found = lesson.steps.find((candidate) => candidate.id === id); if (!found) throw new Error(`${lesson.id}/${id} missing`); return found; }

describe("S291 Place Value to Millions repair", () => {
  it("preserves evaluator truth while assigning five root causes distinct jobs", async () => {
    for (const [lessonId, stepId, answer, prompt] of numeric) { const current = step(await lesson(lessonId), stepId); expect(current.widget?.type).toBe("numeric"); expect(current.widget?.answer).toBe(answer); expect(current.widget?.prompt).toBe(prompt); }
    const reading = step(await lesson("pv2-02-02"), "k2"); expect(reading.body).toBe("Repair a silent-zero reading."); expect(reading.widget?.options?.filter((option) => option.correct).map((option) => option.id)).toEqual(["a"]);
    const commas = step(await lesson("pv2-02-03"), "k3"); const options = commas.widget?.options ?? []; expect(options.map((option) => option.id)).toEqual(["a", "b", "c", "d"]); expect(options.filter((option) => option.correct).map((option) => option.id)).toEqual(["a"]); expect(Math.max(...options.map((option) => option.label.length)) - Math.min(...options.map((option) => option.label.length))).toBeLessThanOrEqual(1);
    const chain = step(await lesson("pv2-04-03"), "ch1"); expect(chain.widget?.type).toBe("columnCalc"); expect(chain.widget?.prompt).toContain("missed zero-chain");
  });
  it("retains all 14 course identities and registered, text-aligned figures", async () => {
    const files = (await readdir(dir)).filter((file) => file.endsWith(".json")).sort(); expect(files).toHaveLength(14);
    for (const file of files) { const current = JSON.parse(await readFile(path.join(dir, file), "utf8")) as Lesson; expect(file).toBe(`${current.id}.json`); expect(current.courseId).toBe("place-value-million"); for (const candidate of [...current.steps, ...(current.remedials ?? []).flatMap((remedial) => [remedial.concept, remedial.check])].filter(Boolean) as Step[]) if (candidate.figure) { expect(FIGURES[candidate.figure]).toBeDefined(); expect(isFigureTextAligned(candidate.figure, candidate.body ?? "")).toBe(true); } }
  });
});
