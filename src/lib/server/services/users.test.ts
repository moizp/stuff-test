import { beforeEach, describe, expect, it } from 'vitest';
import { createInMemoryRepository } from '../repository/in-memory';
import type { Repository } from '../repository/types';
import { resolveAuthor } from './users';

describe('resolveAuthor', () => {
	let repo: Repository;

	beforeEach(() => {
		repo = createInMemoryRepository();
	});

	it('returns null for a blank/whitespace-only name', async () => {
		expect(await resolveAuthor(repo, '  ', true)).toBeNull();
		expect(await resolveAuthor(repo, null, true)).toBeNull();
	});

	it('creates a new user with a baseline trust score matching verified status', async () => {
		const verified = await resolveAuthor(repo, 'Raewyn T', true);
		const unverified = await resolveAuthor(repo, 'Lena', false);
		expect(verified?.trustScore).toBeGreaterThan(unverified!.trustScore);
	});

	it('matches an existing user by exact trimmed name', async () => {
		const first = await resolveAuthor(repo, 'Raewyn T', true);
		const second = await resolveAuthor(repo, ' Raewyn T ', true);
		expect(second?.id).toBe(first?.id);
	});

	it('applies most-restrictive-wins when verified status conflicts across records', async () => {
		const first = await resolveAuthor(repo, 'wealth_freedom_88', false);
		// a later record claims verified — should NOT upgrade the user
		const second = await resolveAuthor(repo, 'wealth_freedom_88', true);
		expect(second?.id).toBe(first?.id);
		expect(second?.verified).toBe(false);
	});

	it('downgrades a previously-verified user if a later record is unverified', async () => {
		const first = await resolveAuthor(repo, 'James', true);
		expect(first?.verified).toBe(true);
		const second = await resolveAuthor(repo, 'James', false);
		expect(second?.verified).toBe(false);
	});
});
