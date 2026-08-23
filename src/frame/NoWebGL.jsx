import { createBuffer, emit } from "../core/index.js";

// DESIGN §8b — the fallback screen. ANALYSIS §5 names school-managed
// laptops with restricted WebGL as kill-risk 1; this is not an error page,
// it is a composed frame built from the deterministic core alone.
//
// This file imports ONLY 'react' and '../core/index.js' — nothing from
// render/ or frame/ — on purpose (T-13's acceptance criterion #1). That
// single import line is the actual proof the core/render boundary is real,
// so every value this file needs from render/'s constant files (palette
// hex, grain size range, the shader's hash11) is duplicated here as a
// literal, each with a comment pointing at its source of truth. This is
// the same "known duplication, disclosed" pattern the README already
// documents for sim.js / grain.vert.js (T-07).

const SEED = 4821;

// DESIGN §4.1 — verbatim, the Invocation's own control points, reused here
// as this fallback's first authored stroke.
const INVOCATION = [
  [-1.02, 0.62],
  [-0.71, 0.3],
  [-0.38, 0.09],
  [-0.06, -0.04],
  [0.24, -0.02],
  [0.49, 0.14],
  [0.66, 0.41],
  [0.72, 0.74],
  [0.61, 1.01],
];
// DESIGN §8b calls for "INVOCATION + 2 more authored strokes" but gives no
// control points for the other two — a gap in DESIGN.md (flagged in this
// task's outbox). These two are pc-frontend's own small, hand-placed marks,
// chosen only to sit inside DRAW_RADIUS_MAX and read as a second and third
// pass of the same doorstep drawing, not as a second design decision.
const STROKE_B = [
  [0.92, -0.78],
  [0.6, -0.58],
  [0.3, -0.52],
  [0.06, -0.64],
  [-0.08, -0.88],
];
const STROKE_C = [
  [0.18, 0.92],
  [0.38, 0.72],
  [0.46, 0.48],
  [0.38, 0.26],
  [0.2, 0.16],
];
const STROKES = [INVOCATION, STROKE_B, STROKE_C];

// Emission constants — DESIGN §6.7 / src/render/grainConstants.js is their
// real source of truth; duplicated here only because this file cannot
// import that module.
const SIZE_JITTER_MIN = 0.75;
const SIZE_JITTER_MAX = 1.35;

// Palette — src/render/palette.js is their real source of truth.
const POWDER_CORE = [0xff, 0xf3, 0xd6];
const POWDER_100 = [0xff, 0xe6, 0xb0];
const POWDER_300 = [0xff, 0xc9, 0x78];

// The screen-space projection: a plain isotropic world→SVG scale centred at
// DESIGN §3.3's composition point (58% width, 56% height). Not a
// perspective match to the real camera (§6.2) — a flat top-down scale is
// enough to keep the D4 symmetry legible, which is the one thing this
// fallback exists to prove.
const VIEW_W = 1000;
const VIEW_H = 562.5;
const CENTER_X = VIEW_W * 0.58;
const CENTER_Y = VIEW_H * 0.56;
const SCALE = 210;
const CIRCLE_CAP = 1100;

function fract(x) {
  return x - Math.floor(x);
}
// Mirrors grain.vert.js's hash11 exactly (T-08), reimplemented in plain JS
// since this file cannot import a GLSL string.
function hash11(p) {
  p = fract(p * 0.1031);
  p = p * (p + 33.33);
  p = p * (p + p);
  return fract(p);
}
function smoothstep(edge0, edge1, x) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
function mixRgb(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
function rgbToHex([r, g, b]) {
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  return "#" + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("");
}

function buildKolam() {
  const buffer = createBuffer(6000);
  for (const stroke of STROKES) {
    // Resets the core's arc-length continuity between logically separate
    // strokes — the same direct-field reset App.jsx's startStroke() uses,
    // for the same reason (T-06 outbox decision #5): without it,
    // core/grains.js's resample() would draw a spurious connecting line
    // from one stroke's last point straight to the next stroke's first.
    buffer._lastPoint = null;
    buffer._carry = 0;
    emit(
      buffer,
      stroke.map(([x, z]) => ({ x, z })),
      SEED,
      { t: 0 }
    );
  }
  return buffer;
}

function buildCircles(buffer) {
  const step = Math.max(1, Math.ceil(buffer.count / CIRCLE_CAP));
  const circles = [];
  for (let i = 0, drawn = 0; i < buffer.count; i += step, drawn += 1) {
    const ox = buffer.origin[i * 3];
    const oz = buffer.origin[i * 3 + 2];
    const phase = buffer.phase[i];

    const vTint = hash11(phase * 91.7 + 13.1);
    const sizeJitter = SIZE_JITTER_MIN + hash11(phase * 47.3 + 3.7) * (SIZE_JITTER_MAX - SIZE_JITTER_MIN);

    const stop1 = mixRgb(POWDER_CORE, POWDER_100, vTint);
    const fillRgb = mixRgb(stop1, POWDER_300, smoothstep(0.6, 1.0, vTint));

    const rNorm = (sizeJitter - SIZE_JITTER_MIN) / (SIZE_JITTER_MAX - SIZE_JITTER_MIN);
    const r = 1.5 + rNorm * 2.0;
    const opacity = [0.55, 0.8, 1.0][drawn % 3];

    circles.push({
      x: CENTER_X + ox * SCALE,
      y: CENTER_Y + oz * SCALE,
      r,
      fill: rgbToHex(fillRgb),
      opacity,
    });
  }
  return circles;
}

const KOLAM = buildKolam();
const CIRCLES = buildCircles(KOLAM);

/**
 * @param {{ contextLost?: boolean }} props  `contextLost` distinguishes "the
 *   3D canvas was interrupted mid-session" from "this browser could never
 *   open one" (DESIGN §8b) — the copy and the RELOAD button both hinge on it.
 */
export function NoWebGL({ contextLost = false }) {
  return (
    <>
      <svg
        className="nowebgl-svg"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label="A kolam drawn in rice powder, rendered as the static fallback for a browser without WebGL."
      >
        <defs>
          <radialGradient id="nowebgl-lamp" cx="72%" cy="62%" r="60%">
            <stop offset="0%" stopColor="#FFB765" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#FFB765" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="nowebgl-predawn" cx="18%" cy="20%" r="60%">
            <stop offset="0%" stopColor="#4E7A94" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#4E7A94" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="nowebgl-vignette" cx="50%" cy="50%" r="72%">
            <stop offset="55%" stopColor="#06080A" stopOpacity="0" />
            <stop offset="100%" stopColor="#06080A" stopOpacity="1" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="#06080A" />
        <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="url(#nowebgl-predawn)" />
        <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="url(#nowebgl-lamp)" />
        {CIRCLES.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={c.r} fill={c.fill} opacity={c.opacity} />
        ))}
        <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="url(#nowebgl-vignette)" />
      </svg>

      <div className="stage">
        <div className="stage__top">
          <div className="title-plate">
            <h1 className="title-plate__title">Threshold</h1>
            <div className="title-plate__rule" />
            <p className="title-plate__tamil">கோலம் · a doorstep drawing</p>
            <p className="title-plate__concept">
              One stroke falls as eight. Rice powder on wet stone — a kolam, the way it is
              drawn on the doorstep at dawn.
            </p>
            <p className="nowebgl-copy">
              {contextLost
                ? "The 3D canvas was interrupted."
                : "This browser could not open a 3D canvas. The drawing is here anyway."}
            </p>
            {contextLost && (
              <button
                type="button"
                className="reload-btn"
                onClick={() => window.location.reload()}
              >
                RELOAD
              </button>
            )}
          </div>
        </div>
        <div className="stage__bottom">
          <div className="colophon">
            <p className="colophon__fact">eightfold — D4</p>
            <p className="colophon__tag">RULE</p>
            <p className="colophon__fact">
              seed {SEED} · print <span className="colophon__print">{KOLAM.print}</span>
            </p>
            <p className="colophon__tag">GENERATED</p>
          </div>
        </div>
      </div>
    </>
  );
}
