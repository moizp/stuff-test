<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	const STORAGE_KEY = 'viewerName';

	let { viewerName }: { viewerName: string } = $props();

	let editing = $state(false);
	let draft = $state(viewerName);
	let inputEl: HTMLInputElement | null = $state(null);

	function navigateWithViewer(name: string) {
		const url = new URL(page.url);
		if (name) {
			url.searchParams.set('viewer', name);
		} else {
			url.searchParams.delete('viewer');
		}
		goto(url, { invalidateAll: true, replaceState: true, keepFocus: true, noScroll: true });
	}

	// On mount (and whenever the server-derived viewerName changes), reconcile
	// against localStorage — the actual source of truth for this device.
	$effect(() => {
		if (!browser) return;
		const stored = localStorage.getItem(STORAGE_KEY) ?? '';
		if (stored !== viewerName) {
			navigateWithViewer(stored);
		}
	});

	// Swapping the button for the input doesn't move keyboard focus on its
	// own — without this, nothing captures keystrokes until the user clicks
	// directly into the field.
	$effect(() => {
		if (editing) inputEl?.focus();
	});

	function save() {
		const name = draft.trim();
		if (browser) {
			if (name) localStorage.setItem(STORAGE_KEY, name);
			else localStorage.removeItem(STORAGE_KEY);
		}
		editing = false;
		navigateWithViewer(name);
	}
</script>

<div class="fixed top-4 right-4 z-10 text-sm">
	{#if editing}
		<div class="flex items-center gap-2 rounded bg-board-dark px-3 py-1.5">
			<label for="viewer-name-input" class="font-medium text-paper">Your name</label>
			<input
				id="viewer-name-input"
				bind:this={inputEl}
				class="rounded border border-paper-shadow bg-paper px-2 py-1 text-ink placeholder:text-ink-soft"
				type="text"
				bind:value={draft}
				placeholder="e.g. Alex"
				onblur={save}
				onkeydown={(e) => e.key === 'Enter' && save()}
			/>
		</div>
	{:else}
		<button
			class="flex cursor-pointer items-center gap-1.5 rounded border border-paper-shadow bg-board-dark px-3 py-1.5 font-medium text-paper hover:brightness-125"
			type="button"
			onclick={() => {
				draft = viewerName;
				editing = true;
			}}
		>
			<span aria-hidden="true">✎</span>
			{viewerName ? `Viewing as ${viewerName}` : 'Set your name'}
		</button>
	{/if}
</div>
