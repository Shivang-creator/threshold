// DESIGN §2 (copy, verbatim) / §5.3 (the epistemic-tag legend). Four
// fact/tag rows — the only place on the page the build talks about itself.
// All four tags share one colour and one weight; the tag word carries the
// meaning, never colour (DESIGN §5.3, accessibility floor).
//
// Rows 1 and 3 are desktop-only (`.colophon__row--secondary`); mobile keeps
// only the two load-bearing tags, GENERATED and SIMULATED (PLAN.md §3).
//
// The R TO REPLAY / REPLAY affordance lives inside this component, appended
// to the print row's fact text, exactly where DESIGN §5.1's desktop ASCII
// places it. It is hidden below 1024px in favour of the REPLAY button in
// the control row (Controls.jsx) — see this task's outbox for why the two
// live in different DOM parents rather than one element repositioned by
// CSS, and what that costs the keyboard focus-order spec in §9.2.
function formatGrainCount(n) {
  return n.toLocaleString("en-US").replace(/,/g, " ");
}

export function Colophon({ seed, print, grains, printPulsing, canReplay, isCoarsePointer, onReplay }) {
  return (
    <div className="colophon">
      <p className="colophon__fact colophon__row--secondary">eightfold — D4</p>
      <p className="colophon__tag colophon__row--secondary">RULE</p>

      <p className="colophon__fact">
        seed {seed} · print{" "}
        <span className={`colophon__print${printPulsing ? " colophon__print--pulse" : ""}`}>
          {print}
        </span>
        <button
          type="button"
          className={`replay-inline${canReplay ? " replay-inline--visible" : ""}`}
          onClick={onReplay}
          aria-disabled={!canReplay}
          tabIndex={canReplay ? 0 : -1}
        >
          {isCoarsePointer ? "REPLAY" : "R TO REPLAY"}
        </button>
      </p>
      <p className="colophon__tag">GENERATED</p>

      <p className="colophon__fact colophon__row--secondary">{formatGrainCount(grains)} grains</p>
      <p className="colophon__tag colophon__row--secondary">OBSERVED</p>

      <p className="colophon__fact">fall &amp; settle — closed form, not physics</p>
      <p className="colophon__tag">SIMULATED</p>
    </div>
  );
}
