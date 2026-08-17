// @vitest-environment jsdom
/**
 * WS-J's profile-page identity section, against the REAL, unmodified avatars manifest (everything
 * `enabled: false` today). The picker is reachable and shows one honest empty state rather than
 * repeating a placeholder as fake choices — see ProfileClient.avatarEnabled.test.tsx for the
 * picker actually choosing something, mocked ahead of real production art.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import React from "react";
import ProfileClient, { type ProfileCourse } from "./ProfileClient";
import { progressStore } from "@/lib/progress";

const courses: ProfileCourse[] = [];

beforeEach(() => {
  window.localStorage.clear();
});
afterEach(cleanup);

describe("ProfileClient identity section — real manifest (nothing enabled)", () => {
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

  it("'Change avatar' opens the picker without presenting placeholder slots as choices", async () => {
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
    expect(within(panel).queryAllByRole("radio")).toHaveLength(0);
    expect(within(panel).getByText(/premium portraits for this collection are still being prepared/i)).toBeTruthy();
    expect(within(panel).getByText(/placeholder portraits are never shown as choices/i)).toBeTruthy();

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
