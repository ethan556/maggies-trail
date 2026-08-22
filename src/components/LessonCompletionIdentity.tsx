import { CompletionIdentity } from "@/components/CompletionIdentity";
import type { AvatarCustomization } from "@/lib/avatars";

/** Identity appears at the consolidation/celebration boundary only, never beside a maths prompt. */
export function LessonCompletionIdentity({
  avatarId,
  customization
}: {
  avatarId?: string;
  customization?: AvatarCustomization;
}) {
  return <CompletionIdentity avatarId={avatarId} customization={customization} />;
}
