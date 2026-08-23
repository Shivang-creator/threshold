import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dihedral, D4 } from '../src/core/dihedral.js';

function apply(sym, p) {
  return { x: sym.m00 * p.x + sym.m01 * p.z, z: sym.m10 * p.x + sym.m11 * p.z };
}

function matEq(a, b) {
  return a.m00 === b.m00 && a.m01 === b.m01 && a.m10 === b.m10 && a.m11 === b.m11;
}

function compose(a, b) {
  // a applied after b: (a * b)
  return {
    m00: a.m00 * b.m00 + a.m01 * b.m10,
    m01: a.m00 * b.m01 + a.m01 * b.m11,
    m10: a.m10 * b.m00 + a.m11 * b.m10,
    m11: a.m10 * b.m01 + a.m11 * b.m11,
  };
}

test('test_d4_has_eight_distinct_elements', () => {
  assert.equal(D4.length, 8);
  const seen = new Set(D4.map((s) => `${s.m00},${s.m01},${s.m10},${s.m11}`));
  assert.equal(seen.size, 8);
});

test('test_every_matrix_is_orthogonal', () => {
  for (const s of D4) {
    // M^T M = I
    const t00 = s.m00 * s.m00 + s.m10 * s.m10;
    const t01 = s.m00 * s.m01 + s.m10 * s.m11;
    const t10 = s.m01 * s.m00 + s.m11 * s.m10;
    const t11 = s.m01 * s.m01 + s.m11 * s.m11;
    assert.equal(t00, 1);
    assert.equal(t01, 0);
    assert.equal(t10, 0);
    assert.equal(t11, 1);
  }
});

test('test_four_rotations_det_plus_one_four_reflections_det_minus_one', () => {
  const plus = D4.filter((s) => s.det === 1);
  const minus = D4.filter((s) => s.det === -1);
  assert.equal(plus.length, 4);
  assert.equal(minus.length, 4);
});

test('test_group_is_closed_under_composition', () => {
  for (const a of D4) {
    for (const b of D4) {
      const c = compose(a, b);
      const found = D4.some((s) => matEq(s, c));
      assert.ok(found, `composition of ${a.name} and ${b.name} not found in D4`);
    }
  }
});

test('test_identity_is_present_exactly_once', () => {
  const identities = D4.filter((s) => s.m00 === 1 && s.m01 === 0 && s.m10 === 0 && s.m11 === 1);
  assert.equal(identities.length, 1);
  assert.equal(identities[0].name, 'e');
});

test('test_every_element_has_an_inverse_in_the_set', () => {
  const identity = { m00: 1, m01: 0, m10: 0, m11: 1 };
  for (const a of D4) {
    // orthogonal matrices: inverse is the transpose
    const inv = { m00: a.m00, m01: a.m10, m10: a.m01, m11: a.m11 };
    const found = D4.some((s) => matEq(s, inv));
    assert.ok(found, `inverse of ${a.name} not found in D4`);
    assert.ok(matEq(compose(a, inv), identity));
  }
});

test('test_applying_all_eight_to_a_generic_point_gives_eight_distinct_points', () => {
  const p = { x: 1.3, z: 0.7 };
  const pts = D4.map((s) => apply(s, p));
  const seen = new Set(pts.map((q) => `${q.x},${q.z}`));
  assert.equal(seen.size, 8);
});

test('test_applying_all_eight_to_the_origin_gives_eight_copies_of_the_origin', () => {
  const p = { x: 0, z: 0 };
  const pts = D4.map((s) => apply(s, p));
  for (const q of pts) {
    // strictEqual uses SameValue, and a rotation matrix can legitimately
    // produce -0 for the origin (e.g. -1 * 0); treat -0 and 0 as equal here.
    assert.equal(Math.abs(q.x), 0);
    assert.equal(Math.abs(q.z), 0);
  }
});

test('test_dihedral_6_has_twelve_elements', () => {
  assert.equal(dihedral(6).length, 12);
});

test('test_d4_matrix_entries_are_all_in_minus_one_zero_one', () => {
  const allowed = new Set([-1, 0, 1]);
  for (const s of D4) {
    assert.ok(allowed.has(s.m00));
    assert.ok(allowed.has(s.m01));
    assert.ok(allowed.has(s.m10));
    assert.ok(allowed.has(s.m11));
  }
});
