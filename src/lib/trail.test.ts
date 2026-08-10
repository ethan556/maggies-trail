/**
 * TRAIL VOICE (s200).
 *
 * The theme's language had no source of truth: 39 files carried it as inline literals,
 * so "trailhead", "Trail clearing" and the five stage labels were held together only by
 * whoever typed them last. `src/lib/trail.ts` is that source; these are the invariants
 * `verify:trail-voice` enforces at build time, pinned here so they also fail in the
 * normal test run.
 *
 * The §13 containment rule is the one that matters most: the lesson player is the
 * strongest surface in the product, and the theme is explicitly not allowed inside it.
 * Losing that rule would not break a render — it would just let the one screen that has
 * to stay math-dominant fill up with scenery, one commit at a time.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { TRAIL, TRAIL_STAGE, CANONICAL_TERMS, PLAYER_FORBIDDEN_IMPORTS } from "@/lib/trail";

const root = process.cwd();
const read = (...p: string[]) => readFileSync(join(root, ...p), "utf8");

describe("trail voice", () => {
  it("names a stage for every step kind", () => {
    // Mirrors the stageWidth contract: a new step kind must be named, not defaulted.
    expect(Object.keys(TRAIL_STAGE).sort()).toEqual(
      ["challenge", "check", "concept", "interactive", "recap"]
    );
    for (const [kind, label] of Object.entries(TRAIL_STAGE)) {
      expect(label.length, `${kind} has an empty stage label`).toBeGreaterThan(2);
    }
  });

  it("is the single source the player chrome actually reads", () => {
    const chrome = read("src", "components", "playerChrome.tsx");
    expect(chrome).toContain('from "@/lib/trail"');
    // Every stage label reaches the screen through the module, never retyped.
    for (const [kind, label] of Object.entries(TRAIL_STAGE)) {
      expect(chrome, `${kind} label is retyped in playerChrome`).not.toContain(`label: "${label}"`);
      expect(chrome).toContain(`TRAIL_STAGE.${kind}`);
    }
    expect(chrome).toContain("TRAIL.clearing");
    expect(chrome).toContain("TRAIL.trailhead");
    expect(chrome).toContain("TRAIL.waypoint");
  });

  it("keeps the product name and place names to one spelling", () => {
    expect(TRAIL.appName).toBe("Maggie's Trail");
    expect(TRAIL.trailhead).toBe("trailhead");
    expect(TRAIL.waypoint).toBe("waypoint");
    // Each canonical term must actually declare wrong forms, or the gate checks nothing.
    for (const entry of CANONICAL_TERMS) {
      expect(entry.wrong.length, `${entry.term} declares no wrong forms`).toBeGreaterThan(0);
      expect(entry.why.length, `${entry.term} declares no reason`).toBeGreaterThan(10);
      expect(entry.wrong, `${entry.term} lists itself as wrong`).not.toContain(entry.term);
    }
  });

  it("keeps the theme out of the lesson player (§13)", () => {
    const player = read("src", "components", "LessonPlayer.tsx");
    const imported = [...player.matchAll(/import\s+(?:\{([^}]*)\}|(\w+))\s+from/g)]
      .flatMap((m) => (m[1] ? m[1].split(",").map((x) => x.trim().split(/\s+as\s+/)[0].trim()) : [m[2]]))
      .filter(Boolean);
    expect(PLAYER_FORBIDDEN_IMPORTS.length).toBeGreaterThan(0);
    for (const banned of PLAYER_FORBIDDEN_IMPORTS) {
      expect(imported, `player imports ${banned} — §13 forbids theme inside the player`).not.toContain(banned);
    }
  });

  it("does not let the vocabulary grow decoration", () => {
    // The theme names what the learner is doing; it never adds quest/reward language.
    // If one of these ever appears as a value here, the theme has stopped being
    // navigation and started being a game layer — which §2 and §13 both rule out.
    const values = [...Object.values(TRAIL), ...Object.values(TRAIL_STAGE)].join(" ").toLowerCase();
    for (const banned of ["quest", "loot", "coin", "gem", "treasure", "boss", "energy", "streak freeze"]) {
      expect(values, `"${banned}" is reward vocabulary, not navigation`).not.toContain(banned);
    }
  });
});
