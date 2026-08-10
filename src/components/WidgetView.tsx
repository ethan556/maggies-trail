"use client";

/**
 * WidgetView — the lazy boundary around the interactive-widget catalogue.
 *
 * widgets.tsx is ~10.3k lines covering all 100 registered widget types;
 * before S111 it was imported synchronously by the lesson player, the quiz
 * shell, and the landing hero, so every one of those routes shipped the whole
 * catalogue. This mirrors the S110 FigureView pattern: one dynamic boundary,
 * ssr: true so the widget markup is in the server HTML (no pop-in), with a
 * stage-shaped placeholder for the rare slow-chunk client case. Grading is
 * untouched — evaluate/canCheck live in @/lib/evaluate and stay synchronous.
 * Type-only imports from ./widgets remain static everywhere (erased at build).
 */
import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { WidgetRenderer as WidgetRendererType } from "./widgets";

const LazyRenderer = dynamic(
  async () => (await import("./widgets")).WidgetRenderer,
  { ssr: true, loading: () => <div className="min-h-24" aria-hidden="true" /> }
);

export default function WidgetView(props: ComponentProps<typeof WidgetRendererType>) {
  return <LazyRenderer {...props} />;
}
