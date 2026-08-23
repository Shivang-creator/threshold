# T-11 review — the composition pass, re-fixed

**Verdict: fixed in place. I did not take the revert.** `Ground.jsx` still runs the §6.6 wet-stone
shader; `src/render/ground.frag.js`, `lightRig.js` and DESIGN §6.6 all changed. The T-02 unlit plane
was the acceptable fallback and I did not need it.

## The rejection was right, and the fault was mine, not pc-frontend's

I looked at both frames before touching anything. Every point in the Crew Chief's assessment holds:
the after frame is washed orange-brown, the lower-right blob competes with the kolam, and the before
frame is closer to my design intent than the after. That is a failed pass.

But pc-frontend implemented **my** spec correctly. The bug was in DESIGN §6.6's own GLSL, which I
wrote. The original block added the lamp to the surface *independently of the stone's albedo*:

```glsl
vec3 col = uStone
         + uKeyColor * spec * fall
         + uKeyColor * fall * 0.06     // <-- this is fog, not light
```

Near-black wet granite (`--stone-800`, ~0.5% linear reflectance) cannot return the lamp's own colour
at 6% of full intensity however close the lamp gets. Because that term ignores albedo it scales with
`fall` alone, so it washes the whole field; and the specular term, at amplitude ~0.45 × `fall` ~5.5 ≈
**2.5 linear**, is nearly ten times Bloom's `0.28` threshold — that term *by itself* was the blob.

**pc-frontend's `min(fall, 2.5)` clamp was the correct instinct against the wrong variable.** It
attacked the falloff, which was fine; the defect was the missing albedo multiply. Its derivation of
the hotspot at world `(0.86, 0, 1.45)` was also correct — I re-derived it independently and got
`(0.864, 0, 1.447)`, which projects to NDC y = **-1.19**, i.e. *below the bottom of frame*. That is
worth recording: the visible blob was never the specular peak, it was the peak's **skirt** amplified
by a 5.5× pool. Moving the lamp would not have fixed it.

## What changed

1. **The lamp is multiplied by the albedo it lands on** — `albedo * uKeyColor * pool * (...)`. This
   is the whole fix. The ground's brightest in-frame pixel is now ~0.02 linear instead of ~1.4, an
   order of magnitude *below* Bloom's threshold: the ground now physically cannot bloom at any lamp
   distance. **pc-frontend's `fall` clamp is deleted, and is no longer needed.**
2. **`GROUND_GLINT = 0.02`** (was effectively 0.5). This term alone was the blob. At the shipped
   value the whole term peaks near 0.003 linear even if a later camera change swings its mirror peak
   into frame — the failure mode is now closed by magnitude, not by luck of framing.
3. **`GROUND_POOL_CORE = 2.6`** replaces the bare `1.0` in the 1/d² denominator. A point-source
   inverse-square is only valid at d >> source size; the diya's flame is ~0.1 units across sitting
   0.62 above the stone, so the near-lamp region is exactly where the point approximation spikes.
   Pool now runs 3.02 under the lamp to 0.43 at the far edge, instead of 6.50 to 0.47 — same
   directional read, half the spike.
4. **`GROUND_AMB = 15.0`** — the ambient gain that puts the stone back on its token. See below.
5. **Noise raised 3×/17× → 6×/26×.** At this camera the original frequencies produced blobs large
   enough to read as fog drifting over the stone rather than as the stone's own surface. This was a
   real defect in the fixed frame's first draft and I caught it by looking, not by measuring.
6. **`GROUND_FADE` stayed at DESIGN's original `[9.0, 1.5]`.** I suspected it was too wide to shape
   anything and measurement proved me wrong — with the ambient corrected, this fade is exactly what
   carries the far corner down to `--stone-900`. Recorded because I nearly changed it for no reason.
7. **`KEY_POS` / `KEY_INT` are UNCHANGED.** The Chief authorised me to move them. I did not, and this
   is the deliberate call in the fix: the grains read the same uniforms and already looked right, so
   moving the lamp would have re-lit the powder to fix a bug that was never in the lamp. Nothing is
   reframed and no earlier screenshot is invalidated.

## The counter-intuitive number, called out so nobody "fixes" it

`GROUND_AMB = 15.0` looks absurd. It is not. ACES + exposure 1.05 + the post Vignette together
attenuate this end of the range by **~12×**: authored at `1.0`, `--stone-800` lands on screen as
`#030101` — pure void. My own first attempt did exactly that and I nearly shipped a black plane.
The gain is pre-compensation, not brightness. Author in linear scene units, grade to the token,
verify by sampling the frame.

## Measured, not asserted

All three frames, same seed `4821`, same scripted drag, same 1440×810 viewport. "Brightest
non-kolam" is a full-frame scan with a generous mask over the kolam and its bloom halo
(x 270–1210, y 190–770), so it means *the brightest thing the ground itself puts in frame*.

| | before (T-02 plane) | after (**rejected**) | **fixed** |
|---|---|---|---|
| mean ground | `#07090b` | `#341403` | **`#0a0d10`** |
| mid-field, left of kolam | `#100e10` | `#562406` | **`#0f0f12`** |
| far field, top centre | `#0b0e11` | `#3f1904` | **`#101418`** |
| far-left corner | `#050709` | `#1a0701` | **`#070a0c`** |
| lower-right (the blob's spot) | `#0d0c0e` | `#ff8827` | **`#161213`** |
| brightest non-kolam pixel | `#0f0f12` @ (830,186) | `#94420f` @ (1212,630) | **`#17191e` @ (852,188)** |

Reading the fixed column against the Chief's three objections:

1. **Field returned to near-black.** Mean `#0a0d10`, and it is *cool* — B > G > R, matching the
   palette. The far-left corner is `#070a0c` against `--stone-900 #06080A`: within two levels of the
   token, which is the target the Chief named. The field sits ~3 levels above the before frame — that
   difference is the stone texture, which is the "keep the ground present" half of the brief.
2. **The blob is gone.** The spot that measured `#ff8827` (255,136,39) now measures `#161213`
   (22,18,19) — 1.4× the mean field, near-neutral, no defined edge. It reads as "the light comes from
   over there", which is the composition §3.3 asks for.
3. **The brightest non-kolam pixel is now at (852,188) — upper centre — and it is COOL** (`#17191e`,
   23,25,30, blue-dominant). In the rejected frame it was at (1212,630) — lower right — and warm
   (148,66,15). That single row is the warm/cool thesis being restored: the powder is once again the
   only warm thing in the picture, and nothing on the ground competes with it for the eye.

Ground presence is real, not just dark: texture, an uneven Fresnel sheen strongest at the grazing far
edge, and a 7:1 directional falloff from the lamp side to the far corner.

## Verification

- `npm run build` passes (357 ms). `npm test` **52/52**.
- `src/core/` untouched — latest mtime in that directory is 18:30, before this session started.
- Zero console errors and zero page errors in the capture run.
- **Backtick check.** `ground.frag.js` / `ground.vert.js` / `grain.frag.js` each hold exactly two
  backticks (the template literal's own delimiters). `grain.vert.js` holds six, but four are in **JS**
  comments on lines 12–14, *outside* the literal, which opens on line 38 — legitimate, not a latent
  break. Noting it so nobody "fixes" a non-bug on the strength of a crude grep.

## Honest limits

- **The kolam differs slightly between the three frames.** The scripted drag is wall-clock timed, not
  frame-locked, so grain count at capture varies a little. The ground comparison is sound — that is
  what the table measures — but do not read the powder as pixel-identical across the three PNGs.
- **`?still=1` still does not exist** (T-13/T-14). Until it does, no capture here is a deterministic
  freeze, only a scripted approximation of §3.2's centre-crossing beat.
- **Frame time at the 20,000-grain cap is still unverified** — unchanged from pc-frontend's note; the
  ground shader got slightly cheaper (the clamp and one add are gone, one noise octave is not), but
  that is reasoning, not measurement. Still pc-test-user's job at T-20.
- **Pointer parallax (§6.3) is still not built**, exactly as pc-frontend flagged. Out of this fix's
  scope; still T-14 territory.

## Answering pc-frontend's open question

> *Should the fall-clamp (2.5) ship as-is, or should DESIGN's KEY_INT / ambient-scale be retuned so a
> render-side cap isn't needed at all?*

**Neither.** The clamp is deleted and the rig is untouched. The ambient scale was not merely too
large — the term was structurally wrong, and no value of `0.06` would have been right. DESIGN §6.6 is
rewritten to match the shipped shader, including a section on why its first version was wrong, so the
next person reads the corrected spec rather than rediscovering this.

**The rule this leaves behind:** a light term that is not multiplied by an albedo is fog. If you want
haze, say haze and put it in the post chain.
