// @vitest-environment jsdom
/**
 * The one avatar picker (onboarding + profile). Two regimes, matching the two describe blocks:
 *
 *  - the REAL, unmodified manifest — production art landed 2026-08-14, so every slot in every band
 *    is live: selection, keyboard nav, and the "Avatar N" / "Avatar N selected" labeling contract
 *    (OPTIMIZATION_PLAN_V3.md:150) all run against the shipped assets, no mocks;
 *  - a manifest with entries mocked `enabled: false`, standing in for art pulled after a QA
 *    rejection. That is the inverse of the mock this file used to carry (which stood in for art
 *    that had not been drawn yet) and it guards the same code: a slot the manifest disables must
 *    still render as an honest placeholder, stay out of the tab order, and never fire onChange.
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

describe("AvatarPicker — real (unmodified) manifest, art landed", () => {
  it("opens the grade-appropriate band and every slot is selectable", () => {
    const onChange = vi.fn();
    render(<AvatarPicker value={undefined} onChange={onChange} grade={0} />);
    expect(screen.getByText("Early (K–2)")).toBeTruthy();

    const radios = screen.getAllByRole("radio");
    // early band: 12 human + 3 symbol = 15 slots, all present, all enabled.
    expect(radios).toHaveLength(15);
    for (const r of radios) {
      expect((r as HTMLButtonElement).disabled).toBe(false);
      expect(r.getAttribute("aria-checked")).toBe("false");
    }

    fireEvent.click(radios[0]);
    expect(onChange).toHaveBeenCalledWith("avatar-001");
  });

  it("shows no 'placeholder for now' caption — every band has real art behind it", () => {
    for (const grade of [0, 3, 6, 9]) {
      cleanup();
      render(<AvatarPicker value={undefined} onChange={vi.fn()} grade={grade} />);
      expect(screen.queryByText(/every option above is a placeholder for now/i)).toBeNull();
      expect(screen.getAllByRole("radio")).toHaveLength(15);
    }
  });

  it("every tile's image resolves to that avatar's own shipped 256 asset", () => {
    const { container } = render(<AvatarPicker value={undefined} onChange={vi.fn()} grade={0} />);
    const early = AVATARS.filter((a) => a.ageBand === "early").sort((a, b) => a.order - b.order);
    const srcs = Array.from(container.querySelectorAll("img")).map((i) => i.getAttribute("src"));
    expect(srcs).toEqual(early.map((a) => a.src256));
    // The honest placeholder is not among them any more — these are real assets.
    expect(srcs.some((s) => s?.includes("placeholder"))).toBe(false);
  });

  it("labels the selected tile 'Avatar N selected' and reflects aria-checked", () => {
    render(<AvatarPicker value="avatar-002" onChange={vi.fn()} grade={0} />);
    const selected = screen.getByRole("radio", { name: `Avatar ${numberOf("avatar-002")} selected` });
    expect(selected.getAttribute("aria-checked")).toBe("true");
    // Only one tile is ever the selected one.
    expect(screen.getAllByRole("radio").filter((r) => r.getAttribute("aria-checked") === "true")).toHaveLength(1);
  });

  it("arrow keys walk the whole band; Home/End jump to its ends", () => {
    render(<AvatarPicker value={undefined} onChange={vi.fn()} grade={0} />);
    const tiles = screen.getAllByRole("radio");
    const first = tiles[0];
    const last = tiles[tiles.length - 1];

    first.focus();
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(document.activeElement).toBe(tiles[1]);
    fireEvent.keyDown(tiles[1], { key: "ArrowDown" });
    expect(document.activeElement).toBe(tiles[2]);
    fireEvent.keyDown(tiles[2], { key: "ArrowLeft" });
    expect(document.activeElement).toBe(tiles[1]);

    fireEvent.keyDown(tiles[1], { key: "End" });
    expect(document.activeElement).toBe(last);
    // Clamped at the last tile — no wraparound past the end.
    fireEvent.keyDown(last, { key: "ArrowRight" });
    expect(document.activeElement).toBe(last);
    fireEvent.keyDown(last, { key: "Home" });
    expect(document.activeElement).toBe(first);
  });

  it("only the roving tile is a tab stop", () => {
    render(<AvatarPicker value="avatar-002" onChange={vi.fn()} grade={0} />);
    const tiles = screen.getAllByRole("radio");
    const selected = screen.getByRole("radio", { name: `Avatar ${numberOf("avatar-002")} selected` });
    expect(selected.getAttribute("tabindex")).toBe("0");
    expect(tiles.filter((t) => t.getAttribute("tabindex") === "0")).toHaveLength(1);
  });

  it("'See all avatars' reveals every band; switching bands swaps the visible grid", () => {
    const onChange = vi.fn();
    render(<AvatarPicker value={undefined} onChange={onChange} grade={0} />);
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
    const summitTile = screen.getByRole("radio", { name: `Avatar ${numberOf("avatar-301")}` });
    expect((summitTile as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(summitTile);
    expect(onChange).toHaveBeenCalledWith("avatar-301");
  });

  it("a symbol is selectable from inside its band's grid, with no separate human/symbol toggle", () => {
    const onChange = vi.fn();
    render(<AvatarPicker value={undefined} onChange={onChange} grade={0} />);
    // avatar-403 (summit star) is assigned to `early` by thematic fit and sits at order 13.
    fireEvent.click(screen.getByRole("radio", { name: `Avatar ${numberOf("avatar-403")}` }));
    expect(onChange).toHaveBeenCalledWith("avatar-403");
  });

  it("defaults to a stable band when no grade is known", () => {
    render(<AvatarPicker value={undefined} onChange={vi.fn()} />);
    expect(screen.getByText("Explorer (3–5)")).toBeTruthy();
  });
});

describe("AvatarPicker — with entries disabled (art pulled after a QA rejection)", () => {
  vi.resetModules();
  vi.doMock("@/lib/avatars", async () => {
    const actual = await vi.importActual<typeof import("@/lib/avatars")>("@/lib/avatars");
    // Everything in `early` off except avatar-002; `explorer` entirely off.
    const AVATARS = actual.AVATARS.map((a) =>
      (a.ageBand === "early" && a.id !== "avatar-002") || a.ageBand === "explorer"
        ? { ...a, enabled: false }
        : a
    );
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

  it("a disabled slot still renders, shows the placeholder, and never fires onChange", async () => {
    const onChange = vi.fn();
    await renderMockedPicker({ value: undefined, onChange, grade: 0 });

    // The band keeps its full shape — 15 slots — rather than collapsing to the one that survived.
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(15);
    const disabled = radios.filter((r) => (r as HTMLButtonElement).disabled);
    expect(disabled).toHaveLength(14);

    fireEvent.click(disabled[0]);
    expect(onChange).not.toHaveBeenCalled();
    expect(disabled[0].querySelector("img")?.getAttribute("src")).toContain("placeholder");

    // The one surviving tile is still fully selectable.
    const live = screen.getByRole("radio", { name: `Avatar ${numberOf("avatar-002")}` });
    expect((live as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(live);
    expect(onChange).toHaveBeenCalledWith("avatar-002");
  });

  it("disabled tiles are excluded from the tab order; the roving stop lands on the live one", async () => {
    await renderMockedPicker({ value: undefined, onChange: vi.fn(), grade: 0 });
    const radios = screen.getAllByRole("radio");
    for (const r of radios.filter((x) => (x as HTMLButtonElement).disabled)) {
      expect(r.getAttribute("tabindex")).toBe("-1");
    }
    expect(screen.getByRole("radio", { name: `Avatar ${numberOf("avatar-002")}` }).getAttribute("tabindex")).toBe("0");
  });

  it("a band with nothing enabled is captioned honestly, without hiding the grid", async () => {
    await renderMockedPicker({ value: undefined, onChange: vi.fn(), grade: 3 });
    expect(screen.getByText(/every option above is a placeholder for now/i)).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(15);
    expect(screen.getAllByRole("radio").every((r) => (r as HTMLButtonElement).disabled)).toBe(true);
  });
});
