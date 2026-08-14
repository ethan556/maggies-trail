// @vitest-environment jsdom
/**
 * WS-J propagation — the leaderboard resolves a real image on the user's own row once
 * Profile.avatarId names an enabled avatar; rivals still never get a portrait. Written
 * mocked-ahead-of-art; since production art landed 2026-08-14 it runs against the REAL manifest and
 * the REAL files, with no mock at all — which makes the rival check stronger than it was, because
 * every one of the 60 portraits is now genuinely available to leak onto a synthetic pacer's row
 * (see LeaderboardClient.avatar.test.tsx for the placeholder-fallback half of the contract).
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { existsSync } from "node:fs";
import { join } from "node:path";
import React from "react";

import LeaderboardClient from "./LeaderboardClient";
import { progressStore } from "@/lib/progress";

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
});
afterEach(cleanup);

describe("LeaderboardClient own-row avatar — a real enabled avatar", () => {
  it("resolves the shipped src on the user's row only — rivals still show no image", async () => {
    const p = progressStore.load();
    p.avatarId = "avatar-301";
    progressStore.save(p);
    const { container } = render(<LeaderboardClient />);
    await screen.findAllByRole("listitem");
    const userRow = container.querySelector('[aria-current="true"]');
    expect(userRow!.querySelector("img")?.getAttribute("src")).toBe("/avatars/avatar-301-256.webp");
    expect(existsSync(join(process.cwd(), "public", "avatars", "avatar-301-256.webp"))).toBe(true);

    const rivalRows = Array.from(container.querySelectorAll("ol > li")).filter(
      (li) => li.querySelector('[aria-current="true"]') === null
    );
    expect(rivalRows.length).toBeGreaterThan(0);
    for (const row of rivalRows) {
      expect(row.querySelector("img")).toBeNull();
    }
  });

  it("the whole board renders exactly one avatar image, whatever the learner picked", async () => {
    const p = progressStore.load();
    p.avatarId = "avatar-412";
    progressStore.save(p);
    const { container } = render(<LeaderboardClient />);
    await screen.findAllByRole("listitem");
    const images = container.querySelectorAll("ol img");
    expect(images).toHaveLength(1);
    expect(images[0].getAttribute("src")).toBe("/avatars/avatar-412-256.webp");
  });
});
