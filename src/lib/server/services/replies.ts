import type { Reply } from '$lib/shared/types';
import type { Repository } from '../repository/types';
import { evaluateTrustAndSafety, TRUST_DELTAS } from './trust-safety';

export interface CreateReplyInput {
	noticeId: string;
	authorId: string | null;
	body: string;
	createdAt?: string;
}

/** Same trust & safety pipeline as createNotice (see notices.ts), applied to reply bodies. */
export async function createReply(repo: Repository, input: CreateReplyInput): Promise<Reply> {
	const author = input.authorId ? await repo.users.findById(input.authorId) : null;
	const { status, flags } = evaluateTrustAndSafety({
		title: '',
		body: input.body,
		authorVerified: author?.verified ?? false
	});

	const reply = await repo.replies.create({
		noticeId: input.noticeId,
		authorId: input.authorId,
		body: input.body,
		createdAt: input.createdAt,
		status
	});

	if (author && flags.length > 0) {
		let score = author.trustScore;
		for (const flag of flags) {
			const delta = TRUST_DELTAS[flag] ?? -5;
			score += delta;
			await repo.trustEvents.create({ userId: author.id, delta, reason: flag, noticeId: null });
		}
		await repo.users.update(author.id, { trustScore: score });
	}

	return reply;
}
