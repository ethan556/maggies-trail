// A seeded, reproducible pseudo-random generator.
//
// Nothing in Maggie's Trail may depend on unseeded randomness: a learner's questions, feedback,
// mastery and league table must be reproducible from their inputs alone. Where an ordering needs to
// LOOK arbitrary (a practice set, a league cohort), it is drawn from this generator with an explicit
// seed — so the same seed always yields the same order, on any device, forever.

/** FNV-1a over a string — stable across engines and platforms. */
export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32: a small, fast, fully deterministic PRNG. */
export function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A Fisher–Yates shuffle driven by a SEED rather than Math.random. Same seed, same order. */
export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const rand = mulberry32(hashSeed(seed));
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
