// The wet-stone ground fragment shader — DESIGN.md §6.6 (revised 2026-08-23
// 20:15 by pc-designer after the composition review rejected the first pass).
// Replaces MeshStandardMaterial + drei's <Environment>/<Lightformer>
// entirely, per DESIGN §7.2 items 5-6: zero lit materials, zero light nodes,
// zero downloaded assets. The "wet" is a 2-octave GLSL value noise driving
// an uneven Fresnel film (never a downloaded texture, DESIGN §11.8); the
// lamp is the same uKeyPos/uKeyColor/uKeyInt the grain shader reads
// (render/lightRig.js, DESIGN §6.4 — one rig, both shaders).
//
// ---------------------------------------------------------------------------
// WHY THIS FILE NO LONGER MATCHES DESIGN §6.6's ORIGINAL GLSL BLOCK
// ---------------------------------------------------------------------------
// The original spec added the lamp to the surface *independently of the
// stone's albedo*:
//
//     col = uStone + uKeyColor * spec * fall + uKeyColor * fall * 0.06 + ...
//
// Those two uKeyColor terms are not light on stone — they are fog. Real
// near-black wet granite (STONE_800 #0B0F12 is ~0.5% linear reflectance)
// cannot return the lamp's own colour at 6% of full intensity no matter how
// close the lamp gets. Because the term ignored albedo it scaled with
// 'fall' alone and washed the whole field to roughly #3a1f10, and the
// specular term (amplitude ~0.45 x fall ~5.5 = 2.5 linear) blew a bright
// blob into the lower right that fought the kolam for the eye.
//
// The fix is not a clamp on 'fall' — it is multiplying the lamp by the
// albedo it is actually falling on. With that one change the ground's
// brightest in-frame pixel is ~0.02 linear instead of ~1.4, an order of
// magnitude below Bloom's 0.28 luminanceThreshold (§7.3): the ground now
// physically cannot bloom, at any lamp distance. The lamp rig itself (§6.4
// KEY_POS / KEY_INT) is unchanged, so the grains — which read the same
// uniforms and already looked right — are untouched by this fix.
//
// The pool, the texture and the sheen all survive; only their magnitude is
// now derived rather than asserted. See DESIGN §6.6 for the revised spec.

export const groundFragmentShader = /* glsl */ `
precision highp float;

uniform vec3  uStone700;   // --stone-700, the dry/high end of the granite mottle
uniform vec3  uStone900;   // --stone-900, the wet/low end, and the void the disc fades into
uniform vec3  uSheen;      // --stone-sheen, the wet film's Fresnel colour
uniform vec3  uKeyColor;
uniform vec3  uKeyPos;
uniform float uKeyInt;
uniform float uAmb;        // GROUND_AMB   — ambient gain; sets the field's near-black level
uniform float uGain;       // GROUND_GAIN  — diffuse gain on albedo * irradiance
uniform float uSheenGain;  // GROUND_SHEEN — how wet the film reads
uniform float uGlintGain;  // GROUND_GLINT — the specular, kept sub-bloom
uniform float uPoolCore;   // GROUND_POOL_CORE — softens 1/d^2 near the lamp
uniform vec2  uFade;       // GROUND_FADE  — [outer, inner] radii of the disc fade

varying vec3 vWorld;
varying vec3 vNormal;

// 2-octave value noise, inline — DESIGN §6.6: "generated in GLSL, not loaded
// and not baked to a canvas — zero textures ship."
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float noise2(vec2 p) {
  return valueNoise(p) * 0.6 + valueNoise(p * 2.13) * 0.4;
}

void main() {
  vec3 n = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorld);

  // ---- the stone itself: mottled near-black granite ----------------------
  // Two scales: a 6x mottle that reads as wet and dry patches of granite,
  // and a fine 26x grit that stops the surface looking like a gradient. Both
  // frequencies were raised from the first pass's 3x/17x, which at this
  // camera distance produced blobs large enough to read as fog drifting over
  // the stone rather than as the stone's own surface. This texture is what
  // makes the field read as stone rather than as void, and it is the reason
  // the ground can be this dark and still be present.
  float grain = noise2(vWorld.xz * 6.0) * 0.72 + noise2(vWorld.xz * 26.0) * 0.28;
  grain = clamp(grain, 0.0, 1.0);
  // The mottle spans --stone-900 to --stone-700, so its mean lands almost
  // exactly on --stone-800: the plane still IS the stone-800 of DESIGN §1.1,
  // it just is not uniform. The ambient term is the pre-dawn sky on the
  // stone; it is deliberately independent of the lamp, which is what keeps
  // the field cool and the diya the only warm thing on the ground.
  vec3  albedo = mix(uStone900, uStone700, grain);
  vec3  base   = albedo * uAmb;

  // ---- the diya's pool ---------------------------------------------------
  // Soft 1/d^2. The clamp the first pass needed is gone, replaced by two
  // things that are derivations rather than fudges:
  //   1. the lamp is multiplied by 'albedo' below, so a near-black surface
  //      returns a near-black amount of it however close the lamp gets;
  //   2. uPoolCore replaces the bare 1.0 in the denominator. A point-source
  //      1/d^2 is only valid at d much greater than the source, and the
  //      diya's flame is ~0.1 units across sitting 0.62 above the stone —
  //      the near-lamp region is exactly where the point approximation
  //      breaks and spikes. With uPoolCore = 2.6 the pool runs 3.02 just
  //      under the lamp to 0.43 at the far edge of the visible disc,
  //      instead of 6.50 to 0.47: same directional read, half the spike.
  vec3  toKey = uKeyPos - vWorld;
  float pool  = uKeyInt / (uPoolCore + dot(toKey, toKey));
  vec3  L     = normalize(toKey);
  float ndl   = max(dot(n, L), 0.0);
  // The 0.30 floor is bounce off the doorstep, not a fudge: it keeps the
  // shadow side of the disc off pure black, which is what AMB_INT does for
  // the grains.
  vec3  lit   = albedo * uKeyColor * pool * (0.30 + 0.70 * ndl) * uGain;

  // ---- the wet film ------------------------------------------------------
  // The wet is carried by Fresnel, not by the specular lobe: at the grazing
  // far edge of the disc the film returns the cool --stone-sheen, at the
  // near edge almost nothing. Modulated by the same noise so the sheen is
  // patchy — the single detail that separates wet stone from black plastic
  // (DESIGN §6.6). It is also the only cool light in frame, which is what
  // holds the warm/cool thesis up now that the pool is dim.
  float fres  = pow(1.0 - max(dot(n, V), 0.0), 4.0);
  vec3  sheen = uSheen * fres * mix(0.55, 1.45, grain) * uSheenGain;

  // ---- the glint ---------------------------------------------------------
  // A tight Blinn-Phong term, broken up by the noise. This is the term that
  // WAS the rejected blob, and it is worth being precise about why: for this
  // camera (§6.2) and this lamp (§6.4) the mirror peak sits at world
  // (0.86, 0, 1.45), which projects to NDC y = -1.19 — just below the bottom
  // of frame. What is visible is only the lobe's skirt, but the skirt was
  // being multiplied by a ~0.45 amplitude and a ~5.5 pool, so it measured
  // #5e2806 in the lower right with the rest of the field at #030101. At
  // the shipped uGlintGain = 0.02 the whole term peaks near 0.003 linear
  // even if a later camera change swings its mirror peak into frame, so the
  // failure mode is closed by magnitude, not by luck of framing. Do not
  // raise it without re-measuring that corner.
  vec3  H     = normalize(L + V);
  float spec  = pow(max(dot(n, H), 0.0), mix(210.0, 46.0, grain)) * mix(0.09, 0.02, grain);
  vec3  glint = uKeyColor * spec * pool * uGlintGain;

  vec3 col = base + lit + sheen + glint;
  // The disc fade, at DESIGN §6.6's original 9.0 -> 1.5. The first pass
  // suspected this of being too wide to shape anything; measurement says
  // otherwise — with the ambient at its corrected level this fade is what
  // carries the far corner down to exactly --stone-900 #06080a, which
  // composition on the kolam (DESIGN §3.3).
  col = mix(uStone900, col, smoothstep(uFade.x, uFade.y, length(vWorld.xz)));

  gl_FragColor = vec4(col, 1.0);
}
`;
