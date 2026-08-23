# IDEAS — 3D Websites Hackathon

Strategist, **Sun 23 Aug 2026, 17:49 IST**. Reads on top of `.crew/ANALYSIS.md` — the
**6-hour total envelope (4 h build / 2 h ship)** and the three abandon gates in ANALYSIS §6 bind
every candidate below. Register is **Human** (rule 34, ANALYSIS §2).

**Constraints every candidate honours, from ANALYSIS §4 and §5:**
- All geometry generated **in code**. No Blender, no Sketchfab, no GLTF download (8 GB M1, one heavy
  thing at a time — and procedural is the originality edge against a field of downloaded models).
- **React Three Fiber + Vite + Vercel**, static, no backend, no API key, no sponsor SDK
  (design-craft §5, rule 25).
- One input verb, understood in 5 seconds, no instructions panel, works on touch (rule 3, N=1).
- Ships inside a deliberate **site frame** — real title type, one concept line, control hint,
  colophon, reduced-motion toggle, WebGL-unavailable fallback (rule 26; design-craft §4, §6, §7).
- Walking-skeleton deploy is task one, checked signed-out (rule 22).

**Note on rule 32:** none of these are agents — this rubric contains no agency, autonomy or impact
criterion, so the three agent tests do not apply. The live tests for this event are the **slop check**
(ANALYSIS §5, kill-risk 2) and **N=1** (rule 3), and each candidate is scored against both.

---

## Candidate 1 — **Threshold** ⭐ RECOMMENDED

*(A kolam is drawn in rice powder on the doorstep at dawn, every morning, and walked over by
midday. The English word carries both meanings at once — a doorway, and a limit.)*

**One-question pitch (rule 0):**
> **What if one dragged stroke became an eightfold rangoli you could walk around?**

**Hero mechanic, named as a proper noun (rule 11): the Eightfold.**
A dihedral-group transform — one cursor path, eight mirrored and rotated copies, resolved every
frame as rice powder that falls, bounces once, and settles into wet dark stone.

**Signature moment — the six seconds a judge screenshots (design-craft §1):**
The cursor drags a single arc across the centre. Eight arcs bloom out of it at once, symmetric before
the hand has finished moving. The powder falls through a low warm key light, each grain catching it,
and settles. **The screenshot frame:** an eightfold pattern half-complete on near-black wet stone,
one arc still mid-fall, the settled grains glowing warm against the dark.

| Criterion | The specific feature that earns it (rule 1) |
|---|---|
| **Visual Design** | Symmetry does the composition work for free — the frame is centred and balanced before anything is tuned. One warm emissive palette on near-black wet stone, a single low key light, bloom, shallow depth of field. Typography earned in the site frame's title plate. |
| **Creativity & Originality** | Procedural symmetry-group generation of a domestic Indian ritual object. Appears nowhere on the slop list (ANALYSIS §5) and, at a US high-school-organised event, almost certainly nowhere in the field. |
| **UX & Interactivity** | One verb: drag. Zero instructions — the eightfold response *is* the tutorial, delivered on the first millimetre of movement. Identical on touch. Complete at N=1. |

**Slop check:** passes. Not a portfolio hero, not a scroll-particle logo, not a low-poly island, not
a pedestal model, not a solar system.
**N=1 check:** passes — one person, one cursor, no login, no second user, no explanation.

**Reuses vs builds new:** reuses **pitstop's** static-single-page deploy shape and the Pit Crew
deploy path (rule 22). Everything else is new. Prior work is legal here (rule 33 grep found nothing)
but there is no 3D asset in the portfolio to reuse — stated plainly in ANALYSIS §4.

**Honest hours — 4.0 build, inside 10–15 h/wk real capacity already spent on BWMI and ATA:**

| Block | h |
|---|---|
| Vite + R3F scaffold, Vercel walking-skeleton deploy, signed-out check | 0.50 |
| **the Eightfold** core — dihedral D4 point-set transform, pure function, seedable | 0.75 |
| Instanced powder particles + settle animation | 1.25 |
| Lighting / palette / bloom / DOF composition pass | 1.00 |
| Site frame + reduced-motion toggle + WebGL fallback | 0.50 |
| **Build total** | **4.00** |

Cut order if the clock bites: settle-bounce physics → depth of field → the guide-dot underlay.

**Main risk, plainly:** instanced particle count. Too many grains and it dies on a judge's
integrated-graphics laptop, which zeroes all three criteria at once (kill-risk 1). Mitigation: a
fixed instance budget (~20 k), zero per-frame allocation, and a measured-frame-time degrade that
drops the count rather than the frame rate. Second, smaller risk: it can read as a drawing toy rather
than a website — the site frame exists to answer that (rule 26).

---

## Candidate 2 — **Shirorekha**

*(The horizontal line across the top of a Devanagari word. Letters do not sit on a baseline in this
script; they hang from that line.)*

**One-question pitch (rule 0):**
> **What if a word's letters actually hung from the line they're written on?**

**Hero mechanic, named (rule 11): the Shirorekha.**
The top line rendered as a solid lit beam. Extruded letterforms hang from it on constraints and
swing.

**Signature moment:** you grab the beam and tilt it. The letters swing on their hangers, knock into
each other, settle — and for one frame, from the new angle, the word is legible again.
**The screenshot frame:** extruded Devanagari letterforms hanging under a raking light, long shadows
thrown across the ground plane, one letter still mid-swing.

| Criterion | The specific feature that earns it (rule 1) |
|---|---|
| **Visual Design** | The only candidate that earns the criterion's literal word **"typography"**. Raking light, long cast shadows, heavy extrusion depth, a two-colour palette. |
| **Creativity & Originality** | A typography piece at a 3D hackathon, built on a real structural fact about a script most of the field cannot read. Not on the slop list. |
| **UX & Interactivity** | One verb: drag the beam. Physical response is self-explaining. Touch-identical. |

**Slop check:** passes. **N=1 check:** passes.

**Reuses vs builds new:** same reuse as candidate 1 (deploy shape only). All new.

**Honest hours — 4.0 build, with no slack:**

| Block | h |
|---|---|
| Scaffold + walking-skeleton deploy | 0.50 |
| **SVG-path → 3D extrusion pipeline for a fixed word set — the risk block** | 1.50 |
| Hanging constraints + swing + collision settle | 0.75 |
| Lighting / shadow / palette pass | 0.75 |
| Site frame + reduced-motion + fallback | 0.50 |
| **Build total** | **4.00** |

**Main risk, plainly:** Three.js `TextGeometry` does not do complex-script shaping — it will mangle
Devanagari conjuncts and matras. The mitigation (fix the word set at two or three words, pre-convert
to SVG paths in Figma, extrude the paths) is sound, but it is **1.5 h and it sits in the first half of
the budget**. If it stalls, there is nothing on screen at hour 2 and the abandon gates trigger with
zero to submit.

---

## Candidate 3 — **Monsoon**

**One-question pitch (rule 0):**
> **What does a monsoon look like from inside the cloud?**

**Hero mechanic, named (rule 11): the Break.**
A single raymarched fullscreen shader — no geometry, no assets, under 100 KB. The cursor pushes the
wind; scroll moves time of day.

**Signature moment:** the cloud shears, and the light flips from bronze pre-storm to that flat
green-grey, and the first drops fall.
**The screenshot frame:** volumetric cloud lit bronze from below, one hard shear line through it.

| Criterion | The specific feature that earns it (rule 1) |
|---|---|
| **Visual Design** | Highest ceiling of the three by a distance — a good raymarch out-classes any geometry build, and holds 60 fps on a tuned step count. |
| **Creativity & Originality** | Not on the slop list. |
| **UX & Interactivity** | **Weakest of the three.** A shader with a cursor parameter is thin against "quality of user interactions", and it is the candidate most likely to read as a Shadertoy demo rather than a website. |

**Slop check:** passes. **N=1 check:** passes, but shallowly.

**Honest hours — 4.0 nominal, and the middle number is the one I don't believe:**
scaffold + deploy 0.5 · **shader authoring 2.5 (genuinely unbounded)** · site frame 0.5 · fallback 0.5.

**Main risk, plainly:** shader authoring has no floor. Four hours can end in something muddy with no
recoverable frame, and there is no partial-credit state — a half-tuned raymarch is not a screenshot.

---

## Ranking — with the single fact that decides each

**1. Threshold** — **the deciding fact: it is the only candidate whose visual quality is guaranteed
by mathematics rather than by craft hours.** Eightfold symmetry is beautiful before anything has been
tuned, so a forced stop at hour 3 still leaves a screenshot-able frame on a public URL. Under a
6-hour envelope with two hard abandon gates (ANALYSIS §6), a guaranteed floor beats a higher ceiling
every time.

**2. Shirorekha** — the deciding fact: it is the only candidate that earns criterion 1's literal word
"typography", **but its riskiest block sits in the first half of the budget**, so a stall there leaves
nothing on screen at all. Second by risk placement, not by concept.

**3. Monsoon** — the deciding fact: shader authoring has no floor, only a ceiling, and this event's
gates punish variance rather than modest ambition.

**Recommended pick: Candidate 1, Threshold.**

---

## Deliberately not proposed

Named here so pc-architect does not rediscover them as fresh ideas. These are the saturated
categories from ANALYSIS §5 (rule 32 slop check, Caspian precedent): the 3D developer-portfolio hero ·
the scroll-driven particle field that assembles into a logo · the low-poly floating island with
ambient music · a downloaded model on a rotating pedestal · a solar system. Each is capped at a 3 on
Creativity & Originality, which is a third of the score.

---

**Rules cited across this document:** 0, 1, 3, 11, 22, 24, 25, 26, 32, 33, 34, 36.
**Design-craft:** §1 signature moment · §2 "What if…" framing · §3 performance is design ·
§4 resilience · §5 stacks that won · §6 accessibility early · §7 the 10-second gallery read ·
§8 anti-patterns.
