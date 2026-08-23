import { MotionToggle } from "./MotionToggle.jsx";

// DESIGN §5.1 ⓘ / §5.2 (mobile control row) / §9.1 (touch parity) / §12.2
// and §12.3 (the Crew Chief's approved additions: a touch REPLAY control
// and SWEEP). Desktop shows [ MOTION ][ SWEEP ] only — REPLAY there is the
// inline affordance in Colophon.jsx, next to the print value, because the
// `R` key already exists on desktop. Below 1024px REPLAY has no keyboard
// equivalent, so it becomes a third full-width button here instead
// (`.btn--replay-row`, display:none above 1024px).
export function Controls({
  reducedMotion,
  onToggleMotion,
  onReplay,
  canReplay,
  onSweep,
  canSweep,
}) {
  return (
    <div className="controls">
      <MotionToggle reduced={reducedMotion} onToggle={onToggleMotion} />
      <button
        type="button"
        className="btn btn--replay-row"
        onClick={onReplay}
        aria-disabled={!canReplay}
      >
        REPLAY
      </button>
      <button
        type="button"
        className="btn"
        onClick={onSweep}
        aria-disabled={!canSweep}
      >
        SWEEP
      </button>
    </div>
  );
}
