// @vitest-environment jsdom
//
// UNITCIRCLEEXPLORE ENGINE-EXTENSION REGRESSION SUITE (Conversion Playbook §2.2, Block 2).
//
//   wave   — the circle unrolls: θ drags a trace across a wave axis; dials reproduce a target
//            wave parameter by parameter; targetFeature turns the drag into a feature hunt.
//   ghost  — a second point computed from the identity's RHS rides the direct point at every
//            reachable θ; impostor formulas visibly detach (the contrast case), and the
//            linearity impostor leaves the circle entirely.
//   branch — [lo, hi] hard-stops every input path at the same walls; the restriction that
//            makes an inverse a function is bumped into, not recited.
//
// Templates: the pilot's tilt-state assertions (playbook §4) become detachment-state and
// wall-state assertions here. Backward compatibility is pinned first — 10 shipped lessons and
// the gallery sample depend on the plain engine.

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { WidgetRenderer } from "./widgets";
import {
  WidgetSpec,
  widgetIntegrityErrors,
  ucGhostPoint,
  ucWaveY,
  UC_TRUE_FORMULAS,
  type TWidget,
} from "@/lib/schema";
import { correctAnswerText, evaluate } from "@/lib/evaluate";

afterEach(cleanup);

function mount(spec: TWidget, disabled = false, tone?: "neutral" | "success" | "error" | "info") {
  const holder: { v: unknown } = { v: null };
  function Host() {
    const [value, setValue] = useState<unknown>(null);
    return (
      <WidgetRenderer
        spec={spec}
        value={value}
        onChange={(v) => {
          holder.v = v;
          setValue(v);
        }}
        disabled={disabled}
        tone={tone}
      />
    );
  }
  const utils = render(<Host />);
  return { holder, ...utils };
}

const FB = { successFeedback: "s", lowFeedback: "lo", highFeedback: "hi" };

/* ---------------- backward compatibility ---------------- */

const classic = {
  type: "unitCircleExplore",
  prompt: "Drag the angle to 60°.",
  targetAngle: 60,
  angleStart: 0,
  angleStep: 15,
  ...FB,
} as const;

describe("unitCircleExplore — pre-existing specs are untouched", () => {
  it("parses to the same object it always did (no injected keys)", () => {
    const parsed = WidgetSpec.parse(classic);
    expect(parsed).toEqual(classic);
    for (const k of ["trace", "ghost", "branch", "dials", "targetFeature", "ghostChoices"])
      expect(k in parsed).toBe(false);
  });

  it("renders the classic square stage with triangle and full-range slider", () => {
    mount(WidgetSpec.parse(classic));
    const slider = screen.getByLabelText("angle in degrees") as HTMLInputElement;
    expect(slider.min).toBe("0");
    expect(slider.max).toBe("360");
    expect(screen.queryByTestId("uc-trace")).toBeNull();
    expect(screen.queryByTestId("uc-ghostpt")).toBeNull();
    expect(screen.queryByTestId("uc-branch-mask")).toBeNull();
  });

  it("grades low / exact / high unchanged and keeps the reveal ghost", () => {
    const s = WidgetSpec.parse(classic) as TWidget;
    expect(evaluate(s, { angle: 60 }).correct).toBe(true);
    expect(evaluate(s, { angle: 45 }).feedback).toBe("lo");
    expect(evaluate(s, { angle: 90 }).feedback).toBe("hi");
    expect(correctAnswerText(s)).toBe("θ = 60°");
    mount(s, false, "info");
    expect(screen.getByTestId("uc-ghost")).toBeTruthy();
  });

  it("passes integrity with no mode fields", () => {
    expect(widgetIntegrityErrors(WidgetSpec.parse(classic) as TWidget)).toEqual([]);
  });
});

/* ---------------- shared truth functions ---------------- */

describe("ucWaveY / ucGhostPoint — the mathematics the renderer and grader share", () => {
  it("ucWaveY reproduces the four dials", () => {
    expect(ucWaveY(90, "sin")).toBeCloseTo(1, 9);
    expect(ucWaveY(0, "sin", 3, 2, 90, 1)).toBeCloseTo(3 * Math.sin(Math.PI / 2) + 1, 9); // 4: tg-01-02's max
    expect(ucWaveY(45, "cos", 1, 2, 0, 0)).toBeCloseTo(0, 9); // cos 90°
  });

  it("every true formula coincides for every ghost kind across a sweep; every impostor detaches", () => {
    const cases: Array<[Parameters<typeof ucGhostPoint>[1], Parameters<typeof ucGhostPoint>[2], number]> = [
      ["double", "exact", 0], ["double", "face2cos2", 0], ["double", "face1minus2sin2", 0],
      ["double", "signError", 0],
      ["negate", "exact", 0], ["negate", "bothNegated", 0],
      ["cofunction", "exact", 0], ["cofunction", "signError", 0],
      ["sum", "exact", 30], ["sum", "linearity", 30],
    ];
    for (const [kind, formula, A] of cases) {
      let maxGap = 0;
      for (let a = 0; a <= 360; a += 5) {
        const { direct, ghost } = ucGhostPoint(a, kind, formula, A);
        maxGap = Math.max(maxGap, Math.hypot(direct[0] - ghost[0], direct[1] - ghost[1]));
      }
      if (UC_TRUE_FORMULAS.has(formula)) expect(maxGap, `${kind}/${formula}`).toBeLessThan(1e-9);
      else expect(maxGap, `${kind}/${formula}`).toBeGreaterThan(0.1);
    }
  });

  it("the linearity impostor leaves the circle — its coordinates exceed 1", () => {
    const { ghost } = ucGhostPoint(30, "sum", "linearity", 30);
    expect(Math.hypot(ghost[0], ghost[1])).toBeGreaterThan(1.5);
  });

  it("the double-angle sign-error impostor crosses into QII while θ is still acute (ti-04-03's trap)", () => {
    // θ = 70°: cos 2θ = cos 140° < 0 already; the impostor sin²−cos² is positive there — they
    // sit on opposite sides of the y-axis while θ is acute.
    const { direct, ghost } = ucGhostPoint(70, "double", "signError");
    expect(direct[0]).toBeLessThan(0);
    expect(ghost[0]).toBeGreaterThan(0);
  });
});

/* ---------------- wave mode ---------------- */

const featureSpec = {
  type: "unitCircleExplore",
  prompt: "Drag until the trace reaches the wave's first peak.",
  targetAngle: 0, // unused in feature mode; kept for schema shape
  angleStart: 0,
  angleStep: 5,
  trace: "sin",
  phaseDeg: -90, // sin(x − 90°): peak at 180°, the tg-01-01 move
  targetFeature: { kind: "peak", x: 180, tol: 5 },
  ...FB,
} as const;

describe("unitCircleExplore wave — feature hunt", () => {
  it("integrity re-derives the feature: a wrong x is rejected", () => {
    expect(widgetIntegrityErrors(WidgetSpec.parse(featureSpec) as TWidget)).toEqual([]);
    const wrong = { ...featureSpec, targetFeature: { kind: "peak", x: 90, tol: 5 } };
    expect(widgetIntegrityErrors(WidgetSpec.parse(wrong) as TWidget).join(" ")).toMatch(/peak at x = 90/);
    const noTrace = { ...featureSpec } as Record<string, unknown>;
    delete noTrace.trace;
    expect(widgetIntegrityErrors(WidgetSpec.parse(noTrace) as TWidget).join(" ")).toMatch(/need `trace`/);
    expect(
      widgetIntegrityErrors(
        WidgetSpec.parse({ ...featureSpec, trace: "tan", targetFeature: { kind: "peak", x: 45, tol: 5 } }) as TWidget
      ).join(" ")
    ).toMatch(/tangent has no peak/);
  });

  it("period truth: 360/|b| for sin and cos, 180/|b| for tan (tg-03-03's whole content)", () => {
    const base = { ...featureSpec, phaseDeg: 0 };
    expect(
      widgetIntegrityErrors(
        WidgetSpec.parse({ ...base, angularScale: 2, targetFeature: { kind: "period", x: 180, tol: 5 } }) as TWidget
      )
    ).toEqual([]);
    expect(
      widgetIntegrityErrors(
        WidgetSpec.parse({ ...base, trace: "tan", angularScale: 2, targetFeature: { kind: "period", x: 90, tol: 5 } }) as TWidget
      )
    ).toEqual([]);
    // The classic error: reading tan(2x)'s period as 360/2.
    expect(
      widgetIntegrityErrors(
        WidgetSpec.parse({ ...base, trace: "tan", angularScale: 2, targetFeature: { kind: "period", x: 180, tol: 5 } }) as TWidget
      ).join(" ")
    ).toMatch(/180\/\|angularScale\|/);
  });

  it("renders the wide stage: trace, feature marker, moving tip", () => {
    mount(WidgetSpec.parse(featureSpec));
    expect(screen.getByTestId("uc-trace")).toBeTruthy();
    expect(screen.getByTestId("uc-feature")).toBeTruthy();
    expect(screen.getByTestId("uc-tip")).toBeTruthy();
  });

  it("grades inside/below/above the tolerance window", () => {
    const s = WidgetSpec.parse(featureSpec) as TWidget;
    expect(evaluate(s, { angle: 180 }).correct).toBe(true);
    expect(evaluate(s, { angle: 178 }).correct).toBe(true); // within tol
    expect(evaluate(s, { angle: 90 }).feedback).toBe("lo"); // stopped at sin x's old peak — the trap
    expect(evaluate(s, { angle: 270 }).feedback).toBe("hi");
    expect(correctAnswerText(s)).toBe("peak at x = 180° (±5°)");
  });

  it("the slider narrates the mathematical state, not just the number", () => {
    mount(WidgetSpec.parse(featureSpec));
    const slider = screen.getByLabelText("angle in degrees") as HTMLInputElement;
    fireEvent.change(slider, { target: { value: "90" } });
    expect(slider.getAttribute("aria-valuetext")).toMatch(/sin-wave value/);
    expect(slider.getAttribute("aria-valuetext")).toMatch(/hunting the peak/);
  });
});

const dialSpec = {
  type: "unitCircleExplore",
  prompt: "Set the four dials so your wave lands on the target.",
  targetAngle: 0,
  angleStart: 90,
  angleStep: 5,
  trace: "sin",
  dials: [
    { param: "amplitude", min: 1, max: 5, step: 1, start: 1, target: 3, feedback: "amp-wrong" },
    { param: "midline", min: -2, max: 3, step: 1, start: 0, target: 1, feedback: "mid-wrong" },
  ],
  ...FB,
};

describe("unitCircleExplore wave — dials", () => {
  it("integrity: off-lattice targets, duplicates, and no-move starts are rejected", () => {
    expect(widgetIntegrityErrors(WidgetSpec.parse(dialSpec) as TWidget)).toEqual([]);
    const withDials = (d0: Partial<(typeof dialSpec)["dials"][0]>, d1?: Partial<(typeof dialSpec)["dials"][1]>) => ({
      ...dialSpec,
      dials: [
        { ...dialSpec.dials[0], ...d0 },
        { ...dialSpec.dials[1], ...(d1 ?? {}) },
      ],
    });
    expect(widgetIntegrityErrors(WidgetSpec.parse(withDials({ target: 2.5 })) as TWidget).join(" ")).toMatch(/off the step lattice/);
    expect(widgetIntegrityErrors(WidgetSpec.parse(withDials({}, { param: "amplitude" })) as TWidget).join(" ")).toMatch(/duplicate dial/);
    expect(widgetIntegrityErrors(WidgetSpec.parse(withDials({ start: 3 })) as TWidget).join(" ")).toMatch(/starts at its target/);
  });

  it("renders one slider per dial plus the dashed target wave", () => {
    mount(WidgetSpec.parse(dialSpec));
    expect(screen.getByTestId("uc-dial-amplitude")).toBeTruthy();
    expect(screen.getByTestId("uc-dial-midline")).toBeTruthy();
    expect(screen.getByTestId("uc-targetwave")).toBeTruthy();
  });

  it("moving a dial reshapes the learner wave and updates state", () => {
    const { holder } = mount(WidgetSpec.parse(dialSpec));
    const before = screen.getByTestId("uc-trace").getAttribute("d");
    fireEvent.change(screen.getByTestId("uc-dial-amplitude"), { target: { value: "3" } });
    expect((holder.v as { dials: Record<string, number> }).dials.amplitude).toBe(3);
    expect(screen.getByTestId("uc-trace").getAttribute("d")).not.toBe(before);
  });

  it("grades dial by dial, most specific first", () => {
    const s = WidgetSpec.parse(dialSpec) as TWidget;
    expect(evaluate(s, { angle: 90 }).feedback).toBe("amp-wrong"); // untouched dials fall to start
    expect(evaluate(s, { angle: 90, dials: { amplitude: 3 } }).feedback).toBe("mid-wrong");
    expect(evaluate(s, { angle: 90, dials: { amplitude: 3, midline: 1 } }).correct).toBe(true);
    expect(correctAnswerText(s)).toBe("amplitude = 3, midline = 1");
  });
});

/* ---------------- ghost mode ---------------- */

const ghostSpec = {
  type: "unitCircleExplore",
  prompt: "Pick the formula whose point never leaves the direct point, then drag θ to 70°.",
  targetAngle: 70,
  angleStart: 20,
  angleStep: 5,
  ghost: "double",
  showGhostCoords: true,
  ghostChoices: [
    { id: "exact", label: "cos²θ − sin²θ" },
    { id: "face2cos2", label: "2cos²θ − 1" },
    { id: "signError", label: "sin²θ − cos²θ", feedback: "sign-err" },
  ],
  ...FB,
} as const;

describe("unitCircleExplore ghost — an identity is a coincidence that survives dragging", () => {
  it("integrity: sum needs ghostAngle; a choice set needs a true identity and named impostors", () => {
    expect(widgetIntegrityErrors(WidgetSpec.parse(ghostSpec) as TWidget)).toEqual([]);
    expect(
      widgetIntegrityErrors(WidgetSpec.parse({ ...ghostSpec, ghost: "sum" }) as TWidget).join(" ")
    ).toMatch(/needs ghostAngle/);
    const noTrue = {
      ...ghostSpec,
      ghostChoices: [
        { id: "signError", label: "a", feedback: "f1" },
        { id: "linearity", label: "b", feedback: "f2" },
      ],
    };
    expect(widgetIntegrityErrors(WidgetSpec.parse(noTrue) as TWidget).join(" ")).toMatch(/no true identity/);
    const unnamed = {
      ...ghostSpec,
      ghostChoices: [ghostSpec.ghostChoices[0], ghostSpec.ghostChoices[1], { id: "signError" as const, label: "sin²θ − cos²θ" }],
    };
    expect(widgetIntegrityErrors(WidgetSpec.parse(unnamed) as TWidget).join(" ")).toMatch(/needs feedback naming why/);
  });

  it("a true formula's point rides the direct point (leaf, no gap line)", () => {
    mount(WidgetSpec.parse(ghostSpec));
    fireEvent.click(screen.getByTestId("uc-choice-exact"));
    expect(screen.queryByTestId("uc-gap")).toBeNull();
    expect(screen.getByTestId("uc-ghoststatus").textContent).toMatch(/keeps sitting there/);
  });

  it("the impostor detaches: gap line appears and the status names the disagreement", () => {
    const { holder } = mount(WidgetSpec.parse(ghostSpec));
    fireEvent.click(screen.getByTestId("uc-choice-signError"));
    expect((holder.v as { choice: string }).choice).toBe("signError");
    expect(screen.getByTestId("uc-gap")).toBeTruthy();
    expect(screen.getByTestId("uc-ghoststatus").textContent).toMatch(/disagree|LEFT the circle/);
  });

  it("grading: impostor choice is diagnosed by ITS feedback ahead of the angle", () => {
    const s = WidgetSpec.parse(ghostSpec) as TWidget;
    expect(evaluate(s, { angle: 70, choice: "signError" }).feedback).toBe("sign-err");
    expect(evaluate(s, { angle: 40, choice: "face2cos2" }).feedback).toBe("lo"); // true face, wrong θ
    expect(evaluate(s, { angle: 70, choice: "face2cos2" }).correct).toBe(true); // either true face works
    expect(evaluate(s, { angle: 70, choice: "exact" }).correct).toBe(true);
    expect(evaluate(s, { angle: 70 }).feedback).toMatch(/Pick a formula/);
  });

  it("sum/linearity: the impostor's status reports the point has left the circle", () => {
    const sumSpec = WidgetSpec.parse({
      ...ghostSpec,
      prompt: "Is sin(A+B) the same as sin A + sin B?",
      ghost: "sum",
      ghostAngle: 30,
      ghostChoices: [
        { id: "exact", label: "sin A cos B + cos A sin B" },
        { id: "linearity", label: "sin A + sin B", feedback: "lin" },
      ],
    }) as TWidget;
    mount(sumSpec);
    fireEvent.click(screen.getByTestId("uc-choice-linearity"));
    expect(screen.getByTestId("uc-ghoststatus").textContent).toMatch(/LEFT the circle/);
  });
});

/* ---------------- branch mode ---------------- */

const branchSpec = {
  type: "unitCircleExplore",
  prompt: "Find the angle in the arcsine branch whose sine is 1/2.",
  targetAngle: 30,
  angleStart: 0,
  angleStep: 5,
  branch: [-90, 90],
  ...FB,
} as const;

describe("unitCircleExplore branch — the restriction you bump into", () => {
  it("integrity: target and start must live inside the branch", () => {
    expect(widgetIntegrityErrors(WidgetSpec.parse(branchSpec) as TWidget)).toEqual([]);
    expect(
      widgetIntegrityErrors(WidgetSpec.parse({ ...branchSpec, targetAngle: 150 }) as TWidget).join(" ")
    ).toMatch(/outside branch/);
    expect(
      widgetIntegrityErrors(WidgetSpec.parse({ ...branchSpec, branch: [90, -90] }) as TWidget).join(" ")
    ).toMatch(/is empty/);
  });

  it("renders the excluded-arc mask and both walls; slider range IS the branch", () => {
    mount(WidgetSpec.parse(branchSpec));
    expect(screen.getByTestId("uc-branch-mask")).toBeTruthy();
    expect(screen.getByTestId("uc-wall-0")).toBeTruthy();
    expect(screen.getByTestId("uc-wall-1")).toBeTruthy();
    const slider = screen.getByLabelText("angle in degrees") as HTMLInputElement;
    expect(slider.min).toBe("-90");
    expect(slider.max).toBe("90");
  });

  it("a slider push past the wall clamps and announces the bump", () => {
    const { holder } = mount(WidgetSpec.parse(branchSpec));
    fireEvent.change(screen.getByLabelText("angle in degrees"), { target: { value: "150" } });
    // range inputs clamp to max in the DOM; the state must sit exactly on the wall
    expect((holder.v as { angle: number }).angle).toBeLessThanOrEqual(90);
  });

  it("grades only within the branch — 150° is unreachable, exactly the arcsin(sin x) trap", () => {
    const s = WidgetSpec.parse(branchSpec) as TWidget;
    expect(evaluate(s, { angle: 30 }).correct).toBe(true);
    expect(evaluate(s, { angle: 90 }).feedback).toBe("hi");
  });
});
