# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication style

Be succinct and direct. No preamble, no restating the request, no summarizing what was just done unless asked.

## Tooling

- Use the `svelte` MCP server (`mcp__svelte__*`) when writing or fixing Svelte code — `svelte-autofixer` in particular before considering a component done.
- Use the `simplify` skill for reuse/simplification/efficiency passes on changed code, and `code-review` before treating a change as final.

## Commands

- `pnpm dev` — dev server (SvelteKit, Vite)
- `pnpm build` — production build (`adapter-node`); `node build` runs it
- `pnpm preview` — preview the production build locally
- `pnpm test` — run the full vitest suite (`vitest run`)
- `pnpm test -- <pattern>` — run a subset, e.g. `pnpm test -- trust-safety`
- `pnpm check` — type-check via `svelte-kit sync && svelte-check`; run this after any change, it catches most issues cheaply

There is no separate lint command configured.

## Architecture

This is a take-home exercise (Neighbourhood Noticeboard — see `docs/PLAN.md` and `docs/DECISIONS.md` for full rationale and progress). SvelteKit enforces the architectural split structurally, not just by convention:

- `src/lib/server/` — backend only; the build throws if client code imports anything here.
  - `repository/` — storage interface (`types.ts`) + the in-memory implementation (`in-memory.ts`). All other layers depend only on the `Repository` interface, never on the in-memory implementation directly, so storage can be swapped without touching services/routes.
  - `services/` — business logic (`createNotice`, `createReply`, `evaluateTrustAndSafety`, `resolveAuthor`, `resolvePublicBoard`). Pure functions where possible, no framework coupling.
  - `import/` — legacy `seed-notices.json` → `createNotice()` pipeline. Never writes to the repository directly; normalizes shapes then calls the same `createNotice()` service a live request uses, so validation/trust-scoring/dedupe apply uniformly regardless of source.
  - `db.ts` — process-wide singleton repository, seeded from `seed-notices.json` on module load via top-level `await`. All routes import `repo` from here.
- `src/lib/shared/types.ts` — domain types (`User`, `Circle`, `Noticeboard`, `Notice`, `Reply`, `TrustEvent`) used by both frontend and backend.
- `src/lib/components/` — frontend UI (`NoticeCard.svelte`, `CreateNoticeForm.svelte`).
- `src/routes/` — pages + form actions (`+page.server.ts`, `+server.ts`). Kept thin; business logic belongs in `services/`.

Tests are colocated with the code they cover (e.g. `normalize.test.ts` beside `normalize.ts`), not in a separate `tests/` tree.

### Data model and trust & safety

Full schema and rationale live in `docs/DECISIONS.md` ("Data model", "Trust & safety"). Key point for working in this codebase: `Notice.status` (`visible` | `pending_review` | `hidden`) is set once by `evaluateTrustAndSafety()` inside `createNotice()`/`createReply()` — never set directly by callers. Flags also write an append-only `TrustEvent` and adjust `User.trustScore`; don't mutate `trustScore` directly elsewhere.

Only public noticeboards have UI/routes built. `Circle` and private-board visibility are modeled in the schema and repository but have no UI — see `docs/DECISIONS.md` ("Scope cuts") before building on top of them.

### Current-user identity

There is no real auth. A "Viewing as [name]" cookie (`viewerName`, set in `src/routes/board/[name]/+page.server.ts`) is matched against `User.name` by exact trimmed-name lookup — the same resolution `resolveAuthor()` uses for import and live posts. This is what lets a `pending_review` author see their own held notice; don't add a different identity mechanism without checking this one first.

### Forms are plain SvelteKit form actions, deliberately without `use:enhance`

This is a considered trade-off, not an oversight (see `docs/DECISIONS.md`, "UI direction"): the target audience skews toward older phones/patchy connections, so forms work fully with JS disabled. If adding `use:enhance` later, it must remain a pure progressive enhancement — the no-JS path has to keep working.
