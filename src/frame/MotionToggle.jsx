// DESIGN §2, §5.1 ⓘ, §8a, §9.3. A real control: keyboard-focusable, state
// carried in the label text (never colour alone), defaulting from
// prefers-reduced-motion and persisted across visits.
export function MotionToggle({ reduced, onToggle }) {
  return (
    <button
      type="button"
      className="btn"
      aria-pressed={reduced}
      onClick={onToggle}
    >
      {reduced ? "MOTION REDUCED" : "MOTION"}
    </button>
  );
}
