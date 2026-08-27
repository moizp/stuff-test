<script lang="ts">
	import type { Notice, NoticeType, Reply } from '$lib/shared/types';

	type NoticeWithReplies = Notice & {
		authorName: string | null;
		authorVerified: boolean;
		replies: (Reply & { authorName: string | null })[];
	};

	let { notice, onViewDetails }: { notice: NoticeWithReplies; onViewDetails: () => void } =
		$props();

	let fontClass = $derived(notice.cardFont ? `font-${notice.cardFont}` : 'font-classic');

	const ROTATION: Record<NoticeType, string> = {
		offer: '-rotate-1.5',
		request: 'rotate-1',
		event: '-rotate-0.5',
		alert: 'rotate-1.5',
		other: '-rotate-1'
	};

	const TAG_COLOR: Record<NoticeType, string> = {
		offer: 'bg-accent',
		request: 'bg-warn',
		event: 'bg-event',
		alert: 'bg-danger',
		other: 'bg-ink-soft'
	};

	let rotation = $derived(ROTATION[notice.type]);
	let tagColor = $derived(TAG_COLOR[notice.type]);

	function formatDate(iso: string) {
		return new Date(iso).toLocaleString(undefined, {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<article class={`pin-card ${rotation}`} data-notice-id={notice.id}>
	<span
		class={`mb-2 inline-block rounded-sm px-2 py-0.5 text-[0.7rem] font-bold tracking-wide text-paper uppercase ${tagColor}`}
	>
		{notice.type}
	</span>

	{#if notice.cardImageUrl}
		<img
			class="mb-2.5 aspect-4/3 w-full border border-black/15 bg-paper-shadow object-cover"
			src={notice.cardImageUrl}
			alt={notice.cardCaption || notice.title}
			loading="lazy"
		/>
	{/if}

	<p class={`mb-1.5 text-lg leading-tight ${fontClass}`}>{notice.cardCaption || notice.title}</p>

	<p class="text-xs text-ink-soft">
		{notice.authorName ?? 'Unknown resident'}
		{#if notice.authorName && !notice.authorVerified}
			<span class="ml-1 rounded-sm bg-black/8 px-1.5 py-0.5 text-[0.68rem]"
				>Unverified resident</span
			>
		{/if}
		{#if notice.status === 'pending_review'}
			<span class="ml-1 rounded-sm bg-[#f0d9a0] px-1.5 py-0.5 text-[0.68rem] text-[#6b4a0f]">
				Pending review — only you can see this
			</span>
		{/if}
		· {formatDate(notice.createdAt)}
	</p>

	<button
		class="mt-1 cursor-pointer border-none bg-transparent p-0 text-[0.85rem] font-bold text-accent"
		onclick={onViewDetails}
		type="button"
		aria-haspopup="dialog"
	>
		{`View details${notice.replies.length ? ` & ${notice.replies.length} repl${notice.replies.length === 1 ? 'y' : 'ies'}` : ''}`}
	</button>
</article>
