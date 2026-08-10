/**
 * Engine capability table — the engine-owned half of the flagship tier audit
 * (scripts/flagship-tier.mjs). Two contracts:
 *
 * TOTALITY — every widget type in the registry has a capability row with every
 * dimension in 0–3, and no row names a type that doesn't exist. A new engine
 * cannot ship without rating itself.
 *
 * CONSISTENCY — two mechanical cross-checks against the real source, so the
 * table cannot drift into flattery: (1) every component that wires onEvent must
 * carry adapt=3 and no component without it may; (2) every engine rated err=3
 * must itself carry EITHER a reveal-ghost testid OR live-cue membership in
 * `MULTI_CONTROL` (`src/lib/processEvents.ts`) — the rubric's two named earning
 * mechanisms (`docs/CAPABILITY_AXES.md` §err) — checked PER ENGINE, not by an
 * aggregate count (FABLE-QA S215, F6: the old aggregate `ghostCount >= rated3`
 * could not name a single row). A first per-engine pass named 12 of 116 engines
 * with no ghost in their own component; individual adjudication then found 3 were
 * false positives of that pass's own hyphen-blind regex, 8 held err=3 through the
 * MULTI_CONTROL mechanism the pass didn't check yet, and 1 (`covariationScrubber`)
 * was a genuine wrong row, now corrected — the named debt list this file keeps
 * (`ERR3_NO_OWN_GHOST_DEBT`, empty as of this retirement) is where any future
 * finding of this shape lands next, one engine at a time, not in bulk. Both
 * checks scan `widgets.tsx` PLUS `src/components/widgets/*.tsx` (FABLE-QA S215,
 * F7): a widget's component can now live outside the monolith, and scanning the
 * monolith alone made the first engine to move out (`numberLineRay`) structurally
 * invisible to both.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { STAGE_TIER } from "@/components/stageWidth";
import { MULTI_CONTROL } from "@/lib/processEvents";

type Row = {
  manip: number;
  conseq: number;
  err: number;
  adapt: number;
  a11y: number;
  mobile: number;
  polish: number;
};

const table = JSON.parse(
  readFileSync(join(process.cwd(), "scripts", "engine-capabilities.json"), "utf8")
) as { types: Record<string, Row> };

const registry = Object.keys(STAGE_TIER);

/** Every file a widget component can be declared in: the monolith, plus every module under
 * `src/components/widgets/` (S215 added the first one, `numberLineRay.tsx`; the standing mandate
 * prefers more engines take this shape, not fewer, so this list must keep growing on its own). */
function widgetSourceFiles(): { file: string; monolith: boolean }[] {
  const root = join(process.cwd(), "src", "components");
  const out: { file: string; monolith: boolean }[] = [{ file: join(root, "widgets.tsx"), monolith: true }];
  const widgetsDir = join(root, "widgets");
  for (const name of readdirSync(widgetsDir)) {
    if (name.endsWith(".tsx")) out.push({ file: join(widgetsDir, name), monolith: false });
  }
  return out;
}

/** The one naming rule every widget component obeys without exception, independent of how its
 * props type is spelled. */
const componentNameFor = (type: string): string => type[0].toUpperCase() + type.slice(1) + "W";

/**
 * Every widget component instance, paired with its own type and source body — the unit both
 * mechanical contracts below check.
 *
 * IN THE MONOLITH, many different widgets' functions sit side by side (and a few types, like
 * `dilationExplore`, render through more than one differently-named function), so a component is
 * found by its `WProps<T...>` signature and its body is bounded to the next top-level `function` —
 * the original, load-bearing mechanism, untouched here.
 *
 * OUTSIDE THE MONOLITH, a module is — by the convention this repo has adopted for such modules
 * (`numberLineRay.tsx`'s own header: "this engine ships as its own file") — dedicated to exactly
 * one engine, so the whole file IS that component's body; no boundary-finding is needed. Nor is any
 * assumption made about how its props type is spelled: `numberLineRay.tsx` restates an equivalent
 * LOCAL `NumberLineRayProps` interface rather than writing `WProps<T...>` verbatim, precisely to
 * avoid an import edge back into the monolith — so the file is matched to a registered type by its
 * component's NAME (`componentNameFor`), not by its signature text.
 */
function componentEntries(): { type: string; body: string }[] {
  const out: { type: string; body: string }[] = [];
  for (const { file, monolith } of widgetSourceFiles()) {
    const src = readFileSync(file, "utf8");
    if (!monolith) {
      const owner = registry.find((type) => new RegExp(`function ${componentNameFor(type)}\\(`).test(src));
      if (owner) out.push({ type: owner, body: src });
      continue;
    }
    for (const m of src.matchAll(/function (\w+)W\(\{[^}]*\}\s*:\s*WProps<T(\w+)>\)/g)) {
      const name = m[1];
      const type = m[2][0].toLowerCase() + m[2].slice(1);
      const start = src.indexOf(`function ${name}W(`);
      const next = src.indexOf("\nfunction ", start + 10);
      out.push({ type, body: src.slice(start, next > 0 ? next : undefined) });
    }
  }
  return out;
}

/**
 * NAMED, NON-GROWING DEBT — engines rated `err=3` whose own component this contract could not
 * mechanically verify carries the mechanism that score is defined to mean.
 *
 * RETIRED TO EMPTY (S215, 2026-08-09). The twelve entries first recorded here turned out, on
 * individual per-engine adjudication (Fable, same session), to split three ways — and eleven of
 * the twelve were never a wrong row at all:
 *
 *   · THREE were false positives of THIS CONTRACT's `GHOST_RE`, not of the engines it named.
 *     `trialProbabilityLab` (`tpl-reveal-ghost`), `distributionCompareLab` (`dcl-reveal-ghost`),
 *     and `graphStoryLab` (`graph-story-ghost`) all carry a real reveal-ghost testid, in their own
 *     component, in the house dashed-tangerine grammar — but that grammar is MULTI-SEGMENT
 *     (`<prefix>-reveal-ghost`, `<name>-story-ghost`), and the regex that shipped with this
 *     contract, `/(?:data-testid|testid)="[a-z]+-ghost"/`, only matched a single unhyphenated
 *     segment before "-ghost". Fixed below to `[a-z][a-z-]*-ghost`.
 *
 *     IRONY, RECORDED ON PURPOSE: the same session that fixed a WHITESPACE-blind `adapt=3` regex
 *     shipped a HYPHEN-blind `err=3` regex right next to it — and two independently-run counts
 *     (this file's own aggregate-turned-per-engine check, and FABLE-QA's manual S215 read) agreed
 *     on "12," not because the twelve were independently confirmed, but because both instruments
 *     shared the same single-segment assumption about testid shape. Matching counts from two
 *     instruments are not, by themselves, evidence the counting method is right — only that
 *     neither method caught the OTHER's blindness. Independent confirmation is not independent
 *     when the instruments share the defect.
 *
 *   · EIGHT hold `err=3` through the rubric's SECOND earning mechanism, which this contract never
 *     checked before now. `docs/CAPABILITY_AXES.md` §err names two mechanisms and says so
 *     explicitly: the pinned test's own comment "names only the first… [the second — live
 *     per-move direction cues from `src/lib/processEvents.ts`, `MULTI_CONTROL` engines] — is real
 *     but never folded into that sentence." `triangleAngleLab`, `verticalLineScanner`,
 *     `samplingBiasLab`, `shapeFamilyBuilder`, `unitRuler`, `triangleConstraintLab`,
 *     `coordinateProofLab`, and `solidSliceLab` are all members of the real `MULTI_CONTROL` set
 *     (imported below, not copied — a copied list is a second truth source that can silently
 *     drift from the one `processEvents.ts` actually drives at runtime).
 *
 *   · ONE was a genuine wrong row: `covariationScrubber` — no ghost, not in `MULTI_CONTROL`, only
 *     authored low/high strings, mechanism parity with `numeric` (which holds `err=1`). The
 *     registry has been corrected (`err` 3→1). This is the only one of the twelve where the fix
 *     was to the score rather than to this contract's own blindness.
 *
 * See the mechanism-2 check below for what `MULTI_CONTROL` membership does and does not mean —
 * the rubric's own "weakest form of this level" caveat still applies to it.
 *
 * WHY THIS STAYS, EMPTY, RATHER THAN BEING DELETED: retiring every current entry does not retire
 * the CONCEPT. A future engine can still ship at `err=3` on evidence this contract cannot
 * mechanically see — a third mechanism, or a testid/cue shape this pass still doesn't parse — and
 * it deserves the same non-bulk, per-engine, dated adjudication these twelve just received, not a
 * reflex re-add of an aggregate that can't name a row. Both directions below stay load-bearing on
 * an empty list: "cannot grow" still catches a 13th engine the moment one ships without either
 * mechanism and without a dated entry here; "cannot shrink silently" still fires — vacuously
 * today, for real the moment a first new entry is ever added — the instant an entry here stops
 * reproducing, so retirement (now, or next time) is never silent.
 *
 * Do not add a name here to make an inconvenient failure go away. An addition without the
 * corresponding investigation is exactly the defect this contract exists to prevent.
 */
const ERR3_NO_OWN_GHOST_DEBT: readonly { type: string; recorded: string; note: string }[] = [];

describe("engine capability table", () => {
  it("is total over the widget registry, with every dimension in 0–3", () => {
    const missing = registry.filter((t) => !(t in table.types));
    expect(missing).toEqual([]);
    const phantom = Object.keys(table.types).filter((t) => !registry.includes(t));
    expect(phantom).toEqual([]);
    for (const [t, row] of Object.entries(table.types)) {
      for (const [dim, v] of Object.entries(row)) {
        if (dim.endsWith("Note")) {
          expect(typeof v === "string" && String(v).length > 0, `${t}.${dim} must be a non-empty string`).toBe(true);
          continue;
        }
        if (dim === "manipByAnswerMode") continue; // shape and floor asserted in its own test below
        expect(Number.isInteger(v) && v >= 0 && v <= 3, `${t}.${dim}=${v}`).toBe(true);
      }
    }
  });

  /* S205K introduced PER-ANSWER-MODE manip ratings, because a manipulation surface can be real for
   * one answerMode and absent for another — claiming it type-wide would be the slider/balanceScale
   * drift again. The design's safety rests on ONE invariant: the type-level `manip` is the FLOOR,
   * at or below every mode value. Only three readers (step-mix, flagship-tier,
   * insertion-candidates) consult the mode map; the ~50 other readers of this table see the
   * type-level number alone, so the floor is what guarantees they UNDER-count rather than
   * over-count. Break the floor and every unaware reader silently over-claims capability. */
  it("per-mode manip ratings are well-formed, and the type-level rating is their floor", () => {
    const MODES = ["numeric", "choice", "relation", "explore"];
    let checked = 0;
    for (const [t, row] of Object.entries(table.types)) {
      const byMode = (row as Record<string, unknown>).manipByAnswerMode;
      if (byMode === undefined) continue;
      checked++;
      expect(typeof byMode === "object" && byMode !== null, `${t}.manipByAnswerMode must be an object`).toBe(true);
      const entries = Object.entries(byMode as Record<string, unknown>);
      expect(entries.length, `${t} declares no modes`).toBeGreaterThan(0);
      for (const [mode, v] of entries) {
        expect(MODES.includes(mode), `${t}.manipByAnswerMode has unknown mode "${mode}"`).toBe(true);
        expect(Number.isInteger(v) && (v as number) >= 0 && (v as number) <= 3, `${t}.${mode}=${v}`).toBe(true);
      }
      const floor = (row as Record<string, number>).manip;
      const min = Math.min(...entries.map(([, v]) => v as number));
      expect(floor <= min, `${t}.manip=${floor} must be <= min per-mode rating ${min} (the floor keeps mode-unaware readers under-counting)`).toBe(true);
      // A mode map that says nothing beyond the floor is noise; require it to earn its place.
      expect(Math.max(...entries.map(([, v]) => v as number)) > floor, `${t}.manipByAnswerMode adds nothing above the floor`).toBe(true);
      // Any type making a per-mode claim must explain it, since the claim is invisible to most readers.
      expect(typeof (row as Record<string, unknown>).manipByAnswerModeNote, `${t} needs a manipByAnswerModeNote`).toBe("string");
    }
    expect(checked, "no type declares per-mode manip — delete this test if that is intentional").toBeGreaterThan(0);
  });

  /* S205M — the placement ceiling, pinned because the metric makes breaking it tempting.
   *
   * This codebase rates ARRANGEMENT interactions — put tokens in an order, drag items into
   * buckets, pair things up — at manip 1, and reserves manip >= 2 for manipulating a mathematical
   * MODEL whose dependent quantities move in response (a beam that tips, a curve whose derivative
   * redraws, a candidate sliding against derived landmarks). dragBucket is the proof the line is
   * real: it already HAS full drag-and-place and is still rated 1, because dragging a label into a
   * box is not manipulating a model.
   *
   * buildExpression carries 144 HS steps, so "add reordering and call it manip 2" is worth ~4
   * points of the rich-mix metric in an afternoon. It would also make dragBucket's 1 and
   * buildExpression's 2 describe the same class of interaction, which is how a capability table
   * stops meaning anything. If a future session genuinely gives one of these engines a model to
   * manipulate, this test should be updated DELIBERATELY, with the evidence — not deleted because
   * it went red. */
  it("arrangement engines stay at manip 1 — placement is not model manipulation", () => {
    for (const t of ["dragBucket", "buildExpression", "matchPairs", "dragOrder"]) {
      const row = table.types[t] as Record<string, number> | undefined;
      if (!row) continue;
      expect(row.manip, `${t} is an arrangement engine; manip >= 2 needs a manipulable MODEL, not a better placement gesture`).toBeLessThanOrEqual(1);
    }
  });

  it("adapt=3 exactly matches the components that wire onEvent", () => {
    // Whitespace-tolerant around the `}: WProps<T...>` boundary — a component whose destructured
    // props are packed with no space before the type annotation (e.g. `}:WProps<TExactNumberLab>`)
    // is exactly as real a component as one written `}: WProps<...>`, and used to be mechanically
    // invisible to this check because the regex hardcoded a single literal space.
    //
    // Each component INSTANCE is checked independently against its type's row (not grouped), so a
    // multi-variant type (e.g. `dilationExplore`'s three renderers) cannot hide one disagreeing
    // sub-component behind another that agrees.
    for (const { type, body } of componentEntries()) {
      if (!(type in table.types)) continue;
      const wired = body.includes("onEvent");
      const rated = table.types[type].adapt === 3;
      expect(rated, `${type}: onEvent wired=${wired} but adapt=${table.types[type].adapt}`).toBe(wired);
    }
  });

  /* FABLE-QA S215, F6: the previous version of this test compared an AGGREGATE ghost-site count
   * against an aggregate rated-3 count (`ghostCount >= rated3`) — an inequality that can be
   * satisfied by ghosts belonging to entirely different engines than the ones claiming err=3, and
   * so can never name a single violating row. It is exactly the mistake the S215 vacuous-assertion
   * sweep found one level down (`\b` against a concatenated DOM blob): an assertion that can
   * identify a violating TOTAL but never a violating ROW. `rotationLab` held err=3 for many
   * sessions on placeholder markup — `{tone ? <p>{tone}</p> : null}` — because this contract could
   * not see that its own component carried no ghost at all.
   *
   * This version checks every err=3 engine BY NAME, against BOTH of the rubric's own earning
   * mechanisms (`docs/CAPABILITY_AXES.md` §err — see below), and against a NAMED, NON-GROWING
   * debt list (`ERR3_NO_OWN_GHOST_DEBT`, above — currently empty) rather than either failing
   * outright on every mismatch at once (an unreviewed bulk downgrade this repo's own precedent
   * refuses to make lightly) or going back to an aggregate that could hide a violator behind an
   * unrelated one. Two directions, both load-bearing: */
  it("err=3 is backed by the rubric's own mechanism — a reveal-ghost testid OR MULTI_CONTROL live-cue membership — checked per engine, against a named debt list", () => {
    // Multi-segment-aware. The house dashed-tangerine grammar is `<prefix>-reveal-ghost` or
    // `<name>-story-ghost` — not always a single unhyphenated segment before "-ghost". The
    // previous pattern, `[a-z]+-ghost`, was itself a false-negative source (S215 follow-up
    // adjudication): it read `tpl-reveal-ghost`, `dcl-reveal-ghost`, and `graph-story-ghost` as
    // absent when all three are present, in-grammar, in the engine's own component — the exact
    // whitespace-blind-regex mistake this file fixed for `adapt=3`, recurring one axis over, in a
    // different dimension (hyphens, not spaces). See the debt-list comment above for the full note.
    const GHOST_RE = /(?:data-testid|testid)="[a-z][a-z-]*-ghost"/;
    const hasGhost = new Set<string>();
    for (const { type, body } of componentEntries()) {
      if (GHOST_RE.test(body)) hasGhost.add(type);
    }

    // MECHANISM 2 (`docs/CAPABILITY_AXES.md` §err): "live per-move direction cues from
    // `src/lib/processEvents.ts` (`MULTI_CONTROL` engines)" — named by the rubric as real, but
    // never folded into the ghost-only sentence this contract enforced alone until now. Imported
    // from `processEvents.ts` rather than copied, so membership here can never silently drift from
    // the set that module actually drives at runtime (a copied list is a second truth source).
    //
    // NOT AN ENDORSEMENT: the rubric is explicit that a live-cue stream never rising above the
    // `GENERIC` fallback copy in `processEvents.ts` is "the weakest form of this level and the
    // most contestable." Passing here on `MULTI_CONTROL` membership alone is a real, defined pass
    // — not a loophole — but it is not the same strength of claim as passing on a ghost. A future
    // adjudicator who reads one of these eight and finds only generic fallback copy should treat
    // that as exactly as contestable as the rubric says, not as settled by this test being green.
    const inMultiControl = (type: string): boolean => (MULTI_CONTROL as ReadonlySet<string>).has(type);

    const rated3 = new Set(
      Object.entries(table.types)
        .filter(([, row]) => row.err === 3)
        .map(([type]) => type)
    );
    const debtTypes = new Set(ERR3_NO_OWN_GHOST_DEBT.map((d) => d.type));

    // The debt list itself must name real, registered types — a typo here would silently make
    // that entry useless (it would never match anything) without making the check any less strict
    // in appearance, which is its own way of hiding a row.
    const unregisteredDebt = [...debtTypes].filter((t) => !registry.includes(t));
    expect(unregisteredDebt, `debt list names a type outside the registry: ${unregisteredDebt.join(", ")}`).toEqual([]);

    // CANNOT GROW: any err=3 engine with NEITHER earning mechanism, that is NOT already a named,
    // dated, adjudication-pending debt, fails immediately, by name. A 13th engine shipped at
    // err=3 without either mechanism gets caught here, not folded silently into a list.
    const newlyMissing = [...rated3].filter(
      (type) => !hasGhost.has(type) && !inMultiControl(type) && !debtTypes.has(type)
    );
    expect(
      newlyMissing,
      `err=3 with neither a reveal-ghost testid nor MULTI_CONTROL membership, and NOT on the named debt list — ` +
        `either add the mechanism, or after adjudication add a dated entry to ERR3_NO_OWN_GHOST_DEBT: ${newlyMissing.join(", ")}`
    ).toEqual([]);

    // CANNOT SHRINK SILENTLY: a debt entry that no longer reproduces — the engine gained a ghost,
    // joined MULTI_CONTROL, or a future session re-rated it below err=3 — must be retired
    // DELIBERATELY. The test fails until an adjudicator removes the row, so the debt list can
    // never drift stale by accident and a genuine fix can never go unrecorded. On today's empty
    // list this holds vacuously; the adversarial simulation that landed this test proved it still
    // bites the moment the list is non-empty (see handoff), rather than leaving it untested.
    const stale = [...debtTypes].filter(
      (type) => !(rated3.has(type) && !hasGhost.has(type) && !inMultiControl(type))
    );
    expect(
      stale,
      `debt entries that no longer reproduce (the engine gained a ghost, joined MULTI_CONTROL, or err dropped below 3) — ` +
        `remove from ERR3_NO_OWN_GHOST_DEBT: ${stale.join(", ")}`
    ).toEqual([]);

    // Sanity floor, independent of both claims above: guards against the introspection itself
    // silently breaking (an empty or mistyped table would vacuously pass everything above too,
    // the same way the old aggregate inequality did).
    expect(rated3.size).toBeGreaterThan(30); // the s31/s32/s36 ghost programme is the score's meaning
  });
});
