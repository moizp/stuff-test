# Neighbourhood Noticeboard Demo — Summary

- Live demo: https://neighbourhood-noticeboard.onrender.com (runs on a free tier — the first load after a period of inactivity can take few seconds to wake up)
- Link to [`Readme.md`](../README.md)

## Scope

A working first slice of a Neighbourhood Noticeboard: residents post short notices to their neighbourhood, and other residents browse and reply. Three neighbourhoods are live with real (imported) historical data, styled to feel like an actual wooden noticeboard rather than a generic form.

The look and feel is a deliberate design choice: pinned, hand-styled notice cards on a warm corkboard background, using plain everyday language. The aim is for posting a notice to feel **as easy and low-stakes as pinning a piece of paper to a real board** — approachable for residents who aren't particularly tech-savvy.

## Project considerations

1. Inheriting years of messy real-world data without a costly manual clean-up.
   - The legacy export arrived with inconsistent formats, missing fields, and duplicate posts.
   - It's imported automatically and pragmatically — no hand-fixing required — and the two entries that were actually spam and the one that was abusive were caught and handled without touching the ordinary, legitimate posts sitting right next to them.

2. Keeping a community space trustworthy without either silencing genuine residents or creating a moderation team overnight.
   - Instead of a blunt "hide everything from unverified residents" rule (which would have emptied the board of perfectly normal requests, like someone asking to borrow a ladder), unverified posts are shown but clearly labelled, and only content that actually looks like spam or abuse gets held back or hidden.
   - The judgment call, and the reasoning behind it, is written up for review.

## Solution overview

Under the hood, all components — posting, browsing, trust & safety, legacy import — are built as independent, swappable modules. Each one can be scaled up, replaced, or handed to a different team later without rebuilding everything else around it.

For this demo, we deliberately used a lightweight in-memory data store instead of a full database, so the whole thing runs instantly from a shareable URL with nothing to install or configure — a considered trade-off for demo speed, not a technical limitation. Swapping in permanent storage later is a small, contained change, not a rebuild (see [`DECISIONS.md`](DECISIONS.md#storage)).

Accessibility is treated as a first-class review step — not a nice-to-have squeezed in at the end — alongside automated tests that were built in from the very first commit, not added after the fact.

## What's deliberately not in this slice, and what's next

This is a thin, working slice by design — accounts/login, production-grade infrastructure, and a fully designed visual/brand identity weren't required to prove the idea out.

The full list of deliberate cuts and the roadmap (including AI-powered spam detection, automated accessibility testing in CI, and usage tracking) is in [`DECISIONS.md`](DECISIONS.md) — see "Scope cuts" and "What I'd do with more time".
