"use client";

/**
 * TEST-ONLY resolution target for "@/components/WidgetView" (see the vitest
 * alias). In jsdom, next/dynamic renders its loading placeholder and the
 * widget never mounts, which would blind every player-flow spec; this shim
 * imports the catalogue statically so tests exercise the real widgets. It is
 * NEVER in the production module graph — the app resolves WidgetView.tsx,
 * whose dynamic boundary the browser Playwright suite exercises for real.
 * Kept prop-compatible by construction (same passthrough signature).
 */
import type { ComponentProps } from "react";
import { WidgetRenderer } from "./widgets";

export default function WidgetView(props: ComponentProps<typeof WidgetRenderer>) {
  return <WidgetRenderer {...props} />;
}
