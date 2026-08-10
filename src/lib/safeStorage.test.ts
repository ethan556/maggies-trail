// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { storageEntries, storageGet, storageRemove, storageSet } from "./safeStorage";

beforeEach(() => {
  localStorage.clear();
  storageRemove("fallback-only");
});

describe("safeStorage", () => {
  it("mirrors persisted values and removes both copies", () => {
    expect(storageSet("x", "1")).toBe(true);
    expect(storageGet("x")).toBe("1");
    expect(storageEntries("x")).toEqual([["x", "1"]]);
    storageRemove("x");
    expect(storageGet("x")).toBeNull();
  });

  it("does not resurrect a persisted key removed outside the helper", () => {
    storageSet("x", "1");
    localStorage.removeItem("x");
    expect(storageGet("x")).toBeNull();
    expect(storageEntries("x")).toEqual([]);
  });

  it("keeps a session copy when localStorage throws", () => {
    const set = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    expect(storageSet("fallback-only", "safe")).toBe(false);
    set.mockRestore();
    const get = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    expect(storageGet("fallback-only")).toBe("safe");
    expect(storageEntries("fallback")).toEqual([["fallback-only", "safe"]]);
    get.mockRestore();
  });
});
