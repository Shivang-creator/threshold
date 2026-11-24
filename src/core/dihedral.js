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

// cos/sin of a multiple of 90 degrees come back as 6e-17 or 0.9999999999999999
// rather than 0 or 1; snap those to the exact integer so D4 stays exact. Any
// other value is left alone. (Rounding every entry, as this used to, turned
// the 60-degree rotation of D6 and the 45-degree rotation of D8 into
// [[1,-1],[1,1]] -- determinant 2, not a rotation at all.)
function snap(v) {
  const r = Math.round(v);
  return Math.abs(v - r) < 1e-12 ? r : v;
}

/**
 * The 2n elements of the dihedral group Dn. Entries are exact integers when
 * every angle is a multiple of 90 degrees (n = 1, 2, 4 -- D4 is the case
 * this build uses) and ordinary floating-point cos/sin otherwise. Rotations
 * first (det +1), then reflections (det -1), each set ordered by k = 0..n-1.
 * @param {number} n
 * @returns {Sym[]}
 */
export function dihedral(n) {
  const elems = [];

  for (let k = 0; k < n; k++) {
    const theta = (2 * Math.PI * k) / n;
    const c = snap(Math.cos(theta));
    const s = snap(Math.sin(theta));
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
