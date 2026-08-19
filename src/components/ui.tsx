/**
 * Maggie's Trail 2.0 — shared UI primitives.
 *
 * A small, dependency-light component layer that replaces the page-specific
 * Tailwind strings scattered across the app. Every primitive is theme-aware
 * through the semantic tokens (globals.css), keyboard-usable, and honors the
 * app's motion contract (`.pressable` / `.lift` are reduced-motion gated).
 *
 * These do NOT touch the educational rendering layer (figures.tsx / widgets.tsx):
 * the interactive mathematical object stays the loudest thing on a lesson screen.
 */
import Link from "next/link";
import * as React from "react";

/* ------------------------------------------------------------------ Icons -- */

/** Icons carry alphanumeric identifiers only — an icon has no name. Blocks mirror
 *  AVATAR_ART_PRODUCTION_SPEC.md §5's per-band allocation so a later addition never
 *  renumbers an earlier one: 0xx–5xx the duotone trail set, 6xx shell, 7xx chrome,
 *  8xx status/reward, 9xx mathematics. What each id depicts lives in the icon
 *  reference sheet, never in the identifier. */
export type IconName =
  | "icon-601"
  | "icon-602"
  | "icon-603"
  | "icon-604"
  | "icon-605"
  | "icon-606"
  | "icon-607"
  | "icon-608"
  | "icon-609"
  | "icon-706"
  | "icon-707"
  | "icon-704"
  | "icon-801"
  | "icon-802"
  | "icon-803"
  | "icon-808"
  | "icon-806"
  | "icon-807"
  | "icon-701"
  | "icon-702"
  | "icon-703"
  | "icon-705"
  | "icon-804"
  | "icon-805"
  | "icon-901"
  | "icon-902"
  | "icon-903"
  | "icon-904"
  | "icon-905"
  | "icon-906"
  | "icon-907"
  | "icon-908"
  | "icon-909"
  | "icon-910"
  | "icon-911"
  | "icon-912"
  /* Trail set — alphanumeric ids only, per the naming ruling: an icon carries no name,
     just an identifier. Blocks mirror AVATAR_ART_PRODUCTION_SPEC.md §5 so a later
     addition never renumbers an earlier one — 0xx navigation, 1xx the path, 2xx
     landmarks, 3xx terrain, 4xx kit, 5xx moments. What each id depicts lives in the
     icon reference sheet and in public/icons/set/, never in the identifier. */
  | "icon-001"
  | "icon-002"
  | "icon-003"
  | "icon-004"
  | "icon-101"
  | "icon-102"
  | "icon-103"
  | "icon-201"
  | "icon-202"
  | "icon-203"
  | "icon-204"
  | "icon-205"
  | "icon-301"
  | "icon-401"
  | "icon-402"
  | "icon-403"
  | "icon-501"
  | "icon-502";

/**
 * One visual grammar: 24×24 grid, 2px rounded strokes, no fills, currentColor.
 * Optical size is controlled by the `size` prop; stroke stays visually constant.
 */
/** Names rendered by the duotone TONED map below; the rest are single-weight strokes.
 *  Splitting the union this way keeps BOTH maps exhaustive — a new IconName that is in
 *  neither map is a type error, not a blank icon at runtime. */
type TonedIconName = keyof typeof TONED;
type LineIconName = Exclude<IconName, TonedIconName>;

const PATHS: Record<LineIconName, React.ReactNode> = {
  "icon-601": <path d="M4 11.5 12 5l8 6.5M6 10.5V19h12v-8.5" />,
  "icon-901": <path d="M7 4h10.5v16H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM9.5 4v16M13 9.5h2.5" />,
  /* ---- course-content icons (trail waymarks for topics) ---- */
  "icon-902": <path d="M5 5v14M9 5v14M13 5v14M17 5v14M3.5 16.5 19 8" />,
  "icon-903": (
    <>
      <path d="M7 4.5v6M4 7.5h6" />
      <path d="M14.5 14.5 20 20M20 14.5 14.5 20" />
    </>
  ),
  "icon-904": (
    <>
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <path d="M10 6v12" />
      <path d="M6.5 9.5h1M6.5 12h1M6.5 14.5h1" />
    </>
  ),
  "icon-905": (
    <>
      <rect x="3" y="9" width="18" height="6" rx="1.5" />
      <path d="M7 9v3M11 9v3M15 9v3M19 9v3" />
    </>
  ),
  "icon-906": (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  "icon-907": (
    <>
      <path d="M9 4 4 12h10z" />
      <circle cx="16.5" cy="15.5" r="4.5" />
    </>
  ),
  "icon-908": (
    <>
      <path d="M5 19h14M5 19 15 6" />
      <path d="M10.5 19a6 6 0 0 0-1.7-4.2" />
    </>
  ),
  "icon-909": (
    <>
      <path d="M12 4v15M7.5 19.5h9" />
      <path d="M12 6 5 8.5m7-2.5 7 2.5" />
      <path d="M3 12.5 5 8.5l2 4a2.6 2.6 0 0 1-4 0ZM17 12.5l2-4 2 4a2.6 2.6 0 0 1-4 0Z" />
    </>
  ),
  "icon-910": (
    <>
      <path d="M4 19V5M4 19h16" />
      <path d="M5.5 16.5c4-1 5-9 7.5-9s3.5 5 6 5.5" />
    </>
  ),
  "icon-911": (
    <>
      <path d="M4 18c5 0 6-11 12-12" />
      <path d="M9 8.5 19 15" />
      <circle cx="14" cy="11.7" r="1.4" />
    </>
  ),
  "icon-912": (
    <>
      <rect x="4.5" y="4.5" width="15" height="15" rx="3" />
      <path d="M9 9h.01M15 9h.01M12 12h.01M9 15h.01M15 15h.01" />
    </>
  ),
  "icon-602": (
    <>
      <path d="M5 5.5A1.5 1.5 0 0 1 6.5 4H19v13H6.5A1.5 1.5 0 0 0 5 18.5z" />
      <path d="M5 18.5A1.5 1.5 0 0 1 6.5 20H19" />
    </>
  ),
  "icon-603": (
    <>
      <path d="M20 12a8 8 0 1 1-2.3-5.6" />
      <path d="M20 4v4h-4" />
    </>
  ),
  "icon-604": (
    <>
      <path d="M12 7v5l3 2" />
      <circle cx="12" cy="12" r="8" />
    </>
  ),
  "icon-605": (
    <>
      <circle cx="8" cy="9" r="2.5" />
      <circle cx="16" cy="9" r="2.5" />
      <path d="M4 19c0-2.5 2-4 4-4s4 1.5 4 4M12 19c0-2.5 2-4 4-4s4 1.5 4 4" />
    </>
  ),
  "icon-606": (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 19c0-3.3 3.1-5 7-5s7 1.7 7 5" />
    </>
  ),
  "icon-607": (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.5 1.5" />
    </>
  ),
  "icon-608": <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.7l5.4-.8z" />,
  "icon-609": (
    <>
      <circle cx="6" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="18" cy="12" r="1.4" />
    </>
  ),
  "icon-706": (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
    </>
  ),
  "icon-707": <path d="M20 13.5A8 8 0 1 1 10.5 4 6.5 6.5 0 0 0 20 13.5z" />,
  "icon-704": <path d="m5 12.5 4.5 4.5L19 7" />,
  "icon-801": <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />,
  "icon-802": <path d="M12 3c1 3-2 4-2 7a4 4 0 0 0 8 0c0-1.5-.8-2.7-1.6-3.6C15.6 8.4 16 11 14 11.5c1-2.4-.6-6.3-2-8.5z" />,
  "icon-803": (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.6" />
    </>
  ),
  "icon-808": (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15 9-1.6 4.4L9 15l1.6-4.4z" />
    </>
  ),
  "icon-806": (
    <>
      <path d="M4 9a5 5 0 0 1 5-5h7l-2.5-2.5M20 15a5 5 0 0 1-5 5H8l2.5 2.5" />
    </>
  ),
  "icon-807": (
    <>
      <circle cx="6" cy="18" r="2.2" />
      <circle cx="18" cy="6" r="2.2" />
      <path d="M8 18h6a3 3 0 0 0 0-6H10a3 3 0 0 1 0-6h6" />
    </>
  ),
  "icon-701": <path d="m9 6 6 6-6 6" />,
  "icon-702": <path d="m6 9 6 6 6-6" />,
  "icon-703": <path d="M19 12H5M11 6l-6 6 6 6" />,
  "icon-705": (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  "icon-804": (
    <>
      <path d="M8 4h8v4a4 4 0 0 1-8 0z" />
      <path d="M8 5H5v1a3 3 0 0 0 3 3M16 5h3v1a3 3 0 0 1-3 3M10 12v3M14 12v3M8 20h8M9 20l.5-3h5l.5 3" />
    </>
  ),
  "icon-805": (
    <>
      <path d="M4 20V4M4 20h16" />
      <path d="M8 16v-4M12 16V8M16 16v-6" />
    </>
  ),
};

/**
 * Trail set — the duotone half of the vocabulary.
 *
 * The 36 entries in PATHS above are single-weight strokes. These 19 are built from three
 * tones instead, because a line-only glyph cannot carry a second plane and reads flat at
 * display sizes:
 *
 *   fg      currentColor              the subject, as solid mass
 *   tint    currentColor @ 0.26       the plane behind it — theme-safe by construction,
 *                                     since it is the SAME colour at lower alpha and so
 *                                     inverts correctly in dark mode with no variant
 *   accent  var(--icon-accent)        Summit Orange, at most ONCE per icon, on the element
 *                                     that IS the icon's point — the star on the summit,
 *                                     the flame in the lantern, the north half of the
 *                                     needle, the lit door of the tent, the deck you cross
 *
 * Depth is exactly two planes, never three. Pure-environment icons (pine) stay two-tone on
 * purpose: an accent forced into every glyph is what makes a set read as decorated rather
 * than designed.
 *
 * Every path was rendered at 16/20/24/32/64 and reviewed by eye before landing, per
 * CLAUDE.md's "print the generated output and read it" rule.
 */
const ACCENT = "var(--icon-accent, #F08A24)";

const TONED = {
  /* Navigation */
  "icon-001": (
    <>
      <path d="M12 2.4a9.6 9.6 0 1 0 0 19.2 9.6 9.6 0 0 0 0-19.2z" fill="currentColor" opacity={0.26} />
      <path d="M12 2.4a9.6 9.6 0 1 0 0 19.2 9.6 9.6 0 0 0 0-19.2z" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 20.4 9.3 12h5.4z" fill="currentColor" />
      <path d="M12 3.6 14.7 12H9.3z" fill={ACCENT} />
    </>
  ),
  "icon-002": (
    <>
      <path d="M12 22.4c3.4 0 6.2-.4 6.2-1s-2.8-1-6.2-1-6.2.4-6.2 1 2.8 1 6.2 1z" fill="currentColor" opacity={0.26} />
      <path d="M10.8 2.8h2.4v18.3a1.2 1.2 0 0 1-2.4 0z" fill="currentColor" />
      <path d="M13.2 12.7h6.4l2.4 2.8-2.4 2.8h-6.4z" fill="currentColor" />
      <path d="M10.8 5.5H4.4L2 8.3l2.4 2.8h6.4z" fill={ACCENT} />
    </>
  ),
  "icon-003": (
    <>
      <path d="M12 22c2.6 0 4.7-.7 4.7-1.6S14.6 18.8 12 18.8s-4.7.7-4.7 1.6S9.4 22 12 22z" fill="currentColor" opacity={0.26} />
      <path d="M12 1.7a7 7 0 0 0-7 7c0 4.8 7 11.1 7 11.1s7-6.3 7-11.1a7 7 0 0 0-7-7z" fill="currentColor" />
      <path d="M12 6.2a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2z" fill={ACCENT} />
    </>
  ),
  "icon-004": (
    <>
      <path d="M2.3 6.5 8.7 4.2v13.3L2.3 19.8zM15.3 6.5 21.7 4.2v13.3l-6.4 2.3zM8.7 4.2 15.3 6.5v13.3L8.7 17.5z" fill="currentColor" opacity={0.26} />
      <path d="M2.3 6.5 8.7 4.2 15.3 6.5 21.7 4.2v13.3l-6.4 2.3-6.6-2.3-6.4 2.3z" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.7 4.2v13.3M15.3 6.5v13.3" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.2 15.4c2.4-1.2 1.6-3.6 3.6-4.6s3.6.4 5-1.8" stroke={ACCENT} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),

  /* The path */
  "icon-101": (
    <>
      <path d="M1.8 20.8 12.6 5.2 22.2 20.8z" fill="currentColor" opacity={0.26} />
      <path d="M6.6 20.8c2.8-1.6 2.2-4.2 4.4-5.8s2.8-3.6 2.2-5.6" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.6 1.6l.95 2.6 2.6.95-2.6.95-.95 2.6-.95-2.6-2.6-.95 2.6-.95z" fill={ACCENT} />
    </>
  ),
  "icon-102": (
    <>
      <path d="M1.8 19.6h20.4v2.2H1.8z" fill="currentColor" opacity={0.26} />
      <path d="M5.6 4.2h2.6v11.2H5.6zM15.8 4.2h2.6v11.2h-2.6z" fill="currentColor" />
      <path d="M6.9 5c2.6 5.6 7.6 5.6 10.2 0" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.6 15.4v-3.4M12 15.4v-4.4M14.4 15.4v-3.4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1.8 15.4h20.4v2.6H1.8z" fill={ACCENT} />
    </>
  ),
  "icon-103": (
    <>
      <path d="M12 1.6 20.7 4.9v7.1c0 5.1-4 8-8.7 9.6-4.7-1.6-8.7-4.5-8.7-9.6V4.9z" fill="currentColor" />
      <path d="M12 4.1v17.5c-4.7-1.6-8.7-4.5-8.7-9.6V4.9z" fill="currentColor" opacity={0.26} />
      <path d="M8 14.9 12 8.7l4 6.2z" fill={ACCENT} />
    </>
  ),

  /* Landmarks */
  "icon-201": (
    <>
      <path d="M15.6 6.8 22.2 20.6H9z" fill="currentColor" opacity={0.26} />
      <path d="M8.5 9.6 15.2 20.6H1.8z" fill="currentColor" />
      <path d="M18.4 1.4l.9 2.5 2.5.9-2.5.9-.9 2.5-.9-2.5-2.5-.9 2.5-.9z" fill={ACCENT} />
    </>
  ),
  "icon-202": (
    <>
      <path d="M12 22.2c4.5 0 8.1-.5 8.1-1.2s-3.6-1.2-8.1-1.2-8.1.5-8.1 1.2 3.6 1.2 8.1 1.2z" fill="currentColor" opacity={0.26} />
      <path d="M12 15.2c-3.6 0-6.5 1.2-6.5 2.7s2.9 2.7 6.5 2.7 6.5-1.2 6.5-2.7-2.9-2.7-6.5-2.7z" fill="currentColor" />
      <path d="M12 9.9c-2.7 0-4.9 1-4.9 2.3s2.2 2.3 4.9 2.3 4.9-1 4.9-2.3-2.2-2.3-4.9-2.3z" fill="currentColor" />
      <path d="M12 5.2c-1.8 0-3.3.8-3.3 1.9s1.5 1.9 3.3 1.9 3.3-.8 3.3-1.9-1.5-1.9-3.3-1.9z" fill={ACCENT} />
    </>
  ),
  "icon-203": (
    <>
      <path d="M17.6 5.4 22.4 13h-3l3.2 5.6h-9.2L17.2 13h-2.6z" fill="currentColor" opacity={0.26} />
      <path d="M9 2.2 13.8 9.8h-2.7l3.5 6.1h-2.9l3.6 5.5H2.7l3.6-5.5H4.4l3.5-6.1H5.2z" fill="currentColor" />
      <path d="M7.9 21.4h2.2v1.2H7.9z" fill="currentColor" opacity={0.26} />
    </>
  ),
  "icon-204": (
    <>
      <path d="M12 3.2 22.2 20.8H12z" fill="currentColor" opacity={0.26} />
      <path d="M12 3.2 1.8 20.8H12z" fill="currentColor" />
      <path d="M12 11.8 15.6 20.8H8.4z" fill={ACCENT} />
    </>
  ),
  "icon-205": (
    <>
      <path d="M12 22.2c4 0 7.2-.5 7.2-1.1s-3.2-1.1-7.2-1.1-7.2.5-7.2 1.1 3.2 1.1 7.2 1.1z" fill="currentColor" opacity={0.26} />
      <path d="M5.4 2.4h2.2v18.4a1.1 1.1 0 0 1-2.2 0z" fill="currentColor" />
      <path d="M7.6 3.8h12l-2.9 4 2.9 4h-12z" fill={ACCENT} />
    </>
  ),

  /* Terrain */
  "icon-301": (
    <>
      <path d="M2.2 20.4V15l4.6-5.9 3.2 3.5L14.8 4l3.5 6.1 3.5-3.6v13.9z" fill="currentColor" opacity={0.26} />
      <path d="M2.2 20.4h19.6" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.2 16.4 6.8 10.6l3.2 3.5L14.8 5.6l3.5 6.1 3.5-3.6" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.8 5.6a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8z" fill={ACCENT} />
    </>
  ),

  /* Kit */
  "icon-401": (
    <>
      <path d="M7 7.6h10a3.6 3.6 0 0 1 3.6 3.6v7.4A2.8 2.8 0 0 1 17.8 21.4H6.2a2.8 2.8 0 0 1-2.8-2.8v-7.4A3.6 3.6 0 0 1 7 7.6z" fill="currentColor" />
      <path d="M8.4 21.4v-4.9a3.6 3.6 0 0 1 7.2 0v4.9z" fill="currentColor" opacity={0.26} />
      <path d="M8.8 7.6V5.9a3.2 3.2 0 0 1 6.4 0v1.7" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.3 17.6h3.4" stroke={ACCENT} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  "icon-402": (
    <>
      <path d="M8.4 8h7.2l.8 10.4H7.6z" fill="currentColor" opacity={0.26} />
      <path d="M9.2 5.2a2.8 2.8 0 0 1 5.6 0" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.4 5.4h9.2l-1.1 2.6H8.5z" fill="currentColor" />
      <path d="M6.8 18.4h10.4v2.8H6.8z" fill="currentColor" />
      <path d="M12 10.4c1.85 1.7 1.85 4.2 0 5.8-1.85-1.6-1.85-4.1 0-5.8z" fill={ACCENT} />
    </>
  ),
  "icon-403": (
    <>
      <path d="M10.6 10.2h2.8v3.4h-2.8z" fill="currentColor" opacity={0.26} />
      <path d="M6.9 5a4.1 4.1 0 0 1 4.1 4.1v7.1a4.1 4.1 0 0 1-8.2 0V9.1A4.1 4.1 0 0 1 6.9 5zM17.1 5a4.1 4.1 0 0 1 4.1 4.1v7.1a4.1 4.1 0 0 1-8.2 0V9.1A4.1 4.1 0 0 1 17.1 5z" fill="currentColor" />
      <path d="M6.9 13.9a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8zM17.1 13.9a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8z" fill={ACCENT} />
    </>
  ),

  /* Moments */
  "icon-501": (
    <>
      <path d="M12 3.4v2.8M4.6 6.5l2 2M19.4 6.5l-2 2M1.6 15.4h2.6M19.8 15.4h2.6" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" opacity={0.26} />
      <path d="M12 9.4a6 6 0 0 0-6 6h12a6 6 0 0 0-6-6z" fill={ACCENT} />
      <path d="M2.2 18.2h19.6M6.6 21.4h10.8" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  "icon-502": (
    <>
      <path d="M12 1.4 14.8 9.2 22.6 12 14.8 14.8 12 22.6 9.2 14.8 1.4 12 9.2 9.2z" fill="currentColor" opacity={0.26} />
      <path d="M12 4.6 13.9 10.1 19.4 12 13.9 13.9 12 19.4 10.1 13.9 4.6 12 10.1 10.1z" fill={ACCENT} />
    </>
  ),
} satisfies Partial<Record<IconName, React.ReactNode>>;

export function AppIcon({
  name,
  size = 20,
  className,
  title
}: {
  name: IconName;
  size?: number;
  className?: string;
  title?: string;
}) {
  const toned = (TONED as Partial<Record<IconName, React.ReactNode>>)[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...(toned
        ? {}
        : {
            stroke: "currentColor",
            strokeWidth: 2,
            strokeLinecap: "round" as const,
            strokeLinejoin: "round" as const
          })}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      {toned ?? PATHS[name as LineIconName]}
    </svg>
  );
}

/* ---------------------------------------------------------------- Buttons -- */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

/* S242 / ACC-01. `focus-visible:outline-none` used to sit here with NO replacement indicator, and
 * its specificity (0,2,0) beat the global `:focus-visible` rule (0,1,0) — so every `<Button>` and
 * `<ButtonLink>` in the app had no visible focus ring at all. A clean WCAG 2.4.7 (Level AA)
 * failure, one token wide, recorded in `reports/acc/ACC01_ACCESSIBILITY_MATRIX.md` row d1.
 *
 * The fix is to delete the token rather than to add a parallel Tailwind ring: the app already HAS a
 * designed focus indicator, and a second one would drift from it. The reason this token was
 * plausibly added — the global rule forced `border-radius: 4px` onto the focused element, squaring
 * off a `rounded-card` button — is fixed at its source in `globals.css`. */
const BTN_BASE =
  "pressable inline-flex items-center justify-center gap-2 rounded-card font-bold " +
  "disabled:cursor-not-allowed disabled:opacity-45 " +
  "disabled:shadow-none";

const BTN_VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-cta text-white shadow-e1 enabled:hover:bg-primary-hover enabled:hover:shadow-e2 enabled:active:bg-primary-press",
  secondary:
    "border-2 border-ink/15 bg-surface text-content enabled:hover:border-sky enabled:hover:text-sky-ink dark:border-paper/20",
  ghost:
    "text-content enabled:hover:bg-sky/10 dark:enabled:hover:bg-sky/20",
  danger:
    "bg-cta-danger text-white shadow-e1 enabled:hover:bg-berry/90"
};

const BTN_SIZE: Record<ButtonSize, string> = {
  sm: "min-h-11 px-3.5 text-sm",
  md: "min-h-11 px-5 text-base",
  lg: "min-h-12 px-6 py-3 text-lg"
};

type CommonBtn = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconRight?: IconName;
  className?: string;
  children: React.ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  className = "",
  children,
  type = "button",
  ...rest
}: CommonBtn & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={`${BTN_BASE} ${BTN_VARIANT[variant]} ${BTN_SIZE[size]} ${className}`} {...rest}>
      {icon && <AppIcon name={icon} size={size === "lg" ? 22 : 18} />}
      {children}
      {iconRight && <AppIcon name={iconRight} size={size === "lg" ? 22 : 18} />}
    </button>
  );
}

/** A button that navigates. Same visual language as Button. */
export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  className = "",
  children
}: CommonBtn & { href: string }) {
  return (
    <Link href={href} className={`${BTN_BASE} ${BTN_VARIANT[variant]} ${BTN_SIZE[size]} ${className}`}>
      {icon && <AppIcon name={icon} size={size === "lg" ? 22 : 18} />}
      {children}
      {iconRight && <AppIcon name={iconRight} size={size === "lg" ? 22 : 18} />}
    </Link>
  );
}

/* ------------------------------------------------------------ Surface/Card -- */

/**
 * Surface: a neutral container. `tone` sets background; `border` and `elevation`
 * are opt-in so cards are no longer automatically bordered rectangles.
 */
export function Surface({
  as: Tag = "div",
  tone = "surface",
  border = false,
  elevation = "none",
  className = "",
  children,
  ...rest
}: {
  as?: React.ElementType;
  tone?: "surface" | "surface-2" | "bg-2" | "none";
  border?: boolean;
  elevation?: "none" | "e1" | "e2";
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  const bg = tone === "none" ? "" : tone === "surface" ? "bg-surface" : tone === "surface-2" ? "bg-surface-2" : "bg-bg-2";
  const brd = border ? "border border-ink/10 dark:border-paper/12" : "";
  const elev = elevation === "e1" ? "shadow-e1" : elevation === "e2" ? "shadow-e2" : "";
  return (
    <Tag className={`rounded-card ${bg} ${brd} ${elev} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/* -------------------------------------------------------------- Badges ----- */

type BadgeTone = "neutral" | "sky" | "leaf" | "tangerine" | "berry" | "muted";
const BADGE_TONE: Record<BadgeTone, string> = {
  neutral: "bg-ink/8 text-ink/80 dark:bg-paper/10 dark:text-paper/80",
  sky: "bg-sky/12 text-sky-ink",
  leaf: "bg-leaf/12 text-leaf-ink",
  tangerine: "bg-tangerine/15 text-[#B5581F] dark:text-tangerine-ink",
  berry: "bg-berry/12 text-berry-ink",
  muted: "bg-ink/6 text-muted dark:bg-paper/8"
};

export function Badge({
  tone = "neutral",
  icon,
  className = "",
  children
}: {
  tone?: BadgeTone;
  icon?: IconName;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-xs font-bold ${BADGE_TONE[tone]} ${className}`}
    >
      {icon && <AppIcon name={icon} size={13} />}
      {children}
    </span>
  );
}

/* -------------------------------------------------------- Section heading -- */

export function SectionHeader({
  title,
  icon,
  action,
  waymark = false,
  as: Tag = "h2",
  className = ""
}: {
  title: string;
  icon?: IconName;
  action?: React.ReactNode;
  /** Trail-waymark treatment: icon roundel + a fading rail line after the title. */
  waymark?: boolean;
  /** Heading level. Pages whose title IS this header pass "h1" so every route
   * keeps a document-level heading (axe page-has-heading-one); nested sections
   * keep the default "h2". Visual size is unchanged either way. */
  as?: "h1" | "h2";
  className?: string;
}) {
  if (!waymark)
    return (
      <div className={`mb-3 flex items-center justify-between gap-3 ${className}`}>
        <Tag className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          {icon && <AppIcon name={icon} size={20} className="text-sky-ink" />}
          {title}
        </Tag>
        {action}
      </div>
    );
  return (
    <div className={`mb-3 flex items-center gap-3 ${className}`}>
      <Tag className="flex min-w-0 items-center gap-2.5 text-lg font-extrabold tracking-tight">
        <span
          aria-hidden
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-sky/10 text-sky-ink"
        >
          <AppIcon name={icon ?? "icon-807"} size={17} />
        </span>
        <span className="truncate">{title}</span>
      </Tag>
      <span
        aria-hidden
        className="h-px min-w-4 flex-1 bg-gradient-to-r from-ink/15 to-transparent dark:from-paper/15"
      />
      {action && <span className="shrink-0">{action}</span>}
    </div>
  );
}

/* ------------------------------------------------- Segmented step bar ----- */

/**
 * The broken progress bar over a sitting: one segment per step, filling the
 * row. Walked segments are LEAF (the trail grammar), the current step is
 * TANGERINE with a raised ring, and the path ahead is a cool-slate dashed
 * hairline. The state is exposed in both text and visual treatment, so colour
 * is never the only progress signal. Injected help steps keep their berry ring
 * and dot-in arrival.
 */
export type StepProgress = {
  total: number;
  current: number;
  completed: number;
  remaining: number;
};

/**
 * Normalise untrusted caller values into the strip's non-negotiable contract:
 * one visible segment per item and exactly one current segment. Lesson queues
 * are never empty in production, but this makes the shared primitive safe for
 * transient retry/loading state too.
 */
export function normalizeStepProgress(total: number, current: number): StepProgress {
  const normalizedTotal = Number.isFinite(total) ? Math.max(1, Math.trunc(total)) : 1;
  const normalizedCurrent = Number.isFinite(current)
    ? Math.min(normalizedTotal - 1, Math.max(0, Math.trunc(current)))
    : 0;
  return {
    total: normalizedTotal,
    current: normalizedCurrent,
    completed: normalizedCurrent,
    remaining: normalizedTotal - normalizedCurrent - 1
  };
}

export function StepSegments({
  total,
  current,
  injected,
  label,
  reviewingIndex = null,
  onSelectCompleted,
  className = ""
}: {
  total: number;
  current: number;
  injected?: Set<number>;
  label: string;
  reviewingIndex?: number | null;
  onSelectCompleted?: (index: number) => void;
  className?: string;
}) {
  const progress = normalizeStepProgress(total, current);
  const descriptionId = React.useId();
  const interactive = typeof onSelectCompleted === "function";
  const segmentStates = Array.from({ length: progress.total }, (_, index) => {
    const state = index < progress.current ? "completed" : index === progress.current ? "current" : "remaining";
    return `Item ${index + 1}: ${state}.`;
  }).join(" ");

  return (
    <div
      aria-describedby={descriptionId}
      aria-label={label}
      className={`flex min-w-0 flex-1 items-center gap-1 py-1 ${className}`}
      data-progress-completed={progress.completed}
      data-progress-current={progress.current + 1}
      data-progress-remaining={progress.remaining}
      data-progress-reviewing={reviewingIndex === null ? undefined : reviewingIndex + 1}
      data-progress-strip
      data-progress-total={progress.total}
      role={interactive ? "group" : "img"}
    >
      <p className="sr-only" id={descriptionId}>
        {`${progress.completed} completed; item ${progress.current + 1} of ${progress.total} is current; ${progress.remaining} remaining. ${segmentStates}`}
      </p>
      {Array.from({ length: progress.total }).map((_, i) => {
        const state = i < progress.current ? "completed" : i === progress.current ? "current" : "remaining";
        const base =
          state === "completed"
            ? "border border-leaf/80 bg-leaf"
            : state === "current"
              ? "scale-y-125 border border-tangerine/80 bg-tangerine shadow-[0_0_0_3px_rgba(255,138,61,0.22)]"
              : "border border-dashed border-slate-400/70 bg-ink/12 !bg-slate-300/55 dark:border-slate-400/65 dark:!bg-slate-500/30";
        const visual = (
          <span
            aria-hidden
            data-progress-state={state}
            data-trail-state={state === "completed" ? "walked" : state === "current" ? "current" : "ahead"}
            key={i}
            className={`trail-segment h-2 min-w-1 flex-1 rounded-pill transition-[background-color,border-color,transform,box-shadow] duration-300 ease-out motion-reduce:transition-none ${base} ${
              injected?.has(i) ? "dot-in ring-2 ring-berry/60" : ""
            }`}
            style={{ "--segment-index": i } as React.CSSProperties}
            title={`Item ${i + 1} of ${progress.total}: ${state}.`}
          />
        );
        if (interactive && state === "completed") {
          return (
            <button
              type="button"
              key={i}
              aria-current={reviewingIndex === i ? "step" : undefined}
              aria-label={`Review completed item ${i + 1} of ${progress.total}`}
              className="trail-segment-control flex min-h-7 min-w-1 flex-1 items-center rounded-pill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky focus-visible:ring-offset-2"
              data-reviewing={reviewingIndex === i ? "true" : undefined}
              onClick={() => onSelectCompleted(i)}
              title={`Review completed item ${i + 1} of ${progress.total}`}
            >
              {visual}
            </button>
          );
        }
        return visual;
      })}
    </div>
  );
}
/* ----------------------------------------------------------- Stat tile ----- */

export function StatTile({
  label,
  value,
  icon,
  tone = "neutral"
}: {
  label: string;
  value: React.ReactNode;
  icon?: IconName;
  tone?: BadgeTone;
}) {
  const accent =
    tone === "sky" ? "text-sky-ink" : tone === "leaf" ? "text-leaf-ink" : tone === "tangerine" ? "text-tangerine-ink" : tone === "berry" ? "text-berry-ink" : "text-muted";
  return (
    <div className="rounded-card bg-surface-2 px-4 py-3">
      <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${accent}`}>
        {icon && <AppIcon name={icon} size={14} />}
        {label}
      </div>
      <div className="mt-1 text-2xl font-extrabold tabular-nums text-content">{value}</div>
    </div>
  );
}

/* ------------------------------------------------------------- Notice ------ */

type NoticeTone = "info" | "success" | "warning" | "error";
const NOTICE: Record<NoticeTone, { ring: string; icon: IconName; label: string }> = {
  info: { ring: "border-sky/40 bg-sky/8", icon: "icon-808", label: "Note" },
  success: { ring: "border-leaf/40 bg-leaf/10", icon: "icon-704", label: "Success" },
  warning: { ring: "border-tangerine/50 bg-tangerine/10", icon: "icon-801", label: "Heads up" },
  error: { ring: "border-berry/40 bg-berry/10", icon: "icon-806", label: "Error" }
};

export function Notice({
  tone = "info",
  role = "note",
  className = "",
  children
}: {
  tone?: NoticeTone;
  role?: "note" | "status" | "alert";
  className?: string;
  children: React.ReactNode;
}) {
  const t = NOTICE[tone];
  return (
    <div
      role={role}
      className={`flex items-start gap-2.5 rounded-card border ${t.ring} px-4 py-3 text-sm font-medium text-content ${className}`}
    >
      <AppIcon name={t.icon} size={18} className="mt-0.5 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/* --------------------------------------------------------- Progress bar ---- */

export function ProgressBar({
  value,
  max = 100,
  tone = "sky",
  label,
  className = ""
}: {
  value: number;
  max?: number;
  tone?: "sky" | "leaf" | "tangerine";
  label?: string;
  className?: string;
}) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  const fill = tone === "leaf" ? "bg-leaf" : tone === "tangerine" ? "bg-tangerine" : "bg-sky";
  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-pill bg-ink/10 dark:bg-paper/12 ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className={`progress-fill h-full rounded-pill ${fill}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ---------------------------------------------------------- Empty state ---- */

export function EmptyState({
  icon = "icon-808",
  title,
  children,
  action
}: {
  icon?: IconName;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-card border border-dashed border-ink/15 bg-surface-2 px-6 py-10 text-center dark:border-paper/15">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-pill bg-sky/10 text-sky-ink">
        <AppIcon name={icon} size={24} />
      </div>
      <p className="text-base font-extrabold text-content">{title}</p>
      {children && <div className="mx-auto mt-1 max-w-sm text-sm text-content-2">{children}</div>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

/** One visual grammar for every footer status: icon roundel + title + body,
 * tinted wash instead of a heavy box, so the diagnosis reads as a note pinned
 * beside the work rather than a wall in front of it. */
export function StatusBanner({
  tone,
  icon,
  title,
  titleExtra,
  children
}: {
  tone: "success" | "error" | "info" | "leaf-info";
  icon: IconName;
  title: string;
  titleExtra?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const c =
    tone === "success" || tone === "leaf-info"
      ? { wash: "bg-leaf/10", edge: "border-leaf/60", ic: "bg-leaf", tx: "text-leaf-ink" }
      : tone === "error"
        ? { wash: "bg-berry/10", edge: "border-berry/60", ic: "bg-berry", tx: "text-berry-ink" }
        : { wash: "bg-sky/10", edge: "border-sky/60", ic: "bg-sky", tx: "text-sky-ink" };
  return (
    <div role="status" className={`banner-in mb-3 rounded-card border-l-4 ${c.edge} ${c.wash} px-4 py-3`}>
      <div className="flex items-start gap-3">
        <span
          className={`status-pop mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-pill ${c.ic} text-white`}
          aria-hidden="true"
        >
          <AppIcon name={icon} size={14} />
        </span>
        <div className="min-w-0 flex-1">
          <p className={`flex flex-wrap items-center gap-x-2 font-bold ${c.tx}`}>
            <span>{title}</span>
            {titleExtra}
          </p>
          {children}
        </div>
      </div>
    </div>
  );
}

/** The three progressive rungs a challenge's authored hint ladder climbs. */
export const HINT_RUNGS = ["Nudge", "Strategy", "Worked step"] as const;
