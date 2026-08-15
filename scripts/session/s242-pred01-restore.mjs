#!/usr/bin/env node
/**
 * S242 / PRED-01 — RESTORE THREE ADJUDICATED PREDICTIONS THAT WERE THINNED BY MISTAKE.
 *
 * WHAT THE RE-CERTIFICATION FOUND, and it rewrites the story of CML-01. Comparing all 1,362
 * adjudicated gates against the live corpus:
 *   · all 17 REMOVE verdicts are executed;
 *   · all 200 REWRITE verdicts are in, with reveal text that differs from the adjudicated original
 *     (present-but-identical would have meant the rewrite never happened, and none are);
 *   · 51 rows carrying a KEEP verdict had their `predict` block stripped anyway, from steps that
 *     still exist. Not one of those 51 removals has a recorded rationale.
 *
 * THREE OF THOSE 51 WERE ON FLAGSHIP CML STEPS. That is the whole cause of CML-01's three
 * `flagship-missing-prediction` errors: `dc-02-02#i1`, `pra-04-02#i1` and `tf-03-02#i1` did not
 * lack a prediction because nobody wrote one. Each had one, it was reviewed, it was adjudicated
 * KEEP, and the thinning pass removed it — which broke the flagship contract in a way the strict
 * gate could not attribute, because by then the only visible fact was an absence.
 *
 * SO THE PREDICTIONS I AUTHORED FOR CML-01 ARE WITHDRAWN. They were derived carefully from each
 * step's own declared misconceptions and invariants, and that was the right thing to do while the
 * originals were believed not to exist. They are not the right thing to keep now: the adjudicated
 * text is REVIEWED content and mine is a reconstruction, and reviewed beats reconstructed even when
 * the reconstruction reads well. This script replaces all three with the adjudicated originals,
 * verbatim.
 *
 * WHAT IS NOT DONE HERE. The other 48 thinned KEEP rows are left alone. They are on non-flagship
 * steps, so nothing is currently red, and restoring 48 reviewed-then-removed predictions without a
 * recorded reason for their removal would be substituting my judgement for a decision somebody made
 * and did not write down. That divergence is reported, not resolved — see
 * PREDICTION_PHASE4_RECERTIFICATION.csv, rows with state `thinned`.
 *
 * Run: node scripts/session/s242-pred01-restore.mjs [--check]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CHECK = process.argv.includes("--check");
const ROOT = process.cwd();

/** Transcribed from PREDICTION_GATE_ADJUDICATION.csv, verdict KEEP, verbatim. */
const RESTORE = [
  {
    file: "content/courses/derivatives-in-context/lessons/dc-02-02.json",
    stepId: "i1",
    predict: {
      prompt: "As the ladder foot moves away from the wall at a constant speed, does the top descend at a constant speed?",
      options: [
        { id: "constant", label: "Yes, the vertical speed is constant" },
        { id: "vary", label: "No, it depends on the current x and y" },
        { id: "zero", label: "No, the top never moves" }
      ],
      outcomeId: "vary",
      reveal: "The fixed-length relation gives dy/dt = −(x/y)dx/dt, so the vertical rate changes as the ladder's position changes."
    }
  },
  {
    file: "content/courses/polynomial-rational-analysis/lessons/pra-04-02.json",
    stepId: "i1",
    predict: {
      prompt: "At a root of even multiplicity, what happens to the function's sign?",
      options: [
        { id: "flip", label: "It always flips" },
        { id: "stay", label: "It stays the same across the root" },
        { id: "unknown", label: "Multiplicity gives no information" }
      ],
      outcomeId: "stay",
      reveal: "An even-multiplicity root touches the axis and turns back, so the sign on the two neighboring intervals matches."
    }
  },
  {
    file: "content/courses/trig-functions/lessons/tf-03-02.json",
    stepId: "i1",
    predict: {
      prompt: "You'll rotate from 0° to 150°. What does the point's HEIGHT do along the way?",
      options: [
        { id: "updown", label: "Climbs, then falls back" },
        { id: "climb", label: "Climbs the whole way" },
        { id: "fall", label: "Falls the whole way" }
      ],
      outcomeId: "updown",
      reveal: "The height rises until the top of the circle at 90°, then falls — the sine's peak is exactly where the point is highest."
    }
  }
];

let changed = 0;
for (const entry of RESTORE) {
  const full = join(ROOT, entry.file);
  const raw = readFileSync(full, "utf8");
  const json = JSON.parse(raw);
  if (JSON.stringify(json, null, 2) + "\n" !== raw) {
    console.error(`${entry.file}: does not round-trip at 2-space indent — refusing to reformat it.`);
    process.exit(1);
  }
  const steps = json.steps ?? json.lesson?.steps;
  const step = steps.find((s) => s.id === entry.stepId);
  if (!step) { console.error(`${entry.file}: no step ${entry.stepId}`); process.exit(1); }
  // The outcome must name a real option, or the gate cannot be answered correctly by anyone.
  if (!entry.predict.options.some((o) => o.id === entry.predict.outcomeId)) {
    console.error(`${entry.file}: outcomeId ${entry.predict.outcomeId} names no option`);
    process.exit(1);
  }
  if (CHECK) {
    const ok = step.predict?.reveal === entry.predict.reveal;
    console.log(`${ok ? "ok  " : "MISS"} ${entry.file}#${entry.stepId}`);
    if (!ok) process.exitCode = 1;
    continue;
  }
  step.predict = entry.predict;
  writeFileSync(full, JSON.stringify(json, null, 2) + "\n");
  changed++;
}
if (!CHECK) console.log(`s242-pred01-restore: ${changed} adjudicated prediction(s) restored`);
