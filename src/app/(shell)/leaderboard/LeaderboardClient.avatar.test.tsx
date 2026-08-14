// @vitest-environment jsdom
/**
 * WS-J propagation — the leaderboard shows an avatar ONLY on the learner's own row; rivals are
 * synthetic pacers, never real people, and never get a library portrait (the WS-J research report,
 * §5: "Rivals never get library portraits — would fake real peers and burn placeholder slots").
 * This file owns the FALLBACK half of that contract (no choice yet, or a stored id that no longer
 * resolves) — see LeaderboardClient.avatarEnabled.test.tsx for a real stored id resolving on the
 * user's row against the shipped art.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";

import LeaderboardClient from "./LeaderboardClient";
import { progressStore } from "@/lib/progress";
import { AVATAR_PLACEHOLDER_SRC } from "@/lib/avatars";

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
});
afterEach(cleanup);

describe("LeaderboardClient own-row avatar — the placeholder fallback path", () => {
  it("shows the honest placeholder on the user's own row, and no avatar image on any rival row", async () => {
    const { container } = render(<LeaderboardClient />);
    await screen.findAllByRole("listitem");
    const userRow = container.querySelector('[aria-current="true"]');
    expect(userRow).toBeTruthy();
    expect(userRow!.querySelector("img")?.getAttribute("src")).toBe(AVATAR_PLACEHOLDER_SRC);

    const rivalRows = Array.from(container.querySelectorAll("ol > li")).filter(
      (li) => li.querySelector('[aria-current="true"]') === null
    );
    expect(rivalRows.length).toBeGreaterThan(0);
    for (const row of rivalRows) {
      expect(row.querySelector("img")).toBeNull();
    }
  });

  it("falls back to the placeholder on the user's row for a stored id that no longer resolves", async () => {
    const p = progressStore.load();
    p.avatarId = "avatar-901";
    progressStore.save(p);
    const { container } = render(<LeaderboardClient />);
    await screen.findAllByRole("listitem");
    const userRow = container.querySelector('[aria-current="true"]');
    expect(userRow!.querySelector("img")?.getAttribute("src")).toBe(AVATAR_PLACEHOLDER_SRC);
  });
});
