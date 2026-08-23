import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import * as THREE from "three";
import { Ground } from "./Ground.jsx";
import { Grains } from "./Grains.jsx";

// The real camera — DESIGN §6.2. Pitch is 38.5° above horizontal, derived
// from this framing (not the "~35°" PLAN.md approximated), per the Crew
// Chief's instruction for this task: use 38.5° from here on so nothing is
// reframed later.
const BASE_POSITION = [-0.22, 2.35, 2.95];
const LOOK_AT = [0.0, 0.02, -0.1];

// BlendFunction.SOFT_LIGHT from the `postprocessing` package's enum
// (src/enums/BlendFunction.js) — used as a bare numeric constant rather
// than `import { BlendFunction } from 'postprocessing'` because that
// package is only a transitive dependency of @react-three/postprocessing,
// not declared in this project's package.json; the numeric value is stable
// across postprocessing's public API and avoids adding an undeclared
// direct import path.
const BLEND_SOFT_LIGHT = 29;

// the Breath — DESIGN §6.3: "continuous azimuth ±3.5°, pitch ±1.2°, on a
// 34 s sine about the base position... proving the scene is 3D: without
// parallax, a fixed three-quarter view of a flat pattern can be read as a
// 2D illustration." Amplitude is deliberately tiny so it never fights the
// drawing. Pointer parallax (the other half of DESIGN §6.3) is not built
// here — it needs the live pointer position threaded from Ground/App, which
// is outside this task's fence (lighting, palette, ground shader, bloom,
// tone mapping); flagged in the outbox.
const BREATH_AZIMUTH = THREE.MathUtils.degToRad(3.5);
const BREATH_PITCH = THREE.MathUtils.degToRad(1.2);
const BREATH_PERIOD = 34; // seconds

function dollyFactor(aspect) {
  if (aspect >= 1.4) return 1.0;
  if (aspect >= 1.0) return 1.14;
  if (aspect >= 0.7) return 1.42;
  return 1.62;
}

function CameraRig({ reducedMotion }) {
  const { camera, size } = useThree();
  const kRef = useRef(1);
  const portraitRef = useRef(false);

  useEffect(() => {
    const aspect = size.width / size.height;
    kRef.current = dollyFactor(aspect);
    portraitRef.current = aspect < 1.0;
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  // Recomputes the camera transform from scratch every frame — cheap
  // trigonometry, zero allocation (THREE.Vector3.set/lookAt write into
  // existing storage) — rather than mutating state incrementally, so the
  // dolly factor, the portrait tilt and the Breath can never drift out of
  // sync with each other or with a resize. Reduced motion means the Breath
  // term is simply skipped: the same base position every frame, which is
  // "fixed" (DESIGN §8a).
  useFrame((state) => {
    const k = kRef.current;
    const baseX = BASE_POSITION[0] * k;
    const baseY = BASE_POSITION[1] * k;
    const baseZ = BASE_POSITION[2] * k;

    let x = baseX;
    let y = baseY;
    let z = baseZ;

    if (!reducedMotion) {
      const relX = baseX - LOOK_AT[0];
      const relY = baseY - LOOK_AT[1];
      const relZ = baseZ - LOOK_AT[2];
      const radius = Math.sqrt(relX * relX + relY * relY + relZ * relZ);
      const azimuth0 = Math.atan2(relX, relZ);
      const elevation0 = Math.asin(THREE.MathUtils.clamp(relY / radius, -1, 1));

      const phase = (state.clock.elapsedTime / BREATH_PERIOD) * Math.PI * 2;
      const azimuth = azimuth0 + BREATH_AZIMUTH * Math.sin(phase);
      // Quarter-period offset (cos vs sin) so the two axes trace a small
      // ellipse rather than a straight diagonal line — reads as a "breath"
      // rather than a wobble, while keeping the exact amplitudes DESIGN
      // specifies on each axis independently.
      const elevation = elevation0 + BREATH_PITCH * Math.cos(phase);

      const cosEl = Math.cos(elevation);
      x = LOOK_AT[0] + radius * cosEl * Math.sin(azimuth);
      y = LOOK_AT[1] + radius * Math.sin(elevation);
      z = LOOK_AT[2] + radius * cosEl * Math.cos(azimuth);
    }

    camera.position.set(x, y, z);
    camera.lookAt(LOOK_AT[0], LOOK_AT[1], LOOK_AT[2]);
    if (portraitRef.current) camera.rotateX(-0.045); // pushes the disc down, clearing the plate
  });

  return null;
}

// Keeps a plain ref in sync with the render loop's clock so DOM pointer
// events (outside useFrame) can stamp `emit()`'s `t` with the same "now"
// grain.vert.js's uTime uniform uses — one shared source of truth, updated
// once per frame, no allocation.
function ClockSync({ timeRef, onFrame }) {
  useFrame((state, delta) => {
    timeRef.current = state.clock.elapsedTime;
    onFrame?.(delta, state.clock.elapsedTime);
  });
  return null;
}

function isCoarsePointer() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

// DESIGN §9.2 canvas aria-label, verbatim from §2.
const CANVAS_ARIA_LABEL =
  "A kolam drawing surface. Drag, or use the arrow keys, to draw. Every stroke is mirrored eight ways.";

export function Scene({
  grainsRef,
  timeRef,
  onFrame,
  onDown,
  onMove,
  onUp,
  reducedMotion = false,
  onReady,
  onContextLost,
}) {
  return (
    <Canvas
      dpr={[1, isCoarsePointer() ? 1.75 : 2]}
      camera={{ fov: 32, near: 0.1, far: 40 }}
      gl={{
        antialias: false,
        alpha: false,
        stencil: false,
        depth: true,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.shadowMap.enabled = false;

        // DESIGN §9.2 / §9.3: the drawing surface is a real, labelled,
        // keyboard-focusable control, not a bare <canvas>.
        const el = gl.domElement;
        el.setAttribute("role", "application");
        el.setAttribute("aria-label", CANVAS_ARIA_LABEL);
        el.tabIndex = 0;

        // DESIGN §8b detection order, item 3: a lost context falls back to
        // NoWebGL the same as a failed probe. preventDefault() is the WebGL
        // spec's own signal that the page intends to handle the loss itself
        // rather than the browser's default (silently blanking the canvas).
        el.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          onContextLost?.();
        });

        onReady?.();
      }}
    >
      <CameraRig reducedMotion={reducedMotion} />
      <ClockSync timeRef={timeRef} onFrame={onFrame} />
      <Ground onDown={onDown} onMove={onMove} onUp={onUp} />
      <Grains ref={grainsRef} reducedMotion={reducedMotion} />
      <EffectComposer multisampling={0} disableNormalPass>
        <Bloom
          intensity={1.15}
          luminanceThreshold={0.28}
          luminanceSmoothing={0.22}
          mipmapBlur
          radius={0.72}
          levels={6}
        />
        <Vignette offset={0.28} darkness={0.72} />
        {!reducedMotion && (
          <Noise opacity={0.035} premultiply blendFunction={BLEND_SOFT_LIGHT} />
        )}
      </EffectComposer>
    </Canvas>
  );
}
