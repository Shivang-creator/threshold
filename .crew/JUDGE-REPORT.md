# JUDGE-REPORT.md — T-20, the N=1 judge walk

**Tester:** pc-test-user, simulating one of the 3 named judges (3D Websites Hackathon).
**When:** Sun 23 Aug 2026, 20:28–20:51 IST.
**URL tested:** https://three-d-demo-shivcreates.vercel.app — fresh browser context, no cookies,
signed out, every time. Confirmed live: `200`, no `vercel.com/sso` text, `<title>` matches
(`Threshold — a kolam in rice powder`), matching DECISIONS.md's alias-vs-stranger-project warning
(`three-d-demo.vercel.app` is a different app; not touched).
**Method note:** Playwright's MCP browser couldn't launch (`Chromium distribution 'chrome' is not
found`), so I drove `playwright` (chromium 1.62.1, browsers already cached) directly from Node, per
the task's fallback instruction. Fresh `browser.newContext()` per scenario throughout.
**Process note, not a judge-facing defect:** BOARD.md still shows T-19 (freeze deploy/tag) as
`todo` and `git log` on this machine shows only the T-01/T-02 commit — the working tree has far
more uncommitted work than that. The production URL is live and matches the built feature set
(Invocation, Replay, Sweep, Motion, 20k cap all present and working), so whatever shipped it did
reach Vercel — but there is no `freeze-1` git tag and no `.crew/deliverables/URLS.md` to pin the
exact SHA this report is valid for. Flagging for pc-deployer/Crew Chief, not filing as a judge
defect since the live experience itself is what I'm scoring.

---

## VERDICT: YES — this judge would score it well

**The one reason:** it delivers the "stop scrolling and say wow" moment **unprompted**, inside
about a second and a half of a fresh load, entirely through demonstration with zero instruction
text — and then every load-bearing claim it makes about itself (the eightfold symmetry, the
deterministic replay, the 20,000-grain cap, the reduced-motion print-invariance) survived direct
attack, including a stress test specifically targeting the one code path the build crew itself
flagged as untrusted. I could not break the core guarantee. On a rubric that is one-third Visual
Design, one-third Creativity & Originality, and one-third UX & Interactivity, judged by a fast
visual pass on the live URL, this is a strong entry. The gaps I found are real but all land in
POLISH or a narrow disclosed edge case — none of them cost a point with the judge described in
`verification-craft.md` (90 seconds, mouse or touch, never reads a repo).

---

## The walk, with timestamps

### 1. The 10-second read (screenshot: `01-landing-10sec-read.png`)

Fresh context, 1440×900, `page.goto()`. `domcontentloaded` fired at **1366 ms**; the first
successful `getContext('webgl2'|'webgl')` call landed at **1376 ms**; "Threshold" text was in the
DOM at **1436 ms**. Repeated cold loads on this network varied 0.8–2.7 s to the `load` event
(bundle is 334 KB brotli-compressed — confirmed `content-encoding: br` — the plain-curl 1.19 MB
figure I saw first was a curl artifact from not sending `Accept-Encoding`, not a real transfer
size). `document.body` carries an **inline** `style="background:#06080a"` — confirmed in raw HTML
— so there is never a white flash; the wait, such as it is, reads as an intentional dark beat, not
a broken page.

By the time anything is visible, the page **already says what it is**: "Threshold," the Tamil
sub-line "கோலம் · a doorstep drawing," and one sentence — "One stroke falls as eight. Rice powder
on wet stone — a kolam, the way it is drawn on the doorstep at dawn." A judge reads this and knows
exactly what they're looking at before touching anything. **Pass, clearly.**

### 2. The Invocation — fires unprompted (screenshots: `02-`, `03-`)

Confirmed: with **zero interaction**, a canned stroke plays from t≈0.9s, crosses centre around
t≈1.6–1.7s (visually matches DESIGN §3.3's specified screenshot moment — bloom peaking on
converging arcs), and settles into a symmetric 8-armed "butterfly" by ~t=3s. It never replays
itself — watched it sit idle from t=3s to t=7.5s with no repeat. At t=7.5s exactly one hint faded
in: `DRAG THE STONE`, bottom-right, matching DESIGN §8 row 4 verbatim.

### 3. The N=1 walk — drag, Eightfold, REPLAY, SWEEP, MOTION (screenshots: `04-`, `05-`, `06-`)

Dragged one arc across the centre with the mouse. **Eight congruent mirrored arms appeared live
during the drag**, not after release — the "tutorial" the design claims (§4.3) is real: a single
`pointerdown` alone (no movement) emits 8 grains before the hand moves.

- **REPLAY (`R` key):** noted the print (`9b5ccab5`, 1888 grains), pressed `R`. Screenshot
  `05-after-replay-identical.png` is visually indistinguishable from `04-after-user-drag.png`.
  `window.__threshold.buffer.print` was **byte-identical** before and after. The live region fired
  `"Eight strokes drawn."` This is the strongest beat in the piece and it holds.
- **SWEEP (button):** clicked it. Grains faded to a clean stone (`06-after-sweep.png`), count → 0,
  print → `811c9dc5` — which is exactly `0x811C9DC5`, the FNV-1a offset basis in hex. The
  "empty array returns the offset basis, not a crash" claim from T-05's own test suite checks out
  live, not just in `node --test`.
- **MOTION:** label correctly toggles `MOTION` ↔ `MOTION REDUCED` (state carried by text, not
  colour — DESIGN §9.3's accessibility floor). Behavioural effect verified separately below.

### 4. 390px mobile + CPU/network throttle (screenshots: `07-`, `08-`, `09-`)

`isMobile: true, hasTouch: true`, 390×844, plus CDP `Emulation.setCPUThrottlingRate(4)` and
`Network.emulateNetworkConditions` (~1.6 Mbps / 150 ms latency, a rough 6× proxy). Full `load`
event fired at **2610 ms** under this throttle — slower than desktop but still well inside the
judging budget, and the frame is never blank throughout.

Layout: title plate top-left (20,20 → 293,211), colophon bottom (20,738 → 370,824), inside an
844px-tall viewport — **no overlap, no scroll needed**, matches T-12's acceptance criteria.
Touch parity is real, not cosmetic: a single tap emitted exactly **+8 grains** (1096→1104, the same
tap-alone behaviour as desktop pointerdown). The `REPLAY` button (the touch control DECISIONS.md
19:05 added, since there's no `R` key on a phone) is visible and works — dragged a stroke via
synthetic `Input.dispatchTouchEvent`, tapped `REPLAY`, print matched exactly
(`99f1ce65` before and after).

### 5. Capacity / ring-wrap stress past 20,000 grains — the flagged code path

This was flagged twice by pc-frontend as untrusted under load (`_lastPoint`/`_carry` wrap-split in
`App.jsx`'s `pushWrittenRange`, "genuinely needs exercising past 20000 — it has not been observed
actually wrapping"). I exercised it directly.

**First pass** (dense zigzag, desktop): grain count climbed cleanly batch over batch —
2472, 3864, 5256, … 19368 — then **19368 → 20000, cursor wrapped to 784**. Count stayed pinned at
exactly 20000 through more sustained drawing; a follow-up ordinary stroke afterward advanced the
cursor normally (784→888) with no exception, no console error, no memory blow-up. The colophon's
"20 000 grains" text matched `buffer.count` exactly, formatted with the space-grouped thousands the
design specifies.

I initially misread the *visual* result of this pass as a bug — old-looking petal shapes were still
visible in the corners of a screenshot taken after multiple wraps, which looked like stale GPU data
that should have been overwritten. **I built a cleaner, controlled repro to check myself** before
filing anything (screenshots `10-`, `11-`): swept the stone clean, drew one small, geometrically
distinctive "signature" mark far to one side, confirmed it was on screen, then scribbled a
completely different pattern near the centre only, far past the point where the ring must have
wrapped back over the signature mark's buffer slots (confirmed via `cursor`). **The signature mark
was completely gone** in the final frame — nothing but the new centre pattern remained. The
ring-wrap and its GPU-buffer update are correct; what I saw in the first pass was simply the D4
mirror images of my own off-centre stress stroke reaching into the corners, not stale data. **Verdict:
the flagged code path holds. This is a real, verified pass, not an assumption.**

### 6. Realistic misuse (screenshots: `12-`, `13-`)

All five held with no crash, no console error, no visible corruption:

- **Refresh mid-draw** (pointer held down, never released, `page.reload()`): reloads clean, new
  session, functional immediately.
- **Back button** after navigating away and back: reloads clean (a fresh session/seed, as
  expected — nothing claims cross-navigation persistence).
- **Double-click/double-tap:** two independent one-sample emissions (+16 grains, i.e., 2×8) — no
  duplicate-submit chaos, no double-fire bug.
- **Rapid mashed strokes** (15 fast down-move-up cycles): count climbs steadily, no errors.
- **Resize mid-draw** (1440×900 → 800×1200 while the pointer is still down, mid-drag): no crash,
  canvas stays mounted and responsive, drag continues at the old absolute coordinates without
  complaint, layout re-composes cleanly at the new size (`13-misuse-resize-mid-draw.png`).

### 7. Claim-check: colophon and reduced-motion (screenshot: `14-`)

- **"N grains" (OBSERVED):** checked against `window.__threshold.buffer.count` at every step across
  every scenario above (dozens of checks) — never once mismatched.
- **"print" (GENERATED):** checked for replay-invariance (desktop and mobile), sweep-to-offset-basis
  correctness, and wrap-consistency. Never caught it lying.
- **Reduced motion, print-invariance:** toggled MOTION to reduced, drew a stroke. Grains appeared
  **at their settled position immediately** (t=0 screenshot already shows the finished shape, no
  falling animation) — matches `14-reduced-motion-instant-settle.png`. Two idle screenshots taken
  3 seconds apart were **byte-identical** (`cmp` confirmed), proving the idle camera Breath is
  genuinely fully disabled, not just slowed.
- **Perf claim, corrected methodology:** my first pass measured real rendered FPS via
  `requestAnimationFrame` sampling under CDP's 4× CPU throttle and got an alarming ~4.3 fps
  regardless of grain count (1096 vs 11880 grains, same result) — which would have been a serious
  finding. Before filing it, I checked whether my own headless browser was the confound: it was.
  Playwright's default headless Chromium reports `UNMASKED_RENDERER_WEBGL: ANGLE (... SwiftShader
  Device ..., SwiftShader driver)` — **software rendering**, not a GPU. A blank page under the
  identical throttle and measurement code held 60 fps in that same headless browser, proving the
  ~4 fps was the site fighting software WebGL, not a measurement artifact but also not a normal
  judge's experience. Re-ran everything `headless: false`, which picks up the real GPU
  (`ANGLE Metal Renderer: Apple M1`): **60 fps, rock solid, at the full 20,000-grain cap, under 4×
  CPU throttle.** The perf target holds on real hardware. (Full numbers in the findings below —
  this became finding J-02, not a false blocker, because of one specific gap it exposes.)

---

## Findings, ranked

No BLOCKER. The journey — land, understand what this is, drag, watch the Eightfold, replay it
exactly, sweep it, degrade the motion, misuse it every way I tried — completes cleanly every time.

### HURTS

**J-01 — Cold load leaves the page silent for 1.3–2.7s before anything is legible or interactive.**
*What a confused judge would think:* nothing, actually — the near-black background is deliberate
enough that it doesn't read as broken. But out of a "well under a minute" budget, 1–2.7 seconds
where nothing can be read or touched is a real, measurable tax, and it is slower than the build's
own internal target (DESIGN §8 state 1: "Typically < 600 ms"). *Repro:* fresh context, no cache,
`page.goto()`, watch `domcontentloaded`/first-WebGL-context timestamps (1366 ms / 1376 ms measured;
2610 ms to full `load` under 6×-network + 4×-CPU throttle on mobile). *Smallest fix:* nothing
urgent — the inline dark background already absorbs the worst of it — but if there's budget, code-
split the postprocessing/bloom chain behind the first frame, or preload the font/JS with a
`<link rel="modulepreload">` to shave the bundle-execute gap.

**J-02 — On a WebGL-available-but-software-rendered browser, frame rate collapses to ~5 fps and
nothing in the app detects or routes around it.** *What a confused judge would think:* "why is this
laggy, is my laptop just bad" — and score UX/Interactivity down without realizing the app could see
this coming. *Why it matters specifically for this build:* DESIGN.md names "school-managed laptops
with restricted WebGL" as **kill-risk 1** and built an entire NoWebGL SVG fallback for it — but that
fallback only triggers when `getContext('webgl')` **fails**. Some locked-down machines instead
succeed at WebGL but silently fall back to software rendering (SwiftShader/llvmpipe), which is
exactly what I found in headless Chromium: 4.0–4.8 fps **regardless of CPU throttle level and
regardless of grain count** (1096 grains and 11880 grains gave the same ~4.3 fps), which tells you
the bottleneck is the postprocessing chain (bloom/vignette/film-grain), not the grain shader — so
the existing perf-degrade mechanism (`app/perf.js`, which only thins grain emission spacing) cannot
help here at all. On real GPU hardware this is a non-issue (verified 60 fps solid, 20,000-grain
cap, 4× CPU throttle, Apple M1 via Metal) — flagging only because the one hardware class the design
doc explicitly worried about has an unguarded path through it. *Repro:* launch Chromium
`headless:true` (default) or force `--use-gl=swiftshader`; check
`gl.getExtension('WEBGL_debug_renderer_info')` for `SwiftShader`/`llvmpipe`/`Software` in the
renderer string. *Smallest fix:* after the existing WebGL-availability probe succeeds, also read
`UNMASKED_RENDERER_WEBGL` once; if it matches a software-renderer pattern, route to the same
`NoWebGL` fallback already built, or at minimum disable the postprocessing chain.

### POLISH (not filed to BOARD — noticed only on a second, accessibility-focused pass)

- **Keyboard-only drawing is not implemented** (DESIGN §9.2's arrow-keys + Space mechanic). Focused
  the canvas directly and sent 10×`ArrowRight` + 5×`Space`: grain count did not move. This matches
  BOARD.md's own note that it's "cut-order item 1" and was accepted as a known cut under the clock
  — not a surprise, and very unlikely to matter given the judging format (a 90-second mouse/touch
  visual pass, not a keyboard accessibility audit).
- **A keyboard Tab cycle briefly lands on `<body>` (nothing focused)** between the `SWEEP` button
  and the canvas, in the specific state where both `REPLAY` and `SWEEP` are `aria-disabled` (buffer
  just swept). Cosmetic; only found by deliberately tabbing through in a disabled-buttons state.

---

## Screenshots (this report, `.crew/deliverables/judge-walk/`)

`01-landing-10sec-read.png` · `02-invocation-centre-crossing.png` · `03-invocation-settled.png` ·
`04-after-user-drag.png` · `05-after-replay-identical.png` · `06-after-sweep.png` ·
`07-mobile-390px-throttled.png` · `08-mobile-touch-drag.png` · `09-mobile-touch-replay.png` ·
`10-capacity-signature-mark-before.png` · `11-capacity-signature-mark-gone-after-wrap.png` ·
`12-misuse-refresh-mid-draw.png` · `13-misuse-resize-mid-draw.png` ·
`14-reduced-motion-instant-settle.png`

---

## STATUS block

STATUS: done
FILES: /Users/shivang/Projects/three-d-demo/.crew/JUDGE-REPORT.md, /Users/shivang/Projects/three-d-demo/.crew/deliverables/judge-walk/ (14 screenshots), /Users/shivang/Projects/three-d-demo/.crew/BOARD.md (2 rows appended: J-01, J-02)
SUMMARY: N=1 judge walk of the live URL (fresh context, signed out, throughout). Verdict: yes, scores well — the Invocation delivers an unprompted wow inside ~1.4s, the drag→Eightfold→REPLAY→SWEEP→MOTION journey works end to end, and the one code path the build crew explicitly flagged as untrusted (ring-wrap past the 20,000-grain cap) survived a controlled attack (a signature mark drawn, then provably overwritten and gone after forced wraps). All 5 misuse scenarios (refresh mid-draw, back button, double-tap, rapid strokes, resize mid-draw) held with zero crashes/console errors. No BLOCKER found. Two HURTS filed: J-01 (1.3-2.7s cold-load silence before anything is legible, vs DESIGN's own <600ms target) and J-02 (a real gap in the kill-risk-1 defense — WebGL-available-but-software-rendered browsers get ~5fps that the existing perf-degrade and NoWebGL-fallback mechanisms don't catch, verified via WEBGL_debug_renderer_info + a controlled headless-vs-headed GPU comparison; real-GPU hardware holds 60fps solid at the full 20k cap under 4x CPU throttle). Two POLISH items noted in-report but not filed (keyboard-only drawing unimplemented — a known, accepted cut per BOARD.md; a minor Tab-order gap in a disabled-buttons state).
QUESTION: none — recommend Crew Chief route J-01/J-02 to pc-frontend for triage against the remaining ship-block budget (T-22); neither blocks a submission as-is.
