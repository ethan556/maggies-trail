// @vitest-environment jsdom
/**
 * Personalization contract.
 *
 * trailNameFrom: the possessive is predictable ("David's Trail", "James's
 * Trail"), input is sanitized, and empty means the default brand.
 *
 * resolveTrailName: the priority chain is (1) a REAL active roster name —
 * "Learner N" placeholders never title the app — then (2) the onboarding
 * displayName, then (3) Maggie's Trail.
 *
 * courseIcon: the keyword mapping is TOTAL over the real catalog — every one
 * of the 84 shipped course titles resolves to a content icon, never the
 * route fallback. If a new course title misses, this test names it.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { cleanName, courseIcon, resolveTrailName, trailNameFrom } from "./personalize";
import { COPY } from "./copy";
import { progressStore } from "./progress";
import { addChild, getRoster, renameChild } from "./roster";

beforeEach(() => {
  window.localStorage.clear();
});

describe("trailNameFrom", () => {
  it("makes the possessive and defaults to the brand", () => {
    expect(trailNameFrom("David")).toBe("David's Trail");
    expect(trailNameFrom("James")).toBe("James's Trail");
    expect(trailNameFrom("")).toBe(COPY.appName);
    expect(trailNameFrom(null)).toBe(COPY.appName);
    expect(trailNameFrom("   ")).toBe(COPY.appName);
  });

  it("sanitizes: collapses whitespace and caps at 20 characters", () => {
    expect(cleanName("  Mary   Lou  ")).toBe("Mary Lou");
    expect(cleanName("A".repeat(40))).toHaveLength(20);
  });
});

describe("resolveTrailName priority", () => {
  it("defaults to Maggie's Trail with no data", () => {
    expect(resolveTrailName()).toBe(COPY.appName);
  });

  it("uses the onboarding displayName when set", () => {
    const p = progressStore.load();
    p.displayName = "Susan";
    progressStore.save(p);
    expect(resolveTrailName()).toBe("Susan's Trail");
  });

  it("a 'Learner N' roster placeholder never titles the app", () => {
    getRoster(); // seeds "Learner 1"
    const p = progressStore.load();
    p.displayName = "Susan";
    progressStore.save(p);
    expect(resolveTrailName()).toBe("Susan's Trail");
  });

  it("a genuinely named active child outranks the onboarding name", () => {
    const r = getRoster();
    renameChild(r.activeId, "Priya");
    const p = progressStore.load();
    p.displayName = "Susan";
    progressStore.save(p);
    expect(resolveTrailName()).toBe("Priya's Trail");
  });

  it("switching the active learner re-titles the trail", () => {
    addChild("Omar");
    // addChild makes the new child active
    expect(resolveTrailName()).toBe("Omar's Trail");
  });
});

describe("courseIcon is total over the shipped catalog", () => {
  it("every course title maps to a content icon (no route fallbacks)", () => {
    const root = join(process.cwd(), "content", "courses");
    const misses: string[] = [];
    for (const dir of readdirSync(root)) {
      let title = "";
      try {
        title = JSON.parse(readFileSync(join(root, dir, "course.json"), "utf8")).title as string;
      } catch {
        continue;
      }
      if (courseIcon(title) === "icon-807") misses.push(title);
    }
    expect(misses).toEqual([]);
  });

  it("maps representative topics to their content icons", () => {
    expect(courseIcon("Fractions from Scratch")).toBe("icon-904");
    expect(courseIcon("Calculus: The Derivative")).toBe("icon-911");
    expect(courseIcon("Kindergarten: Shapes & Sorting")).toBe("icon-907");
    expect(courseIcon("Grade 7: Sampling & Probability")).toBe("icon-912");
    expect(courseIcon("Lines & Angles")).toBe("icon-908");
  });
});
