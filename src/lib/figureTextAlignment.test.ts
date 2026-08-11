import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FIXED_EXEMPLAR_FIGURES, isFigureTextAligned } from "./figureTextAlignment";

const COURSES = join(process.cwd(), "content", "courses");
const fixed = new Set<string>(FIXED_EXEMPLAR_FIGURES);

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? files(path) : entry.isFile() && entry.name.endsWith(".json") ? [path] : [];
  });
}

function visit(value: unknown, uses: Array<{ id: string; text: string; aligned: boolean }>): void {
  if (!value || typeof value !== "object") return;
  const record = value as Record<string, unknown>;
  if (typeof record.figure === "string" && fixed.has(record.figure)) {
    const text = [record.title, record.body, record.prompt].filter((part): part is string => typeof part === "string").join(" ");
    uses.push({ id: record.figure, text, aligned: isFigureTextAligned(record.figure, text) });
  }
  for (const [key, child] of Object.entries(record)) {
    if (key === "figure") continue;
    if (Array.isArray(child)) child.forEach((item) => visit(item, uses));
    else visit(child, uses);
  }
}

describe("fixed-example figure and lesson-text alignment", () => {
  it("suppresses every unrelated fixed exemplar across the complete lesson corpus", () => {
    const uses: Array<{ id: string; text: string; aligned: boolean }> = [];
    for (const file of files(COURSES)) visit(JSON.parse(readFileSync(file, "utf8")), uses);
    expect(uses).toHaveLength(954);
    expect(uses.filter((use) => use.aligned)).toHaveLength(12);
    expect(uses.filter((use) => !use.aligned)).toHaveLength(942);
  });

  it("uses the equal-versus-unequal fraction illustration on the reported lesson", () => {
    const lesson = JSON.parse(readFileSync(join(COURSES, "fractions-deeper-g3", "lessons", "g3f-01-01.json"), "utf8"));
    expect(lesson.steps[0].figure).toBe("frac-equal-vs-unequal");
    expect(lesson.steps[3].figure).toBe("frac-equal-vs-unequal");
    expect(lesson.steps[0].body).toContain("Four unequal pieces are not fourths");
    expect(isFigureTextAligned(lesson.steps[0].figure, lesson.steps[0].body)).toBe(true);
  });

  it("rejects thirds copy beside the fixed four-part comparison", () => {
    expect(isFigureTextAligned("frac-equal-vs-unequal", "Three unequal scraps are not thirds.")).toBe(false);
  });
});
