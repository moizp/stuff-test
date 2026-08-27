import { beforeEach, describe, expect, it } from 'vitest';
import { createInMemoryRepository } from '../repository/in-memory';
import type { Repository } from '../repository/types';
import { resolvePublicBoard } from './noticeboards';
import { resolveAuthor } from './users';
import { createNotice } from './notices';

describe('createNotice', () => {
	let repo: Repository;
	let boardId: string;

	beforeEach(async () => {
		repo = createInMemoryRepository();
		boardId = (await resolvePublicBoard(repo, 'Mt Eden')).id;
	});

	it("marks a verified author's notice visible", async () => {
		const author = await resolveAuthor(repo, 'Raewyn T', true);
		const { notice, deduped } = await createNotice(repo, {
			boardId,
			type: 'offer',
			title: 'Free firewood, you collect',
			body: 'Had a tree come down.',
			authorId: author!.id
		});
		expect(deduped).toBe(false);
		expect(notice.status).toBe('visible');
	});

	it("holds an unverified author's spam-patterned notice for review and logs a TrustEvent", async () => {
		const author = await resolveAuthor(repo, 'wealth_freedom_88', false);
		const { notice } = await createNotice(repo, {
			boardId,
			type: 'offer',
			title: 'MAKE $$$ FROM HOME - GUARANTEED INCOME',
			body: 'DM me or whatsapp to start TODAY.',
			authorId: author!.id
		});

		expect(notice.status).toBe('pending_review');

		const events = await repo.trustEvents.listByUser(author!.id);
		expect(events.length).toBeGreaterThan(0);

		const updatedAuthor = await repo.users.findById(author!.id);
		expect(updatedAuthor!.trustScore).toBeLessThan(author!.trustScore);
	});

	it('dedupes an identical repost instead of creating a second notice', async () => {
		const author = await resolveAuthor(repo, 'Raewyn T', true);
		const first = await createNotice(repo, {
			boardId,
			type: 'offer',
			title: 'Free firewood, you collect',
			body: 'Had a tree come down.',
			authorId: author!.id
		});
		const second = await createNotice(repo, {
			boardId,
			type: 'offer',
			title: 'Free firewood, you collect',
			body: 'Had a tree come down.',
			authorId: author!.id
		});

		expect(second.deduped).toBe(true);
		expect(second.notice.id).toBe(first.notice.id);
		expect((await repo.notices.listByBoard(boardId)).length).toBe(1);
	});
});
