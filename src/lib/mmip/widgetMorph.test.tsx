// @vitest-environment jsdom
//
// The shared widget morph helper's own contract. The three adopting widgets' suites remain the
// integration proof; this pins the pieces they all lean on.
import { act, cleanup, render } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import type { MorphPlan } from "./equationMorph";
import {
  MORPH_BASE_MS,
  MORPH_FRAMES,
  NO_MORPH,
  playMorphPlan,
  prefersReducedMotion,
  MorphHistoryError,
  useMorphHistory,
  useMorphStage,
  type MorphHistory,
} from "./widgetMorph";
import { stubPrefersReducedMotion } from "./mmipHarness";

afterEach(cleanup);

type T = "a" | "b";
const phase = (motion: MorphPlan<T>["phases"][number]["motion"], actors: string[], durationWeight: number, stagger = 0) => ({
  op: { kind: "add" as const, target: "a" as T, amount: 1, sides: ["mat"] as [string, ...string[]], describe: "d" },
  ops: [{ kind: "add" as const, target: "a" as T, amount: 1, sides: ["mat"] as [string, ...string[]], describe: "d" }],
  motion,
  actors,
  fromRole: "off-stage" as const,
  toRole: "equation-slot" as const,
  durationWeight,
  stagger,
  describe: `${motion} happened`,
  reversible: true,
});
const plan = (...phases: ReturnType<typeof phase>[]): MorphPlan<T> => ({ phases, rejected: false });

function board(): HTMLElement {
  const root = document.createElement("div");
  root.innerHTML = `<div id="one" data-morph-actor="a:mat expression:mat"></div><div id="two" data-morph-actor="b:mat"></div>`;
  document.body.appendChild(root);
  return root;
}
const marks = (root: HTMLElement) =>
  Array.from(root.querySelectorAll("[data-morph-ms]")).map((el) => [
    el.id,
    el.getAttribute("data-morph-motion"),
    el.getAttribute("data-morph-ms"),
  ]);

describe("playMorphPlan", () => {
  it("maps durationWeight to milliseconds through the base, and nothing else does", () => {
    const root = board();
    playMorphPlan(root, plan(phase("collapse", ["a:mat"], 1.2)));
    expect(marks(root)).toEqual([["one", "collapse", String(Math.round(1.2 * MORPH_BASE_MS))]]); // 264
    playMorphPlan(root, plan(phase("join", ["b:mat"], 1)), 500);
    expect(marks(root)).toEqual([["two", "join", "500"]]);
  });

  it("clears the previous morph's marks before writing the next", () => {
    const root = board();
    playMorphPlan(root, plan(phase("join", ["a:mat"], 1)));
    playMorphPlan(root, plan(phase("leave", ["b:mat"], 1)));
    expect(marks(root)).toEqual([["two", "leave", "220"]]); // no residue on #one
  });

  it("animates nothing for a rejected, empty or absent plan — and still clears", () => {
    const root = board();
    playMorphPlan(root, plan(phase("join", ["a:mat"], 1)));
    playMorphPlan(root, { phases: [], rejected: true, message: "no" });
    expect(marks(root)).toEqual([]);
    playMorphPlan(root, plan(phase("join", ["a:mat"], 1)));
    playMorphPlan(root, NO_MORPH as MorphPlan<T>);
    expect(marks(root)).toEqual([]);
    playMorphPlan(root, plan(phase("join", ["a:mat"], 1)));
    playMorphPlan(root, null);
    expect(marks(root)).toEqual([]);
  });

  it("moves an element ONCE when two of a phase's actors name it (the S208 carry-over)", () => {
    const root = board();
    // #one answers to both "a:mat" and "expression:mat"; it must take the earlier beat, not two.
    playMorphPlan(root, plan(phase("branch", ["a:mat", "expression:mat"], 1.5, 0.12)));
    expect(marks(root)).toEqual([["one", "branch", "330"]]);
  });

  it("returns the animations it started — empty under jsdom, which has no Element.animate", () => {
    const root = board();
    expect((HTMLElement.prototype as { animate?: unknown }).animate).toBeUndefined();
    expect(playMorphPlan(root, plan(phase("join", ["a:mat"], 1)))).toEqual([]);
    expect(Object.keys(MORPH_FRAMES)).toHaveLength(9); // one per motion semantic
  });
});

describe("useMorphHistory", () => {
  const grab = () => {
    let api!: MorphHistory<T>;
    function Host() {
      api = useMorphHistory<T>();
      return null;
    }
    render(<Host />);
    return () => api;
  };

  it("pushes a step per edit, and one step for a whole run", () => {
    const h = grab();
    const p1 = plan(phase("join", ["a:mat"], 1));
    const p2 = plan(phase("leave", ["a:mat"], 1));
    expect(h().record(p1, "slot:x")).toBe("pushed");
    expect(h().record(p2, "slot:x", p2)).toBe("coalesced"); // same run
    expect(h().depth()).toBe(1);
    expect(h().record(p1, "slot:y")).toBe("pushed"); // a different slot starts a step
    expect(h().depth()).toBe(2);
  });

  it("a null key never coalesces — an unkeyed edit is always its own step", () => {
    const h = grab();
    const p = plan(phase("join", ["a:mat"], 1));
    h().record(p);
    h().record(p);
    expect(h().depth()).toBe(2);
  });

  it("endRun closes the run without touching the stack", () => {
    const h = grab();
    const p = plan(phase("join", ["a:mat"], 1));
    h().record(p, "slot:x");
    h().endRun();
    expect(h().depth()).toBe(1);
    expect(h().continues("slot:x")).toBe(false);
    h().record(p, "slot:x");
    expect(h().depth()).toBe(2);
  });

  it("takeReverse pops and inverts; clear forgets everything", () => {
    const h = grab();
    h().record(plan(phase("join", ["a:mat"], 1)), null);
    const back = h().takeReverse();
    expect(back?.phases[0].motion).toBe("leave"); // join inverts to leave
    expect(back?.phases[0].describe).toMatch(/^Undo: /);
    expect(h().depth()).toBe(0);
    expect(h().takeReverse()).toBeNull(); // nothing left is not an error
    h().record(plan(phase("join", ["a:mat"], 1)), null);
    h().clear();
    expect(h().depth()).toBe(0);
  });

  it("coalescing replaces the stored plan with the run's NET plan", () => {
    const h = grab();
    h().record(plan(phase("leave", ["a:mat"], 1)), "slot:x");
    h().record(plan(phase("leave", ["a:mat"], 1)), "slot:x", plan(phase("join", ["a:mat"], 1)));
    // undoing the run reverses the NET (join → leave), not the last keystroke (leave → join)
    expect(h().takeReverse()?.phases[0].motion).toBe("leave");
  });
});

describe("the two record paths cannot be mixed (S211 review, condition 1)", () => {
  const grab = () => {
    let api!: MorphHistory<T>;
    function Host() {
      api = useMorphHistory<T>();
      return null;
    }
    render(<Host />);
    return () => api;
  };
  const p = () => plan(phase("join", ["a:mat"], 1));

  it("a keyed instance refuses recordAs, by name", () => {
    const h = grab();
    h().record(p(), "slot:x");
    expect(() => h().recordAs("push", p())).toThrow(MorphHistoryError);
    try {
      h().recordAs("push", p());
    } catch (e) {
      expect((e as MorphHistoryError).code).toBe("mixed-record-paths");
      expect((e as MorphHistoryError).message).toMatch(/already driving the keyed path/);
    }
    expect(h().depth()).toBe(1); // and the refused call moved nothing
  });

  it("an external instance refuses every keyed member, by name", () => {
    for (const member of ["record", "continues", "endRun"] as const) {
      const h = grab();
      h().recordAs("push", p());
      const call = () => (member === "record" ? h().record(p(), "k") : member === "continues" ? h().continues("k") : h().endRun());
      expect(call).toThrow(MorphHistoryError);
      try {
        call();
      } catch (e) {
        expect([member, (e as MorphHistoryError).code]).toEqual([member, "mixed-record-paths"]);
        expect((e as MorphHistoryError).message).toMatch(/already driving the external path/);
      }
      expect(h().depth()).toBe(1);
      cleanup();
    }
  });

  it("a query latches too, so continues-then-recordAs is caught before any state moves", () => {
    const h = grab();
    expect(h().continues("slot:x")).toBe(false); // the very first thing a keyed widget does
    expect(() => h().recordAs("push", p())).toThrow(MorphHistoryError);
    expect(h().depth()).toBe(0);
  });

  it("clear does NOT unlatch: which path a widget uses is a fact about its code", () => {
    const h = grab();
    h().recordAs("push", p());
    h().clear();
    expect(h().depth()).toBe(0);
    expect(() => h().record(p(), "k")).toThrow(MorphHistoryError);
  });

  it("the shared members work on either path", () => {
    const keyed = grab();
    keyed().record(p(), "k");
    expect(keyed().takeReverse()?.phases[0].motion).toBe("leave");
    expect(keyed().depth()).toBe(0);
    keyed().clear();
    cleanup();
    const ext = grab();
    ext().recordAs("push", p());
    expect(ext().takeReverse()?.phases[0].motion).toBe("leave");
    expect(ext().depth()).toBe(0);
    ext().clear();
  });
});

describe("recordAs(\"coalesce\") with nothing on the stack", () => {
  const grab = () => {
    let api!: MorphHistory<T>;
    function Host() {
      api = useMorphHistory<T>();
      return null;
    }
    render(<Host />);
    return () => api;
  };
  const p = () => plan(phase("join", ["a:mat"], 1));

  it("throws rather than inventing a step to fold into", () => {
    const h = grab();
    expect(() => h().recordAs("coalesce", p())).toThrow(MorphHistoryError);
    try {
      h().recordAs("coalesce", p());
    } catch (e) {
      expect((e as MorphHistoryError).code).toBe("coalesce-on-empty-stack");
      expect((e as MorphHistoryError).message).toMatch(/recordAs\("push"\)/);
    }
    expect(h().depth()).toBe(0);
  });

  it("throws after the stack is emptied by undo, which is the desync this catches", () => {
    const h = grab();
    h().recordAs("push", p());
    h().takeReverse();
    expect(h().depth()).toBe(0);
    expect(() => h().recordAs("coalesce", p())).toThrow(/no step to fold/);
  });

  it("…and coalescing onto a real step still replaces it, as the widgets rely on", () => {
    const h = grab();
    h().recordAs("push", plan(phase("leave", ["a:mat"], 1)));
    h().recordAs("coalesce", plan(phase("join", ["a:mat"], 1)));
    expect(h().depth()).toBe(1);
    expect(h().takeReverse()?.phases[0].motion).toBe("leave"); // the NET plan, inverted
  });

  it("replays the shipping widgets' flow: push on the first edit of a gesture, coalesce after", () => {
    // Both external consumers ask to coalesce only when their gesture bookkeeping says a run is
    // open, and that is set only on a push and cleared only in undo — so the first edit after a
    // mount, and the first after any undo, is always a push. This is that sequence.
    const h = grab();
    let gesture: string | null = null;
    const edit = (key: string) => {
      const coalesced = gesture === key;
      h().recordAs(coalesced ? "coalesce" : "push", p());
      if (!coalesced) gesture = key;
    };
    edit("drag"); // first edit of a drag
    edit("drag"); // …samples during it
    edit("drag");
    expect(h().depth()).toBe(1);
    edit("stepper-run"); // a different gesture opens a step
    expect(h().depth()).toBe(2);
    h().takeReverse();
    gesture = null; // what undo does in both widgets
    edit("drag");
    expect(h().depth()).toBe(2);
  });
});

describe("useMorphStage", () => {
  function mount(query: () => boolean) {
    const said: Array<[string, boolean]> = [];
    let stage!: ReturnType<typeof useMorphStage<T>>["stage"];
    function Host() {
      const s = useMorphStage<T>({ describe: (t, r) => said.push([t, r]), reducedMotionQuery: query });
      stage = s.stage;
      const inner = useRef<HTMLDivElement | null>(null);
      return (
        <div ref={s.rootRef}>
          <div ref={inner} data-morph-actor="a:mat" />
        </div>
      );
    }
    const { container } = render(<Host />);
    return { said, stage: (p: MorphPlan<T>, f: string, r?: boolean) => act(() => void stage(p, f, r)), container };
  }

  it("plays the plan and speaks the caller's fallback when motion is allowed", () => {
    const h = mount(() => false);
    h.stage(plan(phase("join", ["a:mat"], 1)), "the words");
    expect(h.said).toEqual([["the words", false]]);
    expect(h.container.querySelector("[data-morph-ms]")?.getAttribute("data-morph-motion")).toBe("join");
  });

  it("under reduced motion nothing travels and the reduced plan's words are spoken instead", () => {
    const h = mount(() => true);
    h.stage(plan(phase("join", ["a:mat"], 1), phase("leave", ["a:mat"], 1)), "the words");
    expect(h.container.querySelector("[data-morph-ms]")).toBeNull();
    const [text] = h.said[0];
    expect(text).toContain("join happened");
    expect(text).toContain("leave happened");
    expect(text).toMatch(/State delta/);
  });

  it("passes the rejected flag through so a caller can tell a refusal from a report", () => {
    const h = mount(() => false);
    h.stage({ phases: [], rejected: true, message: "no" }, "refused", true);
    expect(h.said).toEqual([["refused", true]]);
    expect(h.container.querySelector("[data-morph-ms]")).toBeNull();
  });

  it("reads the media query, and the real one answers the stub", () => {
    const restore = stubPrefersReducedMotion(true);
    try {
      expect(prefersReducedMotion()).toBe(true);
    } finally {
      restore();
    }
    expect(prefersReducedMotion()).toBe(false);
  });
});
