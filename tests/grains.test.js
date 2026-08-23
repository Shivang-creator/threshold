import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBuffer, emit } from '../src/core/grains.js';
import { D4 } from '../src/core/dihedral.js';

function arcPath(n, radius = 1) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / (n - 1)) * (Math.PI / 2);
    pts.push({ x: radius * Math.cos(a), z: radius * Math.sin(a) });
  }
  return pts;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

test('test_same_seed_same_path_is_byte_identical', () => {
  const path = arcPath(50);
  const a = createBuffer();
  const b = createBuffer();
  emit(a, path, 777, { t: 0 });
  emit(b, path, 777, { t: 0 });

  assert.equal(a.count, b.count);
  assert.deepEqual(Array.from(a.origin), Array.from(b.origin));
  assert.equal(a.print, b.print);
});

test('test_arc_length_spacing_is_constant_regardless_of_sample_density', () => {
  const path = arcPath(90);

  const a = createBuffer();
  for (const c of chunk(path, 30)) emit(a, c, 42, { t: 5 });

  const b = createBuffer();
  for (const c of chunk(path, 3)) emit(b, c, 42, { t: 5 });

  assert.equal(a.count, b.count);
  assert.equal(a.cursor, b.cursor);
  assert.deepEqual(Array.from(a.origin), Array.from(b.origin));
  assert.deepEqual(Array.from(a.birth), Array.from(b.birth));
  assert.deepEqual(Array.from(a.phase), Array.from(b.phase));
  assert.equal(a.print, b.print);
});

test('test_capacity_clamp_never_exceeds_20000', () => {
  const buf = createBuffer();
  emit(buf, [{ x: 0, z: 0 }, { x: 500, z: 0 }], 1, { t: 0 });
  assert.equal(buf.count, 20000);
  assert.equal(buf.origin.length, 20000 * 3);
  assert.ok(buf.cursor >= 0 && buf.cursor < 20000);
});

test('test_ring_cursor_wraps_and_does_not_corrupt_neighbours', () => {
  const buf = createBuffer(16);
  // First call: exactly two arc-length samples (16 grains), fills the buffer exactly.
  emit(buf, [{ x: 0, z: 0 }, { x: 0.045, z: 0 }], 5, { t: 0 });
  assert.equal(buf.count, 16);
  const neighbour = Array.from(buf.origin.slice(8 * 3, 16 * 3));

  // Second call: exactly one more sample (8 grains) — must wrap into slots 0..7
  // and leave slots 8..15 untouched.
  emit(buf, [{ x: 0.045, z: 0 }, { x: 0.065, z: 0 }], 5, { t: 1 });
  assert.equal(buf.count, 16);

  const preserved = Array.from(buf.origin.slice(8 * 3, 16 * 3));
  assert.deepEqual(preserved, neighbour, 'the untouched half of the ring was corrupted');
});

test('test_jitter_is_applied_before_the_group_so_arms_stay_congruent', () => {
  const buf = createBuffer();
  emit(buf, [{ x: 0, z: 0 }, { x: 0.02, z: 0 }], 3, { t: 0 });
  assert.equal(buf.count, 8);

  const arms = [];
  for (let i = 0; i < 8; i++) {
    arms.push({ x: buf.origin[i * 3], z: buf.origin[i * 3 + 2] });
  }
  const armKeys = new Set(arms.map((p) => `${p.x},${p.z}`));

  const arm0 = arms[0];
  for (const g of D4) {
    const transformed = {
      x: g.m00 * arm0.x + g.m01 * arm0.z,
      z: g.m10 * arm0.x + g.m11 * arm0.z,
    };
    assert.ok(
      armKeys.has(`${transformed.x},${transformed.z}`),
      `${g.name} applied to arm 0 is not exactly one of the written arms`
    );
  }
});

test('test_grain_count_grows_linearly_with_stroke_length', () => {
  const a = createBuffer();
  emit(a, [{ x: 0, z: 0 }, { x: 10, z: 0 }], 1, { t: 0 });
  const b = createBuffer();
  emit(b, [{ x: 0, z: 0 }, { x: 20, z: 0 }], 1, { t: 0 });

  assert.equal(b.count, a.count * 2);
});

test('test_all_y_origins_are_zero', () => {
  const buf = createBuffer();
  emit(buf, arcPath(20), 9, { t: 0 });
  for (let i = 0; i < buf.count; i++) {
    assert.equal(buf.origin[i * 3 + 1], 0);
  }
});

test('test_births_are_non_decreasing', () => {
  const buf = createBuffer();
  emit(buf, [{ x: 0, z: 0 }, { x: 0.1, z: 0 }], 1, { t: 0 });
  emit(buf, [{ x: 0.1, z: 0 }, { x: 0.2, z: 0 }], 1, { t: 1 });
  emit(buf, [{ x: 0.2, z: 0 }, { x: 0.3, z: 0 }], 1, { t: 2 });

  for (let i = 1; i < buf.count; i++) {
    assert.ok(buf.birth[i] >= buf.birth[i - 1]);
  }
});

test('test_print_changes_when_the_path_changes', () => {
  const a = createBuffer();
  emit(a, [{ x: 0, z: 0 }, { x: 0.5, z: 0 }], 1, { t: 0 });
  const b = createBuffer();
  emit(b, [{ x: 0, z: 0 }, { x: 0.5, z: 0.3 }], 1, { t: 0 });
  assert.notEqual(a.print, b.print);
});

test('test_print_is_stable_when_the_same_path_is_re_emitted_into_a_fresh_buffer', () => {
  const path = arcPath(30);
  const a = createBuffer();
  emit(a, path, 55, { t: 0 });
  const b = createBuffer();
  emit(b, path, 55, { t: 0 });
  assert.equal(a.print, b.print);
});
