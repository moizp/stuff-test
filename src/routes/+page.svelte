<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Neighbourhood Noticeboard</title>
</svelte:head>

<header class="mt-6 mb-8 text-center text-paper">
	<h1 class="mb-1 font-marker text-4xl tracking-wide text-shadow-[0_2px_0_rgb(0_0_0/25%)]">
		Neighbourhood Noticeboard
	</h1>
	<p class="text-paper-shadow">
		What's happening in your streets — pick a neighbourhood to see what's pinned up.
	</p>
</header>

{#if data.boards.length === 0}
	<p class="p-8 text-center text-paper-shadow">No noticeboards yet.</p>
{:else}
	<ul class="mb-6 flex flex-wrap justify-center gap-4">
		{#each data.boards as board, i (board.id)}
			<li>
				<a
					class={`inline-block -rotate-1 rounded bg-paper px-6 py-4 font-marker text-lg text-ink shadow-[0_6px_14px_rgb(0_0_0/35%)] ${i % 2 === 1 ? 'rotate-[1.2deg]' : ''}`}
					href={`/board/${encodeURIComponent(board.name)}`}
					tabindex="0"
				>
					{board.name}
				</a>
			</li>
		{/each}
	</ul>
{/if}
