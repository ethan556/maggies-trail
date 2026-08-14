// @vitest-environment jsdom
/**
 * WS-J propagation — the desktop account-menu trigger shows the active learner's avatar (falling
 * back to the honest placeholder), reading Profile.avatarId the same way every other WS-J surface
 * does. Against the REAL, unmodified avatars manifest (everything `enabled: false` today) — see
 * SiteNav.avatarEnabled.test.tsx for a mocked-enabled id actually resolving. SiteNav.test.tsx owns
 * the nav's structural contract (destinations, badge, sheet, aria labels); this file is additive
 * and does not touch it.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";

vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }));
vi.mock("@/components/SyncIndicator", () => ({ default: () => null }));

import SiteNav from "./SiteNav";
import { progressStore } from "@/lib/progress";
import { AVATAR_PLACEHOLDER_SRC } from "@/lib/avatars";

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
});
afterEach(cleanup);

describe("SiteNav account-menu trigger — real manifest, everything disabled today", () => {
  it("shows the honest placeholder before any avatar is chosen", () => {
    render(<SiteNav />);
    const trigger = screen.getByRole("button", { name: /account and more/i });
    expect(trigger.querySelector("img")?.getAttribute("src")).toBe(AVATAR_PLACEHOLDER_SRC);
  });

  it("still falls back to the placeholder for a chosen-but-disabled real manifest id", () => {
    const p = progressStore.load();
    p.avatarId = "avatar-101";
    progressStore.save(p);
    render(<SiteNav />);
    const trigger = screen.getByRole("button", { name: /account and more/i });
    expect(trigger.querySelector("img")?.getAttribute("src")).toBe(AVATAR_PLACEHOLDER_SRC);
  });

  it("keeps 'Account and more' as the trigger's accessible name — the swap is decorative", () => {
    render(<SiteNav />);
    expect(
      screen.getByRole("button", { name: /account and more/i }).getAttribute("aria-label")
    ).toBe("Account and more");
  });
});
