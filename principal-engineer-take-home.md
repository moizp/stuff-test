# Principal Engineer — Take-Home Exercise

## The spirit of this exercise

This is deliberately small and deliberately open-ended. We are hiring someone who can move from idea to working product quickly and make sound calls along the way — sometimes as the only engineer in the room. So this exercise is about **judgment and shipping**, not completeness or polish.

We would much rather see a coherent thin slice that actually runs, with clear notes on what you chose not to do, than a broad, half-finished build. **Deliberately cutting scope is a positive signal here, not a negative one.**

## Time budget

- **Target: 3–4 hours** of focused work.
- **Hard ceiling: 6 hours.** If you reach it, stop and write up what's left.

We assess what's reasonable to achieve in that time — not whether it's "finished." Please don't burn a weekend on this; we respect that you have a life and probably a full-time job.

## The scenario

We build community platforms that connect neighbours. We'd like you to build a small vertical slice of a **Neighbourhood Noticeboard**: residents post short notices — offers, requests, events, alerts — to their neighbourhood, and other residents can view and reply.

You're also inheriting some data from a legacy system. The file **`seed-notices.json`** (provided) is a real-world-style export: messy, inconsistent, and exactly the kind of thing you'd find in a system that's been running for years. Part of the job is dealing with that reality pragmatically — not rebuilding it.

## What to build

A backend and a frontend. **Use whatever stack, tools, and hosting you like** — running locally is completely fine. You may use any data store, including SQLite or even a flat file.

**Must do:**

1. **Import the legacy data.** Consume `seed-notices.json` into your own data model. Expect inconsistency; handle it sensibly.
2. **List notices** for a given neighbourhood, newest first, showing type, author (where known), and timestamp.
3. **Create a notice** (type, title, body, author, neighbourhood).
4. **Reply to a notice**, and show replies beneath it.
5. **The interesting bit — trust & safety:** notices from *unverified* residents should be handled differently from verified ones. **How** is entirely your call — label them, hold them for review, rate-limit, down-rank, hide, something else. Make a decision, implement *something*, and explain your reasoning. The legacy data contains some questionable entries; use your judgment on those too.

**Explicitly not required** (unless you want to): login/auth, deployment, production hardening, exhaustive tests, or a beautiful UI. If you'd add these for production, just tell us in your write-up rather than building them.

## Use of AI is expected

This role is AI-augmented by design, so we want to see how you work with these tools. **We'll provide you an isolated Claude Code API key** (separate setup instructions included). You can also use any another AI tool/model/harness if you prefer. In your write-up, tell us briefly how you used it, and where it helped or got in your way.

## What to send back

1. **The code** — a repo link or a zip — with a **README**: how to run it, what's done, what isn't. If the repo is on github, you can invite the github user: `jigar-stuff-nz` to the repo as a collaborator/reader.
2. **`DECISIONS.md`** (max ~1 page). Cover:
   - Your key technical and product decisions.
   - What you deliberately cut, and why.
   - How you handled the trust & safety wrinkle.
   - What you'd do next, or add before production.
   - How you used AI tooling.
3. **A short summary/presentation of what you built and why it matters, written for a non-technical executive** (imagine our Chief Product Officer reading it).
3. **A short written answer** (~half a page total) to the scenario below.

### Written scenario (~15 minutes — keep it brief)

**(a) Evolving an existing system.** Imagine this noticeboard already exists in production as an ageing monolith with thousands of daily users, and leadership wants significant new capabilities added on top of it. Outline how you'd approach evolving it — where you'd start, how you'd de-risk, and how you'd decide what to rebuild versus extend.

**(b) Ways of working.** You're the sole engineer. A designer wants to wait two weeks to ship a polished version; a stakeholder wants the rough version live now. You have a strong technical opinion of your own. How do you handle it?

## How we'll assess this (no surprises)

We weight, roughly in this order:

1. **Pragmatic delivery and sensible scoping** — did you ship something coherent that runs, and make smart trade-offs under time pressure?
2. **Architecture and decision quality** — are your choices sound and well-reasoned?
3. **Effective use of AI tooling.**
4. **Full-stack competence.**
5. **Clear communication**, especially to a non-technical audience.

We are explicitly **not** rewarding: exhaustive features, test coverage for its own sake, premature optimisation, or polish at the expense of a working slice.

## Logistics

- **Submit by:** 31 August 2026
- **Questions to:** jigar.patel@stuff.co.nz
- Please keep it under 6 hours. If something is ambiguous, make a reasonable assumption, note it, and move on — that's part of what we're looking for.

After your submission, we will schedule a 60 minute follow-up conversation where you can walk us through what you built and the choices you made, or ask us more questions! You will also get to meet some more people from the wider team, depending on their availability for the given day.
