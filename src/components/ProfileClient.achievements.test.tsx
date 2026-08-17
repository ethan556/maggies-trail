// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import ProfileClient, { type ProfileCourse } from "./ProfileClient";
import { BADGES } from "@/lib/achievements";
import { progressStore } from "@/lib/progress";

const courses: ProfileCourse[] = [];

beforeEach(() => window.localStorage.clear());
afterEach(cleanup);

describe("ProfileClient achievement icons", () => {
  it("renders every earned and locked badge through the owned icon system", async () => {
    const profile = progressStore.load();
    profile.badges = ["first-step"];
    progressStore.save(profile);

    render(<ProfileClient courses={courses} />);
    const heading = await screen.findByRole("heading", { name: `Badges (1/${BADGES.length})` });
    const section = heading.closest("section");
    expect(section).not.toBeNull();

    const icons = section!.querySelectorAll("[data-achievement-icon]");
    expect(icons).toHaveLength(BADGES.length);
    expect(screen.getByRole("listitem", { name: `${BADGES[0].name}, earned` })).toBeTruthy();
    expect(screen.getAllByRole("listitem", { name: /, locked$/i })).toHaveLength(BADGES.length - 1);
    expect(screen.getByText("Earned")).toBeTruthy();
    expect(screen.getAllByText("Locked")).toHaveLength(BADGES.length - 1);
    expect(section!.querySelectorAll('[data-achievement-state="earned"]')).toHaveLength(1);
    expect(section!.querySelectorAll('[data-achievement-state="locked"]')).toHaveLength(BADGES.length - 1);
    expect(section!.querySelector('[data-achievement-state="earned"]')?.getAttribute("data-achievement-icon"))
      .toBe(BADGES[0].icon);
    for (const icon of section!.querySelectorAll('[data-achievement-state="locked"]')) {
      expect(icon.getAttribute("data-achievement-icon")).toBe("icon-705");
    }
    expect(section!.textContent).not.toContain("🔒");
  });
});
