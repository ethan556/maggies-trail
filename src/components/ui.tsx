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

export type IconName =
  | "home"
  | "courses"
  | "review"
  | "daily"
  | "family"
  | "profile"
  | "account"
  | "premium"
  | "more"
  | "sun"
  | "moon"
  | "check"
  | "spark"
  | "flame"
  | "target"
  | "compass"
  | "repeat"
  | "route"
  | "chevronRight"
  | "chevronDown"
  | "arrowLeft"
  | "lock"
  | "trophy"
  | "chart"
  | "notebook"
  | "tally"
  | "operations"
  | "fraction"
  | "ruler"
  | "clock"
  | "shapes"
  | "angle"
  | "scale"
  | "functionCurve"
  | "calculus"
  | "dice"
  /* Trail set — WS-A brand vocabulary, same 24x24 / 2px grammar. */
  | "compassRose"
  | "signpost"
  | "waypoint"
  | "map"
  | "ascent"
  | "trailhead"
  | "bridge"
  | "trailBadge"
  | "summit"
  | "cairn"
  | "pine"
  | "basecamp"
  | "summitFlag"
  | "elevation"
  | "backpack"
  | "lantern"
  | "binoculars"
  | "sunrise"
  | "northStar";

/**
 * One visual grammar: 24×24 grid, 2px rounded strokes, no fills, currentColor.
 * Optical size is controlled by the `size` prop; stroke stays visually constant.
 */
const PATHS: Record<IconName, React.ReactNode> = {
  home: <path d="M4 11.5 12 5l8 6.5M6 10.5V19h12v-8.5" />,
  notebook: <path d="M7 4h10.5v16H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM9.5 4v16M13 9.5h2.5" />,
  /* ---- course-content icons (trail waymarks for topics) ---- */
  tally: <path d="M5 5v14M9 5v14M13 5v14M17 5v14M3.5 16.5 19 8" />,
  operations: (
    <>
      <path d="M7 4.5v6M4 7.5h6" />
      <path d="M14.5 14.5 20 20M20 14.5 14.5 20" />
    </>
  ),
  fraction: (
    <>
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <path d="M10 6v12" />
      <path d="M6.5 9.5h1M6.5 12h1M6.5 14.5h1" />
    </>
  ),
  ruler: (
    <>
      <rect x="3" y="9" width="18" height="6" rx="1.5" />
      <path d="M7 9v3M11 9v3M15 9v3M19 9v3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  shapes: (
    <>
      <path d="M9 4 4 12h10z" />
      <circle cx="16.5" cy="15.5" r="4.5" />
    </>
  ),
  angle: (
    <>
      <path d="M5 19h14M5 19 15 6" />
      <path d="M10.5 19a6 6 0 0 0-1.7-4.2" />
    </>
  ),
  scale: (
    <>
      <path d="M12 4v15M7.5 19.5h9" />
      <path d="M12 6 5 8.5m7-2.5 7 2.5" />
      <path d="M3 12.5 5 8.5l2 4a2.6 2.6 0 0 1-4 0ZM17 12.5l2-4 2 4a2.6 2.6 0 0 1-4 0Z" />
    </>
  ),
  functionCurve: (
    <>
      <path d="M4 19V5M4 19h16" />
      <path d="M5.5 16.5c4-1 5-9 7.5-9s3.5 5 6 5.5" />
    </>
  ),
  calculus: (
    <>
      <path d="M4 18c5 0 6-11 12-12" />
      <path d="M9 8.5 19 15" />
      <circle cx="14" cy="11.7" r="1.4" />
    </>
  ),
  dice: (
    <>
      <rect x="4.5" y="4.5" width="15" height="15" rx="3" />
      <path d="M9 9h.01M15 9h.01M12 12h.01M9 15h.01M15 15h.01" />
    </>
  ),
  courses: (
    <>
      <path d="M5 5.5A1.5 1.5 0 0 1 6.5 4H19v13H6.5A1.5 1.5 0 0 0 5 18.5z" />
      <path d="M5 18.5A1.5 1.5 0 0 1 6.5 20H19" />
    </>
  ),
  review: (
    <>
      <path d="M20 12a8 8 0 1 1-2.3-5.6" />
      <path d="M20 4v4h-4" />
    </>
  ),
  daily: (
    <>
      <path d="M12 7v5l3 2" />
      <circle cx="12" cy="12" r="8" />
    </>
  ),
  family: (
    <>
      <circle cx="8" cy="9" r="2.5" />
      <circle cx="16" cy="9" r="2.5" />
      <path d="M4 19c0-2.5 2-4 4-4s4 1.5 4 4M12 19c0-2.5 2-4 4-4s4 1.5 4 4" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 19c0-3.3 3.1-5 7-5s7 1.7 7 5" />
    </>
  ),
  account: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.5 1.5" />
    </>
  ),
  premium: <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.7l5.4-.8z" />,
  more: (
    <>
      <circle cx="6" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="18" cy="12" r="1.4" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
    </>
  ),
  moon: <path d="M20 13.5A8 8 0 1 1 10.5 4 6.5 6.5 0 0 0 20 13.5z" />,
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  spark: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />,
  flame: <path d="M12 3c1 3-2 4-2 7a4 4 0 0 0 8 0c0-1.5-.8-2.7-1.6-3.6C15.6 8.4 16 11 14 11.5c1-2.4-.6-6.3-2-8.5z" />,
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.6" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15 9-1.6 4.4L9 15l1.6-4.4z" />
    </>
  ),
  repeat: (
    <>
      <path d="M4 9a5 5 0 0 1 5-5h7l-2.5-2.5M20 15a5 5 0 0 1-5 5H8l2.5 2.5" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="18" r="2.2" />
      <circle cx="18" cy="6" r="2.2" />
      <path d="M8 18h6a3 3 0 0 0 0-6H10a3 3 0 0 1 0-6h6" />
    </>
  ),
  chevronRight: <path d="m9 6 6 6-6 6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 4h8v4a4 4 0 0 1-8 0z" />
      <path d="M8 5H5v1a3 3 0 0 0 3 3M16 5h3v1a3 3 0 0 1-3 3M10 12v3M14 12v3M8 20h8M9 20l.5-3h5l.5 3" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V4M4 20h16" />
      <path d="M8 16v-4M12 16V8M16 16v-6" />
    </>
  ),

  /* Trail — navigation */
  compassRose: (
    <>
      <path d="M12 3.3A8.7 8.7 0 0 1 12 20.7 8.7 8.7 0 0 1 12 3.3z" />
      <path d="M12 5.6 13.3 10.7 18.4 12 13.3 13.3 12 18.4 10.7 13.3 5.6 12 10.7 10.7z" />
    </>
  ),
  signpost: (
    <>
      <path d="M12 21.5V3.5" />
      <path d="M12 6H5.2L3 8.5 5.2 11H12" />
      <path d="M12 13.8h6.8l2.2 2.5-2.2 2.5H12" />
    </>
  ),
  waypoint: (
    <>
      <path d="M12 21c0-4.5-5.5-6.2-5.5-10.5a5.5 5.5 0 1 1 11 0C17.5 14.8 12 16.5 12 21z" />
      <path d="M12 10.5h.01" />
    </>
  ),
  map: (
    <>
      <path d="M3 6.6 9 4.4v13L3 19.6z" />
      <path d="M9 4.4 15 6.6v13L9 17.4z" />
      <path d="M15 6.6 21 4.4v13L15 19.6z" />
    </>
  ),

  /* Trail — the path */
  ascent: (
    <>
      <path d="M3.5 19.5c4-.6 6.8-2.8 8.5-6.2S15.6 6.6 20.5 4.8" />
      <path d="M15.6 4.2 20.8 4.6 20.2 9.8" />
    </>
  ),
  trailhead: (
    <>
      <path d="M4 21v-6.8a8 8 0 0 1 16 0V21" />
      <path d="M12 21v-7.6" />
    </>
  ),
  bridge: (
    <>
      <path d="M2.5 16.5h19" />
      <path d="M6.5 16.5V7.5M17.5 16.5V7.5" />
      <path d="M6.5 7.5c3 4.6 8 4.6 11 0" />
      <path d="M9.6 16.5v-3.6M12 16.5v-4.6M14.4 16.5v-3.6" />
    </>
  ),
  trailBadge: (
    <>
      <path d="M12 2.8 20 5.6v6.6c0 4.6-3.6 7.2-8 8.8-4.4-1.6-8-4.2-8-8.8V5.6z" />
      <path d="M8.2 14.4 12 8.8l3.8 5.6z" />
    </>
  ),

  /* Trail — landmarks */
  summit: <path d="M2.5 19.5 9 7.5l3.4 6.2L15.8 8l5.7 11.5z" />,
  cairn: (
    <>
      <path d="M5.5 20.5h13" />
      <path d="M12 20.5c-2.9 0-5.2-1-5.2-2.3s2.3-2.3 5.2-2.3 5.2 1 5.2 2.3-2.3 2.3-5.2 2.3z" />
      <path d="M12 15.5c-2.2 0-3.9-.9-3.9-2s1.7-2 3.9-2 3.9.9 3.9 2-1.7 2-3.9 2z" />
      <path d="M12 11.2c-1.6 0-2.8-.8-2.8-1.7s1.2-1.7 2.8-1.7 2.8.8 2.8 1.7-1.2 1.7-2.8 1.7z" />
    </>
  ),
  pine: (
    <>
      <path d="M12 3 8.4 9h7.2z" />
      <path d="M12 7.4 6.6 15h10.8z" />
      <path d="M12 12 5 20h14z" />
      <path d="M12 20v1.5" />
    </>
  ),
  basecamp: (
    <>
      <path d="M12 4.5 3 20.5h18z" />
      <path d="M12 11 8.6 20.5M12 11l3.4 9.5" />
    </>
  ),
  summitFlag: (
    <>
      <path d="M6.5 21V3.5" />
      <path d="M6.5 5h11l-2.6 3.6L17.5 12h-11" />
    </>
  ),

  /* Trail — terrain */
  elevation: (
    <>
      <path d="M3 19.5h18" />
      <path d="M3.5 16.2 7.5 11l3 3.2 4.2-7.4 3.1 5.4 2.7-2.8" />
    </>
  ),

  /* Trail — kit */
  backpack: (
    <>
      <path d="M7 8.5h10a3 3 0 0 1 3 3V18a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18v-6.5a3 3 0 0 1 3-3z" />
      <path d="M9 8.5V6.8a3 3 0 0 1 6 0v1.7" />
      <path d="M8.5 20.5v-4.8a3.5 3.5 0 0 1 7 0v4.8" />
    </>
  ),
  lantern: (
    <>
      <path d="M10 4.2a2 2 0 0 1 4 0" />
      <path d="M7.6 7h8.8" />
      <path d="M8.8 7h6.4l.6 10.2a1.9 1.9 0 0 1-1.9 2h-3.8a1.9 1.9 0 0 1-1.9-2z" />
      <path d="M12 11v3.6" />
    </>
  ),
  binoculars: (
    <>
      <path d="M6.5 8.5h1.8a2.5 2.5 0 0 1 2.5 2.5v6.5a2.7 2.7 0 0 1-5.4 0V11a2.5 2.5 0 0 1 1.1-2.5z" />
      <path d="M17.5 8.5h-1.8a2.5 2.5 0 0 0-2.5 2.5v6.5a2.7 2.7 0 0 0 5.4 0V11a2.5 2.5 0 0 0-1.1-2.5z" />
      <path d="M10.8 12.5h2.4" />
      <path d="M7 8.5V6.4h2.4v2.1M17 8.5V6.4h-2.4v2.1" />
    </>
  ),

  /* Trail — moments */
  sunrise: (
    <>
      <path d="M3.5 19.5h17" />
      <path d="M7.6 15.9a4.4 4.4 0 0 1 8.8 0" />
      <path d="M12 6.2v2.4M5.6 9.1l1.7 1.7M18.4 9.1l-1.7 1.7M2.8 15.9h2M19.2 15.9h2" />
    </>
  ),
  northStar: <path d="M12 2.8 14.1 9.9 21.2 12 14.1 14.1 12 21.2 9.9 14.1 2.8 12 9.9 9.9z" />
};

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
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      {PATHS[name]}
    </svg>
  );
}

/* ---------------------------------------------------------------- Buttons -- */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const BTN_BASE =
  "pressable inline-flex items-center justify-center gap-2 rounded-card font-bold " +
  "focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45 " +
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
          <AppIcon name={icon ?? "route"} size={17} />
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
 * TANGERINE with a soft ring, the path ahead is a hairline. Injected help
 * steps keep their berry ring and dot-in arrival. Purely presentational —
 * callers own the accessible label.
 */
export function StepSegments({
  total,
  current,
  injected,
  label,
  className = ""
}: {
  total: number;
  current: number;
  injected?: Set<number>;
  label: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-1 items-center gap-1 ${className}`} aria-label={label} role="img">
      {Array.from({ length: total }).map((_, i) => {
        const base =
          i < current
            ? "bg-leaf"
            : i === current
              ? "bg-tangerine shadow-[0_0_0_3px_rgba(255,138,61,0.18)]"
              : "bg-ink/12 dark:bg-paper/18";
        return (
          <span
            key={i}
            data-trail-state={i < current ? "walked" : i === current ? "current" : "ahead"}
            className={`trail-segment h-2 min-w-1 flex-1 rounded-pill transition-[background-color,transform,box-shadow] duration-300 ease-out motion-reduce:transition-none ${base} ${
              injected?.has(i) ? "dot-in ring-2 ring-berry/60" : ""
            }`}
            style={{ "--segment-index": i } as React.CSSProperties}
          />
        );
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
  info: { ring: "border-sky/40 bg-sky/8", icon: "compass", label: "Note" },
  success: { ring: "border-leaf/40 bg-leaf/10", icon: "check", label: "Success" },
  warning: { ring: "border-tangerine/50 bg-tangerine/10", icon: "spark", label: "Heads up" },
  error: { ring: "border-berry/40 bg-berry/10", icon: "repeat", label: "Error" }
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
  icon = "compass",
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
