// @vitest-environment jsdom
/**
 * WS-E Phase 5 — the dashboard's "The trail map" section routes honestly into the World system.
 * It was literally labeled "The trail map" while being a plain accordion of /courses/[slug]
 * links (which only reach a world surface via a 307 redirect). This guards the integration:
 * the section header links the living map surfaces (Trailhead / Atlas), and each live course
 * card links straight to its Basecamp — the canonical world course surface.
 * DashboardClient.rec.test.ts owns the pure recommendation contract; the avatar tests own the
 * header avatar. This file is additive and does not touch either.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";

import DashboardClient, { type DashCourse } from "./DashboardClient";

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  // AssignmentsCard and the next-skill advance both fetch on mount; stub so requests settle
  // quietly instead of hitting Node's fetch with an unresolvable relative URL.
  vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: false })));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const course = (over?: Partial<DashCourse>): DashCourse => ({
  courseId: "g3-fractions",
  slug: "fractions-3",
  title: "Fractions",
  tagline: "Parts of a whole",
  comingSoon: false,
  gradeLevel: 3,
  chapters: [["f-01-01"]],
  lessonIds: ["f-01-01"],
  firstLessonId: "f-01-01",
  after: [],
  conceptTags: ["equal-groups"],
  ...over
});

describe("the trail map section — WS-E Phase 5 world integration", () => {
  it("links the living map surfaces from the section header", () => {
    render(<DashboardClient courses={[course()]} />);
    expect(screen.getByRole("link", { name: /open the living map/i }).getAttribute("href")).toBe("/trailhead");
    expect(screen.getByRole("link", { name: /^atlas$/i }).getAttribute("href")).toBe("/atlas");
  });

  it("routes each live course card straight to its Basecamp (world course surface), not the legacy redirect", () => {
    render(<DashboardClient courses={[course()]} />);
    const card = screen.getByRole("link", { name: /fractions/i });
    expect(card.getAttribute("href")).toBe("/basecamp/g3-fractions");
  });

  it("keeps coming-soon courses as non-links (nothing to basecamp into yet)", () => {
    render(
      <DashboardClient
        courses={[
          course({
            courseId: "g4-decimals",
            slug: "decimals-4",
            title: "Decimals",
            comingSoon: true,
            chapters: [],
            lessonIds: [],
            firstLessonId: null
          })
        ]}
      />
    );
    expect(screen.queryByRole("link", { name: /decimals/i })).toBeNull();
    expect(screen.getByText("Decimals")).toBeTruthy();
  });
});
