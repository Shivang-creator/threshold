// Format a JS number as a GLSL ES float literal — always with a decimal
// point, since `5` alone parses as an int in GLSL ES and mixing int/float
// in an expression is a compile error on some drivers. Used to inject
// core/sim.js's constants into grain.vert.js as literals (see that file's
// header comment for why this duplication exists and how it stays fenced).
export function glslFloat(n) {
  if (!Number.isFinite(n)) throw new Error(`glslFloat: not finite: ${n}`);
  return Number.isInteger(n) ? `${n.toFixed(1)}` : `${n}`;
}
