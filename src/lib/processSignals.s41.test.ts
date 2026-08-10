// Process-signal extension (s41): engine-recognised misconception tags and the
// trial-and-error stream detector, with the anti-overadaptation guards pinned:
//   ONE ACCIDENT ≠ DIAGNOSIS  a single tagged landing never fires
//   SPECIFIC BEATS GENERIC    a repeated tag outranks direction streams
//   THRASH ≠ FIXATION         trial-and-error needs ≥2 controls; one control is
//                             oscillation/wrong-direction territory
//   DETERMINISM               identical streams always name identical patterns
import { describe, expect, it } from "vitest";
import { classifyProcess, processCue, type ProcessEvent } from "@/lib/processEvents";

const ev = (control: string, dir: ProcessEvent["dir"], tag?: ProcessEvent["tag"]): ProcessEvent =>
  tag ? { control, dir, tag } : { control, dir };

describe("misconception tags", () => {
  it("one tagged landing is an accident — no signal", () => {
    expect(classifyProcess([ev("m", "away", "slope-for-intercept")])).toBeNull();
  });

  it("two of the same tag fire that tag", () => {
    expect(
      classifyProcess([ev("m", "away", "slope-for-intercept"), ev("m", "away", "slope-for-intercept")])
    ).toBe("slope-for-intercept");
  });

  it("two DIFFERENT tags do not fire (each is a single accident)", () => {
    expect(classifyProcess([ev("p", "away", "xy-reversal"), ev("p", "away", "angle-direction")])).toBeNull();
  });

  it("a repeated tag outranks a generic direction stream", () => {
    const events = [
      ev("m", "away"),
      ev("m", "away", "intercept-for-slope"),
      ev("m", "away"),
      ev("m", "away", "intercept-for-slope")
    ];
    // 4 aways would be wrong-direction; the specific diagnosis wins.
    expect(classifyProcess(events)).toBe("intercept-for-slope");
  });

  it("every tag has cue copy in tentative voice", () => {
    for (const tag of [
      "xy-reversal",
      "slope-for-intercept",
      "intercept-for-slope",
      "rise-run-reversal",
      "graph-as-picture",
      "repr-disconnect",
      "visual-proof",
      "rigid-violation",
      "angle-direction",
      "construction-order",
      "measurement-dependence"
    ] as const) {
      const cue = processCue("lineExplore", tag);
      expect(cue.length).toBeGreaterThan(40);
      expect(cue).not.toMatch(/you are wrong|incorrect/i); // never a verdict
    }
  });
});

describe("param-thrash (trial and error)", () => {
  const thrash: ProcessEvent[] = [
    ev("m", "away"),
    ev("b", "past"),
    ev("m", "away"),
    ev("b", "away"),
    ev("m", "past"),
    ev("b", "away"),
    ev("m", "toward"),
    ev("b", "away")
  ];

  it("fires on many unproductive multi-control moves with crossings", () => {
    expect(classifyProcess(thrash)).toBe("param-thrash");
  });

  it("below the volume bar the stream degrades to the generic cue, not thrash", () => {
    expect(classifyProcess(thrash.slice(0, 7))).toBe("wrong-direction");
  });

  it("a single-control stream is never thrash (that's oscillation territory)", () => {
    const oneControl = thrash.map((e) => ({ ...e, control: "m" }));
    expect(classifyProcess(oneControl)).not.toBe("param-thrash");
  });

  it("steady progress is not thrash even with many moves", () => {
    const progress = Array.from({ length: 8 }, (_, i) => ev(i % 2 ? "m" : "b", "toward"));
    expect(classifyProcess(progress)).toBeNull();
  });
});

describe("determinism", () => {
  it("identical streams classify identically across calls", () => {
    const stream = [
      ev("m", "away", "slope-for-intercept"),
      ev("b", "past"),
      ev("m", "away", "slope-for-intercept")
    ];
    expect(classifyProcess(stream)).toBe(classifyProcess(stream.map((e) => ({ ...e }))));
  });
});
