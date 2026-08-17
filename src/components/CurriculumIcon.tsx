import Image from "next/image";
import { AppIcon } from "@/components/ui";
import {
  curriculumIconAsset,
  type CurriculumIllustrationId
} from "@/lib/curriculumIcons";
import styles from "./CurriculumIcon.module.css";

/**
 * Progressive curriculum illustration.
 *
 * A production WebP renders only when its registry entry is explicitly enabled. Before that,
 * callers get the dimensional code-native treatment—not a broken image, hidden placeholder or
 * line glyph presented as finished painterly art. `data-art-status` keeps that distinction
 * inspectable in tests and browser QA.
 */
export function CurriculumIcon({
  id,
  size = 48,
  title,
  className = "",
  priority = false
}: {
  id: CurriculumIllustrationId;
  size?: number;
  /** Omit when the adjacent visible heading already names the subject. */
  title?: string;
  className?: string;
  priority?: boolean;
}) {
  const asset = curriculumIconAsset(id);
  const accessible = Boolean(title);
  const glyphSize = Math.max(12, Math.round(size * 0.54));
  const labelSize = Math.max(9, Math.round(size * (asset.fallbackText && asset.fallbackText.length > 2 ? 0.22 : 0.3)));

  return (
    <span
      className={`${styles.frame} ${className}`}
      style={{ width: size, height: size }}
      data-illustration-id={id}
      data-art-status={asset.enabled ? "production" : "code-native-fallback"}
      role={accessible ? "img" : undefined}
      aria-label={title}
      aria-hidden={accessible ? undefined : true}
    >
      <span className={styles.fallback} aria-hidden="true">
        {asset.fallbackText ? (
          <span className={styles.gradeLabel} style={{ fontSize: labelSize }}>
            {asset.fallbackText}
          </span>
        ) : (
          <AppIcon name={asset.fallbackIcon} size={glyphSize} className={styles.glyph} />
        )}
      </span>
      {asset.enabled && (
        <Image
          src={asset.src}
          alt=""
          width={size}
          height={size}
          sizes={`${size}px`}
          unoptimized
          priority={priority}
          className={styles.image}
        />
      )}
    </span>
  );
}
