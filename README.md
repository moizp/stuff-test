# Neighbourhood Noticeboard

Take-home exercise: a lightweight community noticeboard — post notices, reply, import legacy data, and apply basic trust & safety rules.

Live demo: _TBD (see Deploy below)_

## Getting Started

### Prerequisites

- Node 20+
- pnpm 10.x (`corepack enable` will pick up the right version automatically)

### Run locally

```sh
git clone <repo-url>
cd stuff-test
pnpm install
pnpm dev
```

`pnpm dev` opens the app in your default browser automatically. It boots with an in-memory store, reseeded from `seed-notices.json` via the import pipeline on every start — no database setup needed.

Other useful commands:

```sh
pnpm test      # run the vitest suite
pnpm check     # type-check (svelte-check)
pnpm build     # production build
pnpm preview   # preview the production build locally
```

### Deploy

Deployed to [Render](https://render.com)'s free tier as a single Node process (`adapter-node`) serving both the API and the built frontend.

- **Build command:** `pnpm install && pnpm build`
- **Start command:** `node build`
- **Note:** the free instance sleeps after inactivity — the first request after idle can take several seconds while it wakes up. The frontend pings `GET /health` on load to kick off the wake-up early.

## What's built

Full progress lives in [`docs/PLAN.md`](docs/PLAN.md) (live checklist). In short: domain model, repository, legacy import, and trust & safety pipeline are built and tested; notice/reply routes and UI are the main piece still in progress.

## Folder structure

SvelteKit enforces the frontend/backend split structurally, not just by convention — the build throws if client code imports anything under `server/`. That split maps directly onto the architecture in `DECISIONS.md`:

```
src/
  routes/          # frontend — pages + API endpoints (+page.svelte, +server.ts)
  lib/
    server/        # backend-only, never bundled for the client
      services/    # business logic (createNotice, trust & safety, etc.)
      repository/  # data access, swappable storage interface
      import/       # legacy seed-notices.json → createNotice() pipeline
    shared/        # types used by both frontend and backend
    components/    # frontend UI (card, create form, reply thread) — not yet built
```

Tests are colocated with the code they cover (e.g. `normalize.test.ts` next to `normalize.ts`), not held in a separate `tests/` tree — keeps a unit and its test moving together under one architectural boundary.

## Architecture & decisions

See [`docs/DECISIONS.md`](docs/DECISIONS.md) for the full rationale — stack choice, data model, trust & safety rules, legacy import approach, deliberate scope cuts, and what we'd do with more time.

## Scenario answers

See [`docs/SCENARIOS.md`](docs/SCENARIOS.md).

## Non-technical summary

See [`docs/SUMMARY.md`](docs/SUMMARY.md).
