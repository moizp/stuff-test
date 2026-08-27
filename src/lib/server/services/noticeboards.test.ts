import { beforeEach, describe, expect, it } from 'vitest';
import { createInMemoryRepository } from '../repository/in-memory';
import type { Repository } from '../repository/types';
import { resolvePublicBoard } from './noticeboards';

describe('resolvePublicBoard', () => {
	let repo: Repository;

	beforeEach(() => {
		repo = createInMemoryRepository();
	});

	it('creates a public board for a new neighbourhood name', async () => {
		const board = await resolvePublicBoard(repo, 'sandringham');
		expect(board.name).toBe('Sandringham');
		expect(board.visibility).toBe('public');
	});

	it('reuses the same board across casing variants', async () => {
		const first = await resolvePublicBoard(repo, 'Sandringham');
		const second = await resolvePublicBoard(repo, 'sandringham');
		expect(second.id).toBe(first.id);
		expect((await repo.noticeboards.list()).length).toBe(1);
	});
});
