# S238 — Plan v3 adoption + WS-D stage-role surgery

**Session date:** 2026-08-12 · **Base:** `39bf84c` (S237 session D bundle tip) · **Canonical plan:**
`OPTIMIZATION_PLAN_V3.md` (adopted this session; supersedes `PREMIUM_REBUILD_PLAN.md` where they
disagree — see the mapping table at the end of `PREMIUM_EXPERIENCE_CONTRACT.md`).

## Baseline verification (before any change)

typecheck clean · vitest 13,124/13,124 (9,644 + 3,480, two shards, both exit 0) ·
validate:content 1840/1840 · lint:pedagogy 1711/1711 · check-registration consistent ·
validate:native archive-only findings only. Matches HANDOVER_COWORK_S237_SESSION_D_2 §1 exactly.
Trap K fired as documented (queue CSV restored). Playwright chromium baseline was taken on faith
from the handover (97/97) and re-measured after the change — see below.

## What landed

### 1. Plan adoption (Wave 0 deliverables)

- `OPTIMIZATION_PLAN_V3.md` committed as the canonical program document.
- `PREMIUM_EXPERIENCE_CONTRACT.md` written from Plan v3 WS-G §1 — the 13 contract rows with
  their check style (machine vs pixels), the stop rules verbatim, the protected strengths, and
  the mapping from the old Waves A–F program into Plan v3 workstreams.
- Wave 0 precache reconciliation: the repo already carries the S237 inventory layer
  (`COWORK_CACHE/` — engine map, gate map, work index, absent-diagram and typesetting CSVs,
  pending-work inventory). The full §4.2 `/.cowork-cache/` build (17 JSON indexes + screenshot
  matrix) is the entry ticket for a *fanned-out* wave and was deliberately not rebuilt for this
  single-lane session — build it when the first parallel wave launches, not before.

### 2. WS-D §1 — semantic stage roles (the shell change Plan v3 orders first)

The defect (Plan v3 Part 1.2 "Stage & chrome"): the lesson stage capped at `max-w-3xl` (768px)
on 1440px displays, and the six flagship graph labs *additionally* capped their own SVG at
`max-w-lg` (512px) — the mathematics floated as a small diagram in a large page.

| Tier | Was | Now | Plan v3 band |
|---|---|---|---|
| narrow (reading) | `max-w-xl` 576px | `max-w-2xl` 672px | 600–680 |
| medium (compact manipulative) | `max-w-2xl` 672px | `max-w-3xl` 768px | 720–820 |
| wide (wide model) | `max-w-3xl` 768px | `max-w-5xl` 1024px | 920–1080 |
| **hero (new)** | — | `max-w-6xl` 1152px | 1100–1280 |

- `stageWidth.ts`: tier remap + new `hero` tier. **Hero ships with zero members by design** —
  engines opt in with their WS-C conversion after pixel QA at 1440px, never by guess.
- `LessonPlayer.tsx`: the four inner reading-column wrappers follow narrow to `max-w-2xl`, so
  prose, process cues, model controls and recap stay at reading width inside wide stages.
- `widgets.tsx`: the six graph labs sharing the `max-w-lg` SVG cap — ScatterFitW, DilationScaleW,
  TransformExploreW, SystemsExploreW, QuadraticVertexW, LineExploreW — raised to `max-w-xl`
  (512 → 576px). Deliberately modest: these are square viewBoxes, so width is height, and 768px+
  squares would overflow a laptop viewport. The real growth for these labs comes when WS-C gives
  them side panels (representation sync) that *use* the wide stage, not from inflating one SVG.

### 3. Pixel evidence, not JSX evidence

New spec `e2e/s238-stage-roles.spec.ts` (pattern: the two S237 purpose-built specs): at 1440px
the wide lab's main column measures ≥1000px and the graph ≥560px with header/footer agreeing; a
prose step stays ≤700px; at 390px both themes show zero horizontal overflow; 768px clean.
Captures in `S238_SCREENSHOTS/` (lab at 1440/768/390 light+dark, prose at 1440), taken against
`next start`, never dev.

### 4. Three stale e2e assertions fixed (stricter, not looser)

`e2e/player-state.spec.ts` predated Wave A and S235 and was failing at *baseline* (outside the
handover's chromium-only 97/97 claim): it expected the removed `.trail-clearing-shell`, the old
"Picked up where you left off" resume copy (source renders "Resumed at step N of M"), and a
disabled answer input after reveal (S235 exploration checkpoints deliberately keep the model
live). All three now assert the current, intended behavior. Nothing was weakened: the replacement
assertions test the same invariants against the real markup.

## Gate results at session end

```
typecheck                clean
vitest (2 shards)        13,124 / 13,124      (9,644 + 3,480, both exit 0, re-run post-change)
playwright               132 / 132            ALL 5 projects vs next start (chromium + player-state
                                              + 3 viewport projects) — a wider net than the
                                              97/97 chromium-only baseline claim
validate:content         1840/1840
lint:pedagogy            1711/1711
check-registration       consistent
validate:native          archive-only findings only
build                    EXIT:0
```

**HEAD at end of session: `2aa3fca`** — three commits on `39bf84c`: plan adoption (`d410598`),
WS-D stage roles (`e89f23d`), stale e2e fixes (`2aa3fca`).

## What S238 did NOT do (open, in Plan v3 priority order)

- The 267 measured label collisions (S237 §3.1) — `unitChain` (82) is the named next target.
- The inline-dataset `plotData` family — extend to `McqSpec` (8 rows ready; handover §8's
  suggested first action, deferred here in favor of Plan v3's shell-first ordering).
- WS-C direct-manipulation conversion (the big one) and hero-tier assignments that come with it.
- WS-A brand productionization, WS-H landing rebuild, WS-J avatars (assets are concept boards
  only — see the two hard rules in Plan v3 Part 0).
- The five rulings in handover §5 still need user answers.
