// @vitest-environment jsdom
/**
 * WS-J's profile-page identity section, against the REAL, unmodified avatars manifest. Since the
 * S244 atomic release (AVATAR_V4_PRODUCTION_RUNBOOK.md: "the complete 60-item S244 library passed
 * independent whole-library review and is enabled as one atomic runtime release"; VARIANT_STATE.md
 * "Production avatars enabled: 60/60"), every band ships 15 enabled options, so the picker presents
 * real choices — never a placeholder slot and never the pre-release empty state. See
 * ProfileClient.avatarEnabled.test.tsx for the pick-persist flow against a mocked single-enabled
 * manifest.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import React from "react";
import ProfileClient, { type ProfileCourse } from "./ProfileClient";
import { progressStore } from "@/lib/progress";
import { AVATAR_PLACEHOLDER_SRC } from "@/lib/avatars";

const courses: ProfileCourse[] = [];

beforeEach(() => {
  window.localStorage.clear();
});
afterEach(cleanup);

describe("ProfileClient identity section — real manifest (60/60 enabled since the S244 atomic release)", () => {
  it("shows the default brand name and a placeholder avatar before any choice is made", async () => {
    render(<ProfileClient courses={courses} />);
    expect(await screen.findByText("Maggie's Trail")).toBeTruthy();
    expect(screen.getByRole("button", { name: /change avatar/i })).toBeTruthy();
  });

  it("shows the personalized name once displayName is set", async () => {
    const p = progressStore.load();
    p.displayName = "Ari";
    progressStore.save(p);
    render(<ProfileClient courses={courses} />);
    expect(await screen.findByText("Ari's Trail")).toBeTruthy();
  });

  it("'Change avatar' opens the picker presenting the band's 15 real released choices", async () => {
    // Re-pinned (S331): the pre-release expectation here (0 radios + the honest empty state) is
    // stale against the recorded product decision — AVATAR_V4_PRODUCTION_RUNBOOK.md's atomic
    // 60/60 release. With no grade signal the picker defaults to the explorer band: 12 human
    // portraits + 3 symbol options (avatar-408/409/411) = 15 enabled tiles, per the runbook's
    // release table. The empty state must be gone, and no tile may ever be a placeholder.
    render(<ProfileClient courses={courses} />);
    const toggle = await screen.findByRole("button", { name: /change avatar/i });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(toggle);
    expect(screen.getByRole("heading", { name: /choose your avatar/i })).toBeTruthy();
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("button", { name: /^close$/i })).toBeTruthy();
    // Scoped to the avatar panel: ProfileClient's own "Text size" preference control is also a
    // radio group elsewhere on the page and must not be swept up here.
    const panel = document.getElementById("avatar-picker-panel")!;
    const tiles = within(panel).queryAllByRole("radio");
    expect(tiles).toHaveLength(15);
    // Every tile renders real released art — the honest placeholder is never a selectable choice.
    for (const tile of tiles) {
      const src = tile.querySelector("img")?.getAttribute("src") ?? "";
      expect(src).not.toBe(AVATAR_PLACEHOLDER_SRC);
      expect(src).toMatch(/^\/avatars\/avatar-\d{3}-256\.webp$/);
    }
    // The pre-release empty state no longer appears anywhere in the released picker.
    expect(within(panel).queryByText(/premium portraits for this collection are still being prepared/i)).toBeNull();
    expect(within(panel).queryByText(/placeholder portraits are never shown as choices/i)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /^close$/i }));
    expect(screen.queryByRole("heading", { name: /choose your avatar/i })).toBeNull();
  });

  it("stores only restrained customization and explains how hair and skin appearance are chosen", async () => {
    const profile = progressStore.load();
    profile.avatarId = "avatar-101";
    progressStore.save(profile);
    render(<ProfileClient courses={courses} />);
    fireEvent.click(await screen.findByRole("button", { name: /change avatar/i }));

    expect(screen.getByRole("heading", { name: "Customize" })).toBeTruthy();
    expect(screen.getByText(/different complete portrait for another hair or skin appearance/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Round" }));
    fireEvent.click(screen.getByRole("button", { name: "Teal" }));
    fireEvent.click(screen.getByRole("button", { name: "Pi" }));
    expect(progressStore.load().avatarCustomization).toEqual({
      glasses: "round",
      accent: "teal",
      badge: "pi"
    });
  });
});
