/**
 * equationMorph — gated independently of every other MMIP module.
 *
 * Fixtures are hand-built `SyncTransaction` values, never produced by calling
 * `solveBalanceModel` (or any other engine). That keeps this test decoupled from other workers'
 * files and forces every fixture to honor the FROZEN contract exactly as documented in
 * `docs/MMIP_V1_API.md` §3 and `mmipTypes.ts`, rather than whatever a particular engine happens
 * to emit today.
 *
 * The kind → motion table below is copied BY HAND from `docs/MMIP_V1_API.md` §3 — not imported
 * from `equationMorph.ts` — so this file cannot pass merely because it agrees with itself.
 */

import { describe, expect, it } from "vitest";
import { equationMorphPlan, reducedMotion, reversePlan, type MorphPlan } from "./equationMorph";
import type { MmipOperation, MmipOperationKind, SyncTransaction } from "./mmipTypes";

/* ─────────────────────────────────────── fixture plumbing ────────────────────────────────────── */

type FixtureTarget = "leftX" | "leftUnits" | "rightUnits" | "groups" | "relation" | "equation";
type FixtureState = Record<string, number>;

function makeOp(
  kind: MmipOperationKind,
  target: FixtureTarget,
  amount: number,
  sides: readonly [string, ...string[]],
  describe: string
): MmipOperation<FixtureTarget> {
  return { kind, target, amount, sides, describe };
}

function makeTx(
  ops: readonly MmipOperation<FixtureTarget>[],
  opts: { changed?: boolean; rejected?: boolean; rejection?: { code: string; message: string } } = {}
): SyncTransaction<FixtureState, FixtureTarget> {
  return {
    before: { leftX: 0, leftUnits: 0, rightUnits: 0 },
    after: { leftX: 0, leftUnits: 0, rightUnits: 0 },
    origin: "control",
    source: "test",
    ops,
    changed: opts.changed ?? ops.length > 0,
    rejected: opts.rejected ?? false,
    rejection: opts.rejection,
  };
}

/** Copied by hand from docs/MMIP_V1_API.md §3 / mmipTypes.ts — the frozen source of truth, not
 * this module's own internal table. */
const HAND_COPIED_MOTION_TABLE: Record<MmipOperationKind, string> = {
  add: "join",
  subtract: "leave",
  cancel: "collapse",
  divide: "partition",
  distribute: "branch",
  factor: "gather",
  negate: "reflect",
  reorient: "pivot",
  restore: "rewind",
};

/* ─────────────────────────────── every kind in the table (9 kinds) ───────────────────────────── */

describe("every MmipOperationKind maps to its documented motion", () => {
  const onePhaseFixtures: Array<{ kind: MmipOperationKind; op: MmipOperation<FixtureTarget> }> = [
    { kind: "add", op: makeOp("add", "leftUnits", 3, ["left"], "Added 3 unit tiles to the left pan.") },
    { kind: "subtract", op: makeOp("subtract", "leftX", -1, ["left"], "Took 1 x-tile off the left pan.") },
    { kind: "cancel", op: makeOp("cancel", "leftUnits", -2, ["left"], "Formed 2 zero pairs on the left pan.") },
    { kind: "divide", op: makeOp("divide", "equation", 3, ["left", "right"], "Shared both pans into 3 equal groups.") },
    { kind: "distribute", op: makeOp("distribute", "leftX", 6, ["left"], "Gave the ×3 to the x inside the bracket.") },
    { kind: "factor", op: makeOp("factor", "leftX", -6, ["left"], "Gathered the x terms under one factor.") },
    { kind: "negate", op: makeOp("negate", "equation", -1, ["left", "right"], "Multiplied both pans by −1.") },
    { kind: "reorient", op: makeOp("reorient", "relation", 0, ["left", "right"], "Turned the comparator round.") },
    { kind: "restore", op: makeOp("restore", "equation", 0, ["left", "right"], "Put every tile back where the problem started.") },
  ];

  for (const { kind, op } of onePhaseFixtures) {
    it(`${kind} → ${HAND_COPIED_MOTION_TABLE[kind]}`, () => {
      const plan = equationMorphPlan(makeTx([op]));
      expect(plan.phases).toHaveLength(1);
      expect(plan.phases[0].motion).toBe(HAND_COPIED_MOTION_TABLE[kind]);
      // The describe string is augmented with the motion verb, never replaced.
      expect(plan.phases[0].describe).toContain(op.describe);
      expect(plan.phases[0].actors.length).toBeGreaterThan(0);
    });
  }
});

/* ──────────────────────────────────────── actor ids ──────────────────────────────────────────── */

describe("actor ids are derived from target+side and spelled out literally", () => {
  it("a one-sided op has one actor: '<target>:<side>'", () => {
    const op = makeOp("subtract", "leftUnits", -4, ["left"], "Took 4 unit tiles off the left pan only.");
    const plan = equationMorphPlan(makeTx([op]));
    expect(plan.phases[0].actors).toEqual(["leftUnits:left"]);
  });

  it("a two-sided op has two actors, one per side, target repeated", () => {
    const op = makeOp("divide", "equation", 3, ["left", "right"], "Shared both pans into 3 equal groups.");
    const plan = equationMorphPlan(makeTx([op]));
    expect(plan.phases[0].actors).toEqual(["equation:left", "equation:right"]);
  });
});

/* ─────────────────────────────────────── roles / travel ──────────────────────────────────────── */

describe("role transitions carry real travel, never a bare in-place swap", () => {
  it("add (join): off-stage → pan-left", () => {
    const plan = equationMorphPlan(makeTx([makeOp("add", "leftUnits", 3, ["left"], "3 unit tiles joined the left pan.")]));
    expect(plan.phases[0].fromRole).toBe("off-stage");
    expect(plan.phases[0].toRole).toBe("pan-left");
  });

  it("subtract (leave): pan-right → off-stage", () => {
    const plan = equationMorphPlan(makeTx([makeOp("subtract", "rightUnits", -2, ["right"], "2 unit tiles left the right pan.")]));
    expect(plan.phases[0].fromRole).toBe("pan-right");
    expect(plan.phases[0].toRole).toBe("off-stage");
  });

  it("cancel (collapse): pan-left → off-stage", () => {
    const plan = equationMorphPlan(makeTx([makeOp("cancel", "leftUnits", -1, ["left"], "A zero pair formed on the left pan.")]));
    expect(plan.phases[0].fromRole).toBe("pan-left");
    expect(plan.phases[0].toRole).toBe("off-stage");
  });

  it("distribute (branch): pan-left → pan-left, in place, but with real actors", () => {
    const plan = equationMorphPlan(makeTx([makeOp("distribute", "leftX", 6, ["left"], "Gave the ×3 to the x inside the bracket.")]));
    expect(plan.phases[0].fromRole).toBe("pan-left");
    expect(plan.phases[0].toRole).toBe("pan-left");
    expect(plan.phases[0].actors).toEqual(["leftX:left"]);
  });

  it("restore (rewind): off-stage → equation-slot, the previous state re-entering", () => {
    const plan = equationMorphPlan(
      makeTx([makeOp("restore", "equation", 0, ["left", "right"], "Put every tile back where the problem started.")])
    );
    expect(plan.phases[0].fromRole).toBe("off-stage");
    expect(plan.phases[0].toRole).toBe("equation-slot");
  });
});

/* ─────────────────────────── multi-op decomposed symbolic edit (3 → 1) ───────────────────────── */

describe("a symbolic coefficient edit 3 → 1 decomposes into two subtract ops", () => {
  // Hand-derived: two taps, 3→2 then 2→1, exactly what solveBalanceDecompose would fold through
  // apply for two `tapLeftX` edits. Same side both times ("left"), so the merge rule does NOT
  // fire (it requires opposite sides) — this must stay two phases, one tap each.
  const ops = [
    makeOp("subtract", "leftX", -1, ["left"], "Took 1 x-tile off the left pan only — it now holds 2."),
    makeOp("subtract", "leftX", -1, ["left"], "Took 1 x-tile off the left pan only — it now holds 1."),
  ];

  it("produces exactly 2 phases, both 'leave', in order", () => {
    const plan = equationMorphPlan(makeTx(ops));
    expect(plan.phases).toHaveLength(2);
    expect(plan.phases.map((p) => p.motion)).toEqual(["leave", "leave"]);
    expect(plan.phases[0].describe).toContain("holds 2");
    expect(plan.phases[1].describe).toContain("holds 1");
  });
});

/* ────────────────────────────────── the both-pans merge rule ─────────────────────────────────── */

describe("the both-sides merge rule", () => {
  it("merges two consecutive same-kind ops on opposite sides into one phase", () => {
    // Hand-derived expectation: "subtract 3 from the left, subtract 3 from the right" is the
    // classic two-sided algebra move told as two one-sided op records. 2 ops in → 1 phase out.
    const ops = [
      makeOp("subtract", "leftUnits", -3, ["left"], "Took 3 unit tiles off the left pan only — it now holds 1."),
      makeOp("subtract", "rightUnits", -3, ["right"], "Took 3 unit tiles off the right pan only — it now holds 16."),
    ];
    const plan = equationMorphPlan(makeTx(ops));
    expect(plan.phases).toHaveLength(1);
    expect(plan.phases[0].motion).toBe("leave");
    expect(plan.phases[0].actors).toEqual(["leftUnits:left", "rightUnits:right"]);
    expect(plan.phases[0].fromRole).toBe("equation-slot");
    expect(plan.phases[0].toRole).toBe("off-stage");
    // Both original sentences survive inside the merged describe.
    expect(plan.phases[0].describe).toContain("left pan only — it now holds 1");
    expect(plan.phases[0].describe).toContain("right pan only — it now holds 16");
  });

  it("does NOT merge same-kind ops on the SAME side (distribute's two parts stay separate)", () => {
    const ops = [
      makeOp("distribute", "leftX", 6, ["left"], "x part joined."),
      makeOp("distribute", "leftUnits", 9, ["left"], "constant part joined."),
    ];
    const plan = equationMorphPlan(makeTx(ops));
    expect(plan.phases).toHaveLength(2);
  });

  it("does NOT merge ops of DIFFERENT kinds even on opposite sides", () => {
    const ops = [
      makeOp("subtract", "leftUnits", -3, ["left"], "left leaves."),
      makeOp("add", "rightUnits", 3, ["right"], "right joins."),
    ];
    const plan = equationMorphPlan(makeTx(ops));
    expect(plan.phases).toHaveLength(2);
  });

  it("keeps a 6-op transaction at 3 phases via three opposite-side merges (≤4 target)", () => {
    // Hand count: (subtract-left, subtract-right) merge → 1; (cancel-left, cancel-right) merge →
    // 1; (add-left, add-right) merge → 1. 6 ops, 3 merges, 3 phases.
    const ops = [
      makeOp("subtract", "leftUnits", -2, ["left"], "left loses 2."),
      makeOp("subtract", "rightUnits", -2, ["right"], "right loses 2."),
      makeOp("cancel", "leftUnits", -1, ["left"], "left zero pair."),
      makeOp("cancel", "rightUnits", -1, ["right"], "right zero pair."),
      makeOp("add", "leftUnits", 4, ["left"], "left gains 4."),
      makeOp("add", "rightUnits", 4, ["right"], "right gains 4."),
    ];
    const plan = equationMorphPlan(makeTx(ops));
    expect(plan.phases).toHaveLength(3);
    expect(plan.phases.length).toBeLessThanOrEqual(4);
    expect(plan.phases.map((p) => p.motion)).toEqual(["leave", "collapse", "join"]);
  });
});

/* ───────────────────────────────────────── cancel pairing ────────────────────────────────────── */

describe("cancel pairing (zero pairs forming on both pans) merges into one collapse phase", () => {
  it("two opposite-side cancel ops become one phase with both actors", () => {
    const ops = [
      makeOp("cancel", "leftUnits", -2, ["left"], "2 zero pairs formed on the left pan."),
      makeOp("cancel", "rightUnits", -2, ["right"], "2 zero pairs formed on the right pan."),
    ];
    const plan = equationMorphPlan(makeTx(ops));
    expect(plan.phases).toHaveLength(1);
    expect(plan.phases[0].motion).toBe("collapse");
    expect(plan.phases[0].actors).toEqual(["leftUnits:left", "rightUnits:right"]);
    expect(plan.phases[0].fromRole).toBe("equation-slot");
    expect(plan.phases[0].toRole).toBe("off-stage");
  });
});

/* ───────────────────────────── distribute branch ordering (bracket first) ────────────────────── */

describe("distribute branches the bracket into its parts before anything else moves", () => {
  it("both distribute ops (x-part, constant-part) come before a trailing op, and stay unmerged", () => {
    const ops = [
      makeOp("distribute", "leftX", 6, ["left"], "Gave the ×3 to the x inside every bracket."),
      makeOp("distribute", "leftUnits", 9, ["left"], "Gave the ×3 to the constant as well."),
      makeOp("subtract", "rightUnits", -1, ["right"], "Took 1 unit tile off the right pan only."),
    ];
    const plan = equationMorphPlan(makeTx(ops));
    // Hand count: distribute/distribute share a side so they don't merge (2 phases); the trailing
    // subtract is a third, unrelated phase. 3 ops → 3 phases.
    expect(plan.phases).toHaveLength(3);
    expect(plan.phases[0].motion).toBe("branch");
    expect(plan.phases[1].motion).toBe("branch");
    expect(plan.phases[2].motion).toBe("leave");
    // The bracket resolves first: both branch phases precede the leave phase, in array order.
    const branchIndices = plan.phases.map((p, i) => (p.motion === "branch" ? i : -1)).filter((i) => i >= 0);
    const leaveIndex = plan.phases.findIndex((p) => p.motion === "leave");
    expect(Math.max(...branchIndices)).toBeLessThan(leaveIndex);
  });
});

/* ───────────────────────────────────── reduced motion ────────────────────────────────────────── */

describe("reducedMotion", () => {
  it("collapses a multi-phase plan to one motionless phase that keeps every describe string", () => {
    const ops = [
      makeOp("distribute", "leftX", 6, ["left"], "Gave the ×3 to the x inside every bracket."),
      makeOp("distribute", "leftUnits", 9, ["left"], "Gave the ×3 to the constant as well."),
    ];
    const plan = equationMorphPlan(makeTx(ops));
    const reduced = reducedMotion(plan);
    expect(reduced.phases).toHaveLength(1);
    const r = reduced.phases[0];
    expect(r.durationWeight).toBe(0);
    expect(r.stagger).toBe(0);
    expect(r.fromRole).toBe(r.toRole);
    // Both original describe strings survive verbatim.
    expect(r.describe).toContain("Gave the ×3 to the x inside every bracket.");
    expect(r.describe).toContain("Gave the ×3 to the constant as well.");
    // A stateDelta summary is present too.
    expect(r.describe).toContain("State delta:");
    expect(r.describe).toContain("leftX +6");
    expect(r.describe).toContain("leftUnits +9");
  });

  it("never returns an empty plan for a changed transaction", () => {
    const plan = equationMorphPlan(makeTx([makeOp("add", "leftUnits", 1, ["left"], "1 unit tile joined.")]));
    expect(reducedMotion(plan).phases.length).toBeGreaterThan(0);
  });

  it("passes a rejected plan through unchanged (still empty, message intact)", () => {
    const plan = equationMorphPlan(makeTx([], { rejected: true, rejection: { code: "x", message: "No." } }));
    const reduced = reducedMotion(plan);
    expect(reduced).toEqual(plan);
    expect(reduced.phases).toHaveLength(0);
  });
});

/* ────────────────────────────────── rejected / unchanged transactions ────────────────────────── */

describe("rejected and unchanged transactions", () => {
  it("a rejected transaction produces an empty plan and passes the rejection message through", () => {
    const rejection = { code: "no-x-conjuring", message: "x-tiles can only be taken off a pan, never put on one." };
    const tx = makeTx([], { rejected: true, rejection });
    const plan = equationMorphPlan(tx);
    expect(plan.phases).toEqual([]);
    expect(plan.rejected).toBe(true);
    expect(plan.message).toBe(rejection.message);
  });

  it("a rejected transaction with no rejection object falls back to a generic refusal sentence", () => {
    const tx = makeTx([], { rejected: true });
    const plan = equationMorphPlan(tx);
    expect(plan.phases).toEqual([]);
    expect(plan.rejected).toBe(true);
    expect(typeof plan.message).toBe("string");
    expect(plan.message!.length).toBeGreaterThan(0);
  });

  it("an unchanged (no-op) transaction produces an empty plan with 'Nothing changed.'", () => {
    const tx = makeTx([], { changed: false, rejected: false });
    const plan = equationMorphPlan(tx);
    expect(plan.phases).toEqual([]);
    expect(plan.rejected).toBe(false);
    expect(plan.message).toBe("Nothing changed.");
  });
});

/* ───────────────────────────────────────── reverse plan ──────────────────────────────────────── */

describe("reversePlan", () => {
  const buildMultiPhasePlan = (): MorphPlan<FixtureTarget> =>
    equationMorphPlan(
      makeTx([
        makeOp("distribute", "leftX", 6, ["left"], "Gave the ×3 to the x inside every bracket."),
        makeOp("subtract", "leftUnits", -3, ["left"], "left constant leaves."),
        makeOp("subtract", "rightUnits", -3, ["right"], "right constant leaves."),
      ])
    );

  it("reverses phase order and swaps fromRole/toRole", () => {
    const plan = buildMultiPhasePlan();
    const reversed = reversePlan(plan);
    expect(reversed.phases).toHaveLength(plan.phases.length);
    // The last phase's ops (reversed internally) become the first phase of the reversed plan.
    expect(reversed.phases[0].ops).toEqual([...plan.phases[plan.phases.length - 1].ops].reverse());
    for (let i = 0; i < plan.phases.length; i++) {
      const original = plan.phases[i];
      const mirrored = reversed.phases[plan.phases.length - 1 - i];
      expect(mirrored.fromRole).toBe(original.toRole);
      expect(mirrored.toRole).toBe(original.fromRole);
    }
  });

  it("round trip: reverse of reverse is deep-equal to the original plan", () => {
    const plan = buildMultiPhasePlan();
    const roundTripped = reversePlan(reversePlan(plan));
    expect(roundTripped).toEqual(plan);
  });

  it("round trip holds for a single-phase plan too", () => {
    const plan = equationMorphPlan(makeTx([makeOp("negate", "equation", -1, ["left", "right"], "Multiplied both pans by −1.")]));
    expect(reversePlan(reversePlan(plan))).toEqual(plan);
  });

  it("round trip holds for a rejected (empty) plan", () => {
    const plan = equationMorphPlan(makeTx([], { rejected: true, rejection: { code: "c", message: "m" } }));
    expect(reversePlan(reversePlan(plan))).toEqual(plan);
  });

  it("toggles an 'Undo: ' prefix onto describe without duplicating it on round trip", () => {
    const plan = equationMorphPlan(makeTx([makeOp("add", "leftUnits", 2, ["left"], "2 unit tiles joined.")]));
    const once = reversePlan(plan);
    expect(once.phases[0].describe.startsWith("Undo: ")).toBe(true);
    const twice = reversePlan(once);
    expect(twice.phases[0].describe).toBe(plan.phases[0].describe);
  });
});

/* ──────────────────────────────────────── determinism ────────────────────────────────────────── */

describe("determinism", () => {
  it("the same transaction (by value, not by reference) compiles to a deep-equal plan every time", () => {
    const build = () =>
      makeTx([
        makeOp("distribute", "leftX", 6, ["left"], "Gave the ×3 to the x inside every bracket."),
        makeOp("subtract", "leftUnits", -3, ["left"], "left constant leaves."),
        makeOp("subtract", "rightUnits", -3, ["right"], "right constant leaves."),
      ]);
    const planA = equationMorphPlan(build());
    const planB = equationMorphPlan(build());
    expect(planA).toEqual(planB);
    // Calling twice on the identical object gives the identical result too.
    const tx = build();
    expect(equationMorphPlan(tx)).toEqual(equationMorphPlan(tx));
  });
});

/* ─────────────────────────────────── no-string-crossfade invariant ───────────────────────────── */

describe("no phase is a motionless text replacement", () => {
  // Walk every phase of every fixture plan built above and assert each carries a real actor and
  // a motion drawn only from the documented 9-verb vocabulary — never a bare text swap.
  const fixturePlans: MorphPlan<FixtureTarget>[] = [
    equationMorphPlan(makeTx([makeOp("add", "leftUnits", 3, ["left"], "3 unit tiles joined the left pan.")])),
    equationMorphPlan(makeTx([makeOp("subtract", "leftX", -1, ["left"], "Took 1 x-tile off the left pan.")])),
    equationMorphPlan(makeTx([makeOp("cancel", "leftUnits", -2, ["left"], "Formed 2 zero pairs on the left pan.")])),
    equationMorphPlan(makeTx([makeOp("divide", "equation", 3, ["left", "right"], "Shared both pans into 3 equal groups.")])),
    equationMorphPlan(makeTx([makeOp("distribute", "leftX", 6, ["left"], "Gave the ×3 to the x inside the bracket.")])),
    equationMorphPlan(makeTx([makeOp("factor", "leftX", -6, ["left"], "Gathered the x terms under one factor.")])),
    equationMorphPlan(makeTx([makeOp("negate", "equation", -1, ["left", "right"], "Multiplied both pans by −1.")])),
    equationMorphPlan(makeTx([makeOp("reorient", "relation", 0, ["left", "right"], "Turned the comparator round.")])),
    equationMorphPlan(
      makeTx([makeOp("restore", "equation", 0, ["left", "right"], "Put every tile back where the problem started.")])
    ),
    equationMorphPlan(
      makeTx([
        makeOp("subtract", "leftUnits", -3, ["left"], "left leaves."),
        makeOp("subtract", "rightUnits", -3, ["right"], "right leaves."),
      ])
    ),
  ];
  const validMotions = new Set([
    "join",
    "leave",
    "collapse",
    "partition",
    "branch",
    "gather",
    "reflect",
    "pivot",
    "rewind",
  ]);

  for (const plan of fixturePlans) {
    for (const [i, phase] of plan.phases.entries()) {
      it(`phase ${i} of "${plan.phases[0]?.describe.slice(0, 30)}…" carries real actors and a real motion`, () => {
        expect(phase.actors.length).toBeGreaterThan(0);
        expect(validMotions.has(phase.motion)).toBe(true);
        // A crossfade would leave fromRole===toRole with nothing on stage; every phase here has
        // at least one actor, so that degenerate case never occurs.
        expect(phase.actors.length > 0).toBe(true);
      });
    }
  }

  it("reducedMotion's single phase is the only allowed zero-travel phase, and it still carries actors + describe", () => {
    const plan = equationMorphPlan(
      makeTx([
        makeOp("add", "leftUnits", 2, ["left"], "2 unit tiles joined the left pan."),
        makeOp("subtract", "rightUnits", -1, ["right"], "1 unit tile left the right pan."),
      ])
    );
    const reduced = reducedMotion(plan);
    expect(reduced.phases[0].actors.length).toBeGreaterThan(0);
    expect(reduced.phases[0].describe.length).toBeGreaterThan(0);
  });
});

/* ───────────── S208 review condition 1: an op with no holders still has something on stage ───────────── */

describe("an operation with an empty `sides` (only reachable from JavaScript)", () => {
  /** `sides` is a non-empty tuple in mmipTypes.ts, so this shape cannot be written in TypeScript.
   * A transaction replayed from a JSON log can still carry it, and the guard exists for exactly
   * that caller. The cast is the point of the test, not a workaround for one. */
  const emptySided = (kind: MmipOperationKind, target: FixtureTarget): MmipOperation<FixtureTarget> =>
    ({ kind, target, amount: 1, sides: [], describe: "An operation that named no holder." } as unknown as MmipOperation<FixtureTarget>);

  it("never compiles to a phase with nothing on stage — it becomes a whole-equation gesture", () => {
    const plan = equationMorphPlan(makeTx([emptySided("subtract", "leftUnits")]));
    expect(plan.rejected).toBe(false);
    expect(plan.phases).toHaveLength(1);
    expect(plan.phases[0].actors).toEqual(["leftUnits:equation"]);
    expect(plan.phases[0].actors.length).toBeGreaterThan(0);
    expect(plan.phases[0].motion).toBe("leave");
    // not one-sided, so it reads as the equation acting as one object
    expect(plan.phases[0].fromRole).toBe("equation-slot");
    expect(plan.phases[0].stagger).toBe(0);
  });

  it("does not throw, and survives both reduction and reversal", () => {
    const plan = equationMorphPlan(makeTx([emptySided("add", "rightUnits"), emptySided("divide", "equation")]));
    expect(plan.phases.map((p) => p.actors)).toEqual([["rightUnits:equation"], ["equation:equation"]]);
    expect(reducedMotion(plan).phases[0].actors).toEqual(["rightUnits:equation", "equation:equation"]);
    expect(reversePlan(plan).phases.every((p) => p.actors.length > 0)).toBe(true);
    expect(reversePlan(reversePlan(plan))).toEqual(plan);
  });

  it("an empty-sided op is never merged with its neighbour — merging needs two real, opposite sides", () => {
    const plan = equationMorphPlan(makeTx([emptySided("subtract", "leftUnits"), emptySided("subtract", "rightUnits")]));
    expect(plan.phases).toHaveLength(2);
  });
});
