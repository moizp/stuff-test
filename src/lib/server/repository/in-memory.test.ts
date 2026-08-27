import { beforeEach, describe, expect, it } from 'vitest';
import type { NewNotice } from './types';
import type { Repository } from './types';
import { createInMemoryRepository } from './in-memory';

function baseNotice(overrides: Partial<NewNotice> & Pick<NewNotice, 'boardId'>): NewNotice {
	return {
		legacyId: null,
		type: 'offer',
		title: 'Untitled',
		body: '...',
		authorId: null,
		status: 'visible',
		importFlags: [],
		cardImageUrl: null,
		cardFont: null,
		...overrides
	};
}

describe('createInMemoryRepository', () => {
	let repo: Repository;

	beforeEach(() => {
		repo = createInMemoryRepository();
	});

	it('lists notices for a board newest first', async () => {
		const board = await repo.noticeboards.create({
			name: 'Mt Eden',
			visibility: 'public',
			ownerId: null
		});
		const older = await repo.notices.create(
			baseNotice({ boardId: board.id, title: 'Older', createdAt: '2026-01-01T00:00:00Z' })
		);
		const newer = await repo.notices.create(
			baseNotice({ boardId: board.id, title: 'Newer', createdAt: '2026-02-01T00:00:00Z' })
		);

		const listed = await repo.notices.listByBoard(board.id);
		expect(listed.map((n) => n.id)).toEqual([newer.id, older.id]);
	});

	it('scopes private board access to the owner and their circle', async () => {
		const owner = await repo.users.create({ name: 'Owner', verified: true });
		const friend = await repo.users.create({ name: 'Friend', verified: true });
		const stranger = await repo.users.create({ name: 'Stranger', verified: true });
		await repo.circles.add(owner.id, friend.id);

		expect(await repo.circles.isMember(owner.id, friend.id)).toBe(true);
		expect(await repo.circles.isMember(owner.id, stranger.id)).toBe(false);
	});

	it('detects duplicate notices for dedupe on import', async () => {
		const board = await repo.noticeboards.create({
			name: 'Mt Eden',
			visibility: 'public',
			ownerId: null
		});
		const first = await repo.notices.create(
			baseNotice({
				boardId: board.id,
				legacyId: 1001,
				title: 'Free firewood',
				body: 'Collect only'
			})
		);

		const duplicate = await repo.notices.findDuplicate({
			boardId: board.id,
			title: first.title,
			body: first.body,
			authorId: null
		});

		expect(duplicate?.id).toBe(first.id);
	});
});
