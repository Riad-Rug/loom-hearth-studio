// One-hour window: the homepage lineup is stable for a visitor's session
// (including browser Back from a PDP) but re-rolls 24x a day.
export const inventoryShuffleWindowMs = 60 * 60 * 1000;

export function getInventoryShuffleSeed(now: number = Date.now()): number {
  return Math.floor(now / inventoryShuffleWindowMs);
}

// mulberry32 — deterministic PRNG, no dependency.
export function createSeededRandom(seed: number): () => number {
  let state = (seed >>> 0) || 1;

  return function next() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleWithSeed<T>(items: readonly T[], seed: number): T[] {
  const random = createSeededRandom(seed);
  const result = items.slice();

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}
