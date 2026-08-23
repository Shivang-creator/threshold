import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useDrag } from "./useDrag.js";
import { groundVertexShader } from "./ground.vert.js";
import { groundFragmentShader } from "./ground.frag.js";
import { STONE_700, STONE_900, STONE_SHEEN } from "./palette.js";
import {
  KEY_POS,
  KEY_COLOR,
  KEY_INT,
  GROUND_AMB,
  GROUND_GAIN,
  GROUND_SHEEN,
  GROUND_GLINT,
  GROUND_POOL_CORE,
  GROUND_FADE,
} from "./lightRig.js";

// The wet-stone ground — DESIGN §6.6, T-11. Replaces the T-02/T-08 stub's
// unlit meshBasicMaterial with the hand-written shader the design doc
// specifies: 2-octave GLSL value noise drives an uneven "wet film"
// roughness, a Blinn-Phong term catches the lamp's raking light, an
// analytic Fresnel term gives the cool wet sheen, and a radial vignette
// folds the edges into --stone-900. No MeshStandardMaterial, no drei
// <Environment>, no downloaded texture — every colour is imported from
// palette.js (the single hex source of truth) and every light value from
// lightRig.js (the same rig the grain shader reads, DESIGN §6.4 — there
// are no `three` light nodes anywhere in this scene).
function toLinear(hex) {
  return new THREE.Color(hex).convertSRGBToLinear();
}

export function Ground({ onDown, onMove, onUp }) {
  const dragHandlers = useDrag({ onDown, onMove, onUp });

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: groundVertexShader,
        fragmentShader: groundFragmentShader,
        uniforms: {
          uStone700: { value: toLinear(STONE_700) },
          uStone900: { value: toLinear(STONE_900) },
          uSheen: { value: toLinear(STONE_SHEEN) },
          uKeyColor: { value: toLinear(KEY_COLOR) },
          uKeyPos: { value: new THREE.Vector3(...KEY_POS) },
          uKeyInt: { value: KEY_INT },
          uAmb: { value: GROUND_AMB },
          uGain: { value: GROUND_GAIN },
          uSheenGain: { value: GROUND_SHEEN },
          uGlintGain: { value: GROUND_GLINT },
          uPoolCore: { value: GROUND_POOL_CORE },
          uFade: { value: new THREE.Vector2(...GROUND_FADE) },
        },
      }),
    []
  );

  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} material={material} {...dragHandlers}>
      <planeGeometry args={[12, 12]} />
    </mesh>
  );
}
