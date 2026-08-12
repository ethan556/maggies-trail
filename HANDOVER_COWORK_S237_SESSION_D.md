# HANDOVER — Cowork S237, session D → next Cowork session

Successor to `HANDOVER_COWORK_S237_SESSION_C.md`. **Self-contained**: start here. Session C's file
is still correct on §2 (non-negotiables), §3 (the three traps) and §4 (the five lessons) — re-read
those three sections there, they are unchanged and they still cost sessions time.

---

## 0. Bootstrap

```bash
git clone https://github.com/ethan556/maggies-trail.git
cd maggies-trail && git checkout cowork/s237
git fetch <bundle> HEAD:refs/heads/incoming && git merge --ff-only incoming   # if a bundle came with this
git merge-base --is-ancestor 4b66fe1 HEAD; echo "ancestry:$?"    # MUST be 0
npm ci
```

**HEAD at end of session D: `8079c47`.** The remote reached `ac54811` mid-session (the human
pushed), so the final bundle carries the last **2** commits on top of that.

**Check the real remote SHA before claiming a count** — `mcp__Github__list_branches`, then
`git update-ref refs/remotes/origin/cowork/s237 <sha>`. The local tracking ref goes stale the
instant the human pushes, and it did exactly that this session.

Then read `CLAUDE.md`, `COWORK_CACHE/PENDING_WORK_INVENTORY_S237.md`, and §3 below.

---

## 1. Gate results at `8079c47` — your new baseline

```
typecheck                clean
vitest (2 shards)        13,124 / 13,124      both shards exit 0
playwright (chromium)    97 / 97              axe 50/50 across 26 routes x both themes
validate:content         1840 / 1840
lint:pedagogy            1711 / 1711
validate:native          archive-only findings only
check-registration       consistent
build                    EXIT:0
content-change-proof     866 / 866            <- was RED before session D
```

**If your first run does not match this, that is your problem to solve before starting new work.**

Trap K fired on every full run — queue CSV restored to 11,488 each time. `EXCELLENCE_BACKLOG_S126`
moved and was **kept**: manipulative coverage +23, absent-diagram candidate scan 62 -> 53. A
measurement, not damage.

---

## 2. What session D landed (6 commits)

| Commit | What |
|---|---|
| `841315b` | `.bg-sky` AA failure closed via `bg-cta` — **without** moving an instructional colour |
| `628f871` | mmt-05-01 lease (10 steps), 14 manipulatives, `numeric` fraction preview, fraction-first readouts, ledger repaired |
| `cfb7368` | handover |
| `50d38fc` | browser verification — and the picture-graph row was wrapping |
| `426fa87` | manipulative ledger closed, all 32 rows resolved |
| `2e098f6` | vm-02-02's line plot drawn; the family measured at 20 rows |
| `8079c47` | 2,303 colliding labels -> 267; the unlabelled estimateSlider |

### Things the next session will otherwise redo

**Do NOT darken the `sky` token.** The session-C handover recommended `#1F5FA8`. Measured: `sky` is
an *instructional* colour (`palette.ts:12`, `ROLE.active`) — 69 authored steps declare
`"addColor": "sky"` as content data and `figures.tsx` uses it 1,972 times — and darkening creates
new failures the other way (`text-sky-ink` on `bg-sky/15` 4.54 -> 4.38; 13 dark chrome sites
3.23 -> 2.12, under the 3:1 non-text floor). The handover's stated reason for hesitating, that
`verify:instructional-colors` would catch a palette split, is **false**: that script only greps for
raw Tailwind palette classes and never reads a hex. `--cta` (#2069BF, 5.48:1, fixed in both themes)
was already available and is what shipped.

**The shared VARIANT GENERATOR sets the scope of an absent-diagram lease, not the lesson.**
`MmtPictureGraphNumeric` served 9 steps across three lessons and the surface-parity gate forces
them to convert together. Check it before scoping anything in §3.3.

**A display field beats a surface swap when the surface already grades the right thing.** Both
`previewDenominator` (numeric) and `plotData` (numeric + fractionEntry) are display-only, resolved
through a single function the renderer and `describeWidgetState` share, absent by default. Copy that
contract; do not invent a second shape. `dotPlot` was the obvious swap for vm-02-02 and was WRONG:
it grades a stack count, those steps grade a total and a difference.

---

## 3. What is left, in priority order

### 3.1 The 267 remaining label collisions — measured, listed, unfixed

Session D swept 12,873 authored specs x 2 tones and fixed 2,303 -> 267. The remainder are all
data-driven and learner-reachable, with the triggering lesson named:

| Engine | Pairs | Example trigger |
|---|---:|---|
| `unitChain` (widgets.tsx:7710) | 82 | `mc-01-01` — value `1.333333` over the caption `ruler counts in kg` |
| `distributionCompareLab` (:8561) | 48 | `sp-02-01` — `Group A` / `Group B` markers collide when the means coincide |
| `slopeTriangle` (:12848) | 25 | `fg-02-02` — `run 1` over `A (1, 1)` |
| `samplingBiasLab` (:16408) | 14 | |
| `pointSetReasoningLab` | 10 | `dd-04-01` draws duplicate axis values on top of themselves |
| `signChart` (:3432) | 8 | `pf-02-03` — two `cross` labels for close roots |
| 18 smaller | 80 | |

The gate `widgets.labelCollision.s237` already computes label boxes; extending it to these engines
is the cheap part. **`figures.tsx` (4,953 text nodes) is unmeasured** — the sweep deliberately did
not touch it.

Also class B: `widgets.tsx:12914` (`SliderW`) and `:502` still use `aria-label={spec.prompt}` —
the whole prompt sentence as a control's accessible name, the same defect fixed on `estimateSlider`.

### 3.2 The inline-dataset family — 16 of 20 rows left

`plotData` draws the plot a prompt describes. Four rows wired in `vm-02-02`. Sixteen remain across
`vm-02-01` (4), `g2g-01-05` (3), `md-03-04` (3), `dd-02-01` (2), `g2g-03-03` (1), `mc-05-02` (1),
and `vm-02-02/i2` + `rem-lo-k` (2 — same file, one line each).

**Eight need the same optional block on `McqSpec`.** The renderer, integrity rules and spoken
phrase are already shared, so that is the highest-leverage next step in this family.
**Two are blocked on a ruling, not effort** (see §5).

### 3.3 The remaining 31 absent-diagram rows

`COWORK_CACHE/absent-diagram-corrected-s237.md`. Next by shape: `exp-04-01` (3, needs triage),
`ee-05-02` (3, needs triage), `cx-03-03` (2, `coordinateProofLab`). Note `vm-02-02`'s four rows are
now **drawn but still counted** in that CSV — the plot is present; the row text has not been
re-triaged.

### 3.4 Browser verification — the per-engine matrix

Page-level axe is done and green (50/50, both themes). WP1's stated exit condition also wants the
**changed engine families at 390/768/1440, active and retry**. Two purpose-built specs now exist as
patterns to copy: `e2e/s237-picture-graph-scale.spec.ts` (geometry — one-row-ness, touch targets,
overflow) and `e2e/s237-label-collision.spec.ts` (real laid-out label boxes).

```bash
npm run build
setsid npx next start -H 127.0.0.1 -p 3100 > /tmp/next.log 2>&1 < /dev/null &
PW_BASE_URL=http://127.0.0.1:3100 \
PW_CHROMIUM_EXE=/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
  npx playwright test --project=chromium
git status --short          # Trap K's sibling: restore WAVE04_SCREENSHOTS/
```

Run against `next start`, never `next dev`. Captures belong in `S237_SCREENSHOTS/`.

### 3.5 Carried, cheap

- `fractionEntry` and `pointEntry` entry previews are `aria-hidden` with **no** `describeWidgetState`
  branch. `numeric`, `estimateSlider` and the new `plotData` all have one now; the pattern is in
  place and the fix is small.
- `DotPlotReadW`'s group `aria-label` still uses the older `"2 X above 1/4"` phrasing while
  `describeState` uses the stored plural. Two dialects for one engine.

### 3.6 Known content defects found and NOT fixed (frozen authored prose)

- `dc-02-01/ch1` — two `commonErrors` with the identical value `36` and different feedback; the
  second is unreachable. **No gate compares trap VALUES**, only feedback strings.
- `scaledCircleLab.fallbackFeedback` is schema-required and unreachable by construction, every
  instance.
- `g2g-02-01`/`g2g-02-02` prompts read "8 shells pictures", "5 pinecones pictures".
- Two converted picture-graph rows use a neutral dot because "pinecones" and "stickers" have no
  unambiguous glyph; shells and apples got their own.

---

## 4. Owed housekeeping

`npm run gen:reports` was never run. `FLAGSHIP_TIERS.md` moves one G3-5 lesson B->A as a result of
the manipulative batch. It was deliberately not regenerated mid-batch; it is owed.

---

## 5. Rulings the next session should bring the user

1. **`md-03-04`** writes its axis as `2 1/2` in mixed form while the one shared formatter
   (`dotPlotLabel`) returns `5/2`. Drawing it would put a label on the axis that contradicts the
   frozen prompt. Needs a mixed-number mode in the shared formatter, or a prompt ruling.
2. **`mc-05-02/k2`** lists its marks out of order (`1/2, 3/4, 5/8`); a plot axis must increase.
3. **Fraction/decimal tail** — two cosmetic inversions where the decimal leads and the fraction
   follows (`g5u-03-02.json:38`, distractor labels in `g5f-02-02`/`g5f-02-03`). Authored prose.
4. **The 8 NOT-POSSIBLE manipulative rows** are an *engine* project, not a content batch: a general
   related-rates model (the existing one is hard-coded to the ladder `x^2 + y^2 = L^2`), a
   parametric-direction tracer, a systems grapher accepting vertical constraints, and a
   `quadraticExplore` whose `a` is not `z.number().int()` so `0 < a < 1` becomes drawable.

---

## 6. Environment traps learned in session D — these cost real time

- **`next start` keeps serving a DELETED `.next` after a rebuild.** Every `/learn` route renders
  EMPTY while `/` still works from static cache. It looks exactly like a product defect and is not.
  Kill the old server **by pid** before rebuilding.
- **`pkill -f "next start"` kills your own shell** — the pattern matches the agent's own command
  line. So does a `for p in /proc/[0-9]*` loop whose script text contains the literal string you
  are grepping for; I hit that one myself, twice. Build the pattern from concatenated fragments and
  skip `$$`.
- **The browser gate caught what the unit gate blessed.** A jsdom label-geometry model called a
  layout clean that overlapped by 2.8px in a real browser. The measured constants (0.72em x 1.26em,
  not the assumed 0.62em x 1.0em) came out of that failure. jsdom does not do layout — when the
  defect is visual, the browser is the only honest evidence.
- **Vitest Trap B still applies**: never more than 2 shards, and re-run any failure solo before
  believing it.

---

## 7. What reading the output caught that green gates did not

Four defects this session, every one found by printing the render and reading it as a human:

1. The picture-graph generator printed **"1 apple pictures"** on every seed where the count was 1.
2. My own narration said **"1 of 4 part of another"** — the noun agreed with the shaded count
   instead of the total.
3. The improper-fraction bar **understated the learner's own entry**: 16/3 drew one full bar,
   saying "one whole" for an answer of five-and-a-third.
4. A generator **dropped `previewDenominator` on re-ask**, so the live fraction bar vanished the
   moment a learner re-asked the item — work shipped earlier in the same session.

Budget time for step 5 of `CLAUDE.md`'s working rhythm. It is not ceremony.

---

## 8. Suggested first action

**Extend `plotData` to `McqSpec`** (§3.2). Eight rows, the renderer / resolver / spoken phrase are
already shared, and it finishes the family the last session measured rather than opening a new one.

Then §3.1's `unitChain` (82 collisions, one engine, and the gate already exists).

Do not start by re-measuring what §3 already measured.
