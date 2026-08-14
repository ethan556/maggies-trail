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
import { AVATAR_PLACEHOLDER_SRC, getAvatarSrc, type AvatarSize } from "@/lib/avatars";

export interface AvatarDisplayProps {
  /** A Profile.avatarId or a manifest id being previewed. Absent/invalid/disabled all fall
   *  through to the placeholder — this component never distinguishes why. */
  avatarId?: string;
  /** 256 = grid/picker size, 512 = profile size (OPTIMIZATION_PLAN_V3.md:151). */
  size?: AvatarSize;
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
  fill = false,
  sizes = "(max-width: 640px) 30vw, (max-width: 768px) 22vw, 140px",
  alt = "",
  className = ""
}: AvatarDisplayProps) {
  const src = (avatarId && getAvatarSrc(avatarId, size)) || AVATAR_PLACEHOLDER_SRC;
  if (fill) {
    return <Image src={src} alt={alt} fill sizes={sizes} unoptimized className={className} />;
  }
  return <Image src={src} alt={alt} width={size} height={size} unoptimized className={className} />;
}
