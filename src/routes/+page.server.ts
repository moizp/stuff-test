import { repo } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { viewerName } = await parent();

	const boards = await repo.noticeboards.list();
	const publicBoards = boards
		.filter((board) => board.visibility === 'public')
		.sort((a, b) => a.name.localeCompare(b.name));

	return { boards: publicBoards, viewerName };
};
