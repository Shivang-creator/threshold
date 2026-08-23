// Emission constants — DESIGN.md §6.7, owned by T-08 per DESIGN §10's board
// mapping. Two of these (SAMPLE_SPACING, SCATTER_RADIUS) are passed straight
// through to core/grains.js's emit(opts); the rest govern the app-layer
// wiring in T-09 (App.jsx) and the vertex shader's point-size attenuation.
//
// GRAINS_PER_SAMPLE is named in DESIGN but not implemented here — see the
// T-08 outbox for why: core/grains.js's emit() writes exactly one jittered
// point per resampled arc-length sample (then the 8 D4 copies), not four.
// Deviating from that inside render/ would mean re-deriving arc-length
// resampling outside the core, which duplicates the one thing the core is
// supposed to own. Flagged as a needs-decision, not silently worked around.

export const SAMPLE_SPACING = 0.02; // world units of arc length between resamples
export const SCATTER_RADIUS = 0.019; // per-axis jitter passed as emit()'s opts.jitter
export const DRAW_RADIUS_MAX = 2.4; // samples beyond this are never emitted
export const TELEPORT_LIMIT = 0.45; // > this in one step = pen-up/pen-down, no connecting line

export const GRAIN_DIAMETER = 0.02; // world units
export const SIZE_JITTER_MIN = 0.75;
export const SIZE_JITTER_MAX = 1.35;
