// @vitest-environment jsdom
/**
 * WS-J propagation — the desktop account-menu trigger resolves a real image once Profile.avatarId
 * names an enabled avatar. Written mocked-ahead-of-art; since production art landed 2026-08-14 it
 * runs against the REAL manifest and the REAL files, with no avatars mock at all (see
 * SiteNav.avatar.test.tsx for the placeholder-fallback half of the contract).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { existsSync } from "node:fs";
import { join } from "node:path";
import React from "react";

vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }));
vi.mock("@/components/SyncIndicator", () => ({ default: () => null }));

import SiteNav from "./SiteNav";
import { progressStore } from "@/lib/progress";

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
});
afterEach(cleanup);

describe("SiteNav account-menu trigger — a real enabled avatar", () => {
  it("resolves the shipped src once Profile.avatarId names an enabled id", () => {
    const p = progressStore.load();
    p.avatarId = "avatar-101";
    progressStore.save(p);
    render(<SiteNav />);
    const trigger = screen.getByRole("button", { name: /account and more/i });
    expect(trigger.querySelector("img")?.getAttribute("src")).toBe("/avatars/avatar-101-256.webp");
    expect(existsSync(join(process.cwd(), "public", "avatars", "avatar-101-256.webp"))).toBe(true);
  });

  it("keeps 'Account and more' as the trigger's accessible name — the portrait stays decorative", () => {
    const p = progressStore.load();
    p.avatarId = "avatar-101";
    progressStore.save(p);
    render(<SiteNav />);
    const trigger = screen.getByRole("button", { name: /account and more/i });
    expect(trigger.getAttribute("aria-label")).toBe("Account and more");
    // Real art must not start announcing itself: no second accessible name inside the control
    // (AVATAR_ART_PRODUCTION_SPEC.md §7 — never an inferred identity claim, and never a duplicate).
    expect(trigger.querySelector("img")?.getAttribute("alt")).toBe("");
  });
});
