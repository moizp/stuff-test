import type { CardFont } from '$lib/shared/types';
import type { Repository } from '../repository/types';
import { resolvePublicBoard } from '../services/noticeboards';
import { resolveAuthor } from '../services/users';
import { createNotice } from '../services/notices';
import {
	normalizeLegacyFields,
	normalizeNoticeType,
	parseLegacyCreatedAt,
	type LegacyNoticeRecord
} from './normalize';

export interface ImportSummary {
	imported: number;
	deduped: number;
	flaggedCount: number;
}

/**
 * Demo-only cosmetic styling keyed by legacy id, applied on top of the
 * import — NOT derived from `seed-notices.json` (the legacy export has no
 * concept of card font/image). Exists purely so the board looks like a
 * populated noticeboard on first run, showing the font presets and the
 * image-URL card option without requiring a manual demo step.
 */
const DEMO_CARD_STYLING: Record<number, { cardFont?: CardFont; cardImageUrl?: string }> = {
	1001: { cardFont: 'marker', cardImageUrl: 'https://picsum.photos/seed/firewood/400/300' },
	1003: { cardFont: 'handwritten' },
	1004: { cardFont: 'typewriter' },
	1005: {
		cardImageUrl: 'https://img.particlenews.com/img/id/039m2k_0u8tV9D600?type=thumbnail_300x200'
	},
	1009: { cardFont: 'classic', cardImageUrl: 'https://picsum.photos/seed/garden-bee/400/300' }
};

/**
 * Imports legacy notices via the same createNotice() call a live request
 * (or a future third-party integration) would use — see DECISIONS.md
 * ("Legacy import"). This function only normalizes shapes; validation,
 * trust-scoring, and dedupe all happen inside createNotice, not here.
 */
export async function importLegacyNotices(
	repo: Repository,
	records: LegacyNoticeRecord[]
): Promise<ImportSummary> {
	let imported = 0;
	let deduped = 0;
	let flaggedCount = 0;

	for (const record of records) {
		const fields = normalizeLegacyFields(record);
		const { type, flag: typeFlag } = normalizeNoticeType(record.type);
		const { createdAt, flag: dateFlag } = parseLegacyCreatedAt(record.created);
		const board = await resolvePublicBoard(repo, fields.neighbourhoodRaw || 'Unknown');
		const author = await resolveAuthor(repo, record.author, record.verified);

		const importFlags = [...fields.flags];
		if (typeFlag) importFlags.push(typeFlag);
		if (dateFlag) importFlags.push(dateFlag);
		if (!author) importFlags.push('unknown_author');

		const demoStyling = DEMO_CARD_STYLING[record.id];

		const { deduped: wasDuped } = await createNotice(repo, {
			boardId: board.id,
			legacyId: record.id,
			type,
			title: fields.title,
			body: fields.body,
			authorId: author?.id ?? null,
			createdAt,
			importFlags,
			cardFont: demoStyling?.cardFont,
			cardImageUrl: demoStyling?.cardImageUrl
		});

		if (wasDuped) {
			deduped++;
		} else {
			imported++;
		}
		if (importFlags.length > 0) flaggedCount++;
	}

	return { imported, deduped, flaggedCount };
}
