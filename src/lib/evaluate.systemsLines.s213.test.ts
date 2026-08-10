/**
 * SYSTEMS EXPLORE, GRADED AGAINST THE LINES AS EDITED (S213).
 *
 * Part one is the old-path-reduces-literally proof: the pre-change grader is transcribed verbatim
 * and every one of the 5 authored specs is graded by both across its whole value space. Zero diffs.
 *
 * Part two is the new path, on hand-solved systems — including the degenerate ones, where the
 * decision is recorded in `evaluate.ts` beside the code and restated in the tests below.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { evaluate } from "@/lib/evaluate";
import { SystemsExploreSpec, systemsExploreEditErrors, type TWidget } from "@/lib/schema";

/** The grader as it stood before this session: four lines, authored parameters only. */
function preS213(
  spec: { m1: number; b1: number; m2: number; b2: number; successFeedback: string; offLine1Feedback: string; offLine2Feedback: string },
  v: { x: number; y: number } | null
) {
  if (!v || typeof v.x !== "number" || typeof v.y !== "number") return "Place the point, then check.";
  const on1 = v.y === spec.m1 * v.x + spec.b1;
  const on2 = v.y === spec.m2 * v.x + spec.b2;
  if (on1 && on2) return spec.successFeedback;
  if (on1 && !on2) return spec.offLine2Feedback;
  return spec.offLine1Feedback;
}

function authored(): Array<{ file: string; raw: Record<string, unknown> }> {
  const out: Array<{ file: string; raw: Record<string, unknown> }> = [];
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".json")) {
        let j: unknown;
        try { j = JSON.parse(readFileSync(p, "utf8")); } catch { continue; }
        const scan = (n: unknown) => {
          if (!n || typeof n !== "object") return;
          if (Array.isArray(n)) return n.forEach(scan);
          const o = n as Record<string, unknown>;
          if (o.type === "systemsExplore") out.push({ file: p, raw: o });
          for (const k of Object.keys(o)) scan(o[k]);
        };
        scan(j);
      }
    }
  };
  walk("content");
  return out;
}

describe("the authored specs that did NOT opt in are graded by the code they always were", () => {
  const SPECS = authored();

  /**
   * S214 — a NAMED allowlist, not a relaxed count.
   *
   * `se-01-03` legitimately opened its lines (S213), so "no authored spec enables editing" stopped
   * being true. The pin is narrowed rather than loosened: the opted-in set is written out here, so
   * the NEXT lesson to open a line fails this test and has to be added deliberately — which is the
   * whole point of a regression pin over authored content. The old-path claim then applies to
   * everything not on the list, and that list is asserted to be exactly what is on disk.
   */
  const OPTED_IN: readonly string[] = ["content/courses/systems-equations/lessons/se-01-03.json"];
  const classic = SPECS.filter(({ file }) => !OPTED_IN.some((f) => file.endsWith(f)));
  const editable = SPECS.filter(({ file }) => OPTED_IN.some((f) => file.endsWith(f)));

  it("the opted-in set is exactly the one named here, and every other spec is untouched", () => {
    expect(editable.map((e) => e.file.replace(/^.*?content\//, "content/")).sort()).toEqual([...OPTED_IN].sort());
    expect(classic.length).toBe(SPECS.length - OPTED_IN.length);
    expect(classic.length).toBeGreaterThan(0);
    for (const { file, raw } of classic) {
      expect([file, "editLine1" in raw]).toEqual([file, false]);
      expect([file, "editLine2" in raw]).toEqual([file, false]);
    }
    // …and the ones that DID opt in carry the string the integrity gate demands of them
    for (const { file, raw } of editable) {
      expect([file, "editLine1" in raw || "editLine2" in raw]).toEqual([file, true]);
      expect([file, typeof raw.degenerateSystemFeedback]).toEqual([file, "string"]);
    }
  });

  it("no verdict moves for them, over every point on their grids", () => {
    const diffs: string[] = [];
    let checked = 0;
    for (const { file, raw } of classic) {
      const spec = SystemsExploreSpec.parse(raw) as TWidget & { xMin: number; xMax: number; yMin: number; yMax: number };
      for (let x = spec.xMin - 2; x <= spec.xMax + 2; x++) {
        for (let y = spec.yMin - 2; y <= spec.yMax + 2; y++) {
          checked++;
          const now = evaluate(spec, { x, y }).feedback;
          const then = preS213(raw as never, { x, y });
          if (now !== then) diffs.push(`${file} (${x},${y}) then=${then} now=${now}`);
          // A spec that never opted in must ignore a `lines` envelope entirely — a stale or
          // hand-edited value cannot be allowed to move its grading. This is the half a naive gate
          // would get wrong, and it is now asserted only where it is actually the claim.
          const withLines = { x, y, lines: { m1: 99, b1: 99, m2: -99, b2: -99 } };
          const nowL = evaluate(spec, withLines).feedback;
          if (nowL !== then) diffs.push(`${file} (${x},${y}) WITH lines: then=${then} now=${nowL}`);
        }
      }
      expect(evaluate(spec, null).feedback).toBe(preS213(raw as never, null));
      expect(evaluate(spec, { x: 1 } as never).feedback).toBe("Place the point, then check.");
    }
    expect(diffs.slice(0, 5)).toEqual([]);
    expect(checked).toBeGreaterThan(300);
  });

  it("an opted-in spec honours its envelope — which is why it is off the old-path list", () => {
    // The other side of the same coin, asserted rather than assumed: se-01-03 grades against the
    // lines as edited, so it could not have stayed in the sweep above.
    for (const { raw } of editable) {
      const spec = SystemsExploreSpec.parse(raw) as TWidget & { m1: number; b1: number; m2: number; b2: number };
      // move line 1 to y = x + 3 against the authored line 2; solve by hand where they now cross
      const moved = { m1: 1, b1: 3, m2: spec.m2, b2: spec.b2 };
      const xs = (moved.b2 - moved.b1) / (moved.m1 - moved.m2);
      const ys = moved.m1 * xs + moved.b1;
      if (!Number.isInteger(xs)) continue; // only assert where the crossing is a lattice point
      expect(evaluate(spec, { x: xs, y: ys, lines: moved }).correct).toBe(true);
      // and the authored crossing is no longer the answer once the line has moved
      const authoredX = (spec.b2 - spec.b1) / (spec.m1 - spec.m2);
      if (authoredX !== xs) {
        expect(evaluate(spec, { x: authoredX, y: spec.m1 * authoredX + spec.b1, lines: moved }).correct).toBe(false);
      }
    }
  });
});

/* ─────────────────────────── the new path, hand-solved ─────────────────────────── */

const FB = { successFeedback: "S", offLine1Feedback: "OFF1", offLine2Feedback: "OFF2" };
/** Required by `systemsExploreEditErrors` of any spec that opens a line (S212 review, C1b). */
const DEGEN = { degenerateSystemFeedback: "DEGEN" };
const EDIT = { slopeMin: -5, slopeMax: 5, slopeStep: 1, interceptMin: -10, interceptMax: 10, interceptStep: 1, outOfRange: "clamp", offLattice: "snap" };

/** y = 2x − 1 and y = −x + 5 cross where 2x − 1 = −x + 5 → 3x = 6 → x = 2, y = 3. */
const SPEC = SystemsExploreSpec.parse({
  type: "systemsExplore",
  prompt: "Find where the two lines cross.",
  m1: 2, b1: -1, m2: -1, b2: 5,
  xMin: 0, xMax: 6, yMin: 0, yMax: 7,
  ...FB,
  ...DEGEN,
  editLine1: EDIT,
  editLine2: EDIT,
}) as TWidget;

const at = (x: number, y: number, lines?: { m1: number; b1: number; m2: number; b2: number }) =>
  lines ? { x, y, lines } : { x, y };

describe("a moved line moves the answer with it", () => {
  it("without an envelope the authored lines still decide: (2, 3) is the crossing", () => {
    expect(evaluate(SPEC, at(2, 3)).correct).toBe(true);
    expect(evaluate(SPEC, at(3, 5)).correct).toBe(false);
  });

  it("with an envelope the EDITED lines decide, and the old answer stops being one", () => {
    // Line 1 moved to y = x + 1. Now x + 1 = −x + 5 → 2x = 4 → x = 2, y = 3. Same point, by luck.
    const moved = { m1: 1, b1: 1, m2: -1, b2: 5 };
    expect(evaluate(SPEC, at(2, 3, moved)).correct).toBe(true);
    // Line 1 moved to y = x + 3: x + 3 = −x + 5 → 2x = 2 → x = 1, y = 4.
    const moved2 = { m1: 1, b1: 3, m2: -1, b2: 5 };
    expect(evaluate(SPEC, at(1, 4, moved2)).correct).toBe(true);
    // …and the authored crossing is no longer a solution of the system on screen
    expect(evaluate(SPEC, at(2, 3, moved2)).correct).toBe(false);
  });

  it("names which line the point is off, against the edited lines", () => {
    const moved = { m1: 1, b1: 3, m2: -1, b2: 5 }; // crossing (1, 4)
    // (2, 5) is on line 1 (2 + 3 = 5) but not line 2 (−2 + 5 = 3)
    expect(evaluate(SPEC, at(2, 5, moved)).feedback).toBe("OFF2");
    // (2, 3) is on line 2 but not line 1
    expect(evaluate(SPEC, at(2, 3, moved)).feedback).toBe("OFF1");
    // (0, 0) is on neither
    expect(evaluate(SPEC, at(0, 0, moved)).feedback).toBe("OFF1");
  });
});

describe("the degenerate systems — the conservative reading", () => {
  it("PARALLEL: no point can be on both, so nothing is correct", () => {
    // y = 2x − 1 and y = 2x + 4 never meet.
    const parallel = { m1: 2, b1: -1, m2: 2, b2: 4 };
    for (const [x, y] of [[0, -1], [2, 3], [0, 4], [1, 6], [5, 5]]) {
      expect([x, y, evaluate(SPEC, at(x, y, parallel)).correct]).toEqual([x, y, false]);
    }
    // …and it is the AUTHOR'S sentence about a dismantled system, not a borrowed one about a line
    expect(evaluate(SPEC, at(2, 3, parallel)).feedback).toBe("DEGEN");
    expect(evaluate(SPEC, at(0, 0, parallel)).feedback).toBe("DEGEN");
  });

  it("COINCIDENT: collapsing the system is not a way to be right", () => {
    // y = 2x − 1 twice. Every point on the line is genuinely on BOTH lines — a naive on1 && on2
    // would hand out successFeedback for destroying the question. It does not.
    const same = { m1: 2, b1: -1, m2: 2, b2: -1 };
    for (const [x, y] of [[0, -1], [1, 1], [2, 3], [3, 5]]) {
      const r = evaluate(SPEC, at(x, y, same));
      expect([x, y, r.correct]).toEqual([x, y, false]);
      // The coincident case is exactly where a borrowed off-line message was plainly wrong — the
      // point IS on both lines — so the author's own words are what it gets.
      expect([x, y, r.feedback]).toEqual([x, y, "DEGEN"]);
    }
  });

  it("and the system becomes gradable again the moment the rates differ", () => {
    expect(evaluate(SPEC, at(2, 3, { m1: 2, b1: -1, m2: 2, b2: 4 })).correct).toBe(false);
    expect(evaluate(SPEC, at(2, 3, { m1: 2, b1: -1, m2: -1, b2: 5 })).correct).toBe(true);
  });
});

describe("the gate itself", () => {
  it("needs BOTH the spec's opt-in and the value's envelope", () => {
    const noEdit = SystemsExploreSpec.parse({
      type: "systemsExplore", prompt: "p", m1: 2, b1: -1, m2: -1, b2: 5,
      xMin: 0, xMax: 6, yMin: 0, yMax: 7, ...FB,
    }) as TWidget;
    // spec did not opt in → the envelope is ignored, authored lines decide
    expect(evaluate(noEdit, at(2, 3, { m1: 1, b1: 3, m2: -1, b2: 5 })).correct).toBe(true);
    // spec opted in but no envelope written yet → authored lines decide
    expect(evaluate(SPEC, at(2, 3)).correct).toBe(true);
  });

  it("one editable line is enough to open the gate", () => {
    const oneSide = SystemsExploreSpec.parse({
      type: "systemsExplore", prompt: "p", m1: 2, b1: -1, m2: -1, b2: 5,
      xMin: 0, xMax: 6, yMin: 0, yMax: 7, ...FB, ...DEGEN, editLine1: EDIT,
    }) as TWidget;
    expect(evaluate(oneSide, at(1, 4, { m1: 1, b1: 3, m2: -1, b2: 5 })).correct).toBe(true);
  });
});

describe("the degenerate message, both paths (S212 review, C1b)", () => {
  it("a valid editable spec always has the author's string, and uses it", () => {
    // The integrity gate makes this the only shape that ships: opening a line REQUIRES the field.
    expect(systemsExploreEditErrors({ m1: 2, b1: -1, m2: -1, b2: 5, editLine1: EDIT as never })).toContain(
      "systemsExplore: a spec with an editable line must author degenerateSystemFeedback — parallel and coincident are reachable states and need their own words"
    );
    expect(
      systemsExploreEditErrors({ m1: 2, b1: -1, m2: -1, b2: 5, editLine1: EDIT as never, degenerateSystemFeedback: "D" })
    ).toEqual([]);
    expect(evaluate(SPEC, at(2, 3, { m1: 2, b1: -1, m2: 2, b2: 4 })).feedback).toBe("DEGEN");
  });

  it("the old chain survives ONLY as the impossible-state fallback", () => {
    // A spec that opened a line without the string never passed the gate above; if one somehow
    // reaches the grader, a borrowed sentence still beats silence.
    const ungated = SystemsExploreSpec.parse({
      type: "systemsExplore", prompt: "p", m1: 2, b1: -1, m2: -1, b2: 5,
      xMin: 0, xMax: 6, yMin: 0, yMax: 7, ...FB, editLine1: EDIT,
    }) as TWidget;
    expect(systemsExploreEditErrors(ungated as never).length).toBeGreaterThan(0); // it is invalid
    const parallel = { m1: 2, b1: -1, m2: 2, b2: 4 };
    expect(evaluate(ungated, at(2, 3, parallel)).feedback).toBe("OFF2");
    expect(evaluate(ungated, at(0, 0, parallel)).feedback).toBe("OFF1");
    expect(evaluate(ungated, at(2, 3, parallel)).correct).toBe(false);
  });

  it("the field changes no verdict — only the words", () => {
    const withIt = evaluate(SPEC, at(2, 3, { m1: 2, b1: -1, m2: 2, b2: -1 }));
    expect(withIt.correct).toBe(false);
    expect(evaluate(SPEC, at(2, 3, { m1: 2, b1: -1, m2: -1, b2: 5 })).correct).toBe(true);
  });
});
