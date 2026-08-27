import { describe, expect, it } from 'vitest';
import { createInMemoryRepository } from '../repository/in-memory';
import { importLegacyNotices } from './seed';
import type { LegacyNoticeRecord } from './normalize';
import seedData from '../../../../seed-notices.json';

describe('importLegacyNotices (against the real seed-notices.json)', () => {
	it('imports all records, deduping the exact repost and preserving the rest', async () => {
		const repo = createInMemoryRepository();
		const summary = await importLegacyNotices(repo, seedData as LegacyNoticeRecord[]);

		expect(summary.imported + summary.deduped).toBe(seedData.length);
		expect(summary.deduped).toBe(1); // ids 1001/1008: identical title+body+author+board
	});

	it('holds the spam-patterned unverified posts for review', async () => {
		const repo = createInMemoryRepository();
		await importLegacyNotices(repo, seedData as LegacyNoticeRecord[]);

		const boards = await repo.noticeboards.list();
		const allNotices = (
			await Promise.all(boards.map((b) => repo.notices.listByBoard(b.id)))
		).flat();

		const spamNotices = allNotices.filter((n) => n.legacyId === 1006 || n.legacyId === 1013);
		expect(spamNotices.every((n) => n.status === 'pending_review')).toBe(true);
	});

	it('hides the abusive/threatening legacy post', async () => {
		const repo = createInMemoryRepository();
		await importLegacyNotices(repo, seedData as LegacyNoticeRecord[]);

		const boards = await repo.noticeboards.list();
		const allNotices = (
			await Promise.all(boards.map((b) => repo.notices.listByBoard(b.id)))
		).flat();

		const abusiveNotice = allNotices.find((n) => n.legacyId === 1010);
		expect(abusiveNotice?.status).toBe('hidden');
	});

	it('collapses neighbourhood casing variants into one board', async () => {
		const repo = createInMemoryRepository();
		await importLegacyNotices(repo, seedData as LegacyNoticeRecord[]);

		const boards = await repo.noticeboards.list();
		const sandringhamBoards = boards.filter((b) => b.name === 'Sandringham');
		expect(sandringhamBoards).toHaveLength(1);
	});
});
