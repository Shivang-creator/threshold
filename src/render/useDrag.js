import { useCallback, useEffect, useRef } from "react";

/**
 * Drag-to-ground-point hook. Spread the returned handlers onto a mesh's
 * pointer props; @react-three/fiber already resolves the world-space
 * intersection via its own raycaster, so `event.point` is the ground-space
 * hit — no manual THREE.Raycaster needed.
 *
 * T-02 stub shape kept, extended for T-09: separate onDown/onMove/onUp
 * callbacks (the stub only had one `onPoint` used for both down and move,
 * which can't tell App.jsx "this is the start of a new stroke" — needed for
 * DESIGN §4.3's tap-emits-before-any-movement behaviour and for resetting
 * the core's arc-length continuity between strokes).
 *
 * Per DESIGN §9.1: only the first active pointer is tracked; a second touch
 * point is ignored outright (prevents chaos / accidental pinch-zoom). Leave,
 * cancel, and window blur all behave exactly like pointerup.
 *
 * @param {{
 *   onDown?: (point: {x:number, z:number}) => void,
 *   onMove?: (point: {x:number, z:number}) => void,
 *   onUp?: () => void,
 * }} handlers
 */
export function useDrag({ onDown, onMove, onUp } = {}) {
  const activePointerId = useRef(null);

  const end = useCallback(
    (event) => {
      if (event && event.pointerId !== activePointerId.current) return;
      if (activePointerId.current === null) return;
      activePointerId.current = null;
      event?.target?.releasePointerCapture?.(event.pointerId);
      onUp?.();
    },
    [onUp]
  );

  const onPointerDown = useCallback(
    (event) => {
      // Second+ touch point while one is already active: ignored.
      if (activePointerId.current !== null) return;
      activePointerId.current = event.pointerId;
      event.target.setPointerCapture?.(event.pointerId);
      onDown?.({ x: event.point.x, z: event.point.z });
    },
    [onDown]
  );

  const onPointerMove = useCallback(
    (event) => {
      if (activePointerId.current === null) return;
      if (event.pointerId !== activePointerId.current) return;
      onMove?.({ x: event.point.x, z: event.point.z });
    },
    [onMove]
  );

  // window blur behaves exactly like pointerup (DESIGN §9.1) — the mesh
  // never sees a blur event, so this is a window-level listener.
  useEffect(() => {
    const onBlur = () => end();
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [end]);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: end,
    onPointerLeave: end,
    onPointerCancel: end,
  };
}
