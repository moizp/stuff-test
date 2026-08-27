import type { LayoutServerLoad } from './$types';

/**
 * Viewer identity lives in the browser's localStorage, not a cookie — see
 * docs/DECISIONS.md ("Current-user identity"). The server can't read
 * localStorage, so the client syncs it into this `?viewer=` query param
 * (see ViewerBadge.svelte) whenever it changes, keeping SSR-side
 * pending_review filtering correct without a cookie round-trip.
 */
export const load: LayoutServerLoad = async ({ url }) => {
	return { viewerName: url.searchParams.get('viewer')?.trim() ?? '' };
};
