// @vitest-environment jsdom
/**
 * WS-J propagation — each learner row in Family shows that child's OWN avatar, read from their own
 * stored profile (not whichever child happens to be active), falling back to the honest
 * placeholder. Against the REAL, unmodified avatars manifest (everything `enabled: false` today) —
 * see FamilyClient.avatarEnabled.test.tsx for a mocked-enabled id actually resolving.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";

import FamilyClient from "./FamilyClient";
import { progressStore } from "@/lib/progress";
import { AVATAR_PLACEHOLDER_SRC } from "@/lib/avatars";

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
});
afterEach(cleanup);

describe("FamilyClient child-row avatar — real manifest, everything disabled today", () => {
  it("shows the honest placeholder beside the default child's name", async () => {
    render(<FamilyClient skills={{}} courses={[]} tagGrades={{}} />);
    const name = await screen.findByText("Learner 1");
    const row = name.closest("li")!;
    expect(row.querySelector("img")?.getAttribute("src")).toBe(AVATAR_PLACEHOLDER_SRC);
  });

  it("still falls back to the placeholder for a chosen-but-disabled real manifest id", async () => {
    const p = progressStore.load();
    p.avatarId = "avatar-001";
    progressStore.save(p);
    render(<FamilyClient skills={{}} courses={[]} tagGrades={{}} />);
    const name = await screen.findByText("Learner 1");
    const row = name.closest("li")!;
    expect(row.querySelector("img")?.getAttribute("src")).toBe(AVATAR_PLACEHOLDER_SRC);
  });
});
