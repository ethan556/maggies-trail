"use client";
/**
 * Phase D — instrument reveals (§9). An instrument is a transferable idea, and its state is
 * derived from the learner's mastery of the conceptTags that idea owns — never from lesson
 * completion. Walking a trail without demonstrating the idea leaves the instrument
 * undiscovered, which is the point: these are not badges.
 *
 * Undiscovered instruments are listed but not described. Naming what exists without revealing
 * what it does keeps the reveal meaningful while avoiding the "mystery locked slot" pattern
 * that tells a learner nothing.
 */
import { Surface } from "@/components/ui";
import { instrumentState } from "./revealRules";
import { useWorld } from "./WorldShell";
import type { InstrumentState, WorldInstrument } from "./worldTypes";

const LADDER: InstrumentState[] = ["undiscovered", "discovered", "assembled", "calibrated", "enduring"];

const STATE_COPY: Record<InstrumentState, string> = {
  undiscovered: "Not yet met on a trail.",
  discovered: "Met — you've worked with this idea.",
  assembled: "Taking shape — the idea is holding together.",
  calibrated: "Calibrated — you've used it independently.",
  carried: "Carried — it travels with you across trails.",
  enduring: "Enduring — it held long after the last practice."
};

export function Instruments({
  instruments,
  compact = false
}: {
  instruments: WorldInstrument[];
  compact?: boolean;
}) {
  const { world } = useWorld();
  const rows = instruments
    .map((i) => ({ instrument: i, state: instrumentState(i, world.evidence, world.today) }))
    .sort((a, b) => LADDER.indexOf(b.state) - LADDER.indexOf(a.state) || a.instrument.name.localeCompare(b.instrument.name));
  const shown = compact ? rows.filter((r) => r.state !== "undiscovered").slice(0, 4) : rows;

  if (shown.length === 0) {
    return <p className="text-sm text-content-2">No instruments discovered yet — they appear as you work with the ideas behind them.</p>;
  }

  return (
    <ul className={compact ? "mt-2 space-y-2" : "mt-3 grid gap-3 sm:grid-cols-2"}>
      {shown.map(({ instrument, state }) => (
        <li key={instrument.id}>
          <Surface border className="rounded-card p-4">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-base font-extrabold">{instrument.name}</h3>
              <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-sky-ink">{state}</span>
            </div>
            {state !== "undiscovered" && (
              <p className="mt-1 text-sm text-content-2">{instrument.transferableIdea}</p>
            )}
            <p className="mt-1 text-xs text-content-2">{STATE_COPY[state]}</p>
          </Surface>
        </li>
      ))}
    </ul>
  );
}

