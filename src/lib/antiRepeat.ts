/**
 * S242 / GEN-04 — THE ANTI-REPEAT WINDOW.
 *
 * WHAT WAS MISSING. `variantForStep(step, seed)` is seeded from the step and the date and nothing
 * else. Nothing kept a record of what had already been served and nothing consulted one, so a
 * generator with a pool of 400 distinct problems could hand a learner the same problem twice in a
 * row — and §10's acceptance criterion, "duplicate rate 0 inside the anti-repeat window", had no
 * mechanism to be measured against. `GENERATOR_DUPLICATION_AUDIT.csv` puts 1,803 of 2,045
 * (generator, form) pairs above the window: they are fully served by a queue and were getting
 * nothing from it.
 *
 * WHY THIS IS A LOOP AROUND THE GENERATOR AND NOT A CHANGE INSIDE ONE. CLAUDE.md rule 2 is that
 * generators are pure functions of the seed — same seed, byte-identical widget, forever. A
 * generator that consulted a history would break every determinism gate in the repo and make
 * `INDEPENDENT` dual-derivation impossible. So the generator stays pure and the CALLER re-draws:
 * ask for a variant, fingerprint it, and if the learner has seen that exact widget inside the
 * window, ask again with a perturbed seed. Determinism is preserved at a higher level — the same
 * (step, seed, band, history) always produces the same variant.
 *
 * WHAT A REPEAT IS. `JSON.stringify(variant.widget)`, which is the identity
 * `generator-quality-sweep.mts` already uses to count distinct widgets and window duplicates. Using
 * a different notion here would mean the gate and the mechanism disagreed about what they were
 * measuring. The stored form is a hash of it: a learner's history is bounded storage that syncs.
 *
 * WHAT THIS CANNOT DO. 242 pairs have a pool at or below the window — the smallest is 4 distinct
 * problems. No queue can make a fifth problem exist. Those are GRB-04's, they need a new DIMENSION
 * rather than a wider axis, and this module reports `exhausted: true` for them rather than
 * pretending. Silence there would turn a content finding into an invisible one.
 */
import { hashSeed } from "./prng";
import { variantForStep, type Variant } from "./variants";
import type { Band } from "./difficulty";

/** Ten consecutive draws — the window `GENERATOR_DUPLICATION_AUDIT.csv` is already measured at. */
export const REPEAT_WINDOW = 10;

/**
 * How many re-draws before the pool is called exhausted. A pool of exactly REPEAT_WINDOW + 1 needs,
 * in the worst case, to walk past every seen item, and seeds are not a permutation — perturbing the
 * seed resamples the pool rather than enumerating it, so collisions repeat. 24 keeps the failure
 * mode bounded and cheap: a generator call is pure arithmetic, and the honest answer for a pool
 * this small is `exhausted`, not a longer search.
 */
export const MAX_DRAW_ATTEMPTS = 24;

/** Step keys tracked before the oldest is evicted. Bounds the profile: 1,000 × 10 × 8 chars ≈ 80 kB. */
export const MAX_TRACKED_STEPS = 1000;

/** step key → fingerprints of the last REPEAT_WINDOW widgets served, oldest first. */
export type RecentDraws = Record<string, string[]>;

export interface DrawResult {
  variant: Variant;
  /** Fingerprint of the widget served — pass to `rememberDraw` once it is actually shown. */
  fingerprint: string;
  /** 1 on the first try. Above 1 means the queue did work that would otherwise have been a repeat. */
  attempts: number;
  /**
   * True when every attempt collided, so the learner is being shown a repeat because the pool has
   * no unseen problem left in it. A content finding (GRB-04), never a mechanism failure.
   */
  exhausted: boolean;
}

/** The audit's notion of widget identity, hashed to 8 hex characters so a history is small enough to sync. */
export function fingerprintWidget(widget: unknown): string {
  return (hashSeed(JSON.stringify(widget)) >>> 0).toString(16).padStart(8, "0");
}

/**
 * Draw a variant the learner has not seen inside the window.
 *
 * Deterministic: the same (step, seed, band, history) always yields the same variant, so this can
 * sit under the same determinism gates the generators do.
 *
 * The FIRST attempt uses the caller's seed unchanged. That keeps a learner with no history seeing
 * exactly what they see today — the queue changes what happens on the second encounter, which is
 * the only place it was ever supposed to.
 */
export function drawFreshVariant(
  step: Parameters<typeof variantForStep>[0],
  seed: string,
  band: Band,
  recent: RecentDraws,
  key: string
): DrawResult | null {
  const seen = new Set(recent[key] ?? []);
  let first: DrawResult | null = null;

  for (let attempt = 0; attempt < MAX_DRAW_ATTEMPTS; attempt++) {
    const variant = variantForStep(step, attempt === 0 ? seed : `${seed}#${attempt}`, band);
    // A step with no generator has nothing to keep fresh; the caller falls back to authored content.
    if (variant === null) return first;
    const fingerprint = fingerprintWidget(variant.widget);
    const result = { variant, fingerprint, attempts: attempt + 1, exhausted: false };
    first ??= result;
    if (!seen.has(fingerprint)) return result;
  }

  /* Every attempt collided. Serving the first draw is deliberate: it is the one the learner would
   * have received with no queue at all, so an exhausted pool degrades to today's behaviour rather
   * than to something stranger.
   *
   * `attempts` reports the work SPENT, not the attempt the served variant came from. Carrying
   * `first.attempts` through unchanged reported 1 on a draw that had just cost 24 generator calls,
   * which made the most expensive path in this module look like the cheapest one — caught by
   * widening the test probe past numeric generators. */
  return first && { ...first, attempts: MAX_DRAW_ATTEMPTS, exhausted: true };
}

/**
 * Record a served widget. PURE — returns a new map, because the profile is treated as immutable
 * everywhere else in this codebase and a mutation here would be invisible to React.
 *
 * Only call this when the variant is actually SHOWN. Recording at draw time would poison the window
 * with variants a learner never saw, which is the mechanism quietly making itself less effective.
 */
export function rememberDraw(recent: RecentDraws, key: string, fingerprint: string): RecentDraws {
  const previous = recent[key] ?? [];
  // Re-serving an exhausted pool's only problem must not fill the window with one fingerprint.
  const kept = previous.filter((f) => f !== fingerprint);
  const next: RecentDraws = { ...recent, [key]: [...kept, fingerprint].slice(-REPEAT_WINDOW) };

  const keys = Object.keys(next);
  if (keys.length <= MAX_TRACKED_STEPS) return next;
  /* Evict oldest-touched first. Re-inserting a key moves it to the end of the object's own
   * insertion order, so the front of `keys` is genuinely the least recently served. */
  for (const stale of keys.slice(0, keys.length - MAX_TRACKED_STEPS)) delete next[stale];
  return next;
}

/**
 * Merge two devices' histories at sync.
 *
 * THE UNION, NOT THE WINNER. A fingerprint either device served is a problem the learner has seen —
 * last-write-wins would silently un-see everything the other device showed, which is exactly the
 * repeat this module exists to prevent. The fresher device's entries are kept nearest the end (they
 * are the most recent) and the staler device's are folded in behind them, then the window is
 * trimmed. Trimming can therefore drop a genuinely-seen fingerprint when both devices are full —
 * that is the correct trade, because the window is a bound on storage as well as on memory.
 */
export function mergeRecentDraws(fresher: RecentDraws = {}, staler: RecentDraws = {}): RecentDraws {
  const out: RecentDraws = {};
  for (const key of new Set([...Object.keys(staler), ...Object.keys(fresher)])) {
    const merged = [...(staler[key] ?? []), ...(fresher[key] ?? [])];
    out[key] = [...new Set(merged)].slice(-REPEAT_WINDOW);
  }
  const keys = Object.keys(out);
  for (const stale of keys.slice(0, Math.max(0, keys.length - MAX_TRACKED_STEPS))) delete out[stale];
  return out;
}
