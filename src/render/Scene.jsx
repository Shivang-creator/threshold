import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Ground } from "./Ground.jsx";

// T-02 stub camera framing. The real camera rig (raking ~35°, key light,
// ambient fill, idle drift) is Rig.jsx at T-11 — deliberately not built
// here. This just points a fixed camera at the ground plane so the frame
// reads on load.
function CameraFraming() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 4.5, 6);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

export function Scene() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: 40, near: 0.1, far: 100 }}
      gl={{ antialias: true }}
    >
      <CameraFraming />
      <Ground />
    </Canvas>
  );
}
