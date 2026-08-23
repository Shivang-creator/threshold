---
event: 3D Websites Hackathon
slug: 3d-websites-hackathon
url: https://3d-websites-hackathon.devpost.com
deadline_ist: "Tue 01 Sep 2026, 03:30 AM IST  (source: submissions_end_at 2026-08-31T22:00:00Z, get_key_dates)"
deadline_display_on_site: "Aug 31, 2026 @ 6:00pm EDT (matches UTC source, no contradiction found)"
prize_pool: "$55 total, cash/gift-card ($30 / $15 / $10), 3 winners — get_prizes total_value"
field: "1,367 registered participants (live site, 23 Aug 2026) — submission count unknown, gallery unpublished"
judging_scale: "5 (get_judging_criteria judging_scale), 3 unweighted criteria, 3 named judges"
verified_at: "2026-08-23T12:12 UTC / 17:44 IST (fetched_at on all Devpost MCP calls)"
---

# 3D Websites Hackathon — Phase-0 Brief

Scout run at Sun 23 Aug 2026, 17:44 IST (confirmed via `date`). Current phase per Devpost:
`submissions_open`.

## Dates (all converted UTC → IST, +5:30)

| Milestone | UTC (source: `get_key_dates`) | IST |
|---|---|---|
| Submissions opened | 2026-06-22T04:00:00Z | Mon 22 Jun 2026, 09:30 AM IST |
| Public voting opened | 2026-07-25T14:00:00Z | Sat 25 Jul 2026, 07:30 PM IST |
| **Submissions close (deadline)** | **2026-08-31T22:00:00Z** | **Tue 01 Sep 2026, 03:30 AM IST** |
| Judging starts | 2026-09-01T14:00:00Z | Tue 01 Sep 2026, 07:30 PM IST |
| Judging ends | 2026-09-02T22:00:00Z | Thu 03 Sep 2026, 03:30 AM IST |
| Public voting closes | 2026-09-03T04:45:00Z | Thu 03 Sep 2026, 10:15 AM IST |
| Winners announced | 2026-09-06T14:00:00Z | Sun 06 Sep 2026, 07:30 PM IST |

**Cross-check, no contradiction found:** the live page (`fc` scrape of the landing page and of
`/rules`, both fetched fresh) both display "Deadline: Aug 31, 2026 @ 6:00pm EDT" and independently
"8 more days to deadline" (consistent with today, 23 Aug). 6:00pm EDT = 22:00 UTC = the MCP
`submissions_end_at` value exactly. Structured data, live banner, and rules page all agree — this
is one of the minority of listings where prose and structured data match on the first check.

Runway from now: **8 days 10 hours** to the deadline (23 Aug 17:44 IST → 1 Sep 03:30 IST).

## Prizes — cash vs credits, explicit

Source: `get_prizes`, `total_value: {"value":55,"currency":"$","display":"$55"}`.

| Place | Amount | Type | Notes |
|---|---|---|---|
| 1st — Best Overall 3D Website | $30 | cash (gift card) | 1 winner |
| 2nd | $15 | cash (gift card) | 1 winner |
| 3rd | $10 | cash (gift card) | 1 winner |

**Total pool is $55, all gift cards, no credits/swag padding the headline number** — refreshingly
the small opposite of the usual "$18k in credits reads as $0 cash" trap: this one is exactly what
it says, just very small. No sponsor prize tiers exist (Sponsors section on the live page is empty).

## Judging criteria — weights and scale

Source: `get_judging_criteria`. **No explicit percentage weights are published** — three criteria,
listed in this position order, scored on a 1–5 scale, no tracks:

1. **Visual Design** — "polished, appealing, and visually impressive... composition, color,
   lighting, typography, animations, and overall presentation."
2. **Creativity & Originality** — "unique... fresh and memorable."
3. **User Experience & Interactivity** — "navigation, responsiveness, engagement, and the quality
   of user interactions."

The overview page states the tiebreak in prose: *"The judging is based primarily on creativity,
aesthetics, and overall experience. Technical complexity is optional. A beautiful and creative
project can outperform a highly technical one."* Treat that as the de facto weighting — visual
craft and "wow" over engineering depth.

## Judging METHOD (rule 36 — this decides where build hours go)

- **3 named judges**, all listed as affiliated with the same institution — Adlai E. Stevenson High
  School (Tanishq Kumar, Caleb Magsalay, Lucas Lyubenko). No sponsor/company judges.
- Submission requires a **publicly accessible website link** and **source code**; a demo video is
  explicitly **optional**. No architecture-diagram field, no "reproducible setup" field, no
  required test count field — `get_submission_requirements` returns `fields: []` (no custom
  questions beyond the standard Devpost submission object).
- Judging window is **~32 hours** (Tue 07:30 PM IST → Thu 03:30 AM IST) for 3 judges against up to
  1,367 registered participants' worth of submissions (actual submission count unknown — gallery
  unpublished, see Red Flags). Three people cannot deep-review hundreds of live 3D sites in that
  window.
- **Read together, this points to a fast visual/first-impression judging pass on the live URL
  (and possibly the screenshots) rather than deep code review or sustained interaction.** The
  hackathon's own framing supports this: *"We are looking for projects that make people stop
  scrolling and say: 'Wow.'"* Build priority: front-load visual impact in the first 10-15 seconds
  of load/scroll; do not spend build time on backend rigor, tests, or architecture no one will see.
  This is the opposite build allocation from a rule-36 video-only/rubric-mismatch trap — here the
  live URL almost certainly **is** the evaluation channel, so the deployed site must load fast,
  work signed-out, and hit visually in seconds.

## Submission requirements (every field)

Source: `get_submission_requirements` + live `/rules` page (identical text, no discrepancy):

To qualify for judging, each submission must include:
1. A publicly accessible website link
2. A project description explaining idea and inspiration
3. At least 3 screenshots
4. A demo video, 1–5 minutes (**optional**)
5. A list of technologies and tools used
6. Source code

Deliverable flags from the API: `video_required: false`, `website_required: false` (despite the
prose requiring a live link — likely because Devpost's generic `website_required` flag maps to a
different submission type than "try it out" link; treat the prose requirement as binding),
`zip_file_required: false`. No custom form fields beyond the standard submission object — nothing
else to fill in.

Project-level requirements (from Rules + overview, verbatim where quoted):
- "Project must be web-based"
- "Project must contain meaningful 3D or immersive visual elements"
- "AI-generated content and assets are allowed"
- "Existing assets and models are allowed"
- "Teams and solo participants are both welcome"
- "Projects must be appropriate for all audiences"

## Rules that bite (verbatim)

Full rules text (`get_hackathon_rules`, cross-checked against a fresh scrape of `/rules` —
identical, 10 numbered items, no additional prose beyond what's below):

1. "Participants may work individually or in teams."
2. "AI tools, code assistants, online assets, templates, and tutorials are permitted."
3. "Participants must have the right to use any assets included in their project."
4. "Projects must be submitted before the deadline."
5. "Submissions containing offensive, hateful, illegal, or harmful content will be disqualified."
6. "Projects must be accessible through a web browser."
7. "The organizers reserve the right to disqualify submissions that violate these rules."
8. "By submitting a project, participants confirm that they created or have permission to use all
   submitted content."
9. "Be respectful, supportive, and inclusive toward all participants."
10. "Have fun and create something amazing."

**Prior-work legality (rule 33 grep):** searched the full rules text and user-instructions text for
`"newly created"`, `"during the submission period"`, and `"minor changes"` — **none of the three
phrases appear anywhere.** There is no stated restriction on prior work, no "must be built during
the event" clause, and no minor-changes-disqualifies clause. This is unusually permissive — but
also means it is genuinely silent, not permissive-by-explicit-statement; if this matters for a
resubmit strategy, the absence of a restriction is the finding, not a guarantee.

## Eligibility check vs Shivang

Source: `get_hackathon_rules` eligibility block, cross-checked against the live page's "Who can
participate" sidebar (`fc` scrape) — **text is identical between structured API and live prose in
this case**, no contradiction on the standard fields:

- "Above legal age of majority in country of residence" — Shivang is 18+, India majority age is 18. **Pass.**
- "Students only" / `allowed_student_type: "All students"` — Shivang is a college student (IITM). **Pass** — the eligibility text says "All students," not "high school students only."
- "Companies/professional organizations excluded from participation" — not applicable, entering as an individual. **Pass.**
- "All countries/territories, excluding standard exceptions: Brazil, Crimea, Cuba, Iran, North
  Korea, Quebec, Russia" — India not excluded. **Pass.**
- `team_required: false` — solo is fine, matches default. **Pass.**
- No Apple/Google developer account requirement anywhere in rules or submission requirements — this
  is a pure web deliverable (browser-accessible URL). **Pass** — no store-release conflict.

**Flag worth recording (per "read the Rules tab, not the sidebar" precedent — Devpost metadata has
contradicted organizer rules before, and last time the call was to enter despite it):** the
hackathon **overview** metadata tags `in_person_type` as `"High School"` even though the event is
`online: true` and open to "All students" per the actual eligibility block. The three named judges
and the organizer are all tied to one specific high school (Adlai E. Stevenson High School,
Lincolnshire IL — organizer email `tankumar27@students.d125.org`, a real school-district student
email domain). **Read literally, the binding eligibility text does not exclude a college student.**
The `in_person_type: High School` tag looks like a Devpost category artifact from how the organizer
set up the listing (possibly through a school/student program), not an enforced eligibility
restriction — but it is a signal this was built by and primarily for a high-school audience. No
rule anywhere says "high schoolers only." Flagging, not blocking.

## Sponsor stack & credits

**None.** The "Hackathon Sponsors" section on the live page is empty — no sponsor logos, no
required SDKs, no sponsor prize tracks, no discount/credit codes offered for this event. The
"Resources" block (from `get_hackathon_overview`) is a curated tools list, not a sponsor
requirement: Three.js, React Three Fiber, Blender, Spline, GSAP, Sketchfab, Poly Haven, BlenderKit,
Mixamo, Figma — all free/open-source or freemium, none require Shivang's paid credits (GCP, AWS,
Wolfram, Render, Featherless/DevSwarm, Perfect Corp from the Brain Digest's live-resources list
don't map to any requirement here, and nothing here expires before 1 Sep). AI tools explicitly
permitted by name: ChatGPT, Claude, Gemini, GitHub Copilot, Cursor.

## Red flags

1. **First-time organizer, no track record.** Filtering Devpost hackathons by host "Tanishq Kumar"
   returns exactly **1 hackathon** (this one). There is no prior event to check "was the prize
   actually paid" against (playbook rules 6/28) — genuinely unverifiable track record, not a
   red flag of dishonesty, just zero history. The organizer is identifiable (real school-district
   email, named judges from a real, findable high school) — not an anonymous/burner listing, which
   is the more dangerous failure mode this check is meant to catch.
2. **Project gallery is unpublished** (confirmed live at `/project-gallery`: *"The hackathon
   managers haven't published this gallery yet"*) — **no competitor research is possible.** Field
   size (1,367 registered) is known; actual submission count, quality bar, and competitive density
   are not observable before building. This was flagged by Shivang before this run and is recorded
   here per instruction, not independently rediscovered.
3. **Judge-to-field ratio.** 3 judges, ~32-hour judging window, up to ~1,367 potential submissions.
   Combined with an optional video and no required architecture/test fields, this points strongly
   to a fast, visual-first pass rather than sustained per-project evaluation — plan the build and
   the first 10 seconds of the live site accordingly (see Judging METHOD above).
4. **Tiny prize pool ($55) against a large registered field (1,367).** Per the field-size/effort
   pricing rule (playbook rules 6, 28, 24): a credits-free but trivially small cash prize plus an
   unverified organiser caps how much build-hour budget this justifies, regardless of field size —
   this is a call for Strategy phase, not Scout, but the inputs are recorded here.

## UNVERIFIED

- Actual number of submitted (not just registered) projects — blocked by unpublished gallery.
- Whether judges will click through to interact with live 3D sites or judge primarily off
  screenshots/description — no stated judging process beyond the criteria text; inferred from
  judge count/window/optional-video signals above, not confirmed by the organizer.
- Whether the `in_person_type: "High School"` tag has any enforcement consequence (e.g., could a
  submission be challenged post-hoc as ineligible). Nothing in the rules or eligibility text
  supports that reading today, but it was not addressed by an explicit organizer statement either.
