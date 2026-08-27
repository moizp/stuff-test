<script lang="ts">
	import NoticeCard from '$lib/components/NoticeCard.svelte';
	import NoticeDetailDialog from '$lib/components/NoticeDetailDialog.svelte';
	import CreateNoticeForm from '$lib/components/CreateNoticeForm.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	// Defaults open if a create-notice submission just failed validation, so
	// the error and the form aren't hidden back behind the toggle button.
	let showCreateForm = $state(Boolean(form?.error));

	// Single id, not per-card state — only one notice's full detail can be
	// open at a time, in the shared dialog below.
	let openNoticeId = $state<string | null>(null);
	let openNotice = $derived(data.notices.find((n) => n.id === openNoticeId) ?? null);
</script>

<svelte:head>
	<title>{data.board.name} — Neighbourhood Noticeboard</title>
</svelte:head>

<a class="mb-4 inline-block text-sm text-paper" href="/" tabindex="0">&larr; All neighbourhoods</a>

<header class="mb-8 text-center text-paper">
	<h1 class="mb-1 font-marker text-4xl tracking-wide text-shadow-[0_2px_0_rgb(0_0_0/25%)]">
		{data.board.name}
	</h1>
	<p class="text-paper-shadow">Newest notices first.</p>
</header>

{#if !showCreateForm}
	<button
		class="mb-6 rounded bg-accent px-5 py-2.5 text-[0.95rem] font-bold text-paper hover:brightness-110"
		type="button"
		onclick={() => (showCreateForm = true)}
		aria-expanded={showCreateForm}
		aria-controls="create-notice-form"
	>
		+ Post new notice
	</button>
{:else}
	<div id="create-notice-form">
		<CreateNoticeForm defaultAuthor={data.viewerName} />
	</div>
{/if}

{#if form?.error}
	<p class="p-8 text-center text-paper-shadow">{form.error}</p>
{/if}

{#if data.notices.length === 0}
	<p class="p-8 text-center text-paper-shadow">
		This board's looking a little bare — be the first to pin something up!
	</p>
{:else}
	<div class="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] items-start gap-7">
		{#each data.notices as notice (notice.id)}
			<NoticeCard {notice} onViewDetails={() => (openNoticeId = notice.id)} />
		{/each}
	</div>
{/if}

<NoticeDetailDialog
	notice={openNotice}
	viewerName={data.viewerName}
	onClose={() => (openNoticeId = null)}
/>
