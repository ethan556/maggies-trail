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

export function MaggieMark({ size = 28, className }: { size?: number; className?: string }) {
  const uid = React.useId().replace(/:/g, "");
  const badgeDepth = `${uid}-badge-depth`;
  const peakLight = `${uid}-peak-light`;
  const trailDepth = `${uid}-trail-depth`;
  const starLight = `${uid}-star-light`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <radialGradient id={badgeDepth} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(31 22) rotate(48) scale(82)">
          <stop stopColor="#2B5577" />
          <stop offset="0.48" stopColor="#12304A" />
          <stop offset="1" stopColor="#071421" />
        </radialGradient>
        <linearGradient id={peakLight} x1="30" y1="34" x2="62" y2="82" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="0.5" stopColor="#F7F3EC" />
          <stop offset="1" stopColor="#DCCEBB" />
        </linearGradient>
        <linearGradient id={trailDepth} x1="35" y1="53" x2="52" y2="79" gradientUnits="userSpaceOnUse">
          <stop stopColor="#173B58" />
          <stop offset="1" stopColor="#071421" />
        </linearGradient>
        <radialGradient id={starLight} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(48 15) rotate(53) scale(13)">
          <stop stopColor="#FFC06A" />
          <stop offset="0.5" stopColor="#F08A24" />
          <stop offset="1" stopColor="#D85F0D" />
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="92" height="92" rx="20" fill="#0D1B2A" />
      <rect x="4" y="4" width="92" height="92" rx="20" fill={`url(#${badgeDepth})`} />
      <rect x="5.25" y="5.25" width="89.5" height="89.5" rx="18.75" fill="none" stroke="#F7F3EC" strokeOpacity="0.16" strokeWidth="1.5" />
      <path d="M14,80 L30,36 L50,54 L70,36 L86,80 Z" fill="#F7F3EC" />
      <path d="M14,80 L30,36 L50,54 L70,36 L86,80 Z" fill={`url(#${peakLight})`} />
      <path
        d="M45.50,78.00 C22.50,78.00 20.50,62.00 33.50,60.00 C47.50,58.00 58.50,56.00 45.50,54.00 L54.50,54.00 C67.50,56.00 56.50,58.00 42.50,60.00 C29.50,62.00 31.50,78.00 54.50,78.00 Z"
        fill="#0D1B2A"
      />
      <path
        d="M45.50,78.00 C22.50,78.00 20.50,62.00 33.50,60.00 C47.50,58.00 58.50,56.00 45.50,54.00 L54.50,54.00 C67.50,56.00 56.50,58.00 42.50,60.00 C29.50,62.00 31.50,78.00 54.50,78.00 Z"
        fill={`url(#${trailDepth})`}
      />
      <path
        d="M50,9 L52.26,16.74 L60,19 L52.26,21.26 L50,29 L47.74,21.26 L40,19 L47.74,16.74 Z"
        fill="#F08A24"
      />
      <path
        d="M50,9 L52.26,16.74 L60,19 L52.26,21.26 L50,29 L47.74,21.26 L40,19 L47.74,16.74 Z"
        fill={`url(#${starLight})`}
      />
    </svg>
  );
}

/**
 * The mark WITHOUT its badge — navy ink straight onto the page.
 *
 * `MaggieMark` above is the app-icon lockup: the art inside a dimensional Deep Navy rounded
 * square, which is what a favicon, a PWA tile and a 28px nav chip need. At display size on
 * an ivory page that badge reads as a boxed-in sticker, so this variant drops the rect and
 * draws the peaks as an OPEN ridgeline — no base edge — with a restrained navy depth layer,
 * a solid trail ribbon and the Summit Orange star. The flat mono asset remains the small-size,
 * single-ink and production fallback.
 *
 * viewBox is cropped to the ink bounds (x 14–86, y 9–80 plus stroke) rather than the badge's
 * 100×100, so the caller sizes the ARTWORK and not the padding around it.
 */
export function MaggieMarkOpen({
  className,
  title
}: {
  className?: string;
  title?: string;
}) {
  const uid = React.useId().replace(/:/g, "");
  const ridge = `${uid}-open-ridge`;
  const trail = `${uid}-open-trail`;
  const star = `${uid}-open-star`;
  return (
    <svg
      viewBox="8 4 84 82"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={ridge} x1="24" y1="30" x2="74" y2="82" gradientUnits="userSpaceOnUse">
          <stop stopColor="#264D70" />
          <stop offset="0.48" stopColor="#0D1B2A" />
          <stop offset="1" stopColor="#071421" />
        </linearGradient>
        <linearGradient id={trail} x1="36" y1="52" x2="52" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2B5577" />
          <stop offset="1" stopColor="#071421" />
        </linearGradient>
        <radialGradient id={star} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(48 15) rotate(53) scale(13)">
          <stop stopColor="#FFC06A" />
          <stop offset="0.5" stopColor="#F08A24" />
          <stop offset="1" stopColor="#D85F0D" />
        </radialGradient>
      </defs>
      <path
        d="M14,80 L30,36 L50,54 L70,36 L86,80"
        fill="none"
        stroke="#0D1B2A"
        strokeOpacity="0.16"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(0 2)"
      />
      <path
        d="M14,80 L30,36 L50,54 L70,36 L86,80"
        fill="none"
        stroke={`url(#${ridge})`}
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M45.50,78.00 C22.50,78.00 20.50,62.00 33.50,60.00 C47.50,58.00 58.50,56.00 45.50,54.00 L54.50,54.00 C67.50,56.00 56.50,58.00 42.50,60.00 C29.50,62.00 31.50,78.00 54.50,78.00 Z"
        fill={`url(#${trail})`}
      />
      <path
        d="M50,9 L52.26,16.74 L60,19 L52.26,21.26 L50,29 L47.74,21.26 L40,19 L47.74,16.74 Z"
        fill={`url(#${star})`}
      />
    </svg>
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
