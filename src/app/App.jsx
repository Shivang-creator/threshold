import { Scene } from "../render/Scene.jsx";

// T-02 stub: composition root is just the scene for now. The site frame
// (title plate, colophon, motion toggle) lands at T-12; WebGL-capability
// detection and the NoWebGL fallback land at T-13.
export function App() {
  return <Scene />;
}
