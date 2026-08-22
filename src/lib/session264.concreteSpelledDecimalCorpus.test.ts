import { readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { describe, expect, it } from "vitest";
import { lintLesson } from "./pedagogy";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

const DIGIT = "zero|one|two|three|four|five|six|seven|eight|nine";
const INTEGER_WORD = `${DIGIT}|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand`;
const SPELLED_DECIMAL_SOURCE = `\\b(?:negative\\s+)?(?:${INTEGER_WORD})(?:[-\\s]+(?:and\\s+)?(?:${INTEGER_WORD}))*\\s+point\\s+(?:${DIGIT})(?:[-\\s]+(?:${DIGIT}))*\\b`;
const READ_ALOUD_CUE_RE = /(?:^\s*(?:read|say|pronounce)\s+(?!(?:whether|if|which|what|how)\b)|\b(?:read|say|pronounce)(?:ing|s|ed)?\b[^.!?]{0,40}\b(?:aloud|in words|as)\b|\b(?:spoken|word) (?:form|name)\b|\bis (?:read|said|pronounced|called)\b)/i;

type Finding = { file: string; pointer: string; sentence: string; literal: string; readAloudTeaching: boolean };
type RawStep = { id: string; body?: string; narration?: string; widget?: unknown };
type RawLesson = { id: string; courseId: string; steps: RawStep[]; remedials?: Array<{ conceptTag: string; concept: RawStep; check: RawStep }> };

function lessonFiles() {
  const root = join(process.cwd(), "content", "courses");
  return readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isDirectory()).flatMap((course) => {
    const dir = join(root, course.name, "lessons");
    try {
      return readdirSync(dir).filter((name) => name.endsWith(".json")).map((name) => join(dir, name));
    } catch {
      return [];
    }
  }).sort();
}

function findingsIn(value: unknown, file: string, pointer = "$", found: Finding[] = []) {
  if (typeof value === "string") {
    for (const sentence of value.split(/(?<=[.!?])\s+/)) {
      for (const match of sentence.matchAll(new RegExp(SPELLED_DECIMAL_SOURCE, "gi"))) {
        found.push({ file, pointer, sentence, literal: match[0], readAloudTeaching: READ_ALOUD_CUE_RE.test(sentence) });
      }
    }
  } else if (Array.isArray(value)) {
    value.forEach((child, index) => findingsIn(child, file, `${pointer}[${index}]`, found));
  } else if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, child]) => findingsIn(child, file, `${pointer}.${key}`, found));
  }
  return found;
}

const files = lessonFiles();
const lessons = files.map((file) => ({ file, lesson: JSON.parse(readFileSync(file, "utf8")) as RawLesson }));
const byId = Object.fromEntries(lessons.map(({ lesson }) => [lesson.id, lesson]));
const step = (lessonId: string, stepId: string) => byId[lessonId]!.steps.find((candidate) => candidate.id === stepId)!;

describe("S264 concrete spelled-decimal corpus contract", () => {
  it("detects concrete multiword decimals without confusing procedural uses of point", () => {
    const regex = () => new RegExp(SPELLED_DECIMAL_SOURCE, "gi");
    expect("zero point five".match(regex())).toEqual(["zero point five"]);
    expect("negative twelve point zero five".match(regex())).toEqual(["negative twelve point zero five"]);
    expect("one hundred and two point nine".match(regex())).toEqual(["one hundred and two point nine"]);
    expect("Place the point one spot to the left.".match(regex())).toBeNull();
    expect("The decimal point counts places.".match(regex())).toBeNull();
  });

  it("permits only exact sentences explicitly teaching a spoken decimal name", () => {
    expect(READ_ALOUD_CUE_RE.test("Read zero point five aloud.")).toBe(true);
    expect(READ_ALOUD_CUE_RE.test("The number is read as zero point five.")).toBe(true);
    expect(READ_ALOUD_CUE_RE.test("Its spoken form is zero point five.")).toBe(true);
    expect(READ_ALOUD_CUE_RE.test("Say whether zero point five is greater.")).toBe(false);
    expect(READ_ALOUD_CUE_RE.test("Use zero point five in the equation.")).toBe(false);
  });

  it("scans every learner lesson and leaves no unsafe concrete spelled-decimal quantity", () => {
    expect(files).toHaveLength(1701);
    const findings = lessons.flatMap(({ file, lesson }) => findingsIn(lesson, basename(file)));
    const unsafe = findings.filter((finding) => !finding.readAloudTeaching);
    expect(unsafe, JSON.stringify(unsafe, null, 2)).toEqual([]);
    expect(findings.every((finding) => finding.readAloudTeaching)).toBe(true);
  });

  it("uses numeric notation in all seven repaired learner-visible fields", () => {
    const dg4 = byId["dg4-01-02"]!;
    const dg4Concept = step("dg4-01-02", "c2");
    const dg4Remedial = dg4.remedials!.find((candidate) => candidate.conceptTag === "g4d-write-tenth")!.concept;
    for (const value of [dg4Concept.body, dg4Concept.narration, dg4Remedial.body, dg4Remedial.narration]) {
      expect(value).toMatch(/^0\.5, 0\.9/);
      expect(value).not.toMatch(new RegExp(SPELLED_DECIMAL_SOURCE, "i"));
    }

    const alg1 = byId["alg1-02-03"]!;
    const narrations = [
      step("alg1-02-03", "c1").narration,
      step("alg1-02-03", "c2").narration,
      alg1.remedials!.find((candidate) => candidate.conceptTag === "decimal-eq")!.concept.narration,
    ];
    expect(narrations[0]).toContain("0.5x + 1.2 = 3.7");
    expect(narrations[1]).toContain("0.2x + 3 = 4");
    expect(narrations[2]).toContain("0.5x = 3");
    expect(narrations.join(" ")).not.toMatch(new RegExp(SPELLED_DECIMAL_SOURCE, "i"));
  });

  it("keeps both touched lessons pedagogy-clean and all evaluator specs intact", () => {
    for (const lessonId of ["dg4-01-02", "alg1-02-03"]) {
      const raw = byId[lessonId]!;
      expect(lintLesson(Lesson.parse(raw)), lessonId).toEqual([]);
      const surfaces = [...raw.steps, ...(raw.remedials ?? []).flatMap((route) => [route.concept, route.check])];
      for (const candidate of surfaces) if (candidate.widget) {
        expect(widgetIntegrityErrors(WidgetSpec.parse(candidate.widget)), `${lessonId}/${candidate.id}`).toEqual([]);
      }
    }
  });
});
