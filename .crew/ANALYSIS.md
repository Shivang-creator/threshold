# ANALYSIS — 3D Websites Hackathon

Strategist run **Sun 23 Aug 2026, 17:49 IST** (`date` confirmed, rule 23). Runway to deadline:
**8 d 09 h 41 m** (→ Tue 01 Sep 2026, 03:30 IST).

Inputs read in full: `.crew/BRIEF.md` (Scout, verified 23 Aug 12:12 UTC) ·
`BRAIN_DIGEST.md` (compiled 23 Aug 16:10 IST, source-hash `43ea231f…`, **not stale**) ·
`strategy-craft.md` · `design-craft.md` · `writing-craft.md`.
`DECISIONS.md` and `BOARD.md` are empty templates — no standing orders override anything below.

---

## 0. The headline call, up front

**Enter — but only as a system rehearsal, under a 6-hour total hard cap, and only if
Build What Moves India and Proof of Possible are both submitted by Thu 28 Aug 20:00 IST.**
If either slips, skip this event entirely and say nothing more about it.

The financial case is roughly **$1 of expected value**. I am not going to dress that up. The case
for entering is that this is the cheapest complete end-to-end rehearsal of the crew that exists on
the runway — zero backend, zero API keys, zero sponsor SDK, static deploy, and an evaluation
channel (a live URL) that is unusually honest about what it scores. The case *against* is stated in
§3 and §4 and it is not weak.

**Standing order that matters more than any idea in `IDEAS.md`:** this entry is submitted **no
later than Mon 31 Aug 22:00 IST** — 5 h 30 m of slack — or it is abandoned without ceremony.
Nothing about this event is touched on 1 Sep. All Things Agentic closes at **1 Sep 05:30 IST**,
two hours after this one, and a $30 first prize must never be allowed to damage that entry
(rule 28 — price the panel before spending rigour).

---

## 1. The rubric, with evaluation channels (rules 1, 36)

No percentage weights are published (`get_judging_criteria`: three criteria, 1–5 scale, no tracks).
Nominal weight is therefore **equal — 5 points each, 15 total**. The organiser's own prose supplies
the de-facto weighting: *"judging is based primarily on creativity, aesthetics, and overall
experience. Technical complexity is optional. A beautiful and creative project can outperform a
highly technical one."*

| # | Criterion | Nominal weight | De-facto read | **Evaluation channel — what the judge actually looks at** |
|---|---|---|---|---|
| 1 | **Visual Design** — "composition, color, lighting, typography, animations, overall presentation" | 5 / 15 (33%) | The dominant criterion. Listed first, defended by the tiebreak prose, and the only one a fast pass can score confidently. | **The live URL's first paint**, then the **3 required screenshots**, then the **Devpost gallery thumbnail**. Not the video (optional → largely unwatched at this judge:field ratio). Not the repo. |
| 2 | **Creativity & Originality** — "unique… fresh and memorable" | 5 / 15 (33%) | Scored before the description is read. Decided by the title, the tagline, and the first frame. | **The gallery card** (title + tagline + thumbnail) and the **first 10 seconds of the live site**. A judge forms this verdict pre-reading. |
| 3 | **User Experience & Interactivity** — "navigation, responsiveness, engagement, quality of interactions" | 5 / 15 (33%) | Scored by a judge alone, on their own machine, in 30–60 seconds, at N=1 (rule 3). "Responsiveness" reads as *device* responsiveness, so mobile counts. | **The live URL under the judge's own cursor or thumb.** Nothing else touches this criterion. Not the repo, not the description. |

**Channels that carry zero score and must consume near-zero hours:** source code (required as a
link, but 3 judges cannot read code for a 1,367-registered field in a 32-hour window), the demo
video (explicitly optional), backend rigour, tests, architecture. There is no honesty criterion, no
technical-execution criterion, and no impact criterion. **This is the inverse of every rubric in the
scoreboard** — the loss column is full of artifact-judged engineering events. Do not bring that
build allocation here (rule 36: the method wins).

### The scoring arithmetic that decides the build

Three unweighted 1–5 criteria means every submission lands between 3 and 15, and in a fast pass
across a large field, scores compress hard into 3s and 4s. Competent-and-pleasant scores 4/4/4 = 12
and finishes mid-table. **The podium is decided entirely by who collects 5s, and a 5 is never
awarded for being good at everything — it is awarded when one thing is unmistakable.** That is the
arithmetic form of design-craft §1: build the signature moment first and the rest around it.

---

## 2. Register call (rule 34): **HUMAN**

Decided by these rubric lines, in order:

- *"Technical complexity is optional"* — kills **Rigour** outright. The register table's rigour
  trigger is "technical-execution-weighted rubrics." This rubric explicitly de-weights it. A
  ScanProof-shaped stats writeup here reads as someone who did not understand the brief.
- *"unique… fresh and memorable"* and *"polished, appealing, visually impressive"* — aesthetic-response
  criteria, scored by how the reader *feels*. That is the Human register's mechanism
  (TinyStep won IncludAI with **zero numbers**).
- No honesty criterion and no engineering criterion → **no Hybrid**. Hybrid requires the rubric to
  name a human problem *and* an engineering/honesty criterion (BWMI, Proof of Possible). This one
  names neither.

**Operating instruction for pc-scribe:** the description field is not a writeup, it is **the caption
under the screenshot**. Its only job is to make a judge click the live link, then remember the
project an hour later when the three of them compare notes. Artist's statement, not engineering
report. Zero metrics in the prose.

**One carve-out, and only one:** a performance number (60 fps, first paint under 2 s) is permitted —
but it goes in the **Technologies used** field, never in the prose. Performance is design here
(design-craft §3), so it is worth *stating*; it is not worth *arguing*.

**Rule 37 applies with no exception:** AI tools disclosed by name, per contribution. The rules permit
AI tools and assets by name (ChatGPT, Claude, Gemini, Copilot, Cursor), so disclosure costs nothing
and the undisclosed-`.claude/` integrity attack precedent costs everything.

---

## 3. Field-size read and realistic odds

| Quantity | Value | Confidence |
|---|---|---|
| Registered participants | **1,367** | Observed (live site, 23 Aug) |
| Submissions | **~40–140** | **Estimated** — gallery unpublished, genuinely unobservable. Free, $55-prize, no-sponsor Devpost events convert registered→submitted at roughly 3–10%. |
| Prizes | 3 ($30 / $15 / $10) | Observed |
| Podium probability, uninformed | **~2–7%** | Derived from the estimate above |

**What placement realistically requires:** at ~100 submissions the podium is the top ~3%. In a field
where AI-generated assets, templates and tutorials are *explicitly permitted by rule 2 of the event*,
the modal submission is a tutorial derivative. Clearing the median is cheap. Clearing the top three
requires being **the one entry all three judges independently remember and mention to each other** —
a memorability contest, not a craft contest, and winnable in 4 hours by concept selection far more
than by build hours.

**Rank-by-field-size (the Paritok correction) does not rescue this event.** The correction says
*small field + unfair fit* beats *big + generic* — Headroom placed 2nd in a 181-entrant field on
sponsor-SDK depth. This is **large field + no unfair fit**: no 3D or WebGL asset in the portfolio, no
sponsor relationship to exploit (there are no sponsors), no domain advantage the rubric rewards. Read
literally, the correction argues for *skipping* this and protecting All Things Agentic. The only
genuine unfair fit available is cultural specificity of subject matter — see §5 and candidate 1 in
`IDEAS.md` — and that is a real edge, but a thin one.

**Two listing observations that bear on strategy:**

1. **Public voting opened 25 Jul and closes 3 Sep, but the project gallery is still unpublished on
   23 Aug.** Voting on an unpublished gallery is incoherent. No popular-choice prize exists — all
   three prizes are judge-decided "Best Overall 3D Website" ranks. **Call: spend zero hours on
   vote-farming.** Whether votes feed the judges is UNVERIFIED and unactionable either way.
2. **First-time organiser, no track record** (1 hackathon under this host). Prize payment is
   unverifiable (rules 6, 28). The organiser is identifiable — real school-district email, three
   named judges from a real findable school — so this is *zero history*, not a burner listing. At
   $55 the payment risk is not worth a sentence of worry; it is worth capping hours, which §6 does.
3. Recorded, not blocking: the `in_person_type: "High School"` metadata tag contradicts the binding
   eligibility text ("All students"). Per *Read the Rules tab, not the sidebar*, the Rules-tab text
   governs and Shivang is eligible. The tag stays on the record as an UNVERIFIED post-hoc-challenge
   risk, which at $55 is not worth pricing.

---

## 4. Reuse-map hits — and the honest finding

**Prior work is legal here.** Rule 33 grep run by Scout across the full rules text: `"newly created"`,
`"during the submission period"`, `"minor changes"` — **none of the three phrases appear anywhere.**
No build-window clause, no minor-changes clause. As permissive as listings get.

**And it buys nothing.** Every entry in the reuse map is backend, rules-engine, clinical or
provenance work:

| Reuse-map entry | Maps onto this event? | Verdict |
|---|---|---|
| **pitstop** — single-file vanilla-JS web app + static serve | Partially — the *deploy shape* (one static page, no server) is exactly right | **Take the pattern, not the code.** Vite static → Vercel is simpler than FastAPI-serving-index.html here. |
| **canopy** — habitat/eco build | Possibly some visual work | **Do not touch.** Canopy is the Hack the Habitat (31 Aug) resubmit slot. Double-booking it burns a better-fitting entry. Conflict flagged. |
| **proofprint** — B2 + provenance pipeline; Render deploy | Asset hosting | Not needed. Procedural geometry means there are no assets to host. |
| **deadline-agent · nirog-memory · slept-on · headroom · common-ground · IPL engine · Pehli Baar** | No | Nothing in a design-only rubric touches any of these. |

**Stated plainly: this is a cold build.** The permissive prior-work rule is a finding with no payoff,
and that fact is itself an argument for the hour cap. The only thing genuinely reused is **the Pit
Crew system**, which is the declared purpose of this run.

**Corollary that shapes every idea in `IDEAS.md`:** because there is no asset to reuse and no time to
model one, **generate all geometry in code.** No Blender (too slow, and an 8 GB M1 running Blender
alongside the BWMI/ATA work violates the one-heavy-thing-at-a-time constraint). No Sketchfab
downloads. Procedural is faster to build, near-zero to download, holds 60 fps trivially, **and is
structurally distinct from a field of downloaded models** — it converts a capacity constraint into
the originality edge. Substrate: React Three Fiber + Vite + Vercel, the stack design-craft §5 names
as the safe fast path (rule 25 — the substrate caps the design ceiling).

---

## 5. Kill-risks — the ways an entry dies here

**Kill-risk 1 — it stutters, or it does not load at all.** (design-craft §3, §8; rule 22)
Dominant failure mode, and it zeroes all three criteria simultaneously: a 3D scene at 20 fps scores
as *broken*, not ambitious. Compounding factors specific to this panel — three high-school judges,
plausibly on school-managed laptops with integrated graphics and possibly restricted WebGL. A heavy
GLTF with no progress indicator loses the judge before the first frame: "loading with no progress and
no fallback: judges close the tab."
**Mitigations, all mandatory:** procedural geometry only (no asset download); a named performance
target in DESIGN.md with the named technique that holds it; a WebGL-unavailable fallback frame that
still shows something composed; first paint under 2 s; a real loading state; one throttled-profile
test. Rule 22's signed-out check on the deployed URL is non-negotiable — the Vercel SSO-protection
precedent hid a live site from judges before.

**Kill-risk 2 — submitting the slop category the field has already saturated.** (rule 32's slop
check; the Caspian precedent, where the organiser had publicly named "deadline management" as slop)
With AI assets, templates and tutorials explicitly permitted, and Three.js / Spline / Sketchfab listed
in the organiser's own resources block, the modal entry is predictable. **Named slop categories to
refuse outright:**
- the 3D developer-portfolio hero (spinning object, parallax scroll, glassmorphism, "Welcome to my 3D world")
- a scroll-driven particle field that assembles into a logo
- a low-poly floating island with ambient music
- a Sketchfab model on a rotating pedestal inside a product-page frame
- a solar system

These are not bad ideas; they are *taken* ideas, and Creativity & Originality is a third of the score.
An entry in any of these buckets is capped at a 3.

**Kill-risk 3 — no signature moment; pretty and forgettable.** (design-craft §1, §8)
Per §1's arithmetic, 4/4/4 is mid-table. If the honest answer to "what are the six seconds a judge
screenshots?" is "the whole thing is nice", the idea is not ready and must not be built. Every
candidate in `IDEAS.md` names its moment explicitly and is disqualified if it cannot.

**Kill-risk 4 (cheaper, still real) — the interaction needs explaining.** (rule 3, N=1)
A judge alone, 30 seconds, no onboarding, no second user, no login. If the control scheme is not
obvious within 5 seconds of the cursor entering the frame, UX scores a 3. One input verb, discovered
by doing, no instructions panel required to understand it.

**One shape risk, worth naming:** the event is the *3D **Websites*** Hackathon (rule 26 — demo the
verb, or here the noun, in the event's name). All three candidates are one-screen interactive pieces.
A judge scanning for "a website" may mark down a bare canvas that reads as a Shadertoy demo.
**Shared requirement across all candidates:** the piece ships inside a deliberate site frame — a real
title in real type, one line of concept, a control hint, a credits/colophon line, a reduced-motion
toggle. That frame is a *design deliverable*, not a wrapper, and it is where the "typography" word in
criterion 1 gets earned.

---

## 6. Effort budget — the honest recommendation

### The capacity arithmetic, done properly

Real capacity is **10–15 h/wk in a coursework week** (the 30 h figure was aspirational; three events
were skipped when reality hit). Across 23 Aug → 1 Sep, best case is roughly **13–18 hours total**.
Already committed inside that window:

| Commitment | Deadline (IST) | Priority |
|---|---|---|
| Build What Moves India — Pehli Baar | Thu 28 Aug 20:00 | **Top.** Real rubric, real stakes. |
| Proof of Possible — same build, 3-min video, Responsible Delivery 15% | Thu 28 Aug 02:30 | High, mostly shared cost |
| **All Things Agentic** — caseworker agent, ADK + Cloud Run, **architecture diagram required** | Tue 01 Sep 05:30 | **High.** A new build, not a resubmit. |
| *This event* | Tue 01 Sep 03:30 | $55 |

Those three alone exceed 15 hours. **There is no free time here.** Every hour spent on this event is
taken directly from All Things Agentic, which lands two hours later, is a genuine build with a
required architecture-diagram upload, and is worth incomparably more.

### The recommendation

**Total envelope: 6 hours end to end — 4 hours build, 2 hours ship.** Not 15. Not 10. Six.

| Block | Hours | Window (IST) |
|---|---|---|
| Build — scaffold, deploy skeleton, core, render, lighting, frame | **4.0** | Fri 29 Aug – Sun 31 Aug, two sittings |
| Ship — 3 screenshots, thumbnail, description, tech list, public repo, signed-out check | **2.0** | Sun 31 Aug, finishing by 22:00 |
| **Total** | **6.0** | |

**Why 6 and not more:** this is the rare rubric where hours 7 through 40 buy almost nothing
measurable. Three judges scoring three aesthetic criteria on a 1–5 scale in a fast pass cannot
perceive the difference between a 6-hour and a 30-hour build of the same concept — but they can
perceive the difference between a taken concept and a fresh one, which costs zero hours and is
decided in `IDEAS.md`. **Concept selection is worth more than build hours in this event.** That is
the whole strategic content of this analysis.

**Why not zero:** the deliverable shape (static, no backend, no keys, no sponsor SDK, public URL)
makes this the lowest-risk complete rehearsal of scout → strategy → design → build → deploy → verify
→ ship available, and 6 hours is a price worth paying once for that. It is not worth paying twice.

### Hard gates — abandon rules, in order

1. **Gate A (Thu 28 Aug 20:00 IST):** BWMI and Proof of Possible both submitted. Not met → **skip
   this event.** No partial entry, no "just deploy something."
2. **Gate B (Sun 30 Aug, end of day):** All Things Agentic at or past its walking-skeleton deploy.
   Not met → **drop this event immediately**, mid-build if necessary. A dropped $55 entry costs
   nothing. A rushed ATA entry costs the ATA slot.
3. **Gate C (Mon 31 Aug 22:00 IST):** submitted, or abandoned. **Nothing about this event is touched
   on 1 Sep**, when ATA closes at 05:30.
4. **Overrun rule:** if the build passes 4 h without a working signature moment on screen, cut to the
   deploy-and-ship path with whatever exists, or drop. Do not extend.

### Where the 6 hours go — priority order, cut order named

Highest score-per-hour first, so a forced stop still leaves a scoring entry:

1. Walking-skeleton deploy on a public Vercel URL (rule 22, signed-out) — **before any feature.**
2. The signature moment, working, at whatever fidelity.
3. Lighting, palette, composition pass — this is criterion 1 and the cheapest 5 available.
4. The site frame: title type, concept line, control hint, colophon.
5. Reduced-motion toggle + WebGL-unavailable fallback (design-craft §4, §6).
6. Screenshots + thumbnail, framed deliberately (design-craft §7).

**Cut in this order under time pressure:** sound → mobile-specific polish → any second scene or
second interaction → the colophon.
**Never cut:** the deploy, the signature moment, the lighting pass, the reduced-motion toggle, the
screenshots.

---

## 7. Rules and lessons cited

**Playbook rules:** 0 (one question) · 1 (rubric weights into the plan) · 2 (cast to the criterion) ·
3 (N=1) · 6 (verify the listing) · 8 (one visible imperfection) · 11 (hero mechanic as proper noun) ·
21 (rare things get headings) · 22 (signed-out deploy check) · 23 (`date` before estimates) ·
24 (match shape to judging format) · 25 (substrate caps the design ceiling) · 26 (demo the event
name's verb) · 28 (price the panel) · 31 (primitive vs product) · 32 (slop check) · 33 (resubmit
grep) · 34 (register from rubric) · 36 (evaluation method beats criteria) · 37 (disclose AI tools).

**Named lessons:** *Rank by field size, not prize* (the Paritok correction — and why it argues
against this event, §3) · *Match shape to judging format* (Nirog) · *Demos must work at N=1* ·
*Rubric vs evaluation method* (Gemini 3, zero-for-fifteen) · *An agent must act, not notify*
(Caspian — the slop-check mechanism, §5) · *Verify the clock and the deploy* (Vercel SSO) ·
*Read the Rules tab, not the sidebar* (the High School tag, §3) · *Two winning registers*
(TinyStep's zero metrics, §2).

**Design-craft sections:** §1 signature moment · §2 "What if…" framing · §3 performance is design ·
§4 resilience is visible design · §5 stacks that won · §6 accessibility early · §7 the 10-second
gallery read · §8 anti-patterns.
