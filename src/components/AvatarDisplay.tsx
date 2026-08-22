/**
 * WS-J — the single place a `Profile.avatarId` (or a picker tile's candidate id) becomes a
 * rendered image.
 *
 * Fallback chain (OPTIMIZATION_PLAN_V3.md:147, corrected per the WS-J research report — there is
 * no legacy avatar-image system to retain): a valid, currently-*enabled* avatarId resolves through
 * `getAvatarSrc`; anything else — absent, unknown, or a since-disabled id — falls back to the
 * honest placeholder silhouette (`AVATAR_PLACEHOLDER_SRC`). Never a broken image, never invented
 * art. `getAvatarSrc` already gates on `isValidAvatarId`, so this component doesn't duplicate that
 * check — it just supplies the guaranteed-renderable fallback `getAvatarSrc` deliberately omits.
 *
 * `next/image` with `unoptimized` matches the codebase's one existing local-asset convention
 * (`MaggieMark`/`MaggieWordmark` in `brand.tsx`, the mark in `LessonPlayer.tsx`) — and
 * `next.config.js` already sets `images.unoptimized: true` globally (S205 hardening), so this
 * never touches the `/_next/image` optimizer either way.
 */
import Image from "next/image";
import {
  AVATAR_PLACEHOLDER_SRC,
  DEFAULT_AVATAR_CUSTOMIZATION,
  getAvatar,
  getAvatarSrc,
  type AvatarCustomization,
  type AvatarSize
} from "@/lib/avatars";

export type AvatarPlacement =
  | "navigation"
  | "dense-list"
  | "summary"
  | "trail"
  | "completion"
  | "profile"
  | "picker";

/**
 * Hard visual-space budgets for learner identity. These are deliberately small: identity may
 * orient or celebrate, but it must never compete with mathematics. `picker` is the sole fill
 * context and is already confined to the explicit profile/onboarding chooser.
 */
export const AVATAR_PLACEMENT_MAX_PX: Readonly<Record<AvatarPlacement, number>> = {
  navigation: 24,
  "dense-list": 36,
  summary: 48,
  trail: 48,
  completion: 56,
  profile: 80,
  picker: 256
};

export interface AvatarDisplayProps {
  /** A Profile.avatarId or a manifest id being previewed. Absent/invalid/disabled all fall
   *  through to the placeholder — this component never distinguishes why. */
  avatarId?: string;
  /** 256 = grid/picker size, 512 = profile size (OPTIMIZATION_PLAN_V3.md:151). */
  size?: AvatarSize;
  /** The product surface using the avatar. Required so layout remains within its space budget. */
  placement: AvatarPlacement;
  /** Requested rendered edge for fixed images. It is clamped to the placement budget. */
  displaySize?: number;
  /** Restrained overlay choices. They never alter the underlying reviewed portrait pixels. */
  customization?: AvatarCustomization;
  /** Fill mode for a positioned parent that already owns the aspect ratio (picker tiles).
   *  Fixed width/height otherwise (standalone previews). */
  fill?: boolean;
  /** `sizes` for fill mode; ignored otherwise. A reasonable default for a 2-5 column grid. */
  sizes?: string;
  /** Decorative ("") by default. A caller rendering this as the ONLY content of an interactive
   *  control (a picker tile's <button>) must put the real accessible name on that control itself
   *  (see AvatarPicker) — an <img alt> AND a wrapping button's aria-label would both be announced,
   *  doubling up. Pass a real alt only for a bare, non-interactive, standalone image. */
  alt?: string;
  className?: string;
}

export function AvatarDisplay({
  avatarId,
  size = 256,
  placement,
  displaySize,
  customization = DEFAULT_AVATAR_CUSTOMIZATION,
  fill = false,
  sizes = "(max-width: 640px) 30vw, (max-width: 768px) 22vw, 140px",
  alt = "",
  className = ""
}: AvatarDisplayProps) {
  const resolvedSrc = avatarId && getAvatarSrc(avatarId, size);
  const src = resolvedSrc || AVATAR_PLACEHOLDER_SRC;
  const renderedSize = Math.max(
    1,
    Math.min(
      displaySize ?? AVATAR_PLACEMENT_MAX_PX[placement],
      AVATAR_PLACEMENT_MAX_PX[placement]
    )
  );
  const avatarKind = avatarId ? getAvatar(avatarId)?.kind : undefined;
  const accentColor = {
    none: undefined,
    navy: "#0D1B2A",
    orange: "#F08A24",
    teal: "#197C78",
    violet: "#7357A8"
  }[customization.accent];
  const showGlasses = Boolean(resolvedSrc && avatarKind === "human" && customization.glasses !== "none");
  const badgeText = { none: "", trail: "◆", star: "★", pi: "π" }[customization.badge];
  const showBadge = Boolean(resolvedSrc && badgeText && (fill || renderedSize >= 32));
  const image = fill ? (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        unoptimized
        className={className}
        data-avatar-placement={placement}
        data-avatar-max-px={AVATAR_PLACEMENT_MAX_PX[placement]}
      />
  ) : (
    <Image
      src={src}
      alt={alt}
      width={renderedSize}
      height={renderedSize}
      unoptimized
      className={className}
      data-avatar-placement={placement}
      data-avatar-max-px={AVATAR_PLACEMENT_MAX_PX[placement]}
    />
  );

  return (
    <span
      className={fill ? "absolute inset-0" : "relative inline-flex shrink-0"}
      style={
        fill
          ? { borderRadius: "9999px", boxShadow: accentColor ? `inset 0 0 0 3px ${accentColor}` : undefined }
          : {
              width: renderedSize,
              height: renderedSize,
              borderRadius: "9999px",
              boxShadow: accentColor ? `inset 0 0 0 2px ${accentColor}` : undefined
            }
      }
      data-avatar-customized={showGlasses || showBadge || Boolean(accentColor) ? "true" : "false"}
    >
      {image}
      {showGlasses && (
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          {customization.glasses === "round" ? (
            <>
              <circle cx="36" cy="47" r="12" fill="none" stroke="#18222D" strokeWidth="4" />
              <circle cx="64" cy="47" r="12" fill="none" stroke="#18222D" strokeWidth="4" />
            </>
          ) : (
            <>
              <rect x="24" y="37" width="24" height="19" rx="5" fill="none" stroke="#18222D" strokeWidth="4" />
              <rect x="52" y="37" width="24" height="19" rx="5" fill="none" stroke="#18222D" strokeWidth="4" />
            </>
          )}
          <path d="M48 45 Q50 42 52 45 M22 43 L13 40 M78 43 L87 40" fill="none" stroke="#18222D" strokeWidth="4" strokeLinecap="round" />
        </svg>
      )}
      {showBadge && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[3%] right-[3%] flex h-[28%] w-[28%] items-center justify-center rounded-full bg-ink font-extrabold leading-none text-paper shadow-e1 dark:bg-paper dark:text-ink"
          style={{ fontSize: fill ? undefined : Math.max(7, Math.round(renderedSize * 0.17)) }}
        >
          {badgeText}
        </span>
      )}
    </span>
  );
}
