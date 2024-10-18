<script>
	export let displayGif;
	export let gifUrl;
	export let toggleGif;
</script>

{#if displayGif}
	<img
		on:click={() => {
			toggleGif();
		}}
		class="gifFullScreen"
		src={gifUrl}
		alt="Gif"
	/>
{/if}

<style>
	.gifFullScreen {
		z-index: 1000;
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		cursor: pointer;
	}
</style>
