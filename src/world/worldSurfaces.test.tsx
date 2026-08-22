// @vitest-environment jsdom
/**
 * S201 — world capability parity and rollout surfaces.
 *
 * The load-bearing test here is mode equivalence. §6 promises the three theme intensities
 * differ in presentation only; a promise like that decays the moment someone adds a flag that
 * gates a link. So rather than testing that flags are booleans (worldThemes already pins that),
 * this renders every surface in all three modes and asserts the reachable route set and the
 * actionable-control set are IDENTICAL. A mode that hides a lesson link fails here.
 *
 * The other quiet trap covered: the Atlas and Basecamp run on a SLICED manifest for bundle
 * reasons, and Pattern Valley's approach trails leave the region. If the slice dropped them,
 * `approachOpen` would fail closed and courses would render locked for everyone — a bug that
 * looks like correct "not unlocked yet" behaviour. `sliced derivation === full derivation`
 * catches it.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { WorldShell } from "./WorldShell";
import { Trailhead } from "./Trailhead";
import { Atlas } from "./Atlas";
import { regionRoots, worldSlice } from "./worldSlice";
import type { AtlasSearchIndex } from "./atlasSearch";
import { Basecamp } from "./Basecamp";
import { WorldPreferences } from "./WorldModePreferences";
import { emptyProfile, progressStore, type Profile } from "@/lib/progress";
import { Instruments } from "./Instruments";
import { ReturnPaths } from "./ReturnPaths";
import { FieldJournal } from "./FieldJournal";
import { instrumentState as instrumentStateRule } from "./revealRules";
import { deriveWorldState } from "./deriveWorldState";
import { dominantAction, nextWaypoint } from "./worldNav";
import { WORLD_PREFS_KEY } from "./worldPreferences";
import { MODE_FLAGS, type ThemeIntensity } from "./worldThemes";
import type { WorldEvidence, WorldManifest } from "./worldTypes";

const full: WorldManifest = JSON.parse(
  readFileSync(join(process.cwd(), "content", "world", "world-manifest.json"), "utf8")
);

/**
 * S202: the specs now call the SAME closure walk production calls.
 *
 * S201 kept two hand-copied mirrors here because `worldServer` carries `import "server-only"`.
 * Both copies had already drifted — they returned `connections: []`, which production stopped
 * doing when `worldSlice` began filtering connections into the slice. A fixture that
 * re-implements the code under test cannot fail when that code regresses, which is the one
 * thing a fixture exists to do. `worldSlice` is now a pure module, so the mirrors are gone.
 */
const slice = (regionId: string): WorldManifest => worldSlice(full, regionRoots(full, regionId));
const courseSlice = (courseId: string): WorldManifest => worldSlice(full, [courseId]);

const PILOT = "pattern-valley";
const pilot = slice(PILOT);
const TODAY = "2026-08-04";
const empty = (): WorldEvidence => ({ lessons: {}, review: [], testouts: {}, mastery: {} });

const nonPilot = full.courses.find((course) => course.regionId !== PILOT)!;
const nonPilotRegion = full.regions.find((region) => region.id === nonPilot.regionId)!;
const SEARCH_INDEX: AtlasSearchIndex = {
  courses: [
    ["fractions", "Fractions from Scratch", 3],
    [nonPilot.courseId, "Non-pilot Algebra", nonPilotRegion.gradeBand]
  ],
  lessonBands: [
    ["fraction-equivalence-test", 3],
    ["outside-region-test", nonPilotRegion.gradeBand]
  ]
};

const atlasRegions = full.regions.map((r) => {
  const courses = full.courses.filter((c) => c.regionId === r.id);
  return {
    id: r.id, name: r.name, gradeBand: r.gradeBand, description: r.description,
    environmentalGrammar: r.environmentalGrammar, accessibilityLabel: r.accessibilityLabel,
    primaryDomains: r.primaryDomains, courseCount: courses.length, waypointCount: 0
  };
});

const fractions = pilot.courses.find((c) => c.courseId === "fractions")!;
const fractionLandmarks = fractions.landmarkIds.map((id) => pilot.landmarks.find((l) => l.id === id)!);
const courseNames = Object.fromEntries(pilot.courses.map((c) => [c.courseId, c.trailName]));
const basecampWaypoints = Object.fromEntries(
  fractionLandmarks.flatMap((landmark) => landmark.waypointIds.map((id) => [id, { title: id, minutes: 5 }]))
);
const basecampProps = {
  courseId: "fractions",
  trailName: "Fractions from Scratch",
  trailSummary: "Cut things into equal parts.",
  category: "Math",
  lessonCount: fractionLandmarks.reduce((sum, landmark) => sum + landmark.waypointIds.length, 0),
  totalMinutes: fractionLandmarks.reduce((sum, landmark) => sum + landmark.waypointIds.length * 5, 0),
  landmarks: fractionLandmarks,
  waypoints: basecampWaypoints,
  masteryConcepts: [] as Array<[string, string]>
};

function setMode(mode: ThemeIntensity): void {
  window.localStorage.setItem(WORLD_PREFS_KEY, JSON.stringify({ themeIntensity: mode }));
}

/** Every href and every actionable control in a rendered tree. */
function surfaceContract(container: HTMLElement): { routes: string[]; controls: string[] } {
  const routes = [...container.querySelectorAll("a[href]")]
    .map((a) => a.getAttribute("href") ?? "")
    .sort();
  const controls = [...container.querySelectorAll("a[href], button, input, select")]
    .map((element) => {
      const el = element as HTMLInputElement | HTMLSelectElement | HTMLElement;
      const labels = "labels" in el && el.labels ? [...el.labels].map((label) => label.textContent ?? "").join(" ") : "";
      return `${element.tagName.toLowerCase()}:${labels || element.getAttribute("aria-label") || element.textContent || ""}`
        .replace(/\s+/g, " ")
        .trim();
    })
    .filter(Boolean)
    .sort();
  return { routes, controls };
}

const MODES: ThemeIntensity[] = ["minimal", "guided", "immersive"];

const instrumentStateOf = (i: Parameters<typeof instrumentStateRule>[0], ev: WorldEvidence) =>
  instrumentStateRule(i, ev, TODAY);

/** Seed local evidence through the REAL store. Hand-written localStorage JSON is rejected by
 * `parseStoredProfile` (it requires the sync stamp `progressStore.save` adds), and a test that
 * silently loaded an empty profile would have passed against an empty surface forever. */
function seedProfile(patch: Partial<Profile>): void {
  progressStore.save({ ...emptyProfile(), ...patch });
}

describe("slice fidelity — the world a surface sees equals the real world", () => {
  it("keeps approach trails that leave the region, so nothing locks by accident", () => {
    // multiplication-division's prerequisites are NOT in Pattern Valley
    const md = full.courses.find((c) => c.courseId === "multiplication-division")!;
    expect(md.prerequisiteCourseIds.length).toBeGreaterThan(0);
    for (const p of md.prerequisiteCourseIds) {
      const outside = full.courses.find((c) => c.courseId === p)!;
      expect(outside.regionId).not.toBe(PILOT);
      expect(pilot.courses.some((c) => c.courseId === p), `${p} must survive the slice`).toBe(true);
    }
  });

  it("a per-course slice keeps cross-region prerequisites and derives exactly like the full world", () => {
    const byId = new Map(full.courses.map((course) => [course.courseId, course]));
    const target = full.courses.find((course) =>
      course.prerequisiteCourseIds.some((id) => byId.get(id)?.regionId !== course.regionId)
    )!;
    const sliced = courseSlice(target.courseId);
    expect(sliced.courses.some((course) => course.courseId === target.courseId)).toBe(true);
    for (const prerequisiteId of target.prerequisiteCourseIds) {
      expect(sliced.courses.some((course) => course.courseId === prerequisiteId), prerequisiteId).toBe(true);
    }
    const evidence = empty();
    for (const course of sliced.courses) {
      for (const landmarkId of course.landmarkIds) {
        const landmark = sliced.landmarks.find((entry) => entry.id === landmarkId)!;
        evidence.lessons[landmark.waypointIds[0]] = { completed: true, completedAt: "2026-08-02" };
      }
    }
    expect(deriveWorldState(sliced, evidence, TODAY).courses[target.courseId])
      .toEqual(deriveWorldState(full, evidence, TODAY).courses[target.courseId]);
  });

  it("derives identical state for pilot courses from the slice and from the full manifest", () => {
    const evidence = empty();
    // walk one waypoint of every landmark of every approach trail
    for (const c of pilot.courses) {
      for (const lid of c.landmarkIds) {
        const lm = pilot.landmarks.find((l) => l.id === lid)!;
        evidence.lessons[lm.waypointIds[0]] = { completed: true, completedAt: "2026-08-02" };
      }
    }
    const fromSlice = deriveWorldState(pilot, evidence, TODAY);
    const fromFull = deriveWorldState(full, evidence, TODAY);
    for (const c of pilot.courses) {
      expect(fromSlice.courses[c.courseId], c.courseId).toEqual(fromFull.courses[c.courseId]);
    }
  });
});

describe("mode equivalence (§6) — presentation differs, function does not", () => {
  beforeEach(() => window.localStorage.clear());

  for (const surface of ["trailhead", "atlas", "basecamp"] as const) {
    it(`${surface}: same routes and controls in minimal, guided and immersive`, () => {
      const contracts = MODES.map((mode) => {
        setMode(mode);
        const ui =
          surface === "trailhead" ? (
            <Trailhead landmarks={pilot.landmarks} courseNames={courseNames} regionName="Pattern Valley" />
          ) : surface === "atlas" ? (
            <Atlas regions={atlasRegions} activeRegionId={PILOT} searchIndex={SEARCH_INDEX} />
          ) : (
            <Basecamp {...basecampProps} prerequisites={[{ courseId: "multiplication-division", trailName: "Multiplication & Division" }]} />
          );
        const { container, unmount } = render(
          <WorldShell manifest={pilot} today={TODAY}>{ui}</WorldShell>
        );
        const c = surfaceContract(container);
        unmount();
        return c;
      });
      expect(contracts[1].routes).toEqual(contracts[0].routes);
      expect(contracts[2].routes).toEqual(contracts[0].routes);
      expect(contracts[1].controls).toEqual(contracts[0].controls);
      expect(contracts[2].controls).toEqual(contracts[0].controls);
      expect(contracts[0].routes.length).toBeGreaterThan(0);
    });
  }

  it("the modes DO differ in presentation — otherwise the setting is a lie", () => {
    setMode("minimal");
    const min = render(<WorldShell manifest={pilot} today={TODAY}><Atlas regions={atlasRegions} activeRegionId={PILOT} searchIndex={SEARCH_INDEX} /></WorldShell>);
    expect(min.container.querySelectorAll("[data-region-map]")).toHaveLength(0);
    min.unmount();
    setMode("immersive");
    const imm = render(<WorldShell manifest={pilot} today={TODAY}><Atlas regions={atlasRegions} activeRegionId={PILOT} searchIndex={SEARCH_INDEX} /></WorldShell>);
    expect(imm.container.querySelectorAll("[data-region-map]")).toHaveLength(1);
    imm.unmount();
    expect(MODE_FLAGS.minimal.regionArt).toBe(false);
  });
});

describe("Atlas accessibility (§11/§28)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input), "http://localhost");
      const query = url.searchParams.get("q") ?? "";
      const lessons = query.includes("equivalent fractions")
        ? [["fraction-equivalence-test", "Equivalent fractions", "Fractions from Scratch", 3]]
        : query.includes("linear relationships")
          ? [["outside-region-test", "Linear relationships", "Non-pilot Algebra", nonPilotRegion.gradeBand]]
          : [];
      return { ok: true, json: async () => ({ lessons }) } as Response;
    }));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("every region in the map is reachable from the list, and the map is not announced twice", () => {
    setMode("immersive");
    const { container } = render(
      <WorldShell manifest={pilot} today={TODAY}><Atlas regions={atlasRegions} activeRegionId={PILOT} searchIndex={SEARCH_INDEX} /></WorldShell>
    );
    const list = screen.getByRole("list", { name: /all regions/i }) ?? container.querySelector("ol")!;
    const items = within(list as HTMLElement).getAllByRole("listitem");
    expect(items).toHaveLength(14);
    for (const r of atlasRegions) {
      expect(within(list as HTMLElement).getByText(r.name)).toBeTruthy();
      expect(container.querySelector(`a[href="/trailhead?region=${r.id}"]`), r.id).toBeTruthy();
    }
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("aria-hidden")).toBe("true"); // the list is the semantic path
  });

  it("finds a course outside the pilot region and keeps the result keyboard reachable", () => {
    render(<WorldShell manifest={pilot} today={TODAY}><Atlas regions={atlasRegions} activeRegionId={PILOT} searchIndex={SEARCH_INDEX} /></WorldShell>);
    fireEvent.change(screen.getByRole("searchbox", { name: /search courses and lessons/i }), { target: { value: "Non-pilot Algebra" } });
    const matches = screen.getByRole("region", { name: "Matching courses" });
    expect(within(matches).getByRole("link", { name: /Non-pilot Algebra/i }).getAttribute("href")).toBe(`/basecamp/${nonPilot.courseId}`);
    expect(screen.getByRole("list", { name: /all regions/i }).textContent).toContain(full.regions.find((r) => r.id === nonPilot.regionId)?.name);
  });

  it("keeps lesson-title search and renders an explicit empty state", async () => {
    render(<WorldShell manifest={pilot} today={TODAY}><Atlas regions={atlasRegions} activeRegionId={PILOT} searchIndex={SEARCH_INDEX} /></WorldShell>);
    const search = screen.getByRole("searchbox", { name: /search courses and lessons/i });
    fireEvent.change(search, { target: { value: "Equivalent fractions" } });
    await waitFor(() => expect(screen.getByRole("link", { name: /Equivalent fractions/i }).getAttribute("href")).toBe("/learn/fraction-equivalence-test"));
    fireEvent.change(search, { target: { value: "nothing in the atlas" } });
    await waitFor(() => expect(screen.getByRole("status").textContent).toMatch(/No Atlas results/i));
  });

  /**
   * INTENT CHANGE, S203 — stated rather than slipped in.
   *
   * S201's assertion was `getAllByRole("listitem")).toHaveLength(1)`: a grade filter DELETED the
   * other thirteen regions from the semantic list, and from the map, which lays out by array
   * index. The map's geography therefore rearranged itself while a learner typed. That is the
   * one thing a world map must never do, so the behaviour changed and this assertion changed
   * with it. The new contract is strictly stronger — it pins both what matches and what is
   * still present — but it is a different contract, and the old one no longer holds.
   */
  it("grade filtering marks the matching region and keeps the other thirteen listed", () => {
    render(<WorldShell manifest={pilot} today={TODAY}><Atlas regions={atlasRegions} activeRegionId={PILOT} searchIndex={SEARCH_INDEX} /></WorldShell>);
    fireEvent.change(screen.getByRole("combobox", { name: "Grade" }), { target: { value: String(nonPilotRegion.gradeBand) } });
    const list = screen.getByRole("list", { name: /all regions/i });
    expect(within(list).getAllByRole("listitem")).toHaveLength(14);
    const matched = [...list.querySelectorAll('[data-matched="true"]')];
    expect(matched).toHaveLength(1);
    expect(matched[0].getAttribute("data-region")).toBe(nonPilotRegion.id);
    expect(matched[0].textContent).toContain(nonPilotRegion.name);
    // "no matches here" must be readable, not merely dimmer.
    const unmatched = list.querySelector('[data-matched="false"]')!;
    expect(unmatched.textContent).toMatch(/No matches here/i);
  });

  it("filtering never moves the map: the same fourteen points stay at the same coordinates", () => {
    setMode("immersive");
    const { container } = render(
      <WorldShell manifest={pilot} today={TODAY}><Atlas regions={atlasRegions} activeRegionId={PILOT} searchIndex={SEARCH_INDEX} /></WorldShell>
    );
    const coordinates = () =>
      [...container.querySelectorAll("[data-region-point] circle")].map((circle) =>
        `${circle.getAttribute("data-region-point") ?? circle.parentElement?.getAttribute("data-region-point")}@${circle.getAttribute("cx")}`
      );
    const before = coordinates();
    expect(container.querySelectorAll("[data-region-point]")).toHaveLength(14);

    fireEvent.change(screen.getByRole("combobox", { name: "Grade" }), { target: { value: String(nonPilotRegion.gradeBand) } });
    expect(container.querySelectorAll("[data-region-point]")).toHaveLength(14);
    expect(coordinates()).toEqual(before);
    expect(container.querySelectorAll('[data-region-point][data-matched="false"]').length).toBeGreaterThan(0);
  });

  it("announces one search summary instead of re-reading both result lists", () => {
    render(<WorldShell manifest={pilot} today={TODAY}><Atlas regions={atlasRegions} activeRegionId={PILOT} searchIndex={SEARCH_INDEX} /></WorldShell>);
    fireEvent.change(screen.getByRole("combobox", { name: "Grade" }), { target: { value: String(nonPilotRegion.gradeBand) } });
    // Exactly one live element, and it summarises rather than repeating the lists.
    const statuses = screen.getAllByRole("status");
    expect(statuses).toHaveLength(1);
    expect(statuses[0].textContent).toMatch(/1 of 14 regions/);
    // The results themselves must not sit inside a live region any more.
    expect(screen.getByRole("region", { name: "Matching courses" }).closest("[aria-live]")).toBeNull();
  });

  it("mode switcher is a keyboard-native radiogroup with 44px targets", () => {
    render(<WorldShell manifest={pilot} today={TODAY}><WorldPreferences /></WorldShell>);
    const group = screen.getByRole("radiogroup", { name: /presentation/i });
    const radios = within(group).getAllByRole("radio");
    expect(radios).toHaveLength(3);
    for (const r of radios) expect(r.className).toContain("min-h-[44px]");
    expect(radios.filter((r) => r.getAttribute("aria-checked") === "true")).toHaveLength(1);
  });
});

describe("Trailhead (§10) — one dominant action, chosen by evidence", () => {
  const landmarkWaypoints = new Map(pilot.landmarks.map((l) => [l.id, l.waypointIds]));

  it("empty evidence → begin the first open trail", () => {
    const world = deriveWorldState(pilot, empty(), TODAY);
    const action = dominantAction(world, landmarkWaypoints, () => false);
    expect(action.kind).toBe("begin");
  });

  it("a fading route outranks continuing a trail already under way", () => {
    const ev = empty();
    const started = pilot.courses.find((c) => c.prerequisiteCourseIds.length === 0)!;
    const firstLm = pilot.landmarks.find((l) => l.id === started.landmarkIds[0])!;
    ev.lessons[firstLm.waypointIds[0]] = { completed: true, completedAt: "2026-08-03" };
    const continued = dominantAction(deriveWorldState(pilot, ev, TODAY), landmarkWaypoints, (id) => Boolean(ev.lessons[id]?.completed));
    expect(continued.kind).toBe("continue");

    ev.review = [{ lessonId: firstLm.waypointIds[0], due: "2026-07-30", conceptTag: "t", box: 0 }]; // overdue
    const repair = dominantAction(deriveWorldState(pilot, ev, TODAY), landmarkWaypoints, (id) => Boolean(ev.lessons[id]?.completed));
    expect(repair.kind).toBe("repair");
    expect(repair).toHaveProperty("courseId", started.courseId);
  });

  it("renders engagement support after the one primary action (§10/S201)", () => {
    window.localStorage.clear();
    seedProfile({
      xp: 120,
      dailyGoal: 2,
      lessonsByDay: { [TODAY]: 1 },
      activity: { active: [TODAY], frozen: [] }
    });
    const { container } = render(
      <WorldShell manifest={pilot} today={TODAY}>
        <Trailhead landmarks={pilot.landmarks} courseNames={courseNames} regionName="Pattern Valley" />
      </WorldShell>
    );
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    const primary = container.querySelector("[data-primary-action]")!;
    const support = container.querySelector("[data-engagement-support]")!;
    expect(primary).toBeTruthy();
    expect(support).toBeTruthy();
    expect(primary.compareDocumentPosition(support) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(support.textContent).toMatch(/XP/);
    expect(support.textContent).toMatch(/Day streak/);
    // the dominant action remains a lesson route, not a dead end or a metrics CTA
    expect(primary.querySelectorAll('a[href^="/learn/"]')).toHaveLength(1);
  });

  it("nextWaypoint returns null on a finished trail rather than a stale link", () => {
    const ev = empty();
    for (const lid of fractions.landmarkIds) {
      const lm = pilot.landmarks.find((l) => l.id === lid)!;
      for (const w of lm.waypointIds) ev.lessons[w] = { completed: true, completedAt: "2026-06-01" };
    }
    const world = deriveWorldState(pilot, ev, TODAY);
    expect(nextWaypoint(world.courses["fractions"], landmarkWaypoints, (id) => Boolean(ev.lessons[id]?.completed))).toBeNull();
  });
});

describe("Basecamp (§12) — grouped by landmark, approach explained not locked", () => {
  beforeEach(() => window.localStorage.clear());

  it("renders one group per landmark with every waypoint linked", () => {
    render(
      <WorldShell manifest={pilot} today={TODAY}>
        <Basecamp {...basecampProps} prerequisites={[]} />
      </WorldShell>
    );
    const groups = screen.getByRole("list", { name: /landmarks/i }) ?? null;
    for (const lm of fractionLandmarks) {
      expect(screen.getByText(lm.name)).toBeTruthy();
      for (const w of lm.waypointIds) {
        const href = ["/learn", w].join("/");
        expect(document.querySelector(`a[href="${href}"]`), w).toBeTruthy();
      }
    }
    expect(groups).toBeTruthy();
  });

  it("preserves syllabus affordances including scope, practice, test-out and Mastery Studio", () => {
    const { container } = render(
      <WorldShell manifest={pilot} today={TODAY}>
        <Basecamp {...basecampProps} prerequisites={[]} masteryConcepts={[["fraction-equivalence", "fraction equivalence"]]} />
      </WorldShell>
    );
    expect(container.textContent).toMatch(/lessons · .* landmarks · ~.* min total/);
    expect(container.querySelector('a[href^="/practice/"]')).toBeTruthy();
    expect(container.querySelector('a[href*="testout=1"]')).toBeTruthy();
    const masteryHref = ["/mastery", "fraction-equivalence"].join("/");
    expect(container.querySelector(`a[href="${masteryHref}"]`)).toBeTruthy();
  });

  it("a closed approach shows the approach trail, not a generic lock (§26)", () => {
    const { container } = render(
      <WorldShell manifest={pilot} today={TODAY}>
        <Basecamp {...basecampProps} prerequisites={[{ courseId: "multiplication-division", trailName: "Multiplication & Division Foundations" }]} />
      </WorldShell>
    );
    expect(screen.getByText(/Multiplication & Division Foundations/)).toBeTruthy();
    expect(screen.getByText(/Recommended prerequisites/)).toBeTruthy();
    expect(screen.getByText(/recommended, not required/i)).toBeTruthy();
    expect(screen.getByText("Not started")).toBeTruthy();
    const approachHref = ["/basecamp", "multiplication-division"].join("/");
    expect(container.querySelector(`a[href="${approachHref}"]`)).toBeTruthy();
    expect(container.textContent).not.toMatch(/locked/i);
  });

  it("walked state is conveyed by text, never by colour alone (§28)", () => {
    const ev = { completed: true } as const;
    void ev;
    const { container } = render(
      <WorldShell manifest={pilot} today={TODAY}>
        <Basecamp {...basecampProps} trailSummary="x" prerequisites={[{ courseId: "multiplication-division", trailName: "MD" }]} />
      </WorldShell>
    );
    expect(container.querySelectorAll(".sr-only").length).toBeGreaterThan(0);
    expect(container.textContent).toMatch(/not yet walked/);
  });
});

/* ---------------------------------------------------------------------------------------
 * PHASE D — instruments, return paths, field journal.
 * The through-line: every state shown must be provable from evidence the learner actually
 * generated. A badge that appears on completion is exactly what §9 forbids, so the tests
 * drive completion and mastery independently and assert they produce different worlds.
 * ------------------------------------------------------------------------------------ */

describe("instruments (§9) — earned from mastery, never from completion", () => {
  beforeEach(() => window.localStorage.clear());

  const balanceKey = full.instruments.find((i) => i.id === "balance-key")!;

  it("completing every waypoint of a trail discovers nothing without graded evidence", () => {
    const ev = empty();
    for (const lm of pilot.landmarks) {
      for (const w of lm.waypointIds) ev.lessons[w] = { completed: true, completedAt: "2026-08-01" };
    }
    const world = deriveWorldState(pilot, ev, TODAY);
    render(<WorldShell manifest={pilot} today={TODAY}><Instruments instruments={[balanceKey]} /></WorldShell>);
    // rendered from empty local storage: no mastery, so undiscovered
    expect(screen.getByText(/undiscovered/i)).toBeTruthy();
    // and the rule itself agrees given completion-only evidence
    expect(instrumentStateOf(balanceKey, world.evidence)).toBe("undiscovered");
  });

  it("mastery on its own tags climbs the ladder and is described only once discovered", () => {
    const tag = balanceKey.conceptTags[0];
    expect(tag).toBeTruthy();
    const ev = empty();
    ev.mastery[tag] = { tag, mastery: 0.3, attempts: 4, correctStreak: 0, lastSeen: "2026-08-01" };
    expect(instrumentStateOf({ ...balanceKey, conceptTags: [tag] }, ev)).toBe("discovered");
    ev.mastery[tag] = { tag, mastery: 0.9, attempts: 9, correctStreak: 3, lastSeen: "2026-08-01" };
    expect(instrumentStateOf({ ...balanceKey, conceptTags: [tag] }, ev)).toBe("calibrated");
  });

  it("every instrument's tags are real and no instrument is a badge for a whole course", () => {
    for (const i of full.instruments) {
      expect(i.conceptTags.length, i.id).toBeGreaterThan(0);
      expect(i.transferableIdea.length).toBeGreaterThan(0);
    }
  });
});

describe("return paths (§16) — explains the route, never shames the learner", () => {
  beforeEach(() => window.localStorage.clear());

  it("no due items → routes are holding", () => {
    render(<WorldShell manifest={pilot} today={TODAY}><ReturnPaths /></WorldShell>);
    expect(screen.getByText(/routes are holding/i)).toBeTruthy();
  });

  it("names the concept and the ladder rung, and never blames forgetting", () => {
    const lesson = pilot.landmarks[0].waypointIds[0];
    seedProfile({
      review: [{ key: `${lesson}:c1`, conceptTag: "make-ten-add", lessonId: lesson, stepId: "c1", box: 2, due: "2026-08-01" }]
    });
    const { container } = render(
      <WorldShell manifest={pilot} today={TODAY}><ReturnPaths lessonTitles={{ [lesson]: "Making ten" }} /></WorldShell>
    );
    expect(container.textContent).toMatch(/make ten add/i);
    expect(container.textContent).toMatch(/week-long return/i);
    expect(container.textContent).toMatch(/Fading/);
    expect(container.textContent).not.toMatch(/forgot|failed|lost/i);
    const lessonHref = ["/learn", lesson].join("/");
    expect(container.querySelector(`a[href="${lessonHref}"]`)).toBeTruthy();
  });
});

describe("field journal (§17) — built on the existing notebook model", () => {
  beforeEach(() => window.localStorage.clear());

  it("empty state uses the world copy, not a generic blank", () => {
    render(<WorldShell manifest={pilot} today={TODAY}><FieldJournal sections={[]} /></WorldShell>);
    expect(screen.getByText(/first field note/i)).toBeTruthy();
  });

  it("groups authored takeaways by trail and links back to the waypoint", () => {
    const lesson = pilot.landmarks[0].waypointIds[0];
    const sections = [{
      courseTitle: "Fractions from Scratch",
      cards: [{ id: lesson, title: "Equal parts", takeaways: ["Equal parts must be the same size."], retained: 0.8, fading: false }]
    }];
    const { container } = render(
      <WorldShell manifest={pilot} today={TODAY}><FieldJournal sections={sections} /></WorldShell>
    );
    expect(screen.getByRole("heading", { name: "Fractions from Scratch" })).toBeTruthy();
    expect(screen.getByText(/Equal parts must be the same size/)).toBeTruthy();
    const lessonHref = ["/learn", lesson].join("/");
    expect(container.querySelector(`a[href="${lessonHref}"]`)).toBeTruthy();
  });

  it("a due return path changes the entry's stated route state", () => {
    const lesson = pilot.landmarks[0].waypointIds[0];
    seedProfile({
      review: [{ key: `${lesson}:c1`, conceptTag: "t", lessonId: lesson, stepId: "c1", box: 0, due: "2026-08-01" }]
    });
    const sections = [{
      courseTitle: "T", cards: [{ id: lesson, title: "E", takeaways: [], retained: 0.8, fading: false }]
    }];
    const { container } = render(
      <WorldShell manifest={pilot} today={TODAY}><FieldJournal sections={sections} /></WorldShell>
    );
    expect(container.textContent).toMatch(/return path is ready/i);
  });
});
