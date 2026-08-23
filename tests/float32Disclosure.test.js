import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  positionAt,
  SPAWN_HEIGHT,
  FALL_TIME,
  BOUNCE_TIME,
  BOUNCE_DAMPING,
} from '../src/core/sim.js';

// R-04 (.crew/RED-TEAM.md ATTACK 6): src/render/grain.vert.js's header
// comment used to claim "11 of 12 golden vectors match bit-for-bit" and
// singled out one vector as *the* float32 gap. An independent Math.fround
// emulation found only 8 of 12 bit-identical, and found the largest
// disagreement at a *different* vector than the one named. The comment has
// been corrected to "all twelve agree to within 1.7e-7 world units; 8 are
// bit-identical". This file locks those figures in against sim.js's own
// golden vectors (tests/sim.test.js) so the comment cannot silently drift
// back out of true if SPAWN_HEIGHT/FALL_TIME/BOUNCE_TIME/BOUNCE_DAMPING
// ever change.
//
// This is plain JS arithmetic mirroring positionAt()'s algebra term for
// term, rounded at every step with Math.fround — it does not import,
// parse, or execute a single line of GLSL. Making the sim/shader
// duplication itself a two-directional fence (R-02) is explicitly out of
// scope here; this test only guards the float32-precision *disclosure*.

const fr = Math.fround;
const SPAWN_HEIGHT_32 = fr(SPAWN_HEIGHT);
const FALL_TIME_32 = fr(FALL_TIME);
const BOUNCE_TIME_32 = fr(BOUNCE_TIME);
const BOUNCE_DAMPING_32 = fr(BOUNCE_DAMPING);

function yAt32(originY, birth, t) {
  const local = fr(fr(t) - fr(birth));
  const rest = fr(originY);
  if (local <= 0) return fr(rest + SPAWN_HEIGHT_32);
  if (local < FALL_TIME_32) {
    const f = fr(local / FALL_TIME_32);
    const oneMinusF = fr(1 - f);
    const eased = fr(oneMinusF * oneMinusF);
    return fr(rest + fr(SPAWN_HEIGHT_32 * eased));
  }
  const bounceLocal = fr(local - FALL_TIME_32);
  if (bounceLocal < BOUNCE_TIME_32) {
    const u = fr(bounceLocal / BOUNCE_TIME_32);
    const peak = fr(SPAWN_HEIGHT_32 * BOUNCE_DAMPING_32);
    const oneMinusU = fr(1 - u);
    const fourU = fr(4 * u);
    return fr(rest + fr(peak * fr(fourU * oneMinusU)));
  }
  return rest;
}

// Same 12 golden vectors as tests/sim.test.js's
// test_sim_matches_shader_reference_vectors, duplicated here (not
// imported) because they are test data, not part of sim.js's public
// surface.
const golden = [
  { args: [1, 0, 2, 0, 0, -1] },
  { args: [1, 0, 2, 0, 0, 0] },
  { args: [1, 0, 2, 0, 0, 0.3] },
  { args: [1, 0, 2, 0, 0, 0.6] },
  { args: [1, 0, 2, 0, 0, 0.7] },
  { args: [1, 0, 2, 0, 0, 0.725] },
  { args: [1, 0, 2, 0, 0, 0.85] },
  { args: [1, 0, 2, 0, 0, 5] },
  { args: [-3.5, 0, 4.25, 2, 0.5, 1] },
  { args: [-3.5, 0, 4.25, 2, 0.5, 2.3] },
  { args: [-3.5, 0, 4.25, 2, 0.5, 2.6] },
  { args: [-3.5, 0, 4.25, 2, 0.5, 100] },
];

function diffFor({ args }) {
  const [, y64] = positionAt(...args);
  const y32 = yAt32(args[1], args[3], args[5]);
  return { y64, y32, diff: Math.abs(y64 - y32) };
}

test('test_float32_precision_is_8_of_12_bit_identical_not_11_of_12_as_the_old_comment_claimed', () => {
  let bitIdentical = 0;
  let maxDiff = 0;
  for (const v of golden) {
    const { y64, y32, diff } = diffFor(v);
    if (fr(y64) === y32) bitIdentical += 1;
    maxDiff = Math.max(maxDiff, diff);
  }
  assert.equal(
    bitIdentical,
    8,
    "bit-identical count drifted from 8/12 — update grain.vert.js's header comment to match"
  );
  assert.ok(
    maxDiff <= 1.7e-7,
    `max float32 disagreement ${maxDiff} world units exceeds the disclosed 1.7e-7 bound`
  );
});

test('test_float32_largest_disagreement_is_the_t_2_3_rounding_vector_not_the_t_2_6_branch_flip', () => {
  // The old comment singled out args=[-3.5,0,4.25,2,0.5,2.6] (the branch
  // flip at the FALL_TIME boundary) as "the" gap. It is not the largest
  // one — ordinary float32 rounding on args=[-3.5,0,4.25,2,0.5,2.3] is
  // about four million times bigger.
  const roundingVector = diffFor({ args: [-3.5, 0, 4.25, 2, 0.5, 2.3] });
  const branchFlipVector = diffFor({ args: [-3.5, 0, 4.25, 2, 0.5, 2.6] });

  assert.ok(
    roundingVector.diff > branchFlipVector.diff,
    `expected the t=2.3 rounding vector (${roundingVector.diff}) to disagree more than the t=2.6 branch-flip vector (${branchFlipVector.diff})`
  );
  assert.ok(branchFlipVector.diff < 1e-12, 'the branch-flip vector should still be visually/numerically negligible');
});
