// @vitest-environment jsdom
/**
 * WS-J propagation — the desktop account-menu trigger shows the active learner's avatar (falling
 * back to the honest placeholder), reading Profile.avatarId the same way every other WS-J surface
 * does. This file owns the FALLBACK half of that contract (no choice yet, or a stored id that no
 * longer resolves) — see SiteNav.avatarEnabled.test.tsx for a real stored id resolving against the
 * shipped art. SiteNav.test.tsx owns the nav's structural contract (destinations, badge, sheet,
 * aria labels); this file is additive and does not touch it.
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

describe("SiteNav account-menu trigger — the placeholder fallback path", () => {
  it("shows the honest placeholder before any avatar is chosen", () => {
    render(<SiteNav />);
    const trigger = screen.getByRole("button", { name: /account and more/i });
    expect(trigger.querySelector("img")?.getAttribute("src")).toBe(AVATAR_PLACEHOLDER_SRC);
  });

  it("falls back to the placeholder for a stored id that no longer names a usable avatar", () => {
    const p = progressStore.load();
    p.avatarId = "avatar-901";
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
