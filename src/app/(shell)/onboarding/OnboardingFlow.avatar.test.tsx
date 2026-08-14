// @vitest-environment jsdom
/**
 * WS-J's avatar stage against the REAL, unmodified avatars manifest — every entry is
 * `enabled: false` today, so this is a mandatory screen with zero selectable options: a dead
 * stage. The honest behavior is to skip it entirely (grade -> goal, exactly as before this pass)
 * rather than ship a screen with nothing to choose. See OnboardingFlow.avatarEnabled.test.tsx for
 * the stage actually rendering and working, mocked ahead of real production art.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import OnboardingFlow from "./OnboardingFlow";
import { progressStore } from "@/lib/progress";
import { AVATARS } from "@/lib/avatars";

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("onboarding avatar stage — real manifest (nothing enabled)", () => {
  it("confirms the fixture this file relies on: nothing in the real manifest is enabled", () => {
    expect(AVATARS.some((a) => a.enabled)).toBe(false);
  });

  it("clicking a grade goes straight to the goal stage; the avatar stage never renders", () => {
    render(<OnboardingFlow />);
    fireEvent.click(screen.getByRole("button", { name: /keep maggie's trail/i }));
    fireEvent.click(screen.getByRole("button", { name: /grade 3/i }));
    expect(screen.getByText(/what brings you here/i)).toBeTruthy();
    expect(screen.queryByText(/choose your avatar/i)).toBeNull();
  });

  it("never writes an avatarId when the stage is skipped", () => {
    render(<OnboardingFlow />);
    fireEvent.click(screen.getByRole("button", { name: /keep maggie's trail/i }));
    fireEvent.click(screen.getByRole("button", { name: /kindergarten/i }));
    fireEvent.click(screen.getByRole("button", { name: /keep up with school/i }));
    expect(progressStore.load().avatarId).toBeUndefined();
  });
});
