// @vitest-environment jsdom
/**
 * S329 — CL-P1-012 targeted regression: distributionCompareLab's judge-mode gap/overlap
 * evidence bracket vs. its own text labels.
 *
 * widgets.labelCollision.s237.test.tsx's DCL suite only checks TEXT-vs-TEXT collisions
 * (scanTextBoxes/collisions). The bug here was TEXT-vs-SHAPE: the gap bracket is three <line>
 * elements (two ticks + a bar), not <text>, so that model cannot see it. This file scans the
 * CURRENT authored corpus for every distributionCompareLab judge-mode step (mirroring S238
 * batch 8's own disk-scan pattern in widgets.labelCollision.s237.test.tsx), renders each at
 * error/info tone (the only tones that draw the bracket), and Liang-Barsky-intersects the
 * bracket's three segments against every evidence text box in the SVG — so this regresses
 * against every authored gapUnits value, not just the two synthetic cases the DCL_CASES suite
 * hand-picks. See reports/closure/S329_CLOSURE_CL2.md for the full before/after numbers.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render } from "@testing-library/react";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, type TWidget } from "@/lib/schema";
import { scanTextBoxes, type TextBox } from "./textBoxes.testkit";

/** Liang-Barsky segment-vs-axis-aligned-box intersection (parametric t in [0,1] on both axes). */
function segmentHitsBox(p0: [number, number], p1: [number, number], box: TextBox): boolean {
  let t0 = 0;
  let t1 = 1;
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const clip = (p: number, q: number) => {
    if (p === 0) return q >= 0;
    const r = q / p;
    if (p < 0) {
      if (r > t1) return false;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return false;
      if (r < t1) t1 = r;
    }
    return true;
  };
  return (
    clip(-dx, p0[0] - box.x0) &&
    clip(dx, box.x1 - p0[0]) &&
    clip(-dy, p0[1] - box.y0) &&
    clip(dy, box.y1 - p0[1])
  );
}

type LessonStep = { id: string; widget?: Record<string, unknown> };
type LessonFile = {
  id: string;
  steps: LessonStep[];
  remedials?: Array<{ check?: LessonStep; concept?: LessonStep }>;
};

describe("widgets.tsx — CL-P1-012 distributionCompareLab judge bracket (S329)", () => {
  it("the gap-evidence bracket never crosses a text label, for every authored judge-mode step", () => {
    const courses = join(process.cwd(), "content", "courses");
    let judgeSteps = 0;
    for (const course of readdirSync(courses)) {
      const dir = join(courses, course, "lessons");
      if (!existsSync(dir)) continue;
      for (const f of readdirSync(dir)) {
        if (!f.endsWith(".json")) continue;
        const lesson = JSON.parse(readFileSync(join(dir, f), "utf8")) as LessonFile;
        const all: LessonStep[] = [
          ...lesson.steps,
          ...(lesson.remedials ?? [])
            .flatMap((r) => [r.check, r.concept])
            .filter((s): s is LessonStep => Boolean(s))
        ];
        for (const step of all) {
          if (step.widget?.type !== "distributionCompareLab" || step.widget?.mode !== "judge") continue;
          judgeSteps++;
          for (const tone of ["error", "info"] as const) {
            const spec = WidgetSpec.parse(step.widget) as TWidget;
            const { container } = render(
              <WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} tone={tone} />
            );
            const svg = container.querySelector("svg")!;
            const where = `${lesson.id}/${step.id} [${tone}]`;
            const evidence = svg.querySelector('[data-testid="dcl-evidence"]');
            expect(evidence, `${where}: no dcl-evidence group`).toBeTruthy();
            const lines = Array.from(evidence!.querySelectorAll("line")).map((l) => ({
              p0: [Number(l.getAttribute("x1")), Number(l.getAttribute("y1"))] as [number, number],
              p1: [Number(l.getAttribute("x2")), Number(l.getAttribute("y2"))] as [number, number]
            }));
            expect(lines.length, `${where}: bracket line count (2 ticks + 1 bar)`).toBe(3);
            const evidenceTexts = Array.from(evidence!.querySelectorAll("text")).map(
              (t) => (t.textContent ?? "").trim()
            );
            expect(evidenceTexts.length, `${where}: gap + overlap labels`).toBe(2);
            const { boxes } = scanTextBoxes(svg);
            const evidenceBoxes = boxes.filter((b) => evidenceTexts.includes(b.text));
            expect(evidenceBoxes.length, `${where}: both evidence labels modelled`).toBe(2);
            for (const { p0, p1 } of lines) {
              for (const b of evidenceBoxes) {
                expect(
                  segmentHitsBox(p0, p1, b),
                  `${where}: bracket segment [${p0}]-[${p1}] crosses "${b.text}"`
                ).toBe(false);
              }
            }
            cleanup();
          }
        }
      }
    }
    // Not an exact pin (this is a geometry gate, not a census) — just a floor proving the scan
    // actually reached the real corpus. S329 counted 10 across sp-02-01/sp-02-02/sp-02-03/si-03-03.
    expect(judgeSteps, "authored distributionCompareLab judge-mode step count").toBeGreaterThanOrEqual(10);
  }, 60_000);
});
