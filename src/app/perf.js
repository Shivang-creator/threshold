// Rolling frame-time meter + emission-rate degrade — BOARD T-09, DESIGN
// §7.2 item 7: "degrade the emission rate, never the frame rate." Everything
// here is preallocated once in createPerfMeter(); recordFrame() never
// allocates (no `new`, no array literal, no closure) — the median is taken
// by sorting a reused scratch typed array IN PLACE (TypedArray#sort mutates,
// it does not copy), and that sort only runs once every CHECK_INTERVAL_FRAMES
// rather than every frame, since a threshold sustained over two whole
// seconds needs no finer resolution than that.

const WINDOW_SIZE = 120;
const CHECK_INTERVAL_FRAMES = 30; // ~0.5s at 60fps
const P50_THRESHOLD_MS = 20;
const SUSTAINED_SECONDS = 2;
const SPACING_MULTIPLIER = 1.5;
const MAX_DEGRADE_STEPS = 3;

export const PERF = {
  WINDOW_SIZE,
  P50_THRESHOLD_MS,
  SUSTAINED_SECONDS,
  SPACING_MULTIPLIER,
  MAX_DEGRADE_STEPS,
};

export function createPerfMeter() {
  return {
    deltas: new Float32Array(WINDOW_SIZE),
    scratch: new Float32Array(WINDOW_SIZE),
    idx: 0,
    filled: 0,
    framesSinceCheck: 0,
    badSince: null,
    degradeSteps: 0,
  };
}

/**
 * Call once per frame. Returns the current degrade step count (0..3).
 * @param {ReturnType<typeof createPerfMeter>} meter
 * @param {number} deltaSeconds  this frame's delta, seconds
 * @param {number} nowSeconds  the same clock App.jsx stamps emit()'s t with
 */
export function recordFrame(meter, deltaSeconds, nowSeconds) {
  meter.deltas[meter.idx] = deltaSeconds * 1000;
  meter.idx = (meter.idx + 1) % WINDOW_SIZE;
  meter.filled = Math.min(WINDOW_SIZE, meter.filled + 1);
  meter.framesSinceCheck += 1;

  if (meter.filled < WINDOW_SIZE || meter.framesSinceCheck < CHECK_INTERVAL_FRAMES) {
    return meter.degradeSteps;
  }
  meter.framesSinceCheck = 0;

  meter.scratch.set(meter.deltas);
  meter.scratch.sort();
  const p50 = meter.scratch[WINDOW_SIZE >> 1];

  if (p50 > P50_THRESHOLD_MS) {
    if (meter.badSince === null) {
      meter.badSince = nowSeconds;
    } else if (
      nowSeconds - meter.badSince >= SUSTAINED_SECONDS &&
      meter.degradeSteps < MAX_DEGRADE_STEPS
    ) {
      meter.degradeSteps += 1;
      meter.badSince = nowSeconds; // require a fresh sustained window before degrading again
    }
  } else {
    meter.badSince = null;
  }

  return meter.degradeSteps;
}

/** Emission spacing multiplier for a given degrade step count (>= 1.0). */
export function spacingMultiplierFor(degradeSteps) {
  return SPACING_MULTIPLIER ** degradeSteps;
}
