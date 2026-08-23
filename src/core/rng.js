// Seeded determinism, the whole reason the core can prove anything: every
// draw comes from an explicit seed, never from an ambient global. There is
// no fallback to the platform's own random source anywhere in this file.

/**
 * mulberry32 — a small, fast, seeded PRNG. Returns a zero-argument
 * generator function producing floats in [0, 1). Each call to
 * mulberry32(seed) closes over its own state; two generators built from the
 * same seed never share a mutable cell, so advancing one cannot perturb the
 * other.
 * @param {number} seed
 * @returns {() => number}
 */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
