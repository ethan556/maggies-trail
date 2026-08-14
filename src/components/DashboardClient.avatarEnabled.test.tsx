// @vitest-environment jsdom
/**
 * WS-J propagation — the dashboard header resolves a real image once Profile.avatarId names an
 * enabled avatar. Written mocked-ahead-of-art; since production art landed 2026-08-14 it runs
 * against the REAL manifest and the REAL files, with no mock at all (see
 * DashboardClient.avatar.test.tsx for the placeholder-fallback half of the contract).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { existsSync } from "node:fs";
import { join } from "node:path";
import React from "react";

import DashboardClient from "./DashboardClient";
import { progressStore } from "@/lib/progress";

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: false })));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("DashboardClient header avatar — a real enabled avatar", () => {
  it("resolves the shipped src once Profile.avatarId names an enabled id", () => {
    const p = progressStore.load();
    p.avatarId = "avatar-201";
    progressStore.save(p);
    render(<DashboardClient courses={[]} />);
    const h1 = screen.getByRole("heading", { level: 1, name: "Your trail" });
    const img = h1.parentElement?.querySelector("img");
    expect(img?.getAttribute("src")).toBe("/avatars/avatar-201-256.webp");
    // The header points at bytes that exist — the whole point of the art landing.
    expect(existsSync(join(process.cwd(), "public", "avatars", "avatar-201-256.webp"))).toBe(true);
  });

  it("uses the 256 grid size in the header, not the 512 profile size", () => {
    const p = progressStore.load();
    p.avatarId = "avatar-005";
    progressStore.save(p);
    render(<DashboardClient courses={[]} />);
    const h1 = screen.getByRole("heading", { level: 1, name: "Your trail" });
    expect(h1.parentElement?.querySelector("img")?.getAttribute("src")).toBe("/avatars/avatar-005-256.webp");
  });
});
