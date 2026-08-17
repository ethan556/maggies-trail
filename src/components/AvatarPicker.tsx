"use client";

/**
 * WS-J — the one avatar picker, used identically in onboarding and on the profile page
 * (OPTIMIZATION_PLAN_V3.md:148: "Picker (one component, used in onboarding and profile)").
 *
 * Grade opens the right collection; "See all avatars" is always available so any learner can
 * browse any band (a younger learner may pick any collection; an older one may pick a symbol —
 * symbols already carry a real `ageBand` and sit inside their band's grid, so no separate
 * human/symbol toggle is needed). Selection commits the instant a tile is activated — the caller
 * decides what "immediately" means (onboarding persists straight to the profile store; the
 * profile page does the same) — this component only ever reports the choice via `onChange`.
 *
 * Only approved, enabled art is selectable. Concept-only slots never become repeated placeholder
 * choices: an unreleased collection gets one honest empty state. The 60-item core and the separate
 * mathematics-symbol extension each release all-or-none, enforced by their asset contracts.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AVATARS,
  getAvatar,
  getAvatarsForAgeBand,
  gradeToAgeBand,
  type AgeBand
} from "@/lib/avatars";
import {
  getEnabledMathSymbolAvatars,
  getMathSymbolAvatar,
  MATH_SYMBOL_AVATARS
} from "@/lib/mathSymbolAvatars";
import { AvatarDisplay } from "@/components/AvatarDisplay";
import { AppIcon } from "@/components/ui";

const BANDS: AgeBand[] = ["early", "explorer", "adventurer", "summit"];
type AvatarCollection = AgeBand | "math-symbols";
const BAND_LABEL: Record<AgeBand, string> = {
  early: "Early (K–2)",
  explorer: "Explorer (3–5)",
  adventurer: "Adventurer (6–8)",
  summit: "Summit (9–13)"
};
const COLLECTION_LABEL: Record<AvatarCollection, string> = {
  ...BAND_LABEL,
  "math-symbols": "Math symbols"
};

/** A stable, non-identifying label for a human portrait — "Avatar 7", never a trait description.
 * Mathematics symbols use their exact semantic name because "Avatar 61" is not equivalent access
 * to a visible π. Position within the FULL manifest remains stable for visual ordering. */
const AVATAR_NUMBER = new Map([...AVATARS, ...MATH_SYMBOL_AVATARS].map((a, i) => [a.id, i + 1]));

export function avatarPickerAccessibleLabel(
  avatar: { id: string; semanticName?: string },
  number: number,
  isSelected: boolean
): string {
  const baseLabel =
    typeof avatar.semanticName === "string" ? avatar.semanticName : `Avatar ${number}`;
  return isSelected ? `${baseLabel} selected` : baseLabel;
}

export interface AvatarPickerProps {
  /** Currently chosen avatarId, or undefined for "none yet". Controlled. */
  value?: string;
  /** Fires the instant a selectable tile is activated — click, Enter, or Space. */
  onChange: (id: string) => void;
  /** Opens the grade-appropriate collection by default (OPTIMIZATION_PLAN_V3.md:148). Absent when
   *  the caller has no grade signal (e.g. a returning profile with no onboarding on record) — the
   *  picker still opens on a reasonable default band and "See all avatars" reaches every other. */
  grade?: number;
}

export function AvatarPicker({ value, onChange, grade }: AvatarPickerProps) {
  const selectedAvatar = value ? getAvatar(value) : undefined;
  const selectedMathAvatar = value ? getMathSymbolAvatar(value) : undefined;
  const selectedCollection: AvatarCollection | undefined =
    selectedMathAvatar?.collection ?? selectedAvatar?.ageBand;
  const [activeCollection, setActiveCollection] = useState<AvatarCollection>(
    () => selectedCollection ?? (grade !== undefined ? gradeToAgeBand(grade) : "explorer")
  );
  const [seeAll, setSeeAll] = useState(false);

  const enabledTiles = useMemo(
    () =>
      activeCollection === "math-symbols"
        ? getEnabledMathSymbolAvatars()
        : getAvatarsForAgeBand(activeCollection),
    [activeCollection]
  );
  const availableCollections = useMemo(
    () => [
      ...BANDS.filter((band) => getAvatarsForAgeBand(band).length > 0),
      ...(getEnabledMathSymbolAvatars().length > 0 ? (["math-symbols"] as const) : [])
    ],
    []
  );

  // Roving tabindex: exactly one tile is ever a tab stop — the selected one if it's in the
  // current band and enabled, else the first enabled tile, else none. Arrow keys walk the flat
  // sequence of enabled tiles rather than true 2D geometry: the grid's column count changes at every breakpoint
  // (3/4/5 — see the className below), so up/down math keyed to a fixed column count would
  // desync from what's actually on screen; a flat previous/next sequence stays correct at every
  // width and keeps every enabled tile reachable.
  const [focusedId, setFocusedId] = useState<string | null>(
    () => enabledTiles.find((t) => t.id === value)?.id ?? enabledTiles[0]?.id ?? null
  );
  useEffect(() => {
    setFocusedId(enabledTiles.find((t) => t.id === value)?.id ?? enabledTiles[0]?.id ?? null);
    // Re-seed only when the visible band's tile set changes — re-running on every `value` change
    // would yank focus back whenever the caller's controlled value updates for any reason.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCollection]);

  const tileRefs = useRef(new Map<string, HTMLButtonElement>());

  function moveFocus(fromId: string, delta: 1 | -1) {
    const i = enabledTiles.findIndex((t) => t.id === fromId);
    if (i === -1) return;
    const next = enabledTiles[Math.max(0, Math.min(enabledTiles.length - 1, i + delta))];
    if (!next) return;
    setFocusedId(next.id);
    tileRefs.current.get(next.id)?.focus();
  }

  function jumpFocus(edge: "first" | "last") {
    const target = edge === "first" ? enabledTiles[0] : enabledTiles[enabledTiles.length - 1];
    if (!target) return;
    setFocusedId(target.id);
    tileRefs.current.get(target.id)?.focus();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-extrabold uppercase tracking-wide text-muted">
          {COLLECTION_LABEL[activeCollection]}
        </p>
        {!seeAll && availableCollections.length > 0 && (
          <button
            type="button"
            onClick={() => setSeeAll(true)}
            className="pressable inline-flex min-h-11 items-center text-sm font-bold text-sky-ink hover:underline"
          >
            See all avatars
          </button>
        )}
      </div>

      {seeAll && (
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Avatar collections">
          {availableCollections.map((collection) => (
            <button
              key={collection}
              type="button"
              aria-pressed={activeCollection === collection}
              onClick={() => setActiveCollection(collection)}
              className={`pressable min-h-11 rounded-pill border-2 px-4 text-sm font-bold transition-colors ${
                activeCollection === collection
                  ? "border-ink bg-ink text-paper dark:border-paper dark:bg-paper dark:text-ink"
                  : "border-ink/15 text-content-2 hover:border-ink/40 dark:border-paper/20"
              }`}
            >
              {COLLECTION_LABEL[collection]}
            </button>
          ))}
        </div>
      )}

      <div
        role="radiogroup"
        aria-label="Choose your avatar"
        className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5"
      >
        {enabledTiles.map((avatar) => {
          const isSelected = avatar.id === value;
          const number = AVATAR_NUMBER.get(avatar.id) ?? avatar.order;
          const label = avatarPickerAccessibleLabel(avatar, number, isSelected);
          return (
            <button
              key={avatar.id}
              type="button"
              ref={(el) => {
                if (el) tileRefs.current.set(avatar.id, el);
                else tileRefs.current.delete(avatar.id);
              }}
              role="radio"
              aria-checked={isSelected}
              aria-label={label}
              tabIndex={avatar.id === focusedId ? 0 : -1}
              onClick={() => {
                setFocusedId(avatar.id);
                onChange(avatar.id);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                  e.preventDefault();
                  moveFocus(avatar.id, 1);
                } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                  e.preventDefault();
                  moveFocus(avatar.id, -1);
                } else if (e.key === "Home") {
                  e.preventDefault();
                  jumpFocus("first");
                } else if (e.key === "End") {
                  e.preventDefault();
                  jumpFocus("last");
                }
              }}
              className={`pressable relative aspect-square overflow-hidden rounded-full transition-transform motion-reduce:transition-none ${
                isSelected
                  ? "scale-[1.03] ring-4 ring-ink ring-offset-2 ring-offset-paper dark:ring-offset-night"
                  : "ring-2 ring-transparent enabled:hover:ring-ink/25"
              }`}
            >
              <AvatarDisplay avatarId={avatar.id} size={256} placement="picker" fill />
              {isSelected && (
                <span
                  aria-hidden
                  className="absolute bottom-0.5 right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-paper shadow-e1 dark:bg-paper dark:text-ink"
                >
                  <AppIcon name="icon-704" size={14} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {enabledTiles.length === 0 && (
        <div className="mt-3 rounded-card border border-ink/10 bg-surface-soft px-4 py-4 dark:border-paper/12">
          <p className="text-sm font-bold text-content-2">
            Premium portraits for this collection are still being prepared.
          </p>
          <p className="mt-1 text-xs text-muted">Placeholder portraits are never shown as choices.</p>
        </div>
      )}
    </div>
  );
}
