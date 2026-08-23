import { useCallback, useRef } from "react";

/**
 * Drag-to-ground-point hook. Spread the returned handlers onto a mesh's
 * pointer props; @react-three/fiber already resolves the world-space
 * intersection via its own raycaster, so `event.point` is the ground-space
 * hit — no manual THREE.Raycaster needed for this stub.
 *
 * T-02 stub: `onPoint` just logs. T-08/T-09 replace the callback with a
 * write into the core's grain buffer (core/grains.js) instead — this hook's
 * shape (down/move/up handlers producing {x, z} points) does not change.
 *
 * @param {(point: {x: number, z: number}) => void} onPoint
 */
export function useDrag(onPoint) {
  const dragging = useRef(false);

  const onPointerDown = useCallback(
    (event) => {
      dragging.current = true;
      event.target.setPointerCapture?.(event.pointerId);
      onPoint({ x: event.point.x, z: event.point.z });
    },
    [onPoint]
  );

  const onPointerMove = useCallback(
    (event) => {
      if (!dragging.current) return;
      onPoint({ x: event.point.x, z: event.point.z });
    },
    [onPoint]
  );

  const onPointerUp = useCallback((event) => {
    dragging.current = false;
    event.target.releasePointerCapture?.(event.pointerId);
  }, []);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerLeave: onPointerUp,
  };
}
