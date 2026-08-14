// @vitest-environment jsdom
/**
 * WS-J propagation — a child's row resolves a real image once THAT child's own stored profile
 * names a currently-enabled avatar. Mocked ahead of real production art landing (today the
 * manifest has zero enabled entries — see FamilyClient.avatar.test.tsx for that honest baseline).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
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
    }
  };
});

const { default: FamilyClient } = await import("./FamilyClient");
const { progressStore } = await import("@/lib/progress");

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
});
afterEach(cleanup);

describe("FamilyClient child-row avatar — with an enabled avatar (mocked ahead of real production art)", () => {
  it("resolves the real src for the default child once their stored profile names the mocked-enabled id", async () => {
    const p = progressStore.load();
    p.avatarId = "avatar-001";
    progressStore.save(p);
    render(<FamilyClient skills={{}} courses={[]} tagGrades={{}} />);
    const name = await screen.findByText("Learner 1");
    const row = name.closest("li")!;
    expect(row.querySelector("img")?.getAttribute("src")).toBe("/avatars/avatar-001-256.webp");
  });
});
