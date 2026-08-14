// @vitest-environment jsdom
/**
 * The one avatar picker (onboarding + profile). Two regimes, matching the two describe blocks:
 *
 *  - the REAL, unmodified manifest (every entry `enabled: false` today) — every slot must still
 *    render as an honest, non-selectable placeholder, never an empty grid;
 *  - a manifest with a few entries mocked `enabled: true`, standing in for real production art
 *    landing later — selection, keyboard nav, and the "Avatar N" / "Avatar N selected" labeling
 *    contract (OPTIMIZATION_PLAN_V3.md:150) all have to work the moment real art ships, with zero
 *    further wiring.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { AvatarPicker } from "./AvatarPicker";
import { AVATARS } from "@/lib/avatars";

afterEach(cleanup);

function numberOf(id: string): number {
  return AVATARS.findIndex((a) => a.id === id) + 1;
}

describe("AvatarPicker — real (unmodified) manifest, everything disabled today", () => {
  it("opens the grade-appropriate band and shows every slot, non-selectable", () => {
    const onChange = vi.fn();
    render(<AvatarPicker value={undefined} onChange={onChange} grade={0} />);
    expect(screen.getByText("Early (K–2)")).toBeTruthy();

    const radios = screen.getAllByRole("radio");
    // early band: 12 human + 3 symbol = 15 slots, all present, none enabled.
    expect(radios).toHaveLength(15);
    for (const r of radios) {
      expect((r as HTMLButtonElement).disabled).toBe(true);
      expect(r.getAttribute("aria-checked")).toBe("false");
    }

    fireEvent.click(radios[0]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("captions a band with nothing enabled yet, honestly, without hiding the grid", () => {
    render(<AvatarPicker value={undefined} onChange={vi.fn()} grade={0} />);
    expect(screen.getByText(/every option above is a placeholder for now/i)).toBeTruthy();
  });

  it("'See all avatars' reveals every band; switching bands swaps the visible grid", () => {
    render(<AvatarPicker value={undefined} onChange={vi.fn()} grade={0} />);
    fireEvent.click(screen.getByRole("button", { name: "See all avatars" }));
    const summitTab = screen.getByRole("button", { name: "Summit (9–13)" });
    fireEvent.click(summitTab);
    expect(summitTab.getAttribute("aria-pressed")).toBe("true");
    // The band caption above the grid switched too (a second, separate element from the tab
    // button, which keeps its own always-visible label).
    expect(screen.getAllByText("Summit (9–13)")).toHaveLength(2);
    // summit is also 12 human + 3 symbol = 15 slots.
    expect(screen.getAllByRole("radio")).toHaveLength(15);
    // summit-only anchor id, proof the grid actually swapped rather than relabeling in place.
    expect(screen.getByRole("radio", { name: `Avatar ${numberOf("avatar-301")}` })).toBeTruthy();
  });

  it("defaults to a stable band when no grade is known", () => {
    render(<AvatarPicker value={undefined} onChange={vi.fn()} />);
    expect(screen.getByText("Explorer (3–5)")).toBeTruthy();
  });
});

describe("AvatarPicker — with enabled avatars (mocked ahead of real production art)", () => {
  vi.resetModules();
  vi.doMock("@/lib/avatars", async () => {
    const actual = await vi.importActual<typeof import("@/lib/avatars")>("@/lib/avatars");
    const enable = new Set(["avatar-001", "avatar-002", "avatar-003", "avatar-101"]);
    const AVATARS = actual.AVATARS.map((a) => (enable.has(a.id) ? { ...a, enabled: true } : a));
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
      },
      getAvatarsForAgeBand: (band: string) =>
        AVATARS.filter((a) => a.ageBand === band && a.enabled).sort((a, b) => a.order - b.order)
    };
  });

  async function renderMockedPicker(props: { value?: string; onChange: (id: string) => void; grade?: number }) {
    const { AvatarPicker: MockedPicker } = await import("./AvatarPicker");
    return render(<MockedPicker {...props} />);
  }

  it("selectable tiles are only the enabled ones; activating one commits immediately via onChange", async () => {
    const onChange = vi.fn();
    await renderMockedPicker({ value: undefined, onChange, grade: 0 });

    const avatar1 = screen.getByRole("radio", { name: "Avatar 1" });
    expect((avatar1 as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(avatar1);
    expect(onChange).toHaveBeenCalledWith("avatar-001");

    // A disabled slot in the same band never fires onChange.
    const stillDisabled = screen.getAllByRole("radio").filter((r) => (r as HTMLButtonElement).disabled);
    expect(stillDisabled.length).toBeGreaterThan(0);
    fireEvent.click(stillDisabled[0]);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("labels the selected tile 'Avatar N selected' and reflects aria-checked", async () => {
    await renderMockedPicker({ value: "avatar-002", onChange: vi.fn(), grade: 0 });
    const selected = screen.getByRole("radio", { name: `Avatar ${numberOf("avatar-002")} selected` });
    expect(selected.getAttribute("aria-checked")).toBe("true");
    // Only one tile is ever the selected one.
    expect(screen.getAllByRole("radio").filter((r) => r.getAttribute("aria-checked") === "true")).toHaveLength(1);
  });

  it("arrow keys move focus across enabled tiles only; Home/End jump to the ends", async () => {
    await renderMockedPicker({ value: undefined, onChange: vi.fn(), grade: 0 });
    const a1 = screen.getByRole("radio", { name: "Avatar 1" });
    const a2 = screen.getByRole("radio", { name: "Avatar 2" });
    const a3 = screen.getByRole("radio", { name: "Avatar 3" });

    a1.focus();
    expect(document.activeElement).toBe(a1);
    fireEvent.keyDown(a1, { key: "ArrowRight" });
    expect(document.activeElement).toBe(a2);
    fireEvent.keyDown(a2, { key: "ArrowRight" });
    expect(document.activeElement).toBe(a3);
    // Clamped at the last enabled tile — no wraparound past the end.
    fireEvent.keyDown(a3, { key: "ArrowRight" });
    expect(document.activeElement).toBe(a3);

    fireEvent.keyDown(a3, { key: "Home" });
    expect(document.activeElement).toBe(a1);
    fireEvent.keyDown(a1, { key: "End" });
    expect(document.activeElement).toBe(a3);
  });

  it("only the roving tile is a tab stop; disabled tiles are excluded from the tab order", async () => {
    await renderMockedPicker({ value: "avatar-002", onChange: vi.fn(), grade: 0 });
    const a1 = screen.getByRole("radio", { name: "Avatar 1" });
    const a2 = screen.getByRole("radio", { name: `Avatar ${numberOf("avatar-002")} selected` });
    const a3 = screen.getByRole("radio", { name: "Avatar 3" });
    // The selected tile is the roving tab stop when it's in view.
    expect(a2.getAttribute("tabindex")).toBe("0");
    expect(a1.getAttribute("tabindex")).toBe("-1");
    expect(a3.getAttribute("tabindex")).toBe("-1");

    const disabled = screen.getAllByRole("radio").find((r) => (r as HTMLButtonElement).disabled)!;
    expect(disabled.getAttribute("tabindex")).toBe("-1");
  });

  it("'See all avatars' switches bands and the newly-enabled explorer tile is selectable", async () => {
    const onChange = vi.fn();
    await renderMockedPicker({ value: undefined, onChange, grade: 0 });
    fireEvent.click(screen.getByRole("button", { name: "See all avatars" }));
    fireEvent.click(screen.getByRole("button", { name: "Explorer (3–5)" }));

    const explorerTile = screen.getByRole("radio", { name: `Avatar ${numberOf("avatar-101")}` });
    expect((explorerTile as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(explorerTile);
    expect(onChange).toHaveBeenCalledWith("avatar-101");
    // Nothing else is enabled in this band in the mock, so the honest caption still shows... except
    // explorer now HAS one enabled entry, so it should NOT show for explorer.
    expect(screen.queryByText(/every option above is a placeholder for now/i)).toBeNull();
  });
});
