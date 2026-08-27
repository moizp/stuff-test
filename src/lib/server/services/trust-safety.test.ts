import { describe, expect, it } from 'vitest';
import { evaluateTrustAndSafety } from './trust-safety';

describe('evaluateTrustAndSafety', () => {
	it("shows a verified author's ordinary notice", () => {
		const result = evaluateTrustAndSafety({
			title: 'Street BBQ this Saturday',
			body: 'Bring a plate, 12pm at the reserve.',
			authorVerified: true
		});
		expect(result).toEqual({ status: 'visible', flags: [] });
	});

	it("shows an unverified author's ordinary notice (labelled in the UI, not hidden)", () => {
		const result = evaluateTrustAndSafety({
			title: 'Recommendations for a plumber',
			body: 'Reliable, reasonably priced plumber near Sandringham?',
			authorVerified: false
		});
		expect(result.status).toBe('visible');
	});

	it("holds an unverified author's spam-patterned notice for review", () => {
		// seed-notices.json id 1006 / 1013
		const result = evaluateTrustAndSafety({
			title: 'MAKE $$$ FROM HOME - GUARANTEED INCOME',
			body: 'Local mums earning 4k/week!! DM me or whatsapp +00 000 000 to start TODAY. Limited spots!!!',
			authorVerified: false
		});
		expect(result.status).toBe('pending_review');
		expect(result.flags).toContain('spam_pattern');
	});

	it('hides abusive/threatening content regardless of verified status', () => {
		// seed-notices.json id 1010
		const result = evaluateTrustAndSafety({
			title: 'you people are pathetic',
			body: 'this whole neighbourhood is full of [redacted] and i hope you all rot. watch your backs.',
			authorVerified: true
		});
		expect(result.status).toBe('hidden');
		expect(result.flags).toContain('abusive_language');
	});
});
