# DESIGN — Threshold

pc-designer, **Sun 23 Aug 2026, 18:0x IST**. Reads on top of `.crew/BRIEF.md`, `.crew/ANALYSIS.md`,
`.crew/IDEAS.md` (Candidate 1), `.crew/DECISIONS.md`, and `references/design-craft.md`.

**Implementer:** pc-frontend. **Budget this spec is written to:** ~2.5 h of frontend work inside the
4 h build envelope. Every number below is a value to type, not a direction to interpret.

> **PLAN.md did not exist when this was written** (pc-architect ran in parallel). This spec covers
> **one screen plus one fallback screen**, which is the entirety of the piece. If PLAN.md names any
> screen beyond `Stage` and `Still`, it is **not covered here** and must come back to pc-designer.
> **No epistemic-tag legend is specified** — Threshold makes no informational claims, so there is
> nothing to tag. If PLAN.md introduces a tag vocabulary, this file needs a 5-minute amendment.

---

## 0. The three questions, answered before anything else

**1. What are the six seconds a judge screenshots?**
The centre crossing of a stroke: eight arcs of rice powder in mid-fall converging on the origin,
the flare blooming there, the settled trail glowing warm behind each arc on near-black wet stone,
one quadrant still bare. §3 specifies it frame by frame. **§3.3 is the single most important
section of this document** — everything else exists to deliver that frame.

**2. What does the heaviest criterion name as its audience?**
Criterion 1 (Visual Design) names *"composition, color, lighting, typography, animations, overall
presentation."* Criterion 3 names *"responsiveness"*. The named protagonist is **a judge alone, on
an unknown machine, for 30–60 seconds** — plausibly a school-managed laptop with integrated
graphics or WebGL restricted (ANALYSIS §5, kill-risk 1), plausibly a phone. So: mobile is a
first-class layout, not a fallback; the WebGL-unavailable path is a **composed frame, not an error
message** (§8.12); and no performance downgrade is ever surfaced in the UI (§8.13).

**3. What is the performance budget and the named technique that holds it?**
60 fps at 40,000 settled + 6,000 in-flight grains on M1, ≥45 fps at Tier C on Intel UHD 620, held
by the **flight-pool / settled-bed split** — per-frame matrix writes are bounded by the in-flight
count, never by how much the judge has drawn. Full budget and all eight named techniques in §7.

---

## 1. Design tokens

### 1.1 Palette

All values sRGB hex. Renderer runs `THREE.ColorManagement` enabled, `outputColorSpace = SRGBColorSpace`.
Two families and exactly one accent. Nothing else enters the palette.

**Stone — near-black wet granite (cool)**

| Token | Value | Where it is used |
|---|---|---|
| `--stone-900` | `#06080A` | Page background (set inline in `index.html`), vignette floor, `Still` ground |
| `--stone-800` | `#0B0F12` | Ground-plane albedo |
| `--stone-700` | `#141A1F` | The lit face of the slab under the key (emerges from lighting, not painted) |
| `--stone-sheen` | `#2A3A44` | Cool specular tint of the wet film — the "wet" in wet stone |

**Powder — warm emissive rice flour**

| Token | Value | Where it is used |
|---|---|---|
| `--powder-core` | `#FFF3D6` | Hottest grain centres (15% of instance-colour draws) |
| `--powder-100` | `#FFE6B0` | Grain material base colour, 60% of instance-colour draws |
| `--powder-300` | `#FFC978` | 25% of instance-colour draws — the mass reading |
| `--powder-500` | `#F2A64B` | `emissive` on both grain materials; cursor point |
| `--powder-700` | `#C2691F` | Grain shadow-side falloff (from lighting, not painted) |
| `--powder-glow` | `#FF9C3D` | Bloom tint only |

**Accent — kumkum (the red powder set beside a white kolam at a doorstep). One accent, three jobs, no fourth.**

| Token | Value | The three jobs |
|---|---|---|
| `--kumkum` | `#B3242A` | (1) the rule under the title, which is also the load progress line · (2) every `:focus-visible` ring · (3) the `RELOAD` outline in the context-lost state |

**Interface**

| Token | Value | Contrast on `--stone-900` | Use |
|---|---|---|---|
| `--ink-100` | `#EFE6D6` | **16.2 : 1** (AAA) | Title, hover text |
| `--ink-60` | `#9AA3A8` | **8.1 : 1** (AAA) | Concept line, Tamil line, button labels |
| `--ink-35` | `#78838A` | **5.3 : 1** (AA all sizes) | Colophon, hint, micro-labels |
| `--hairline` | `rgba(239,230,214,0.14)` | — | Button borders at rest |
| `--hairline-hi` | `rgba(239,230,214,0.38)` | — | Button borders on hover/focus |

**Never used anywhere:** pure `#000`, pure `#FFF`, any violet/cyan tech gradient, any colour outside
the two families and the one accent.

### 1.2 Dark-mode stance — stated, not defaulted

**There is no light mode and there will not be one.** This is a scene, not a document: a doorstep
before dawn is dark, and a light variant would destroy the emissive powder, the bloom threshold, and
the entire palette thesis. `prefers-color-scheme` is deliberately **ignored**.

Required so browser chrome agrees with the page:
```css
:root { color-scheme: dark; }
```
```html
<meta name="theme-color" content="#06080A">
<body style="background:#06080A">   <!-- inline, before any CSS loads: no white flash, ever -->
```

### 1.3 Type scale

Modular, ratio 1.25, with the display size jumping outside the scale on purpose — the title is a
different order of object from the text.

| Role | Size | Face / weight | Tracking | Leading | Colour |
|---|---|---|---|---|---|
| Display (title) | `clamp(3.0rem, 7.2vw, 6.0rem)` | Instrument Serif 400 | `0.02em` | `0.92` | `--ink-100` |
| Tamil sub-line | `clamp(0.95rem, 1.5vw, 1.15rem)` | Tamil stack (§1.4) | `0.02em` | `1.4` | `--ink-60` |
| Concept line | `clamp(0.95rem, 1.35vw, 1.075rem)` | IBM Plex Sans 400 | `0` | `1.5` | `--ink-60` |
| Micro-label (hint, buttons) | `0.8125rem` | IBM Plex Sans 500 | `0.14em`, uppercase | `1` | `--ink-35` / `--ink-60` |
| Colophon | `0.75rem` | IBM Plex Sans 400 | `0.04em` | `1.4` | `--ink-35` |

**Font-scaling rule:** every type size in `rem`. **Do not** set `html { font-size: 62.5% }` — it
breaks user font scaling. Layout must survive 200% browser zoom: the overlay is `position: fixed`
with `max-width` constraints and wraps rather than clips.

### 1.4 Faces, and why these

**Display — `Instrument Serif` 400** (SIL OFL, one weight, ~14 KB woff2 Latin subset).
The reason is not taste, it is rhyme: Instrument Serif has extreme thick/thin stroke contrast —
heavy where the pen bears down, hairline where it lifts. **The whole piece is about a stroke.** The
title's letterforms carry the same event as the mechanic. A geometric sans here would be a design
that has nothing to say about its subject.
Stack: `"Instrument Serif", "Cormorant Garamond", Georgia, "Times New Roman", serif`

**Text — `IBM Plex Sans` 400 / 500** (SIL OFL, ~2 × 20 KB).
Chosen against Inter deliberately (rule 25 — Inter is the typographic default-Streamlit). Plex is
slightly mechanical, humanist, and reads cleanly at 0.75rem on a dark ground.
Stack: `"IBM Plex Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`

**Tamil — system stack, zero bytes downloaded.**
`"Noto Sans Tamil", "Tamil Sangam MN", Latha, "Nirmala UI", sans-serif` — present on macOS, iOS,
Windows and Android. No font file ships for Tamil.

**Self-hosting (required — no third-party font CDN):**
- Both Latin faces as `woff2` in `/public/fonts/`, `font-display: swap`.
- `<link rel="preload" as="font" type="font/woff2" crossorigin>` for **Instrument Serif only**
  (the title is the first thing painted; the text faces can swap).

**Tamil tofu guard (8 lines, removes the risk entirely):** on boot, measure the rendered width of
`"கோலம்"` and of `"￿￿￿￿￿"` in the same font stack on a 2D canvas. If the
widths are equal (both rendering as tofu), add `class="no-tamil"` to `<html>`; CSS then sets
`.no-tamil .tamil { display: none }`. The Tamil word is supplementary — the plate reads correctly
without it.

### 1.5 Spacing & radii

4 px base. Steps: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96`.
Overlay page margin: `32px` desktop, `20px` mobile, plus `env(safe-area-inset-*)` on all four sides.
Radii: `2px` on buttons. **No pills, no cards, no rounded panels** — the type sits directly on the scene.

### 1.6 Motion tokens

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Everything appearing |
| `--ease-in` | `cubic-bezier(0.7, 0, 0.84, 0)` | Everything dissolving |
| `--dur-fast` | `180ms` | Hover, focus |
| `--dur-mid` | `420ms` | Hint fade, button state |
| `--dur-slow` | `900ms` | Sweep, title plate entrance |

---

## 2. Copy — every string on the page, verbatim

pc-frontend writes **no** strings that are not in this table. No lorem ipsum, no placeholders, no
invented microcopy, no emoji anywhere (EmoLens precedent: ambiguity is a design bug).

| Element | Exact string |
|---|---|
| `<title>` | `Threshold — a kolam in rice powder` |
| Meta description | `One stroke falls as eight. A kolam drawn in rice powder on wet stone, generated entirely in code.` |
| Title | `Threshold` |
| Tamil sub-line | `கோலம் · a doorstep drawing` |
| Concept line | `One stroke falls as eight. Rice powder on wet stone — a kolam, the way it is drawn on the doorstep at dawn.` |
| Hint (appears only at t = 7 s with no interaction; permanent on first pointerdown) | `DRAG THE STONE` |
| Motion button, default | `MOTION` |
| Motion button, reduced | `MOTION REDUCED` |
| Sweep button | `SWEEP` |
| Colophon | `the Eightfold · every grain of this is generated in code` |
| Canvas `aria-label` | `A kolam drawing surface. Drag, or use the arrow keys, to draw. Every stroke is mirrored eight ways.` |
| Live region, after a stroke | `Eight strokes drawn.` |
| Live region, after sweep | `Stone swept.` |
| `Still` (WebGL unavailable) | `This browser could not open a 3D canvas. The drawing is here anyway.` |
| `Still` (context lost mid-session) | `The 3D canvas was interrupted.` |
| Reload button in context-lost | `RELOAD` |

**Note on "zero instructions":** the concept line *describes*, it never *instructs*. The mechanic is
taught by demonstration (§4). `DRAG THE STONE` is a **7-second rescue for the judge who does not
try**, not an onboarding step — it does not exist on load and it never returns once dismissed. The
only place a real instruction lives is the canvas `aria-label`, where assistive tech needs it.

---

## 3. The signature moment

### 3.1 The mechanic — the Eightfold

The dihedral group **D4**, order 8, applied to every emitted point `(x, z)` in the ground plane:

```
1. ( x,  z)      identity
2. (-z,  x)      rotate  90°
3. (-x, -z)      rotate 180°
4. ( z, -x)      rotate 270°
5. ( z,  x)      reflect in the  x = z  diagonal
6. (-x,  z)      reflect in the z axis
7. (-z, -x)      reflect in the  x = -z diagonal
8. ( x, -z)      reflect in the x axis
```

Pure function, no state, `sim/eightfold.js`. It is the whole product.

**Mirror exactness — decided, do not deviate.** The random scatter offset within a pinch is drawn
**once** and then transformed by all eight elements, so the eight copies are **pixel-exact mirrors**,
not eight statistically similar clouds. Reasoning: the symmetry *is* the concept, and imperfect
mirroring reads as sloppy at a glance. The organic quality comes from the irregularity of the human
stroke, which is already there for free.

### 3.2 The six seconds, frame by frame

Timestamps are from **pointerdown** of a single stroke that crosses the centre.

| t | What is on screen |
|---|---|
| **0.00** | Pointerdown. One pinch fires **before any movement** — 32 grains appear at 8 mirrored positions at y = 0.34 and begin to fall. *Eight marks exist before the hand has moved.* This is the tutorial. |
| **0.08** | The drag begins. Eight streams start. Because grains fall from y = 0.34 over ~0.43 s, there is always a **standing column of powder in the air behind the cursor** — the stroke is a falling ribbon, not a line. |
| **0.20** | First grains touch the stone, hop once (~0.09 s, restitution 0.28), and settle. The pattern begins to exist. |
| **0.55** | Steady state. Airborne grains at `emissiveIntensity 0.75`; settled at `0.35`. **The live ribbon is the brightest thing on screen and its own history is a warm ember trail behind it.** Bloom (`luminanceThreshold 0.28`) picks up the ribbon and almost none of the bed. |
| **1.60** | **The centre crossing.** All eight streams converge, cross, and diverge. Eight-times density lands in one place: **the flare.** Bloom spreads warm light onto the surrounding wet stone, which returns it as a cool-to-warm specular sheen. Single brightest frame of the whole piece. |
| **2.40** | Pointerup. Emission stops. The remaining in-flight grains complete their fall. |
| **2.95** | Last grain settles. The pattern is complete, symmetric, warm on near-black. |
| **3.0 → 4.2** | **The settle-breath.** The settled bed's `emissiveIntensity` eases `0.35 → 0.46 → 0.35` over 1.2 s. The piece exhales once. This is the "it is finished" signal, delivered without a word. |
| **always** | **the Breath** (§6.3) keeps the camera drifting ±3.5°, so the wet-stone sheen slides slowly across the settled relief. **The scene is never fully static** — a judge who stops moving still sees the frame breathe. |

### 3.3 THE SCREENSHOT FRAME — exact composition

**Captured at t = 1.68 s from the first WebGL frame** (= 0.90 s idle + 0.78 s into the Invocation,
just past the centre crossing, when bloom is at maximum because grains are still converging in air).
Deterministic and reproducible — see §4.1 and the `?still=1` freeze in §7.4.

```
16 : 9   ·   kolam centre at 58% width, 56% height   ·   disc spans ~74% of frame width

┌────────────────────────────────────────────────────────────────────────────┐
│ ····· vignette crushes all four corners to #06080A (offset .28, dark .72) ··│
│                                                                            │
│  Threshold                                                                 │
│  ▬▬▬  ← kumkum rule, 44 × 2 px                                             │
│  கோலம் · a doorstep drawing                    ╭ 8 airborne arcs ╮          │
│                                            ╭───┴──╮        ╭─────┴───╮     │
│  One stroke falls as eight.               │  #F2A64B → #FFF3D6, blooming │  │
│  Rice powder on wet stone — a kolam,       ╰──╮ ╭──╯        ╰──╮ ╭────╯     │
│  the way it is drawn on the                   ╳ ← THE FLARE ── ╳           │
│  doorstep at dawn.                         ╭──╯ ╰──╮        ╭──╯ ╰────╮     │
│                                            ╰───┬──╯        ╰─────┬───╯     │
│                                  settled relief #FFE6B0, raking key from   │
│                                  the RIGHT, far edge of every grain rimmed │
│                                  cool #4E7A94                              │
│                              ▒▒▒▒░░  ← ONE QUADRANT STILL BARE STONE       │
│                                                                            │
│  the Eightfold · every grain of this is generated in code   [MOTION][SWEEP] │
└────────────────────────────────────────────────────────────────────────────┘
        film grain over the whole frame — Noise 0.035, SOFT_LIGHT
```

Frame contents, in the order the eye reads them:

1. **The flare** at the convergence point — the brightest pixel cluster in the frame, bloom radius
   0.72 spilling warm light onto wet stone.
2. **Eight airborne arcs** — each a distinct comma-shaped column of grains between y = 0.34 and
   y = 0, `#F2A64B` core to `#FFF3D6` highlights, all blooming.
3. **The settled relief** in the lower half — `#FFE6B0` catching the raking key from the right,
   every grain's far edge rimmed cool `#4E7A94` by the pre-dawn rim light. This warm/cool split on a
   single grain is what makes 3D powder read as 3D.
4. **The title plate**, upper-left, over near-black. Real DOM type, crisp at any DPR.
5. **The vignette**, forcing the eye back to the flare.
6. **The deliberate imperfection (rule 8):** the pattern is **not finished** — one quadrant of the
   outer ring is still bare stone. In-progress reads as real; a finished mandala reads as staged.

**The three required Devpost screenshots are a design deliverable, framed now:**
- **#1 — gallery thumbnail:** the frame above, at t = 1.68 s.
- **#2:** the finished kolam after three full strokes, settled, raking light, relief legible.
- **#3:** a Sweep at ~40% — half the pattern dissolving outward in a radial wave. Proves
  interactivity in a still image, and is beautiful on its own.

---

## 4. Zero instructions — the three mechanisms, in order of who they catch

### 4.1 the Invocation — fires unprompted at t = 0.9 s

A pre-authored stroke plays itself through the exact same emitter a human drag uses. **The judge
sees the Eightfold happen within three seconds of load, without touching anything.** This is what
makes the 10-second gallery read work and it guarantees the site is never empty in a screenshot.

Control points, world XZ, interpolated as a `CatmullRomCurve3` (y = 0), total length ≈ 2.8:

```js
export const INVOCATION = [
  [-1.02,  0.62], [-0.71,  0.30], [-0.38,  0.09], [-0.06, -0.04], [ 0.24, -0.02],
  [ 0.49,  0.14], [ 0.66,  0.41], [ 0.72,  0.74], [ 0.61,  1.01],
];
```

- Starts at **t = 0.90 s** after the first WebGL frame. Duration **1.70 s** (≈1.65 world units/s).
- Emits ≈ 200 pinch steps → **6,400 grains**.
- It is **an open arc that does not close**. Incompleteness is the invitation — the judge's instinct
  is to finish it. It is also where rule 8 lives: the control points are hand-shaped and slightly
  irregular, so it looks drawn, not generated.
- **It is authored to produce the thumbnail.** Its centre crossing lands at 0.78 s into the stroke.
- **Interruptible, always.** Pointer move during playback: it completes and hands over. Pointer
  **down** during playback: it aborts within one frame and the judge's stroke takes over. It never
  fights the user, and it never replays.

### 4.2 the hover ghosts — mouse only, before the first click

While the pointer is over the stone and no drag is active, render the cursor point **plus its eight
D4 images** as faint discs (`--powder-500`, additive, opacity 0.20, radius 0.03). Move the mouse and
**eight ghost points swim across the stone in mirrored formation.**

This is the strongest teaching device in the piece: **the mechanism is demonstrated by hovering,
before any commitment.** Cost: 9 instances in one `InstancedMesh`.

### 4.3 the first pinch — touch and mouse alike

**One pinch fires on `pointerdown`, before any movement** (§3.2, t = 0.00). A tap alone produces
eight marks. On touch, where there is no hover, this is the entire tutorial and it is delivered in
under 100 ms. The emitter is arc-length driven at 0.014 world units, which is ~6–10 screen px, so
the *second* pinch fires within the first few pixels of a drag — the response is genuinely on the
first millimetre.

### 4.4 the pulli — the invitation

49 guide dots in a 7 × 7 square grid, spacing 0.44, extent ±1.32 (a square grid is itself
D4-invariant, so it belongs). Before interaction their opacity breathes `0.35 → 0.55` on a 4 s sine,
**phase-offset by distance from centre so the pulse ripples outward from the middle** — an
unmistakable "here" without a word. On first pointerdown the ripple stops and the dots settle to a
static 0.18: they have done their job and become substrate.

---

## 5. Layout

### 5.1 Screen: `Stage` — desktop / landscape ≥ 1024 px

The `<canvas>` is full-bleed and fixed at `z-index: 0`. All type is **DOM overlay** at `z-index: 1`
with `pointer-events: none`, except the two buttons which re-enable it. No 3D text anywhere.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ↑32px                                                                        │
│ ←32px                                                                        │
│  Threshold                                     ⓐ                             │
│  ▬▬▬▬▬▬                                        ⓑ                             │
│  கோலம் · a doorstep drawing                    ⓒ                             │
│                                                                              │
│  One stroke falls as eight. Rice        ⓓ                                    │
│  powder on wet stone — a kolam,                    ╭──────────╮              │
│  the way it is drawn on the                     ╭──┤  KOLAM   ├──╮           │
│  doorstep at dawn.                              │  │  DISC    │  │  ⓕ        │
│  ← max-width 31ch                               ╰──┤ r = 1.6  ├──╯           │
│                                                    ╰──────────╯              │
│                                                 centre at 58% w, 56% h       │
│                                                 spans ~74% of frame width    │
│                                                                              │
│                                                              DRAG THE STONE ⓖ│
│  the Eightfold · every grain of this   ⓗ         ⓘ [ MOTION ] [ SWEEP ] ←32px│
│                                                                       ↓32px  │
└──────────────────────────────────────────────────────────────────────────────┘
```

| | Element | Spec |
|---|---|---|
| ⓐ | Title | Display size. Top-left, `32px` inset. Enters with `opacity 0→1, translateY 8px→0` over `--dur-slow` `--ease-out`, **starting immediately on DOM paint — before WebGL initialises.** |
| ⓑ | Kumkum rule | `height 2px`, `--kumkum`, `margin-top 14px`. **This element is also the load progress bar** (§8.1): it grows `0 → title width` while the bundle loads, then contracts to `44px` over `400ms`. One element, two jobs. |
| ⓒ | Tamil sub-line | `margin-top 14px`. Hidden if `.no-tamil` (§1.4). |
| ⓓ | Concept line | `margin-top 28px`, `max-width 31ch`. **Verification step:** screenshot the live frame; if the concept line's right edge touches the kolam's outer ring, drop `max-width` to `26ch`. Do not move the plate. |
| ⓕ | Kolam disc | Projected ellipse of the drawable area. Camera offset (§6.2) puts it right-of-centre so the type block balances it. |
| ⓖ | Hint | Bottom-right, above the buttons, `margin-bottom 20px`. Fades in over `--dur-mid` at t = 7 s **only if no pointerdown has occurred.** Removed permanently on first pointerdown. |
| ⓗ | Colophon | Bottom-left, `32px` inset. Always visible. |
| ⓘ | Controls | Bottom-right, `32px` inset, `gap 12px`. |

### 5.2 Screen: `Stage` — portrait / ≤ 768 px

```
┌───────────────────────────────┐
│ ↑ 20px + safe-area            │
│  Threshold                    │  ← plate occupies the top 22% of the viewport
│  ▬▬▬▬                         │
│  கோலம் · a doorstep drawing   │
│                               │
│  One stroke falls as eight.   │  ← max-width 30ch, wraps to 3–4 lines
│  Rice powder on wet stone —   │
│  a kolam, the way it is drawn │
│  on the doorstep at dawn.     │
│                               │
│        ╭───────────────╮      │
│     ╭──┤               ├──╮   │  ← disc spans 88% of viewport width
│     │  │  KOLAM DISC   │  │   │     centre at 50% w, 58% h
│     ╰──┤               ├──╯   │
│        ╰───────────────╯      │
│                               │
│                               │
│  the Eightfold · every grain  │  ← colophon wraps to 2 lines, 0.6875rem
│  of this is generated in code │
│  ┌──────────┐ ┌──────────┐    │  ← 44px min height, 88px min width
│  │  MOTION  │ │  SWEEP   │    │     full-width row, gap 12px
│  └──────────┘ └──────────┘    │
│ ↓ 20px + env(safe-area-inset-bottom)   ← the home indicator MUST NOT overlap │
└───────────────────────────────┘
```

**Portrait-specific requirements:**
- `html, body { height: 100dvh; overflow: hidden; overscroll-behavior: none; }` — `dvh`, not `vh`,
  or mobile browser chrome clips the controls.
- `overscroll-behavior: none` is **not optional**: without it, a downward drag near the top of the
  page triggers pull-to-refresh and reloads the site mid-stroke.
- Canvas: `touch-action: none; user-select: none; -webkit-touch-callout: none;`
- All four insets add `env(safe-area-inset-*)`.
- Hint moves above the button row, centred.

---

## 6. The scene — every value pc-frontend needs

World: Y up, ground plane at y = 0, kolam centred on the origin, drawable radius 2.40, guide grid
extent ±1.32.

### 6.1 Renderer

```jsx
<Canvas
  dpr={[1, isCoarsePointer ? 1.75 : 2]}
  gl={{ antialias: false, alpha: false, stencil: false, depth: true,
        powerPreference: 'high-performance' }}
  onCreated={({ gl }) => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;   // rolls warm highlights off instead of clipping
    gl.toneMappingExposure = 1.05;
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.shadowMap.enabled = false;                    // §7, technique 4
  }}
/>
```
Antialiasing is off at the renderer because an `EffectComposer` is in front of it; DPR carries the
edge quality. `multisampling={0}` on the composer at every tier.

### 6.2 Camera

```js
fov = 32          // long lens: compresses, reads photographic. A wide fov reads "game engine".
near = 0.1, far = 40
base position = (-0.22, 2.35, 2.95)      // the -0.22 pushes the kolam right of frame centre
lookAt        = ( 0.00, 0.02, -0.10)
```
Pitch ≈ 38.5° above horizontal: high enough that the eightfold symmetry reads as a *pattern*, low
enough that grains have visible height and the fall is a vertical event on screen.

**Responsive dolly** — recompute on resize, `aspect = w / h`:
```js
const k = aspect >= 1.40 ? 1.00
        : aspect >= 1.00 ? 1.14
        : aspect >= 0.70 ? 1.42
        :                  1.62;
camera.position.set(-0.22 * k, 2.35 * k, 2.95 * k);
camera.lookAt(0, 0.02, -0.10);
if (aspect < 1.0) camera.rotateX(-0.045);   // pushes the disc down in frame, clearing the plate
```

### 6.3 Camera motion — the Breath, and pointer parallax

**No `OrbitControls`. No free camera.** The verb is drag-to-draw; a second drag verb means neither
is learned (kill-risk 4).

- **the Breath:** continuous azimuth ±3.5° and pitch ±1.2° on a 34 s sine loop about the base
  position. Amplitude is deliberately tiny — it must never fight the drawing. Its job is **proving
  the scene is 3D**: without parallax, a fixed three-quarter view of a flat pattern can be mistaken
  for a 2D illustration, which would cost the entry the whole premise of the event.
- **Pointer parallax:** the lookAt target shifts up to 0.06 world units toward the pointer, lerped
  at `0.04` per frame. Makes the scene feel alive before the first click. **Frozen to 0 while a drag
  is active** — the pattern must not slide under the finger.
- Both **off** under reduced motion.

### 6.4 Lighting rig — three lights, no shadow maps

| # | Light | Values | Job |
|---|---|---|---|
| 1 | **the lamp** — `PointLight` | pos `(1.15, 0.62, 1.05)`, color `#FFB765`, intensity `9.0`, distance `7`, decay `2`, `castShadow = false` | The key. A diya at the edge of the doorstep. Low and warm, so it rakes across grain facets — this is where all the relief comes from. `decay 2` produces a real falloff gradient across the slab. |
| 2 | **the cold** — `DirectionalLight` | pos `(-2.2, 1.4, -1.8)`, color `#4E7A94`, intensity `0.55` | Pre-dawn sky. Puts a cool rim on the far side of every grain and a cool sheen on the wet stone. **The warm/cool split on a single grain is the entire palette thesis.** |
| 3 | **the bounce** — `HemisphereLight` | sky `#1A2830`, ground `#0A0806`, intensity `0.30` | Keeps shadow sides off pure black so grain silhouettes stay legible. No separate `AmbientLight`. |

**Shadow maps are off at every tier.** This is the single largest performance decision in the build
(§7, technique 4) and it costs nothing visually, because the relief comes from octahedral facet
shading under a raking key, not from cast shadows.

### 6.5 Environment — the wet

Wet stone needs something to specular off. **Do not load an HDR.**

```jsx
<Environment frames={1} resolution={256}>
  <Lightformer intensity={2.6} color="#FFB765" position={[ 2.0, 1.1,  1.4]} scale={[3, 1.2, 1]} />
  <Lightformer intensity={1.1} color="#4E7A94" position={[-2.2, 1.8, -1.6]} scale={[4, 2.0, 1]} />
</Environment>
```
`frames={1}` renders the cubemap **once at boot and never again** — zero per-frame cost, zero bytes
downloaded, and the two lightformers mirror the two real lights so the sheen agrees with the key.

### 6.6 Materials & geometry

| Object | Geometry | Material |
|---|---|---|
| **Stone** | `PlaneGeometry(24, 24)`, `rotation-x = -π/2`, y = 0 | `MeshStandardMaterial` — `color #0B0F12`, `roughness 0.22`, `metalness 0.0`, `envMapIntensity 0.6`, `roughnessMap = <generated noise>` |
| **Grain (both pools)** | `OctahedronGeometry(1, 0)` — 8 flat facets, 8 tris | `MeshStandardMaterial` — `color #FFE6B0`, `roughness 0.85`, `metalness 0.0`, `vertexColors` via `setColorAt`. **Flight pool:** `emissive #F2A64B`, `emissiveIntensity 0.75`. **Settled bed:** same emissive, `emissiveIntensity 0.35`. Two materials, so the live stroke is hot and its trail is warm — for free. |
| **Pulli** | `IcosahedronGeometry(0.013, 1)`, 49 instances | `MeshBasicMaterial` `#3A4A52`, `transparent`, opacity animated |
| **Cursor + 8 ghosts** | `CircleGeometry(1, 24)`, `rotation-x = -π/2`, y = 0.0015, 9 instances | `MeshBasicMaterial`, `AdditiveBlending`, `depthWrite: false`, `renderOrder: 2`, `map = <64×64 radial-gradient canvas>` so there is no hard disc edge |

**Procedural roughness map (no image file).** In a `useMemo`: a 128 × 128 2D canvas, filled with
value noise (`Math.random()` smoothed by a 3×3 box blur, twice), remapped to `0.14 – 0.34`, wrapped
`RepeatWrapping`, `repeat.set(3, 3)`. ~15 lines. **This is the difference between "wet stone" and
"black plastic"** and it is the highest visual return per line in the entire build.

**Per-instance grain colour.** Once at emission, `setColorAt(i, ...)` sampling a 3-stop ramp:
`--powder-core` 15% · `--powder-100` 60% · `--powder-300` 25%. Costs one buffer, written once,
never touched again. Gives powder its non-uniform reality.

### 6.7 Grain scale and the emitter

```js
GRAIN_SCALE      = 0.0075 + Math.pow(Math.random(), 1.8) * 0.0060   // 0.0075 – 0.0135
PINCH_SPACING    = 0.014      // world units of path length between pinch steps
GRAINS_PER_PINCH = 4          // Tier A · 3 at B · 2 at C
SCATTER_RADIUS   = 0.019      // r = SCATTER_RADIUS * Math.random()  (centre-biased in 2D — powder
                              //  is denser at the middle of a pinch; do NOT use sqrt here)
DROP_HEIGHT      = 0.34
V0_Y             = -0.10
V0_XZ            = 0.055      // uniform in a disc
GRAVITY          = -3.2       // stylised: slower than real, reads as fine powder in air
RESTITUTION      = 0.28       // one hop, ~0.09 s, then settle on second contact
FRICTION         = 0.50       // lateral damping at first contact
SPIN             = 2.0 – 6.0 rad/s about a random axis, frozen on settle
MAX_PINCH_PER_FR = 24         // per-frame emission cap; leftover path length CARRIES OVER,
                              //  never dropped, so a fast drag trails slightly but never gaps
DRAW_RADIUS_MAX  = 2.40       // grains beyond this are never created
TELEPORT_LIMIT   = 0.45       // >0.45 world units in one frame = pen-up/pen-down, no interpolation
```
Fall time from 0.34 with `V0_Y = -0.10` under `g = -3.2` is **≈ 0.43 s** — fast enough that the
response reads as immediate, slow enough that the fall is a visible event. 32 grains per pinch step.

**`TELEPORT_LIMIT` is the fix for the classic bug** where the pointer leaves the window, re-enters
elsewhere, and a straight line snaps across the pattern.

**Time-step clamp, mandatory:** `dt = Math.min(delta, 1/30)` in `useFrame`. Without it, every grain
teleports the instant the judge returns to a backgrounded tab.

---

## 7. Performance budget

### 7.1 The targets — stated, not implied

| Target | Value |
|---|---|
| Frame rate, Tier A, Apple M1 | **60 fps** sustained at 40,000 settled + 6,000 in-flight |
| Frame rate, Tier C, Intel UHD 620 | **≥ 45 fps** |
| First contentful paint (typeset title plate) | **< 400 ms** |
| First WebGL frame, cold cache, 5 Mbps | **< 1.6 s** |
| Total transfer, gzipped | **< 600 KB** (three ≈170 · R3F ≈40 · postprocessing ≈90 · react+dom ≈45 · fonts ≈55 · app ≈30 → target **≈ 430 KB**) |
| Draw calls, main pass | **≤ 8** (stone · settled bed · flight pool · pulli · cursor+ghosts · env is baked) |
| Triangles | **≈ 372 k** (settled 320 k · flight 48 k · pulli 3.9 k · rest negligible) |
| Sim CPU, per frame | **≈ 1.1 ms** (6,000 in-flight × ~0.18 µs) — leaves ~15 ms for render at 60 fps |

### 7.2 The eight named techniques that hold it

1. **Flight-pool / settled-bed split.** Two `InstancedMesh`es. Grains in the air live in the flight
   pool and are integrated every frame; the instant a grain settles it is written **once** into the
   settled bed and removed from flight. Per-frame matrix writes are therefore **O(in-flight) ≤ 6,000**,
   never O(total drawn) ≤ 40,000, and the cost does not grow as the judge keeps drawing. *This is the
   technique that makes the whole piece possible.*
2. **Contiguous `updateRange` commits.** Settled slots are allocated from a monotonic cursor, so the
   dirty span is always contiguous. Set `settled.instanceMatrix.addUpdateRange(start*16, count*16)`
   plus `needsUpdate = true`, so only the newly-landed span uploads instead of the full 2.56 MB
   buffer. *If the installed three.js lacks `addUpdateRange`, fall back to full `needsUpdate` — it
   still holds 60 fps on M1; the range path is the guard for integrated graphics.*
3. **Zero-allocation typed-array simulation.** `pos`, `vel`, `quat`, `age`, `scale` in pre-allocated
   `Float32Array`s. One reused `Matrix4` / `Vector3` / `Quaternion`; `m.compose(...)` then
   `m.toArray(buf, i * 16)`. **No `new` inside `useFrame`. No `.map`/`.filter`/array literals in the
   loop. No `setState` from `useFrame`.** No GC pressure means no frame-time spikes — and a single
   50 ms GC pause is more visible to a judge than 10 fps of average loss.
4. **No shadow maps, at any tier.** Relief comes from octahedral facet shading under a raking key at
   y = 0.62 (§6.4). This removes an entire additional render of both instanced meshes every frame.
5. **Single-frame procedural environment.** `<Environment frames={1} resolution={256}>` with two
   `<Lightformer>`s (§6.5): the wet-stone specular costs one cubemap render at boot, zero per frame,
   and downloads zero bytes.
6. **Effect merging.** The `postprocessing` library compiles compatible `Effect`s into one fragment
   shader — `Vignette` + `Noise` + tone mapping become a single pass. At Tier C the whole post chain
   is bloom + one merged pass.
7. **Frame-time governor, count-first and one-way.** Rolling mean over 90 frames. Mean > **20 ms**
   (50 fps) trips a **one-way** step down (never promotes — no oscillation, nothing to tune). First
   evaluation is deferred to **t = 1.5 s** so the judge's first impression is always Tier A.
   **The governor cuts the grain count, never the frame rate.**
8. **DPR clamp.** `dpr={[1, 2]}` desktop, `[1, 1.75]` on coarse pointers — a 3× phone is never asked
   to render 3× .

### 7.3 The tiers

Coarse-pointer devices (`matchMedia('(pointer: coarse)')`) **start at Tier B** — mobile GPUs vary
wildly and thermally throttle.

| | **A** (default) | **B** | **C** |
|---|---|---|---|
| Grains per pinch | 4 | 3 | 2 |
| Settled cap | 40,000 | 24,000 | 12,000 |
| Flight pool | 6,000 | 4,000 | 2,500 |
| Bloom `levels` | 6 | 4 | 3 |
| Depth of field | on | **off** | **off** |
| Noise (film grain) | on | on | off |
| DPR ceiling | 2.0 | 1.5 | 1.0 |

### 7.4 Post-processing — exact settings

```jsx
<EffectComposer multisampling={0} disableNormalPass>
  {tier === 'A' && (
    <DepthOfField focusDistance={0.0155} focalLength={0.048} bokehScale={2.6} />
  )}
  <Bloom
    intensity={1.15}
    luminanceThreshold={0.28}      // the live ribbon blooms; the settled bed almost does not
    luminanceSmoothing={0.22}
    mipmapBlur
    radius={0.72}
    levels={LEVELS[tier]}
  />
  <Vignette offset={0.28} darkness={0.72} />
  {tier !== 'C' && !reducedMotion && (
    <Noise opacity={0.035} premultiply blendFunction={BlendFunction.SOFT_LIGHT} />
  )}
</EffectComposer>
```
The film grain at 0.035 soft-light is the cheapest single thing that stops a WebGL scene from
looking like a WebGL scene — and it is thematically exact, because the subject is powder.

**`?still=1`** — a query flag that runs the Invocation and then **freezes the simulation at
t = 1.68 s** (§3.3) and holds it indefinitely. Ten lines. It makes the highest-weighted criterion's
actual evaluation channel — the three screenshots and the gallery thumbnail — pixel-repeatable.
It is in the never-cut list.

---

## 8. State matrix

Every state below is a shipped state. None of them is a message box.

| # | State | Entry | What the judge sees |
|---|---|---|---|
| **1** | **Boot** | Page load → first WebGL frame | **No white flash, ever** — `#06080A` is inline on `<body>` before any CSS. The title plate is DOM, so **`Threshold` is typeset on screen before WebGL initialises.** The kumkum rule grows `0 → title width` as the load progresses (easing toward 90%, completing on canvas-ready), then contracts to 44 px over 400 ms. **No spinner.** Typically < 600 ms. |
| **2** | **Empty / attract** | First frame → t = 0.9 s | Wet stone, 49 pulli rippling outward from the centre, vignette, the Breath drifting. |
| **3** | **Invocation** | t = 0.9 → 2.6 s | The auto-stroke plays (§4.1). Pulli ripple pauses. Aborts on pointerdown within one frame. |
| **4** | **Idle-with-pattern** | 2.6 s → first input | The unfinished arc sits there. Hover ghosts live (mouse). Pulli ripple resumes at half amplitude. **At t = 7 s with still no interaction, `DRAG THE STONE` fades in bottom-right.** |
| **5** | **First interaction** | pointerdown | Hint removed permanently. One pinch fires immediately — 8 marks before any movement. Pulli dim to 0.18. Pointer parallax freezes. |
| **6** | **Mid-draw** | drag | Arc-length emission. Live ribbon `emissive 0.75`; settled trail `0.35`. Cursor point grows to r = 0.07, opacity 0.85. Beyond `DRAW_RADIUS_MAX = 2.40` the cursor point dims to 0.15 and emission stops — **the boundary is felt, never announced.** |
| **7** | **Settling** | pointerup → +0.6 s | Emission stops; the in-flight grains complete their fall. `pointerleave`, `pointercancel`, and window `blur` all behave exactly as pointerup. |
| **8** | **Settled** | last grain lands | The settle-breath: `emissiveIntensity 0.35 → 0.46 → 0.35` over 1.2 s. Cursor returns to r = 0.05 / 0.45. **the Breath keeps running — the scene is never fully static.** Live region announces `Eight strokes drawn.` |
| **9** | **At capacity — the Walk-Over** | settled count hits the tier cap | Each newly settled grain **evicts the oldest**: the evicted grain scales `1 → 0` over 0.6 s `--ease-in`, then its slot is reused. It reads as the earliest strokes being softly walked away — which is what happens to a real kolam by midday. **The memory limit is the concept.** No error, no message, no cap warning. |
| **10** | **Sweep** | `SWEEP` button or `Esc` | Settled grains scale to 0 over 0.9 s in a **radial wave from the centre outward**, mirroring the pulli ripple. Pulli ripple returns to 0.35–0.55. **In-flight grains complete their fall normally** — killing them mid-air reads as a bug. Button is `aria-disabled` at opacity 0.4 while the bed is empty. Live region: `Stone swept.` |
| **11** | **Reduced motion** | `prefers-reduced-motion: reduce` **or** the MOTION button (manual overrides, persisted to `localStorage["threshold.motion"]`) | See §8a below. |
| **12** | **WebGL unavailable / context lost** | probe fails, R3F error boundary, or `webglcontextlost` | See §8b below. |
| **13** | **Tier degrade** | governor steps down | **Silent. Nothing in the UI changes.** The judge is never told their machine is slow. The only visible difference is slightly sparser powder and softer bloom, which still reads as intentional. |
| **14** | **Touch** | coarse pointer | No hover ghosts (no hover exists). Cursor point appears on `touchstart`. **Only the first pointer is tracked; additional pointers are ignored** — prevents chaos and accidental pinch-zoom. |

### 8a. Reduced motion — the exact behaviour

The mechanic must survive; only the motion goes.

| | Normal | Reduced |
|---|---|---|
| the Breath | ±3.5° / 34 s | **off** — camera fixed at base |
| Pointer parallax | on | **off** |
| Pulli ripple | breathing 0.35–0.55 | **off** — static 0.42 |
| Grain fall | falls 0.43 s, hops, settles | **no fall.** Grains appear directly at their settled position with a 200 ms opacity fade-in, ordered along the stroke — so **the stroke still draws and the Eightfold is still demonstrated**, with zero vestibular motion |
| the Invocation | plays with fall | plays without fall — the mechanic is still taught |
| Settle-breath | 1.2 s pulse | **off** |
| Film grain (`Noise`) | on, 0.035 | **off** — per-frame grain flicker is a genuine photosensitivity concern, not a nitpick |
| Bloom, vignette, palette, lighting | on | **on, unchanged** — a static glow is not motion, and stripping the look would punish the user for the setting |

**Photosensitivity floor:** no full-screen flashing at any time. The brightest event in the piece
(the centre flare) is spatially local and its luminance ramp is well under 3 flashes/second.

### 8b. `Still` — the WebGL-unavailable screen

The strategist flagged school-managed laptops with restricted WebGL (ANALYSIS §5). **This is the
highest-leverage resilience item in the spec**, and it is not an error page.

**Detection, in this order:** (1) create a throwaway canvas and attempt `webgl2` then `webgl`
**before mounting `<Canvas>`**; (2) an R3F error boundary around `<Scene>`; (3) a `webglcontextlost`
listener on the live canvas.

**What ships:** `public/still.webp` — the §3.3 screenshot frame captured from the working build at
`?still=1`, max 1600 px wide, 60–90 KB. It is referenced **only inside the `Still` component**, so
the 97% of judges with working WebGL never fetch it.

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Threshold                                                       │
│  ▬▬▬▬▬▬                                                          │
│  கோலம் · a doorstep drawing        ┌────────────────────────┐    │
│                                    │                        │    │
│  One stroke falls as eight.        │   still.webp — the     │    │
│  Rice powder on wet stone —        │   §3.3 frame, the      │    │
│  a kolam, the way it is drawn      │   real thing, not a    │    │
│  on the doorstep at dawn.          │   placeholder          │    │
│                                    └────────────────────────┘    │
│  This browser could not open a 3D canvas.    ← --ink-60, 0.95rem │
│  The drawing is here anyway.                                     │
│                                                                  │
│  the Eightfold · every grain of this is generated in code        │
└──────────────────────────────────────────────────────────────────┘
```
Same `#06080A` ground, same CSS radial-gradient warm key, same vignette, same title plate, same
colophon, same type. **A judge on a locked-down laptop still sees a composed, on-message,
typographically real frame and can still score Visual Design and Creativity.**

Context lost mid-session: identical layout, copy swaps to `The 3D canvas was interrupted.`, plus a
`RELOAD` button outlined in `--kumkum`.

---

## 9. Interaction & accessibility

### 9.1 Input model

| Input | Behaviour |
|---|---|
| Mouse move (no button) | Cursor point + 8 hover ghosts follow. Pointer parallax active. |
| Mouse down / touch start | One pinch fires immediately. Hint dismissed. Parallax frozen. |
| Drag | Arc-length emission at `PINCH_SPACING`, capped at `MAX_PINCH_PER_FR` with carry-over. |
| Up / leave / cancel / window blur | All treated identically as pointerup. |
| Second+ touch point | **Ignored.** |
| Fast flick | Carry-over means no gaps; the per-frame cap means no spike. |
| Pointer teleport > 0.45 units/frame | Pen-up/pen-down. No line snaps across the pattern. |
| Beyond radius 2.40 | Emission stops, cursor point dims to 0.15. No message. |
| `Esc` | Sweep. |

### 9.2 Keyboard — the whole mechanic, operable

Focus order: `MOTION` → `SWEEP` → canvas (`tabindex="0"`, `role="application"`, `aria-label` per §2).

- **Arrow keys** move a virtual pointer at 0.045 units per press (key-repeat while held).
- **Space / Enter** toggles draw-lock: emission on/off. So a keyboard user draws exactly the same
  eightfold pattern a mouse user does.
- The emitter already accepts a world-space point, so this is ~20 lines. It is **cut-order item 1**
  if the clock bites — but `Esc` = sweep and fully focusable buttons are **never** cut.

### 9.3 Accessibility floor

- **Contrast:** every type token verified against `#06080A` in §1.1. Lowest is `--ink-35` at 5.3 : 1
  (AA at all sizes). Nothing below AA ships.
- **Focus:** `:focus-visible` → `outline: 2px solid var(--kumkum); outline-offset: 2px`.
  **`outline: none` without a replacement is banned.**
- **Tap targets:** every button `min-height: 44px; min-width: 88px`.
- **Never colour alone:** the MOTION button's state is carried by its **label text**
  (`MOTION` / `MOTION REDUCED`), not by its border colour.
- **Live region:** visually-hidden `aria-live="polite"` announcing `Eight strokes drawn.` and
  `Stone swept.`, so a screen-reader user gets confirmation the action landed.
- **Font scaling:** all `rem`; layout survives 200% zoom.
- **Reduced motion:** honoured automatically **and** manually overridable (§8a).
- **No emoji anywhere** (EmoLens precedent).

---

## 10. Component inventory & build order

```
src/
  main.jsx
  App.jsx                 — layout shell · WebGL probe · error boundary · reduced-motion context
  scene/
    Scene.jsx             — <Canvas>, camera, responsive dolly, lights, Environment
    Stone.jsx             — ground plane + generated roughness texture
    Pulli.jsx             — 49 guide dots + ripple
    Powder.jsx            — the two InstancedMesh pools; drives sim/grains each frame
    Cursor.jsx            — cursor point + 8 hover ghosts (9 instances, one mesh)
    Breath.jsx            — camera drift + pointer parallax
    Post.jsx              — EffectComposer, tier-aware
  sim/
    eightfold.js          — the D4 transform. Pure. 20 lines. The product.
    emitter.js            — arc-length pinch stepping, carry-over, teleport guard
    grains.js             — typed-array pools · integrate · bounce · settle · evict (the Walk-Over)
    invocation.js         — the authored path + playback + abort
    tiers.js              — the frame-time governor
  ui/
    TitlePlate.jsx        — title · kumkum rule (= progress bar) · Tamil line · concept line
    Controls.jsx          — MOTION · SWEEP
    Hint.jsx              — the 7-second rescue
    Colophon.jsx
    Still.jsx             — the WebGL-unavailable / context-lost frame
    LiveRegion.jsx
  styles/tokens.css       — §1 verbatim
  styles/app.css
public/
  fonts/InstrumentSerif-Regular.woff2, IBMPlexSans-Regular.woff2, IBMPlexSans-Medium.woff2
  still.webp              — captured LAST, from the working build at ?still=1
```

**Build order — the deploy-first, screenshot-safe sequence (≈160 min):**

| # | Block | min | Why here |
|---|---|---|---|
| 1 | Vite + R3F scaffold · `<Canvas>` · camera · lights · Environment · Stone + roughness map | 25 | A lit wet slab on a public URL is already a scoring frame |
| 2 | `eightfold.js` · `emitter.js` · `grains.js` · both InstancedMeshes · settle | 55 | The product. Nothing after this matters if this is not right |
| 3 | TitlePlate · Controls · Colophon · tokens.css · fonts | 20 | Criterion 1 says "typography". DOM type also becomes the boot state for free |
| 4 | Post (bloom/vignette/noise/DOF) + `tiers.js` governor | 20 | Criterion 1's cheapest 5 |
| 5 | Pulli · Cursor + hover ghosts | 15 | The zero-instruction teaching layer |
| 6 | Invocation · Hint · Sweep · `?still=1` | 20 | The 10-second gallery read |
| 7 | Reduced motion · keyboard · live region | 15 | |
| 8 | Capture `still.webp` at `?still=1`, wire `Still.jsx` | 10 | Must be last — it is a photograph of the finished build |

**Cut order if the clock bites** (strictly this order):
1. Keyboard virtual pointer (keep `Esc` = sweep and focusable buttons)
2. Depth of field
3. The bounce (grains settle on first contact, no hop)
4. Pointer parallax
5. The settle-breath

**Never cut:** the Invocation · the Eightfold · the flight/settled split · the lighting + palette
pass · the title plate · reduced motion · the `Still` fallback · `?still=1`.

---

## 11. Do not — patterns banned for this build

1. **No `OrbitControls`, no free camera, no scroll-driven camera.** One verb: drag to draw. Two drag
   verbs means neither is learned.
2. **No loading spinner.** The title plate plus the growing kumkum rule *is* the loading state.
3. **No modal, no onboarding overlay, no "click to start" gate.** A gate costs the 10-second read
   outright.
4. **No audio of any kind, no autoplay anything.** A judge with 40 tabs open must never be ambushed.
5. **No glassmorphism, no `backdrop-filter`, no floating rounded UI card.** The type sits directly on
   the scene.
6. **No emoji, anywhere.**
7. **No `outline: none`** without a replacement focus ring.
8. **No downloaded 3D models, no HDR/EXR environment file, no texture image files.** Roughness is
   canvas-generated; the environment is `<Lightformer>`s at `frames={1}`.
9. **No third-party font CDN.** Fonts are self-hosted woff2 in `/public/fonts/`.
10. **No `html { font-size: 62.5% }`. No `px` type sizes.**
11. **No per-frame allocation in the sim** — no `new Vector3`, no array literals, no
    `.map`/`.filter`/`.forEach` closures inside `useFrame`.
12. **No `setState` from `useFrame`.** All animation writes to refs and typed arrays.
13. **No purple/violet/cyan tech gradient. No `#00FF__`.** Two families, one accent, nothing else.
14. **No pure `#000` and no pure `#FFF`**, including type.
15. **No 3D text.** No `TextGeometry`, no Troika. All typography is DOM.
16. **No scroll.** The page is exactly one viewport, `overflow: hidden`.
17. **No lorem ipsum, no placeholder copy.** Every string is in §2.
18. **No "Made with React Three Fiber" badge, no tech-stack chips on the page.** The Technologies
    field on Devpost is where the stack goes.
19. **Never surface a performance downgrade** to the judge (§8.13).
20. **Never drop the frame rate to keep the grain count.** Drop the count. Always.

---

## 12. Open flags for the Crew Chief

1. **PLAN.md was not readable at write time** (parallel Phase 2). This spec covers `Stage` and
   `Still` only. Any additional screen named in PLAN.md is uncovered and must return here.
2. **No epistemic-tag legend is specified** — Threshold makes no informational claims. If PLAN.md
   introduces one, this file needs a short amendment.
3. **`still.webp` is a build-order dependency, not a design unknown.** It is a photograph of the
   finished build and cannot exist before step 8.
4. **One verification step is delegated to pc-frontend** (§5.1 ⓓ): screenshot the live desktop frame
   and confirm the concept line does not touch the kolam's outer ring; if it does, reduce its
   `max-width` from `31ch` to `26ch` and do **not** move the title plate.
