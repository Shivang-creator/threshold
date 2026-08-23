import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fnv1a32 } from '../src/core/hash.js';

test('test_fnv1a_golden_vector', () => {
  const f32 = new Float32Array([1, 2, 3, 4]);
  assert.equal(fnv1a32(f32), 'e5ae2e98');
});

test('test_one_changed_float_changes_the_print', () => {
  const a = new Float32Array([1, 2, 3, 4]);
  const b = new Float32Array([1, 2, 3, 4.0001]);
  assert.notEqual(fnv1a32(a), fnv1a32(b));
});

test('test_print_is_eight_lowercase_hex', () => {
  const f32 = new Float32Array([1, 2, 3, 4]);
  assert.match(fnv1a32(f32), /^[0-9a-f]{8}$/);
});

test('test_empty_array_returns_fnv_offset_basis_not_a_crash', () => {
  const f32 = new Float32Array(0);
  assert.equal(fnv1a32(f32), '811c9dc5');
});
