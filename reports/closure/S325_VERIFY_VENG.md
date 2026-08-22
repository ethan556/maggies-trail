# S325 V-ENG — independent audit of S324 ENG-FIG + ENG-PIN

Verifier: cowork-s325-VENG-verifier. Date: 2026-08-21. Branch: codex/v4-s244-authored-visual-wave.
Scope: the 16 lessons discharged by S324 ENG-FIG (11) and ENG-PIN (5), their src edits, staged
dispositions (laneA-s324-engfig.jsonl, laneA-s324-engpin.jsonl), and the 16 originating S323
ESCALATE records (all located and matched in LESSON_REVIEW_DECISIONS_S244.jsonl).
Method: everything recomputed independently in `node` / `npx tsx --tsconfig
scripts/audit/tsconfig.figure-ssr.json` one-offs (no npm/vitest/tsc). READ-ONLY on src/content
honored; the two generator gates re-run are byte-idempotent (verified by hash before/after).

VERDICT: ALL 16 LESSONS VERIFIED CLEAN. Zero findings signed; laneV-s325-VENG.jsonl is empty.

## Check 1 — figure truth (all 12 new figures rendered via SSR one-off and inspected at source)

- mult3-fair-shares-16-over-2: Mult3FairSharesExample{16,2} → 16 circles in 2 rings, caption
  "16 shared into 2 groups → 8 each", "16 ÷ 2 = 8". Recomputed 16÷2=8 OK. Dot count 16, rings 2.
- mult3-fair-shares-12-over-2: {12,2} → 12÷2=6 OK; 12 dots, 2 rings.
- mult3-fair-shares-18-over-3: {18,3} → 18÷3=6 OK; 18 dots, 3 rings.
- mult3-how-many-groups-21-over-3: Mult3HowManyGroupsExample{21,3} → 7 rings of 3, "21 ÷ 3 = 7";
  21÷3=7 OK; 21 dots, 7 rings.
- mult3-divide-by-nine-54-over-9: Mult3DivideByNineExample{6} → 6 rows of ten (60 circles, 10th
  column dashed/removed → 54 kept), "6 × 10 = 60; remove 6 → 6 × 9 = 54", "54 ÷ 9 = 6 groups";
  54÷9=6 OK; number-word title asserts no equality (kept out of the claims map, verified).
- g2l-read-landing-45-20: marks 45/55/"?", two +10 arcs, both direction=right; 45+10+10=65 OK.
- g2l-read-gap-53-33: marks 33/53, shaded gap band labeled "?", no hop arrows; 53−33=20 OK.
- g2l-read-missing-jump-33-43: marks 33/43, one right jump labeled "?"; 43−33=10 OK.
- pc-arc-length-hypotenuses: 4 chords whose endpoints are exactly P(0..1 in quarters) on the
  drawn curve (genuine chords), the magnified triangle is a true right triangle — dx leg
  (210,120)→(288,120), dy leg (288,120)→(288,64), and the √(dx²+dy²) label sits on the
  (210,120)→(288,64) hypotenuse. Chord and triangle orientations agree (right/up).
- pc-integrand-speed: point at P(0.5) on y=108−106t+34t²; drawn arrow direction (160,−72)
  recomputed = exact derivative (x′=160, y′=−106+68t=−72 at t=0.5) — tangent-true; the speed
  identity "√((dx/dt)²+(dy/dt)²) = |v| = speed" and "L = ∫ speed dt" put speed in the integrand.
- pc-motion-vectors: ellipse E(θ)=(150+80cosθ, 70−38sinθ); v drawn along (−80sinθ, −38cosθ) =
  exact dE/dθ (tangent/velocity-consistent); a drawn toward the center = exact d²E/dθ² direction
  for this parameterization; r(t) from origin to the point; "speed = |v|" labeled.
- vec-matrix-row-recipe: [[a,b],[c,d]]·⟨x,y⟩ with top row color-matched to ax+by (new x) and
  bottom row to cx+dy (new y) — a genuine row·column dot-product depiction, symbolic only.
- Registration: all 12 ids present exactly once in src/components/figureIds.ts; every lesson
  binds the claimed ids at the claimed steps (independent JSON walk of all 10 content files);
  vec-04-01 c1 retains vec-matrix-row-dot; pc-03-01/c2 confirmed figure-free.
- Byte-compat: mult3-fair-shares-15-over-5 still renders viewBox 340×108 with no translate
  wrapper; fixed originals (mult3-fair-shares 12÷3=4, mult3-how-many-groups 12÷4=3,
  mult3-divide-by-nine 63÷9=7) untouched.

## Check 2 — SyDilationParallel

Recomputed from source: O=(40,130), k=1.8; A(100,70)→(148,22), B(140,70)→(220,22). SSR markup
parse: rays M40 130 L148 22 and M40 130 L220 22 → k_x=k_y=1.8 for BOTH endpoints (rays exactly
collinear with center through each original endpoint); image segment (148,22)–(220,22) parallel
(y=22 both ends) to the original (y=70 both ends); length 72 = 1.8×40. The k=1.8-vs-contract-k=2
deviation is a viewport-headroom choice; the contract's operative requirements (one k, collinear
rays, parallel image) all hold. Sanctioned non-additive edit per S319-F-sy-06-01. CLEAN.

## Check 3 — pin legitimacy (all 9 test files diff-read against HEAD)

- No assertion deleted or wildcarded anywhere. Diffs are: value re-pins (session254 ×2,
  s318G3Figures ×1 map entry, session308 ×4 rows, session299 ×4 hashes, session286 ×1 prompt),
  additive rows (figures.numberLineDirection.s260: 3 AXES + 2 DIRECTIONS entries), a new test
  file (s324Figures.test.tsx, 138 lines of real render/binding/geometry assertions), and the
  session244 restructure (3 which-drawing rows moved to a new readDrawingPacket with its own
  binding + render assertions; candidate-set count 6→4 matches the 4 remaining distinct ids).
- session308: all 14 contract rows replayed with the test's own algorithm (sha256 prompt;
  sha256 of id-sorted {id,label,correct,feedback} JSON) — 14/14 match, figure column matches,
  ids o0–o3, correct=o0 only, correct index = row%3+1 for every row, distribution 5/5/4,
  full-course mcq inventory exactly equals the contract list. The 4 re-pinned rows recompute
  to precisely the new pinned values.
- session299: all 4 nonCopyHash pins replayed with the test's own algorithm (structuredClone →
  delete step body/narration → sha256(JSON.stringify)) against the edited lessons — 4/4 MATCH;
  body/narration/figure contract strings verified untouched.
- session254 "pre-existing drift repairs": current lessons bind mult3-missing-factor-6x7/-8x9/
  -7x8/-6x9 (verified per-file), so the old bare "mult3-missing-factor" pins were red against
  the working tree before the packet; new pins match truth. Full expectedFigures replica:
  12/12 lessons match. FollowOn pin likewise matches.
- session244 order-insensitive label repair: verified pre-existing red — g2l-02-01/k3,
  g2l-02-02/k3, g2l-03-01/k1 currently carry S308-shuffled label orders (e.g. ["Drawing B",
  "Drawing A","Drawing C","Drawing D"]), so the old exact-order [A,B,C,D] assertion could not
  have passed; the sorted-set form plus the session308 order pin loses no coverage.
- s318G3Figures: only the placement-map value for df3-02-01/rem-g3d-div89-c changed; the file's
  only other divide-by-nine reference is that same line (no second `targets` pin exists, as the
  packet reported).
- session286: single prompt value change; predicate replayed conceptually against lesson bytes
  (prompt equality, payload ≠ i1, answer even) — passes.
- PIN-AUDIT VERDICT: LEGITIMATE. Every re-pin is a truthful recomputation; no loosening beyond
  the one documented pre-existing-red repair, which is itself evidence-backed.

## Check 4 — lesson content (9 edited lessons)

- g2l-01-03/k3: closer-mark job; 43−40=3 vs 50−43=7 → "The 40 mark" correct at o0 (index 3);
  halfway-template duplicate with k1 gone (HEAD had k1~k3 normalized dup; now absent). CLEAN.
- g2l-03-01/k3: 45+20=65; traps 45 (start), 47 (hops-as-ones), 25 (=45−20 backward); correct
  index 3; figure synchronized. k1~k3 template dup gone. CLEAN.
- g2l-03-02/k1: 53−33=20; traps 86 (=33+53 sum), 30 (extra hop), 19 (fencepost); correct index 1;
  k2's P6 trap 107 verified = 64+43 in place. CLEAN.
- g2l-03-03/k3: 43−33=10; traps +76 (=33+43), −10 (direction), +11 (off-by-one); correct index 2.
  CLEAN.
- g3f-01-03 remedial: route-shifted stem, answer 4 (4×1/6=4/6), traps 6 (denominator) and
  10 (=4+6) still literally true; byte/normalized distinct from k1; not producible by
  faWholeTimesFractionNumeric (template verified at src/lib/g4Variants.ts:459); R6 clear. CLEAN.
- g3f-01-05 remedial: enacted halfway stem; half of eight jumps = 4/8 = 1/2, correct "The 4/8
  mark" at o0; options/feedback verbatim-true; distinct from k1 AND k3; remedial concept lists
  1/8, 2/8, 3/8 but never 4/8 (R6). Cross-lesson partners g3f-02-04/ch1 and g3f-03-04/k2 no
  longer byte-equal (verified). CLEAN.
- g3f-02-01 remedial: jump-count stem, answer 3 (three jumps 0→1/3→2/3→1); trap 4 = the four
  tick marks (0, 1/3, 2/3, 1 — recomputed true), trap 2 = halves; distinct from both k1 and k3
  ("garden bed"/"paper strip" shared template); not producible by Ssg2ThirdsCountNumeric
  (template verified at src/lib/g2Variants.ts). CLEAN.
- g3f-02-02: remedial sandwich check — 2-share piece > 3-share piece, correct at o0, labels
  30/30/29 chars (balanced), feedback true; R6 rationale (sixths/eighths answer would sit in the
  adjacent concept) verified against the concept body. ch1 — 5/6 = 20/24 > 15/24 = 5/8, correct
  "The dot at 5/6" at o0, labels 14/14/31/20 (correct not an outlier), variant removed, hint
  refreshed; old byte-dup with g3f-01-02/k2 gone. CLEAN.
- g2a-01-03/i2: n=12, "Pair up 12 counters. Odd or even?", 12 = 6 pairs + 0 left → even;
  successFeedback/oddFeedback both literally true; payload ≠ i1; prompt unique in course
  (1 occurrence). Remaining i1~i2 normalized pair and the k1-byte-copy remedial confirmed
  pre-existing at HEAD (uncontracted debt, correctly recorded not fixed). CLEAN.
- Duplicate probe: normalized within-lesson scan of all 9 lessons — every remaining dup pair
  also exists at HEAD (pre-existing debt classes); the escalated dup pairs (g2l-01-03 k1~k3,
  g2l-03-01 k1~k3, g2a i2 byte-copy, all four g3f remedial byte-copies) are gone. All new
  prompts unique corpus-wide (grep probes, 1 hit each).
- Grade language: g2/g3 stems use short concrete vocabulary (counters, sandwiches, rulers,
  hops); pc/vec/sy language is course-appropriate. FIT.
- pc-01-02/k3 length parity intact (62/62/65/63, correct=62, SPEED answer true).

## Check 5 — basis hashes

Fresh `node scripts/session/print-review-basis.mjs` for all 16 lessons vs the staged
reviewedBasisHash values: 16/16 MATCH. Hash-mismatch list: EMPTY.

## Check 6 — gates

- node scripts/audit/figure-text-alignment.mjs → {"uses":3573,"fixedExemplars":12,
  "renderedFixed":12,"suppressed":0}, exit 0, zero violations. (Output CSV verified
  byte-deterministic across runs — sha256 identical — so re-running altered nothing.)
- node scripts/gen-figure-ids.mjs → "figureIds.ts written: 2029 ids"; output byte-identical to
  the packet's committed state (diff clean) — idempotent, registrations complete.
- figureNumericClaims.generated.ts: 197 entries; the only new admissions are the four true
  digit-title claims (16÷2=8 each, 12÷2=6 each, 18÷3=6 each, 21÷3=7); word-only titles
  (divide-by-nine family, g2l-read, pc, vec, sy) not admitted, as designed.

## Per-lesson dispositions (all clean — no signed records required)

- df3-01-01 CLEAN — c1/remedial figures truthful (16÷2=8, 12÷2=6), pins updated correctly, basis hash matches.
- df3-01-02 CLEAN — c1 21÷3=7 how-many-groups; remedial fair-shares 18÷3=6 deviation justified by the remedial's own fair-shares wording ("3 equal groups of 6", "share 18 counters among 3 groups").
- df3-02-01 CLEAN — remedial 54÷9=6 figure truthful; s318 placement-map pin matches lesson; c1/c2 untouched and truthful.
- g2l-01-03 CLEAN — closer-mark replacement mathematically sound; session308 row recomputes; duplicate gone.
- g2l-03-01 CLEAN — read-the-landing figure/mcq consistent (45+20=65); all pins recompute.
- g2l-03-02 CLEAN — compute-the-gap figure/mcq consistent (53−33=20); k2 trap 107=64+43 intact; remedial binding untouched per contract.
- g2l-03-03 CLEAN — missing-jump figure/mcq consistent (43−33=10); pins recompute.
- pc-01-02 CLEAN — chords are true hypotenuses of dx/dy triangles; integrand-as-speed figure exact; k3 parity intact.
- pc-03-01 CLEAN — v/a recomputed as exact first/second derivatives of the drawn path; c2 stays unfigured per session271.
- vec-04-01 CLEAN — genuine row-recipe dot-product visual on c2; c1 keeps vec-matrix-row-dot; vec-det-area unbound.
- sy-06-01 CLEAN — single k=1.8 both endpoints both axes; rays collinear; image parallel, ratio 1.8.
- g3f-01-03 CLEAN — remedial rewrite S316-R-conformant; session299 hash recomputes to the pinned value.
- g3f-01-05 CLEAN — remedial rewrite sound (4/8=1/2); partners no longer byte-equal; hash recomputes.
- g3f-02-01 CLEAN — jump-count remedial with recomputed marks-vs-jumps trap (4 marks/3 jumps); hash recomputes.
- g3f-02-02 CLEAN — remedial + ch1 both mathematically true (2-share > 3-share; 5/6 > 5/8), balanced options, variant removal justified; hash recomputes.
- g2a-01-03 CLEAN — contracted 4-line renumber exact (12 = 6 pairs even); session286 pin matches; pre-existing debt correctly left untouched.

## Raw results

- Verified-clean count: 16/16.
- Findings signed: 0 (laneV-s325-VENG.jsonl intentionally empty).
- Pin-audit verdict: LEGITIMATE — no deleted/wildcarded assertions; every new pinned value
  independently recomputed with each test's own algorithm (session299 4/4, session308 4/4
  changed + 14/14 total, session254 12/12, session286 1/1); the two claimed pre-existing-red
  repairs (session254 drift rows, session244 label order) verified genuinely red pre-packet.
- Gate results: figure-text-alignment 0 violations (3573 uses); gen-figure-ids idempotent at
  2029 ids; claims map 197 with only true additions.
- Hash-mismatch list: EMPTY (16/16 fresh basis hashes match staged records).
