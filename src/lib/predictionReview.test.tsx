// @vitest-environment jsdom
import { describe, expect, it, afterEach, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { recordPredictionOutcome, predictionReviews } from "@/lib/predictionReview";
import { emptyProfile, progressStore } from "@/lib/progress";
import MissedPredictionsCard from "@/components/MissedPredictionsCard";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("recordPredictionOutcome — the loop's back half", () => {
  it("a miss writes the entry; a fully-held re-completion resolves it", () => {
    const p = emptyProfile();
    recordPredictionOutcome(p, "les-01-01", [{ held: false }, { held: true }], "2026-07-13");
    expect(p.missedPredictions).toEqual({ "les-01-01": { missed: 1, total: 2, at: "2026-07-13" } });

    recordPredictionOutcome(p, "les-01-01", [{ held: true }, { held: true }], "2026-07-14");
    expect(p.missedPredictions).toEqual({});
  });

  it("a repeat miss refreshes the date (the retrieval clock restarts)", () => {
    const p = emptyProfile();
    recordPredictionOutcome(p, "a", [{ held: false }], "2026-07-10");
    recordPredictionOutcome(p, "a", [{ held: false }], "2026-07-13");
    expect(p.missedPredictions!["a"].at).toBe("2026-07-13");
  });

  it("lessons without predictions never write, and never clear other lessons", () => {
    const p = emptyProfile();
    recordPredictionOutcome(p, "a", [{ held: false }], "2026-07-13");
    recordPredictionOutcome(p, "b", [], "2026-07-13");
    expect(Object.keys(p.missedPredictions!)).toEqual(["a"]);
  });
});

describe("predictionReviews — delayed retrieval, due-first", () => {
  it("due only from the NEXT day; sorted due-first then oldest-first", () => {
    const p = emptyProfile();
    recordPredictionOutcome(p, "today", [{ held: false }], "2026-07-13");
    recordPredictionOutcome(p, "old", [{ held: false }], "2026-07-10");
    recordPredictionOutcome(p, "older", [{ held: false }], "2026-07-08");
    const list = predictionReviews(p, "2026-07-13");
    expect(list.map((x) => [x.lessonId, x.due])).toEqual([
      ["older", true],
      ["old", true],
      ["today", false] // missed TODAY — the reveal is still warm; due tomorrow
    ]);
  });
});

describe("MissedPredictionsCard", () => {
  it("renders nothing when there are no remembered surprises", () => {
    const { container } = render(<MissedPredictionsCard />);
    expect(container.innerHTML).toBe("");
  });

  it("shows due lessons with a Revisit link and titles from the API", async () => {
    const p = progressStore.load();
    recordPredictionOutcome(p, "les-01-01", [{ held: false }, { held: true }], "2026-07-10");
    progressStore.save(p);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ titles: { "les-01-01": "Keeping the Scale Level" } })
      })
    );
    render(<MissedPredictionsCard />);
    await waitFor(() => expect(screen.getByText("Keeping the Scale Level")).toBeTruthy());
    expect(screen.getByText(/1 of 2 predictions missed/)).toBeTruthy();
    const link = screen.getByRole("link", { name: "Revisit" });
    expect(link.getAttribute("href")).toBe("/learn/les-01-01");
  });

  it("a same-day miss waits for tomorrow instead of offering an immediate rerun", async () => {
    const p = progressStore.load();
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    recordPredictionOutcome(p, "fresh-lesson", [{ held: false }], iso);
    progressStore.save(p);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ titles: {} }) }));
    render(<MissedPredictionsCard />);
    await waitFor(() => expect(screen.getByText(/due tomorrow/)).toBeTruthy());
    expect(screen.queryByRole("link", { name: "Revisit" })).toBeNull();
  });
});
