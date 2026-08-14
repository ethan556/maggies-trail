// @vitest-environment jsdom
/**
 * WS-J's profile-page identity section, choosing a real avatar. Written mocked-ahead-of-art; since
 * production art landed 2026-08-14 it runs against the REAL manifest and the REAL files, with no
 * mock at all. Confirms picking an avatar from the profile page persists to Profile.avatarId via
 * the real progress store (the same load -> mutate -> save -> setProfile pattern the existing
 * "Daily goal" control already uses) and that the header preview updates to the 512 profile asset.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { existsSync } from "node:fs";
import { join } from "node:path";
import React from "react";

import ProfileClient from "./ProfileClient";
import { progressStore } from "@/lib/progress";
import { AVATAR_PLACEHOLDER_SRC } from "@/lib/avatars";

beforeEach(() => {
  window.localStorage.clear();
});
afterEach(cleanup);

describe("ProfileClient identity section — choosing a real avatar", () => {
  it("choosing a tile persists Profile.avatarId and updates the header preview", () => {
    // avatar-001 lives in the "early" band; seed the onboarding grade so the picker opens on that
    // band by default, exactly as a real Kindergarten-through-Grade-2 profile would.
    const p = progressStore.load();
    p.onboarding = { goal: "school", comfort: 2, correctCount: 0, recommendedLessonId: "x", completedAt: "2026-01-01", grade: 0 };
    progressStore.save(p);

    const { container } = render(<ProfileClient courses={[]} />);
    const toggle = screen.getByRole("button", { name: /change avatar/i });

    // Before any choice: the header preview (the only <img> on the page before the picker opens)
    // shows the honest placeholder, not a guess.
    const headerImg = container.querySelector("img") as HTMLImageElement;
    expect(headerImg.getAttribute("src")).toBe(AVATAR_PLACEHOLDER_SRC);

    fireEvent.click(toggle);
    const panel = document.getElementById("avatar-picker-panel")!;
    fireEvent.click(within(panel).getByRole("radio", { name: "Avatar 1" }));

    expect(progressStore.load().avatarId).toBe("avatar-001");
    expect(within(panel).getByRole("radio", { name: "Avatar 1 selected" })).toBeTruthy();
    // The profile header uses the 512 asset, not the 256 grid one.
    expect(headerImg.getAttribute("src")).toBe("/avatars/avatar-001-512.webp");
    expect(existsSync(join(process.cwd(), "public", "avatars", "avatar-001-512.webp"))).toBe(true);
  });

  it("re-picking replaces the stored id rather than accumulating one", () => {
    const p = progressStore.load();
    p.onboarding = { goal: "school", comfort: 2, correctCount: 0, recommendedLessonId: "x", completedAt: "2026-01-01", grade: 0 };
    progressStore.save(p);

    render(<ProfileClient courses={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /change avatar/i }));
    const panel = document.getElementById("avatar-picker-panel")!;

    fireEvent.click(within(panel).getByRole("radio", { name: "Avatar 1" }));
    expect(progressStore.load().avatarId).toBe("avatar-001");
    fireEvent.click(within(panel).getByRole("radio", { name: "Avatar 4" }));
    expect(progressStore.load().avatarId).toBe("avatar-004");
    expect(within(panel).getAllByRole("radio").filter((r) => r.getAttribute("aria-checked") === "true")).toHaveLength(1);
  });
});
