import type { NoticeType } from '$lib/shared/types';

/** Canonicalizes a legacy neighbourhood string so casing variants (e.g. "sandringham" vs "Sandringham") collapse to one Noticeboard. */
export function canonicalizeNeighbourhood(raw: string): string {
	const trimmed = raw.trim();
	return trimmed
		.toLowerCase()
		.split(' ')
		.filter(Boolean)
		.map((word) => word[0].toUpperCase() + word.slice(1))
		.join(' ');
}

const KNOWN_TYPES: NoticeType[] = ['offer', 'request', 'event', 'alert'];

/** Normalizes casing and buckets missing/unrecognized legacy `type` values into `other` rather than guessing from title text. */
export function normalizeNoticeType(raw: string | null | undefined): {
	type: NoticeType;
	flag: string | null;
} {
	if (!raw) return { type: 'other', flag: 'missing_type' };
	const lower = raw.trim().toLowerCase();
	if ((KNOWN_TYPES as string[]).includes(lower)) {
		return { type: lower as NoticeType, flag: null };
	}
	return { type: 'other', flag: 'unknown_type' };
}

/**
 * Parses the legacy `created` field, which arrives in five different
 * shapes (ISO8601 with time, date-only ISO, DD/MM/YYYY, Unix epoch seconds,
 * empty string). Unparseable/empty falls back to import time and is
 * flagged, rather than dropping the record.
 */
export function parseLegacyCreatedAt(raw: string | number | undefined | null): {
	createdAt: string;
	flag: string | null;
} {
	if (raw === undefined || raw === null || raw === '') {
		return { createdAt: new Date().toISOString(), flag: 'missing_date' };
	}

	if (typeof raw === 'number') {
		const date = new Date(raw * 1000); // legacy epoch values are in seconds
		if (Number.isNaN(date.getTime())) {
			return { createdAt: new Date().toISOString(), flag: 'unparseable_date' };
		}
		return { createdAt: date.toISOString(), flag: null };
	}

	const dmy = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
	if (dmy) {
		const [, day, month, year] = dmy;
		const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
		return { createdAt: date.toISOString(), flag: null };
	}

	const parsed = Date.parse(raw);
	if (!Number.isNaN(parsed)) {
		return { createdAt: new Date(parsed).toISOString(), flag: null };
	}

	return { createdAt: new Date().toISOString(), flag: 'unparseable_date' };
}

export interface LegacyNoticeRecord {
	id: number;
	type?: string | null;
	title?: string;
	subject?: string;
	body?: string;
	text?: string;
	author?: string | null;
	neighbourhood?: string;
	suburb?: string;
	verified: boolean;
	created?: string | number;
}

/** Reconciles field drift (`subject`/`text` → `title`/`body`, `suburb` → `neighbourhood`) seen in the legacy export. */
export function normalizeLegacyFields(record: LegacyNoticeRecord): {
	title: string;
	body: string;
	neighbourhoodRaw: string;
	flags: string[];
} {
	const flags: string[] = [];

	const title = record.title ?? record.subject ?? '';
	if (!record.title && record.subject) flags.push('field_drift_title');

	const body = record.body ?? record.text ?? '';
	if (!record.body && record.text) flags.push('field_drift_body');

	const neighbourhoodRaw = record.neighbourhood ?? record.suburb ?? '';
	if (!record.neighbourhood && record.suburb) flags.push('field_drift_neighbourhood');

	return { title, body, neighbourhoodRaw, flags };
}
