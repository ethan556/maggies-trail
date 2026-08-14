// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { WidgetRenderer } from "./widgets";
import { MAX_PLOT_POINT_DIM, WidgetSpec, type TWidget } from "@/lib/schema";

/**
 * S241 / PG-03 · PG-08 — THE COORDINATE GRID HAS ONE SOURCE OF TRUTH FOR CELL SIZE (D-04).
 *
 * WHAT WAS BROKEN. plotPoint drew its three layers from three different numbers:
 *   · the cells   — `minmax(0,1fr)` tracks under FIXED 44px (`h-11 w-11`) buttons;
 *   · the x band  — a fixed `repeat(cols, 2.75rem)` row that could not shrink;
 *   · the overlay — a hardcoded `const CELL = 48` pitch.
 * They agree only while the stage is wide enough for 44px cells. At `cols: 8` on the ~334px
 * stage of a 390px phone (17 authored specs, plus every generated bvScatterPlot grid) the
 * tracks fell to ~35px while the buttons did not: adjacent TAP TARGETS OVERLAPPED BY ~9px on
 * the one engine whose entire task is "tap the right cell", the 476px label row drifted off
 * its columns, and the connectTargets "line through the points" missed the cells it was drawn
 * through. Three independent lies about the same geometry.
 *
 * WHAT IS PINNED HERE. Not "it looks better" — the four structural properties that make the
 * three layers UNABLE to disagree again, each asserted on the corpus rather than a fixture:
 *   · ONE declaration of grid tracks per widget, shrink-to-fit and capped at the 44px tap
 *     ceiling (`minmax(0, 2.75rem)`), so the cap is a ceiling and never also a floor;
 *   · the cell button IS its track (`w-full aspect-square min-w-0`) with the separation as
 *     padding INSIDE it and no grid gutter — so tap pitch == tap target, at any width;
 *   · every cell and every axis label is placed on the track its coordinate names, so the
 *     bands cannot drift off the columns and rows they label;
 *   · the overlay draws in CELL UNITS (`viewBox="0 0 cols rows"`), so its vertices are the
 *     rendered cell centres whatever a cell currently measures — no pitch constant survives.
 *
 * THE 390px TRADEOFF THIS FILE RECORDS. 8 × 44px = 352px of cells alone against a ~334px
 * stage: a 44px pitch at 8 columns is arithmetically impossible, so the choice is WHICH
 * property to break. This layout breaks CELL SIZE (~39px at cols 8, 44px at ≤ 7 columns and on
 * any wider stage) and keeps NON-OVERLAP and full-pitch targets. The old layout broke
 * non-overlap while keeping a nominal 44px whose outer 9px belonged to the neighbouring cell —
 * a target the learner cannot hit reliably is not a 44px target. `the 390px stage` below
 * asserts both halves: the new geometry never overlaps, and the old geometry did.
 */

afterEach(cleanup);

type Case = { widget: Extract<TWidget, { type: "plotPoint" }>; where: string };

function authoredPlotPoints(): Case[] {
  const out: Case[] = [];
  const courses = join(process.cwd(), "content", "courses");
  for (const course of readdirSync(courses)) {
    const dir = join(courses, course, "lessons");
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".json")) continue;
      const lesson = JSON.parse(readFileSync(join(dir, f), "utf8")) as {
        id: string;
        steps?: Array<{ id: string; widget?: Record<string, unknown> }>;
        remedials?: Array<{ check?: { id: string; widget?: Record<string, unknown> }; concept?: { id: string; widget?: Record<string, unknown> } }>;
      };
      const all = [
        ...(lesson.steps ?? []),
        ...(lesson.remedials ?? []).flatMap((r) => [r.check, r.concept]).filter((s): s is NonNullable<typeof s> => Boolean(s))
      ];
      for (const s of all) {
        if (s.widget?.type !== "plotPoint") continue;
        out.push({ widget: s.widget as Case["widget"], where: `${lesson.id}/${s.id}` });
      }
    }
  }
  return out;
}

/** The corner case the schema still allows: a full 8 × 8 lattice whose targets are connected. */
const WORST: Case = {
  where: "synthetic/8x8-connected",
  widget: WidgetSpec.parse({
    type: "plotPoint",
    prompt: "Plot the pattern.",
    cols: MAX_PLOT_POINT_DIM,
    rows: MAX_PLOT_POINT_DIM,
    xLabels: ["1", "2", "3", "4", "5", "6", "7", "8"],
    yLabels: ["1", "2", "3", "4", "5", "6", "7", "8"],
    targets: [{ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 }, { x: 8, y: 8 }],
    connectTargets: true,
    missFeedback: "Not those cells yet.",
    successFeedback: "That is the pattern."
  }) as Case["widget"]
};

const AUTHORED = authoredPlotPoints();
const ALL = [...AUTHORED, WORST];

function mount(c: Case, value: unknown = null) {
  return render(<WidgetRenderer spec={WidgetSpec.parse(c.widget) as TWidget} value={value} onChange={() => {}} disabled={false} />).container;
}

/** Every element in the widget that declares grid tracks. The rule is that there is exactly one. */
function trackDeclarations(container: Element): string[] {
  return Array.from(container.querySelectorAll<HTMLElement>("[style]"))
    .map((el) => el.style.gridTemplateColumns)
    .filter((v) => v !== "");
}

function grid(container: Element): HTMLElement {
  const el = Array.from(container.querySelectorAll<HTMLElement>("[style]")).find((n) => n.style.gridTemplateColumns !== "");
  if (!el) throw new Error("no grid track declaration");
  return el;
}

const cells = (container: Element) => Array.from(container.querySelectorAll<HTMLElement>("button"));
const bands = (container: Element) => Array.from(container.querySelectorAll<HTMLElement>('div[aria-hidden="true"]'));
const spans = (band: Element) => Array.from(band.querySelectorAll<HTMLElement>(":scope > span"));

/**
 * The CSS track algorithm for `repeat(cols, minmax(0, 2.75rem))`, in one line: each track's base
 * size is 0 and its growth limit 44px, so free space is shared equally and every track freezes at
 * its share or at the 44px ceiling, whichever comes first. This is the model the layout is
 * asserted against below; the declaration it mirrors is pinned by "one element declares tracks".
 */
const TAP_CEILING = 44;
const trackPx = (stage: number, cols: number, labelCol: number) => Math.min(TAP_CEILING, (stage - labelCol) / cols);

/** A 390px phone: the lesson stage measures ~334px inside the shell's padding (D-03/D-04). */
const STAGE_390 = 334;
/** The y-label column at a 1–2 character numeric scale, plus its `pr-1`. */
const Y_LABEL_COL = 18;

describe("S241 D-04 — the plotPoint corpus is reached in the shape the defect names", () => {
  it("finds the authored grids, including the 8-column and connectTargets ones", () => {
    expect(AUTHORED.length, "authored plotPoint specs").toBeGreaterThan(50);
    expect(AUTHORED.filter((c) => c.widget.cols === 8).length, "8-column specs (D-04 names 17)").toBeGreaterThanOrEqual(10);
    expect(AUTHORED.some((c) => c.widget.connectTargets === true), "no connectTargets grid reached").toBe(true);
    expect(AUTHORED.some((c) => c.where.includes("rem-")), "no remedial grid reached").toBe(true);
  });
});

describe("S241 D-04 (rule E6) — one source of truth for cell size", () => {
  it("exactly one element declares grid tracks, shrink-to-fit under the 44px tap ceiling", () => {
    // The defect was three declarations. A second track list anywhere in this widget — a label
    // row of its own, a nested cell grid — is the defect coming back, whatever its values.
    const bad: string[] = [];
    for (const c of ALL) {
      const container = mount(c);
      const decls = trackDeclarations(container);
      if (decls.length !== 1) bad.push(`${c.where}: ${decls.length} track declarations — ${decls.join(" ‖ ")}`);
      const want = `${c.widget.yLabels ? "auto " : ""}repeat(${c.widget.cols}, minmax(0, 2.75rem))`;
      if (decls[0] !== want) bad.push(`${c.where}: tracks are "${decls[0]}", expected "${want}"`);
      cleanup();
    }
    expect(bad).toEqual([]);
  }, 120_000);

  it("the cell button IS its track: no fixed cell size, no gutter, separation inside the button", () => {
    // `h-11 w-11` under a shrinking track is precisely how the buttons came to overlap: fixed
    // content in a flexible box overflows it. The button now fills its track (`w-full`,
    // `aspect-square`, `min-w-0`) and holds the 4px separation as its own padding, so the
    // tappable box equals the pitch and two neighbours cannot share a pixel.
    const bad: string[] = [];
    for (const c of ALL) {
      const container = mount(c);
      const g = grid(container);
      if (/\bgap-\d/.test(g.className)) bad.push(`${c.where}: the cell grid has a gutter (${g.className})`);
      for (const b of cells(container)) {
        const cls = b.className;
        if (/\b[wh]-11\b/.test(cls)) bad.push(`${c.where}: a cell carries a fixed size (${cls})`);
        for (const need of ["w-full", "aspect-square", "min-w-0", "p-0.5"])
          if (!cls.split(/\s+/).includes(need)) bad.push(`${c.where}: a cell is missing "${need}" (${cls})`);
      }
      cleanup();
    }
    expect(bad).toEqual([]);
  }, 120_000);
});

describe("S241 D-04 (rules E6/C9) — every layer rides the tracks it names", () => {
  it("each cell sits in the column and row its coordinate names", () => {
    const bad: string[] = [];
    for (const c of ALL) {
      const { cols, rows, yLabels } = c.widget;
      const first = yLabels ? 2 : 1;
      const container = mount(c);
      const list = cells(container);
      list.forEach((b, i) => {
        const y = rows - Math.floor(i / cols); // DOM order is top row → bottom row
        const x = (i % cols) + 1;
        const wantCol = String(first + x - 1);
        const wantRow = String(rows - y + 1);
        if (b.style.gridColumn !== wantCol || b.style.gridRow !== wantRow)
          bad.push(`${c.where}: cell (${x}, ${y}) at column ${b.style.gridColumn} row ${b.style.gridRow}, expected ${wantCol}/${wantRow}`);
      });
      cleanup();
    }
    expect(bad).toEqual([]);
  }, 120_000);

  it("the x band shares the cells' columns and the y band shares their rows", () => {
    // The drift the defect describes, stated as an equality: a label's track IS the track of the
    // cells it names. It cannot be off by a fraction of a cell at one width and right at another,
    // because it is not computed from a width at all.
    const bad: string[] = [];
    let checked = 0;
    for (const c of ALL) {
      const { cols, rows, xLabels, yLabels } = c.widget;
      if (!xLabels || !yLabels) continue;
      checked++;
      const container = mount(c);
      const list = cells(container);
      const [yBand, xBand] = bands(container);
      spans(yBand).forEach((s, i) => {
        // The y band prints top → bottom, so band row i is grid row i + 1.
        const rowCells = list.filter((b) => b.style.gridRow === String(i + 1));
        if (rowCells.length !== cols) bad.push(`${c.where}: row ${i + 1} has ${rowCells.length} cells`);
        if (s.style.gridRow !== String(i + 1)) bad.push(`${c.where}: y label "${s.textContent}" in row ${s.style.gridRow}, cells in row ${i + 1}`);
        if (s.style.gridColumn !== "1") bad.push(`${c.where}: y label "${s.textContent}" is not in the label column`);
      });
      spans(xBand).forEach((s, i) => {
        const colCells = list.filter((b) => b.style.gridColumn === String(2 + i));
        if (colCells.length !== rows) bad.push(`${c.where}: column ${2 + i} has ${colCells.length} cells`);
        if (s.style.gridColumn !== String(2 + i)) bad.push(`${c.where}: x label "${s.textContent}" in column ${s.style.gridColumn}, cells in ${2 + i}`);
        if (s.style.gridRow !== String(rows + 1)) bad.push(`${c.where}: x label "${s.textContent}" is not on the row below the cells`);
      });
      cleanup();
    }
    expect(bad).toEqual([]);
    expect(checked, "no labelled grid reached — the rule would be vacuous").toBeGreaterThan(50);
  }, 120_000);

  it("the origin marker sits where the two bands meet, and takes no cell track", () => {
    const bad: string[] = [];
    let checked = 0;
    for (const c of ALL) {
      const container = mount(c);
      const origin = container.querySelector<HTMLElement>("[data-testid='pp-origin']");
      if (origin) {
        checked++;
        if (origin.style.gridColumn !== "1" || origin.style.gridRow !== String(c.widget.rows + 1))
          bad.push(`${c.where}: origin at ${origin.style.gridColumn}/${origin.style.gridRow}, expected 1/${c.widget.rows + 1}`);
        if (cells(container).some((b) => b.style.gridColumn === "1")) bad.push(`${c.where}: a cell is in the label column`);
      }
      cleanup();
    }
    expect(bad).toEqual([]);
    expect(checked, "no origin-marking grid reached").toBeGreaterThan(20);
  }, 120_000);
});

describe("S241 D-04 (rule E6) — the connect overlay tracks the real cell size", () => {
  const connected = ALL.filter((c) => c.widget.connectTargets === true);

  it("draws in cell units, so one unit is one track whatever a track measures", () => {
    expect(connected.length, "no connectTargets grid reached").toBeGreaterThan(0);
    const bad: string[] = [];
    for (const c of connected) {
      const container = mount(c, c.widget.targets.map((t) => ({ x: t.x, y: t.y })));
      const svg = container.querySelector("svg");
      if (!svg) {
        bad.push(`${c.where}: the line never drew`);
        cleanup();
        continue;
      }
      if (svg.getAttribute("viewBox") !== `0 0 ${c.widget.cols} ${c.widget.rows}`)
        bad.push(`${c.where}: viewBox "${svg.getAttribute("viewBox")}" is not the cell lattice`);
      // A pixel pitch anywhere in the overlay is the D-04 defect: it can only be right at one
      // cell size, and 48 was right at none of the sizes a 390px stage produces.
      if (svg.getAttribute("width") || svg.getAttribute("height"))
        bad.push(`${c.where}: the overlay states a pixel size (${svg.getAttribute("width")} × ${svg.getAttribute("height")})`);
      const el = svg as unknown as HTMLElement;
      if (el.style.gridColumn !== `${c.widget.yLabels ? 2 : 1} / span ${c.widget.cols}` || el.style.gridRow !== `1 / span ${c.widget.rows}`)
        bad.push(`${c.where}: the overlay does not span the cell block (${el.style.gridColumn} / ${el.style.gridRow})`);
      cleanup();
    }
    expect(bad).toEqual([]);
  });

  it("every vertex lands on the centre of the cell it is drawn through", () => {
    // The defect's own words: "the drawn line through the points no longer passes through the
    // rendered cells". Cell (x, y) occupies track x horizontally and track rows−y+1 vertically,
    // so its centre is (x − 0.5, rows − y + 0.5) in cell units — the cell's own coordinates, not
    // a pitch multiple. This equality holds at every viewport width because no width appears.
    const bad: string[] = [];
    for (const c of connected) {
      const container = mount(c, c.widget.targets.map((t) => ({ x: t.x, y: t.y })));
      const points = container.querySelector("polyline")?.getAttribute("points") ?? "";
      const want = c.widget.targets.map((t) => `${t.x - 0.5},${c.widget.rows - t.y + 0.5}`).join(" ");
      if (points !== want) bad.push(`${c.where}: points "${points}", cell centres "${want}"`);
      // Paired acceptance: the vertices are INSIDE the lattice, one per target, in target order.
      for (const p of points.split(" ")) {
        const [px, py] = p.split(",").map(Number);
        if (!(px > 0 && px < c.widget.cols && py > 0 && py < c.widget.rows)) bad.push(`${c.where}: vertex ${p} is outside the grid`);
      }
      cleanup();
    }
    expect(bad).toEqual([]);
  });

  it("stays absent until the points actually line up", () => {
    // The overlay is the reward for a correct plot; a line drawn over a wrong or partial
    // selection would be the answer shown for free.
    for (const c of connected.slice(0, 4)) {
      const partial = c.widget.targets.slice(0, Math.max(1, c.widget.targets.length - 1)).map((t) => ({ x: t.x, y: t.y }));
      const container = mount(c, partial);
      expect(container.querySelector("polyline"), `${c.where}: the line drew on a partial plot`).toBeNull();
      cleanup();
    }
  });
});

describe("S241 D-04 (rule E5) — the 390px stage: cells shrink, targets never overlap", () => {
  it("at 390px the pitch is the whole target, so no two cells share a pixel", () => {
    // The layout property, computed on the model the CSS declares. Cell i occupies
    // [labelCol + i·pitch, labelCol + (i+1)·pitch): consecutive boxes touch and never overlap,
    // BECAUSE the button is `w-full` in a track that cannot exceed its share. The old geometry
    // is computed alongside: a fixed 44px box on a 35px pitch overlapped its neighbour by 9px.
    const worst = 8;
    const pitch = trackPx(STAGE_390, worst, Y_LABEL_COL);
    expect(pitch, "eight columns must still fit the stage").toBeLessThanOrEqual(TAP_CEILING);
    expect(pitch * worst + Y_LABEL_COL, "the grid overflows the 390px stage").toBeLessThanOrEqual(STAGE_390);
    for (let i = 0; i + 1 < worst; i++) {
      const right = Y_LABEL_COL + i * pitch + pitch; // the tap box IS the track
      const nextLeft = Y_LABEL_COL + (i + 1) * pitch;
      expect(right, `cell ${i} overlaps cell ${i + 1}`).toBeLessThanOrEqual(nextLeft);
    }
    // The tradeoff, asserted rather than described: below the 44px guideline, above the size at
    // which a fingertip cannot resolve a cell — and unambiguous, which the 44px version was not.
    expect(pitch).toBeGreaterThanOrEqual(36);
    expect(pitch).toBeLessThan(TAP_CEILING);
    // And the defect it replaces: fixed 44px content on that same pitch overlapped by ~9px.
    expect(TAP_CEILING - pitch, "the old fixed-width overlap this layout removes").toBeGreaterThan(4);
  });

  it("reaches the full 44px wherever the stage can pay for it", () => {
    // Paired acceptance: the cap is a ceiling, not a fixed size. Fewer columns on a phone, and
    // any wider stage, still get the full tap target — the shrink is bought only where the
    // arithmetic demands it.
    expect(trackPx(STAGE_390, 7, Y_LABEL_COL)).toBe(TAP_CEILING);
    expect(trackPx(STAGE_390, 4, Y_LABEL_COL)).toBe(TAP_CEILING);
    expect(trackPx(720, 8, Y_LABEL_COL)).toBe(TAP_CEILING);
    // …and never grows past it, however wide the stage.
    expect(trackPx(1440, 8, Y_LABEL_COL)).toBe(TAP_CEILING);
  });
});
