import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  positionAt,
  SPAWN_HEIGHT,
  FALL_TIME,
  BOUNCE_TIME,
  BOUNCE_DAMPING,
} from '../src/core/sim.js';

test('test_position_converges_to_settle_target', () => {
  const [, y] = positionAt(1, 0, 2, 0, 0.4, 1e6);
  assert.equal(y, 0);
});

test('test_evaluating_at_t_equals_two_half_steps', () => {
  // No accumulated state: evaluating directly at t=1.0 must equal evaluating
  // at t=1.0 whether or not some other t was evaluated first.
  positionAt(1, 0, 2, 0, 0.5, 0.5); // an intermediate call, result discarded
  const direct = positionAt(1, 0, 2, 0, 0.5, 1.0);
  const fresh = positionAt(1, 0, 2, 0, 0.5, 1.0);
  assert.deepEqual(direct, fresh);
});

test('test_one_bounce_is_damped_and_monotonic_after_the_peak', () => {
  const birth = 0;
  // Bounce window is [FALL_TIME, FALL_TIME + BOUNCE_TIME]; peak is at the midpoint.
  const peakT = birth + FALL_TIME + BOUNCE_TIME / 2;
  const samples = [];
  for (let i = 0; i <= 10; i++) {
    const t = peakT + (i / 10) * (BOUNCE_TIME / 2 + 0.2);
    samples.push(positionAt(0, 0, 0, birth, 0, t)[1]);
  }
  for (let i = 1; i < samples.length; i++) {
    assert.ok(samples[i] <= samples[i - 1] + 1e-12, 'y increased after the bounce peak');
  }
  assert.equal(samples[samples.length - 1], 0);
});

test('test_y_is_never_negative_for_t_at_or_after_birth', () => {
  const birth = 1;
  for (let t = birth; t < birth + 3; t += 0.01) {
    const [, y] = positionAt(0, 0, 0, birth, 0.2, t);
    assert.ok(y >= 0, `y went negative at t=${t}`);
  }
});

test('test_before_birth_the_grain_is_at_spawn_height', () => {
  const [, y] = positionAt(0, 0, 0, 5, 0, 4.999);
  assert.equal(y, SPAWN_HEIGHT);
});

test('test_no_nan_for_t_up_to_1e6', () => {
  const [x, y, z] = positionAt(1, 0, -1, 0, 0.3, 1e6);
  assert.ok(Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z));
});

test('test_sim_matches_shader_reference_vectors', () => {
  // Frozen golden vectors, computed from this file's own positionAt(). The
  // GLSL in render/grain.vert.js must reproduce these exactly (T-08) — if
  // the two drift, this test is the fence.
  const golden = [
    { args: [1, 0, 2, 0, 0, -1], out: [1, 1.2, 2] },
    { args: [1, 0, 2, 0, 0, 0], out: [1, 1.2, 2] },
    { args: [1, 0, 2, 0, 0, 0.3], out: [1, 0.3, 2] },
    { args: [1, 0, 2, 0, 0, 0.6], out: [1, 0, 2] },
    { args: [1, 0, 2, 0, 0, 0.7], out: [1, 0.40319999999999995, 2] },
    { args: [1, 0, 2, 0, 0, 0.725], out: [1, 0.42, 2] },
    { args: [1, 0, 2, 0, 0, 0.85], out: [1, 0, 2] },
    { args: [1, 0, 2, 0, 0, 5], out: [1, 0, 2] },
    { args: [-3.5, 0, 4.25, 2, 0.5, 1], out: [-3.5, 1.2, 4.25] },
    { args: [-3.5, 0, 4.25, 2, 0.5, 2.3], out: [-3.5, 0.30000000000000027, 4.25] },
    { args: [-3.5, 0, 4.25, 2, 0.5, 2.6], out: [-3.5, 7.460698725481049e-16, 4.25] },
    { args: [-3.5, 0, 4.25, 2, 0.5, 100], out: [-3.5, 0, 4.25] },
  ];
  for (const { args, out } of golden) {
    assert.deepEqual(positionAt(...args), out, `mismatch for args ${JSON.stringify(args)}`);
  }
});

test('test_exported_constants_are_finite_numbers', () => {
  for (const c of [SPAWN_HEIGHT, FALL_TIME, BOUNCE_TIME, BOUNCE_DAMPING]) {
    assert.ok(Number.isFinite(c));
  }
});
