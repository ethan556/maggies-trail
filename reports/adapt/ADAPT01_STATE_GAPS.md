# ADAPT-01 — state-aware adaptation gaps

**What this is.** A map of what learner state **exists** against what is actually **consulted** at
each decision point, measured from source only. No app was run. Every claim is reproducible by
reading the cited `file:line`. §7 states what that leaves undetermined.

**Headline.** The state model is unusually rich and unusually well-built — five independent
evidence structures, all pure functions, all deterministic, all with stated rationales. The gap is
not in the modelling. **It is that the richest state is consulted almost nowhere near the learner.**

Three findings carry the report:

1. **The lesson player consults zero persistent learner state.** `playerStore.ts` imports
   `applyResult` and `recordSignal` and calls both — it **writes** mastery and never **reads** it
   (`playerStore.ts:23` is the only mastery import). The `/learn` route hands the authored lesson
   straight to the player with no variant resolution and no band
   (`app/learn/[lessonId]/page.tsx:41-51`). **1,701 lessons / 11,957 widget instances / 8,459
   graded steps are served exactly as authored, to every learner, forever.**
2. **`recommendBand` — the entire difficulty ladder — has exactly one call site**
   (`PracticeClient.tsx:87`). Review hardcodes `"core"` (`ReviewClient.tsx:132`); the Mastery
   Studio omits the argument and takes the `"core"` default (`masteryMission.server.ts:204`); the
   lesson path never reaches it. **1 of 4 variant-serving decision points consults it.**
3. **Accessible state is never consulted when choosing a widget — and the architecture forbids it.**
   `reduceMotion` / `openReading` / `textScale` appear **0 times** in any selection path. Worse,
   `variantForStep` *rejects* any variant whose widget type differs from the authored one
   (`variants.ts:40567`, `40574`), so surface substitution is structurally impossible even if
   someone wanted it.

---

## 1. What state EXISTS

Nine distinct structures, all persisted on `Profile` (`src/lib/progress.ts`) and all validated
through `sync.ts`.

| State | Shape | Written at | Richness |
|---|---|---|---|
| `mastery: Record<tag, SkillState>` | `{mastery, attempts, correctStreak, lastSeen, contexts[], signals{}}` — `mastery.ts:50-75` | `playerStore.ts:160`, `PracticeClient.tsx:110`, `ReviewClient.tsx:178` | Highest. Carries a forgetting model, per-lesson contexts, and a process-signal ledger |
| `review: ReviewItem[]` | `{key, conceptTag, lessonId, stepId, box, due}` — `engine.ts:51-58` | `playerStore.ts:122`, `PracticeClient.tsx:116`, `ReviewClient.tsx:171` | SM-2-lite, 4 boxes (1/3/7/21d) |
| `diagnostic` | `{completedAt, startGrade, responses[], report}` with per-domain θ, SE and status — `placement.ts:139-165` | `PlacementFlow.tsx:132` | Very high: 5 domains × ability estimate × uncertainty |
| `factItems` | per-fact-family leech box — `factFluency.ts` | `playerStore.ts:176` | Item-grain fluency |
| `recentVariants` | last 10 fingerprints per step key — `antiRepeat.ts` | `PracticeClient.tsx:92`, `ReviewClient.tsx:137` | Anti-repeat window |
| **in-session** `history: AttemptEvent[]` | **`{conceptTag, correct, firstTry}` and nothing else** — `engine.ts:167-171` | `playerStore.ts:154-157` | **Lowest.** Deliberately three booleans |
| **in-session** `signalCounts` | `Partial<Record<ProcessSignal, number>>` | `playerStore.ts:444` | High — `ProcessSignal` includes `MisconceptionTag` and `StrategyName` (`processEvents.ts:98-105`) |
| `onboarding.recommendedLessonId` | one lesson id | `PlacementFlow.tsx:140` | Collapsed from the diagnostic |
| `reduceMotion` / `openReading` / `textScale` / `followRecs` | prefs — `progress.ts:62-73` | `ProfileClient.tsx` | Boolean/enum |

Derived, all pure: `retainedMastery` (forgetting-adjusted), `isFading`, `classify` (5 bands),
`rungOf` (5-rung evidence ladder), `recommendBand` (3 bands), `summarize`, `recommendNext`,
`isReady` (prerequisite gate), `adaptiveAction`, `decideResponse`.

---

## 2. What is CONSULTED — the census

External call sites for every adaptive API (definition-file references excluded):

| Function | Defined | External call sites | Who |
|---|---|---:|---|
| `recommendBand` | `difficulty.ts:46` | **1** | `PracticeClient.tsx:87` |
| `adaptiveAction` | `engine.ts:183` | **1** | `playerStore.ts:182` |
| `decideResponse` | `adaptivePolicy.ts:79` | **1** | `playerStore.ts:455` |
| `recommendNext` | `mastery.ts:168` | **1** | `dashboardRecommendation.ts:39` |
| `nextCurriculumSkill` | `mastery.ts:205` | **1** | `api/next-skill/route.ts:20` |
| `seedMastery` | `placement.ts:309` | **1** | `PlacementFlow.tsx:123` |
| `placementRoute` | `placement.ts:352` | **1** | `PlacementFlow.tsx:138` |
| `buildDiagnosticReport` | `placement.ts:387` | **1** | `PlacementFlow.tsx:122` |
| `drawFreshVariant` | `antiRepeat.ts:80` | **2** | `PracticeClient.tsx:88`, `ReviewClient.tsx:129` |
| `variantForStep` | `variants.ts:40550` | **2** | `antiRepeat.ts:91`, `masteryMission.server.ts:204` |
| `retainedMastery` | `mastery.ts:121` | 12 | 10 of 12 are **reporting** surfaces (Parent/Profile/family/school/teacher/institution) |
| `ladderCounts` | `evidenceLadder.ts:51` | 3 | `family.ts`, `school.ts`, `teacher.ts` — **all reporting** |
| `isFading` | `mastery.ts:135` | 6 | `family`, `notebook`, `institution/intervention` — **all reporting** |

**The pattern the census shows:** the rich derived state (`retainedMastery`, `rungOf`, `isFading`,
`ladderCounts`) has 21 consumers and **20 of them render a number for an adult**. The learner-facing
decision points consult the *poorest* state available.

---

## 3. Decision points — state available vs. state used

Six decision points determine what a learner sees. Each row lists what was in scope and what the
code actually read.

### DP-1 · What to show next (in a lesson)

**Available:** everything above. **Consulted:** the authored `steps[]` array index.

```ts
// app/learn/[lessonId]/page.tsx:41-51
const lesson = await loadLessonById(lessonId);
…
return <LessonPlayer lesson={lesson} next={next} trailContext={context} masteryTag={masteryTag} />;
```

`playerStore.ts:311-332` seeds `queue` from `lesson.steps`, and `next()` advances `i` by 1
(`playerStore.ts:404`). Exhaustive grep: **no `variantForStep` / `variantFor` / `drawFreshVariant`
call anywhere under `src/app/learn/`, in `LessonPlayer.tsx`, or in `playerStore.ts`.**
`LessonPlayer.tsx` never references `profile.mastery` (the only `mastery` hits are the
`masteryTag` studio link at `424-432`).

**Gap:** the app's primary surface — **1,701 lessons, 11,957 widget instances, 8,459 graded steps**
— is a fixed linear sequence. The one adaptive behaviour is `offerSkip` after two consecutive
first-try successes (`engine.ts:199-203`), computed from in-session history only. A learner who is
`transferable` on every tag in the lesson walks the identical path as a learner meeting them today.

### DP-2 · Difficulty (band)

**Available:** `recommendBand(skill, today)` — a well-designed 3-band function combining retained
mastery with process-signal pressure and refusing to shift *up* on absence of evidence
(`difficulty.ts:16-29`). **Consulted:** at 1 of 4 places that could use it.

| Surface | Band passed | Evidence |
|---|---|---|
| Practice | **`recommendBand(mastery[item.conceptTag], today)`** ✅ | `PracticeClient.tsx:87-88` |
| Review | **`"core"` hardcoded** ❌ | `ReviewClient.tsx:129-135` |
| Mastery Studio | **argument omitted → `"core"` default** ❌ | `masteryMission.server.ts:204`; default at `variants.ts:40553` |
| Lesson | no variant serving at all ❌ | DP-1 |

`ReviewClient` is the sharpest miss. Review is the *retention* loop — the surface where the
learner's mastery evidence is richest and most decision-relevant, and the file's own comment
(`ReviewClient.tsx:174-177`) argues that "reviewing IS evidence, and the strongest kind". It writes
that evidence back and then draws its next item at a fixed band.

### DP-3 · Remediation

**Available:** the misconception that fired (`ProcessSignal`, which includes `MisconceptionTag`),
`signalCounts`, persistent `mastery`, `retainedMastery`, band. **Consulted:** two paths, and they
consult different things.

**Path A — outcome-driven (`adaptiveAction`)**

```ts
// engine.ts:183-197
export function adaptiveAction(history: AttemptEvent[], alreadyInjected: string[] = []) {
  …
  if (m >= 2 && !tagEvents[m-1].correct && !tagEvents[m-2].correct)
    return { type: "remediate", conceptTag: last.conceptTag };
```

The signature is the finding: the only inputs are `AttemptEvent[]` (`{conceptTag, correct,
firstTry}`) and a list of already-injected tags. **Persistent mastery is not a parameter.** Two
misses in this sitting trigger remediation whether the learner's retained mastery on that tag is
0.05 or 0.95.

**Path B — process-driven (`decideResponse`) — this one DOES consult misconception identity**

`adaptivePolicy.ts:79-98` is the most state-aware code in the repo. It branches on the specific
signal: `LOCKABLE` (`slope-for-intercept` → lock control `m`), `CONTRAST`
(`xy-reversal`, `graph-as-picture`, … → side-by-side framing), else `scaffold`. It has an
anti-over-adaptation contract and a fluency gate.

**But the misconception is discarded at the handoff to the remedial rung.** `decideResponse`
returns `{kind:"remedial"}` at occurrence 3; `playerStore.ts:469` records only that a remedial is
`pending`; and the injection then selects by tag alone:

```ts
// playerStore.ts:193
const rem = st.lesson?.remedials.find((r) => r.conceptTag === act.conceptTag);
```

So the cue, lock, contrast and scaffold rungs are misconception-specific; **the remedial rung is
not.** The signal that earned it is thrown away one line before it is used.

**And the content model cannot support anything better.** Measured across all 1,701 lesson files:
**1,697 remedials, and the distribution of remedials per (lesson, conceptTag) is `{1: 1697}` —
every single pair has exactly one.** `.find()` is not lossy here because there is nothing to
choose between. Making remediation misconception-aware is a **content** change first and a code
change second.

**Fluency gate reads the wrong clock.** `playerStore.ts:449-454` computes `fluent` from
`st.history` (the last two graded attempts *in this session*), not from `mastery[tag]`. A learner
proficient for months who stumbles twice today is scaffolded; a learner with two lucky first-tries
is denied scaffolding they need.

### DP-4 · Hints

**Available:** everything. **Consulted:** nothing.

```ts
// playerStore.ts:437
if (s.hints && st.hintsShown < s.hints.length) set({ hintsShown: st.hintsShown + 1 });
```

```tsx
// LessonPlayer.tsx:733
{s.hints.slice(0, st.hintsShown).map((h, i) => …)}
```

Hint escalation is `n → n+1` over the authored array in authored order. It does not consult band,
mastery, retained mastery, attempts, `signalCounts`, or which distractor was chosen. Its only
downstream effect is the XP penalty (`engine.ts:161`) and the `hintedCorrect` evidence class
(`mastery.ts:29-41`). **Every learner walks the same ladder in the same order at the same rate.**

### DP-5 · Review timing

**Available:** `mastery[tag]`, `retainedMastery`, `isFading`, `classify`, band, `factItems`.
**Consulted:** the box index and one boolean.

```ts
// engine.ts:60-83
export function onMiss(items, seed, today) { … box: 0, due: addDays(today, INTERVALS[0]) }
export function onReviewResult(items, key, correct, today) {
  if (!correct) return [{ ...i, box: 0, due: addDays(today, INTERVALS[0]) }];
  const box = i.box + 1; …
}
```

Neither function takes `mastery` as a parameter. A miss resets to box 0 / 1 day regardless of the
learner's retained mastery on that tag, and a success advances one box regardless of how *hard*
the success was. The forgetting model in `retainedMastery` (`mastery.ts:121-134`) and the SM-2-lite
box schedule are **two independent models of the same phenomenon that never speak to each other** —
`retainedMastery` decides what the Parent Report says is fading; `box` decides when the item comes
back. Note the graduation cliff at `engine.ts:80`: after the 21-day rep the item is **deleted**
from the queue with no reference to whether mastery actually held.

### DP-6 · Placement / diagnostic

`PlacementFlow.tsx:117-140` is genuinely adaptive **within the sitting** — `nextItem` selects the
next probe from the response history and the ability estimate. Its *output*, though, is almost
entirely discarded:

- `seedMastery` → merged into `p.mastery`, but only where it *raises* a value
  (`PlacementFlow.tsx:126-128`). ✅ This one is consumed.
- `buildDiagnosticReport` → written to `p.diagnostic`. **Exhaustive grep: `profile.diagnostic` is
  read by nothing except `sync.ts` validation (`154-164`) and the placement results screen itself
  (`PlacementFlow.tsx:219-267`).** Per-domain θ and standard error — 5 domains × ability ×
  uncertainty — reach no decision point.
- `placementRoute` → collapsed to a single `recommendedLessonId` on `onboarding`
  (`PlacementFlow.tsx:138-146`), read once by `DashboardClient.tsx:98` as a "start here" link.

**A 12-item calibrated diagnostic with per-domain uncertainty is compressed to one lesson id and a
mastery floor.** The `report` object survives only as telemetry for
`server/diagnosticCalibrationService.ts:35-37`.

Related flattening: `api/next-skill/route.ts:12-20` accepts `{ proficient: string[] }` — a
**binary** list. The graded mastery value, retained mastery, band, contexts and signals are all
thrown away at the API boundary before the prerequisite walk begins.

---

## 4. The accessible-state question, answered directly

> *Is accessible-state consulted when choosing a WIDGET, or only when styling one — i.e. can a
> learner who needs reduced motion still be served a drag-heavy engine with no alternative?*

**It is consulted only when styling.** Grepping `textScale|openReading|reduceMotion` across every
selection path — `variants.ts`, `antiRepeat.ts`, `difficulty.ts`, `engine.ts`, `mastery.ts`,
`placement.ts`, `masteryMission.server.ts`, `PracticeClient.tsx`, `ReviewClient.tsx`,
`playerStore.ts` — returns **0 matches**. The preferences reach exactly three places, all
presentational: a pre-paint root attribute (`motionBootstrap.ts:6`), CSS
(`globals.css:110-141, 268-274`), and scroll behaviour (`LessonPlayer.tsx:172, 209`).

**And substitution is architecturally forbidden, not merely absent:**

```ts
// variants.ts:40567 and 40574 — both return paths
return v.widget.type === surface ? v : null;
```

A generated variant is **rejected** if its widget type differs from the authored step's. The
`variantForStep(step, seed, band)` signature has a difficulty axis and no accessibility axis, so
even a purpose-built generator could not serve a `numeric` alternative to a `scatterFit` step. The
engine a learner gets is a property of the authored content, not of the learner.

**The mitigating fact — and it is a large one.** ACC-01 measured all 65 `useSvgDrag` sites: **every
drag-written state dimension has a keyboard control writing the same dimension in the same
component**, drag handles are `aria-hidden` presentation
(`useSvgDrag.ts:16-21`), and there is no HTML5 drag-and-drop anywhere. So the honest answer is:

> A learner who needs reduced motion **is** served the drag-heavy engine, and no alternative engine
> exists or can exist. But the *alternative input* exists **inside** every such engine, and the
> reduced-motion preference correctly suppresses the engine's own transitions
> (85 of 86 inline animation declarations are `prefers-reduced-motion: no-preference`-gated).

So this is a **surface-choice gap, not an access gap**. The learner is not blocked; they are handed
a widget whose primary affordance is a gesture they asked not to be given, and must find the
slider. The two states that would most plausibly justify substitution — `reduceMotion` (a drag is
motion) and `textScale: "xl"` (a dense SVG lab at 115% root) — are exactly the two the selector
cannot see.

---

## 5. Ranked gaps

Score = reach (authored instances touched) × severity of the state ignored.

| # | Gap | Decision point | Evidence | Reach |
|---|---|---|---|---|
| 1 | **Lesson path consults no persistent state** | DP-1 | `app/learn/[lessonId]/page.tsx:41-51`; `playerStore.ts:23` (write-only mastery import) | **11,957 instances / 8,459 graded / 1,701 lessons** |
| 2 | **Review draws at a hardcoded band** | DP-2 | `ReviewClient.tsx:132` | Every review item, on the retention loop |
| 3 | **Hint escalation is a bare counter** | DP-4 | `playerStore.ts:437`; `LessonPlayer.tsx:733` | Every hinted step, every surface |
| 4 | **Remedial selection drops the misconception**, and content offers exactly one remedial per (lesson, tag) | DP-3 | `playerStore.ts:193`; measured `{1: 1697}` | 1,697 remedials / 1,670 lessons |
| 5 | **Review scheduling ignores the forgetting model it ships** | DP-5 | `engine.ts:60-83` vs `mastery.ts:121-134` | Whole review queue |
| 6 | **Diagnostic report is written and never read** | DP-6 | `PlacementFlow.tsx:132`; 0 external readers | Every placed learner |
| 7 | **`adaptiveAction` cannot see cross-session mastery** | DP-3 | `engine.ts:183` signature | Every graded lesson step |
| 8 | **Fluency gate reads in-session history, not mastery** | DP-3 | `playerStore.ts:449-454` | Every process-signal response |
| 9 | **Accessible state absent from selection; substitution structurally forbidden** | all | grep = 0; `variants.ts:40567, 40574` | All widget-bearing steps |
| 10 | **`next-skill` flattens mastery to a boolean at the API boundary** | DP-1 | `api/next-skill/route.ts:12-20` | Dashboard/Trailhead recommendation |

**Two of these are cheap and two are not.** #2 is a one-argument change (`"core"` →
`recommendBand(mastery[ri.conceptTag], today)` — `mastery` is already loaded in that scope at
`ReviewClient.tsx:120`). #7 is a signature extension with an existing pure-function shape. #1 is a
significant architectural change. #4 is a **content** programme — 1,697 remedials to author against
misconceptions — before it is a code change.

---

## 6. Hand-check — 14 claims verified, with the true-positive rate

Every claim in §3 is a negative ("X does not consult Y"), which is the class of claim most easily
made wrong by an incomplete grep. Each was verified twice: an exhaustive symbol grep across
`src/**` *and* a read of the cited code.

| # | Claim | Method | Verdict |
|---|---|---|---|
| 1 | `recommendBand` has 1 call site | grep + read `PracticeClient.tsx:87` | **TRUE** |
| 2 | Review hardcodes `"core"` | read `ReviewClient.tsx:129-135` | **TRUE** |
| 3 | Lesson path serves no variants | grep `variantForStep\|variantFor\|drawFreshVariant` over all of `src/`; read `learn/[lessonId]/page.tsx` | **TRUE** |
| 4 | Mastery Studio passes no band | read `masteryMission.server.ts:204`; default at `variants.ts:40553` | **TRUE** |
| 5 | `adaptiveAction` cannot see mastery | read signature `engine.ts:183-186` | **TRUE** |
| 6 | Remedial selected by tag only | read `playerStore.ts:190-197` | **TRUE** |
| 7 | Exactly 1 remedial per (lesson, tag) | counted all 1,701 lesson files → `{1: 1697}` | **TRUE** |
| 8 | Hints are a bare counter | read `playerStore.ts:437` + `LessonPlayer.tsx:733` | **TRUE** |
| 9 | Review scheduling ignores mastery | read `engine.ts:60-83` signatures | **TRUE** |
| 10 | `profile.diagnostic` never read for a decision | grep `\.diagnostic\b`, `estimatedGrade`, `domainScores`, `\.report\b` | **TRUE** (readers: `sync.ts` validation, its own results screen, server calibration) |
| 11 | A11y prefs absent from all selection paths | grep across 10 selection files | **TRUE** (0 matches) |
| 12 | `variantForStep` rejects type-changing variants | read `variants.ts:40567, 40574` | **TRUE** |
| 13 | `decideResponse` **does** consult misconception identity | read `adaptivePolicy.ts:79-98` | **TRUE — and it is a *counter*-finding**; it disproves "remediation consults only correctness" as a blanket claim |
| 14 | `isReady` is dead code (0 external call sites) | grep said 0 → **read `mastery.ts:186`** | **FALSE** — used internally by `recommendNext` |

**True-positive rate: 13 / 14 = 93%.**

That rate is high *because of how the claims were formed*, and the contrast with ACC-01 (38%) is
the methodological point of this pair of reports. ACC-01's detectors were **pattern matchers over
markup**, which is why they were wrong 62% of the time — markup is contextual (a parent
`aria-hidden`, a wrapping `<label>`, a JSX comment) and a regex sees none of it. ADAPT-01's claims
are **call-graph facts about pure functions with explicit signatures**, which a symbol grep settles
almost exactly.

The one failure (#14) is the instructive one, and it failed in the way the others could have: my
detector counted *external* call sites and I nearly wrote "dead code" from a zero. Reading the
defining file took thirty seconds and reversed the finding. **Two further near-misses caught the
same way:** I was about to record "remediation consults only correctness" (§3 DP-3) before reading
`adaptivePolicy.ts` and finding the misconception-specific ladder — the true finding is narrower
and more useful (*the misconception is consulted for three rungs and dropped at the fourth*). And I
was about to record "the diagnostic report is unused" before finding
`server/diagnosticCalibrationService.ts:35-37`, which uses it for calibration telemetry — so the
accurate claim is "never read for a *learner* decision", not "never read".

---

## 7. What I did NOT measure

**I cannot run the app.** Every claim above is about what the source says, not what a learner
experiences.

1. **No runtime trace.** I did not observe a single lesson, practice round, review sitting or
   placement. "Not consulted" means "no code path passes this value to that function", established
   by symbol grep plus reading. It does not account for state reaching a decision by a route I did
   not think to grep for — a `useEffect` deriving something equivalent, a server component, a
   value smuggled through a prop I did not follow.
2. **No behavioural measurement of whether the gaps matter.** Whether a fixed lesson sequence is
   *actually worse* for a learner than an adaptive one is an empirical question this report cannot
   touch. A well-ordered curriculum with strong content may outperform naive adaptation. §5's
   ranking is by **reach and by state-ignored**, which is a proxy for harm, not a measurement of it.
3. **Content quality is out of scope.** I counted 1,697 remedials and their distribution; I did
   not read them. Whether the single remedial per (lesson, tag) already addresses the most common
   misconception for that tag — which would substantially reduce gap #4's severity — needs a
   content read, not a code read.
4. **Generator behaviour is unverified.** `recommendBand`'s output feeds `variantForStep(…, band)`,
   and generators use it via helpers like `maxByBand(b, s, c, t)` (`algebra1Variants.ts:8`,
   `algebra2Variants.ts:7`). I did **not** measure how many generators actually branch on `band`,
   nor how large the difficulty delta is between `support` and `stretch`. If most generators ignore
   the parameter, gap #2's practical severity is lower than its reach suggests. `npx tsx
   scripts/measure/verify.mts` would settle it.
5. **Server-side surfaces were sampled, not swept.** I read `api/next-skill`, checked
   `src/app/api/` for other adaptation routes, and read `masteryMission.server.ts` and
   `placementBank.server.ts`. `src/server/**` and the `class-insights` / `interventions` /
   `institution` routes were **not** read in full — they are teacher/admin surfaces, so a missed
   adaptation there would not change §3, but it could add rows to §2.
6. **Sync-merge semantics were not verified.** `sync.ts:370-371` merges preferences and
   `diagnostic`; whether a multi-device merge can *lose* mastery or signal state in a way that
   degrades adaptation is a separate audit.
7. **No tests were run and no code was changed**, per the task constraint. In particular I did not
   run `npx vitest run`, so I cannot report whether existing tests already pin any of the behaviours
   in §3 — several probably do, and a test asserting `"core"` at `ReviewClient.tsx:132` would need
   updating alongside gap #2.
