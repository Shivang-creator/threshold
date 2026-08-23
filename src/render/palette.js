// The palette, as plain hex tokens — DESIGN.md §1.1, sRGB. This is the one
// place the hex values live so grain.frag's uniforms (T-08) and, later, the
// ground shader and DOM tokens (T-11/T-12) read the same numbers instead of
// three copies quietly drifting apart.
//
// THREE.Color(hex).convertSRGBToLinear() is applied where a value becomes a
// shader uniform (DESIGN §1.1) — this file only stores the sRGB hex, never a
// converted value, so it stays the single source of truth for both worlds.

export const STONE_900 = '#06080A';
export const STONE_800 = '#0B0F12';
export const STONE_700 = '#141A1F';
export const STONE_SHEEN = '#2A3A44';

export const POWDER_CORE = '#FFF3D6';
export const POWDER_100 = '#FFE6B0';
export const POWDER_300 = '#FFC978';
export const POWDER_500 = '#F2A64B'; // uEmissive on grains
export const POWDER_700 = '#C2691F';
export const LAMP = '#FFB765';
export const PREDAWN = '#4E7A94';

export const KUMKUM = '#B3242A';

export const INK_100 = '#EFE6D6';
export const INK_60 = '#9AA3A8';
export const INK_35 = '#78838A';
