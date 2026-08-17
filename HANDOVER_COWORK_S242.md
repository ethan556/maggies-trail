# HANDOVER — COWORK S242

**Closes at:** the commit carrying this file · **Branch:** `cowork/s242`, 44 commits ahead of
`origin/cowork/s237` (= `53da787`) · **Push:** blocked all session by the git proxy
(`ethan556/maggies-trail` not in the session's authorized sources); every commit is in the
delivered bundle `maggies-trail-cowork-s242.bundle`, applied with
`git fetch <bundle> HEAD:cowork/s242`.

## What this session changed, in one paragraph each

**The app runs under its own CSP.** The old policy allowed two inline scripts by SHA-256 hash;
Next.js emits fifteen, and the thirteen streaming/RSC ones cannot be hashed, so hydration never ran
and 104 of 117 chromium assertions failed — twelve of the thirteen "passes" being vacuous against a
blank page. `src/middleware.ts` now mints a per-request nonce and sets the policy on the REQUEST
header (that is the load-bearing line — Next stamps its own scripts from it). Build went 21 static /
12 dynamic → 1 / 60; the 21 were client-rendered shells. Browser layer: **125/125**.
`SEC02_CSP_NONCE.md` has the numbers; `e2e/s242-csp.spec.ts` asserts the sentence the old unit test
declined to ("the headers actually arrive, and React hydrates").

**Three figures contradicted their own captions.** `DiscriminantCases` ("D > 0: 2 roots") drew a
curve whose extreme was ABOVE the axis — a Bézier never reaches its control point; the owner
reported it from a screenshot. `TgReadLandmarks`/`TgFivePoints` had the same slip. All fixed, and
`figures.markerAdherence.s242.test.ts` pins the class (marker on a control point) at zero, with a
coverage floor that caught its own first vacuous version. `FnVerticalLineTest` illustrated the
vertical line test with a curve that PASSES it — found by reading, fixed, recorded as a class no
marker rule can see.

**ARCH-01/02 are ruled** (`ARCH_01_02_RULING.md`): no learner-facing AST — typed values where math
is computed, authored notation + one enforced boundary where it is displayed, an invariant defined
by enumeration, and the exact/intermediate/final ladder with grade bands. The document argues the
strongest case against itself and states its reopening condition (the leak index refusing to reach
zero on boundary repairs alone). GRB-02 was ruled by §5: quadratic generators keep the surd.

**The boundary itself had the defects.** A parenthesised base could not carry an exponent
(`(1/2)^x` → literal `^x` on screen) and the exponent class swallowed sentence punctuation
(`^{1?}`). Both fixed in `authoredMath.ts`; two authored leaks (half-life, rational exponents)
closed with them.

**Counts, corrected by measuring:** 293 → 229 exhausted pairs (now 12 closed-fact-set /
17 cosmetic-only / 256 under-parameterised — `cosmetic-only` is the new third verdict: many
prompts, ONE answer, widening is the anti-pattern); GRB-01 "63 rows" → 1 → **0**; GRB-03 40 → 23
(the 25-char floor is a distractor rule and was firing on K–3 success lines); "158 lessons need
re-sequencing" → 18 sequencing + **143 lessons that have no manipulative step at all**
(`reports/CML01_BURNDOWN.csv`); VIS-01 "1,078 illustrations" → 91 figure families, of which
`count-on-hops` is 793 placements — and opening THAT showed 765 of its 793 bodies contain no
drawable sum: they are wrong DECLARATIONS on concept steps (Grade 5 fractions, K shape-building),
already correctly suppressed by the guard. Hidden IS the repair there; what remains is per-step
figure selection across 397 lessons. MCQ-01 "942" was a VIS-01 number I carried; the true index is
660 rows, 25 hard leaks, ALL authored (referred to a human in VARIANT_LOG under rule 1) — the ten
GENERATED hard leaks were repaired this session and are **0**.

**The last learner-visible caret** was the `evalOrder` operator chip and its status line
(`2 × 2 ^ 2`). Chip renders `xʸ`, status line renders a true superscript, screen reader still says
"to the power of". Verified by screenshot on the production build — after rejecting one
vacuous-blank capture, which is this session's recurring lesson in miniature.

## The recurring lesson, for whoever picks this up

Every count carried rather than re-measured was wrong: 293→229, 63→0, 40→23, 81→5, 158→18,
1078→91→(793 wrong declarations), 942→660→25. And twice the measurement itself was wrong before
the content was (blank-page carets, the leakage audit silently not writing without `--write`).
Open one of the things being counted before believing the count — including, especially, your own.

## Open, with owners

| Item | State | Who |
|---|---|---|
| CML waivers | expire **2026-11-13**; 143 lessons need an interactive surface BUILT | authoring, Wave 5 |
| 25 authored MCQ leaks | listed in VARIANT_LOG, ~17 distinct reads | human, rule 1 |
| GRB-04 backlog | 256 under-parameterised; batch by `exhausted-leverage.mts` harm order | next variant session |
| VIS-01 | figure selection per concept step, 397 lessons; guard keeps learners safe meanwhile | authoring |
| MATH-03 | 820 symbolic-display rows, now judgeable against ARCH-02 §6 | bounded packets |
| ENG-01/02, ADAPT-01 | ranked queues exist; design work | spec-first |
| ACC-01 §8 | Chromebook/iPad/phone + VoiceOver/NVDA/TalkBack + 200% physical zoom | human + hardware |
| PERF-01 | no budgets; practice/review ~916–918 kB first load measured | decision + tooling |
| PILOT-01, OPS-01..04, EVID-01 | specification packets in `CLOSURE_PACKETS_S242.md` | people/institutions |

## Do-not-lose

- Two CSPs on one response are enforced as an INTERSECTION — never add a CSP back to
  `next.config.mjs`; the symptom would look exactly like the original blank-app bug.
- The `next start` server must be restarted after every build; a stale server 400s the new chunk
  hashes and every browser measurement against it is vacuous (hit twice this session).
- The MCQ leakage audit writes only with `--write`.
- `cosmetic-only` GRB-04 pairs must not be "fixed" by adding nouns — the answer must move, or the
  pair is a rule-7 rejection.
- The two `g4p-02-*` k2 declarations are withdrawn permanently (single-fact items). Do not
  re-declare them.
