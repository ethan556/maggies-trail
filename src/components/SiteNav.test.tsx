// @vitest-environment jsdom
/**
 * Contract for the redesigned navigation shell. The old seven-item scroll row is
 * gone; the shell now groups four primary destinations (visible on desktop and in
 * the mobile bottom bar) and tucks the rest behind an account menu / "More" sheet.
 * This guards: the primary links exist and point where they should, the active
 * destination is marked, secondary links surface on demand, and the review due
 * badge renders from real progress.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import React from "react";

vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }));
vi.mock("@/components/SyncIndicator", () => ({ default: () => null }));

import SiteNav from "./SiteNav";
import { progressStore } from "@/lib/progress";
import { localDateStr } from "@/lib/engine";

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.setAttribute("open", "");
    }
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    }
  });
});
afterEach(cleanup);

describe("SiteNav shell", () => {
  it("exposes the four primary destinations and marks the active one", () => {
    render(<SiteNav />);
    for (const [label, href] of [
      ["Home", "/dashboard"],
      ["Learn", "/courses"],
      ["Review", "/review"],
      ["Daily", "/daily"]
    ]) {
      const links = screen.getAllByRole("link", { name: new RegExp(label, "i") });
      expect(links.some((l) => l.getAttribute("href") === href)).toBe(true);
    }
    // Active destination (/dashboard) is announced to assistive tech.
    const home = screen.getAllByRole("link", { name: /home/i }).find((l) => l.getAttribute("href") === "/dashboard")!;
    expect(home.getAttribute("aria-current")).toBe("page");
  });

  it("does not render a horizontally scrolling row (no overflow-x-auto nav)", () => {
    const { container } = render(<SiteNav />);
    expect(container.querySelector("nav.overflow-x-auto")).toBeNull();
  });

  it("keeps secondary destinations out of the top bar until opened", () => {
    render(<SiteNav />);
    // Desktop account menu is collapsed: its menu items are not in the tree yet.
    expect(screen.queryByRole("menuitem", { name: /premium/i })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /account and more/i }));
    const menu = screen.getByRole("menu");
    expect(within(menu).getByRole("menuitem", { name: /profile/i }).getAttribute("href")).toBe("/profile");
    expect(within(menu).getByRole("menuitem", { name: /premium/i }).getAttribute("href")).toBe("/premium");
  });

  it("links the world layer (Trailhead / Atlas / Journal) from the secondary menu — WS-E Phase 5", () => {
    render(<SiteNav />);
    fireEvent.click(screen.getByRole("button", { name: /account and more/i }));
    const menu = screen.getByRole("menu");
    for (const [label, href] of [
      ["Trailhead", "/trailhead"],
      ["Atlas", "/atlas"],
      ["Journal", "/journal"]
    ]) {
      expect(within(menu).getByRole("menuitem", { name: new RegExp(`^${label}$`, "i") }).getAttribute("href")).toBe(href);
    }
  });

  it("surfaces the world layer in the mobile More sheet too", () => {
    render(<SiteNav />);
    fireEvent.click(screen.getByRole("button", { name: /^more$/i }));
    const sheet = screen.getByRole("dialog", { name: /more destinations/i });
    expect(within(sheet).getByRole("link", { name: /trailhead/i }).getAttribute("href")).toBe("/trailhead");
    expect(within(sheet).getByRole("link", { name: /atlas/i }).getAttribute("href")).toBe("/atlas");
    expect(within(sheet).getByRole("link", { name: /journal/i }).getAttribute("href")).toBe("/journal");
  });

  it("renders Teach only once in the desktop secondary menu", () => {
    render(<SiteNav />);
    fireEvent.click(screen.getByRole("button", { name: /account and more/i }));
    const menu = screen.getByRole("menu");
    expect(within(menu).getAllByRole("menuitem", { name: /^teach$/i })).toHaveLength(1);
  });

  it("opens the mobile More sheet with the secondary destinations", () => {
    render(<SiteNav />);
    fireEvent.click(screen.getByRole("button", { name: /^more$/i }));
    const sheet = screen.getByRole("dialog", { name: /more destinations/i });
    expect(within(sheet).getByRole("link", { name: /family/i }).getAttribute("href")).toBe("/family");
  });

  it("moves focus into the native modal and returns it after Escape", async () => {
    render(<SiteNav />);
    const trigger = screen.getByRole("button", { name: /^more$/i });
    fireEvent.click(trigger);

    const sheet = screen.getByRole("dialog", { name: /more destinations/i });
    const firstDestination = within(sheet).getByRole("link", { name: /trailhead/i });
    await waitFor(() => expect(document.activeElement).toBe(firstDestination));
    expect(sheet.hasAttribute("open")).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    const close = within(sheet).getByRole("button", { name: "Close menu" });
    const theme = within(sheet).getByRole("button", { name: /Switch to (dark|light) mode/ });
    theme.focus();
    fireEvent.keyDown(sheet, { key: "Tab" });
    expect(document.activeElement).toBe(close);
    fireEvent.keyDown(sheet, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(theme);

    fireEvent(sheet, new Event("cancel", { cancelable: true }));
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    expect(sheet.hasAttribute("open")).toBe(false);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("closes from the scrim and restores the More trigger", async () => {
    render(<SiteNav />);
    const trigger = screen.getByRole("button", { name: /^more$/i });
    fireEvent.click(trigger);

    const sheet = screen.getByRole("dialog", { name: /more destinations/i });
    await waitFor(() => expect(document.activeElement).toBe(within(sheet).getByRole("link", { name: /trailhead/i })));
    const scrim = sheet.querySelector<HTMLButtonElement>('button[aria-hidden="true"]');
    expect(scrim).not.toBeNull();
    fireEvent.click(scrim!);

    await waitFor(() => expect(document.activeElement).toBe(trigger));
    expect(sheet.hasAttribute("open")).toBe(false);
  });

  it("shows a due-review badge when the review queue has items", () => {
    const p = progressStore.load();
    // Seed one item due today so the badge computes > 0.
    p.review = [{ key: "l:t", conceptTag: "t", lessonId: "l", stepId: "s", box: 1, due: localDateStr(new Date()) }];
    progressStore.save(p);
    render(<SiteNav />);
    // Two rendered surfaces (desktop pill + mobile bar) can both carry it; at least one exists.
    expect(screen.getAllByLabelText(/1 reviews due/i).length).toBeGreaterThan(0);
  });
});
