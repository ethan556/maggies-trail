// @vitest-environment jsdom
/**
 * WS-J propagation — the dashboard header shows the active learner's avatar beside "Your trail",
 * falling back to the honest placeholder, reading Profile.avatarId the same way every other WS-J
 * surface does. This file owns the FALLBACK half of that contract (no choice yet, or a stored id
 * that no longer resolves) — see DashboardClient.avatarEnabled.test.tsx for a real stored id
 * resolving against the shipped art. DashboardClient.rec.test.ts owns the pure
 * dashboardRecommendation contract; this file only exercises the rendered component.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";

import DashboardClient from "./DashboardClient";
import { progressStore } from "@/lib/progress";
import { AVATAR_PLACEHOLDER_SRC } from "@/lib/avatars";

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  // AssignmentsCard fetches /api/assignments on mount regardless of profile state; stub it so the
  // request settles quietly instead of hitting Node's fetch with an unresolvable relative URL.
  vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: false })));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("DashboardClient header avatar — the placeholder fallback path", () => {
  it("shows the honest placeholder beside 'Your trail' before any avatar is chosen", () => {
    render(<DashboardClient courses={[]} />);
    const h1 = screen.getByRole("heading", { level: 1, name: "Your trail" });
    const img = h1.parentElement?.querySelector("img");
    expect(img?.getAttribute("src")).toBe(AVATAR_PLACEHOLDER_SRC);
  });

  it("falls back to the placeholder for a stored id that no longer names a usable avatar", () => {
    // Not a hypothetical: a profile can carry an id from a build where that entry existed, or one
    // whose art was later pulled. Either way the header must degrade, never render a broken image.
    const p = progressStore.load();
    p.avatarId = "avatar-901";
    progressStore.save(p);
    render(<DashboardClient courses={[]} />);
    const h1 = screen.getByRole("heading", { level: 1, name: "Your trail" });
    const img = h1.parentElement?.querySelector("img");
    expect(img?.getAttribute("src")).toBe(AVATAR_PLACEHOLDER_SRC);
  });
});
