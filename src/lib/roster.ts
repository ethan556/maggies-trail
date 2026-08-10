// Multi-child roster — a parent/teacher manages several learner profiles. Local-first: the roster
// lives under ROSTER_KEY and each child's progress under its own profile key, so the existing
// single-profile store (progress.ts) simply reads/writes the ACTIVE child. A cloud/account backend
// slots in behind this same shape later (each child a synced record); nothing here is faked as cloud.

import { emptyProfile, parseStoredProfile, type Profile } from "./progress";
import { DEFAULT_CHILD_ID, LEGACY_PROFILE_KEY, profileKey, ROSTER_KEY } from "./storageKeys";
import { storageGet, storageRemove, storageSet } from "./safeStorage";

export interface Child {
  id: string;
  name: string;
  grade?: number;
  createdAt: string;
}
export interface Roster {
  children: Child[];
  activeId: string;
}

function defaultRoster(): Roster {
  return { children: [{ id: DEFAULT_CHILD_ID, name: "Learner 1", createdAt: new Date().toISOString() }], activeId: DEFAULT_CHILD_ID };
}

function validChild(value: unknown): value is Child {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const child = value as Partial<Child>;
  return (
    typeof child.id === "string" && child.id.length > 0 && child.id.length <= 200 &&
    typeof child.name === "string" && child.name.length > 0 && child.name.length <= 80 &&
    typeof child.createdAt === "string" && child.createdAt.length <= 64 &&
    (child.grade === undefined || (Number.isInteger(child.grade) && child.grade >= 0 && child.grade <= 13))
  );
}

function parseRoster(raw: string): Roster | null {
  try {
    const value = JSON.parse(raw) as Partial<Roster>;
    if (!Array.isArray(value.children) || value.children.length === 0 || value.children.length > 100) return null;
    if (!value.children.every(validChild)) return null;
    if (new Set(value.children.map((child) => child.id)).size !== value.children.length) return null;
    const activeId = value.children.some((child) => child.id === value.activeId)
      ? (value.activeId as string)
      : value.children[0].id;
    return { children: value.children, activeId };
  } catch {
    return null;
  }
}

function write(r: Roster): Roster {
  if (typeof window !== "undefined") {
    try {
      storageSet(ROSTER_KEY, JSON.stringify(r));
    } catch {
      /* storage blocked — session-only */
    }
  }
  return r;
}

/** Load the roster, creating a default child (and migrating any legacy single profile into it) the
 * first time. Always returns at least one child. */
export function getRoster(): Roster {
  if (typeof window === "undefined") return defaultRoster();
  try {
    const raw = storageGet(ROSTER_KEY);
    if (raw) {
      const parsed = parseRoster(raw);
      if (parsed) return parsed;
    }
  } catch {
    /* fall through to fresh roster */
  }
  const r = write(defaultRoster());
  try {
    const legacy = storageGet(LEGACY_PROFILE_KEY);
    if (legacy && !storageGet(profileKey(DEFAULT_CHILD_ID))) {
      storageSet(profileKey(DEFAULT_CHILD_ID), legacy);
    }
  } catch {
    /* migration best-effort */
  }
  return r;
}

function nextChildId(children: Child[]): string {
  let n = children.length + 1;
  while (children.some((c) => c.id === `c${n}`)) n++;
  return `c${n}`;
}

export function addChild(name: string, grade?: number): Roster {
  const r = getRoster();
  const id = nextChildId(r.children);
  const child: Child = { id, name: name.trim() || `Learner ${r.children.length + 1}`, grade, createdAt: new Date().toISOString() };
  return write({ children: [...r.children, child], activeId: id });
}

export function renameChild(id: string, name: string): Roster {
  const r = getRoster();
  return write({ ...r, children: r.children.map((c) => (c.id === id ? { ...c, name: name.trim() || c.name } : c)) });
}

export function setActiveChild(id: string): Roster {
  const r = getRoster();
  if (!r.children.some((c) => c.id === id)) return r;
  return write({ ...r, activeId: id });
}

/** Remove a child and their stored progress. Never removes the last child. */
export function removeChild(id: string): Roster {
  const r = getRoster();
  if (r.children.length <= 1) return r;
  const children = r.children.filter((c) => c.id !== id);
  if (typeof window !== "undefined") {
    try {
      storageRemove(profileKey(id));
    } catch {
      /* ignore */
    }
  }
  const activeId = r.activeId === id ? children[0].id : r.activeId;
  return write({ children, activeId });
}

/** Read a specific child's stored profile without switching the active child (for the parent view). */
export function readChildProfile(id: string): Profile {
  if (typeof window === "undefined") return emptyProfile();
  try {
    const raw = storageGet(profileKey(id));
    if (!raw) return emptyProfile();
    return parseStoredProfile(raw) ?? emptyProfile();
  } catch {
    return emptyProfile();
  }
}

/**
 * Write a specific child's profile WITHOUT switching the active child and WITHOUT re-stamping
 * `updatedAt` / `deviceId`.
 *
 * Both of those matter. `progressStore.save()` deliberately stamps every write as a fresh local
 * edit — correct for actual learner activity, wrong for sync. When sync adopts the server's merged
 * copy, re-stamping it would claim this device had just edited it, and a later tie-break would then
 * let this (possibly stale) device win a last-write-wins field it had no right to. Sync therefore
 * writes raw, preserving the timestamps the merge decided on.
 */
export function writeChildProfile(id: string, profile: Profile): void {
  if (typeof window === "undefined") return;
  try {
    storageSet(profileKey(id), JSON.stringify(profile));
  } catch {
    /* safeStorage retains the write in memory for this tab */
  }
}
