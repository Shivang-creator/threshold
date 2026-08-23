// The analytic grain fragment shader — DESIGN.md §6.5, copied structurally
// verbatim from the design doc's GLSL block. Point sprites are unlit
// billboards by default; this reconstructs a fake hemisphere normal from
// gl_PointCoord so a flat point sprite reads as a lit 3D grain of powder,
// with the warm key light and the cool pre-dawn rim resolved on every
// single grain (the palette thesis, DESIGN §6.4).

export const grainFragmentShader = /* glsl */ `
precision highp float;

uniform vec3 uPowderCore;
uniform vec3 uPowder100;
uniform vec3 uPowder300;
uniform vec3 uPowder700;
uniform vec3 uEmissive;
uniform vec3 uKeyColor;
uniform vec3 uRimColor;
uniform float uEmissiveGain;

varying vec3 vKeyDirView;
varying float vKeyFalloff;
varying float vFlight;
varying float vTint;
varying float vAlpha;

void main() {
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(uv, uv);
  if (r2 > 1.0) discard;
  vec3 n = normalize(vec3(uv.x, -uv.y, sqrt(max(1.0 - r2, 0.0)))); // fake hemisphere, view space

  float lam  = max(dot(n, vKeyDirView), 0.0);                        // warm key, per-grain direction
  float rim  = pow(1.0 - max(n.z, 0.0), 2.2);                        // cool pre-dawn edge
  vec3 tint  = mix(mix(uPowderCore, uPowder100, vTint), uPowder300,   // 3-stop ramp, seeded per grain
                   smoothstep(0.6, 1.0, vTint));

  vec3 col = uPowder700 * 0.22                       // shadow-side floor, never black
           + tint * uKeyColor * (0.95 * lam) * vKeyFalloff
           + uRimColor * rim * 0.55
           + uEmissive * vFlight * uEmissiveGain;    // hot in air, warm on the ground

  float a  = smoothstep(1.0, 0.72, r2);              // soft edge — no hard disc, ever
  gl_FragColor = vec4(col, a * vAlpha);
}
`;
