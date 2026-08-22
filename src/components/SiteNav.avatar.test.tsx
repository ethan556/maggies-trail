// @vitest-environment jsdom
/**
 * WS-J propagation — the desktop account-menu trigger shows the active learner's avatar (falling
 * back to the honest placeholder), reading Profile.avatarId the same way every other WS-J surface
 * does. Against the REAL, unmodified avatars manifest — 60/60 enabled since the S244 atomic
 * release (AVATAR_V4_PRODUCTION_RUNBOOK.md; VARIANT_STATE.md "Production avatars enabled:
 * 60/60"), so a chosen real id now resolves to real art with no mock, while unknown/withdrawn
 * ids still fall back to the placeholder. See SiteNav.avatarEnabled.test.tsx for the same
 * resolution exercised against a mocked single-enabled manifest. SiteNav.test.tsx owns the nav's
 * structural contract (destinations, badge, sheet, aria labels); this file is additive and does
 * not touch it.
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

describe("SiteNav account-menu trigger — real manifest, 60/60 enabled since the S244 release", () => {
  it("shows the honest placeholder before any avatar is chosen", () => {
    render(<SiteNav />);
    const trigger = screen.getByRole("button", { name: /account and more/i });
    expect(trigger.querySelector("img")?.getAttribute("src")).toBe(AVATAR_PLACEHOLDER_SRC);
  });

  // Re-pinned (S331): this case previously pinned avatar-101 -> placeholder, written when the
  // whole manifest was `enabled: false`. That expectation is stale against the recorded product
  // decision (AVATAR_V4_PRODUCTION_RUNBOOK.md's atomic 60/60 release), under which avatar-101 is
  // released art and must resolve for real — no mock.
  it("resolves a chosen real released id to its real 256 export", () => {
    const p = progressStore.load();
    p.avatarId = "avatar-101";
    progressStore.save(p);
    render(<SiteNav />);
    const trigger = screen.getByRole("button", { name: /account and more/i });
    expect(trigger.querySelector("img")?.getAttribute("src")).toBe("/avatars/avatar-101-256.webp");
  });

  it("still falls back to the placeholder for an unknown/withdrawn stored id", () => {
    // The fallback contract the old chosen-but-disabled case guarded is still live: an old synced
    // profile naming an id that is not (or no longer) in the enabled manifest must never render a
    // broken image.
    const p = progressStore.load();
    p.avatarId = "avatar-999";
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
