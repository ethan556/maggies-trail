// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { lintLesson } from "@/lib/pedagogy";
import { Lesson } from "@/lib/schema";
import { FIGURES } from "./figures";
import { collisions, describeCollision, scanTextBoxes } from "./textBoxes.testkit";

type Step = {
  id: string;
  body?: string;
  figure?: string;
  widget?: {
    prompt?: string;
    authoredStages?: Array<{ title: string; body: string }>;
    successFeedback?: string;
  };
};

const raw = JSON.parse(readFileSync(join(
  process.cwd(),
  "content",
  "courses",
  "transformations-measurement",
  "lessons",
  "tm-04-01.json",
), "utf8")) as { steps: Step[] };

const step = (id: string) => {
  const found = raw.steps.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`Missing tm-04-01/${id}`);
  return found;
};

const attribute = (tag: string, name: string) => {
  const value = tag.match(new RegExp(`${name}="([^"]+)"`))?.[1];
  if (value === undefined) throw new Error(`Missing ${name} in ${tag}`);
  return value;
};

const points = (tag: string) => attribute(tag, "points").split(" ").map((pair) => {
  const [x, y] = pair.split(",").map(Number);
  if (x === undefined || y === undefined || !Number.isFinite(x) || !Number.isFinite(y)) {
    throw new Error(`Invalid polygon point ${pair}`);
  }
  return [x, y] as const;
});

const squaredDistance = (a: readonly [number, number], b: readonly [number, number]) =>
  (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;

describe("S247 tm-04-01 general Pythagorean rearrangement proof", () => {
  afterEach(cleanup);
  it("keeps the lesson valid and separates one numerical check from the proof", () => {
    const lesson = Lesson.parse(raw);
    expect(lintLesson(lesson)).toEqual([]);
    expect(step("c1").figure).toBe("pythagorean-proof");
    expect(step("c2").figure).toBe("pythagorean-proof");
    expect(step("i1").widget?.prompt).toContain("checks one example");
    expect(step("i1").widget?.authoredStages?.at(-1)?.body).toContain(
      "does not by itself prove the theorem",
    );
    expect(step("i1").widget?.successFeedback).toContain("general rearrangement");
    expect(step("c2").body).toContain("same four congruent right triangles");
    expect(step("c2").body).toContain("Subtracting the same four triangles");
    expect(JSON.stringify(raw)).not.toContain("That area picture is the proof");
  });

  it("renders a self-describing general proof rather than a 3-4-5 exemplar", () => {
    const markup = renderToStaticMarkup(FIGURES["pythagorean-proof"]());
    expect(markup).toContain('role="img"');
    expect(markup).toContain('data-proof="rearrangement"');
    expect(markup).toContain('data-outer-side="a+b"');
    expect(markup).toContain('data-congruent-triangles="4"');
    expect(markup).toContain('data-left-remainder="c²"');
    expect(markup).toContain('data-right-remainder="a²+b²"');
    expect(markup).toMatch(/<title>General rearrangement proof[^<]+<\/title>/);
    expect(markup).toMatch(/<desc>Two equal outer squares[^<]+<\/desc>/);
    const narration = `${markup.match(/aria-label="([^"]+)"/)?.[1] ?? ""} ${markup.match(/<title>([^<]+)<\/title>/)?.[1] ?? ""} ${markup.match(/<desc>([^<]+)<\/desc>/)?.[1] ?? ""}`;
    expect(narration).toContain("same four congruent right triangles");
    expect(narration).toContain("a squared plus b squared equals c squared");
    expect(narration).not.toMatch(/3-4-5|area 9|area 16|area 25/i);
  });

  it("uses two equal true outer squares and eight congruent right triangles", () => {
    const markup = renderToStaticMarkup(FIGURES["pythagorean-proof"]());
    const groups = ["c-squared", "a-squared-plus-b-squared"].map((name) => {
      const body = markup.match(new RegExp(`<g data-arrangement="${name}">([\\s\\S]*?)<\\/g>`))?.[1];
      if (!body) throw new Error(`Missing ${name} arrangement`);
      return body;
    });

    for (const group of groups) {
      const outer = group.match(/<rect[^>]+data-shape="outer-square"[^>]*>/)?.[0];
      if (!outer) throw new Error("Missing outer square");
      expect(Number(attribute(outer, "width"))).toBe(110);
      expect(Number(attribute(outer, "height"))).toBe(110);
      expect(attribute(outer, "data-side")).toBe("a+b");
    }

    const triangleTags = groups.flatMap((group) => [...group.matchAll(/<polygon[^>]+>/g)]
      .map((match) => match[0])
      .filter((tag) => !tag.includes('data-area="c²"')));
    expect(triangleTags).toHaveLength(8);
    for (const tag of triangleTags) {
      const vertices = points(tag);
      expect(vertices).toHaveLength(3);
      const sideSquares = [
        squaredDistance(vertices[0]!, vertices[1]!),
        squaredDistance(vertices[1]!, vertices[2]!),
        squaredDistance(vertices[2]!, vertices[0]!),
      ].sort((a, b) => a - b);
      expect(sideSquares).toEqual([42 ** 2, 68 ** 2, 42 ** 2 + 68 ** 2]);
    }
  });

  it("keeps every visible proof label measurable and collision-free", () => {
    const Figure = FIGURES["pythagorean-proof"];
    const { container } = render(<Figure />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    const scan = scanTextBoxes(svg!);
    expect(scan.skipped).toEqual([]);
    expect(collisions(scan.boxes).map(describeCollision)).toEqual([]);
  });
  it("makes the central c region and the a and b regions genuine squares with equal leftover area", () => {
    const markup = renderToStaticMarkup(FIGURES["pythagorean-proof"]());
    const cTag = markup.match(/<polygon[^>]+data-area="c²"[^>]*>/)?.[0];
    if (!cTag) throw new Error("Missing c-squared region");
    const cVertices = points(cTag);
    expect(cVertices).toHaveLength(4);
    const cSideSquares = cVertices.map((vertex, index) =>
      squaredDistance(vertex, cVertices[(index + 1) % cVertices.length]!),
    );
    expect(new Set(cSideSquares).size).toBe(1);
    for (let index = 0; index < cVertices.length; index += 1) {
      const before = cVertices[(index + cVertices.length - 1) % cVertices.length]!;
      const vertex = cVertices[index]!;
      const after = cVertices[(index + 1) % cVertices.length]!;
      const incoming = [before[0] - vertex[0], before[1] - vertex[1]];
      const outgoing = [after[0] - vertex[0], after[1] - vertex[1]];
      expect(incoming[0]! * outgoing[0]! + incoming[1]! * outgoing[1]!).toBe(0);
    }

    const squareTags = ["a²", "b²"].map((area) => {
      const tag = markup.match(new RegExp(`<rect[^>]+data-area="${area}"[^>]*>`))?.[0];
      if (!tag) throw new Error(`Missing ${area} region`);
      expect(attribute(tag, "width")).toBe(attribute(tag, "height"));
      return tag;
    });
    const a = Number(attribute(squareTags[0]!, "width"));
    const b = Number(attribute(squareTags[1]!, "width"));
    const outer = a + b;
    const remainderAfterFourTriangles = outer ** 2 - 4 * (a * b / 2);
    expect(outer).toBe(110);
    expect(remainderAfterFourTriangles).toBe(a ** 2 + b ** 2);
    expect(cSideSquares[0]).toBe(a ** 2 + b ** 2);
  });
});
