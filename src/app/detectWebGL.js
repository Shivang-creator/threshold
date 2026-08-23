// DESIGN §8b, detection order item 1: probe webgl2 then webgl on a
// throwaway canvas before ever mounting <Canvas>. This runs synchronously
// at App's first render (via useState's lazy initializer), so a browser
// with no WebGL never mounts Scene.jsx at all.
export function probeWebGL() {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}
