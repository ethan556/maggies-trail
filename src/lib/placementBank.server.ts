import 'server-only';

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DIAGNOSTIC_INSTRUMENT_VERSION } from './diagnosticCalibration';
import { PLACEMENT_BANK, type PlacementItem } from './placement';

interface ActiveCalibration {
  schemaVersion: 1;
  instrumentVersion: string;
  status: 'awaiting-field-data' | 'field-calibrated';
  runId: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  parameters: Record<string, { difficulty: number; discrimination: number; sampleN: number }>;
}

export async function loadPlacementBank(): Promise<PlacementItem[]> {
  try {
    const file = path.join(process.cwd(), 'content/assessment/calibration/active.json');
    const active = JSON.parse(await fs.readFile(file, 'utf8')) as ActiveCalibration;
    if (
      active.schemaVersion !== 1 ||
      active.instrumentVersion !== DIAGNOSTIC_INSTRUMENT_VERSION ||
      active.status !== 'field-calibrated' ||
      !active.runId || !active.approvedBy || !active.approvedAt
    ) return PLACEMENT_BANK;
    if (Object.keys(active.parameters).length !== PLACEMENT_BANK.length) return PLACEMENT_BANK;
    const overlaid = PLACEMENT_BANK.map((item) => {
      const parameter = active.parameters[item.id];
      if (!parameter || !Number.isFinite(parameter.difficulty) || !Number.isFinite(parameter.discrimination) || parameter.discrimination <= 0 || parameter.sampleN < 500) throw new Error('incomplete approved calibration');
      return { ...item, difficulty: parameter.difficulty, discrimination: parameter.discrimination, calibration: 'field-calibrated' as const };
    });
    return overlaid;
  } catch {
    // A malformed or partial calibration can never weaken the diagnostic. Fall back to the audited seeds.
    return PLACEMENT_BANK;
  }
}
