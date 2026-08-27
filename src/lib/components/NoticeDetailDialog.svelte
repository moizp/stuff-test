<script lang="ts">
	import type { Notice, Reply } from '$lib/shared/types';

	type NoticeWithReplies = Notice & {
		authorName: string | null;
		authorVerified: boolean;
		replies: (Reply & { authorName: string | null })[];
	};

	let {
		notice,
		viewerName,
		onClose
	}: {
		notice: NoticeWithReplies | null;
		viewerName: string;
		onClose: () => void;
	} = $props();

	let dialogEl: HTMLDialogElement | null = $state(null);

	// Single dialog shared by every card, so at most one full detail view is
	// ever open — opening a different notice swaps this one's content rather
	// than stacking another dialog.
	$effect(() => {
		if (notice) {
			if (dialogEl && !dialogEl.open) dialogEl.showModal();
		} else if (dialogEl?.open) {
			dialogEl.close();
		}
	});

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === dialogEl) onClose();
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleString(undefined, {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<dialog
	bind:this={dialogEl}
	onclose={onClose}
	onclick={handleBackdropClick}
	class="m-auto max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-sm border-none bg-paper p-6 shadow-[0_20px_50px_rgb(0_0_0/50%)] backdrop:bg-black/60"
>
	{#if notice}
		<button
			class="float-right cursor-pointer border-none bg-transparent text-xl leading-none text-ink-soft hover:text-ink"
			type="button"
			onclick={onClose}
			aria-label="Close"
		>
			&times;
		</button>

		{#if notice.cardImageUrl}
			<img
				class="mb-3 aspect-4/3 w-full border border-black/15 bg-paper-shadow object-cover"
				src={notice.cardImageUrl}
				alt={notice.cardCaption || notice.title}
			/>
		{/if}

		<h2 class="mb-1 text-xl font-bold">{notice.title}</h2>
		<p class="mb-2 text-xs text-ink-soft">
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
		<p class="mb-4 leading-snug whitespace-pre-wrap">{notice.body}</p>

		{#if notice.replies.length > 0}
			<h3 class="mb-2 text-sm font-bold">Replies</h3>
			{#each notice.replies as reply (reply.id)}
				<div class="my-2 rounded-r-sm border-l-3 border-paper-shadow bg-black/4 px-2.5 py-1.5">
					<p class="mb-0.5 whitespace-pre-wrap">{reply.body}</p>
					<p class="text-xs text-ink-soft">
						{reply.authorName ?? 'Unknown resident'}
						{#if reply.status === 'pending_review'}
							<span
								class="ml-1 rounded-sm bg-[#f0d9a0] px-1.5 py-0.5 text-[0.68rem] text-[#6b4a0f]"
							>
								Pending review
							</span>
						{/if}
						· {formatDate(reply.createdAt)}
					</p>
				</div>
			{/each}
		{/if}

		<form class="mt-3 paper-form" method="POST" action="?/createReply">
			<input type="hidden" name="noticeId" value={notice.id} />
			<input type="hidden" name="author" value={viewerName} />
			<input type="hidden" name="viewer" value={viewerName} />
			<label>
				Reply
				<textarea name="body" rows="2" required></textarea>
			</label>
			<button type="submit">Reply</button>
		</form>
	{/if}
</dialog>

<style>
	/*
	 * A native <dialog> isn't controlled by Svelte's {#if} DOM lifecycle
	 * (it's shown/hidden imperatively via showModal()/close()), so Svelte's
	 * transition: directives don't apply here. @starting-style + allow-discrete
	 * is the standard way to animate a real <dialog>'s open AND close — the
	 * browser defers the discrete display/overlay swap until the transition
	 * finishes, in both directions, with no JS timing needed.
	 */
	dialog {
		opacity: 0;
		scale: 0.5;
		transition:
			opacity 0.2s ease,
			scale 0.2s ease,
			overlay 0.2s ease allow-discrete,
			display 0.2s ease allow-discrete;
	}

	dialog[open] {
		opacity: 1;
		scale: 1;
	}

	@starting-style {
		dialog[open] {
			opacity: 0;
			scale: 0.5;
		}
	}

	dialog::backdrop {
		opacity: 0;
		transition:
			opacity 0.2s ease,
			overlay 0.2s ease allow-discrete,
			display 0.2s ease allow-discrete;
	}

	dialog[open]::backdrop {
		opacity: 1;
	}

	@starting-style {
		dialog[open]::backdrop {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		dialog,
		dialog::backdrop {
			transition-duration: 0.01ms;
		}
	}
</style>
