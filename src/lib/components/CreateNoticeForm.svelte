<script lang="ts">
	let { viewerName = '' }: { viewerName?: string } = $props();
</script>

<form class="paper-form" method="POST" action="?/createNotice">
	<input type="hidden" name="author" value={viewerName} />
	<input type="hidden" name="viewer" value={viewerName} />
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
		Card image URL
		<input type="url" name="cardImageUrl" placeholder="Optional — pasted image link" />
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
