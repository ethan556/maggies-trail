// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// syncClient is the network edge — stub it so we test the COORDINATOR, not fetch.
const syncNowMock = vi.fn();
vi.mock("./syncClient", () => ({
  syncNow: () => syncNowMock(),
  lastSyncedAt: () => null
}));

import { __resetForTests, getStatus, requestSync, subscribe } from "./autoSync";
import { authProvider, MockAuthProvider, _setAuthProviderForTests } from "./auth";
_setAuthProviderForTests(new MockAuthProvider()); // jsdom has no API routes

beforeEach(() => {
  __resetForTests();
  syncNowMock.mockReset();
  localStorage.clear();
});
afterEach(() => localStorage.clear());

async function signIn() {
  await authProvider.signIn("parent@example.com");
}

describe("autoSync coordinator", () => {
  it("does nothing at all when signed out — and does not pretend it synced", async () => {
    const ran = await requestSync("lesson-complete");
    expect(ran).toBe(false);
    expect(syncNowMock).not.toHaveBeenCalled();
    expect(getStatus().state).toBe("idle"); // never claims "ok"
    expect(getStatus().lastReason).toBe("signed out");
  });

  it("syncs on a finished lesson when signed in", async () => {
    await signIn();
    syncNowMock.mockResolvedValue({ state: "ok", at: "2026-05-01T00:00:00.000Z" });
    expect(await requestSync("lesson-complete")).toBe(true);
    expect(syncNowMock).toHaveBeenCalledTimes(1);
    expect(getStatus().state).toBe("ok");
  });

  it("coalesces ambient triggers — a burst of focus events causes ONE sync", async () => {
    await signIn();
    syncNowMock.mockResolvedValue({ state: "ok" });
    await requestSync("focus");
    await requestSync("focus");
    await requestSync("focus");
    expect(syncNowMock).toHaveBeenCalledTimes(1); // the rest were "synced recently"
    expect(getStatus().lastReason).toBe("synced recently");
  });

  it("a finished lesson still gets through right after an ambient sync", async () => {
    await signIn();
    syncNowMock.mockResolvedValue({ state: "ok" });
    await requestSync("focus");
    await requestSync("lesson-complete"); // high priority: bypasses coalescing
    expect(syncNowMock).toHaveBeenCalledTimes(2);
  });

  it("reports failure honestly and then backs off automatic triggers", async () => {
    await signIn();
    syncNowMock.mockResolvedValue({ state: "error", detail: "push failed (500)" });
    expect(await requestSync("lesson-complete")).toBe(false);
    expect(getStatus().state).toBe("error");

    // Immediately after a failure, an automatic trigger is held back.
    const ran = await requestSync("lesson-complete");
    expect(ran).toBe(false);
    expect(getStatus().lastReason).toMatch(/backing off/);
    expect(syncNowMock).toHaveBeenCalledTimes(1);
  });

  it("a manual retry always gets an attempt, even mid-backoff", async () => {
    await signIn();
    syncNowMock.mockResolvedValue({ state: "error" });
    await requestSync("lesson-complete"); // fails → backoff
    syncNowMock.mockResolvedValue({ state: "ok" });
    expect(await requestSync("manual")).toBe(true);
    expect(syncNowMock).toHaveBeenCalledTimes(2);
  });

  it("notifies subscribers as the state changes", async () => {
    await signIn();
    syncNowMock.mockResolvedValue({ state: "ok" });
    const seen: string[] = [];
    const unsub = subscribe((s) => seen.push(s.state));
    await requestSync("manual");
    unsub();
    expect(seen).toContain("syncing");
    expect(seen[seen.length - 1]).toBe("ok");
  });


  it("recovers its in-flight lock when the transport throws", async () => {
    await signIn();
    syncNowMock.mockRejectedValueOnce(new Error("boom")).mockResolvedValueOnce({ state: "ok" });
    expect(await requestSync("manual")).toBe(false);
    expect(getStatus().state).toBe("error");
    expect(await requestSync("manual")).toBe(true);
    expect(syncNowMock).toHaveBeenCalledTimes(2);
  });

  it("offline is surfaced, not swallowed", async () => {
    await signIn();
    syncNowMock.mockResolvedValue({ state: "offline", detail: "will sync when you're back online" });
    await requestSync("lesson-complete");
    expect(getStatus().state).toBe("offline");
    expect(getStatus().detail).toMatch(/back online/);
  });
});
