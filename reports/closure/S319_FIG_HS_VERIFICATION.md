# S319 — Independent Verification: Figure-Class + HS Contracts Implementation Packets

Reviewer: Claude Cowork independent verifier (S319)
Reviewed: 2026-08-20T13:18:00.000Z

Scope: two Lane A implementation packets, verified against the 8 REVISE-issuing S319 assessment
reports (`S319_ASSESS_CA_DR.md`, `S319_ASSESS_ASV_PQ.md`, `S319_ASSESS_CP_SG.md`,
`S319_ASSESS_SIM_GF.md`, `S319_ASSESS_DIG4_MDF4.md`, `S319_ASSESS_CS_PP.md`,
`S319_ASSESS_FT_PRA.md`, `S319_ASSESS_CN_PF.md`):

- **Figure packet** (`S319_FIGURE_CONTRACTS_IMPLEMENTATION.md` + `laneA-s319-figures.jsonl`, 9
  contracts / 10 lessons): `ca-03-03`, `ca-04-01`, `ca-05-02`, `ca-05-03` (curve-analysis);
  `asv-04-03`, `asv-05-01` (area-surface-volume); `cx-02-02`, `cx-02-03` (coordinate-proofs,
  one moved figure); `sg-03-02` (solid-geometry); `dg4-01-03` (decimals-intro-g4).
- **HS packet** (`S319_HS_CONTRACTS.md` + `laneA-s319-hs.jsonl`, 8 contracts / 8 lessons):
  `co-01-03` (conic-sections); `pp-02-01`, `pp-04-03` (polar-parametric); `ft-05-03`, `ft-05-04`
  (function-transformations); `pra-03-03` (polynomial-rational-analysis); `pf-05-01`
  (polynomial-functions); `sy-05-03` (similarity).

Method: read every contract in each of the 8 REVISE-issuing assess reports in full *before*
reading either implementer packet, formed an independent expectation of the correct fix for each
of the 18 lessons, then read the implementer's claims and `git diff HEAD` for every touched
content/source file and compared byte-for-byte against both my own expectation and the packet's
own claim. Every restated math fact was recomputed by hand from first principles (not copied from
either the contract or the implementation report). Every new/rebound figure binding was checked
two ways: (a) by reading the actual SVG/`<title>`/`aria-label` source in `src/components/figures.tsx`
directly, and (b) by a scratch, independently-authored `npx tsx` probe (not committed to the repo
— this session's mandate is read-only except for the two staging files listed below) that
re-implements the repo's own
`isFigureTextAligned`/`figureTextBindingKey`/`FIGURE_TEXT_MISMATCH_BLOCKLIST` gate and the
adversarial scanner's `risks()` conflict-detection logic from source — run against all 14 figure
bindings the figure packet touched or relied on, not by executing the packet's own committed
vitest file (`src/components/s319Figures.test.tsx`, which was read but not executed). sha256 hashes for all 8 HS-packet before/after edits were independently recomputed
via `git show HEAD:<file> | sha256sum` and compared to `laneA-s319-hs.jsonl`'s own
`sha256Before`/`sha256After` fields. `node scripts/session/print-review-basis.mjs` was run once in
bulk against all 18 lesson IDs for `reviewedBasisHash`. `node scripts/check-registration.mjs` (read
-only) was run and confirmed clean. No `npm`/`vitest`/`tsc` was run, per instructions; no content
file was edited — the only writes are this report and
`reports/closure/cowork-staging/laneV-s319-fig-hs-dispositions.jsonl`.

## Verdict counts

**18/18 lessons signed KEEP, 0 REVISE, 0 ESCALATE.** Every one of the 18 REVISE contracts named
across the 8 source assess reports was correctly, minimally, and truthfully implemented by one of
the two Lane A packets, with no collateral damage found to any ID, `conceptTag`, answer, or
untouched step in any of the 18 files.

| Lesson | Course | Contract | Verdict |
|---|---|---|---|
| ca-03-03 | curve-analysis | CA_DR | KEEP |
| ca-04-01 | curve-analysis | CA_DR | KEEP |
| ca-05-02 | curve-analysis | CA_DR | KEEP |
| ca-05-03 | curve-analysis | CA_DR | KEEP |
| asv-04-03 | area-surface-volume | ASV_PQ | KEEP |
| asv-05-01 | area-surface-volume | ASV_PQ | KEEP |
| cx-02-02 | coordinate-proofs | CP_SG | KEEP |
| cx-02-03 | coordinate-proofs | CP_SG | KEEP |
| sg-03-02 | solid-geometry | CP_SG | KEEP |
| dg4-01-03 | decimals-intro-g4 | DIG4_MDF4 | KEEP |
| co-01-03 | conic-sections | CS_PP | KEEP |
| pp-02-01 | polar-parametric | CS_PP | KEEP |
| pp-04-03 | polar-parametric | FT_PRA | KEEP |
| ft-05-03 | function-transformations | FT_PRA | KEEP |
| ft-05-04 | function-transformations | FT_PRA | KEEP |
| pra-03-03 | polynomial-rational-analysis | FT_PRA | KEEP |
| pf-05-01 | polynomial-functions | CN_PF | KEEP |
| sy-05-03 | similarity | SIM_GF | KEEP |

Non-KEEP reasons: **none** — every lesson passed independent verification.

## Independent probe results (figure packet — 14 bindings)

Run via `npx tsx --tsconfig scripts/audit/tsconfig.figure-ssr.json <scratch probe>.mts` (probe
described in Method above; not retained in the repo):

```
TOTAL=14 FAILURES=0
```

All 14 checked (lessonId, stepId, expectedFigure) bindings independently confirmed: `figureMatch`
(the JSON actually carries the claimed figure id), `isFigureTextAligned=true`, not present in
`FIGURE_TEXT_MISMATCH_BLOCKLIST`, and zero adversarial `risk_reasons` (no `PART_COUNT_CONFLICT`,
`OPERATION_CONFLICT`, or `EXAMPLE_NUMBER_CONFLICT`) from an independently-reimplemented copy of
the adversarial scanner's own conflict logic. `box-layers` (asv-05-01) independently re-rendered
at 72 `<polygon>` elements = 4 layers × 6 cubes/layer × 3 faces/cube = 24 cubes, matching the
lesson's own 2×3×4=24 worked example. `figureIds.ts` independently diffed against `git show
HEAD:...` at the set level: exactly 5 new ids added (`asv-surface-vs-volume`,
`ca-fence-against-wall`, `ca-open-box-setup`, `ca-plus-c-family`, `dpv-tenths-number-line`), zero
removed. `figureNumericClaims.generated.ts` re-checked via `npx tsx
scripts/audit/generate-figure-numeric-claims.mts --check` (read-only check mode): reports "CURRENT
193 exact arithmetic-title claims" — the on-disk generated file is not stale.

## Discrepancies found (non-blocking)

1. **asv-05-01 / `box-layers` cross-lesson collateral risk (investigated, not a new defect).**
   `box-layers` is referenced by exactly two lessons repo-wide: `asv-05-01` (this contract) and
   `content/courses/volume-measurement/lessons/vm-04-01.json` (`c1`, out of scope for all 8
   source contracts). `vm-04-01/c1`'s prose describes a 4-by-3 base, 5 layers, 60 cubes — this
   never matched the figure's *old* 3×2-base/3-layer (18-cube) state, and still does not match
   its *new* 3×2-base/4-layer (24-cube) state. Independently confirmed via a direct probe that
   the repo's own alignment gate returns `isFigureTextAligned=true` for this binding regardless
   (the figure's title carries no `4×3=12`/`12×5=60`-style exact-arithmetic claim, so the
   fixed-numeric-claims check never engages), and the adversarial scanner's `EXAMPLE_NUMBER_CONFLICT`
   check also passes by coincidence (the numerals `3` and `4` appear in both the figure's and the
   lesson's number sets, for unrelated reasons, so the sets are not disjoint). This is a
   **pre-existing, unrelated defect** that this packet did not introduce and was not asked to fix
   (`vm-04-01` appears in none of the 8 source assess reports); it is not newly *falsified* by the
   `asv-05-01` change (it was already wrong on both sides of the edit), so it does not block
   `asv-05-01`'s own KEEP. Flagging for a future, separately-scoped `volume-measurement` review.
2. **Table-column labeling inconsistency in `S319_ASSESS_CS_PP.md` / `S319_ASSESS_FT_PRA.md`.**
   Both reports' per-lesson tables list `ESCALATE` in the **visual-decision** column for
   `pp-02-01` and `pra-03-03` — `pp-02-01` genuinely was a visual/widget-capability ESCALATE (the
   report's own prose confirms this, and it was resolved correctly), but `pra-03-03`'s defect was
   a false textual claim in an otherwise-sound `graphZoom` widget's feedback, not a visual-capability
   gap; the report's own defect-contract prose never characterizes it as one. Treated as a table
   formatting artifact rather than a substantive finding; `pra-03-03`'s `visualDecision` is signed
   `REQUIRED` in this verifier's own disposition, reflecting that the widget itself is (and
   remains) a correctly-functioning, necessary interactive for the lesson's VA-vs-hole
   demonstration. Does not affect the KEEP verdict or the correctness of the fix itself.

No math error, false feedback, answer-leak, missing-visual, mcq-ordering, or ID/conceptTag
collision was found in any of the 18 lessons on independent re-verification.

## Raw data

- `reports/closure/cowork-staging/laneV-s319-fig-hs-dispositions.jsonl` — 18 records, one per
  lesson, `recordId` = `S319-V-<lessonId>`.
- `reviewedBasisHash` for all 18 lessons obtained in one bulk call:
  `node scripts/session/print-review-basis.mjs ca-03-03 ca-04-01 ca-05-02 ca-05-03 asv-04-03
  asv-05-01 cx-02-02 cx-02-03 sg-03-02 dg4-01-03 co-01-03 pp-02-01 pp-04-03 ft-05-03 ft-05-04
  pra-03-03 pf-05-01 sy-05-03` (read-only; no ledger written).
- sha256 cross-check on all 8 HS-packet edited files: independently recomputed
  `sha256(git show HEAD:<file>)` / `sha256(<file>)` for every file and matched exactly against
  `laneA-s319-hs.jsonl`'s own `sha256Before`/`sha256After` fields (16-hex-char prefixes compared,
  all 8 exact matches).
- `git diff HEAD` was read in full for every one of the 18 content lesson files plus
  `src/components/figures.tsx`, `src/components/figureIds.ts`, and
  `src/lib/figureNumericClaims.generated.ts`; in every case the diff contained *only* the fields
  named by the owning contract — no incidental ID, `conceptTag`, answer, option, or unrelated-step
  edits were found in any of the 18 files.
- Course-order/next-lesson claims (`ft-05-03`/`ft-05-04` teaser swap; `sy-05-03`'s forward pointer
  to `sy-06-01`) were independently verified against the live `course.json` `lessonIds` arrays
  (not taken on the implementer's word) and against a direct read of the referenced next lesson's
  actual content (`ft-05-04.json`'s `ch1`/steps; `sy-06-01.json`'s `c1` body).
- A scratch `npx tsx` probe was written and run to independently re-derive `isFigureTextAligned`/
  blocklist/adversarial-risk results for all 14 figure bindings (methodology described above); it
  was deleted after use and is not part of this session's output — per the read-nothing-but-the-
  two-staging-files mandate, no third file was left behind.

No content file, `course.json`, figure component, widget, or evaluator source was edited by this
verification session. This report and the disposition NDJSON are the only writes.
