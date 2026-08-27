<script lang="ts">
	let { defaultAuthor = '' }: { defaultAuthor?: string } = $props();
</script>

<form class="paper-form" method="POST" action="?/createNotice">
	<input type="hidden" name="viewer" value={defaultAuthor} />
	<label>
		Type
		<select name="type">
			<option value="offer">Offer</option>
			<option value="request">Request</option>
			<option value="event">Event</option>
			<option value="alert">Alert</option>
			<option value="other">Other</option>
		</select>
	</label>
	<label>
		Title
		<input type="text" name="title" required />
	</label>
	<label>
		Body
		<textarea name="body" rows="3" required></textarea>
	</label>
	<label>
		Your name
		<input type="text" name="author" value={defaultAuthor} placeholder="Optional" />
	</label>
	<label>
		Card image URL
		<input type="url" name="cardImageUrl" placeholder="Optional — pasted image link" />
	</label>
	<label>
		Card caption
		<input type="text" name="cardCaption" placeholder="Optional — falls back to title" />
	</label>
	<label>
		Card font
		<select name="cardFont">
			<option value="">Default</option>
			<option value="marker">Marker</option>
			<option value="typewriter">Typewriter</option>
			<option value="handwritten">Handwritten</option>
			<option value="classic">Classic</option>
		</select>
	</label>
	<button type="submit">Pin to board</button>
</form>
