/**
 * AUTOMATED ACCESSIBILITY SWEEP — the original brief's Phase-5 mandate:
 * "Run automated checks (axe or equivalent) across every route and fix
 * everything that is real."
 *
 * Runs axe-core against the production build on every learner-facing route.
 * The gate asserts zero SERIOUS and zero CRITICAL violations; moderate/minor
 * findings are printed for triage but do not fail the run (they are tracked
 * in KNOWN_ISSUES when real, closed there when noise).
 */
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES: string[] = [
  "/",
  "/dashboard",
  "/courses",
  "/courses/add-subtract-100",
  "/daily",
  "/practice/ch1-fluency-20",
  "/review",
  "/notebook",
  "/placement",
  "/standards",
  "/profile",
  "/family",
  "/leaderboard",
  "/teach",
  "/premium",
  "/account",
  "/onboarding",
  "/mastery",
  "/learn/as100-01-01",
  // Session 113 institutional surfaces. Signed out (as here) both render their
  // deliberate empty states — the sweep pins that even the "nothing to show"
  // paths are axe-clean in both themes.
  "/admin",
  "/teach/class/nonexistent-class",
  // Session 200 Phase C/D world surfaces. Signed out they render their empty states, which is
  // exactly the path most likely to ship an unlabelled map or a nameless list.
  "/trailhead",
  "/atlas",
  "/basecamp/fractions",
  "/journal"
];

const MODES = ["light", "dark"] as const;

for (const mode of MODES) {
  for (const route of ROUTES) {
  test(`axe[${mode}]: ${route} passes axe with zero violations`, async ({ page }) => {
    // The app resolves theme from localStorage("numera:theme") in an inline
    // <head> script, falling back to prefers-color-scheme — so setting the key
    // before any document loads makes the mode deterministic per run.
    await page.addInitScript(
      (m) => window.localStorage.setItem("numera:theme", m),
      mode
    );
    await page.goto(route, { waitUntil: "networkidle" });
    const results = await new AxeBuilder({ page }).analyze();
    // S109: the gate is total — zero violations of ANY impact, both themes.
    expect(
      results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.slice(0, 3).map((n) => n.target.join(" "))
      }))
    ).toEqual([]);
  });
  }
}
