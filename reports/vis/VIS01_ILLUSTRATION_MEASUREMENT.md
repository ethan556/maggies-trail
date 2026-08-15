# VIS-01 — Illustration Placement Measurement (current state)

Measurement only. Nothing in `content/` or `src/` was changed.

- Detector: `scripts/audit/vis01-illustration-measurement.mts`
- Per-row output: `reports/vis/VIS01_PLACEMENTS.csv` (3,816 rows)
- Measured at: repo working tree, 2026-08-15

## Headline

**The claim "1,078 illustrations are withheld or mismatched" is exactly right on
"withheld" and overstated on "mismatched."**

I reproduced 1,078 to the row, independently, from the live corpus. But "withheld" is a
mechanical fact (the renderer suppresses the figure) while "mismatched" is a pedagogical
judgment the guard only approximates. Hand-checking 25 flagged rows says roughly **981**
of the 1,078 are genuine mismatches; about **95–100** are over-suppression of figures that
are correct and on-topic.

---

## 1. The schema, as it actually is

There is no `illustration`, `image`, `art`, `svg`, or `diagram` field. The entire system is
one optional string field naming an entry in a React component registry.

**Declaration** — `src/lib/schema.ts`:

```ts
// line 8982, on Step
/** Optional named figure (see src/components/figures.tsx FIGURES registry)
    rendered above the body on concept steps. */
figure: z.string().optional(),

// line 501, on a widget panel
figure: z.string().optional()
```

**The asset** is not a file on disk. It is a hand-written inline-SVG React component in
`src/components/figures.tsx` (29,656 lines, 1.8 MB), exported as
`FIGURES: Record<string, () => JSX.Element>` (line 27754). Each carries an accessible
`<title>`. There is no image directory, no `.svg` files, no CDN — so "resolves to a real
asset on disk" is not a meaningful category here; the correct question is registry membership.

**Resolution** is via a generated sidecar set `FIGURE_IDS` (`src/components/figureIds.ts`,
built by `scripts/gen-figure-ids.mjs`) so the id check stays synchronous while the 1.8 MB
figure body is code-split behind `FigureView` (`src/components/FigureView.tsx`).

**The render condition is the same three-part test in both call sites** —
`src/components/LessonPlayer.tsx:587` and `src/components/widgets.tsx:15960`:

```ts
s.figure && FIGURE_IDS.has(s.figure) && isFigureTextAligned(s.figure, s.body ?? "")
```

`isFigureTextAligned` (`src/lib/figureTextAlignment.ts`) is the withholding gate. It has
exactly two mechanisms:

1. **Fixed-exemplar text guard.** Four figures — `count-on-hops`, `bar-compare`,
   `number-track`, `frac-equal-vs-unequal` — hard-code specific numbers in their SVG. They
   render *only* if the step body matches a hardcoded regex. Everything else is allow-by-default.
2. **Blocklist fingerprint.** `FIGURE_TEXT_MISMATCH_BLOCKLIST`
   (`src/lib/figureTextMismatchBlocklist.generated.ts`) holds 136 FNV-1a hashes of
   `figureId + "\n" + normalized(body)`. A hit suppresses the figure. It is fail-closed:
   editing either the figure binding or the prose invalidates the hash.

When the gate fails, the whole figure wrapper is omitted — no empty shell, no alt text, no
placeholder. **The learner sees prose with no picture and no indication one was intended.**

**Placement sites found by walking every lesson JSON tree** (not by assuming the schema):

| Path | Count | Rendered by |
|---|---:|---|
| `steps[].figure` | 3,686 | `LessonPlayer.tsx:587` |
| `remedials[].concept.figure` | 114 | same path — remedial steps are injected into `st.queue` |
| `steps[].widget.panels[].figure` | 16 | `widgets.tsx:15960` |
| **Total** | **3,816** | |

---

## 2. Where 1,078 came from

- `PREMIUM_REBUILD_FIGURE_TEXT_ADVERSARIAL_S233.md` — the origin. 942 fixed-exemplar
  mismatches + 136 adversarial pairings = 1,078.
- `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` — 11,287 rows total; the 1,078
  `ILLUSTRATION_REPLACEMENT` rows (`ILL-0001…`) are one workstream inside it.
- Restated in `HANDOVER_S234/S235/S237.md`, `PEDAGOGICAL_PERCEPTUAL_BASELINE.md`,
  `COWORK_CACHE/PENDING_WORK_INVENTORY_S237.md`.

Note the recurring warning in those files: a test run has repeatedly *truncated* the
11,287-row queue down to only its 1,078 illustration rows. That is data loss, not progress —
it does not affect the illustration count itself.

There is no packet literally named "VIS-01" anywhere in the repo. `grep -r "VIS-01\|VIS01"`
returns nothing. VIS-01 is this task's label for the illustration workstream, not an
existing artifact.

---

## 3. Live corpus measurement

| Measure | Count |
|---|---:|
| Lesson JSON files | 1,701 |
| Lessons declaring ≥1 figure | 1,701 |
| **Total declared placements** | **3,816** |
| Distinct figure ids used by lessons | 1,819 |
| Registered figure ids available | 1,871 |
| **Placements that render** | **2,738** (71.8%) |
| **Placements withheld** | **1,078** (28.2%) |
| Placements whose id is not registered | **0** |
| Placements whose id resolves to no component | **0** |

Every number above matches S233 exactly. **1,078 is not stale.**

### Withheld, broken down by cause

| Cause | Rows | Share |
|---|---:|---:|
| `WITHHELD_FIXED_EXEMPLAR_TEXT_GUARD` | 942 | 87.4% |
| `WITHHELD_BLOCKLIST_FINGERPRINT` | 136 | 12.6% |
| Unregistered / absent asset | 0 | 0% |

### Top causes by row count (single figure ids)

| Figure | Withheld rows | What the SVG actually hard-codes |
|---|---:|---|
| `count-on-hops` | **793** | number line 0–10, dot on 4, three hops to 7, caption `4 + 3 = 7` |
| `bar-compare` | **84** | bars of 9 and 5, captions `4 more` and `9 − 5 = 4` |
| `number-track` | **65** | track 18…24, caption `keep counting: 20, 21, 22, 23, 24…` |
| 88 other ids (blocklist tail) | 136 | various |

Those three account for 942 rows — 87.4% of the whole backlog. They are three legacy
figures that were reused as generic decoration across hundreds of unrelated lessons.

### Spread

- Withheld placements span **88 courses**, **592 lessons**, **91 distinct figure ids**.
- **484 lessons have zero figures rendering** — every placement they declare is withheld.
- Fixed-exemplar figures are placed 954 times; 12 render truthfully, 942 do not.
- Blocklist staleness: **0 of 136** entries are orphaned. Every fingerprint still matches a
  live placement, so no figure has silently un-blocked through a prose edit.

---

## 4. Hand-check — 25 rows read against source

Sampling was deterministic (every *n*th row within each stratum), not cherry-picked.
For each row I read the lesson JSON and the figure's SVG component source. I also verified
the CSV body text against raw JSON for four rows — all matched exactly.

### Stratum A — fixed-exemplar guard (942 rows): **11 / 11 true positives**

| Lesson | Step | Figure | Body is about | Verdict |
|---|---|---|---|---|
| `koa-01-01` | steps.0 | count-on-hops | counting *all* of two joined groups | TP — figure shows count-*on* from 4 |
| `g1a-03-01` | steps.0 | count-on-hops | what makes a strategy valid (meta) | TP |
| `g1e-01-03` | steps.3 | count-on-hops | balancing a side with a blank | TP |
| `g3f-03-04` | steps.3 | count-on-hops | numerator / denominator | TP — fractions vs whole-number line |
| `g4v-03-04` | steps.3 | count-on-hops | where the crossing sits on a bar | TP |
| `g1p-02-03` | steps.3 | count-on-hops | near-doubles | TP — depicts count-on, the strategy being replaced |
| `dgr1-01-01` | steps.0 | bar-compare | writing a survey question | TP |
| `df3-01-03` | steps.0 | bar-compare | dividing by 4 and 5 | TP — figure is subtraction |
| `mf3-01-05` | steps.0 | bar-compare | ×10 place shift | TP |
| `c120-05-01` | steps.0 | number-track | "After 45 comes 46; before 45 is 44" | TP — right concept, track shows 18–24 |
| `k100-03-06` | steps.0 | number-track | hundred-chart with blank squares | TP — figure is a linear track |

**Corroborated mechanically beyond the sample.** Of the 793 withheld `count-on-hops` rows,
only 35 (4.4%) mention both 4 and 3 at all. Of 84 `bar-compare` rows, 1 mentions both 9 and 5.
Of 65 `number-track` rows, 6 mention any number in 18–24. The figures print fixed sums; the
prose overwhelmingly does not contain them. This stratum is genuinely mismatched.

### Stratum B — blocklist fingerprint (136 rows): **4 / 14 true positives** (+1 borderline)

True positives:

| Lesson | Step | Figure | The actual contradiction |
|---|---|---|---|
| `pv1000-02-01` | steps.0 | skip-count-line | Prose: skip by **tens**, "hundreds digit stays put". Figure: skip by **hundreds**, "only the hundreds digit changes." Direct conflict. |
| `dop-05-03` | steps.0 | dop-count-places | Prose: division, "point comes **straight up**". Figure: multiplication, "1 place + 1 place = 2 places". Opposing rules. |
| `la-04-02` | steps.3 | la-symmetry-regular | Prose: "a rectangle has only **2**" lines. Figure asserts "square: 4". A square is a rectangle. |
| `rno-04-02` | steps.0 | integer-jump | Prose: −2.5 + 1.75 = −0.75. Figure: −4 + 9 = 5. Different values *and* opposite sign of result. |

Borderline: `dg4-02-02` steps.3 (`dpv-hundredths-grid`) — prose says "four full columns hold
40 cells", figure shades one column. Real count disagreement, but the figure is a unit
legend rather than a worked example, and the same figure renders on steps.0.

False positives — the figure is correct, on-topic, and non-contradictory:

| Lesson | Step | Figure | Why the flag is wrong |
|---|---|---|---|
| `as100-03-04` | steps.3 | as100-break-ten | Lesson is titled **"Break a Ten"**; figure is captioned "1 ten → 10 ones". Exactly the topic. |
| `as-04-01` | steps.3 | as-fact-family | Prose: "same three numbers, four ways". Figure: the 6/7/13 fact family, four ways. Perfect. |
| `mult-03-01` | steps.0 | mult3-double | Prose: "6 × 2 is 6 + 6". Figure: "2 × 5 = 5 doubled = 10". Same rule, different example. |
| `dpv-02-03` | steps.0 | dpv-words | Prose: 0.375 → thousandths. Figure: 0.47 → hundredths. Both true, no conflict. |
| `fr-03-03` | steps.0 | frac-whole-disguise | Prose: n/n = 1. Figure: 4/4 = 1 whole. An instance of the claim. |
| `in-05-01` | steps.4 | dr-chain-gears | Lesson is **"Undoing the Chain Rule"**; figure is the chain-rule gears. |
| `dc-02-03` | steps.4 | dr-chain-gears | Related rates; chain rule is the mechanism. |
| `mb-04-02` | steps.3 | dop-long-division | Division lesson, division figure. Same figure renders on steps.0. |
| `rt-03-02` | steps.2 | sohcahtoa-triangle | Figure supplies the ratio definitions the prose invokes; different triangle numbers only. |

**The structural tell.** The blocklist is a fingerprint of `(figureId, exact body text)`, so
it suppresses one step's prose rather than a figure/lesson relationship. In **5 of the 6**
lessons I examined closely, the *same figure id* appears twice in the *same lesson* — one
instance renders, the other is blocked:

```
mb-04-02   steps.0 dop-long-division RENDERS   |  steps.3 dop-long-division BLOCKED
dc-02-03   steps.0 dr-chain-gears    RENDERS   |  steps.4 dr-chain-gears    BLOCKED
in-05-01   steps.0 dr-chain-gears    RENDERS   |  steps.4 dr-chain-gears    BLOCKED
dg4-02-02  steps.0 dpv-hundredths-grid RENDERS |  steps.3 dpv-hundredths-grid BLOCKED
mult-03-01 steps.3 mult3-double      RENDERS   |  steps.0 mult3-double      BLOCKED
```

If the figure genuinely belonged to a different concept, both instances would be wrong. The
split shows the guard is keying on incidental prose numbers, which is why this stratum
carries most of the false positives.

### Hit rate

| Stratum | Checked | True positives | Rate |
|---|---:|---:|---:|
| Fixed-exemplar guard | 11 | 11 | **100%** |
| Blocklist fingerprint | 14 | 4 (+1 borderline) | **29%** (36% with borderline) |
| **Overall** | **25** | **15** | **60%** |

### A false positive in my own detector, found by hand-checking

My first pass reported that `cr-linear-vs-quadratic` was in `FIGURE_IDS` but absent from the
`FIGURES` record — which would render an empty shell. I checked it by reading the file: the
component exists at `figures.tsx:27735` and is registered at line 29655 as the **last** entry,
with no trailing comma. My extraction regex required one. The defect was mine, not the
repo's. Corrected: **0 placements have a missing asset**, and S233's "1,871/1,871 render"
claim holds.

---

## 5. Corrected estimate

| Quantity | Value |
|---|---:|
| Withheld placements (mechanical, exact) | **1,078** |
| Estimated genuinely mismatched | **~981** |
| Estimated over-suppressed (correct figures hidden) | **~95–100** |

Derivation: 942 × ~1.00 (fixed exemplar) + 136 × ~0.29 (blocklist) ≈ 981. The blocklist term
rests on n=14, so its 95% interval is wide — roughly 11 to 79 genuine out of 136. The
fixed-exemplar term is solid: 11/11 by hand plus the corpus-wide number-presence check.

Practical reading: **the backlog is real and it is dominated by three figures.** Re-pointing
`count-on-hops`, `bar-compare`, and `number-track` (or authoring concept-specific
replacements for them) addresses 942 of 1,078 rows — 87.4%. The 136-row blocklist tail is
where the false positives concentrate and deserves per-row review before any work is
scheduled against it.

---

## 6. What I did NOT measure

1. **Nothing was rendered.** No browser, no screenshots, no DOM. Every judgment compares SVG
   source and the accessible `<title>` against body prose. A figure could still look wrong
   in ways source reading cannot reveal.
2. **The 2,738 rendering placements were not audited.** Zero hand-checks came from that set.
   S233 makes the same disclaimer. There is no evidence here that what currently renders is
   correct — only that it is not caught by the two guards.
3. **Mismatch is a judgment, and it was mine alone.** No second reviewer, no rubric applied
   by anyone else. The false-positive calls in Stratum B are the softest numbers in this
   report; a subject-matter reviewer could reasonably rate `dg4-02-02`, `rt-03-02`, and
   `fr-03-03` differently.
4. **Stratum B sample is small.** 14 of 136 rows (10%). The 29% rate should be treated as
   directional, not precise.
5. **Accessible-description quality was not assessed** beyond reading `<title>` for the
   figures I sampled. No parity sweep across all 1,871 figures.
6. **Widget / manipulative visuals were not measured at all.** Only the static `figure`
   registry. The variant and widget engines are a separate visual system with separate
   failure modes.
7. **No figure references outside lesson JSON** (course-level, unit-level, marketing,
   teacher/admin surfaces) were searched.
8. **Remedial reachability was not modeled.** The 114 remedial placements are counted as
   declared placements, but they only appear when a learner triggers remediation, so their
   real-world impression count is lower than their row count implies.
9. **No frequency weighting.** Rows are counted equally; the queue CSV carries a `frequency`
   column that was not used to weight learner impact.
10. **Git history was not mined** to determine when placements were introduced or whether
    the corpus has changed since S233 — only that today's counts match S233's exactly.
