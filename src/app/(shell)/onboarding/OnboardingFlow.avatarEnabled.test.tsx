// @vitest-environment jsdom
/**
 * WS-J's avatar stage actually being used. Written mocked-ahead-of-art; since production art landed
 * 2026-08-14 it runs against the REAL manifest and the REAL files, with no mock at all (see
 * OnboardingFlow.avatar.test.tsx for the stage's presence/absence contract). Confirms the stage the
 * architecture pass placed between "grade" and "goal" works end to end: it opens on the
 * grade-appropriate collection, commits the choice immediately (so it survives an abandoned flow),
 * and Continue always advances regardless of whether a choice was made.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { existsSync } from "node:fs";
import { join } from "node:path";
import React from "react";

import OnboardingFlow from "./OnboardingFlow";
import { progressStore } from "@/lib/progress";
import { getAvatar } from "@/lib/avatars";

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("onboarding avatar stage — picking a real avatar", () => {
  it("a Kindergarten pick opens the avatar stage before goal, with the grade-appropriate tile selectable", () => {
    render(<OnboardingFlow />);
    fireEvent.click(screen.getByRole("button", { name: /keep maggie's trail/i }));
    fireEvent.click(screen.getByRole("button", { name: /kindergarten/i }));

    expect(screen.getByText(/choose your avatar/i)).toBeTruthy();
    expect(screen.queryByText(/what brings you here/i)).toBeNull();
    const tile = screen.getByRole("radio", { name: "Avatar 1" });
    expect((tile as HTMLButtonElement).disabled).toBe(false);
  });

  it("selecting a tile commits avatarId immediately, before Continue is pressed", () => {
    render(<OnboardingFlow />);
    fireEvent.click(screen.getByRole("button", { name: /keep maggie's trail/i }));
    fireEvent.click(screen.getByRole("button", { name: /kindergarten/i }));
    fireEvent.click(screen.getByRole("radio", { name: "Avatar 1" }));

    expect(progressStore.load().avatarId).toBe("avatar-001");
    // Visibly reflected too, so it "sticks even if the learner bails" is actually true on screen.
    expect(screen.getByRole("radio", { name: "Avatar 1 selected" })).toBeTruthy();
    // And the id it stored is backed by real art, not just a well-formed string.
    const stored = getAvatar(progressStore.load().avatarId!)!;
    expect(existsSync(join(process.cwd(), "public", stored.src256))).toBe(true);
    expect(existsSync(join(process.cwd(), "public", stored.src512))).toBe(true);
  });

  it("Continue advances to goal after a choice is made, carrying the same grade forward", () => {
    render(<OnboardingFlow />);
    fireEvent.click(screen.getByRole("button", { name: /keep maggie's trail/i }));
    fireEvent.click(screen.getByRole("button", { name: /kindergarten/i }));
    fireEvent.click(screen.getByRole("radio", { name: "Avatar 1" }));
    fireEvent.click(screen.getByRole("button", { name: /^continue$/i }));

    expect(screen.getByText(/what brings you here/i)).toBeTruthy();
    expect(screen.getByText(/kindergarten — good to have you/i)).toBeTruthy();
    // The choice survives the stage transition.
    expect(progressStore.load().avatarId).toBe("avatar-001");
  });

  it("Continue advances even with no avatar chosen — picking one is never a blocker", () => {
    render(<OnboardingFlow />);
    fireEvent.click(screen.getByRole("button", { name: /keep maggie's trail/i }));
    fireEvent.click(screen.getByRole("button", { name: /kindergarten/i }));
    fireEvent.click(screen.getByRole("button", { name: /^continue$/i }));

    expect(screen.getByText(/what brings you here/i)).toBeTruthy();
    expect(progressStore.load().avatarId).toBeUndefined();
  });

  it("a Grade 9 learner is offered the summit collection, not the early one", () => {
    render(<OnboardingFlow />);
    fireEvent.click(screen.getByRole("button", { name: /keep maggie's trail/i }));
    fireEvent.click(screen.getByRole("button", { name: /algebra 1/i }));
    expect(screen.getByText("Summit (9–13)")).toBeTruthy();
    const tiles = screen.getAllByRole("radio");
    expect(tiles).toHaveLength(15);
    fireEvent.click(tiles[0]);
    expect(progressStore.load().avatarId).toBe("avatar-301");
  });
});
