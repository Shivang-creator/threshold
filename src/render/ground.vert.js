// The wet-stone ground shader's vertex half — DESIGN.md §6.6. The ground is
// a flat plane (core/grains.js always writes y = 0, and the plane itself
// has no displacement), so this half is short: pass world position and
// world normal through for the fragment shader, which does all the actual
// lighting work. Same convention as grain.vert.js (T-08): modelMatrix /
// viewMatrix / projectionMatrix / normalMatrix / cameraPosition are three.js
// built-ins, not declared here.

export const groundVertexShader = /* glsl */ `
precision highp float;

varying vec3 vWorld;
varying vec3 vNormal;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorld = worldPosition.xyz;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;
