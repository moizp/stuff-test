import type { Noticeboard } from '$lib/shared/types';
import type { Repository } from '../repository/types';
import { canonicalizeNeighbourhood } from '../import/normalize';

/** Finds or creates a public noticeboard by (canonicalized) name — used by both the legacy import and live notice creation. */
export async function resolvePublicBoard(repo: Repository, rawName: string): Promise<Noticeboard> {
	const name = canonicalizeNeighbourhood(rawName);
	const existing = await repo.noticeboards.findPublicByName(name);
	if (existing) return existing;
	return repo.noticeboards.create({ name, visibility: 'public', ownerId: null });
}
