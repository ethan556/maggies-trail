// @vitest-environment jsdom
/**
 * WS-J's avatar stage with one complete enabled band — mocked ahead of real production art
 * landing (today the real manifest has zero enabled entries; see OnboardingFlow.avatar.test.tsx
 * for that honest, current-day behavior). Confirms the stage the architecture pass placed between
 * "grade" and "goal" actually renders and works once art ships, with no further wiring: opens on
 * the grade-appropriate collection, commits the choice immediately (so it survives an abandoned
 * flow), and Continue always advances regardless of whether a choice was made.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";

vi.mock("@/lib/avatars", async () => {
  const actual = await vi.importActual<typeof import("@/lib/avatars")>("@/lib/avatars");
  const AVATARS = actual.AVATARS.map((a) => ({ ...a, enabled: a.ageBand === "early" }));
  const isValidAvatarId = (id: string) => AVATARS.some((a) => a.id === id && a.enabled);
  const getAvatar = (id: string) => AVATARS.find((a) => a.id === id);
  return {
    ...actual,
    AVATARS,
    isValidAvatarId,
    getAvatar,
    getAvatarSrc: (id: string, size: 256 | 512) => {
      if (!isValidAvatarId(id)) return undefined;
      const a = getAvatar(id)!;
      return size === 256 ? a.src256 : a.src512;
    },
    getAvatarsForAgeBand: (band: string) =>
      AVATARS.filter((a) => a.ageBand === band && a.enabled).sort((x, y) => x.order - y.order),
    getDefaultAvatarForGrade: (grade: number) =>
      AVATARS.filter((a) => a.ageBand === actual.gradeToAgeBand(grade) && a.enabled).sort((x, y) => x.order - y.order)[0]
  };
});

// Imported AFTER the mock is declared (vi.mock is hoisted above these imports by Vitest, so the
// mocked module is what OnboardingFlow — and the AvatarPicker/AvatarDisplay it renders — see).
const { default: OnboardingFlow } = await import("./OnboardingFlow");
const { progressStore } = await import("@/lib/progress");

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("onboarding avatar stage — one complete band enabled", () => {
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
  });

  it("Continue advances to goal after a choice is made, carrying the same grade forward", () => {
    render(<OnboardingFlow />);
    fireEvent.click(screen.getByRole("button", { name: /keep maggie's trail/i }));
    fireEvent.click(screen.getByRole("button", { name: /kindergarten/i }));
    fireEvent.click(screen.getByRole("radio", { name: "Avatar 1" }));
    fireEvent.click(screen.getByRole("button", { name: /^continue$/i }));

    expect(screen.getByText(/what brings you here/i)).toBeTruthy();
    expect(screen.getByText(/kindergarten — good to have you/i)).toBeTruthy();
  });

  it("Continue advances even with no avatar chosen — picking one is never a blocker", () => {
    render(<OnboardingFlow />);
    fireEvent.click(screen.getByRole("button", { name: /keep maggie's trail/i }));
    fireEvent.click(screen.getByRole("button", { name: /kindergarten/i }));
    fireEvent.click(screen.getByRole("button", { name: /^continue$/i }));

    expect(screen.getByText(/what brings you here/i)).toBeTruthy();
    expect(progressStore.load().avatarId).toBeUndefined();
  });

  it("skips the avatar stage for a grade whose complete collection is not released", () => {
    render(<OnboardingFlow />);
    fireEvent.click(screen.getByRole("button", { name: /keep maggie's trail/i }));
    fireEvent.click(screen.getByRole("button", { name: /^grade 3/i }));

    expect(screen.queryByText(/choose your avatar/i)).toBeNull();
    expect(screen.getByText(/what brings you here/i)).toBeTruthy();
  });
});
