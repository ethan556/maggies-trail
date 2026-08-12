// @vitest-environment jsdom
// OPT-IN CORPUS MEASUREMENT (S238) — the sweep S237 ran but never committed. Renders every
// authored widget spec at value=null across three tones, scans text boxes with the S237 testkit
// model, and rewrites COWORK_CACHE/label-collision-remainder-s238.csv. Not a gate — it counts,
// it does not fail on collisions — and it is SKIPPED unless COLLISION_SWEEP=1 (77s of renders):
//   COLLISION_SWEEP=1 npx vitest run src/components/collisionSweep.s238.test.tsx
import { describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, type TWidget } from "@/lib/schema";
import { collisions, describeCollision, scanTextBoxes } from "./textBoxes.testkit";

describe.skipIf(!process.env.COLLISION_SWEEP)("S238 corpus collision sweep", () => {
  it("measures every authored spec x 3 tones", () => {
    const courses = join(process.cwd(), "content", "courses");
    const rows: string[] = ["widget_type,lesson,step,tone,pairs,detail"];
    const perEngine = new Map<string, number>();
    let specs = 0, rendersFailed = 0, skippedTexts = 0;
    for (const course of readdirSync(courses)) {
      const dir = join(courses, course, "lessons");
      if (!existsSync(dir)) continue;
      for (const f of readdirSync(dir)) {
        if (!f.endsWith(".json")) continue;
        const lesson = JSON.parse(readFileSync(join(dir, f), "utf8")) as {
          id: string;
          steps: Array<{ id: string; widget?: Record<string, unknown> }>;
          remedials?: Array<{ check?: { id: string; widget?: Record<string, unknown> }; concept?: { id: string; widget?: Record<string, unknown> } }>;
        };
        const all = [...lesson.steps, ...(lesson.remedials ?? []).flatMap((r) => [r.check, r.concept]).filter((s): s is NonNullable<typeof s> => Boolean(s))];
        for (const step of all) {
          const w = step.widget;
          if (!w?.type) continue;
          specs++;
          for (const tone of ["neutral", "error", "info"] as const) {
            let spec: TWidget;
            try { spec = WidgetSpec.parse(w) as TWidget; } catch { rendersFailed++; continue; }
            try {
              const { container } = render(
                <WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} tone={tone} />
              );
              for (const svg of Array.from(container.querySelectorAll("svg"))) {
                const { boxes, skipped } = scanTextBoxes(svg);
                skippedTexts += skipped.filter((s) => !s.includes("non-translate transform")).length;
                const hits = collisions(boxes);
                if (hits.length > 0) {
                  perEngine.set(String(w.type), (perEngine.get(String(w.type)) ?? 0) + hits.length);
                  rows.push([w.type, lesson.id, step.id, tone, hits.length,
                    JSON.stringify(hits.slice(0, 3).map(describeCollision).join(" | "))].join(","));
                }
              }
            } catch { rendersFailed++; }
            cleanup();
          }
        }
      }
    }
    rows.push("");
    rows.push("# per-engine totals (colliding pairs across all specs x 3 tones)");
    for (const [eng, n] of [...perEngine.entries()].sort((a, b) => b[1] - a[1])) rows.push(`# ${eng},${n}`);
    rows.push(`# specs swept: ${specs}; renders failed: ${rendersFailed}; unmodellable texts: ${skippedTexts}`);
    writeFileSync(join(process.cwd(), "COWORK_CACHE", "label-collision-remainder-s238.csv"), rows.join("\n") + "\n");
    expect(specs).toBeGreaterThan(1000);
  }, 1_800_000);
});
