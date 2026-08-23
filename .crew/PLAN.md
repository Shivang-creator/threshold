# PLAN — Threshold

Architect run **Sun 23 Aug 2026, 18:16 IST**. Reads on top of `.crew/BRIEF.md` (Scout),
`.crew/ANALYSIS.md` + `.crew/IDEAS.md` (Strategist), `.crew/DECISIONS.md` (Gate 0/1 closed,
Gate 2 pre-approved). Board: `.crew/BOARD.md`.

**Envelope, unmoved:** 4.0 h build · 2.0 h ship. Abandon gates A/B/C from ANALYSIS §6 remain in
force. Register: **Human**. Static only — no backend, no API key, no account, no database.

---

## 0. The one-question pitch

> **What if one dragged stroke became an eightfold rangoli you could walk around?**

A kolam is drawn in rice powder on the doorstep at dawn and walked over by midday. The English
word *threshold* carries both meanings at once — a doorway, and a limit.

**Hero mechanic, as a proper noun: the Eightfold.** One cursor path; eight congruent copies,
resolved as powder that falls, settles, and stays.

---

## 1. The core design decision, and its three consequences

> **The Eightfold is a pure function from `(seed, path)` to a fixed-capacity grain buffer, and
> every grain's position at time *t* is a closed-form function of that buffer — never an
> accumulated simulation state.**

That single rule buys three things:

1. **Determinism you can see.** No integrator, no accumulated float drift, no frame-rate
   dependence. The same seed and the same path produce a **byte-identical** `Float32Array`. The
   app shows an 8-hex FNV-1a checksum of that buffer in the colophon — the **print**. Draw, note
   the print, press `R` to replay: the pattern redraws identically and the print does not change.
   This is the provable claim that replaces the kill-switch here (there is no model layer in this
   build — §4).
2. **Performance, by construction.** Because position is closed-form in *t*, the animation is a
   vertex shader reading one uniform. Steady-state per-frame CPU work is **one uniform write and
   one integer** — zero allocation, zero garbage, no physics library. That is what holds 60 fps on
   the integrated-graphics school laptop that ANALYSIS §5 names as kill-risk 1.
3. **A boundary a test can enforce.** The core is pure ESM JavaScript over numbers. It imports no
   `three`, no `react`, no DOM, no network. An import-guard test fails the build if that ever
   changes, so ~52 tests run in milliseconds in Node with no browser.

**The migration that proves the abstraction is real:** the symmetry group is *data*, produced by
`dihedral(n)`. Changing eightfold to twelvefold is `dihedral(4)` → `dihedral(6)` — one call
argument. Nothing in the renderer, the shader, the buffer layout, or the site frame is touched.
Exercised for real by `?fold=6` (T-15) and by a test that asserts `dihedral(6).length === 12`.

**And the most visible proof of the boundary:** the no-WebGL fallback (`frame/NoWebGL.jsx`)
imports **only the core** and draws the same kolam as inline SVG. If the core had a three.js
dependency, that file could not exist. Resilience and the architecture claim are the same artifact.

---

## 2. Architecture — the boundary, named file by file

**Language: plain ESM JavaScript, not TypeScript** — as already scaffolded at T-01. This is a
deliberate keep, not an oversight: it means the core runs **unmodified under `node --test` with
zero transpilation, zero test framework, and zero config**. Types are carried as JSDoc on the core's
public functions, which is enough for editor help and costs no build step. In a 4-hour envelope,
a `tsconfig` is a tax with no scoring line.

```
threshold/
  index.html              already exists — entry is /src/main.jsx
  vite.config.js          already exists — @vitejs/plugin-react, target es2020
  package.json            already exists — react 19 / r3f 9 peer conflict already resolved at T-01
  src/
    main.jsx              mounts <App/>
    core/                 ██ DETERMINISTIC CORE — imports NOTHING but its own siblings ██
      dihedral.js         the group AS DATA: dihedral(n) -> Sym[] {name, m00,m01,m10,m11, det}
      rng.js              mulberry32(seed) -> () => number   (seeded, pure, no Math.random)
      hash.js             fnv1a32(Float32Array) -> 8-hex "print"
      eightfold.js        (Pt[], Sym[]) -> Pt[]   the orbit; N points in, 8N out
      grains.js           (path, seed, opts) -> GrainBuffer; arc-length resampling, seeded jitter
      sim.js              positionAt(grain, t) -> [x,y,z]  closed-form fall + one damped bounce
      index.js            the public surface; the ONLY module render/ and frame/ may import
    render/               ██ three.js lives here and nowhere above it ██
      Scene.jsx           <Canvas>, colour management, tone mapping
      Rig.jsx             camera (raking ~35°), key light, ambient fill, optional idle drift
      Ground.jsx          the wet stone plane — shaded, not a texture download
      Grains.jsx          one <points> over a preallocated 20 000-slot BufferGeometry
      grain.vert.js       vertex shader string: reads uTime, evaluates sim.js's formula on GPU
      grain.frag.js       fragment shader string: soft round grain, warm emissive
      Post.jsx            bloom (@react-three/postprocessing)
      useDrag.js          pointer/touch -> ground-plane point via three's Raycaster
    frame/                ██ DOM only. The site frame — a design deliverable, not a wrapper ██
      TitlePlate.jsx      title in real type + one concept line
      ControlHint.jsx     one line, fades out on first movement
      Colophon.jsx        print · seed · epistemic legend · the named imperfection
      MotionToggle.jsx    reduced-motion switch (defaults from prefers-reduced-motion)
      NoWebGL.jsx         SVG fallback — imports src/core ONLY
    app/
      App.jsx             composition root; capability detection; wiring
      perf.js             rolling frame-time meter + emission-rate degrade
    styles.css
  tests/                  already exists (empty) — 52 tests, run by node's built-in test runner
    dihedral.test.js  rng.test.js  hash.test.js  eightfold.test.js
    grains.test.js    sim.test.js  boundary.test.js
```

### The boundary rule, stated so a test can check it

> No file under `src/core/` may contain an `import` from `three`, `react`, `@react-three/*`, or any
> node builtin; and no core file may reference `window`, `document`, `fetch`, `Date.now`,
> `performance`, or `Math.random`.

`tests/boundary.test.js` reads every `.js` file under `src/core/` and asserts this. It **also**
asserts the file list is non-empty and contains all seven expected module names, so the guard cannot
pass vacuously by finding nothing.

Two scripts, both added to `package.json` at T-07:

```
"test":          "node --test tests/"
"test:boundary": "node --test tests/boundary.test.js"
```

Both run in about a second, with no browser and no installed test framework — filmable as-is.

### Data flow — one direction, no cycles

```
pointerdown/move (DOM)
    │  render/useDrag.js — Raycaster onto the y=0 plane
    ▼
Pt {x, z}  in ground space           ── the ONLY thing that crosses into the core
    │
    ▼
core/grains.js
    resample the new segment at fixed arc length (0.02 units) ── speed-independent density
    jitter each sample from rng(seed)          ◄── jitter happens HERE, before the group
    apply the 8 elements of dihedral(4)        ◄── so the eight arms are EXACTLY congruent
    write into the preallocated Float32Arrays at the ring cursor
    ▼
GrainBuffer { origin:Float32Array(20000*3), birth:Float32Array(20000),
              phase:Float32Array(20000), count, cursor, print }
    │
    ▼
render/Grains.jsx
    attribute.addUpdateRange(offset, n); needsUpdate = true; drawRange.count = count
    ▼
GPU vertex shader — positionAt(origin, birth, phase, uTime)   [the same formula as core/sim.js]
```

**Why jitter goes before the group and not after:** if grains were jittered after mirroring, the
eight arms would only be *statistically* symmetric and the symmetry-invariance test would have to
be a tolerance check — a weak test. Jittering the source sample first makes the eight arms exactly
congruent, so `test_orbit_is_invariant_under_every_group_element` is an exact equality. The
guarantee and the test are the same fact.

**Why the formula is written twice** (once in `core/sim.js`, once in `render/grain.vert.js`):
because the core must not import GLSL and the GPU must not import JavaScript. This is the one
duplication in the build and it is deliberate. It is fenced by
`test_sim_matches_shader_reference_vectors` — a golden-vector test over 12 (grain, t) pairs whose
expected values are copied from the shader's algebra. If the two drift, the test fails. **Named in
the README as the known duplication, not hidden.**

---

## 3. Epistemic tags — the legend, and where each one appears

Nothing here is a measurement of the world, so the tags do light work — but two of the four are
load-bearing, because a judge could reasonably mistake this for a physics build.

| Tag | Meaning in this build | Where it is displayed |
|---|---|---|
| **Rule** | The eight symmetries are D4, the symmetry group of the square. Mathematics, not taste. | Colophon: `eightfold — D4 · Rule` |
| **Generated** | Grain jitter, settle phase, timing — all derived from `seed` by a seeded PRNG. | Colophon: `seed 4821 · Generated`, and `print 8f2a1c3d` beside it |
| **Observed** | Measured in the running browser: live grain count, and the degrade state if it fires. | Colophon: `19 208 grains · Observed` |
| **Simulated** | **The load-bearing one.** The fall and settle is a closed-form curve with one damped bounce. It is *not* a physics engine; grains do not collide with each other or with the pattern. | Colophon: `fall & settle — closed form, not physics · Simulated` |

That last line doubles as the build's **one visible imperfection** (rule 8): the honest limitation
is printed on the page rather than left for a hostile reader to find.

---

## 4. There is no model layer — and what replaces the kill-switch

This build contains **no LLM, no API, no network call at runtime.** The standard two-layer doctrine
has only its lower layer here, and the standard kill-switch beat ("verdicts byte-identical with the
model off") does not apply because there is nothing to switch off.

The equivalent provable claim, and the one pc-red-team must attack:

> **Determinism.** The same seed and the same input path produce an identical grain buffer —
> provable three ways, all cheap:
> 1. **By test.** `test_same_seed_same_path_is_byte_identical` runs `grains()` twice and compares
>    the `Float32Array`s element by element, plus their prints.
> 2. **By replay, in the browser.** Press `R`. The recorded path re-plays from *t*=0 with the same
>    seed. The pattern redraws identically and the **print in the colophon does not change.**
> 3. **By accessibility mode.** Toggling reduced motion changes only how the buffer is *rendered*
>    (grains appear already settled). The buffer function never receives a motion argument, so the
>    print is structurally guaranteed to be unchanged. Filmable in four seconds.

**Attack surface handed to pc-red-team, explicitly:** try to make two runs of the same seed+path
differ. Try to find a `three`/`react` import in `src/core/`. Try to make the print change under the
reduced-motion toggle, under a window resize, under a devicePixelRatio change, or under the
perf-degrade path. Try to exceed the 20 000-grain cap with a 60-second unbroken scribble. Try to
make the SVG fallback and the WebGL render disagree about where the pattern is.

---

## 5. Stack — every piece, and why it is here

| Piece | Why this and not the alternative | Credit used |
|---|---|---|
| **Vite + React 19, plain ESM JavaScript** | Static `dist/`, sub-second HMR, zero config for Vercel. Next.js buys nothing without a server. No TypeScript: the core then runs unmodified under `node --test`, and a `tsconfig` has no scoring line in a 4-hour envelope. Types live in JSDoc on the core's public functions. | none |
| **React Three Fiber** | design-craft §5 names it the safe fast path for a Visual-Design-weighted rubric. Declarative scene graph means the composition pass (T-11, the single biggest scoring block) is edits to props, not rewrites. | none |
| **three.js** | R3F's renderer. Used for exactly three things: the points object, the raycast onto the ground plane, and the camera. | none |
| **@react-three/postprocessing** | Bloom. The highest visual-return-per-minute item in the whole build on a near-black warm-emissive palette. Pinned, resolution-scaled, and it is the first thing pc-frontend disables if T-20 finds a frame-time problem. | none |
| **@fontsource** (self-hosted variable font) | Criterion 1 names **typography**. Self-hosted, so first paint is never blocked by fonts.googleapis.com on a school network that may block it. | none |
| **`node --test`** (built in, zero dependencies) | No vitest, no jest, no jsdom, no config file. The core is plain ESM, so node runs the tests directly. `npm test` finishes in about a second — filmable, and it makes the "the core needs no framework" claim self-evidently true rather than asserted. | none |
| **Vercel** | Static deploy, the crew's verified path, and rule 22's signed-out check is a known procedure there. | Hobby (free) |
| **GitHub, public repo** | The submission requires source code. Public from T-01, not flipped public at the end. | none |

**No Blender. No Sketchfab. No GLTF. No downloaded texture.** All geometry is generated in code —
an 8 GB M1 constraint (ANALYSIS §4) converted into the originality edge against a field where
downloaded models are explicitly permitted.

**Live credits consumed: zero, deliberately.** ANALYSIS §4 checked the whole resource list: no
sponsor requires anything, nothing in the inventory expires before 1 Sep, and a $55 pool does not
justify spending a credit that a real event will need.

**Dependency count target: ≤ 8 production dependencies.** Currently six after T-01 (`react`,
`react-dom`, `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`),
leaving room for `@fontsource` and nothing else. A judge's clean browser and a stock Vercel Vite
preset must both handle it with no configuration. **`@react-three/drei` is on probation:** if T-08
and T-11 land without needing it, pc-frontend removes it at T-22.

---

## 6. Mocked vs real — stated plainly

There is no Honesty *page* in this build (the rubric has no honesty criterion and a page would
spend judge attention that criterion 1 needs). This table lives in the **README**, and its two
sharpest lines live in the **colophon** on the page itself.

| | Status |
|---|---|
| The eightfold symmetry | **Real.** D4, computed, exact — the eight arms are congruent to floating-point equality. |
| The geometry | **Real and generated in code.** Nothing is downloaded, modelled, or imported. |
| The determinism claim | **Real.** Enforced by tests, and reproducible in the browser by anyone. |
| The rice powder | **Not granular physics.** 20 000 GPU points with a soft round sprite, positioned by a closed-form curve. Grains do not collide with each other or with the settled pattern. **Said on the page.** |
| The wet stone | **A shaded plane.** No scanned material, no photographic texture. |
| Data, backend, accounts, storage | **None exist.** Nothing is stored, nothing is sent anywhere, no analytics, no cookies. |
| Mocked data | **There is none, because there is no data.** The input is the cursor and the seed. |

---

## 7. Test plan — 52 tests, named by module

Node's built-in test runner, all under `tests/`, run by `npm test`. No test imports three.js or
React; no browser, no jsdom, no test framework, finishes in about a second.

| File | Tests | The ones that matter |
|---|---|---|
| `dihedral.test.js` | **10** | `test_d4_has_eight_distinct_elements` · `test_every_matrix_is_orthogonal` · `test_four_rotations_det_plus_one_four_reflections_det_minus_one` · `test_group_is_closed_under_composition` · `test_identity_is_present_exactly_once` · `test_dihedral_6_has_twelve_elements` (the migration proof) |
| `rng.test.js` | **6** | `test_same_seed_same_sequence` · `test_known_golden_vector_first_five_draws` · `test_all_draws_in_zero_one_over_1e5` · `test_two_instances_do_not_share_state` |
| `hash.test.js` | **4** | `test_fnv1a_golden_vector` · `test_one_changed_float_changes_the_print` · `test_print_is_eight_lowercase_hex` |
| `eightfold.test.js` | **12** | `test_n_points_in_gives_8n_out` · `test_orbit_is_invariant_under_every_group_element` (the guarantee, exact) · `test_centre_point_maps_to_itself_eight_times` · `test_empty_path_gives_empty_orbit` · `test_no_nan_for_extreme_coordinates` · `test_output_order_is_stable_across_runs` |
| `grains.test.js` | **10** | `test_same_seed_same_path_is_byte_identical` (the headline claim) · `test_arc_length_spacing_is_constant_regardless_of_sample_density` · `test_capacity_clamp_never_exceeds_20000` · `test_ring_cursor_wraps_and_does_not_corrupt_neighbours` · `test_jitter_is_applied_before_the_group_so_arms_stay_congruent` |
| `sim.test.js` | **8** | `test_position_converges_to_settle_target` · `test_evaluating_at_t_equals_two_half_steps` (frame-rate independence) · `test_one_bounce_is_damped_and_monotonic_after` · `test_sim_matches_shader_reference_vectors` (the fence on the deliberate duplication) |
| `boundary.test.js` | **2** | `test_core_imports_no_three_no_react_no_dom` · `test_guard_sees_all_seven_core_modules` (anti-vacuous) |
| **Total** | **52** | |

**Every defect found by pc-test-user or pc-red-team ships with a named regression test, named after
the bug.** The list of test names is a submission asset — but note the register conflict below.

> **Instruction for pc-scribe, because two rules collide here.** Doctrine says state the test count
> (rule 14). ANALYSIS §2 says this rubric is Human register with **zero metrics in the prose**.
> The resolution: the count and the test-name list go in the **README** and, as a bare token, in
> the Devpost **"Technologies used"** field (`node:test · 52 tests`). They do **not** appear in the
> project description. Same for the frame-rate number.

---

## 8. Performance budget, and the named technique that holds it

| Target | Technique that holds it |
|---|---|
| **60 fps on integrated graphics** | Closed-form position in a vertex shader. Steady-state per-frame CPU cost is one uniform write plus one integer. No per-frame allocation, no matrix loop, no physics library. |
| **First paint < 2 s** | Static `dist/`, no asset download, self-hosted subset font, ≤ 8 production dependencies, `build.target: es2020` (already set). First frame renders before any interaction. |
| **Hard cap: 20 000 grains** | Preallocated at startup. A ring cursor recycles the oldest slots when full, so a 10-minute scribble neither grows memory nor stalls. |
| **Degrade, don't stutter** | `app/perf.js` keeps a rolling p50 frame time. Above 20 ms for 2 s it lowers the **emission rate** (grains per unit of stroke), never the frame rate; the live grain count is displayed with the **Observed** tag. Bloom is dropped before anything else. |
| **Touch parity** | The same pointer events. No hover-only affordance anywhere. Verified at a 390 px viewport in T-20. |

---

## 9. Deploy target

- **Vercel**, project `threshold`, framework preset **Vite**, build `npm run build`, output `dist`.
- **Deployment Protection OFF and verified signed-out** (rule 22 — the Vercel SSO precedent hid a
  live site from judges once already). The check is `curl -sI` from a clean shell returning `200`
  with no `set-cookie` redirect to a Vercel login, **plus** a real incognito load. Both, every time.
- No environment variables at all. If the project has any, something has gone wrong.
- Repo **public from T-01**, at `github.com/<user>/threshold`.
- Deployed at **T-03 of 26** (12% of tasks), before any feature exists. Redeployed at T-10, and
  finally at T-19 (freeze) and T-23 (final).

---

## 10. Token budget for the run

Ceiling **500 k tokens**. Per-agent caps; an agent that hits its cap stops and reports rather than
continuing quietly.

| Agent | Cap | Notes |
|---|---|---|
| pc-architect | 60 k | this document + the board |
| pc-designer | 45 k | DESIGN.md (T-04) + the composition pass (T-11) + screenshots (T-24) |
| pc-backend | 90 k | the core and its 52 tests — three tasks, all in one language, no browser |
| pc-frontend | 150 k | the largest share: renderer, shaders, wiring, site frame, resilience, replay |
| pc-deployer | 30 k | three deploys, each with a signed-out check |
| pc-test-user | 40 k | one live N=1 walk, desktop + mobile viewport + throttled CPU |
| pc-red-team | 50 k | the determinism attack + a claim-by-claim diff of the writeup |
| pc-scribe | 45 k | description, tagline, technologies, AI disclosure, NOTES-FOR-SHIVANG |
| pc-video-director | 25 k | optional asset — see the board's ship block |
| **Total** | **535 k nominal / 500 k target** | The overrun, if it comes, comes out of T-15..T-18 being cut. |

---

## 11. The demo beats this architecture makes filmable

Ordered by what each is worth. Beats 1 and 2 are the video; the rest are one clean take each.

1. **The first millimetre.** The cursor moves two millimetres and eight arcs bloom out of it,
   symmetric before the hand has stopped. *No instruction panel is ever shown — the response is
   the tutorial.* This is the six seconds a judge screenshots (design-craft §1).
2. **The print does not change.** The colophon reads `print 8f2a1c3d`. Press `R`. The pattern
   redraws identically, grain for grain, and the print is unchanged. Determinism, visible, in four
   seconds, with no terminal on screen.
3. **The boundary, in a terminal.** `npm run test:boundary` passes; `grep -rn "three" src/core/`
   returns nothing. Two commands, seven seconds.
4. **Reduced motion, same pattern.** Toggle it. Grains appear already settled instead of falling.
   The print is unchanged — the accessibility mode cannot reach the mathematics.
5. **WebGL off, kolam still there.** Disable WebGL in the browser. The same pattern appears as
   inline SVG, drawn by the same core function. The fallback is a composed frame, not an apology.
6. **Twelvefold** *(only if T-15 survives the freeze)*. `?fold=6`. The same code, one argument,
   a twelvefold pattern. The group is data.

**Beat 1 is the screenshot frame** for the Devpost gallery: an eightfold pattern half-complete on
near-black wet stone, one arc still mid-fall, settled grains glowing warm against the dark.

---

## 12. What this plan refuses

Named here so no agent rediscovers them as good ideas mid-build: a scroll-driven intro, an audio
track, a preloader animation, a second scene, a colour picker, a gallery of saved patterns, a
share-to-social button, an "About" route, orbit controls the user can spin freely (they break the
composed frame and every screenshot), and any instruction panel whatsoever. Also refused: the five
slop categories in ANALYSIS §5.

---

**Rules cited:** 0 · 1 · 3 · 8 · 11 · 14 · 22 · 25 · 26 · 32 · 34 · 36 · 37.
**Doctrine:** deterministic core with an enforced import boundary · rules (here, the symmetry
group) as versioned data · seeded determinism, replayable · epistemic tags on anything mistakable
for real · walking skeleton deployed before features · feature-freeze line drawn at plan time with
the cut order named.
