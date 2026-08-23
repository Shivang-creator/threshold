# Board — three-d-demo / Threshold
<!-- Statuses: todo | doing | blocked | review | done | HOLD.  Edit freely; agents re-read
     this file before every task. A HOLD row is never touched. Your edits win. -->

Plan: `.crew/PLAN.md`. Every task below is written to be executed **cold** by an agent that has
never seen this repo. Acceptance criteria are checkable by a command or by a named screen state —
never by opinion. Repo root is `/Users/shivang/Projects/three-d-demo`.

**Budget: 4.00 h build (T-01 → T-18) · 2.00 h ship (T-19 → T-26).**
Must-have set (T-01 → T-14) is **3.70 h**. The remaining 0.30 h is the optional block below the
freeze line; if the must-have set overruns — the likely case — the optional block is not attempted
at all.

| id | owner | status | depends | task | note |
|----|-------|--------|---------|------|------|
| T-01 | pc-frontend | done | — | Vite + React 19 + R3F scaffold, repo, .gitignore | done by crew-chief 18:06; plain ESM JS, `node --test`, no TS |
| T-02 | pc-frontend | done | T-01 | Hello-journey stub: canvas, ground plane, camera, drag logs a point | build+dev verified in real Chrome; see outbox/T-02.md |
| T-03 | pc-deployer | todo | T-02 | **WALKING SKELETON — deploy to Vercel, verify signed-out** | 0.15 h · 3rd of 26 tasks (12%) |
| T-04 | pc-designer | todo | — | DESIGN.md: palette, light rig, type, frame layout, states, perf target | runs parallel to T-01..03, off critical path |
| T-05 | pc-backend | done | T-01 | Core A: `dihedral.js` `rng.js` `hash.js` + 20 tests | 20/20 passing; see outbox/T-05.md |
| T-06 | pc-backend | todo | T-05 | Core B: `eightfold.js` `grains.js` `sim.js` `index.js` + 30 tests | 0.35 h |
| T-07 | pc-backend | todo | T-06 | Import-guard `boundary.test.js` + npm scripts + README boundary section | 0.10 h |
| T-08 | pc-frontend | todo | T-03, T-06 | Grain renderer: 20 000-slot preallocated geometry + vertex/fragment shaders | 0.45 h |
| T-09 | pc-frontend | todo | T-08 | **SIGNATURE MOMENT — drag → core → the Eightfold on screen** | 0.35 h |
| T-10 | pc-deployer | todo | T-09 | Redeploy + 60-second smoke on the live URL | 0.10 h |
| T-11 | pc-designer + pc-frontend | todo | T-04, T-09 | Composition pass: lighting, palette, bloom, tone mapping | 0.75 h · biggest scoring block |
| T-12 | pc-frontend | todo | T-11 | Site frame: title plate, concept line, control hint, colophon, motion toggle | 0.30 h |
| T-13 | pc-frontend | todo | T-06, T-12 | Resilience: no-WebGL SVG fallback from core, reduced-motion path, loading state | 0.30 h |
| T-14 | pc-frontend | todo | T-09, T-12 | **Replay (`R`) + the print in the colophon** — the determinism beat | 0.20 h |
| — | — | — | — | **═══ FEATURE FREEZE LINE ═══** | everything below dies before anything above |
| T-15 | pc-frontend | todo | T-14 | `?fold=n` URL param exposing `dihedral(n)` | **cut 1st** |
| T-16 | pc-frontend | todo | T-14 | Settle-bounce refinement: per-grain damping variance, dust puff | **cut 2nd** |
| T-17 | pc-frontend | todo | T-11 | Depth of field | **cut 3rd** |
| T-18 | pc-frontend | todo | T-11 | Pulli guide-dot underlay | **cut 4th (survives longest)** |
| — | — | — | — | **═══ END OF OPTIONAL BLOCK — everything below is MANDATORY ═══** | T-19..T-26 outrank T-15..T-18 |
| T-19 | pc-deployer | todo | T-14 | Freeze deploy from the frozen commit + signed-out check | 0.10 h |
| T-20 | pc-test-user | todo | T-19 | N=1 judge walk of the live URL, desktop + 390 px + throttled CPU | 0.30 h · parallel with T-21 |
| T-21 | pc-red-team | todo | T-19 | Attack determinism, the boundary, the capacity clamp | 0.30 h · parallel with T-20 |
| T-22 | pc-frontend + pc-backend | todo | T-20, T-21 | Fix filed defects, each with a named regression test | 0.30 h |
| T-23 | pc-deployer | todo | T-22 | Final deploy, signed-out check, first-paint timing, repo public | 0.15 h |
| T-24 | pc-designer | todo | T-23 | 3 required screenshots + gallery thumbnail, framed deliberately | 0.25 h |
| T-25 | pc-scribe | todo | T-23, T-24 | Devpost pack: description, title/tagline, technologies, AI disclosure, NOTES | 0.45 h |
| T-26 | pc-video-director | todo | T-23 | Demo video script (video is OPTIONAL — first ship task to cut) | 0.15 h |

**No agent registers or submits on Devpost.** T-25 prepares the fields; Shivang pastes them.

---

## The feature-freeze line, decided now and not in a panic

**Above the line (T-01 → T-14) never gets cut.** If the clock forces a stop mid-way through the
must-have set, the correct action is to ship what is deployed — symmetry guarantees a screenshot-able
frame even at T-09 fidelity, which is the whole reason this idea was picked (IDEAS.md ranking).

**Below the line, the cut order is fixed:** T-15 → T-16 → T-17 → T-18. Numbered in the order they
die. This extends the cut order named in IDEAS.md (settle-bounce → depth of field → guide-dot
underlay) with the `?fold` param at the front, because it is the only one whose value is already
captured by a passing test (`test_dihedral_6_has_twelve_elements`) and therefore loses nothing when
cut.

**Every item below the line is strictly additive.** Cutting any of them removes nothing another task
depends on: T-16 refines a bounce that T-06 already ships in simple form; T-17 and T-18 are pure
render additions; T-15 is a URL parameter read.

**Cut rules that outrank the list:**
- Frame time before beauty. If T-20 reports p50 above 20 ms on a throttled profile, **bloom is
  disabled** before any optional item is attempted.
- The ship block (T-19 → T-25) outranks the entire optional block. If it is later than **T-19's
  start + 2.0 h**, T-15 → T-18 are abandoned unstarted, whatever the state of the clock.
- T-26 (video) is optional per the event rules and is the first ship task to cut.

---

# Task detail

## T-01 · pc-frontend · Scaffold — **DONE**

Completed by the crew chief at 18:06. State on disk: `package.json` (name `threshold`, type
`module`, scripts `dev`/`build`/`preview`/`test`), `vite.config.js` (`@vitejs/plugin-react`,
`build.target: es2020`), `index.html` (entry `/src/main.jsx`), empty `src/core/` and `tests/`,
`node_modules` installed. Six production deps: `react` 19, `react-dom` 19, `three` 0.185,
`@react-three/fiber` 9, `@react-three/drei` 10, `@react-three/postprocessing` 3.

**Note for every later task: this build is plain ESM JavaScript, not TypeScript**, and tests run
under node's built-in runner, not vitest. Do not introduce a `tsconfig.json`, a `.ts` file, or a
test framework dependency. See PLAN.md §2 for why.

**Acceptance (already met):** `cd /Users/shivang/Projects/three-d-demo && npm run build` exits 0.

---

## T-02 · pc-frontend · Hello-journey stub

Create `src/main.jsx`, `src/app/App.jsx`, `src/styles.css`, `src/render/Scene.jsx`,
`src/render/Rig.jsx`, `src/render/Ground.jsx`, `src/render/useDrag.js`.

- `Scene.jsx` renders an R3F `<Canvas>` filling the viewport, `dpr={[1, 2]}`, black clear colour.
- `Rig.jsx` places a perspective camera looking down at the origin at a **raking angle of about 35°
  above the horizon**, framing roughly 4 world units of ground. One directional key light, low and
  warm; one dim ambient. No `OrbitControls` — the composed frame is fixed (PLAN.md §12).
- `Ground.jsx` is a `<mesh>` with a `planeGeometry` of 12 × 12 rotated flat at `y = 0`, a plain dark
  standard material for now.
- `useDrag.js` exports a hook that attaches `pointerdown`/`pointermove`/`pointerup` to the canvas
  element, raycasts each pointer position onto the `y = 0` plane with three's `Raycaster` and a
  `THREE.Plane(new THREE.Vector3(0,1,0), 0)`, and calls an `onPoint({x, z})` callback. It must use
  pointer events (not mouse events) so touch works identically, and must call
  `setPointerCapture` on down.
- `App.jsx` wires the hook to `console.log` for now, and renders a plain `<h1>Threshold</h1>` over
  the canvas. **Real title text, never placeholder or lorem** (design-craft §8).

**Acceptance:**
1. `npm run build` exits 0.
2. `npm run dev`, open the local URL: a dark full-viewport canvas is visible with the title over it,
   and no console errors.
3. Dragging across the canvas prints a stream of `{x, z}` objects to the console whose values change
   sign as the cursor crosses the centre of the frame.

---

## T-03 · pc-deployer · Walking-skeleton deploy — **the 12% marker**

Deploy the T-02 stub. This happens **before any feature exists**, per doctrine and rule 22.

1. `git init` if needed, commit, push to a **public** GitHub repo named `threshold`.
2. Create the Vercel project from that repo. Framework preset **Vite**, build `npm run build`,
   output directory `dist`, install `npm install`. **No environment variables — the project must
   have zero.**
3. **Turn Deployment Protection OFF** (Project → Settings → Deployment Protection → Vercel
   Authentication: Disabled, Standard Protection: Disabled). This is the known trap: Vercel SSO has
   hidden a live site from judges in a previous run.
4. Record the production URL in `.crew/deliverables/URLS.md`.

**Acceptance — all four, and every one is a command or an observed state:**
1. `curl -sS -o /dev/null -w '%{http_code}\n' <prod-url>` prints `200`.
2. `curl -sS <prod-url> | grep -ci 'vercel.com/sso\|Authentication Required'` prints `0`.
3. The same URL opened in a **fresh incognito window** shows the dark canvas and the title, with no
   login wall.
4. `.crew/deliverables/URLS.md` exists and contains the production URL and the repo URL.

---

## T-04 · pc-designer · DESIGN.md — runs in parallel, blocks T-11

Write `.crew/deliverables/DESIGN.md`. This is the spec T-11 and T-12 implement; it is not a review.

Must contain, each as a concrete value an engineer can type in, not an adjective:

- **Palette:** exact hex for wet-stone base, stone highlight, grain warm core, grain rim, bloom
  tint, and the site-frame text colours. Near-black ground, one warm emissive family. State the
  contrast ratio of body text on its background (target ≥ 4.5:1).
- **Light rig:** the key light's colour, intensity, and elevation/azimuth in degrees; the fill's
  colour and intensity; tone-mapping mode and exposure value.
- **Bloom:** intensity, luminance threshold, luminance smoothing, and the resolution scale.
- **Typography:** the exact `@fontsource` package for the display face, the weight and optical size
  for the title, the fallback stack, and the sizes/letter-spacing for title, concept line, control
  hint, and colophon. Criterion 1 names typography by name — this is where it is earned.
- **Site frame layout:** where the title plate, concept line, control hint, colophon and motion
  toggle sit at 1440 px and at 390 px, with the rule for what happens in between. The composed 3D
  frame must never be occluded at either width.
- **The five states**, each specified: initial (before any drag) · drawing · settled · reduced
  motion · no-WebGL. Plus the degraded state when the perf meter fires.
- **The epistemic legend copy**, verbatim, as it will appear in the colophon (PLAN.md §3), including
  the `Simulated` line that doubles as the named imperfection.
- **The screenshot frames:** three specified compositions for T-24, each named, with the camera
  state and the pattern state to capture.
- **Performance target and the named technique that holds it** (design-craft §3) — copy from
  PLAN.md §8, do not invent a different one.

**Acceptance:**
1. `.crew/deliverables/DESIGN.md` exists.
2. `grep -cE '#[0-9a-fA-F]{6}' .crew/deliverables/DESIGN.md` returns **at least 8**.
3. The file contains a section heading for each of the five states plus the degraded state
   (`grep -c '^###' ` returns ≥ 6).
4. No word from this list appears as a *substitute* for a value: "nice", "beautiful", "some",
   "appropriate", "TBD".

---

## T-05 · pc-backend · Core A — the group, the RNG, the print

Create `src/core/dihedral.js`, `src/core/rng.js`, `src/core/hash.js` and
`tests/dihedral.test.js`, `tests/rng.test.js`, `tests/hash.test.js`.

**Hard constraint on everything under `src/core/`:** no `import` of `three`, `react`,
`@react-three/*`, or any node builtin; no reference to `window`, `document`, `fetch`, `Date.now`,
`performance`, or `Math.random`. T-07 enforces this with a test.

- `dihedral.js` exports `dihedral(n)` returning the **2n** elements of the dihedral group Dn as
  plain data objects `{ name, m00, m01, m10, m11, det }`. For `n = 4` that is 8 elements: rotations
  by 0/90/180/270 (det `+1`, names `e r90 r180 r270`) and four reflections (det `-1`, names
  `mx my md dm` for the two axis mirrors and the two diagonal mirrors). Matrices are exact integers
  for D4 — build them from exact `cos`/`sin` of multiples of 90° rounded to integers, so the D4
  matrices contain only `-1`, `0`, `1` and the symmetry test can use exact equality. Also export
  `D4 = dihedral(4)`.
- `rng.js` exports `mulberry32(seed)` returning a zero-argument function producing floats in
  `[0, 1)`. Standard mulberry32. Each call to `mulberry32` returns an independent generator with
  its own closed-over state.
- `hash.js` exports `fnv1a32(f32)` taking a `Float32Array` (or a subarray) and returning an
  **8-character lowercase hex string** — the *print*. Hash the underlying bytes via a `Uint8Array`
  view of the same buffer, so one changed float always changes the print.

**Tests — 20 total, named exactly as in PLAN.md §7 where named there.**
`dihedral.test.js` (10): eight distinct elements · every matrix orthogonal (`MᵀM = I`) · four
det `+1` and four det `-1` · closed under composition (all 64 products land back in the set) ·
identity present exactly once · every element has an inverse in the set · applying all 8 to a
generic point gives 8 distinct points · applying all 8 to the origin gives 8 copies of the origin ·
`dihedral(6)` has 12 elements · D4 matrix entries are all in `{-1, 0, 1}`.
`rng.test.js` (6): same seed same sequence · different seeds diverge within 5 draws · golden vector
for the first five draws of seed `1` · 100 000 draws all in `[0, 1)` · no `NaN` over 100 000 draws ·
two generators from the same seed do not share state.
`hash.test.js` (4): golden vector for a known `Float32Array` · one changed float changes the print ·
the print matches `/^[0-9a-f]{8}$/` · an empty array returns the FNV offset basis, not a crash.

**Acceptance:**
1. `npm test` exits 0.
2. `npm test 2>&1 | grep -E '^# pass' ` shows **20** passing.
3. `grep -rnE "from ['\"](three|react|@react-three|node:)" src/core/` returns nothing.
4. `grep -rn "Math.random\|Date.now\|performance\.\|window\.\|document\." src/core/` returns nothing.

---

## T-06 · pc-backend · Core B — the Eightfold, the grains, the settle

Create `src/core/eightfold.js`, `src/core/grains.js`, `src/core/sim.js`, `src/core/index.js` and
`tests/eightfold.test.js`, `tests/grains.test.js`, `tests/sim.test.js`. Same hard constraint as T-05.

- `eightfold.js` exports `orbit(points, syms)` — for `N` input points `{x, z}` and `2n` symmetry
  elements it returns `N × 2n` points, **grouped by input point** (point 0's whole orbit first),
  so the output order is stable and testable.
- `grains.js` exports `createBuffer(capacity = 20000)` and
  `emit(buffer, segment, seed, opts)`. `emit` must, **in this order**:
  1. resample the incoming path segment at a **fixed arc length** (`opts.spacing`, default `0.02`
     world units), carrying the leftover arc length on the buffer so consecutive calls tile
     seamlessly — density must not depend on how fast the pointer moved or how often the browser
     fired events;
  2. apply seeded jitter to each resampled sample — **before** the group, never after, so the eight
     arms stay exactly congruent (PLAN.md §2);
  3. apply `orbit(...)` with the buffer's symmetry set;
  4. write `origin` (x, y=0, z), `birth`, and `phase` into the preallocated `Float32Array`s at the
     ring cursor, wrapping when full and never exceeding `capacity`;
  5. update `buffer.count`, `buffer.cursor`, and recompute `buffer.print = fnv1a32(origin subarray
     of length count*3)`.
  The RNG is created once per buffer from `seed` and advanced — never re-seeded per call, or two
  identical paths delivered in different chunk sizes would diverge. **This is the subtlest
  correctness requirement in the build; test it.**
- `sim.js` exports `positionAt(originX, originY, originZ, birth, phase, t)` returning `[x, y, z]`:
  a closed-form fall from a spawn height, one damped bounce at the ground, and an asymptotic settle
  at `y = 0`. Closed form in `t` only — **no integrator, no state, no dependence on a previous
  call.** Also export `SPAWN_HEIGHT`, `FALL_TIME`, `BOUNCE_DAMPING` as named constants so
  `grain.vert.js` can be written against the same numbers.
- `index.js` re-exports the public surface: `dihedral`, `D4`, `mulberry32`, `fnv1a32`, `orbit`,
  `createBuffer`, `emit`, `positionAt`, and the sim constants. **`render/` and `frame/` import from
  `src/core/index.js` and from nothing else inside `core/`.**

**Tests — 30 total.**
`eightfold.test.js` (12): N in → 8N out · **`test_orbit_is_invariant_under_every_group_element`**
(applying any element of D4 to the whole orbit set returns the same set, exact equality) · centre
point maps to itself 8 times · empty path → empty orbit · single point → 8 points · no `NaN` for
coordinates at ±1e6 · output order stable across two runs · grouped-by-input ordering holds ·
orbit of a point on the x-axis has 4 distinct positions not 8 · works with `dihedral(6)` giving
12N · does not mutate its input array · returns a new array each call.
`grains.test.js` (10): **`test_same_seed_same_path_is_byte_identical`** (two independent buffers,
same seed, same path, element-by-element equality of `origin` plus equal prints) ·
**`test_arc_length_spacing_is_constant_regardless_of_sample_density`** (the same stroke delivered
as 3 chunks and as 30 chunks produces identical buffers) · **`test_capacity_clamp_never_exceeds_20000`**
(emit a 500-unit stroke; `count` is exactly 20000 and no write lands outside the array) ·
`test_ring_cursor_wraps_and_does_not_corrupt_neighbours` · `test_jitter_is_applied_before_the_group_so_arms_stay_congruent`
(the 8 arms of any one sample are exactly congruent under D4) · grain count grows linearly with
stroke length · all `y` origins are 0 · births are non-decreasing · print changes when the path
changes · print is stable when the same path is re-emitted into a fresh buffer.
`sim.test.js` (8): converges to the settle target · **`test_evaluating_at_t_equals_two_half_steps`**
(there is no state, so evaluating at `t` directly equals evaluating after any other call — the
frame-rate-independence proof) · one bounce, damped, monotonic afterwards · `y ≥ 0` for all
`t ≥ 0` · before birth the grain is at spawn height · no `NaN` for `t` up to 1e6 ·
**`test_sim_matches_shader_reference_vectors`** (12 golden `(grain, t) → position` triples that
`grain.vert.js` must reproduce — write these now; T-08 is written against them) · the exported
constants are finite numbers.

**Acceptance:**
1. `npm test` exits 0 and reports **50** passing.
2. `grep -rnE "from ['\"](three|react|@react-three|node:)" src/core/` returns nothing.
3. `node -e "import('./src/core/index.js').then(m=>console.log(Object.keys(m).length))"` prints
   a number ≥ 9 — i.e. the core is importable by bare node with no bundler.

---

## T-07 · pc-backend · The import guard and the README boundary section

Create `tests/boundary.test.js`. It reads every `.js` file under `src/core/` from disk and asserts:

- **`test_core_imports_no_three_no_react_no_dom`** — no file matches
  `/from\s+['"](three|react|react-dom|@react-three\/[^'"]+|node:[^'"]+)['"]/` and no file contains
  `window.`, `document.`, `fetch(`, `Math.random`, `Date.now`, or `performance.`.
- **`test_guard_sees_all_seven_core_modules`** — the discovered file list contains exactly
  `dihedral.js rng.js hash.js eightfold.js grains.js sim.js index.js`. **This is the anti-vacuous
  half: without it the guard passes trivially if the directory is renamed or empty.**

Add to `package.json`:
```
"test":          "node --test tests/"
"test:boundary": "node --test tests/boundary.test.js"
```

Add a `## The boundary` section to `README.md` stating the rule in one sentence, the command that
enforces it, and the total test count. Also add the **Mocked vs real** table from PLAN.md §6 and the
**known duplication** note about `sim.js` / `grain.vert.js`.

**Acceptance:**
1. `npm run test:boundary` exits 0 and reports 2 passing.
2. `npm test` exits 0 and reports **52** passing.
3. Sabotage check, run and then reverted: adding `import * as THREE from 'three'` to
   `src/core/sim.js` makes `npm run test:boundary` **exit non-zero**. Revert immediately after.
4. `README.md` contains the strings "The boundary", "Mocked vs real", and "52".

---

## T-08 · pc-frontend · The grain renderer

Create `src/render/Grains.jsx`, `src/render/grain.vert.js`, `src/render/grain.frag.js`.

- Build one `THREE.BufferGeometry` **once**, at mount, with three attributes allocated at full
  capacity 20 000: `position` (the settle target, 3 floats), `aBirth` (1 float), `aPhase`
  (1 float). Set `geometry.setDrawRange(0, 0)`.
- Render as a single `<points>` with a `THREE.ShaderMaterial`: `transparent`, `depthWrite: false`,
  additive-leaning blending per DESIGN.md, and uniforms `uTime`, `uSize`, plus the colour uniforms
  from DESIGN.md.
- `grain.vert.js` computes the grain's position from `position`, `aBirth`, `aPhase` and `uTime`
  using **the same algebra as `src/core/sim.js`**, with the constants imported from the core and
  injected into the shader string as literals (so the two cannot drift silently in their
  constants). It also sets `gl_PointSize` with the standard perspective attenuation.
- `grain.frag.js` draws a soft round grain from `gl_PointCoord` (`discard` outside the circle), with
  a warm core and a dimmer rim per DESIGN.md.
- Expose an imperative `pushRange(offset, n)` on the component (via `useImperativeHandle`) that sets
  `attribute.addUpdateRange(offset * stride, n * stride)`, `attribute.needsUpdate = true`, and
  updates the draw range. **No `new` inside `useFrame`. No array allocation inside `useFrame`.**
  The only per-frame work is `material.uniforms.uTime.value = clock.elapsedTime`.

**Acceptance:**
1. `npm run build` exits 0.
2. A temporary dev-only harness (deleted at the end of the task) that emits a fixed synthetic
   circular path into the buffer at mount shows grains falling and settling on the ground plane.
3. In Chrome DevTools → Performance, a 10-second recording while the scene is animating shows **no
   sawtooth in the JS heap** — i.e. zero steady-state allocation.
4. `grep -n "new \|\[\]\|\.map(\|\.filter(" src/render/Grains.jsx` shows no such call inside the
   `useFrame` callback body.

---

## T-09 · pc-frontend · The signature moment — drag becomes the Eightfold

Wire `useDrag` → `core.emit` → `Grains.pushRange` in `src/app/App.jsx`.

- One buffer created at mount via `createBuffer(20000)` held in a ref, with the seed read from
  `?seed=` in the URL or generated once at load from `crypto.getRandomValues` **in app code, never
  in the core**, and stored in state so the colophon can display it.
- Every `onPoint` appends to a path ref and calls `emit(buffer, newSegment, ...)`, then
  `pushRange(prevCount, buffer.count - prevCount)`. Handle the ring wrap by pushing two ranges when
  the write crosses the end of the array.
- Create `src/app/perf.js`: a rolling window of the last 120 frame deltas; if the p50 exceeds 20 ms
  for 2 continuous seconds, multiply the emission spacing by 1.5 (fewer grains per unit of stroke),
  at most three times. Expose the current grain count and the degrade level for the colophon.
- **No instruction panel is added here or ever** (PLAN.md §12). The eightfold response on the first
  millimetre of movement is the tutorial.

**Acceptance:**
1. `npm run dev`; dragging a single arc across the centre produces **eight congruent arcs** that are
   visibly symmetric about both axes and both diagonals.
2. The eight arms appear **simultaneously with the drag**, not after pointer-up.
3. Releasing and drawing a second stroke adds to the pattern without clearing the first.
4. Drawing continuously for 60 seconds does not stall, does not throw, and the grain count reported
   by `perf.js` stops at 20 000 rather than growing.
5. The same works with a finger in Chrome's device-emulation mode at 390 px.

---

## T-10 · pc-deployer · Redeploy and smoke the signature moment

Commit, push, wait for the Vercel production deploy, and re-run the four T-03 acceptance checks
against the new deployment. Then do one 60-second manual smoke: open the production URL in a fresh
incognito window on the actual machine, drag once, confirm eight arms appear.

**Acceptance:** the four T-03 checks pass against the new URL, **and** the incognito drag produces
the eightfold pattern. Update `.crew/deliverables/URLS.md` with the deployment ID.

---

## T-11 · pc-designer + pc-frontend · The composition pass

**The single largest scoring block in the build** — criterion 1 is a third of the score and this is
the cheapest 5 available (ANALYSIS §6). pc-designer directs, pc-frontend edits.

Implement every value from DESIGN.md: the wet-stone material (roughness/metalness/colour, subtle
normal variation generated in the shader — **no downloaded texture**), the key-light elevation and
colour, the ambient fill, tone mapping and exposure, the bloom parameters, the grain colours and
point size, and the camera framing.

Add a very slow idle camera drift (small amplitude, ≤ 2° of orbit, ≥ 20 s period) so the frame is
alive during the 10-second gallery read. **Disabled entirely under reduced motion.**

**Acceptance:**
1. Every numeric value in DESIGN.md's palette, light rig and bloom sections appears in the code —
   verified by pc-designer reading the diff, and by `grep` for each hex value returning a hit.
2. Side-by-side screenshots before and after are attached to `.crew/deliverables/DESIGN.md`.
3. Frame time on the dev machine stays under 16 ms with 20 000 grains settled (DevTools FPS meter).
4. The frame contains no element that DESIGN.md does not specify.

---

## T-12 · pc-frontend · The site frame

Create `src/frame/TitlePlate.jsx`, `ControlHint.jsx`, `Colophon.jsx`, `MotionToggle.jsx`, and the
DOM styling in `styles.css`. Install the `@fontsource` package named in DESIGN.md — self-hosted,
never a `fonts.googleapis.com` link (a school network may block it and it delays first paint).

This is what makes the piece **a website** rather than a bare canvas — the shape risk named in
ANALYSIS §5.

- **Title plate:** "Threshold" in the display face, plus one concept line, exactly one sentence.
- **Control hint:** one short line, fading out on the first pointer movement and not returning.
- **Colophon:** the print, the seed, the live grain count, and the four-term epistemic legend
  verbatim from DESIGN.md — including the `Simulated` line that names the limitation on the page
  (PLAN.md §3).
- **Motion toggle:** a real control, keyboard-focusable, defaulting from
  `matchMedia('(prefers-reduced-motion: reduce)')`, with its state visible without colour alone.

**Acceptance:**
1. At 1440 px and at 390 px the title, concept line, colophon and toggle are all visible without
   scrolling and none of them occludes the centre of the pattern.
2. Tab order reaches the motion toggle and it operates with the keyboard.
3. `document.fonts.check(...)` for the display face returns `true`, and the Network tab shows **no
   request to any third-party host**.
4. No placeholder or lorem text exists anywhere reachable (`grep -rin "lorem\|TODO\|placeholder"
   src/` returns nothing).

---

## T-13 · pc-frontend · Resilience — the fallback that is also the proof

Create `src/frame/NoWebGL.jsx` and the reduced-motion path.

- **`NoWebGL.jsx` imports `src/core/index.js` and nothing else.** On mount it emits a fixed,
  hard-coded demonstration path into a buffer with a fixed seed and renders the resulting points as
  inline SVG `<circle>` elements on the same dark ground, with the same title plate and colophon.
  It is a **composed frame, not an apology** — a judge on a locked-down machine still sees a kolam.
- `App.jsx` detects WebGL support once (`canvas.getContext('webgl2') || .getContext('webgl')`) and
  renders `<NoWebGL/>` instead of `<Scene/>` when absent. Also catch a lost-context event and fall
  back the same way.
- **Reduced motion:** when on, grains render at their settle target immediately — `uTime` is fixed
  past `FALL_TIME` rather than advancing — and the idle camera drift is off. **The buffer function
  never receives a motion argument**, so the print is structurally unchanged. Nothing else differs.
- Add a minimal loading state: the ground plane and the title paint before the first grain exists,
  so there is never a blank screen (design-craft §8).

**Acceptance:**
1. `grep -n "^import" src/frame/NoWebGL.jsx` shows imports only from `react` and `../core/index.js`.
2. Disabling WebGL in the browser (`chrome://flags` override, or DevTools → Rendering →
   "Disable WebGL") loads the page and shows an eightfold pattern in SVG with the site frame intact
   and no error text.
3. Toggling reduced motion **does not change the print string** in the colophon — check the exact
   8 hex characters before and after.
4. With reduced motion on, no element moves for 10 seconds after the pointer is released.

---

## T-14 · pc-frontend · Replay and the print — the determinism beat

- Keep the recorded path (the raw `{x, z}` samples) in a ref.
- Bind **`R`** (and a small, labelled control in the colophon for touch) to: create a **fresh**
  buffer with the **same seed**, re-emit the recorded path from the start, reset `uTime` to 0, and
  let the grains fall again.
- After the replay completes, the colophon's print must display **the same 8 hex characters** as
  before the replay.
- Add `?seed=` to the URL on first load (`history.replaceState`) so a judge's screenshot is
  reproducible and so pc-red-team and pc-video-director can pin a run.

**Acceptance:**
1. Draw any pattern, note the print, press `R`: the pattern redraws identically and the print string
   is character-for-character unchanged.
2. Reload with the same `?seed=` and redraw a similar path: the seed shown in the colophon matches
   the URL.
3. `npm test` still reports 52 passing (no core change was needed for this task — if one was, the
   test count rises and the README count is updated with it).

---

## T-15 · pc-frontend · `?fold=n` — **BELOW THE FREEZE LINE · cut 1st**

Read `?fold=` (integer 3–8, default 4) and pass `dihedral(n)` to the buffer. Nothing else changes —
that is the point. **Acceptance:** `?fold=6` produces a twelvefold pattern; `git diff --stat` for
this task touches at most two files and zero shader files.

## T-16 · pc-frontend · Settle-bounce refinement — **cut 2nd**

Per-grain damping variance from `aPhase`, and a brief dust puff at the bounce. Shader-only.
**Acceptance:** grains no longer bounce in visible lockstep; `npm test` still 52 passing; frame time
unchanged within 1 ms.

## T-17 · pc-frontend · Depth of field — **cut 3rd**

Add `DepthOfField` to the postprocessing chain with the values DESIGN.md specifies.
**Acceptance:** the near foreground and far background are visibly soft with the centre sharp, and
the DevTools FPS meter stays above 55 with 20 000 grains.

## T-18 · pc-frontend · Pulli guide-dot underlay — **cut 4th, survives longest**

A faint grid of pulli dots on the stone, generated in code, at low opacity, fading where grains have
settled over them. **Acceptance:** visible at rest, never brighter than the settled grains, and
absent from the no-WebGL fallback.

---

## T-19 · pc-deployer · Freeze deploy — **MANDATORY, outranks everything above it in the optional block**

Tag the frozen commit (`git tag freeze-1`), push, deploy, and re-run the four T-03 acceptance checks.
Record the exact commit SHA and URL in `.crew/deliverables/URLS.md` — T-20 and T-21 both test
**this** deployment, and every claim T-25 writes must be true of **this** SHA.

**Acceptance:** the four T-03 checks pass; `git tag --list freeze-1` prints the tag; URLS.md records
the SHA.

---

## T-20 · pc-test-user · The N=1 judge walk (parallel with T-21)

Walk the T-19 production URL in a **clean browser session** exactly as one of the three judges will:
alone, in under 60 seconds, with no instructions and no prior knowledge.

Cover, and report each explicitly: desktop at 1440 px · a 390 px mobile viewport with touch · a
**4× CPU throttle** with **6× network throttle** (the school-laptop proxy for kill-risk 1) · first
paint timing · whether the interaction is understood **within 5 seconds** of the cursor entering
the frame with no instruction read · what happens on a random click with no drag · what happens on a
very fast scribble · what happens on window resize mid-draw · reduced motion on · keyboard-only.

File `.crew/deliverables/JUDGE-REPORT.md` with a 1–5 score against each of the three published
criteria, the reasoning for each, and a defect list ordered by score impact.

**Acceptance:** the report exists, scores all three criteria with reasons, records measured first
paint and throttled frame time as numbers, and every defect has reproduction steps.

---

## T-21 · pc-red-team · Attack the guarantee (parallel with T-20)

Attack, do not review. Every item below is an attempt to make the build's own claims false. File
`.crew/deliverables/RED-TEAM.md` with, for each attack, the command or steps, the result, and a
verdict of **held** or **broke**.

1. **Determinism.** Run `emit` twice with the same seed and path from a scratch node script; diff
   the `Float32Array`s element by element and diff the prints. Then do it with the path split into
   different chunk sizes. Then with a different `spacing` leftover state.
2. **The boundary.** `grep -rnE "from ['\"](three|react|@react-three|node:)" src/core/`. Then try
   the sabotage: add a three import to a core file and confirm `npm run test:boundary` fails, then
   revert.
3. **The reduced-motion claim.** Toggle it and confirm the print is unchanged. Then resize the
   window mid-draw, change devicePixelRatio, and trigger the perf degrade — confirm the print is
   still a pure function of seed and path in every case, or report exactly which one breaks it.
4. **The capacity clamp.** Scribble unbroken for 60 seconds; confirm the grain count stops at
   20 000, memory is flat, and nothing throws.
5. **The fallback.** Disable WebGL; confirm the SVG kolam appears and that its geometry agrees with
   the WebGL render for the same seed and path.
6. **Hostile read of the repo** (engineering-craft §7): any default secret, any `setTimeout` sold as
   work, any fixture count described as live volume, any undisclosed `.claude`/`.cursor` directory,
   any stray API key, any file that contradicts the writeup.
7. **The writeup diff.** Once T-25 exists, check **every factual claim in it, line by line, against
   the code at the `freeze-1` SHA.** Any claim that is not literally true is filed as a defect
   against T-25, not softened.

**Acceptance:** `.crew/deliverables/RED-TEAM.md` exists with a held/broke verdict on all seven, and
every "broke" has a reproduction.

---

## T-22 · pc-frontend + pc-backend · Fix the defects, each with a named regression test

Triage T-20 and T-21's defect lists by score impact. Fix in that order, stopping when the time box
is spent — a defect that costs no score is not fixed.

**Every fix that touches the core ships with a regression test named after the bug** (engineering-craft
§4), e.g. `test_print_unchanged_when_perf_degrade_fires`. Update the test count in `README.md` and in
the note for pc-scribe.

**Acceptance:**
1. `npm test` exits 0; the count is ≥ 52 and matches the number written in `README.md`.
2. Every defect from T-20/T-21 is either fixed, or listed in `.crew/deliverables/KNOWN.md` with the
   reason it was not.
3. Each core fix has a test whose name describes the bug.

---

## T-23 · pc-deployer · Final deploy

Deploy the fixed build. Re-run all four T-03 acceptance checks. Measure first paint on the
production URL from a cold cache. Confirm the GitHub repo is **public** and that its default branch
contains the deployed SHA.

**Acceptance:**
1. All four T-03 checks pass.
2. First paint from a cold cache is **under 2 s** on a normal connection — record the number.
3. `curl -sS -o /dev/null -w '%{http_code}\n' https://github.com/<user>/threshold` prints `200`
   when logged out.
4. `.crew/deliverables/URLS.md` holds the final live URL, the repo URL, and the deployed SHA.

---

## T-24 · pc-designer · The three screenshots and the thumbnail

The submission requires **at least 3 screenshots**, and per ANALYSIS §1 the screenshots and the
gallery thumbnail are a real evaluation channel — second only to the live URL. Frame them
deliberately (design-craft §7); do not take them casually at the end.

Capture from the **production URL**, at a fixed window size, using the three named compositions in
DESIGN.md. The hero must be the signature frame from PLAN.md §11: an eightfold pattern half-complete
on near-black wet stone, one arc still mid-fall, settled grains glowing warm against the dark.

Also produce the gallery thumbnail, which must read at small size and must show the eightfold shape
recognisably — a judge forms the Creativity verdict from this before reading anything.

**Acceptance:**
1. Four image files exist in `.crew/deliverables/screenshots/`.
2. Each is at least 1200 px wide, and the thumbnail is legible when scaled to 240 px.
3. None contains DevTools, a browser URL bar with a localhost address, a cursor artifact, or an
   empty canvas.
4. At least one shows a grain mid-fall.

---

## T-25 · pc-scribe · The submission pack

Write `.crew/deliverables/SUBMISSION.md` and `.crew/deliverables/NOTES-FOR-SHIVANG.md`.

**Register is HUMAN** (ANALYSIS §2). The description is not a writeup — it is the caption under the
screenshot. Artist's statement, not engineering report. Its only job is to make a judge click the
live link and then remember the project an hour later.

- **Zero metrics in the prose.** No frame rate, no test count, no line count, no timings.
- The performance number and the test count go **only** in the **Technologies used** field, as bare
  tokens: `React Three Fiber · three.js · Vite · Vercel · node:test · 52 tests · 60 fps`.
- Title and tagline: three options each, with a one-line reason for the recommended one. The tagline
  is read before anything else in the gallery.
- Description: the kolam, the double meaning of *threshold*, the one question, and what the visitor
  does. Name the hero mechanic as a proper noun — **the Eightfold** (rule 11).
- **AI-tool disclosure by name, per contribution** (rule 37) — the event permits AI tools explicitly,
  so disclosure costs nothing and non-disclosure has cost a placement before.
- The submission-field checklist: live URL, description, ≥ 3 screenshots, technologies, source code
  link, video (optional).
- `NOTES-FOR-SHIVANG.md`: what to paste where, in order, with the exact strings; the abandon gates
  from ANALYSIS §6 restated; and the reminder that **no agent registers or submits**.

**Acceptance:**
1. Both files exist.
2. `grep -cE '[0-9]+ *(fps|tests|ms|%)' ` over the **description section only** returns `0`.
3. The Technologies field contains the test count and the frame rate.
4. Every factual claim in the description is verified against the `freeze-1` SHA by T-21 item 7.
5. AI tools are named individually with what each did.

---

## T-26 · pc-video-director · Demo video script — **OPTIONAL, first ship task to cut**

The video is explicitly optional for this event and the judge-to-field ratio makes it largely
unwatched (ANALYSIS §1). Write the script only if the ship block is comfortably inside its 2 hours.

If written: 60–90 seconds, shot by shot, with timings and spoken lines, built from the demo beats in
PLAN.md §11 in this order — **the first millimetre** (the six seconds that sell it), **the print does
not change**, **reduced motion, same pattern**, **WebGL off, kolam still there**. The terminal beat
(`npm run test:boundary`) goes last or not at all: this rubric has no technical criterion.

**Acceptance:** `.crew/deliverables/VIDEO.md` exists with per-shot timings summing to ≤ 90 s, and
every beat is reproducible on the live URL at the `freeze-1` SHA.
