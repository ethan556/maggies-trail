// @vitest-environment jsdom
/**
 * WS-J's avatar stage against the REAL, unmodified avatars manifest. Production art landed
 * 2026-08-14, so the stage that this pass placed between "grade" and "goal" now actually renders:
 * a learner picks a grade and is offered that grade's collection before being asked about goals.
 *
 * The second describe keeps the OTHER half of the contract under test — the `HAS_ENABLED_AVATARS`
 * guard in OnboardingFlow.tsx. If every entry were ever disabled again (art pulled after a QA
 * rejection), the stage would be a mandatory screen with nothing to choose, so the flow skips it
 * entirely rather than showing a dead step. That guard is not dead code and does not lose coverage
 * just because the manifest is currently full.
 *
 * See OnboardingFlow.avatarEnabled.test.tsx for selecting, committing and continuing.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import OnboardingFlow from "./OnboardingFlow";
import { progressStore } from "@/lib/progress";
import { AVATARS } from "@/lib/avatars";

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("onboarding avatar stage — real manifest, art landed", () => {
  it("confirms the fixture this file relies on: every entry in the real manifest is enabled", () => {
    expect(AVATARS.every((a) => a.enabled)).toBe(true);
    expect(AVATARS).toHaveLength(60);
  });

  it("clicking a grade opens the avatar stage before the goal stage", () => {
    render(<OnboardingFlow />);
    fireEvent.click(screen.getByRole("button", { name: /keep maggie's trail/i }));
    fireEvent.click(screen.getByRole("button", { name: /grade 3/i }));
    expect(screen.getByText(/choose your avatar/i)).toBeTruthy();
    expect(screen.queryByText(/what brings you here/i)).toBeNull();
    // The grade's own collection opens by default (OPTIMIZATION_PLAN_V3.md:148).
    expect(screen.getByText("Explorer (3–5)")).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(15);
  });

  it("writes no avatarId while the stage is merely displayed — only an actual pick commits", () => {
    render(<OnboardingFlow />);
    fireEvent.click(screen.getByRole("button", { name: /keep maggie's trail/i }));
    fireEvent.click(screen.getByRole("button", { name: /kindergarten/i }));
    expect(progressStore.load().avatarId).toBeUndefined();
    fireEvent.click(screen.getByRole("button", { name: /^continue$/i }));
    expect(screen.getByText(/what brings you here/i)).toBeTruthy();
    expect(progressStore.load().avatarId).toBeUndefined();
  });
});

describe("onboarding avatar stage — a manifest with nothing enabled (art pulled)", () => {
  vi.resetModules();
  vi.doMock("@/lib/avatars", async () => {
    const actual = await vi.importActual<typeof import("@/lib/avatars")>("@/lib/avatars");
    const AVATARS = actual.AVATARS.map((a) => ({ ...a, enabled: false }));
    return {
      ...actual,
      AVATARS,
      isValidAvatarId: () => false,
      getAvatarSrc: () => undefined,
      getAvatarsForAgeBand: () => [],
      getDefaultAvatarForGrade: () => undefined
    };
  });

  async function renderMockedFlow() {
    const { default: MockedFlow } = await import("./OnboardingFlow");
    return render(<MockedFlow />);
  }

  it("skips the dead stage: a grade click goes straight to goal, and no avatarId is written", async () => {
    await renderMockedFlow();
    fireEvent.click(screen.getByRole("button", { name: /keep maggie's trail/i }));
    fireEvent.click(screen.getByRole("button", { name: /kindergarten/i }));
    expect(screen.getByText(/what brings you here/i)).toBeTruthy();
    expect(screen.queryByText(/choose your avatar/i)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /keep up with school/i }));
    const { progressStore: store } = await import("@/lib/progress");
    expect(store.load().avatarId).toBeUndefined();
  });
});
