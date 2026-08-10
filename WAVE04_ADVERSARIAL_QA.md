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
