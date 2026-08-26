# Plan — Neighbourhood Noticeboard Take-Home

Target: 3–4h focused work, 6h hard ceiling. Bias toward shipping a coherent thin slice over completeness.

Decisions and their rationale live in `DECISIONS.md` — this file tracks progress only.

## Priority order (reviewed against brief before committing further time)

Must-do UI first — it's the highest-weighted grading criterion and the only thing not yet built. Deployment and any further Circle/private-board work are explicitly lower priority and get cut first if time runs short.

1. List notices (newest first) — route/UI
2. Create notice form
3. Reply UI
4. Current-user picker
5. Deployment (only if time allows)
6. Scenario answers + CPO summary — required regardless of time remaining

## Todos

### Setup
- [x] Skim `seed-notices.json` to see actual messiness before designing the data model/import.
- [x] Sketch module boundaries (routes / services / repository / import) — 5 min, avoid mid-build refactor.
- [x] Check `/Users/moiz/Repos/buy-together` briefly for reusable scaffolding — checked, not reused (see DECISIONS.md "Storage").
- [x] Scaffold SvelteKit (pnpm, TS, `adapter-node`) at repo root. `src/lib/server/{services,repository,import}` + `src/lib/shared` created for module boundaries. Verified: typecheck clean, dev server boots, production build succeeds.
- [x] Wire up `vitest` (`pnpm test`) and add one real unit-tested pure function (`canonicalizeNeighbourhood`) to demonstrate testable architecture.
- [x] Domain types (`User`, `Circle`, `Noticeboard`, `Notice`, `Reply`, `TrustEvent`) in `src/lib/shared/types.ts`.
- [x] `Repository` interface + in-memory implementation, covering newest-first board listing, private-board circle scoping, and notice dedupe lookup. 3 tests, all passing.

### UI direction (decided — see DECISIONS.md "UI direction")
- [ ] Card component: image (`cardImageUrl`) + caption (`cardCaption`, falls back to title) in a preset font (`cardFont`), click → detail view (title, body, author, timestamp, replies).
- [ ] Create-notice form: fields for optional image URL, caption, font preset (dropdown of the 4 presets).

### Must-do (from brief)
- [x] Import legacy data into own data model, handling inconsistency pragmatically. `src/lib/server/import/{normalize,seed}.ts` — field drift, type/date normalization, dedupe. Verified end-to-end against the real `seed-notices.json` (4 tests): 1 dedupe (1001/1008), spam posts (1006/1013) → `pending_review`, abusive post (1010) → `hidden`, neighbourhood casing collapsed to one board.
- [ ] List notices per neighbourhood, newest first (type, author if known, timestamp). *(repository query done; route/UI not yet built)*
- [ ] Create a notice (type, title, body, author, neighbourhood). *(service layer done — `createNotice()`; route/UI not yet built)*
- [ ] Reply to a notice; show replies beneath it. *(service layer done — `createReply()`; route/UI not yet built)*
- [x] Trust & safety: decided and implemented. `evaluateTrustAndSafety(content, author)` wired into `createNotice()`/`createReply()`, writes a `TrustEvent` per flag. Full rule table in DECISIONS.md. 4 unit tests + validated against real seed data.
- [ ] Decide current-user picker for demo (no real auth) — needed so a user can see their own `pending_review` notices.

### Deliverables
- [ ] README: how to run, what's done, what isn't.
- [ ] DECISIONS.md (~1 page): key decisions, deliberate cuts, trust & safety reasoning, what's next/production, how AI was used.
- [ ] Non-technical summary for CPO: what was built, why it matters.
- [ ] Written scenario answers (~half page total):
  - [ ] (a) Evolving an existing monolith — where to start, de-risking, rebuild vs extend.
  - [ ] (b) Ways of working — designer wants 2 weeks polish vs stakeholder wants rough version now, plus your own opinion.

### Deployment (see DECISIONS.md "Deployment")
- [ ] In-memory repository implementation behind the storage interface (used for local dev too).
- [ ] Boot-time seed from `seed-notices.json` via the existing import pipeline.
- [ ] Single Node process serving API + built frontend static files.
- [ ] `GET /health` endpoint; frontend fires a ping to it on load to pre-warm a sleeping instance.
- [ ] Deploy to Render free tier; confirm live URL works end-to-end after a cold start.

### Wrap-up
- [ ] Checkpoint at ~3–4h: ship or cut further before 6h ceiling.
- [ ] Final pass: confirm repo runs from a clean clone per README.
