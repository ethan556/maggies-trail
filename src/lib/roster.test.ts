// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { addChild, getRoster, readChildProfile, removeChild, renameChild, setActiveChild } from "./roster";
import { emptyProfile } from "./progress";
import { DEFAULT_CHILD_ID, LEGACY_PROFILE_KEY, profileKey, ROSTER_KEY } from "./storageKeys";

afterEach(() => localStorage.clear());

describe("roster", () => {
  it("starts with one default active child", () => {
    const r = getRoster();
    expect(r.children.length).toBe(1);
    expect(r.activeId).toBe(DEFAULT_CHILD_ID);
  });

  it("adds a child and makes it active", () => {
    getRoster();
    const r = addChild("Mia", 4);
    expect(r.children.length).toBe(2);
    expect(r.children[1].name).toBe("Mia");
    expect(r.children[1].grade).toBe(4);
    expect(r.activeId).toBe(r.children[1].id);
  });

  it("renames a child and switches the active learner", () => {
    getRoster();
    const midId = addChild("Mia").children[1].id;
    expect(renameChild(midId, "Amelia").children.find((c) => c.id === midId)?.name).toBe("Amelia");
    expect(setActiveChild(DEFAULT_CHILD_ID).activeId).toBe(DEFAULT_CHILD_ID);
  });

  it("removes a child but never the last one", () => {
    getRoster();
    const id = addChild("Mia").children[1].id;
    const afterRemove = removeChild(id);
    expect(afterRemove.children.length).toBe(1);
    expect(removeChild(afterRemove.children[0].id).children.length).toBe(1); // last is protected
  });

  it("keeps each child's progress separate", () => {
    getRoster();
    localStorage.setItem(profileKey(DEFAULT_CHILD_ID), JSON.stringify({ ...emptyProfile(), xp: 50 }));
    const mid = addChild("Mia").children[1].id;
    localStorage.setItem(profileKey(mid), JSON.stringify({ ...emptyProfile(), xp: 12 }));
    expect(readChildProfile(DEFAULT_CHILD_ID).xp).toBe(50);
    expect(readChildProfile(mid).xp).toBe(12);
  });

  it("replaces a structurally malformed roster instead of returning poisoned children", () => {
    localStorage.setItem(ROSTER_KEY, JSON.stringify({ children: ["not-a-child"], activeId: "x" }));
    const roster = getRoster();
    expect(roster.children).toHaveLength(1);
    expect(roster.children[0].id).toBe(DEFAULT_CHILD_ID);
  });

  it("migrates a legacy single profile into the default child on first load", () => {
    localStorage.setItem(LEGACY_PROFILE_KEY, JSON.stringify({ ...emptyProfile(), xp: 99 }));
    getRoster();
    expect(readChildProfile(DEFAULT_CHILD_ID).xp).toBe(99);
  });
});
