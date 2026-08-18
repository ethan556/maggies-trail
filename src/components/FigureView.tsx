"use client";

/**
 * FigureView — the lazy boundary around the concept-figure library.
 *
 * figures.tsx is ~26.9k lines of static SVG illustrations; before S110 it was
 * imported synchronously by the lesson route, so every lesson shipped every
 * figure. This component code-splits it: the id-existence check stays
 * synchronous via the tiny generated FIGURE_IDS set (see gen-figure-ids.mjs),
 * while the figure bodies load as their own chunk. ssr: true keeps the figure
 * in the server HTML, so in production there is no pop-in; the min-height
 * loading placeholder only appears in the rare slow-chunk client case.
 * Drift between the sync set and the lazy record is pinned by
 * figures.split.test.ts.
 */
import dynamic from "next/dynamic";
import { isFigureTextAligned } from "@/lib/figureTextAlignment";
import { SvgLatexSurface } from "@/components/math/SvgLatexSurface";

const FigureById = dynamic(
  async () => {
    const m = await import("./figures");
    function Render({ id }: { id: string }) {
      const f = m.FIGURES[id];
      return f ? f() : null;
    }
    return Render;
  },
  { ssr: true, loading: () => <div className="min-h-24" aria-hidden="true" /> }
);

export default function FigureView({ id, context = "" }: { id: string; context?: string }) {
  if (!isFigureTextAligned(id, context)) return null;
  return <SvgLatexSurface><FigureById id={id} /></SvgLatexSurface>;
}
