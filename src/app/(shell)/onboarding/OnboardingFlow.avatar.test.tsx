// @vitest-environment jsdom
/**
 * WS-J's avatar stage against the REAL, unmodified avatars manifest.
 *
 * Re-pinned (S326-R1 reconcile): the release allowlist in `src/lib/avatars.ts`
 * (`ENABLED_AVATAR_IDS`) was opened for the full 60-entry manifest by the authored
 * visual wave (commit c5af1f1; per-cohort QA evidence in
 * `reports/avatar-candidates/S244_*_QA.md`, asset parity enforced by `avatars.test.ts`).
 * The previous fixture here — "every entry is `enabled: false`, so the stage is dead and
 * must be skipped" — is therefore obsolete. This file now pins the REAL-manifest truths
 * the old one guarded from the other side: the stage renders between grade and goal, and
 * choosing an avatar is never a blocker (skipping writes nothing). See
 * OnboardingFlow.avatarEnabled.test.tsx for the band-scoped mocked behaviors.
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

describe("onboarding avatar stage — real manifest (release allowlist fully open)", () => {
  it("confirms the fixture this file relies on: all 60 manifest entries are enabled", () => {
    expect(AVATARS).toHaveLength(60);
    expect(AVATARS.every((a) => a.enabled)).toBe(true);
  });

  it("clicking a grade opens the avatar stage before goal; Continue advances to goal", () => {
    render(<OnboardingFlow />);
    fireEvent.click(screen.getByRole("button", { name: /keep maggie's trail/i }));
    fireEvent.click(screen.getByRole("button", { name: /grade 3/i }));
    expect(screen.getByText(/choose your avatar/i)).toBeTruthy();
    expect(screen.queryByText(/what brings you here/i)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /^continue$/i }));
    expect(screen.getByText(/what brings you here/i)).toBeTruthy();
  });

  it("never writes an avatarId when the stage is passed through without a pick", () => {
    render(<OnboardingFlow />);
    fireEvent.click(screen.getByRole("button", { name: /keep maggie's trail/i }));
    fireEvent.click(screen.getByRole("button", { name: /kindergarten/i }));
    fireEvent.click(screen.getByRole("button", { name: /^continue$/i }));
    fireEvent.click(screen.getByRole("button", { name: /keep up with school/i }));
    expect(progressStore.load().avatarId).toBeUndefined();
  });
});
