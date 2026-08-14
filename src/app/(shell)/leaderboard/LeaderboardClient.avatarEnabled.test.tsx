// @vitest-environment jsdom
/**
 * WS-J propagation — the leaderboard resolves a real image on the user's own row once
 * Profile.avatarId names a currently-enabled avatar; rivals still never get a portrait, mocked-
 * enabled avatar or not. Mocked ahead of real production art landing (today the manifest has zero
 * enabled entries — see LeaderboardClient.avatar.test.tsx for that honest baseline).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";

vi.mock("@/lib/avatars", async () => {
  const actual = await vi.importActual<typeof import("@/lib/avatars")>("@/lib/avatars");
  const AVATARS = actual.AVATARS.map((a) => (a.id === "avatar-301" ? { ...a, enabled: true } : a));
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
    }
  };
});

const { default: LeaderboardClient } = await import("./LeaderboardClient");
const { progressStore } = await import("@/lib/progress");

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
});
afterEach(cleanup);

describe("LeaderboardClient own-row avatar — with an enabled avatar (mocked ahead of real production art)", () => {
  it("resolves the real src on the user's row only — rivals still show no image", async () => {
    const p = progressStore.load();
    p.avatarId = "avatar-301";
    progressStore.save(p);
    const { container } = render(<LeaderboardClient />);
    await screen.findAllByRole("listitem");
    const userRow = container.querySelector('[aria-current="true"]');
    expect(userRow!.querySelector("img")?.getAttribute("src")).toBe("/avatars/avatar-301-256.webp");

    const rivalRows = Array.from(container.querySelectorAll("ol > li")).filter(
      (li) => li.querySelector('[aria-current="true"]') === null
    );
    expect(rivalRows.length).toBeGreaterThan(0);
    for (const row of rivalRows) {
      expect(row.querySelector("img")).toBeNull();
    }
  });
});
