import { useDrag } from "./useDrag.js";

// T-02 stub ground plane: an unlit dark plane so it is visible with no
// light rig (the light rig is T-11's job, deliberately not built here).
// The wet-stone material, normal variation and colour land at T-11 too.
export function Ground() {
  const dragHandlers = useDrag((point) => {
    // eslint-disable-next-line no-console
    console.log("[drag] ground point", point);
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} {...dragHandlers}>
      <planeGeometry args={[12, 12]} />
      <meshBasicMaterial color="#141414" />
    </mesh>
  );
}
