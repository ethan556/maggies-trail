# Maggie's Trail — S134–135 adversarial review of S126–133

## Sessions 134–135 — adversarial verification of the eight unverified sessions (S126–133)

**The finding that frames everything else:** S126–133 shipped with tsc, vitest, build, and
Playwright reported as "blocked — not passed" on a dependency claim (`zustand@5.0.14` missing
from the mirror; Node below Chromium's floor). **Both claims were false in this environment.**
package.json dependencies and the lockfile are byte-identical to S125, so the S125 tree's
verified node_modules hard-links straight in, and Node here is 22.22.2. Eight sessions of
engine work ran without a single primary gate. First full execution surfaced **46 test failures
across 13 files** on a tree that did not typecheck. Every failure was root-caused; no gate was
weakened.

**Defects found and fixed (gate reruns after each):**
1. **Typecheck (7 errors):** two variant generators emitted specs missing required-on-output
   Zod-defaulted fields (distributionCompareLab judge+measure; gridCountRead's areaModel
   `square`); five test-file errors fixed with narrowing that *strengthens* assertions.
2. **Mathematical bug:** trialTheoretical assumed the complement is always a distractor — false
   when favourable = total/2 (3/6 → 1/2 IS the answer), so the uniqueness guard threw on every
   even/odd/prime draw. That single root cause explained all 7 first-wave gate failures.
   Replaced, in that case only, with the inverted-ratio misconception.
3. **Silent-render class (S123):** two more literal `\u2014`/`\u2192` JSX escapes.
4. **Renderer totality:** UnitRulerW and the estimateSlider dispatcher crashed on raw specs
   (defaulted arrays assumed present); guarded, unitRuler sample enriched with its
   misconception channel, reuse-wave audit aligned to the equivalent guarded expression.
5. **Coverage gaps:** distributionCompareLab and trialProbabilityLab had NO keyboard gate
   tests — real drive-to-correct + named-wrong-path tests written for both. compoundEventLab's
   actionsFor text had no operating mechanics — rewritten with Tab/Enter/Space.
6. **False capability claims:** both new labs claimed adapt=3 without wiring onEvent — genuine
   toward/away process signals wired into all three handlers.
7. **Registration drift:** the s131 surface test drove a generator registration that never
   shipped ("g7-statistics" umbrella). Rewired to the real per-tag forms — 12 seeds × form ×
   3 bands, strictly stronger.
8. **Rot-prone assertion:** the backlog test froze the S126 queue (64) as a literal (live: 53).
   Replaced with self-consistency + committed-doc-matches-live-compiler invariants.

**Browser layer (first execution of S127's 71-test harness):** 64 → 70 → **71/71 (PWEXIT:0)**.
- Two spec hydration races (Enter pressed / Tab walked before React attached) — synchronized
  with retrying presses and a rendered-footer wait; contracts unchanged.
- **Real parity gap:** the in-app reduce-motion toggle used the 0.001ms fallback alone, so a
  completed `both`-fill animation held its keyframe transform (computed identity matrix, stray
  containing block) while the OS media path got `animation: none`. The attribute path now
  mirrors the media block's selector list — OS and app settings are equivalent again.
- **Real occlusion defect:** at 844×390 the retry dock (probed at 167px) covered the answer
  input whose center sat 3px beneath its edge, and `scrollIntoViewIfNeeded` judged the input
  "visible." Fixed by (a) capping the feedback region at 22dvh under 480px height (scrolls
  internally) and (b) element-level `scroll-margin` on `main input`/`.lesson-stage`, which
  Chromium honours in both the needs-scroll check and final placement. Values derived from a
  live geometry probe, not guessed.

**Adversarially verified, not assumed:** content drift vs S125 is exactly the 11 declared
lesson files; the sp-04-03 compoundEventLab conversion has zero frozen-surface violations and
every converted answer re-derives to the frozen value; all four seeded variant declarations
resolve on the causal surface.

**Report claims corrected:** the false toolchain blocker; the false adapt=3; the stale queue
literal; the never-shipped generator naming.

**Gates at close:** tsc 0 · vitest **10,201/10,201 (174 files)** · validate:content 1223/1223 ·
lint:pedagogy 1139/1139 · predict-qa 801/73 pre-existing, zero added · check-registration
consistent · gen:reports **GR:0** (all eight session audits) · build exit 0 ·
**Playwright 71/71 (PWEXIT:0)**.

**Tiers: A 608 · B 212 · C 281 · D 28** · registry 109 (103 manipulatives) · K–8 queue 53.

**No authored lesson content was changed in this repair session.**
