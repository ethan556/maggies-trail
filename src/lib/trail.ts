/**
 * TRAIL VOICE — the single source of truth for Maggie's Trail's theme language.
 *
 * Why this module exists: before S200 the trail vocabulary lived as inline string
 * literals across 39 files. Nothing held "trailhead", "Trail clearing", "waypoints"
 * and "Trail complete!" to one spelling, one casing, or one meaning, so the only
 * thing preventing drift was that one person happened to write them all. That is not
 * a system; `npm run verify:trail-voice` plus this module is.
 *
 * The rule the whole theme rests on (prompt §13): **the theme names things the learner
 * is already doing — it never renames the mathematics.** A waypoint is a lesson seen
 * from inside the trail. A summit challenge is a challenge step. "Trail journal" is the
 * recap. None of these change what the learner must think about; they give the journey
 * a consistent geography so position and progress are legible without a map.
 *
 * What does NOT belong here, and must not be added (§13 forbids it inside the player):
 * landscape illustration, persistent maps, animated characters, reward overlays,
 * quest/loot language, or any term that adds vocabulary load without adding information.
 * If a term would make a learner ask "what does that mean?" rather than "where am I?",
 * it is decoration and it fails the test.
 */

/** The journey's fixed geography — nouns for real objects in the product. */
export const TRAIL = {
  /** The product itself. Never abbreviated, never possessive-stripped. */
  appName: "Maggie's Trail",
  /** A course, seen as a route the learner walks end to end. */
  trail: "trail",
  /** A lesson, seen from inside the trail. Capitalised only as a progress label. */
  waypoint: "waypoint",
  waypointLabel: "Waypoint",
  /** The home surface a learner returns to. One word, lowercase in a sentence. */
  trailhead: "trailhead",
  /** A chapter — a named place on the route that gathers several waypoints. */
  landmark: "landmark",
  /** The framed working area a single step happens in. */
  clearing: "Trail clearing",
  /** The end of a lesson: the high point actually reached, not a trophy. */
  summit: "summit",
  /** Spaced review, seen as walking a route again before it fades. */
  returnPath: "return path",
  /** The learner's own record of what a trail taught them. */
  journal: "Trail journal"
} as const;

/**
 * Stage names for the five step kinds. These ARE the theme inside the player —
 * §13's "restrained framing", and the only place stage vocabulary is allowed to
 * appear. Exhaustive over TStep["kind"] by construction: adding a step kind without
 * naming its stage is a compile error, the same contract stageWidth uses.
 *
 * Each label had to earn its place by naming what the learner does, not by sounding
 * like scenery — which is why "Practice" is not "Trial by fire" and "Discover" is not
 * "Scouting". Two of the five carry trail nouns because the trail noun is the clearer
 * word: a challenge really is the summit of the lesson, and a recap really is a journal
 * entry the learner will read later.
 */
export const TRAIL_STAGE = {
  concept: "Discover",
  interactive: "Explore",
  check: "Practice",
  challenge: "Summit challenge",
  recap: "Trail journal"
} as const;

/** Terms the drift gate holds to one canonical spelling wherever they are rendered. */
export const CANONICAL_TERMS: ReadonlyArray<{ term: string; wrong: readonly string[]; why: string }> = [
  { term: "trailhead", wrong: ["trail head", "Trail head", "trail-head"], why: "one word — it is a place, not a description" },
  { term: "waypoint", wrong: ["way point", "way-point"], why: "one word, matching the progress label" },
  { term: "Trail clearing", wrong: ["trail-clearing", "Trail Clearing"], why: "sentence case; it is a place, not a proper noun" },
  { term: "Maggie's Trail", wrong: ["Maggies Trail", "Maggie’s trail", "maggie's trail"], why: "the product name is fixed" }
];

/**
 * Components the lesson player must never import (§13). The player is the strongest
 * surface in the product and the theme is not permitted to invade it: no landscape
 * illustration, no persistent map, no animated guide character, no reward overlay.
 * The gate enforces this against LessonPlayer.tsx's import list, so a future session
 * cannot quietly decorate the one screen that has to stay math-dominant.
 */
export const PLAYER_FORBIDDEN_IMPORTS: readonly string[] = [
  "RegionMap",
  "WorldShell",
  "Atlas",
  "LandscapeScene",
  "GuideCharacter",
  "RewardOverlay"
];
