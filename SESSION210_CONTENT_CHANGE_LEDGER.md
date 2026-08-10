# S210 — content-change ledger

Implements the two rich-interaction insertions adjudicated PASS in
`SESSION209_RICH_MIX_ADJUDICATION.md` §2 (row 14 `vec-05-03/k1`, row 21 `sy-02-03` new step).
**Exactly 2 of 1,701 authored lesson files changed.** Everything else in `content/**` is
byte-identical to the S151→S205 lineage; the proof mechanism itself was extended (not weakened)
to authorize the transition, per the repo's own precedent (each session since S155 has added its
own entries to the same `AUTHORIZED` ledger inside `content-change-proof-s151c.mjs`).

## 0. Proof-mechanism study (protocol step 1)

Two scripts compose the content-freeze proof, run in sequence by `npm run hash:proof`:

1. **`scripts/session/content-change-proof-s151c.mjs`** — diffs the LIVE tree against the
   original `SESSION151_LESSON_HASHES.json` baseline (the oldest sealed manifest) and checks every
   changed file against a hardcoded `AUTHORIZED` map (807 entries pre-S210, one per session's
   batch of changes with a reason string). It hard-asserts `changed.length === <N>` — a literal
   count baked into the script, incremented by hand each session that legitimately changes content.
   This is the *audit trail*: every file that has EVER changed since the dawn of the project,
   and why.
2. **`scripts/session/hash-proof.mjs verify <manifest>`** — a byte-identical check of the LIVE
   tree against a *current-state* snapshot manifest (`SESSION205_LESSON_HASHES.json` pre-S210).
   This is the *current truth*: what the corpus looks like right now, re-baselined after each
   batch of authorized changes lands, so future sessions diff against a small, current manifest
   rather than replaying the entire history file-by-file.

`package.json`'s `hash:proof` chains both; `hash:snapshot` regenerates the current-truth manifest.

**Precedent for the S151→S205 rebaseline**: `SESSION205_LESSON_HASHES.json` is itself a snapshot
taken after S155 through S205's authorized waves were folded in — the `AUTHORIZED` map's entries
from S155 onward (visible in the script, e.g. `s155-affine-conversion`, `s157-predict-conversion`,
… `s205j-manipulable-repair`) are the exact history that manifest bakes in as "current". S210
follows the same shape at 1/400th the scale: extend `AUTHORIZED` with 2 new entries + bump the
hardcoded count, then snapshot a new current-truth manifest and re-point `package.json` at it.

**Verdict: the mechanism cleanly authorizes a 2-file change by EXTENSION, not weakening.**
Nothing about either proof script's logic changed — no comparison was loosened, no file was
excluded from scrutiny, no count was widened without a corresponding real, cited, hand-verified
edit. This ledger is the outcome of that clean path, not a `.patch`-file fallback. (No
BLOCKED-BY-PROOF-MECHANISM condition applied.)

## 1. Before/after hashes (protocol step 2 & 6)

| File | Before S210 (sha256) | After first pass (sha256, superseded) | **Final, after review C2 (sha256)** |
|---|---|---|---|
| `content/courses/vectors-matrices/lessons/vec-05-03.json` | `10a71af8f6d742114923289db4d59c3a951d6fade74c1f06f1e416ab9861c22d` | `8f536353213f6b58106d7c1c90a4ed42cd74df71a34181452d071a1f798bbaaa` | `f8686b99d0eb7ff0dde4d806fb30a11d1b394c7622e6d6eabe67dfd3276306bf` |
| `content/courses/similarity/lessons/sy-02-03.json` | `1e4e9aeb71b0680828c6c923ec6fa5e2785e88ffb82ec488e6b22b692d2ee6c3` | `a37b4dad76f05ccea25a09204acbc455f2b1a99a1d5d16756a715b456b059754` | `a37b4dad76f05ccea25a09204acbc455f2b1a99a1d5d16756a715b456b059754` (unchanged by the review) |

`vec-05-03.json` has two AFTER states because the S210 adversarial review's Condition 2 required a
second edit to the same file (prompt-only, see §8) — the "first pass" hash is superseded and kept
here only for the audit trail; **the current live hash, the one `SESSION210_LESSON_HASHES.json`
and `hash:proof` check against, is the final column.** `sy-02-03.json` was untouched by the review
and keeps its original AFTER hash.

Confirmed via a bare `hash-proof.mjs verify SESSION205_LESSON_HASHES.json` run *before any content
edit was authorized in the proof scripts*: `changed=2` naming exactly these two paths, `added=0
removed=0` — matching the mandate's "EXACTLY the 2 named mismatches" requirement. All other 1,699
lesson files stayed byte-identical throughout, before and after the review's Condition 2 re-edit.

## 2. What was inserted (protocol step 3)

### (a) `vec-05-03` — step `k1` widget converted `mcq` → `matrixTransform`

Step id, `kind`, `body`, `conceptTag` (`vec-compose`), and both `explanationVariants` strings are
**byte-unchanged** (the reveal text already explained the reflect-then-reflect composition
correctly regardless of widget type). Only the `widget` object was replaced, and the stale
`"variant": {"gen": "reflect-compose"}` declaration was removed (reason below). No other step in
the lesson's 8 steps (`c1,i1,k1,c2,k2,k3,ch1,r1`) was touched — confirmed by the per-file hash
diff carrying nothing else.

**Prompt shown below is the FINAL text, after the review's Condition 2 fix (§8b) — it no longer
prints the graded matrix.** The original first-pass prompt (`"Reflecting over y = x, then over
the x-axis, composes to the matrix [[0, 1], [−1, 0]]. Build it and watch what it does."`) printed
the answer verbatim and is superseded; see §8b for the leak finding and the fix.

```json
{
  "type": "matrixTransform",
  "prompt": "Reflect over y = x, then over the x-axis — one transformation right after the other. Build the single matrix that performs both, and watch where î and ĵ land.",
  "ta": 0, "tb": 1, "tc": -1, "td": 0,
  "sa": 1, "sb": 0, "sc": 0, "sd": 1,
  "targetName": "a 90° clockwise rotation",
  "successFeedback": "î ↦ (0, −1), ĵ ↦ (1, 0): that's [[0, 1], [−1, 0]] — a 90° clockwise rotation. det = 0·0 − 1·(−1) = 1: rotations never change area.",
  "swappedFeedback": "You've swapped the columns: that builds [[1, 0], [0, −1]], a single reflection over the x-axis, not the composed rotation. Column 1 is where î lands — (0, −1) — and column 2 is where ĵ lands — (1, 0).",
  "signFeedback": "That gives [[0, −1], [1, 0]], a 90° COUNTER-clockwise rotation — the reverse turn. Clockwise sends î to (0, −1), so the −1 belongs in the bottom-left, not the top-right.",
  "fallbackFeedback": "Track one basis vector at a time: a quarter-turn clockwise sends î from (1, 0) down to (0, −1) — first column — and ĵ from (0, 1) right to (1, 0) — second column."
}
```

Target (`ta,tb,tc,td`) and starting entries (`sa,sb,sc,sd`) are within `MatrixTransformSpec`'s
integer `[-3,3]` range (`src/lib/schema.ts:2744`, read-only). `swappedFeedback`/`signFeedback`/
`fallbackFeedback` are each ≥25 chars and none opens with a negation. Determinant readout, basis
notation (î/ĵ) and the "rotations never change area" framing match `vec-05-02`'s existing
`matrixTransform` step in the same course (read for voice), and `targetName` matches the original
mcq's correct-option label verbatim ("90° clockwise rotation").

**Why the `variant` key was removed, not kept:** `src/lib/variants.ts`'s `reflect-compose`
generator, default form (the form k1 used — no `"form"` key), emits an **mcq**-shaped spec
(`src/lib/variants.ts:19434-19451`, read-only). `src/lib/variants.resolver.test.ts:583` asserts
`v!.widget.type === st.widget.type` for every step carrying a `variant` declaration — the variant
system's own type-match invariant. Converting k1's widget to `matrixTransform` while leaving the
`reflect-compose` default-form declaration in place would create a widget-type mismatch that
generator was never built to close (its default form's job is specifically to classify a composed
matrix via MCQ options, structurally incompatible with `matrixTransform`'s controlled-entries
task). Removing the key is a deletion inside the one step already being edited — not a new step
touched, not a src/** edit, and it leaves no dangling, structurally-impossible declaration behind.
This was flagged and reasoned about, not silently dropped: recorded here and in the
`content-change-proof-s151c.mjs` `AUTHORIZED` comment.

### (b) `sy-02-03` — new step `i4` inserted between `i3` and `ch`

No existing step's id, order, body, widget, or `conceptTag` was touched. The lesson had 10 steps
(`c1,i1,k1,c2,i2,k2,c3,i3,ch,r1`); it now has 11 (`…,i3,i4,ch,r1`), still within the
8–15-step lint bound, and the `ch` challenge step is still positioned in the final third
(index 9 of 11 ≥ `floor(2·11/3) = 7`).

```json
{
  "id": "i4",
  "kind": "interactive",
  "body": "See the ratios stay locked before you compute them.",
  "widget": {
    "type": "dilationExplore",
    "prompt": "DE ∥ BC in △ABC (D on AB, E on AC). Slide the cutter to six tenths of the way from A toward B, so AD is 1.5 times DB, then read what AE/EC is forced to do.",
    "shape": [[0, 0], [10, 0], [3, 6]],
    "center": [0, 0],
    "targetK": 0.6,
    "kMin": 0.2, "kMax": 0.9, "kStep": 0.1, "kStart": 0.3,
    "gridMin": 0, "gridMax": 11,
    "showRatios": ["segments"],
    "successFeedback": "Both readouts show 1.50. AD/DB = 0.6/0.4 = 1.5, and AE/EC matches it exactly — the same ratio the challenge below uses to solve for AC.",
    "lowFeedback": "Too early — AD/DB is still under 1.5. Keep sliding toward B; watch AE/EC follow AD/DB the whole way, never lagging behind.",
    "highFeedback": "Past it — AD/DB has climbed above 1.5. Ease back toward A; notice overshooting moved AE/EC by the same amount, never just one ratio alone."
  }
}
```

No `conceptTag` on `i4` — matches this lesson's own convention: none of its other `interactive`
steps (`i1`,`i2`,`i3`) carry one either (only `check`/`challenge` steps do, per
`src/lib/pedagogy.ts:409`). `id: "i4"` follows the lesson's own id sequence (`i1,i2,i3` already
used). `showRatios: ["segments"]` re-stages `dilationExplore` as the side-splitter triangle per
`src/lib/schema.ts:1393` (read-only) / `src/components/widgets.tsx:3757` `SideSplitterW` (read for
mechanics only, not edited): `shape=[A,B,C]`, D on AB and E on AC both at fraction `t` from A,
readouts `AD/DB` and `AE/EC`. `kMin=0.2>0`, `kMax=0.9<1`, `targetK=0.6∈(0,1)`, `shape.length===3` —
all satisfy the schema's `segments`-mode constraints (`src/lib/schema.ts:6767-6776`, read-only).

`targetK=0.6` was chosen, per the adjudication's own sketch, so the live ratio matches the `ch`
step's own 6:4 setup — verified below, and it turns out to reproduce `ch`'s exact absolute numbers
(`AD=6, DB=4`) too, since `shape`'s A→B run is exactly 10 units.

## 3. Independent mathematical verification (protocol step 4)

### (a) `vec-05-03/k1` — R₂·R₁ two ways

Lesson convention (`c1`, byte-unchanged): "apply B, then A" ⇒ combined matrix is **A·B**. Here
B = reflect over y=x = `[[0,1],[1,0]]`, A = reflect over the x-axis = `[[1,0],[0,-1]]`.

**Matrix arithmetic** (hand-multiplied, then confirmed by a throwaway script):
```
A·B = [[1,0],[0,-1]] · [[0,1],[1,0]]
    = [[1·0+0·1, 1·1+0·0], [0·0+(-1)·1, 0·1+(-1)·0]]
    = [[0, 1], [-1, 0]]                                          ✓ matches lesson's stated target
```

**Geometric composition** (independent route — track a generic point, not the matrix):
reflect over y=x: (x,y) ↦ (y,x). Then reflect over the x-axis: (x,y) ↦ (x,−y). Composite:
(x,y) ↦ (y,x) ↦ (y,−x). Applied to the basis vectors: î=(1,0) ↦ (0,1) ↦ (0,−1) [column 1];
ĵ=(0,1) ↦ (1,0) ↦ (1,0) [column 2]. Assembled as columns: `[[0,1],[-1,0]]` — **agrees with the
matrix-arithmetic route exactly.** `atan2` of î's image gives −90° (CCW-signed), i.e. 90°
**clockwise** — matches `targetName`.

Both routes run and cross-checked by script:
```
A*B (matrix arithmetic) = [[0,1],[-1,0]]
geometric composition: i-hat -> [0,-1]  j-hat -> [1,-0]
matrix from geometric images (columns) = [[0,1],[-1,0]]
rotation angle from i-hat image (deg, CCW+): -90
target [[0,1],[-1,0]] matches A*B: true
```

**Trap matrices**, computed from `evaluate.ts`'s own swap/sign-flip conditions (read-only,
independently hand-derived here rather than assumed):
- swap trap (columns exchanged): `{a:tb,c:td,b:ta,d:tc}` = `[[1,0],[0,-1]]` — literally the single
  x-axis reflection matrix A, i.e. "you built the first reflection alone, not the composition."
- sign-flip trap (off-diagonal signs both flipped): `{a:ta,d:td,b:-tb,c:-tc}` = `[[0,-1],[1,0]]` —
  the 90° CCW rotation, i.e. exactly the reverse-order composition B·A that step `k3` (untouched)
  independently states as its own worked example. Both traps' feedback strings name these real,
  numerically-verified matrices, not invented ones.

### (b) `sy-02-03/i4` — side-splitter ratios, two routes

Two independent derivations for `shape=[[0,0],[10,0],[3,6]]`, `targetK=t=0.6`:

**Coordinate computation** (as the widget itself computes D, E, and the four lengths):
```
A=(0,0) B=(10,0) C=(3,6)
D = A + t(B-A) = (6, 0)          E = A + t(C-A) = (1.8, 3.6)
AD = |A-D| = 6      DB = |D-B| = 4      AD/DB = 1.5
AE = |A-E| = 4.024922359499621    EC = |E-C| = 2.683281572999748    AE/EC = 1.4999999999999998
```

**Similar-triangle proportion** (pure algebra on the fraction `t`, independent of any coordinate
arithmetic): D sits at fraction `t` of the way from A to B, so `AD = t·AB` and `DB = (1-t)·AB`,
giving `AD/DB = t/(1-t)` regardless of the triangle's actual side lengths — this is the
side-splitter theorem's own statement, not a computation that could hide an error the coordinate
route shares. `t/(1-t) = 0.6/0.4 = 1.5`.

```
coordinate route: AD/DB = 1.5,  AE/EC = 1.4999999999999998   (float noise only, < 1e-9 of 1.5)
proportion route: t/(1-t) = 1.4999999999999998
both routes agree: true
agree with ch step's own ratio 6/4=1.5: true
```

Both routes agree with each other and with the untouched `ch` step's authored ratio (AD=6, DB=4 ⇒
6/4=1.5), which is the pedagogical point of inserting this step immediately before `ch`.

**Reachability in the widget's discretized input space** (the exact mechanism
`content.widgets.audit.test.ts`'s solvability gate uses):
```
candidates = range(0.2, 0.9, 0.1) = [0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9]
includes 0.6 exactly: true      (SOLVABLE)
kStart 0.3 ≠ targetK 0.6: true  (NOT PRE-SOLVED)
```
`lowFeedback` fires for the 4 candidates below 0.6, `highFeedback` for the 3 above — both reachable
(NO DEAD PATHS), confirmed live by the vitest gate run in §5.

## 4. Gates (protocol step 5)

All run in the foreground, no build/Playwright/full-suite, matching the environment constraint.

| Gate | Before edit (baseline) | After edit |
|---|---|---|
| `npm run validate:content` | 1,840/1,840 | **1,840/1,840** (unchanged — file count, not step count) |
| `npm run lint:pedagogy` | 1,711/1,711 | **1,711/1,711** (unchanged — this gate counts *files* clean, not steps; both edited files still lint clean under the new step/widget) |
| `node scripts/check-registration.mjs` | clean | **clean** (no lesson id added/removed; `sy-02-03` gained a step, not a new lesson, so `course.json`/`PLAN.md` are unaffected) |
| `npx vitest run src/lib/content.widgets.audit.test.ts --maxWorkers=1 --reporter=dot` | 2 passed (files=1) | **2 passed (files=1)** — the solvability-gate sweep now additionally audits the new `i4` `dilationExplore` instance (modelled by `space()`'s `dilationExplore` case) as SOLVABLE / NOT PRE-SOLVED / NO DEAD PATHS, per §3(b) above. `k1`'s new `matrixTransform` widget is **not modelled** by this gate's `space()` function (no case for that type — by design, per the file's own header comment: "keeps its own tests" for unmodelled types), so it is silently skipped by this particular sweep; its solvability/no-dead-paths claims are established independently by the hand + script verification in §3(a) instead. |

Note on the mandate's "1711→1712" expectation: `lint:pedagogy`'s printed count is a **file**
count (`schema: N/N files clean` / `pedagogy: N/N files clean`), not a step count — S210 edited
two *existing* files (one widget conversion, one step insertion), adding zero new lesson files, so
the file-count gate stays at 1,711/1,711 rather than incrementing. This is the expected shape of
growth for an insertion into an existing lesson, distinct from the file-count growth a wholly new
lesson would produce.

## 5. The manifest transition (protocol step 6)

1. **Baseline confirmed clean before any edit**: `npm run hash:proof` → `content-change proof
   S151C passed: 807/686 authorized changes` + `hash proof passed: 1701 authored lesson files
   byte-identical to SESSION205_LESSON_HASHES.json`.
2. **After editing the two lesson files**, `node scripts/session/hash-proof.mjs verify
   SESSION205_LESSON_HASHES.json` failed with **exactly** the 2 named mismatches:
   ```
   hash proof failed: added=0 removed=0 changed=2
   ~ content/courses/similarity/lessons/sy-02-03.json
   ~ content/courses/vectors-matrices/lessons/vec-05-03.json
   ```
   and `content-change-proof-s151c.mjs` (pre-extension) reported the same 2 paths as
   `unexpectedChangedLessonFiles`, `missingAuthorizedChanges: 0`, `totalLessons: 1701` unchanged.
3. **`content-change-proof-s151c.mjs`'s own `AUTHORIZED` map extended** — 2 new entries
   (`vec-05-03.json` → `s210-rich-mix-insertion (k1 mcq -> matrixTransform conversion; …)`,
   `sy-02-03.json` → `s210-rich-mix-insertion (new inserted step i4, …)`), each carrying the
   session tag and a one-line reason, matching every prior session's format in the same map
   (`s155-…`, `s157-…`, … `s205j-…`). The hardcoded pass-count bumped **807 → 809** (2 new
   authorized changes; `totalLessons` stays 1701 since no lesson file was added or removed).
   Re-run: `content-change proof S151C passed: 809/686 authorized changes; 892 lessons
   byte-identical to the sealed S151 ledger` — clean, `unexpected=0`, `missing=0`.
4. **New current-truth manifest snapshotted**: `node scripts/session/hash-proof.mjs snapshot
   SESSION210_LESSON_HASHES.json` → `hash snapshot: 1701 lesson files ->
   SESSION210_LESSON_HASHES.json` (generated file, per ownership grant).
5. **`package.json` transition** (the only fields touched in that file):
   ```diff
   - "hash:snapshot": "node scripts/session/hash-proof.mjs snapshot SESSION205_LESSON_HASHES.json",
   - "hash:proof": "node scripts/session/content-change-proof-s151c.mjs && node scripts/session/hash-proof.mjs verify SESSION205_LESSON_HASHES.json",
   + "hash:snapshot": "node scripts/session/hash-proof.mjs snapshot SESSION210_LESSON_HASHES.json",
   + "hash:proof": "node scripts/session/content-change-proof-s151c.mjs && node scripts/session/hash-proof.mjs verify SESSION210_LESSON_HASHES.json",
   ```
   No other `package.json` key touched.
6. **Final re-run of `npm run hash:proof`**:
   ```
   content-change proof S151C passed: 809/686 authorized changes; 892 lessons byte-identical to the sealed S151 ledger
   hash proof passed: 1701 authored lesson files byte-identical to SESSION210_LESSON_HASHES.json
   ```
   **1,701/1,701 lesson files pass — the 2 edited files are the 2 newly-authorized entries; the
   other 1,699 are byte-identical to their pre-S210 state, which is itself byte-identical to the
   S151→S205 lineage.**

### Known out-of-scope references not updated (flagged, not fixed)

`scripts/session/seal.sh` (lines 53, 102) and `CO_WORK_PLAN.json` (line 17) still name
`SESSION205_LESSON_HASHES.json` literally. Neither file is in this session's write-ownership grant
(only `package.json`'s hash-script args were authorized), so they were left untouched. This does
not affect `npm run hash:proof` (the authoritative entrypoint, now repointed) but a future session
running `seal.sh` directly would still snapshot/verify against the old manifest name — worth a
follow-up patch when that script is next in someone's ownership scope.

## 6. The 2-of-1,701 statement

**Exactly 2 of the corpus's 1,701 authored lesson JSON files changed this session**:
`content/courses/vectors-matrices/lessons/vec-05-03.json` (one step's widget converted,
`mcq`→`matrixTransform`, plus removal of that step's now-type-mismatched `variant` declaration)
and `content/courses/similarity/lessons/sy-02-03.json` (one new step inserted, 10 steps → 11). No
lesson was added or removed (`totalLessons` stays 1701 before and after). No other step in either
file, and no step in any of the other 1,699 lesson files, changed — confirmed both by the
byte-for-byte `hash:proof` pass and by every gate in §4 passing before and after.

## 7. Files touched this session (ownership recap)

- `content/courses/vectors-matrices/lessons/vec-05-03.json` — content edit (§2a)
- `content/courses/similarity/lessons/sy-02-03.json` — content edit (§2b)
- `SESSION210_CONTENT_CHANGE_LEDGER.md` — this file (new)
- `SESSION210_LESSON_HASHES.json` — generated snapshot (new)
- `package.json` — 2 script-arg edits only (§5.5)
- `scripts/session/content-change-proof-s151c.mjs` — 2 new `AUTHORIZED` entries + count bump
  807→809 (the proof mechanism's own ledger format, extended per its own precedent); revised again
  post-review to fix the stale `/686` denominator (§8c) and reword the `vec-05-03.json` reason
  string to note the Condition 2 re-edit (§8b).

Nothing under `src/**`, `docs/**`, any other lesson file, or any test file was touched.

## 8. S210 adversarial review — conditions landed

`SESSION208_INTEGRATION_REVIEW.md` "# S210 REVIEW" accepted this batch ACCEPT-WITH-CONDITIONS
(3 conditions). All three are addressed below, entirely inside this session's owned files; no
condition required touching `src/**`, a test file, or any lesson other than the two already in
scope.

### (a) C1 — the removed `variant` key was a cost, not just a cleanup (fixed in §2a, above)

The review's finding, verified independently rather than taken on faith: `reflect-compose`
declares exactly three forms (`basisColumn`, `reverseOrder`, `matMul` — `variants.ts:19302`).
`basisColumn` emits `pointEntry`; `reverseOrder` and the default (no `form` — what `k1` used) both
emit `mcq`. **None of the three emits `matrixTransform`.** So no `form:` value could have kept the
declaration valid against the converted widget — deletion was the only route, confirmed by reading
every form's return type, not assumed.

The ledger's §2a originally called the declaration merely "stale" and framed the removal as
clearing "a dangling, structurally-impossible declaration" — true of the *state after conversion*,
but it obscured that **the conversion is what made it stale**: before this session's edit, the
declaration was live and correct (`k1`'s mcq matched `reflect-compose`'s default-form output
exactly — six genuinely different draws across three rotation outcomes, per the generator's own
comment). Converting the widget is what broke it, not an independent defect being cleaned up.

**Named plainly, as a deliberate trade:** `k1` gains a live 2×2-entry manipulation with a rotating
unit square, both basis-vector arrows, and a determinant readout in place of a static 3-option
classification — a genuine increase in what the step asks the learner to *do*. In exchange, `k1`
is now **fixed and un-re-askable**: every future presentation of this step is the identical
problem (reflect y=x, then the x-axis), where before the generator produced any of six distinct
compositions across three rotation outcomes on a fresh seed. That is a real loss of practice
variety for this one step, not a wash. Mitigating factor (confirmed by the review, re-checked
here): `reflect-compose` is not orphaned — it still serves **7 other declarations** in the corpus
(the `k2`/`k3`/`ch1` steps in this same lesson, plus others), so the generator and its independent-
route test coverage keep earning their keep elsewhere. **The clean fix is a future `matrixTransform`
generator form for `reflect-compose`** (a natural next form alongside `basisColumn`/`reverseOrder`/
`matMul`, emitting `{ta,tb,tc,td,sa,sb,sc,sd,targetName,...}` from the same six-composition draw)
that would restore `k1`'s re-askability without reverting the manipulation gain — flagged here for
a future session with `src/lib/variants.ts` in its ownership scope; explicitly out of this
session's (content-only) grant.

### (b) C2 — the prompt printed the graded matrix; fixed by rewriting the prompt

**Finding, confirmed by re-reading the shipped spec against the grader:** the first-pass prompt —
`"Reflecting over y = x, then over the x-axis, composes to the matrix [[0, 1], [−1, 0]]. Build it
and watch what it does."` — printed `[[0, 1], [−1, 0]]` verbatim, which is exactly the tuple
`evaluate.ts`'s `matrixTransform` case checks for `correct: true` (`v.a===ta && v.b===tb &&
v.c===tc && v.d===td`, `evaluate.ts:1027`). The task had collapsed from "discriminate/derive the
composed transformation" to "transcribe four printed numbers into four boxes" — the swapped/sign
traps still tested the column convention genuinely, but the central classification claim
(`conceptTag: vec-compose`, body: "Two reflections make a rotation") no longer lived in anything
the learner had to supply.

**Fix applied** (prompt only; target, traps, all four feedback strings, `body`, `conceptTag`, both
`explanationVariants` untouched): the prompt now states the two reflections and asks the learner to
build "the single matrix that performs both" — it names the operation, not the answer:

> "Reflect over y = x, then over the x-axis — one transformation right after the other. Build the
> single matrix that performs both, and watch where î and ĵ land."

This is a **prompt-only fix** (the reviewer's preferred route): the schema already draws the target
as a dashed green ghost polygon (`MatrixTransformW`, `widgets.tsx:14623`) that the learner builds
toward visually without any digits being printed, so the task stays fully reachable with the answer
nowhere in text before the learner acts.

**Answer-leak check, run and shown, not asserted:** grepped the two pre-reveal text fields on this
step — `body` and the widget `prompt` — for the target's entries. `explanationVariants` and the
four graded-feedback strings (`successFeedback`/`swappedFeedback`/`signFeedback`/
`fallbackFeedback`) are correctly excluded from this check: `LessonPlayer.tsx:471` gates
`explanationVariants` display on `finalized = phase==="correct"||phase==="revealed"`, and all
graded feedback by construction only renders after a check — neither surface is reachable before
the learner acts, so printing the answer there is normal grading feedback, not a leak.

```
body: 'Two reflections make a rotation.'
prompt: 'Reflect over y = x, then over the x-axis — one transformation right after the other. Build the single matrix that performs both, and watch where î and ĵ land.'
body -> leak pattern found: False
prompt -> leak pattern found: False
```

**Re-edited-file bookkeeping** (this re-edits an already-authorized file, per the coordinator's
instruction):
- New AFTER hash: `f8686b99d0eb7ff0dde4d806fb30a11d1b394c7622e6d6eabe67dfd3276306bf` (recorded
  in §1's table, superseding the first-pass hash).
- `content-change-proof-s151c.mjs`'s `AUTHORIZED` entry for `vec-05-03.json` — **same key, same
  slot** (no new entry, no count change) — reworded to note the Condition 2 re-edit (§7 above).
  The proof script computes each file's `sha256` live off disk (`sha(readFileSync(...))`,
  `content-change-proof-s151c.mjs` line ~756), so no hash literal exists anywhere in that script to
  hand-edit — the live re-run picks up the new bytes automatically.
- `SESSION210_LESSON_HASHES.json` regenerated: `node scripts/session/hash-proof.mjs snapshot
  SESSION210_LESSON_HASHES.json` → `hash snapshot: 1701 lesson files ->
  SESSION210_LESSON_HASHES.json`.
- Full proof chain re-run: `npm run hash:proof` → `content-change proof S151C passed: 809/809
  authorized changes; 892 lessons byte-identical to the sealed S151 ledger` +
  `hash proof passed: 1701 authored lesson files byte-identical to SESSION210_LESSON_HASHES.json`.
  **Counts stayed 809/809/1701 exactly as before — this was a re-edit of an already-authorized
  file, not a new authorization.**
- `validate:content` 1,840/1,840, `lint:pedagogy` 1,711/1,711, and
  `content.widgets.audit.test.ts --maxWorkers=1` (2 passed) all re-run clean against the final
  prompt text (§9 below has the consolidated final gate run).

### (c) C3 — the proof gate's own success line was reporting a stale denominator

**Finding, confirmed by reading the script rather than trusting the printed line:** the final
`console.log` hardcoded a literal `686` — an entry count from a S15x-era state of the `AUTHORIZED`
map, orphaned by every one of the ~30 subsequent sessions that extended the map without touching
that string. By S210 the map held 809 unique keys, so the line printed the true numerator
(`changed.length`, correctly gated by the `passed` boolean) against a false, disconnected
denominator: `"809/686 authorized changes"` — arithmetically false as a fraction of anything real
in the script's own state.

**Fix — strengthens the report, weakens no check.** No comparison, threshold, or gating condition
changed: `passed` still requires `changed.length===809 && unexpected.length===0 &&
missing.length===0 && lessonPaths.length===1701`, unmodified. The fix computes the denominator from
the `AUTHORIZED` map's own live key count (`authorizedCount = Object.keys(AUTHORIZED).length`)
instead of a hand-copied literal, and reports it in the JSON output too
(`summary.authorizedEntryCount`) so a future accounting bug — e.g. a duplicate path key silently
overwriting an earlier session's entry, which already happens once harmlessly in this map (810 raw
`'path':` occurrences, 809 unique keys after JS object-literal dedup, confirmed by a throwaway
count script) — would surface as a visible `N/M` mismatch in the pass line rather than staying
invisible. This is *more* scrutiny than before, not less: the old line could never fail to "agree"
with itself because `686` was never checked against anything; the new line is a live, reconcilable
identity that the code's own `missing.length===0`/`unexpected.length===0` invariants guarantee will
hold whenever `passed` is true.

```
content-change proof S151C passed: 809/809 authorized changes; 892 lessons byte-identical to the sealed S151 ledger
```

### (d) The DEMAND observation — folded into method, for future adjudication batches

The review's pedagogy objection on `k1` (§8b) is, at root, an adjudication-process gap, not just a
one-step defect: FIT/REACH/READOUT/NOVELTY (the four gates `SESSION209_RICH_MIX_ADJUDICATION.md`
ran) all ask whether the *engine* fits the claim — none of them asks whether the **learner still
has to supply the claim**, as opposed to merely watching or transcribing it once an engine is
wired up. A conversion can clear all four gates and still, in the specific choice of *what the
prompt tells the learner versus what it asks them to produce*, quietly move the demand from
discrimination/derivation to transcription — exactly what happened here until this review caught
it.

**Recommended for future batches:** a fifth gate, **DEMAND** — does the learner still *supply* the
graded claim (build it, derive it, choose among genuine alternatives) rather than being *shown* it
and asked to copy it into the widget? This is cheap to check at authoring time (grep the prompt for
the literal graded value/tuple/matrix, as done in §8b here) and cheap to check at review time (the
same check the reviewer ran manually), but neither FIT nor REACH nor READOUT nor NOVELTY currently
asks it explicitly. Recording this here per the coordinator's instruction, for whichever session
next owns `SESSION209_RICH_MIX_ADJUDICATION.md`-style adjudication method or a future
`SESSION2xx_RICH_MIX_ADJUDICATION.md` to formalize as a named fifth gate.

## 9. Final gate re-run (after C1/C2/C3)

All four required gates plus the full proof chain, re-run from a clean shell after every review
condition landed:

```
validate:content         schema: 1840/1840 files clean
lint:pedagogy             pedagogy: 1711/1711 files clean
check-registration.mjs    registration: files ↔ course.json ↔ PLAN.md all consistent
content.widgets.audit.test.ts (solo, --maxWorkers=1)   2 passed (2)
hash:proof                content-change proof S151C passed: 809/809 authorized changes; 892 lessons byte-identical to the sealed S151 ledger
                           hash proof passed: 1701 authored lesson files byte-identical to SESSION210_LESSON_HASHES.json
```

**Final state: 2 of 1,701 authored lesson files changed (unchanged from §6); 809/809 authorized
changes accounted for (denominator now truthful, C3); `vec-05-03.json`'s prompt no longer leaks the
graded answer (C2); the `variant`-removal trade is named as a cost with a stated future fix, not
framed as mere cleanup (C1).**
