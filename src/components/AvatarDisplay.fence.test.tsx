/**
 * WS-J — the architectural fence, ported from the S241 parallel implementation (its one piece
 * this lineage lacked): identity decoration must never reach an active-reasoning surface.
 *
 * The avatar system is chrome — nav, dashboard, profile, onboarding, leaderboard, family. The
 * surfaces where a learner is actively *thinking* (the lesson player, widgets, figures, quiz
 * machinery, manipulatives) must stay identity-free, so nothing about who a learner picked to be
 * ever styles, gates, or decorates how a problem is posed. Convention alone doesn't survive
 * refactors; this test does. It walks `src/` and fails the moment any reasoning-surface file
 * imports an avatar module, and it pins the exact sanctioned importer list so a new surface
 * joining the avatar system is a deliberate, test-visible act rather than a drive-by import.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/** Every non-test source file under a directory. */
function sourceFiles(dir: string, acc: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) {
      if (e === "node_modules" || e === ".next") continue;
      sourceFiles(p, acc);
    } else if ((p.endsWith(".ts") || p.endsWith(".tsx")) && !/\.test\.tsx?$/.test(p) && !/\.testshim\.|\.testkit\./.test(p)) {
      acc.push(p);
    }
  }
  return acc;
}

/** A file whose job is a question, a hint, a manipulative, or any part of active reasoning. */
function isReasoningSurface(path: string): boolean {
  const name = path.split("/").pop() ?? "";
  return (
    /^LessonPlayer/.test(name) ||
    /^player(Chrome|Store)\./.test(name) ||
    /^(widgets|WidgetView|figures|FigureView|QuizShell|ProofStrip|widgetSamples)\./.test(name) ||
    path.includes("/manipulative")
  );
}

const rel = (p: string) => p.split(/[\\/]/).join("/");

describe("the fence — identity never reaches an active-reasoning surface", () => {
  it("finds the reasoning surfaces it claims to be guarding (the detector is not blind)", () => {
    const guarded = sourceFiles("src").filter(isReasoningSurface).map((p) => p.split("/").pop());
    for (const expected of ["LessonPlayer.tsx", "playerChrome.tsx", "playerStore.ts", "widgets.tsx", "WidgetView.tsx"]) {
      expect(guarded).toContain(expected);
    }
  });

  it("no lesson-player, widget, figure or manipulative file imports an avatar module", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles("src").filter(isReasoningSurface)) {
      const body = readFileSync(file, "utf8");
      if (/AvatarDisplay|AvatarPicker|lib\/avatars/.test(body)) offenders.push(rel(file));
    }
    expect(offenders).toEqual([]);
  });

  it("only the sanctioned chrome surfaces import the avatar modules at all", () => {
    const importers: string[] = [];
    for (const file of sourceFiles("src")) {
      const body = readFileSync(file, "utf8");
      if (/from "@\/(lib\/avatars|components\/Avatar(Display|Picker))"/.test(body)) importers.push(rel(file));
    }
    expect(importers.sort()).toEqual([
      "src/app/(shell)/family/FamilyClient.tsx",
      "src/app/(shell)/leaderboard/LeaderboardClient.tsx",
      "src/app/(shell)/onboarding/OnboardingFlow.tsx",
      "src/components/AvatarDisplay.tsx",
      "src/components/AvatarPicker.tsx",
      "src/components/DashboardClient.tsx",
      "src/components/ProfileClient.tsx",
      "src/components/SiteNav.tsx"
    ]);
  });
});
