// @vitest-environment jsdom
// The notebook page's full loop: static index in, local profile applied,
// cards with a live retained reading out — and a decay cue that links to
// review rather than guilt-tripping.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import NotebookClient from "./NotebookClient";
import { progressStore } from "@/lib/progress";
import type { NotebookIndex } from "@/lib/notebook";

const index: NotebookIndex = {
  contentVersion: "test",
  courses: [
    {
      title: "Counting",
      lessons: [
        { id: "a1", title: "Count the Dots", takeaways: ["One number per thing."], tags: ["count-1to1"] }
      ]
    }
  ]
};

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(index) }))
  );
});
afterEach(() => vi.unstubAllGlobals());

describe("NotebookClient", () => {
  it("shows the empty state before anything is completed", async () => {
    render(<NotebookClient />);
    await waitFor(() => expect(screen.getByText(/Nothing written down yet/)).toBeTruthy());
  });

  it("a completed lesson renders its card with takeaways and a retained reading", async () => {
    const p = progressStore.load();
    p.lessons["a1"] = { completed: true, bestXp: 10 };
    p.mastery = {
      // S120: this was pinned to a fixed date and asserted the fading cue is ABSENT — so it
      // passed until the wall clock drifted 11 days past it (mastery 0.8 comes due at
      // 7 + 30·ln(0.8/0.7) ≈ 11.0 days) and then failed for reasons having nothing to do with
      // the component. A skill seen TODAY is the thing this test actually means by "not fading".
      "count-1to1": { tag: "count-1to1", mastery: 0.8, attempts: 3, correctStreak: 2, lastSeen: new Date().toISOString().slice(0, 10) }
    };
    progressStore.save(p);
    render(<NotebookClient />);
    await waitFor(() => expect(screen.getByText("Count the Dots")).toBeTruthy());
    expect(screen.getByText("One number per thing.")).toBeTruthy();
    expect(screen.getByText(/%$/)).toBeTruthy();
    expect(screen.queryByTestId("fading-cue")).toBeNull();
  });

  it("a decayed skill surfaces the fading cue with a path to review", async () => {
    const p = progressStore.load();
    p.lessons["a1"] = { completed: true, bestXp: 10 };
    p.mastery = {
      "count-1to1": { tag: "count-1to1", mastery: 0.85, attempts: 3, correctStreak: 2, lastSeen: "2026-04-01" }
    };
    progressStore.save(p);
    render(<NotebookClient />);
    await waitFor(() => expect(screen.getByTestId("fading-cue")).toBeTruthy());
    expect(screen.getByTestId("fading-cue").textContent).toContain("review");
  });

  it("a failed index fetch degrades to a readable message, never a crash", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: false, status: 404 })));
    render(<NotebookClient />);
    await waitFor(() => expect(screen.getByText(/couldn.t load/)).toBeTruthy());
  });
});
