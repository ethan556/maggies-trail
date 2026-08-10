import { describe, expect, it } from "vitest";
import {
  afterAttempt,
  backoffMs,
  BACKOFF_MAX_MS,
  COALESCE_MS,
  shouldSync,
  type SchedulerState
} from "./syncScheduler";

const base = (over: Partial<SchedulerState> = {}): SchedulerState => ({
  lastAttemptAt: null,
  consecutiveErrors: 0,
  inFlight: false,
  signedIn: true,
  online: true,
  ...over
});

const NOW = 1_000_000;

describe("shouldSync — hard blocks", () => {
  it("never runs two syncs at once", () => {
    const d = shouldSync(base({ inFlight: true }), "manual", NOW);
    expect(d.sync).toBe(false);
    expect(d.reason).toMatch(/already running/);
  });

  it("does nothing when signed out", () => {
    expect(shouldSync(base({ signedIn: false }), "lesson-complete", NOW).sync).toBe(false);
  });

  it("does nothing when offline", () => {
    expect(shouldSync(base({ online: false }), "lesson-complete", NOW).sync).toBe(false);
  });
});

describe("shouldSync — coalescing", () => {
  it("ambient triggers coalesce: a focus right after a sync is skipped", () => {
    const s = base({ lastAttemptAt: NOW - 5_000 });
    expect(shouldSync(s, "focus", NOW).sync).toBe(false);
    expect(shouldSync(s, "interval", NOW).sync).toBe(false);
  });

  it("ambient triggers run once the window has passed", () => {
    const s = base({ lastAttemptAt: NOW - (COALESCE_MS + 1) });
    expect(shouldSync(s, "focus", NOW).sync).toBe(true);
  });

  it("a finished lesson bypasses coalescing — real work goes up immediately", () => {
    const s = base({ lastAttemptAt: NOW - 1_000 }); // just synced
    expect(shouldSync(s, "focus", NOW).sync).toBe(false);
    expect(shouldSync(s, "lesson-complete", NOW).sync).toBe(true);
  });

  it("coming back online bypasses coalescing", () => {
    const s = base({ lastAttemptAt: NOW - 1_000 });
    expect(shouldSync(s, "online", NOW).sync).toBe(true);
  });
});

describe("shouldSync — backoff", () => {
  it("grows exponentially and is capped", () => {
    expect(backoffMs(0)).toBe(0);
    expect(backoffMs(1)).toBe(2_000);
    expect(backoffMs(2)).toBe(4_000);
    expect(backoffMs(3)).toBe(8_000);
    expect(backoffMs(99)).toBe(BACKOFF_MAX_MS);
  });

  it("holds off automatic triggers while backing off", () => {
    const s = base({ consecutiveErrors: 3, lastAttemptAt: NOW - 1_000 }); // needs 8s
    const d = shouldSync(s, "lesson-complete", NOW);
    expect(d.sync).toBe(false);
    expect(d.reason).toMatch(/backing off/);
  });

  it("lets the trigger through once the backoff has elapsed", () => {
    const s = base({ consecutiveErrors: 3, lastAttemptAt: NOW - 9_000 });
    expect(shouldSync(s, "lesson-complete", NOW).sync).toBe(true);
  });

  it("ALWAYS allows an explicit manual retry, even mid-backoff", () => {
    const s = base({ consecutiveErrors: 9, lastAttemptAt: NOW - 10 });
    expect(shouldSync(s, "manual", NOW).sync).toBe(true);
  });
});

describe("afterAttempt", () => {
  it("clears the error count on success and releases the in-flight lock", () => {
    const s = afterAttempt(base({ inFlight: true, consecutiveErrors: 4 }), true, NOW);
    expect(s.consecutiveErrors).toBe(0);
    expect(s.inFlight).toBe(false);
    expect(s.lastAttemptAt).toBe(NOW);
  });

  it("increments the error count on failure, so the next backoff is longer", () => {
    const s = afterAttempt(base({ inFlight: true, consecutiveErrors: 1 }), false, NOW);
    expect(s.consecutiveErrors).toBe(2);
    expect(backoffMs(s.consecutiveErrors)).toBe(4_000);
  });
});
