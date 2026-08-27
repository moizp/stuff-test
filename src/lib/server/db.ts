import { readFileSync } from 'node:fs';
import { createInMemoryRepository } from './repository/in-memory';
import type { Repository } from './repository/types';
import { importLegacyNotices } from './import/seed';
import type { LegacyNoticeRecord } from './import/normalize';

/**
 * Process-wide singleton, reseeded from seed-notices.json on every process
 * start — see DECISIONS.md ("Storage"). Module-level singleton is enough
 * for a single Node process (adapter-node); would need to move behind a
 * real store to scale beyond one instance.
 */
async function buildRepository(): Promise<Repository> {
	const repo = createInMemoryRepository();
	const records = JSON.parse(readFileSync('seed-notices.json', 'utf-8')) as LegacyNoticeRecord[];
	await importLegacyNotices(repo, records);
	return repo;
}

// Top-level await: routes that import `repo` only run after this module has
// finished evaluating, so seeding is always complete before any request.
export const repo = await buildRepository();
