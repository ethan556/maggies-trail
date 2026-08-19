import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURES } from "../components/figures";
import { isFigureTextAligned } from "./figureTextAlignment";

type Option = { id: string; label: string; correct?: boolean };
type Step = { id: string; body?: string; figure?: string; widget?: { type?: string; options?: Option[] } };
type Lesson = { id: string; courseId: string; steps: Step[]; remedials?: Array<{ concept?: Step; check?: Step }> };

const dir = path.join(process.cwd(), "content", "courses", "measurement-data", "lessons");
const choices = [
  ["CHOICE-0167", "md-01-01", "ch1", ["2:20 — the hour and minute hands were swapped.", "4:10 — the hands are in their correct places.", "2:04 — each clock number is one minute.", "4:02 — the short hand sets the minutes."]],
  ["CHOICE-0168", "md-01-01", "k3", ["Halfway between the 7 and 8", "Exactly on the 7 mark", "Exactly on the 6 mark", "Exactly on the 8 mark"]],
  ["CHOICE-0169", "md-01-02", "k3", ["Yes — quarter to 3 is 15 minutes before 3:00.", "No — quarter to 3 is 15 minutes after 3:00.", "No — quarter to 3 is 45 minutes before 3:00.", "No — a quarter-hour has 25 minutes before 3:00."]],
  ["CHOICE-0170", "md-01-03", "k3", ["Hop 25 minutes to 7:00, then add 10 more minutes.", "Subtract 10 from 35 because the clock passes 7:00.", "Count every minute because clocks cannot cross an hour.", "Treat 7:10 as 70 minutes, then subtract 35."]],
  ["CHOICE-0171", "md-03-01", "k3", ["A key lets a few symbols show a large count clearly.", "A key makes every graph harder to read, even with large counts.", "A key stops pictures from showing even one vote clearly.", "A key is only decoration, not part of reading a graph."]],
  ["CHOICE-0172", "md-03-02", "k1", ["Tuesday and Wednesday tie for the most books read.", "Thursday alone had the most books read.", "Monday had more books than Tuesday.", "Every day had the same number of books."]],
  ["CHOICE-0173", "md-03-02", "k3", ["A scale of 10s fits large amounts into fewer grid steps.", "A scale of 10s makes all graph readers confused.", "A scale of 10s cannot show smaller amounts accurately.", "A scale of 10s changes what every bar represents."]],
  ["CHOICE-0174", "md-05-03", "k2", ["The 2-by-8 garden needs 20 units of fence.", "The 4-by-4 garden needs more than 20 units.", "Both gardens need 16 units of fence around their edges.", "Neither garden needs fencing around its edges."]],
] as const;

async function lesson(id: string) { return JSON.parse(await readFile(path.join(dir, `${id}.json`), "utf8")) as Lesson; }
function step(current: Lesson, id: string) { const found = current.steps.find((candidate) => candidate.id === id); if (!found) throw new Error(`${current.id}/${id} missing`); return found; }

describe("S292 Measurement & Data choice-parity repair", () => {
  it("keeps every evaluator and correct option stable while sealing all eight exact label surfaces", async () => {
    for (const [workId, lessonId, stepId, labels] of choices) {
      const current = step(await lesson(lessonId), stepId);
      const options = current.widget?.options ?? [];
      expect(`${workId}:${current.widget?.type}`).toBe(`${workId}:mcq`);
      expect(options.map((option) => option.id)).toEqual(["a", "b", "c", "d"]);
      expect(options.filter((option) => option.correct).map((option) => option.id)).toEqual(["a"]);
      expect(options.map((option) => option.label)).toEqual(labels);
      expect(Math.max(...options.map((option) => option.label.length)) - Math.min(...options.map((option) => option.label.length))).toBeLessThanOrEqual(30);
    }
  });

  it("retains all 17 lesson identities and only registered, text-aligned figure placements", async () => {
    const files = (await readdir(dir)).filter((file) => file.endsWith(".json")).sort();
    expect(files).toHaveLength(17);
    for (const file of files) {
      const current = JSON.parse(await readFile(path.join(dir, file), "utf8")) as Lesson;
      expect(file).toBe(`${current.id}.json`);
      expect(current.courseId).toBe("measurement-data");
      const surfaces = [...current.steps, ...(current.remedials ?? []).flatMap((remedial) => [remedial.concept, remedial.check])].filter((candidate): candidate is Step => Boolean(candidate));
      for (const surface of surfaces) if (surface.figure) {
        expect(FIGURES[surface.figure]).toBeDefined();
        expect(isFigureTextAligned(surface.figure, surface.body ?? "")).toBe(true);
      }
    }
  });
});
