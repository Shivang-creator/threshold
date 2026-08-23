# DESIGN — Threshold

pc-designer, **Sun 23 Aug 2026, 18:2x IST**. Reads on top of `.crew/BRIEF.md`, `.crew/ANALYSIS.md`,
`.crew/IDEAS.md` (Candidate 1), `.crew/DECISIONS.md`, `.crew/PLAN.md` + `.crew/BOARD.md`
(pc-architect, 18:16), and `references/design-craft.md`.

**Implementer:** pc-frontend (T-11, T-12, T-13, T-14) with pc-backend owning the attributes named in
§6.7. **Written to:** ~2.5 h of frontend work inside the 4 h envelope.

> **Reconciled against PLAN.md.** PLAN.md was written in parallel and it changed the substrate: the
> renderer is **one `<points>` object over a 20,000-slot preallocated buffer, positioned by a
> closed-form vertex shader**, not the instanced-mesh CPU simulation I had first specced. **The
> architect's substrate wins** — it is faster, cheaper to build, and it is the foundation of the
> determinism claim. This document is written entirely on top of it. Every place I overrode or
> extended PLAN.md is listed in **§12**, with costs. **§12 is for the Crew Chief, not pc-frontend.**

**Screens covered:** `Stage` (the whole piece) and `NoWebGL` (the fallback). Those are the only two
screens PLAN.md names. **Nothing in PLAN.md's task list is unspecced here.**

---

## 0. The three questions, answered before anything else

**1. What are the six seconds a judge screenshots?**
The centre crossing of a stroke: eight arcs of rice powder in mid-fall converging on the origin, the
flare blooming there, the settled trail glowing warm behind each arc on near-black wet stone, one
quadrant still bare. **§3.3 specifies that frame exactly and is the most important section here.**

**2. What does the heaviest criterion name as its audience?**
Criterion 1 names *"composition, color, lighting, typography, animations, overall presentation."*
Criterion 3 names *"responsiveness."* The protagonist is **a judge alone, on an unknown machine, for
30–60 seconds** — plausibly a school laptop with integrated graphics or WebGL restricted (ANALYSIS
§5, kill-risk 1), plausibly a phone. Consequences that bind this whole spec: mobile is a first-class
layout; **`NoWebGL` is a composed frame, never an error page** (§8b); every desktop-key beat has a
touch equivalent (§9.1); and no performance downgrade is ever announced in warning language (§8.13).

**3. What is the performance budget and the named technique that holds it?**
60 fps on integrated graphics at the full 20,000-grain cap, held by **closed-form position in a
vertex shader** — steady-state per-frame CPU cost is three uniform writes and one integer, and it
does not grow as the judge keeps drawing. Full budget and all seven named techniques in §7.

---

## 1. Design tokens

### 1.1 Palette

sRGB hex. `THREE.ColorManagement` enabled, `outputColorSpace = SRGBColorSpace`. Because both the
ground and the grains are custom shaders (§6.4), **most of these values arrive as `uniform vec3`s,
converted once with `new THREE.Color(hex).convertSRGBToLinear()`.** Two families, one accent,
nothing else enters the palette.

**Stone — near-black wet granite (cool)**

| Token | Value | Where |
|---|---|---|
| `--stone-900` | `#06080A` | Page background (inline on `<body>`), vignette floor, `NoWebGL` ground |
| `--stone-800` | `#0B0F12` | Ground shader base albedo (`uStone`) |
| `--stone-700` | `#141A1F` | The lit face near the lamp — emerges from the falloff term, never painted |
| `--stone-sheen` | `#2A3A44` | Fresnel sheen of the wet film (`uSheen`) — this is the "wet" in wet stone |

**Powder — warm emissive rice flour**

| Token | Value | Where |
|---|---|---|
| `--powder-core` | `#FFF3D6` | Tint ramp stop 0 — hottest grains |
| `--powder-100` | `#FFE6B0` | Tint ramp stop 1 — grain base, the mass reading |
| `--powder-300` | `#FFC978` | Tint ramp stop 2 |
| `--powder-500` | `#F2A64B` | `uEmissive` on grains; the cursor point |
| `--powder-700` | `#C2691F` | Grain shadow-side floor in the fragment shader |
| `--lamp` | `#FFB765` | The key light colour (`uKeyColor`) |
| `--predawn` | `#4E7A94` | The rim light colour (`uRimColor`) — the cool half of the thesis |

**Accent — kumkum** (the red powder set beside a white kolam at a doorstep).
**One accent, three jobs, no fourth.**

| Token | Value | The three jobs |
|---|---|---|
| `--kumkum` | `#B3242A` | (1) the rule under the title, which is also the load progress bar · (2) every `:focus-visible` ring · (3) the `RELOAD` outline in the context-lost state |

**Interface**

| Token | Value | Contrast on `#06080A` | Use |
|---|---|---|---|
| `--ink-100` | `#EFE6D6` | **16.2 : 1** AAA | Title, hover text, active button label |
| `--ink-60` | `#9AA3A8` | **8.1 : 1** AAA | Concept line, Tamil line, button labels, `NoWebGL` copy |
| `--ink-35` | `#78838A` | **5.3 : 1** AA all sizes | Colophon, epistemic tags, hint, micro-labels |
| `--hairline` | `rgba(239,230,214,0.14)` | — | Button borders at rest, colophon tag rule |
| `--hairline-hi` | `rgba(239,230,214,0.38)` | — | Button borders on hover/focus |

**Never used, anywhere:** pure `#000`, pure `#FFF`, any violet/cyan tech gradient, anything outside
the two families and the one accent.

### 1.2 Dark-mode stance — stated, not defaulted

**There is no light mode and there will not be one.** This is a scene, not a document: a doorstep
before dawn is dark, and a light variant would destroy the emissive powder, the bloom threshold, and
the entire palette thesis. `prefers-color-scheme` is deliberately **ignored**.

```css
:root { color-scheme: dark; }
```
```html
<meta name="theme-color" content="#06080A">
<body style="background:#06080A">   <!-- inline, before any CSS parses: no white flash, ever -->
```

### 1.3 Type scale

Modular ratio 1.25; the display size jumps outside the scale on purpose — the title is a different
order of object from the text.

| Role | Size | Face / weight | Tracking | Leading | Colour |
|---|---|---|---|---|---|
| Display (title) | `clamp(3.0rem, 7.2vw, 6.0rem)` | Instrument Serif 400 | `0.02em` | `0.92` | `--ink-100` |
| Tamil sub-line | `clamp(0.95rem, 1.5vw, 1.15rem)` | Tamil stack (§1.4) | `0.02em` | `1.4` | `--ink-60` |
| Concept line | `clamp(0.95rem, 1.35vw, 1.075rem)` | IBM Plex Sans 400 | `0` | `1.5` | `--ink-60` |
| Micro-label (buttons, hint, `R TO REPLAY`) | `0.8125rem` | IBM Plex Sans 500 | `0.14em`, uppercase | `1` | `--ink-35` / `--ink-60` |
| Colophon fact | `0.75rem` | IBM Plex Sans 400 | `0.04em` | `1.55` | `--ink-35` |
| Epistemic tag | `0.6875rem` | IBM Plex Sans 500 | `0.16em`, uppercase | `1.55` | `--ink-35` |
| Print value (`8f2a1c3d`) | `0.75rem` | `ui-monospace, "SFMono-Regular", Menlo, monospace` | `0.02em` | `1.55` | `--ink-60` |

**Font-scaling rule:** every size in `rem`. **Do not** set `html { font-size: 62.5% }` — it breaks
user font scaling. Layout must survive 200% browser zoom: the overlay is `position: fixed` with
`max-width` constraints and wraps rather than clips.

### 1.4 Faces, and why these

**Display — Instrument Serif 400.** Not taste, rhyme: Instrument Serif has extreme thick/thin stroke
contrast — heavy where the pen bears down, hairline where it lifts. **The whole piece is about a
stroke.** The letterforms carry the same event as the mechanic. A geometric sans here would be a
design with nothing to say about its subject.
Stack: `"Instrument Serif", "Cormorant Garamond", Georgia, "Times New Roman", serif`

**Text — IBM Plex Sans 400 / 500.** Chosen against Inter deliberately (rule 25 — Inter is the
typographic default-Streamlit). Plex is slightly mechanical, humanist, and holds at 0.6875rem on a
dark ground, which the epistemic tags need.
Stack: `"IBM Plex Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`

**Tamil — system stack, zero bytes downloaded.**
`"Noto Sans Tamil", "Tamil Sangam MN", Latha, "Nirmala UI", sans-serif` — present on macOS, iOS,
Windows, Android. No font file ships for Tamil.

**Packaging (PLAN.md §5 requires `@fontsource`, self-hosted, and ≤ 8 production deps):**
- `@fontsource/instrument-serif` and `@fontsource/ibm-plex-sans` (weights 400 + 500 only).
  That is **6 + 2 = 8 deps exactly**, and drops to 7 when drei is removed at T-22 (§7.2, note 6).
- Import only the weights used. **No `fonts.googleapis.com` link, ever** — a school network may
  block it and the title is the first paint.
- If either package fails to resolve inside 5 minutes: **fall back to the system stacks above and
  move on.** Do not stall the build on a font, and do not substitute a CDN link.

**Tamil tofu guard** (8 lines, removes the risk entirely): at boot, measure the rendered width of
`"கோலம்"` and of a private-use string in the same stack on a 2D canvas. Equal widths mean both
rendered as tofu → add `class="no-tamil"` to `<html>`; CSS sets `.no-tamil .tamil{display:none}`.
The Tamil word is supplementary and the plate reads correctly without it.

### 1.5 Spacing, radii, motion

4 px base: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96`.
Page margin `32px` desktop / `20px` mobile, plus `env(safe-area-inset-*)` on all four sides.
Radii `2px` on buttons. **No pills, no cards, no rounded panels** — type sits directly on the scene.

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Everything appearing |
| `--ease-in` | `cubic-bezier(0.7, 0, 0.84, 0)` | Everything dissolving |
| `--dur-fast` | `180ms` | Hover, focus |
| `--dur-mid` | `420ms` | Hint fade, button state, the print flicker |
| `--dur-slow` | `900ms` | Sweep, title-plate entrance |

---

## 2. Copy — every string on the page, verbatim

pc-frontend writes **no** string that is not in this table. No lorem ipsum, no placeholders, no
invented microcopy, **no emoji anywhere** (EmoLens precedent: ambiguity is a design bug).

| Element | Exact string |
|---|---|
| `<title>` | `Threshold — a kolam in rice powder` |
| Meta description | `One stroke falls as eight. A kolam drawn in rice powder on wet stone, generated entirely in code.` |
| Title | `Threshold` |
| Tamil sub-line | `கோலம் · a doorstep drawing` |
| Concept line | `One stroke falls as eight. Rice powder on wet stone — a kolam, the way it is drawn on the doorstep at dawn.` |
| Hint (t = 7 s, only if untouched; permanent on first pointerdown) | `DRAG THE STONE` |
| Replay hint (appears beside the print after the first stroke settles) | `R TO REPLAY` — coarse pointers: `REPLAY` |
| Motion button, default | `MOTION` |
| Motion button, reduced | `MOTION REDUCED` |
| Sweep button | `SWEEP` |
| Colophon line 1 | `eightfold — D4` · tag `RULE` |
| Colophon line 2 | `seed 4821 · print 8f2a1c3d` · tag `GENERATED` (values live) |
| Colophon line 3 | `19 208 grains` · tag `OBSERVED` (value live, space-grouped thousands) |
| Colophon line 4 | `fall & settle — closed form, not physics` · tag `SIMULATED` |
| Canvas `aria-label` | `A kolam drawing surface. Drag, or use the arrow keys, to draw. Every stroke is mirrored eight ways.` |
| Live region, stroke settled | `Eight strokes drawn.` |
| Live region, replay | `Replayed. The print is unchanged.` |
| Live region, sweep | `Stone swept.` |
| `NoWebGL` line | `This browser could not open a 3D canvas. The drawing is here anyway.` |
| Context lost | `The 3D canvas was interrupted.` |
| Reload button | `RELOAD` |

**On "zero instructions":** the concept line *describes*, it never *instructs*. The mechanic is
taught by demonstration (§4). `DRAG THE STONE` is a **7-second rescue for the judge who does not
try** — it does not exist on load and never returns once dismissed. `R TO REPLAY` is a keycap label
attached to the thing it affects, appearing only after the judge has produced a print worth
replaying — not an onboarding step. The only real instruction lives in the canvas `aria-label`,
where assistive tech needs it. **There is no instruction panel. PLAN.md §12 refuses one; so does this.**

---

## 3. The signature moment

### 3.1 The mechanic — the Eightfold

D4, order 8, applied in `core/eightfold.js` to every resampled path point `(x, z)`:

```
1. ( x,  z)   identity          5. ( z,  x)   reflect in x = z
2. (-z,  x)   rotate  90°       6. (-x,  z)   reflect in the z axis
3. (-x, -z)   rotate 180°       7. (-z, -x)   reflect in x = -z
4. ( z, -x)   rotate 270°       8. ( x, -z)   reflect in the x axis
```

**Mirror exactness is a design requirement, and PLAN.md §2 already builds it correctly:** jitter is
applied to the source sample **before** the group, so the eight arms are congruent to floating-point
equality rather than merely statistically similar. Do not move the jitter after the group to "make it
organic." The symmetry *is* the concept, and imperfect mirroring reads as sloppy at a glance; the
organic quality comes from the irregularity of the human stroke, which is already free.

### 3.2 The six seconds, frame by frame

Timestamps from **pointerdown** of one stroke crossing the centre.

| t | What is on screen |
|---|---|
| **0.00** | Pointerdown. One sample-step emits **before any movement** — 32 grains at 8 mirrored positions, starting from y = 0.34. *Eight marks exist before the hand has moved.* This is the tutorial. |
| **0.08** | Drag begins. Eight streams start. Grains take **≈ 0.43 s** to fall, so there is always a **standing column of powder in the air behind the cursor** — the stroke is a falling ribbon, not a line. |
| **0.20** | First grains touch the stone, hop once (~0.09 s, damped), settle. The pattern begins to exist. |
| **0.55** | Steady state. **Airborne grains are hot and settled grains are warm** — the fragment shader reads `vFlight` (§6.5), which the closed-form position already computes, so this costs nothing. Bloom (`luminanceThreshold 0.28`) catches the live ribbon and almost none of the bed. **The live stroke is the brightest thing on screen and its own history is a warm ember trail behind it.** |
| **1.60** | **The centre crossing.** All eight streams converge, cross, diverge. Eight-times density lands in one place: **the flare.** Bloom spreads warm light onto the wet stone, which returns it as a cool-to-warm fresnel sheen. The single brightest frame of the piece. |
| **2.40** | Pointerup. Emission stops; grains already in the buffer complete their fall on their own clocks. |
| **2.95** | Last grain settles. The pattern is complete, symmetric, warm on near-black. |
| **3.0 → 4.2** | **The settle-breath.** `uEmissiveGain` eases `1.00 → 1.32 → 1.00` over 1.2 s. One uniform, one exhale. The "it is finished" signal, delivered without a word. The colophon's `print` line flickers once in the same beat (§8.8) and `R TO REPLAY` fades in beside it. |
| **always** | **the Breath** (§6.3) drifts the camera ±3.5°, so the wet sheen slides slowly across the settled relief. **The scene is never fully static** — a judge who stops moving still sees the frame breathe. |

### 3.3 THE SCREENSHOT FRAME — exact composition

**Captured at `uTime = 1.68 s`** (= 0.90 s idle + 0.78 s into the Invocation, just past the centre
crossing, when bloom peaks because grains are still converging in air). Deterministic and
pixel-repeatable via `?still=1`, which freezes `uTime` at that value (§7.4).

```
16 : 9   ·   kolam centre at 58% width, 56% height   ·   disc spans ~74% of frame width

┌────────────────────────────────────────────────────────────────────────────┐
│ ····· vignette crushes all four corners to #06080A ·························│
│                                                                            │
│  Threshold                                                                 │
│  ▬▬▬  ← kumkum rule, 44 × 2 px                                             │
│  கோலம் · a doorstep drawing                    ╭ 8 airborne arcs ╮          │
│                                            ╭───┴──╮        ╭─────┴───╮     │
│  One stroke falls as eight.               │ hot: #F2A64B → #FFF3D6, blooms │ │
│  Rice powder on wet stone — a kolam,       ╰──╮ ╭──╯        ╰──╮ ╭────╯     │
│  the way it is drawn on the                   ╳ ── THE FLARE ─ ╳           │
│  doorstep at dawn.                         ╭──╯ ╰──╮        ╭──╯ ╰────╮     │
│                                            ╰───┬──╯        ╰─────┬───╯     │
│                              settled bed #FFE6B0, lit from the RIGHT by    │
│                              the lamp, every grain's far side rimmed cool  │
│                              #4E7A94 by the pre-dawn                       │
│                          ▒▒▒░░  ← ONE QUADRANT STILL BARE STONE            │
│                                                                            │
│  eightfold — D4                    RULE                                    │
│  seed 4821 · print 8f2a1c3d   GENERATED          [MOTION] [SWEEP]          │
└────────────────────────────────────────────────────────────────────────────┘
```

What the eye reads, in order:

1. **The flare** — the brightest pixel cluster in frame, bloom spilling warm onto wet stone.
2. **Eight airborne arcs** — each a comma-shaped column of grains between y = 0.34 and y = 0, hot
   core to `#FFF3D6` highlights, all blooming.
3. **The settled relief** — `#FFE6B0` under the lamp, **every grain's far side rimmed cool
   `#4E7A94`.** This warm/cool split *on a single grain* is what makes flat point sprites read as
   3D powder, and it is the entire reason for the analytic shading in §6.5.
4. **The title plate**, upper-left, real DOM type, crisp at any DPR.
5. **The vignette**, forcing the eye back to the flare.
6. **The deliberate imperfection (rule 8):** the pattern is **not finished** — one quadrant of the
   outer ring is still bare stone. In-progress reads as real; a completed mandala reads as staged.
   *(The build's second, verbal imperfection is the `SIMULATED` colophon line — PLAN.md §3.)*

**The three required Devpost screenshots are a design deliverable, framed now (T-24):**
- **#1 — gallery thumbnail:** the frame above, `?still=1`.
- **#2:** the finished kolam after three strokes, settled, lamp raking, relief legible.
- **#3:** a Sweep at ~40% — half the pattern dissolving outward in a radial wave. Proves
  interactivity in a still image and is beautiful on its own.

---

## 4. Zero instructions — four mechanisms, in order of who they catch

### 4.1 the Invocation — fires unprompted at t = 0.9 s

**Not in PLAN.md; I am adding it. See §12.1 for the cost and the trade.**

A canned path is fed to `core/grains.js` at load with the fixed seed and played through the same
`uTime` clock a human stroke uses. **The judge sees the Eightfold happen within three seconds of
load, without touching anything.** PLAN.md's §11 beat 1 requires the judge to move the cursor first;
that is fine for the video but it fails design-craft §7 — **a judge who lands on the live URL and
sees an empty dark plane has already scored criterion 1 from a blank frame.** The Invocation is also
what makes the thumbnail reproducible instead of hand-caught.

It is nearly free because **T-14 already builds replay-from-a-recorded-path**; the Invocation is that
machinery pointed at a constant.

```js
export const INVOCATION = [                 // world XZ, CatmullRom, y = 0, length ≈ 2.8
  [-1.02,  0.62], [-0.71,  0.30], [-0.38,  0.09], [-0.06, -0.04], [ 0.24, -0.02],
  [ 0.49,  0.14], [ 0.66,  0.41], [ 0.72,  0.74], [ 0.61,  1.01],
];
```
- Starts **t = 0.90 s** after the first frame, duration **1.70 s** (≈1.65 units/s).
- Emits at **3 grains per sample** rather than 4, so it costs ≈ 3,400 of the 20,000 slots and leaves
  the judge four full strokes before the ring recycles.
- **It is an open arc that does not close.** Incompleteness is the invitation — the instinct is to
  finish it. The control points are hand-shaped and irregular, so it looks drawn, not generated.
- **Authored to produce the thumbnail:** its centre crossing lands 0.78 s in.
- **Interruptible, always.** Pointer move during playback: it completes and hands over. Pointer
  **down**: it aborts within one frame. It never fights the user and it never replays itself.
- It uses the same seed as a normal session, so **the print shown after the Invocation is the
  Invocation's own print** — determinism holds and pc-red-team can check it.

### 4.2 the hover ghosts — mouse only, before the first click

While the pointer is over the stone with no drag active, draw the cursor point **and its eight D4
images** as faint discs (`--powder-500`, additive, opacity 0.20, radius 0.03 world). Move the mouse
and **eight ghosts swim across the stone in mirrored formation.**

This is the strongest teaching device in the piece: **the mechanism is demonstrated by hovering,
before any commitment.** Cost: 9 points in the same `<points>` object with a `aGhost` flag, or a
separate 9-vertex `<points>` — either, pc-frontend's call.

### 4.3 the first sample — touch and mouse alike

**One sample-step emits on `pointerdown`, before any movement** (§3.2, t = 0.00). A tap alone
produces eight marks. Arc-length resampling is 0.020 world units ≈ 8–12 screen px, so the second
step fires within the first few pixels of a drag — the response is genuinely on the first millimetre.
On touch, where no hover exists, **this is the entire tutorial and it lands in under 100 ms.**

### 4.4 the pulli — the invitation *(T-18, below the freeze line)*

49 guide dots, 7 × 7 square grid, spacing 0.44, extent ±1.32 — a square grid is itself D4-invariant,
so it belongs. Before interaction, opacity breathes `0.35 → 0.55` on a 4 s sine, **phase-offset by
distance from centre so the pulse ripples outward** — an unmistakable "here" without a word. On first
pointerdown the ripple stops and the dots settle to a static 0.18.

**PLAN.md ranks this cut-4th and I agree with that ranking.** §4.1–4.3 are the load-bearing teachers;
this is the elegant extra. If it survives, it also improves the empty frame before the Invocation.
**It is one `<points>` object with 49 vertices and a `MeshBasicMaterial`-equivalent shader — ~0.08 h.**

---

## 5. Layout

### 5.1 `Stage` — desktop / landscape ≥ 1024 px

Canvas is full-bleed and fixed at `z-index: 0`. **All type is DOM overlay** at `z-index: 1`,
`pointer-events: none`, except buttons and the replay affordance which re-enable it. No 3D text.

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
│                                                 centre 58% w · 56% h         │
│                                                 spans ~74% of frame width    │
│                                                                              │
│                                                              DRAG THE STONE ⓖ│
│  eightfold — D4                              RULE  ⓗ                         │
│  seed 4821 · print 8f2a1c3d  R TO REPLAY GENERATED                           │
│  19 208 grains                           OBSERVED    ⓘ [ MOTION ] [ SWEEP ]  │
│  fall & settle — closed form, not physics SIMULATED               ↓32px ←32px│
└──────────────────────────────────────────────────────────────────────────────┘
```

| | Element | Spec |
|---|---|---|
| ⓐ | Title | Display size, top-left, `32px` inset. Enters `opacity 0→1, translateY 8px→0` over `--dur-slow` `--ease-out`, **starting on DOM paint — before WebGL initialises.** |
| ⓑ | Kumkum rule | `2px` tall, `--kumkum`, `margin-top 14px`. **This element is also the load progress bar** (§8.1): it grows `0 → title width` during load, then contracts to `44px` over 400 ms. One element, two jobs. |
| ⓒ | Tamil sub-line | `margin-top 14px`. Hidden under `.no-tamil`. |
| ⓓ | Concept line | `margin-top 28px`, `max-width 31ch`. **Verification step, delegated:** screenshot the live desktop frame; if the concept line's right edge touches the kolam's outer ring, drop to `26ch`. **Do not move the title plate.** |
| ⓕ | Kolam disc | The projected drawable area. The camera's `-0.22` x-offset (§6.2) puts it right of frame centre so the type block balances it. |
| ⓖ | Hint | Bottom-right above the buttons, `margin-bottom 20px`. Fades in over `--dur-mid` at t = 7 s **only if no pointerdown has occurred.** Removed permanently on first pointerdown. |
| ⓗ | Colophon | Bottom-left, `32px` inset. Four fact/tag rows — see §5.3. |
| ⓘ | Controls | Bottom-right, `32px` inset, `gap 12px`. |

### 5.2 `Stage` — portrait / ≤ 768 px

```
┌───────────────────────────────┐
│ ↑ 20px + safe-area            │
│  Threshold                    │  ← plate owns the top 22% of the viewport
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
│     │  │  KOLAM DISC   │  │   │     centre 50% w · 58% h
│     ╰──┤               ├──╯   │
│        ╰───────────────╯      │
│                               │
│  print 8f2a1c3d     GENERATED │  ← colophon collapses to TWO rows on mobile
│  closed form, not   SIMULATED │     (the two load-bearing tags, PLAN.md §3)
│  physics                      │
│  ┌────────┐┌────────┐┌───────┐│  ← 44px min height, full-width row, gap 12px
│  │ MOTION ││ REPLAY ││ SWEEP ││     REPLAY replaces the R key on touch
│  └────────┘└────────┘└───────┘│
│ ↓ 20px + env(safe-area-inset-bottom)  ← the home indicator MUST NOT overlap  │
└───────────────────────────────┘
```

**Portrait-specific, all mandatory:**
- `html, body { height: 100dvh; overflow: hidden; overscroll-behavior: none; }` — **`dvh`, not
  `vh`**, or mobile browser chrome clips the control row.
- **`overscroll-behavior: none` is not optional:** without it a downward drag near the top triggers
  pull-to-refresh and reloads the site mid-stroke.
- Canvas: `touch-action: none; user-select: none; -webkit-touch-callout: none;`
- All four insets add `env(safe-area-inset-*)`.
- Hint moves above the button row, centred.

### 5.3 The epistemic-tag legend — the visual system

PLAN.md §3 defines four tags. **Here is how they render.** They are the only place on the page where
the build talks about itself, so they must read as craft, not as debug output.

```
  fact                                      tag
  ├──────────────────────────────────────┤ │ ├──────────┤
  eightfold — D4                          │  RULE
  seed 4821 · print 8f2a1c3d              │  GENERATED
  19 208 grains                           │  OBSERVED
  fall & settle — closed form, not physics │  SIMULATED
                                          ↑
                                 1px --hairline, full block height
```

- **Fact column:** `0.75rem` IBM Plex Sans 400, `--ink-35`, right-aligned to the rule. The print
  value alone is monospace `--ink-60` — it is the one value a judge is invited to compare.
- **Tag column:** `0.6875rem` IBM Plex Sans 500, uppercase, `0.16em` tracking, `--ink-35`,
  left-aligned after `16px` of gap.
- **The rule:** 1px `--hairline`, spanning the block's full height. One vertical line, no boxes.
- **All four tags are the same colour and the same weight.** The tag *word* carries the meaning.
  **No colour coding, no icons, no dots, no emoji** — accessibility floor: meaning is never carried
  by colour alone, and a colour-coded legend would need a key, which is a panel, which is refused.
- **Live values** (`print`, `grains`) update on a `--dur-fast` opacity cross-fade, never by snapping.
- **Mobile:** rows 2 and 4 only (`GENERATED`, `SIMULATED`) — PLAN.md §3 names those two as the
  load-bearing ones. Rows 1 and 3 are dropped, not hidden behind a disclosure control.

---

## 6. The scene — every value pc-frontend needs

World: Y up, ground plane at y = 0, kolam on the origin, drawable radius 2.40, pulli extent ±1.32.

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
    gl.shadowMap.enabled = false;
  }}
/>
```
Antialiasing is off at the renderer because an `EffectComposer` is in front of it; DPR carries edge
quality. `multisampling={0}` on the composer at every tier.

### 6.2 Camera

```js
fov = 32          // long lens: compresses, reads photographic. A wide fov reads "game engine".
near = 0.1, far = 40
base position = (-0.22, 2.35, 2.95)      // -0.22 pushes the kolam right of frame centre
lookAt        = ( 0.00, 0.02, -0.10)
```
Pitch ≈ **38.5°** above horizontal. This supersedes PLAN.md's approximate "~35°" — it is derived from
the framing, not chosen: high enough that the eightfold reads as a *pattern*, low enough that grains
have visible height and the fall is a vertical event on screen. At fov 32 and d ≈ 3.77 the 3.2-unit
disc fills ~74% of a 16:9 frame width, which is the composition in §3.3.

**Responsive dolly**, recomputed on resize with `aspect = w / h`:
```js
const k = aspect >= 1.40 ? 1.00
        : aspect >= 1.00 ? 1.14
        : aspect >= 0.70 ? 1.42
        :                  1.62;
camera.position.set(-0.22 * k, 2.35 * k, 2.95 * k);
camera.lookAt(0, 0.02, -0.10);
if (aspect < 1.0) camera.rotateX(-0.045);   // pushes the disc down in frame, clearing the plate
```
**`?fold=6` (T-15) needs no camera change** — D6 is still centred on the origin and its circumscribed
radius is the same, so the composition holds unmodified. Confirmed, not assumed.

### 6.3 Camera motion — the Breath, and pointer parallax

**No `OrbitControls`, no free camera, no scroll camera.** PLAN.md §12 refuses them and so does this:
the verb is drag-to-draw, and a second drag verb means neither is learned (kill-risk 4). They would
also destroy every screenshot's framing.

- **the Breath:** continuous azimuth ±3.5°, pitch ±1.2°, on a 34 s sine about the base position.
  Amplitude is deliberately tiny — it must never fight the drawing. Its job is **proving the scene is
  3D**: without parallax, a fixed three-quarter view of a flat pattern can be read as a 2D
  illustration, which would cost the entry the premise of the event.
- **Pointer parallax:** lookAt target shifts up to 0.06 world units toward the pointer, lerped `0.04`
  per frame. **Frozen to 0 while a drag is active** — the pattern must never slide under the finger.
- Both **off** under reduced motion.
- **Neither touches the grain buffer, so neither can change the print.** Say so in the README;
  pc-red-team will attack exactly this (PLAN.md §4).

### 6.4 The lighting rig — as shared uniforms, not scene lights

**Both the ground and the grains are custom shaders, so there are no `three` light nodes in the final
scene.** The rig lives in `render/lightRig.js` as constants both shaders import. This is a real
simplification: zero lit materials, zero light uniform blocks, zero shadow logic, and it lets drei be
removed as PLAN.md §5 wants.

```js
export const KEY_POS   = [ 1.15, 0.62, 1.05];  // the lamp — a diya at the edge of the doorstep
export const KEY_COLOR = '#FFB765';            // --lamp
export const KEY_INT   = 9.0;                  // with 1/d² falloff, distance 7
export const RIM_DIR   = [-2.2, 1.4, -1.8];    // the pre-dawn sky, normalised in the shader
export const RIM_COLOR = '#4E7A94';            // --predawn
export const RIM_INT   = 0.55;
export const AMB_SKY   = '#1A2830';
export const AMB_GND   = '#0A0806';
export const AMB_INT   = 0.30;                 // keeps shadow sides off pure black
```

The key sits **low** (y = 0.62) on purpose: it rakes across the scene, which is where all the relief
comes from. **The warm key against the cool rim, resolved on a single grain, is the entire palette
thesis** — it is what makes a flat point sprite read as a lit 3D grain.

**No shadow maps at any tier.** Nothing casts. Relief comes from §6.5's per-fragment shading.

*(T-02's stub may use a plain `<directionalLight>` + `MeshStandardMaterial` to get something on
screen fast. T-11 replaces it with this. That is expected, not a regression.)*

### 6.5 `grain.frag` — the analytic grain, and why it matters most

Point sprites are unlit billboards by default, which would give flat warm dots and lose the entire
visual thesis. **This shader is what earns criterion 1.** It is ~25 lines and it is the highest
visual-return-per-line in the build.

```glsl
vec2 uv = gl_PointCoord * 2.0 - 1.0;
float r2 = dot(uv, uv);
if (r2 > 1.0) discard;
vec3 n = normalize(vec3(uv.x, -uv.y, sqrt(max(1.0 - r2, 0.0))));   // fake hemisphere, view space

float lam  = max(dot(n, vKeyDirView), 0.0);                        // warm key, per-grain direction
float rim  = pow(1.0 - max(n.z, 0.0), 2.2);                        // cool pre-dawn edge
vec3 tint  = mix(mix(uPowderCore, uPowder100, vTint), uPowder300,   // 3-stop ramp, seeded per grain
                 smoothstep(0.6, 1.0, vTint));

vec3 col = uPowder700 * 0.22                       // shadow-side floor, never black
         + tint * uKeyColor * (0.95 * lam) * vKeyFalloff
         + uRimColor * rim * 0.55
         + uEmissive * vFlight * uEmissiveGain;    // hot in air, warm on the ground

float a  = smoothstep(1.0, 0.72, r2);              // soft edge — no hard disc, ever
gl_FragColor = vec4(col, a * vAlpha);
```

- **`vKeyDirView`, `vKeyFalloff`, `vFlight`, `vTint`, `vAlpha` are all computed in the vertex
  shader**, which already evaluates the closed-form position and therefore already knows where the
  grain is and how far through its fall it is. **The flight/settled brightness split in §3.2 costs
  nothing.**
- `vFlight` = 1.0 mid-air → 0.28 settled. This is the same value the position formula uses; do not
  introduce a second one.
- **`uEmissive * vFlight` pushes airborne grains above 1.0 pre-tonemap**, which is exactly what
  `Bloom`'s `luminanceThreshold 0.28` is tuned to catch. The two settings are a pair — change one and
  retune the other.
- **Blending:** `transparent: true`, `depthTest: true`, **`depthWrite: false`**, `NormalBlending`,
  `renderOrder: 1`. Unsorted alpha is *correct by construction* here: grains are drawn in emission
  order, so later powder blends over earlier powder, which is what falling powder does.
- **`gl_PointSize` must be clamped `clamp(size, 1.0, 64.0)`.** Below 1.0 grains vanish; above 64 some
  mobile GLES drivers drop the sprite entirely. Perspective-correct: `uSize * uScale / -mvPosition.z`.
- Grain diameter **0.020 world units**, per-grain size jitter `0.75 – 1.35×` from the seeded RNG.

### 6.6 `ground` shader — the wet stone

Replaces `MeshStandardMaterial` + `<Environment>` + `<Lightformer>` entirely, which removes the drei
dependency PLAN.md §5 put on probation and downloads nothing.

> **REVISED 2026-08-23 19:45 by pc-designer, after the Crew Chief rejected the frame this
> section's first version produced.** The original block is kept at the bottom of this section
> because the reason it was wrong is the useful part. Implemented in
> `src/render/ground.frag.js`; the four gains live in `src/render/lightRig.js`.

```glsl
// --- the stone: mottled near-black granite, spanning 900 -> 700 so the MEAN
//     lands on --stone-800. This texture is why the ground can be this dark
//     and still read as stone rather than as void.
float grain  = noise2(vWorld.xz * 6.0) * 0.72 + noise2(vWorld.xz * 26.0) * 0.28;
vec3  albedo = mix(uStone900, uStone700, clamp(grain, 0.0, 1.0));
vec3  base   = albedo * uAmb;                          // GROUND_AMB — the pre-dawn ambient

// --- the diya's pool. uPoolCore replaces the bare 1.0: a point-source 1/d² is
//     only valid at d >> source, and the flame is ~0.1 units across sitting
//     0.62 above the stone, so the near-lamp region is exactly where the point
//     approximation spikes. 3.02 under the lamp -> 0.43 at the far edge.
vec3  toKey = uKeyPos - vWorld;
float pool  = uKeyInt / (uPoolCore + dot(toKey, toKey));
vec3  L     = normalize(toKey);
float ndl   = max(dot(vNormal, L), 0.0);
vec3  lit   = albedo * uKeyColor * pool * (0.30 + 0.70 * ndl) * uGain;   // ALBEDO-MULTIPLIED

// --- the wet. Carried by Fresnel, not by a specular lobe, and modulated by the
//     same noise so the film is patchy. This is the only cool light in frame.
float fres  = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 4.0);
vec3  sheen = uSheen * fres * mix(0.55, 1.45, grain) * uSheenGain;

// --- a glint, kept two orders of magnitude below bloom on purpose (see below).
vec3  H     = normalize(L + vViewDir);
float spec  = pow(max(dot(vNormal, H), 0.0), mix(210.0, 46.0, grain)) * mix(0.09, 0.02, grain);
vec3  glint = uKeyColor * spec * pool * uGlintGain;

vec3 col = base + lit + sheen + glint;
col = mix(uStone900, col, smoothstep(9.0, 1.5, length(vWorld.xz)));   // vignette into the dark
```

| constant (`lightRig.js`) | value | what it does |
|---|---|---|
| `GROUND_AMB` | `15.0` | ambient gain on the stone tokens — sets the field's near-black level |
| `GROUND_GAIN` | `1.5` | the diya's diffuse gain, applied to `albedo * irradiance` |
| `GROUND_SHEEN` | `3.8` | Fresnel gain — the wet, and the only cool light in frame |
| `GROUND_GLINT` | `0.02` | specular gain. **At `0.5` this single term was the rejected blob.** |
| `GROUND_POOL_CORE` | `2.6` | softens 1/d² near the lamp; the diya is an area source |
| `GROUND_FADE` | `[9.0, 1.5]` | unchanged from the original spec — measurement vindicated it |

**`GROUND_AMB = 15.0` is not a bug.** ACES + exposure 1.05 + the post Vignette (§7.3) together
attenuate this end of the range by roughly 12×: authored at `1.0`, `--stone-800` lands on screen as
`#030101`, pure void. The gain is the pre-compensation that puts the token back where §1.1 says it
belongs. Author in linear scene units, grade to the token, **and verify by sampling the rendered
frame** — every number in the table above was set that way, not by eye.

#### Why the first version of this section was wrong

The original block added the lamp to the surface **independently of the stone's albedo**:

```glsl
vec3 col = uStone
         + uKeyColor * spec * fall
         + uKeyColor * fall * 0.06                     // <-- fog, not light
         + uSheen    * fres * 0.35;
```

Near-black wet granite (`--stone-800` is ~0.5% linear reflectance) cannot return the lamp's own
colour at 6% of full intensity however close the lamp gets. Because the term ignored albedo it
scaled with `fall` alone, and the specular term (amplitude ~0.45 × `fall` ~5.5 ≈ 2.5 linear) blew a
blob into the lower right. **Measured, the frame that spec produced: field `#341403`, lower right
`#ff8827`.** The palette's entire warm/cool thesis — the powder is the only warm thing in the
picture — was inverted by the ground.

The fix is one structural change, not a tuning pass: **multiply the lamp by the albedo it is
falling on.** The ground's brightest in-frame pixel is then ~0.02 linear instead of ~1.4, an order
of magnitude below Bloom's `0.28` `luminanceThreshold`, so the ground now *cannot* bloom at any
lamp distance. `KEY_POS` / `KEY_INT` (§6.4) are **unchanged** — the lamp was never the root cause,
so the grains, which read the same uniforms and already looked right, are untouched.

**Rule this leaves behind, for any surface added later:** a light term that is not multiplied by an
albedo is fog. If you want haze, say haze and put it in the post chain.

**Noise is generated in GLSL, not loaded and not baked to a canvas** — zero textures ship. The uneven
roughness is the single detail that separates "wet stone" from "black plastic".

**Escape hatch, named now so nobody improvises one at hour 3:** if this shader stalls past 20 minutes,
fall back to `MeshStandardMaterial{ color:'#0B0F12', roughness:0.22, metalness:0 }` plus a
`<pointLight>` at `KEY_POS` and a `<hemisphereLight>` from §6.4. That reaches ~70% of the look and
keeps the schedule. Do not reach for drei's `<Environment>` — an HDR is a download.

### 6.7 Emission constants — and one requirement on pc-backend

```js
SAMPLE_SPACING   = 0.020    // world units of arc length between resamples (PLAN.md §2)
GRAINS_PER_SAMPLE= 4        // ×8 arms = 32 grains per sample-step (3 for the Invocation)
SCATTER_RADIUS   = 0.019    // r = SCATTER * rng()   ← NOT sqrt(rng()): centre-biased, because
                            //    powder is denser at the middle of a pinch
DROP_HEIGHT      = 0.34
V0_Y             = -0.10
GRAVITY          = -3.2     // stylised, slower than real — reads as fine powder in air
RESTITUTION      = 0.28     // one damped hop, ~0.09 s
FALL_TIME        ≈ 0.43 s   // fast enough to read as immediate, slow enough to be a visible event
SPIN             = 2.0 – 6.0 rad/s (drives vTint shimmer only; points do not rotate)
DRAW_RADIUS_MAX  = 2.40     // samples beyond this are never written
TELEPORT_LIMIT   = 0.45     // >0.45 world units in one frame = pen-up/pen-down, no interpolation
CAPACITY         = 20 000   // PLAN.md's cap, unchanged
```
At 32 grains per 0.020 units, a stroke costs **1,600 grains per world unit** — so 20,000 slots is
**≈ 12.5 units of path, about four full strokes** before the ring recycles. That headroom is
deliberate: it is what makes the Walk-Over (§8.9) feel like a slow tide rather than a truncation.

**`TELEPORT_LIMIT` is the fix for the classic bug** where the pointer leaves the window, re-enters
elsewhere, and a straight line snaps across the pattern.

> **Requirement on pc-backend (T-06).** `aTint` and `aSize` must be **generated inside
> `core/grains.js` from the seed and stored in the GrainBuffer**, exactly like jitter — *not* by
> `Math.random()` in the renderer. Two reasons: `Math.random()` in `src/core/` fails
> `boundary.test.js`, and per-grain appearance that is not seeded would make the replay visibly
> different from the original while the print stayed the same, which is worse than no replay at all.
> **Both attributes are part of the print.**

---

## 7. Performance budget

### 7.1 Targets

| Target | Value |
|---|---|
| Frame rate, integrated graphics (Intel UHD 620), full 20,000 cap | **60 fps** |
| Frame rate, M1 | 60 fps with large headroom (the cap, not the GPU, is the limit) |
| First contentful paint (typeset title plate) | **< 400 ms** |
| First WebGL frame, cold cache, 5 Mbps | **< 1.6 s** (PLAN.md's budget is < 2 s) |
| Total transfer, gzipped | **< 600 KB**; target ≈ **430 KB** (three ≈170 · R3F ≈40 · postprocessing ≈90 · react+dom ≈45 · fonts ≈55 · app ≈30) |
| Draw calls, main pass | **≤ 4** (ground · grains · cursor+ghosts · pulli) |
| Steady-state CPU per frame | **three uniform writes and one integer** |

### 7.2 The seven named techniques that hold it

1. **Closed-form position in a vertex shader** (PLAN.md §1). Every grain's position at time *t* is a
   function of its buffer entry, evaluated on the GPU. There is no integrator, no per-frame matrix
   loop, no physics library, and **the per-frame cost does not grow as the judge keeps drawing.**
   *This is the technique that makes the whole piece possible.*
2. **Preallocated 20,000-slot buffer with a ring cursor.** Allocated once at startup. A ten-minute
   unbroken scribble neither grows memory nor stalls — it recycles, which the design turns into the
   Walk-Over (§8.9).
3. **Contiguous `addUpdateRange` commits.** The ring cursor is monotonic, so the dirty span is always
   contiguous: `attr.addUpdateRange(offset, n); attr.needsUpdate = true; geometry.setDrawRange(0, count)`.
   Only newly-written grains upload, never the whole buffer. *(three 0.185 has `addUpdateRange`.)*
4. **Zero allocation in the frame loop.** No `new` inside `useFrame`; no `.map`/`.filter`/`.forEach`
   closures; **no `setState` from `useFrame`** — animation writes to refs and typed arrays only. A
   single 50 ms GC pause is more visible to a judge than 10 fps of average loss.
5. **No lit materials, no light nodes, no shadow maps.** Both shaders are hand-written and the rig is
   uniforms (§6.4). Nothing casts; relief is per-fragment (§6.5).
6. **Zero downloaded assets.** No HDR, no texture, no GLTF. Ground noise is GLSL; the environment is
   an analytic fresnel term. This also removes drei, taking production deps to 7 (§1.4).
7. **Degrade the emission rate, never the frame rate** (PLAN.md §8). `app/perf.js` keeps a rolling
   p50 frame time; above **20 ms for 2 s** it lowers `GRAINS_PER_SAMPLE` 4 → 3 → 2. The live count
   appears in the colophon under the `OBSERVED` tag as a neutral fact — see §8.13 for the tone rule.

**Bloom degradation, ordered** (PLAN.md §8 says bloom is dropped first under frame pressure; here is
what "dropped" means, in steps, so the frame never falls off a cliff):
`levels 6 → 4` → `levels 3` → **off**. If bloom goes off entirely, compensate in the same commit:
`toneMappingExposure 1.05 → 1.18` and `uEmissiveGain × 1.25`, or the frame reads dead. **Never ship a
bloom-less frame without that compensation.**

**DPR clamp:** `[1, 2]` desktop, `[1, 1.75]` on coarse pointers — a 3× phone is never asked for 3×.

### 7.3 Post-processing — exact settings

```jsx
<EffectComposer multisampling={0} disableNormalPass>
  {dofEnabled && (                                   // T-17, cut 3rd — off by default at Tier B/C
    <DepthOfField focusDistance={0.0155} focalLength={0.048} bokehScale={2.6} />
  )}
  <Bloom
    intensity={1.15}
    luminanceThreshold={0.28}      // paired with uEmissive * vFlight (§6.5) — retune both together
    luminanceSmoothing={0.22}
    mipmapBlur
    radius={0.72}
    levels={bloomLevels}           // 6 → 4 → 3 → off, per §7.2
  />
  <Vignette offset={0.28} darkness={0.72} />
  {!reducedMotion && bloomLevels > 3 && (
    <Noise opacity={0.035} premultiply blendFunction={BlendFunction.SOFT_LIGHT} />
  )}
</EffectComposer>
```
The film grain at 0.035 soft-light is the cheapest single thing that stops a WebGL scene looking like
a WebGL scene — and it is thematically exact, because the subject is powder. `postprocessing` merges
`Vignette` + `Noise` + tone mapping into **one** fragment shader, so the post chain is bloom plus one
merged pass.

### 7.4 `?still=1` — the screenshot freeze

Runs the Invocation, then **freezes `uTime` at 1.68 s** and holds it. Since position is a pure
function of `uTime`, this is a one-line clamp. It makes the actual evaluation channel for the
heaviest criterion — the gallery thumbnail and the three screenshots — **pixel-repeatable instead of
hand-caught.** It is in the never-cut list.

---

## 8. State matrix

Every state below is a shipped state. None of them is a message box.

| # | State | Entry | What the judge sees |
|---|---|---|---|
| **1** | **Boot** | load → first WebGL frame | **No white flash, ever** — `#06080A` is inline on `<body>`. The title plate is DOM, so **`Threshold` is typeset on screen before WebGL initialises.** The kumkum rule grows `0 → title width` (easing toward 90%, completing on canvas-ready), then contracts to 44 px over 400 ms. **No spinner.** Typically < 600 ms. |
| **2** | **Empty / attract** | first frame → 0.9 s | Wet stone, vignette, the Breath drifting. Pulli rippling outward if T-18 survived. |
| **3** | **Invocation** | 0.9 → 2.6 s | The canned stroke plays (§4.1). Aborts on pointerdown within one frame. Never replays itself. |
| **4** | **Idle-with-pattern** | 2.6 s → first input | The unfinished arc sits there. Hover ghosts live (mouse). **At t = 7 s with still no interaction, `DRAG THE STONE` fades in bottom-right.** |
| **5** | **First interaction** | pointerdown | Hint removed permanently. One sample-step fires immediately — 8 marks before any movement. Pulli dim to 0.18. Pointer parallax freezes. |
| **6** | **Mid-draw** | drag | Arc-length emission at `SAMPLE_SPACING`. Hot ribbon, warm trail. Cursor point grows to r = 0.07 / opacity 0.85. Beyond `DRAW_RADIUS_MAX` the cursor dims to 0.15 and emission stops — **the boundary is felt, never announced.** |
| **7** | **Settling** | pointerup → +0.6 s | Emission stops; grains already in the buffer finish falling on their own clocks. `pointerleave`, `pointercancel`, and window `blur` all behave exactly as pointerup. |
| **8** | **Settled** | last grain lands | The settle-breath: `uEmissiveGain 1.00 → 1.32 → 1.00` over 1.2 s. **In the same beat the colophon's print value flickers once** (`opacity 0.35 → 0.9 → 0.55`, 700 ms) and `R TO REPLAY` fades in beside it. Live region: `Eight strokes drawn.` |
| **9** | **At capacity — the Walk-Over** | ring cursor wraps at 20,000 | The oldest grains fade out (`vAlpha 1 → 0` over 0.6 s `--ease-in`) as their slots are rewritten. It reads as the earliest strokes being softly walked away — **which is what happens to a real kolam by midday. The capacity limit is the concept.** No error, no cap warning, no message. |
| **10** | **Replay** | `R`, or the `REPLAY` control on touch | The recorded path replays from `uTime = 0` with the same seed. **The print does not change.** Live region: `Replayed. The print is unchanged.` The print value pulses once on completion so the eye returns to it and sees it unchanged — *the beat only lands if the judge is looking at the number.* |
| **11** | **Sweep** | `SWEEP` or `Esc` | Grains fade out in a **radial wave from the centre outward** over 0.9 s (one `uSweep` uniform against each grain's radius), then `count = 0`. Pulli ripple returns. Button is `aria-disabled` at opacity 0.4 while the buffer is empty. Live region: `Stone swept.` |
| **12** | **Reduced motion** | media query **or** the MOTION button | See §8a. |
| **13** | **No WebGL / context lost** | probe fails, error boundary, or `webglcontextlost` | See §8b. |
| **14** | **Perf degrade** | `app/perf.js` steps emission down | **No modal, no toast, no warning language, no "your device is slow".** The only change is the `OBSERVED` grain count in the colophon and slightly sparser powder — which still reads as intentional. *This reconciles my "never surface a downgrade" with PLAN.md's `Observed` tag: the fact is published as a neutral tagged fact; it is never framed as a problem.* |
| **15** | **Touch** | coarse pointer | No hover ghosts (no hover exists). Cursor point appears on `touchstart`. **Only the first pointer is tracked; additional pointers are ignored** — prevents chaos and accidental pinch-zoom. |

### 8a. Reduced motion — the exact behaviour

Entry: `prefers-reduced-motion: reduce` (automatic) **or** the MOTION button (manual, overrides
either way, persisted to `localStorage["threshold.motion"]`).

| | Normal | Reduced |
|---|---|---|
| the Breath | ±3.5° / 34 s | **off** — camera fixed at base |
| Pointer parallax | on | **off** |
| Pulli ripple | 0.35–0.55 breathing | **off** — static 0.42 |
| Grain fall | falls 0.43 s, hops, settles | **`uMotion = 0`.** Grains render at their settled position with a 200 ms per-grain opacity fade-in ordered along the stroke. **The stroke still draws and the Eightfold is still demonstrated**, with zero vestibular motion |
| the Invocation | plays with fall | plays without fall — the mechanic is still taught |
| Settle-breath | 1.2 s pulse | **off** |
| Film grain | on, 0.035 | **off** — per-frame grain flicker is a genuine photosensitivity concern, not a nitpick |
| Bloom, vignette, palette, lighting | on | **on, unchanged** — a static glow is not motion, and stripping the look would punish the user for the setting |
| **The print** | — | **structurally unchanged.** `uMotion` is a render uniform; the buffer function never receives it (PLAN.md §4, proof 3). Filmable in four seconds. |

**Photosensitivity floor:** no full-screen flashing at any time. The brightest event (the centre
flare) is spatially local and its luminance ramp is well under 3 flashes/second.

### 8b. `NoWebGL` — the fallback screen

ANALYSIS §5 names school-managed laptops with restricted WebGL as kill-risk 1. **This is the
highest-leverage resilience item in the spec, and it is not an error page.**

PLAN.md builds it as **inline SVG drawn by `core/` alone** — which is right, and better than the
screenshot I first specced, because it proves the import boundary is real (PLAN.md §1). Here is what
it must **look** like.

**Detection order:** (1) probe `webgl2` then `webgl` on a throwaway canvas **before** mounting
`<Canvas>`; (2) an R3F error boundary around `<Scene>`; (3) a `webglcontextlost` listener.

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Threshold                                                       │
│  ▬▬▬▬▬▬                                                          │
│  கோலம் · a doorstep drawing        ┌────────────────────────┐    │
│                                    │   inline SVG kolam,    │    │
│  One stroke falls as eight.        │   drawn by core/ from  │    │
│  Rice powder on wet stone —        │   INVOCATION + 2 more  │    │
│  a kolam, the way it is drawn      │   authored strokes,    │    │
│  on the doorstep at dawn.          │   seed 4821            │    │
│                                    └────────────────────────┘    │
│  This browser could not open a 3D canvas.    ← --ink-60, 0.95rem │
│  The drawing is here anyway.                                     │
│                                                                  │
│  eightfold — D4                    RULE                          │
│  seed 4821 · print 8f2a1c3d   GENERATED                          │
└──────────────────────────────────────────────────────────────────┘
```

**SVG rendering spec** (so it is a composed frame, not a debug dump):
- Run `core/grains()` over `INVOCATION` plus two more authored strokes at seed 4821, take the
  **settled** position of each grain, and emit `<circle>` elements — **cap at ~1,100 circles**, taking
  every *n*th grain, or the SVG bloats past 100 KB.
- `r` between `1.5` and `3.5` px from `aSize`; `fill` from the same 3-stop tint ramp via `aTint`;
  `opacity` `0.55 / 0.8 / 1.0` in thirds, so the bed has depth.
- Ground: a `<rect>` of `#06080A` with **two `<radialGradient>`s** — one warm `--lamp` at 22% opacity
  positioned to match `KEY_POS` in screen terms, one cool `--predawn` at 10% upper-left. The same
  light rig, expressed in SVG.
- A third radial gradient, `#06080A` at the edges, reproduces the vignette.
- **No `<text>` inside the SVG.** All type is the same DOM plate.
- Same title plate, same colophon (`RULE` + `GENERATED` rows only — there is no live grain count and
  nothing is simulated, so `OBSERVED` and `SIMULATED` are correctly absent, which is itself honest).

**A judge on a locked-down laptop still sees a composed, on-message, typographically real frame and
can still score all three criteria.** Context lost mid-session: identical layout, copy swaps to
`The 3D canvas was interrupted.`, plus a `RELOAD` button outlined in `--kumkum`.

---

## 9. Interaction & accessibility

### 9.1 Input model — and touch parity, stated beat by beat

| Input | Behaviour |
|---|---|
| Mouse move, no button | Cursor point + 8 hover ghosts follow. Pointer parallax active. |
| Pointer down (mouse or touch) | One sample-step fires immediately. Hint dismissed. Parallax freezes. `setPointerCapture`. |
| Drag | Arc-length emission at `SAMPLE_SPACING`. |
| Up / leave / cancel / window blur | All identical to pointerup. |
| Second+ touch point | **Ignored.** |
| Pointer teleport > 0.45 units/frame | Pen-up/pen-down. No line snaps across the pattern. |
| Beyond radius 2.40 | Emission stops, cursor point dims to 0.15. No message. |
| `R` | Replay. |
| `Esc` | Sweep. |

**Touch parity is not "it also works with a finger" — every beat has an equivalent:**

| Beat | Desktop | Touch |
|---|---|---|
| Learn the mechanic | hover ghosts (§4.2) | the first sample on tap (§4.3), plus the Invocation |
| Draw | drag | drag, `touch-action: none` |
| Replay — **PLAN.md's beat 2** | `R` key | **the `REPLAY` button in the control row.** Without it, the determinism beat is desktop-only, and criterion 3 says *"responsiveness"*. Non-negotiable. |
| Sweep | `Esc` or button | button |
| Reduced motion | button | button |

### 9.2 Keyboard — the whole mechanic, operable

Focus order: `MOTION` → `REPLAY` → `SWEEP` → canvas (`tabindex="0"`, `role="application"`,
`aria-label` per §2).

- **Arrow keys** move a virtual pointer at 0.045 units per press (key-repeat while held).
- **Space / Enter** toggles draw-lock: emission on/off. A keyboard user draws the same eightfold
  pattern a mouse user does.
- The core already takes a world-space point, so this is ~20 lines. **It is cut-order item 1** if the
  clock bites — but `R`, `Esc`, and fully focusable buttons are **never** cut.

### 9.3 Accessibility floor

- **Contrast:** every token verified against `#06080A` in §1.1. Lowest is `--ink-35` at 5.3 : 1 (AA
  at all sizes). Nothing below AA ships. The epistemic tags at `0.6875rem` use `--ink-35` and pass.
- **Focus:** `:focus-visible` → `outline: 2px solid var(--kumkum); outline-offset: 2px`.
  **`outline: none` without a replacement is banned.**
- **Tap targets:** every button `min-height: 44px; min-width: 88px`.
- **Never colour alone:** the MOTION button's state is carried by its **label text**
  (`MOTION` / `MOTION REDUCED`), not by its border; the four epistemic tags are all one colour and
  the tag word carries the meaning (§5.3).
- **Live region:** visually-hidden `aria-live="polite"`, three strings in §2 — so a screen-reader user
  gets confirmation the action landed, including that the print did not change.
- **Font scaling:** all `rem`; layout survives 200% zoom.
- **Reduced motion:** honoured automatically **and** manually overridable (§8a).
- **No emoji anywhere.**

---

## 10. Where this maps onto the board

Every design element above lands in an existing task. Nothing here creates a new owner.

| Board task | What this document gives it |
|---|---|
| **T-02** stub | §6.2 camera values (use them now — reframing later is free but re-shooting is not). The stub's `<directionalLight>` + standard material is expected and is replaced at T-11. |
| **T-06** core | §6.7's requirement: `aTint` and `aSize` are seeded, live in the GrainBuffer, and are part of the print. |
| **T-08** grain renderer | §6.5 `grain.frag` in full · §6.7 constants · point-size clamp · blending and draw order. |
| **T-09** signature moment | §3.1, §3.2, §4.3. |
| **T-11** composition pass *(0.75 h, biggest scoring block)* | §1.1 palette · §6.4 light rig · §6.6 ground shader · §7.3 post settings · §6.3 the Breath. **This is where criterion 1 is won.** |
| **T-12** site frame | §1.3–1.5 type · §2 copy · §5.1–5.2 layout · §5.3 the epistemic legend · §9.3. |
| **T-13** resilience | §8a reduced motion · §8b `NoWebGL` visual spec · §8.1 boot. |
| **T-14** replay + print | §8.10 · the print flicker in §8.8 · **the `REPLAY` touch control in §9.1** · and the Invocation in §4.1, which rides on this task's machinery. |
| **T-18** pulli *(cut 4th)* | §4.4. |
| **T-20** judge walk | §5.1 ⓓ's verification step; 390 px portrait against §5.2. |
| **T-24** screenshots | §3.3 and `?still=1` from §7.4. |

---

## 11. Do not — patterns banned for this build

Extends PLAN.md §12; everything it refuses is refused here too.

1. **No `OrbitControls`, no free camera, no scroll-driven camera.** One verb. They also destroy every
   screenshot's framing.
2. **No loading spinner.** The title plate plus the growing kumkum rule *is* the loading state.
3. **No modal, no onboarding overlay, no "click to start" gate, no instruction panel.**
4. **No audio of any kind, no autoplay anything.**
5. **No glassmorphism, no `backdrop-filter`, no floating rounded UI card.** Type sits on the scene.
6. **No emoji, anywhere.**
7. **No `outline: none`** without a replacement focus ring.
8. **No downloaded assets of any kind** — no GLTF, no HDR/EXR, no texture image, no CDN font. Ground
   noise is GLSL; the environment is an analytic fresnel term.
9. **No `html { font-size: 62.5% }`. No `px` type sizes.**
10. **No `Math.random()` anywhere** — in `src/core/` it fails `boundary.test.js`, and in the renderer
    it breaks replay fidelity (§6.7).
11. **No per-frame allocation**, no `.map`/`.filter` closures in `useFrame`, **no `setState` from
    `useFrame`.**
12. **No purple/violet/cyan tech gradient. No `#00FF__`.** Two families, one accent.
13. **No pure `#000`, no pure `#FFF`**, including type.
14. **No 3D text.** No `TextGeometry`, no Troika. All typography is DOM.
15. **No scroll.** The page is exactly one viewport, `overflow: hidden`.
16. **No lorem ipsum, no placeholder copy.** Every string is in §2.
17. **No "Made with React Three Fiber" badge, no tech-stack chips on the page.** The stack goes in
    the Devpost Technologies field.
18. **No warning language, ever** — not for perf degrade, not for the capacity cap, not for a small
    viewport. The `OBSERVED` tag publishes a fact; it does not raise an alarm.
19. **Never drop the frame rate to keep the grain count.** Drop the emission rate. Always.
20. **Do not move the jitter after the group** to make the arms "more organic" (§3.1).

---

## 12. Flags for the Crew Chief — three additions and two overrides

**These are decisions for you, not for pc-frontend. Everything above is buildable as written.**

**12.1 — the Invocation is missing from PLAN.md, and I think that is the one real gap.** (§4.1)
PLAN.md's beat 1 requires the judge to move the cursor before anything happens. A judge who lands on
the live URL sees an empty dark plane, and design-craft §7 says the first screen must state what this
is **visibly, without interaction**. It also makes the thumbnail hand-caught rather than reproducible.
**Cost ≈ 0.10 h**, because T-14's replay machinery already does the work — the Invocation is that
machinery pointed at a constant path. **Strong recommendation.**

**12.2 — `REPLAY` needs a touch control.** (§9.1)
PLAN.md's beat 2 (the print does not change) is bound to the `R` key, which does not exist on a phone.
Criterion 3 names *"responsiveness"*. **Cost ≈ 0.05 h** — one button reusing the existing handler.
**Strong recommendation.**

**12.3 — `SWEEP` is not on the board.** (§8.11)
Needed for engagement (a judge who likes their kolam wants a second go) and for screenshot #3.
**Cost ≈ 0.05 h** — one uniform and a count reset. **Nice to have; cut-safe.**

**Proposed trade, which does not touch the must-have set:** 12.1 + 12.2 + 12.3 total **≈ 0.20 h** and
should displace **T-15 (`?fold=6`)** and **T-16 (settle-bounce refinement)** — PLAN.md's own cut-1st
and cut-2nd. `?fold=6` is already fully captured by a passing test, and the bounce refinement is
invisible at grain scale. This keeps T-01 → T-14 untouched.

**12.4 — override, minor: camera pitch.** PLAN.md says "raking ~35°". §6.2 specifies **38.5°** with
the framing arithmetic behind it. Use 38.5° from T-02 onward so nothing is reframed later.

**12.5 — override, resolved not contested: the perf-degrade tone.** PLAN.md displays the live grain
count under the `OBSERVED` tag; I had written "never surface a downgrade." Both hold: the count is
published as a **neutral tagged fact in the colophon**, never as a warning, a toast, or a modal
(§8.14, §11.18). No conflict remains.

**Two things I did not have to override, worth saying:** the closed-form vertex shader is a better
substrate than the instanced-mesh simulation I first specced, and the core-drawn SVG fallback is
better than the screenshot fallback I first specced. Both are adopted as PLAN.md wrote them.

**One dependency note:** §6.6's ground shader and §6.5's grain shader between them remove every use
of `@react-three/drei`, so PLAN.md §5's probation resolves to **remove it at T-22** — production deps
land at **7** including the two `@fontsource` packages.
