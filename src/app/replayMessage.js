// R-03 (.crew/RED-TEAM.md ATTACK 13, "The app asserts its own guarantee in a
// hardcoded string"): app/App.jsx's replay() used to call
// setLiveMessage("Replayed. The print is unchanged.") unconditionally, with
// no comparison against the pre-replay print anywhere. The claim happened
// to be true — pc-red-team independently verified determinism in ATTACK 1 —
// but the app itself was never checking; it was asserting. This is the
// exact pattern the Gemini 3 teardown punished (engineering-craft.md §7).
//
// describeReplayResult() is a pure function so the fix can be verified
// without a browser: given the print before and after a replay, it reports
// what actually happened. Pulled out of App.jsx (which needs `window`,
// R3F's render loop, etc. and has no test harness here) so this one
// decision — did the print change? — has a named regression test.

/**
 * @param {string} previousPrint  the buffer's print immediately before replay()
 * @param {string} newPrint  the fresh buffer's print immediately after replay()
 * @returns {string}  the aria-live announcement to show
 */
export function describeReplayResult(previousPrint, newPrint) {
  if (newPrint === previousPrint) {
    return "Replayed. The print is unchanged.";
  }
  return `Replayed. The print changed: ${previousPrint} → ${newPrint}.`;
}
