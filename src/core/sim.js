// Position, closed-form. positionAt(...) takes a grain's stored origin,
// birth and phase, plus a time value handed in by the caller, and returns
// where that grain is right now. There is no integrator and no memory of
// any previous call — evaluating at t=1.0 directly gives exactly the same
// answer as evaluating at t=0.5 first and then at t=1.0, because nothing
// here accumulates. That is what makes the animation a vertex shader
// reading one uniform rather than a physics step.
//
// The curve: before birth, a grain sits at spawn height, waiting. It falls
// with an eased quadratic to the ground, then rises and falls once more —
// a single damped bounce — before settling exactly at its rest height and
// staying there. This is deliberately not a physics engine: grains do not
// collide with each other or with the settled pattern (named on the page
// as the build's one Simulated, not-physics, imperfection).

/** World units above rest height a grain spawns at before it starts falling. */
export const SPAWN_HEIGHT = 1.2;
/** Seconds a grain takes to fall from spawn height to its first ground contact. */
export const FALL_TIME = 0.6;
/** Seconds the single damped bounce takes, from ground contact back to rest. */
export const BOUNCE_TIME = 0.25;
/** Fraction of spawn height the bounce peak reaches (0..1). */
export const BOUNCE_DAMPING = 0.35;

/**
 * @param {number} originX
 * @param {number} originY  the grain's rest height (grains.js always writes 0)
 * @param {number} originZ
 * @param {number} birth  the time value this grain was written at
 * @param {number} phase  reserved for per-grain bounce variance (unused here)
 * @param {number} t  the caller's current time — the only "now" this
 *   function ever sees; it is a plain argument, never read from a clock
 * @returns {[number, number, number]}
 */
export function positionAt(originX, originY, originZ, birth, phase, t) {
  const local = t - birth;
  const rest = originY;

  let y;
  if (local <= 0) {
    y = rest + SPAWN_HEIGHT;
  } else if (local < FALL_TIME) {
    const f = local / FALL_TIME;
    const eased = (1 - f) * (1 - f);
    y = rest + SPAWN_HEIGHT * eased;
  } else {
    const bounceLocal = local - FALL_TIME;
    if (bounceLocal < BOUNCE_TIME) {
      const u = bounceLocal / BOUNCE_TIME;
      const peak = SPAWN_HEIGHT * BOUNCE_DAMPING;
      y = rest + peak * 4 * u * (1 - u);
    } else {
      y = rest;
    }
  }

  return [originX, y, originZ];
}
