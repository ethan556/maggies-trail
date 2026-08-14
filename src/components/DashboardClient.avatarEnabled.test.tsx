// @vitest-environment jsdom
/**
 * WS-J propagation — the dashboard header resolves a real image once Profile.avatarId names a
 * currently-enabled avatar. Mocked ahead of real production art landing (today the manifest has
 * zero enabled entries — see DashboardClient.avatar.test.tsx for that honest baseline).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";

vi.mock("@/lib/avatars", async () => {
  const actual = await vi.importActual<typeof import("@/lib/avatars")>("@/lib/avatars");
  const AVATARS = actual.AVATARS.map((a) => (a.id === "avatar-201" ? { ...a, enabled: true } : a));
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

const { default: DashboardClient } = await import("./DashboardClient");
const { progressStore } = await import("@/lib/progress");

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: false })));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("DashboardClient header avatar — with an enabled avatar (mocked ahead of real production art)", () => {
  it("resolves the real src once Profile.avatarId names the mocked-enabled id", () => {
    const p = progressStore.load();
    p.avatarId = "avatar-201";
    progressStore.save(p);
    render(<DashboardClient courses={[]} />);
    const h1 = screen.getByRole("heading", { level: 1, name: "Your trail" });
    const img = h1.parentElement?.querySelector("img");
    expect(img?.getAttribute("src")).toBe("/avatars/avatar-201-256.webp");
  });
});
