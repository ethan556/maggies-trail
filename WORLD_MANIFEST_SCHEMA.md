# World Manifest Schema (Phase B)

`content/world/world-manifest.json` is **generated** by `npm run gen:world-manifest` from three
existing sources — `content/courses/*/course.json`, `PATH_EDGES` in `src/lib/content.server.ts`,
and the fixed §5 region table inside the generator. Never hand-edit it; `verify:world` W1 fails
on any byte of drift from a fresh generation.

## Shape

```
{ version, generatedBy,
  regions[14]:    { id, gradeBand 0..13, name, description, visualMaturity, environmentalGrammar,
                    primaryDomains[], accessibilityLabel },
  courses[129]:   { courseId, regionId, trailName, trailSummary, prerequisiteCourseIds[],
                    landmarkIds[], instrumentIds[]=∅, conceptConnections[]=∅ },
  landmarks[513]: { id: `${courseId}:${chapterId}`, courseId, chapterId, name, waypointIds[] },
  instruments[13]:{ id, name, transferableIdea, conceptTags[]=∅ },
  connections[]=∅ }
```

## Contracts

- **Geography only.** No learner state, ever — `verify:world` W5 scans for the forbidden keys
  (`completed`, `mastery`, `xp`, `bestXp`, `due`, `streak`). Learner-relative facts (open,
  active, fading, enduring) are derived in `src/world/deriveWorldState.ts` from the Profile.
- **Empty means unbuilt, not implied.** `instrumentIds`, `conceptTags`, `conceptConnections`,
  and `connections` stay `[]` until Phase D maps real evidence. Tests pin the emptiness so a
  placeholder cannot masquerade as data.
- **Prerequisites mirror PATH_EDGES exactly** (W4 checks both directions: manifest refs resolve,
  and every edge endpoint is a course). The graph is acyclic (W6).
- **Landmarks mirror chapters byte-for-byte** (W3 compares `waypointIds` to `lessonIds`).

## Derivation layer (consumers)

`src/world/revealRules.ts` — pure predicates with named policy constants
(`ENDURING_AFTER_DAYS=22`, `RECENT_DAYS=3`, calibration strictly above `ASSISTED_CEILING`).
`src/world/deriveWorldState.ts` — `(manifest, evidence, today) → WorldState`, the single object
Phase C surfaces will render. `evidenceFromProfile` projects the durable Profile fields.
Exhaustive boundary tests: `src/world/world.test.ts` (23).
