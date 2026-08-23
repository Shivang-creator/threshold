// The lighting rig, as shared constants — DESIGN.md §6.4. Both the grain
// shader (T-08, now) and the ground shader (T-11, later) import from here
// instead of each hard-coding the lamp/rim numbers, so retuning the rig is
// a one-file edit. There are no `three` light nodes anywhere in the scene:
// both materials are hand-written shaders that read these as uniforms.

import { LAMP, PREDAWN } from './palette.js';

export const KEY_POS = [1.15, 0.62, 1.05]; // the lamp — a diya at the edge of the doorstep
export const KEY_COLOR = LAMP; // --lamp
export const KEY_INT = 9.0; // with 1/d² falloff, distance 7

export const RIM_DIR = [-2.2, 1.4, -1.8]; // the pre-dawn sky, normalised in the shader
export const RIM_COLOR = PREDAWN; // --predawn
export const RIM_INT = 0.55;

export const AMB_SKY = '#1A2830';
export const AMB_GND = '#0A0806';
export const AMB_INT = 0.3; // keeps shadow sides off pure black

// ---------------------------------------------------------------------------
// Ground response — DESIGN §6.6 (revised 20:15, composition review).
// These four numbers are the ground shader's ONLY tunables. They live here,
// beside the rig, so retuning the stone never means editing GLSL and never
// touches KEY_POS/KEY_INT — which the grains also read, and which are right.
// ---------------------------------------------------------------------------
// Every number below was set by measuring the rendered frame, not by eye —
// a live uniform sweep against sampled pixels at 1440x810, seed 4821.
//
// The counter-intuitive one is GROUND_AMB. The stone tokens in palette.js are
// the intended *screen* colour, but ACESFilmicToneMapping plus exposure 1.05
// plus the post Vignette (§7.3) together attenuate this end of the range by
// roughly 12x: authored at 1.0, --stone-800 lands on screen as #030101, pure
// void. GROUND_AMB is the pre-compensation that puts it back where §1.1 says
// it should be. Do not read it as "the ground is 15x too bright" — read it as
// the ground being authored in linear scene units and graded to the token.
//
// Measured result of these values (see .crew/outbox/T-11-review.md):
//   mean field #090c0e · far corner #06080a (= --stone-900 exactly)
//   brightest non-kolam pixel #1d191c, and it is the kolam's own bloom halo
export const GROUND_AMB = 15.0; // ambient gain on the stone tokens; sets the field's near-black level
export const GROUND_GAIN = 1.5; // the diya's diffuse gain, applied to albedo * irradiance
export const GROUND_SHEEN = 3.8; // Fresnel gain — the wet, and the only cool light in frame
export const GROUND_GLINT = 0.02; // specular gain. At 0.5 this term alone WAS the rejected blob.
export const GROUND_POOL_CORE = 2.6; // softens 1/d^2 near the lamp — the diya is an area source
export const GROUND_FADE = [9.0, 1.5]; // [outer, inner] world radii of the disc fade into --stone-900
