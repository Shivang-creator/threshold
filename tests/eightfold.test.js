import { test } from 'node:test';
import assert from 'node:assert/strict';
import { orbit } from '../src/core/eightfold.js';
import { dihedral, D4 } from '../src/core/dihedral.js';

function key(p) {
  return `${p.x},${p.z}`;
}

test('test_n_points_in_gives_8n_out', () => {
  const points = [{ x: 1, z: 2 }, { x: -3, z: 0.5 }, { x: 4, z: -4 }];
  const out = orbit(points, D4);
  assert.equal(out.length, points.length * 8);
});

test('test_orbit_is_invariant_under_every_group_element', () => {
  const points = [{ x: 1.3, z: 0.7 }, { x: -2.1, z: 5.4 }];
  const whole = orbit(points, D4);
  const originalKeys = new Set(whole.map(key));

  for (const g of D4) {
    const transformed = whole.map((p) => ({
      x: g.m00 * p.x + g.m01 * p.z,
      z: g.m10 * p.x + g.m11 * p.z,
    }));
    const transformedKeys = new Set(transformed.map(key));
    assert.deepEqual(
      [...transformedKeys].sort(),
      [...originalKeys].sort(),
      `orbit not invariant under ${g.name}`
    );
  }
});

test('test_centre_point_maps_to_itself_eight_times', () => {
  const out = orbit([{ x: 0, z: 0 }], D4);
  assert.equal(out.length, 8);
  for (const p of out) {
    assert.equal(Math.abs(p.x), 0);
    assert.equal(Math.abs(p.z), 0);
  }
});

test('test_empty_path_gives_empty_orbit', () => {
  assert.deepEqual(orbit([], D4), []);
});

test('test_single_point_gives_eight_points', () => {
  assert.equal(orbit([{ x: 1, z: 2 }], D4).length, 8);
});

test('test_no_nan_for_extreme_coordinates', () => {
  const out = orbit([{ x: 1e6, z: -1e6 }], D4);
  for (const p of out) {
    assert.ok(Number.isFinite(p.x));
    assert.ok(Number.isFinite(p.z));
  }
});

test('test_output_order_is_stable_across_runs', () => {
  const points = [{ x: 1, z: 2 }, { x: 3, z: -1 }];
  const a = orbit(points, D4);
  const b = orbit(points, D4);
  assert.deepEqual(a, b);
});

test('test_grouped_by_input_ordering_holds', () => {
  const p0 = { x: 1, z: 2 };
  const p1 = { x: -3, z: 4 };
  const combined = orbit([p0, p1], D4);
  const orbit0 = orbit([p0], D4);
  const orbit1 = orbit([p1], D4);
  assert.deepEqual(combined.slice(0, 8), orbit0);
  assert.deepEqual(combined.slice(8, 16), orbit1);
});

test('test_orbit_of_a_point_on_the_x_axis_has_four_distinct_positions_not_eight', () => {
  const out = orbit([{ x: 2, z: 0 }], D4);
  assert.equal(out.length, 8);
  const distinct = new Set(out.map(key));
  assert.equal(distinct.size, 4);
});

test('test_works_with_dihedral_6_giving_12n', () => {
  const points = [{ x: 1, z: 1 }, { x: 2, z: -1 }];
  const out = orbit(points, dihedral(6));
  assert.equal(out.length, points.length * 12);
});

test('test_does_not_mutate_its_input_array', () => {
  const points = [{ x: 1, z: 2 }, { x: 3, z: 4 }];
  const before = JSON.parse(JSON.stringify(points));
  orbit(points, D4);
  assert.deepEqual(points, before);
});

test('test_returns_a_new_array_each_call', () => {
  const points = [{ x: 1, z: 2 }];
  const a = orbit(points, D4);
  const b = orbit(points, D4);
  assert.notEqual(a, b);
  assert.deepEqual(a, b);
});
