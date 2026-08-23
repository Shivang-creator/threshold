# Decisions — three-d-demo

**2026-08-23 17:55 · GATE 0 (go/no-go): GO as a rehearsal.** Shivang asked for a full run-through
to see the system's output. Strategist's economics stand and are not overridden: EV ~$1, 6h cap,
and the hard abandon gates below remain in force for any real execution.

**2026-08-23 17:55 · GATE 1 (idea): Threshold** — the kolam Eightfold piece. Accepted as
recommended, on the deciding fact that symmetry guarantees a screenshot-able frame even under an
early forced stop.

**2026-08-23 17:56 · GATE 2 (plan): pre-approved for this run.** Shivang: "run through it, do
everything you can do without me." Build proceeds without pausing at G2. Gates 3 and 4 (freeze,
submit) still report to him; **no agent submits anything.**

## Standing orders
- Hard abandon gates from ANALYSIS §6 remain: skip if BWMI (28 Aug) slips; drop if All Things
  Agentic is not at walking skeleton by 30 Aug; submit by 31 Aug 22:00 or abandon; touch nothing
  on 1 Sep.
- Register: HUMAN. No metrics in prose; a perf number may appear in the Technologies field only.
- All geometry generated in code. No Blender, no downloaded models (8GB machine, one heavy thing).
- Static deploy only. No backend, no API keys, no accounts.

**2026-08-23 19:05 · Crew Chief accepts pc-designer's §12 trade.** In: the Invocation (~0.10 h,
reuses T-14's replay machinery pointed at a constant path), a touch control for REPLAY (~0.05 h,
the `R` key does not exist on a phone), and SWEEP (~0.05 h). Out: T-15 (`?fold=n`) and T-16
(bounce refinement) — the architect's own cut-1st and cut-2nd, both below the freeze line.
**Reason:** without the Invocation a judge landing on the live URL sees an empty dark plane. On a
rubric that is one-third Visual Design and judged by a fast visual pass, an empty first screen is
the most expensive possible failure. Net hours unchanged; nothing above the freeze line is touched.

**2026-08-23 19:05 · Camera pitch is 38.5°** (DESIGN §5, supersedes PLAN's approximate ~35°).

**2026-08-23 18:58 · Deploy facts.** LIVE: https://three-d-demo-shivcreates.vercel.app (200).
Vercel ssoProtection was `all_except_custom_domains` and has been disabled for this project.
⚠️ **`three-d-demo.vercel.app` returns 200 but is an UNRELATED stranger's project** (Cesium app,
title "threed-demo"). Never submit it. Always verify an alias serves OUR title, not just that it
returns 200.

**2026-08-23 19:40 · Crew Chief resolves pc-frontend's two T-08/T-09 questions.**

1. **aTint/aSize — ship the shader-side phase-derived approximation.** Determinism is preserved
   (aPhase is itself deterministic and part of the print), the visual difference is negligible, and
   changing the core's buffer layout at hour 2 of a 4-hour build would invalidate the 12 golden
   vectors and force a re-verify of the shader. DESIGN §6.7's requirement is satisfied in effect,
   not in mechanism. **Scribe must not claim per-grain seeded tint/size in the writeup.**

2. **`_lastPoint`/`_carry` — working, but it does NOT ship as-is.** The renderer reaching into a
   core object's documented-internal fields is precisely what pc-red-team is built to flag, and it
   contradicts the clean-boundary claim that is this build's headline. It is not wrong today
   (read/reset only, never touching origin/birth/phase/count/cursor/print) so it does not block the
   composition pass. **Folded into T-22:** pc-backend adds a public `resetStroke(buffer)` to
   `core/grains.js` with its own named test, and pc-frontend switches to it. If the clock kills
   T-22, the writeup discloses the internal access rather than hiding it.

**Signature frame verified** — `.crew/deliverables/signature-frame.png` reviewed by the Crew Chief:
eight congruent arcs, mirror-exact, warm powder on near-black. The mechanic works. What is missing
is entirely T-11/T-12 scope: no ground shading, no composition, no site frame.

**2026-08-23 20:15 · GATE (design review) · T-11 REJECTED by Crew Chief.**
Compared `composition-before.png` and `composition-after.png` directly. The after is a regression
on Visual Design, which is one of only three criteria:
- The whole frame is washed orange-brown. DESIGN §1 specifies **near-black wet stone**
  (STONE_900 `#06080A`); the after reads roughly `#3a1f10` across most of the field. The palette's
  entire warm/cool thesis depends on the powder being the only warm thing in frame.
- The lamp's ground projection is a large bright blob in the lower right that **competes with the
  kolam for the eye** and breaks the centred composition DESIGN §3.3 specifies. The 2.5 clamp
  reduced it; it did not solve it.
- The before frame is closer to the design intent than the after. That is the definition of a
  failed pass.

pc-frontend was right to set the row to `review` and right to flag the deviation, but understated
it as "meaningfully improved" — it is not improved.

**Action:** pc-designer owns the fix, with authority to set the numbers directly (it wrote the
spec). Target: keep the ground *present* (texture, sheen, falloff) but return the field to
near-black and get the lamp hotspot out of the visible disc. If it cannot be resolved inside the
budget, reverting `Ground.jsx` to the T-02 unlit plane is an acceptable ship state — the before
image proves that reads well.

**2026-08-23 21:05 · T-11 SIGNED OFF.** Crew Chief reviewed `composition-fixed.png` directly.
Accepted, and it is better than the pre-T-11 frame: the stone now has visible texture and reads
cool, the kolam is the only warm thing in the picture, the lower-right blob is gone, and the
composition is centred. Full account in `outbox/T-11-review.md`.

pc-designer found the root cause was its own DESIGN §6.6 formula, not pc-frontend's
implementation: the lamp was added to the ground **independently of albedo**, which is fog rather
than light, and the specular term at ~2.5 linear was itself the blob — roughly 10x Bloom's 0.28
threshold. pc-frontend's `min(fall, 2.5)` clamp was the right instinct against the wrong variable
and is now deleted as unnecessary. `KEY_POS`/`KEY_INT` deliberately untouched so the grains are
not re-lit.

**Rule this leaves behind, for the vault: a light term not multiplied by an albedo is fog.**

Also recorded: `GROUND_AMB = 15.0` looks absurd and is correct — ACES + exposure + vignette
attenuate ~12x, so a value authored at 1.0 lands at `#030101`, pure void. pc-designer's own first
fix did exactly that and it caught the overshoot only by sampling pixels rather than looking.
**Measure the rendered frame; do not eyeball tone-mapped values.**

Known limit, disclosed: the kolam differs slightly between the three comparison PNGs because the
scripted drag is wall-clock timed rather than frame-locked. The ground comparison is sound; the
powder is not pixel-identical.
