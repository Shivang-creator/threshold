// The grain buffer. createBuffer() preallocates a fixed-capacity store;
// emit() is the only way anything gets written into it. emit's five steps,
// in order, are the whole determinism guarantee:
//   1. resample the incoming path segment at a fixed arc length, carrying
//      the leftover distance on the buffer so consecutive calls tile
//      seamlessly regardless of how the caller chunks the path;
//   2. jitter each resampled sample from the buffer's own seeded generator
//      — BEFORE the group, never after, so the eight arms stay exactly
//      congruent;
//   3. apply the orbit for the buffer's symmetry set;
//   4. write origin/birth/phase into the preallocated arrays at the ring
//      cursor, wrapping when full;
//   5. recompute the print over the valid prefix of origin.
//
// Nothing here reads a clock or a random global: `t` (the current
// animation time) and `seed` both arrive as arguments from the caller, and
// the RNG is created once per buffer and only ever advanced.

import { D4 } from './dihedral.js';
import { mulberry32 } from './rng.js';
import { fnv1a32 } from './hash.js';
import { orbit } from './eightfold.js';

/**
 * @param {number} [capacity]
 * @returns {object} a GrainBuffer
 */
export function createBuffer(capacity = 20000) {
  return {
    capacity,
    origin: new Float32Array(capacity * 3),
    birth: new Float32Array(capacity),
    phase: new Float32Array(capacity),
    count: 0,
    cursor: 0,
    print: fnv1a32(new Float32Array(0)),
    // internal, not part of the public contract:
    _rng: null,
    _lastPoint: null,
    _carry: 0,
  };
}

/**
 * Resample a path segment at a fixed arc-length spacing, continuing from
 * wherever the buffer's own carried state left off. Returns the new sample
 * points; mutates buffer._lastPoint and buffer._carry to record where the
 * next call should continue from.
 */
function resample(buffer, segment, spacing) {
  const out = [];
  let prev = buffer._lastPoint;
  let sinceLast = buffer._carry;

  for (const p of segment) {
    if (prev === null) {
      prev = p;
      continue;
    }
    const dx = p.x - prev.x;
    const dz = p.z - prev.z;
    const segLen = Math.hypot(dx, dz);
    if (segLen === 0) {
      prev = p;
      continue;
    }
    const dirX = dx / segLen;
    const dirZ = dz / segLen;

    let d = spacing - sinceLast;
    let lastSampleAt = 0;
    let emittedAny = false;
    while (d <= segLen) {
      out.push({ x: prev.x + dirX * d, z: prev.z + dirZ * d });
      lastSampleAt = d;
      emittedAny = true;
      d += spacing;
    }
    sinceLast = emittedAny ? segLen - lastSampleAt : sinceLast + segLen;
    prev = p;
  }

  buffer._lastPoint = prev;
  buffer._carry = sinceLast;
  return out;
}

/**
 * Reset a buffer's arc-length continuity so the next emit() call begins a
 * fresh stroke instead of measuring a spurious "segment" from wherever the
 * previous stroke (or an unrelated teleport) last left off (see
 * TELEPORT_LIMIT's use in app/App.jsx for the bug this guards against).
 *
 * This is the public replacement for reaching into a buffer's
 * `_lastPoint`/`_carry` fields directly. Those fields are internal, not
 * public contract (see createBuffer()'s comment) — three call sites
 * (app/App.jsx's resetContinuity() and replay(), frame/NoWebGL.jsx's
 * buildKolam()) used to set them directly, which is exactly the kind of
 * boundary violation this build's headline "clean core boundary" claim
 * promises does not happen (.crew/DECISIONS.md 19:40, .crew/RED-TEAM.md
 * ATTACK 12 / R-03b). resetStroke() does not touch origin/birth/phase/
 * count/cursor/print — it only clears the continuity state resample() uses.
 *
 * @param {object} buffer  a GrainBuffer from createBuffer()
 */
export function resetStroke(buffer) {
  buffer._lastPoint = null;
  buffer._carry = 0;
}

/**
 * Write a new path segment into the buffer: resample, jitter, mirror,
 * store, ring-wrap, rehash.
 * @param {object} buffer  a GrainBuffer from createBuffer()
 * @param {{x:number, z:number}[]} segment  new raw path points, in order
 * @param {number} seed  used only the first time this buffer ever emits
 * @param {object} [opts]
 * @param {number} [opts.spacing]  arc-length spacing between samples
 * @param {number} [opts.jitter]  max jitter offset per axis, world units
 * @param {import('./dihedral.js').Sym[]} [opts.syms]  symmetry set, default D4
 * @param {number} [opts.t]  the caller's current animation time — the only
 *   notion of "now" this function has; it never reads a clock itself
 * @returns {object} the same buffer, mutated
 */
export function emit(buffer, segment, seed, opts = {}) {
  const spacing = opts.spacing ?? 0.02;
  const jitter = opts.jitter ?? 0.006;
  const syms = opts.syms ?? D4;
  const t = opts.t ?? 0;

  // The RNG is created once per buffer, from its first seed, and only ever
  // advanced — never re-seeded — so identical paths delivered in different
  // chunk sizes still draw the same sequence of random numbers.
  if (buffer._rng === null) {
    buffer._rng = mulberry32(seed);
  }
  const rng = buffer._rng;

  const samples = resample(buffer, segment, spacing);

  for (const s of samples) {
    const jx = s.x + (rng() * 2 - 1) * jitter;
    const jz = s.z + (rng() * 2 - 1) * jitter;
    const armPhase = rng();

    const arms = orbit([{ x: jx, z: jz }], syms);

    for (const q of arms) {
      const idx = buffer.cursor % buffer.capacity;
      const base = idx * 3;
      buffer.origin[base] = q.x;
      buffer.origin[base + 1] = 0;
      buffer.origin[base + 2] = q.z;
      buffer.birth[idx] = t;
      buffer.phase[idx] = armPhase;

      buffer.cursor = (buffer.cursor + 1) % buffer.capacity;
      buffer.count = Math.min(buffer.capacity, buffer.count + 1);
    }
  }

  buffer.print = fnv1a32(buffer.origin.subarray(0, buffer.count * 3));
  return buffer;
}
