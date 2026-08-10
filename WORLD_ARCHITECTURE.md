# World Architecture (Phases B–D)

## The one-way data flow

```
content/courses/**          PATH_EDGES            §5 region table
        │                       │                       │
        └───────────┬───────────┴───────────────────────┘
                    ▼
      scripts/gen-world-manifest.mjs      (generated; never hand-edited)
                    ▼
      content/world/world-manifest.json   GEOGRAPHY ONLY — no learner state
                    │
   worldServer.ts   │  regionWorld(regionId) — region + transitive prerequisite closure
                    ▼
  WorldShell ──► deriveWorldState(manifest, evidence, today) ──► WorldState
       ▲                          ▲                                  │
       │                          │                                  ▼
  worldPreferences        evidenceFromProfile(Profile)      Trailhead · Atlas ·
  (presentation only)     (local-first progress store)      Basecamp · Journal ·
                                                            Instruments · ReturnPaths
```

Surfaces **render** `WorldState`; they never derive. That single rule is what makes the three
theme intensities functionally identical by construction rather than by discipline — the mode
flags are presentation booleans and cannot reach the derivation.

## Why the manifest is sliced

The full manifest is 241 KB (38 KB gzipped) — more than every world surface combined. Server
components call `regionWorld(PILOT_REGION_ID)` and pass a slice.

The slice is **not** just the region. Pattern Valley's approach trails start outside it
(`multiplication-division` needs `add-subtract-20` and `place-value-1000`, both earlier
regions). `approachOpen` fails closed on an unresolvable prerequisite — correct for a genuinely
dangling reference, catastrophic for a slice that merely forgot one, because every affected
course would render locked and look like ordinary "not unlocked yet" behaviour. `regionWorld`
therefore includes the transitive prerequisite closure, and `worldSurfaces.test.tsx` asserts
`derive(slice) === derive(full)` for every pilot course.

Measured result: `/atlas` 1.5 kB · `/basecamp/[courseId]` 2.39 kB · `/journal` 2.42 kB ·
`/trailhead` 3.55 kB (119–121 kB first load, in line with existing pages).

## Evidence, not completion

`WorldState.evidence` carries the projection it was derived from, so surfaces needing raw
evidence (instrument mastery, review items) cannot read a different snapshot than the rest of
the page.

| Reveal | Evidence required |
|---|---|
| Approach open | every landmark of every prerequisite walked (≥1 waypoint) **or** chapter test-out |
| Landmark active/complete | waypoint completions, or test-out |
| Route fading / needs reinforcement | the existing 1/3/7/21 scheduler's due dates |
| Enduring route | complete + review-clear + newest completion ≥ 22 days old |
| Instrument discovered → assembled → calibrated | mastery on the instrument's own conceptTags; calibration strictly above `ASSISTED_CEILING` so assisted work alone cannot reach it |
| Instrument enduring | held mastery ≥ 22 days after last practice |
| Connection | every shared tag independently mastered |

`carried` is deliberately unreachable: it needs cross-course usage evidence that does not exist
yet. Emitting it would be a state that looks earned and is not.

## Instrument mapping

13 instruments own keyword patterns over the corpus's 1,705 distinct step conceptTags;
`INSTRUMENT_PRECEDENCE` resolves tags carrying two ideas (unit-rate is proportional reasoning
before unit conversion; antiderivative is accumulation before change). 255 tags map — the
intended shape, since instruments are thirteen transferable ideas rather than a taxonomy.

Tight patterns were necessary. Loose ones produced real false positives during design:
`metric` matched "geoMETRIC" and "paraMETRIC", `mean` matched "MEANing", `variab` matched
"isolate-VARIABle" — each would have attached a learner's evidence to an instrument they had
never touched. Hyphen-anchored boundaries fixed all four.

## Player containment (§13)

No world module is importable from the lesson player. `verify:trail-voice` enforces the
forbidden-import list (`RegionMap`, `WorldShell`, `Atlas`, …); the world wraps the player, never
invades it.
