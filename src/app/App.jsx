import { useEffect, useRef, useState } from "react";
import { createBuffer, emit, resetStroke, FALL_TIME, BOUNCE_TIME } from "../core/index.js";
import { Scene } from "../render/Scene.jsx";
import { NoWebGL } from "../frame/NoWebGL.jsx";
import { TitlePlate } from "../frame/TitlePlate.jsx";
import { ControlHint } from "../frame/ControlHint.jsx";
import { Colophon } from "../frame/Colophon.jsx";
import { Controls } from "../frame/Controls.jsx";
import { SceneErrorBoundary } from "./SceneErrorBoundary.jsx";
import { probeWebGL } from "./detectWebGL.js";
import { useReducedMotion } from "./useReducedMotion.js";
import {
  SAMPLE_SPACING,
  SCATTER_RADIUS,
  DRAW_RADIUS_MAX,
  TELEPORT_LIMIT,
} from "../render/grainConstants.js";
import { createPerfMeter, recordFrame, spacingMultiplierFor } from "./perf.js";
import { describeReplayResult } from "./replayMessage.js";
import {
  INVOCATION_POINTS,
  INVOCATION_START,
  INVOCATION_DURATION,
} from "./invocation.js";

const CAPACITY = 20000;
const TAP_HALF_STEP = SAMPLE_SPACING / 2;
const HINT_DELAY_MS = 7000;
const SWEEP_DURATION = 0.9;

function resolveSeed() {
  if (typeof window !== "undefined") {
    const fromUrl = new URLSearchParams(window.location.search).get("seed");
    if (fromUrl && /^\d+$/.test(fromUrl)) return Number(fromUrl) >>> 0;
  }
  const arr = new Uint32Array(1);
  (typeof crypto !== "undefined" ? crypto : window.crypto).getRandomValues(arr);
  return arr[0];
}

function isCoarsePointer() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

// T-09 — the signature moment. Wires useDrag (via Scene -> Ground) to
// core.emit and Grains.pushRange: this is the only file that turns a
// dragged {x, z} point into grains in the GPU buffer. No instruction panel
// is added here or ever (PLAN.md §12) — the eightfold response on the first
// millimetre of movement is the tutorial (DESIGN §4.3).
//
// T-12/T-13/T-14 + the three approved additions (.crew/DECISIONS.md 19:05)
// extend this same file: the site frame, the WebGL/context-lost fallback,
// reduced motion, the Invocation, Replay (key + touch), and Sweep. All of
// it is driven from the same emit()-call ledger described just above
// emitRaw() below — that ledger is what makes Replay's print guarantee
// genuinely true rather than merely usually true.
export function App() {
  const [seed] = useState(resolveSeed);
  const [webglSupported] = useState(() => probeWebGL());
  const [sceneCrashed, setSceneCrashed] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [reducedMotion, toggleReducedMotion] = useReducedMotion();
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [settled, setSettled] = useState(false);
  const [printPulsing, setPrintPulsing] = useState(false);
  const [colophon, setColophon] = useState({ grains: 0, print: "00000000" });
  const [liveMessage, setLiveMessage] = useState("");

  const bufferRef = useRef(null);
  if (bufferRef.current === null) bufferRef.current = createBuffer(CAPACITY);

  const grainsRef = useRef(null);
  const timeRef = useRef(0);
  const perfMeterRef = useRef(createPerfMeter());
  const degradeStepsRef = useRef(0);
  // The last point *this app layer* actually emitted, within the current
  // stroke — distinct from, and simpler than, core/grains.js's own internal
  // `_lastPoint`/`_carry` (see resetContinuity() below for why both matter).
  const lastPointRef = useRef(null);

  // The full ordered ledger of everything ever written into the live
  // buffer: a 'reset' entry at every stroke boundary (mirroring the
  // `_lastPoint`/`_carry` reset below) and an 'emit' entry — segment,
  // spacing, jitter, exactly as passed to core.emit() — for every write.
  // Replay (T-14) and the Invocation (§4.1) are both just "play this ledger
  // into a buffer": the Invocation is the ledger's first entries, autoplayed
  // at boot; Replay is the whole ledger, replayed on demand into a fresh
  // buffer with the same seed. Because resample()'s arc-length carry means
  // *how* a path is chunked into emit() calls never changes the resulting
  // samples (tests/grains.test.js
  // test_arc_length_spacing_is_constant_regardless_of_sample_density), the
  // only things that matter for byte-identical replay are: the same seed,
  // the same segment content, the same spacing/jitter per call, the same
  // reset points, in the same order — which is exactly what this ledger
  // records and nothing more.
  const logRef = useRef([]);
  const pendingSettleAtRef = useRef(-Infinity);
  const invocationRef = useRef({ armed: true, started: false, fedIndex: 0 });
  const sweepRef = useRef({ active: false, startElapsed: 0 });
  const hintTimerRef = useRef(null);

  useEffect(() => {
    // Dev/verification hook, not a shipped UI surface: lets a script (or
    // pc-red-team/pc-test-user) read the buffer's live count/print without
    // a debug panel on the page itself. `buffer` is a getter, not a
    // snapshot — bufferRef.current is *reassigned* wholesale by both
    // replay() and Sweep's hard reset, so a plain property captured once at
    // mount would silently go stale the first time either fires.
    window.__threshold = {
      get buffer() {
        return bufferRef.current;
      },
      seed,
      grainsRef,
      perfMeterRef,
      replay,
      sweep,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  // T-14: "Add ?seed= to the URL on first load" — a judge's screenshot (or
  // pc-red-team / pc-video-director's pinned run) is reproducible from the
  // URL alone.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("seed") !== String(seed)) {
      url.searchParams.set("seed", String(seed));
      window.history.replaceState(null, "", url.toString());
    }
  }, [seed]);

  // DESIGN §5.1 ⓖ / §8 row 4: the hint fades in at 7s only if nothing has
  // happened yet, and never returns once dismissed.
  useEffect(() => {
    hintTimerRef.current = window.setTimeout(() => setShowHint(true), HINT_DELAY_MS);
    return () => window.clearTimeout(hintTimerRef.current);
  }, []);

  function pushWrittenRange(prevCursor, buffer) {
    const written = (buffer.cursor - prevCursor + buffer.capacity) % buffer.capacity;
    // NOTE: if a single emit() call ever wrote a count that is an exact
    // multiple of `capacity`, this formula reads 0 (cursor laps back to the
    // same slot). Not reachable from interactive dragging — one pointermove
    // covers at most a few hundred grains, nowhere near 20 000 — but real
    // for a single synthetic call feeding an enormous segment.
    if (written === 0) return;
    if (prevCursor + written <= buffer.capacity) {
      grainsRef.current?.pushRange(prevCursor, written, buffer);
    } else {
      const firstPart = buffer.capacity - prevCursor;
      const secondPart = written - firstPart;
      grainsRef.current?.pushRange(prevCursor, firstPart, buffer);
      grainsRef.current?.pushRange(0, secondPart, buffer);
    }
  }

  // The one place emit() is actually called. spacing/jitter are passed in
  // explicitly (never recomputed from live degrade state) so that Replay —
  // which calls this with historical values read back from the ledger —
  // can never diverge from what was originally drawn even if the perf
  // degrade level has since changed (DESIGN §7.2 item 7 / this is exactly
  // what pc-red-team's T-21 attack #3 tries to break).
  function emitRaw(segment, spacing, jitter, t, { record = true } = {}) {
    const buffer = bufferRef.current;
    const prevCursor = buffer.cursor;
    emit(buffer, segment, seed, { spacing, jitter, t });
    pushWrittenRange(prevCursor, buffer);
    if (record) logRef.current.push({ type: "emit", segment, spacing, jitter });
    pendingSettleAtRef.current = Math.max(pendingSettleAtRef.current, t + FALL_TIME + BOUNCE_TIME);
    setSettled(false);
    setColophon({ grains: buffer.count, print: buffer.print });
  }

  function resetContinuity({ record = true } = {}) {
    const buffer = bufferRef.current;
    // Reset the core's arc-length continuity before a new stroke's first
    // sample. Without this, core/grains.js's resample() would measure a
    // "segment" from wherever the *previous* stroke (or a large teleport)
    // ended straight to this new point, drawing a spurious connecting line
    // across the pattern — the exact bug TELEPORT_LIMIT is named for in
    // DESIGN §6.7. resetStroke() is the core's public API for this (R-03b,
    // .crew/DECISIONS.md 19:40) — it doesn't touch origin/birth/phase/
    // count/cursor/print and can't affect determinism of what's already
    // written. Logged as its own ledger entry so Replay can reproduce these
    // resets in the same places (see logRef's comment).
    resetStroke(buffer);
    if (record) logRef.current.push({ type: "reset" });
  }

  function emitAndPush(segment, t) {
    const spacing = SAMPLE_SPACING * spacingMultiplierFor(degradeStepsRef.current);
    emitRaw(segment, spacing, SCATTER_RADIUS, t);
  }

  function startStroke(point) {
    // DESIGN §4.1: pointerdown aborts the Invocation within one frame.
    invocationRef.current.armed = false;

    resetContinuity();
    lastPointRef.current = point;
    if (!hasInteracted) setHasInteracted(true);

    // core/grains.js's resample() needs two distinct points to measure a
    // distance from — a single stationary point can never produce a sample.
    // A tiny, symmetric segment centred on `point` (half a sample-spacing
    // each side) is the only way to get "one sample-step emits before any
    // movement" (DESIGN §3.2 t=0.00, §4.3) out of the frozen resample
    // contract; it lands within ~0.01 world units (a few screen px) of the
    // real point.
    emitAndPush(
      [
        { x: point.x - TAP_HALF_STEP, z: point.z },
        { x: point.x + TAP_HALF_STEP, z: point.z },
      ],
      timeRef.current
    );
  }

  function continueStroke(point) {
    if (lastPointRef.current === null) {
      startStroke(point);
      return;
    }
    if (Math.hypot(point.x, point.z) > DRAW_RADIUS_MAX) {
      // Beyond the drawable disc: emission stops, no message (DESIGN §6.7 /
      // §8 row 6 — "the boundary is felt, never announced"). lastPointRef
      // deliberately stays put so re-entry is handled by the teleport check
      // below rather than silently resuming from off-disc coordinates.
      return;
    }
    const dx = point.x - lastPointRef.current.x;
    const dz = point.z - lastPointRef.current.z;
    if (Math.hypot(dx, dz) > TELEPORT_LIMIT) {
      // Pen effectively skipped across the pattern — start a fresh mark
      // instead of connecting with a straight line across it.
      startStroke(point);
      return;
    }
    emitAndPush([lastPointRef.current, point], timeRef.current);
    lastPointRef.current = point;
  }

  function endStroke() {
    // Grains already written keep falling on their own closed-form clocks —
    // nothing to stop. lastPointRef is intentionally left as-is; the next
    // pointerdown always calls startStroke(), which resets continuity.
  }

  // ---- the Invocation (DESIGN §4.1) ------------------------------------
  // Plays INVOCATION_POINTS through the same emitRaw() ledger, paced over
  // INVOCATION_DURATION starting at INVOCATION_START. Chunking is purely
  // for animation pacing (see logRef's comment) — the final samples are
  // identical no matter how this is diced, so there is no determinism risk
  // in feeding it a variable number of points per frame.
  function runInvocation(elapsed) {
    const inv = invocationRef.current;
    if (!inv.armed) return;
    if (!inv.started) {
      if (elapsed < INVOCATION_START) return;
      inv.started = true;
      resetContinuity();
    }
    const localT = elapsed - INVOCATION_START;
    const frac = Math.min(1, localT / INVOCATION_DURATION);
    const targetIndex = Math.max(1, Math.round(frac * (INVOCATION_POINTS.length - 1)));
    if (targetIndex > inv.fedIndex) {
      const segment = INVOCATION_POINTS.slice(inv.fedIndex, targetIndex + 1);
      emitAndPush(segment, elapsed);
      inv.fedIndex = targetIndex;
    }
    if (frac >= 1) {
      inv.armed = false;
    }
  }

  // ---- Replay (T-14) / touch REPLAY (§12.2) ----------------------------
  // Fresh buffer, same seed, the whole ledger replayed in order. Every
  // grain gets a new birth = "now", so the entire pattern falls again at
  // once — dramatic, and correct, because sim.js's position is a pure
  // function of (origin, birth, phase, t): birth never enters the print.
  function replay() {
    const log = logRef.current;
    if (log.length === 0) return;

    // R-03 (.crew/RED-TEAM.md ATTACK 13): this used to be a hardcoded
    // string, never actually compared. Capture the print the buffer holds
    // *before* replay so the announcement below can be a real comparison,
    // not an asserted one.
    const previousPrint = bufferRef.current.print;

    const fresh = createBuffer(CAPACITY);
    bufferRef.current = fresh;
    lastPointRef.current = null;
    invocationRef.current.armed = false;
    sweepRef.current.active = false;
    grainsRef.current?.setSweep?.(null);
    pendingSettleAtRef.current = -Infinity;

    const now = timeRef.current;
    const rebuilt = [];
    for (const entry of log) {
      if (entry.type === "reset") {
        resetStroke(fresh);
        rebuilt.push(entry);
        continue;
      }
      const prevCursor = fresh.cursor;
      emit(fresh, entry.segment, seed, { spacing: entry.spacing, jitter: entry.jitter, t: now });
      pushWrittenRange(prevCursor, fresh);
      rebuilt.push(entry);
    }
    logRef.current = rebuilt;
    pendingSettleAtRef.current = now + FALL_TIME + BOUNCE_TIME;
    setSettled(false);
    setColophon({ grains: fresh.count, print: fresh.print });
    setLiveMessage(describeReplayResult(previousPrint, fresh.print));
  }

  // ---- Sweep (§12.3) ----------------------------------------------------
  function sweep() {
    if (bufferRef.current.count === 0 || sweepRef.current.active) return;
    sweepRef.current = { active: true, startElapsed: timeRef.current };
    grainsRef.current?.setSweep?.(timeRef.current);
    setLiveMessage("Stone swept.");
  }

  function onFrame(delta, elapsed) {
    degradeStepsRef.current = recordFrame(perfMeterRef.current, delta, elapsed);
    runInvocation(elapsed);

    if (!settled && bufferRef.current.count > 0 && elapsed >= pendingSettleAtRef.current) {
      setSettled(true);
      setPrintPulsing(true);
      setLiveMessage("Eight strokes drawn.");
      window.setTimeout(() => setPrintPulsing(false), 700);
    }

    if (sweepRef.current.active && elapsed - sweepRef.current.startElapsed >= SWEEP_DURATION) {
      sweepRef.current.active = false;
      const fresh = createBuffer(CAPACITY);
      bufferRef.current = fresh;
      logRef.current = [];
      lastPointRef.current = null;
      pendingSettleAtRef.current = -Infinity;
      grainsRef.current?.clear?.();
      grainsRef.current?.setSweep?.(null);
      setSettled(false);
      setColophon({ grains: 0, print: fresh.print });
    }
  }

  function onKeyDown(event) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === "r" || event.key === "R") {
      event.preventDefault();
      replay();
    } else if (event.key === "Escape") {
      event.preventDefault();
      sweep();
    }
  }

  // Mounted once: replay()/sweep() only ever touch refs (always current)
  // and stable useState setters, so this listener never goes stale despite
  // subscribing exactly once.
  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fallback = !webglSupported || sceneCrashed || contextLost;
  if (fallback) return <NoWebGL contextLost={contextLost} />;

  return (
    <>
      <SceneErrorBoundary onError={() => setSceneCrashed(true)}>
        <Scene
          grainsRef={grainsRef}
          timeRef={timeRef}
          onFrame={onFrame}
          onDown={startStroke}
          onMove={continueStroke}
          onUp={endStroke}
          reducedMotion={reducedMotion}
          onReady={() => setSceneReady(true)}
          onContextLost={() => setContextLost(true)}
        />
      </SceneErrorBoundary>

      <div className="stage">
        <div className="stage__top">
          <TitlePlate ready={sceneReady} />
        </div>
        <div className="stage__bottom">
          <Colophon
            seed={seed}
            print={colophon.print}
            grains={colophon.grains}
            printPulsing={printPulsing}
            canReplay={settled}
            isCoarsePointer={isCoarsePointer()}
            onReplay={replay}
          />
          <div className="stage__bottom-right">
            <ControlHint visible={showHint && !hasInteracted} />
            <Controls
              reducedMotion={reducedMotion}
              onToggleMotion={toggleReducedMotion}
              onReplay={replay}
              canReplay={settled}
              onSweep={sweep}
              canSweep={colophon.grains > 0}
            />
          </div>
        </div>
      </div>

      <div aria-live="polite" className="visually-hidden">
        {liveMessage}
      </div>
    </>
  );
}
