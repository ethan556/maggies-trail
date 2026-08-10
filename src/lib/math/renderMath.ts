/**
 * Phase B — canonical math rendering (§21). ONE way to turn LaTeX into markup, used by the
 * MathText component pair and nothing else. verify:math-format enforces the single-importer
 * rule, so a second rendering path cannot appear without failing the gate.
 *
 * Contracts:
 *  - Deterministic: same tex → same markup. No randomness, no environment reads.
 *  - Total: invalid tex never throws in the learner's face — it degrades to escaped plain
 *    text and reports the error to the caller, which tests DO assert on.
 *  - Learners never type LaTeX (§21). This renders AUTHORED math only; nothing here is
 *    reachable from a learner input path.
 */
import katex from "katex";

export interface RenderedMath {
  html: string;
  /** null when the tex parsed cleanly; the KaTeX message otherwise. */
  error: string | null;
}

const escapeHtml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function renderMath(tex: string, display: boolean): RenderedMath {
  try {
    const html = katex.renderToString(tex, {
      displayMode: display,
      throwOnError: true,
      strict: "warn",
      output: "htmlAndMathml" // MathML alongside HTML: screen readers get real math (§28)
    });
    return { html, error: null };
  } catch (e) {
    return { html: `<span class="math-fallback">${escapeHtml(tex)}</span>`, error: e instanceof Error ? e.message : String(e) };
  }
}
