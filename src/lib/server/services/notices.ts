import type { CardFont, Notice, NoticeType } from '$lib/shared/types';
import type { Repository } from '../repository/types';
import { evaluateTrustAndSafety, TRUST_DELTAS } from './trust-safety';

export interface CreateNoticeInput {
	boardId: string;
	legacyId?: number | null;
	type: NoticeType;
	title: string;
	body: string;
	authorId: string | null;
	createdAt?: string;
	importFlags?: string[];
	cardImageUrl?: string | null;
	cardFont?: CardFont | null;
}

export interface CreateNoticeResult {
	notice: Notice;
	deduped: boolean;
}

/**
 * The single entry point for creating a notice — called by live requests
 * and by the legacy import adapter alike (and would back a future
 * third-party ingestion API). Applies dedupe, trust & safety evaluation,
 * and trust score adjustment uniformly regardless of the caller.
 */
export async function createNotice(
	repo: Repository,
	input: CreateNoticeInput
): Promise<CreateNoticeResult> {
	const duplicate = await repo.notices.findDuplicate({
		boardId: input.boardId,
		title: input.title,
		body: input.body,
		authorId: input.authorId
	});
	if (duplicate) {
		return { notice: duplicate, deduped: true };
	}

	const author = input.authorId ? await repo.users.findById(input.authorId) : null;
	const { status, flags } = evaluateTrustAndSafety({
		title: input.title,
		body: input.body,
		authorVerified: author?.verified ?? false
	});

	const notice = await repo.notices.create({
		boardId: input.boardId,
		legacyId: input.legacyId ?? null,
		type: input.type,
		title: input.title,
		body: input.body,
		authorId: input.authorId,
		status,
		importFlags: [...(input.importFlags ?? []), ...flags],
		createdAt: input.createdAt,
		cardImageUrl: input.cardImageUrl ?? null,
		cardFont: input.cardFont ?? null
	});

	if (author && flags.length > 0) {
		let score = author.trustScore;
		for (const flag of flags) {
			const delta = TRUST_DELTAS[flag] ?? -5;
			score += delta;
			await repo.trustEvents.create({
				userId: author.id,
				delta,
				reason: flag,
				noticeId: notice.id
			});
		}
		await repo.users.update(author.id, { trustScore: score });
	}

	return { notice, deduped: false };
}
