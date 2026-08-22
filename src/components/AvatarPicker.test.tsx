// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { AvatarPicker, avatarPickerAccessibleLabel } from "./AvatarPicker";
import { AVATARS } from "@/lib/avatars";

afterEach(cleanup);

function numberOf(id: string): number {
  return AVATARS.findIndex((avatar) => avatar.id === id) + 1;
}

describe("AvatarPicker accessible labels", () => {
  it("names mathematical marks semantically while keeping human portraits neutral", () => {
    expect(avatarPickerAccessibleLabel({ id: "avatar-501", semanticName: "Pi symbol avatar" }, 61, false)).toBe(
      "Pi symbol avatar"
    );
    expect(avatarPickerAccessibleLabel({ id: "avatar-502", semanticName: "Theta symbol avatar" }, 62, true)).toBe(
      "Theta symbol avatar selected"
    );
    expect(avatarPickerAccessibleLabel({ id: "avatar-007" }, 7, false)).toBe("Avatar 7");
  });
});

describe("AvatarPicker — complete reviewed production library", () => {
  it("opens the complete grade-appropriate collection", () => {
    const onChange = vi.fn();
    render(<AvatarPicker value={undefined} onChange={onChange} grade={0} />);
    expect(screen.getByText("Early (K–2)")).toBeTruthy();
    expect(screen.queryAllByRole("radio")).toHaveLength(15);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("offers all reviewed collections and the mathematics extension", () => {
    render(<AvatarPicker value={undefined} onChange={vi.fn()} grade={0} />);
    fireEvent.click(screen.getByRole("button", { name: "See all avatars" }));
    expect(screen.getByRole("button", { name: "Summit (9–13)" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Math symbols" }));
    expect(screen.getAllByRole("radio")).toHaveLength(12);
    expect(screen.getByRole("radio", { name: "Pi symbol avatar" })).toBeTruthy();
  });

  it("defaults to a stable collection when no grade is known", () => {
    render(<AvatarPicker value={undefined} onChange={vi.fn()} />);
    expect(screen.getByText("Explorer (3–5)")).toBeTruthy();
  });
});

describe("AvatarPicker — approved art wiring (mocked ahead of production release)", () => {
  vi.resetModules();
  vi.doMock("@/lib/avatars", async () => {
    const actual = await vi.importActual<typeof import("@/lib/avatars")>("@/lib/avatars");
    const AVATARS = actual.AVATARS.map((avatar) => ({
      ...avatar,
      enabled: avatar.ageBand === "early" || avatar.ageBand === "explorer"
    }));
    const isValidAvatarId = (id: string) => AVATARS.some((avatar) => avatar.id === id && avatar.enabled);
    const getAvatar = (id: string) => AVATARS.find((avatar) => avatar.id === id);
    return {
      ...actual,
      AVATARS,
      isValidAvatarId,
      getAvatar,
      getAvatarSrc: (id: string, size: 256 | 512) => {
        if (!isValidAvatarId(id)) return undefined;
        const avatar = getAvatar(id)!;
        return size === 256 ? avatar.src256 : avatar.src512;
      },
      getAvatarsForAgeBand: (band: string) =>
        AVATARS.filter((avatar) => avatar.ageBand === band && avatar.enabled).sort(
          (left, right) => left.order - right.order
        )
    };
  });

  async function renderMockedPicker(props: {
    value?: string;
    onChange: (id: string) => void;
    grade?: number;
  }) {
    const { AvatarPicker: MockedPicker } = await import("./AvatarPicker");
    return render(<MockedPicker {...props} />);
  }

  it("renders only enabled art and commits a selection immediately", async () => {
    const onChange = vi.fn();
    await renderMockedPicker({ value: undefined, onChange, grade: 0 });
    const avatar1 = screen.getByRole("radio", { name: "Avatar 1" });
    fireEvent.click(avatar1);
    expect(onChange).toHaveBeenCalledWith("avatar-001");
    expect(screen.getAllByRole("radio")).toHaveLength(15);
    expect(screen.queryByRole("radio", { name: `Avatar ${numberOf("avatar-301")}` })).toBeNull();
  });

  it("labels the selected tile and exposes exactly one checked radio", async () => {
    await renderMockedPicker({ value: "avatar-002", onChange: vi.fn(), grade: 0 });
    const selected = screen.getByRole("radio", { name: `Avatar ${numberOf("avatar-002")} selected` });
    expect(selected.getAttribute("aria-checked")).toBe("true");
    expect(screen.getAllByRole("radio").filter((radio) => radio.getAttribute("aria-checked") === "true"))
      .toHaveLength(1);
  });

  it("supports roving arrow, Home and End keyboard focus", async () => {
    await renderMockedPicker({ value: undefined, onChange: vi.fn(), grade: 0 });
    const a1 = screen.getByRole("radio", { name: "Avatar 1" });
    const a2 = screen.getByRole("radio", { name: "Avatar 2" });
    const a3 = screen.getByRole("radio", { name: "Avatar 3" });
    const last = screen.getByRole("radio", { name: `Avatar ${numberOf("avatar-405")}` });
    a1.focus();
    fireEvent.keyDown(a1, { key: "ArrowRight" });
    expect(document.activeElement).toBe(a2);
    fireEvent.keyDown(a2, { key: "ArrowRight" });
    expect(document.activeElement).toBe(a3);
    fireEvent.keyDown(a3, { key: "Home" });
    expect(document.activeElement).toBe(a1);
    fireEvent.keyDown(a1, { key: "End" });
    expect(document.activeElement).toBe(last);
  });

  it("keeps exactly one radio in the tab order", async () => {
    await renderMockedPicker({ value: "avatar-002", onChange: vi.fn(), grade: 0 });
    const radios = screen.getAllByRole("radio");
    expect(radios.filter((radio) => radio.getAttribute("tabindex") === "0")).toHaveLength(1);
    expect(screen.queryByRole("radio", { name: `Avatar ${numberOf("avatar-301")}` })).toBeNull();
  });

  it("See all lists only collections with approved art", async () => {
    const onChange = vi.fn();
    await renderMockedPicker({ value: undefined, onChange, grade: 0 });
    fireEvent.click(screen.getByRole("button", { name: "See all avatars" }));
    expect(screen.queryByRole("button", { name: "Adventurer (6–8)" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Summit (9–13)" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Explorer (3–5)" }));
    const explorer = screen.getByRole("radio", { name: `Avatar ${numberOf("avatar-101")}` });
    fireEvent.click(explorer);
    expect(onChange).toHaveBeenCalledWith("avatar-101");
  });
});
