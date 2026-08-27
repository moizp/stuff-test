# Plan — Neighbourhood Noticeboard Take-Home

Target: 3–4h focused work, 6h hard ceiling.

Decisions and their rationale live in `DECISIONS.md` — this file tracks progress only.

## Priority order

Must-do UI first. Deployment and further Circle/private-board work are lower priority, cut first if time runs short.

1. List notices (newest first)
2. Create notice form
3. Reply UI
4. Current-user identity
5. Deployment (only if time allows)
6. Scenario answers + CPO summary — required regardless of time

## Todos

### Setup

- [x] Review `seed-notices.json`, sketch module boundaries
- [x] Scaffold SvelteKit (pnpm, TS, `adapter-node`)
- [x] Wire up `vitest`
- [x] Domain types (`src/lib/shared/types.ts`)
- [x] Repository interface + in-memory implementation

### Must-do (from brief)

- [x] Import legacy data (`src/lib/server/import/`)
- [x] Demo card styling on boot (`seed.ts`)
- [x] List notices per neighbourhood, newest first (`/board/[name]`)
- [x] Create a notice
- [x] Reply to a notice, shown beneath it
- [x] Trust & safety
- [x] Current-user identity (viewer badge)

### UI

- [x] Card component + detail dialog
- [x] Create-notice form

### Accessibility & tooling

- [x] Accessibility pass — see `DECISIONS.md` "Accessibility"
- [x] Prettier

### Deliverables

- [x] README
- [x] `docs/DECISIONS.md`
- [x] `docs/SUMMARY.md`
- [x] `docs/SCENARIOS.md`

### Deployment

- [x] In-memory repository behind the storage interface
- [x] Boot-time seed
- [x] Single Node process serving API + frontend
- [x] `GET /health`
- [x] Deploy to Render — live at https://neighbourhood-noticeboard.onrender.com

### Wrap-up

- [x] Trim `DECISIONS.md` and this file
- [ ] Final pass: confirm repo runs from a clean clone per README
