// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { motionInit } from "./motionBootstrap";
import { LEGACY_PROFILE_KEY, profileKey, ROSTER_KEY } from "./storageKeys";

function runBootstrap() {
  // eslint-disable-next-line no-new-func
  new Function(motionInit)();
}

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.reduceMotion;
});

describe("pre-hydration motion preference", () => {
  it("reads the active roster child's namespaced profile", () => {
    localStorage.setItem(ROSTER_KEY, JSON.stringify({ activeId: "c2", children: [] }));
    localStorage.setItem(profileKey("c1"), JSON.stringify({ reduceMotion: false }));
    localStorage.setItem(profileKey("c2"), JSON.stringify({ reduceMotion: true }));
    runBootstrap();
    expect(document.documentElement.dataset.reduceMotion).toBe("true");
  });

  it("falls back to the legacy single-profile key", () => {
    localStorage.setItem(LEGACY_PROFILE_KEY, JSON.stringify({ reduceMotion: true }));
    runBootstrap();
    expect(document.documentElement.dataset.reduceMotion).toBe("true");
  });

  it("clears a stale attribute when the active preference is off", () => {
    document.documentElement.dataset.reduceMotion = "true";
    localStorage.setItem(profileKey("c1"), JSON.stringify({ reduceMotion: false }));
    runBootstrap();
    expect(document.documentElement.dataset.reduceMotion).toBeUndefined();
  });
});
