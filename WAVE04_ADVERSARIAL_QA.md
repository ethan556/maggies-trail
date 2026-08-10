# Wave 04 adversarial QA — S224

## Attempts to falsify the batch

- **Raw TeX leakage:** lesson JSON still contains no LaTeX commands. Only whitespace-delimited tokens with the explicit `^` authoring signal enter KaTeX. Ordinary prose, UI numerals, and learner input do not.
- **Incorrect exponent parsing:** `(2^4)^2 → (2^{4})^{2}`, `a^(m·n) → a^{m\cdot n}`, and `2^? → 2^{?}` are pinned by unit tests. KaTeX emits HTML + MathML.
- **Option/feedback gaps:** prompt-only wiring was rejected. The final boundary covers lesson prose, prediction prompt/options/reveal, core widget prompts, core MCQ labels, sort labels/buckets, feedback, and reveal answers.
- **Quotient sign reversal:** the start state produces an explicit negative ordered difference; text and the accessible name expose the sign independently of color.
- **Answer leakage:** target rates appear only in the authored task/ghost after reveal tone; the learner must make four moves and match both rates. Existing retrieval steps remain independent.
- **Decorative interaction:** quotient controls change both numerator products and the visible signed rate. Like-term placement changes the classification state and yields item-specific diagnostic feedback.
- **Keyboard/touch:** sliders use native range controls with 44px height; browser QA reached the target using only End/Home/Arrow keys. Drag-bucket uses radio-button alternatives, not precision dragging.
- **Mobile overflow:** 390×844 screenshots show recomposed single-column layouts with no horizontal overflow or clipped mathematical state.
- **Security workaround risk:** the patched `sharp@0.35.3` override was verified through `npm ls`, a fresh production build, and a zero-vulnerability production audit. Next.js remains 15.5.23.
- **Deployment/source confusion:** GitHub `main`, the recorded successful Vercel Production deployment, and local base `HEAD` all identify SHA `68b5814f7dcd25562e879ecff64ea073647b2880`. The public alias is healthy, but Wave 04 remains an uncommitted local delta and is not mislabeled as deployed.
- **Legacy proof drift:** S146 was made platform-neutral and passes 37/37. The following S147 Python audit still fails on Windows byte/path assumptions; its generated FAIL artifact was restored to the sealed version so a platform false positive cannot masquerade as product evidence.

## Browser evidence

- `e2e/wave04-math-rendering.spec.ts`: exponent KaTeX/MathML and quotient keyboard/accessibility assertions pass.
- `WAVE04_SCREENSHOTS/exponents-katex-390.png`
- `WAVE04_SCREENSHOTS/quotient-mode-390.png`

## Residual risks

- Full Vitest remains governed by existing CL-P1-033; this batch’s focused 13-test gate is green.
- Physical screen-reader, 200% zoom, and real-device testing remain CL-P1-035.
- Six advanced interaction proposals remain open for fresh per-gap state/evaluator design.
- Full generated-artifact replay beyond S146 remains a verifier-portability task; `verify:corpus-state` is the authoritative fresh current-corpus proof for this batch.

## S225 batch-2 falsification pass

- **Passive-model regression:** production baselines at 390x844 confirmed both target steps were passive. Current source now exposes stateful models in the same lesson positions.
- **Substitution drift:** factor and power controls were driven to 2 and 3. The accessible model name, visible readouts, table, symbolic view, and evaluator all agree on `u^3 du`, coefficient 1, antiderivative `(1/4)u^4+C`, and no remaining `x`.
- **TeX escape defect:** the first browser build visibly printed `qquad`. The TeX literal was corrected, rebuilt, and rechecked. Final DOM contains four MathML trees and no visible `qquad` artifact.
- **Rolle mismatch:** the interval was moved from B=1.5 to B=4 using keyboard arrows. Final state reports `f(A)=0`, `f(B)=0`, secant slope 0, and tangent slope 0 at c=2 in both the visual and accessible graph description.
- **Keyboard failure:** an initial browser pass showed native range focus without reliable value movement. Explicit ArrowLeft/Right/Up/Down/Home/End handling was added to the new controls. The browser then reached exact targets, and the focused plus global keyboard suites pass 149/149.
- **Touch/target size:** both new ranges are 331x44 CSS px at the 390px viewport. The shared accessible-state disclosure was found at only 16px high and repaired to 44px; final measurement is 305x44. Physical-device touch remains CL-P1-035.
- **Overflow:** final 390px audit reports zero horizontal overflow on the u-sub surface; Rolle screenshot also shows no clipped model or controls.
- **Reduced motion:** the Rolle secant/tangent transition defaults to `transition:none` and is enabled only inside `prefers-reduced-motion: no-preference`. The audit machine reported normal motion; reduced behavior is code- and build-verified, not claimed as physical-OS emulation.
- **Accessibility:** controls have exact labels, live mathematical state has role-image descriptions, KaTeX emits MathML, and no browser console errors were present in the final current-source pass.
- **Security:** production dependency audit reports 0 vulnerabilities.
- **Corpus identity:** regenerated manifest, notebook index, prerequisites, and product states agree on SHA-256 `6bd7524b947d1daf9d84d920c895d8366ad7e1b160cd19ccc14b9a8f8682ecc8`.
- **Strict CML baseline:** strict lint still reports the two pre-existing `re-04-02` radical-functions errors and 340 warnings. Neither target lesson adds an error; both new acquisition predictions are causal and directly attached to manipulatives.

### Batch-2 screenshots

- `WAVE04_SCREENSHOTS_BATCH02/01-live-usub-passive.png`
- `WAVE04_SCREENSHOTS_BATCH02/02-live-rolle-passive.png`
- `WAVE04_SCREENSHOTS_BATCH02/03-fixed-usub-mobile.png`
- `WAVE04_SCREENSHOTS_BATCH02/04-fixed-rolle-mobile.png`
