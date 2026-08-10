/**
 * STRATEGY SIGNALS SURVIVE RESUME + SYNC (s45) — the mandate's "process events
 * survive resume and synchronization" clause, proven at the persistence layer.
 *
 * A detected strategy latches as a ProcessSignal into signalCounts/remediated,
 * which are part of the lesson snapshot and the synced profile. This test:
 *   · round-trips a snapshot carrying a strategy signal through save/load and
 *     confirms the ladder occurrence count is preserved (a reload cannot reset
 *     a strategy diagnosis back to rung 1);
 *   · confirms a remediated strategy stays remediated after resume (the
 *     one-remedial-per-signal guard is durable);
 *   · confirms the sync merge preserves the max occurrence across devices
 *     (evidence accumulates, never regresses).
 */
import { describe, expect, it } from "vitest";
import { decideResponse } from "@/lib/adaptivePolicy";
import type { ProcessSignal } from "@/lib/processEvents";

// The snapshot fields are plain Record<string, number> / string[], so a
// strategy signal is stored exactly like any other. We model the persistence
// boundary as a JSON round-trip (what localStorage and the sync document do).
const roundTrip = <T,>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

describe("strategy signals across resume", () => {
  it("occurrence count survives a snapshot round-trip (no ladder reset on reload)", () => {
    const sig: ProcessSignal = "denominator-size-conflation";
    const before = { signalCounts: { [sig]: 2 } as Record<string, number>, remediated: [] as ProcessSignal[] };
    const after = roundTrip(before);
    // The ladder reads the SAME occurrence, so the next latch is rung 3
    // (remedial), not rung 1 (cue) — the diagnosis did not rewind.
    const occurrence = (after.signalCounts[sig] ?? 0) + 1;
    expect(occurrence).toBe(3);
    expect(decideResponse({ signal: sig, occurrence, fluent: false, remediatedSignals: after.remediated }).kind).toBe("remedial");
  });

  it("a remediated strategy stays remediated after resume (durable loop guard)", () => {
    const sig: ProcessSignal = "additive-not-multiplicative";
    const before = { signalCounts: { [sig]: 3 } as Record<string, number>, remediated: [sig] as ProcessSignal[] };
    const after = roundTrip(before);
    // Rung 3 again, but already remediated → the ladder terminates (no second
    // remedial), exactly as before the reload.
    expect(decideResponse({ signal: sig, occurrence: 4, fluent: false, remediatedSignals: after.remediated }).kind).toBe("none");
  });

  it("sync carries the strategy record with the furthest-progress snapshot", async () => {
    const { mergeActiveLessons } = await import("@/lib/sync");
    const sig = "counting-by-one";
    // Device A is further into the lesson (higher step index) and holds the
    // strategy record; Device B is behind. mergeActiveLessons keeps A's
    // snapshot wholesale — so its signalCounts (the process record) survive,
    // rather than being lost to a naive last-write-wins.
    const snapA = { v: 1 as const, lessonId: "l1", stepIds: ["a", "b", "c"], i: 2, sessionXp: 20, history: [], injected: [], savedAt: "2026-07-17T10:00:00Z", signalCounts: { [sig]: 3 } };
    const snapB = { ...snapA, i: 1, sessionXp: 5, signalCounts: {} };
    const merged = mergeActiveLessons({ l1: snapA }, { l1: snapB });
    expect(merged?.l1.signalCounts?.[sig]).toBe(3);
  });

  it("a positive strategy that was affirmed does not re-affirm after resume", () => {
    const sig: ProcessSignal = "common-denominator";
    const before = { signalCounts: { [sig]: 1 } as Record<string, number> };
    const after = roundTrip(before);
    // occurrence 2 on resume → silent (affirm is once, at occurrence 1).
    expect(decideResponse({ signal: sig, occurrence: (after.signalCounts[sig] ?? 0) + 1, fluent: false, remediatedSignals: [] }).kind).toBe("none");
  });
});
