# Threshold

*What if one dragged stroke became an eightfold rangoli you could walk around?*

A kolam is drawn in rice powder on the doorstep at dawn, every morning, and walked over by
midday. The English word *threshold* carries both meanings at once — a doorway, and a limit.

Drag once across the frame. **The Eightfold** — a dihedral-group transform — mirrors and rotates
that stroke into eight congruent copies at once, resolved as rice powder that falls, bounces
once, and settles into wet dark stone.

## The boundary

**No file under `src/core/` may import `three`, `react`, `react-dom`, `@react-three/*`, or any
`node:` builtin, and no core file may reference `window`, `document`, `fetch`, `Math.random`,
`Date.now`, or `performance`.**

That rule is enforced by `tests/boundary.test.js`, not just stated: it reads every `.js` file
under `src/core/` from disk and fails the build the moment either constraint breaks. It also
checks — the anti-vacuous half — that it actually saw all seven expected core modules, so the
guard cannot pass trivially if `src/core/` were ever renamed or emptied.

```
npm run test:boundary   # 2 tests, ~70ms, no browser, no bundler
npm test                # the full suite — 52 tests, ~150ms
```

The core is pure ESM JavaScript over numbers: `dihedral.js` (the symmetry group, as data),
`rng.js` (a seeded PRNG, `mulberry32`), `hash.js` (an FNV-1a "print" over a `Float32Array`'s raw
bytes), `eightfold.js` (the orbit — one point in, `2n` points out), `grains.js` (arc-length
resampling, seeded jitter, the ring buffer), `sim.js` (closed-form position at time *t*), and
`index.js` (the only module `render/` and `frame/` may import from inside `src/core/`).

The whole guarantee this build stands on: **the same seed and the same input path produce a
byte-identical grain buffer.** No integrator, no accumulated float drift, no frame-rate
dependence — every grain's position is a closed-form function of `t`, never an accumulated
simulation state.

### The known duplication

The fall-and-bounce formula is written twice: once in `src/core/sim.js` (for the tests and for
anything the core needs to reason about), and once in `src/render/grain.vert.js` (GLSL, for the
GPU). This is deliberate, not an oversight — the core must not import GLSL, and the GPU cannot
import JavaScript. It is fenced by `test_sim_matches_shader_reference_vectors` in
`tests/sim.test.js`: 12 golden `(grain, t) → position` triples, frozen from `sim.js` itself, that
the shader must reproduce exactly. If the two ever drift, that test fails.

## Mocked vs real

| | Status |
|---|---|
| The eightfold symmetry | **Real.** D4, computed, exact — the eight arms are congruent to floating-point equality. |
| The geometry | **Real and generated in code.** Nothing is downloaded, modelled, or imported. |
| The determinism claim | **Real.** Enforced by tests, and reproducible in the browser by anyone. |
| The rice powder | **Not granular physics.** GPU points positioned by a closed-form curve. Grains do not collide with each other or with the settled pattern. |
| The wet stone | **A shaded plane.** No scanned material, no photographic texture. |
| Data, backend, accounts, storage | **None exist.** Nothing is stored, nothing is sent anywhere, no analytics, no cookies. |
| Mocked data | **There is none, because there is no data.** The input is the cursor and the seed. |

## Tests

`node --test`, built in, zero dependencies — no vitest, no jest, no jsdom, no config file.

**52 tests passing:** `dihedral.test.js` (10) · `rng.test.js` (6) · `hash.test.js` (4) ·
`eightfold.test.js` (12) · `grains.test.js` (10) · `sim.test.js` (8) · `boundary.test.js` (2).

```
npm test
```

## Stack

Vite · React 19 · React Three Fiber · three.js · `@react-three/postprocessing` · plain ESM
JavaScript (no TypeScript — the core then runs unmodified under `node --test`). Static deploy,
no backend, no API key, no account, no database.
