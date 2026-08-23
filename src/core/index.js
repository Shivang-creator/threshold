// The public surface of the deterministic core. render/ and frame/ import
// from this file and from nothing else inside src/core/ — that single rule
// is what keeps the boundary a two-line grep instead of a policy nobody
// checks.

export { dihedral, D4 } from './dihedral.js';
export { mulberry32 } from './rng.js';
export { fnv1a32 } from './hash.js';
export { orbit } from './eightfold.js';
export { createBuffer, emit, resetStroke } from './grains.js';
export {
  positionAt,
  SPAWN_HEIGHT,
  FALL_TIME,
  BOUNCE_TIME,
  BOUNCE_DAMPING,
} from './sim.js';
