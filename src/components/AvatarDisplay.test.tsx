// @vitest-environment jsdom
/**
 * The shared avatar-display component: avatarId -> getAvatarSrc, falling back to the honest
 * placeholder silhouette for anything absent, unknown, or disabled.
 *
 * Production art landed 2026-08-14, so the resolving path now runs against the real manifest and
 * the real files — this test reads the resolved src back off disk to prove the component points at
 * something that actually exists, not just at a well-formed string. The fallback path keeps its own
 * coverage: "no choice yet" is permanent, and a disabled entry (art pulled) is mocked below.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import React from "react";
import { AvatarDisplay } from "./AvatarDisplay";
import { AVATAR_PLACEHOLDER_SRC, AVATARS } from "@/lib/avatars";

afterEach(cleanup);

describe("AvatarDisplay — real (unmodified) manifest, art landed", () => {
  it("resolves a real manifest id to its own shipped asset, at both sizes", () => {
    render(<AvatarDisplay avatarId="avatar-001" size={256} alt="current avatar" />);
    expect(screen.getByAltText("current avatar").getAttribute("src")).toBe("/avatars/avatar-001-256.webp");
    cleanup();
    render(<AvatarDisplay avatarId="avatar-001" size={512} alt="current avatar" />);
    expect(screen.getByAltText("current avatar").getAttribute("src")).toBe("/avatars/avatar-001-512.webp");
  });

  it("every src it can render for every manifest id is a real file on disk", () => {
    // The end-to-end proof this component exists for: an id a learner could have stored resolves to
    // bytes that are actually served. avatars.test.ts checks the manifest against disk; this checks
    // the string the DOM would fetch.
    for (const avatar of AVATARS) {
      for (const size of [256, 512] as const) {
        cleanup();
        render(<AvatarDisplay avatarId={avatar.id} size={size} alt="a" />);
        const src = screen.getByAltText("a").getAttribute("src")!;
        expect(src, avatar.id).not.toBe(AVATAR_PLACEHOLDER_SRC);
        const path = join(process.cwd(), "public", src);
        expect(existsSync(path), `${avatar.id} renders ${src}, which does not exist`).toBe(true);
        expect(statSync(path).size, src).toBeGreaterThan(0);
      }
    }
  });

  it("falls back to the placeholder when no avatarId is given", () => {
    render(<AvatarDisplay alt="current avatar" />);
    expect(screen.getByAltText("current avatar").getAttribute("src")).toBe(AVATAR_PLACEHOLDER_SRC);
  });

  it("falls back to the placeholder for an unknown id", () => {
    render(<AvatarDisplay avatarId="avatar-does-not-exist" alt="current avatar" />);
    expect(screen.getByAltText("current avatar").getAttribute("src")).toBe(AVATAR_PLACEHOLDER_SRC);
  });

  it("is decorative (empty alt) by default", () => {
    const { container } = render(<AvatarDisplay avatarId="avatar-001" />);
    expect(container.querySelector("img")?.getAttribute("alt")).toBe("");
  });

  it("renders fixed width/height by default and switches to fill mode on request", () => {
    const { container, rerender } = render(<AvatarDisplay size={512} />);
    const fixed = container.querySelector("img")!;
    expect(fixed.getAttribute("width")).toBe("512");
    expect(fixed.getAttribute("height")).toBe("512");

    rerender(
      <div style={{ position: "relative", width: 100, height: 100 }}>
        <AvatarDisplay fill />
      </div>
    );
    const filled = container.querySelector("img")!;
    // next/image fill mode drops explicit width/height in favor of inset positioning.
    expect(filled.getAttribute("width")).toBeNull();
  });
});

describe("AvatarDisplay — with a disabled avatar (art pulled after a QA rejection)", () => {
  vi.resetModules();
  vi.doMock("@/lib/avatars", async () => {
    const actual = await vi.importActual<typeof import("@/lib/avatars")>("@/lib/avatars");
    const AVATARS = actual.AVATARS.map((a) => (a.id === "avatar-101" ? { ...a, enabled: false } : a));
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

  it("falls back to the placeholder for a real id whose entry has been disabled", async () => {
    const { AvatarDisplay: MockedAvatarDisplay } = await import("./AvatarDisplay");
    render(<MockedAvatarDisplay avatarId="avatar-101" size={256} alt="current avatar" />);
    expect(screen.getByAltText("current avatar").getAttribute("src")).toBe(AVATAR_PLACEHOLDER_SRC);
  });
});
