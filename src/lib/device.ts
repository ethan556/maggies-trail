/** Stable per-device id. Its own module so both progress.ts (which stamps saves) and syncClient.ts
 * (which merges) can use it without an import cycle. Not an identifier of a person — only a
 * deterministic tiebreak when two devices write in the same millisecond. */

import { storageGet, storageSet } from "./safeStorage";

const DEVICE_KEY = "numera:device:v1";

export function deviceId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let d = storageGet(DEVICE_KEY);
    if (!d) {
      d = `dev_${Math.random().toString(36).slice(2, 10)}`;
      storageSet(DEVICE_KEY, d);
    }
    return d;
  } catch {
    return "dev_ephemeral";
  }
}
