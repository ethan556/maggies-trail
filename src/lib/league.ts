import { isoWeek } from "./engine";
import type { Profile } from "./progress";

/** Weekly leagues: a deterministic cohort of 19 rivals + the learner, per ISO week + tier. */

import { hashSeed, mulberry32 } from "./prng";

export const TIERS = ["Pebble League", "Brook League", "Summit League"] as const;
export const PROMOTE_COUNT = 5;
export const DEMOTE_COUNT = 5;

const FIRST = ["Swift", "Sunny", "Mossy", "Pebble", "Cedar", "Breezy", "Dusty", "Maple", "River", "Tally",
  "Fern", "Rocky", "Willow", "Misty", "Clover", "Aspen", "Sandy", "Brook", "Hazel", "Juniper"];
const SECOND = ["Otter", "Finch", "Marmot", "Fox", "Heron", "Beaver", "Chipmunk", "Owl", "Trout", "Rabbit",
  "Badger", "Wren", "Elk", "Newt", "Jay", "Lynx", "Toad", "Moose", "Duck", "Squirrel"];

export interface Rival {
  id: string;
  name: string;
  xp: number;
}

/** Deterministic rivals for a given week + tier: same inputs, same cohort, everywhere. */
export function genRivals(week: string, tier: number): Rival[] {
  const rand = mulberry32(hashSeed(`${week}:${tier}`));
  const rivals: Rival[] = [];
  const used = new Set<string>();
  // higher tiers grind harder
  const base = 40 + tier * 60;
  const spread = 260 + tier * 140;
  while (rivals.length < 19) {
    const name = `${FIRST[Math.floor(rand() * FIRST.length)]} ${SECOND[Math.floor(rand() * SECOND.length)]}`;
    if (used.has(name)) continue;
    used.add(name);
    const xp = Math.floor(base + rand() * rand() * spread);
    rivals.push({ id: `rival-${rivals.length}`, name, xp });
  }
  return rivals;
}

export interface Standing extends Rival {
  isUser: boolean;
  rank: number;
}

/** Sorted cohort, user included; the user wins ties (stable encouragement, logged decision). */
export function standings(week: string, tier: number, userWeeklyXp: number): Standing[] {
  const all: Array<Rival & { isUser: boolean }> = [
    { id: "you", name: "You", xp: userWeeklyXp, isUser: true },
    ...genRivals(week, tier).map((r) => ({ ...r, isUser: false }))
  ];
  all.sort((a, b) => (b.xp - a.xp) || (a.isUser ? -1 : b.isUser ? 1 : 0));
  return all.map((r, i) => ({ ...r, rank: i + 1 }));
}

/**
 * Ensures league state exists and rolls the week over if it changed:
 * finish the OLD week's standings (deterministic), promote top-5 / demote bottom-5,
 * reset the weekly tally. Returns true if a rollover happened.
 */
export function ensureLeague(p: Profile, today: string): boolean {
  const week = isoWeek(today);
  if (!p.league) {
    p.league = { week, tier: 0, weeklyXp: 0 };
    return false;
  }
  if (p.league.week === week) return false;
  const finished = standings(p.league.week, p.league.tier, p.league.weeklyXp);
  const myRank = finished.find((s) => s.isUser)?.rank ?? 20;
  let tier = p.league.tier;
  let lastResult: NonNullable<Profile["league"]>["lastResult"] = "stayed";
  if (myRank <= PROMOTE_COUNT && tier < TIERS.length - 1) {
    tier += 1;
    lastResult = "promoted";
  } else if (myRank > finished.length - DEMOTE_COUNT && tier > 0) {
    tier -= 1;
    lastResult = "demoted";
  }
  p.league = { week, tier, weeklyXp: 0, lastResult };
  return true;
}
