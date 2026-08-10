"use client";
/**
 * Phase B — the §21 component pair: MathInline for math inside a sentence, MathDisplay for
 * standalone equations. These are the ONLY sanctioned math surfaces; UI numerals (XP, step
 * counts, scores) are ordinary text and must never route through here.
 *
 * Layout-shift contract: MathDisplay reserves height BEFORE KaTeX's stylesheet arrives, so
 * a lesson never reflows under the learner's finger. The reservation is em-based (KaTeX
 * display math sits ≈ 2.2em tall for a fraction), and the fallback text renders at the
 * same font size — worst case the swap is a font change, not a height change.
 *
 * Stage contract: colors inherit currentColor, so math is ink-on-light inside `.stage` in
 * BOTH themes — same rule every figure follows.
 *
 * Adoption status (honest): Phase B ships the pipeline unwired. No route imports this file
 * yet, so today's bundle cost is zero; KaTeX (~72KB gz + fonts, loaded once, lazily) is
 * paid only when Phase C adopts it. This is recorded, not hidden.
 */
import { useEffect, useState } from "react";
import type { RenderedMath } from "@/lib/math/renderMath";

type Renderer = (tex: string, display: boolean) => RenderedMath;
let loaded: Renderer | null = null;
let loading: Promise<Renderer> | null = null;

function loadRenderer(): Promise<Renderer> {
  if (loaded) return Promise.resolve(loaded);
  loading ??= Promise.all([import("@/lib/math/renderMath"), import("katex/dist/katex.min.css" as string)]).then(
    ([m]) => (loaded = m.renderMath)
  );
  return loading;
}

function useMath(tex: string, display: boolean): RenderedMath | null {
  const [out, setOut] = useState<RenderedMath | null>(loaded ? loaded(tex, display) : null);
  useEffect(() => {
    let live = true;
    void loadRenderer().then((r) => { if (live) setOut(r(tex, display)); });
    return () => { live = false; };
  }, [tex, display]);
  return out;
}

/** No aria-label here, deliberately: renderMath emits MathML alongside the HTML
 * (output: "htmlAndMathml"), which screen readers speak as real mathematics. An aria-label
 * of the raw tex would OVERRIDE that MathML and read "\\frac{1}{2}" aloud — strictly worse.
 * The pre-load fallback shows the tex source to everyone for the moment before the
 * renderer arrives; the swap replaces it with self-describing KaTeX markup. */
export function MathInline({ tex }: { tex: string }) {
  const out = useMath(tex, false);
  if (!out) return <span className="math-inline">{tex}</span>;
  return <span className="math-inline" dangerouslySetInnerHTML={{ __html: out.html }} />;
}

export function MathDisplay({ tex }: { tex: string }) {
  const out = useMath(tex, true);
  return (
    <div className="math-display" style={{ minHeight: "2.6em" }}>
      {out ? <span dangerouslySetInnerHTML={{ __html: out.html }} /> : <span>{tex}</span>}
    </div>
  );
}
