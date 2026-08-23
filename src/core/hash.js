// The print. A cheap, order-sensitive checksum over the raw bytes of a
// grain buffer's origin array, so that "same seed, same path, same output"
// becomes a claim anyone can check by eye against an 8-hex string.

const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

/**
 * FNV-1a, 32-bit, over the raw bytes of a Float32Array (or a subarray of
 * one). Returns an 8-character lowercase hex string — the "print". Hashing
 * the byte view rather than the float values means a single changed float
 * always changes the print, down to a single bit.
 * @param {Float32Array} f32
 * @returns {string}
 */
export function fnv1a32(f32) {
  const bytes = new Uint8Array(f32.buffer, f32.byteOffset, f32.byteLength);
  let hash = FNV_OFFSET_BASIS;
  for (let i = 0; i < bytes.length; i++) {
    hash ^= bytes[i];
    hash = Math.imul(hash, FNV_PRIME);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
