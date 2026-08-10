// @vitest-environment jsdom
//
// S215 — rotationLab stops printing its own StageTone at the learner.
//
// The engine's ONLY tone-conditioned output used to be `{tone ? <p>{tone}</p> : null}`, so a
// learner in the retry phase read the literal word "error" on stage, and a learner at reveal read
// "info". Placeholder markup that had been shipping. `docs/CAPABILITY_AXES.md` names it as the
// clearest individually-verifiable contradiction on the capability table.
//
// This file pins the replacement, in the house grammar the rest of the programme uses:
//   error (retry)  — `rl-cue`, a berry trail leaving the learner's current image in the direction
//                    the turn must continue. Direction only, fixed length: it must never encode
//                    HOW FAR off the learner is.
//   info  (reveal) — `rl-ghost`, the shared dashed-tangerine GhostChip naming the landing turn.
//   anything else  — nothing extra renders at all.
// and the invariant that motivated the whole fix: NO raw StageTone token ("neutral" / "success" /
// "error" / "info") may reach the learner as text or as an accessible name, in ANY tone, in
// EITHER mode.
//
// Accessibility note pinned below: both the cue and the ghost are aria-hidden. describeState.ts
// deliberately withholds `targetAngle` from screen readers while the hunt is live ("parity means
// the same task, not an easier one"), and at reveal the LessonPlayer banner already speaks the
// answer to everyone — so the ghost must not become a second, unsynchronised voice for it.

import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import React from "react";
import { WidgetRenderer, type StageTone } from "./widgets";
import { WidgetSpec, type TWidget, rotationLabImage } from "@/lib/schema";

beforeEach(cleanup);

/** No tone token may appear in the prompt or feedback, or the sweep below would pass vacuously
 * on its own copy rather than on the engine's behaviour. */
const coordinateRule: TWidget = WidgetSpec.parse({
  type: "rotationLab",
  prompt: "Turn the point until it lands where the rule says it should.",
  mode: "coordinateRule",
  targetAngle: 90,
  angleStep: 15,
  point: [3, 5],
  centre: [0, 0],
  successFeedback: "That quarter turn sends (x, y) to (-y, x) — read it off the dial.",
  lowFeedback: "The turn has not gone far enough for the rule you were given.",
  highFeedback: "The turn has gone past the rule you were given."
});

const symmetryOrder: TWidget = WidgetSpec.parse({
  type: "rotationLab",
  prompt: "Hunt the smallest turn that drops the square back onto itself.",
  mode: "symmetryOrder",
  targetAngle: 90,
  angleStep: 15,
  shape: [
    [2, 2],
    [-2, 2],
    [-2, -2],
    [2, -2]
  ],
  centre: [0, 0],
  successFeedback: "A quarter turn lands it, so the square has rotational order four.",
  lowFeedback: "The shape has not come back around yet at that turn.",
  highFeedback: "The shape came back around before that turn."
});

const TONES: StageTone[] = ["neutral", "success", "error", "info"];
/** Word-boundary matching, so legitimate copy ("successive", "information") stays legal and only a
 * bare token trips the gate. */
const RAW_TOKEN = /\b(neutral|success|error|info)\b/i;

/** Every rendered text node separately — NOT `container.textContent`.
 *
 * This distinction is the whole gate. Concatenating the tree welds each node to its neighbour, and
 * the defect this file exists to pin rendered as `…(-1.41, 5.66).errorWhat's on screen…` — where
 * "error" is followed immediately by "W", so there is no word boundary and `\b…\b` never fires.
 * Written against the blob, the assertion passed with the defect fully present. Node by node, the
 * boundaries are the real ones. */
function textNodes(root: Element): string[] {
  const out: string[] = [];
  const walk = root.ownerDocument.createTreeWalker(root, 4 /* NodeFilter.SHOW_TEXT */);
  for (let n = walk.nextNode(); n !== null; n = walk.nextNode()) {
    const t = (n.textContent ?? "").trim();
    if (t) out.push(t);
  }
  return out;
}

function show(spec: TWidget, angle: number, tone?: StageTone) {
  return render(
    <WidgetRenderer spec={spec} value={{ angle }} onChange={() => {}} disabled={tone === "info"} tone={tone} />
  );
}

describe("rotationLab — the StageTone token never reaches the learner", () => {
  for (const [mode, spec] of [["coordinateRule", coordinateRule], ["symmetryOrder", symmetryOrder]] as const) {
    for (const tone of [...TONES, undefined]) {
      it(`${mode} @ tone=${tone ?? "none"}: no raw token in text or accessible names`, () => {
        // Both an off-target turn and the exact target turn, since the tone-gated nodes are
        // themselves gated on off-target-ness — the token must be gone from every combination.
        for (const angle of [45, 90]) {
          cleanup();
          const { container } = show(spec, angle, tone);
          for (const t of textNodes(container)) {
            expect(t, `text node at ${mode}/${String(tone)}/${angle}`).not.toMatch(RAW_TOKEN);
          }
          for (const el of Array.from(container.querySelectorAll("*"))) {
            for (const attr of ["aria-label", "aria-valuetext", "title", "alt"]) {
              const v = el.getAttribute(attr);
              if (v !== null) expect(v).not.toMatch(RAW_TOKEN);
            }
          }
        }
      });
    }
  }

  it("the failure it replaces would have been caught: the old markup is gone from the source", () => {
    // Guards against the paragraph being reinstated by a merge. Scoped to the token-printing
    // shape, not to tone use in general.
    const src = readFileSync(join(process.cwd(), "src", "components", "widgets.tsx"), "utf8");
    expect(src).not.toContain("{tone ? <p className=\"text-sm\">{tone}</p> : null}");
  });
});

describe("rotationLab — reveal ghost", () => {
  it("names the landing turn and the image it produces, in coordinateRule", () => {
    const { getByTestId } = show(coordinateRule, 45, "info");
    // (3, 5) turned 90° counterclockwise about the origin is (-5, 3).
    expect(getByTestId("rl-ghost").textContent).toBe("90° sends (3, 5) to (-5, 3)");
  });

  it("names the turn and the order it implies, in symmetryOrder", () => {
    const { getByTestId } = show(symmetryOrder, 45, "info");
    expect(getByTestId("rl-ghost").textContent).toBe("lands on itself at 90° (order 4)");
  });

  it("does not appear when the learner is already ON the target turn", () => {
    const { queryByTestId } = show(coordinateRule, 90, "info");
    expect(queryByTestId("rl-ghost")).toBeNull();
  });

  it("does not appear in any tone other than info", () => {
    for (const tone of ["neutral", "success", "error", undefined] as Array<StageTone | undefined>) {
      cleanup();
      const { queryByTestId } = show(coordinateRule, 45, tone);
      expect(queryByTestId("rl-ghost"), `tone=${tone ?? "none"}`).toBeNull();
    }
  });

  it("is hidden from assistive technology — the reveal banner is the spoken voice, not this", () => {
    const { getByTestId } = show(coordinateRule, 45, "info");
    expect(getByTestId("rl-ghost").getAttribute("aria-hidden")).toBe("true");
  });
});

describe("rotationLab — retry cue is direction only", () => {
  const pointsOf = (el: Element) => el.getAttribute("points") ?? "";
  const expected = (angle: number, dir: 1 | -1) =>
    [0, 1, 2, 3, 4]
      .map((i) => rotationLabImage([3, 5], [0, 0], angle + dir * i * 5))
      .map((p) => `${150 + (p[0] / 8) * 120},${150 - (p[1] / 8) * 120}`)
      .join(" ");

  it("leaves the current image FORWARD when the turn is short of the target", () => {
    const { getByTestId } = show(coordinateRule, 45, "error");
    expect(pointsOf(getByTestId("rl-cue"))).toBe(expected(45, 1));
  });

  it("leaves the current image BACKWARD when the turn has overshot", () => {
    const { getByTestId } = show(coordinateRule, 180, "error");
    expect(pointsOf(getByTestId("rl-cue"))).toBe(expected(180, -1));
  });

  it("is the same fixed 20° trail however far off the learner is — it cannot leak the distance", () => {
    // Two very different misses. Each trail spans exactly four 5° steps from wherever the learner
    // stands, so its ARC LENGTH is identical; only its start and its direction differ.
    const arcSpan = (start: number) => {
      cleanup();
      const { getByTestId } = show(coordinateRule, start, "error");
      const pts = pointsOf(getByTestId("rl-cue")).split(" ").map((s) => s.split(",").map(Number));
      let total = 0;
      for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      return total;
    };
    expect(arcSpan(0)).toBeCloseTo(arcSpan(60), 4);
    expect(arcSpan(0)).toBeCloseTo(arcSpan(300), 4);
  });

  it("does not appear when the learner is already ON the target turn", () => {
    const { queryByTestId } = show(coordinateRule, 90, "error");
    expect(queryByTestId("rl-cue")).toBeNull();
  });

  it("does not appear in any tone other than error", () => {
    for (const tone of ["neutral", "success", "info", undefined] as Array<StageTone | undefined>) {
      cleanup();
      const { queryByTestId } = show(coordinateRule, 45, tone);
      expect(queryByTestId("rl-cue"), `tone=${tone ?? "none"}`).toBeNull();
    }
  });

  it("is hidden from assistive technology, like every other stage cue", () => {
    const { getByTestId } = show(coordinateRule, 45, "error");
    expect(getByTestId("rl-cue").getAttribute("aria-hidden")).toBe("true");
  });
});

describe("rotationLab — the pre-existing readout is untouched by any of this", () => {
  it("still prints the exact state in every tone", () => {
    for (const tone of [...TONES, undefined]) {
      cleanup();
      const { getByTestId } = show(coordinateRule, 90, tone);
      expect(getByTestId("rotationlab-exact").textContent).toBe("Turn 90°. Image of (3, 5) is (-5, 3).");
    }
  });

  it("still narrates the shape verdict in symmetryOrder", () => {
    const { getByTestId } = show(symmetryOrder, 90, "success");
    expect(getByTestId("rotationlab-exact").textContent).toBe("Turn 90°. The shape LANDS on itself.");
  });
});
