// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { FIGURES } from "./figures";

const AXES: Record<string, number> = {
  "g2l-choice-add-33-20": 4, "g2l-choice-add-44-20": 4, "g2l-choice-add-45-20": 4,
  "g2l-choice-gap-54-34": 4, "g2l-choice-gap-53-33": 4, "g2l-choice-gap-43-33": 4,
  "g2l-read-landing-45-20": 1, "g2l-read-gap-53-33": 1, "g2l-read-missing-jump-33-43": 1,
  "number-line-jumps": 1, "double-number-line": 2, "negative-number-line": 1,
  "solution-ray": 1, "number-line-between-integers": 2, "integer-jump": 1,
  "inequality-flip": 1, "probability-line": 1, "kc-ten-hops-to-100": 1,
  "count-on-hops": 1, "count-on-small": 3, "bigger-first": 2, "count-back-hops": 1,
  "c120-skip-from-7": 1, "as-hops-add": 1, "as-count-back": 1, "as-count-up": 1,
  "rno-same-sign": 1, "rno-opposites-cancel": 1, "rno-change-sign": 1,
  "rno7-add-same-line": 1, "rno7-add-diff-line": 1, "rno7-zero-pair": 1, "rno7-change-line": 1,
};

const DIRECTIONS: Record<string, { count: number; direction?: "left" | "right" }> = {
  "g2l-choice-add-33-20": { count: 5 }, "g2l-choice-add-44-20": { count: 5 }, "g2l-choice-add-45-20": { count: 5 },
  "g2l-choice-gap-54-34": { count: 1, direction: "right" }, "g2l-choice-gap-53-33": { count: 1, direction: "right" }, "g2l-choice-gap-43-33": { count: 1, direction: "right" },
  "g2l-read-landing-45-20": { count: 2, direction: "right" }, "g2l-read-missing-jump-33-43": { count: 1, direction: "right" },
  "number-line-jumps": { count: 3, direction: "right" }, "solution-ray": { count: 1, direction: "right" },
  "integer-jump": { count: 1, direction: "right" }, "inequality-flip": { count: 1, direction: "left" },
  "kc-ten-hops-to-100": { count: 10, direction: "right" }, "count-on-hops": { count: 3, direction: "right" },
  "count-on-small": { count: 6, direction: "right" }, "bigger-first": { count: 11, direction: "right" },
  "count-back-hops": { count: 3, direction: "left" }, "c120-skip-from-7": { count: 4, direction: "right" },
  "as-hops-add": { count: 3, direction: "right" }, "as-count-back": { count: 3, direction: "left" },
  "as-count-up": { count: 4, direction: "right" }, "rno-same-sign": { count: 1, direction: "left" },
  "rno-opposites-cancel": { count: 1, direction: "left" }, "rno-change-sign": { count: 1, direction: "left" },
  "rno7-add-same-line": { count: 2, direction: "left" }, "rno7-add-diff-line": { count: 2 },
  "rno7-zero-pair": { count: 2 }, "rno7-change-line": { count: 1, direction: "left" },
  "md3-elapsed": { count: 2, direction: "right" }, "dd-mad-distances": { count: 4 },
  "tse7-ineq-line": { count: 1, direction: "right" },
};

afterEach(cleanup);

describe("S260 registered/static number-line direction and clipping contract", () => {
  it("renders every classified axis with inset left/right heads and bounded numeric labels", () => {
    const defects: string[] = [];
    for (const [id, expectedAxes] of Object.entries(AXES)) {
      const figure = FIGURES[id];
      if (!figure) { defects.push(`${id}: missing registry entry`); continue; }
      const { container } = render(figure());
      const svg = container.querySelector<SVGSVGElement>("svg[role='img']");
      if (!svg) { defects.push(`${id}: no accessible SVG`); cleanup(); continue; }
      const box = (svg.getAttribute("viewBox") ?? "").split(/\s+/).map(Number);
      const width = box[2] ?? 0, height = box[3] ?? 0;
      const axes = [...svg.querySelectorAll("[data-number-line-axis='continuing']")];
      if (axes.length !== expectedAxes) defects.push(`${id}: ${axes.length}/${expectedAxes} axes`);
      for (const axis of axes) {
        const start = Number(axis.getAttribute("data-axis-start")), end = Number(axis.getAttribute("data-axis-end"));
        if (start < 4 || end > width - 4 || end <= start) defects.push(`${id}: axis clips at ${start}..${end}/${width}`);
        if (axis.querySelectorAll("[data-axis-arrow='left']").length !== 1 || axis.querySelectorAll("[data-axis-arrow='right']").length !== 1) defects.push(`${id}: axis lacks two heads`);
      }
      for (const text of svg.querySelectorAll<SVGTextElement>("text[x][y]")) {
        const content = (text.textContent ?? "").trim();
        if (!/[0-9−-]/.test(content)) continue;
        const x = Number(text.getAttribute("x")), y = Number(text.getAttribute("y"));
        const size = Number(text.getAttribute("font-size") ?? 10);
        const span = content.length * size * 0.72;
        const anchor = text.getAttribute("text-anchor") ?? "start";
        const left = anchor === "middle" ? x - span / 2 : anchor === "end" ? x - span : x;
        const right = anchor === "middle" ? x + span / 2 : anchor === "end" ? x : x + span;
        if (left < -0.5 || right > width + 0.5 || y < size || y > height) defects.push(`${id}: clipped ${JSON.stringify(content)} at ${left.toFixed(1)}..${right.toFixed(1)}, y=${y}`);
      }
      cleanup();
    }
    expect(defects).toEqual([]);
  });

  it("gives every classified hop, change, and ray path an unambiguous direction channel", () => {
    const defects: string[] = [];
    for (const [id, expected] of Object.entries(DIRECTIONS)) {
      const { container } = render(FIGURES[id]!());
      const svg = container.querySelector<SVGSVGElement>("svg[role='img']")!;
      const heads = [...svg.querySelectorAll("[data-number-line-direction]")];
      if (heads.length !== expected.count) defects.push(`${id}: ${heads.length}/${expected.count} direction heads`);
      if (expected.direction && heads.some((head) => head.getAttribute("data-number-line-direction") !== expected.direction)) defects.push(`${id}: direction metadata disagrees with ${expected.direction}`);
      const accessible = `${svg.getAttribute("aria-label") ?? ""} ${svg.querySelector("title")?.textContent ?? ""}`.toLowerCase();
      if (!/(hop|jump|ray|arrow|distance|left|right|forward|back|greater|less|add|subtract|change)/.test(accessible)) defects.push(`${id}: accessible text omits direction/change semantics`);
      if (svg.querySelectorAll("marker[id]").length !== new Set([...svg.querySelectorAll("marker[id]")].map((node) => node.id)).size) defects.push(`${id}: duplicate marker IDs inside SVG`);
      cleanup();
    }
    expect(defects).toEqual([]);
  });
});
