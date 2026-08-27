<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import ViewerBadge from '$lib/components/ViewerBadge.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	// Pings the health endpoint once per session (not on every client-side
	// navigation — $effect only re-runs on reactive changes, and this reads
	// none) to start waking a sleeping Render free-tier instance early. A
	// no-op on a warm instance.
	$effect(() => {
		fetch('/health').catch(() => {});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<a class="skip-link" href="#main-content" tabindex="0">Skip to content</a>

<ViewerBadge viewerName={data.viewerName} />

<div class="mx-auto max-w-4xl p-4">
	<main id="main-content" class="page-frame p-8">
		{@render children()}
	</main>
</div>
