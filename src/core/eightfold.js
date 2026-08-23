// The Eightfold. orbit(points, syms) takes N points and 2n symmetries and
// returns the full N * 2n orbit, grouped by input point so the output order
// is stable and testable: point 0's whole orbit comes first, then point 1's,
// and so on. This is the one function that turns a single dragged sample
// into a symmetric cluster of copies — everything downstream (grains.js)
// just resamples the input path and jitters it; this file is where the
// symmetry actually happens.

/** @typedef {{x: number, z: number}} Pt */
/** @typedef {import('./dihedral.js').Sym} Sym */

/**
 * @param {Pt[]} points
 * @param {Sym[]} syms
 * @returns {Pt[]} a new array, length points.length * syms.length
 */
export function orbit(points, syms) {
  const out = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    for (let j = 0; j < syms.length; j++) {
      const s = syms[j];
      out.push({
        x: s.m00 * p.x + s.m01 * p.z,
        z: s.m10 * p.x + s.m11 * p.z,
      });
    }
  }
  return out;
}
