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
 * Every slot in the active band renders, enabled or not: a disabled slot shows the honest
 * placeholder silhouette and is excluded from the tab order (native `disabled`), so sighted and
 * keyboard/AT users see the same shape of the collection — today, every slot, because nothing in
 * the manifest is enabled yet. That is correct and is NOT special-cased away; the grid simply
 * lights up tile by tile as real art ships and `enabled` flips.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AVATARS,
  getAvatar,
  getAvatarsForAgeBand,
  gradeToAgeBand,
  type AgeBand,
  type AvatarDefinition
} from "@/lib/avatars";
import { AvatarDisplay } from "@/components/AvatarDisplay";
import { AppIcon } from "@/components/ui";

const BANDS: AgeBand[] = ["early", "explorer", "adventurer", "summit"];
const BAND_LABEL: Record<AgeBand, string> = {
  early: "Early (K–2)",
  explorer: "Explorer (3–5)",
  adventurer: "Adventurer (6–8)",
  summit: "Summit (9–13)"
};

/** A stable, non-identifying label for a manifest slot — "Avatar 7", never a trait description
 *  (OPTIMIZATION_PLAN_V3.md:150 / AVATAR_ART_PRODUCTION_SPEC.md §7). Position within the FULL
 *  manifest, not within whichever band happens to be showing, so one avatar keeps one number
 *  everywhere the picker ever shows it. */
const AVATAR_NUMBER = new Map(AVATARS.map((a, i) => [a.id, i + 1]));

/** Every manifest slot for a band, enabled or not, in display order — deliberately NOT
 *  `getAvatarsForAgeBand` (which filters to enabled-only and is `[]` for every band today). The
 *  picker needs the full shape of the collection so unavailable slots still render as honest
 *  placeholders instead of vanishing the grid entirely; `getAvatarsForAgeBand` is used below only
 *  to caption a band that currently has nothing enabled. */
function slotsForBand(band: AgeBand): AvatarDefinition[] {
  return AVATARS.filter((a) => a.ageBand === band).sort((a, b) => a.order - b.order);
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
  const selectedBand = value ? getAvatar(value)?.ageBand : undefined;
  const [activeBand, setActiveBand] = useState<AgeBand>(
    () => selectedBand ?? (grade !== undefined ? gradeToAgeBand(grade) : "explorer")
  );
  const [seeAll, setSeeAll] = useState(false);

  const tiles = useMemo(() => slotsForBand(activeBand), [activeBand]);
  const enabledTiles = useMemo(() => tiles.filter((t) => t.enabled), [tiles]);
  const enabledInBandCount = getAvatarsForAgeBand(activeBand).length;

  // Roving tabindex: exactly one tile is ever a tab stop — the selected one if it's in the
  // current band and enabled, else the first enabled tile, else none (today, every band, since
  // nothing is enabled anywhere yet — the grid is then honestly un-tabbable, matching what a
  // sighted user sees: nothing to choose). Arrow keys walk the flat sequence of enabled tiles
  // rather than true 2D geometry: the grid's column count changes at every breakpoint
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
  }, [activeBand]);

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
        <p className="text-xs font-extrabold uppercase tracking-wide text-muted">{BAND_LABEL[activeBand]}</p>
        {!seeAll && (
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
          {BANDS.map((b) => (
            <button
              key={b}
              type="button"
              aria-pressed={activeBand === b}
              onClick={() => setActiveBand(b)}
              className={`pressable min-h-11 rounded-pill border-2 px-4 text-sm font-bold transition-colors ${
                activeBand === b
                  ? "border-ink bg-ink text-paper dark:border-paper dark:bg-paper dark:text-ink"
                  : "border-ink/15 text-content-2 hover:border-ink/40 dark:border-paper/20"
              }`}
            >
              {BAND_LABEL[b]}
            </button>
          ))}
        </div>
      )}

      <div
        role="radiogroup"
        aria-label="Choose your avatar"
        className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5"
      >
        {tiles.map((avatar) => {
          const isSelected = avatar.enabled && avatar.id === value;
          const number = AVATAR_NUMBER.get(avatar.id) ?? avatar.order;
          const label = isSelected ? `Avatar ${number} selected` : `Avatar ${number}`;
          return (
            <button
              key={avatar.id}
              type="button"
              ref={(el) => {
                if (el) tileRefs.current.set(avatar.id, el);
                else tileRefs.current.delete(avatar.id);
              }}
              disabled={!avatar.enabled}
              role="radio"
              aria-checked={isSelected}
              aria-label={label}
              tabIndex={avatar.enabled && avatar.id === focusedId ? 0 : -1}
              onClick={() => {
                if (!avatar.enabled) return;
                setFocusedId(avatar.id);
                onChange(avatar.id);
              }}
              onKeyDown={(e) => {
                if (!avatar.enabled) return;
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
              className={`pressable relative aspect-square overflow-hidden rounded-full transition-transform motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-70 ${
                isSelected
                  ? "scale-[1.03] ring-4 ring-ink ring-offset-2 ring-offset-paper dark:ring-offset-night"
                  : "ring-2 ring-transparent enabled:hover:ring-ink/25"
              }`}
            >
              <AvatarDisplay avatarId={avatar.enabled ? avatar.id : undefined} size={256} fill />
              {isSelected && (
                <span
                  aria-hidden
                  className="absolute bottom-0.5 right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-paper shadow-e1 dark:bg-paper dark:text-ink"
                >
                  <AppIcon name="check" size={14} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {enabledInBandCount === 0 && (
        <p className="mt-3 text-xs text-muted">
          New portraits for this collection are on the way — every option above is a placeholder
          for now.
        </p>
      )}
    </div>
  );
}
