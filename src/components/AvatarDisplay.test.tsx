// @vitest-environment jsdom
/**
 * The shared avatar-display component: avatarId -> getAvatarSrc, falling back to the honest
 * placeholder silhouette for anything absent, unknown, or (today) simply not yet enabled.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { AvatarDisplay } from "./AvatarDisplay";
import { AVATAR_PLACEHOLDER_SRC } from "@/lib/avatars";

afterEach(cleanup);

describe("AvatarDisplay — real manifest, everything disabled today", () => {
  it("falls back to the placeholder when no avatarId is given", () => {
    render(<AvatarDisplay alt="current avatar" />);
    expect(screen.getByAltText("current avatar").getAttribute("src")).toBe(AVATAR_PLACEHOLDER_SRC);
  });

  it("falls back to the placeholder for an unknown id", () => {
    render(<AvatarDisplay avatarId="avatar-does-not-exist" alt="current avatar" />);
    expect(screen.getByAltText("current avatar").getAttribute("src")).toBe(AVATAR_PLACEHOLDER_SRC);
  });

  it("falls back to the placeholder for a real but disabled manifest id", () => {
    render(<AvatarDisplay avatarId="avatar-001" alt="current avatar" />);
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

describe("AvatarDisplay — with an enabled avatar (mocked ahead of real production art)", () => {
  vi.resetModules();
  vi.doMock("@/lib/avatars", async () => {
    const actual = await vi.importActual<typeof import("@/lib/avatars")>("@/lib/avatars");
    const AVATARS = actual.AVATARS.map((a) => (a.id === "avatar-101" ? { ...a, enabled: true } : a));
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

  it("resolves the real src for a mocked-enabled id", async () => {
    const { AvatarDisplay: MockedAvatarDisplay } = await import("./AvatarDisplay");
    render(<MockedAvatarDisplay avatarId="avatar-101" size={256} alt="current avatar" />);
    expect(screen.getByAltText("current avatar").getAttribute("src")).toBe("/avatars/avatar-101-256.webp");
  });
});
