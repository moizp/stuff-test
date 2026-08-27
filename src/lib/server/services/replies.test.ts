import { beforeEach, describe, expect, it } from 'vitest';
import { createInMemoryRepository } from '../repository/in-memory';
import type { Repository } from '../repository/types';
import { resolvePublicBoard } from './noticeboards';
import { resolveAuthor } from './users';
import { createNotice } from './notices';
import { createReply } from './replies';

describe('createReply', () => {
	let repo: Repository;
	let noticeId: string;

	beforeEach(async () => {
		repo = createInMemoryRepository();
		const board = await resolvePublicBoard(repo, 'Mt Eden');
		const author = await resolveAuthor(repo, 'Priya', true);
		const { notice } = await createNotice(repo, {
			boardId: board.id,
			type: 'other',
			title: 'lost cat - tabby, answers to Miso',
			body: 'Missing since Tuesday near the shops.',
			authorId: author!.id
		});
		noticeId = notice.id;
	});

	it('creates a visible reply from a verified author', async () => {
		const author = await resolveAuthor(repo, 'Tom H', true);
		const reply = await createReply(repo, {
			noticeId,
			authorId: author!.id,
			body: 'Saw a tabby near the reserve this morning.'
		});
		expect(reply.status).toBe('visible');
		expect(await repo.replies.listByNotice(noticeId)).toHaveLength(1);
	});

	it('hides an abusive reply and logs a TrustEvent', async () => {
		const author = await resolveAuthor(repo, 'anon', false);
		const reply = await createReply(repo, {
			noticeId,
			authorId: author!.id,
			body: 'watch your back, i hope you all rot'
		});
		expect(reply.status).toBe('hidden');
		expect((await repo.trustEvents.listByUser(author!.id)).length).toBeGreaterThan(0);
	});
});
