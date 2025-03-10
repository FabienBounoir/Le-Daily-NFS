<script>
	import { user } from '$lib/stores/user';
</script>

{#if new Date().getDay() === 2}
	<div class="teammood">
		<h2>Remplir le team Mood</h2>
	</div>
{/if}

<style lang="scss">
	.teammood {
		background-color: var(--primary-200);
		padding: 1em;
		border-radius: 0.5em;
		display: flex;
		flex-direction: column;
		gap: 0.5em;
		width: max-content;
	}

	.link {
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
