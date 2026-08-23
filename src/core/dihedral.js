// The symmetry group as data. dihedral(n) returns the 2n elements of the
// dihedral group Dn: n rotations and n reflections, each a plain object
// { name, m00, m01, m10, m11, det }. The engine (eightfold.js) only ever
// applies these matrices; it never branches on "which symmetry" — the group
// is the data, not the code.
//
// Convention: a point (x, z) maps to (m00*x + m01*z, m10*x + m11*z).
// Rotation by theta: [[cos, -sin], [sin, cos]].
// Reflection_k = Rotation_k composed with the base x-axis mirror
// [[1, 0], [0, -1]], which is why every reflection also has an exact
// integer matrix when theta is a multiple of 90 degrees.

/** @typedef {{name: string, m00: number, m01: number, m10: number, m11: number, det: number}} Sym */

function rotationName(k, n) {
  if (k === 0) return 'e';
  const deg = Math.round((k * 360) / n);
  return `r${deg}`;
}

// Canonical names for the four D4 reflections, resolved from the matrix
// itself (not from k) so the naming is robust regardless of build order.
function reflectionName(m00, m01, m10, m11, n, k) {
  if (n === 4) {
    if (m00 === 1 && m01 === 0 && m10 === 0 && m11 === -1) return 'mx';
    if (m00 === -1 && m01 === 0 && m10 === 0 && m11 === 1) return 'my';
    if (m00 === 0 && m01 === 1 && m10 === 1 && m11 === 0) return 'md';
    if (m00 === 0 && m01 === -1 && m10 === -1 && m11 === 0) return 'dm';
  }
  return `s${k}`;
}

/**
 * The 2n elements of the dihedral group Dn, as exact-integer matrices when
 * n is a multiple of 4 (the case this build uses). Rotations first (det
 * +1), then reflections (det -1), each set ordered by k = 0..n-1.
 * @param {number} n
 * @returns {Sym[]}
 */
export function dihedral(n) {
  const elems = [];

  for (let k = 0; k < n; k++) {
    const theta = (2 * Math.PI * k) / n;
    const c = Math.round(Math.cos(theta));
    const s = Math.round(Math.sin(theta));
    elems.push({
      name: rotationName(k, n),
      m00: c,
      m01: -s,
      m10: s,
      m11: c,
      det: 1,
    });
  }

  for (let k = 0; k < n; k++) {
    const rot = elems[k];
    // reflection_k = rotation_k * mx, where mx = [[1,0],[0,-1]]
    const m00 = rot.m00;
    const m01 = -rot.m01;
    const m10 = rot.m10;
    const m11 = -rot.m11;
    elems.push({
      name: reflectionName(m00, m01, m10, m11, n, k),
      m00,
      m01,
      m10,
      m11,
      det: -1,
    });
  }

  return elems;
}

/** The eight symmetries of the square — the group this build's Eightfold uses. */
export const D4 = dihedral(4);
