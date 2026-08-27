import { error, fail, redirect } from '@sveltejs/kit';
import { repo } from '$lib/server/db';
import { createNotice } from '$lib/server/services/notices';
import { createReply } from '$lib/server/services/replies';
import { resolveAuthor } from '$lib/server/services/users';
import { canonicalizeNeighbourhood } from '$lib/server/import/normalize';
import type { CardFont, NoticeType } from '$lib/shared/types';
import type { PageServerLoad } from './$types';

/**
 * A named-viewer, not a login: matches the trust & safety UI rule (see
 * DECISIONS.md) that a `pending_review` notice/reply stays visible to its
 * own author. Resolved by exact trimmed-name match, same as import author
 * resolution — no real auth in scope for this exercise.
 */
async function resolveViewerId(viewerName: string) {
	if (!viewerName) return null;
	const user = await repo.users.findByName(viewerName);
	return user?.id ?? null;
}

function visibleTo<T extends { status: string; authorId: string | null }>(
	items: T[],
	viewerUserId: string | null
): T[] {
	return items.filter((item) => {
		if (item.status === 'visible') return true;
		if (item.status === 'pending_review')
			return item.authorId !== null && item.authorId === viewerUserId;
		return false; // hidden — excluded entirely
	});
}

export const load: PageServerLoad = async ({ params, parent }) => {
	const { viewerName } = await parent();

	const name = canonicalizeNeighbourhood(decodeURIComponent(params.name));
	const board = await repo.noticeboards.findPublicByName(name);
	if (!board) error(404, `No noticeboard called "${name}"`);

	const viewerUserId = await resolveViewerId(viewerName);

	const allNotices = await repo.notices.listByBoard(board.id);
	const notices = visibleTo(allNotices, viewerUserId);

	const users = await repo.users.list();
	const userById = new Map(users.map((u) => [u.id, u]));

	const noticesWithReplies = await Promise.all(
		notices.map(async (notice) => {
			const allReplies = await repo.replies.listByNotice(notice.id);
			const replies = visibleTo(allReplies, viewerUserId).map((reply) => ({
				...reply,
				authorName: reply.authorId ? (userById.get(reply.authorId)?.name ?? null) : null
			}));
			const author = notice.authorId ? userById.get(notice.authorId) : null;
			return {
				...notice,
				authorName: author?.name ?? null,
				authorVerified: author?.verified ?? false,
				isOwn: notice.authorId !== null && notice.authorId === viewerUserId,
				replies
			};
		})
	);

	return {
		board,
		notices: noticesWithReplies,
		viewerName
	};
};

export const actions = {
	createNotice: async ({ request, params }) => {
		const name = canonicalizeNeighbourhood(decodeURIComponent(params.name));
		const board = await repo.noticeboards.findPublicByName(name);
		if (!board) error(404, `No noticeboard called "${name}"`);

		const form = await request.formData();
		const type = String(form.get('type') ?? 'other') as NoticeType;
		const title = String(form.get('title') ?? '').trim();
		const body = String(form.get('body') ?? '').trim();
		const authorName = String(form.get('author') ?? '').trim();
		const cardImageUrl = String(form.get('cardImageUrl') ?? '').trim();
		const cardFont = String(form.get('cardFont') ?? '').trim() as CardFont | '';

		if (!title || !body) {
			return fail(400, { error: 'Title and body are required.', title, body, authorName });
		}

		// No auth in this exercise: a post from the UI can't assert
		// verification, so we look up an existing user's own verified status
		// rather than overwriting it — a fresh name defaults to unverified.
		const existing = authorName ? await repo.users.findByName(authorName) : null;
		const author = authorName
			? await resolveAuthor(repo, authorName, existing?.verified ?? false)
			: null;

		await createNotice(repo, {
			boardId: board.id,
			type,
			title,
			body,
			authorId: author?.id ?? null,
			cardImageUrl: cardImageUrl || null,
			cardFont: cardFont || null
		});

		redirect(303, redirectTarget(name, form));
	},

	createReply: async ({ request, params }) => {
		const name = canonicalizeNeighbourhood(decodeURIComponent(params.name));
		const form = await request.formData();
		const noticeId = String(form.get('noticeId') ?? '');
		const body = String(form.get('body') ?? '').trim();
		const authorName = String(form.get('author') ?? '').trim();

		if (!noticeId || !body) {
			return fail(400, { error: 'Reply body is required.' });
		}

		const existing = authorName ? await repo.users.findByName(authorName) : null;
		const author = authorName
			? await resolveAuthor(repo, authorName, existing?.verified ?? false)
			: null;

		await createReply(repo, {
			noticeId,
			authorId: author?.id ?? null,
			body
		});

		redirect(303, redirectTarget(name, form));
	}
};

/**
 * A `?/action` form target replaces the current URL's whole query string
 * (per relative-URL resolution), so `?viewer=` isn't there for the server
 * action to read even though it was on the page — a hidden `viewer` field
 * (see CreateNoticeForm.svelte, NoticeCard.svelte) carries it through
 * instead, so the post-submit redirect keeps the viewer's identity.
 */
function redirectTarget(boardName: string, form: FormData) {
	const viewer = String(form.get('viewer') ?? '').trim();
	const query = viewer ? `?viewer=${encodeURIComponent(viewer)}` : '';
	return `/board/${encodeURIComponent(boardName)}${query}`;
}
