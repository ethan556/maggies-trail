// @vitest-environment jsdom
/**
 * WS-J propagation — the dashboard header shows the active learner's avatar beside "Your trail",
 * falling back to the honest placeholder, reading Profile.avatarId the same way every other WS-J
 * surface does. Against the REAL, unmodified avatars manifest (everything `enabled: false` today)
 * — see DashboardClient.avatarEnabled.test.tsx for a mocked-enabled id actually resolving.
 * DashboardClient.rec.test.ts owns the pure dashboardRecommendation contract; this file only
 * exercises the rendered component.
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

describe("DashboardClient header avatar — real manifest, everything disabled today", () => {
  it("shows the honest placeholder beside 'Your trail' before any avatar is chosen", () => {
    render(<DashboardClient courses={[]} />);
    const h1 = screen.getByRole("heading", { level: 1, name: "Your trail" });
    const img = h1.parentElement?.querySelector("img");
    expect(img?.getAttribute("src")).toBe(AVATAR_PLACEHOLDER_SRC);
  });

  it("still falls back to the placeholder for a chosen-but-disabled real manifest id", () => {
    const p = progressStore.load();
    p.avatarId = "avatar-201";
    progressStore.save(p);
    render(<DashboardClient courses={[]} />);
    const h1 = screen.getByRole("heading", { level: 1, name: "Your trail" });
    const img = h1.parentElement?.querySelector("img");
    expect(img?.getAttribute("src")).toBe(AVATAR_PLACEHOLDER_SRC);
  });
});
