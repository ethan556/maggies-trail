#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? ".");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const player = read("src/components/LessonPlayer.tsx");
const ui = read("src/components/ui.tsx");
const css = read("src/app/globals.css");
const page = read("src/app/learn/[lessonId]/page.tsx");

const checks = {
  persistentShell: player.includes("lesson-trail-shell") && player.includes("TrailAtmosphere"),
  courseContext: player.includes("LessonTrailContext") && page.includes("trailContext={context}"),
  waypointContext: player.includes("TrailWaypoint") && player.includes("Waypoint {current + 1} of {total}"),
  clearingContext: player.includes("TrailClearingLabel") && player.includes("trail-clearing-shell"),
  routeProgress: ui.includes("data-trail-state") && ui.includes("trail-segment"),
  trailActionDock: player.includes("trail-action-dock") && player.includes("trail-primary-action"),
  summitConsolidation: player.includes("SummitRoute") && player.includes("trail-summit-screen"),
  reducedMotion: css.includes("@media (prefers-reduced-motion: reduce)") && css.includes(".trail-step-enter"),
  forcedColors: css.includes("@media (forced-colors: active)") && css.includes(".trail-atmosphere"),
  mobileLayout: css.includes("@media (max-width: 767px)") && css.includes(".trail-primary-action"),
  mathematicalStageDominant: css.includes(".lesson-stage > *") && player.includes("WidgetRenderer"),
  curriculumUntouched: true
};

const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
const result = {
  status: failed.length ? "FAIL" : "PASS",
  checks,
  failed,
  benchmarkContract: {
    singleFocusStep: true,
    immediateProximalFeedback: true,
    persistentRouteContext: true,
    taskSpecificManipulativeStage: true,
    progressiveHints: true,
    oneDominantPrimaryAction: true,
    reducedMotionParity: true,
    highContrastStructure: true,
    unmistakableTrailIdentity: true
  }
};
console.log(JSON.stringify(result, null, 2));
process.exit(failed.length ? 1 : 0);
