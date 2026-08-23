// The vertex shader half of the one deliberate duplication in this build
// (PLAN.md §2): src/core/sim.js's positionAt() is pure JS, evaluated by
// tests/sim.test.js's 12 golden vectors; this file is the same algebra,
// re-written in GLSL because the core must not import GLSL and the GPU must
// not import JavaScript. The four constants below are imported from the
// core and spliced in as literals — if sim.js's constants ever change, this
// string is rebuilt with them, so the two cannot drift silently.
//
// Verified against all 12 golden vectors in tests/sim.test.js with an
// independent float32 (Math.fround-at-every-step) emulation of this file's
// own algebra (R-04, .crew/RED-TEAM.md ATTACK 6 — an earlier version of
// this comment claimed "11 of 12 match bit-for-bit"; a hostile reader
// running the same check got 8 of 12, which is what this says now):
//
//   All twelve agree with the float64 core to within 1.7e-7 world units.
//
// Eight of the twelve are bit-identical after float32 rounding. Four take a
// different last bit; the largest of those is ordinary float32 rounding on
// the golden vector args [-3.5,0,4.25,2,0.5,2.3] (t=2.3), off by ~1.6e-7
// world units — nothing dramatic, just rounding.
//
// Exactly one vector — args [-3.5,0,4.25,2,0.5,2.6] -> y = 7.460698725481049e-16
// — is qualitatively different: a float64 rounding artifact of `2.6 - 2`
// landing a hair *inside* the bounce window instead of exactly on
// FALL_TIME (see outbox/T-06.md decision #3). In float32, `2.6 - 2` rounds
// the other way and the *fall* branch's tiny-eased tail is taken instead
// (~3.8e-14 by direct calculation), not the bounce branch — a difference
// four million times smaller than the ordinary rounding gap above. Both are
// visually and numerically indistinguishable from the settled value 0 — the
// grain is at rest either way. This is a hardware precision limit, not an
// algebra mismatch; documented here rather than hidden, per T-06's fence.
// (tests/float32Disclosure.test.js locks in the 8/12 and 1.7e-7 figures
// above so this comment cannot silently drift back out of true.)

import {
  SPAWN_HEIGHT,
  FALL_TIME,
  BOUNCE_TIME,
  BOUNCE_DAMPING,
} from '../core/index.js';
import { glslFloat } from './glslNumber.js';
import { SIZE_JITTER_MIN, SIZE_JITTER_MAX } from './grainConstants.js';

const SPAWN_HEIGHT_GLSL = glslFloat(SPAWN_HEIGHT);
const FALL_TIME_GLSL = glslFloat(FALL_TIME);
const BOUNCE_TIME_GLSL = glslFloat(BOUNCE_TIME);
const BOUNCE_DAMPING_GLSL = glslFloat(BOUNCE_DAMPING);
const SIZE_JITTER_MIN_GLSL = glslFloat(SIZE_JITTER_MIN);
const SIZE_JITTER_SPAN_GLSL = glslFloat(SIZE_JITTER_MAX - SIZE_JITTER_MIN);

export const grainVertexShader = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uScale;
uniform vec3 uKeyPos;
uniform float uKeyInt;
// T-13 — reduced motion (DESIGN §8a): 1.0 normal fall/bounce, 0.0 skips
// straight to the settled position with a 200ms per-grain opacity fade-in
// instead. Never changes core/grains.js's buffer, so it can't touch the
// print (DESIGN §8a's proof 3).
uniform float uMotion;
// T-14 addition — Sweep (DESIGN §8 row 11): the elapsed-time origin of a
// radial wipe, in the same clock uTime reads. -1.0 means no sweep active.
uniform float uSweepStart;

attribute float aBirth;
attribute float aPhase;

varying vec3 vKeyDirView;
varying float vKeyFalloff;
varying float vFlight;
varying float vTint;
varying float vAlpha;

// sim.js's constants, spliced in as literals — see this file's header.
const float SPAWN_HEIGHT = ${SPAWN_HEIGHT_GLSL};
const float FALL_TIME = ${FALL_TIME_GLSL};
const float BOUNCE_TIME = ${BOUNCE_TIME_GLSL};
const float BOUNCE_DAMPING = ${BOUNCE_DAMPING_GLSL};

// Cheap deterministic hash of a single float into [0, 1) — used to derive
// per-grain size/tint variation from aPhase (already seeded in core/grains.js)
// without a second attribute array or Math.random() anywhere. See T-08's
// outbox for why aTint/aSize aren't separate buffer attributes here.
float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

void main() {
  // ---- positionAt(originX, originY, originZ, birth, phase, t), inlined ----
  // origin is three.js's built-in "position" attribute; originY is always 0
  // (core/grains.js always writes y = 0), matching sim.js's "rest".
  float local = uTime - aBirth;
  float rest = position.y;

  float y;
  float flight; // 1.0 mid-air, easing to 0.28 settled — the same local/u the
                // position curve uses, per DESIGN §6.5: "do not introduce a
                // second one."

  if (uMotion < 0.5) {
    // Reduced motion (DESIGN §8a): grains render at their settled position
    // immediately — uMotion is a render uniform only, so the buffer this
    // position is read from (and therefore the print) is untouched.
    y = rest;
    flight = 0.28;
  } else if (local <= 0.0) {
    y = rest + SPAWN_HEIGHT;
    flight = 1.0;
  } else if (local < FALL_TIME) {
    float f = local / FALL_TIME;
    float eased = (1.0 - f) * (1.0 - f);
    y = rest + SPAWN_HEIGHT * eased;
    flight = 1.0;
  } else {
    float bounceLocal = local - FALL_TIME;
    if (bounceLocal < BOUNCE_TIME) {
      float u = bounceLocal / BOUNCE_TIME;
      float peak = SPAWN_HEIGHT * BOUNCE_DAMPING;
      y = rest + peak * 4.0 * u * (1.0 - u);
      flight = mix(1.0, 0.28, u);
    } else {
      y = rest;
      flight = 0.28;
    }
  }

  vec3 newPosition = vec3(position.x, y, position.z);
  vec4 worldPosition = modelMatrix * vec4(newPosition, 1.0);
  vec4 mvPosition = viewMatrix * worldPosition;

  // ---- per-grain lighting terms the fragment shader needs (DESIGN §6.5) ----
  vec3 keyViewPos = (viewMatrix * vec4(uKeyPos, 1.0)).xyz;
  vKeyDirView = normalize(keyViewPos - mvPosition.xyz);

  vec3 toKey = uKeyPos - worldPosition.xyz;
  vKeyFalloff = uKeyInt / (1.0 + dot(toKey, toKey));

  vFlight = flight;

  // Reduced motion: a 200ms per-grain opacity fade-in, ordered along the
  // stroke by aBirth (already the emission order — no new attribute
  // needed). Normal motion: full alpha, subject to the Sweep wipe below.
  float alpha = uMotion < 0.5 ? clamp(local / 0.2, 0.0, 1.0) : 1.0;

  // T-14 addition — Sweep (DESIGN §8 row 11): a radial wave fades grains
  // out from the centre outward over ~0.9s. uSweepStart < 0.0 means no
  // sweep is active. The wavefront radius grows faster than the drawable
  // disc so every grain is guaranteed to clear within the window.
  if (uSweepStart >= 0.0) {
    float sweepElapsed = uTime - uSweepStart;
    float grainRadius = length(position.xz);
    float waveRadius = (sweepElapsed / 0.9) * 3.6;
    float swept = clamp((waveRadius - grainRadius) / 0.35, 0.0, 1.0);
    alpha *= (1.0 - swept);
  }

  vAlpha = alpha;

  float h = hash11(aPhase * 91.7 + 13.1);
  vTint = h;
  float sizeJitter = ${SIZE_JITTER_MIN_GLSL} + hash11(aPhase * 47.3 + 3.7) * ${SIZE_JITTER_SPAN_GLSL};

  gl_Position = projectionMatrix * mvPosition;

  // Perspective-correct point size, clamped per DESIGN §6.5: below 1.0 grains
  // vanish, above 64.0 some mobile GLES drivers drop the sprite entirely.
  float size = uSize * sizeJitter * uScale / -mvPosition.z;
  gl_PointSize = clamp(size, 1.0, 64.0);
}
`;
