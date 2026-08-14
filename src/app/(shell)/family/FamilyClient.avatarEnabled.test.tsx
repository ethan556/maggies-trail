// @vitest-environment jsdom
/**
 * WS-J propagation — a child's row resolves a real image once THAT child's own stored profile
 * names an enabled avatar. Written mocked-ahead-of-art; since production art landed 2026-08-14 it
 * runs against the REAL manifest and the REAL files, with no mock at all (see
 * FamilyClient.avatar.test.tsx for the placeholder-fallback half of the contract).
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { existsSync } from "node:fs";
import { join } from "node:path";
import React from "react";

import FamilyClient from "./FamilyClient";
import { progressStore } from "@/lib/progress";

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
});
afterEach(cleanup);

describe("FamilyClient child-row avatar — a real enabled avatar", () => {
  it("resolves the shipped src for the default child once their stored profile names an enabled id", async () => {
    const p = progressStore.load();
    p.avatarId = "avatar-001";
    progressStore.save(p);
    render(<FamilyClient skills={{}} courses={[]} tagGrades={{}} />);
    const name = await screen.findByText("Learner 1");
    const row = name.closest("li")!;
    expect(row.querySelector("img")?.getAttribute("src")).toBe("/avatars/avatar-001-256.webp");
    expect(existsSync(join(process.cwd(), "public", "avatars", "avatar-001-256.webp"))).toBe(true);
  });
});
