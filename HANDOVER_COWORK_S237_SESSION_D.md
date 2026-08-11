# HANDOVER — Cowork S237, session D → next Cowork session

Successor to `HANDOVER_COWORK_S237_SESSION_C.md`. **Self-contained**: start here. Session C's file
is still accurate on §2 (non-negotiables), §3 (traps) and §4 (lessons) — re-read those three, they
are unchanged and they still cost sessions time.

---

## 0. Bootstrap

```bash
git clone https://github.com/ethan556/maggies-trail.git
cd maggies-trail && git checkout cowork/s237
git fetch <bundle> HEAD:refs/heads/incoming && git merge --ff-only incoming   # if a bundle came with this
git merge-base --is-ancestor 4b66fe1 HEAD; echo "ancestry:$?"    # MUST be 0
npm ci
```

**HEAD at end of session D: `628f871`.** The remote was still at `dd00768` at that moment, so the
bundle carries **five** commits (session C's three plus session D's two).

**Check the real remote SHA before claiming a count** — `mcp__Github__list_branches`, then
`git update-ref refs/remotes/origin/cowork/s237 <sha>`. The local tracking ref goes stale the
instant the human pushes.

---

## 1. What session D landed (2 commits)

### `841315b` — the `.bg-sky` WCAG failure, closed WITHOUT moving an instructional colour

The session-C handover recommended darkening `sky` to `#1F5FA8`. **Measuring that fix first showed
it costs more than it repairs, and the recommendation was not followed.** Recorded because the next
session will otherwise re-propose it:

- `sky` is an **instructional** colour (`palette.ts:12`, `ROLE.active`), not a brand accent. 69
  authored lesson steps declare `"addColor": "sky"` as content data; `figures.tsx` uses it 1,972
  times.
- Darkening creates new failures the other way: `text-sky-ink` on `bg-sky/15` drops 4.54 → 4.38
  (9 lines), and 13 dark-mode chrome sites drop 3.23 → 2.12, under the 3:1 non-text threshold.
- The handover's stated reason for hesitating — that `verify:instructional-colors` would catch a
  palette split — is **false**. That script only greps for raw Tailwind palette classes
  (`scripts/verify-instructional-colors.mjs:43`); it never reads a hex.

Instead: `--cta` (`#2069BF`, 5.48:1, identical in both themes, already used at 65 sites including
HeroWidget:140) now backs the 7 chrome buttons and the exactNumberLab candidate **badge**. The
badge's marker stem stays `bg-sky` — the stem is what carries "this is your value".

Gate: `contrast.solidFill.s237.test.tsx`, written for the property (no opaque fill may carry white
text unless its own hex clears 4.5:1), so it fails for any future token below the line.

### `628f871` — four workstreams

**(a) mmt-05-01 lease, 10 steps.** Converted to `graphRead` picture mode — the engine the lessons
already used on their interactive steps. The **shared variant generator set the scope**:
`MmtPictureGraphNumeric` served 9 steps across mmt-05-01, g2g-02-01 and g2g-02-02, and the
surface-parity gate forces them to move together. Closes 7 of the 45 absent-diagram rows plus 2 the
detector had missed. Prompts and traps verbatim; the generator now emits `graphRead` too, so the
graph survives a re-ask.

**(b) 32 manipulative rows → 14 landed, by sequencing.** A companion-widget schema field was
rejected: `variantForStep` is single-surface, so companions would be permanently frozen. 18 rows
did not land, each with a stated reason (2 blocked by a gate that was not weakened, 11 where the
engine cannot represent the check, 5 the CSV itself marks NONE).

**(c) `numeric` live fraction preview, 111 steps.** `previewDenominator` — display-only. Improper
entries draw as **whole bars plus a remainder** (16/3 → five bars and a third), matching
fractionEntry. Ships with the spoken equivalent, which fractionEntry and pointEntry still lack.

**(d) Fractions are shown as fractions.** Learner-reported: `4/12 = 0.333 ✓ equal` — false, since
4/12 is exactly 1/3. Fixed at 6 sites. `terminatingDecimal()` returns **null** rather than a
rounded string, so a caller cannot print an approximation as an equal.

**Ledger repaired.** `content-change-proof-s151c` was RED at HEAD on 23 lesson files earlier
sessions never ledgered. All certified under `retro-ledger-s237` keys naming the commit that made
each change. **866/866, exit 0.**

---

## 2. Gate results at `628f871`

```
typecheck                clean
vitest (2 shards)        13,051 / 13,051      both shards exit 0
validate:content         1840 / 1840
lint:pedagogy            1711 / 1711
validate:native          archive-only findings only
check-registration       consistent
build                    EXIT:0
content-change-proof     866 / 866  ← now passing; was RED before this session
```

**This is your new baseline. If your first run does not match it, that is your problem to solve
before starting new work.**

Trap K fired as always — queue CSV restored to 11,488. `EXCELLENCE_BACKLOG_S126` moved and was
**kept**: manipulative coverage +23 (exactly the 9 graphRead + 14 alongside steps) and the
absent-diagram candidate scan fell 62 → 53, exactly the 9 converted. A measurement, not damage.

---

## 3. What is left, in priority order

### 3.1 Browser verification — the highest-value unknown, and now cheap

Nothing in this repo has been browser-verified since the single page-level axe sweep. **Two things
this session did are unverified in a real browser and should be first:**

1. **Did the `bg-cta` swap actually close the two axe failures?** Re-run axe in both themes.
2. **Is mmt-05-01/ch1's 25-button tap scale usable at 390px?** It runs 0..24 because its authored
   doubling trap is 24. I judged that carrying the trap beats deleting authored feedback, but I
   have not seen it on a phone. If it reads badly, that is a curriculum ruling to bring the user,
   not a silent edit.

```bash
npm run build
npx next start -H 127.0.0.1 -p 3100 &
PW_BASE_URL=http://127.0.0.1:3100 \
PW_CHROMIUM_EXE=/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
  npx playwright test --project=chromium
git status --short          # Trap K's sibling: WAVE04_SCREENSHOTS/
```

Run against `next start`, never `next dev`.

### 3.2 The remaining 31 absent-diagram rows

`COWORK_CACHE/absent-diagram-corrected-s237.md`. Next by shape: `vm-02-02` (4, `dotPlot`),
`exp-04-01` (3, needs triage), `ee-05-02` (3, needs triage), `cx-03-03` (2, `coordinateProofLab`).
**Check the shared variant generator before scoping any of them** — that is what set this session's
scope, and it is lesson 5 in its most expensive form.

### 3.3 The 18 manipulative rows that did not land

2 are blocked by `session197.unlikeFractionsG5.test.ts:122`, which pins the exact step-kind
sequence. Weakening it is not an option; it needs the user's ruling on whether that course's shape
may change. 11 need an engine that does not exist yet — each is named with what it would have to
draw. 5 should stay as they are.

### 3.4 Fraction/decimal consistency — the tail

The renderer is now fraction-first at the 6 sites that asserted a false equality. **Authored
content was audited and is essentially clean** — every non-terminating case already hedges with
`≈` or "About". Two cosmetic inversions remain, where the decimal leads and the fraction follows
(`g5u-03-02.json:38`, and distractor labels in `g5f-02-02`/`g5f-02-03`). Authored prose, so they
need a ruling before touching.

Also carried, not fixed: `fractionEntry` and `pointEntry` previews are `aria-hidden` with **no**
`describeWidgetState` branch. `numeric` now has one; the pattern is in place and the fix is cheap.

### 3.5 Known content defects found and NOT fixed (frozen authored content)

- `dc-02-01/ch1` — two `commonErrors` with the identical value `36` and different feedback. The
  second is unreachable; `evaluate` returns the first match. No current gate compares trap VALUES.
- `scaledCircleLab.fallbackFeedback` is schema-required and unreachable by construction for every
  instance.
- `g2g-02-01`/`g2g-02-02` check prompts read "8 shells pictures", "5 pinecones pictures" — a plural
  noun before "pictures". Authored prose; left alone.
- Two converted rows use a neutral `●` because "pinecones" and "stickers" have no unambiguous
  glyph; shells and apples got 🐚 and 🍎.

---

## 4. Owed housekeeping

`npm run gen:reports` was not run — `FLAGSHIP_TIERS.md` moves one G3–5 lesson B→A as a result of
the manipulative batch. Regenerating it mid-batch would have committed a half-generated report.

---

## 5. Map of `COWORK_CACHE/` — unchanged from session C

Still accurate. `PENDING_WORK_INVENTORY_S237.md` remains the start point, with one correction:
the ILLUSTRATION_REPLACEMENT rows are **not** "missing figures". All 1,078 carry the same
`next_action` — *restoring* — because a wrong figure was bulk-attached to hundreds of unrelated
steps (a Grade-1 "4 + 3 = 7" number line on Grade-5 long division), detected, and suppressed at
render. Learners see empty space. **3,684 of 3,686 figure-bearing steps carry no widget at all**,
so that workstream is static-art authoring on exposition steps — it cannot deliver the
visual-first goal, which is why session D started with `numeric` instead.

---

## 6. Suggested first action

Run the browser matrix (§3.1). It verifies two of this session's changes, it is the standing WP1
exit condition, and it is the only evidence class this repo has never produced.
