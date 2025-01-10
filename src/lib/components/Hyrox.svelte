<script>
  const targetDate = new Date('2025-02-23');
  const today = new Date();
  const diffDays = Math.floor((targetDate - today) / (1000 * 60 * 60 * 24));
  const isDatePassed = diffDays < 0;
</script>

{#if !isDatePassed}
<div class="hyrox-info">
	<p>🏃🏃🏃🏃🏃</p>
	<p class="date">dans {diffDays} jours </p>
</div>
{/if}

<style lang="scss">
	.hyrox-info {
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
