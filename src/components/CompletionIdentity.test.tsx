// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CompletionIdentity } from "./CompletionIdentity";

afterEach(cleanup);

describe("CompletionIdentity", () => {
  it("uses the selected released avatar in a compact progress summary", () => {
    const { container } = render(<CompletionIdentity avatarId="avatar-001" variant="compact" />);
    expect(container.querySelector('[data-completion-identity="compact"]')).toBeTruthy();
    const avatar = container.querySelector('img[src="/avatars/avatar-001-256.webp"]');
    expect(avatar).toBeTruthy();
    expect(avatar?.getAttribute("width")).toBe("40");
    expect(avatar?.getAttribute("data-avatar-max-px")).toBe("56");
    expect(container.querySelector('img[src="/brand/maggies-mark.svg"]')).toBeNull();
  });

  it("pairs Maggie's mark with the learner identity at a celebration boundary", () => {
    const { container } = render(<CompletionIdentity avatarId="avatar-001" />);
    const identity = container.querySelector('[data-completion-identity="celebration"]');
    expect(identity?.getAttribute("aria-hidden")).toBe("true");
    expect(identity?.querySelector('img[src="/brand/maggies-mark.svg"]')).toBeTruthy();
    const avatar = identity?.querySelector('img[src="/avatars/avatar-001-256.webp"]');
    expect(avatar).toBeTruthy();
    expect(avatar?.getAttribute("width")).toBe("56");
    expect(avatar?.getAttribute("data-avatar-placement")).toBe("completion");
  });
});
