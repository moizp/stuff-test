import type { User } from '$lib/shared/types';
import type { Repository } from '../repository/types';

const VERIFIED_BASELINE_SCORE = 70;
const UNVERIFIED_BASELINE_SCORE = 30;

/**
 * Resolves a free-text author name (from a live request or the legacy
 * import) to a User, creating one if needed. Matches by exact trimmed name
 * — see DECISIONS.md ("Legacy import") for the accepted limitation (two
 * real people sharing a name would merge) and the most-restrictive-wins
 * rule for conflicting verified status.
 */
export async function resolveAuthor(
	repo: Repository,
	rawName: string | null | undefined,
	verified: boolean
): Promise<User | null> {
	const name = rawName?.trim();
	if (!name) return null;

	const existing = await repo.users.findByName(name);
	if (!existing) {
		const trustScore = verified ? VERIFIED_BASELINE_SCORE : UNVERIFIED_BASELINE_SCORE;
		return repo.users.create({ name, verified, trustScore });
	}

	if (existing.verified && !verified) {
		return repo.users.update(existing.id, { verified: false });
	}
	return existing;
}
