/**
 * Maggie's Trail — brand components (WS-A Phase 2).
 *
 * Three exports, matching the four vector assets in `public/brand/`:
 *   - MaggieMark      the icon/app mark (twin peaks + winding trail + summit star),
 *                      inlined as JSX so it needs no network/file round trip in the
 *                      nav header where it renders on every page.
 *   - MaggieWordmark  the static "Maggie's Trail" wordmark art (outlined serif glyphs,
 *                      never SVG <text> — this repo has zero font infrastructure, so
 *                      <text> would system-font-degrade). References the standalone
 *                      `public/brand/maggies-wordmark*.svg` files rather than duplicating
 *                      their hand-authored path data a second time in this file.
 *   - MaggieBrandLockup  icon + a LIVE TEXT slot for the nav brand link. The wordmark is
 *                      never baked art here: SiteNav personalizes the brand string at
 *                      runtime (resolveTrailName() → "David's Trail"), so the text must
 *                      stay real DOM text, not a fixed image of the word "Maggie's".
 *
 * Colors are the approved WS-A brand hexes (Deep Navy #0D1B2A / Warm Ivory #F7F3EC /
 * Summit Orange #F08A24), hardcoded here on purpose — these are brand-identity assets,
 * independent of `src/lib/palette.ts` (math-semantic colors, untouched by this pass) and
 * of the `ink`/`tangerine` chrome tokens in tailwind.config.ts (chrome retint is a later,
 * separately-QA'd pass; an interim navy mismatch against existing chrome is expected).
 */
import Image from "next/image";
import * as React from "react";

/** The wordmark asset's own canvas, used to derive height from a requested width. */
const WORDMARK_VIEWBOX = { w: 962, h: 112 };

/** Single production mark. `gen:brand-icons` derives all install/icon aliases from its source. */
export const MAGGIE_MARK_SRC = "/brand/maggies-mark.png";

/** The user-approved mountain trail mark for compact chrome and app-icon surfaces. */
export function MaggieMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <Image
      src={MAGGIE_MARK_SRC}
      alt=""
      width={size}
      height={size}
      unoptimized
      priority
      className={className}
    />
  );
}

/**
 * The same canonical mark at display scale. `title` becomes the image alternative when this
 * otherwise decorative lockup needs an accessible name.
 */
export function MaggieMarkOpen({
  className,
  title
}: {
  className?: string;
  title?: string;
}) {
  return (
    <Image
      src={MAGGIE_MARK_SRC}
      alt={title ?? ""}
      width={512}
      height={512}
      unoptimized
      priority
      className={className}
    />
  );
}
export function MaggieWordmark({
  width = 190,
  mono = false,
  className
}: {
  width?: number;
  /** currentColor variant (public/brand/maggies-wordmark-mono.svg) for single-tone contexts. */
  mono?: boolean;
  className?: string;
}) {
  const height = Math.round((width * WORDMARK_VIEWBOX.h) / WORDMARK_VIEWBOX.w);
  return (
    <Image
      src={mono ? "/brand/maggies-wordmark-mono.svg" : "/brand/maggies-wordmark.svg"}
      alt="Maggie's Trail"
      width={width}
      height={height}
      unoptimized
      className={className}
    />
  );
}

/** Tailwind breakpoint the wordmark's text slot becomes visible at. Values are spelled out
 *  (not template-built from the prop) so Tailwind's static scanner can see each literal
 *  class name — `` `hidden ${x}:inline` `` would silently never generate the CSS. */
const WORDMARK_VISIBILITY = {
  sm: "hidden sm:inline",
  md: "hidden md:inline",
  lg: "hidden lg:inline",
  always: "inline",
  never: "hidden"
} as const;

export type WordmarkFrom = keyof typeof WORDMARK_VISIBILITY;

/**
 * Icon + live-text nav lockup. The text is always real DOM text (`children`, or `label`
 * for call sites that hold it as a prop), never the MaggieWordmark art — SiteNav swaps
 * this text to the active learner's personalized trail name after mount.
 *
 * `wordmarkFrom` (default `"sm"`) is the Tailwind breakpoint at/above which the text slot
 * shows; below it, only the icon renders. That default matches today's mobile-portrait
 * behavior (icon-only), now a stated default rather than an inherited accident. Pass
 * `"always"` to show the text at every width, or `"never"` to force icon-only.
 *
 * Renders as a Fragment (no wrapping element) so it drops into an existing flex container
 * — e.g. SiteNav's brand `<Link>` — without adding a DOM layer or disturbing its layout.
 */
export function MaggieBrandLockup({
  children,
  label,
  wordmarkFrom = "sm",
  markSize = 28,
  markClassName
}: {
  children?: React.ReactNode;
  label?: string;
  wordmarkFrom?: WordmarkFrom;
  markSize?: number;
  markClassName?: string;
}) {
  const text = children ?? label ?? null;
  return (
    <>
      <MaggieMark size={markSize} className={markClassName} />
      {text != null && <span className={WORDMARK_VISIBILITY[wordmarkFrom]}>{text}</span>}
    </>
  );
}
