// @vitest-environment jsdom
/**
 * WS-J's profile-page identity section with at least one avatar enabled — mocked ahead of real
 * production art landing. Confirms picking a new avatar from the profile page persists to
 * Profile.avatarId via the real progress store (the same load -> mutate -> save -> setProfile
 * pattern the existing "Daily goal" control already uses) and the header preview updates.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import React from "react";

vi.mock("@/lib/avatars", async () => {
  const actual = await vi.importActual<typeof import("@/lib/avatars")>("@/lib/avatars");
  const AVATARS = actual.AVATARS.map((a) => (a.id === "avatar-001" ? { ...a, enabled: true } : a));
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
      AVATARS.filter((a) => a.ageBand === band && a.enabled).sort((x, y) => x.order - y.order)
  };
});

const { default: ProfileClient } = await import("./ProfileClient");
const { progressStore } = await import("@/lib/progress");
const { AVATAR_PLACEHOLDER_SRC } = await import("@/lib/avatars");

beforeEach(() => {
  window.localStorage.clear();
});
afterEach(cleanup);

describe("ProfileClient identity section — with an enabled avatar", () => {
  it("choosing a tile persists Profile.avatarId and updates the header preview", async () => {
    // avatar-001 (mocked enabled above) lives in the "early" band; seed the onboarding grade so
    // the picker opens on that band by default, exactly as a real Kindergarten-through-Grade-2
    // profile would.
    const p = progressStore.load();
    p.onboarding = { goal: "school", comfort: 2, correctCount: 0, recommendedLessonId: "x", completedAt: "2026-01-01", grade: 0 };
    progressStore.save(p);

    const { container } = render(<ProfileClient courses={[]} />);
    const toggle = await screen.findByRole("button", { name: /change avatar/i });

    // Before any choice: the header preview (the only <img> on the page before the picker opens)
    // shows the honest placeholder, not a guess.
    const headerImg = container.querySelector("img") as HTMLImageElement;
    expect(headerImg.getAttribute("src")).toBe(AVATAR_PLACEHOLDER_SRC);

    fireEvent.click(toggle);
    const panel = document.getElementById("avatar-picker-panel")!;
    fireEvent.click(within(panel).getByRole("radio", { name: "Avatar 1" }));

    expect(progressStore.load().avatarId).toBe("avatar-001");
    expect(within(panel).getByRole("radio", { name: "Avatar 1 selected" })).toBeTruthy();
    expect(headerImg.getAttribute("src")).toBe("/avatars/avatar-001-512.webp");
  });
});
