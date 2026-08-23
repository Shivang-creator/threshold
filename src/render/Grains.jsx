import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { grainVertexShader } from './grain.vert.js';
import { grainFragmentShader } from './grain.frag.js';
import { KEY_POS, KEY_COLOR, KEY_INT, RIM_COLOR } from './lightRig.js';
import { POWDER_CORE, POWDER_100, POWDER_300, POWDER_500, POWDER_700 } from './palette.js';
import { GRAIN_DIAMETER } from './grainConstants.js';

// T-08 — the grain renderer. One <points> object over a 20 000-slot
// preallocated BufferGeometry (PLAN.md's substrate), positioned entirely by
// grain.vert.js's closed-form formula. This component never computes a
// grain's position on the CPU — it only ever copies core/grains.js's
// already-written origin/birth/phase into its own GPU-bound typed arrays
// and marks the touched range dirty.
//
// Why a copy, not a shared buffer: core/grains.js's createBuffer() allocates
// its own Float32Arrays internally (the core owns that memory, per the
// boundary — it must not import three.js to hand out a THREE.BufferAttribute
// directly). So GrainBuffer.origin/birth/phase and this geometry's
// position/aBirth/aPhase are two separate typed arrays; pushRange's job is
// the one place that bridges them, via .set() — a bounded copy of exactly
// the newly-written range, never the whole buffer.

const CAPACITY = 20000;

function toLinear(hex) {
  return new THREE.Color(hex).convertSRGBToLinear();
}

export const Grains = forwardRef(function Grains({ reducedMotion = false }, ref) {
  const { geometry, material } = useMemo(() => {
    const geometry = new THREE.BufferGeometry();

    const positionArray = new Float32Array(CAPACITY * 3);
    const birthArray = new Float32Array(CAPACITY);
    const phaseArray = new Float32Array(CAPACITY);

    const position = new THREE.Float32BufferAttribute(positionArray, 3);
    const aBirth = new THREE.Float32BufferAttribute(birthArray, 1);
    const aPhase = new THREE.Float32BufferAttribute(phaseArray, 1);
    position.setUsage(THREE.DynamicDrawUsage);
    aBirth.setUsage(THREE.DynamicDrawUsage);
    aPhase.setUsage(THREE.DynamicDrawUsage);

    geometry.setAttribute('position', position);
    geometry.setAttribute('aBirth', aBirth);
    geometry.setAttribute('aPhase', aPhase);
    // Nothing has been emitted yet — draw nothing until the first pushRange.
    geometry.setDrawRange(0, 0);

    const material = new THREE.ShaderMaterial({
      vertexShader: grainVertexShader,
      fragmentShader: grainFragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: GRAIN_DIAMETER },
        uScale: { value: 1 },
        uKeyPos: { value: new THREE.Vector3(...KEY_POS) },
        uKeyInt: { value: KEY_INT },
        uPowderCore: { value: toLinear(POWDER_CORE) },
        uPowder100: { value: toLinear(POWDER_100) },
        uPowder300: { value: toLinear(POWDER_300) },
        uPowder700: { value: toLinear(POWDER_700) },
        uEmissive: { value: toLinear(POWDER_500) },
        uKeyColor: { value: toLinear(KEY_COLOR) },
        uRimColor: { value: toLinear(RIM_COLOR) },
        // Settle-breath (DESIGN §3.2, t=3.0-4.2s) is a nice-to-have beyond
        // this build's fenced tasks; held at 1 so the emissive term is
        // correct but static (see this task's outbox).
        uEmissiveGain: { value: 1.0 },
        // T-13 — reduced motion (DESIGN §8a): 1 normal, 0 skips fall/bounce.
        uMotion: { value: reducedMotion ? 0 : 1 },
        // T-14 addition — Sweep (DESIGN §8 row 11): <0 means inactive.
        uSweepStart: { value: -1 },
      },
    });

    return { geometry, material };
  }, []);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  // T-13: reduced motion can change at any time (the MOTION button, or the
  // OS setting live-changing) — keep the uniform in sync with the prop.
  useEffect(() => {
    material.uniforms.uMotion.value = reducedMotion ? 0 : 1;
  }, [material, reducedMotion]);

  useImperativeHandle(
    ref,
    () => ({
      /**
       * Copy [offset, offset + n) of sourceBuffer's origin/birth/phase into
       * this geometry's GPU-bound attributes and mark that range dirty.
       * offset + n must not exceed `capacity` — the ring-wrap split (T-06
       * outbox: a single emit() call's writes can straddle the array
       * boundary) is the caller's job (App.jsx / T-09), one call per
       * contiguous piece.
       * @param {number} offset
       * @param {number} n
       * @param {{origin: Float32Array, birth: Float32Array, phase: Float32Array, count: number}} sourceBuffer
       */
      pushRange(offset, n, sourceBuffer) {
        if (n <= 0) return;
        const posAttr = geometry.getAttribute('position');
        const birthAttr = geometry.getAttribute('aBirth');
        const phaseAttr = geometry.getAttribute('aPhase');

        posAttr.array.set(sourceBuffer.origin.subarray(offset * 3, (offset + n) * 3), offset * 3);
        birthAttr.array.set(sourceBuffer.birth.subarray(offset, offset + n), offset);
        phaseAttr.array.set(sourceBuffer.phase.subarray(offset, offset + n), offset);

        posAttr.addUpdateRange(offset * 3, n * 3);
        birthAttr.addUpdateRange(offset, n);
        phaseAttr.addUpdateRange(offset, n);
        posAttr.needsUpdate = true;
        birthAttr.needsUpdate = true;
        phaseAttr.needsUpdate = true;

        geometry.setDrawRange(0, sourceBuffer.count);
      },
      /**
       * T-14 addition — Sweep. Starts (a finite elapsedTime) or clears
       * (null) the shader-side radial wipe. Never touches the buffer.
       * @param {number | null} startElapsed
       */
      setSweep(startElapsed) {
        material.uniforms.uSweepStart.value = startElapsed ?? -1;
      },
      /** Draws nothing until the next pushRange — used when a buffer is
       *  replaced wholesale (Sweep's hard reset, DESIGN §8 row 11). */
      clear() {
        geometry.setDrawRange(0, 0);
      },
    }),
    [geometry, material]
  );

  // The only per-frame work: two uniform writes. No `new`, no array method,
  // no setState — see DESIGN §7.2 item 4 / BOARD T-08 acceptance #3-4.
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    const fovRad = (state.camera.fov * Math.PI) / 180;
    material.uniforms.uScale.value = state.size.height / (2 * Math.tan(fovRad / 2));
  });

  return <points geometry={geometry} material={material} renderOrder={1} frustumCulled={false} />;
});
