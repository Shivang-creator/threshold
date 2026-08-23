import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../src/core/rng.js';

test('test_same_seed_same_sequence', () => {
  const a = mulberry32(42);
  const b = mulberry32(42);
  for (let i = 0; i < 50; i++) {
    assert.equal(a(), b());
  }
});

test('test_different_seeds_diverge_within_five_draws', () => {
  const a = mulberry32(1);
  const b = mulberry32(2);
  let diverged = false;
  for (let i = 0; i < 5; i++) {
    if (a() !== b()) {
      diverged = true;
      break;
    }
  }
  assert.ok(diverged);
});

test('test_known_golden_vector_first_five_draws', () => {
  const gen = mulberry32(1);
  const draws = [gen(), gen(), gen(), gen(), gen()];
  const expected = [
    0.6270739405881613, 0.002735721180215478, 0.5274470399599522,
    0.9810509674716741, 0.9683778982143849,
  ];
  for (let i = 0; i < 5; i++) {
    assert.equal(draws[i], expected[i]);
  }
});

test('test_all_draws_in_zero_one_over_1e5', () => {
  const gen = mulberry32(7);
  for (let i = 0; i < 1e5; i++) {
    const v = gen();
    assert.ok(v >= 0 && v < 1);
  }
});

test('test_no_nan_over_1e5_draws', () => {
  const gen = mulberry32(99);
  for (let i = 0; i < 1e5; i++) {
    assert.ok(!Number.isNaN(gen()));
  }
});

test('test_two_instances_do_not_share_state', () => {
  const a = mulberry32(5);
  const b = mulberry32(5);
  // advance a several draws ahead of b
  a();
  a();
  a();
  const bFirst = b();
  const expectedFirstOfFresh = mulberry32(5)();
  assert.equal(bFirst, expectedFirstOfFresh);
});
