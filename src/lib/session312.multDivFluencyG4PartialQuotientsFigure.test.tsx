import { createElement } from "react";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "../components/figureIds";
import { FIGURES } from "../components/figures";
import { FIGURE_NUMERIC_CLAIMS } from "./figureNumericClaims.generated";
import { compareExactFigureNumericParity } from "./figureNumericParity";
import { isFigureTextAligned } from "./figureTextAlignment";

type Option = { id: string; correct?: boolean };
type Step = { id: string; kind?: string; figure?: string; body?: string; narration?: string; widget?: { type?: string; target?: number; options?: Option[] } };
type Lesson = { id: string; courseId: string; steps: Step[] };

const FIGURE = "g4m-partial-quotients-852-4";
const CLAIM = "852 ÷ 4 = 213; 200 × 4 = 800; 852 − 800 = 52; 13 × 4 = 52; 200 + 13 = 213";
const BODY = "The partial-quotients model for 852 ÷ 4 removes 200 groups of 4 (800), leaving 52. Then 13 groups of 4 remove the rest. The partial quotients 200 + 13 make the quotient 213.";
const ARIA = "Partial quotients for 852 divided by 4: 200 groups of 4 make 800, leaving 52; 13 groups of 4 make 52, leaving 0; 200 plus 13 equals 213.";
const lessonPath = path.join(process.cwd(), "content", "courses", "mult-div-fluency-g4", "lessons", "g4m-02-04.json");

async function lesson(): Promise<Lesson> { return JSON.parse(await readFile(lessonPath, "utf8")) as Lesson; }
function step(current: Lesson, id: string): Step { const found = current.steps.find((candidate) => candidate.id === id); if (!found) throw new Error(`${current.id}/${id} missing`); return found; }
function rgb(hex: string): [number, number, number] { return [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16)) as [number, number, number]; }
function luminance(hex: string): number { return rgb(hex).map((channel) => { const value = channel / 255; return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4; }).reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0); }
function contrast(foreground: string, background: string): number { const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a); return (light + 0.05) / (dark + 0.05); }
function blend(foreground: string, background: string, opacity: number): string { const [fr, fg, fb] = rgb(foreground), [br, bg, bb] = rgb(background); return `#${[fr, fg, fb].map((value, index) => Math.round(value * opacity + [br, bg, bb][index] * (1 - opacity)).toString(16).padStart(2, "0")).join("")}`; }

describe("S312 Grade 4 partial-quotients visual", () => {
  it("registers an SSR-safe, high-contrast exact representation with an equivalent accessible narrative", () => {
    expect(FIGURE_IDS.has(FIGURE)).toBe(true);
    const Component = FIGURES[FIGURE];
    expect(Component).toBeDefined();
    const markup = renderToStaticMarkup(createElement(Component));
    expect(markup).toContain(`aria-label="${ARIA}"`);
    expect(markup).toContain(`<title>Partial quotients: ${CLAIM}.</title>`);
    for (const label of ["852 ÷ 4", "Step 1: 200 groups", "200 × 4 = 800", "852 − 800 = 52 left", "Step 2: 13 groups", "13 × 4 = 52", "52 − 52 = 0 left", "partial quotients: 200 + 13 = 213"]) expect(markup).toContain(label);
    const textTags = [...markup.matchAll(/<text\b[^>]*>/g)].map((match) => match[0]);
    expect(textTags).toHaveLength(8);
for (const tag of textTags) expect(tag).toContain('fill="#22314F"');
    for (const background of ["#FFFFFF", blend("#2E7CD6", "#FFFFFF", 0.14), blend("#2FA36B", "#FFFFFF", 0.14)]) expect(contrast("#22314F", background)).toBeGreaterThanOrEqual(4.5);
  });

  it("binds only the matching concept while preserving the existing learner task and evaluator truth", async () => {
    const current = await lesson();
    const concept = step(current, "c1");
    expect(current.courseId).toBe("mult-div-fluency-g4");
    expect(concept).toMatchObject({ kind: "concept", figure: FIGURE, body: BODY, narration: BODY });
    expect(FIGURE_NUMERIC_CLAIMS[FIGURE]).toBe(CLAIM);
    expect(compareExactFigureNumericParity(CLAIM, BODY).aligned).toBe(true);
    expect(isFigureTextAligned(FIGURE, BODY)).toBe(true);

    const estimate = step(current, "i1").widget;
    expect(estimate).toMatchObject({ type: "estimateSlider", target: 213 });
    for (const checkId of ["k1", "k3"]) {
      const options = step(current, checkId).widget?.options ?? [];
      expect(options.filter((option) => option.correct).map((option) => option.id)).toEqual(["o0"]);
    }
  });
});