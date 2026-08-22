// @vitest-environment jsdom
/**
 * S317 Lane A — figure truth fixes (fractions fr-04-01/02/04, conditional-probability
 * cpr-03-03/cpr-05-01). Owner: src/components/figures.tsx.
 *
 * Verifies:
 *  1. The 5 touched lesson JSON files parse cleanly.
 *  2. The two new additive, parameterized figure components (registered as new figure
 *     IDs, not edits to the shared exemplars fr-04-03 depends on) render an accessible
 *     <title> that carries the lesson's own worked numbers.
 *  3. Every touched (figureId, step-body) binding recomputes as NOT withheld via the
 *     repo's own `figureTextAlignment` module (the same function LessonPlayer/FigureView
 *     gate rendering on) — i.e. this is the "small node script" the S317 packet asked
 *     for, run as a vitest assertion instead of an ad hoc script.
 *  4. The cpr-03-03/c1 fix specifically: its new binding key differs from the legacy
 *     blocklisted fingerprint "0dc18745" and is not itself present in the generated
 *     blocklist — proof the withhold clears without hand-editing the blocklist.
 *  5. fr-04-03 (read-only dependency: its own c1/c2 still bind the original shared
 *     exemplars, untouched by this packet) keeps rendering aligned.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "./figures";
import { FIGURE_IDS } from "./figureIds";
import { figureTextBindingKey, isFigureTextAligned } from "@/lib/figureTextAlignment";
import { FIGURE_TEXT_MISMATCH_BLOCKLIST } from "@/lib/figureTextMismatchBlocklist.generated";

const ROOT = process.cwd();

type Step = { id: string; body?: string; figure?: string };
type Lesson = { id: string; steps: Step[] };

function loadLesson(courseDir: string, lessonId: string): Lesson {
  const path = join(ROOT, "content", "courses", courseDir, "lessons", `${lessonId}.json`);
  const raw = readFileSync(path, "utf8");
  return JSON.parse(raw) as Lesson; // throws (fails the test) on any parse error
}

function step(lesson: Lesson, stepId: string): Step {
  const found = lesson.steps.find((s) => s.id === stepId);
  if (!found) throw new Error(`${lesson.id}: no step "${stepId}"`);
  return found;
}

function titleAndAria(id: string): string {
  const figure = FIGURES[id];
  expect(figure, `figure "${id}" must be registered in FIGURES`).toBeTruthy();
  const svg = renderToStaticMarkup(figure());
  const title = svg.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const aria = svg.match(/aria-label="([^"]+)"/i)?.[1] ?? "";
  return `${title} ${aria}`;
}

describe("S317 lesson JSON parse-check (touched files)", () => {
  const touched: Array<[string, string]> = [
    ["fractions", "fr-04-01"],
    ["fractions", "fr-04-02"],
    ["fractions", "fr-04-03"],
    ["fractions", "fr-04-04"],
    ["conditional-probability", "cpr-03-03"],
    ["conditional-probability", "cpr-05-01"],
  ];
  it.each(touched)("%s/%s parses as valid JSON with an id and steps array", (courseDir, lessonId) => {
    const lesson = loadLesson(courseDir, lessonId);
    expect(lesson.id).toBe(lessonId);
    expect(Array.isArray(lesson.steps)).toBe(true);
    expect(lesson.steps.length).toBeGreaterThan(0);
  });
});

describe("fr-04-01: new frac-compare-same-denom-cake figure", () => {
  it("is registered in both FIGURES and the synchronous FIGURE_IDS gate", () => {
    expect(FIGURE_IDS.has("frac-compare-same-denom-cake")).toBe(true);
    expect(FIGURES["frac-compare-same-denom-cake"]).toBeTruthy();
  });

  it("renders a title/aria that states the lesson's own 3/8 vs 5/8 cake example", () => {
    const text = titleAndAria("frac-compare-same-denom-cake");
    expect(text).toMatch(/3\/8/);
    expect(text).toMatch(/5\/8/);
    expect(text.toLowerCase()).toMatch(/cake/);
  });

  it("does not mutate the original frac-compare-same-denom exemplar (fr-04-03's figure)", () => {
    const text = titleAndAria("frac-compare-same-denom").toLowerCase();
    expect(text).toMatch(/two fifths/);
    expect(text).toMatch(/three fifths/);
  });

  it("c1 now binds the new figure and the binding is not withheld", () => {
    const lesson = loadLesson("fractions", "fr-04-01");
    const c1 = step(lesson, "c1");
    expect(c1.figure).toBe("frac-compare-same-denom-cake");
    expect(c1.body).toMatch(/5\/8/);
    expect(c1.body).toMatch(/3\/8/);
    expect(isFigureTextAligned(c1.figure!, c1.body ?? "")).toBe(true);
  });

  it("c2 keeps the original generic exemplar, still aligned (unaffected by the fix)", () => {
    const lesson = loadLesson("fractions", "fr-04-01");
    const c2 = step(lesson, "c2");
    expect(c2.figure).toBe("frac-compare-same-denom");
    expect(isFigureTextAligned(c2.figure!, c2.body ?? "")).toBe(true);
  });
});

describe("fr-04-02: new frac-compare-same-numer-brownies figure", () => {
  it("is registered in both FIGURES and the synchronous FIGURE_IDS gate", () => {
    expect(FIGURE_IDS.has("frac-compare-same-numer-brownies")).toBe(true);
    expect(FIGURES["frac-compare-same-numer-brownies"]).toBeTruthy();
  });

  it("renders a title/aria that states the lesson's own 2/3 vs 2/8 example", () => {
    const text = titleAndAria("frac-compare-same-numer-brownies");
    expect(text).toMatch(/2\/3/);
    expect(text).toMatch(/2\/8/);
  });

  it("does not mutate the original frac-compare-same-numer exemplar (fr-04-03's figure)", () => {
    const text = titleAndAria("frac-compare-same-numer").toLowerCase();
    expect(text).toMatch(/split in three/);
    expect(text).toMatch(/split in four/);
  });

  it("c1 now binds the new figure and the binding is not withheld", () => {
    const lesson = loadLesson("fractions", "fr-04-02");
    const c1 = step(lesson, "c1");
    expect(c1.figure).toBe("frac-compare-same-numer-brownies");
    expect(c1.body).toMatch(/2\/3/);
    expect(c1.body).toMatch(/2\/8/);
    expect(isFigureTextAligned(c1.figure!, c1.body ?? "")).toBe(true);
  });

  it("c2 keeps the original generic exemplar, still aligned (unaffected by the fix)", () => {
    const lesson = loadLesson("fractions", "fr-04-02");
    const c2 = step(lesson, "c2");
    expect(c2.figure).toBe("frac-compare-same-numer");
    expect(isFigureTextAligned(c2.figure!, c2.body ?? "")).toBe(true);
  });
});

describe("fr-04-03: read-only dependency, untouched by this packet", () => {
  it("still binds the original shared exemplars, still aligned", () => {
    const lesson = loadLesson("fractions", "fr-04-03");
    const c1 = step(lesson, "c1");
    const c2 = step(lesson, "c2");
    expect(c1.figure).toBe("frac-compare-same-numer");
    expect(c2.figure).toBe("frac-compare-same-numer");
    expect(isFigureTextAligned(c1.figure!, c1.body ?? "")).toBe(true);
    expect(isFigureTextAligned(c2.figure!, c2.body ?? "")).toBe(true);
  });
});

describe("fr-04-04: c1 prose realigned to what frac-compare-wholes actually teaches", () => {
  it("c1 now names the same fraction (1/2) on two differently sized wholes, matching the figure", () => {
    const lesson = loadLesson("fractions", "fr-04-04");
    const c1 = step(lesson, "c1");
    expect(c1.figure).toBe("frac-compare-wholes");
    expect(c1.body).toMatch(/1\/2 of a blueberry/);
    expect(c1.body).toMatch(/1\/2 of a watermelon/);
    expect(isFigureTextAligned(c1.figure!, c1.body ?? "")).toBe(true);
  });

  it("rem-sw-k option-length parity is closed to <=15 chars, correct option and answer unchanged", () => {
    const lesson = loadLesson("fractions", "fr-04-04") as unknown as {
      remedials: Array<{ check: { id: string; widget: { options: Array<{ id: string; label: string; correct?: boolean }> } } }>;
    };
    const remCheck = lesson.remedials[0].check;
    expect(remCheck.id).toBe("rem-sw-k");
    const options = remCheck.widget.options;
    const correct = options.find((o) => o.correct);
    expect(correct?.id).toBe("a");
    expect(correct?.label).toBe("Not fairly — the wholes are different sizes");
    const lengths = options.map((o) => o.label.length);
    const spread = Math.max(...lengths) - Math.min(...lengths);
    expect(spread).toBeLessThanOrEqual(15);
  });
});

describe("cpr-03-03: c1 legitimately clears the cpr-multiplication-area withhold", () => {
  const LEGACY_BLOCKED_KEY = "0dc18745";

  it("the legacy blocklisted fingerprint is still present in the generated blocklist (untouched by hand)", () => {
    expect(FIGURE_TEXT_MISMATCH_BLOCKLIST.has(LEGACY_BLOCKED_KEY)).toBe(true);
  });

  it("c1's current (figureId, body) binding key differs from the legacy blocklisted fingerprint", () => {
    const lesson = loadLesson("conditional-probability", "cpr-03-03");
    const c1 = step(lesson, "c1");
    expect(c1.figure).toBe("cpr-multiplication-area");
    const key = figureTextBindingKey(c1.figure!, c1.body ?? "");
    expect(key).not.toBe(LEGACY_BLOCKED_KEY);
  });

  it("c1's current binding key is not itself present anywhere in the generated blocklist", () => {
    const lesson = loadLesson("conditional-probability", "cpr-03-03");
    const c1 = step(lesson, "c1");
    const key = figureTextBindingKey(c1.figure!, c1.body ?? "");
    expect(FIGURE_TEXT_MISMATCH_BLOCKLIST.has(key)).toBe(false);
  });

  it("c1 now renders (isFigureTextAligned is true) and preserves the exact 0.5 x 0.4 = 0.20 worked example", () => {
    const lesson = loadLesson("conditional-probability", "cpr-03-03");
    const c1 = step(lesson, "c1");
    expect(c1.body).toMatch(/0\.5 × 0\.4 = 0\.20/);
    expect(isFigureTextAligned(c1.figure!, c1.body ?? "")).toBe(true);
  });

  it("the remedial rc1 (generic reuse of the same figure) stays aligned, unaffected by the c1 fix", () => {
    const lesson = loadLesson("conditional-probability", "cpr-03-03") as unknown as {
      remedials: Array<{ concept: { figure?: string; body?: string } }>;
    };
    const rc1 = lesson.remedials[0].concept;
    expect(rc1.figure).toBe("cpr-multiplication-area");
    expect(isFigureTextAligned(rc1.figure!, rc1.body ?? "")).toBe(true);
  });

  it("the figure component itself is untouched: still renders the half/two-fifths=0.2 bus/sport area model", () => {
    const text = titleAndAria("cpr-multiplication-area").toLowerCase();
    expect(text).toMatch(/half its width/);
    expect(text).toMatch(/two fifths/);
    expect(text).toMatch(/0\.2\b/);
    expect(text).toMatch(/bus/);
  });
});

describe("cpr-05-01: c2 restates the figure's fixed 5/4/3/60 values", () => {
  it("c2 now names the figure's exact fixed values while keeping the n!/nPk generalization", () => {
    const lesson = loadLesson("conditional-probability", "cpr-05-01");
    const c2 = step(lesson, "c2");
    expect(c2.figure).toBe("cpr-permutation-slots");
    for (const value of ["5", "4", "3", "60"]) {
      expect(c2.body, `c2 body must restate the figure's fixed value ${value}`).toMatch(
        new RegExp(`\\b${value}\\b`)
      );
    }
    expect(c2.body).toMatch(/n!/);
    expect(c2.body).toMatch(/nPk/);
    expect(isFigureTextAligned(c2.figure!, c2.body ?? "")).toBe(true);
  });

  it("c1 (the original, already-aligned binding) is unaffected by the c2 fix", () => {
    const lesson = loadLesson("conditional-probability", "cpr-05-01");
    const c1 = step(lesson, "c1");
    expect(c1.figure).toBe("cpr-permutation-slots");
    expect(isFigureTextAligned(c1.figure!, c1.body ?? "")).toBe(true);
  });

  it("the figure component itself is untouched: still renders the fixed 5/4/3/60 podium claim", () => {
    const text = titleAndAria("cpr-permutation-slots");
    expect(text).toMatch(/5/);
    expect(text).toMatch(/60/);
    expect(text.toLowerCase()).toMatch(/podium/);
  });
});
