import Image from "next/image";
import { AvatarDisplay } from "@/components/AvatarDisplay";
import type { AvatarCustomization } from "@/lib/avatars";

/**
 * Shared learner identity for consolidation and progress moments only. Keeping AvatarDisplay
 * behind this component prevents practice, review, daily and lesson code from placing identity
 * beside a maths prompt by accident.
 */
export function CompletionIdentity({
  avatarId,
  customization,
  variant = "celebration"
}: {
  avatarId?: string;
  customization?: AvatarCustomization;
  variant?: "celebration" | "compact";
}) {
  if (variant === "compact") {
    return (
      <span data-completion-identity="compact" aria-hidden="true" className="inline-flex shrink-0">
        <AvatarDisplay
          avatarId={avatarId}
          customization={customization}
          size={256}
          placement="completion"
          displaySize={40}
          className="h-10 w-10 rounded-full border-2 border-surface ring-2 ring-ink/10 dark:ring-paper/15"
        />
      </span>
    );
  }

  return (
    <div
      data-completion-identity="celebration"
      className="mb-3 flex items-end justify-center -space-x-2"
      aria-hidden="true"
    >
      <Image src="/brand/maggies-mark.svg" alt="" width={56} height={56} unoptimized priority />
      <AvatarDisplay
        avatarId={avatarId}
        customization={customization}
        size={256}
        placement="completion"
        displaySize={56}
        className="h-14 w-14 rounded-full border-2 border-surface ring-2 ring-ink/10 dark:ring-paper/15"
      />
    </div>
  );
}
