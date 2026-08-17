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

describe("AvatarDisplay — reviewed production manifest", () => {
  it("falls back to the placeholder when no avatarId is given", () => {
    render(<AvatarDisplay placement="profile" alt="current avatar" />);
    expect(screen.getByAltText("current avatar").getAttribute("src")).toBe(AVATAR_PLACEHOLDER_SRC);
  });

  it("falls back to the placeholder for an unknown id", () => {
    render(<AvatarDisplay placement="profile" avatarId="avatar-does-not-exist" alt="current avatar" />);
    expect(screen.getByAltText("current avatar").getAttribute("src")).toBe(AVATAR_PLACEHOLDER_SRC);
  });

  it("renders a reviewed manifest id", () => {
    render(<AvatarDisplay placement="profile" avatarId="avatar-001" alt="current avatar" />);
    expect(screen.getByAltText("current avatar").getAttribute("src")).toBe("/avatars/avatar-001-256.webp");
  });

  it("is decorative (empty alt) by default", () => {
    const { container } = render(<AvatarDisplay placement="profile" avatarId="avatar-001" />);
    expect(container.querySelector("img")?.getAttribute("alt")).toBe("");
  });

  it("renders fixed width/height by default and switches to fill mode on request", () => {
    const { container, rerender } = render(<AvatarDisplay placement="profile" size={512} />);
    const fixed = container.querySelector("img")!;
    expect(fixed.getAttribute("width")).toBe("80");
    expect(fixed.getAttribute("height")).toBe("80");

    rerender(
      <div style={{ position: "relative", width: 100, height: 100 }}>
        <AvatarDisplay placement="picker" fill />
      </div>
    );
    const filled = container.querySelector("img")!;
    // next/image fill mode drops explicit width/height in favor of inset positioning.
    expect(filled.getAttribute("width")).toBeNull();
  });

  it("clamps fixed images to the placement's visual-space budget", () => {
    const { container } = render(
      <AvatarDisplay placement="navigation" displaySize={200} avatarId="avatar-001" />
    );
    const image = container.querySelector("img")!;
    expect(image.getAttribute("width")).toBe("24");
    expect(image.getAttribute("height")).toBe("24");
    expect(image.getAttribute("data-avatar-placement")).toBe("navigation");
    expect(image.getAttribute("data-avatar-max-px")).toBe("24");
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
    render(
      <MockedAvatarDisplay
        placement="summary"
        avatarId="avatar-101"
        size={256}
        alt="current avatar"
      />
    );
    expect(screen.getByAltText("current avatar").getAttribute("src")).toBe("/avatars/avatar-101-256.webp");
  });

  it("keeps restrained customization inside the same compact footprint", async () => {
    const { AvatarDisplay: MockedAvatarDisplay } = await import("./AvatarDisplay");
    const { container } = render(
      <MockedAvatarDisplay
        placement="summary"
        displaySize={48}
        avatarId="avatar-101"
        customization={{ glasses: "round", accent: "teal", badge: "pi" }}
      />
    );
    const wrapper = container.querySelector('[data-avatar-customized="true"]') as HTMLElement;
    expect(wrapper).toBeTruthy();
    expect(wrapper.style.width).toBe("48px");
    expect(wrapper.style.height).toBe("48px");
    expect(wrapper.querySelector("svg")).toBeTruthy();
    expect(wrapper.textContent).toContain("π");
    expect(wrapper.querySelector("img")?.getAttribute("width")).toBe("48");
  });
});
