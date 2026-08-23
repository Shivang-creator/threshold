// DESIGN §2 / §5.1 ⓖ / §8 row 4. A 7-second rescue for the judge who does
// not try anything — it does not exist on load and never returns once the
// first pointerdown has happened. This is not an instruction panel
// (PLAN.md §12 refuses one): it is a single line that fades in late and
// leaves for good the moment the judge acts.
export function ControlHint({ visible }) {
  return (
    <p className={`control-hint${visible ? " control-hint--visible" : ""}`} aria-hidden={!visible}>
      DRAG THE STONE
    </p>
  );
}
