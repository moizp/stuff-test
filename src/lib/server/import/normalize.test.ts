import { describe, expect, it } from 'vitest';
import { canonicalizeNeighbourhood } from './normalize';

describe('canonicalizeNeighbourhood', () => {
	it('title-cases a lowercase name', () => {
		expect(canonicalizeNeighbourhood('sandringham')).toBe('Sandringham');
	});

	it('collapses casing variants of the same neighbourhood to one canonical form', () => {
		expect(canonicalizeNeighbourhood('sandringham')).toBe(canonicalizeNeighbourhood('Sandringham'));
	});

	it('trims surrounding whitespace', () => {
		expect(canonicalizeNeighbourhood('  Mt Eden  ')).toBe('Mt Eden');
	});

	it('title-cases each word of a multi-word name', () => {
		expect(canonicalizeNeighbourhood('grey lynn')).toBe('Grey Lynn');
	});
});
