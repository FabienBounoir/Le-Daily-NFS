<script>
	import { onMount } from 'svelte';

	export let dateModule;
	let date = '';
	let text = '';

	onMount(() => {
		if (!dateModule.date) return;

		if (new Date(dateModule.date).getTime() < new Date().getTime()) {
			text = dateModule.afterText;
			date = `${Math.floor((new Date() - new Date(dateModule.date)) / (1000 * 60 * 60 * 24))} jour(s)`;
		} else {
			text = dateModule.beforeText;
			date = `${Math.floor((new Date(dateModule.date) - new Date()) / (1000 * 60 * 60 * 24))} jour(s)`;
		}
	});
</script>

{#if date != ''}
	<div class="date-container">
		<p>{text}</p>
		<p class="date">{date}</p>
	</div>
{/if}

<style lang="scss">
	.date-container {
		background-color: var(--primary-200);
		padding: 1em;
		border-radius: 0.5em;
		display: flex;
		flex-direction: column;
		gap: 0.5em;
		width: max-content;
	}

	.date {
		color: var(--primary-600);
		font-size: 1.5em;
		border-radius: 0.3em;
		padding: 0.2em;
		border: 3px solid var(--primary-600);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	@keyframes zoom {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.1);
		}
		100% {
			transform: scale(1);
		}
	}
</style>
