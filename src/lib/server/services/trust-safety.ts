import type { NoticeStatus } from '$lib/shared/types';

/**
 * Deliberately simple pattern-matching, not real moderation/NLP — enough to
 * separate the seed data's spam/abuse entries from ordinary unverified
 * posts. See DECISIONS.md ("Trust & safety") for the full rule table and
 * what was rejected (down-ranking, rate-limiting).
 */
const SPAM_PATTERNS: RegExp[] = [
	/guaranteed income/i,
	/\$\$\$/,
	/\bdm me\b/i,
	/\bwhatsapp\b/i,
	/work from home/i,
	/limited spots/i,
	/\d+k\/week/i
];

const ABUSE_PATTERNS: RegExp[] = [
	/watch your back/i,
	/i hope (you( all)?|u) rot/i,
	/\bthreat(en|ening)?\b/i,
	/i('ll| will) find you/i
];

function isShoutingTitle(title: string): boolean {
	const letters = title.replace(/[^a-zA-Z]/g, '');
	if (letters.length < 8) return false;
	const upper = letters.replace(/[^A-Z]/g, '');
	return upper.length / letters.length > 0.6;
}

export interface ContentSignals {
	spam: boolean;
	abusive: boolean;
	flags: string[];
}

export function detectContentSignals(title: string, body: string): ContentSignals {
	const text = `${title}\n${body}`;
	const flags: string[] = [];

	const spamMatch = SPAM_PATTERNS.some((pattern) => pattern.test(text));
	const shouting = isShoutingTitle(title);
	const abusive = ABUSE_PATTERNS.some((pattern) => pattern.test(text));

	if (spamMatch) flags.push('spam_pattern');
	if (shouting) flags.push('shouting_title');
	if (abusive) flags.push('abusive_language');

	return { spam: spamMatch || shouting, abusive, flags };
}

/** Trust score deltas for TrustEvent, per flag. See DECISIONS.md. */
export const TRUST_DELTAS: Record<string, number> = {
	spam_pattern: -10,
	shouting_title: -5,
	abusive_language: -30
};

export interface TrustSafetyResult {
	status: NoticeStatus;
	flags: string[];
}

/**
 * Decision table (verified × content signals → status):
 *   abusive           → hidden (regardless of verified)
 *   verified, clean    → visible
 *   unverified, spam   → pending_review
 *   unverified, clean  → visible (UI labels it "Unverified resident")
 */
export function evaluateTrustAndSafety(input: {
	title: string;
	body: string;
	authorVerified: boolean;
}): TrustSafetyResult {
	const signals = detectContentSignals(input.title, input.body);

	if (signals.abusive) {
		return { status: 'hidden', flags: signals.flags };
	}
	if (input.authorVerified) {
		return { status: 'visible', flags: [] };
	}
	if (signals.spam) {
		return { status: 'pending_review', flags: signals.flags };
	}
	return { status: 'visible', flags: [] };
}
