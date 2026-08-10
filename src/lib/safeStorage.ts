/**
 * Browser storage with a session-memory fallback.
 *
 * Safari private mode, embedded browsers, quota exhaustion, and restrictive
 * privacy settings can make localStorage throw even when it exists. Learning
 * must continue in those environments. Successful values are mirrored in
 * memory; failed writes are marked volatile and remain available for the
 * lifetime of the tab.
 *
 * Server calls deliberately return null/no-op so module memory can never leak
 * data between requests.
 */
const memory = new Map<string, string>();
const volatileKeys = new Set<string>();

export function storageGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(key);
    if (value !== null) {
      memory.set(key, value);
      volatileKeys.delete(key);
      return value;
    }
    // A successful null read is authoritative unless this tab has a write that
    // could not reach localStorage. This prevents stale mirrors after another
    // tab or browser UI removes a key.
    if (volatileKeys.has(key)) return memory.get(key) ?? null;
    memory.delete(key);
    return null;
  } catch {
    return memory.get(key) ?? null;
  }
}

export function storageSet(key: string, value: string): boolean {
  if (typeof window === "undefined") return false;
  memory.set(key, value);
  try {
    window.localStorage.setItem(key, value);
    volatileKeys.delete(key);
    return true;
  } catch {
    volatileKeys.add(key);
    return false;
  }
}

export function storageRemove(key: string): void {
  if (typeof window === "undefined") return;
  memory.delete(key);
  volatileKeys.delete(key);
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* memory copy is already removed */
  }
}

/** Snapshot all visible keys with an optional prefix. Used for scratch-state
 * fan-out without assuming localStorage is enumerable or available. */
export function storageEntries(prefix = ""): Array<[string, string]> {
  if (typeof window === "undefined") return [];
  const values = new Map<string, string>();
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith(prefix)) continue;
      const value = window.localStorage.getItem(key);
      if (value !== null) {
        memory.set(key, value);
        volatileKeys.delete(key);
        values.set(key, value);
      }
    }
    // Failed writes are intentionally visible even though the backing store
    // could not enumerate them.
    for (const key of volatileKeys) {
      const value = memory.get(key);
      if (value !== undefined && key.startsWith(prefix)) values.set(key, value);
    }
  } catch {
    // When enumeration itself is blocked, the complete memory mirror is the
    // only available view.
    for (const [key, value] of memory) if (key.startsWith(prefix)) values.set(key, value);
  }
  return [...values.entries()];
}
